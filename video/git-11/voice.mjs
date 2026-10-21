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
  [/\bkommitni\b/gi, "kommitni"],
  [/\bbranch\b/gi, "brench"],
  [/\bbrenchi\b/gi, "brenchi"],
  [/\bHEAD\b/g, "hed"],
  [/\bmain\b/gi, "meyn"],
  [/\bmeyn\b/gi, "meyn"],
  [/\boridjin\b/gi, "orijin"],
  [/\borigin\b/gi, "orijin"],
  [/\bsteyjd\b/gi, "steyjd"],
  [/\bsteyj\b/gi, "steyj"],
  [/\bemend\b/gi, "emend"],
  [/\brestor\b/gi, "restor"],
  [/\bsvitch\b/gi, "svitch"],
  [/\bchekaut\b/gi, "chekaut"],
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
let response, data;
for (let attempt = 1; attempt <= 6; attempt++) {
  response = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) });
  if (response.ok) {
    data = await response.json();
    break;
  }
  const errText = await response.text();
  console.log(`Urinish ${attempt}/6 (HTTP ${response.status}): ${errText.slice(0, 120)}... Qayta urinilmoqda...`);
  if (attempt === 6) throw new Error(`HTTP ${response.status}: ${errText.slice(0, 400)}`);
  await new Promise((r) => setTimeout(r, attempt * 4000));
}
const audio = (data.steps ?? []).filter((s) => s.type === 'model_output').flatMap((s) => s.content ?? []).filter((c) => c.type === 'audio').at(-1);
if (!audio) throw new Error(`Audio yo'q, status: ${data.status}`);
const buf = Buffer.from(audio.data, 'base64');
fs.writeFileSync('voice/raw.wav', buf);
console.log(`voice/raw.wav yozildi (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
