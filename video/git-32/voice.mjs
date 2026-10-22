// Ovoz: narration.js -> Gemini TTS -> voice/raw.wav + voice/lines.json
import './narration.js';
import fs from 'node:fs';

const NR = globalThis.NR;
const MODEL = process.env.GEMINI_TTS_MODEL ?? 'gemini-3.8-flash-tts';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const VOICE = process.env.VOICE ?? 'Charon';
const STYLE = 'warm, natural, conversational narration of a short educational explainer video, moderate pace, natural pauses between sentences';

const SAY = [
  [/\bworkflow\b/gi, "vorkflou"],
  [/\bworkflowlar\b/gi, "vorkfloular"],
  [/\bworkflowlari\b/gi, "vorkfloulari"],
  [/\bmaintainer\b/gi, "meynteyner"],
  [/\bFork\b/gi, "fork"],
  [/\bPull Request\b/gi, "pul rekvest"],
  [/\bGitHub\b/gi, "git hab"],
  [/\bGitLab\b/gi, "git leb"],
  [/format-patch\b/gi, "format pech"],
  [/git am\b/gi, "git ey em"],
  [/fast-forward\b/gi, "fast forvard"],
  [/\bcommit\b/gi, "kommit"],
  [/\bcommitlar\b/gi, "kommitlar"],
  [/\bcommitlari\b/gi, "kommitlari"],
  [/\brepo\b/gi, "repo"],
  [/\brepo'ga\b/gi, "repoga"],
  [/\bbranch\b/gi, "brench"],
  [/\bbranchlar\b/gi, "brenchlar"]
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

// Kalitlarni yig'ish (.env dan barcha kalitlar, faol va kommentdagi)
const keys = [];
if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY.trim());
try {
  const envStr = fs.readFileSync(new URL('../../.env', import.meta.url), 'utf8');
  for (const m of envStr.matchAll(/^(?:#\s*)?GEMINI_API_KEY=(.+)$/gm)) {
    const k = m[1].trim();
    if (k && !keys.includes(k)) keys.push(k);
  }
} catch {}

if (!keys.length) throw new Error('GEMINI_API_KEY yo\'q');

const body = {
  model: MODEL,
  input: [{ type: 'user_input', content: [{ type: 'text', text: transcript, annotations: [{ type: 'speech_metadata', style: STYLE }] }] }],
  response_format: { type: 'audio' },
  generation_config: { speech_config: [{ voice: VOICE }] },
};

console.log(`TTS so'rovi yuborilmoqda: ${MODEL}, ovoz: ${VOICE}...`);
console.log(`Matn uzunligi: ${transcript.length} belgi, ${lines.length} gap. Mavjud kalitlar: ${keys.length} ta.`);

let lastError = null;
let success = false;

for (let kIdx = 0; kIdx < keys.length; kIdx++) {
  const key = keys[kIdx];
  console.log(`Kalit #${kIdx + 1} bilan urinish...`);

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText.slice(0, 300)}`);
      }

      const data = await response.json();
      const audio = (data.steps ?? []).filter((s) => s.type === 'model_output').flatMap((s) => s.content ?? []).filter((c) => c.type === 'audio').at(-1);
      if (!audio) throw new Error(`Audio yo'q, status: ${data.status}`);

      const buf = Buffer.from(audio.data, 'base64');
      fs.writeFileSync('voice/raw.wav', buf);
      console.log(`voice/raw.wav muvaffaqiyatli yozildi (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
      success = true;
      break;
    } catch (err) {
      lastError = err;
      console.warn(`Kalit #${kIdx + 1}, urinish ${attempt} xatosi: ${err.message}`);
      if (err.message.includes('429')) {
        // Rate limit, keyingi kalitga o'tish
        break;
      }
      if (attempt < 2) {
        console.log('3 soniya kutilmoqda...');
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  if (success) break;
}

if (!success) {
  throw lastError ?? new Error('Barcha kalitlar bilan audio olish muvaffaqiyatsiz bo\'ldi');
}
