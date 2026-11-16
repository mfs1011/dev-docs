# 09 — Sessiyani boshqarish

[Mundarija](README.md)

## Tushuncha

CC (How Claude Code works) muhim fikrni aytadi: **Claude Code — bu suhbat.** Mukammal so'rov yozish shart emas. Nima
istashingizni aytasiz, keyin aniqlashtirasiz:

```text
Fix the login bug
```

*[Claude o'rganadi, biror narsani sinaydi]*

```text
That's not quite right. The issue is in the session handling.
```

*[Claude yondashuvini o'zgartiradi]*

Birinchi urinish to'g'ri bo'lmasa, **boshidan boshlamaysiz, davom ettirasiz.**

CC (Best practices) bu bobning qisqa xulosasini beradi:

> Birinchi daqiqani kuzating. Claude chetga chiqqan zahoti `Esc` bosing. Ikki marta tuzatib ham bo'lmasa, uchinchi tuzatish
> o'rniga `/clear` qiling va yaxshiroq so'rov yozing.

Hujjat bo'yicha hech qanday sozlama birinchi daqiqani kuzatish va agent siz istamagan tomonga ketganda aralashish o'rnini
bosmaydi. Buning uchun boshqaruv vositalari kam, lekin ularni yoddan bilish kerak.

### Boshqaruv vositalari

| Vosita | Nima qiladi | Qachon |
| --- | --- | --- |
| `Esc` | Agentni darhol to'xtatadi. Ishlayotgan tool chaqiruvi bekor qilinadi, shu paytgacha qilingan ish saqlanadi | Agent noto'g'ri tomonga ketdi |
| Ish davomida xabar yozib `Enter` | Agentni to'xtatmaydi. Xabar navbatga turadi, agent joriy tool chaqiruvlari tugashi bilan uni o'qiydi va keyingi qadamdan oldin moslashadi | Kichik tuzatish yoki qo'shimcha ma'lumot |
| `/rewind` yoki bo'sh qatorda `Esc` ikki marta | Kodni, suhbatni yoki ikkalasini oldingi so'rovgacha qaytaradi | Yondashuv yoqmadi, oldingi holatga qaytish kerak |
| `/clear` | Bo'sh kontekst bilan yangi suhbat | Ikki tuzatishdan keyin ham noto'g'ri; yoki keyingi vazifa boshqa mavzuda |
| `/btw` | Suhbat tarixiga hech narsa qo'shmasdan qisqa savol | "Haligi fayl nomi nima edi?" kabi yon savol |

CC (Interactive mode) navbatga qo'yilgan xabarlar haqida aniqlik kiritadi. Agent tool chaqiruvlarini bajarayotganda xabar
yuborsangiz, Claude Code uni shu tool chaqiruvlari tugashi bilan, **shu navbatning o'zida** agentga beradi. Navbat tugaganda
ham xabarlar qolgan bo'lsa, ular yozilgan tartibda o'zi yuboriladi. Kutmasdan yuborish uchun `Ctrl+Enter`.

### Nega uchinchi tuzatish yomon

CC (Best practices) sababini tushuntiradi. Bir narsani ikki marta tuzatgansiz-u, u hamon noto'g'ri bo'lsa, uchinchi tuzatish
asosan **ikkita muvaffaqiyatsiz urinishi bor suhbatga** qo'shiladi. Agent ularni har safar qayta o'qiydi. `/clear` va
o'rganganlaringizni o'z ichiga olgan bitta yangi so'rov deyarli har doim yaxshiroq ishlaydi.

Bu 2-bobdagi kontekst haqidagi gapga borib taqaladi: kontekstdagi hamma narsa — rad etilgan yondashuvlar ham — keyingi
javobga ta'sir qiladi.

`/clear` qilishdan oldin o'rganganlaringizni yangi so'rovga yig'ing:

```text
narx.js ga yetkazish funksiyasini qo'sh. Muhim: bo'sh savat (0) uchun haq olinmaydi, 200000 dan bepul,
aks holda 15000. Oldingi urinishda funksiya summani o'zgartirib yubordi — u faqat yetkazish haqini qaytarsin,
summani emas. test/qoidalar.test.js dagi qoidalarni o'qib chiq.
```

### Checkpoint'lar

CC (Checkpointing): Claude Code agentning fayl tahrirlarini avtomatik kuzatib boradi. Navbat boshlaydigan har bir so'rovingizdan
oldin kod holati saqlanadi. Bu **checkpoint** (nazorat nuqtasi) deb ataladi.

- Bir sessiyada oxirgi 100 ta checkpoint uchun fayl nusxalari saqlanadi.
- Checkpoint'lar suhbat bilan birga saqlanadi, shuning uchun sessiyani davom ettirgandan keyin ham `/rewind` ishlaydi.
- Standart holatda sessiya oxirgi marta nusxa saqlaganidan taxminan 30 kun o'tgach nusxalar o'chiriladi (`cleanupPeriodDays`
  sozlamasi bilan o'zgartiriladi).

`/rewind` (yoki `/undo`) menyusida siz yuborgan so'rovlar ro'yxati chiqadi. Kerakli nuqtani tanlab, amalni tanlaysiz:

| Amal | Nima bo'ladi |
| --- | --- |
| **Restore code and conversation** | Kod ham, suhbat ham shu nuqtaga qaytadi |
| **Restore conversation** | Suhbat qaytadi, kod hozirgidek qoladi |
| **Restore code** | Fayl o'zgarishlari qaytadi, suhbat qoladi |
| **Summarize from here** | Shu nuqtadan keyingi suhbat xulosaga siqiladi |
| **Summarize up to here** | Shu nuqtagacha bo'lgan suhbat xulosaga siqiladi, keyingilari qoladi |

CC (Best practices) checkpoint'ning amaliy qiymatini aytadi: bu bilan **avval dadilroq yondashuvni sinab ko'rish**, yoqmasa
qaytish xavfsiz bo'ladi.

## Amalda: nima qaytadi va nima qaytmaydi

CC (Checkpointing) cheklovni ogohlantiradi: faqat Bash buyrug'i o'zgartirgan fayl kuzatilmaydi va o'z holicha qoladi. Buni
haqiqiy interaktiv sessiyada tekshiramiz (Claude Code 2.1.325, `acceptEdits` rejimi). So'rov:

```text
narx.js dagi chegirma funksiyasi ustiga bir qatorli izoh qo'sh. Keyin terminalda touch yangi.txt buyrug'ini ishga tushir.
```

Agent ikki ish qildi:

1. `Update(narx.js)` — `Edit` tool'i bilan izoh qo'shdi: `// Summaga foizli chegirma qo'llaydi`.
2. `touch yangi.txt` — Bash bilan yangi fayl yaratdi.

`git status`:

```text
 M narx.js
?? yangi.txt
```

Endi `/rewind`. Menyu ochildi (terminaldan olingan matn):

```text
Rewind
Restore the code and/or conversation to the point before…

  narx.js dagi chegirma funksiyasi ustiga bir qatorli izoh qo'sh. Keyin…
❯ (current)

Enter to continue · Esc to cancel
```

E'tibor bering: kursor standart holatda `(current)` (hozirgi holat) ustida turadi. Bu yerda `Enter` bossangiz, hech narsa
o'zgarmaydi. `↑` bilan kerakli so'rovni tanlash kerak. Tanlagach, menyu so'rovning yonida `narx.js +1` deb qaytariladigan
o'zgarishni ko'rsatdi va tasdiq so'radi:

```text
Rewind
Confirm you want to restore to the point before you sent this message:
│ narx.js dagi chegirma funksiyasi ustiga bir qatorli izoh qo'sh. Keyin
│ terminalda touch yangi.txt buyrug'ini ishga tushir.
│ (20s ago)

The conversation goes back to before this message.
The code will be restored -1 in narx.js.

❯ 1. Restore code and conversation
  2. Restore conversation
  3. Restore code
  4. Summarize from here
↓ 5. Summarize up to here

⚠ Restored files go back whole, losing later changes by anyone. Bash
changes to other files are not undone.
```

Ogohlantirishning ikki qismi muhim:

- **"Restored files go back whole, losing later changes by anyone"** — qaytarilgan fayl butunlay eski holatga qaytadi. O'sha
  faylga keyin kim nima qo'shgan bo'lsa (siz ham), hammasi yo'qoladi.
- **"Bash changes to other files are not undone"** — Bash boshqa fayllarga kiritgan o'zgarishlar qaytarilmaydi.

**Restore code** tanlangandan keyin `git status`:

```text
?? yangi.txt
```

`narx.js` qaytdi, `yangi.txt` esa joyida qoldi. Hujjatdagi cheklov amalda ko'rindi.

### Checkpoint qamrab olmaydigan narsalar

CC (Checkpointing, How Claude Code works):

| Qaytmaydi | Nima qilish kerak |
| --- | --- |
| Faqat Bash buyrug'i o'zgartirgan fayl | Git bilan qaytaring |
| Subagent tahrirlari (ko'p hollarda) | Git bilan qaytaring |
| Claude Code'dan tashqarida siz yoki boshqa sessiya qilgan o'zgarish | Git |
| Symlink va hard link fayllar | Agentdan teskari o'zgarish so'rang yoki o'zingiz tahrirlang |
| Tashqi tizimlar: ma'lumotlar bazasi, API, deploy | Ularni ruxsat rejimi va ruxsat qoidalari bilan oldindan cheklang (VII qism) |

Hujjat xulosasi: checkpoint'lar sessiya ichida tez tiklash uchun. Doimiy tarix va jamoa ishi uchun **Git** kerak. CX (Codex
CLI) ham shuni tavsiya qiladi: vazifadan oldin va keyin git nazorat nuqtasi (commit) yarating.

## Sessiyani nomlash va qaytish

CC (Best practices): bir necha kun davom etadigan ish uchun sessiyani nomlang:

```text
/rename oauth-migration
```

Keyin shell'dan shu nom bilan qaytasiz. Checkpoint'lar ham saqlangan bo'ladi:

```bash
claude --resume oauth-migration
```

`claude --continue` shu papkadagi oxirgi sessiyani davom ettiradi. Sessiyalar, davom ettirish va ayirish (fork) — 15-bob.

## Variantlar

| Vaziyat | Vosita | Nega |
| --- | --- | --- |
| Agent noto'g'ri faylni tahrirlay boshladi | `Esc`, keyin tuzatish | Shu paytgacha qilingan ish saqlanadi, darhol yo'nalish berasiz |
| Ish ketyapti, kichik qo'shimcha esingizga tushdi | Xabarni yozib `Enter` (navbat) | Agent to'xtamaydi, keyingi qadamdan oldin hisobga oladi |
| Natija yoqmadi, boshqa yondashuvni sinamoqchisiz | `/rewind` → Restore code and conversation | Kod ham, suhbat ham toza nuqtaga qaytadi |
| Kod yaxshi, lekin suhbat chalkashib ketgan | `/rewind` → Restore conversation yoki Summarize | Kod qoladi, kontekst tozalanadi |
| Ikki tuzatishdan keyin ham noto'g'ri | `/clear` + o'rganganlaringiz bilan yangi so'rov | Muvaffaqiyatsiz urinishlar kontekstdan chiqadi |
| Keyingi vazifa boshqa mavzuda | `/clear` | Eski suhbat keyingi vazifaga kerakli fayllarni siqib chiqaradi (2-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Agentni ishga qo'yib, boshqa ishga ketish | CC: birinchi daqiqani kuzatish hech qanday sozlama bilan almashmaydi | Birinchi daqiqani kuzating, chetga chiqsa `Esc` |
| Uchinchi, to'rtinchi tuzatish | CC: agent muvaffaqiyatsiz urinishlarni qayta-qayta o'qiydi | `/clear` va bitta yaxshiroq so'rov |
| Checkpoint'ni Git o'rniga ishlatish | CC: checkpoint faqat sessiya ichida tez tiklash uchun; Bash o'zgarishlari qaytmaydi | Muhim nuqtalarda commit qiling |
| `/rewind` bilan bazadagi o'zgarishni qaytarishni kutish | CC: masofaviy tizimlar checkpoint'ga kirmaydi | Bunday buyruqlarni ruxsat qoidalari bilan cheklang |
| Rewind menyusida `(current)` ustida `Enter` bosish | Hozirgi holat tanlangan, hech narsa qaytmaydi | `↑` bilan kerakli so'rovni tanlang |
| Faylni qo'lda tahrirlab, keyin shu faylni rewind qilish | Fayl butunlay qaytadi, sizning o'zgarishingiz ham yo'qoladi | Avval o'z o'zgarishingizni saqlang yoki commit qiling |

## Amaliyot

1. CC bo'yicha sessiyani boshqarishning qisqa qoidasi qanday?
2. `Esc` va ish davomida xabar yozib `Enter` bosish farqi nima?
3. Nega uchinchi tuzatish o'rniga `/clear` yaxshiroq?
4. `/rewind` menyusida qanday amallar bor?
5. Tajribada "Restore code" dan keyin nima qaytdi va nima qoldi? Nega?
6. Checkpoint qaysi o'zgarishlarni qamrab olmaydi?
7. Bir necha kunlik ishga qanday qaytish mumkin?

<details>
<summary>Javoblar</summary>

1. Birinchi daqiqani kuzating, agent chetga chiqqan zahoti `Esc` bosing, ikki tuzatishdan keyin ham noto'g'ri bo'lsa `/clear` qilib, yaxshiroq so'rov yozing.
2. `Esc` agentni darhol to'xtatadi (ishlayotgan tool bekor qilinadi). Xabar yozib `Enter` agentni to'xtatmaydi: xabar navbatga turadi va agent joriy tool chaqiruvlari tugashi bilan uni o'qiydi.
3. Uchinchi tuzatish ikkita muvaffaqiyatsiz urinishi bor suhbatga qo'shiladi va agent ularni qayta-qayta o'qiydi. `/clear` va o'rganganlarni o'z ichiga olgan yangi so'rov toza kontekstdan boshlaydi.
4. Restore code and conversation, Restore conversation, Restore code, Summarize from here, Summarize up to here (va Never mind).
5. `Edit` bilan o'zgartirilgan `narx.js` qaytdi, `touch` bilan yaratilgan `yangi.txt` qoldi. Faqat Bash o'zgartirgan fayl checkpoint'da kuzatilmaydi.
6. Faqat Bash o'zgartirgan fayllar, ko'p hollarda subagent tahrirlari, tashqi o'zgarishlar, symlink va hard link fayllar, ma'lumotlar bazasi, API, deploy kabi tashqi tizimlar.
7. Sessiyani `/rename nom` bilan nomlab, keyin `claude --resume nom` bilan; oxirgi sessiyani `claude --continue` bilan.

</details>

## Rasmiy hujjat

- [CC: Best practices — Steer the session](https://code.claude.com/docs/en/best-practices#steer-the-session)
- [CC: How Claude Code works — It's a conversation, Interrupt and steer](https://code.claude.com/docs/en/how-claude-code-works#its-a-conversation)
- [CC: Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [CC: Interactive mode — Queue messages while Claude works, Side questions with /btw](https://code.claude.com/docs/en/interactive-mode)
- [CX: Codex CLI — Start your first task](https://learn.chatgpt.com/docs/codex/cli)
