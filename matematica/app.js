/* ════════════════════════════════════════════════════════════
   app.js — stato, router, viste, gamification
   Sito statico · dati in localStorage (mt_*) · nessun backend
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const KEY = "mt_state_v1";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const dayStr = (d) => (d || new Date()).toISOString().slice(0, 10);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ───────── STATO ───────── */
  function freshState() {
    return {
      xp: 0, level: 1,
      streak: { count: 0, lastDay: null },
      studySeconds: 0,
      diagnostic: { done: false, results: {}, score: 0, date: null },
      plan: [],
      mastery: {},          // id → {seen,correct,attempts,mastery,completed,lastStudied}
      badges: [],
      examsPassed: 0,
      history: [],          // [{d, xp}]
      lastTopic: null
    };
  }
  let state = load();
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return freshState();
      return Object.assign(freshState(), JSON.parse(raw));
    } catch (e) { return freshState(); }
  }
  let saveTimer = null;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } }
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 600); }

  /* ───────── TEMA ───────── */
  function initTheme() {
    const t = localStorage.getItem("mt_theme") || "dark";
    document.documentElement.setAttribute("data-theme", t);
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mt_theme", next);
    // ridisegna eventuali grafici col nuovo tema
    const cv = $("#plotCanvas");
    if (cv && EX.ex && EX.ex.plot) MTutor.plot(cv, EX.ex.plot.f, EX.ex.plot.d, EX.ex.domain);
    if ($("#spark")) drawSpark();
  }

  /* ───────── MATH RENDER ───────── */
  function renderMath(scope) {
    if (!window.renderMathInElement) return;
    try {
      window.renderMathInElement(scope || document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    } catch (e) { }
  }

  /* ───────── XP / LIVELLI ───────── */
  function levelInfo(xp) {
    let lvl = 1, need = 100, acc = 0;
    while (xp >= acc + need) { acc += need; lvl++; need = 100 + (lvl - 1) * 40; }
    return { level: lvl, into: xp - acc, span: need, pct: (xp - acc) / need };
  }
  function awardXp(amount, msg) {
    const before = levelInfo(state.xp).level;
    state.xp += amount;
    const after = levelInfo(state.xp).level;
    state.level = after;
    recordHistory();
    updateHud();
    if (after > before) toast("🚀", "Livello " + after + "! Continua così.");
    else if (msg) toast("✨", msg);
    checkBadges();
    saveSoon();
  }
  function recordHistory() {
    const d = dayStr();
    const last = state.history[state.history.length - 1];
    if (last && last.d === d) last.xp = state.xp;
    else state.history.push({ d, xp: state.xp });
    if (state.history.length > 60) state.history.shift();
  }
  function touchStreak() {
    const today = dayStr();
    if (state.streak.lastDay === today) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    state.streak.count = (state.streak.lastDay === dayStr(y)) ? state.streak.count + 1 : 1;
    state.streak.lastDay = today;
    updateHud(); saveSoon();
  }
  function checkBadges() {
    let unlocked = null;
    MT.badges.forEach(b => {
      if (!state.badges.includes(b.id) && b.check(state)) { state.badges.push(b.id); unlocked = b; }
    });
    if (unlocked) { toast(unlocked.icon, "Badge sbloccato: " + unlocked.name); save(); }
  }

  /* ───────── MASTERY ───────── */
  const masteryOf = (id) => (state.mastery[id] && state.mastery[id].mastery) || 0;
  function updateMastery(id, correct, diff) {
    const m = state.mastery[id] || (state.mastery[id] = { seen: 0, correct: 0, attempts: 0, mastery: 0, completed: false });
    m.seen = 1; m.attempts++; m.lastStudied = dayStr();
    const w = diff === "esame" ? 1.3 : diff === "intermedio" ? 1.1 : 1;
    if (correct) { m.correct++; m.mastery = clamp(m.mastery + (1 - m.mastery) * 0.20 * w, 0, 1); }
    else { m.mastery = clamp(m.mastery - 0.05, 0, 1); }
    if (m.mastery >= 0.8) m.completed = true;
    saveSoon();
  }
  function unlocked(t) {
    if (!t.prereqs || !t.prereqs.length) return true;
    return t.prereqs.every(p => masteryOf(p) >= 0.5);
  }
  function topicStatus(t) {
    if (!unlocked(t)) return "locked";
    const m = masteryOf(t.id);
    if (m >= 0.8) return "done";
    if (m > 0 || (state.mastery[t.id] && state.mastery[t.id].seen)) return "progress";
    return "open";
  }

  /* ───────── HUD ───────── */
  function updateHud() {
    const li = levelInfo(state.xp);
    $("#hudLevel").textContent = li.level;
    $("#hudXp").textContent = Math.round(state.xp);
    $("#hudXpFill").style.width = (li.pct * 100).toFixed(0) + "%";
    $("#hudStreak").textContent = state.streak.count;
  }

  /* ───────── TOAST ───────── */
  let toastTimer = null;
  function toast(icon, msg) {
    const t = $("#toast");
    t.innerHTML = '<span class="toast__ico">' + icon + '</span><span>' + msg + '</span>';
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }

  /* ───────── NAV (sidebar) ───────── */
  const NAV_GROUPS = [
    {
      label: "Principale", items: [
        { route: "dashboard", icon: "M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z", name: "Dashboard" },
        { route: "test", icon: "M9 11l3 3 8-8M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11", name: "Test iniziale" },
        { route: "plan", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", name: "Piano di studio" }
      ]
    }
  ];
  const NAV_TAIL = [
    {
      label: "Allenamento", items: [
        { route: "esercizi", icon: "M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z", name: "Esercizi" },
        { route: "simulazioni", icon: "M12 6v6l4 2M12 22a10 10 0 110-20 10 10 0 010 20z", name: "Simulazioni d'esame" }
      ]
    },
    {
      label: "Progressi", items: [
        { route: "stats", icon: "M3 3v18h18M18 17V9M13 17V5M8 17v-3", name: "Statistiche" },
        { route: "obiettivi", icon: "M12 15a7 7 0 100-14 7 7 0 000 14zM8.2 13.3L7 22l5-3 5 3-1.2-8.7", name: "Obiettivi" }
      ]
    }
  ];

  function buildNav() {
    const nav = $("#nav");
    let html = "";
    NAV_GROUPS.forEach(g => {
      html += '<div class="nav__group"><div class="nav__label">' + g.label + '</div>';
      g.items.forEach(it => html += navItem(it));
      html += '</div>';
    });
    // percorso (curriculum)
    html += '<div class="nav__group"><div class="nav__label">Percorso</div>';
    MT.curriculum.forEach(lvl => {
      const done = lvl.topics.filter(t => masteryOf(t.id) >= 0.8).length;
      html += '<button class="nav__item" data-route="level/' + lvl.id + '">' +
        '<svg viewBox="0 0 24 24"><path d="' + (lvl.id === 0 ? "M12 2L2 7l10 5 10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" : lvl.id === 1 ? "M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5z" : "M2 3h20v14H2zM8 21h8M12 17v4") + '"/></svg>' +
        '<span>' + lvl.label + '</span><span class="nav__badge">' + done + '/' + lvl.topics.length + '</span></button>';
      lvl.topics.forEach(t => {
        const st = topicStatus(t);
        const lock = st === "locked" ? '<svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>' : "";
        html += '<button class="nav__topic ' + st + '" data-route="topic/' + t.id + '">' +
          '<span class="nav__dot"></span><span>' + t.title + '</span>' + lock + '</button>';
      });
    });
    html += '</div>';
    NAV_TAIL.forEach(g => {
      html += '<div class="nav__group"><div class="nav__label">' + g.label + '</div>';
      g.items.forEach(it => html += navItem(it));
      html += '</div>';
    });
    nav.innerHTML = html;
    $$(".nav__item, .nav__topic", nav).forEach(b => {
      b.addEventListener("click", () => { navigate("#/" + b.dataset.route); closeDrawers(); });
    });
  }
  function navItem(it) {
    return '<button class="nav__item" data-route="' + it.route + '">' +
      '<svg viewBox="0 0 24 24"><path d="' + it.icon + '"/></svg><span>' + it.name + '</span></button>';
  }
  function setActiveNav(route) {
    $$(".nav__item, .nav__topic").forEach(b => b.classList.toggle("active", b.dataset.route === route));
  }

  /* ───────── CONTEXT PANEL ───────── */
  function buildCtx(topicId) {
    const body = $("#ctxBody");
    const t = topicId ? MT.findTopic(topicId) : null;
    if (!t) {
      body.innerHTML =
        '<div class="ctx-block"><div class="ctx-block__title"><svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0012 2z"/></svg>Suggerimenti</div>' +
        '<div class="ctx-li">Inizia dal <b>Test iniziale</b>: costruisce il tuo piano personalizzato.</div>' +
        '<div class="ctx-li">Apri un argomento del <b>Percorso</b> per vedere qui formulario, teoremi ed errori frequenti.</div>' +
        '<div class="ctx-li">Negli esercizi puoi chiedere aiuto progressivo: prima un suggerimento, poi la guida passo-passo.</div></div>';
      return;
    }
    let h = "";
    if (t.formulas && t.formulas.length) {
      h += ctxHead('<path d="M4 7h16M4 12h10M4 17h7"/>', "Formulario");
      t.formulas.forEach(f => { h += '<div class="ctx-formula"><div class="ctx-formula__cap">' + (f.cap || "") + '</div>\\(' + f.tex + '\\)</div>'; });
      h += "</div>";
    }
    if (t.theorems && t.theorems.length) {
      h += ctxHead('<path d="M12 2l9 4-9 4-9-4 9-4zM3 10v6l9 4 9-4v-6"/>', "Teoremi");
      t.theorems.forEach(th => { h += '<div class="ctx-def"><b>' + th.name + '.</b> ' + th.statement + '</div>'; });
      h += "</div>";
    }
    if (t.definitions && t.definitions.length) {
      h += ctxHead('<path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5z"/>', "Definizioni");
      t.definitions.forEach(d => { h += '<div class="ctx-def"><b>' + d.term + ":</b> " + d.def + "</div>"; });
      h += "</div>";
    }
    if (t.errors && t.errors.length) {
      h += ctxHead('<path d="M12 9v4M12 17h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z"/>', "Errori frequenti");
      t.errors.forEach(e => { h += '<div class="ctx-li err">' + e + "</div>"; });
      h += "</div>";
    }
    if (t.prereqs && t.prereqs.length) {
      h += ctxHead('<path d="M9 18l6-6-6-6"/>', "Prerequisiti");
      t.prereqs.forEach(p => {
        const pt = MT.findTopic(p);
        if (pt) h += '<div class="ctx-li" style="cursor:pointer" data-goto="topic/' + p + '">' + pt.title + " &nearr;</div>";
      });
      h += "</div>";
    }
    if (t.tips && t.tips.length) {
      h += ctxHead('<path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0012 2z"/>', "Suggerimenti del tutor");
      t.tips.forEach(tp => { h += '<div class="ctx-li">' + tp + "</div>"; });
      h += "</div>";
    }
    body.innerHTML = h;
    $$("[data-goto]", body).forEach(el => el.addEventListener("click", () => { navigate("#/" + el.dataset.goto); closeDrawers(); }));
    renderMath(body);
  }
  function ctxHead(svg, title) {
    return '<div class="ctx-block"><div class="ctx-block__title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">' + svg + "</svg>" + title + "</div>";
  }

  /* ════════════════════════════════════════════════
     ROUTER
     ════════════════════════════════════════════════ */
  const EX = { topicId: null, diff: "base", ex: null, hints: 0, solved: false };
  let EXAM = null;

  function navigate(hash) { if (location.hash === hash) router(); else location.hash = hash; }
  function router() {
    const main = $("#main");
    main.scrollTop = 0; window.scrollTo(0, 0);
    const parts = (location.hash || "#/dashboard").replace(/^#\//, "").split("/");
    const route = parts[0] || "dashboard";
    const arg = parts[1];

    if (route === "dashboard") { setActiveNav("dashboard"); viewDashboard(); buildCtx(null); }
    else if (route === "test") { setActiveNav("test"); viewDiagnostic(); buildCtx(null); }
    else if (route === "plan") { setActiveNav("plan"); viewPlan(); buildCtx(null); }
    else if (route === "level") { setActiveNav("level/" + arg); viewLevel(parseInt(arg, 10)); buildCtx(null); }
    else if (route === "topic") { setActiveNav("topic/" + arg); viewTopic(arg); buildCtx(arg); }
    else if (route === "exercise") { setActiveNav("topic/" + arg); viewExercise(arg); buildCtx(arg); }
    else if (route === "esercizi") { setActiveNav("esercizi"); viewEserciziHub(); buildCtx(null); }
    else if (route === "simulazioni") { setActiveNav("simulazioni"); viewSimulazioni(); buildCtx(null); }
    else if (route === "exam") { setActiveNav("simulazioni"); viewExamRun(); buildCtx(null); }
    else if (route === "stats") { setActiveNav("stats"); viewStats(); buildCtx(null); }
    else if (route === "obiettivi") { setActiveNav("obiettivi"); viewObiettivi(); buildCtx(null); }
    else { navigate("#/dashboard"); return; }

    buildNav(); // refresh statuses/badges
    setActiveNav(routeKeyFor(route, arg));
    renderMath(main);
  }
  function routeKeyFor(route, arg) {
    if (route === "topic" || route === "exercise") return "topic/" + arg;
    if (route === "level") return "level/" + arg;
    if (route === "exam") return "simulazioni";
    return route;
  }

  /* ════════════════════════════════════════════════
     VISTE
     ════════════════════════════════════════════════ */

  /* ── DASHBOARD ── */
  function preparedness() {
    const ts = MT.curriculum.filter(l => l.id >= 1).flatMap(l => l.topics);
    if (!ts.length) return 0;
    return ts.reduce((a, t) => a + masteryOf(t.id), 0) / ts.length;
  }
  function examProbability() {
    // logistica sulla preparazione media + bonus esercizi
    const p = preparedness();
    return clamp(1 / (1 + Math.exp(-(p - 0.55) * 9)), 0.02, 0.98);
  }
  function criticalTopics() {
    return Object.keys(state.mastery)
      .filter(id => state.mastery[id].seen && state.mastery[id].mastery < 0.45)
      .map(id => MT.findTopic(id)).filter(Boolean);
  }
  function completedCount() { return Object.values(state.mastery).filter(m => m.completed).length; }
  function recommendedTopic() {
    if (state.plan && state.plan.length) {
      const next = state.plan.find(id => masteryOf(id) < 0.8);
      if (next) return MT.findTopic(next);
    }
    for (const l of MT.curriculum) for (const t of l.topics) if (unlocked(t) && masteryOf(t.id) < 0.8) return t;
    return MT.findTopic("derivate");
  }

  function viewDashboard() {
    const hours = (state.studySeconds / 3600);
    const prep = preparedness();
    const prob = examProbability();
    const rec = recommendedTopic();
    const crit = criticalTopics();
    const greeting = state.diagnostic.done ? "Bentornato" : "Benvenuto";

    let html = '<div class="fade-in">';
    html += '<div class="page-head"><div class="page-kicker">Dashboard</div>' +
      '<div class="page-title">' + greeting + '! 👋</div>' +
      '<div class="page-sub">' + (state.diagnostic.done
        ? "Ecco il quadro della tua preparazione. Riprendi da dove eri rimasto."
        : "Comincia dal <b>Test iniziale</b>: in pochi minuti capisco le tue lacune e ti costruisco un percorso su misura.") + '</div></div>';

    // KPI
    html += '<div class="kpi-grid">' +
      kpi('M12 6v6l4 2', "Ore di studio", hours.toFixed(1), "totali in app") +
      kpi('M20 6L9 17l-5-5', "Argomenti completati", completedCount(), "padronanza ≥ 80%") +
      kpi('M12 9v4M12 17h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z', "Argomenti critici", crit.length, crit.length ? "da rinforzare" : "nessuno 🎉") +
      kpi('M13 2L3 14h9l-1 8 10-12h-9z', "XP totali", Math.round(state.xp), "livello " + state.level) +
      '</div>';

    // ring + prob
    html += '<div class="grid" style="grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';
    html += '<div class="card"><div class="ring-wrap">' + ring(prep, "Preparazione", "var(--cyan)") +
      '<div><div style="font-weight:700;margin-bottom:4px">Preparazione stimata</div>' +
      '<div class="page-sub" style="margin:0;font-size:.88rem">Media di padronanza su Matematica 1 e 2. Cresce risolvendo esercizi e completando argomenti.</div></div></div></div>';
    html += '<div class="card"><div class="ring-wrap">' + ring(prob, "Esame", "var(--green)") +
      '<div><div style="font-weight:700;margin-bottom:4px">Probabilità di superare l\'esame</div>' +
      '<div class="page-sub" style="margin:0;font-size:.88rem">Stima basata sulla tua preparazione complessiva. Indicativa, non una promessa!</div></div></div></div>';
    html += '</div>';

    // continua / azioni
    html += '<div class="card card--pad" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">' +
      '<div><div class="page-kicker" style="margin-bottom:4px">Riprendi</div>' +
      '<div style="font-size:1.2rem;font-weight:700">' + (rec ? rec.title : "Derivate") + '</div>' +
      '<div class="page-sub" style="margin-top:4px;font-size:.9rem">' + (rec ? rec.summary : "") + '</div></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      (rec && MT.hasModule(rec.id) ? '<button class="btn btn--primary" data-go="exercise/' + rec.id + '"><svg viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>Allenati</button>' : "") +
      (rec ? '<button class="btn btn--ghost" data-go="topic/' + rec.id + '">Studia teoria</button>' : "") +
      '</div></div></div>';

    // quick actions
    html += '<div class="grid grid-3">' +
      quickCard("test", "M9 11l3 3 8-8M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11", "Test iniziale", state.diagnostic.done ? "Rifai la diagnosi" : "Scopri le tue lacune") +
      quickCard("esercizi", "M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z", "Esercizi", "Generatore infinito") +
      quickCard("simulazioni", "M12 6v6l4 2M12 22a10 10 0 110-20 10 10 0 010 20z", "Simulazione", "Prova d'esame a tempo") +
      '</div>';

    if (crit.length) {
      html += '<h3 style="margin:26px 0 12px;font-size:1.05rem">Da rinforzare subito</h3><div class="grid grid-2">';
      crit.slice(0, 4).forEach(t => html += topicMiniCard(t));
      html += '</div>';
    }
    html += '</div>';
    $("#main").innerHTML = html;
    wireGo($("#main"));
    requestAnimationFrame(() => { drawRing("ring-Preparazione", prep); drawRing("ring-Esame", prob); });
  }
  function kpi(icon, label, val, sub) {
    return '<div class="kpi"><div class="kpi__top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="' + icon + '"/></svg>' + label + '</div>' +
      '<div class="kpi__val">' + val + '</div><div class="kpi__sub">' + sub + '</div></div>';
  }
  function ring(frac, label, color) {
    const id = "ring-" + label;
    return '<div class="ring"><svg width="132" height="132" viewBox="0 0 132 132">' +
      '<circle cx="66" cy="66" r="56" fill="none" stroke="var(--border)" stroke-width="11"/>' +
      '<circle id="' + id + '" cx="66" cy="66" r="56" fill="none" stroke="' + color + '" stroke-width="11" stroke-linecap="round" stroke-dasharray="' + (2 * Math.PI * 56) + '" stroke-dashoffset="' + (2 * Math.PI * 56) + '"/></svg>' +
      '<div class="ring__txt"><div class="ring__pct">' + Math.round(frac * 100) + '%</div><div class="ring__lbl">' + label + '</div></div></div>';
  }
  function drawRing(id, frac) {
    const c = document.getElementById(id);
    if (!c) return;
    const C = 2 * Math.PI * 56;
    requestAnimationFrame(() => { c.style.transition = "stroke-dashoffset 1s var(--ease)"; c.style.strokeDashoffset = C * (1 - frac); });
  }
  function quickCard(route, icon, name, sub) {
    return '<button class="topic-card" data-go="' + route + '"><div class="topic-card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + icon + '"/></svg></div>' +
      '<div class="topic-card__body"><div class="topic-card__name">' + name + '</div><div class="topic-card__desc">' + sub + '</div></div></button>';
  }
  function topicMiniCard(t) {
    const m = masteryOf(t.id);
    return '<button class="topic-card" data-go="' + (MT.hasModule(t.id) ? "exercise/" : "topic/") + t.id + '">' +
      '<div class="topic-card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + t.icon + '"/></svg></div>' +
      '<div class="topic-card__body"><div class="topic-card__name">' + t.title + '</div>' +
      '<div class="topic-card__desc">' + t.summary + '</div>' +
      '<div class="topic-card__bar"><i style="width:' + (m * 100) + '%"></i></div></div></button>';
  }

  /* ── TEST INIZIALE ── */
  let DQ = null;
  function viewDiagnostic() {
    DQ = { i: 0, answers: new Array(MT.diagnostic.length).fill(null) };
    renderDiagnosticQ();
  }
  function renderDiagnosticQ() {
    const q = MT.diagnostic[DQ.i];
    let dots = '<div class="progress-dots">';
    for (let i = 0; i < MT.diagnostic.length; i++) dots += '<i class="' + (i < DQ.i ? "done" : i === DQ.i ? "cur" : "") + '"></i>';
    dots += "</div>";
    let html = '<div class="fade-in ex-wrap"><div class="page-head"><div class="page-kicker">Test di ingresso · Domanda ' + (DQ.i + 1) + "/" + MT.diagnostic.length + '</div>' +
      '<div class="page-title" style="font-size:1.4rem">Valuto le tue competenze</div></div>' + dots +
      '<div class="card card--pad"><div class="quiz-q" style="font-size:1.15rem;margin-bottom:6px">' + q.q + '</div><div class="quiz-opts">';
    q.opts.forEach((o, idx) => {
      html += '<button class="quiz-opt' + (DQ.answers[DQ.i] === idx ? " sel" : "") + '" data-opt="' + idx + '">' +
        '<span class="quiz-opt__key">' + "ABCD"[idx] + '</span><span>' + o + '</span></button>';
    });
    html += '</div></div><div style="display:flex;justify-content:space-between;margin-top:18px">' +
      '<button class="btn btn--ghost" id="dPrev"' + (DQ.i === 0 ? " disabled" : "") + '>Indietro</button>' +
      '<button class="btn btn--primary" id="dNext">' + (DQ.i === MT.diagnostic.length - 1 ? "Termina test" : "Avanti") + '</button>' +
      '</div></div>';
    $("#main").innerHTML = html;
    $$(".quiz-opt").forEach(b => b.addEventListener("click", () => {
      DQ.answers[DQ.i] = parseInt(b.dataset.opt, 10);
      $$(".quiz-opt").forEach(x => x.classList.remove("sel")); b.classList.add("sel");
    }));
    $("#dPrev").addEventListener("click", () => { if (DQ.i > 0) { DQ.i--; renderDiagnosticQ(); renderMath($("#main")); } });
    $("#dNext").addEventListener("click", () => {
      if (DQ.answers[DQ.i] == null) { toast("⚠️", "Seleziona una risposta."); return; }
      if (DQ.i < MT.diagnostic.length - 1) { DQ.i++; renderDiagnosticQ(); renderMath($("#main")); }
      else finishDiagnostic();
    });
    renderMath($("#main"));
  }
  function finishDiagnostic() {
    const bySkill = {};
    let correct = 0;
    MT.diagnostic.forEach((q, i) => {
      const ok = DQ.answers[i] === q.correct;
      if (ok) correct++;
      (bySkill[q.skill] = bySkill[q.skill] || { c: 0, n: 0 }).n++;
      if (ok) bySkill[q.skill].c++;
    });
    // seed mastery
    Object.keys(bySkill).forEach(sk => {
      const r = bySkill[sk].c / bySkill[sk].n;
      const m = state.mastery[sk] || (state.mastery[sk] = { seen: 0, correct: 0, attempts: 0, mastery: 0, completed: false });
      m.seen = 1; m.mastery = clamp(0.15 + r * 0.65, 0, 0.85); if (m.mastery >= 0.8) m.completed = true;
    });
    state.diagnostic = { done: true, results: bySkill, score: correct, total: MT.diagnostic.length, date: dayStr() };
    // costruisci piano: argomenti in ordine di livello/prereq con mastery < 0.8
    const plan = [];
    MT.curriculum.forEach(l => l.topics.forEach(t => { if (masteryOf(t.id) < 0.8) plan.push(t.id); }));
    state.plan = plan;
    touchStreak();
    awardXp(40, "Test completato! +40 XP");
    checkBadges(); save();
    renderDiagnosticResult(correct, bySkill);
  }
  function renderDiagnosticResult(correct, bySkill) {
    const pct = correct / MT.diagnostic.length;
    const weak = Object.keys(bySkill).filter(s => bySkill[s].c / bySkill[s].n < 0.6).map(s => MT.findTopic(s)).filter(Boolean);
    const start = state.plan.length ? MT.findTopic(state.plan[0]) : null;
    let html = '<div class="fade-in"><div class="page-head"><div class="page-kicker">Risultato del test</div>' +
      '<div class="page-title">Hai risposto bene a ' + correct + " su " + MT.diagnostic.length + '</div>' +
      '<div class="page-sub">Ho usato le tue risposte per stimare la padronanza di ciascuna area e costruire il <b>piano di studio</b>.</div></div>';
    html += '<div class="card card--pad" style="margin-bottom:16px"><div class="ring-wrap">' + ring(pct, "Ingresso", "var(--cyan)") +
      '<div><div style="font-weight:700;margin-bottom:6px">' + (pct >= 0.8 ? "Ottima base di partenza!" : pct >= 0.5 ? "Base discreta, con qualche lacuna." : "Conviene ripartire dalle fondamenta.") + '</div>' +
      '<div class="page-sub" style="margin:0;font-size:.9rem">Le aree deboli sono evidenziate qui sotto e messe in cima al tuo percorso.</div></div></div></div>';
    if (weak.length) {
      html += '<h3 style="margin:6px 0 12px;font-size:1.05rem">Aree da rinforzare</h3><div class="grid grid-2" style="margin-bottom:18px">';
      weak.forEach(t => html += topicMiniCard(t));
      html += '</div>';
    }
    html += '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button class="btn btn--primary" data-go="plan">Vai al piano di studio</button>' +
      (start ? '<button class="btn btn--ghost" data-go="' + (MT.hasModule(start.id) ? "exercise/" : "topic/") + start.id + '">Inizia da: ' + start.title + '</button>' : "") +
      '</div></div>';
    $("#main").innerHTML = html;
    wireGo($("#main"));
    requestAnimationFrame(() => drawRing("ring-Ingresso", pct));
    renderMath($("#main"));
  }

  /* ── PIANO DI STUDIO ── */
  function viewPlan() {
    if (!state.diagnostic.done) {
      $("#main").innerHTML = emptyState("M9 11l3 3 8-8", "Nessun piano ancora", "Completa il <b>test di ingresso</b> e genererò un percorso personalizzato.", "test", "Fai il test iniziale");
      wireGo($("#main")); return;
    }
    let html = '<div class="fade-in"><div class="page-head"><div class="page-kicker">Piano di studio personalizzato</div>' +
      '<div class="page-title">Il tuo percorso</div>' +
      '<div class="page-sub">Argomenti ordinati per priorità. Gli argomenti bloccati 🔒 si sbloccano quando raggiungi i prerequisiti (padronanza ≥ 50%).</div></div>';
    html += '<div class="res-stack" style="display:flex;flex-direction:column;gap:12px">';
    let n = 1;
    state.plan.forEach(id => {
      const t = MT.findTopic(id); if (!t) return;
      const m = masteryOf(id), st = topicStatus(t);
      const lvl = MT.curriculum.find(l => l.id === t.level);
      html += '<button class="topic-card ' + (st === "locked" ? "locked" : "") + '" data-go="' + (MT.hasModule(id) ? "exercise/" : "topic/") + id + '">' +
        '<div class="topic-card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + t.icon + '"/></svg></div>' +
        '<div class="topic-card__body"><div class="topic-card__name">' + n + ". " + t.title +
        ' <span class="chip chip--gray">' + lvl.label + '</span>' +
        (st === "done" ? '<span class="chip chip--green">completato</span>' : st === "locked" ? '<span class="chip chip--amber">bloccato</span>' : "") + '</div>' +
        '<div class="topic-card__desc">' + t.summary + '</div>' +
        '<div class="topic-card__bar"><i style="width:' + (m * 100) + '%"></i></div></div></button>';
      n++;
    });
    html += '</div></div>';
    $("#main").innerHTML = html;
    wireGo($("#main"));
  }

  /* ── LIVELLO (lista argomenti) ── */
  function viewLevel(lvlId) {
    const lvl = MT.curriculum.find(l => l.id === lvlId);
    if (!lvl) { navigate("#/dashboard"); return; }
    let html = '<div class="fade-in"><div class="page-head"><div class="page-kicker">Livello ' + lvlId + (lvlId === 0 ? " · Fondamenta" : "") + '</div>' +
      '<div class="page-title">' + lvl.label + '</div><div class="page-sub">' + lvl.blurb + '</div></div>';
    html += '<div class="grid grid-2">';
    lvl.topics.forEach(t => {
      const m = masteryOf(t.id), st = topicStatus(t);
      const badge = st === "done" ? '<span class="chip chip--green">completato</span>'
        : st === "locked" ? '<span class="chip chip--amber">🔒 bloccato</span>'
          : st === "progress" ? '<span class="chip">in corso</span>' : "";
      const mod = MT.hasModule(t.id) ? '<span class="chip chip--violet">esercizi</span>' : "";
      html += '<button class="topic-card ' + (st === "locked" ? "locked" : "") + '" data-go="topic/' + t.id + '">' +
        '<div class="topic-card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + t.icon + '"/></svg></div>' +
        '<div class="topic-card__body"><div class="topic-card__name">' + t.title + ' ' + badge + ' ' + mod + '</div>' +
        '<div class="topic-card__desc">' + t.summary + '</div>' +
        '<div class="topic-card__bar"><i style="width:' + (m * 100) + '%"></i></div></div></button>';
    });
    html += '</div></div>';
    $("#main").innerHTML = html;
    wireGo($("#main"));
  }

  /* ── ARGOMENTO (teoria) ── */
  function viewTopic(id) {
    const t = MT.findTopic(id);
    if (!t) { navigate("#/dashboard"); return; }
    state.lastTopic = id; saveSoon();
    const lvl = MT.curriculum.find(l => l.id === t.level);
    const locked = topicStatus(t) === "locked";
    let html = '<div class="fade-in"><div class="page-head"><div class="page-kicker">' + lvl.label + ' · Teoria</div>' +
      '<div class="page-title">' + t.title + '</div><div class="page-sub">' + t.summary + '</div></div>';
    if (locked) {
      const missing = t.prereqs.filter(p => masteryOf(p) < 0.5).map(p => MT.findTopic(p).title).join(", ");
      html += '<div class="callout callout--warn"><div class="callout__t">Prerequisiti consigliati</div>' +
        'Per affrontare al meglio questo argomento conviene prima padroneggiare: <b>' + missing + '</b>. Puoi comunque proseguire.</div>';
    }
    html += '<div class="theory card card--pad">';
    t.theory.forEach(sec => { html += "<h3>" + sec.h + "</h3><p>" + sec.body + "</p>"; });
    html += '</div>';
    if (t.formulas && t.formulas.length) {
      html += '<h3 style="margin:24px 0 12px;font-size:1.05rem">Formule chiave</h3><div class="grid grid-2">';
      t.formulas.forEach(f => html += '<div class="card" style="padding:14px 16px"><div class="kpi__top" style="margin-bottom:6px">' + (f.cap || "") + '</div>\\[' + f.tex + '\\]</div>');
      html += '</div>';
    }
    html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px">';
    if (MT.hasModule(t.id)) html += '<button class="btn btn--primary" data-go="exercise/' + t.id + '"><svg viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>Allenati con gli esercizi</button>';
    else html += '<span class="chip chip--gray">Esercizi interattivi in arrivo per questo argomento</span>';
    html += '</div></div>';
    $("#main").innerHTML = html;
    wireGo($("#main"));
  }

  /* ── ESERCIZIO / TUTOR ── */
  function viewExercise(id) {
    const t = MT.findTopic(id);
    if (!t || !MT.hasModule(id)) { viewTopic(id); return; }
    state.lastTopic = id; saveSoon();
    EX.topicId = id;
    newExercise();
  }
  function newExercise() {
    EX.ex = MT.generate(EX.topicId, EX.diff);
    EX.hints = 0; EX.solved = false;
    renderExercise();
  }
  function renderExercise() {
    const t = MT.findTopic(EX.topicId), ex = EX.ex;
    const diffChip = { base: "chip--green", intermedio: "chip--amber", esame: "chip--red" }[EX.diff];
    let html = '<div class="fade-in ex-wrap"><div class="page-head"><div class="page-kicker">' + t.title + ' · Tutor passo-passo</div>' +
      '<div class="page-title" style="font-size:1.4rem">' + ex.instruction + '</div></div>';
    html += '<div class="ex-meta"><div class="seg" id="diffSeg">' +
      seg("base", "Base") + seg("intermedio", "Intermedio") + seg("esame", "Esame") + '</div>' +
      '<span class="chip ' + diffChip + '">' + EX.diff + '</span>' +
      '<button class="btn btn--ghost btn--sm" id="btnNew"><svg viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0114.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0020.5 15"/></svg>Nuovo</button></div>';

    html += '<div class="ex-prompt"><div class="ex-prompt__instr">Esercizio</div><div class="ex-prompt__math">\\[' + ex.promptLatex + '\\]</div></div>';

    html += '<div class="ans-row"><input class="ans-input" id="ansInput" placeholder="Scrivi qui la tua risposta…" autocomplete="off" spellcheck="false">' +
      '<button class="btn btn--primary" id="btnCheck"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Verifica</button></div>' +
      '<div class="input-hint">Sintassi: usa <code>^</code> per le potenze, <code>*</code> per il prodotto. Es: <code>12x^3-4x</code>, <code>2*cos(x)</code>. Accetto forme equivalenti.</div>';

    html += '<div class="feedback" id="exFeedback"></div>';

    html += '<div class="help-bar">' +
      '<button class="btn btn--ghost btn--sm" id="btnHint"><svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0012 2z"/></svg>Suggerimento</button>' +
      '<button class="btn btn--ghost btn--sm" id="btnSteps"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg>Guidami passo-passo</button>' +
      '<button class="btn btn--ghost btn--sm" id="btnSolve"><svg viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>Mostra soluzione</button>' +
      (ex.plot ? '<button class="btn btn--ghost btn--sm" id="btnPlot"><svg viewBox="0 0 24 24"><path d="M3 3v18h18M7 14l3-3 3 3 5-6"/></svg>Grafico</button>' : "") +
      '</div>';

    html += '<div id="stepsWrap" style="display:none;margin-top:20px"><h3 style="font-size:1rem;margin-bottom:6px">Risoluzione guidata</h3>' +
      '<div class="page-sub" style="margin:0 0 10px;font-size:.85rem">Rispondi tu, oppure scopri un aiuto alla volta. Cerco di farti ragionare, non di darti subito la soluzione.</div>' +
      '<div class="steps" id="steps"></div></div>';

    html += '<div id="plotWrap" style="display:none;margin-top:20px"><div class="card" style="padding:14px"><canvas id="plotCanvas" class="spark" style="height:260px"></canvas>' +
      '<div class="input-hint" style="margin-top:8px;text-align:center">La curva <span style="color:var(--cyan)">f(x)</span> e la sua derivata <span style="color:var(--amber)">f\'(x)</span>. Dove f cresce, f\' è positiva.</div></div></div>';

    html += '</div>';
    $("#main").innerHTML = html;

    // wiring
    $$("#diffSeg button").forEach(b => b.addEventListener("click", () => { EX.diff = b.dataset.d; newExercise(); renderMath($("#main")); }));
    $("#btnNew").addEventListener("click", () => { newExercise(); renderMath($("#main")); });
    const input = $("#ansInput");
    $("#btnCheck").addEventListener("click", checkAnswer);
    input.addEventListener("keydown", e => { if (e.key === "Enter") checkAnswer(); });
    input.focus();
    $("#btnHint").addEventListener("click", showHint);
    $("#btnSteps").addEventListener("click", () => { buildSteps(); $("#stepsWrap").style.display = "block"; $("#stepsWrap").scrollIntoView({ behavior: "smooth", block: "nearest" }); });
    $("#btnSolve").addEventListener("click", revealSolution);
    if (ex.plot) $("#btnPlot").addEventListener("click", () => {
      const w = $("#plotWrap"); const show = w.style.display === "none";
      w.style.display = show ? "block" : "none";
      if (show) requestAnimationFrame(() => MTutor.plot($("#plotCanvas"), ex.plot.f, ex.plot.d, ex.domain));
    });
    renderMath($("#main"));
  }
  function seg(d, label) { return '<button class="' + (EX.diff === d ? "active" : "") + '" data-d="' + d + '">' + label + '</button>'; }

  function checkAnswer() {
    if (EX.solved) { newExercise(); renderMath($("#main")); return; }
    const input = $("#ansInput");
    const res = MTutor.equivalent(input.value, EX.ex.answerExpr, EX.ex.domain);
    const fb = $("#exFeedback");
    if (res.ok) {
      input.classList.remove("bad"); input.classList.add("ok");
      EX.solved = true;
      const penalty = EX.hints >= 3 ? 0.15 : EX.hints === 2 ? 0.4 : EX.hints === 1 ? 0.65 : 1;
      const base = { base: 20, intermedio: 28, esame: 38 }[EX.diff];
      const gain = Math.round(base * penalty);
      updateMastery(EX.topicId, true, EX.diff);
      touchStreak();
      fb.className = "feedback feedback--ok show";
      fb.innerHTML = '<b>Corretto! ✅</b> ' + (EX.hints ? "(con aiuto) " : "") + '+' + gain + ' XP.<br>Risultato: \\(' + EX.ex.answerLatex + '\\)' +
        '<div style="margin-top:8px"><button class="btn btn--primary btn--sm" id="btnNext"><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>Prossimo esercizio</button></div>';
      $("#btnCheck").textContent = "Nuovo";
      awardXp(gain);
      renderMath(fb);
      $("#btnNext").addEventListener("click", () => { newExercise(); renderMath($("#main")); });
    } else {
      input.classList.remove("ok"); input.classList.add("bad");
      updateMastery(EX.topicId, false, EX.diff);
      fb.className = "feedback feedback--bad show";
      let msg = "<b>Non ci siamo ancora.</b> ";
      if (res.reason === "parse") msg += "Controlla la sintassi: usa <code>*</code> e <code>^</code> (es. <code>3*x^2</code>).";
      else if (res.reason === "empty") msg += "Scrivi una risposta prima di verificare.";
      else msg += "Riprova. Vuoi un <b>suggerimento</b> o la <b>guida passo-passo</b>?";
      fb.innerHTML = msg;
      renderMath(fb);
    }
  }
  function showHint() {
    EX.hints = Math.max(EX.hints, 1);
    const fb = $("#exFeedback");
    fb.className = "feedback feedback--hint show";
    fb.innerHTML = "<b>💡 Suggerimento.</b> " + (EX.ex.steps[0].hint || EX.ex.steps[0].guide);
    renderMath(fb);
  }
  function revealSolution() {
    EX.hints = 3; EX.solved = true;
    const fb = $("#exFeedback");
    fb.className = "feedback feedback--hint show";
    fb.innerHTML = "<b>Soluzione.</b> \\[" + (EX.ex.steps[EX.ex.steps.length - 1].solutionLatex) + "\\]" +
      '<div style="margin-top:8px"><button class="btn btn--primary btn--sm" id="btnNext2">Prossimo esercizio</button></div>';
    $("#ansInput").value = EX.ex.answerLatex.replace(/\\/g, "");
    buildSteps(true); $("#stepsWrap").style.display = "block";
    renderMath(fb);
    $("#btnNext2").addEventListener("click", () => { newExercise(); renderMath($("#main")); });
  }
  function buildSteps(revealAll) {
    EX.hints = Math.max(EX.hints, 2);
    const wrap = $("#steps");
    let html = "";
    EX.ex.steps.forEach((s, i) => {
      html += '<div class="step active" data-i="' + i + '"><div class="step__num">' + (i + 1) + '</div>' +
        '<div class="step__body"><div class="step__q">' + s.ask + '</div>' +
        '<div class="step__interactive">';
      if (s.expect) {
        html += '<div class="ans-row" style="margin-top:10px"><input class="ans-input" data-step="' + i + '" placeholder="La tua risposta a questo passo…" autocomplete="off" spellcheck="false">' +
          '<button class="btn btn--ghost btn--sm" data-checkstep="' + i + '">Verifica passo</button></div>';
      }
      html += '<div class="help-bar"><button class="btn btn--ghost btn--sm" data-rev="hint" data-i="' + i + '">Suggerimento</button>' +
        '<button class="btn btn--ghost btn--sm" data-rev="guide" data-i="' + i + '">Guida</button>' +
        '<button class="btn btn--ghost btn--sm" data-rev="sol" data-i="' + i + '">Soluzione del passo</button></div>' +
        '<div class="feedback feedback--hint" data-reveal="' + i + '" style="display:none"></div>' +
        '</div></div></div>';
    });
    wrap.innerHTML = html;
    $$("[data-rev]", wrap).forEach(b => b.addEventListener("click", () => {
      const i = +b.dataset.i, s = EX.ex.steps[i], r = b.dataset.rev;
      const box = $('[data-reveal="' + i + '"]', wrap);
      box.style.display = "block";
      if (r === "hint") box.innerHTML = "<b>💡</b> " + (s.hint || s.guide);
      else if (r === "guide") box.innerHTML = "<b>Guida.</b> " + s.guide;
      else { box.innerHTML = "<b>Soluzione.</b> \\[" + s.solutionLatex + "\\] " + (s.solution || ""); $('[data-i="' + i + '"]', wrap).classList.add("done"); }
      renderMath(box);
    }));
    $$("[data-checkstep]", wrap).forEach(b => b.addEventListener("click", () => {
      const i = +b.dataset.checkstep, s = EX.ex.steps[i];
      const inp = $('input[data-step="' + i + '"]', wrap);
      const res = MTutor.equivalent(inp.value, s.expect, EX.ex.domain);
      const box = $('[data-reveal="' + i + '"]', wrap);
      box.style.display = "block";
      if (res.ok) {
        inp.classList.remove("bad"); inp.classList.add("ok");
        $('[data-i="' + i + '"]', wrap).classList.add("done");
        box.className = "feedback feedback--ok"; box.innerHTML = "<b>Passo corretto! ✅</b> +5 XP";
        awardXp(5);
        if (i === EX.ex.steps.length - 1 && !EX.solved) { $("#ansInput").value = inp.value; }
      } else {
        inp.classList.remove("ok"); inp.classList.add("bad");
        box.className = "feedback feedback--bad"; box.innerHTML = "Non ancora. Prova con il <b>Suggerimento</b> qui sotto.";
      }
      renderMath(box);
    }));
    if (revealAll) $$("[data-rev='sol']", wrap).forEach(b => b.click());
    renderMath(wrap);
  }

  /* ── ESERCIZI (hub) ── */
  function viewEserciziHub() {
    const mods = MT.moduleTopics().map(id => MT.findTopic(id));
    let html = '<div class="fade-in"><div class="page-head"><div class="page-kicker">Allenamento</div>' +
      '<div class="page-title">Generatore di esercizi</div>' +
      '<div class="page-sub">Esercizi infiniti a difficoltà crescente, con tutor passo-passo e verifica automatica. Scegli un argomento.</div></div>';
    html += '<div class="grid grid-2">';
    mods.forEach(t => html += topicMiniCard(t));
    html += '</div>';
    html += '<div class="callout" style="margin-top:22px"><div class="callout__t">In arrivo</div>Altri moduli interattivi (limiti, integrali, numeri complessi…) verranno aggiunti progressivamente. La teoria di tutti gli argomenti è già consultabile nel <b>Percorso</b>.</div>';
    html += '</div>';
    $("#main").innerHTML = html;
    wireGo($("#main"));
  }

  /* ── SIMULAZIONI ── */
  function viewSimulazioni() {
    let html = '<div class="fade-in"><div class="page-head"><div class="page-kicker">Simulazioni d\'esame</div>' +
      '<div class="page-title">Mettiti alla prova</div>' +
      '<div class="page-sub">Una prova a tempo con esercizi misti, correzione automatica e voto finale in trentesimi. Soglia di sufficienza: 18/30.</div></div>';
    html += '<div class="grid grid-2">';
    html += examCard("rapida", "Prova rapida", "6 esercizi · 15 min", 6, 15);
    html += examCard("completa", "Prova completa", "10 esercizi · 30 min", 10, 30);
    html += '</div>';
    if (state.examsPassed) html += '<div class="callout" style="margin-top:20px"><div class="callout__t">Storico</div>Hai superato <b>' + state.examsPassed + '</b> simulazion' + (state.examsPassed === 1 ? "e" : "i") + '. 🎓</div>';
    html += '</div>';
    $("#main").innerHTML = html;
    $$("[data-exam]").forEach(b => b.addEventListener("click", () => startExam(+b.dataset.n, +b.dataset.min)));
  }
  function examCard(key, title, sub, n, min) {
    return '<button class="topic-card" data-exam="' + key + '" data-n="' + n + '" data-min="' + min + '">' +
      '<div class="topic-card__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v6l4 2M12 22a10 10 0 110-20 10 10 0 010 20z"/></svg></div>' +
      '<div class="topic-card__body"><div class="topic-card__name">' + title + '</div><div class="topic-card__desc">' + sub + '</div></div></button>';
  }
  function startExam(n, minutes) {
    const mods = MT.moduleTopics();
    const diffs = ["base", "base", "intermedio", "intermedio", "esame"];
    const items = [];
    for (let i = 0; i < n; i++) {
      const tid = mods[i % mods.length];
      const diff = diffs[Math.min(diffs.length - 1, Math.floor(i / n * diffs.length))];
      items.push({ topicId: tid, ex: MT.generate(tid, diff), answer: "", correct: null });
    }
    EXAM = { items, endsAt: Date.now() + minutes * 60000, minutes, submitted: false, timerId: null };
    navigate("#/exam/run");
  }
  function viewExamRun() {
    if (!EXAM) { navigate("#/simulazioni"); return; }
    let html = '<div class="fade-in"><div class="exam-bar"><div><b>Simulazione in corso</b> · ' + EXAM.items.length + ' esercizi</div>' +
      '<div class="exam-timer" id="examTimer">--:--</div></div>';
    EXAM.items.forEach((it, i) => {
      const t = MT.findTopic(it.topicId);
      html += '<div class="card" style="margin-bottom:14px"><div class="kpi__top" style="margin-bottom:8px">Esercizio ' + (i + 1) + ' · ' + t.title + '</div>' +
        '<div style="font-size:.85rem;color:var(--dim);margin-bottom:8px">' + it.ex.instruction + '</div>' +
        '<div style="text-align:center;margin:10px 0">\\[' + it.ex.promptLatex + '\\]</div>' +
        '<input class="ans-input" data-exq="' + i + '" placeholder="Risposta…" autocomplete="off" spellcheck="false" style="width:100%"></div>';
    });
    html += '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px"><button class="btn btn--ghost" id="examQuit">Abbandona</button><button class="btn btn--primary" id="examSubmit">Consegna</button></div></div>';
    $("#main").innerHTML = html;
    $$("input[data-exq]").forEach(inp => inp.addEventListener("input", () => { EXAM.items[+inp.dataset.exq].answer = inp.value; }));
    $("#examSubmit").addEventListener("click", submitExam);
    $("#examQuit").addEventListener("click", () => { stopExamTimer(); EXAM = null; navigate("#/simulazioni"); });
    startExamTimer();
    renderMath($("#main"));
  }
  function startExamTimer() {
    stopExamTimer();
    const tick = () => {
      if (!EXAM || EXAM.submitted) return;
      const ms = EXAM.endsAt - Date.now();
      const el = $("#examTimer"); if (!el) return;
      if (ms <= 0) { el.textContent = "00:00"; submitExam(); return; }
      const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
      el.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
      el.classList.toggle("warn", ms < 60000);
    };
    tick();
    EXAM.timerId = setInterval(tick, 1000);
  }
  function stopExamTimer() { if (EXAM && EXAM.timerId) { clearInterval(EXAM.timerId); EXAM.timerId = null; } }
  function submitExam() {
    if (!EXAM || EXAM.submitted) return;
    EXAM.submitted = true; stopExamTimer();
    let correct = 0;
    EXAM.items.forEach(it => {
      const res = MTutor.equivalent(it.answer, it.ex.answerExpr, it.ex.domain);
      it.correct = res.ok; if (res.ok) correct++;
      updateMastery(it.topicId, res.ok, "esame");
    });
    const voto = Math.round(correct / EXAM.items.length * 30);
    const passed = voto >= 18;
    if (passed) { state.examsPassed = (state.examsPassed || 0) + 1; }
    touchStreak();
    awardXp(correct * 15 + (passed ? 30 : 0), "Simulazione conclusa");
    renderExamReport(correct, voto, passed);
  }
  function renderExamReport(correct, voto, passed) {
    let html = '<div class="fade-in"><div class="page-head"><div class="page-kicker">Report simulazione</div>' +
      '<div class="page-title">Voto: ' + voto + '/30 ' + (passed ? "🎓" : "") + '</div>' +
      '<div class="page-sub">' + (passed ? "Complimenti, hai superato la prova!" : "Non superata, ma ogni errore è un argomento da rinforzare.") + ' Risposte corrette: ' + correct + "/" + EXAM.items.length + '.</div></div>';
    EXAM.items.forEach((it, i) => {
      const t = MT.findTopic(it.topicId);
      html += '<div class="card" style="margin-bottom:12px;border-color:' + (it.correct ? "rgba(47,191,113,.4)" : "rgba(224,89,75,.4)") + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">' +
        '<div class="kpi__top" style="margin:0">Es. ' + (i + 1) + ' · ' + t.title + '</div>' +
        '<span class="chip ' + (it.correct ? "chip--green" : "chip--red") + '">' + (it.correct ? "corretto" : "errato") + '</span></div>' +
        '<div style="text-align:center;margin:10px 0">\\[' + it.ex.promptLatex + '\\]</div>' +
        '<div style="font-size:.85rem;color:var(--dim)">La tua risposta: <code>' + (it.answer || "—") + '</code> · Soluzione: \\(' + it.ex.answerLatex + '\\)</div></div>';
    });
    html += '<div style="display:flex;gap:10px;margin-top:12px"><button class="btn btn--primary" data-go="simulazioni">Nuova simulazione</button><button class="btn btn--ghost" data-go="dashboard">Dashboard</button></div></div>';
    $("#main").innerHTML = html;
    wireGo($("#main"));
    renderMath($("#main"));
  }

  /* ── STATISTICHE ── */
  function viewStats() {
    const hours = state.studySeconds / 3600;
    let html = '<div class="fade-in"><div class="page-head"><div class="page-kicker">Statistiche</div>' +
      '<div class="page-title">I tuoi progressi</div><div class="page-sub">Andamento dell\'esperienza e padronanza per argomento.</div></div>';
    html += '<div class="kpi-grid">' +
      kpi('M12 6v6l4 2', "Ore di studio", hours.toFixed(1), "") +
      kpi('M13 2L3 14h9l-1 8 10-12h-9z', "XP totali", Math.round(state.xp), "Livello " + state.level) +
      kpi('M20 6L9 17l-5-5', "Esercizi corretti", MT.totalCorrect(state), "") +
      kpi('M12 2s4 4 4 8a4 4 0 01-8 0', "Streak", state.streak.count + " gg", "record personale") +
      '</div>';
    html += '<div class="card card--pad" style="margin-bottom:16px"><div class="kpi__top">Andamento XP</div><canvas id="spark" class="spark"></canvas></div>';

    html += '<div class="card card--pad"><div class="kpi__top" style="margin-bottom:14px">Padronanza per argomento</div>';
    MT.curriculum.forEach(l => {
      html += '<div style="font-weight:700;font-size:.9rem;margin:14px 0 10px;color:var(--cyan)">' + l.label + '</div>';
      l.topics.forEach(t => {
        const m = masteryOf(t.id);
        const col = m >= 0.8 ? "var(--green)" : m >= 0.45 ? "var(--amber)" : m > 0 ? "var(--blue)" : "var(--border-2)";
        html += '<div class="bar-row"><div class="bar-row__name">' + t.title + '</div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + (m * 100) + '%;background:' + col + '"></div></div>' +
          '<div class="bar-row__pct">' + Math.round(m * 100) + '%</div></div>';
      });
    });
    html += '</div></div>';
    $("#main").innerHTML = html;
    requestAnimationFrame(drawSpark);
  }
  function drawSpark() {
    const cv = $("#spark"); if (!cv) return;
    const ctx = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H = cv.clientHeight || 120;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const css = getComputedStyle(document.documentElement);
    const colF = css.getPropertyValue("--cyan").trim();
    const data = state.history.length ? state.history : [{ d: dayStr(), xp: state.xp }];
    const xps = data.map(h => h.xp);
    const max = Math.max(1, ...xps), min = Math.min(0, ...xps);
    const X = i => 6 + (W - 12) * (data.length === 1 ? 0.5 : i / (data.length - 1));
    const Y = v => H - 10 - (H - 20) * (v - min) / (max - min || 1);
    // area
    ctx.beginPath(); ctx.moveTo(X(0), Y(xps[0]));
    data.forEach((h, i) => ctx.lineTo(X(i), Y(h.xp)));
    ctx.lineTo(X(data.length - 1), H - 6); ctx.lineTo(X(0), H - 6); ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, colF + "44"); grad.addColorStop(1, colF + "00");
    ctx.fillStyle = grad; ctx.fill();
    // line
    ctx.beginPath(); ctx.strokeStyle = colF; ctx.lineWidth = 2.4; ctx.lineJoin = "round";
    data.forEach((h, i) => i ? ctx.lineTo(X(i), Y(h.xp)) : ctx.moveTo(X(i), Y(h.xp)));
    ctx.stroke();
    data.forEach((h, i) => { ctx.beginPath(); ctx.arc(X(i), Y(h.xp), 2.6, 0, 7); ctx.fillStyle = colF; ctx.fill(); });
  }

  /* ── OBIETTIVI / BADGE ── */
  function viewObiettivi() {
    const li = levelInfo(state.xp);
    let html = '<div class="fade-in"><div class="page-head"><div class="page-kicker">Obiettivi</div>' +
      '<div class="page-title">Traguardi e gamification</div><div class="page-sub">Guadagna XP, sali di livello, mantieni la streak e colleziona badge.</div></div>';
    html += '<div class="card card--pad" style="margin-bottom:18px"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px"><div style="font-weight:700">Livello ' + li.level + '</div><div class="kpi__sub">' + Math.round(li.into) + " / " + li.span + ' XP al prossimo livello</div></div>' +
      '<div class="bar-track" style="height:12px"><div class="bar-fill" style="width:' + (li.pct * 100) + '%;background:linear-gradient(90deg,var(--cyan),var(--blue))"></div></div></div>';
    const got = state.badges.length, tot = MT.badges.length;
    html += '<h3 style="margin:6px 0 12px;font-size:1.05rem">Badge (' + got + "/" + tot + ')</h3><div class="badge-grid">';
    MT.badges.forEach(b => {
      const owned = state.badges.includes(b.id);
      html += '<div class="badge ' + (owned ? "" : "locked") + '"><div class="badge__ico">' + b.icon + '</div>' +
        '<div class="badge__name">' + b.name + '</div><div class="badge__desc">' + b.desc + '</div></div>';
    });
    html += '</div></div>';
    $("#main").innerHTML = html;
  }

  /* ───────── util viste ───────── */
  function emptyState(icon, title, msg, route, btn) {
    return '<div class="empty fade-in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="' + icon + '"/></svg>' +
      '<h3 style="color:var(--text);font-size:1.2rem;margin-bottom:6px">' + title + '</h3><p style="margin-bottom:18px">' + msg + '</p>' +
      '<button class="btn btn--primary" data-go="' + route + '">' + btn + '</button></div>';
  }
  function wireGo(scope) {
    $$("[data-go]", scope).forEach(b => b.addEventListener("click", () => { navigate("#/" + b.dataset.go); closeDrawers(); }));
  }

  /* ───────── DRAWERS (mobile) ───────── */
  function openSidebar() { $("#sidebar").classList.add("show"); $("#scrim").classList.add("show"); }
  function openCtx() { $("#ctx").classList.add("show"); $("#scrim").classList.add("show"); }
  function closeDrawers() { $("#sidebar").classList.remove("show"); $("#ctx").classList.remove("show"); $("#scrim").classList.remove("show"); }

  /* ───────── STUDY TIME ───────── */
  let lastActive = Date.now();
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach(ev => document.addEventListener(ev, () => lastActive = Date.now(), { passive: true }));
  setInterval(() => {
    if (document.visibilityState === "visible" && Date.now() - lastActive < 120000) {
      state.studySeconds += 10; saveSoon();
    }
  }, 10000);

  /* ───────── RESET ───────── */
  function resetAll() {
    if (!confirm("Azzerare tutti i progressi (XP, padronanza, badge, piano)? L'operazione non è reversibile.")) return;
    state = freshState(); save();
    toast("🧹", "Progressi azzerati.");
    updateHud(); buildNav(); navigate("#/dashboard");
  }

  /* ───────── INIT ───────── */
  function init() {
    initTheme();
    buildNav();
    updateHud();
    recordHistory(); save();
    $("#btnTheme").addEventListener("click", toggleTheme);
    $("#btnMenu").addEventListener("click", openSidebar);
    $("#btnCtx").addEventListener("click", openCtx);
    $("#scrim").addEventListener("click", closeDrawers);
    $("#btnReset").addEventListener("click", resetAll);
    window.addEventListener("hashchange", router);
    window.addEventListener("resize", () => { if (innerWidth > 1180) closeDrawers(); });
    if (!location.hash) location.hash = "#/dashboard";
    router();
  }
  // KaTeX è caricato in 'defer': inizializza a load completato
  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);
})();
