/**
 * app.js — DocuShift AI
 * Controller minimale: Dark/Light Mode, Popup Setup API, Drag & Drop,
 * Traduzione e Anteprima Side-by-Side.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  let currentTheme = localStorage.getItem('docushift_theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(currentTheme);

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('docushift_theme', theme);
  }

  btnThemeToggle.addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  // Elementi Principali
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

  // Elementi Popup Centro Schermata API
  const apiSetupPopup = document.getElementById('api-setup-popup');
  const popupGeminiKey = document.getElementById('popup-gemini-key');
  const btnPopupClipboard = document.getElementById('btn-popup-clipboard');
  const btnPopupSave = document.getElementById('btn-popup-save');
  const btnClosePopup = document.getElementById('btn-close-popup');

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
  const modelStatusQuality = document.getElementById('model-status-quality');
  const quotaCountdownText = document.getElementById('quota-countdown-text');
  const quotaBarFill = document.getElementById('quota-bar-fill');
  const checkAutoFallback = document.getElementById('check-auto-fallback');

  const btnAddGlossaryRow = document.getElementById('btn-add-glossary-row');
  const btnExportCsv = document.getElementById('btn-export-csv');
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
  let currentZoom = 1.25;
  let quotaTimerInterval = null;

  // Inizializzazione automatica Magic Link / config locale
  const autoAuthResult = AIService.initAutoAuth();
  if (autoAuthResult.success) {
    showToast(autoAuthResult.message, 'success');
  }

  loadSettings();
  renderGlossary();
  startQuotaMonitoring();

  // Controllo startup: se non ci sono API, mostra popup centrale dopo 600ms
  setTimeout(() => {
    const keys = AIService.getKeys();
    if (!keys.gemini && !keys.groq) {
      openApiPopup();
    }
  }, 600);

  // =========================================================================
  // GESTIONE POPUP CENTRALE API
  // =========================================================================
  function openApiPopup() {
    apiSetupPopup.classList.add('active');
    setTimeout(() => popupGeminiKey.focus(), 150);
  }

  function closeApiPopup() {
    apiSetupPopup.classList.remove('active');
  }

  btnClosePopup.addEventListener('click', closeApiPopup);
  apiSetupPopup.addEventListener('click', (e) => {
    if (e.target === apiSetupPopup) closeApiPopup();
  });

  btnPopupClipboard.addEventListener('click', async () => {
    try {
      const res = await AIService.detectKeyFromClipboard();
      popupGeminiKey.value = res.key;
      loadSettings();
      closeApiPopup();
      showToast('Chiave salvata', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  });

  btnPopupSave.addEventListener('click', async () => {
    const key = popupGeminiKey.value.trim();
    if (key) {
      AIService.setKeys(key, undefined);
      loadSettings();
      btnPopupSave.disabled = true;
      btnPopupSave.textContent = 'Verifica...';
      const res = await AIService.testConnection();
      btnPopupSave.disabled = false;
      btnPopupSave.textContent = 'Salva';
      if (res.ok) {
        closeApiPopup();
        showToast(`Connesso con successo: ${res.model}`, 'success');
      } else {
        showToast(`Verifica fallita: ${res.error}`, 'error', 7000);
      }
    } else {
      showToast('Inserisci prima la tua chiave API', 'error');
    }
  });

  popupGeminiKey.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnPopupSave.click();
    }
  });

  // =========================================================================
  // GESTIONE DRAG & DROP E FILE
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

  btnRemoveFile.addEventListener('click', resetLoadedFile);

  async function handleFileSelected(file) {
    if (!file || file.type !== 'application/pdf') {
      showToast('Seleziona un file PDF.', 'error');
      return;
    }

    currentFile = file;
    fileInfoName.textContent = file.name;
    const sizeKB = Math.round(file.size / 1024);
    fileInfoMeta.textContent = `${sizeKB} KB`;
    fileInfo.classList.add('active');
    dropzone.style.display = 'none';

    try {
      originalPdfBytes = await file.arrayBuffer();
      parsedPdfData = await PDFEngine.parsePDF(originalPdfBytes);
      totalPages = parsedPdfData.numPages;
      fileInfoMeta.textContent = `${sizeKB} KB • ${totalPages} ${totalPages === 1 ? 'pagina' : 'pagine'}`;
      btnTranslate.disabled = false;

      // Auto-detect lingua
      const sampleText = parsedPdfData.pages
        .flatMap(p => p.blocks)
        .slice(0, 6)
        .map(b => b.text)
        .join(' ');

      if (sampleText.trim().length > 0) {
        AIService.detectLanguage(sampleText).then(lang => {
          detectedLangText.textContent = lang;
        });
      }

      // Se non ci sono API, ricorda di inserirle
      const keys = AIService.getKeys();
      if (!keys.gemini && !keys.groq) {
        openApiPopup();
      }
    } catch (err) {
      console.error(err);
      showToast('Errore lettura PDF: ' + err.message, 'error');
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
    detectedLangText.textContent = 'Auto-detect';
    progressCard.classList.remove('active');
    viewerSection.classList.remove('active');
  }

  // =========================================================================
  // PIPELINE DI TRADUZIONE
  // =========================================================================
  btnTranslate.addEventListener('click', async () => {
    if (!originalPdfBytes || !parsedPdfData) return;

    const keys = AIService.getKeys();
    if (!keys.gemini && !keys.groq) {
      openApiPopup();
      return;
    }

    const targetLang = targetLangSelect.value;
    btnTranslate.disabled = true;
    progressCard.classList.add('active');
    viewerSection.classList.remove('active');

    updateProgress(15, 'Lettura coordinate...', 1);

    try {
      const allBlocks = parsedPdfData.pages.flatMap(p => p.blocks);
      if (allBlocks.length === 0) {
        throw new Error('Nessun testo estraibile rilevato nel documento.');
      }

      updateProgress(35, `Traduzione verso ${targetLang}...`, 2);

      const glossaryRules = GlossaryManager.getRulesForTarget(targetLang);
      const translationsMap = {};
      const batchSize = 18;
      const totalBatches = Math.ceil(allBlocks.length / batchSize);

      for (let i = 0; i < allBlocks.length; i += batchSize) {
        const batch = allBlocks.slice(i, i + batchSize);
        const batchIndex = Math.floor(i / batchSize) + 1;
        const percent = 35 + Math.round((batchIndex / totalBatches) * 35);
        updateProgress(percent, `Traduzione (${batchIndex}/${totalBatches})...`, 2);

        const translatedBatch = await AIService.translateBatch(batch, targetLang, glossaryRules, (fallbackModel) => {
          showToast(`Fallback su ${fallbackModel.name}`, 'info');
        });

        translatedBatch.forEach(item => {
          if (item && item.id) {
            translationsMap[item.id] = item.translated;
          }
        });
      }

      updateProgress(80, 'Auto-scaling layout e font...', 3);
      const minFontScale = parseInt(rangeFontScale.value, 10) / 100;

      updateProgress(92, 'Compilazione PDF...', 4);
      translatedPdfBytes = await PDFEngine.buildTranslatedPDF(
        originalPdfBytes,
        parsedPdfData.pages,
        translationsMap,
        { minFontScale }
      );

      updateProgress(100, 'Completato', 4);
      setTimeout(() => progressCard.classList.remove('active'), 1200);

      // Download link
      const blob = new Blob([translatedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      btnDownloadPdf.href = downloadUrl;
      const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
      btnDownloadPdf.download = `${baseName}_${targetLang.toLowerCase()}.pdf`;

      // Viewer
      currentPage = 1;
      viewerSection.classList.add('active');
      await renderViewerPages();
      viewerSection.scrollIntoView({ behavior: 'smooth' });
      showToast('Traduzione completata', 'success');

    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
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
  // GESTIONE ANTEPRIMA (VIEWER)
  // =========================================================================
  async function renderViewerPages() {
    viewerPageIndicator.textContent = `${currentPage} / ${totalPages}`;
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
      console.warn(e);
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
    if (currentZoom < 2.2) {
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

  btnClipboardDetect.addEventListener('click', async () => {
    try {
      const res = await AIService.detectKeyFromClipboard();
      loadSettings();
      showToast(`Chiave ${res.label} salvata`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  btnCopyMagicLink.addEventListener('click', async () => {
    const link = AIService.generateMagicLink('gemini');
    if (!link) {
      showToast('Inserisci prima una chiave Gemini', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      showToast('Magic Link copiato negli appunti', 'success');
    } catch (e) {
      prompt('Magic Link:', link);
    }
  });

  inputGeminiKey.addEventListener('change', () => {
    AIService.setKeys(inputGeminiKey.value, undefined);
    showToast('Salvato', 'info');
  });

  inputGroqKey.addEventListener('change', () => {
    AIService.setKeys(undefined, inputGroqKey.value);
    showToast('Salvato', 'info');
  });

  btnTestGemini.addEventListener('click', async () => {
    btnTestGemini.textContent = '...';
    const key = inputGeminiKey.value.trim() || AIService.getKeys().gemini;
    if (key) AIService.setKeys(key, undefined);
    const res = await AIService.testConnection('gemini-1.5-flash');
    btnTestGemini.textContent = 'Verifica';
    if (res.ok) {
      showToast(`Connesso a ${res.model}`, 'success');
    } else {
      showToast(`Errore: ${res.error}`, 'error', 7000);
    }
  });

  btnTestGroq.addEventListener('click', async () => {
    btnTestGroq.textContent = '...';
    const key = inputGroqKey.value.trim() || AIService.getKeys().groq;
    if (key) AIService.setKeys(undefined, key);
    const res = await AIService.testConnection('llama-3.3-70b-versatile');
    btnTestGroq.textContent = 'Verifica';
    if (res.ok) {
      showToast(`Connesso a ${res.model}`, 'success');
    } else {
      showToast(`Errore: ${res.error}`, 'error', 7000);
    }
  });

  selectModel.addEventListener('change', () => {
    AIService.setActiveModel(selectModel.value);
    updateModelStatusCard();
  });

  checkAutoFallback.addEventListener('change', () => {
    AIService.setAutoFallback(checkAutoFallback.checked);
  });

  rangeFontScale.addEventListener('input', () => {
    fontScaleVal.textContent = `${rangeFontScale.value}%`;
    localStorage.setItem('docushift_min_font_scale', rangeFontScale.value);
  });

  function loadSettings() {
    const keys = AIService.getKeys();
    inputGeminiKey.value = keys.gemini;
    inputGroqKey.value = keys.groq;
    popupGeminiKey.value = keys.gemini;

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
    modelStatusQuality.textContent = model.qualityLabel;
    updateQuotaUI();
  }

  function updateQuotaUI() {
    const status = AIService.getQuotaStatus();
    quotaBarFill.style.width = `${status.percentage}%`;

    if (status.secondsUntilReset > 0) {
      quotaCountdownText.textContent = `Reset tra ${status.secondsUntilReset}s`;
    } else {
      quotaCountdownText.textContent = `Pronto`;
    }
  }

  function startQuotaMonitoring() {
    if (quotaTimerInterval) clearInterval(quotaTimerInterval);
    quotaTimerInterval = setInterval(updateQuotaUI, 1000);
  }

  // =========================================================================
  // GESTIONE GLOSSARIO
  // =========================================================================
  function renderGlossary() {
    GlossaryManager.renderTable(excelTableContainer, () => {});
  }

  btnAddGlossaryRow.addEventListener('click', () => {
    GlossaryManager.addEntry('', '', '', '', '', '');
    renderGlossary();
  });

  btnExportCsv.addEventListener('click', () => {
    GlossaryManager.exportCSV();
    showToast('Esportato CSV', 'info');
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
        if (GlossaryManager.importJSON(event.target.result)) {
          renderGlossary();
          showToast('Glossario importato', 'success');
        }
      } catch (err) {
        showToast('File non valido', 'error');
      }
    };
    reader.readAsText(file);
    glossaryFileInput.value = '';
  });

  // =========================================================================
  // NOTIFICHE TOAST MINIMALI
  // =========================================================================
  function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    let icon = `<span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--accent);"></span>`;
    if (type === 'success') {
      icon = `<span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--status-green);"></span>`;
    } else if (type === 'error') {
      icon = `<span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--status-red);"></span>`;
    }

    toast.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
