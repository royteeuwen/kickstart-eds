/**
 * visual-usp — large image with an overlapping white content panel (canon .visual-usp).
 * Template-slotted: the image-only cell fills the image slot; headings, text and CTAs are MOVED
 * into the content panel in authored order (CTAs grouped). Variants: `right` (default, image on
 * the right) and `left`.
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
  if (block.querySelector(':scope > .visual-usp-content')) return;
  if (!block.classList.contains('left')) block.classList.add('right');

  const elements = cellElements(block);

  const image = div('visual-usp-image');
  const content = div('visual-usp-content');
  let group = null;
  let text = null;

  elements.forEach((el) => {
    if (isImageOnly(el)) {
      image.append(el);
      return;
    }
    if (/^H[1-6]$/.test(el.tagName)) {
      const title = div('chaptertitle');
      title.append(el);
      content.append(title);
      group = null;
      text = null;
      return;
    }
    if (el.matches('p.button-wrapper')) {
      if (!group) {
        group = div('visual-usp-buttons aem-cta-btngroup');
        content.append(group);
      }
      group.append(el);
      text = null;
      return;
    }
    if (!text) {
      text = div('visual-usp-text');
      content.append(text);
    }
    text.append(el);
    group = null;
  });

  block.replaceChildren(image, content);
}
