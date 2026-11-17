# 41 — Token va xarajatni boshqarish

[Mundarija](README.md)

## Tushuncha

CC (Manage costs): Claude Code API **token** sarfi bo'yicha hisoblanadi. Token — model matnni bo'lib o'qiydigan kichik bo'lak (2-bob).
Obunada (Pro, Max, Ultra, Team, Enterprise) to'lov oylik, lekin rejaning limitini ham aynan tokenlar sarflaydi. Shuning uchun xarajatni
tushunish ikkala holatda ham kerak.

### Xarajat nimadan iborat

Har so'rovda to'rt xil token bor (`/usage` va `-p` natijasidagi `usage` maydonlari):

| Token turi | Nima | Narx (Opus 5.5, 1M token) |
| --- | --- | --- |
| Kirish (input) | Keshda bo'lmagan yangi matn | $4 |
| Keshga yozish (cache write) | Keyingi so'rovlar uchun keshga saqlangan matn | $5 (5 daqiqa) / $8 (1 soat) |
| Keshdan o'qish (cache read) | Keshdan qayta ishlatilgan matn | $0.20 |
| Chiqish (output) | Model yozgan javob, tool chaqiruvlari **va fikrlash** | $20 |

Narxlar — platform.claude.com pricing (2026-11-17). Keshdan o'qish oddiy kirishdan 20 baravar arzon, chiqish esa eng qimmati.

### Model hech narsani eslab qolmaydi

CC (Prompt caching): har xabarda Claude Code yangi API so'rovi yuboradi. Model so'rovlar orasida hech narsani eslamaydi, shuning uchun
Claude Code **butun kontekstni** qayta yuboradi: tizim ko'rsatmasi, loyiha konteksti, oldingi barcha xabarlar va tool natijalari, yangi
xabaringiz. Har safar agent tool ishlatsa — yana bir so'rov.

Buni arzon qiladigan narsa — **prompt kesh** (prompt caching). API so'rov boshini (prefiks) yaqinda qayta ishlangan matn bilan
solishtiradi va mos qismini keshdan o'qiydi. Moslik **aniq** bo'lishi kerak: prefiksning biror joyi o'zgarsa, undan keyingi hamma narsa
qayta hisoblanadi. Claude Code so'rovni kam o'zgaradigan qismlar oldinda turadigan qilib tartiblaydi:

| Qatlam | Mazmun | Qachon o'zgaradi |
| --- | --- | --- |
| Tizim ko'rsatmasi | Asosiy ko'rsatmalar, tool ta'riflari | Yuklangan tool'lar to'plami o'zgarsa |
| Loyiha konteksti | CLAUDE.md, auto memory, qoidalar | Sessiya boshida, `/clear` yoki `/compact` dan keyin |
| Suhbat | Xabarlar, javoblar, tool natijalari | Har navbatda |

### Keshni nima buzadi

CC (Prompt caching) — keyingi so'rov keshni qisman yoki to'liq yo'qotadigan amallar:

| Amal | Nega |
| --- | --- |
| Modelni almashtirish (`/model`, `opusplan` ning reja rejimiga kirish-chiqishi, boshqa model ko'rsatilgan skill) | Har modelning o'z keshi bor |
| Effort'ni o'zgartirish | Ko'p modellarda har darajaning o'z keshi bor. Obuna yoki API kalit bilan Fable 5.1+, Opus 5.5, Sonnet 5.5, Haiku 5.5 da kesh saqlanadi |
| Fast mode'ni yoqish yoki o'chirish | Fast mode va oddiy tezlikning keshi alohida |
| MCP server ulash yoki olib tashlash, plaginni yoqish/o'chirish | Tool ta'riflari o'zgaradi |
| Tool'ni butunlay taqiqlash | Tool ro'yxati o'zgaradi |
| Kompaktlash (`/compact`) | Tarix qisqa xulosaga almashadi — ataylab |
| Claude Code'ni yangilash | Tizim ko'rsatmasi o'zgarishi mumkin |

Keshni **saqlaydigan** amallar: repo fayllarini tahrirlash, sessiya o'rtasida CLAUDE.md'ni tahrirlash (`/clear`, `/compact` yoki qayta ishga
tushirishgacha eski nusxa ishlaydi), ruxsat rejimini o'zgartirish, skill va buyruqlarni chaqirish, `/rewind`.

CC maslahati: model va effort'ni sessiya boshida tanlang, `/compact` ni vazifalar orasidagi tabiiy tanaffusga qoldiring.

### Kesh qancha yashaydi

Kesh faolsizlikdan keyin muddati tugaydi (TTL, time to live). Ikki variant: 5 daqiqa va 1 soat (1 soatlik keshga yozish qimmatroq).
Claude Code tanlovi (CC, Prompt caching):

| So'rovlar | Obuna, reja limiti ichida | Qo'shimcha kreditlar, API kalit, bulut provayderi |
| --- | --- | --- |
| Asosiy suhbat (`-p` ham) | 1 soat | 5 daqiqa |
| Qolganlari (subagentlar, workflow'lar, kompaktlash) | 5 daqiqa | 5 daqiqa |

Shundan kelib chiqadi: uzoq tanaffusdan keyingi birinchi xabar keshni topmaydi va butun kontekstni qayta ishlaydi. O'zingiz tanlash:
`promptCacheTtl` sozlamasi (`5m` yoki `1h`).

### Uzun sessiya nega qimmatlashadi

CC (Costs — Why usage climbs in a long session) sabablari:

- **Uzun kontekst.** Har so'rov butun suhbatni olib yuradi. Kun bo'yi ochiq sessiyada bir qatorli savol ham butun suhbat uchun (kesh
  narxida) sarf qiladi.
- **Kesh muddati tugashi.** Tanaffusdan keyingi birinchi xabar.
- **Jadval bo'yicha vazifalar** (`/loop`) — sessiya bo'sh tursa ham har safar butun kontekst bilan.
- **Subagentlar va workflow'lar** — har biri o'z so'rovlarini yuboradi.
- **Kompaktlash** — `/compact` xulosa qilinadigan suhbatni o'qiydi, katta kontekstda o'zi ham katta so'rov. Davomiylik kerak bo'lmasa,
  `/clear` hech narsa turmaydi.

### Kuzatish

| Vosita | Nima ko'rsatadi |
| --- | --- |
| `/usage` | Sessiya: token va taxminiy narx (ro'yxat narxida), `Prompt cache (main)` qatori — keshdan ulush, o'tkazib yuborishlar, kesh iliqmi. Obunada: reja limitlari, skill/subagent/plagin/MCP bo'yicha ulush va tavsiyalar (`f` — tuzatish) |
| `/context` | Kontekst nimalar bilan to'lgan |
| Status qatori | Kontekst va kesh ko'rsatkichlarini doimiy ko'rsatish |
| `-p --output-format json` | `total_cost_usd`, `usage`, `modelUsage` (33-bob) |

CC: `/usage` dagi dollar — **taxmin**; obunachilar uchun billing ma'nosiga ega emas, haqiqiy hisob uchun Console yoki hisob sahifasi.

## Amalda: bir xil savol — to'rt xil narx

Sinov repo'sida 3 000 qatorli `jurnal.log` (182 KB) bor: unda 210 ta `ERROR`. To'rt qadam, model — Opus 5.5 (obuna, 1 soatlik kesh):

| Qadam | So'rov | Kesh yozish | Kesh o'qish | Chiqish | Narx |
| --- | --- | --- | --- | --- | --- |
| A1 | "jurnal.log ni Read bilan to'liq o'qib, nechta ERROR borligini ayt" | 133 320 | 73 380 | 3 222 | $1.146 |
| A2 | Shu sessiyada (`--resume`): "eng ko'p uchragan xato turi?" | 2 510 | 145 268 | 3 170 | $0.113 |
| A3 | Shu sessiyada, lekin `--model sonnet`: "ikkinchi o'rindagi tur?" | 134 866 | 11 948 | 597 | $0.547 |
| B | Yangi sessiya: "faylni o'qima, faqat grep, awk, sort, uniq ishlat" | 7 726 | 52 822 | 669 | $0.086 |

Narx — `-p` natijasidagi `total_cost_usd` (ro'yxat narxida taxmin; `--resume` da u yig'ma bo'lgani uchun har qadam farqi olindi).
Javoblar to'rttalasida to'g'ri: 210 ta, eng ko'pi `DB_TIMEOUT` (84), keyin `PAYMENT_DECLINED` (46).

Nimani ko'ramiz:

1. **Katta faylni kontekstga o'qish qimmat.** A1 da agent faylni 6 bo'lakda o'qidi; 133 ming token keshga yozildi. B da xuddi shu
   javob 13 baravar arzon: hisoblashni `grep`/`awk` qildi, kontekstga faqat natija tushdi. Bu CC'dagi "chiqishni oldindan qayta ishlash"
   tavsiyasining amaldagi ko'rinishi.
2. **Kesh iliq bo'lsa, davom ettirish arzon.** A2 da 145 ming token keshdan o'qildi — atigi ~$0.03; qadam narxining asosiy qismi chiqish
   tokenlari. Kesh bo'lmaganda o'sha 145 ming token oddiy kirish narxida ($4/1M) ~$0.58 turardi.
3. **Model almashtirish keshni nolga tushiradi.** A3 — bitta qisqa javob, lekin Sonnet uchun butun kontekst (135 ming token) keshga
   qayta yozildi va qadam A2 dan 5 baravar qimmat bo'ldi, garchi Sonnet Opus'dan arzon bo'lsa ham.
4. **Qo'lda sanash ishonchsiz.** A2 javobida agent o'zi tan oldi: "Avvalgi javobimda bitta xato bor edi: 'besh xil kod' deb yozgandim,
   aslida xato turlari to'rtta." `grep | sort | uniq -c` deterministik — sanashni dasturga bering.

## Tejash usullari

CC (Costs — Reduce token usage) va yuqoridagi tajriba asosida:

| Usul | Qanday | Bob |
| --- | --- | --- |
| Vazifalar orasida `/clear` | Eski kontekst har keyingi xabarda token sarflaydi. Oldin `/rename`, keyin `/resume` bilan qaytish mumkin | 9, 15 |
| `/compact` ni tanaffusda, ko'rsatma bilan | `/compact Focus on code samples and API usage`; CLAUDE.md'da "Compact instructions" bo'limi | 15 |
| Aniq so'rov | "Kodni yaxshila" keng skanerlashga olib keladi; "auth.ts dagi login funksiyasiga kiritishni tekshirish qo'sh" — kam fayl o'qish | 6 |
| Katta chiqishni qisqartirish | Agentga `grep`/`tail` ishlatishni ayting yoki hook bilan chiqishni kesing (masalan, test chiqishining oxirgi 100 qatori) | 26 |
| CLAUDE.md'ni ixcham saqlash | Maxsus jarayonlarni skill'larga ko'chirish — ular faqat chaqirilganda yuklanadi. CC: CLAUDE.md 200 qatordan kam | 13, 25 |
| MCP yukini kamaytirish | Ishlatilmaydigan serverlarni `/mcp` da o'chirish; mavjud bo'lsa CLI (`gh`, `aws`) MCP'dan tejamkor | 27 |
| Kod intellekti plaginlari | Tipli tillarda "definition'ga o'tish" grep + ko'p fayl o'qishni almashtiradi | 29 |
| Model va effort | Oddiy ishga arzonroq model yoki past effort; oddiy subagentga `model: haiku` | 40 |
| Ko'p chiqishli ishni subagentga | Test, log, hujjat o'qish subagent kontekstida qoladi, asosiyga xulosa qaytadi | 30 |
| Reja rejimi va erta to'xtatish | Noto'g'ri yo'ldan qaytarish qimmat; Esc, `/rewind` | 7, 9 |
| Model/effort'ni sessiya o'rtasida almashtirmaslik | Kesh qayta quriladi (tajriba A3) | shu bob |

Fon sarfi ham bor: sessiya xulosasi (recap), bo'sh turgandagi kompaktlash va keyingi so'rov takliflari (prompt suggestions) — ular ham
token ishlatadi; har birini sozlamadan o'chirish mumkin (CC, Costs — Background token usage).

## Variantlar

| Holat | Tanlov | Trade-off |
| --- | --- | --- |
| Yangi, bog'liq bo'lmagan vazifa | `/clear` | Bepul; oldingi kontekst yo'qoladi |
| Shu vazifa davom etadi, kontekst to'lgan | `/compact` (tanaffusda) | Davomiylik saqlanadi; o'zi katta so'rov, tafsilotlar xulosada yo'qolishi mumkin |
| Noto'g'ri yo'ldan qaytish | `/rewind` | Keshdagi prefiksga qaytadi — kompaktlashdan arzon |
| Uzun tanaffusdan keyin | Yangi sessiya yoki qisqa kontekst | Kesh baribir sovigan |
| Katta ma'lumotdan bitta raqam kerak | Agentga skript/grep ishlatishni ayting | Deterministik va arzon; faqat aniq so'rovga javob |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Bir sessiyada kun bo'yi turli vazifalar | Har xabar butun tarixni olib yuradi | Vazifalar orasida `/clear` |
| Katta log'ni to'liq o'qitish | Tajribada 13 baravar qimmat va qo'lda sanash xatosi | `grep`, `awk`, hook bilan qisqartirish |
| Sessiya o'rtasida model almashtirib turish | Kesh har safar qayta quriladi | Modelni boshida tanlash; boshqa model uchun subagent |
| `/compact` ni avtomatik kompaktlashga qoldirish | Vazifa o'rtasida, tasodifiy paytda katta so'rov | Tabiiy tanaffusda o'zingiz |
| CLAUDE.md'ga har jarayonni yozish | Har sessiyada har xabarda yuklanadi | Jarayonlarni skill'larga |
| `/usage` dagi dollarni hisob deb bilish | CC: taxmin, obunada billing emas | Hisob sahifasi, Console |

## Amaliyot

1. Nega sessiya uzaygan sari har xabar qimmatlashadi?
2. Prompt kesh qanday ishlaydi va nima uchun "aniq moslik" muhim?
3. Keshni buzadigan uchta amalni ayting.
4. Tajribada A1 va B qadamlari nimasi bilan farq qildi va nega B arzon?
5. Nega A3 (Sonnet) A2 (Opus) dan qimmatroq chiqdi?
6. `/clear`, `/compact` va `/rewind` ni qachon ishlatasiz?

<details>
<summary>Javoblar</summary>

1. Model hech narsani eslamaydi: har so'rovda butun suhbat qayta yuboriladi, har tool ishlatishda yana bir so'rov. Kontekst o'sgani sari har so'rovdagi token ko'payadi.
2. API so'rov boshini (prefiks) yaqinda qayta ishlangan matn bilan solishtiradi va mos qismni keshdan arzonroq narxda o'qiydi. Moslik aniq: prefiksdagi har qanday o'zgarish undan keyingi hamma narsani qayta hisoblatadi.
3. Masalan: modelni almashtirish, MCP server ulash/olib tashlash, `/compact`, plaginni yoqish/o'chirish, Claude Code'ni yangilash.
4. A1 da agent butun faylni kontekstga o'qidi (133 ming token keshga yozildi, $1.15). B da `grep`/`awk` hisobladi va kontekstga faqat natija tushdi ($0.09) — 13 baravar arzon.
5. Har modelning o'z keshi bor: Sonnet'ga o'tganda butun kontekst (135 ming token) keshga qayta yozildi. A2 da esa kontekst Opus keshidan arzon narxda o'qildi.
6. `/clear` — yangi, bog'liq bo'lmagan vazifa (bepul). `/compact` — shu vazifa davom etadi, kontekst to'lgan (tanaffusda). `/rewind` — noto'g'ri yo'ldan oldingi nuqtaga qaytish (keshdagi prefiksga qaytadi).

</details>

## Rasmiy hujjat

- [CC: Manage costs effectively](https://code.claude.com/docs/en/costs)
- [CC: How Claude Code uses prompt caching](https://code.claude.com/docs/en/prompt-caching)
- [Claude Platform: Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
