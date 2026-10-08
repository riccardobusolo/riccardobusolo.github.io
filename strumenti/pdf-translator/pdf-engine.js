/**
 * pdf-engine.js — DocuShift AI
 * Motore di elaborazione PDF: estrazione coordinate con PDF.js,
 * download dinamico di Google Fonts in memoria temporanea con fontkit,
 * algoritmo di auto-scaling del testo per preservare il layout,
 * sovrascrittura grafica non distruttiva con pdf-lib e rendering anteprima side-by-side.
 */

const PDFEngine = (() => {
  // CDN font TrueType predefiniti per fallback ad alta compatibilità
  const FONT_URLS = {
    sans: 'https://cdn.jsdelivr.net/fontsource/fonts/outfit@latest/latin-400-normal.ttf',
    sansBold: 'https://cdn.jsdelivr.net/fontsource/fonts/outfit@latest/latin-700-normal.ttf',
    serif: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.ttf',
    mono: 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.ttf'
  };

  // Mappa delle famiglie commerciali agli equivalenti metrici open-source Google Fonts
  const FONT_FAMILY_MAP = {
    'calibri': 'carlito',
    'arial': 'arimo',
    'helvetica': 'inter',
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
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js?v=3.8';
    } catch (e) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  // Scarica dinamicamente il font richiesto dal PDF tramite Google Fonts / Fontsource CDN
  async function fetchFontBuffer(fontFamily = 'sans', isBold = false) {
    const raw = (fontFamily || '').toLowerCase().trim();
    const cleanFamily = raw
      .replace(/^([a-z]{6}\+)/i, '')
      .replace(/mt$|ps$|pro$|lt$|-regular$|-bold$|-italic$/i, '')
      .trim();

    const mappedFamily = FONT_FAMILY_MAP[cleanFamily] || cleanFamily || 'outfit';
    const slug = mappedFamily.replace(/[\s_]+/g, '-').toLowerCase();
    const weight = isBold ? '700' : '400';
    const cacheKey = `${slug}_${weight}`;

    if (cachedFontBuffers[cacheKey]) {
      return cachedFontBuffers[cacheKey];
    }

    // 1. Prova a scaricare il font esatto dalla CDN fontsource
    const candidateUrls = [
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

    // 2. Fallback al font predefinito integrato (Outfit o Lora o Mono)
    let fallbackKey = isBold ? 'sansBold' : 'sans';
    if (raw.includes('serif') || raw.includes('times')) fallbackKey = 'serif';
    if (raw.includes('mono') || raw.includes('courier')) fallbackKey = 'mono';

    const fallbackUrl = FONT_URLS[fallbackKey] || FONT_URLS.sans;
    if (cachedFontBuffers[fallbackKey]) {
      return cachedFontBuffers[fallbackKey];
    }
    const fallbackResp = await fetch(fallbackUrl);
    const fallbackBuf = await fallbackResp.arrayBuffer();
    cachedFontBuffers[fallbackKey] = fallbackBuf;
    return fallbackBuf;
  }

  // Rilascia la memoria dei font temporanei
  function clearFontMemory() {
    cachedFontBuffers = {};
    embeddedDynamicFonts.clear();
    if (window.gc) {
      try { window.gc(); } catch (e) {}
    }
  }

  // Rileva in modo intelligente il colore del testo e dello sfondo tramite campionamento canvas
  function detectBlockColor(x, y, width, height, ctx, pageHeight, sampleScale = 0.75) {
    if (!ctx) return { isDarkBg: false, color: { r: 0.12, g: 0.12, b: 0.15 } };
    try {
      const cx = Math.max(0, Math.round(x * sampleScale));
      const cy = Math.max(0, Math.round((pageHeight - y - height) * sampleScale));
      const cw = Math.max(2, Math.round(Math.max(width, 20) * sampleScale));
      const ch = Math.max(2, Math.round(height * sampleScale));

      const imgData = ctx.getImageData(cx, cy, cw, ch);
      const data = imgData.data;
      if (!data || data.length === 0) return { isDarkBg: false, color: { r: 0.12, g: 0.12, b: 0.15 } };

      let totalR = 0, totalG = 0, totalB = 0, count = 0;
      const step = Math.max(1, Math.floor(data.length / (4 * 40)));

      for (let p = 0; p < data.length; p += step * 4) {
        const r = data[p] / 255;
        const g = data[p + 1] / 255;
        const b = data[p + 2] / 255;
        totalR += r;
        totalG += g;
        totalB += b;
        count++;
      }

      const avgR = count > 0 ? (totalR / count) : 1;
      const avgG = count > 0 ? (totalG / count) : 1;
      const avgB = count > 0 ? (totalB / count) : 1;
      const avgLum = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;

      // Se lo sfondo è scuro (blu scuro, nero, grigio scuro - lum < 0.45):
      // il testo deve risaltare in bianco nitido!
      if (avgLum < 0.45) {
        return {
          isDarkBg: true,
          color: { r: 0.98, g: 0.98, b: 0.98 } // Bianco Puro
        };
      } else {
        return {
          isDarkBg: false,
          color: { r: 0.12, g: 0.12, b: 0.15 } // Scuro Grafite
        };
      }
    } catch (e) {
      return { isDarkBg: false, color: { r: 0.12, g: 0.12, b: 0.15 } };
    }
  }

  // Estrae pagine, dimensioni e blocchi di testo con coordinate
  async function parsePDF(pdfArrayBuffer) {
    // Clona sempre il buffer prima di passarlo a PDF.js: i Web Worker infatti
    // scollegano (detach) la memoria dell'ArrayBuffer trasferito rendendola inutilizzabile
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
        // [scaleX, skewY, skewX, scaleY, tx, ty]
        const tx = item.transform[4];
        const ty = item.transform[5];
        const fontSize = Math.hypot(item.transform[0], item.transform[1]) || 12;
        const fontName = (item.fontName || '').toLowerCase();
        
        // Estrae il nome pulito della famiglia di font
        const styleInfo = textContent.styles && textContent.styles[item.fontName];
        const rawFamily = (styleInfo && styleInfo.fontFamily) || item.fontName || 'sans';
        const cleanFamily = rawFamily.replace(/^([a-z]{6}\+)/i, '').replace(/mt$|ps$|pro$|lt$/i, '').trim();

        const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy');
        const isItalic = fontName.includes('italic') || fontName.includes('oblique');
        const isSerif = fontName.includes('serif') || fontName.includes('times') || fontName.includes('roman') || fontName.includes('georgia');
        const isMono = fontName.includes('mono') || fontName.includes('courier') || fontName.includes('code');

        // Campiona la luminosità dello sfondo sotto il testo per impostare il colore con contrasto perfetto
        const colorInfo = detectBlockColor(tx, ty, item.width, item.height || fontSize, sampleCtx, viewport.height, 0.75);

        return {
          id: `p${pageNum}_b${idx + 1}`,
          page: pageNum,
          str: item.str,
          x: tx,
          y: ty,
          width: item.width,
          height: item.height || fontSize,
          fontSize: fontSize,
          isBold,
          isItalic,
          isSerif,
          isMono,
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
      const sameStyle = (item.isBold === currentGroup.isBold);

      if (sameLine && isNearby && sameStyle) {
        // Aggiunge spazio se necessario
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
      'pdf-lib.min.js?v=3.8',
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
      'fontkit.umd.min.js?v=3.8',
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
  // Senza toccare forme, sfondi colorati (giallo, blu), immagini o elementi grafici
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

      const cleanedStreamChunks = [];

      for (const ref of streamRefs) {
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

        // Converti in stringa Latin-1 (preserva esattamente i codici e operatori binari PDF)
        let streamText = '';
        const chunkSize = 8192;
        for (let i = 0; i < decodedBytes.length; i += chunkSize) {
          const slice = decodedBytes.subarray(i, Math.min(i + chunkSize, decodedBytes.length));
          streamText += String.fromCharCode.apply(null, slice);
        }

        // CANCELLAZIONE CHIRURGICA DEL VECCHIO TESTO NEL FLUSSO VETTORIALE:
        // 1) Imposta Text Rendering Mode a 3 (3 Tr = Neither fill nor stroke text, completamente invisibile)
        // 2) Svuota gli argomenti di disegno testo per non occupare memoria di rendering
        let cleaned = streamText.replace(/\bBT\b/g, 'BT 3 Tr ');
        cleaned = cleaned.replace(/\((?:\\.|[^()\\])*\)\s*Tj/g, '() Tj');
        cleaned = cleaned.replace(/<[0-9a-fA-F\s]*>\s*Tj/g, '<> Tj');
        cleaned = cleaned.replace(/\[[\s\S]*?\]\s*TJ/g, '[] TJ');
        cleaned = cleaned.replace(/\((?:\\.|[^()\\])*\)\s*'/g, "() '");

        cleanedStreamChunks.push(cleaned);
      }

      if (cleanedStreamChunks.length > 0) {
        const combinedText = cleanedStreamChunks.join('\n');
        const newBytes = new Uint8Array(combinedText.length);
        for (let i = 0; i < combinedText.length; i++) {
          newBytes[i] = combinedText.charCodeAt(i) & 0xff;
        }

        const newStream = pdfDoc.context.flateStream(newBytes);
        const newStreamRef = pdfDoc.context.register(newStream);
        page.node.set(PDFName.of('Contents'), newStreamRef);
      }
    } catch (stripErr) {
      console.warn('[DocuShift PDFEngine] Errore pulizia testo stream originale:', stripErr);
    }
  }

  // Incorpora dinamicamente un font TrueType nel documento PDF con cache in memoria
  async function getOrEmbedDynamicFont(pdfDoc, fontFamily, isBold) {
    if (!fontFamily) return null;
    const cleanFamily = fontFamily
      .replace(/^([a-z]{6}\+)/i, '')
      .replace(/mt$|ps$|pro$|lt$|-regular$|-bold$|-italic$/i, '')
      .trim();
    const weightKey = isBold ? 'bold' : 'normal';
    const cacheKey = `${cleanFamily.toLowerCase()}_${weightKey}`;

    if (embeddedDynamicFonts.has(cacheKey)) {
      return embeddedDynamicFonts.get(cacheKey);
    }

    try {
      const buffer = await fetchFontBuffer(cleanFamily, isBold);
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

    // Assicura che l'ArrayBuffer sia integro, valido e mai scollegato (non-detached)
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

    // Scarica font Google Fonts di base predefiniti
    let embeddedFontRegular, embeddedFontBold;
    try {
      const sansBuffer = await fetchFontBuffer('sans', false);
      const sansBoldBuffer = await fetchFontBuffer('sans', true);
      embeddedFontRegular = await pdfDoc.embedFont(sansBuffer);
      embeddedFontBold = await pdfDoc.embedFont(sansBoldBuffer);
    } catch (fontErr) {
      console.warn('[DocuShift PDFEngine] Fallback a font standard integrato:', fontErr);
      embeddedFontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      embeddedFontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    const pdfPages = pdfDoc.getPages();

    for (let pageIdx = 0; pageIdx < pagesData.length; pageIdx++) {
      const pageData = pagesData[pageIdx];
      const page = pdfPages[pageIdx];

      // 1. ELIMINAZIONE DEL TESTO VECCHIO DALLO STREAM DELLA PAGINA:
      // Rimuove e rende trasparenti tutti i glifi originali preservando al 100%
      // lo sfondo (giallo, barra blu, loghi, illustrazioni e foto). ZERO TOPPE BIANCHE!
      stripOriginalTextFromPage(page, pdfDoc);

      for (const block of pageData.blocks) {
        const translatedText = translationsMap[block.id] || block.text;

        // Se il testo è invariato o vuoto, passa oltre
        if (!translatedText || translatedText.trim().length === 0) continue;

        // 2. Selezione dinamica del Font (recupera il font esatto o il fallback)
        let font = block.isBold ? embeddedFontBold : embeddedFontRegular;
        if (block.fontFamily) {
          const dynamicFont = await getOrEmbedDynamicFont(pdfDoc, block.fontFamily, block.isBold);
          if (dynamicFont) font = dynamicFont;
        }

        const origFontSize = block.fontSize;
        const boxWidth = Math.max(block.width, 20);

        // 3. Auto-Scaling del testo proporzionale per preservare gli ingombri
        let fontSize = origFontSize;
        let measuredWidth = font.widthOfTextAtSize(translatedText, fontSize);

        if (measuredWidth > boxWidth) {
          const ratio = boxWidth / measuredWidth;
          const minFontScale = options.minFontScale || 0.70;
          fontSize = Math.max(origFontSize * minFontScale, origFontSize * ratio);
          measuredWidth = font.widthOfTextAtSize(translatedText, fontSize);
        }

        // 4. Colore del Testo con contrasto perfetto:
        // Se lo sfondo è scuro (come la fascia blu), il testo viene disegnato in BIANCO.
        // Se lo sfondo è chiaro (come il giallo o bianco), il testo viene disegnato in SCURO.
        const textColor = block.color 
          ? rgb(block.color.r, block.color.g, block.color.b) 
          : rgb(0.12, 0.12, 0.15);

        // 5. Riscrivi il testo tradotto direttamente sui vettori nativi (SENZA NESSUNA TOPPA BIANCA)
        try {
          let textToWrite = translatedText;
          if (font.widthOfTextAtSize(textToWrite, fontSize) > boxWidth * 1.15) {
            fontSize = Math.max(7, fontSize * 0.9);
          }

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
    // Clona sempre i dati prima di inviarli al worker di PDF.js per non detachare l'ArrayBuffer
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
