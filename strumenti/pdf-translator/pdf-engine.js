/* DocuShift 4: vector-preserving PDF editing, font metadata lookup and measured fitting. */
const PDFEngine = (() => {
  if (typeof pdfjsLib !== 'undefined') pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js?v=4.0';
  const check = signal => { if (signal?.aborted) throw new DOMException('Operazione annullata.', 'AbortError'); };
  const normalize = s => String(s || '').normalize('NFC').replace(/[ﬀﬁﬂﬃﬄﬅﬆ]/g, c => ({ 'ﬀ': 'ff', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬃ': 'ffi', 'ﬄ': 'ffl', 'ﬅ': 'st', 'ﬆ': 'st' }[c]));
  const bytesToString = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode(...bytes.subarray(i, i + 8192)); return s; };
  const stringToBytes = text => Uint8Array.from(text, c => c.charCodeAt(0));

  // PDF lexical scanner: strings, arrays, dictionaries and comments are atomic.
  // Never search BT/ET inside strings or binary images with regular expressions.
  function tokens(source) {
    let i = 0; const result = [], ws = c => /[\x00\t\n\f\r ]/.test(c), delim = c => !c || ws(c) || '()<>[]{}/%'.includes(c);
    function skip() { while (i < source.length) { if (ws(source[i])) i++; else if (source[i] === '%') { while (i < source.length && !/[\r\n]/.test(source[i])) i++; } else break; } }
    function read() {
      skip(); const start = i; if (i >= source.length) return null;
      const c = source[i++]; let type = 'value';
      if (c === '(') {
        let depth = 1;
        while (i < source.length && depth) { const ch = source[i++]; if (ch === '\\') { if (source[i] === '\r' && source[i + 1] === '\n') i++; i++; } else if (ch === '(') depth++; else if (ch === ')') depth--; }
        if (depth) throw new Error('Stringa PDF non terminata.');
      } else if (c === '[' || (c === '<' && source[i] === '<')) {
        const end = c === '[' ? ']' : '>>'; if (end === '>>') i++;
        while (true) { skip(); if (source.startsWith(end, i)) { i += end.length; break; } if (!read()) throw new Error('Array o dizionario PDF non terminato.'); }
      } else if (c === '<') { while (i < source.length && source[i] !== '>') i++; if (i >= source.length) throw new Error('Stringa esadecimale PDF non terminata.'); i++; }
      else if (c === '/') { while (i < source.length && !delim(source[i])) i++; }
      else {
        while (i < source.length && !delim(source[i])) i++;
        if (i === start + 1 && ']>)}'.includes(c)) throw new Error('Sintassi stream PDF non supportata.');
        const value = source.slice(start, i);
        if (!/^[+-]?(?:\d*\.\d+|\d+\.?\d*)$/.test(value) && !['true', 'false', 'null'].includes(value)) type = 'operator';
      }
      return { start, end: i, value: source.slice(start, i), type };
    }
    let token; while ((token = read())) {
      // Ambiguous binary inline images must not be rewritten by a text lexer.
      if (token.type === 'operator' && token.value === 'BI') throw new Error('Questo PDF contiene immagini inline: la modifica sicura di questo formato non è supportata. Il file originale resta integro.');
      result.push(token);
    }
    return result;
  }
  function removeTextOperators(source) {
    const list = tokens(source), changes = []; let args = [];
    for (const t of list) {
      if (t.type !== 'operator') { args.push(t); continue; }
      if (t.value === 'Tr' && Number(args.at(-1)?.value) >= 4) throw new Error('Il PDF usa testo come maschera grafica: impossibile sostituirlo mantenendo invariata la grafica.');
      const count = { Tj: 1, TJ: 1, "'": 1, '"': 3 }[t.value];
      if (count) {
        if (args.length !== count) throw new Error('Operatore di testo PDF non valido.');
        const replacement = t.value === "'" ? ' T* ' : t.value === '"' ? ` ${args[0].value} Tw ${args[1].value} Tc T* ` : ' ';
        changes.push({ start: args[0].start, end: t.end, replacement });
      }
      args = [];
    }
    for (const change of changes.reverse()) source = source.slice(0, change.start) + change.replacement + source.slice(change.end);
    return source;
  }
  function decodedStream(stream) {
    return stream.getUnencodedContents ? stream.getUnencodedContents() : PDFLib.decodePDFRawStream(stream).decode();
  }
  function removePageText(doc, page, seen = new Set()) {
    const { PDFName, PDFArray, PDFDict, PDFRawStream } = PDFLib;
    function rewrite(stream) {
      if (seen.has(stream)) return stream; seen.add(stream);
      const original = bytesToString(decodedStream(stream)), modified = removeTextOperators(original);
      if (original === modified) return stream;
      const dict = {};
      for (const [key, value] of stream.dict.entries()) if (!['/Length', '/Filter', '/DecodeParms'].includes(key.toString())) dict[key.decodeText()] = value;
      return doc.context.flateStream(stringToBytes(modified), dict);
    }
    function forms(resources, visited = new Set()) {
      if (!resources || visited.has(resources)) return; visited.add(resources);
      const objects = resources.lookupMaybe(PDFName.of('XObject'), PDFDict); if (!objects) return;
      for (const [name, ref] of objects.entries()) {
        const stream = doc.context.lookup(ref);
        if (!(stream instanceof PDFRawStream) || stream.dict.get(PDFName.of('Subtype'))?.toString() !== '/Form') continue;
        const ownResources = stream.dict.lookupMaybe(PDFName.of('Resources'), PDFDict);
        forms(ownResources, visited);
        const modified = rewrite(stream);
        if (modified !== stream) { if (ref instanceof PDFLib.PDFRef) doc.context.assign(ref, modified); else objects.set(name, doc.context.register(modified)); }
      }
    }
    forms(page.node.Resources());
    const contents = page.node.Contents(); if (!contents) return;
    const refs = contents instanceof PDFArray ? contents.asArray() : [contents];
    // Text objects can span multiple /Contents streams. Parse their concatenation.
    const source = refs.map(ref => bytesToString(decodedStream(doc.context.lookup(ref)))).join('\n');
    page.node.set(PDFName.of('Contents'), doc.context.register(doc.context.flateStream(stringToBytes(removeTextOperators(source)))));
  }

  function colorsFromOperators(opList) {
    const OPS = pdfjsLib.OPS, records = []; let fill = [0, 0, 0], opacity = 1, mode = 0, stack = [];
    for (let i = 0; i < opList.fnArray.length; i++) {
      const op = opList.fnArray[i], args = opList.argsArray[i];
      if (op === OPS.save || op === OPS.paintFormXObjectBegin) stack.push({ fill: [...fill], opacity, mode });
      if (op === OPS.restore || op === OPS.paintFormXObjectEnd) { const previous = stack.pop() || { fill: [0, 0, 0], opacity: 1, mode: 0 }; ({ fill, opacity, mode } = previous); }
      if (op === OPS.setFillRGBColor) fill = Array.from(args).map(n => n / 255);
      if (op === OPS.setTextRenderingMode) mode = args[0];
      if (op === OPS.setGState) for (const [name, value] of args[0] || []) if (name === 'ca') opacity = value;
      if ([OPS.showText, OPS.showSpacedText, OPS.nextLineShowText].includes(op)) {
        const text = (args?.[0] || []).filter(g => typeof g === 'object').map(g => g.unicode || '').join('');
        if (text.trim() && mode !== 0) throw new Error('Il PDF usa testo invisibile, contornato o come maschera: la sostituzione fedele di questo formato non è ancora supportata.');
        for (const char of normalize(text).replace(/\s/g, '')) records.push({ char, color: [...fill], opacity });
      }
    }
    return records;
  }
  async function parsePDF(data, { signal, onSample, onProgress } = {}) {
    // Check stream syntax before sending any document text to a paid API.
    const structure = await PDFLib.PDFDocument.load(new Uint8Array(data.slice(0)));
    const inspectedForms = new Set();
    for (const page of structure.getPages()) { check(signal); removePageText(structure, page, inspectedForms); }
    const loading = pdfjsLib.getDocument({ data: new Uint8Array(data.slice(0)), fontExtraProperties: true, isEvalSupported: false });
    const cancel = () => loading.destroy(); signal?.addEventListener('abort', cancel, { once: true });
    let doc;
    try {
      doc = await loading.promise; const pages = []; let sampled = false;
      for (let n = 1; n <= doc.numPages; n++) {
        check(signal); const page = await doc.getPage(n);
        const content = await page.getTextContent(), ops = await page.getOperatorList(), colors = colorsFromOperators(ops);
        let colorCursor = 0;
        const blocks = [];
        for (let idx = 0; idx < content.items.length; idx++) {
          const item = content.items[idx]; if (!item.str?.trim()) continue;
          const style = content.styles[item.fontName] || {};
          if (style.vertical || item.dir === 'ttb') throw new Error('La scrittura verticale non è ancora supportata.');
          let fontInfo; try { fontInfo = page.commonObjs.get(item.fontName); } catch (_) {}
          if (fontInfo?.isType3Font) throw new Error('Questo PDF contiene font Type 3 disegnati come grafica: sostituzione fedele non supportata.');
          const fontFamily = fontInfo?.name || style.fontFamily || 'sans-serif';
          const [a, b, c, d, x, y] = item.transform, fontSize = Math.hypot(c, d) || Math.hypot(a, b);
          if (!fontSize || Math.abs(a * d - b * c) < 1e-8) throw new Error('Matrice di testo PDF non valida.');
          const text = normalize(item.str), key = text.replace(/\s/g, '');
          let color = colors[colorCursor]?.color || [0, 0, 0], opacity = colors[colorCursor]?.opacity ?? 1;
          // TextContent may insert spaces; match actual glyph characters, never pixel backgrounds.
          const start = colors.slice(colorCursor, colorCursor + key.length + 30).findIndex((v, i, arr) => arr.slice(i, i + key.length).map(r => r.char).join('') === key);
          if (start >= 0) { color = colors[colorCursor + start].color; opacity = colors[colorCursor + start].opacity; colorCursor += start + key.length; }
          const block = { id: `p${n}_b${idx}`, text, x, y, width: item.width, fontSize, matrix: [a / fontSize, b / fontSize, c / fontSize, d / fontSize],
            fontFamily, isBold: !!fontInfo?.bold || /bold|black|heavy/i.test(fontFamily), isItalic: !!fontInfo?.italic || /italic|oblique/i.test(fontFamily), color,
            ascent: style.ascent || 0.8, descent: style.descent || -0.2, fontId: item.fontName, opacity };
          const prev = blocks.at(-1), gap = prev ? x - prev.x - prev.width : 0;
          if (prev && prev.opacity === opacity && Math.abs(b) < 0.01 && Math.abs(c) < 0.01 && prev.matrix.every((v, i) => Math.abs(v - block.matrix[i]) < 0.001) && prev.fontId === block.fontId && Math.abs(prev.y - y) < fontSize * 0.15 && Math.abs(prev.fontSize - fontSize) < 0.1 && gap >= -0.1 && gap < fontSize * 0.65 && prev.color.every((v, i) => v === color[i])) {
            prev.text += (gap > fontSize * 0.1 && !prev.text.endsWith(' ') ? ' ' : '') + text; prev.width = x + item.width - prev.x;
          } else blocks.push(block);
        }
        if (!sampled && blocks.length) { sampled = true; onSample?.(blocks.map(b => b.text).join(' ').slice(0, 3500)); }
        pages.push({ pageNum: n, blocks, width: page.view[2] - page.view[0], height: page.view[3] - page.view[1] });
        onProgress?.(n, doc.numPages); page.cleanup();
      }
      return { numPages: doc.numPages, pages };
    } finally { signal?.removeEventListener('abort', cancel); await (doc ? doc.destroy() : loading.destroy()); }
  }

  const aliases = { arial: 'arimo', helvetica: 'arimo', 'helvetica neue': 'arimo', calibri: 'carlito', times: 'tinos', 'times new roman': 'tinos', courier: 'cousine', 'courier new': 'cousine', verdana: 'open-sans', tahoma: 'noto-sans', 'segoe ui': 'noto-sans', segoe: 'noto-sans', myriad: 'source-sans-3', 'myriad pro': 'source-sans-3', din: 'fira-sans', futura: 'jost', 'sans-serif': 'noto-sans', sans: 'noto-sans', serif: 'noto-serif', monospace: 'noto-sans-mono' };
  function fontFamilyName(name) {
    const clean = name.replace(/^[A-Z]{6}\+/i, '').replace(/[-, ]?(bolditalic|boldoblique|semibold|regular|italic|oblique|bold|roman|medium|light)(mt|ps)?$/i, '').replace(/PSMT$|MT$|PS$/i, '').replace(/([a-z])([A-Z])/g, '$1 $2').trim().toLowerCase();
    return clean;
  }
  function fontSlug(name) {
    const clean = fontFamilyName(name);
    return aliases[clean] || clean.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function rangeContains(range, cp) {
    return String(range || '').split(',').some(part => {
      const value = part.trim().replace(/^U\+/i, ''), [a, b] = value.split('-');
      if (a.includes('?')) return cp >= parseInt(a.replace(/\?/g, '0'), 16) && cp <= parseInt(a.replace(/\?/g, 'F'), 16);
      return cp >= parseInt(a, 16) && cp <= parseInt(b || a, 16);
    });
  }
  function createFontResolver(doc, signal, warnings, onStatus) {
    const metadata = new Map(), fonts = new Map();
    async function get(url, json = false) {
      check(signal); const ctrl = new AbortController(), stop = () => ctrl.abort(); signal?.addEventListener('abort', stop, { once: true });
      const timer = setTimeout(stop, 20000);
      try { const resp = await fetch(url, { signal: ctrl.signal, cache: 'no-store' }); if (!resp.ok) return null; return await (json ? resp.json() : resp.arrayBuffer()); }
      catch (e) { check(signal); return null; }
      finally { clearTimeout(timer); signal?.removeEventListener('abort', stop); }
    }
    async function meta(slug) {
      if (!metadata.has(slug)) metadata.set(slug, get(`https://api.fontsource.org/v1/fonts/${encodeURIComponent(slug)}`, true));
      return metadata.get(slug);
    }
    async function load(slug, bold, italic, needed) {
      const m = await meta(slug); if (!m?.variants) return [];
      const weights = (m.weights || []).map(Number).sort((a, b) => Math.abs(a - (bold ? 700 : 400)) - Math.abs(b - (bold ? 700 : 400)));
      const weight = weights[0], style = m.styles?.includes(italic ? 'italic' : 'normal') ? (italic ? 'italic' : 'normal') : m.styles?.[0];
      const variants = m.variants[String(weight)]?.[style] || {}, selected = new Set();
      for (const char of needed) {
        const cp = char.codePointAt(0);
        const subset = Object.keys(variants).find(s => rangeContains(m.unicodeRange?.[s], cp)) || (cp < 256 ? m.defSubset || 'latin' : null);
        if (subset && variants[subset]) selected.add(subset);
      }
      const loaded = [];
      for (const subset of selected) {
        const key = `${slug}/${weight}/${style}/${subset}`;
        if (!fonts.has(key)) fonts.set(key, (async () => {
          const url = variants[subset]?.url?.ttf;
          // Do not allow metadata to turn font downloads into arbitrary external requests.
          if (!url || !/^https:\/\/cdn\.jsdelivr\.net\/fontsource\/fonts\//.test(url)) return null;
          onStatus?.(`Font: ${m.family} (${subset})`);
          const buffer = await get(url); if (!buffer) return null;
          try {
            const source = window.fontkit.create(new Uint8Array(buffer));
            const font = await doc.embedFont(buffer, { subset: true });
            return { font, source, chars: new Set(font.getCharacterSet()) };
          } catch (_) { return null; }
        })());
        const font = await fonts.get(key); if (font) loaded.push(font);
      }
      return loaded;
    }
    return async function resolve(block, text) {
      const characters = [...new Set(Array.from(text))]; let available = [];
      const original = fontSlug(block.fontFamily);
      if (original !== fontFamilyName(block.fontFamily).replace(/[^a-z0-9]+/g, '-')) warnings.add(`Font «${block.fontFamily}»: cercato l’equivalente gratuito «${original}».`);
      const candidates = [...new Set([original, /times|serif|roman/i.test(block.fontFamily) && !/sans/i.test(block.fontFamily) ? 'noto-serif' : /courier|mono/i.test(block.fontFamily) ? 'noto-sans-mono' : 'noto-sans', /[\u3040-\u30ff]/u.test(text) ? 'noto-sans-jp' : 'noto-sans-sc'])];
      for (const slug of candidates) {
        const missing = characters.filter(c => !available.some(f => f.chars.has(c.codePointAt(0)))); if (!missing.length) break;
        const found = await load(slug, block.isBold, block.isItalic, missing); available.push(...found);
        if (slug !== original && found.length) warnings.add(`Font «${block.fontFamily}»: usato un equivalente gratuito per i caratteri non disponibili.`);
      }
      const runs = [];
      for (const char of text) {
        const chosen = available.find(f => f.chars.has(char.codePointAt(0)));
        if (!chosen) throw new Error(`Nessun font gratuito disponibile per il carattere «${char}» (U+${char.codePointAt(0).toString(16).toUpperCase()}). Il PDF non è stato esportato per evitare perdita di testo.`);
        if (runs.at(-1)?.font === chosen.font) runs.at(-1).text += char; else runs.push({ font: chosen.font, source: chosen.source, text: char });
      }
      return runs;
    };
  }
  function fitText(block, runs) {
    const scaleX = Math.hypot(block.matrix[0], block.matrix[1]);
    const advance = runs.reduce((sum, run) => sum + run.font.widthOfTextAtSize(run.text, 1), 0);
    let cursor = 0, left = 0, right = advance;
    for (const run of runs) {
      if (run.source) {
        const layout = run.source.layout(run.text), units = run.source.unitsPerEm;
        let glyphX = cursor;
        layout.glyphs.forEach((glyph, i) => {
          const position = layout.positions[i];
          left = Math.min(left, glyphX + (glyph.bbox.minX + position.xOffset) / units);
          right = Math.max(right, glyphX + (glyph.bbox.maxX + position.xOffset) / units);
          glyphX += position.xAdvance / units;
        });
      }
      cursor += run.font.widthOfTextAtSize(run.text, 1);
    }
    const measured = right - left;
    const widthLimit = block.width / scaleX;
    let fontSize = Math.min(block.fontSize, widthLimit / Math.max(measured, 1e-9));
    // Keep actual font ascent/descent inside the original text line's vertical extent.
    const extents = runs.map(run => {
      if (!run.source) return { upper: run.font.heightAtSize(1, { descender: false }), lower: 0 };
      const layout = run.source.layout(run.text), units = run.source.unitsPerEm;
      return {
        upper: Math.max(0, ...layout.glyphs.map((g, i) => (g.bbox.maxY + layout.positions[i].yOffset) / units)),
        lower: Math.max(0, ...layout.glyphs.map((g, i) => -(g.bbox.minY + layout.positions[i].yOffset) / units))
      };
    });
    const upper = extents.map(e => e.upper), lower = extents.map(e => e.lower);
    fontSize = Math.min(fontSize, block.fontSize * Math.max(0.1, block.ascent) / Math.max(...upper, 0.1), block.fontSize * Math.max(0.1, -block.descent) / Math.max(...lower, 0.1));
    fontSize *= 0.995;
    return { fontSize, width: measured * fontSize, offset: -left * fontSize };
  }
  async function buildTranslatedPDF(bytes, pages, translations, { signal, minFontScale = 0.7, onStatus } = {}) {
    check(signal);
    const doc = await PDFLib.PDFDocument.load(new Uint8Array(bytes.slice(0)));
    if (!window.fontkit) throw new Error('Libreria fontkit non disponibile. Ricarica la pagina.');
    doc.registerFontkit(window.fontkit);
    const warnings = new Set(), resolve = createFontResolver(doc, signal, warnings, onStatus), plans = [];
    // Validate every segment/font before touching original content streams.
    for (const page of pages) {
      const plan = [];
      for (const block of page.blocks) {
        check(signal); const raw = translations[block.id];
        if (typeof raw !== 'string' || !raw.trim()) throw new Error(`Traduzione assente per ${block.id}.`);
        const text = raw.replace(/\s+/gu, ' ').trim(), runs = await resolve(block, text), fit = fitText(block, runs);
        if (fit.fontSize < block.fontSize * minFontScale) warnings.add('Alcuni testi sono stati ridotti oltre la soglia di leggibilità impostata per mantenerli nel riquadro originale.');
        plan.push({ block, runs, ...fit });
      }
      plans.push(plan);
    }
    const visited = new Set();
    for (let i = 0; i < pages.length; i++) {
      check(signal); const page = doc.getPage(i); onStatus?.(`Composizione pagina ${i + 1}/${pages.length}`);
      if (!plans[i].length) continue;
      removePageText(doc, page, visited);
      for (const { block, runs, fontSize, offset } of plans[i]) {
        page.pushOperators(PDFLib.pushGraphicsState(), PDFLib.concatTransformationMatrix(...block.matrix, block.x, block.y));
        let x = offset;
        for (const run of runs) { page.drawText(run.text, { x, y: 0, size: fontSize, font: run.font, color: PDFLib.rgb(...block.color), opacity: block.opacity ?? 1 }); x += run.font.widthOfTextAtSize(run.text, fontSize); }
        page.pushOperators(PDFLib.popGraphicsState());
      }
      // Yield for the cancel button during long document builds.
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    check(signal); const output = await doc.save(); check(signal);
    return { bytes: output, warnings: [...warnings] };
  }
  async function openPreview(bytes) {
    return pdfjsLib.getDocument({ data: new Uint8Array(bytes.slice(0)), isEvalSupported: false }).promise;
  }
  async function renderPageToCanvas(doc, pageNum, canvas, scale = 1.25) {
    const page = await doc.getPage(pageNum), viewport = page.getViewport({ scale });
    canvas.width = viewport.width; canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  }
  return { parsePDF, buildTranslatedPDF, openPreview, renderPageToCanvas,
    // Exposed pure helpers are also used by the regression suite.
    removeTextOperators, removePageText, fitText, fontSlug, rangeContains };
})();
