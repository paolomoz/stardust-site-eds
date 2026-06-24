/**
 * docs — split documentation layout: a fixed sidebar (docs nav) + a prose
 * article, on a full-bleed cream ground with a centered max-width grid.
 *
 * The sidebar is fixed docs chrome (rendered here). The ARTICLE is authored
 * content: each row holds one element (h1/h2/p/pre/blockquote). Because DA
 * strips <span> and author classes from content, the decorative bits are
 * reconstructed in JS:
 *   - eyebrow      — the first paragraph matching "NN · Label"
 *   - h1 accent    — authored <em> (renders as the amber-italic .ital)
 *   - h2 step      — author "Step label|Heading." (split on the | delimiter)
 *   - code prompts — leading $ / › per line, # full-line and " — " trailing
 *                    comments, wrapped in .prompt / .comment
 *   - callout      — authored <blockquote>
 *   - shortcut band — the h2 whose step is "Shortcut" opens an inverted band
 *                     that runs until the next h2
 */

const SIDEBAR = `
  <div class="star">
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><g fill="#e8b95e">
      <rect x="11" y="3" width="2" height="3"/><rect x="11" y="18" width="2" height="3"/>
      <rect x="3" y="11" width="3" height="2"/><rect x="18" y="11" width="3" height="2"/>
      <rect x="10" y="10" width="4" height="4"/></g></svg>
    <span>Stardust · Docs</span>
  </div>
  <span class="lbl">Docs</span>
  <nav class="side">
    <a href="/docs/" aria-current="page"><span>Get started</span><span class="num">01</span></a>
    <a href="/docs/commands/"><span>Commands</span><span class="num">02</span></a>
  </nav>
  <div class="meta-bottom">brief <span class="op">+</span> seed <span class="op">=</span> star</div>`;

function makeCode(pre) {
  const out = document.createElement('pre');
  out.className = 'code';
  out.innerHTML = pre.textContent.replace(/\n+$/, '').split('\n').map((line) => {
    if (/^\s*#/.test(line)) return `<span class="comment">${line}</span>`;
    let l = line.replace(/^(\s*)([$›])\s/, '$1<span class="prompt">$2</span> ');
    l = l.replace(/(\s—\s.*)$/, '<span class="comment">$1</span>');
    return l;
  }).join('\n');
  return out;
}

function makeCallout(bq) {
  const callout = document.createElement('div');
  callout.className = 'callout';
  [...bq.childNodes].forEach((n) => callout.append(n.cloneNode(true)));
  return callout;
}

function makeH2(el) {
  const h2 = document.createElement('h2');
  let step = '';
  let title = '';
  let titleText = '';

  const first = el.firstElementChild;
  if (first && first.tagName === 'STRONG') {
    // De-delimited form (preferred): a leading <strong> is the step kicker.
    // DA preserves <strong> but strips <span>/classes, so the kicker rides a
    // semantic tag instead of an in-band "|" delimiter.
    step = first.textContent.trim();
    const rest = el.cloneNode(true);
    rest.removeChild(rest.firstElementChild);
    title = rest.innerHTML.replace(/^\s+/, '');
    titleText = rest.textContent.trim();
  } else {
    const raw = el.innerHTML;
    const i = raw.indexOf('|');
    if (i >= 0) {
      // Back-compat: "Step|Title" delimiter form.
      step = raw.slice(0, i).trim();
      title = raw.slice(i + 1).trim();
      titleText = title.replace(/<[^>]+>/g, '');
    } else {
      title = raw;
      titleText = el.textContent.trim();
    }
  }

  if (step) {
    h2.innerHTML = `<span class="step">${step}</span>${title}`;
    h2.dataset.step = step.toLowerCase();
  } else {
    h2.innerHTML = title;
  }
  const slug = titleText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (slug) h2.id = slug;
  return h2;
}

function mountZap(scope) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const band = scope.querySelector('.shortcut-block');
  const targets = scope.querySelectorAll('.sidebar .star > span, .sidebar .lbl, .sidebar nav.side a, .sidebar .meta-bottom');
  if (!band || !targets.length) return;
  targets.forEach((target) => {
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let n = walker.nextNode();
    while (n) { nodes.push(n); n = walker.nextNode(); }
    let idx = 0;
    nodes.forEach((textNode) => {
      if (!textNode.textContent.replace(/\s+/g, '')) return;
      const frag = document.createDocumentFragment();
      Array.from(textNode.textContent).forEach((c) => {
        const span = document.createElement('span');
        span.className = 'ch';
        if (!/\s/.test(c)) { span.style.setProperty('--i', idx); idx += 1; }
        span.textContent = c;
        frag.append(span);
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  });
  const TTL = 1300;
  const state = new Map();
  const timers = new Map();
  const tick = () => {
    const r = band.getBoundingClientRect();
    targets.forEach((el) => {
      const er = el.getBoundingClientRect();
      const c = er.top + er.height / 2;
      const cur = { dTop: r.top - c, dBot: r.bottom - c };
      const prev = state.get(el);
      state.set(el, cur);
      if (prev && (prev.dTop * cur.dTop < 0 || prev.dBot * cur.dBot < 0)) {
        el.removeAttribute('data-zap');
        el.getBoundingClientRect(); // force reflow so the animation restarts cleanly
        el.setAttribute('data-zap', '');
        clearTimeout(timers.get(el));
        timers.set(el, setTimeout(() => el.removeAttribute('data-zap'), TTL));
      }
    });
  };
  let raf = 0;
  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { tick(); raf = 0; });
  }, { passive: true });
  window.addEventListener('resize', () => { state.clear(); tick(); });
  tick();
}

function buildArticle(rows) {
  const article = document.createElement('div');
  article.className = 'article';
  article.id = 'main';
  const els = [];
  rows.forEach((row) => {
    const cell = row.querySelector(':scope > div') || row;
    els.push(...cell.children);
  });

  let container = article;
  let seenH1 = false;
  let ledePlaced = false;

  els.forEach((el) => {
    const tag = el.tagName;
    if (tag === 'H2') {
      const h2 = makeH2(el);
      if (h2.dataset.step === 'shortcut') {
        const band = document.createElement('div');
        band.className = 'shortcut-block';
        article.append(band);
        container = band;
      } else {
        container = article;
      }
      container.append(h2);
    } else if (tag === 'H1') {
      seenH1 = true;
      container.append(el);
    } else if (tag === 'PRE') {
      container.append(makeCode(el));
    } else if (tag === 'BLOCKQUOTE') {
      container.append(makeCallout(el));
    } else if (tag === 'P') {
      const txt = el.textContent.trim();
      if (!seenH1 && /^\d+\s*·/.test(txt)) {
        const eyebrow = document.createElement('span');
        eyebrow.className = 'eyebrow';
        const m = txt.match(/^(\d+\s*·)\s*(.*)$/);
        eyebrow.innerHTML = m ? `<span class="num">${m[1]}</span>${m[2]}` : txt;
        container.append(eyebrow);
      } else if (el.querySelector('a[href*="impeccable"]')) {
        el.classList.add('install-credit');
        container.append(el);
      } else if (seenH1 && !ledePlaced && container === article) {
        el.classList.add('lede');
        ledePlaced = true;
        container.append(el);
      } else {
        container.append(el);
      }
    } else {
      container.append(el);
    }
  });
  return article;
}

export default async function decorate(block) {
  const rows = [...block.children];

  const aside = document.createElement('aside');
  aside.className = 'sidebar';
  aside.innerHTML = SIDEBAR;

  const article = buildArticle(rows);

  const layout = document.createElement('div');
  layout.className = 'layout';
  layout.append(aside, article);

  const bleed = document.createElement('div');
  bleed.className = 'docs-bleed';
  bleed.append(layout);

  block.replaceChildren(bleed);
  block.closest('.section')?.classList.add('docs-section');
  mountZap(block);
}
