# saluxly.com

The landing page of Saluxly, a static site on GitHub Pages: three languages, no frameworks, no
analytics, no cookies, no third-party requests, and nothing is sent from the pages. The design and the
specification live in `design/` (`DESIGN-landing.md`, the boards in `reference/` and `screenshots/`).

## Layout of the repository

- `src/` — what is edited: `templates/` (landing, support, legal, 404), `partials/` (head, bar, footer,
  form, mark, phone, page, sheet), `i18n/{en,es,pt}.json` (every text of the site), `site.css`,
  `site.js`, `config.json` (launch state and store links), `legal/sample.json` (the sample
  content of the legal template).
- `build.mjs` — generates the publishable root from `src/`: `/`, `/es/`, `/pt/`, `support.html` in
  the three languages, `404.html`, `delete-account.html` (a redirect to `support.html#delete`),
  `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, and copies `site.css` and `site.js` to
  `assets/`. It prints the sizes against the 120 KB budget and warns when a meta description is
  outside 150–160 characters.
- `assets/` — fonts (woff2, Latin subset), images (the app screens as WebP with PNG fallback, the
  share image, the conduction mark, favicons), `site.css`, `site.js`.
- `tools/` — `fonts.sh` (subsets the typefaces from the app's font packages), `images.py` (screens,
  share image, favicons), `preview.sh`/`preview.py` (local preview), `shots.sh`
  (full-page screenshots at six widths), `cdp.mjs` (behaviour checks in headless Chrome).
- `privacy.html`, `terms.html` — the current legal pages, untouched until the new texts arrive.
  `drafts/legal-template.html` shows the "Legal page" template with sample content; it is not linked.
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
