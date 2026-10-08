# 41 — `blame` va `bisect`

[← Oldingi: Qidiruv](40-qidiruv.md) · [Mundarija](README.md) · [Keyingi: `reflog` va ma'lumotni tiklash →](42-reflog-va-tiklash.md)

## Tushuncha

Git asosan versiya nazorati uchun yaratilgan, lekin u bilan kodni **tuzatish (debugging)** ham mumkin. Buning uchun ikkita asbob bor, va ular ikki xil savolga javob beradi:

| Savol | Asbob | Qachon |
| --- | --- | --- |
| "Mana shu qatorni kim, qachon va qaysi commit'da yozgan?" | `git blame` | Xato **qayerda** ekanini bilasiz (fayl, funksiya, qator) |
| "Ilgari ishlardi, endi ishlamaydi — qaysi commit buzdi?" | `git bisect` | Xato qayerda ekanini **bilmaysiz**, faqat "yaxshi" va "yomon" holatni bilasiz |

- **`git blame`** (ma'nosi — "aybdorni ko'rsatish"; rasmiy nomi *file annotation*, "faylga izoh berish") — faylning har bir qatori yoniga shu qatorni **oxirgi marta o'zgartirgan** commit'ni, muallifni va sanani yozib chiqaradi.
- **`git bisect`** (ma'nosi — "ikkiga bo'lish") — commit tarixida **ikkilik qidiruv** (binary search) qiladi: "yaxshi" va "yomon" commit orasidagi o'rtadagi commit'ni olib beradi, siz uni sinaysiz, Git oraliqni yarmiga qisqartiradi. 1000 ta commit orasidan aybdorni taxminan 10 qadamda topadi.

Ikkala buyruq ham Git'ning asosiy g'oyasiga tayanadi: tarix — bu snapshot'lar zanjiri (commit — loyihaning ma'lum paytdagi to'liq surati, [16-bob](16-commit-obyekti.md)). `blame` zanjir bo'ylab orqaga yurib, har qator qachon paydo bo'lganini aniqlaydi; `bisect` esa zanjirdagi istalgan snapshot'ni working tree'ga chiqarib beradi va siz uni sinaysiz.

Bu bobdagi barcha misollar bitta kichik repo'da bajarilgan — `kalk.sh` nomli shell kalkulyator, 13 ta commit, uch muallif:

```text
$ git log --oneline
9e640a7 Modul amali
1fa08ad Foiz va kvadratni qoshimcha.sh ga ko'chirish
f6f822b Format: tab o'rniga 4 ta bo'sh joy
59380e7 README: amallar ro'yxati
07cab72 Ayirish: bo'sh argumentlar 0 deb olinadi
31d016b Kvadrat: qavs tuzatildi
89f3411 Kvadrat amali (qoralama)
9c9033f Foiz amali
71aaf55 Bo'lish amali va nolga bo'lish tekshiruvi      ← v1.0 tegi
1763a5f README qo'shildi
de804d8 Ko'paytirish amali
7a396bb Ayirish amali
708ef6c Kalkulyator: qo'shish amali
```

Va xato:

```bash
$ sh kalk.sh ayirish 10 3
-7
```

10 − 3 = 7 bo'lishi kerak edi. Quyida avval `bisect` bilan "qaysi commit buzdi"ni, keyin `blame` bilan "bu qatorlar qayerdan kelgan"ni topamiz.

## Nega shunday: nega Git qatorlar tarixini "saqlamaydi", balki hisoblaydi

Git har commit'da faylning **to'liq nusxasini** (blob, [14-bob](14-obyektlar-blob.md)) saqlaydi, "qaysi qator qachon qo'shilgan" degan ma'lumotni emas. Shuning uchun `blame` har safar **hisoblaydi**: joriy fayldan boshlab har commit'ni ota-commit bilan solishtiradi (diff), va qaysi qatorlar shu commit'da paydo bo'lganini aniqlaydi. Ota-commit'da ham bor qatorlar uchun javobgarlik ota'ga o'tadi, va hokazo — toki har qator o'z "egasini" topmaguncha.

Bu yondashuvning ikki muhim natijasi bor:

1. **Nomini o'zgartirish ham hisoblanadi.** Git rename'ni alohida yozib qo'ymaydi — snapshot'larni solishtirib, keyin "bu fayl nomi o'zgargan ekan" deb taxmin qiladi. `blame` butun fayl nomini o'zgartirishni avtomatik kuzatadi (rasmiy hujjatga ko'ra buni o'chirib qo'yadigan opsiya hozircha yo'q).
2. **Kod ko'chishini ham qidirish mumkin.** Agar Git "bu qatorlar boshqa fayldan ko'chirilgan bo'lishi mumkin" deb qidirsa (`-M`, `-C`), u asl muallifni ham topa oladi. Bu qimmat hisob — shuning uchun standart holatda o'chiq.

`bisect` esa tarixning **chiziqli tartibda** ekaniga tayanadi: agar commit X'da xato bor va uning ajdodi Y'da yo'q bo'lsa, xato Y va X orasidagi qaysidir commit'da paydo bo'lgan. Har sinov oraliqni ikkiga bo'ladi — `n` ta commit uchun taxminan `log₂(n)` qadam.

## Kod: `git blame` — har qatorning egasi

```text
$ git blame kalk.sh
^708ef6c (Ali Valiyev      2026-10-07 10:00:00 +0500  1) #!/bin/sh
^708ef6c (Ali Valiyev      2026-10-07 10:00:00 +0500  2) # kalk.sh — oddiy kalkulyator
^708ef6c (Ali Valiyev      2026-10-07 10:00:00 +0500  3) 
^708ef6c (Ali Valiyev      2026-10-07 10:00:00 +0500  4) qoshish() {
f6f822b7 (Bekzod Toshev    2026-10-07 10:50:00 +0500  5)     echo $(($1 + $2))
^708ef6c (Ali Valiyev      2026-10-07 10:00:00 +0500  6) }
^708ef6c (Ali Valiyev      2026-10-07 10:00:00 +0500  7) 
7a396bbe (Dilnoza Karimova 2026-10-07 10:05:00 +0500  8) ayirish() {
f6f822b7 (Bekzod Toshev    2026-10-07 10:50:00 +0500  9)     a=${1:-0}
f6f822b7 (Bekzod Toshev    2026-10-07 10:50:00 +0500 10)     b=${2:-0}
f6f822b7 (Bekzod Toshev    2026-10-07 10:50:00 +0500 11)     echo $((b - a))
7a396bbe (Dilnoza Karimova 2026-10-07 10:05:00 +0500 12) }
...
1fa08ad6 (Ali Valiyev      2026-10-07 10:55:00 +0500 26) . ./qoshimcha.sh
...
9e640a70 (Dilnoza Karimova 2026-10-07 11:00:00 +0500 37)     modul) modul "$@" ;;
f6f822b7 (Bekzod Toshev    2026-10-07 10:50:00 +0500 38)     *) echo "noma'lum amal: $amal" >&2; exit 2 ;;
^708ef6c (Ali Valiyev      2026-10-07 10:00:00 +0500 39) esac
```

Har qator ustunlari:

| Ustun | Ma'nosi |
| --- | --- |
| `f6f822b7` | Shu qatorni oxirgi marta o'zgartirgan commit'ning qisqa hash'i |
| `(Bekzod Toshev` | Shu commit'ning **muallifi** (author, committer emas) |
| `2026-10-07 10:50:00 +0500` | Muallif sanasi (standart format — `iso`) |
| `9)` | Joriy fayldagi qator raqami |
| qolgani | Qatorning o'zi |

**`^` belgisi.** `^708ef6c` dagi `^` — bu qator **chegara commit'idan** (boundary) kelgan degani. To'liq tarix bo'yicha `blame` qilganda chegara — bu repo'ning birinchi (root) commit'i: qator o'sha paytdan beri o'zgarmagan. Pro Git ham ta'kidlaydi: Git'da `^` endi kamida uchinchi ma'noda uchradi (`HEAD^` — ota, `^main` — inkor, [19-bob](19-revision-tanlash.md)), bu yerda esa "chegara" degani. Bu belgini o'chirish uchun `--root` (root commit'ni chegara deb hisoblamaslik) yoki `-b` (chegara commit'lar uchun bo'sh hash) bor.

**Hash uzunligi.** E'tibor bering: chiqishda hash'lar 8 belgi (`f6f822b7`), `^` li qatorlarda esa 7 belgi + `^`. Git 2.56 dan boshlab `blame` belgi uchun (`^`, `?`, `*`) alohida ustunni **faqat shunday belgi haqiqatda chiqqanda** ajratadi va belgisiz hash'larni ustunni to'ldirish uchun bir belgi uzaytiradi. Agar tanlangan qatorlarda `^` bo'lmasa, hash'lar odatdagi 7 belgi bo'ladi (pastdagi `-L` misoliga qarang). Uzunlikni `--abbrev=<n>` bilan, to'liq 40 belgini `-l` bilan olasiz.

**Muhim chegara.** `blame` faqat **hozir faylda bor** qatorlarni ko'rsatadi. O'chirilgan yoki almashtirilgan qatorlar haqida u hech narsa demaydi. "Bu satr qachon yo'qolgan?" degan savol uchun pickaxe — `git log -S'matn'` ([40-bob](40-qidiruv.md)).

### Faqat kerakli qatorlar: `-L`

Katta faylning hammasini emas, kerakli joyini so'raymiz:

```text
$ git blame -L 8,12 kalk.sh
7a396bb (Dilnoza Karimova 2026-10-07 10:05:00 +0500  8) ayirish() {
f6f822b (Bekzod Toshev    2026-10-07 10:50:00 +0500  9)     a=${1:-0}
f6f822b (Bekzod Toshev    2026-10-07 10:50:00 +0500 10)     b=${2:-0}
f6f822b (Bekzod Toshev    2026-10-07 10:50:00 +0500 11)     echo $((b - a))
7a396bb (Dilnoza Karimova 2026-10-07 10:05:00 +0500 12) }
```

`-L` ning shakllari (`<start>,<end>`):

| Yozuv | Ma'nosi |
| --- | --- |
| `-L 8,12` | 8-dan 12-gacha qatorlar |
| `-L 8,+5` | 8-qatordan boshlab 5 ta qator (`8,12` bilan bir xil) |
| `-L 20,-3` | 20-qator va undan oldingi 3 ta (oxiri — boshidan orqaga) |
| `-L 8` yoki `-L 8,` | 8-qatordan fayl oxirigacha |
| `-L ,12` | Fayl boshidan 12-qatorgacha |
| `-L '/^ayirish/,/^}/'` | Regex: `ayirish` bilan boshlangan birinchi qatordan keyingi `}` gacha |
| `-L :bolish` | Funksiya nomi bo'yicha: `bolish` ga mos "funksiya sarlavhasi" qatoridan keyingi sarlavhagacha |

`-L` bir buyruqda bir necha marta berilishi mumkin (oraliqlar ustma-ust tushsa ham bo'ladi). Regex shaklida boshlanish oldingi `-L` oralig'i tugagan joydan qidiriladi; fayl boshidan qidirish uchun `^/regex/` yoziladi.

Regex varianti qator raqamlari o'zgarib turadigan kodda qulay — fayl tepasiga 10 qator qo'shilsa ham buyruq o'sha funksiyani topadi:

```text
$ git blame -L :bolish -w kalk.sh
71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 18) bolish() {
71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 19)     if [ "$2" -eq 0 ]; then
71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 20)         echo "nolga bo'lib bo'lmaydi" >&2
71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 21)         exit 1
71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 22)     fi
71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 23)     echo $(($1 / $2))
71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 24) }
71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 25) 
1fa08ad (Ali Valiyev   2026-10-07 10:55:00 +0500 26) . ./qoshimcha.sh
89f3411 (Bekzod Toshev 2026-10-07 10:30:00 +0500 27) 
```

`:funcname` oralig'i keyingi "funksiya sarlavhasi"gacha boradi. Sarlavha qaysi qator ekanini Git `git diff` dagi hunk sarlavhalari (`@@ ... @@ bolish() {`) kabi aniqlaydi: hech qanday sozlama bo'lmasa — harf, `_` yoki `$` bilan boshlanadigan qator. Shu sabab oraliq `amal=$1` qatorigacha cho'zildi (`. ./qoshimcha.sh` nuqta bilan boshlangani uchun sarlavha hisoblanmadi). Til uchun aniqroq qoida `.gitattributes` dagi `diff=<driver>` bilan beriladi ([46-bob](46-gitattributes.md)).

## Kod: format commit'i "hamma narsani yutib yuborganda" — `-w` va `--ignore-rev`

Yuqoridagi `blame` da `ayirish` funksiyasining ichki qatorlari `f6f822b — Format: tab o'rniga 4 ta bo'sh joy` ga tegishli bo'lib chiqdi. Bu commit hech qanday mantiqni o'zgartirmagan, faqat bo'sh joylarni almashtirgan. Lekin `blame` uchun qator matni o'zgargan — demak "egasi" ham shu commit. Xatoning haqiqiy muallifini yashirib qo'yadi.

**Yechim 1 — `-w`.** Ota va bola versiyani solishtirganda bo'sh joy farqini e'tiborga olmaslik:

```text
$ git blame -w -L 8,12 kalk.sh
7a396bb (Dilnoza Karimova 2026-10-07 10:05:00 +0500  8) ayirish() {
07cab72 (Dilnoza Karimova 2026-10-07 10:40:00 +0500  9)     a=${1:-0}
07cab72 (Dilnoza Karimova 2026-10-07 10:40:00 +0500 10)     b=${2:-0}
07cab72 (Dilnoza Karimova 2026-10-07 10:40:00 +0500 11)     echo $((b - a))
7a396bb (Dilnoza Karimova 2026-10-07 10:05:00 +0500 12) }
```

Endi ko'rinadi: `echo $((b - a))` qatori `07cab72 — Ayirish: bo'sh argumentlar 0 deb olinadi` da yozilgan. Ayirishda `a` va `b` o'rni almashib qolgan — xato shu yerda.

**Yechim 2 — `--ignore-rev`.** `-w` faqat bo'sh joyga yordam beradi. Format commit'i qavslarni, qo'shtirnoqlarni, qator uzunligini ham o'zgartirgan bo'lsa (masalan, avtomatik formatlovchi ishlatilganda), aniq bir commit'ni "go'yo bo'lmagandek" o'tkazib yuborish kerak:

```text
$ git blame --ignore-rev f6f822b -L 14,24 kalk.sh
de804d8 (Ali Valiyev   2026-10-07 10:10:00 +0500 14) kopaytirish() {
de804d8 (Ali Valiyev   2026-10-07 10:10:00 +0500 15)     echo $(($1 * $2))
de804d8 (Ali Valiyev   2026-10-07 10:10:00 +0500 16) }
de804d8 (Ali Valiyev   2026-10-07 10:10:00 +0500 17) 
71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 18) bolish() {
71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 19)     if [ "$2" -eq 0 ]; then
...
71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 24) }
```

E'tiborga olinmagan commit o'zgartirgan yoki qo'shgan qatorlar shu qatorni (yoki yonidagi qatorlarni) o'zgartirgan **oldingi** commit'ga yoziladi. Qaysi qatorlar "ko'chirilganini" ko'rish uchun ikki sozlama bor:

- `blame.markIgnoredLines` — e'tiborga olinmagan commit o'zgartirgan, lekin boshqa commit'ga topshirilgan qatorlar oldiga `?` qo'yadi;
- `blame.markUnblamableLines` — hech kimga topshirib bo'lmagan qatorlar oldiga `*` qo'yadi.

```text
$ git -c blame.markIgnoredLines=true -c blame.markUnblamableLines=true \
      blame --ignore-rev f6f822b -L 28,39 kalk.sh
^708ef6cd (Ali Valiyev      2026-10-07 10:00:00 +0500 28) amal=$1
^708ef6cd (Ali Valiyev      2026-10-07 10:00:00 +0500 29) shift
^708ef6cd (Ali Valiyev      2026-10-07 10:00:00 +0500 30) case $amal in
^?708ef6c (Ali Valiyev      2026-10-07 10:00:00 +0500 31)     qoshish) qoshish "$@" ;;
?7a396bbe (Dilnoza Karimova 2026-10-07 10:05:00 +0500 32)     ayirish) ayirish "$@" ;;
?de804d8f (Ali Valiyev      2026-10-07 10:10:00 +0500 33)     kopaytirish) kopaytirish "$@" ;;
...
9e640a70a (Dilnoza Karimova 2026-10-07 11:00:00 +0500 37)     modul) modul "$@" ;;
^?708ef6c (Ali Valiyev      2026-10-07 10:00:00 +0500 38)     *) echo "noma'lum amal: $amal" >&2; exit 2 ;;
^708ef6cd (Ali Valiyev      2026-10-07 10:00:00 +0500 39) esac
```

Bu yerda ikki belgi (`^?`) uchun joy kerak bo'ldi, shuning uchun belgisiz hash'lar 9 belgigacha uzaydi — hammasi bir ustunda tursin deb. `--porcelain` rejimida (2.50 dan beri) bu belgilar alohida `ignored` va `unblamable` qatorlari sifatida chiqadi.

### Butun jamoa uchun: `.git-blame-ignore-revs`

Har safar `--ignore-rev` yozmaslik uchun e'tiborga olinmaydigan commit'lar ro'yxatini faylga yoziladi va repo'ga commit qilinadi. Format — `fsck.skipList` kabi: har qatorda **to'liq** (qisqartirilmagan) hash, bo'sh qatorlar va `#` bilan boshlangan izohlar e'tiborga olinmaydi. Fayl nomi — kelishuv; `.git-blame-ignore-revs` keng tarqalgan nom.

```bash
$ git rev-parse f6f822b
f6f822b7c3a4e3fa462d81f968032b75d552e6a5
$ cat .git-blame-ignore-revs
# Format: tab o'rniga 4 ta bo'sh joy
f6f822b7c3a4e3fa462d81f968032b75d552e6a5
$ git config blame.ignoreRevsFile .git-blame-ignore-revs
```

```text
$ git blame -L 4,6 kalk.sh
^708ef6c (Ali Valiyev 2026-10-07 10:00:00 +0500 4) qoshish() {
^708ef6c (Ali Valiyev 2026-10-07 10:00:00 +0500 5)     echo $(($1 + $2))
^708ef6c (Ali Valiyev 2026-10-07 10:00:00 +0500 6) }
```

Endi oddiy `git blame` ham format commit'ini o'tkazib yuboradi. Tafsilotlar:

- `blame.ignoreRevsFile` bir necha marta berilishi mumkin; bo'sh qiymat (`""`) oldingi ro'yxatni tozalaydi. Buyruq qatoridagi `--ignore-revs-file` config'dagilardan **keyin** qo'llanadi.
- Sozlama ko'rsatgan fayl yo'q bo'lsa — `blame` umuman ishlamaydi:

  ```text
  $ git config blame.ignoreRevsFile .yoq-fayl
  $ git blame -L 4,6 kalk.sh
  fatal: could not open object name list: .yoq-fayl
  ```

  Bu muammo, agar sozlamani global config'ga (`~/.gitconfig`) qo'ysangiz va bunday fayli yo'q repo'ga kirsangiz chiqadi. Git 2.52 dan boshlab yo'l qiymatli sozlamalar oldiga `:(optional)` qo'yish mumkin — fayl bo'lmasa, sozlama jimgina o'tkazib yuboriladi:

  ```bash
  $ git config --global blame.ignoreRevsFile ':(optional).git-blame-ignore-revs'
  ```

- Commit'ni rebase qilsangiz yoki `filter-repo` ishlatsangiz, hash o'zgaradi — ro'yxatni ham yangilash kerak.

## Kod: ko'chirilgan kodni kuzatish — `-M` va `-C`

`1fa08ad` commit'ida `foiz` va `kvadrat` funksiyalari `kalk.sh` dan yangi `qoshimcha.sh` fayliga ko'chirildi. Oddiy `blame` uchun bu qatorlar `qoshimcha.sh` da birinchi marta shu commit'da paydo bo'lgan:

```text
$ git blame qoshimcha.sh
1fa08ad (Ali Valiyev      2026-10-07 10:55:00 +0500  1) # qoshimcha.sh — qo'shimcha amallar
1fa08ad (Ali Valiyev      2026-10-07 10:55:00 +0500  2) 
1fa08ad (Ali Valiyev      2026-10-07 10:55:00 +0500  3) foiz() {
1fa08ad (Ali Valiyev      2026-10-07 10:55:00 +0500  4)     echo $(($1 * $2 / 100))
...
1fa08ad (Ali Valiyev      2026-10-07 10:55:00 +0500  9) }
9e640a7 (Dilnoza Karimova 2026-10-07 11:00:00 +0500 10) 
9e640a7 (Dilnoza Karimova 2026-10-07 11:00:00 +0500 11) modul() {
...
```

Bu to'g'ri, lekin foydasiz: kodni Ali faqat ko'chirgan, yozmagan. `-C` Git'ga "bu qatorlar boshqa fayldan ko'chirilmaganmi?" deb qidirishni buyuradi. Lekin bizning repo'da oddiy `-C` hech narsani o'zgartirmadi — chiqish yuqoridagi bilan aynan bir xil bo'ldi. Sababi — **chegara**: Git ko'chirilgan deb hisoblashi uchun blok kamida **40 ta harf-raqam belgi**dan iborat bo'lishi kerak (`-C` uchun standart; `-M` uchun 20). Bizning funksiyalar juda qisqa. `--score-debug` har blok uchun ballni ko'rsatadi:

```text
$ git blame -w -C10 --score-debug -L 3,9 qoshimcha.sh
9c9033f 14 02 kalk.sh (Ali Valiyev   2026-10-07 10:25:00 +0500 3) foiz() {
9c9033f 14 02 kalk.sh (Ali Valiyev   2026-10-07 10:25:00 +0500 4)     echo $(($1 * $2 / 100))
9c9033f 14 02 kalk.sh (Ali Valiyev   2026-10-07 10:25:00 +0500 5) }
9c9033f 14 02 kalk.sh (Ali Valiyev   2026-10-07 10:25:00 +0500 6) 
89f3411  8 03 kalk.sh (Bekzod Toshev 2026-10-07 10:30:00 +0500 7) kvadrat() {
31d016b  7 01 kalk.sh (Bekzod Toshev 2026-10-07 10:35:00 +0500 8)     echo $(($1 * $1))
89f3411  1 03 kalk.sh (Bekzod Toshev 2026-10-07 10:30:00 +0500 9) }
```

Birinchi raqam — ball (ko'chgan harf-raqam belgilar soni). `foiz` bloki — 14 ball, 40 dan ancha kam. `-C10` chegarani 10 ga tushiradi:

```text
$ git blame -w -C10 -L 1,9 qoshimcha.sh
1fa08ad qoshimcha.sh (Ali Valiyev   2026-10-07 10:55:00 +0500 1) # qoshimcha.sh — qo'shimcha amallar
71aaf55 kalk.sh      (Bekzod Toshev 2026-10-07 10:20:00 +0500 2) 
9c9033f kalk.sh      (Ali Valiyev   2026-10-07 10:25:00 +0500 3) foiz() {
9c9033f kalk.sh      (Ali Valiyev   2026-10-07 10:25:00 +0500 4)     echo $(($1 * $2 / 100))
9c9033f kalk.sh      (Ali Valiyev   2026-10-07 10:25:00 +0500 5) }
9c9033f kalk.sh      (Ali Valiyev   2026-10-07 10:25:00 +0500 6) 
89f3411 kalk.sh      (Bekzod Toshev 2026-10-07 10:30:00 +0500 7) kvadrat() {
31d016b kalk.sh      (Bekzod Toshev 2026-10-07 10:35:00 +0500 8)     echo $(($1 * $1))
89f3411 kalk.sh      (Bekzod Toshev 2026-10-07 10:30:00 +0500 9) }
```

Endi har qatorda asl fayl nomi (`kalk.sh`) va asl commit ko'rinadi: `foiz` ni Ali `9c9033f` da, `kvadrat` ni Bekzod `89f3411` da yozgan, 8-qatordagi qavsni esa `31d016b` da tuzatgan. Fayl nomi ustuni avtomatik qo'shildi, chunki ba'zi qatorlar boshqa nomli fayldan keldi (`-f` bilan doim chiqarish mumkin).

`-M` va `-C` darajalari (rasmiy hujjat bo'yicha):

| Opsiya | Nimani qidiradi | Narxi |
| --- | --- | --- |
| `-M[<n>]` | **Shu fayl ichida** ko'chirilgan/nusxalangan bloklar (A, B → B, A). Busiz pastga tushgan blok ko'chirgan commit'ga yoziladi | Arzon |
| `-C[<n>]` | `-M` + **shu commit'da o'zgargan boshqa fayllardan** ko'chirilganlar | O'rtacha |
| `-C -C` | + fayl **yaratilgan** commit'dagi istalgan boshqa fayldan nusxalar | Qimmatroq |
| `-C -C -C` | + **istalgan** commit'dagi istalgan fayldan nusxalar | Eng qimmat |

Bir necha `-C` berilsa, oxirgisidagi `<n>` amal qiladi. Pro Git'dagi misol aynan shunday: `GITServerHandler.m` bir necha faylga bo'lingan, `git blame -C GITPackUpload.m` esa har blok qaysi fayldan va qaysi commit'dan kelganini ko'rsatadi. Odatda siz kodni ko'chirgan commit'ni ko'rardingiz (chunki o'sha faylga birinchi marta o'shanda tegingansiz), `-C` bilan esa kod **haqiqatda yozilgan** commit'ni ko'rasiz.

Rasmiy hujjatdagi foydali usul — yangi qo'shilgan faylda "nusxa-ko'chirma" kod bormi, tekshirish (bu ko'pincha refaktoring chala qolganini bildiradi):

```bash
$ git log --diff-filter=A --pretty=short -- qoshimcha.sh      # faylni qo'shgan commit
$ git blame -C -C -f 1fa08ad^! -- qoshimcha.sh                # faqat shu commit va otasi orasida
```

`1fa08ad^!` — "shu commit, lekin uning ota'larisiz" ([19-bob](19-revision-tanlash.md)).

## Kod: `blame` ning boshqa foydali opsiyalari

```text
$ git blame -e -L 4,6 kalk.sh
^708ef6c (<ali@example.com>    2026-10-07 10:00:00 +0500 4) qoshish() {
f6f822b7 (<bekzod@example.com> 2026-10-07 10:50:00 +0500 5)     echo $(($1 + $2))
^708ef6c (<ali@example.com>    2026-10-07 10:00:00 +0500 6) }
$ git blame -s -L 4,6 kalk.sh
^708ef6c 4) qoshish() {
f6f822b7 5)     echo $(($1 + $2))
^708ef6c 6) }
```

| Opsiya | Vazifasi |
| --- | --- |
| `-e` / `--show-email` | Ism o'rniga email (`blame.showEmail`) |
| `-s` | Muallif va sanani yashirish |
| `-n` / `--show-number` | Asl commit'dagi qator raqami |
| `-f` / `--show-name` | Asl fayl nomi |
| `-l` | To'liq 40 belgili hash |
| `-t` | Sana — xom Unix vaqt |
| `--date <format>` | Sana formati (`relative`, `short`...; `blame.date`) |
| `-c` | `git annotate` uslubidagi chiqish |
| `--color-lines` / `--color-by-age` | Bir commit'dan kelgan qo'shni qatorlarni yoki yoshi bo'yicha bo'yash (`blame.coloring`) |
| `--first-parent` | Merge'da faqat birinchi ota bo'ylab yurish — qator **shu integratsiya branch'iga** qachon kelganini bilish |
| `--diff-algorithm=<algo>` | Diff algoritmi (`histogram`, `patience`...; 2.53 da qo'shilgan) |
| `--contents <fayl>` | Commit qilinmagan versiyani izohlash (`-` — stdin) |
| `--reverse <a>..<b>` | Teskari yo'nalish: qator **oxirgi marta qachon mavjud bo'lgan** |

### Commit oralig'i bilan cheklash

Juda eski tarix qiziq bo'lmasa, oraliq bering. Oraliq chegarasidan beri o'zgarmagan qatorlar chegara commit'iga (`^` bilan) yoziladi:

```text
$ git blame v1.0.. -L 1,8 kalk.sh
^71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 1) #!/bin/sh
^71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 2) # kalk.sh — oddiy kalkulyator
^71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 3) 
^71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 4) qoshish() {
f6f822b7 (Bekzod Toshev 2026-10-07 10:50:00 +0500 5)     echo $(($1 + $2))
^71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 6) }
^71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 7) 
^71aaf55 (Bekzod Toshev 2026-10-07 10:20:00 +0500 8) ayirish() {
```

Bu yerda "Bekzod 1-qatorni yozgan" degani **emas** — "1-qator `v1.0` dan (`71aaf55`) beri o'zgarmagan" degani. `--since="2026-10-07 10:30 +0500"` ham xuddi shunday ishlaydi: chegara — shu sanadan eski eng yangi commit (bizda `^9c9033f`).

### Skript uchun: `--porcelain`

Oddiy chiqish odam uchun. Skriptda `--porcelain` (`-p`) yoki `--line-porcelain` ishlating:

```text
$ git blame --porcelain -L 9,10 kalk.sh
f6f822b7c3a4e3fa462d81f968032b75d552e6a5 9 9 2
author Bekzod Toshev
author-mail <bekzod@example.com>
author-time 1791352200
author-tz +0500
committer Ali Valiyev
committer-mail <ali@example.com>
committer-time 1791352200
committer-tz +0500
summary Format: tab o'rniga 4 ta bo'sh joy
previous 59380e74aac9c9efb7556f55b58177bafb9368d7 kalk.sh
filename kalk.sh
	    a=${1:-0}
f6f822b7c3a4e3fa462d81f968032b75d552e6a5 10 10
	    b=${2:-0}
```

Sarlavha qatori: `<to'liq hash> <asl qator raqami> <joriy qator raqami> <guruhdagi qatorlar soni>`. Commit ma'lumoti faqat birinchi marta chiqadi; ikkinchi qatorda faqat hash va raqamlar. Qator matni oldida — **TAB**. `--line-porcelain` esa har qator uchun to'liq ma'lumotni takrorlaydi, bu tahlilni soddalashtiradi. Rasmiy hujjatdagi misol — har muallif nechta qatorga "egalik" qilishini sanash:

```bash
$ git blame --line-porcelain kalk.sh | sed -n 's/^author //p' | sort | uniq -c | sort -rn
```

`--incremental` esa natijani tayyor bo'lishi bilan, tartibsiz chiqaradi — grafik ko'ruvchilar (GUI) uchun.

## Kod: `git last-modified` — har fayl uchun oxirgi commit (yangi, 2.52)

`blame` qator darajasida ishlaydi. Ba'zan esa savol oddiyroq: "har **fayl** oxirgi marta qaysi commit'da o'zgargan?" (GitHub'dagi fayllar ro'yxatidagi "oxirgi commit" ustuni kabi). Git 2.52 da shu uchun `git last-modified` qo'shildi:

```text
$ git last-modified
9e640a70a475eacfbb7b97ead1f5dbb5213838f6	qoshimcha.sh
9e640a70a475eacfbb7b97ead1f5dbb5213838f6	kalk.sh
59380e74aac9c9efb7556f55b58177bafb9368d7	README.md
$ git last-modified v1.0
71aaf55fd428d0fe1ce039ea555a72ee5c0c4788	kalk.sh
1763a5f767f27b5643d743de057019dbcc29c8b4	README.md
```

Format: `<hash> TAB <yo'l>`. Revision oralig'i berilmasa — `HEAD` dan butun tarix. Nomini o'zgartirish va rejim (mode) o'zgarishi ham "o'zgarish" hisoblanadi. Opsiyalar:

| Opsiya | Vazifasi |
| --- | --- |
| `-r` / `--recursive` | Ichki papkalarga kirish (`--max-depth=-1` bilan bir xil) |
| `-t` / `--show-trees` | Ichiga kirilgan papkalarni ham ko'rsatish |
| `--max-depth=<n>` | Har pathspec uchun nechta daraja ichkariga kirish (standart 0 — faqat mos yo'llarning o'zi) |
| `-z` | Qatorlarni NUL bilan tugatish (maxsus belgili nomlar uchun) |

Oraliq bilan ishlatilsa, oraliqda o'zgarmagan fayllar chegara commit'iga `^` bilan yoziladi (sinovda ko'rilgan natija, hujjatda alohida tasvirlanmagan):

```text
$ git last-modified HEAD~3..HEAD
9e640a70a475eacfbb7b97ead1f5dbb5213838f6	qoshimcha.sh
9e640a70a475eacfbb7b97ead1f5dbb5213838f6	kalk.sh
^59380e74aac9c9efb7556f55b58177bafb9368d7	README.md
```

> **Diqqat:** rasmiy hujjat bu buyruqni **EXPERIMENTAL** (tajribaviy) deb belgilagan — xatti-harakati keyingi versiyalarda o'zgarishi mumkin. Skriptlarda bunga tayanishdan oldin o'ylab ko'ring; barqaror muqobil — har fayl uchun `git log -1 --format=%H -- <fayl>`.

## Kod: `git bisect` — qo'lda ikkilik qidiruv

Endi asosiy savolga qaytamiz: `ayirish 10 3` nega `-7` beradi, va qaysi commit buzdi? Biz bilamiz: `v1.0` relizida ayirish to'g'ri ishlagan, hozir (`HEAD`) esa noto'g'ri.

```text
$ git bisect start
status: waiting for both 'good' and 'bad' commits
$ git bisect bad                      # hozirgi commit — yomon
status: waiting for 'good' commit(s), 'bad' commit known
$ git bisect good v1.0                # v1.0 — yaxshi
Bisecting: 3 revisions left to test after this (roughly 2 steps)
[07cab7241b13883fffe4d9b1ae89f39fc9f3b751] Ayirish: bo'sh argumentlar 0 deb olinadi
```

`v1.0` va `HEAD` orasida 8 ta commit bor. Git o'rtadagisini tanladi va uni **working tree'ga chiqardi** (detached HEAD, [17-bob](17-reflar-va-head.md)):

```text
v1.0                                                              HEAD
71aaf55 -- 9c9033f -- 89f3411 -- 31d016b -- 07cab72 -- 59380e7 -- f6f822b -- 1fa08ad -- 9e640a7
 good                                          ^                                          bad
                                         shu yerni sinang
```

Sinaymiz:

```text
$ sh kalk.sh ayirish 10 3
-7
$ git bisect bad
Bisecting: 1 revision left to test after this (roughly 1 step)
[89f3411a38037d227ba95d1da406f6909a7f6c16] Kvadrat amali (qoralama)
$ sh kalk.sh ayirish 10 3
kalk.sh: line 35: syntax error near unexpected token `;;'
kalk.sh: line 35: `	qoshish) qoshish "$@" ;;'
```

Bu commit'da skript umuman ishlamaydi (kvadratdagi qavs yopilmagan) — ayirish xatosi bormi-yo'qmi, bilib bo'lmaydi. Bunday commit'ni "yaxshi" yoki "yomon" deyish noto'g'ri — **o'tkazib yuboramiz**:

```text
$ git bisect skip
Bisecting: 1 revision left to test after this (roughly 1 step)
[31d016b407fd9ae2a3d3dbabd1a94c18bafca1b9] Kvadrat: qavs tuzatildi
$ sh kalk.sh ayirish 10 3
7
$ git bisect good
07cab7241b13883fffe4d9b1ae89f39fc9f3b751 is the first 'bad' commit
commit 07cab7241b13883fffe4d9b1ae89f39fc9f3b751
Author: Dilnoza Karimova <dilnoza@example.com>
Date:   Wed Oct 7 10:40:00 2026 +0500

    Ayirish: bo'sh argumentlar 0 deb olinadi

 kalk.sh | 4 +++-
 1 file changed, 3 insertions(+), 1 deletion(-)
```

Aybdor topildi. Endi `git show 07cab72` bilan uning diff'ini ko'rib, nima buzilganini tushunish mumkin.

> **Pro Git bilan farq.** Kitobdagi chiqishda `... is first bad commit` va o'zgargan fayllar xom `:040000 040000 ... M config` formatida. Hozirgi Git `is the first 'bad' commit` deb yozadi (terminlar qo'shtirnoqda, 2.55 dan beri tanlangan terminlar chiqishda izchil ishlatiladi) va o'zgarishni `--stat` ko'rinishida beradi.

### Ichkarida nima bo'ldi

Bisect holati `.git` ichida oddiy fayllar va ref'lar sifatida saqlanadi:

```text
$ ls .git | grep BISECT
BISECT_ANCESTORS_OK
BISECT_EXPECTED_REV
BISECT_LOG
BISECT_NAMES
BISECT_START
BISECT_TERMS
$ cat .git/BISECT_START          # qayerdan boshlaganmiz
main
$ cat .git/BISECT_TERMS          # qaysi terminlar
bad
good
$ git for-each-ref refs/bisect
07cab7241b13883fffe4d9b1ae89f39fc9f3b751 commit	refs/bisect/bad
31d016b407fd9ae2a3d3dbabd1a94c18bafca1b9 commit	refs/bisect/good-31d016b407fd9ae2a3d3dbabd1a94c18bafca1b9
71aaf55fd428d0fe1ce039ea555a72ee5c0c4788 commit	refs/bisect/good-71aaf55fd428d0fe1ce039ea555a72ee5c0c4788
89f3411a38037d227ba95d1da406f6909a7f6c16 commit	refs/bisect/skip-89f3411a38037d227ba95d1da406f6909a7f6c16
```

- `refs/bisect/bad` — doim **bitta**: hozircha ma'lum eng "erta" yomon commit. Oxirida u aynan birinchi yomon commit'ni ko'rsatib qoladi.
- `refs/bisect/good-<hash>` va `refs/bisect/skip-<hash>` — har belgilangan commit uchun alohida ref (yaxshilar ko'p bo'lishi mumkin).
- Bu ref'lar commit'larni `gc` dan ham himoya qiladi va `git log bisect/bad` kabi nom bilan ishlatish imkonini beradi.

### Tugatish: `git bisect reset`

Bisect tugagach HEAD hali ham detached. Asl joyga qaytish **shart**, aks holda keyingi ishlaringiz g'alati holatda davom etadi:

```text
$ git bisect reset
Previous HEAD position was 31d016b Kvadrat: qavs tuzatildi
Switched to branch 'main'
```

`reset` barcha `BISECT_*` fayllarini va `refs/bisect/*` ref'larini o'chiradi va `BISECT_START` dagi joyga qaytaradi. Boshqa joyga qaytish ham mumkin: `git bisect reset bisect/bad` — birinchi yomon commit'ga, `git bisect reset HEAD` — hozirgi joyda qolish. Yangi `git bisect start` ham eski holatni avtomatik tozalaydi.

Git 2.56 dan boshlab buni avtomatlashtirish mumkin: `git bisect start --reset-when-found` (yoki `git bisect run --reset-when-found`) aybdor topilishi bilan o'zi `reset` qiladi. `=original` (standart) — boshlang'ich joyga, `=found` — topilgan commit'ga:

```text
$ git bisect start HEAD v1.0
...
$ git bisect run --reset-when-found=found ../tekshir.sh
...
bisect found first 'bad' commit
$ git status | head -1
HEAD detached at 07cab72
```

Yana bir 2.56 yangiligi: bisect jarayonida ishlatilayotgan branch'ni `git branch -d` bilan o'chirmoqchi bo'lsangiz, Git endi sababini aniq aytadi.

## Kod: `git bisect run` — to'liq avtomatik

Har commit'da qo'lda sinash zerikarli va xatoga moyil. Agar sinovni skript qila olsangiz, Git butun jarayonni o'zi bajaradi. Skript qoidasi (rasmiy hujjat):

| Chiqish kodi | Ma'nosi |
| --- | --- |
| `0` | Yaxshi (good / old) |
| `1`–`127`, **`125` dan tashqari** | Yomon (bad / new) |
| `125` | Bu commit'ni sinab bo'lmaydi — `skip` |
| boshqasi (masalan, `255`, `128+`) | Bisect'ni to'xtatadi |

`125` tasodifan tanlanmagan: `126` va `127` POSIX shell'da "buyruq bajarilmaydi" va "buyruq topilmadi" uchun band, `125` esa ulardan oldingi eng katta "xavfsiz" qiymat. Ehtiyot bo'ling: C'dagi `exit(-1)` aslida `255` beradi va bisect'ni to'xtatadi.

Bizning sinov skripti (repo'dan **tashqarida** — bisect commit'larni almashtirganda skript yo'qolib qolmasin yoki o'zgarmasin; rasmiy hujjat ham shuni tavsiya qiladi):

```bash
$ cat ../tekshir.sh
#!/bin/sh
# 0 — yaxshi, 1 — yomon, 125 — bu commit'ni tekshirib bo'lmaydi
sh -n kalk.sh 2>/dev/null || exit 125
natija=$(sh kalk.sh ayirish 10 3)
[ "$natija" = 7 ]
```

`sh -n` faylni bajarmasdan faqat sintaksisini tekshiradi — sintaksis buzuq bo'lsa, `125` (skip). Oxirgi qatordagi `[ ... ]` ning natijasi skriptning chiqish kodi bo'ladi: `7` bo'lsa `0`, bo'lmasa `1`.

`bisect start` ga yomon va yaxshi commit'larni darhol berish mumkin — **avval yomon, keyin yaxshi(lar)**:

```text
$ git bisect start HEAD v1.0
Bisecting: 3 revisions left to test after this (roughly 2 steps)
[07cab7241b13883fffe4d9b1ae89f39fc9f3b751] Ayirish: bo'sh argumentlar 0 deb olinadi
$ git bisect run ../tekshir.sh
running '../tekshir.sh'
Bisecting: 1 revision left to test after this (roughly 1 step)
[89f3411a38037d227ba95d1da406f6909a7f6c16] Kvadrat amali (qoralama)
running '../tekshir.sh'
Bisecting: 1 revision left to test after this (roughly 1 step)
[31d016b407fd9ae2a3d3dbabd1a94c18bafca1b9] Kvadrat: qavs tuzatildi
running '../tekshir.sh'
07cab7241b13883fffe4d9b1ae89f39fc9f3b751 is the first 'bad' commit
commit 07cab7241b13883fffe4d9b1ae89f39fc9f3b751
Author: Dilnoza Karimova <dilnoza@example.com>
Date:   Wed Oct 7 10:40:00 2026 +0500

    Ayirish: bo'sh argumentlar 0 deb olinadi

 kalk.sh | 4 +++-
 1 file changed, 3 insertions(+), 1 deletion(-)
bisect found first 'bad' commit
$ git bisect reset
```

Natija qo'lda qilganimiz bilan bir xil, lekin inson aralashuvisiz. Real loyihada skript o'rniga `make`, `make test`, `npm test` kabilarni ham bevosita berish mumkin. Qisqa sinov uchun alohida fayl shart emas:

```bash
$ git bisect run sh -c 'make || exit 125; ./sinov.sh'
```

Rasmiy hujjat yana bir murakkab usulni ko'rsatadi: eski commit'lar boshqa (bisect qilinmayotgan) xato tufayli yig'ilmasa, skript har qadamda tuzatish branch'ini `git merge --no-commit --no-ff hot-fix` bilan vaqtincha qo'shadi, sinaydi, keyin `git reset --hard` bilan tozalab, natija kodini qaytaradi.

## Kod: o'tkazib yuborish chegarasi va o'z terminlaringiz

**Muammo.** `skip` qilingan commit aybdorga **qo'shni** bo'lsa, Git qaysi biri birinchi ekanini aniqlay olmaydi.

Buni ko'rish uchun boshqa savol beramiz: "`kvadrat` amali qaysi commit'da ishlay boshlagan?" Bu xato emas, xususiyat — "yaxshi/yomon" so'zlari bu yerda chalg'itadi. Shuning uchun o'z terminlarimizni olamiz: `yoq` (eski holat — kvadrat yo'q) va `bor` (yangi holat):

```text
$ git bisect start --term-old=yoq --term-new=bor
status: waiting for both 'yoq' and 'bor' commits
$ git bisect terms
Your current terms are 'yoq' for the old state
and 'bor' for the new state.
$ git bisect bor HEAD
status: waiting for 'yoq' commit(s), 'bor' commit known
$ git bisect yoq v1.0
Bisecting: 3 revisions left to test after this (roughly 2 steps)
[07cab7241b13883fffe4d9b1ae89f39fc9f3b751] Ayirish: bo'sh argumentlar 0 deb olinadi
$ git bisect run sh -c 'sh -n kalk.sh 2>/dev/null || exit 125; [ "$(sh kalk.sh kvadrat 5)" != 25 ]'
...
[9c9033f7bcaa6961e1fc2fdfbb3ec35d05b45abd] Foiz amali
running 'sh' '-c' 'sh -n kalk.sh 2>/dev/null || exit 125; [ "$(sh kalk.sh kvadrat 5)" '\!'= 25 ]'
noma'lum amal: kvadrat
There are only 'skip'ped commits left to test.
The first 'bor' commit could be any of:
89f3411a38037d227ba95d1da406f6909a7f6c16
31d016b407fd9ae2a3d3dbabd1a94c18bafca1b9
We cannot bisect more!
error: bisect run cannot continue any more
```

Skript mantig'iga e'tibor bering: `0` = **eski** holat. Kvadrat ishlamasa (`!= 25` rost) — `0`, ya'ni `yoq`; ishlasa — `1`, ya'ni `bor`.

Git halol javob berdi: kvadrat `89f3411` da qo'shilgan, lekin u commit buzuq bo'lgani uchun o'tkazib yuborilgan; demak birinchi `bor` commit — `89f3411` yoki `31d016b`. Bunday holatda o'zingiz qaror qilasiz (masalan, `git show 89f3411` bilan qarab). Terminlar haqida:

- `good`/`bad` o'rniga tayyor `old`/`new` juftligi ham bor; `--term-old`/`--term-new` (yoki `--term-good`/`--term-bad`) bilan istalgan nom (faqat `reset`, `start` kabi subbuyruq nomlari emas).
- Bitta sessiyada `good`/`bad` va `old`/`new` ni aralashtirib bo'lmaydi.
- `git bisect terms --term-old` faqat eski terminni chiqaradi.
- Tipik qo'llanishlar: `--term-old fast --term-new slow` (tezlik pasaygan commit), `--term-old broken --term-new fixed` (xatoni **tuzatgan** commit'ni topish).

`skip` oraliq ham qabul qiladi: `git bisect skip v2.5..v2.6` — `v2.5` dan keyingi va `v2.6` gacha (shu jumladan) commit'lar sinalmaydi. Oralig'ning birinchi commit'ini ham qo'shish uchun: `git bisect skip v2.5 v2.5..v2.6`.

## Kod: xato belgilasangiz — `log` va `replay`

Qo'lda bisect qilganda adashish oson: bir commit'ni "good" deb belgiladingiz, keyin bilsangiz, u sinab bo'lmaydigan commit edi. Butun jarayonni boshidan takrorlash shart emas. `git bisect log` hamma qadamni **qayta bajariladigan skript** ko'rinishida beradi:

```text
$ git bisect start HEAD v1.0
$ git bisect bad                      # 07cab72 — yomon (to'g'ri)
Bisecting: 1 revision left to test after this (roughly 1 step)
[89f3411a38037d227ba95d1da406f6909a7f6c16] Kvadrat amali (qoralama)
$ git bisect good                     # XATO: bu commit sinab bo'lmaydigan edi
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[31d016b407fd9ae2a3d3dbabd1a94c18bafca1b9] Kvadrat: qavs tuzatildi
$ git bisect log > ../bisect.log
$ git bisect reset
```

Faylni tahrirlaymiz — `good 89f3411...` qatorini `skip` ga almashtiramiz (`#` bilan boshlangan qatorlar faqat izoh):

```text
$ tail -3 ../bisect.log
git bisect bad 07cab7241b13883fffe4d9b1ae89f39fc9f3b751
# good: [89f3411a38037d227ba95d1da406f6909a7f6c16] Kvadrat amali (qoralama)
git bisect skip 89f3411a38037d227ba95d1da406f6909a7f6c16
$ git bisect replay ../bisect.log
Bisecting: 3 revisions left to test after this (roughly 2 steps)
[07cab7241b13883fffe4d9b1ae89f39fc9f3b751] Ayirish: bo'sh argumentlar 0 deb olinadi
Bisecting: 1 revision left to test after this (roughly 1 step)
[31d016b407fd9ae2a3d3dbabd1a94c18bafca1b9] Kvadrat: qavs tuzatildi
```

Bisect to'g'rilangan holatdan davom etadi. `bisect log` jamoadoshga "men nimani tekshirdim" deb yuborish uchun ham qulay.

## Kod: bisect'ning boshqa imkoniyatlari

**Qolgan gumondorlarni ko'rish.** `git bisect visualize` (yoki `view`) grafik muhit bo'lsa `gitk` ni ochadi, bo'lmasa `git log` ni ishlatadi va `git log` opsiyalarini qabul qiladi:

```text
$ git bisect visualize --oneline
07cab72 Ayirish: bo'sh argumentlar 0 deb olinadi
31d016b Kvadrat: qavs tuzatildi
89f3411 Kvadrat amali (qoralama)
9c9033f Foiz amali
```

Grafik muhit `DISPLAY`, `SESSIONNAME`, `MSYSTEM` yoki `SECURITYSESSIONID` muhit o'zgaruvchilari bo'yicha aniqlanadi.

**Qidiruvni toraytirish.**

| Usul | Misol | Foydasi |
| --- | --- | --- |
| Pathspec | `git bisect start -- src/hisob/` | Faqat shu yo'llarga tegingan commit'lar sinaladi |
| Bir nechta yaxshi | `git bisect start v2.6.20-rc6 v2.6.20-rc4 v2.6.20-rc1 --` | Birinchisi — yomon, qolganlari — yaxshi; oraliq kichrayadi |
| `--first-parent` | `git bisect start --first-parent` | Merge'larda faqat birinchi ota: aybdor sifatida **merge commit** topiladi, merge qilingan branch ichidagi buzuq (yig'ilmaydigan) commit'lar chetlab o'tiladi |
| `--no-checkout` | `git bisect start --no-checkout HEAD v1.0` | Working tree o'zgarmaydi, faqat `BISECT_HEAD` ref'i yangilanadi — sinov fayllarga emas, obyektlarga qarasa (bare repo'da avtomatik) |

**Qo'lda boshqa commit tanlash.** Git taklif qilgan commit noqulay bo'lsa, `git reset --hard HEAD~3` kabi bilan yonidagini olib, uni sinab belgilash mumkin. `git bisect next` — boshqa commit'ga o'tib ketganingizdan keyin bisect'ni davom ettirish (keyingi sinov commit'ini qayta hisoblash).

## Muhandislik nuqtai nazari: `bisect` ishlashi uchun tarix qanday bo'lishi kerak

`bisect` ning kuchi tarix sifatiga bog'liq:

1. **Har commit yig'ilsin va testlar o'tsin.** Agar "WIP", "yarim tayyor" commit'lar ko'p bo'lsa, ko'p `skip` bo'ladi — va biz ko'rganimizdek, skip aybdorga qo'shni bo'lsa, javob noaniq bo'ladi. Atomar commit ([10-bob](10-yaxshi-commit.md)) va interaktiv rebase bilan tozalash ([25-bob](25-tarixni-qayta-yozish.md)) aynan shuning uchun muhim.
2. **Commit kichik bo'lsin.** Bisect "qaysi commit" deb javob beradi. Commit 2000 qatorlik bo'lsa, javob deyarli foydasiz.
3. **Sinov qayta takrorlanadigan bo'lsin.** Tarmoqqa, vaqtga, tasodifiy songa bog'liq "ba'zan o'tadi" test bisect'ni noto'g'ri yo'lga olib ketadi. Bitta noto'g'ri belgi — butun natija noto'g'ri.
4. **Avval xatoni takrorlovchi sinov yozing.** Bu — `bisect run` uchun skript ham, keyin tuzatish uchun regression test ham.

Qadamlar soni: `n` ta commit uchun taxminan `⌈log₂ n⌉`. 8 ta — 3 qadam, 1000 ta — 10, 1 000 000 ta — 20. Shuning uchun bisect yuzlab commit'ni bir necha daqiqada tekshiradi.

## Muhandislik nuqtai nazari: `blame` — "kim aybdor" emas, "nega shunday"

`blame` nomi chalg'itadi. Uning asosiy foydasi — **kontekst**: qator qaysi commit'da paydo bo'lgan, demak u qaysi vazifa, qaysi muhokama, qaysi xabar bilan bog'liq. Odatiy ish oqimi:

```text
git blame -w -L :funksiya fayl     →  commit hash
git show <hash>                    →  to'liq o'zgarish va commit xabari
git log <hash> -1 --format=%B      →  "nega" degan savolga javob (agar xabar yaxshi yozilgan bo'lsa)
```

Shu sababli yaxshi commit xabari ([10-bob](10-yaxshi-commit.md)) — kelajakda `blame` qiladigan odam (ko'pincha o'zingiz) uchun yozilgan xat.

Amaliy tavsiyalar:

- **`-w` ni odat qiling** — indentatsiya o'zgarishlari aksariyat repo'larda shovqin.
- **Katta format commit'larini** (formatlovchi joriy qilish, tab→space) alohida commit qiling va hash'ini darhol `.git-blame-ignore-revs` ga yozing. GitHub ham shu nomli faylni tushunadi.
- **Kod ko'chirilgan bo'lsa** `-C` (kerak bo'lsa `-C -C` va kichikroq `<n>`) — aks holda "muallif" ko'chirgan odam bo'lib chiqadi.
- **O'chirilgan kod** uchun `blame` emas, `git log -S` / `-G` ([40-bob](40-qidiruv.md)); funksiya tarixi uchun `git log -L :funksiya:fayl`.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `blame` dagi ismni "xatoni shu odam qilgan" deb tushunish | Qator format, ko'chirish yoki merge commit'iga tegishli bo'lishi mumkin | `-w`, `-C`, `--ignore-rev` bilan qayta tekshiring, `git show <hash>` bilan diff'ni o'qing |
| `^708ef6c` dagi `^` ni "ota commit" deb o'qish | `blame` da `^` — chegara (root yoki oraliq chegarasi) commit'i | Kontekstga qarang; `--root` yoki `-b` bilan o'chiring |
| `-C` hech narsa topmadi — "ko'chirilmagan ekan" deb xulosa | Standart chegara 40 harf-raqam belgi, qisqa bloklar o'tib ketadi | `-C10` kabi kichikroq `<n>`, `--score-debug` bilan tekshiring |
| `.git-blame-ignore-revs` ga qisqa hash yozish | Fayl formati to'liq hash talab qiladi | `git rev-parse <qisqa>` bilan to'liq hash'ni oling |
| `blame.ignoreRevsFile` ni global config'ga qo'yish | Fayli yo'q repo'da `blame` `fatal` bilan to'xtaydi | Local config yoki `:(optional)` prefiksi (2.52+) |
| Bisect'dan keyin `git bisect reset` ni unutish | HEAD detached, `refs/bisect/*` qoladi, yangi commit'lar hech bir branch'da bo'lmaydi | Har doim `reset`; yoki `--reset-when-found` (2.56+) |
| Sinab bo'lmaydigan commit'ni `good`/`bad` deb belgilash | Natija butunlay noto'g'ri bo'lishi mumkin | `git bisect skip`; skriptda `exit 125` |
| Sinov skriptini repo ichiga qo'yish | Bisect eski commit'larni chiqarganda skript yo'qoladi yoki eski versiyasi ishlaydi | Skriptni repo'dan tashqarida saqlang |
| Skriptdan `exit -1` yoki `exit 255` qaytarish | Bisect "yomon" deb emas, to'xtatish deb tushunadi | Yomon uchun `1`, sinab bo'lmasa `125` |
| `old`/`new` mantig'ini teskari yozish | Git teskari commit'ni topadi | Eslang: `0` = eski holat (`good`/`old`) |
| Beqaror ("ba'zan o'tadigan") testni `bisect run` da ishlatish | Bitta noto'g'ri javob butun qidiruvni buzadi | Sinovni deterministik qiling yoki bir necha marta ishga tushiring |

## Amaliyot

1. Istalgan repo'da bitta fayl uchun `git blame` va `git blame -w` chiqishini solishtiring. Qaysi qatorlarning egasi o'zgardi va nega?
2. `git blame -L :<funksiya> <fayl>` bilan bitta funksiyani izohlang, so'ng shu funksiyani `git log -L :<funksiya>:<fayl>` bilan ([40-bob](40-qidiruv.md)) solishtiring — biri "hozirgi holat egalari"ni, ikkinchisi "o'zgarishlar tarixi"ni ko'rsatishini tushuntiring.
3. Repo'da faqat indentatsiyani o'zgartiradigan commit qiling, uning to'liq hash'ini `.git-blame-ignore-revs` ga yozing va `blame.ignoreRevsFile` ni sozlang. `blame.markIgnoredLines` ni yoqib, `?` belgisini ko'ring.
4. Bir faylning 50+ belgili funksiyasini boshqa faylga ko'chirib commit qiling. `git blame`, `git blame -C` va `git blame -C -C` natijalarini solishtiring. Funksiya qisqa bo'lsa `--score-debug` bilan ballini ko'ring.
5. 10 ta commit'li repo yarating, 6-commit'da ataylab xato kiriting. `git bisect` ni qo'lda bajaring, keyin `git bisect log` ni saqlang.
6. Xuddi shu repo'da sinov skriptini repo'dan tashqarida yozing va `git bisect run` bilan aybdorni avtomatik toping. Qadamlar soni `log₂(10)` ga mos kelishini tekshiring.
7. 5-commit'ni yig'ilmaydigan qilib (sintaksis xatosi) qayta yarating va skriptga `exit 125` qo'shing. Aybdor skip qilingan commit'ga qo'shni bo'lsa Git nima deyishini ko'ring.
8. (Qiyinroq) `--term-old broken --term-new fixed` bilan xatoni **tuzatgan** commit'ni toping: avval xato kiriting, keyinroq tuzating, so'ng bisect'ni `--reset-when-found=found` bilan ishga tushiring va oxirida qaysi commit'da turganingizni `git status` bilan tekshiring.

## Rasmiy hujjat

- Pro Git — Debugging with Git: <https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git>
- `git blame`: <https://git-scm.com/docs/git-blame>
- `git bisect`: <https://git-scm.com/docs/git-bisect>
- `git last-modified`: <https://git-scm.com/docs/git-last-modified>
- `git annotate`: <https://git-scm.com/docs/git-annotate>
- Fighting regressions with git bisect: <https://git-scm.com/docs/git-bisect-lk2009>
