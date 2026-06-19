/**
 * aem-hero — the AEM page lead. Eyebrow, two-line h1 (second line amber italic),
 * a highlighted lede, a chip row, and an embedded before/after pair (framed,
 * fixed code-bus assets). Also mounts the cursor-following star easter egg.
 *
 * Authoring rows:
 *   1. eyebrow text   — "00 · Deploy to AEM"
 *   2. <h1>           — line 1<br><em>line 2</em>
 *   3. lede paragraph — "stardust:deploy" gets highlighted, <em> stays italic
 *   4. chips          — 2 cells, one per chip
 */

// Caption chrome is fixed design; the images themselves are authored (DA Media Bus).
const CAPTIONS = [
  { cls: 'before', b: 'Before', span: 'the existing site' },
  { cls: 'after', b: 'After · Stardust on AEM', span: 'same artifact, edge-served' },
];

function wrapOps(text) {
  return text.replace(/\s([›·→])\s/g, ' <span class="op">$1</span> ');
}

function buildBA(images) {
  const ba = document.createElement('div');
  ba.className = 'ba';
  images.forEach((media, i) => {
    const cap = CAPTIONS[i] || CAPTIONS[CAPTIONS.length - 1];
    const fig = document.createElement('figure');
    const frame = document.createElement('div');
    frame.className = `frame ${cap.cls}`;
    frame.append(media);
    const figcap = document.createElement('figcaption');
    if (cap.cls === 'after') figcap.className = 'after';
    figcap.innerHTML = `<b>${cap.b}</b><span>${cap.span}</span>`;
    fig.append(frame, figcap);
    ba.append(fig);
  });
  return ba;
}

function mountCursorStar() {
  if (document.getElementById('cstar')) return;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;
  const star = document.createElement('div');
  star.id = 'cstar';
  star.className = 'cursor-star';
  star.setAttribute('aria-hidden', 'true');
  star.innerHTML = '<svg viewBox="0 0 12 12"><g fill="#e8b95e"><rect x="5" y="0" width="2" height="3"/><rect x="5" y="9" width="2" height="3"/><rect x="0" y="5" width="3" height="2"/><rect x="9" y="5" width="3" height="2"/><rect x="4" y="4" width="4" height="4"/></g></svg>';
  document.body.append(star);
  let x = 0; let y = 0; let tx = 0; let ty = 0;
  document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
  const frame = () => {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    star.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(frame);
  };
  frame();
}

export default async function decorate(block) {
  const rows = [...block.children];
  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  let h1;
  let eyebrowText;
  let ledeP;
  let chipCells;
  const baImages = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    const media = row.querySelector('picture, img');
    if (row.querySelector('h1')) {
      h1 = row.querySelector('h1');
    } else if (media) {
      baImages.push(media);
    } else if (cells.length >= 2) {
      chipCells = cells;
    } else {
      const cell = row.querySelector(':scope > div') || row;
      if (!h1) eyebrowText = cell.textContent.trim();
      else ledeP = cell.querySelector('p') || cell;
    }
  });

  const codes = document.createElement('div');
  codes.className = 'codes';
  codes.setAttribute('aria-hidden', 'true');
  codes.innerHTML = '<span class="tl">a3f7</span><span class="tr">c92e</span><span class="bl">b1d4</span><span class="br">8a0c</span>';
  wrap.append(codes);

  if (eyebrowText) {
    const eyebrow = document.createElement('span');
    eyebrow.className = 'eyebrow';
    const m = eyebrowText.match(/^(\d+\s*·)\s*(.*)$/);
    eyebrow.innerHTML = m ? `<span class="num">${m[1]}</span>${m[2]}` : eyebrowText;
    wrap.append(eyebrow);
  }

  if (h1) wrap.append(h1);

  if (ledeP) {
    ledeP.classList.add('lede');
    ledeP.innerHTML = ledeP.innerHTML.replace('stardust:deploy', '<span class="hl">stardust:deploy</span>');
    wrap.append(ledeP);
  }

  if (chipCells) {
    const chiprow = document.createElement('div');
    chiprow.className = 'chiprow';
    chipCells.forEach((c) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.innerHTML = wrapOps(c.textContent.trim());
      chiprow.append(chip);
    });
    wrap.append(chiprow);
  }

  if (baImages.length) wrap.append(buildBA(baImages));

  const dust = document.createElement('div');
  dust.className = 'dust-layer';
  dust.setAttribute('aria-hidden', 'true');

  block.replaceChildren(dust, wrap);
  mountCursorStar();
}
