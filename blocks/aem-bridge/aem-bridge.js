/**
 * aem-bridge — section 03 (ink-soft). Head + h2 + lede + a 3-node architecture
 * flow (Generate › Convert › Publish; the middle node is the highlighted
 * "signal") and a foot line.
 *
 * Authoring rows:
 *   1. head        — 2 cells: eyebrow | right meta
 *   2. heading     — <h2>
 *   3. lede        — paragraph (with inline link)
 *   4..6 nodes     — each cell: <p>role</p><h3>name</h3><p>desc</p>
 *   7. foot        — paragraph (mono caps, <strong> dots)
 */

function wrapOps(text) {
  return text.replace(/\s([›·→])\s/g, ' <span class="op">$1</span> ');
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

function buildNode(cell) {
  const node = document.createElement('div');
  node.className = 'arch-node';
  const ps = [...cell.querySelectorAll('p')];
  const h3 = cell.querySelector('h3');
  const role = document.createElement('div');
  role.className = 'role';
  role.textContent = ps[0] ? ps[0].textContent.trim() : '';
  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = h3 ? h3.textContent.trim() : '';
  const desc = document.createElement('div');
  desc.className = 'desc';
  desc.innerHTML = ps[1] ? ps[1].innerHTML : '';
  node.append(role, name, desc);
  return node;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  let head;
  let heading;
  const nodes = [];
  const prose = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (row.querySelector('h2')) {
      heading = row.querySelector('h2');
    } else if (row.querySelector('h3')) {
      nodes.push(buildNode(row.querySelector(':scope > div') || row));
    } else if (cells.length >= 2) {
      head = buildHead(cells);
    } else {
      const cell = row.querySelector(':scope > div') || row;
      cell.querySelectorAll('p').forEach((p) => prose.push(p));
    }
  });

  if (head) wrap.append(head);
  if (heading) wrap.append(heading);
  if (prose[0]) { prose[0].classList.add('lede'); wrap.append(prose[0]); }

  if (nodes.length) {
    const arch = document.createElement('div');
    arch.className = 'arch';
    const flow = document.createElement('div');
    flow.className = 'arch-flow';
    const mid = Math.floor(nodes.length / 2);
    nodes.forEach((n, i) => {
      if (i === mid && nodes.length > 1) n.classList.add('signal');
      flow.append(n);
      if (i < nodes.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'arch-arrow';
        arrow.textContent = '›';
        flow.append(arrow);
      }
    });
    arch.append(flow);
    if (prose[1]) { prose[1].classList.add('arch-foot'); arch.append(prose[1]); }
    wrap.append(arch);
  }

  block.replaceChildren(wrap);
}
