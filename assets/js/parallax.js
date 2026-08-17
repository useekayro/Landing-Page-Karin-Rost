/* ════════════════════════════════════════════════════════════════
   PARALLAX — deslocamento sutil, só transform, um rAF por scroll

   Leituras e escritas são separadas em duas passadas para não
   forçar reflow a cada elemento. Desligado sob prefers-reduced-
   motion e em telas estreitas, onde a composição já é empilhada e
   o efeito só atrapalharia.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var els = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (!els.length) return;

  var calmo   = window.matchMedia('(prefers-reduced-motion: reduce)');
  var estreito = window.matchMedia('(max-width: 60rem)');
  var AMPLITUDE = 200;         /* px por unidade de data-parallax */

  var vh = window.innerHeight;
  var pendente = false;
  var limpo = false;

  function medir() {
    var leituras = [];
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.bottom < -240 || r.top > vh + 240) { leituras.push(null); continue; }
      leituras.push((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2));
    }
    return leituras;
  }

  function pintar(leituras) {
    for (var i = 0; i < els.length; i++) {
      if (leituras[i] === null) continue;
      var v = parseFloat(els[i].getAttribute('data-parallax')) || 0;
      els[i].style.transform =
        'translate3d(0,' + (leituras[i] * v * AMPLITUDE).toFixed(2) + 'px,0)';
    }
  }

  function zerar() {
    for (var i = 0; i < els.length; i++) {
      els[i].style.transform = '';
      els[i].style.willChange = 'auto';
    }
  }

  function quadro() {
    pendente = false;
    if (calmo.matches || estreito.matches) {
      if (!limpo) { zerar(); limpo = true; }
      return;
    }
    limpo = false;
    pintar(medir());
  }

  function agendar() {
    if (pendente) return;
    pendente = true;
    window.requestAnimationFrame(quadro);
  }

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; agendar(); }, { passive: true });

  if (calmo.addEventListener)    calmo.addEventListener('change', agendar);
  if (estreito.addEventListener) estreito.addEventListener('change', agendar);

  quadro();
})();
