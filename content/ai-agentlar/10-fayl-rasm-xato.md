# 10 — Fayl, rasm va xato bilan kontekst berish

[Mundarija](README.md)

## Tushuncha

6-bobda CC (Best practices) maslahatini ko'rdik: agentga kerakli narsa qo'lingizda bo'lsa, uni **tasvirlamang, bering**.
Bu bob shu "berish"ning uch yo'lini ko'rsatadi:

| Nima | Qanday berish | Natija |
| --- | --- | --- |
| **Fayl yoki papka** | `@yo'l` | Fayl mazmuni yoki papka ro'yxati xabarga darhol qo'shiladi |
| **Xato chiqishi, log** | Shell'dan quvur (pipe): `buyruq \| claude -p "…"` yoki faylni `@` bilan | Agent xatoning aynan matnini ko'radi |
| **Rasm** | Oynaga sudrab tashlash, `Ctrl+V` bilan joylash yoki rasm yo'lini yozish | Agent skrinshot, maket yoki diagrammani ko'radi |

### Qachon berish kerak, qachon agent o'zi topadi

CC (Quickstart) eslatadi: Claude Code loyiha fayllarini kerak bo'lganda **o'zi o'qiydi**, kontekstni qo'lda qo'shish shart
emas. Demak `@` va boshqa usullar majburiy emas. Ular quyidagi holatlarda foyda beradi:

| Holat | Nima uchun berish foydali |
| --- | --- |
| Qaysi fayl kerakligini aniq bilasiz | Agent qidiruvga vaqt sarflamaydi (CC: "Claude o'qishini kutmasdan") |
| Xato faqat sizning ekraningizda yoki terminalingizda | Agent uni o'zi ko'ra olmaydi: brauzer konsoli, CI logi, boshqa kompyuterdagi chiqish |
| Ko'rinish masalasi: maket, UI, diagramma | CC: matn bilan tasvirlash noaniq yoki noqulay bo'lganda rasm ishlating |
| Xato ba'zan chiqadi, ba'zan yo'q | Agent uni o'zi qayta hosil qila olmasligi mumkin — aniq chiqishni bering |

Agent o'zi topadigan holatlar: "qaysi faylda" ekanini bilmasangiz, xato agentning o'zi ishga tushira oladigan buyruqda
chiqsa (masalan, `npm test`) yoki kod bazasini o'rganish kerak bo'lsa. Bunday paytda buyruqni aytish yetarli. CC (Common
workflows) xatoni tuzatish uchun shunday maslahat beradi:

- muammoni qayta hosil qiladigan buyruqni ayting va stack trace oling;
- xatoni qayta hosil qilish qadamlarini ayting;
- xato doim chiqadimi yoki ba'zan, buni ham ayting.

### `@` havolasi

CC (Common workflows):

```text
Explain the logic in @src/utils/auth.js
What's the structure of @src/components?
```

Hujjatdagi tafsilotlar:

- fayl mazmuni Read tool'ining token chegarasiga sig'sa (standart 25 000 token) xabarga qo'shiladi; 256 KB dan katta matn
  fayli qo'shilmaydi;
- papka havolasi mazmunni emas, **fayllar ro'yxatini** ko'rsatadi;
- yo'l nisbiy yoki to'liq bo'lishi mumkin; `@` yozganda yo'l takliflari menyusi ochiladi;
- `@` bilan havola qilingan fayl papkasidagi va yuqori papkalardagi CLAUDE.md ham kontekstga qo'shiladi;
- bir xabarda bir nechta faylga havola berish mumkin: `@file1.js and @file2.js`;
- MCP resurslariga ham: `@github:repos/owner/repo/issues` (27-bob).

**Xavfsizlik tafsiloti.** CC ogohlantiradi: `@` bilan qo'shilgan faylda tool chaqiruvi bo'lmaydi, shuning uchun
`PreToolUse` hook'lari ishlamaydi. Agar agent nimani o'qishini hook bilan nazorat qilsangiz, maxfiy yo'llarni `Read` taqiq
qoidasi bilan yoping (38-bob). Shunda Claude Code mos faylni `@` bilan ham qo'shmaydi.

### Rasmlar

CC (Common workflows) rasm qo'shishning uch yo'li:

1. rasmni Claude Code oynasiga sudrab tashlash;
2. rasmni nusxalab, CLI'ga `Ctrl+V` bilan joylash (Windows va WSL'da `Alt+V`);
3. rasm yo'lini yozish: `Analyze this image: /path/to/your/image.png`.

Hujjatdagi misollar:

```text
Here's a screenshot of the error. What's causing it?
This is our current database schema. How should we modify it for the new feature?
Generate CSS to match this design mockup
```

Bir suhbatda bir nechta rasm bilan ishlash mumkin. Claude rasmga `[Image #1]` deb murojaat qilsa, macOS'da `Cmd+Click`
(Windows va Linux'da `Ctrl+Click`) uni rasm ko'rish dasturida ochadi.

## Amalda

Sinov loyihasi — 3-bobdagi `narx.js`. Claude Code 2.1.325, skript rejimi.

### 1. `@` — agent faylni o'zi o'qimaydi

```bash
claude -p "@narx.js dagi chegirma nima qiladi? bir jumla bilan" --output-format stream-json --verbose
```

`stream-json` chiqishida **birorta ham tool chaqiruvi yo'q** edi, javob birinchi navbatdayoq keldi:

```text
`chegirma(summa, foiz)` `summa` dan `foiz` foiz chegirmani ayirib, qolgan narxni qaytaradi.
Masalan, `chegirma(200, 10)` 180 qaytaradi (`narx.js:10-12`).
```

Fayl mazmuni xabar bilan birga keldi, shuning uchun agent uni Read tool'i bilan qayta o'qishiga hojat qolmadi. Javobdagi
`narx.js:10-12` — agent qator raqamlarini ham ko'rgan.

### 2. Xato chiqishi quvur bilan

3-bobdagi xatoli `narx.js` holatida test chiqishini to'g'ridan-to'g'ri agentga uzatamiz:

```bash
node --test 2>&1 | claude -p "testlar nega yiqilyapti? kodga tegma, faqat sababini ikki jumlada ayt"
```

```text
`jami` funksiyasida sikl `i = 1` dan boshlanyapti, shuning uchun savatdagi birinchi mahsulot hisobga olinmayapti
(25000 o'rniga 5000 chiqyapti). `chegirma` esa `foiz` ni 100 ga bo'lmasdan ko'paytiryapti (`summa * foiz`), shu sabab
10% o'rniga 1000% chegirma chiqib, natija -225000 bo'lyapti; ...
```

Quvurdan kelgan chiqish so'rovga qo'shildi. `2>&1` muhim: Node test xatolarini stderr'ga yozadi, busiz agent ularning bir
qismini ko'rmaydi.

### 3. Rasm — brauzer konsoli skrinshoti

Agent ko'ra olmaydigan xato — brauzer konsoli. Sinov uchun skrinshot (`xato.png`) tayyorlandi. Unda shunday matn bor edi:

```text
✖ Uncaught TypeError: Cannot read properties of undefined (reading 'narx')
    at jami (narx.js:5:22)
    at savatniKorsat (savat.js:12:18)
    at HTMLButtonElement.onclick (index.html:9:5)
```

So'rov — CC'dagi uchinchi usul, rasm yo'li bilan:

```text
xato.png — brauzer konsolidan skrinshot. Xato nimani bildiradi va narx.js da qaysi holatda yuz beradi?
Kodga tegma, qisqa javob ber.
```

Agent ikkita tool chaqirdi: `[Read] xato.png` (rasmni ko'rdi) va `[Read] narx.js`. Javobi:

```text
**Xato nimani bildiradi:** `TypeError: Cannot read properties of undefined (reading 'narx')` — `undefined` qiymatdan
`.narx` xossasini o'qishga urinilgan. Ya'ni savatdagi element obyekt emas, `undefined`.

**narx.js da qayerda:** `narx.js:5:22` — `savat[i].narx`. 22-ustun aynan `.narx` ga to'g'ri keladi. Demak, sikl
qaysidir `i` da `savat[i] === undefined` holatiga yetgan.
...
Agar `savat` ning o'zi `undefined` bo'lganida, xato 4-qatorda `reading 'length'` deb chiqardi. Shuning uchun muammo
massivning o'zida emas, uning elementida. Massivni chaqiruvchi `savat.js:12` (`savatniKorsat`) qanday to'ldirayotganini
tekshirish kerak.
```

Agent skrinshotdagi stack trace'ni koddagi aniq qator va ustunga bog'ladi. Keyin "savat `undefined` bo'lganda xato boshqacha
chiqardi" degan dalil bilan bitta variantni chiqarib tashladi va keyingi qadamni ko'rsatdi: `savat.js:12`. Bu stack trace'ni
**to'liq** berganning foydasi. "Undefined xatosi chiqyapti" deb tasvirlash bunchalik aniq natija bermasdi.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Hech narsa bermaslik, agent o'zi topsin | Eng kam harakat; agent kerakli faylni o'zi tanlaydi | Qidiruvga vaqt va token ketadi; ko'ra olmaydigan narsani topa olmaydi | Kod bazasidagi narsa, buyruq bilan qayta hosil qilinadigan xato |
| `@fayl` | Darhol kontekstda, tool chaqiruvisiz | Katta fayl kontekstni egallaydi; `PreToolUse` hook'lari ishlamaydi | Qaysi fayl kerakligini aniq bilasiz |
| Quvur (`\| claude -p`) | Aynan chiqish, nusxalash xatosiz | Faqat skript rejimida; juda uzun log kontekstni to'ldiradi | Log, test va build chiqishi |
| Rasm | Matn bilan tasvirlab bo'lmaydigan narsa | Rasm ham kontekst egallaydi | UI, maket, diagramma, agent ko'ra olmaydigan ekran |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Xatoni o'z so'zingiz bilan qayta aytish ("undefined chiqyapti") | Stack trace'dagi fayl, qator va ustun yo'qoladi | Chiqishni to'liq bering: quvur, `@log` yoki skrinshot |
| Stderr'ni yo'qotish (`buyruq \| claude -p`) | Ko'p vositalar xatoni stderr'ga yozadi | `buyruq 2>&1 \| claude -p "…"` |
| Kerakli faylni bilib turib, agentni qidirtirish | Ortiqcha qidiruv vaqt va token oladi | `@yo'l` bilan bering |
| Butun papkani `@` bilan berib, mazmunni kutish | CC: papka havolasi faqat ro'yxatni ko'rsatadi | Kerakli fayllarni alohida `@` bilan bering |
| Ulkan log faylni to'liq berish | Kontekstni to'ldiradi (2-bob) | Kerakli qismini bering: `tail -200 app.log \| claude -p …` |
| `@` havolani hook nazoratida deb o'ylash | CC: `@` da tool chaqiruvi yo'q, `PreToolUse` ishlamaydi | Maxfiy yo'llar uchun `Read` taqiq qoidasi |

## Amaliyot

1. Qachon `@` bilan fayl berish foydali, qachon agent o'zi topadi?
2. Papkaga `@` havolasi nima beradi?
3. `node --test | claude -p "…"` buyrug'ida nima yetishmaydi?
4. Claude Code'ga rasm berishning uch yo'li qaysilar?
5. Tajribada agent skrinshotdagi xatodan qanday xulosa chiqardi va bunda nima yordam berdi?
6. Nega `@` bilan qo'shilgan faylni `PreToolUse` hook nazorat qilmaydi va buning o'rniga nima qilish kerak?

<details>
<summary>Javoblar</summary>

1. Foydali: qaysi fayl kerakligini aniq bilganingizda (agent qidirmaydi). Agent o'zi topadi: faylni bilmasangiz, xato agent ishga tushira oladigan buyruqda chiqsa, kod bazasini o'rganish kerak bo'lsa.
2. Mazmunni emas, fayllar ro'yxatini.
3. `2>&1`: ko'p vositalar (jumladan Node test) xatoni stderr'ga yozadi, busiz u agentga bormaydi.
4. Oynaga sudrab tashlash, `Ctrl+V` bilan joylash (Windows/WSL'da `Alt+V`), rasm yo'lini yozish.
5. Stack trace'ni `narx.js:5:22` (`savat[i].narx`) ga bog'ladi, xato massiv elementining `undefined` ekanidan ekanini aniqladi va `savat.js:12` ni tekshirishni taklif qildi. To'liq stack trace (fayl, qator, ustun) yordam berdi.
6. `@` bilan qo'shishda tool chaqiruvi bo'lmaydi. Maxfiy yo'llar uchun `Read` taqiq qoidasini qo'shish kerak yoki `CLAUDE_CODE_DISABLE_FILE_MENTIONS=1`.

</details>

## Rasmiy hujjat

- [CC: Common workflows — Reference files and directories](https://code.claude.com/docs/en/common-workflows#reference-files-and-directories)
- [CC: Common workflows — Work with images](https://code.claude.com/docs/en/common-workflows#work-with-images)
- [CC: Common workflows — Fix bugs efficiently](https://code.claude.com/docs/en/common-workflows#fix-bugs-efficiently)
- [CC: Best practices — Write a specific prompt](https://code.claude.com/docs/en/best-practices#write-a-specific-prompt)
- [CC: Quickstart — Ask your first question](https://code.claude.com/docs/en/quickstart)
