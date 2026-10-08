# 17 — Ref'lar, HEAD va teg obyekti

[← Oldingi: Commit obyekti](16-commit-obyekti.md) · [Mundarija](README.md) · [Keyingi: Packfile'lar va `gc` →](18-packfile-va-gc.md)

## Tushuncha

Oldingi uch bobda obyektlar omborini qurdik: blob, tree va commit ([14–16-boblar](14-obyektlar-blob.md)). Har obyektning nomi — 40 belgili hash. Tarixni ko'rish uchun `git log 9fb24ac6bf55c9ca489787f18a6dbad620e7f320` deb yozish mumkin, lekin bunday raqamlarni hech kim eslab qololmaydi. Kerak bo'lgani — hash'ga **odam tushunadigan nom** berish.

Git'da bunday nom **ref** (reference — havola) deyiladi. Rasmiy `gitglossary` ta'rifi: ref — **obyekt nomiga yoki boshqa ref'ga ishora qiluvchi nom**. Ikki holat bor:

1. **Oddiy ref** — ichida to'g'ridan-to'g'ri hash turadi. Masalan `refs/heads/main` → `9fb24ac...`.
2. **Symbolic ref** (symref) — ichida hash emas, **boshqa ref'ning nomi** turadi: `ref: refs/heads/main`. Uni o'qiganda Git ko'rsatilgan ref'ga o'tadi va o'shaning hash'ini oladi. Eng muhim misol — `HEAD`.

Telefon kitobiga o'xshatsak: obyekt — telefon raqami, oddiy ref — "Ali: +998 90 ..." yozuvi, symbolic ref esa "Ishxona: Ali'ning raqamiga qarang" degan yozuv. Ali raqamini almashtirsa, "Ishxona" yozuvini o'zgartirish shart emas.

Ref'lar ierarxik nomlanadi va qaysi papkada turganiga qarab Git ularga har xil munosabatda bo'ladi (`gitdatamodel` hujjati):

| Ref | Nima | Qachon o'zgaradi |
| --- | --- | --- |
| `refs/heads/<nom>` | **Branch** — shu tarmoqdagi oxirgi commit | Har `commit` da (agar HEAD unga ulangan bo'lsa) |
| `refs/tags/<nom>` | **Teg** — istalgan obyektga doimiy nom | Odatda hech qachon |
| `refs/remotes/<remote>/<nom>` | **Remote-tracking branch** — serverdagi branch'ning oxirgi ko'rilgan holati | Faqat `fetch`/`push` da |
| `HEAD` | Joriy branch (symref) yoki detached holatda commit | `switch`, `commit`, `reset` ... |
| `ORIG_HEAD`, `FETCH_HEAD`, `MERGE_HEAD` ... | Ildizdagi maxsus ref'lar | Tegishli buyruqlar yozadi |
| `refs/stash`, `refs/bisect/...`, `refs/notes/...` | Vositalarning o'z ref'lari | O'sha vosita ishlaganda |

Ref'lar qayerda saqlanadi? Git'da ikki **ref saqlash formati** (backend) bor:

- **`files`** — hozirgi standart. Har ref — `.git/refs/` ichidagi alohida kichik fayl (*loose ref*), ko'p ref'lar esa bitta `.git/packed-refs` fayliga yig'ilishi mumkin.
- **`reftable`** — yangi ikkilik format, Git 3.0 da yangi repo'lar uchun standart bo'lishi rejalashtirilgan.

Bu bobning katta qismi `files` formatida — chunki unda hamma narsani `cat` bilan ko'rish mumkin. Oxirida `reftable`ga ham qaraymiz.

## Nega shunday: nega ref — shunchaki fayl, va nega uni qo'lda yozmaslik kerak

Ref'ni oddiy matn fayli qilib saqlash g'oyasi Git'ning asosiy tamoyilidan kelib chiqadi: **obyektlar o'zgarmaydi, ref'lar o'zgaradi**. Tarixdagi har narsa o'zgarmas obyektlarda turadi; "hozir qayerdamiz" degan o'zgaruvchan holat esa bir necha o'nlab baytlik fayllarda. Branch yaratish — 41 baytlik fayl yozish, branch'ni siljitish — o'sha faylni qayta yozish ([20-bob](20-branch-bu-ref.md)). Shuning uchun branch'lar arzon.

Lekin "shunchaki fayl" bo'lsa ham, Pro Git ogohlantiradi: ref fayllarini qo'lda tahrirlash tavsiya etilmaydi, buning uchun xavfsizroq `git update-ref` bor. Nega xavfsizroq — bu bobda bittalab ko'ramiz:

1. **Tekshiruv.** `update-ref` qisqa hash'ni to'liq hash'ga aylantiradi, obyekt borligini va ref nomi to'g'riligini tekshiradi. Qo'lda yozilgan noto'g'ri qiymat — "buzilgan ref".
2. **Qulf (lock).** Ikki jarayon bir vaqtda bitta ref'ni yozmasligi uchun Git avval `<ref>.lock` faylini yaratadi.
3. **"Eski qiymat" sharti.** "Faqat hozir X bo'lsa, Y ga o'zgartir" — boshqa jarayon ref'ni o'zgartirib ulgurgan bo'lsa, o'zgarish rad etiladi.
4. **Reflog.** Har o'zgarish jurnalga yoziladi — xato bo'lsa, eski qiymatni topish mumkin ([42-bob](42-reflog-va-tiklash.md)).
5. **Format mustaqilligi.** Ref `packed-refs` ichida yoki `reftable` ichida bo'lsa, `cat` va `echo` umuman ishlamaydi; `update-ref` esa ishlaydi.

## Kod: bo'sh repo'da ref'lar

```bash
$ git init -b main 17-reflar
Initialized empty Git repository in /tmp/misol/17-reflar/.git/
$ cd 17-reflar
$ find .git/refs
.git/refs
.git/refs/heads
.git/refs/tags
$ find .git/refs -type f
```

Ikki bo'sh papka — `heads` (branch'lar) va `tags` (teglar). Bitta ham fayl yo'q. `HEAD` esa allaqachon bor:

```bash
$ cat .git/HEAD
ref: refs/heads/main
$ git symbolic-ref HEAD
refs/heads/main
$ git rev-parse HEAD
fatal: ambiguous argument 'HEAD': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
HEAD
```

`HEAD` `refs/heads/main`ga ishora qiladi, lekin bunday fayl hali **yo'q**. `gitrepository-layout` hujjati buni ochiq aytadi: HEAD ko'rsatgan branch hali mavjud bo'lmasligi mumkin — bu qonuniy holat. Shuning uchun `symbolic-ref` (HEAD qaysi nomga qaraydi?) javob beradi, `rev-parse` (HEAD qaysi hash?) esa bera olmaydi. Branch birinchi commit bilan "tug'iladi".

Uchta commit qilamiz (har biri 5 daqiqa farq bilan):

```bash
$ echo birinchi > a.txt && git add a.txt && git commit -q -m "Birinchi commit"
$ echo ikkinchi >> a.txt && git commit -q -am "Ikkinchi commit"
$ echo uchinchi >> a.txt && git commit -q -am "Uchinchi commit"
$ git log --oneline
9fb24ac Uchinchi commit
ca137d1 Ikkinchi commit
df00a2d Birinchi commit
```

```bash
$ find .git/refs -type f
.git/refs/heads/main
$ cat .git/refs/heads/main
9fb24ac6bf55c9ca489787f18a6dbad620e7f320
$ wc -c .git/refs/heads/main
      41 .git/refs/heads/main
```

Mana butun branch: 40 hex belgi va `\n`. Har commit uni qayta yozdi, va har safar jurnalga qator qo'shildi:

```bash
$ cat .git/logs/refs/heads/main
0000000000000000000000000000000000000000 df00a2d0b91055b97dfb4aa77b245f0dd78c5d7e Ali Valiyev <ali@example.com> 1791349200 +0500	commit (initial): Birinchi commit
df00a2d0b91055b97dfb4aa77b245f0dd78c5d7e ca137d1bffec19ce1d1c6f481a2974aa26787e88 Ali Valiyev <ali@example.com> 1791349500 +0500	commit: Ikkinchi commit
ca137d1bffec19ce1d1c6f481a2974aa26787e88 9fb24ac6bf55c9ca489787f18a6dbad620e7f320 Ali Valiyev <ali@example.com> 1791349800 +0500	commit: Uchinchi commit
```

Format: `<eski hash> <yangi hash> <kim> <vaqt> <zona>\t<sabab>`. Nollardan iborat "eski hash" — "bu ref avval yo'q edi". Bu **reflog**; batafsil [42-bobda](42-reflog-va-tiklash.md).

## Kod: ref'ni qo'lda yozish — va uning chegarasi

Pro Git ref'ning naqadar oddiyligini shunday ko'rsatadi — faylga hash yozamiz:

```bash
$ echo ca137d1bffec19ce1d1c6f481a2974aa26787e88 > .git/refs/heads/qolda
$ git log --oneline qolda
ca137d1 Ikkinchi commit
df00a2d Birinchi commit
$ ls .git/logs/refs/heads
main
```

Ishladi: Git uchun `qolda` — to'laqonli branch. Lekin `logs` ichida unga jurnal **yaratilmadi** — Git bu o'zgarishdan bexabar.

Endi qisqa hash yozib ko'ramiz — buyruq qatorida `ca137d1` ishlaydi-ku:

```bash
$ echo ca137d1 > .git/refs/heads/qisqa
$ git rev-parse qisqa
warning: ignoring broken ref refs/heads/qisqa
warning: ignoring broken ref refs/heads/qisqa
fatal: ambiguous argument 'qisqa': unknown revision or path not in the working tree.
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
qisqa
```

Ref faylida **faqat to'liq** hash bo'lishi kerak. Qisqa hash'ni "yechish" — buyruq qatorining qulayligi, ref faylining formati emas. Git bunday faylni "buzilgan ref" deb e'tiborsiz qoldiradi.

```bash
$ rm .git/refs/heads/qisqa .git/refs/heads/qolda
```

## Kod: `git update-ref` — ref'ni xavfsiz yozish

`update-ref` — ref'ni yozishning plumbing yo'li ([13-bob](13-plumbing-va-porcelain.md)). Pro Git aytadiki, `git branch <nom>` ham ichkarida aynan shu ishni qiladi.

```bash
$ git update-ref refs/heads/test ca137d1
$ cat .git/refs/heads/test
ca137d1bffec19ce1d1c6f481a2974aa26787e88
$ git log --oneline test
ca137d1 Ikkinchi commit
df00a2d Birinchi commit
$ cat .git/logs/refs/heads/test
0000000000000000000000000000000000000000 ca137d1bffec19ce1d1c6f481a2974aa26787e88 Ali Valiyev <ali@example.com> 1791349200 +0500
```

Farqlar: qisqa `ca137d1` to'liq hash'ga aylantirildi va reflog yaratildi. Ma'lumotnomaga ko'ra reflog `core.logAllRefUpdates` yoqilgan bo'lsa (oddiy repo'da standart) `refs/heads/`, `refs/remotes/`, `refs/notes/` va `HEAD` kabi ref'lar uchun yoziladi. `-m` bilan sababni ham yozish mumkin:

```bash
$ git update-ref -m "test'ni oldinga surish" refs/heads/test main
$ tail -1 .git/logs/refs/heads/test
ca137d1bffec19ce1d1c6f481a2974aa26787e88 9fb24ac6bf55c9ca489787f18a6dbad620e7f320 Ali Valiyev <ali@example.com> 1791349200 +0500	test'ni oldinga surish
```

Ikkinchi argument `main` — bu ham ref nomi; Git uni hash'ga yechib, `test`ga yozdi. Ya'ni `update-ref` qiymat sifatida istalgan revision qabul qiladi ([19-bob](19-revision-tanlash.md)).

### Uchinchi argument: "faqat hozir shu bo'lsa"

Bu `update-ref`ning eng muhim xususiyati — *compare-and-swap* (solishtir va almashtir). Uchinchi argument — kutilgan **eski** qiymat:

```bash
$ git update-ref refs/heads/test df00a2d ca137d1
fatal: update_ref failed for ref 'refs/heads/test': cannot lock ref 'refs/heads/test': is at 9fb24ac6bf55c9ca489787f18a6dbad620e7f320 but expected ca137d1bffec19ce1d1c6f481a2974aa26787e88
$ cat .git/refs/heads/test
9fb24ac6bf55c9ca489787f18a6dbad620e7f320
```

"Siz `test` `ca137d1`da deb o'ylayapsiz, lekin u allaqachon `9fb24ac`da" — ref o'zgarmadi. To'g'ri eski qiymat bilan:

```bash
$ git update-ref refs/heads/test df00a2d 9fb24ac
$ echo "exit=$?"
exit=0
```

Nega bu kerak? Tasavvur qiling: skriptingiz ref'ni o'qidi, hisob-kitob qildi va yozmoqchi. Shu orada boshqa jarayon (masalan, IDE'dagi Git yoki parallel `fetch`) ref'ni o'zgartirdi. Shartsiz yozish o'sha o'zgarishni jimgina "yeb yuboradi". Shart bilan yozish esa xatoni ochiq ko'rsatadi. `git push --force-with-lease` ham xuddi shu g'oyaga asoslangan ([29-bob](29-fetch-push-ichidan.md)).

Bo'sh qator yoki 40 ta `0` eski qiymat sifatida — "bu ref **hali yo'q** bo'lsin" degani:

```bash
$ git update-ref refs/heads/test main ''
fatal: update_ref failed for ref 'refs/heads/test': cannot lock ref 'refs/heads/test': reference already exists
$ git update-ref refs/heads/yangi main ''
$ cat .git/refs/heads/yangi
9fb24ac6bf55c9ca489787f18a6dbad620e7f320
```

Mavjud branch'ni tasodifan qayta yozib yubormaslik uchun foydali.

### O'chirish: `-d`

```bash
$ git update-ref -d refs/heads/yangi
$ ls .git/refs/heads .git/logs/refs/heads
.git/logs/refs/heads:
main
test

.git/refs/heads:
main
test
```

Ref fayli ham, uning reflog'i ham o'chdi. `-d <ref> <eski>` shaklida ham shart qo'yish mumkin. Commit obyektlari esa joyida — ular `gc` ga qadar omborda qoladi ([18-bob](18-packfile-va-gc.md)).

### Bir nechta ref'ni atomik o'zgartirish: `--stdin`

`--stdin` bilan buyruqlar standart kirishdan o'qiladi va **hammasi birga** bajariladi: bittasi muvaffaqiyatsiz bo'lsa — hech biri. Asosiy buyruqlar: `update`, `create`, `delete`, `verify` (o'zgartirmay faqat tekshirish), tranzaksiya uchun `start`, `prepare`, `commit`, `abort`; symref'lar uchun `symref-update`, `symref-create` va boshqalar.

Avval ataylab noto'g'ri `verify` bilan:

```bash
$ printf 'start\ncreate refs/heads/b1 main\ncreate refs/heads/b2 main~1\nverify refs/heads/test ca137d1bffec19ce1d1c6f481a2974aa26787e88\ncommit\n' | git update-ref --stdin
start: ok
fatal: commit: cannot lock ref 'refs/heads/test': is at df00a2d0b91055b97dfb4aa77b245f0dd78c5d7e but expected ca137d1bffec19ce1d1c6f481a2974aa26787e88
$ ls .git/refs/heads
main
test
```

`b1` va `b2` ham yaratilmadi — chunki tranzaksiyaning bir qismi o'tmadi. To'g'ri qiymat bilan:

```bash
$ printf 'start\ncreate refs/heads/b1 main\ncreate refs/heads/b2 main~1\nverify refs/heads/test df00a2d0b91055b97dfb4aa77b245f0dd78c5d7e\ncommit\n' | git update-ref --stdin
start: ok
commit: ok
$ ls .git/refs/heads
b1
b2
main
test
```

Ma'lumotnoma bir nozik nuqtani aytadi: `files` formatida har ref alohida atomik yoziladi, lekin **parallel o'qiyotgan** jarayon o'zgarishlarning bir qismini ko'rib qolishi mumkin. `reftable`da esa bunday oraliq holat yo'q (pastda).

Agar "hammasi yoki hech narsa" emas, "o'tganlari o'tsin" kerak bo'lsa — `--batch-updates`: noto'g'ri kirish sabab rad etilgan yangilanishlar `rejected ...` qatori bilan xabar qilinadi, qolganlari bajariladi.

```bash
$ printf 'delete refs/heads/b1\ndelete refs/heads/b2\n' | git update-ref --stdin
```

### Qulf fayli: `.lock`

Git ref'ni qanday qilib "atomik" yozadi? Avval `<ref>.lock` faylini yaratadi, yangi qiymatni unga yozadi, keyin uni asl nomga qayta nomlaydi (rename — fayl tizimida bir lahzalik amal). `.lock` mavjud bo'lsa, boshqa jarayon "band" deb tushunadi. Buni sun'iy ko'ramiz:

```bash
$ touch .git/refs/heads/main.lock
$ git commit --allow-empty -m qulf
fatal: cannot lock ref 'HEAD': Unable to create '/tmp/misol/17-reflar/.git/refs/heads/main.lock': File exists.

Another git process seems to be running in this repository, or the lock file may be stale
$ rm .git/refs/heads/main.lock
```

Bu xabarni hayotda Git jarayoni to'satdan uzilganda (kompyuter o'chib qolganda, `kill -9`) ko'rasiz. Avval haqiqatan boshqa Git jarayoni ishlamayotganiga ishonch hosil qiling, keyin eskirgan `.lock`ni o'chiring. Xuddi shu sababdan ref nomi `.lock` bilan tugashi mumkin emas.

Nom tekshiruvi ham `update-ref`ning ishi ([20-bob](20-branch-bu-ref.md)dagi `check-ref-format` qoidalari):

```bash
$ git update-ref refs/heads/a..b main
fatal: update_ref failed for ref 'refs/heads/a..b': refusing to update ref with bad name 'refs/heads/a..b'
```

## Kod: qisqa nom qaysi ref'ga yechiladi

Siz `main` deb yozasiz, Git esa `refs/heads/main`ni topadi. Qanday? `gitrevisions` hujjatidagi qoida — birinchi mos kelgani olinadi:

1. `.git/<nom>` — faqat `HEAD`, `FETCH_HEAD`, `ORIG_HEAD`, `MERGE_HEAD` kabi ildiz ref'lar uchun;
2. `refs/<nom>`;
3. `refs/tags/<nom>`;
4. `refs/heads/<nom>`;
5. `refs/remotes/<nom>`;
6. `refs/remotes/<nom>/HEAD`.

E'tibor bering: **teglar branch'lardan oldin**. Bir xil nomli teg va branch yaratsak:

```bash
$ git update-ref refs/tags/v1.0 ca137d1
$ git branch v1.0
$ git rev-parse v1.0
warning: refname 'v1.0' is ambiguous.
ca137d1bffec19ce1d1c6f481a2974aa26787e88
$ git rev-parse heads/v1.0 tags/v1.0
9fb24ac6bf55c9ca489787f18a6dbad620e7f320
ca137d1bffec19ce1d1c6f481a2974aa26787e88
$ git branch -D v1.0
Deleted branch v1.0 (was 9fb24ac).
```

Git ogohlantirdi va **teg**ni tanladi (`ca137d1`), branch esa `9fb24ac`da edi. Noaniqlikni yo'qotish uchun nomning bir qismini qo'shing: `heads/v1.0`, `tags/v1.0` yoki to'liq `refs/heads/v1.0`. 6-qoida tufayli `origin` deb yozish `origin/HEAD` ko'rsatgan branch'ni bildiradi ([27-bob](27-remote.md)).

## Kod: `HEAD` — symbolic ref

Pro Git savoli: `git branch <nom>` qilganingizda Git oxirgi commit hash'ini qayerdan biladi? Javob — `HEAD` faylidan. Odatda u joriy branch'ga **symbolic ref**:

```bash
$ git symbolic-ref HEAD
refs/heads/main
$ git symbolic-ref --short HEAD
main
```

`git symbolic-ref` bir argument bilan — o'qiydi, ikki argument bilan — yozadi. `--short` nomni qisqartiradi. HEAD'ni plumbing bilan boshqa branch'ga "o'tkazamiz":

```bash
$ git symbolic-ref HEAD refs/heads/test
$ cat .git/HEAD
ref: refs/heads/test
$ git status
On branch test
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   a.txt

```

Git endi `test`da ekanimizni aytadi. Lekin qiziq: "commit qilinadigan o'zgarish" paydo bo'ldi, holbuki biz hech narsa o'zgartirmadik! Sabab: `symbolic-ref` **faqat `.git/HEAD` faylini** o'zgartiradi. Index va working tree hali `main`ning (`9fb24ac`) holatida, `test` esa `df00a2d`da — `status` ular orasidagi farqni ko'rsatyapti. `git switch` esa HEAD bilan birga index va working tree'ni ham yangi branch'ga moslaydi ([20-bob](20-branch-bu-ref.md)). Mana porcelain va plumbing farqi.

Qaytaramiz:

```bash
$ git symbolic-ref HEAD refs/heads/main
$ git status --short
$ git symbolic-ref HEAD test
fatal: Refusing to point HEAD outside of refs/
```

HEAD faqat `refs/` ichidagi nomga ishora qila oladi — `ref: test` kabi yaroqsiz qiymat yozilmaydi.

Tarixiy eslatma (ma'lumotnomadan): ilgari `.git/HEAD` haqiqiy **symlink** (`ln -sf refs/heads/main .git/HEAD`) edi. Symlink'lar hamma fayl tizimida ishlamagani uchun bu usul eskirgan va hozir `ref: ...` matnli symref ishlatiladi.

### `HEAD` yangi commit'da nima qiladi

Pro Git: `git commit` yangi commit obyektini yaratadi va uning **otasi** qilib HEAD orqali topilgan hash'ni yozadi. Keyin HEAD ishora qilgan **ref**ni yangi commit'ga suradi. Ya'ni zanjir: `HEAD` → `refs/heads/main` → hash. Commit `HEAD` faylini emas, `refs/heads/main` faylini o'zgartiradi — `HEAD` matni (`ref: refs/heads/main`) o'zgarmay qoladi.

## Kod: detached HEAD — ichkaridan

`gitrepository-layout`: HEAD symref o'rniga **to'g'ridan-to'g'ri commit hash'ini** ham saqlashi mumkin. Bu holat **detached HEAD** (uzilgan HEAD) deyiladi — HEAD hech qaysi branch'ga "ulanmagan". Foydalanuvchi darajasida `git switch --detach` ([20-bob](20-branch-bu-ref.md)), bu yerda esa plumbing bilan qilamiz. `--no-deref` — "HEAD orqali o'tma, HEAD'ning o'zini yoz":

```bash
$ git update-ref --no-deref -m "qo'lda detach" HEAD main~1
$ cat .git/HEAD
ca137d1bffec19ce1d1c6f481a2974aa26787e88
```

`--no-deref`siz `update-ref HEAD ...` `main`ni surgan bo'lardi (ma'lumotnomadagi misol: `git update-ref HEAD <yangi>` — joriy branch'ni yangilaydi). Endi HEAD faylida `ref: ` yo'q:

```bash
$ git symbolic-ref HEAD
fatal: ref HEAD is not a symbolic ref
$ echo "exit=$?"
exit=128
$ git symbolic-ref -q HEAD
$ echo "exit=$?"
exit=1
$ git status
Not currently on any branch.
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   a.txt

$ tail -1 .git/logs/HEAD
9fb24ac6bf55c9ca489787f18a6dbad620e7f320 ca137d1bffec19ce1d1c6f481a2974aa26787e88 Ali Valiyev <ali@example.com> 1791349200 +0500	qo'lda detach
```

`symbolic-ref -q` — skriptlar uchun "branch'damizmi?" degan tekshiruv: branch'da bo'lsak nom chiqadi va kod 0, detached bo'lsak jim va kod 1. (`-q`siz xato `fatal` bilan 128 qaytaradi.) `status` yana o'zgarish ko'rsatyapti — sababi o'sha: index tegilmagan.

Detached holatda commit qilsak, nima siljiydi?

```bash
$ echo detached > b.txt && git add b.txt
$ git commit -q -m "Detached commit"
$ cat .git/HEAD
aae4a8437b27d4ee3003adaed4ab880a3348cd27
$ cat .git/refs/heads/main
9fb24ac6bf55c9ca489787f18a6dbad620e7f320
```

`gitglossary` aytganidek: detached holatda ham commit ishlaydi, lekin u **faqat HEAD'ni** yangilaydi, hech qaysi branch'ga tegmaydi. Yangi `aae4a84` ga faqat `.git/HEAD` ishora qiladi. Undan chiqib ketsak:

```bash
$ git switch main
Warning: you are leaving 1 commit behind, not connected to
any of your branches:

  aae4a84 Detached commit

If you want to keep it by creating a new branch, this may be a good time
to do so with:

 git branch <new-branch-name> aae4a84

Switched to branch 'main'
```

Endi `aae4a84`ga hech qaysi ref ishora qilmaydi — faqat `HEAD` reflog'ida yozuv qoldi. Reflog muddati o'tgach `gc` uni o'chiradi ([18-bob](18-packfile-va-gc.md)), tiklash yo'llari — [42-bob](42-reflog-va-tiklash.md).

## Kod: teglar — yengil teg va teg obyekti

Teg — `refs/tags/` ichidagi ref. Branch'dan asosiy farqi: commit uni **siljitmaydi**. Pro Git: "branch ref'iga o'xshaydi, lekin hech qachon siljimaydi". Teglarning foydalanuvchi tomoni [12-bobda](12-teglar-va-aliaslar.md); bu yerda ichki tuzilishi.

### Yengil teg — shunchaki ref

Yuqorida `v1.0`ni `update-ref` bilan yaratgandik:

```bash
$ cat .git/refs/tags/v1.0
ca137d1bffec19ce1d1c6f481a2974aa26787e88
$ git cat-file -t v1.0
commit
$ git count-objects
13 objects, 52 kilobytes
```

Pro Git: "yengil teg — hech qachon siljimaydigan ref, boshqa hech narsa emas". Obyektlar omboriga hech narsa qo'shilmagan.

### Annotated teg — to'rtinchi obyekt turi

Annotated (izohli) teg yaratilganda Git avval **teg obyektini** yozadi, keyin ref'ni commit'ga emas, **shu obyektga** qaratadi:

```bash
$ git tag -a v1.1 main -m "Birinchi reliz"
$ cat .git/refs/tags/v1.1
deb8e3877ca530eea8d5489a0b2e160289b02d30
$ git count-objects
14 objects, 56 kilobytes
$ git cat-file -t deb8e38
tag
```

Obyektlar soni 13 dan 14 ga oshdi, ref ichidagi hash esa commit'niki emas (`9fb24ac` emas), yangi `tag` obyektiniki. Ichini ko'ramiz:

```bash
$ git cat-file -p v1.1
object 9fb24ac6bf55c9ca489787f18a6dbad620e7f320
type commit
tag v1.1
tagger Ali Valiyev <ali@example.com> 1791352800 +0500

Birinchi reliz
```

`gitdatamodel` bo'yicha teg obyektining majburiy maydonlari:

| Maydon | Ma'nosi |
| --- | --- |
| `object` | Teglanayotgan obyekt hash'i |
| `type` | O'sha obyektning turi (`commit`, `tree`, `blob`, `tag`) |
| `tag` | Teg nomi |
| `tagger` | Kim va qachon (commit'dagi `committer` formatida) |
| bo'sh qatordan keyin | Xabar (va ixtiyoriy PGP/SSH imzo) |

`tagger` vaqti `GIT_COMMITTER_DATE` dan olinadi — bizning misolda 11:00 (1791352800). Teg obyekti ham diskda boshqa obyektlar kabi saqlanadi ([14-bob](14-obyektlar-blob.md)), faqat sarlavhada `tag`:

```bash
$ python3 -c "import zlib,sys;print(zlib.decompress(open(sys.argv[1],'rb').read()))" \
    .git/objects/de/b8e3877ca530eea8d5489a0b2e160289b02d30
b'tag 139\x00object 9fb24ac6bf55c9ca489787f18a6dbad620e7f320\ntype commit\ntag v1.1\ntagger Ali Valiyev <ali@example.com> 1791352800 +0500\n\nBirinchi reliz\n'
```

Teg obyekti tree'ga emas, odatda commit'ga ishora qiladi — commit'dan farqi shu. Va commit kabi u ham o'zgarmas: teg xabarini "tahrirlash" degani yangi teg obyekti yaratish.

### "Qobiqni archish": `^{}`

Ref `v1.1` teg obyektini ko'rsatadi, lekin `git log v1.1` commit'ni ko'rsatadi. Git teg obyektini kerakli turga yetguncha "archiydi" (*peel*):

```bash
$ git rev-parse v1.1 'v1.1^{}' 'v1.1^{commit}' 'v1.1^{tree}'
deb8e3877ca530eea8d5489a0b2e160289b02d30
9fb24ac6bf55c9ca489787f18a6dbad620e7f320
9fb24ac6bf55c9ca489787f18a6dbad620e7f320
d93727c199ee45b7bbc15fab0d7461887a59176e
```

- `v1.1` — ref ichidagi qiymat, ya'ni teg obyekti;
- `v1.1^{}` — teg bo'lmagan obyektga yetguncha archish;
- `v1.1^{commit}` — commit'gacha;
- `v1.1^{tree}` — commit'ning tree'sigacha.

Bu sintaksis [19-bobda](19-revision-tanlash.md) batafsil. Skriptda teg qaysi commit'ga tegishli ekanini bilish uchun doim `^{commit}` ishlating — yengil va annotated teglar uchun bir xil ishlaydi.

### Teg obyektini qo'lda yasash: `git mktag`

[12-bobda](12-teglar-va-aliaslar.md) va'da qilinganidek, teg obyektini plumbing bilan quramiz. `git mktag` standart kirishdan teg matnini o'qiydi va obyekt yozadi:

```bash
$ cat teg.txt
object 9fb24ac6bf55c9ca489787f18a6dbad620e7f320
type commit
tag v1.2
tagger Ali Valiyev <ali@example.com> 1791352800 +0500

Qo'lda yasalgan teg
$ git mktag < teg.txt
bbca228b6a3e4887d1168359a74aa618884a3e14
```

Ma'lumotnoma: `mktag` deyarli `git hash-object -t tag -w --stdin` bilan bir xil, farqi — yozishdan oldin qat'iy `fsck` tekshiruvi. Odatdagi `fsck`da ogohlantirish bo'ladigan narsalar bu yerda xato:

```bash
$ printf 'object 9fb24ac6bf55c9ca489787f18a6dbad620e7f320\ntype commit\ntag v1.2\n\nTaggersiz\n' | git mktag
error: tag input does not pass fsck: missingTaggerEntry: invalid format - expected 'tagger' line
fatal: tag on stdin did not pass our strict fsck check
$ printf 'object 9fb24ac6bf55c9ca489787f18a6dbad620e7f320\ntype tree\ntag v1.2\ntagger Ali Valiyev <ali@example.com> 1791352800 +0500\n\nx\n' | git mktag
fatal: object '9fb24ac6bf55c9ca489787f18a6dbad620e7f320' tagged as 'tree', but is a 'commit' type
```

Ikkinchi holat muhim: `type` maydoni haqiqiy obyekt turiga mos kelishi shart. `mktag` faqat obyekt yaratadi — unga nom berish (ref yozish) alohida qadam:

```bash
$ git update-ref refs/tags/v1.2 $(git mktag < teg.txt)
$ git tag -l
v1.0
v1.1
v1.2
```

`git tag -a` = teg obyektini yozish + `refs/tags/<nom>`ni `update-ref` qilish. Biz ikkalasini qo'lda bajardik.

### Teg commit'dan boshqa narsaga ham qo'yiladi

Pro Git misoli: Git loyihasining maintainer'i o'z GPG ochiq kalitini **blob** sifatida omborga qo'shib, unga teg qo'ygan; Linux yadrosining birinchi tegi esa **tree**ga ishora qiladi. Takrorlaymiz:

```bash
$ echo 'Ochiq kalit (namuna)' | git hash-object -w --stdin
73ec1fafb8a7795e42a36a784e261a0b4d0bb1f1
$ git tag -a kalit 73ec1fa -m "Blob'ga teg"
$ git cat-file -p kalit
object 73ec1fafb8a7795e42a36a784e261a0b4d0bb1f1
type blob
tag kalit
tagger Ali Valiyev <ali@example.com> 1791352800 +0500

Blob'ga teg
$ git cat-file blob kalit
Ochiq kalit (namuna)
```

`type blob` — teg istalgan obyektga qo'yiladi. Bu blob hech qaysi commit'da yo'q, lekin teg uni "yetib boriladigan" qiladi — `gc` uni o'chirmaydi.

## Kod: `refs/remotes` — serverdagi holatning nusxasi

Uchinchi tur ref'lar — remote ref'lar. Lokal bare repo'ni "server" qilamiz ([27-bob](27-remote.md)):

```bash
$ git init -q --bare ../17-markaz.git
$ git remote add origin ../17-markaz.git
$ git push origin main
To ../17-markaz.git
 * [new branch]      main -> main
$ find .git/refs/remotes -type f
.git/refs/remotes/origin/main
$ cat .git/refs/remotes/origin/main
9fb24ac6bf55c9ca489787f18a6dbad620e7f320
$ cat .git/logs/refs/remotes/origin/main
0000000000000000000000000000000000000000 9fb24ac6bf55c9ca489787f18a6dbad620e7f320 Ali Valiyev <ali@example.com> 1791349200 +0500	update by push
```

`push` muvaffaqiyatli bo'lgach Git `refs/remotes/origin/main`ni yozdi: "server'dagi `main` oxirgi marta shu hash'da edi". Pro Git ta'kidlaydi: remote ref'lar **faqat o'qish uchun** hisoblanadi. Unga o'tish mumkin, lekin Git HEAD'ni unga symref qilib bog'lamaydi — shuning uchun `commit` uni hech qachon siljitmaydi:

```bash
$ git switch origin/main
fatal: a branch is expected, got remote branch 'origin/main'
hint: If you want to detach HEAD at the commit, try again with the --detach option.
$ git checkout -q origin/main
$ cat .git/HEAD
9fb24ac6bf55c9ca489787f18a6dbad620e7f320
$ git switch -q main
```

`checkout` remote branch'ga o'tganda HEAD'ga `ref: refs/remotes/...` emas, **hash** yozdi — detached HEAD. `switch` esa buni ataylab rad etadi. Remote ref'lar faqat `fetch` va `push` bilan yangilanadi ([28-bob](28-remote-branchlar.md)).

## Kod: ildizdagi maxsus ref'lar

`.git/` ildizida `HEAD` dan boshqa ref'lar ham paydo bo'ladi. `gitglossary` qoidasi: `refs/` dan tashqaridagi ref nomi faqat katta harf va `_` dan iborat bo'lib, `_HEAD` bilan tugashi (yoki `HEAD`ning o'zi bo'lishi) kerak.

```bash
$ git fetch origin
$ cat .git/FETCH_HEAD
9fb24ac6bf55c9ca489787f18a6dbad620e7f320	not-for-merge	branch 'main' of ../17-markaz
$ git symbolic-ref refs/remotes/origin/HEAD
refs/remotes/origin/main
$ cat .git/refs/remotes/origin/HEAD
ref: refs/remotes/origin/main
```

- **`FETCH_HEAD`** — oxirgi `fetch` nima olib kelgani. Glossariy uni **pseudoref** deydi: oddiy buyruqlar bilan o'qiladi, lekin `update-ref` bilan yozilmaydi; ichida bir nechta hash va metama'lumot bo'lishi mumkin. Pseudoref'lar faqat ikkita: `FETCH_HEAD` va `MERGE_HEAD`.
- **`refs/remotes/origin/HEAD`** — server'ning standart branch'iga symref. `HEAD`dan boshqa symref'lar ham bo'lishi mumkinligining misoli.

`ORIG_HEAD` — `reset`, `merge`, `rebase` kabi HEAD'ni "keskin" suradigan buyruqlar oldingi joyni eslab qolish uchun yozadi:

```bash
$ git commit -q -am "To'rtinchi commit"
$ git reset -q --hard HEAD~1
$ cat .git/ORIG_HEAD
2608d4cacf2828103c3b864516e93e4c207d63e7
$ git reset -q --hard ORIG_HEAD
$ git log --oneline -1
2608d4c To'rtinchi commit
```

`reset` xatosini bir buyruq bilan qaytardik ([39-bob](39-reset-sirlari.md)). Boshqalari: `MERGE_HEAD` (merge jarayonida), `CHERRY_PICK_HEAD`, `REVERT_HEAD`, `REBASE_HEAD`, `BISECT_HEAD`, `AUTO_MERGE`.

## Kod: ref'larni o'qish — `show-ref`, `for-each-ref`, `git refs`

Barcha ref'larni ko'rish uchun `find .git/refs` ham bo'ladi, lekin u `packed-refs` va `reftable`ni ko'rmaydi. `show-ref` ma'lumotnomasi ochiq tavsiya qiladi: `.git` ichidagi fayllarni to'g'ridan-to'g'ri o'qishdan ko'ra shu vositadan foydalaning.

### `git show-ref`

```bash
$ git show-ref
2608d4cacf2828103c3b864516e93e4c207d63e7 refs/heads/main
df00a2d0b91055b97dfb4aa77b245f0dd78c5d7e refs/heads/test
9fb24ac6bf55c9ca489787f18a6dbad620e7f320 refs/remotes/origin/HEAD
9fb24ac6bf55c9ca489787f18a6dbad620e7f320 refs/remotes/origin/main
56c65df471c6e96d65efe572e42ef32209242c9e refs/tags/kalit
ca137d1bffec19ce1d1c6f481a2974aa26787e88 refs/tags/v1.0
deb8e3877ca530eea8d5489a0b2e160289b02d30 refs/tags/v1.1
bbca228b6a3e4887d1168359a74aa618884a3e14 refs/tags/v1.2
```

`--head` — HEAD'ni ham qo'shadi, `-d` (`--dereference`) — annotated teglarni archib, `^{}` bilan alohida qatorda ko'rsatadi:

```bash
$ git show-ref --head -d
2608d4cacf2828103c3b864516e93e4c207d63e7 HEAD
...
56c65df471c6e96d65efe572e42ef32209242c9e refs/tags/kalit
73ec1fafb8a7795e42a36a784e261a0b4d0bb1f1 refs/tags/kalit^{}
ca137d1bffec19ce1d1c6f481a2974aa26787e88 refs/tags/v1.0
deb8e3877ca530eea8d5489a0b2e160289b02d30 refs/tags/v1.1
9fb24ac6bf55c9ca489787f18a6dbad620e7f320 refs/tags/v1.1^{}
bbca228b6a3e4887d1168359a74aa618884a3e14 refs/tags/v1.2
9fb24ac6bf55c9ca489787f18a6dbad620e7f320 refs/tags/v1.2^{}
```

Yengil `v1.0` uchun `^{}` qatori yo'q — archiydigan narsa yo'q. Namuna (pattern) nomning **oxiridan**, to'liq qismlar bo'yicha solishtiriladi:

```bash
$ git show-ref main
2608d4cacf2828103c3b864516e93e4c207d63e7 refs/heads/main
9fb24ac6bf55c9ca489787f18a6dbad620e7f320 refs/remotes/origin/main
$ git show-ref --verify main
fatal: 'main' - not a valid ref
$ git show-ref --exists refs/heads/yoq; echo "exit=$?"
error: reference does not exist
exit=2
```

`--verify` aniq to'liq yo'lni talab qiladi. `--exists` chiqish kodlari: 0 — bor, 2 — yo'q, 1 — boshqa xato. Boshqa opsiyalar: `--branches`, `--tags` (filtr), `-s`/`--hash` (faqat hash), `--abbrev`, `-q`.

### `git for-each-ref` — formatlanadigan ro'yxat

`for-each-ref` — skriptlar uchun asosiy vosita: filtrlash, saralash va `%(atom)` lar bilan istalgan format.

```bash
$ git for-each-ref --format='%(refname:short) %(objecttype) %(objectname:short) %(*objectname:short) %(contents:subject)' refs/tags
kalit tag 56c65df 73ec1fa Blob'ga teg
v1.0 commit ca137d1  Ikkinchi commit
v1.1 tag deb8e38 9fb24ac Birinchi reliz
v1.2 tag bbca228 9fb24ac Qo'lda yasalgan teg
```

`*` bilan boshlangan atom (`%(*objectname)`) — archilgan obyektning maydoni; yengil tegda u bo'sh. Saralash:

```bash
$ git for-each-ref --sort=-committerdate --format='%(refname:short) %(committerdate:iso) %(subject)' refs/heads
main 2026-10-07 10:15:00 +0500 To'rtinchi commit
test 2026-10-07 10:00:00 +0500 Birinchi commit
```

`-` — teskari tartib. Foydali opsiyalar: `--count`, `--points-at=<obyekt>`, `--merged`/`--no-merged`, `--contains`, `--exclude`, `--include-root-refs` (HEAD va ildiz ref'larini ham qo'shish), `--shell`/`--python` (natijani shu til uchun xavfsiz qo'shtirnoqlash).

### `git refs` — ref'lar uchun yagona asbob

`git refs` — ref'lar bilan past darajadagi ishlar uchun yangi buyruq. Git 2.56 relizida unga `create`, `delete`, `update` va `rename` qo'shildi. Uning `list` qism buyrug'i `for-each-ref`ning taxallusi, `optimize` esa `pack-refs`niki:

```bash
$ git refs list --include-root-refs --format='%(refname) %(symref)'
HEAD refs/heads/main
ORIG_HEAD 
refs/heads/main 
refs/heads/test 
refs/remotes/origin/HEAD refs/remotes/origin/main
refs/remotes/origin/main 
refs/tags/kalit 
refs/tags/v1.0 
refs/tags/v1.1 
refs/tags/v1.2 
```

`%(symref)` — symref bo'lsa, u ko'rsatgan nom. Ro'yxatda `FETCH_HEAD` yo'q — u pseudoref, oddiy ref ombori qismi emas.

```bash
$ git refs exists refs/heads/test; echo "exit=$?"
exit=0
$ git refs exists refs/heads/yoq; echo "exit=$?"
error: reference does not exist
exit=2
$ git refs create refs/heads/yangi HEAD~2
$ git refs create refs/heads/yangi HEAD
error: update_ref failed for ref 'refs/heads/yangi': cannot lock ref 'refs/heads/yangi': reference already exists
$ git refs update --message=yangini-surish refs/heads/yangi HEAD
$ git refs rename refs/heads/yangi refs/heads/nomlangan
$ git refs delete refs/heads/nomlangan
$ git refs verify; echo "exit=$?"
exit=0
```

| `git refs` | Vazifa | Eski muqobil |
| --- | --- | --- |
| `list` | Ro'yxat | `git for-each-ref` |
| `exists` | Ref bormi | `git show-ref --exists` |
| `create` | Faqat yo'q bo'lsa yaratish | `git update-ref <ref> <yangi> ''` |
| `update` | Yangilash (ixtiyoriy eski qiymat sharti) | `git update-ref <ref> <yangi> [<eski>]` |
| `delete` | O'chirish | `git update-ref -d` |
| `rename` | Qayta nomlash (yangi nom bo'sh bo'lishi shart) | `git branch -m` (faqat branch'lar) |
| `verify` | Ref bazasining butunligini tekshirish | `git fsck` ning bir qismi |
| `optimize` | Ref'larni yig'ish | `git pack-refs` |
| `migrate` | Formatni almashtirish (`files` ↔ `reftable`) | — |

`git refs` — Git 2.56 dagi nisbatan yangi buyruq; eski Git versiyalarida `create`/`update`/`rename` yo'q. Eski versiyalarga ham mos skript yozsangiz, `update-ref` va `for-each-ref` ishlating.

## Kod: `packed-refs` — ko'p ref'ni bitta faylda

`pack-refs` ma'lumotnomasi muammoni shunday ta'riflaydi: har ref — alohida fayl. Branch'lar tez-tez o'zgaradi, lekin teglarning ko'pi va eski branch'lar hech qachon o'zgarmaydi. Yuzlab yoki minglab teg bo'lsa, "bir ref — bir fayl" usuli ham joyni isrof qiladi, ham sekinlashtiradi. Yechim — ularni bitta `.git/packed-refs` fayliga yig'ish.

```bash
$ ls .git/packed-refs
ls: .git/packed-refs: No such file or directory
$ git pack-refs
$ cat .git/packed-refs
# pack-refs with: peeled fully-peeled sorted 
56c65df471c6e96d65efe572e42ef32209242c9e refs/tags/kalit
^73ec1fafb8a7795e42a36a784e261a0b4d0bb1f1
ca137d1bffec19ce1d1c6f481a2974aa26787e88 refs/tags/v1.0
deb8e3877ca530eea8d5489a0b2e160289b02d30 refs/tags/v1.1
^9fb24ac6bf55c9ca489787f18a6dbad620e7f320
bbca228b6a3e4887d1168359a74aa618884a3e14 refs/tags/v1.2
^9fb24ac6bf55c9ca489787f18a6dbad620e7f320
$ find .git/refs -type f | sort
.git/refs/heads/main
.git/refs/heads/test
.git/refs/remotes/origin/HEAD
.git/refs/remotes/origin/main
```

Opsiyasiz `pack-refs` **faqat teglarni** (va avval yig'ilgan ref'larni) yig'di, branch'larga tegmadi. Sabab ma'lumotnomada: branch'lar faol o'zgaradi, ularni yig'ish tezlikka yordam bermaydi.

Fayl tuzilishi:

- Birinchi qator — sarlavha: fayl qanday xususiyatlar bilan yozilgani (`peeled` — archilgan qiymatlar bor, `sorted` — tartiblangan, shuning uchun ikkilik qidiruv mumkin).
- `<hash> <ref nomi>` — har ref bitta qatorda.
- `^<hash>` — oldingi qatordagi annotated tegning **archilgan** qiymati. Shu tufayli `git show-ref -d` yoki klon paytida teg obyektlarini ochmasdan commit'ni bilish mumkin ([4-bobda](04-repo-olish.md) klondan keyin aynan shu ko'ringan).

`--all` bilan hammasi yig'iladi:

```bash
$ git pack-refs --all
$ cat .git/packed-refs
# pack-refs with: peeled fully-peeled sorted 
2608d4cacf2828103c3b864516e93e4c207d63e7 refs/heads/main
df00a2d0b91055b97dfb4aa77b245f0dd78c5d7e refs/heads/test
9fb24ac6bf55c9ca489787f18a6dbad620e7f320 refs/remotes/origin/main
56c65df471c6e96d65efe572e42ef32209242c9e refs/tags/kalit
^73ec1fafb8a7795e42a36a784e261a0b4d0bb1f1
ca137d1bffec19ce1d1c6f481a2974aa26787e88 refs/tags/v1.0
deb8e3877ca530eea8d5489a0b2e160289b02d30 refs/tags/v1.1
^9fb24ac6bf55c9ca489787f18a6dbad620e7f320
bbca228b6a3e4887d1168359a74aa618884a3e14 refs/tags/v1.2
^9fb24ac6bf55c9ca489787f18a6dbad620e7f320
$ find .git/refs -type f | sort
.git/refs/remotes/origin/HEAD
$ git rev-parse main test
2608d4cacf2828103c3b864516e93e4c207d63e7
df00a2d0b91055b97dfb4aa77b245f0dd78c5d7e
```

`refs/heads/` bo'sh, lekin branch'lar ishlayveradi — loose fayl topilmasa, Git `packed-refs`ga qaraydi. Bitta istisno qoldi: `origin/HEAD` — u symref, symref'lar esa hech qachon yig'ilmaydi. Loose fayllar ham o'chirildi (`--no-prune` bilan qoldirish mumkin).

### Loose ref yig'ilganidan ustun

Ma'lumotnoma: yig'ilgan branch keyin yangilansa, **yana loose fayl** yaratiladi. Commit qilib ko'ramiz:

```bash
$ git commit -q -am "Beshinchi commit"
$ find .git/refs -type f | sort
.git/refs/heads/main
.git/refs/remotes/origin/HEAD
$ cat .git/refs/heads/main
d5684066e9f714785661999bf31a8d99c123d65a
$ grep heads/main .git/packed-refs
2608d4cacf2828103c3b864516e93e4c207d63e7 refs/heads/main
$ git rev-parse main
d5684066e9f714785661999bf31a8d99c123d65a
```

`packed-refs`da eski qiymat qoldi, loose faylda yangisi — va **loose g'olib**. Git `packed-refs`ni har commit'da qayta yozmaydi (u katta bo'lishi mumkin); eski yozuv keyingi `pack-refs`da yangilanadi.

O'chirish esa boshqacha — yig'ilgan ref'ni o'chirish uchun Git butun `packed-refs`ni qayta yozishi shart:

```bash
$ git branch -D test
Deleted branch test (was df00a2d).
$ cat .git/packed-refs
# pack-refs with: peeled fully-peeled sorted 
2608d4cacf2828103c3b864516e93e4c207d63e7 refs/heads/main
9fb24ac6bf55c9ca489787f18a6dbad620e7f320 refs/remotes/origin/main
...
```

Bir necha yuz qatorda bu sezilmaydi; o'n minglab ref'li repo'larda esa bu `files` formatining zaif nuqtasi. `git gc` `pack-refs`ni avtomatik chaqiradi ([18-bob](18-packfile-va-gc.md)); qo'lda chaqirish odatda shart emas. `--auto` opsiyasi esa "kerak bo'lsagina" yig'adi: loose ref'lar soni `packed-refs` hajmiga nisbatan ko'paygandagina.

## Muhandislik nuqtai nazari: `reftable` — ref'lar uchun ma'lumotlar bazasi

**Muammo.** `BreakingChanges` hujjati `files` formatining kamchiliklarini sanab o'tadi:

- Katta-kichik harfni farqlamaydigan fayl tizimlarida (Windows, macOS) faqat registri bilan farq qiladigan ikki ref'ni saqlab bo'lmaydi (`Feature` va `feature` — bitta fayl). macOS Unicode nomlarni normallashtirgani uchun ham shunga o'xshash muammo bor.
- Yig'ilgan ref'ni o'chirish butun `packed-refs`ni qayta yozadi; katta repo'larda u o'nlab megabayt, ba'zan gigabayt bo'ladi.
- Ko'p ref'ni birga yozish atomik emas — o'quvchi oraliq holatni ko'rishi mumkin (yuqorida `--stdin` haqida aytilgan).
- Minglab ref yozish — minglab fayl yaratish, sekin.

**Yechim.** `reftable` — ref'lar va reflog'larni ikkilik jadvallarda saqlaydigan format. Hozir uni ixtiyoriy yoqish mumkin:

```bash
$ git init -q -b main --ref-format=reftable 17-reftable
$ cd 17-reftable
$ cat .git/HEAD
ref: refs/heads/.invalid
$ ls -la .git/refs
total 8
drwxr-xr-x  3 ali   staff   96 Oct  8 07:41 .
drwxr-xr-x 10 ali   staff  320 Oct  8 07:41 ..
-rw-r--r--  1 ali   staff   41 Oct  8 07:41 heads
$ cat .git/refs/heads
this repository uses the reftable format
```

Ko'p narsa g'alati ko'rinadi — va bu ataylab:

- `.git/HEAD`da `refs/heads/.invalid` — **yaroqsiz** nom (`.` bilan boshlanadi). Fayl faqat eski vositalar ".git papkasi — Git repo'si" deb tanishi uchun "qopqoq" sifatida turadi. Haqiqiy HEAD reftable ichida.
- `refs/heads` — papka emas, **fayl**, ichida izoh matni. Eski vosita u yerga loose ref yozmoqchi bo'lsa, muvaffaqiyatsiz bo'ladi va reftable buzilmaydi.

Haqiqiy ma'lumot boshqa joyda:

```bash
$ cat .git/config
[extensions]
	refstorage = reftable
[core]
	repositoryformatversion = 1
	...
$ ls -la .git/reftable
total 16
drwxr-xr-x  4 ali   staff  128 Oct  8 07:41 .
drwxr-xr-x 10 ali   staff  320 Oct  8 07:41 ..
-rw-r--r--  1 ali   staff  124 Oct  8 07:41 0x000000000001-0x000000000001-f3c482e4.ref
-rw-r--r--  1 ali   staff   43 Oct  8 07:41 tables.list
$ cat .git/reftable/tables.list
0x000000000001-0x000000000001-f3c482e4.ref
```

`repositoryformatversion = 1` va `extensions.refstorage` — SHA-256 dagidek ([14-bob](14-obyektlar-blob.md)), reftable'ni tushunmaydigan eski Git'ga "tegma" signali. `tables.list` — joriy jadvallar ro'yxati, `.ref` fayllar — jadvallar. Fayl nomidagi ikki son — jadval qamrab olgan **yangilanish indekslari** oralig'i (`0x...1`–`0x...1`: birinchi yangilanish).

Har yozuv yangi kichik jadval qo'shadi, keyin Git jadvallarni **geometrik siqish** bilan birlashtiradi (`pack-refs --auto` ta'rifi: har eski jadval undan keyingisidan kamida ikki marta katta bo'lishi kerak). Commit va ikki branch'dan keyin:

```bash
$ git commit -q -m Birinchi
$ cat .git/reftable/tables.list
0x000000000001-0x000000000002-bba9cd4f.ref
$ git branch b1
$ cat .git/reftable/tables.list
0x000000000001-0x000000000003-93710965.ref
$ git branch b2
$ cat .git/reftable/tables.list
0x000000000001-0x000000000004-6d77b36c.ref
```

Har safar bitta jadval qoldi va u 1–4 yangilanishlarni qamrab oldi. Ichida — ikkilik format, ref nomlari prefiks siqish bilan:

```bash
$ xxd .git/reftable/0x000000000001-0x000000000004-6d77b36c.ref | head -5
00000000: 5245 4654 0100 1000 0000 0000 0000 0001  REFT............
00000010: 0000 0000 0000 0004 7200 0092 0023 4845  ........r....#HE
00000020: 4144 000f 7265 6673 2f68 6561 6473 2f6d  AD..refs/heads/m
00000030: 6169 6e00 6972 6566 732f 6865 6164 732f  ain.irefs/heads/
00000040: 6231 02bb 21a1 a7f8 5338 4bd0 9384 3488  b1..!...S8K...4.
```

`REFT` — sehrli belgi, keyin `HEAD` → `refs/heads/main` symref yozuvi va `refs/heads/b1`. `cat` bilan o'qib bo'lmaydi, lekin buyruqlar bir xil ishlaydi:

```bash
$ git symbolic-ref HEAD
refs/heads/main
$ git rev-parse --show-ref-format
reftable
```

### Mavjud repo'ni ko'chirish: `git refs migrate`

Repo nusxasida sinaymiz:

```bash
$ git rev-parse --show-ref-format
files
$ git refs migrate --ref-format=reftable --dry-run
Finished dry-run migration of refs, the result can be found at '.git/ref_migration.7Y7UU1'
$ git refs migrate --ref-format=reftable
$ git rev-parse --show-ref-format
reftable
$ ls .git
COMMIT_EDITMSG
FETCH_HEAD
HEAD
config
description
hooks
index
info
objects
ref_migration.7Y7UU1
refs
reftable
$ git reflog -2 main
d568406 main@{0}: commit: Beshinchi commit
2608d4c main@{1}: reset: moving to ORIG_HEAD
```

`--dry-run` natijani alohida papkaga yozib, repo'ni o'zgartirmaydi — tekshirib ko'rish uchun. Haqiqiy ko'chirishdan keyin `logs/`, `packed-refs` va `ORIG_HEAD` fayli yo'qoldi — hammasi `reftable/` ichida, reflog ham saqlangan (`--no-reflog` bilan tashlab yuborish mumkin). `FETCH_HEAD` fayl bo'lib qoldi — pseudoref, ref ombori qismi emas. Dry-run papkasini o'zingiz o'chirasiz.

Ma'lumotnomadagi cheklovlar: worktree'lari bor repo'ni ko'chirib bo'lmaydi ([49-bob](49-worktree-va-katta-repo.md)); ko'chirish paytida parallel yozishni Git to'xtatmaydi — rejali `maintenance` yoqilgan bo'lsa, avval uni o'chiring ([18-bob](18-packfile-va-gc.md)).

**Git 3.0.** `BreakingChanges`ga ko'ra yangi repo'lar uchun standart `reftable` bo'ladi. Shart — ekotizim tayyor bo'lishi, avvalo JGit, libgit2 va Gitoxide kabi muqobil implementatsiyalar uni qo'llab-quvvatlashi. Hozir standartni o'zgartirish uchun `init.defaultRefFormat` sozlamasi bor ([3-bob](03-birinchi-sozlash.md)).

Amaliy xulosa: hozircha `files` bilan qoling, agar IDE, CI yoki boshqa vositalaringiz `reftable`ni tushunishiga ishonchingiz komil bo'lmasa. Lekin skriptlarni hozirdanoq `.git/refs`ni `cat` qilmaydigan qilib yozing.

## Muhandislik nuqtai nazari: skriptlarda ref bilan ishlash

Bu bobdagi `cat .git/...` buyruqlari — modelni ko'rsatish uchun. Haqiqiy skriptlarda format va qulflashni Git'ga topshiring:

| Vazifa | Yomon | Yaxshi |
| --- | --- | --- |
| Branch hash'ini olish | `cat .git/refs/heads/main` | `git rev-parse --verify refs/heads/main` |
| Joriy branch nomi | `cut -c17- .git/HEAD` | `git symbolic-ref --short -q HEAD` yoki `git branch --show-current` |
| Ref bormi | `test -f .git/refs/...` | `git show-ref --exists <ref>` / `git refs exists <ref>` |
| Ref yozish | `echo <hash> > .git/refs/...` | `git update-ref <ref> <yangi> <eski>` |
| Hamma teglar | `ls .git/refs/tags` | `git for-each-ref --format='%(refname:short)' refs/tags` |
| Teg commit'i | `cat .git/refs/tags/v1` | `git rev-parse 'v1^{commit}'` |
| Bir nechta ref'ni birga | ketma-ket `update-ref` | `git update-ref --stdin` tranzaksiya bilan |

Chap ustundagilarning hammasi `packed-refs` yoki `reftable`da noto'g'ri natija beradi (yoki umuman ishlamaydi) va reflog'ni chetlab o'tadi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Ref fayliga qisqa hash yozish | Git uni "broken ref" deb e'tiborsiz qoldiradi | `git update-ref` — u qisqa hash'ni yechadi |
| `echo hash > .git/refs/heads/x` bilan branch yaratish | Reflog yozilmaydi, qulf yo'q, `reftable`da ishlamaydi | `git update-ref refs/heads/x <hash>` |
| `.git/refs/heads/` bo'sh — "branch'lar yo'qoldi" deb qo'rqish | Ular `packed-refs`da yoki `reftable`da | `git show-ref --branches` |
| Teg va branch'ga bir xil nom berish | `warning: refname is ambiguous`, teg tanlanadi | Nomlarni ajrating yoki `heads/`, `tags/` prefiksi |
| `symbolic-ref HEAD refs/heads/x` ni `switch` o'rnida ishlatish | Index va working tree eski branch'da qoladi, `status` "o'zgarish" ko'rsatadi | `git switch x` |
| Skriptda `symbolic-ref HEAD` ni `-q`siz ishlatish | Detached HEAD'da `fatal` va kod 128 | `git symbolic-ref -q HEAD` (kod 1) |
| Teg ref'i commit'ni ko'rsatadi deb o'ylash | Annotated tegda u teg obyektini ko'rsatadi | `git rev-parse 'teg^{commit}'` |
| `origin/main`ga commit qilmoqchi bo'lish | Remote ref'lar faqat o'qish uchun; `checkout` detached qiladi | `git switch -c ish origin/main` |
| Eskirgan `.lock`ni o'ylamasdan o'chirish | Boshqa jarayon haqiqatan ishlayotgan bo'lsa, ref buziladi | Avval Git jarayonlari yo'qligini tekshiring |
| Shartsiz `update-ref` bilan parallel yozish | Boshqa jarayonning o'zgarishi jimgina yo'qoladi | Uchinchi argument — eski qiymat |

## Amaliyot

1. Yangi repo'da birinchi commit'dan oldin va keyin `find .git/refs -type f`, `cat .git/HEAD`, `git rev-parse HEAD` ni solishtiring. Nega `symbolic-ref HEAD` commit'dan oldin ham ishlaydi?
2. Uchta commit qiling. `echo <to'liq hash> > .git/refs/heads/a` va `git update-ref refs/heads/b <hash>` bilan ikki branch yarating. `.git/logs/refs/heads/` dagi farqni tushuntiring. Keyin `a` fayliga qisqa hash yozib, nima bo'lishini ko'ring.
3. `git update-ref` ning uchinchi argumentini sinang: noto'g'ri eski qiymat bilan rad etilishini va bo'sh `''` bilan "faqat yangi bo'lsa" shartini ko'rsating.
4. `git update-ref --stdin` bilan bitta tranzaksiyada uch branch yarating, to'rtinchi qatorga ataylab noto'g'ri `verify` qo'ying. Nechta branch yaratilganini tekshiring.
5. `git symbolic-ref HEAD refs/heads/<boshqa branch>` qiling va `git status` nima uchun o'zgarish ko'rsatayotganini tushuntiring. Keyin `git update-ref --no-deref HEAD HEAD~1` bilan detached holatga o'ting va `cat .git/HEAD` ni ko'ring.
6. Annotated teg yarating, uning obyektini Python `zlib` bilan oching va sarlavhadagi hajmni `git cat-file -s` bilan solishtiring. Keyin xuddi shu tegni `git mktag` va `git update-ref` bilan qo'lda yasang — hash bir xil chiqishi uchun nima kerak?
7. `git pack-refs` va `git pack-refs --all` dan keyingi `.git/packed-refs` va `.git/refs` holatini solishtiring. Bir branch'ga commit qiling — ref qayerda paydo bo'ladi va qaysi qiymat ustun?
8. (Qiyinroq) Repo nusxasini `git refs migrate --ref-format=reftable` bilan ko'chiring. `.git/` tuzilishi qanday o'zgardi? `git reflog`, `git show-ref`, `git symbolic-ref HEAD` hamon ishlashini tekshiring. Keyin `--ref-format=files` bilan orqaga ko'chirib, `packed-refs` qaytib kelganini ko'ring.

## Rasmiy hujjat

- Pro Git — Git References: <https://git-scm.com/book/en/v2/Git-Internals-Git-References>
- `git update-ref`: <https://git-scm.com/docs/git-update-ref>
- `git symbolic-ref`: <https://git-scm.com/docs/git-symbolic-ref>
- `git refs`: <https://git-scm.com/docs/git-refs>
- `git show-ref`: <https://git-scm.com/docs/git-show-ref>
- `git for-each-ref`: <https://git-scm.com/docs/git-for-each-ref>
- `git pack-refs`: <https://git-scm.com/docs/git-pack-refs>
- `git mktag`: <https://git-scm.com/docs/git-mktag>
- `gitdatamodel` — References: <https://git-scm.com/docs/gitdatamodel>
- `gitrevisions` — ref nomlarini yechish: <https://git-scm.com/docs/gitrevisions>
- `gitrepository-layout`: <https://git-scm.com/docs/gitrepository-layout>
- Git 3.0 dagi o'zgarishlar (`BreakingChanges`): <https://git-scm.com/docs/BreakingChanges>
