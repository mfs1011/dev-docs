// Ovoz: narration.js -> Gemini TTS -> voice/raw.wav + voice/lines.json
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
  [/\bCTE\b/g, 'si-ti-i'],
  [/\bWITH RECURSIVE\b/gi, 'viz rekursiv'],
  [/\bWITH\b/g, 'viz'],
  [/\bRECURSIVE\b/gi, 'rekursiv'],
  [/\bUNION ALL\b/gi, 'yunon ol'],
  [/\bUNION\b/gi, 'yunon'],
  [/\bSEARCH DEPTH FIRST\b/gi, 'sorch deps forst'],
  [/\bSEARCH BREADTH FIRST\b/gi, 'sorch breds forst'],
  [/\bSEARCH\b/gi, 'sorch'],
  [/\bCYCLE\b/gi, 'saykl'],
  [/\bVALUES ROW\b/gi, 'valyuz rou'],
  [/\bVALUES\b/gi, 'valyuz'],
  [/\bSELECT\b/g, 'selekt'],
  [/\bFROM\b/g, 'from'],
  [/\bWHERE\b/g, 'veer'],
  [/\bINSERT\b/g, 'insert'],
  [/\bUPDATE\b/g, 'apdeyt'],
  [/\bDELETE\b/g, 'dilit'],
  [/\bVIEW\b/g, 'vyu'],
  [/\bSQL\b/g, 'es-kyu-el'],
  [/\bLIMIT\b/g, 'limit'],
  [/\bORDER BY\b/g, 'order bay'],
  [/\bCONCAT\b/g, 'konkat'],
  [/\bREPEAT\b/g, 'ripit'],
  [/\bCAST\b/g, 'kast'],
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
const buf = Buffer.from(audio.data, 'base64');
fs.writeFileSync('voice/raw.wav', buf);
console.log(`voice/raw.wav yozildi (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
