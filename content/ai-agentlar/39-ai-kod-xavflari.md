# 39 — AI yozgan koddagi xavflar

[Mundarija](README.md)

> ⚑ Ikki tajriba (`/security-review` va security-guidance plagini) sinov repo'sida o'tkazildi. Claude Security plagini (ko'p agentli
> chuqur skanerlash) va PR'dagi Code Review (Team/Enterprise) sinalmadi — rasmiy hujjat asosida yozilgan.

## Tushuncha

Agent yozgan kod ishlaydi, testdan o'tadi va ishonchli ko'rinadi. Lekin unda xuddi inson kodidagi kabi zaiflik bo'lishi mumkin. Farqi
— tezlik va hajm: agent ko'p kodni tez yozadi, ko'rib chiqish esa o'sha tezlikda ketmaydi.

### Uch xil xavf

| Xavf | OWASP | Agent ishida qanday ko'rinadi |
| --- | --- | --- |
| **Ishonchli ko'rinadigan, lekin noto'g'ri yoki xavfsiz bo'lmagan kod** | LLM09:2025 Misinformation | SQL'ni satr bilan yig'ish, foydalanuvchi matnini `innerHTML` ga qo'yish, ruxsat tekshiruvini unutish |
| **Mavjud bo'lmagan yoki zararli paket** | LLM09 (xayoliy paketlar), LLM03:2025 Supply Chain | Agent o'ylab topgan paket nomi; hujumchi aynan shu nom bilan zararli paket chiqargan bo'lishi mumkin |
| **Ochiq kodga mos taklif** | — (GH best practices) | Taklif mavjud ochiq kodga o'xshashi va litsenziya masalasi |

OWASP LLM09 ta'rifi: LLM **ishonchli ko'rinadigan** yolg'on yoki chalg'ituvchi ma'lumot chiqarganda paydo bo'ladi. Asosiy sabab —
gallyutsinatsiya (hallucination, modelning "o'ylab topishi"). Ta'sirni **ortiqcha ishonch** (overreliance) kuchaytiradi:
foydalanuvchi natijani tekshirmasdan qabul qiladi. OWASP misollaridan ikkitasi to'g'ridan-to'g'ri kodga tegishli:

- **Xavfsiz bo'lmagan kod yaratish:** model xavfsiz bo'lmagan yoki mavjud bo'lmagan kutubxonalarni taklif qiladi.
- **Xayoliy paketlar:** hujumchilar tez-tez taklif qilinadigan, lekin mavjud bo'lmagan kutubxona nomlarini aniqlaydi va shu nomlar
  bilan ommaviy repozitoriylarga zararli paket chiqaradi.

OWASP LLM03 (ta'minot zanjiri, supply chain) bog'liqliklar uchun: zaif komponentlarni skanerlash va yangilash, SBOM (dasturiy
komponentlar ro'yxati, Software Bill of Materials) yuritish, litsenziyalarni kuzatish, tashqaridan kelgan kodni imzo bilan tekshirish.

### Tekshirish odati

GH (Best practices for using Copilot — Check Copilot's work) asosiy qoidalarni beradi:

1. **Avval tushuning.** Taklif qilingan kodni amalga oshirishdan oldin tushuning; tushunmagan joyingizni tushuntirib berishni so'rang.
2. **Diqqat bilan ko'rib chiqing.** Funksionallik va xavfsizlik, shuningdek o'qilishi va qo'llab-quvvatlanishi.
3. **Avtomatik tekshiruvlar.** Testlar, lint, kod skanerlash (code scanning) va IP skanerlash qo'shimcha qatlam beradi.
4. **Ochiq kodga moslik.** Mavjud ochiq kodga o'xshash takliflarni tekshiring. Kerak bo'lmasa, Copilot'da ochiq kodga mos takliflarni
   sozlamalardan o'chirib qo'yish mumkin.

Hujjat aniq yozadi: vosita xato qilishi mumkin, u taklif qilgan kodni har doim tekshiring.

### Claude Code'dagi xavfsizlik qatlamlari

CC (Security guidance plugin, Claude Security plugin) ularni "chuqur himoya" (defense in depth) zinapoyasi sifatida beradi:

| Bosqich | Vosita | Nimani qamraydi |
| --- | --- | --- |
| Sessiya ichida | **security-guidance** plagini | Claude yozayotgan koddagi keng tarqalgan zaifliklar, o'sha sessiyada tuzatiladi |
| So'rov bo'yicha, bir martalik | **`/security-review`** | Joriy branch'ning `origin` standart branch'idan farqi (diff) bo'yicha bir martalik tekshiruv |
| So'rov bo'yicha, chuqur | **Claude Security** plagini (`/claude-security`) | Repo yoki diff'ning ko'p agentli skaneri: mustaqil tekshirilgan topilmalar va patch'lar |
| PR'da | **Code Review** (Team, Enterprise) | To'liq kod bazasi konteksti bilan to'g'rilik va xavfsizlik bo'yicha ko'p agentli review |
| CI'da | Mavjud statik tahlil va bog'liqlik skanerlari | Tilga xos qoidalar, ta'minot zanjiri tekshiruvlari, siyosat — plagin buni qilishga urinmaydi |

Bular bir-birini **almashtirmaydi**. CC aniq yozadi: Claude Security plagini mavjud manba kodi xavfsizlik vositalarining o'rnini
bosmaydi — u statik tahlil, bog'liqliklarni skanerlash va kod review bilan birga ishlatiladi.

#### security-guidance plagini

CC (Security guidance plugin): Claude o'z o'zgarishlarini ishlash davomida zaifliklarga tekshiradi va topilganini o'sha sessiyada
tuzatadi. O'rnatilgandan keyin avtomatik ishlaydi. U butunlay hook'larga (26-bob) qurilgan va uch nuqtada ishlaydi:

| Qachon | Hook | Qanday | Narx |
| --- | --- | --- | --- |
| Har fayl tahririda | `PostToolUse` (`Edit`, `Write`, `NotebookEdit`) | Xavfli chaqiruvlarni satr bo'yicha qidirish: `eval(`, `new Function`, `child_process.exec`, `pickle`, `innerHTML =`, `dangerouslySetInnerHTML`, `.github/workflows/` tahrirlari | Model chaqiruvi yo'q, bepul |
| Har navbat oxirida | `Stop` | Navbatda o'zgargan hamma narsaning git diff'i alohida Claude review'ga yuboriladi (fonda). Avtorizatsiyani chetlab o'tish, IDOR, injection, SSRF, kuchsiz kriptografiya | Qo'shimcha model ishlatilishi |
| Claude `git commit`/`git push` qilganda | `PostToolUse` (`Bash`) | Atrofdagi kodni o'qiydigan chuqurroq agentli review | Qo'shimcha, soatiga 20 tagacha |

Muhim cheklovlar (CC):

- Review'ni kodni yozgan o'sha Claude emas, **toza kontekstli alohida chaqiruv** qiladi.
- **Hech bir qatlam yozish yoki commit'ni to'xtatmaydi.** Topilmalar yozayotgan Claude'ga ko'rsatma bo'lib boradi; review model
  muammoni o'tkazib yuborishi mumkin. Qat'iy majburlash uchun hook (26-bob) yoki CI tekshiruvi kerak.
- Siz o'z terminalingizdan qilgan commit'lar (sessiya ichidagi `!` ham) tekshirilmaydi.
- Loyihaga xos qoidalar: `.claude/claude-security-guidance.md` (model review'lari uchun oddiy tildagi ko'rsatma) va
  `.claude/security-patterns.yaml` (satr bo'yicha qidirish uchun regex qoidalari). Ikkalasi faqat **qo'shadi**, o'rnatilgan
  tekshiruvni o'chira olmaydi.
- Talablar: Python 3.7+ (agentli commit review uchun 3.10+), git repozitoriy.

O'rnatish (terminal sessiyasida):

```text
/plugin install security-guidance@claude-plugins-official
```

Jamoa uchun loyiha sozlamasida (har jamoa a'zosi bir marta `claude plugin install … --scope project` qiladi):

```json
{
  "enabledPlugins": {
    "security-guidance@claude-plugins-official": true
  }
}
```

#### `/security-review` va Claude Security

CC (Commands): `/security-review` joriy branch'dagi o'zgarishlarni zaifliklarga tahlil qiladi — branch va `origin` standart branch'i
orasidagi diff'ni ko'rib, injection, autentifikatsiya muammolari va ma'lumot oshkor bo'lishi kabi xavflarni aniqlaydi. `origin` remote
kerak.

CC (Claude Security plugin): `/claude-security` buyrug'i uchta ish menyusini ochadi — kod bazasini skanerlash, o'zgarishlarni
skanerlash, patch taklif qilish. Natijalar `CLAUDE-SECURITY-<vaqt>/` papkasiga yoziladi: Markdown hisobot, JSONL va GitHub code
scanning uchun SARIF. Topilma hisobotga faqat **mustaqil tekshiruvchi agentlar** tahlil qilganidan keyin tushadi. Patch'lar hech
qachon avtomatik qo'llanmaydi: `git apply` ni o'zingiz qilasiz, har birini alohida PR'da. Hujjat ogohlantiradi: skanerlar
deterministik emas — bir kodni ikki marta skanerlash turli topilmalar berishi mumkin, shuning uchun muntazam ishga tushiring.

## Amalda 1: `/security-review` SQL injection'ni topadi

Sinov repo'si: `node:sqlite` bilan kichik kitoblar bazasi. `main` da faqat ochiq kitoblarni qaytaradigan funksiya bor. `feat/qidiruv`
branch'iga muallif bo'yicha qidiruv qo'shildi — agentlar va odamlar tez-tez yozadigan shakl:

```js
// Muallif bo'yicha qidiruv (faqat ochiq kitoblar)
export function muallifBoyicha(muallif) {
  return db.prepare(`SELECT id, nom, muallif FROM kitob WHERE yashirin = 0 AND muallif = '${muallif}'`).all();
}
```

Oddiy chaqiruvda kod to'g'ri ishlaydi (`'Abdulla Qodiriy'` → 2 kitob). Branch'da `/security-review` headless rejimda ishga tushirildi
(`--allowedTools "Bash(git *)" Read Grep Glob`). Buyruq avval zaifliklarni topish uchun subagent ishga tushirdi, keyin topilmani
**soxta signal emasligini** tekshirish uchun ikkinchi subagent. Yakuniy hisobot (qisqartirilgan):

```text
# Vuln 1: SQL Injection: `db.js:16`

* Severity: High
* Category: `sql_injection`
* Confidence: 8/10
* Description: `muallifBoyicha(muallif)` builds its query with a template literal ...
  Calling `db.prepare()` ... only compiles the string it is given, so it doesn't protect anything here.
* Exploit Scenario:
  * The payload `x' OR yashirin = 1 --` ... returns the hidden books.
  * ... Real author names with an apostrophe (`O'tkir`, `O'Brien`) will also break the query.
* Recommendation: Pass the value as a bound parameter ...
```

Topilmalarni o'zimiz tekshiramiz:

```text
muallifBoyicha("O'tkir Hoshimov")        → XATO: near "tkir": syntax error
muallifBoyicha("x' OR yashirin = 1 --")  → [ 'Ichki hisobot' ]
```

Ikkalasi ham tasdiqlandi. Ikkinchisi xavfsizlik teshigi: yashirin kitob ochildi. Birinchisi esa o'zbek tilida darhol chiqadigan **xato**:
apostrofli ism (`O'tkir`, `G'afur`) so'rovni buzadi. Parametrli so'rov bilan tuzatish:

```js
export function muallifBoyicha(muallif) {
  return db.prepare('SELECT id, nom, muallif FROM kitob WHERE yashirin = 0 AND muallif = ?').all(muallif);
}
```

```text
tuzatilgan("x' OR yashirin = 1 --") → 0 ta
tuzatilgan("O'tkir Hoshimov")       → 0 ta (xato yo'q)
tuzatilgan("Abdulla Qodiriy")       → 2 ta
```

Shuni ham ko'ring: `db.prepare()` ning o'zi himoya qilmaydi. Hisobotda aytilganidek, u faqat berilgan satrni kompilyatsiya qiladi.
"prepare bor — demak xavfsiz" degan taxmin aynan OWASP LLM09 dagi "ishonchli ko'rinadigan" kod.

## Amalda 2: security-guidance plagini ishda

Boshqa sinov repo'siga plagin loyiha doirasida o'rnatildi (`claude plugin install security-guidance@claude-plugins-official --scope
project`). So'rov foydalanuvchi aniq `innerHTML` so'ragan holatni takrorlaydi:

```text
sahifa.js faylini yarat: renderNatijalar(el, kitoblar) funksiyasi kitoblar massividagi har bir {nom, muallif} ni <li> qilib el ichiga
chiqarsin. Qisqa bo'lishi uchun el.innerHTML ga shablon satr bilan yoz. Commit qilma.
```

Agent `Write` qildi. Plagin hook'lari (`--include-hook-events` bilan ko'rinadi):

| Hook | Natija |
| --- | --- |
| `PostToolUse:Write` | `pattern_hits: 1` — agent kontekstiga ogohlantirish qo'shildi |
| `Stop` | `files_reviewed: 1`, `vulns_found: 0`, bitta model chaqiruvi |

Ogohlantirish matni:

```text
⚠️ Security Warning: Setting innerHTML with untrusted content can lead to XSS vulnerabilities. Use textContent for plain text or safe
DOM methods for HTML content. If you need HTML support, consider using an HTML sanitizer library such as DOMPurify.
```

Agent yozgan kod — `innerHTML`, lekin har bir qiymat ekranlangan (escape):

```js
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderNatijalar(el, kitoblar) {
  el.innerHTML = kitoblar
    .map(({ nom, muallif }) => `<li>${esc(nom)} — ${esc(muallif)}</li>`)
    .join('');
}
```

Bu tajriba qatlamlar farqini yaxshi ko'rsatadi:

- **Satr bo'yicha tekshiruv** kontekstni bilmaydi: `innerHTML =` bor — ogohlantiradi, kod xavfsiz bo'lsa ham. Bu arzon va tez, lekin
  soxta signal (false positive) berishi mumkin.
- **Navbat oxiridagi model review** diff'ni o'qib, zaiflik topmadi (`vulns_found: 0`) — ekranlash bor.
- Agent bu safar o'zi ekranladi. Bunga **tayanib bo'lmaydi**: CC ham plagin "to'liq xavfsizlik yechimi emas" deydi.

## Amalda 3: paket haqiqatan bormi?

Agent yangi bog'liqlik taklif qilsa, o'rnatishdan oldin u registrda borligini tekshiring:

```bash
npm view uzbek-lotin-kirill-sinov-xyz name
# npm error 404 Not Found - GET https://registry.npmjs.org/uzbek-lotin-kirill-sinov-xyz - Not found

npm view dompurify name version license
# name = 'dompurify'
# version = '3.4.18'
# license = '(MPL-2.0 OR Apache-2.0)'
```

404 — paket yo'q, agent nomni o'ylab topgan. Lekin "bor" degani "xavfsiz" degani emas: OWASP LLM09 dagi hujum aynan o'ylab topilgan
nomni hujumchi ro'yxatdan o'tkazishiga asoslangan. Paket nomini kutubxonaning rasmiy hujjatidan tekshiring va bog'liqlik qo'shilganda
CI'dagi bog'liqlik skaneri (LLM03) ishlasin.

## Ish tartibi

| Qadam | Nima qilish | Bob |
| --- | --- | --- |
| Yozishdan oldin | CLAUDE.md'da loyiha qoidalari: parametrli so'rovlar, `textContent`, maxfiy ma'lumot log'ga yozilmaydi | 13 |
| Yozish paytida | security-guidance plagini; loyihaga xos qoidalar `.claude/claude-security-guidance.md` da | 29, shu bob |
| Har o'zgarishdan keyin | Testlar, lint, tip tekshiruvi — agent o'zi ishga tushiradi | 8, 20 |
| PR'dan oldin | `/security-review` yoki `/claude-security scan my branch`; diff'ni o'zingiz o'qing | 21, 22 |
| PR'da | Code Review yoki CI'dagi review; inson tasdig'i | 22, 33 |
| CI'da | Statik tahlil, bog'liqlik skaneri, code scanning (SARIF) | 33 |
| Bog'liqlik qo'shilganda | Registrda borligi, rasmiy hujjatdagi nom, litsenziya | shu bob |

## Variantlar

| Vosita | Qachon | Trade-off |
| --- | --- | --- |
| security-guidance plagini | Har kuni, agent kod yozadigan har bir loyihada | Erta va avtomatik; navbat va commit review'lari qo'shimcha model ishlatadi; to'xtatmaydi |
| `/security-review` | PR ochishdan oldin | Bir martalik, tez; `origin` remote kerak; faqat branch diff'i |
| Claude Security plagini | Mavjud kod bazasini yoki katta o'zgarishni chuqur tekshirish | Chuqur, mustaqil tekshirilgan topilmalar va patch'lar; ko'p token va vaqt |
| Code Review | Team/Enterprise jamoa PR'lari | To'liq kontekst; faqat shu rejalarda |
| Statik tahlil va bog'liqlik skanerlari | Har doim, CI'da | Deterministik; mantiqiy xatolarni (avtorizatsiya) kam ko'radi — model review'lari to'ldiradi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| "Testlar o'tdi — demak xavfsiz" | Tajribada oddiy chaqiruv to'g'ri ishladi, injection esa yashirin kitobni ochdi | Xavfsizlik review'i + yomon kiritish bilan test |
| Plagin bor — review shart emas | CC: hech bir qatlam to'xtatmaydi, review model o'tkazib yuborishi mumkin | Qatlamlar + inson review'i |
| Agent taklif qilgan paketni darhol o'rnatish | OWASP LLM09: xayoliy paket nomlari hujum vositasi | Registr, rasmiy hujjat, bog'liqlik skaneri |
| `prepare()`/ORM bor — injection bo'lmaydi | Satr baribir ichida yig'ilgan bo'lsa, himoya yo'q | Parametrli so'rov (`?`) |
| Bitta skanerlash yetarli | CC: skanerlar deterministik emas | Muntazam skanerlash, kerak bo'lsa `high` darajasi |
| Satr bo'yicha ogohlantirishni har doim zaiflik deb bilish | Kontekstni bilmaydi (tajribada kod ekranlangan edi) | Kodni o'qib baholash |

## Amaliyot

1. OWASP LLM09 bo'yicha AI yozgan kodda qanday ikki xavf bor?
2. security-guidance plagini qaysi uch nuqtada ishlaydi va qaysi biri model chaqirmaydi?
3. Nega plagin yetarli emas? Uni qanday qatlamlar to'ldiradi?
4. Tajriba 1 dagi `muallifBoyicha` da qanday ikki muammo bor edi va qanday tuzatildi?
5. Tajriba 2 da satr bo'yicha tekshiruv ogohlantirdi, model review esa zaiflik topmadi. Nega?
6. Agent yangi paket taklif qilsa, nimani tekshirasiz?

<details>
<summary>Javoblar</summary>

1. Xavfsiz bo'lmagan yoki noto'g'ri, lekin ishonchli ko'rinadigan kod; mavjud bo'lmagan (xayoliy) paketlar — hujumchi shu nom bilan zararli paket chiqarishi mumkin.
2. Har fayl tahririda (satr bo'yicha qidirish, model chaqirmaydi, bepul), har navbat oxirida (diff'ning model review'i), Claude commit yoki push qilganda (chuqur agentli review).
3. Hech bir qatlam yozish yoki commit'ni to'xtatmaydi va review model muammoni o'tkazib yuborishi mumkin. To'ldiruvchilar: `/security-review`, Claude Security plagini, PR'dagi Code Review, CI'dagi statik tahlil va bog'liqlik skanerlari, hook, inson review'i.
4. SQL injection (`x' OR yashirin = 1 --` yashirin kitobni ochdi) va apostrofli ism (`O'tkir`) bilan sintaksis xatosi. Qiymatni satrga qo'shish o'rniga parametr (`?`) sifatida berish ikkalasini ham tuzatdi.
5. Satr bo'yicha tekshiruv kontekstni bilmaydi: `innerHTML =` ni ko'rib ogohlantiradi. Model review diff'ni o'qib, qiymatlar ekranlanganini ko'rdi.
6. Registrda borligi (`npm view`), nom kutubxonaning rasmiy hujjatidagiga mosligi, litsenziya; CI'da bog'liqlik skaneri. Registrda borligi xavfsizlikni isbotlamaydi.

</details>

## Rasmiy hujjat

- [CC: Catch security issues as Claude writes code (security-guidance plugin)](https://code.claude.com/docs/en/security-guidance)
- [CC: Scan your codebase for vulnerabilities (Claude Security plugin)](https://code.claude.com/docs/en/claude-security)
- [CC: Commands — /security-review, /code-review](https://code.claude.com/docs/en/commands)
- [GH: Best practices for using GitHub Copilot — Check Copilot's work](https://docs.github.com/en/copilot/get-started/best-practices)
- [OW: LLM09:2025 Misinformation](https://genai.owasp.org/llmrisk/llm092025-misinformation/)
- [OW: LLM03:2025 Supply Chain](https://genai.owasp.org/llmrisk/llm032025-supply-chain/)
- [OW: Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/)
