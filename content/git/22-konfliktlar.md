# 22 — Konfliktlar

[← Oldingi: Branch yaratish va merge](21-branch-va-merge.md) · [Mundarija](README.md) · [Keyingi: Branch'larni boshqarish →](23-branch-boshqaruvi.md)

## Tushuncha

[21-bobda](21-branch-va-merge.md) merge'ning ikki turini ko'rdik. Agar joriy branch boshqa branch'ning ajdodi bo'lsa, Git shunchaki ko'rsatkichni oldinga suradi (**fast-forward**). Tarix ajralgan bo'lsa, Git **uch tomonlama merge** qiladi: uchta snapshot'ni — ikki branch uchini va ularning umumiy ajdodini (**merge base**) — solishtiradi va natijani ikki otali **merge commit** sifatida yozadi.

Uch tomonlama merge'ning mantig'i oddiy. Har fayl uchun Git so'raydi: "umumiy ajdoddan beri kim nimani o'zgartirdi?"

- Faqat bir tomon o'zgartirgan joy — o'sha tomonning versiyasi olinadi;
- ikkala tomon **bir xil** o'zgartirgan joy — o'sha bir xil natija olinadi;
- ikkala tomon **bir joyni har xil** o'zgartirgan — Git qaysi biri to'g'riligini bilmaydi.

Uchinchi holat — **konflikt** (merge conflict): Git ikki o'zgarishni avtomatik birlashtira olmagan joy. Bunda Git merge'ni yarim yo'lda to'xtatadi, merge commit yaratmaydi va qarorni sizga qoldiradi.

```text
               ┌── B  "Assalomu alaykum"   ← main (HEAD)
  A "Salom" ───┤
               └── C  "Hello"              ← inglizcha

  Umumiy ajdod A: "Salom"
  main:           "Salom" → "Assalomu alaykum"
  inglizcha:      "Salom" → "Hello"
  Bitta qator, ikki xil o'zgarish → konflikt
```

Konflikt — xato emas, Git'ning buzilishi ham emas. Bu oddiy ish holati: Git "bu yerda inson qarori kerak" deydi. Bob davomida ko'ramiz: konflikt paytida repo **aniq va tekshirib bo'ladigan holatda** turadi — index'da har faylning uch versiyasi, `.git` ichida merge'ni eslab turadigan fayllar. Shu modelni bilsangiz, konflikt qo'rqinchli bo'lmay qoladi.

## Nega shunday: nega Git konfliktni o'zi hal qilmaydi

Pro Git (Advanced Merging) Git falsafasini shunday ta'riflaydi: Git merge natijasi **bir ma'noli** bo'lgan holatni aniqlashda aqlli, lekin konflikt bo'lsa, uni "aqllilik" bilan avtomatik hal qilishga urinmaydi.

Sababi — matnni tushunish Git'ning vazifasi emas. Git qatorlarni solishtiradi, kodning ma'nosini bilmaydi. "Assalomu alaykum" va "Hello" dan qaysi biri kerak, yoki ikkalasini qo'shish kerakmi — buni faqat dasturchi biladi. Agar Git taxmin qilib bir tomonni tanlasa, xato natija **jimgina** commit'ga tushardi va siz buni keyinroq, ehtimol production'da, bilib qolardingiz. Ochiq to'xtash — xavfsizroq.

`git merge` hujjati (HOW CONFLICTS ARE PRESENTED) ham shuni aytadi: bir-biriga tegmaydigan o'zgarishlar natijaga so'zma-so'z kiradi, lekin ikkala tomon bir joyni o'zgartirgan bo'lsa, "Git bir tomonni tasodifiy tanlay olmaydi" va ikkala tomon nima qilganini ko'rsatib, sizdan hal qilishni so'raydi.

Ikkinchi savol: nega konflikt ma'lumoti **index'da** saqlanadi? Chunki index — "keyingi commit qanday bo'ladi" degan joy ([15-bob](15-tree-va-index.md)). Hal qilinmagan fayl uchun Git bitta javob bera olmaydi, shuning uchun index'ga uchta nomzodni yozadi. Siz bitta javobni `git add` bilan yozganingizda, uchta nomzod o'rniga bitta oddiy yozuv qoladi va commit qilish mumkin bo'ladi. Konflikt butunlay index darajasidagi holat — buni quyida baytlargacha ko'ramiz.

## Kod: konflikt yaratamiz

Sinov repo'si: `app.js` va `README.md`.

```bash
$ git init
$ cat > app.js <<'EOF'
// Salomlashish moduli

function salom(ism) {
  console.log('Salom, ' + ism);
}

salom('dunyo');
EOF
$ echo "# Salom" > README.md
$ git add . && git commit -m "Boshlang'ich kod"
```

`inglizcha` branch'ida salomni o'zgartiramiz va oxiriga yangi chaqiruv qo'shamiz:

```bash
$ git switch -c inglizcha
$ # app.js: 'Salom, ' → 'Hello, '
$ git commit -am "Salomni inglizchaga o'tkazish"
$ echo "salom('Git');" >> app.js
$ git commit -am "Ikkinchi chaqiruv"
```

`main`da esa o'sha qatorni boshqacha o'zgartiramiz, sarlavha izohini ham yangilaymiz va README'ga qator qo'shamiz:

```bash
$ git switch main
$ # app.js: 'Salom, ' → 'Assalomu alaykum, ', 1-qator: "(v2)" qo'shildi
$ git commit -am "Rasmiyroq salom"
$ echo "Oddiy salomlashish dasturi." >> README.md
$ git commit -am "README tavsifi"
```

```text
$ git log --oneline --graph --all
* 26a6328 README tavsifi
* 081a7d5 Rasmiyroq salom
| * 8c6e5a1 Ikkinchi chaqiruv
| * 88d9451 Salomni inglizchaga o'tkazish
|/
* 8fc4433 Boshlang'ich kod
```

Endi birlashtiramiz:

```text
$ git merge inglizcha
Auto-merging app.js
CONFLICT (content): Merge conflict in app.js
Automatic merge failed; fix conflicts and then commit the result.
```

`CONFLICT (content)` — fayl **mazmunida** konflikt. Git merge commit yaratmadi va to'xtadi.

### Konflikt belgilari

```text
$ cat app.js
// Salomlashish moduli (v2)

function salom(ism) {
<<<<<<< HEAD
  console.log('Assalomu alaykum, ' + ism);
=======
  console.log('Hello, ' + ism);
>>>>>>> inglizcha
}

salom('dunyo');
salom('Git');
```

Faylni diqqat bilan o'qing — bu yerda butun merge mantig'i ko'rinadi:

- **1-qator** `(v2)` — faqat `main` o'zgartirgan, Git uni o'zi oldi;
- **oxirgi qator** `salom('Git');` — faqat `inglizcha` qo'shgan, Git uni ham o'zi oldi;
- **o'rtadagi blok** — ikkala tomon bir qatorni har xil o'zgartirgan, shuning uchun Git ikkalasini belgilar bilan qoldirdi.

Belgilarning ma'nosi:

| Belgi | Ma'nosi |
| --- | --- |
| `<<<<<<< HEAD` | Konflikt boshlanishi; ostida **sizning** tomoningiz (merge qilayotgan paytdagi `HEAD`, ya'ni `main`) |
| `=======` | Ikki tomonni ajratuvchi chiziq |
| `>>>>>>> inglizcha` | Konflikt oxiri; ustida **ular** tomoni (siz qo'shayotgan branch) |

Konflikt bo'lmagan joylar allaqachon hal qilingan. Sizning ishingiz faqat belgilar orasidagi qism.

### `git status` nima deydi

```text
$ git status
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   app.js

no changes added to commit (use "git add" and/or "git commit -a")

$ git status -s
UU app.js
```

**Unmerged paths** — hal qilinmagan fayllar. `both modified` — ikkala tomon ham o'zgartirgan. Qisqa formatdagi `UU` — "unmerged, ikkala tomonda o'zgargan" ([5-bob](05-uch-holat.md)). Qolgan holat kodlarini quyida, boshqa konflikt turlarida ko'ramiz.

`README.md` ro'yxatda yo'q: uni faqat `main` o'zgartirgan, ya'ni merge uchun u hal qilingan. Ko'p faylli loyihada faqat konfliktli fayllar ro'yxatini olish uchun:

```text
$ git diff --name-only --diff-filter=U
app.js
```

## Kod: index ichida — uch bosqich (stage)

Endi eng muhim qism. [15-bobda](15-tree-va-index.md) index'ni "keyingi commit'ning loyihasi" deb ko'rdik: har yozuvda rejim, blob hash'i va fayl nomi. O'shanda har yozuv yonidagi raqam `0` edi. Bu raqam — **stage** (bosqich) raqami, va u faqat merge paytida boshqa qiymat oladi.

```text
$ git ls-files -s
100644 01aa5a272090cf8cfc8611fdcfc3691a8516a817 0	README.md
100644 3c4c9de7a5626b9a79e99e64c9f03fd94e7a5322 1	app.js
100644 386dd0fac014e2362c14311de580eec30b805645 2	app.js
100644 33e9f7956a4888aed8a2b5972f304bfd9e580bec 3	app.js
```

`README.md` — oddiy, stage 0. `app.js` esa index'da **uch marta** turibdi:

| Stage | Nima | Qayerdan |
| --- | --- | --- |
| 0 | Oddiy, hal qilingan yozuv | — |
| 1 | Umumiy ajdod versiyasi (*base*) | merge base commit'idagi fayl |
| 2 | Sizning versiyangiz (*ours*) | `HEAD`dagi fayl |
| 3 | Ularning versiyasi (*theirs*) | `MERGE_HEAD`dagi fayl |

Faqat hal qilinmagan fayllarni ko'rish uchun `-u` (`--unmerged`):

```text
$ git ls-files -u
100644 3c4c9de7a5626b9a79e99e64c9f03fd94e7a5322 1	app.js
100644 386dd0fac014e2362c14311de580eec30b805645 2	app.js
100644 33e9f7956a4888aed8a2b5972f304bfd9e580bec 3	app.js
```

Bu hash'lar o'ylab topilmagan — ular aynan qaysi commit'dagi blob ekanini tekshiramiz:

```text
$ git merge-base HEAD MERGE_HEAD
8fc44331691ae1abb3d5d673730443b221337a8b
$ git rev-parse 8fc4433:app.js
3c4c9de7a5626b9a79e99e64c9f03fd94e7a5322

$ git rev-parse HEAD:app.js MERGE_HEAD:app.js
386dd0fac014e2362c14311de580eec30b805645
33e9f7956a4888aed8a2b5972f304bfd9e580bec

$ git cat-file -t 3c4c9de
blob
```

Stage 1 = merge base'dagi blob, stage 2 = `HEAD`dagi blob, stage 3 = `MERGE_HEAD`dagi blob. Yangi obyekt yaratilmagan — index shunchaki mavjud uchta blob'ga ko'rsatadi ([14-bob](14-obyektlar-blob.md)).

### `:1:`, `:2:`, `:3:` sintaksisi

Har bosqich mazmunini `git show :<n>:<yo'l>` bilan o'qish mumkin. `:<n>:<yo'l>` — "index'dagi `n`-bosqichdagi blob" degan revision ([19-bob](19-revision-tanlash.md)); raqamsiz `:app.js` — stage 0 degani.

```text
$ git show :1:app.js
// Salomlashish moduli

function salom(ism) {
  console.log('Salom, ' + ism);
}

salom('dunyo');

$ git show :2:app.js
// Salomlashish moduli (v2)

function salom(ism) {
  console.log('Assalomu alaykum, ' + ism);
}

salom('dunyo');

$ git show :3:app.js
// Salomlashish moduli

function salom(ism) {
  console.log('Hello, ' + ism);
}

salom('dunyo');
salom('Git');
```

Uchta toza fayl, hech qanday belgi yo'q. Bu juda foydali: belgilar bilan to'lgan fayl chalkash bo'lsa, har versiyani alohida faylga chiqarib, yonma-yon solishtirish mumkin (Pro Git'dagi usul):

```bash
$ git show :1:app.js > app.base.js
$ git show :2:app.js > app.ours.js
$ git show :3:app.js > app.theirs.js
```

Shu uch fayldan `git merge-file -p app.ours.js app.base.js app.theirs.js` qo'lda qayta merge qilib beradi — masalan, bir tomonni oldindan tozalab (formatlab) keyin birlashtirish uchun. Ish tugagach vaqtinchalik fayllarni o'chiring ([38-bob](38-stash-va-clean.md), `git clean`).

Working tree'dagi belgili `app.js` esa — **to'rtinchi**, alohida narsa. U index'da yo'q:

```text
$ git hash-object app.js
4dd8f99b59ac19b735555011abd1971e4b42dd6e
```

### Baytlar darajasida: stage — flags maydonidagi 2 bit

`.git/index` formatida (`gitformat-index`) har yozuvda 16 bitli `flags` maydoni bor: 1 bit *assume-valid*, 1 bit *extended*, **2 bit stage** va 12 bit nom uzunligi. Index'ni kichik Python skripti bilan o'qiymiz (faqat ko'rish uchun, v2 format):

```python
import struct
d = open('.git/index', 'rb').read()
sig, ver, n = struct.unpack('>4sII', d[:12])
print(sig.decode(), 'versiya', ver, 'yozuvlar', n)
p = 12
for _ in range(n):
    sha = d[p+40:p+60].hex()
    flags, = struct.unpack('>H', d[p+60:p+62])
    nlen = flags & 0xFFF
    name = d[p+62:p+62+nlen].decode()
    stage = (flags >> 12) & 3
    print(f'{sha[:7]}  flags=0x{flags:04x}  stage={stage}  {name}')
    p += (62 + nlen + 8) // 8 * 8
```

```text
$ python3 indeks.py
DIRC versiya 2 yozuvlar 4
01aa5a2  flags=0x0009  stage=0  README.md
3c4c9de  flags=0x1006  stage=1  app.js
386dd0f  flags=0x2006  stage=2  app.js
33e9f79  flags=0x3006  stage=3  app.js
```

`0x1006` — yuqori yarim baytda `1` (stage 1), pastda `006` (`app.js` — 6 belgi). `README.md` — `0x0009`: stage 0, 9 belgi. Index'da bir nom bir necha marta turishi mumkin, ular stage bo'yicha tartiblangan. Commit qilish uchun index'da **faqat stage 0** yozuvlar bo'lishi kerak — shuning uchun hal qilinmagan fayl bilan commit qilib bo'lmaydi.

## Kod: `.git` ichida — merge holatini eslab turadigan fayllar

Git to'xtagan merge'ni qanday eslab turadi? Bir necha fayl orqali:

```text
$ ls .git
AUTO_MERGE
COMMIT_EDITMSG
HEAD
MERGE_HEAD
MERGE_MODE
MERGE_MSG
ORIG_HEAD
config
...
```

**`MERGE_HEAD`** — siz qo'shayotgan commit (bir nechta bo'lsa, har biri alohida qatorda):

```text
$ cat .git/MERGE_HEAD
8c6e5a13fdd3ba987ddb5e859f8ed2e8f8609bd5
$ git rev-parse HEAD inglizcha
26a63281f690532f3369a56a1841b4dab02a3a7c
8c6e5a13fdd3ba987ddb5e859f8ed2e8f8609bd5
```

`HEAD` hali ham `26a6328`da — `git merge` hujjatidagi qoida: konfliktda `HEAD` joyida qoladi, `MERGE_HEAD` boshqa branch uchiga o'rnatiladi. `MERGE_HEAD` — oddiy ref ([17-bob](17-reflar-va-head.md)): `git log MERGE_HEAD`, `git show MERGE_HEAD:app.js` kabi ishlatsa bo'ladi. Aynan shu fayl `git commit`ga "bu oddiy commit emas, merge commit — ikkinchi ota `MERGE_HEAD`" deydi.

**`MERGE_MSG`** — tayyorlab qo'yilgan commit xabari:

```text
$ cat .git/MERGE_MSG
Merge branch 'inglizcha'

# Conflicts:
#	app.js
```

Konfliktli fayllar ro'yxati izoh (`#`) sifatida yozilgan — tahrirlovchida ko'rasiz, xabarga kirmaydi (pastda batafsil).

**`MERGE_MODE`** — merge opsiyalari. Oddiy merge'da bo'sh; `--no-ff` bilan boshlangan bo'lsa, ichida `no-ff` turadi:

```text
$ cat .git/MERGE_MODE

$ # (boshqa urinishda: git merge --no-ff --no-commit inglizcha)
$ cat .git/MERGE_MODE
no-ff
```

**`ORIG_HEAD`** — merge boshlanishidan oldingi `HEAD`. Merge'dan keyin "orqaga qaytish" uchun ishlatiladi ([39-bob](39-reset-sirlari.md)):

```text
$ cat .git/ORIG_HEAD
26a63281f690532f3369a56a1841b4dab02a3a7c
```

**`AUTO_MERGE`** — Git'ning standart merge strategiyasi `ort` yozadigan ref: u konflikt belgilari bilan birga working tree'ning **merge tugagan paytdagi** holatiga mos tree'ni ko'rsatadi:

```text
$ cat .git/AUTO_MERGE
bab3f45d3773b0b466469d0c179d9d2da529d6ee
$ git ls-tree AUTO_MERGE
100644 blob 01aa5a272090cf8cfc8611fdcfc3691a8516a817	README.md
100644 blob 4dd8f99b59ac19b735555011abd1971e4b42dd6e	app.js
```

`app.js` blob'i `4dd8f99` — yuqoridagi belgili faylning `hash-object` natijasi bilan aynan bir xil. Foydasi: `git diff AUTO_MERGE` — "konfliktni hal qilish jarayonida men hozirgacha nimani o'zgartirdim" ([bob davomida ko'ramiz](#kod-natijani-tekshirish-va-commit)).

```text
.git/
├── HEAD          ref: refs/heads/main   (o'zgarmagan)
├── ORIG_HEAD     26a6328...             (merge'dan oldingi HEAD)
├── MERGE_HEAD    8c6e5a1...             (qo'shilayotgan commit)
├── MERGE_MSG     "Merge branch 'inglizcha'" + # Conflicts
├── MERGE_MODE    (bo'sh yoki no-ff)
├── AUTO_MERGE    bab3f45... (tree)      (belgili working tree surati)
└── index         app.js: stage 1, 2, 3  (hal qilinmagan)
```

Merge tugashi yoki bekor qilinishi bilan `MERGE_HEAD`, `MERGE_MSG`, `MERGE_MODE`, `AUTO_MERGE` o'chiriladi. Ko'p vositalar (shell prompt'lari, IDE'lar) "merge ketyapti" degan belgini aynan `MERGE_HEAD` borligidan biladi.

## Kod: konfliktni tushunish uchun vositalar

### `git diff` — combined diff

Konflikt paytida oddiy `git diff` maxsus format chiqaradi:

```text
$ git diff
diff --cc app.js
index 386dd0f,33e9f79..0000000
--- a/app.js
+++ b/app.js
@@@ -1,7 -1,7 +1,11 @@@
 -// Salomlashish moduli
 +// Salomlashish moduli (v2)

  function salom(ism) {
++<<<<<<< HEAD
 +  console.log('Assalomu alaykum, ' + ism);
++=======
+   console.log('Hello, ' + ism);
++>>>>>>> inglizcha
  }

  salom('dunyo');
```

Bu **combined diff** (`diff --cc`). Har qator boshida **ikki ustun**: birinchisi — "ours" (stage 2) bilan working tree farqi, ikkinchisi — "theirs" (stage 3) bilan farqi. `index 386dd0f,33e9f79..0000000` — ikki ota blob'i va hali index'da yo'q natija.

- `++<<<<<<< HEAD` — bu qator ikkala tomonda ham yo'q edi (belgini Git qo'shgan, siz o'chirishingiz kerak);
- ` +  console.log('Assalomu...` — ours'da bor, theirs'da yo'q;
- `+   console.log('Hello...` — theirs'da bor, ours'da yo'q.

Git hal qilingan qismlarni index'ga yozgani uchun, `git diff` konflikt paytida faqat **hali hal qilinmagan** narsani ko'rsatadi — nima qolganini bilishning tez yo'li.

### Har tomon bilan solishtirish: `--ours`, `--theirs`, `--base`

```text
$ git diff --ours
* Unmerged path app.js
diff --git a/app.js b/app.js
index 386dd0f..4dd8f99 100644
...
 function salom(ism) {
+<<<<<<< HEAD
   console.log('Assalomu alaykum, ' + ism);
+=======
+  console.log('Hello, ' + ism);
+>>>>>>> inglizcha
 }

 salom('dunyo');
+salom('Git');
```

`git diff --ours` (`-2`) — stage 2 bilan working tree; ya'ni "merge sizning branch'ingizga nimani olib kiradi". `--theirs` (`-3`) — stage 3 bilan, `--base` (`-1`) — umumiy ajdod bilan. Pro Git maslahati: konfliktni hal qilgandan keyin, commit'dan oldin `git diff --ours` bilan "men `main`ga aslida nima qo'shayapman" ni tekshiring.

### Tarix: `git log --merge`

Konflikt **nega** chiqqanini tushunish uchun tarix kerak. Uch nuqta bilan ikkala tomonning noyob commit'lari ([19-bob](19-revision-tanlash.md)):

```text
$ git log --oneline --left-right HEAD...MERGE_HEAD
< 26a6328 README tavsifi
< 081a7d5 Rasmiyroq salom
> 8c6e5a1 Ikkinchi chaqiruv
> 88d9451 Salomni inglizchaga o'tkazish
```

`<` — chap tomon (`HEAD`), `>` — o'ng (`MERGE_HEAD`). `--merge` esa faqat **konfliktli fayllarga** tegadigan commit'larni qoldiradi:

```text
$ git log --oneline --left-right --merge
< 081a7d5 Rasmiyroq salom
> 8c6e5a1 Ikkinchi chaqiruv
> 88d9451 Salomni inglizchaga o'tkazish
```

`README tavsifi` tushib qoldi — u `app.js`ga tegmagan. `-p` qo'shsangiz (`git log --merge -p -- app.js`), har commit'ning `app.js`dagi o'zgarishini ko'rasiz: avval `HEAD` tomoni, keyin `MERGE_HEAD` tomoni. Commit xabarlari ko'pincha "bu qatorni nega o'zgartirgan" ga javob beradi.

## Kod: `diff3` va `zdiff3` — asl matnni ham ko'rsatish

Standart konflikt uslubi (`merge`) muhim narsani ko'rsatmaydi: **asl matn qanday edi**. Yuqoridagi misolda "Salom" bo'lganini belgilardan bilib bo'lmaydi. Ba'zan bu hal qiluvchi: asl matnni ko'rsangiz, har tomon **nimani** o'zgartirmoqchi bo'lganini tushunasiz.

Mavjud konfliktni boshqa uslubda qayta chizish mumkin:

```text
$ git checkout --conflict=diff3 app.js
Recreated 1 merge conflict

$ cat app.js
// Salomlashish moduli (v2)

function salom(ism) {
<<<<<<< ours
  console.log('Assalomu alaykum, ' + ism);
||||||| base
  console.log('Salom, ' + ism);
=======
  console.log('Hello, ' + ism);
>>>>>>> theirs
}

salom('dunyo');
salom('Git');
```

Yangi belgi `|||||||` va ostida — umumiy ajdoddagi matn. Endi aniq: ikkala tomon ham "Salom"ni tarjima qilgan, biri rasmiyroq, biri inglizchaga.

E'tibor bering: qayta chizilgan konfliktda yorliqlar `HEAD`/`inglizcha` emas, `ours`/`base`/`theirs`. Fayl merge'dan emas, index bosqichlaridan qayta yaratilgan.

Hozirgi buyruq — `git restore`:

```bash
$ git restore --conflict=zdiff3 app.js
$ git restore --merge app.js          # standart "merge" uslubida qayta yaratish
```

`git checkout --conflict=...` (Pro Git'dagi yo'l) ham ishlaydi; ikkalasi ham faqat **hal qilinmagan** (index'da 1/2/3 bosqichi bor) fayllarda ishlaydi. Ehtiyot bo'ling: bu buyruqlar working tree'dagi faylni qayta yozadi — qisman qilgan tahrirlaringiz yo'qoladi.

### `diff3` va `zdiff3` farqi

Farq ikkala tomon bir xil qatorlar qo'shgan, lekin bir qismini har xil qilgan holatda ko'rinadi. `paket.yml`:

```text
Asl:       nom / versiya: 1.0 / litsenziya
main:      nom / versiya: 2.0 / tavsif: Kitoblar / muallif: Vali / litsenziya
yangilash: nom / versiya: 2.0 / tavsif: Kitoblar / muallif: Ali  / litsenziya
```

**`merge`** (standart) — bir xil qatorlarni konfliktdan tashqariga chiqaradi:

```text
nom: kutubxona
versiya: 2.0
tavsif: Kitoblar
<<<<<<< HEAD
muallif: Vali
=======
muallif: Ali
>>>>>>> yangilash
litsenziya: MIT
```

**`diff3`** — asl matnni ko'rsatadi, lekin shuning uchun butun o'zgargan hududni konfliktga oladi:

```text
nom: kutubxona
<<<<<<< ours
versiya: 2.0
tavsif: Kitoblar
muallif: Vali
||||||| base
versiya: 1.0
=======
versiya: 2.0
tavsif: Kitoblar
muallif: Ali
>>>>>>> theirs
litsenziya: MIT
```

**`zdiff3`** ("zealous diff3") — asl matnni ko'rsatadi **va** konflikt boshi/oxiridagi ikki tomonda bir xil qatorlarni tashqariga chiqaradi:

```text
nom: kutubxona
versiya: 2.0
tavsif: Kitoblar
<<<<<<< ours
muallif: Vali
||||||| base
versiya: 1.0
=======
muallif: Ali
>>>>>>> theirs
litsenziya: MIT
```

`zdiff3` ikkalasining yaxshi tomonini oladi: kichik konflikt hududi va asl matn. Doimiy qilish uchun:

```bash
$ git config --global merge.conflictStyle zdiff3
```

Sozlangandan keyin oddiy `git merge` ham shu uslubda chiqaradi, yorliqlar esa haqiqiy nomlar bo'ladi — `base` o'rnida merge base commit'ining qisqa hash'i:

```text
<<<<<<< HEAD
muallif: Vali
||||||| 1160ea3
versiya: 1.0
=======
muallif: Ali
>>>>>>> yangilash
```

Pro Git (2-nashr) faqat `diff3`ni tilga oladi; `zdiff3` keyinroq (Git 2.35) qo'shilgan va hozirgi ma'lumotnomada `merge.conflictStyle` ning uchinchi qiymati sifatida hujjatlangan.

## Kod: bir tomonni butunlay tanlash — `--ours` / `--theirs`

Ba'zan birlashtirish kerak emas, bir tomonning versiyasi kerak. Bu ayniqsa **binar fayllar** uchun (rasm, PDF, arxiv) — ularni qatorma-qator birlashtirib bo'lmaydi.

```bash
$ git restore --ours app.js      # stage 2 → working tree
$ git restore --theirs app.js    # stage 3 → working tree
```

Eski yo'l (Pro Git): `git checkout --ours app.js`, `git checkout --theirs app.js`.

**Muhim nozik joy:** `--theirs` **butun faylni** stage 3 dan oladi, faqat konflikt bloklarini emas:

```text
$ git restore --theirs app.js
$ cat app.js
// Salomlashish moduli

function salom(ism) {
  console.log('Hello, ' + ism);
}

salom('dunyo');
salom('Git');
```

1-qatordagi `(v2)` — `main`ning konfliktsiz o'zgarishi — **yo'qoldi**. Fayl to'liq `inglizcha`dagi holatga qaytdi. Faqat konfliktli bloklarda bir tomonni tanlab, qolgan avtomatik birlashtirilgan qismlarni saqlash boshqa narsa: bu `git merge -X ours` / `-X theirs` strategiya opsiyasi ([26-bob](26-murakkab-merge.md)):

```text
$ git merge -X theirs inglizcha
Auto-merging app.js
Merge made by the 'ort' strategy.
 app.js | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)

$ cat app.js
// Salomlashish moduli (v2)

function salom(ism) {
  console.log('Hello, ' + ism);
}

salom('dunyo');
salom('Git');
```

Bu yerda `(v2)` saqlandi — faqat konfliktli qator "theirs"dan olindi.

`restore --ours/--theirs` faylni faqat working tree'ga yozadi; fayl hali ham `UU`. Tanlovni tasdiqlash uchun `git add` kerak:

```text
$ git status -s
UU app.js
```

> **Rebase paytida `ours` va `theirs` almashadi.** `git checkout` hujjatida ogohlantirilgan: `git rebase` va `git pull --rebase` paytida `--ours` — siz ustiga rebase qilayotgan branch (masalan `origin/main`), `--theirs` — sizning qayta qo'yilayotgan commit'ingiz. Sababi: rebase sizning commit'laringizni "boshqa birovning ishi"dek asosiy tarix ustiga birma-bir qo'yadi ([24-bob](24-rebase.md)). Rebase'da `--ours` ni "meniki" deb tanlash — keng tarqalgan xato.

## Kod: konfliktning boshqa turlari

Mazmun konflikti eng ko'p uchraydi, lekin yagona emas. Bir merge'da uch xil konflikt:

```text
$ git merge dizayn
warning: Cannot merge binary files: logo.png (HEAD vs. dizayn)
Auto-merging logo.png
CONFLICT (content): Merge conflict in logo.png
Auto-merging mavzu.css
CONFLICT (add/add): Merge conflict in mavzu.css
CONFLICT (modify/delete): yordam.js deleted in HEAD and modified in dizayn.  Version dizayn of yordam.js left in tree.
Automatic merge failed; fix conflicts and then commit the result.

$ git status
...
Unmerged paths:
  (use "git add/rm <file>..." as appropriate to mark resolution)
	both modified:   logo.png
	both added:      mavzu.css
	deleted by us:   yordam.js

$ git status -s
UU logo.png
AA mavzu.css
DU yordam.js
```

Index'ga qarang — **yo'q bosqichlar** konflikt turini aytib turadi:

```text
$ git ls-files -u
100644 981fc647aa69d8dbeee662369eb46937c42f1526 1	logo.png
100644 1ada7c1ffad067980d8b5c80bf568374fef3760e 2	logo.png
100644 9d5c999bd6b5851b66ed9bff40279d522d3c742f 3	logo.png
100644 5c70b40160b71464be5579a99e76278adcc7b9df 2	mavzu.css
100644 aaa7c05dca1a7a6d7fe020440a449f976eb2012e 3	mavzu.css
100644 61507ae6a0007b65a91b30c5689100b5291cfd14 1	yordam.js
100644 9a5e96ff5f580d05c03df63b3641e849a46bcc28 3	yordam.js
```

| Fayl | Holat | Bosqichlar | Nega |
| --- | --- | --- | --- |
| `logo.png` | `UU` both modified | 1, 2, 3 | Uchala versiya bor, lekin binar — belgi qo'yib bo'lmaydi |
| `mavzu.css` | `AA` both added | 2, 3 | Ajdodda fayl yo'q edi — stage 1 yo'q |
| `yordam.js` | `DU` deleted by us | 1, 3 | Biz o'chirdik — stage 2 yo'q |

Boshqa kodlar: `UD` (ular o'chirgan), `AU`/`UA` (bir tomon qo'shgan), `DD` (ikkalasi o'chirgan). Ayniqsa `rename` bilan bog'liq konfliktlar ham shu yo'l bilan ko'rsatiladi.

Binar faylda working tree'da **sizning** versiyangiz qoladi, belgilar qo'yilmaydi:

```text
$ xxd logo.png
00000000: 8950 4e47 0d0a 1a0a 0000 0003            .PNG........
$ git cat-file -p :1:logo.png | xxd
00000000: 8950 4e47 0d0a 1a0a 0000 0001            .PNG........
```

Hal qilish — har biriga mos buyruq:

```text
$ git restore --theirs logo.png      # dizayn'dagi logoni olamiz
$ git add logo.png
$ # mavzu.css'ni qo'lda tahrirladik
$ git add mavzu.css
$ git rm yordam.js                   # o'chirishga rozimiz
rm 'yordam.js'

$ git status -s
M  logo.png
$ git ls-files -s
100644 9d5c999bd6b5851b66ed9bff40279d522d3c742f 0	logo.png
100644 5c70b40160b71464be5579a99e76278adcc7b9df 0	mavzu.css
100644 8555dab80c5869d5431ea36cb44ab1892baaf0b4 0	sozlama.ini
```

`git status`dagi maslahat `git add/rm` — o'chirilgan tomonni qabul qilsangiz `git rm`, faylni saqlamoqchi bo'lsangiz `git add`. Natija: index'da faqat stage 0 yozuvlar.

## Kod: hal qilish, tekshirish va commit

Asosiy misolga qaytamiz. Ikkala tomonni birlashtirib, belgilarni olib tashlaymiz:

```text
$ cat app.js
// Salomlashish moduli (v2)

function salom(ism) {
  console.log('Assalomu alaykum (Hello), ' + ism);
}

salom('dunyo');
salom('Git');
```

### Natijani tekshirish

Combined diff endi har tomon nimani yo'qotganini va natijada nima yangi ekanini ko'rsatadi:

```text
$ git diff
diff --cc app.js
index 386dd0f,33e9f79..0000000
--- a/app.js
+++ b/app.js
@@@ -1,7 -1,7 +1,7 @@@
 -// Salomlashish moduli
 +// Salomlashish moduli (v2)

  function salom(ism) {
-   console.log('Assalomu alaykum, ' + ism);
 -  console.log('Hello, ' + ism);
++  console.log('Assalomu alaykum (Hello), ' + ism);
  }

  salom('dunyo');
```

`-` birinchi ustunda — ours'da bor edi, natijada yo'q; `-` ikkinchi ustunda — theirs'da bor edi; `++` — ikkala tomonda ham yo'q edi, natijada yangi. Pro Git: commit'dan oldin shuni ko'rib chiqish foydali.

`AUTO_MERGE` bilan — Git yozgan belgili holatdan beri siz nimani o'zgartirdingiz:

```text
$ git diff AUTO_MERGE
diff --git a/app.js b/app.js
index 4dd8f99..12e29fa 100644
...
 function salom(ism) {
-<<<<<<< HEAD
-  console.log('Assalomu alaykum, ' + ism);
-=======
-  console.log('Hello, ' + ism);
->>>>>>> inglizcha
+  console.log('Assalomu alaykum (Hello), ' + ism);
 }
```

Unutilgan belgilarni topish — `git diff --check`:

```text
$ git diff --check
app.js:4: leftover conflict marker
app.js:6: leftover conflict marker
app.js:8: leftover conflict marker
```

(Bu chiqish fayl hali belgili bo'lganda olingan.) Muhim: **`git add` belgilarni tekshirmaydi**. Belgili faylni `add` qilsangiz, Git uni "hal qilindi" deb qabul qiladi va `<<<<<<<` qatorlari commit'ga tushadi. `git diff --cached --check` staged holatda ham shu tekshiruvni qiladi.

### `git add` — hal qilinganini belgilash

```text
$ git add app.js
$ git ls-files -s
100644 01aa5a272090cf8cfc8611fdcfc3691a8516a817 0	README.md
100644 12e29fac248f39860683ae42c89626695fe4b8dc 0	app.js
$ git ls-files -u
$
```

Ichkarida aynan nima bo'ldi: `git add` uch yozuvni (stage 1/2/3) o'chirdi va o'rniga yangi blob `12e29fa` bilan **bitta stage 0** yozuvini qo'ydi. "Hal qilish" Git uchun shu — boshqa hech narsa emas.

O'chirilgan uch yozuv yo'qolmaydi: Git ularni index'ning *resolve undo* kengaytmasida (`REUC`) saqlaydi:

```text
$ git ls-files --resolve-undo
100644 3c4c9de7a5626b9a79e99e64c9f03fd94e7a5322 1	app.js
100644 386dd0fac014e2362c14311de580eec30b805645 2	app.js
100644 33e9f7956a4888aed8a2b5972f304bfd9e580bec 3	app.js
```

Shuning uchun "noto'g'ri hal qildim, qaytadan boshlayman" deyish mumkin — `add` dan keyin ham:

```text
$ git checkout -m app.js
Recreated 1 merge conflict
$ git status -s
UU app.js
```

(`git restore -m app.js` ham shu ishni qiladi.)

```text
$ git status
On branch main
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:
	modified:   app.js
```

### Merge commit

`git commit` (yoki `git merge --continue` — u avval merge ketayotganini tekshiradi, keyin `git commit`ni chaqiradi). Tahrirlovchida `MERGE_MSG` asosidagi shablon ochiladi:

```text
Merge branch 'inglizcha'

# Conflicts:
#	app.js
#
# It looks like you may be committing a merge.
# If this is not correct, please run
#	git update-ref -d MERGE_HEAD
# and try again.


# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# On branch main
# All conflicts fixed but you are still merging.
#
# Changes to be committed:
#	modified:   app.js
#
```

```text
[main 1923aaa] Merge branch 'inglizcha'

$ git cat-file -p HEAD
tree 3f56335001b8c6bb842ad829e124e42d1b56a336
parent 26a63281f690532f3369a56a1841b4dab02a3a7c
parent 8c6e5a13fdd3ba987ddb5e859f8ed2e8f8609bd5
author Ali Valiyev <ali@example.com> 1791351000 +0500
committer Ali Valiyev <ali@example.com> 1791351000 +0500

Merge branch 'inglizcha'
```

Ikki `parent`: birinchisi — eski `HEAD`, ikkinchisi — `MERGE_HEAD` fayli o'qilgan qiymat ([16-bob](16-commit-obyekti.md)). `.git`dagi `MERGE_*` va `AUTO_MERGE` fayllari o'chdi. `#` bilan boshlangan qatorlar xabarga kirmadi.

Konfliktni qanday hal qilganingizni (nega aynan shu variant) xabarga yozish — kelajakdagi o'quvchi uchun foydali (Pro Git maslahati). Merge commit'dagi hal qilishni keyin ham ko'rish mumkin — `git show` merge commit uchun combined diff chiqaradi:

```text
$ git show HEAD
commit ...
Merge: 26a6328 8c6e5a1
...
diff --cc app.js
index 386dd0f,33e9f79..12e29fa
...
-   console.log('Assalomu alaykum, ' + ism);
 -  console.log('Hello, ' + ism);
++  console.log('Assalomu alaykum (Hello), ' + ism);
```

`git log --cc -p` ham merge commit'lar uchun shu formatni beradi. Agar natija har qatorda ota'lardan birining aynan nusxasi bo'lsa, combined diff bo'sh chiqadi — "qiziq" hunk yo'q.

## Kod: `git mergetool`

Grafik (yoki terminal) merge vositasini Git o'zi ishga tushiradi va konfliktli fayllar bo'ylab yuradi:

```text
$ git mergetool --tool-help
'git mergetool --tool=<tool>' may be set to one of the following:
		opendiff         Use FileMerge (requires a graphical session)
		vimdiff          Use Vim with a custom layout ...
		...

The following tools are valid, but not currently available:
		araxis           Use Araxis Merge (requires a graphical session)
		bc               Use Beyond Compare (requires a graphical session)
		...
		kdiff3           Use KDiff3 (requires a graphical session)
		meld             Use Meld (requires a graphical session) ...
		...
		vscode           Use Visual Studio Code (requires a graphical session)
		...
```

Birinchi ro'yxat — kompyuteringizda topilganlar, ikkinchisi — Git biladigan, lekin o'rnatilmaganlar. Tanlash: `git mergetool -t meld` yoki doimiy `git config --global merge.tool meld`. `merge.tool` sozlanmagan bo'lsa, Git o'zi mos variantni tanlaydi.

Vosita qanday ma'lumot oladi — o'z buyrug'imizni sozlab ko'ramiz (`mergetool.<vosita>.cmd`). Bu "vosita" o'zgaruvchilarni chiqaradi va theirs versiyasini natijaga ko'chiradi:

```bash
$ git config merge.tool korish
$ git config mergetool.korish.cmd 'echo "BASE=$BASE"; echo "LOCAL=$LOCAL"; echo "REMOTE=$REMOTE"; echo "MERGED=$MERGED"; cp "$REMOTE" "$MERGED"'
$ git config mergetool.korish.trustExitCode true
```

```text
$ git mergetool
Merging:
paket.yml

Normal merge conflict for 'paket.yml':
  {local}: modified file
  {remote}: modified file
BASE=./paket_BASE_70034.yml
LOCAL=./paket_LOCAL_70034.yml
REMOTE=./paket_REMOTE_70034.yml
MERGED=paket.yml

$ git status -s
M  paket.yml
?? paket.yml.orig
```

Mana mergetool'ning butun modeli:

| O'zgaruvchi | Mazmuni | Index'da |
| --- | --- | --- |
| `BASE` | Umumiy ajdod nusxasi (vaqtinchalik fayl) | stage 1 |
| `LOCAL` | Joriy branch versiyasi | stage 2 |
| `REMOTE` | Qo'shilayotgan versiya | stage 3 |
| `MERGED` | Belgili fayl — natija shu yerga yoziladi | working tree |

Ya'ni mergetool — `git show :1:`, `:2:`, `:3:` ni vaqtinchalik fayllarga chiqarib, vositaga beradigan qobiq. Vosita muvaffaqiyatli tugasa (`trustExitCode true` bo'lsa chiqish kodi bo'yicha, aks holda sizdan so'rab), Git faylni o'zi `git add` qiladi — `M ` holati shuni ko'rsatadi.

`paket.yml.orig` — belgili faylning zaxirasi. Vosita sessiyasi tugagach o'chirsa bo'ladi; avtomatik o'chirish uchun `mergetool.keepBackup false`. Vosita aniq sozlangan bo'lsa (`-t` yoki `merge.tool`), Git har fayl oldidan "Hit return to start merge resolution tool" deb so'ramaydi (`--no-prompt` standart bo'ladi); so'rashini xohlasangiz — `--prompt`.

Foydali sozlamalar: `mergetool.<vosita>.path` (vosita to'liq yo'li), `merge.guitool` + `git mergetool -g` (grafik vosita alohida), `mergetool.hideResolved` (vositaga faqat hal qilinmagan qismlarni ko'rsatish).

## Kod: merge'ni bekor qilish

Konflikt kutilmagan bo'lsa yoki hozir hal qilishga vaqt bo'lmasa — orqaga qayting:

```text
$ git status -sb
## main
UU app.js
$ git merge --abort
$ git status -sb
## main
```

`--abort` merge'dan oldingi holatni tiklashga harakat qiladi: index'ni `HEAD`ga qaytaradi, working tree'dagi merge o'zgarishlarini tozalaydi, `MERGE_*` fayllarini o'chiradi. Hujjat bo'yicha u `MERGE_HEAD` bor paytda `git reset --merge` bilan teng (farqi faqat `MERGE_AUTOSTASH` bo'lganda: `--abort` stash'ni working tree'ga qo'llaydi, `reset --merge` uni stash ro'yxatida saqlaydi).

Kam ma'lum uchinchi variant — `--quit`: merge'ni "unut", lekin index va working tree'ni **o'zgartirma**:

```text
$ git merge --quit
$ git status -sb
## main
UU app.js
$ ls .git
COMMIT_EDITMSG
HEAD
ORIG_HEAD
...
$ git ls-files -u
100644 3c4c9de7a5626b9a79e99e64c9f03fd94e7a5322 1	app.js
100644 386dd0fac014e2362c14311de580eec30b805645 2	app.js
100644 33e9f7956a4888aed8a2b5972f304bfd9e580bec 3	app.js
```

`MERGE_HEAD` yo'q — endi `git commit` merge commit emas, oddiy commit qiladi; bosqichlar esa index'da qoldi. Bu kamdan-kam kerak bo'ladi.

Eng qo'pol yo'l — `git reset --hard HEAD`: index va working tree'ni oxirgi commit'ga qaytaradi. **Ogohlantirish:** commit qilinmagan **hamma** o'zgarish, merge'ga aloqasizlari ham, qaytarib bo'lmaydigan tarzda yo'qoladi ([39-bob](39-reset-sirlari.md)).

## Muhandislik nuqtai nazari: merge'dan oldin toza holat

`git merge` hujjatining PRE-MERGE CHECKS bo'limi ikki qoidani aytadi.

**1. Index `HEAD` bilan mos bo'lishi kerak.** Staged o'zgarish bo'lsa, merge umuman boshlanmaydi — aks holda u merge commit'ga aralashib ketardi:

```text
$ echo "staged" >> README.md && git add README.md
$ git merge inglizcha
error: Your local changes to the following files would be overwritten by merge:
  README.md
Merge with strategy ort failed.
```

(`README.md`ni merge o'zgartirmaydi ham — xabar shunchaki umumiy.)

**2. Merge yangilaydigan fayllarda saqlanmagan o'zgarish bo'lmasligi kerak:**

```text
$ echo "// ish" >> app.js
$ git merge inglizcha
error: Your local changes to the following files would be overwritten by merge:
	app.js
Please commit your changes or stash them before you merge.
Aborting
Merge with strategy ort failed.
```

Merge tegmaydigan faylda unstaged o'zgarish bo'lsa, merge boshlanadi va `--abort` uni saqlab qoladi:

```text
$ echo "x" >> README.md
$ git merge inglizcha
...
CONFLICT (content): Merge conflict in app.js
$ git status -s
 M README.md
UU app.js
$ git merge --abort
$ git status -s
 M README.md
```

Lekin hujjat ogohlantiradi: merge boshlanganda commit qilinmagan o'zgarishlar bo'lsa (ayniqsa merge paytida ular yana o'zgartirilsa), `--abort` ba'zan asl holatni tiklay olmaydi. Shuning uchun qoida: **merge'dan oldin commit qiling yoki `git stash`** ([38-bob](38-stash-va-clean.md)). Pro Git ham shuni aytadi: toza holatdan boshlangan merge'da har qanday tajribani qaytarib bo'ladi.

## Muhandislik nuqtai nazari: konfliktlarni kamaytirish

Konfliktni butunlay yo'qotib bo'lmaydi, lekin kamaytirsa bo'ladi:

- **Tez-tez birlashtiring.** Pro Git: Git bir branch'ni boshqasiga ko'p marta merge qilishni osonlashtiradi, shuning uchun uzoq yashaydigan branch'ni ham muntazam yangilab, kichik konfliktlarni vaqtida hal qilish mumkin — oxirida bitta ulkan konflikt o'rniga. Branch qancha uzoq ajralgan bo'lsa, konflikt shuncha katta.
- **Kichik, bir maqsadli commit'lar** ([10-bob](10-yaxshi-commit.md)). `log --merge -p` da kim nima qilganini tushunish oson bo'ladi.
- **Formatlashni alohida qiling.** Butun faylni qayta formatlash (bo'sh joylar, tablar, qator oxirlari) har qatorni o'zgartiradi va har qanday parallel ish bilan konflikt beradi. Bunday o'zgarishni alohida commit'da, jamoa bilan kelishib qiling. Bo'sh joy konfliktlari uchun `-Xignore-space-change` kabi opsiyalar [26-bobda](26-murakkab-merge.md).
- **`zdiff3`ni yoqing** — asl matnni ko'rish ko'p konfliktni tez hal qiladi.
- **Binar fayllar** uchun konflikt deyarli har doim "bir tomonni tanlash". Ularni tez-tez o'zgartiradigan jamoalar `.gitattributes`da merge drayverini belgilaydi ([46-bob](46-gitattributes.md)).
- Bir xil konfliktni qayta-qayta hal qilyapsizmi — `git rerere` (hal qilishni eslab qolish), [26-bobda](26-murakkab-merge.md).

## Muhandislik nuqtai nazari: konflikt — merge'ga xos emas

Shu bobdagi model — index'da 1/2/3 bosqichlar, belgilar, `git add` bilan hal qilish — Git birlashtirish qiladigan **hamma** joyda bir xil:

| Buyruq | Maxsus ref | Davom ettirish | Bekor qilish |
| --- | --- | --- | --- |
| `git merge` | `MERGE_HEAD` | `git commit` / `git merge --continue` | `git merge --abort` |
| `git rebase` ([24-bob](24-rebase.md)) | `REBASE_HEAD` | `git rebase --continue` | `git rebase --abort` |
| `git cherry-pick` ([34-bob](34-loyihani-yuritish.md)) | `CHERRY_PICK_HEAD` | `git cherry-pick --continue` | `git cherry-pick --abort` |
| `git revert` | `REVERT_HEAD` | `git revert --continue` | `git revert --abort` |
| `git stash pop` ([38-bob](38-stash-va-clean.md)) | — | `add`, keyin `git stash drop` | `git reset --merge` |
| `git pull` ([27-bob](27-remote.md)) | merge yoki rebase'niki | o'shaniki | o'shaniki |

Ya'ni konfliktni bir marta to'g'ri tushunsangiz, hamma joyda ishlata olasiz. Bitta farq — rebase'da `ours`/`theirs` almashinuvi (yuqorida).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Belgili faylni `git add` qilib commit qilish | `add` belgilarni tekshirmaydi; `<<<<<<<` qatorlari kodga tushadi, build buziladi | `git diff --check` va `git diff --cached --check`; faylni ko'zdan kechiring |
| `--theirs` faqat konflikt bloklarini oladi deb o'ylash | Butun fayl stage 3 dan olinadi, sizning konfliktsiz o'zgarishlaringiz yo'qoladi | Faqat bloklar uchun — `merge -X theirs` ([26-bob](26-murakkab-merge.md)) yoki qo'lda tahrir |
| Rebase paytida `--ours`ni "meniki" deb tanlash | Rebase'da `ours` — asosiy branch, `theirs` — sizning commit | Avval `git show :2:fayl`, `:3:fayl` bilan tekshiring |
| Saqlanmagan ish bilan merge boshlash | `--abort` uni to'liq tiklay olmasligi mumkin | Merge'dan oldin commit yoki `git stash` |
| Konflikt chiqqanda `git reset --hard` | Merge'ga aloqasiz commit qilinmagan ish ham yo'qoladi | `git merge --abort` |
| Konfliktni "ikkalasini ham qoldirish" bilan hal qilish | Kod sintaktik to'g'ri bo'lishi mumkin, lekin mantiqan ikki marta ishlaydi | Asl matnni ko'ring (`zdiff3`), ikkala tomon niyatini birlashtiring, testlarni ishga tushiring |
| `git commit --no-edit` bilan merge'ni yakunlash | Tahrirlovchi ochilmasa, `# Conflicts:` izohlari xabarda qoladi (`--cleanup` standarti `whitespace`) | Oddiy `git commit` yoki `git merge --continue` |
| Merge tugashi bilan `*.orig` fayllarni commit qilish | Repo keraksiz zaxira fayllar bilan to'ladi | `mergetool.keepBackup false` yoki `.gitignore`ga `*.orig` |
| Uzoq yashaydigan branch'ni oylab birlashtirmaslik | Oxirida ulkan, tushunarsiz konflikt | Asosiy branch'ni muntazam merge (yoki rebase) qiling |

## Amaliyot

1. Uch commit'li repo yarating va bob boshidagi kabi bir qatorni ikki branch'da har xil o'zgartiring. Merge qiling, `git status -s` va `cat` bilan konflikt belgilarini ko'ring. Qaysi qatorlar Git tomonidan avtomatik hal qilinganini aniqlang.
2. Konflikt holatida `git ls-files -s` chiqishidagi uchta hash'ni `git merge-base`, `git rev-parse HEAD:<fayl>` va `git rev-parse MERGE_HEAD:<fayl>` bilan solishtiring. Har bosqich qaysi commit'dan kelganini isbotlang.
3. Konflikt holatida `ls .git` qiling. `MERGE_HEAD`, `MERGE_MSG`, `ORIG_HEAD`, `AUTO_MERGE` ichini o'qing. Keyin `git merge --abort` qiling va qaysilari yo'qolganini tekshiring.
4. `git restore --conflict=diff3` va `--conflict=zdiff3` bilan bir konfliktni ikki uslubda ko'ring. Ikkala tomon bir xil qatorlar qo'shgan misol tuzib, farqni o'zingiz chiqaring.
5. Konfliktni hal qilib `git add` qiling, `git ls-files --resolve-undo` ni ko'ring, so'ng `git checkout -m <fayl>` bilan konfliktni qayta tiklang. Index'da nima o'zgardi?
6. Bitta merge'da `both modified`, `both added` va `deleted by us` konfliktlarini yarating. Har biri uchun `git ls-files -u` dagi bosqichlarni yozib chiqing va qaysi bosqich nega yo'qligini tushuntiring. Har birini mos buyruq bilan hal qiling.
7. `mergetool.<nom>.cmd` bilan o'z "vositangizni" sozlang: u `$BASE`, `$LOCAL`, `$REMOTE` fayllarini `cat` qilsin va `$MERGED`ga siz tanlagan variantni yozsin. `git mergetool` dan keyin `git status -s` va `.orig` faylni tekshiring.
8. (Qiyinroq) Python bilan `.git/index`ni o'qib, konfliktli yozuvlarning `flags` maydonidan stage raqamini chiqaring (bobdagi skript asosida). `git add` dan keyin yana ishga tushiring va index oxirida `REUC` kengaytmasi paydo bo'lganini `grep -a -o REUC .git/index` bilan tekshiring.

## Rasmiy hujjat

- Pro Git — Basic Branching and Merging (Basic Merge Conflicts): <https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging>
- Pro Git — Advanced Merging (Merge Conflicts): <https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging>
- `git merge` (HOW CONFLICTS ARE PRESENTED, HOW TO RESOLVE CONFLICTS): <https://git-scm.com/docs/git-merge>
- `git mergetool`: <https://git-scm.com/docs/git-mergetool>
- `git restore` (`--ours`, `--theirs`, `--merge`, `--conflict`): <https://git-scm.com/docs/git-restore>
- `git checkout` (`--ours`/`--theirs` va rebase): <https://git-scm.com/docs/git-checkout>
- `git ls-files` (`-u`, `--resolve-undo`): <https://git-scm.com/docs/git-ls-files>
- Index formati (stage bitlari, resolve undo): <https://git-scm.com/docs/gitformat-index>
