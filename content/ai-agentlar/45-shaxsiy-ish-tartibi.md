# 45 — Shaxsiy ish tartibi

[Mundarija](README.md)

## Tushuncha

Bu bob — qo'llanmaning amaliy yakuni. Oldingi boblardagi hamma narsani har kuni qilish shart emas. CC (Best practices) shunday
boshlanadi: Claude Code ko'p hollarda yangi sessiyadagi birinchi oddiy so'rovingiz **hech qanday sozlamasiz** to'g'ri ishlaydigan
qilib qurilgan. Sozlama faqat standart xatti-harakat yetmaganda kerak — loyihangizda koddan ko'rinmaydigan bilim, qoida yoki cheklov
bo'lganda.

### Sessiya kutilganidek ketmasa — to'rt sabab

CC (Best practices) — deyarli har doim quyidagilardan biri:

| Belgi | Sabab | Yechim | Bob |
| --- | --- | --- | --- |
| Siz o'ylagandan boshqa narsa qurildi yoki har sessiyada bir faktni qayta topyapti | Repo'dan olib bo'lmaydigan ma'lumot yetishmaydi | Agentga u ko'ra olmaydigan narsani ayting: aniq so'rov, CLAUDE.md | 6, 13 |
| "Tayyor" dedi, lekin to'liq emas | O'z ishini tekshirish yo'li yo'q edi | Tekshiruv bering: test, kutilgan natija, Stop hook | 8 |
| Repo'da hech qachon bo'lmasligi kerak bo'lgan narsa bo'ldi yoki har doim bo'lishi kerak bo'lgan qadam o'tkazib yuborildi | So'rovning o'zi buni kafolatlay olmaydi | Hook, ruxsat qoidasi, sandbox | 26, 35, 36 |
| To'g'ri bajardi, lekin vazifaga arzimaydigan vaqt, token yoki ruxsat so'rovlari ketdi | Standart sozlama mos emas | Ruxsat rejimi, model va effort, kontekstni boshqarish | 35, 40, 41 |

### Har kungi tsikl

Har vazifa uchun to'rt qadam:

| Qadam | Nima qilish | Bob |
| --- | --- | --- |
| **1. Vazifa** | Nima, qayerda, qanday natija, qanday tekshiriladi. Agent ko'ra olmaydigan narsani ayting | 6, 10 |
| **2. Reja** | Kichik vazifada — darhol. Bir nechta faylga tegsa yoki noaniq bo'lsa — reja rejimi | 7 |
| **3. Tekshiruv** | Testlar, tip tekshiruvi, brauzer; agentga tekshiruv vositasini bering | 8, 20, 23 |
| **4. Review** | Diff'ni o'zingiz o'qing; kerak bo'lsa toza kontekstli review (`/code-review`, `/security-review`) | 22, 39 |

Sessiyani boshqarish (CC Best practices — Steer the session): **birinchi daqiqani kuzating**, agent chetga og'ishi bilan `Esc` bosing;
**ikki muvaffaqiyatsiz tuzatishdan keyin** uchinchisini yozmang — `/clear` qilib, o'rgangan narsangizni qo'shgan yangi so'rov yozing.
Uchinchi tuzatish suhbatga faqat qo'shiladi, agent esa ikki muvaffaqiyatsiz urinishni qayta-qayta o'qiydi.

| Boshqaruv | Nima qiladi |
| --- | --- |
| `Esc` | Agentni harakat o'rtasida to'xtatadi, shu paytgacha bo'lgan ish saqlanadi |
| `/rewind` (yoki bo'sh so'rovda `Esc` ikki marta) | Kod, suhbat yoki ikkalasini oldingi so'rovga qaytaradi |
| `/clear` | Yangidan boshlash |
| `/btw` | Tez savol — tarixga qo'shilmaydi |
| `/rename <nom>` + `claude --resume <nom>` | Bir necha kunlik ishga qaytish |

CC ogohlantiradi: checkpoint'lar faqat Claude o'z fayl tool'lari bilan tahrirlagan fayllarni qamraydi; faqat Bash buyrug'i tekkan fayl
qaytarilmaydi. Ular git'ning o'rnini bosmaydi (9-bob).

### Sozlamani asta-sekin qurish

CC (Extend Claude Code — Build your setup over time): hammasini boshidan sozlash shart emas. Har imkoniyatning taniladigan "qo'zg'atuvchisi"
bor va ko'p jamoalar ularni taxminan shu tartibda qo'shadi:

| Qo'zg'atuvchi | Nima qo'shiladi | Bob |
| --- | --- | --- |
| Agent bir konvensiya yoki buyruqni ikki marta noto'g'ri qiladi | CLAUDE.md'ga qator | 13 |
| Qisqaroq, ko'proq tushuntirish yoki bir xil formatni qayta-qayta so'rayapsiz | Output style | 43 |
| Vazifani boshlash uchun bir xil so'rovni qayta yozyapsiz | Chaqiriladigan skill | 25 |
| Bir xil ko'p qadamli jarayonni uchinchi marta joylashtiryapsiz | Skill | 25 |
| Agent ko'ra olmaydigan brauzer oynasidan ma'lumot ko'chiryapsiz | MCP server | 27 |
| Agent belgi qayerda ta'riflanganini topish uchun ko'p fayl o'qiydi | Kod intellekti plagini | 29 |
| Yon vazifa suhbatni keyin kerak bo'lmaydigan chiqish bilan to'ldiradi | Subagent | 30 |
| Biror narsa har safar so'ramasdan bo'lishi kerak | Hook | 26 |
| Ikkinchi repo'ga xuddi shu sozlama kerak | Plagin | 29 |

Xuddi shu qo'zg'atuvchilar mavjud sozlamani **yangilash** vaqtini ham bildiradi: takrorlanuvchi xato yoki takrorlanuvchi review izohi —
chatdagi bir martalik tuzatish emas, CLAUDE.md tahriri.

### Nimani qilishni to'xtatsa bo'ladi

CC (Best practices — What you can stop doing): bu maslahatlar yozilgan paytda to'g'ri edi, lekin hozirgi modellar ularni keraksiz
qildi:

| Eski maslahat | Nega endi kerak emas |
| --- | --- |
| Kontekst oynasini qattiq boshqaring | Ko'p modellarda 1M token oyna, kompaktlash o'zi ishlaydi. Lekin vazifalar orasida `/clear` hali ham foydali: diqqatli kontekst yaxshiroq javob beradi va arzonroq |
| E'tibordan chetda qolgan ko'rsatmaga IMPORTANT yoki KATTA HARFLAR | Hozirgi modellar oddiy yozilgan qatorga amal qiladi; urg'u qoidani ortiqcha qo'llashga olib keladi. Qat'iy qoida — hook yoki deny |
| Kontekstni himoya qilish uchun subagent | Kontekst kamdan-kam tugaydi. Subagent parallel ish, shovqinli chiqish va mustaqil review uchun yaxshi, lekin qo'shimcha token turadi |
| Yaxshiroq javob uchun subagentga topshirish | Xuddi shu vazifani subagentga berish javobni yaxshilamaydi. Toza review'chi esa yordam beradi — bu boshqa narsa |
| So'rovda `think hard`, `be thorough` | Buning boshqaruvi — effort. `ultrathink` hali ishlaydi (40-bob) |
| "Davom et, tugaguncha aylan, dangasalik qilma" | Hozirgi modellar kelishilgan vazifani o'zi davom ettiradi; bunday qatorlar ortiqcha ishga olib keladi. Tekshiruv berish — boshqa narsa, u hali ham kerak. Kuzatuvsiz ishda — `/goal` yoki Stop hook |
| CLAUDE.md'da arxitektura va fayl tuzilmasini tasvirlash | Agent repo'ni o'zi o'qiydi. Faqat repo'da yo'q narsani yozing |

### Qachon agent kerak emas

Qo'llanma davomida ko'rilgan holatlar:

| Holat | Nega | Bob |
| --- | --- | --- |
| Yangi texnologiyani **o'rganyapsiz** | To'liq topshirish o'rganishni kamaytiradi | 43 |
| Bir qatorli o'zgarish, aniq bilasiz | Tushuntirishga ketadigan vaqt yozishdan ko'p | — |
| Katta ma'lumotdan bitta raqam | `grep`/skript arzonroq va ishonchliroq | 41 |
| Qaytarib bo'lmaydigan amal (push, deploy, xabar) | Inson qarori | 11 |

## Amalda: bir kunlik namuna

Qo'llanmadagi tajribalardan yig'ilgan odatiy kun:

| Vaqt | Ish | Usul |
| --- | --- | --- |
| Ertalab | Kechagi ishga qaytish | `claude --resume oauth-migration` yoki yangi sessiya + qisqa kontekst (kesh baribir sovigan, 41-bob) |
| | Xato tuzatish (o'zingiz yozmagan kod) | `/effort high`, xatoni qayta hosil qiladigan test avval (18-bob) |
| Tushlikdan oldin | Yangi funksiya | Reja rejimi → tasdiqlash → bajarish → testlar → diff review |
| | PR | `/security-review`, commit xabari va PR tavsifi (21-bob) |
| Tushdan keyin | Notanish servisni o'rganish | Explanatory uslubi, savollar (17, 43-boblar) |
| | Katta log tahlili | Agentga `grep`/`awk` ishlatishni ayting (41-bob) |
| Kun oxiri | Takrorlangan xatolar | CLAUDE.md'ga qator yoki skill; haftada bir `/insights` (42-bob) |

## Variantlar

| Tajriba | Boshlang'ich sozlama | Keyingi qadam |
| --- | --- | --- |
| Endi boshlayapsiz | Hech qanday sozlama; `/init` bilan CLAUDE.md | Birinchi takroriy xatodan keyin CLAUDE.md'ga qator |
| Bir necha hafta | CLAUDE.md, bitta-ikkita skill, ruxsat qoidalari | Hook'lar, MCP |
| Jamoada | Git'dagi umumiy sozlamalar (44-bob) | Plagin, CI, managed settings |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Birinchi kuni hamma narsani sozlash | CC: hammasini boshidan sozlash shart emas | Qo'zg'atuvchi paydo bo'lganda qo'shish |
| Uchinchi, to'rtinchi tuzatish | CC: ikki muvaffaqiyatsiz urinish kontekstda qoladi | `/clear` + yaxshiroq so'rov |
| Agentni kuzatmasdan qoldirish (interaktiv ishda) | CC: birinchi daqiqani kuzating | `Esc` erta |
| Checkpoint'ni git o'rniga ishlatish | Bash tegan fayllar qaytarilmaydi | Git commit'lar |
| Eski odatlar: KATTA HARFLAR, "think hard", "tugaguncha aylan" | CC: hozirgi modellarda keraksiz yoki zararli | Oddiy qator, effort, tekshiruv |
| Takroriy xatoni har safar chatda tuzatish | Keyingi sessiyada yana takrorlanadi | CLAUDE.md, skill, hook |

## Amaliyot

1. Sessiya kutilganidek ketmasligining to'rt sababi va har biriga yechim qanday?
2. Har kungi tsiklning to'rt qadami qaysilar?
3. Ikki muvaffaqiyatsiz tuzatishdan keyin nima qilish kerak va nega?
4. Qaysi qo'zg'atuvchi skill qo'shish vaqti kelganini bildiradi?
5. Hozirgi modellarda qaysi eski maslahatlarni to'xtatsa bo'ladi?
6. Qachon agent ishlatmaslik yaxshiroq?

<details>
<summary>Javoblar</summary>

1. Ma'lumot yetishmaydi → aniq so'rov, CLAUDE.md; tekshiruv yo'q → test, kutilgan natija, Stop hook; so'rov kafolatlay olmaydigan qoida → hook, ruxsat, sandbox; ortiqcha vaqt/token/ruxsat so'rovi → ruxsat rejimi, model, effort, kontekst.
2. Vazifa, reja, tekshiruv, review.
3. `/clear` qilib, o'rganganingizni qo'shgan yangi so'rov yozish. Uchinchi tuzatish ikki muvaffaqiyatsiz urinish bor suhbatga qo'shiladi va agent ularni qayta-qayta o'qiydi.
4. Vazifani boshlash uchun bir xil so'rovni qayta yozish yoki bir xil ko'p qadamli jarayonni uchinchi marta joylashtirish.
5. Kontekstni qattiq boshqarish, KATTA HARFLAR bilan urg'u, kontekst uchun subagent, yaxshiroq javob uchun subagentga topshirish, `think hard`, "tugaguncha aylan", CLAUDE.md'da arxitektura tavsifi.
6. Yangi texnologiyani o'rganayotganda (to'liq topshirish), aniq biladigan bir qatorli o'zgarishda, katta ma'lumotdan bitta raqam kerak bo'lganda (skript), qaytarib bo'lmaydigan amallarda.

</details>

## Rasmiy hujjat

- [CC: Best practices — Steer the session, What you can stop doing](https://code.claude.com/docs/en/best-practices)
- [CC: Extend Claude Code — Build your setup over time](https://code.claude.com/docs/en/features-overview#build-your-setup-over-time)
