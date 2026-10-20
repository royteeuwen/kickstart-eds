/**
 * more-services — titled grid of action-list columns (canon .more-services + .aem-action-list).
 * Reconstructive: columns are segmented on the most frequent heading level; anything before the
 * first column heading is the block head (centred chapter title). Per column: the heading, every
 * list becomes an action list (links get a chevron), a paragraph holding only a link becomes the
 * "more info" link, anything else is kept in order.
 */

const CHEVRON = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" ',
  'aria-hidden="true"><g transform="translate(2.4 2.4) scale(0.8)"><path fill="none" ',
  'stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3" ',
  'd="M8.8 18l6.4-6-6.4-6"/></g></svg>',
].join('');

function div(className) {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

const isHeading = (el) => /^H[1-6]$/.test(el.tagName);

function segmentTag(elements) {
  const counts = {};
  elements.filter(isHeading).forEach((h) => {
    counts[h.tagName] = (counts[h.tagName] || 0) + 1;
  });
  const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || b.localeCompare(a));
  return tags[0];
}

function decorateList(ul) {
  ul.querySelectorAll(':scope > li > a').forEach((a) => {
    if (a.querySelector('.more-services-icon')) return;
    const icon = document.createElement('span');
    icon.className = 'more-services-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = CHEVRON;
    a.append(icon);
  });
}

/* cell content in authored order; a cell holding only inline content (the pipeline unwraps a
   lone paragraph) is moved as a whole */
function cellElements(block) {
  return [...block.querySelectorAll(':scope > div > div')].flatMap((cell) => {
    const inline = [...cell.childNodes]
      .some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    const kids = [...cell.children];
    const flow = kids.every((k) => /^(P|H[1-6]|UL|OL|PICTURE|IMG|DIV|PRE|BLOCKQUOTE|TABLE)$/
      .test(k.tagName));
    if (!inline && kids.length && flow) return kids;
    return cell.textContent.trim() || cell.querySelector('img') ? [cell] : [];
  });
}

export default function decorate(block) {
  if (block.querySelector(':scope > .more-services-grid')) return;

  const elements = cellElements(block);
  const tag = segmentTag(elements);

  const head = div('more-services-head');
  const grid = div('more-services-grid');
  let column = null;
  let list = null;

  elements.forEach((el) => {
    if (el.tagName === tag) {
      column = div('more-services-column');
      const title = div('chaptertitle chaptertitle-condensed');
      title.append(el);
      list = div('aem-action-list');
      column.append(title, list);
      grid.append(column);
      return;
    }
    if (!column) {
      const title = div('chaptertitle');
      title.append(el);
      head.append(title);
      return;
    }
    if (el.matches('ul, ol')) decorateList(el);
    const onlyLink = el.tagName === 'P' && el.children.length === 1
      && el.firstElementChild.tagName === 'A'
      && el.textContent.trim() === el.firstElementChild.textContent.trim();
    if (onlyLink) {
      const more = div('more-services-more');
      more.append(el);
      list.append(more);
      return;
    }
    list.append(el);
  });

  const parts = [];
  if (head.children.length) parts.push(head);
  parts.push(grid);
  block.replaceChildren(...parts);
}
