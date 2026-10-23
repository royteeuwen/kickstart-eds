import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * KBC footer — template-slotted from the gated canon (stardust/prototypes, canon.css).
 * Content: the `/footer` document (`/footer-short` = no doormat; page metadata `footer`
 * overrides, template `form` defaults to `/footer-short`). Sections, by section-metadata
 * style (or, unstyled, by content):
 *   social-proof  an image + its link (secure4u badge)
 *   doormat       per column <h4>title</h4><ul>links</ul>
 *   loan-warning  <p>Let op, geld lenen kost ook geld.</p>
 *   legal         <ul> legal links
 *   sharing       <p>Volg KBC op</p><ul> facebook / twitter / linkedin links</ul>
 * Page metadata `footer-hide` (comma list of lead-divider, social-proof, doormat,
 * loan-warning) and `loan-warning: off` switch parts off per page.
 * @ew-exempt all — chrome fragment, authored in the /footer document
 */

const ROLES = ['social-proof', 'doormat', 'loan-warning', 'legal', 'sharing'];
const SOCIAL = ['facebook', 'twitter', 'linkedin'];

function el(tag, cls, ...children) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  node.append(...children.filter(Boolean));
  return node;
}

const socialOf = (a) => SOCIAL.find((s) => a.hostname.includes(s));

function classify(section) {
  const role = ROLES.find((r) => section.classList.contains(r));
  if (role) return role;
  const links = [...section.querySelectorAll('a[href]')];
  if (section.querySelector('picture, img')) return 'social-proof';
  if (links.length && links.every((a) => socialOf(a))) return 'sharing';
  if (section.querySelector('h1, h2, h3, h4, h5, h6') && section.querySelector('ul')) {
    return 'doormat';
  }
  if (section.querySelector('ul')) return 'legal';
  if (!links.length && section.textContent.trim()) return 'loan-warning';
  return null;
}

function contentOf(section) {
  const wrapper = section.querySelector('.default-content-wrapper');
  return [...(wrapper || section).children];
}

async function inlineIcon(name) {
  try {
    const resp = await fetch(`${window.hlx.codeBasePath}/icons/social-${name}.svg`);
    if (resp.ok) return (await resp.text()).trim();
  } catch (e) {
    // no icon
  }
  return '';
}

function buildSocialProof(section) {
  const media = section.querySelector('picture') || section.querySelector('img');
  const link = section.querySelector('a[href]');
  if (!media) return null;
  let a = link;
  if (!a) a = el('a');
  if (!a.contains(media)) {
    const label = el('span', 'sr-only', ...a.childNodes);
    a.replaceChildren(media);
    if (label.textContent.trim()) a.append(label);
  }
  a.removeAttribute('title');
  a.className = 'aem-social-proof-container-item aem-social-proof-container-item-hoverable';
  return el('div', 'aem-social-proof-container aem-social-proof-container-images', a);
}

function buildDoormat(section) {
  const doormat = el('ul', 'doormat');
  let column = null;
  contentOf(section).forEach((node) => {
    if (node.matches('h1, h2, h3, h4, h5, h6')) {
      const title = el('div', 'doormat-column-title', node);
      column = el('li', 'doormat-column', title);
      doormat.append(column);
    } else if (node.matches('ul, ol') && column) {
      node.className = 'doormat-column-links';
      [...node.children].forEach((li) => {
        li.className = 'doormat-link';
        const a = li.querySelector('a[href]');
        if (a) {
          a.className = 'doormat-link-text';
          a.removeAttribute('title');
          a.replaceChildren(el('span', '', ...a.childNodes));
        }
      });
      column.append(node);
    }
  });
  return el('div', 'footer-grid', doormat);
}

async function buildSharing(section) {
  const nodes = contentOf(section);
  const text = nodes.find((n) => n.matches('p') && !n.querySelector('a'));
  const buttons = el('div', 'aem-sharing-buttons');
  const anchors = [...section.querySelectorAll('a[href]')];
  const icons = await Promise.all(anchors.map((a) => inlineIcon(socialOf(a) || '')));
  anchors.forEach((a, i) => {
    const name = socialOf(a);
    const label = el('span', 'sr-only', ...a.childNodes);
    const icon = el('span', 'aem-sharing-btn-icon');
    icon.innerHTML = icons[i];
    a.className = `btn-sharing${name ? ` btn-sharing-${name}` : ''}`;
    a.removeAttribute('title');
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.replaceChildren(icon, label);
    buttons.append(a);
  });
  return el(
    'div',
    'aem-sharing-wrapper aem-sharing-wrapper-footer',
    text ? el('div', 'aem-sharing-text', text) : null,
    buttons,
  );
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const template = getMetadata('template').toLowerCase();
  const fallback = template === 'form' ? '/footer-short' : '/footer';
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : fallback;
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  const hide = new Set(getMetadata('footer-hide').toLowerCase().split(',')
    .map((s) => s.trim())
    .filter(Boolean));
  if (getMetadata('loan-warning').toLowerCase() === 'off') hide.add('loan-warning');

  const parts = {};
  [...fragment.querySelectorAll(':scope > .section, :scope > div')].forEach((s) => {
    const role = classify(s);
    if (role && !parts[role]) parts[role] = s;
  });

  const out = [];
  const lead = el('div', 'footer-full');
  if (!hide.has('lead-divider')) lead.append(el('div', 'aem-divider'));
  const proof = parts['social-proof'] && !hide.has('social-proof')
    ? buildSocialProof(parts['social-proof']) : null;
  if (proof) lead.append(proof, el('div', 'aem-divider'));
  if (lead.children.length) out.push(lead);

  if (parts.doormat && !hide.has('doormat')) {
    out.push(buildDoormat(parts.doormat));
    out.push(el('div', 'footer-full', el('div', 'aem-divider')));
  }

  const grid = el('div', 'footer-grid');
  if (parts['loan-warning'] && !hide.has('loan-warning')) {
    const text = contentOf(parts['loan-warning']);
    grid.append(el('div', 'aem-loan-warning', el('div', 'aem-loan-warning-text', ...text)));
  }
  const legal = parts.legal ? contentOf(parts.legal).find((n) => n.matches('ul, ol')) : null;
  const sharing = parts.sharing ? await buildSharing(parts.sharing) : null;
  if (legal || sharing) grid.append(el('nav', 'aem-nav aem-nav-footer', legal, sharing));
  if (grid.children.length) out.push(grid);

  block.replaceChildren(...out);
}
