// Ovoz: narration.js -> Gemini TTS -> voice/raw.wav + voice/lines.json
import './narration.js';
import fs from 'node:fs';

const NR = globalThis.NR;
const MODEL = process.env.GEMINI_TTS_MODEL ?? 'gemini-3.8-flash-tts';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const VOICE = process.env.VOICE ?? 'Charon';
const STYLE = 'warm, natural, conversational narration of a short educational explainer video, moderate pace, natural pauses between sentences';

const SAY = [
  [/\bcommit\b/gi, "kommit"],
  [/\bkommit\b/gi, "kommit"],
  [/\bkommitni\b/gi, "kommitni"],
  [/\bkommitga\b/gi, "kommitga"],
  [/\bkommitlar\b/gi, "kommitlar"],
  [/\bbranch\b/gi, "brench"],
  [/\badd\b/gi, "ed"],
  [/\binit\b/gi, "init"],
  [/\bclone\b/gi, "klon"],
  [/\bHEAD\b/g, "hed"],
  [/\bmain\b/gi, "meyn"],
  [/\bstatus\b/gi, "status"],
  [/\bnuqta git\b/gi, "nuqta git"],
  [/\bnuqta\b/gi, "nuqta"],
  [/\bvorking tri\b/gi, "vorking tri"],
  [/\bsteyjing eria\b/gi, "steyjing eria"],
  [/\bgit direktori\b/gi, "git direktori"],
  [/\bmodifayd\b/gi, "modifayd"],
  [/\bsteyjd\b/gi, "steyjd"],
  [/\bkommitted\b/gi, "kommitted"],
];
const toSay = (text) => SAY.reduce((s, [re, to]) => s.replace(re, to), text)
  .replace(/(^|[.!?…]\s+)(\p{Ll})/gu, (m, p, c) => p + c.toUpperCase());

const lines = NR.lines.map((l) => ({ ...l, show: l.text, say: toSay(l.text) }));
fs.mkdirSync('voice', { recursive: true });
fs.writeFileSync('voice/lines.json', JSON.stringify(lines, null, 2));
const transcript = lines.map((l) => l.say).join('\n\n');

if (process.argv.includes('--plan')) {
  console.log(transcript);
  console.log(`\n${lines.length} gap, ${transcript.split(/\s+/).length} so'z`);
  process.exit(0);
}

let key = process.env.GEMINI_API_KEY;
if (!key) {
  try {
    const envStr = fs.readFileSync(new URL('../../.env', import.meta.url), 'utf8');
    const m = envStr.match(/^GEMINI_API_KEY=(.+)$/m);
    if (m) key = m[1].trim();
  } catch {}
}
if (!key) throw new Error('GEMINI_API_KEY yo\'q');
const body = {
  model: MODEL,
  input: [{ type: 'user_input', content: [{ type: 'text', text: transcript, annotations: [{ type: 'speech_metadata', style: STYLE }] }] }],
  response_format: { type: 'audio' },
  generation_config: { speech_config: [{ voice: VOICE }] },
};
const response = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) });
if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 400)}`);
const data = await response.json();
const audio = (data.steps ?? []).filter((s) => s.type === 'model_output').flatMap((s) => s.content ?? []).filter((c) => c.type === 'audio').at(-1);
if (!audio) throw new Error(`Audio yo'q, status: ${data.status}`);
const buf = Buffer.from(audio.data, 'base64');
fs.writeFileSync('voice/raw.wav', buf);
console.log(`voice/raw.wav yozildi (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
