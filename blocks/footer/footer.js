/**
 * footer — editorial colophon (brand mark, tagline, links, meta line).
 *
 * Fixed site chrome, identical on every page, rendered verbatim from the
 * prototype <footer class="colophon">.
 */

const GITHUB = 'https://github.com/adobe/skills/tree/main/plugins/stardust';
const LICENSE = 'https://github.com/adobe/skills/blob/main/LICENSE';

export default async function decorate(block) {
  block.textContent = '';
  const colophon = document.createElement('div');
  colophon.className = 'colophon';
  colophon.innerHTML = `
    <div class="container">
      <div class="mark-row">
        <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
          <g fill="#e8b95e">
            <rect x="11" y="3" width="2" height="3"/><rect x="11" y="18" width="2" height="3"/>
            <rect x="3" y="11" width="3" height="2"/><rect x="18" y="11" width="3" height="2"/>
            <rect x="10" y="10" width="4" height="4"/>
          </g>
        </svg>
        <span class="wordmark">Stardust</span>
      </div>

      <p class="tagline">A design-phase toolkit. <em>Math, not mysticism.</em></p>

      <div class="links">
        <a href="/docs/">Docs</a>
        <span class="dot">·</span>
        <a href="${GITHUB}" rel="external">GitHub</a>
        <span class="dot">·</span>
        <a href="${LICENSE}" rel="external">Apache 2.0 License</a>
      </div>

      <div class="meta">
        brief <span class="op">+</span> seed <span class="op">=</span> star <span class="op">·</span> 2026
      </div>
    </div>`;
  block.append(colophon);
}
