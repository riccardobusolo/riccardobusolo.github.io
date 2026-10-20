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
  // True 3D coordinates: four separated neuron planes, perspective camera,
  // yaw/pitch rotation and depth-sorted primitives on a transparent canvas.
  const geometry = counts.map((n, l) => Array.from({length:n}, (_, i) => {
    const angle = i / n * Math.PI * 2 + Math.PI / 4;
    const radius = [1.45, 2.05, 1.8, 1.25][l];
    return {x:(l - 1.5) * 4.4, y:Math.cos(angle) * radius, z:Math.sin(angle) * radius, l, i};
  }));
  let yaw = .38, pitch = -.16, drift = 0, dragging = false, pointer = null;
  let pointerX = 0, pointerY = 0;
  function rotate(p) {
    const a = yaw + (motion.matches ? 0 : Math.sin(drift * .24) * .12);
    const b = pitch + (motion.matches ? 0 : Math.sin(drift * .17) * .045);
    const x = p.x * Math.cos(a) + p.z * Math.sin(a);
    const z = -p.x * Math.sin(a) + p.z * Math.cos(a);
    return {x, y:p.y * Math.cos(b) - z * Math.sin(b), z:p.y * Math.sin(b) + z * Math.cos(b)};
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  function text(value, x, y, color, size = 9, align = 'center') {
    ctx.fillStyle = color; ctx.font = size + 'px "JetBrains Mono", monospace';
    ctx.textAlign = align; ctx.fillText(value, x, y);
  }
  function line(a, b, color, size = 1) {
    ctx.strokeStyle = color; ctx.lineWidth = size;
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  }
  function draw() {
    if (!activations || !width) return;
    ctx.clearRect(0, 0, width, height);
    const rotated = geometry.flat().map(rotate);
    const xs = rotated.map(p => p.x * 22 / (22 + p.z));
    const ys = rotated.map(p => p.y * 22 / (22 + p.z));
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanY = Math.max(...ys) - Math.min(...ys);
    const mobile = width < 700;
    const areaHeight = height - (mobile ? 220 : 160);
    const scale = Math.min((width - (mobile ? 40 : 130)) / (spanX + 2.6), areaHeight / (spanY + 1.9), 80);
    const centerY = 48 + areaHeight / 2;
    const project = p => {
      const q = rotate(p), perspective = 22 / (22 + q.z);
      return {x:width / 2 + q.x * perspective * scale, y:centerY + q.y * perspective * scale, z:q.z, s:perspective};
    };
    points = geometry.map(layer => layer.map(project));
    const primitives = [];
    // Fine circular guides live in the same 3D planes as their neurons.
    geometry.forEach((layer, l) => {
      const radius = [1.45, 2.05, 1.8, 1.25][l] + .38;
      for (let k = 0; k < 64; k++) {
        if (k % 16 > 12) continue;
        const a = k / 64 * Math.PI * 2, b = (k + 1) / 64 * Math.PI * 2;
        const p = project({x:layer[0].x,y:Math.cos(a)*radius,z:Math.sin(a)*radius});
        const q = project({x:layer[0].x,y:Math.cos(b)*radius,z:Math.sin(b)*radius});
        primitives.push({z:(p.z+q.z)/2, paint:() => line(p,q,'rgba('+colors[l]+',.13)',.6)});
      }
    });
    weights.forEach((matrix,l) => matrix.forEach((row,j) => row.forEach((weight,i) => {
      const a = points[l][i], b = points[l+1][j];
      const strength = Math.min(1,Math.abs(weight*activations[l][i]));
      const color = weight >= 0 ? colors[l] : '133,147,226';
      const progress = (elapsed - 180 - l * 380) / 380;
      primitives.push({z:(a.z+b.z)/2,paint:() => {
        line(a,b,'rgba('+color+','+(.075+strength*.16)+')',.65);
      }});
      if (!motion.matches && progress > 0 && progress < 1) {
        const from = geometry[l][i], to = geometry[l+1][j];
        const along = t => project({x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t,z:from.z+(to.z-from.z)*t});
        const head = along(progress), tail = along(Math.max(0,progress-.17));
        primitives.push({z:head.z,paint:() => {
          if (Math.hypot(head.x-tail.x,head.y-tail.y) < .01) return;
          const trail = ctx.createLinearGradient(tail.x,tail.y,head.x,head.y);
          trail.addColorStop(0,'rgba('+color+',0)');
          trail.addColorStop(1,'rgba('+color+','+(.3+strength*.7)+')');
          ctx.shadowColor='rgb('+color+')';ctx.shadowBlur=8;
          line(tail,head,trail,1+strength);
          ctx.fillStyle='#dfffff';ctx.beginPath();ctx.arc(head.x,head.y,(1+strength)*head.s,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        }});
      }
    })));
    points.forEach((layer,l) => layer.forEach((p,i) => {
      const arrival = l === 0 ? 0 : 180+l*380;
      const active = motion.matches || elapsed >= arrival;
      const value = activations[l][i], intensity = active ? Math.abs(value) : .06;
      const flash = active && !motion.matches ? Math.max(0,1-(elapsed-arrival)/420) : 0;
      const r = (mobile ? 5 : 7.5)*p.s;
      primitives.push({z:p.z,paint:() => {
        const halo = ctx.createRadialGradient(p.x,p.y,r*.3,p.x,p.y,r*4.5);
        halo.addColorStop(0,'rgba('+colors[l]+','+(.15+intensity*.27+flash*.15)+')');halo.addColorStop(1,'rgba('+colors[l]+',0)');
        ctx.fillStyle=halo;ctx.fillRect(p.x-r*4.5,p.y-r*4.5,r*9,r*9);
        const sphere = ctx.createRadialGradient(p.x-r*.32,p.y-r*.38,r*.05,p.x,p.y,r);
        sphere.addColorStop(0,active?'#e2ffff':'#81b4c5');
        sphere.addColorStop(.25,'rgba('+colors[l]+','+(.5+intensity*.5)+')');
        sphere.addColorStop(1,'#081724');
        ctx.fillStyle=sphere;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba('+colors[l]+','+(.35+intensity*.55)+')';ctx.lineWidth=.7;ctx.stroke();
        ctx.strokeStyle='rgba('+colors[l]+','+(.15+flash*.45)+')';
        ctx.beginPath();ctx.ellipse(p.x,p.y,r*1.75,r*.65,-.5,0,Math.PI*2);ctx.stroke();
        if (width > 700) text(active?value.toFixed(2):'···',p.x+r*2.3,p.y+3,'rgba('+colors[l]+',.65)',8,'left');
      }});
    }));
    primitives.sort((a,b)=>b.z-a.z).forEach(p=>p.paint());
    // Labels track each layer in space, instead of enclosing the model in a card.
    geometry.forEach((layer,l) => {
      const anchor = project({x:layer[0].x,y:-[1.45,2.05,1.8,1.25][l]-.75,z:0});
      text(['INPUT / 04','HIDDEN / 06','HIDDEN / 05','OUTPUT / 03'][l],anchor.x,anchor.y,'rgba('+colors[l]+',.65)',mobile?6:8);
    });
  }
  canvas.addEventListener('pointerdown',e => {
    if (e.button !== 0 || pointer !== null) return;
    dragging=true;pointer=e.pointerId;pointerX=e.clientX;pointerY=e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e => {
    if (!dragging || e.pointerId !== pointer) return;
    yaw+=(e.clientX-pointerX)*.007;
    pitch=Math.max(-1.3,Math.min(1.3,pitch+(e.clientY-pointerY)*.007));
    pointerX=e.clientX;pointerY=e.clientY;draw();
  });
  const release = e => {
    if (e.pointerId !== pointer) return;
    dragging=false;pointer=null;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  };
  canvas.addEventListener('pointerup',release);
  canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('lostpointercapture',release);
  canvas.addEventListener('keydown',e => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)) return;
    e.preventDefault();
    if(e.key==='Home'){yaw=.38;pitch=-.16;drift=0;}
    else if(e.key==='ArrowLeft')yaw-=.12;
    else if(e.key==='ArrowRight')yaw+=.12;
    else pitch=Math.max(-1.3,Math.min(1.3,pitch+(e.key==='ArrowDown'?.12:-.12)));
    draw();
  });
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
    if (last !== null) {
      const dt = now - last;
      elapsed += dt;
      if (!dragging && !motion.matches) drift += Math.min(dt, 100) / 1000;
    }
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
