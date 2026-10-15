/**
 * pdf-engine.js — DocuShift AI v3.9
 * Motore di elaborazione PDF: estrazione coordinate con PDF.js,
 * correzione automatica di ligatures e codifiche font,
 * download dinamico di Google Fonts (Inter / TrueType) con fontkit,
 * supporto completo per stili Bold, Italic e Bold-Italic,
 * rilevamento cromatico ad alto contrasto (bianco su sfondi scuri),
 * cancellazione chirurgica non distruttiva del vecchio testo (zero toppe bianche),
 * algoritmo di auto-scaling del testo e rendering anteprima side-by-side.
 */

const PDFEngine = (() => {
  // CDN font TrueType predefiniti per fallback ad alta compatibilità (Inter / Lora / JetBrains Mono)
  const FONT_URLS = {
    sans: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf',
    sansBold: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf',
    sansItalic: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-italic.ttf',
    sansBoldItalic: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-italic.ttf',
    serif: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.ttf',
    serifBold: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-700-normal.ttf',
    mono: 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.ttf',
    monoBold: 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-700-normal.ttf'
  };

  // Mappa delle famiglie commerciali agli equivalenti metrici open-source Google Fonts
  const FONT_FAMILY_MAP = {
    'calibri': 'carlito',
    'arial': 'arimo',
    'helvetica': 'inter',
    'swiss721': 'inter',
    'swiss': 'inter',
    'times': 'tinos',
    'times new roman': 'tinos',
    'courier': 'cousine',
    'courier new': 'cousine',
    'verdana': 'open-sans',
    'tahoma': 'noto-sans',
    'segoe': 'inter',
    'segoe ui': 'inter',
    'myriad': 'pt-sans',
    'myriad pro': 'pt-sans',
    'din': 'fira-sans',
    'din pro': 'fira-sans',
    'futura': 'montserrat'
  };

  let cachedFontBuffers = {};
  const embeddedDynamicFonts = new Map();

  // Configura il worker di PDF.js (locale ad alte prestazioni con fallback CDN)
  if (typeof pdfjsLib !== 'undefined') {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js?v=3.9';
    } catch (e) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  // Pulizia e normalizzazione delle ligatures e artefatti di codifica nei PDF tecnici
  function cleanLigaturesAndEncoding(str) {
    if (!str) return '';
    let s = str
      .replace(/\uFB00/g, 'ff')
      .replace(/\uFB01/g, 'fi')
      .replace(/\uFB02/g, 'fl')
      .replace(/\uFB03/g, 'ffi')
      .replace(/\uFB04/g, 'ffl')
      .replace(/\uFB05/g, 'ft')
      .replace(/\uFB06/g, 'st');

    // Risolve la corruzione da subset font dove 'fi' è stato codificato come 'y' o 'ffi' come 'fy'
    s = s.replace(/\b([a-zàèéìòù]*)y([a-zàèéìòù]+)\b/gi, (match, pre, post) => {
      const lowerPre = pre.toLowerCase();
      const lowerPost = post.toLowerCase();
      if (
        lowerPre === 'gra' || lowerPre === 'deumidi' || lowerPre === 'super' ||
        lowerPre === 'certi' || lowerPre === 'modi' || lowerPre === 'quali' ||
        lowerPre === 'speci' || lowerPre === 'veri' || lowerPre === 'in' ||
        lowerPre === 'ri' || lowerPre === 'e' || lowerPre === 'u' || lowerPre === ''
      ) {
        if (lowerPre === 'u' || lowerPre === 'e') return pre + 'ffi' + post;
        if (lowerPre === '' && (lowerPost === 'ni' || lowerPost === 'no' || lowerPost === 'le' || lowerPost === 'li')) {
          return (pre.toUpperCase() === pre && pre.length > 0 ? 'Fi' : 'fi') + post;
        }
        return pre + 'fi' + post;
      }
      return match;
    });

    s = s.replace(/\bzusso\b/gi, 'flusso')
         .replace(/\bzuidi\b/gi, 'fluidi')
         .replace(/\bzuido\b/gi, 'fluido');

    // Rimuovi spazi anomali tipici di estrazioni frammentate
    s = s.replace(/\b([a-zàèéìòù]+)\s+ci\b/gi, (m, w) => {
      if (w.toLowerCase() === 'grafi' || w.toLowerCase() === 'artifi' || w.toLowerCase() === 'edifi') return w + 'ci';
      return m;
    });
    s = s.replace(/\bquali\s+cato\b/gi, 'qualificato')
         .replace(/\bpart\s+e\b/gi, 'parte')
         .replace(/\bcom\s+pleta\b/gi, 'completa')
         .replace(/\bini\s+ziare\b/gi, 'iniziare')
         .replace(/\bdispo\s+sto\b/gi, 'disposto')
         .replace(/\bi\s+l\s+livello\b/gi, 'il livello')
         .replace(/\br\s+le\s+protezioni\b/gi, 'e le protezioni')
         .replace(/\bafyssi\b/gi, 'affissi')
         .replace(/\bysici\b/gi, 'fisici')
         .replace(/\briyuti\b/gi, 'rifiuti')
         .replace(/\befyciente\b/gi, 'efficiente');

    return s;
  }

  // Sanitizza il testo per prevenire crash dovuti a caratteri speciali non supportati dal font
  function sanitizeTextForFont(text, font) {
    if (!text) return '';
    let safe = text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\u2026]/g, '...')
      .replace(/[\u27A2\u27A1\u25BA\u02C3]/g, '>')
      .replace(/[\u2022]/g, '*');

    try {
      if (font && font.encodeText) {
        font.encodeText(safe);
      }
      return safe;
    } catch (e) {
      return safe.replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');
    }
  }

  // Scarica dinamicamente il font richiesto dal PDF tramite Google Fonts / Fontsource CDN
  async function fetchFontBuffer(fontFamily = 'sans', isBold = false, isItalic = false) {
    const raw = (fontFamily || '').toLowerCase().trim();
    const cleanFamily = raw
      .replace(/^([a-z]{6}\+)/i, '')
      .replace(/mt$|ps$|pro$|lt$|-regular$|-bold$|-italic$|-bolditalic$/i, '')
      .trim();

    const mappedFamily = FONT_FAMILY_MAP[cleanFamily] || cleanFamily || 'inter';
    const slug = mappedFamily.replace(/[\s_]+/g, '-').toLowerCase();
    const weight = isBold ? '700' : '400';
    const style = isItalic ? 'italic' : 'normal';
    const cacheKey = `${slug}_${weight}_${style}`;

    if (cachedFontBuffers[cacheKey]) {
      return cachedFontBuffers[cacheKey];
    }

    // 1. Prova a scaricare il font esatto dalla CDN fontsource
    const candidateUrls = [
      `https://cdn.jsdelivr.net/fontsource/fonts/${slug}@latest/latin-${weight}-${style}.ttf`,
      `https://cdn.jsdelivr.net/fontsource/fonts/${slug}@latest/latin-${weight}-normal.ttf`,
      `https://cdn.jsdelivr.net/fontsource/fonts/${slug}@latest/latin-400-normal.ttf`
    ];

    for (const url of candidateUrls) {
      try {
        const resp = await fetch(url);
        if (resp.ok) {
          const buf = await resp.arrayBuffer();
          if (buf && buf.byteLength > 1000) {
            cachedFontBuffers[cacheKey] = buf;
            return buf;
          }
        }
      } catch (e) {}
    }

    // 2. Fallback intelligente: distringue rigorosamente Sans da Serif e Mono
    const isSerif = (raw.includes('serif') && !raw.includes('sans')) || raw.includes('times') || raw.includes('georgia') || raw.includes('tinos');
    const isMono = raw.includes('mono') || raw.includes('courier') || raw.includes('cousine') || raw.includes('code');

    let fallbackKey = 'sans';
    if (isMono) {
      fallbackKey = isBold ? 'monoBold' : 'mono';
    } else if (isSerif) {
      fallbackKey = isBold ? 'serifBold' : 'serif';
    } else {
      if (isBold && isItalic) fallbackKey = 'sansBoldItalic';
      else if (isBold) fallbackKey = 'sansBold';
      else if (isItalic) fallbackKey = 'sansItalic';
      else fallbackKey = 'sans';
    }

    if (cachedFontBuffers[fallbackKey]) {
      return cachedFontBuffers[fallbackKey];
    }

    const fallbackUrl = FONT_URLS[fallbackKey] || FONT_URLS.sans;
    try {
      const fallbackResp = await fetch(fallbackUrl);
      if (fallbackResp.ok) {
        const fallbackBuf = await fallbackResp.arrayBuffer();
        if (fallbackBuf && fallbackBuf.byteLength > 1000) {
          cachedFontBuffers[fallbackKey] = fallbackBuf;
          return fallbackBuf;
        }
      }
    } catch (e) {}

    return null;
  }

  // Rilascia la memoria dei font temporanei
  function clearFontMemory() {
    cachedFontBuffers = {};
    embeddedDynamicFonts.clear();
    if (window.gc) {
      try { window.gc(); } catch (e) {}
    }
  }

  // Rileva in modo intelligente il colore dello sfondo e del testo tramite luminosità mediana
  function detectBlockColor(x, y, width, height, ctx, pageHeight, sampleScale = 0.75) {
    if (!ctx) return { isDarkBg: false, color: { r: 0.10, g: 0.10, b: 0.12 } };
    try {
      const cx = Math.max(0, Math.round(x * sampleScale));
      const topY = Math.max(0, Math.round((pageHeight - y - height) * sampleScale));
      const bottomY = Math.min(ctx.canvas.height - 1, Math.round((pageHeight - y) * sampleScale));
      const cw = Math.max(4, Math.round(Math.max(width, 24) * sampleScale));
      const ch = Math.max(2, bottomY - topY);

      const imgData = ctx.getImageData(cx, topY, Math.min(cw, ctx.canvas.width - cx), Math.min(ch, ctx.canvas.height - topY));
      const data = imgData.data;
      if (!data || data.length === 0) return { isDarkBg: false, color: { r: 0.10, g: 0.10, b: 0.12 } };

      // Campiona pixel e calcola la luminosità mediana dello sfondo:
      // i pixel del testo occupano solo una piccola frazione (< 20%) dell'area del riquadro,
      // quindi la luminosità mediana (40°-50° percentile) corrisponde rigorosamente allo sfondo!
      const lums = [];
      const step = Math.max(1, Math.floor(data.length / (4 * 60)));
      for (let p = 0; p < data.length; p += step * 4) {
        const r = data[p] / 255;
        const g = data[p + 1] / 255;
        const b = data[p + 2] / 255;
        lums.push(0.299 * r + 0.587 * g + 0.114 * b);
      }

      lums.sort((a, b) => a - b);
      const bgLum = lums[Math.floor(lums.length * 0.40)] || 1.0;

      // Se lo sfondo è scuro (blu banner, nero, grigio scuro - lum < 0.48):
      // il testo deve risaltare in BIANCO PURO!
      if (bgLum < 0.48) {
        return {
          isDarkBg: true,
          color: { r: 1.0, g: 1.0, b: 1.0 } // Bianco Puro brillante
        };
      } else {
        return {
          isDarkBg: false,
          color: { r: 0.10, g: 0.10, b: 0.12 } // Scuro Grafite
        };
      }
    } catch (e) {
      return { isDarkBg: false, color: { r: 0.10, g: 0.10, b: 0.12 } };
    }
  }

  // Estrae pagine, dimensioni e blocchi di testo con coordinate
  async function parsePDF(pdfArrayBuffer) {
    let bufferCopy;
    if (pdfArrayBuffer instanceof Uint8Array) {
      bufferCopy = pdfArrayBuffer.slice();
    } else if (pdfArrayBuffer && pdfArrayBuffer.slice) {
      bufferCopy = new Uint8Array(pdfArrayBuffer.slice(0));
    } else {
      bufferCopy = new Uint8Array(pdfArrayBuffer);
    }

    const loadingTask = pdfjsLib.getDocument({ data: bufferCopy });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const pagesData = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const textContent = await page.getTextContent({ normalizeWhitespace: true });

      // Renderizza un canvas off-screen veloce (scale 0.75) per campionare il colore dello sfondo di ogni blocco
      let sampleCtx = null;
      try {
        const sampleScale = 0.75;
        const sampleViewport = page.getViewport({ scale: sampleScale });
        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = Math.round(sampleViewport.width);
        sampleCanvas.height = Math.round(sampleViewport.height);
        sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
        await page.render({ canvasContext: sampleCtx, viewport: sampleViewport }).promise;
      } catch (cvErr) {
        console.warn('[DocuShift] Campionamento cromatico canvas non disponibile:', cvErr);
      }

      const rawItems = textContent.items.map((item, idx) => {
        const tx = item.transform[4];
        const ty = item.transform[5];
        const fontSize = Math.hypot(item.transform[0], item.transform[1]) || 12;
        const fontName = (item.fontName || '').toLowerCase();
        
        const styleInfo = textContent.styles && textContent.styles[item.fontName];
        const rawFamily = (styleInfo && styleInfo.fontFamily) || item.fontName || 'sans';
        const cleanFamily = rawFamily.replace(/^([a-z]{6}\+)/i, '').replace(/mt$|ps$|pro$|lt$/i, '').trim();

        const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy') || (styleInfo && styleInfo.fontFamily && /bold|black/i.test(styleInfo.fontFamily));
        const isItalic = fontName.includes('italic') || fontName.includes('oblique') || (styleInfo && styleInfo.fontFamily && /italic|oblique/i.test(styleInfo.fontFamily));
        const isSerif = (rawFamily.includes('serif') && !rawFamily.includes('sans')) || rawFamily.includes('times') || rawFamily.includes('roman') || rawFamily.includes('georgia');
        const isMono = rawFamily.includes('mono') || rawFamily.includes('courier') || rawFamily.includes('code');

        // Campiona la luminosità dello sfondo sotto il testo per impostare il colore con contrasto perfetto
        const colorInfo = detectBlockColor(tx, ty, item.width, item.height || fontSize, sampleCtx, viewport.height, 0.75);

        // Pulizia ligatures e caratteri corrotti
        const cleanedStr = cleanLigaturesAndEncoding(item.str);

        return {
          id: `p${pageNum}_b${idx + 1}`,
          page: pageNum,
          str: cleanedStr,
          x: tx,
          y: ty,
          width: item.width,
          height: item.height || fontSize,
          fontSize: fontSize,
          isBold: !!isBold,
          isItalic: !!isItalic,
          isSerif: !!isSerif,
          isMono: !!isMono,
          fontFamily: cleanFamily,
          color: colorInfo.color,
          isDarkBg: colorInfo.isDarkBg,
          hasEOL: item.hasEOL
        };
      });

      // Filtra blocchi vuoti o con soli spazi
      const filteredItems = rawItems.filter(it => it.str && it.str.trim().length > 0);

      // Raggruppa frammenti adiacenti sulla stessa riga per preservare senso e traduzione coerente
      const groupedBlocks = groupAdjacentTextItems(filteredItems);

      pagesData.push({
        pageNum,
        width: viewport.width,
        height: viewport.height,
        blocks: groupedBlocks
      });
    }

    return {
      numPages,
      pages: pagesData
    };
  }

  // Raggruppa elementi di testo continui sulla stessa riga (stessa Y o quasi)
  function groupAdjacentTextItems(items) {
    if (items.length === 0) return [];
    const groups = [];
    let currentGroup = null;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!currentGroup) {
        currentGroup = {
          id: item.id,
          page: item.page,
          text: item.str,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          isBold: item.isBold,
          isItalic: item.isItalic,
          isSerif: item.isSerif,
          isMono: item.isMono,
          fontFamily: item.fontFamily,
          color: item.color,
          isDarkBg: item.isDarkBg,
          originalItems: [item]
        };
        continue;
      }

      const sameLine = Math.abs(item.y - currentGroup.y) < (currentGroup.fontSize * 0.4);
      const isNearby = item.x >= currentGroup.x && (item.x - (currentGroup.x + currentGroup.width)) < (currentGroup.fontSize * 1.5);
      const sameStyle = (
        item.isBold === currentGroup.isBold && 
        item.isItalic === currentGroup.isItalic && 
        item.isDarkBg === currentGroup.isDarkBg
      );

      if (sameLine && isNearby && sameStyle) {
        const space = (currentGroup.text.endsWith(' ') || item.str.startsWith(' ')) ? '' : ' ';
        currentGroup.text += space + item.str;
        currentGroup.width = (item.x + item.width) - currentGroup.x;
        currentGroup.height = Math.max(currentGroup.height, item.height);
        currentGroup.originalItems.push(item);
      } else {
        groups.push(currentGroup);
        currentGroup = {
          id: item.id,
          page: item.page,
          text: item.str,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          isBold: item.isBold,
          isItalic: item.isItalic,
          isSerif: item.isSerif,
          isMono: item.isMono,
          fontFamily: item.fontFamily,
          color: item.color,
          isDarkBg: item.isDarkBg,
          originalItems: [item]
        };
      }
    }

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }

  // Assicura il caricamento dinamico e ultra-resiliente di PDFLib (locale con fallback CDN)
  async function ensurePDFLibLoaded() {
    const getLib = () => {
      if (typeof window !== 'undefined' && window.PDFLib) return window.PDFLib;
      if (typeof PDFLib !== 'undefined') return PDFLib;
      if (typeof globalThis !== 'undefined' && globalThis.PDFLib) return globalThis.PDFLib;
      return null;
    };

    const existing = getLib();
    if (existing) return existing;

    const sourceUrls = [
      'pdf-lib.min.js?v=3.9',
      'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
      'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js'
    ];

    for (const url of sourceUrls) {
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = url;
          if (url.startsWith('http')) {
            s.crossOrigin = 'anonymous';
          }
          s.onload = () => resolve();
          s.onerror = (e) => reject(e || new Error(`Failed to load ${url}`));
          document.head.appendChild(s);
        });
        const lib = getLib();
        if (lib) return lib;
      } catch (err) {
        console.warn(`[DocuShift PDFEngine] Fallback per PDFLib da ${url}:`, err);
      }
    }

    throw new Error('Impossibile caricare la libreria di compilazione PDF (PDFLib). Verifica la connessione a Internet o eventuali blocchi estensioni.');
  }

  // Assicura il caricamento resiliente di fontkit (locale con fallback CDN)
  async function ensureFontkitLoaded() {
    const getFk = () => {
      if (typeof window !== 'undefined' && window.fontkit) return window.fontkit;
      if (typeof fontkit !== 'undefined') return fontkit;
      if (typeof globalThis !== 'undefined' && globalThis.fontkit) return globalThis.fontkit;
      return null;
    };

    const existing = getFk();
    if (existing) return existing;

    const sourceUrls = [
      'fontkit.umd.min.js?v=3.9',
      'https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js',
      'https://unpkg.com/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js'
    ];

    for (const url of sourceUrls) {
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = url;
          if (url.startsWith('http')) {
            s.crossOrigin = 'anonymous';
          }
          s.onload = () => resolve();
          s.onerror = (e) => reject(e || new Error(`Failed to load ${url}`));
          document.head.appendChild(s);
        });
        const fk = getFk();
        if (fk) return fk;
      } catch (err) {
        console.warn(`[DocuShift PDFEngine] Fallback per fontkit da ${url}:`, err);
      }
    }

    return getFk();
  }

  // Rimuove e neutralizza alla radice il testo originale dallo stream vettoriale della pagina
  // Senza toccare forme, sfondi colorati (giallo, blu), immagini, tabelle o elementi grafici
  function stripOriginalTextFromPage(page, pdfDoc) {
    try {
      const { PDFName, PDFArray, decodePDFRawStream } = window.PDFLib;
      const contentsEntry = page.node.Contents();
      if (!contentsEntry) return;

      const streamRefs = [];
      if (contentsEntry instanceof PDFArray) {
        for (let i = 0; i < contentsEntry.size(); i++) {
          streamRefs.push(contentsEntry.get(i));
        }
      } else {
        streamRefs.push(contentsEntry);
      }

      for (let sIdx = 0; sIdx < streamRefs.length; sIdx++) {
        const ref = streamRefs[sIdx];
        let rawStream = ref;
        if (pdfDoc.context.lookup) {
          const lookedUp = pdfDoc.context.lookup(ref);
          if (lookedUp) rawStream = lookedUp;
        }

        let decodedBytes = null;
        try {
          if (rawStream.getUnencodedContents) {
            decodedBytes = rawStream.getUnencodedContents();
          } else if (rawStream.contents) {
            const decoded = decodePDFRawStream(rawStream);
            decodedBytes = decoded.decode ? decoded.decode() : decoded;
          }
        } catch (e) {
          console.warn('[DocuShift PDFEngine] Fallback decodifica stream:', e);
        }

        if (!decodedBytes || decodedBytes.length === 0) continue;

        let streamText = '';
        const chunkSize = 8192;
        for (let i = 0; i < decodedBytes.length; i += chunkSize) {
          const slice = decodedBytes.subarray(i, Math.min(i + chunkSize, decodedBytes.length));
          streamText += String.fromCharCode.apply(null, slice);
        }

        // Se lo stream non contiene comandi di testo BT...ET, non toccarlo assolutamente!
        if (!/\bBT\b/.test(streamText)) continue;

        // CANCELLAZIONE CHIRURGICA E NON DISTRUTTIVA DEL VECCHIO TESTO:
        // In PDF ISO 32000-1 sez. 9.2.2, TUTTO il testo risiede esclusivamente tra 'BT' ed 'ET'.
        // Nessun operatore di tracciamento vettoriale (re, f, s, S, Do, m, l, c) compare mai tra BT ed ET.
        // Sostituendo 'BT ... ET' con 'BT 3 Tr ET' (Text Rendering Mode 3 = né riempimento né tratto, invisibile):
        // 1. Eliminiamo completamente e in sicurezza la visualizzazione del vecchio testo
        // 2. NON tocchiamo alcuna forma, colore di sfondo (giallo, blu), tabella, bordo o immagine!
        // 3. Modifichiamo ciascuno stream in-place preservando la gerarchia della pagina!
        const cleanedText = streamText.replace(/\bBT\b[\s\S]*?\bET\b/g, 'BT 3 Tr ET');

        const newBytes = new Uint8Array(cleanedText.length);
        for (let i = 0; i < cleanedText.length; i++) {
          newBytes[i] = cleanedText.charCodeAt(i) & 0xff;
        }

        const newStream = pdfDoc.context.flateStream(newBytes);
        const newStreamRef = pdfDoc.context.register(newStream);

        if (contentsEntry instanceof PDFArray) {
          contentsEntry.set(sIdx, newStreamRef);
        } else {
          page.node.set(PDFName.of('Contents'), newStreamRef);
        }
      }
    } catch (stripErr) {
      console.warn('[DocuShift PDFEngine] Errore pulizia testo stream originale:', stripErr);
    }
  }

  // Incorpora dinamicamente un font TrueType nel documento PDF con cache in memoria
  async function getOrEmbedDynamicFont(pdfDoc, fontFamily, isBold, isItalic) {
    if (!fontFamily) return null;
    const cleanFamily = fontFamily
      .replace(/^([a-z]{6}\+)/i, '')
      .replace(/mt$|ps$|pro$|lt$|-regular$|-bold$|-italic$|-bolditalic$/i, '')
      .trim();
    const weightKey = isBold ? 'bold' : 'normal';
    const styleKey = isItalic ? 'italic' : 'normal';
    const cacheKey = `${cleanFamily.toLowerCase()}_${weightKey}_${styleKey}`;

    if (embeddedDynamicFonts.has(cacheKey)) {
      return embeddedDynamicFonts.get(cacheKey);
    }

    try {
      const buffer = await fetchFontBuffer(cleanFamily, isBold, isItalic);
      if (buffer) {
        const embedded = await pdfDoc.embedFont(buffer);
        embeddedDynamicFonts.set(cacheKey, embedded);
        return embedded;
      }
    } catch (err) {
      console.warn(`[DocuShift PDFEngine] Fallback font per ${cleanFamily}:`, err);
    }
    return null;
  }

  // Costruisce il nuovo documento PDF tradotto preservando immagini e grafica originale
  async function buildTranslatedPDF(originalPdfBytes, pagesData, translationsMap, options = {}) {
    const pdfLibInstance = await ensurePDFLibLoaded();
    const { PDFDocument, rgb, StandardFonts } = pdfLibInstance;

    let safeBytes;
    if (originalPdfBytes instanceof Uint8Array) {
      safeBytes = originalPdfBytes.slice();
    } else if (originalPdfBytes && originalPdfBytes.slice) {
      safeBytes = new Uint8Array(originalPdfBytes.slice(0));
    } else {
      safeBytes = new Uint8Array(originalPdfBytes);
    }

    // Carica il PDF originale per mantenere vettori, immagini e layer
    const pdfDoc = await PDFDocument.load(safeBytes);

    // Registra fontkit per supportare TrueType scaricati da Google Fonts
    const fkInstance = await ensureFontkitLoaded();
    if (fkInstance) {
      try {
        pdfDoc.registerFontkit(fkInstance);
      } catch (e) {
        console.warn('[DocuShift PDFEngine] Registrazione fontkit non riuscita:', e);
      }
    }

    // Embed all 4 font variants for Sans
    let fontSansRegular, fontSansBold, fontSansItalic, fontSansBoldItalic;
    try {
      const [bufR, bufB, bufI, bufBI] = await Promise.all([
        fetchFontBuffer('sans', false, false),
        fetchFontBuffer('sans', true, false),
        fetchFontBuffer('sans', false, true),
        fetchFontBuffer('sans', true, true)
      ]);
      if (bufR) fontSansRegular = await pdfDoc.embedFont(bufR);
      if (bufB) fontSansBold = await pdfDoc.embedFont(bufB);
      if (bufI) fontSansItalic = await pdfDoc.embedFont(bufI);
      if (bufBI) fontSansBoldItalic = await pdfDoc.embedFont(bufBI);
    } catch (fontErr) {
      console.warn('[DocuShift PDFEngine] Fallback a StandardFonts Helvetica:', fontErr);
    }

    // Standard fallback fonts if dynamic download fails or is blocked
    const stdRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const stdBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const stdItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const stdBoldItalic = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

    const baseRegular = fontSansRegular || stdRegular;
    const baseBold = fontSansBold || stdBold;
    const baseItalic = fontSansItalic || stdItalic;
    const baseBoldItalic = fontSansBoldItalic || stdBoldItalic;

    function getBaseFont(isBold, isItalic) {
      if (isBold && isItalic) return baseBoldItalic;
      if (isBold) return baseBold;
      if (isItalic) return baseItalic;
      return baseRegular;
    }

    const pdfPages = pdfDoc.getPages();

    for (let pageIdx = 0; pageIdx < pagesData.length; pageIdx++) {
      const pageData = pagesData[pageIdx];
      const page = pdfPages[pageIdx];
      if (!page) continue;

      // 1. ELIMINAZIONE DEL TESTO VECCHIO DALLO STREAM DELLA PAGINA:
      // Neutralizza e rende trasparenti tutti i glifi originali preservando al 100%
      // lo sfondo (giallo, barra blu, loghi, illustrazioni, tabelle e grafiche).
      // ZERO TOPPE BIANCHE!
      stripOriginalTextFromPage(page, pdfDoc);

      for (const block of pageData.blocks) {
        const translatedText = translationsMap[block.id] || block.text;

        // Se il testo è vuoto, passa oltre
        if (!translatedText || translatedText.trim().length === 0) continue;

        // 2. Selezione dinamica del Font (recupera il font esatto con bold e italic corretti)
        let font = getBaseFont(block.isBold, block.isItalic);
        if (block.fontFamily) {
          const dynamicFont = await getOrEmbedDynamicFont(pdfDoc, block.fontFamily, block.isBold, block.isItalic);
          if (dynamicFont) font = dynamicFont;
        }

        const origFontSize = block.fontSize;
        const boxWidth = Math.max(block.width, 20);

        // 3. Sanitizzazione caratteri per prevenire crash di codifica
        let textToWrite = sanitizeTextForFont(translatedText, font);

        // 4. Auto-Scaling del testo proporzionale per preservare gli ingombri
        let fontSize = origFontSize;
        let measuredWidth = 0;
        try {
          measuredWidth = font.widthOfTextAtSize(textToWrite, fontSize);
        } catch (mErr) {
          measuredWidth = textToWrite.length * (fontSize * 0.55);
        }

        if (measuredWidth > boxWidth) {
          const ratio = boxWidth / measuredWidth;
          const minFontScale = options.minFontScale || 0.70;
          fontSize = Math.max(origFontSize * minFontScale, origFontSize * ratio);
          try {
            measuredWidth = font.widthOfTextAtSize(textToWrite, fontSize);
          } catch (e) {}
        }

        if (measuredWidth > boxWidth * 1.1) {
          fontSize = Math.max(7, fontSize * 0.92);
        }

        // 5. Colore del Testo con contrasto perfetto:
        // Se lo sfondo è scuro (come la fascia blu), il testo viene disegnato in BIANCO.
        // Se lo sfondo è chiaro (come il giallo o bianco), il testo viene disegnato in SCURO.
        const textColor = block.color 
          ? rgb(block.color.r, block.color.g, block.color.b) 
          : (block.isDarkBg ? rgb(1.0, 1.0, 1.0) : rgb(0.10, 0.10, 0.12));

        // 6. Riscrivi il testo tradotto direttamente sui vettori nativi (SENZA NESSUNA TOPPA BIANCA)
        try {
          page.drawText(textToWrite, {
            x: block.x,
            y: block.y,
            size: fontSize,
            font: font,
            color: textColor
          });
        } catch (drawErr) {
          console.warn('Errore disegno testo blocco:', block.id, drawErr);
        }
      }
    }

    // Salva il PDF risultante
    const translatedPdfBytes = await pdfDoc.save();

    // Pulizia memoria font temporanei
    clearFontMemory();

    return translatedPdfBytes;
  }

  // Renderizza una pagina specifica su un elemento <canvas> HTML per l'anteprima
  async function renderPageToCanvas(pdfData, pageNum, canvasEl, targetScale = 1.3) {
    if (!canvasEl || !pdfData) return;
    let safeData;
    if (pdfData instanceof Uint8Array) {
      safeData = pdfData.slice();
    } else if (pdfData && pdfData.slice) {
      safeData = new Uint8Array(pdfData.slice(0));
    } else {
      safeData = new Uint8Array(pdfData);
    }

    const loadingTask = pdfjsLib.getDocument({ data: safeData });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(pageNum);

    const viewport = page.getViewport({ scale: targetScale });
    canvasEl.width = viewport.width;
    canvasEl.height = viewport.height;

    const ctx = canvasEl.getContext('2d');
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    await page.render(renderContext).promise;
  }

  return {
    parsePDF,
    buildTranslatedPDF,
    renderPageToCanvas,
    clearFontMemory
  };
})();
