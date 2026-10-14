// voice/raw.wav + voice/lines.json (align-lines.py dan keyin) ->
//   voice/voice.wav  — gaplar yangi vaqtlariga joylangan hikoya
//   voice/warp.js    — animatsiya vaqtini cho'zish tugunlari (index.html va music.mjs o'qiydi)
//   voice/subtitles.vtt, voice/chapters.vtt — pleyer uchun
import './timeline.js';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const TL = globalThis.TL, S = TL.S;
const PRE = 0.3;   // oyna boshidan ovozgacha
const POST = 0.6;  // ovozdan keyin keyingi harakatgacha nafas
const lines = JSON.parse(fs.readFileSync('voice/lines.json', 'utf8'));

// --- raw.wav (PCM s16 mono) ---
const wav = fs.readFileSync('voice/raw.wav');
const rate = wav.readUInt32LE(24);
const dataAt = wav.indexOf('data') + 8;
const pcm = new Int16Array(wav.buffer.slice(wav.byteOffset + dataAt, wav.byteOffset + wav.length - ((wav.length - dataAt) % 2)));
const rawDur = pcm.length / rate;

// --- gaplar chegarasi: aligner chegarasiga eng yaqin haqiqiy jimlikning o'rtasi ---
const sil = execFileSync('sh', ['-c', 'ffmpeg -hide_banner -i voice/raw.wav -af silencedetect=noise=-40dB:d=0.2 -f null - 2>&1'], { encoding: 'utf8' });
const silences = [...sil.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
const cuts = [Math.max(0, lines[0].a0 - 0.15)];
for (let i = 1; i < lines.length; i++) {
  const lo = lines[i - 1].a1 - 1, hi = lines[i].a0 + 0.3, mid = (lines[i - 1].a1 + lines[i].a0) / 2;
  const near = silences.filter(([s, e]) => e > lo && s < hi).sort((x, y) => Math.abs((x[0] + x[1]) / 2 - mid) - Math.abs((y[0] + y[1]) / 2 - mid))[0];
  cuts.push(near ? (near[0] + near[1]) / 2 : mid);
}
cuts.push(Math.min(rawDur, lines.at(-1).a1 + 0.35));

// Har bo'lakda nutq qayerda boshlanadi: kesish nuqtasidan keyingi birinchi jimlik tugashi (yoki aligner)
lines.forEach((l, i) => {
  const start = silences.find(([s, e]) => s <= cuts[i] + 0.01 && e > cuts[i]);
  l.c0 = cuts[i]; l.c1 = cuts[i + 1];
  l.v0 = Math.max(cuts[i], start ? start[1] : l.a0);  // ovoz boshlanishi (raw'da)
  l.speech = l.a1 - l.v0;
});

// --- warp: eski oyna [s, e] -> yangi oyna, uzunligi max(eski, ovoz + nafas) ---
const knots = [[0, 0]];
let shift = 0;
lines.forEach((l) => {
  const oldLen = l.e - l.s, newLen = Math.max(oldLen, PRE + l.speech + POST);
  knots.push([l.s + shift, l.s]);
  l.ns = l.s + shift;
  shift += newLen - oldLen;
  l.ne = l.e + shift;
  knots.push([l.ne, l.e]);
});
knots.push([S.end + shift, S.end]);
const END = S.end + shift;
fs.writeFileSync('voice/warp.js', `// build-voice.mjs yaratgan — qo'lda tahrirlanmaydi\n(typeof window !== 'undefined' ? window : globalThis).TL.warp = ${JSON.stringify(knots.map(([a, b]) => [+a.toFixed(3), +b.toFixed(3)]))};\n`);

// --- voice.wav: har gap yangi oynasi boshidan PRE keyin ---
const out = new Int16Array(Math.ceil((END + 0.5) * rate));
lines.forEach((l) => {
  const from = Math.floor(l.c0 * rate), to = Math.floor(l.c1 * rate);
  const at = Math.floor((l.ns + PRE - (l.v0 - l.c0)) * rate);
  const fade = Math.floor(0.03 * rate);
  for (let k = from; k < to; k++) {
    const edge = Math.min(1, (k - from) / fade, (to - 1 - k) / fade);
    const j = at + (k - from);
    if (j >= 0 && j < out.length) out[j] = Math.round(pcm[k] * edge);
  }
});
const header = Buffer.alloc(44);
header.write('RIFF', 0); header.writeUInt32LE(36 + out.length * 2, 4); header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22); header.writeUInt32LE(rate, 24);
header.writeUInt32LE(rate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(out.length * 2, 40);
fs.writeFileSync('voice/voice.wav', Buffer.concat([header, Buffer.from(out.buffer)]));

// --- VTT ---
const ts = (t) => { const ms = Math.round(t * 1000); return `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`; };
const subs = lines.map((l, i) => `${i + 1}\n${ts(l.ns + PRE - 0.1)} --> ${ts(l.ne - 0.15)}\n${l.show}`).join('\n\n');
fs.writeFileSync('voice/subtitles.vtt', `WEBVTT\n\n${subs}\n`);
const toNew = (t) => {
  for (let i = 1; i < knots.length; i++) if (t <= knots[i][1]) { const [n0, o0] = knots[i - 1], [n1, o1] = knots[i]; return n0 + ((t - o0) / (o1 - o0 || 1)) * (n1 - n0); }
  return END;
};
const CH = [[S.intro, 'Kirish'], [S.muammo, 'Muammo'], [S.hudud, 'Uch hudud'], [S.commit, 'Commit ichida'], [S.branch, 'Branch'], [S.branch + TL.branch.mergeChip, 'Merge'], [S.remote, 'Remote'], [S.xulosa, 'Xulosa'], [S.end, null]];
const chapters = CH.slice(0, -1).map(([t, name], i) => `${ts(toNew(t))} --> ${ts(toNew(CH[i + 1][0]))}\n${name}`).join('\n\n');
fs.writeFileSync('voice/chapters.vtt', `WEBVTT\n\n${chapters}\n`);

fs.writeFileSync('voice/lines.json', JSON.stringify(lines, null, 2));
const stretched = lines.filter((l) => l.ne - l.ns > l.e - l.s + 0.01).length;
console.log(`video: ${S.end}s -> ${END.toFixed(1)}s, cho'zilgan oynalar: ${stretched}/${lines.length}, ovoz: voice/voice.wav`);
