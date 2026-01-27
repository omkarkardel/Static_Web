// assets/home-anim.js
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const injectStyles = (css) => {
    const s = document.createElement('style');
    s.setAttribute('data-home-anim', 'true');
    s.textContent = css;
    document.head.appendChild(s);
  };
  injectStyles(`
    :root { --ha-dur: 620ms; --ha-ease: cubic-bezier(.21,.98,.6,.99); }
    .ha-reveal { opacity: 0; transform: translateY(12px) scale(.98); will-change: opacity, transform; }
    .ha-in { opacity: 1; transform: none; transition: opacity var(--ha-dur) var(--ha-ease), transform var(--ha-dur) var(--ha-ease); }
    .ha-stagger > * { opacity: 0; transform: translateY(12px) scale(.98); }
    .ha-tilt { transform-style: preserve-3d; will-change: transform; transition: transform 180ms ease; }
    .ha-tilt:hover { transition: transform 60ms linear; }
    .ha-progress { position: fixed; top: 0; left: 0; height: 3px; width: 0; z-index: 9999;
      background: linear-gradient(90deg,#4776e6,#8e54e9,#ee0979); box-shadow: 0 0 10px rgba(142,84,233,.5); }
    canvas.ha-bg { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
    .ha-highlight { background-image: linear-gradient(90deg,#ff6a00,#ee0979,#8e54e9,#4776e6);
      background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; }
    [data-ha-bg], .has-ha-bg { position: relative; overflow: hidden; }
    canvas.ha-sec-bg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; opacity: .22; }
  `);

  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

  function initProgress() {
    const bar = document.createElement('div');
    bar.className = 'ha-progress';
    document.body.appendChild(bar);
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight || 1;
      const top = h.scrollTop || document.body.scrollTop || 0;
      const pct = clamp(top / max, 0, 1);
      bar.style.width = (pct * 100).toFixed(2) + '%';
    };
    update();
    addEventListener('scroll', update, { passive: true });
  }

  function initReveal() {
    const candidates = new Set([
      ...qsa('[data-anim]'),
      ...qsa('.name'),
      ...qsa('h1, h2, h3, .tagline, p, img, .card, .feature-card, li, .btn, .cta, section')
    ]);
    const els = Array.from(candidates).filter(Boolean);
    els.forEach(el => el.classList.add('ha-reveal'));
    const groups = qsa('[data-stagger]');
    groups.forEach(g => g.classList.add('ha-stagger'));

    if (reduced) {
      els.forEach(el => el.classList.add('ha-in'));
      groups.forEach(g => qsa(':scope > *', g).forEach(ch => ch.style.opacity = 1));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.classList.contains('ha-stagger')) {
          const kids = qsa(':scope > *', el);
          kids.forEach((kid, i) => {
            kid.style.transitionDelay = (i * 70) + 'ms';
            requestAnimationFrame(() => { kid.classList.add('ha-in'); kid.style.opacity = 1; });
          });
        } else {
          const d = parseInt(el.getAttribute('data-delay') || '0', 10);
          if (d) el.style.transitionDelay = d + 'ms';
          el.classList.add('ha-in');
        }
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -10% 0px' });

    els.forEach(el => io.observe(el));
    groups.forEach(g => io.observe(g));
  }

  function initTilt() {
    const tilts = [...qsa('[data-tilt]'), ...qsa('.card, .feature-card, .btn')];
    tilts.forEach(el => {
      el.classList.add('ha-tilt');
      let raf = 0;
      const maxDeg = 4;
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) / (r.width / 2);
        const dy = (e.clientY - cy) / (r.height / 2);
        const rx = clamp(-dy * maxDeg, -maxDeg, maxDeg);
        const ry = clamp(dx * maxDeg, -maxDeg, maxDeg);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
        });
      };
      const reset = () => { cancelAnimationFrame(raf); el.style.transform = 'rotateX(0) rotateY(0) translateZ(0)'; };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', reset);
      el.addEventListener('blur', reset);
      if ('ontouchstart' in window) {
        el.addEventListener('touchstart', () => el.style.transform = 'scale(0.98)', { passive: true });
        el.addEventListener('touchend', () => el.style.transform = '', { passive: true });
      }
    });
  }

  function initCounters() {
    const counters = qsa('[data-count]');
    if (!counters.length) return;
    const animate = (el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const duration = parseInt(el.getAttribute('data-count-duration') || '1200', 10);
      const start = performance.now();
      const startVal = parseFloat(el.textContent.replace(/[^\d.-]/g, '')) || 0;
      const delta = target - startVal;
      const step = (t) => {
        const p = clamp((t - start) / duration, 0, 1);
        const e = p < 0.5 ? 2*p*p : -1 + (4 - 2*p)*p;
        el.textContent = Math.round(startVal + delta * e).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(el => io.observe(el));
  }

  function initParallax() {
    const hero = qs('.hero') || qs('header') || document.body;
    const nameEl = qs('.name');
    if (!hero) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const t = clamp(y / 600, 0, 1);
        hero.style.transform = `translateY(${-(t * 10)}px)`;
        hero.style.opacity = String(1 - t * 0.15);
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (nameEl) {
      nameEl.classList.add('ha-highlight');
      let req = 0;
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        const x = clamp((e.clientX - r.left) / r.width, 0, 1);
        cancelAnimationFrame(req);
        req = requestAnimationFrame(() => { nameEl.style.backgroundPosition = `${(x * 100).toFixed(2)}% 50%`; });
      });
      hero.addEventListener('mouseleave', () => { nameEl.style.backgroundPosition = ''; });
    }
  }

  function initBackground() {
    if (reduced) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'ha-bg';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const resize = () => {
      w = canvas.width = Math.floor(innerWidth * dpr);
      h = canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
    resize();
    addEventListener('resize', resize);
    const blobs = [
      { x: 0.25, y: 0.3, r: 250, hue: 265 },
      { x: 0.7, y: 0.7, r: 300, hue: 210 },
      { x: 0.5, y: 0.4, r: 220, hue: 330 }
    ];
    const stars = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.5 + 0.3, v: Math.random() * 0.0008 + 0.0002 }));
    let t0 = performance.now();
    function loop(t) {
      const dt = (t - t0) / 1000; t0 = t;
      ctx.clearRect(0, 0, w, h);
      const grd = ctx.createRadialGradient(w*0.5, h*0.3, 0, w*0.5, h*0.5, Math.max(w,h) * 0.7);
      grd.addColorStop(0, 'rgba(10,14,24,0.9)'); grd.addColorStop(1, 'rgba(7,10,18,1)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
      blobs.forEach((b, i) => {
        const px = (b.x + Math.sin(t * 0.0003 * (i + 1)) * 0.02) * w;
        const py = (b.y + Math.cos(t * 0.00025 * (i + 1)) * 0.02) * h;
        const r = b.r * dpr * (1 + Math.sin(t * 0.0002 + i) * 0.03);
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, `hsla(${b.hue}, 85%, 60%, 0.22)`); g.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      stars.forEach(s => { s.x += s.v * dt * 60; if (s.x > 1.05) s.x = -0.05; const sx = s.x * w, sy = s.y * h;
        ctx.beginPath(); ctx.arc(sx, sy, s.s * dpr, 0, Math.PI * 2); ctx.fill(); });
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // Shared "stats-style" background for para, gallery, courses (and stats)
  function initSectionBackgrounds() {
    if (reduced) return;

    const findSection = (names) => {
      for (const n of names) {
        const el = qs(`#${n}`) || qs(`.${n}`) || qs(`[data-section="${n}"]`);
        if (el) return el;
      }
      return null;
    };

    const para = findSection(['para']);
    const gallery = findSection(['gallery']);
    const courses = findSection(['courses']);
    const stats = findSection(['stats']); // optional: keep original look consistent

    [para, gallery, courses, stats].filter(Boolean).forEach(el => addStatsMesh(el));

    function addStatsMesh(section) {
      section.classList.add('has-ha-bg');
      section.setAttribute('data-ha-bg', 'statsMesh');
      const canvas = document.createElement('canvas');
      canvas.className = 'ha-sec-bg';
      section.prepend(canvas);

      const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
      let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      let running = false;
      let t0 = performance.now();
      let mouseX = 0.5;

      const resize = () => {
        const rect = section.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        w = canvas.width = Math.floor(width * dpr);
        h = canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(section);

      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { running = e.isIntersecting; if (running) requestAnimationFrame(loop); });
      }, { threshold: 0.05 });
      io.observe(section);

      section.addEventListener('mousemove', (e) => {
        const r = section.getBoundingClientRect();
        mouseX = clamp((e.clientX - r.left) / r.width, 0, 1);
      }, { passive: true });

      function loop(t) {
        if (!running) return;
        const dt = (t - t0) / 1000; t0 = t;
        ctx.clearRect(0, 0, w, h);

        // backdrop gradient (consistent with stats feel)
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, 'rgba(10,14,24,0.10)');
        bg.addColorStop(1, 'rgba(7,10,18,0.16)');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

        // soft blobs (red → magenta → violet palette)
        const hues = [0, 330, 280, 220]; // red to violet
        hues.forEach((hue, i) => {
          const px = (Math.sin(t * 0.00035 + i * 1.2) * 0.35 + 0.5 + (mouseX - 0.5) * 0.06) * w;
          const py = (Math.cos(t * 0.00028 + i * 1.6) * 0.30 + 0.5) * h;
          const r = (Math.sin(t * 0.0004 + i) * 0.05 + 0.12) * Math.max(w, h);
          const g = ctx.createRadialGradient(px, py, 0, px, py, r);
          g.addColorStop(0, `hsla(${hue},85%,60%,0.20)`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        });

        // subtle mesh lines between moving anchor points
        const anchors = 5;
        const pts = Array.from({ length: anchors }, (_, i) => {
          const x = (Math.sin(t * 0.00033 + i) * 0.4 + 0.5 + (mouseX - 0.5) * 0.06) * w;
          const y = (Math.cos(t * 0.00026 + i * 1.7) * 0.4 + 0.5) * h;
          return { x, y };
        });
        ctx.lineWidth = Math.max(1, dpr);
        ctx.strokeStyle = 'rgba(142,84,233,0.12)'; // violet
        for (let i = 0; i < pts.length - 1; i++) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[i+1].x, pts[i+1].y); ctx.stroke();
        }

        // gentle highlight sweep
        const sweepX = ((Math.sin(t * 0.0005) * 0.5 + 0.5) * w);
        const grad = ctx.createLinearGradient(sweepX - w*0.2, 0, sweepX + w*0.2, 0);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.5, 'rgba(255,255,255,0.06)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);

        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    }
  }

  function initAnchors() {
    const links = qsa('a[href^="#"]');
    links.forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const target = id && qs('#' + CSS.escape(id));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      });
    });
    const sections = qsa('section[id]');
    if (!sections.length) return;
    const navLinks = new Map(qsa('nav a[href^="#"]').map(a => [a.getAttribute('href')?.slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const id = en.target.id;
        navLinks.forEach((a) => a.classList.remove('active'));
        const active = navLinks.get(id);
        if (active) active.classList.add('active');
      });
    }, { threshold: 0.6 });
    sections.forEach(s => io.observe(s));
  }

  function initEntrance() {
    const topEls = [...qsa('.name'), ...qsa('.tagline, .cta')];
    topEls.forEach((el, i) => {
      if (reduced) { el.style.opacity = 1; return; }
      el.style.opacity = 0;
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'opacity 600ms var(--ha-ease), transform 600ms var(--ha-ease)';
      setTimeout(() => { el.style.opacity = 1; el.style.transform = 'none'; }, 120 + i * 90);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initProgress();
    initEntrance();
    initReveal();
    initTilt();
    initCounters();
    initParallax();
    initBackground();
    initSectionBackgrounds(); // unified stats-style bg on para, gallery, courses
    initAnchors();
  });
})();