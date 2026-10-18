/* saluxly.com — the bar, the phone menu, the language links and the language offer.
   No analytics, no cookies, no third-party scripts, and nothing is ever sent from the page. */
(function () {
  'use strict';
  var CONFIG = window.SALUXLY || {};
  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LANG = doc.documentElement.lang || 'en';
  var STORAGE = 'saluxly-lang';
  var OFFERS = { es: ['Ver en español', 'Seguir en inglés'], pt: ['Ver em português', 'Continuar em inglês'] };

  function remember(lang) {
    try { localStorage.setItem(STORAGE, lang); } catch (e) { /* storage may be unavailable */ }
  }
  function remembered() {
    try { return localStorage.getItem(STORAGE); } catch (e) { return null; }
  }

  // --- The bar shrinks after 80 px.
  var bar = doc.querySelector('[data-bar]');
  function onScroll() {
    if (bar) bar.classList.toggle('scrolled', window.scrollY > 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Phone menu: a full-screen sheet; Esc and any link close it.
  var menuButton = doc.querySelector('[data-menu-button]');
  var menu = doc.querySelector('[data-menu]');
  function setMenu(open) {
    if (!menu || !menuButton) return;
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    doc.body.classList.toggle('menu-open', open);
    if (open) menu.querySelector('a').focus();
  }
  if (menuButton) {
    menuButton.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (event) { if (event.target.closest('a')) setMenu(false); });
    doc.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !menu.hidden) { setMenu(false); menuButton.focus(); } });
  }

  // --- Language links keep the section the reader is in.
  var sections = Array.prototype.slice.call(doc.querySelectorAll('main section[id]'));
  function currentSection() {
    var line = window.scrollY + 120;
    var id = '';
    sections.forEach(function (section) { if (section.offsetTop <= line) id = section.id; });
    return id;
  }
  Array.prototype.forEach.call(doc.querySelectorAll('[data-lang]'), function (link) {
    link.addEventListener('click', function () {
      remember(link.getAttribute('data-lang'));
      var id = currentSection();
      if (id) link.href = link.href.split('#')[0] + '#' + id;
    });
  });

  // --- On the English page, a visitor whose browser speaks Spanish or Portuguese is offered that version once.
  var offer = doc.querySelector('[data-offer]');
  if (offer && LANG === 'en' && !remembered()) {
    var wanted = (navigator.languages || [navigator.language || '']).map(function (l) { return String(l).slice(0, 2).toLowerCase(); })
      .filter(function (l) { return OFFERS[l]; })[0];
    if (wanted) {
      var link = offer.querySelector('[data-offer-link]');
      var dismiss = offer.querySelector('[data-offer-dismiss]');
      link.textContent = OFFERS[wanted][0];
      link.href = '/' + wanted + '/' + (location.hash || '');
      link.hreflang = wanted;
      link.lang = wanted;
      dismiss.textContent = OFFERS[wanted][1];
      dismiss.lang = wanted;
      offer.hidden = false;
      link.addEventListener('click', function () { remember(wanted); var id = currentSection(); if (id) link.href = '/' + wanted + '/#' + id; });
      dismiss.addEventListener('click', function () { remember('en'); offer.hidden = true; });
    }
  }

  // --- Smooth scrolling to anchors is CSS; with reduced motion it is instant (also CSS). Nothing to do here.
  void reduceMotion;
})();
