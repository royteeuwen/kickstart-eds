/**
 * column-control — side-by-side columns (canon .column-control).
 *
 * Content model: one row, one cell per column (authors may add or drop cells).
 * - A cell holding pictures becomes an image-tile list: each tile is a picture
 *   followed by a heading; a link inside the heading makes the whole tile a link.
 * - Any other cell is a rich-text column: headings become chapter titles, lists
 *   get the green checkmark bullets, formatted links (**link**) become a CTA group.
 * - A heading-only default-content block directly above the block in the same
 *   section is reabsorbed as the centred section title.
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
  const head = div('column-control-head');
  head.append(...kids);
  prev.remove();
  return head;
}

function isButtonP(el) {
  if (el.tagName !== 'P') return false;
  if (el.classList.contains('button-wrapper')) return true;
  const a = el.querySelector('a');
  return !!a && !!el.querySelector('strong a, em a, a.button.primary, a.button.secondary')
    && el.textContent.trim() === a.textContent.trim();
}

function reveal(items) {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('column-control-visible');
      io.unobserve(entry.target);
    });
  });
  items.forEach((el) => {
    el.classList.add('column-control-wow');
    io.observe(el);
  });
}

function buildTiles(cell, parsys) {
  const container = div('column-control-tiles');
  const row = div('column-control-tiles-row');
  container.append(row);
  const items = [];
  const leftovers = [];
  let pendingImage = null;

  [...cell.children].forEach((el) => {
    if (el.querySelector('picture, img') && !isHeading(el)) {
      if (pendingImage) leftovers.push(pendingImage);
      pendingImage = el;
      return;
    }
    if (!isHeading(el)) {
      leftovers.push(el);
      return;
    }
    const item = div('column-control-tile-item');
    // `block--image-tile`: canon hook kept for the replica unit-geometry contract
    const tile = div('column-control-tile block--image-tile');
    const image = div('column-control-tile-image');
    if (pendingImage) image.append(pendingImage);
    pendingImage = null;
    const link = el.querySelector('a[href]');
    let body;
    if (link) {
      // EW6: read the href, unwrap the authored anchor, link the tile body instead
      body = document.createElement('a');
      body.className = 'column-control-tile-body column-control-tile-link';
      body.href = link.getAttribute('href');
      if (link.title) body.title = link.title;
      link.replaceWith(...link.childNodes);
      tile.classList.add('column-control-tile-linked');
    } else {
      body = div('column-control-tile-body');
    }
    body.append(el);
    tile.append(image, body);
    item.append(tile);
    row.append(item);
    items.push(item);
  });
  if (pendingImage) leftovers.push(pendingImage);
  parsys.append(container, ...leftovers);
  reveal(items);
}

function buildRich(cell, parsys) {
  let rich = null;
  let group = null;
  [...cell.children].forEach((el) => {
    if (isHeading(el)) {
      const title = div('column-control-title');
      title.append(el);
      parsys.append(title);
      rich = null;
      group = null;
    } else if (isButtonP(el)) {
      if (!group) {
        const btngroup = div('column-control-btngroup');
        group = div('aem-cta-btngroup column-control-btngroup-stacked');
        btngroup.append(group);
        parsys.append(btngroup);
      }
      group.append(el);
      rich = null;
    } else if (['P', 'UL', 'OL'].includes(el.tagName)) {
      if (!rich) {
        rich = div('aem-rich-text aem-rich-text-bullet-checkmark-green column-control-rich');
        parsys.append(rich);
      }
      rich.append(el);
      group = null;
    } else {
      parsys.append(el);
      rich = null;
      group = null;
    }
  });
}

export default function decorate(block) {
  if (block.querySelector(':scope > .column-control-body')) return;
  const head = absorbHead(block);
  const cells = [...block.children].flatMap((r) => [...r.children]);
  const body = div('column-control-body');
  const row = div(`column-control-row column-control-cols-${cells.length}`);
  body.append(row);

  cells.forEach((cell, i) => {
    const grid = div('column-control-grid');
    let side = '';
    if (i === 0) side = ' column-control-column-left column--left';
    else if (i === cells.length - 1) side = ' column-control-column-right column--right';
    const column = div(`column-control-column${side}`);
    const parsys = div('column-control-parsys');
    if (cell.querySelector('picture, img')) buildTiles(cell, parsys);
    else buildRich(cell, parsys);
    column.append(parsys);
    grid.append(column);
    row.append(grid);
  });

  block.replaceChildren(...[head, body].filter(Boolean));
}
