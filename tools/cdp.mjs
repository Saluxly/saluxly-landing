// Drives headless Chrome over the DevTools protocol to check the behaviours of the preview:
// the form's three states, the bottom bar, the menu, the language link with the section, and
// keyboard focus. Writes screenshots to the folder given. Needs Node 24 (global WebSocket).
//   node tools/cdp.mjs OUTDIR [url]
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = process.argv[2] || 'checks';
const URL = process.argv[3] || 'http://localhost:8080/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
mkdirSync(OUT, { recursive: true });
const PORT = 9333;
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, '--window-size=1440,1000', 'about:blank'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
const send = (method, params = {}) => new Promise((resolve) => { const n = ++id; pending.set(n, resolve); ws.send(JSON.stringify({ id: n, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;
const shot = async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.result.data, 'base64')); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const mobile = (on) => send('Emulation.setDeviceMetricsOverride', on ? { width: 390, height: 844, deviceScaleFactor: 2, mobile: true } : { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

await send('Page.enable');
await send('Runtime.enable');
const results = {};
async function open(url) { await send('Page.navigate', { url }); await wait(1200); }

// 1. Form: invalid, error, success (desktop).
await mobile(false);
await open(URL);
await evaluate(`document.querySelector('#waitlist-form input[type=email]').value='nope'; document.querySelector('#waitlist-form').requestSubmit(); ''`);
await wait(200);
results.invalid = await evaluate(`document.querySelector('#waitlist-form-msg').textContent`);
await shot('form-invalid');
await evaluate(`document.querySelector('#waitlist-form input[type=email]').value='fail@example.org'; document.querySelector('#waitlist-form').requestSubmit(); ''`);
await wait(800);
results.error = await evaluate(`document.querySelector('#waitlist-form-msg').textContent`);
results.buttonAfterError = await evaluate(`document.querySelector('#waitlist-form button[type=submit]').textContent + ' disabled=' + document.querySelector('#waitlist-form button[type=submit]').disabled`);
await shot('form-error');
await evaluate(`document.querySelector('#waitlist-form input[type=email]').value='doctor@example.org'; document.querySelector('#waitlist-form').requestSubmit(); ''`);
await wait(800);
results.success = await evaluate(`[...document.querySelectorAll('.form-done')].map(e => e.textContent)`);
results.formsHidden = await evaluate(`[...document.querySelectorAll('[data-waitlist]')].map(f => getComputedStyle(f.querySelector('.waitlist-row')).display)`);
await shot('form-success');

// 2. Language link keeps the section; keyboard focus ring.
await open(URL + '#pricing');
await wait(600);
results.scrollY = await evaluate(`window.scrollY`);
results.langHref = await evaluate(`(() => { const a = document.querySelector('.bar [data-lang=es]'); a.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true})); return a.getAttribute('href'); })()`);
results.remembered = await evaluate(`localStorage.getItem('saluxly-lang')`);
await evaluate(`localStorage.removeItem('saluxly-lang'); ''`);
await open(URL);
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
results.firstTab = await evaluate(`document.activeElement.className + ' ' + document.activeElement.textContent.trim()`);
await shot('focus-skip');
for (let i = 0; i < 6; i++) { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); }
results.seventhTab = await evaluate(`document.activeElement.textContent.trim() || document.activeElement.tagName`);
await shot('focus-nav');

// 3. Mobile: bottom bar, menu, offer strip (Spanish browser).
await mobile(true);
await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', acceptLanguage: 'es-MX,es' });
await open(URL);
await wait(400);
results.offer = await evaluate(`(() => { const o = document.querySelector('[data-offer]'); return o.hidden ? 'hidden' : o.textContent.trim().replace(/\\s+/g, ' '); })()`);
await shot('mobile-top');
results.bottomAtTop = await evaluate(`document.querySelector('[data-bottom-bar]').hidden`);
await evaluate(`window.scrollTo({top: 2200, behavior: 'instant'}); ''`);
await wait(700);
results.bottomAfterScroll = await evaluate(`document.querySelector('[data-bottom-bar]').hidden`);
await shot('mobile-bottom-bar');
await evaluate(`document.querySelector('#waitlist-final').scrollIntoView({behavior:'instant'}); ''`);
await wait(700);
results.bottomAtFinalForm = await evaluate(`document.querySelector('[data-bottom-bar]').hidden`);
await evaluate(`window.scrollTo(0, 0); document.querySelector('[data-menu-button]').click(); ''`);
await wait(300);
results.menuOpen = await evaluate(`!document.querySelector('[data-menu]').hidden + ' expanded=' + document.querySelector('[data-menu-button]').getAttribute('aria-expanded') + ' focus=' + document.activeElement.textContent.trim()`);
await shot('mobile-menu');
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await wait(200);
results.menuAfterEsc = await evaluate(`document.querySelector('[data-menu]').hidden`);
results.horizontalScroll360 = await (async () => { await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 780, deviceScaleFactor: 2, mobile: true }); await open(URL); return evaluate(`document.documentElement.scrollWidth + ' vs ' + document.documentElement.clientWidth`); })();
await shot('mobile-360');

// 4. Reduced motion: the fibre is complete at once and the page visible.
await mobile(false);
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await open(URL);
results.reducedMotion = await evaluate(`getComputedStyle(document.querySelector('.hero-fiber .fiber-path')).animationName + ' / page opacity ' + getComputedStyle(document.querySelector('.hero-page .page')).opacity`);
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
await open(URL);
await wait(1600);
results.motionDone = await evaluate(`getComputedStyle(document.querySelector('.hero-page .page')).opacity + ' / dashoffset ' + getComputedStyle(document.querySelector('.hero-fiber .fiber-path')).strokeDashoffset`);

console.log(JSON.stringify(results, null, 2));
ws.close();
chrome.kill();
