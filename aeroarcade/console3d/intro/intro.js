/**
 * Intro di accensione delle console Aero Arcade (uguale per tutte):
 * sott'acqua, risalita, sfera di vetro con le liane, lava lamp e scritta.
 * Disegnata su un canvas, musica sintetizzata dal vivo (nessun file).
 *
 *   const intro = AeroIntro.play(canvas, { volume: 0.7, muted: false, onEnd() {} });
 *   intro.skip(); intro.stop();
 */
(() => {
const BASE = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/[^/]*$/, "") : "";
let fontReady = null;
function loadFont() {
  if (fontReady) return fontReady;
  try { const f = new FontFace("Fredoka", `url(${BASE}fredoka-700.woff2)`, { weight: "700" }); document.fonts.add(f); fontReady = f.load(); } catch { fontReady = Promise.resolve(); }
  return fontReady;
}
loadFont();
/**
 * Comodità per le pagine delle console: mette l'intro dentro l'elemento dello
 * schermo, con volume e suoni presi dalle preferenze del sito; un clic o un tasto la salta.
 */
function attach(screenEl, onEnd, native) {
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem("aero-prefs") || "{}"); } catch {}
  if (prefs.intro === false) { onEnd(); return null; }
  const cv = document.createElement("canvas");
  cv.className = "aero-intro";
  cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:1;display:block;background:#000;transition:opacity .25s" + (native ? ";image-rendering:pixelated" : "");
  screenEl.append(cv);
  let done = false;
  const end = () => {
    if (done) return; done = true;
    removeEventListener("pointerdown", onDown, true);
    onEnd();
    // resta il nero dell'ultimo fotogramma finché arriva il gioco, poi sparisce
    setTimeout(() => { cv.style.opacity = "0"; setTimeout(() => cv.remove(), 260); }, 1500);
  };
  const onDown = (e) => { if (!e.target.closest || !e.target.closest("button")) h.skip(); };
  const vol = typeof prefs.volume === "number" ? prefs.volume : 0.8;
  const h = window.AeroIntro.play(cv, { volume: 0.7 * vol, onEnd: end, native });
  addEventListener("pointerdown", onDown, true);
  return { skip: () => h.skip(), stop: () => { done = true; h.stop(); removeEventListener("pointerdown", onDown, true); cv.remove(); } };
}
window.AeroIntro = { preload: loadFont, attach, play(cv, opts = {}) {

  const LAVA = '<svg viewBox="0 0 60 100" class="lava-lamp" aria-hidden="true">\n  <defs>\n    <linearGradient id="lava0liq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9f6ff"/><stop offset=".6" stop-color="#2fb4e8"/><stop offset="1" stop-color="#1b8fcf"/></linearGradient>\n    <radialGradient id="lava0wax" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#f0ffb0"/><stop offset=".55" stop-color="#9be82a"/><stop offset="1" stop-color="#4fa818"/></radialGradient>\n    <radialGradient id="lava0glow" cx=".5" cy="1" r=".75"><stop offset="0" stop-color="#f0ffb0" stop-opacity=".95"/><stop offset="1" stop-color="#f0ffb0" stop-opacity="0"/></radialGradient>\n    <linearGradient id="lava0cr" x1="0" y1="0" x2="1" y2="0">\n      <stop offset="0" stop-color="#2c3e4c"/><stop offset=".08" stop-color="#7d93a3"/><stop offset=".16" stop-color="#eef6fb"/>\n      <stop offset=".22" stop-color="#ffffff"/><stop offset=".3" stop-color="#a9bccb"/><stop offset=".42" stop-color="#6fb3cf"/>\n      <stop offset=".52" stop-color="#3a5263"/><stop offset=".62" stop-color="#b7c9d6"/><stop offset=".72" stop-color="#f4faff"/>\n      <stop offset=".82" stop-color="#8ea4b4"/><stop offset=".92" stop-color="#4b6273"/><stop offset="1" stop-color="#22323e"/></linearGradient>\n    <linearGradient id="lava0vshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#001a2a" stop-opacity=".35"/></linearGradient>\n    <linearGradient id="lava0edge" x1="0" y1="0" x2="1" y2="0">\n      <stop offset="0" stop-color="#003a5a" stop-opacity=".55"/><stop offset=".07" stop-color="#ffffff" stop-opacity=".5"/><stop offset=".14" stop-color="#ffffff" stop-opacity="0"/>\n      <stop offset=".84" stop-color="#ffffff" stop-opacity="0"/><stop offset=".93" stop-color="#ffffff" stop-opacity=".35"/><stop offset="1" stop-color="#003a5a" stop-opacity=".6"/></linearGradient>\n    <linearGradient id="lava0topdark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#002a44" stop-opacity=".35"/><stop offset=".18" stop-color="#002a44" stop-opacity="0"/></linearGradient>\n    <radialGradient id="lava0rim" cx=".5" cy=".5" r=".5"><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".85" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>\n    <radialGradient id="lava0bounce" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#f0ffb0" stop-opacity=".75"/><stop offset="1" stop-color="#f0ffb0" stop-opacity="0"/></radialGradient>\n    <filter id="lava0goo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter>\n    <filter id="lava0soft"><feGaussianBlur stdDeviation=".5"/></filter>\n    <clipPath id="lava0clip"><path d="M23.2 16 L36.8 16 C38.5 30 42.8 50 44.6 64 Q45.4 70.5 40.6 71 L19.4 71 Q14.6 70.5 15.4 64 C17.2 50 21.5 30 23.2 16 Z"/></clipPath>\n    <clipPath id="lava0baseclip"><path d="M18.6 71 L41.4 71 L42.4 76 L47.6 92.4 Q48.2 95 45.2 95 L14.8 95 Q11.8 95 12.4 92.4 L17.6 76 Z"/></clipPath>\n  </defs>\n  <ellipse cx="30" cy="97.2" rx="21" ry="2.2" fill="#0a2a40" opacity=".3"/>\n  <ellipse cx="30" cy="96.4" rx="14" ry="1.2" fill="#9be82a" opacity=".25"/>\n\n  <!-- vetro: liquido, cera, spessore dei bordi e riflessi -->\n  <g clip-path="url(#lava0clip)">\n    <rect x="10" y="14" width="40" height="60" fill="url(#lava0liq)"/>\n    <ellipse cx="30" cy="74" rx="22" ry="20" fill="url(#lava0glow)"/>\n    <g filter="url(#lava0goo)" fill="url(#lava0wax)">\n      <ellipse cx="30" cy="72" rx="15" ry="5"/>\n      <circle cx="30" cy="68" r="6"><animate attributeName="cy" values="68;24;68" dur="12s" begin="0s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/><animate attributeName="r" values="6;4.8;6" dur="12s" begin="0s" repeatCount="indefinite"/></circle><circle cx="25.5" cy="68" r="4.2"><animate attributeName="cy" values="68;28;68" dur="10s" begin="-5s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/><animate attributeName="r" values="4.2;3.4;4.2" dur="10s" begin="-5s" repeatCount="indefinite"/></circle><circle cx="34" cy="68" r="4.8"><animate attributeName="cy" values="68;22;68" dur="14s" begin="-9s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/><animate attributeName="r" values="4.8;3.8;4.8" dur="14s" begin="-9s" repeatCount="indefinite"/></circle><circle cx="28.5" cy="68" r="3.4"><animate attributeName="cy" values="68;34;68" dur="9s" begin="-2.5s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/><animate attributeName="r" values="3.4;2.7;3.4" dur="9s" begin="-2.5s" repeatCount="indefinite"/></circle><circle cx="32.5" cy="68" r="3.8"><animate attributeName="cy" values="68;26;68" dur="11s" begin="-7.5s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/><animate attributeName="r" values="3.8;3.0;3.8" dur="11s" begin="-7.5s" repeatCount="indefinite"/></circle>\n    </g>\n    <rect x="10" y="14" width="40" height="60" fill="url(#lava0vshade)"/>\n    <rect x="10" y="14" width="40" height="60" fill="url(#lava0edge)"/>\n    <rect x="10" y="14" width="40" height="60" fill="url(#lava0topdark)"/>\n    <!-- riflesso principale morbido + filo netto -->\n    <path d="M23.6 18 C21.8 32 19 50 18 64 L20.6 64 C21.4 50 23.8 32 25.6 18 Z" fill="#fff" opacity=".42" filter="url(#lava0soft)"/>\n    <path d="M24.4 19 C23 32 20.8 48 19.9 60" fill="none" stroke="#fff" stroke-width=".7" stroke-linecap="round" opacity=".95"/>\n    <path d="M36 21 C37.6 34 40.6 50 41.8 60" fill="none" stroke="#fff" stroke-width=".6" stroke-linecap="round" opacity=".45"/>\n    <!-- finestra riflessa -->\n    <rect x="31.5" y="24" width="2.2" height="5" rx=".6" fill="#fff" opacity=".35" transform="skewX(6)"/>\n  </g>\n  <path d="M23.2 16 L36.8 16 C38.5 30 42.8 50 44.6 64 Q45.4 70.5 40.6 71 L19.4 71 Q14.6 70.5 15.4 64 C17.2 50 21.5 30 23.2 16 Z" fill="none" stroke="#e9fbff" stroke-opacity=".9" stroke-width=".7"/>\n  <!-- labbro del vetro in alto e in basso -->\n  <ellipse cx="30" cy="16.4" rx="7" ry="1.1" fill="none" stroke="#fff" stroke-width=".6" opacity=".8"/>\n\n  <!-- cappello cromato con fessure di ventilazione -->\n  <path d="M24.6 5.2 Q30 3.4 35.4 5.2 L37.6 15.2 Q30 17.2 22.4 15.2 Z" fill="url(#lava0cr)"/>\n  <path d="M24.6 5.2 Q30 3.4 35.4 5.2 L35.7 6.6 Q30 4.9 24.3 6.6 Z" fill="#fff" opacity=".75"/>\n  <path d="M22.4 15.2 Q30 17.2 37.6 15.2 L37.8 16.4 Q30 18.4 22.2 16.4 Z" fill="#1d2c38" opacity=".55"/>\n  <g stroke="#1a2833" stroke-width=".5" opacity=".55"><path d="M26 8.6v4M28 8.3v4.4M30 8.2v4.5M32 8.3v4.4M34 8.6v4"/></g>\n  <path d="M24.6 5.2 Q30 3.4 35.4 5.2 L37.6 15.2 Q30 17.2 22.4 15.2 Z" fill="none" stroke="#1e2e3a" stroke-opacity=".6" stroke-width=".45"/>\n\n  <!-- base cromata: collare + cono, con il riflesso della cera -->\n  <g clip-path="url(#lava0baseclip)">\n    <rect x="10" y="70" width="40" height="26" fill="url(#lava0cr)"/>\n    <rect x="10" y="70" width="40" height="26" fill="url(#lava0vshade)"/>\n    <ellipse cx="30" cy="71" rx="16" ry="7" fill="url(#lava0bounce)"/>\n    <path d="M17.6 76 L42.4 76" stroke="#14222d" stroke-width=".9" opacity=".55"/>\n    <path d="M17.4 76.9 L42.6 76.9" stroke="#fff" stroke-width=".6" opacity=".75"/>\n    <path d="M13.2 91.4 L46.8 91.4" stroke="#fff" stroke-width=".55" opacity=".7"/>\n    <path d="M12.8 92.6 L47.2 92.6" stroke="#14222d" stroke-width=".6" opacity=".45"/>\n  </g>\n  <path d="M18.6 71 L41.4 71 L42.4 76 L47.6 92.4 Q48.2 95 45.2 95 L14.8 95 Q11.8 95 12.4 92.4 L17.6 76 Z" fill="none" stroke="#1e2e3a" stroke-opacity=".6" stroke-width=".45"/>\n  <ellipse cx="30" cy="71" rx="11.4" ry="1" fill="#0e1c26" opacity=".5"/>\n</svg>';
  const g = cv.getContext("2d");
  let W = 0, H = 0;
  const pixel = !!opts.native, muted = !!opts.muted;
  const DUR = 8.8;
  let RATIO = 1.5;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const inout = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const back = (t) => { t = clamp(t); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // ---------------- elementi della scena (sempre uguali) ----------------
  const bubbles = Array.from({ length: 34 }, () => ({ x: rnd(), y0: 0.65 + rnd() * 0.7, r: 0.008 + rnd() * 0.03, sp: 0.1 + rnd() * 0.16, wob: rnd() * 6.3, merge: rnd() < 0.55 }));
  const bokeh = Array.from({ length: 16 }, () => ({ x: rnd(), y: rnd() * 0.55, r: 0.02 + rnd() * 0.06, ph: rnd() * 6.3, hue: rnd() }));
  const clouds = Array.from({ length: 5 }, (_, i) => ({ x: i / 5 + rnd() * 0.1, y: 0.08 + rnd() * 0.22, s: 0.7 + rnd() * 0.7, sp: 0.006 + rnd() * 0.01 }));
  const fish = [{ y: 0.8, sp: 0.07, ph: 0, s: 1, dir: 1, t0: 0.2 }, { y: 0.9, sp: 0.05, ph: 2, s: 0.75, dir: -1, t0: 0.6 }, { y: 0.74, sp: 0.06, ph: 4, s: 0.6, dir: 1, t0: 1.2 }];
  // liane: spirali che salgono intorno alla sfera (davanti e dietro), con tante foglie
  const vines = [0.2, 2.3, 4.2, 5.6].map((lon0, i) => ({ lon0, dir: i % 2 ? -1 : 1, turns: 0.85 + rnd() * 0.35, t0: 3.15 + i * 0.16, w: 0.016 - i * 0.0015,
    leaves: Array.from({ length: 19 }, (_, k) => ({ u: 0.04 + k * 0.05 + rnd() * 0.02, side: k % 2 ? 1 : -1, s: 0.05 + rnd() * 0.02, sway: rnd() * 6.3 })) }));
  const sparks = Array.from({ length: 18 }, () => ({ a: rnd() * 6.3, d: 0.7 + rnd() * 0.9, t0: 5.0 + rnd() * 2.2, s: 0.012 + rnd() * 0.02 }));

  let cloudSprite = null, logoSprite = null;
  function makeCloud() {
    const c = document.createElement("canvas"), w = Math.ceil(H * 0.9), h = Math.ceil(H * 0.38);
    c.width = w; c.height = h; const x = c.getContext("2d");
    const blobs = [[0.22, 0.62, 0.2], [0.4, 0.45, 0.27], [0.62, 0.5, 0.24], [0.8, 0.64, 0.17], [0.52, 0.7, 0.22]];
    for (const [bx, by, br] of blobs) {
      const r = br * w * 0.55, gr = x.createRadialGradient(bx * w, by * h - r * 0.3, r * 0.1, bx * w, by * h, r);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.65, "rgba(250,253,255,.95)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = gr; x.beginPath(); x.arc(bx * w, by * h, r, 0, 6.3); x.fill();
    }
    x.globalCompositeOperation = "source-atop";
    const sh = x.createLinearGradient(0, h * 0.45, 0, h); sh.addColorStop(0, "rgba(150,200,240,0)"); sh.addColorStop(1, "rgba(120,180,230,.55)");
    x.fillStyle = sh; x.fillRect(0, 0, w, h);
    return c;
  }
  const lampImg = new Image();
  lampImg.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(LAVA.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="400" '));
  function makeLogo() {
    // "Aero Arcade" come nel sito: lettere tonde e gonfie, Aero acqua e Arcade lime
    const px = Math.min(H * 0.17, W * 0.115);
    const c = document.createElement("canvas"); const x = c.getContext("2d");
    const font = `700 ${px}px "Fredoka", "Nunito", sans-serif`;
    x.font = font;
    const gap = px * 0.25, wA = x.measureText("Aero").width, wB = x.measureText("Arcade").width;
    c.width = Math.ceil(wA + gap + wB + px * 0.8); c.height = Math.ceil(px * 1.7);
    x.font = font; x.textBaseline = "middle"; x.lineJoin = "round";
    const cy = c.height / 2, x0 = px * 0.4;
    const word = (txt, at, stops, edge, glow) => {
      x.shadowColor = glow; x.shadowBlur = px * 0.22; x.lineWidth = px * 0.16; x.strokeStyle = edge; x.strokeText(txt, at, cy);
      x.shadowColor = "rgba(0,40,80,.45)"; x.shadowBlur = px * 0.06; x.shadowOffsetY = px * 0.05; x.strokeText(txt, at, cy);
      x.shadowColor = "transparent"; x.shadowOffsetY = 0;
      const gr = x.createLinearGradient(0, cy - px * 0.5, 0, cy + px * 0.5);
      stops.forEach(([o, col]) => gr.addColorStop(o, col)); x.fillStyle = gr; x.fillText(txt, at, cy);
    };
    word("Aero", x0, [[0, "#ffffff"], [0.38, "#f4feff"], [0.5, "#c4f6ff"], [0.72, "#7fe6ff"], [1, "#35c8f0"]], "#0679ad", "rgba(40,200,255,.9)");
    word("Arcade", x0 + wA + gap, [[0, "#ffffff"], [0.38, "#f6ffe0"], [0.5, "#dcff9a"], [0.72, "#a8f03a"], [1, "#6cd01a"]], "#2c7a05", "rgba(140,240,40,.9)");
    return c;
  }
  function size() {
    if (opts.native) {
      // alla risoluzione vera della console (es. 240×160 sul GBA), ingrandita a pixel interi
      W = opts.native[0]; H = opts.native[1];
    } else {
      const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
      W = Math.max(240, Math.round(r.width * d)); H = Math.max(160, Math.round(r.height * d));
    }
    RATIO = W / H;
    cv.width = W; cv.height = H;
    cloudSprite = makeCloud(); logoSprite = makeLogo();
  }

  const HORIZON = 0.64;
  function surfaceY(t) { return H * (-0.15 + (HORIZON + 0.15) * inout((t - 0.5) / 2.1)); }

  function drawSky(t, sy) {
    if (sy <= 0) return;
    g.save(); g.beginPath(); g.rect(0, 0, W, sy); g.clip();
    const gr = g.createLinearGradient(0, 0, 0, H * HORIZON);
    gr.addColorStop(0, "#0b5fd0"); gr.addColorStop(0.5, "#3aa8f6"); gr.addColorStop(0.85, "#a9e6ff"); gr.addColorStop(1, "#effcff");
    g.fillStyle = gr; g.fillRect(0, 0, W, sy);
    const sx = W * 0.78, s0 = H * 0.13;
    g.globalCompositeOperation = "lighter";
    g.save(); g.translate(sx, s0); g.rotate(t * 0.08);
    for (let i = 0; i < 14; i++) { g.rotate(Math.PI / 7); const rg = g.createLinearGradient(0, 0, W * 0.8, 0); rg.addColorStop(0, "rgba(255,255,255,.16)"); rg.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = rg; g.beginPath(); g.moveTo(0, 0); g.lineTo(W * 0.8, -W * 0.035); g.lineTo(W * 0.8, W * 0.035); g.fill(); }
    g.restore();
    const sun = g.createRadialGradient(sx, s0, 0, sx, s0, H * 0.38); sun.addColorStop(0, "rgba(255,255,235,1)"); sun.addColorStop(0.12, "rgba(255,255,225,.8)"); sun.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = sun; g.fillRect(0, 0, W, sy);
    for (const b of bokeh) {
      const x = W * b.x, y = H * b.y + Math.sin(t * 0.8 + b.ph) * H * 0.01, r = H * b.r * (0.9 + 0.1 * Math.sin(t * 1.3 + b.ph));
      const bg = g.createRadialGradient(x, y, 0, x, y, r); const col = b.hue > 0.6 ? "190,255,170" : b.hue > 0.3 ? "170,230,255" : "255,255,255";
      bg.addColorStop(0, `rgba(${col},.16)`); bg.addColorStop(0.75, `rgba(${col},.1)`); bg.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = bg; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill();
    }
    g.globalCompositeOperation = "source-over";
    for (const c of clouds) {
      const cw = cloudSprite.width * c.s * 0.8, ch = cloudSprite.height * c.s * 0.8;
      const x = ((c.x + t * c.sp) % 1.3 - 0.2) * W, y = H * c.y;
      g.drawImage(cloudSprite, x - cw / 2, y - ch / 2, cw, ch);
    }
    const hill = (cx, w, h, c1, c2) => {
      const by = H * HORIZON; g.beginPath(); g.moveTo(cx - w, by); g.bezierCurveTo(cx - w * 0.6, by - h, cx + w * 0.6, by - h, cx + w, by); g.closePath();
      const hg = g.createLinearGradient(0, by - h, 0, by); hg.addColorStop(0, c1); hg.addColorStop(1, c2); g.fillStyle = hg; g.fill();
      g.save(); g.clip(); const sh = g.createRadialGradient(cx - w * 0.2, by - h * 0.9, 0, cx - w * 0.2, by - h * 0.9, w * 0.6); sh.addColorStop(0, "rgba(255,255,255,.55)"); sh.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = sh; g.fillRect(cx - w, by - h, w * 2, h); g.restore();
    };
    hill(W * 0.08, W * 0.2, H * 0.1, "#b8f25e", "#3e9e1c");
    hill(W * 0.95, W * 0.17, H * 0.075, "#a6ea4c", "#378f18");
    g.restore();
  }

  function drawAurora(t) {
    const k = clamp((t - 2.2) / 1.2);
    if (k <= 0) return;
    g.save(); g.globalCompositeOperation = "lighter";
    const ribbon = (y0, amp, ph, hue, wid) => {
      for (let pass = 0; pass < 4; pass++) {
        g.beginPath();
        const end = W * (-0.1 + 1.25 * ease(k));
        let first = true;
        for (let x = -W * 0.1; x <= end; x += W / 60) { const y = H * y0 + Math.sin(x / W * 4 + ph + t * 0.9) * H * amp + Math.sin(x / W * 9 + ph * 2 + t * 0.5) * H * amp * 0.3; if (first) { g.moveTo(x, y); first = false; } else g.lineTo(x, y); }
        g.strokeStyle = `hsla(${hue}, 100%, ${70 + pass * 7}%, ${[0.05, 0.08, 0.14, 0.35][pass]})`;
        g.lineWidth = H * wid * [3.2, 1.8, 0.9, 0.22][pass]; g.lineCap = "round"; g.stroke();
      }
    };
    ribbon(0.3, 0.06, 0.4, 175, 0.03);
    ribbon(0.36, 0.05, 2.1, 110, 0.022);
    ribbon(0.24, 0.04, 4.0, 195, 0.016);
    g.restore();
  }

  function drawWater(t, sy) {
    const top = Math.max(0, sy);
    if (top >= H) return;
    g.save(); g.beginPath(); g.rect(0, top, W, H - top); g.clip();
    const deep = g.createLinearGradient(0, top, 0, H);
    deep.addColorStop(0, "#38d0e6"); deep.addColorStop(0.35, "#1593c4"); deep.addColorStop(1, "#063d73");
    g.fillStyle = deep; g.fillRect(0, top, W, H - top);
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {
      const x = W * (i / 8) + Math.sin(t * 0.7 + i * 1.7) * W * 0.04, w = W * (0.025 + (i % 3) * 0.015), len = H * 1.1;
      const sg = g.createLinearGradient(0, top, 0, top + len); sg.addColorStop(0, "rgba(220,255,255,.22)"); sg.addColorStop(1, "rgba(220,255,255,0)");
      g.fillStyle = sg; g.beginPath(); g.moveTo(x - w, top); g.lineTo(x + w, top); g.lineTo(x + w * 2.6 + W * 0.05, top + len); g.lineTo(x - w * 0.4 + W * 0.05, top + len); g.fill();
    }
    g.strokeStyle = "rgba(230,255,255,.16)"; g.lineWidth = Math.max(1, H * 0.006);
    for (let j = 0; j < 3; j++) { g.beginPath(); for (let x = 0; x <= W; x += W / 50) { const y = top + H * (0.03 + j * 0.035) + Math.sin(x / W * 22 + t * 2.2 + j) * H * 0.008 + Math.sin(x / W * 9 - t * 1.4 + j * 2) * H * 0.006; if (x) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
    g.globalCompositeOperation = "source-over";
    for (const f of fish) {
      const p = (t - f.t0) * f.sp; if (p < 0) continue;
      const x = f.dir > 0 ? W * (-0.1 + p * 1.2) : W * (1.1 - p * 1.2), y = H * f.y + Math.sin(t * 2 + f.ph) * H * 0.012;
      if (y < top + H * 0.02) continue;
      const s = H * 0.035 * f.s;
      g.save(); g.translate(x, y); g.scale(f.dir, 1);
      const sw = Math.sin(t * 9 + f.ph) * 0.35;
      g.fillStyle = "#ff8a2a"; g.beginPath(); g.moveTo(-s * 0.9, 0); g.lineTo(-s * 1.7, -s * (0.55 + sw * 0.3)); g.lineTo(-s * 1.55, 0); g.lineTo(-s * 1.7, s * (0.55 - sw * 0.3)); g.closePath(); g.fill();
      const fg = g.createLinearGradient(0, -s * 0.6, 0, s * 0.6); fg.addColorStop(0, "#ffd27a"); fg.addColorStop(0.5, "#ff7a1a"); fg.addColorStop(1, "#d44a00");
      g.fillStyle = fg; g.beginPath(); g.ellipse(0, 0, s, s * 0.55, 0, 0, 6.3); g.fill();
      g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.ellipse(s * 0.1, -s * 0.25, s * 0.55, s * 0.13, 0, 0, 6.3); g.fill();
      g.fillStyle = "#1a1a1a"; g.beginPath(); g.arc(s * 0.6, -s * 0.08, s * 0.09, 0, 6.3); g.fill();
      g.restore();
    }
    g.restore();
    if (sy > -H * 0.05 && sy < H) {
      const band = H * 0.04;
      const sg = g.createLinearGradient(0, sy - band * 0.4, 0, sy + band);
      sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.3, "rgba(255,255,255,.9)"); sg.addColorStop(0.45, "rgba(190,250,255,.6)"); sg.addColorStop(1, "rgba(120,220,240,0)");
      g.fillStyle = sg; g.beginPath(); g.moveTo(0, sy + band);
      for (let x = 0; x <= W; x += W / 80) g.lineTo(x, sy + Math.sin(x / W * 18 + t * 3) * H * 0.004 + Math.sin(x / W * 7 - t * 1.6) * H * 0.003);
      g.lineTo(W, sy + band); g.closePath(); g.fill();
    }
  }

  function bubble(x, y, r, a) {
    g.save(); g.globalAlpha = a;
    const f = g.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    f.addColorStop(0, "rgba(255,255,255,.1)"); f.addColorStop(0.72, "rgba(200,245,255,.16)"); f.addColorStop(0.93, "rgba(255,255,255,.7)"); f.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = f; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill();
    g.strokeStyle = "rgba(255,180,250,.4)"; g.lineWidth = Math.max(0.5, r * 0.07); g.beginPath(); g.arc(x, y, r * 0.85, 0.2, 1.6); g.stroke();
    g.strokeStyle = "rgba(160,255,200,.35)"; g.beginPath(); g.arc(x, y, r * 0.85, 3.4, 4.4); g.stroke();
    g.fillStyle = "rgba(255,255,255,.95)"; g.beginPath(); g.ellipse(x - r * 0.38, y - r * 0.42, r * 0.26, r * 0.13, -0.7, 0, 6.3); g.fill();
    g.restore();
  }

  const ORB = () => ({ x: W * 0.5, y: H * (HORIZON - 0.235), r: H * 0.235 });
  function drawBubbles(t) {
    const o = ORB();
    for (const b of bubbles) {
      const rise = t * b.sp;
      let x = W * (b.x + Math.sin(t * 1.8 + b.wob) * 0.012), y = H * (b.y0 - rise * 1.1), r = b.r * H;
      if (b.merge) {
        const m = clamp((t - 2.5 - b.x * 0.4) / 0.7);
        if (m >= 1) continue;
        if (m > 0) { const k = inout(m); x += (o.x - x) * k; y += (o.y - y) * k; r *= 1 - k * 0.6; }
      }
      if (y < -r || y > H + r) continue;
      bubble(x, y, r, clamp(t * 2));
    }
  }

  function orbSize(t) {
    const k = clamp((t - 2.95) / 0.5), o = ORB();
    const j = back(k), wob = Math.sin((t - 2.95) * 14) * Math.exp(-(t - 2.95) * 3) * 0.08;
    return { k, o, rx: o.r * j * (1 + wob), ry: o.r * j * (1 - wob) };
  }
  function drawLamp(t) {
    const k = clamp((t - 4.25) / 0.7);
    if (k <= 0 || !lampImg.complete) return;
    const { o, ry } = orbSize(t);
    const h = ry * 1.6 * (0.7 + 0.3 * back(k)), w = h * 0.6, bob = Math.sin(t * 1.6) * ry * 0.03;
    g.save(); g.globalAlpha = clamp(k * 1.6);
    // alone della lampada accesa dentro il vetro
    g.globalCompositeOperation = "lighter";
    const gl = g.createRadialGradient(o.x, o.y, 0, o.x, o.y, ry); gl.addColorStop(0, `rgba(190,255,120,${0.35 * k})`); gl.addColorStop(1, "rgba(190,255,120,0)");
    g.fillStyle = gl; g.beginPath(); g.arc(o.x, o.y, ry, 0, 6.3); g.fill();
    g.globalCompositeOperation = "source-over";
    g.drawImage(lampImg, o.x - w / 2, o.y - h / 2 + bob, w, h);
    g.restore();
  }
  function drawOrb(t, part) {
    if (part === "gloss") return drawOrbGloss(t);
    const k = clamp((t - 2.95) / 0.5);
    if (k <= 0) return;
    const o = ORB();
    const j = back(k), wob = Math.sin((t - 2.95) * 14) * Math.exp(-(t - 2.95) * 3) * 0.08;
    const rx = o.r * j * (1 + wob), ry = o.r * j * (1 - wob);
    for (let i = 0; i < 3; i++) {
      const q = ((t - 3.1 - i * 0.55) / 1.6); if (q <= 0 || q >= 1) continue;
      g.strokeStyle = `rgba(255,255,255,${0.55 * (1 - q)})`; g.lineWidth = Math.max(1, H * 0.006);
      g.beginPath(); g.ellipse(o.x, H * HORIZON, o.r * (0.8 + q * 2.2), o.r * (0.12 + q * 0.3), 0, 0, 6.3); g.stroke();
    }
    g.save(); g.translate(o.x, o.y);
    const halo = g.createRadialGradient(0, 0, rx * 0.8, 0, 0, rx * 1.5); halo.addColorStop(0, "rgba(170,240,255,.35)"); halo.addColorStop(1, "rgba(170,240,255,0)");
    g.fillStyle = halo; g.beginPath(); g.arc(0, 0, rx * 1.5, 0, 6.3); g.fill();
    g.save(); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 6.3); g.clip();
    const body = g.createLinearGradient(0, -ry, 0, ry); body.addColorStop(0, "rgba(120,200,255,.55)"); body.addColorStop(0.5, "rgba(190,245,255,.35)"); body.addColorStop(0.62, "rgba(60,200,220,.45)"); body.addColorStop(1, "rgba(10,110,170,.7)");
    g.fillStyle = body; g.fillRect(-rx, -ry, rx * 2, ry * 2);
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 4; i++) {
      const a = t * 0.9 + i * 1.6, cx = Math.cos(a) * rx * 0.35, cy = ry * 0.35 + Math.sin(a * 1.3) * ry * 0.15;
      const c = g.createRadialGradient(cx, cy, 0, cx, cy, rx * 0.45); c.addColorStop(0, "rgba(200,255,250,.35)"); c.addColorStop(1, "rgba(200,255,250,0)");
      g.fillStyle = c; g.fillRect(-rx, -ry, rx * 2, ry * 2);
    }
    g.globalCompositeOperation = "source-over";
    const rim = g.createRadialGradient(0, 0, rx * 0.72, 0, 0, rx); rim.addColorStop(0, "rgba(255,255,255,0)"); rim.addColorStop(0.85, "rgba(255,255,255,.18)"); rim.addColorStop(1, "rgba(255,255,255,.75)");
    g.fillStyle = rim; g.fillRect(-rx, -ry, rx * 2, ry * 2);
    g.restore();
    g.restore();
  }
  function drawOrbGloss(t) {
    const { k, o, rx, ry } = orbSize(t);
    if (k <= 0) return;
    g.save(); g.translate(o.x, o.y);
    const hl = g.createLinearGradient(0, -ry * 0.95, 0, -ry * 0.15); hl.addColorStop(0, "rgba(255,255,255,.95)"); hl.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = hl; g.beginPath(); g.ellipse(0, -ry * 0.52, rx * 0.72, ry * 0.4, 0, 0, 6.3); g.fill();
    g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.ellipse(rx * 0.42, ry * 0.58, rx * 0.16, ry * 0.07, -0.6, 0, 6.3); g.fill();
    g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = Math.max(1, rx * 0.025); g.lineCap = "round";
    const a0 = t * 1.2; g.beginPath(); g.ellipse(0, 0, rx * 0.97, ry * 0.97, 0, a0, a0 + 0.7); g.stroke();
    g.restore();
  }

  function leaf(x, y, L, rot) {
    g.save(); g.translate(x, y); g.rotate(rot);
    const gr = g.createLinearGradient(0, -L * 0.4, L * 2, L * 0.4);
    gr.addColorStop(0, "#e9ffb5"); gr.addColorStop(0.45, "#97e331"); gr.addColorStop(1, "#2f8f16");
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(L * 0.5, -L * 0.62, L * 1.5, -L * 0.52, L * 2, 0); g.bezierCurveTo(L * 1.5, L * 0.52, L * 0.5, L * 0.62, 0, 0); g.fill();
    g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = Math.max(0.5, L * 0.06);
    g.beginPath(); g.moveTo(L * 0.1, 0); g.quadraticCurveTo(L, -L * 0.07, L * 1.85, 0); g.stroke();
    g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.ellipse(L * 0.85, -L * 0.22, L * 0.55, L * 0.09, -0.08, 0, 6.3); g.fill();
    g.restore();
  }
  // punto della liana sulla sfera: latitudine dal pelo dell'acqua fin quasi in cima, longitudine che gira
  function vinePoint(v, u, o, R) {
    const lat = -1.25 + 2.45 * u, lon = v.lon0 + v.dir * v.turns * 6.283 * u;
    return { x: o.x + R * Math.cos(lat) * Math.sin(lon), y: o.y - R * Math.sin(lat), z: Math.cos(lat) * Math.cos(lon) };
  }
  const smooth = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
  function drawVines(t, side) {
    const { k, o, rx } = orbSize(t);
    if (k < 1 && t < 3.2) return;
    const R = rx * 1.04, front = side === "front";
    for (const v of vines) {
      const grow = smooth((t - v.t0) / 2.1);
      if (grow <= 0) continue;
      const N = 90, base = H * v.w;
      // fusto: segmenti con spessore che si assottiglia fino alla punta
      let prev = vinePoint(v, 0, o, R);
      for (let i = 1; i <= N; i++) {
        const u = (i / N) * grow, p = vinePoint(v, u, o, R);
        if ((p.z + prev.z) / 2 >= 0 === front) {
          const tip = clamp((grow - u) / 0.05), persp = 0.75 + 0.25 * p.z;
          const wd = Math.max(0.6, base * (1 - 0.65 * u) * persp * (0.25 + 0.75 * tip));
          g.lineCap = "round";
          g.strokeStyle = front ? "#3f9f1c" : "rgba(40,110,30,.55)"; g.lineWidth = wd;
          g.beginPath(); g.moveTo(prev.x, prev.y); g.lineTo(p.x, p.y); g.stroke();
          if (front) { g.strokeStyle = "rgba(205,255,150,.85)"; g.lineWidth = Math.max(0.5, wd * 0.32); g.beginPath(); g.moveTo(prev.x - wd * 0.15, prev.y - wd * 0.2); g.lineTo(p.x - wd * 0.15, p.y - wd * 0.2); g.stroke(); }
        }
        prev = p;
      }
      // viticcio a ricciolo sulla punta, quando la liana ha finito di crescere
      const curl = clamp((grow - 0.92) / 0.08);
      if (curl > 0) {
        const p = vinePoint(v, grow, o, R);
        if ((p.z >= 0) === front) {
          g.strokeStyle = front ? "#5cbf26" : "rgba(40,110,30,.5)"; g.lineWidth = Math.max(0.6, base * 0.22);
          g.beginPath();
          for (let a = 0; a < curl * 9; a += 0.25) { const r = H * 0.026 * (1 - a / 10); const x = p.x + v.dir * Math.cos(a) * r, y = p.y - H * 0.02 + Math.sin(a) * r; a ? g.lineTo(x, y) : g.moveTo(x, y); }
          g.stroke();
        }
      }
      // foglie che sbocciano quando la liana le raggiunge
      for (const l of v.leaves) {
        const bloom = clamp((grow - l.u) / 0.12);
        if (bloom <= 0) continue;
        const p = vinePoint(v, l.u, o, R), q = vinePoint(v, Math.min(1, l.u + 0.01), o, R);
        if ((p.z >= 0) !== front) continue;
        const tan = Math.atan2(q.y - p.y, q.x - p.x), persp = 0.65 + 0.35 * p.z;
        const L = H * l.s * (1 - 0.3 * l.u) * persp * back(bloom);
        const ang = tan + l.side * (0.25 + 0.9 * ease(bloom)) + Math.sin(t * 2.2 + l.sway) * 0.07;
        g.save(); if (!front) g.globalAlpha = 0.5;
        leaf(p.x, p.y, L, ang);
        g.restore();
      }
    }
  }
  function drawLogo(t) {
    const k = clamp((t - 4.9) / 0.6);
    if (k <= 0) return;
    const o = ORB(), s = back(k), w = logoSprite.width, h = logoSprite.height;
    const cx = W / 2, cy = H * (HORIZON + 0.085);
    g.save(); g.globalAlpha = clamp(k * 2);
    g.translate(cx, cy); g.scale(0.55 + 0.45 * s, 0.55 + 0.45 * s);
    g.drawImage(logoSprite, -w / 2, -h / 2, w, h);
    g.restore();
    // riflesso nell'acqua, mosso dalle onde
    g.save(); g.globalAlpha = 0.18 * clamp(k * 2);
    const slices = pixel ? 16 : 36, sh = (h * 0.62) / slices;
    for (let i = 0; i < slices; i++) {
      const srcY = h * 0.81 - (i + 1) * sh, dx = Math.sin(t * 3 + i * 0.6) * W * 0.006 * (i / slices);
      g.globalAlpha = 0.2 * clamp(k * 2) * (1 - i / slices);
      g.drawImage(logoSprite, 0, srcY, w, sh, cx - w / 2 + dx, cy + h * 0.31 + i * sh * 0.8, w, sh * 0.8);
    }
    g.restore();
    // bagliore che attraversa la scritta
    const p = (t - 5.7) / 0.8;
    if (p > 0 && p < 1) {
      g.save(); g.globalCompositeOperation = "lighter";
      const x = cx - w / 2 + w * p;
      const sg = g.createLinearGradient(x - W * 0.06, 0, x + W * 0.06, 0); sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.5, "rgba(255,255,255,.55)"); sg.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = sg; g.beginPath(); g.moveTo(x - W * 0.04, cy - h * 0.45); g.lineTo(x + W * 0.08, cy - h * 0.45); g.lineTo(x + W * 0.04, cy + h * 0.45); g.lineTo(x - W * 0.08, cy + h * 0.45); g.fill();
      g.restore();
    }
    for (const s2 of sparks) {
      const q = (t - s2.t0) / 0.8; if (q <= 0 || q >= 1) continue;
      const x = o.x + Math.cos(s2.a) * o.r * s2.d * 1.3, y = o.y + Math.sin(s2.a) * o.r * s2.d, r = s2.s * H * Math.sin(q * Math.PI);
      g.save(); g.translate(x, y); g.rotate(q * 2); g.globalCompositeOperation = "lighter"; g.fillStyle = "rgba(255,255,255,.95)";
      g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.28 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.fill(); g.restore();
    }
  }

  function frame(t) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; g.shadowColor = "transparent";
    const sy = surfaceY(t);
    drawSky(t, sy);
    drawAurora(t);
    drawWater(t, sy);
    drawBubbles(t);
    drawVines(t, "back");
    drawOrb(t, "body");
    drawLamp(t);
    drawOrb(t, "gloss");
    drawVines(t, "front");
    drawLogo(t);
    if (t < 0.6) { g.fillStyle = `rgba(0,0,0,${1 - ease(t / 0.6)})`; g.fillRect(0, 0, W, H); }
    if (t > 7.4) {
      const q = clamp((t - 7.4) / 0.55), o = ORB();
      g.save(); g.globalCompositeOperation = "lighter";
      const fl = g.createRadialGradient(o.x, o.y, 0, o.x, o.y, W * (0.2 + q * 1.1)); fl.addColorStop(0, `rgba(255,255,255,${q})`); fl.addColorStop(0.5, `rgba(220,250,255,${q * 0.8})`); fl.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = fl; g.fillRect(0, 0, W, H);
      for (let i = 1; i <= 4; i++) { const fx = o.x + (W * 0.78 - o.x) * i * 0.3, fy = o.y + (H * 0.13 - o.y) * i * 0.3, fr = H * (0.03 + 0.02 * (i % 2)); const lg = g.createRadialGradient(fx, fy, 0, fx, fy, fr); lg.addColorStop(0, `rgba(180,255,220,${0.35 * (1 - q)})`); lg.addColorStop(1, "rgba(180,255,220,0)"); g.fillStyle = lg; g.beginPath(); g.arc(fx, fy, fr, 0, 6.3); g.fill(); }
      g.restore();
      if (q >= 1) { g.fillStyle = "#fff"; g.fillRect(0, 0, W, H); }
    }
    if (t > 8.0) { g.fillStyle = `rgba(0,0,0,${ease((t - 8.0) / 0.6)})`; g.fillRect(0, 0, W, H); }
  }

  // ---------------- musica (originale, sintetizzata) ----------------
  let ac = null, out = null, bus = null, echo = null;
  function audio() {
    ac = new AudioContext();
    out = ac.createGain(); out.gain.value = muted ? 0 : 0.7; out.connect(ac.destination);
    bus = ac.createBiquadFilter(); bus.type = "lowpass"; bus.Q.value = 1.4; bus.connect(out);
    const d = ac.createDelay(1), fb = ac.createGain(), lp = ac.createBiquadFilter(), wet = ac.createGain();
    d.delayTime.value = 0.33; fb.gain.value = 0.38; lp.type = "lowpass"; lp.frequency.value = 4200; wet.gain.value = 0.4;
    d.connect(lp).connect(fb).connect(d); lp.connect(wet).connect(bus); echo = d;
  }
  const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const to = (node) => { node.connect(bus); node.connect(echo); };
  function glass(t, n, gain = 0.08, dur = 2.2) {
    const f = hz(n), c = ac.createOscillator(), m = ac.createOscillator(), mg = ac.createGain(), a = ac.createGain();
    c.frequency.value = f; m.frequency.value = f * 3.5;
    mg.gain.setValueAtTime(f * 2.2, t); mg.gain.exponentialRampToValueAtTime(f * 0.05, t + dur * 0.6);
    a.gain.setValueAtTime(0.0001, t); a.gain.exponentialRampToValueAtTime(gain, t + 0.006); a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    m.connect(mg).connect(c.frequency); c.connect(a); to(a);
    c.start(t); m.start(t); c.stop(t + dur + 0.05); m.stop(t + dur + 0.05);
  }
  function pluck(t, n, gain = 0.1) {
    const f = hz(n), o = ac.createOscillator(), o2 = ac.createOscillator(), a = ac.createGain(), a2 = ac.createGain();
    o.frequency.value = f; o2.frequency.value = f * 4.02; a2.gain.value = 0.12;
    a.gain.setValueAtTime(0.0001, t); a.gain.exponentialRampToValueAtTime(gain, t + 0.004); a.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.connect(a); o2.connect(a2).connect(a); to(a); o.start(t); o2.start(t); o.stop(t + 0.6); o2.stop(t + 0.6);
  }
  function pad(t, notes, dur, gain = 0.04) {
    const a = ac.createGain(), f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1800;
    a.gain.setValueAtTime(0.0001, t); a.gain.linearRampToValueAtTime(gain, t + Math.min(1.2, dur * 0.4)); a.gain.setValueAtTime(gain, t + dur * 0.7); a.gain.linearRampToValueAtTime(0.0001, t + dur);
    f.connect(a); a.connect(bus);
    for (const n of notes) for (const det of [-9, 0, 9]) { const o = ac.createOscillator(); o.type = det ? "sawtooth" : "sine"; o.frequency.value = hz(n); o.detune.value = det; const og = ac.createGain(); og.gain.value = det ? 0.18 : 0.6; o.connect(og).connect(f); o.start(t); o.stop(t + dur + 0.1); }
  }
  function blip(t, f0, f1, gain = 0.07, d = 0.12) {
    const o = ac.createOscillator(), a = ac.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d * 0.8);
    a.gain.setValueAtTime(0.0001, t); a.gain.exponentialRampToValueAtTime(gain, t + 0.004); a.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(a); to(a); o.start(t); o.stop(t + d + 0.05);
  }
  function swell(t, dur) {
    const n = ac.createBufferSource(), b = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = b; const f = ac.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.9; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(5000, t + dur);
    const a = ac.createGain(); a.gain.setValueAtTime(0.0001, t); a.gain.exponentialRampToValueAtTime(0.05, t + dur * 0.8); a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(a).connect(out); n.start(t);
  }
  function music(t0) {
    bus.frequency.setValueAtTime(520, t0);
    bus.frequency.setValueAtTime(520, t0 + 1.7);
    bus.frequency.exponentialRampToValueAtTime(14000, t0 + 2.65);
    pad(t0, [53, 60, 64, 69], 4.2, 0.035);
    for (let i = 0; i < 9; i++) blip(t0 + 0.4 + i * 0.19 + (i % 3) * 0.04, 700 + (i * 137) % 600, 1400 + (i * 211) % 900, 0.05);
    [65, 69, 72, 76].forEach((n, i) => pluck(t0 + 0.8 + i * 0.32, n, 0.07));
    swell(t0 + 1.7, 1.0);
    [84, 88, 91, 93, 96, 100].forEach((n, i) => glass(t0 + 2.55 + i * 0.045, n, 0.035, 1.2));
    for (let i = 0; i < 6; i++) blip(t0 + 2.55 + i * 0.07, 900 + i * 120, 2200 + i * 150, 0.04, 0.09);
    blip(t0 + 3.0, 420, 110, 0.18, 0.5); glass(t0 + 3.0, 77, 0.07, 2.5); glass(t0 + 3.0, 84, 0.05, 2.5);
    // le liane crescono e le foglie sbocciano: una pioggia di note leggere (pentatonica di Fa)
    const penta = [72, 74, 77, 79, 81, 84, 86, 89, 91, 93];
    for (let i = 0; i < 26; i++) pluck(t0 + 3.35 + i * 0.075 + (i % 4) * 0.012, penta[(i * 3 + (i >> 2)) % penta.length], 0.045);
    // la lava lamp si accende dentro la sfera
    blip(t0 + 4.25, 300, 900, 0.06, 0.4); glass(t0 + 4.3, 72, 0.05, 2.2);
    pad(t0 + 4.6, [53, 60, 65, 69, 72, 76], 4.2, 0.045);
    // Aero Arcade: motivo di campanelle di vetro
    [[4.9, 81], [5.1, 84], [5.3, 88], [5.52, 86], [5.74, 84], [6.0, 89]].forEach(([d, n]) => glass(t0 + d, n, 0.075, 2.4));
    [[4.9, 65], [5.74, 62], [6.0, 58]].forEach(([d, n]) => pluck(t0 + d, n, 0.08));
    [89, 93, 96, 100, 101, 105].forEach((n, i) => glass(t0 + 7.35 + i * 0.05, n, 0.04, 1.6));
    glass(t0 + 7.65, 77, 0.06, 2.6); glass(t0 + 7.65, 81, 0.05, 2.6); glass(t0 + 7.65, 84, 0.05, 2.6);
  }

  let start = null, raf = 0, ended = false;
  function finish() {
    if (ended) return; ended = true;
    cancelAnimationFrame(raf);
    try { out && out.gain.setTargetAtTime(0, ac.currentTime, 0.05); setTimeout(() => ac && ac.close(), 400); } catch {}
    opts.onEnd && opts.onEnd();
  }
  function loop(now) {
    const t = (now - start) / 1000;
    if (t >= DUR - 0.15) { frame(DUR); return finish(); }
    frame(Math.max(0, t)); raf = requestAnimationFrame(loop);
  }
  size(); frame(0);
  try { audio(); out.gain.value = muted ? 0 : (opts.volume ?? 0.7); music(ac.currentTime + 0.06); if (ac.state === "suspended") ac.resume(); } catch {}
  start = performance.now() + 60; raf = requestAnimationFrame(loop);
  // la scritta usa Fredoka: rifaccio il logo appena il carattere è pronto
  loadFont().then(() => { if (!ended) logoSprite = makeLogo(); }).catch(() => {});
  return {
    /** salta il resto dell'intro con una dissolvenza rapida */
    skip() {
      if (ended) return;
      const now = performance.now(), t = (now - start) / 1000;
      if (t < 7.3) start = now - 7.3 * 1000;
      try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch {}
    },
    stop() { ended = true; cancelAnimationFrame(raf); try { ac && ac.close(); } catch {} }
  };

} };
})();
