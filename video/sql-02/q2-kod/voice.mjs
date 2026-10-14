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
  [/\bSELECT\b/g, 'selekt'],
  [/\bmysqld\b/g, 'may-es-kyu-el-di'],
  [/\bthreadlar\b/g, 'tredlar'],
  [/\bthread\b/g, 'tred'],
  [/storage engine’lar/g, 'storidj endjinlar'],
  [/storage engine/g, 'storidj endjin'],
  [/\bengine’lar\b/g, 'endjinlar'],
  [/\bengine\b/g, 'endjin'],
  [/\bInnoDB\b/g, 'Inno-di-bi'],
  [/\bPID\b/g, 'Pi-ay-di'],
  [/\bpg_stat_activity\b/g, 'pe-ge stat aktiviti'],
  [/\bPROCESSLIST\b/g, 'proses-list'],
  [/\bperformance_schema\b/g, 'performans skima'],
  [/\bone_connection\b/g, 'van konnekshn'],
  [/\bsqlite3\b/g, 'es-kyu-layt uch'],
  [/\bdokon\.db\b/g, 'dokon nuqta de-be'],
  [/\bnusxa\.db\b/g, 'nusxa nuqta de-be'],
  [/\bcp\b/g, 'se-pe'],
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

const key = process.env.GEMINI_API_KEY;
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
