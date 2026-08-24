/* ════════════════════════════════════════════════════════════════
   REVEAL — entradas por scroll, marca-texto e traços desenhados

   O CSS mantém tudo visível por padrão. A classe .js-anim só é
   adicionada aqui, depois de confirmar que o IntersectionObserver
   existe. Se algo falhar, a página aparece inteira em vez de ficar
   em branco — animação nunca é pré-requisito para ler.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SEL = '.reveal, [data-mk], .rule--draw';
  var nodes = Array.prototype.slice.call(document.querySelectorAll(SEL));
  if (!nodes.length) return;

  function mark(el) {
    el.classList.add(el.hasAttribute('data-mk') ? 'is-drawn' : 'is-in');
  }

  /* Sem IntersectionObserver: nada é escondido, nada precisa acontecer. */
  if (!('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('js-anim');

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;
      mark(entries[i].target);
      io.unobserve(entries[i].target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });

  nodes.forEach(function (el) { io.observe(el); });

  /* Rede de segurança: se por qualquer motivo o observer não
     disparar (aba oculta no load, renderizador headless, print),
     tudo é revelado assim mesmo. */
  window.setTimeout(function () {
    nodes.forEach(function (el) {
      if (!el.classList.contains('is-in') && !el.classList.contains('is-drawn')) mark(el);
    });
  }, 2600);

  window.addEventListener('beforeprint', function () { nodes.forEach(mark); });
})();
