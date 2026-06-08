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
        { name: 'Bastone del Vento', desc: 'Attacco con arma da mischia o a distanza: +5 a colpire.\nPortata 1,5 m oppure gittata 36/72 m.\nColpito: 7 (1d8 + 3) danni contundenti più 11 (2d10) danni da fulmine.' },
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
        { name: 'Artigli', desc: 'Attacco in mischia: +4 a colpire, portata 1,5 m.\nColpito: 4 (1d4 + 2) danni taglienti.\nSe l\'aarakocra ha volato per almeno 9 metri in linea retta verso il bersaglio immediatamente prima dell\'attacco, infligge invece 9 (3d4 + 2) danni taglienti.' },
        { name: 'Giavellotto del Vento', desc: 'Attacco in mischia o a distanza: +4 a colpire.\nPortata 1,5 m oppure gittata 9/36 m.\nColpito: 5 (1d6 + 2) danni perforanti più 2 (1d4) danni da tuono.\nColpisca o manchi il bersaglio, dopo un attacco a distanza il giavellotto ritorna magicamente nella mano dell\'aarakocra immediatamente dopo il lancio.' }
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

  function blankMonster() {
    return { name: 'Nuovo mostro', emoji: '🐾', rarity: 'common', ac: 10, hp: 10, hpCur: 10, hpTemp: 0, init: 0,
             cr: '', xp: '', hpDice: '', str: 10, dex: 10, con: 10, intl: 10, wis: 10, cha: 10 };
  }

  /* ---- Stato vista (split: lista a sx, anteprima a dx; tab official|custom) ---- */
  var view = { tab: 'official', curId: null, q: '' };

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

  function renderLeftInto(left) {
    var list = currentList();
    var isCustom = view.tab === 'custom';
    var q = (view.q || '').toLowerCase();
    var items = list.filter(function (m) {
      return !q || (m.name || '').toLowerCase().indexOf(q) >= 0 || String(m.type || '').toLowerCase().indexOf(q) >= 0;
    });
    var h = '<div class="best__tabs">' +
      '<button class="best__tab' + (view.tab === 'official' ? ' best__tab--on' : '') + '" data-besttab="official" type="button">Bestiario</button>' +
      '<button class="best__tab' + (isCustom ? ' best__tab--on' : '') + '" data-besttab="custom" type="button">Personalizzati</button>' +
      '</div>';
    h += '<div class="best__bar"><input class="best__search" id="bestSearch" placeholder="Cerca mostro..." value="' + esc(view.q) + '" spellcheck="false">' +
      (isCustom ? '<button class="best__add" data-bestnew="1" type="button">＋ Nuovo</button>' : '') + '</div>';
    if (!list.length) {
      h += '<div class="best__empty">' + (isCustom
        ? 'Nessun mostro personalizzato.<br>Crea con <strong>＋ Nuovo</strong>, oppure salva un Nemico nel bestiario (menu ⋮ → <em>Salva nel bestiario</em>).'
        : 'Bestiario vuoto.') + '</div>';
    } else if (!items.length) {
      h += '<div class="best__empty">Nessun risultato per "' + esc(view.q) + '".</div>';
    } else {
      h += '<div class="best__list">';
      items.forEach(function (m) {
        var on = (m.id === view.curId) ? ' best__card--on' : '';
        var typeBadge = m.type ? '<span class="best__corner best__corner--tl">' + esc(m.type) + '</span>' : '';
        var crBadge = (m.cr != null && m.cr !== '') ? '<span class="best__corner best__corner--tr">' + esc(String(m.cr)) + '</span>' : '';
        h += '<div class="best__card' + on + '" data-bestopen="' + esc(m.id) + '" draggable="true" style="' + rarityVars(m) + '">' +
          '<div class="best__photo">' + typeBadge + crBadge + monsterPhotoHtml(m) + '</div>' +
          '<div class="best__name">' + esc(m.name || '(senza nome)') + '</div>' +
          '<div class="best__holo"></div><div class="best__shine"></div>' +
          '</div>';
      });
      h += '</div>';
    }
    left.innerHTML = h;
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
      var rows = arr.map(function (it) {
        var o = (typeof it === 'string') ? { name: it, desc: '' } : (it || {});
        return '<div class="best__pv-item"><div class="best__pv-iname">' + esc(o.name || '') + '</div>' +
          (o.desc ? '<div class="best__pv-idesc">' + esc(o.desc) + '</div>' : '') + '</div>';
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
    h += '<div class="best__pv-actions">' +
      '<button class="best__btn best__btn--add" data-bestadd="' + esc(m.id) + '" type="button">➕ Aggiungi ai Nemici</button>' +
      (_ro ? '' :
        '<button class="best__btn" data-bestedit="' + esc(m.id) + '" type="button">✏️ Modifica</button>' +
        '<button class="best__btn best__btn--del" data-bestdel="' + esc(m.id) + '" type="button">🗑 Elimina</button>') +
      '</div>';
    h += '</div>';
    right.innerHTML = h;
  }

  /* ---- Eventi (delegati, limitati a #bestiaryBody) ---- */
  document.addEventListener('click', function (e) {
    var el = host(); if (!el || !el.contains(e.target)) return;

    var tabBtn = e.target.closest('[data-besttab]');
    if (tabBtn) { var _t = tabBtn.dataset.besttab; if (_t !== view.tab) { view.tab = _t; view.curId = null; render(); } return; }

    var photoBtn = e.target.closest('[data-bestphoto]');
    if (photoBtn) { e.preventDefault(); e.stopPropagation(); pendingPhotoId = photoBtn.dataset.bestphoto; ensureFileInput(); fileInput.click(); return; }

    var rarBtn = e.target.closest('[data-bestrarity]');
    if (rarBtn) { var rm = getById(view.curId); if (rm && !isOfficialId(rm.id)) { rm.rarity = rarBtn.dataset.bestrarity; persist(); render(); } return; }

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

  /* Ricerca: filtra la lista mantenendo il focus nel campo. */
  document.addEventListener('input', function (e) {
    if (!e.target || e.target.id !== 'bestSearch') return;
    view.q = e.target.value;
    renderLeft();
    var s = document.getElementById('bestSearch');
    if (s) { s.focus(); var v = s.value; try { s.setSelectionRange(v.length, v.length); } catch (_) {} }
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
    '.best__bar{display:flex;flex-direction:column;gap:6px;margin-bottom:8px;position:sticky;top:0;background:var(--bg2);padding-bottom:6px;z-index:2}' +
    '.best__search{flex:1;min-width:0;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:6px 9px;color:var(--text);font-family:var(--mono);font-size:.74rem;outline:none;transition:border-color .12s}' +
    '.best__search:focus{border-color:var(--gold)}' +
    '.best__add{width:100%;text-align:center;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:6px 11px;color:var(--gold);font-family:var(--mono);font-size:.72rem;cursor:var(--cur-pointer);white-space:nowrap;transition:all .12s}' +
    '.best__add:hover{border-color:var(--gold);background:rgba(196,154,50,.08)}' +
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
