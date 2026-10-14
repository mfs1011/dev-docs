// Ovozli hikoya: subtitrlar (timeline.js) -> Gemini TTS (bitta so'rov) -> voice/raw.wav + voice/lines.json
//
//   GEMINI_API_KEY=... node voice.mjs          # so'rov yuboradi (kunlik bepul limitdan 1 ta)
//   node voice.mjs --plan                      # yuboriladigan matnni ko'rsatadi, so'rov yo'q
//
// Keyin: ../align-lines.py (gap chegaralari) va build-voice.mjs (kesish, vaqtni cho'zish, VTT).
import './timeline.js';
import fs from 'node:fs';

const TL = globalThis.TL;
const MODEL = process.env.GEMINI_TTS_MODEL ?? 'gemini-3.8-flash-tts';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const VOICE = process.env.VOICE ?? 'Charon';
const STYLE = 'warm, natural, conversational narration of a short educational explainer video, moderate pace, natural pauses between sentences';

// Inglizcha atamalar o'zbek dasturchilari aytgandek (faqat modelga ketadigan matnda)
const SAY = [
  [/GitHub/g, 'Githab'], [/HEAD/g, 'hed'], [/\bgit add\b/g, 'git ed'], [/(?<=→ )add\b/g, 'ed'], [/\badd\b/g, 'ed'],
  [/[Cc]ommit/g, (m) => (m[0] === 'C' ? 'Kommit' : 'kommit')], [/[Bb]ranch/g, (m) => (m[0] === 'B' ? 'Brench' : 'brench')],
  [/[Mm]erge/g, (m) => (m[0] === 'M' ? 'Merj' : 'merj')], [/\bpull\b/g, 'pul'], [/\bfetch\b/g, 'fech'],
  [/\bfeature/g, 'ficher'], [/\bmain/g, 'meyn'], [/\bswitch\b/g, 'svitch'], [/\bremote/g, 'rimout'],
  [/\bstaging/g, 'steyjing'], [/snapshot/g, 'snepshot'], [/\bhash\b/g, 'hesh'],
];
const toSay = (text) => SAY.reduce((s, [re, to]) => s.replace(re, to), text.replace(/`/g, '').replace(/\n/g, ' ').replace(/\s*→\s*/g, ', ').replace(/\s\+\s/g, ' va '))
  // "kommit’ga" -> "kommitga": inglizcha o'zakdan keyingi tutuq — o'zbekcha yozuvda qo'shimcha qo'shilib yoziladi
  .replace(/(kommit|brench|meyn|ficher|rimout|Githab|steyjing|Git|merj|hed)’/gi, '$1')
  // Jumla boshi katta harf bilan (atama almashgandan keyin "hed esa…" kichik qolmasin)
  .replace(/(^|[.!?…]\s+)(\p{Ll})/gu, (m, p, c) => p + c.toUpperCase());
const toShow = (text) => text.replace(/`/g, '');

// Sahnalar tartibida, eski (subtitrli) global vaqt bilan. Matn — TL.narration (eshitish uchun yozilgan)
const order = ['intro', 'muammo', 'hudud', 'commit', 'branch', 'remote', 'xulosa'];
const lines = order.flatMap((scene) => (TL.narration[scene] ?? []).map(([s, e, text]) => ({
  scene, s: TL.S[scene] + s, e: TL.S[scene] + e, show: toShow(text), say: toSay(text),
})));

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
