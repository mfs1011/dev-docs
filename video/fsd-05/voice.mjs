// FSD (Kore). Ovoz birinchi: narration.js -> Gemini TTS (bitta so'rov) -> voice/raw.wav + voice/lines.json
//   node voice.mjs --plan    # modelga ketadigan matn, so'rovsiz
//   node voice.mjs           # GEMINI_API_KEY kerak; kunlik bepul limitdan 1 so'rov
// Keyin: ../align-lines.py . && node build-timing.mjs
import './narration.js';
import fs from 'node:fs';

const NR = globalThis.NR;
const MODEL = process.env.GEMINI_TTS_MODEL ?? 'gemini-3.8-flash-tts';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const VOICE = process.env.VOICE ?? 'Kore';
const STYLE = 'warm, natural, conversational narration of a short educational explainer video, moderate pace, natural pauses between sentences';

// FSD atamalari o'zbek dasturchilari aytgandek (faqat modelga ketadigan matnda)
const SAY = [
  [/\b2\.0\b/g, 'ikki nuqta nol'], [/\b2\.1\b/g, 'ikki nuqta bir'], [/\bConduit\b/g, 'Kondyuit'], [/\bapply-promo-code\b/g, 'epplay-promo-kod'], [/\bComponents\b/g, 'Komponents'], [/\bhooks\b/g, 'xuks'], [/\btypes\b/g, 'tayps'], [/\bconstants\b/g, 'konstants'], [/\bstore’lar/g, 'storlar'], [/\bflag’lar/g, 'fleglar'], [/\bbackend\b/g, 'bekend'], [/\badd-to-cart\b/g, 'ed-tu-kart'], [/\bwishlist’?/g, 'vishlist'], [/\border\b/g, 'order'], [/\borders\b/g, 'orders'], [/\bShared\b/g, 'Sherd'], [/\bsrc\b/g, 'es-ar-si'], [/\bheader\b/g, 'xeder'], [/\bHeader\b/g, 'Xeder'], [/\bcore\b/g, 'kor'], [/\bProcesses\b/g, 'Proseses'], [/\bWidgets\b/g, 'Vijets'], [/\bFeatures\b/g, 'Fichers'], [/\bEntities\b/g, 'Entitiz'], [/\bwidgetdan\b/g, 'vijetdan'], [/\bwidgeti\b/g, 'vijeti'], [/\bui\b/g, 'Yu-ay'], [/\blib’dan/g, 'libdan'], [/\bMedium\b/g, 'Midium'],
  [/\blike-article\b/g, 'layk-artikl'], [/\bArticle\b/g, 'Artikl'], [/\barticle\b/g, 'artikl'],
  [/Feature-Sliced Design/g, 'Ficher-Slayst Dizayn'], [/\bFSD/g, 'Ef-es-di'], [/\bcomponents\b/g, 'komponents'], [/\butils\b/g, 'yutils'],
  [/\bhelpers\b/g, 'xelpers'], [/\bshared\b/g, 'sherd'], [/\bentities\b/g, 'entitiz'], [/\bentity\b/g, 'entiti'],
  [/\bfeatures\b/g, 'fichers'], [/\bfeature/g, 'ficher'], [/\bWidgets\b/g, 'Vijets'], [/\bwidget/g, 'vijet'], [/\bPages\b/g, 'Peyjiz'], [/\bpages\b/g, 'peyjiz'], [/\bVue\b/g, 'Vyu'], [/\bframework\b/g, 'freymvork'], [/\bmodules\b/g, 'modyuls'], [/\bcore\b/g, 'kor'],
  [/\bapp\b/g, 'ep'], [/\bprocesses\b/g, 'proseses'], [/\bslice’?/g, 'slays'], [/\bSlice’?/g, 'Slays'], [/(Ef-es-di)’/g, '$1'], [/\bproduct\b/g, 'prodakt'], [/\bcart\b/g, 'kart'],
  [/\bui\b/g, 'Yu-ay'], [/\bapi\b/g, 'ey-pi-ay'], [/\bAPI’?/g, 'ey-pi-ay'], [/\blib\b/g, 'lib'], [/\bconfig\b/g, 'konfig'],
  [/index\.ts/g, 'indeks ti-es'], [/\bpublic\b/g, 'pablik'], [/\bSteiger\b/g, 'Stayger'], [/\bfrontend\b/g, 'frontend'],
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
