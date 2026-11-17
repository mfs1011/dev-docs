# 44 — Jamoada AI bilan ishlash

[Mundarija](README.md)

> ⚑ Jamoa va shaxsiy sozlamalar ustunligi sinov repo'sida tekshirildi. Tashkilot siyosati (managed settings), analitika va
> joriy qilish rejasi — rasmiy hujjat asosida.

## Tushuncha

Bitta dasturchi agentni o'zi xohlagancha sozlaydi. Jamoada esa savollar boshqacha: hamma bir xil qoidalar bilan ishlaydimi? Kim nimaga
ruxsat beradi? Agent yozgan kodni kim tekshiradi? Yangi a'zo qanday boshlaydi?

### Sozlama qatlamlari

CC (Settings files and precedence) — to'rt fayl va tashkilot siyosati:

| Doira | Fayl | Kimga ta'sir qiladi | Nima uchun |
| --- | --- | --- | --- |
| Foydalanuvchi | `~/.claude/settings.json` | Siz, shu kompyuterdagi barcha loyihalarda | Shaxsiy afzalliklar: mavzu, standart model, o'z ruxsat qoidalaringiz |
| Umumiy loyiha | `.claude/settings.json` | Shu papkada ishlaydigan hamma; git'ga commit qilinsa — butun jamoa | Jamoa ruxsatlari, hook'lar, plaginlar, loyihaga kerakli muhit o'zgaruvchilari |
| Lokal loyiha | `.claude/settings.local.json` | Faqat siz, faqat shu loyihada; git'ga tushmaydi | Shaxsiy istisnolar, ulashishdan oldin sinash |
| Boshqariladigan (managed) | `managed-settings.json`, MDM siyosati yoki claude.ai konsolidan | Tashkilot tarqatgan hamma | Xavfsizlik siyosati va muvofiqlik talablari |

Ustunlik tartibi (yuqoridan pastga): **managed → buyruq qatori (`--settings`) → lokal loyiha → umumiy loyiha → foydalanuvchi**. Bir xil
kalit yuqoriroq darajada bo'lsa, o'sha qiymat olinadi. Lekin **ro'yxatlar birlashtiriladi**: `permissions.allow` kabi kalit bir nechta
faylda bo'lsa, ro'yxatlar qo'shiladi — har fayl yozuv qo'sha oladi, boshqasinikini olib tashlay olmaydi. Ruxsatlarda esa deny har doim
allow'dan ustun (35-bob).

Jamoa uchun git'da saqlanadigan narsalar:

| Nima | Qayerda | Bob |
| --- | --- | --- |
| Loyiha qoidalari | `CLAUDE.md`, `.claude/rules/` | 13, 14 |
| Ruxsatlar, hook'lar, plaginlar | `.claude/settings.json` | 26, 29, 35 |
| Takroriy jarayonlar | `.claude/skills/` | 25 |
| Subagentlar | `.claude/agents/` | 30 |
| MCP serverlar | `.mcp.json` | 27 |
| Xavfsizlik qoidalari | `.claude/claude-security-guidance.md` | 39 |

Ba'zi narsalar har jamoa a'zosi papkaga **ishonch** (trust) berguncha kutadi; bir nechta kalit esa repo faylidan umuman ishlamaydi
(masalan, 38-bobdagi `mask`).

## Amalda: jamoa taqiqini shaxsiy fayl ocha olmaydi

Sinov repo'sida jamoa fayli (commit qilingan) va shaxsiy fayl:

```json
// .claude/settings.json — jamoaniki, git'da
{
  "model": "sonnet",
  "permissions": {
    "allow": ["Bash(git status)", "Bash(git log *)"],
    "deny": ["Bash(git push *)", "Read(./.env)"]
  }
}
```

```json
// .claude/settings.local.json — shaxsiy
{
  "model": "haiku",
  "permissions": { "allow": ["Bash(git push *)"] }
}
```

`git status --ignored` lokal faylni `!! .claude/settings.local.json` deb ko'rsatdi — git'ga tushmaydi. So'rov: "1) git log --oneline ni
ko'rsat; 2) git push origin main ni ishga tushir."

```text
MODEL  claude-haiku-5-5
TOOL   Bash  git log --oneline     → fafea47 init
TOOL   Bash  git push origin main  → Permission to use Bash with command git push origin main has been denied.
```

- **Model** — oddiy kalit: lokal fayl (`haiku`) umumiy fayldan (`sonnet`) ustun keldi.
- **Ruxsatlar** — ro'yxat: lokal `allow` jamoaning `deny` iga qo'shildi, lekin deny ustun. Shaxsiy fayl jamoa taqiqini **ocha olmadi**.

Bu jamoa uchun muhim kafolat: xavfsizlik taqiqlarini `.claude/settings.json` ga yozsangiz, har kim o'z faylida ularni bekor qila
olmaydi. Tashkilot darajasida esa managed settings'ni hech qaysi foydalanuvchi fayli yoki `--settings` bekor qila olmaydi.

## Tashkilot siyosati

CC (Security — Team security) jamoa xavfsizligi bo'yicha:

- tashkilot standartlarini **managed settings** bilan majburlash;
- tasdiqlangan ruxsat sozlamalarini **versiya nazorati** orqali ulashish;
- jamoa a'zolarini **xavfsizlik amaliyotlariga o'qitish**;
- foydalanishni **OpenTelemetry** metrikalari bilan kuzatish (42-bob);
- sessiya paytidagi sozlama o'zgarishlarini **`ConfigChange` hook'lari** bilan tekshirish yoki bloklash.

Managed settings'da modelni cheklash: `model` — faqat boshlang'ich qiymat; qulf — `availableModels` va `deniedModels` (40-bob).
Ba'zi xavfsizlik kalitlarida esa aksincha: quyi darajadagi **qattiqroq** qiymat managed'dan ustun keladi. Masalan,
`permissions.blockReadsOutsideWorkingDirectories: true` istalgan doiradan qabul qilinadi; `maxEffortLevel` da eng past chegara amal
qiladi.

## Review madaniyati

Agent yozgan kod — jamoa kodi. CC va boshqa rasmiy manbalardagi qoidalar jamoa kelishuviga aylanadi:

| Kelishuv | Asos | Bob |
| --- | --- | --- |
| O'qilmagan o'zgarish merge qilinmaydi | CC Champion kit: "no change should land unread"; GH: Copilot takliflarini doim tekshiring | 22, 39 |
| Agent PR'i oddiy PR kabi review qilinadi | CC Champion kit: diff'ni har qanday PR standartida ko'rib chiqing | 22 |
| Muallif o'zi tushunmagan kodni PR qilmaydi | GH: kodni amalga oshirishdan oldin tushuning | 39, 43 |
| Qaytarib bo'lmaydigan amallar — inson | CC: ruxsatlar, hook'lar | 11, 35 |
| Xavfsizlik tekshiruvi PR'dan oldin | `/security-review`, CI skanerlari | 39 |
| Kichik PR'lar | Ko'rib chiqish mumkin bo'lgan hajm | 21 |

## Jamoaga joriy qilish

CC ikki tayyor qo'llanma beradi: **Champion kit** (jamoadagi tashabbuskor uchun) va **Communications kit** (e'lon va kampaniya
matnlari).

### Champion — tashabbuskor

CC (Champion kit): tashabbuskor (champion) roli uch xatti-harakatdan iborat:

| Xatti-harakat | Amalda | Nega |
| --- | --- | --- |
| Topganini ulashish | O'z ishingizdagi prompt'lar, skrinshotlar, kichik yutuqlar — jamoa allaqachon o'qiydigan joyda | O'z kod bazangizdan misol har qanday tashqi hujjatdan ishonarliroq |
| So'raladigan odam bo'lish | Hamkasb so'rasa — ishlatgan prompt'ingizni bering | Aniq, ishlaydigan misol qiziqishdan birinchi muvaffaqiyatgacha bo'lgan bo'shliqni yopadi |
| Doirani kengaytirish | Yengil takroriy odatlar: alohida kanal, haftalik mavzu | Bir odamga bog'liq joriy qilish mo'rt |

Hujjatdagi 30 kunlik reja:

| Hafta | Nima qilish | Ishlayotganining belgisi |
| --- | --- | --- |
| 1 | Kanal ochish, Quickstart'ni qadash, prompt'lari bilan 2–3 o'z misolingiz | Bir nechta hamkasb javob beradi, kanalda kamida bitta savol |
| 2 | Haftalik "Claude bu hafta nima bilan yordam berdi?" mavzusi; har savolga ochiq javob; bitta skill yoki CLAUDE.md parchasini ulashish | Sizdan boshqa kimdir o'z misolini yozadi |
| 3 | 2–3 qisqa juftlik sessiyasi; ko'p beriladigan savollarni qadalgan FAQ'ga yig'ish | Takroriy foydalanish — o'sha odamlar qaytib keladi |
| 4 | Ikkinchi champion topish; rahbarga nima ishlayotgani va nima ishlamayotgani haqida qisqa xulosa | Kanaldagi savollarga sizdan boshqalar javob beradi |

Tez-tez eshitiladigan e'tirozlar va hujjatdagi javoblar:

| E'tiroz | Tavsiya etilgan javob |
| --- | --- |
| "Usiz tezroq ishlayman" | Odatdagi kodda bu to'g'ri bo'lishi mumkin. Chetlab yuradigan ishda sinab ko'ring: eski fayllar, notanish servislar, test qolipi. Bitta zerikarli vazifani ikki usulda vaqtini o'lchang |
| "AI'ga production kodini ishonmayman" | Hech qanday o'zgarish o'qilmasdan tushmasligi kerak. Reja rejimi, keyin diff'ni har qanday PR standartida review |
| "Junior'larni zaiflashtiradi" | Yaxshi ishlatilsa — tushuntiruvchi. Junior'lar o'zgartirishdan oldin faylni va uni chaqiradigan joylarni tushuntirishni so'rasin (43-bob) |
| "Bir marta sinadim, o'ylab topdi" | Odatda kontekst muammosi: `@` bilan fayllar, `/init`, haqiqiy xato matni (10-bob) |
| "Yangi vosita o'rganishga vaqt yo'q" | Bu terminal buyrug'i, platforma emas. Birinchi sessiyada foyda bermasa, chetga qo'yish mumkin |

### E'londan oldin

CC (Communications kit) — e'lon yuborishdan oldingi ro'yxat:

- kanal ochilgan va e'londa havola bor;
- o'rnatish buyrug'i muhitingizdagi kamida bitta kompyuterda sinalgan (proksi, firewall);
- xavfsizlik va ma'lumotlar bilan ishlash havolasi tayyor — "kodim qayerga ketadi?" birinchi savol bo'ladi (38-bob);
- bitta aniq birinchi vazifa tanlangan — kod bazangizdagi haqiqiy xato yoki fayl;
- birinchi 48 soat uchun kanal egasi belgilangan.

Yangi a'zo uchun: `/team-onboarding` buyrug'i (CC Champion kit) loyihadagi so'nggi sessiyalaringiz, buyruqlar va MCP serverlarni ko'rib,
yangi hamkasb birinchi xabar sifatida joylashtiradigan qo'llanma tuzadi. U shaxsiy sessiyalaringizni o'qiydi — ulashishdan oldin
natijani ko'rib chiqing.

## Variantlar

| Jamoa hajmi | Yondashuv | Trade-off |
| --- | --- | --- |
| 2–5 kishi | Git'dagi `.claude/settings.json`, `CLAUDE.md`, bir nechta skill | Oddiy; tashkilot siyosati yo'q |
| O'rta jamoa | + champion, kanal, plagin marketplace (29-bob), CI review | Kelishuvlar yozma bo'lishi kerak |
| Tashkilot | + managed settings, OpenTelemetry, analitika, model cheklovlari | Infratuzilma va admin kerak |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Xavfsizlik taqiqini shaxsiy faylda saqlash | Faqat sizga ta'sir qiladi | `.claude/settings.json` yoki managed |
| `settings.local.json` ni qo'lda yaratib, git'ga tushirib qo'yish | CC: qo'lda yaratilganda `.gitignore` ga o'zingiz qo'shasiz | `.gitignore` ni tekshirish |
| Har kim o'z CLAUDE.md'si bilan | Jamoa bir xil qoidalarga ega emas | Umumiy CLAUDE.md git'da, shaxsiysi — `CLAUDE.local.md` |
| Agent PR'larini yengilroq review qilish | CC: o'qilmagan o'zgarish tushmasligi kerak | Oddiy PR standarti |
| Joriy qilishni bitta odamga bog'lash | CC: bir odamga bog'liq joriy qilish mo'rt | Kanal, haftalik mavzu, ikkinchi champion |
| E'lonni "kodim qayerga ketadi?" javobisiz yuborish | Birinchi savol aynan shu bo'ladi | Data usage havolasi (38-bob) |

## Amaliyot

1. Claude Code sozlamalari qaysi doiralarda saqlanadi va ustunlik tartibi qanday?
2. Tajribada nega lokal fayl modelni almashtirdi, lekin `git push` taqiqini ocha olmadi?
3. CC jamoa xavfsizligi uchun nimalarni tavsiya qiladi?
4. Champion rolining uch xatti-harakati qaysilar?
5. "Junior'larni zaiflashtiradi" e'tiroziga qanday javob berasiz?
6. E'londan oldin nimalar tayyor bo'lishi kerak?

<details>
<summary>Javoblar</summary>

1. Foydalanuvchi (`~/.claude/settings.json`), umumiy loyiha (`.claude/settings.json`), lokal loyiha (`.claude/settings.local.json`), managed. Ustunlik: managed → `--settings` → lokal → umumiy → foydalanuvchi.
2. `model` oddiy kalit — yuqoriroq daraja (lokal) qiymati olinadi. `permissions` ro'yxatlari birlashtiriladi va deny allow'dan ustun, shuning uchun jamoaning deny'i amal qildi.
3. Managed settings bilan standartlarni majburlash, tasdiqlangan ruxsatlarni git orqali ulashish, xavfsizlik bo'yicha o'qitish, OpenTelemetry bilan kuzatish, `ConfigChange` hook'lari.
4. Topganini ulashish, so'raladigan odam bo'lish (prompt'ni berish), doirani kengaytirish (kanal, haftalik mavzu).
5. Yaxshi ishlatilsa — tushuntiruvchi; junior'lar o'zgartirishdan oldin faylni va uni chaqiradigan joylarni tushuntirishni so'rasin. 43-bobdagi tadqiqot: o'rganish usuli muhim.
6. Kanal va havola, sinalgan o'rnatish buyrug'i, xavfsizlik va ma'lumotlar havolasi, aniq birinchi vazifa, 48 soatlik kanal egasi.

</details>

## Rasmiy hujjat

- [CC: Settings files and precedence](https://code.claude.com/docs/en/settings)
- [CC: Security — Team security](https://code.claude.com/docs/en/security#team-security)
- [CC: Champion kit](https://code.claude.com/docs/en/champion-kit)
- [CC: Communications kit](https://code.claude.com/docs/en/communications-kit)
