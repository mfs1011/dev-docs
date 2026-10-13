// Fon musiqasi + ovoz effektlari sintezi -> music.wav (44.1 kHz, stereo, 16-bit)
import './timeline.js';
import fs from 'node:fs';

const TL = globalThis.TL, S = TL.S;
const SR = 44100, DUR = S.end + 0.5, N = Math.ceil(DUR * SR);
const TAU = Math.PI * 2;
const bus = () => [new Float32Array(N), new Float32Array(N)];
const pad = bus(), arp = bus(), drums = bus(), sfx = bus(), bass = new Float32Array(N), send = bus();

let seed = 12345;
const noise = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2147483648 - 1; };
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const put = (b, i, l, r) => { if (i >= 0 && i < N) { b[0][i] += l; b[1][i] += r; } };
const panLR = (p) => [Math.cos((p + 1) * Math.PI / 4), Math.sin((p + 1) * Math.PI / 4)];

const BPM = 92, BEAT = 60 / BPM, BAR = BEAT * 4;
const CHORDS = [
  { root: 41, notes: [53, 57, 60, 64] }, // Fmaj7
  { root: 43, notes: [55, 59, 62, 67] }, // G
  { root: 40, notes: [52, 55, 59, 62] }, // Em7
  { root: 45, notes: [57, 60, 64, 67] }, // Am7
];
const chordAt = (t) => CHORDS[Math.floor(t / BAR) % 4];

// bo'limlar dinamikasi
const arpGain = (t) => ramp(t, 8.5, 10.5);
const bassGain = (t) => ramp(t, 8.5, 9.5);
const drumGain = (t) => ramp(t, 21.4, 22.4) * (1 - ramp(t, S.xulosa - 1.5, S.xulosa + 0.5));

// ---- pad (yumshoq arra to'lqini, jadval orqali) ----
const TS = 4096, tab = new Float32Array(TS);
{ let mx = 0; for (let i = 0; i < TS; i++) { let s = 0; for (let h = 1; h <= 12; h++) s += Math.sin(TAU * h * i / TS) / h * Math.pow(0.78, h - 1); tab[i] = s; mx = Math.max(mx, Math.abs(s)); } for (let i = 0; i < TS; i++) tab[i] /= mx; }
for (let b = 0; b * BAR < DUR; b++) {
  const ch = CHORDS[b % 4], t0 = b * BAR, len = BAR + 1.4, i0 = Math.floor(t0 * SR);
  ch.notes.forEach((n, ni) => [-1, 1].forEach((d) => {
    const f = mtof(n) * Math.pow(2, (d * 7) / 1200), [gl, gr] = panLR(d * 0.6 + (ni - 1.5) * 0.1);
    let ph = (ni * 0.13 + (d + 1) * 0.31) % 1;
    for (let k = 0; k < len * SR; k++) {
      const t = k / SR, env = Math.sin(Math.PI / 2 * clamp(t / 0.9)) * (t < BAR ? 1 : Math.max(0, 1 - (t - BAR) / 1.4));
      const v = tab[(ph * TS) | 0] * env * 0.034;
      ph += f / SR; if (ph >= 1) ph -= 1;
      put(pad, i0 + k, v * gl, v * gr);
    }
  }));
}
// pad'ni yumshatish (2 bosqichli past chastota filtri) + sekin "nafas"
for (const ch of pad) {
  let a = 0, c = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR, fc = 2300 + 700 * Math.sin(t * 0.25);
    const k = 1 - Math.exp(-TAU * fc / SR);
    a += k * (ch[i] - a); c += k * (a - c);
    ch[i] = c * Math.min(1, t / 3);
  }
}

// ---- arpedjio ----
const PAT = [[0, 1, 2, 3, 4, 3, 2, 1], [0, 2, 4, 2, 1, 3, 4, 3]];
const STEP = BEAT / 2;
for (let k = 0; k * STEP < DUR; k++) {
  const t0 = k * STEP, g = arpGain(t0) * (1 - ramp(t0, S.end - 3, S.end));
  if (g <= 0) continue;
  const ch = chordAt(t0 + 0.001), bar = Math.floor(t0 / BAR), idx = PAT[Math.floor(bar / 4) % 2][k % 8];
  const m = idx === 4 ? ch.notes[0] + 24 : ch.notes[idx] + 12, f = mtof(m);
  const vel = (k % 4 === 0 ? 1 : 0.78) * g * 0.07, [gl, gr] = panLR(k % 2 ? 0.35 : -0.35), i0 = Math.floor(t0 * SR);
  for (let j = 0; j < 0.9 * SR; j++) {
    const t = j / SR, env = (1 - Math.exp(-t / 0.004)) * Math.exp(-t / 0.24);
    const v = (Math.sin(TAU * f * t) + 0.25 * Math.sin(2 * TAU * f * t) * Math.exp(-t / 0.08) + 0.06 * Math.sin(3 * TAU * f * t)) * env * vel;
    put(arp, i0 + j, v * gl, v * gr);
  }
}
// ping-pong delay (nuqtali sakkizlik)
{
  const D = Math.floor(BEAT * 0.75 * SR), bl = new Float32Array(D), br = new Float32Array(D);
  for (let i = 0; i < N; i++) {
    const p = i % D, dl = bl[p], dr = br[p];
    bl[p] = arp[0][i] * 0.5 + arp[1][i] * 0.5 + dr * 0.38; br[p] = dl * 0.85;
    arp[0][i] += dl * 0.32; arp[1][i] += dr * 0.32;
  }
}

// ---- bas ----
const BASS_PAT = [[0, 1.5], [2, 1.0], [3, 0.5], [3.5, 0.5]];
for (let b = 0; b * BAR < DUR; b++) {
  const ch = CHORDS[b % 4];
  BASS_PAT.forEach(([at, len]) => {
    const t0 = b * BAR + at * BEAT, g = bassGain(t0) * (1 - ramp(t0, S.end - 4, S.end - 1));
    if (g <= 0) return;
    const f = mtof(ch.root + (at === 3.5 ? 12 : 0)), dur = len * BEAT, i0 = Math.floor(t0 * SR);
    for (let j = 0; j < (dur + 0.08) * SR; j++) {
      const t = j / SR, env = (1 - Math.exp(-t / 0.006)) * (0.6 + 0.4 * Math.exp(-t / 0.15)) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / 0.08));
      if (i0 + j < N) bass[i0 + j] += (Math.sin(TAU * f * t) + 0.28 * Math.sin(2 * TAU * f * t) + 0.08 * Math.sin(3 * TAU * f * t)) * env * 0.12 * g;
    }
  });
}

// ---- baraban ----
function kick(t0, g) {
  const i0 = Math.floor(t0 * SR); let ph = 0;
  for (let j = 0; j < 0.45 * SR; j++) {
    const t = j / SR, f = 46 + 95 * Math.exp(-t / 0.035);
    ph += TAU * f / SR;
    const v = (Math.sin(ph) * Math.exp(-t / 0.3) + (t < 0.003 ? noise() * 0.3 : 0)) * 0.42 * g;
    put(drums, i0 + j, v, v);
  }
}
function clap(t0, g) {
  const i0 = Math.floor(t0 * SR); let a = 0, b = 0;
  for (let j = 0; j < 0.35 * SR; j++) {
    const t = j / SR, x = noise();
    a += 0.35 * (x - a); b += 0.1 * (x - b);
    const bursts = t < 0.03 ? (Math.floor(t / 0.01) % 1 === 0 ? Math.exp(-(t % 0.01) / 0.003) : 0) : 0;
    const env = Math.max(bursts, t >= 0.02 ? Math.exp(-(t - 0.02) / 0.12) : 0);
    const v = ((a - b) * env + Math.sin(TAU * 190 * t) * Math.exp(-t / 0.05) * 0.3) * 0.2 * g;
    put(drums, i0 + j, v * 0.95, v); put(send, i0 + j, v * 0.6, v * 0.6);
  }
}
function hat(t0, g, p) {
  const i0 = Math.floor(t0 * SR), [gl, gr] = panLR(p); let a = 0;
  for (let j = 0; j < 0.08 * SR; j++) {
    const t = j / SR, x = noise(); a += 0.6 * (x - a);
    const v = (x - a) * Math.exp(-t / 0.028) * 0.05 * g;
    put(drums, i0 + j, v * gl, v * gr);
  }
}
for (let b = 0; b * BAR < DUR; b++) {
  const t0 = b * BAR;
  for (let s = 0; s < 8; s++) {
    const t = t0 + s * STEP, g = drumGain(t);
    if (g <= 0) continue;
    if (s === 0 || s === 4 || (b % 2 === 1 && s === 7)) kick(t, g);
    if (s === 2 || s === 6) clap(t, g);
    hat(t, g * (s % 2 ? 1 : 0.55), s % 2 ? 0.3 : -0.2);
  }
}

// ---- ovoz effektlari ----
const PENTA = [72, 76, 79, 81, 84];
let popIdx = 0;
function bell(t0, m, g, decay = 0.9, p = 0) {
  const i0 = Math.floor(t0 * SR), f = mtof(m), [gl, gr] = panLR(p);
  for (let j = 0; j < decay * 3 * SR; j++) {
    const t = j / SR, env = (1 - Math.exp(-t / 0.003)) * Math.exp(-t / decay);
    const v = (Math.sin(TAU * f * t) + 0.4 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t / 0.15) + 0.2 * Math.sin(TAU * f * 5.4 * t) * Math.exp(-t / 0.08)) * env * g;
    put(sfx, i0 + j, v * gl, v * gr); put(send, i0 + j, v * 0.5 * gl, v * 0.5 * gr);
  }
}
const FX = {
  tick(t0) {
    const i0 = Math.floor(t0 * SR), p = noise() * 0.3, [gl, gr] = panLR(p); let a = 0;
    for (let j = 0; j < 0.02 * SR; j++) {
      const t = j / SR, x = noise(); a += 0.5 * (x - a);
      const v = ((x - a) * Math.exp(-t / 0.002) * 0.6 + Math.sin(TAU * 2300 * t) * Math.exp(-t / 0.006) * 0.25) * 0.05;
      put(sfx, i0 + j, v * gl, v * gr);
    }
  },
  pop(t0) {
    const m = PENTA[popIdx++ % PENTA.length], f = mtof(m), i0 = Math.floor(t0 * SR), p = ((popIdx % 3) - 1) * 0.3, [gl, gr] = panLR(p);
    let ph = 0;
    for (let j = 0; j < 0.7 * SR; j++) {
      const t = j / SR; ph += TAU * f * (1 + 0.6 * Math.exp(-t / 0.01)) / SR;
      const v = (Math.sin(ph) + 0.3 * Math.sin(2 * ph) * Math.exp(-t / 0.05)) * (1 - Math.exp(-t / 0.002)) * Math.exp(-t / 0.17) * 0.11;
      put(sfx, i0 + j, v * gl, v * gr); put(send, i0 + j, v * 0.6, v * 0.6);
    }
  },
  big(t0) {
    [72, 76, 79, 84, 88].forEach((m, i) => bell(t0 + i * 0.06, m, 0.06, 1.2, -0.4 + i * 0.2));
    const i0 = Math.floor(t0 * SR);
    for (let j = 0; j < 1.5 * SR; j++) {
      const t = j / SR, v = Math.sin(TAU * (50 + 30 * Math.exp(-t / 0.08)) * t) * Math.exp(-t / 0.45) * 0.3;
      put(sfx, i0 + j, v, v);
    }
  },
  whoosh(t0) {
    const d = 0.75, i0 = Math.floor(t0 * SR); let lp = 0, bp = 0;
    for (let j = 0; j < d * SR; j++) {
      const t = j / SR, k = t / d, fc = 350 + 2800 * k * k, F = 2 * Math.sin(Math.PI * fc / SR), Q = 0.35;
      const x = noise(), hp = x - lp - Q * bp; bp += F * hp; lp += F * bp;
      const env = Math.pow(Math.sin(Math.PI * k), 2), [gl, gr] = panLR(-0.7 + 1.4 * k), v = bp * env * 0.16;
      put(sfx, i0 + j, v * gl, v * gr); put(send, i0 + j, v * 0.4 * gl, v * 0.4 * gr);
    }
  },
  chime(t0) { bell(t0, 79, 0.045, 1.0, -0.2); bell(t0 + 0.12, 84, 0.04, 1.2, 0.2); },
  snap(t0) {
    [0, 0.065].forEach((o, n) => {
      const i0 = Math.floor((t0 + o) * SR); let a = 0;
      for (let j = 0; j < 0.03 * SR; j++) {
        const t = j / SR, x = noise(); a += 0.3 * (x - a);
        const v = (x - a) * Math.exp(-t / 0.006) * (n ? 0.1 : 0.14);
        put(sfx, i0 + j, v, v);
      }
    });
    bell(t0 + 0.02, 96, 0.02, 0.4);
  },
  blip(t0) {
    const i0 = Math.floor(t0 * SR); let ph = 0;
    for (let j = 0; j < 0.15 * SR; j++) {
      const t = j / SR; ph += TAU * (1100 + 500 * Math.min(1, t / 0.06)) / SR;
      const v = Math.sin(ph) * (1 - Math.exp(-t / 0.003)) * Math.exp(-t / 0.05) * 0.05;
      put(sfx, i0 + j, v, v); put(send, i0 + j, v * 0.5, v * 0.5);
    }
  },
  worry(t0) {
    [[76, 0], [72, 0.2]].forEach(([m, o]) => {
      const i0 = Math.floor((t0 + o) * SR), f = mtof(m);
      for (let j = 0; j < 0.5 * SR; j++) {
        const t = j / SR, v = Math.sin(TAU * f * t + 0.6 * Math.sin(TAU * 6 * t)) * (1 - Math.exp(-t / 0.01)) * Math.exp(-t / 0.18) * 0.06;
        put(sfx, i0 + j, v, v); put(send, i0 + j, v * 0.6, v * 0.6);
      }
    });
  },
  swell(t0) {
    const d = 1.4, i0 = Math.floor((t0 - d) * SR); let a = 0;
    for (let j = 0; j < (d + 1.2) * SR; j++) {
      const t = j / SR, k = Math.min(1, t / d), x = noise();
      a += (0.06 + 0.3 * k * k) * (x - a);
      const env = t < d ? k * k : Math.exp(-(t - d) / 0.35), v = a * env * 0.12;
      put(sfx, i0 + j, v, v); put(send, i0 + j, v, v);
    }
    [72, 79, 84].forEach((m, i) => bell(t0 + i * 0.05, m, 0.035, 1.6, -0.3 + i * 0.3));
  },
};
TL.cues.forEach((c) => FX[c.type](c.t));

// ---- reverb (Freeverb soddalashtirilgan) ----
for (let i = 0; i < N; i++) {
  send[0][i] += pad[0][i] * 0.35 + arp[0][i] * 0.4;
  send[1][i] += pad[1][i] * 0.35 + arp[1][i] * 0.4;
}
function freeverb(inp, spread) {
  const out = new Float32Array(N);
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => ({ b: new Float32Array(d + spread), i: 0, s: 0 }));
  const aps = [556, 441, 341, 225].map((d) => ({ b: new Float32Array(d + spread), i: 0 }));
  const fb = 0.86, damp = 0.25;
  for (let n = 0; n < N; n++) {
    const x = inp[n] * 0.015; let y = 0;
    for (const c of combs) { const o = c.b[c.i]; c.s = o * (1 - damp) + c.s * damp; c.b[c.i] = x + c.s * fb; if (++c.i >= c.b.length) c.i = 0; y += o; }
    for (const a of aps) { const o = a.b[a.i]; const v = -y + o; a.b[a.i] = y + o * 0.5; if (++a.i >= a.b.length) a.i = 0; y = v; }
    out[n] = y;
  }
  return out;
}
for (const ch of send) { let l = 0; const k = 1 - Math.exp(-TAU * 220 / SR); for (let i = 0; i < N; i++) { l += k * (ch[i] - l); ch[i] -= l; } }
const revL = freeverb(send[0], 0), revR = freeverb(send[1], 23);

// ---- mastering ----
const out = [new Float32Array(N), new Float32Array(N)];
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR, fade = Math.min(1, t / 0.4) * (1 - ramp(t, S.end - 3, S.end + 0.2));
  for (let c = 0; c < 2; c++) {
    const x = pad[c][i] + arp[c][i] + drums[c][i] + sfx[c][i] + bass[i] + (c ? revR[i] : revL[i]) * 2.2;
    const y = Math.tanh(x * 1.1) * fade;
    out[c][i] = y; peak = Math.max(peak, Math.abs(y));
  }
}
{ const k = 1 - Math.exp(-TAU * 30 / SR); peak = 0; for (const ch of out) { let l = 0; for (let i = 0; i < N; i++) { l += k * (ch[i] - l); ch[i] -= l; peak = Math.max(peak, Math.abs(ch[i])); } } }
const gain = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) for (let c = 0; c < 2; c++) buf.writeInt16LE(Math.round(clamp(out[c][i] * gain, -1, 1) * 32767), 44 + i * 4 + c * 2);
fs.writeFileSync('music.wav', buf);
console.log('music.wav', DUR.toFixed(1) + 's', 'peak', peak.toFixed(3), 'cues', TL.cues.length);
