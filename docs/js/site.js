/* The Spark — Ferrum. No dependencies, no trackers. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- nav ---- */
  const nav = $('#nav'), menu = $('#menu');
  const onScrollNav = () => nav.classList.toggle('is-stuck', window.scrollY > 12);
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();
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
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---- sample action record: rows arrive one at a time ---- */
  const log = $('#log'), approve = $('#approve'), count = $('#logcount');
  if (log) {
    const items = $$('#log > li');
    const stepItems = items.filter(li => !li.classList.contains('approve-li'));
    const showAll = () => {
      items.forEach(li => li.classList.add('is-in'));
      approve?.classList.add('is-done');
      if (count) count.textContent = `${stepItems.length} / ${stepItems.length} steps`;
    };
    if (reduce.matches) {
      showAll();
    } else {
      let shown = 0, started = false;
      const tick = () => {
        if (shown >= items.length) {
          // Story beat: the job finishes because the user tapped "Don't" —
          // the risky delete never ran, and the record says so.
          approve?.classList.add('is-done');
          return;
        }
        const li = items[shown++];
        li.classList.add('is-in');
        items.forEach((o, i) => o.classList.toggle('is-now', i === shown - 1));
        const done = items.slice(0, shown).filter(o => !o.classList.contains('approve-li')).length;
        if (count) count.textContent = `${done} / ${stepItems.length} steps`;
        setTimeout(tick, shown === items.length ? 500 : 620);
      };
      const rio = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting && !started) { started = true; setTimeout(tick, 250); rio.disconnect(); }
      }), { threshold: 0.25 });
      rio.observe(log);
    }
  }

  /* ---- FAQ: one open at a time ---- */
  $$('.faq details').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) $$('.faq details').forEach(o => { if (o !== d) o.open = false; });
  }));
})();
