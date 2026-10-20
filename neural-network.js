(() => {
  'use strict';
  const wrap = document.getElementById('nn-wrap');
  if (!wrap) return;
  const canvas = document.getElementById('nn-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const $ = selector => wrap.querySelector(selector);
  const counts = [4, 6, 5, 3];
  const colors = ['77,229,202', '71,207,226', '107,166,255', '155,174,255'];
  const period = 2000;
  // A real 4 → 6 → 5 → 3 MLP: tanh hidden layers, softmax output.
  // Learn three synthetic signal families with SGD + cross entropy.
  let seed = 7531;
  const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const centers = [[.8, -.7, .6, -.5], [-.6, .8, -.5, .7], [.5, .5, -.8, -.7]];
  const weights = counts.slice(1).map((n, l) =>
    Array.from({length:n}, () => Array.from({length:counts[l]}, () => (rng() * 2 - 1) * .5)));
  const biases = counts.slice(1).map(n => Array(n).fill(0));
  function forward(input) {
    const a = [input];
    weights.forEach((w, l) => {
      let z = w.map((row, j) => row.reduce((sum, v, i) => sum + v * a[l][i], biases[l][j]));
      if (l === weights.length - 1) {
        const max = Math.max(...z);
        z = z.map(v => Math.exp(v - max));
        const total = z.reduce((s, v) => s + v, 0);
        a.push(z.map(v => v / total));
      } else a.push(z.map(Math.tanh));
    });
    return a;
  }
  for (let step = 0; step < 1800; step++) {
    const label = Math.floor(rng() * 3);
    const input = centers[label].map(v => v + (rng() - .5) * 1.2);
    const a = forward(input);
    let delta = a[3].map((v, j) => v - Number(j === label));
    for (let l = 2; l >= 0; l--) {
      const prev = a[l].map((v, i) =>
        weights[l].reduce((sum, row, j) => sum + row[i] * delta[j], 0) * (1 - v * v));
      weights[l].forEach((row, j) => {
        row.forEach((v, i) => { row[i] -= .035 * delta[j] * a[l][i]; });
        biases[l][j] -= .035 * delta[j];
      });
      delta = prev;
    }
  }
  let width = 0, height = 0, points = [], activations, sample = 0;
  let elapsed = 0, last = null, frame = null, visible = false, paused = false, published = false;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const bars = [...wrap.querySelectorAll('.nn-output')];
  function nextSample() {
    // Uniform random probes, including ambiguous points between training clusters.
    activations = forward(Array.from({length:4}, () => Math.random() * 2 - 1));
    sample++;
    published = false;
    $('.nn-vector').textContent = '[ ' + activations[0].map(v => (v >= 0 ? '+' : '') + v.toFixed(2)).join('  ') + ' ]';
    $('.nn-sequence').textContent = String(sample).padStart(5, '0');
    $('.nn-result').textContent = 'Analisi…';
    bars.forEach(row => { row.querySelector('b').style.width = '0%'; row.querySelector('em').textContent = '—'; });
  }
  function publish() {
    if (published) return;
    published = true;
    const output = activations[3];
    const winner = output.indexOf(Math.max(...output));
    $('.nn-result').textContent = `Classe ${'ABC'[winner]} / ${(output[winner] * 100).toFixed(1)}%`;
    bars.forEach((row, i) => {
      row.querySelector('b').style.width = `${output[i] * 100}%`;
      row.querySelector('em').textContent = `${(output[i] * 100).toFixed(1)}%`;
    });
    canvas.setAttribute('aria-label', `Rete neurale 4, 6, 5, 3. Campione ${sample}. Output: classe ${'ABC'[winner]}, probabilità ${(output[winner] * 100).toFixed(1)}%.`);
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pad = width < 500 ? 34 : 86;
    points = counts.map((n, l) => Array.from({length:n}, (_, i) => ({
      x: pad + l * (width - pad * 2) / 3,
      y: height / 2 + (i - (n - 1) / 2) * (height - 100) / 5
    })));
    draw();
  }
  function text(value, x, y, color, size = 9, align = 'center') {
    ctx.fillStyle = color; ctx.font = `${size}px "JetBrains Mono", monospace`;
    ctx.textAlign = align; ctx.fillText(value, x, y);
  }
  function line(x1, y1, x2, y2, color, size = 1) {
    ctx.strokeStyle = color; ctx.lineWidth = size; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  }
  function draw() {
    if (!activations || !width) return;
    ctx.clearRect(0, 0, width, height);
    // Precision grid, layer rails and a restrained acquisition sweep.
    for (let x = 22; x < width; x += 24)
      for (let y = 16; y < height; y += 24) {
        ctx.fillStyle = '#81bfdb12'; ctx.fillRect(x, y, 1, 1);
      }
    if (!motion.matches && !paused) {
      const x = elapsed / period * width;
      const wash = ctx.createLinearGradient(x - 55, 0, x, 0);
      wash.addColorStop(0, '#5de9d000'); wash.addColorStop(1, '#5de9d009');
      ctx.fillStyle = wash; ctx.fillRect(x - 55, 35, 55, height - 65);
      line(x, 35, x, height - 30, '#78f8e51c');
    }
    points.forEach((layer, l) => {
      const x = layer[0].x;
      line(x, 38, x, height - 27, '#88c8e415');
      text(['INPUT', 'HIDDEN 01', 'HIDDEN 02', 'OUTPUT'][l], x, 23, '#a0baca', width < 500 ? 8 : 10);
      text(['4 FEATURES', '6 / TANH', '5 / TANH', '3 / SOFTMAX'][l], x, height - 9, '#637e90', width < 500 ? 7 : 8);
    });
    weights.forEach((matrix, l) => {
      const progress = (elapsed - 180 - l * 380) / 380;
      matrix.forEach((row, j) => row.forEach((weight, i) => {
        const a = points[l][i], b = points[l + 1][j];
        const strength = Math.min(1, Math.abs(weight * activations[l][i]));
        const color = weight >= 0 ? colors[l] : '129,145,218';
        line(a.x, a.y, b.x, b.y, `rgba(${color},${.04 + strength * .14})`, .7);
        if (!motion.matches && progress > 0 && progress < 1) {
          const p = progress;
          const tail = Math.max(0, p - .2);
          const x = a.x + (b.x - a.x) * p, y = a.y + (b.y - a.y) * p;
          const tx = a.x + (b.x - a.x) * tail, ty = a.y + (b.y - a.y) * tail;
          const gradient = ctx.createLinearGradient(tx, ty, x, y);
          gradient.addColorStop(0, `rgba(${color},0)`);
          gradient.addColorStop(1, `rgba(${color},${.2 + strength * .8})`);
          line(tx, ty, x, y, gradient, 1 + strength);
          ctx.fillStyle = `rgba(220,255,255,${.25 + strength * .75})`;
          ctx.beginPath(); ctx.arc(x, y, 1 + strength, 0, Math.PI * 2); ctx.fill();
        }
      }));
    });
    points.forEach((layer, l) => layer.forEach((p, i) => {
      const arrival = l === 0 ? 0 : 180 + l * 380;
      const active = motion.matches || elapsed >= arrival;
      const v = activations[l][i], intensity = active ? Math.abs(v) : .04;
      const flash = active && !motion.matches ? Math.max(0, 1 - (elapsed - arrival) / 350) : 0;
      const r = width < 500 ? 9 : 12;
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      halo.addColorStop(0, `rgba(${colors[l]},${.12 + intensity * .18 + flash * .12})`);
      halo.addColorStop(1, `rgba(${colors[l]},0)`);
      ctx.fillStyle = halo; ctx.fillRect(p.x - r * 3, p.y - r * 3, r * 6, r * 6);
      ctx.fillStyle = '#0b1924'; ctx.strokeStyle = `rgba(${colors[l]},${.25 + intensity * .7})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = `rgba(${colors[l]},${.3 + intensity * .7})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, r + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(.02, intensity)); ctx.stroke();
      ctx.fillStyle = active ? `rgba(${colors[l]},${.35 + intensity * .65})` : '#334858';
      ctx.beginPath(); ctx.arc(p.x, p.y, 3 + intensity * 2, 0, Math.PI * 2); ctx.fill();
      if (width >= 650) text(active ? v.toFixed(2) : '···', p.x + 22, p.y + 3, active ? '#a1bfce' : '#40586a', 8, 'left');
    }));
  }
  function render() {
    const stage = motion.matches ? 4 : elapsed < 180 ? 0 : elapsed < 560 ? 1 : elapsed < 940 ? 2 : elapsed < 1320 ? 3 : 4;
    $('.nn-status').textContent = paused ? 'IN PAUSA' : ['ACQUISIZIONE INPUT', 'PROPAGAZIONE / 01', 'PROPAGAZIONE / 02', 'CALCOLO SOFTMAX', 'OUTPUT DISPONIBILE'][stage];
    $('.nn-countdown').textContent = ((period - elapsed) / 1000).toFixed(1) + ' s';
    $('.nn-progress').style.transform = `scaleX(${elapsed / period})`;
    if (elapsed >= 1320 || motion.matches) publish();
    draw();
  }
  function tick(now) {
    frame = null;
    if (last !== null) elapsed += now - last;
    last = now;
    if (elapsed >= period) { elapsed %= period; nextSample(); }
    render();
    if (visible && !document.hidden && !paused) frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; last = null;
    if (visible && !document.hidden && !paused) frame = requestAnimationFrame(tick);
    render();
  }
  $('.nn-pause').addEventListener('click', () => {
    paused = !paused;
    $('.nn-pause').textContent = paused ? 'Riprendi' : 'Pausa';
    $('.nn-pause').setAttribute('aria-pressed', String(paused));
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(wrap);
  new ResizeObserver(resize).observe(canvas);
  nextSample(); resize(); render();
})();
