/**
 * header — the fixed Stardust nav (brand mark + Docs CTA + GitHub link).
 *
 * The nav is fixed site chrome, identical on every page, so it is rendered
 * verbatim here rather than authored as content. The brand SVG and links are
 * lifted from the prototype <nav class="nav">.
 */

const GITHUB = 'https://github.com/adobe/skills/tree/main/plugins/stardust';

export default async function decorate(block) {
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.setAttribute('aria-label', 'Main');
  nav.innerHTML = `
    <div class="nav-row">
      <a href="/" class="nav-mark" aria-label="Stardust home">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <g fill="#e8b95e">
            <rect x="11" y="3" width="2" height="3"/><rect x="11" y="18" width="2" height="3"/>
            <rect x="3" y="11" width="3" height="2"/><rect x="18" y="11" width="3" height="2"/>
            <rect x="10" y="10" width="4" height="4"/>
          </g>
        </svg>
        Stardust
      </a>
      <div class="nav-meta">
        <a class="nav-cta" href="/docs/">Docs</a>
        <a href="${GITHUB}" rel="external">GitHub <span class="op">›</span></a>
      </div>
    </div>`;
  block.append(nav);
}
