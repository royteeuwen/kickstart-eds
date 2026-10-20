/**
 * download-list — a list of documents to download (canon .download-container / .download-item).
 *
 * Content model (reconstructive): one row per document, holding its link (a paragraph or bare
 * link); a single cell holding a list of links is read as one document per list item. Each
 * authored element is MOVED into an item next to a decorative document icon; a divider follows
 * every item, as on the source.
 */

const ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24" width="24"'
  + ' aria-hidden="true" focusable="false"><g transform="translate(2.4 2.4) scale(0.8)"'
  + ' fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3">'
  + '<path d="M15 1v6h6"/><path d="M15 1H3v22h18V7l-6-6z"/><path d="M7 7h4"/>'
  + '<path d="M7 12h10"/><path d="M7 17h10"/></g></svg>';

function el(tag, className) {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

function icon() {
  const span = el('span', 'download-list-icon');
  const tpl = document.createElement('template');
  tpl.innerHTML = ICON;
  span.append(tpl.content.firstElementChild);
  return span;
}

/* the authored units, in order: list items of a link list, else each non-empty cell's elements */
function unitsOf(block) {
  const units = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const lists = cell.querySelectorAll(':scope > :is(ul, ol)');
    if (lists.length) {
      lists.forEach((list) => units.push(...[...list.children].map((li) => [...li.childNodes])));
      return;
    }
    const inline = [...cell.childNodes]
      .some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (inline || !cell.children.length) {
      if (cell.textContent.trim()) units.push([...cell.childNodes]);
      return;
    }
    [...cell.children].forEach((child) => {
      if (child.textContent.trim()) units.push([child]);
    });
  });
  return units;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .download-list-items')) return;

  const list = el('ul', 'download-list-items');
  unitsOf(block).forEach((nodes) => {
    const item = el('li', 'download-list-item');
    const text = el('div', 'download-list-text');
    text.append(...nodes);
    item.append(icon(), text);
    const divider = el('li', 'download-list-divider');
    divider.setAttribute('aria-hidden', 'true');
    divider.append(el('div', 'aem-divider'));
    list.append(item, divider);
  });
  block.replaceChildren(list);
}
