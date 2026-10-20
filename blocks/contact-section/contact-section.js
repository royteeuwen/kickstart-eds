/**
 * contact-section — titled group of contact cards (canon .contact-section / .contact-block).
 * Reconstructive: a row holding only headings is the section head (centred chapter title);
 * every other row is one card. Per card, by content: an icon (:icon-name:, served from this
 * block's icons/ folder) → icon slot; the card heading (or, without one, the first paragraph)
 * → title; the paragraph right after it → subtitle; CTAs (formatted links) → button slot;
 * everything else → checkmark rich text.
 */

function div(className) {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

const isCardHeading = (el) => /^H[1-6]$/.test(el.tagName);

function decorateIcon(el) {
  el.querySelectorAll('img[data-icon-name]').forEach((img) => {
    const { iconName } = img.dataset;
    const base = window.hlx?.codeBasePath || '';
    img.src = `${base}/blocks/contact-section/icons/${iconName}.svg`;
    img.width = 48;
    img.height = 48;
  });
}

function buildCard(elements) {
  const card = div('contact-section-card');
  const icon = div('contact-section-icon');
  icon.setAttribute('aria-hidden', 'true');
  const body = div('contact-section-body');
  const title = div('contact-section-title');
  const subtitle = div('contact-section-subtitle');
  const text = div('aem-rich-text aem-rich-text-bullet-checkmark-green');
  const textWrap = div('contact-section-text');
  textWrap.append(text);
  const cta = div('contact-section-cta');

  const hasHeading = elements.some(isCardHeading);
  const isTitle = (el) => (hasHeading ? isCardHeading(el) : el.tagName === 'P'
    && !el.matches('.button-wrapper') && !text.children.length);

  elements.forEach((el) => {
    if (el.querySelector('span.icon') && !el.textContent.trim()) {
      decorateIcon(el);
      icon.append(el);
    } else if (!title.children.length && isTitle(el)) {
      title.append(el);
    } else if (el.tagName === 'P' && title.children.length && !subtitle.children.length
      && !text.children.length && !el.matches('.button-wrapper')) {
      subtitle.append(el);
    } else if (el.matches('p.button-wrapper')) {
      cta.append(el);
    } else {
      text.append(el);
    }
  });

  [title, subtitle, textWrap, cta].forEach((slot) => {
    const empty = slot === textWrap ? !text.children.length : !slot.children.length;
    if (!empty) body.append(slot);
  });
  if (icon.children.length) card.append(icon);
  card.append(body);
  const wrapper = div('contact-section-card-wrapper');
  wrapper.append(card);
  return wrapper;
}

/* cell content in authored order; a cell holding only inline content (the pipeline unwraps a
   lone paragraph) is moved as a whole */
function cellElements(row) {
  return [...row.querySelectorAll(':scope > div')].flatMap((cell) => {
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
  if (block.querySelector(':scope > .contact-section-group')) return;

  const head = div('contact-section-head');
  const group = div('contact-section-group');
  [...block.children].forEach((row) => {
    const elements = cellElements(row);
    const isHead = elements.length
      && elements.every((el) => /^H[1-6]$/.test(el.tagName) && !row.querySelector('span.icon'));
    if (isHead) {
      elements.forEach((el) => {
        const t = div('chaptertitle');
        t.append(el);
        head.append(t);
      });
      return;
    }
    if (elements.length) group.append(buildCard(elements));
  });

  const parts = [];
  if (head.children.length) parts.push(head);
  parts.push(group);
  block.replaceChildren(...parts);
}
