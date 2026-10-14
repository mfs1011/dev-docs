// SQL 3-bob 3-video: Gemini TTS orqali ovoz yozib olish
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
  [/\bpsql\b/gi, 'pi-es-kyu-el'],
  [/\bsqlite3\b/gi, 'es-kyu-layt uch'],
  [/\bmysql\b/gi, 'May es-kyu-el'],
  [/\binitdb\b/g, 'init-di-bi'],
  [/\bscram-sha-256\b/g, 'skram sha ikki yuz ellik olti'],
  [/(?:^|\s)-A(?=\s)/g, ' minus ey'],
  [/\.pgpass\b/g, 'nuqta pe-ge-pas'],
  [/\bPGPASSWORD\b/g, 'pe-ge pasvord'],
  [/\bps\b/g, 'pe-es'],
  [/\bchmod 600\b/g, 'ch-mod olti yuz'],
  [/\blocalhost\b/g, 'lokal-xost'],
  [/\b127\.0\.0\.1\b/g, 'bir yuz yigirma yetti, nol, nol, bir'],
  [/\bTCP\b/g, 'ti-si-pi'],
  [/\bUnix\b/g, 'yuniks'],
  [/\b9\.7\b/g, 'to‘qqiz butun yetti'],
  [/--commands\b/g, 'minus-minus kommandz'],
  [/\.tables\b/g, 'nuqta teyblz'],
  [/\bkatta -P\b/g, 'katta minus pe'],
  [/\bkichik -p\b/g, 'kichik minus pe'],
  [/(?:^|\s)-h(?=[\s,])/g, ' minus eych'],
  [/(?:^|\s)-p(?=[\s,])/g, ' minus pe'],
  [/(?:^|\s)-P(?=[\s,])/g, ' katta minus pe'],
  [/(?:^|\s)-U(?=[\s,])/g, ' minus yu'],
  [/(?:^|\s)-u(?=[\s,])/g, ' minus u'],
  [/\b6 ta\b/g, 'oltita'],
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

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
  body: JSON.stringify(body)
});

if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 400)}`);
const data = await response.json();
const audio = (data.steps ?? []).filter((s) => s.type === 'model_output').flatMap((s) => s.content ?? []).filter((c) => c.type === 'audio').at(-1);
if (!audio) throw new Error(`Audio yo'q, status: ${data.status}`);
fs.writeFileSync('voice/raw.wav', Buffer.from(audio.data, 'base64'));
console.log('voice/raw.wav', 'status:', data.status, 'tokens:', data.usage?.total_input_tokens, '->', data.usage?.total_output_tokens);
