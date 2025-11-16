# SKLAD.digital Website

A static, data-driven site for the SKLAD creative space in Prague. Content (members, benefits, FAQ) is stored in JSON and rendered into HTML/CSS/JS at build time.

## Getting Started

- Requirements: Node.js 18+ and Python 3 (for a quick local server).
- Install dependencies: `npm install` (none beyond core Node, but keeps scripts available).
- Build the site: `npm run build` → generates `index.html`, `styles/main.css`, and copies JS modules to `scripts/`.

## Develop & Preview

- After building, start a static server from the repo root: `python3 -m http.server 4173` and open `http://localhost:4173`.
- Edit content in `src/data/` (`members.json`, `benefits.json`, `faq.json`), layout in `src/templates/` and `src/partials/`, scripts in `src/js/`, styles in `src/styles/`. Re-run `npm run build` to regenerate outputs.

## Project Structure

- `src/templates/layout.html` – page shell with placeholders.
- `src/partials/` – shared sections (hero, about, community, callout, footer, lightbox, scripts).
- `src/data/` – structured content driving members/benefits/FAQ.
- `src/js/` – modular ES modules per feature (nav, carousel, lightbox, autoplay, etc.); `main.js` orchestrates.
- `src/styles/` – layered CSS (tokens, layout, components, sections, lightbox, responsive, utilities).
- `scripts/build.js` – composes HTML from data/partials, concatenates CSS layers, copies JS to `scripts/`.
- `assets/` – images and media referenced by the site.

## Notes

- The site must be opened via HTTP (not `file://`) because ES modules are loaded with `type="module"`.
- Videos default to muted/autoplay on scroll via IntersectionObserver; lightbox reuses existing media sources and un-mutes in the dialog.
