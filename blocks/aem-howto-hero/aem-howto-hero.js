/**
 * aem-howto-hero — the migration-playbook page lead. Eyebrow, two-line h1
 * (second line amber italic), a highlighted lede, a chip row, and a pair of
 * "you provide" cards. Mounts the cursor-following star easter egg (shared
 * design with aem-hero; duplicated per the one-block-per-pattern rule since
 * the provide cards replace the before/after pair).
 *
 * Authoring rows:
 *   1. eyebrow text     — "00 · How-to · Migration playbook"
 *   2. <h1>             — line 1<br><em>line 2</em>
 *   3. lede paragraph   — "AEM Edge Delivery" gets highlighted; <code> stays mono
 *   4. chips            — 2 cells, one per chip
 *   5..N provide cards  — each cell: <p>label</p><p>body</p>
 */

function wrapOps(text) {
  return text.replace(/\s([›·→])\s/g, ' <span class="op">$1</span> ');
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

function buildProvideCard(cell) {
  const card = document.createElement('div');
  card.className = 'card';
  const ps = [...cell.querySelectorAll('p')];
  if (ps.length) {
    const lbl = document.createElement('div');
    lbl.className = 'lbl';
    lbl.textContent = ps[0].textContent.trim();
    card.append(lbl);
    ps.slice(1).forEach((p) => card.append(p));
  }
  return card;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  let h1;
  let eyebrowText;
  let ledeP;
  let chipCells;
  const provideCards = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (row.querySelector('h1')) {
      h1 = row.querySelector('h1');
    } else if (cells.length >= 2) {
      chipCells = cells;
    } else {
      const cell = row.querySelector(':scope > div') || row;
      const ps = [...cell.querySelectorAll('p')];
      if (!h1) eyebrowText = cell.textContent.trim();
      else if (ps.length >= 2) provideCards.push(buildProvideCard(cell));
      else ledeP = ps[0] || cell;
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
    ledeP.innerHTML = ledeP.innerHTML.replace('AEM Edge Delivery', '<span class="hl">AEM Edge Delivery</span>');
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

  if (provideCards.length) {
    const provide = document.createElement('div');
    provide.className = 'provide';
    provideCards.forEach((c) => provide.append(c));
    wrap.append(provide);
  }

  const dust = document.createElement('div');
  dust.className = 'dust-layer';
  dust.setAttribute('aria-hidden', 'true');

  block.replaceChildren(dust, wrap);
  mountCursorStar();
}
