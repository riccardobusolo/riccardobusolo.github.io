/**
 * app.js — DocuShift AI
 * Controller minimale: Dark/Light Mode, Popup Setup API, Drag & Drop,
 * Traduzione e Anteprima Side-by-Side.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[DocuShift v3.6] Initialized - PDFLib ready:', typeof window.PDFLib !== 'undefined', 'fontkit ready:', typeof window.fontkit !== 'undefined');

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
  const progressSubtitle = document.getElementById('progress-subtitle');
  const progressPercent = document.getElementById('progress-percent');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressErrorBox = document.getElementById('progress-error-box');
  const progressErrorText = document.getElementById('progress-error-text');
  const btnDismissProgressError = document.getElementById('btn-dismiss-progress-error');
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
  const btnTestGemini = document.getElementById('btn-test-gemini');
  const modelStatusQuality = document.getElementById('model-status-quality');
  const quotaCountdownText = document.getElementById('quota-countdown-text');
  const quotaBarFill = document.getElementById('quota-bar-fill');

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

  // Controllo startup: se non c'è API key, mostra popup centrale dopo 600ms
  setTimeout(() => {
    const key = AIService.getKey();
    if (!key) {
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
      AIService.setKey(key);
      loadSettings();
      btnPopupSave.disabled = true;
      btnPopupSave.textContent = 'Verifica...';
      const res = await AIService.testConnection();
      btnPopupSave.disabled = false;
      btnPopupSave.textContent = 'Salva';
      if (res.ok) {
        closeApiPopup();
        showToast(`Connesso a ${res.model}`, 'success');
      } else {
        showToast(`Verifica: ${res.error}`, 'error', 7000);
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

      // Auto-detect lingua con auto-switch intelligente del target
      const sampleText = parsedPdfData.pages
        .flatMap(p => p.blocks)
        .slice(0, 6)
        .map(b => b.text)
        .join(' ');

      if (sampleText.trim().length > 0) {
        AIService.detectLanguage(sampleText).then(lang => {
          detectedLangText.textContent = lang;
          // Se la lingua rilevata è Italiano e la destinazione è ancora su Italiano, imposta Inglese
          if (lang.toLowerCase().includes('ita') && targetLangSelect.value === 'Italiano') {
            targetLangSelect.value = 'Inglese';
          } else if (lang.toLowerCase().includes('ing') && targetLangSelect.value === 'Inglese') {
            targetLangSelect.value = 'Italiano';
          }
        });
      }

      // Se non ci sono API, ricorda di inserirle
      if (!AIService.getKey()) {
        openApiPopup();
      }
    } catch (err) {
      console.error(err);
      showToast('Errore lettura PDF: ' + err.message, 'error', 10000);
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
    if (progressErrorBox) progressErrorBox.style.display = 'none';
    viewerSection.classList.remove('active');
  }

  if (btnDismissProgressError) {
    btnDismissProgressError.addEventListener('click', () => {
      progressErrorBox.style.display = 'none';
      progressCard.classList.remove('active');
    });
  }

  // =========================================================================
  // PIPELINE DI TRADUZIONE CON STATI ESPLICATIVI E RESILIENZA AGLI ERRORI
  // =========================================================================
  btnTranslate.addEventListener('click', async () => {
    if (!originalPdfBytes || !parsedPdfData) return;

    if (!AIService.getKey()) {
      openApiPopup();
      return;
    }

    AIService.resetWorkingModel();
    const targetLang = targetLangSelect.value;
    btnTranslate.disabled = true;
    if (progressErrorBox) progressErrorBox.style.display = 'none';
    progressBarFill.style.background = 'var(--accent)';
    progressCard.classList.add('active');
    viewerSection.classList.remove('active');

    updateProgress(10, '1. Analisi del documento PDF', `Estrazione testo, coordinate e font per ${totalPages} pagine...`, 1);

    try {
      const allBlocks = parsedPdfData.pages.flatMap(p => p.blocks);
      if (allBlocks.length === 0) {
        throw new Error('Nessun testo estraibile rilevato nel documento. Se il PDF è una scansione o un\'immagine, è necessario un file con testo vettoriale selezionabile.');
      }

      updateProgress(22, 'Preparazione traduzione', `Rilevati ${allBlocks.length} elementi di testo complessivi distribuiti su ${totalPages} pagine.`, 1);

      const glossaryRules = GlossaryManager.getRulesForTarget(targetLang);
      const translationsMap = {};
      const batchSize = 18;
      const totalBatches = Math.ceil(allBlocks.length / batchSize);

      for (let i = 0; i < allBlocks.length; i += batchSize) {
        const batch = allBlocks.slice(i, i + batchSize);
        const batchIndex = Math.floor(i / batchSize) + 1;
        const percent = 25 + Math.round((batchIndex / totalBatches) * 55);
        const currentModelName = AIService.getActiveModel().name;

        updateProgress(
          percent,
          `2. Traduzione con ${currentModelName}`,
          `Traduzione blocco ${batchIndex} di ${totalBatches} (${batch.length} frasi verso ${targetLang})...`,
          2
        );

        // Notifica in tempo reale se Google Gemini risponde con 503 (picco di traffico) o fallback
        const onStatus = (info) => {
          if (info.status === 'switching') {
            updateProgress(
              percent,
              `Ottimizzazione automatica...`,
              info.message,
              2
            );
          } else if (info.status === 'retry') {
            updateProgress(
              percent,
              `Attesa risposta server Google...`,
              info.message,
              2
            );
          }
        };

        const translatedBatch = await AIService.translateBatch(batch, targetLang, glossaryRules, onStatus);

        translatedBatch.forEach(item => {
          if (item && item.id) {
            translationsMap[item.id] = item.translated;
          }
        });
      }

      updateProgress(82, '3. Adattamento grafico del layout', 'Calcolo ingombri e ridimensionamento proporzionale font per preservare grafica e immagini...', 3);
      const minFontScale = parseInt(rangeFontScale.value, 10) / 100;

      updateProgress(92, '4. Compilazione del nuovo file PDF', `Inserimento testi tradotti e composizione vettoriale (${totalPages} pagine)...`, 4);
      translatedPdfBytes = await PDFEngine.buildTranslatedPDF(
        originalPdfBytes,
        parsedPdfData.pages,
        translationsMap,
        { minFontScale }
      );

      updateProgress(100, 'Traduzione completata con successo!', `Tutte le ${totalPages} pagine sono state tradotte. Visualizza l'anteprima o scarica il file.`, 4);
      setTimeout(() => progressCard.classList.remove('active'), 2500);

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
      showToast('Traduzione completata con successo!', 'success', 4000);

    } catch (err) {
      console.error(err);
      progressTitle.textContent = 'Processo interrotto';
      if (progressSubtitle) {
        progressSubtitle.textContent = 'Si è verificato un errore durante la traduzione del documento.';
      }
      progressBarFill.style.background = 'var(--status-red)';
      if (progressErrorText) {
        progressErrorText.textContent = err.message || 'Errore imprevisto durante la traduzione.';
      }
      if (progressErrorBox) {
        progressErrorBox.style.display = 'flex';
      }

      // Mostra l'errore chiaramente a schermo: rimosso a mano o automaticamente dopo 10 secondi
      showToast(err.message || 'Errore durante la traduzione', 'error', 10000);
    } finally {
      btnTranslate.disabled = false;
    }
  });

  function updateProgress(percent, titleText, subtitleText, activeStepNum) {
    progressPercent.textContent = `${percent}%`;
    progressBarFill.style.width = `${percent}%`;
    progressTitle.textContent = titleText;
    if (progressSubtitle && subtitleText) {
      progressSubtitle.textContent = subtitleText;
    }

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
    const link = AIService.generateMagicLink();
    if (!link) {
      showToast('Inserisci prima la tua API Key Gemini', 'error');
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
    AIService.setKey(inputGeminiKey.value);
    showToast('API Key salvata', 'info');
  });

  btnTestGemini.addEventListener('click', async () => {
    btnTestGemini.textContent = '...';
    const key = inputGeminiKey.value.trim() || AIService.getKey();
    if (key) AIService.setKey(key);
    
    const res = await AIService.testConnection();
    btnTestGemini.textContent = 'Verifica';
    if (res.ok) {
      showToast(`Connesso a ${res.model}`, 'success');
    } else {
      showToast(`Errore: ${res.error}`, 'error', 7000);
    }
  });

  rangeFontScale.addEventListener('input', () => {
    fontScaleVal.textContent = `${rangeFontScale.value}%`;
    localStorage.setItem('docushift_min_font_scale', rangeFontScale.value);
  });

  function loadSettings() {
    const key = AIService.getKey();
    if (inputGeminiKey) inputGeminiKey.value = key;
    if (popupGeminiKey) popupGeminiKey.value = key;

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
  // NOTIFICHE TOAST MINIMALI (Errori rimossi a mano o dopo 10 secondi)
  // =========================================================================
  function showToast(message, type = 'info', duration = null) {
    // Di default: 10 secondi (10000ms) per gli errori, 3.5s per altri messaggi
    const effectiveDuration = duration !== null ? duration : (type === 'error' ? 10000 : 3500);

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    let icon = `<span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:var(--accent); flex-shrink:0;"></span>`;
    if (type === 'success') {
      icon = `<span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:var(--status-green); flex-shrink:0;"></span>`;
    } else if (type === 'error') {
      icon = `<span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:var(--status-red); flex-shrink:0;"></span>`;
    }

    const content = document.createElement('div');
    content.className = 'toast__content';
    content.innerHTML = `${icon}<span>${escapeHtml(message)}</span>`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast__close';
    closeBtn.title = 'Chiudi avviso';
    closeBtn.setAttribute('aria-label', 'Chiudi avviso');
    closeBtn.innerHTML = '&times;';

    toast.appendChild(content);
    toast.appendChild(closeBtn);
    toastContainer.appendChild(toast);

    let dismissTimer = null;

    const dismiss = () => {
      if (dismissTimer) clearTimeout(dismissTimer);
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px) scale(0.96)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    };

    closeBtn.addEventListener('click', dismiss);

    if (effectiveDuration > 0) {
      dismissTimer = setTimeout(dismiss, effectiveDuration);
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
