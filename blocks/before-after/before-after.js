/**
 * before-after — full-bleed two-up proof figures (before / after Stardust).
 *
 * Authoring rows (positional):
 *   1. before image  — <img>/<picture> (author-managed, stored in DA Media Bus)
 *   2. after image   — <img>/<picture>
 *
 * The images are real authored content (DA-hosted, swappable by authors); this
 * block reads them, wraps each in a labelled figure-link, and adds the animated
 * "real one" easter-egg sticker (CSS-driven) to the "after" figure.
 */

const LINK = 'https://github.com/adobe/skills/tree/main/plugins/stardust';
const LABELS = ['Before', 'After · Stardust'];

const STICKER = `
  <a class="real-sticker" href="${LINK}" target="_blank" rel="noopener"
     aria-label="It's a real one — open a real Stardust sample in a new tab">
    <svg class="rs-svg" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path id="rs-circle" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
      </defs>
      <circle class="rs-halo" cx="100" cy="100" r="88" fill="none" stroke="#e8b95e" stroke-width="2.5"/>
      <circle class="rs-halo rs-halo-2" cx="100" cy="100" r="88" fill="none" stroke="#e8b95e" stroke-width="2.5"/>
      <circle cx="100" cy="100" r="88" fill="#e8b95e"/>
      <circle cx="100" cy="100" r="82" fill="none" stroke="#0A1024" stroke-width="1.2"/>
      <g class="rs-rim">
        <text fill="#0A1024" font-family="SF Mono, JetBrains Mono, ui-monospace, monospace"
              font-size="13" font-weight="700" letter-spacing="4">
          <textPath href="#rs-circle">★ REAL · STARDUST · SAMPLE · CLICK ME · ★ REAL · STARDUST · SAMPLE · CLICK ME · </textPath>
        </text>
      </g>
      <g class="rs-logo" transform="translate(100,100) scale(0.78) translate(-100,-100)">
        <g fill="#0A1024">
          <rect x="92" y="26" width="16" height="16"/>
          <rect x="92" y="46" width="16" height="16" opacity="0.7"/>
          <rect x="92" y="66" width="16" height="16" opacity="0.5"/>
          <rect x="92" y="118" width="16" height="16" opacity="0.5"/>
          <rect x="92" y="138" width="16" height="16" opacity="0.7"/>
          <rect x="92" y="158" width="16" height="16"/>
          <rect x="26" y="92" width="16" height="16"/>
          <rect x="46" y="92" width="16" height="16" opacity="0.7"/>
          <rect x="66" y="92" width="16" height="16" opacity="0.5"/>
          <rect x="118" y="92" width="16" height="16" opacity="0.5"/>
          <rect x="138" y="92" width="16" height="16" opacity="0.7"/>
          <rect x="158" y="92" width="16" height="16"/>
        </g>
        <rect x="85" y="85" width="30" height="30" fill="#0A1024"/>
      </g>
    </svg>
    <span class="rs-tip" aria-hidden="true">It's a real one →</span>
  </a>`;

export default async function decorate(block) {
  // One media per row — query per row so a <picture> isn't double-counted with
  // its own inner <img> (the live pipeline wraps content <img> in <picture>).
  const media = [...block.querySelectorAll(':scope > div')]
    .map((row) => row.querySelector('picture, img'))
    .filter(Boolean);
  if (!media.length) return;
  const frag = document.createDocumentFragment();

  media.forEach((m, i) => {
    const isAfter = i === media.length - 1 && media.length > 1;
    const figure = document.createElement('figure');
    figure.className = isAfter ? 'after' : 'before';

    const label = LABELS[isAfter ? 1 : 0];
    const link = document.createElement('a');
    link.className = 'figure-link';
    link.href = LINK;
    link.target = '_blank';
    link.rel = 'noopener';
    // Accessible name leads with the visible label text (WCAG 2.5.3 Label in Name).
    link.setAttribute('aria-label', `${label} — open a Stardust sample in a new tab`);

    const tag = document.createElement('span');
    tag.className = 'label-tag';
    tag.textContent = label;
    link.append(tag, m);
    figure.append(link);

    if (isAfter) {
      const wrap = document.createElement('div');
      wrap.innerHTML = STICKER;
      figure.append(wrap.firstElementChild);
    }
    frag.append(figure);
  });

  block.replaceChildren(frag);
}
