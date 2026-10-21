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
  [/\bbranch\b/gi, "brench"],
  [/\bHEAD\b/g, "hed"],
  [/(?:--|—)?porcelain\b/gi, (m) => m.startsWith('-') ? "minus minus porselan" : "porselan"],
  [/\bplumbing\b/gi, "plambing"],
  [/\.git\b/gi, "nuqta git"],
  [/\bblob\b/gi, "blob"],
  [/\btree\b/gi, "tri"],
  [/\bindex\b/gi, "indeks"],
  [/\bindexdan\b/gi, "indeksdan"],
  [/\bhash\b/gi, "hesh"],
  [/\brev-parse\b/gi, "rev-pars"],
  [/\bref\b/gi, "ref"],
  [/\badd\b/gi, "edd"],
  [/\bstatus\b/gi, "status"],
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

let lastError = null;
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    console.log(`TTS so'rovi yuborilmoqda (urinish ${attempt}/3)...`);
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText.slice(0, 400)}`);
    }
    const data = await response.json();
    const audio = (data.steps ?? []).filter((s) => s.type === 'model_output').flatMap((s) => s.content ?? []).filter((c) => c.type === 'audio').at(-1);
    if (!audio) throw new Error(`Audio yo'q, status: ${data.status}`);
    const buf = Buffer.from(audio.data, 'base64');
    fs.writeFileSync('voice/raw.wav', buf);
    console.log(`voice/raw.wav yozildi (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
    lastError = null;
    break;
  } catch (err) {
    lastError = err;
    console.warn(`Urinish ${attempt} xatolik bilan tugadi: ${err.message}`);
    if (attempt < 3) {
      console.log('5 soniya kutilmoqda...');
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

if (lastError) {
  throw lastError;
}
