(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.project-reel').forEach(reel => {
    const viewport = reel.querySelector('.project-reel__viewport');
    const track = reel.querySelector('.project-reel__track');
    const original = reel.querySelector('.project-reel__group');
    let period = 0, position = 0, hovered = false, focused = false;
    let touching = false, visible = false, frame = null, last = 0, resumeAt = 0;
    function setup() {
      track.querySelectorAll('[data-copy]').forEach(copy => copy.remove());
      period = original.getBoundingClientRect().width;
      if (!reduced.matches && period > 0) {
        // Enough copies to cover any viewport, with one whole group on the left.
        const copies = Math.ceil(viewport.clientWidth / period) + 2;
        for (let i = 0; i < copies; i++) {
          const copy = original.cloneNode(true);
          copy.dataset.copy = ''; copy.setAttribute('aria-hidden','true');
          copy.querySelectorAll('a').forEach(a => a.tabIndex = -1);
          if (i === 0) track.prepend(copy); else track.append(copy);
        }
        position = period; viewport.scrollLeft = position;
      } else { position = 0; viewport.scrollLeft = 0; }
      sync();
    }
    function tick(stamp) {
      frame = null;
      const dt = last ? Math.min((stamp-last)/1000,.05) : 0;
      last = stamp;
      if (!hovered && !focused && !touching && stamp > resumeAt && period) {
        position += (reel.dataset.direction === 'right' ? -1 : 1) * dt * 27;
        if (position < period) position += period;
        if (position >= period * 2) position -= period;
        viewport.scrollLeft = position;
      } else { position = viewport.scrollLeft; }
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null; last = 0;
      if (visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
    }
    viewport.addEventListener('pointerenter',e => { if (e.pointerType === 'mouse') hovered = true; });
    viewport.addEventListener('pointerleave',() => { hovered = false; });
    viewport.addEventListener('focusin',() => { focused = true; });
    viewport.addEventListener('focusout',e => { focused = viewport.contains(e.relatedTarget); });
    let drag = null, suppressClickUntil = 0;
    viewport.addEventListener('dragstart',e => e.preventDefault());
    viewport.addEventListener('pointerdown',e => {
      if (!e.isPrimary || e.button !== 0) return;
      suppressClickUntil = 0;
      touching = true;
      drag = { id:e.pointerId, startX:e.clientX, startY:e.clientY, lastX:e.clientX, active:false };
    });
    window.addEventListener('pointermove',e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX-drag.startX, dy = e.clientY-drag.startY;
      if (!drag.active) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
        drag.active = true;
        viewport.setPointerCapture(e.pointerId);
        viewport.classList.add('is-dragging');
        viewport.querySelectorAll('.reel-card').forEach(card => {
          card.style.removeProperty('--rx'); card.style.removeProperty('--ry');
        });
      }
      e.preventDefault();
      position = viewport.scrollLeft - (e.clientX-drag.lastX);
      if (!reduced.matches && period) {
        position = period + ((position-period) % period + period) % period;
      }
      viewport.scrollLeft = position;
      drag.lastX = e.clientX;
    }, {passive:false});
    function endDrag(e) {
      if (!drag || (e.pointerId !== undefined && e.pointerId !== drag.id)) return;
      const id = drag.id;
      if (drag.active) suppressClickUntil = performance.now()+500;
      drag = null;
      touching = false;
      position = viewport.scrollLeft;
      resumeAt = performance.now()+1800;
      viewport.classList.remove('is-dragging');
      if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id);
    }
    window.addEventListener('pointerup',endDrag);
    window.addEventListener('pointercancel',endDrag);
    viewport.addEventListener('lostpointercapture',endDrag);
    window.addEventListener('blur',endDrag);
    viewport.addEventListener('click',e => {
      if (e.detail !== 0 && performance.now() < suppressClickUntil) {
        e.preventDefault(); e.stopPropagation();
      }
    },true);
    viewport.addEventListener('wheel',() => { resumeAt = performance.now()+2400; },{passive:true});
    viewport.addEventListener('pointermove',e => {
      if (touching || !fine.matches || reduced.matches) return;
      const card = e.target.closest('.reel-card'); if (!card) return;
      const r = card.getBoundingClientRect(), x = (e.clientX-r.left)/r.width, y = (e.clientY-r.top)/r.height;
      card.style.setProperty('--rx',`${(0.5-y)*7}deg`);
      card.style.setProperty('--ry',`${(x-0.5)*9}deg`);
      card.style.setProperty('--shine-x',`${x*100}%`); card.style.setProperty('--shine-y',`${y*100}%`);
    });
    viewport.addEventListener('pointerout',e => {
      const card = e.target.closest('.reel-card');
      if (card && !card.contains(e.relatedTarget)) { card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); }
    });
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      // Preload the entire loop as it enters view so a wrap never reveals an empty preview.
      if (visible) track.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
      sync();
    }).observe(reel);
    new ResizeObserver(setup).observe(viewport);
    reduced.addEventListener('change',setup);
    document.addEventListener('visibilitychange',sync);
    setup();
  });
})();
