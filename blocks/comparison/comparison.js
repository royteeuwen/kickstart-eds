/**
 * comparison — product comparison table (canon .aem-comparison-cmp) with notes.
 *
 * Content model (rows classified by content, never by index):
 * - header row: first cell empty or the mobile filter label (e.g. "Kies een kenmerk"),
 *   one cell per product with its link; a paragraph without a link above the link
 *   (e.g. "Meest gekozen") highlights that product column.
 * - price row: first cell empty, **bold** amount followed by the rest, optional second
 *   paragraph as subtitle.
 * - feature rows: feature name, then one value per product. "ja" renders a check icon,
 *   "inbegrepen" a check mark, "niet inbegrepen" a cross; anything else is text. The
 *   value text stays in the cell for screen readers.
 * - call-to-action row (first cell empty, **links**) and "more info" row (plain links).
 * - single-cell rows: legal notes under the table.
 * At 991px and below the table becomes one card per feature (presentational clones).
 * Variant `phone`: rows are product panels (stamp, heading, amount, description,
 * rich text, links) plus notes; served to phone user agents only (hidden otherwise).
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const FORMATTED = 'strong a, em a, a.button.primary, a.button.secondary, a.button.accent';

/** plain (unformatted) links stay text links even if a runtime marked them as buttons */
function unbutton(scope) {
  scope.querySelectorAll('a.button').forEach((a) => {
    if (a.matches(FORMATTED)) return;
    a.classList.remove('button');
    a.parentElement.classList.remove('button-container', 'button-wrapper');
  });
}

const div = (className) => {
  const el = document.createElement('div');
  if (className) el.className = className;
  return el;
};

const el = (tag, className) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
};

const isHeading = (node) => /^H[1-6]$/.test(node.tagName);
const text = (node) => (node ? node.textContent.replace(/\s+/g, ' ').trim() : '');

function absorbHead(block) {
  const wrapper = block.parentElement;
  const prev = wrapper && wrapper.previousElementSibling;
  if (!prev || !prev.classList.contains('default-content-wrapper')) return null;
  const kids = [...prev.children];
  if (!kids.length || !kids.every(isHeading)) return null;
  const head = div('comparison-head');
  head.append(...kids);
  prev.remove();
  return head;
}

function stripInstrumentation(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return node;
  [node, ...node.querySelectorAll('*')].forEach((n) => {
    [...n.attributes].forEach(({ name }) => {
      if (name === 'id' || name === 'data-prose-index' || name.startsWith('data-aue-')
        || name.startsWith('data-richtext')) n.removeAttribute(name);
    });
  });
  return node;
}

const clone = (node) => stripInstrumentation(node.cloneNode(true));

function icon(kind) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const shapes = kind === 'check'
    ? [['polyline', { points: '4 13.6 8.8 18.4 20 4', 'stroke-width': '1.3' }]]
    : [['path', { d: 'M19.9,4.1,4.1,19.9' }], ['path', { d: 'M19.9,19.9,4.1,4.1' }]];
  shapes.forEach(([tag, attrs]) => {
    const shape = document.createElementNS(SVG_NS, tag);
    Object.entries({
      fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs,
    }).forEach(([k, v]) => shape.setAttribute(k, v));
    svg.append(shape);
  });
  return svg;
}

/** moves every child node of `from` into `to` */
function moveChildren(from, to) {
  to.append(...from.childNodes);
  return to;
}

function cellKind(cell) {
  if (!cell) return 'empty';
  if (!text(cell) && !cell.querySelector('picture, img')) return 'empty';
  return 'content';
}

function classifyRow(row) {
  const cells = [...row.children];
  if (cells.length < 2) {
    return cells[0] && cells[0].querySelector('h1, h2, h3, h4, h5, h6') ? 'panel' : 'note';
  }
  const values = cells.slice(1);
  const first = cells[0];
  const firstEmpty = cellKind(first) === 'empty';
  const links = values.filter((c) => c.querySelector('a[href]'));
  const formatted = values.filter((c) => c.querySelector(FORMATTED));
  if (links.length && formatted.length === links.length && firstEmpty) return 'cta';
  if (links.length === values.length && values.every((c) => {
    const a = c.querySelector('a[href]');
    const label = [...c.querySelectorAll(':scope > p')].filter((p) => !p.querySelector('a'));
    return a && label.length <= 1;
  })) {
    return 'links';
  }
  if (firstEmpty && values.some((c) => c.querySelector('strong, b'))) return 'price';
  return 'feature';
}

function noteBlock(cell) {
  const wrap = div('comparison-note');
  const small = el('small', 'comparison-note-text');
  moveChildren(cell, small);
  wrap.append(small);
  return wrap;
}

/* ---------- desktop table ---------- */

function headerCell(cell, highlighted) {
  const th = el('th');
  if (highlighted) th.classList.add('comparison-highlight');
  const parts = [...cell.childNodes].filter((n) => n.nodeType === 1 || text(n));
  parts.forEach((node) => {
    if (node.nodeType === 1 && node.tagName === 'P' && !node.querySelector('a')) {
      const badge = div('comparison-badge');
      badge.append(node);
      th.append(badge);
    } else {
      const link = div('comparison-header-link');
      link.append(node);
      th.append(link);
    }
  });
  return th;
}

function priceCell(cell) {
  const td = el('td', 'comparison-price');
  const title = div('comparison-price-title');
  const subtitle = div('comparison-price-subtitle');
  const paragraphs = [...cell.children].filter((c) => c.tagName === 'P');
  if (paragraphs.length) {
    const main = paragraphs.find((p) => p.querySelector('strong, b')) || paragraphs[0];
    title.append(main);
    paragraphs.filter((p) => p !== main).forEach((p) => subtitle.append(p));
  } else {
    moveChildren(cell, title);
  }
  const strong = title.querySelector('strong, b');
  if (strong && text(title) === text(strong)) td.classList.add('comparison-price-solo');
  td.append(title, subtitle);
  return td;
}

function valueCell(cell) {
  const td = el('td');
  const value = text(cell).toLowerCase();
  const label = div('comparison-value-label');
  moveChildren(cell, label);
  if (value === 'ja' || value === 'yes' || value === 'oui') {
    td.className = 'comparison-text-cell';
    const glyph = el('span', 'kbc-icon comparison-check-glyph');
    glyph.setAttribute('aria-hidden', 'true');
    label.classList.add('comparison-sr-label');
    td.append(glyph, label);
  } else if (value === 'inbegrepen' || value === 'included') {
    td.className = 'comparison-check-cell';
    label.classList.add('comparison-sr-label');
    td.append(icon('check'), label);
  } else if (value === 'niet inbegrepen' || value === 'not included') {
    td.className = 'comparison-cross-cell';
    label.classList.add('comparison-sr-label');
    td.append(icon('cross'), label);
  } else {
    td.className = 'comparison-text-cell';
    td.append(label);
  }
  return td;
}

function buildTable(groups, highlight) {
  const table = el('table', 'comparison-table');
  const thead = el('thead');
  const tbody = el('tbody');
  const tfoot = el('tfoot');
  const mark = (cellEl, i) => {
    if (highlight.has(i)) cellEl.classList.add('comparison-highlight');
    return cellEl;
  };
  const model = { products: [], prices: [], features: [] };

  groups.forEach(({ kind, row }) => {
    const cells = [...row.children];
    const tr = el('tr');
    const lead = el('th');
    tr.append(lead);
    const values = cells.slice(1);
    if (kind === 'header') {
      values.forEach((c, i) => {
        unbutton(c);
        const th = headerCell(c, highlight.has(i));
        model.products[i] = th;
        tr.append(th);
      });
      thead.append(tr);
    } else if (kind === 'price') {
      values.forEach((c, i) => {
        const td = mark(priceCell(c), i);
        model.prices[i] = td;
        tr.append(td);
      });
      tbody.append(tr);
    } else if (kind === 'feature') {
      lead.className = 'comparison-name-cell';
      const name = div('comparison-name-data');
      moveChildren(cells[0], name);
      lead.append(name);
      const tds = values.map((c, i) => mark(valueCell(c), i));
      tr.append(...tds);
      model.features.push({ name, values: tds });
      tbody.append(tr);
    } else if (kind === 'cta' || kind === 'links') {
      values.forEach((c, i) => {
        const td = mark(el('td', kind === 'cta' ? 'comparison-cta' : 'comparison-more'), i);
        moveChildren(c, td);
        if (kind === 'links') unbutton(td);
        td.querySelectorAll('a[href]').forEach((a) => {
          if (kind === 'cta' && !a.classList.contains('button')) a.classList.add('button', 'primary');
        });
        tr.append(td);
      });
      if (kind === 'links' && !model.more) model.more = tr.querySelector('a[href]');
      tfoot.append(tr);
    }
  });
  if (thead.children.length) table.append(thead);
  table.append(tbody);
  if (tfoot.children.length) table.append(tfoot);
  return { table, model };
}

/* ---------- mobile cards (≤991): presentational clones of the table ---------- */

function productCell(model, i, highlight) {
  const td = el('td');
  const th = model.products[i];
  if (!th) return td;
  const link = th.querySelector('a[href]');
  if (link) {
    const a = clone(link);
    a.className = 'comparison-item-link';
    td.append(a);
  }
  const badge = th.querySelector('.comparison-badge');
  if (highlight.has(i) && badge) {
    const b = div('comparison-item-badge');
    b.append(...[...badge.childNodes].map(clone));
    td.append(b);
  }
  return td;
}

function itemTable(model, highlight, titleNode, valueFor) {
  const table = el('table', 'comparison-item');
  const tbody = el('tbody');
  const header = el('tr', 'comparison-item-header');
  const title = el('th', 'comparison-item-title');
  title.scope = 'col';
  if (titleNode) title.append(clone(titleNode));
  const aside = el('th');
  aside.scope = 'col';
  if (titleNode && model.more) {
    const more = clone(model.more);
    more.className = 'comparison-item-more';
    more.setAttribute('tabindex', '-1');
    aside.append(more);
  }
  header.append(title, aside);
  tbody.append(header);
  model.products.forEach((_, i) => {
    const tr = el('tr', 'comparison-item-content');
    if (highlight.has(i)) tr.classList.add('comparison-highlight');
    const value = el('td', 'comparison-item-value');
    const source = valueFor(i);
    if (source) {
      value.className = `comparison-item-value ${source.className.replace('comparison-highlight', '')}`;
      value.append(...[...source.childNodes].map(clone));
    }
    tr.append(productCell(model, i, highlight), value);
    tbody.append(tr);
  });
  table.append(tbody);
  return table;
}

function buildMobile(model, highlight, filterLabel) {
  const mobile = div('comparison-mobile');
  const filter = div('comparison-filter');
  const select = div('comparison-select');
  select.setAttribute('role', 'button');
  select.setAttribute('aria-haspopup', 'listbox');
  select.setAttribute('aria-expanded', 'false');
  const placeholder = div('comparison-select-placeholder');
  if (filterLabel) moveChildren(filterLabel, placeholder);
  const chevron = icon('check');
  chevron.replaceChildren();
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M8.8 18l6.4-6-6.4-6');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-width', '1.3');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('transform', 'translate(2.4 2.4) scale(0.8)');
  chevron.append(path);
  chevron.classList.add('comparison-select-chevron');
  const box = el('ul', 'comparison-select-box');
  box.setAttribute('role', 'listbox');
  model.features.forEach(({ name }, i) => {
    const option = el('li', 'comparison-select-option');
    option.setAttribute('role', 'option');
    option.dataset.value = `${i + 1}`;
    option.append(...[...name.childNodes].map(clone));
    box.append(option);
  });
  select.append(placeholder, chevron, box);
  filter.append(select);
  mobile.append(filter);

  const tables = [];
  if (model.prices.length) tables.push(itemTable(model, highlight, null, (i) => model.prices[i]));
  model.features.forEach(({ name, values }) => {
    tables.push(itemTable(model, highlight, name, (i) => values[i]));
  });
  tables.forEach((t, i) => { t.dataset.index = `${i}`; });
  mobile.append(...tables);

  const options = [...box.children];
  const close = () => select.setAttribute('aria-expanded', 'false');
  select.addEventListener('click', (e) => {
    const option = e.target.closest('.comparison-select-option');
    if (option) {
      const target = tables.find((t) => t.dataset.index === option.dataset.value);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      close();
      return;
    }
    select.setAttribute('aria-expanded', select.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
  });
  select.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select.click();
    }
  });
  select.tabIndex = 0;
  options.forEach((o) => { o.tabIndex = -1; });
  return mobile;
}

/* ---------- phone panels ---------- */

function buildPanel(cell) {
  const panel = div('comparison-panel');
  const stamp = div('comparison-panel-stamp');
  const amount = div('comparison-panel-amount');
  const rich = div('aem-rich-text aem-rich-text-bullet-checkmark-green comparison-panel-rich');
  const actions = div('aem-cta-btngroup comparison-panel-actions');
  const nodes = [...cell.children];
  const headingIndex = nodes.findIndex(isHeading);
  let afterHeading = 0;
  nodes.forEach((node, i) => {
    if (i < headingIndex) {
      stamp.append(node);
    } else if (i === headingIndex) {
      panel.append(stamp, node);
    } else if (node.tagName === 'P' && node.querySelector('a[href]')
      && text(node) === text(node.querySelector('a[href]'))) {
      actions.append(node);
    } else if (node.tagName === 'P' && afterHeading < 2 && !node.querySelector('sup')) {
      amount.append(node);
      afterHeading += 1;
    } else {
      rich.append(node);
      afterHeading = 2;
    }
  });
  if (!stamp.childNodes.length) stamp.classList.add('comparison-panel-stamp-empty');
  panel.append(amount, rich, actions);
  return panel;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .comparison-body')) return;
  const head = absorbHead(block);
  const body = div('comparison-body');
  const rows = [...block.children];

  if (block.classList.contains('phone')) {
    const panels = div('comparison-panels');
    const notes = [];
    rows.forEach((row) => {
      const cell = row.firstElementChild;
      if (!cell) return;
      if (classifyRow(row) === 'panel') panels.append(buildPanel(cell));
      else notes.push(noteBlock(cell));
    });
    body.append(panels, ...notes);
    block.replaceChildren(...[head, body].filter(Boolean));
    return;
  }

  const groups = [];
  const notes = [];
  let headerSeen = false;
  rows.forEach((row) => {
    let kind = classifyRow(row);
    if (kind === 'note' || kind === 'panel') {
      if (row.firstElementChild) notes.push(noteBlock(row.firstElementChild));
      return;
    }
    if (!headerSeen && kind === 'links') {
      kind = 'header';
      headerSeen = true;
    }
    groups.push({ kind, row });
  });

  const highlight = new Set();
  let filterLabel = null;
  const header = groups.find((g) => g.kind === 'header');
  if (header) {
    const cells = [...header.row.children];
    if (cellKind(cells[0]) !== 'empty') [filterLabel] = cells;
    cells.slice(1).forEach((c, i) => {
      if ([...c.querySelectorAll(':scope > p')].some((p) => !p.querySelector('a'))) highlight.add(i);
    });
  }

  const { table, model } = buildTable(groups, highlight);
  const mobile = buildMobile(model, highlight, filterLabel);
  body.append(table, mobile, ...notes);
  block.replaceChildren(...[head, body].filter(Boolean));
}
