/**
 * highlight — bordered call-out with a square icon badge (canon .aem-highlight).
 * Template-slotted: headings are MOVED into a centred chaptertitle, every other element into
 * its own centred text slot, in authored order.
 * Variants pick the decorative badge icon: `clock` (default), `binoculars`.
 */

const FLOW = /^(P|H[1-6]|UL|OL|PICTURE|IMG|DIV|PRE|BLOCKQUOTE|TABLE)$/;

const ICONS = {
  clock: [
    '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" ',
    'viewBox="0 0 24 24"><path d="M5.14,6.17c-1.34,1.57-2.14,3.6-2.14,5.83,0,4.97,4.03,9,9,9s',
    '9-4.03,9-9S16.97,3,12,3v3.42" fill="none" stroke="#000" stroke-linecap="round" ',
    'stroke-linejoin="round"/><line x1="12" y1="12" x2="8.35" y2="8.35" fill="none" ',
    'stroke="#000" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ].join(''),
  binoculars: [
    '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" ',
    'viewBox="0 0 48 48"><g fill="none" stroke="#0D2A50" stroke-width="1.6" ',
    'stroke-linecap="round" stroke-linejoin="round">',
    '<circle cx="35.26" cy="27.01" r="7.74"/>',
    '<path d="M31,27c0-2.33,1.89-4.22,4.22-4.22c0,0,0.01,0,0.01,0l0,0"/>',
    '<path d="M8.3,27c0-2.33,1.89-4.22,4.22-4.22h0"/>',
    '<circle cx="12.74" cy="27.01" r="7.74"/>',
    '<path d="M19.05,22.51l1.6,0.43c2.2,0.59,4.51,0.59,6.71,0l1.6-0.43"/>',
    '<path d="M29,31.53l-1.6-0.43c-2.2-0.59-4.51-0.59-6.71,0l-1.6,0.43"/>',
    '<path d="M24,15.37h-2.69c0,0-1.85-2.13-4.06-2.13c-1.42,0.07-2.77,0.67-3.77,1.69L7.12,21.7"/>',
    '<path d="M24,15.37h2.69c0,0,1.85-2.13,4.06-2.13c1.42,0.07,2.77,0.67,3.77,1.69l6.36,6.77"/>',
    '<line x1="21.31" y1="15.37" x2="20.18" y2="19.27"/>',
    '<line x1="26.76" y1="15.37" x2="27.88" y2="19.27"/>',
    '</g></svg>',
  ].join(''),
};

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

export default function decorate(block) {
  if (block.querySelector(':scope > .highlight-inner')) return;

  const elements = [...block.querySelectorAll(':scope > div > div')].flatMap(cellElements);

  const inner = div('highlight-inner');
  const icon = div('highlight-icon');
  icon.setAttribute('aria-hidden', 'true');
  const name = Object.keys(ICONS).find((key) => block.classList.contains(key)) || 'clock';
  icon.innerHTML = ICONS[name];

  const content = div('highlight-content');
  let title = null;
  elements.forEach((el) => {
    if (/^H[1-6]$/.test(el.tagName)) {
      if (!title) {
        title = div('highlight-title chaptertitle');
        content.append(title);
      }
      title.append(el);
      return;
    }
    title = null;
    const text = div('highlight-text');
    text.append(el);
    content.append(text);
  });

  inner.append(icon, content);
  block.replaceChildren(inner);
}
