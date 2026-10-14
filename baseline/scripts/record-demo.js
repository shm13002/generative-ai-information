// Records the scripted demo to demo.mp4: headless Chromium video + sound events mixed with ffmpeg (sample-accurate offsets).
import { chromium } from 'playwright-core'; import { execFileSync } from 'node:child_process'; import { mkdirSync, readdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { server } from './serve.js';
const exe = process.env.CHROME || `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`;
rmSync('rec', { recursive: true, force: true }); mkdirSync('rec', { recursive: true }); await new Promise((r) => server.listen(5176, r));
const b = await chromium.launch({ executablePath: exe, args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, recordVideo: { dir: 'rec', size: { width: 1280, height: 800 } } });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://localhost:5176/renderer/index.html?demo&rec&mute');
await p.waitForSelector('body[data-demo="done"]', { timeout: 120000 }); await p.waitForTimeout(600);
const log = await p.evaluate(() => __brim.Sound.log); await ctx.close(); await b.close(); server.close();
if (errs.length) { console.error('page errors', errs); process.exit(1); }
writeFileSync('rec/sounds.json', JSON.stringify(log, null, 1));
const webm = 'rec/' + readdirSync('rec').find((f) => f.endsWith('.webm'));
// find the white marker: last frame whose mean luma > 240 near the start
execFileSync('ffmpeg', ['-v', 'error', '-i', webm, '-t', '8', '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=rec/luma.txt', '-f', 'null', '-']); const out = readFileSync('rec/luma.txt', 'utf8');
const frames = []; let t = null; for (const l of out.split('\n')) { const a = l.match(/pts_time:([0-9.]+)/); if (a) t = +a[1]; const y = l.match(/YAVG=([0-9.]+)/); if (y && t != null) frames.push([t, +y[1]]); }
const white = frames.filter(([, y]) => y > 230); if (!white.length) throw new Error('marker not found');
const start = white.at(-1)[0] + 0.04; console.log('marker ends at', start.toFixed(3), 's;', log.length, 'sound events');
const inputs = ['-ss', start.toFixed(3), '-i', webm]; const filt = [];
log.forEach((e, i) => { inputs.push('-i', `src/renderer/sounds/${e.name}.wav`); const ms = Math.max(0, Math.round(e.t * 1000)); filt.push(`[${i + 1}:a]adelay=${ms}|${ms},volume=${(e.gain || 1).toFixed(2)}[s${i}]`); });
filt.push(`${log.map((_, i) => `[s${i}]`).join('')}amix=inputs=${log.length}:normalize=0,alimiter=limit=0.89[a]`);
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', filt.join(';'), '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20', '-r', '30', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', 'demo.mp4'], { stdio: 'inherit' });
console.log('wrote demo.mp4');
