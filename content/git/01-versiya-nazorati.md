# 01 — Versiya nazorati va Git nima

[← Mundarija](README.md) · [Keyingi: Terminal va o'rnatish →](02-terminal-va-ornatish.md)

## Tushuncha

**Versiya nazorati** (inglizcha *version control*) — fayl yoki fayllar to'plamidagi o'zgarishlarni vaqt bo'yicha yozib boradigan tizim. Uning vazifasi oddiy: istalgan paytda **oldingi versiyani qaytarib olish**. Shunday tizimni dasturiy ta'minot tilida **VCS** (*Version Control System*) deyiladi.

Bu qo'llanmada versiya nazoratidagi fayllar — dastur kodi. Lekin VCS deyarli har qanday fayl bilan ishlaydi: matn, hujjat, sayt maketi, konfiguratsiya. Dizayner rasm yoki maketning har versiyasini saqlamoqchi bo'lsa ham VCS foydali.

VCS bilan quyidagilarni qila olasiz:

- tanlangan fayllarni oldingi holatga qaytarish;
- butun loyihani oldingi holatga qaytarish;
- vaqt o'tishi bilan nima o'zgarganini solishtirish;
- muammo tug'dirayotgan qatorni oxirgi marta kim o'zgartirganini ko'rish;
- xatoni kim va qachon kiritganini aniqlash;
- biror narsani buzib qo'ysangiz yoki faylni yo'qotsangiz — tiklash.

Va bularning hammasi kundalik ishga juda kam qo'shimcha mehnat qo'shadi.

Bu bobda uchta savolga javob beramiz: versiya nazorati qanday rivojlangan (lokal → markazlashgan → taqsimlangan), Git qayerdan paydo bo'lgan va — eng muhimi — **Git ma'lumotni qanday o'ylaydi**. Oxirgisi keyingi barcha boblarning poydevori: Git'ni boshqa tizimlar kabi tasavvur qilsangiz, ko'p buyruqlar "g'alati" tuyuladi; uning modelini tushunsangiz, har buyruq nima qilishini oldindan aytib bera olasiz.

## Nega shunday: nega papkalarni nusxalash yetmaydi

Ko'pchilik versiya nazoratini o'zicha shunday qiladi: fayllarni boshqa papkaga ko'chiradi, ehtiyotkorroq bo'lsa nomiga sana qo'shadi.

```text
$ ls -1
sayt
sayt-eski
sayt-yakuniy
sayt-yakuniy-2
sayt-yakuniy-2 (ishlaydigan)
```

Bu usul juda keng tarqalgan, chunki oddiy. Lekin xatoga juda moyil:

- qaysi papkada turganingizni unutib, **noto'g'ri faylga** yozib qo'yish oson;
- kerakmas fayllar ustidan nusxa ko'chirib, yaxshi versiyani yo'qotish oson;
- "yakuniy-2" bilan "yakuniy" orasida **nima farq qilishini** hech kim aytolmaydi — faqat ikkalasini ochib, ko'z bilan solishtirish qoladi;
- **kim** va **nega** o'zgartirgani hech qayerda yozilmagan;
- ikki kishi bir vaqtda ishlasa, ularning o'zgarishlarini birlashtirish — qo'l mehnati.

Versiya nazorati tizimlari aynan shu muammolarni yechish uchun paydo bo'lgan. Ular tarixini quyida ko'ramiz — chunki Git qaysi muammoni hal qilish uchun yaratilganini bilish uning tuzilishini tushunishga yordam beradi.

## Versiya nazoratining uch avlodi

### Lokal VCS

Dasturchilar ancha oldin oddiy **lokal ma'lumotlar bazasi** bo'lgan tizimlarni yaratishgan: ular nazoratdagi fayllarning barcha o'zgarishlarini bitta kompyuterda saqlaydi.

```text
   Bitta kompyuter
  ┌──────────────────────────────────────┐
  │                     Versiyalar bazasi│
  │  ┌────────┐  chiqarish  ┌──────────┐ │
  │  │ fayl.c │ ◄────────── │ versiya 3│ │
  │  └────────┘             │ versiya 2│ │
  │                         │ versiya 1│ │
  │                         └──────────┘ │
  └──────────────────────────────────────┘
```

Eng mashhurlaridan biri — **RCS** (u hozir ham ko'p tizimlar bilan birga tarqatiladi). RCS diskda maxsus formatda **patch to'plamlarini** — ya'ni fayl versiyalari orasidagi farqlarni — saqlaydi. Istalgan paytdagi faylni olish uchun u patch'larni ketma-ket qo'shib, faylni qayta quradi.

**Muammo.** Hamma narsa bitta kompyuterda. Boshqa odam bilan birga ishlash imkoni yo'q, disk buzilsa — butun tarix yo'qoladi.

### Markazlashgan VCS (CVCS)

Keyingi katta muammo — boshqa kompyuterlardagi dasturchilar bilan **hamkorlik**. Buning uchun **markazlashgan** tizimlar (*Centralized VCS*) yaratildi: CVS, Subversion (SVN), Perforce. Ularda bitta server barcha versiyalangan fayllarni saqlaydi, mijozlar (dasturchilar kompyuterlari) fayllarni shu markazdan oladi (*check out*). Ko'p yillar davomida bu standart bo'lgan.

```text
                 ┌───────────────────┐
                 │   Markaziy server │
                 │  ┌─────────────┐  │
                 │  │ versiya 3   │  │
                 │  │ versiya 2   │  │
                 │  │ versiya 1   │  │
                 │  └─────────────┘  │
                 └─────────┬─────────┘
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │ 1-kompyut│  │ 2-kompyut│  │ 3-kompyut│
       │ fayllar  │  │ fayllar  │  │ fayllar  │
       │(faqat    │  │(faqat    │  │(faqat    │
       │ oxirgisi)│  │ oxirgisi)│  │ oxirgisi)│
       └──────────┘  └──────────┘  └──────────┘
```

Afzalliklari lokal VCS'dan ancha ko'p:

- har kim loyihada boshqalar nima qilayotganini ma'lum darajada biladi;
- administratorlar kim nima qila olishini aniq boshqaradi;
- bitta markazni boshqarish har mijozdagi lokal bazalarni boshqarishdan ancha oson.

**Muammo.** Eng aniq kamchilik — server **yagona nosozlik nuqtasi** (*single point of failure*):

- server bir soat ishlamasa, shu soat davomida hech kim hamkorlik qila olmaydi va o'z ishini versiya sifatida saqlay olmaydi;
- markaziy baza joylashgan disk buzilsa va zaxira nusxa olinmagan bo'lsa — **hammasi** yo'qoladi: loyihaning butun tarixi, odamlarning kompyuterlarida tasodifan qolgan alohida suratlardan tashqari.

Lokal VCS'da ham xuddi shu muammo bor: butun tarix bitta joyda bo'lsa, hammasini yo'qotish xavfi bor.

### Taqsimlangan VCS (DVCS)

Shu yerda **taqsimlangan** tizimlar (*Distributed VCS*) paydo bo'ladi: Git, Mercurial, Darcs. Ularda mijoz faylning faqat oxirgi suratini olmaydi — u **butun repo'ni, to'liq tarixi bilan** nusxalaydi (*mirror*).

**Repo** (repository, ombor) — loyihaning barcha versiyalari va ular haqidagi ma'lumot saqlanadigan baza. Git'da bu loyiha papkasidagi `.git` papkasi ([4-bob](04-repo-olish.md), [13-bob](13-plumbing-va-porcelain.md)).

```text
                 ┌───────────────────┐
                 │      Server       │
                 │  to'liq tarix     │
                 └─────────┬─────────┘
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │ 1-kompyut│  │ 2-kompyut│  │ 3-kompyut│
       │ fayllar  │  │ fayllar  │  │ fayllar  │
       │ +to'liq  │  │ +to'liq  │  │ +to'liq  │
       │  tarix   │  │  tarix   │  │  tarix   │
       └──────────┘  └──────────┘  └──────────┘
```

Natijada:

- server o'lsa, istalgan mijozdagi repo'ni serverga qaytadan nusxalab, uni tiklash mumkin. **Har bir clone — barcha ma'lumotning to'liq zaxira nusxasi**;
- ko'p DVCS'lar bir nechta uzoq repo (*remote*) bilan bir vaqtda ishlay oladi. Bitta loyihada turli guruhlar bilan turli usulda hamkorlik qilish mumkin — markazlashgan tizimda imkonsiz bo'lgan ish jarayonlari (masalan, ierarxik model) paydo bo'ladi ([32-bob](32-taqsimlangan-workflowlar.md)).

Buni quyida haqiqiy buyruqlar bilan ko'ramiz.

## Git'ning qisqacha tarixi

Linux yadrosi — juda katta ochiq kodli loyiha. Uni yuritishning dastlabki yillarida (1991–2002) o'zgarishlar **patch'lar** (farq fayllari) va arxivlar ko'rinishida qo'ldan-qo'lga uzatilgan. 2002-yilda loyiha **BitKeeper** degan xususiy (tijoriy) DVCS'dan foydalana boshlagan.

2005-yilda Linux yadrosi hamjamiyati bilan BitKeeper'ni ishlab chiqqan kompaniya o'rtasidagi munosabat buzilgan va vositaning bepul maqomi bekor qilingan. Bu Linux hamjamiyatini — xususan, Linux yaratuvchisi **Linus Torvalds**ni — BitKeeper'dan olingan tajriba asosida o'z vositasini yaratishga undagan. Yangi tizimning maqsadlari:

- **tezlik**;
- **oddiy dizayn**;
- **chiziqli bo'lmagan rivojlanishni** kuchli qo'llab-quvvatlash — minglab parallel branch'lar;
- **to'liq taqsimlanganlik**;
- Linux yadrosidek **katta loyihalarni** samarali boshqarish (tezlik va ma'lumot hajmi jihatidan).

2005-yilda tug'ilganidan beri Git rivojlanib, foydalanishga qulayroq bo'ldi, lekin shu dastlabki xususiyatlarni saqlab qoldi: u juda tez, katta loyihalarda samarali va chiziqli bo'lmagan rivojlanish uchun kuchli branch tizimiga ega ([20-bob](20-branch-bu-ref.md)).

Bu maqsadlar Git'ning keyingi barcha qarorlarini tushuntiradi. "Nega Git deyarli hamma narsani lokal bajaradi?" — tezlik va to'liq taqsimlanganlik uchun. "Nega branch yaratish bir zumda?" — minglab parallel branch'lar maqsadi uchun. Quyidagi bo'limlar shu qarorlarni birma-bir ochadi.

## Git nima: beshta asosiy g'oya

Bu bo'limni yaxshilab o'zlashtiring. Git nima ekanini va qanday ishlashining asoslarini tushunsangiz, undan samarali foydalanish ancha oson bo'ladi.

Git'ni o'rganayotganda boshqa VCS'lar (CVS, Subversion, Perforce) haqida bilganlaringizni **bir chetga qo'yishga** harakat qiling. Git'ning foydalanuvchi interfeysi ularga ancha o'xshaydi, lekin Git ma'lumotni **butunlay boshqacha** saqlaydi va o'ylaydi. Bu farqlarni tushunish nozik chalkashliklardan saqlaydi.

### 1. Snapshot'lar, farqlar emas

Git va boshqa deyarli barcha VCS'lar orasidagi asosiy farq — ma'lumotga qarash usuli.

Boshqa tizimlar (CVS, Subversion, Perforce va hokazo) ma'lumotni **fayllar to'plami va har faylga vaqt davomida kiritilgan o'zgarishlar** sifatida saqlaydi. Buni odatda *delta-based* (farqqa asoslangan) versiya nazorati deyiladi:

```text
  Delta-based (boshqa VCS'lar)

           1-versiya   2-versiya   3-versiya   4-versiya
  A fayl ─── A ─────── Δ1 ───────────────────── Δ2
  B fayl ─── B ─────────────────── Δ1
  C fayl ─── C ─────── Δ1 ──────── Δ2 ───────── Δ3

  Har versiya: "asos fayl + shu paytgacha bo'lgan o'zgarishlar"
```

Git ma'lumotni bunday o'ylamaydi va bunday saqlamaydi. Git uchun ma'lumot — **kichik fayl tizimining suratlari ketma-ketligi**. Har safar commit qilganingizda (loyiha holatini saqlaganingizda) Git o'sha paytda barcha fayllaringiz qanday ko'rinishda ekanini "suratga oladi" va shu suratga havolani saqlaydi.

**Commit** — loyihaning ma'lum paytdagi to'liq surati (snapshot), unga muallif, sana va xabar qo'shilgan. **Snapshot** — "shu paytdagi barcha fayllar qanday edi" degan to'liq rasm.

Samaradorlik uchun: fayl o'zgarmagan bo'lsa, Git uni **qaytadan saqlamaydi** — avval saqlangan bir xil faylga havola qo'yadi.

```text
  Snapshot'lar (Git)

           1-versiya   2-versiya   3-versiya   4-versiya
            ┌────┐      ┌────┐      ┌────┐      ┌────┐
            │ A  │      │ A1 │      │ A1·│      │ A2 │
            │ B  │      │ B· │      │ B1 │      │ B1·│
            │ C  │      │ C1 │      │ C2 │      │ C3 │
            └────┘      └────┘      └────┘      └────┘

  "·" — fayl o'zgarmagan: yangi nusxa emas, avvalgisiga havola
```

Git'ni **snapshot'lar oqimi** deb tasavvur qiling. Bu farq Git'ni oddiy VCS emas, ustiga kuchli vositalar qurilgan **mini fayl tizimiga** o'xshatib qo'yadi. Bu qarashning foydalarini branch'lar mavzusida ([20-bob](20-branch-bu-ref.md)) ko'ramiz.

### Kod: snapshot'ni o'z ko'zingiz bilan ko'rish

Gap faqat nazariya emasligini tekshiramiz. Uch faylli loyiha yaratib, commit qilamiz (buyruqlarning o'zi keyingi boblarda batafsil tushuntiriladi — hozir faqat natijaga qarang):

```bash
$ git init
$ printf '# Kutubxona\n' > README.md
$ printf 'console.log("salom")\n' > app.js
$ printf 'body { margin: 0 }\n' > style.css
$ git add .
$ git commit -m "Birinchi versiya"
```

```text
[main (root-commit) b8d700f] Birinchi versiya
 3 files changed, 3 insertions(+)
 create mode 100644 README.md
 create mode 100644 app.js
 create mode 100644 style.css
```

Commit ichida nima borligini `git cat-file -p` ko'rsatadi:

```text
$ git cat-file -p HEAD
tree 5e76bcae810a5ef1716d66debbf9dd52237c0ec0
author Ali Valiyev <ali@example.com> 1791349200 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500

Birinchi versiya
```

Commit'da **farq yo'q** — faqat bitta `tree` (loyiha papkasining surati) va metama'lumot. Tree'ning ichi:

```text
$ git ls-tree HEAD
100644 blob 4f30aad0d7bfe8d762b78e2575629696f9922547	README.md
100644 blob 39167bbbe4587a2add5184a5cfacc437f4ae9d4c	app.js
100644 blob 4739e6df3939de650742e2d3be5232716c7910ad	style.css
```

Har fayl — **blob** (fayl mazmuni saqlanadigan obyekt), har birining o'z hash'i bor. Endi faqat `app.js`ni o'zgartirib, ikkinchi commit qilamiz:

```text
$ printf 'console.log("salom dunyo")\n' > app.js
$ git commit -am "Salomni kengaytirish"
[main a85ddc8] Salomni kengaytirish
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git ls-tree HEAD
100644 blob 4f30aad0d7bfe8d762b78e2575629696f9922547	README.md
100644 blob a8345ce15a32566ca36b9e7779e3e08a2f294a55	app.js
100644 blob 4739e6df3939de650742e2d3be5232716c7910ad	style.css
```

Solishtiring: ikkinchi snapshot ham **uchala** faylni sanaydi — u to'liq surat. Lekin `README.md` va `style.css` hash'lari birinchi commit'dagi bilan **aynan bir xil** (`4f30aad...`, `4739e6d...`) — bu yuqoridagi rasmdagi "havola". Faqat `app.js` yangi blob oldi.

Diskda ham shuni ko'ramiz:

```text
$ find .git/objects -type f | sort
.git/objects/39/167bbbe4587a2add5184a5cfacc437f4ae9d4c
.git/objects/47/39e6df3939de650742e2d3be5232716c7910ad
.git/objects/4f/30aad0d7bfe8d762b78e2575629696f9922547
.git/objects/5e/76bcae810a5ef1716d66debbf9dd52237c0ec0
.git/objects/a8/345ce15a32566ca36b9e7779e3e08a2f294a55
.git/objects/a8/5ddc869481894797a801b1614799fcd75e89fc
.git/objects/b8/d700f37b9dc1db7253ec4d631ff4fadaafbc4d
.git/objects/c4/cb302f0943822b834399e01e3ebbbf60851c70
```

Sakkizta obyekt: 1-commit uchun 5 ta (3 blob, 1 tree, 1 commit), 2-commit uchun atigi **3 ta** (yangi `app.js` blob'i, yangi tree, yangi commit). O'zgarmagan ikki fayl qayta saqlanmadi.

Rasmiy ma'lumotnoma (`gitdatamodel`) buni shunday ifodalaydi: 1000 faylli repo'da 2 faylni o'zgartirgan commit 2 ta yangi blob yaratadi va qolgan 998 fayl uchun oldingi blob ID'larini ishlatadi. Shuning uchun juda katta repo'da ham commit'lar diskda kam joy egallaydi.

### "Farq" qayerdan keladi?

Agar Git farqlarni saqlamasa, `git show` qanday qilib farqni ko'rsatadi?

```text
$ git diff HEAD~1 HEAD
diff --git a/app.js b/app.js
index 39167bb..a8345ce 100644
--- a/app.js
+++ b/app.js
@@ -1 +1 @@
-console.log("salom")
+console.log("salom dunyo")
```

Javob: Git farqni **saqlamaydi, har safar hisoblaydi**. U ikki snapshot'ni oladi, ularning tree'larini solishtiradi va farq qilgan blob'larni (`39167bb..a8345ce` — `index` qatoriga qarang) qatorma-qator taqqoslaydi. `gitdatamodel`dan: "Git commit uchun diff saqlamaydi: commit'ni `git show` bilan ko'rsatishni so'raganingizda, u diff'ni otasidan shu zahoti hisoblaydi."

> **Eslatma: siqish boshqa masala.** Diskda joy tejash uchun Git keyinchalik obyektlarni **packfile**larga yig'adi va o'xshash obyektlarni bir-biriga nisbatan delta bilan siqadi ([18-bob](18-packfile-va-gc.md)). Bu — saqlash darajasidagi optimallashtirish. **Model** darajasida esa har commit baribir to'liq snapshot bo'lib qoladi: istalgan commit'dan butun loyihani boshqa commit'larga murojaat qilmasdan olish mumkin.

### 2. Deyarli har bir amal lokal

Git'dagi ko'p amallar uchun faqat lokal fayllar va resurslar yetarli — odatda tarmoqdagi boshqa kompyuterdan hech qanday ma'lumot kerak emas. Butun loyiha tarixi lokal diskingizda turgani uchun ko'p amallar deyarli bir zumda bajariladi.

- Tarixni ko'rish uchun Git serverga bormaydi — uni to'g'ridan-to'g'ri **lokal bazangizdan** o'qiydi.
- Faylning hozirgi versiyasi bilan bir oy oldingi versiyasini solishtirish uchun Git eski faylni lokal topadi va farqni **o'zi hisoblaydi** — serverdan so'ramaydi.
- Oflayn yoki VPN'siz ham deyarli hamma narsani qila olasiz: samolyot yoki poyezdda bemalol commit qilasiz (o'zingizning **lokal** nusxangizga), tarmoq paydo bo'lganda yuborasiz.

Boshqa tizimlarda bu yo imkonsiz, yo og'riqli. Perforce'da serverga ulanmagan holda ko'p narsa qila olmaysiz; Subversion va CVS'da fayllarni tahrirlay olasiz, lekin commit qila olmaysiz — chunki baza oflayn.

### 3. Git butunlikni ta'minlaydi

Git'da hamma narsa saqlanishdan oldin **checksum** (nazorat yig'indisi) bilan hisoblanadi va keyin shu checksum orqali murojaat qilinadi. Demak, Git bilmasdan turib biror fayl yoki papka mazmunini o'zgartirib bo'lmaydi. Ma'lumot uzatishda yo'qolsa yoki fayl buzilsa, Git buni aniqlay oladi.

Bu checksum uchun Git **SHA-1 hash**dan foydalanadi. **Hash** — istalgan uzunlikdagi ma'lumotdan hisoblanadigan qisqa "barmoq izi": mazmun bir bayt o'zgarsa ham, hash butunlay boshqacha chiqadi. SHA-1 hash — 40 ta o'n oltilik belgidan (0–9 va a–f) iborat qator:

```text
a8345ce15a32566ca36b9e7779e3e08a2f294a55
```

Bunday qiymatlarni Git'da hamma joyda ko'rasiz. Aslida Git ma'lumotlarini bazasida **fayl nomi bo'yicha emas, mazmunining hash'i bo'yicha** saqlaydi. Yuqoridagi `.git/objects/a8/345ce...` fayl yo'li — aynan hash'ning o'zi (birinchi 2 belgi papka, qolgan 38 tasi fayl nomi).

### Kod: hash'ni o'zingiz hisoblash

`git hash-object` faylning Git'dagi ID'sini hisoblaydi:

```text
$ git hash-object app.js
a8345ce15a32566ca36b9e7779e3e08a2f294a55
```

Bu `ls-tree`dagi `app.js` hash'i bilan bir xil. Hech qanday sir yo'q: Git `blob <bayt soni>`, nol bayt va fayl mazmunini birlashtirib, SHA-1 oladi. Buni Git'siz, oddiy `shasum` bilan takrorlaymiz:

```text
$ printf 'console.log("salom dunyo")\n' | wc -c
      27
$ printf 'blob 27\0console.log("salom dunyo")\n' | shasum
a8345ce15a32566ca36b9e7779e3e08a2f294a55  -
```

Aynan o'sha hash. Diskdagi obyekt fayli esa shu ma'lumotning zlib bilan siqilgan ko'rinishi:

```text
$ python3 -c "import zlib;print(zlib.decompress(open('.git/objects/a8/345ce15a32566ca36b9e7779e3e08a2f294a55','rb').read()))"
b'blob 27\x00console.log("salom dunyo")\n'
```

Obyekt formati, sarlavha va zlib haqida [14-bobda](14-obyektlar-blob.md) batafsil gaplashamiz. Hozircha asosiysi: **ID mazmundan hisoblanadi**. Shuning uchun:

- bir xil mazmun har doim bir xil ID oladi (yuqorida `README.md` blob'i ikki commit'da bir xil bo'lgani shundan);
- obyekt yaratilgandan keyin o'zgarmaydi — o'zgartirsangiz, bu endi **boshqa** ID'li boshqa obyekt;
- commit o'z tree'sining hash'ini, tree esa blob'lar hash'ini saqlaydi. Demak, bitta commit hash'i **butun loyiha va butun tarixni** "muhrlaydi": eng chuqurdagi bitta bayt o'zgarsa ham, yuqoridagi barcha hash'lar o'zgaradi.

### Kod: buzilish aniqlanadi

Tajriba uchun repo'ning nusxasida `app.js` obyekti faylini ataylab "buzamiz": ichiga boshqa mazmun yozamiz (`dunyo` o'rniga `dunya`), fayl nomi esa eski hash bo'lib qoladi.

```bash
$ cp -R loyiha buzilgan && cd buzilgan
$ f=.git/objects/a8/345ce15a32566ca36b9e7779e3e08a2f294a55
$ chmod u+w $f
$ python3 -c "import zlib; open('$f','wb').write(zlib.compress(b'blob 27\x00console.log(\"salom dunya\")\n'))"
```

`git fsck` — repo butunligini tekshiradigan buyruq — buni darhol topadi:

```text
$ git fsck --full
error: 7046705d15674ef30c09932c585bf3b8049b81ee: hash-path mismatch, found at: .git/objects/a8/345ce15a32566ca36b9e7779e3e08a2f294a55
missing blob a8345ce15a32566ca36b9e7779e3e08a2f294a55
$ echo $?
3
```

Git mazmunni qayta hash qildi va `7046705...` chiqdi — fayl nomidagi `a8345ce...` bilan mos emas. Natijada tree kutgan `a8345ce` blob'i "yo'q" deb hisoblanadi.

Buzilgan repo'ni boshqa joyga uzatishga urinsak (`--no-local` Git'ni haqiqiy tarmoq protokolidagidek pack yuborishga majbur qiladi):

```text
$ git clone --no-local buzilgan buzilgan-nusxa
Cloning into 'buzilgan-nusxa'...
fatal: did not receive expected object a8345ce15a32566ca36b9e7779e3e08a2f294a55
fatal: fetch-pack: invalid index-pack output
```

Qabul qiluvchi tomon kelgan har obyektning hash'ini o'zi hisoblaydi — kutilgan obyekt kelmagani uchun clone rad etildi. Pro Git'dagi "uzatishda ma'lumot yo'qolsa yoki fayl buzilsa, Git buni aniqlaydi" degan gap shu.

> **Nozik joy.** Bizning sinovda oddiy o'qish buyruqlari (`git cat-file -p HEAD:app.js`, `git show`) buzilgan mazmunni **xatosiz chiqarib berdi** — ular har o'qishda hash'ni qayta tekshirmaydi. Tekshiruv `git fsck`da va obyektlar repo'lar orasida uzatilganda bo'ladi. Shuning uchun disk yoki zaxira nusxalaringizga shubha bo'lsa, `git fsck` ishlating ([18-bob](18-packfile-va-gc.md), [42-bob](42-reflog-va-tiklash.md)).

### 4. Git odatda faqat ma'lumot qo'shadi

Git'dagi deyarli barcha amallar Git bazasiga faqat ma'lumot **qo'shadi**. Tizimni qaytarib bo'lmaydigan ish qilishga yoki ma'lumotni o'chirishga majburlash qiyin.

Har qanday VCS'dagi kabi, **hali commit qilinmagan** o'zgarishlarni yo'qotishingiz yoki buzishingiz mumkin. Lekin snapshot Git'ga commit qilingandan keyin uni yo'qotish juda qiyin — ayniqsa bazangizni muntazam boshqa repo'ga yuborib (push qilib) tursangiz.

Shuning uchun Git bilan bemalol tajriba qilish mumkin: jiddiy buzib qo'yish xavfi kam.

### Kod: "o'zgartirish" aslida yangi qo'shish

Oxirgi commit xabarini tuzatamiz (`--amend` — [11-bob](11-bekor-qilish.md)):

```text
$ git count-objects
8 objects, 32 kilobytes

$ git commit --amend -m "Salom matnini kengaytirish"
[main 2d5be83] Salom matnini kengaytirish
 Date: Wed Oct 7 10:05:00 2026 +0500
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git log --oneline
2d5be83 Salom matnini kengaytirish
b8d700f Birinchi versiya

$ git count-objects
9 objects, 36 kilobytes
```

Tarixda commit "o'zgargandek" ko'rinadi, lekin obyektlar soni 8 dan **9 ga oshdi**. Eski `a85ddc8` commit'i o'zgarmadi — uning yonida yangi `2d5be83` yaratildi va `main` shunchaki yangisiga ko'chirildi. Eskisi hamon joyida:

```text
$ git cat-file -t a85ddc8
commit
$ git log --oneline -1 a85ddc8
a85ddc8 Salomni kengaytirish

$ git reflog
2d5be83 HEAD@{0}: commit (amend): Salom matnini kengaytirish
a85ddc8 HEAD@{1}: clone: from /tmp/misol/loyiha
```

**Reflog** — `HEAD` va branch'lar qayerda bo'lganining lokal jurnali. U orqali "yo'qolgan" commit'ni topib qaytarish mumkin ([42-bob](42-reflog-va-tiklash.md)). `gitdatamodel` aniq aytadi: obyektlar yaratilgandan keyin **hech qachon o'zgarmaydi**; `--amend` xuddi shu otali **yangi** commit yaratadi.

Lekin "hech qachon o'chmaydi" degani emas: hech qaysi ref yoki reflog yozuvidan yetib bo'lmaydigan obyektlarni Git vaqti kelib o'chirishi mumkin (`gc`, [18-bob](18-packfile-va-gc.md)). Reflog yozuvlari ham muddati o'tgach o'chadi. Shuning uchun "qaytarib bo'ladi" — ma'lum muddat ichida, lokal repo'da.

### 5. Uch holat

Pro Git buni "Git haqida eng muhim narsa" deydi: fayllaringiz uchta asosiy holatda bo'lishi mumkin — **modified** (o'zgartirilgan, hali commit qilinmagan), **staged** (keyingi commit'ga kirishi belgilangan) va **committed** (bazada xavfsiz saqlangan). Ularga mos uchta hudud bor: **working tree**, **staging area** (**index**) va **Git papkasi** (`.git`).

```text
  working tree        staging area (index)      .git (repository)
  ────────────        ────────────────────      ─────────────────
       │                       │                        │
       │──── git add ─────────►│                        │
       │                       │──── git commit ───────►│
       │◄───────────── git switch / restore ────────────│
```

Bu mavzu shunchalik muhimki, unga alohida bob ajratilgan — [5-bob](05-uch-holat.md). Hozircha bitta fikrni yodda tuting: Git'da "faylni saqlash" ikki bosqichli — avval nima kirishini **tanlaysiz** (`add`), keyin **yozasiz** (`commit`).

## Kod: taqsimlanganlik amalda

Endi "har clone — to'liq zaxira" va "deyarli hamma narsa lokal" degan gaplarni tekshiramiz. Server rolini **bare repo** (working tree'siz, faqat `.git` ma'lumotlari bo'lgan repo — [4-bob](04-repo-olish.md)) o'ynaydi; tarmoq o'rniga lokal papka.

```bash
$ git clone --bare loyiha server.git     # "server"
$ git clone server.git noutbuk           # dasturchi kompyuteri
$ cd noutbuk
```

```text
$ git log --oneline
a85ddc8 Salomni kengaytirish
b8d700f Birinchi versiya

$ git remote -v
origin	/tmp/misol/server.git (fetch)
origin	/tmp/misol/server.git (push)
```

Endi serverni "o'ldiramiz" — butunlay o'chirib tashlaymiz:

```bash
$ rm -rf ../server.git
```

Noutbukda ish davom etadi — tarix ham, yangi commit ham:

```text
$ git log --oneline
a85ddc8 Salomni kengaytirish
b8d700f Birinchi versiya

$ echo "- kitob qo'shish" >> README.md
$ git commit -am "Rejani yozish"
[main 24181da] Rejani yozish
 1 file changed, 1 insertion(+)
```

Faqat tarmoqni talab qiladigan amal ishlamaydi:

```text
$ git push
fatal: '/tmp/misol/server.git' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

Serverni tiklash uchun bo'sh repo yaratib, noutbukdagi to'liq tarixni unga yuboramiz:

```text
$ git init --bare ../server.git
Initialized empty Git repository in /tmp/misol/server.git/

$ git push origin main
To /tmp/misol/server.git
 * [new branch]      main -> main

$ git -C ../server.git log --oneline
24181da Rejani yozish
a85ddc8 Salomni kengaytirish
b8d700f Birinchi versiya
```

Server butun tarixi bilan — hatto u "o'lik" paytida qilingan commit bilan ham — qayta tiklandi. Markazlashgan tizimda bu imkonsiz: mijozlarda faqat oxirgi fayllar bo'ladi, tarix esa server bilan birga yo'qoladi.

## Muhandislik nuqtai nazari: Git'ning ma'lumot modeli — to'rtta narsa

Rasmiy `gitdatamodel` hujjatiga ko'ra Git'ning asosiy amallari faqat **to'rt xil ma'lumotdan** foydalanadi. Butun kitob shu to'rtlikka tayanadi, shuning uchun ularni oldindan tanishtirib qo'yamiz:

| Ma'lumot | Nima | Qayerda batafsil |
| --- | --- | --- |
| **Obyektlar** | commit, tree, blob, teg obyekti. Har birining ID'si (hash), turi va mazmuni bor; yaratilgandan keyin o'zgarmaydi | [14](14-obyektlar-blob.md), [15](15-tree-va-index.md), [16-boblar](16-commit-obyekti.md) |
| **Ref'lar** (references) | commit'ga nom: branch (`refs/heads/`), teg (`refs/tags/`), remote-tracking branch (`refs/remotes/`), `HEAD` | [17](17-reflar-va-head.md), [20-boblar](20-branch-bu-ref.md) |
| **Index** (staging area) | keyingi commit'ga kiradigan fayllarning tekis ro'yxati | [5](05-uch-holat.md), [15-boblar](15-tree-va-index.md) |
| **Reflog'lar** | har ref qachon va nimaga o'zgarganining lokal jurnali | [42-bob](42-reflog-va-tiklash.md) |

Obyektlarning to'rt turi:

- **blob** — bitta fayl mazmuni (nomsiz!);
- **tree** — papka: har element uchun nom, tur (oddiy fayl, bajariladigan fayl, symlink, papka, gitlink) va obyekt ID;
- **commit** — ildiz tree ID'si, ota commit ID(lar)i (birinchi commit'da 0 ta, oddiyda 1 ta, merge'da 2+), muallif va vaqti, commit qiluvchi va vaqti, xabar;
- **teg obyekti** — belgilangan obyekt ID'si va turi, teg qo'ygan odam va sana, xabar.

Bu jadvalni yodlash shart emas. Lekin kelgusida "branch nima?", "reset nima qiladi?", "commit qanday yo'qoladi?" kabi savollarga javob shu to'rtlikda bo'ladi: har buyruq yo obyekt **qo'shadi**, yo ref'ni **ko'chiradi**, yo index'ni **o'zgartiradi** — va reflog bularni **yozib boradi**.

## Muhandislik nuqtai nazari: SHA-1 dan SHA-256 ga

Pro Git faqat SHA-1 haqida gapiradi. Hozirgi holat esa boshqacharoq:

- Git `sha256` obyekt formatini ham qo'llab-quvvatlaydi. Bunday repo'da ID — 64 belgi:

```text
$ git init --object-format=sha256 sha
$ cd sha && echo salom > a.txt && git add a.txt
$ git ls-files -s
100644 caa79a099664a4e0d29775d82115ac834c67a0d3e311cb34bdf34d0997c20149 0	a.txt
$ git rev-parse --show-object-format
sha256
```

- Rasmiy `BreakingChanges` hujjatiga ko'ra **Git 3.0 da yangi repo'lar uchun standart hash `sha256` bo'ladi**. Sabab: NIST SHA-1'ni 2011-yilda eskirgan deb e'lon qilgan, unga qarshi amaliy hujumlar bor (SHAppening 2015, SHAttered 2017, 2019 va 2020 yillardagi chosen-prefix hujumlari). Git'da ma'lum hujumlarga qarshi himoya bor, lekin oldindan tayyorlanish kerak deb hisoblanadi. `sha1` formatidan voz kechish rejasi hozircha yo'q.
- Shu paytgacha ko'pchilik repo'lar (va bu kitobdagi misollar) SHA-1 da. Ikki format o'rtasidagi farqlar — [14-bobda](14-obyektlar-blob.md).

Amaliy xulosa: hash uzunligini kodda "40 belgi" deb qattiq yozib qo'ymang. `git rev-parse --show-object-format` bilan formatni so'rang.

## Muhandislik nuqtai nazari: Git nima emas

Boshlovchilar ko'p chalkashtiradigan bir necha narsa:

- **Git — GitHub emas.** Git — kompyuteringizdagi dastur va repo formati. GitHub, GitLab, Bitbucket — Git repo'larini saqlaydigan va ustiga Pull Request, issue, CI kabi xizmatlar qo'shadigan **saytlar** (*forge*). Git ularsiz to'liq ishlaydi ([35-bob](35-github-fork-va-pr.md)).
- **Git — zaxira nusxa xizmati emas.** Lokal repo'ning o'zi bitta diskda. Har clone — zaxira, lekin faqat clone **mavjud bo'lsa** va **yangilab turilsa** (push/fetch). Commit qilinmagan ish hech qayerda yo'q.
- **Git — katta binar fayllar ombori emas.** Snapshot modeli matnli fayllarda juda samarali. Har versiyasi to'liq yangi blob bo'ladigan katta binar fayllar (video, dataset) repo'ni tez shishiradi — buning uchun alohida yechimlar bor (Git LFS va boshqalar).
- **Git — "markaziy server"siz ham ishlaydi**, lekin jamoalar odatda bitta repo'ni **kelishuv bo'yicha** "asosiy" deb belgilaydi. Bu texnik emas, tashkiliy qaror: Git uchun hamma repo'lar teng ([32-bob](32-taqsimlangan-workflowlar.md)).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Papkalarni `-final`, `-final-2` deb nusxalash | Qaysi farq qayerda, kim va nega o'zgartirgani noma'lum; noto'g'ri papkaga yozish oson | Bitta papka + Git: har versiya commit, xabari bilan |
| Git'ni SVN kabi "commit = serverga yuborish" deb o'ylash | Commit qilmay kutib yurasiz, ish yo'qolish xavfi oshadi | Commit — lokal; tez-tez commit qiling, yuborish (`push`) — alohida qadam |
| Git farqlarni saqlaydi deb o'ylash | Branch, reset, rebase "sehrli" tuyuladi | Git snapshot saqlaydi, farqni har safar hisoblaydi |
| "Commit'ni o'zgartirdim" deb eski commit yo'qoldi deb qo'rqish | Ko'pincha u hamon mavjud | Obyektlar o'zgarmaydi; eskisi reflog orqali topiladi ([42-bob](42-reflog-va-tiklash.md)) |
| Commit qilinmagan ishni "Git saqlaydi" deb ishonish | Git faqat commit qilingan (yoki stash qilingan) narsani biladi | Muhim ishni commit qiling; boshqa repo'ga push qiling |
| `.git/objects` ichidagi fayllarni qo'lda tahrirlash | Hash mos kelmay qoladi, obyekt "yo'qoladi" | Faqat Git buyruqlari bilan ishlang; shubha bo'lsa `git fsck` |
| Kod yoki skriptda hash'ni "40 belgi" deb qattiq yozish | SHA-256 repo'larda 64 belgi | `git rev-parse --show-object-format` |
| "GitHub ishlamayapti — ishlay olmayman" | Git'ning deyarli hamma amali lokal | Commit, branch, log, diff — oflayn; faqat push/fetch kutadi |

## Amaliyot

1. O'zingiz versiya nazoratini "papkalar bilan" qilgan bir holatni eslang. Yuqoridagi beshta kamchilikdan qaysilari sizda uchragan edi?
2. Lokal, markazlashgan va taqsimlangan VCS'ni bitta jadvalda solishtiring: tarix qayerda saqlanadi, server o'lsa nima bo'ladi, oflayn commit qilish mumkinmi.
3. Bobdagi `loyiha` misolini takrorlang: uch fayl, ikki commit. `git ls-tree HEAD~1` va `git ls-tree HEAD` natijalarini solishtirib, qaysi hash'lar bir xil qolganini va nega shundayligini tushuntiring.
4. `git hash-object` bilan istalgan faylning hash'ini oling, keyin uni `printf 'blob <hajm>\0...' | shasum` bilan Git'siz takrorlang. Faylga bitta bo'sh joy qo'shib, hash qanchalik o'zgarganini ko'ring.
5. Bare "server" va clone bilan "server o'ldi" tajribasini takrorlang: serverni o'chiring, clone'da commit qiling, serverni clone'dan tiklang.
6. `git commit --amend` dan oldin va keyin `git count-objects` ni ishga tushiring. Eski commit hash'ini `git cat-file -t` bilan tekshiring — u hali bormi?
7. (Qiyinroq) Repo'ning **nusxasida** bitta obyekt faylini buzing (bobdagi usul bilan) va `git fsck --full` natijasini o'qing. Keyin buzilgan obyektni asl repo'dan ko'chirib, xatoni tuzating va `fsck` yana toza ekanini tekshiring. Nega `git show` buzilishni sezmadi, `clone --no-local` esa sezdi?

## Rasmiy hujjat

- Pro Git — About Version Control: <https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control>
- Pro Git — A Short History of Git: <https://git-scm.com/book/en/v2/Getting-Started-A-Short-History-of-Git>
- Pro Git — What is Git?: <https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F>
- `gitdatamodel`: <https://git-scm.com/docs/gitdatamodel>
- `git fsck`: <https://git-scm.com/docs/git-fsck>
- `git hash-object`: <https://git-scm.com/docs/git-hash-object>
- Git 3.0 o'zgarishlari (`BreakingChanges`): <https://git-scm.com/docs/BreakingChanges>
