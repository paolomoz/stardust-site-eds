/**
 * aem-cards — a head + h2 + lede + 3-card section (AEM page sections 01 & 02).
 * Variant: add `soft` for the ink-soft ground (section 01); default ground is
 * the page body (ink-deep, section 02).
 *
 * Authoring rows:
 *   1. head      — 2 cells: eyebrow | right meta
 *   2. heading   — <h2>
 *   3. lede      — paragraph
 *   4..N cards   — each cell: <p>label</p><h3>title</h3><p>body</p>
 */

function wrapOps(html) {
  // amber-accent the › / · / → operators in the right-meta line
  return html.replace(/\s([›·→])\s/g, ' <span class="op">$1</span> ');
}

function buildHead(cells) {
  const head = document.createElement('div');
  head.className = 'head';
  const eyebrow = document.createElement('span');
  eyebrow.className = 'eyebrow';
  const raw = cells[0].textContent.trim();
  const m = raw.match(/^(\d+\s*·)\s*(.*)$/);
  eyebrow.innerHTML = m ? `<span class="num">${m[1]}</span>${m[2]}` : raw;
  head.append(eyebrow);
  if (cells[1] && cells[1].textContent.trim()) {
    const right = document.createElement('span');
    right.className = 'right';
    right.innerHTML = wrapOps(cells[1].textContent.trim());
    head.append(right);
  }
  return head;
}

function buildCard(cell) {
  const card = document.createElement('div');
  card.className = 'card';
  const ps = [...cell.querySelectorAll('p')];
  const h3 = cell.querySelector('h3');
  const labelText = ps[0] && cell.firstElementChild === ps[0] ? ps[0].textContent.trim() : '';
  if (labelText) {
    const lbl = document.createElement('div');
    lbl.className = 'lbl';
    lbl.textContent = labelText;
    card.append(lbl);
  }
  if (h3) card.append(h3);
  ps.filter((p) => p.textContent.trim() !== labelText).forEach((p) => card.append(p));
  return card;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  const cards = [];
  let head;
  let heading;
  const proseEls = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (row.querySelector('h2')) {
      heading = row.querySelector('h2');
    } else if (row.querySelector('h3')) {
      cards.push(buildCard(row.querySelector(':scope > div') || row));
    } else if (cells.length >= 2) {
      head = buildHead(cells);
    } else {
      const cell = row.querySelector(':scope > div') || row;
      proseEls.push(...cell.querySelectorAll('p'));
    }
  });

  if (head) wrap.append(head);
  if (heading) wrap.append(heading);
  proseEls.forEach((p) => { p.classList.add('lede'); wrap.append(p); });
  if (cards.length) {
    const grid = document.createElement('div');
    grid.className = 'three';
    cards.forEach((c) => grid.append(c));
    wrap.append(grid);
  }

  block.replaceChildren(wrap);
}
