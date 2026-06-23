/**
 * docs-commands — the Commands reference page. Same split docs layout shell as
 * the `docs` block (sidebar + grid), with a reference-style article.
 *
 * The article is authored content; DA strips <span>/classes, so the reference
 * structures are reconstructed in decorate() from preserve-list tags + simple
 * delimiters:
 *   - breadcrumb   — a <p> whose first child links to /docs/
 *   - eyebrow      — a <p> matching "NN ·"
 *   - h1 accent    — authored <em>
 *   - page lede    — the first <p> after h1 (before any command section)
 *   - TOC          — an <ol> of anchors, each "name|step"
 *   - command h2   — "stardust:name" (slash prepended) or "name — suffix"
 *                    ("+name" marks the prepare-migration addendum box)
 *   - h3 labels    — Syntax / Flags / Requires / Writes / Outputs / Example
 *   - cmd-lede     — the first <p> after each h2
 *   - flag spec    — a <ul> after a Flags/Requires h3, each li "flag :: desc"
 *   - writes list  — a <ul> after a Writes/Outputs h3, each li "<code> :: desc"
 *   - code         — leading $/› prompts, # / trailing comments, <…>/[…] args
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
    <a href="/docs/"><span>Get started</span><span class="num">01</span></a>
    <a href="/docs/commands/" aria-current="page"><span>Commands</span><span class="num">02</span></a>
  </nav>
  <div class="meta-bottom">brief <span class="op">+</span> seed <span class="op">=</span> star</div>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function makeCode(pre) {
  const out = document.createElement('pre');
  out.className = 'code';
  out.innerHTML = pre.textContent.replace(/\n+$/, '').split('\n').map((line) => {
    let l = esc(line);
    // split off a trailing "# comment" (kept verbatim, not arg-highlighted)
    let comment = '';
    const cm = l.match(/(\s#.*)$/);
    if (cm) { comment = `<span class="comment">${cm[1]}</span>`; l = l.slice(0, cm.index); }
    // Wrap args on the escaped text FIRST, then prepend the prompt span — doing
    // it the other way round lets the arg's "…" rule match the prompt span's own
    // class="prompt" attribute and corrupt it.
    l = l.replace(/(&lt;.+?&gt;|\[[^\]]+?\]|"[^"]*")/g, '<span class="arg">$1</span>');
    l = l.replace(/^(\s*)([$›])\s/, '$1<span class="prompt">$2</span> ');
    return l + comment;
  }).join('\n');
  return out;
}

function splitFirst(html, delim) {
  const i = html.indexOf(delim);
  if (i < 0) return [html, ''];
  return [html.slice(0, i).trim(), html.slice(i + delim.length).trim()];
}

function buildSpec(ul) {
  const dl = document.createElement('dl');
  dl.className = 'spec';
  [...ul.children].forEach((li) => {
    const [term, desc] = splitFirst(li.innerHTML, '::');
    const dt = document.createElement('dt');
    dt.innerHTML = term;
    const dd = document.createElement('dd');
    dd.innerHTML = desc;
    dl.append(dt, dd);
  });
  return dl;
}

function buildWrites(ul) {
  const list = document.createElement('ul');
  list.className = 'writes';
  [...ul.children].forEach((li) => {
    const [code, desc] = splitFirst(li.innerHTML, '::');
    const out = document.createElement('li');
    out.innerHTML = code;
    if (desc) {
      const span = document.createElement('span');
      span.className = 'desc';
      span.innerHTML = desc;
      out.append(span);
    }
    list.append(out);
  });
  return list;
}

function buildToc(ol) {
  const box = document.createElement('div');
  box.className = 'toc';
  const lbl = document.createElement('span');
  lbl.className = 'lbl';
  lbl.textContent = 'On this page';
  const list = document.createElement('ol');
  [...ol.children].forEach((li) => {
    const a = li.querySelector('a');
    if (!a) return;
    const [name, step] = splitFirst(a.textContent, '|');
    const out = document.createElement('li');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.innerHTML = `<span>${name}</span>${step ? `<span class="step">${step}</span>` : ''}`;
    out.append(link);
    list.append(out);
  });
  box.append(lbl, list);
  return box;
}

function makeH2(el) {
  const h2 = document.createElement('h2');
  const [name, suffix] = splitFirst(el.textContent.trim(), ' — ');
  const id = name.replace(/^stardust:/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  h2.id = id;
  h2.innerHTML = `<span class="slash">/</span><span class="name">${name}</span>${suffix ? `<span class="suffix">— ${suffix}</span>` : ''}<a class="permalink" href="#${id}" aria-label="Copy link to ${name}">#</a>`;
  return h2;
}

/**
 * Wire each command-heading permalink: clicking it follows the anchor (updates
 * the URL so the address bar holds a direct link) and copies the full URL to
 * the clipboard with brief feedback.
 */
function wirePermalinks(scope) {
  scope.querySelectorAll('a.permalink').forEach((a) => {
    a.addEventListener('click', () => {
      const id = a.getAttribute('href').slice(1);
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(url).then(() => {
        a.classList.add('copied');
        window.setTimeout(() => a.classList.remove('copied'), 1400);
      }).catch(() => { /* clipboard blocked — the anchor still updates the URL */ });
    });
  });
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
  let section = null;
  let h3label = '';
  let seenH1 = false;
  let pageLede = false;
  let sectionLede = false;

  els.forEach((el) => {
    const tag = el.tagName;
    const text = el.textContent.trim();

    if (tag === 'P' && !seenH1 && el.querySelector('a[href="/docs/"]')) {
      const bc = document.createElement('p');
      bc.className = 'breadcrumb';
      bc.innerHTML = el.innerHTML.replace(/›/g, '<span class="sep">›</span>');
      article.append(bc);
    } else if (tag === 'P' && !seenH1 && /^\d+\s*·/.test(text)) {
      const eb = document.createElement('span');
      eb.className = 'eyebrow';
      const m = text.match(/^(\d+\s*·)\s*(.*)$/);
      eb.innerHTML = `<span class="num">${m[1]}</span>${m[2]}`;
      article.append(eb);
    } else if (tag === 'H1') {
      seenH1 = true;
      article.append(el);
    } else if (tag === 'OL') {
      article.append(buildToc(el));
    } else if (tag === 'H2') {
      if (text.startsWith('+')) {
        const aname = text.slice(1).trim();
        const aid = aname.replace(/^stardust:/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
        const add = document.createElement('div');
        add.className = 'cmd-addendum';
        add.id = aid;
        const lbl = document.createElement('span');
        lbl.className = 'addendum-lbl';
        lbl.textContent = 'Addendum';
        const h = document.createElement('div');
        h.className = 'addendum-h';
        h.innerHTML = `<span class="slash">/</span>${aname}<a class="permalink" href="#${aid}" aria-label="Copy link to ${aname}">#</a>`;
        add.append(lbl, h);
        (section || article).append(add);
        container = add;
      } else {
        section = document.createElement('section');
        section.className = 'cmd';
        section.append(makeH2(el));
        article.append(section);
        container = section;
      }
      h3label = '';
      sectionLede = false;
    } else if (tag === 'H3') {
      h3label = text.toLowerCase();
      container.append(el);
    } else if (tag === 'PRE') {
      container.append(makeCode(el));
    } else if (tag === 'BLOCKQUOTE') {
      const callout = document.createElement('div');
      callout.className = 'callout';
      [...el.childNodes].forEach((n) => callout.append(n.cloneNode(true)));
      container.append(callout);
    } else if (tag === 'UL') {
      if (h3label === 'flags' || h3label === 'requires') container.append(buildSpec(el));
      else if (h3label === 'writes' || h3label === 'outputs') container.append(buildWrites(el));
      else container.append(el);
    } else if (tag === 'P') {
      if (seenH1 && container === article && !pageLede) {
        el.classList.add('page-lede');
        pageLede = true;
        article.append(el);
      } else if (section && !sectionLede && (container === section || container.classList.contains('cmd-addendum'))) {
        el.classList.add('cmd-lede');
        sectionLede = true;
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
  wirePermalinks(article);

  const layout = document.createElement('div');
  layout.className = 'layout';
  layout.append(aside, article);

  const bleed = document.createElement('div');
  bleed.className = 'docs-bleed';
  bleed.append(layout);

  block.replaceChildren(bleed);
}
