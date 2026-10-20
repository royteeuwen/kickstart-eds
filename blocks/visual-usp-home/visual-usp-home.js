/**
 * visual-usp-home — app highlight: product image on a light band + title, checkmark list and CTA
 * (canon .visual-usp-home). Template-slotted: the image-only cell fills the image slot; the
 * heading, rich text (lists render as green checkmarks) and CTAs are MOVED into the content slot.
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
  if (block.querySelector(':scope > .visual-usp-home-inner')) return;

  const elements = cellElements(block);

  const inner = div('visual-usp-home-inner');
  const image = div('visual-usp-home-image');
  const content = div('visual-usp-home-content');
  let cta = null;
  let text = null;

  elements.forEach((el) => {
    if (isImageOnly(el)) {
      image.append(el);
      return;
    }
    if (/^H[1-6]$/.test(el.tagName)) {
      const title = div('visual-usp-home-title');
      title.append(el);
      content.append(title);
      cta = null;
      text = null;
      return;
    }
    if (el.matches('p.button-wrapper')) {
      if (!cta) {
        cta = div('visual-usp-home-cta');
        content.append(cta);
      }
      cta.append(el);
      text = null;
      return;
    }
    if (!text) {
      const wrap = div('visual-usp-home-text');
      text = div('aem-rich-text aem-rich-text-bullet-checkmark-green');
      wrap.append(text);
      content.append(wrap);
    }
    text.append(el);
    cta = null;
  });

  inner.append(image, content);
  block.replaceChildren(inner);
}
