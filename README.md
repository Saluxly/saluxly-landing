# saluxly.com

The landing page of Saluxly, a static site on GitHub Pages: three languages, no frameworks, no
analytics, no cookies, no third-party requests, and nothing is sent from the pages. The design and the
specification live in `design/` (`DESIGN-landing.md`, the boards in `reference/` and `screenshots/`).

## Layout of the repository

- `src/` — what is edited: `templates/` (landing, support, delete, legal, 404), `partials/` (head, bar,
  footer, contact, store, mark, phone, page, sheet), `i18n/{en,es,pt}.json` (every text of the site),
  `site.css`, `site.js`, `config.json` (launch state and store links), `legal/privacy.md` and
  `legal/terms.md` (the legal texts, in English; the source of `privacy.html` and `terms.html`, never
  edited by hand in HTML).
- `build.mjs` — generates the publishable root from `src/`: `/`, `/es/`, `/pt/`, `support.html` and
  `delete-account.html` in the three languages, `privacy.html` and `terms.html` (English only, from
  the Markdown; `## 8. …` headings get the anchor `#8`), `404.html`, `sitemap.xml`, `robots.txt`,
  `manifest.webmanifest`, and copies `site.css` and `site.js` to `assets/`. It prints the sizes
  against the 120 KB budget and warns when a meta description is outside 150–160 characters.
  `node build.mjs --publish` (or `launched: true` in `config.json`) refuses to build while a
  placeholder such as `[date Saluxly is published]` is still in any page, and writes nothing.
- `assets/` — fonts (woff2, Latin subset), images (the app screens as WebP with PNG fallback, the
  share image, the conduction mark, favicons), `site.css`, `site.js`.
- `tools/` — `fonts.sh` (subsets the typefaces from the app's font packages), `images.py` (screens,
  share image, favicons), `preview.sh`/`preview.py` (local preview), `shots.sh`
  (full-page screenshots at six widths), `cdp.mjs` (behaviour checks in headless Chrome).
- `CNAME` — the custom domain. GitHub Pages serves the repository root.

## Working on it

```sh
node build.mjs                 # publishable build (commit the result)
tools/preview.sh               # local preview at http://localhost:8080/
.venv/bin/python tools/images.py   # after changing the screens (design/screens-real/ wins over design/screens/)
tools/fonts.sh                 # after changing the typefaces
```

`tools/preview.sh` needs Python 3; `images.py` and `fonts.sh` need `python3 -m venv .venv && .venv/bin/pip install fonttools brotli pillow`.
Node 24 is enough for the build itself.

## Contact

Nothing is sent from the pages: the hero, the final section and the bar's button link to
`mailto:contact@saluxly.com?subject=Saluxly launch`.

## Launch

Set `"launched": true` and the store URLs in `src/config.json`, drop Apple's official badge at
`assets/img/app-store-badge.svg` (and Google's at `assets/img/google-play-badge.png` when Android
ships), rebuild. The contact blocks become the store buttons and the hero note shortens. The desktop QR
code of the "Hero after launch" board is still to be made.
