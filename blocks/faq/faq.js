/**
 * faq — accordion of questions and answers (canon .faq, native-details look).
 *
 * Content model (reconstructive): one row per entry — the question cell, then the answer cell
 * (paragraphs, lists or a plain table). A one-cell row whose content is a heading is read as
 * the question of the next answer-only row. Every authored element is MOVED: the question into
 * the title row, the answer into the panel.
 *
 * EW7: the question is not hosted by a <button>/<summary> — the whole title row takes the click,
 * a chevron-only <button> carries aria-expanded / aria-controls.
 */

let faqCount = 0;

function div(className) {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

function hasContent(cell) {
  return !!(cell && (cell.textContent.trim() || cell.querySelector('img, table')));
}

function setOpen(entry, open) {
  entry.classList.toggle('faq-entry-open', open);
  const toggle = entry.querySelector('.faq-item-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', String(open));
  const panel = entry.querySelector('.faq-item-content');
  if (panel) panel.hidden = !open;
}

function buildEntry(questionCell, answerCell, index) {
  faqCount += 1;
  const id = `faq-${faqCount}-${index}`;
  const entry = div('faq-entry');

  const title = div('faq-item-title');
  const label = div('faq-item-label');
  const question = div('faq-item-question');
  question.append(...questionCell.childNodes);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'faq-item-toggle';
  toggle.setAttribute('aria-label', 'Toon of verberg het antwoord');
  toggle.setAttribute('aria-controls', id);
  label.append(question, toggle);
  title.append(label);

  const content = div('faq-item-content');
  content.id = id;
  const body = div('faq-item-body');
  if (answerCell) body.append(...answerCell.childNodes);
  content.append(body);

  entry.append(title, content);
  setOpen(entry, false);
  title.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    setOpen(entry, !entry.classList.contains('faq-entry-open'));
  });
  return entry;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .faq-list')) return;

  const list = div('faq-list');
  let pending = null;
  [...block.children].forEach((row, index) => {
    const cells = [...row.children].filter((cell) => hasContent(cell));
    if (!cells.length) return;
    if (cells.length === 1) {
      const [cell] = cells;
      const headingOnly = cell.children.length === 1 && /^H[1-6]$/.test(cell.firstElementChild.tagName);
      if (!pending && (headingOnly || !cell.querySelector('p, ul, ol, table'))) {
        pending = cell;
        return;
      }
      if (pending) {
        list.append(buildEntry(pending, cell, index));
        pending = null;
        return;
      }
      list.append(buildEntry(cell, null, index));
      return;
    }
    if (pending) {
      list.append(buildEntry(pending, null, index));
      pending = null;
    }
    const [questionCell, ...answerCells] = cells;
    const answer = answerCells[0];
    answerCells.slice(1).forEach((extra) => answer.append(...extra.childNodes));
    list.append(buildEntry(questionCell, answer, index));
  });
  if (pending) list.append(buildEntry(pending, null, block.children.length));

  block.replaceChildren(list);
}
