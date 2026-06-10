/* Explorador de paletas (solo dev/exploración). Cambia los acentos de la UI (vía data-pal en
   <html>, que activa overrides de CSS) y re-tinta la aurora WebGL en vivo. Persiste en localStorage.
   Para producción se quita el switcher; se fija una sola paleta. */
(function () {
  var PALS = {
    aurora: { label: 'Aurora', sw: ['#34d0ff', '#10d39e', '#9b8cff'],
      aur: [[0.10, 0.55, 0.85], [0.45, 0.40, 0.95], [0.06, 0.70, 0.50], [0.20, 0.70, 0.95]] },
    indigo: { label: 'Índigo', sw: ['#7c6cff', '#36c4ff', '#b98cff'],
      aur: [[0.42, 0.34, 1.00], [0.18, 0.62, 1.00], [0.50, 0.40, 0.95], [0.40, 0.45, 1.00]] },
    pitch:  { label: 'Cancha', sw: ['#16e0a3', '#69e0ff', '#ffc24a'],
      aur: [[0.07, 0.72, 0.52], [1.00, 0.72, 0.25], [0.10, 0.60, 0.70], [0.10, 0.75, 0.60]] },
    /* Mundial 26: oro del trofeo + las 3 sedes (USA azul / MEX verde / CAN rojo) en la aurora */
    mundial: { label: 'Mundial 26', sw: ['#3aa0ff', '#16c98a', '#ffcf3a'],
      aur: [[0.15, 0.45, 1.00], [0.95, 0.27, 0.32], [0.10, 0.78, 0.45], [1.00, 0.78, 0.25]] }
  };
  function applyAur(k) { var p = PALS[k]; if (p && window.AURORA_SET) window.AURORA_SET(p.aur[0], p.aur[1], p.aur[2], p.aur[3]); }
  function upd(k) { [].forEach.call(box.querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-pal') === k); }); }
  function set(k) {
    if (!PALS[k]) k = 'aurora';
    document.documentElement.dataset.pal = k === 'aurora' ? '' : k;
    try { localStorage.setItem('pal', k); } catch (e) {}
    applyAur(k); upd(k);
  }
  var cur = (function () { try { return localStorage.getItem('pal') || 'aurora'; } catch (e) { return 'aurora'; } })();

  var box = document.createElement('div');
  box.className = 'palsw';
  box.innerHTML = '<div class="palsw-h">Paleta · dev</div>' + Object.keys(PALS).map(function (k) {
    var p = PALS[k];
    return '<button data-pal="' + k + '"><span class="palsw-sw">' +
      p.sw.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span>' + p.label + '</button>';
  }).join('');
  box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) set(b.getAttribute('data-pal')); });

  function mount() { document.body.appendChild(box); document.documentElement.dataset.pal = cur === 'aurora' ? '' : cur; applyAur(cur); upd(cur); }
  if (document.readyState !== 'loading') mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
