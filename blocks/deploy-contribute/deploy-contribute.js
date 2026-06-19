/**
 * deploy-contribute — section 04 (ink ground). Head (eyebrow + right meta), h2,
 * and a two-column divided panel (Deploy | Contribute). The Contribute column
 * carries an install code block.
 *
 * Authoring rows:
 *   1. head     — 2 cells: eyebrow | right meta
 *   2. heading  — <h2>
 *   3..N cols   — one cell each, in order:
 *                 <p>label</p><h3>title</h3><p>body</p>[<pre>code</pre>]
 *                 [<p>credit with link</p>][<p><a>inline link</a></p>]
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

function buildCol(cell) {
  const col = document.createElement('div');
  col.className = 'col';
  const h3 = cell.querySelector('h3');
  [...cell.children].forEach((node, idx) => {
    if (node.tagName === 'H3') {
      col.append(node);
    } else if (node.tagName === 'PRE') {
      const lines = node.textContent.replace(/\n+$/, '').split('\n');
      node.innerHTML = lines.map((l) => l.replace(/^\$\s/, '<span class="prompt">$</span> ')).join('\n');
      node.classList.add('code');
      col.append(node);
    } else if (node.tagName === 'P') {
      const a = node.querySelector('a');
      // The label, when present, is authored as the cell's first element (before h3).
      const isLabel = idx === 0 && !!h3;
      if (isLabel) {
        const lbl = document.createElement('span');
        lbl.className = 'lbl';
        lbl.textContent = node.textContent.trim();
        col.append(lbl);
      } else if (a && node.textContent.trim() === a.textContent.trim()) {
        a.classList.add('inline-link');
        col.append(a);
      } else if (a) {
        node.classList.add('install-credit');
        col.append(node);
      } else {
        col.append(node);
      }
    }
  });
  return col;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const container = document.createElement('div');
  container.className = 'container';
  let head;
  let heading;
  const cols = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (row.querySelector('h2')) {
      heading = row.querySelector('h2');
    } else if (row.querySelector('h3')) {
      cols.push(buildCol(row.querySelector(':scope > div') || row));
    } else if (cells.length >= 2) {
      head = buildHead(cells);
    }
  });

  if (head) container.append(head);
  if (heading) container.append(heading);
  if (cols.length) {
    const divided = document.createElement('div');
    divided.className = 'two-divided';
    cols.forEach((c) => divided.append(c));
    container.append(divided);
  }

  block.replaceChildren(container);
}
