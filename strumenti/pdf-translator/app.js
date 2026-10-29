/* DocuShift 4: one cancellable operation at a time, no shared request controllers. */
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  let file = null, bytes = null, parsed = null, language = null, connected = false;
  let operation = null, downloadUrl = null, previews = [], currentPage = 1, zoom = 1.25, rendering = false;
  const providerNames = { openai: 'OpenAI', gemini: 'Gemini' };
  AIService.initAutoAuth();
  function toast(message, error = false) {
    const item = document.createElement('div'); item.className = `toast toast--${error ? 'error' : 'success'}`;
    const text = document.createElement('span'); text.textContent = message;
    const close = document.createElement('button'); close.className = 'toast__close'; close.textContent = '×'; close.setAttribute('aria-label', 'Chiudi avviso'); close.onclick = () => item.remove();
    item.append(text, close); $('toast-container').append(item); setTimeout(() => item.remove(), error ? 12000 : 5000);
  }
  function status(text) { $('connection-status').textContent = text; }
  function updateControls() {
    const busy = !!operation;
    $('file-input').disabled = !connected || busy;
    $('dropzone').setAttribute('aria-disabled', String(!connected || busy));
    $('btn-remove-file').disabled = busy;
    $('btn-translate').disabled = busy || !connected || !parsed || !language;
    $('target-lang-select').disabled = busy;
    $('btn-connect').disabled = busy;
    $('btn-retry-language').disabled = busy;
    for (const id of ['popup-provider', 'popup-model', 'popup-api-key', 'popup-remember', 'btn-popup-save', 'btn-popup-clipboard', 'settings-provider', 'settings-model', 'input-api-key', 'settings-remember', 'btn-test-gemini', 'btn-clipboard-detect', 'btn-add-glossary-row', 'btn-import-json', 'range-font-scale']) $(id).disabled = busy;
    $('excel-table-container').inert = busy;
    $('btn-cancel-translate').style.display = busy ? 'inline-flex' : 'none';
  }
  function progress(percent, title, subtitle, step = 1) {
    $('progress-card').classList.add('active'); $('progress-percent').textContent = `${percent}%`;
    $('progress-bar-fill').style.width = `${percent}%`; $('progress-title').textContent = title; $('progress-subtitle').textContent = subtitle;
    for (let n = 1; n <= 4; n++) { $(`step-${n}`).classList.toggle('current', n === step); $(`step-${n}`).classList.toggle('done', n < step); }
  }
  async function run(task) {
    if (operation) return;
    const ctrl = new AbortController(); operation = ctrl; updateControls();
    $('progress-error-box').style.display = 'none';
    try { await task(ctrl.signal); }
    catch (err) {
      const cancelled = ctrl.signal.aborted || err.name === 'AbortError';
      ctrl.abort(); // Stop any language request still running alongside PDF parsing.
      if (cancelled) progress(0, 'Operazione annullata', 'Puoi riprovare o scegliere un altro documento.');
      else { $('progress-title').textContent = 'Operazione interrotta'; $('progress-error-text').textContent = err.message; $('progress-error-box').style.display = 'flex'; toast(err.message, true); }
    } finally { if (operation === ctrl) operation = null; updateControls(); }
  }
  $('btn-cancel-translate').onclick = () => { operation?.abort(); $('progress-subtitle').textContent = 'Annullamento in corso…'; };
  $('btn-dismiss-progress-error').onclick = () => $('progress-error-box').style.display = 'none';

  function fillApiForms() {
    const p = AIService.getProvider(), key = AIService.getKey(), model = AIService.getModel();
    for (const prefix of ['popup', 'settings']) {
      $(`${prefix}-provider`).value = p; $(`${prefix}-model`).value = model;
      $(`${prefix}-remember`).checked = !!localStorage.getItem(`docushift_${p}_key`);
      $(`${prefix}-key-link`).href = p === 'openai' ? 'https://platform.openai.com/api-keys' : 'https://aistudio.google.com/app/apikey';
    }
    $('popup-api-key').value = key; $('input-api-key').value = key;
    $('popup-model').placeholder = p === 'gemini' ? 'Automatico dai modelli disponibili' : 'gpt-6-luna';
    $('model-status-quality').textContent = `${providerNames[p]} · ${model || 'modello automatico'}`;
  }
  function openPopup() { fillApiForms(); $('api-setup-popup').classList.add('active'); $('popup-api-key').focus(); }
  function closePopup() { $('api-setup-popup').classList.remove('active'); $('btn-connect').focus(); }
  $('btn-connect').onclick = openPopup; $('btn-close-popup').onclick = closePopup;
  $('btn-open-settings').onclick = () => { fillApiForms(); $('settings-modal').classList.add('active'); $('btn-close-settings').focus(); };
  $('btn-close-settings').onclick = () => { $('settings-modal').classList.remove('active'); $('btn-open-settings').focus(); };
  for (const id of ['settings-modal', 'api-setup-popup']) $(id).addEventListener('click', e => { if (e.target === $(id)) $(id).classList.remove('active'); });
  document.addEventListener('keydown', e => {
    const modal = ['api-setup-popup', 'settings-modal'].map($).find(el => el.classList.contains('active'));
    if (!modal) return;
    if (e.key === 'Escape') { modal.classList.remove('active'); $('btn-connect').focus(); }
    if (e.key === 'Tab') {
      const focusable = [...modal.querySelectorAll('button, input, select, a[href], [tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  });
  for (const prefix of ['popup', 'settings']) $(`${prefix}-provider`).onchange = e => {
    if (operation) return; AIService.setProvider(e.target.value); connected = false; language = null;
    fillApiForms(); updateControls(); status('Connetti la chiave del provider selezionato.');
  };
  async function connect(prefix) {
    if (operation) return;
    const key = $(prefix === 'popup' ? 'popup-api-key' : 'input-api-key').value.trim();
    if (!key) return toast('Inserisci la tua API key.', true);
    AIService.setKey(key, $(`${prefix}-remember`).checked); AIService.setModel($(`${prefix}-model`).value);
    connected = false; language = null;
    await run(async signal => {
      progress(0, 'Verifica connessione', 'Invio di una breve richiesta al modello…');
      const result = await AIService.testConnection({ signal });
      if (!result.ok) { status('Connessione non riuscita. Controlla le impostazioni API.'); throw new Error(result.error); }
      connected = true; $('model-status-quality').textContent = result.model;
      status(`Connesso a ${result.model}. Carica il PDF per rilevare la lingua.`);
      $('api-setup-popup').classList.remove('active'); $('settings-modal').classList.remove('active');
      $('progress-card').classList.remove('active'); fillApiForms();
      if (parsed) await detect(signal);
    });
  }
  $('btn-popup-save').onclick = () => connect('popup'); $('btn-test-gemini').onclick = () => connect('settings');
  $('popup-api-key').onkeydown = e => { if (e.key === 'Enter') connect('popup'); };
  for (const [id, target] of [['btn-popup-clipboard', 'popup-api-key'], ['btn-clipboard-detect', 'input-api-key']]) $(id).onclick = async () => {
    try { $(target).value = (await navigator.clipboard.readText()).trim(); } catch (_) { toast('Incolla la chiave direttamente nel campo.', true); }
  };
  for (const id of ['popup-api-key', 'input-api-key', 'popup-model', 'settings-model']) $(id).addEventListener('input', () => {
    connected = false; language = null; updateControls(); status('Impostazioni modificate: premi Connetti o Verifica.');
  });

  async function discardResult() {
    $('viewer-section').classList.remove('active'); $('result-warnings').hidden = true;
    if (downloadUrl) URL.revokeObjectURL(downloadUrl); downloadUrl = null; $('btn-download-pdf').removeAttribute('href');
    await Promise.all(previews.map(p => p.destroy())); previews = [];
  }
  async function reset() {
    if (operation || rendering) return;
    await discardResult(); file = bytes = parsed = language = null;
    $('file-input').value = ''; $('file-info').classList.remove('active'); $('dropzone').style.display = '';
    $('detected-lang-text').textContent = 'Auto-detect'; $('btn-retry-language').hidden = true; $('progress-card').classList.remove('active'); updateControls();
  }
  async function detect(signal, sample) {
    language = null; $('detected-lang-text').textContent = 'Rilevamento…'; $('btn-retry-language').hidden = true;
    try {
      language = await AIService.detectLanguage(sample || parsed.pages.flatMap(p => p.blocks).map(b => b.text).join(' ').slice(0, 3500), { signal });
      if (signal.aborted) throw new DOMException('Annullato', 'AbortError');
      $('detected-lang-text').textContent = language.name;
      status(`Lingua rilevata: ${language.name}. Scegli la lingua di destinazione e premi Traduci.`);
    } catch (err) { $('detected-lang-text').textContent = 'Lingua non rilevata'; $('btn-retry-language').hidden = false; throw err; }
  }
  async function loadFile(selected) {
    if (operation || rendering) return;
    if (!connected) { openPopup(); return; }
    if (!selected || (!/\.pdf$/i.test(selected.name) && selected.type !== 'application/pdf')) return toast('Seleziona un file PDF.', true);
    await reset();
    await run(async signal => {
      file = selected; $('file-info-name').textContent = file.name; $('file-info-meta').textContent = 'Lettura PDF…';
      $('file-info').classList.add('active'); $('dropzone').style.display = 'none';
      progress(5, 'Lettura del documento', 'Il rilevamento della lingua parte dal primo testo disponibile.');
      let detectedPromise = null;
      try {
        bytes = await file.arrayBuffer();
        parsed = await PDFEngine.parsePDF(bytes, { signal,
          onSample: sample => { detectedPromise = detect(signal, sample).then(() => null, err => err); },
          onProgress: (n, total) => progress(5 + Math.round(10 * n / total), 'Lettura del documento', `Pagina ${n}/${total} · ${language?.name || 'rilevamento lingua in corso…'}`)
        });
        $('file-info-meta').textContent = `${Math.round(file.size / 1024)} KB · ${parsed.numPages} pagine`;
        if (!parsed.pages.some(p => p.blocks.length)) throw new Error('Nessun testo selezionabile. Le scansioni richiedono OCR, non disponibile in questo strumento.');
        const detectionError = detectedPromise ? await detectedPromise : new Error('Nessun testo per rilevare la lingua.');
        if (detectionError) throw detectionError;
        $('progress-card').classList.remove('active');
      } catch (err) { if (!parsed) { bytes = null; language = null; } throw err; }
    });
  }
  $('btn-retry-language').onclick = () => run(async signal => { if (!parsed) return; progress(10, 'Rilevamento lingua', 'Interrogazione del provider selezionato…'); await detect(signal); $('progress-card').classList.remove('active'); });
  $('dropzone').onclick = () => { if (!connected) openPopup(); else if (!operation) $('file-input').click(); };
  $('dropzone').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('dropzone').click(); } };
  $('dropzone').ondragover = e => { e.preventDefault(); if (connected && !operation) $('dropzone').classList.add('dragover'); };
  $('dropzone').ondragleave = () => $('dropzone').classList.remove('dragover');
  $('dropzone').ondrop = e => { e.preventDefault(); $('dropzone').classList.remove('dragover'); loadFile(e.dataTransfer.files?.[0]); };
  $('file-input').onchange = e => loadFile(e.target.files?.[0]); $('btn-remove-file').onclick = reset;

  $('btn-translate').onclick = () => {
    if (!parsed || !language || !connected || operation || rendering) return;
    run(async signal => {
      await discardResult();
      const target = $('target-lang-select').value;
      const all = parsed.pages.flatMap(p => p.blocks), batches = []; let batch = [], count = 0;
      for (const block of all) { if (batch.length && (batch.length >= 18 || count + block.text.length > 9000)) { batches.push(batch); batch = []; count = 0; } batch.push(block); count += block.text.length; }
      if (batch.length) batches.push(batch);
      const translations = Object.create(null), rules = GlossaryManager.getRulesForTarget(target);
      for (let i = 0; i < batches.length; i++) {
        const subtitle = `Blocco ${i + 1}/${batches.length} · ${language.name} → ${target}`;
        progress(20 + Math.round(55 * i / batches.length), 'Traduzione dei testi', subtitle, 2);
        const result = await AIService.translateBatch(batches[i], target, rules, { signal, onStatus: info => { $('progress-subtitle').textContent = `${subtitle} · ${info.message}`; } });
        result.forEach(item => { translations[item.id] = item.translated; });
      }
      progress(80, 'Ricerca dei font e adattamento', 'Metadati PDF → Fontsource → font temporanei → calcolo degli ingombri.', 3);
      const result = await PDFEngine.buildTranslatedPDF(bytes, parsed.pages, translations, { signal, minFontScale: Number($('range-font-scale').value) / 100,
        onStatus: message => { $('progress-subtitle').textContent = message; } });
      if (signal.aborted) throw new DOMException('Annullato', 'AbortError');
      progress(95, 'Preparazione anteprima', 'Apertura del PDF originale e del risultato…', 4);
      const opened = [];
      try {
        opened.push(await PDFEngine.openPreview(bytes)); opened.push(await PDFEngine.openPreview(result.bytes));
        if (signal.aborted) throw new DOMException('Annullato', 'AbortError');
        previews = opened; currentPage = 1; zoom = 1.25; await render();
      } catch (err) { await Promise.all(opened.map(p => p.destroy())); previews = []; throw err; }
      downloadUrl = URL.createObjectURL(new Blob([result.bytes], { type: 'application/pdf' }));
      $('btn-download-pdf').href = downloadUrl; $('btn-download-pdf').download = `${file.name.replace(/\.pdf$/i, '')}_${target.toLowerCase()}.pdf`;
      const warnings = $('result-warnings'); warnings.replaceChildren();
      if (result.warnings.length) { const title = document.createElement('strong'); title.textContent = 'Controlla questi adattamenti prima di usare il PDF:'; warnings.append(title); for (const warning of result.warnings) { const p = document.createElement('p'); p.textContent = warning; warnings.append(p); } warnings.hidden = false; }
      $('viewer-section').classList.add('active');
      progress(100, 'Traduzione completata', result.warnings.length ? 'PDF pronto. Sono presenti avvisi sui font o sulla leggibilità.' : 'PDF pronto per il download e il controllo visivo.', 4);
      $('viewer-section').scrollIntoView({ behavior: 'smooth' });
    });
  };
  async function render() {
    if (rendering || previews.length !== 2) return;
    rendering = true; for (const id of ['btn-prev-page', 'btn-next-page', 'btn-zoom-in', 'btn-zoom-out']) $(id).disabled = true;
    try { await Promise.all([PDFEngine.renderPageToCanvas(previews[0], currentPage, $('canvas-original'), zoom), PDFEngine.renderPageToCanvas(previews[1], currentPage, $('canvas-translated'), zoom)]); }
    finally {
      rendering = false; $('viewer-page-indicator').textContent = `${currentPage} / ${parsed.numPages}`;
      $('btn-prev-page').disabled = currentPage <= 1; $('btn-next-page').disabled = currentPage >= parsed.numPages;
      $('btn-zoom-in').disabled = zoom >= 2.2; $('btn-zoom-out').disabled = zoom <= 0.5;
    }
  }
  async function changeView(change) { if (rendering || operation) return; change(); try { await render(); } catch (err) { toast(`Anteprima non disponibile: ${err.message}`, true); } }
  $('btn-prev-page').onclick = () => changeView(() => { currentPage = Math.max(1, currentPage - 1); });
  $('btn-next-page').onclick = () => changeView(() => { currentPage = Math.min(parsed.numPages, currentPage + 1); });
  $('btn-zoom-in').onclick = () => changeView(() => { zoom = Math.min(2.2, zoom + 0.2); });
  $('btn-zoom-out').onclick = () => changeView(() => { zoom = Math.max(0.5, zoom - 0.2); });

  document.querySelectorAll('.modal-tab').forEach(tab => tab.onclick = () => {
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t === tab));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === tab.dataset.tab));
  });
  function renderGlossary() { GlossaryManager.renderTable($('excel-table-container'), () => {}); }
  $('btn-add-glossary-row').onclick = () => { GlossaryManager.addEntry(); renderGlossary(); };
  $('btn-export-csv').onclick = () => GlossaryManager.exportCSV();
  $('btn-import-json').onclick = () => $('glossary-file-input').click();
  $('glossary-file-input').onchange = async e => {
    const selected = e.target.files?.[0]; if (!selected) return;
    try { if (!GlossaryManager.importJSON(await selected.text())) throw new Error('Seleziona un glossario JSON valido.'); renderGlossary(); toast('Glossario importato.'); }
    catch (err) { toast(err.message, true); } finally { e.target.value = ''; }
  };
  $('range-font-scale').value = localStorage.getItem('docushift_min_font_scale') || '70';
  function fontScale() { $('font-scale-val').textContent = `${$('range-font-scale').value}%`; localStorage.setItem('docushift_min_font_scale', $('range-font-scale').value); }
  $('range-font-scale').oninput = fontScale; fontScale();
  let theme = localStorage.getItem('docushift_theme') || 'dark';
  function applyTheme() { document.documentElement.dataset.theme = theme; localStorage.setItem('docushift_theme', theme); }
  $('btn-theme-toggle').onclick = () => { theme = theme === 'dark' ? 'light' : 'dark'; applyTheme(); }; applyTheme();
  setInterval(() => { $('quota-countdown-text').textContent = `${AIService.getQuotaStatus().used} richieste locali / ultimo minuto`; }, 1000);
  fillApiForms(); renderGlossary(); updateControls();
  if (AIService.getKey()) connect('popup'); else openPopup();
});
