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

  /* ----------------------------------------------------------------------------
     PRESET — mostri di partenza. Tutti i campi sono mappati 1:1 sullo schema
     della scheda nemico (enemy-shaped) così il trasferimento "Aggiungi ai
     Nemici" non perde nulla. I tiri salvezza/abilità sono override solo dove il
     valore differisce dal modificatore di caratteristica; gli XP derivano dalla
     CR. La lore va in `notes`, il tesoro in `drop`.
     ------------------------------------------------------------------------- */
  var AARAKOCRA_LORE = 'Gli aarakocra sono esseri simili ad uccelli che solcano i cieli di innumerevoli mondi e le infinite distese del Piano Elementale dell\'Aria. Spesso ricordano gli uccelli comuni delle regioni in cui vivono: alcuni assomigliano a falchi o condor, mentre altri ricordano colibrì o archeotteri.\n\nIn molte terre, gli aarakocra narrano le gesta dei loro antichi eroi che combatterono la malvagia Regina del Caos Alato insieme ai misteriosi Duchi del Vento di Aaqa.';
  var PRESETS = [
    {
      id: 'preset_aarakocra_aeromante', name: 'Aarakocra Aeromante', emoji: '🦅', rarity: 'uncommon',
      type: 'Elementale', size: 'Media', alignment: 'Neutrale',
      ac: 16, hp: 66, hpCur: 66, hpTemp: 0, hpDice: '12d8+12', init: 3,
      speed: '6 m, Volare 15 m', cr: '4', xp: '',
      str: 10, dex: 16, con: 12, intl: 13, wis: 17, cha: 12,
      savesOverride: { str: '', dex: '5', con: '', intl: '', wis: '5', cha: '' },
      skillOverrides: { arcano: '3', natura: '5', percezione: '7' },
      passivePerception: 17, senses: [],
      languages: ['Aarakocra', 'Primordiale (Auran)'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Multiattacco', desc: 'L\'aarakocra effettua due attacchi con il Bastone del Vento e può utilizzare Incantare per lanciare Raffica di Vento.' },
        { name: 'Bastone del Vento', desc: 'Attacco con arma da mischia o a distanza: +5 a colpire.\nPortata 1,5 m oppure gittata 36/72 m.\nColpito: 7 (1d8 + 3) danni contundenti più 11 (2d10) danni da fulmine.', atkHit: '+5', atkDmgs: [{ f: '1d8+3', t: 'contundenti' }, { f: '2d10', t: 'fulmine' }] },
        { name: 'Incantare', desc: 'L\'aarakocra lancia uno dei seguenti incantesimi senza componenti materiali, usando la Saggezza come caratteristica da incantatore (CD 13 per i tiri salvezza).\n\nA volontà: Controllo Elementale (Elementalism), Raffica di Vento (Gust of Wind), Mano Magica (Mage Hand), Messaggio (Message).\n\n1 volta al giorno: Fulmine (Lightning Bolt).' }
      ],
      bonusActions: [],
      reactions: [
        { name: 'Caduta Piumata (1/Giorno)', desc: 'In risposta al normale innesco dell\'incantesimo, l\'aarakocra lancia Caduta Morbida (Feather Fall) usando la stessa caratteristica da incantatore di Incantare.' }
      ],
      legendaryActions: [],
      drop: [{ name: 'Tesoro', desc: 'Oggetti personali, equipaggiamento individuale.' }],
      notes: 'Guardiani Alati del Cielo\n\nHabitat: Montagne, Piani (Piano Elementale dell\'Aria)\n\nGli aeromanti aarakocra controllano venti magici provenienti dalle tempeste infinite del Piano Elementale dell\'Aria.\n\n' + AARAKOCRA_LORE
    },
    {
      id: 'preset_aarakocra_schermagliatore', name: 'Aarakocra Schermagliatore', emoji: '🪶', rarity: 'common',
      type: 'Elementale', size: 'Media', alignment: 'Neutrale',
      ac: 12, hp: 11, hpCur: 11, hpTemp: 0, hpDice: '2d8+2', init: 2,
      speed: '6 m, Volare 15 m', cr: '1/4', xp: '',
      str: 10, dex: 14, con: 12, intl: 11, wis: 12, cha: 11,
      savesOverride: { str: '', dex: '', con: '', intl: '', wis: '', cha: '' },
      skillOverrides: { percezione: '5' },
      passivePerception: 15, senses: [],
      languages: ['Aarakocra', 'Primordiale (Auran)'],
      dmgResist: [], dmgImmune: [], dmgVulner: [], condImmune: [],
      traits: [],
      actions: [
        { name: 'Artigli', desc: 'Attacco in mischia: +4 a colpire, portata 1,5 m.\nColpito: 4 (1d4 + 2) danni taglienti.\nSe l\'aarakocra ha volato per almeno 9 metri in linea retta verso il bersaglio immediatamente prima dell\'attacco, infligge invece 9 (3d4 + 2) danni taglienti.', atkHit: '+4', atkDmgs: [{ f: '1d4+2', t: 'taglienti' }] },
        { name: 'Giavellotto del Vento', desc: 'Attacco in mischia o a distanza: +4 a colpire.\nPortata 1,5 m oppure gittata 9/36 m.\nColpito: 5 (1d6 + 2) danni perforanti più 2 (1d4) danni da tuono.\nColpisca o manchi il bersaglio, dopo un attacco a distanza il giavellotto ritorna magicamente nella mano dell\'aarakocra immediatamente dopo il lancio.', atkHit: '+4', atkDmgs: [{ f: '1d6+2', t: 'perforanti' }, { f: '1d4', t: 'tuono' }] }
      ],
      bonusActions: [], reactions: [], legendaryActions: [],
      drop: [{ name: 'Tesoro', desc: 'Oggetti personali, equipaggiamento individuale.' }],
      notes: 'Guardiani Alati del Cielo\n\nHabitat: Montagne, Piani (Piano Elementale dell\'Aria)\n\nGli schermagliatori aarakocra sono esperti nel combattere i nemici in volo tra le nuvole. Spesso attaccano le minacce terrestri con rapide picchiate provenienti dall\'alto.\n\n' + AARAKOCRA_LORE
    }
  ];

  /* Il "Bestiario" ufficiale vive nei PRESETS (codice, sola lettura). cm_bestiary
     contiene ORA solo i mostri "Personalizzati" creati dall'utente. Migrazione:
     rimuove eventuali preset seminati in passato. */
  function isOfficialId(id) { for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return true; return false; }
  var data = load().filter(function (m) { return m && String(m.id || '').indexOf('preset_') !== 0; });
  persist();

  function genId() { return 'm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function abMod(s) { return Math.floor(((s | 0) - 10) / 2); }
  function fmtMod(m) { return m >= 0 ? '+' + m : '' + m; }
  function host() { return document.getElementById('bestiaryBody'); }
  function getById(id) { for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return PRESETS[i]; for (var j = 0; j < data.length; j++) if (data[j].id === id) return data[j]; return null; }
  function currentList() { return view.tab === 'custom' ? data : PRESETS; }

  /* Foto del mostro: usa l'upload (m.photo, base64) se presente; altrimenti un
     file nel repo il cui nome corrisponde al nome della creatura:
     img/bestiary/<slug>.webp (slug = minuscolo, accenti rimossi, simboli→'-').
     Se il file manca → placeholder (registrato in imgCache per non riprovare). */
  var IMG_DIR = 'img/bestiary/';
  function slugForName(name) {
    return String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function derivedPhoto(name) { var s = slugForName(name); return s ? (IMG_DIR + s + '.webp') : ''; }
  window.cmBestiarySlug = slugForName;
  var imgCache = {};
  window.__bestImg = function (src, ok, el) { imgCache[src] = ok ? 'ok' : 'fail'; if (!ok && el && el.remove) el.remove(); };
  function monsterPhotoHtml(m) {
    var ph = '<svg class="best__photo-ph" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
    var src = m.photo || derivedPhoto(m.name);
    if (!src) return ph;
    var isData = src.slice(0, 5) === 'data:';
    if (!isData && imgCache[src] === 'fail') return ph;
    var handlers = isData ? '' : (' onload="window.__bestImg(\'' + src + '\',1)" onerror="window.__bestImg(\'' + src + '\',0,this)"');
    return ph + '<img class="best__photo-img" src="' + esc(src) + '" alt=""' + handlers + '>';
  }

  /* ---- Rarità in base alla CR (colore bordo/bagliore/foil della figurina) ---- */
  function crNum(cr) {
    if (cr == null || cr === '') return -1;
    var s = String(cr).trim();
    if (s.indexOf('/') >= 0) { var p = s.split('/'); return (parseFloat(p[0]) || 0) / (parseFloat(p[1]) || 1); }
    return parseFloat(s) || 0;
  }
  var RARITIES = {
    common:    { c1: '#7d8794', c2: '#aeb8c4', glow: 'rgba(165,178,194,.42)', holo: .10 },
    uncommon:  { c1: '#3fae5a', c2: '#86e89a', glow: 'rgba(70,200,110,.48)',  holo: .20 },
    rare:      { c1: '#3b82f6', c2: '#8fd3ff', glow: 'rgba(70,150,255,.52)',  holo: .30 },
    epic:      { c1: '#a855f7', c2: '#e2b6ff', glow: 'rgba(180,90,250,.56)',  holo: .40 },
    legendary: { c1: '#f59e0b', c2: '#ffe39a', glow: 'rgba(245,175,40,.64)',  holo: .50 }
  };
  var RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  var RARITY_NAMES = { common: 'Comune', uncommon: 'Non comune', rare: 'Raro', epic: 'Epico', legendary: 'Leggendario' };
  /* Fallback solo per mostri legacy senza rarità esplicita: derivata dalla CR. */
  function rarityKeyForCr(cr) {
    var n = crNum(cr);
    if (n < 2) return 'common';
    if (n < 5) return 'uncommon';
    if (n < 11) return 'rare';
    if (n < 17) return 'epic';
    return 'legendary';
  }
  function rarityKeyOf(m) { var k = m && m.rarity; if (k === 'mythic') k = 'legendary'; return (k && RARITIES[k]) ? k : rarityKeyForCr(m && m.cr); }
  function rarityOf(m) { return RARITIES[rarityKeyOf(m)] || RARITIES.common; }
  function rarityVars(m) { var r = rarityOf(m); return '--rare-c1:' + r.c1 + ';--rare-c2:' + r.c2 + ';--glow:' + r.glow + ';--holo:' + r.holo + ';'; }

  /* Tutti i tipi (come nella scheda nemico) e la scala CR per i filtri. */
  var BEST_TYPES = ['Aberrazione', 'Bestia', 'Celestiale', 'Costrutto', 'Drago', 'Elementale', 'Fata', 'Gigante', 'Immondo', 'Melma', 'Mostruosità', 'Non Morto', 'Pianta', 'Umanoide'];
  var BEST_CR_SCALE = ['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];

  function blankMonster() {
    return { name: 'Nuovo mostro', emoji: '🐾', rarity: 'common', ac: 10, hp: 10, hpCur: 10, hpTemp: 0, init: 0,
             cr: '', xp: '', hpDice: '', str: 10, dex: 10, con: 10, intl: 10, wis: 10, cha: 10 };
  }

  /* ---- Stato vista (split: lista a sx, anteprima a dx; tab official|custom) ---- */
  var view = { tab: 'official', curId: null, q: '', fRarities: [], fTypes: [], fCrMin: 0, fCrMax: 33, openFilter: null, sortKey: '', sortDir: 'asc' };

  /* ---- Caricamento foto mostro (stessa compressione della scheda nemico) ---- */
  var pendingPhotoId = null;
  var fileInput = document.createElement('input');
  fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.style.display = 'none';
  function ensureFileInput() { if (!fileInput.parentNode && document.body) document.body.appendChild(fileInput); }
  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0];
    var id = pendingPhotoId; pendingPhotoId = null; fileInput.value = '';
    if (!f || !id || typeof window.cmProcessMonsterImg !== 'function') return;
    window.cmProcessMonsterImg(f, function (thumb, full) {
      var m = getById(id); if (!m) return;
      m.photo = thumb; m.photoFull = full; persist(); render();
    });
  });

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

  /* ---- Render: due colonne (lista a sinistra, anteprima a destra) ---- */
  function render() {
    var el = host(); if (!el) return;
    var left = el.querySelector('.best__left'), right = el.querySelector('.best__right');
    if (!left || !right) {
      el.innerHTML = '<div class="best__left"></div><div class="best__right"></div>';
      left = el.querySelector('.best__left'); right = el.querySelector('.best__right');
    }
    renderLeftInto(left); renderRightInto(right);
  }
  /* Aggiorna solo la colonna sinistra (per non perdere il focus dalla ricerca). */
  function renderLeft() { var el = host(); if (!el) return; var left = el.querySelector('.best__left'); if (left) renderLeftInto(left); }
  function renderRight() { var el = host(); if (!el) return; var right = el.querySelector('.best__right'); if (right) renderRightInto(right); }

  function renderLeftInto(left) {
    var isCustom = view.tab === 'custom';
    var lastIdx = BEST_CR_SCALE.length - 1;
    var lp = (view.fCrMin / lastIdx) * 100, rp = (view.fCrMax / lastIdx) * 100;
    var h = '<div class="best__tabs">' +
      '<button class="best__tab' + (view.tab === 'official' ? ' best__tab--on' : '') + '" data-besttab="official" type="button">Bestiario</button>' +
      '<button class="best__tab' + (isCustom ? ' best__tab--on' : '') + '" data-besttab="custom" type="button">Personalizzati</button>' +
      '</div>';
    h += '<div class="best__bar"><input class="best__search" id="bestSearch" placeholder="Cerca mostro..." value="' + esc(view.q) + '" spellcheck="false">' +
      (isCustom ? '<button class="best__add" data-bestnew="1" type="button" title="Nuovo mostro">＋</button>' : '') + '</div>';
    var crActive = (view.fCrMin > 0 || view.fCrMax < lastIdx) ? 1 : 0;
    var anyActive = view.fRarities.length || view.fTypes.length || crActive || view.sortKey;
    h += '<div class="best__filters">';
    h += '<div class="best__fbar">' +
      filterToggle('rarity', 'Rarità', view.fRarities.length, false) +
      filterToggle('type', 'Tipo', view.fTypes.length, false) +
      filterToggle('cr', 'Sfida', crActive, true) +
      filterToggle('sort', 'Ordina', view.sortKey ? 1 : 0, true) +
      '<button class="best__freset' + (anyActive ? '' : ' best__freset--off') + '" data-bestreset="1" type="button" title="Reimposta filtri e ordinamento">↺</button>' +
      '</div>';
    if (view.openFilter) {
      h += '<div class="best__fpanel">' +
        (view.openFilter === 'rarity' ? rarityPanelHtml()
          : view.openFilter === 'type' ? typePanelHtml()
            : view.openFilter === 'cr' ? crPanelHtml()
              : sortPanelHtml()) +
        '</div>';
    }
    h += '</div>';
    h += '<div class="best__cards"></div>';
    left.innerHTML = h;
    fillCards();
    updateFilterChrome();
  }

  /* Bottone-filtro compatto (apre/chiude il pannello relativo). */
  function filterToggle(key, label, count, dot) {
    var open = view.openFilter === key, active = count > 0;
    return '<button class="best__ftoggle' + (open ? ' best__ftoggle--open' : '') + (active ? ' best__ftoggle--active' : '') + '" data-bestfopen="' + key + '" type="button">' +
      '<span class="best__ftoggle-lbl">' + label + '</span>' +
      '<span class="best__fcount' + (dot ? ' best__fcount--dot' : '') + '" data-fbadge="' + key + '"' + (active ? '' : ' style="display:none"') + '>' + (active && !dot ? count : '') + '</span>' +
      '<span class="best__fcaret">▾</span></button>';
  }
  function rarityPanelHtml() {
    return '<div class="best__chiprow">' + RARITY_ORDER.map(function (k) {
      var rr = RARITIES[k];
      return '<button class="best__fchip' + (view.fRarities.indexOf(k) >= 0 ? ' best__fchip--on' : '') + '" data-bestfrar="' + k + '" style="--c1:' + rr.c1 + ';--c2:' + rr.c2 + '" type="button"><span class="best__rarity-dot"></span>' + RARITY_NAMES[k] + '</button>';
    }).join('') + '</div>';
  }
  function typePanelHtml() {
    return '<div class="best__chiprow">' + BEST_TYPES.map(function (t) {
      return '<button class="best__fchip' + (view.fTypes.indexOf(t) >= 0 ? ' best__fchip--on' : '') + '" data-bestftype="' + esc(t) + '" type="button">' + esc(t) + '</button>';
    }).join('') + '</div>';
  }
  function crPanelHtml() {
    var lastIdx = BEST_CR_SCALE.length - 1;
    var lp = (view.fCrMin / lastIdx) * 100, rp = (view.fCrMax / lastIdx) * 100;
    return '<div class="best__cr-head"><span>Grado di sfida</span><span class="best__cr-val" id="bestCrVal">' + BEST_CR_SCALE[view.fCrMin] + ' – ' + BEST_CR_SCALE[view.fCrMax] + '</span></div>' +
      '<div class="best__cr-slider"><div class="best__cr-rail"></div><div class="best__cr-fill" id="bestCrFill" style="left:' + lp + '%;width:' + (rp - lp) + '%"></div>' +
      '<input type="range" class="best__cr-thumb" min="0" max="' + lastIdx + '" step="1" value="' + view.fCrMin + '" data-bestcr="min">' +
      '<input type="range" class="best__cr-thumb" min="0" max="' + lastIdx + '" step="1" value="' + view.fCrMax + '" data-bestcr="max"></div>';
  }

  var SORT_OPTS = [['alpha', 'Alfabetico'], ['type', 'Tipo'], ['cr', 'Sfida (CR)'], ['rarity', 'Rarità']];
  function sortPanelHtml() {
    var chips = SORT_OPTS.map(function (o) {
      return '<button class="best__fchip' + (view.sortKey === o[0] ? ' best__fchip--on' : '') + '" data-bestsort="' + o[0] + '" type="button">' + o[1] + '</button>';
    }).join('');
    var desc = view.sortDir === 'desc';
    return '<div class="best__chiprow">' + chips + '</div>' +
      '<button class="best__dirbtn' + (view.sortKey ? '' : ' best__dirbtn--off') + '" data-bestsortdir="1" type="button">' +
      (desc ? 'Decrescente <span class="best__diric">↓</span>' : 'Crescente <span class="best__diric">↑</span>') + '</button>';
  }

  function rarityRank(m) { var i = RARITY_ORDER.indexOf(rarityKeyOf(m)); return i < 0 ? 0 : i; }
  function sortItems(items) {
    if (!view.sortKey) return items;
    var dir = view.sortDir === 'desc' ? -1 : 1, key = view.sortKey;
    var byName = function (a, b) { return String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' }); };
    var arr = items.slice();
    arr.sort(function (a, b) {
      var r = 0;
      if (key === 'alpha') r = byName(a, b);
      else if (key === 'type') r = String(a.type || '').localeCompare(String(b.type || ''), 'it', { sensitivity: 'base' });
      else if (key === 'cr') r = crNum(a.cr) - crNum(b.cr);
      else if (key === 'rarity') r = rarityRank(a) - rarityRank(b);
      if (r === 0) r = byName(a, b);
      return r * dir;
    });
    return arr;
  }

  /* Aggiorna badge/stato-attivo dei bottoni-filtro senza ricostruire il pannello. */
  function updateFilterChrome() {
    var el = host(); if (!el) return;
    var lastIdx = BEST_CR_SCALE.length - 1;
    var crA = (view.fCrMin > 0 || view.fCrMax < lastIdx) ? 1 : 0;
    var info = { rarity: view.fRarities.length, type: view.fTypes.length, cr: crA, sort: view.sortKey ? 1 : 0 };
    ['rarity', 'type', 'cr', 'sort'].forEach(function (k) {
      var btn = el.querySelector('[data-bestfopen="' + k + '"]'); if (!btn) return;
      var n = info[k], dot = (k === 'cr' || k === 'sort');
      btn.classList.toggle('best__ftoggle--active', n > 0);
      var cnt = btn.querySelector('.best__fcount');
      if (cnt) { cnt.textContent = (n && !dot) ? String(n) : ''; cnt.style.display = n ? '' : 'none'; }
    });
    var reset = el.querySelector('[data-bestreset]');
    if (reset) reset.classList.toggle('best__freset--off', !(view.fRarities.length || view.fTypes.length || crA || view.sortKey));
  }

  /* Aggiorna SOLO le card filtrate (i controlli filtro/ricerca restano intatti,
     così non si perde il focus né lo stato dello slider/chip). */
  function fillCards() {
    var el = host(); var wrap = el && el.querySelector('.best__cards'); if (!wrap) return;
    var list = currentList();
    var isCustom = view.tab === 'custom';
    var q = (view.q || '').toLowerCase();
    var lastIdx = BEST_CR_SCALE.length - 1;
    var crActive = view.fCrMin > 0 || view.fCrMax < lastIdx;
    var minVal = crNum(BEST_CR_SCALE[view.fCrMin]), maxVal = crNum(BEST_CR_SCALE[view.fCrMax]);
    var items = list.filter(function (m) {
      if (q && (m.name || '').toLowerCase().indexOf(q) < 0 && String(m.type || '').toLowerCase().indexOf(q) < 0) return false;
      if (view.fRarities.length && view.fRarities.indexOf(rarityKeyOf(m)) < 0) return false;
      if (view.fTypes.length && view.fTypes.indexOf(m.type || '') < 0) return false;
      if (crActive) { var cn = crNum(m.cr); if (cn >= 0 && (cn < minVal || cn > maxVal)) return false; }
      return true;
    });
    if (!list.length) {
      wrap.innerHTML = '<div class="best__empty">' + (isCustom
        ? 'Nessun mostro personalizzato.<br>Crea con <strong>＋</strong>, oppure salva un Nemico nel bestiario (menu ⋮ → <em>Salva nel bestiario</em>).'
        : 'Bestiario vuoto.') + '</div>';
      return;
    }
    if (!items.length) { wrap.innerHTML = '<div class="best__empty">Nessun risultato con i filtri attuali.</div>'; return; }
    items = sortItems(items);
    var ch = '<div class="best__list">';
    items.forEach(function (m) {
      var on = (m.id === view.curId) ? ' best__card--on' : '';
      var typeBadge = m.type ? '<span class="best__corner best__corner--tl">' + esc(m.type) + '</span>' : '';
      var crBadge = (m.cr != null && m.cr !== '') ? '<span class="best__corner best__corner--tr">' + esc(String(m.cr)) + '</span>' : '';
      ch += '<div class="best__card' + on + '" data-bestopen="' + esc(m.id) + '" draggable="true" style="' + rarityVars(m) + '">' +
        '<div class="best__photo">' + typeBadge + crBadge + monsterPhotoHtml(m) + '</div>' +
        '<div class="best__name">' + esc(m.name || '(senza nome)') + '</div>' +
        '<div class="best__holo"></div><div class="best__shine"></div>' +
        '</div>';
    });
    ch += '</div>';
    wrap.innerHTML = ch;
  }

  /* ---- Configuratore attacco (anteprima): righe danno {f,t} + bonus colpire.
     Sola lettura per i mostri ufficiali, editabile per i personalizzati. ---- */
  var BEST_TRASH = '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>';
  function bestItemDmgs(it) { if (it && Array.isArray(it.atkDmgs)) return it.atkDmgs; if (it && it.atkDmg != null && String(it.atkDmg).trim()) return [{ f: String(it.atkDmg), t: '' }]; return []; }
  function bestEnsureDmgs(it) { if (!Array.isArray(it.atkDmgs)) { it.atkDmgs = (it.atkDmg != null && String(it.atkDmg).trim()) ? [{ f: String(it.atkDmg), t: '' }] : []; if ('atkDmg' in it) delete it.atkDmg; } return it.atkDmgs; }
  function bestHasAtk(it) { if (!it || typeof it !== 'object') return false; if (it.atkHit && String(it.atkHit).trim()) return true; var d = bestItemDmgs(it); for (var i = 0; i < d.length; i++) if (d[i] && d[i].f && String(d[i].f).trim()) return true; return false; }
  function bestHasAtkCfg(it) { return !!(it && typeof it === 'object' && (it.atkHit != null || Array.isArray(it.atkDmgs) || (it.atkDmg != null && String(it.atkDmg).trim()))); }
  function bestAtkConfigHTML(o, key, i, ro) {
    var atkable = (key === 'actions' || key === 'bonusActions' || key === 'legendaryActions' || key === 'reactions');
    if (ro) {
      if (!bestHasAtk(o)) return '';
      var hh = (o.atkHit && String(o.atkHit).trim()) ? '<span class="best__atk-chip">🎯 ' + esc(String(o.atkHit).trim()) + ' al colpire</span>' : '';
      var dd = bestItemDmgs(o).filter(function (d) { return d && d.f && String(d.f).trim(); }).map(function (d) { return '<span class="best__atk-chip">⚔️ ' + esc(String(d.f).trim()) + (d.t && String(d.t).trim() ? ' <em>' + esc(String(d.t).trim()) + '</em>' : '') + '</span>'; }).join('');
      if (!hh && !dd) return '';
      return '<div class="best__atk best__atk--ro">' + hh + dd + '</div>';
    }
    if (bestHasAtkCfg(o)) {
      var rows = bestItemDmgs(o).map(function (d, j) {
        return '<div class="best__atk-drow"><span class="best__atk-ico">⚔️</span><input class="best__atk-in best__atk-in--f" data-bestdmg="' + key + '-' + i + '-' + j + '" data-bestdmgf="f" value="' + esc(d.f || '') + '" placeholder="1d8+3" title="Formula danni"><input class="best__atk-in best__atk-in--t" data-bestdmg="' + key + '-' + i + '-' + j + '" data-bestdmgf="t" value="' + esc(d.t || '') + '" placeholder="tipo (es. fulmine)" title="Tipo di danno"><button class="best__atk-del" data-bestdmgdel="' + key + '-' + i + '-' + j + '" type="button" title="Rimuovi danno">' + BEST_TRASH + '</button></div>';
      }).join('');
      return '<div class="best__atk best__atk--edit"><div class="best__atk-hrow"><span class="best__atk-ico">🎯</span><input class="best__atk-in best__atk-in--hit" data-bestatkhit="' + key + '-' + i + '" value="' + esc(o.atkHit != null ? String(o.atkHit) : '') + '" placeholder="+5" title="Bonus al tiro per colpire"><button class="best__atk-dadd" data-bestdmgadd="' + key + '-' + i + '" type="button" title="Aggiungi un tipo di danno">+ danno</button></div>' + rows + '</div>';
    }
    if (atkable) return '<button class="best__atk-init" data-bestatkinit="' + key + '-' + i + '" type="button">⚔️ Aggiungi attacco</button>';
    return '';
  }

  function renderRightInto(right) {
    var m = getById(view.curId);
    if (!m) {
      right.innerHTML = '<div class="best__placeholder"><div class="best__placeholder-ico">📖</div><div>Seleziona un mostro dalla lista<br>per vederne l\'anteprima.</div></div>';
      return;
    }
    var abils = [['FOR', 'str'], ['DES', 'dex'], ['COS', 'con'], ['INT', 'intl'], ['SAG', 'wis'], ['CAR', 'cha']];
    var abH = abils.map(function (a) {
      var v = m[a[1]] != null ? m[a[1]] : 10;
      return '<div class="best__ab"><div class="best__ab-l">' + a[0] + '</div><div class="best__ab-v">' + esc(v) + '</div><div class="best__ab-m">' + fmtMod(abMod(v)) + '</div></div>';
    }).join('');

    function secList(title, key) {
      var arr = m[key] || []; if (!arr.length) return '';
      var rows = arr.map(function (it, i) {
        var o = (typeof it === 'string') ? { name: it, desc: '' } : (it || {});
        return '<div class="best__pv-item"><div class="best__pv-iname">' + esc(o.name || '') + '</div>' +
          (o.desc ? '<div class="best__pv-idesc">' + esc(o.desc) + '</div>' : '') +
          bestAtkConfigHTML(o, key, i, _ro) + '</div>';
      }).join('');
      return '<div class="best__pv-sec"><div class="best__pv-sectitle">' + title + '</div>' + rows + '</div>';
    }

    var xpVal = (m.xp != null && m.xp !== '') ? m.xp : (window.cmXpForCr ? window.cmXpForCr(m.cr) : null);
    /* Righe meta: tiri salvezza/abilità (solo dove c'è override), sensi +
       percezione passiva, lingue, difese. */
    var SAVE_L = { str: 'FOR', dex: 'DES', con: 'COS', intl: 'INT', wis: 'SAG', cha: 'CAR' };
    var SKILL_N = { atletica: 'Atletica', acrobazia: 'Acrobazia', furtivita: 'Furtività', rapidita: 'Rapidità di Mano', arcano: 'Arcano', indagare: 'Indagare', natura: 'Natura', religione: 'Religione', storia: 'Storia', animali: 'Addest. Animali', intuizione: 'Intuizione', medicina: 'Medicina', percezione: 'Percezione', sopravvivenza: 'Sopravvivenza', inganno: 'Inganno', intimidire: 'Intimidire', intrattenere: 'Intrattenere', persuasione: 'Persuasione' };
    function metaLine(label, val) { return val ? '<div class="best__pv-line"><span class="best__pv-llabel">' + label + '</span> ' + esc(val) + '</div>' : ''; }
    var so = m.savesOverride || {};
    var savesTxt = Object.keys(SAVE_L).filter(function (k) { return so[k] != null && so[k] !== ''; }).map(function (k) { return SAVE_L[k] + ' ' + fmtMod(parseInt(so[k], 10) || 0); }).join(', ');
    var sko = m.skillOverrides || {};
    var skillsTxt = Object.keys(sko).filter(function (k) { return sko[k] != null && sko[k] !== ''; }).map(function (k) { return (SKILL_N[k] || k) + ' ' + fmtMod(parseInt(sko[k], 10) || 0); }).join(', ');
    var sensesTxt = (m.senses || []).map(function (s) { return ((s.type || '') + (s.value ? ' ' + s.value + ' ' + (s.unit || 'm') : '')).trim(); }).filter(Boolean).join(', ');
    var ppVal = (m.passivePerception != null && m.passivePerception !== '') ? m.passivePerception : (10 + abMod(m.wis != null ? m.wis : 10));
    var sensesFull = (sensesTxt ? sensesTxt + ', ' : '') + 'Percezione passiva ' + ppVal;
    var metaH = metaLine('Tiri salvezza', savesTxt) + metaLine('Abilità', skillsTxt) + metaLine('Sensi', sensesFull) +
      metaLine('Lingue', (m.languages || []).join(', ')) +
      metaLine('Resistenze', (m.dmgResist || []).join(', ')) + metaLine('Immunità ai danni', (m.dmgImmune || []).join(', ')) +
      metaLine('Vulnerabilità', (m.dmgVulner || []).join(', ')) + metaLine('Immunità a condizioni', (m.condImmune || []).join(', '));
    if (metaH) metaH = '<div class="best__pv-meta">' + metaH + '</div>';

    var _ro = isOfficialId(m.id);
    var pvPhoto = '<span class="best__pv-photo"' + (_ro ? '' : ' data-bestphoto="' + esc(m.id) + '" title="Carica o cambia foto"') + '>' + monsterPhotoHtml(m) + '</span>';
    var h = '<div class="best__pv">';
    h += '<div class="best__pv-id">' + pvPhoto + '<div>' +
      '<div class="best__pv-name">' + esc(m.name || '(senza nome)') + '</div>' +
      '<div class="best__pv-sub">' + esc(m.size || '') + (m.size && m.type ? ' ' : '') + esc(m.type || '') + (m.alignment ? ', ' + esc(m.alignment) : '') + '</div></div></div>';
    h += '<div class="best__pv-actions">' +
      '<button class="best__btn best__btn--add" data-bestadd="' + esc(m.id) + '" type="button">➕ Aggiungi ai Nemici</button>' +
      (_ro
        ? '<button class="best__btn" data-bestdup="' + esc(m.id) + '" type="button">⧉ Duplica in personalizzati</button>'
        : '<button class="best__btn" data-bestedit="' + esc(m.id) + '" type="button">✏️ Modifica</button>' +
          '<button class="best__btn best__btn--del" data-bestdel="' + esc(m.id) + '" type="button">🗑 Elimina</button>') +
      '</div>';
    h += '<div class="best__pv-stats">' +
      '<span>🛡️ <strong>' + esc(m.ac != null ? m.ac : '—') + '</strong> CA</span>' +
      '<span>❤️ <strong>' + esc(m.hp != null ? m.hp : '—') + '</strong> PF' + (m.hpDice ? ' (' + esc(m.hpDice) + ')' : '') + '</span>' +
      ((m.cr != null && m.cr !== '') ? '<span>CR <strong>' + esc(String(m.cr)) + '</strong></span>' : '') +
      ((xpVal != null && xpVal !== '') ? '<span><strong>' + esc(xpVal) + '</strong> XP</span>' : '') +
      (m.speed ? '<span>🦶 ' + esc(m.speed) + '</span>' : '') +
      '<span>⚡ <strong>' + fmtMod(m.init || 0) + '</strong> Iniz.</span>' +
      '</div>';
    var _curRar = rarityKeyOf(m);
    var _rr = RARITIES[_curRar] || RARITIES.common;
    var rarH;
    if (_ro) {
      rarH = '<div class="best__rarity"><div class="best__rarity-lbl">Rarità</div><div class="best__rarity-ro"><span class="best__rarity-dot" style="--c1:' + _rr.c1 + ';--c2:' + _rr.c2 + '"></span>' + RARITY_NAMES[_curRar] + '</div></div>';
    } else {
      rarH = '<div class="best__rarity"><div class="best__rarity-lbl">Rarità</div><div class="best__rarity-chips">' +
        RARITY_ORDER.map(function (k) {
          var rr = RARITIES[k];
          return '<button class="best__rarity-chip' + (k === _curRar ? ' best__rarity-chip--sel' : '') + '" data-bestrarity="' + k + '" style="--c1:' + rr.c1 + ';--c2:' + rr.c2 + '" title="' + RARITY_NAMES[k] + '"><span class="best__rarity-dot"></span>' + RARITY_NAMES[k] + '</button>';
        }).join('') + '</div></div>';
    }
    h += rarH + '<div class="best__pv-abs">' + abH + '</div>' + metaH;
    h += secList('✨ Tratti', 'traits') + secList('⚔️ Azioni', 'actions') + secList('🎯 Azioni bonus', 'bonusActions') +
      secList('⚡ Reazioni', 'reactions') + secList('👑 Azioni leggendarie', 'legendaryActions') + secList('💰 Drop', 'drop');
    if (m.notes) h += '<div class="best__pv-sec"><div class="best__pv-sectitle">📝 Note</div><div class="best__pv-notes">' + esc(m.notes) + '</div></div>';
    h += '</div>';
    right.innerHTML = h;
  }

  /* ---- Eventi (delegati, limitati a #bestiaryBody) ---- */
  document.addEventListener('click', function (e) {
    var el = host(); if (!el || !el.contains(e.target)) return;

    var tabBtn = e.target.closest('[data-besttab]');
    if (tabBtn) { var _t = tabBtn.dataset.besttab; if (_t !== view.tab) { view.tab = _t; view.curId = null; view.q = ''; view.fRarities = []; view.fTypes = []; view.fCrMin = 0; view.fCrMax = BEST_CR_SCALE.length - 1; view.openFilter = null; view.sortKey = ''; view.sortDir = 'asc'; render(); } return; }

    var fopenBtn = e.target.closest('[data-bestfopen]');
    if (fopenBtn) { var _fk = fopenBtn.dataset.bestfopen; view.openFilter = (view.openFilter === _fk) ? null : _fk; renderLeft(); return; }

    var resetBtn = e.target.closest('[data-bestreset]');
    if (resetBtn) { view.fRarities = []; view.fTypes = []; view.fCrMin = 0; view.fCrMax = BEST_CR_SCALE.length - 1; view.sortKey = ''; view.sortDir = 'asc'; renderLeft(); return; }

    var sortBtn = e.target.closest('[data-bestsort]');
    if (sortBtn) { var _sk = sortBtn.dataset.bestsort; view.sortKey = (view.sortKey === _sk) ? '' : _sk; renderLeft(); return; }

    var sortDirBtn = e.target.closest('[data-bestsortdir]');
    if (sortDirBtn) { if (!view.sortKey) return; view.sortDir = (view.sortDir === 'desc') ? 'asc' : 'desc'; renderLeft(); return; }

    var frarBtn = e.target.closest('[data-bestfrar]');
    if (frarBtn) { var _rk = frarBtn.dataset.bestfrar; var _ri = view.fRarities.indexOf(_rk); if (_ri >= 0) view.fRarities.splice(_ri, 1); else view.fRarities.push(_rk); frarBtn.classList.toggle('best__fchip--on'); fillCards(); updateFilterChrome(); return; }

    var ftypeBtn = e.target.closest('[data-bestftype]');
    if (ftypeBtn) { var _tk = ftypeBtn.dataset.bestftype; var _ti = view.fTypes.indexOf(_tk); if (_ti >= 0) view.fTypes.splice(_ti, 1); else view.fTypes.push(_tk); ftypeBtn.classList.toggle('best__fchip--on'); fillCards(); updateFilterChrome(); return; }

    var photoBtn = e.target.closest('[data-bestphoto]');
    if (photoBtn) { e.preventDefault(); e.stopPropagation(); pendingPhotoId = photoBtn.dataset.bestphoto; ensureFileInput(); fileInput.click(); return; }

    var rarBtn = e.target.closest('[data-bestrarity]');
    if (rarBtn) { var rm = getById(view.curId); if (rm && !isOfficialId(rm.id)) { rm.rarity = rarBtn.dataset.bestrarity; persist(); render(); } return; }

    /* Configuratore attacco (solo personalizzati): init / aggiungi danno / rimuovi danno. */
    var atkInit = e.target.closest('[data-bestatkinit]');
    if (atkInit) { var mi = getById(view.curId); if (!mi || isOfficialId(mi.id)) return; var ip = atkInit.dataset.bestatkinit.split('-'); var ik = ip[0], ii = parseInt(ip[1]); if (typeof mi[ik][ii] === 'string') mi[ik][ii] = { name: mi[ik][ii], desc: '' }; var iit = mi[ik][ii]; if (iit && typeof iit === 'object') { if (iit.atkHit == null) iit.atkHit = ''; bestEnsureDmgs(iit); if (!iit.atkDmgs.length) iit.atkDmgs.push({ f: '', t: '' }); persist(); renderRight(); var fi = host().querySelector('input[data-bestdmg="' + ik + '-' + ii + '-0"][data-bestdmgf="f"]'); if (fi) fi.focus(); } return; }

    var dmgAddB = e.target.closest('[data-bestdmgadd]');
    if (dmgAddB) { var ma = getById(view.curId); if (!ma || isOfficialId(ma.id)) return; var ap = dmgAddB.dataset.bestdmgadd.split('-'); var ak = ap[0], ai = parseInt(ap[1]); var ait = ma[ak] && ma[ak][ai]; if (ait && typeof ait === 'object') { bestEnsureDmgs(ait).push({ f: '', t: '' }); persist(); renderRight(); var nf = host().querySelector('input[data-bestdmg="' + ak + '-' + ai + '-' + (ait.atkDmgs.length - 1) + '"][data-bestdmgf="f"]'); if (nf) nf.focus(); } return; }

    var dmgDelB = e.target.closest('[data-bestdmgdel]');
    if (dmgDelB) { var mz = getById(view.curId); if (!mz || isOfficialId(mz.id)) return; var zp = dmgDelB.dataset.bestdmgdel.split('-'); var zk = zp[0], zi = parseInt(zp[1]), zj = parseInt(zp[2]); var zit = mz[zk] && mz[zk][zi]; if (zit && typeof zit === 'object') { var zarr = bestEnsureDmgs(zit); if (zarr[zj] != null) zarr.splice(zj, 1); persist(); renderRight(); } return; }

    var openC = e.target.closest('[data-bestopen]');
    if (openC) { view.curId = openC.dataset.bestopen; render(); return; }

    if (e.target.closest('[data-bestnew]')) {
      view.tab = 'custom';
      var nid = window.cmBestiary.upsert(blankMonster());
      view.curId = nid; render();
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

    var dupB = e.target.closest('[data-bestdup]');
    if (dupB) {
      var src = getById(dupB.dataset.bestdup);
      if (src) {
        var nid = window.cmBestiary.upsert(src); // clona con nuovo id nei personalizzati
        view.tab = 'custom'; view.curId = nid; view.q = ''; view.openFilter = null; render();
      }
      return;
    }

    var edB = e.target.closest('[data-bestedit]');
    if (edB) {
      var me = getById(edB.dataset.bestedit);
      if (me && !isOfficialId(me.id) && window.cmOpenMonsterEditor) window.cmOpenMonsterEditor(me, window.cmBestiary.save);
      return;
    }

    var dlB = e.target.closest('[data-bestdel]');
    if (dlB) {
      var id = dlB.dataset.bestdel;
      if (isOfficialId(id)) return;
      var md = getById(id);
      var nm = md ? (md.name || '(senza nome)') : '';
      var doDel = function () { if (view.curId === id) view.curId = null; window.cmBestiary.remove(id); };
      if (typeof window.pgConfirm === 'function') window.pgConfirm('Eliminare "' + nm + '" dal bestiario?\nL\'azione è irreversibile.', doDel, { title: 'Elimina dal bestiario', okLabel: 'Elimina' });
      else if (confirm('Eliminare "' + nm + '" dal bestiario?')) doDel();
      return;
    }
  });

  /* Ricerca + slider CR: aggiornano solo le card (focus/stato preservati). */
  document.addEventListener('input', function (e) {
    var el = host(); if (!el || !e.target || !el.contains(e.target)) return;
    if (e.target.id === 'bestSearch') { view.q = e.target.value; fillCards(); return; }
    /* Configuratore attacco (solo personalizzati): salva senza re-render per non perdere il focus. */
    var t = e.target;
    if (t.dataset && t.dataset.bestatkhit !== undefined) { var mh = getById(view.curId); if (!mh || isOfficialId(mh.id)) return; var hp = t.dataset.bestatkhit.split('-'); var hit = mh[hp[0]] && mh[hp[0]][parseInt(hp[1])]; if (hit && typeof hit === 'object') { hit.atkHit = t.value; persist(); } return; }
    if (t.dataset && t.dataset.bestdmg !== undefined) { var md = getById(view.curId); if (!md || isOfficialId(md.id)) return; var dp = t.dataset.bestdmg.split('-'); var dit = md[dp[0]] && md[dp[0]][parseInt(dp[1])]; if (dit && typeof dit === 'object') { var arr = bestEnsureDmgs(dit); var dj = parseInt(dp[2]); while (arr.length <= dj) arr.push({ f: '', t: '' }); arr[dj][t.dataset.bestdmgf] = t.value; persist(); } return; }
    var cr = e.target.closest ? e.target.closest('[data-bestcr]') : null;
    if (cr) {
      var lastIdx = BEST_CR_SCALE.length - 1;
      var val = parseInt(cr.value, 10); if (isNaN(val)) val = 0;
      if (cr.dataset.bestcr === 'min') { if (val > view.fCrMax) val = view.fCrMax; cr.value = val; view.fCrMin = val; }
      else { if (val < view.fCrMin) val = view.fCrMin; cr.value = val; view.fCrMax = val; }
      var fill = document.getElementById('bestCrFill'), lbl = document.getElementById('bestCrVal');
      var lp = (view.fCrMin / lastIdx) * 100, rp = (view.fCrMax / lastIdx) * 100;
      if (fill) { fill.style.left = lp + '%'; fill.style.width = (rp - lp) + '%'; }
      if (lbl) lbl.textContent = BEST_CR_SCALE[view.fCrMin] + ' – ' + BEST_CR_SCALE[view.fCrMax];
      fillCards();
      updateFilterChrome();
      return;
    }
  });

  /* ---- Effetto figurina: tilt 3D + glare + foil olografico che seguono il
     cursore (variabili CSS aggiornate via JS, throttle a 1/frame). ---- */
  var tiltCard = null, tiltRaf = 0, tiltPos = null;
  function applyTilt() {
    tiltRaf = 0;
    if (!tiltCard || !tiltPos || !tiltCard.isConnected) return;
    var r = tiltCard.getBoundingClientRect(); if (!r.width) return;
    var px = Math.max(0, Math.min(1, (tiltPos.x - r.left) / r.width));
    var py = Math.max(0, Math.min(1, (tiltPos.y - r.top) / r.height));
    var s = tiltCard.style;
    s.setProperty('--rx', ((0.5 - py) * 15).toFixed(2) + 'deg');
    s.setProperty('--ry', ((px - 0.5) * 15).toFixed(2) + 'deg');
    s.setProperty('--scale', '1.05');
    s.setProperty('--gx', (px * 100).toFixed(1) + '%');
    s.setProperty('--gy', (py * 100).toFixed(1) + '%');
    s.setProperty('--hx', (px * 36 + 32).toFixed(1) + '%');
    s.setProperty('--hy', (py * 36 + 32).toFixed(1) + '%');
  }
  function resetTilt(card) {
    if (!card) return;
    var s = card.style;
    s.setProperty('--rx', '0deg'); s.setProperty('--ry', '0deg'); s.setProperty('--scale', '1');
    s.setProperty('--gx', '50%'); s.setProperty('--gy', '50%');
    s.setProperty('--hx', '50%'); s.setProperty('--hy', '50%');
  }
  document.addEventListener('mousemove', function (e) {
    var el = host(); if (!el) return;
    var card = (e.target && e.target.closest) ? e.target.closest('.best__card') : null;
    if (card && el.contains(card)) {
      if (card !== tiltCard) { resetTilt(tiltCard); tiltCard = card; }
      tiltPos = { x: e.clientX, y: e.clientY };
      if (!tiltRaf) tiltRaf = requestAnimationFrame(applyTilt);
    } else if (tiltCard) {
      resetTilt(tiltCard); tiltCard = null;
    }
  });

  /* ---- Trascinamento di una carta verso i Nemici: imposta l'id del mostro
     nel dataTransfer; la finestra Personaggi/Nemici lo riceve e lo aggiunge. ---- */
  document.addEventListener('dragstart', function (e) {
    var el = host(); if (!el) return;
    var card = (e.target && e.target.closest) ? e.target.closest('.best__card') : null;
    if (!card || !el.contains(card)) return;
    var id = card.dataset.bestopen; if (!id || !e.dataTransfer) return;
    try {
      e.dataTransfer.setData('application/x-cm-monster', id);
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'copy';
    } catch (_) {}
    resetTilt(card); if (tiltCard === card) tiltCard = null;
  });

  /* ---- Stili (iniettati: tutto il codice del bestiario resta esterno) ---- */
  var css =
    /* Due colonne: il corpo finestra diventa una flex-row con due pannelli che
       scrollano in modo indipendente (come #winChars). */
    '#winBestiary{min-width:520px}' +
    '.win__half.best-drop-over{outline:2px dashed var(--gold);outline-offset:-4px;background:rgba(196,154,50,.07);border-radius:8px}' +
    '#bestiaryBody{padding:0;display:flex;flex-direction:row;align-items:stretch;overflow:hidden}' +
    '.best__left{flex:1 1 0;display:flex;flex-direction:column;min-width:0;overflow:hidden auto;scrollbar-width:thin;padding:8px;border-right:1px solid var(--border)}' +
    '.best__right{flex:1 1 0;min-width:0;overflow:hidden auto;scrollbar-width:thin;padding:10px 12px}' +
    '.best__placeholder{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;color:var(--muted);font-family:var(--mono);font-size:.74rem;line-height:1.6;padding:20px}' +
    '.best__placeholder-ico{font-size:2rem;opacity:.45}' +
    '.best__card--on{border-color:var(--rare-c2);box-shadow:0 0 0 2px var(--rare-c2) inset,0 10px 26px -8px var(--glow,rgba(0,0,0,.5))}' +
    '.best__tabs{display:flex;gap:3px;margin-bottom:7px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:3px}' +
    '.best__tab{flex:1;padding:5px 6px;border:none;background:transparent;color:var(--muted);font-family:var(--mono);font-size:.66rem;border-radius:6px;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__tab:hover{color:var(--text)}' +
    '.best__tab--on{background:var(--bg3);color:var(--gold);font-weight:600}' +
    '.best__rarity-ro{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:.7rem;color:var(--text);font-weight:600}' +
    '.best__bar{display:flex;flex-direction:row;align-items:center;gap:6px;margin-bottom:7px}' +
    '.best__filters{margin-bottom:9px}' +
    '.best__fbar{display:flex;gap:6px}' +
    '.best__ftoggle{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--muted);font-family:var(--mono);font-size:.66rem;line-height:1;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__ftoggle:hover{color:var(--text);border-color:var(--bh)}' +
    '.best__ftoggle--active{color:var(--gold);border-color:rgba(196,154,50,.4)}' +
    '.best__ftoggle--open{color:var(--text);background:var(--bg3);border-color:var(--gold)}' +
    '.best__ftoggle-lbl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.best__fcount{flex:0 0 auto;box-sizing:border-box;min-width:12px;height:12px;display:inline-flex;align-items:center;justify-content:center;padding:0 2px;border-radius:6px;background:var(--gold);color:#1a1a1a;font-size:.46rem;font-weight:700;line-height:1;text-align:center}' +
    '.best__fcount--dot{min-width:0;width:7px;height:7px;padding:0;border-radius:50%}' +
    '.best__fcaret{flex:0 0 auto;font-size:.55rem;opacity:.7;transition:transform .15s}' +
    '.best__ftoggle--open .best__fcaret{transform:rotate(180deg)}' +
    '.best__freset{flex:0 0 auto;width:30px;display:flex;align-items:center;justify-content:center;padding:0;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--muted);font-size:1rem;line-height:1;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__freset:hover{color:var(--red);border-color:var(--rb)}' +
    '.best__freset--off{opacity:.35;pointer-events:none}' +
    '.best__fpanel{margin-top:7px;padding:9px;border:1px solid var(--border);border-radius:7px;background:var(--bg)}' +
    '.best__dirbtn{margin-top:8px;width:100%;padding:6px 8px;border-radius:6px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-family:var(--mono);font-size:.62rem;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__dirbtn:hover{border-color:var(--gold);color:var(--gold)}' +
    '.best__dirbtn--off{opacity:.4;pointer-events:none}' +
    '.best__diric{color:var(--gold);font-weight:700}' +
    '.best__cr-head{display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:7px}' +
    '.best__cr-val{color:var(--gold);font-weight:600;letter-spacing:0;text-transform:none}' +
    '.best__chiprow{display:flex;flex-wrap:wrap;gap:4px}' +
    '.best__fchip{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:20px;border:1px solid var(--border);background:var(--bg);color:var(--muted);font-family:var(--mono);font-size:.59rem;line-height:1;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__fchip:hover{color:var(--text);border-color:var(--bh)}' +
    '.best__fchip--on{color:#fff;background:var(--bg3);border-color:var(--c1,var(--gold))}' +
    '.best__rarity-dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,var(--c1,#888),var(--c2,#bbb));box-shadow:0 0 4px var(--c1,transparent);flex:0 0 auto}' +
    '.best__cr-slider{position:relative;height:20px}' +
    '.best__cr-rail{position:absolute;top:50%;left:0;right:0;height:4px;transform:translateY(-50%);background:var(--border);border-radius:2px}' +
    '.best__cr-fill{position:absolute;top:50%;height:4px;transform:translateY(-50%);background:var(--gold);border-radius:2px}' +
    '.best__cr-thumb{position:absolute;top:0;left:0;width:100%;height:20px;margin:0;padding:0;background:transparent;pointer-events:none;-webkit-appearance:none;appearance:none}' +
    '.best__cr-thumb::-webkit-slider-runnable-track{height:20px;background:transparent;border:none}' +
    '.best__cr-thumb::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:auto;width:14px;height:14px;margin-top:3px;border-radius:50%;background:var(--gold);border:2px solid var(--bg2);box-shadow:0 1px 3px rgba(0,0,0,.55);cursor:var(--cur-pointer)}' +
    '.best__cr-thumb::-moz-range-track{height:20px;background:transparent;border:none}' +
    '.best__cr-thumb::-moz-range-thumb{pointer-events:auto;width:14px;height:14px;border-radius:50%;background:var(--gold);border:2px solid var(--bg2);box-shadow:0 1px 3px rgba(0,0,0,.55);cursor:var(--cur-pointer)}' +
    '.best__search{flex:1;min-width:0;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 9px;color:var(--text);font-family:var(--mono);font-size:.74rem;outline:none;transition:border-color .12s}' +
    '.best__search:focus{border-color:var(--gold)}' +
    '.best__add{flex:0 0 auto;align-self:stretch;display:flex;align-items:center;justify-content:center;padding:0 16px;background:rgba(40,140,60,.1);border:1px solid rgba(40,140,60,.25);border-radius:6px;color:#4a9a5a;font-family:var(--mono);font-size:1.05rem;font-weight:600;line-height:1;cursor:var(--cur-pointer);transition:all .15s}' +
    '.best__add:hover{background:rgba(40,140,60,.2);color:#6fc47f}' +
    '.best__empty{text-align:center;color:var(--muted);font-family:var(--mono);font-size:.72rem;line-height:1.7;padding:26px 12px}' +
    '.best__list{display:grid;grid-template-columns:repeat(auto-fill,132px);gap:8px;align-content:start;justify-content:start}' +
    '.best__corner{position:absolute;top:4px;font-family:var(--mono);font-size:.56rem;font-weight:600;background:rgba(0,0,0,.62);padding:2px 5px;border-radius:5px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;z-index:2}' +
    '.best__corner--tl{left:4px;color:#fff;max-width:calc(100% - 44px)}' +
    '.best__corner--tr{right:4px;color:var(--gold)}' +
    '.best__card{position:relative;display:flex;flex-direction:column;text-align:center;gap:5px;height:176px;padding:7px;background:var(--bg);border:1px solid var(--rare-c1,var(--border));border-radius:10px;cursor:var(--cur-pointer);box-sizing:border-box;transform:perspective(800px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) scale(var(--scale,1));transition:transform .13s ease-out,box-shadow .3s ease,border-color .25s ease;box-shadow:0 3px 10px rgba(0,0,0,.45);will-change:transform}' +
    '.best__card:hover{z-index:3;border-color:var(--rare-c2);box-shadow:0 16px 34px -10px var(--glow,rgba(0,0,0,.5)),0 0 0 1px var(--rare-c2) inset}' +
    '.best__shine{position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:5;opacity:0;transition:opacity .3s ease;background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),rgba(255,255,255,.5),rgba(255,255,255,0) 42%);mix-blend-mode:soft-light}' +
    '.best__card:hover .best__shine{opacity:1}' +
    '.best__holo{position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:4;background:linear-gradient(115deg,transparent 28%,var(--rare-c2) 43%,var(--rare-c1) 50%,var(--rare-c2) 57%,transparent 72%);background-size:200% 200%;background-repeat:no-repeat;background-position:var(--hx,50%) var(--hy,50%);opacity:0;mix-blend-mode:color-dodge;transition:opacity .3s ease}' +
    '.best__card:hover .best__holo{opacity:calc(var(--holo,0) * .5 + .03)}' +
    '.best__photo{position:relative;flex:1;width:100%;min-height:0;border-radius:7px;overflow:hidden;background:var(--bg2);display:flex;align-items:center;justify-content:center}' +
    '.best__photo-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;z-index:1}' +
    '.best__photo-ph{width:40px;height:40px;opacity:.4;stroke:var(--muted);fill:none;stroke-width:1.6}' +
    '.best__name{position:relative;z-index:6;font-family:var(--mono);font-size:.7rem;color:var(--text);font-weight:600;line-height:1.15;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word;flex-shrink:0}' +
    '.best__meta{font-family:var(--mono);font-size:.56rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0}' +
    '.best__pv-head{margin-bottom:8px}' +
    '.best__back{background:transparent;border:1px solid var(--border);border-radius:6px;padding:4px 10px;color:var(--dim);font-family:var(--mono);font-size:.7rem;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__back:hover{color:var(--gold);border-color:var(--gold)}' +
    '.best__pv{display:flex;flex-direction:column;gap:8px}' +
    '.best__pv-id{display:flex;align-items:center;gap:10px}' +
    '.best__pv-photo{position:relative;width:52px;height:52px;border-radius:8px;overflow:hidden;flex-shrink:0;background:var(--bg2);display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid var(--border);transition:border-color .12s}' +
    '.best__pv-photo:hover{border-color:var(--gold)}' +
    '.best__pv-photo .best__photo-ph{width:26px;height:26px}' +
    '.best__pv-name{font-family:var(--mono);font-size:1rem;color:var(--gold);font-weight:700}' +
    '.best__pv-sub{font-family:var(--mono);font-size:.66rem;color:var(--muted);text-transform:capitalize}' +
    '.best__pv-stats{display:flex;flex-wrap:wrap;gap:10px;font-family:var(--mono);font-size:.74rem;color:var(--text);padding:7px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}' +
    '.best__pv-stats strong{color:var(--gold)}' +
    '.best__pv-abs{display:flex;gap:5px}' +
    '.best__pv-meta{display:flex;flex-direction:column;gap:3px;padding:6px 0;border-bottom:1px solid var(--border)}' +
    '.best__pv-line{font-family:var(--mono);font-size:.7rem;color:var(--text);line-height:1.45;word-break:break-word}' +
    '.best__pv-llabel{color:var(--gold);font-weight:600}' +
    '.best__rarity{display:flex;flex-direction:column;gap:5px;padding:7px 0;border-bottom:1px solid var(--border)}' +
    '.best__rarity-lbl{font-family:var(--mono);font-size:.62rem;color:var(--gold);text-transform:uppercase;letter-spacing:.05em;font-weight:600}' +
    '.best__rarity-chips{display:flex;flex-wrap:wrap;gap:5px}' +
    '.best__rarity-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;border:1px solid var(--border);background:var(--bg);color:var(--muted);font-family:var(--mono);font-size:.62rem;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__rarity-chip:hover{border-color:var(--c1);color:var(--text)}' +
    '.best__rarity-chip--sel{border-color:var(--c1);color:#fff;box-shadow:0 0 0 1px var(--c1) inset,0 0 10px -3px var(--c1)}' +
    '.best__rarity-dot{width:9px;height:9px;border-radius:50%;background:linear-gradient(135deg,var(--c1),var(--c2));flex-shrink:0}' +
    '.best__ab{flex:1;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:5px 2px}' +
    '.best__ab-l{font-family:var(--mono);font-size:.56rem;color:var(--muted)}' +
    '.best__ab-v{font-family:var(--mono);font-size:.82rem;color:var(--text);font-weight:700}' +
    '.best__ab-m{font-family:var(--mono);font-size:.66rem;color:var(--gold)}' +
    '.best__pv-sec{display:flex;flex-direction:column;gap:3px}' +
    '.best__pv-sectitle{font-family:var(--mono);font-size:.68rem;color:var(--gold);text-transform:uppercase;letter-spacing:.04em;font-weight:600;border-bottom:1px solid var(--border);padding-bottom:2px;margin-top:4px}' +
    '.best__pv-item{padding:3px 0}' +
    '.best__pv-iname{font-family:var(--mono);font-size:.72rem;color:var(--text);font-weight:600}' +
    '.best__pv-idesc,.best__pv-notes{font-family:var(--mono);font-size:.68rem;color:var(--dim);line-height:1.45;white-space:pre-wrap;word-break:break-word}' +
    '.best__atk{margin-top:5px;display:flex;flex-direction:column;gap:5px;padding:6px 7px;border:1px solid var(--border);border-radius:6px;background:var(--bg)}' +
    '.best__atk--ro{flex-direction:row;flex-wrap:wrap;gap:6px;align-items:center}' +
    '.best__atk-chip{font-family:var(--mono);font-size:.64rem;color:var(--text);background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:2px 7px}' +
    '.best__atk-chip em{color:var(--gold);font-style:normal}' +
    '.best__atk-ico{font-size:.78rem;line-height:1;flex:0 0 auto}' +
    '.best__atk-hrow,.best__atk-drow{display:flex;align-items:center;gap:5px}' +
    '.best__atk-in{background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:3px 6px;color:var(--text);font-family:var(--mono);font-size:.66rem;outline:none;min-width:0;transition:border-color .12s}' +
    '.best__atk-in:focus{border-color:var(--gold)}' +
    '.best__atk-in--hit{width:46px;flex:0 0 auto}' +
    '.best__atk-in--f{width:74px;flex:0 0 auto}' +
    '.best__atk-in--t{flex:1 1 auto}' +
    '.best__atk-dadd{margin-left:auto;flex:0 0 auto;white-space:nowrap;background:transparent;border:1px dashed rgba(196,154,50,.4);border-radius:5px;padding:2px 8px;color:var(--gold);font-family:var(--mono);font-size:.58rem;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__atk-dadd:hover{background:rgba(196,154,50,.1);border-color:var(--gold)}' +
    '.best__atk-del{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:22px;height:22px;background:transparent;border:none;color:var(--muted);cursor:var(--cur-pointer);padding:0;border-radius:4px;transition:all .12s}' +
    '.best__atk-del:hover{color:var(--red);background:var(--rl)}' +
    '.best__atk-del svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '.best__atk-init{margin-top:5px;background:transparent;border:1px dashed var(--border);border-radius:5px;padding:3px 9px;color:var(--muted);font-family:var(--mono);font-size:.6rem;cursor:var(--cur-pointer);transition:all .12s}' +
    '.best__atk-init:hover{border-color:var(--gold);color:var(--gold)}' +
    '.best__pv-actions{display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 11px;border-bottom:1px solid var(--border);padding-bottom:11px}' +
    '.best__btn{flex:1;min-width:100px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:5px 10px;color:var(--text);font-family:var(--mono);font-size:.7rem;line-height:1.25;cursor:var(--cur-pointer);transition:all .12s}' +
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
