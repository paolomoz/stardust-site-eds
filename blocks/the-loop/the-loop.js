/**
 * the-loop — section 02 (cream/dust ground). Head (eyebrow + right meta), h2,
 * and a lede paragraph. Intro band for the pipeline scene that follows.
 *
 * Authoring rows:
 *   1. head     — 2 cells: eyebrow | right meta
 *   2. heading  — <h2>
 *   3. lede     — paragraph
 */

export default async function decorate(block) {
  const rows = [...block.children];
  const container = document.createElement('div');
  container.className = 'container';
  let head;
  let heading;
  const proseEls = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (row.querySelector('h2')) {
      heading = row.querySelector('h2');
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
        right.textContent = cells[1].textContent.trim();
        head.append(right);
      }
    } else {
      const cell = row.querySelector(':scope > div') || row;
      proseEls.push(...cell.querySelectorAll('p'));
    }
  });

  if (head) container.append(head);
  if (heading) container.append(heading);
  proseEls.forEach((p) => { p.classList.add('lede-prose'); container.append(p); });

  block.replaceChildren(container);
}
