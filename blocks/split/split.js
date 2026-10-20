/**
 * split — two-column row (canon responsivegrid 6/6 of chaptertitle + rich text + CTA group
 * beside a text-image). Template-slotted per cell: an image-only cell becomes the image column,
 * any other cell the text column, where headings are MOVED into a chaptertitle, CTAs
 * (p.button-wrapper) into the button group and every other element into the rich text, in
 * authored order. Columns keep authored order.
 * Variants: `bg-light` (full-bleed light band), `image-center` (centre the image even when it is
 * the second column; default: first column centred, later columns inset left),
 * `image-hide-mobile` (image column hidden below 768px).
 * A button group in the last column sits flush (no bottom margin).
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

function textColumn(elements, last) {
  const col = div('split-col split-col-text');
  let text = null;
  let buttons = null;
  elements.forEach((el) => {
    if (/^H[1-6]$/.test(el.tagName)) {
      const title = div('split-title chaptertitle');
      title.append(el);
      col.append(title);
      text = null;
      buttons = null;
      return;
    }
    if (el.matches('p.button-wrapper')) {
      if (!buttons) {
        const group = div(`split-buttons${last ? ' split-buttons-flush' : ''}`);
        buttons = div('split-buttons-group');
        group.append(buttons);
        col.append(group);
      }
      buttons.append(el);
      text = null;
      return;
    }
    if (!text) {
      text = div('split-text aem-rich-text');
      col.append(text);
    }
    text.append(el);
    buttons = null;
  });
  return col;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .split-inner')) return;

  const cells = [...block.querySelectorAll(':scope > div > div')]
    .map(cellElements)
    .filter((els) => els.length);

  const inner = div('split-inner');
  cells.forEach((elements, index) => {
    const last = index === cells.length - 1;
    if (elements.every(isImageOnly)) {
      const center = index === 0 || block.classList.contains('image-center');
      const col = div('split-col split-col-media');
      const media = div('split-media');
      const figure = div(`split-image split-image-${center ? 'center' : 'left'}`);
      figure.append(...elements);
      media.append(figure);
      col.append(media);
      inner.append(col);
      return;
    }
    inner.append(textColumn(elements, last));
  });

  block.replaceChildren(inner);
}
