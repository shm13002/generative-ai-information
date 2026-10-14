// Brim sound engine: preloads original cues, plays them through one gain node, logs events (used to mix the demo MP4).
const NAMES = ['wake', 'listen-on', 'listen-off', 'tick', 'appear', 'reshape', 'ready', 'needs-you', 'approve', 'sent', 'dismiss', 'error', 'undo'];
export const Sound = {
  ctx: null, gain: null, buf: {}, volume: 0.8, muted: false, log: [], t0: 0, enabled: true, lastAt: {},
  async init(base = './sounds/', srcs = null) {
    this.t0 = performance.now();
    try { this.ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)(); } catch { this.ctx = null; }
    if (!this.ctx) return;
    this.gain = this.ctx.createGain(); this.gain.connect(this.ctx.destination); this.setVolume(this.volume);
    await Promise.all(NAMES.map(async (n) => {
      try { const url = srcs?.[n] || `${base}${n}.ogg`; const r = await fetch(url); this.buf[n] = await this.ctx.decodeAudioData(await r.arrayBuffer()); }
      catch { try { const r = await fetch(`${base}${n}.wav`); this.buf[n] = await this.ctx.decodeAudioData(await r.arrayBuffer()); } catch {} }
    }));
  },
  setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); if (this.gain) this.gain.gain.value = this.muted ? 0 : this.volume; },
  setMuted(m) { this.muted = !!m; this.setVolume(this.volume); },
  play(name, { gain = 1, minGapMs = 90 } = {}) {
    const now = performance.now();
    if (this.lastAt[name] && now - this.lastAt[name] < minGapMs) return; // no machine-gun repeats
    this.lastAt[name] = now;
    this.log.push({ name, t: +((now - this.t0) / 1000).toFixed(3), gain: this.volume * gain });
    globalThis.dispatchEvent?.(new CustomEvent('brim:sound', { detail: name }));
    if (!this.ctx || !this.buf[name] || this.muted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const s = this.ctx.createBufferSource(); s.buffer = this.buf[name]; const g = this.ctx.createGain(); g.gain.value = gain; s.connect(g); g.connect(this.gain); s.start();
  },
};
