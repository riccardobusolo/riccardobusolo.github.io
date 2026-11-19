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
  // =================================================================
  //  Scena. Si disegna su un buffer più grande (supercampionamento) e
  //  poi si riduce sullo schermo: alla risoluzione vera della console
  //  i dettagli restano puliti, senza scalini.
  // =================================================================
  const g0 = cv.getContext("2d");
  const buf = document.createElement("canvas"), g = buf.getContext("2d");
  const pixel = !!opts.native, muted = !!opts.muted;
  let W = 0, H = 0, S = 1, CW = 0, CH = 0;
  const DUR = 8.8;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const inout = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const back = (t) => { t = clamp(t); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const smooth = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };

  const HORIZON = 0.64;
  const bubbles = Array.from({ length: 40 }, () => ({ x: rnd(), y0: 0.65 + rnd() * 0.75, r: 0.007 + rnd() * 0.03, sp: 0.1 + rnd() * 0.16, wob: rnd() * 6.3, merge: rnd() < 0.5 }));
  const motes = Array.from({ length: 60 }, () => ({ x: rnd(), y: rnd(), s: 0.5 + rnd() * 1.2, sp: 0.01 + rnd() * 0.02, ph: rnd() * 6.3 }));
  const bokeh = Array.from({ length: 14 }, () => ({ x: rnd(), y: 0.05 + rnd() * 0.5, r: 0.02 + rnd() * 0.06, ph: rnd() * 6.3, hue: rnd() }));
  const clouds = Array.from({ length: 5 }, (_, i) => ({ x: i / 5 + rnd() * 0.08, y: 0.15 + rnd() * 0.18, s: 0.45 + rnd() * 0.4, sp: 0.005 + rnd() * 0.008, v: i % 3, far: i % 2 === 0 }));
  const glints = Array.from({ length: 34 }, () => ({ x: rnd(), y: rnd(), ph: rnd() * 6.3, s: 0.4 + rnd() * 0.8 }));
  const fish = [{ y: 0.8, sp: 0.07, ph: 0, s: 1, dir: 1, t0: 0.2, hue: 0 }, { y: 0.9, sp: 0.05, ph: 2, s: 0.75, dir: -1, t0: 0.6, hue: 1 }, { y: 0.74, sp: 0.06, ph: 4, s: 0.6, dir: 1, t0: 1.2, hue: 0 }];
  const vines = [0.2, 2.3, 4.2, 5.6].map((lon0, i) => ({ lon0, dir: i % 2 ? -1 : 1, turns: 0.85 + rnd() * 0.35, t0: 3.15 + i * 0.16, w: 0.017 - i * 0.0015,
    leaves: Array.from({ length: 19 }, (_, k) => ({ u: 0.04 + k * 0.05 + rnd() * 0.02, side: k % 2 ? 1 : -1, s: 0.05 + rnd() * 0.02, sway: rnd() * 6.3, v: Math.floor(rnd() * 3) })) }));
  const sparks = Array.from({ length: 18 }, () => ({ a: rnd() * 6.3, d: 0.7 + rnd() * 0.9, t0: 5.0 + rnd() * 2.2, s: 0.012 + rnd() * 0.02 }));

  // ---------------- sprite preparate una volta ----------------
  let cloudSp = [], cloudFar = [], causticSp = null, leafSp = [], bubbleSp = null, logoSprite = null, bloomC = null;
  const lampImg = new Image();
  lampImg.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(LAVA.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="500" '));

  function makeCloud(variant) {
    // nuvola gonfia: tanti sbuffi, ombra azzurra sotto, luce del sole in alto
    const w = CH * 0.8, h = CH * 0.5, c = mk(w, h), x = c.getContext("2d");
    seed = 101 + variant * 37;
    const puffs = Array.from({ length: 16 }, (_, i) => {
      const u = i / 15, cx = w * (0.14 + 0.72 * u + (rnd() - 0.5) * 0.06);
      const top = Math.sin(u * Math.PI) * (0.55 + rnd() * 0.3);
      return { x: cx, y: h * (0.74 - top * 0.3), r: h * (0.11 + top * 0.14 + rnd() * 0.04) };
    });
    x.filter = `blur(${Math.max(0.5, h * 0.012)}px)`;
    for (const p of puffs) { // ombra
      const gr = x.createRadialGradient(p.x, p.y + p.r * 0.25, p.r * 0.2, p.x, p.y + p.r * 0.25, p.r);
      gr.addColorStop(0, "rgba(150,186,226,1)"); gr.addColorStop(1, "rgba(150,186,226,0)");
      x.fillStyle = gr; x.beginPath(); x.arc(p.x, p.y + p.r * 0.25, p.r, 0, 6.3); x.fill();
    }
    for (const p of puffs) { // parte illuminata
      const gr = x.createRadialGradient(p.x - p.r * 0.2, p.y - p.r * 0.35, p.r * 0.1, p.x, p.y, p.r * 0.95);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.55, "rgba(250,253,255,.96)"); gr.addColorStop(1, "rgba(235,245,255,0)");
      x.fillStyle = gr; x.beginPath(); x.arc(p.x, p.y - p.r * 0.05, p.r * 0.95, 0, 6.3); x.fill();
    }
    x.filter = "none";
    // fondo piatto leggermente più scuro e bordo luminoso in alto
    x.globalCompositeOperation = "source-atop";
    const base = x.createLinearGradient(0, h * 0.45, 0, h); base.addColorStop(0, "rgba(130,175,225,0)"); base.addColorStop(1, "rgba(120,165,220,.5)");
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    const sun = x.createLinearGradient(w, 0, 0, h * 0.6); sun.addColorStop(0, "rgba(255,250,225,.55)"); sun.addColorStop(0.5, "rgba(255,255,255,0)");
    x.fillStyle = sun; x.fillRect(0, 0, w, h);
    return c;
  }
  function blurred(src, px) { const c = mk(src.width, src.height), x = c.getContext("2d"); x.filter = `blur(${px}px)`; x.drawImage(src, 0, 0); return c; }
  function makeCaustic() {
    // trama delle caustiche: linee luminose come la luce che passa tra le onde
    const n = 192, c = mk(n, n), x = c.getContext("2d"), img = x.createImageData(n, n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const u = (i / n) * 6.283, v = (j / n) * 6.283;
      let p = 0;
      for (let k = 1; k <= 3; k++) p += Math.sin(u * k + Math.sin(v * (k + 1) + k) * 1.3) * Math.cos(v * k - Math.sin(u * (k + 2)) * 1.1);
      const val = Math.pow(1 - Math.min(1, Math.abs(p) * 0.6), 7);
      const o = (j * n + i) * 4; img.data[o] = 210; img.data[o + 1] = 255; img.data[o + 2] = 255; img.data[o + 3] = Math.round(val * 255);
    }
    x.putImageData(img, 0, 0);
    return c;
  }
  function makeLeaf(v) {
    // foglia lucida con nervature, due metà con luce diversa e bordo luminoso
    const L = 120, w = L * 2.1, h = L * 1.1, c = mk(w, h), x = c.getContext("2d");
    const pal = [["#f0ffc2", "#9be637", "#3c9b1a", "#2a7a12"], ["#e4ffb0", "#86d82a", "#2f8a15", "#1f6a0c"], ["#f6ffd8", "#b2ef52", "#4fae22", "#347f14"]][v];
    const cy = h / 2, ox = L * 0.05;
    const shape = () => { x.beginPath(); x.moveTo(ox, cy); x.bezierCurveTo(L * 0.55, cy - L * 0.62, L * 1.5, cy - L * 0.5, L * 2.02, cy); x.bezierCurveTo(L * 1.5, cy + L * 0.5, L * 0.55, cy + L * 0.62, ox, cy); x.closePath(); };
    x.shadowColor = "rgba(10,60,20,.35)"; x.shadowBlur = L * 0.08; x.shadowOffsetY = L * 0.04;
    shape(); const gr = x.createLinearGradient(0, cy - L * 0.5, 0, cy + L * 0.5);
    gr.addColorStop(0, pal[0]); gr.addColorStop(0.42, pal[1]); gr.addColorStop(0.5, pal[2]); gr.addColorStop(1, pal[3]);
    x.fillStyle = gr; x.fill(); x.shadowColor = "transparent";
    x.save(); shape(); x.clip();
    // luce che arriva dalla punta
    const tip = x.createRadialGradient(L * 1.6, cy - L * 0.25, 0, L * 1.6, cy - L * 0.25, L * 1.1); tip.addColorStop(0, "rgba(255,255,220,.35)"); tip.addColorStop(1, "rgba(255,255,220,0)");
    x.fillStyle = tip; x.fillRect(0, 0, w, h);
    // nervature laterali
    x.strokeStyle = "rgba(240,255,210,.55)"; x.lineWidth = L * 0.018; x.lineCap = "round";
    for (let i = 1; i <= 7; i++) { const px = ox + (L * 1.9) * (i / 8.2); for (const sg of [-1, 1]) { x.beginPath(); x.moveTo(px, cy); x.quadraticCurveTo(px + L * 0.16, cy + sg * L * 0.18, px + L * 0.34, cy + sg * L * 0.34 * (1 - i / 10)); x.stroke(); } }
    // gloss
    const gl = x.createLinearGradient(0, cy - L * 0.45, 0, cy - L * 0.05); gl.addColorStop(0, "rgba(255,255,255,.65)"); gl.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = gl; x.beginPath(); x.ellipse(L * 0.95, cy - L * 0.22, L * 0.62, L * 0.13, -0.06, 0, 6.3); x.fill();
    x.restore();
    // nervatura centrale e bordo
    x.strokeStyle = "rgba(255,255,230,.85)"; x.lineWidth = L * 0.035; x.beginPath(); x.moveTo(ox + L * 0.05, cy); x.quadraticCurveTo(L, cy - L * 0.05, L * 1.92, cy); x.stroke();
    shape(); x.strokeStyle = "rgba(255,255,255,.45)"; x.lineWidth = L * 0.02; x.stroke();
    return c;
  }
  function makeBubble() {
    const n = 128, c = mk(n, n), x = c.getContext("2d"), r = n / 2 - 1;
    const f = x.createRadialGradient(n / 2 - r * 0.25, n / 2 - r * 0.3, r * 0.1, n / 2, n / 2, r);
    f.addColorStop(0, "rgba(255,255,255,.06)"); f.addColorStop(0.75, "rgba(210,245,255,.12)"); f.addColorStop(0.94, "rgba(255,255,255,.75)"); f.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = f; x.beginPath(); x.arc(n / 2, n / 2, r, 0, 6.3); x.fill();
    // pellicola iridescente sul bordo
    if (x.createConicGradient) {
      const cg = x.createConicGradient(0.6, n / 2, n / 2);
      ["rgba(255,150,230,.55)", "rgba(150,220,255,.45)", "rgba(170,255,190,.5)", "rgba(255,240,150,.45)", "rgba(255,150,230,.55)"].forEach((col, i, a) => cg.addColorStop(i / (a.length - 1), col));
      x.strokeStyle = cg; x.lineWidth = r * 0.09; x.beginPath(); x.arc(n / 2, n / 2, r * 0.9, 0, 6.3); x.stroke();
    }
    x.fillStyle = "rgba(255,255,255,.95)"; x.beginPath(); x.ellipse(n / 2 - r * 0.36, n / 2 - r * 0.42, r * 0.28, r * 0.13, -0.7, 0, 6.3); x.fill();
    x.fillStyle = "rgba(255,255,255,.6)"; x.beginPath(); x.arc(n / 2 + r * 0.42, n / 2 + r * 0.45, r * 0.07, 0, 6.3); x.fill();
    return c;
  }
  function makeLogo() {
    const px = Math.min(CH * 0.17, CW * 0.115);
    const c0 = mk(10, 10), x0 = c0.getContext("2d"); const font = `700 ${px}px "Fredoka", "Nunito", sans-serif`; x0.font = font;
    const gap = px * 0.25, wA = x0.measureText("Aero").width, wB = x0.measureText("Arcade").width;
    const c = mk(wA + gap + wB + px * 0.8, px * 1.7), x = c.getContext("2d");
    x.font = font; x.textBaseline = "middle"; x.lineJoin = "round";
    const cy = c.height / 2, xA = px * 0.4;
    const word = (txt, at, stops, edge, glow) => {
      x.shadowColor = glow; x.shadowBlur = px * 0.24; x.lineWidth = px * 0.17; x.strokeStyle = edge; x.strokeText(txt, at, cy);
      x.shadowColor = "rgba(0,40,80,.5)"; x.shadowBlur = px * 0.07; x.shadowOffsetY = px * 0.06; x.strokeText(txt, at, cy);
      x.shadowColor = "transparent"; x.shadowOffsetY = 0;
      const gr = x.createLinearGradient(0, cy - px * 0.5, 0, cy + px * 0.5);
      stops.forEach(([o, col]) => gr.addColorStop(o, col)); x.fillStyle = gr; x.fillText(txt, at, cy);
      // riflesso lucido sulla metà alta delle lettere
      x.save(); x.globalCompositeOperation = "source-atop";
      const hl = x.createLinearGradient(0, cy - px * 0.5, 0, cy); hl.addColorStop(0, "rgba(255,255,255,.7)"); hl.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = hl; x.fillRect(at, cy - px * 0.55, x.measureText(txt).width, px * 0.48); x.restore();
    };
    word("Aero", xA, [[0, "#ffffff"], [0.38, "#f4feff"], [0.5, "#c4f6ff"], [0.72, "#7fe6ff"], [1, "#35c8f0"]], "#0679ad", "rgba(40,200,255,.95)");
    word("Arcade", xA + wA + gap, [[0, "#ffffff"], [0.38, "#f6ffe0"], [0.5, "#dcff9a"], [0.72, "#a8f03a"], [1, "#6cd01a"]], "#2c7a05", "rgba(140,240,40,.95)");
    return c;
  }
  function size() {
    if (pixel) { W = opts.native[0]; H = opts.native[1]; S = 2; }
    else { const r = cv.getBoundingClientRect(); W = Math.max(240, Math.round(r.width)); H = Math.max(160, Math.round(r.height)); S = 1; }
    cv.width = W; cv.height = H;
    CW = W * S; CH = H * S; buf.width = CW; buf.height = CH;
    cloudSp = [0, 1, 2].map(makeCloud); cloudFar = cloudSp.map((c) => blurred(c, CH * 0.006));
    causticSp = makeCaustic(); leafSp = [0, 1, 2].map(makeLeaf); bubbleSp = makeBubble(); logoSprite = makeLogo();
    bloomC = mk(CW / 4, CH / 4);
  }

  // ---------------- livelli ----------------
  const surfaceY = (t) => CH * (-0.15 + (HORIZON + 0.15) * inout((t - 0.5) / 2.1));
  const SUN = () => ({ x: CW * 0.78, y: CH * 0.13 });

  function drawSky(t, sy) {
    if (sy <= 0) return;
    g.save(); g.beginPath(); g.rect(0, 0, CW, sy); g.clip();
    const gr = g.createLinearGradient(0, 0, 0, CH * HORIZON);
    gr.addColorStop(0, "#044caf"); gr.addColorStop(0.4, "#1583e6"); gr.addColorStop(0.75, "#5cbcf6"); gr.addColorStop(0.94, "#b4e8ff"); gr.addColorStop(1, "#dcf6ff");
    g.fillStyle = gr; g.fillRect(0, 0, CW, sy);
    const sun = SUN();
    // raggi morbidi (sfocati) che ruotano piano
    g.save(); g.globalCompositeOperation = "lighter"; g.filter = `blur(${CH * 0.008}px)`;
    g.translate(sun.x, sun.y); g.rotate(t * 0.06);
    for (let i = 0; i < 16; i++) {
      g.rotate(Math.PI / 8); const len = CW * (0.6 + (i % 3) * 0.15);
      const rg = g.createLinearGradient(0, 0, len, 0); rg.addColorStop(0, "rgba(255,255,240,.12)"); rg.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = rg; g.beginPath(); g.moveTo(0, 0); g.lineTo(len, -CW * (0.02 + (i % 2) * 0.015)); g.lineTo(len, CW * (0.02 + (i % 2) * 0.015)); g.fill();
    }
    g.restore();
    // nuvole lontane (sfocate) e vicine
    for (const c of clouds) {
      const sp = (c.far ? cloudFar : cloudSp)[c.v], k = c.s * (c.far ? 0.65 : 1);
      const cw = sp.width * k, ch = sp.height * k, x = ((c.x + t * c.sp * (c.far ? 0.5 : 1)) % 1.3 - 0.2) * CW, y = CH * c.y * (c.far ? 1.35 : 1);
      g.globalAlpha = c.far ? 0.8 : 1; g.drawImage(sp, x - cw / 2, y - ch / 2, cw, ch);
    }
    g.globalAlpha = 1;
    // sole: disco, alone grande e anello
    g.globalCompositeOperation = "lighter";
    const halo = g.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, CH * 0.34);
    halo.addColorStop(0, "rgba(255,255,235,1)"); halo.addColorStop(0.08, "rgba(255,255,230,.85)"); halo.addColorStop(0.25, "rgba(255,250,215,.22)"); halo.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = halo; g.fillRect(0, 0, CW, sy);
    g.strokeStyle = "rgba(200,240,255,.12)"; g.lineWidth = CH * 0.01; g.beginPath(); g.arc(sun.x, sun.y, CH * 0.2, 0, 6.3); g.stroke();
    // dischi di luce sfocati (bokeh)
    for (const b of bokeh) {
      const x = CW * b.x, y = CH * b.y + Math.sin(t * 0.8 + b.ph) * CH * 0.01, r = CH * b.r * (0.9 + 0.1 * Math.sin(t * 1.3 + b.ph));
      const col = b.hue > 0.6 ? "190,255,170" : b.hue > 0.3 ? "170,230,255" : "255,255,255";
      const bg = g.createRadialGradient(x, y, r * 0.6, x, y, r); bg.addColorStop(0, `rgba(${col},.1)`); bg.addColorStop(0.9, `rgba(${col},.16)`); bg.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = bg; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill();
    }
    g.globalCompositeOperation = "source-over";
    // isolette lucide all'orizzonte, con ciuffi d'erba sul profilo
    const hill = (cx, w, h, c1, c2) => {
      const by = CH * HORIZON;
      g.beginPath(); g.moveTo(cx - w, by);
      for (let i = 0; i <= 40; i++) { const u = i / 40, x = cx - w + 2 * w * u, y = by - h * Math.pow(Math.sin(u * Math.PI), 0.8) + Math.sin(u * 60) * h * 0.02; g.lineTo(x, y); }
      g.closePath();
      const hg = g.createLinearGradient(0, by - h, 0, by); hg.addColorStop(0, c1); hg.addColorStop(0.6, c2); hg.addColorStop(1, "#2a7d14"); g.fillStyle = hg; g.fill();
      g.save(); g.clip();
      const sh = g.createRadialGradient(cx - w * 0.25, by - h, 0, cx - w * 0.25, by - h, w * 0.7); sh.addColorStop(0, "rgba(255,255,220,.6)"); sh.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = sh; g.fillRect(cx - w, by - h, w * 2, h);
      const haze = g.createLinearGradient(0, by - h, 0, by); haze.addColorStop(0, "rgba(200,240,255,0)"); haze.addColorStop(1, "rgba(200,240,255,.45)");
      g.fillStyle = haze; g.fillRect(cx - w, by - h, w * 2, h);
      g.restore();
    };
    hill(CW * 0.08, CW * 0.2, CH * 0.1, "#c4f76a", "#58b52a");
    hill(CW * 0.95, CW * 0.17, CH * 0.075, "#b6ef5a", "#4ea824");
    g.restore();
  }

  function drawAurora(t) {
    const k = clamp((t - 2.2) / 1.2);
    if (k <= 0) return;
    g.save(); g.globalCompositeOperation = "lighter";
    const ribbon = (y0, amp, ph, hue, wid) => {
      const path = new Path2D(), end = CW * (-0.1 + 1.25 * ease(k));
      for (let x = -CW * 0.1, first = true; x <= end; x += CW / 70) { const y = CH * y0 + Math.sin(x / CW * 4 + ph + t * 0.9) * CH * amp + Math.sin(x / CW * 9 + ph * 2 + t * 0.5) * CH * amp * 0.3; if (first) { path.moveTo(x, y); first = false; } else path.lineTo(x, y); }
      g.lineCap = "round";
      g.filter = `blur(${CH * wid * 1.4}px)`; g.strokeStyle = `hsla(${hue},100%,75%,.22)`; g.lineWidth = CH * wid * 3; g.stroke(path);
      g.filter = `blur(${CH * wid * 0.3}px)`; g.strokeStyle = `hsla(${hue},100%,85%,.35)`; g.lineWidth = CH * wid; g.stroke(path);
      g.filter = "none"; g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = Math.max(1, CH * wid * 0.18); g.stroke(path);
    };
    ribbon(0.3, 0.06, 0.4, 175, 0.03);
    ribbon(0.36, 0.05, 2.1, 110, 0.022);
    ribbon(0.24, 0.04, 4.0, 195, 0.016);
    g.restore();
  }

  function drawWater(t, sy) {
    const top = Math.max(0, sy);
    if (top >= CH) return;
    g.save(); g.beginPath(); g.rect(0, top, CW, CH - top); g.clip();
    const deep = g.createLinearGradient(0, top, 0, CH);
    deep.addColorStop(0, "#4fe0f0"); deep.addColorStop(0.18, "#1ab4d8"); deep.addColorStop(0.55, "#0a78b4"); deep.addColorStop(1, "#03305f");
    g.fillStyle = deep; g.fillRect(0, top, CW, CH - top);
    // caustiche: due trame che scorrono, più forti vicino alla superficie
    g.globalCompositeOperation = "lighter";
    const tile = CH * 1.1;
    for (const [sp, a, sc] of [[0.03, 0.22, 1], [-0.02, 0.16, 1.37]]) {
      g.globalAlpha = a;
      const ox = ((t * sp * CW) % (tile * sc)), oy = ((t * sp * 0.6 * CH) % (tile * sc));
      for (let y = top - tile * sc + oy; y < top + CH * 0.45; y += tile * sc) for (let x = -tile * sc + ox; x < CW; x += tile * sc) g.drawImage(causticSp, x, y, tile * sc, tile * sc);
    }
    g.globalAlpha = 1;
    // fasci di luce sfocati
    g.filter = `blur(${CH * 0.012}px)`;
    for (let i = 0; i < 9; i++) {
      const x = CW * (i / 8) + Math.sin(t * 0.7 + i * 1.7) * CW * 0.04, w = CW * (0.02 + (i % 3) * 0.014), len = CH * 1.1;
      const sg = g.createLinearGradient(0, top, 0, top + len); sg.addColorStop(0, "rgba(220,255,255,.28)"); sg.addColorStop(1, "rgba(220,255,255,0)");
      g.fillStyle = sg; g.beginPath(); g.moveTo(x - w, top); g.lineTo(x + w, top); g.lineTo(x + w * 2.6 + CW * 0.05, top + len); g.lineTo(x - w * 0.4 + CW * 0.05, top + len); g.fill();
    }
    g.filter = "none";
    // particelle sospese
    for (const m of motes) {
      const x = CW * ((m.x + t * m.sp) % 1), y = top + (CH - top) * ((m.y + Math.sin(t + m.ph) * 0.01) % 1);
      g.fillStyle = `rgba(220,255,255,${0.25 + 0.2 * Math.sin(t * 3 + m.ph)})`; g.beginPath(); g.arc(x, y, m.s * S * 0.6, 0, 6.3); g.fill();
    }
    g.globalCompositeOperation = "source-over";
    // il profondo scurisce le caustiche
    const fog = g.createLinearGradient(0, top + CH * 0.1, 0, CH); fog.addColorStop(0, "rgba(3,48,95,0)"); fog.addColorStop(1, "rgba(3,40,85,.55)");
    g.fillStyle = fog; g.fillRect(0, top, CW, CH - top);
    for (const f of fish) drawFish(t, f, top);
    g.restore();
    // superficie: riflesso del cielo, scintille del sole e linea d'argento
    if (sy > -CH * 0.05 && sy < CH) {
      const band = CH * 0.05;
      const sg = g.createLinearGradient(0, sy - band * 0.3, 0, sy + band);
      sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.25, "rgba(255,255,255,.95)"); sg.addColorStop(0.45, "rgba(200,250,255,.55)"); sg.addColorStop(1, "rgba(120,220,240,0)");
      g.fillStyle = sg; g.beginPath(); g.moveTo(0, sy + band);
      for (let x = 0; x <= CW; x += CW / 90) g.lineTo(x, sy + Math.sin(x / CW * 18 + t * 3) * CH * 0.004 + Math.sin(x / CW * 7 - t * 1.6) * CH * 0.003);
      g.lineTo(CW, sy + band); g.closePath(); g.fill();
      // scie di sole sull'acqua
      if (sy > CH * 0.3) {
        const sun = SUN(); g.save(); g.globalCompositeOperation = "lighter";
        const col = g.createLinearGradient(0, sy, 0, sy + CH * 0.18); col.addColorStop(0, "rgba(255,255,230,.55)"); col.addColorStop(1, "rgba(255,255,230,0)");
        g.fillStyle = col; g.beginPath(); g.moveTo(sun.x - CW * 0.03, sy); g.lineTo(sun.x + CW * 0.03, sy); g.lineTo(sun.x + CW * 0.09, sy + CH * 0.18); g.lineTo(sun.x - CW * 0.09, sy + CH * 0.18); g.fill();
        for (const s2 of glints) {
          const a = Math.max(0, Math.sin(t * 6 + s2.ph)); if (a < 0.4) continue;
          const x = sun.x + (s2.x - 0.5) * CW * 0.22 * (0.4 + s2.y), y = sy + s2.y * CH * 0.16, r = CH * 0.006 * s2.s * a;
          g.fillStyle = `rgba(255,255,240,${a})`; g.beginPath(); g.moveTo(x - r * 3, y); g.lineTo(x, y - r); g.lineTo(x + r * 3, y); g.lineTo(x, y + r); g.fill();
        }
        g.restore();
      }
    }
  }
  function drawFish(t, f, top) {
    const p = (t - f.t0) * f.sp; if (p < 0) return;
    const x = f.dir > 0 ? CW * (-0.1 + p * 1.2) : CW * (1.1 - p * 1.2), y = CH * f.y + Math.sin(t * 2 + f.ph) * CH * 0.012;
    if (y < top + CH * 0.03) return;
    const s = CH * 0.04 * f.s, sw = Math.sin(t * 9 + f.ph);
    g.save(); g.translate(x, y); g.scale(f.dir, 1); g.rotate(sw * 0.04);
    const c = f.hue ? ["#fff1c9", "#ffb347", "#e06a00"] : ["#ffd9a8", "#ff7a2a", "#c43c00"];
    // pinne trasparenti
    g.fillStyle = "rgba(255,170,90,.55)";
    g.beginPath(); g.moveTo(-s * 0.85, 0); g.bezierCurveTo(-s * 1.5, -s * (0.9 + sw * 0.2), -s * 2.1, -s * 0.6, -s * 1.9, 0); g.bezierCurveTo(-s * 2.1, s * 0.6, -s * 1.5, s * (0.9 - sw * 0.2), -s * 0.85, 0); g.fill();
    g.beginPath(); g.moveTo(-s * 0.2, -s * 0.45); g.quadraticCurveTo(s * 0.1, -s * 1.0, s * 0.45, -s * 0.48); g.fill();
    const fg = g.createLinearGradient(0, -s * 0.6, 0, s * 0.6); fg.addColorStop(0, c[0]); fg.addColorStop(0.45, c[1]); fg.addColorStop(1, c[2]);
    g.fillStyle = fg; g.beginPath(); g.ellipse(0, 0, s, s * 0.55, 0, 0, 6.3); g.fill();
    g.fillStyle = "rgba(255,255,255,.75)"; g.beginPath(); g.ellipse(s * 0.1, -s * 0.28, s * 0.6, s * 0.12, 0, 0, 6.3); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(s * 0.58, -s * 0.1, s * 0.13, 0, 6.3); g.fill();
    g.fillStyle = "#13202c"; g.beginPath(); g.arc(s * 0.62, -s * 0.1, s * 0.08, 0, 6.3); g.fill();
    g.restore();
  }

  const ORB = () => ({ x: CW * 0.5, y: CH * (HORIZON - 0.235), r: CH * 0.235 });
  function orbSize(t) {
    const k = clamp((t - 2.95) / 0.5), o = ORB();
    const j = back(k), wob = Math.sin((t - 2.95) * 14) * Math.exp(-(t - 2.95) * 3) * 0.08;
    return { k, o, rx: o.r * j * (1 + wob), ry: o.r * j * (1 - wob) };
  }
  function drawBubbles(t) {
    const o = ORB();
    for (const b of bubbles) {
      let x = CW * (b.x + Math.sin(t * 1.8 + b.wob) * 0.012), y = CH * (b.y0 - t * b.sp * 1.1), r = b.r * CH;
      if (b.merge) {
        const m = clamp((t - 2.5 - b.x * 0.4) / 0.7);
        if (m >= 1) continue;
        if (m > 0) { const k = inout(m); x += (o.x - x) * k; y += (o.y - y) * k; r *= 1 - k * 0.6; }
      }
      if (y < -r || y > CH + r) continue;
      g.globalAlpha = clamp(t * 2); g.drawImage(bubbleSp, x - r, y - r, r * 2, r * 2);
    }
    g.globalAlpha = 1;
  }

  let snap = null;
  function drawOrbBody(t) {
    const { k, o, rx, ry } = orbSize(t);
    if (k <= 0) return;
    // anelli sull'acqua e luce raccolta dalla sfera sotto di lei
    for (let i = 0; i < 3; i++) {
      const q = (t - 3.1 - i * 0.55) / 1.6; if (q <= 0 || q >= 1) continue;
      g.strokeStyle = `rgba(255,255,255,${0.6 * (1 - q)})`; g.lineWidth = Math.max(1, CH * 0.005);
      g.beginPath(); g.ellipse(o.x, CH * HORIZON, o.r * (0.8 + q * 2.2), o.r * (0.12 + q * 0.3), 0, 0, 6.3); g.stroke();
    }
    g.save(); g.globalCompositeOperation = "lighter";
    const pool = g.createRadialGradient(o.x, CH * HORIZON + CH * 0.02, 0, o.x, CH * HORIZON + CH * 0.02, rx * 0.9);
    pool.addColorStop(0, `rgba(230,255,255,${0.45 * k})`); pool.addColorStop(1, "rgba(230,255,255,0)");
    g.fillStyle = pool; g.beginPath(); g.ellipse(o.x, CH * HORIZON + CH * 0.025, rx * 0.9, rx * 0.2, 0, 0, 6.3); g.fill();
    g.restore();
    // vetro: dentro si vede il paesaggio rifratto, capovolto e ingrandito come in una lente
    snap ??= mk(CW, CH); snap.width = CW; snap.height = CH; snap.getContext("2d").drawImage(buf, 0, 0);
    g.save(); g.beginPath(); g.ellipse(o.x, o.y, rx, ry, 0, 0, 6.3); g.clip();
    g.save(); g.translate(o.x, o.y); g.scale(1, -1);
    const z = 1.9; g.drawImage(snap, o.x - rx * z, o.y - ry * z, rx * 2 * z, ry * 2 * z, -rx, -ry, rx * 2, ry * 2);
    g.restore();
    const tint = g.createLinearGradient(0, o.y - ry, 0, o.y + ry); tint.addColorStop(0, "rgba(150,220,255,.35)"); tint.addColorStop(0.55, "rgba(180,245,255,.12)"); tint.addColorStop(1, "rgba(20,120,180,.4)");
    g.fillStyle = tint; g.fillRect(o.x - rx, o.y - ry, rx * 2, ry * 2);
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 4; i++) {
      const a = t * 0.9 + i * 1.6, cx = o.x + Math.cos(a) * rx * 0.35, cy = o.y + ry * 0.4 + Math.sin(a * 1.3) * ry * 0.14;
      const c = g.createRadialGradient(cx, cy, 0, cx, cy, rx * 0.4); c.addColorStop(0, "rgba(200,255,250,.3)"); c.addColorStop(1, "rgba(200,255,250,0)");
      g.fillStyle = c; g.fillRect(o.x - rx, o.y - ry, rx * 2, ry * 2);
    }
    g.restore();
  }
  function drawLamp(t) {
    const k = clamp((t - 4.25) / 0.7);
    if (k <= 0 || !lampImg.complete) return;
    const { o, ry } = orbSize(t);
    const h = ry * 1.6 * (0.7 + 0.3 * back(k)), w = h * 0.6, bob = Math.sin(t * 1.6) * ry * 0.03;
    g.save(); g.globalAlpha = clamp(k * 1.6);
    g.globalCompositeOperation = "lighter";
    const gl = g.createRadialGradient(o.x, o.y + ry * 0.2, 0, o.x, o.y + ry * 0.2, ry); gl.addColorStop(0, `rgba(190,255,120,${0.4 * k})`); gl.addColorStop(1, "rgba(190,255,120,0)");
    g.fillStyle = gl; g.beginPath(); g.arc(o.x, o.y, ry, 0, 6.3); g.fill();
    g.globalCompositeOperation = "source-over";
    g.drawImage(lampImg, o.x - w / 2, o.y - h / 2 + bob, w, h);
    g.restore();
  }
  function drawOrbGloss(t) {
    const { k, o, rx, ry } = orbSize(t);
    if (k <= 0) return;
    g.save(); g.translate(o.x, o.y);
    // bordo di Fresnel: il vetro brilla dove è più inclinato
    const rim = g.createRadialGradient(0, 0, rx * 0.7, 0, 0, rx); rim.addColorStop(0, "rgba(255,255,255,0)"); rim.addColorStop(0.82, "rgba(220,250,255,.2)"); rim.addColorStop(1, "rgba(255,255,255,.85)");
    g.fillStyle = rim; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 6.3); g.fill();
    // frange colorate sul bordo
    g.lineWidth = Math.max(1, rx * 0.018);
    g.strokeStyle = "rgba(120,255,255,.45)"; g.beginPath(); g.ellipse(-rx * 0.01, 0, rx * 0.985, ry * 0.985, 0, 2.2, 4.2); g.stroke();
    g.strokeStyle = "rgba(255,140,230,.35)"; g.beginPath(); g.ellipse(rx * 0.01, 0, rx * 0.985, ry * 0.985, 0, 5.4, 7.2); g.stroke();
    // riflesso grande morbido e finestrella netta
    const hl = g.createLinearGradient(0, -ry * 0.95, 0, -ry * 0.2); hl.addColorStop(0, "rgba(255,255,255,.95)"); hl.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = hl; g.beginPath(); g.ellipse(-rx * 0.05, -ry * 0.55, rx * 0.7, ry * 0.38, -0.1, 0, 6.3); g.fill();
    g.fillStyle = "rgba(255,255,255,.95)"; g.beginPath(); g.roundRect(-rx * 0.62, -ry * 0.58, rx * 0.16, ry * 0.22, rx * 0.04); g.fill();
    g.beginPath(); g.roundRect(-rx * 0.42, -ry * 0.62, rx * 0.1, ry * 0.18, rx * 0.03); g.fill();
    // mezzaluna di luce in basso (la luce attraversa il vetro e si concentra)
    g.globalCompositeOperation = "lighter";
    const cr = g.createRadialGradient(rx * 0.1, ry * 0.75, 0, rx * 0.1, ry * 0.75, rx * 0.6); cr.addColorStop(0, "rgba(220,255,255,.55)"); cr.addColorStop(1, "rgba(220,255,255,0)");
    g.fillStyle = cr; g.beginPath(); g.ellipse(rx * 0.1, ry * 0.72, rx * 0.6, ry * 0.2, 0, 0, 6.3); g.fill();
    g.globalCompositeOperation = "source-over";
    g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = Math.max(1, rx * 0.022); g.lineCap = "round";
    const a0 = t * 1.1; g.beginPath(); g.ellipse(0, 0, rx * 0.96, ry * 0.96, 0, a0, a0 + 0.6); g.stroke();
    g.restore();
  }

  // ---------------- liane ----------------
  function vinePoint(v, u, o, R) {
    const lat = -1.25 + 2.45 * u, lon = v.lon0 + v.dir * v.turns * 6.283 * u;
    return { x: o.x + R * Math.cos(lat) * Math.sin(lon), y: o.y - R * Math.sin(lat), z: Math.cos(lat) * Math.cos(lon) };
  }
  function drawVines(t, side) {
    const { k, o, rx } = orbSize(t);
    if (k < 1 && t < 3.2) return;
    const R = rx * 1.05, front = side === "front";
    for (const v of vines) {
      const grow = smooth((t - v.t0) / 2.1);
      if (grow <= 0) continue;
      const N = 110, base = CH * v.w;
      // fusto come un piccolo cilindro: bordo scuro, corpo verde e filo di luce
      const pts = [];
      for (let i = 0; i <= N; i++) { const u = (i / N) * grow; pts.push({ ...vinePoint(v, u, o, R), u }); }
      for (const pass of [0, 1, 2]) {
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1], b = pts[i];
          if (((a.z + b.z) / 2 >= 0) !== front) continue;
          const tip = clamp((grow - b.u) / 0.05), persp = 0.75 + 0.25 * b.z;
          const wd = Math.max(0.7, base * (1 - 0.6 * b.u) * persp * (0.25 + 0.75 * tip));
          g.lineCap = "round";
          if (pass === 0) { g.strokeStyle = front ? "#215f10" : "rgba(30,80,25,.5)"; g.lineWidth = wd * 1.25; }
          else if (pass === 1) { g.strokeStyle = front ? "#4fae22" : "rgba(60,130,40,.5)"; g.lineWidth = wd; }
          else { if (!front) continue; g.strokeStyle = "rgba(220,255,170,.85)"; g.lineWidth = Math.max(0.5, wd * 0.3); }
          const off = pass === 2 ? -wd * 0.22 : 0;
          g.beginPath(); g.moveTo(a.x + off * 0.6, a.y + off); g.lineTo(b.x + off * 0.6, b.y + off); g.stroke();
        }
      }
      // viticcio a ricciolo sulla punta
      const curl = clamp((grow - 0.92) / 0.08);
      if (curl > 0) {
        const p = vinePoint(v, grow, o, R);
        if ((p.z >= 0) === front) {
          g.strokeStyle = front ? "#5cbf26" : "rgba(40,110,30,.5)"; g.lineWidth = Math.max(0.7, base * 0.22);
          g.beginPath();
          for (let a = 0; a < curl * 9; a += 0.2) { const r = CH * 0.026 * (1 - a / 10); const x = p.x + v.dir * Math.cos(a) * r, y = p.y - CH * 0.02 + Math.sin(a) * r; if (a) g.lineTo(x, y); else g.moveTo(x, y); }
          g.stroke();
        }
      }
      // foglie che sbocciano
      for (const l of v.leaves) {
        const bloom = clamp((grow - l.u) / 0.12);
        if (bloom <= 0) continue;
        const p = vinePoint(v, l.u, o, R), q = vinePoint(v, Math.min(1, l.u + 0.01), o, R);
        if ((p.z >= 0) !== front) continue;
        const tan = Math.atan2(q.y - p.y, q.x - p.x), persp = 0.65 + 0.35 * p.z;
        const L = CH * l.s * (1 - 0.3 * l.u) * persp * back(bloom);
        const ang = tan + l.side * (0.25 + 0.9 * ease(bloom)) + Math.sin(t * 2.2 + l.sway) * 0.07;
        const sp = leafSp[l.v], sw = L * 2.1, sh = L * 1.1;
        g.save(); g.translate(p.x, p.y); g.rotate(ang); if (!front) g.globalAlpha = 0.45;
        // la foglia si apre: all'inizio è stretta, poi si allarga
        g.scale(1, 0.35 + 0.65 * ease(bloom));
        g.drawImage(sp, -sw * 0.02, -sh / 2, sw, sh);
        g.restore();
      }
    }
  }

  function drawLogo(t) {
    const k = clamp((t - 4.9) / 0.6);
    if (k <= 0 || !logoSprite) return;
    const o = ORB(), s = back(k), w = logoSprite.width, h = logoSprite.height;
    const cx = CW / 2, cy = CH * (HORIZON + 0.085);
    // riflesso nell'acqua, mosso dalle onde
    const slices = 40, sh = (h * 0.62) / slices;
    for (let i = 0; i < slices; i++) {
      const srcY = h * 0.81 - (i + 1) * sh, dx = Math.sin(t * 3 + i * 0.6) * CW * 0.006 * (i / slices);
      g.globalAlpha = 0.22 * clamp(k * 2) * (1 - i / slices);
      g.drawImage(logoSprite, 0, srcY, w, sh, cx - w / 2 + dx, cy + h * 0.31 + i * sh * 0.8, w, sh * 0.8);
    }
    g.globalAlpha = clamp(k * 2);
    g.save(); g.translate(cx, cy); g.scale(0.55 + 0.45 * s, 0.55 + 0.45 * s);
    g.drawImage(logoSprite, -w / 2, -h / 2, w, h);
    g.restore(); g.globalAlpha = 1;
    const p = (t - 5.7) / 0.8;
    if (p > 0 && p < 1) {
      g.save(); g.globalCompositeOperation = "lighter";
      const x = cx - w / 2 + w * p;
      const sg = g.createLinearGradient(x - CW * 0.06, 0, x + CW * 0.06, 0); sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.5, "rgba(255,255,255,.55)"); sg.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = sg; g.beginPath(); g.moveTo(x - CW * 0.04, cy - h * 0.45); g.lineTo(x + CW * 0.08, cy - h * 0.45); g.lineTo(x + CW * 0.04, cy + h * 0.45); g.lineTo(x - CW * 0.08, cy + h * 0.45); g.fill();
      g.restore();
    }
    for (const s2 of sparks) {
      const q = (t - s2.t0) / 0.8; if (q <= 0 || q >= 1) continue;
      const x = o.x + Math.cos(s2.a) * o.r * s2.d * 1.3, y = o.y + Math.sin(s2.a) * o.r * s2.d, r = s2.s * CH * Math.sin(q * Math.PI);
      g.save(); g.translate(x, y); g.rotate(q * 2); g.globalCompositeOperation = "lighter";
      const sgl = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.6); sgl.addColorStop(0, "rgba(255,255,255,.6)"); sgl.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = sgl; g.beginPath(); g.arc(0, 0, r * 1.6, 0, 6.3); g.fill();
      g.fillStyle = "rgba(255,255,255,.95)";
      g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.22 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.fill(); g.restore();
    }
  }

  // ---------------- rifinitura: bagliore, riflessi di lente, vignettatura ----------------
  function post(t) {
    // bloom: le parti più luminose si allargano in un alone morbido
    const bx = bloomC.getContext("2d");
    bx.clearRect(0, 0, bloomC.width, bloomC.height);
    bx.filter = "brightness(0.85) contrast(3.2) saturate(1.3)";
    bx.drawImage(buf, 0, 0, bloomC.width, bloomC.height);
    bx.filter = "none";
    g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.12; g.filter = `blur(${CH * 0.018}px)`;
    g.drawImage(bloomC, 0, 0, CW, CH); g.restore();
    // riflessi di lente dal sole verso il centro (si vedono quando c'è il cielo)
    if (surfaceY(t) > CH * 0.4) {
      const sun = SUN(), cx = CW / 2, cy = CH / 2;
      g.save(); g.globalCompositeOperation = "lighter";
      [[0.35, 0.03, "120,255,200"], [0.6, 0.05, "160,200,255"], [0.85, 0.02, "255,200,140"], [1.25, 0.07, "140,240,255"]].forEach(([f, r, col]) => {
        const x = sun.x + (cx - sun.x) * f * 1.6, y = sun.y + (cy - sun.y) * f * 1.6, rr = CH * r;
        const lg = g.createRadialGradient(x, y, rr * 0.5, x, y, rr); lg.addColorStop(0, `rgba(${col},.05)`); lg.addColorStop(0.85, `rgba(${col},.14)`); lg.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = lg; g.beginPath(); g.arc(x, y, rr, 0, 6.3); g.fill();
      });
      g.restore();
    }
    const vg = g.createRadialGradient(CW / 2, CH / 2, CH * 0.45, CW / 2, CH / 2, CW * 0.72);
    vg.addColorStop(0, "rgba(0,20,50,0)"); vg.addColorStop(1, "rgba(0,20,50,.32)");
    g.fillStyle = vg; g.fillRect(0, 0, CW, CH);
  }

  function frame(t) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; g.filter = "none"; g.shadowColor = "transparent";
    const sy = surfaceY(t);
    drawSky(t, sy);
    drawAurora(t);
    drawWater(t, sy);
    drawBubbles(t);
    drawVines(t, "back");
    drawOrbBody(t);
    drawLamp(t);
    drawOrbGloss(t);
    drawVines(t, "front");
    drawLogo(t);
    post(t);
    if (t < 0.6) { g.fillStyle = `rgba(0,0,0,${1 - ease(t / 0.6)})`; g.fillRect(0, 0, CW, CH); }
    if (t > 7.4) {
      const q = clamp((t - 7.4) / 0.55), o = ORB();
      g.save(); g.globalCompositeOperation = "lighter";
      const fl = g.createRadialGradient(o.x, o.y, 0, o.x, o.y, CW * (0.2 + q * 1.1)); fl.addColorStop(0, `rgba(255,255,255,${q})`); fl.addColorStop(0.5, `rgba(220,250,255,${q * 0.8})`); fl.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = fl; g.fillRect(0, 0, CW, CH);
      g.restore();
      if (q >= 1) { g.fillStyle = "#fff"; g.fillRect(0, 0, CW, CH); }
    }
    if (t > 8.0) { g.fillStyle = `rgba(0,0,0,${ease((t - 8.0) / 0.6)})`; g.fillRect(0, 0, CW, CH); }
    // riduzione sullo schermo vero
    g0.imageSmoothingEnabled = true; g0.imageSmoothingQuality = "high";
    g0.drawImage(buf, 0, 0, W, H);
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
  const closeAC = () => { try { if (ac && ac.state !== "closed") ac.close().catch(() => {}); } catch {} };
  function finish() {
    if (ended) return; ended = true;
    cancelAnimationFrame(raf);
    try { out && out.gain.setTargetAtTime(0, ac.currentTime, 0.05); setTimeout(closeAC, 400); } catch {}
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
    stop() { ended = true; cancelAnimationFrame(raf); closeAC(); },
    /** disegna un istante preciso (per le anteprime) */
    seek(t) { ended = true; cancelAnimationFrame(raf); closeAC(); frame(t); }
  };

} };
})();

