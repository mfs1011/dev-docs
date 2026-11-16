# 15 — Uzun sessiya: qisqartirish, tozalash, davom ettirish

[Mundarija](README.md)

## Tushuncha

Sessiya uzaygani sari uch savol paydo bo'ladi:

1. Kontekst to'lsa nima bo'ladi?
2. Qachon suhbatni qisqartirish, qachon butunlay tozalash kerak?
3. Ertaga shu ishga qanday qaytiladi?

### Qisqartirish (compaction)

CC (How Claude Code works): chegaraga yaqinlashganda Claude Code kontekstni avtomatik boshqaradi — suhbatni **xulosaga
siqadi**. Xulosada so'rovlaringiz va muhim kod bo'laklari qoladi, lekin suhbat boshidagi batafsil ko'rsatmalar yo'qolishi
mumkin. Shuning uchun doimiy qoidalar CLAUDE.md'da turishi kerak, suhbat tarixida emas.

CC (Explore the context window) qisqartirishdan keyin nima saqlanishini aniq sanaydi:

| Nima | Qisqartirishdan keyin |
| --- | --- |
| Tizim ko'rsatmasi va output style | Amal qilishda davom etadi |
| Ildizdagi CLAUDE.md va `paths` siz qoidalar | Diskdan qayta yuklanadi |
| Auto memory | Diskdan qayta yuklanadi |
| Plan mode'da yozilgan reja | Diskdan qayta yuklanadi |
| `paths` qoidalari, ichki papkalardagi CLAUDE.md | Mos fayl ochilganda qayta yuklanadi |
| O'qilgan yoki tahrirlangan fayllar | Oxirgi o'zgartirilganlaridan beshtagacha qayta o'qiladi; 5000 tokendan katta fayl faqat yo'l sifatida qaytadi |
| Ishlatilgan skill'lar mazmuni | Qaytariladi: har skill 5000 token, jami 25 000 token bilan cheklangan; eskilari birinchi tushib qoladi |
| Fon buyruqlari va fon subagentlari | Ishlashda davom etadi |
| Hook'lar ilgari qo'shgan kontekst | Suhbatning qolgan qismi bilan xulosaga siqiladi |

Asosiy xulosa: **suhbatda aytilgan narsa yo'qolishi mumkin, diskdagi narsa qaytadi.**

CC (Explore the context window) qisqartirishni boshqarishning bir necha yo'lini beradi:

| Usul | Nima qiladi |
| --- | --- |
| `/compact <yo'nalish>` | Masalan `/compact focus on the auth bug fix` — xulosada nima qolishini avtomatik taxmin emas, siz tanlaysiz |
| CLAUDE.md'da "Compact Instructions" bo'limi | Har qisqartirishda nimani saqlash kerakligini oldindan aytadi (CC How Claude Code works) |
| `/rewind` → Summarize from here / up to here | Suhbatning faqat bir qismini qisqartiradi (9-bob) |
| `/autocompact 500k` | Avtomatik qisqartirish qanchalik to'lganda ishga tushishini belgilaydi |

CC yana bir himoyani aytadi: bitta fayl yoki tool chiqishi shunchalik kattaki, har xulosadan keyin kontekst darhol yana
to'lsa, Claude Code bir necha urinishdan keyin avtomatik qisqartirishni to'xtatadi va cheksiz aylanish o'rniga xato ko'rsatadi.

### Tozalash (`/clear`)

CC (Manage sessions): `/clear` bo'sh kontekst bilan yangi suhbat boshlaydi. Oldingi sessiya saqlanadi va unga `/resume` bilan
qaytish mumkin. `/clear release-prep` ko'rinishida chiqib ketayotgan sessiyaga nom berish ham mumkin.

### `/clear` yoki `/compact`?

| Vaziyat | Tanlov | Nega |
| --- | --- | --- |
| Keyingi vazifa boshqa mavzuda | `/clear` | CC: eski suhbat keyingi vazifaga kerak fayllarni siqib chiqaradi va har xabarda token sarflaydi |
| Bir vazifa ustida uzoq ishlayapsiz, kontekst og'irlashdi | `/compact <yo'nalish>` | Vazifa davom etadi, keraksiz tafsilot xulosaga siqiladi |
| Ikki tuzatishdan keyin ham noto'g'ri | `/clear` + yaxshiroq so'rov | 9-bob: muvaffaqiyatsiz urinishlar kontekstdan chiqadi |
| Uzoq reja muhokamasidan keyin qurish | Rejani faylga yozib, `/clear` yoki yangi sessiya | 7-bob: qurish toza kontekstda boshlanadi |

### Davom ettirish va ayirish

CC (How Claude Code works): sessiyalar bir-biridan **mustaqil**. Har yangi sessiya oldingi suhbatlarsiz, toza kontekst bilan
boshlanadi. Lekin har bir xabar, tool chaqiruvi va natija `~/.claude/projects/` ostidagi JSONL faylga yozib boriladi. Shu
tufayli sessiyani davom ettirish yoki ayirish mumkin.

CC (Manage sessions):

| Buyruq | Nima qiladi |
| --- | --- |
| `claude --continue` (`-c`) | Shu papkadagi oxirgi sessiyani ochadi |
| `claude --resume` (`-r`) | Sessiyalar ro'yxatini (picker) ochadi |
| `claude --resume <nom>` yoki `<session-id>` | Shu sessiyani to'g'ridan-to'g'ri davom ettiradi |
| `/resume` | Sessiya ichidan boshqa sessiyaga o'tadi |
| `claude -n auth-refactor` yoki `/rename auth-refactor` | Sessiyaga nom beradi |
| `/branch [nom]` yoki `--fork-session` | Suhbat nusxasini yangi sessiya qilib ochadi, asl sessiya o'zgarmaydi |

Davom ettirish (resume) **o'sha sessiya ID'si** ostida davom etadi va yangi xabarlarni o'sha suhbatga qo'shadi. Ayirish
(fork) esa tarixni yangi ID'ga ko'chiradi.

CC (Manage sessions) ikki tuzoqni ogohlantiradi:

- `claude -p` yoki Agent SDK bilan yaratilgan sessiyalar ro'yxatga ham, `claude --continue` ga ham kirmaydi. Ularni faqat ID
  bilan davom ettirish mumkin (`claude --resume <id>`) yoki `claude -p --continue` bilan.
- Bitta sessiyani bir vaqtda ikki terminalda ochsangiz, ikkalasi bitta transkriptga yozadi va keyin xabarlarning bir qismi
  yo'qolishi mumkin. Ikkala suhbatni saqlash uchun har biriga `--fork-session` qo'shing.

## Amalda

12-bobdagi C sessiyasi `app.log` ning 1000 qatorini Read bilan o'qigan, xabarlar 43k token egallagan edi. Endi uni ayiramiz,
ayirilgan nusxani qisqartiramiz va asl sessiya o'zgarmaganini tekshiramiz (Claude Code 2.1.325).

### 1. Ayirish

```bash
claude -p "Shu paytgacha nima qildik? bir jumla." --resume 30aca37b-… --fork-session --output-format json
```

```text
`app.log` ning birinchi 1000 qatorini grep ishlatmasdan Read bilan ikki qismda o'qib, 40 ta ERROR qatorini sanadik:
ularning hammasi POST so'rovlaridagi `500 TypeError: Cannot read properties of undefined` xatosi
(buyurtma 12, foydalanuvchi 10, savat 10, narx 8).
```

Javob bilan birga yangi `session_id` keldi (`85541b83-…`). Bu — nusxa.

### 2. Yo'naltirilgan `/compact`

```bash
claude -p "/compact faqat ERROR sanog'i natijasi va qaysi endpointlarda xato ko'pligini saqla" --resume 85541b83-…
```

`/context` oldin va keyin:

| | Jami tokenlar | `Messages` |
| --- | --- | --- |
| Ayirilgan sessiya, qisqartirishdan oldin | 59,3k | 45,1k |
| Ayirilgan sessiya, qisqartirishdan keyin | 20,1k | **6,1k** |
| Asl sessiya (tegilmagan) | 57,7k | 43,5k |

Xabarlar taxminan 7 baravar kamaydi. Asl sessiya o'z holicha qoldi. Uning o'sishi faqat oradagi `/context` chaqiruvlaridan.

### 3. Xulosada nima qoldi

Qisqartirilgan sessiyadan:

```text
Qaysi endpointda ERROR eng ko'p edi? faqat xotiradan javob ber, faylni qayta o'qima.
```

```text
ERROR eng ko'p bo'lgan endpoint — **`POST /api/buyurtma`**, unda 12 ta ERROR bor. Undan keyin `POST /api/foydalanuvchi`
va `POST /api/savat` (har biri 10 ta), so'ng `POST /api/narx` (8 ta) turadi.
```

`head -1000 app.log | grep " ERROR " | awk '{print $4}' | sort | uniq -c` ham shu raqamlarni beradi: 12, 10, 8, 10.
Yo'nalishda aytilgan ma'lumot xulosada saqlandi, faylning o'qilgan matni esa chiqib ketdi.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Avtomatik qisqartirish | Hech narsa qilish shart emas | Nima qolishini model taxmin qiladi; boshidagi ko'rsatmalar yo'qolishi mumkin | Ko'p hollarda yetarli |
| `/compact <yo'nalish>` | Nima qolishini siz tanlaysiz | Yo'nalishda aytilmagan tafsilot yo'qolishi mumkin | Uzoq vazifani davom ettirishdan oldin |
| `/clear` | Toza kontekst, eng arzon | Suhbatdagi hamma narsa ketadi (sessiya saqlanib qoladi) | Yangi vazifa |
| `/branch`, `--fork-session` | Asl yo'l saqlanadi, boshqa yondashuvni sinash mumkin | Ikki sessiyani kuzatish kerak | Muqobil yondashuv |
| Nomlangan sessiya + `--resume` | Bir necha kunlik ishga aniq qaytish | Nom berishni unutmaslik kerak | Uzoq ishlar |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Muhim qoidani faqat suhbat boshida aytish | CC: qisqartirishda boshidagi ko'rsatmalar yo'qolishi mumkin | CLAUDE.md'ga yozing — u diskdan qayta yuklanadi |
| Yangi vazifani eski suhbatda boshlash | Eski kontekst xalaqit beradi va token sarflaydi | `/clear` |
| Yo'nalishsiz `/compact`, keyin muhim tafsilot yo'qolishi | Avtomatik xulosa nima muhimligini taxmin qiladi | `/compact <nimani saqlash>` |
| `-p` sessiyasini `claude -c` bilan qidirish | CC: `-p` sessiyalari `--continue` ga kirmaydi | `claude --resume <id>` yoki `claude -p --continue` |
| Bitta sessiyani ikki terminalda ochish | CC: ikkalasi bitta transkriptga yozadi, xabarlar yo'qolishi mumkin | Har biriga `--fork-session` |
| Sessiyalarga nom bermaslik | Ro'yxatdan topish qiyin | `claude -n nom` yoki `/rename nom` |

## Amaliyot

1. Qisqartirishdan keyin nimalar diskdan qayta yuklanadi va nima yo'qolishi mumkin?
2. `/compact` va `/clear` farqi nima? Har biri qachon kerak?
3. Davom ettirish (resume) va ayirish (fork) farqi nima?
4. Tajribada qisqartirish nima natija berdi va xulosada nima saqlandi?
5. Nega `claude -c` skript rejimida yaratilgan sessiyani topmaydi?
6. Bitta sessiyada ikki xil yondashuvni sinamoqchisiz. Qanday qilasiz?

<details>
<summary>Javoblar</summary>

1. Qayta yuklanadi: ildizdagi CLAUDE.md, `paths` siz qoidalar, auto memory, plan mode rejasi; oxirgi o'qilgan beshtagacha fayl, ishlatilgan skill'lar (chegaralar bilan). Yo'qolishi mumkin: suhbat boshidagi batafsil ko'rsatmalar, hook'lar qo'shgan kontekst (xulosaga siqiladi).
2. `/compact` suhbatni xulosa bilan almashtiradi va vazifa davom etadi. `/clear` bo'sh kontekst bilan yangi suhbat boshlaydi (eski sessiya saqlanadi). `/compact` — bir vazifa uzoq davom etganda, `/clear` — yangi vazifada yoki ikki muvaffaqiyatsiz tuzatishdan keyin.
3. Resume o'sha sessiya ID'si ostida davom etadi va xabarlarni shu suhbatga qo'shadi. Fork tarixni yangi ID'ga ko'chiradi, asl sessiya o'zgarmaydi.
4. Xabarlar 45,1k dan 6,1k tokenga tushdi. Yo'nalishda aytilgan ERROR sanog'i va endpointlar bo'yicha taqsimot saqlandi; faylning o'qilgan matni chiqib ketdi.
5. CC: `-p` va Agent SDK sessiyalari sessiyalar ro'yxatiga ham, `--continue` ga ham kirmaydi. Ularni ID bilan (`--resume <id>`) yoki `claude -p --continue` bilan davom ettirish mumkin.
6. `/branch nom` (yoki `--fork-session`) bilan nusxa ochib, unda boshqa yondashuvni sinash; yoki checkpoint bilan `/rewind` (9-bob).

</details>

## Rasmiy hujjat

- [CC: Explore the context window — What survives compaction, When your context fills up](https://code.claude.com/docs/en/context-window#what-survives-compaction)
- [CC: How Claude Code works — Work with sessions, When context fills up](https://code.claude.com/docs/en/how-claude-code-works#work-with-sessions)
- [CC: Manage sessions](https://code.claude.com/docs/en/sessions)
- [CC: Checkpointing — Rewind and summarize](https://code.claude.com/docs/en/checkpointing#rewind-and-summarize)
