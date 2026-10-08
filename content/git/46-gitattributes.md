# 46 — `.gitattributes`

[← Oldingi: `git config` chuqur](45-config-chuqur.md) · [Mundarija](README.md) · [Keyingi: Hook'lar →](47-hooklar.md)

## Tushuncha

[45-bobda](45-config-chuqur.md) ko'rgan sozlamalar butun repo'ga (yoki butun kompyuterga) ta'sir qiladi: `core.autocrlf` hamma faylning qator oxirini o'zgartiradi, `core.whitespace` hamma faylni bir xil qoida bilan tekshiradi. Lekin ko'pincha qoida **faylga qarab** farq qilishi kerak: `.sh` skript doim LF bilan, `.bat` doim CRLF bilan; `.png` hech qachon "matn" deb o'zgartirilmasin; `package-lock.json` diff'da ko'rsatilmasin; `database.xml` merge'da hech qachon boshqa branch'dan olinmasin.

Buning uchun Git'da **atributlar** (attributes) bor. **Atribut** — Git ma'lum yo'lga (fayl yoki papkaga) "yopishtiradigan" yorliq: "bu fayl matn", "bu faylni diff qilishda `python` qoidasidan foydalan", "bu fayl arxivga kirmasin". O'xshatish: omborxonadagi qutilarga yopishtirilgan stikerlar — "ehtiyot bo'ling, shisha", "ag'darmang". Yuk tashuvchi (Git) qutini ko'rganda stikerga qarab ishlaydi.

Atributlar oddiy matn faylida yoziladi. Har qator — **pattern** va undan keyin bo'sh joy bilan ajratilgan atributlar ro'yxati:

```text
pattern  atribut1 atribut2 ...
```

Pattern berilgan yo'lga mos kelsa, qatordagi atributlar o'sha yo'lga beriladi. Har atribut yo'l uchun to'rt holatdan birida bo'ladi:

| Holat | Yozilishi | `git check-attr` chiqishi | Ma'nosi |
| --- | --- | --- | --- |
| Set (yoqilgan) | `text` | `set` | "ha" — maxsus qiymat true |
| Unset (o'chirilgan) | `-text` | `unset` | "yo'q" — maxsus qiymat false |
| Qiymat berilgan | `diff=python` | `python` | aniq satr qiymati |
| Unspecified (aytilmagan) | `!text` yoki umuman yozilmagan | `unspecified` | hech kim hech narsa demagan — Git standart xatti-harakatini qiladi |

Uchinchi va to'rtinchi holat orasidagi farq muhim: `-text` "bu matn emas, konvertatsiya qilma" deydi, aytilmagan `text` esa "o'zing hal qil (`core.autocrlf` ga qara)" degani.

Pro Git atributlarni uch katta vazifa uchun ishlatadi: binar fayllarni tanitish va ularni diff qilish, kalit so'zlarni almashtirish (filtrlar), eksport va merge strategiyalari. Ma'lumotnoma (`gitattributes(5)`) esa ularni Git'ning qaysi amaliga ta'sir qilishiga qarab guruhlaydi — bu bob shu tartibda boradi:

| Amal | Atributlar | Bo'lim |
| --- | --- | --- |
| Checkout va check-in (`add`/`commit`/`switch`/`restore`) | `text`, `eol`, `working-tree-encoding`, `ident`, `filter` | Qator oxirlari, kodlash, filtrlar |
| Diff yaratish | `diff` (va `diff.<nom>.*` sozlamalari) | Binar fayllar, textconv, funksiya sarlavhalari |
| Uch tomonlama merge | `merge`, `conflict-marker-size` | Merge driver'lar |
| Whitespace tekshiruvi | `whitespace` | `whitespace` atributi |
| Arxiv yaratish (`git archive`) | `export-ignore`, `export-subst` | Eksport |
| Obyektlarni pack qilish | `delta` | Boshqa atributlar |
| GUI vositalar | `encoding` | Boshqa atributlar |

## Nega shunday: nega bu qoidalar config'da emas, alohida faylda?

Config — **shaxsiy** narsa: u `.git/config` yoki `~/.gitconfig` da turadi, commit qilinmaydi, `clone` bilan kelmaydi. `.gitattributes` esa oddiy fayl sifatida **commit qilinadi** va repo bilan birga hamma joyga boradi. "`.sh` doim LF" — bu loyihaning qoidasi, shaxsning emas; u hamma klonda bir xil ishlashi kerak. Shuning uchun u repo ichida.

Ikkinchi sabab — **yo'lga bog'liqlik**. Config kalitlarida pattern yo'q: `core.autocrlf` "hamma fayl" deydi. Atributlar esa `.gitignore` kabi pattern bilan ishlaydi va har papkada o'z `.gitattributes` fayli bo'lishi mumkin.

Lekin bir narsa ataylab config'da qoladi: **buyruqlar**. `.gitattributes` faqat driver **nomini** aytadi (`diff=zip`, `filter=dater`, `merge=saralab`), shu nom ostida qaysi dastur ishga tushishi esa `diff.zip.textconv`, `filter.dater.clean`, `merge.saralab.driver` kabi config kalitlarida yoziladi. Sabab — xavfsizlik ([45-bob](45-config-chuqur.md), [3-bob](03-birinchi-sozlash.md)): agar commit qilingan fayl buyruq bera olganida, begona repo'ni klon qilishning o'zi sizning kompyuteringizda dastur ishga tushirgan bo'lardi. Narxi — Pro Git ogohlantiradi: `.gitattributes` repo bilan keladi, driver esa kelmaydi, shuning uchun driver'li qoidalar har kompyuterda alohida sozlanadi va ular **yo'q bo'lganda ham** loyiha ishlashi kerak.

## Kod: fayl sintaksisi va `git check-attr`

Sinov uchun oddiy repo va bitta `.gitattributes`:

```text
$ cat .gitattributes
# izoh
*.txt   text
*.c     diff=cpp whitespace=tab-in-indent
*.png   binary
doc/    -diff
"doc/g*.md" foo=bar
```

Qaysi faylga nima tushganini `git check-attr` ko'rsatadi. `-a` (`--all`) — yo'lga tegishli **hamma** atributlar (aytilmaganlar chiqmaydi):

```text
$ git check-attr -a -- a.txt src/main.c doc/guide.md doc/rasm.png README
a.txt: text: set
src/main.c: diff: cpp
src/main.c: whitespace: tab-in-indent
doc/guide.md: foo: bar
doc/rasm.png: binary: set
doc/rasm.png: diff: unset
doc/rasm.png: merge: unset
doc/rasm.png: text: unset
```

Kuzatishlar:

- `README` — chiqishda umuman yo'q: hech bir pattern unga mos kelmadi.
- `foo=bar` — Git bunday atributni bilmaydi, lekin baribir saqlaydi va ko'rsatadi. Atribut nomlari erkin; tashqi vositalar (masalan GitHub'ning `linguist-generated`) ham shu mexanizmdan foydalanadi.
- `binary` bitta yozilgan bo'lsa ham, to'rtta qator chiqdi — u **makro atribut**, pastda ko'ramiz.
- `"doc/g*.md"` — qo'shtirnoq bilan boshlangan pattern C uslubida qo'shtirnoqlangan deb o'qiladi (bo'sh joyli yoki maxsus belgili nomlar uchun).
- `doc/guide.md` da `diff: unset` **yo'q**. `doc/ -diff` qatori ishlamadi — buni keyingi bo'limda tushuntiramiz.

Faqat bitta yoki bir nechta atributni so'rash ham mumkin. Bunda aytilmagan atributlar ham `unspecified` deb chiqadi:

```text
$ git check-attr diff text -- src/main.c
src/main.c: diff: cpp
src/main.c: text: unspecified
```

`--` dan oldingi hamma narsa atribut nomi, keyingisi — yo'llar. `--`, `-a` yoki `--stdin` ishlatilmasa, birinchi argument atribut, qolganlari yo'l deb olinadi.

### Pattern'lar: `.gitignore` bilan o'xshashlik va farqlar

Ma'lumotnoma aytadi: pattern'lar `.gitignore` dagi qoidalar bilan bir xil ishlaydi ([8-bob](08-gitignore-rm-mv.md) — `*`, `?`, `[a-z]`, `**`, boshidagi va o'rtadagi `/` ning "bog'lash" ma'nosi), **ikki istisno** bilan:

**1. Inkor (`!pattern`) taqiqlangan.** `.gitignore` da `!` faylni "qaytarib oladi", bu yerda esa butun qator e'tiborsiz qoldiriladi:

```text
$ echo '!*.md text' >> .gitattributes
$ git check-attr -a -- doc/guide.md
warning: Negative patterns are ignored in git attributes
Use '\!' for literal leading exclamation.
doc/guide.md: diff: unset
doc/guide.md: foo: bar
```

Atributlarda "istisno" kerak bo'lsa, keyinroq qatorda shu atributni boshqacha qiymat bilan bering (`*.md text`, keyin `CHANGELOG.md -text`) yoki `!text` bilan "aytilmagan" holatga qaytaring. `!` ning bu ikkinchi ma'nosi — atribut **nomi** oldida, pattern oldida emas.

**2. Papkaga mos pattern uning ichiga "o'tmaydi".** `.gitignore` da `doc/` butun papkani chiqarib tashlaydi, chunki Git chiqarilgan papka ichiga umuman kirmaydi. Atributlar esa har fayl uchun alohida hisoblanadi, va `doc/` pattern'i faqat **papkaning o'ziga** mos keladi, ichidagi fayllarga emas. Shuning uchun yuqorida `doc/guide.md` ga `-diff` tushmadi. Ma'lumotnoma: atributlarda `path/` yozish ma'nosiz, `path/**` yozing:

```text
$ sed -i '' 's#^doc/ .*#doc/**  -diff#' .gitattributes
$ git check-attr diff -- doc/guide.md doc
doc/guide.md: diff: unset
doc: diff: unspecified
```

Bitta istisno bor — `export-ignore`, u papkaning o'ziga qo'yilganda ma'noga ega (eksport bo'limida sinaymiz).

Qolgan qoidalar `.gitignore` dagidek: `#` — izoh, bo'sh qator — ajratuvchi, `/` siz pattern (`*.c`) istalgan chuqurlikdagi faylga mos keladi, `/` li pattern (`/tests`, `src/*.c`) `.gitattributes` turgan papkaga nisbatan hisoblanadi.

## Kod: ustunlik — bir nechta qator va bir nechta fayl

Bitta yo'lga bir nechta qator mos kelsa, **keyingi qator g'olib**, va bu har atribut uchun alohida hisoblanadi: `*.c diff=cpp` dan keyin `main.c -diff` kelsa, `main.c` ning faqat `diff` atributi o'zgaradi, boshqalari qoladi.

Atributlar to'rt joydan o'qiladi. Ustunlik yuqoridan pastga kamayadi:

| Joy | Kim uchun | Commit qilinadimi |
| --- | --- | --- |
| `$GIT_DIR/info/attributes` (`.git/info/attributes`) | Faqat shu repo, faqat siz | Yo'q |
| Yo'l turgan papkadagi `.gitattributes`, keyin ota papkalardagilar — ildizgacha | Hamma | Ha |
| `core.attributesFile` (standart: `$XDG_CONFIG_HOME/git/attributes`, u bo'sh bo'lsa `~/.config/git/attributes`) | Siz, hamma repo'larda | Yo'q |
| `$(prefix)/etc/gitattributes` | Kompyuterdagi hamma foydalanuvchi | Yo'q |

Diqqat: tartib `.gitignore` dagiga **o'xshamaydi**. Ignore'da `.git/info/exclude` ichki `.gitignore` lardan *past* turadi ([8-bob](08-gitignore-rm-mv.md)); atributlarda esa `info/attributes` **eng yuqori** — u commit qilingan qoidalarni shaxsan siz uchun bosib ketish uchun mo'ljallangan. Ichki `.gitattributes` lar orasida esa qoida tanish: yo'lga qanchalik yaqin bo'lsa, shunchalik kuchli.

Ma'lumotnomadagi misolni aynan qayta quramiz — uchta fayl:

```text
$ cat .git/info/attributes
a*	foo !bar -baz
$ cat .gitattributes
abc	foo bar baz
$ cat t/.gitattributes
ab*	merge=filfre
abc	-foo -bar
*.c	frotz
$ git check-attr foo bar baz merge frotz -- t/abc
t/abc: foo: set
t/abc: bar: unspecified
t/abc: baz: unset
t/abc: merge: filfre
t/abc: frotz: unspecified
```

Git `t/abc` uchun bunday hisoblaydi:

1. `t/.gitattributes` (eng yaqin): `ab*` — `merge=filfre`; `abc` — `foo` va `bar` o'chirildi. `*.c` mos kelmaydi.
2. `.gitattributes` (ota papka): `abc foo bar baz` mos keladi, lekin `foo`, `bar`, `merge` ni yaqinroq fayl allaqachon hal qilgan — faqat `baz` yoqiladi.
3. `.git/info/attributes` (eng kuchli): `a*` — bu pattern `/` siz, shuning uchun `t/abc` nomiga ham mos keladi. `foo` yoqiladi, `bar` **aytilmagan** holatga qaytariladi (`!bar`), `baz` o'chiriladi.

`-a` bilan esa aytilmagan `bar` va `frotz` umuman chiqmaydi:

```text
$ git check-attr -a -- t/abc
t/abc: merge: filfre
t/abc: foo: set
t/abc: baz: unset
```

Global faylni sinash uchun `core.attributesFile` ni bir martalik `-c` bilan beramiz (o'z `~/.config/git/attributes` faylingizda xuddi shunday ishlaydi):

```text
$ cat ../46-global-attributes
*.c whitespace=-blank-at-eol
*.log -text
$ git -c core.attributesFile=../46-global-attributes check-attr -a -- t/k.c x.log
t/k.c: whitespace: -blank-at-eol
t/k.c: frotz: set
x.log: text: unset
```

`core.attributesFile` ning o'zi [45-bobda](45-config-chuqur.md) `core.excludesFile` bilan birga tilga olingan. Unga faqat shaxsiy, hamma repo'da kerak bo'ladigan narsalarni yozing (masalan, o'zingiz ishlatadigan `diff=` driver'lar). Loyiha qoidasi bo'lsa — repo'dagi `.gitattributes` ga.

### Qaysi `.gitattributes`: working tree, index yoki commit

Odatda Git working tree'dagi `.gitattributes` ni o'qiydi. Ma'lumotnoma ikki nozik qoidani aytadi: working tree'da fayl bo'lmasa, index'dagisi o'qiladi; **checkout** paytida esa teskari — avval index'dagi (ya'ni yangi kelayotgan) `.gitattributes`, so'ng working tree'dagisi. Shu sababli branch almashganda yangi branch'ning qoidalari darhol ishlaydi.

`git check-attr` buni tanlash imkonini beradi:

```text
$ git check-attr text -- t/a.jpg
t/a.jpg: text: set
$ git check-attr --cached text -- t/a.jpg
t/a.jpg: text: unset
$ git check-attr --source=HEAD text -- t/a.jpg
t/a.jpg: text: unset
```

Bu yerda working tree'dagi `.gitattributes` ga `*.jpg text` yozilgan, lekin hali `add` qilinmagan; commit qilingan versiyada `*.jpg` binar. `--cached` — faqat index'dagi qoidalar, `--source=<tree-ish>` — istalgan commit/branch/tag'dagi qoidalar (masalan, bare repo'da yoki server hook'ida, [47-bob](47-hooklar.md), working tree yo'q joyda).

Yana ikki foydali opsiya: `--stdin` (yo'llarni standart kirishdan, qatorma-qator) va `-z` (skriptlar uchun NUL bilan ajratilgan chiqish):

```text
$ printf 't/a.jpg\nt/k.c\n' | git check-attr --stdin -a
t/a.jpg: text: set
t/a.jpg: foo: set
t/a.jpg: baz: unset
t/k.c: frotz: set
```

**Symlink kuzatilmaydi.** Ma'lumotnoma: Git working tree'dagi `.gitattributes` symlink bo'lsa, unga ergashmaydi (index yoki tree'dan o'qilganda bilan bir xil natija bo'lishi uchun):

```text
$ readlink .gitattributes
../46-tashqi-attr
$ git check-attr text -- a.txt
warning: unable to access '.gitattributes': Too many levels of symbolic links
a.txt: text: unspecified
```

### `builtin_objectmode` va pathspec'da atributlar

`builtin_*` nomlari Git'ning o'zi uchun band qilingan. Hozircha bittasi bor — `builtin_objectmode`, faylning index'dagi rejimi (`100644`, `100755`, `120000` symlink, `160000` submodule, `40000` papka):

```text
$ git check-attr builtin_objectmode -- t/k.c t/link t/abc
t/k.c: builtin_objectmode: 100755
t/link: builtin_objectmode: 120000
t/abc: builtin_objectmode: 100644
```

Atributlar **pathspec** ichida ham ishlatiladi — `:(attr:...)` sehrli so'zi bilan ([8-bob](08-gitignore-rm-mv.md), [40-bob](40-qidiruv.md)dagi `:!` kabi). Masalan, hamma bajariladigan fayllar yoki `frotz` atributli fayllar:

```text
$ git ls-files ':(attr:builtin_objectmode=100755)'
t/k.c
$ git ls-files ':(attr:frotz)'
t/k.c
$ git ls-files ':(attr:merge=filfre)'
t/abc
```

Bu `git grep`, `git log`, `git add` va pathspec qabul qiladigan boshqa buyruqlarda ham ishlaydi. `:(attr:-text)` — o'chirilgan, `:(attr:!text)` — aytilmagan.

### Makro atributlar

Binar fayl uchun odatda uchta narsa kerak: qator oxiri o'zgartirilmasin (`-text`), diff ko'rsatilmasin (`-diff`), merge qilinmasin (`-merge`). Har safar uchtasini yozish o'rniga **makro** bor. Git'da tayyor makro — `binary`:

```ini
[attr]binary -diff -merge -text
```

O'zingiz ham makro e'lon qilishingiz mumkin — `[attr]<nom>` bilan boshlangan qator:

```text
$ cat .gitattributes
[attr]rasm -diff -merge -text
*.jpg rasm
$ git check-attr -a -- t/a.jpg
t/a.jpg: diff: unset
t/a.jpg: merge: unset
t/a.jpg: text: unset
t/a.jpg: rasm: set
...
```

Makro faqat **yuqori darajadagi** fayllarda e'lon qilinadi: `.git/info/attributes`, ildizdagi `.gitattributes`, global va tizim fayllari. Ichki papkada e'lon qilsangiz, Git rad etadi va har buyruqda ogohlantiradi:

```text
$ cat t/.gitattributes
[attr]boshqa -diff
*.c boshqa
$ git check-attr -a -- t/k.c
[attr]boshqa -diff not allowed: t/.gitattributes:1
t/k.c: boshqa: set
```

`boshqa` oddiy (ma'nosiz) atribut sifatida yoqildi, lekin `-diff` tushmadi. Makro faqat "Set" holatida bo'ladi (`-binary` ma'nosiz), lekin uning ichidagi atributlar yoqilishi, o'chirilishi yoki `!` bilan aytilmagan holatga qaytarilishi mumkin.

## Kod: qator oxirlari — `text`, `eol`, `text=auto`

[45-bobda](45-config-chuqur.md) CRLF/LF muammosi va `core.autocrlf` ni ko'rdik, va u yerda zamonaviy tavsiya aytildi: siyosatni repo'ning o'zida, `.gitattributes` da belgilash. Endi shu.

`text` atributi faylni **matn** deb belgilaydi va qator oxiri konvertatsiyasini yoqadi: `add` paytida index'ga CRLF → LF (**normallashtirish** — repo ichida hamma matn bir xil, LF bilan saqlanadi), checkout'da esa kerak bo'lsa LF → CRLF.

| `text` holati | Ma'nosi |
| --- | --- |
| `text` | Matn. Har check-in'da LF ga normallashtiriladi — hatto ilgari CRLF bilan commit qilingan bo'lsa ham |
| `-text` | Hech qachon konvertatsiya qilinmasin |
| `text=auto` | Git o'zi aniqlasin: matn bo'lsa va repo'da **allaqachon CRLF bilan saqlanmagan** bo'lsa — konvertatsiya; aks holda tegmaydi |
| aytilmagan | `core.autocrlf` ga qaraladi ([45-bob](45-config-chuqur.md)) |

`eol` — working tree'dagi qator oxiri: `eol=lf` (index'dagidek, LF) yoki `eol=crlf`. U faqat `text` yoki `text=auto` bilan ishlaydi; agar `text` aytilmagan bo'lsa, `eol` yozilishining o'zi `text` ni yoqadi. `eol` aytilmagan bo'lsa — `core.autocrlf`/`core.eol`, ular ham yo'q bo'lsa — Windows'da `crlf`, boshqa joyda `lf`.

### Sinov: mavjud repo'ga qoida qo'shish

Atributsiz repo — to'rt fayl: CRLF matn, LF matn, CRLF skript va kichik binar:

```text
$ git ls-files --eol
i/-text w/-text attr/                 	rasm.png
i/crlf  w/crlf  attr/                 	run.sh
i/lf    w/lf    attr/                 	unix.txt
i/crlf  w/crlf  attr/                 	win.txt
```

`git ls-files --eol` uch ustun beradi: `i/` — index'dagi blob, `w/` — diskdagi fayl (`lf`, `crlf`, `mixed`, `none` — qator oxiri yo'q, `-text` — binar deb topildi), `attr/` — shu fayl uchun amaldagi qoida. Hozir `attr/` bo'sh: hech qanday qoida yo'q, CRLF'lar index'ga o'zgarishsiz tushgan. Qoida qo'shamiz:

```text
$ cat .gitattributes
* text=auto
*.sh text eol=lf
*.bat text eol=crlf
*.png binary
$ git ls-files --eol
i/-text w/-text attr/-text            	rasm.png
i/crlf  w/crlf  attr/text eol=lf      	run.sh
i/lf    w/lf    attr/text=auto        	unix.txt
i/crlf  w/crlf  attr/text=auto        	win.txt
$ git status --short
 M run.sh
?? .gitattributes
```

Ikki xil xatti-harakat ko'rinadi:

- `run.sh` — `text` **qat'iy** yoqilgan. Index'dagi CRLF blob endi "noto'g'ri", shuning uchun `status` uni o'zgargan deb ko'rsatadi, garchi diskda hech narsa o'zgarmagan bo'lsa ham.
- `win.txt` — `text=auto`. Fayl repo'da **allaqachon CRLF bilan** turibdi, shuning uchun `auto` unga tegmaydi va `status` toza. Bu ataylab qilingan: `* text=auto` ni qo'shish butun repo'ni birdaniga "o'zgargan" qilib yubormasligi uchun.

Lekin jamoada odatda aynan normallashtirish kerak. Buning uchun ma'lumotnomadagi tartib — toza working tree'dan `git add --renormalize .`:

```text
$ git add --renormalize .
$ git status --short
M  run.sh
M  win.txt
?? .gitattributes
$ git ls-files --eol
i/-text w/-text attr/-text            	rasm.png
i/lf    w/crlf  attr/text eol=lf      	run.sh
i/lf    w/lf    attr/text=auto        	unix.txt
i/lf    w/crlf  attr/text=auto        	win.txt
```

`--renormalize` hamma kuzatilayotgan faylga "clean" jarayonini **qaytadan** qo'llab, index'ga majburan qayta qo'shadi — shuning uchun `text=auto` dagi `win.txt` ham endi normallashdi (`i/lf`). E'tibor bering: `.gitattributes` hali `??`. Ma'lumotnoma bo'yicha `--renormalize` `-u` ni nazarda tutadi, ya'ni faqat **kuzatilayotgan** fayllar bilan ishlaydi. Uni alohida qo'shish kerak — aks holda commit'da normallashtirilgan fayllar bo'ladi, qoidaning o'zi esa bo'lmaydi:

```text
$ git add .gitattributes
$ git commit -q -m "Qator oxirlarini normallashtirish"
$ git cat-file -p HEAD:win.txt | od -c
0000000    s   a   l   o   m  \n   d   u   n   y   o  \n
0000014
$ od -c win.txt
0000000    s   a   l   o   m  \r  \n   d   u   n   y   o  \r  \n
0000016
```

Blob'da LF, diskda hali eski CRLF (`w/crlf`) — Git working tree'ga `add` paytida tegmaydi. Fayllar keyingi checkout'da yangilanadi:

```text
$ rm win.txt run.sh unix.txt
$ git checkout -q -- .
$ git ls-files --eol
i/-text w/-text attr/-text            	rasm.png
i/lf    w/lf    attr/text eol=lf      	run.sh
i/lf    w/lf    attr/text=auto        	unix.txt
i/lf    w/lf    attr/text=auto        	win.txt
```

macOS'da `text=auto` uchun working tree'dagi standart — LF. Windows'da xuddi shu repo `win.txt` ni CRLF bilan chiqargan bo'lardi, `run.sh` esa `eol=lf` tufayli u yerda ham LF.

Windows'ga mo'ljallangan `.bat` uchun teskarisi — diskda doim CRLF, platformadan qat'i nazar:

```text
$ printf '@echo off\necho ok\n' > start.bat
$ git add start.bat
warning: in the working copy of 'start.bat', LF will be replaced by CRLF the next time Git touches it
$ git ls-files --eol start.bat
i/lf    w/lf    attr/text eol=crlf    	start.bat
$ rm start.bat; git checkout -q -- start.bat
$ od -c start.bat
0000000    @   e   c   h   o       o   f   f  \r  \n   e   c   h   o    
0000020    o   k  \r  \n
0000024
```

### `.gitattributes` va `core.autocrlf`: kim ustun

Atribut aniq aytilgan joyda `core.autocrlf` faqat "aytilmagan" qismga ta'sir qiladi. `core.autocrlf=true` bilan checkout:

```text
$ git -c core.autocrlf=true check-attr text eol -- unix.txt run.sh
unix.txt: text: auto
unix.txt: eol: unspecified
run.sh: text: set
run.sh: eol: lf
$ rm unix.txt run.sh; git -c core.autocrlf=true checkout -q -- unix.txt run.sh
$ od -c unix.txt; od -c run.sh
0000000    b   i   r  \r  \n   i   k   k   i  \r  \n
0000013
0000000    #   !   /   b   i   n   /   s   h  \n   e   c   h   o       o
0000020    k  \n
0000022
```

`unix.txt` da `eol` aytilmagan — `core.autocrlf=true` uni CRLF qildi. `run.sh` da `eol=lf` bor — `core.autocrlf` unga ta'sir qilmadi. Shu sababli Windows'dagi hamkasbning `core.autocrlf=true` sozlamasi `.sh` skriptlarni buzmaydi (CRLF'li skript Linux'da `/bin/sh^M: bad interpreter` bilan yiqiladi).

| | `core.autocrlf` ([45-bob](45-config-chuqur.md)) | `text` / `eol` atributlari |
| --- | --- | --- |
| Qayerda | Shaxsiy config | Commit qilingan `.gitattributes` |
| Kimga ta'sir | Faqat sozlagan odamga | Klon qilgan hammaga |
| Fayl turi bo'yicha | Yo'q — hamma fayl | Ha — pattern bilan |
| Ilgari CRLF bilan commit qilingan fayl | Tegmaydi (`true` = `text=auto` + `core.eol=crlf`) | `text` — majburan normallashtiradi; `text=auto` — tegmaydi |
| Ustunlik | Faqat `text`/`eol` aytilmagan joyda | Ustun |

### `eol` yolg'iz, `-text` va eski `crlf`

`* text=auto` dan keyin faqat `eol` berilsa, `text` `auto` bo'lib qoladi (`eol` faqat `text` *aytilmagan* bo'lsa uni yoqadi):

```text
$ echo '*.cfg eol=lf' >> .gitattributes
$ git check-attr text eol -- faqat.cfg
faqat.cfg: text: auto
faqat.cfg: eol: lf
$ git add faqat.cfg
warning: in the working copy of 'faqat.cfg', CRLF will be replaced by LF the next time Git touches it
$ git ls-files --eol faqat.cfg
i/lf    w/crlf  attr/text=auto eol=lf 	faqat.cfg
```

Matn bo'lsa-da, hech qachon tegilmasligi kerak bo'lgan fayl (masalan, CRLF bilan solishtiriladigan test namunasi) — `-text`:

```text
$ echo 'keep.txt -text' >> .gitattributes
$ git add keep.txt
$ git ls-files --eol keep.txt
i/crlf  w/crlf  attr/-text            	keep.txt
```

Eski maqolalarda `crlf` atributi uchraydi. Ma'lumotnoma uni moslik uchun shunday talqin qiladi: `crlf` = `text`, `-crlf` = `-text`, `crlf=input` = `eol=lf`:

```text
$ cat .gitattributes
a.txt crlf=input
b.txt -crlf
$ git ls-files --eol
i/none  w/none  attr/text eol=lf      	a.txt
i/none  w/none  attr/-text            	b.txt
```

`check-attr` esa `crlf: input` deb xom qiymatni ko'rsatadi; `ls-files --eol` dagi `attr/` ustuni — Git qanday tushunganini. Yangi faylda `text`/`eol` yozing.

**`core.safecrlf`** ([45-bob](45-config-chuqur.md)) atributlar bilan ham ishlaydi: konvertatsiya qaytarib bo'lmaydigan bo'lsa (aralash fayl), `true` rad etadi, `warn` ogohlantiradi. Ma'lumotnoma qo'shimcha qiladi: `git diff` ham bu tekshiruvni ishga tushiradi (keyingi `add` dan oldin muammoni ko'rsatish uchun), `git apply` esa yo'q.

## Kod: binar fayllar

Git faylni binar yoki matn ekanini **boshlanishiga** qarab taxmin qiladi (masalan, NUL bayt bormi). Ko'pincha to'g'ri topadi, lekin ikki holatda adashadi: fayl oxirida binar ma'lumot bo'lsa, yoki fayl texnik jihatdan matn bo'lsa-da, odam uchun ma'nosiz bo'lsa. Pro Git misoli — Xcode'ning `.pbxproj` fayli: UTF-8 matn, lekin aslida IDE yozadigan kichik ma'lumotlar bazasi; ikki kishi o'zgartirsa, merge qilib bo'lmaydi, diff foydasiz. Ma'lumotnoma misoli — PostScript (`.ps`) fayllari: faqat ASCII belgilar, lekin diff "shovqin".

```gitignore
*.pbxproj binary
```

Shundan keyin Git bu faylda CRLF tuzatmaydi, `git diff`/`git show` da matn diff'i chiqarmaydi va merge'da qatorlarni aralashtirmaydi.

Uch variantni farqlang:

| Yozuv | Qator oxiri | Diff | Merge | Qachon |
| --- | --- | --- | --- | --- |
| `-text` | Tegmaydi | Matn bo'lsa ko'rsatadi | Oddiy | Matn, lekin CRLF saqlanishi kerak |
| `-diff` | O'zgarmaydi | `Binary files ... differ` | Oddiy | Matn, lekin diff shovqin (generatsiya qilingan fayl) |
| `binary` | Tegmaydi | `Binary files ... differ` | Konflikt, bizning versiya qoladi | Haqiqiy binar yoki "binar kabi" matn |

`diff` atributi aytilmagan bo'lsa, ma'lumotnoma bo'yicha Git mazmunga qaraydi: matnga o'xshasa **va** `core.bigFileThreshold` dan kichik bo'lsa — matn, aks holda binar. `diff` *yoqilgan* bo'lsa (`diff` yolg'iz) — NUL bayt bo'lsa ham matn deb ko'rsatiladi.

## Kod: binar faylni diff qilish — `textconv`

Binar fayl diff'i odatda bitta qator:

```text
$ git diff
diff --git a/hisobot.zip b/hisobot.zip
index 599d77b..2811185 100644
Binary files a/hisobot.zip and b/hisobot.zip differ
```

`hisobot.zip` — ichida bitta `matn.txt` bo'lgan zip arxiv (Pro Git'dagi Word `.docx` ham aslida shunday zip, ichida XML). Git'ga uni qanday "o'qish"ni o'rgatamiz: **textconv** — binar faylni matnga aylantiradigan dastur. Git ikkala versiyani shu dasturdan o'tkazadi va natijalarni oddiy diff bilan solishtiradi.

Uch qadam. Birinchi — dastur. U bitta argument (fayl nomi) oladi va matnni stdout'ga chiqaradi:

```text
$ cat bin/zipmatn
#!/bin/sh
# textconv: zip arxiv ichidagi matnni stdout'ga chiqaradi
unzip -p "$1"
$ chmod +x bin/zipmatn
```

Ikkinchi — `.gitattributes` da driver nomi, uchinchi — config'da shu nomning dasturi:

```bash
echo '*.zip diff=zip' > .gitattributes
git config set diff.zip.textconv "$PWD/bin/zipmatn"
```

```text
$ git diff hisobot.zip
diff --git a/hisobot.zip b/hisobot.zip
index 599d77b..2811185 100644
--- a/hisobot.zip
+++ b/hisobot.zip
@@ -1,3 +1,4 @@
 Hisobot 2026
-Daromad: 100
+Daromad: 120
 Xarajat: 80
+Izoh: yaxshi chorak
```

Pro Git'dagi Word misoli ham aynan shunday: `*.docx diff=word`, `git config diff.word.textconv docx2txt` (docx2txt — tashqi dastur, uning atrofida kichik o'rovchi skript). Rasmlar uchun — `*.png diff=exif`, `diff.exif.textconv exiftool`: diff'da o'lcham va EXIF metama'lumotlarning o'zgarishi ko'rinadi. Pro Git ham tan oladi: bu mukammal emas (Word'da formatlash o'zgarishi ko'rinmaydi), lekin "Binary files differ" dan ancha foydali.

### textconv qayerda ishlaydi, qayerda yo'q

Ma'lumotnoma ogohlantiradi: textconv **bir tomonlama** — matndan asl zip'ni tiklab bo'lmaydi, shuning uchun bunday diff'ni patch sifatida qo'llab bo'lmaydi. Shu sabab textconv faqat **odam o'qiydigan** joyda ishlaydi: `git diff` va `git log` oilasi (`log`, `show`, `whatchanged`).

```text
$ git log --oneline -p -1 -- hisobot.zip
6fad10a hisobot: 2-chorak
diff --git a/hisobot.zip b/hisobot.zip
index 599d77b..2811185 100644
--- a/hisobot.zip
+++ b/hisobot.zip
@@ -1,3 +1,4 @@
 Hisobot 2026
-Daromad: 100
+Daromad: 120
 Xarajat: 80
+Izoh: yaxshi chorak
$ git format-patch -1 --stdout | grep -A3 '^diff'
...
diff --git a/hisobot.zip b/hisobot.zip
index 599d77b74202b12d20c823b867f773bc3dc0b6c8..2811185235f8e0b075d697caec1a8f3b3629589a 100644
GIT binary patch
delta 103
$ git diff --no-textconv --stat hisobot.zip
 hisobot.zip | Bin 154 -> 174 bytes
 1 file changed, 0 insertions(+), 0 deletions(-)
```

`format-patch` hech qachon textconv ishlatmaydi — u qo'llanadigan binar patch yozadi ([33-bob](33-hissa-qoshish.md)). `--no-textconv` — bir martalik o'chirish. Blob'ni textconv orqali ko'rish uchun `git cat-file --textconv`:

```text
$ git cat-file --textconv HEAD:hisobot.zip
Hisobot 2026
Daromad: 120
Xarajat: 80
Izoh: yaxshi chorak
$ git show HEAD:hisobot.zip | head -c 4 | od -c | head -1
0000000    P   K 003 004
```

Blob'ning o'zi o'zgarmagan — `PK\3\4` bilan boshlanadigan oddiy zip. textconv faqat **ko'rinish**, saqlashga ta'sir qilmaydi (saqlashni o'zgartiradigan narsa — pastdagi filtrlar).

### Kesh: `cachetextconv`

textconv sekin bo'lishi mumkin, ayniqsa `git log -p` yuzlab versiyani o'tkazganda. `cachetextconv` natijani saqlaydi. Qayerga? Git'ning o'z vositasiga — **notes** ga (`git notes` mexanizmi, [33-bob](33-hissa-qoshish.md)), maxsus `refs/notes/textconv/<driver>` ref'ida:

```text
$ git config set diff.zip.cachetextconv true
$ git log -p --format=%h -- hisobot.zip >/dev/null
$ git for-each-ref refs/notes/
b4ee21a2f13100413d419a5ccb090efd45fe8fd4 commit	refs/notes/textconv/zip
$ git notes --ref=textconv/zip list
c4f0a6dde6050e993b633a85e286e6e00bc19b0e 2811185235f8e0b075d697caec1a8f3b3629589a
b98cb6e0bc8e0c6221a603c71f6d4e1bde51dca3 599d77b74202b12d20c823b867f773bc3dc0b6c8
```

Har zip blob'iga (o'ng ustun) uning matn ko'rinishi (chap ustun) note sifatida biriktirildi. `textconv` qiymati o'zgarsa, Git keshni o'zi bekor qiladi; dastur yangilangan bo'lsa-yu buyruq o'sha bo'lsa — qo'lda o'chiring:

```bash
git update-ref -d refs/notes/textconv/zip
```

### "Binar, lekin o'qiladigan": `diff.<nom>.binary`

Ba'zan fayl texnik jihatdan matn, lekin bitta uzun qator — masalan, minifikatsiya qilingan JavaScript. Odatdagi diff bitta ulkan qatorni almashtiradi:

```text
$ git diff app.min.js
...
@@ -1 +1 @@
-var a=1;var b=2;function f(){return a+b};f();
+var a=1;var b=3;function f(){return a+b};f();
```

textconv bilan uni `;` bo'yicha qatorlarga bo'lamiz. Git textconv buyrug'ini shell orqali bajaradi va fayl nomini oxiriga qo'shadi — shuning uchun `<` bilan tugaydigan buyruq faylni `tr` ning kirishiga ulaydi:

```text
$ echo '*.min.js diff=minjs' > .gitattributes
$ git config set diff.minjs.textconv "tr ';' '\\n' <"
$ git config get diff.minjs.textconv
tr ';' '\n' <
$ git diff app.min.js
...
@@ -1,5 +1,5 @@
 var a=1
-var b=2
+var b=3
 function f(){return a+b}
 f()
 
```

Endi odam uchun diff qulay, lekin patch'lar uchun bu fayl hali "matn": `--no-textconv` (va `format-patch`) bitta uzun qatorli matn patch beradi. Faylni **binar deb ham** hisoblash, lekin textconv'ni saqlash kerak bo'lsa — `-diff` va `diff=minjs` ni birga yozib bo'lmaydi (ikkalasi bir atribut). Ma'lumotnoma yechimi — `diff.<nom>.binary`:

```text
$ git config set diff.minjs.binary true
$ git diff app.min.js
...
-var b=2
+var b=3
...
$ git diff --no-textconv app.min.js
diff --git a/app.min.js b/app.min.js
index 0357722..db859a9 100644
Binary files a/app.min.js and b/app.min.js differ
```

### textconv yoki tashqi diff (`diff.<nom>.command`)

Driver'ga textconv o'rniga to'liq tashqi diff dasturi ham berilishi mumkin — [45-bobdagi](45-config-chuqur.md) `diff.external` bilan bir xil 7 argument oladi, lekin faqat shu atributli fayllar uchun:

```text
$ cat ../46-sozdiff
#!/bin/sh
echo "== $1: so'zlar soni $(wc -w < "$2" | tr -d ' ') -> $(wc -w < "$5" | tr -d ' ')"
$ echo '*.md diff=soz' >> .gitattributes
$ git config set diff.soz.command "$PWD/../46-sozdiff"
$ git diff README.md
== README.md: so'zlar soni 3 -> 5
$ git diff --no-ext-diff README.md
...
-bir ikki uch
+bir ikki uch tort besh
```

Qaysi biri? Ma'lumotnoma taqqoslaydi:

| | textconv | `command` (tashqi diff) |
| --- | --- | --- |
| Siz nima yozasiz | Faqat "binar → matn" o'giruvchi | Butun solishtirish va chiqish |
| Chiqish | Git'ning oddiy diff'i: ranglar, `--word-diff`, merge'lar uchun combined diff | Istalgan shakl, qatorga bog'lanmagan |
| Kesh | `cachetextconv` | Yo'q |
| Tayyor dasturlar | Ko'p (`exiftool`, `odt2txt`, `unzip -p`) | Kam |
| `trustExitCode` | — | `true` bo'lsa, dastur `1` = "farq bor", `0` = "farq yo'q" qaytarishi kerak |

Ko'p holatda textconv yetarli va soddaroq. `command` bo'lsa, `diff.<nom>.algorithm` e'tiborsiz qoladi — algoritm tashqi dasturga uzatilmaydi.

## Kod: `diff=<til>` — hunk sarlavhalari

Diff'dagi har o'zgarishlar guruhi (**hunk**) sarlavha bilan boshlanadi: `@@ -k,l +n,m @@ MATN`. `MATN` — o'zgarish qaysi funksiya ichida ekanini ko'rsatish uchun ([7-bob](07-diff.md)). Standart bo'yicha bu — hunk'dan yuqoridagi harf, `_` yoki `$` bilan **boshlangan** eng yaqin qator (GNU `diff -p` qoidasi). Python'da metodlar chekinish bilan yoziladi, shuning uchun standart qoida ularni "ko'rmaydi":

```text
$ git diff hisob.py
...
@@ -12,6 +12,6 @@ class Hisob:
         tekshir(self)
         tekshir(None)
         tekshir(0)
-        self.jami -= son
+        self.jami = self.jami - son
         log("ayirildi")
         return self
```

Sarlavhada sinf nomi bor, lekin qaysi metod — noma'lum. Git'ning ichki `python` qoidasi bilan:

```text
$ echo '*.py diff=python' >> .gitattributes
$ git diff hisob.py
...
@@ -12,6 +12,6 @@ def ayir(self, son):
...
```

Ichki qoidalar (2.56 ma'lumotnomasi): `ada`, `bash`, `bibtex`, `cpp`, `csharp`, `css`, `dts`, `elixir`, `fortran`, `fountain`, `golang`, `html`, `java`, `kotlin`, `markdown`, `matlab`, `objc`, `pascal`, `perl`, `php`, `python`, `ruby`, `rust`, `scheme`, `swift`, `tex`. Ular **avtomatik yoqilmaydi** — `.gitattributes` da `diff=<til>` yozish shart (`*.go diff=golang`, `*.md diff=markdown`).

Ro'yxatda yo'q format uchun o'z qoidangizni `diff.<nom>.xfuncname` (regex) bilan yozasiz. INI fayldagi `[bo'lim]`:

```text
$ git diff sozlama.ini
...
@@ -4,4 +4,4 @@ host = a
...
$ echo '*.ini diff=ini' >> .gitattributes
$ git config set diff.ini.xfuncname '^\[.*\]$'
$ git diff sozlama.ini
...
@@ -4,4 +4,4 @@ [server]
 x = 1
 y = 2
 z = 3
-w = 4
+w = 5
```

Standart qoida `host = a` ni tanladi — harf bilan boshlangan eng yaqin qator, ma'nosiz. Bizning regex bo'lim nomini topdi. Ehtiyot bo'ling: config fayliga **qo'lda** yozsangiz, config parser bitta qavat teskari chiziqni "yeydi" — ma'lumotnomadagi `tex` misolida `"^(\\\\(sub)*section\\{.*)$"` shuning uchun ikkilangan. `git config set` bilan yozganda qiymat avtomatik ekranlanadi.

Shu driver nomi ostida yana ikki sozlama bor:

- `diff.<nom>.wordRegex` — `git diff --word-diff` uchun "so'z" nima ekanini belgilaydi. Ichki qoidalar har til uchun buni ham beradi.
- `diff.<nom>.algorithm` — shu fayllar uchun diff algoritmi (`myers`, `patience`, `minimal`, `histogram`), masalan `*.json` uchun `minimal`. U `git diff`, `git show` va `--stat` ga ta'sir qiladi, merge mexanizmiga emas.

## Kod: `ident` — blob hash'ini faylga yozish

SVN va CVS'dan kelganlar ko'pincha **kalit so'zlarni almashtirish**ni so'raydi: faylda `$Id$` yoki `$Date$` yoziladi, tizim uni avtomatik to'ldiradi. Pro Git asosiy muammoni aytadi: Git faylning hash'ini (checksum) **commit'dan oldin** hisoblaydi, shuning uchun commit haqidagi ma'lumotni faylga keyin yozib bo'lmaydi — fayl o'zgarsa, hash ham o'zgaradi. Yechim: ma'lumotni faqat **working tree**'dagi nusxaga qo'yish va `add` paytida olib tashlash. Repo'da doim "toza" `$Id$` qoladi.

Eng oddiy shakli — ichki `ident` atributi:

```text
$ echo '*.txt ident' > .gitattributes
$ echo '$Id$' > test.txt
$ git add .; git commit -qm ident
$ cat test.txt
$Id$
$ rm test.txt
$ git restore test.txt
$ cat test.txt
$Id: 055c8729cdcc372500a08db659c045e16c4409fb $
$ git rev-parse HEAD:test.txt
055c8729cdcc372500a08db659c045e16c4409fb
$ git cat-file -p HEAD:test.txt
$Id$
$ git status --short
```

Uch kuzatish:

- Bu **blob** hash'i, commit'niki emas ([14-bob](14-obyektlar-blob.md)). Pro Git ta'kidlaydi: foydasi cheklangan — hash tasodifiy ko'rinadi, ikkitasidan qaysi biri yangiroq ekanini bilib bo'lmaydi.
- Almashtirish faqat checkout'da (`restore`, `switch`, `checkout`) bo'ldi. `add`/`commit` diskdagi faylga tegmaydi: fayl o'zgartirilib commit qilinsa, diskda hali eski `$Id` turadi, toki fayl qayta checkout qilinmaguncha.
- `status` toza: check-in'da `$Id:` bilan boshlanib `$` bilan tugaydigan har qanday ketma-ketlik yana `$Id$` ga aylantiriladi.

## Kod: clean va smudge filtrlari

`ident` faqat bitta narsani biladi. Istalgan almashtirish uchun **filtr** yozasiz. Filtr — ikki buyruqdan iborat **driver**:

```text
            smudge (checkout'da)
  repo / index  ───────────────▶  working tree
  ($Date$)      ◀───────────────  ($Date: Wed Oct 7 ...$)
            clean (add'da)
```

- **smudge** ("bulg'ash") — checkout paytida blob'ni stdin'dan oladi, stdout'ga diskka yoziladigan ko'rinishni chiqaradi.
- **clean** ("tozalash") — `add` paytida diskdagi faylni stdin'dan oladi, stdout'ga repo'da saqlanadigan ko'rinishni chiqaradi.

Pro Git'ning birinchi misoli — commit'dan oldin hamma C kodini `indent` dasturidan o'tkazish (`clean = indent`, `smudge = cat` — `cat` kirishni o'zgarishsiz chiqaradi). Ikkinchisi — RCS uslubidagi `$Date$`. Pro Git uni Ruby va Perl'da yozadi; biz oddiy `sh` va `sed` bilan qilamiz:

```text
$ cat bin/sana-qoy bin/sana-ol
#!/bin/sh
# smudge: $Date$ ni oxirgi commit sanasi bilan to'ldiradi
sana=$(git log -1 --format=%ad 2>/dev/null)
sed "s/\\\$Date\\\$/\\\$Date: $sana\\\$/g"
#!/bin/sh
# clean: $Date: ...$ ni yana $Date$ ga qaytaradi
sed 's/\$Date[^$]*\$/$Date$/g'
$ git config set filter.dater.smudge "$PWD/bin/sana-qoy"
$ git config set filter.dater.clean "$PWD/bin/sana-ol"
```

Atribut — driver nomi:

```text
$ echo 'date*.txt filter=dater' > .gitattributes
$ echo '# $Date$' > date_test.txt
$ git add date_test.txt .gitattributes
$ git commit -q -m 'Sana almashtirishni sinash'
$ rm date_test.txt
$ git checkout date_test.txt
Updated 1 path from the index
$ cat date_test.txt
# $Date: Wed Oct 7 10:00:00 2026 +0500$
$ git cat-file -p HEAD:date_test.txt
# $Date$
$ git status --short
```

Diskda sana, repo'da toza `$Date$`, `status` toza — clean har safar sanani olib tashlab, index bilan bir xil natija beradi. (Pro Git `git checkout <fayl>` ishlatadi; bugungi `git restore date_test.txt` ham xuddi shunday smudge'ni ishga tushiradi.)

### Driver yo'q bo'lsa — jim o'tkazib yuborish

Pro Git'ning asosiy ogohlantirishi: `.gitattributes` commit qilinadi, `filter.dater.*` esa yo'q. Hamkasb klon qilganda nima bo'ladi? Ma'lumotnoma: config'da driver yo'qligi **xato emas** — filtr "hech narsa qilmaydigan" o'tkazgichga aylanadi. Driver sozlamalarini olib tashlaymiz:

```text
$ git config get --all --regexp '^filter'
$ git status --short
 M date_test.txt
$ git add date_test.txt
$ git diff --cached | tail -3
@@ -1 +1 @@
-# $Date$
+# $Date: Wed Oct 7 10:00:00 2026 +0500$
```

Diskdagi smudge qilingan fayl endi tozalanmaydi — aniq sana **repo'ga** tushishga tayyor. Shuning uchun Pro Git: filtrlarni "muloyim yiqiladigan" qilib loyihalang — driver yo'q bo'lsa ham loyiha ishlashi kerak. Ma'lumotnoma ham filtrning asosiy maqsadini shunday ta'riflaydi: mazmunni "qulayroq" shaklga keltirish, "yaroqsizni yaroqli qilish" emas.

### Driver xato qaytarsa va `required`

Nolsiz chiqish kodi ham standart bo'yicha xato emas. `%f` — filtr buyrug'ida joriy fayl yo'li bilan almashtiriladi:

```text
$ git config set filter.dater.clean 'sh -c "echo clean: %f >&2; exit 1"'
$ touch date_test.txt
$ git add date_test.txt
clean: date_test.txt
error: external filter 'sh -c "echo clean: %f >&2; exit 1"' failed 1
error: external filter 'sh -c "echo clean: %f >&2; exit 1"' failed
$ git status --short
...
M  date_test.txt
```

Xato chiqdi, lekin `add` **bajarildi** — fayl filtrsiz, xom holda index'ga qo'shildi. Bu, masalan, shifrlash filtri uchun halokatli: shifrlanmagan mazmun repo'ga ketadi. Ma'lumotnomaning ikkinchi turdagi filtrlari aynan shunday — repo'da to'g'ridan-to'g'ri ishlatib bo'lmaydigan narsa saqlanadi (tashqi joydagi mazmunga ishora qiluvchi UUID, shifrlangan matn) va u faqat smudge'dan keyin yaroqli bo'ladi. Ular uchun `filter.<nom>.required = true`:

```text
$ git config set filter.dater.required true
$ git add date_test.txt; echo $?
clean: date_test.txt
error: external filter 'sh -c "echo clean: %f >&2; exit 1"' failed 1
error: external filter 'sh -c "echo clean: %f >&2; exit 1"' failed
fatal: date_test.txt: clean filter 'dater' failed
128
```

Endi `add` to'xtaydi. `required` bo'lsa, driver yo'qligi ham xato hisoblanadi. Git LFS aynan shunday ishlaydi: `*.psd filter=lfs -text` va `filter.lfs.required = true` ([49-bob](49-worktree-va-katta-repo.md)).

`%f` haqida ma'lumotnoma ogohlantirishi: bu faqat **nom**. Filtrlanayotgan versiyaga qarab diskdagi fayl umuman bo'lmasligi yoki boshqa mazmunda bo'lishi mumkin. Filtr diskdagi faylni o'qimasin — faqat stdin bilan ishlasin.

### Yaxshi filtrning qoidalari

- **clean takrorlanganda o'zgarmasin**: clean→clean = clean. `indent` bunga mos — to'g'ri chekinishli kodni o'zgartirmaydi.
- **smudge'dan keyin clean asl holatni bersin**: smudge→smudge→clean = clean. Bizning `dater` shunday.
- **clean o'zgarsa — qayta normallashtiring**: `git add --renormalize .`, aks holda repo'dagi eski blob'lar yangi qoidaga mos kelmaydi.
- **Tartib**: check-in'da avval `filter`, keyin `ident`, keyin `text` (qator oxiri). Checkout'da teskari: `text`, `ident`, so'ng `filter`. Ya'ni smudge filtri allaqachon to'g'ri qator oxirli mazmunni oladi.
- **Merge**: filtr yoki `text`/`eol`/`ident` qoidasi qo'shilgan branch'ni qoidasiz branch bilan merge qilsangiz, soxta konfliktlar chiqishi mumkin (bir tomonda CRLF, boshqasida LF). `merge.renormalize = true` uchala versiyani merge'dan oldin virtual checkout + check-in'dan o'tkazadi. Bu smudge→clean = clean bo'lgan filtrlar uchun to'liq ishlaydi.

### `process` — bitta jarayon hamma fayl uchun

`clean`/`smudge` har **fayl** uchun yangi jarayon ishga tushiradi. 10 000 faylli `git add --all` da bu 10 000 marta `sh` + dastur. `filter.<nom>.process` esa butun Git buyrug'i davomida yashaydigan **bitta** jarayonni ishga tushiradi va u bilan pkt-line protokoli orqali gaplashadi (o'sha protokol push/fetch'da ham ishlatiladi, [29-bob](29-fetch-push-ichidan.md)). `process` sozlangan bo'lsa, u doim `clean`/`smudge` dan ustun. Ular bir-biriga mos emas: oddiy `clean` buyrug'ini `process` ga qo'yib bo'lmaydi.

Protokol qisqacha (ma'lumotnoma):

1. **Handshake**: Git `git-filter-client`, `version=2` yuboradi; filtr `git-filter-server`, `version=2` bilan javob beradi. So'ng Git imkoniyatlarni taklif qiladi (`clean`, `smudge`, `delay`), filtr qo'llaydiganlarini qaytaradi.
2. **Har fayl**: Git `command=clean` (yoki `smudge`), `pathname=...`, flush (`0000`), keyin mazmun va flush. Filtr `status=success`, flush, natija mazmuni, flush, va yana bitta (bo'sh) ro'yxat + flush yuboradi.
3. Xato bo'lsa — `status=error` (shu fayl) yoki `status=abort` (endi hech qaysi fayl). Git chiqish kodini `required` ga qarab belgilaydi.

Qator oxiridagi bo'shliqlarni olib tashlaydigan kichik filtr (Python):

```python
#!/usr/bin/env python3
# Uzoq yashovchi filtr: clean'da qator oxiridagi bo'shliqlarni olib tashlaydi.
import sys
inp, out = sys.stdin.buffer, sys.stdout.buffer

def oqi():                       # bitta pkt-line; None = flush (0000)
    n = int(inp.read(4), 16)
    return None if n == 0 else inp.read(n - 4)

def yoz(b):
    out.write(b"%04x" % (len(b) + 4) + b)

def flush():
    out.write(b"0000"); out.flush()

def royxat():                    # flush'gacha bo'lgan qatorlar
    q = []
    while (p := oqi()) is not None:
        q.append(p.rstrip(b"\n").decode())
    return q

# 1) Handshake
assert royxat() == ["git-filter-client", "version=2"]
yoz(b"git-filter-server\n"); yoz(b"version=2\n"); flush()
royxat()                         # Git taklif qilgan imkoniyatlar
yoz(b"capability=clean\n"); yoz(b"capability=smudge\n"); flush()
sys.stderr.write("[tozala] jarayon boshlandi\n")

# 2) Har fayl uchun buyruq
while True:
    try:
        sarlavha = dict(q.split("=", 1) for q in royxat())
    except ValueError:
        break
    mazmun = b""
    while (p := oqi()) is not None:
        mazmun += p
    buyruq, yol = sarlavha["command"], sarlavha["pathname"]
    if buyruq == "clean":
        mazmun = b"\n".join(q.rstrip() for q in mazmun.split(b"\n"))
    sys.stderr.write(f"[tozala] {buyruq} {yol}\n")
    yoz(b"status=success\n"); flush()
    for i in range(0, len(mazmun), 65516):
        yoz(mazmun[i:i + 65516])
    flush(); flush()             # mazmun tugadi; bo'sh ro'yxat = status o'zgarmaydi
```

(Bitta pkt-line'ga ko'pi bilan 65516 bayt ma'lumot sig'adi, shuning uchun mazmun bo'laklarga bo'linadi.) Uch fayl bilan:

```text
$ echo '*.txt filter=tozala' > .gitattributes
$ git config set filter.tozala.process "$PWD/bin/tozala.py"
$ git add .
[tozala] jarayon boshlandi
[tozala] clean a.txt
[tozala] clean b.txt
[tozala] clean c.txt
$ git cat-file -p :a.txt | od -c
0000000    a  \n   b  \n
0000004
$ rm *.txt
$ git checkout -- .
[tozala] jarayon boshlandi
[tozala] smudge a.txt
[tozala] smudge b.txt
[tozala] smudge c.txt
```

Jarayon har buyruqda **bir marta** boshlandi. Ma'lumotnoma maslahati: protokolni tuzatishda `GIT_TRACE_PACKET` ([48-bob](48-muhit-ozgaruvchilari.md)) yordam beradi:

```text
$ GIT_TRACE_PACKET=1 git add a.txt 2>&1 | sed 's/^.*packet: *//' | head -17
git> git-filter-client
git> version=2
git> 0000
git< git-filter-server
git< version=2
git< 0000
git> capability=clean
git> capability=smudge
git> capability=delay
git> 0000
[tozala] jarayon boshlandi
git< capability=clean
git< capability=smudge
git< 0000
git> command=clean
git> pathname=a.txt
git> 0000
```

`delay` imkoniyati (biz qo'llamadik) filtrga smudge'ni "keyinroq" qilishga ruxsat beradi — masalan, tarmoqdan yuklab olish paytida: filtr `status=delayed` qaytaradi, Git keyin `list_available_blobs` bilan tayyorlarini so'raydi. To'liq namuna — Git manba kodidagi `contrib/long-running-filter/example.pl`.

## Kod: eksport — `export-ignore` va `export-subst`

`git archive` loyihaning ma'lum versiyasini tar yoki zip arxivga yozadi ([34-bob](34-loyihani-yuritish.md)dagi reliz arxivi). Atributlar arxivga nima kirishini va qanday kirishini boshqaradi.

### `export-ignore`

Testlar, CI sozlamalari, `.gitattributes` ning o'zi — repo'da kerak, foydalanuvchiga beriladigan arxivda emas. Pro Git misoli `test/ export-ignore`:

```text
$ cat .gitattributes
test/ export-ignore
.github/ export-ignore
.gitattributes export-ignore
VERSION export-subst
$ git archive HEAD | tar t
README.md
VERSION
src/
src/app.py
```

`test/` va `.github/` arxivda yo'q. Lekin `check-attr` ga qarang:

```text
$ git check-attr export-ignore -- test/t1.py test .github/workflows/ci.yml
test/t1.py: export-ignore: unspecified
test: export-ignore: unspecified
.github/workflows/ci.yml: export-ignore: unspecified
$ git check-attr export-ignore -- test/ .github/
test/: export-ignore: set
.github/: export-ignore: set
```

Atribut fayllarga emas, **papkaning o'ziga** tushdi (`check-attr` ga yo'lni `/` bilan bersangiz, uni papka deb tekshiradi). `git archive` tree'ni aylanib chiqayotganda papkaga yetib, uning `export-ignore` ekanini ko'radi va butun papkani tashlab ketadi. Demak, yuqoridagi "`path/` atributlarda ma'nosiz" qoidasi `export-ignore` ga taalluqli emas. Teskari sinov — ma'lumotnoma tavsiya qilgan `test/**`:

```text
$ git check-attr export-ignore -- test test/t1.py
test: export-ignore: unspecified
test/t1.py: export-ignore: set
$ git archive HEAD | tar t
README.md
VERSION
src/
src/app.py
test/
```

Fayllar chiqarildi, lekin **bo'sh `test/` papkasi** arxivda qoldi. Xulosa: `export-ignore` uchun papkaga pattern yozing (`test/` yoki ildizga bog'langan `/test`), `test/**` emas.

`git archive` standart bo'yicha atributlarni **arxivlanayotgan commit'dagi** `.gitattributes` dan oladi, working tree'dagidan emas. Commit qilinmagan qoidani sinash uchun — `--worktree-attributes`.

### `export-subst`

`export-subst` atributli faylda `git archive` `$Format:...$` belgilarini `git log --pretty=format:` joy egalari bilan almashtiradi ([9-bob](09-tarixni-korish.md)):

```text
$ cat VERSION
Last commit date: $Format:%cd by %aN$
$ git archive HEAD VERSION | tar xO
Last commit date: Wed Oct 7 10:00:00 2026 +0500 by Ali Valiyev
$ git archive HEAD^{tree} VERSION | tar xO
Last commit date: $Format:%cd by %aN$
```

Ikkinchi buyruqda almashtirish bo'lmadi: ma'lumotnoma bo'yicha bu commit ID'ga bog'liq, `git archive` ga commit yoki tag emas, **tree** berilsa (`HEAD^{tree}`), commit ma'lumoti yo'q.

Bir nechta joy egasi va `%(describe)`:

```text
$ cat VERSION
$Format:%H$
$Format:%h %s (%(describe))$
$Format:%(describe)$
$ git describe HEAD
v1.1-1-g1a30763
$ git archive HEAD VERSION | tar xO
1a307637eba7334fe5d7099ab742b2bf9ae4909a
1a30763 VERSION formati (v1.1-1-g1a30763)
%(describe)
```

Uchinchi qator almashmadi. Bu xato emas: ma'lumotnoma bo'yicha bitta arxivda faqat **bitta** `%(describe)` kengaytiriladi — `describe` qimmat amal, va begona repo'dagi minglab `%(describe)` arxiv yaratishni "xizmatdan chiqarish" (DoS) hujumiga aylantirmasligi uchun. Yana bir nozik joy: `%(describe)` standart bo'yicha faqat **annotated** tag'larni ko'radi ([12-bob](12-teglar-va-aliaslar.md)); faqat lightweight tag bo'lsa, bo'sh chiqadi.

Pro Git `%B` (commit xabari) va `%+w(76,6,9)` (qatorlarni o'rash) bilan ham misol keltiradi: `$Format:Last commit: %h by %aN at %cd%n%+w(76,6,9)%B$`. Pro Git yakunlaydi: bunday arxiv deploy uchun yaxshi, lekin keyingi ishlab chiqish uchun emas — unda `.git` yo'q.

## Kod: merge — `merge` atributi va driver'lar

[22-bobda](22-konfliktlar.md) konflikt qanday paydo bo'lishini ko'rdik. `merge` atributi **fayl darajasidagi** uch tomonlama merge qanday bajarilishini belgilaydi — `git merge`, `git revert`, `git cherry-pick` va `git rebase` uchun.

| Qiymat | Natija |
| --- | --- |
| `merge` yoki `merge=text` | Ichki uch tomonlama merge, konflikt belgilari bilan (standart) |
| `-merge` yoki `merge=binary` | Bizning versiya qoladi, fayl konfliktli deb belgilanadi |
| `merge=union` | Ikkala tomondagi qatorlar olinadi, belgisiz |
| `merge=<nom>` | `merge.<nom>.driver` dagi o'z dasturingiz |
| aytilmagan | `merge.default` sozlamasi, u ham yo'q bo'lsa — `text` |

### `merge=ours`: Pro Git'dagi `database.xml`

Pro Git misoli: ikki branch'da `database.xml` farqli (har biri o'z bazasiga ulanadi), boshqa o'zgarishlarni merge qilish kerak, bazani esa yo'q. `ours` — Git'ning ichki driver'i emas, **o'zimiz e'lon qiladigan** "hech narsa qilmaydigan" driver: `true` buyrug'i doim muvaffaqiyat qaytaradi va `%A` (bizning versiya) faylini o'zgartirmaydi.

```text
$ echo 'database.xml merge=ours' > .gitattributes
$ git check-attr merge -- database.xml
database.xml: merge: ours
$ git config set merge.ours.driver true
$ git merge --no-edit topic
Auto-merging database.xml
Merge made by the 'ort' strategy.
 app.txt | 1 +
 1 file changed, 1 insertion(+)
$ cat database.xml app.txt
<db>prod-server</db>
a
b
```

Ikkala branch `database.xml` ni o'zgartirgan edi, lekin konflikt yo'q — `main` dagi `prod-server` qoldi, `app.txt` esa odatdagidek birlashdi. (Pro Git'da `Merge made by recursive.` — `ort` 2.34 dan beri standart strategiya, [21-bob](21-branch-va-merge.md).)

Bu yerda Pro Git aytmagan muhim cheklov bor. Driver faqat **fayl darajasidagi merge kerak bo'lganda** chaqiriladi — ya'ni fayl **ikkala** tomonda o'zgargan bo'lsa. Faqat boshqa tomon o'zgartirgan bo'lsa, Git uni hech qanday driver'siz o'sha tomondan oladi:

```text
$ git merge --no-edit topic
Merge made by the 'ort' strategy.
 database.xml | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
$ cat database.xml
<db>topic</db>
```

(Bu yerda `main` faqat `app.txt` ni, `topic` esa faqat `database.xml` ni o'zgartirgan.) `merge=ours` "bu faylga hech qachon tegilmasin" kafolati **emas**. Branch'ga xos fayllar uchun ishonchliroq yo'l — ularni umuman kuzatmaslik (namuna fayl commit qilinadi, haqiqiysi `.gitignore` da) yoki muhit o'zgaruvchilari.

Yana bir tuzoq — driver config'da yo'q bo'lsa (hamkasbda `merge.ours.driver` sozlanmagan), Git hech qanday ogohlantirishsiz odatdagi matn merge'iga qaytadi:

```text
$ git merge --no-edit topic2
Auto-merging database.xml
CONFLICT (content): Merge conflict in database.xml
Automatic merge failed; fix conflicts and then commit the result.
```

### Ichki driver'lar: `union` va `binary`

Ikki branch bir ro'yxat oxiriga turli qator qo'shgan (`main` — `anor`, `t2` — `uzum`). `union` bilan:

```text
$ git check-attr -a -- royxat.txt
royxat.txt: merge: union
$ git merge --no-edit t2
Auto-merging royxat.txt
Merge made by the 'ort' strategy.
 royxat.txt | 1 +
 1 file changed, 1 insertion(+)
$ cat royxat.txt
olma
nok
anor
uzum
```

Konflikt yo'q, ikkala qator bor. Ma'lumotnoma ogohlantiradi: qo'shilgan qatorlar tasodifiy tartibda bo'lishi mumkin, natijani tekshiring; oqibatini tushunmasangiz ishlatmang. Mos joylar — tartibi muhim bo'lmagan ro'yxatlar (`CHANGELOG` bo'limlari, `.mailmap`). Kod uchun xavfli: ikki tomonning bir-biriga zid o'zgarishlari jimgina birga qoladi.

`-merge` (`binary`) bilan esa xuddi shu holat:

```text
$ git check-attr -a -- royxat.txt
royxat.txt: merge: unset
$ git merge --no-edit t2
warning: Cannot merge binary files: royxat.txt (HEAD vs. t2)
Auto-merging royxat.txt
CONFLICT (content): Merge conflict in royxat.txt
Automatic merge failed; fix conflicts and then commit the result.
$ cat royxat.txt
olma
nok
anor
$ git ls-files -s royxat.txt
100644 613fdfa198699735ddbb5819292dbd7a0ad35e11 1	royxat.txt
100644 4415e388f04bd3906585abe860b4ab8a7c5b909f 2	royxat.txt
100644 9fbe6ee00577fbbcf695fb606ce2aef11961fd7f 3	royxat.txt
```

Diskda belgilar yo'q — bizning versiya. Lekin index'da uchala bosqich bor ([22-bob](22-konfliktlar.md)): `git checkout --theirs royxat.txt` yoki `git show :3:royxat.txt` bilan ularning versiyasini olib, qaror qabul qilasiz. Binar fayl uchun aynan shu kerak: "bittasini tanla".

### `conflict-marker-size`

Fayl ichida `=======` kabi qatorlar tabiiy uchrasa (AsciiDoc sarlavhalari, Git'ning o'z hujjatlari), standart 7 belgili belgilarni ajratib bo'lmaydi. Ma'lumotnoma `Documentation/git-merge.adoc conflict-marker-size=32` misolini beradi:

```text
$ git check-attr -a -- royxat.txt
royxat.txt: conflict-marker-size: 12
$ git merge --no-edit t2
...
$ cat royxat.txt
olma
nok
<<<<<<<<<<<< HEAD
anor
============
uzum
>>>>>>>>>>>> t2
```

### O'z merge driver'ingiz

Driver — config'dagi buyruq, joy egalari bilan:

| Joy egasi | Ma'nosi |
| --- | --- |
| `%O` | Umumiy ajdod versiyasi (vaqtinchalik fayl) |
| `%A` | Bizning versiya (vaqtinchalik fayl) — **natija shu faylga yozilishi kerak** |
| `%B` | Ularning versiyasi (vaqtinchalik fayl) |
| `%L` | Konflikt belgisi uzunligi (`conflict-marker-size`) |
| `%P` | Natija yoziladigan haqiqiy yo'l |
| `%S`, `%X`, `%Y` | Ajdod, bizning va ularning konflikt yorliqlari |

Chiqish kodi: `0` — toza birlashtirildi; nolsiz — konflikt; 128 dan katta (masalan, dastur yiqildi) — merge **muvaffaqiyatsiz** (konflikt emas).

Ikkala tomondagi qatorlarni saralangan, takrorsiz ro'yxatga birlashtiradigan driver:

```text
$ cat ../46-bin/saralab-birlashtir
#!/bin/sh
# Merge driver: ikkala tomon qatorlarini saralangan, takrorsiz ro'yxatga birlashtiradi.
# $1=%O (ajdod)  $2=%A (bizniki; natija shu faylga yoziladi)  $3=%B (ularniki)  $4=%P (yo'l)
echo "driver: O=$1 A=$2 B=$3 P=$4" >&2
sort -u "$2" "$3" > "$2.tmp" && mv "$2.tmp" "$2"
$ git check-attr -a -- royxat.txt
royxat.txt: merge: saralab
$ git config set merge.saralab.name 'saralangan royxat'
$ git config set merge.saralab.driver '../46-bin/saralab-birlashtir %O %A %B %P'
$ git merge --no-edit t2
driver: O=.merge_file_7a6oou A=.merge_file_IBZlAP B=.merge_file_qX5nzm P=royxat.txt
Auto-merging royxat.txt
Merge made by the 'ort' strategy.
 royxat.txt | 5 +++--
 1 file changed, 3 insertions(+), 2 deletions(-)
$ cat royxat.txt
anor
nok
olma
uzum
```

`%O`/`%A`/`%B` — working tree ildizidagi vaqtinchalik `.merge_file_*` fayllar, merge tugashi bilan o'chiriladi. Driver nisbiy yo'l bilan yozildi — Git uni working tree ildizida ishga tushiradi. `merge.<nom>.name` — faqat odam uchun nom.

Driver xato qaytarsa, Git `%A` da qolgan narsani konflikt sifatida qoldiradi:

```text
$ git config set merge.saralab.driver false
$ git merge --no-edit t2
Auto-merging royxat.txt
CONFLICT (content): Merge conflict in royxat.txt
Automatic merge failed; fix conflicts and then commit the result.
$ git status --short
UU royxat.txt
$ cat royxat.txt
olma
nok
anor
```

Yana ikki sozlama:

- `merge.<nom>.recursive` — ikkidan ortiq umumiy ajdod bo'lganda, Git ajdodlarni avval o'zaro merge qiladi ([26-bob](26-murakkab-merge.md)); shu ichki merge uchun boshqa driver (masalan, `binary`). Aytilmasa, driverning o'zi ishlatiladi.
- `merge.default` — `merge` atributi **aytilmagan** fayllar uchun driver:

```text
$ cat .gitattributes
royxat.txt -text
$ git config set merge.default union
$ git merge --no-edit t2
Auto-merging royxat.txt
Merge made by the 'ort' strategy.
...
```

Haqiqiy dunyodagi misollar: `package-lock.json` yoki `yarn.lock` uchun "qayta generatsiya qiluvchi" driver, `.po` tarjima fayllari uchun `msgmerge` asosidagi driver.

## Kod: `whitespace` atributi

[45-bobda](45-config-chuqur.md) `core.whitespace` bilan "whitespace xatosi" nima ekanini butun repo uchun belgiladik. `whitespace` atributi xuddi shuni **fayl turiga qarab** qiladi. Qiymat formati — `core.whitespace` dagi bilan bir xil:

| Holat | Ma'nosi |
| --- | --- |
| `whitespace` | Git biladigan hamma turdagi xatolar (tab kengligi `core.whitespace` dan) |
| `-whitespace` | Hech narsa xato emas |
| `whitespace=<ro'yxat>` | Faqat shu ro'yxat (`tab-in-indent,trailing-space`) |
| aytilmagan | `core.whitespace` |

Uch fayl: `Makefile` (tab majburiy, qator oxirida bo'shliq), `app.py` (tab bilan chekinish), `notes.md` (qator oxirida ikki bo'shliq — Markdown'da bu "qatorni uzish"):

```text
$ git diff --check
Makefile:2: trailing whitespace.
+	echo ok   
notes.md:1: trailing whitespace.
+Qator  
$ cat .gitattributes
*.py whitespace=tab-in-indent,trailing-space
*.md -whitespace
Makefile whitespace=-blank-at-eol
$ git check-attr whitespace -- app.py notes.md Makefile
app.py: whitespace: tab-in-indent,trailing-space
notes.md: whitespace: unset
Makefile: whitespace: -blank-at-eol
$ git diff --check; echo $?
app.py:2: tab in indent.
+	return 1
2
```

Standart qoida Python'dagi tab'ni ko'rmagan edi (`tab-in-indent` standart o'chiq), Markdown'dagi ataylab qo'yilgan bo'shliqni esa xato degan edi. Atributlardan keyin har fayl o'z qoidasi bilan tekshirildi. Bu atribut `git diff --check`, `git apply --whitespace` va `git rebase --whitespace` ga ta'sir qiladi; `git diff --check` xato topsa `2` qaytaradi — `pre-commit` hook'i ([47-bob](47-hooklar.md)) uchun qulay.

## Kod: `working-tree-encoding`

Git ASCII va uning kengaytmalari (UTF-8, ISO-8859-1) dagi fayllarni matn deb taniydi. UTF-16 esa NUL baytlarga to'la — Git uni binar deb biladi:

```text
$ file skript.ps1
skript.ps1: Unicode text, UTF-16, big-endian text
$ git diff
diff --git a/skript.ps1 b/skript.ps1
index c3e711d..ff777b3 100644
Binary files a/skript.ps1 and b/skript.ps1 differ
```

`working-tree-encoding` Git'ga diskdagi kodlashni aytadi: `add` paytida mazmun shu kodlashdan **UTF-8 ga** o'giriladi va repo'da UTF-8 saqlanadi; checkout'da qaytarib o'giriladi. Ma'lumotnoma tavsiyasi — `eol` ni ham aniq yozing:

```text
$ cat .gitattributes
*.ps1 text working-tree-encoding=UTF-16 eol=crlf
$ git add .gitattributes skript.ps1
$ git commit -qm "UTF-16 skript"
$ git cat-file -p HEAD:skript.ps1 | od -c | head -3
0000000    S   a   l   o   m       d   u   n   y   o  \n   I   k   k   i
0000020    n   c   h   i       q   a   t   o   r  \n
0000033
$ git check-attr -a skript.ps1
skript.ps1: text: set
skript.ps1: working-tree-encoding: UTF-16
skript.ps1: eol: crlf
$ git diff
...
@@ -1,2 +1,2 @@
 Salom dunyo
-Ikkinchi qator
+Uchinchi qator
$ rm skript.ps1; git checkout -q -- skript.ps1
$ file skript.ps1
skript.ps1: Unicode text, UTF-16, big-endian text, with CRLF line terminators
$ od -c skript.ps1 | head -2
0000000  376 377  \0   S  \0   a  \0   l  \0   o  \0   m  \0      \0   d
0000020   \0   u  \0   n  \0   y  \0   o  \0  \r  \0  \n  \0   I  \0   k
```

Repo'da toza UTF-8 + LF (diff ishlaydi, veb interfeyslar ko'rsatadi), diskda BOM (`376 377`) bilan UTF-16 + CRLF. `UTF-16` BOM talab qiladi; BOM'siz fayl uchun bayt tartibini aniq yozing (`UTF-16LE`, `UTF-16BE`; BOM bilan — `UTF-16LE-BOM`). Git xato kodlashni rad etadi:

```text
$ git add yomon.ps1
hint: The file 'yomon.ps1' is missing a byte order mark (BOM). Please use UTF-16BE or UTF-16LE (depending on the byte order) as working-tree-encoding.
fatal: BOM is required in 'yomon.ps1' if encoded as UTF-16
$ git add x.txt
fatal: failed to encode 'x.txt' from NOMALUM to UTF-8
```

(`x.txt` ga `working-tree-encoding=NOMALUM` berilgan.) Mavjud kodlashlar ro'yxati — `iconv --list`, faylniki — `file <fayl>`.

Ma'lumotnoma bu atributni ehtiyotkorlik bilan ishlatishni so'raydi:

- **Boshqa implementatsiyalar** (JGit, libgit2) va 2018-yil martidan eski Git uni qo'llamaydi. Qo'llamaydigan klient `foo.ps1` ni UTF-8 holida chiqaradi (foydalanuvchi uchun buzilgan), o'zi qo'shgan `bar.ps1` ni esa UTF-16 holida saqlaydi — qo'llaydigan klient keyin uni "UTF-8 dan UTF-16 ga" o'girishga urinib xato beradi.
- **Qaytarib bo'lmaydigan kodlashlar**: UTF-8 ↔ X ↔ UTF-8 aylanishi har doim ham asl holatni bermaydi. Shubhali kodlashni `core.checkRoundtripEncoding` ga qo'shing (SHIFT-JIS standart bo'yicha tekshiriladi).
- **Tezlik**: har `add`/checkout'da qayta kodlash.

Qoida: faylni UTF-8 da saqlashning iloji bo'lmasa **va** Git uni matn sifatida qayta ishlashi kerak bo'lsagina ishlating.

## Kod: boshqa atributlar

- **`delta`** — `-delta` bo'lsa, `git repack`/`gc` bu yo'ldagi blob'lar uchun delta siqishga urinmaydi ([18-bob](18-packfile-va-gc.md)). Allaqachon siqilgan katta fayllar (video, arxiv) uchun vaqtni tejaydi.
- **`encoding`** — `gitk` va `git gui` faylni qaysi kodlashda **ko'rsatishi** kerakligi (faqat ko'rsatish, saqlash emas). Yo'q bo'lsa — `gui.encoding`. Ma'lumotnoma: `gitk` buni faqat sozlamalarida per-file kodlash yoqilganda ishlatadi.
- **Tashqi vositalar atributlari** — Git ularni bilmaydi, lekin saqlaydi va `check-attr` ko'rsatadi. Eng ko'p uchraydigani GitHub Linguist'niki: `linguist-generated` (diff'da yig'ilgan ko'rinadi), `linguist-vendored`, `linguist-language=...`. Bular GitHub kelishuvi, Git'ning emas.

## Muhandislik nuqtai nazari: loyiha uchun namuna `.gitattributes`

Ko'p platformali jamoa uchun boshlang'ich fayl — har bo'lim yuqoridagi bo'limlardan biri:

```gitignore
# 1. Standart: Git o'zi aniqlasin, matn bo'lsa LF bilan saqlansin
*               text=auto

# 2. Qator oxiri qat'iy bo'lishi kerak bo'lgan fayllar
*.sh            text eol=lf
*.bat           text eol=crlf
*.ps1           text eol=crlf

# 3. Diff'da funksiya sarlavhasi
*.py            diff=python
*.go            diff=golang
*.md            diff=markdown

# 4. Binar fayllar
*.png           binary
*.jpg           binary
*.pdf           binary

# 5. Generatsiya qilingan fayllar: diff yashirilsin, merge'da konflikt bersin
package-lock.json  -diff -merge linguist-generated

# 6. Arxivga kirmasin
/.github        export-ignore
/tests          export-ignore
.gitattributes  export-ignore
```

Har faylda nima amalda ekanini darhol tekshirish:

```text
$ git check-attr -a -- deploy.sh logo.png src/app.py package-lock.json README.md tests/ tests/a.py
deploy.sh: text: set
deploy.sh: eol: lf
logo.png: binary: set
logo.png: diff: unset
logo.png: merge: unset
logo.png: text: unset
src/app.py: diff: python
src/app.py: text: auto
package-lock.json: diff: unset
package-lock.json: merge: unset
package-lock.json: text: auto
package-lock.json: linguist-generated: set
README.md: diff: markdown
README.md: text: auto
tests/: text: auto
tests/: export-ignore: set
tests/a.py: diff: python
tests/a.py: text: auto
```

Bu faylda **buyruq yo'q** — faqat Git ichki biladigan qiymatlar (`text`, `eol`, `binary`, ichki `diff=` qoidalari). Shuning uchun u har klonda qo'shimcha sozlashsiz ishlaydi. `diff=zip`, `filter=...`, `merge=<o'z driver>` kabi qatorlar qo'shsangiz, README'da (yoki [45-bobdagi](45-config-chuqur.md) jamoa config fayli bilan) driver'ni qanday sozlashni yozing va u yo'q bo'lganda nima bo'lishini o'ylab ko'ring.

Mavjud repo'ga qo'shish tartibi (ma'lumotnomadan):

```bash
# toza working tree'dan
git add .gitattributes
git add --renormalize .
git status                     # normallashadigan fayllar
git commit -m "Qator oxirlarini normallashtirish"
```

`status` da normallashmasligi kerak bo'lgan fayl ko'rinsa — unga `-text` bering va qayta `add`. Bu commit ko'p faylga tegadi: uni alohida, boshqa o'zgarishlarsiz qiling va hash'ini `.git-blame-ignore-revs` ga qo'shing, `blame.ignoreRevsFile` bilan `git blame` uni o'tkazib yuboradi ([41-bob](41-blame-va-bisect.md)).

## Muhandislik nuqtai nazari: atributlar, hook'lar yoki CI?

Atributlar va [keyingi bobdagi](47-hooklar.md) hook'lar ikkalasi ham "fayllar bilan avtomatik ish" — lekin vazifasi har xil:

| | Atributlar (`filter`, `text`) | Hook'lar | CI / server |
| --- | --- | --- | --- |
| Nima qiladi | Mazmunni **o'zgartiradi** (saqlash/checkout'da) | Amalni **tekshiradi**, rad etadi | Tekshiradi, majburiy |
| Repo bilan keladimi | Qoida — ha; driver — yo'q | Yo'q | — |
| Chetlab o'tish | Driver'ni o'chirish | `--no-verify` | Yo'q |
| Misol | LF normallashtirish, LFS, `$Date$` | Formatlashni tekshirish, xabar siyosati | Testlar, `pre-receive` |

Ichki atributlar (`text`, `eol`, `binary`, `export-ignore`) — ishonchli, chunki driver talab qilmaydi. Driver'li atributlar va hook'lar — qulaylik, kafolat emas. Majburiy siyosat faqat serverda ([47-bob](47-hooklar.md), `pre-receive`).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `doc/ -diff` yozib, ichidagi fayllarga ta'sir kutish | Atributlarda papka pattern'i ichkariga o'tmaydi; `doc/guide.md` ga hech narsa tushmaydi | `doc/** -diff` (lekin `export-ignore` uchun aksincha `doc/`) |
| `.gitignore` dagidek `!*.md` yozish | Qator butunlay e'tiborsiz qoldiriladi, ogohlantirish chiqadi | Keyingi qatorda boshqa qiymat yoki `pattern !atribut` |
| Ichki papkadagi `.gitattributes` da `[attr]` makro | `not allowed` — makro ishlamaydi | Makroni ildizdagi `.gitattributes` ga yoki `.git/info/attributes` ga |
| `* text=auto` qo'shib, `--renormalize` qilmaslik | Avval CRLF bilan commit qilingan fayllar shundayligicha qoladi | `git add --renormalize .` va alohida commit |
| `--renormalize` dan keyin `.gitattributes` ni qo'shmaslik | `--renormalize` faqat kuzatilayotgan fayllar (`-u`); qoida commit'ga tushmaydi | `git add .gitattributes` ham |
| Jamoada `core.autocrlf` ga tayanish | Har kimda har xil; `.sh` CRLF bilan buziladi | `.gitattributes` da `text`/`eol`; `core.autocrlf` — shaxsiy fallback |
| `.gitattributes` da driver bor, lekin hamkasblarda config yo'q | Filtr jim o'tkazgichga aylanadi; smudge qilingan mazmun repo'ga tushadi; `merge=ours` oddiy merge bo'ladi | Driver'ni hujjatlashtiring; muhim filtrlarga `required = true` |
| Shifrlash filtri `required` siz | Filtr xato qaytarsa, shifrlanmagan mazmun commit qilinadi | `filter.<nom>.required = true` |
| Filtr ichida `%f` dagi faylni o'qish | Diskdagi fayl yo'q yoki boshqa versiya bo'lishi mumkin | Faqat stdin bilan ishlash |
| `merge=ours` ni "bu fayl hech qachon o'zgarmaydi" deb tushunish | Faqat bir tomon o'zgartirsa, driver chaqirilmaydi — fayl boshqa tomondan olinadi | Branch'ga xos faylni kuzatmaslik yoki muhit sozlamalari |
| Kod fayllarida `merge=union` | Zid o'zgarishlar jimgina birga qoladi, tartib tasodifiy | Faqat tartibsiz ro'yxatlar uchun; natijani tekshirish |
| textconv'li diff'ni patch sifatida yuborish | textconv bir tomonlama, patch qo'llanmaydi | `format-patch` (u textconv ishlatmaydi) yoki `--no-textconv` |
| `export-ignore` uchun `test/**` | Fayllar chiqadi, bo'sh `test/` papkasi arxivda qoladi | `test/` yoki `/test` |
| Bitta faylda bir nechta `%(describe)` | Faqat birinchisi kengaytiriladi | Bitta `%(describe)`, qolganlari `%h`/`%H` |
| `working-tree-encoding=UTF-16` BOM'siz faylga | `fatal: BOM is required` | `UTF-16LE`/`UTF-16BE` yoki `...-BOM` variantlari |
| `.gitattributes` ni symlink qilish | Git ergashmaydi — qoidalar ishlamaydi | Oddiy fayl |

## Amaliyot

1. Repo yarating va ma'lumotnomadagi uch faylli misolni (`.git/info/attributes`, `.gitattributes`, `t/.gitattributes`) qayta quring. `git check-attr foo bar baz merge frotz -- t/abc` natijasini qo'lda bashorat qiling, so'ng tekshiring. `.git/info/attributes` dagi `!bar` ni `bar` ga almashtirsangiz nima o'zgaradi?
2. `doc/ -diff`, `doc/** -diff`, `/doc -diff` va `doc -diff` ni navbat bilan sinang: har birida `git check-attr diff -- doc doc/ doc/a.md doc/ichki/b.md` nima ko'rsatadi? Natijani `.gitignore` dagi xatti-harakat bilan solishtiring ([8-bob](08-gitignore-rm-mv.md)).
3. CRLF, LF va aralash qator oxirli fayllar bilan atributsiz repo yarating. `* text=auto` qo'shib, `git status` va `git ls-files --eol` ni yozib oling; so'ng `git add --renormalize .`. Qaysi fayllar va nega o'zgardi? `core.autocrlf=true` bilan `*.sh text eol=lf` dagi skript checkout'da qanday chiqadi?
4. O'zingiz ishlatadigan binar format uchun (`.docx` — `unzip -p fayl word/document.xml`, `.pdf` — `pdftotext`, rasm — `exiftool`) textconv driver yozing. `git log -p`, `git format-patch`, `git cat-file --textconv` natijalarini solishtiring. `cachetextconv` ni yoqib, `refs/notes/textconv/<nom>` paydo bo'lishini kuzating.
5. `*.py diff=python` dan oldin va keyin chuqur chekinishli metod ichidagi o'zgarishning hunk sarlavhasini solishtiring. So'ng `[bo'lim]` sarlavhali `.ini` yoki `## Sarlavha` li o'z formatingiz uchun `xfuncname` yozing.
6. `$Date$` filtrini sozlang, commit qiling va boshqa papkaga klon qiling. Klonda driver'siz `cat` va `git status` nima ko'rsatadi? Klonda faylni tahrirlab commit qilsangiz, asl repo'ga qanday mazmun qaytadi? `required = true` bu holatni qanday o'zgartiradi?
7. `export-ignore` va `export-subst` bilan reliz arxivi tayyorlang: arxivda testlar va CI fayllari bo'lmasin, `VERSION` faylida `%(describe)` va `%H` bo'lsin. `git archive HEAD` va `git archive HEAD^{tree}` farqini, hamda annotated va lightweight tag bilan `%(describe)` farqini tekshiring.
8. (Qiyinroq) `CHANGELOG` uchun merge driver yozing: ikkala tomon qo'shgan yozuvlarni sanasi bo'yicha saralab birlashtirsin, bir xil qatorni ikki marta qo'ymasin, va ajdodda bo'lib bir tomonda o'chirilgan qatorni o'chirsin (`%O` dan foydalaning). Konfliktni aniqlay olmagan holatda `1` qaytarsin. Uchta branch bilan sinang va `merge.<nom>.recursive` nima uchun kerakligini criss-cross merge'da ([26-bob](26-murakkab-merge.md)) ko'rsating.

## Rasmiy hujjat

- Pro Git — Git Attributes: <https://git-scm.com/book/en/v2/Customizing-Git-Git-Attributes>
- `gitattributes` (hamma atributlar, makrolar, `process` protokoli, ustunlik misoli): <https://git-scm.com/docs/gitattributes>
- `git check-attr`: <https://git-scm.com/docs/git-check-attr>
- `git add --renormalize`: <https://git-scm.com/docs/git-add#Documentation/git-add.txt---renormalize>
- `git ls-files --eol`: <https://git-scm.com/docs/git-ls-files#Documentation/git-ls-files.txt---eol>
- `git archive` (`--worktree-attributes`): <https://git-scm.com/docs/git-archive>
- `gitignore` (pattern sintaksisi): <https://git-scm.com/docs/gitignore>
- `git config` (`core.attributesFile`, `merge.renormalize`, `merge.default`, `core.checkRoundtripEncoding`): <https://git-scm.com/docs/git-config>
- Uzoq yashovchi jarayon protokoli: <https://git-scm.com/docs/long-running-process-protocol>
