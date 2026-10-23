/**
 * breadcrumb — page trail between the header and the page content (canon .breadcrumb-cmp).
 *
 * Content model: one cell with a list; each item is a link, the last item (the current
 * page) is plain text. Under 576px only the parent item is shown, with a back chevron
 * (a presentational clone of that item).
 * Variant `current`: the last item is the current page even when it is linked (a top-level
 * process page whose only crumb is Home): on desktop its anchor is unwrapped (text MOVED into
 * the item), the mobile back link is the presentational clone taken before.
 */

const SEPARATOR = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"'
  + ' class="breadcrumb-separator" viewBox="0 0 24 24" width="16" height="16">'
  + '<g transform="translate(2.4 2.4) scale(0.8)"><path fill="none" stroke-linecap="round"'
  + ' stroke-linejoin="round" stroke-width="1.3" d="M8.8 18l6.4-6-6.4-6"/></g></svg>';

function separator() {
  const tpl = document.createElement('template');
  tpl.innerHTML = SEPARATOR;
  return tpl.content.firstElementChild;
}

function stripInstrumentation(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return node;
  [node, ...node.querySelectorAll('*')].forEach((el) => {
    [...el.attributes].forEach(({ name }) => {
      if (name === 'id' || name === 'data-prose-index' || name.startsWith('data-aue-')
        || name.startsWith('data-richtext')) el.removeAttribute(name);
    });
  });
  return node;
}

export default function decorate(block) {
  if (block.querySelector(':scope > nav')) return;
  const list = block.querySelector('ul, ol');
  if (!list) return;
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'U bent hier');
  nav.className = 'breadcrumb-nav';

  const items = [...list.children];
  const lastLinked = block.classList.contains('current') ? items[items.length - 1] : null;
  const lastClone = lastLinked?.querySelector('a')
    ? stripInstrumentation(lastLinked.cloneNode(true)) : null;
  if (lastClone) {
    const a = lastLinked.querySelector('a');
    a.replaceWith(...a.childNodes);
  }
  items.forEach((li, i) => {
    li.classList.add('breadcrumb-crumb');
    if (i > 0) li.prepend(separator());
    if (i === items.length - 1 && !li.querySelector('a')) {
      li.classList.add('breadcrumb-crumb-last');
      li.setAttribute('aria-current', 'page');
    }
  });

  const crumbs = document.createElement('div');
  crumbs.className = 'breadcrumb-crumbs';
  crumbs.append(list);
  nav.append(crumbs);

  // mobile (< 576px): the parent page only, chevron pointing back
  const linked = items.filter((li) => li.querySelector('a'));
  const parent = linked[linked.length - 1];
  if (parent || lastClone) {
    const mobile = document.createElement('ul');
    mobile.className = 'breadcrumb-crumbs-mobile';
    const clone = parent ? stripInstrumentation(parent.cloneNode(true)) : lastClone;
    clone.classList.add('breadcrumb-crumb');
    if (!clone.querySelector('.breadcrumb-separator')) clone.prepend(separator());
    mobile.append(clone);
    nav.append(mobile);
  }

  block.replaceChildren(nav);
}
