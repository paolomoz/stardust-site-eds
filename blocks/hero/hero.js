/**
 * hero — the page lead. Ink ground with a radial-gradient glow, dust speckle,
 * hex corner codes, eyebrow, h1 (the page's single <h1>), italic subtitle,
 * lede, CTA row, and a one-shot quickstart note.
 *
 * Authoring rows (order matters, but read by querying so a flattened single
 * cell also works):
 *   1. eyebrow text         — "00 · Stardust"
 *   2. <h1>                  — the page headline
 *   3. subtitle paragraph    — "Math, not mysticism."
 *   4. lede paragraph
 *   5. primary CTA           — <strong><a>…</a></strong>
 *   6. secondary CTA         — <em><a>…</a></em>
 *   7. quickstart paragraph  — "<code>/stardust:uplift …</code> …"
 *
 * Buttons are authored with <strong>/<em> emphasis and decorated by the global
 * link decorator; this block only clones the CTA paragraphs into a row.
 */

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

export default async function decorate(block) {
  const nodes = collectNodes(block);
  const h1 = nodes.find((n) => n.matches('h1, h2, h3, h4, h5, h6'));
  const h1Index = nodes.indexOf(h1);

  const eyebrowNode = nodes.slice(0, h1Index).find((n) => n.textContent.trim());
  const after = nodes.slice(h1Index + 1);
  const ctas = after.filter((n) => n.querySelector('a'));
  const quickstart = after.find((n) => n.querySelector('code'));
  const proseAfter = after.filter((n) => !n.querySelector('a') && !n.querySelector('code') && n.textContent.trim());
  const subtitleNode = proseAfter[0];
  const ledeNode = proseAfter[1];

  const container = document.createElement('div');
  container.className = 'container';

  if (eyebrowNode) {
    const eyebrow = document.createElement('span');
    eyebrow.className = 'eyebrow';
    const raw = eyebrowNode.textContent.trim();
    const m = raw.match(/^(\d+\s*·)\s*(.*)$/);
    if (m) {
      eyebrow.innerHTML = `<span class="num">${m[1]}</span>${m[2]}`;
    } else {
      eyebrow.textContent = raw;
    }
    container.append(eyebrow);
  }

  if (h1) {
    h1.classList.add('hero-h1');
    container.append(h1);
  }

  if (subtitleNode) {
    const sub = document.createElement('p');
    sub.className = 'hero-subtitle';
    sub.innerHTML = subtitleNode.textContent.trim().replace(
      /(mysticism\.?)/i,
      '<span class="accent">$1</span>',
    );
    container.append(sub);
  }

  if (ledeNode) {
    ledeNode.classList.add('lede');
    container.append(ledeNode);
  }

  if (ctas.length) {
    const row = document.createElement('div');
    row.className = 'cta-row';
    ctas.forEach((p) => row.append(p));
    container.append(row);
  }

  if (quickstart) {
    const qs = document.createElement('div');
    qs.className = 'quickstart';
    qs.setAttribute('role', 'note');
    const code = quickstart.querySelector('code');
    code.classList.add('qs-cmd');
    // mark the slash-prompt and the <arg> inside the command
    code.innerHTML = code.innerHTML
      .replace(/^\s*(\/[^\s<]+)/, '<span class="qs-prompt">›</span>$1')
      .replace(/(&lt;[^&]+&gt;)/, '<span class="qs-arg">$1</span>');
    const desc = quickstart.textContent.replace(code.textContent, '').trim();
    qs.innerHTML = '<span class="qs-lbl">One-shot</span>';
    qs.append(code);
    if (desc) {
      const d = document.createElement('span');
      d.className = 'qs-desc';
      d.textContent = desc;
      qs.append(d);
    }
    container.append(qs);
  }

  const dust = document.createElement('div');
  dust.className = 'dust-layer';
  dust.setAttribute('aria-hidden', 'true');

  const codes = document.createElement('div');
  codes.className = 'codes';
  codes.setAttribute('aria-hidden', 'true');
  codes.innerHTML = '<span class="tl">a3f7</span><span class="tr">c92e</span><span class="bl">b1d4</span><span class="br">8a0c</span>';

  block.replaceChildren(dust, codes, container);
}
