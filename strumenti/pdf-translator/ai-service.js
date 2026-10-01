/**
 * ai-service.js — DocuShift AI
 * Gestione chiamate AI (Gemini / Groq), rilevamento credenziali (Magic Link / Clipboard),
 * monitoraggio quote con countdown timer, smart auto-fallback e traduzioni JSON strutturate.
 */

const AIService = (() => {
  // Catalogo modelli disponibili
  const MODELS = {
    'gemini-1.5-flash': {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'gemini',
      quality: 5,
      qualityLabel: '⭐⭐⭐⭐⭐ 5/5',
      maxRPM: 15,
      maxRPD: 1500,
      description: 'Modello gratuito ufficiale di Google AI Studio (15 richieste/min).'
    },
    'gemini-2.0-flash': {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      provider: 'gemini',
      quality: 5,
      qualityLabel: '⭐⭐⭐⭐⭐ 5/5',
      maxRPM: 15,
      maxRPD: 1500,
      description: 'Nuova generazione Gemini ad altissima velocità.'
    },
    'gemini-2.5-flash': {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'gemini',
      quality: 5,
      qualityLabel: '⭐⭐⭐⭐⭐ 5/5',
      maxRPM: 15,
      maxRPD: 1500,
      description: 'Modello avanzato con reasoning integrato.'
    },
    'llama-3.3-70b-versatile': {
      id: 'llama-3.3-70b-versatile',
      name: 'Llama 3.3 70B (Groq)',
      provider: 'groq',
      quality: 4.8,
      qualityLabel: '⭐⭐⭐⭐⭐ 4.8/5',
      maxRPM: 30,
      maxRPD: 1000,
      description: 'Capacità linguistiche elevate su hardware ultra-veloce Groq (30 RPM).'
    },
    'llama-3.1-8b-instant': {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B (Groq)',
      provider: 'groq',
      quality: 4.0,
      qualityLabel: '⭐⭐⭐⭐ 4/5',
      maxRPM: 30,
      maxRPD: 14400,
      description: 'Estremamente scattante per testi standard.'
    }
  };

  // Cronologia chiamate per calcolo rate limit scorrevole
  const requestHistory = {
    gemini: [],
    groq: []
  };

  let activeModel = localStorage.getItem('docushift_active_model') || 'gemini-1.5-flash';
  let autoFallbackEnabled = localStorage.getItem('docushift_auto_fallback') !== 'false';

  // Inizializzazione automatizzata: Magic Link (#key=... o #gemini_key=...)
  function initAutoAuth() {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const params = new URLSearchParams(hash.substring(1));
      let keySaved = false;

      const gKey = params.get('gemini_key') || params.get('key');
      if (gKey && gKey.startsWith('AIzaSy')) {
        localStorage.setItem('docushift_gemini_key', gKey.trim());
        keySaved = true;
      }

      const grKey = params.get('groq_key');
      if (grKey && grKey.startsWith('gsk_')) {
        localStorage.setItem('docushift_groq_key', grKey.trim());
        keySaved = true;
      }

      if (keySaved) {
        // Pulisce l'URL istantaneamente per sicurezza
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
        }
        return { success: true, message: 'Chiave API rilevata e salvata con successo tramite Magic Link!' };
      }
    }

    // Supporto per configurazione locale (config.local.js)
    if (window.__LOCAL_CONFIG__) {
      if (window.__LOCAL_CONFIG__.geminiApiKey && !localStorage.getItem('docushift_gemini_key')) {
        localStorage.setItem('docushift_gemini_key', window.__LOCAL_CONFIG__.geminiApiKey);
      }
      if (window.__LOCAL_CONFIG__.groqApiKey && !localStorage.getItem('docushift_groq_key')) {
        localStorage.setItem('docushift_groq_key', window.__LOCAL_CONFIG__.groqApiKey);
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

    if (text.startsWith('AIzaSy')) {
      localStorage.setItem('docushift_gemini_key', text);
      return { provider: 'gemini', key: text, label: 'Google Gemini' };
    } else if (text.startsWith('gsk_')) {
      localStorage.setItem('docushift_groq_key', text);
      return { provider: 'groq', key: text, label: 'Groq Cloud' };
    } else {
      throw new Error('Negli appunti non è stata trovata una chiave Gemini (AIzaSy...) o Groq (gsk_...).');
    }
  }

  function getKeys() {
    return {
      gemini: localStorage.getItem('docushift_gemini_key') || '',
      groq: localStorage.getItem('docushift_groq_key') || ''
    };
  }

  function setKeys(geminiKey, groqKey) {
    if (geminiKey !== undefined) localStorage.setItem('docushift_gemini_key', geminiKey.trim());
    if (groqKey !== undefined) localStorage.setItem('docushift_groq_key', groqKey.trim());
  }

  function getActiveModel() {
    return MODELS[activeModel] || MODELS['gemini-1.5-flash'];
  }

  function setActiveModel(modelId) {
    if (MODELS[modelId]) {
      activeModel = modelId;
      localStorage.setItem('docushift_active_model', modelId);
    }
  }

  function getAutoFallback() {
    return autoFallbackEnabled;
  }

  function setAutoFallback(enabled) {
    autoFallbackEnabled = !!enabled;
    localStorage.setItem('docushift_auto_fallback', autoFallbackEnabled ? 'true' : 'false');
  }

  function recordRequest(provider) {
    const now = Date.now();
    if (!requestHistory[provider]) requestHistory[provider] = [];
    requestHistory[provider].push(now);
    // Rimuove richieste più vecchie di 60 secondi
    requestHistory[provider] = requestHistory[provider].filter(t => now - t < 60000);
  }

  function getQuotaStatus(modelId = activeModel) {
    const model = MODELS[modelId] || getActiveModel();
    const now = Date.now();
    const history = (requestHistory[model.provider] || []).filter(t => now - t < 60000);
    const used = history.length;
    const max = model.maxRPM;
    const percentage = Math.min(100, Math.round((used / max) * 100));

    let secondsUntilReset = 0;
    if (history.length > 0) {
      const oldest = history[0];
      secondsUntilReset = Math.max(0, Math.ceil((60000 - (now - oldest)) / 1000));
    }

    return {
      provider: model.provider,
      used,
      max,
      percentage,
      secondsUntilReset
    };
  }

  // Generatore di Magic Link
  function generateMagicLink(provider = 'gemini') {
    const keys = getKeys();
    const key = provider === 'gemini' ? keys.gemini : keys.groq;
    if (!key) return null;
    const param = provider === 'gemini' ? 'gemini_key' : 'groq_key';
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#${param}=${encodeURIComponent(key)}`;
  }

  // Test di connessione con una chiave
  async function testConnection(modelId = activeModel) {
    const keys = getKeys();
    const model = MODELS[modelId] || getActiveModel();
    const key = model.provider === 'gemini' ? keys.gemini : keys.groq;

    if (!key) {
      return { ok: false, error: 'Nessuna chiave API inserita. Incolla prima la chiave.' };
    }

    try {
      if (model.provider === 'gemini') {
        // Verifica la validità della chiave su Google API (costo 0 token)
        const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const modelsResp = await fetch(modelsUrl);
        const modelsData = await modelsResp.json().catch(() => ({}));
        
        if (!modelsResp.ok) {
          const errMsg = modelsData.error?.message || `Errore Google API (${modelsResp.status})`;
          throw new Error(errMsg);
        }

        return { ok: true, provider: 'gemini', model: model.name };
      } else {
        const resp = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          throw new Error(data.error?.message || `Errore Groq (${resp.status})`);
        }
        return { ok: true, provider: 'groq', model: model.name };
      }
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  // Traduzione di una singola riga del glossario in tutte le lingue target
  async function translateGlossaryTerm(term, sourceLang = 'auto') {
    const current = getActiveModel();
    const keys = getKeys();
    const key = current.provider === 'gemini' ? keys.gemini : keys.groq;

    if (!key) {
      throw new Error(`Inserisci la tua chiave API ${current.provider.toUpperCase()} nelle Impostazioni.`);
    }

    const prompt = `Traduci il seguente termine "${term}" (lingua sorgente: ${sourceLang}) nelle seguenti lingue: italiano (it), inglese (en), spagnolo (es), francese (fr), tedesco (de).
Restituisci ESCLUSIVAMENTE un oggetto JSON valido in questo formato:
{
  "it": "traduzione italiana",
  "en": "english translation",
  "es": "traducción en español",
  "fr": "traduction en français",
  "de": "deutsche Übersetzung"
}`;

    let resultJson = null;

    if (current.provider === 'gemini') {
      recordRequest('gemini');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${current.id}:generateContent?key=${key}`;
      const resp = await fetch(url, {
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
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `Errore API Gemini (${resp.status})`);
      }
      const data = await resp.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      resultJson = JSON.parse(rawText);
    } else {
      recordRequest('groq');
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: current.id,
          messages: [
            { role: 'system', content: 'You are an accurate multilingual terminological translator. Output valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `Errore API Groq (${resp.status})`);
      }
      const data = await resp.json();
      const rawText = data.choices?.[0]?.message?.content;
      resultJson = JSON.parse(rawText);
    }

    return resultJson;
  }

  // Rilevamento automatico della lingua del documento
  async function detectLanguage(sampleText) {
    const keys = getKeys();
    if (!keys.gemini && !keys.groq) {
      return 'Inglese (stimato)';
    }
    const current = getActiveModel();
    const prompt = `Identifica la lingua del seguente testo breve. Rispondi SOLO con il nome comune della lingua in italiano (ad esempio: "Inglese", "Italiano", "Francese", "Tedesco", "Spagnolo"):
"${sampleText.slice(0, 500).replace(/"/g, "'")}"`;

    try {
      const key = current.provider === 'gemini' ? keys.gemini : keys.groq;
      if (current.provider === 'gemini') {
        recordRequest('gemini');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${current.id}:generateContent?key=${key}`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0 }
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Rilevamento automatico';
        }
      }
    } catch (e) {
      console.warn('Errore auto-detect lingua:', e);
    }
    return 'Rilevamento automatico';
  }

  // Traduzione di un batch di blocchi di testo del PDF
  async function translateBatch(items, targetLang, glossaryRules = [], onFallback = null) {
    if (!items || items.length === 0) return [];

    let currentModelId = activeModel;
    const modelOrder = [
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant'
    ];

    // Seleziona la lista di fallback partendo dal modello attuale
    let modelsToTry = [currentModelId];
    if (autoFallbackEnabled) {
      modelsToTry = [
        currentModelId,
        ...modelOrder.filter(m => m !== currentModelId)
      ];
    }

    let lastError = null;

    for (const modelId of modelsToTry) {
      const model = MODELS[modelId];
      const keys = getKeys();
      const key = model.provider === 'gemini' ? keys.gemini : keys.groq;

      if (!key) {
        continue;
      }

      try {
        const translatedItems = await executeTranslationRequest(model, key, items, targetLang, glossaryRules);
        return translatedItems;
      } catch (err) {
        lastError = err;
        console.warn(`Tentativo fallito con ${model.name}:`, err.message);

        if (autoFallbackEnabled) {
          if (onFallback) {
            onFallback(model, err.message);
          }
          continue;
        } else {
          throw err;
        }
      }
    }

    throw lastError || new Error('Tutti i tentativi di traduzione sono falliti. Verifica le tue chiavi API nelle Impostazioni.');
  }

  async function executeTranslationRequest(model, key, items, targetLang, glossaryRules) {
    let glossaryInstruction = '';
    if (glossaryRules && glossaryRules.length > 0) {
      glossaryInstruction = `\nREGOLE RIGIDE DI GLOSSARIO (rispetta scrupolosamente queste corrispondenze terminologiche):\n` +
        glossaryRules.map(r => `- "${r.source}" DEVE essere tradotto come "${r.target}"`).join('\n');
    }

    const systemPrompt = `Sei un traduttore professionale di documenti e manuali.
Il tuo compito è tradurre una lista di segmenti di testo mantenendo rigorosamente il significato, il tono e il contesto del documento.

VINCOLO CRUCIALE DI DESIGN (PRESERVAZIONE DEL LAYOUT):
Il testo tradotto andrà inserito in riquadri grafici PDF a dimensione fissa.
È FONDAMENTALE che la traduzione in ${targetLang} sia CONCISA e NON superi la lunghezza dell'originale se non strettamente necessario, per evitare sovrapposizioni visive con immagini o bordi.${glossaryInstruction}

Riceverai un array JSON di oggetti con "id" e "text".
DEVI restituire ESCLUSIVAMENTE un array JSON valido con lo stesso identico numero di elementi e gli stessi "id", con il campo "translated" contenente la traduzione.
Esempio output:
[
  {"id": 1, "translated": "Testo tradotto..."},
  {"id": 2, "translated": "Altro testo..."}
]`;

    const payload = items.map(it => ({ id: it.id, text: it.text }));

    if (model.provider === 'gemini') {
      recordRequest('gemini');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${key}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nTraduci i seguenti blocchi:\n${JSON.stringify(payload)}` }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.15
          }
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `Errore HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText);
      return Array.isArray(parsed) ? parsed : (parsed.translations || parsed.items || []);
    } else {
      recordRequest('groq');
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: model.id,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(payload) }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.15
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `Errore HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const rawText = data.choices?.[0]?.message?.content;
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed)) return parsed;
      return parsed.translations || parsed.items || parsed.result || Object.values(parsed);
    }
  }

  return {
    MODELS,
    initAutoAuth,
    detectKeyFromClipboard,
    getKeys,
    setKeys,
    getActiveModel,
    setActiveModel,
    getAutoFallback,
    setAutoFallback,
    getQuotaStatus,
    generateMagicLink,
    testConnection,
    translateGlossaryTerm,
    detectLanguage,
    translateBatch
  };
})();
