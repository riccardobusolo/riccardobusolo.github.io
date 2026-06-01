/* ════════════════════════════════════════════════════════════
   tutor.js — motore di verifica risposte + plotter
   • equivalenza simbolica per campionamento (math.js)
   • normalizzazione notazione "da studente" (anche italiana)
   • grafico di f e f' su canvas
   Espone window.MTutor
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* normalizza l'input dello studente in sintassi math.js */
  function normalize(input) {
    let s = String(input == null ? "" : input).trim();
    if (!s) return "";
    // se è scritto "f'(x)=..." o "x=..." prendi il membro destro
    if (s.includes("=")) s = s.slice(s.lastIndexOf("=") + 1).trim();
    s = s
      .replace(/π/g, "pi").replace(/√/g, "sqrt")
      .replace(/×/g, "*").replace(/·/g, "*").replace(/∗/g, "*")
      .replace(/–/g, "-").replace(/−/g, "-")
      .replace(/\s+/g, " ");
    // decimali con virgola → punto (solo tra cifre)
    s = s.replace(/(\d),(\d)/g, "$1.$2");
    // notazione italiana / abbreviazioni (anche dopo una cifra, es. "2sen(x)")
    s = s.replace(/senh(?=\s*\()/gi, "sinh").replace(/sen(?=\s*\()/gi, "sin");
    s = s.replace(/arctg(?=\s*\()/gi, "atan").replace(/cotg(?=\s*\()/gi, "cot").replace(/tg(?=\s*\()/gi, "tan");
    // logaritmo naturale: in math.js log(x) è già il logaritmo naturale
    s = s.replace(/ln(?=\s*\()/gi, "log");
    return s;
  }

  function toNumber(v) {
    if (v == null) return null;
    if (typeof v === "number") return v;
    if (typeof v === "object") {
      if ("im" in v && "re" in v) { // math.Complex
        if (Math.abs(v.im) > 1e-7) return null; // davvero complesso → scarta
        return v.re;
      }
    }
    const n = Number(v);
    return isNaN(n) ? null : n;
  }

  function compile(expr) {
    try { return window.math.compile(expr); } catch (e) { return null; }
  }

  function evalAt(compiled, x) {
    if (!compiled) return null;
    try { return toNumber(compiled.evaluate({ x: x })); } catch (e) { return null; }
  }

  /* equivalenza per campionamento su un intervallo */
  function equivalent(studentRaw, expectedExpr, domain) {
    const ns = normalize(studentRaw);
    if (!ns) return { ok: false, reason: "empty" };
    const cs = compile(ns);
    if (!cs) return { ok: false, reason: "parse" };
    const ce = compile(expectedExpr);
    if (!ce) return { ok: false, reason: "internal" };

    const a = (domain && domain.length === 2) ? domain[0] : -2.3;
    const b = (domain && domain.length === 2) ? domain[1] : 2.7;
    const N = 23;
    let valid = 0, match = 0;
    for (let i = 0; i < N; i++) {
      const x = a + (b - a) * (i + 0.5) / N;
      const va = evalAt(cs, x);
      const ve = evalAt(ce, x);
      if (va == null || ve == null || !isFinite(va) || !isFinite(ve)) continue;
      valid++;
      const tol = Math.max(1e-6 * (1 + Math.abs(va) + Math.abs(ve)), 1e-9);
      if (Math.abs(va - ve) <= tol) match++;
    }
    if (valid < 5) {
      // espressione costante o dominio sfortunato: prova qualche punto neutro
      let v2 = 0, m2 = 0;
      [0.37, 1.13, 2.41, -1.27, 3.05].forEach(x => {
        const va = evalAt(cs, x), ve = evalAt(ce, x);
        if (va == null || ve == null || !isFinite(va) || !isFinite(ve)) return;
        v2++;
        if (Math.abs(va - ve) <= Math.max(1e-6 * (1 + Math.abs(va) + Math.abs(ve)), 1e-9)) m2++;
      });
      if (v2 === 0) return { ok: false, reason: "undefined" };
      return { ok: m2 === v2, reason: m2 === v2 ? "" : "mismatch" };
    }
    return { ok: match === valid && valid >= 5, reason: match === valid ? "" : "mismatch" };
  }

  /* ════════════ PLOTTER ════════════ */
  function plot(canvas, fExpr, dExpr, domain) {
    if (!canvas || !window.math) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 600, cssH = canvas.clientHeight || 260;
    canvas.width = cssW * dpr; canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const css = getComputedStyle(document.documentElement);
    const colGrid = css.getPropertyValue("--border").trim() || "#ddd";
    const colAxis = css.getPropertyValue("--muted").trim() || "#888";
    const colF = css.getPropertyValue("--cyan").trim() || "#00c2b5";
    const colD = css.getPropertyValue("--amber").trim() || "#e0a83a";
    const colTxt = css.getPropertyValue("--dim").trim() || "#888";

    const xmin = domain ? domain[0] : -3, xmax = domain ? domain[1] : 3;
    const cf = compile(fExpr), cd = dExpr ? compile(dExpr) : null;

    // campiona per trovare il range y
    const samples = [];
    const M = 240;
    for (let i = 0; i <= M; i++) {
      const x = xmin + (xmax - xmin) * i / M;
      samples.push({ x, yf: evalAt(cf, x), yd: cd ? evalAt(cd, x) : null });
    }
    let ys = [];
    samples.forEach(s => { [s.yf, s.yd].forEach(y => { if (y != null && isFinite(y)) ys.push(y); }); });
    ys.sort((a, b) => a - b);
    let ymin = ys.length ? ys[Math.floor(ys.length * 0.02)] : -2;
    let ymax = ys.length ? ys[Math.floor(ys.length * 0.98)] : 2;
    if (ymin === ymax) { ymin -= 1; ymax += 1; }
    const padY = (ymax - ymin) * 0.12; ymin -= padY; ymax += padY;

    const PADL = 8, PADR = 8, PADT = 10, PADB = 10;
    const W = cssW - PADL - PADR, H = cssH - PADT - PADB;
    const X = x => PADL + (x - xmin) / (xmax - xmin) * W;
    const Y = y => PADT + (1 - (y - ymin) / (ymax - ymin)) * H;

    // griglia
    ctx.strokeStyle = colGrid; ctx.lineWidth = 1;
    ctx.font = "10px 'JetBrains Mono', monospace"; ctx.fillStyle = colTxt;
    const stepX = niceStep((xmax - xmin) / 6);
    for (let gx = Math.ceil(xmin / stepX) * stepX; gx <= xmax; gx += stepX) {
      ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(X(gx), PADT); ctx.lineTo(X(gx), PADT + H); ctx.stroke(); ctx.globalAlpha = 1;
    }
    const stepY = niceStep((ymax - ymin) / 5);
    for (let gy = Math.ceil(ymin / stepY) * stepY; gy <= ymax; gy += stepY) {
      ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(PADL, Y(gy)); ctx.lineTo(PADL + W, Y(gy)); ctx.stroke(); ctx.globalAlpha = 1;
    }
    // assi
    ctx.strokeStyle = colAxis; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.8;
    if (0 >= ymin && 0 <= ymax) { ctx.beginPath(); ctx.moveTo(PADL, Y(0)); ctx.lineTo(PADL + W, Y(0)); ctx.stroke(); }
    if (0 >= xmin && 0 <= xmax) { ctx.beginPath(); ctx.moveTo(X(0), PADT); ctx.lineTo(X(0), PADT + H); ctx.stroke(); }
    ctx.globalAlpha = 1;

    drawCurve(ctx, samples, "yf", X, Y, colF, 2.4, false);
    if (cd) drawCurve(ctx, samples, "yd", X, Y, colD, 2, true);

    // legenda
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillStyle = colF; ctx.fillText("— f(x)", PADL + 6, PADT + 14);
    if (cd) { ctx.fillStyle = colD; ctx.fillText("- - f '(x)", PADL + 64, PADT + 14); }
  }

  function drawCurve(ctx, samples, key, X, Y, color, width, dashed) {
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.setLineDash(dashed ? [6, 5] : []);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.beginPath();
    let pen = false;
    for (const s of samples) {
      const y = s[key];
      if (y == null || !isFinite(y)) { pen = false; continue; }
      const px = X(s.x), py = Y(y);
      // taglia salti enormi (asintoti)
      if (pen) ctx.lineTo(px, py); else { ctx.moveTo(px, py); pen = true; }
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function niceStep(raw) {
    const pow = Math.pow(10, Math.floor(Math.log10(Math.abs(raw) || 1)));
    const n = raw / pow;
    let step = n >= 5 ? 5 : n >= 2 ? 2 : 1;
    return step * pow;
  }

  window.MTutor = { normalize, equivalent, plot, evalAt, compile };
})();
