/**
 * app.js — DocuShift AI
 * Controller principale dell'applicazione web: gestione drag & drop, pipeline di traduzione,
 * navigazione visualizzatore PDF affiancato, modale impostazioni e notifiche toast.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementi DOM Principali
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileInfoName = document.getElementById('file-info-name');
  const fileInfoMeta = document.getElementById('file-info-meta');
  const btnRemoveFile = document.getElementById('btn-remove-file');
  const detectedLangText = document.getElementById('detected-lang-text');
  const targetLangSelect = document.getElementById('target-lang-select');
  const btnTranslate = document.getElementById('btn-translate');

  // Elementi Progress Card
  const progressCard = document.getElementById('progress-card');
  const progressTitle = document.getElementById('progress-title');
  const progressPercent = document.getElementById('progress-percent');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');
  const step4 = document.getElementById('step-4');

  // Elementi Viewer
  const viewerSection = document.getElementById('viewer-section');
  const btnPrevPage = document.getElementById('btn-prev-page');
  const btnNextPage = document.getElementById('btn-next-page');
  const viewerPageIndicator = document.getElementById('viewer-page-indicator');
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnDownloadPdf = document.getElementById('btn-download-pdf');
  const canvasOriginal = document.getElementById('canvas-original');
  const canvasTranslated = document.getElementById('canvas-translated');

  // Elementi Modale Impostazioni
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const settingsModal = document.getElementById('settings-modal');
  const modalTabs = document.querySelectorAll('.modal-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  const btnClipboardDetect = document.getElementById('btn-clipboard-detect');
  const btnCopyMagicLink = document.getElementById('btn-copy-magic-link');
  const inputGeminiKey = document.getElementById('input-gemini-key');
  const inputGroqKey = document.getElementById('input-groq-key');
  const btnTestGemini = document.getElementById('btn-test-gemini');
  const btnTestGroq = document.getElementById('btn-test-groq');
  const selectModel = document.getElementById('select-model');
  const modelStatusName = document.getElementById('model-status-name');
  const modelStatusQuality = document.getElementById('model-status-quality');
  const modelStatusDesc = document.getElementById('model-status-desc');
  const quotaUsedText = document.getElementById('quota-used-text');
  const quotaCountdownText = document.getElementById('quota-countdown-text');
  const quotaBarFill = document.getElementById('quota-bar-fill');
  const checkAutoFallback = document.getElementById('check-auto-fallback');

  const btnAddGlossaryRow = document.getElementById('btn-add-glossary-row');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnExportJson = document.getElementById('btn-export-json');
  const btnImportJson = document.getElementById('btn-import-json');
  const glossaryFileInput = document.getElementById('glossary-file-input');
  const excelTableContainer = document.getElementById('excel-table-container');

  const rangeFontScale = document.getElementById('range-font-scale');
  const fontScaleVal = document.getElementById('font-scale-val');
  const toastContainer = document.getElementById('toast-container');

  // Stato dell'applicazione
  let currentFile = null;
  let originalPdfBytes = null;
  let parsedPdfData = null;
  let translatedPdfBytes = null;
  let currentPage = 1;
  let totalPages = 1;
  let currentZoom = 1.3;
  let quotaTimerInterval = null;

  // Inizializzazione automatica delle credenziali (Magic Link / config locale)
  const autoAuthResult = AIService.initAutoAuth();
  if (autoAuthResult.success) {
    showToast(autoAuthResult.message, 'success');
  }

  // Caricamento configurazioni salvate
  loadSettings();
  renderGlossary();
  startQuotaMonitoring();

  // =========================================================================
  // GESTIONE DRAG & DROP E CARICAMENTO FILE
  // =========================================================================
  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  btnRemoveFile.addEventListener('click', () => {
    resetLoadedFile();
  });

  async function handleFileSelected(file) {
    if (!file || file.type !== 'application/pdf') {
      showToast('Seleziona un file valido in formato PDF.', 'error');
      return;
    }

    currentFile = file;
    fileInfoName.textContent = file.name;
    const sizeKB = Math.round(file.size / 1024);
    fileInfoMeta.textContent = `${sizeKB} KB • Analisi in corso...`;
    fileInfo.classList.add('active');
    dropzone.style.display = 'none';

    try {
      originalPdfBytes = await file.arrayBuffer();
      // Parsing iniziale per conteggio pagine e testi
      parsedPdfData = await PDFEngine.parsePDF(originalPdfBytes);
      totalPages = parsedPdfData.numPages;
      fileInfoMeta.textContent = `${sizeKB} KB • ${totalPages} ${totalPages === 1 ? 'Pagina' : 'Pagine'}`;
      btnTranslate.disabled = false;

      // Rilevamento automatico della lingua del documento con campionatura testo
      const sampleText = parsedPdfData.pages
        .flatMap(p => p.blocks)
        .slice(0, 8)
        .map(b => b.text)
        .join(' ');

      if (sampleText.trim().length > 0) {
        detectedLangText.textContent = 'Analisi lingua sorgente...';
        AIService.detectLanguage(sampleText).then(lang => {
          detectedLangText.textContent = `Sorgente: ${lang}`;
        });
      }

      showToast(`Documento caricato: ${totalPages} pagine pronte per la traduzione.`, 'info');
    } catch (err) {
      console.error('Errore parsing PDF:', err);
      showToast('Errore durante la lettura del file PDF: ' + err.message, 'error');
      resetLoadedFile();
    }
  }

  function resetLoadedFile() {
    currentFile = null;
    originalPdfBytes = null;
    parsedPdfData = null;
    translatedPdfBytes = null;
    fileInput.value = '';
    fileInfo.classList.remove('active');
    dropzone.style.display = 'block';
    btnTranslate.disabled = true;
    detectedLangText.textContent = 'Sorgente: Auto-detect (AI)';
    progressCard.classList.remove('active');
    viewerSection.classList.remove('active');
  }

  // =========================================================================
  // PIPELINE DI TRADUZIONE
  // =========================================================================
  btnTranslate.addEventListener('click', async () => {
    if (!originalPdfBytes || !parsedPdfData) return;

    // Controllo disponibilità chiave API
    const keys = AIService.getKeys();
    if (!keys.gemini && !keys.groq) {
      showToast('Inserisci prima la tua chiave API gratuita nelle Impostazioni (in alto a sinistra).', 'error');
      openModal();
      return;
    }

    const targetLang = targetLangSelect.value;
    btnTranslate.disabled = true;
    progressCard.classList.add('active');
    viewerSection.classList.remove('active');

    updateProgress(10, 'Analisi blocchi di testo e coordinate originali...', 1);

    try {
      // Step 1: Estrazione e preparazione blocchi
      const allBlocks = parsedPdfData.pages.flatMap(p => p.blocks);
      if (allBlocks.length === 0) {
        throw new Error('Nessun testo estraibile rilevato nel documento. Potrebbe trattarsi di un PDF scansionato.');
      }

      // Step 2: Traduzione AI a batch con regole del glossario
      updateProgress(30, `Traduzione in corso verso ${targetLang}...`, 2);

      const glossaryRules = GlossaryManager.getRulesForTarget(targetLang);
      const translationsMap = {};
      const batchSize = 18; // batch bilanciato per velocità e limiti token
      const totalBatches = Math.ceil(allBlocks.length / batchSize);

      for (let i = 0; i < allBlocks.length; i += batchSize) {
        const batch = allBlocks.slice(i, i + batchSize);
        const batchIndex = Math.floor(i / batchSize) + 1;

        const percent = 30 + Math.round((batchIndex / totalBatches) * 35);
        updateProgress(percent, `Traduzione batch ${batchIndex}/${totalBatches} con ${AIService.getActiveModel().name}...`, 2);

        const translatedBatch = await AIService.translateBatch(batch, targetLang, glossaryRules, (fallbackModel, reason) => {
          showToast(`Quota limite raggiunta. Attivato Smart Fallback su: ${fallbackModel.name}`, 'info');
        });

        // Mappa le traduzioni per id
        translatedBatch.forEach(item => {
          if (item && item.id) {
            translationsMap[item.id] = item.translated;
          }
        });
      }

      // Step 3: Auto-scaling layout e download Google Fonts
      updateProgress(75, 'Calcolo auto-scaling del testo e collegamento Google Fonts...', 3);
      const minFontScale = parseInt(rangeFontScale.value, 10) / 100;

      // Step 4: Compilazione PDF finale
      updateProgress(90, 'Compilazione del nuovo file PDF vettoriale...', 4);

      translatedPdfBytes = await PDFEngine.buildTranslatedPDF(
        originalPdfBytes,
        parsedPdfData.pages,
        translationsMap,
        { minFontScale }
      );

      updateProgress(100, 'Traduzione completata!', 4);
      setTimeout(() => progressCard.classList.remove('active'), 1500);

      // Configura Download
      const blob = new Blob([translatedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      btnDownloadPdf.href = downloadUrl;
      const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
      btnDownloadPdf.download = `${baseName}_tradotto_${targetLang.toLowerCase()}.pdf`;

      // Mostra visualizzatore affiancato
      currentPage = 1;
      viewerSection.classList.add('active');
      await renderViewerPages();

      viewerSection.scrollIntoView({ behavior: 'smooth' });
      showToast('🎉 Documento tradotto con successo con layout preservato!', 'success');

    } catch (err) {
      console.error('Errore durante la traduzione:', err);
      showToast('Errore durante la traduzione: ' + err.message, 'error');
      progressCard.classList.remove('active');
    } finally {
      btnTranslate.disabled = false;
    }
  });

  function updateProgress(percent, titleText, activeStepNum) {
    progressPercent.textContent = `${percent}%`;
    progressBarFill.style.width = `${percent}%`;
    progressTitle.textContent = titleText;

    const steps = [step1, step2, step3, step4];
    steps.forEach((step, idx) => {
      const num = idx + 1;
      step.classList.remove('current', 'done');
      if (num < activeStepNum) {
        step.classList.add('done');
      } else if (num === activeStepNum) {
        step.classList.add('current');
      }
    });
  }

  // =========================================================================
  // GESTIONE ANTEPRIMA AFFIANCATA (VIEWER)
  // =========================================================================
  async function renderViewerPages() {
    viewerPageIndicator.textContent = `Pagina ${currentPage} di ${totalPages}`;
    btnPrevPage.disabled = (currentPage <= 1);
    btnNextPage.disabled = (currentPage >= totalPages);

    try {
      if (originalPdfBytes) {
        await PDFEngine.renderPageToCanvas(originalPdfBytes, currentPage, canvasOriginal, currentZoom);
      }
      if (translatedPdfBytes) {
        await PDFEngine.renderPageToCanvas(translatedPdfBytes, currentPage, canvasTranslated, currentZoom);
      }
    } catch (e) {
      console.warn('Errore rendering anteprima pagina:', e);
    }
  }

  btnPrevPage.addEventListener('click', async () => {
    if (currentPage > 1) {
      currentPage--;
      await renderViewerPages();
    }
  });

  btnNextPage.addEventListener('click', async () => {
    if (currentPage < totalPages) {
      currentPage++;
      await renderViewerPages();
    }
  });

  btnZoomIn.addEventListener('click', async () => {
    if (currentZoom < 2.5) {
      currentZoom += 0.2;
      await renderViewerPages();
    }
  });

  btnZoomOut.addEventListener('click', async () => {
    if (currentZoom > 0.8) {
      currentZoom -= 0.2;
      await renderViewerPages();
    }
  });

  // =========================================================================
  // GESTIONE MODALE IMPOSTAZIONI
  // =========================================================================
  btnOpenSettings.addEventListener('click', openModal);
  btnCloseSettings.addEventListener('click', closeModal);
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeModal();
  });

  function openModal() {
    loadSettings();
    settingsModal.classList.add('active');
  }

  function closeModal() {
    settingsModal.classList.remove('active');
  }

  // Tab switching
  modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modalTabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(tab.dataset.tab);
      if (targetPane) targetPane.classList.add('active');

      if (tab.dataset.tab === 'tab-glossary') {
        renderGlossary();
      }
    });
  });

  // Smart Clipboard Detect Button
  btnClipboardDetect.addEventListener('click', async () => {
    try {
      const res = await AIService.detectKeyFromClipboard();
      loadSettings();
      showToast(`Chiave ${res.label} rilevata e salvata con successo!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Copia Magic Link
  btnCopyMagicLink.addEventListener('click', async () => {
    const link = AIService.generateMagicLink('gemini');
    if (!link) {
      showToast('Inserisci prima una chiave API Gemini da associare al link.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      showToast('Magic Link copiato negli appunti! Aprilo da qualsiasi browser per attivare la chiave con 1 click.', 'success');
    } catch (e) {
      prompt('Copia il tuo Magic Link personale:', link);
    }
  });

  // Salvataggio chiavi
  inputGeminiKey.addEventListener('change', () => {
    AIService.setKeys(inputGeminiKey.value, undefined);
    showToast('Chiave Gemini salvata in locale.', 'info');
  });

  inputGroqKey.addEventListener('change', () => {
    AIService.setKeys(undefined, inputGroqKey.value);
    showToast('Chiave Groq salvata in locale.', 'info');
  });

  // Test Connessione
  btnTestGemini.addEventListener('click', async () => {
    btnTestGemini.disabled = true;
    btnTestGemini.textContent = 'Verifica...';
    AIService.setKeys(inputGeminiKey.value, undefined);
    const res = await AIService.testConnection('gemini-2.5-flash');
    btnTestGemini.disabled = false;
    btnTestGemini.textContent = 'Verifica';
    if (res.ok) {
      showToast(`Connessione a ${res.model} riuscita con successo!`, 'success');
    } else {
      showToast('Test fallito: ' + res.error, 'error');
    }
  });

  btnTestGroq.addEventListener('click', async () => {
    btnTestGroq.disabled = true;
    btnTestGroq.textContent = 'Verifica...';
    AIService.setKeys(undefined, inputGroqKey.value);
    const res = await AIService.testConnection('llama-3.3-70b-versatile');
    btnTestGroq.disabled = false;
    btnTestGroq.textContent = 'Verifica';
    if (res.ok) {
      showToast(`Connessione a ${res.model} riuscita con successo!`, 'success');
    } else {
      showToast('Test fallito: ' + res.error, 'error');
    }
  });

  // Cambio Modello
  selectModel.addEventListener('change', () => {
    AIService.setActiveModel(selectModel.value);
    updateModelStatusCard();
  });

  checkAutoFallback.addEventListener('change', () => {
    AIService.setAutoFallback(checkAutoFallback.checked);
  });

  // Slider Auto-scaling
  rangeFontScale.addEventListener('input', () => {
    fontScaleVal.textContent = `${rangeFontScale.value}%`;
    localStorage.setItem('docushift_min_font_scale', rangeFontScale.value);
  });

  function loadSettings() {
    const keys = AIService.getKeys();
    inputGeminiKey.value = keys.gemini;
    inputGroqKey.value = keys.groq;

    const currentModel = AIService.getActiveModel();
    selectModel.value = currentModel.id;

    checkAutoFallback.checked = AIService.getAutoFallback();

    const savedFontScale = localStorage.getItem('docushift_min_font_scale') || '70';
    rangeFontScale.value = savedFontScale;
    fontScaleVal.textContent = `${savedFontScale}%`;

    updateModelStatusCard();
  }

  function updateModelStatusCard() {
    const model = AIService.getActiveModel();
    modelStatusName.textContent = model.name;
    modelStatusQuality.textContent = model.qualityLabel;
    modelStatusDesc.textContent = model.description;
    updateQuotaUI();
  }

  function updateQuotaUI() {
    const status = AIService.getQuotaStatus();
    quotaUsedText.textContent = `${status.used} / ${status.max}`;
    quotaBarFill.style.width = `${status.percentage}%`;

    if (status.percentage >= 80) {
      quotaBarFill.style.background = 'var(--red)';
    } else if (status.percentage >= 50) {
      quotaBarFill.style.background = '#ffd166';
    } else {
      quotaBarFill.style.background = 'var(--cyan)';
    }

    if (status.secondsUntilReset > 0) {
      quotaCountdownText.textContent = `Reset token tra: ${status.secondsUntilReset}s`;
    } else {
      quotaCountdownText.textContent = `Reset quota: Pronto (0 RPM attivi)`;
    }
  }

  function startQuotaMonitoring() {
    if (quotaTimerInterval) clearInterval(quotaTimerInterval);
    quotaTimerInterval = setInterval(() => {
      updateQuotaUI();
    }, 1000);
  }

  // =========================================================================
  // GESTIONE GLOSSARIO
  // =========================================================================
  function renderGlossary() {
    GlossaryManager.renderTable(excelTableContainer, () => {
      // callback on update
    });
  }

  btnAddGlossaryRow.addEventListener('click', () => {
    GlossaryManager.addEntry('', '', '', '', '', '');
    renderGlossary();
  });

  btnExportCsv.addEventListener('click', () => {
    GlossaryManager.exportCSV();
    showToast('Glossario esportato in formato CSV.', 'info');
  });

  btnExportJson.addEventListener('click', () => {
    GlossaryManager.exportJSON();
    showToast('Glossario esportato in formato JSON.', 'info');
  });

  btnImportJson.addEventListener('click', () => {
    glossaryFileInput.click();
  });

  glossaryFileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const ok = GlossaryManager.importJSON(event.target.result);
        if (ok) {
          renderGlossary();
          showToast('Glossario importato con successo!', 'success');
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
    reader.readAsText(file);
    glossaryFileInput.value = '';
  });

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  function showToast(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    let icon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    if (type === 'success') {
      icon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--green)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    } else if (type === 'error') {
      icon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--red)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    }

    toast.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
