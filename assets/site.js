/* saluxly.com — the bar, the phone menu, the language links, the waitlist forms and the bottom bar.
   No analytics, no cookies, no third-party scripts. The only request leaves when a reader sends the form. */
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

  // --- The waitlist forms (hero and final) share one state: success in one shows in both.
  var forms = Array.prototype.slice.call(doc.querySelectorAll('[data-waitlist]'));
  var waitlist = CONFIG.waitlist || {};
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function message(form, kind) {
    var msg = form.querySelector('.form-msg');
    msg.textContent = kind ? msg.getAttribute('data-' + kind) : '';
    msg.classList.toggle('is-error', kind === 'invalid' || kind === 'error');
  }
  function busy(form, on) {
    var button = form.querySelector('button[type=submit]');
    button.disabled = on;
    button.textContent = button.getAttribute(on ? 'data-busy' : 'data-label');
  }
  function done() {
    forms.forEach(function (form) {
      form.classList.add('is-done');
      message(form, '');
      var note = doc.createElement('p');
      note.className = 'form-done';
      note.setAttribute('role', 'status');
      note.textContent = form.querySelector('.form-msg').getAttribute('data-success');
      form.appendChild(note);
    });
    var bottomBar = doc.querySelector('[data-bottom-bar]');
    if (bottomBar) { bottomBar.hidden = true; doc.body.classList.remove('has-bottom-bar'); }
    doc.body.classList.add('waitlist-done');
  }

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[type=email]');
      var email = input.value.trim();
      if (!EMAIL.test(email)) { message(form, 'invalid'); input.focus(); return; }
      var trap = form.querySelector('input[name=' + (waitlist.honeypot || 'website') + ']');
      if (trap && trap.value) { done(); return; }   // a bot filled the hidden field: say nothing, send nothing
      message(form, '');
      busy(form, true);
      var body = { email: email, lang: LANG, page: location.pathname };
      Object.keys(waitlist.fields || {}).forEach(function (key) { body[key] = waitlist.fields[key]; });
      fetch(waitlist.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body) })
        .then(function (response) { if (!response.ok) throw new Error(String(response.status)); done(); })
        .catch(function () { busy(form, false); message(form, 'error'); });
    });
    form.querySelector('input[type=email]').addEventListener('input', function () { message(form, ''); });
  });

  // --- Phone: a fixed "Join the waitlist" bar when neither form is on screen.
  var bottom = doc.querySelector('[data-bottom-bar]');
  if (bottom && forms.length && 'IntersectionObserver' in window) {
    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });
      var anyVisible = forms.some(function (form) { return visible[form.id]; });
      var show = !anyVisible && !doc.body.classList.contains('waitlist-done') && window.scrollY > 200;
      bottom.hidden = !show;
      doc.body.classList.toggle('has-bottom-bar', show);
    }, { threshold: 0.2 });
    forms.forEach(function (form) { observer.observe(form); });
    window.addEventListener('scroll', function () {
      if (doc.body.classList.contains('waitlist-done')) return;
      var anyVisible = forms.some(function (form) { return visible[form.id]; });
      var show = !anyVisible && window.scrollY > 200;
      if (bottom.hidden === show) { bottom.hidden = !show; doc.body.classList.toggle('has-bottom-bar', show); }
    }, { passive: true });
  }

  // --- Smooth scrolling to anchors is CSS; with reduced motion it is instant (also CSS). Nothing to do here.
  void reduceMotion;
})();
