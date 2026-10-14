// Ovoz birinchi: narration.js -> Gemini TTS (bitta so'rov) -> voice/raw.wav + voice/lines.json
//   node voice.mjs --plan    # modelga ketadigan matn, so'rovsiz
//   node voice.mjs           # GEMINI_API_KEY kerak; kunlik bepul limitdan 1 so'rov
// Keyin: ../align-lines.py . && node build-timing.mjs
import './narration.js';
import fs from 'node:fs';

const NR = globalThis.NR;
const MODEL = process.env.GEMINI_TTS_MODEL ?? 'gemini-3.8-flash-tts';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const VOICE = process.env.VOICE ?? 'Charon';
const STYLE = 'warm, natural, conversational narration of a short educational explainer video, moderate pace, natural pauses between sentences';

const SAY = [
  [/PostgreSQL’?/g, 'Postgres'],
  [/MySQL’?/g, 'May es-kyu-el'],
  [/SQLite’?/g, 'Es-kyu-layt'],
  [/\bSQL\b/g, 'es-kyu-el'],
  [/(?:^|\s)-A(?=\s)/g, ' minus ey'],
  [/\binitdb\b/g, 'init-di-bi'],
  [/\bpg_ctl\b/g, 'pi-ji-si-ti-el'],
  [/\bscram-sha-256\b/g, 'skram sha ikki yuz ellik olti'],
  [/\bmysqld\b/g, 'may-es-kyu-el-di'],
  [/\bmysql\b/gi, 'May es-kyu-el'],
  [/--initialize\b/g, 'minus-minus inishilayz'],
  [/\bALTER USER\b/g, 'alter yuzer'],
  [/\blocalhost\b/g, 'lokal-xost'],
  [/\bUnix socket\b/g, 'yuniks soket'],
  [/\bTCP\/IP\b/g, 'ti-si-pi ay-pi'],
  [/\bTCP\b/g, 'ti-si-pi'],
  [/\bpsql\b/g, 'pi-es-kyu-el'],
  [/\bsqlite3\b/g, 'es-kyu-layt uch'],
  [/\b127\.0\.0\.1\b/g, 'bir yuz yigirma yetti, nol, nol, bir'],
  [/\b5432\b/g, 'ellik to‘rt o‘ttiz ikki'],
  [/\b3306\b/g, 'o‘ttiz uch nol olti'],
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
    const envStr = fs.readFileSync(new URL('../../../.env', import.meta.url), 'utf8');
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
fs.writeFileSync('voice/raw.wav', Buffer.from(audio.data, 'base64'));
console.log('voice/raw.wav', 'status:', data.status, 'tokens:', data.usage?.total_input_tokens, '->', data.usage?.total_output_tokens);
