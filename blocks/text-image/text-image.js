/**
 * text-image — rich text with an optional image (canon .text-image).
 * Template-slotted: an image-only cell (or element) fills the image slot, everything else is
 * MOVED into the text slot in authored order. Variants are block classes (e.g. `center`,
 * `intro`); page templates style them.
 */

function div(className) {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

function isImageOnly(el) {
  if (el.matches('picture, img')) return true;
  return !!(el.querySelector('picture, img') && !el.textContent.trim());
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
  if (block.querySelector(':scope > :is(.text-image-text, .text-image-image)')) return;

  const elements = cellElements(block);

  const image = div('text-image-image');
  const text = div('text-image-text');
  elements.forEach((el) => {
    if (isImageOnly(el)) image.append(el);
    else text.append(el);
  });

  const parts = [];
  if (image.children.length) parts.push(image);
  if (text.children.length) parts.push(text);
  block.replaceChildren(...parts);
}
