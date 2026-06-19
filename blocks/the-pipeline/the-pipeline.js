/**
 * the-pipeline — full-bleed dark scene. A labelled pipeline diagram (lane name
 * + four pills with captions, arrows between) and a 3-card grid below.
 *
 * Authoring rows:
 *   1. lane name  — single cell ("stardust")
 *   2..5 pills    — 2 cells each: step name | caption
 *   6..N cards    — each cell: <p>label</p><h3>title</h3><p>body</p>
 */

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
  const pills = [];
  const cards = [];
  let laneName = 'stardust';

  rows.forEach((row) => {
    const cells = [...row.children];
    if (row.querySelector('h3')) {
      cards.push(buildCard(row.querySelector(':scope > div') || row));
    } else if (cells.length >= 2) {
      pills.push({ name: cells[0].textContent.trim(), caption: cells[1].textContent.trim() });
    } else if (row.textContent.trim()) {
      laneName = row.textContent.trim();
    }
  });

  const inner = document.createElement('div');
  inner.className = 'inner';

  const pipeline = document.createElement('div');
  pipeline.className = 'pipeline';
  const lane = document.createElement('span');
  lane.className = 'lane-name';
  lane.textContent = laneName;
  pipeline.append(lane);

  const pillsWrap = document.createElement('div');
  pillsWrap.className = 'pills';
  pills.forEach((p, i) => {
    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.innerHTML = `<span class="step-name">${p.name}</span><span class="caption">${p.caption}</span>`;
    pillsWrap.append(pill);
    if (i < pills.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = '›';
      pillsWrap.append(arrow);
    }
  });
  pipeline.append(pillsWrap);
  inner.append(pipeline);

  if (cards.length) {
    const grid = document.createElement('div');
    grid.className = 'three';
    cards.forEach((c) => grid.append(c));
    inner.append(grid);
  }

  block.replaceChildren(inner);
}
