/**
 * glossary.js — DocuShift AI
 * Gestore del Glossario in stile Excel con auto-traduzione a singola riga,
 * modifica inline delle celle, esportazione/importazione e regole per il traduttore PDF.
 */

const GlossaryManager = (() => {
  const STORAGE_KEY = 'docushift_glossary_data';

  // Dati di default dimostrativi
  const DEFAULT_ENTRIES = [
    { id: '1', source: 'Artificial Intelligence', it: 'Intelligenza Artificiale', en: 'Artificial Intelligence', es: 'Inteligencia Artificial', fr: 'Intelligence Artificielle', de: 'Künstliche Intelligenz' },
    { id: '2', source: 'Prompt Engineering', it: 'Ingegneria dei Prompt', en: 'Prompt Engineering', es: 'Ingeniería de Prompts', fr: 'Ingénierie de Prompts', de: 'Prompt Engineering' },
    { id: '3', source: 'Machine Learning', it: 'Apprendimento Automatico', en: 'Machine Learning', es: 'Aprendizaje Automático', fr: 'Apprentissage Automatique', de: 'Maschinelles Lernen' }
  ];

  let entries = [];

  function init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        entries = JSON.parse(stored);
      } else {
        entries = [...DEFAULT_ENTRIES];
        save();
      }
    } catch (e) {
      console.warn('Errore caricamento glossario:', e);
      entries = [...DEFAULT_ENTRIES];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Errore salvataggio glossario:', e);
    }
  }

  function getEntries() {
    return entries;
  }

  function addEntry(term = '', it = '', en = '', es = '', fr = '', de = '') {
    const newEntry = {
      id: Date.now().toString(),
      source: term.trim(),
      it: it.trim(),
      en: en.trim(),
      es: es.trim(),
      fr: fr.trim(),
      de: de.trim()
    };
    entries.push(newEntry);
    save();
    return newEntry;
  }

  function updateEntry(id, field, value) {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      entry[field] = value.trim();
      save();
    }
  }

  function deleteEntry(id) {
    entries = entries.filter(e => e.id !== id);
    save();
  }

  // Auto-traduce la riga specifica interrogando il modello attivo
  async function autoTranslateRow(id, onProgress) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    // Cerca il termine prioritario presente
    const term = entry.source || entry.it || entry.en || entry.es || entry.fr || entry.de;
    if (!term) {
      throw new Error('Inserisci almeno una parola nella riga prima di richiedere la traduzione.');
    }

    if (onProgress) onProgress(true);

    try {
      const translations = await AIService.translateGlossaryTerm(term);
      if (translations) {
        if (!entry.source) entry.source = term;
        if (translations.it) entry.it = translations.it;
        if (translations.en) entry.en = translations.en;
        if (translations.es) entry.es = translations.es;
        if (translations.fr) entry.fr = translations.fr;
        if (translations.de) entry.de = translations.de;
        save();
      }
      return entry;
    } finally {
      if (onProgress) onProgress(false);
    }
  }

  // Estrae le regole del glossario per la lingua di destinazione corrente
  function getRulesForTarget(targetLangCode) {
    // normalizza codice lingua (it, en, es, fr, de)
    const code = (targetLangCode || '').toLowerCase().slice(0, 2);
    const rules = [];

    entries.forEach(entry => {
      const targetVal = entry[code];
      const sourceVal = entry.source || entry.en || entry.it;

      if (sourceVal && targetVal && sourceVal.toLowerCase() !== targetVal.toLowerCase()) {
        rules.push({
          source: sourceVal,
          target: targetVal
        });
      }
    });

    return rules;
  }

  function exportCSV() {
    const headers = ['Termine Sorgente', 'Italiano', 'Inglese', 'Spagnolo', 'Francese', 'Tedesco'];
    const rows = entries.map(e => [
      `"${(e.source || '').replace(/"/g, '""')}"`,
      `"${(e.it || '').replace(/"/g, '""')}"`,
      `"${(e.en || '').replace(/"/g, '""')}"`,
      `"${(e.es || '').replace(/"/g, '""')}"`,
      `"${(e.fr || '').replace(/"/g, '""')}"`,
      `"${(e.de || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glossario_docushift_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glossario_docushift_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data)) {
        entries = data.map((item, idx) => ({
          id: item.id || (Date.now() + idx).toString(),
          source: item.source || '',
          it: item.it || '',
          en: item.en || '',
          es: item.es || '',
          fr: item.fr || '',
          de: item.de || ''
        }));
        save();
        return true;
      }
    } catch (e) {
      throw new Error('File JSON non valido per il glossario.');
    }
    return false;
  }

  // Renderizza la tabella stile Excel nel container DOM
  function renderTable(containerEl, onUpdate) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'excel-table-wrapper';

    const table = document.createElement('table');
    table.className = 'excel-table';

    // Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th style="width: 40px;">#</th>
        <th>Termine Sorgente</th>
        <th>Italiano (IT)</th>
        <th>Inglese (EN)</th>
        <th>Spagnolo (ES)</th>
        <th>Francese (FR)</th>
        <th>Tedesco (DE)</th>
        <th style="width: 110px; text-align: center;">Azioni</th>
      </tr>
    `;
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');

    if (entries.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `<td colspan="8" class="excel-empty">Nessun termine nel glossario. Clicca "+ Aggiungi Riga" per iniziare.</td>`;
      tbody.appendChild(emptyRow);
    } else {
      entries.forEach((entry, index) => {
        const tr = document.createElement('tr');
        tr.dataset.id = entry.id;

        tr.innerHTML = `
          <td class="row-num">${index + 1}</td>
          <td><div class="cell-editable" contenteditable="true" data-field="source">${escapeHtml(entry.source)}</div></td>
          <td><div class="cell-editable" contenteditable="true" data-field="it">${escapeHtml(entry.it)}</div></td>
          <td><div class="cell-editable" contenteditable="true" data-field="en">${escapeHtml(entry.en)}</div></td>
          <td><div class="cell-editable" contenteditable="true" data-field="es">${escapeHtml(entry.es)}</div></td>
          <td><div class="cell-editable" contenteditable="true" data-field="fr">${escapeHtml(entry.fr)}</div></td>
          <td><div class="cell-editable" contenteditable="true" data-field="de">${escapeHtml(entry.de)}</div></td>
          <td class="row-actions">
            <button class="btn-row-action btn-auto-translate" title="Auto-traduci riga con AI" data-id="${entry.id}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </button>
            <button class="btn-row-action btn-delete-row" title="Elimina riga" data-id="${entry.id}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    containerEl.appendChild(tableWrapper);

    // Event Listeners per modifiche inline
    tbody.querySelectorAll('.cell-editable').forEach(cell => {
      cell.addEventListener('blur', (e) => {
        const tr = e.target.closest('tr');
        const id = tr.dataset.id;
        const field = e.target.dataset.field;
        updateEntry(id, field, e.target.innerText);
        if (onUpdate) onUpdate();
      });

      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          cell.blur();
        }
      });
    });

    // Auto-traduci riga
    tbody.querySelectorAll('.btn-auto-translate').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        btn.classList.add('loading');
        btn.disabled = true;
        try {
          await autoTranslateRow(id);
          renderTable(containerEl, onUpdate);
          if (onUpdate) onUpdate();
        } catch (err) {
          alert('Errore traduzione glossario: ' + err.message);
        } finally {
          btn.classList.remove('loading');
          btn.disabled = false;
        }
      });
    });

    // Elimina riga
    tbody.querySelectorAll('.btn-delete-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        deleteEntry(id);
        renderTable(containerEl, onUpdate);
        if (onUpdate) onUpdate();
      });
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  init();

  return {
    getEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    autoTranslateRow,
    getRulesForTarget,
    exportCSV,
    exportJSON,
    importJSON,
    renderTable
  };
})();
