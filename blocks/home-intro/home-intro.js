/**
 * home-intro — full-bleed introduction band (canon .introduction-block-home).
 * Template-slotted: authored headings, rich text and CTAs are MOVED into the content slot,
 * the authored picture into the image slot (it runs behind the transparent header).
 * Content model: any rows/cells; a cell holding only an image is the background image,
 * everything else is content in authored order. Variant: `text-dark` (dark text).
 */

const CURVES = {
  xxl: [
    '<svg viewBox="0 0 1440.001 94" xmlns="http://www.w3.org/2000/svg" preserveAspect',
    'Ratio="xMaxYMax meet"><path d="M1440,600.608H0V566.052c70.1,5.48,142.875,9.8,216',
    '.309,12.845,89.785,3.72,182.2,5.606,274.691,5.606,90.7,0,181.341-1.813,269.419-5',
    '.39,85.924-3.488,170.511-8.695,251.409-15.476,79.447-6.657,156.24-14.905,228.245',
    '-24.516,71.273-9.511,138.539-20.45,199.929-32.513Z" fill="#fff" transform="trans',
    'late(0.001 -506.608)"/></svg>',
  ].join(''),
  md: [
    '<svg viewBox="0 0 768.001 50" xmlns="http://www.w3.org/2000/svg" preserveAspectR',
    'atio="xMaxYMax meet"><path d="M768,387.557H0V367.824c66.243,2.57,134.8,3.873,203',
    '.778,3.873,55.648,0,111.263-.851,165.3-2.53,52.705-1.637,104.507-4.079,153.965-7',
    '.256,48.575-3.118,95.452-6.98,139.327-11.479,37.266-3.822,72.8-8.154,105.628-12.',
    '875v50Z" fill="#fff" transform="translate(0.001 -337.557)"/></svg>',
  ].join(''),
  xs: [
    '<svg viewBox="0 0 375.001 50" xmlns="http://www.w3.org/2000/svg" preserveAspectR',
    'atio="xMaxYMax meet"><path d="M375,387.557H0V367.824c32.344,2.57,65.821,3.873,99',
    '.5,3.873,27.172,0,54.328-.851,80.714-2.53,25.733-1.637,51.027-4.079,75.178-7.256',
    ',23.717-3.118,46.607-6.98,68.032-11.479,18.2-3.822,35.55-8.154,51.576-12.875v50Z',
    '" fill="#fff" transform="translate(0.001 -337.557)"/></svg>',
  ].join(''),
};

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
    const flow = kids.every((k) => /^(P|H[1-6]|UL|OL|PICTURE|IMG|DIV|PRE|BLOCKQUOTE|TABLE)$/
      .test(k.tagName));
    if (!inline && kids.length && flow) return kids;
    return cell.textContent.trim() || cell.querySelector('img') ? [cell] : [];
  });
}

export default function decorate(block) {
  if (block.querySelector(':scope > .home-intro-inner')) return;

  const elements = cellElements(block);

  const inner = div('home-intro-inner');
  const content = div('home-intro-content');
  const image = div('home-intro-image');
  let group = null;
  let text = null;

  elements.forEach((el) => {
    if (isImageOnly(el)) {
      image.append(el);
      return;
    }
    if (/^H[1-6]$/.test(el.tagName)) {
      const title = div('chaptertitle');
      title.append(el);
      content.append(title);
      group = null;
      text = null;
      return;
    }
    if (el.matches('p.button-wrapper')) {
      if (!group) {
        group = div('aem-cta-btngroup');
        content.append(group);
      }
      group.append(el);
      text = null;
      return;
    }
    if (!text) {
      text = div('home-intro-text aem-rich-text');
      content.append(text);
    }
    text.append(el);
    group = null;
  });

  const mask = div('home-intro-mask');
  mask.setAttribute('aria-hidden', 'true');
  Object.entries(CURVES).forEach(([size, svg]) => {
    const curve = div(`home-intro-curve home-intro-curve-${size}`);
    curve.innerHTML = svg;
    mask.append(curve);
  });

  inner.append(content, mask);
  if (image.children.length) inner.append(image);
  block.replaceChildren(inner);
}
