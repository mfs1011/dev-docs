// Ovoz birinchi: voice/raw.wav + voice/lines.json (so'z vaqtlari bilan) ->
//   voice/timing.js    — har gap va so'zning VIDEO vaqti (anim.js shundan o'qiydi)
//   voice/voice.wav    — sahnalar orasiga pauza qo'shilgan hikoya
//   voice/subtitles.vtt, voice/chapters.vtt
// Ovoz uzluksiz: gaplar orasidagi tabiiy pauza saqlanadi; faqat sahna chegarasida va
// natija ko'rsatiladigan joyda (HOLD) jimlik qo'shiladi.
import './narration.js';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const NR = globalThis.NR;
const START = 1.4;        // video boshida sarlavha chiqishi uchun
const SCENE_GAP = 1.6;    // sahnalar orasidagi o'tish
const TAIL = 3.0;         // oxirgi gapdan keyin
// Gapdan keyin qo'shimcha vaqt: animatsiya natijani ko'rsatib ulgursin
const HOLD = NR.hold;
const SCENE_NAMES = NR.sceneNames;

const lines = JSON.parse(fs.readFileSync('voice/lines.json', 'utf8'));
const wav = fs.readFileSync('voice/raw.wav');
const rate = wav.readUInt32LE(24);
// Faqat 'data' bo'lagi: Gemini WAV oxiriga C2PA (AI kelib chiqish belgisi) qo'shadi — uni audio deb o'qisak, oxirida shovqin chiqadi
const dataAt = wav.indexOf('data') + 8, dataSize = wav.readUInt32LE(dataAt - 4);
const pcm = new Int16Array(wav.buffer.slice(wav.byteOffset + dataAt, wav.byteOffset + dataAt + dataSize - (dataSize % 2)));
const rawDur = pcm.length / rate;

// Gaplar orasidagi kesish nuqtasi: chegaraga eng yaqin haqiqiy jimlikning o'rtasi
const sil = execFileSync('sh', ['-c', 'ffmpeg -hide_banner -i voice/raw.wav -af silencedetect=noise=-40dB:d=0.2 -f null - 2>&1'], { encoding: 'utf8' });
const silences = [...sil.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
const cuts = [Math.max(0, lines[0].a0 - 0.12)];
for (let i = 1; i < lines.length; i++) {
  const lo = lines[i - 1].a1 - 1, hi = lines[i].a0 + 0.3, mid = (lines[i - 1].a1 + lines[i].a0) / 2;
  const near = silences.filter(([s, e]) => e > lo && s < hi).sort((x, y) => Math.abs((x[0] + x[1]) / 2 - mid) - Math.abs((y[0] + y[1]) / 2 - mid))[0];
  cuts.push(near ? (near[0] + near[1]) / 2 : mid);
}
cuts.push(Math.min(rawDur, lines.at(-1).a1 + 0.3));

// Har bo'lak video vaqtiga: oldingisidan keyin, sahna chegarasida SCENE_GAP, gapdan keyin HOLD
let cursor = START;
const out = [];
lines.forEach((l, i) => {
  if (i > 0 && l.scene !== lines[i - 1].scene) cursor += SCENE_GAP;
  const shift = cursor - cuts[i];              // raw -> video
  l.c0 = cuts[i]; l.c1 = cuts[i + 1]; l.at = cursor;
  l.s = +(l.a0 + shift).toFixed(3); l.e = +(l.a1 + shift).toFixed(3);
  l.words = l.words.map((w) => ({ w: w.w, s: +(w.s + shift).toFixed(3), e: +(w.e + shift).toFixed(3) }));
  cursor += (cuts[i + 1] - cuts[i]) + (HOLD[l.id] ?? 0);
  out.push(l);
});
const END = cursor + TAIL;

// Sahna chegaralari: birinchi gapdan 0,8 s oldin boshlanadi
const scenes = {};
NR.scenes.forEach((name, k) => {
  const first = out.find((l) => l.scene === name);
  scenes[name] = { s: k === 0 ? 0 : +(first.at - SCENE_GAP / 2).toFixed(3) };
});
NR.scenes.forEach((name, k) => { scenes[name].e = k < NR.scenes.length - 1 ? scenes[NR.scenes[k + 1]].s : +END.toFixed(3); });

const TM = { end: +END.toFixed(3), scenes, lines: Object.fromEntries(out.map((l) => [l.id, { s: l.s, e: l.e, words: l.words }])) };
fs.writeFileSync('voice/timing.js', `// build-timing.mjs yaratgan — qo'lda tahrirlanmaydi\n(typeof window !== 'undefined' ? window : globalThis).TM = ${JSON.stringify(TM)};\n`);

// voice.wav
const buf = new Int16Array(Math.ceil((END + 0.5) * rate));
const fade = Math.floor(0.02 * rate);
out.forEach((l) => {
  const from = Math.floor(l.c0 * rate), to = Math.floor(l.c1 * rate), at = Math.floor(l.at * rate);
  for (let k = from; k < to; k++) {
    const edge = Math.min(1, (k - from) / fade, (to - 1 - k) / fade);
    buf[at + (k - from)] = Math.round(pcm[k] * edge);
  }
});
const header = Buffer.alloc(44);
header.write('RIFF', 0); header.writeUInt32LE(36 + buf.length * 2, 4); header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22); header.writeUInt32LE(rate, 24);
header.writeUInt32LE(rate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(buf.length * 2, 40);
fs.writeFileSync('voice/voice.wav', Buffer.concat([header, Buffer.from(buf.buffer)]));

// VTT: subtitr — gap ko'rinadigan matni (uzun gap ikki qatorga), bo'limlar — sahnalar
const ts = (t) => { const ms = Math.round(t * 1000); return `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`; };
const wrap = (text) => {
  if (text.length <= 60) return text;
  const mid = text.length / 2, spaces = [...text.matchAll(/ /g)].map((m) => m.index);
  const cut = spaces.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid))[0];
  return `${text.slice(0, cut)}\n${text.slice(cut + 1)}`;
};
fs.writeFileSync('voice/subtitles.vtt', `WEBVTT\n\n${out.map((l, i) => `${i + 1}\n${ts(l.s - 0.1)} --> ${ts(l.e + 0.35)}\n${wrap(l.show)}`).join('\n\n')}\n`);
fs.writeFileSync('voice/chapters.vtt', `WEBVTT\n\n${NR.scenes.map((n) => `${ts(scenes[n].s)} --> ${ts(scenes[n].e)}\n${SCENE_NAMES[n]}`).join('\n\n')}\n`);
console.log(`video: ${END.toFixed(1)}s (${Math.floor(END / 60)}:${String(Math.round(END % 60)).padStart(2, '0')}), gaplar: ${out.length}, sahnalar: ${NR.scenes.length}`);
