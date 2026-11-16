# 03 — Agent nima

[Mundarija](README.md)

## Tushuncha

1-bobda agentni "o'zi qadam tanlaydigan AI" deb atadik. Bu bobda shu gapning ichini ochamiz: agent qanday qismlardan iborat,
bitta vazifa davomida nima sodir bo'ladi va agent oddiy avtomatlashtirilgan jarayondan nimasi bilan farq qiladi.

AE (Effective context engineering) agentning eng qisqa ta'rifini beradi: **LLM o'zi mustaqil ravishda, sikl ichida tool'lardan
foydalanadi** (LLMs autonomously using tools in a loop). Bu ta'rifda uchta qism bor:

| Qism | Nima qiladi | Claude Code'da |
| --- | --- | --- |
| **Model** | O'ylaydi: vazifani tushunadi, keyingi qadamni tanlaydi | Claude modellari (Sonnet, Opus va boshqalar), `/model` bilan almashtiriladi |
| **Tool'lar** | Harakat qiladi: faylni o'qiydi, kodni o'zgartiradi, buyruq ishga tushiradi | O'rnatilgan tool'lar va kengaytmalar (MCP, skill'lar) |
| **Harness** (o'rab turuvchi qatlam) | Model va tool'larni bog'laydi, kontekstni boshqaradi, ruxsatlarni tekshiradi | Claude Code dasturining o'zi |

CC (Glossary) harness'ni shunday ta'riflaydi: til modelini qobiliyatli kod agentiga aylantiradigan tool'lar, kontekst
boshqaruvi va ishga tushirish muhiti. **Claude Code — harness, Claude — uning ichidagi model.** Harness faylga kirish, shell
buyruqlarini bajarish, ruxsatlarni nazorat qilish, xotirani yuklash va harakatlarni bir-biriga ulaydigan siklni beradi.

CC (How Claude Code works) tool'larning ahamiyatini shunday tushuntiradi: tool'larsiz Claude faqat matn bilan javob bera
oladi. Tool'lar bilan esa harakat qila oladi. Har bir tool chaqiruvi natijasi siklga qaytadi va keyingi qarorga ta'sir
qiladi.

### O'rnatilgan tool'lar

CC (How Claude Code works) o'rnatilgan tool'larni besh guruhga bo'ladi:

| Guruh | Agent nima qila oladi |
| --- | --- |
| **Fayl amallari** | Faylni o'qish, kodni tahrirlash, yangi fayl yaratish, nomini o'zgartirish va qayta joylashtirish |
| **Qidiruv** | Fayllarni nom namunasi bo'yicha topish, ichidan muntazam ifoda (regex) bilan qidirish, kod bazasini o'rganish |
| **Bajarish** | Shell buyruqlari, serverni ishga tushirish, testlar, git |
| **Veb** | Internetda qidirish, hujjatni yuklab olish, xato xabarini izlash |
| **Kod tahlili** (code intelligence) | Tahrirdan keyin tur xatolari va ogohlantirishlarni ko'rish, ta'rifga o'tish, murojaatlarni topish (alohida plagin kerak, 16-bob) |

Bulardan tashqari subagent ishga tushirish, sizga savol berish kabi boshqaruv tool'lari ham bor. To'liq ro'yxat — CC
"Tools available to Claude" sahifasida.

### Agentik sikl

CC (How Claude Code works): vazifa berilganda Claude uch bosqichdan o'tadi:

```text
   sizning so'rovingiz
          │
          ▼
  ┌─────────────────┐     ┌─────────────┐     ┌──────────────┐
  │ kontekst yig'ish │ ──▶ │   harakat   │ ──▶ │  tekshirish  │ ──▶ vazifa tayyor
  └─────────────────┘     └─────────────┘     └──────────────┘
          ▲                                          │
          └──────────── tayyor emas — qaytadan ───────┘

  istalgan payt siz to'xtatib, yo'nalishni o'zgartira olasiz
```

1. **Kontekst yig'ish** (gather context) — fayllarni qidirish va o'qish, kodni tushunish.
2. **Harakat** (take action) — o'zgartirish kiritish.
3. **Tekshirish** (verify results) — testlarni ishga tushirib, ish to'g'riligini ko'rish.

Hujjat ta'kidlaydi: bu bosqichlar bir-biriga qo'shilib ketadi va sikl so'rovga moslashadi:

- kod bazasi haqidagi savolga faqat kontekst yig'ish yetishi mumkin;
- xatoni tuzatish uchala bosqichdan bir necha marta o'tadi;
- refaktoring ko'p tekshirishni talab qilishi mumkin.

Claude har bir qadamda nima kerakligini oldingi qadamdan bilganiga qarab hal qiladi. U o'nlab harakatni bir-biriga
ulab, yo'l-yo'lakay yo'nalishini to'g'rilaydi.

**Siz ham siklning qismisiz.** Istalgan payt to'xtatib, boshqa yo'nalish berishingiz, qo'shimcha kontekst qo'shishingiz yoki
boshqa yondashuvni so'rashingiz mumkin (9-bob).

## Amalda

Siklni haqiqiy sessiyada ko'ramiz. Sinov uchun ikkita xatosi bor kichik loyiha:

```js
// narx.js — savatdagi mahsulotlar narxini hisoblaydi
export function jami(savat) {
  let summa = 0
  for (let i = 1; i < savat.length; i++) {
    summa += savat[i].narx * savat[i].soni
  }
  return summa
}

export function chegirma(summa, foiz) {
  return summa - summa * foiz
}
```

```js
// narx.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { jami, chegirma } from './narx.js'

test('jami: hamma mahsulot hisoblanadi', () => {
  const savat = [{ narx: 10000, soni: 2 }, { narx: 5000, soni: 1 }]
  assert.equal(jami(savat), 25000)
})

test('chegirma: 10 foiz', () => {
  assert.equal(chegirma(25000, 10), 22500)
})
```

Claude Code 2.1.325 skript rejimida (`-p`, 33-bob) ishga tushirildi. Shaxsiy sozlamalar sessiyaga aralashmasligi uchun
`--setting-sources project,local` berildi. Fayl tahririga ruxsat berildi (`acceptEdits`, 35-bob), buyruqlardan esa faqat
test buyrug'i ruxsat etildi:

```bash
claude -p "Testlar yiqilyapti. Sababini topib tuzat, keyin testlarni qayta ishga tushirib tekshir." \
  --setting-sources project,local \
  --permission-mode acceptEdits \
  --allowedTools "Bash(npm test*)" "Bash(node --test*)" \
  --output-format stream-json --verbose
```

`--output-format stream-json` har bir tool chaqiruvi va natijasini alohida qator qilib chiqaradi. Quyidagi animatsiya
shu chiqishdan olingan. Buyruq oldidagi `[Bash]` yoki `[Edit]` — agent qaysi tool'ni chaqirganini bildiradi:

<div data-animatsiya="qadamli" data-nom="agent-sikli"></div>

So'rovda qaysi faylni o'qish yoki qaysi buyruqni yozish aytilmagan edi. Agentning o'zi:

1. fayllar ro'yxatini ko'rdi;
2. kodni o'qib, testni ishga tushirdi va haqiqiy xatoni ko'rdi;
3. sababni aytdi: sikl `1` dan boshlanyapti, foiz `100` ga bo'linmayapti;
4. ikkita tahrir qildi;
5. testni qayta ishga tushirib, `pass 2` / `fail 0` ni ko'rdi.

Natija — `git diff`:

```diff
-  for (let i = 1; i < savat.length; i++) {
+  for (let i = 0; i < savat.length; i++) {
...
-  return summa - summa * foiz
+  return summa - summa * foiz / 100
```

Agentning yakuniy xabaridan bir parcha ham diqqatga sazovor:

```text
`chegirma` endi foizni butun son ko'rinishida kutadi (masalan, `10`), test ham shunday ishlatadi.
Agar uni kasr bilan (`0.1`) chaqiradigan boshqa joy bo'lsa, o'sha joyni ham moslash kerak.
Bu loyihada bunday chaqiruv yo'q.
```

Bu yerda agent bir qarorni o'zi qabul qildi: foiz `10` ko'rinishida beriladi, `0.1` emas. Bu qarorni testdan oldi. Haqiqiy
loyihada esa aynan shunday joyni siz tekshirishingiz kerak: qaror loyihaning qolgan qismiga mosmi? AE (Building effective
agents) ham shuni aytadi: yechim tizimning kengroq talablariga mos kelishi uchun inson ko'rib chiqishi muhimligicha qoladi.

## Workflow va agent

AE (Building effective agents, 2024-12-19) ikkita tushunchani ajratadi. Ikkalasini birgalikda **agentik tizimlar**
(agentic systems) deb ataydi:

| | **Workflow** (oldindan yozilgan jarayon) | **Agent** |
| --- | --- | --- |
| Ta'rif | LLM va tool'lar oldindan yozilgan kod yo'llari bo'yicha boshqariladi | LLM o'z jarayonini va tool'lardan foydalanishni o'zi boshqaradi |
| Yo'lni kim tanlaydi | Dasturchi, oldindan | Model, ish davomida |
| Qachon mos | Vazifa aniq, qadamlari doim bir xil | Qadamlar soni va tartibini oldindan aytib bo'lmaydi |

AE'dagi beshta workflow namunasi:

| Namuna | Mazmuni | Qachon |
| --- | --- | --- |
| **Ketma-ket so'rovlar** (prompt chaining) | Vazifa qadamlarga bo'linadi, har qadam oldingisining natijasi ustida ishlaydi | Vazifa aniq, belgilangan qism-vazifalarga bo'linadi |
| **Yo'naltirish** (routing) | Kirish turlanadi va mos maxsus ishlovchiga yuboriladi | Har xil turdagi so'rovlarni alohida hal qilgan yaxshiroq |
| **Parallellash** (parallelization) | Qism-vazifalar bir vaqtda bajariladi yoki bitta vazifa bir necha marta bajarilib, natijalar solishtiriladi | Tezlik kerak yoki bir necha nuqtai nazar ishonchni oshiradi |
| **Boshqaruvchi va ishchilar** (orchestrator-workers) | Markaziy model qism-vazifalarni ishchi modellarga taqsimlaydi | Qanday qism-vazifalar kerakligini oldindan bilib bo'lmaydi |
| **Baholovchi va tuzatuvchi** (evaluator-optimizer) | Bir model yozadi, ikkinchisi sikl ichida baho beradi | Baholash mezoni aniq va fikr-mulohaza natijani o'lchab bo'ladigan darajada yaxshilaydi |

Bu namunalarni keyinroq ko'ramiz: subagentlar (30-bob) va ko'p agentli ish (32-bob) aynan shular ustiga quriladi.

### Agentning kuchi va narxi

AE bo'yicha agent har qadamda **muhitdan haqiqiy natija** (ground truth) oladi: tool natijasi, kod bajarilishi. Shu bilan
o'z ishini baholaydi. Yuqoridagi sessiyada bu `npm test` chiqishi edi. Agent nazorat nuqtalarida (checkpoint) to'xtab,
insondan fikr so'rashi mumkin. Odatda to'xtash shartlari ham bo'ladi, masalan qadamlar soniga chegara.

Mustaqillikning narxi ham bor. AE ogohlantiradi:

- xarajat oshadi;
- **xatolar yig'ilib boradi** (compounding errors): bir qadamdagi xato keyingi qadamlar uchun asos bo'ladi.

Shuning uchun hujjat himoyalangan muhitda (sandbox) keng sinashni va cheklovlar (guardrails) qo'yishni tavsiya qiladi. Bu
masalaga VII qism bag'ishlangan.

### Nega kod — agent uchun qulay soha

AE (Appendix 1) sababini aytadi: koddagi yechimni avtomatik testlar bilan tekshirish mumkin. Agent test natijasini fikr-mulohaza
sifatida ishlatib, qayta-qayta yaxshilay oladi. Yuqoridagi sessiyada xuddi shu bo'ldi. Agentga bunday tekshiruvni berish —
8-bobning mavzusi.

### Eng oddiy yechimdan boshlang

AE'ning asosiy maslahati: **iloji boricha eng oddiy yechimni toping va murakkablikni faqat kerak bo'lganda oshiring.**
Agentik tizimlar ko'pincha yaxshiroq natija uchun kechikish va xarajatni qurbon qiladi, shuning uchun bu kelishuvni
(trade-off) avval o'ylab ko'rish kerak.

Kundalik ishga ko'chirsak:

- bitta qatorli savolga chat yetarli (1-bob);
- takrorlanadigan aniq jarayon uchun skript yoki skill (25-bob);
- yo'li oldindan noma'lum vazifa uchun agent.

AE agent yasashning uchta tamoyilini ham beradi. Bular X qismda, o'z agentimizni yasaganda kerak bo'ladi:

1. agent dizaynini oddiy saqlash;
2. agentning rejalash qadamlarini ko'rinadigan qilish;
3. agent va kompyuter orasidagi interfeysni (ACI — agent-computer interface) tool hujjatlari va sinovlar bilan puxta
   loyihalash.

## Model qaror qiladi, harness majburlaydi

CC (Best practices) agentga beriladigan har bir ko'rsatmani ikki turga bo'ladi:

| | **Model qaror qiladi** (non-deterministic) | **Harness majburlaydi** (deterministic) |
| --- | --- | --- |
| Qanday beriladi | Siz yozasiz, model o'qiydi: so'rov, CLAUDE.md, skill | Siz sozlaysiz, Claude Code bajarishga majbur: hook, taqiq qoidasi (deny rule), boshqariladigan sozlama |
| Kafolat | Yo'q. Model odatda amal qiladi, lekin boshqacha qilishi ham mumkin | Bor. Model nima qaror qilishidan qat'i nazar har safar qo'llanadi |
| Qachon | Ko'p hollarda: model kodni ko'rib, qoida mos keladimi-yo'qmi, o'zi yaxshiroq baholaydi | Biror narsa **har doim** bo'lishi yoki **hech qachon** bo'lmasligi kerak bo'lganda |

Hujjatdagi misollar: "`src/gen/` dagi generatsiya qilingan klientni hech qachon tahrirlama" yoki "yangi fayl yaratilgach,
litsenziya sarlavhasi skriptini doim ishga tushir". Ikkalasini CLAUDE.md'ga yozsangiz, Claude deyarli har doim amal qiladi.
Lekin qanchalik qattiq yozmang, har bir navbatda amal qilish-qilmaslik baribir modelning qarori.

CC maslahati: CLAUDE.md'dagi qatorga urg'u qo'shaverib, model baribir o'tkazib yuborayotgan bo'lsa, bu qator hook bo'lishi
kerak (26-bob). Teskarisi ham to'g'ri: shunchaki didga oid narsa uchun hook yozilgan bo'lsa, uni o'chirib, qarorni modelga
qoldiring.

## Variantlar

| Yondashuv | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Chat (tool'siz) | Tez, arzon, kutilmagan harakat yo'q | Kodni o'zingiz ko'chirasiz va sinaysiz | Savol, tushuntirish, kichik bo'lak |
| Workflow (oldindan yozilgan qadamlar) | Bashorat qilsa bo'ladi, har safar bir xil yo'l | Kutilmagan holatga moslasha olmaydi | Doim bir xil takrorlanadigan jarayon |
| Agent | Yo'lni o'zi topadi, o'zini tekshira oladi | Qimmatroq, sekinroq; xatolar yig'ilishi mumkin; nazorat talab qiladi | Qadamlari oldindan noma'lum, natijasi tekshiriladigan vazifa |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Agentga qaysi faylni o'qish va qaysi buyruqni yozishni birma-bir aytish | CC: buyurmang, topshiring — qaysi faylni o'qish va qaysi buyruqni ishga tushirishni Claude o'zi topadi | Maqsad, kontekst va tekshiruvni bering (6-bob) |
| Tekshirish usulisiz vazifa berish | AE: agent har qadamda muhitdan haqiqiy natija olishi kerak. Busiz u faqat o'z taxminiga tayanadi | Vazifaga test, buyruq yoki kutilgan natijani qo'shing (8-bob) |
| Har ishga agent ishlatish | AE: avval eng oddiy yechim; agent kechikish va xarajat evaziga natija beradi | Savolga chat, takroriy jarayonga skript yoki skill |
| Muhim taqiqni faqat CLAUDE.md'ga yozish | CC: yozilgan ko'rsatmaga amal qilish — modelning qarori, kafolat emas | "Hech qachon" turidagi qoidani hook yoki taqiq qoidasiga aylantiring (26, 35-boblar) |
| Agent tanlagan yechimni ko'rmasdan qabul qilish | AE: yechim tizimning kengroq talablariga mosligini inson tekshirishi kerak | Diff'ni o'qing, agent o'zi qabul qilgan qarorlarga alohida qarang |

## Amaliyot

1. Agent qaysi uch qismdan iborat? Claude Code'da ularning har biri nima?
2. Agentik siklning uch bosqichi qaysilar? Ular har vazifada bir xil takrorlanadimi?
3. Yuqoridagi sessiyada agent qaysi qadamda kontekst yig'di, qaysida harakat qildi, qaysida tekshirdi?
4. Workflow va agentning farqi nima?
5. AE bo'yicha agentning qanday xavfi bor va unga qarshi nima tavsiya qilinadi?
6. Nega kod yozish agent uchun qulay soha?
7. Qachon qoidani CLAUDE.md'ga emas, hook'ga yozish kerak?

<details>
<summary>Javoblar</summary>

1. Model (o'ylaydi, qadam tanlaydi), tool'lar (harakat qiladi) va harness (ularni bog'laydi, kontekst va ruxsatlarni boshqaradi). Claude Code'da model — Claude, tool'lar — fayl, qidiruv, bajarish, veb va kod tahlili tool'lari, harness — Claude Code'ning o'zi.
2. Kontekst yig'ish, harakat, tekshirish. Yo'q: sikl so'rovga moslashadi. Savolga faqat kontekst yig'ish yetishi mumkin, xatoni tuzatish esa uchala bosqichdan bir necha marta o'tadi.
3. Kontekst: `ls` va `cat` + birinchi `npm test` (haqiqiy xatoni ko'rish). Harakat: `narx.js` dagi ikkita tahrir. Tekshirish: ikkinchi `npm test` (`pass 2`, `fail 0`).
4. Workflow'da LLM va tool'lar oldindan yozilgan kod yo'llari bo'yicha ishlaydi. Agentda LLM o'z jarayoni va tool'lardan foydalanishni o'zi boshqaradi.
5. Xarajat oshishi va xatolarning yig'ilib borishi. Himoyalangan muhitda keng sinash va cheklovlar qo'yish tavsiya qilinadi.
6. Yechimni avtomatik testlar bilan tekshirish mumkin. Agent test natijasini fikr-mulohaza sifatida ishlatib, ishini qayta-qayta yaxshilaydi.
7. Biror narsa har doim bo'lishi yoki hech qachon bo'lmasligi kerak bo'lganda, ayniqsa CLAUDE.md'dagi qatorga urg'u qo'shilsa ham model uni o'tkazib yuborayotgan bo'lsa.

</details>

## Rasmiy hujjat

- [CC: How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
- [CC: Glossary — Agentic harness, Agentic loop, Tool](https://code.claude.com/docs/en/glossary)
- [CC: Tools available to Claude](https://code.claude.com/docs/en/tools-reference)
- [CC: Best practices — Deterministic and non-deterministic instructions](https://code.claude.com/docs/en/best-practices#deterministic-and-non-deterministic-instructions)
- [CC: CLI reference](https://code.claude.com/docs/en/cli-reference)
- [AE: Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [AE: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
