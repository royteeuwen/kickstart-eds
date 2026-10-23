/**
 * process-page — process / application start page composition (canon .process-page).
 * Template-slotted: an image-only cell fills the media column; the other cells fill the content
 * column, one role wrapper per authored element (heading → title, first paragraph after it →
 * intro (directly after it), list → checkmark list, anything else → text), MOVED in authored order.
 * The blocks and default content that follow in the same section (process title, cta-btngroup,
 * quick-response, legal text) continue the content column: the section layout lives in
 * process-page.css under the section class `.process-page-container`.
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
    if (!inline && kids.length) return kids;
    return cell.textContent.trim() || cell.querySelector('img') ? [cell] : [];
  });
}

function roleOf(el, state) {
  if (/^H[1-6]$/.test(el.tagName)) return 'title';
  if (/^(UL|OL)$/.test(el.tagName)) return 'list';
  if (el.tagName === 'P' && state.prev === 'title'
    && !el.classList.contains('button-wrapper')) return 'intro';
  return 'text';
}

export default function decorate(block) {
  if (block.querySelector(':scope > :is(.process-page-media, .process-page-content)')) return;

  const media = div('process-page-media');
  const content = div('process-page-content');
  const state = { prev: null };

  cellElements(block).forEach((el) => {
    if (isImageOnly(el)) {
      const figure = div('process-page-image');
      figure.append(el);
      media.append(figure);
      return;
    }
    const role = roleOf(el, state);
    state.prev = role;
    const slot = div(`process-page-${role}`);
    if (role === 'list') slot.classList.add('aem-rich-text', 'aem-rich-text-bullet-checkmark-green');
    slot.append(el);
    content.append(slot);
  });

  const parts = [];
  if (media.children.length) parts.push(media);
  if (content.children.length) parts.push(content);
  block.replaceChildren(...parts);
}
