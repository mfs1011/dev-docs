# 30 — Subagentlar

[Mundarija](README.md)

## Tushuncha

CC (Create custom subagents): **subagent** — muayyan turdagi vazifani bajaradigan ixtisoslashgan yordamchi. Yon vazifa asosiy
suhbatni keyin kerak bo'lmaydigan qidiruv natijalari, loglar yoki fayl mazmuni bilan to'ldirib yuboradigan bo'lsa, subagent
ishlatiladi. Subagent bu ishni **o'z kontekstida** bajaradi va asosiy suhbatga faqat **xulosani** qaytaradi.

Har bir subagent:

- o'z kontekst oynasida ishlaydi;
- o'z tizim ko'rsatmasiga (system prompt) ega;
- faqat o'ziga ruxsat berilgan tool'larni ishlatadi;
- o'z ruxsatlariga ega;
- o'z so'rovlarini yuboradi — ular asosiy suhbat bilan **bir xil foydalanish limitiga** hisoblanadi.

```text
asosiy suhbat ─── vazifa ───▶ subagent (alohida kontekst)
     ▲                         │  fayllarni o'qiydi, qidiradi
     │                         │  (bu tafsilotlar asosiy suhbatga kirmaydi)
     └───────── xulosa ────────┘
```

### Nimaga foyda beradi, nimaga emas

CC (Best practices, "Know what subagents cost") — subagent quyidagi holatlarda arziydi:

| Holat | Nega |
| --- | --- |
| Mustaqil ishlarni bir vaqtda bajarish | Butun vazifa tezroq tugaydi |
| Uzun chiqishni asosiy suhbatdan chetda saqlash | To'liq test natijasi yoki keng qidiruv sessiya oxirigacha kontekstda yurmaydi |
| Kod yozilishini ko'rmagan tekshiruvchi | Kodni yozgan fikrlash yo'li unga ta'sir qilmaydi (22-bob) |
| Asosiy sessiyadan kamroq tool | Masalan, o'qiy oladigan, lekin tahrirlay olmaydigan reviewer |

Narxi ham bor. CC bo'yicha bu asosan **token**, chunki har subagent o'z so'rovlarini yuboradi. Ba'zan **vaqt** ham: yangi subagent
avval suhbatingizda allaqachon bor kontekstni yig'ishi kerak, shuning uchun vazifani o'zingiz bajarganingizdan ham **sekinroq**
bo'lishi mumkin. Standart holatda u xuddi shu vazifadagi xuddi shu (yoki kichikroq) model. Undan parallellik yoki yangi nigoh
olasiz, lekin **aqlliroq javob emas**.

CC (Best practices, "What you can stop doing") ikki eski maslahatni bekor qiladi:

- "Kontekstni himoya qilish uchun subagent ishlating" — kontekst endi kamdan-kam tugaydi (12-bob);
- "Yaxshiroq javob uchun subagentga bering" — bir vazifani subagentga berish javobni yaxshilamaydi. Yangi tekshiruvchi yordam beradi,
  chunki u sizning fikrlash yo'lingizni ko'rmagan. Bu esa boshqa narsa.

### O'rnatilgan subagentlar

CC (Create custom subagents):

| Subagent | Tool'lar | Vazifasi |
| --- | --- | --- |
| **Explore** | Faqat o'qish (Write va Edit taqiqlangan) | Fayl topish, kod qidirish, kod bazasini o'rganish. Claude unga chuqurlik darajasini beradi: quick, medium yoki very thorough |
| **Plan** | Faqat o'qish | Plan mode'da reja tuzishdan oldin kod bazasini o'rganish (7-bob) |
| **General-purpose** | Subagentlarga mavjud barcha tool'lar | O'rganish va o'zgartirishni talab qiladigan murakkab, ko'p bosqichli vazifalar |

CC qo'shimcha qiladi: Explore va Plan sizning CLAUDE.md fayllaringizsiz va git holati suratisiz boshlanadi, shunda qidiruv tez va arzon
bo'ladi. CC (Best practices) bo'yicha Claude keng qidiruvni o'zi Explore'ga beradi va subagentlar standart holatda fonda ishlaydi.
Ko'pincha buni so'rashingiz shart emas.

### O'z subagentingiz

Bir xil ko'rsatmali ishchini qayta-qayta ishga tushirayotgan bo'lsangiz, o'z subagentingizni yozing (CC). Bu markdown fayl:
YAML frontmatter va undan keyin tizim ko'rsatmasi.

| Joy | Kim uchun |
| --- | --- |
| `.claude/agents/<nom>.md` | Shu loyiha (commit qilinsa — jamoa) |
| `~/.claude/agents/<nom>.md` | Barcha loyihalaringiz |
| Plagin `agents/` | Plagin yoqilgan joyda, `plagin:nom` ko'rinishida (29-bob) |

Asosiy frontmatter maydonlari (CC; faqat `name` va `description` majburiy):

| Maydon | Nima |
| --- | --- |
| `name` | Noyob nom, masalan `code-reviewer` |
| `description` | Claude qachon shu subagentga topshirishi kerak |
| `tools` | Ruxsat etilgan tool'lar, masalan `Read, Grep, Glob`. Ko'rsatilmasa — barcha mavjud tool'lar |
| `disallowedTools` | Taqiqlanadigan tool'lar |
| `model` | `sonnet`, `opus`, `haiku`, `fable`, to'liq model ID yoki `inherit` |
| `permissionMode` | Ruxsat rejimi (35-bob) |
| `maxTurns` | Ko'pi bilan nechta navbatdan keyin to'xtash |
| `skills` | Boshida to'liq yuklanadigan skill'lar |
| `isolation: worktree` | Subagentni vaqtinchalik git worktree'da ishga tushirish (31-bob) |

CC (Best practices) arzonlashtirish uchun maslahat beradi:

- oddiy ish uchun (modulni import qiladigan fayllarni yig'ish, havolalarni tekshirish) `model: haiku`;
- qisqa xulosa so'rang, aks holda yigirmata natija baribir kontekstni to'ldiradi;
- `/usage` bilan har subagent turi foydalanishning qancha qismini olishini ko'ring;
- tekshiruvchiga faqat `tools: Read, Grep, Glob` bering. Shunda u hech narsani tahrirlay olmaydi, va bu cheklovni so'rov emas,
  Claude Code majburlaydi.

CC'dagi yana bir ogohlantirish: subagentlar tavsiflari ham kontekst oladi. O'rnatilganlardan tashqari subagentlar tavsiflari jami 15 000
tokendan oshsa, Claude Code ishga tushganda ogohlantiradi. Tavsifni qisqa yozing, tafsilotni tizim ko'rsatmasiga qo'ying — u faqat
subagent ishlaganda yuklanadi.

## Amalda: faqat o'qiydigan reviewer

CC (Best practices) dagi reviewer namunasi aynan shu ko'rinishda sinov repo'siga qo'shildi — `.claude/agents/reviewer.md`:

```markdown
---
name: reviewer
description: Reviews changed files against the spec they were built from. Use after implementing a feature, before opening the PR.
tools: Read, Grep, Glob
---
You're reviewing code you didn't write. Compare the changed files against the spec you're given,
check that every requirement is implemented and the listed edge cases have tests,
and report only the gaps that affect correctness. Skip style.
```

Spetsifikatsiya — `SPEC.md`:

```markdown
# jarima(summa, kunlar) — spetsifikatsiya
1. Har kechikkan kun uchun summaning 0.1% i, jami ko'pi bilan 10%.
2. Natija butun so'mga yaxlitlanadi.
3. kunlar <= 0 bo'lsa jarima 0.
4. kunlar butun son bo'lmasa yoki summa manfiy bo'lsa — RangeError.
5. Har talab uchun test bo'lishi kerak.
```

Tekshiriladigan kod (20-bobdagi `jarima`):

```js
export function jarima(summa, kunlar) {
  if (kunlar <= 0) return 0
  const foiz = Math.min(kunlar * 0.1, 10)
  return Math.round(summa * foiz / 100)
}
```

So'rov (Claude Code 2.1.325):

```text
reviewer subagent'idan narx.js dagi jarima funksiyasini SPEC.md ga solishtirib ko'rib chiqishni so'ra.
Topilgan kamchiliklarni o'zbekcha qisqa ro'yxat qilib ber, kodga tegma.
```

### Kim nima qildi

Sessiya transkriptidan:

```text
asosiy suhbat:  [Agent] {"subagent_type": "reviewer", "description": "jarima ni SPEC bilan solishtirish", ...}
  subagent:     [Read] narx.js, [Read] SPEC.md, [Read] narx.test.js, ... (6 ta Read)
asosiy suhbat:  [Bash] node -e '... jarima(100000, 1.5) ...'   ← ruxsat so'radi, bajarilmadi
```

- Asosiy agent vazifani `Agent` tool'i bilan `reviewer` ga berdi.
- Subagent **faqat `Read`** ishlatdi: `tools` ro'yxati unga boshqasiga ruxsat bermaydi.
- Subagent transkripti alohida faylda (`subagents/agent-….jsonl`) saqlandi.
- Asosiy agent natijani tekshirish uchun kodni ishga tushirmoqchi bo'ldi, lekin buyruq ruxsat so'radi. Agent buni javobida ochiq aytdi:
  qiymatlar kodni o'qib hisoblangan.

### Natija

Asosiy suhbatga qaytgan xulosadan:

```text
**To'g'ri ishlaydi:** har kun uchun 0.1% va eng ko'pi 10% chegarasi (1-qoida), `Math.round` bilan butun so'mga yaxlitlash (2-qoida),
`kunlar <= 0` bo'lsa 0 qaytarish (3-qoida).

**Kamchiliklar:**
1. **Butun bo'lmagan `kunlar` tekshirilmaydi (4-qoida).** RangeError otilmaydi:
   - `jarima(100000, 1.5)` → 150
   - `jarima(100000, NaN)` → NaN
   - `jarima(100000, "5")` → 500
2. **Manfiy `summa` tekshirilmaydi (4-qoida).** `jarima(-100000, 5)` RangeError o'rniga -500 qaytaradi.
3. **Tekshiruv 25-qatordagi `if (kunlar <= 0) return 0` dan keyin qo'shilsa, ba'zi holatlar baribir o'tib ketadi.** ...
4. **`jarima` uchun birorta ham test yo'q (5-qoida).** `narx.test.js` uni import ham qilmaydi.

**SPEC.md da aniq bo'lmagan joylar:**
- 3- va 4-qoida bir vaqtda to'g'ri kelsa, qaysi biri ustun bo'lishi aytilmagan. Masalan, `(-100, 0)` 0 qaytarishi kerakmi yoki xato berishimi?
...
```

Reviewer kod o'qib hisoblagan qiymatlarni haqiqiy ishga tushirib tekshirdik:

```text
[100000,1.5] 150
[100000,null] NaN
[100000,"5"] 500
[-100000,5] -500
[-100000,0] 0
[100000,-1.5] 0
```

Hammasi to'g'ri. `grep -c jarima narx.test.js` → `0`, ya'ni test haqiqatan yo'q.

Uchta kuzatish:

1. **3-band** — oddiy tekshiruvdan chuqurroq topilma: tuzatishni noto'g'ri joyga qo'ysangiz ham xato qolishi.
2. **"Spetsifikatsiyada aniq bo'lmagan joylar"** — reviewer spetsifikatsiyaning o'zidagi ziddiyatni ham topdi. 7-bobdagi kabi bu savollarga
   siz javob berasiz.
3. **Kontekst:** asosiy sessiyada `Messages` 10,9k token edi. Olti fayl o'qish subagent kontekstida qoldi, asosiy suhbatga xulosa keldi.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Vazifani asosiy suhbatda bajarish | Kontekst allaqachon bor; tez; qo'shimcha token yo'q | Uzun chiqish suhbatda qoladi | Kichik, bog'liq vazifa |
| O'rnatilgan Explore | Sozlash shart emas; faqat o'qiydi; CLAUDE.md'siz, arzon | Faqat qidiruv | Keng qidiruv |
| O'z subagentingiz | Doimiy ko'rsatma, cheklangan tool'lar, model tanlash | Fayl yozish va yuritish kerak | Takroriy ixtisoslashgan ish (reviewer, tekshiruvchi) |
| `context: fork` bilan skill (25-bob) | Skill alohida kontekstda | Skill sifatida yoziladi | Jarayon + alohida kontekst |
| Ikkinchi sessiya | To'liq mustaqil | Natijani qo'lda ko'chirasiz | Mustaqil review (22-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| "Yaxshiroq javob uchun" subagentga berish | CC: xuddi shu model, javob aqlliroq bo'lmaydi | Subagent — parallellik, alohida kontekst yoki yangi nigoh uchun |
| Har kichik vazifaga subagent | CC: token sarflanadi, ba'zan sekinroq | Kichik vazifani o'zingiz bajaring |
| Reviewer'ga barcha tool'larni berish | U "yordam berib" kodni o'zgartirishi mumkin | `tools: Read, Grep, Glob` — Claude Code majburlaydi |
| Uzun, batafsil `description` | CC: tavsiflar har sessiyada kontekst oladi | Qisqa tavsif, tafsilot tizim ko'rsatmasida |
| Oddiy ishga kuchli model | Ortiqcha xarajat | `model: haiku` |
| Subagent xulosasini tekshirmasdan qabul qilish | Xulosa — boshqa modelning o'qishi; tajribada qiymatlar ishga tushirilmay hisoblangan | Muhim da'volarni ishga tushirib tekshiring |

## Amaliyot

1. Subagent nima va asosiy suhbatga nima qaytaradi?
2. CC bo'yicha subagent qachon arziydi? Uning narxi nima?
3. Nega "yaxshiroq javob uchun subagentga berish" ishlamaydi?
4. Explore, Plan va general-purpose farqi nima?
5. Reviewer subagent'ga nega faqat `Read, Grep, Glob` beriladi?
6. Tajribada reviewer qanday kamchiliklarni topdi va ular qanday tekshirildi?

<details>
<summary>Javoblar</summary>

1. Alohida kontekstda, o'z ko'rsatmasi va tool'lari bilan ishlaydigan ixtisoslashgan yordamchi. Asosiy suhbatga faqat xulosa qaytaradi.
2. Mustaqil ishlarni parallel bajarish, uzun chiqishni asosiy suhbatdan chetda saqlash, kod yozilishini ko'rmagan tekshiruvchi, kamroq tool kerak bo'lganda. Narxi — token (har subagent o'z so'rovlarini yuboradi) va ba'zan vaqt.
3. Standart holatda u xuddi shu (yoki kichikroq) model bo'ladi va xuddi shu vazifani bajaradi. Parallellik yoki yangi nigoh beradi, aqlliroq javob emas.
4. Explore — faqat o'qiydigan qidiruvchi (chuqurlik darajasi bilan). Plan — plan mode'da reja uchun o'rganuvchi, faqat o'qiydi. General-purpose — barcha tool'li, o'rganish va o'zgartirish talab qiladigan ko'p bosqichli vazifalar uchun.
5. Shunda u hech narsani tahrirlay olmaydi, va bu cheklovni so'rov emas, Claude Code majburlaydi.
6. Butun bo'lmagan `kunlar` va manfiy `summa` uchun RangeError yo'qligi, tuzatishni noto'g'ri joyga qo'yish xavfi, testlar yo'qligi va spetsifikatsiyadagi ziddiyat. Qiymatlar `node` bilan ishga tushirib, testlar yo'qligi `grep` bilan tasdiqlandi.

</details>

## Rasmiy hujjat

- [CC: Create custom subagents](https://code.claude.com/docs/en/sub-agents)
- [CC: Best practices — Know what subagents cost](https://code.claude.com/docs/en/best-practices#know-what-subagents-cost)
- [CC: Best practices — What you can stop doing](https://code.claude.com/docs/en/best-practices#what-you-can-stop-doing)
- [CC: Common workflows — Delegate research to subagents](https://code.claude.com/docs/en/common-workflows#delegate-research-to-subagents)
- [CC: Explore the context window](https://code.claude.com/docs/en/context-window)
