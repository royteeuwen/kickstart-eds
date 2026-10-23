/**
 * list — grid of linked teaser cards (canon .list / .list-rendition--block).
 *
 * Content model: one row per card. Cells are classified by content, in any order:
 * the cell with a picture is the card image; the cell with the heading holds the
 * title (its link makes the whole card a link) and the description (paragraphs or
 * a list). A heading-only default-content block directly above the block in the same
 * section is reabsorbed as the centred section title.
 */

const div = (className) => {
  const el = document.createElement('div');
  el.className = className;
  return el;
};

const isHeading = (el) => /^H[1-6]$/.test(el.tagName);

function absorbHead(block) {
  const wrapper = block.parentElement;
  const prev = wrapper && wrapper.previousElementSibling;
  if (!prev || !prev.classList.contains('default-content-wrapper')) return null;
  const kids = [...prev.children];
  if (!kids.length || !kids.every(isHeading)) return null;
  const head = div('list-head');
  head.append(...kids);
  prev.remove();
  return head;
}

function reveal(items) {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('list-visible');
      io.unobserve(entry.target);
    });
  });
  items.forEach((el) => {
    el.classList.add('list-wow');
    io.observe(el);
  });
}

function buildCard(row) {
  const item = div('list-item');
  // `list-rendition--block`: canon hook kept for the replica unit-geometry contract
  const card = div('list-rendition list-rendition--block');
  let textGroup = div('list-rendition-group');
  const imageGroup = div('list-rendition-group');
  const title = div('list-rendition-title');
  const description = div('list-rendition-description');
  const descriptionInner = document.createElement('div');
  description.append(descriptionInner);
  const image = div('list-rendition-image');
  let href = null;
  let linkTitle = '';

  [...row.children].forEach((cell) => {
    const nodes = [...cell.childNodes];
    nodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && isHeading(node)) {
        const link = node.querySelector('a[href]');
        if (link && !href) {
          href = link.getAttribute('href');
          linkTitle = link.title;
          link.replaceWith(...link.childNodes);
        }
        title.append(node);
      } else if (node.nodeType === Node.ELEMENT_NODE
        && (node.matches('picture, img') || node.querySelector('picture, img'))) {
        image.append(node);
      } else if (node.nodeType === Node.ELEMENT_NODE || node.textContent.trim()) {
        descriptionInner.append(node);
      }
    });
  });

  if (href) {
    // EW6: the heading's href links the text group; the image stays outside the anchor
    const a = document.createElement('a');
    a.className = 'list-rendition-group list-link';
    a.href = href;
    if (linkTitle) a.title = linkTitle;
    textGroup = a;
  }
  textGroup.append(title);
  // whitespace between title and description keeps the link's accessible name readable
  if (descriptionInner.childNodes.length) textGroup.append(' ', description);
  imageGroup.append(image);
  card.append(textGroup, imageGroup);
  item.append(card);
  return item;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .list-body')) return;
  const head = absorbHead(block);
  // <section class="list"> mirrors the canon section (replica units contract: section.list)
  const body = document.createElement('section');
  body.className = 'list-body list';
  const container = div('list-container');
  const row = div('list-row');
  container.append(row);
  body.append(container);

  const items = [...block.children].map(buildCard);
  row.append(...items);
  block.replaceChildren(...[head, body].filter(Boolean));
  reveal(items);
}
