/**
 * Centro Cinofilo Patavino - JavaScript
 * Handles navigation, mobile menu, FAQ accordion, and interactive contact form
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      
      // Update hamburger icon
      const icon = mobileToggle.querySelector('svg');
      if (icon) {
        if (isOpen) {
          icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';
        } else {
          icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
        }
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        const icon = mobileToggle.querySelector('svg');
        if (icon) {
          icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
        }
      }
    });
  }

  // 2. FAQ Accordion
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentItem = btn.closest('.faq-item');
      const isAlreadyActive = parentItem.classList.contains('active');

      // Close all other items
      document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== parentItem) {
          item.classList.remove('active');
          const itemBtn = item.querySelector('.faq-question');
          if (itemBtn) itemBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (isAlreadyActive) {
        parentItem.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        parentItem.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 3. Auto-select Course from URL parameter if on contact page
  const courseSelect = document.getElementById('courseSelect');
  if (courseSelect) {
    const urlParams = new URLSearchParams(window.location.search);
    const corsoParam = urlParams.get('corso');
    if (corsoParam) {
      const matchOption = Array.from(courseSelect.options).find(opt => opt.value === corsoParam);
      if (matchOption) {
        courseSelect.value = corsoParam;
      }
    }
  }

  // 4. Contact Form Submission
  const contactForm = document.getElementById('trainingContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const alertBox = document.getElementById('formAlert');
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Invia Richiesta';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Invio in corso...</span>';
      }

      // Simulate sending
      setTimeout(() => {
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.className = 'form-alert success';
          alertBox.innerHTML = '<strong>Grazie per averci contattato!</strong> La tua richiesta per la valutazione a Padova è stata ricevuta. Ti ricontatteremo telefonicamente o su WhatsApp entro 24 ore.';
        }

        contactForm.reset();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        // Scroll to alert
        if (alertBox) {
          alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 900);
    });
  }
});
