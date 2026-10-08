# 10 — Yaxshi commit

[← Oldingi: Tarixni ko'rish: `log`](09-tarixni-korish.md) · [Mundarija](README.md) · [Keyingi: Bekor qilish: `amend` va `restore` →](11-bekor-qilish.md)

## Tushuncha

Oldingi boblarda commit'ni **qanday** qilishni o'rgandik: `git add`, keyin `git commit`. Bu bob boshqa savolga javob beradi — **qanday commit yaxshi**.

Eslatma: **commit** — loyihaning ma'lum paytdagi to'liq surati (snapshot) va unga biriktirilgan xabar: kim, qachon, nega. Surat Git uchun, xabar esa odamlar uchun. Bir yildan keyin bu tarixni siz, hamkasbingiz yoki `git blame` ([41-bob](41-blame-va-bisect.md)) bilan qator muallifini qidirayotgan begona dasturchi o'qiydi.

Pro Git va Git loyihasining o'z qo'llanmasi (`Documentation/SubmittingPatches`) yaxshi commit'ni uchta talab bilan ta'riflaydi:

| Talab | Ma'nosi | Bu bobda |
| --- | --- | --- |
| **Toza o'zgarish** | Ortiqcha bo'sh joy (whitespace) xatolari yo'q | `git diff --check` |
| **Atomar commit** | Bitta commit — bitta mantiqiy o'zgarish | `git add -p`, yo'l bilan commit |
| **Yaxshi xabar** | Qisqa sarlavha, bo'sh qator, "nega"ni tushuntiruvchi tana | xabar tuzilishi, shablon, trailer'lar |

Bularning hech biri Git tomonidan majburlanmaydi — Git har qanday xabarni, har qanday hajmdagi commit'ni qabul qiladi. Lekin Git'ning ko'p asboblari (`log --oneline`, `format-patch`, `rebase`, `bisect`, `revert`) shu kelishuvlarga tayanib qurilgan. Kelishuvga rioya qilsangiz, asboblar siz uchun ishlaydi.

Bobning oxirida **Conventional Commits** — Git'ga aloqasi yo'q, lekin ko'p jamoalar qabul qilgan tashqi kelishuv — ham ko'rib chiqiladi.

## Nega shunday: nega xabar kodning o'zidan muhim bo'lishi mumkin

Kod **nima** qilinayotganini ko'rsatadi. Lekin **nega** — kodda yo'q. Git loyihasi qo'llanmasi buni ikki sabab bilan tushuntiradi:

1. **Kod siz xohlagan ishni qilmayotgan bo'lishi mumkin.** Agar xabarda "aslida nimaga erishmoqchi edim" yozilgan bo'lsa, keyingi dasturchi xatoni topib, kodni niyatga moslab tuzata oladi. Qo'shimcha foyda: xabarni yozayotganda ko'pincha o'z xatongizni o'zingiz topasiz.
2. **Kod faqat hozirgi ehtiyojni qoplashi mumkin.** Masalan, "X ni faqat papkalarga qilamiz, chunki papkalarda Y xususiyat bor" deb yozsangiz, keyingi odam "fayllarda ham Y bor ekan — demak, X ni ularga ham qilsa bo'ladi" deb xulosa chiqara oladi. Yoki aksincha, "fayllarga qilmadik, chunki ..." degan izoh uni behuda ishdan saqlaydi.

Xulosa: **xabarning maqsadi — o'zgarish ortidagi "nega"ni kelajakdagi dasturchiga yetkazish.**

Atomar commit'ning sababi esa boshqa: Pro Git'da aytilganidek, branch uchidagi yakuniy surat bitta commit qilsangiz ham, beshta qilsangiz ham **bir xil**. Farq faqat tarixni o'qiydigan va ishlatadigan odamda: kichik, mantiqan alohida commit'larni ko'rib chiqish (review) oson, keyin bittasini `revert` ([26-bob](26-murakkab-merge.md)) yoki `cherry-pick` ([34-bob](34-loyihani-yuritish.md)) qilish mumkin, `bisect` ([41-bob](41-blame-va-bisect.md)) esa xatoni kichik commit'gacha toraytiradi.

## Kod: whitespace xatolarini tekshirish

**Whitespace** — ko'rinmaydigan belgilar: probel, tab, qator oxiri. Ular ko'zga tashlanmaydi, lekin diff'da "o'zgarish" bo'lib chiqadi va boshqa dasturchilarni bezovta qiladi (ayniqsa merge'da keraksiz konflikt beradi). Pro Git birinchi qoida sifatida shuni aytadi: commit'da whitespace xatolari bo'lmasin.

Tekshiruv buyrug'i — `git diff --check`. Faylga ataylab uchta xato kiritamiz: qator oxirida probel, tab oldida probel va fayl oxirida ortiqcha bo'sh qatorlar:

```bash
$ printf 'def salom(ism):   \n \t  return "Salom, " + ism\n\n\n' > app.py
$ git diff --check
app.py:1: trailing whitespace.
+def salom(ism):   
app.py:2: space before tab in indent.
+ 	  return "Salom, " + ism
app.py:3: new blank line at EOF.
$ echo $?
2
```

Har xato fayl nomi va qator raqami bilan chiqadi. Xato topilsa, buyruq **nolga teng bo'lmagan** kod bilan tugaydi (bu yerda `2`) — shuning uchun uni skript yoki hook ichida ishlatish qulay.

`git diff --check` ham oddiy `git diff` kabi **working tree va index** o'rtasidagi farqni tekshiradi ([07-bob](07-diff.md)). Fayl stage qilingan bo'lsa, u hech narsa ko'rmaydi — commit'ga ketadigan narsani tekshirish uchun `--cached` kerak:

```bash
$ git add app.py
$ git diff --check
$ echo $?
0
$ git diff --cached --check
app.py:1: trailing whitespace.
+def salom(ism):   
app.py:2: space before tab in indent.
+ 	  return "Salom, " + ism
app.py:3: new blank line at EOF.
$ echo $?
2
```

Commit'dan oldin odat qilib oling: `git diff --cached --check` (yoki hech narsa stage qilinmagan bo'lsa — `git diff --check`).

### Nima xato hisoblanadi: `core.whitespace`

Ma'lumotnomaga ko'ra, standart holatda uchta narsa xato:

| Nom | Ma'nosi | Standart |
| --- | --- | --- |
| `blank-at-eol` | Qator oxiridagi probel/tab (faqat bo'sh joydan iborat qator ham) | yoqilgan |
| `space-before-tab` | Qator boshidagi chekinishda tab'dan oldin probel | yoqilgan |
| `blank-at-eof` | Fayl oxiriga qo'shilgan bo'sh qatorlar | yoqilgan |
| `indent-with-non-tab` | Chekinish tab o'rniga probellar bilan qilingan | o'chiq |
| `tab-in-indent` | Chekinishda tab ishlatilgan | o'chiq |
| `cr-at-eol` | Qator oxiridagi `\r` ni qator tugashining bir qismi deb hisoblash (Windows fayllari uchun) | o'chiq |
| `incomplete-line` | Fayl oxirgi qatori yangi qator belgisisiz tugagan | o'chiq |
| `trailing-space` | `blank-at-eol` + `blank-at-eof` ning qisqa nomi | — |
| `tabwidth=<n>` | Tab necha belgi (1–63, standart 8) | — |

Ro'yxat vergul bilan beriladi, oldiga `-` qo'yilsa — o'chiriladi (masalan `-trailing-space`). Probellar bilan chekinadigan loyiha (Python, YAML) tab'larni ham xato deb belgilashi mumkin:

```bash
$ printf 'def salom(ism):\n\treturn "Salom, " + ism\n' > app.py
$ git diff --check
$ echo $?
0
$ git -c core.whitespace=tab-in-indent diff --check
app.py:2: tab in indent.
+	return "Salom, " + ism
$ echo $?
2
```

Doimiy qilish uchun: `git config core.whitespace tab-in-indent` (shu repo uchun) yoki `--global`. `git config` darajalari [03-bobda](03-birinchi-sozlash.md), whitespace sozlamalari batafsil [45-bobda](45-config-chuqur.md). Shu sozlama `git diff` dagi qizil belgilashga (`color.diff.whitespace`) va `git apply --whitespace=error` ga ham ta'sir qiladi.

### Avtomatik tekshiruv: `pre-commit` hook

Har safar qo'lda tekshirishni unutish oson. Git har repo'ga namuna hook'lar qo'yadi — ulardan biri aynan whitespace'ni tekshiradi:

```bash
$ ls .git/hooks
applypatch-msg.sample
commit-msg.sample
...
pre-commit.sample
...
$ tail -2 .git/hooks/pre-commit.sample
# If there are whitespace errors, print the offending file names and fail.
exec git diff-index --check --cached $against --
```

`.sample` qo'shimchasi bor ekan, hook ishlamaydi. Nusxa olsak — yoqiladi:

```bash
$ cp .git/hooks/pre-commit.sample .git/hooks/pre-commit
$ printf 'def salom(ism):   \n    return "Salom, " + ism\n' > app.py
$ git add app.py
$ git commit -m "Bo'sh joy xatosi"
app.py:1: trailing whitespace.
+def salom(ism):   
$ echo $?
1
$ git log --oneline
c71e152 Boshlang'ich kod
```

Commit yaratilmadi. Git loyihasining o'zi ham hissa qo'shuvchilardan shu namuna hook'dan o'tishni talab qiladi. Hook'ni chetlab o'tish mumkin — `git commit --no-verify` (`-n`) `pre-commit` va `commit-msg` hook'larini ishga tushirmaydi. Bu favqulodda holat uchun, odat uchun emas. Hook'lar haqida to'liq — [47-bob](47-hooklar.md).

## Kod: atomar commit — bitta commit, bitta o'zgarish

**Muammo.** Pro Git misoli: dam olish kunlari besh xil vazifa ustida ishlab, dushanba kuni hammasini bitta katta commit qilib yubormang. Bunday commit'ni ko'rib chiqib bo'lmaydi, undagi bitta o'zgarishni bekor qilib bo'lmaydi.

**Yechim.** Hatto ish davomida commit qilmagan bo'lsangiz ham, staging hududi ([05-bob](05-uch-holat.md)) yordamida ishni keyin bo'laklarga ajrata olasiz — har vazifaga kamida bitta commit, har biriga o'z xabari.

Misol: `app.py` da ikki **mustaqil** o'zgarish (`salom()` ni f-string'ga o'tkazish va `ortacha()` dagi xatoni tuzatish) va `README.md` da hujjat qo'shimchasi:

```bash
$ git status -s
 M README.md
 M app.py
$ git diff app.py
diff --git a/app.py b/app.py
index 8fb2d6a..b914e01 100644
--- a/app.py
+++ b/app.py
@@ -1,5 +1,5 @@
 def salom(ism):
-    return "Salom, " + ism
+    return f"Salom, {ism}!"
 
 
 def yigindi(sonlar):
@@ -10,4 +10,6 @@ def yigindi(sonlar):
 
 
 def ortacha(sonlar):
+    if not sonlar:
+        return 0
     return yigindi(sonlar) / len(sonlar)
```

Ikki o'zgarish bitta faylda bo'lgani uchun `git add app.py` ularni ajrata olmaydi. Buning uchun `git add --patch` (`-p`) bor: u diff'ni **hunk**'larga (o'zgarish bo'laklariga) bo'lib, har biri uchun "stage qilaymi?" deb so'raydi. Birinchisiga `n`, ikkinchisiga `y`:

```bash
$ git add -p app.py
...
(1/2) Stage this hunk [y,n,q,a,d,k,K,j,J,g,/,e,p,P,?]? n
...
(2/2) Stage this hunk [y,n,q,a,d,K,J,g,/,e,p,P,?]? y

$ git status -s
 M README.md
MM app.py
$ git diff --cached
diff --git a/app.py b/app.py
index 8fb2d6a..f8c40eb 100644
--- a/app.py
+++ b/app.py
@@ -10,4 +10,6 @@ def yigindi(sonlar):
 
 
 def ortacha(sonlar):
+    if not sonlar:
+        return 0
     return yigindi(sonlar) / len(sonlar)
```

`MM` — `app.py` ning bir qismi stage qilingan, bir qismi yo'q. Index'da faqat tuzatish turibdi. Commit qilamiz, keyin qolganlarini alohida:

```bash
$ git commit -F ../xabar.txt          # tuzatish, xabar fayldan (pastda)
[main 9e0b3cc] Bo'sh ro'yxatda ortacha() xato bermasin
 1 file changed, 2 insertions(+)
$ git add app.py
$ git commit -q -m "salom() da f-string ishlatish" -m "Qatorlarni + bilan qo'shish o'rniga f-string o'qishga osonroq va oxiriga undov belgisi qo'shildi."
$ git commit -q -a -m "README: ishga tushirish buyrug'ini qo'shish"
$ git log --oneline
5a49032 README: ishga tushirish buyrug'ini qo'shish
e73da43 salom() da f-string ishlatish
9e0b3cc Bo'sh ro'yxatda ortacha() xato bermasin
edc5341 Yig'indi va o'rtacha funksiyalari
c71e152 Boshlang'ich kod
```

Uchta o'zgarish — uchta commit. Endi f-string o'zgarishi yoqmasa, faqat `e73da43` ni bekor qilish mumkin, tuzatish joyida qoladi. `add -p` ning barcha buyruqlari (`s` — bo'lish, `e` — qo'lda tahrirlash) [37-bobda](37-interaktiv-staging.md).

Bir nechta `-m` berilsa, ma'lumotnomaga ko'ra ular **alohida paragraflar** sifatida qo'shiladi — ikkinchi `-m` tana bo'ladi:

```bash
$ git log -1 --format='%B' e73da43
salom() da f-string ishlatish

Qatorlarni + bilan qo'shish o'rniga f-string o'qishga osonroq va oxiriga undov belgisi qo'shildi.
```

### Fayl nomi bilan commit

Yana bir usul — `git commit <yo'l>`. Ma'lumotnomaga ko'ra, yo'l berilsa, commit **faqat shu fayllarning working tree'dagi holatini** yozadi, index'da oldindan stage qilingan boshqa fayllar esa bu commit'ga kirmaydi (lekin index'da qolaveradi). Ma'lumotnomadagi misol:

```bash
# hello.c, hello.h tahrirlandi va stage qilindi; Makefile ham tahrirlandi
git commit Makefile     # faqat Makefile o'zgarishi commit qilinadi
git commit              # endi hello.c va hello.h
```

Bu rejimning nomi `-o` (`--only`) va yo'l berilganda u standart. Uning teskarisi `-i` (`--include`): index'dagilarga qo'shimcha ravishda berilgan fayllarni ham olish. Hech qaysi usul bo'linmaydigan bo'laklar uchun yaramaydi — bitta faylning ichidagi ikki o'zgarishni faqat `add -p` ajratadi.

### Atomarlikning chegarasi

Git loyihasi qo'llanmasi muhim belgi beradi: **agar xabaringiz juda uzun bo'lib ketsa — commit'ni maydaroq qismlarga bo'lish kerakligining belgisi.** Boshqa tomondan, haddan tashqari maydalash ham yomon: commit o'z-o'zidan to'liq bo'lsin — kod kompilyatsiya bo'lsin, testlar o'tsin. Yarim funksiya bitta commit'da, ikkinchi yarmi boshqasida bo'lsa, `bisect` "buzuq" oraliq holatga tushib qoladi.

Shu qo'llanma yana talab qiladi: xato tuzatilsa — shu xatoni ushlaydigan test ham qo'shilsin; yangi imkoniyat qo'shilsa — u kerakli joyda ishlashini **va** kerak bo'lmagan joyda ishlamasligini ko'rsatadigan testlar. Hujjat o'zgarsa — u ham shu commit'da.

Pro Git maslahati: tarix boshqa odamga yuborilishidan **oldin** uni tozalash uchun interaktiv staging va tarixni qayta yozish asboblaridan foydalaning ([25-bob](25-tarixni-qayta-yozish.md)). Allaqachon qilingan commit'ni tuzatish — keyingi bob ([11-bob](11-bekor-qilish.md)).

## Kod: xabar tuzilishi — sarlavha, bo'sh qator, tana

Pro Git (Tim Pope'ning mashhur maslahatidan moslashtirilgan) va `git commit` ma'lumotnomasining DISCUSSION bo'limi bir xil tuzilishni tavsiya qiladi:

```text
Qisqa sarlavha (50 belgigacha)                       ← 1-qator: sarlavha (title, subject)
                                                     ← 2-qator: BO'SH
Batafsil tushuntirish, kerak bo'lsa. Taxminan 72     ← 3-qatordan: tana (body)
belgidan keyin qatorni bo'ling.

Keyingi paragraflar bo'sh qatordan keyin keladi.

- Ro'yxat ham bo'lishi mumkin
- Odatda chiziqcha yoki yulduzcha, keyin bitta probel
```

Pro Git'dagi shablonning asosiy qoidalari:

| Qoida | Nega |
| --- | --- |
| Sarlavha ~50 belgigacha | `git log --oneline`, GitHub ro'yxatlari, email mavzusi — hammasi bitta qatorni ko'rsatadi |
| Sarlavhadan keyin **bo'sh qator** | Git sarlavha bilan tanani shu bo'yicha ajratadi (pastda isbot) |
| Tana ~72 belgida bo'linadi | Git matnni o'zi qatorlarga bo'lmaydi; ba'zi joylarda (masalan email) sarlavha mavzu, qolgani xat matni sifatida o'qiladi |
| **Buyruq shaklida** yozing: "Fix bug", "Fixed bug" yoki "Fixes bug" emas | Git o'zi yaratadigan xabarlar (`Merge branch ...`, `Revert "..."`) ham shunday |
| Tanada — motivatsiya va avvalgi xatti-harakat bilan solishtirish | Git loyihasi buni talab qiladi |

O'zbekchada "buyruq shakli" — `qo'shish`, `tuzatish`, `olib tashlash` (harakat nomi) yoki `qo'sh`, `tuzat` (buyruq mayli). Jamoada bittasini tanlab, unga rioya qiling. "Qo'shildi", "tuzatdim" kabi o'tgan zamon ishlatmang — sarlavha "bu commit qo'llansa, nima bo'ladi" degan savolga javob beradi.

### Nega bo'sh qator shunchalik muhim

Ma'lumotnoma: **birinchi bo'sh qatorgacha bo'lgan matn — commit sarlavhasi**, va Git uni hamma joyda shunday ishlatadi. Bo'sh qatorni tashlab ketsak nima bo'lishini ko'ramiz:

```bash
$ printf "Kirish sahifasini tuzatish\nParol maydoni bo'sh bo'lsa forma yuborilmaydi.\n" > xabar.txt
$ git commit -q -F xabar.txt
$ git log --oneline
d16f2cb Kirish sahifasini tuzatish Parol maydoni bo'sh bo'lsa forma yuborilmaydi.
$ git log -1 --format='[%s]'
[Kirish sahifasini tuzatish Parol maydoni bo'sh bo'lsa forma yuborilmaydi.]
$ git log -1 --format='[%b]'
[]
```

Ikki qator **bitta sarlavhaga** yopishib ketdi (`%s` — sarlavha, `%b` — tana; format belgilar [09-bobda](09-tarixni-korish.md)), tana esa bo'sh. Pro Git ogohlantiradi: bunday xabarlar bilan `rebase` kabi asboblar sizni chalg'itadi.

To'g'ri tuzilgan xabar bilan solishtiring. Yuqorida tuzatish commit'ini fayldan qilgan edik:

```text
Bo'sh ro'yxatda ortacha() xato bermasin

ortacha([]) chaqirilganda len(sonlar) nolga teng bo'ladi va funksiya
ZeroDivisionError bilan yiqiladi. Hisobot sahifasi hali birorta
buyurtma bo'lmagan foydalanuvchi uchun aynan shu holatga tushadi.

Bo'sh ro'yxat uchun 0 qaytaramiz. None qaytarish ham ko'rib chiqildi,
lekin barcha chaqiruvchilar natijani son deb kutadi.
```

Bu xabar Git loyihasi qo'llanmasidagi to'rt bandni bajaradi: (1) muammo — hozirgi kod nima qilyapti va bu nega yomon; (2) yechim nega yaxshiroq; (3) ko'rib chiqilib, rad etilgan muqobil (`None`); (4) review'da kelishilgan narsa bo'lsa — u ham. Qo'llanma yana ikki nozik qoida beradi: muammo **hozirgi zamonda** yoziladi ("funksiya yiqiladi", "avval yiqilardi" emas, "hozir" so'zi ham shart emas), va xabar tashqi havolasiz tushunarli bo'lsin — URL berish o'rniga muhokamaning asosiy fikrini yozing.

### Sarlavha Git'ning qayerida ishlatiladi

`git format-patch` commit'ni email'ga aylantiradi ([33-bob](33-hissa-qoshish.md)) — sarlavha `Subject:` qatoriga, tana xat matniga tushadi:

```bash
$ git format-patch -1 --stdout 9e0b3cc
From 9e0b3ccda07ad5b07e6f0c680e7251632cca5fa1 Mon Sep 17 00:00:00 2001
From: Ali Valiyev <ali@example.com>
Date: Wed, 7 Oct 2026 10:10:00 +0500
Subject: [PATCH] Bo'sh ro'yxatda ortacha() xato bermasin

ortacha([]) chaqirilganda len(sonlar) nolga teng bo'ladi va funksiya
ZeroDivisionError bilan yiqiladi. Hisobot sahifasi hali birorta
buyurtma bo'lmagan foydalanuvchi uchun aynan shu holatga tushadi.

Bo'sh ro'yxat uchun 0 qaytaramiz. None qaytarish ham ko'rib chiqildi,
lekin barcha chaqiruvchilar natijani son deb kutadi.
---
 app.py | 2 ++
 1 file changed, 2 insertions(+)
...
```

Bo'sh qatorsiz commit esa uzun, ikki qatorga bo'lingan mavzu beradi:

```bash
$ git format-patch -1 --stdout d16f2cb | grep -A1 Subject
Subject: [PATCH] Kirish sahifasini tuzatish Parol maydoni bo'sh bo'lsa forma
 yuborilmaydi.
```

Boshqa commit'ga havola berishda Git loyihasi "qisqa hash (sarlavha, sana)" formatini ishlatadi. Uni Git o'zi chiqarib beradi:

```bash
$ git show -s --pretty=reference 9e0b3cc
9e0b3cc (Bo'sh ro'yxatda ortacha() xato bermasin, 2026-10-07)
```

Xabarda shunday yoziladi: `9e0b3cc (Bo'sh ro'yxatda ortacha() xato bermasin, 2026-10-07) qo'shgan tekshiruv ...`. Faqat hash'ning o'zidan farqli o'laroq, bu havola rebase'dan keyin hash o'zgarsa ham tushunarli qoladi.

### "area:" prefiksi

Git loyihasida sarlavha boshiga o'zgargan joy nomi qo'yiladi: `doc: clarify ...`, `githooks.txt: improve ...`. Qoidalar: prefiksdan keyingi so'z **kichik harf** bilan (agar o'zi bosh harf talab qilmasa, masalan `HEAD`), oxirida **nuqta yo'q**. Qaysi prefiks ishlatilishini bilmasangiz — o'zgartirayotgan fayllaringiz bo'yicha `git log --no-merges` ni ko'ring va loyihadagi odatga ergashing. Bu Conventional Commits'ning `scope` iga o'xshash g'oya (pastda).

### Belgilar kodlanishi

Ma'lumotnoma: commit xabarlari odatda **UTF-8** da saqlanadi va bu tavsiya etiladi; o'zbekcha `o'`, `g'` (oddiy ASCII tutuq) va kirill harflari muammo tug'dirmaydi. Git boshqa eski kodlashlarni ham qo'llaydi (`i18n.commitEncoding`), lekin xabar haqiqiy UTF-8 ga o'xshamasa `git commit` ogohlantiradi. Bunga ehtiyoj bo'lmasa — UTF-8 da qoling.

## Kod: xabarni muharrirda yozish — shablon va tozalash

`-m` qisqa xabar uchun qulay. Tana kerak bo'lsa muharrir yaxshiroq: `git commit` (opsiyasiz) muharrirni ochadi ([06-bob](06-ozgarishlarni-yozish.md)). Muharrir tanlash tartibi: `GIT_EDITOR` muhit o'zgaruvchisi, `core.editor` sozlamasi, `VISUAL`, `EDITOR`.

Pro Git eslatmasi: kitobdagi misollar qisqalik uchun `-m` bilan yozilgan, chiroyli xabarli emas — "biz aytganimizni qiling, qilganimizni emas". Shu qo'llanmadagi misollar ham shunday.

### `commit.template`: shablon

Jamoa xabarda nima bo'lishi kerakligini eslatmoqchi bo'lsa, shablon fayl yaratadi. Ma'lumotnoma: `-t <fayl>` (`--template`) muharrirni shu fayl mazmuni bilan ochadi, `commit.template` sozlamasi esa buni har safar avtomatik qiladi.

```bash
$ cat .gitmessage.txt
Sarlavha: nima o'zgardi (50 belgigacha, buyruq shaklida)

# Nega kerak bo'ldi? Hozir kod nima qilyapti va bu nega muammo?
#
# Qanday hal qilindi? Qaysi muqobil yo'llar rad etildi?
#
# Havolalar: Refs: #123
$ git config commit.template .gitmessage.txt
```

Pro Git uni `~/.gitmessage.txt` ga qo'yib, `git config --global commit.template ~/.gitmessage.txt` bilan hamma repo'larga yoqadi. Muharrir nima ko'rishini ko'rish uchun muharrir o'rniga `cat` qo'yamiz (`GIT_EDITOR=cat` — u faylni ekranga chiqaradi va hech narsani o'zgartirmaydi):

```bash
$ GIT_EDITOR=cat git commit
Sarlavha: nima o'zgardi (50 belgigacha, buyruq shaklida)

# Nega kerak bo'ldi? Hozir kod nima qilyapti va bu nega muammo?
#
# Qanday hal qilindi? Qaysi muqobil yo'llar rad etildi?
#
# Havolalar: Refs: #123

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# On branch main
# Changes to be committed:
#	modified:   a.txt
#
# Untracked files:
#	.gitmessage.txt
#
Aborting commit; you did not edit the message.
$ echo $?
1
```

Ikki narsaga e'tibor bering:

1. Shablon ostiga Git `git status` ma'lumotini `#` bilan qo'shadi (bu `commit.status` sozlamasi yoki `--no-status` bilan o'chiriladi).
2. Ma'lumotnoma: **shablon tahrirlanmasa, commit bekor qilinadi.** Bu himoya — shablonni o'zgartirmay saqlab qo'yib, ma'nosiz xabar bilan commit qilib bo'lmaydi.

Muharrirda birinchi qatorni o'zgartiramiz (bu yerda `sed` muharrir vazifasini bajaradi):

```bash
$ GIT_EDITOR="sed -i '' '1s/.*/a.txt ga uchinchi qatorni qo'\''shish/'" git commit
[main 5917ad3] a.txt ga uchinchi qatorni qo'shish
 1 file changed, 1 insertion(+)
$ git log -1 --format=%B
a.txt ga uchinchi qatorni qo'shish

```

`#` bilan boshlangan hamma qatorlar — shablondagi izohlar ham, status ham — tashlab yuborildi. Shablon `-m` yoki `-F` bilan xabar berilganda ishlatilmaydi.

Muharrirda xabar yozayotganingizda yo'qolgan matn haqida: ma'lumotnomaga ko'ra xabar `.git/COMMIT_EDITMSG` faylida turadi. Commit xato bilan to'xtasa (masalan hook rad etsa), yozganingiz shu faylda qoladi — keyingi `git commit` uni ustidan yozguncha.

### `-v`: diff'ni ko'z oldida tutish

`git commit -v` (`--verbose`) muharrirdagi shablon ostiga commit qilinadigan diff'ni qo'shadi — nima yozayotganingizni eslab turish uchun:

```bash
$ GIT_EDITOR=cat git commit -v
...
# ------------------------ >8 ------------------------
# Do not modify or remove the line above.
# Everything below it will be ignored.
diff --git a/a.txt b/a.txt
index 7218a41..cd7ca86 100644
--- a/a.txt
+++ b/a.txt
@@ -4,3 +4,4 @@
 2whitespace
 2verbatim
 3
+4
Aborting commit; you did not edit the message.
```

Diff qatorlari `#` bilan boshlanmaydi, lekin xabarga tushmaydi: `>8` (qaychi) belgili qatordan pastdagi hamma narsa kesib tashlanadi. Ikki marta `-vv` berilsa, stage qilinmagan o'zgarishlar ham ko'rsatiladi. Har doim yoqish: `git config --global commit.verbose true`.

### `--cleanup`: xabar qanday tozalanadi

Git xabarni saqlashdan oldin "tozalaydi". Rejimni `--cleanup=<rejim>` yoki `commit.cleanup` sozlamasi belgilaydi. Bir xil "iflos" xabarni (boshida bo'sh qatorlar, sarlavha oxirida probellar, ketma-ket bo'sh qatorlar, `#` izoh, oxirida bo'sh qatorlar) to'rt rejimda saqlab, commit obyektidagi matnni ko'ramiz (`|` — qator oxiri):

```bash
$ printf '\n\nSarlavha   \n\n\n\nTana matni\n# izoh qatori\n\n\n' > iflos.txt
$ git commit -q -a --cleanup=strip -F iflos.txt       # va boshqa rejimlar
$ git cat-file commit HEAD | sed -n '/^$/,$p' | sed 1d   # sarlavhalardan keyingi qism
```

```text
--cleanup=default    --cleanup=strip     --cleanup=whitespace   --cleanup=verbatim
                                                                |
Sarlavha|            Sarlavha|           Sarlavha|              |
|                    |                   |                      Sarlavha   |
Tana matni|          Tana matni|         Tana matni|            |
# izoh qatori|                           # izoh qatori|         |
                                                                |
                                                                Tana matni|
                                                                # izoh qatori|
                                                                |
                                                                |
```

| Rejim | Nima qiladi |
| --- | --- |
| `strip` | Boshdagi/oxirdagi bo'sh qatorlar, qator oxiridagi probellar, `#` izohlar olib tashlanadi; ketma-ket bo'sh qatorlar bittaga qisqaradi |
| `whitespace` | `strip` bilan bir xil, lekin `#` izohlar **qoladi** |
| `verbatim` | Hech narsa o'zgarmaydi |
| `scissors` | `whitespace` kabi, muharrirda esa `>8` qatoridan pasti kesiladi (`-v` shuni ishlatadi) |
| `default` | Xabar muharrirda tahrirlansa — `strip`, aks holda (`-m`, `-F`) — `whitespace` |

Amaliy xulosa: **`-m` yoki `-F` bilan berilgan xabardagi `#` qatorlar o'chirilmaydi** (yuqoridagi `default` ustuniga qarang), muharrirdagilar esa o'chiriladi. Masalan, `git commit -m "#42 ni tuzatish"` xavfsiz, lekin muharrirda `#42 ni tuzatish` deb boshlasangiz, sarlavha yo'qoladi. Izoh belgisini `core.commentChar` bilan o'zgartirish mumkin. Doim `#` ni saqlamoqchi bo'lsangiz — `git config commit.cleanup whitespace`, lekin ma'lumotnoma ogohlantiradi: unda shablondagi `#` yordam qatorlarini o'zingiz o'chirishingiz kerak bo'ladi.

## Kod: trailer'lar — xabar oxiridagi metama'lumot

**Trailer** — xabarning eng oxirida, bo'sh qatordan keyin keladigan `Kalit: qiymat` qatorlari. Ma'lumotnoma (`git interpret-trailers`): kalit faqat ASCII harf, raqam va chiziqchadan (`-`) iborat; trailer bloki bo'sh qatordan keyin keladi.

Git'ning o'zi bitta trailer'ni biladi — `Signed-off-by`. `-s` (`--signoff`) uni commit qiluvchi nomidan qo'shadi; ixtiyoriy trailer — `--trailer`:

```bash
$ git commit -q -s -m "a.txt ga to'rtinchi qatorni qo'shish" \
    --trailer "Reviewed-by: Vali Aliyev <vali@example.com>" \
    --trailer "Refs: #42"
$ git log -1 --format=%B
a.txt ga to'rtinchi qatorni qo'shish

Signed-off-by: Ali Valiyev <ali@example.com>
Reviewed-by: Vali Aliyev <vali@example.com>
Refs: #42

```

Trailer'larni ajratib olish — skriptlar uchun qulay:

```bash
$ git log -1 --format=%B | git interpret-trailers --parse
Signed-off-by: Ali Valiyev <ali@example.com>
Reviewed-by: Vali Aliyev <vali@example.com>
Refs: #42
$ git log -1 --format='%(trailers:key=Refs,valueonly)'
#42
```

`Signed-off-by` nimani anglatadi — loyihaga bog'liq. Git va Linux loyihalarida bu **Developer's Certificate of Origin** (DCO) ga rozilik: "bu o'zgarishni men yozdim yoki uni shu litsenziya ostida yuborishga haqqim bor". Git loyihasi sign-off'siz patch'ni qabul qilmaydi. Ma'lumotnoma ataylab ta'kidlaydi: `--signoff` ni standart holatda yoqadigan sozlama **yo'q va bo'lmaydi** — bu ongli tasdiq bo'lishi kerak.

Git loyihasi qo'llanmasidagi keng tarqalgan trailer'lar:

| Trailer | Kimga |
| --- | --- |
| `Reported-by:` | Xatoni topgan odam |
| `Acked-by:` | Shu soha mutaxassisi o'zgarishni ma'qulladi |
| `Reviewed-by:` | Batafsil ko'rib chiqib, to'liq rozi bo'lgan reviewer (faqat o'zi qo'ya oladi) |
| `Tested-by:` | Patch'ni qo'llab, ishlashini tekshirgan |
| `Co-authored-by:` | Patch qoralamalarini birga almashganlar |
| `Helped-by:` | G'oya bergan, lekin kod yozmagan |
| `Suggested-by:` | G'oya muallifi |

Qoidalar: trailer nomida faqat birinchi harf katta (`Signed-off-by`, `Signed-Off-By` emas); trailer'lar **xronologik** tartibda yoziladi va o'z sign-off'ingiz siz qo'shgan boshqa trailer'lardan **keyin** turadi. E'tibor bering: yuqoridagi misolda `-s` trailer'ni birinchi qo'ydi — Git loyihasi qoidasiga to'liq rioya qilish uchun `Signed-off-by` ni ham `--trailer` bilan oxirida bering yoki xabarni muharrirda tartiblang. GitHub `Co-authored-by:` trailer'ini hammualliflikni ko'rsatish uchun o'qiydi.

## Kod: xabar qoidasini hook bilan tekshirish

Qoidalarni har bir kishi eslab yurishi qiyin — ularni `commit-msg` hook'iga topshirish mumkin. Bu hook xabar yozilgandan keyin, commit yaratilishidan oldin ishlaydi va xabar faylini argument sifatida oladi. Oddiy misol — sarlavha uzunligi va bo'sh qatorni tekshirish:

```bash
$ cat .git/hooks/commit-msg
#!/bin/sh
# $1 — xabar yozilgan fayl (.git/COMMIT_EDITMSG)
sarlavha=$(head -n 1 "$1")
if [ ${#sarlavha} -gt 50 ]; then
	echo "Sarlavha ${#sarlavha} belgi, 50 dan oshmasin: $sarlavha" >&2
	exit 1
fi
if [ "$(sed -n 2p "$1")" != "" ]; then
	echo "Sarlavhadan keyin bo'sh qator bo'lsin" >&2
	exit 1
fi
$ chmod +x .git/hooks/commit-msg
$ git commit -a -m "a.txt faylining oxiriga beshinchi qatorni qo'shish va hammasini tekshirish"
Sarlavha 74 belgi, 50 dan oshmasin: a.txt faylining oxiriga beshinchi qatorni qo'shish va hammasini tekshirish
$ echo $?
1
$ git commit -a -m "a.txt ga beshinchi qatorni qo'shish"
[main 9d1d6fc] a.txt ga beshinchi qatorni qo'shish
 1 file changed, 1 insertion(+)
```

(`${#sarlavha}` shell'da baytlarni sanaydi; kirill yoki boshqa ko'p baytli belgilar bo'lsa, natija belgilar sonidan katta chiqadi.) `.git/hooks` dagi hook'lar clone bilan tarqalmaydi — jamoaga qanday ulashish va hook'lar haqida hamma narsa [47-bobda](47-hooklar.md).

## Muhandislik nuqtai nazari: Conventional Commits

**Conventional Commits** (conventionalcommits.org, 1.0.0) — Git'ning bir qismi **emas**. Bu Git'ga aloqasiz jamoa tomonidan yozilgan tashqi kelishuv, Git uni bilmaydi va tekshirmaydi. Lekin u ko'p ochiq loyihalarda qabul qilingan: xabardan avtomatik ravishda o'zgarishlar ro'yxati (CHANGELOG) yaratish va keyingi versiya raqamini aniqlash uchun.

Tuzilishi:

```text
<tur>[ixtiyoriy scope]: <tavsif>

[ixtiyoriy tana]

[ixtiyoriy footer(lar)]
```

Spetsifikatsiyaning asosiy qoidalari (qisqartirilgan):

- Xabar **tur** (type) bilan boshlanadi, keyin ixtiyoriy scope, ixtiyoriy `!`, va majburiy `: ` (ikki nuqta va probel).
- `feat` — yangi imkoniyat qo'shilganda, `fix` — xato tuzatilganda **majburiy**.
- Scope — kod qismining nomi qavs ichida: `fix(parser):`.
- Tana tavsifdan keyin bitta bo'sh qatordan boshlanadi; erkin shaklda, bir nechta paragraf bo'lishi mumkin.
- Footer'lar tanadan keyin bitta bo'sh qatordan keyin; har biri `Token: qiymat` yoki `Token #qiymat`, token'da probel o'rniga `-` (`Acked-by`).
- **Buzuvchi o'zgarish** (breaking change — eski kod bilan mos kelmaydigan) ikki yo'l bilan belgilanadi: `:` dan oldin `!` yoki `BREAKING CHANGE: <tavsif>` footer'i. `BREAKING CHANGE` katta harf bilan bo'lishi shart; `BREAKING-CHANGE` uning sinonimi.
- `feat` va `fix` dan boshqa turlar ham mumkin (masalan `docs:`). Tavsiya qilinadigan qo'shimcha turlar: `build`, `chore`, `ci`, `docs`, `style`, `refactor`, `perf`, `test`.
- Buzuvchi o'zgarishdan tashqari, katta-kichik harf farqlanmaydi.

Spetsifikatsiyadagi misollardan:

```text
feat(lang): add Polish language
```

```text
feat(api)!: send an email to the customer when a product is shipped
```

```text
fix: prevent racing of requests

Introduce a request id and a reference to latest request. Dismiss
incoming responses other than from latest request.

Remove timeouts which were used to mitigate the racing issue but are
obsolete now.

Reviewed-by: Z
Refs: #123
```

**Semantic Versioning bilan bog'liqlik** (versiya `MAJOR.MINOR.PATCH`): `fix` → PATCH, `feat` → MINOR, `BREAKING CHANGE` (turidan qat'i nazar) → MAJOR reliz.

Spetsifikatsiyaning savol-javoblaridan:

- **Tur noto'g'ri tanlansa?** Merge yoki relizdan oldin `git rebase -i` bilan tarixni tuzatish tavsiya etiladi ([25-bob](25-tarixni-qayta-yozish.md)). Spetsifikatsiyada yo'q tur ishlatilsa — shunchaki shu commit spetsifikatsiyaga asoslangan asboblar tomonidan e'tiborsiz qoladi.
- **Commit bir nechta turga to'g'ri kelsa?** Iloji boricha bir nechta commit'ga bo'ling — bu kelishuvning foydalaridan biri: tartibli commit'larga undash. Ya'ni Conventional Commits atomarlikni ham qo'llab-quvvatlaydi.
- **Hamma hissa qo'shuvchi shunga rioya qilishi shartmi?** Yo'q — squash bilan merge qilinadigan workflow'da maintainer'lar merge paytida xabarni tozalashi mumkin.

### Git bilan bitta nozik farq: `BREAKING CHANGE` trailer emas

Conventional Commits footer'lari Git trailer'lariga o'xshaydi, lekin to'liq mos emas. Git trailer kalitida probel bo'lishi mumkin emas — `BREAKING CHANGE` esa probelli. Sinab ko'ramiz:

```bash
$ printf 'feat(api)!: foydalanuvchi ID raqamini UUID ga almashtirish\n\nTana.\n\nBREAKING CHANGE: /users/<id> endi butun son emas, UUID qabul qiladi.\nRefs: #57\n' \
    | git interpret-trailers --parse
$ echo $?
0
```

Bo'sh! Git hatto `Refs: #57` ni ham trailer deb tanimadi. Sababi ma'lumotnomada: oxirgi blok trailer bloki hisoblanishi uchun u yoki **butunlay** trailer'lardan iborat bo'lishi, yoki kamida bitta Git yaratgan/sozlangan trailer'ni o'z ichiga olib, kamida 25% trailer bo'lishi kerak. `BREAKING CHANGE:` qatori trailer emas, demak butun blok oddiy matn. Sinonim bilan:

```bash
$ printf 'feat(api)!: x\n\nTana.\n\nBREAKING-CHANGE: /users/<id> endi UUID.\nRefs: #57\n' \
    | git interpret-trailers --parse
BREAKING-CHANGE: /users/<id> endi UUID.
Refs: #57
```

Amaliy xulosa: Conventional Commits va Git trailer asboblarini (`%(trailers)`, `--trailer`) birga ishlatsangiz, footer'da `BREAKING-CHANGE` yozing yoki `!` belgisiga tayaning.

### Qaysi uslubni tanlash

| Uslub | Kim ishlatadi | Sarlavha namunasi |
| --- | --- | --- |
| Pro Git / Tim Pope | Ko'p loyihalar, standart | `Bo'sh ro'yxatda ortacha() xato bermasin` |
| Git loyihasi ("area:") | Git, Linux yadrosi va o'xshashlar | `report: handle empty list in ortacha()` |
| Conventional Commits | Avtomatik CHANGELOG/versiya kerak bo'lgan loyihalar | `fix(report): bo'sh ro'yxatda ortacha() xato bermasin` |

Uchalasi ham bir xil asosga tayanadi: qisqa sarlavha, bo'sh qator, "nega"ni tushuntiruvchi tana. Farq faqat sarlavha boshida. Eng muhim qoida — **loyihaning mavjud odatiga ergashing**: `git log --no-merges` bilan bir nechta oxirgi xabarni ko'ring. Pro Git ham shunday maslahat beradi: Git loyihasida `git log --no-merges` ni ishga tushirib, yaxshi formatlangan tarix qanday ko'rinishini ko'ring.

## Muhandislik nuqtai nazari: commit qilishdan oldingi checklist

```text
1. git status                 — kutilmagan fayl stage qilinmadimi?
2. git diff --cached          — commit'ga aynan nima ketyapti?
3. git diff --cached --check  — whitespace xatolari yo'qmi?
4. Testlar o'tadimi?          — har commit o'z-o'zidan ishlaydigan holat
5. Bitta mantiqiy o'zgarishmi? — yo'q bo'lsa: git restore --staged + git add -p
6. Xabar: sarlavha ≤ 50, bo'sh qator, tanada "nega"
```

Xabar yoki tarkibda xato ketib qolsa — vahima kerak emas: oxirgi commit'ni `git commit --amend` bilan tuzatish mumkin ([11-bob](11-bekor-qilish.md)), eskiroqlarini esa `--fixup` va interaktiv rebase bilan ([25-bob](25-tarixni-qayta-yozish.md)) — faqat ular hali push qilinmagan bo'lsa.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Butun haftalik ishni bitta commit qilish | Ko'rib chiqib bo'lmaydi, bitta qismini bekor qilib bo'lmaydi, `bisect` foydasiz | Har vazifaga alohida commit; bitta fayl ichida — `git add -p` |
| Sarlavhadan keyin bo'sh qator qoldirmaslik | Ikki qator bitta uzun sarlavhaga yopishadi, tana yo'qoladi | Sarlavha, **bo'sh qator**, keyin tana |
| "fix", "o'zgarishlar", "wip" kabi xabarlar | Bir yildan keyin hech kim (siz ham) nima va nega qilinganini bilmaydi | Sarlavhada nima, tanada nega |
| Xabarda faqat "nima" yozish | Diff "nima"ni allaqachon ko'rsatadi | Muammo, yechim nega yaxshi, rad etilgan muqobillar |
| O'tgan zamonda yozish ("tuzatildi", "Fixed bug") | Git o'zi yaratadigan xabarlar uslubiga mos emas | Buyruq shakli: "tuzatish", "Fix bug" |
| `git diff --check` ni stage'dan keyin ishlatish | U working tree↔index ni tekshiradi, stage qilingan xatoni ko'rmaydi | `git diff --cached --check` yoki `pre-commit` hook |
| Muharrirda sarlavhani `#` bilan boshlash (`#42 ...`) | `strip` rejimi uni izoh deb o'chiradi | `-m` bilan yozing, `core.commentChar` ni o'zgartiring yoki `#` ni boshga qo'ymang |
| Yarim tayyor, kompilyatsiya bo'lmaydigan commit'lar | `bisect` va `revert` buzuq oraliq holatga tushadi | Har commit — ishlaydigan holat |
| `--no-verify` ni odat qilish | Whitespace va xabar tekshiruvlari chetlab o'tiladi | Hook xatosini tuzating; `-n` faqat favqulodda |
| Conventional Commits footer'ida `BREAKING CHANGE:` bilan Git trailer asboblariga tayanish | Git butun footer blokini trailer deb tanimaydi | `BREAKING-CHANGE:` yoki sarlavhada `!` |
| `Signed-off-by` ni ma'nosini bilmay qo'yish | Ba'zi loyihalarda bu huquqiy tasdiq (DCO) | Loyiha qoidalarini o'qing, keyin `-s` |

## Amaliyot

1. Faylga qator oxirida probel, tab oldida probel va oxirida bo'sh qatorlar qo'shing. `git diff --check` ni stage'dan oldin va keyin ishlating; `--cached` ning farqini va chiqish kodini (`echo $?`) yozib qo'ying.
2. `git -c core.whitespace=tab-in-indent,-blank-at-eof diff --check` ni sinab, qaysi xatolar endi ko'rinishini va qaysilari yo'qolganini tushuntiring.
3. `.git/hooks/pre-commit.sample` ni yoqing, whitespace xatoli faylni commit qilishga urinib ko'ring, keyin `--no-verify` bilan o'tib, `git reset --soft HEAD~` bilan bekor qiling.
4. Bitta faylda ikki mustaqil o'zgarish qiling va `git add -p` bilan ularni ikki commit'ga ajrating. `git log -p` bilan har commit faqat bitta o'zgarishni o'z ichiga olganini tekshiring.
5. Bir xil xabarni bo'sh qator bilan va bo'sh qatorsiz commit qiling. `git log --format='[%s]%n[%b]'` va `git format-patch -1 --stdout | grep Subject` natijalarini solishtiring.
6. O'zingizga `~/.gitmessage.txt` shablonini yozing, `commit.template` va `commit.verbose` ni yoqing. Shablonni o'zgartirmay saqlasangiz nima bo'lishini tekshiring.
7. `--cleanup=strip`, `whitespace` va `verbatim` bilan `#` qatorli bir xil xabarni commit qiling va `git cat-file commit HEAD` bilan farqni ko'ring.
8. (Qiyinroq) `commit-msg` hook yozing: sarlavha 50 belgidan oshmasin, ikkinchi qator bo'sh bo'lsin va sarlavha Conventional Commits turlaridan biri (`feat`, `fix`, `docs`, ...) bilan boshlansin. `BREAKING CHANGE:` va `BREAKING-CHANGE:` footer'li xabarlarni `git interpret-trailers --parse` dan o'tkazib, nega natija har xil ekanini tushuntiring.

## Rasmiy hujjat

- Pro Git — Contributing to a Project (Commit Guidelines): <https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project>
- Pro Git — Git Configuration (`commit.template`): <https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration>
- Git loyihasi — SubmittingPatches: <https://git-scm.com/docs/SubmittingPatches>
- `git commit` (DISCUSSION, `--cleanup`, `--template`, `--trailer`): <https://git-scm.com/docs/git-commit>
- `git diff` (`--check`): <https://git-scm.com/docs/git-diff>
- `git config` (`core.whitespace`, `commit.*`): <https://git-scm.com/docs/git-config>
- `git interpret-trailers`: <https://git-scm.com/docs/git-interpret-trailers>
- Conventional Commits 1.0.0 (tashqi kelishuv): <https://www.conventionalcommits.org/en/v1.0.0/>
