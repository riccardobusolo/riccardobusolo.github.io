(() => {
  'use strict';
  const canvas = document.getElementById('projects-background');
  const context = canvas?.getContext('2d');
  if (!context) return;
  const toggle = document.getElementById('background-toggle');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  let width = 0, height = 0, nodes = [], time = 0, last = 0, frame = null;
  let paused = motion.matches, manualChoice = false;
  const pointer = {x: 0, y: 0, active: false};
  let ripple = null;
  // The canvas never receives input: links, card tilt and dragging keep their events.
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(coarse.matches ? 38 : 95, Math.max(25, Math.floor(width * height / 15000)));
    nodes = Array.from({length: count}, (_, i) => {
      // Stable positions avoid a completely new background on resize.
      const nx = ((i * .61803398875 + .13) % 1);
      const ny = ((i * .41421356237 + .27) % 1);
      return {nx, ny, x: nx * width, y: ny * height, phase: i * 2.39996, energy: 0};
    });
    draw(0);
  }
  function draw(dt) {
    time += dt;
    context.clearRect(0, 0, width, height);
    const interactive = pointer.active && !paused;
    if (interactive) {
      const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 230);
      glow.addColorStop(0, 'rgba(0,224,208,.055)');
      glow.addColorStop(1, 'rgba(0,224,208,0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    }
    if (ripple) {
      ripple.age += dt;
      if (ripple.age > 1.4) ripple = null;
    }
    for (const node of nodes) {
      const baseX = node.nx * width + Math.sin(time * .18 + node.phase) * 22;
      const baseY = node.ny * height + Math.cos(time * .14 + node.phase) * 18;
      const dx = baseX - pointer.x, dy = baseY - pointer.y;
      const distance = Math.hypot(dx, dy);
      const influence = interactive ? Math.max(0, 1 - distance / 190) : 0;
      const targetX = baseX + dx / Math.max(distance, 1) * influence * 32;
      const targetY = baseY + dy / Math.max(distance, 1) * influence * 32;
      const blend = dt ? 1 - Math.exp(-dt * 5) : 1;
      node.x += (targetX - node.x) * blend;
      node.y += (targetY - node.y) * blend;
      node.energy = influence;
      if (ripple) {
        const ringDistance = Math.abs(Math.hypot(node.x - ripple.x, node.y - ripple.y) - ripple.age * 220);
        node.energy = Math.max(node.energy, Math.max(0, 1 - ringDistance / 60) * (1 - ripple.age / 1.4));
      }
    }
    const reach = coarse.matches ? 115 : 170;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > reach) continue;
        const strength = 1 - distance / reach;
        const energy = Math.max(a.energy, b.energy);
        context.strokeStyle = `rgba(66,199,196,${strength * (.13 + energy * .3)})`;
        context.lineWidth = .7 + energy * .4;
        context.beginPath();context.moveTo(a.x, a.y);context.lineTo(b.x, b.y);context.stroke();
        if (!paused && strength > .32 && (i + j) % 7 === 0) {
          const travel = (time * .12 + i * .17) % 1;
          context.fillStyle = `rgba(130,245,224,${strength * .5})`;
          context.beginPath();context.arc(a.x + (b.x - a.x) * travel, a.y + (b.y - a.y) * travel, 1.3, 0, Math.PI * 2);context.fill();
        }
      }
    }
    for (const node of nodes) {
      if (node.energy > .1) {
        context.fillStyle = `rgba(0,224,208,${node.energy * .06})`;
        context.beginPath();context.arc(node.x, node.y, 8 + node.energy * 6, 0, Math.PI * 2);context.fill();
      }
      context.fillStyle = `rgba(116,220,215,${.28 + node.energy * .55})`;
      context.beginPath();context.arc(node.x, node.y, 1.1 + node.energy * 1.3, 0, Math.PI * 2);context.fill();
    }
  }
  function tick(stamp) {
    frame = null;
    if (paused || document.hidden) return;
    if (!last) last = stamp;
    if (stamp - last >= 1000 / 30) {
      draw(Math.min((stamp - last) / 1000, .08));
      last = stamp;
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;last = 0;
    toggle.textContent = paused ? 'Animazione di sfondo: in pausa' : 'Animazione di sfondo: attiva';
    toggle.setAttribute('aria-pressed', String(paused));
    if (paused) {pointer.active = false;ripple = null;draw(0);}
    if (!paused && !document.hidden) frame = requestAnimationFrame(tick);
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || paused) return;
    pointer.x = event.clientX;pointer.y = event.clientY;pointer.active = true;
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', () => {pointer.active = false;});
  window.addEventListener('blur', () => {pointer.active = false;});
  document.addEventListener('pointerdown', event => {
    if (paused || event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('a,button,input,select,.card-wrap')) return;
    ripple = {x: event.clientX, y: event.clientY, age: 0};
  }, {passive: true});
  toggle.addEventListener('click', () => {manualChoice = true;paused = !paused;sync();});
  motion.addEventListener('change', () => {if (motion.matches || !manualChoice) {paused = motion.matches;sync();}});
  window.addEventListener('resize', resize, {passive: true});
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => {if (frame !== null) cancelAnimationFrame(frame);frame = null;});
  window.addEventListener('pageshow', sync);
  toggle.hidden = false;
  resize();sync();
})();
