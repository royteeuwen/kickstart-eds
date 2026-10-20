/* KBC replica canon behaviour — only what the live chrome does (lifted from
   websites.main-navigation.min.js + main.min.js headerScroll):
   - desktop mega menus: CLICK toggles (.aem-main-nav__list__item--active,
     .aem-main-nav__block--active, html.aem-submenu-open); outside click / Escape close
   - NL language dropdown + mobile site-switch tile: aria-expanded toggles
   - mobile MENU drawer: html.mobile-navigation-open, .aem-mobile-header--active,
     drill-down tiles (.aem-main-nav__menu-tile--active, wrapper/switches --hidden)
   - ≤991px scroll state: body.header--mobilesticky once scrollTop ≥ .site__header height;
     .brand__row__container--top while scrolling up (>5px steps) */
(function () {
  const html = document.documentElement;
  const LG = window.matchMedia('(max-width: 991px)');

  /* ---- desktop mega menus ---- */
  function closeMega() {
    document.querySelectorAll('.aem-main-nav__list__item--active').forEach((li) => {
      li.classList.remove('aem-main-nav__list__item--active');
      const b = li.querySelector('button[data-target]');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.aem-main-nav__block--active').forEach((blk) => {
      blk.classList.remove('aem-main-nav__block--active');
      blk.setAttribute('aria-hidden', 'true');
    });
    html.classList.remove('aem-submenu-open');
  }
  function openMega(li) {
    const b = li.querySelector('button[data-target]');
    const blk = document.getElementById(b.dataset.target);
    li.classList.add('aem-main-nav__list__item--active');
    b.setAttribute('aria-expanded', 'true');
    blk.classList.add('aem-main-nav__block--active');
    blk.setAttribute('aria-hidden', 'false');
    html.classList.add('aem-submenu-open');
  }

  /* ---- generic aria-expanded dropdowns (language, site-switch tile) ---- */
  function toggleExpanded(btn, force) {
    const open = force !== undefined ? force : btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
  }
  function closeDropdowns(except) {
    document.querySelectorAll('.nav--language__list-item--trigger[aria-expanded="true"], .aem-main-nav__mobile-tile__trigger[aria-expanded="true"]').forEach((b) => {
      if (b !== except) toggleExpanded(b, false);
    });
  }

  /* ---- mobile drawer ---- */
  const wrapper = () => document.querySelector('.aem-main-nav__wrapper');
  const switches = () => document.querySelector('.aem-main-nav__switches');
  function closeTiles() {
    document.querySelectorAll('.aem-main-nav__menu-tile--active').forEach((t) => {
      t.classList.remove('aem-main-nav__menu-tile--active');
      t.setAttribute('aria-hidden', 'true');
    });
    document.querySelectorAll('[data-mobile-tile][aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    if (wrapper()) wrapper().classList.remove('aem-main-nav__wrapper--hidden');
    if (switches()) switches().classList.remove('aem-main-nav__switches--hidden');
  }
  function setDrawer(open) {
    const trigger = document.querySelector('.nav--trigger');
    const head = document.querySelector('.aem-mobile-header');
    if (!trigger || !head) return;
    trigger.setAttribute('aria-expanded', String(open));
    trigger.classList.toggle('active', open);
    head.classList.toggle('aem-mobile-header--active', open);
    html.classList.toggle('mobile-navigation-open', open);
    if (!open) closeTiles();
  }

  document.addEventListener('click', (e) => {
    const t = e.target;
    const megaBtn = t.closest('.aem-main-nav__list__item > button[data-target]');
    if (megaBtn) {
      const li = megaBtn.closest('.aem-main-nav__list__item');
      const wasOpen = li.classList.contains('aem-main-nav__list__item--active');
      closeMega();
      if (!wasOpen) openMega(li);
      return;
    }
    // dropdown triggers stop propagation on live (dropdown-menu.js): an open mega menu stays open
    const dd = t.closest('.nav--language__list-item--trigger, .aem-main-nav__mobile-tile__trigger');
    if (dd) { closeDropdowns(dd); toggleExpanded(dd); return; }
    if (html.classList.contains('aem-submenu-open') && !t.closest('nav.nav--main')) closeMega();
    if (!t.closest('.nav--language__list, .aem-main-nav__mobile-tile__list')) closeDropdowns();

    if (t.closest('.nav--trigger')) { setDrawer(document.querySelector('.nav--trigger').getAttribute('aria-expanded') !== 'true'); return; }
    if (t.closest('[data-mobile-back]')) { closeTiles(); return; }
    const tileBtn = t.closest('button[data-mobile-tile]');
    if (tileBtn) {
      const tile = document.querySelector(`.aem-main-nav__menu-tile[data-mobile-tile-id="${tileBtn.dataset.mobileTile}"]`);
      if (!tile) return;
      tileBtn.setAttribute('aria-expanded', 'true');
      tile.classList.add('aem-main-nav__menu-tile--active');
      tile.setAttribute('aria-hidden', 'false');
      wrapper().classList.add('aem-main-nav__wrapper--hidden');
      switches().classList.add('aem-main-nav__switches--hidden');
      tile.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeMega(); closeDropdowns();
    if (html.classList.contains('mobile-navigation-open')) setDrawer(false);
  });

  /* ---- main-nav hover state (live jQuery .hover(): button.hover + ul.active) ---- */
  document.querySelectorAll('.aem-main-nav__list__item > button').forEach((b) => {
    const ul = b.closest('.aem-main-nav__list');
    b.addEventListener('mouseenter', () => { b.classList.add('hover'); ul.classList.add('active'); });
    b.addEventListener('mouseleave', () => { b.classList.remove('hover'); ul.classList.remove('active'); });
  });

  /* ---- search bar: clear button visibility ---- */
  document.querySelectorAll('.aem-searchbar').forEach((form) => {
    const input = form.querySelector('.aem-searchbar__input');
    const clear = form.querySelector('.aem-searchbar__clear-button');
    if (!input) return;
    input.addEventListener('input', () => form.classList.toggle('aem-searchbar--has-value', input.value.length > 0));
    if (clear) clear.addEventListener('click', () => { input.value = ''; form.classList.remove('aem-searchbar--has-value'); input.focus(); });
  });

  /* ---- ≤991px scroll-state chrome (lifted: jsKbc.headerScroll._mobileStickyFx) ---- */
  let lastScrollTop = 0;
  function stickyFx() {
    const header = document.querySelector('.site__header');
    const bar = document.querySelector('.brand__row__container');
    if (!header || !bar) return;
    if (!LG.matches) { document.body.classList.remove('header--mobilesticky'); bar.classList.remove('brand__row__container--top'); return; }
    const y = window.scrollY;
    if (y < header.offsetHeight) { document.body.classList.remove('header--mobilesticky'); bar.classList.remove('brand__row__container--top'); }
    else document.body.classList.add('header--mobilesticky');
    // direction: scrolling up (and not at the page end) shows the bar shadow state
    if (Math.abs(lastScrollTop - y) > 5) {
      if (y > lastScrollTop) bar.classList.remove('brand__row__container--top');
      else if (y + window.innerHeight < document.documentElement.scrollHeight) bar.classList.add('brand__row__container--top');
      lastScrollTop = y;
    }
  }
  window.addEventListener('scroll', stickyFx, { passive: true });
  window.addEventListener('touchmove', stickyFx, { passive: true });
  LG.addEventListener('change', () => { if (!LG.matches) { setDrawer(false); } stickyFx(); });
  stickyFx();

  /* ---- WOW.js reveal (observed on listing grids: .wow.fadeIn gets .animated +
     animation-name fadeIn, data-wow-delay, when scrolled into view; main.min.js WOW defaults:
     boxClass "wow", animateClass "animated", offset 0, mobile true) ---- */
  const wows = document.querySelectorAll('.wow');
  if (wows.length && 'IntersectionObserver' in window) {
    const show = (el) => {
      const anim = ['fadeIn', 'fadeInLeftSmall'].find((c) => el.classList.contains(c));
      el.style.visibility = 'visible';
      if (el.dataset.wowDelay) el.style.animationDelay = el.dataset.wowDelay;
      if (anim) el.style.animationName = anim;
      el.classList.add('animated');
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    });
    wows.forEach((el) => { el.style.visibility = 'hidden'; el.style.animationName = 'none'; io.observe(el); });
  }
})();
