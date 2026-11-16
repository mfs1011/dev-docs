# 31 — Parallel sessiyalar va worktree

[Mundarija](README.md)

## Tushuncha

Bitta terminalda agent yangi funksiya yozyapti, ikkinchisida siz boshqa agentga xatoni tuzattirmoqchisiz. Ikkalasi bir papkada
ishlasa, ular bir-birining fayllarini o'zgartirib yuboradi. Yechim — **git worktree**.

CC (Run parallel sessions with worktrees): **git worktree** — o'z fayllari va branch'i bor alohida ishchi papka. U asosiy checkout
bilan bir xil repo tarixi va remote'ni baham ko'radi. Har Claude Code sessiyasi o'z worktree'sida ishlasa, har biri fayllarning
**alohida nusxasini** tahrirlaydi: bir sessiya funksiya quradi, ikkinchisi xatoni tuzatadi.

```text
repo/                          ← asosiy checkout (main)
├── .git/                      ← umumiy tarix
└── .claude/worktrees/
    ├── feature-auth/          ← 1-sessiya, branch: worktree-feature-auth
    └── bugfix-login/          ← 2-sessiya, branch: worktree-bugfix-login
```

### Ishga tushirish

CC (worktrees):

```bash
claude --worktree feature-auth
```

- Worktree repo ildizidagi `.claude/worktrees/<nom>/` da, `worktree-<nom>` nomli yangi branch'da yaratiladi.
- Boshqa terminalda boshqa nom bilan yana ishga tushirsangiz, ikkinchi alohida sessiya ochiladi.
- Nom berilmasa, Claude `bright-running-fox` kabi nom o'ylab topadi.
- Sessiya davomida "worktree'da ishla" deyish ham mumkin — Claude `EnterWorktree` tool'i bilan yaratadi.

CC maslahati: `.claude/worktrees/` ni `.gitignore` ga qo'shing, shunda worktree mazmuni asosiy checkout'da kuzatilmagan fayl bo'lib
ko'rinmaydi.

**Worktree — yangi checkout.** Unda bog'liqliklar o'rnatilmagan bo'ladi. Agentdan ularni o'rnatishni so'rang yoki loyihani o'zingiz
sozlang. `.env` kabi gitignore qilingan fayllarni har yangi worktree'ga avtomatik ko'chirish uchun `.worktreeinclude` fayli bor.

### Qaysi branch'dan ochiladi

CC (worktrees, "Choose the base branch") — `worktree.baseRef` sozlamasi:

| Qiymat | Worktree qayerdan boshlanadi |
| --- | --- |
| `"fresh"` (standart) | Remote'dagi standart branch (odatda `main`): toza, remote'ga mos daraxt |
| `"head"` | Joriy lokal `HEAD`: push qilinmagan commit'lar va feature branch holati bilan |

Bu muhim tafsilot, quyidagi tajribada amalda ko'rindi.

### Izolyatsiya qanday majburlanadi

CC (worktrees) bo'yicha sessiya worktree'da bo'lganda Claude Code to'rtta tekshiruv qiladi:

| Tekshiruv | Nimani bloklaydi |
| --- | --- |
| Fayl tahrirlari | Asosiy checkout'dagi faylga `Edit`/`Write` |
| Buyruq papkasi | Ishchi papkasi asosiy checkout'da bo'lgan Bash buyrug'i |
| Git yo'naltirishlar | `git -C`, `--git-dir`, `GIT_DIR` va hokazo bilan asosiy checkout'ga yo'naltirilgan git |
| Buyruq shakli | Git qayerda ishlashini matndan aniqlab bo'lmaydigan buyruq |

CC cheklovni ham aytadi: bu tekshiruvlar shell buyrug'i qaysi faylga yozishini kuzatmaydi. `cp` yoki shell yo'naltirishi bilan asosiy
checkout'ga yozadigan buyruq (git ishlatmasa) ular tomonidan rad etilmaydi. Uni ruxsatlar va sandbox nazorat qiladi (VII qism).

Worktree asosiy checkout bilan nimalarni baham ko'radi (CC):

- **`.git` papkasi** — git buyruqlari umumiy repo'ga yozadi;
- **project doirasidagi plaginlar**;
- **ruxsat tasdiqlari** — worktree'da "Yes, and don't ask again" desangiz, qoida asosiy checkout'ning `.claude/settings.local.json` iga
  yoziladi va barcha worktree'larda amal qiladi.

### Tozalash

CC (worktrees):

| Holat | Interaktiv sessiyadan chiqishda |
| --- | --- |
| Worktree toza (o'zgarish yo'q) | Nomsiz sessiyada worktree va branch avtomatik o'chiriladi; nomlangan sessiyada so'raladi |
| Worktree'da ish bor | Saqlash yoki o'chirishni so'raydi; qaytish uchun `claude --worktree <nom> --resume` buyrug'ini chiqaradi |

**`-p` (skript rejimi)da chiqish so'rovi yo'q.** Claude Code bunday worktree'larni tozalamaydi va yaratishda qo'ygan qulfini qoldiradi.
Ularni `git worktree remove` bilan o'zingiz o'chirasiz; qulflangan bo'lsa, avval `git worktree unlock`.

### Parallel ishlashning boshqa yo'llari

CC (Run agents in parallel) — beshta yo'l:

| Yo'l | Nima beradi | Qachon |
| --- | --- | --- |
| Subagentlar | Bitta sessiya ichida, alohida kontekstda yon vazifa (30-bob) | Yon vazifa suhbatni to'ldirib yuborsa |
| Agent view (`claude agents`) | Fonda ishlayotgan sessiyalarni bitta ekrandan berish va kuzatish (tadqiqot preview'i) | Bir nechta mustaqil vazifani topshirib, faqat kerak bo'lganda aralashmoqchisiz |
| Agent teams | Umumiy vazifalar ro'yxati va o'zaro xabar almashinadigan muvofiqlashgan sessiyalar (tajribaviy, standart o'chiq) | 32-bob |
| Dinamik workflow | Ko'p subagentni ishga tushirib, natijalarini o'zaro tekshiradigan skript | 32-bob |
| Projects | claude.ai/code yoki desktop'da Claude parallel "thread"lar ochadigan uzoq muloqot | Kunlar va haftalar davom etadigan ish |

CC bo'yicha worktree o'zi agent ishga tushirish usuli emas, balki ularni qo'llab-quvvatlaydigan vosita: har sessiyaga alohida
checkout beradi. Agent view'dan berilgan sessiya fayllarni tahrirlashdan oldin o'z worktree'siga o'tadi. Subagentlarga ham
`isolation: worktree` bilan alohida worktree berish mumkin (30-bob).

CC ogohlantiradi: bir vaqtda bir nechta sessiya yoki subagent ishlatish **token sarfini ko'paytiradi**.

## Amalda: ikki agent, bitta fayl, bir vaqtda

Sinov repo'sida (`main` branch, `.claude/worktrees/` `.gitignore` da) ikkita `claude -p --worktree` sessiyasi **bir vaqtda**
ishga tushirildi. Ikkalasi ham `narx.js` va `narx.test.js` ni o'zgartirishi kerak edi (Claude Code 2.1.325):

```bash
claude -p "narx.js ga qaytarish(summa, foiz) funksiyasini qo'sh ... va test yoz. Oxirida ... 'feat: qaytarish' xabari bilan commit qil." \
  --worktree qaytarish ... &
claude -p "narx.js dagi chegirma funksiyasiga validatsiya qo'sh: foiz 0..100 oralig'idan tashqarida bo'lsa RangeError, ... commit qil." \
  --worktree chegirma ... &
wait
```

Ikkalasi taxminan 32 soniyada tugadi (15:39:54 → 15:40:26). `git worktree list`:

```text
…/lab/v21                              a89cabd [main]
…/lab/v21/.claude/worktrees/chegirma   29e0352 [worktree-chegirma] locked
…/lab/v21/.claude/worktrees/qaytarish  fd5c914 [worktree-qaytarish] locked
```

Asosiy checkout'da `git status` bo'sh edi: agentlar unga tegmadi. Har birining branch'ida bittadan commit:

```text
== worktree-qaytarish
fd5c914 feat: qaytarish
 narx.js      |  6 ++++++
 narx.test.js | 13 ++++++++++++-
== worktree-chegirma
29e0352 fix: chegirma foizni tekshiradi
 narx.js      |  4 ++++
 narx.test.js | 12 ++++++++++++
```

### Kutilmagan tafsilot: asos branch

Diff'da ikkala branch'da ham `.gitignore` dan bir qator "o'chirilgandek" ko'rindi. Sabab: `.claude/worktrees/` qatori `main` dagi
**lokal, push qilinmagan** commit'da edi. Worktree'lar esa standart `"fresh"` qiymati bo'yicha **remote'ning** standart branch'idan
(`origin/main`) ochilgan, unda bu commit yo'q edi. Hujjatdagi qoida shu yerda ko'rindi: agent push qilinmagan ishingiz ustida
ishlashi kerak bo'lsa, `worktree.baseRef: "head"` kerak.

### Merge va tozalash

```bash
git merge --no-edit worktree-qaytarish
git merge --no-edit worktree-chegirma
```

Ikkala merge ham to'qnashuvsiz o'tdi: agentlar bir faylning turli joylarini o'zgartirgan edi. Merge'dan keyin `npm test`: `tests 8`,
`pass 8`, `fail 0`.

Worktree'larni o'chirish:

```text
$ git worktree remove .claude/worktrees/qaytarish
fatal: cannot remove a locked working tree, lock reason: claude session qaytarish (pid 32577 start Mon Nov 16 10:39:54 2026)
$ git worktree unlock .claude/worktrees/qaytarish && git worktree remove .claude/worktrees/qaytarish
```

`-p` sessiyasi qoldirgan qulf hujjatda aytilganidek ko'rindi va `unlock` dan keyin worktree o'chdi.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Bitta papka, navbatma-navbat | Oddiy | Parallellik yo'q | Bitta vazifa |
| `claude --worktree <nom>` | Har sessiya alohida nusxada; asosiy checkout toza | Har worktree'da bog'liqliklarni o'rnatish kerak; tozalashni kuzatish kerak | Bir vaqtda 2–3 mustaqil vazifa |
| `git worktree add` (qo'lda) | Istalgan mavjud branch'dan | Ko'proq qo'l ishi | Muayyan branch'dan boshlash kerak bo'lsa |
| Agent view (`claude agents`) | Bitta ekrandan berish va kuzatish | Tadqiqot preview'i | Ko'p fon vazifasi |
| `isolation: worktree` subagent | Har subagent alohida nusxada | Token sarfi | Parallel subagentlar bir fayllarni o'zgartirsa |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Ikki agentni bitta papkada ishga tushirish | Fayllar to'qnashadi | Har biriga `--worktree` |
| Push qilinmagan ish ustida worktree kutish | CC: standart `"fresh"` — remote branch'dan | `worktree.baseRef: "head"` yoki avval push |
| `.claude/worktrees/` ni `.gitignore` ga qo'shmaslik | Worktree'lar kuzatilmagan fayl bo'lib ko'rinadi | CC maslahati: `.gitignore` ga qo'shing |
| `-p` worktree'larini unutib qo'yish | CC: skript rejimi tozalamaydi va qulf qoldiradi | `git worktree unlock` + `git worktree remove` |
| Worktree'da bog'liqliklarni o'rnatmaslik | Yangi checkout — `node_modules` yo'q | Agentga o'rnatishni ayting yoki `.worktreeinclude` |
| Worktree'ni to'liq izolyatsiya deb hisoblash | CC: `cp` yoki shell yo'naltirishi asosiy checkout'ga yozishi mumkin | Ruxsatlar va sandbox (VII qism) |

## Amaliyot

1. Git worktree nima va u parallel sessiyalarga qanday yordam beradi?
2. `claude --worktree feature-auth` qayerda va qaysi branch'da worktree yaratadi?
3. `worktree.baseRef` ning `"fresh"` va `"head"` qiymatlari farqi nima? Tajribada bu qanday ko'rindi?
4. Claude Code worktree izolyatsiyasini qanday majburlaydi va nimani qamrab olmaydi?
5. `-p` bilan yaratilgan worktree'ni qanday o'chirasiz?
6. CC bo'yicha parallel ishlashning qanday yo'llari bor?

<details>
<summary>Javoblar</summary>

1. O'z fayllari va branch'i bor, lekin repo tarixini baham ko'radigan alohida ishchi papka. Har sessiya o'z nusxasini tahrirlaydi, shuning uchun parallel sessiyalar to'qnashmaydi.
2. Repo ildizidagi `.claude/worktrees/feature-auth/` da, `worktree-feature-auth` branch'ida.
3. `"fresh"` — remote'dagi standart branch'dan, `"head"` — joriy lokal `HEAD` dan (push qilinmagan commit'lar bilan). Tajribada lokal `.gitignore` commit'i worktree'larda yo'q edi, chunki ular `origin/main` dan ochilgan.
4. Asosiy checkout'ga `Edit`/`Write` ni, ishchi papkasi asosiy checkout'da bo'lgan buyruqlarni, git yo'naltirishlarini va git qayerda ishlashi aniqlanmaydigan buyruqlarni bloklaydi. Shell buyrug'i qaysi faylga yozishini (`cp`, yo'naltirish) kuzatmaydi.
5. `git worktree remove <yo'l>`; qulflangan bo'lsa, avval `git worktree unlock <yo'l>`.
6. Subagentlar, agent view, agent teams, dinamik workflow'lar va projects; yordamchi vositalar — worktree, sessiyalararo xabar almashish, `/batch`.

</details>

## Rasmiy hujjat

- [CC: Run parallel sessions with worktrees](https://code.claude.com/docs/en/worktrees)
- [CC: Run agents in parallel](https://code.claude.com/docs/en/agents)
- [CC: Agent view](https://code.claude.com/docs/en/agent-view)
- [CC: Create custom subagents — isolation](https://code.claude.com/docs/en/sub-agents)
- [git-worktree](https://git-scm.com/docs/git-worktree)
