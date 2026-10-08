# 42 — `reflog` va ma'lumotni tiklash

[← Oldingi: `blame` va `bisect`](41-blame-va-bisect.md) · [Mundarija](README.md) · [Keyingi: Submodule, `bundle` va `replace` →](43-submodule-bundle-replace.md)

## Tushuncha

Git bilan ishlaganda vaqti-vaqti bilan "commit'larim yo'qoldi" degan holat bo'ladi. Odatda sabab ikkitadan biri:

- ish bor branch'ni majburan o'chirib yubordingiz (`git branch -D`), keyin u kerak bo'lib qoldi;
- branch'ni `git reset --hard` bilan orqaga surdingiz va ba'zi commit'lar "tashlab ketildi".

Yaxshi xabar: deyarli har doim **hech narsa yo'qolmagan**. Git obyektlarni darhol o'chirmaydi ([18-bob](18-packfile-va-gc.md)) — commit obyekti `.git/objects` da turibdi, faqat endi unga hech qanday branch ko'rsatmaydi. Muammo — uning hash'ini topish. Buning uchun ikki asbob bor:

1. **reflog** — "ref'lar jurnali": `HEAD` va har bir branch qachon, qaysi commit'dan qaysi commit'ga ko'chganini yozib boradigan lokal tarix. Uni terminaldagi buyruqlar tarixiga (shell history) o'xshatish mumkin: siz qilgan har bir harakat yozib qo'yiladi.
2. **`git fsck`** — obyektlar bazasining butunligini tekshiradigan buyruq. U yon mahsulot sifatida hech qayerdan ko'rsatilmagan ("osilib qolgan", **dangling**) obyektlarni ham topadi. Reflog ham yo'q bo'lganda — oxirgi chora.

Bob oxirida teskari vazifa ham bor: tarixga tasodifan qo'shilgan **katta faylni butunlay olib tashlash**. Bu yerda muammo aksincha — Git obyektlarni shunchalik qattiq saqlaydiki, ularni o'chirish uchun ataylab bir necha qadam qilish kerak.

```text
"Yo'qolgan" commit qayerda bo'lishi mumkin:

  ref'lar (refs/heads, refs/tags...)  ──►  ko'rinadigan tarix
          │
  reflog (.git/logs/...)              ──►  git reflog, HEAD@{n}
          │
  obyektlar bazasi (.git/objects)     ──►  git fsck --lost-found
          │
  gc + muddat o'tgan                  ──►  endi haqiqatan yo'q
```

## Nega shunday: Git nega o'chirishga shoshilmaydi

Pro Git'ning birinchi bobidagi qoida: **Git asosan faqat qo'shadi**. `commit --amend`, `rebase`, `reset` — bularning hech biri eski commit'ni o'zgartirmaydi yoki o'chirmaydi, ular yangi commit yaratadi yoki ref'ni boshqa joyga suradi ([17-bob](17-reflar-va-head.md)). Eski obyekt bazada qoladi.

Uni nima o'chiradi? Faqat `git gc` (va uning ichidagi `git prune`). `git gc` ma'lumotnomasining NOTES bo'limi aytadi: gc obyektni o'chirmaydi, agar unga **branch'lar, teglar, index, remote-tracking branch'lar, reflog'lar** yoki `refs/*` dagi boshqa narsa ko'rsatsa. Reflog shu ro'yxatda — demak reflog'da yozuv turgan ekan, commit gc'dan omon qoladi.

Reflog yozuvlarining ham umri bor (`gc.reflogExpire`, standart 90 kun; yetib bo'lmaydigan yozuvlar uchun `gc.reflogExpireUnreachable`, standart 30 kun). Undan keyin ham ref'siz obyektga `gc.pruneExpire` (standart "2 hafta") muhlat beriladi. Shu sababli amalda xato qilganingizdan keyin **bir necha hafta** tiklash imkoni bor.

## Kod: reflog nima yozadi

Sinov repo'si: besh commit, keyin oxirgi ikkitasini `reset --hard` bilan "yo'qotamiz".

```bash
$ git log --pretty=oneline
d38d46b300472c1d6714b5a24ec7d1087c935b0a qidir.py biroz o'zgardi
d46b4d72f6451ea5c501e85e9795583a5e7bcc92 qidir.py yaratildi
c2fd5b1aebcf855d0500fe8ed09872bf746f7c21 Uchinchi commit
02e88f33856ccac848b2465e61492450a54039ff Ikkinchi commit
6aa48d5dc810ecdf9a7ea41f10fe66019e75204a Birinchi commit

$ git reset --hard HEAD~2
HEAD is now at c2fd5b1 Uchinchi commit

$ git log --pretty=oneline
c2fd5b1aebcf855d0500fe8ed09872bf746f7c21 Uchinchi commit
02e88f33856ccac848b2465e61492450a54039ff Ikkinchi commit
6aa48d5dc810ecdf9a7ea41f10fe66019e75204a Birinchi commit
```

`d46b4d7` va `d38d46b` endi `git log` da ko'rinmaydi — ularga hech qanday branch ko'rsatmaydi. Lekin reflog ularni eslab qolgan:

```bash
$ git reflog
c2fd5b1 HEAD@{0}: reset: moving to HEAD~2
d38d46b HEAD@{1}: commit: qidir.py biroz o'zgardi
d46b4d7 HEAD@{2}: commit: qidir.py yaratildi
c2fd5b1 HEAD@{3}: commit: Uchinchi commit
02e88f3 HEAD@{4}: commit: Ikkinchi commit
6aa48d5 HEAD@{5}: commit (initial): Birinchi commit
```

Har qator: o'sha paytda `HEAD` ko'rsatgan commit, yozuv nomi (`HEAD@{n}`) va **sabab** — qaysi buyruq ref'ni o'zgartirdi. Eng yangisi tepada: `HEAD@{0}` — hozirgi holat, `HEAD@{1}` — bir qadam oldingi va hokazo.

Argumentsiz `git reflog` — bu `git reflog show HEAD`. Ma'lumotnomaga ko'ra `git reflog show` aslida `git log -g --abbrev-commit --pretty=oneline` ning taxallusi. Shuning uchun `git log` ning to'liq formatini ham olish mumkin:

```bash
$ git log -g -2
commit c2fd5b1aebcf855d0500fe8ed09872bf746f7c21
Reflog: HEAD@{0} (Ali Valiyev <ali@example.com>)
Reflog message: reset: moving to HEAD~2
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:10:00 2026 +0500

    Uchinchi commit

commit d38d46b300472c1d6714b5a24ec7d1087c935b0a
Reflog: HEAD@{1} (Ali Valiyev <ali@example.com>)
Reflog message: commit: qidir.py biroz o'zgardi
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:20:00 2026 +0500

    qidir.py biroz o'zgardi
```

`-g` (`--walk-reflogs`) — "ota-ona zanjiri bo'yicha emas, reflog yozuvlari bo'yicha yur" degani.

### Reflog diskda qanday saqlanadi

Odatiy (`files`) ref formatida reflog — oddiy matn fayllari, `.git/logs/` ichida, har ref uchun alohida:

```bash
$ ls -R .git/logs
HEAD
refs

.git/logs/refs:
heads

.git/logs/refs/heads:
main

$ cat .git/logs/HEAD
0000000000000000000000000000000000000000 6aa48d5dc810ecdf9a7ea41f10fe66019e75204a Ali Valiyev <ali@example.com> 1791349200 +0500	commit (initial): Birinchi commit
6aa48d5dc810ecdf9a7ea41f10fe66019e75204a 02e88f33856ccac848b2465e61492450a54039ff Ali Valiyev <ali@example.com> 1791349500 +0500	commit: Ikkinchi commit
...
d46b4d72f6451ea5c501e85e9795583a5e7bcc92 d38d46b300472c1d6714b5a24ec7d1087c935b0a Ali Valiyev <ali@example.com> 1791350400 +0500	commit: qidir.py biroz o'zgardi
d38d46b300472c1d6714b5a24ec7d1087c935b0a c2fd5b1aebcf855d0500fe8ed09872bf746f7c21 Ali Valiyev <ali@example.com> 1791350700 +0500	reset: moving to HEAD~2
```

Har qatorda: **eski hash**, **yangi hash**, kim, Unix vaqti va vaqt zonasi, tab, sabab. Birinchi commit'da eski qiymat — nollar (ref oldin yo'q edi). Fayl faqat oxiriga qo'shiladi; `git reflog` uni teskari tartibda ko'rsatadi.

Kim yozadi? `core.logAllRefUpdates` sozlamasi. Ma'lumotnomaga ko'ra u working tree bor repo'da standart bo'yicha `true` (`refs/heads/`, `refs/remotes/`, `refs/notes/` va `HEAD` uchun jurnal avtomatik yaratiladi), **bare repo'da esa `false`**. Shuning uchun serverdagi bare repo'da odatda reflog yo'q.

Pro Git eslatadi: ref'ni qo'lda `echo hash > .git/refs/heads/main` bilan yozsangiz reflog yangilanmaydi, `git update-ref` esa yangilaydi — plumbing darajasida ham `update-ref` ishlatishning sabablaridan biri shu ([17-bob](17-reflar-va-head.md)).

> **Reftable formatida.** Git 3.0 da standart bo'ladigan `reftable` formatida ([17-bob](17-reflar-va-head.md)) `.git/logs/` papkasi umuman yo'q — reflog `.git/reftable/` ichidagi binar jadvallarda saqlanadi. `git reflog` buyrug'i esa xuddi shunday ishlaydi:
>
> ```bash
> $ git init -q -b main --ref-format=reftable
> $ ...
> $ ls .git
> COMMIT_EDITMSG
> HEAD
> config
> ...
> refs
> reftable
> $ git reflog
> 2e5e01c HEAD@{0}: commit (initial): Birinchi
> ```
>
> Xulosa: reflog bilan faqat `git reflog` buyrug'i orqali ishlang, `.git/logs/` fayllariga tayanmang.

### `HEAD` reflog'i va branch reflog'i

Har branch'ning o'z jurnali bor:

```bash
$ git reflog show main
c2fd5b1 main@{0}: reset: moving to HEAD~2
d38d46b main@{1}: commit: qidir.py biroz o'zgardi
d46b4d7 main@{2}: commit: qidir.py yaratildi
c2fd5b1 main@{3}: commit: Uchinchi commit
02e88f3 main@{4}: commit: Ikkinchi commit
6aa48d5 main@{5}: commit (initial): Birinchi commit

$ git reflog list
HEAD
refs/heads/main

$ git reflog exists refs/heads/main; echo "exit=$?"
exit=0
$ git reflog exists refs/heads/yoq; echo "exit=$?"
exit=1
```

Bu yerda ikkalasi bir xil, chunki faqat bitta branch'da ishladik. Branch almashtirsangiz farq paydo bo'ladi: **`HEAD` reflog'i branch almashtirishni ham yozadi** (`checkout: moving from ... to ...`), branch reflog'i esa faqat o'sha branch'ning uchi qachon siljiganini. Boshqa repo'dan misol — `feature` branch'ida commit, `main` ga o'tib qaytish, keyin `--amend`:

```bash
$ git reflog
d587163 HEAD@{0}: commit (amend): b.txt qo'shildi (tuzatildi)
0978ed8 HEAD@{1}: checkout: moving from main to feature
02ea25e HEAD@{2}: checkout: moving from feature to main
0978ed8 HEAD@{3}: commit: b.txt qo'shildi
02ea25e HEAD@{4}: checkout: moving from main to feature
02ea25e HEAD@{5}: commit (initial): a.txt qo'shildi

$ git reflog show feature
d587163 feature@{0}: commit (amend): b.txt qo'shildi (tuzatildi)
0978ed8 feature@{1}: commit: b.txt qo'shildi
02ea25e feature@{2}: branch: Created from HEAD
```

E'tibor bering: `HEAD@{3}` va `feature@{1}` — bir xil commit, lekin raqamlari boshqa. `HEAD@{n}` dagi raqam "HEAD necha marta ko'chdi" degani, `feature@{n}` dagi — "feature necha marta ko'chdi".

## Kod: reflog nomlarini revision sifatida ishlatish

Reflog yozuvlari — to'la huquqli revision nomlari ([19-bob](19-revision-tanlash.md)). Ularni `show`, `log`, `diff`, `branch`, `reset` va boshqa har qanday buyruqqa berish mumkin:

```bash
$ git rev-parse main@{1} HEAD@{1} @{1}
d38d46b300472c1d6714b5a24ec7d1087c935b0a
d38d46b300472c1d6714b5a24ec7d1087c935b0a
d38d46b300472c1d6714b5a24ec7d1087c935b0a

$ git show --stat HEAD@{1}
commit d38d46b300472c1d6714b5a24ec7d1087c935b0a
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:20:00 2026 +0500

    qidir.py biroz o'zgardi

 qidir.py | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

`gitrevisions` sahifasidagi shakllar:

| Shakl | Ma'nosi |
| --- | --- |
| `<ref>@{<n>}` | ref'ning n-chi oldingi qiymati: `main@{1}` — `main` oxirgi siljishdan oldin qayerda edi |
| `@{<n>}` | joriy branch'ning reflog'i (`main` da turgan bo'lsangiz `@{1}` = `main@{1}`) |
| `<ref>@{<sana>}` | ref o'sha paytda qayerda edi: `main@{yesterday}`, `HEAD@{5 minutes ago}`, `main@{2026-10-07 10:17:00}` |
| `@{-<n>}` | n-chi oldin checkout qilingan branch/commit: `@{-1}` — oldingi branch (`git switch -` shuni ishlatadi) |

Sana bo'yicha so'rov — "o'sha daqiqada `main` qaysi commit'da edi":

```bash
$ git log -1 --oneline 'main@{2026-10-07 10:17:00}'
d46b4d7 qidir.py yaratildi
```

10:15 da `d46b4d7` commit qilingan, 10:20 da keyingisi — demak 10:17 da `main` aynan `d46b4d7` da edi.

```bash
$ git rev-parse --abbrev-ref @{-1}
main
```

Reflog vaqtni ham ko'rsatadi:

```bash
$ git reflog --date=iso -3
c2fd5b1 HEAD@{2026-10-07 10:25:00 +0500}: reset: moving to HEAD~2
d38d46b HEAD@{2026-10-07 10:20:00 +0500}: commit: qidir.py biroz o'zgardi
d46b4d7 HEAD@{2026-10-07 10:15:00 +0500}: commit: qidir.py yaratildi
```

### Muhim cheklov: reflog — faqat sizniki

Pro Git alohida ta'kidlaydi: reflog **qat'iy lokal**. U faqat *siz* *o'z* repo'ngizda qilgan ishlarni yozadi — hamkasbingizning nusxasida boshqacha, `push` bilan uzatilmaydi. Yangi `clone` qilingan repo'ning reflog'ida faqat klonlash yozuvi bor. Shuning uchun `main@{2.months.ago}` faqat repo'ni kamida ikki oy oldin klonlagan bo'lsangiz ma'noli natija beradi; aks holda u eng birinchi lokal yozuvni qaytaradi.

`main@{yesterday}` — "kecha `main` da qanday commit'lar bo'lgan" emas, "kecha **sizning lokal** `main` ingiz qayerni ko'rsatgan" degani. Ma'lum vaqt oralig'idagi commit'lar kerak bo'lsa — `git log --since/--until` ([9-bob](09-tarixni-korish.md)).

> **PowerShell'da.** Jingalak qavslar PowerShell'da maxsus belgi, shuning uchun nomni qo'shtirnoqqa oling: `git show "HEAD@{0}"`. Bash/zsh'da sana bo'shliq bilan yozilsa ham qo'shtirnoq kerak (`'main@{2026-10-07 10:17:00}'`).

## Kod: `reset --hard` dan keyin commit'ni qaytarish

Yo'qolgan uchni reflog'dan topdik: `d38d46b` (`HEAD@{1}`). Endi unga yana ref ko'rsatsa — commit "tirildi". Ikki yo'l bor.

**1-yo'l: yangi branch** (Pro Git usuli — eng xavfsizi, hech narsani buzmaydi):

```bash
$ git branch qutqar d38d46b
$ git log --oneline qutqar
d38d46b qidir.py biroz o'zgardi
d46b4d7 qidir.py yaratildi
c2fd5b1 Uchinchi commit
02e88f3 Ikkinchi commit
6aa48d5 Birinchi commit
```

Keyin bemalol ko'rib chiqasiz va xohlasangiz `main` ga merge qilasiz yoki kerakli commit'ni `cherry-pick` qilasiz ([34-bob](34-loyihani-yuritish.md)).

**2-yo'l: branch'ni o'sha joyga qaytarish** — `reset` ni "bekor qilish":

```bash
$ git reset --hard HEAD@{1}
```

Bu working tree'dagi saqlanmagan o'zgarishlarni o'chiradi ([39-bob](39-reset-sirlari.md)), shuning uchun avval `git status` toza ekanini tekshiring. `reset` dan keyin yana bitta reflog yozuvi qo'shiladi — demak bu qadamni ham orqaga qaytarish mumkin.

## Kod: o'chirilgan branch'ni tiklash

Branch'ni `-D` bilan o'chirganda **uning o'z reflog'i ham o'chadi** — `feature@{1}` endi ishlamaydi:

```bash
$ git branch -D qutqar
Deleted branch qutqar (was d38d46b).
$ git reflog exists refs/heads/qutqar; echo "exit=$?"
exit=1
```

Lekin agar o'sha branch'da ishlagan (ya'ni unga `switch` qilgan va commit qilgan) bo'lsangiz, commit'lar **`HEAD` reflog'ida** qoladi. Yangi repo'da sinab ko'ramiz:

```bash
$ git switch -c tajriba
Switched to a new branch 'tajriba'
$ # ... ikkita commit ...
$ git switch main
Switched to branch 'main'

$ git branch -d tajriba
error: the branch 'tajriba' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D tajriba'
hint: Disable this message with "git config set advice.forceDeleteBranch false"

$ git branch -D tajriba
Deleted branch tajriba (was 4e6ff9d).
```

Birinchi himoya chizig'iga e'tibor bering: `-d` merge qilinmagan branch'ni o'chirishdan bosh tortadi. `-D` majburlaydi. Ammo `-D` ham bitta foydali narsa qiladi — uchining qisqa hash'ini chiqaradi (`was 4e6ff9d`). Terminal tarixi saqlangan bo'lsa, shu yetarli. Bo'lmasa — reflog:

```bash
$ git reflog
dd5e7aa HEAD@{0}: checkout: moving from tajriba to main
4e6ff9d HEAD@{1}: commit: Kesh: TTL qo'shildi
1ecd9cf HEAD@{2}: commit: Kesh tajribasi
dd5e7aa HEAD@{3}: checkout: moving from main to tajriba
dd5e7aa HEAD@{4}: commit (initial): Boshlang'ich

$ git branch tajriba HEAD@{1}
$ git log --oneline tajriba
4e6ff9d Kesh: TTL qo'shildi
1ecd9cf Kesh tajribasi
dd5e7aa Boshlang'ich
```

`checkout: moving from tajriba to main` qatoridan oldingi yozuv — branch'dan ketish paytidagi uchi.

## Kod: `--amend` va `rebase` ni bekor qilish

`commit --amend` eski commit'ni o'zgartirmaydi — yangisini yaratadi va branch'ni unga suradi ([11-bob](11-bekor-qilish.md)). Eski commit branch reflog'ida `@{1}` bo'lib qoladi. Yuqoridagi `feature` misolida amend'ni bekor qilamiz, o'zgarishlar esa stage'da qolsin:

```bash
$ git reset --soft feature@{1}
$ git log --oneline
0978ed8 b.txt qo'shildi
02ea25e a.txt qo'shildi
$ git status --short
M  b.txt
```

Bu yerda `HEAD@{1}` emas, `feature@{1}` ishlatdik — chunki `HEAD@{1}` branch almashtirish yozuvi ham bo'lishi mumkin. **Branch'ning o'z reflog'i** "shu branch oldin qayerda edi" savoliga aniqroq javob beradi.

Rebase ham xuddi shunday. `HEAD` reflog'ida rebase har bir qadamni yozadi, branch reflog'ida esa faqat bitta yakuniy yozuv bo'ladi:

```bash
$ git rebase main
Successfully rebased and updated refs/heads/feature.

$ git reflog -5
f941c75 HEAD@{0}: rebase (finish): returning to refs/heads/feature
f941c75 HEAD@{1}: rebase (pick): b.txt qo'shildi (tuzatildi)
c57498b HEAD@{2}: rebase (pick): b.txt qo'shildi
4a03cbd HEAD@{3}: rebase (start): checkout main
bc9b151 HEAD@{4}: checkout: moving from main to feature

$ git reflog show feature -3
f941c75 feature@{0}: rebase (finish): refs/heads/feature onto 4a03cbd6c7c6fd00bdafa3bef57829a1bf421406
bc9b151 feature@{1}: commit: b.txt qo'shildi (tuzatildi)
0978ed8 feature@{2}: reset: moving to feature@{1}

$ git reset --hard feature@{1}
HEAD is now at bc9b151 b.txt qo'shildi (tuzatildi)
$ git log --oneline --graph --all
* 4a03cbd c.txt qo'shildi
| * bc9b151 b.txt qo'shildi (tuzatildi)
| * 0978ed8 b.txt qo'shildi
|/
* 02ea25e a.txt qo'shildi
```

Rebase oldidan turgan joyni `ORIG_HEAD` ham saqlaydi (`git rev-parse ORIG_HEAD` → `bc9b151`), lekin `ORIG_HEAD` ni keyingi `reset`, `merge`, `rebase` qayta yozadi — reflog esa ko'p qadam ortga ketadi.

## Kod: reflog ham yo'q bo'lsa — `git fsck`

Pro Git eng og'ir holatni modellashtiradi: commit'ga hech qanday branch ko'rsatmaydi **va** reflog ham yo'q (masalan, `.git/logs` o'chirib yuborilgan yoki commit boshqa klonda yaratilib, faqat obyektlari kelgan). Takrorlaymiz:

```bash
$ git branch -D qutqar
Deleted branch qutqar (was d38d46b).
$ rm -rf .git/logs
$ git reflog
$
```

Reflog bo'sh. Endi `git fsck` — "file system check". Asl vazifasi — obyektlar bazasining butunligini tekshirish: har obyekt hash'i mazmuniga mosmi, commit ko'rsatgan tree va blob'lar bormi. Yo'l-yo'lakay u hech kim ko'rsatmaydigan obyektlarni ham xabar qiladi:

```bash
$ git fsck --full
dangling commit d38d46b300472c1d6714b5a24ec7d1087c935b0a
```

`d38d46b` topildi — tiklash usuli o'sha: `git branch qutqar d38d46b`.

`--full` hozir standart (ma'lumotnoma: "This is now default"), ya'ni packfile'lar va alternate'lar ham tekshiriladi. Pro Git'dagi `git fsck --full` buyrug'i to'g'ri, faqat bayroq endi shart emas.

### `dangling` va `unreachable` farqi

Pro Git chiqishida `dangling blob` va `dangling tree` lar ham bor edi, bizda esa faqat bitta commit. Sababi — bu ikki atama turlicha:

- **unreachable** (yetib bo'lmaydigan) — hech qanday ref'dan, index'dan yoki reflog'dan boshlab borib bo'lmaydigan **har qanday** obyekt;
- **dangling** (osilib qolgan) — yetib bo'lmaydigan obyektlar ichida **hech kim to'g'ridan-to'g'ri ishlatmaydiganlari**. Ya'ni zanjirning uchi.

```bash
$ git fsck --unreachable
unreachable tree 86704dff3129052cfaf97abd70bf3cd7b9d2ebe6
unreachable blob a9cfec8744bc4d6423fff1b9306dd9bdd174bd20
unreachable commit d38d46b300472c1d6714b5a24ec7d1087c935b0a
unreachable commit d46b4d72f6451ea5c501e85e9795583a5e7bcc92
unreachable tree 3a42ff157bc1da5f4a510d65634c0915229cfb7a
unreachable blob 9cad05908f1806683a6b1abcf9bc8ab905e77701
```

Olti obyekt yetib bo'lmaydi, lekin `d46b4d7` ni `d38d46b` (ota sifatida), tree va blob'larni commit'lar ishlatadi. Ishlatilmaydigani — faqat `d38d46b`. Shuning uchun `dangling` ro'yxati qisqaroq va tiklash uchun aynan shu kerak: zanjirning uchini tiklasangiz, qolgani o'zi "tiriladi".

```text
       hech kim ko'rsatmaydi
                │
                ▼
  c2fd5b1 ◄── d46b4d7 ◄── d38d46b      ← dangling (uchi)
  (main)       │            │
             tree,blob    tree,blob    ← unreachable, lekin dangling emas
```

### Reflog'ni hisobga olmaslik: `--no-reflogs`

Standart bo'yicha `fsck` reflog'larni ham "bosh nuqta" deb hisoblaydi — reflog'da turgan commit unreachable emas. Reflog hali bor bo'lsa ham "qaysi commit'lar faqat reflog'da qolgan?" degan savolga `--no-reflogs` javob beradi:

```bash
$ git fsck
$ git fsck --no-reflogs
dangling commit d38d46b300472c1d6714b5a24ec7d1087c935b0a
```

Birinchi buyruq hech narsa chiqarmadi (o'sha paytda reflog bor edi), ikkinchisi — reflog'siz qaraganda osilib qolgan commit'ni ko'rsatdi.

### `--lost-found`: topilganlarni faylga yozish

```bash
$ git fsck --lost-found
dangling commit d38d46b300472c1d6714b5a24ec7d1087c935b0a
$ find .git/lost-found -type f
.git/lost-found/commit/d38d46b300472c1d6714b5a24ec7d1087c935b0a
$ cat .git/lost-found/commit/*
d38d46b300472c1d6714b5a24ec7d1087c935b0a
```

Commit'lar `.git/lost-found/commit/` ga (fayl ichida — hash), qolganlari `.git/lost-found/other/` ga yoziladi. **Blob bo'lsa, faylga uning mazmuni yoziladi** — bu hech qachon commit qilinmagan ishni tiklashda juda foydali. Misol: fayl `git add` qilingan, lekin commit'dan oldin `reset --hard` bo'lgan:

```bash
$ echo "maxfiy reja: kesh qo'shish" > reja.txt
$ git add reja.txt
$ git reset --hard -q
$ ls reja.txt
ls: reja.txt: No such file or directory

$ git fsck --lost-found
dangling blob a7d6fbe583082ae71d6da130a093daebcfec4909
$ cat .git/lost-found/other/a7d6fbe583082ae71d6da130a093daebcfec4909
maxfiy reja: kesh qo'shish
```

`git add` blob obyektini darhol bazaga yozadi ([15-bob](15-tree-va-index.md)), shuning uchun stage qilingan narsa reflog'siz ham tiklanadi. **Hech qachon `add` qilinmagan** o'zgarish esa bazaga tushmagan — uni Git tiklay olmaydi.

Topilgan obyektni ko'rish uchun odatiy plumbing yetarli:

```bash
$ git cat-file -p d38d46b
tree 86704dff3129052cfaf97abd70bf3cd7b9d2ebe6
parent d46b4d72f6451ea5c501e85e9795583a5e7bcc92
author Ali Valiyev <ali@example.com> 1791350400 +0500
committer Ali Valiyev <ali@example.com> 1791350400 +0500

qidir.py biroz o'zgardi
```

Ko'p dangling commit bo'lsa (stash'lar, eski rebase'lar), muallif sanasi va xabari bo'yicha keraklisini ajratasiz. Tashlab yuborilgan stash'ni topishning maxsus usuli — [38-bob](38-stash-va-clean.md).

`fsck` ning boshqa diagnostikalari: `missing <tur> <hash>` — obyekt ko'rsatilgan, lekin bazada yo'q (repo shikastlangan); `hash mismatch` — obyekt mazmuni hash'iga mos emas (jiddiy butunlik muammosi). Ma'lumotnoma maslahati: shikastlangan obyektni zaxira nusxadan yoki boshqa klondan oling.

## Muhandislik nuqtai nazari: reflog qachon tozalanadi

Reflog abadiy emas. Uni `git reflog expire` qisqartiradi, odatda o'zi emas, `git gc` ichida ([18-bob](18-packfile-va-gc.md)). Ikki muddat bor:

| Sozlama | Standart | Nimaga taalluqli |
| --- | --- | --- |
| `gc.reflogExpire` | 90 kun | Barcha yozuvlar |
| `gc.reflogExpireUnreachable` | 30 kun | Branch'ning hozirgi uchidan yetib bo'lmaydigan commit'ga oid yozuvlar |
| `gc.pruneExpire` | `2.weeks.ago` | Reflog'dan ham chiqqan ref'siz obyektlar o'chirilishidan oldingi muhlat |

Ikkinchisi nega qisqaroq? `gc.adoc` izohi: bunday yozuvlar odatda `commit --amend` yoki `rebase` natijasi — o'zgartirilishidan oldingi commit'lar. Ular endi loyihaning bir qismi emas, shuning uchun ko'pchilik ularni tezroq tozalashni xohlaydi.

Muddatni ref naqshi bo'yicha alohida berish mumkin (`gc.<pattern>.reflogExpire`), masalan stash'lar hech qachon eskirmasin:

```bash
$ git config set gc.reflogExpireUnreachable "60 days"
$ git config set 'gc.refs/stash.reflogExpire' never
$ tail -4 .git/config
[gc]
	reflogExpireUnreachable = 60 days
[gc "refs/stash"]
	reflogExpire = never
```

`expire` ni avval quruq rejimda ko'rish mumkin (`-n`/`--dry-run`, `--verbose`). Amend va rebase qilingan repo'da:

```bash
$ git reflog expire --expire-unreachable=now --all --dry-run --verbose
keep commit (initial): a.txt qo'shildi
keep checkout: moving from main to feature
keep commit: b.txt qo'shildi
...
would prune commit (amend): b.txt qo'shildi (tuzatildi)
would prune reset: moving to feature@{1}
...
would prune rebase (pick): b.txt qo'shildi
would prune rebase (pick): b.txt qo'shildi (tuzatildi)
would prune rebase (finish): returning to refs/heads/feature
...
```

Amend va rebase natijasidagi (endi `feature` dan yetib bo'lmaydigan) yozuvlar kesiladi. Haqiqiy tozalash va `gc` dan keyin obyekt butunlay yo'qoladi:

```bash
$ git gc -q
$ git cat-file -t f941c75
commit                                   ← reflog'da turibdi, gc tegmadi

$ git reflog expire --expire-unreachable=now --all
$ git gc -q --prune=now
$ git cat-file -t f941c75af582547b30470b19bc6d93dba9ed2289
fatal: git cat-file: could not get object info
```

Ko'rinib turibdi: oddiy `git gc` reflog'dagi commit'ga tegmadi. Faqat reflog qo'lda tozalangandan **va** muhlat `now` qilingandan keyin obyekt yo'qoldi. Kundalik ishda bunday qilishning keragi yo'q — bu faqat maxfiy ma'lumot yoki katta faylni olib tashlash uchun (keyingi bo'lim).

`git reflog` ning boshqa ichki buyruqlari (ma'lumotnoma: "odatda oxirgi foydalanuvchi to'g'ridan-to'g'ri ishlatmaydi"): `delete <ref>@{n}` — bitta yozuvni o'chiradi; `drop` — ref'ning butun reflog'ini o'chiradi; `write <ref> <eski> <yangi> <xabar>` — qo'lda yozuv qo'shadi.

## Kod: katta faylni tarixdan olib tashlash

**Muammo.** `git clone` butun tarixni yuklaydi — har faylning har versiyasini. Kimdir bir marta 5 MB'lik faylni commit qilib, keyingi commit'da o'chirgan bo'lsa ham, u tarixdan yetib boriladi va **har bir klon uni abadiy yuklaydi**. Pro Git'ga ko'ra bu ayniqsa Subversion yoki Perforce'dan import qilingan repo'larda uchraydi (u tizimlarda butun tarix yuklanmaydi, shuning uchun katta fayl u yerda zararsiz edi).

> **Ogohlantirish.** Bu usul tarixni **qayta yozadi**: katta fayl qo'shilgan commit'dan boshlab keyingi barcha commit'larning hash'i o'zgaradi. Agar boshqalar shu tarix ustida ishlayotgan bo'lsa, ularning hammasiga xabar berib, ishlarini yangi commit'lar ustiga rebase qilishni so'rashingiz kerak ([24-bob](24-rebase.md), "rebase qilinganni rebase qilish"). Boshlashdan oldin repo'ning to'liq nusxasini oling.

### 1-qadam: muammoni modellashtirish

```bash
$ python3 -c "import random; random.seed(42); open('dump.bin','wb').write(random.randbytes(5_000_000))"
$ git add dump.bin
$ git commit -m "Ma'lumotlar bazasi nusxasi qo'shildi"
[main cad169e] Ma'lumotlar bazasi nusxasi qo'shildi
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 dump.bin

$ git rm dump.bin
rm 'dump.bin'
$ git commit -m "Oops: katta faylni o'chirish"
[main 5ac8649] Oops: katta faylni o'chirish
 1 file changed, 0 insertions(+), 0 deletions(-)
 delete mode 100644 dump.bin

$ # ... yana bitta oddiy commit ...
$ git gc -q
$ git count-objects -vH
count: 0
size: 0 bytes
in-pack: 13
packs: 1
size-pack: 4.77 MiB
prune-packable: 0
garbage: 0
size-garbage: 0 bytes
```

Fayl o'chirilgan, lekin `size-pack` — 4.77 MiB. Fayl tarixda yashayapti.

### 2-qadam: katta obyektni topish

Faraz qilaylik, qaysi fayl ekanini bilmaymiz. `gc` dan keyin hamma obyekt packfile'da — `git verify-pack -v` har obyektni hajmi bilan chiqaradi ([18-bob](18-packfile-va-gc.md)). Uchinchi ustun (hajm) bo'yicha saralaymiz:

```bash
$ git verify-pack -v .git/objects/pack/pack-*.idx | sort -k 3 -n | tail -3
5ac864989f931783dc55801f11fa9cd285251235 commit 235 170 170
cad169e3c6ed9c5be844afbc188078a006b3f49c commit 243 170 340
938124831346257519c9a0577190f1f31820c4af blob   5000000 5001540 1017
```

Eng pastdagisi — 5 000 000 baytlik blob. U qaysi fayl? `rev-list --objects` har blob yonida uning yo'lini chiqaradi:

```bash
$ git rev-list --objects --all | grep 9381248
938124831346257519c9a0577190f1f31820c4af dump.bin

$ git log --oneline --branches -- dump.bin
5ac8649 Oops: katta faylni o'chirish
cad169e Ma'lumotlar bazasi nusxasi qo'shildi
```

Shuni ham bilish foydali: `verify-pack` faqat packfile bilan ishlaydi. Loose va packed obyektlarni birga ko'rishning zamonaviyroq yo'li — `cat-file --batch-all-objects`:

```bash
$ git cat-file --batch-all-objects --batch-check='%(objecttype) %(objectname) %(objectsize) %(objectsize:disk)' | sort -k3 -n | tail -2
commit cad169e3c6ed9c5be844afbc188078a006b3f49c 243 170
blob 938124831346257519c9a0577190f1f31820c4af 5000000 5001540
```

### 3-qadam (Pro Git usuli): `git filter-branch`

Pro Git `cad169e` dan boshlab barcha commit'larni qayta yozadi va har birining index'idan faylni olib tashlaydi:

```bash
$ git filter-branch --index-filter 'git rm --ignore-unmatch --cached dump.bin' -- cad169e^..
WARNING: git-filter-branch has a glut of gotchas generating mangled history
	 rewrites.  Hit Ctrl-C before proceeding to abort, then use an
	 alternative filtering tool such as 'git filter-repo'
	 (https://github.com/newren/git-filter-repo/) instead.  See the
	 filter-branch manual page for more details; to squelch this warning,
	 set FILTER_BRANCH_SQUELCH_WARNING=1.
Proceeding with filter-branch...

Rewrite cad169e3c6ed9c5be844afbc188078a006b3f49c (1/3) ... rm 'dump.bin'
Rewrite 5ac864989f931783dc55801f11fa9cd285251235 (2/3) ...
Rewrite ef40302529a629385e51148a1f2c81b955082e2f (3/3) ...
Ref 'refs/heads/main' was rewritten

$ git log --oneline
b4808dd app.py yangilandi
a6a88ab Oops: katta faylni o'chirish
6d5a3a1 Ma'lumotlar bazasi nusxasi qo'shildi
cd82565 app.py qo'shildi
4386a10 README qo'shildi
```

Opsiyalar nima qiladi:

- `--index-filter` — har commit uchun buyruqni **index** ustida bajaradi, fayllarni diskka chiqarmaydi. Shu sababli `--tree-filter` dan ancha tez.
- `git rm --cached` — fayl diskdan emas, index'dan olib tashlanadi (diskda working tree yo'q).
- `--ignore-unmatch` — fayl yo'q commit'larda xato bermasin.
- `cad169e^..` — faqat muammo boshlangan joydan qayta yoz, butun tarixni emas.

Natijaga qarang: `cad169e` dan boshlab hash'lar o'zgardi (`6d5a3a1`, `a6a88ab`, `b4808dd`), undan oldingilari (`cd82565`, `4386a10`) o'sha-o'sha. "Ma'lumotlar bazasi nusxasi qo'shildi" commit'i esa endi **bo'sh** — buni oldini olish uchun `--prune-empty` bayrog'i bor.

Lekin hajm hali kamaymadi:

```bash
$ git gc -q
$ git count-objects -vH | grep size-pack
size-pack: 4.77 MiB
```

Sabab — bu bobning asosiy mavzusi: eski commit'larga hali ham ko'rsatkichlar bor. Biri — `filter-branch` ning o'zi qoldirgan zaxira ref, ikkinchisi — reflog:

```bash
$ git for-each-ref
b4808ddfc44b6404b6e80f54be745b314caaa6a5 commit	refs/heads/main
ef40302529a629385e51148a1f2c81b955082e2f commit	refs/original/refs/heads/main
```

### 4-qadam: ko'rsatkichlarni tozalash va `gc`

`git-filter-branch` ma'lumotnomasidagi "CHECKLIST FOR SHRINKING A REPOSITORY" tartibi (Pro Git'dagi `rm -rf .git/refs/original` va `rm -rf .git/logs` ning xavfsizroq, reftable bilan ham ishlaydigan shakli):

```bash
$ git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
$ git reflog expire --expire=now --all
$ git gc -q --prune=now
$ git count-objects -vH
count: 0
size: 0 bytes
in-pack: 11
packs: 1
size-pack: 2.30 KiB
prune-packable: 0
garbage: 0
size-garbage: 0 bytes

$ git cat-file -t 9381248
fatal: Not a valid object name 9381248
```

4.77 MiB → 2.30 KiB. Blob haqiqatan yo'q.

Pro Git'da `gc` dan keyin katta obyekt hali loose holatda (`size: 4904`) qolgan va uni `git prune --expire now` bilan o'chirgan. Bizda `gc --prune=now` ikkalasini bir qadamda qildi. Har ikki holatda ham: loose qolgan obyekt `push` yoki `clone` bilan uzatilmaydi — asosiysi shu.

Ma'lumotnoma yana ikki shartni eslatadi:

- faylning **barcha nomlari**ni olib tashlang — u tarix davomida ko'chirilgan bo'lishi mumkin (`git log --name-only --follow --all -- fayl` yordam beradi);
- **barcha ref'larni** filtrlang (`--tag-name-filter cat -- --all`), aks holda teg eski tarixni ushlab turadi.

Xavfsizroq yo'l ham bor: asl repo'ni o'chirish o'rniga `git clone file:///yo'l/repo` bilan yangi klon oling — klonga yetib bo'lmaydigan obyektlar o'tmaydi. (Oddiy yo'l bilan `git clone /yo'l/repo` hamma faylni hardlink qiladi, `file://` kerak.)

### Hozirgi tavsiya: `git filter-repo`

Yuqoridagi `WARNING` tasodifiy emas. `git-filter-branch` ma'lumotnomasi (v2.56.0) boshidayoq aytadi: `filter-branch` tushunarsiz tarzda buzilgan tarix yaratishi mumkin bo'lgan **ko'p tuzoqlarga** ega, juda sekin, va bu muammolarni orqaga moslik bilan tuzatib bo'lmaydi — **shuning uchun uni ishlatish tavsiya etilmaydi**. O'rniga `git filter-repo` ni ishlatish taklif qilinadi.

`git filter-repo` — Git'ning o'zi bilan kelmaydigan, alohida o'rnatiladigan asbob (<https://github.com/newren/git-filter-repo>). Uning rasmiy hujjatidagi misollar:

```bash
# Bitta fayl/yo'lni butun tarixdan olib tashlash
git filter-repo --invert-paths --path dump.bin

# Ma'lum hajmdan katta hamma blob'larni olib tashlash
git filter-repo --strip-blobs-bigger-than 10M

# Avval tahlil: nima katta, nima o'chirilgan — repo o'zgarmaydi
git filter-repo --analyze
```

> Bu buyruqlar qo'llanma muallifining sinov muhitida ishga tushirilmagan (`filter-repo` o'rnatilmagan) — sintaksis asbobning rasmiy hujjatidan olingan.

`filter-branch` dan muhim farqlari (rasmiy hujjat bo'yicha):

- `--path` — tarixda **qoldiriladigan** yo'llar; `--invert-paths` tanlovni teskari qiladi ("shu yo'ldan boshqa hammasi").
- Standart bo'yicha faqat **yangi klonda** ishlaydi va boshqa holatda to'xtaydi — lokal, hech qayerda nusxasi yo'q tarixni tasodifan qayta yozib yubormaslik uchun. Majburlash — `--force` (qaytarib bo'lmaydigan amal).
- Ishdan keyin `origin` remote'ini **olib tashlaydi**. Sabab: qayta yozilgan tarixni eski tarix bilan `git pull && git push` orqali tasodifan qo'shib yuborsangiz, har commit'ning ikki nusxasi paydo bo'ladi. Remote yo'qligi — "yangi repo'ga push qiling va hammaga yangidan klonlashni ayting" degan majburiy eslatma.
- Reflog'ni tozalash va yakuniy `gc` ni o'zi qiladi — 4-qadamni qo'lda bajarish shart emas.

Tarixni qayta yozishning boshqa usullari (interaktiv rebase, `git history`) — [25-bob](25-tarixni-qayta-yozish.md).

## Muhandislik nuqtai nazari: maxfiy ma'lumot tarixga tushsa

Parol yoki API kalit commit qilinsa, yuqoridagi usul uni **sizning** repo'ingizdan olib tashlaydi. Lekin:

- `push` qilingan bo'lsa, u serverda, boshqalarning klonlarida, fork'larda, CI keshlarida allaqachon bor. Tarixni qayta yozish ularni o'chirmaydi.
- Shuning uchun birinchi qadam har doim — **kalitni bekor qilish (rotate)**, tarixni tozalash esa ikkinchi darajali.
- Hostinglarda (GitHub va boshqalar) eski commit'lar hash orqali bir muddat ochiq qolishi mumkin; ularni tozalash uchun hosting provayderning o'z jarayoni bor ([36-bob](36-github-boshqaruv.md)).

## Muhandislik nuqtai nazari: tiklash bo'yicha qaror daraxti

```text
Commit "yo'qoldi"
 │
 ├─ Hash'i ma'lummi? (terminal tarixi, "Deleted branch ... (was 4e6ff9d)")
 │     └─► git branch qutqar <hash>
 │
 ├─ Branch hali bormi? (reset, amend, rebase bo'lgan)
 │     └─► git reflog show <branch>  →  git reset --hard <branch>@{1}
 │                                      yoki git branch qutqar <branch>@{n}
 │
 ├─ Branch o'chirilgan, lekin unda ishlagansiz
 │     └─► git reflog (HEAD)  →  "checkout: moving from X" dan oldingi yozuv
 │
 ├─ Reflog'da yo'q
 │     └─► git fsck --lost-found  →  dangling commit / blob
 │
 └─ fsck ham topmadi
       └─► gc o'chirib bo'lgan. Boshqa klon, server, zaxira nusxa.
```

Tiklashni boshlashdan oldin ikki odat:

1. **Avval branch yarating, keyin o'ylang.** `git branch qutqar <hash>` hech narsani buzmaydi va commit'ni gc'dan himoya qiladi.
2. **`git gc` ni ishga tushirmang** va `--prune=now` / `reflog expire` qilmang — aynan shu buyruqlar tiklash imkoniyatini yo'q qiladi. (Avtomatik `gc --auto` ham ishlashi mumkin, lekin u muhlatlarga rioya qiladi.)

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `reset --hard` dan keyin "hammasi yo'qoldi" deb repo'ni qayta klonlash | Lokal, push qilinmagan commit'lar klonda yo'q; reflog ham yo'qoladi | `git reflog` → `git branch qutqar HEAD@{n}` |
| `HEAD@{1}` ni "oldingi commit" deb tushunish | Bu "HEAD oldin qayerda edi", ota commit emas (`HEAD~1` emas); branch almashtirish ham yozuv | Ota uchun `HEAD~`; branch tarixi uchun `<branch>@{n}` |
| O'chirilgan branch'ni `<branch>@{1}` bilan qidirish | `branch -D` branch reflog'ini ham o'chiradi | `HEAD` reflog'i yoki `git fsck --lost-found` |
| Hamkasbning commit'ini o'z reflog'ingizdan qidirish | Reflog lokal, `push`/`fetch` bilan uzatilmaydi | Uning o'z repo'sidan yoki serverdan |
| Bare server repo'da reflog'ga tayanish | Bare repo'da `core.logAllRefUpdates` standart `false` | Serverda reflog'ni yoqish yoki zaxira |
| Tiklashdan oldin `git gc --prune=now` | Yetib bo'lmaydigan obyektlar darhol o'chadi | Avval `git branch` bilan qutqaring, gc keyin |
| Katta faylni oddiy `git rm` + commit bilan "o'chirish" | Fayl tarixda qoladi, har klon uni yuklaydi | `git filter-repo --invert-paths --path ...` |
| `filter-branch` dan keyin hajm kamaymadi deb hayron bo'lish | `refs/original/` va reflog eski commit'larni ushlab turibdi | `update-ref -d` + `reflog expire --expire=now --all` + `gc --prune=now` |
| Qayta yozilgan tarixni eski klonga `pull` qilib push qilish | Har commit'ning ikki nusxasi, katta fayl qaytib keladi | Hamma yangidan klonlaydi; `filter-repo` shuning uchun `origin` ni olib tashlaydi |
| Maxfiy kalitni faqat tarixdan o'chirish | Kalit allaqachon tarqalgan bo'lishi mumkin | Avval kalitni bekor qiling, keyin tarixni tozalang |

## Amaliyot

1. Vaqtinchalik repo'da 5 ta commit qiling, `git reset --hard HEAD~3` bilan orqaga qayting. `git reflog` dan yo'qolgan uchni toping va uni `qutqar` branch'iga tiklang.
2. `git log -g` va `git reflog --date=iso` chiqishlarini solishtiring. `.git/logs/HEAD` faylini oching va har ustun nima ekanini aniqlang.
3. Yangi branch'da ikki commit qiling, `main` ga qayting, branch'ni `-D` bilan o'chiring. `git reflog exists refs/heads/<nom>` nima qaytarishini ko'ring, keyin branch'ni `HEAD` reflog'idan tiklang.
4. `commit --amend` qiling, keyin uni `git reset --soft <branch>@{1}` bilan bekor qiling. Nega bu yerda `HEAD@{1}` emas, `<branch>@{1}` xavfsizroq ekanini tushuntiring.
5. Faylni `git add` qiling, commit qilmay `git reset --hard` qiling. `git fsck --lost-found` bilan mazmunini `.git/lost-found/other/` dan qaytaring.
6. `git fsck --unreachable` va `git fsck` (dangling) chiqishlarini solishtiring: nega birinchisi uzunroq?
7. (Qiyinroq) Repo'ga 5 MB'lik fayl qo'shing, keyingi commit'da o'chiring. `verify-pack` yoki `cat-file --batch-all-objects` bilan toping, repo nusxasida `filter-branch` bilan tarixdan olib tashlang va `count-objects -vH` da `size-pack` haqiqatan kamayguncha kerakli qadamlarni bajaring. Imkon bo'lsa, xuddi shu ishni yangi klonda `git filter-repo --invert-paths --path <fayl>` bilan takrorlang va natijalarni solishtiring.

## Rasmiy hujjat

- Pro Git — Maintenance and Data Recovery: <https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery>
- Pro Git — Revision Selection (RefLog Shortnames): <https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection>
- `git reflog`: <https://git-scm.com/docs/git-reflog>
- `git fsck`: <https://git-scm.com/docs/git-fsck>
- `git gc` (NOTES, `gc.reflogExpire`, `gc.pruneExpire`): <https://git-scm.com/docs/git-gc>
- `gitrevisions` (`@{n}`, `@{sana}`, `@{-n}`): <https://git-scm.com/docs/gitrevisions>
- `git filter-branch` (WARNING, CHECKLIST FOR SHRINKING A REPOSITORY): <https://git-scm.com/docs/git-filter-branch>
- `git filter-repo`: <https://github.com/newren/git-filter-repo>
