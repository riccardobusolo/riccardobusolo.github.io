/**
 * ai-service.js — DocuShift AI
 * Motore AI dedicato esclusivamente a Google Gemini 3.8 Flash.
 * Gestione credenziali in LocalStorage, test di connessione, Magic Link,
 * auto-detect lingua e traduzione batch strutturata in formato JSON.
 */

const AIService = (() => {
  const MODEL_ID = 'gemini-3.8-flash';
  const MODEL_NAME = 'Gemini 3.8 Flash';
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
    return {
      id: MODEL_ID,
      name: MODEL_NAME,
      provider: 'gemini',
      qualityLabel: '⭐⭐⭐⭐⭐ 5/5'
    };
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

  // Chiamata con retry automatico ed exponential backoff per gestire picchi di traffico (503 / 429)
  async function fetchGeminiWithRetry(url, options, maxRetries = 3, onRetry = null) {
    let attempt = 0;
    let delay = 1500;

    while (true) {
      attempt++;
      try {
        const resp = await fetch(url, options);

        if ((resp.status === 503 || resp.status === 429) && attempt <= maxRetries) {
          if (onRetry) onRetry(attempt, maxRetries, delay, resp.status);
          console.warn(`[DocuShift AI] Gemini temporaneamente occupato (HTTP ${resp.status}). Tentativo ${attempt}/${maxRetries} tra ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }

        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          const errorMsg = data.error?.message || `Errore Google API (${resp.status})`;
          if (attempt <= maxRetries && (errorMsg.includes('high demand') || errorMsg.includes('Resource has been exhausted') || errorMsg.includes('overloaded'))) {
            if (onRetry) onRetry(attempt, maxRetries, delay, 503);
            console.warn(`[DocuShift AI] Gemini picco di traffico: ${errorMsg}. Tentativo ${attempt}/${maxRetries} tra ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            continue;
          }
          throw new Error(errorMsg);
        }

        return data;
      } catch (err) {
        if (attempt <= maxRetries && (err.message?.includes('high demand') || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError'))) {
          if (onRetry) onRetry(attempt, maxRetries, delay, 0);
          console.warn(`[DocuShift AI] Errore temporaneo: ${err.message}. Tentativo ${attempt}/${maxRetries} tra ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw err;
      }
    }
  }

  // Test di connessione per Gemini 3.8 Flash
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

      return { ok: true, model: MODEL_NAME };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  // Traduzione termine glossario
  async function translateGlossaryTerm(term, sourceLang = 'auto') {
    const key = getKey();
    if (!key) {
      throw new Error('Inserisci prima la tua API Key Gemini 3.8 Flash.');
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

    recordRequest();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${key}`;
    const data = await fetchGeminiWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      })
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
      recordRequest();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${key}`;
      const data = await fetchGeminiWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0 }
        })
      });

      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Rilevamento automatico';
    } catch (e) {
      console.warn('Errore auto-detect lingua:', e);
    }
    return 'Rilevamento automatico';
  }

  // Traduzione batch di blocchi PDF
  async function translateBatch(items, targetLang, glossaryRules = [], onRetry = null) {
    if (!items || items.length === 0) return [];
    const key = getKey();
    if (!key) {
      throw new Error('Nessuna API Key configurata. Inserisci la tua chiave Gemini 3.8 Flash nelle Impostazioni.');
    }

    let glossaryInstruction = '';
    if (glossaryRules && glossaryRules.length > 0) {
      glossaryInstruction = `\nREGOLE RIGIDE DI GLOSSARIO (rispetta scrupolosamente queste corrispondenze terminologiche):\n` +
        glossaryRules.map(r => `- "${r.source}" DEVE essere tradotto come "${r.target}"`).join('\n');
    }

    const systemPrompt = `Sei un traduttore professionale di documenti e manuali tecnici.
Il tuo compito è tradurre una lista di segmenti di testo mantenendo fedelmente significato, tono e contesto del documento.

VINCOLO CRUCIALE DI DESIGN (PRESERVAZIONE DEL LAYOUT):
Il testo tradotto andrà inserito in riquadri grafici PDF a dimensione fissa.
È FONDAMENTALE che la traduzione in ${targetLang} sia CONCISA e NON superi la lunghezza dell'originale se non strettamente necessario, per evitare sovrapposizioni visive con immagini o bordi.${glossaryInstruction}

REGOLE DI RISPOSTA:
1. DEVI restituire ESCLUSIVAMENTE un oggetto JSON valido contenente la chiave "translations" con la lista degli oggetti tradotti.
2. IMPORTANTE: Anche se il testo sorgente dovesse essere già in ${targetLang} o se ritieni non necessiti modifiche, restituisci COMUNQUE tutti gli elementi con i loro id e il testo.
3. NON includere MAI spiegazioni, introduzioni o note discorsive. Solo JSON.

Esempio output valido:
{
  "translations": [
    {"id": 1, "translated": "Testo tradotto..."},
    {"id": 2, "translated": "Altro testo..."}
  ]
}`;

    const payload = items.map(it => ({ id: it.id, text: it.text }));

    recordRequest();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${key}`;
    try {
      const data = await fetchGeminiWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nTraduci i seguenti blocchi:\n${JSON.stringify(payload)}` }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.15
          }
        })
      }, 3, onRetry);

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Nessuna traduzione ricevuta da Gemini');
      const parsed = parseSafeJSON(rawText);
      if (Array.isArray(parsed)) return parsed;
      return parsed.translations || parsed.items || Object.values(parsed);
    } catch (batchErr) {
      console.error('[DocuShift AI] Errore blocco traduzione:', batchErr);
      // Se l'errore è dovuto ad API Key non valida o permessi, rilancia l'errore
      if (batchErr.message.includes('API key') || batchErr.message.includes('Resource has been exhausted') || batchErr.message.includes('PERMISSION_DENIED')) {
        throw batchErr;
      }
      // Altrimenti fallback per non interrompere il documento di 24 pagine
      console.warn('[DocuShift AI] Fallback: mantengo testi originali per questo blocco.');
      return items.map(it => ({ id: it.id, translated: it.text }));
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
    getQuotaStatus,
    generateMagicLink,
    testConnection,
    translateGlossaryTerm,
    detectLanguage,
    translateBatch
  };
})();
