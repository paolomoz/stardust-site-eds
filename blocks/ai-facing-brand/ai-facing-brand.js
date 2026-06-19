/**
 * ai-facing-brand — section 03 (ink ground). Head (eyebrow + right meta), h2,
 * a lede paragraph, and a 3-card grid.
 *
 * Authoring rows:
 *   1. head      — 2 cells: eyebrow | right meta
 *   2. heading   — <h2>
 *   3. lede      — paragraph
 *   4..N cards   — each cell: <p>label</p><h3>title</h3><p>body</p>
 */

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
    right.textContent = cells[1].textContent.trim();
    head.append(right);
  }
  return head;
}

function buildCard(cell) {
  const card = document.createElement('div');
  card.className = 'card';
  const ps = [...cell.querySelectorAll('p')];
  const h3 = cell.querySelector('h3');
  // The label, when present, is authored as the cell's first element (before h3).
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
  const container = document.createElement('div');
  container.className = 'container';
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

  if (head) container.append(head);
  if (heading) container.append(heading);
  proseEls.forEach((p) => { p.classList.add('lede-prose'); container.append(p); });
  if (cards.length) {
    const grid = document.createElement('div');
    grid.className = 'three';
    cards.forEach((c) => grid.append(c));
    container.append(grid);
  }

  block.replaceChildren(container);
}
