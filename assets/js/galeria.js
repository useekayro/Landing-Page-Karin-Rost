/* ════════════════════════════════════════════════════════════════
   GALERIA DE PROFUNDIDADE — retratos que emergem conforme a rolagem

   A referência era um componente React + three.js (InfiniteGallery)
   com planos flutuando em z, fade e desfoque ligados à profundidade.
   Duas coisas dele NÃO vieram, por decisão do PRODUCT.md (item 3,
   "sem carrosséis automáticos ou scroll infinito"):

     • o autoPlay, que continuava andando sozinho após 3s parado;
     • o wrapping infinito, que reciclava as imagens para sempre.

   Aqui cada retrato aparece UMA vez, quando a sua seção passa pela
   janela, e some quando ela sai. Quem manda é a rolagem do usuário:
   nada se move sozinho e nada captura o evento de scroll — o
   original chamava preventDefault no wheel, o que numa landing page
   prenderia a navegação dentro do efeito.

   As curvas de fade e desfoque são as do componente original:
     fade    0,05 → 0,25 entrando   |  0,75 → 0,95 saindo
     desfoque  0 → 0,15 entrando    |  0,85 → 1,00 saindo, teto 8px

   Mesma disciplina do parallax.js: um rAF por scroll, leituras e
   escritas em passadas separadas, desligado sob prefers-reduced-
   motion e em telas onde a margem não comporta os retratos.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var els = Array.prototype.slice.call(document.querySelectorAll('[data-retrato]'));
  if (!els.length) return;

  var calmo    = window.matchMedia('(prefers-reduced-motion: reduce)');
  var estreito = window.matchMedia('(max-width: 63.99rem)');

  var FADE_ENTRA = [0.05, 0.25];
  var FADE_SAI   = [0.75, 0.95];
  var BLUR_ENTRA = [0.00, 0.15];
  var BLUR_SAI   = [0.85, 1.00];
  var BLUR_MAX   = 8;          /* px */
  var ESCALA     = [0.74, 1.08];
  var DERIVA     = 56;         /* px de deslocamento vertical no percurso */

  var vh = window.innerHeight;
  var pendente = false;
  var limpo = false;

  /* rampa(t, [a, b]) → 0 antes de a, 1 depois de b, linear no meio */
  function rampa(t, faixa) {
    if (t <= faixa[0]) return 0;
    if (t >= faixa[1]) return 1;
    return (t - faixa[0]) / (faixa[1] - faixa[0]);
  }

  /* Uma passada de leitura: nenhuma escrita no DOM aqui dentro. */
  function medir() {
    var leituras = [];
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) { leituras.push(null); continue; }
      /* t = 0 quando o centro do retrato está uma tela abaixo da
         dobra; t = 1 quando já saiu por cima. O denominador inclui a
         altura do elemento para que retratos de tamanhos diferentes
         percorram a curva no mesmo ritmo. */
      var centro = r.top + r.height / 2;
      leituras.push(1 - centro / (vh + r.height));
    }
    return leituras;
  }

  function pintar(leituras) {
    for (var i = 0; i < els.length; i++) {
      var t = leituras[i];
      if (t === null) continue;
      if (t < 0) t = 0; else if (t > 1) t = 1;

      var opacidade = rampa(t, FADE_ENTRA) * (1 - rampa(t, FADE_SAI));
      var desfoque  = BLUR_MAX * ((1 - rampa(t, BLUR_ENTRA)) + rampa(t, BLUR_SAI));
      if (desfoque > BLUR_MAX) desfoque = BLUR_MAX;
      var escala    = ESCALA[0] + (ESCALA[1] - ESCALA[0]) * t;

      var e = els[i].style;
      e.setProperty('--r-o', opacidade.toFixed(3));
      e.setProperty('--r-b', desfoque.toFixed(2) + 'px');
      e.setProperty('--r-s', escala.toFixed(3));
      e.setProperty('--r-y', ((0.5 - t) * DERIVA).toFixed(1) + 'px');
    }
  }

  /* Sem movimento: os retratos ficam parados, nítidos e discretos.
     Some o efeito, não a fotografia. */
  function zerar() {
    for (var i = 0; i < els.length; i++) {
      var e = els[i].style;
      e.setProperty('--r-o', '0.9');
      e.setProperty('--r-b', '0px');
      e.setProperty('--r-s', '1');
      e.setProperty('--r-y', '0px');
      e.willChange = 'auto';
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
