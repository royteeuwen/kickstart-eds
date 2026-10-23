/**
 * page-links — row of image link cards on a full-bleed light band (canon .page-link), with an
 * optional centred page title above the band.
 * Reconstructive: a row holding only a heading → the title; every other row → one card:
 * the image is MOVED into the image slot, the paragraph holding the link into the title slot
 * (card-as-link: the card <a> takes the link's href, the inner anchor is unwrapped), any further
 * content into the description slot.
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

function unwrap(anchor) {
  anchor.replaceWith(...anchor.childNodes);
}

function card(elements) {
  const media = elements.filter(isImageOnly);
  const rest = elements.filter((el) => !isImageOnly(el));
  const titleEl = rest.find((el) => el.querySelector('a[href]') || el.matches('a[href]'))
    || rest.find((el) => /^H[1-6]$/.test(el.tagName))
    || rest[0];

  const col = div('page-links-col');
  const link = document.createElement('a');
  link.className = 'page-link';

  if (media.length) {
    const image = div('page-link-image');
    image.append(...media);
    link.append(image);
  }

  const body = div('page-link-body');
  const title = div('page-link-title');
  if (titleEl) {
    const anchor = titleEl.matches('a[href]') ? titleEl : titleEl.querySelector('a[href]');
    if (anchor) {
      link.href = anchor.getAttribute('href');
      if (anchor.title) link.title = anchor.title;
      if (anchor === titleEl) {
        const p = document.createElement('p');
        p.append(...anchor.childNodes);
        anchor.remove();
        title.append(p);
      } else {
        unwrap(anchor);
        title.append(titleEl);
      }
    } else {
      title.append(titleEl);
    }
  }
  const content = div('page-link-content');
  const description = div('page-link-description');
  rest.filter((el) => el !== titleEl).forEach((el) => {
    el.querySelectorAll('a[href]').forEach(unwrap);
    description.append(el);
  });
  content.append(description);
  body.append(title, content);
  link.append(body);
  col.append(link);
  return col;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .page-links-band')) return;

  const parts = [];
  const inner = div('page-links-inner');

  [...block.children].forEach((row) => {
    const elements = [...row.children].flatMap(cellElements);
    if (!elements.length) return;
    if (elements.every((el) => /^H[1-6]$/.test(el.tagName))) {
      const head = div('page-links-head chaptertitle');
      head.append(...elements);
      parts.push(head);
      return;
    }
    inner.append(card(elements));
  });

  const band = div('page-links-band');
  band.append(inner);
  parts.push(band);
  block.replaceChildren(...parts);
}
