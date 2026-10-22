// Generated sound, no files: a warm drone that brightens with the light,
// a soft tick for each caption, a rising tone while holding, a chime on reveal.
// Starts only after the reader clicks start. Higgsfield audio can replace it later.
export class Sound {
  constructor() { this.on = false; this.ctx = null; }

  start() {
    if (this.ctx) { this.setOn(true); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain(); this.master.gain.value = 0; this.master.connect(ctx.destination);
    // drone: two detuned saws through a slow low-pass, plus air noise
    this.filter = ctx.createBiquadFilter(); this.filter.type = 'lowpass'; this.filter.frequency.value = 380; this.filter.Q.value = 0.7;
    this.filter.connect(this.master);
    this.oscs = [55, 82.4, 110.2].map((f, i) => { const o = ctx.createOscillator(); o.type = i === 2 ? 'sine' : 'sawtooth'; o.frequency.value = f; o.detune.value = (i - 1) * 7;
      const g = ctx.createGain(); g.gain.value = i === 2 ? 0.05 : 0.025; o.connect(g).connect(this.filter); o.start(); return o; });
    const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
    const n = ctx.createBufferSource(); n.buffer = buf; n.loop = true;
    const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 900; nf.Q.value = 0.4;
    const ng = ctx.createGain(); ng.gain.value = 0.012; n.connect(nf).connect(ng).connect(this.master); n.start();
    // hold tone
    this.hold = ctx.createOscillator(); this.hold.type = 'sine'; this.hold.frequency.value = 220;
    this.holdGain = ctx.createGain(); this.holdGain.gain.value = 0; this.hold.connect(this.holdGain).connect(this.master); this.hold.start();
    this.setOn(true);
  }

  setOn(v) {
    this.on = v; if (!this.ctx) return;
    if (v && this.ctx.state === 'suspended') this.ctx.resume();
    this.master.gain.setTargetAtTime(v ? 0.9 : 0, this.ctx.currentTime, 0.6);
  }
  // called on any click, tap or key: browsers only allow audio after one
  unlock() { if (this.ctx && this.on && this.ctx.state === 'suspended') this.ctx.resume(); }
  toggle() { if (!this.ctx) { this.start(); return true; } this.setOn(!this.on); return this.on; }

  update(chapter, local) {
    if (!this.ctx || !this.on) return;
    const bright = 300 + chapter * 60 + Math.sin(local * Math.PI) * 220;
    this.filter.frequency.setTargetAtTime(bright, this.ctx.currentTime, 0.8);
  }

  blip(freq, dur = 1.6, vol = 0.05) {
    if (!this.ctx || !this.on) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + dur + 0.05);
  }
  // soft air sweep for each glide
  whoosh() {
    if (!this.ctx || !this.on) return;
    const c = this.ctx, t = c.currentTime, len = c.sampleRate * 1.6;
    const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const n = c.createBufferSource(); n.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
    f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(1400, t + 0.7); f.frequency.exponentialRampToValueAtTime(500, t + 1.5);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    n.connect(f).connect(g).connect(this.master); n.start(t); n.stop(t + 1.6);
  }
  tick() { this.blip(880, 1.2, 0.025); }
  reveal() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => setTimeout(() => this.blip(f, 2.4, 0.04), i * 90)); }
  holdStart() { if (!this.ctx || !this.on) return; const t = this.ctx.currentTime;
    this.hold.frequency.cancelScheduledValues(t); this.hold.frequency.setValueAtTime(220, t); this.hold.frequency.linearRampToValueAtTime(440, t + 1.6);
    this.holdGain.gain.setTargetAtTime(0.05, t, 0.1); }
  holdStop() { if (!this.ctx) return; this.holdGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15); }
}
