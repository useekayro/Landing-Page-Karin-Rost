/* ════════════════════════════════════════════════════════════════
   ÁREAS — o painel de explicação

   Adaptado do LinkPreview: em vez de abrir o preview de uma imagem,
   o card abre a explicação do serviço. O deslocamento horizontal
   segue o cursor com amortecimento (metade da distância ao centro,
   como no original) e é travado nas bordas da janela.

   Só roda onde existe hover de verdade. No toque o CSS já mostra a
   explicação como texto corrido — ninguém precisa caçar informação
   com o dedo.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (!window.matchMedia('(hover: hover)').matches) return;

  var cards = Array.prototype.slice.call(document.querySelectorAll('.area'));
  if (!cards.length) return;

  var paineis = cards.map(function (c) { return c.querySelector('.area__pop'); });
  var grade = document.querySelector('.areas__grid');
  var LIMITE = 46;      /* deslocamento máximo pelo cursor, por lado */
  var MARGEM = 14;      /* respiro mínimo até a borda da janela      */

  /* Quanto o painel pode andar para cada lado sem vazar da janela. */
  function limites(card, pop) {
    var r = card.getBoundingClientRect();
    var meia = pop.offsetWidth / 2;
    var centro = r.left + r.width / 2;
    return {
      min: MARGEM + meia - centro,
      max: window.innerWidth - MARGEM - meia - centro
    };
  }

  function travar(v, lim) {
    if (lim.min > lim.max) return 0;         /* painel maior que a tela */
    return Math.max(Math.min(v, lim.max), lim.min);
  }

  /* ── Lado de abertura e posição de repouso ────────────────────
     Calculado continuamente para TODOS os cards, não no evento de
     abertura. Amarrar ao 'focus' era frágil: focar por teclado faz
     o navegador rolar o card para dentro da tela, e a medida saía
     com a posição anterior à rolagem. Assim a classe e o offset já
     estão certos quando o painel abre — por mouse, teclado ou
     qualquer outro caminho.                                       */
  function reavaliar() {
    if (grade) {
      var g = grade.getBoundingClientRect();
      if (g.bottom < -400 || g.top > window.innerHeight + 400) return;
    }
    for (var i = 0; i < cards.length; i++) {
      var pop = paineis[i];
      if (!pop) continue;

      /* vertical: cabe acima do card, ou abre para baixo? */
      var topo = cards[i].getBoundingClientRect().top;
      pop.classList.toggle('is-below', topo < pop.offsetHeight + 96);

      /* horizontal: em repouso o painel também não pode vazar */
      if (!cards[i].matches(':hover')) {
        cards[i].style.setProperty('--pop-x', travar(0, limites(cards[i], pop)).toFixed(1) + 'px');
      }
    }
  }

  var aguardando = false;
  function agendar() {
    if (aguardando) return;
    aguardando = true;
    window.requestAnimationFrame(function () { aguardando = false; reavaliar(); });
  }

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reavaliar);
  reavaliar();

  /* ── O painel acompanha o cursor ─────────────────────────────── */
  cards.forEach(function (card, i) {
    var pop = paineis[i];
    if (!pop) return;

    var pendente = false;
    var alvoX = 0;

    function aplicar() {
      pendente = false;
      card.style.setProperty('--pop-x', alvoX.toFixed(1) + 'px');
    }

    card.addEventListener('mousemove', function (ev) {
      var r = card.getBoundingClientRect();
      var doCentro = (ev.clientX - r.left - r.width / 2) / 2;
      alvoX = Math.max(Math.min(doCentro, LIMITE), -LIMITE);
      alvoX = travar(alvoX, limites(card, pop));
      if (!pendente) { pendente = true; window.requestAnimationFrame(aplicar); }
    }, { passive: true });

    /* Ao sair, e ao chegar por teclado (onde não há cursor), o
       painel volta à posição de repouso já travada. */
    function repousar() {
      card.style.setProperty('--pop-x', travar(0, limites(card, pop)).toFixed(1) + 'px');
    }
    card.addEventListener('mouseleave', repousar);
    card.addEventListener('focus', repousar);
  });
})();
