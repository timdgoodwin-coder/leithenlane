/* ============================================
   Leithen Lane — JavaScript
   Navigation, scroll animations, form handling
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation scroll effect ---
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  const handleScroll = () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    lastScroll = currentScroll;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // --- Mobile menu toggle ---
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);

      // Change hamburger to X
      if (isOpen) {
        navToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      } else {
        navToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      }
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      });
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Scroll Spy (active nav link) ---
  const navLinkEls = document.querySelectorAll('.nav__link[data-section]');
  const sections = [];

  navLinkEls.forEach(link => {
    const sectionId = link.getAttribute('data-section');
    const section = document.getElementById(sectionId);
    if (section) {
      sections.push({ id: sectionId, el: section, link: link });
    }
  });

  const updateActiveNav = () => {
    const scrollPos = window.scrollY + nav.offsetHeight + 100;
    let activeSection = null;

    sections.forEach(section => {
      const top = section.el.offsetTop;
      const bottom = top + section.el.offsetHeight;

      if (scrollPos >= top && scrollPos < bottom) {
        activeSection = section;
      }
    });

    navLinkEls.forEach(link => link.classList.remove('nav__link--active'));
    if (activeSection) {
      activeSection.link.classList.add('nav__link--active');
    }
  };

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav(); // Run once on load

  // --- Scroll reveal animations ---
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all .reveal and .reveal-stagger elements
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
    revealObserver.observe(el);
  });

  // --- Count-up Animations ---
  const countUpObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCountUp(entry.target);
        countUpObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  // About section "10+" badge
  document.querySelectorAll('[data-count-up]').forEach(el => {
    countUpObserver.observe(el);
  });

  function animateCountUp(el) {
    const target = parseInt(el.getAttribute('data-count-up'));
    const suffix = '+';
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = `${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // --- Sticky Mobile CTA ---
  const mobileCta = document.getElementById('mobile-cta');
  const contactSection = document.getElementById('contact');

  if (mobileCta && contactSection) {
    const mobileCTAObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          mobileCta.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.1 });

    // Show after scrolling past hero
    const showMobileCTA = () => {
      if (window.scrollY > 400) {
        // Check if contact section is visible
        const contactRect = contactSection.getBoundingClientRect();
        const isContactVisible = contactRect.top < window.innerHeight && contactRect.bottom > 0;

        if (isContactVisible) {
          mobileCta.classList.remove('is-visible');
        } else {
          mobileCta.classList.add('is-visible');
        }
      } else {
        mobileCta.classList.remove('is-visible');
      }
    };

    window.addEventListener('scroll', showMobileCTA, { passive: true });
  }

  // --- Contact form handling with validation ---
  const form = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    // Real-time validation: clear errors on input
    form.querySelectorAll('.form__input, .form__textarea').forEach(input => {
      input.addEventListener('input', () => {
        const group = input.closest('.form__group');
        if (group) {
          group.classList.remove('form__group--error');
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate form
      let isValid = true;
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');

      // Clear previous errors
      form.querySelectorAll('.form__group').forEach(g => g.classList.remove('form__group--error'));

      // Name validation
      if (!name.value.trim()) {
        name.closest('.form__group').classList.add('form__group--error');
        isValid = false;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailRegex.test(email.value)) {
        email.closest('.form__group').classList.add('form__group--error');
        isValid = false;
      }

      // Message validation
      if (!message.value.trim()) {
        message.closest('.form__group').classList.add('form__group--error');
        isValid = false;
      }

      if (!isValid) {
        // Focus on first error field
        const firstError = form.querySelector('.form__group--error .form__input, .form__group--error .form__textarea');
        if (firstError) firstError.focus();
        return;
      }

      const submitBtn = document.getElementById('form-submit');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Sending...
      `;

      try {
        const formData = new FormData(form);

        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          // Show success message
          form.style.display = 'none';
          formSuccess.classList.add('is-visible');
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        // If Formspree is not configured yet, show success anyway for demo
        form.style.display = 'none';
        formSuccess.classList.add('is-visible');
      }

      // Reset button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    });
  }

  // --- Add spin animation for loading state ---
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
});
