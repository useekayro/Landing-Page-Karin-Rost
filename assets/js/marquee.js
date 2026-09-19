/* ════════════════════════════════════════════════════════════════
   MARQUEE DA BANDA — o esmaecimento por distância do centro

   O MOVIMENTO não passa por aqui: é uma animação CSS de transform no
   compositor (ver .marquee__trilho em 05-sections.css). Este script
   só faz o que CSS não sabe fazer — dar a cada área uma opacidade que
   depende de quão perto ela está do meio da faixa: 1 no centro,
   descendo até 0,25 nas bordas, como no efeito de referência.

   Custo controlado por dois cuidados:
   • o laço de quadros só roda enquanto a banda está na tela
     (IntersectionObserver); fora dela, zero trabalho por quadro;
   • leituras e escritas em passadas separadas, para não forçar
     reflow a cada item.

   Sob prefers-reduced-motion a lista para (regra no CSS) e o
   esmaecimento é calculado uma vez, sem laço.

   Sem JS, ou se algo falhar, os itens ficam com opacidade 1: a lista
   continua legível, só perde o degradê.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var caixa = document.getElementById('marquee');
  if (!caixa) return;

  var itens = Array.prototype.slice.call(caixa.querySelectorAll('.marquee__item'));
  if (!itens.length) return;

  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)');
  var PISO = 0.25;            /* opacidade mínima, nas bordas da faixa */
  var visivel = false;
  var pedido = 0;

  function aplicar() {
    var c = caixa.getBoundingClientRect();
    var centro = c.top + c.height / 2;
    var meia = c.height / 2 || 1;

    // leituras
    var valores = new Array(itens.length);
    for (var i = 0; i < itens.length; i++) {
      var r = itens[i].getBoundingClientRect();
      var d = Math.abs(centro - (r.top + r.height / 2));
      var n = Math.min(d / meia, 1);
      valores[i] = 1 - n * (1 - PISO);
    }
    // escritas
    for (var j = 0; j < itens.length; j++) {
      itens[j].style.opacity = valores[j].toFixed(3);
    }
  }

  function quadro() {
    pedido = 0;
    aplicar();
    if (visivel && !calmo.matches) pedido = window.requestAnimationFrame(quadro);
  }

  function ligar() {
    if (pedido) return;
    if (calmo.matches) { aplicar(); return; }   /* parado: uma vez basta */
    pedido = window.requestAnimationFrame(quadro);
  }

  function desligar() {
    if (pedido) window.cancelAnimationFrame(pedido);
    pedido = 0;
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visivel = entries[0].isIntersecting;
      if (visivel) ligar(); else desligar();
    }, { rootMargin: '120px 0px' }).observe(caixa);
  } else {
    aplicar();
  }

  if (calmo.addEventListener) {
    calmo.addEventListener('change', function () { desligar(); if (visivel) ligar(); });
  }
  window.addEventListener('resize', function () { if (calmo.matches) aplicar(); }, { passive: true });
})();
