// Brim Electron main: transparent click-through overlay at the notch, global hotkey, validated agent stream.
import { app, BrowserWindow, globalShortcut, ipcMain, screen, systemPreferences } from 'electron';
import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { placeIsland, homeDisplay } from './notch.js';
import { validateMessage, validateAction } from '../contract/validate.js';
import { runMock } from '../agent/mock.js';
const here = path.dirname(fileURLToPath(import.meta.url));
const HOTKEY = process.env.BRIM_HOTKEY || 'Alt+Space';
let win = null;
async function agentFor(text) {
  if (process.env.BRIM_AGENT === 'claude') { const { runClaude } = await import('../agent/claude-adapter.js'); return runClaude(text); }
  return runMock(text);
}
function create() {
  const d = homeDisplay(screen.getAllDisplays(), screen.getPrimaryDisplay()); const place = placeIsland(d, { forceFloating: process.env.BRIM_FLOATING === '1' });
  win = new BrowserWindow({ ...place.window, show: false, transparent: true, frame: false, resizable: false, movable: false, minimizable: false, maximizable: false,
    fullscreenable: false, skipTaskbar: true, hasShadow: false, focusable: false, type: process.platform === 'darwin' ? 'panel' : undefined, acceptFirstMouse: true,
    webPreferences: { preload: path.join(here, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false, backgroundThrottling: false } });
  win.setIgnoreMouseEvents(true, { forward: true });
  win.setAlwaysOnTop(true, 'status');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  const qs = new URLSearchParams(); if (place.floating) qs.set('display', 'floating'); if (process.env.BRIM_DEMO === '1') qs.set('demo', '');
  win.loadFile(path.join(here, '../renderer/index.html'), { search: qs.toString() });
  win.once('ready-to-show', () => win.showInactive());
  win.webContents.on('console-message', (_e, level, msg) => { if (level >= 2 || process.env.BRIM_DEBUG) console.log('[renderer]', msg); });
}
ipcMain.handle('brim:pointer', (_e, inside) => win?.setIgnoreMouseEvents(inside !== true, { forward: true }));
ipcMain.handle('brim:action', (_e, a) => { const v = validateAction(a); if (!v.ok) throw new Error(`invalid action: ${v.error}`); return true; });
ipcMain.on('brim:ask', async (e, { id, text }) => {
  try { for await (const m of await agentFor(String(text).slice(0, 600))) { const v = validateMessage(m); if (!v.ok) { console.warn('dropped invalid message:', v.error); continue; } e.sender.send('brim:stage', { id, msg: v.msg }); } }
  catch (err) { e.sender.send('brim:stage', { id, msg: { v: 1, op: 'upsert', card: { v: 1, id: `err${Date.now()}`, rev: 0, utterance: text, status: 'error', title: 'Something went wrong', blocks: [{ id: 'e', type: 'error', kind: 'tool', title: String(err.message).slice(0, 120), retry: true }] } } }); }
  e.sender.send('brim:stage', { id, end: true });
});
ipcMain.handle('brim:mic', async () => (process.platform === 'darwin' ? systemPreferences.askForMediaAccess('microphone') : true));
app.whenReady().then(() => {
  if (process.platform === 'darwin') app.dock?.hide();
  create();
  globalShortcut.register(HOTKEY, () => win?.webContents.send('brim:hotkey'));
  screen.on('display-metrics-changed', () => { if (!win) return; const p = placeIsland(homeDisplay(screen.getAllDisplays(), screen.getPrimaryDisplay())); win.setBounds(p.window); });
  if (process.env.BRIM_SMOKE) setTimeout(async () => { const ok = await win.webContents.executeJavaScript('document.body.dataset.ready === "1" && !!document.querySelector(".shape")'); console.log('SMOKE overlay', ok ? 'OK' : 'FAIL');
    await win.webContents.executeJavaScript('void __brim.ask("what needs me today?"); 1'); await new Promise((r) => setTimeout(r, 2500));
    const st = await win.webContents.executeJavaScript('JSON.stringify({status: __brim.stage.card?.status, size: __brim.stage.size, blocks: __brim.stage.card?.blocks?.length})'); console.log('SMOKE ipc-agent', st);
    const pass = ok && JSON.parse(st).status === 'needs-you'; console.log('SMOKE', pass ? 'OK' : 'FAIL'); app.exit(pass ? 0 : 1); }, 4000);
});
app.on('will-quit', () => globalShortcut.unregisterAll());
