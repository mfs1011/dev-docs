# 47 — Hook'lar

[← Oldingi: `.gitattributes`](46-gitattributes.md) · [Mundarija](README.md) · [Keyingi: Muhit o'zgaruvchilari →](48-muhit-ozgaruvchilari.md)

## Tushuncha

**Hook** (ilgak) — Git ma'lum bir ish paytida o'zi chaqiradigan sizning dasturingiz. O'xshatish: eshik oldidagi qorovul. Git "commit yaratmoqchiman", "push qabul qilmoqchiman" degan paytda avval qorovuldan so'raydi; qorovul "yo'q" desa (nolga teng bo'lmagan chiqish kodi), ish to'xtaydi. Ba'zi qorovullar esa faqat "ish bo'ldi" deb xabar beradi va hech narsani to'xtata olmaydi.

Hook'lar ikki guruhga bo'linadi:

- **Klient hook'lari** — sizning kompyuteringizda, lokal amallar paytida ishlaydi: commit, merge, rebase, checkout, push (yuborishdan oldin).
- **Server hook'lari** — push qabul qilayotgan repo'da (odatda bare repo) ishlaydi: `pre-receive`, `update`, `post-receive`. Siyosatni **majburiy** qilishning yagona ishonchli joyi shu.

Hook qayerda turadi? Ma'lumotnoma (`githooks`) bo'yicha:

- Standart joy — `$GIT_DIR/hooks/` (oddiy repo'da `.git/hooks/`, [13-bob](13-plumbing-va-porcelain.md)). Buni `core.hooksPath` sozlamasi bilan boshqa papkaga o'zgartirish mumkin.
- Fayl nomi aynan hodisa nomi bo'lishi kerak (`pre-commit`, `.sh` kabi qo'shimchasiz) va **bajariladigan** (`chmod +x`) bo'lishi kerak. Bajariladigan biti yo'q hook e'tiborsiz qoldiriladi.
- Til farqi yo'q: shell, Python, Ruby, Perl — birinchi qatordagi `#!` ga qarab ishga tushadi. Git bilan keladigan namunalar shell va Perl'da.
- Git 2.54 dan boshlab hook'ni fayl qo'ymasdan, **konfiguratsiyada** ham e'lon qilish mumkin (`hook.<nom>.command`), bitta hodisaga bir nechta buyruq bilan. Bu bob oxirida.

Hook ishga tushishidan oldin Git joriy papkani o'zgartiradi: oddiy repo'da — **working tree ildizi**, bare repo'da — `$GIT_DIR`. Istisno: push paytidagi server hook'lari (`pre-receive`, `update`, `post-receive`, `post-update`, `push-to-checkout`) doim `$GIT_DIR` da ishlaydi.

Hook ma'lumotni uch yo'l bilan oladi: **argumentlar**, **standart kirish (stdin)** va **muhit o'zgaruvchilari**. Har hook uchun qaysi biri ishlatilishi quyidagi jadvalda.

### Klient hook'lari — to'liq jadval

| Hook | Kim chaqiradi, qachon | Argumentlar / stdin | Nolsiz chiqish kodi | `--no-verify` |
| --- | --- | --- | --- | --- |
| `pre-commit` | `git commit`, xabar so'ralishidan oldin | yo'q | commit to'xtaydi | o'tkazib yuboradi |
| `pre-merge-commit` | `git merge`, merge muvaffaqiyatli bo'lgandan keyin, xabardan oldin | yo'q | merge commit yaratilmaydi | o'tkazib yuboradi |
| `prepare-commit-msg` | `git commit`, standart xabar tayyorlangandan keyin, muharrirdan oldin | 1: xabar fayli, 2: manba, 3: commit | commit to'xtaydi | **ta'sir qilmaydi** |
| `commit-msg` | `git commit` va `git merge`, xabar yozilgandan keyin | 1: xabar fayli | commit to'xtaydi | o'tkazib yuboradi |
| `post-commit` | `git commit`, commit yaratilgandan keyin | yo'q | ta'sir qilmaydi | — |
| `pre-rebase` | `git rebase`, boshlanishidan oldin | 1: upstream, 2: branch (joriy bo'lsa yo'q) | rebase boshlanmaydi | — |
| `post-checkout` | `git checkout`/`switch` (va `clone`, `worktree add`) working tree yangilangandan keyin | 1: oldingi HEAD, 2: yangi HEAD, 3: `1` (branch) yoki `0` (fayl) | natijaga ta'sir qilmaydi, lekin buyruqning chiqish kodi bo'ladi | — |
| `post-merge` | `git merge` (shu jumladan `git pull`) muvaffaqiyatli bo'lgandan keyin | 1: squash merge'mi (`1`/`0`) | ta'sir qilmaydi; konfliktda umuman ishlamaydi | — |
| `post-rewrite` | `commit --amend` va `rebase` | 1: `amend` yoki `rebase`; stdin: `<eski> <yangi>` | ta'sir qilmaydi | — |
| `pre-push` | `git push`, remote ref'lari olingandan keyin, obyekt yuborishdan oldin | 1: remote nomi, 2: URL; stdin: `<lokal-ref> <lokal-oid> <remote-ref> <remote-oid>` | hech narsa yuborilmaydi | o'tkazib yuboradi |
| `reference-transaction` | ref'ni yangilaydigan **har qanday** buyruq | 1: holat (`preparing`, `prepared`, `committed`, `aborted`); stdin: `<eski> <yangi> <ref>` | faqat `preparing`/`prepared` da tranzaksiyani bekor qiladi | — |
| `pre-auto-gc` | `git gc --auto`, tozalashdan oldin | yo'q | `gc --auto` to'xtaydi | — |
| `applypatch-msg` | `git am`, patch xabari uchun | 1: xabar fayli | `git am` to'xtaydi | — |
| `pre-applypatch` | `git am`, patch qo'llangandan keyin, commit'dan oldin | yo'q | commit qilinmaydi | — |
| `post-applypatch` | `git am`, commit'dan keyin | yo'q | ta'sir qilmaydi | — |
| `post-index-change` | index yozilganda | 1: working tree yangilandimi, 2: skip-worktree bitlari o'zgarishi mumkinmi | — | — |
| `sendemail-validate` | `git send-email`, har xatdan oldin | 1: xat fayli, 2: SMTP sarlavhalari fayli | hech qaysi xat yuborilmaydi | — |
| `fsmonitor-watchman` | `core.fsmonitor` shu hook'ga ko'rsatilsa | versiya va vaqt/token | xatoda Git hamma faylni o'zi tekshiradi | — |

Bundan tashqari `p4-*` hook'lari (`git p4 submit` uchun) bor — ular faqat Perforce bilan ishlaydiganlarga kerak.

### Server hook'lari

| Hook | Qachon | Kirish | Nolsiz chiqish kodi |
| --- | --- | --- | --- |
| `pre-receive` | push qabul qilinganda, **birorta ref yangilanishidan oldin**, bir marta | stdin: har ref uchun `<eski-oid> <yangi-oid> <ref>` | **hech bir** ref yangilanmaydi |
| `update` | har ref uchun alohida, shu ref yangilanishidan oldin | 1: ref, 2: eski oid, 3: yangi oid | faqat **shu** ref rad etiladi |
| `proc-receive` | `receive.procReceiveRefs` ga mos ref'lar uchun; ref'ni Git emas, hook o'zi yangilaydi | pkt-line protokoli | shu guruh buyruqlari muvaffaqiyatsiz |
| `post-receive` | hamma ref ishlangandan keyin, kamida bittasi yangilangan bo'lsa | stdin: muvaffaqiyatli yangilangan ref'lar (`pre-receive` formatida) | ta'sir qilmaydi |
| `post-update` | hamma ref yangilangandan keyin | argumentlar: yangilangan ref nomlari (eski/yangi qiymatsiz) | ta'sir qilmaydi |
| `push-to-checkout` | `receive.denyCurrentBranch=updateInstead` bo'lganda checkout qilingan branch'ga push | 1: yangi commit | push rad etiladi |

`post-update` eskiroq: u qaysi ref'lar yangilanganini biladi, lekin eski va yangi qiymatlarini bilmaydi. Ma'lumotnoma shu sabab `post-receive` ni tavsiya qiladi. Standart `post-update` namunasi `git update-server-info` ni ishga tushiradi — bu "dumb" HTTP transporti uchun kerak ([29-bob](29-fetch-push-ichidan.md)).

Server hook'larining stdout va stderr'i push qilayotgan odamga `remote:` prefiksi bilan qaytariladi — shuning uchun oddiy `echo` bilan tushuntirish yozish mumkin.

## Nega shunday: nega hook'lar clone bilan kelmaydi?

`git clone` faqat obyekt va ref'larni ko'chiradi; `.git/hooks` papkasi, `.git/config` kabi lokal narsalar kelmaydi. Bu ataylab qilingan: hook — **bajariladigan kod**. Agar clone qilish bilan begona repo'dagi skript sizning kompyuteringizda avtomatik ishlay boshlasa, har `git clone` xavfli bo'lardi (birinchi `git checkout` dayoq `post-checkout` ishga tushadi).

Bundan ikki xulosa chiqadi:

1. **Klient hook'lari — yordamchi, majburlovchi emas.** Dasturchi ularni o'rnatmasligi, `--no-verify` bilan chetlab o'tishi yoki o'chirib qo'yishi mumkin. Pro Git ham shuni aytadi: siyosatni majburiy qilmoqchi bo'lsangiz, server tomonida qiling.
2. **Klient hook'larini ulashish — alohida qadam.** Skriptlarni repo ichidagi papkada saqlab, har kim o'zi `core.hooksPath` bilan yoqadi, yoki konfiguratsiyadagi hook'lar va tashqi vositalar ishlatiladi. Bu qaror ongli ravishda har bir dasturchi tomonidan qilinadi.

Yaxshi amaliyot: bir xil qoida **ikkala** tomonda. Klient hook'i xatoni erta, commit paytida ko'rsatadi (tuzatish oson). Server hook'i esa uni chetlab o'tganlarni ushlaydi. Pro Git'ning "An Example Git-Enforced Policy" bo'limi aynan shu tuzilishda — biz quyida uni Ruby o'rniga shell'da qayta quramiz.

## Kod: namunalar va hook'ni yoqish

`git init` hook papkasiga namunalarni ko'chiradi ([13-bob](13-plumbing-va-porcelain.md)). Ular `git init` dagi **shablon papkasidan** (template directory) keladi:

```bash
$ git init -b main ilova
$ cd ilova
$ ls .git/hooks
applypatch-msg.sample
commit-msg.sample
fsmonitor-watchman.sample
post-update.sample
pre-applypatch.sample
pre-commit.sample
pre-merge-commit.sample
pre-push.sample
pre-rebase.sample
pre-receive.sample
prepare-commit-msg.sample
push-to-checkout.sample
sendemail-validate.sample
update.sample
```

Hammasi `.sample` bilan tugaydi, shuning uchun hech biri ishlamaydi. Namunalar ikki vazifani bajaradi: tayyor misol va har hook qanday argument olishini ko'rsatuvchi hujjat. Namunani yoqish — `.sample` ni olib tashlab nusxa olish; `pre-commit.sample` misoli [10-bobda](10-yaxshi-commit.md) ko'rsatilgan. Ma'lumotnoma bo'yicha standart namunalar nima qiladi:

| Namuna | Yoqilsa |
| --- | --- |
| `pre-commit` | ASCII bo'lmagan fayl nomlari va qator oxiridagi bo'sh joyni rad etadi (`hooks.allownonascii=true` birinchisini o'chiradi) |
| `commit-msg` | Takrorlangan `Signed-off-by` trailer'ini topsa, commit'ni to'xtatadi |
| `prepare-commit-msg` | Shablondagi izoh qismidagi yordam matnini olib tashlaydi |
| `pre-merge-commit`, `pre-applypatch` | `pre-commit` ni chaqiradi (u yoqilgan bo'lsa) |
| `applypatch-msg` | `commit-msg` ni chaqiradi |
| `update` | Annotatsiyasiz teg'larni push qilishni taqiqlaydi (`hooks.allowunannotated` bilan ruxsat) |
| `post-update` | `git update-server-info` |

### Hook'lar qaysi tartibda ishlaydi — "josus" hook

Har hook qachon va qanday argument bilan chaqirilishini ko'rishning eng aniq yo'li — o'z nomini va argumentlarini chop etadigan bitta skript yozib, uni ko'p nomga bog'lash:

```bash
$ cat .git/hooks/josus
#!/bin/sh
nom=$(basename "$0")
echo ">> $nom $*" >&2
case "$nom" in
  pre-push|reference-transaction|post-rewrite|pre-receive|post-receive)
    while read -r qator; do echo "   stdin: $qator" >&2; done ;;
esac
exit 0
$ chmod +x .git/hooks/josus
$ for h in pre-commit prepare-commit-msg commit-msg post-commit post-checkout post-merge pre-rebase post-rewrite pre-merge-commit; do ln -s josus .git/hooks/$h; done
$ ls -l .git/hooks | grep -v sample
total 136
lrwxr-xr-x  1 ali   staff     5 Oct  8 17:29 commit-msg -> josus
-rwxr-xr-x  1 ali   staff   217 Oct  8 17:29 josus
lrwxr-xr-x  1 ali   staff     5 Oct  8 17:29 post-checkout -> josus
lrwxr-xr-x  1 ali   staff     5 Oct  8 17:29 post-commit -> josus
...
```

Oddiy commit:

```bash
$ git commit -a -m "Xayr qo'shildi"
>> pre-commit
>> prepare-commit-msg .git/COMMIT_EDITMSG message
>> commit-msg .git/COMMIT_EDITMSG
>> post-commit
[main cfffc08] Xayr qo'shildi
 1 file changed, 1 insertion(+)
```

Tartib: `pre-commit` (xabar hali yo'q) → `prepare-commit-msg` (`-m` berilgani uchun manba `message`) → `commit-msg` → commit yaratiladi → `post-commit`. Xabar `.git/COMMIT_EDITMSG` faylida turadi va hook'ga **yo'l** sifatida beriladi, matnning o'zi emas.

`--amend` qo'shimcha `post-rewrite` ni chaqiradi — stdin'da eski va yangi commit:

```bash
$ git commit --amend -m "Xayr qatori qo'shildi"
>> pre-commit
>> prepare-commit-msg .git/COMMIT_EDITMSG message
>> commit-msg .git/COMMIT_EDITMSG
>> post-commit
>> post-rewrite amend
   stdin: cfffc082b49d61d340d6fc24eee084b1952475ec 275d935624a81248876429e559c1d3c057b7a58d
[main 275d935] Xayr qatori qo'shildi
 Date: Wed Oct 7 10:00:00 2026 +0500
 1 file changed, 1 insertion(+)
```

Branch almashtirish va merge:

```bash
$ git switch -c feat/123-salom
Switched to a new branch 'feat/123-salom'
>> post-checkout 275d935624a81248876429e559c1d3c057b7a58d 275d935624a81248876429e559c1d3c057b7a58d 1
...
$ git switch main
Switched to branch 'main'
>> post-checkout 6fc674ce158a0e3dc7de4773bb4b6900ad786490 275d935624a81248876429e559c1d3c057b7a58d 1
...
$ git merge --no-edit feat/123-salom
>> pre-merge-commit
>> prepare-commit-msg .git/MERGE_MSG merge
>> commit-msg .git/MERGE_MSG
Merge made by the 'ort' strategy.
 app.sh | 1 +
 1 file changed, 1 insertion(+)
>> post-merge 0
```

E'tibor bering:

- `post-checkout` ning uchinchi argumenti `1` — branch almashdi. Yangi branch yaratilganda oldingi va yangi HEAD bir xil (bir commit'ga ko'rsatadi).
- Merge commit uchun `pre-commit` emas, `pre-merge-commit` ishladi; `post-commit` esa **ishlamadi** — uning o'rniga `post-merge` (argument `0` — squash emas).
- Xabar fayli endi `.git/MERGE_MSG`, manba `merge`.

Fayl checkout va rebase:

```bash
$ git checkout HEAD~1 -- README.md
>> post-checkout 0ef82408db7a795def864ec1e3b2c9b2f669ad57 0ef82408db7a795def864ec1e3b2c9b2f669ad57 0
$ git restore --staged --worktree README.md
>> post-checkout 0ef82408db7a795def864ec1e3b2c9b2f669ad57 0ef82408db7a795def864ec1e3b2c9b2f669ad57 0
$ git switch -q feat/123-salom
>> post-checkout 0ef82408db7a795def864ec1e3b2c9b2f669ad57 6fc674ce158a0e3dc7de4773bb4b6900ad786490 1
$ git rebase main
>> pre-rebase main
>> post-checkout 6fc674ce158a0e3dc7de4773bb4b6900ad786490 0ef82408db7a795def864ec1e3b2c9b2f669ad57 1
Successfully rebased and updated refs/heads/feat/123-salom.
```

- Fayl tiklashda bayroq `0`. Sinovda `git restore` ham `post-checkout` ni chaqirdi — ma'lumotnoma faqat `checkout`/`switch` ni aytadi, lekin `restore` ichkarida checkout kodidan foydalanadi. Bunga tayanmang, lekin hook'ingiz `restore` paytida ham ishlashini kutib qo'ying.
- `pre-rebase` bitta argument oldi (`main`), chunki joriy branch rebase qilindi. Bu rebase fast-forward bo'lib chiqdi (hech bir commit qayta yozilmadi), shuning uchun `post-rewrite` chaqirilmadi.

### Hook qayerda va qanday muhitda ishlaydi

```bash
$ cat .git/hooks/pre-commit
#!/bin/sh
echo "pwd: $(pwd)" >&2
env | grep '^GIT_' | ... | sort >&2
$ cd src
$ git commit -q -m "a qo'shildi"
pwd: /tmp/misol/ilova
GIT_EDITOR=:
GIT_EXEC_PATH=/opt/homebrew/opt/git/libexec/git-core
GIT_INDEX_FILE=.git/index
GIT_PREFIX=src/
$ cd ..
$ git commit -q -a -m "a o'zgardi"
pwd: /tmp/misol/ilova
GIT_EDITOR=:
GIT_EXEC_PATH=/opt/homebrew/opt/git/libexec/git-core
GIT_INDEX_FILE=/tmp/misol/ilova/.git/index.lock
GIT_PREFIX=
```

(`grep -v` bilan wrapper o'rnatgan muallif o'zgaruvchilari olib tashlangan.) Bundan nimani o'rganamiz:

- `src/` ichida turib commit qilsak ham, hook working tree **ildizida** ishladi. Foydalanuvchi qaysi papkada turgani `GIT_PREFIX` da (`src/`).
- `GIT_EDITOR=:` — ma'lumotnoma: commit hook'lari muharrir ochilmaydigan holatda (`-m` berilgan) shu qiymat bilan chaqiriladi. `:` — shell'da "hech narsa qilmaydigan" buyruq.
- `commit -a` da `GIT_INDEX_FILE` vaqtinchalik `.git/index.lock` ga ko'rsatadi: `-a` avval yangi index tayyorlaydi va hook o'shani ko'rishi kerak. Shuning uchun hook ichida index faylini qo'lda o'qimang — `git diff --cached` kabi buyruqlar `GIT_INDEX_FILE` ni o'zi hisobga oladi ([48-bob](48-muhit-ozgaruvchilari.md)).

Ma'lumotnoma ogohlantiradi: hook ichida **boshqa** repo'da Git buyrug'ini ishlatsangiz, bu o'zgaruvchilarni tozalang, aks holda buyruq noto'g'ri repo'ga qaraydi:

```bash
foreign_desc=$(unset $(git rev-parse --local-env-vars); git -C ../foreign-repo describe)
```

## Kod: `pre-commit` — commit'ga sir ketmasin

**Muammo.** Kimdir parol yoki API kalitini commit qilib yuboradi. Tarixdan keyin o'chirish qiyin ([42-bob](42-reflog-va-tiklash.md)), kalit esa allaqachon tarqalgan bo'ladi.

**Yechim.** `pre-commit` hook'i **stage qilingan** o'zgarishni tekshiradi. Muhimi — `git diff --cached`: commit'ga working tree emas, index ketadi ([05-bob](05-uch-holat.md)).

```bash
$ cat .git/hooks/pre-commit
#!/bin/sh
# Commit'ga ketayotgan (stage qilingan) qo'shilgan qatorlarda maxfiy kalit bormi?
if git diff --cached -U0 | grep '^+.*PAROL=' >&2; then
	echo "pre-commit: maxfiy qiymat commit qilinmoqda, to'xtatildi" >&2
	exit 1
fi
# Bo'sh joy xatolari (10-bobdagi namuna hook g'oyasi)
exec git diff --cached --check
$ printf 'DB=ilova\nPAROL=qwerty123\n' > sozlama.env
$ git add sozlama.env
$ git commit -m "Sozlama qo'shildi"
+PAROL=qwerty123
pre-commit: maxfiy qiymat commit qilinmoqda, to'xtatildi
$ echo $?
1
$ git log --oneline -1
b543b15 a o'zgardi
$ git status --short
A  sozlama.env
```

Commit yaratilmadi, index esa o'zgarmadi — fayl hali stage'da, tuzatib qayta urinish mumkin. Oxirgi qatordagi `exec` hook'ning chiqish kodini `git diff --check` ning chiqish kodiga tenglashtiradi: bo'sh joy xatosi bo'lsa — `2`, bo'lmasa — `0`.

### `--no-verify` — chetlab o'tish

```bash
$ git commit --no-verify -q -m "Sozlama qo'shildi"
$ git log --oneline -1
ca63cef Sozlama qo'shildi
$ git reset -q --soft HEAD~1
$ printf 'DB=ilova\n' > sozlama.env
$ git add sozlama.env
$ git commit -q -m "Sozlama qo'shildi"
$ git log --oneline -1
1f1197a Sozlama qo'shildi
```

`--no-verify` (`git commit` da qisqasi `-n`) `pre-commit` va `commit-msg` ni o'tkazib yuboradi. `prepare-commit-msg` va `post-commit` baribir ishlaydi. `git merge --no-verify` — `pre-merge-commit` va `commit-msg` ni, `git push --no-verify` — `pre-push` ni o'tkazib yuboradi. Server hook'larini klient hech qanday opsiya bilan chetlab o'ta olmaydi.

Yuqorida sir bilan commit `--no-verify` bilan o'tib ketdi — shuni ko'rsatish uchun ataylab qilindi va darhol `reset --soft` bilan bekor qilindi ([11-bob](11-bekor-qilish.md)). Haqiqiy loyihada bunday commit push qilinsa, kalitni almashtirish kerak.

## Kod: `commit-msg` va `prepare-commit-msg` — xabar siyosati

Sarlavha uzunligini tekshiruvchi `commit-msg` hook'i [10-bobda](10-yaxshi-commit.md) bor. Bu yerda Pro Git'ning siyosat misolini olamiz: **har commit xabarida vazifa raqami bo'lsin**, `[ref: 1234]` ko'rinishida (vazifa kuzatuv tizimiga bog'lash uchun).

```bash
$ cat .git/hooks/commit-msg
#!/bin/sh
# $1 — taklif qilingan xabar fayli. Har commit vazifa raqamiga bog'lansin: [ref: 123]
if ! grep -qE '\[ref: [0-9]+\]' "$1"; then
	echo "[POLICY] Xabarda [ref: <raqam>] yo'q" >&2
	exit 1
fi
$ git commit -a -m "Versiya chiqarildi"
[POLICY] Xabarda [ref: <raqam>] yo'q
$ echo $?
1
$ git commit -q -a -m "Versiya chiqarildi [ref: 7]"
$ git log --oneline -1
a3dc1a5 Versiya chiqarildi [ref: 7]
```

`commit-msg` xabar faylini **o'zgartirishi** ham mumkin (masalan, formatni bir xil qilish), lekin asosiy vazifasi — tekshirish.

Har safar raqamni qo'lda yozish noqulay. Agar branch nomida raqam bo'lsa (`fix/42-xayr`), uni `prepare-commit-msg` avtomatik qo'shib qo'yadi — dasturchi muharrirni ochganda xabar tayyor turadi:

```bash
$ cat .git/hooks/prepare-commit-msg
#!/bin/sh
# $1 — xabar fayli, $2 — manba (message/template/merge/squash/commit), $3 — commit (faqat "commit" da)
echo "prepare-commit-msg: manba=$2 $3" >&2
branch=$(git symbolic-ref --short -q HEAD)
raqam=$(echo "$branch" | sed -n 's|^[a-z]*/\([0-9][0-9]*\)-.*|\1|p')
# Branch nomida raqam bo'lsa va xabarda hali ref bo'lmasa, oxiriga qo'shamiz
if [ -n "$raqam" ] && ! grep -q '\[ref:' "$1"; then
	printf '\n[ref: %s]\n' "$raqam" >> "$1"
fi
$ git switch -q -c fix/42-xayr
$ git commit -q -a -m "Xayr matni tuzatildi"
prepare-commit-msg: manba=message
$ git log -1 --format=%B
Xayr matni tuzatildi

[ref: 42]

```

Ikkinchi argument (manba) turli holatlarda:

```bash
$ git commit -q --amend --no-edit
prepare-commit-msg: manba=commit HEAD
$ git commit -q --amend -C HEAD
prepare-commit-msg: manba=commit HEAD
$ git switch -q main
$ git merge -q --squash fix/42-xayr
Squash commit -- not updating HEAD
$ git commit -q --no-edit
prepare-commit-msg: manba=squash
```

| Manba (`$2`) | Qachon | `$3` |
| --- | --- | --- |
| (bo'sh) | oddiy `git commit`, muharrir bilan | — |
| `message` | `-m` yoki `-F` | — |
| `template` | `-t` yoki `commit.template` | — |
| `merge` | merge commit yoki `.git/MERGE_MSG` mavjud | — |
| `squash` | `.git/SQUASH_MSG` mavjud | — |
| `commit` | `-c`, `-C` yoki `--amend` | commit nomi (`HEAD`) |

Ma'lumotnoma ogohlantiradi: `prepare-commit-msg` ni `--no-verify` o'chirmaydi, va undan nolsiz chiqish commit'ni to'xtatadi — lekin u `pre-commit` o'rnini bosmasligi kerak. Uning vazifasi — xabarni tayyorlash, tekshirish emas.

## Kod: `pre-push` — yuborishdan oldingi oxirgi tekshiruv

Endi lokal "server" — bare repo ([27-bob](27-remote.md)):

```bash
$ git init -q --bare markaz.git
$ cd ilova
$ git remote add origin ../markaz.git
$ git push -q origin main
```

`pre-push` stdin'dan har yuboriladigan ref uchun bir qator oladi. Ikki maxsus holat: remote'da ref hali yo'q bo'lsa — `<remote-oid>` nollardan iborat; ref o'chirilayotgan bo'lsa — `<lokal-ref>` o'rnida `(delete)` va `<lokal-oid>` nollar. Hook "WIP" bilan boshlanadigan commit'larni yubormaslik uchun:

```bash
$ cat .git/hooks/pre-push
#!/bin/sh
# $1 — remote nomi, $2 — URL. stdin: <lokal-ref> <lokal-oid> <remote-ref> <remote-oid>
remote="$1"; url="$2"
nol=$(git hash-object --stdin </dev/null | tr '0-9a-f' '0')
while read -r lref loid rref roid; do
	echo "pre-push: $remote ($url): $lref $(echo $loid | cut -c1-7) -> $rref $(echo $roid | cut -c1-7)" >&2
	[ "$loid" = "$nol" ] && continue          # o'chirish
	if [ "$roid" = "$nol" ]; then oraliq="$loid"   # yangi branch: hamma commit
	else oraliq="$roid..$loid"; fi
	wip=$(git rev-list --grep='^WIP' "$oraliq")
	if [ -n "$wip" ]; then
		echo "pre-push: $rref ga WIP commit yuborilmoqda: $(echo $wip | cut -c1-7)" >&2
		exit 1
	fi
done
exit 0
```

(`nol` — nollar qatori; uni hash uzunligidan hisoblash SHA-256 repo'larda ham ishlaydi, [14-bob](14-obyektlar-blob.md).)

```bash
$ git commit -q -a -m "WIP: v3 [ref: 8]"
$ git push origin main
pre-push: origin (../markaz.git): refs/heads/main b8feca9 -> refs/heads/main 4d609ef
pre-push: refs/heads/main ga WIP commit yuborilmoqda: b8feca9
error: failed to push some refs to '../markaz.git'
$ echo $?
1
$ git ls-remote origin main
4d609ef067b0ff71526f4571b7a629991754c191	refs/heads/main
$ git commit -q --amend -m "v3 tayyor [ref: 8]"
$ git push origin main
pre-push: origin (../markaz.git): refs/heads/main e858068 -> refs/heads/main 4d609ef
To ../markaz.git
   4d609ef..e858068  main -> main
$ git push origin fix/42-xayr
pre-push: origin (../markaz.git): refs/heads/fix/42-xayr cf072fa -> refs/heads/fix/42-xayr 0000000
To ../markaz.git
 * [new branch]      fix/42-xayr -> fix/42-xayr
```

Rad etilganda serverda hech narsa o'zgarmadi (`ls-remote` eski qiymatni ko'rsatadi). Yangi branch'da `<remote-oid>` — `0000000`, shuning uchun hook butun branch'ni tekshirdi.

Pro Git `pre-push` "remote ref'lari yangilangandan keyin" ishlaydi deydi — bu chalkash ifoda. Aniqrog'i: Git remote'dan uning ref'lari ro'yxatini **oladi**, keyin hook'ni chaqiradi, keyin obyektlarni yuboradi. Remote'dagi ref'lar hook ishlaganda hali o'zgarmagan.

## Kod: server tomoni — `pre-receive`, `update`, `post-receive`

Siyosatni majburiy qilamiz. Push qilinganda server tomonida `git receive-pack` ishlaydi ([29-bob](29-fetch-push-ichidan.md)) va hook'larni shu tartibda chaqiradi:

```text
klient: git push
   │  ref'lar ro'yxati, pre-push, packfile yuborish
   ▼
server: receive-pack
   1. obyektlar karantin papkasiga yoziladi
   2. pre-receive   (bir marta, stdin'da hamma ref)    ── rad → hech narsa yo'q
   3. obyektlar asosiy omborga ko'chiriladi
   4. update        (har ref uchun alohida)            ── rad → faqat shu ref
   5. ref'lar yangilanadi
   6. post-receive  (bir marta, muvaffaqiyatli ref'lar)
      post-update
```

### Hook'lar

`pre-receive` — `main` ni o'chirish va unga majburiy (non-fast-forward) push'ni taqiqlaydi. Bu odatda `receive.denyDeletes` va `receive.denyNonFastForwards` sozlamalari ([45-bob](45-config-chuqur.md)) bilan ham qilinadi, lekin hook bilan **faqat ma'lum branch** uchun qilish mumkin:

```bash
$ cat markaz.git/hooks/pre-receive
#!/bin/sh
# stdin: <eski-oid> <yangi-oid> <ref> — har ref uchun bir qator, hook bir marta ishlaydi
echo "pre-receive: pwd=$(pwd)"
nol=0000000000000000000000000000000000000000
rad=0
while read -r eski yangi ref; do
	echo "pre-receive: $ref $(echo $eski | cut -c1-7) -> $(echo $yangi | cut -c1-7)"
	if [ "$ref" = refs/heads/main ]; then
		if [ "$yangi" = "$nol" ]; then
			echo "[POLICY] main ni o'chirib bo'lmaydi"; rad=1
		elif [ "$eski" != "$nol" ] && ! git merge-base --is-ancestor "$eski" "$yangi"; then
			echo "[POLICY] main ga majburiy (non-fast-forward) push taqiqlangan"; rad=1
		fi
	fi
done
exit $rad
```

`git merge-base --is-ancestor A B` — "A commit'i B ning ajdodimi?" ([21-bob](21-branch-va-merge.md)). Ajdod bo'lsa, yangilanish fast-forward.

`update` — Pro Git'dagi Ruby skriptining shell nusxasi: har yangi commit xabarida `[ref: N]` bormi va foydalanuvchi o'zgartirgan fayllarga yozish huquqi bormi (ACL — kirish ro'yxati):

```bash
$ cat markaz.git/hooks/update
#!/bin/sh
# $1 — ref, $2 — eski oid, $3 — yangi oid. Har ref uchun alohida ishlaydi.
ref="$1"; eski="$2"; yangi="$3"
nol=0000000000000000000000000000000000000000
echo "update: ($ref) ($(echo $eski | cut -c1-6)) ($(echo $yangi | cut -c1-6))"
[ "$yangi" = "$nol" ] && exit 0                      # o'chirish — pre-receive hal qiladi
case "$ref" in refs/heads/*) ;; *) exit 0 ;; esac   # faqat branch'lar
if [ "$eski" = "$nol" ]; then
	# Yangi branch: serverda hali yo'q bo'lgan commit'lar
	oraliq="$yangi --not --branches"
else
	oraliq="$eski..$yangi"
fi
for rev in $(git rev-list $oraliq); do
	xabar=$(git cat-file commit "$rev" | sed '1,/^$/d')
	if ! echo "$xabar" | grep -qE '\[ref: [0-9]+\]'; then
		echo "[POLICY] $(echo $rev | cut -c1-7): xabar formati noto'g'ri"
		exit 1
	fi
	# ACL: kim qaysi papkaga yoza oladi (Pro Git g'oyasi)
	for fayl in $(git log -1 --name-only --format= "$rev"); do
		ruxsat=0
		while IFS='|' read -r holat kimlar yol; do
			[ "$holat" = avail ] || continue
			case ",$kimlar," in *",$FOYDALANUVCHI,"*) ;; *) continue ;; esac
			case "$fayl" in "$yol"*) ruxsat=1 ;; esac
		done < acl
		if [ $ruxsat = 0 ]; then
			echo "[POLICY] $FOYDALANUVCHI: $fayl ga yozish huquqi yo'q"
			exit 1
		fi
	done
done
exit 0
$ cat markaz.git/acl
avail|ali,vali|
avail|sardor|docs
```

Bir necha tafsilot:

- `git rev-list eski..yangi` — push bilan kelgan yangi commit'lar ([19-bob](19-revision-tanlash.md)). Pro Git misolida yangi branch holati ko'rib chiqilmagan: u yerda `eski` nollardan iborat bo'lib, `0000..yangi` xato beradi. Biz `--not --branches` bilan "serverdagi hech bir branch'dan yetib bo'lmaydigan" commit'larni olamiz (`update` paytida yangi ref hali yaratilmagan).
- `git cat-file commit <rev> | sed '1,/^$/d'` — commit obyektidan sarlavhalarni (tree, parent, author...) birinchi bo'sh qatorgacha olib tashlab, xabarni qoldiradi ([16-bob](16-commit-obyekti.md)).
- ACL formati Pro Git'dan: `avail|<foydalanuvchilar>|<yo'l>`, yo'l bo'sh bo'lsa — hamma joyga ruxsat.
- **Kim push qilyapti?** Git buni o'zi bilmaydi — autentifikatsiya transportning ishi. SSH serverda bitta `git` foydalanuvchisi bo'lsa, odatda kalitga qarab foydalanuvchi nomini muhit o'zgaruvchisiga yozadigan o'ram ishlatiladi (Pro Git `$USER` ni misol qiladi). Lokal sinovda biz buni `FOYDALANUVCHI` o'zgaruvchisi bilan taqlid qilamiz: lokal transportda `receive-pack` klientning muhitini meros qiladi. Haqiqiy serverda klient bu o'zgaruvchini o'zi bera olmasligi shart.

`post-receive` — faqat xabar va jurnal:

```bash
$ cat markaz.git/hooks/post-receive
#!/bin/sh
# Natijaga ta'sir qilmaydi — faqat xabar berish
while read -r eski yangi ref; do
	echo "post-receive: $ref yangilandi, $(git rev-list --count $eski..$yangi 2>/dev/null || echo yangi) commit"
	echo "$ref $yangi" >> push.log
done
echo "post-receive: push-option soni=${GIT_PUSH_OPTION_COUNT:-berilmagan} ${GIT_PUSH_OPTION_0}"
$ chmod +x markaz.git/hooks/pre-receive markaz.git/hooks/update markaz.git/hooks/post-receive
```

### Sinov: noto'g'ri xabar

Hamkasb klient hook'larini chetlab o'tdi (`--no-verify`) — server baribir ushlaydi:

```bash
$ export FOYDALANUVCHI=ali
$ git commit -q --no-verify -a -m "v4"
$ git -C ../markaz.git count-objects
36 objects, 144 kilobytes
$ git push origin main
pre-push: origin (../markaz.git): refs/heads/main c6af1cf -> refs/heads/main e858068
remote: pre-receive: pwd=/tmp/misol/markaz.git
remote: pre-receive: refs/heads/main e858068 -> c6af1cf
remote: update: (refs/heads/main) (e85806) (c6af1c)
remote: [POLICY] c6af1cf: xabar formati noto'g'ri
remote: error: hook declined to update refs/heads/main
To ../markaz.git
 ! [remote rejected] main -> main (hook declined)
error: failed to push some refs to '../markaz.git'
$ git -C ../markaz.git count-objects
39 objects, 156 kilobytes
```

O'qiymiz:

- `remote:` bilan boshlangan hamma qator — server hook'larining chiqishi. `pre-receive` `$GIT_DIR` da (bare repo ichida) ishladi.
- `pre-receive` o'tkazdi (bu `main` ga oddiy fast-forward), `update` rad etdi. Git: "`hooks/update` rad etdi" — `(hook declined)`.
- Obyektlar soni 36 dan 39 ga **oshdi**: rad etilgan commit, uning tree'si va blob'i serverda qoldi (ref'siz, keyin `gc` tozalaydi). Sababi — karantin faqat `pre-receive` gacha: `update` ishlaganda obyektlar allaqachon asosiy omborga ko'chirilgan.

Xabarni tuzatib qayta yuboramiz:

```bash
$ git commit -q --amend -m "v4 [ref: 9]"
$ git push -q origin main
pre-push: origin (../markaz.git): refs/heads/main 8eadc3a -> refs/heads/main e858068
remote: pre-receive: pwd=/tmp/misol/markaz.git
remote: pre-receive: refs/heads/main e858068 -> 8eadc3a
remote: update: (refs/heads/main) (e85806) (8eadc3)
remote: post-receive: refs/heads/main yangilandi, 1 commit
remote: post-receive: push-option soni=0
```

`-q` Git'ning o'z chiqishini o'chiradi, hook'larnikini emas.

### Sinov: bir push — ikki branch, `update` faqat bittasini rad etadi

```bash
$ git switch -q -c feat/10-yaxshi
$ git commit -q -a -m "Yaxshi o'zgarish [ref: 10]"
$ git switch -q -c feat/yomon main
$ git commit -q --no-verify -a -m "Shoshilinch tuzatish"
$ git push origin feat/10-yaxshi feat/yomon
pre-push: origin (../markaz.git): refs/heads/feat/10-yaxshi 8ba649c -> refs/heads/feat/10-yaxshi 0000000
pre-push: origin (../markaz.git): refs/heads/feat/yomon 6cae9e4 -> refs/heads/feat/yomon 0000000
remote: pre-receive: pwd=/tmp/misol/markaz.git
remote: pre-receive: refs/heads/feat/10-yaxshi 0000000 -> 8ba649c
remote: pre-receive: refs/heads/feat/yomon 0000000 -> 6cae9e4
remote: update: (refs/heads/feat/10-yaxshi) (000000) (8ba649)
remote: update: (refs/heads/feat/yomon) (000000) (6cae9e)
remote: [POLICY] 6cae9e4: xabar formati noto'g'ri
remote: error: hook declined to update refs/heads/feat/yomon
remote: post-receive: refs/heads/feat/10-yaxshi yangilandi, yangi commit
remote: post-receive: push-option soni=0
To ../markaz.git
 * [new branch]      feat/10-yaxshi -> feat/10-yaxshi
 ! [remote rejected] feat/yomon -> feat/yomon (hook declined)
error: failed to push some refs to '../markaz.git'
$ echo $?
1
$ git ls-remote --heads origin
8ba649cd2d3a977b1b7b052afbeea76e531061e3	refs/heads/feat/10-yaxshi
cf072fa93c69cd482c491262f0cfbd3adf62da14	refs/heads/fix/42-xayr
8eadc3ac42aa5ab3b092e9b3c42554a367c91f8a	refs/heads/main
```

`pre-receive` bir marta ikki qator bilan, `update` ikki marta ishladi. Bitta ref qabul qilindi, bittasi rad etildi; `post-receive` faqat muvaffaqiyatli ref'ni oldi. Hammasi yoki hech narsa kerak bo'lsa — `git push --atomic` ([29-bob](29-fetch-push-ichidan.md)).

### Sinov: `pre-receive` — majburiy push va o'chirish

```bash
$ git switch -q main
$ git reset -q --hard HEAD~1
$ git push --force origin main
pre-push: origin (../markaz.git): refs/heads/main e858068 -> refs/heads/main 8eadc3a
remote: pre-receive: pwd=/tmp/misol/markaz.git
remote: pre-receive: refs/heads/main 8eadc3a -> e858068
remote: [POLICY] main ga majburiy (non-fast-forward) push taqiqlangan
To ../markaz.git
 ! [remote rejected] main -> main (pre-receive hook declined)
error: failed to push some refs to '../markaz.git'
$ git push origin --delete main
pre-push: origin (../markaz.git): (delete) 0000000 -> refs/heads/main 8eadc3a
remote: pre-receive: pwd=/tmp/misol/markaz.git
remote: pre-receive: refs/heads/main 8eadc3a -> 0000000
remote: [POLICY] main ni o'chirib bo'lmaydi
To ../markaz.git
 ! [remote rejected] main (pre-receive hook declined)
error: failed to push some refs to '../markaz.git'
```

Endi xabar `(pre-receive hook declined)` — qaysi hook rad etgani ko'rinib turibdi; `update` umuman chaqirilmadi. `pre-push` stdin'ida o'chirish `(delete) 0000000` ko'rinishida keldi.

### Sinov: ACL

`sardor` faqat `docs/` ga yoza oladi:

```bash
$ git reset -q --hard origin/main
$ git add docs app.sh
$ git commit -q -m "Qo'llanma va app [ref: 11]"
$ FOYDALANUVCHI=sardor git push origin main
...
remote: update: (refs/heads/main) (8eadc3) (6ddc69)
remote: [POLICY] sardor: app.sh ga yozish huquqi yo'q
remote: error: hook declined to update refs/heads/main
To ../markaz.git
 ! [remote rejected] main -> main (hook declined)
error: failed to push some refs to '../markaz.git'
$ git reset -q HEAD~1 && git restore app.sh
$ git add docs && git commit -q -m "Qo'llanma [ref: 11]"
$ FOYDALANUVCHI=sardor git push origin main
...
remote: post-receive: refs/heads/main yangilandi, 1 commit
remote: post-receive: push-option soni=0
To ../markaz.git
   8eadc3a..4e19124  main -> main
```

### Push option'lar

Klient `git push -o <matn>` (`--push-option`) bilan server hook'lariga qo'shimcha ma'lumot yubora oladi (masalan, CI'ni o'tkazib yuborish belgisi). Server buni `receive.advertisePushOptions=true` bilan e'lon qilishi kerak, aks holda:

```text
fatal: the receiving end does not support push options
```

```bash
$ git -C ../markaz.git config receive.advertisePushOptions true
$ git commit -q -a -m "Qo'llanma to'ldirildi [ref: 11]"
$ FOYDALANUVCHI=sardor git push -o ci.skip -o reviewer=ali origin main
...
remote: post-receive: refs/heads/main yangilandi, 1 commit
remote: post-receive: push-option soni=2 ci.skip
To ../markaz.git
   4e19124..8ab1ea9  main -> main
$ cat ../markaz.git/push.log
refs/heads/main 8eadc3ac42aa5ab3b092e9b3c42554a367c91f8a
refs/heads/feat/10-yaxshi 8ba649cd2d3a977b1b7b052afbeea76e531061e3
refs/heads/main 4e19124301395b7e289d8a90b1f6cada4687cc76
refs/heads/main 8ab1ea93402e82d37005353bde9cae4006dce351
```

Variantlar: `GIT_PUSH_OPTION_COUNT` — soni, `GIT_PUSH_OPTION_0`, `GIT_PUSH_OPTION_1`, ... — qiymatlar. Ma'lumotnoma: push option bosqichi kelishilmagan bo'lsa, bu o'zgaruvchilar o'rnatilmaydi. Sinovda (2.56.0) esa `-o` siz oddiy push'larda ham `GIT_PUSH_OPTION_COUNT=0` keldi (yuqoridagi `push-option soni=0` qatorlari, shu jumladan `advertisePushOptions` yoqilmagan paytda). Shuning uchun hook'da "o'zgaruvchi bormi" emas, "soni noldan kattami" deb tekshiring.

### Karantin: `pre-receive` rad etsa, iz qolmaydi

```bash
$ git -C ../markaz.git count-objects
57 objects, 228 kilobytes
$ echo "yangi" > docs/yangi.md; git add docs/yangi.md
$ git commit -q --amend --no-edit
$ FOYDALANUVCHI=sardor git push -q --force origin main
...
remote: [POLICY] main ga majburiy (non-fast-forward) push taqiqlangan
To ../markaz.git
 ! [remote rejected] main -> main (pre-receive hook declined)
error: failed to push some refs to '../markaz.git'
$ git -C ../markaz.git count-objects
57 objects, 228 kilobytes
```

`git receive-pack` ma'lumotnomasi ("QUARANTINE ENVIRONMENT"): kelgan obyektlar avval `$GIT_DIR/objects` ichidagi vaqtinchalik papkaga tushadi va faqat `pre-receive` muvaffaqiyatli tugagandan keyin asosiy omborga ko'chiriladi. Rad etilsa, papka butunlay o'chiriladi — `update` bilan rad etilgan holatdan farqli, son o'zgarmadi. Oqibatlari:

1. Muvaffaqiyatsiz push'lar diskni to'ldirmaydi (lekin xatoni tekshirish qiyinlashadi — obyektlar qolmaydi).
2. `pre-receive` o'zi yaratgan obyektlar ham karantinga tushadi.
3. `pre-receive` ichidan ref yangilash **taqiqlangan** — Git bunday urinishni avtomatik rad etadi.

Ma'lumotnoma `update` hook'i haqida yana bir maslahat beradi: u hamma branch'larni birdaniga bilmaydi, shuning uchun har push uchun bitta xat jo'natish kabi ishlarni `post-receive` da qiling. `post-receive` natijaga ta'sir qilmaydi, lekin u tugamaguncha klient kutadi — uzoq ishlarni (CI ishga tushirish) fon jarayoniga topshiring.

## Kod: hook'larni jamoaga ulashish — `core.hooksPath`

Clone hook'larni olib kelmaydi:

```bash
$ git clone -q markaz.git hamkasb
$ cd hamkasb
$ ls .git/hooks | grep -v sample
$ ls .git/hooks | wc -l
      14
```

Faqat 14 ta namuna. Yechim — hook'larni repo'ning o'zida, oddiy kuzatiladigan papkada saqlash:

```bash
$ cd ../ilova
$ mkdir .githooks
$ cp .git/hooks/commit-msg .git/hooks/pre-commit .githooks/
$ git add .githooks && git commit -q -m "Jamoa hook'lari [ref: 12]"
+if git diff --cached -U0 | grep '^+.*PAROL=' >&2; then
pre-commit: maxfiy qiymat commit qilinmoqda, to'xtatildi
$ echo $?
1
```

Kutilmagan, lekin ibratli: `pre-commit` hook'i **o'z matnidagi** `PAROL=` ni topdi. Bu `--no-verify` ning to'g'ri ishlatilish holati — xato topilmagani aniq, tekshiruv noto'g'ri ishladi:

```bash
$ git commit -q --no-verify -m "Jamoa hook'lari [ref: 12]"
$ git ls-files -s .githooks
100755 9b45fce5bc7781778140bc96132bbc615732f494 0	.githooks/commit-msg
100755 3dba998280f726e6cd5e8f5e465b8509bf664f40 0	.githooks/pre-commit
$ git push -q origin main
```

Git bajariladigan bitni saqlaydi (`100755`, [15-bob](15-tree-va-index.md)). Hamkasb uni yoqadi:

```bash
$ cd ../hamkasb
$ git pull -q
$ git config core.hooksPath .githooks
$ git rev-parse --git-path hooks/commit-msg
.githooks/commit-msg
$ git commit -a -m "README"
[POLICY] Xabarda [ref: <raqam>] yo'q
$ echo $?
1
```

`core.hooksPath` haqida ma'lumotnoma:

- Yo'l absolyut yoki nisbiy bo'ladi; nisbiy yo'l **hook ishlaydigan papkaga** nisbatan (oddiy repo'da — working tree ildizi). Shuning uchun `.githooks` ishladi.
- Global sozlama sifatida (`git config --global core.hooksPath ~/.git-hooks`) hamma repo'lar uchun bitta papka berish mumkin. Lekin unda repo'ning o'z `.git/hooks` papkasi **umuman ishlatilmaydi** — `core.hooksPath` uni almashtiradi, qo'shmaydi.
- Hamma hook'larni bitta buyruq uchun o'chirish: `git -c core.hooksPath=/dev/null ...` (ma'lumotnoma buni faqat tajribali foydalanuvchilarga va bitta buyruq uchun tavsiya qiladi).

```bash
$ git -c core.hooksPath=/dev/null commit -q -a -m "README"
$ git log --oneline -1
830582b README
```

Bu `--no-verify` dan kuchliroq: `prepare-commit-msg`, `post-commit` va boshqalar ham ishlamaydi.

### Bajariladigan bit yo'q bo'lsa

Fayl Windows'dan kelgan yoki `chmod +x` unutilgan bo'lsa, hook jim o'tkazib yuborilmaydi — Git maslahat beradi:

```bash
$ git reset -q --hard HEAD~1
$ chmod -x .githooks/commit-msg
$ git commit -q -a -m "README"
hint: The '.githooks/commit-msg' hook was ignored because it's not set as executable.
hint: You can disable this warning with `git config set advice.ignoredHook false`.
$ git log --oneline -1
767e7c1 README
```

Commit yaratildi — hook ishlamadi. Windows'da yoki `core.fileMode=false` repo'larda bitni `git update-index --chmod=+x .githooks/commit-msg` bilan index'da belgilash mumkin ([15-bob](15-tree-va-index.md)).

### Boshqa ulashish yo'llari

- **Shablon papkasi.** `git init --template=<papka>`, `GIT_TEMPLATE_DIR` yoki `init.templateDir` — yangi yaratilgan yoki clone qilingan repo'ga shu papkadagi fayllar (shu jumladan `hooks/`) ko'chiriladi ([`git init` — TEMPLATE DIRECTORY](https://git-scm.com/docs/git-init)). Kamchiligi: faqat yaratish paytida ko'chiriladi, keyingi o'zgarishlar eski repo'larga yetmaydi.
- **Konfiguratsiyadagi hook'lar** (Git 2.54+) — keyingi bo'lim.
- **Tashqi vositalar.** Husky (Node.js loyihalarda, `package.json` orqali) va lefthook (YAML fayl bilan, tildan mustaqil) — Git'ning bir qismi **emas**, uchinchi tomon vositalari. Ular asosan `core.hooksPath` ni o'z papkasiga yo'naltiradi yoki `.git/hooks` ga kichik o'ram skriptlar yozadi va qaysi tekshiruv ishga tushishini o'z sozlama faylidan oladi. Ishlatishdan oldin ularning hujjatini o'qing; Git nuqtai nazaridan ular oddiy hook.

## Kod: konfiguratsiyadagi hook'lar (Git 2.54+)

**Muammo.** `.git/hooks/pre-commit` bitta fayl — linter ham, sir qidiruvchi ham kerak bo'lsa, ikkalasini bitta skriptga yig'ish kerak. Bir xil skriptni o'nlab repo'larga ko'chirish ham noqulay.

**Yechim.** Git 2.54 relizi: hook buyruqlarini konfiguratsiya fayllarida (jumladan, markaziy — global yoki system darajada) e'lon qilish va bitta hodisaga bir nechtasini ishga tushirish mumkin. Git 2.55 da ularni parallel ishga tushirish qo'shildi. Har hook'ning **do'stona nomi** (friendly name) bor:

```ini
[hook "linter"]
	command = ../skriptlar/linter.sh
	event = pre-commit
[hook "sirlar"]
	command = ../skriptlar/sirlar.sh
	event = pre-commit
```

| Kalit | Ma'nosi |
| --- | --- |
| `hook.<nom>.command` | Bajariladigan fayl yo'li yoki shell bir-qatorligi. Bir nechta bo'lsa, oxirgisi g'olib |
| `hook.<nom>.event` | Qaysi hodisada (`pre-commit`, `update`, ...). Ko'p qiymatli: bir hook bir nechta hodisaga; bo'sh qiymat ro'yxatni tozalaydi |
| `hook.<nom>.enabled` | `false` — shu hook'ni sozlamasini o'chirmay o'chirish (masalan, global hook'ni bitta repo'da) |
| `hook.<nom>.parallel` | `true` — boshqa hook'lar bilan bir vaqtda ishlashi xavfsiz |
| `hook.<hodisa>.enabled` | `false` — shu hodisadagi konfiguratsiya hook'larini o'chirish |
| `hook.<hodisa>.jobs` | Shu hodisa uchun parallel ishlar soni (`hook.jobs` ni bosadi) |
| `hook.jobs` | Umumiy parallel ishlar soni; standart 1, `-1` — CPU yadrolari soni |

Haqiqiy sinov. Ikki skript:

```bash
$ cat skriptlar/linter.sh
#!/bin/sh
echo "linter: $(git diff --cached --name-only | wc -l | tr -d ' ') fayl tekshirildi" >&2
$ cat skriptlar/sirlar.sh
#!/bin/sh
if git diff --cached -U0 | grep -q '^+.*PAROL='; then echo "sirlar: topildi!" >&2; exit 1; fi
echo "sirlar: toza" >&2
```

Ma'lumotnoma tavsiya qilgan usulda ulaymiz (`git config set`, `--append` — ko'p qiymatli kalitga qo'shish, [45-bob](45-config-chuqur.md)):

```bash
$ git init -q sozlama
$ cd sozlama
$ git config set hook.linter.command ../skriptlar/linter.sh
$ git config set --append hook.linter.event pre-commit
$ git config set hook.sirlar.command ../skriptlar/sirlar.sh
$ git config set --append hook.sirlar.event pre-commit
$ git config get --all --show-names --regexp '^hook\.'
hook.linter.command ../skriptlar/linter.sh
hook.linter.event pre-commit
hook.sirlar.command ../skriptlar/sirlar.sh
hook.sirlar.event pre-commit
$ git hook list pre-commit
linter
sirlar
$ git hook list --show-scope pre-commit
local	linter
local	sirlar
$ echo a > a.txt; git add a.txt
$ git commit -q -m birinchi
linter: 1 fayl tekshirildi
sirlar: toza
$ echo 'PAROL=1' > b.txt; git add b.txt
$ git commit -q -m ikkinchi
linter: 1 fayl tekshirildi
sirlar: topildi!
$ echo $?
1
```

Ikkala hook konfiguratsiyada uchragan tartibda ishladi; ulardan biri rad etsa, commit to'xtaydi.

### An'anaviy hook bilan birga

```bash
$ git restore --staged b.txt && rm b.txt
$ printf '#!/bin/sh\necho "hookdir: .git/hooks/pre-commit" >&2\n' > .git/hooks/pre-commit
$ chmod +x .git/hooks/pre-commit
$ git hook list pre-commit
linter
sirlar
hook from hookdir
$ git hook run pre-commit
linter: 0 fayl tekshirildi
sirlar: toza
hookdir: .git/hooks/pre-commit
```

Hook papkasidagi fayl (`hookdir`) ham ishlaydi va doim **oxirida**. Demak, eski usuldan yangisiga bosqichma-bosqich o'tish mumkin.

`git hook run <hodisa>` — hook'ni commit qilmasdan qo'lda ishga tushirish (skriptlarni sinash yoki Git'ni o'rab oluvchi vositalar uchun).

### O'chirish

```bash
$ git config set hook.linter.enabled false
$ git hook list pre-commit
disabled	linter
sirlar
hook from hookdir
$ git config set hook.pre-commit.enabled false
$ git hook list pre-commit
event-disabled	linter
event-disabled	sirlar
hook from hookdir
$ git hook run pre-commit
hookdir: .git/hooks/pre-commit
$ git config unset hook.pre-commit.enabled
$ git config unset hook.linter.enabled
```

Diqqat: ma'lumotnoma `hook.<hodisa>.enabled=false` haqida "shu hodisa uchun **hech qanday** hook ishlamaydi" deydi. Sinovda (2.56.0) esa u faqat konfiguratsiyadagi hook'larni o'chirdi — `.git/hooks/pre-commit` baribir ishladi. Hamma hook'ni o'chirish kerak bo'lsa, ishonchli yo'l — `-c core.hooksPath=/dev/null` yoki faylni olib tashlash.

### Global hook va do'stona nom qoidalari

Global hook (sinovda `GIT_CONFIG_GLOBAL` bilan alohida faylga yo'naltirilgan, [48-bob](48-muhit-ozgaruvchilari.md)) — bir marta yozib, hamma repo'da:

```bash
$ git config set --global hook.jurnal.command 'echo "jurnal: $(git log -1 --format=%h) commit qilindi" >&2'
$ git config set --global --append hook.jurnal.event post-commit
$ git hook list --show-scope post-commit
global	jurnal
$ git commit -q -m uchinchi
linter: 1 fayl tekshirildi
sirlar: toza
hookdir: .git/hooks/pre-commit
jurnal: 7ca153d commit qilindi
$ git config set hook.jurnal.enabled false
$ git hook list --show-scope post-commit
global	disabled	jurnal
```

Global e'lon qilingan hook'ni lokal `hook.jurnal.enabled=false` bilan shu repo'da o'chirdik — `enabled` aynan shu uchun.

Do'stona nom hodisa nomi bilan bir xil bo'lishi mumkin emas — bu xato emas, **fatal**:

```bash
$ git config set hook.pre-push.event pre-push
$ git hook list pre-push
fatal: hook friendly-name 'pre-push' collides with a known event name; please choose a different friendly-name
$ echo $?
128
```

Sababi: `hook.pre-push.enabled` "shu hodisa" ma'nosida band.

### `git hook run`: argumentlar, stdin, xato kodlari

```bash
$ git hook list post-commit
warning: no hooks found for event 'post-commit'
$ echo $?
1
$ git hook run post-commit
error: cannot find a hook named post-commit
$ echo $?
1
$ git hook run --ignore-missing post-commit
$ echo $?
0
$ git hook run precommit
error: unknown hook event 'precommit';
use --allow-unknown-hook-name to allow non-native hook names
$ echo $?
1
```

Noma'lum nomni rad etish — xato yozishdan himoya (`prereceive` vs `pre-receive`). Argumentlar `--` dan keyin, stdin esa `--to-stdin=<fayl>` bilan beriladi:

```bash
$ git config set hook.korsat.command 'f() { echo "args: $*"; cat; }; f'
$ git config set --append hook.korsat.event pre-push
$ printf 'refs/heads/main 1111 refs/heads/main 0000\n' > kirish.txt
$ git hook run --to-stdin=kirish.txt pre-push -- origin ../markaz.git
args: origin ../markaz.git
refs/heads/main 1111 refs/heads/main 0000
```

Nega funksiya (`f() {...}; f`)? Shell bir-qatorligida Git hook argumentlarini buyruq **oxiriga** qo'shadi. Oddiy `echo "args: $*"; cat` yozilsa, argumentlar `cat` ga tushib, `cat: origin: No such file or directory` xatosi chiqdi (sinovda shunday bo'ldi). Murakkab hook uchun bir-qatorlik emas, alohida skript fayli yozing.

### O'z hodisangiz — o'rovchi vositalar uchun

Git o'zi bilmagan `event` ni e'tiborsiz qoldiradi — bu ataylab: Git'ni o'rab oluvchi vositalar shu infratuzilmani o'z hodisalari uchun ishlata oladi. Nom Git'ning kelajakdagi hook'lari bilan to'qnashmasligi uchun o'z vosita nomingiz bilan boshlang:

```bash
$ git config set hook.salom.command 'echo salom:'
$ git config set hook.salom.event mening-vositam-boshlash
$ git hook run --allow-unknown-hook-name mening-vositam-boshlash -- dunyo
salom: dunyo
```

### Parallel ishga tushirish (2.55+)

Har biri 1 soniya uxlaydigan ikki hook:

```bash
$ git config get --all --show-names --regexp '^hook\.sekin'
hook.sekin-a.command echo a boshlandi; sleep 1; echo a tugadi
hook.sekin-a.event mening-vositam-test
hook.sekin-b.command echo b boshlandi; sleep 1; echo b tugadi
hook.sekin-b.event mening-vositam-test
$ time git hook run --allow-unknown-hook-name mening-vositam-test
a boshlandi
a tugadi
b boshlandi
b tugadi
real 2.0 s
$ time git hook run --allow-unknown-hook-name -j 2 mening-vositam-test
warning: hook 'sekin-a' is not marked as parallel=true, running in parallel anyway due to -j2
warning: hook 'sekin-b' is not marked as parallel=true, running in parallel anyway due to -j2
a boshlandi
a tugadi
b boshlandi
b tugadi
real 1.0 s
$ git config set hook.sekin-a.parallel true
$ time git -c hook.jobs=2 hook run --allow-unknown-hook-name mening-vositam-test
...
real 2.0 s
$ git config set hook.sekin-b.parallel true
$ time git -c hook.jobs=2 hook run --allow-unknown-hook-name mening-vositam-test
a boshlandi
a tugadi
b boshlandi
b tugadi
real 1.0 s
```

- Standart — ketma-ket (2 soniya).
- `-j 2` buyruq satrida hammasini majburan parallel qiladi (ogohlantirish bilan).
- `hook.jobs` sozlamasi esa faqat **hamma** hook'lar `parallel=true` bo'lsagina ta'sir qiladi: bittasi belgilanmaganda baribir 2 soniya.
- Chiqish aralashib ketmaydi — Git har hook chiqishini yig'ib, tartib bilan beradi.
- Ba'zi hook'lar har qanday sozlamada ketma-ket ishlaydi, chunki ular umumiy ma'lumotni o'zgartiradi: `applypatch-msg`, `pre-commit`, `prepare-commit-msg`, `commit-msg`, `post-commit`, `post-checkout`, `push-to-checkout`. `pre-push` parallel ishlaganda stdout stderr'ga qo'shiladi.

## Kod: `reference-transaction` — har ref o'zgarishini kuzatish

Bu hook ref'ni yangilaydigan **har qanday** buyruqda (commit, branch, tag, fetch, reset...) ishlaydi, har tranzaksiya uchun bir necha marta — holatlar: `preparing` (navbatga qo'yildi, hali qulflanmagan; 2.54 da qo'shilgan), `prepared` (qulflandi), `committed` (yozildi), `aborted` (bekor qilindi).

```bash
$ cat .git/hooks/reference-transaction
#!/bin/sh
echo "ref-tx: $1" >&2
while read -r eski yangi ref; do echo "   $(echo $eski | cut -c1-7) $(echo $yangi | cut -c1-7) $ref" >&2; done
$ git commit -q --allow-empty -m ikki
ref-tx: preparing
   742d526 959088c HEAD
ref-tx: prepared
   742d526 959088c refs/heads/main
ref-tx: committed
   742d526 959088c refs/heads/main
ref-tx: preparing
   0000000 0000000 AUTO_MERGE
ref-tx: aborted
   0000000 0000000 AUTO_MERGE
ref-tx: prepared
   0000000 0000000 AUTO_MERGE
ref-tx: committed
   0000000 0000000 AUTO_MERGE
$ git branch tajriba
ref-tx: preparing
   0000000 959088c refs/heads/tajriba
ref-tx: prepared
   0000000 959088c refs/heads/tajriba
ref-tx: committed
   0000000 959088c refs/heads/tajriba
```

- `preparing` da simvolik ref ochilmagan (`HEAD`), `prepared` da u ko'rsatgan ref (`refs/heads/main`) — ma'lumotnomada aynan shunday.
- Commit oxirida Git ichki `AUTO_MERGE` psevdo-ref'ini tozaladi ([17-bob](17-reflar-va-head.md)) — u ham alohida tranzaksiyalar bo'lib keldi. Hook yozayotganda bunday ichki ref'larni ham ko'rishni kutib qo'ying.
- Nollar `<eski>` da ikki ma'noda: ref yangi yaratilmoqda yoki joriy qiymatidan qat'i nazar majburan yoziladi. Farqlash uchun `git rev-parse <ref>` bilan joriy qiymatni tekshiring.

Rad etish faqat `preparing` va `prepared` da ishlaydi:

```bash
$ cat .git/hooks/reference-transaction
#!/bin/sh
[ "$1" = prepared ] || exit 0
while read -r eski yangi ref; do
	case "$ref" in refs/tags/*) echo "ref-tx: teg'lar qo'lda yaratilmaydi: $ref" >&2; exit 1 ;; esac
done
$ git tag v1.0
ref-tx: teg'lar qo'lda yaratilmaydi: refs/tags/v1.0
fatal: in 'prepared' phase, update aborted by the reference-transaction hook
$ echo $?
128
$ git tag -l
```

Bu hook juda ko'p chaqiriladi — sekin skript har Git buyrug'ini sekinlashtiradi. U asosan ref'larni boshqa tizim bilan sinxronlash (replikatsiya) yoki audit uchun.

## Muhandislik nuqtai nazari: qaysi tekshiruv qayerda

| Tekshiruv | Joy | Nega |
| --- | --- | --- |
| Formatlash, lint, tez testlar (soniyalar) | `pre-commit` | Darhol fikr-mulohaza; sekin bo'lsa, odamlar `--no-verify` ga o'rganib qoladi |
| Xabar formati | `commit-msg` + server `update` | Klientda — qulaylik, serverda — kafolat |
| To'liq test to'plami (daqiqalar) | `pre-push` yoki CI | Har commit'da emas, yuborishdan oldin |
| Majburiy push, o'chirish, ACL | Server: `pre-receive`/`update` (yoki hosting'ning "himoyalangan branch" sozlamasi, [36-bob](36-github-boshqaruv.md)) | Klient tomon chetlab o'tiladi |
| Bildirishnoma, CI ishga tushirish, deploy | `post-receive` | Natijaga ta'sir qilmaydi, faqat reaksiya |

Qoidalar:

- **Hook tez bo'lsin.** `pre-commit` ichida faqat stage qilingan fayllarni tekshiring (`git diff --cached --name-only --diff-filter=ACM`), butun loyihani emas.
- **Index'ni tekshiring, working tree'ni emas.** Fayl qisman stage qilingan bo'lishi mumkin ([37-bob](37-interaktiv-staging.md)); `cat fayl` commit'ga ketmaydigan narsani ko'rsatadi. Ishonchli yo'l — `git show :fayl` (index'dagi nusxa).
- **Server hook'ida commit sonini cheklang.** Yangi branch'da `rev-list` serverda bor commit'larni qayta tekshirmasin (`--not --branches` yoki `--not --all`).
- **Uzun bayroqlar.** Pro Git maslahati: boshqalar o'qiydigan skriptda qisqa emas, uzun opsiyalarni yozing (`--cached`, `-c` emas) — olti oydan keyin o'zingiz rahmat aytasiz.
- **Hook — kod.** Uni repo'da saqlang, review qiling, versiyalang.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `.sample` ni o'chirmasdan yoki `chmod +x` siz kutish | Hook umuman ishlamaydi (`advice.ignoredHook` maslahat beradi) | Nom aynan hodisa nomi, bajariladigan bit |
| Klient hook'i bilan siyosat "majburiy" deb o'ylash | Clone bilan kelmaydi, `--no-verify` bilan o'tiladi | Majburiy qoida — server hook'ida yoki hosting sozlamasida |
| `pre-commit` da working tree fayllarini o'qish | Commit'ga index ketadi, natija noto'g'ri | `git diff --cached`, `git show :yo'l` |
| `update` da `$2..$3` ni yangi branch uchun ham ishlatish | `0000..<oid>` — xato, hook yiqiladi | Nol oid'ni alohida tekshiring (`--not --branches`) |
| `post-receive` da push'ni rad etmoqchi bo'lish | U ref'lar yangilangandan keyin ishlaydi, kodi e'tiborsiz | `pre-receive` yoki `update` |
| `pre-receive` ichida ref yangilash | Karantindagi obyektlarga ko'rsatadi, Git rad etadi | Ref o'zgarishini `post-receive` ga qoldiring |
| `post-receive` da uzoq ish (build, deploy) | Klient tugaguncha kutib qoladi | Navbatga qo'yib, fon jarayonida bajaring |
| Global `core.hooksPath` qo'yib, repo hook'lari ishlamay qolishiga hayron bo'lish | `core.hooksPath` `.git/hooks` ni almashtiradi | Global darajada konfiguratsiya hook'laridan foydalaning (2.54+) yoki repo uchun `core.hooksPath` ni qayta belgilang |
| `hook.pre-commit.event` kabi nom berish | Fatal xato: do'stona nom hodisa nomi bilan to'qnashadi | `hook.linter.event = pre-commit` |
| Shell bir-qatorligida argument tartibini hisobga olmaslik | Git argumentlarni buyruq oxiriga qo'shadi | Alohida skript yoki `f() {...}; f` |
| Hook ichida boshqa repo'da `git -C` ishlatish | Meros qolgan `GIT_DIR`, `GIT_INDEX_FILE` noto'g'ri repo'ga yo'naltiradi | `unset $(git rev-parse --local-env-vars)` |
| `--no-verify` ni odat qilish | Hook'ning ma'nosi yo'qoladi | Hook sekin yoki noto'g'ri bo'lsa — hook'ni tuzating |

## Amaliyot

1. Yangi repo'da "josus" hook yozing va uni `post-rewrite`, `pre-rebase`, `post-checkout` ga bog'lang. Ikki commit'li branch'ni `main` dagi yangi commit ustiga `git rebase` qiling: `post-rewrite rebase` stdin'ida nechta qator keldi? Keyin `git rebase -i` bilan ikki commit'ni `squash` qiling va ma'lumotnomadagi "bir xil yangi commit'li bir necha qator" holatini kuzating.
2. `pre-commit` yozing: stage qilingan har `.json` fayl to'g'ri JSON bo'lsin (`git show :fayl | python3 -m json.tool`). Faylni to'g'ri holatda stage qilib, keyin working tree'da buzing — hook nima deydi va nega?
3. `prepare-commit-msg` ni kengaytiring: manba `merge` yoki `commit` bo'lsa, hech narsa qilmasin; `-t shablon.txt` bilan commit qilib `$2` qiymatini ko'ring.
4. `pre-push` yozing: `main` ga to'g'ridan-to'g'ri push qilishni taqiqlasin, boshqa branch'larga ruxsat bersin. `git push --no-verify` bilan chetlab o'tib ko'ring.
5. Lokal bare repo'da `update` hook'i bilan faqat annotatsiyali teg'larga ruxsat bering (`git cat-file -t <oid>` `tag` qaytarishi kerak). `update.sample` dagi `hooks.allowunannotated` mantiqi bilan solishtiring.
6. Ikki repo uchun umumiy linter'ni global `hook.<nom>.command` bilan ulang, birida `hook.<nom>.enabled=false` bilan o'chiring. `git hook list --show-scope pre-commit` ikkala repo'da nima ko'rsatadi?
7. `receive.denyCurrentBranch=updateInstead` bilan oddiy (bare bo'lmagan) repo'ga push qiling, keyin `push-to-checkout` hook'ini qo'shib, unda `git read-tree -u -m HEAD "$1"` ni ishlating. Hook'siz va hook bilan working tree'da lokal o'zgarish bo'lganda natija qanday farq qiladi?
8. (Qiyinroq) Pro Git'dagi ACL tizimini to'liq shell'da quring: `acl` faylida `unavail` qatorlarini ham qo'llab-quvvatlang, `update` hook'i fayl o'chirish va qayta nomlashni ham tekshirsin (`git log --name-status`). Xuddi shu qoidani klient `pre-commit` da ham ishlating: `git diff --cached --name-only` ni `acl` bilan solishtirib, server rad etishidan oldin ogohlantirsin. `FOYDALANUVCHI` ni haqiqiy serverda klient soxtalashtira olmasligi uchun qanday yechim kerakligini (`git-shell`, SSH `command=`) yozing.

## Rasmiy hujjat

- Pro Git — Git Hooks: <https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks>
- Pro Git — An Example Git-Enforced Policy: <https://git-scm.com/book/en/v2/Customizing-Git-An-Example-Git-Enforced-Policy>
- `githooks` (har hook, argumentlar, chiqish kodlari): <https://git-scm.com/docs/githooks>
- `git hook` (`run`, `list`, konfiguratsiyadagi hook'lar, WRAPPERS): <https://git-scm.com/docs/git-hook>
- `git config` — `hook.*`, `core.hooksPath`, `advice.ignoredHook`: <https://git-scm.com/docs/git-config>
- `git receive-pack` (QUARANTINE ENVIRONMENT): <https://git-scm.com/docs/git-receive-pack>
- `git init` (TEMPLATE DIRECTORY): <https://git-scm.com/docs/git-init>
- Git 2.54.0 reliz yozuvlari (konfiguratsiyadagi hook'lar, `reference-transaction` `preparing`): <https://github.com/git/git/blob/master/Documentation/RelNotes/2.54.0.adoc>
- Git 2.55.0 reliz yozuvlari (parallel hook'lar): <https://github.com/git/git/blob/master/Documentation/RelNotes/2.55.0.adoc>
