// All sounds are synthesized in the browser (no copyrighted audio).
// Signal chain: voices -> (dry master + convolution reverb) -> gentle compressor -> speakers.

type Graph = { c: AudioContext; dry: GainNode; wet: ConvolverNode };
let graph: Graph | null = null;

function buildImpulse(c: AudioContext, seconds = 3.6, decay = 2.8) {
  const len = Math.floor(c.sampleRate * seconds);
  const ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const t = i / len;
      // warm (low-passed) noise with exponential tail and a soft pre-delay
      lp = lp * 0.6 + (Math.random() * 2 - 1) * 0.4;
      d[i] = i < c.sampleRate * 0.012 ? 0 : lp * Math.pow(1 - t, decay);
    }
  }
  return ir;
}

function g(): Graph | null {
  if (typeof window === "undefined") return null;
  if (!graph) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const c = new Ctor();
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 12;
    comp.ratio.value = 3;
    comp.attack.value = 0.005;
    comp.release.value = 0.25;
    comp.connect(c.destination);
    const dry = c.createGain();
    dry.gain.value = 0.9;
    dry.connect(comp);
    const wet = c.createConvolver();
    wet.buffer = buildImpulse(c);
    const wetGain = c.createGain();
    wetGain.gain.value = 0.42;
    wet.connect(wetGain).connect(comp);
    graph = { c, dry, wet };
  }
  if (graph.c.state === "suspended") void graph.c.resume();
  return graph;
}

/** A voice output that feeds both the dry bus and the reverb, with optional stereo pan. */
function voice(G: Graph, level: number, reverb = 0.5, pan = 0) {
  const out = G.c.createGain();
  out.gain.value = level;
  const p = G.c.createStereoPanner();
  p.pan.value = pan;
  out.connect(p);
  p.connect(G.dry);
  const send = G.c.createGain();
  send.gain.value = reverb;
  p.connect(send).connect(G.wet);
  return out;
}

function noiseBuffer(c: AudioContext, seconds: number) {
  const b = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

export function isMuted() {
  return typeof window !== "undefined" && sessionStorage.getItem("gp-muted") === "1";
}
export function setMuted(m: boolean) {
  sessionStorage.setItem("gp-muted", m ? "1" : "0");
}

/** Brass temple bell (ghanta): bell-like inharmonic partials, beating pairs and a metallic strike. */
export function playBell(level = 1, base = 587.33) {
  if (isMuted()) return;
  const G = g();
  if (!G) return;
  const { c } = G;
  const now = c.currentTime;
  const out = voice(G, 0.3 * level, 0.75);
  const partials: [number, number, number][] = [
    [0.5, 0.35, 7], // hum
    [1, 1, 6], // prime
    [1.19, 0.4, 4.5], // tierce
    [1.5, 0.3, 4], // quint
    [2, 0.55, 3.6], // nominal
    [2.74, 0.22, 2.4],
    [3.76, 0.14, 1.8],
    [5.4, 0.08, 1.1],
  ];
  partials.forEach(([ratio, amp, dur]) => {
    [0, 1.4].forEach((detune, k) => {
      const o = c.createOscillator();
      const gn = c.createGain();
      o.type = "sine";
      o.frequency.value = base * ratio + detune;
      gn.gain.setValueAtTime(0, now);
      gn.gain.linearRampToValueAtTime(amp * (k ? 0.5 : 1), now + 0.004);
      gn.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(gn).connect(out);
      o.start(now);
      o.stop(now + dur + 0.1);
    });
  });
  // strike transient
  const n = c.createBufferSource();
  n.buffer = noiseBuffer(c, 0.06);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 3800;
  bp.Q.value = 1.4;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.5, now);
  ng.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  n.connect(bp).connect(ng).connect(out);
  n.start(now);
}

// Raga Mohanam (pentatonic) degrees relative to Sa
const MOHANAM = [0, 2, 4, 7, 9];
const hz = (semi: number, sa = 261.63) => sa * Math.pow(2, semi / 12);

/** Brass wind-chime shimmer cascading across the stereo field. */
export function playChimes(count = 9, level = 1) {
  if (isMuted()) return;
  const G = g();
  if (!G) return;
  const { c } = G;
  let t = c.currentTime + 0.02;
  for (let i = 0; i < count; i++) {
    const deg = MOHANAM[(i * 2 + Math.floor(Math.random() * 2)) % 5]!;
    const f = hz(deg + 24 + (i > count / 2 ? 12 : 0));
    const out = voice(G, 0.07 * level, 0.9, Math.sin(i * 1.3) * 0.8);
    [1, 2.76, 5.4].forEach((r, k) => {
      const o = c.createOscillator();
      const gn = c.createGain();
      o.type = "sine";
      o.frequency.value = f * r;
      gn.gain.setValueAtTime(0, t);
      gn.gain.linearRampToValueAtTime([1, 0.35, 0.12][k]!, t + 0.003);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + [2.6, 1.2, 0.5][k]!);
      o.connect(gn).connect(out);
      o.start(t);
      o.stop(t + 2.8);
    });
    t += 0.07 + Math.random() * 0.08;
  }
}

/** Soft air whoosh, like heavy doors swinging open. */
export function playWhoosh(seconds = 2.2) {
  if (isMuted()) return;
  const G = g();
  if (!G) return;
  const { c } = G;
  const now = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, seconds);
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 0.8;
  f.frequency.setValueAtTime(220, now);
  f.frequency.exponentialRampToValueAtTime(1600, now + seconds * 0.45);
  f.frequency.exponentialRampToValueAtTime(380, now + seconds);
  const gn = c.createGain();
  gn.gain.setValueAtTime(0, now);
  gn.gain.linearRampToValueAtTime(0.5, now + seconds * 0.35);
  gn.gain.exponentialRampToValueAtTime(0.001, now + seconds);
  src.connect(f).connect(gn).connect(voice(G, 0.45, 0.6));
  src.start(now);
  // low wooden resonance under the air
  const o = c.createOscillator();
  const og = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(92, now);
  o.frequency.exponentialRampToValueAtTime(58, now + 1.4);
  og.gain.setValueAtTime(0, now);
  og.gain.linearRampToValueAtTime(0.35, now + 0.08);
  og.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  o.connect(og).connect(voice(G, 0.5, 0.3));
  o.start(now);
  o.stop(now + 1.6);
}

/** Subtle crystal "glass tap" for buttons and links. */
export function playTap() {
  if (isMuted()) return;
  const G = g();
  if (!G) return;
  const { c } = G;
  const now = c.currentTime;
  const out = voice(G, 0.05, 0.35);
  const f = 1760 + Math.random() * 120;
  [1, 2.01, 3.2].forEach((r, k) => {
    const o = c.createOscillator();
    const gn = c.createGain();
    o.type = "sine";
    o.frequency.value = f * r;
    gn.gain.setValueAtTime(0, now);
    gn.gain.linearRampToValueAtTime([1, 0.4, 0.15][k]!, now + 0.002);
    gn.gain.exponentialRampToValueAtTime(0.0001, now + [0.22, 0.12, 0.06][k]!);
    o.connect(gn).connect(out);
    o.start(now);
    o.stop(now + 0.25);
  });
}

/** Rising bell arpeggio for a happy moment (e.g. blessing sent). */
export function playSuccess() {
  if (isMuted()) return;
  [0, 4, 7, 12].forEach((s, i) => setTimeout(() => playBell(0.45, hz(s + 12)), i * 140));
  setTimeout(() => playChimes(7, 0.8), 520);
}

/* ------------------------------------------------------------------ */
/* Background music: admin-uploaded URL, or a generative raga ambience */
/* (tanpura drone + warm pad + bansuri-style Mohanam melody).          */
/* ------------------------------------------------------------------ */
let audioEl: HTMLAudioElement | null = null;
let ambience: { stop: () => void } | null = null;

function startAmbience() {
  const G = g();
  if (!G) return;
  const { c } = G;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
  let alive = true;

  const bus = c.createGain();
  bus.gain.setValueAtTime(0, c.currentTime);
  bus.gain.linearRampToValueAtTime(1, c.currentTime + 4);
  bus.connect(G.dry);
  const send = c.createGain();
  send.gain.value = 0.85;
  bus.connect(send).connect(G.wet);

  const SA = 130.81; // C3

  // Tanpura: Pa – Sa' – Sa' – Sa
  const tanpura = [SA * 0.75, SA, SA, SA / 2];
  let ti = 0;
  const pluck = () => {
    if (!alive) return;
    const f = tanpura[ti++ % tanpura.length]!;
    const t = c.currentTime;
    const out = c.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(0.11, t + 0.04);
    out.gain.exponentialRampToValueAtTime(0.0008, t + 4.6);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 4;
    lp.frequency.setValueAtTime(2600, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + 3);
    const pan = c.createStereoPanner();
    pan.pan.value = (ti % 2 ? -0.35 : 0.35);
    [0, 2.5].forEach((dt) => {
      const o = c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.detune.value = dt;
      o.connect(lp);
      o.start(t);
      o.stop(t + 4.8);
    });
    lp.connect(out).connect(pan).connect(bus);
    later(pluck, 1300);
  };

  // Warm pad: Sa–Pa–Sa' sustained with slow breathing
  const pad = c.createGain();
  pad.gain.value = 0.035;
  const padLp = c.createBiquadFilter();
  padLp.type = "lowpass";
  padLp.frequency.value = 900;
  pad.connect(padLp).connect(bus);
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 0.02;
  lfo.connect(lfoGain).connect(pad.gain);
  lfo.start();
  const padOsc = [SA, SA * 1.5, SA * 2, SA * 3].map((f, i) => {
    const o = c.createOscillator();
    o.type = i % 2 ? "triangle" : "sine";
    o.frequency.value = f;
    o.detune.value = (i - 1.5) * 3;
    o.connect(pad);
    o.start();
    return o;
  });

  // Bansuri-style melody: breathy sine with vibrato and portamento
  const fluteOut = c.createGain();
  fluteOut.gain.value = 0;
  const fluteLp = c.createBiquadFilter();
  fluteLp.type = "lowpass";
  fluteLp.frequency.value = 2400;
  const flutePan = c.createStereoPanner();
  flutePan.pan.value = 0.1;
  fluteOut.connect(fluteLp).connect(flutePan).connect(bus);
  const flute = c.createOscillator();
  flute.type = "sine";
  const flute2 = c.createOscillator();
  flute2.type = "triangle";
  const f2g = c.createGain();
  f2g.gain.value = 0.18;
  flute.connect(fluteOut);
  flute2.connect(f2g).connect(fluteOut);
  const vib = c.createOscillator();
  const vibG = c.createGain();
  vib.frequency.value = 5.2;
  vibG.gain.value = 0;
  vib.connect(vibG);
  vibG.connect(flute.frequency);
  vibG.connect(flute2.frequency);
  const breath = c.createBufferSource();
  breath.buffer = noiseBuffer(c, 2);
  breath.loop = true;
  const breathBp = c.createBiquadFilter();
  breathBp.type = "bandpass";
  breathBp.frequency.value = 1800;
  breathBp.Q.value = 0.7;
  const breathG = c.createGain();
  breathG.gain.value = 0.012;
  breath.connect(breathBp).connect(breathG).connect(fluteOut);
  [flute, flute2, vib, breath].forEach((n) => n.start());

  let idx = 5; // index into a 2-octave Mohanam scale
  const scale = [...MOHANAM, ...MOHANAM.map((d) => d + 12), 24];
  const phrase = () => {
    if (!alive) return;
    const len = 4 + Math.floor(Math.random() * 4);
    let at = 0;
    for (let k = 0; k < len; k++) {
      const step = [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)]!;
      idx = Math.min(scale.length - 1, Math.max(0, idx + step));
      const f = hz(scale[idx]!, SA * 2);
      const dur = k === len - 1 ? 2.6 : 0.55 + Math.random() * 1.1;
      const t = c.currentTime + at;
      flute.frequency.setTargetAtTime(f, t, 0.03);
      flute2.frequency.setTargetAtTime(f, t, 0.03);
      fluteOut.gain.setTargetAtTime(0.075, t, 0.08);
      vibG.gain.setValueAtTime(0, t);
      vibG.gain.linearRampToValueAtTime(f * 0.006, t + Math.min(dur, 0.9));
      at += dur;
    }
    fluteOut.gain.setTargetAtTime(0, c.currentTime + at, 0.5);
    later(phrase, (at + 3 + Math.random() * 4) * 1000);
  };

  const distantBell = () => {
    if (!alive) return;
    playBell(0.25, hz(MOHANAM[Math.floor(Math.random() * 5)]!, SA * 4));
    later(distantBell, 18000 + Math.random() * 14000);
  };

  pluck();
  later(phrase, 5000);
  later(distantBell, 11000);

  ambience = {
    stop: () => {
      alive = false;
      timers.forEach(clearTimeout);
      const t = c.currentTime;
      bus.gain.cancelScheduledValues(t);
      bus.gain.setValueAtTime(bus.gain.value, t);
      bus.gain.linearRampToValueAtTime(0, t + 1.2);
      setTimeout(() => {
        [...padOsc, flute, flute2, vib, lfo, breath].forEach((n) => {
          try { n.stop(); } catch { /* already stopped */ }
        });
        bus.disconnect();
      }, 1400);
    },
  };
}

export function startMusic(url?: string) {
  stopMusic();
  if (url) {
    audioEl = new Audio(url);
    audioEl.loop = true;
    audioEl.volume = 0.4;
    void audioEl.play().catch(() => {});
    return;
  }
  startAmbience();
}

export function stopMusic() {
  audioEl?.pause();
  audioEl = null;
  ambience?.stop();
  ambience = null;
}

/** Ask the music toggle to turn on (used when guests open the doors). */
export function requestMusicOn() {
  sessionStorage.setItem("gp-music", "1");
  setMuted(false);
  window.dispatchEvent(new Event("gp-music-on"));
}
