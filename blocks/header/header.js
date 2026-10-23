import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * KBC header — template-slotted from the gated canon (stardust/prototypes, canon.js).
 * Content: the `/nav` document (override with page metadata `nav`). Sections, by
 * section-metadata style (or, unstyled, by content/order):
 *   brand      <p><a href="/particulieren/nl">KBC Particulieren</a></p>
 *   sites      <ul> site switch; the item WITHOUT a link is the active site
 *   tools      <p><a href=search-page>Zoeken...</a></p> <p><a href=contact>Contact</a></p>
 *   languages  <h3>Taalkeuze</h3> <ul><li>NL</li><li><a href title>FR</a></li>…</ul>
 *   menu       one section per mega menu: <h2><a>Label</a></h2> then per column
 *              <h3>title (link or text)</h3> <ul>links</ul> [<p><a>Toon meer</a></p>];
 *              the 4th column of a 4-column menu is the separated one
 *   buttons    **Word klant** (prospects), _Open een zichtrekening_ (clients),
 *              plain link = Aanmelden (KBC Touch)
 * Page metadata: `header-variant` (white | transparent-white | transparent-dark; default
 * by template: landing → transparent-white, article → transparent-dark, else white),
 * `alternate-fr|de|en` (+ `alternate-<lang>-title`) = this page's translations.
 * Behaviour (header contract): click/Enter toggles 7 mega menus, outside click and
 * Escape close; NL language dropdown; ≤991px MENU drawer with drill-down tiles, scroll
 * lock, site-switch tile; ≤991px sticky scroll state.
 * @ew-exempt <h2> menu label in the mega-menu button and drawer — derived clone
 * @ew-exempt all — chrome fragment; mobile drawer tiles are presentational clones
 */

const LG = '(width <= 991px)';
const LANG_NAMES = {
  nl: 'Nederlands', fr: 'Français', de: 'Deutsch', en: 'English',
};
const ICON_CLEAR = '<span class="aem-searchbar-clear-circle"><svg viewBox="0 0 24 24" '
  + 'aria-hidden="true" class="aem-searchbar-clear-icon"><path d="M14,14l-4-4" fill="none" '
  + 'stroke="#000" stroke-linecap="round" stroke-linejoin="round"></path><path d="M10,14l4-4" '
  + 'fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>';
const ICON_SEARCH = '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="21.01" y1="21.01" '
  + 'x2="15.3" y2="15.3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>'
  + '<circle cx="10.2" cy="10.2" r="7.21" stroke-width="1.6" stroke-linecap="round" '
  + 'stroke-linejoin="round"></circle></svg>';
const ICON_CHEVRON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" '
  + 'height="24" aria-hidden="true"><g transform="translate(2.4 2.4) scale(0.8)"><path fill="none" '
  + 'stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3" '
  + 'd="M8.8 18l6.4-6-6.4-6"></path></g></svg>';
const ICON_MENU = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" '
  + 'height="24"><g transform="translate(2.4 2.4) scale(0.8)" stroke-linecap="round" '
  + 'stroke-linejoin="round" stroke-width="1.3" fill="none"><line x1="1" y1="12" x2="23" y2="12">'
  + '</line><line x1="1" y1="5" x2="23" y2="5"></line><line x1="1" y1="19" x2="23" y2="19"></line>'
  + '</g></svg>';
const ICON_CANCEL = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" '
  + 'viewBox="0 0 24 24"><path d="M19.9,4.1,4.1,19.9" fill="none" stroke="#000" '
  + 'stroke-linecap="round" stroke-linejoin="round"></path><path d="M19.9,19.9,4.1,4.1" '
  + 'fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === null || v === undefined || v === false) return;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v === true ? '' : v);
  });
  children.flat().forEach((c) => {
    if (c === null || c === undefined) return;
    node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

/** Presentational clone: drop workspace instrumentation and ids (EW4). */
function stripClone(node) {
  const c = node.cloneNode(true);
  [c, ...c.querySelectorAll('*')].forEach((n) => {
    [...n.attributes].forEach((a) => {
      if (a.name.startsWith('data-') || a.name === 'id') n.removeAttribute(a.name);
    });
  });
  return c;
}

/** The authored link of an element (the element itself or the first descendant anchor). */
const linkOf = (node) => (node && (node.matches('a[href]') ? node : node.querySelector('a[href]')));

/** Drawer tile links carry the source's doubled zone parameter (live parity). */
function tileHref(a) {
  const href = a.getAttribute('href') || '';
  if (/[?&]zone=topnav/.test(href)) a.setAttribute('href', `${href}&zone=topnav`);
  return a;
}

/** Unwraps a decorated button anchor back to a plain link (fragment decorateButtons). */
function plainLink(a) {
  a.className = '';
  a.removeAttribute('title');
  return a;
}

const ROLES = ['brand', 'sites', 'tools', 'languages', 'menu', 'buttons'];

function classifySections(main) {
  const sections = [...main.querySelectorAll(':scope > .section, :scope > div')];
  const out = {
    brand: null, sites: null, tools: null, languages: null, menu: [], buttons: null,
  };
  const queue = ['brand', 'sites', 'tools', 'languages', 'buttons'];
  sections.forEach((s) => {
    let role = ROLES.find((r) => s.classList.contains(r));
    if (!role && s.querySelector('h2')) role = 'menu';
    if (!role && s.querySelector('h3, h4') && s.querySelector('ul')) role = 'languages';
    if (!role && s.querySelector('.button, strong a, em a')) role = 'buttons';
    if (!role) role = queue.find((r) => !out[r]);
    if (role === 'menu') out.menu.push(s);
    else if (role && !out[role]) out[role] = s;
  });
  return out;
}

function headerVariant() {
  const meta = getMetadata('header-variant').toLowerCase();
  const tpl = getMetadata('template').toLowerCase();
  const v = meta || ({ landing: 'transparent-white', article: 'transparent-dark' }[tpl] || 'white');
  if (v === 'transparent-white') return ['header-transparent', 'header-text-white'];
  if (v === 'transparent-dark') return ['header-transparent', 'header-text-primary-dark'];
  return ['header-white', 'header-text-primary-dark'];
}

function searchForm(action, placeholder, id) {
  const input = el('input', {
    class: 'aem-searchbar-input', id, name: 'q', maxlength: '250', type: 'search', placeholder,
  });
  const clear = el('button', {
    class: 'aem-searchbar-clear-button',
    type: 'button',
    'aria-label': 'Maak de zoekbalk leeg',
    html: ICON_CLEAR,
  });
  const submit = el('button', {
    class: 'aem-searchbar-button',
    type: 'submit',
    'aria-label': 'Verzend de zoekopdracht',
    html: ICON_SEARCH,
  });
  const form = el(
    'form',
    {
      class: 'aem-searchbar', action, role: 'search', autocomplete: 'off',
    },
    el(
      'div',
      { class: 'aem-searchbar-wrapper' },
      el('div', { class: 'aem-searchbar-input-wrapper' }, input, clear),
      submit,
    ),
    el('input', { type: 'hidden', name: 'zone', value: 'topnav' }),
  );
  input.addEventListener('input', () => {
    form.classList.toggle('aem-searchbar-has-value', input.value.length > 0);
  });
  clear.addEventListener('click', () => {
    input.value = '';
    form.classList.remove('aem-searchbar-has-value');
    input.focus();
  });
  return form;
}

function downIcons(bold = true, plain = true) {
  const out = [];
  if (plain) out.push(' ', el('i', { class: 'kbc-icon kbc-icon-down', 'aria-hidden': 'true' }));
  if (bold) out.push(' ', el('i', { class: 'kbc-icon kbc-icon-down-bold', 'aria-hidden': 'true' }));
  return out;
}

/** Languages: [{code, label, link|null}] with per-page alternates from metadata. */
function readLanguages(section) {
  if (!section) return { title: null, items: [] };
  const title = section.querySelector('h1, h2, h3, h4, h5, h6');
  const items = [...section.querySelectorAll('li')].map((li) => {
    const a = li.querySelector('a[href]');
    const label = (a || li).textContent.trim();
    const code = label.toLowerCase();
    if (a) {
      const alt = getMetadata(`alternate-${code}`);
      const altTitle = getMetadata(`alternate-${code}-title`);
      if (alt) a.href = alt;
      if (altTitle) a.title = altTitle;
      else if (alt) a.removeAttribute('title');
      if (alt) {
        const tag = el('link', { rel: 'alternate', hreflang: code, href: a.href });
        if (!document.head.querySelector(`link[rel="alternate"][hreflang="${code}"]`)) {
          document.head.append(tag);
        }
      }
    }
    return {
      code, label, link: a, li,
    };
  });
  return { title, items };
}

function buildMegaMenus(menuSections) {
  const list = el('ul', { class: 'aem-main-nav-list' });
  const menus = menuSections.map((section, i) => {
    const n = i + 1;
    const h2 = section.querySelector('h2');
    const titleLink = linkOf(h2);
    const label = (titleLink || h2).textContent;
    // columns: segment on h3
    const columns = [];
    let col = null;
    const nodes = [...section.querySelectorAll('.default-content-wrapper > *, :scope > *')]
      .filter((x) => !x.classList.contains('default-content-wrapper') && x !== h2);
    nodes.forEach((node) => {
      if (node.matches('h3, h4, h5, h6')) {
        col = { title: node, list: null, more: null };
        columns.push(col);
      } else if (node.matches('ul, ol')) {
        if (!col) {
          col = { title: null, list: null, more: null };
          columns.push(col);
        }
        col.list = node;
      } else if (node.matches('p') && linkOf(node) && col) {
        col.more = linkOf(node);
      }
    });
    while (columns.length < 4) columns.push({ title: null, list: null, more: null });
    const real = columns.filter((c) => c.title || c.list).length;

    const titleBox = el('div', { class: 'aem-main-nav-block-title' });
    if (titleLink) titleBox.append(plainLink(titleLink));
    else titleBox.append(...h2.childNodes);
    const cols = el('div', { class: 'aem-main-nav-block-columns' });
    const tileSections = [];
    columns.forEach((c, ci) => {
      const separated = real === 4 && ci === 3;
      const cls = `aem-main-nav-block-columns-column${separated
        ? ' aem-main-nav-block-columns-column-separated' : ''}`;
      const column = el('div', { class: cls });
      const t = el('div', { class: 'aem-main-nav-block-columns-column-title' });
      const tLink = linkOf(c.title);
      if (tLink) t.append(plainLink(tLink));
      else if (c.title) t.append(...c.title.childNodes);
      column.append(t);
      const ul = c.list || el('ul');
      ul.className = 'aem-main-nav-block-columns-column-items';
      [...ul.children].forEach((li) => {
        li.className = 'aem-main-nav-block-columns-column-item';
        const a = linkOf(li);
        if (a) plainLink(a);
      });
      column.append(ul);
      if (c.more) {
        column.append(el('div', {
          class: 'aem-main-nav-block-columns-column-show-more',
        }, plainLink(c.more)));
      }
      cols.append(column);
      if (c.title || c.list) tileSections.push({ title: t, list: ul, more: c.more });
    });
    const block = el('div', {
      class: 'aem-main-nav-block', id: `menu-item-${n}`, 'aria-hidden': 'true',
    }, titleBox, cols);
    const button = el(
      'button',
      {
        type: 'button',
        'data-target': `menu-item-${n}`,
        'aria-controls': `menu-item-${n}`,
        'aria-expanded': 'false',
      },
      el('span', {}, label),
      ...downIcons(true, false),
    );
    list.append(el('li', { class: 'aem-main-nav-list-item' }, button, block));
    return {
      n, label, titleLink, tileSections,
    };
  });
  return { list, menus };
}

function buildTile(menu, backText) {
  const tile = el('div', {
    class: 'aem-main-nav-menu-tile',
    id: `mobile-tile-${menu.n}`,
    'data-mobile-tile-id': `tile-${menu.n}`,
    'aria-hidden': 'true',
    tabindex: '-1',
  });
  tile.append(el(
    'button',
    { type: 'button', class: 'aem-main-nav-menu-tile-breadcrumb', 'data-mobile-back': true },
    el('i', { class: 'fa fa-angle-left', 'aria-hidden': 'true' }),
    el('span', { class: 'aem-main-nav-menu-tile-text' }, backText),
  ));
  if (menu.titleLink) {
    const t = tileHref(stripClone(menu.titleLink));
    t.className = 'aem-main-nav-menu-tile-title-link';
    tile.append(t);
  }
  menu.tileSections.forEach((s, i) => {
    const section = el('div', { class: 'aem-main-nav-menu-tile-section' });
    const tLink = s.title.querySelector('a');
    if (tLink) {
      section.append(el('div', {
        class: `aem-main-nav-menu-tile-section-title${i === 0
          ? ' aem-main-nav-menu-tile-section-title-border' : ''}`,
      }, tileHref(stripClone(tLink))));
    } else {
      section.append(el(
        'h4',
        { class: 'aem-main-nav-menu-tile-section-title' },
        s.title.textContent,
      ));
    }
    const ul = el('ul');
    [...s.list.querySelectorAll('a')].forEach((a) => {
      const c = tileHref(stripClone(a));
      c.className = 'aem-main-nav-menu-tile-text';
      ul.append(el('li', { class: 'aem-main-nav-menu-tile-link' }, c));
    });
    if (s.more) {
      ul.append(el('li', { class: 'aem-main-nav-menu-tile-show-more' }, tileHref(stripClone(s.more))));
    }
    section.append(ul);
    tile.append(section);
  });
  return tile;
}

function buildLangTile(langs, backText) {
  const tile = el('div', {
    class: 'aem-main-nav-menu-tile',
    id: 'mobile-tile-lang',
    'data-mobile-tile-id': 'lang',
    'aria-hidden': 'true',
    tabindex: '-1',
  });
  tile.append(el(
    'button',
    { type: 'button', class: 'aem-main-nav-menu-tile-breadcrumb', 'data-mobile-back': true },
    el('i', { class: 'fa fa-angle-left', 'aria-hidden': 'true' }),
    el('span', { class: 'aem-main-nav-menu-tile-text' }, backText),
  ));
  if (langs.title) {
    tile.append(el('h3', { class: 'aem-main-nav-menu-tile-title' }, langs.title.textContent));
  }
  const ul = el('ul');
  const current = langs.items.find((l) => !l.link);
  const others = langs.items.filter((l) => l.link)
    .map((l) => ({ ...l, name: LANG_NAMES[l.code] || l.label }))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (current) {
    ul.append(el(
      'li',
      { class: 'aem-main-nav-menu-tile-link aem-main-nav-menu-tile-link-active' },
      el('p', { class: 'aem-main-nav-menu-tile-text' }, LANG_NAMES[current.code] || current.label),
    ));
  }
  others.forEach((l) => {
    const a = el('a', {
      class: 'aem-main-nav-menu-tile-text', href: l.link.href, title: l.name,
    }, l.name);
    ul.append(el('li', { class: 'aem-main-nav-menu-tile-link' }, a));
  });
  tile.append(ul);
  return tile;
}

/* ---------- behaviour (canon.js, renamed classes) ---------- */
function closeMega() {
  document.querySelectorAll('.aem-main-nav-list-item-active').forEach((li) => {
    li.classList.remove('aem-main-nav-list-item-active');
    const b = li.querySelector('button[data-target]');
    if (b) b.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.aem-main-nav-block-active').forEach((blk) => {
    blk.classList.remove('aem-main-nav-block-active');
    blk.setAttribute('aria-hidden', 'true');
  });
  document.documentElement.classList.remove('aem-submenu-open');
}

function openMega(li) {
  const b = li.querySelector('button[data-target]');
  const blk = document.getElementById(b.dataset.target);
  li.classList.add('aem-main-nav-list-item-active');
  b.setAttribute('aria-expanded', 'true');
  blk.classList.add('aem-main-nav-block-active');
  blk.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('aem-submenu-open');
}

function toggleExpanded(btn, force) {
  const open = force !== undefined ? force : btn.getAttribute('aria-expanded') !== 'true';
  btn.setAttribute('aria-expanded', String(open));
}

function closeDropdowns(except) {
  const sel = '.nav-language-list-item-trigger[aria-expanded="true"], '
    + '.aem-main-nav-mobile-tile-trigger[aria-expanded="true"]';
  document.querySelectorAll(sel).forEach((b) => {
    if (b !== except) toggleExpanded(b, false);
  });
}

function closeTiles() {
  document.querySelectorAll('.aem-main-nav-menu-tile-active').forEach((t) => {
    t.classList.remove('aem-main-nav-menu-tile-active');
    t.setAttribute('aria-hidden', 'true');
  });
  document.querySelectorAll('[data-mobile-tile][aria-expanded="true"]')
    .forEach((b) => b.setAttribute('aria-expanded', 'false'));
  document.querySelector('.aem-main-nav-wrapper')?.classList.remove('aem-main-nav-wrapper-hidden');
  document.querySelector('.aem-main-nav-switches')
    ?.classList.remove('aem-main-nav-switches-hidden');
}

function setDrawer(open) {
  const trigger = document.querySelector('.nav-trigger');
  const head = document.querySelector('.aem-mobile-header');
  if (!trigger || !head) return;
  trigger.setAttribute('aria-expanded', String(open));
  trigger.classList.toggle('active', open);
  head.classList.toggle('aem-mobile-header-active', open);
  document.documentElement.classList.toggle('mobile-navigation-open', open);
  if (!open) closeTiles();
}

function onClick(e) {
  const t = e.target;
  if (!(t instanceof Element)) return;
  const megaBtn = t.closest('.aem-main-nav-list-item > button[data-target]');
  if (megaBtn) {
    const li = megaBtn.closest('.aem-main-nav-list-item');
    const wasOpen = li.classList.contains('aem-main-nav-list-item-active');
    closeMega();
    if (!wasOpen) openMega(li);
    return;
  }
  const dd = t.closest('.nav-language-list-item-trigger, .aem-main-nav-mobile-tile-trigger');
  if (dd) {
    closeDropdowns(dd);
    toggleExpanded(dd);
    // keyboard open (Enter/Space → click with detail 0) moves focus into the list, as on live
    if (e.detail === 0 && dd.getAttribute('aria-expanded') === 'true') {
      dd.nextElementSibling?.querySelector('a[href]')?.focus();
    }
    return;
  }
  const html = document.documentElement;
  if (html.classList.contains('aem-submenu-open') && !t.closest('nav.nav-main')) closeMega();
  if (!t.closest('.nav-language-list, .aem-main-nav-mobile-tile-list')) closeDropdowns();
  const trigger = t.closest('.nav-trigger');
  if (trigger) {
    setDrawer(trigger.getAttribute('aria-expanded') !== 'true');
    return;
  }
  if (t.closest('[data-mobile-back]')) {
    closeTiles();
    return;
  }
  const tileBtn = t.closest('button[data-mobile-tile]');
  if (tileBtn) {
    const id = tileBtn.dataset.mobileTile;
    const tile = document.querySelector(`.aem-main-nav-menu-tile[data-mobile-tile-id="${id}"]`);
    if (!tile) return;
    tileBtn.setAttribute('aria-expanded', 'true');
    tile.classList.add('aem-main-nav-menu-tile-active');
    tile.setAttribute('aria-hidden', 'false');
    document.querySelector('.aem-main-nav-wrapper').classList.add('aem-main-nav-wrapper-hidden');
    document.querySelector('.aem-main-nav-switches')
      .classList.add('aem-main-nav-switches-hidden');
    tile.focus({ preventScroll: true });
  }
}

function onKey(e) {
  if (e.key !== 'Escape') return;
  closeMega();
  closeDropdowns();
  if (document.documentElement.classList.contains('mobile-navigation-open')) setDrawer(false);
}

let lastScrollTop = 0;
function stickyFx() {
  const header = document.querySelector('.site-header');
  const bar = document.querySelector('.brand-row-container');
  if (!header || !bar) return;
  const { body } = document;
  if (!window.matchMedia(LG).matches) {
    body.classList.remove('header-sticky');
    bar.classList.remove('brand-row-container-top');
    return;
  }
  const y = window.scrollY;
  if (y < header.offsetHeight) {
    body.classList.remove('header-sticky');
    bar.classList.remove('brand-row-container-top');
  } else {
    body.classList.add('header-sticky');
  }
  if (Math.abs(lastScrollTop - y) > 5) {
    if (y > lastScrollTop) bar.classList.remove('brand-row-container-top');
    else if (y + window.innerHeight < document.documentElement.scrollHeight) {
      bar.classList.add('brand-row-container-top');
    }
    lastScrollTop = y;
  }
}

function bindOnce() {
  if (window.kbcHeaderBound) return;
  window.kbcHeaderBound = true;
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);
  window.addEventListener('scroll', stickyFx, { passive: true });
  window.addEventListener('touchmove', stickyFx, { passive: true });
  window.matchMedia(LG).addEventListener('change', (e) => {
    if (!e.matches) setDrawer(false);
    stickyFx();
  });
}

async function logoSvg() {
  try {
    const resp = await fetch(`${window.hlx.codeBasePath}/icons/kbc-logo.svg`);
    if (resp.ok) return (await resp.text()).trim();
  } catch (e) {
    // fall through to an empty logo
  }
  return '';
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const [fragment, svg] = await Promise.all([loadFragment(navPath), logoSvg()]);
  if (!fragment) return;
  const parts = classifySections(fragment);

  // brand
  const brandLink = linkOf(parts.brand) || el('a', { href: '/' });
  const brandLabel = el('span', { class: 'sr-only' }, ...brandLink.childNodes);
  plainLink(brandLink);
  brandLink.className = 'aem-logo';
  brandLink.replaceChildren(brandLabel);
  brandLink.insertAdjacentHTML('beforeend', svg);

  // site switch (desktop bar + mobile tile)
  const siteItems = parts.sites ? [...parts.sites.querySelectorAll('li')] : [];
  const siteSwitch = el('ul', { class: 'site-switch' });
  const mobileSites = el('ul', { class: 'aem-main-nav-mobile-tile-list', id: 'site-switch-list' });
  let activeSite = '';
  siteItems.forEach((li) => {
    const a = li.querySelector('a[href]');
    if (a) {
      const mobile = stripClone(a);
      mobile.className = 'aem-main-nav-mobile-tile-text';
      mobile.href = mobile.href.replace('zone=topnav', 'zone=mobile-menu');
      mobileSites.append(el('li', { class: 'aem-main-nav-mobile-tile-list-item' }, mobile));
      plainLink(a).className = 'site-switch-link';
      li.className = 'site-switch-item';
    } else {
      activeSite = li.textContent.trim();
      const span = el('span', { class: 'site-switch-link' }, ...li.childNodes);
      li.replaceChildren(span);
      li.className = 'site-switch-item site-switch-item-active';
      mobileSites.prepend(el(
        'li',
        { class: 'aem-main-nav-mobile-tile-list-item aem-main-nav-mobile-tile-list-item-active' },
        el('p', {
          class: 'aem-main-nav-mobile-tile-text aem-main-nav-mobile-tile-text-active',
        }, activeSite),
      ));
    }
    siteSwitch.append(li);
  });

  // tools: search + contact
  const toolLinks = parts.tools ? [...parts.tools.querySelectorAll('a[href]')] : [];
  const searchLink = toolLinks.find((a) => /zoek|search/i.test(a.href)) || toolLinks[0];
  const contactLink = toolLinks.find((a) => a !== searchLink);
  const searchAction = searchLink ? searchLink.href : '';
  const searchPlaceholder = searchLink ? searchLink.textContent.trim() : '';
  const links = el('div', { class: 'top-navigation-links' });
  if (contactLink) {
    const label = el('span', {}, ...contactLink.childNodes);
    plainLink(contactLink).className = 'top-navigation-link';
    contactLink.title = label.textContent;
    contactLink.append(
      el('i', { class: 'kbc-icon kbc-icon-phone3', 'aria-hidden': 'true' }),
      ' ',
      label,
    );
    links.append(contactLink);
  }

  // languages
  const langs = readLanguages(parts.languages);
  const current = langs.items.find((l) => !l.link);
  const langList = el('ul', { class: 'nav-language-list', id: 'language-nav-list' });
  langs.items.filter((l) => l.link).forEach((l) => {
    const title = l.link.getAttribute('title');
    const a = plainLink(l.link);
    if (title) a.title = title;
    a.replaceChildren(el('span', {}, ...a.childNodes));
    l.li.className = 'nav-language-list-item';
    l.li.replaceChildren(a);
    langList.append(l.li);
  });
  const langTrigger = el(
    'button',
    {
      type: 'button',
      class: 'nav-language-list-item nav-language-list-item-trigger',
      'aria-expanded': 'false',
      'aria-controls': 'language-nav-list',
    },
    el('span', {}, current ? current.label : ''),
    ...downIcons(),
  );
  const backText = 'Terug naar het menu';

  // mega menus + drawer
  const { list, menus } = buildMegaMenus(parts.menu);
  const drawerMenu = el('ul', { class: 'aem-main-nav-menu' });
  const tiles = el('div', { class: 'aem-main-nav-tiles' });
  menus.forEach((m) => {
    drawerMenu.append(el('li', { class: 'aem-main-nav-menu-item' }, el(
      'button',
      {
        type: 'button',
        class: 'aem-main-nav-menu-link',
        'data-mobile-tile': `tile-${m.n}`,
        'aria-controls': `mobile-tile-${m.n}`,
        'aria-expanded': 'false',
      },
      el('span', { class: 'aem-main-nav-menu-text' }, m.label.trim()),
      el('span', { class: 'aem-main-nav-menu-chevron', html: ICON_CHEVRON }),
    )));
    tiles.append(buildTile(m, backText));
  });
  const langName = current ? (LANG_NAMES[current.code] || current.label) : '';
  if (langs.items.length) {
    drawerMenu.append(el('li', { class: 'aem-main-nav-menu-item' }, el(
      'button',
      {
        type: 'button',
        class: 'aem-main-nav-menu-link',
        'data-mobile-tile': 'lang',
        'aria-controls': 'mobile-tile-lang',
        'aria-expanded': 'false',
      },
      el('span', { class: 'aem-main-nav-menu-text' }, langName),
      el('span', { class: 'aem-main-nav-menu-chevron', html: ICON_CHEVRON }),
    )));
    tiles.append(buildLangTile(langs, backText));
  }

  // buttons
  const btnLinks = parts.buttons ? [...parts.buttons.querySelectorAll('a[href]')] : [];
  const prospects = btnLinks.find((a) => a.classList.contains('primary'));
  const clients = btnLinks.find((a) => a.classList.contains('secondary'));
  const touch = btnLinks.find((a) => a !== prospects && a !== clients);
  const asBtn = (a, cls) => {
    if (!a) return null;
    const text = a.textContent.trim();
    const span = el('span', {}, ...a.childNodes);
    plainLink(a).className = cls;
    if (cls !== 'btn btn-touch visible-on-desktop') a.title = text;
    a.append(span);
    return a;
  };
  const drawerBtn = (a, cls) => {
    if (!a) return;
    const c = stripClone(a);
    c.className = 'aem-main-nav-menu-link';
    c.title = c.textContent.trim();
    c.replaceChildren(el('span', {}, c.textContent.trim()));
    drawerMenu.append(el('li', { class: `aem-main-nav-menu-item-button ${cls}` }, c));
  };
  drawerBtn(clients, 'btn-clients');
  drawerBtn(prospects, 'btn-prospects');
  const buttons = el(
    'div',
    { class: 'site-header-buttons', 'data-visitor': 'prospect' },
    asBtn(prospects, 'btn btn-prospects'),
    asBtn(clients, 'btn btn-clients'),
    touch ? el(
      'span',
      { class: 'homebanking-button-placeholder' },
      asBtn(touch, 'btn btn-touch visible-on-desktop'),
    ) : null,
  );

  // drawer trigger
  const navTrigger = el(
    'button',
    {
      type: 'button',
      class: 'nav-trigger',
      'aria-expanded': 'false',
      'aria-controls': 'main-menu',
      'aria-label': 'sluit',
    },
    el('span', { class: 'aem-menu-text' }, 'MENU'),
    el('span', { class: 'aem-icon-menu', html: ICON_MENU }),
    el('span', { class: 'aem-icon-cancel', html: ICON_CANCEL }),
  );

  const siteHeader = el(
    'div',
    { class: 'site-header' },
    el(
      'div',
      { class: 'top-navigation-container' },
      el(
        'div',
        { class: 'top-navigation top-navigation-with-searchbar' },
        siteSwitch,
        el(
          'div',
          { class: 'top-navigation-items' },
          el(
            'div',
            { class: 'top-navigation-searchbar' },
            searchForm(searchAction, searchPlaceholder, 'search-top'),
          ),
          links,
          el(
            'div',
            { class: 'languagenav nav-language-dropdown' },
            el('div', { class: 'nav-language' }, langTrigger, langList),
          ),
        ),
      ),
    ),
    el(
      'div',
      { class: 'brand-row-container' },
      el('div', { class: 'nav-backdrop' }),
      el(
        'div',
        { class: 'brand-row' },
        el(
          'div',
          { class: 'aem-mobile-header' },
          el('div', { class: 'logo' }, brandLink),
          el(
            'div',
            { class: 'aem-main-nav-mobile-tile' },
            el(
              'button',
              {
                type: 'button',
                class: 'aem-main-nav-mobile-tile-trigger',
                'aria-expanded': 'false',
                'aria-controls': 'site-switch-list',
              },
              el('span', { class: 'aem-main-nav-mobile-tile-text' }, activeSite),
              ...downIcons(),
            ),
            mobileSites,
          ),
          navTrigger,
        ),
        el(
          'div',
          { class: 'brand-grid' },
          el(
            'nav',
            { class: 'nav-main aem-main-nav', id: 'main-menu' },
            list,
            el(
              'div',
              { class: 'aem-main-nav-wrapper', 'data-visitor': 'prospect' },
              el(
                'div',
                { class: 'aem-main-nav-search' },
                searchForm(searchAction, searchPlaceholder, 'search-mobile'),
              ),
              drawerMenu,
            ),
            tiles,
            el('div', { class: 'aem-main-nav-switches' }, el(
              'div',
              { class: 'aem-main-nav-language-switch' },
              el(
                'button',
                {
                  type: 'button',
                  class: 'aem-language-switch-button',
                  'data-mobile-tile': 'lang',
                  'aria-controls': 'mobile-tile-lang',
                  'aria-expanded': 'false',
                },
                el('span', {}, langName),
              ),
            )),
          ),
          buttons,
        ),
      ),
    ),
  );

  block.classList.remove(
    'header-transparent',
    'header-white',
    'header-text-white',
    'header-text-primary-dark',
  );
  block.classList.add(...headerVariant());
  block.replaceChildren(siteHeader);
  bindOnce();
  stickyFx();
}
