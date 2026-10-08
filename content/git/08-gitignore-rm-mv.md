# 08 — `.gitignore`, `rm` va `mv`

[← Oldingi: `diff`: nima o'zgardi](07-diff.md) · [Mundarija](README.md) · [Keyingi: Tarixni ko'rish: `log` →](09-tarixni-korish.md)

## Tushuncha

Loyiha papkasida har doim Git saqlashi **kerak bo'lmagan** fayllar bo'ladi: build natijalari (`build/`, `*.o`), yuklab olingan kutubxonalar (`node_modules/`), log'lar, muharrirning vaqtinchalik fayllari (`*.swp`, `*~`), maxfiy sozlamalar (`.env`). Ular `git status`da "untracked" bo'lib turaveradi, `git add .` qilsangiz esa tasodifan commit'ga tushib qoladi.

Bu bobda uchta vosita bor:

1. **`.gitignore`** — "bu fayllarni ko'rma" degan ro'yxat. Git ularni untracked sifatida ko'rsatmaydi va `git add .` ularni qo'shmaydi.
2. **`git rm`** — kuzatilayotgan (tracked) faylni repo'dan olib tashlash: index'dan va (xohlasangiz) diskdan.
3. **`git mv`** — faylni ko'chirish yoki nomini o'zgartirish va buni darhol stage qilish.

Esingizda bo'lsin (5- va 6-boblar): **tracked** fayl — oxirgi commit'da yoki index'da bor fayl; **untracked** — Git hali bilmaydigan fayl; **index** (staging area) — keyingi commit'ning qoralamasi. Bu bobdagi uchala vosita aynan shu chegarada ishlaydi.

> Eng muhim qoida: **`.gitignore` faqat untracked fayllarga ta'sir qiladi.** Allaqachon kuzatilayotgan faylni `.gitignore`ga yozish uni kuzatuvdan chiqarmaydi. Buning uchun `git rm --cached` kerak.

## Nega shunday: nega Git hamma narsani saqlamaydi

Git sizning ishingizni **snapshot** (to'liq surat) sifatida saqlaydi. Build natijalari, `node_modules/` yoki log'larni saqlash:

- **repo'ni shishiradi** — har commit'da o'zgargan generatsiya qilingan fayl yangi obyekt bo'lib qoladi va tarixdan hech qachon o'z-o'zidan yo'qolmaydi (Git faqat qo'shadi, 1-bob);
- **konflikt manbai** bo'ladi — ikki dasturchi bir xil build faylini turlicha generatsiya qilsa, merge'da ma'nosiz konflikt chiqadi;
- **xavfli** — `.env`dagi parol yoki token commit'ga tushsa, uni tarixdan butunlay o'chirish og'ir ish (42-bob).

Shuning uchun Git "nimani e'tiborsiz qoldirish"ni **fayl orqali** boshqaradi: `.gitignore` o'zi oddiy tracked fayl, u commit qilinadi va repo'ni klon qilgan hamma uchun bir xil ishlaydi.

## Kod: birinchi `.gitignore`

Sinov papkasidagi holat — hali `.gitignore` yo'q:

```text
$ git status --short --untracked-files=all
?? .env
?? README.md
?? TODO
?? build/out.js
?? doc/guide.pdf
?? doc/notes.txt
?? doc/server/arch.txt
?? lib.a
?? libfoo.a
?? logs/app.log
?? node_modules/lodash/index.js
?? src/app.js
?? src/app.o
?? sub/TODO
```

(`--untracked-files=all` papkalarni yig'ib ko'rsatish o'rniga har faylni alohida chiqaradi — misol uchun qulay.)

Endi repo ildiziga `.gitignore` yozamiz. Bu Pro Git'dagi misolning kengaytirilgani:

```gitignore
# kompilyatsiya natijalari
*.[oa]
!lib.a

# faqat ildizdagi TODO
/TODO

# istalgan joydagi build papkasi
build/
node_modules/

# doc ichidagi .txt (pastki papkalarsiz)
doc/*.txt
# doc ichidagi barcha .pdf (har chuqurlikda)
doc/**/*.pdf

logs/
.env
```

Natija:

```text
$ git status --short --untracked-files=all
?? .gitignore
?? README.md
?? doc/server/arch.txt
?? lib.a
?? src/app.js
?? sub/TODO
```

Har qatorni tahlil qilamiz:

| Pattern | Nimani ushladi | Nimani ushlamadi va nega |
| --- | --- | --- |
| `*.[oa]` | `src/app.o`, `libfoo.a` | — (`/` yo'q, shuning uchun har chuqurlikda ishlaydi) |
| `!lib.a` | `lib.a`ni qaytadan "ko'rinadigan" qildi | — |
| `/TODO` | ildizdagi `TODO` | `sub/TODO` — boshidagi `/` patternni `.gitignore` turgan papkaga bog'laydi |
| `build/` | `build/out.js` (butun papka) | oxiridagi `/` — "faqat papka" degani |
| `doc/*.txt` | `doc/notes.txt` | `doc/server/arch.txt` — `*` `/`dan o'tmaydi |
| `doc/**/*.pdf` | `doc/guide.pdf` | — (`**` nol yoki ko'p papka) |
| `logs/`, `.env` | `logs/app.log`, `.env` | — |

`.gitignore` faylining o'zi esa untracked bo'lib turibdi — uni ham commit qilish kerak, shunda qoida jamoaga tarqaladi.

### E'tiborsiz qoldirilganlarni ko'rish

`git status` odatda ignore qilingan fayllarni yashiradi. `--ignored` ularni `!!` belgisi bilan ko'rsatadi:

```text
$ git status --short --ignored
?? .gitignore
?? README.md
?? doc/
?? lib.a
?? src/
?? sub/
!! .env
!! TODO
!! build/
!! doc/guide.pdf
!! doc/notes.txt
!! libfoo.a
!! logs/
!! node_modules/
!! src/app.o
```

## Kod: pattern sintaksisi to'liq

Quyidagi qoidalar rasmiy `gitignore(5)` sahifasidan. Pro Git qisqa ro'yxat beradi; bu yerda hammasi.

**Bo'sh qator va izoh.**

- Bo'sh qator hech narsaga mos kelmaydi — o'qishni osonlashtirish uchun ajratuvchi.
- `#` bilan boshlangan qator — izoh. `#` bilan boshlanadigan fayl nomi kerak bo'lsa, oldiga `\` qo'ying: `\#muhim.txt`.
- Qator oxiridagi bo'shliqlar tashlab yuboriladi, agar `\` bilan "qo'shtirnoqqa olinmasa" (`fayl\ `).

**Inkor — `!`.**

- `!` bilan boshlangan pattern oldingi pattern chiqarib tashlagan faylni **qaytadan qo'shadi**.
- `!` bilan boshlanadigan haqiqiy fayl nomi uchun: `\!belgi.txt`.
- **Muhim cheklov:** agar faylning **ota papkasi** chiqarib tashlangan bo'lsa, faylni qaytarib bo'lmaydi. Git tezlik uchun chiqarib tashlangan papka ichiga umuman kirmaydi, shuning uchun ichidagi fayllarga oid hech qanday pattern ishlamaydi.

**`/` — papka ajratuvchisi.**

- `/` pattern **boshida yoki o'rtasida** bo'lsa — pattern `.gitignore` turgan papkaga nisbatan hisoblanadi (bog'langan).
- Aks holda (`/` umuman yo'q yoki faqat oxirida) — pattern shu daraja va undan pastdagi **istalgan** chuqurlikda mos keladi.
- `/` **oxirida** bo'lsa — faqat papkaga mos keladi, oddiy fayl yoki symlink'ka emas.
- Shuning uchun `doc/frotz/` faqat `doc/frotz` papkasini ushlaydi (`a/doc/frotz`ni emas), `frotz/` esa `frotz` va `a/frotz` papkalarini ushlaydi.
- `doc/frotz` va `/doc/frotz` bir xil ta'sir qiladi: o'rtada `/` bor bo'lsa, boshidagi `/`ning ahamiyati yo'q.

**Joker belgilar (glob).**

| Belgi | Ma'nosi |
| --- | --- |
| `*` | `/`dan boshqa istalgan belgilar (nol yoki ko'p) |
| `?` | `/`dan boshqa bitta istalgan belgi |
| `[abc]`, `[a-z]` | qavs ichidagi bitta belgi yoki diapazon |
| `\` | keyingi belgini oddiy belgi qiladi (`\*` — haqiqiy yulduzcha) |

Pattern oxiridagi yolg'iz `\` — noto'g'ri pattern, hech qachon mos kelmaydi.

**Ikki yulduzcha — `**`.** Faqat to'liq yo'lga nisbatan maxsus ma'noga ega:

| Pattern | Ma'nosi |
| --- | --- |
| `**/foo` | istalgan joydagi `foo` — oddiy `foo` bilan bir xil |
| `**/foo/bar` | istalgan joydagi `foo` papkasining bevosita ichidagi `bar` |
| `abc/**` | `abc` ichidagi hamma narsa, cheksiz chuqurlikda |
| `a/**/b` | `a/b`, `a/x/b`, `a/x/y/b` va hokazo |

Boshqa joydagi ketma-ket yulduzchalar (`a**b`) oddiy `*` kabi ishlaydi.

Rasmiy hujjatdagi yana bir nozik misol: `foo/*` pattern'i `foo/test.json` faylini va `foo/bar` papkasini ushlaydi, lekin `foo/bar/hello.c`ni **o'zi** ushlamaydi — `*` `bar/hello.c`dagi `/`dan o'ta olmaydi. Amalda `foo/bar` papkasi chiqarib tashlangani uchun uning ichi baribir ko'rinmaydi.

Maxsus belgilarni ekranlash sinovi:

```text
$ cat .gitignore
\#muhim.txt
\!belgi.txt
$ git check-ignore -v '#muhim.txt' '!belgi.txt'
esc/.gitignore:1:\#muhim.txt	#muhim.txt
esc/.gitignore:2:\!belgi.txt	!belgi.txt
```

## Kod: ota papka chiqarilgan bo'lsa, `!` ishlamaydi

`logs/` papkasini ignore qilib, ichidagi bitta faylni saqlab qolmoqchimiz:

```gitignore
logs/
!logs/keep.log
```

```text
$ git check-ignore -v logs/keep.log
.gitignore:17:logs/	logs/keep.log
```

`!logs/keep.log` qatori bor, lekin javob — `logs/` qoidasi. Sabab yuqorida aytildi: Git `logs/` papkasini butunlay chetlab o'tadi. Yechim — papkani emas, uning **ichidagilarni** chiqarish:

```gitignore
logs/*
!logs/keep.log
```

```text
$ git check-ignore -v -n logs/keep.log logs/app.log
.gitignore:19:!logs/keep.log	logs/keep.log
.gitignore:17:logs/*	logs/app.log
$ git status --short --untracked-files=all logs
?? logs/keep.log
```

Endi `logs` papkasining o'zi chiqarilmagan, faqat ichidagi fayllar — va inkor ishlaydi.

### "Hammasini chiqar, faqat bittasini qoldir"

Rasmiy hujjatdagi naqsh — faqat `foo/bar` papkasini kuzatish:

```gitignore
/*
!/foo
/foo/*
!/foo/bar
```

```text
$ git status --short --untracked-files=all
?? foo/bar/a.c
$ git status --short --ignored
?? foo/
!! .gitignore
!! foo/baz/
!! other/
!! top.txt
```

`/foo/*` qatoriga e'tibor bering: `/*` bo'lmasa (`/foo` qoldirilsa), `!/foo/bar` ishlamas edi — yuqoridagi "ota papka" qoidasi.

Yana bir kutilmagan natija: `!! .gitignore`. `/*` hamma narsani, jumladan `.gitignore`ning o'zini ham chiqarib tashladi. Haqiqiy loyihada `!/.gitignore` qatorini qo'shing — aks holda yangi klonda `git add .` `.gitignore`ni qo'shmaydi.

## Kod: ichma-ich `.gitignore` fayllari

Oddiy loyihada ildizda bitta `.gitignore` yetadi. Lekin pastki papkalarda ham `.gitignore` bo'lishi mumkin — uning qoidalari faqat **o'sha papka va undan pastdagi** fayllarga taalluqli va patternlar o'sha papkaga nisbatan hisoblanadi. (Pro Git'ga ko'ra Linux yadrosi manbasida 206 ta `.gitignore` bor.)

```text
$ cat doc/.gitignore
# doc ichida: hamma .html e'tiborsiz
*.html
!qolda.html
$ git status --short --untracked-files=all doc
?? doc/.gitignore
?? doc/qolda.html
?? doc/server/arch.txt
$ git check-ignore -v doc/api.html doc/v2/x.html doc/qolda.html
doc/.gitignore:2:*.html	doc/api.html
doc/.gitignore:2:*.html	doc/v2/x.html
doc/.gitignore:3:!qolda.html	doc/qolda.html
```

Pastki papkadagi `.gitignore` yuqoridagidan **ustun**: ildizda `*.html` ignore qilingan bo'lsa ham, `doc/.gitignore`dagi `!qolda.html` uni qaytaradi.

## Kod: `info/exclude` va global ignore

`.gitignore` — jamoa bilan ulashiladigan qoidalar. Lekin ba'zi fayllar **faqat sizga** tegishli:

| Qayerga | Kim uchun | Misol |
| --- | --- | --- |
| `.gitignore` (commit qilinadi) | loyihadagi hamma | `build/`, `node_modules/`, `*.o` |
| `.git/info/exclude` (commit qilinmaydi) | faqat shu repo, faqat siz | shaxsiy qoralama fayl, lokal skript |
| `core.excludesFile` (odatda `~/.config/git/ignore`) | sizning **hamma** repo'laringiz | muharrir fayllari (`*.swp`, `.idea/`), `.DS_Store` |

`git init` `.git/info/exclude`ni izohlar bilan yaratadi:

```text
$ cat .git/info/exclude
# git ls-files --others --exclude-from=.git/info/exclude
# Lines that start with '#' are comments.
# For a project mostly in C, the following would be a good set of
# exclude patterns (uncomment them if you want to use them):
# *.[oa]
# *~
$ echo 'mening-qoralamam.md' >> .git/info/exclude
$ git check-ignore -v mening-qoralamam.md
.git/info/exclude:7:mening-qoralamam.md	mening-qoralamam.md
```

Global ignore fayli: `core.excludesFile` sozlamasi ko'rsatgan fayl. Agar u sozlanmagan bo'lsa, Git `$XDG_CONFIG_HOME/git/ignore`ni, `XDG_CONFIG_HOME` bo'sh bo'lsa — `~/.config/git/ignore`ni o'qiydi. Ya'ni ko'pincha hech narsa sozlamasdan shu faylni yaratish kifoya. Boshqa joyda saqlamoqchi bo'lsangiz:

```bash
git config --global core.excludesFile ~/.gitignore_global
```

Sinov (bu yerda bir martalik `-c` bilan, yo'l qisqartirilgan):

```text
$ echo '*.swp' > .../.gitignore_global
$ git -c core.excludesFile=.../.gitignore_global check-ignore -v .main.js.swp
.../.gitignore_global:1:*.swp	.main.js.swp
```

`info/exclude` va `core.excludesFile` repo tashqarisida turgani uchun ulardagi patternlar **ildizda yozilgandek** hisoblanadi: boshidagi `/` patternni repo ildiziga bog'laydi.

> Ko'p repo'lar Git 2.13 dan beri git'ning o'zi kabi `$GIT_COMMON_DIR/info/exclude` yozuvini ishlatadi — oddiy repo'da bu shunchaki `.git/info/exclude`. Farq faqat worktree'larda (49-bob): hamma worktree bitta umumiy `info/exclude`ni o'qiydi.

## Muhandislik nuqtai nazari: ustunlik tartibi

Bitta yo'lga bir nechta manbadagi pattern mos kelishi mumkin. Rasmiy tartib — yuqoridan pastga, **eng kuchlidan eng kuchsizga**:

```text
1. Buyruq qatoridagi patternlar      (masalan ls-files --exclude=...)
2. .gitignore fayllari               (yo'lga eng yaqin papkadagisi ustun)
3. $GIT_COMMON_DIR/info/exclude
4. core.excludesFile                 (~/.config/git/ignore)
```

**Bitta daraja ichida esa oxirgi mos kelgan pattern hal qiladi.** Shu sababli `!lib.a` `*.[oa]`dan **keyin** yozilishi shart — teskari tartibda `*.[oa]` oxirgi bo'lib, `lib.a`ni yana chiqarib tashlardi.

Yana bir nozik joy: ustunlik faqat "qaysi pattern hal qiladi" haqida. Yuqoridagi "ota papka chiqarilgan" cheklovini hech qanday daraja yengib o'tolmaydi.

`git status` va `git add` kabi yuqori darajadagi buyruqlar hamma manbani o'qiydi. `git ls-files`, `git read-tree` kabi past darajadagi (plumbing, 13-bob) buyruqlar esa faqat buyruq qatorida aytilgan patternlarni oladi.

## Kod: `git check-ignore` — nega bu fayl ko'rinmayapti?

"Faylim `git status`da yo'q, nega?" — eng ko'p uchraydigan savollardan. Javobni `check-ignore -v` beradi: qaysi fayl, qaysi qator, qaysi pattern.

```text
$ git check-ignore -v src/app.o lib.a libfoo.a TODO sub/TODO build/out.js doc/notes.txt doc/server/arch.txt doc/guide.pdf logs/app.log .env README.md
.gitignore:2:*.[oa]	src/app.o
.gitignore:3:!lib.a	lib.a
.gitignore:2:*.[oa]	libfoo.a
.gitignore:6:/TODO	TODO
.gitignore:9:build/	build/out.js
.gitignore:13:doc/*.txt	doc/notes.txt
.gitignore:15:doc/**/*.pdf	doc/guide.pdf
.gitignore:17:logs/	logs/app.log
.gitignore:18:.env	.env
$ echo $?
0
```

Chiqish formati: `<manba>:<qator>:<pattern><TAB><yo'l>`. E'tibor bering:

- `lib.a` chiqdi, lekin pattern `!lib.a` — ya'ni u **ignore qilinmagan**. `-v` "qaysi pattern mos keldi"ni ko'rsatadi, inkor pattern ham shunga kiradi.
- `sub/TODO`, `doc/server/arch.txt`, `README.md` umuman chiqmadi — ularga hech qaysi pattern mos kelmadi.

Opsiyalar:

| Opsiya | Ma'nosi |
| --- | --- |
| `-v`, `--verbose` | pattern va manbani ko'rsatish |
| `-n`, `--non-matching` | mos kelmagan yo'llarni ham chiqarish (faqat `-v` bilan ma'noli) |
| `-q`, `--quiet` | hech narsa chiqarmay, faqat chiqish kodi (bitta yo'l uchun) |
| `--stdin` | yo'llarni standart kirishdan o'qish |
| `-z` | NUL bilan ajratilgan, skript uchun qulay format |
| `--no-index` | index'ga qaramaslik — tracked fayllarni ham tekshirish |

```text
$ git check-ignore -v -n README.md lib.a
::	README.md
.gitignore:3:!lib.a	lib.a
$ git check-ignore -q README.md; echo $?
1
```

Chiqish kodlari: `0` — kamida bitta yo'l ignore qilingan, `1` — hech biri, `128` — xato.

**`--no-index` qachon kerak.** Standart holatda `check-ignore` tracked fayllarni umuman tekshirmaydi (ularga ignore qoidasi ta'sir qilmaydi). Fayl tracked bo'lsa-yu, "nega `.gitignore`ga qaramay commit'ga tushdi" deb tekshirmoqchi bo'lsangiz — `--no-index`. Misol keyingi bo'limda.

## Kod: `git rm` — faylni olib tashlash

Fayldan Git'da qutulish uchun uni **index'dan** olib tashlab, keyin commit qilish kerak. Agar faylni oddiy `rm` bilan o'chirsangiz, Git buni "stage qilinmagan o'zgarish" deb ko'radi:

```text
$ rm PROJECTS.md
$ git status
On branch main
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	deleted:    PROJECTS.md

no changes added to commit (use "git add" and/or "git commit -a")
```

`git rm` o'chirishni stage qiladi:

```text
$ git rm PROJECTS.md
rm 'PROJECTS.md'
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	deleted:    PROJECTS.md
```

> **Pro Git bilan farq.** Kitobda maslahat qatorlari `git checkout -- <file>` va `git reset HEAD <file>...` deydi. Git 2.23 dan beri ular `git restore <file>` va `git restore --staged <file>` — 11-bobda batafsil.

Fayl hali diskda bo'lsa ham, `git rm` uni diskdan **ham** o'chiradi va index'dan chiqaradi — bitta buyruqda. Keyingi commit'dan boshlab fayl kuzatilmaydi. (Oldingi commit'larda u qoladi — tarix o'zgarmaydi.)

### Xavfsizlik tekshiruvi va `-f`

`git rm` faqat **HEAD bilan bir xil** faylni o'chiradi. Fayl o'zgartirilgan yoki o'zgarishi stage qilingan bo'lsa, rad etadi — chunki bu o'zgarish hech qaysi commit'da yo'q va o'chirilsa, uni Git'dan qaytarib bo'lmaydi:

```text
$ echo "yangi qator" >> README.md
$ git rm README.md
error: the following file has local modifications:
    README.md
(use --cached to keep the file, or -f to force removal)
$ git add README.md
$ git rm README.md
error: the following file has changes staged in the index:
    README.md
(use --cached to keep the file, or -f to force removal)
```

`-f` (`--force`) bu tekshiruvni o'chiradi. **Ehtiyot bo'ling:** `git rm -f` commit qilinmagan o'zgarishlarni qaytarib bo'lmaydigan tarzda yo'qotadi (faqat stage qilingan bo'lsa, `git fsck --lost-found` bilan blob'ni topish mumkin — 42-bob).

### `--cached` — diskda qoldirib, kuzatuvdan chiqarish

Eng ko'p ishlatiladigan holat: `.gitignore`ga yozishni unutib, `debug.log`ni commit qilib qo'ygansiz. Endi `.gitignore`ga qo'shasiz — lekin hech narsa o'zgarmaydi:

```text
$ echo 'debug.log' > .gitignore
$ echo "bar" >> debug.log
$ git status --short
 M debug.log
?? .gitignore
$ git check-ignore -v debug.log
$ echo $?
1
$ git check-ignore -v --no-index debug.log
.gitignore:1:debug.log	debug.log
```

Fayl tracked — shuning uchun `M` (modified) ko'rinmoqda, `check-ignore` esa uni tekshirmaydi ham. `--no-index` pattern mos kelishini tasdiqlaydi. Yechim:

```text
$ git rm --cached debug.log
rm 'debug.log'
$ git status --short
D  debug.log
?? .gitignore
$ ls debug.log
debug.log
$ git add .gitignore
$ git commit -m "debug.log kuzatuvdan chiqarildi"
[main 4aa8c1a] debug.log kuzatuvdan chiqarildi
 2 files changed, 1 insertion(+), 1 deletion(-)
 create mode 100644 .gitignore
 delete mode 100644 debug.log
$ git status --short --ignored
!! debug.log
```

Fayl diskda qoldi, commit'da "o'chirildi", endi esa ignore qilinmoqda.

`--cached` ham xavfsizlik tekshiruviga ega, lekin yumshoqroq: index'dagi nusxa **yoki** HEAD'ga, **yoki** diskdagi faylga teng bo'lishi kerak — shunda hech narsa yo'qolmaydi.

### Pattern bilan o'chirish: Git'ning o'z glob'i

`git rm` fayl, papka va glob qabul qiladi. Muhim nozik joy — **glob'ni kim ochadi**:

```text
$ git rm -n log/\*.log
rm 'log/a.log'
rm 'log/old/b.log'
$ git rm -n log/*.log
rm 'log/a.log'
```

- `log/\*.log` — `\` yulduzchani shell'dan yashiradi, uni **Git** ochadi. Git'ning pathspec glob'i papka chegaralaridan **o'tadi**, shuning uchun `log/old/b.log` ham tushdi.
- `log/*.log` — yulduzchani **shell** ochadi va faqat diskdagi `log/a.log`ni beradi.

Shu sababdan rasmiy hujjat ogohlantiradi: `git rm 'd*'` va `git rm 'd/*'` farq qiladi — birinchisi `d2` kabi boshqa papkalarni ham ushlaydi.

`-n` (`--dry-run`) — hech narsa o'chirmaydi, faqat nima o'chishini ko'rsatadi. Glob bilan har doim avval `-n` bilan ishlating.

Papka uchun `-r` shart:

```text
$ git rm log
fatal: not removing 'log' recursively without -r
$ git rm -n -r log
rm 'log/a.log'
rm 'log/old/b.log'
```

Boshqa opsiyalar:

| Opsiya | Ma'nosi |
| --- | --- |
| `-q`, `--quiet` | `rm '...'` qatorlarini chiqarmaslik |
| `--ignore-unmatch` | hech narsa mos kelmasa ham `0` bilan chiqish (skriptlar uchun) |
| `--pathspec-from-file=<fayl>` | yo'llarni fayldan o'qish (`-` — standart kirish) |
| `--sparse` | sparse-checkout konusidan tashqaridagi yozuvlarni ham yangilash (49-bob) |
| `--` | opsiyalar tugadi, keyingisi fayl nomlari (`-f` deb nomlangan fayl bo'lsa) |

```text
$ git rm yoq.txt
fatal: pathspec 'yoq.txt' did not match any files
$ git rm --ignore-unmatch yoq.txt; echo $?
0
```

### Diskdan yo'qolgan fayllarni yozib qo'yish

Fayllarni oddiy `rm` bilan o'chirib bo'lgan bo'lsangiz, ularni bittalab `git rm` qilish shart emas. Rasmiy hujjat uch yo'lni ko'rsatadi:

```text
$ git status --short
 D config.local.json
 D log/a.log
 M numbers.txt
$ git add -u
$ git status --short
D  config.local.json
D  log/a.log
M  numbers.txt
```

- `git add -u` — tracked fayllardagi **hamma** o'zgarishni (o'chirish ham) stage qiladi. `git commit -a` xuddi shuni commit vaqtida qiladi.
- `git add -A` — bunga qo'shimcha yangi (untracked) fayllarni ham qo'shadi.
- Faqat o'chirishlarni stage qilish kerak bo'lsa (boshqa o'zgarishlarga tegmay):

```text
$ git diff --name-only --diff-filter=D -z | xargs -0 git rm --cached
rm 'config.local.json'
rm 'log/a.log'
$ git status --short
D  config.local.json
D  log/a.log
 M numbers.txt
```

`numbers.txt` stage qilinmay qoldi — aynan shu maqsad edi.

## Kod: `git mv` — nomini o'zgartirish

```text
$ git mv README.md README
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	renamed:    README.md -> README
```

Pro Git ta'kidlaydi: bu uchta buyruqqa teng:

```text
$ mv README.md README
$ git status --short
 D README.md
?? README
$ git rm -q README.md
$ git add README
$ git status --short
R  README.md -> README
```

Natija bir xil — `R` (renamed). `git mv` faqat qulaylik: bitta buyruq va xavfsizlik tekshiruvlari.

Bir nechta faylni papkaga ko'chirish (ikkinchi shakl — oxirgi argument mavjud papka bo'lishi shart):

```text
$ git mv -v docs/intro.txt docs/usage.txt archive/
Renaming docs/intro.txt to archive/intro.txt
Renaming docs/usage.txt to archive/usage.txt
$ git status --short
R  docs/intro.txt -> archive/intro.txt
R  docs/usage.txt -> archive/usage.txt
```

Xatolar va opsiyalar:

```text
$ git mv archive/intro.txt z.txt
fatal: destination exists, source=archive/intro.txt, destination=z.txt
$ git mv -n -f archive/intro.txt z.txt
Checking rename of 'archive/intro.txt' to 'z.txt'
Renaming archive/intro.txt to z.txt
$ git mv notr.txt n2.txt
fatal: not under version control, source=notr.txt, destination=n2.txt
```

| Opsiya | Ma'nosi |
| --- | --- |
| `-f`, `--force` | manzil mavjud bo'lsa ham ustiga yozish |
| `-k` | xatoga olib keladigan ko'chirishlarni jim o'tkazib yuborish |
| `-n`, `--dry-run` | faqat nima bo'lishini ko'rsatish |
| `-v`, `--verbose` | ko'chirilgan fayllarni chiqarish |

Submodule'ni `git mv` qilsangiz, Git uning gitfile'i, `core.worktree` va `.gitmodules`dagi yo'lni ham yangilaydi (43-bob).

## Muhandislik nuqtai nazari: Git nomini o'zgartirishni saqlamaydi

Ko'p VCS'lardan farqli o'laroq, Git commit'da "bu fayl qayta nomlandi" degan **hech qanday metama'lumot saqlamaydi**. Commit — snapshot: unda `README` bor, `README.md` yo'q. Xolos.

"Renamed" degan yozuvni Git har safar **o'zi hisoblab chiqaradi**: o'chirilgan fayl va qo'shilgan fayl mazmunini solishtiradi, yetarlicha o'xshash bo'lsa — rename deb ko'rsatadi. Sinov:

```text
$ git mv numbers.txt sonlar.txt
$ echo 21 >> sonlar.txt
$ git add sonlar.txt
$ git status --short
R  numbers.txt -> sonlar.txt
$ git diff --cached -M --stat
 numbers.txt => sonlar.txt | 1 +
 1 file changed, 1 insertion(+)
```

Kichik o'zgarish — hali ham rename. Endi mazmunni butunlay almashtiramiz:

```text
$ git mv numbers.txt sonlar.txt
$ seq 100 120 > sonlar.txt
$ git add sonlar.txt
$ git status --short
D  numbers.txt
A  sonlar.txt
```

`git mv` ishlatilgan bo'lsa ham, natija — "o'chirildi + qo'shildi". Chunki `git mv` hech narsa "eslab qolmaydi", u faqat index'ni o'zgartiradi.

Amaliy xulosalar:

- **Nomini o'zgartirish va katta tahrirni alohida commit qiling.** Shunda `git log --follow` (9-bob) va `git blame` (41-bob) fayl tarixini uzilmasdan kuzatadi.
- Faylni IDE, `mv` yoki boshqa vosita bilan ko'chirish ham mutlaqo to'g'ri — muhimi commit'dan oldin `git add -A` (yoki `rm` + `add`) qilish.
- O'xshashlik chegarasi (`-M50%` standart) va rename aniqlash diff opsiyalari 7-bobda.

## Muhandislik nuqtai nazari: `rm --cached` boshqalarga qanday ta'sir qiladi

`git rm --cached` sizning diskingizda faylni qoldiradi. Lekin commit'da fayl **o'chirilgan**. Bu commit'ni boshqa dasturchi olsa (`pull`, `switch`), Git uning diskidagi faylni **o'chiradi** — chunki uning nuqtai nazaridan tracked fayl o'chirildi. Sinov (klon commit'dan oldingi holatdan yangi holatga o'tdi):

```text
$ ls config.local.json debug.log
config.local.json
debug.log
$ git switch -q main
$ ls debug.log
ls: debug.log: No such file or directory
```

Shuning uchun:

- Bu xavfsiz faqat fayl haqiqatan **generatsiya qilinadigan** bo'lsa (log, build) — hamkasbingiz uni qayta yaratadi.
- Fayl har kimning **lokal sozlamasi** bo'lsa (`config.local.json`), oldindan ogohlantiring yoki namuna fayl (`config.example.json`) qo'shing, har kim undan o'z nusxasini yaratsin.
- Fayl **maxfiy** bo'lsa (`.env` parol bilan), `rm --cached` yetarli emas: u eski commit'larda qoladi va `push` qilingan bo'lsa, allaqachon tarqalgan. Parolni **almashtiring**, tarixni tozalash — 42-bob.

## Muhandislik nuqtai nazari: `.gitignore`ni qanday tuzish

- **Repo yaratishda darhol** `.gitignore` qo'shing — Pro Git maslahati. Keyin tuzatish (`rm --cached`) har doim qimmatroq.
- **Boshlang'ich nuqta:** GitHub'ning `github.com/github/gitignore` repo'sida o'nlab tillar va framework'lar uchun tayyor shablonlar bor.
- **Loyihaga xos** narsalar `.gitignore`ga; **sizning muharriringiz va OS**ga xos narsalar (`.idea/`, `.vscode/`, `.DS_Store`, `*.swp`) — global ignore'ga. Aks holda har bir loyihaning `.gitignore`i hamma jamoa a'zosining muharrirlari ro'yxatiga aylanadi.
- **Bo'sh papka** saqlash kerak bo'lsa: Git faqat fayllarni kuzatadi, papkani emas. Odatiy yo'l — ichiga `.gitkeep` (nomi kelishuv, Git uchun maxsus ma'nosi yo'q) yoki "hammasini chiqar, o'zimni qoldir" mazmunli `.gitignore` qo'yish.
- Git `.gitignore` symlink bo'lsa, unga **ergashmaydi** (rasmiy hujjat) — working tree'dan, index'dan yoki tree'dan o'qilganda bir xil ishlashi uchun.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Tracked faylni `.gitignore`ga yozib, "ishlamayapti" deyish | Ignore faqat untracked fayllarga ta'sir qiladi | `git rm --cached <fayl>`, keyin commit |
| `logs/` + `!logs/keep.log` | Ota papka chiqarilgan — ichiga Git qaramaydi | `logs/*` + `!logs/keep.log` |
| `!lib.a`ni `*.a`dan **oldin** yozish | Bir darajada oxirgi pattern hal qiladi | Inkorni umumiy pattern'dan keyin yozing |
| `build` o'rniga `/build` yozib, pastki papkalardagi `build`ni kutish | Boshidagi `/` faqat ildizga bog'laydi | `build/` (istalgan chuqurlikda, faqat papka) |
| Shaxsiy muharrir fayllarini loyiha `.gitignore`iga yozish | Har kimning odati loyihaga aralashadi | `~/.config/git/ignore` |
| `git rm 'd*'` ni `d/` uchun ishlatish | Git glob'i `d2/`ni ham ushlaydi | `git rm -r d` yoki avval `-n` bilan tekshiring |
| `git rm -f` ni o'ylamay ishlatish | Commit qilinmagan o'zgarish qaytmas yo'qoladi | Avval `git diff`; faqat kuzatuvdan chiqarish uchun `--cached` |
| Parolli `.env`ni `rm --cached` bilan "tuzatdim" deyish | Eski commit'larda va remote'da qoladi | Parolni almashtiring, tarixni tozalang (42-bob) |
| Rename va katta tahrirni bitta commit'da qilish | Git rename'ni aniqlay olmaydi, tarix uziladi | Avval faqat `git mv` commit'i, keyin tahrir |

## Amaliyot

1. Vaqtinchalik repo'da `src/a.o`, `src/a.c`, `build/x`, `sub/build/y`, `TODO`, `sub/TODO` fayllarini yarating. `.gitignore`ni shunday yozingki, faqat `src/a.c` va `sub/TODO` ko'rinsin. Har natijani `git check-ignore -v` bilan tekshiring.
2. `logs/` papkasidagi hamma faylni chiqarib, faqat `logs/.gitkeep`ni kuzatadigan qoida yozing. Avval `logs/` + `!logs/.gitkeep` bilan sinang va nega ishlamasligini `check-ignore -v` bilan ko'rsating.
3. `.git/info/exclude`ga va global ignore'ga (`git -c core.excludesFile=...`) bitta-bitta pattern qo'shing. Uchala manbada bir xil fayl uchun qarama-qarshi patternlar yozib, qaysi biri yutishini tekshiring.
4. Bir faylni commit qiling, keyin `.gitignore`ga yozing. `git status`, `git check-ignore -v` va `git check-ignore -v --no-index` natijalarini solishtiring. So'ng `git rm --cached` bilan to'g'rilang.
5. `git rm -n 'dir/\*.txt'` va `git rm -n dir/*.txt` natijalarini pastki papkasi bor `dir` ustida solishtiring.
6. Faylni `mv` bilan (Git'siz) qayta nomlang, `git status`ga qarang, keyin `git add -A` qiling va `R` paydo bo'lishini ko'ring.
7. (Qiyinroq) Faylni qayta nomlab, mazmunining yarmini o'zgartiring. `git diff --cached -M30%` va `-M90%` natijalarini solishtiring. Keyin ikki alohida commit (avval rename, keyin tahrir) qilib, `git log --follow --oneline <yangi-nom>` tarixni to'liq ko'rsatishini tekshiring.

## Rasmiy hujjat

- Pro Git — Recording Changes to the Repository (Ignoring Files, Removing Files, Moving Files): <https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository>
- `gitignore`: <https://git-scm.com/docs/gitignore>
- `git check-ignore`: <https://git-scm.com/docs/git-check-ignore>
- `git rm`: <https://git-scm.com/docs/git-rm>
- `git mv`: <https://git-scm.com/docs/git-mv>
- GitHub `.gitignore` shablonlari: <https://github.com/github/gitignore>
