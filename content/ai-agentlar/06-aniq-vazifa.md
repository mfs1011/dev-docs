# 06 — Aniq vazifa yozish

[Mundarija](README.md)

## Tushuncha

Agent kodni o'zi o'qiydi. CC (Best practices) buni ochiq aytadi: hozirgi modellar fayl tuzilishini, konvensiyalarni, test
freymvorkini va mavjud komponentlar qanday qurilganini **juda yaxshi** topadi, ko'pincha siz tushuntirishingizdan ham tezroq.
Demak yaxshi so'rovning vazifasi agentga kodni tushuntirish emas. Uning vazifasi — agent **koddan bila olmaydigan** narsani
aytish.

CC (Best practices) bunday ma'lumotga misollar keltiradi:

- jamoa yig'ilishda qabul qilgan qaror;
- bitta odamning boshida turgan deploy jarayoni;
- integratsiya testlariga kerak bo'lgan muhit o'zgaruvchisi;
- ikki o'rinli yondashuvdan qaysi biri sizga ma'qul.

Biror narsani yozishdan oldin CC ikki savolni beradi:

1. Agent buni kodni o'qib topa oladimi?
2. U haqiqatan borib qaraydimi?

Ikkalasiga "ha" bo'lsa, yozmang.

### "Buyurmang, topshiring"

CC (How Claude Code works) maslahati: agentga qobiliyatli hamkasbga ish topshirgandek topshiring. Kontekst va yo'nalish
bering, tafsilotlarni unga qoldiring:

```text
The checkout flow is broken for users with expired cards.
The relevant code is in src/payments/. Can you investigate and fix it?
```

Qaysi fayllarni o'qish yoki qaysi buyruqlarni ishga tushirish aytilmagan. Agent buni o'zi topadi. Lekin muammo (muddati
o'tgan kartali foydalanuvchilar) va qidirish joyi (`src/payments/`) aniq.

Bu "aniq yozing" degan maslahatga zid emas. Aniqlik **natija va chegarada** kerak, **qadamlarda** emas.

| Aytish kerak | Aytish shart emas |
| --- | --- |
| Belgi: nima buzilgan, kim ko'radi | Qaysi faylni birinchi ochish |
| "Tayyor" nimani anglatadi | Qaysi buyruq bilan qidirish |
| Agent bilmaydigan qaror va cheklov | Kod qanday tuzilgani (agent o'qiydi) |
| Ikki yo'ldan sizga ma'quli | Har bir qadamning tartibi |

### Yaxshi topshiriqning tarkibi

CX (Working with agents) topshiriqni to'rt qismga bo'ladi:

| Qism | Nimani aniqlashtirish kerak |
| --- | --- |
| **Vazifa** | Nimani bajarish kerak, kim uchun, nima doiraga kiradi va nima kirmaydi |
| **Kontekst** | Qaysi manbalar, faktlar, ustuvorliklar va cheklovlarga tayanish; ma'lumot yetishmasa nima qilish |
| **Harakatlar** | Nimani o'zi qila oladi, nima uchun tasdiq kerak, qachon to'xtab so'rashi kerak |
| **Natija** | Nima topshiriladi, qanday formatda va qayerga; sifat va to'liqlik qanday baholanadi |

CX yana bir maslahat beradi: "tayyor" natija qanday ko'rinishini **misol bilan** ko'rsating.

CC (Best practices) kod uchun eng muhim uchtasini sanaydi: **faylni nomlang, belgini tasvirlang va "tuzatildi" nimani
anglatishini oldindan ayting.** Shunda odatda bir bosqich tuzatishlardan qutulasiz.

CC'dagi juftliklar:

| O'rniga | Shunday yozing |
| --- | --- |
| *"fix the login bug"* | *"users report login fails after the session times out. look at token refresh in src/auth/, write a failing test that reproduces it, then fix it"* |
| *"add a calendar widget"* | *"follow the pattern in HotDogWidget.php and build a calendar widget that lets you pick a month and page between years. no new libraries"* |

Birinchi juftlikda belgi (sessiya tugagach login ishlamaydi), joy (`src/auth/` dagi token yangilash) va tekshiruv (avval
xatoni ko'rsatadigan test) bor. Ikkinchisida namuna (`HotDogWidget.php`), aniq xatti-harakat (oy tanlash, yillar
bo'yicha o'tish) va cheklov (yangi kutubxona yo'q) bor.

### Nega shunday ishlaydi

CP (Prompting best practices) agentni "aqlli, lekin yangi xodim"ga o'xshatadi: u sizning odatlaringiz va ish tartibingizni
bilmaydi. Qanchalik aniq tushuntirsangiz, natija shunchalik yaxshi bo'ladi. Hujjatdagi asosiy test:

> So'rovingizni vazifadan bexabar hamkasbga ko'rsating va bajarishni so'rang. U chalkashsa, model ham chalkashadi.

CP'ning yana ikki maslahati:

- **Sababni ayting.** "HECH QACHON uch nuqta ishlatma" o'rniga "javobni ovozli o'qish dasturi o'qiydi, u uch nuqtani
  talaffuz qila olmaydi, shuning uchun uch nuqta ishlatma". Hujjat bo'yicha model tushuntirishdan umumlashtira oladi:
  sababni bilsa, o'xshash holatlarda ham to'g'ri qaror qiladi.
- **Misol bering.** Format, ohang va tuzilmani boshqarishning eng ishonchli usullaridan biri — bir nechta yaxshi misol.
  Misollar haqiqiy holatga yaqin, xilma-xil bo'lsin va ko'rsatmalardan ajralib tursin (masalan, `<example>` teglari bilan).

GH (Best practices) ham xuddi shu ro'yxatni beradi: murakkab vazifani bo'laklarga bo'ling, talablarni aniq ayting, kirish
ma'lumoti, natija va namunaviy kod misollarini bering.

### Doira: kamroqmi, ko'proqmi

CC (Best practices) muhim kuzatishni aytadi: Claude so'rovni odatda **ehtiyotkorlik bilan** o'qiydi va uni qanoatlantiradigan
eng kichik narsani quradi, chunki siz qancha kutganingizni ko'ra olmaydi. To'liqroq versiya kerak bo'lsa, buni aytish
kerak. CC'dagi misol:

```text
build the settings page from the mockup. be ambitious: empty and error states, the save flow wired up, keyboard navigation, not just the layout
```

Hujjat bo'yicha `be ambitious` ("katta o'ylab qil") hali ham foyda beradigan ibora. U modelga qanchalik qattiq o'ylashni
emas, **doirani** aytadi, doirani esa faqat siz bilasiz.

`think step by step` ("qadamma-qadam o'yla") yoki `be thorough` ("puxta bo'l") kabi iboralar esa CC bo'yicha kalit so'z
emas, oddiy matn. Modelning qanchalik chuqur o'ylashini asosan **effort darajasi** belgilaydi (40-bob).

## Amalda

Bitta vazifani ikki xil so'rov bilan beramiz. Sinov loyihasi 3-bobdagi `narx.js` (tuzatilgan holda), unda 5-bobda `/init`
yaratgan CLAUDE.md ham bor. Har bir so'rov loyihaning alohida nusxasida, Claude Code 2.1.325 da, bir xil sozlamalar bilan
ishga tushirildi.

### 1-urinish: noaniq so'rov

```text
yetkazib berish narxini qo'sh
```

Agentning javobidan:

```text
`narx.js` ga `yetkazibBerish(summa, narx)` funksiyasi qo'shildi. U yetkazib berish narxini umumiy summaga qo'shadi
...
Ma'lum summadan oshganda yetkazib berishni bepul qilish kabi qoidalarni qo'shmadim, chunki bunday talab berilmagan edi.
```

Natija (`git diff`):

```diff
+// Yetkazib berish narxini summaga qo'shadi (chegirmadan keyin qo'llanadi)
+export function yetkazibBerish(summa, narx) {
+  return summa + narx
+}
```

O'zgargan fayllar: `narx.js`, `narx.test.js` va **`CLAUDE.md`**.

Nima bo'ldi:

- Agent doirani ehtiyotkorlik bilan o'qidi va eng kichik narsani qurdi: shunchaki `summa + narx`. Bepul yetkazish chegarasi
  biznes qoidasi edi, u koddan topib bo'lmasdi. Agent buni o'zi aytdi ham.
- Funksiya nomini, parametrlarni va chegirma yetkazishga tushmasligini o'zi hal qildi.
- So'ralmagan holda CLAUDE.md'dagi arxitektura bo'limini yangiladi. 5-bobda aytilgan narsa shu yerda ko'rindi: koddan
  o'qib bo'ladigan tavsif CLAUDE.md'da tursa, uni har o'zgarishda kimdir yangilab turishi kerak bo'ladi.

Agent yomon ishlamadi: testlar yozildi va o'tdi, taxminlari ochiq aytildi. Lekin natija biznes kutganidan boshqacha
bo'ldi va endi ikkinchi bosqich tuzatish kerak.

### 2-urinish: aniq so'rov

```text
Savat summasiga yetkazib berish narxini qo'shadigan funksiya kerak: summa 200000 so'm va undan ko'p bo'lsa
yetkazish bepul, aks holda 15000 so'm. narx.js dagi chegirma kabi sof funksiya bo'lsin (nomi: yetkazish).
Yangi kutubxona qo'shma. narx.test.js ga chegaraviy holatlar uchun test yoz (199999, 200000, 0).
Tayyor mezoni: npm test to'liq o'tadi — ishga tushirib, chiqishini ko'rsat.
```

So'rovdagi qismlar:

| Qism | So'rovda |
| --- | --- |
| Agent bilmaydigan biznes qoidasi | 200000 dan bepul, aks holda 15000 |
| Namuna | `chegirma` kabi sof funksiya |
| Nom | `yetkazish` |
| Cheklov | yangi kutubxona yo'q |
| Chegaraviy holatlar | 199999, 200000, 0 |
| "Tayyor" mezoni va dalil | `npm test` o'tadi, chiqishi ko'rsatiladi |

Natija:

```js
export function yetkazish(summa) {
  return summa >= 200000 ? summa : summa + 15000
}
```

```js
test("yetkazish: 199999 so'mda 15000 qo'shiladi", () => {
  assert.equal(yetkazish(199999), 214999)
})

test("yetkazish: 200000 so'mda bepul", () => {
  assert.equal(yetkazish(200000), 200000)
})

test("yetkazish: 0 so'mda 15000 qo'shiladi", () => {
  assert.equal(yetkazish(0), 15000)
})
```

Agent javobida dalil sifatida test chiqishini ko'rsatdi:

```text
✔ jami: hamma mahsulot hisoblanadi
✔ chegirma: 10 foiz
✔ yetkazish: 199999 so'mda 15000 qo'shiladi
✔ yetkazish: 200000 so'mda bepul
✔ yetkazish: 0 so'mda 15000 qo'shiladi
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

Yana bir qator diqqatga sazovor:

```text
Bitta e'tibor beradigan joy: talabga ko'ra savat bo'sh bo'lsa ham (summa 0) 15000 so'm yetkazish haqi qo'shiladi.
Bo'sh savatda yetkazish bo'lmasligi kerak bo'lsa, ayting — o'zgartiraman.
```

Aniq talab agentga **qolgan noaniqlikni ko'rish** imkonini berdi. Bo'sh savatda yetkazish haqi olinadimi — bu biznes qarori,
uni ham faqat siz bilasiz. Faqat ikkita fayl o'zgardi, CLAUDE.md'ga tegilmadi.

### Ikki urinish yonma-yon

| | Noaniq so'rov | Aniq so'rov |
| --- | --- | --- |
| Biznes qoidasi (200000 dan bepul) | Yo'q, agent bila olmadi | Bor |
| Nom va imzo | Agent o'ylab topdi: `yetkazibBerish(summa, narx)` | So'ralgani: `yetkazish(summa)` |
| Chegaraviy testlar | Yo'q | 199999, 200000, 0 |
| O'zgargan fayllar | 3 ta, shu jumladan so'ralmagan CLAUDE.md | 2 ta |
| Dalil | "4 ta test o'tdi" degan gap | Test chiqishining o'zi |
| Keyingi qadam | Qayta tushuntirish va tuzatish | Bitta savolga javob berish (bo'sh savat) |

Ikkinchi so'rov yozishga bir daqiqa ko'proq ketdi, lekin tuzatish bosqichini tejadi. CC aytgan "bir bosqich tuzatishdan
qutulish" shu.

## Bor narsani tasvirlamang, bering

CC (Best practices): agentga kerakli narsa qo'lingizda bo'lsa, uni tasvirlash o'rniga bering:

| Narsa | Qanday berish |
| --- | --- |
| Fayl | `@` va yo'lni yozing — fayl mazmuni xabarga qo'shiladi (10-bob) |
| Rasm | Dizayn yoki xato skrinshotini so'rovga joylang |
| Buyruq chiqishi | Shell'dan quvur (pipe) bilan: `cat error.log \| claude -p "what's going on here"` |

## Variantlar

| So'rov uslubi | Qachon | Yutug'i | Kamchiligi |
| --- | --- | --- | --- |
| Qisqa, ochiq ("bu faylda nimani yaxshilagan bo'larding?") | O'rganish, g'oya izlash | Agent sizni o'ylamagan yo'lga olib chiqishi mumkin | CC: yo'l-yo'lakay ko'proq tuzatasiz |
| Maqsad + kontekst ("buyurmang, topshiring") | Ko'p kundalik vazifa | Agent yo'lni o'zi topadi, siz kam yozasiz | Biznes qoidasi va "tayyor" mezoni bo'lmasa, agent taxmin qiladi |
| To'liq topshiriq (vazifa, kontekst, harakatlar, natija) | Biznes qoidasi bor, natija aniq bo'lishi kerak | Bir urinishda to'g'ri natija, dalil bilan | Yozishga vaqt ketadi |
| Avval suhbat (agent sizdan so'raydi) | Nima istashingiz o'zingizga ham aniq emas | Spetsifikatsiya birga tug'iladi | Qo'shimcha bosqich — 7-bob |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Biznes qoidasini aytmaslik | Agent uni koddan topa olmaydi va eng kichik variantni quradi | Qoida, chegara va raqamlarni so'rovda ayting |
| Agentga kodni tushuntirish | CC: agent fayl tuzilishi va konvensiyalarni o'zi tezroq topadi | Faqat koddan bilib bo'lmaydigan narsani yozing |
| Har qadamni buyurish ("avval a.js ni och, keyin grep qil…") | CC: buyurmang, topshiring | Belgi, joy va "tayyor" mezonini bering |
| "Tayyor" mezonisiz vazifa | Agent ish tayyor ko'rinsa to'xtaydi (8-bob) | Mezon va dalilni so'rang: buyruq va uning chiqishi |
| Faqat "be thorough", "think step by step" deb kuchaytirish | CC: bular kalit so'z emas, chuqurlikni effort boshqaradi | Doira kerak bo'lsa nima kirishini sanab bering; chuqurlik uchun effort |
| Qoidani sababsiz, katta harflar bilan yozish | CP: sabab aytilsa, model o'xshash holatlarga umumlashtira oladi | Bir jumla bilan sababini ayting |

## Amaliyot

1. CC bo'yicha biror narsani agentga yozishdan oldin qaysi ikki savolni berish kerak?
2. "Buyurmang, topshiring" maslahati "aniq yozing" maslahatiga zid emasmi?
3. CX'dagi yaxshi topshiriqning to'rt qismi qaysilar?
4. Tajribadagi noaniq so'rovda agent nega bepul yetkazish qoidasini qo'shmadi?
5. `be ambitious` va `think step by step` iboralarining farqi nima?
6. Agentga xato logini qanday berish mumkin?
7. Quyidagi so'rovni yaxshilang: `qidiruvni tezlashtir`.

<details>
<summary>Javoblar</summary>

1. Agent buni kodni o'qib topa oladimi? U haqiqatan borib qaraydimi? Ikkalasiga "ha" bo'lsa, yozmaslik kerak.
2. Zid emas. Aniqlik natija va chegaraga kerak (belgi, "tayyor" mezoni, agent bilmaydigan qaror). Qaysi faylni ochish va qaysi buyruqni ishga tushirish kabi qadamlarni esa agent o'zi topadi.
3. Vazifa (nima, kim uchun, doira), kontekst (manbalar, cheklovlar, ma'lumot yetishmasa nima qilish), harakatlar (nimani o'zi qiladi, nima uchun tasdiq kerak, qachon to'xtaydi), natija (nima, qaysi formatda, qanday baholanadi).
4. Bu biznes qoidasi edi, uni koddan topib bo'lmaydi. CC bo'yicha model so'rovni ehtiyotkorlik bilan o'qib, eng kichik yetarli narsani quradi.
5. `be ambitious` doirani aytadi (chekka holatlar, keyingi tabiiy qadamlar ham kirsin), doirani esa faqat siz bilasiz. `think step by step` oddiy matn; chuqurlikni effort darajasi boshqaradi.
6. Quvur bilan: `cat error.log | claude -p "..."`. Yoki faylni `@` bilan havola qilish.
7. Masalan: "`/api/search` 2 soniyadan ko'p javob beryapti, `products` jadvalida 1 mln qator. Sababini toping (so'rov rejasini ko'ring), indeks yoki so'rovni o'zgartirib tuzating. Yangi servis qo'shmang. Tayyor mezoni: mavjud testlar o'tadi va so'rov vaqti oldin/keyin o'lchab ko'rsatilgan."

</details>

## Rasmiy hujjat

- [CC: Best practices — Tell Claude what it can't see, Write a specific prompt](https://code.claude.com/docs/en/best-practices#write-a-specific-prompt)
- [CC: How Claude Code works — Delegate, don't dictate](https://code.claude.com/docs/en/how-claude-code-works#delegate-dont-dictate)
- [CX: Working with agents — Give the agent a clear assignment](https://learn.chatgpt.com/codex/working-with-agents)
- [CP: Prompting best practices — Be clear and direct, Add context, Use examples](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [GH: Best practices — Create thoughtful prompts](https://docs.github.com/en/copilot/get-started/best-practices)
