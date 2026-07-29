/**
 * aem-notes — cadence-notes closer for the playbook page: cream ground,
 * section head, h2, lede, then a 2-col grid of label + prose cards
 * (no h3 — a different pattern from aem-cards, hence its own block).
 *
 * Authoring rows:
 *   1. head     — 2 cells: eyebrow | right meta
 *   2. heading  — <h2>
 *   3. lede     — single <p>
 *   4..N cards  — each cell: <p>label</p><p>body</p>
 */

function wrapOps(html) {
  return html.replace(/\s([›·→])\s/g, ' <span class="op">$1</span> ');
}

function buildCard(cell) {
  const card = document.createElement('div');
  card.className = 'card';
  const ps = [...cell.querySelectorAll('p')];
  const lbl = document.createElement('div');
  lbl.className = 'lbl';
  lbl.textContent = (ps[0] ? ps[0].textContent : '').trim();
  card.append(lbl);
  ps.slice(1).forEach((p) => card.append(p));
  return card;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  const codes = document.createElement('div');
  codes.className = 'codes';
  codes.setAttribute('aria-hidden', 'true');
  codes.innerHTML = '<span class="tl">a3f7</span><span class="tr">c92e</span><span class="bl">b1d4</span><span class="br">8a0c</span>';
  wrap.append(codes);

  const cards = [];
  rows.forEach((row) => {
    const cells = [...row.children];
    if (row.querySelector('h2')) {
      wrap.append(row.querySelector('h2'));
    } else if (cells.length >= 2) {
      const head = document.createElement('div');
      head.className = 'head';
      const eyebrow = document.createElement('span');
      eyebrow.className = 'eyebrow';
      const raw = cells[0].textContent.trim();
      const m = raw.match(/^((?:\d+|Act [IVX]+|\+\+)\s*·)\s*(.*)$/);
      eyebrow.innerHTML = m ? `<span class="num">${m[1]}</span>${m[2]}` : raw;
      head.append(eyebrow);
      if (cells[1] && cells[1].textContent.trim()) {
        const right = document.createElement('span');
        right.className = 'right';
        right.innerHTML = wrapOps(cells[1].textContent.trim());
        head.append(right);
      }
      codes.after(head);
    } else {
      const cell = row.querySelector(':scope > div') || row;
      const ps = [...cell.querySelectorAll('p')];
      if (ps.length >= 2) {
        cards.push(buildCard(cell));
      } else if (ps[0]) {
        ps[0].classList.add('lede');
        wrap.append(ps[0]);
      }
    }
  });

  if (cards.length) {
    const grid = document.createElement('div');
    grid.className = 'cadence';
    cards.forEach((c) => grid.append(c));
    wrap.append(grid);
  }

  block.replaceChildren(wrap);
}
