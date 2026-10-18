#!/usr/bin/env node
// Builds saluxly.com: three languages from one template and three dictionaries
// (src/i18n), the support and delete-account pages, the legal texts (src/legal/*.md,
// English only), the 404 page, the sitemap, robots.txt and the web manifest. Static files only; GitHub Pages
// serves the repository root. No dependencies. Nothing is sent from the pages.
//
//   node build.mjs            → the publishable root
//   node build.mjs --preview  → the same (kept for tools/preview.sh)
//   node build.mjs --publish  → the same, but refuses to build while a placeholder like
//                               "[date Saluxly is published]" is still in any page (also when
//                               `launched` is true in src/config.json)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const PREVIEW = process.argv.includes('--preview');
const LANGS = ['en', 'es', 'pt'];

const config = JSON.parse(readFileSync(join(SRC, 'config.json'), 'utf8'));
const dictionaries = Object.fromEntries(LANGS.map((lang) => [lang, JSON.parse(readFileSync(join(SRC, 'i18n', `${lang}.json`), 'utf8'))]));
const partials = {};
for (const name of ['head', 'bar', 'footer', 'contact', 'store', 'mark', 'phone', 'page', 'sheet']) {
  partials[name] = readFileSync(join(SRC, 'partials', `${name}.html`), 'utf8');
}

// --- A small template language: {{a.b}} (escaped), {{{a.b}}} (raw), {{> partial}},
// {{#each list}}…{{/each}} with {{this}}, {{@index}}, {{@number}}, {{@first}}/{{@last}} in
// {{#if}}, and {{#if path}}…{{else}}…{{/if}} / {{#unless path}}…{{/unless}}.
function escape(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function lookup(path, scopes) {
  if (path === 'this') return scopes[scopes.length - 1];
  for (let i = scopes.length - 1; i >= 0; i--) {
    let value = scopes[i];
    if (value === null || typeof value !== 'object') continue;
    let found = true;
    for (const part of path.split('.')) {
      if (value !== null && typeof value === 'object' && part in value) value = value[part];
      else { found = false; break; }
    }
    if (found) return value;
  }
  return undefined;
}

// The {{else}} of an if/unless, ignoring any {{else}} that belongs to a nested block.
function splitElse(body) {
  const scan = /\{\{(#(?:each|if|unless)\s+[\w.@]+|\/(?:each|if|unless)|else)\}\}/g;
  let depth = 0;
  let step;
  while ((step = scan.exec(body))) {
    if (step[1].startsWith('#')) depth++;
    else if (step[1].startsWith('/')) depth--;
    else if (depth === 0) return [body.slice(0, step.index), body.slice(step.index + step[0].length)];
  }
  return [body];
}

function render(template, scopes) {
  let out = template;
  // Blocks, outermost first: the body of a block is rendered with the block's own scope, nested
  // blocks included, so a loop's {{@first}} or {{this}} is visible inside an {{#if}} within it.
  const open = /\{\{#(each|if|unless)\s+([\w.@]+)\}\}/g;
  let match;
  while ((match = open.exec(out))) {
    const [tag, kind, path] = match;
    const start = match.index;
    // Find the matching close, counting nested blocks of any kind.
    const walker = /\{\{(#(?:each|if|unless)\s+[\w.@]+|\/(?:each|if|unless))\}\}/g;
    walker.lastIndex = start + tag.length;
    let depth = 1;
    let close = null;
    let step;
    while ((step = walker.exec(out))) {
      if (step[1].startsWith('#')) depth++;
      else depth--;
      if (depth === 0) { close = step; break; }
    }
    if (!close) throw new Error(`Unclosed block: ${tag}`);
    const body = out.slice(start + tag.length, close.index);
    const value = lookup(path, scopes);
    let result = '';
    if (kind === 'each') {
      const list = Array.isArray(value) ? value : [];
      result = list.map((item, index) => render(body, [...scopes, { '@index': index, '@number': index + 1, '@first': index === 0, '@last': index === list.length - 1 }, item])).join('');
    } else {
      const [yes, no = ''] = splitElse(body);
      const truthy = Array.isArray(value) ? value.length > 0 : Boolean(value);
      result = render((kind === 'if') === truthy ? yes : no, scopes);
    }
    out = out.slice(0, start) + result + out.slice(close.index + close[0].length);
    open.lastIndex = start;
  }
  out = out.replace(/\{\{>\s*(\w+)((?:\s+[\w]+=[^\s}]+)*)\s*\}\}/g, (_, name, args) => {
    // {{> partial key=literal key2=@path}}: the arguments become the partial's innermost scope.
    const extra = {};
    for (const [, key, value] of args.matchAll(/(\w+)=([^\s}]+)/g)) extra[key] = value.startsWith('@') ? lookup(value.slice(1), scopes) : value;
    return render(partials[name], [...scopes, extra]);
  });
  out = out.replace(/\{\{\{([\w.@]+)\}\}\}/g, (_, path) => String(lookup(path, scopes) ?? ''));
  out = out.replace(/\{\{([\w.@]+)\}\}/g, (_, path) => {
    const value = lookup(path, scopes);
    if (value === undefined) throw new Error(`Missing key: ${path}`);
    return escape(value);
  });
  return out;
}

// --- The legal texts: Markdown (src/legal/*.md, never edited here) to HTML ---------------------
// What the texts use: # title, ## and ### headings, paragraphs, **bold**, "- " lists, "1. " lists
// and tables with a header row. A "## 8. Title" heading gets the id "8" (privacy.html#8); other
// headings get a slug of their words. The page title is the "# " line; the "Effective date" line
// goes under the title. contact@saluxly.com and saluxly.com/… become links; nothing else changes.

function inline(text) {
  let out = escape(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/contact@saluxly\.com/g, '<a href="mailto:contact@saluxly.com">contact@saluxly.com</a>');
  out = out.replace(/(^|[\s(])saluxly\.com\/([\w./#-]*[\w/#])/g, (_, before, path) => `${before}<a href="/${path}">saluxly.com/${path}</a>`);
  return out;
}

function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function headingId(title) {
  const numbered = /^(\d+)\.\s/.exec(title);
  return numbered ? numbered[1] : slug(title);
}

function markdown(source) {
  const lines = source.split('\n');
  const doc = { title: '', effective: '', sections: [], html: '' };
  const parts = [];
  let i = 0;
  const flushParagraph = (buffer) => { if (buffer.length) parts.push(`<p>${inline(buffer.join(' '))}</p>`); buffer.length = 0; };
  const buffer = [];
  while (i < lines.length) {
    const line = lines[i];
    if (/^# /.test(line)) { doc.title = line.slice(2).trim(); i++; continue; }
    if (/^\*\*Effective date:\*\*/.test(line) && !doc.effective) { doc.effective = inline(line); i++; continue; }
    const heading = /^(##|###) (.+)$/.exec(line);
    if (heading) {
      flushParagraph(buffer);
      const title = heading[2].trim();
      const id = headingId(title);
      if (heading[1] === '##') doc.sections.push({ id, title });
      parts.push(`<h${heading[1].length} id="${id}">${inline(title)}</h${heading[1].length}>`);
      i++; continue;
    }
    if (/^\|/.test(line)) {
      flushParagraph(buffer);
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i].trim().replace(/^\||\|$/g, '').split(' | ').map((c) => c.trim())); i++; }
      const [head, , ...body] = rows; // the second row is the |---| separator
      const columns = head.length;
      parts.push(`<div class="legal-table${columns > 2 ? ' legal-table--wide' : ''}" tabindex="0"><table><thead><tr>${head.map((c) => `<th scope="col">${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c, k) => (k === 0 ? `<th scope="row">${inline(c)}</th>` : `<td>${inline(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    const list = /^(-|\d+\.) /.exec(line);
    if (list) {
      flushParagraph(buffer);
      const ordered = list[1] !== '-';
      const items = [];
      while (i < lines.length && /^(-|\d+\.) /.test(lines[i])) { items.push(lines[i].replace(/^(-|\d+\.) /, '')); i++; }
      parts.push(`<${ordered ? 'ol' : 'ul'}>${items.map((item) => `<li>${inline(item)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    if (line.trim() === '') { flushParagraph(buffer); i++; continue; }
    buffer.push(line.trim());
    i++;
  }
  flushParagraph(buffer);
  doc.html = parts.join('\n');
  return doc;
}

// --- Placeholders: the texts keep "[date Saluxly is published]" and the like until launch ----
// A build for the public site (--publish, or `launched` true in config.json) refuses to write
// them; the ordinary build and the preview show them as they are, so they can be seen.
const PUBLISH = process.argv.includes('--publish') || config.launched === true;
const PLACEHOLDER = /\[[A-Za-z][A-Za-z ]+\]/g;
const placeholders = [];

function checkPlaceholders(path, content) {
  if (!/\.(html|xml|txt|webmanifest)$/.test(path)) return;
  const found = [...new Set(content.match(PLACEHOLDER) || [])];
  if (found.length) placeholders.push([path, found]);
}

// --- Page data ---------------------------------------------------------------------------------

// The pages and their files: the landing and the support and delete-account pages exist in the
// three languages; the legal texts only in English, and every language links to the same files.
const FILES = { landing: '', support: 'support.html', delete: 'delete-account.html', privacy: 'privacy.html', terms: 'terms.html' };
const ENGLISH_ONLY = new Set(['privacy', 'terms']);

function pageData(lang, page) {
  const t = dictionaries[lang];
  const base = lang === 'en' ? '/' : `/${lang}/`;
  const file = FILES[page];
  const englishOnly = ENGLISH_ONLY.has(page);
  return {
    t,
    lang,
    base,
    path: base + file,
    url: config.site + base + file,
    english_only: englishOnly,
    // `href` is absolute, for hreflang and the sitemap; `path` is what the language links use, so the preview stays local.
    // An English-only page has no translations: its language links lead to the home page of each language.
    alternates: LANGS.map((l) => {
      const prefix = l === 'en' ? '/' : `/${l}/`;
      const target = englishOnly ? '' : file;
      return { lang: l, href: config.site + prefix + target, path: prefix + target, current: l === lang, name: dictionaries[l].name };
    }),
    site: config.site,
    og_locale: { en: 'en_US', es: 'es_MX', pt: 'pt_BR' }[lang],
    launched: config.launched,
    app_store_url: config.app_store_url,
    play_store_url: config.play_store_url,
    config_json: JSON.stringify({ launched: config.launched }),
    is_landing: page === 'landing',
    year: new Date().getFullYear(),
    specialties_shown: 28,
    html_title: { landing: t.title, support: t.support_title, delete: t.delete_title, privacy: t.privacy_title, terms: t.terms_title }[page],
    html_description: { landing: t.description, support: t.support_description, delete: t.delete_description, privacy: t.privacy_description, terms: t.terms_description }[page],
    jsonld: page === 'landing' ? JSON.stringify(jsonLd(lang)) : '',
  };
}

function jsonLd(lang) {
  return [
    {
      '@context': 'https://schema.org', '@type': 'Organization', name: 'Saluxly, Inc.', url: config.site,
      email: 'contact@saluxly.com', logo: `${config.site}/assets/img/favicon-512.png`,
    },
    {
      '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Saluxly', applicationCategory: 'MedicalApplication',
      operatingSystem: 'iOS', inLanguage: ['en', 'es', 'pt'], url: config.site + (lang === 'en' ? '/' : `/${lang}/`),
      description: dictionaries[lang].description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ];
}

// Pages are kept in memory and written at the end, so a refused build leaves nothing behind.
const outputs = [];

function write(path, content) {
  checkPlaceholders(path, content);
  outputs.push([path, content]);
  return Buffer.byteLength(content);
}

function flush() {
  for (const [path, content] of outputs) {
    const target = join(ROOT, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  copyFileSync(join(SRC, 'site.css'), join(ROOT, 'assets', 'site.css'));
  copyFileSync(join(SRC, 'site.js'), join(ROOT, 'assets', 'site.js'));
}

// --- Build -------------------------------------------------------------------------------------

const sizes = [];
const landing = readFileSync(join(SRC, 'templates', 'landing.html'), 'utf8');
const support = readFileSync(join(SRC, 'templates', 'support.html'), 'utf8');
for (const lang of LANGS) {
  const prefix = lang === 'en' ? '' : `${lang}/`;
  sizes.push([`${prefix}index.html`, write(`${prefix}index.html`, render(landing, [pageData(lang, 'landing')]))]);
  sizes.push([`${prefix}support.html`, write(`${prefix}support.html`, render(support, [pageData(lang, 'support')]))]);
}
// Google Play asks for a direct delete-account page that names the app: one per language.
const deletePage = readFileSync(join(SRC, 'templates', 'delete.html'), 'utf8');
for (const lang of LANGS) {
  const prefix = lang === 'en' ? '' : `${lang}/`;
  sizes.push([`${prefix}delete-account.html`, write(`${prefix}delete-account.html`, render(deletePage, [pageData(lang, 'delete')]))]);
}
sizes.push(['404.html', write('404.html', render(readFileSync(join(SRC, 'templates', '404.html'), 'utf8'), [pageData('en', 'landing')]))]);

// The legal texts, from src/legal/*.md (our own texts; nothing of a policy generator), English only.
const legal = readFileSync(join(SRC, 'templates', 'legal.html'), 'utf8');
for (const page of ['privacy', 'terms']) {
  const doc = markdown(readFileSync(join(SRC, 'legal', `${page}.md`), 'utf8'));
  sizes.push([`${page}.html`, write(`${page}.html`, render(legal, [pageData('en', page), { doc }]))]);
}

const pages = [
  ...LANGS.flatMap((lang) => [pageData(lang, 'landing'), pageData(lang, 'support'), pageData(lang, 'delete')]),
  pageData('en', 'privacy'), pageData('en', 'terms'),
];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map((p) => `  <url>
    <loc>${p.url}</loc>${p.english_only ? '' : `
${p.alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.href}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${p.alternates[0].href}"/>`}
  </url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${config.site}/sitemap.xml\n`);
write('manifest.webmanifest', JSON.stringify({
  name: 'Saluxly', short_name: 'Saluxly', start_url: '/', display: 'browser', background_color: '#17100C', theme_color: '#17100C',
  icons: [{ src: '/assets/img/favicon-512.png', sizes: '512x512', type: 'image/png' }],
}, null, 2) + '\n');

// Styles and script are copied as they are (the browser gets them once; the budget is measured below).
const css = statSync(join(SRC, 'site.css')).size;
const js = statSync(join(SRC, 'site.js')).size;
const html = sizes.find(([name]) => name === 'index.html')[1];
console.log(sizes.map(([name, size]) => `${name}: ${(size / 1024).toFixed(1)} KB`).join('\n'));
console.log(`site.css: ${(css / 1024).toFixed(1)} KB, site.js: ${(js / 1024).toFixed(1)} KB, index.html + css + js: ${((html + css + js) / 1024).toFixed(1)} KB (budget 120 KB)`);
for (const lang of LANGS) {
  const n = dictionaries[lang].description.length;
  if (n < 150 || n > 160) console.warn(`warning: ${lang} description is ${n} characters (150–160 wanted)`);
}
if (placeholders.length) {
  const list = placeholders.map(([path, found]) => `  ${path}: ${found.join(', ')}`).join('\n');
  if (PUBLISH) {
    console.error(`Build refused: the site still has placeholders to fill in before it goes public ` +
      `(${process.argv.includes('--publish') ? '--publish' : 'launched is true in src/config.json'}). ` +
      `Nothing was written.\nFill them in src/legal/*.md (and wherever else they appear), then build again:\n${list}`);
    process.exit(1);
  }
  console.warn(`note: placeholders still in the text (a --publish build would refuse them):\n${list}`);
}
flush();
