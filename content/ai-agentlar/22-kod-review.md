# 22 — Kod review

[Mundarija](README.md)

> ⚑ Bu bobning lokal qismi (`/code-review`) sinov kompyuterida tekshirilgan. PR'dagi avtomatik review (Code Review xizmati va
> CI'dagi review) faqat rasmiy hujjat asosida yozilgan: ularni sinash uchun GitHub test repozitoriysi va tegishli tarif kerak
> (README'dagi ochiq savol).

## Tushuncha

Agent yozgan kodni kim tekshiradi? 1-bobdagi javob: **siz**. GH (Best practices) bo'yicha Copilot xato qilishi mumkin va u
taklif qilgan kodni har doim tekshirish kerak. CX (Working with agents) bo'yicha ish ishlatishga tayyormi yoki yo'qligini hal
qilish javobgarligi sizda qoladi.

Lekin review'ni faqat inson qilishi shart emas. Bu bob uch qatlamni ko'rsatadi:

1. **Siz** — agent yozgan kodni nimaga qarab o'qish.
2. **Agentning o'zi** — `/code-review`, `/security-review`, alohida sessiya.
3. **PR darajasida avtomatik** — Code Review xizmati, CI'dagi Claude.

### Inson review'i: nimaga qarash

GH (Best practices) uch qoida beradi:

- **qo'llashdan oldin tushuning** — tushunmasangiz, tushuntirishni so'rang;
- **diqqat bilan ko'rib chiqing** — faqat ishlashi va xavfsizligini emas, o'qilishi va kelajakda qo'llab-quvvatlanishini ham;
- **avtomatik vositalardan foydalaning** — linting, kod skanerlash, IP skanerlash.

CX (Working with agents) chuqurlik haqida aytadi: **review chuqurligi oqibatga mos bo'lsin.** Boshqalarga ta'sir qiladigan,
umumiy ma'lumotni o'zgartiradigan yoki qaytarish qiyin ishga ko'proq e'tibor bering. Bu kitobdagi tajribalardan qo'shimcha
tekshiruv ro'yxati:

| Nimaga qarash | Nega (bob) |
| --- | --- |
| So'ralmagan fayllar o'zgarganmi | Haddan ortiq g'ayrat (11-bob) |
| Test fayllari kod bilan birga o'zgarganmi | Agent testni moslagan bo'lishi mumkin (8, 11-boblar) |
| Agent hisobotidagi "taxminlar", "rejadan farqlar", "tekshirilmagan" | Ochiq qarorlar va tekshirilmagan joylar (7, 8-boblar) |
| Interfeys o'zgarganmi | Chaqiruvchi kod buzilishi mumkin (19-bob) |
| So'rovning hamma qismi bajarilganmi | Agent qismni o'tkazib yuborishi mumkin (18-bob) |

### Agent bilan review: `/code-review`

CC (Review locally with /code-review): `/code-review` (yoki `/review`) — sessiya ichida yoziladigan buyruq. Claude branch'dagi
o'zgarishlarni ko'rib chiqadi, **to'g'rilik xatolarini** (correctness bugs) qidiradi va topganini suhbatda xabar qiladi.
Model va effort darajasiga qarab qayta ishlatish, soddalashtirish va samaradorlik bo'yicha takliflar ham bo'lishi mumkin.

Muhim tafsilot: terminal sessiyasida review **fon subagentida**, o'z kontekst oynasida ishlaydi. Natijada u kod yozilgan
fikrlash yo'lini ko'rmaydi. CC (Best practices) buning foydasini tushuntiradi: review'ni kodni yozgan fikrlash yo'li
og'dirmaydi. Yana bir variant — ikkinchi sessiya: bir sessiya kodni yozadi, ikkinchisi uni yozilishini kuzatmasdan ko'rib
chiqadi.

Nimani ko'rib chiqish (CC):

| Nima | Buyruq |
| --- | --- |
| Joriy branch va commit qilinmagan o'zgarishlar | `/code-review` |
| Oxirgi 15 commit | `/code-review HEAD~15..HEAD` |
| Bir branch boshqasiga nisbatan | `/code-review main...my-feature` |
| PR raqami bo'yicha | `/code-review 1234` |
| Fayl yoki papka | `/code-review src/auth` |

Bayroqlar va effort:

- `--fix` — topilmalarni ishchi daraxtga qo'llaydi (ruxsat rejimingiz orqali);
- `--comment` — topilmalarni GitHub PR'iga inline izoh qilib yozadi;
- **effort darajasi** — `low` da review eng ishonchli topilmalarni beradi (noto'g'ri signal kamroq), `medium` dan `max` gacha
  qamrov kengayadi.

CC ogohlantiradi: fon review'i `--fix` tahrirlarini sessiyangizning checkpoint'laridan tashqarida qiladi. `/rewind` faqat siz
suhbatda tahrirlagan fayllarni qaytaradi, qolganini git bilan qaytarasiz (9-bob). Review CLAUDE.md'ingizga amal qiladi.

### `/security-review`

CC (Commands): `/security-review` joriy branch'dagi o'zgarishlarni xavfsizlik zaifliklari bo'yicha tahlil qiladi: branch va
`origin`'ning standart branch'i orasidagi diff'ni ko'rib, injection, autentifikatsiya muammolari va ma'lumot oqib chiqishi kabi
xavflarni aniqlaydi. U `origin` remote'ini talab qiladi. Xavfsizlik — VII qism.

## Amalda: `/code-review` ikki xatoni topadi

Sinov repo'siga ikkita yashirin xatosi bor commit qo'shildi:

```js
// Yetkazish narxi: 200000 so'm va undan ko'p bo'lsa bepul, aks holda shahar tarifi qo'shiladi
export function yetkazish(summa, shahar) {
  const tarif = { toshkent: 15000, samarqand: 25000 }
  if (summa > 200000) return summa
  return summa + tarif[shahar]
}
```

Commit xabari: `feat: yetkazish — 200000 va undan ko'p bo'lsa bepul`.

Review faqat shu commit uchun, eng ishonchli topilmalar bilan (Claude Code 2.1.325, skript rejimi):

```bash
claude -p "/code-review low HEAD~1..HEAD"
```

Natija:

```text
narx.js:17 — The boundary check is wrong. The comment and the commit message both say delivery is free at 200000 and
above, but the code uses `summa > 200000`. A total of exactly 200000 returns 215000 for toshkent instead of staying at
200000. It should be `>=`.
narx.js:18 — Any city other than toshkent or samarqand (including a mistyped or differently-capitalised name) has no rate,
so `tarif[shahar]` is `undefined` and the function returns `NaN`. For example, `yetkazish(100000, 'buxoro')` gives `NaN`,
with no error or default rate.
```

Ikkala topilmani haqiqiy ishga tushirib tekshirdik:

```bash
node -e "import('./narx.js').then(m=>console.log(m.yetkazish(200000,'toshkent'), m.yetkazish(100000,'buxoro')))"
```

```text
215000 NaN
```

Ikkalasi ham haqiqiy xato. Birinchisini review izoh va commit xabarini kod bilan **solishtirib** topdi. Ya'ni faqat kodni emas,
niyatni ham o'qidi. `low` darajasida faqat shu ikki topilma chiqdi: "uslub" haqida shovqin bo'lmadi.

## PR darajasida avtomatik review ⚑

CC (Code Review) review olishning variantlarini solishtiradi:

| Variant | Review'ni nima boshlaydi | Qayerda ishlaydi | Kim ishlata oladi |
| --- | --- | --- | --- |
| **Code Review** xizmati | PR faolligi (repo sozlamasiga qarab) yoki `@claude review` izohi | Anthropic infratuzilmasi | Team yoki Enterprise tarifidagi, GitHub repo'li tashkilotlar, Owner yoqqandan keyin |
| `/code-review` | Siz branch'ingizda ishga tushirasiz | Claude Code sessiyangiz | Har kim, har qanday tarifda |
| Ultrareview | Claude Code'dan boshlaysiz | Bulut sandbox | claude.ai hisobi bilan kirish kerak |
| O'z CI'ingizda Claude (GitHub Actions, GitLab CI/CD) | Pipeline hodisalari, masalan har PR | O'z CI runner'laringiz | Claude API kaliti yoki bulut provayderi ma'lumotlari bor har kim |
| O'z reviewer'ingiz (subagent yoki skill) | Siz yoki Claude sessiya ichida chaqiradi | Claude Code qayerda ishlasa | Uni yozgan har kim |

CC (Code Review) xizmat haqida ikki muhim gapni aytadi:

- bir nechta agent har o'zgarishni atrofdagi kod bilan birga o'qiydi; topilmalar xabar qilinishidan oldin **tekshirish
  bosqichidan** o'tadi va jiddiylik darajasi bo'yicha inline izohlar bo'lib chiqadi;
- review PR'ni **hech qachon tasdiqlamaydi va bloklamaydi**: merge qarori jamoada qoladi.

Hujjatning ogohlantirishi: Code Review AI yordamida ishlaydi va xatolarni, xavfsizlik zaifliklarini yoki boshqa muammolarni
o'tkazib yuborishi mumkin. **Topilma yo'qligi kod xatosiz yoki xavfsiz degani emas.**

CI'da Claude'ni ishga tushirish — 33-bob.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Faqat inson review'i | Kontekst va biznesni eng yaxshi biladi | Sekin; charchoq | Har doim, oxirgi qaror |
| `/code-review low` | Kam shovqin, eng ishonchli topilmalar | Ba'zi xatolar qamrovdan chiqishi mumkin | Har o'zgarishdan keyin tez tekshiruv |
| `/code-review high` va undan yuqori | Kengroq qamrov | Ko'proq token, ko'proq topilma — saralash kerak | Katta yoki xavfli o'zgarish |
| Spetsifikatsiyaga solishtirish (8-bob) | Talablar bajarilganini tekshiradi | `SPEC.md` kerak | Reja bilan qilingan ish |
| `/security-review` | Xavfsizlikka qaratilgan | `origin` remote kerak; faqat diff | Autentifikatsiya, kirish ma'lumoti, tashqi kirish bilan ishlaydigan kod |
| Code Review / CI ⚑ | Har PR'da, hech kim unutmaydi | Tarif yoki CI sozlash kerak | Jamoa repo'si |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| "Review topilmasi yo'q — demak xato yo'q" | CC: topilma yo'qligi xatosizlik kafolati emas | Review — qatlamlardan biri; testlar va inson review'i qoladi |
| Har bir topilmani tuzatish | CC (8-bob): tekshiruvchi har doim nimadir topadi | To'g'rilikka ta'sir qiladiganini tuzating, uslubni o'tkazing yoki `low` |
| Kodni yozgan sessiyaning o'zidan "o'zingni tekshir" deb so'rash | Bir xil fikrlash yo'li bir xil xatoni ko'rmaydi | `/code-review` (alohida kontekst) yoki ikkinchi sessiya |
| `--fix` dan keyin `/rewind` bilan qaytarishni kutish | CC: fon review tahrirlari checkpoint'dan tashqarida | Git bilan qaytaring |
| Hamma o'zgarishga bir xil chuqurlik | CX: chuqurlik oqibatga mos bo'lsin | Muhim va qaytarib bo'lmaydigan o'zgarishga chuqurroq review |

## Amaliyot

1. GH bo'yicha agent kodini review qilishning uch qoidasi qaysilar?
2. `/code-review` nega kodni yozgan sessiyadan ko'ra yaxshiroq tekshiruvchi?
3. `low` va `high` effort darajalari review'da qanday farq qiladi?
4. Tajribada review birinchi xatoni qanday topdi?
5. Code Review xizmati PR'ni bloklaydimi? Topilma yo'qligi nimani anglatadi?
6. `/code-review --fix` qilingan o'zgarishni qanday qaytarasiz?

<details>
<summary>Javoblar</summary>

1. Qo'llashdan oldin tushunish, ishlashi va xavfsizligi bilan birga o'qilishi va qo'llab-quvvatlanishini ko'rib chiqish, avtomatik vositalardan (lint, kod skanerlash) foydalanish.
2. Terminalda u alohida kontekstli fon subagentida ishlaydi va kod yozilgan fikrlash yo'lini ko'rmaydi, shuning uchun u review'ni og'dirmaydi.
3. `low` — eng ishonchli topilmalar, noto'g'ri signal kamroq. `medium` dan `max` gacha qamrov kengayadi (ko'proq topilma, ko'proq token).
4. Izoh va commit xabaridagi "200000 va undan ko'p" niyatini koddagi `summa > 200000` bilan solishtirib; aniq 200000 da 215000 qaytishini ko'rsatdi.
5. Yo'q, u hech qachon tasdiqlamaydi va bloklamaydi, qaror jamoada. Topilma yo'qligi kod xatosiz yoki xavfsiz degani emas.
6. Git bilan: fon review tahrirlari checkpoint'lardan tashqarida, `/rewind` ularni qaytarmaydi (foreground rejimida ishlagan review bundan mustasno).

</details>

## Rasmiy hujjat

- [CC: Review locally with /code-review](https://code.claude.com/docs/en/code-review-local)
- [CC: Code Review](https://code.claude.com/docs/en/code-review)
- [CC: Commands — /security-review](https://code.claude.com/docs/en/commands)
- [CC: Best practices — Give Claude a check to run, Run sessions in parallel](https://code.claude.com/docs/en/best-practices)
- [GH: Best practices — Check Copilot's work](https://docs.github.com/en/copilot/get-started/best-practices)
- [CX: Working with agents — Review and guide the work](https://learn.chatgpt.com/codex/working-with-agents)
