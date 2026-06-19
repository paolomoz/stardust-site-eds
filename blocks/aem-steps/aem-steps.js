/**
 * aem-steps — section 04 (cream/dust ground). Head + h2 + lede + a numbered
 * two-column steps list.
 *
 * Authoring rows:
 *   1. head     — 2 cells: eyebrow | right meta
 *   2. heading  — <h2>
 *   3. lede     — paragraph
 *   4. steps    — <ol><li>…</li></ol>
 */

function wrapOps(text) {
  return text.replace(/\s([›·→])\s/g, ' <span class="op">$1</span> ');
}

export default async function decorate(block) {
  const rows = [...block.children];
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  let head;
  let heading;
  let steps;
  const prose = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (row.querySelector('h2')) {
      heading = row.querySelector('h2');
    } else if (row.querySelector('ol')) {
      steps = row.querySelector('ol');
    } else if (cells.length >= 2) {
      head = document.createElement('div');
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
    } else {
      const cell = row.querySelector(':scope > div') || row;
      cell.querySelectorAll('p').forEach((p) => prose.push(p));
    }
  });

  if (head) wrap.append(head);
  if (heading) wrap.append(heading);
  if (prose[0]) { prose[0].classList.add('lede'); wrap.append(prose[0]); }
  if (steps) { steps.classList.add('steps'); wrap.append(steps); }

  block.replaceChildren(wrap);
}
