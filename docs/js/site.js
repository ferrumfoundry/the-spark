/* The Spark — Ferrum. No dependencies, no trackers. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-ready')));

  /* ---- nav ---- */
  const nav = $('#nav'), menu = $('#menu');
  const onScrollNav = () => nav.classList.toggle('is-stuck', window.scrollY > 12);
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('#navlinks a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false');
  }));
  const links = new Map($$('#navlinks a').map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { links.forEach(l => l.classList.remove('is-active')); links.get(e.target.id)?.classList.add('is-active'); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['top', ...links.keys()].forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });

  /* ---- scroll reveals ---- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---- team card tilt ---- */
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  $$('.tcard').forEach(card => {
    card.addEventListener('pointermove', ev => {
      if (!fine.matches || reduce.matches) return;
      const r = card.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (x * 100) + '%'); card.style.setProperty('--my', (y * 100) + '%');
      card.style.transform = `translateY(-8px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* ---- steps + action record ---- */
  const steps = $('#steps'), stepEls = $$('.step', steps);
  const logItems = $$('#log > li'), approve = $('#approve');
  const count = $('#logcount'), prog = $('#logprog');
  const stepItems = logItems.filter(li => !li.classList.contains('approve-li'));
  let shown = -1;
  const showLog = n => {
    n = Math.max(0, Math.min(logItems.length, n));
    if (n === shown) return; shown = n;
    logItems.forEach((li, i) => { li.classList.toggle('is-in', i < n); li.classList.toggle('is-now', i === n - 1); });
    if (approve) {
      // Story beat: the job finishes because the user tapped "Don't" —
      // the risky delete never ran, and the record says so.
      approve.classList.toggle('is-ok', n >= logItems.length);
    }
    const done = logItems.slice(0, n).filter(li => !li.classList.contains('approve-li')).length;
    count.textContent = `${done} / ${stepItems.length} steps`;
    prog.style.width = (done / stepItems.length * 100) + '%';
  };

  /* ---- scroll-linked effects ---- */
  const pars = $$('[data-par]');
  let ticking = false, maxP = 0;
  const onScroll = () => {
    onScrollNav();
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const vh = window.innerHeight;
      const r = steps.getBoundingClientRect();
      maxP = Math.max(maxP, Math.max(0, Math.min(1, (vh * 0.62 - r.top) / r.height))); const p = maxP;
      steps.style.setProperty('--p', p.toFixed(3));
      stepEls.forEach((s, i) => s.classList.toggle('is-on', p >= i / stepEls.length + 0.02 || p > 0.98));
      showLog(Math.round(p * logItems.length + (p > 0 ? 0.6 : 0)));
      if (!reduce.matches) pars.forEach(el => {
        const b = el.getBoundingClientRect(); const c = (b.top + b.height / 2 - vh / 2);
        const y = Math.max(-36, Math.min(36, -c * parseFloat(el.dataset.par))); el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      });
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  if (reduce.matches) showLog(logItems.length);

  /* ---- FAQ: one open at a time ---- */
  $$('.faq details').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) $$('.faq details').forEach(o => { if (o !== d) o.open = false; });
  }));

  /* ---- hero canvas: rising sparks ---- */
  const cv = $('#sparks');
  if (!cv || reduce.matches) return;
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, parts = [], running = true, last = 0;
  const COLORS = ['251,77,109', '225,29,72', '167,139,250', '245,242,250'];
  const spawn = (anywhere) => ({
    x: Math.random() * W, y: anywhere ? Math.random() * H : H + 10,
    vx: (Math.random() - 0.5) * 0.25, vy: -(0.25 + Math.random() * 0.9),
    r: 0.6 + Math.random() * 2.2, life: 0, max: 260 + Math.random() * 420,
    c: COLORS[(Math.random() * (Math.random() < 0.85 ? 3 : 4)) | 0], w: Math.random() * Math.PI * 2
  });
  const size = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.round(Math.min(90, W * H / 15000));
    while (parts.length < target) parts.push(spawn(true));
    parts.length = target;
  };
  let mx = 0.5, my = 0.5;
  window.addEventListener('pointermove', e => { mx = e.clientX / window.innerWidth; my = e.clientY / window.innerHeight; }, { passive: true });
  const frame = t => {
    if (!running) return;
    const dt = Math.min(2.5, (t - last) / 16.67 || 1); last = t;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.life += dt; p.w += 0.02 * dt;
      p.x += (p.vx + Math.sin(p.w) * 0.25 + (mx - 0.5) * 0.3) * dt;
      p.y += p.vy * dt;
      const k = p.life / p.max, a = Math.sin(Math.min(1, k) * Math.PI) * 0.7;
      if (k >= 1 || p.y < -20) { parts[i] = spawn(false); continue; }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
      g.addColorStop(0, `rgba(${p.c},${a})`); g.addColorStop(1, `rgba(${p.c},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 6.283); ctx.fill();
      ctx.fillStyle = `rgba(255,240,245,${a * 0.9})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.6, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  };
  size(); window.addEventListener('resize', size);
  new IntersectionObserver(([e]) => {
    const was = running; running = e.isIntersecting && !document.hidden;
    if (running && !was) requestAnimationFrame(frame);
  }).observe(cv);
  document.addEventListener('visibilitychange', () => { const was = running; running = !document.hidden; if (running && !was) requestAnimationFrame(frame); });
  requestAnimationFrame(frame);
})();
