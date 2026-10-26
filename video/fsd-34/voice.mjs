// FSD (Kore). Ovoz: narration.js -> Gemini TTS -> voice/raw.wav + voice/lines.json
import './narration.js';
import fs from 'node:fs';

const NR = globalThis.NR;
const MODEL = process.env.GEMINI_TTS_MODEL ?? 'gemini-3.8-flash-tts';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const VOICE = process.env.VOICE ?? 'Kore';
const STYLE = 'warm, natural, conversational narration of a short educational explainer video, moderate pace, natural pauses between sentences';

// FSD atamalari o'zbek dasturchilari aytgandek (faqat modelga ketadigan matnda)
const SAY = [
  [/\b2\.0\b/g, 'ikki nuqta nol'],
  [/\b2\.1\b/g, 'ikki nuqta bir'],
  [/\bShared\b/g, 'Sherd'],
  [/\bshared\b/g, 'sherd'],
  [/\bslice’lar\b/gi, 'slayslar'],
  [/\bslice'lar\b/gi, 'slayslar'],
  [/\bslice’siz\b/gi, 'slayssiz'],
  [/\bslice'siz\b/gi, 'slayssiz'],
  [/\bslice\b/gi, 'slays'],
  [/\bentities\/user\b/gi, 'entitiz/yuzer'],
  [/\bentities\b/gi, 'entitiz'],
  [/\bentity\b/gi, 'entiti'],
  [/\bfeatures\b/g, 'fichers'],
  [/\bfeature\b/g, 'ficher'],
  [/\bwidgets\b/g, 'vijets'],
  [/\bwidget\b/g, 'vijet'],
  [/\bpages\b/g, 'peyjiz'],
  [/\bapp\b/g, 'ep'],
  [/\bapi\b/gi, 'ey-pi-ay'],
  [/\bui\b/gi, 'yu-ay'],
  [/\blib\b/gi, 'lib'],
  [/\bconfig\b/gi, 'konfig'],
  [/\broutes\b/gi, 'routs'],
  [/\btypes\.ts\b/gi, 'tayps nuqta te-es'],
  [/\butils\.ts\b/gi, 'yutils nuqta te-es'],
  [/\bproduct\.ts\b/gi, 'prodakt nuqta te-es'],
  [/\bformat-price\.ts\b/gi, 'format-prays nuqta te-es'],
  [/\bi18n\b/gi, 'ay-eytin-en'],
  [/\bhelpers\b/gi, 'xelpers'],
  [/\butils\b/gi, 'yutils'],
  [/\bcomponents\b/gi, 'komponents'],
  [/\bhooks\b/gi, 'xuks'],
  [/\btypes\b/gi, 'tayps'],
  [/\bbackend\b/gi, 'bekend'],
  [/\blayoutlar\b/gi, 'leyautlar'],
  [/\blayout\b/gi, 'leyaut'],
  [/\burl\b/gi, 'yu-ar-el'],
  [/\benv\b/gi, 'env'],
  [/\bsteiger\b/gi, 'stayger'],
  [/\blinteri\b/gi, 'linteri'],
  [/\blinter\b/gi, 'linter'],
  [/\bFSD\b/g, 'Ef-es-di'],
  [/\bshared\/ui\/layout\b/gi, 'sherd yu-ay leyaut'],
  [/\bapp\/layouts\b/gi, 'ep leyauts'],
  [/\bwidgets\/header\b/gi, 'vijets/xeder'],
  [/\bPageShell\b/gi, 'Peyj Shell'],
  [/\bMainLayout\b/gi, 'Meyn Leyaut'],
  [/\bOutlet\b/gi, 'Autlet'],
  [/\bhero nuqta jpg\b/gi, 'xiro nuqta jey-peg'],
  [/\binvoice-template nuqta pdf\b/gi, 'invoys-templeyt nuqta pe-de-ef'],
  [/\bchevron svg\b/gi, 'shevron es-ve-ge'],
  [/\bpages\/home\/ui\b/gi, 'peyjiz xoum yu-ay'],
  [/\bpages\/checkout\/i18n\b/gi, 'peyjiz chekaut ay-eytin-en'],
  [/\bshared\/i18n\b/gi, 'sherd ay-eytin-en'],
  [/\bshared\/ui\b/gi, 'sherd yu-ay'],
  [/\bapp\/styles\b/gi, 'ep stayls'],
  [/\bapp\/fonts\b/gi, 'ep fonts'],
  [/\bsrc\/assets\b/gi, 'es-er-si assets'],
  [/\bimport heroUrl from '\.\/hero\.jpg'\b/gi, 'import xiro yu-ar-el from xiro nuqta jey-peg'],
  [/\bangular\.json dagi\b/gi, 'angular nuqta jeyson dagi'],
  [/\bangular\.json\b/gi, 'angular nuqta jeyson'],
  [/\bassets glob\b/gi, 'assets glob'],
  [/\besbuild\b/gi, 'es-bild'],
  [/\bfile loader\b/gi, 'fayl loudir'],
  [/\blazy loading\b/gi, 'leyzi louding'],
  [/\blazy\b/gi, 'leyzi'],
  [/\bassets\b/gi, 'assets'],
  [/\bapp\/routes\b/gi, 'ep routs'],
  [/\bshared\/routes\b/gi, 'sherd routs'],
  [/\bshared\/auth\b/gi, 'sherd/os'],
  [/\bentities\/session\b/gi, 'entitiz/seshn'],
  [/\breturnTo\b/gi, 'ritorn-tu'],
  [/\brequireAuth\b/gi, 'rekvayr-os'],
  [/\bloadComponent\b/gi, 'loud komponent'],
  [/\bguardlari\b/gi, 'gardlari'],
  [/\bguardini\b/gi, 'gardini'],
  [/\bguard\b/gi, 'gard'],
  [/\bchunk sifatida\b/gi, 'chank sifatida'],
  [/\bchunk\b/gi, 'chank'],
  [/\beager\b/gi, 'i-gir'],
  [/\bhardcode\b/gi, 'xardkoud'],
  [/\bcreate-vite\b/gi, 'krieyt-vayt'],
  [/\breact-ts\b/gi, 'riakt-te-es'],
  [/\bmain nuqta te-iks\b/gi, 'meyn nuqta te-iks'],
  [/\bApp nuqta te-iks\b/gi, 'Ep nuqta te-iks'],
  [/\bvite konfig\b/gi, 'vayt konfig'],
  [/\bte-es-konfig\b/gi, 'te-es konfig'],
  [/\bsteiger konfig\b/gi, 'stayger konfig'],
  [/\bsegments-by-purpose\b/gi, 'segments bay porpos'],
  [/\bQueryProvider\b/gi, 'Kveri Provayder'],
  [/\bRouterProvider\b/gi, 'Ruter Provayder'],
  [/\bstaleTime\b/gi, 'steyl taym'],
  [/\bProductCard\b/gi, 'Prodakt Kard'],
  [/\bAddToCartButton\b/gi, 'Ed Tu Kart Batn'],
  [/\bpaths ni\b/gi, 'paslarni'],
  [/\bpaths\b/gi, 'paslar'],
  [/\bcreate-vue\b/gi, 'krieyt-vyu'],
  [/\bSingle File Component lar\b/gi, 'Singl Fayl Komponentlar'],
  [/\bSingle File Component\b/gi, 'Singl Fayl Komponent'],
  [/\bApp nuqta vue\b/gi, 'Ep nuqta vyu'],
  [/\bmain nuqta te-es\b/gi, 'meyn nuqta te-es'],
  [/\bVueQueryPlugin\b/gi, 'Vyu Kveri Plagin'],
  [/\bexport default as ProductCard\b/gi, 'eksport defolt ez Prodakt Kard'],
  [/\bactions slotiga\b/gi, 'ekshns slotiga'],
  [/\bcomputed bilan\b/gi, 'kompyutid bilan'],
  [/\bcomputed\b/gi, 'kompyutid'],
  [/\bunplugin auto-import\b/gi, 'anplagin avto import'],
  [/\bunplugin\b/gi, 'anplagin'],
  [/\bauto-import\b/gi, 'avto import'],
  [/\bNext\.js 16\b/gi, 'Nekst jey-es o\'n olti'],
  [/\bNext\.js ning\b/gi, 'Nekst jey-es ning'],
  [/\bNext\.js\b/gi, 'Nekst jey-es'],
  [/\bApp Router\b/gi, 'Ep Ruter'],
  [/\bTurbopack\b/gi, 'Turbopek'],
  [/\bre-export\b/gi, 're-eksport'],
  [/\b_app\b/gi, 'tag chiziq ep'],
  [/\b_pages\b/gi, 'tag chiziq peyjiz'],
  [/\btypo-in-layer-name\b/gi, 'taypo in leyer neym'],
  [/\bproxy nuqta te-es\b/gi, 'proksi nuqta te-es'],
  [/\bpage nuqta te-iks\b/gi, 'peyj nuqta te-iks'],
  [/\bindex nuqta server nuqta te-es\b/gi, 'indeks nuqta server nuqta te-es'],
  [/\bserver-only\b/gi, 'server-onli'],
  [/\bPromise\b/gi, 'Promis'],
  [/\bNuxt 4\b/gi, 'Nakst to\'rt'],
  [/\bNuxt ning\b/gi, 'Nakst ning'],
  [/\bNuxt\b/gi, 'Nakst'],
  [/\bnuxt konfig\b/gi, 'nakst konfig'],
  [/\bNuxtLayout\b/gi, 'Nakst Leyaut'],
  [/\bNuxtPage\b/gi, 'Nakst Peyj'],
  [/\buseAsyncData\b/gi, 'yuz-asink-deyta'],
  [/\buseRoute\b/gi, 'yuz-raut'],
  [/\bxesh-imports\b/gi, 'xesh imports'],
  [/\bcreateError\b/gi, 'krieyt-error'],
  [/\bSSR\b/g, 'Es-es-ar'],
  [/\bAngular 22\b/gi, 'Angular yigirma ikki'],
  [/\bstandalone\b/gi, 'stend-elon'],
  [/\bzoneless\b/gi, 'zoun-les'],
  [/\bNgModule siz\b/gi, 'En-ji-modyulsiz'],
  [/\bNgModule\b/gi, 'En-ji-modyul'],
  [/\bbootstrapApplication\b/gi, 'butstrap aplikeyshn'],
  [/\bapp nuqta konfig\b/gi, 'ep nuqta konfig'],
  [/\bapp routes\b/gi, 'ep routs'],
  [/\bwithComponentInputBinding\b/gi, 'viz komponent input baynding'],
  [/\bhttpResource\b/gi, 'eych-ti-ti-pi resurs'],
  [/\bng-content\b/gi, 'en-ji kontent'],
  [/\besbuild loaderi\b/gi, 'es-bild loudiri'],
  [/\besbuild fayl loaderi\b/gi, 'es-bild fayl loudiri'],
  [/\binyekt\b/gi, 'injekt'],
  [/\binjekt\b/gi, 'injekt'],
  [/\bstorefront\b/gi, 'stor-front'],
  [/\bpekej jeyson dagi\b/gi, 'pekej jeyson dagi'],
  [/\bpekej jeyson\b/gi, 'pekej jeyson'],
  [/\bpackage\.json\b/gi, 'pekej jeyson'],
  [/\bexports\b/gi, 'eksports'],
  [/\bapi-klient\b/gi, 'ey-pi-ay klayent'],
  [/\bvorkspeysis\b/gi, 'vorkspeysis'],
  [/\bworkspaces\b/gi, 'vorkspeysis'],
  [/\bsherd-yutils\b/gi, 'sherd yutils'],
  [/\bshared-utils\b/gi, 'sherd yutils'],
  [/\bwatch rejimida\b/gi, 'voch rejimida'],
  [/\breporter jeyson\b/gi, 'riporter jeyson'],
  [/\bpull requestni\b/gi, 'pul rekvestni'],
  [/\bflat konfig\b/gi, 'flet konfig'],
  [/\blint fsd\b/gi, 'lint ef-es-di'],
  [/\bignore-warnings\b/gi, 'ignor vorningz'],
  [/\bno-restricted-imports\b/gi, 'no-restriktid-imports'],
  [/\bBoundaries\b/gi, 'Baundriz'],
  [/\bboundaries\b/gi, 'baundriz'],
  [/\bregex\b/gi, 'regeks'],
  [/\bresolverni\b/gi, 'rizolverni'],
  [/\bresolver\b/gi, 'rizolver'],
  [/\bNitro\b/gi, 'Naytro'],
  [/\bawait\b/gi, 'eveyt'],
  [/\bRouterView\b/gi, 'Ruter Vyu'],
  [/\bmarkup\b/gi, 'markap'],
  [/\bCSS\b/g, 'Si-Es-Es'],
  [/\bshared\/types\b/gi, 'sherd/tayps'],
  [/\bshared\/lib\/untyped-packages\b/gi, 'sherd lib antaypd-pekijiz'],
  [/\bindex\.ts\b/gi, 'indeks nuqta te-es'],
  [/\bambient\b/gi, 'embient'],
  [/\bd-t-s\b/gi, 'di-ti-es'],
  [/\brun-time\b/gi, 'ran-taym'],
  [/\bZod\b/gi, 'Zod'],
  [/\bprops\b/gi, 'props'],
  [/\bcontext\b/gi, 'kontekst'],
  [/\butility\b/gi, 'yutility'],
  [/\bHttpOnly cookie\b/gi, 'Eych-ti-ti-pi Onli kuki'],
  [/\bHttpOnly\b/gi, 'Eych-ti-ti-pi Onli'],
  [/\bcookie\b/gi, 'kuki'],
  [/\bpages\/sign-in\b/gi, 'peyjiz/sayn-in'],
  [/\bsign-in\b/gi, 'sayn-in'],
  [/\bwidgets\/login-dialog\b/gi, 'vijets/login-dialog'],
  [/\bentities\/session\b/gi, 'entitiz/seshn'],
  [/\bsession\b/gi, 'seshn'],
  [/\baccess token\b/gi, 'akses token'],
  [/\bmiddleware'i\b/gi, 'midlveri'],
  [/\bmiddleware\b/gi, 'midlver'],
  [/\bfinally\b/gi, 'faynalli'],
  [/\blocalStorage'dan\b/gi, 'lokal storejdan'],
  [/\blocalStorage\b/gi, 'lokal storej'],
  [/\buser entity'lari\b/gi, 'yuzer entitilari'],
  [/\brate-product\b/gi, 'reyt-prodakt'],
  [/\bheader\b/gi, 'xeder'],
  [/\bCRUD\b/g, 'krud'],
  [/\bauth\b/gi, 'os'],
  [/\bshared\/api\/endpoints\b/gi, 'sherd ey-pi-ay endpoynts'],
  [/\bshared\/api\/openapi\b/gi, 'sherd ey-pi-ay open ey-pi-ay'],
  [/\bshared\/api\b/gi, 'sherd ey-pi-ay'],
  [/\bclient\.ts\b/gi, 'klient nuqta te-es'],
  [/\bproduct\.ts\b/gi, 'prodakt nuqta te-es'],
  [/\border\.ts\b/gi, 'order nuqta te-es'],
  [/\bauth\.ts\b/gi, 'os nuqta te-es'],
  [/\bOpenAPI\b/gi, 'Open ey-pi-ay'],
  [/\bOTP\b/gi, 'o-te-pe'],
  [/\bDTO\b/gi, 'di-ti-o'],
  [/\bTanStack Query\b/gi, 'Ten-stek kveri'],
  [/\bPinia Colada\b/gi, 'Piniya Kolada'],
  [/\bPinia'ga\b/gi, 'Piniyaga'],
  [/\bPinia\b/gi, 'Piniya'],
  [/\bRedux\b/gi, 'Redaks'],
  [/\bQueryClient\b/gi, 'Kveri Klayent'],
  [/\bquery factory'da\b/gi, 'kveri fektorida'],
  [/\bquery factory'ga\b/gi, 'kveri fektoriga'],
  [/\bquery factory\b/gi, 'kveri fektori'],
  [/\bqueries\b/gi, 'kveriz'],
  [/\bquery\b/gi, 'kveri'],
  [/\bonSuccess\b/gi, 'on sakses'],
  [/\bsetState\b/gi, 'set steyt'],
  [/\binvalidate\b/gi, 'invalideyt'],
  [/\bapp\/providers\b/gi, 'ep provayders'],
  [/\bendpointlarni\b/gi, 'endpoyntlarni'],
  [/\bendpointlar\b/gi, 'endpoyntlar'],
  [/\bendpoints\b/gi, 'endpoynts'],
  [/\bendpoint\b/gi, 'endpoynt'],
  [/\bfetch\b/gi, 'fech'],
  [/\bmapper'lardan\b/gi, 'mepperlardan'],
  [/\bmapper\b/gi, 'mepper'],
  [/\bshared\/auth\b/gi, 'sherd/os'],
  [/\bentities\/user\b/gi, 'entitiz/yuzer'],
  [/\border-item\b/gi, 'order-aytem'],
  [/\bcustomer\b/gi, 'kastomer'],
  [/\bTypeScript\b/gi, 'Taypskript'],
  [/\bDTO\b/gi, 'di-ti-o'],
  [/\bdelivery\b/gi, 'deliveri'],
  [/\blib date\b/gi, 'lib deyt'],
  [/\blib money\b/gi, 'lib mani'],
  [/\bui components\b/gi, 'yu-ay komponents'],
  [/\bcross-import\w*/gi, (m) => m.toLowerCase().replace('cross-import', 'kross-import')],
  [/\bpublic api\b/gi, 'pablik ey-pi-ay'],
  [/\bInversion of Control\b/gi, 'Invershn of Kontrol'],
  [/\brender props\b/gi, 'render props'],
  [/\bcontent projection\b/gi, 'kontent proyeksiyasi'],
  [/\bDependency Injection\b/gi, 'Dependensi Injekshn'],
  [/\bprop drilling\b/gi, 'prop drilling'],
  [/\bevent bus\b/gi, 'event bas'],
  [/\bpub-sub\b/gi, 'pab-sab'],
  [/\bProductCard\b/gi, 'Prodakt Kard'],
  [/\bAddToCart\b/gi, 'Edd tu Kart'],
  [/\bonApplied\b/gi, 'on eplayd'],
  [/\bcallback\b/gi, 'kolbek'],
  [/\bat x\b/gi, 'et-iks'],
  [/\b@x\b/gi, 'et-iks'],
  [/\bcart\b/gi, 'kart'],
  [/\bproduct\b/gi, 'prodakt'],
  [/\bprofile-settings\b/gi, 'profayl-settings'],
  [/\bprofile\b/gi, 'profayl'],
  [/\bstore'larga\b/gi, 'storlarga'],
  [/\bstore'lar\b/gi, 'storlar'],
  [/\bstore\b/gi, 'stor'],
  [/\bInversion of Control\b/gi, 'Invershn of Kontrol'],
  [/\bcode smell\b/gi, 'kod smel'],
  [/\bslot\b/gi, 'slot'],
  [/\bREADME\b/g, 'ridmi']
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
        break; // Rate limit, keyingi kalitga o'tish
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
