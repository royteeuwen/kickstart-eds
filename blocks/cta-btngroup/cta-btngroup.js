/**
 * cta-btngroup — a row of call-to-action buttons (canon .aem-cta-btngroup).
 * Template-slotted: every authored element of every cell is MOVED, in order, into its own
 * item wrapper; CTAs move as their <p>. Formatting decides the look (scripts.js
 * decorateButtons): **link** = primary fill, _link_ = secondary outline, **_link_** = accent,
 * a plain link = tertiary (underlined text button).
 * Stacked and centred (279px) under 768px, a left-aligned row from 768px.
 */

/* a lone CTA paragraph is unwrapped by the delivery pipeline (the cell holds the bare
   <strong><a>), so scripts.js never buttonizes it: re-wrap the moved inline nodes in a <p> and
   apply the same formatting → button mapping (decorateButtons) */
function buttonize(p) {
  const a = p.querySelector('a[href]');
  if (!a || p.textContent.trim() !== a.textContent.trim()) return;
  const strong = a.closest('strong');
  const em = a.closest('em');
  if (!strong && !em) return;
  p.className = 'button-wrapper';
  a.classList.add('button');
  if (strong && em) {
    a.classList.add('accent');
    (strong.contains(em) ? strong : em).replaceWith(a);
  } else if (strong) {
    a.classList.add('primary');
    strong.replaceWith(a);
  } else {
    a.classList.add('secondary');
    em.replaceWith(a);
  }
}

function cellElements(block) {
  return [...block.querySelectorAll(':scope > div > div')].flatMap((cell) => {
    const kids = [...cell.children];
    const inline = [...cell.childNodes]
      .some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim())
      || (kids.length && kids.every((k) => /^(STRONG|EM|A)$/.test(k.tagName)));
    if (!inline && kids.length) return kids;
    if (!cell.textContent.trim()) return [];
    if (!cell.querySelector('a[href]')) return [cell];
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    buttonize(p);
    return [p];
  });
}

export default function decorate(block) {
  if (block.querySelector(':scope > .cta-btngroup-list')) return;

  const list = document.createElement('div');
  list.className = 'cta-btngroup-list';
  cellElements(block).forEach((el) => {
    const item = document.createElement('div');
    item.className = 'cta-btngroup-item';
    item.append(el);
    list.append(item);
  });
  block.replaceChildren(list);
}
