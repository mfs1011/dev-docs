# 40 — Model va fikrlash darajasini tanlash

[Mundarija](README.md)

## Tushuncha

Agent ishining sifati, tezligi va narxi ikki sozlamaga bog'liq:

- **Model** — qaysi "miya" ishlaydi: kuchliroq model murakkab vazifani yaxshiroq yechadi, lekin qimmatroq va sekinroq.
- **Fikrlash darajasi** (effort) — model har qadamda qancha o'ylashi. CC (Model configuration): effort **moslashuvchan fikrlash**ni
  (adaptive reasoning) boshqaradi — model vazifa murakkabligiga qarab har qadamda o'ylash kerakmi va qancha, o'zi hal qiladi. Past
  daraja tezroq va arzonroq, yuqori daraja chuqurroq o'ylaydi.

### Modellar

Claude Code'da model **taxallus** (alias) yoki to'liq nom bilan tanlanadi. Taxalluslar provayderingiz uchun tavsiya etilgan versiyaga
ishora qiladi va vaqt o'tishi bilan yangilanadi (CC, Model configuration):

| Taxallus | Vazifasi (hujjat bo'yicha) | Anthropic API'da hozir |
| --- | --- | --- |
| `fable` | Eng qiyin va uzoq davom etadigan vazifalar | Fable 5.2 |
| `opus` (`best`) | Murakkab mulohaza talab qiladigan vazifalar | Opus 5.5 |
| `sonnet` | Kundalik kodlash vazifalari | Sonnet 5.5 |
| `haiku` | Oddiy vazifalar uchun tez va tejamkor | Haiku 5.5 |
| `opusplan` | Reja rejimida `opus`, bajarishda `sonnet` | — |
| `default` | Hisob turi bo'yicha standart; Pro, Max, Ultra, Team, Enterprise va API'da — Opus 5.5 | — |

Boshqa provayderlarda (Bedrock, Foundry va h.k.) taxalluslar eskiroq versiyaga ishora qilishi mumkin. Versiyani qotirish uchun to'liq
nom (`claude-opus-5-5`) yoki `ANTHROPIC_DEFAULT_OPUS_MODEL` kabi o'zgaruvchi ishlatiladi.

**Fable** haqida CC alohida yozadi: Claude Code'dagi eng kuchli modellar, bir o'tirishdan katta vazifalar uchun; uzoq mustaqil
sessiyalarni ko'taradi, harakatdan oldin tekshiradi va ishini kichik modellarga qaraganda ko'proq tekshiradi. Hech bir rejada standart
emas — `/model fable` bilan tanlanadi. Rejangizga qarab Fable ishlatilishi rejaning limiti o'rniga **qo'shimcha kreditlar** (usage
credits) hisobidan to'lanishi mumkin; `-p` rejimida Claude Code bunga rozilik so'ramaydi. Fable'dan foydalanish bo'yicha tavsiyalar:
qadamlarni emas, natijani tasvirlang; noaniq muammolarni (sababni topish, arxitektura qarori) bering; tekshirish eslatmalari odatda
kerak emas.

Ro'yxat narxlari (Anthropic API, 1 million token uchun, platform.claude.com pricing, 2026-11-17):

| Model | Kirish (input) | Chiqish (output) | Keshdan o'qish |
| --- | --- | --- | --- |
| Fable 5.2 | $8 | $40 | $0.20 |
| Opus 5.5 | $4 | $20 | $0.20 |
| Sonnet 5.5 | $2 | $10 | $0.10 |
| Haiku 5.5 (so'rov 100 000 tokengacha) | $0.10 | $0.50 | $0.01 |

Obunada (Pro, Max, Ultra) bu narxlar to'g'ridan-to'g'ri to'lanmaydi, lekin rejaning limitidan qancha ishlatilishini aynan token miqdori
belgilaydi.

### Effort darajalari

Opus 5.5, Sonnet 5.5, Haiku 5.5 va Fable modellarida beshta daraja bor: `low`, `medium`, `high`, `xhigh`, `max`. Bu to'rt model
uchun standart — **`medium`**. CC (Model configuration va Best practices) har biri qachon kerakligini aytadi:

| Daraja | Qachon |
| --- | --- |
| `low` | Har natijani o'zingiz ko'rib chiqadigan tez almashinuv: g'oya, birinchi qoralama, bir nechta fayldagi nomni o'zgartirish |
| `medium` | Aniq doirali kundalik ish, masalan yangi funksiya qo'shish |
| `high` | Tekshirish muhim yoki chekka holatlar ehtimoli katta: o'zingiz yozmagan koddagi xato, beqaror test, sxema o'zgarishi |
| `xhigh` | Ko'proq token evaziga chuqurroq mulohaza |
| `max` | Siz aralashmasdan yechilishi kerak bo'lgan qiyin muammo (masalan, xavfsizlik zaifligini qidirish). Oddiy vazifada ortiqcha o'ylaydi — `high` dan yaxshi bo'lmagan javob uchun ko'proq to'laysiz |

CC: yuqoriroq darajada Claude ko'proq chekka holatni sinaydi, ishini ko'proq tekshiradi va **o'zi ko'proq qaror qabul qiladi**. Past
darajada boshlang'ich natijani tezroq beradi. Effort shkalasi har model uchun alohida sozlangan: bir xil nom turli modellarda bir xil
qiymat degani emas.

Ikki muhim tafsilot:

- **"Think hard" kalit so'z emas.** CC: "think", "think hard", "think more" oddiy matn sifatida o'tadi. Faqat **`ultrathink`** so'zi
  tanilib, shu navbat uchun chuqurroq mulohaza so'raydi (terminalda kamalak rangda ko'rinsa, navbatni `xhigh` ga ham ko'taradi).
  Bitta qiyin savol uchun sozlamani o'zgartirish o'rniga shu so'zni ishlating.
- **Fikrlashni o'chirib bo'lmaydi.** Opus 5.5, Sonnet 5.5, Haiku 5.5 va Fable'da fikrlash doim yoqiq; uni kamaytirish yo'li — effort'ni
  pasaytirish. Fikrlash tokenlari chiqish tokeni sifatida hisoblanadi (CC, Costs).

### Qanday o'rnatiladi

| Nima | Sessiyada | Ishga tushirishda | Doimiy |
| --- | --- | --- | --- |
| Model | `/model <taxallus>` yoki `/model` (tanlash oynasi) | `claude --model sonnet` | `settings.json` dagi `model`, `ANTHROPIC_MODEL` |
| Effort | `/effort high`, `/effort` (slayder), `/model` dagi slayder | `claude --effort high` | `modelSettings` (har model uchun), `effortLevel`, `CLAUDE_CODE_EFFORT_LEVEL` |
| Bitta navbat | `ultrathink` so'zi | — | — |
| Skill yoki subagent | — | — | Frontmatter'da `model:` va `effort:` |

`/effort` bilan tanlangan daraja (Enter bilan) shu model uchun standart bo'lib saqlanadi; `s` bosilsa faqat shu sessiyaga. `max`
faqat joriy sessiyaga qo'llanadi. `-p` rejimida `/effort` ham faqat shu sessiyaga ta'sir qiladi.

### Subagentlar

CC (Costs, Best practices): sessiyani Opus'ga o'tkazsangiz, modelni meros oladigan subagentlar ham Opus'da ishlaydi. Oddiy ish
qiladigan subagent (masalan, modulni import qiladigan fayllarni yig'ish, havolalarni tekshirish) uchun ta'rifida `model: haiku`
qo'ying (30-bob). Subagent asosiy modeldagi effort'ni faqat **bir xil modelda** meros oladi; boshqa modelda o'z `effort` i kerak.

## Amalda: bitta vazifa — to'rt sozlama

Sinov repo'sida bo'lib to'lash funksiyasi:

```js
// Talab: to'lovlar yig'indisi aynan summaga teng bo'lishi kerak.
export function bolibTolash(summa, oylar) {
  const oylik = Math.round(summa / oylar);
  return Array.from({ length: oylar }, () => oylik);
}
```

`bolibTolash(100, 3)` → `[33, 33, 33]` (yig'indi 99). Bir xil so'rov to'rt sozlamada, har biri repo'ning toza nusxasida, `-p` bilan:

```text
tolov.js dagi bolibTolash funksiyasida xato bor: ba'zi summalarda oylik to'lovlar yig'indisi umumiy summaga teng chiqmaydi.
Tuzat, testlar qo'sh va npm test bilan tekshir. Commit qilma.
```

```bash
claude -p "$P" --model haiku --effort low   ...
claude -p "$P" --model sonnet --effort medium ...
claude -p "$P" --model opus --effort medium ...
claude -p "$P" --model opus --effort high ...
```

Natijani agent ko'rmagan **yashirin tekshiruv** baholadi: 0–3000 so'm va 1–13 oy uchun 5 577 ta kombinatsiyada yig'indi, butunlik va
oylar orasidagi farq ≤ 1, shuningdek noto'g'ri kiritishlar (`oylar` = 0, manfiy, kasr; kasr summa).

| Sozlama | Narx (ro'yxat narxi bo'yicha) | Vaqt | Navbatlar | Yig'indi xatosi | Kiritishni tekshirish | Testlar |
| --- | --- | --- | --- | --- | --- | --- |
| Haiku, `low` | $0.0052 | 16 s | 7 | 0 | yo'q | 4 |
| Sonnet, `medium` | $0.0847 | 23 s | 7 | 0 | yo'q | 3 |
| Opus, `medium` | $0.1671 | 28 s | 6 | 0 | bor (`RangeError`) | 5 |
| Opus, `high` | $0.2219 | 43 s | 11 | 0 | bor (manfiy summaga ruxsat) | 7 |

Narx `-p` natijasidagi `total_cost_usd` — Claude Code token sonidan ro'yxat narxi bo'yicha hisoblagan **taxmin** (CC, Costs).

Nimani ko'ramiz:

1. **Asosiy xatoni to'rttalasi ham tuzatdi**, bir xil usulda: `Math.floor` + qoldiqni birinchi oylarga 1 so'mdan taqsimlash. Bunday aniq,
   kichik vazifada Haiku Opus'dan ~32 baravar arzon (o'sha natija uchun).
2. **Farq chekka holatlarda.** Opus ikkala darajada ham so'ralmagan, lekin mantiqiy narsani qo'shdi — `oylar = 0` dagi jim bo'sh
   ro'yxat o'rniga xato. Va buni javobida alohida aytdi: "Siz so'ramagan qo'shimcha o'zgarish". Opus `high` manfiy summaga
   ruxsat berdi (`[-33, -33, -34]`, yig'indi to'g'ri) — bu xato emas, boshqa dizayn qarori.
3. **Yuqori effort — ko'proq tekshirish.** Opus `high` eng ko'p test yozdi va yangi testlar eski kodda yiqilishini ham tekshirmoqchi
   bo'ldi (ruxsat berilmagani uchun qila olmadi va buni ochiq aytdi). Bu CC'dagi "ko'proq chekka holat, ko'proq tekshirish" tavsifiga mos.
4. **Bu bitta urinish.** Model javoblari deterministik emas; ikkinchi ishga tushirish boshqa natija berishi mumkin. Jadval "qaysi
   model yaxshi" degan reyting emas, farq **qayerda** paydo bo'lishini ko'rsatadi.

Xulosa: aniq doirali, natijasini o'zingiz tekshiradigan vazifada arzon model yetarli bo'lishi mumkin. Chekka holatlar va "nimani
so'ramagan bo'lsam ham o'ylab ko'r" muhim bo'lsa — kuchliroq model yoki yuqoriroq effort.

## Tanlash tartibi

| Vazifa | Tavsiya | Asos |
| --- | --- | --- |
| Kundalik funksiya, aniq doira | Standart (Opus 5.5, `medium`) yoki arzonroq uchun Sonnet | CC Best practices: standart Opus 5.5 ko'p kodlashni yaxshi bajaradi, Sonnet oddiy ishda arzonroq |
| Tez almashinuv, har qadamni o'zingiz ko'rasiz | `/effort low` | CC: boshlang'ich natija tezroq |
| O'zgalar kodidagi xato, beqaror test, migratsiya | `/effort high` yoki `xhigh` | CC: chekka holatlar ko'p |
| Bitta qiyin savol oddiy ish orasida | `ultrathink` | Sozlamani o'zgartirmasdan |
| Katta noaniq vazifa, uzoq mustaqil ish | `/model fable` | CC: Fable uzoq sessiya va o'z-o'zini tekshirish uchun |
| Arxitektura rejasi, keyin bajarish | `opusplan` | Reja — Opus, bajarish — Sonnet |
| Oddiy subagent (qidirish, yig'ish) | `model: haiku` | CC Costs |
| Xavfsizlik zaifligini qidirish | `max` | CC: siz aralashmasdan yechiladigan qiyin muammo |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Har doim `max` | CC: oddiy vazifada ortiqcha o'ylaydi, `high` dan yaxshi bo'lmagan javob uchun ko'proq to'lanadi | Standart `medium`, kerakda ko'tarish |
| "Think hard" yozib, chuqurroq o'ylaydi deb kutish | CC: bu kalit so'z emas, oddiy matn | `ultrathink` yoki `/effort` |
| Opus 5'dagi `high` ni Opus 5.5 ga ko'chirish | CC: Opus 5.5 `medium` da Opus 5 `high` ga teng yoki undan yaxshi | `medium` dan boshlash |
| Sessiyani Opus'ga o'tkazib, subagentlarni unutish | Ular ham Opus'da ishlaydi | Oddiy subagentga `model: haiku` |
| Bitta sinovdan "X model yaxshiroq" degan xulosa | Javoblar deterministik emas | O'z vazifalaringizda bir necha marta sinash |
| Taxallusni versiya deb bilish | Taxallus vaqt o'tishi bilan yangilanadi | Kerak bo'lsa to'liq nom bilan qotirish |
| `-p` skriptida Fable tanlab, narxni kuzatmaslik | `-p` da kreditlar uchun rozilik so'ralmaydi | `--max-budget-usd` (33-bob), model tanlovini aniq qilish |

## Amaliyot

1. Model va effort nimani boshqaradi?
2. Opus 5.5 uchun standart effort qaysi va qachon uni ko'tarish yoki pasaytirish kerak?
3. "think hard" va `ultrathink` ning farqi nima?
4. Tajribada qaysi sozlama eng arzon edi va natija sifatida nimasi bilan farq qildi?
5. Subagent qaysi modelda ishlaydi va uni qanday arzonlashtirish mumkin?
6. Nega bitta tajriba asosida model tanlab bo'lmaydi?

<details>
<summary>Javoblar</summary>

1. Model — qaysi model ishlaydi (kuch, tezlik, narx); effort — model har qadamda qancha o'ylashi (moslashuvchan fikrlash).
2. `medium`. Chekka holatlar ko'p bo'lsa (o'zgalar kodidagi xato, beqaror test, sxema o'zgarishi) — `high`/`xhigh`; tez almashinuvda — `low`; qiyin mustaqil vazifada — `max`.
3. "think hard" oddiy matn sifatida o'tadi; `ultrathink` kalit so'z — shu navbat uchun chuqurroq mulohaza so'raydi va terminalda navbatni `xhigh` ga ko'taradi.
4. Haiku `low` ($0.0052). Asosiy xatoni to'g'ri tuzatdi, lekin noto'g'ri kiritishlarni (`oylar = 0` va h.k.) tekshirishni qo'shmadi; Opus ikkala darajada qo'shdi.
5. Standart holatda asosiy sessiya modelini meros oladi. Oddiy vazifa uchun ta'rifida `model: haiku`.
6. Model javoblari deterministik emas; bitta urinish farq qayerda bo'lishini ko'rsatadi, lekin ishonchli reyting bermaydi. O'z vazifalaringizda bir necha marta sinash kerak.

</details>

## Rasmiy hujjat

- [CC: Model configuration — aliases, Fable, effort, ultrathink, extended thinking](https://code.claude.com/docs/en/model-config)
- [CC: Manage costs — Choose the right model, Adjust extended thinking](https://code.claude.com/docs/en/costs#choose-the-right-model)
- [CC: Best practices — Change the model and effort, Know what subagents cost](https://code.claude.com/docs/en/best-practices#change-the-model-and-effort)
- [Claude Platform: Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
