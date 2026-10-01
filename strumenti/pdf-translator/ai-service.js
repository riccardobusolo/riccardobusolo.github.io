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

  // Test di connessione per Gemini 3.8 Flash
  async function testConnection(customKey = null) {
    const key = customKey || getKey();
    if (!key) {
      return { ok: false, error: 'Nessuna API Key inserita. Incolla prima la tua chiave.' };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${key}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Rispondi OK' }] }]
        })
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data.error?.message || `Errore Google API (${resp.status})`);
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
      throw new Error(err.error?.message || `Errore Gemini (${resp.status})`);
    }

    const data = await resp.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText);
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
    } catch (e) {
      console.warn('Errore auto-detect lingua:', e);
    }
    return 'Rilevamento automatico';
  }

  // Traduzione batch di blocchi PDF
  async function translateBatch(items, targetLang, glossaryRules = []) {
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

Riceverai una lista JSON di blocchi con "id" e "text".
DEVI restituire ESCLUSIVAMENTE un oggetto JSON valido contenente la chiave "translations" con la lista degli oggetti tradotti.
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
    if (Array.isArray(parsed)) return parsed;
    return parsed.translations || parsed.items || Object.values(parsed);
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
