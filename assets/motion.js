/* Motion global del sitio (Fase 0 del rediseño). Vanilla, sin dependencias.
   - Reveal al hacer scroll (con stagger) en secciones y tarjetas.
   - Count-up de los números grandes al entrar en pantalla.
   - Spotlight que sigue el cursor dentro de las tarjetas.
   Respeta prefers-reduced-motion y punteros táctiles. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function reveal() {
    var sel = 'section.block, .podium .pod, .grid .gcard, .kpis .kpi, .nextcard, .upnext, ' +
              '.livebox, .tbl, .bracket-wrap, .steps .step, .subscribe, .feat';
    var els = [].slice.call(document.querySelectorAll(sel));
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('rv-in'); }); return; }
    els.forEach(function (e) { e.classList.add('rv'); });
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var e = en.target;
        var sibs = e.parentNode ? [].slice.call(e.parentNode.children).filter(function (c) { return c.classList.contains('rv'); }) : [e];
        e.style.transitionDelay = Math.min(sibs.indexOf(e), 6) * 60 + 'ms';
        e.classList.add('rv-in');
        io.unobserve(e);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  function countUp(el, to, suffix, dec) {
    var t0 = null, dur = 900;
    (function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); /* easeOutCubic */
      el.textContent = (to * e).toFixed(dec) + suffix;
      if (k < 1) requestAnimationFrame(step); else el.textContent = to.toFixed(dec) + suffix;
    })(performance.now());
  }
  function counters() {
    if (reduce || !('IntersectionObserver' in window)) return;
    var els = [].slice.call(document.querySelectorAll('.pod .pct, .kpi-n, .champ .cpct, [data-count]'));
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        var raw = (el.textContent || '').trim(), m = raw.match(/-?\d+(\.\d+)?/);
        if (!m) return;
        var to = parseFloat(m[0]); if (isNaN(to) || to <= 0) return;
        var dec = m[0].indexOf('.') >= 0 ? 1 : 0, suffix = raw.replace(m[0], '');
        el.textContent = (dec ? '0.0' : '0') + suffix;
        countUp(el, to, suffix, dec);
      });
    }, { threshold: 0.6 });
    els.forEach(function (e) { io.observe(e); });
  }

  function spotlight() {
    if (reduce || matchMedia('(pointer: coarse)').matches) return;
    var sel = '.gcard, .pod, .card, .kpi, .nextcard, .feat';
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest ? e.target.closest(sel) : null; if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }, { passive: true });
  }

  function smoothScroll() {
    if (reduce || matchMedia('(pointer: coarse)').matches || !window.Lenis) return;
    var lenis = new window.Lenis({ duration: 1.05, easing: function (t) { return 1 - Math.pow(1 - t, 3); }, smoothWheel: true });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }

  function navScroll() {
    var nav = document.querySelector('.nav'); if (!nav) return;
    var on = function () { nav.classList.toggle('scrolled', (window.scrollY || 0) > 8); };
    addEventListener('scroll', on, { passive: true }); on();
  }

  function init() { reveal(); counters(); spotlight(); smoothScroll(); navScroll(); }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
