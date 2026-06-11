// ── Theme ──
const html = document.documentElement;
const themeBtns = document.querySelectorAll('.theme-btn');

function setTheme(t) {
  html.setAttribute('data-theme', t);
  try { localStorage.setItem('theme', t); } catch (e) { /* storage blocked — ignore */ }
  themeBtns.forEach(b => {
    const active = b.dataset.theme === t;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', active);
  });
}

(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) { /* ignore */ }
  const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  setTheme(saved || sys);
})();

themeBtns.forEach(b => b.addEventListener('click', () => setTheme(b.dataset.theme)));

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (err) { /* ignore */ }
  if (!saved) setTheme(e.matches ? 'dark' : 'light');
});

// ── Mobile nav ──
const menuToggle = document.querySelector('.menu-toggle');
const navActions = document.querySelector('.nav-actions');

if (menuToggle && navActions) {
  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('active');
    navActions.classList.remove('active');
  };

  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    menuToggle.classList.toggle('active', !open);
    navActions.classList.toggle('active', !open);
  });

  navActions.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('click', e => {
    if (!navActions.contains(e.target) && !menuToggle.contains(e.target)) closeMenu();
  });

  // Close menu on Escape for keyboard users
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

// ── FAQ accordion ──
const faqButtons = document.querySelectorAll('.faq-q');

function closeAllFaq() {
  faqButtons.forEach(b => {
    b.setAttribute('aria-expanded', 'false');
    b.nextElementSibling.style.maxHeight = null;
  });
}

faqButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const wasOpen = btn.getAttribute('aria-expanded') === 'true';
    closeAllFaq();
    if (!wasOpen) {
      btn.setAttribute('aria-expanded', 'true');
      const ans = btn.nextElementSibling;
      ans.style.maxHeight = ans.scrollHeight + 'px';
    }
  });
});

// Recalculate the open panel's height on resize so text reflow never gets clipped
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const open = document.querySelector('.faq-q[aria-expanded="true"]');
    if (open) {
      const ans = open.nextElementSibling;
      ans.style.maxHeight = ans.scrollHeight + 'px';
    }
  }, 120);
});

// ── Smooth scroll for in-page anchors ──
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      // Keep the URL in sync so deep links and the back button work.
      history.pushState(null, '', href);
    }
  });
});

// ── Testimonial carousel ──
// Reads however many .tcar-slide blocks exist in the HTML.
// Shows controls only when there is more than one. Add slides by
// pasting more .tcar-slide blocks into .tcar-track — no JS edits needed.
document.querySelectorAll('[data-carousel]').forEach(car => {
  const slides = Array.from(car.querySelectorAll('.tcar-slide'));
  const controls = car.querySelector('[data-carousel-controls]');
  const dotsWrap = car.querySelector('[data-carousel-dots]');
  const prevBtn = car.querySelector('[data-carousel-prev]');
  const nextBtn = car.querySelector('[data-carousel-next]');
  if (slides.length === 0) return;

  let index = 0;
  let dots = [];

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => { s.hidden = n !== index; });
    dots.forEach((d, n) => d.setAttribute('aria-selected', String(n === index)));
  }

  // Single testimonial: just show it, hide all controls.
  if (slides.length < 2) {
    slides.forEach((s, n) => { s.hidden = n !== 0; });
    if (controls) controls.hidden = true;
    return;
  }

  if (controls) controls.hidden = false;

  // Build dots
  if (dotsWrap) {
    slides.forEach((_, n) => {
      const dot = document.createElement('button');
      dot.className = 'tcar-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Testimonial ${n + 1}`);
      dot.addEventListener('click', () => show(n));
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => show(index - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => show(index + 1));

  show(0);
});

// ── Video facades: load the Bunny Stream player on click ──
// One handler for the hero showreel AND every Showcase card. Each facade
// (the .hero-video div, or a .video-placeholder link) carries:
//   data-bunny-lib = your Bunny Library ID  (the number; same for every video)
//   data-bunny-id  = that video's GUID      (from the video's Embed panel)
//   data-title     = accessible player title (optional)
// The player iframe is injected only on click, so nothing loads from Bunny
// until a visitor actually presses play — the page stays fast.
document.querySelectorAll('[data-bunny-id]').forEach(facade => {
  const lib = facade.dataset.bunnyLib;
  const id = facade.dataset.bunnyId;
  // Still holding placeholder values? Leave the facade as a poster so an
  // un-filled slot never loads a broken player.
  if (!lib || !id || lib === 'LIBRARY_ID' || id.indexOf('VIDEO_GUID') === 0) return;

  facade.addEventListener('click', e => {
    e.preventDefault(); // for the <a> cards; harmless on the hero <div>
    const iframe = document.createElement('iframe');
    iframe.src = `https://iframe.mediadelivery.net/embed/${lib}/${id}?autoplay=true&preload=true&responsive=true`;
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.setAttribute('allowfullscreen', '');
    iframe.title = facade.dataset.title || 'SurtAI film';
    facade.innerHTML = '';
    facade.appendChild(iframe);
  });
});

// Loads any <img data-src="..."> when it scrolls into view.
// (Native loading="lazy" handles the rest; this is the fallback path.)
if ('IntersectionObserver' in window) {
  const imgObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      obs.unobserve(img);
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
}

// ── Click-to-copy email ──
// Copies the address to the clipboard and briefly confirms in-button.
// The element is an <a href="mailto:…">, so with JS off it still works.
document.querySelectorAll('.js-copy-email').forEach(el => {
  const email = el.dataset.copy;
  const label = el.dataset.label || el.textContent;
  const status = document.getElementById('copy-status');
  let resetTimer;

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; }
      catch (e) { /* fall through to legacy path */ }
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  el.addEventListener('click', async e => {
    e.preventDefault();
    const ok = await copyText(email);
    clearTimeout(resetTimer);
    if (ok) {
      el.textContent = '✓ Copied!';
      el.classList.add('is-copied');
      if (status) status.textContent = 'Email copied to clipboard.';
      resetTimer = setTimeout(() => {
        el.textContent = label;
        el.classList.remove('is-copied');
        if (status) status.textContent = '';
      }, 2000);
    } else {
      // Clipboard unavailable (rare) — fall back to the mail client.
      window.location.href = el.getAttribute('href');
    }
  });
});
