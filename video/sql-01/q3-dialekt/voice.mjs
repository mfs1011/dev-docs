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

// SQL atamalari o'zbek dasturchilari aytgandek (faqat modelga ketadigan matnda)
const SAY = [
  // 1-bob atamalari va raqamlari (so'z bilan — model raqamni inglizcha o'qib yubormasin)
  [/Structured Query Language/g, 'Strakchrd Kveri Lengvij'], [/ISO\/IEC 9075/g, 'I-es-o, I-i-si to‘qqiz ming yetmish besh'],
  [/SQL-92/g, 'es-kyu-el to‘qson ikki'], [/SQL 1999/g, 'es-kyu-el bir ming to‘qqiz yuz to‘qson to‘qqiz'], [/SQL 2023/g, 'es-kyu-el ikki ming yigirma uch'],
  [/PostgreSQL 18/g, 'Postgres o‘n sakkiz'], [/\b177\b/g, 'bir yuz yetmish yetti'], [/\b170\b/g, 'bir yuz yetmish'],
  [/\bMBBT\b/g, 'Em-Be-Be-Te'], [/\bORM\b/g, 'O-er-em'], [/\bCore’?/g, 'Kor'], [/\bFoundation\b/g, 'Faundeyshn'], [/\bQuirks\b/g, 'Kvirks'],
  [/information_schema/g, 'informeyshn skima'], [/sql_features/g, 'es-kyu-el fichers'], [/\bE011\b/g, 'E nol o‘n bir'], [/\bF302\b/g, 'F uch yuz ikki'],
  [/\bT611\b/g, 'T olti yuz o‘n bir'], [/\bT626\b/g, 'T olti yuz yigirma olti'], [/\bINTERSECT\b/g, 'intersekt'], [/\bANY_VALUE\b/g, 'eni velyu'],
  [/\bwindow\b/g, 'vindou'], [/\bMVCC\b/g, 'Em-vi-si-si'], [/\bCONCAT\b/g, 'konkat'], [/\bDQS\b/g, 'Di-kyu-es'], [/\bdbconfig\b/g, 'di-bi-konfig'],
  [/\bANSI\b/g, 'Ensi'], [/\babc\b/g, 'a-be-se'], [/\bNULL\b/g, 'nal'], [/\bE011\b/g, 'E nol o‘n bir'],
  [/PostgreSQL’?/g, 'Postgres'], [/MySQL’?/g, 'May es-kyu-el'], [/SQLite’?/g, 'Es-kyu-layt'], [/\bSQL\b/g, 'es-kyu-el'],
  [/CREATE INDEX/g, 'kriyeyt indeks'], [/GROUP BY/g, 'grup bay'], [/ORDER BY/g, 'order bay'],
  [/\bSELECT\b/g, 'selekt'], [/\bFROM\b/g, 'from'], [/\bWHERE\b/g, 'ver'], [/\bJOIN\b/g, 'joyn'],
  [/\bINSERT\b/g, 'insert'], [/\bUPDATE\b/g, 'apdeyt'], [/\bDELETE\b/g, 'dilit'],
  [/\bCOMMIT\b/g, 'kommit'], [/\bROLLBACK\b/g, 'roulbek'], [/\bCount\b/g, 'Kaunt'], [/\bId\b/g, 'Ay-di'], [/\bid\b/g, 'ay-di'],
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
