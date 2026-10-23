/**
 * introduction-block — product page intro (canon .introduction-block, content-oriented variant):
 * a rounded image with a legal ribbon beside the product title, tagline, price, checklist, CTA
 * and warning notes.
 *
 * Content model (template-slotted, roles by content, never by row index):
 * - image cell: the picture (image slot) and, optionally, a short paragraph (the legal ribbon);
 * - content cell(s): heading → title; the first paragraph after it → tagline; the next plain
 *   paragraph → price; the first list before the CTA → checkmark list; a CTA paragraph → CTA;
 *   everything after the CTA (lists, paragraphs) → warning notes; anything else → text.
 * Every authored element is MOVED into its slot in authored order.
 *
 * The program template's page grid (the 8/10-column flow below the intro) lives in
 * introduction-block.css: the program template has no foundation layout of its own.
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

function hasImage(cell) {
  return !!cell.querySelector('picture, img');
}

/* cell content in authored order; a cell holding only inline content (the pipeline unwraps a
   lone paragraph) is moved as a whole */
function elementsOf(cell) {
  const inline = [...cell.childNodes]
    .some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  const kids = [...cell.children];
  if (!inline && kids.length) return kids;
  return cell.textContent.trim() || cell.querySelector('img') ? [cell] : [];
}

function isCta(el) {
  if (el.classList.contains('button-wrapper')) return true;
  if (el.tagName !== 'P') return false;
  const a = el.querySelector('a');
  return !!a && el.textContent.trim() === a.textContent.trim()
    && !!a.closest('strong, em');
}

function roleOf(el, state) {
  if (/^H[1-6]$/.test(el.tagName)) return 'title';
  if (isCta(el)) return 'cta';
  if (state.afterCta) return 'warning';
  if (/^(UL|OL)$/.test(el.tagName)) return state.list ? 'text' : 'checklist';
  if (el.tagName === 'P' || el.tagName === 'DIV') {
    if (state.prev === 'title') return 'tagline';
    if (state.prev === 'tagline' && !state.price) return 'price';
  }
  return 'text';
}

function slotFor(role, content, state) {
  // consecutive warning elements share one notes slot
  if (role === 'warning' && state.notes) return state.notes;
  const slot = div(`introduction-block-col introduction-block-${role}`);
  if (role === 'checklist') {
    slot.classList.add('aem-rich-text', 'aem-rich-text-bullet-checkmark-green');
  }
  if (role === 'warning') state.notes = slot;
  content.append(slot);
  return slot;
}

export default function decorate(block) {
  if (block.querySelector(':scope > :is(.introduction-block-media, .introduction-block-content)')) {
    return;
  }

  const media = div('introduction-block-media');
  const content = div('introduction-block-content');
  const parsys = div('introduction-block-parsys');
  content.append(parsys);
  const state = {
    prev: null, afterCta: false, list: false, price: false, notes: null,
  };

  const cells = [...block.querySelectorAll(':scope > div > div')];
  cells.forEach((cell) => {
    const imageCell = hasImage(cell);
    elementsOf(cell).forEach((el) => {
      if (isImageOnly(el)) {
        const figure = div('introduction-block-image');
        figure.append(el);
        figure.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; });
        media.append(figure);
        return;
      }
      if (imageCell) {
        const legal = div('introduction-block-legal');
        legal.append(el);
        media.append(legal);
        return;
      }
      const role = roleOf(el, state);
      state.prev = role;
      if (role === 'cta') state.afterCta = true;
      if (role === 'checklist') state.list = true;
      if (role === 'price') state.price = true;
      slotFor(role, parsys, state).append(el);
    });
  });

  const parts = [];
  if (media.children.length) parts.push(media);
  parts.push(content);
  block.replaceChildren(...parts);
}
