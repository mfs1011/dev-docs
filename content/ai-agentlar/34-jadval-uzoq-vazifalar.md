# 34 — Jadval bo'yicha va uzoq vazifalar

[Mundarija](README.md)

> ⚑ Bu bob rasmiy hujjat asosida yozilgan. Rejalashtirilgan vazifalar (bulutda va desktop'da) va `/loop` amalda sinalmagan: ular ochiq
> interaktiv sessiya yoki claude.ai hisobidagi bulut sozlamasini talab qiladi va vaqt o'tishini kutadi. Kuzatuvsiz ishning poydevori —
> tekshiruv (8-bob), cheklangan ruxsatlar (35-bob) va skript rejimi (33-bob) — haqiqiy sessiyalarda ko'rsatilgan.

## Tushuncha

Ko'p ish takrorlanadi: har ertalab PR'larni ko'rib chiqish, kechasi CI xatolarini tahlil qilish, har hafta bog'liqliklarni tekshirish.
Ba'zi ishlar esa juda uzoq: katta migratsiya bir necha soat yoki bir necha kontekst oynasi davom etadi. Bu bob ikki savolga javob
beradi: agentni **qanday ishga tushirish** (jadval, hodisa) va siz yo'qligingizda u **qanday to'g'ri ishlashi**.

CC (Best practices) muhim kuzatishni aytadi: ish boshlangach, Claude uzoq vazifani o'zi oxiriga yetkaza oladi. Lekin u bitta narsani
qila olmaydi — **boshlashni o'zi hal qilish**. Uni kimdir boshlashi kerak: siz, taymer yoki hodisa (yiqilgan CI tekshiruvi, yangi PR).

### Uch xil rejalashtirish

CC (Run prompts on a schedule):

| | Bulut (cloud scheduled task) | Desktop | `/loop` |
| --- | --- | --- | --- |
| Qayerda ishlaydi | Bulutda (standart holatda Anthropic boshqaradi) | Sizning kompyuteringizda | Sizning kompyuteringizda |
| Kompyuter yoqiq bo'lishi kerakmi | Yo'q | Ha | Ha |
| Ochiq sessiya kerakmi | Yo'q | Yo'q | Ha |
| Qayta ishga tushirishdan keyin | Saqlanadi | Saqlanadi | `--resume` da tiklanadi (istisnolar bilan) |
| Lokal fayllarga kirish | Yo'q (yangi klon) | Ha | Ha |
| Ruxsat so'rovlari | Standart holatda auto mode | Har vazifa uchun sozlanadi | Sessiyadan meros |
| Eng kichik interval | 1 soat | Claude o'rnatsa 1 daqiqa | 1 daqiqa |

CC tavsiyasi:

- kompyuteringizsiz ishonchli ishlashi kerak bo'lgan ish uchun — **bulut**;
- lokal fayl va vositalar kerak bo'lsa — **desktop**;
- sessiya davomida tez-tez tekshirish uchun — **`/loop`**.

### `/loop`

CC (scheduled tasks) — `/loop` ochiq sessiya davomida so'rovni qayta-qayta ishga tushiradi:

| Nima berasiz | Misol | Nima bo'ladi |
| --- | --- | --- |
| Interval va so'rov | `/loop 5m check the deploy` | Belgilangan oraliqda |
| Faqat so'rov | `/loop check the deploy` | Oraliqni Claude har safar o'zi tanlaydi |
| Hech narsa | `/loop` | O'rnatilgan texnik xizmat so'rovi (yoki sizning `loop.md`) |

CC (Best practices) misoli:

```text
/loop 15m check CI on this branch, and if it's red pull the failing job's log, fix it and push
```

Hujjat ogohlantiradi: har ishga tushirish shu sessiyadagi yana bir navbat, shuning uchun uni uzun suhbatda qoldirmang. Cheklovlar (CC):

- vazifalar faqat Claude Code ishlab turganda va bo'sh bo'lganda ishga tushadi; terminalni yopsangiz, to'xtaydi;
- o'tkazib yuborilganlar uchun "quvib yetish" yo'q: band paytda vaqti kelgan vazifa bo'shaganda bir marta ishlaydi;
- takrorlanadigan vazifalar yaratilganidan **7 kun** o'tgach o'zi o'chadi — unutilgan sikl cheksiz ishlamasligi uchun.

### Bulutdagi rejalashtirilgan vazifalar

CC (Automate work with scheduled tasks): bulutdagi rejalashtirilgan vazifa (oldingi nomi — routine) — saqlangan Claude Code sozlamasi:
so'rov, bir yoki bir nechta repo va connector'lar. U Anthropic boshqaradigan bulutda bajariladi, shuning uchun noutbukingiz yopiq
bo'lsa ham ishlaydi. Hozircha tadqiqot preview'i. Har vazifaga bir yoki bir nechta trigger ulanadi:

| Trigger | Qachon ishlaydi |
| --- | --- |
| **Jadval** | Har soat, har kecha, har hafta yoki bir marta belgilangan vaqtda |
| **API** | Vazifaning o'z endpoint'iga bearer token bilan HTTP POST yuborilganda |
| **GitHub** | Repo hodisalarida: PR, reliz va hokazo |

Yaratish: claude.ai/code/routines yoki CLI'da `/schedule`. CC (Best practices) bo'yicha u API kaliti emas, claude.ai login'ini talab
qiladi. Hujjat ogohlantiradi: bulut vazifasini kuzatuvsiz qoldirishdan oldin `main` ni vazifa chetlab o'ta olmaydigan **GitHub branch
qoidasi** bilan himoyalang va yangi vazifaning **birinchi bir necha ishga tushirishini kuzating**.

### Maqsadga qadar ishlash: `/goal`

8-bobda ko'rgan `/goal` — sessiya uchun tugash sharti. CC (Keep Claude working toward a goal): har navbatdan keyin alohida model
shart bajarilganini tekshiradi. Bajarilmagan bo'lsa, Claude sizga qaytmasdan keyingi navbatni boshlaydi. Hujjatdagi misollar:

- modulni yangi API'ga ko'chirish — har chaqiruv joyi kompilyatsiya bo'lguncha va testlar o'tguncha;
- dizayn hujjatini amalga oshirish — barcha qabul mezonlari bajarilguncha;
- katta faylni o'lcham chegarasidan kichik modullarga bo'lish;
- belgilangan issue'lar navbatini bo'shaguncha bajarish.

## Kuzatuvsiz ish uchun beshta savol

CC (Best practices, "Let Claude run without you"): siz yo'qligingizda har xato qimmatlashadi. Kuzatayotganingizda Claude kontekstni
o'tkazib yuborsa, bir-ikki xabarda sezasiz. Uxlashdan oldin boshlangan ishda esa uni hech kim to'xtatmaydi va ertalab u butun
tunni noto'g'ri taxmin ustida qurganini bilasiz. Shuning uchun har kuzatuvsiz vazifadan oldin beshta savol:

| Savol | Javob nima bo'lishi mumkin | Bob |
| --- | --- | --- |
| 1. "Tayyor" nimaligini biladimi? | `/goal` sharti, spetsifikatsiya fayli yoki yashil bo'lishi kerak bo'lgan yiqilgan test | 7, 8 |
| 2. O'z ishini tekshira oladimi? | Test to'plami, Stop hook, review qadami | 8, 22 |
| 3. Nimaga tega oladi? | Ruxsat qoidalari, `dontAsk`, sandbox, worktree, push qilish mumkin bo'lgan bitta branch | 31, 35, 36 |
| 4. Uni nima to'xtatadi? | `--max-turns`, `--max-budget-usd`, xarajat chegarasi | 33, 41 |
| 5. Natija qayerga boradi va kim tasdiqlaydi? | PR, izoh yoki xulosa — keyin merge, deploy yoki qaytarib bo'lmaydigan har narsani inson tasdiqlaydi | 21, 22 |

CC'dagi skript namunasi beshala savolga javob beradi:

```bash
for file in $(cat files.txt); do
  claude --bare -p "Migrate $file to the new logger API and commit. Reply OK or FAIL." \
    --allowedTools "Read,Edit,Bash(git add *),Bash(git commit *)" \
    --permission-mode dontAsk \
    --max-turns 20
done
```

Bunda nimaga tegish (`--allowedTools`, `dontAsk` — boshqa hamma narsa rad etiladi) va nima to'xtatish (`--max-turns`) bor. Natija
`OK` yoki `FAIL` ko'rinishida qaytadi, navbat chegarasiga yetgan ish xato bilan chiqadi. Hujjat maslahati: **avval uchta faylda
sinang**, nima noto'g'ri ketganini ko'ring, so'rovni tuzating, keyin qolganini ishga tushiring.

## Bir nechta kontekst oynasiga cho'ziladigan vazifa

CP (Prompting best practices, "Long-horizon reasoning") bo'yicha yangi modellar uzoq vazifalarda holatni yaxshi kuzatadi: bir vaqtda
bir nechta narsada bosqichma-bosqich oldinga siljiydi. Bu ayniqsa vazifa bir nechta kontekst oynasiga cho'zilganda ko'rinadi: Claude
ishlaydi, holatni saqlaydi va yangi kontekst bilan davom etadi.

CP'dagi tavsiyalar:

| Tavsiya | Mazmuni |
| --- | --- |
| Birinchi oyna boshqacha | Birinchi kontekstda poydevor yaratiladi: testlar, sozlash skriptlari. Keyingilarida vazifalar ro'yxati bo'yicha takrorlanadi |
| Testlar tuzilmali formatda | Ishdan oldin testlar yaratilib, `tests.json` kabi faylda kuzatiladi. "Testlarni o'chirish yoki o'zgartirish qabul qilinmaydi" deb eslatiladi |
| Qulaylik vositalari | Serverlarni ishga tushirish, testlar va lint'ni yuritish uchun `init.sh` kabi skriptlar: har yangi oynada qayta qilinmaydi |
| Yangi oyna yoki qisqartirish | Yangi modellar holatni lokal fayllardan juda yaxshi tiklaydi. Ba'zan qisqartirish o'rniga yangi oyna yaxshiroq: "progress.txt, tests.json va git logini ko'rib chiq" |
| Tekshiruv vositalari | Vazifa uzaygani sari agentga inson fikrisiz to'g'rilikni tekshirish imkoni kerak |

**Holatni saqlash** (CP):

- tuzilmali ma'lumot (test natijalari, vazifa holati) uchun — JSON;
- umumiy rivojlanish eslatmalari uchun — erkin matn (`progress.txt`);
- **git** — nima qilinganini ko'rsatadigan log va qaytariladigan nazorat nuqtalari.

CP'dagi namuna:

```json
{
  "tests": [
    { "id": 1, "name": "authentication_flow", "status": "passing" },
    { "id": 2, "name": "user_management", "status": "failing" },
    { "id": 3, "name": "api_endpoints", "status": "not_started" }
  ],
  "total": 200,
  "passing": 150,
  "failing": 25,
  "not_started": 25
}
```

```text
// Progress notes (progress.txt)
Session 3 progress:
- Fixed authentication token validation
- Updated user model to handle edge cases
- Next: investigate user_management test failures (test #2)
- Note: Do not remove tests as this could lead to missing functionality
```

**Ikki manbaning farqi.** CP'da "kontekst tugashidan qo'rqib ishni erta to'xtatma, imkon qadar qat'iyatli bo'l" degan namuna
ko'rsatma bor. CC (Best practices, "What you can stop doing") esa "davom et, tugaguncha aylan, dangasa bo'lma" kabi qatorlarni
eskirgan deb hisoblaydi: hozirgi modellar kelishilgan vazifani o'zi davom ettiradi, bunday qatorlar esa ortiqcha ishga olib kelishi
mumkin. Claude Code'da kuzatuvsiz ish uchun CC yo'li: `/goal` yoki Stop hook (8-bob). CP ko'rsatmasi API orqali o'z agentingizni
yasaganda foydaliroq (X qism).

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| `/loop` | Darhol, sozlashsiz | Ochiq sessiya kerak; 7 kunda o'chadi | Sessiya davomida tez-tez tekshirish |
| Desktop rejalashtirilgan vazifa | Lokal fayllar va vositalar | Kompyuter yoqiq bo'lishi kerak | Lokal muhit kerak takroriy ish |
| Bulut rejalashtirilgan vazifa | Kompyutersiz; jadval, API va GitHub triggerlari | Lokal fayllar yo'q; tadqiqot preview'i | Ishonchli takroriy ish |
| CI `schedule` (33-bob) | Mavjud CI ichida | Actions daqiqalari va sozlash | GitHub repo'dagi takroriy ish |
| Skript sikli (`claude -p` + `dontAsk` + `--max-turns`) | To'liq nazorat, cheklovlar aniq | Ishga tushirish sizda | Ko'p faylga bir xil o'zgarish |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| "Tayyor" mezonisiz kuzatuvsiz vazifa | CC: ertalab butun tun noto'g'ri taxmin ustida qurilganini bilasiz | `/goal`, spetsifikatsiya yoki yiqilgan test |
| Chegarasiz ishga tushirish | Navbat va xarajat cheksiz o'sishi mumkin | `--max-turns`, `--max-budget-usd` |
| Yangi vazifani darhol hammasiga qo'llash | CC: avval uchta faylda sinash | Kichik bo'lak → so'rovni tuzatish → qolgani |
| Bulut vazifasida `main` himoyasiz | CC: vazifa chetlab o'ta olmaydigan branch qoidasi kerak | GitHub branch protection |
| `/loop` ni uzun suhbatda qoldirish | CC: har ishga tushirish — yana bir navbat | Alohida, qisqa sessiya |
| "Dangasa bo'lma, tugaguncha davom et" deb yozish | CC: eskirgan; ortiqcha ishga olib kelishi mumkin | Tekshiriladigan shart (`/goal`, Stop hook) |
| Natija kim tomonidan tasdiqlanishini belgilamaslik | Qaytarib bo'lmaydigan amal (merge, deploy) tekshiruvsiz ketadi | PR + inson tasdig'i |

## Amaliyot

1. Claude uzoq vazifani o'zi oxiriga yetkaza olsa ham, nimani o'zi qila olmaydi?
2. Bulut, desktop va `/loop` rejalashtirishning asosiy farqi nima?
3. Bulutdagi rejalashtirilgan vazifaga qanday triggerlar ulanadi?
4. Kuzatuvsiz vazifadan oldin CC qaysi beshta savolni beradi?
5. Bir nechta kontekst oynasiga cho'ziladigan vazifada holatni qanday saqlash tavsiya qilinadi?
6. CP'dagi "qat'iyatli bo'l" ko'rsatmasi va CC'dagi tavsiya qanday farq qiladi?

<details>
<summary>Javoblar</summary>

1. Boshlashni o'zi hal qila olmaydi: uni siz, taymer yoki hodisa boshlashi kerak.
2. Bulut — kompyutersiz va sessiyasiz ishlaydi, lokal fayllar yo'q, eng kichik interval 1 soat. Desktop — kompyuteringizda, sessiyasiz, lokal fayllar bilan. `/loop` — ochiq sessiya ichida, 1 daqiqadan, 7 kunda o'chadi.
3. Jadval (har soat, har kecha, bir marta), API (bearer token bilan HTTP POST) va GitHub (PR, reliz kabi hodisalar).
4. "Tayyor" nimaligini biladimi; o'z ishini tekshira oladimi; nimaga tega oladi; uni nima to'xtatadi; natija qayerga boradi va kim tasdiqlaydi.
5. Tuzilmali ma'lumot uchun JSON (masalan `tests.json`), umumiy eslatmalar uchun erkin matn (`progress.txt`), nima qilinganini kuzatish va nazorat nuqtalari uchun git. Birinchi oynada poydevor (testlar, `init.sh`), keyingilarida ro'yxat bo'yicha takrorlash.
6. CP API orqali ishlaydigan agentga kontekst tugashidan qo'rqib ishni erta to'xtatmaslikni aytadi. CC esa "davom et, dangasa bo'lma" kabi qatorlarni eskirgan deb hisoblaydi va kuzatuvsiz ish uchun `/goal` yoki Stop hook'ni tavsiya qiladi.

</details>

## Rasmiy hujjat

- [CC: Run prompts on a schedule](https://code.claude.com/docs/en/scheduled-tasks)
- [CC: Automate work with scheduled tasks](https://code.claude.com/docs/en/routines)
- [CC: Keep Claude working toward a goal](https://code.claude.com/docs/en/goal)
- [CC: Best practices — Let Claude run without you](https://code.claude.com/docs/en/best-practices#let-claude-run-without-you)
- [CP: Prompting best practices — Long-horizon reasoning and state tracking](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
