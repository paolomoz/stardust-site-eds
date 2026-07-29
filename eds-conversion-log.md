# EDS conversion log — Stardust home

Source prototype: `/Users/paolo/stardust/stardust-site/index.html` (stardust:prototype, variant C).
Target: this EDS project (`paolomoz/stardust-site-eds`). Single page → `/index`.

## Direction locked

- **Runtime: boilerplate, NOT AuthorKit.** The target is a vanilla `aem-boilerplate`
  (`scripts/aem.js` + `scripts/scripts.js`, `header`/`footer` blocks). Every type family
  in the prototype is a **system stack** (`SF Pro Display` / `SF Pro Text` / `SF Mono`
  → `system-ui`), so the AuthorKit `body.session` font-gating / self-host / CLS machinery
  is moot — there are no webfonts. Porting AuthorKit would add a large vendored runtime
  and its ~20 documented bugs for zero benefit here, so we kept the boilerplate runtime
  and mapped the prototype's `.ds-btn` to the boilerplate `.button.primary/.secondary`
  link-decorator convention (`<strong><a>` / `<em><a>`).
- **One prototype `<section>` = one block.** Names = section class, kebab-cased.

## Block inventory

| Block | Prototype section | Ground | Notes |
|---|---|---|---|
| `hero` | `header.hero` | ink (radial glow) | single `<h1>`; dust speckle + hex codes injected in JS; 2 CTAs via emphasis convention; quickstart note |
| `before-after` | `.ba-bleed` | full-bleed pair | 2 figures; animated "real one" sticker (CSS-only); images self-hosted |
| `the-seed` | `.b` 01 | ink | head, h2, shift-row, lede, 2 cards |
| `the-loop` | `.b` 02 | cream/dust | head, h2, lede (intro to pipeline) |
| `the-pipeline` | `.pipeline-scene` | full-bleed dark | lane + 4 pills + 3 cards |
| `ai-facing-brand` | `.b` 03 | ink | head, h2, lede, 3 cards |
| `deploy-contribute` | `.b` 04 | ink | head, h2, 2 divided cols + install code block |
| `aem-route` | `.b` 05 | cream/dust | head, h2, lede, CTA link, credit |
| `header` | `nav.nav` | — | fixed dark nav; static (rendered in block JS, not authored) |
| `footer` | `footer.colophon` | — | colophon; static (rendered in block JS) |

## Decisions / deviations

- **Chrome is static** (rendered directly in `header.js` / `footer.js`), not authored
  content — the nav and colophon are fixed site chrome with inline SVG logos. No `/nav`
  or `/footer` content fragments needed.
- **Images:** prototype `assets/{before,after}.png` were 2.1 MB / 5.4 MB. Re-encoded with
  `sips` to 1600-px JPEG (≈190 KB / 204 KB) at `assets/{before,after}.jpg`, referenced
  root-relative in authored content (served from the code bus, works in every env).
- **Links:** before/after figure links + the easter-egg sticker point at the GitHub repo
  (the prototype's `/sample.html?slug=…` samples are internal-only and don't exist on EDS).
  Internal IA links `/docs/` and `/aem/` are kept as-authored — they 404 until those pages
  are created.
- **`wrapTextNodes` (aem.js):** the boilerplate wraps loose cell text in `<p>` before
  block JS runs (unless the cell's first child is `P/PRE/UL/OL/PICTURE/TABLE/Hn`). Head
  detection therefore keys on **cell count** (`cells.length >= 2`), and right-meta is read
  via `textContent` (reading the wrapped cell's `innerHTML` nests a `<p>` that inherits the
  cream-section `--dust-72` colour and goes invisible — caught + fixed in QA for the-loop
  and aem-route).

## QA (local harness, no DA)

`qa/index.html` harness (metadata stripped) on the aem dev server, Playwright probes:
1 `<h1>`, 5 `<h2>`, 10 `<h3>`; nav + footer present; 2 buttons; card/pill counts match
authored; before/after images render at native aspect (no stretch); no console errors;
no horizontal scroll at 1600 px; content constrained to `--maxw` 1320 except intended
full-bleed (before-after, pipeline background). All sections eyeballed against the
prototype — faithful.

## Lint

`npm run lint` clean. `.stylelintrc.json` adds `no-descending-specificity: null` (noisy
order-only rule); single-line multi-declaration rules expanded to satisfy
`declaration-block-single-line-max-declarations`.

---

# EDS conversion log — AEM page (`/aem`)

Source: `stardust-site/aem/index.html`. Deployed to `content/aem.html` → `/aem`.
Its own design system (`--maxw: 1180`, different scales/grounds), so it does NOT
reuse the home content blocks — only the global `header`/`footer` chrome is shared
(the page's "Stardust × AEM" nav/footer variants are not reproduced; one site nav).

| Block | Section | Ground | Notes |
|---|---|---|---|
| `aem-hero` | hero | ink (radial) | eyebrow, 2-line h1 (amber-italic line 2), highlighted lede, chip row, embedded framed before/after (fixed code-bus assets), cursor-following star |
| `aem-cards` | 01 The shift | ink-soft (`soft` variant) | head + h2 + lede + 3 cards |
| `aem-cards` | 02 Why AEM EDS | ink (default) | **reused** — same block, no variant |
| `aem-bridge` | 03 The bridge | ink-soft | head + h2 + lede + 3-node arch flow (middle = `signal`) + foot |
| `aem-steps` | 04 Ship your first page | cream | head + h2 + lede + numbered 2-col steps |

Reuse decision (per request): sections 01 & 02 are the same card pattern → ONE
`aem-cards` block with a `soft` ground variant. The other three sections are
distinct → new blocks. `aem-cards.js` segments by cell count / `h3`; right-meta
operators (`› · →`) are amber-wrapped in JS. before/after images are injected as
fixed block assets (root-relative `/assets/*.jpg`, same #75 fix as the home page).

QA: 1 `<h1>`, 4 h2, 6 h3; all blocks present; signal node correct; images load at
native AR; no console errors; no h-scroll. Deployed to branch `stardust-home`,
preview `about:error` = 0. Lint clean.

---

# Update — images moved to DA Media Bus

The before/after screenshots are now **author-managed DA content**, not code-bus
assets. Uploaded the optimized JPEGs to DA at `/media/stardust/{before,after}.jpg`
(`PUT admin.da.live/source/.../media/...`, served from `content.da.live`), and
author them as real `<img src="https://content.da.live/.../media/stardust/*.jpg">`
in the content. The preview pipeline ingests them into Media Bus and delivers
optimized responsive `<picture>` (content-addressed, deduped across both pages).
Removed `assets/*.jpg` from the repo.

`before-after` and `aem-hero` now READ the authored images (don't inject fixed
assets). Gotcha fixed: collect **one media per row** (`row.querySelector('picture,
img')`) — a block-wide `querySelectorAll('picture, img')` double-counts each
`<picture>` with its own inner `<img>` once the pipeline wraps them, yielding 2×
the figures (invisible in the bare-`<img>` harness, only appears live).

---

# EDS conversion log — docs page (`/docs/`)

Source: `stardust-site/docs/index.html`. Deployed to `content/docs/index.html`
→ served at **`/docs/`** (the `index` document is served at the folder path;
`/docs/index` itself 404s — index convention, and the nav already links `/docs/`).

A different page type — a split **sidebar + prose article** docs layout on a
cream ground. Per the strict reuse rule (reuse only if the *design* is identical):
- **`header` + `footer`** reused (global chrome; same nav + colophon — the
  footer's slightly different prototype padding is ignored since chrome is shared).
- Everything else is one new **`docs`** block (the docs layout exists nowhere else).

### `docs` block
Renders the full split layout: full-bleed cream `.docs-bleed` → centered 1320
`.layout` grid (`::before` ink sidebar rail + `::after` amber side-borders) →
sticky `aside.sidebar` (fixed docs chrome: star, nav links, meta) + `.article`.

The **article is authored content** (one section per cell, each starting with a
valid wrapper so `wrapTextNodes` leaves the `<pre>`/`<blockquote>` intact). DA
strips `<span>`/classes, so the decorative bits are reconstructed in `decorate()`:
- eyebrow — first `<p>` matching `NN ·`
- h1 accent — authored `<em>` (= the amber-italic `.ital`)
- h2 step label — authored `Step|Heading` split on the `|` delimiter
- code prompts/comments — leading `$`/`›`, `#` lines, ` — ` trailing → `.prompt`/`.comment`
- callout — authored `<blockquote>`
- shortcut band — the h2 whose step is `Shortcut` opens an inverted full-bleed
  band (negative-margin breakout left across the sidebar) that runs until the
  next h2
Sidebar zap easter egg ported (per-char jolt as the band's rule crosses sidebar
elements on scroll), reduced-motion gated.

QA (live `/docs/`): decorated; 1 h1; 7 h2 with steps; 9 code blocks (15 prompts);
3 callouts; 1 shortcut band; 2 sidebar links; cream ground; no h-scroll; no
console errors. `about:error` = 0. Lint clean.

---

# EDS conversion log — Commands page (`/docs/commands/`)

Source: `stardust-site/docs/commands/index.html` → `content/docs/commands/index.html`
→ served at **`/docs/commands/`** (index convention).

Shares the docs split-layout *shell* with `/docs/` (same sidebar + grid + ink
rail design) but the article design is substantially different (mono `/`+name
command headings, mono section labels, flag spec lists, writes lists, TOC,
breadcrumb, addendum). Per the strict reuse rule (reuse only if the design is
*exactly* the same), that different article design → a NEW `docs-commands`
block; the `docs` block's step-headings / shortcut-band / zap reconstruction
doesn't fit. The shell is duplicated (same design, but it lives inside the
atomic `docs` block, so it can't be partially reused) — self-contained per the
methodology. `header`/`footer` reused.

### `docs-commands` block
Same shell as `docs`, with a reference article reconstructed from preserve-list
tags + delimiters (DA strips `<span>`/classes):
- breadcrumb — first `<p>` linking `/docs/`; eyebrow — `NN ·`; h1 accent — `<em>`
- TOC — an `<ol>` of anchors, each `name|step` (split on `|`)
- command h2 — `stardust:name` → `/` slash + name; `name — suffix` → suffix label;
  `+name` opens the prepare-migration addendum box
- h3 mono labels (Syntax/Flags/Requires/Writes/Outputs/Example) drive the next list:
  a `<ul>` after Flags/Requires → `dl.spec` (split each `li` on ` :: ` into dt/dd);
  after Writes/Outputs → `ul.writes` (code path + `.desc`)
- code — leading `$`/`›` prompts, `#`/trailing comments, `<…>`/`[…]`/`"…"` args.
  **Bug fixed in QA:** wrap args BEFORE prepending the prompt span — otherwise the
  arg `"…"` rule matches the prompt span's own `class="prompt"` attribute and
  corrupts it (args + prompts together; only the live/decorated render shows it).

QA (live `/docs/commands/`): decorated; 1 h1; 7 command sections; 8 spec lists +
8 writes lists; 1 addendum; 25 code prompts + 20 args (clean); TOC (7); "Commands"
active in the sidebar; no h-scroll; no console errors. Lint clean.

---

# EDS conversion log — How-to / migration playbook page (`/aem/how-to`)

Source prototype: `stardust-site/aem/how-to/index.html` (the migration prompt
playbook, generalized from the omada-health session runbook). Deployed to
`content/aem/how-to.html` → `/aem/how-to`.

Same design system as the `/aem` page (1180 max-width, ink/amber/mono grounds),
but three genuinely new patterns → three new blocks (strict reuse rule: the /aem
blocks' compositions don't match — aem-hero carries a before/after pair, this
hero carries "provide" cards; aem-cards cards are lbl+h3+p 3-up, cadence cards
are lbl+p 2-up cream).

| Block | Section | Ground | Notes |
|---|---|---|---|
| `aem-howto-hero` | hero | ink (radial) | eyebrow, 2-line h1, highlighted lede, chips, 2 "provide" cards; dust speckle + hex codes + cursor star in JS (shared design with aem-hero, duplicated per one-block-per-pattern) |
| `aem-phases` | Act I / Act III | `soft` (ink-soft) | head (Act eyebrow + right meta) + h2 + phase rows |
| `aem-phases` | Act II | default (body ink-deep) | **reused** — same block, no variant |
| `aem-notes` | cadence notes | cream | head + h2 + lede + 2-col lbl+p cards |

Decisions / notes:
- **Phase row = 2 cells: marker | body.** Marker cell is `<p>NN</p><p>tag</p>`;
  body cell starts with `<h3>` (wrapTextNodes-safe) then flows `<p>` prose,
  `<pre>` prompts, `<blockquote>` check callouts in authored order.
- **Prompts are authored `<pre>`** (docs-page precedent). `decorate()` wraps each
  in a `.prompt` chrome (bar + Copy button, clipboard API) and re-highlights the
  leading command token (`/stardust:*`, `approve`, `Render it`) and
  `&lt;PLACEHOLDER&gt;` args from escaped textContent — DA strips spans, so the
  accents are reconstructed, never authored.
- **Notes** — a body `<p>` whose first node is `<em>` renders as `.note`
  (smaller/faded), matching the prototype's `p.note`.
- Eyebrow num regex extended for this page's `Act I ·` / `++ ·` prefixes.
- `/aem` page lede (aem-steps) now links `/aem/how-to`.
- Lint: `npm run lint` clean. davids-model-lint: D15 🔴 on `&lt;SITE_URL&gt;`-class
  placeholders — accepted false-positive for command-reference pages (identical
  verdict on the shipped /docs and /docs/commands content); D3 🟡 cell-count mix
  (2-cell head/marker rows + 1-cell body rows) is the same shape the shipped
  pages use — justified, not a span.
