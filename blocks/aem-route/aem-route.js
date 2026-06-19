/**
 * aem-route — section 05 (cream/dust ground). Quieter informational band:
 * head (eyebrow + right meta), h2, a lede paragraph, a single CTA link, and a
 * small credit line.
 *
 * Authoring rows:
 *   1. head     — 2 cells: eyebrow | right meta
 *   2. heading  — <h2>
 *   3. lede     — paragraph (may contain an inline link)
 *   4. cta      — paragraph whose only content is a link
 *   5. credit   — paragraph (mono caps credit line)
 */

export default async function decorate(block) {
  const rows = [...block.children];
  const container = document.createElement('div');
  container.className = 'container';
  let head;
  let heading;
  let cta;
  const prose = [];

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
      cell.querySelectorAll('p').forEach((p) => {
        const a = p.querySelector('a');
        if (a && p.textContent.trim() === a.textContent.trim()) {
          a.classList.add('aem-cta');
          cta = document.createElement('p');
          cta.className = 'aem-cta-row';
          cta.append(a);
        } else {
          prose.push(p);
        }
      });
    }
  });

  if (head) container.append(head);
  if (heading) container.append(heading);
  if (prose[0]) { prose[0].classList.add('lede'); container.append(prose[0]); }
  if (cta) container.append(cta);
  prose.slice(1).forEach((p) => { p.classList.add('aem-credit'); container.append(p); });

  block.replaceChildren(container);
}
