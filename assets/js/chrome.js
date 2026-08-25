/* ════════════════════════════════════════════════════════════════
   CHROME — navbar, lâmpada e menu mobile

   Regra do briefing: durante o HERO a página fica limpa. Nem a
   navbar nem a linha inferior aparecem. A entrada é disparada por
   uma sentinela no fim do hero — não pelo primeiro pixel de scroll.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var nav      = document.getElementById('nav');
  var sentinel = document.getElementById('heroSentinel');
  var navLinks = document.getElementById('navLinks');
  var lamp     = document.getElementById('navLamp');
  var burger   = document.getElementById('navBurger');
  var sheet    = document.getElementById('navSheet');

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = String(new Date().getFullYear());

  /* ── 1. A navbar é chamada pelo ponteiro ───────────────────
     Com mouse, a barra não mora na página: fica recolhida acima do
     topo e desce quando o ponteiro entra na faixa dos 72px
     superiores. Sobe de novo quando ele desce — mas nunca com o
     menu aberto (é a barra que carrega o X de fechar) nem com o
     foco do teclado dentro dela.
     O gatilho é o mousemove, não uma div invisível cobrindo o
     topo: uma faixa que captura ponteiro tornaria inclicável tudo
     que passasse por baixo dela.
     Sem ponteiro fino (toque), não existe hover para chamar nada —
     vale a regra antiga: a barra entra depois que o hero termina. */
  var FAIXA = 72;
  var pontoFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var visivel = null;

  function mostrarChrome(sim) {
    sim = !!sim;
    if (sim === visivel) return;
    visivel = sim;
    if (nav) nav.setAttribute('data-hidden', sim ? 'false' : 'true');
    if (!sim) fecharSheet();
  }

  /* Presa: há motivo para a barra ficar, mesmo sem ponteiro nela. */
  function presa() {
    if (sheet && !sheet.hidden) return true;
    return !!(nav && nav.contains(document.activeElement));
  }

  if (pontoFino) {
    mostrarChrome(false);

    document.addEventListener('mousemove', function (ev) {
      if (ev.clientY <= FAIXA) { mostrarChrome(true); return; }
      if (presa()) return;
      if (ev.clientY > (nav ? nav.offsetHeight : 76) + 16) mostrarChrome(false);
    }, { passive: true });

    /* ponteiro saiu da janela pela lateral ou por baixo */
    document.addEventListener('mouseleave', function () {
      if (!presa()) mostrarChrome(false);
    });

    if (nav) {
      nav.addEventListener('focusin', function () { mostrarChrome(true); });
      nav.addEventListener('focusout', function () {
        window.setTimeout(function () { if (!presa()) mostrarChrome(false); }, 0);
      });
    }
  } else if (sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      mostrarChrome(!e.isIntersecting && e.boundingClientRect.top < 0);
    }, { threshold: 0 }).observe(sentinel);
  } else {
    mostrarChrome(true);   /* sem suporte, a navegação continua acessível */
  }

  /* ── 2. Véu e tema da navbar ──────────────────────────────
     O tema segue a seção que contém a LINHA MÉDIA da barra. Testar
     mera interseção não serve: no fim da página a seção clara
     encosta 9px na faixa enquanto o rodapé escuro ocupa o resto, e
     a barra invertia sem motivo. Três leituras de rect por quadro
     é barato e não tem estado para dessincronizar. */
  var claras = Array.prototype.slice.call(document.querySelectorAll('.hero__campo, .cena--sobre, .dif, .cena--cta'));

  function pintarNav() {
    if (!nav) return;
    nav.classList.toggle('is-deep', window.scrollY > window.innerHeight * 1.6);

    var meio = nav.offsetHeight / 2 || 38;
    var claro = false;
    for (var i = 0; i < claras.length; i++) {
      var r = claras[i].getBoundingClientRect();
      if (r.top <= meio && r.bottom > meio) { claro = true; break; }
    }
    nav.classList.toggle('is-light', claro);
  }

  var tickVeu = false;
  function agendarNav() {
    if (tickVeu) return;
    tickVeu = true;
    window.requestAnimationFrame(function () { tickVeu = false; pintarNav(); });
  }

  window.addEventListener('scroll', agendarNav, { passive: true });
  window.addEventListener('resize', agendarNav, { passive: true });
  pintarNav();

  /* ── 3. Scrollspy + lâmpada deslizante ───────────────────── */
  var links = navLinks ? Array.prototype.slice.call(navLinks.querySelectorAll('.nav__link')) : [];

  function moverLampada(link) {
    if (!lamp || !navLinks) return;
    /* .nav__links some no mobile: sem caixa, sem lâmpada. */
    if (!link || !navLinks.offsetParent || !link.offsetWidth) {
      lamp.classList.remove('is-on');
      return;
    }
    lamp.style.setProperty('--lamp-x', link.offsetLeft + 'px');
    lamp.style.setProperty('--lamp-w', link.offsetWidth + 'px');
    lamp.classList.add('is-on');
  }

  function ativar(id) {
    var alvo = null;
    for (var i = 0; i < links.length; i++) {
      var ok = links[i].getAttribute('data-spy') === id;
      links[i].classList.toggle('is-active', ok);
      links[i].setAttribute('aria-current', ok ? 'true' : 'false');
      if (ok) alvo = links[i];
    }
    moverLampada(alvo);
  }

  var secoes = ['hero', 'areas', 'sobre', 'processo', 'contato']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (secoes.length && 'IntersectionObserver' in window) {
    /* Faixa fina no meio da tela: a seção que a cruza é a ativa.
       Entre uma seção e outra ninguém cruza — e o último ativo
       simplesmente permanece, que é o comportamento desejado. */
    var espiao = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) { ativar(entries[i].target.id); break; }
      }
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    secoes.forEach(function (s) { espiao.observe(s); });
  }

  window.addEventListener('resize', function () {
    var atual = navLinks ? navLinks.querySelector('.nav__link.is-active') : null;
    moverLampada(atual);
  }, { passive: true });

  /* A lâmpada só existe depois que as fontes assentam a largura. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      moverLampada(navLinks ? navLinks.querySelector('.nav__link.is-active') : null);
    });
  }

  /* ── 4. Menu mobile ──────────────────────────────────────── */
  var fechando = null;

  function abrirSheet() {
    if (!sheet || !burger) return;
    window.clearTimeout(fechando);
    sheet.hidden = false;
    document.body.style.overflow = 'hidden';
    if (nav) nav.classList.add('is-menu');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fechar menu');
    window.requestAnimationFrame(function () {
      sheet.classList.add('is-open');
      var primeiro = sheet.querySelector('a');
      if (primeiro) primeiro.focus();
    });
  }

  function fecharSheet(devolverFoco) {
    if (!sheet || !burger || sheet.hidden) return;
    sheet.classList.remove('is-open');
    document.body.style.overflow = '';
    if (nav) nav.classList.remove('is-menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
    if (devolverFoco) burger.focus();
    fechando = window.setTimeout(function () { sheet.hidden = true; }, 420);
  }

  if (burger) {
    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') fecharSheet(true);
      else abrirSheet();
    });
  }

  if (sheet) {
    sheet.addEventListener('click', function (ev) {
      if (ev.target.closest('a')) fecharSheet(false);
    });
  }

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') fecharSheet(true);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 960) fecharSheet(false);
  }, { passive: true });

})();
