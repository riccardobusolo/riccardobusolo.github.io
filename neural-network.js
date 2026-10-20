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
  // True 3D coordinates: four separated neuron planes, fixed perspective camera,
  // trackball rotation and depth-sorted primitives on a transparent canvas.
  const cameraDistance = 24;
  const geometry = counts.map((n, l) => Array.from({length:n}, (_, i) => {
    const angle = i / n * Math.PI * 2 + Math.PI / 4;
    const radius = [1.45, 2.05, 1.8, 1.25][l];
    return {x:(l - 1.5) * 4.4, y:Math.cos(angle) * radius, z:Math.sin(angle) * radius, l, i};
  }));
  let drift = 0, dragging = false, pointer = null, trackStart = null;
  function multiply(a,b) {
    return [
      a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],
      a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],
      a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],
      a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]
    ];
  }
  const axis = (x,y,z,a) => [x*Math.sin(a/2),y*Math.sin(a/2),z*Math.sin(a/2),Math.cos(a/2)];
  const initialOrientation = () => multiply(axis(1,0,0,-.16),axis(0,1,0,.38));
  let orientation = initialOrientation();
  function turn(q) {
    const next = multiply(q,orientation), length = Math.hypot(...next);
    orientation = next.map(v=>v/length);
  }
  function rotate(p) {
    const q = motion.matches ? orientation : multiply(axis(0,1,0,Math.sin(drift*.24)*.12),orientation);
    const v = multiply(multiply(q,[p.x,p.y,p.z,0]),[-q[0],-q[1],-q[2],q[3]]);
    return {x:v[0],y:v[1],z:v[2]};
  }
  function trackball(e) {
    const rect = canvas.getBoundingClientRect(), radius = Math.min(rect.width,rect.height)*.45;
    const x = (e.clientX-rect.left-rect.width/2)/radius;
    const y = (e.clientY-rect.top-(48+(rect.height-(rect.width<700?220:160))/2))/radius;
    const d = Math.hypot(x,y);
    // The front of the virtual sphere faces the camera (negative Z).
    return d <= 1 ? [x,y,-Math.sqrt(1-d*d)] : [x/d,y/d,0];
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
    const mobile = width < 700;
    const areaHeight = height - (mobile ? 220 : 160);
    // Viewport scale and camera stay fixed while rotating. Only physical depth
    // changes apparent size; the framing does not fit itself to each orientation.
    const scale = Math.min((width - (mobile ? 40 : 130)) / 15, areaHeight / 15);
    const centerY = 48 + areaHeight / 2;
    const project = p => {
      const q = rotate(p);
      const perspective = cameraDistance / (cameraDistance + q.z);
      return {x:width / 2 + q.x * scale * perspective, y:centerY + q.y * scale * perspective, z:q.z, s:perspective};
    };
    points = geometry.map(layer => layer.map(project));
    const primitives = [];
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
        // Compact signal nodes: a single luminous core, without orbital rings.
        ctx.fillStyle='#0a1720';ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba('+colors[l]+','+(.35+intensity*.55)+')';ctx.lineWidth=.7;ctx.stroke();
        ctx.fillStyle='rgba('+colors[l]+','+(.4+intensity*.6)+')';
        ctx.beginPath();ctx.arc(p.x,p.y,r*.38,0,Math.PI*2);ctx.fill();
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
    dragging=true;pointer=e.pointerId;trackStart=trackball(e);
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e => {
    if (!dragging || e.pointerId !== pointer) return;
    const next = trackball(e), a = trackStart, b = next;
    const cross = [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    const q = [...cross,1+a.reduce((sum,v,i)=>sum+v*b[i],0)];
    const length = Math.hypot(...q);
    if (length > 1e-6) turn(q.map(v=>v/length));
    trackStart=next;draw();
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
    if(e.key==='Home'){orientation=initialOrientation();drift=0;}
    else if(e.key==='ArrowLeft')turn(axis(0,1,0,.12));
    else if(e.key==='ArrowRight')turn(axis(0,1,0,-.12));
    else turn(axis(1,0,0,e.key==='ArrowDown'?.12:-.12));
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
