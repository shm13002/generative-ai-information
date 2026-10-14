// Builds dist/brim.html: ONE self-contained file (CSS, JS modules, OGG sounds inlined). Open it directly in Chrome/Safari/Edge.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'; import path from 'node:path';
const S = 'src/'; const ORDER = ['renderer/motion.js', 'renderer/sound.js', 'renderer/kit.js', 'shared/skeleton.js', 'shared/store.js', 'agent/mock.js', 'renderer/stage.js', 'renderer/demo.js', 'renderer/states.js', 'renderer/app.js'];
const key = (f) => '__m_' + f.replace(/[^a-z0-9]/gi, '_');
let js = '';
for (const f of ORDER) {
  let code = readFileSync(S + f, 'utf8'); const dir = path.dirname(f);
  code = code.replace(/^import\s*\{([^}]+)\}\s*from\s*'([^']+)';?\s*$/gm, (_, names, from) => `const {${names}} = ${key(path.normalize(path.join(dir, from)))};`);
  const exps = [...code.matchAll(/^export\s+(?:async\s+)?(?:function\*?|const|let|class)\s+([A-Za-z0-9_$]+)/gm)].map((m) => m[1]);
  const multi = [...code.matchAll(/^export\s+const\s+([A-Za-z0-9_$]+)\s*=.*?,\s*([A-Za-z0-9_$]+)\s*=/gm)].map((m) => m[2]);
  code = code.replace(/^export\s+/gm, '');
  if (/^\s*import\s/m.test(code)) throw new Error(`unbundled import left in ${f}`);
  js += `const ${key(f)} = (() => {\n${code}\nreturn { ${[...new Set([...exps, ...multi])].join(', ')} };\n})();\n`;
}
let css = readFileSync(S + 'renderer/brim.css', 'utf8').replace(/@import url\('\.\/tokens\.css'\);/, readFileSync(S + 'renderer/tokens.css', 'utf8'));
const names = ['wake', 'listen-on', 'listen-off', 'tick', 'appear', 'reshape', 'ready', 'needs-you', 'approve', 'sent', 'dismiss', 'error', 'undo'];
const sounds = Object.fromEntries(names.map((n) => [n, 'data:audio/ogg;base64,' + readFileSync(`${S}renderer/sounds/${n}.ogg`).toString('base64')]));
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Brim — single-file demo</title><link rel="icon" href="data:,">
<style>${css}</style></head><body><script>window.__BRIM_SOUNDS=${JSON.stringify(sounds)};</script><script>\n${js}\n</script></body></html>`;
mkdirSync('dist', { recursive: true }); writeFileSync('dist/brim.html', html); console.log(`wrote dist/brim.html (${(html.length / 1024).toFixed(0)} KB)`);
