/**
 * ai-service.js — DocuShift AI
 * Motore AI dedicato esclusivamente a Google Gemini 3.8 Flash.
 * Gestione credenziali in LocalStorage, test di connessione, Magic Link,
 * auto-detect lingua e traduzione batch strutturata in formato JSON.
 */

const AIService = (() => {
  const CANDIDATE_MODELS = [
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash' },
    { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' }
  ];
  let currentWorkingModelIndex = 0;
  let activeAbortController = null;
  let pendingRetryTimer = null;
  let retryResolve = null;
  let isCancellationRequested = false;
  let isModelSwitchRequested = false;
  const MAX_RPM = 15;

  // Cronologia chiamate per calcolo rate limit scorrevole
  const requestHistory = [];

  // Inizializzazione automatica Magic Link (#key=... o #gemini_key=...)
  function initAutoAuth() {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const params = new URLSearchParams(hash.substring(1));
      const gKey = params.get('gemini_key') || params.get('key');
      if (gKey && gKey.trim().length > 5) {
        localStorage.setItem('docushift_gemini_key', gKey.trim());
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
        }
        return { success: true, message: 'API Key Gemini 3.8 Flash salvata con successo!' };
      }
    }

    if (window.__LOCAL_CONFIG__ && window.__LOCAL_CONFIG__.geminiApiKey) {
      if (!localStorage.getItem('docushift_gemini_key')) {
        localStorage.setItem('docushift_gemini_key', window.__LOCAL_CONFIG__.geminiApiKey);
      }
    }

    return { success: false };
  }

  // Lettura automatica dagli appunti (Smart Clipboard)
  async function detectKeyFromClipboard() {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      throw new Error('Accesso agli appunti non supportato dal browser.');
    }
    const text = (await navigator.clipboard.readText()).trim();
    if (!text) {
      throw new Error('Gli appunti sono vuoti.');
    }

    localStorage.setItem('docushift_gemini_key', text);
    return { key: text, label: 'Gemini 3.8 Flash' };
  }

  function getKey() {
    return localStorage.getItem('docushift_gemini_key') || '';
  }

  function setKey(key) {
    if (key !== undefined) {
      localStorage.setItem('docushift_gemini_key', key.trim());
    }
  }

  // Compatibilità con il resto dell'applicazione
  function getKeys() {
    return { gemini: getKey() };
  }

  function setKeys(geminiKey) {
    setKey(geminiKey || '');
  }

  function getActiveModel() {
    const current = CANDIDATE_MODELS[currentWorkingModelIndex] || CANDIDATE_MODELS[0];
    return {
      id: current.id,
      name: current.name,
      index: currentWorkingModelIndex,
      provider: 'gemini',
      qualityLabel: '⭐⭐⭐⭐⭐ 5/5'
    };
  }

  function getNextModel() {
    if (currentWorkingModelIndex + 1 < CANDIDATE_MODELS.length) {
      return CANDIDATE_MODELS[currentWorkingModelIndex + 1];
    }
    return null;
  }

  function hasNextModel() {
    return (currentWorkingModelIndex + 1 < CANDIDATE_MODELS.length);
  }

  function switchToNextModel() {
    if (hasNextModel()) {
      currentWorkingModelIndex++;
      isModelSwitchRequested = true;
      const nextM = CANDIDATE_MODELS[currentWorkingModelIndex];
      console.log(`[DocuShift AI] Scalato manualmente a: ${nextM.name}`);

      if (activeAbortController) {
        try { activeAbortController.abort(); } catch (_) {}
        activeAbortController = null;
      }
      if (pendingRetryTimer) {
        clearTimeout(pendingRetryTimer);
        pendingRetryTimer = null;
      }
      if (retryResolve) {
        const res = retryResolve;
        retryResolve = null;
        res({ switched: true, model: nextM });
      }
      return nextM;
    }
    return null;
  }

  function cancelCurrentOperation() {
    isCancellationRequested = true;
    isModelSwitchRequested = false;

    if (activeAbortController) {
      try { activeAbortController.abort(); } catch (_) {}
      activeAbortController = null;
    }
    if (pendingRetryTimer) {
      clearTimeout(pendingRetryTimer);
      pendingRetryTimer = null;
    }
    if (retryResolve) {
      const res = retryResolve;
      retryResolve = null;
      res({ cancelled: true });
    }
  }

  function resetWorkingModel() {
    currentWorkingModelIndex = 0;
    isCancellationRequested = false;
    isModelSwitchRequested = false;
  }

  function recordRequest() {
    const now = Date.now();
    requestHistory.push(now);
    while (requestHistory.length > 0 && now - requestHistory[0] > 60000) {
      requestHistory.shift();
    }
  }

  function getQuotaStatus() {
    const now = Date.now();
    while (requestHistory.length > 0 && now - requestHistory[0] > 60000) {
      requestHistory.shift();
    }
    const used = requestHistory.length;
    const percentage = Math.min(100, Math.round((used / MAX_RPM) * 100));

    let secondsUntilReset = 0;
    if (requestHistory.length > 0) {
      const oldest = requestHistory[0];
      secondsUntilReset = Math.max(0, Math.ceil((60000 - (now - oldest)) / 1000));
    }

    return {
      provider: 'gemini',
      used,
      max: MAX_RPM,
      percentage,
      secondsUntilReset
    };
  }

  // Generatore di Magic Link
  function generateMagicLink() {
    const key = getKey();
    if (!key) return null;
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#key=${encodeURIComponent(key)}`;
  }

  // Parser JSON sicuro che rimuove blocchi markdown ```json o testo di contorno
  function parseSafeJSON(str) {
    if (!str) return null;
    let cleaned = str.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    }
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      const firstBrace = cleaned.indexOf('{');
      const firstBracket = cleaned.indexOf('[');
      let start = -1;
      let end = -1;
      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace;
        end = cleaned.lastIndexOf('}');
      } else if (firstBracket !== -1) {
        start = firstBracket;
        end = cleaned.lastIndexOf(']');
      }
      if (start !== -1 && end > start) {
        try {
          return JSON.parse(cleaned.substring(start, end + 1));
        } catch (e2) {}
      }
      throw new Error(`Risposta AI non in formato JSON valido: ${e.message}`);
    }
  }

  // Chiamata API resiliente: prioritario Gemini 3.8 Flash con retry continuo in caso di 503/429.
  // Continua a riprovare con Gemini 3.8 Flash finché non ha successo, oppure finché l'utente
  // non preme esplicitamente il pulsante per scalare al modello inferiore o annulla l'operazione.
  async function callGeminiApi(payload, onStatus = null) {
    const key = getKey();
    if (!key) {
      throw new Error('Nessuna API Key configurata. Inserisci prima la tua chiave Gemini nelle Impostazioni.');
    }

    if (isCancellationRequested) {
      throw new DOMException('Operazione annullata dall\'utente.', 'AbortError');
    }

    recordRequest();
    let attempt = 1;
    let delay = 1500;

    while (true) {
      if (isCancellationRequested) {
        throw new DOMException('Operazione annullata dall\'utente.', 'AbortError');
      }

      const model = CANDIDATE_MODELS[currentWorkingModelIndex] || CANDIDATE_MODELS[0];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${key}`;

      activeAbortController = new AbortController();
      const signal = activeAbortController.signal;

      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal
        });

        // Se 503 (High demand / Service Unavailable) o 429 (Rate limit)
        if (resp.status === 503 || resp.status === 429) {
          const nextModel = getNextModel();
          if (onStatus) {
            onStatus({
              status: 'retry',
              statusCode: resp.status,
              modelName: model.name,
              nextModelName: nextModel?.name,
              hasNextModel: !!nextModel,
              attempt,
              delay,
              message: `Server Google occupati (${resp.status}) su ${model.name}. Tentativo ${attempt} tra ${(delay / 1000).toFixed(1)}s...`
            });
          }

          const sleepResult = await new Promise((resolve) => {
            retryResolve = resolve;
            pendingRetryTimer = setTimeout(() => {
              pendingRetryTimer = null;
              retryResolve = null;
              resolve({ timeout: true });
            }, delay);
          });

          if (isCancellationRequested || sleepResult?.cancelled) {
            throw new DOMException('Operazione annullata dall\'utente.', 'AbortError');
          }

          if (isModelSwitchRequested || sleepResult?.switched) {
            isModelSwitchRequested = false;
            attempt = 1;
            delay = 1500;
            continue;
          }

          delay = Math.min(5000, Math.round(delay * 1.5));
          attempt++;
          continue;
        }

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok) {
          const errMsg = data.error?.message || `Errore Google API (${resp.status})`;

          // Se il modello è 404 (non trovato o dismesso da Google), passa al successivo se esiste
          if (resp.status === 404 || errMsg.includes('no longer available') || errMsg.includes('not found')) {
            if (hasNextModel()) {
              const nextM = switchToNextModel();
              if (onStatus) {
                onStatus({
                  status: 'switching',
                  message: `${model.name} non disponibile. Passaggio a ${nextM.name}...`
                });
              }
              attempt = 1;
              delay = 1500;
              continue;
            }
          }

          // Se errore di sovraccarico o quota nel corpo del messaggio
          if (errMsg.includes('high demand') || errMsg.includes('overloaded') || errMsg.includes('Resource has been exhausted')) {
            const nextModel = getNextModel();
            if (onStatus) {
              onStatus({
                status: 'retry',
                statusCode: 503,
                modelName: model.name,
                nextModelName: nextModel?.name,
                hasNextModel: !!nextModel,
                attempt,
                delay,
                message: `Carico elevato su ${model.name}. Tentativo ${attempt} tra ${(delay / 1000).toFixed(1)}s...`
              });
            }

            const sleepResult = await new Promise((resolve) => {
              retryResolve = resolve;
              pendingRetryTimer = setTimeout(() => {
                pendingRetryTimer = null;
                retryResolve = null;
                resolve({ timeout: true });
              }, delay);
            });

            if (isCancellationRequested || sleepResult?.cancelled) {
              throw new DOMException('Operazione annullata dall\'utente.', 'AbortError');
            }

            if (isModelSwitchRequested || sleepResult?.switched) {
              isModelSwitchRequested = false;
              attempt = 1;
              delay = 1500;
              continue;
            }

            delay = Math.min(5000, Math.round(delay * 1.5));
            attempt++;
            continue;
          }

          // Errori critici di autenticazione o chiave
          if (resp.status === 400 && (errMsg.includes('API key') || errMsg.includes('INVALID_ARGUMENT'))) {
            throw new Error(`Chiave API Gemini non valida: ${errMsg}`);
          }
          if (resp.status === 403 || errMsg.includes('PERMISSION_DENIED')) {
            throw new Error(`Permessi non autorizzati per questa API Key: ${errMsg}`);
          }

          throw new Error(errMsg);
        }

        activeAbortController = null;
        return data;

      } catch (fetchErr) {
        activeAbortController = null;

        if (isCancellationRequested || (fetchErr.name === 'AbortError' && !isModelSwitchRequested)) {
          throw new DOMException('Operazione annullata dall\'utente.', 'AbortError');
        }

        if (isModelSwitchRequested) {
          isModelSwitchRequested = false;
          attempt = 1;
          delay = 1500;
          continue;
        }

        if (fetchErr.message?.includes('Chiave API') || fetchErr.message?.includes('PERMISSION_DENIED') || fetchErr.message?.includes('non valida')) {
          throw fetchErr;
        }

        // Riconnessione di rete temporanea
        const nextModel = getNextModel();
        if (onStatus) {
          onStatus({
            status: 'retry',
            modelName: model.name,
            nextModelName: nextModel?.name,
            hasNextModel: !!nextModel,
            attempt,
            delay,
            message: `Tentativo di connessione a ${model.name} (${attempt}) tra ${(delay / 1000).toFixed(1)}s...`
          });
        }

        const sleepResult = await new Promise((resolve) => {
          retryResolve = resolve;
          pendingRetryTimer = setTimeout(() => {
            pendingRetryTimer = null;
            retryResolve = null;
            resolve({ timeout: true });
          }, delay);
        });

        if (isCancellationRequested || sleepResult?.cancelled) {
          throw new DOMException('Operazione annullata dall\'utente.', 'AbortError');
        }

        if (isModelSwitchRequested || sleepResult?.switched) {
          isModelSwitchRequested = false;
          attempt = 1;
          delay = 1500;
          continue;
        }

        delay = Math.min(5000, Math.round(delay * 1.5));
        attempt++;
      }
    }
  }

  // Test di connessione per la chiave Gemini
  async function testConnection(customKey = null) {
    const key = customKey || getKey();
    if (!key) {
      return { ok: false, error: 'Nessuna API Key inserita. Incolla prima la tua chiave.' };
    }

    try {
      // Valida autenticazione e permessi della chiave tramite l'endpoint modelli ufficiale di Google AI.
      // Questo test consuma 0 token e non subisce i blocchi per picchi di traffico (503 High Demand).
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
      const resp = await fetch(url);
      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        throw new Error(data.error?.message || `API Key non valida o non autorizzata (${resp.status})`);
      }

      return { ok: true, model: getActiveModel().name };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  // Traduzione termine glossario
  async function translateGlossaryTerm(term, sourceLang = 'auto') {
    const key = getKey();
    if (!key) {
      throw new Error('Inserisci prima la tua API Key Gemini.');
    }

    const prompt = `Traduci il termine "${term}" (lingua sorgente: ${sourceLang}) in italiano (it), inglese (en), spagnolo (es), francese (fr), tedesco (de).
Restituisci ESCLUSIVAMENTE un oggetto JSON valido in questo formato:
{
  "it": "traduzione",
  "en": "translation",
  "es": "traducción",
  "fr": "traduction",
  "de": "Übersetzung"
}`;

    const data = await callGeminiApi({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Nessuna risposta ricevuta da Gemini');
    return parseSafeJSON(rawText);
  }

  // Rilevamento automatico lingua
  async function detectLanguage(sampleText) {
    const key = getKey();
    if (!key) return 'Rilevamento automatico';

    const prompt = `Identifica la lingua del seguente testo. Rispondi SOLO con il nome comune della lingua in italiano (es: "Inglese", "Italiano", "Francese", "Tedesco", "Spagnolo"):
"${sampleText.slice(0, 500).replace(/"/g, "'")}"`;

    try {
      const data = await callGeminiApi({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0 }
      });

      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Rilevamento automatico';
    } catch (e) {
      console.warn('Errore auto-detect lingua:', e);
    }
    return 'Rilevamento automatico';
  }

  // Traduzione batch di blocchi PDF
  async function translateBatch(items, targetLang, glossaryRules = [], onStatus = null) {
    if (!items || items.length === 0) return [];
    const key = getKey();
    if (!key) {
      throw new Error('Nessuna API Key configurata. Inserisci la tua chiave Gemini nelle Impostazioni.');
    }

    let glossaryInstruction = '';
    if (glossaryRules && glossaryRules.length > 0) {
      glossaryInstruction = `\nREGOLE RIGIDE DI GLOSSARIO (rispetta scrupolosamente queste corrispondenze terminologiche):\n` +
        glossaryRules.map(r => `- "${r.source}" DEVE essere tradotto come "${r.target}"`).join('\n');
    }

    const systemPrompt = `Sei un traduttore professionale di manuali tecnici industriali e documentazione ingegneristica.
Il tuo compito è tradurre la lista di segmenti forniti verso la lingua di destinazione: "${targetLang}".

VINCOLO ASSOLUTO DI LINGUA TARGET:
1. DEVI tradurre OGNI elemento in "${targetLang}". Non lasciare testi nella lingua di partenza.
2. Ad esempio, per traduzione in Inglese (English):
   - "ALIMENTATORE VENTURI" -> "VENTURI FEEDER"
   - "MANUALE D'ISTRUZIONI" -> "INSTRUCTION MANUAL"
   - "INDICE" -> "TABLE OF CONTENTS"
   - "Regole di sicurezza" -> "Safety Rules"
   - "Simboli grafici" -> "Graphic Symbols"
   - "Maneggiamento" -> "Handling"
   - "Installazione" -> "Installation"
   - "Operazione" -> "Operation"
   - "Pannello di controllo" -> "Control Panel"
   - "Manutenzione" -> "Maintenance"
   - "Parti di ricambio" -> "Spare Parts"
   - "PERICOLO" -> "DANGER"
   - "ALLARME" -> "WARNING"
   - "ATTENZIONE" -> "CAUTION"
   - "Superficie calda!" -> "Hot surface!"
   - "Pericolo di shocks elettrici!" -> "Danger of electric shock!"

CORREZIONE AUTOMATICA ERRORI DI ESTRAZIONE E LIGATURE:
Nel testo possono comparire lettere artefatte dovute all'estrazione PDF (es. 'y' al posto di 'fi', come 'deumidiycazione' = 'deumidificazione', 'grayci' = 'grafici', 'zusso' = 'flusso', 'zuidi' = 'fluidi', 'inyammabile' = 'infiammabile', 'polveri yni' = 'polveri fini', 'Superycie' = 'Superficie', 'certiychi' = 'certifichi', o spazi anomali come 'grafi ci' = 'grafici').
Traduci SEMPRE il significato reale corretto.${glossaryInstruction}

VINCOLO DI LAYOUT:
Le traduzioni andranno inserite in riquadri grafici PDF a dimensione prefissata.
Mantieni le traduzioni concise ed efficaci per evitare sbordature.

REGOLE DI FORMATO:
Restituisci ESCLUSIVAMENTE un oggetto JSON valido contenente l'array "translations" di oggetti con "id" e "translated":
{
  "translations": [
    {"id": "p1_b1", "translated": "Translated text in ${targetLang}..."}
  ]
}`;

    const payload = items.map(it => ({ id: it.id, text: it.text }));

    const body = {
      contents: [{ parts: [{ text: `${systemPrompt}\n\nTraduci i seguenti blocchi in ${targetLang}:\n${JSON.stringify(payload)}` }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    };

    try {
      const data = await callGeminiApi(body, onStatus);
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Nessuna risposta ricevuta da Gemini');
      const parsed = parseSafeJSON(rawText);

      let list = [];
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && parsed.translations && Array.isArray(parsed.translations)) {
        list = parsed.translations;
      } else if (parsed && parsed.items && Array.isArray(parsed.items)) {
        list = parsed.items;
      } else if (parsed && typeof parsed === 'object') {
        list = Object.values(parsed);
      }

      // Mappatura iper-resiliente sia per ID che per INDICE posizionale:
      return items.map((origItem, idx) => {
        const byId = list.find(it => it && String(it.id) === String(origItem.id));
        const byIndex = list[idx];
        const resText = (byId && (byId.translated || byId.text)) || 
                        (byIndex && (byIndex.translated || byIndex.text)) || 
                        origItem.text;
        return {
          id: origItem.id,
          translated: resText
        };
      });

    } catch (batchErr) {
      if (batchErr.name === 'AbortError' || batchErr.message?.includes('annullat')) {
        throw batchErr;
      }
      console.error('[DocuShift AI] Errore blocco traduzione:', batchErr);
      throw new Error(`Errore durante la traduzione con Gemini (${batchErr.message || 'Server occupato'}). Verifica la tua chiave API o riprova tra pochi secondi.`);
    }
  }

  return {
    initAutoAuth,
    detectKeyFromClipboard,
    getKey,
    setKey,
    getKeys,
    setKeys,
    getActiveModel,
    getNextModel,
    hasNextModel,
    switchToNextModel,
    resetWorkingModel,
    cancelCurrentOperation,
    getQuotaStatus,
    generateMagicLink,
    testConnection,
    translateGlossaryTerm,
    detectLanguage,
    translateBatch
  };
})();
