/* ============================================================================
   BESTIARIO — strumento libreria di mostri (Crooked Moon)
   ----------------------------------------------------------------------------
   I mostri sono oggetti "enemy-shaped" (stessi campi dei Nemici / scheda nemico)
   con in più un `id`. Sono salvati in localStorage sotto 'cm_bestiary'.
   La libreria parte vuota ed è interamente gestita dall'utente.

   Integrazione con l'app principale (index.html) tramite questi ponti:
     - window.cmOpenMonsterEditor(obj, saveCb)  → apre la scheda nemico puntata
       sul mostro; ogni modifica viene auto-salvata chiamando saveCb.
     - window.cmAddEnemyFromMonster(monster)    → copia il mostro tra i Nemici.
     - window.cmBestiaryUpsertFromEnemy(enemy)  → (lato index) salva un Nemico
       nella libreria; chiama cmBestiary.upsert.

   API pubblica esposta: window.cmBestiary
   UI renderizzata dentro #bestiaryBody (corpo della finestra winBestiary).
   ========================================================================== */
(function () {
  var KEY = 'cm_bestiary';

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } }
  function persist() { localStorage.setItem(KEY, JSON.stringify(data)); }
  var data = load();

  function genId() { return 'm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function abMod(s) { return Math.floor(((s | 0) - 10) / 2); }
  function fmtMod(m) { return m >= 0 ? '+' + m : '' + m; }
  function host() { return document.getElementById('bestiaryBody'); }
  function getById(id) { for (var i = 0; i < data.length; i++) if (data[i].id === id) return data[i]; return null; }

  function blankMonster() {
    return { name: 'Nuovo mostro', emoji: '🐾', ac: 10, hp: 10, hpCur: 10, hpTemp: 0, init: 0,
             cr: '', xp: '', hpDice: '', str: 10, dex: 10, con: 10, intl: 10, wis: 10, cha: 10 };
  }

  /* ---- Stato vista ---- */
  var view = { mode: 'list', curId: null, q: '' };

  /* ---- API pubblica ---- */
  window.cmBestiary = {
    all: function () { return data; },
    get: getById,
    upsert: function (obj, id) {
      var o; try { o = JSON.parse(JSON.stringify(obj)); } catch (e) { return null; }
      if (id) {
        for (var i = 0; i < data.length; i++) { if (data[i].id === id) { o.id = id; data[i] = o; persist(); render(); return id; } }
      }
      o.id = genId(); data.push(o); persist(); render(); return o.id;
    },
    remove: function (id) { for (var i = 0; i < data.length; i++) { if (data[i].id === id) { data.splice(i, 1); break; } } persist(); render(); },
    /* Usata come callback di salvataggio dall'editor: persiste e ridisegna. */
    save: function () { persist(); render(); },
    render: function () { render(); }
  };

  /* ---- Render ---- */
  function render() {
    var el = host(); if (!el) return;
    if (view.mode === 'preview' && getById(view.curId)) renderPreview(el);
    else { view.mode = 'list'; renderList(el); }
  }

  function renderList(el) {
    var q = (view.q || '').toLowerCase();
    var items = data.filter(function (m) {
      return !q || (m.name || '').toLowerCase().indexOf(q) >= 0 || String(m.type || '').toLowerCase().indexOf(q) >= 0;
    });
    var h = '<div class="best__bar"><input class="best__search" id="bestSearch" placeholder="Cerca mostro..." value="' + esc(view.q) + '" spellcheck="false"><button class="best__add" data-bestnew="1" type="button">＋ Nuovo mostro</button></div>';
    if (!data.length) {
      h += '<div class="best__empty">Bestiario vuoto.<br>Crea un mostro con <strong>＋ Nuovo mostro</strong>,<br>oppure salva un Nemico nel bestiario<br>(menu ⋮ → <em>Salva nel bestiario</em>).</div>';
    } else if (!items.length) {
      h += '<div class="best__empty">Nessun mostro corrisponde a "' + esc(view.q) + '".</div>';
    } else {
      h += '<div class="best__list">';
      items.forEach(function (m) {
        var cr = (m.cr != null && m.cr !== '') ? ('CR ' + esc(String(m.cr))) : '';
        var sep = (cr && m.type) ? ' · ' : '';
        h += '<div class="best__card" data-bestopen="' + esc(m.id) + '">' +
          '<span class="best__emoji">' + esc(m.emoji || '🐾') + '</span>' +
          '<div class="best__info"><div class="best__name">' + esc(m.name || '(senza nome)') + '</div>' +
          '<div class="best__meta">' + cr + sep + esc(m.type || '') + '</div></div>' +
          '<div class="best__statmini"><span title="Classe Armatura">🛡️ ' + esc(m.ac != null ? m.ac : '—') + '</span>' +
          '<span title="Punti Ferita">❤️ ' + esc(m.hp != null ? m.hp : '—') + '</span></div></div>';
      });
      h += '</div>';
    }
    el.innerHTML = h;
  }

  function renderPreview(el) {
    var m = getById(view.curId);
    if (!m) { view.mode = 'list'; renderList(el); return; }
    var abils = [['FOR', 'str'], ['DES', 'dex'], ['COS', 'con'], ['INT', 'intl'], ['SAG', 'wis'], ['CAR', 'cha']];
    var abH = abils.map(function (a) {
      var v = m[a[1]] != null ? m[a[1]] : 10;
      return '<div class="best__ab"><div class="best__ab-l">' + a[0] + '</div><div class="best__ab-v">' + esc(v) + '</div><div class="best__ab-m">' + fmtMod(abMod(v)) + '</div></div>';
    }).join('');

    function secList(title, key) {
      var arr = m[key] || []; if (!arr.length) return '';
      var rows = arr.map(function (it) {
        var o = (typeof it === 'string') ? { name: it, desc: '' } : (it || {});
        return '<div class="best__pv-item"><div class="best__pv-iname">' + esc(o.name || '') + '</div>' +
          (o.desc ? '<div class="best__pv-idesc">' + esc(o.desc) + '</div>' : '') + '</div>';
      }).join('');
      return '<div class="best__pv-sec"><div class="best__pv-sectitle">' + title + '</div>' + rows + '</div>';
    }

    var h = '<div class="best__pv-head"><button class="best__back" data-bestback="1" type="button">← Indietro</button></div>';
    h += '<div class="best__pv">';
    h += '<div class="best__pv-id"><span class="best__pv-emoji">' + esc(m.emoji || '🐾') + '</span><div>' +
      '<div class="best__pv-name">' + esc(m.name || '(senza nome)') + '</div>' +
      '<div class="best__pv-sub">' + esc(m.size || '') + (m.size && m.type ? ' ' : '') + esc(m.type || '') + (m.alignment ? ', ' + esc(m.alignment) : '') + '</div></div></div>';
    h += '<div class="best__pv-stats">' +
      '<span>🛡️ <strong>' + esc(m.ac != null ? m.ac : '—') + '</strong> CA</span>' +
      '<span>❤️ <strong>' + esc(m.hp != null ? m.hp : '—') + '</strong> PF' + (m.hpDice ? ' (' + esc(m.hpDice) + ')' : '') + '</span>' +
      ((m.cr != null && m.cr !== '') ? '<span>CR <strong>' + esc(String(m.cr)) + '</strong></span>' : '') +
      ((m.xp != null && m.xp !== '') ? '<span><strong>' + esc(m.xp) + '</strong> XP</span>' : '') +
      (m.speed ? '<span>🦶 ' + esc(m.speed) + '</span>' : '') +
      '<span>⚡ <strong>' + fmtMod(m.init || 0) + '</strong> Iniz.</span>' +
      '</div>';
    h += '<div class="best__pv-abs">' + abH + '</div>';
    h += secList('✨ Tratti', 'traits') + secList('⚔️ Azioni', 'actions') + secList('🎯 Azioni bonus', 'bonusActions') +
      secList('⚡ Reazioni', 'reactions') + secList('👑 Azioni leggendarie', 'legendaryActions') + secList('💰 Drop', 'drop');
    if (m.notes) h += '<div class="best__pv-sec"><div class="best__pv-sectitle">📝 Note</div><div class="best__pv-notes">' + esc(m.notes) + '</div></div>';
    h += '<div class="best__pv-actions">' +
      '<button class="best__btn best__btn--add" data-bestadd="' + esc(m.id) + '" type="button">➕ Aggiungi ai Nemici</button>' +
      '<button class="best__btn" data-bestedit="' + esc(m.id) + '" type="button">✏️ Modifica</button>' +
      '<button class="best__btn best__btn--del" data-bestdel="' + esc(m.id) + '" type="button">🗑 Elimina</button>' +
      '</div>';
    h += '</div>';
    el.innerHTML = h;
  }

  /* ---- Eventi (delegati, limitati a #bestiaryBody) ---- */
  document.addEventListener('click', function (e) {
    var el = host(); if (!el || !el.contains(e.target)) return;

    var openC = e.target.closest('[data-bestopen]');
    if (openC) { view.curId = openC.dataset.bestopen; view.mode = 'preview'; render(); return; }

    if (e.target.closest('[data-bestback]')) { view.mode = 'list'; render(); return; }

    if (e.target.closest('[data-bestnew]')) {
      var nid = window.cmBestiary.upsert(blankMonster());
      view.mode = 'preview'; view.curId = nid; render();
      var obj = getById(nid);
      if (obj && window.cmOpenMonsterEditor) window.cmOpenMonsterEditor(obj, window.cmBestiary.save);
      return;
    }

    var addB = e.target.closest('[data-bestadd]');
    if (addB) {
      var ma = getById(addB.dataset.bestadd);
      if (ma && window.cmAddEnemyFromMonster) window.cmAddEnemyFromMonster(ma);
      return;
    }

    var edB = e.target.closest('[data-bestedit]');
    if (edB) {
      var me = getById(edB.dataset.bestedit);
      if (me && window.cmOpenMonsterEditor) window.cmOpenMonsterEditor(me, window.cmBestiary.save);
      return;
    }

    var dlB = e.target.closest('[data-bestdel]');
    if (dlB) {
      var id = dlB.dataset.bestdel;
      var md = getById(id);
      var nm = md ? (md.name || '(senza nome)') : '';
      var doDel = function () { window.cmBestiary.remove(id); view.mode = 'list'; render(); };
      if (typeof window.pgConfirm === 'function') window.pgConfirm('Eliminare "' + nm + '" dal bestiario?\nL\'azione è irreversibile.', doDel, { title: 'Elimina dal bestiario', okLabel: 'Elimina' });
      else if (confirm('Eliminare "' + nm + '" dal bestiario?')) doDel();
      return;
    }
  });

  /* Ricerca: filtra la lista mantenendo il focus nel campo. */
  document.addEventListener('input', function (e) {
    if (!e.target || e.target.id !== 'bestSearch') return;
    view.q = e.target.value;
    var el = host(); if (!el) return;
    renderList(el);
    var s = document.getElementById('bestSearch');
    if (s) { s.focus(); var v = s.value; try { s.setSelectionRange(v.length, v.length); } catch (_) {} }
  });

  /* ---- Stili (iniettati: tutto il codice del bestiario resta esterno) ---- */
  var css =
    '.best__bar{display:flex;gap:6px;align-items:center;margin-bottom:8px;position:sticky;top:0;background:var(--bg2);padding-bottom:6px;z-index:2}' +
    '.best__search{flex:1;min-width:0;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 9px;color:var(--text);font-family:var(--mono);font-size:.74rem;outline:none;transition:border-color .12s}' +
    '.best__search:focus{border-color:var(--gold)}' +
    '.best__add{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:6px 11px;color:var(--gold);font-family:var(--mono);font-size:.72rem;cursor:var(--cur-pointer);white-space:nowrap;transition:all .12s}' +
    '.best__add:hover{border-color:var(--gold);background:rgba(196,154,50,.08)}' +
    '.best__empty{text-align:center;color:var(--muted);font-family:var(--mono);font-size:.72rem;line-height:1.7;padding:26px 12px}' +
    '.best__list{display:flex;flex-direction:column;gap:5px}' +
    '.best__card{display:flex;align-items:center;gap:9px;padding:7px 9px;background:var(--bg);border:1px solid var(--border);border-radius:8px;cursor:var(--cur-pointer);transition:border-color .12s,background .12s}' +
    '.best__card:hover{border-color:var(--gold);background:rgba(196,154,50,.05)}' +
    '.best__emoji{font-size:1.2rem;flex-shrink:0;line-height:1}' +
    '.best__info{flex:1;min-width:0}' +
    '.best__name{font-family:var(--mono);font-size:.78rem;color:var(--text);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.best__meta{font-family:var(--mono);font-size:.62rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.best__statmini{display:flex;gap:8px;font-family:var(--mono);font-size:.66rem;color:var(--dim);flex-shrink:0}' +
    '.best__pv-head{margin-bottom:8px}' +
    '.best__back{background:transparent;border:1px solid var(--border);border-radius:6px;padding:4px 10px;color:var(--dim);font-family:var(--mono);font-size:.7rem;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__back:hover{color:var(--gold);border-color:var(--gold)}' +
    '.best__pv{display:flex;flex-direction:column;gap:8px}' +
    '.best__pv-id{display:flex;align-items:center;gap:10px}' +
    '.best__pv-emoji{font-size:1.8rem;line-height:1}' +
    '.best__pv-name{font-family:var(--mono);font-size:1rem;color:var(--gold);font-weight:700}' +
    '.best__pv-sub{font-family:var(--mono);font-size:.66rem;color:var(--muted);text-transform:capitalize}' +
    '.best__pv-stats{display:flex;flex-wrap:wrap;gap:10px;font-family:var(--mono);font-size:.74rem;color:var(--text);padding:7px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}' +
    '.best__pv-stats strong{color:var(--gold)}' +
    '.best__pv-abs{display:flex;gap:5px}' +
    '.best__ab{flex:1;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:5px 2px}' +
    '.best__ab-l{font-family:var(--mono);font-size:.56rem;color:var(--muted)}' +
    '.best__ab-v{font-family:var(--mono);font-size:.82rem;color:var(--text);font-weight:700}' +
    '.best__ab-m{font-family:var(--mono);font-size:.66rem;color:var(--gold)}' +
    '.best__pv-sec{display:flex;flex-direction:column;gap:3px}' +
    '.best__pv-sectitle{font-family:var(--mono);font-size:.68rem;color:var(--gold);text-transform:uppercase;letter-spacing:.04em;font-weight:600;border-bottom:1px solid var(--border);padding-bottom:2px;margin-top:4px}' +
    '.best__pv-item{padding:3px 0}' +
    '.best__pv-iname{font-family:var(--mono);font-size:.72rem;color:var(--text);font-weight:600}' +
    '.best__pv-idesc,.best__pv-notes{font-family:var(--mono);font-size:.68rem;color:var(--dim);line-height:1.45;white-space:pre-wrap;word-break:break-word}' +
    '.best__pv-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;border-top:1px solid var(--border);padding-top:10px}' +
    '.best__btn{flex:1;min-width:110px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-family:var(--mono);font-size:.72rem;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__btn:hover{border-color:var(--gold);color:var(--gold)}' +
    '.best__btn--add{border-color:rgba(196,154,50,.4);color:var(--gold)}' +
    '.best__btn--add:hover{background:rgba(196,154,50,.1)}' +
    '.best__btn--del{color:var(--red);border-color:var(--rb)}' +
    '.best__btn--del:hover{background:var(--rl);color:var(--red)}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---- Render iniziale ---- */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
