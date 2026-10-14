// Narrow, typed bridge. The renderer never gets Node or ipcRenderer directly.
const { contextBridge, ipcRenderer } = require('electron');
let seq = 0;
contextBridge.exposeInMainWorld('brim', {
  pointer: (inside) => ipcRenderer.invoke('brim:pointer', !!inside),
  action: (a) => ipcRenderer.invoke('brim:action', a).catch(() => {}),
  mic: () => ipcRenderer.invoke('brim:mic'),
  onHotkey: (fn) => ipcRenderer.on('brim:hotkey', () => fn()),
  /** Streams v1 stage messages for one request into onMessage(msg); onEnd() when the agent finishes. (Generators can't cross contextBridge.) */
  ask(text, onMessage, onEnd) {
    const id = ++seq;
    const h = (_e, p) => { if (p.id !== id) return; if (p.end) { ipcRenderer.removeListener('brim:stage', h); onEnd?.(); } else onMessage(p.msg); };
    ipcRenderer.on('brim:stage', h); ipcRenderer.send('brim:ask', { id, text });
  },
});
