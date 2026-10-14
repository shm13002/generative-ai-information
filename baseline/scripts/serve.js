// Minimal static server for the browser build (ES modules + audio need http://). Usage: node scripts/serve.js [port]
import http from 'node:http'; import { readFile } from 'node:fs/promises'; import { extname, join, normalize } from 'node:path';
const root = new URL('../src/', import.meta.url).pathname; const port = +process.argv[2] || 5173;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };
export const server = http.createServer(async (req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = join(root, p === '/' ? 'renderer/index.html' : p);
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try { const b = await readFile(file); res.writeHead(200, { 'content-type': T[extname(file)] || 'application/octet-stream' }).end(b); } catch { res.writeHead(404).end('not found'); }
});
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) server.listen(port, () => console.log(`Brim: http://localhost:${port}/renderer/index.html?demo`));
