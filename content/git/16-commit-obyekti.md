# 16 — Commit obyekti

[← Oldingi: Tree va index](15-tree-va-index.md) · [Mundarija](README.md) · [Keyingi: Ref'lar, HEAD va teg obyekti →](17-reflar-va-head.md)

## Tushuncha

[15-bobda](15-tree-va-index.md) uchta tree yasadik — loyihaning uchta surati: `d8329fc`, `0155eb4` va `3c4e9cd`. Lekin Pro Git aytganidek, muammo hali hal bo'lmadi:

- suratlarni qaytarib olish uchun uchala hash'ni **eslab qolish** kerak;
- suratni **kim** saqlagani, **qachon** va **nega** saqlagani hech qayerda yozilmagan;
- suratlar orasida **tartib** yo'q — qaysi biri qaysidan keyin kelganini bilib bo'lmaydi.

Bu uch bo'shliqni **commit** obyekti to'ldiradi. **Commit** — loyihaning ma'lum paytdagi to'liq surati (snapshot) va shu suratga olib kelgan tarix haqidagi yozuv. `git commit-tree` ma'lumotnomasi farqni bitta jumlada aytadi: tree ishchi papkaning ma'lum **holatini** ifodalaydi, commit esa shu holatni **vaqtga** joylaydi va unga qanday kelinganini tushuntiradi.

`gitdatamodel` hujjatiga ko'ra commit beshta narsani saqlaydi:

| # | Maydon | Ma'nosi |
| --- | --- | --- |
| 1 | `tree` | Loyiha ildiz papkasining tree'si — butun surat |
| 2 | `parent` | Ota commit(lar). Birinchi commit'da 0 ta, oddiy commit'da 1 ta, merge commit'da 2 ta yoki undan ko'p |
| 3 | `author` | **Muallif** — o'zgarishni yozgan odam va yozilgan vaqt |
| 4 | `committer` | **Commit qiluvchi** — commit'ni yaratgan odam va yaratilgan vaqt |
| 5 | xabar | Bo'sh qatordan keyingi matn — nega shunday qilingani |

Commit ham blob va tree kabi obyekt ([14-bob](14-obyektlar-blob.md)): mazmunidan hash hisoblanadi, zlib bilan siqilib `.git/objects` ga yoziladi va **hech qachon o'zgarmaydi**.

Uchala obyekt turi endi bitta rasmga yig'iladi:

```text
 commit bf3788a ──parent──> commit f1ad0c9 ──parent──> commit 35492cf
      │                          │                          │
     tree 3c4e9cd               tree 0155eb4               tree d8329fc
     /   |    \                 /       \                    │
  bak  new.txt test.txt     new.txt   test.txt           test.txt
   │      │       │            │         │                   │
 tree   blob    blob         blob      blob                blob
d8329fc fa49b07 1f7a7a4     fa49b07   1f7a7a4             83baae6
```

Strelkalar faqat bir tomonga — **yangidan eskiga** qarab yo'nalgan. Commit otasini biladi, lekin bolalarini bilmaydi.

## Nega shunday: nega commit — tree'dan alohida obyekt, va nega u faqat otasini biladi

**Nega tree'ga muallif va sanani qo'shib qo'ya qolmaslik kerak?** Chunki tree — faqat mazmun. Bir xil fayllar to'plami doim bitta tree hash'ini beradi ([15-bob](15-tree-va-index.md)): ikki odam turli kunlarda bir xil holatga kelsa, ular bitta tree'ni baham ko'radi. Sana va muallif tree'ga kirsa, bu qayta ishlatish yo'qolardi — har commit butun daraxt bo'ylab yangi tree'lar yasagan bo'lardi. Shuning uchun "nima" (tree) va "kim, qachon, nega, nimadan keyin" (commit) alohida obyektlar.

**Nega faqat ota, bola emas?** Obyekt yaratilgandan keyin o'zgarmaydi. Commit yozilayotganda uning otasi allaqachon mavjud — hash'ini yozish mumkin. Bolalari esa hali yo'q, va keyin paydo bo'lganda otani "tahrirlab" ularni qo'shib bo'lmaydi — otaning hash'i o'zgarib ketardi. Natijada tarix **orqaga yo'naltirilgan graf**: Git uni faqat yangidan eskiga qarab yura oladi ([9-bob](09-tarixni-korish.md)).

**Bu tanlovning eng muhim oqibati — zanjirli kafolat.** `parent` qatorida otaning hash'i yozilgan, otaning ichida esa uning otasining hash'i, va hokazo. Demak bitta commit hash'i **butun tarixni** kafolatlaydi: o'tmishdagi istalgan faylning bitta baytini o'zgartirsangiz, o'sha blob, uning tree'lari, o'sha commit va undan keyingi **hamma** commit'larning hash'i o'zgaradi. Shu sababli tarixni "jimgina" qayta yozib bo'lmaydi, va bitta commit'ga qo'yilgan imzo ([44-bob](44-imzolash.md)) uning ortidagi butun tarixni ham imzolaydi.

## Kod: `git commit-tree` — birinchi commit

15-bobdagi repo nusxasida davom etamiz. Index va obyektlar joyida, lekin hali birorta commit yo'q:

```bash
$ cp -r 15-tree-index 16-commit && cd 16-commit
$ cat .git/HEAD
ref: refs/heads/main
$ git log
fatal: your current branch 'main' does not have any commits yet
```

`HEAD` `main` ga ishora qiladi, `main` esa hali yo'q ([17-bob](17-reflar-va-head.md)). Birinchi tree'dan commit yasaymiz. Xabar standart kirishdan o'qiladi:

```bash
$ echo 'First commit' | git commit-tree d8329f
35492cfd394c29c3ae03d9b527d8d8d9b1342749
```

`commit-tree` ga kerak bo'lgani — bitta tree (qisqa hash yetarli) va xabar. Natija — yangi commit'ning hash'i. Pro Git'dagi hash (`fdf4fc3...`) bilan solishtirsangiz, **farq qiladi**: Pro Git ham shuni ogohlantiradi — commit'ga muallif va vaqt kiradi, ular sizda boshqa. 15-bobdagi tree hash'lari esa Pro Git bilan aynan bir xil chiqqan edi: tree'da muallif ham, vaqt ham yo'q.

Ichini ko'ramiz:

```bash
$ git cat-file -t 35492cf
commit
$ git cat-file -s 35492cf
171
$ git cat-file -p 35492cf
tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579
author Ali Valiyev <ali@example.com> 1791349200 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500

First commit
```

Qator-qator:

- `tree d8329fc...` — ildiz tree. Bitta: ichki papkalar shu tree ichida ([15-bob](15-tree-va-index.md)).
- `parent` qatori **yo'q** — bu **ildiz commit** (root commit), tarixning boshi.
- `author` va `committer` — `Ism <email> <vaqt> <zona>`. Ism va email `GIT_AUTHOR_*`/`GIT_COMMITTER_*` muhit o'zgaruvchilaridan, ular bo'lmasa `user.name`/`user.email` sozlamasidan olinadi ([3-bob](03-birinchi-sozlash.md), [48-bob](48-muhit-ozgaruvchilari.md)).
- Bo'sh qator — sarlavha tugadi.
- `First commit` — xabar.

## Kod: ota zanjiri — `-p`

Qolgan ikki tree'dan commit'lar yasaymiz. Har biri `-p` (parent) bilan oldingisiga ishora qiladi. Vaqtni ham o'zgartiramiz, sana qayerga yozilishi ko'rinsin:

```bash
$ export GIT_AUTHOR_DATE=2026-10-07T10:05:00+05:00 GIT_COMMITTER_DATE=2026-10-07T10:05:00+05:00
$ echo 'Second commit' | git commit-tree 0155eb -p 35492cf
f1ad0c9778f71df4dd5c987597ed24518e65a927
$ export GIT_AUTHOR_DATE=2026-10-07T10:10:00+05:00 GIT_COMMITTER_DATE=2026-10-07T10:10:00+05:00
$ echo 'Third commit' | git commit-tree 3c4e9c -p f1ad0c9
bf3788a9541a2b113176e9ada6d55ae10750d077
$ unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE
$ git cat-file -p f1ad0c9
tree 0155eb4229851634a0f03eb265b69f5a2d56f341
parent 35492cfd394c29c3ae03d9b527d8d8d9b1342749
author Ali Valiyev <ali@example.com> 1791349500 +0500
committer Ali Valiyev <ali@example.com> 1791349500 +0500

Second commit
```

(`unset` — sinov muhitining standart vaqti 10:00 ga qaytish uchun; bobning qolgan misollari shu vaqt bilan.)

Endi `parent` qatori bor. Pro Git aytganidek, bu yerda g'alati bir narsa yuz berdi: bizda **haqiqiy Git tarixi** bor, garchi biror porcelain buyruq ishlatmagan bo'lsak ham. Oxirgi commit hash'i bilan `git log` ishlaydi:

```bash
$ git log --stat bf3788a
commit bf3788a9541a2b113176e9ada6d55ae10750d077
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:10:00 2026 +0500

    Third commit

 bak/test.txt | 1 +
 1 file changed, 1 insertion(+)

commit f1ad0c9778f71df4dd5c987597ed24518e65a927
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:05:00 2026 +0500

    Second commit

 new.txt  | 1 +
 test.txt | 2 +-
 2 files changed, 2 insertions(+), 1 deletion(-)

commit 35492cfd394c29c3ae03d9b527d8d8d9b1342749
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:00:00 2026 +0500

    First commit

 test.txt | 1 +
 1 file changed, 1 insertion(+)
```

E'tibor bering: `--stat` dagi "1 insertion", "2 files changed" — bularning hech biri commit ichida **saqlanmagan**. `gitdatamodel` buni aniq aytadi: Git commit uchun diff saqlamaydi; `git show` yoki `git log -p` diff'ni har safar ota commit'ning tree'si bilan solishtirib, **o'sha zahoti hisoblaydi**. Commit — surat, diff emas ([1-bob](01-versiya-nazorati.md)).

`log` zanjirni qanday yuradi — buni plumbing darajasida `rev-list` ko'rsatadi:

```bash
$ git rev-list --parents bf3788a
bf3788a9541a2b113176e9ada6d55ae10750d077 f1ad0c9778f71df4dd5c987597ed24518e65a927
f1ad0c9778f71df4dd5c987597ed24518e65a927 35492cfd394c29c3ae03d9b527d8d8d9b1342749
35492cfd394c29c3ae03d9b527d8d8d9b1342749
```

Har qatorda: commit va uning otasi. Oxirgisida ota yo'q — ildizga yetdik. `git log` ham aynan shunday ishlaydi: boshlang'ich commit'ni o'qiydi, `parent` ni oladi, uni o'qiydi, va hokazo. Qisqartmalar ham shu zanjir bo'ylab yuradi (`^` — ota, `~2` — bobosi, batafsil [19-bobda](19-revision-tanlash.md)):

```bash
$ git rev-parse 'bf3788a^{tree}' 'bf3788a^' 'bf3788a~2'
3c4e9cd789d88d8d89c1073707c3585e41b0e614
f1ad0c9778f71df4dd5c987597ed24518e65a927
35492cfd394c29c3ae03d9b527d8d8d9b1342749
```

## Kod: `.git/objects` da nima bor, `HEAD` qayerda

```bash
$ find .git/objects -type f | sort
.git/objects/01/55eb4229851634a0f03eb265b69f5a2d56f341
.git/objects/1f/7a7a472abf3dd9643fd615f6da379c4acb3e3a
.git/objects/32/eb30f2144e9c1887ff4528474dfa2f90fa5d17
.git/objects/35/492cfd394c29c3ae03d9b527d8d8d9b1342749
.git/objects/3c/4e9cd789d88d8d89c1073707c3585e41b0e614
.git/objects/83/baae61804e65cc73a7201a7252750c76066a30
.git/objects/b1/c0df9657b54681181a3f5aa59373135bc0348f
.git/objects/bd/9dbf5aae1a3862dd1526723246b20206e5fc37
.git/objects/bf/3788a9541a2b113176e9ada6d55ae10750d077
.git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4
.git/objects/d8/329fc1cc938780ffdd9f94e0d364e0ea74f579
.git/objects/f1/ad0c9778f71df4dd5c987597ed24518e65a927
.git/objects/fa/49b077972391ad58037050f2a75f74e3671e92
```

Uchta yangi fayl: `35/`, `f1/`, `bf/` — uchta commit. Qolganlari 14–15-boblardan (`32eb30f` — 15-bobdagi `--missing-ok` bilan yasalgan buzuq tree, `b1c0df9` — vaqtincha index'dan yasalgan tree).

Lekin repo hali buni "bilmaydi":

```bash
$ git status
On branch main

No commits yet
...
$ git fsck
notice: No default references
dangling commit bf3788a9541a2b113176e9ada6d55ae10750d077
dangling tree 32eb30f2144e9c1887ff4528474dfa2f90fa5d17
dangling tree b1c0df9657b54681181a3f5aa59373135bc0348f
dangling blob d670460b4b4aece5915caf5c68d12f560a9fe3e4
dangling blob bd9dbf5aae1a3862dd1526723246b20206e5fc37
```

`commit-tree` faqat **obyekt** yozdi. Hech qaysi ref unga ishora qilmaydi — `fsck` uni `dangling commit` ("osilib qolgan" commit) deydi. Faqat `bf3788a`: qolgan ikkitasi undan `parent` orqali yetib boriladi, shuning uchun ular "osilgan" emas. Ma'lumotnoma ham shuni aytadi: Git yangi commit hash'ini qayerga yozib qo'yishingizga befarq, lekin amalda uni `.git/HEAD` ko'rsatgan faylga yozamiz — oxirgi holatni doim ko'rish uchun.

Ref'ni yozish — `git update-ref` ([17-bob](17-reflar-va-head.md)):

```bash
$ git update-ref refs/heads/main bf3788a9541a2b113176e9ada6d55ae10750d077
$ cat .git/refs/heads/main
bf3788a9541a2b113176e9ada6d55ae10750d077
$ git log --oneline
bf3788a Third commit
f1ad0c9 Second commit
35492cf First commit
$ git status
On branch main
nothing to commit, working tree clean
$ git fsck
dangling tree 32eb30f2144e9c1887ff4528474dfa2f90fa5d17
dangling tree b1c0df9657b54681181a3f5aa59373135bc0348f
dangling blob d670460b4b4aece5915caf5c68d12f560a9fe3e4
dangling blob bd9dbf5aae1a3862dd1526723246b20206e5fc37
```

Endi `main` bor, `git log` hash'siz ishlaydi, `fsck` commit'dan shikoyat qilmaydi. `status` "toza" — chunki 15-bob oxirida index ham, working tree ham `3c4e9cd` holatida edi va u bilan `HEAD` tree'si bir xil.

15-bobda gitlink misolida `1a410ef...` hash'ini "16-bobda yasaladigan commit" deb ishlatgandik — bu Pro Git kitobidagi uchinchi commit'ning hash'i. Bizning uchinchi commit `bf3788a` bo'lib chiqdi: tree'lar bir xil, lekin muallif va vaqt boshqa. Gitlink'da baribir boshqa repo'dagi commit nazarda tutiladi, shuning uchun u misol uchun ahamiyatsiz.

## Kod: commit obyektining xom baytlari

Commit diskda ham boshqa obyektlar kabi saqlanadi — sarlavha, `\0`, mazmun, zlib ([14-bob](14-obyektlar-blob.md)):

```bash
$ python3 -c "import zlib,sys;print(zlib.decompress(open(sys.argv[1],'rb').read()))" \
    .git/objects/f1/ad0c9778f71df4dd5c987597ed24518e65a927
b'commit 220\x00tree 0155eb4229851634a0f03eb265b69f5a2d56f341\nparent 35492cfd394c29c3ae03d9b527d8d8d9b1342749\nauthor Ali Valiyev <ali@example.com> 1791349500 +0500\ncommitter Ali Valiyev <ali@example.com> 1791349500 +0500\n\nSecond commit\n'
$ wc -c .git/objects/f1/ad0c9778f71df4dd5c987597ed24518e65a927
     159 .git/objects/f1/ad0c9778f71df4dd5c987597ed24518e65a927
```

Tree'dan farqli ([15-bob](15-tree-va-index.md)), commit — **to'liq matn**: hash'lar 40 belgili hex ko'rinishida, har maydon alohida qatorda, `\n` bilan. `cat-file -p` uni deyarli o'zgartirmasdan chiqaradi. Baytlar darajasida:

```bash
$ git cat-file commit f1ad0c9 | xxd
00000000: 7472 6565 2030 3135 3565 6234 3232 3938  tree 0155eb42298
00000010: 3531 3633 3461 3066 3033 6562 3236 3562  51634a0f03eb265b
00000020: 3639 6635 6132 6435 3666 3334 310a 7061  69f5a2d56f341.pa
00000030: 7265 6e74 2033 3534 3932 6366 6433 3934  rent 35492cfd394
...
000000c0: 3334 3935 3030 202b 3035 3030 0a0a 5365  349500 +0500..Se
000000d0: 636f 6e64 2063 6f6d 6d69 740a            cond commit.
```

`0a0a` — sarlavhaning oxirgi qatori tugashi va bo'sh qator: shu ikki `\n` sarlavhani xabardan ajratadi.

Hajmlarni solishtiring: birinchi commit 171 bayt, ikkinchisi 220. Farq 49 = `parent ` (7) + 40 hex + `\n` (1) = 48, va xabar bir harf uzunroq (`Second` 6, `First` 5). Har qo'shimcha ota — yana 48 bayt.

Endi hash'ni Git'siz, Python bilan hisoblaymiz — 14–15-boblardagi formulaning davomi:

```bash
$ python3 - <<'EOF'
import hashlib
body = (b'tree 0155eb4229851634a0f03eb265b69f5a2d56f341\n'
        b'parent 35492cfd394c29c3ae03d9b527d8d8d9b1342749\n'
        b'author Ali Valiyev <ali@example.com> 1791349500 +0500\n'
        b'committer Ali Valiyev <ali@example.com> 1791349500 +0500\n'
        b'\n'
        b'Second commit\n')
print(len(body), hashlib.sha1(b'commit %d\0' % len(body) + body).hexdigest())
EOF
220 f1ad0c9778f71df4dd5c987597ed24518e65a927
```

`commit-tree` bergan hash bilan bir xil. Commit'ni hech qanday maxsus buyruqsiz, `hash-object` bilan ham yozish mumkin — bu `commit-tree` aslida nima qilishini ko'rsatadi:

```bash
$ git cat-file commit f1ad0c9 | git hash-object -t commit --stdin
f1ad0c9778f71df4dd5c987597ed24518e65a927
```

`hash-object` commit matnini tekshiradi. Masalan, `committer` qatorisiz:

```bash
$ printf 'tree %s\nauthor Ali <a@b> 1 +0000\n\nx\n' $(git rev-parse HEAD^{tree}) | git hash-object -t commit --stdin -w
error: object fails fsck: missingCommitter: invalid format - expected 'committer' line
fatal: refusing to create malformed object
```

`--literally` bu tekshiruvni o'chiradi, lekin bunday obyekt keyin `git fsck` da xato bo'lib chiqadi — faqat Git'ning o'zini sinash uchun.

## Kod: hash'ni nima o'zgartiradi

Commit hash'i — uning **har bir baytidan**. Bir xil kirish doim bir xil hash beradi; bitta bayt farq qilsa — butunlay boshqa hash:

```bash
$ echo 'First commit' | git commit-tree d8329f
35492cfd394c29c3ae03d9b527d8d8d9b1342749
$ echo 'First commit' | GIT_COMMITTER_DATE=2026-10-07T10:00:01+05:00 git commit-tree d8329f
7e3cd2978fc6512a267c5e0e336b61bf7bdef215
$ echo 'First commit.' | git commit-tree d8329f
135184415ca7c9328906a00c20f43bf59ccf793c
$ echo 'First commit' | GIT_AUTHOR_EMAIL=ali@example.org git commit-tree d8329f
63a19cab225ea0d619c8e0eeab228b82abb9abe0
$ echo 'First commit' | git commit-tree d8329f -p 35492cf
f0a62b9da3e8fe4f9c802ce27f55b52fad6bf975
```

1. Hamma narsa bir xil — **aynan o'sha** `35492cf`. Yangi obyekt yaratilmadi, mavjudi "qayta topildi".
2. Commit qiluvchi vaqti bir soniyaga farq — yangi hash.
3. Xabar oxirida nuqta — yangi hash.
4. Faqat email domeni — yangi hash.
5. Ota qo'shildi — yangi hash.

Bundan kundalik ishga oid xulosalar:

- `git commit --amend` commit'ni "tahrirlamaydi" — u **yangi** commit yaratadi, eski commit omborda qoladi ([11-bob](11-bekor-qilish.md)). `gitdatamodel` ham shuni aytadi: amend — o'sha ota bilan yangi commit.
- `rebase` va `cherry-pick` commit'ni boshqa ota ustiga ko'chirganda `parent` qatori o'zgaradi — demak hash ham, garchi diff aynan bir xil bo'lsa ham ([24-bob](24-rebase.md)).
- Haqiqiy hayotda bir xil commit'ni ikki marta "tasodifan" qayta yaratish deyarli imkonsiz — vaqt soniyagacha yoziladi. Bu qo'llanmada hash'lar takrorlanadi, chunki sinov muhitida sana qotirilgan.

## Kod: xabar — `-m`, `-F` va standart kirish

Ma'lumotnoma: `-m` va `-F` ni istalgan miqdorda va tartibda berish mumkin; har biri xabarning **alohida paragrafi** bo'ladi:

```bash
$ git commit-tree d8329f -m 'First commit'
35492cfd394c29c3ae03d9b527d8d8d9b1342749
$ git commit-tree d8329f -m 'Sarlavha' -m 'Birinchi paragraf.' -m 'Ikkinchi paragraf.' | xargs git cat-file -p
tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579
author Ali Valiyev <ali@example.com> 1791349200 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500

Sarlavha

Birinchi paragraf.

Ikkinchi paragraf.
$ printf 'Fayldan xabar\n\nTanasi\n' > ../16-xabar.txt
$ git commit-tree d8329f -F ../16-xabar.txt -m 'Oxirgi paragraf' | xargs git cat-file commit
tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579
author Ali Valiyev <ali@example.com> 1791349200 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500

Fayldan xabar

Tanasi

Oxirgi paragraf
```

Birinchi buyruq `echo ... |` bilan yasalgan `35492cf` ning o'zini berdi — `-m 'First commit'` ham xabar oxiriga `\n` qo'yadi. `-F -` standart kirishdan o'qiydi. Opsiyalar berilmasa, `commit-tree` standart kirishni kutadi — terminalda ishlatsangiz, `Ctrl-D` bosilguncha "osilib" turadi.

Standart kirishdan kelgan matn esa **o'zgartirilmaydi**, oxirgi `\n` ham qo'shilmaydi:

```bash
$ printf 'yangi qatorsiz' | git commit-tree d8329f | xargs git cat-file commit | tail -1 | xxd
00000000: 7961 6e67 6920 7161 746f 7273 697a       yangi qatorsiz
```

## Kod: `commit-tree` nimani tekshiradi

`<tree>` — mavjud **tree** obyekti bo'lishi shart, `-p` esa — **commit**:

```bash
$ git commit-tree 83baae6 -m x
fatal: 83baae61804e65cc73a7201a7252750c76066a30 is not a valid 'tree' object
$ git commit-tree bf3788a -m x
fatal: bf3788a9541a2b113176e9ada6d55ae10750d077 is not a valid 'tree' object
$ git commit-tree d8329f -p 0155eb4 -m x
fatal: 0155eb4229851634a0f03eb265b69f5a2d56f341 is not a valid 'commit' object
$ git commit-tree d8329f -p 1234567 -m x
fatal: not a valid object name 1234567
```

Ikkinchi qatorga qarang: commit'ni tree o'rniga bersangiz, `commit-tree` uni o'zi "ochmaydi". Commit'ning tree'si kerak bo'lsa, buni aniq yozing: `bf3788a^{tree}` ([19-bob](19-revision-tanlash.md)) — keyingi bo'limlarda shunday qilamiz.

Lekin **mazmun** bo'yicha hech narsa tekshirilmaydi: tree otaning tree'si bilan bir xil bo'lsa ham, xabar bo'sh bo'lsa ham commit yaratiladi:

```bash
$ git commit-tree d8329f </dev/null | xargs git cat-file -p
tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579
author Ali Valiyev <ali@example.com> 1791349200 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500

```

Bo'sh xabarli commit. Porcelain `git commit` buni rad etgan bo'lardi (`--allow-empty-message` siz). Bu farqlarga pastda qaytamiz.

## Kod: `git add` + `git commit` — faqat plumbing bilan

Endi bobning asosiy mashqi. Ikki yangi repo yaratamiz: birida oddiy porcelain buyruqlar bilan ikki commit qilamiz, ikkinchisida **aynan o'sha ishni** faqat plumbing bilan bajaramiz va har qadamda `.git` ichiga qaraymiz. Oxirida ikkala repo'ni bayt-baytigacha solishtiramiz.

### Namuna: porcelain

```bash
$ git init -q -b main 16-porcelain && cd 16-porcelain
$ echo 'salom' > salom.txt; mkdir src; echo 'print("salom")' > src/app.py
$ git add . && git commit -q -m "Birinchi commit"
$ echo 'xayr' >> salom.txt
$ git add salom.txt
$ GIT_AUTHOR_DATE=2026-10-07T10:05:00+05:00 GIT_COMMITTER_DATE=2026-10-07T10:05:00+05:00 git commit -q -m "Ikkinchi commit"
$ git log --oneline
dd9ddcf Ikkinchi commit
a9b1cc0 Birinchi commit
```

Shu ikki hash'ni eslab qoling: `a9b1cc0` va `dd9ddcf`.

### 0-qadam: bo'sh repo

```bash
$ git init -q -b main 16-plumbing && cd 16-plumbing
$ echo 'salom' > salom.txt; mkdir src; echo 'print("salom")' > src/app.py
$ find .git -type f -not -path '*/hooks/*' | sort
.git/HEAD
.git/config
.git/description
.git/info/exclude
```

`index` yo'q, `objects` ichida fayl yo'q, `refs/heads` bo'sh ([13-bob](13-plumbing-va-porcelain.md)).

### 1-qadam: blob'lar — `git hash-object -w`

```bash
$ git hash-object -w salom.txt
4de65895076ffaf8572ae06909fa475a10567eea
$ git hash-object -w src/app.py
ed7cda0dd5c6f0072845e92ef13f9d1ee47ef55e
$ find .git/objects -type f | sort
.git/objects/4d/e65895076ffaf8572ae06909fa475a10567eea
.git/objects/ed/7cda0dd5c6f0072845e92ef13f9d1ee47ef55e
```

Ikki blob ([14-bob](14-obyektlar-blob.md)). `4de6589` — 15-bobdagi `salom.txt` bilan bir xil hash: mazmun bir xil (`salom\n`), demak obyekt ham.

### 2-qadam: index — `git update-index`

```bash
$ git update-index --add --cacheinfo 100644,4de65895076ffaf8572ae06909fa475a10567eea,salom.txt
$ git update-index --add --cacheinfo 100644,ed7cda0dd5c6f0072845e92ef13f9d1ee47ef55e,src/app.py
$ git ls-files -s
100644 4de65895076ffaf8572ae06909fa475a10567eea 0	salom.txt
100644 ed7cda0dd5c6f0072845e92ef13f9d1ee47ef55e 0	src/app.py
$ ls .git
HEAD
config
description
hooks
index
info
objects
refs
$ git status --short
A  salom.txt
A  src/app.py
```

`.git/index` paydo bo'ldi. Index tekis: `src/app.py` — bitta yozuv, `src` papkasi alohida yo'q ([15-bob](15-tree-va-index.md)). Shu yergacha bu `git add .` ning plumbing'dagi aynan nusxasi.

### 3-qadam: tree'lar — `git write-tree`

```bash
$ git write-tree
d7f38bb09581a5b13ebe75e1bc5a2867ab63b506
$ find .git/objects -type f | sort
.git/objects/4d/e65895076ffaf8572ae06909fa475a10567eea
.git/objects/68/3af6235c971c2fc7afc803a156818d9c3acebd
.git/objects/d7/f38bb09581a5b13ebe75e1bc5a2867ab63b506
.git/objects/ed/7cda0dd5c6f0072845e92ef13f9d1ee47ef55e
$ git ls-tree -r -t d7f38bb
100644 blob 4de65895076ffaf8572ae06909fa475a10567eea	salom.txt
040000 tree 683af6235c971c2fc7afc803a156818d9c3acebd	src
100644 blob ed7cda0dd5c6f0072845e92ef13f9d1ee47ef55e	src/app.py
```

Bitta buyruq — **ikki** yangi obyekt: ildiz tree `d7f38bb` va `src/` uchun `683af62`. Tekis index ichma-ich tree'larga aylandi.

### 4-qadam: commit — `git commit-tree`

```bash
$ C=$(git commit-tree d7f38bb -m "Birinchi commit"); echo $C
a9b1cc08e15bd561580d85a9a8998c0e858640f7
$ ls .git/objects
4d
68
a9
d7
ed
info
pack
$ git status | head -3
On branch main

No commits yet
```

**`a9b1cc0`** — porcelain repo'dagi birinchi commit bilan **aynan bir xil hash**. Tree bir xil, muallif, commit qiluvchi, vaqt va xabar bir xil — demak obyekt bayt-baytigacha bir xil.

Lekin `status` hali "No commits yet" deydi: obyekt yozildi, ref yo'q.

### 5-qadam: branch'ni siljitish — `git update-ref`

Porcelain `git commit` oxirida `HEAD` ko'rsatgan branch'ni yangi commit'ga suradi va reflog'ga sabab yozadi. Biz ham shunday qilamiz:

```bash
$ git update-ref -m "commit (initial): Birinchi commit" HEAD $C ''
$ find .git -type f -not -path '*/hooks/*' -not -path '*/objects/*' | sort
.git/HEAD
.git/config
.git/description
.git/index
.git/info/exclude
.git/logs/HEAD
.git/logs/refs/heads/main
.git/refs/heads/main
$ cat .git/HEAD .git/refs/heads/main
ref: refs/heads/main
a9b1cc08e15bd561580d85a9a8998c0e858640f7
$ cat .git/logs/HEAD
0000000000000000000000000000000000000000 a9b1cc08e15bd561580d85a9a8998c0e858640f7 Ali Valiyev <ali@example.com> 1791349200 +0500	commit (initial): Birinchi commit
$ git status
On branch main
nothing to commit, working tree clean
```

Uchta narsa:

- Biz `refs/heads/main` emas, **`HEAD`** ni berdik. `update-ref` `HEAD` symref'i orqali o'tib, `refs/heads/main` faylini yozdi — `HEAD` faylining o'zi o'zgarmadi (`ref: refs/heads/main`). Porcelain `commit` ham aynan shunday ishlaydi ([17-bob](17-reflar-va-head.md)).
- Uchinchi argument `''` — "bu ref hali **yo'q** bo'lishi shart". Birinchi commit uchun to'g'ri shart.
- Ikkita reflog yozildi: `logs/HEAD` va `logs/refs/heads/main`. `-m` dagi matn — porcelain yozadigan sabab bilan bir xil.

### Ikkinchi commit: otasi bilan

```bash
$ export GIT_AUTHOR_DATE=2026-10-07T10:05:00+05:00 GIT_COMMITTER_DATE=2026-10-07T10:05:00+05:00
$ echo 'xayr' >> salom.txt
$ git status --short
 M salom.txt
$ git update-index salom.txt
$ git ls-files -s
100644 7bc7d2a6a1d20bbb6eb2f3038c44402886bfc7c8 0	salom.txt
100644 ed7cda0dd5c6f0072845e92ef13f9d1ee47ef55e 0	src/app.py
$ T=$(git write-tree); echo $T
2ed8e581cd8bfb83c81d56f824ef43ff34b70e69
$ P=$(git rev-parse HEAD); echo $P
a9b1cc08e15bd561580d85a9a8998c0e858640f7
$ C=$(git commit-tree $T -p $P -m "Ikkinchi commit"); echo $C
dd9ddcf9dc1cba2fc64da4c5a300fcfe4b84dcd4
$ git update-ref -m "commit: Ikkinchi commit" HEAD $C $P
$ unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE
$ git log --oneline
dd9ddcf Ikkinchi commit
a9b1cc0 Birinchi commit
```

Bu safar:

- `update-index salom.txt` (`--cacheinfo` siz) faylni o'zi o'qib blob yozdi — `hash-object -w` ni alohida chaqirmadik ([15-bob](15-tree-va-index.md)).
- `write-tree` ildiz tree'ni qayta yasadi, lekin `src/` tree'si (`683af62`) **o'zgarmadi** va qayta ishlatildi — bu safar faqat bitta yangi tree.
- Ota — `HEAD` ning hozirgi qiymati. Porcelain `commit` ham otani aynan shu yerdan oladi.
- `update-ref` ga uchinchi argument sifatida **eski** qiymat — otaning hash'i — berildi: "faqat `main` hali `a9b1cc0` da bo'lsa sur". Shu orada boshqa jarayon `main` ni surgan bo'lsa, o'zgarish rad etiladi.

### Solishtirish

```bash
$ find .git/objects -type f | sort | wc -l
       8
$ diff <(cd ../16-porcelain && find .git/objects -type f | sort) <(find .git/objects -type f | sort) && echo bir xil
bir xil
$ diff ../16-porcelain/.git/logs/HEAD .git/logs/HEAD && echo reflog bir xil
reflog bir xil
$ diff <(cd ../16-porcelain && find .git -type f -not -path '*/hooks/*' | sort) <(find .git -type f -not -path '*/hooks/*' | sort)
1d0
< .git/COMMIT_EDITMSG
```

Sakkizta obyekt (2 commit, 3 tree, 3 blob), hash'lar, reflog — **hammasi bir xil**. Yagona farq — `COMMIT_EDITMSG`: porcelain xabarni muharrirga ochish uchun shu faylga yozadi.

Pro Git xulosasi endi to'liq tushunarli: `git add` va `git commit` qilganingizda Git o'zgargan fayllar uchun blob'lar yozadi, index'ni yangilaydi, tree'larni yozadi va ildiz tree hamda oldingi commit'ga ishora qiluvchi commit obyektini yozadi.

```text
git add <fayl>   =  git hash-object -w <fayl>                 → .git/objects/ (blob)
                    git update-index --add <fayl>             → .git/index
git commit -m X  =  T=$(git write-tree)                       → .git/objects/ (tree'lar)
                    P=$(git rev-parse HEAD)
                    C=$(git commit-tree $T -p $P -m X)        → .git/objects/ (commit)
                    git update-ref -m "commit: X" HEAD $C $P  → .git/refs/heads/main, .git/logs/
```

### Porcelain yana nima qiladi

Natija bir xil bo'lsa ham, `git commit` bizning beshta buyrug'imizdan ko'proq ish qiladi. Ikkitasini sinab ko'ramiz.

**"Nothing to commit" tekshiruvi.** Index o'zgarmagan bo'lsa, porcelain rad etadi, `commit-tree` esa yo'q:

```bash
$ git commit -m "Bo'sh"
On branch main
nothing to commit, working tree clean
$ echo "exit=$?"
exit=1
$ E=$(git commit-tree HEAD^{tree} -p HEAD -m "Bo'sh"); echo $E
d93198b5b25b95199ce97b49bf57e7ba7ef7927a
$ git diff --stat HEAD $E
$
```

Tree otaniki bilan bir xil — "bo'sh" commit yaratildi (porcelain'da bu `--allow-empty`).

**Xabarni tozalash.** Porcelain xabardan izoh qatorlarini (`#`), qator oxiridagi bo'sh joylarni va ortiqcha bo'sh qatorlarni olib tashlaydi (`commit.cleanup` sozlamasi, [10-bob](10-yaxshi-commit.md)). `commit-tree` matnni qanday bo'lsa shunday yozadi. Har qator oxiriga `$` qo'yib ko'ramiz:

```bash
$ printf 'Sarlavha   \n\n\n\nTana\n# izoh qatori\n\n\n' > ../16-iflos.txt
$ git commit-tree HEAD^{tree} -p HEAD -F ../16-iflos.txt | xargs git cat-file commit | sed -n '5,$p' | sed 's/$/$/'
$
Sarlavha   $
$
$
$
Tana$
# izoh qatori$
$
$
$ git stripspace --strip-comments < ../16-iflos.txt | sed 's/$/$/'
Sarlavha$
$
Tana$
```

`git stripspace` — porcelain ishlatadigan tozalashning plumbing ko'rinishi. Plumbing bilan commit yasaydigan skript yozsangiz, xabarni avval undan o'tkazing.

To'liq ro'yxat:

| `git commit` qiladi | Plumbing'da |
| --- | --- |
| Index'ni yangilaydi (`-a`, yo'l bilan commit) | `update-index` o'zingiz |
| O'zgarish yo'q bo'lsa rad etadi | Tekshiruv yo'q |
| Bo'sh xabarni rad etadi | Tekshiruv yo'q |
| Xabarni tozalaydi | `git stripspace` |
| `pre-commit`, `prepare-commit-msg`, `commit-msg`, `post-commit` hook'larini ishga tushiradi ([47-bob](47-hooklar.md)) | Hook'lar ishlamaydi |
| `MERGE_HEAD` bo'lsa ikkinchi ota qo'shadi, merge holatini tozalaydi ([22-bob](22-konfliktlar.md)) | `-p` ni o'zingiz berasiz |
| `commit.gpgSign` bo'lsa imzolaydi | `-S` ni o'zingiz berasiz |
| `COMMIT_EDITMSG` yozadi, muharrir ochadi | Yo'q |
| Natijani chiqaradi (`[main dd9ddcf] ...`) | Faqat hash |

## Kod: muallif va commit qiluvchi

[9-bobda](09-tarixni-korish.md) `--format=fuller` bilan ko'rgan edik: commit'da ikki odam va ikki sana bor. Pro Git ta'rifi: **muallif** (author) — ishni dastlab yozgan odam; **commit qiluvchi** (committer) — ishni oxirgi marta qo'llagan odam. Endi bu ikki qator obyekt ichida qanday paydo bo'lishini ko'ramiz.

Porcelain repo nusxasida Vali boshqa shahardan — boshqa vaqt zonasidan — o'z branch'ida ishlaydi:

```bash
$ cp -r 16-porcelain 16-muallif && cd 16-muallif
$ git switch -q -c vali HEAD~1
$ echo 'Vali yozdi' > README
$ git add README
$ GIT_AUTHOR_NAME='Vali Aliyev' GIT_AUTHOR_EMAIL=vali@example.com GIT_AUTHOR_DATE='2026-10-06T18:30:00+03:00' \
  GIT_COMMITTER_NAME='Vali Aliyev' GIT_COMMITTER_EMAIL=vali@example.com GIT_COMMITTER_DATE='2026-10-06T18:30:00+03:00' \
  git commit -q -m "README qo'shildi"
$ git cat-file -p HEAD
tree 6d9ebd48a987489eb38b567ca01b8e416db6a9b8
parent a9b1cc08e15bd561580d85a9a8998c0e858640f7
author Vali Aliyev <vali@example.com> 1791300600 +0300
committer Vali Aliyev <vali@example.com> 1791300600 +0300

README qo'shildi
```

### Vaqt qanday yoziladi

`1791300600 +0300` — ikki qism:

- `1791300600` — **UNIX vaqti**: 1970-yil 1-yanvar 00:00 UTC dan beri o'tgan soniyalar. Bu qiymat dunyoning hamma joyida bir xil — "aynan qaysi lahza".
- `+0300` — muallifning **mahalliy vaqt zonasi** UTC ga nisbatan. U lahzani o'zgartirmaydi, faqat "o'sha odam soatida necha edi"ni ko'rsatish uchun saqlanadi.

```bash
$ date -u -r 1791300600
Tue Oct  6 15:30:00 UTC 2026
```

UTC bo'yicha 15:30, Vali'ning soatida (+3) 18:30. `git log` sanani standart holatda muallifning o'z zonasida ko'rsatadi.

Muhit o'zgaruvchilari (`GIT_AUTHOR_DATE`, `GIT_COMMITTER_DATE`) turli formatlarni qabul qiladi (`date-formats` bo'limi, `commit-tree` ma'lumotnomasida): Git'ning ichki formati `<unix-vaqt> <zona>` (xavfsizroq yozuvi `@1791300600 +0300`), RFC 2822 (`Thu, 07 Apr 2005 22:13:13 +0200`) va ISO 8601 (`2005-04-07T22:13:13`, biz ishlatayotgan shakl). `git commit --date` bundan tashqari "yesterday" kabi odamona ifodalarni ham tushunadi.

### Ikki odam farq qilganda

Ali Vali'ning commit'ini `main` dan ochilgan `nusxa` branch'iga `cherry-pick` qiladi — ya'ni Vali'ning o'zgarishini o'z branch'ida **qayta qo'llaydi** ([34-bob](34-loyihani-yuritish.md)):

```bash
$ git switch -q -c nusxa main
$ GIT_COMMITTER_DATE=2026-10-07T10:20:00+05:00 git cherry-pick vali
[nusxa d88c7ad] README qo'shildi
 Author: Vali Aliyev <vali@example.com>
 Date: Tue Oct 6 18:30:00 2026 +0300
 1 file changed, 1 insertion(+)
 create mode 100644 README
$ git log --format=fuller -1
commit d88c7adfc0aba620ccdccf20f005560c9526caa4
Author:     Vali Aliyev <vali@example.com>
AuthorDate: Tue Oct 6 18:30:00 2026 +0300
Commit:     Ali Valiyev <ali@example.com>
CommitDate: Wed Oct 7 10:20:00 2026 +0500

    README qo'shildi
```

Muallif va uning sanasi Vali'niki bo'lib **qoldi**, commit qiluvchi — Ali, yangi vaqt bilan. `cherry-pick` chiqishi ham buni alohida ta'kidlaydi (`Author:` qatori — muallif sizdan farq qilgani uchun). Yangi hash — `d88c7ad`: ota boshqa, commit qiluvchi boshqa.

Qaysi buyruq qaysi maydonni o'zgartiradi:

| Buyruq | `author` | `committer` |
| --- | --- | --- |
| `git commit` | siz, hozir | siz, hozir |
| `git commit --amend` | **saqlanadi** | siz, hozir ([11-bob](11-bekor-qilish.md)) |
| `git commit --amend --reset-author` | siz, hozir | siz, hozir |
| `git commit --author="..."` | berilgan odam (sana — hozir) | siz, hozir ([2-bob](02-terminal-va-ornatish.md)) |
| `git rebase`, `git cherry-pick` | **saqlanadi** | siz, hozir ([24-bob](24-rebase.md)) |
| `git rebase --reset-author-date` | sana hozirgi vaqtga | siz, hozir |
| `git rebase --committer-date-is-author-date` | saqlanadi | sana muallif sanasiga teng |
| `git am` (email'dan patch) | patch muallifi | siz, hozir ([33-bob](33-hissa-qoshish.md)) |

Ikki maydon nega kerak? Patch'lar email orqali yuriladigan loyihalarda (Linux yadrosi, Git'ning o'zi) o'zgarishni bir odam yozadi, uni boshqa odam — maintainer — tekshirib, qo'llaydi. Ikkalasining ham hissasi tarixda qolishi kerak. GitHub'dagi "Rebase and merge" ham committer'ni o'zgartiradi ([36-bob](36-github-boshqaruv.md)).

`rebase` ma'lumotnomasi `--committer-date-is-author-date` haqida ogohlantiradi: tarixni aylanib chiqadigan mexanizm commit qiluvchi vaqtlari **kamaymaydi** deb taxmin qiladi. Sanalarni sun'iy ravishda orqaga sursangiz, `log` tartibi va ba'zi optimallashtirishlar g'alati ishlashi mumkin.

## Kod: merge commit — ikki ota

Ma'lumotnoma: commit'ning istalgan miqdorda otasi bo'lishi mumkin. Bitta — oddiy commit; bittadan ko'p — bir nechta tarix chizig'ini birlashtiruvchi **merge commit**; nol — ildiz commit. Merge'ni plumbing bilan yasaymiz. Hozirgi graf:

```bash
$ git switch -q main
$ git log --oneline --graph main vali
* dd9ddcf Ikkinchi commit
| * 178fa62 README qo'shildi
|/  
* a9b1cc0 Birinchi commit
```

Avval ikki tomonni birlashtirgan tree kerak. Uni `git merge-tree --write-tree` yasaydi — u ham plumbing, index va working tree'ga tegmaydi ([21-bob](21-branch-va-merge.md)):

```bash
$ T=$(git merge-tree --write-tree main vali); echo $T
197c03341c01be4275b411a80930a44739e0fb75
$ git ls-tree $T
100644 blob 394f246b5dfd39868e8d1c8a80c32627e3962302	README
100644 blob 7bc7d2a6a1d20bbb6eb2f3038c44402886bfc7c8	salom.txt
040000 tree 683af6235c971c2fc7afc803a156818d9c3acebd	src
```

Vali'ning `README`'si va `main` dagi `salom.txt` ning ikkinchi versiyasi — ikkalasi bir tree'da. Endi ikki `-p` bilan commit:

```bash
$ M=$(GIT_AUTHOR_DATE=2026-10-07T10:15:00+05:00 GIT_COMMITTER_DATE=2026-10-07T10:15:00+05:00 \
      git commit-tree $T -p main -p vali -m "Merge branch 'vali'"); echo $M
1829afc908ccb245e0694e7c9d54067065e9c9fe
$ git cat-file -p $M
tree 197c03341c01be4275b411a80930a44739e0fb75
parent dd9ddcf9dc1cba2fc64da4c5a300fcfe4b84dcd4
parent 178fa62b26aef0127d6d7d9943fd5cc8cbd9d94a
author Ali Valiyev <ali@example.com> 1791350100 +0500
committer Ali Valiyev <ali@example.com> 1791350100 +0500

Merge branch 'vali'
$ git update-ref -m "merge vali: plumbing" refs/heads/main $M dd9ddcf9dc1cba2fc64da4c5a300fcfe4b84dcd4
$ git log --oneline --graph
*   1829afc Merge branch 'vali'
|\  
| * 178fa62 README qo'shildi
* | dd9ddcf Ikkinchi commit
|/  
* a9b1cc0 Birinchi commit
```

Merge commit — oddiy commit, faqat ikkita `parent` qatori bor. **Tartib muhim**: birinchi ota — merge qilingan paytdagi joriy branch (`main`), ikkinchisi — qo'shilgan branch. `main^1` va `main^2` shu tartibga tayanadi, `git log --first-parent` ham ([19-bob](19-revision-tanlash.md)):

```bash
$ git log --format='%h %p  %s' main
1829afc dd9ddcf 178fa62  Merge branch 'vali'
dd9ddcf a9b1cc0  Ikkinchi commit
a9b1cc0   Birinchi commit
178fa62 a9b1cc0  README qo'shildi
$ git rev-parse main^1 main^2
dd9ddcf9dc1cba2fc64da4c5a300fcfe4b84dcd4
178fa62b26aef0127d6d7d9943fd5cc8cbd9d94a
```

`%p` — ota(lar)ning qisqa hash'i.

### Plumbing branch'ni surdi — lekin fayllarni emas

```bash
$ git status --short
D  README
$ ls
salom.txt
src
```

`update-ref` faqat ref faylini o'zgartirdi. Index va working tree hali eski `dd9ddcf` holatida, `HEAD` esa yangi tree'ga qaraydi — shuning uchun `status` "README o'chirilgan" deb ko'rsatyapti (17-bobdagi `symbolic-ref` misoli bilan bir xil holat). Index va diskni yangi commit'ga moslash uchun 15-bobdagi `read-tree` ning `-m -u` shakli — "eski tree'dan yangisiga o'tish":

```bash
$ git read-tree -u -m dd9ddcf 1829afc
$ git status --short
$ ls
README
salom.txt
src
$ cat README
Vali yozdi
```

Porcelain `git merge` bularning hammasini — merge tree'ni hisoblash, commit yozish, ref'ni surish, index va working tree'ni yangilash, konfliktlarni ko'rsatish — bitta buyruqda bajaradi.

## Kod: qo'shimcha sarlavha qatorlari

Majburiy maydonlardan tashqari commit'da ixtiyoriy sarlavhalar ham uchraydi:

| Sarlavha | Qachon paydo bo'ladi |
| --- | --- |
| `encoding` | Xabar UTF-8 da emas va `i18n.commitEncoding` o'rnatilgan |
| `gpgsig`, `gpgsig-sha256` | Commit imzolangan ([44-bob](44-imzolash.md)) |
| `mergetag` | Imzolangan teg merge qilinganda teg obyekti shu yerga ko'chiriladi |

`encoding` ni ko'ramiz:

```bash
$ git -c i18n.commitEncoding=ISO-8859-1 commit-tree HEAD^{tree} -m 'x' | xargs git cat-file -p
tree 197c03341c01be4275b411a80930a44739e0fb75
author Ali Valiyev <ali@example.com> 1791349200 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500
encoding ISO-8859-1

x
```

Ma'lumotnomaning `i18n` bo'limiga ko'ra Git xabar kodlashiga qat'iy talab qo'ymaydi, lekin UTF-8 ni tavsiya qiladi: `encoding` sarlavhasi yo'qligi "UTF-8" degani, `git log` esa boshqa kodlashdagi xabarni ko'rsatishdan oldin UTF-8 ga o'giradi. O'zbekcha `o'`, `g'` belgilari (va boshqa har qanday matn) uchun hech narsa sozlash shart emas — standart UTF-8 yetarli. Fayl **mazmuni** (blob) esa umuman kodlanmaydi — Git uni bayt ketma-ketligi sifatida saqlaydi.

## Muhandislik nuqtai nazari: commit'ni bilish nima beradi

**Commit arzon.** `gitdatamodel` misoli: 1000 faylli repo'da 2 ta fayl o'zgargan commit 2 ta yangi blob yaratadi, qolgan 998 tasi uchun eski blob hash'lari qayta ishlatiladi. Bunga o'zgargan yo'llar bo'ylab bir nechta tree va bitta commit (bir necha yuz bayt) qo'shiladi. Shuning uchun tez-tez, kichik commit qilish diskka zarar qilmaydi ([10-bob](10-yaxshi-commit.md)).

**Hash — tarixning shartnomasi.** Ikki repo'da bir xil hash'li commit bo'lsa, ularning **butun** tarixi shu nuqtagacha bir xil — bitta ham baytini solishtirmasdan. `fetch` va `push` aynan shunga tayanadi: "sizda `dd9ddcf` bormi?" degan bitta savol butun zanjir haqida javob beradi ([29-bob](29-fetch-push-ichidan.md)).

**Tarixni o'zgartirish = yangi commit'lar.** `amend`, `rebase`, `filter-repo` hech qachon commit'ni "tahrirlamaydi" — ular yangi obyektlar yasaydi va ref'ni ularga suradi. Eski commit'lar omborda qoladi va reflog orqali topiladi ([42-bob](42-reflog-va-tiklash.md)), keyin `gc` ularni tozalaydi ([18-bob](18-packfile-va-gc.md)). Boshqalar bilan bo'lishilgan commit'larni qayta yozish nega xavfli — endi aniq: ularning repo'sidagi hash'lar sizning yangi hash'laringizdan farq qiladi ([24-bob](24-rebase.md)).

**Plumbing bilan commit — qachon kerak.** Kundalik ishda hech qachon. Lekin vositalar yozganda foydali: working tree'ga tegmasdan boshqa branch'ga commit qilish (vaqtincha `GIT_INDEX_FILE` + `write-tree` + `commit-tree` + `update-ref`, [15-bob](15-tree-va-index.md)), avtomatik generatsiya qilingan sayt fayllarini alohida branch'ga yozish, tarixni boshqa tizimdan import qilish. Bunday skriptda:

- otani `git rev-parse --verify HEAD` bilan oling;
- `update-ref` ga **eski qiymatni** bering — parallel o'zgarishni yo'qotmaslik uchun;
- `-m` bilan reflog sababini yozing;
- xabarni `git stripspace` dan o'tkazing;
- index va working tree'ni yangilash kerakmi — o'zingiz hal qiling (`read-tree -u -m`).

**Ikki sana — ikki vazifa.** `git log` standart holatda **commit qiluvchi** sanasi bo'yicha tartiblaydi (`--date-order`, `--author-date-order` bilan o'zgartiriladi, [9-bob](09-tarixni-korish.md)), `--since`/`--until` ham commit qiluvchi sanasiga qaraydi. Muallif sanasi esa "ish qachon yozilgani" haqida. Rebase qilingan branch'da ular farq qilishi — normal holat.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Commit diff saqlaydi deb o'ylash | Commit — to'liq surat; diff har safar ota bilan solishtirib hisoblanadi | `git cat-file -p <commit>` ga qarang: faqat `tree` bor |
| `commit-tree` dan keyin `git log` ishlamasligidan hayron bo'lish | Obyekt yozildi, lekin hech qaysi ref unga ishora qilmaydi | `git update-ref HEAD <yangi> <eski>` |
| `commit-tree` ga commit hash'ini tree o'rniga berish | `is not a valid 'tree' object` | `<commit>^{tree}` |
| Amend qilingan commit "o'sha commit" deb hisoblash | Yangi hash, eski commit alohida obyekt; push qilingan bo'lsa tarix ajraladi | Push qilinmagan commit'nigina amend qiling ([11-bob](11-bekor-qilish.md)) |
| Merge commit'da ota tartibini e'tiborsiz qoldirish | `^1`/`^2`, `--first-parent`, `revert -m` tartibga bog'liq | Birinchi ota — joriy branch ([26-bob](26-murakkab-merge.md)) |
| Plumbing skriptida `update-ref` ni eski qiymatsiz chaqirish | Parallel commit jimgina yo'qoladi | Uchinchi argument — kutilgan eski hash |
| `update-ref` dan keyin fayllar o'zgaradi deb kutish | Ref surildi, index va working tree eski holatda; `status` chalkash | `git read-tree -u -m <eski> <yangi>` yoki porcelain buyruq |
| Muallif va commit qiluvchini bir narsa deb hisoblash | `rebase`, `cherry-pick`, `am` dan keyin ular farq qiladi | `git log --format=fuller` |
| Vaqt zonasi commit'ni "boshqa vaqtga" suradi deb o'ylash | UNIX vaqti — mutlaq lahza, zona faqat ko'rsatish uchun | `date -u -r <soniya>` bilan tekshiring |
| `commit-tree` xabarni tozalaydi deb kutish | Izohlar va bo'sh joylar xabarda qoladi | `git stripspace --strip-comments` |

## Amaliyot

1. 15-bobdagi repo'da uchta tree'dan `commit-tree` bilan uchta commit'li zanjir yasang. `git log --stat <oxirgi>` ishlashini, lekin `git log` (argumentsiz) ishlamasligini ko'rsating. `git fsck` qaysi commit'ni `dangling` deydi va nega faqat bittasini?
2. Commit obyektini Python `zlib` bilan oching. Sarlavhadagi hajmni `git cat-file -s` bilan, hash'ni `hashlib.sha1` bilan tekshiring. Ota qo'shilganda hajm necha baytga oshadi?
3. Bir xil tree va xabar bilan ikki marta `commit-tree` chaqiring — bir xil hash chiqadimi? Endi `GIT_COMMITTER_DATE` ni bir soniyaga o'zgartiring. Qaysi maydonlar hash'ga ta'sir qilishini ro'yxat qiling.
4. Yangi repo'da ikkita commit'ni oldin porcelain bilan, keyin boshqa repo'da faqat `hash-object -w`, `update-index`, `write-tree`, `commit-tree`, `update-ref` bilan bajaring. Har qadamdan keyin `find .git -type f -not -path '*/hooks/*'` qiling. Ikki repo'ning `.git/objects` va `.git/logs/HEAD` i bir xil chiqishi uchun nima kerak?
5. `GIT_AUTHOR_*` va `GIT_COMMITTER_*` ni turli qiymatlarga qo'yib commit qiling, keyin uni `cherry-pick` va `commit --amend` qiling. Har safar `git log --format=fuller` da qaysi maydon o'zgarganini jadvalga yozing.
6. Ikki branch yarating, `git merge-tree --write-tree` va ikki `-p` bilan merge commit yasang. `-p` tartibini almashtirsangiz, `git log --first-parent` nima ko'rsatadi?
7. `update-ref` bilan branch'ni yangi commit'ga suring va `git status` ni kuzating. `git read-tree -u -m` bilan index va working tree'ni moslang.
8. (Qiyinroq) `git-plumbing-commit` skriptini yozing: u `git commit -m <xabar>` ning o'rnini bossin — xabarni `stripspace` dan o'tkazsin, index o'zgarmagan bo'lsa rad etsin (`git diff-index --cached --quiet HEAD`), birinchi commit holatini (`HEAD` yo'q) to'g'ri ishlasin, `update-ref` ga eski qiymat va `commit:`/`commit (initial):` sababini bersin. Natijani `git commit` bilan yasalgan repo bilan hash bo'yicha solishtiring.

## Rasmiy hujjat

- Pro Git — Git Objects (Commit Objects): <https://git-scm.com/book/en/v2/Git-Internals-Git-Objects>
- Pro Git — Viewing the Commit History (muallif va commit qiluvchi): <https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History>
- `git commit-tree`: <https://git-scm.com/docs/git-commit-tree>
- `gitdatamodel` — commit obyekti: <https://git-scm.com/docs/gitdatamodel>
- `git update-ref`: <https://git-scm.com/docs/git-update-ref>
- `git hash-object`: <https://git-scm.com/docs/git-hash-object>
- `git merge-tree`: <https://git-scm.com/docs/git-merge-tree>
- `git stripspace`: <https://git-scm.com/docs/git-stripspace>
- `git rebase` — `--committer-date-is-author-date`: <https://git-scm.com/docs/git-rebase>
- `git config` — `i18n.commitEncoding`: <https://git-scm.com/docs/git-config>
