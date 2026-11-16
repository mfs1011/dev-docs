# 07 — Avval reja, keyin kod

[Mundarija](README.md)

## Tushuncha

6-bobda agentga aniq topshiriq berdik. Lekin ba'zan topshiriqni yozishning o'zi qiyin bo'ladi: nima istashingiz hali
o'zingizga ham to'liq aniq emas yoki o'zgarish katta va uni boshlashdan oldin ko'rib chiqmoqchisiz. Bunday holatda ishni
ikkiga bo'lish foydali:

1. **O'rganish va reja** — agent kodni o'qiydi, reja tuzadi va savollarini beradi. Faylga tegmaydi.
2. **Amalga oshirish** — siz rejani tasdiqlaganingizdan yoki to'g'rilaganingizdan keyin agent kod yozadi.

CX (Working with agents) buni mustaqillik darajasini tanlash deb ataydi: vazifaga qarab bajarishdan oldin reja, boshqa
tizimni o'zgartirishdan oldin qoralama yoki doira o'zgarganda to'xtab so'rashni talab qilish mumkin.

Claude Code'da buning uchun ikki vosita bor:

| Vosita | Nima qiladi | Qachon |
| --- | --- | --- |
| **Plan mode** (reja rejimi) | Agent kodni o'qiydi va reja yozadi, siz tasdiqlamaguningizcha fayllarni tahrirlamaydi | Nima qilish kerakligi taxminan aniq, lekin yo'lini ko'rib chiqmoqchisiz |
| **Suhbat orqali spetsifikatsiya** | Agent sizdan savol so'raydi va javoblardan talablar faylini yozadi | Nima istashingiz hali aniq emas |

### Plan mode

CC (Permission modes): plan mode'da Claude kodni o'rganadi va o'zgarish taklif qiladi, lekin o'zi o'zgartirmaydi. U
fayllarni o'qiydi, o'rganish uchun shell buyruqlarini ishga tushiradi va reja yozadi. Manba fayllarni esa tahrirlamaydi.
Siz rejani tasdiqlamaguningizcha tahrir bloklangan bo'ladi.

Plan mode'ga kirish yo'llari (CC Permission modes):

| Usul | Qanday |
| --- | --- |
| Sessiya davomida | `Shift+Tab` ni pastki qatorda `⏸ plan mode on` chiqquncha bosing |
| Bitta so'rov uchun | So'rov boshiga `/plan` yozing |
| Sessiyani shu rejimda boshlash | `claude --permission-mode plan` |
| Loyihada standart qilish | `.claude/settings.json` da `defaultMode` ni `plan` qilish |

Reja tayyor bo'lgach, Claude uni ko'rsatadi va qanday davom etishni so'raydi (CC Permission modes):

| Tanlov | Nima bo'ladi |
| --- | --- |
| **Yes, and use auto mode** | Reja tasdiqlanadi, agent auto rejimda ishlaydi (auto rejim mavjud bo'lmasa, bu tanlov **Yes, auto-accept edits** deb ataladi) |
| **Yes, manually approve edits** | Reja tasdiqlanadi, har bir tahrirni alohida tasdiqlaysiz |
| **No, keep planning** | Reja rejimida qolasiz va nimani o'zgartirish kerakligini aytasiz |

Ikki foydali tugma:

- `Ctrl+G` — rejani standart matn muharriringizda ochadi, uni o'zingiz tahrirlab, keyin davom ettirasiz;
- `Esc` — tasdiq oynasidan chiqish.

CC ogohlantiradi: tasdiq oynasida `Shift+Tab` bosish rejani **tasdiqlaydi**. Reja rejimidan tasdiqlamasdan chiqmoqchi
bo'lsangiz, avval `Esc`, keyin `Shift+Tab` bosing.

Rejani tasdiqlash plan mode'dan chiqaradi va agent tahrirni boshlaydi. Qayta reja tuzish uchun yana `Shift+Tab` yoki `/plan`.

CC (Explore the context window) yana bir afzallikni ko'rsatadi: plan mode'da yozilgan reja diskda saqlanadi va
kontekst qisqartirilgandan keyin qaytadan yuklanadi. Uzun sessiyada reja yo'qolmaydi.

### Suhbat orqali spetsifikatsiya

CC (Best practices): nima istashingizni hali aniq bilmasangiz, so'rovni yozishdan oldin hammasini o'ylab chiqishingiz shart
emas. Uning o'rniga agentdan sizni so'roq qilishni so'rang:

```text
I want to add rate limiting to the public API but haven't thought it through yet. Interview me until you could write the spec, then write it to SPEC.md.
```

Tarjimasi: "Ochiq API'ga so'rovlar chegarasini (rate limiting) qo'shmoqchiman, lekin hali o'ylab ko'rmadim. Spetsifikatsiya
yoza oladigan darajaga yetguningizcha mendan so'rang, keyin uni SPEC.md'ga yozing."

CC bo'yicha Claude hali aniqlanmagan qismlar haqida variantli savollar beradi: chegara foydalanuvchiga qo'yiladimi yoki
kalitgami, chegaradan oshgan so'rov bilan nima qilinadi, nima doiraga kirmaydi. Javoblar spetsifikatsiyaga yetguncha
so'rashda davom etadi.

Keyingi qadam muhim. CC maslahati: `SPEC.md` tayyor bo'lgach, **qurishni yangi sessiyada boshlang**. Shunda qurish toza
kontekst va yozma "tayyor" ta'rifi bilan boshlanadi. Shu fayl keyinroq ishni tekshirishda ham kerak bo'ladi (8-bob).

## Amalda

3-bobdagi `narx.js` loyihasiga promo-kod qo'shamiz. Vazifa ataylab noaniq: qanday kodlar bo'ladi, noto'g'ri kod bilan
nima qilinadi — aytilmagan. Claude Code 2.1.325, loyihaning alohida nusxasi.

### 1-qadam: reja

```bash
claude --permission-mode plan -p "Savatga promo-kod qo'llab-quvvatlashini qo'shmoqchiman. Avval reja tuz, kodga tegma."
# boshqa bayroqlar 3-bobdagidek: --setting-sources project,local --output-format stream-json --verbose
```

Agent ikkita tool chaqirdi:

1. `[Bash] ls -la && cat narx.js narx.test.js package.json` — loyihani o'rgandi.
2. `[Write] ~/.claude/plans/savatga-promo-kod-…md` — rejani **loyihadan tashqarida**, Claude Code'ning rejalar papkasiga
   yozdi.

Shundan keyin `git status` bo'sh edi: plan mode'da loyiha fayllariga tegilmadi.

Rejadan asosiy qismlar (agentning javobidan):

```text
**O'zgarishlar (`narx.js`):**
1. **`PROMO_KODLAR` ro'yxati** qo'shiladi. ...
2. **`promoQollash(summa, kod, kodlar = PROMO_KODLAR)`** funksiyasi:
   - kiritilgan kodni tozalaydi: bo'sh joylarni olib tashlaydi va katta harfga o'tkazadi;
   - foizli kodlar uchun mavjud `chegirma()` funksiyasini ishlatadi;
   - kod topilmasa yoki `minSumma` yetmasa, xato tashlaydi;
   - natija hech qachon 0 dan pastga tushmaydi.
3. **`savatJami(savat, kod)`** funksiyasi ...

## Siz hal qilishingiz kerak bo'lgan savollar
1. **Noto'g'ri kod kiritilsa nima bo'lsin?** Rejada xato tashlanadi. Muqobil variant: summa o'zgarmasdan qaytadi.
2. **Kodlar qayerda saqlansin?** Rejada standart ro'yxat kodning o'zida turadi, lekin uni parametr orqali almashtirish mumkin.
3. **Bir vaqtda nechta kod qo'llansin?** Rejada faqat bitta.
4. **Amal qilish muddati yoki foydalanish limiti kerakmi?** Hozircha rejaga kiritilmagan.
```

Reja eng qimmatli narsani berdi: **to'rtta biznes savoli**. Ularning javobi kodda yo'q, ularni faqat siz bilasiz. Plan
mode'siz agent har biriga o'zi javob topib, darhol kod yozib qo'ygan bo'lardi (6-bobdagi noaniq so'rovdagi kabi).

### 2-qadam: javoblar bilan amalga oshirish

Rejani loyihaga `REJA.md` qilib ko'chirdik va **yangi sessiyada**, javoblar bilan qurishni so'radik:

```text
REJA.md dagi rejani amalga oshir. Ochiq savollarga javoblar: 1) noto'g'ri kodda xato tashlansin;
2) kodlar narx.js ichida tursin, parametr bilan almashtirish shart emas; 3) faqat bitta kod;
4) muddat va limit kerak emas. CLAUDE.md ga tegma. Tayyor mezoni: npm test o'tadi, chiqishini ko'rsat.
```

Natija:

```js
export const PROMO_KODLAR = {
  CHEGIRMA10: { tur: 'foiz', qiymat: 10 },
  MINUS5000: { tur: 'summa', qiymat: 5000, minSumma: 20000 },
}

// Summaga bitta promo-kodni qo'llaydi; noto'g'ri kodda xato tashlaydi
export function promoQollash(summa, kod) {
  const promo = PROMO_KODLAR[String(kod).trim().toUpperCase()]
  if (!promo) {
    throw new Error('Promo-kod topilmadi')
  }
  if (promo.minSumma !== undefined && summa < promo.minSumma) {
    throw new Error('Promo-kod uchun summa yetarli emas')
  }
  const natija = promo.tur === 'foiz'
    ? chegirma(summa, promo.qiymat)
    : summa - promo.qiymat
  return Math.max(0, natija)
}
```

`npm test`: `tests 8`, `pass 8`, `fail 0`.

Agent javobidagi eng muhim qism — **rejadan farqlar**:

```text
**Rejadan farqlar:**
- 2-javobingiz bo'yicha `kodlar` parametri qo'shilmadi. Kodlar faqat `narx.js` ichida turadi.
- **"manfiy bo'lmaydi" testi yozilmadi.** Hozirgi kodlar bilan natijani manfiyga tushirib bo'lmaydi:
  `MINUS5000` uchun `minSumma` 20000, demak 3000 kabi kichik summada kod xato beradi. Parametr bo'lmagani uchun
  testga boshqa kod ham berib bo'lmaydi. `Math.max(0, ...)` himoya sifatida kodda qoldi, lekin test bilan tekshirilmagan.
- So'raganingizdek, `CLAUDE.md` ga tegilmadi, shuning uchun rejaning 5-qadami bajarilmadi.
```

Bu yerda 2-savolga bergan javobimiz (parametr kerak emas) rejadagi bitta testni imkonsiz qildi. Agent buni yashirmadi,
ochiq aytdi. Endi qaror sizda: tekshirilmagan himoya qatori qolsinmi yoki testlash uchun parametr qaytarilsinmi? Reja
bosqichi bo'lmaganda bunday bog'liqlik ko'rinmay qolishi mumkin edi.

## Qachon reja kerak, qachon ortiqcha

CC (Best practices) boshlang'ich nuqtani aytadi: ko'p hollarda toza sessiyadagi birinchi oddiy so'rov allaqachon to'g'ri ishni
qiladi. Reja — har vazifaga emas, faqat ma'lum holatlar uchun. Rasmiy hujjatlardagi mezonlardan amaliy qoida:

| Holat | Reja kerakmi |
| --- | --- |
| Bitta faylda kichik, aniq o'zgarish (xatoni tuzatish, nom o'zgartirish) | Yo'q, darhol topshiring (6-bob) |
| Biznes qarorlari hali qabul qilinmagan | Ha: plan mode yoki suhbat orqali spetsifikatsiya |
| Ko'p faylga tegadigan o'zgarish, uni boshlashdan oldin ko'rmoqchisiz | Ha: plan mode |
| Notanish kod bazasi, avval tushunib olish kerak | Ha: plan mode'da o'rganish (17-bob) |
| Natijani keyin `/rewind` bilan oson qaytarish mumkin bo'lgan tajriba | Shart emas: CC bo'yicha avval dadil yo'lni sinab, yoqmasa orqaga qaytish xavfi kam (9-bob) |

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Darhol topshirish | Tez, kam qadam | Agent biznes qarorlarini o'zi taxmin qiladi | Kichik, aniq vazifa |
| Plan mode | Kod yozilishidan oldin yo'l va savollar ko'rinadi; reja qisqartirishdan keyin ham saqlanadi | Qo'shimcha bosqich va token | Katta yoki noaniq o'zgarish |
| Suhbat orqali spetsifikatsiya (`SPEC.md`) | Talablar yozma bo'ladi; keyin tekshiruv uchun asos bo'ladi | Eng uzun yo'l | Nima istashingiz o'zingizga ham noaniq |
| Reja + yangi sessiyada qurish | Qurish toza kontekstda, yozma reja bilan boshlanadi | Rejani faylga saqlash kerak | Reja bosqichi uzoq cho'zilgan va kontekst to'lgan bo'lsa |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Rejani o'qimasdan tasdiqlash | Rejaning asosiy qiymati — ochiq savollar va taxminlar | Har bir taxminni ko'ring, savollarga javob bering |
| Tasdiq oynasida rejimdan chiqish uchun `Shift+Tab` bosish | CC: u yerda `Shift+Tab` rejani tasdiqlaydi | Avval `Esc`, keyin `Shift+Tab` |
| Har kichik vazifaga plan mode | CC: ko'p hollarda birinchi oddiy so'rov to'g'ri ishlaydi | Rejani katta yoki noaniq vazifaga qoldiring |
| Uzoq reja suhbatidan keyin shu sessiyada qurishni davom ettirish | Kontekst muhokama va rad etilgan variantlar bilan to'lgan | CC: spetsifikatsiyani faylga yozib, yangi sessiyada quring |
| Agent hisobotidagi "rejadan farqlar"ni o'tkazib yuborish | Javoblaringiz rejaning boshqa qismlariga ta'sir qilgan bo'lishi mumkin | Har bir farq bo'yicha qaror qiling |

## Amaliyot

1. Plan mode'da agent nima qila oladi va nima qila olmaydi?
2. Plan mode'ga kirishning uchta yo'lini ayting.
3. Rejani tasdiqlashda qanday tanlovlar bor?
4. Nima istashingiz aniq bo'lmaganda CC qaysi usulni tavsiya qiladi va keyingi qadam nima?
5. Tajribada reja bosqichi qanday foyda berdi?
6. Qanday vazifaga reja shart emas?

<details>
<summary>Javoblar</summary>

1. Fayllarni o'qiydi, o'rganish uchun shell buyruqlarini ishga tushiradi va reja yozadi. Siz tasdiqlamaguningizcha manba fayllarni tahrirlamaydi.
2. Sessiyada `Shift+Tab` (`⏸ plan mode on` chiqquncha), so'rov boshiga `/plan`, `claude --permission-mode plan` (yana: `.claude/settings.json` da `defaultMode: plan`).
3. Tasdiqlab auto rejimda (yoki auto-accept edits) ishlash, tasdiqlab har tahrirni qo'lda tasdiqlash, reja rejimida qolib nimani o'zgartirishni aytish. `Ctrl+G` bilan rejani muharrirda tahrirlash ham mumkin.
4. Agentdan sizni so'roq qilishni so'rash ("Interview me…") va spetsifikatsiyani `SPEC.md` ga yozdirish. Keyin qurishni toza kontekstli yangi sessiyada boshlash.
5. Agent kod yozishdan oldin to'rtta biznes savolini qaytardi (noto'g'ri kod, kodlar qayerda, nechta kod, muddat). Javoblardan keyin agent bitta javob rejadagi testni imkonsiz qilganini ochiq aytdi.
6. Bitta faylda kichik, aniq o'zgarishga yoki `/rewind` bilan oson qaytariladigan tajribaga.

</details>

## Rasmiy hujjat

- [CC: Choose a permission mode — Analyze before you edit with plan mode](https://code.claude.com/docs/en/permission-modes#analyze-before-you-edit-with-plan-mode)
- [CC: Common workflows — Plan before editing](https://code.claude.com/docs/en/common-workflows#plan-before-editing)
- [CC: Best practices — Brainstorm with Claude first](https://code.claude.com/docs/en/best-practices#brainstorm-with-claude-first)
- [CC: Explore the context window — What survives compaction](https://code.claude.com/docs/en/context-window#what-survives-compaction)
- [CX: Working with agents — Give the agent a clear assignment](https://learn.chatgpt.com/codex/working-with-agents)
