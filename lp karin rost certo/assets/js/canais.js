/* ════════════════════════════════════════════════════════════════
   PRÉVIA DOS CANAIS — o painel que persegue o ponteiro

   Um painel só, reaproveitado pelas três linhas. Ele não salta para
   a posição do mouse: a cada quadro anda uma fração do caminho que
   falta (interpolação), o que dá o atraso macio e faz a troca entre
   duas linhas virar um deslize, não um corte. A inclinação vem da
   velocidade horizontal residual — quanto mais longe do alvo, mais
   torto ele viaja; parado, ele se endireita sozinho.

   Só existe onde há ponteiro fino. No toque não há hover para
   disparar prévia nenhuma, e o painel é removido do documento.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var pop = document.getElementById('canalPop');
  var canais = Array.prototype.slice.call(document.querySelectorAll('.canal[data-pv]'));
  if (!pop || !canais.length) return;

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    pop.parentNode.removeChild(pop);
    return;
  }

  var suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LERP    = 0.17;   /* fração do caminho percorrida por quadro */
  var OFF_X   = 28;     /* o painel anda ao lado do cursor,        */
  var OFF_Y   = -34;    /* nunca embaixo dele                      */
  var MARGEM  = 14;
  var GIRO_MAX = 6;

  var alvoX = 0, alvoY = 0, x = 0, y = 0, giro = 0;
  var visivel = false, rodando = false, encaixado = false;

  function escrever() {
    pop.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + giro.toFixed(2) + 'deg)';
  }

  function quadro() {
    var k = suave ? LERP : 1;
    x += (alvoX - x) * k;
    y += (alvoY - y) * k;

    var resto = alvoX - x;
    var destinoGiro = suave ? Math.max(-GIRO_MAX, Math.min(GIRO_MAX, resto * 0.14)) : 0;
    giro += (destinoGiro - giro) * 0.14;

    escrever();

    var parado = Math.abs(alvoX - x) < 0.3 && Math.abs(alvoY - y) < 0.3 && Math.abs(giro) < 0.05;
    if (visivel || !parado) {
      window.requestAnimationFrame(quadro);
    } else {
      rodando = false;
    }
  }

  function girar() {
    if (rodando) return;
    rodando = true;
    window.requestAnimationFrame(quadro);
  }

  /* O painel fica à direita do cursor; perto da borda direita ele
     troca de lado, e nunca ultrapassa o topo nem o pé da janela. */
  function mirar(cx, cy) {
    var w = pop.offsetWidth || 328;
    var h = pop.offsetHeight || 220;
    var px = cx + OFF_X;
    if (px + w > window.innerWidth - MARGEM) px = cx - w - OFF_X;
    px = Math.max(MARGEM, px);
    var py = Math.min(Math.max(cy + OFF_Y, MARGEM), window.innerHeight - h - MARGEM);
    alvoX = px;
    alvoY = py;
    /* Primeira mira: o painel nasce onde o cursor está, sem voo de
       canto. Escrito na hora, sem esperar quadro — em aba de fundo,
       ou com rAF estrangulado, ele ainda assim abre no lugar certo. */
    if (!encaixado) { x = px; y = py; giro = 0; encaixado = true; escrever(); }
    girar();
  }

  function abrir(canal) {
    pop.setAttribute('data-pv', canal.getAttribute('data-pv'));
    pop.classList.add('is-on');
    visivel = true;
  }

  function fechar() {
    pop.classList.remove('is-on');
    visivel = false;
    encaixado = false;
    girar();               /* deixa o painel assentar antes de parar o rAF */
  }

  canais.forEach(function (canal) {
    /* abrir ANTES de mirar: enquanto nenhuma prévia está escolhida o
       painel tem altura de padding, e o cálculo que o impede de
       vazar pelo pé da janela usaria a altura errada. */
    canal.addEventListener('mouseenter', function (ev) {
      abrir(canal);
      mirar(ev.clientX, ev.clientY);
    });
    canal.addEventListener('mousemove', function (ev) {
      mirar(ev.clientX, ev.clientY);
    }, { passive: true });
    canal.addEventListener('mouseleave', fechar);

    /* Teclado: sem ponteiro para seguir, o painel encosta na lateral
       direita da própria linha e fica parado ali. */
    canal.addEventListener('focus', function () {
      var r = canal.getBoundingClientRect();
      encaixado = false;
      abrir(canal);
      mirar(Math.min(r.right, window.innerWidth - 40), r.top + r.height / 2 + 34);
    });
    canal.addEventListener('blur', fechar);
  });

  /* Rolar com o painel aberto deixaria a prévia flutuando sobre a
     linha errada — some e espera o próximo movimento. */
  window.addEventListener('scroll', function () { if (visivel) fechar(); }, { passive: true });
})();
