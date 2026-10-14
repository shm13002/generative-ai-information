// Renders key states in headless Chromium (Playwright) -> screens/*.png. Fails on any page error.
import { chromium } from 'playwright-core'; import { mkdirSync } from 'node:fs'; import { server } from './serve.js';
const exe = process.env.CHROME || `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`;
const states = (process.argv[2] || 'rest,alert,listening,skeleton,todo,reshape,approval,receipt,jobs,history,error,offline,permission,source,gallery').split(',');
mkdirSync('screens', { recursive: true }); await new Promise((r) => server.listen(5174, r));
const b = await chromium.launch({ executablePath: exe }); let bad = 0;
for (const s of states) {
  const p = await b.newPage({ viewport: s === 'gallery' ? { width: 1760, height: 1400 } : { width: 1280, height: 800 } }); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(`http://localhost:5174/renderer/index.html?state=${s}&mute`); await p.waitForSelector('body[data-ready="1"]', { timeout: 15000 }); await p.waitForTimeout(250);
  await p.screenshot({ path: `screens/${s}.png`, fullPage: s === 'gallery' }); if (errs.length) { bad++; console.log(s, 'ERRORS', errs); } else console.log(s, 'ok'); await p.close();
}
for (const [n, qs] of [['light-floating', 'state=todo&theme=light&display=floating'], ['floating-dark', 'state=approval&display=floating'], ['reduced-todo', 'state=todo&reduce']]) { const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); await p.goto(`http://localhost:5174/renderer/index.html?${qs}&mute`); await p.waitForSelector('body[data-ready="1"]'); await p.screenshot({ path: `screens/${n}.png` }); console.log(n, 'ok'); await p.close(); }
await b.close(); server.close(); process.exit(bad ? 1 : 0);
