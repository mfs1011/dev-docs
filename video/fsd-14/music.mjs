// FSD videosi musiqasi — Git va SQL'dan farqli (taqqoslash uchun): yumshoq fortepiano va qo'ng'iroqchalar.
// Fa major, 100 BPM, Fmaj7–Dm7–B♭maj7–C; piano akkordlari, glockenspiel, bas, yengil "tick" ritm. Effektlar — cues.js.
import './voice/timing.js';
import './sync.js';
import './cues.js';
import fs from 'node:fs';

const TM = globalThis.TM, CUES = globalThis.CUES, { L } = globalThis.SY;
const SR = 44100, END = TM.end, DUR = END + 0.5, N = Math.ceil(DUR * SR), TAU = Math.PI * 2;
const bus = () => [new Float32Array(N), new Float32Array(N)];
const pad = bus(), mar = bus(), perc = bus(), sfx = bus(), send = bus(), bass = new Float32Array(N);
let seed = 4242;
const noise = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2147483648 - 1; };
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const put = (b, i, l, r) => { if (i >= 0 && i < N) { b[0][i] += l; b[1][i] += r; } };
const panLR = (p) => [Math.cos((p + 1) * Math.PI / 4), Math.sin((p + 1) * Math.PI / 4)];

const BPM = 100, BEAT = 60 / BPM, BAR = BEAT * 4, STEP = BEAT / 2;
const CHORDS = [
  { root: 41, notes: [60, 64, 65, 69] }, // Fmaj7
  { root: 38, notes: [60, 62, 65, 69] }, // Dm7
  { root: 46, notes: [58, 62, 65, 69] }, // B♭maj7
  { root: 48, notes: [60, 64, 67, 72] }, // C
];
const chordAt = (t) => CHORDS[Math.floor(t / BAR) % 4];
const tStart = L('L2').s - 1;                 // tartib sahnasi: marimba va bas kiradi
const tPerc = L('L5').s - 1;                  // public API: ritm
const tOutro = L('L22').s - 1;                // xulosa: ritm tushadi
const marGain = (t) => ramp(t, tStart - 1, tStart + 1) * (1 - ramp(t, END - 3, END));
const percGain = (t) => ramp(t, tPerc - 1, tPerc + 1) * (1 - ramp(t, tOutro - 1, tOutro + 1));

// fortepiano akkordlari: har yarim bar, garmonikalar bilan, sekin so'nadi
for (let h = 0; h * BAR / 2 < DUR; h++) {
  const ch = CHORDS[Math.floor(h / 2) % 4], t0 = h * BAR / 2, i0 = Math.floor(t0 * SR);
  ch.notes.forEach((n, ni) => {
    const f = mtof(n - 12) * (1 + (ni - 1.5) * 0.0004), [gl, gr] = panLR((ni - 1.5) * 0.25), vel = (h % 2 ? 0.7 : 1) * 0.03;
    for (let k = 0; k < 2.6 * SR; k++) {
      const t = k / SR, env = (1 - Math.exp(-t / 0.004)) * Math.exp(-t / 0.9);
      const ph = TAU * f * t + ni * 0.7;
      const v = (Math.sin(ph) + 0.45 * Math.sin(2 * ph) * Math.exp(-t / 0.5) + 0.2 * Math.sin(3 * ph) * Math.exp(-t / 0.3) + 0.08 * Math.sin(4.02 * ph) * Math.exp(-t / 0.15)) * env * vel;
      put(pad, i0 + k, v * gl, v * gr);
    }
  });
}
// marimba: sinus + 4x garmonika (tez so'nadi)
const PAT = [[0, 2, 1, 3, 2, 1, 3, 2], [0, 1, 2, 3, 3, 2, 1, 0]];
for (let k = 0; k * STEP < DUR; k++) {
  const t0 = k * STEP, g = marGain(t0);
  if (g <= 0 || k % 2 === 1) continue;
  const ch = chordAt(t0 + 0.001), idx = PAT[Math.floor(t0 / BAR / 4) % 2][k % 8], f = mtof(ch.notes[idx] + 24);
  const vel = (k % 4 === 0 ? 1 : 0.7) * g * 0.07, [gl, gr] = panLR(k % 2 ? 0.3 : -0.3), i0 = Math.floor(t0 * SR);
  for (let j = 0; j < 0.7 * SR; j++) {
    const t = j / SR, env = (1 - Math.exp(-t / 0.001)) * Math.exp(-t / 0.45);
    const v = (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t / 0.12) + 0.12 * Math.sin(TAU * f * 5.4 * t) * Math.exp(-t / 0.05)) * env * vel * 0.55;
    put(mar, i0 + j, v * gl, v * gr);
  }
}
// bas
for (let b = 0; b * BAR < DUR; b++) {
  const ch = CHORDS[b % 4];
  [[0, 1.6], [2, 1.4]].forEach(([at, len]) => {
    const t0 = b * BAR + at * BEAT, g = marGain(t0);
    if (g <= 0) return;
    const f = mtof(ch.root), dur = len * BEAT, i0 = Math.floor(t0 * SR);
    for (let j = 0; j < (dur + 0.1) * SR; j++) {
      const t = j / SR, env = (1 - Math.exp(-t / 0.01)) * (0.65 + 0.35 * Math.exp(-t / 0.2)) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / 0.1));
      if (i0 + j < N) bass[i0 + j] += (Math.sin(TAU * f * t) + 0.2 * Math.sin(2 * TAU * f * t)) * env * 0.11 * g;
    }
  });
}
// shaker (sakkizliklar) + yumshoq "kick" har bar boshida
for (let k = 0; k * STEP < DUR; k++) {
  const t0 = k * STEP, g = percGain(t0);
  if (g <= 0) continue;
  const i0 = Math.floor(t0 * SR), [gl, gr] = panLR(k % 2 ? 0.25 : -0.25); let a = 0;
  for (let j = 0; j < 0.09 * SR; j++) {
    const t = j / SR, x = noise(); a += 0.7 * (x - a);
    const env = Math.min(1, t / 0.012) * Math.exp(-t / 0.035);
    const v = (x - a) * env * (k % 2 ? 0.045 : 0.028) * g;
    put(perc, i0 + j, v * gl, v * gr);
  }
  if (k % 8 === 0) { let ph = 0; for (let j = 0; j < 0.35 * SR; j++) { const t = j / SR; ph += TAU * (52 + 60 * Math.exp(-t / 0.04)) / SR; const v = Math.sin(ph) * Math.exp(-t / 0.22) * 0.22 * g; put(perc, i0 + j, v, v); } }
}

// ---- effektlar ----
const PENTA = [72, 74, 77, 79, 81, 84];
let pi = 0;
function bell(t0, m, g, decay = 1, p = 0) {
  const i0 = Math.floor(t0 * SR), f = mtof(m), [gl, gr] = panLR(p);
  for (let j = 0; j < decay * 3 * SR; j++) {
    const t = j / SR, env = (1 - Math.exp(-t / 0.003)) * Math.exp(-t / decay);
    const v = (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t / 0.15)) * env * g;
    put(sfx, i0 + j, v * gl, v * gr); put(send, i0 + j, v * 0.5 * gl, v * 0.5 * gr);
  }
}
const FX = {
  tick(t0) { const i0 = Math.floor(t0 * SR); let a = 0; for (let j = 0; j < 0.015 * SR; j++) { const t = j / SR, x = noise(); a += 0.5 * (x - a); const v = (x - a) * Math.exp(-t / 0.002) * 0.05; put(sfx, i0 + j, v, v); } },
  pop(t0) { const m = PENTA[pi++ % PENTA.length], f = mtof(m), i0 = Math.floor(t0 * SR); for (let j = 0; j < 0.5 * SR; j++) { const t = j / SR, v = (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 4 * t) * Math.exp(-t / 0.02)) * (1 - Math.exp(-t / 0.002)) * Math.exp(-t / 0.14) * 0.08; put(sfx, i0 + j, v, v); put(send, i0 + j, v * 0.5, v * 0.5); } },
  ding(t0) { bell(t0, 86, 0.05, 1.0, -0.2); bell(t0 + 0.09, 90, 0.045, 1.2, 0.2); },
  whoosh(t0) { const d = 0.6, i0 = Math.floor(t0 * SR); let lp = 0, bp = 0; for (let j = 0; j < d * SR; j++) { const t = j / SR, k = t / d, fc = 500 + 2600 * k, F = 2 * Math.sin(Math.PI * fc / SR); const x = noise(), hp = x - lp - 0.4 * bp; bp += F * hp; lp += F * bp; const [gl, gr] = panLR(-0.6 + 1.2 * k), v = bp * Math.pow(Math.sin(Math.PI * k), 2) * 0.1; put(sfx, i0 + j, v * gl, v * gr); } },
  thunk(t0) { const i0 = Math.floor(t0 * SR); let ph = 0; for (let j = 0; j < 0.3 * SR; j++) { const t = j / SR; ph += TAU * (90 + 140 * Math.exp(-t / 0.03)) / SR; const v = Math.sin(ph) * Math.exp(-t / 0.09) * 0.22; put(sfx, i0 + j, v, v); } },
  blip(t0) { bell(t0, 84, 0.04, 0.5, 0.3); },
  lift(t0) { [[79, 0], [76, 0.18], [72, 0.36]].forEach(([m, o]) => bell(t0 + o, m, 0.04, 0.6, 0.2)); },
  // qalam: bir nechta qisqa "shirt" (yuqori chastotali shovqin, notekis)
  scribble(t0) { for (let s = 0; s < 6; s++) { const i0 = Math.floor((t0 + s * 0.11 + ((s * 37) % 5) * 0.01) * SR); let a = 0; for (let j = 0; j < 0.08 * SR; j++) { const t = j / SR, x = noise(); a += 0.8 * (x - a); const v = (x - a) * Math.sin(Math.PI * t / 0.08) * 0.05; put(sfx, i0 + j, v * 0.8, v); } } },
  strike(t0) { const d = 0.35, i0 = Math.floor(t0 * SR); let a = 0; for (let j = 0; j < d * SR; j++) { const t = j / SR, x = noise(); a += 0.6 * (x - a); const v = (x - a) * Math.sin(Math.PI * t / d) * 0.09; put(sfx, i0 + j, v, v); } },
  error(t0) { [[50, 0], [47, 0.16]].forEach(([m, o]) => { const i0 = Math.floor((t0 + o) * SR), f = mtof(m); for (let j = 0; j < 0.28 * SR; j++) { const t = j / SR, ph = TAU * f * t; const v = (Math.sin(ph) + 0.4 * Math.sin(3 * ph) + 0.2 * Math.sin(5 * ph)) * (1 - Math.exp(-t / 0.005)) * Math.exp(-t / 0.12) * 0.07; put(sfx, i0 + j, v, v); } }); },
  swell(t0) { [74, 81, 86].forEach((m, i) => bell(t0 + i * 0.07, m, 0.035, 1.8, -0.3 + i * 0.3)); },
};
CUES.forEach((c) => FX[c.type](c.t));

// reverb (yengil) + mastering
for (let i = 0; i < N; i++) for (let c = 0; c < 2; c++) send[c][i] += pad[c][i] * 0.3 + mar[c][i] * 0.35;
for (const ch of send) { let l = 0; const k = 1 - Math.exp(-TAU * 220 / SR); for (let i = 0; i < N; i++) { l += k * (ch[i] - l); ch[i] -= l; } }
function freeverb(inp, spread) {
  const out = new Float32Array(N);
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => ({ b: new Float32Array(d + spread), i: 0, s: 0 }));
  const aps = [556, 441, 341, 225].map((d) => ({ b: new Float32Array(d + spread), i: 0 }));
  for (let n = 0; n < N; n++) {
    const x = inp[n] * 0.015; let y = 0;
    for (const c of combs) { const o = c.b[c.i]; c.s = o * 0.7 + c.s * 0.3; c.b[c.i] = x + c.s * 0.82; if (++c.i >= c.b.length) c.i = 0; y += o; }
    for (const a of aps) { const o = a.b[a.i]; const v = -y + o; a.b[a.i] = y + o * 0.5; if (++a.i >= a.b.length) a.i = 0; y = v; }
    out[n] = y;
  }
  return out;
}
const revL = freeverb(send[0], 0), revR = freeverb(send[1], 23);
const out = [new Float32Array(N), new Float32Array(N)];
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR, fade = Math.min(1, t / 0.6) * (1 - ramp(t, END - 3, END + 0.2));
  for (let c = 0; c < 2; c++) { const x = pad[c][i] + mar[c][i] + perc[c][i] + sfx[c][i] + bass[i] + (c ? revR[i] : revL[i]) * 2; const y = Math.tanh(x * 1.1) * fade; out[c][i] = y; peak = Math.max(peak, Math.abs(y)); }
}
const gain = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) for (let c = 0; c < 2; c++) buf.writeInt16LE(Math.round(clamp(out[c][i] * gain, -1, 1) * 32767), 44 + i * 4 + c * 2);
fs.writeFileSync('music.wav', buf);
console.log('music.wav', DUR.toFixed(1) + 's', 'cues', CUES.length);
