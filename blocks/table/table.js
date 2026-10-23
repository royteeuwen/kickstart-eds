/**
 * table — a two-column fact table (canon .aem-table / .table--blocked__container).
 *
 * Content model: one row per table row, one cell per column. Each row becomes a <tr>, each
 * cell a <td>; the authored cell content is MOVED into it. A cell that holds only a yes/no
 * answer (ja / neen, yes / no, oui / non) shows the canon included / not-included icon; the
 * authored word stays in the cell as the accessible text (visually hidden, as on the source).
 */

const YES = /^(ja|yes|oui)$/i;
const NO = /^(neen|nee|no|non)$/i;

function div(className) {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

function decorateAnswer(td) {
  const text = td.textContent.trim();
  const yes = YES.test(text);
  if (!yes && !NO.test(text)) return;
  const icon = document.createElement('span');
  icon.className = `kbc-icon table-icon ${yes ? 'table-icon-yes' : 'table-icon-no'}`;
  icon.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.className = 'table-answer sr-only';
  label.append(...td.childNodes);
  td.append(icon, label);
}

export default function decorate(block) {
  if (block.querySelector(':scope > .table-body')) return;

  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.some((cell) => cell.textContent.trim() || cell.querySelector('img'))) return;
    const tr = document.createElement('tr');
    cells.forEach((cell) => {
      const td = document.createElement('td');
      td.append(...cell.childNodes);
      decorateAnswer(td);
      tr.append(td);
    });
    tbody.append(tr);
  });
  table.append(tbody);

  const body = div('table-body');
  body.append(table);
  block.replaceChildren(body);
}
