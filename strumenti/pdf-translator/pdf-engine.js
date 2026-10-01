/**
 * pdf-engine.js — DocuShift AI
 * Motore di elaborazione PDF: estrazione coordinate con PDF.js,
 * download dinamico di Google Fonts in memoria temporanea con fontkit,
 * algoritmo di auto-scaling del testo per preservare il layout,
 * sovrascrittura grafica non distruttiva con pdf-lib e rendering anteprima side-by-side.
 */

const PDFEngine = (() => {
  // CDN font TrueType per supporto completo caratteri accentati Unicode
  const FONT_URLS = {
    sans: 'https://cdn.jsdelivr.net/fontsource/fonts/outfit@latest/latin-400-normal.ttf',
    sansBold: 'https://cdn.jsdelivr.net/fontsource/fonts/outfit@latest/latin-700-normal.ttf',
    serif: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.ttf',
    mono: 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.ttf'
  };

  let cachedFontBuffers = {};

  // Configura il worker di PDF.js
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  // Scarica il font in un buffer temporaneo in RAM
  async function fetchFontBuffer(fontType = 'sans') {
    const url = FONT_URLS[fontType] || FONT_URLS.sans;
    if (cachedFontBuffers[fontType]) {
      return cachedFontBuffers[fontType];
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Impossibile scaricare il font da Google Fonts CDN (${response.status})`);
    }
    const buffer = await response.arrayBuffer();
    cachedFontBuffers[fontType] = buffer;
    return buffer;
  }

  // Rilascia la memoria dei font temporanei
  function clearFontMemory() {
    cachedFontBuffers = {};
    if (window.gc) {
      try { window.gc(); } catch (e) {}
    }
  }

  // Estrae pagine, dimensioni e blocchi di testo con coordinate
  async function parsePDF(pdfArrayBuffer) {
    const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const pagesData = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const textContent = await page.getTextContent({ normalizeWhitespace: true });

      const rawItems = textContent.items.map((item, idx) => {
        // [scaleX, skewY, skewX, scaleY, tx, ty]
        const tx = item.transform[4];
        const ty = item.transform[5];
        const fontSize = Math.hypot(item.transform[0], item.transform[1]) || 12;
        const fontName = (item.fontName || '').toLowerCase();
        const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy');
        const isItalic = fontName.includes('italic') || fontName.includes('oblique');
        const isSerif = fontName.includes('serif') || fontName.includes('times') || fontName.includes('roman') || fontName.includes('georgia');
        const isMono = fontName.includes('mono') || fontName.includes('courier') || fontName.includes('code');

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
          originalItems: [item]
        };
      }
    }

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }

  // Costruisce il nuovo documento PDF tradotto preservando immagini e grafica originale
  async function buildTranslatedPDF(originalPdfBytes, pagesData, translationsMap, options = {}) {
    const { PDFDocument, rgb } = PDFLib;

    // Carica il PDF originale per mantenere vettori, immagini e layer
    const pdfDoc = await PDFDocument.load(originalPdfBytes);

    // Registra fontkit per supportare TrueType scaricati da Google Fonts
    if (typeof fontkit !== 'undefined') {
      pdfDoc.registerFontkit(fontkit);
    }

    // Scarica font Google Fonts dinamici
    const sansBuffer = await fetchFontBuffer('sans');
    const sansBoldBuffer = await fetchFontBuffer('sansBold');

    const embeddedFontRegular = await pdfDoc.embedFont(sansBuffer);
    const embeddedFontBold = await pdfDoc.embedFont(sansBoldBuffer);

    const pdfPages = pdfDoc.getPages();

    for (let pageIdx = 0; pageIdx < pagesData.length; pageIdx++) {
      const pageData = pagesData[pageIdx];
      const page = pdfPages[pageIdx];
      const { height: pageHeight } = page.getSize();

      for (const block of pageData.blocks) {
        const translatedText = translationsMap[block.id] || block.text;

        // Se il testo è invariato o vuoto, passa oltre
        if (!translatedText || translatedText.trim().length === 0) continue;

        const font = block.isBold ? embeddedFontBold : embeddedFontRegular;
        const origFontSize = block.fontSize;
        const boxWidth = Math.max(block.width, 20);
        const boxHeight = Math.max(block.height, origFontSize * 1.1);

        // 1. Algoritmo di Auto-Scaling del testo per evitare sbordature grafiche
        let fontSize = origFontSize;
        let measuredWidth = font.widthOfTextAtSize(translatedText, fontSize);

        // Se il testo tradotto è più lungo della scatola originale, riduci proporzionalmente la dimensione
        if (measuredWidth > boxWidth) {
          const ratio = boxWidth / measuredWidth;
          // Limita il ridimensionamento al 70% per garantire la leggibilità
          const minFontScale = options.minFontScale || 0.70;
          fontSize = Math.max(origFontSize * minFontScale, origFontSize * ratio);
          measuredWidth = font.widthOfTextAtSize(translatedText, fontSize);
        }

        // 2. Maschera/sbianca il testo originale sottostante (senza toccare le immagini circostanti)
        // Crea un rettangolo di copertura con leggero padding
        const padding = 1.2;
        page.drawRectangle({
          x: Math.max(0, block.x - padding),
          y: Math.max(0, block.y - (fontSize * 0.25) - padding),
          width: boxWidth + (padding * 2),
          height: boxHeight + (padding * 2),
          color: rgb(1, 1, 1), // Fondo bianco o neutral overlay
          opacity: 0.96
        });

        // 3. Riscrivi il testo tradotto nella posizione originale esatta
        try {
          // Se anche al font minimo sborda di poco, tronca o adatta delicatamente
          let textToWrite = translatedText;
          if (font.widthOfTextAtSize(textToWrite, fontSize) > boxWidth * 1.15) {
            // Spezza in parole se necessario o adatta
            fontSize = Math.max(7, fontSize * 0.9);
          }

          page.drawText(textToWrite, {
            x: block.x,
            y: block.y,
            size: fontSize,
            font: font,
            color: rgb(0.1, 0.1, 0.12)
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
    if (!canvasEl) return;
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
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
