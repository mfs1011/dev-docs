# 48 — Loyihani boshlash

[Mundarija](README.md)

> XI qism — bitta kichik ilova qo'llanmadagi usullar bilan noldan production'gacha. Har bobdagi sessiyalar haqiqiy (Claude Code
> 2.1.325, standart model Opus 5.5), kod ochiq sinov repozitoriysida.

## Tushuncha

Oldingi boblarda har usul alohida ko'rildi. Endi ular birga ishlaydi. Ilova — **bo'lib to'lash kalkulyatori**: summa va oylar sonini
olib, oylik to'lovlarni qaytaradigan API va oddiy veb-sahifa. 40-bobdagi `bolibTolash` funksiyasi uning yuragi bo'ladi, lekin bu safar
hammasi bo'sh papkadan boshlanadi.

Bo'sh repo — agent uchun eng qiyin holat: o'qiydigan kod yo'q, demak konvensiyalarni ham, qarorlarni ham topa olmaydi. CC (Best
practices): agent koddan **topa olmaydigan** narsani ayting — jamoa qarori, deploy jarayoni, kerakli muhit o'zgaruvchisi. Bo'sh repo'da
bularning hammasi shu toifaga kiradi.

### Uch qadam

| Qadam | Nima | Asos | Bob |
| --- | --- | --- | --- |
| 1. Talablar | Nima qurilishi, nimadan foydalanish mumkin, qayerga chiqadi | CC: aniq so'rov — fayl, belgi, "tayyor" nimaligi | 6 |
| 2. Reja va savollar | Reja rejimida tuzilma, endpoint'lar, chekka holatlar, testlar; noaniq joylar bo'yicha savollar | CC: "Brainstorm with Claude first" — agentga sizdan intervyu olishni so'rang | 7 |
| 3. CLAUDE.md va skelet | Qarorlarni faylga yozish, minimal tuzilma, birinchi commit | CC: CLAUDE.md'da faqat koddan ko'rinmaydigan narsa | 13 |

CC (Best practices — Brainstorm with Claude first): nima xohlashingizni aniq bilmasangiz, hammasini oldindan o'ylab chiqish shart emas —
agentdan sizdan **intervyu olishni** so'rang. Agent hal qilinmagan qismlar bo'yicha savollar beradi va javoblar spetsifikatsiyaga
aylanguncha so'raydi.

## Amalda: bo'sh papkadan reja

```bash
mkdir kalkulyator && cd kalkulyator && git init -b main
```

So'rov reja rejimida (`--permission-mode plan`; interaktiv sessiyada — `Shift+Tab`):

```text
Bo'sh repo. Bo'lib to'lash kalkulyatori qurmoqchiman:
- Node.js 26, tashqi bog'liqliksiz (faqat node: modullari).
- HTTP API: summa (so'm, butun son) va oylar sonini olib, oylik to'lovlar ro'yxatini qaytaradi. To'lovlar yig'indisi summaga aynan teng,
  oylar orasidagi farq 1 so'mdan oshmaydi. Noto'g'ri kiritishda 400 va tushunarli xato.
- Oddiy veb-sahifa: forma va natija jadvali, JavaScript bilan API'ga so'rov.
- Testlar node:test bilan, `npm test`.
- Keyin sinov serveriga systemd + Nginx orqasida chiqariladi, port PORT muhit o'zgaruvchisidan.
Hozircha kod yozma. Avval reja tuz: fayl tuzilmasi, endpoint'lar va javob formatlari, chekka holatlar, testlar ro'yxati, bosqichlar.
Menga noaniq joylar bo'yicha savollaring bo'lsa, rejaning oxirida yoz.
```

So'rovda nima bor va nima yo'qligiga e'tibor bering: **cheklovlar** (Node 26, bog'liqliksiz), **o'lchanadigan talab** (yig'indi aynan
teng, farq ≤ 1), **tekshiruv** (`npm test`), **qayerga chiqishi** (systemd + Nginx). Fayl nomlari, endpoint yo'li, xato formati —
agentga qoldirildi.

Agent 3 navbatda ($0.31) reja qaytardi. Fayl yaratmadi — reja rejimi. Qisqartirilgan:

```text
## Algoritm
base = floor(summa / oylar), qoldiq = summa % oylar. Birinchi qoldiq ta oyga base + 1, qolgan oylarga base tushadi. ...

## Fayl tuzilmasi
- src/installments.js — hisob-kitob funksiyasi, faqat natija qaytaradi.
- src/validate.js — kiritilgan ma'lumotni tekshiradi.
- src/app.js — so'rovlarni yo'naltiradi, JSON'ni o'qiydi va statik fayllarni beradi.
- src/config.js, src/server.js — PORT/HOST, ishga tushirish va SIGTERM'da to'g'ri yopish.
- public/ — index.html, app.js, style.css.  test/ — 4 ta test fayli.  deploy/ — kalkulyator.service va nginx.conf.

## Endpoint'lar
- POST /api/installments — {"amount":1000,"months":3} → {amount, months, payments:[{month:1, amount:334}, …]}
- Xato: {error:{code, message, details:[{field, message}]}}; 400, 413 (1 KB dan katta), 415, 405, 404.
- GET /healthz.  Statik fayllar faqat ruxsat etilgan ro'yxat orqali (../ bilan chiqib bo'lmaydi).

## Chekka holatlar
- Rad etiladi: maydon yo'q, null, satr ("1000"), bool, kasr, manfiy, 0, 1e400 (Infinity), obyekt bo'lmagan body.
- Taklif: oylar ≤ 120, summa ≤ 10¹⁵; summa oylar sonidan kam bo'lsa 400.
- HOST sukut bo'yicha 127.0.0.1 — ilovaga faqat Nginx orqali kiriladi.

## Testlar
- Aniq misollar (1000/3, 900/3, 5/5, 7/1, juda katta summa) va ~1000 ta tasodifiy juftlikda doim bajariladigan shartlar.
- Validatsiyaning har xato holati va chegaralar; API testlari port 0 da; ../ urinishlari.

Serverga o'zim chiqarmayman: buning uchun alohida tasdiq kerak.

## Savollar
1. Ortiqcha 1 so'm birinchi oylarga tushsinmi yoki oxirgi oylargami?
2. Summa oylar sonidan kam bo'lsa (masalan, 2 so'm / 3 oy), 400 qaytaraymi yoki 0 so'mlik to'lovlarga ruxsat beraymi?
3. Chegaralar ma'qulmi: oylar ≤ 120, summa ≤ 10¹⁵?
4. Xato xabarlari faqat o'zbek tilida (lotin) bo'ladimi?
5. API'da "1000" kabi satr 400 bersinmi? Formada "1 000 000" kabi bo'shliqli kiritishni sahifadagi JavaScript tozalab yuborsinmi?
6. Javobda to'lov sanalari, foiz yoki ustama kerak emasligini to'g'ri tushundimmi?
7. Statik fayllarni Node bersinmi yoki Nginx to'g'ridan-to'g'ri bersinmi?
8. Server haqida: Node 26 qayerga o'rnatilgan? Ilova qaysi yo'lda turadi? Domen va HTTPS kerakmi? Kod serverga qanday yetkaziladi?
9. Har bosqichdan keyin commit qilaymi?
```

Bu rejaning qiymati — **savollarda**. Har biri — koddan topib bo'lmaydigan qaror. 1-savol 43-bobdagi Learning uslubi `Insight`ida
aytilgan biznes qarorining o'zi; 2-savol 40-bobda turli sozlamalar turlicha hal qilgan chekka holat. Agar ular so'ralmaganda, agent
o'zi tanlardi va siz farqni review'da (yoki production'da) bilardingiz.

Yana bir narsa: reja so'rovdan **kengroq**. 413 (katta body), 415 (noto'g'ri Content-Type), `../` bilan fayllarga chiqish, `1e400` —
bularni so'rovda aytmagan edik. Bu reja bosqichida arzon: kerak bo'lmasa, bir qator bilan olib tashlanadi.

## Javoblar, CLAUDE.md va birinchi commit

Shu sessiyani davom ettirib (`--resume`), javoblar va birinchi bosqich:

```text
Javoblar:
1. Ortiqcha so'm birinchi oylarga.
2. Summa oylar sonidan kam bo'lsa — 400.
3. Chegaralar ma'qul.
4. Xato xabarlari o'zbekcha (lotin).
5. API'da satr — 400. Forma bo'shliqli kiritishni tozalab yuborsin.
6. To'g'ri: sana, foiz, ustama yo'q.
7. Statik fayllarni Node bersin.
8. Server keyinroq, alohida bosqichda hal qilamiz; hozir deploy fayllarini yozma.
9. Ha, har bosqichdan keyin commit (push qilma).

Endi faqat 1-bosqich: loyiha skeleti va CLAUDE.md. CLAUDE.md qisqa bo'lsin: faqat koddan ko'rinmaydigan narsalar
(buyruqlar, qarorlar, chegaralar, qoidalar). Keyin commit qil va to'xta.
```

Ruxsat: `--permission-mode acceptEdits --allowedTools "Bash(git *)" "Bash(npm *)" "Bash(node *)"`. Natija — 8 navbat, bitta commit:

```text
6eb2b07 Loyiha skeleti va CLAUDE.md
.gitignore
CLAUDE.md
package.json
```

Agent yozgan `CLAUDE.md`:

```markdown
# CLAUDE.md

## Buyruqlar
- `npm test` — barcha testlar (`node --test`, `test/**/*.test.js`).
- `PORT=3000 npm start` — serverni ishga tushirish (4-bosqichdan keyin).

## Qat'iy cheklovlar
- Node.js ≥ 26, ES modullar. **Tashqi bog'liqliklar yo'q** — faqat `node:` modullari; `npm install <paket>` qilinmaydi.
- Testlar faqat `node:test` + `node:assert/strict`.

## Biznes qoidalari (kelishilgan)
- Summa — so'm, butun son. Bo'lishda ortiqcha so'mlar **birinchi oylarga** +1 dan: 1000/3 → 334, 333, 333.
- To'lovlar yig'indisi summaga aynan teng, oylar orasidagi farq ≤ 1 so'm. Float ishlatilmaydi.
- Chegaralar: `1 ≤ months ≤ 120`, `amount ≤ 10^15`, `amount ≥ months` (aks holda 400).
- Sana, foiz, ustama yo'q.

## API qoidalari
- `POST /api/installments`, body `{"amount": number, "months": number}`. Satr (`"1000"`) → 400; tozalash faqat frontendda
  (bo'shliqli "1 000 000").
- Xato formati: `{"error": {"code", "message", "details": [{"field", "message"}]}}`. Xabarlar **o'zbekcha (lotin)**.
- Statik fayllarni Node beradi (`public/`), faqat oq ro'yxat orqali.
- Server `PORT` muhit o'zgaruvchisidan, `HOST` standart `127.0.0.1` (Nginx orqasida).

## Ish tartibi
- Ish bosqichma-bosqich; har bosqich oxirida commit. **Push qilinmaydi.**
- Deploy (systemd, Nginx) — keyinroq alohida bosqich; hozircha deploy fayllari yozilmaydi.
```

CC'ning CLAUDE.md mezoniga solishtiramiz:

| Bo'lim | Koddan topsa bo'ladimi? | Baho |
| --- | --- | --- |
| Buyruqlar | `package.json` dan qisman, lekin tekshirish buyrug'i bir qarashda kerak | CC: aniq test buyruqlari — CLAUDE.md'ga |
| "Tashqi bog'liqliklar yo'q" | Yo'q — bu qaror, kod uni faqat "hozircha" ko'rsatadi | To'g'ri |
| Biznes qoidalari, chegaralar | Yo'q — intervyudagi javoblar | Aynan CLAUDE.md uchun |
| "Push qilinmaydi" | — | CC: istisnosiz qoida CLAUDE.md'da "ko'pincha" ishlaydi; kafolat uchun `Bash(git push *)` deny (35-bob) |
| `npm start` "4-bosqichdan keyin" | — | Vaqtinchalik eslatma; 4-bosqichda qatorni yangilash kerak |

Fayl qisqa (≈ 25 qator) va deyarli hammasi koddan ko'rinmaydigan qarorlar. Bitta tuzatish — "Push qilinmaydi" ni ruxsat qoidasiga
aylantirish, chunki u istisnosiz qoida:

```json
// .claude/settings.json
{ "permissions": { "deny": ["Bash(git push *)"] } }
```

## Narx

| Qadam | Navbatlar | Narx (ro'yxat narxida taxmin) |
| --- | --- | --- |
| Reja va savollar | 3 | $0.31 |
| Javoblar, CLAUDE.md, skelet, commit | 8 | $0.17 |

Eng qimmat qism — reja: agent bo'sh repo'ni o'rganib, butun ilovani o'ylab chiqdi. Bu "arzon" xato: keyingi bosqichlarda noto'g'ri
yo'ldan qaytish (CC: reja rejimi qayta ishlashning oldini oladi) ancha qimmatga tushadi.

## Variantlar

| Holat | Boshlash usuli | Trade-off |
| --- | --- | --- |
| Talablar aniq | Bitta batafsil so'rov + reja rejimi (shu bob) | Tez; savollar soni kam |
| Talablar noaniq | "Menga intervyu ber, keyin SPEC.md yoz" (CC) va yangi sessiyada SPEC.md'dan qurish | Toza kontekst va yozma "tayyor" ta'rifi; bir qadam ko'p |
| Mavjud kod bazasi | `/init` bilan boshlang'ich CLAUDE.md, keyin keraksiz qatorlarni olib tashlash (CC) | Agent konvensiyalarni koddan topadi |
| Juda kichik skript | Reja shart emas | Reja vaqti foydadan ko'p |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Bo'sh repo'da "kalkulyator yoz" | Har qaror agentga qoladi; farqni review'da bilasiz | Cheklovlar, o'lchanadigan talab, tekshiruv |
| Rejani o'qimasdan "davom et" | Savollar — rejaning eng qimmatli qismi | Har savolga javob, keraksiz qismlarni olib tashlash |
| CLAUDE.md'ga arxitektura tavsifini yozish | CC: agent repo'ni o'zi o'qiydi | Faqat qarorlar, buyruqlar, "tuzoqlar" |
| Istisnosiz qoidani faqat CLAUDE.md'da qoldirish | Ko'pincha ishlaydi, har doim emas | Ruxsat qoidasi yoki hook |
| Hammasini bitta sessiyada, bitta katta so'rov bilan | Kontekst o'sadi, xatoni qaytarish qiyin | Bosqichlar, har biri commit bilan |

## Amaliyot

1. Nega bo'sh repo agent uchun qiyin holat?
2. Birinchi so'rovda qaysi to'rt narsa aniq aytildi va qaysilari agentga qoldirildi?
3. Agent bergan savollarning qiymati nimada? Ikkita misol keltiring.
4. Agent yozgan CLAUDE.md'dagi qaysi qator ruxsat qoidasiga aylanishi kerak va nega?
5. Talablar noaniq bo'lsa, CC qanday boshlashni tavsiya qiladi?
6. Nega reja bosqichi eng qimmat bo'lsa ham, uni qoldirish kerak emas?

<details>
<summary>Javoblar</summary>

1. O'qiydigan kod yo'q: agent konvensiyalarni ham, qarorlarni ham topa olmaydi — hammasi aytilishi kerak.
2. Cheklovlar (Node 26, bog'liqliksiz), o'lchanadigan talab (yig'indi teng, farq ≤ 1), tekshiruv (`npm test`), qayerga chiqishi (systemd + Nginx). Fayl nomlari, endpoint yo'li, xato formati agentga qoldirildi.
3. Har savol koddan topib bo'lmaydigan qaror. Masalan: ortiqcha so'm qaysi oylarga; summa oylar sonidan kam bo'lsa nima qilish.
4. "Push qilinmaydi" — istisnosiz qoida; CLAUDE.md'da ko'pincha ishlaydi, kafolat uchun `Bash(git push *)` deny kerak.
5. Agentdan intervyu olishni so'rash, javoblardan SPEC.md yozdirish, keyin yangi sessiyada SPEC.md'dan qurish.
6. Noto'g'ri yo'ldan keyinroq qaytish ancha qimmat; reja bosqichida o'zgartirish bir qator bilan bo'ladi.

</details>

## Rasmiy hujjat

- [CC: Best practices — Tell Claude what it can't see, Brainstorm with Claude first, Keep CLAUDE.md short](https://code.claude.com/docs/en/best-practices)
- [CC: Common workflows](https://code.claude.com/docs/en/common-workflows)
- [CC: Choose a permission mode — plan mode](https://code.claude.com/docs/en/permission-modes)
