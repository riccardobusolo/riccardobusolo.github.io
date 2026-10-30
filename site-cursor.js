(() => {
  'use strict';
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const contrast = matchMedia('(forced-colors: active)');
  const root = document.documentElement;
  const cursor = document.createElement('div');
  cursor.className = 'site-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  // Rounded quadratic corners, with the hotspot at the uppermost point.
  const shape = 'M22 17 Q20 17 21 20 L27 38 Q28.5 42 31 38 L34 32 Q34.5 31 36 30.5 L42 29 Q46 28 42 25.5 L25 18 Q23 17 22 17 Z';
  cursor.innerHTML = '<div class="site-cursor__shape"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><path class="site-cursor__glow" d="' + shape + '"/><path class="site-cursor__arrow" d="' + shape + '"/></svg></div>';
  document.body.append(cursor);
  const textShape = 'M17 5 Q15 5 15 7 Q15 9 17 9 L20 9 L20 25 L17 25 Q15 25 15 27 Q15 29 17 29 L27 29 Q29 29 29 27 Q29 25 27 25 L24 25 L24 9 L27 9 Q29 9 29 7 Q29 5 27 5 Z';
  const paths = cursor.querySelectorAll('path');
  let textMode = false;
  const interactive = 'a[href],button,input,select,summary,label[for],[role="button"],[role="link"],[role="slider"],[tabindex]:not([tabindex="-1"]),.service-card';
  const editable = 'textarea,[contenteditable]:not([contenteditable="false"]),input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]):not([type="image"])';
  function hide() {
    root.classList.remove('site-cursor-active');
    cursor.classList.remove('is-visible', 'is-pressed');
  }
  function update(e) {
    if (!fine.matches || contrast.matches || e.pointerType === 'touch' || document.pointerLockElement) {
      hide(); return;
    }
    const target = e.target instanceof Element ? e.target : null;
    // Preserve text selection and browser-native controls that need their own pointer.
    if (!target || target.closest('iframe,:disabled,[aria-disabled="true"]')) {
      hide(); return;
    }
    const isText = !!target.closest(editable);
    if (isText !== textMode) {
      textMode = isText;
      paths.forEach(path => path.setAttribute('d', isText ? textShape : shape));
      cursor.classList.toggle('is-text', isText);
    }
    // No easing of position: only the shape animates, never the actual pointing location.
    cursor.style.transform = 'translate3d(' + (e.clientX - 22) + 'px,' + (e.clientY - 17) + 'px,0)';
    cursor.classList.toggle('is-interactive', !isText && !!target.closest(interactive));
    cursor.classList.add('is-visible');
    root.classList.add('site-cursor-active');
  }
  document.addEventListener('pointermove', update, { passive: true });
  document.addEventListener('pointerover', update, { passive: true });
  document.addEventListener('pointerdown', e => {
    update(e);
    cursor.classList.add('is-pressed');
  }, { passive: true });
  window.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'), { passive: true });
  window.addEventListener('pointercancel', hide, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide, { passive: true });
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  document.addEventListener('pointerlockchange', hide);
  fine.addEventListener('change', hide);
  contrast.addEventListener('change', hide);
})();