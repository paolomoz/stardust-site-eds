/**
 * aem-phases — an "act" of the migration playbook: section head, h2, then a
 * run of numbered phases. Each phase has a sticky marker (numbered circle +
 * mono tag) and a body of prose, copyable prompt blocks (<pre>), and optional
 * check callouts (<blockquote>). Variant: `soft` for the ink-soft ground;
 * default ground is the page body (ink-deep).
 *
 * Authoring rows:
 *   1. head        — 2 cells: eyebrow ("Act I · Understand & direct") | right meta
 *   2. heading     — <h2>
 *   3..N phases    — 2 cells: marker (<p>01</p><p>Extract — discovery snapshot</p>)
 *                    | body (<h3>title</h3> then <p> prose, <pre> prompts,
 *                    <blockquote> check notes, in authored order)
 */

function wrapOps(html) {
  return html.replace(/\s([›·→])\s/g, ' <span class="op">$1</span> ');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* amber-accent the leading command token and <PLACEHOLDER> args of a prompt */
function highlightPrompt(text) {
  let html = escapeHtml(text.trim());
  html = html.replace(/&lt;[^&\s]{1,40}&gt;/g, '<span class="arg">$&</span>');
  html = html.replace(/^(\/stardust:[a-z-]+|approve|Render it)/, '<span class="kw">$1</span>');
  return html;
}

function buildPrompt(pre, index) {
  const box = document.createElement('div');
  box.className = 'prompt';
  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.innerHTML = '<span><span class="dot">●</span>Prompt</span>';
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'copy';
  copy.textContent = 'Copy';
  copy.setAttribute('aria-label', `Copy prompt ${index + 1}`);
  const text = pre.textContent.trim();
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      copy.textContent = 'Copied';
    } catch (e) {
      copy.textContent = 'Select + copy';
    }
    setTimeout(() => { copy.textContent = 'Copy'; }, 1600);
  });
  bar.append(copy);
  const out = document.createElement('pre');
  out.innerHTML = highlightPrompt(text);
  box.append(bar, out);
  return box;
}

function buildMarker(cell) {
  const marker = document.createElement('div');
  marker.className = 'marker';
  const ps = [...cell.querySelectorAll('p')];
  const num = document.createElement('span');
  num.className = 'num';
  num.textContent = (ps[0] ? ps[0].textContent : '').trim();
  marker.append(num);
  if (ps[1]) {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = ps[1].innerHTML;
    marker.append(tag);
  }
  return marker;
}

function buildBody(cell, promptCount) {
  const body = document.createElement('div');
  body.className = 'body';
  let count = promptCount;
  [...cell.children].forEach((el) => {
    if (el.tagName === 'PRE') {
      body.append(buildPrompt(el, count));
      count += 1;
    } else if (el.tagName === 'BLOCKQUOTE') {
      const check = document.createElement('div');
      check.className = 'check';
      const inner = el.querySelector('p') || el;
      check.innerHTML = inner.innerHTML;
      body.append(check);
    } else {
      const first = el.firstChild;
      if (el.tagName === 'P' && first && first.nodeType === 1 && first.tagName === 'EM') {
        el.classList.add('note');
      }
      body.append(el);
    }
  });
  return { body, count };
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

  let promptCount = 0;
  const phases = [];
  rows.forEach((row) => {
    const cells = [...row.children];
    if (row.querySelector('h2')) {
      wrap.append(row.querySelector('h2'));
    } else if (row.querySelector('h3')) {
      const phase = document.createElement('div');
      phase.className = 'phase';
      if (cells.length >= 2) phase.append(buildMarker(cells[0]));
      const built = buildBody(cells[cells.length - 1], promptCount);
      promptCount = built.count;
      phase.append(built.body);
      phases.push(phase);
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
      // head is authored first — insert after codes, before the h2
      codes.after(head);
    }
  });

  phases.forEach((p) => wrap.append(p));
  block.replaceChildren(wrap);
}
