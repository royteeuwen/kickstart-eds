/**
 * quick-response — QR code with a description (canon .quick-response / .qr deep-qr).
 * Template-slotted: an image-only cell (or element) fills the code slot, everything else is
 * MOVED into the description slot in authored order.
 * The live QR is generated client-side from a secure deeplink (awesome-qr); here it is the
 * authored image (dynamic-features #14, static snapshot).
 * Variant `right`: code floated right.
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

function cellElements(block) {
  return [...block.querySelectorAll(':scope > div > div')].flatMap((cell) => {
    const inline = [...cell.childNodes]
      .some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    const kids = [...cell.children];
    if (!inline && kids.length) return kids;
    return cell.textContent.trim() || cell.querySelector('img') ? [cell] : [];
  });
}

export default function decorate(block) {
  if (block.querySelector(':scope > .quick-response-qr')) return;

  const qr = div('quick-response-qr');
  const code = div('quick-response-code');
  const description = div('quick-response-description');
  cellElements(block).forEach((el) => {
    if (isImageOnly(el) && !code.children.length) code.append(el);
    else description.append(el);
  });

  if (code.children.length) qr.append(code);
  if (description.children.length) qr.append(description);
  block.replaceChildren(qr);
}
