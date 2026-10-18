#!/usr/bin/env node
// Builds saluxly.com: three languages from one template and three dictionaries
// (src/i18n), the support pages, the 404 page, the delete-account redirect, the
// sitemap, robots.txt and the web manifest. Static files only; GitHub Pages
// serves the repository root. No dependencies. Nothing is sent from the pages.
//
//   node build.mjs            → the publishable root
//   node build.mjs --preview  → the same (kept for tools/preview.sh)
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

// --- Page data ---------------------------------------------------------------------------------

function pageData(lang, page) {
  const t = dictionaries[lang];
  const base = lang === 'en' ? '/' : `/${lang}/`;
  const file = page === 'landing' ? '' : `${page}.html`;
  return {
    t,
    lang,
    base,
    path: base + file,
    url: config.site + base + file,
    // `href` is absolute, for hreflang and the sitemap; `path` is what the language links use, so the preview stays local.
    alternates: LANGS.map((l) => ({ lang: l, href: config.site + (l === 'en' ? '/' : `/${l}/`) + file, path: (l === 'en' ? '/' : `/${l}/`) + file, current: l === lang, name: dictionaries[l].name })),
    site: config.site,
    og_locale: { en: 'en_US', es: 'es_MX', pt: 'pt_BR' }[lang],
    launched: config.launched,
    app_store_url: config.app_store_url,
    play_store_url: config.play_store_url,
    config_json: JSON.stringify({ launched: config.launched }),
    is_landing: page === 'landing',
    year: new Date().getFullYear(),
    specialties_shown: 28,
    html_title: page === 'landing' ? t.title : t.support_title,
    html_description: page === 'landing' ? t.description : t.support_description,
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

function write(path, content) {
  const target = join(ROOT, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  return statSync(target).size;
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
sizes.push(['404.html', write('404.html', render(readFileSync(join(SRC, 'templates', '404.html'), 'utf8'), [pageData('en', 'landing')]))]);
sizes.push(['drafts/legal-template.html', write('drafts/legal-template.html', render(
  readFileSync(join(SRC, 'templates', 'legal.html'), 'utf8'),
  [pageData('en', 'legal'), JSON.parse(readFileSync(join(SRC, 'legal', 'sample.json'), 'utf8'))]))]);

// Google Play asks for a stable delete-account address: the old one stays and sends to the support page.
write('delete-account.html', `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Delete your account — Saluxly</title>
<meta http-equiv="refresh" content="0; url=/support.html#delete"><link rel="canonical" href="${config.site}/support.html">
<meta name="robots" content="noindex"><script>location.replace("/support.html#delete")</script></head>
<body><p>How to delete your Saluxly account: <a href="/support.html#delete">saluxly.com/support.html#delete</a></p></body></html>
`);

const pages = LANGS.flatMap((lang) => [pageData(lang, 'landing'), pageData(lang, 'support')]);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map((p) => `  <url>
    <loc>${p.url}</loc>
${p.alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.href}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${p.alternates[0].href}"/>
  </url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /drafts/\nSitemap: ${config.site}/sitemap.xml\n`);
write('manifest.webmanifest', JSON.stringify({
  name: 'Saluxly', short_name: 'Saluxly', start_url: '/', display: 'browser', background_color: '#17100C', theme_color: '#17100C',
  icons: [{ src: '/assets/img/favicon-512.png', sizes: '512x512', type: 'image/png' }],
}, null, 2) + '\n');

// Styles and script: copied as they are (the browser gets them once; the budget is measured below).
copyFileSync(join(SRC, 'site.css'), join(ROOT, 'assets', 'site.css'));
copyFileSync(join(SRC, 'site.js'), join(ROOT, 'assets', 'site.js'));
const css = statSync(join(ROOT, 'assets', 'site.css')).size;
const js = statSync(join(ROOT, 'assets', 'site.js')).size;
const html = sizes.find(([name]) => name === 'index.html')[1];
console.log(sizes.map(([name, size]) => `${name}: ${(size / 1024).toFixed(1)} KB`).join('\n'));
console.log(`site.css: ${(css / 1024).toFixed(1)} KB, site.js: ${(js / 1024).toFixed(1)} KB, index.html + css + js: ${((html + css + js) / 1024).toFixed(1)} KB (budget 120 KB)`);
for (const lang of LANGS) {
  const n = dictionaries[lang].description.length;
  if (n < 150 || n > 160) console.warn(`warning: ${lang} description is ${n} characters (150–160 wanted)`);
}
