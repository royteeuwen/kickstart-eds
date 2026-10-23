/**
 * key-steps — centred step grid (canon grid-layout-container of text-image--center items).
 * Reconstructive: rows are classified by content, never by index.
 * - a row holding only a heading → the centred section head
 * - a row with an image → a step (image + caption); consecutive steps share a 2/4-column grid,
 *   the illustration is hidden below 768px
 * - a text-only row → a link item; consecutive link items share a 2-column grid
 * Authored nodes are MOVED; a cell holding only inline content is wrapped in a <p> (nodes moved).
 */

const FLOW = /^(P|H[1-6]|UL|OL|PICTURE|IMG|DIV|PRE|BLOCKQUOTE|TABLE)$/;

function div(className) {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

/* block-level children of a cell; runs of inline nodes are moved into a new <p> */
function cellElements(cell) {
  const out = [];
  let run = null;
  [...cell.childNodes].forEach((node) => {
    const isEl = node.nodeType === Node.ELEMENT_NODE;
    if (isEl && FLOW.test(node.tagName)) {
      out.push(node);
      run = null;
      return;
    }
    if (!isEl && !node.textContent.trim()) {
      if (run) run.append(node);
      return;
    }
    if (!run) {
      run = document.createElement('p');
      out.push(run);
    }
    run.append(node);
  });
  return out;
}

function isImageOnly(el) {
  if (el.matches('picture, img')) return true;
  return !!(el.querySelector('picture, img') && !el.textContent.trim());
}

export default function decorate(block) {
  if (block.querySelector(':scope > .key-steps-grid, :scope > .key-steps-head')) return;

  const parts = [];
  let grid = null;
  let gridKind = null;

  [...block.children].forEach((row) => {
    const elements = [...row.children].flatMap(cellElements);
    if (!elements.length) return;

    const media = elements.filter(isImageOnly);
    const rest = elements.filter((el) => !isImageOnly(el));
    const headingOnly = !media.length && rest.every((el) => /^H[1-6]$/.test(el.tagName));

    if (headingOnly) {
      const head = div('key-steps-head chaptertitle');
      head.append(...rest);
      parts.push(head);
      grid = null;
      gridKind = null;
      return;
    }

    const kind = media.length ? 'steps' : 'links';
    if (!grid || gridKind !== kind) {
      if (grid) parts.push(div('key-steps-spacer'));
      grid = div(`key-steps-grid key-steps-grid-${kind}`);
      gridKind = kind;
      parts.push(grid);
    }

    const item = div(`key-steps-item key-steps-item-${kind}`);
    if (media.length) {
      const figure = div('key-steps-image');
      figure.append(...media);
      item.append(figure);
    }
    if (rest.length) {
      const text = div('key-steps-text');
      text.append(...rest);
      item.append(text);
    }
    grid.append(item);
  });

  block.replaceChildren(...parts);
}
