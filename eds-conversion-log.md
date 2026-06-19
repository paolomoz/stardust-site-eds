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
