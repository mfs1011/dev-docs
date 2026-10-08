# 40 — Qidiruv

[← Oldingi: `reset` sirlari: uch daraxt](39-reset-sirlari.md) · [Mundarija](README.md) · [Keyingi: `blame` va `bisect` →](41-blame-va-bisect.md)

## Tushuncha

Loyiha kattalashgani sari ikki xil savol tez-tez chiqadi:

1. **"Qayerda?"** — bu funksiya qayerda e'lon qilingan, qayerdan chaqiriladi, bu konstanta qaysi fayllarda bor?
2. **"Qachon?"** — bu satr qachon paydo bo'lgan, kim uni o'zgartirgan, bu funksiya qanday o'zgarib kelgan?

Git ikkala savolga ham o'z vositasini beradi:

| Savol | Vosita | Nimani qidiradi |
| --- | --- | --- |
| Qayerda? | `git grep` | Fayllar **ichidagi** matnni: working tree'da, index'da yoki istalgan commit'ning daraxtida |
| Qachon bu satr qo'shildi/o'chdi? | `git log -S` ("pickaxe") | Shu satr **soni o'zgargan** commit'larni |
| Qachon bu naqshga mos qator o'zgardi? | `git log -G` | Diff'idagi qo'shilgan/o'chirilgan qatori regex'ga mos commit'larni |
| Bu funksiya qanday o'zgarib keldi? | `git log -L` | Bitta qator oralig'i yoki funksiyaning to'liq tarixini |
| Commit xabarida nima deyilgan? | `git log --grep` | Commit **xabarini** (kodni emas) |

Bu bobdagi atamalar:

- **Working tree** — diskdagi, siz tahrirlayotgan fayllar ([5-bob](05-uch-holat.md)).
- **Index** (staging) — keyingi commit'ga tayyorlangan holat, `.git/index` fayli ([15-bob](15-tree-va-index.md)).
- **Tree** — Git obyekti, papkaning suratini saqlaydi; har commit bitta tree'ga ishora qiladi ([15-bob](15-tree-va-index.md)).
- **Pickaxe** (inglizcha "cho'kich") — `git log -S` ning norasmiy nomi: tarixni "qazib", satr paydo bo'lgan yoki yo'qolgan joyni topadi.
- **Hunk** — diff'dagi bitta o'zgarish bo'lagi (`@@ ... @@` bilan boshlanadi, [7-bob](07-diff.md)).

Barcha misollar bitta kichik JavaScript loyihasida ko'rsatiladi. Uning tarixi:

```text
$ git log --oneline
b84f365 Chegirma chegarasini konstantaga chiqarish
99b7c86 Bo'sh savatni tekshirish
12d2254 Katta xaridga 5% chegirma
aebd0d4 Soliq foizini 15 ga oshirish
aca6765 Savat moduli: savatJami
8155bc1 Narx hisoblash moduli
```

`aca6765` commit'iga `v1.0` tegi qo'yilgan. Fayllar: `README.md`, `src/narx.js` (funksiyalar `hisoblaNarx`, `chegirma`, konstanta `SOLIQ_FOIZI`), `src/savat.js` (funksiya `savatJami`). Working tree'da `src/savat.js` ga commit qilinmagan bitta qator qo'shilgan va kuzatilmaydigan (untracked) `eslatma.txt` bor:

```text
$ git status -s
 M src/savat.js
?? eslatma.txt
```

## Nega shunday: oddiy `grep` turganda `git grep` nega kerak

Unix'dagi `grep -r` ham fayllarda matn qidiradi. Pro Git `git grep`ning ikki afzalligini ajratib ko'rsatadi:

1. **Tez.** `git grep` faqat Git kuzatadigan fayllarni ko'radi (`.git` papkasi, `node_modules` kabi ignore qilingan papkalar, yig'ilgan fayllar avtomatik chetda qoladi) va bir nechta oqimda (thread) ishlaydi. Oqimlar soni `grep.threads` sozlamasi bilan boshqariladi; berilmasa — protsessor yadrolari soni.
2. **Har qanday daraxtda qidiradi.** Oddiy `grep` faqat diskdagi fayllarni ko'radi. `git grep` esa obyekt bazasidagi istalgan commit'ning daraxtini o'qiy oladi: "`v1.0` relizida bu konstanta qanday edi?" degan savolga `switch` qilmasdan, working tree'ga tegmasdan javob beradi.

Ikkinchi nuqta Git modelidan kelib chiqadi. Har commit — to'liq surat (snapshot), uning ichidagi har fayl — blob obyekti ([14-bob](14-obyektlar-blob.md)). `git grep v1.0` buyrug'i `v1.0` → commit → tree → blob'lar zanjirini bosib o'tadi va blob mazmunini to'g'ridan-to'g'ri `.git/objects` dan (yoki packfile'dan) o'qiydi. Diskdagi fayllarga umuman qaramaydi.

`git log -S`/`-G` esa boshqa savolga javob beradi. `git grep` — bitta suratdagi holat ("hozir qayerda bor"). `log -S` — suratlar orasidagi **farq** ("qaysi commit'da paydo bo'ldi yoki yo'qoldi"). Git snapshot saqlagani uchun bu farqni u har commit uchun ota commit bilan solishtirib, o'sha zahoti hisoblaydi.

## Kod: `git grep` asoslari

Standart holatda `git grep` working tree'dagi **kuzatiladigan** fayllarda qidiradi va har mos qatorni `fayl:qator` ko'rinishida chiqaradi:

```text
$ git grep hisoblaNarx
src/narx.js:function hisoblaNarx(narx, soni) {
src/narx.js:module.exports = { hisoblaNarx, chegirma }
src/savat.js:const { hisoblaNarx } = require('./narx')
src/savat.js:    jami += hisoblaNarx(mahsulot.narx, mahsulot.soni)
```

`-n` (`--line-number`) qator raqamini qo'shadi — muharrirda shu joyga sakrash uchun kerak:

```text
$ git grep -n hisoblaNarx
src/narx.js:4:function hisoblaNarx(narx, soni) {
src/narx.js:17:module.exports = { hisoblaNarx, chegirma }
src/savat.js:1:const { hisoblaNarx } = require('./narx')
src/savat.js:9:    jami += hisoblaNarx(mahsulot.narx, mahsulot.soni)
```

Har safar `-n` yozmaslik uchun uni standart qilish mumkin:

```bash
git config grep.lineNumber true
```

`--column` qatordagi birinchi moslik qaysi baytdan boshlanishini ham ko'rsatadi (1 dan sanaladi):

```text
$ git grep -n --column chegirma src/narx.js
src/narx.js:6:22:  const sof = jami - chegirma(jami)
src/narx.js:10:10:function chegirma(jami) {
src/narx.js:17:33:module.exports = { hisoblaNarx, chegirma }
```

### Faqat fayl nomlari yoki son

Ba'zan qatorlarning o'zi emas, qaysi fayllarda borligi kerak:

```text
$ git grep -c hisoblaNarx
src/narx.js:2
src/savat.js:2

$ git grep -l SOLIQ
src/narx.js

$ git grep -L SOLIQ
README.md
src/savat.js
```

- `-c` (`--count`) — har faylda nechta qator mos kelgani.
- `-l` (`--files-with-matches`, sinonimi `--name-only`) — moslik bor fayllar.
- `-L` (`--files-without-match`) — moslik **yo'q** fayllar. Diqqat: `git grep -L` bilan `git log -L` butunlay boshqa narsalar.

`-o` (`--only-matching`) qatorning faqat mos kelgan qismini chiqaradi — regex bilan nimalar topilganini ko'rish uchun qulay:

```text
$ git grep -o -n 'SOLIQ_[A-Z]*'
src/narx.js:1:SOLIQ_FOIZI
src/narx.js:7:SOLIQ_FOIZI
```

### Qidiruvni pathspec bilan cheklash

`--` dan keyin yo'llar (pathspec, [8-bob](08-gitignore-rm-mv.md)) beriladi. `:!` (yoki `:^`) bilan yo'lni chiqarib tashlash mumkin:

```text
$ git grep -n jami -- ':!src/savat.js'
src/narx.js:5:  const jami = narx * soni
src/narx.js:6:  const sof = jami - chegirma(jami)
src/narx.js:10:function chegirma(jami) {
src/narx.js:11:  if (jami > CHEGIRMA_CHEGARASI) {
src/narx.js:12:    return jami * 0.05
```

Rasmiy hujjatdagi misollar: `git grep 'time_t' -- '*.[ch]'` (faqat `.c` va `.h` fayllar) va `git grep solution -- :^Documentation` (`Documentation` papkasidan tashqari hamma joy).

Quyi papkadan ishga tushirilsa, yo'llar joriy papkaga nisbatan chiqadi. `--full-name` ularni loyiha ildiziga nisbatan qiladi (`grep.fullName` sozlamasi bilan standart qilish mumkin):

```text
$ cd src
$ git grep -n chegirma
narx.js:6:  const sof = jami - chegirma(jami)
narx.js:10:function chegirma(jami) {
narx.js:17:module.exports = { hisoblaNarx, chegirma }
$ git grep -n --full-name chegirma
src/narx.js:6:  const sof = jami - chegirma(jami)
src/narx.js:10:function chegirma(jami) {
src/narx.js:17:module.exports = { hisoblaNarx, chegirma }
```

## Kod: qayerda qidirish — working tree, index, untracked, commit

`git grep` to'rt xil manbadan o'qiy oladi. Farqni ko'rish uchun working tree'dagi commit qilinmagan qatorni qidiramiz:

```text
$ git grep -n vaqtinchalik
src/savat.js:15:// ishlab chiqish: vaqtinchalik

$ git grep -n --cached vaqtinchalik
$ echo $?
1
```

Birinchi buyruq diskdagi faylni o'qidi — qator bor. `--cached` esa **index'dagi** blob'ni o'qidi: bu qator hali `git add` qilinmagan, shuning uchun topilmadi. Hech narsa topilmasa `git grep` 1 kodi bilan chiqadi (oddiy `grep` kabi) — skriptlarda shunga tayanish mumkin.

Standart holatda kuzatilmaydigan fayllar qidirilmaydi. `--untracked` ularni ham qo'shadi:

```text
$ git grep -n SOLIQ_FOIZI
src/narx.js:1:const SOLIQ_FOIZI = 15
src/narx.js:7:  return sof + sof * SOLIQ_FOIZI / 100

$ git grep -n --untracked SOLIQ_FOIZI
eslatma.txt:1:SOLIQ_FOIZI = 20 (qoralama)
src/narx.js:1:const SOLIQ_FOIZI = 15
src/narx.js:7:  return sof + sof * SOLIQ_FOIZI / 100
```

`--untracked` ham `.gitignore` qoidalarini hurmat qiladi. Ignore qilingan fayllarni ham ko'rish uchun `--no-exclude-standard` qo'shiladi. Misolda `node_modules/` ignore qilingan:

```text
$ git grep -n --untracked hisoblaNarx
src/narx.js:4:function hisoblaNarx(narx, soni) {
src/narx.js:17:module.exports = { hisoblaNarx, chegirma }
src/savat.js:1:const { hisoblaNarx } = require('./narx')
src/savat.js:9:    jami += hisoblaNarx(mahsulot.narx, mahsulot.soni)

$ git grep -n --untracked --no-exclude-standard hisoblaNarx
node_modules/kutubxona/index.js:1:function hisoblaNarx() {}
src/narx.js:4:function hisoblaNarx(narx, soni) {
...
```

### Eski commit'da qidirish

Buyruq oxiriga revision ([19-bob](19-revision-tanlash.md)) — branch, teg, hash, `HEAD~3` — berilsa, `git grep` o'sha commit'ning daraxtida qidiradi. Natija oldiga qaysi daraxtdan topilgani yoziladi:

```text
$ git grep -n SOLIQ_FOIZI v1.0
v1.0:src/narx.js:1:const SOLIQ_FOIZI = 12
v1.0:src/narx.js:5:  return jami + jami * SOLIQ_FOIZI / 100
```

`v1.0` relizida soliq 12 foiz bo'lgan — `switch` ham, `stash` ham kerak bo'lmadi. Bir nechta daraxtni birdan berish mumkin:

```text
$ git grep -n SOLIQ_FOIZI HEAD~3 HEAD
HEAD~3:src/narx.js:1:const SOLIQ_FOIZI = 15
HEAD~3:src/narx.js:5:  return jami + jami * SOLIQ_FOIZI / 100
HEAD:src/narx.js:1:const SOLIQ_FOIZI = 15
HEAD:src/narx.js:7:  return sof + sof * SOLIQ_FOIZI / 100
```

**Muammo.** `TODO` izohi hozirgi kodda yo'q, lekin u qaysi commit'larda bor edi? **Yechim.** `git rev-list --all` hamma commit hash'larini chiqaradi — ularni `git grep` ga daraxt sifatida beramiz:

```text
$ git grep -n TODO $(git rev-list --all)
12d2254b84579c7fafee9a66409108f2cd74e0b5:src/savat.js:3:// TODO: bo'sh savatni tekshirish
aebd0d4e07084784697e201e1872a5dcf06e5b1a:src/savat.js:3:// TODO: bo'sh savatni tekshirish
aca676548d19c41e8c873c881cd2946a56c97f4d:src/savat.js:3:// TODO: bo'sh savatni tekshirish
```

Bu kichik repo'da ishlaydi, lekin minglab commit'li loyihada buyruq qatori juda uzun bo'lib ketadi va har commit butunlay qayta qidiriladi. Bunday savol uchun to'g'ri vosita — `git log -S` (pastda): u "qayerda bor" emas, "qachon paydo bo'ldi va qachon yo'qoldi" degan savolga to'g'ridan-to'g'ri javob beradi.

### Repo'dan tashqarida: `--no-index`

Git repo'si bo'lmagan papkada `git grep` xato beradi. `--no-index` uni oddiy `grep -r` ga o'xshatib ishlatadi (pathspec imkoniyatlari bilan):

```text
$ git grep salom
fatal: not a git repository (or any of the parent directories): .git
$ git grep --no-index -n salom
a.txt:1:salom dunyo
```

`grep.fallbackToNoIndex = true` sozlamasi repo'dan tashqarida bu rejimga o'zi o'tadi (standart: `false`). `--no-index`ni `--cached` yoki `--untracked` bilan birga ishlatib bo'lmaydi.

## Kod: kontekst va funksiya nomi

Moslikni atrofidagi qatorlar bilan ko'rish uchun `-A <n>` (keyingi n qator), `-B <n>` (oldingi), `-C <n>` (ikkalasi) bor. Guruhlar orasiga `--` qo'yiladi. Kontekst qatorlari `:` emas, `-` bilan ajratiladi:

```text
$ git grep -n -C1 'return 0'
src/narx.js-13-  }
src/narx.js:14:  return 0
src/narx.js-15-}
--
src/savat.js-4-  if (savat.length === 0) {
src/savat.js:5:    return 0
src/savat.js-6-  }
```

`-p` (`--show-function`) har moslik **qaysi funksiya ichida** ekanini ko'rsatadi: mos qatordan oldingi eng yaqin "funksiya sarlavhasi" qatorini `=` belgisi bilan chiqaradi:

```text
$ git grep -p -n jami src/savat.js
src/savat.js=3=function savatJami(savat) {
src/savat.js:7:  let jami = 0
src/savat.js:9:    jami += hisoblaNarx(mahsulot.narx, mahsulot.soni)
src/savat.js:11:  return jami
```

`-W` (`--function-context`) bundan ham ko'proq qiladi — mos qator joylashgan **butun funksiyani** chiqaradi:

```text
$ git grep -n -W chegirma -- src/narx.js
src/narx.js=4=function hisoblaNarx(narx, soni) {
src/narx.js-5-  const jami = narx * soni
src/narx.js:6:  const sof = jami - chegirma(jami)
src/narx.js-7-  return sof + sof * SOLIQ_FOIZI / 100
src/narx.js-8-}
--
src/narx.js:10:function chegirma(jami) {
src/narx.js-11-  if (jami > CHEGIRMA_CHEGARASI) {
src/narx.js-12-    return jami * 0.05
src/narx.js-13-  }
src/narx.js-14-  return 0
src/narx.js-15-}
--
src/narx.js:17:module.exports = { hisoblaNarx, chegirma }
```

### Git funksiyani qanday taniydi

Git dasturlash tillarini "tushunmaydi". Funksiya sarlavhasini u `git diff` hunk sarlavhasidagi (`@@ ... @@ function ...`) bilan bir xil qoida bilan aniqlaydi. Standart qoida juda oddiy: **harf, `_` yoki `$` bilan boshlanadigan (chekinishsiz) qator** — funksiya sarlavhasi. JavaScript'dagi `function savatJami(savat) {` shunga mos keladi. Lekin chekinish bilan yozilgan metodlar (Python klassidagi `def`, Java/C# klass ichidagi metodlar) mos kelmaydi.

Python misolida farq yaqqol ko'rinadi:

```text
$ git grep -p natija
hisob.py=class Savat:
hisob.py:        natija = 0
hisob.py:            natija += m.narx
hisob.py:        return natija
```

Git `natija` `jami` metodida ekanini bilmadi — faqat chekinishsiz `class Savat:` qatorini topdi. `.gitattributes` da faylga tilga mos diff driver berilsa ([46-bob](46-gitattributes.md)), Git o'rnatilgan Python qoidasini ishlatadi:

```gitattributes
*.py diff=python
```

```text
$ git grep -p natija
hisob.py=    def jami(self):
hisob.py:        natija = 0
hisob.py:            natija += m.narx
hisob.py:        return natija
```

Git'da `python`, `java`, `golang`, `rust`, `php`, `ruby`, `cpp`, `csharp`, `css`, `html`, `markdown` kabi o'nlab tayyor driver bor (to'liq ro'yxat — `gitattributes` hujjatidagi "Defining a custom hunk-header" bo'limi). Bu sozlama bir vaqtning o'zida `git diff` hunk sarlavhalarini, `git grep -p/-W` ni va `git log -L :<funksiya>:` ni yaxshilaydi.

## Kod: regex turlari va mantiqiy ifodalar

`git grep` standart holatda **POSIX basic regex** ishlatadi. Opsiyalar:

| Opsiya | Rejim | Qachon |
| --- | --- | --- |
| `-G` (`--basic-regexp`) | Basic regex (standart) | `\(`, `\+` kabi eski sintaksis |
| `-E` (`--extended-regexp`) | Extended regex | `+`, `?`, `\|` alternativasi, `( )` guruh — zamonaviy sintaksis |
| `-P` (`--perl-regexp`) | Perl regex (PCRE) | `\d`, lookahead; Git PCRE bilan yig'ilgan bo'lishi kerak, aks holda xato |
| `-F` (`--fixed-strings`) | Oddiy matn | `*`, `.`, `[` kabi belgilarni so'zma-so'z qidirish |

Standart rejimni `grep.patternType` (`basic`, `extended`, `fixed`, `perl`) bilan o'zgartirish mumkin.

```text
$ git grep -n -E 'jami (\+|-)='
src/savat.js:9:    jami += hisoblaNarx(mahsulot.narx, mahsulot.soni)

$ git grep -n -F 'jami * 0.05'
src/narx.js:12:    return jami * 0.05
```

Boshqa foydali opsiyalar:

- `-i` — katta-kichik harfni farqlamaslik;
- `-w` — faqat to'liq so'z (`jami` qidirilsa, `savatJami` mos kelmaydi);
- `-v` — mos **kelmaydigan** qatorlar;
- `-m <n>` (`--max-count`) — har faylda ko'pi bilan n ta moslik;
- `-I` — binar fayllarni o'tkazib yuborish; `-a` — binarni ham matn deb o'qish;
- `-e <naqsh>` — keyingi argument naqsh ekanini aniq aytadi. `-` bilan boshlanadigan naqshlar uchun shart, skriptda foydalanuvchi kiritgan matn bilan qidirganda ham doim ishlating;
- `-f <fayl>` — naqshlarni fayldan (har qatorda bittadan) o'qish;
- `-q` — hech narsa chiqarmaslik, faqat chiqish kodi (0 — topildi, 1 — topilmadi).

### `--and`, `--or`, `--not` va qavslar

Bir nechta `-e` berilsa, ular standart holatda **yoki** (`--or`) bilan bog'lanadi. `--and` ikki shartning **bitta qatorda** bajarilishini talab qiladi; `--not` inkor qiladi. `--and` ning ustuvorligi `--or` dan yuqori, kerak bo'lsa qavs ishlatiladi (shell uchun `\(` `\)` deb ekranlanadi). Bunday ifodalarda har naqsh `-e` bilan berilishi shart.

```text
$ git grep -n -e function --and -e Narx
src/narx.js:4:function hisoblaNarx(narx, soni) {

$ git grep -n -e function --and --not -e Narx
src/narx.js:10:function chegirma(jami) {
src/savat.js:3:function savatJami(savat) {
```

Pro Git misoli (Git'ning o'z manbasida): `#define` bor **va** `LINK` yoki `BUF_MAX` bor qatorlar, eski `v1.8.0` tegida:

```bash
git grep --break --heading \
    -n -e '#define' --and \( -e LINK -e BUF_MAX \) v1.8.0
```

`--all-match` boshqacha ishlaydi: `--or` bilan bog'langan naqshlarning **hammasi faylning qaysidir qatorida** uchrashini talab qiladi (bitta qatorda bo'lishi shart emas):

```text
$ git grep --all-match -l -e chegirma -e SOLIQ
src/narx.js
```

### O'qishga qulay chiqish

`--heading` fayl nomini har qator oldiga emas, guruh tepasiga bir marta yozadi; `--break` turli fayllar orasiga bo'sh qator qo'yadi:

```text
$ git grep --break --heading -n jami
src/narx.js
5:  const jami = narx * soni
6:  const sof = jami - chegirma(jami)
10:function chegirma(jami) {
11:  if (jami > CHEGIRMA_CHEGARASI) {
12:    return jami * 0.05

src/savat.js
7:  let jami = 0
9:    jami += hisoblaNarx(mahsulot.narx, mahsulot.soni)
11:  return jami
```

`-O` (`--open-files-in-pager`) natijani emas, mos fayllarning o'zini pager yoki muharrirda ochadi (masalan `git grep -Ovim hisoblaNarx`).

## Kod: `git log -S` — satr qachon paydo bo'ldi

Endi "qachon" savoliga o'tamiz. `git log -S<satr>` faqat shu satrning **faylda nechta uchrashi o'zgargan** commit'larni ko'rsatadi — ya'ni satr qo'shilgan yoki o'chirilgan commit'larni. Asoslari [9-bob](09-tarixni-korish.md)da qisqa ko'rilgan edi; bu yerda chuqurroq.

```text
$ git log -S TODO --oneline
99b7c86 Bo'sh savatni tekshirish
aca6765 Savat moduli: savatJami
```

Javob darhol: `TODO` `aca6765` da qo'shilgan, `99b7c86` da o'chirilgan. `-p` bilan aynan o'sha o'zgarishni ko'ramiz:

```text
$ git log -S TODO --oneline -p
99b7c86 Bo'sh savatni tekshirish
diff --git a/src/savat.js b/src/savat.js
index 346f633..0d75232 100644
--- a/src/savat.js
+++ b/src/savat.js
@@ -1,7 +1,9 @@
 const { hisoblaNarx } = require('./narx')
 
-// TODO: bo'sh savatni tekshirish
 function savatJami(savat) {
+  if (savat.length === 0) {
+    return 0
+  }
   let jami = 0
   for (const mahsulot of savat) {
     jami += hisoblaNarx(mahsulot.narx, mahsulot.soni)
aca6765 Savat moduli: savatJami
diff --git a/src/savat.js b/src/savat.js
new file mode 100644
index 0000000..346f633
--- /dev/null
+++ b/src/savat.js
@@ -0,0 +1,12 @@
+const { hisoblaNarx } = require('./narx')
+
+// TODO: bo'sh savatni tekshirish
...
```

### Muhim nozik joy: "soni o'zgardi" — "qator o'zgardi" emas

`SOLIQ_FOIZI` konstantasining qiymati `aebd0d4` da 12 dan 15 ga o'zgargan. Lekin:

```text
$ git log -S SOLIQ_FOIZI --oneline
8155bc1 Narx hisoblash moduli
```

Faqat birinchi commit chiqdi. Sabab: `aebd0d4` da `SOLIQ_FOIZI` so'zi faylda avval ham 2 marta, keyin ham 2 marta uchraydi — **soni o'zgarmadi**. `-S` qatorlarga emas, sanoqqa qaraydi. Rasmiy hujjat aynan shunday ta'riflaydi: "satrning uchrash sonini o'zgartiradigan farqlar".

Bu kamchilik emas, maqsadli dizayn: `-S` "bu kod bo'lagi qachon tug'ildi va qachon o'ldi" degan savol uchun mo'ljallangan. Qiymat o'zgarishini ko'rish kerak bo'lsa — `-G`.

### `-S` bilan bo'lak kodning birinchi versiyasini topish

Rasmiy hujjat `-S` ni bunday ishlatishni tavsiya qiladi: aniq bir kod bo'lagining (masalan `struct` ning) kelib chiqishini topish uchun, `-S` ga uning hozirgi ko'rinishini bering, topilgan commit'dagi **eski** (preimage) ko'rinishini yana `-S` ga bering va shu tarzda bo'lakning eng birinchi versiyasigacha boring.

`-S` ga beriladigan satr regex emas, so'zma-so'z matn. Shuning uchun maxsus belgilarni ekranlash shart emas — aksincha, ekranlash xato natija beradi:

```text
$ git log -S 'jami * 0.05' --oneline
12d2254 Katta xaridga 5% chegirma

$ git log -S 'jami \* 0\.05' --oneline
$
```

Ikkinchi buyruq `\*` ni so'zma-so'z teskari chiziq sifatida qidirdi va hech narsa topmadi.

### `--pickaxe-regex`

`-S` ga regex berish kerak bo'lsa, `--pickaxe-regex` qo'shiladi — satr **POSIX extended regex** sifatida o'qiladi. Mantiq o'zgarmaydi: baribir mosliklar **soni** o'zgargan commit'lar chiqadi.

```text
$ git log -S 'jami \* 0\.0[0-9]' --pickaxe-regex --oneline
12d2254 Katta xaridga 5% chegirma
```

### Natijani cheklash va kengaytirish

- Pathspec bilan faqat ma'lum fayllardagi o'zgarishlar:

  ```text
  $ git log -S hisoblaNarx --oneline -- src/savat.js
  aca6765 Savat moduli: savatJami
  ```

- `--all` — faqat joriy branch emas, hamma branch va teglar tarixida qidirish.
- `-p`/`--stat` standart holatda faqat shartga mos **fayllarni** ko'rsatadi. `--pickaxe-all` commit'dagi **hamma** o'zgarishni ko'rsatadi — o'zgarishni to'liq kontekstda ko'rib chiqish uchun:

  ```text
  $ git log -S SOLIQ_FOIZI --oneline --pickaxe-all --stat
  8155bc1 Narx hisoblash moduli
   README.md   | 3 +++
   src/narx.js | 8 ++++++++
   2 files changed, 11 insertions(+)
  ```

  `--pickaxe-all` siz bu yerda faqat `src/narx.js` ko'rinardi.

- `-S` binar fayllarda ham qidiradi (rasmiy hujjat).

## Kod: `git log -G` — diff'ida naqsh bor commit'lar

`-G<regex>` boshqa savolga javob beradi: **diff'ida qo'shilgan yoki o'chirilgan qatori** regex'ga mos keladigan commit'lar. Sanoq muhim emas — mos qator diff'da `+` yoki `-` bilan chiqsa yetadi.

```text
$ git log -G SOLIQ_FOIZI --oneline
12d2254 Katta xaridga 5% chegirma
aebd0d4 Soliq foizini 15 ga oshirish
8155bc1 Narx hisoblash moduli
```

Endi `aebd0d4` (12 → 15) ham chiqdi: diff'ida `-const SOLIQ_FOIZI = 12` va `+const SOLIQ_FOIZI = 15` qatorlari bor. `12d2254` ham chiqdi, chunki u `return` qatorini qayta yozgan va u qatorda ham `SOLIQ_FOIZI` bor.

`-G` regex'i extended sintaksisda ishlaydi — `+` "bir yoki ko'p" ma'nosini beradi:

```text
$ git log -G 'SOLIQ_FOIZI = [0-9]+' --oneline
aebd0d4 Soliq foizini 15 ga oshirish
8155bc1 Narx hisoblash moduli
```

### `-S` va `-G` farqi bitta misolda

`chegirma` funksiyasi `12d2254` da qo'shilgan, `b84f365` da esa fayl ichida **pastga ko'chirilgan** (mazmuni deyarli o'zgarmagan):

```text
$ git log -S chegirma --oneline
12d2254 Katta xaridga 5% chegirma

$ git log -G chegirma --oneline
b84f365 Chegirma chegarasini konstantaga chiqarish
12d2254 Katta xaridga 5% chegirma
```

`b84f365` da `chegirma` so'zi soni o'zgarmadi — `-S` uni ko'rsatmaydi. Lekin diff funksiyani bir joydan o'chirib, boshqa joyga qo'shilgan qatorlar sifatida ko'rsatadi — `-G` uni topadi. Rasmiy `gitdiffcore` hujjati buni shunday baholaydi: `-S` fayl ichidagi ko'chirishni ta'rifiga ko'ra aniqlamaydi; `-G` esa aniqlaydi, va bu ko'pincha **shovqin**.

Rasmiy hujjatdagi klassik misol:

```diff
+    return frotz(nitfol, two->ptr, 1, 0);
...
-    hit = frotz(nitfol, mf2.ptr, 1, 0);
```

`git log -G"frotz\(nitfol"` bu commit'ni ko'rsatadi (mos qator qo'shilgan va o'chirilgan), `git log -S"frotz\(nitfol" --pickaxe-regex` esa ko'rsatmaydi (moslik soni 1 → 1).

| | `-S<satr>` | `-S<regex> --pickaxe-regex` | `-G<regex>` |
| --- | --- | --- | --- |
| Nimani taqqoslaydi | Satr soni: oldin va keyin | Regex mosliklari soni | Diff'dagi `+`/`-` qatorlar |
| Qiymat o'zgarishi (12 → 15) | Ko'rmaydi | Ko'rmaydi (agar son o'zgarmasa) | Ko'radi |
| Fayl ichida ko'chirish | Ko'rmaydi | Ko'rmaydi | Ko'radi (shovqin) |
| Narx | Arzonroq | Arzonroq | Qimmat: diff ikki marta hisoblanib, grep qilinadi |
| Binar fayllar | Qidiradi | Qidiradi | `--text` yoki textconv bo'lmasa o'tkazadi |

### `--find-object`: aniq blob qachon paydo bo'ldi

`-S` matn uchrashini sanaydi; `--find-object=<hash>` esa ma'lum **obyekt** (blob yoki submodule commit'i) uchrashini. "Fayl aynan shu ko'rinishda qaysi commit'da paydo bo'ldi va qaysi commit'da yo'qoldi" degan savolga javob beradi:

```text
$ git rev-parse v1.0:src/savat.js
346f63383ed09a3bef548faaaefd89cfbddf83ad
$ git log --oneline --find-object=346f63383ed09a3bef548faaaefd89cfbddf83ad
99b7c86 Bo'sh savatni tekshirish
aca6765 Savat moduli: savatJami
```

`v1.0` dagi `savat.js` blob'i `aca6765` da yaratilgan va `99b7c86` da boshqa blob bilan almashtirilgan. Bu `git fsck` topgan "osilib qolgan" blob qayerdan kelganini aniqlashda ham ishlatiladi ([42-bob](42-reflog-va-tiklash.md)).

## Kod: `git log --grep` — commit xabarida qidirish

`-S`/`-G` kod o'zgarishida qidiradi. `--grep` esa **commit xabarida**:

```text
$ git log --grep=chegirma --oneline
12d2254 Katta xaridga 5% chegirma

$ git log --grep=chegirma -i --oneline
b84f365 Chegirma chegarasini konstantaga chiqarish
12d2254 Katta xaridga 5% chegirma
```

`-i` (`--regexp-ignore-case`) katta-kichik harfni farqlamaydi. Bir nechta `--grep` — "yoki"; `--all-match` bilan — "va":

```text
$ git log --grep=savat -i --grep=soliq --oneline
99b7c86 Bo'sh savatni tekshirish
aebd0d4 Soliq foizini 15 ga oshirish
aca6765 Savat moduli: savatJami

$ git log --grep=savat -i --grep=bo --all-match --oneline
99b7c86 Bo'sh savatni tekshirish
```

`--invert-grep` — xabari mos **kelmaydigan** commit'lar:

```text
$ git log --grep=chegirma -i --invert-grep --oneline
99b7c86 Bo'sh savatni tekshirish
aebd0d4 Soliq foizini 15 ga oshirish
aca6765 Savat moduli: savatJami
8155bc1 Narx hisoblash moduli
```

Yaqin opsiyalar: `--author=<naqsh>`, `--committer=<naqsh>` (muallif/commit qiluvchi bo'yicha), `--grep-reflog=<naqsh>` (reflog yozuvi bo'yicha). Regex turini `-E`, `-F`, `-P` belgilaydi (standart — basic). Shu sababli commit xabarlarini aniq yozish ([10-bob](10-yaxshi-commit.md)) keyinchalik qidiruvni osonlashtiradi: `--grep=fix` faqat xabarda "fix" so'zi bo'lsa ishlaydi.

## Kod: `git log -L` — qator va funksiya tarixi

Pro Git `-L` ni "aqlbovar qilmas darajada foydali" deb ataydi. U bitta fayldagi **qator oralig'ining** yoki **funksiyaning** butun tarixini ko'rsatadi: har commit uchun faqat shu oraliqqa tegishli patch.

### Funksiya bo'yicha: `-L :<funksiya>:<fayl>`

```text
$ git log -L :hisoblaNarx:src/narx.js
commit 12d2254b84579c7fafee9a66409108f2cd74e0b5
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:15:00 2026 +0500

    Katta xaridga 5% chegirma

diff --git a/src/narx.js b/src/narx.js
index 1746dc2..b5dd836 100644
--- a/src/narx.js
+++ b/src/narx.js
@@ -3,6 +10,6 @@
 function hisoblaNarx(narx, soni) {
   const jami = narx * soni
-  return jami + jami * SOLIQ_FOIZI / 100
+  const sof = jami - chegirma(jami)
+  return sof + sof * SOLIQ_FOIZI / 100
 }
 
-module.exports = { hisoblaNarx }

commit 8155bc1fd854a658712484be98e40782666c8dde
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:00:00 2026 +0500

    Narx hisoblash moduli

diff --git a/src/narx.js b/src/narx.js
new file mode 100644
index 0000000..2dbe6c2
--- /dev/null
+++ b/src/narx.js
@@ -0,0 +3,5 @@
+function hisoblaNarx(narx, soni) {
+  const jami = narx * soni
+  return jami + jami * SOLIQ_FOIZI / 100
+}
+
```

Git funksiya chegarasini `git grep -p` bilan bir xil qoida orqali topadi: `hisoblaNarx` ga mos birinchi funksiya sarlavhasidan **keyingi funksiya sarlavhasigacha**. Shuning uchun oraliqqa funksiyadan keyingi bo'sh qator va `module.exports` qatori ham kirib qolgan (u boshida keyingi "funksiya sarlavhasi" — harf bilan boshlanadigan qator — bo'lmagan). `<funksiya>` — regex: `:^hisobla` kabi yozuv ham ishlaydi; `^:` bilan boshlansa, qidiruv faylning boshidan boshlanadi.

Tilga mos diff driver ([46-bob](46-gitattributes.md)) bu yerda ham aniqlikni oshiradi. Agar Git funksiyani topa olmasa, oraliqni o'zingiz bering.

### Qator raqamlari va regex bilan

`-L <boshlanish>,<oxir>:<fayl>`. Har chegara uch ko'rinishda bo'lishi mumkin:

| Ko'rinish | Ma'nosi |
| --- | --- |
| `<raqam>` | Aniq qator raqami (1 dan) |
| `/<regex>/` | Regex'ga mos birinchi qator (`^/<regex>/` — fayl boshidan qidiradi) |
| `+<n>` yoki `-<n>` | Faqat `<oxir>` uchun: boshlanishdan n qator keyin/oldin |

Bitta qatorning tarixi — masalan, soliq konstantasi:

```text
$ git log -L 1,1:src/narx.js --oneline
aebd0d4 Soliq foizini 15 ga oshirish
diff --git a/src/narx.js b/src/narx.js
index 2dbe6c2..1746dc2 100644
--- a/src/narx.js
+++ b/src/narx.js
@@ -1,1 +1,1 @@
-const SOLIQ_FOIZI = 12
+const SOLIQ_FOIZI = 15
8155bc1 Narx hisoblash moduli
diff --git a/src/narx.js b/src/narx.js
new file mode 100644
index 0000000..2dbe6c2
--- /dev/null
+++ b/src/narx.js
@@ -0,0 +1,1 @@
+const SOLIQ_FOIZI = 12
```

Pro Git'dagi regex shakli: `git log -L '/unsigned long git_deflate_bound/',/^}/:zlib.c` — "shu matnli qatordan keyingi `}` bilan boshlanadigan qatorgacha". Bizning loyihada:

```text
$ git log -L '/function chegirma/,/^}/:src/narx.js' --oneline
b84f365 Chegirma chegarasini konstantaga chiqarish
diff --git a/src/narx.js b/src/narx.js
index b5dd836..ea80cd2 100644
--- a/src/narx.js
+++ b/src/narx.js
@@ -16,0 +10,6 @@
+function chegirma(jami) {
+  if (jami > CHEGIRMA_CHEGARASI) {
+    return jami * 0.05
+  }
+  return 0
+}
```

E'tibor bering: `chegirma` aslida `12d2254` da yaratilgan, lekin `-L` tarixni `b84f365` da to'xtatdi. Sabab — o'sha commit'da funksiya fayl ichida ko'chirilgan, va diff uni "eski joydan o'chirildi, yangi joyga qo'shildi" deb ko'rsatgan. `-L` qatorlarni diff orqali kuzatadi, shuning uchun yangi joydagi qatorlar uchun ular "shu commit'da paydo bo'lgan". Bunday holatda eski joydan davom eting: `git log -L :chegirma:src/narx.js b84f365^` (ota commit'dan boshlab) yoki `git log -S`/`git blame -C` ([41-bob](41-blame-va-bisect.md)) bilan ko'chirishni kuzating.

### `-L` cheklovlari

Rasmiy hujjatdagi qoidalar, sinovda tasdiqlangan:

- `-L` bir necha marta berilishi mumkin — bir nechta oraliq yoki fayl birga kuzatiladi:

  ```text
  $ git log -L :savatJami:src/savat.js -L 1,1:src/narx.js --oneline --no-patch
  99b7c86 Bo'sh savatni tekshirish
  aebd0d4 Soliq foizini 15 ga oshirish
  aca6765 Savat moduli: savatJami
  8155bc1 Narx hisoblash moduli
  ```

- `-L` o'zi `--patch` ni yoqadi; `--no-patch` faqat commit'lar ro'yxatini qoldiradi. `--raw`, `--name-only`, `--name-status`, `--summary` ishlaydi, lekin `--stat` turidagi formatlar hali yo'q:

  ```text
  $ git log -L :hisoblaNarx:src/narx.js --oneline --stat
  fatal: -L does not yet support the requested diff format
  ```

- Pathspec bilan birga berib bo'lmaydi (fayl `-L` ichida allaqachon ko'rsatilgan):

  ```text
  $ git log -L :hisoblaNarx:src/narx.js -- src
  fatal: -L<range>:<file> cannot be used with pathspec
  ```

- Oraliq boshlang'ich revision'da mavjud bo'lishi kerak:

  ```text
  $ git log -L :yoq:src/narx.js
  fatal: -L parameter 'yoq' starting at line 1: no match
  ```

- Faqat bitta boshlang'ich revision'dan yurish mumkin (nol yoki bitta "musbat" revision).
- `--word-diff`, `--color-moved`, `-w`, `-b`, shuningdek `-S`, `-G` va `--diff-filter` `-L` bilan birga ishlaydi.

## Muhandislik nuqtai nazari: qaysi savolga qaysi vosita

| Savol | Buyruq |
| --- | --- |
| Funksiya qayerdan chaqiriladi? | `git grep -n -w nomi` |
| O'tgan relizda konfiguratsiya qanday edi? | `git grep -n KALIT v1.0` |
| API kaliti hech qachon commit qilinganmi? | `git log --all -S 'kalit-matni' --oneline` |
| Bu funksiya qachon o'chirildi? | `git log -S 'function nomi' --oneline` (eng yangi natija — o'chirilgan joy) |
| Konstanta qiymati qachon o'zgardi? | `git log -G 'KONSTANTA = ' --oneline` yoki `git log -L` |
| Bu funksiya qanday o'zgarib keldi? | `git log -L :nomi:fayl` |
| Bu qatorni oxirgi kim o'zgartirdi? | `git blame -L` ([41-bob](41-blame-va-bisect.md)) |
| Xato qaysi commit'da paydo bo'ldi? | `git bisect` ([41-bob](41-blame-va-bisect.md)) |
| "login" haqidagi commit'lar | `git log --grep=login -i` |

Bir necha amaliy fikr:

- **Avval `-S`, keyin `-G`.** `-S` arzonroq va natijasi toza (faqat paydo bo'lish/yo'qolish). `-G` har commit uchun diff'ni ikki marta hisoblab grep qiladi — katta repo'da sekin va ko'chirishlar tufayli shovqinli. `-S` yetmasa (qiymat o'zgarishi kerak bo'lsa) `-G` ga o'ting.
- **Qidiruvni pathspec bilan toraytiring.** `git log -G regex -- src/` faqat kerakli fayllarning diff'ini hisoblaydi — tezlik farqi katta repo'da sezilarli.
- **Maxfiy ma'lumot qidirishda `--all`.** Kalit boshqa branch'da yoki tegda qolgan bo'lishi mumkin. Topilsa — kalitni darhol bekor qiling (rotate); tarixdan olib tashlash ([42-bob](42-reflog-va-tiklash.md)) yetarli emas, chunki u allaqachon boshqalarning nusxalarida bor.
- **`git grep` va yig'ilgan fayllar.** `git grep` faqat kuzatiladigan fayllarni ko'radi: `dist/`, `node_modules/` kabi ignore qilingan papkalar natijani ifloslantirmaydi. Agar ular sizga kerak bo'lsa — `--untracked --no-exclude-standard`.
- **Skriptda `git grep -q` va `-e`.** Pre-commit hook'ida ([47-bob](47-hooklar.md)) `git grep --cached -q -e 'console.log'` — "index'da shu narsa bormi" degan tez tekshiruv; `--cached` muhim, chunki commit'ga index tushadi, working tree emas.
- **Funksiya sarlavhasi uchun `.gitattributes`.** `*.py diff=python` kabi bir qator `grep -p/-W`, `log -L :funksiya:`, `diff` hunk sarlavhalarini birdan yaxshilaydi. Jamoa repo'sida commit qilib qo'ying.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Qiymat o'zgarishini `git log -S KONSTANTA` bilan qidirish | `-S` faqat satr soni o'zgarganini ko'radi; `12 → 15` o'zgarishi chiqmaydi | `git log -G 'KONSTANTA = '` yoki `git log -L` |
| `-S` ga regex belgilarini ekranlab berish (`'a \* b'`) | `-S` so'zma-so'z qidiradi — teskari chiziq ham matnning qismi bo'lib qoladi | So'zma-so'z yozing yoki `--pickaxe-regex` qo'shing |
| Hamma tarixda qidirish uchun `git grep ... $(git rev-list --all)` | Katta repo'da argumentlar juda ko'p, har commit to'liq qayta qidiriladi | "Qachon" savoli uchun `git log -S`/`-G` |
| Commit qilinmagan o'zgarishni `--cached` bilan qidirish | `--cached` index'ni o'qiydi; `add` qilinmagan qator topilmaydi | Standart rejim (working tree) yoki avval `git add` |
| Yangi fayl `git grep` da chiqmayapti deb hayron bo'lish | Untracked fayllar standart holatda qidirilmaydi | `--untracked` (ignore qilinganlar uchun `--no-exclude-standard`) |
| `-` bilan boshlanadigan naqshni `-e` siz berish | Git uni opsiya deb o'qiydi | `git grep -e '-foo'` |
| `git log -L` ga `--stat` yoki pathspec qo'shish | Hozircha qo'llab-quvvatlanmaydi — `fatal` | `--no-patch`, `--name-only`; fayl faqat `-L` ichida |
| `-L :funksiya:` bilan tarix "kesilib qolishi" | Funksiya fayl ichida ko'chirilgan joyda `-L` uni yangi qo'shilgan deb ko'radi | Ota commit'dan qayta `-L`, yoki `log -S`, `blame -C` |
| Python/Java'da `-p`/`-L :metod:` noto'g'ri funksiyani ko'rsatadi | Standart qoida chekinishli metodlarni tanimaydi | `.gitattributes` da `diff=python`, `diff=java` |
| `git grep -L` ni `git log -L` deb o'ylash | Birinchisi — moslik yo'q fayllar ro'yxati, ikkinchisi — qator tarixi | Kontekstga qarab o'qing |

## Amaliyot

1. Kichik repo yarating, kamida 4 ta commit'da bitta funksiya va bitta konstantani o'zgartiring. `git grep -n`, `-c`, `-l`, `-L`, `--heading --break` chiqishlarini solishtiring.
2. Bir faylga commit qilinmagan qator qo'shing, yana bir untracked fayl yarating. Shu qatorni `git grep`, `git grep --cached`, `git grep --untracked` bilan qidirib, natijalar nega farq qilishini tushuntiring.
3. Eski tegda (`git tag v0.1 HEAD~3`) konstanta qiymatini `git grep` bilan toping — `switch` ishlatmang.
4. Konstanta qiymatini o'zgartirgan commit'ni avval `git log -S`, keyin `git log -G` bilan qidiring. Nega `-S` uni ko'rsatmasligini sanoq orqali isbotlang (`git show <commit>` dagi qatorlarni sanang).
5. Bitta funksiyani fayl ichida boshqa joyga ko'chirib commit qiling. `log -S nomi` va `log -G nomi` natijalarini solishtiring; keyin `git log -L :nomi:fayl` tarixni qayerda to'xtatishini ko'ring va ota commit'dan davom ettiring.
6. Python faylida klass metodlarini yozing. `git grep -p` va `git log -L :metod:fayl.py` ni `.gitattributes` siz va `*.py diff=python` bilan ishlatib, farqni yozib qo'ying.
7. (Qiyinroq) `git grep --cached -q -e` asosida `pre-commit` hook yozing: index'da `console.log` yoki `debugger` bo'lsa commit'ni to'xtatsin. Keyin `git log --all -S debugger --oneline` bilan bu so'z tarixda qachon kirib, qachon chiqib ketganini toping va har birini `git show` bilan tekshiring.

## Rasmiy hujjat

- Pro Git — Git Tools: Searching: <https://git-scm.com/book/en/v2/Git-Tools-Searching>
- `git grep`: <https://git-scm.com/docs/git-grep>
- `git log` (`-S`, `-G`, `--pickaxe-regex`, `--pickaxe-all`, `--find-object`, `-L`, `--grep`): <https://git-scm.com/docs/git-log>
- `gitdiffcore` — diffcore-pickaxe: <https://git-scm.com/docs/gitdiffcore>
- `gitattributes` — Defining a custom hunk-header: <https://git-scm.com/docs/gitattributes#_defining_a_custom_hunk_header>
