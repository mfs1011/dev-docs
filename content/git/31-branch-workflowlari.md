# 31 — Branch bilan ishlash uslublari

[← Oldingi: SSH kalit va credential'lar](30-ssh-va-credential.md) · [Mundarija](README.md) · [Keyingi: Taqsimlangan workflow'lar →](32-taqsimlangan-workflowlar.md)

## Tushuncha

Oldingi boblarda branch'ning **qanday** ishlashini ko'rdik: branch — bu `.git/refs/heads/` ichidagi, bitta commit hash'ini saqlaydigan kichik fayl ([20-bob](20-branch-bu-ref.md)), merge ikki tarixni birlashtiradi ([21-bob](21-branch-va-merge.md)), remote'ga push qilinadi ([27-bob](27-remote.md)). Bu bobning savoli boshqa: branch'lardan **qanday foydalanish kerak**? Qaysi branch qancha yashaydi, nimani saqlaydi, o'zgarish qaysi yo'l bilan qaysi branch'ga o'tadi?

Bunday kelishuvlar to'plami **workflow** (ish oqimi) deyiladi. Git sizga bitta workflow'ni majburlamaydi — u faqat vositalar beradi. Lekin ikki xil branch deyarli hamma loyihada uchraydi:

| Tur | Qancha yashaydi | Nima uchun | Misol nomlar |
| --- | --- | --- | --- |
| **Uzoq yashovchi** (long-running) branch | Loyiha bilan birga, yillab | Barqarorlik darajasini ifodalaydi: "relizga tayyor", "sinovda", "tajriba" | `main`/`master`, `develop`, `next`, `maint` |
| **Topic branch** | Daqiqalardan oylargacha, keyin o'chiriladi | Bitta vazifa, bitta xususiyat yoki bitta tuzatish | `iss53`, `foiz-hisoblash`, `ab/nol-xato` |

**Uzoq yashovchi branch** — bu doim ochiq turadigan va o'zgarishlar vaqti-vaqti bilan bir-biriga merge qilinadigan branch'lar. **Topic branch** — bitta ish uchun ochilib, ish tugagach birlashtiriladigan va o'chiriladigan qisqa umrli branch. Ikkalasi birga ishlaydi: topic branch'lar uzoq yashovchi branch'larga "quyiladi".

Bob uch qismdan iborat:

1. Pro Git'dagi asosiy g'oyalar — uzoq yashovchi branch'lar va topic branch'lar;
2. Git loyihasining **o'zi** ishlatadigan tizim (`maint`, `master`, `next`, `seen`) — rasmiy `gitworkflows` hujjatida yozilgan qoidalar bilan, lokal server va test qiluvchi klon bilan to'liq namoyish;
3. bu qoidalarni o'z loyihangizga qanday moslash.

> **Muhim.** Bobdagi hamma branch'lash va merge **lokal** amal. Pro Git ta'kidlaydi: branch yaratish va merge qilishda server bilan hech qanday aloqa bo'lmaydi. Server faqat siz `push` yoki `fetch` qilganingizda ishtirok etadi. Bir nechta odam o'rtasidagi ish oqimlari — keyingi, [32-bob](32-taqsimlangan-workflowlar.md)da.

## Nega shunday: nega Git'da branch'lar workflow'ning markazida

**Muammo.** Eski markazlashgan tizimlarda (CVS, SVN) branch yaratish va ayniqsa merge qilish qimmat edi: branch — butun papkaning nusxasi, merge — og'riqli qo'l mehnati. Shuning uchun odamlar branch'dan qochardi va hamma bitta "trunk"da ishlardi.

**Yechim.** Git'da ikkala amal arzon:

- **Branch yaratish** — 41 baytlik fayl yozish ([20-bob](20-branch-bu-ref.md)). Hech narsa nusxalanmaydi.
- **Merge** — Pro Git aytganidek, Git oddiy **uch tomonlama merge** ishlatadi: ikki uch va ularning umumiy ajdodi (merge base) solishtiriladi ([21-bob](21-branch-va-merge.md)). Merge base har safar qaytadan topiladi, shuning uchun bir branch'dan ikkinchisiga uzoq vaqt davomida **ko'p marta** merge qilish odatda oson: Git oldingi merge'lardan keyin nima yangi ekanini o'zi biladi.

Natijada Pro Git yozganidek, Git'da "kuniga bir necha marta branch yaratish, unda ishlash, merge qilish va o'chirish" — oddiy holat. Branch'lar arzon bo'lgani uchun ularni **tashkiliy vosita** sifatida ishlatish mumkin: har barqarorlik darajasi uchun bitta branch, har vazifa uchun bitta branch.

Rasmiy `gitworkflows` hujjati yana bir sababni aytadi: o'zgarishni bir branch'dan boshqasiga o'tkazishning ikki asosiy vositasi bor — `git merge` va `git cherry-pick`. **Merge branch darajasida ishlaydi, cherry-pick — commit darajasida.** Merge 1, 10 yoki 1000 commit'ni bir xil osonlik bilan olib o'tadi va shuning uchun ko'p hissa qo'shuvchili loyihalarda yaxshi masshtablanadi. Merge commit — "barcha otalardagi barcha o'zgarishlar endi shu yerda" degan **va'da**. Shu sabab Git loyihasi muammolarni imkon qadar faqat merge bilan hal qilishga harakat qiladi; cherry-pick esa ba'zi hollarda (pastda — "merge upwards") kerak bo'ladi.

Narxi ham bor: merge'ga tayangan workflow branch'larni **ehtiyotkorroq boshqarishni** talab qiladi. Bobning qolgan qismi aynan shu boshqaruv qoidalari haqida.

## Kod: topic branch'lar

**Topic branch** — bitta aniq vazifa (xususiyat, xato tuzatish, tajriba) uchun ochiladigan qisqa umrli branch. Pro Git uni har qanday hajmdagi loyiha uchun foydali deydi, chunki:

- kontekstni tez va **to'liq** almashtirish mumkin — har branch'dagi o'zgarishlar faqat bitta mavzuga tegishli;
- code review paytida nima qilinganini ko'rish oson;
- o'zgarishlarni daqiqa, kun yoki oy saqlab turib, tayyor bo'lganda **qaysi tartibda yaratilganidan qat'i nazar** merge qilish mumkin.

Pro Git'dagi misolni haqiqiy repo'da takrorlaymiz. Ssenariy: `main`da ishlaysiz, `iss91` vazifasi uchun branch ochasiz, unda biroz ishlaganingizdan keyin **shu muammoni boshqa yo'l bilan** hal qilib ko'rish uchun `iss91` ichidan `iss91v2` ochasiz. Keyin `main`ga qaytib biroz ishlaysiz va u yerdan "yaxshi g'oya ekaniga ishonchingiz komil emas" bo'lgan `dumbidea` branch'ini ochasiz.

```bash
$ git init
$ # ... "Loyiha boshlandi", "Menyu qo'shildi" commit'lari main'da
$ git switch -c iss91
$ # ... "iss91: sababni topish"
$ git switch -c iss91v2
$ # ... "iss91v2: boshqacha yondashuv", "iss91v2: testlar"
$ git switch iss91
$ # ... "iss91: birinchi yechim", "iss91: yechimni tuzatish"
$ git switch main
$ # ... "Footer qo'shildi"
$ git switch -c dumbidea
$ # ... ikki commit
$ git switch main
```

Natija — to'rtta parallel ish chizig'i:

```bash
$ git log --oneline --graph --all --decorate
* cb92328 (dumbidea) dumbidea: g'oyani davom ettirish
* d44c262 dumbidea: sinab ko'riladigan g'oya
* 2af676d (HEAD -> main) Footer qo'shildi
| * accbb77 (iss91) iss91: yechimni tuzatish
| * 1acb809 iss91: birinchi yechim
| | * 3d2247a (iss91v2) iss91v2: testlar
| | * 332c8ec iss91v2: boshqacha yondashuv
| |/  
| * 76e7dd8 iss91: sababni topish
|/  
* 3d24241 Menyu qo'shildi
* f4b998e Loyiha boshlandi
```

> `--decorate` — branch va teg nomlarini qavs ichida ko'rsatadi. Terminalda u odatda avtomatik yoqiladi (`log.decorate=auto`), lekin chiqish quvurga (pipe) yoki faylga ketganda yo'q — shuning uchun misollarda aniq yozilgan ([9-bob](09-tarixni-korish.md)).

`git branch -v` har branch'ning uchini, `--no-merged` esa joriy branch'ga (`main`) hali qo'shilmagan branch'larni ko'rsatadi ([23-bob](23-branch-boshqaruvi.md)):

```bash
$ git branch -v
  dumbidea cb92328 dumbidea: g'oyani davom ettirish
  iss91    accbb77 iss91: yechimni tuzatish
  iss91v2  3d2247a iss91v2: testlar
* main     2af676d Footer qo'shildi
$ git branch --no-merged
  dumbidea
  iss91
  iss91v2
```

Endi qaror: ikkinchi yechim (`iss91v2`) yaxshiroq chiqdi, `dumbidea` esa hamkasblarga ko'rsatilganda ajoyib g'oya bo'lib chiqdi. Birinchi yechim (`iss91`) kerak emas. Uni o'chiramiz — u merge qilinmagani uchun oddiy `-d` rad etadi:

```bash
$ git branch -d iss91
error: the branch 'iss91' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D iss91'
hint: Disable this message with "git config set advice.forceDeleteBranch false"
$ git branch -D iss91
Deleted branch iss91 (was accbb77).
```

`-D` faqat ref faylini o'chiradi. `1acb809` va `accbb77` commit'lari obyekt sifatida hali bor va `HEAD` reflog'ida ko'rinadi (`git reflog` → `accbb77 HEAD@{8}: commit: iss91: yechimni tuzatish`), ya'ni kerak bo'lsa tiklash mumkin ([42-bob](42-reflog-va-tiklash.md)). Lekin hech qaysi branch ularni ko'rsatmagani uchun bir muddatdan keyin `gc` ularni tozalaydi ([18-bob](18-packfile-va-gc.md)).

Qolgan ikkitasini merge qilamiz — yaratilish tartibidan qat'i nazar:

```bash
$ git merge --no-edit dumbidea
Updating 2af676d..cb92328
Fast-forward
 idea.txt | 2 ++
 1 file changed, 2 insertions(+)
 create mode 100644 idea.txt
$ git merge --no-edit iss91v2
Merge made by the 'ort' strategy.
 iss91.txt | 3 +++
 1 file changed, 3 insertions(+)
 create mode 100644 iss91.txt
$ git log --oneline --graph --all --decorate
*   01f9231 (HEAD -> main) Merge branch 'iss91v2'
|\  
| * 3d2247a (iss91v2) iss91v2: testlar
| * 332c8ec iss91v2: boshqacha yondashuv
| * 76e7dd8 iss91: sababni topish
* | cb92328 (dumbidea) dumbidea: g'oyani davom ettirish
* | d44c262 dumbidea: sinab ko'riladigan g'oya
* | 2af676d Footer qo'shildi
|/  
* 3d24241 Menyu qo'shildi
* f4b998e Loyiha boshlandi
```

E'tibor bering: `76e7dd8 iss91: sababni topish` saqlanib qoldi — u `iss91v2`ning ham ajdodi edi. O'chirilgan faqat `iss91`ga xos ikki commit. `dumbidea` fast-forward bo'ldi (`main` uning ajdodi edi), `iss91v2` esa uch tomonlama merge talab qildi.

Ish tugadi — topic branch'lar endi kerak emas:

```bash
$ git branch --merged
  dumbidea
  iss91v2
* main
$ git branch -d dumbidea iss91v2
Deleted branch dumbidea (was cb92328).
Deleted branch iss91v2 (was 3d2247a).
```

Topic branch'ning hayot sikli shu: **ochish → ishlash → merge → o'chirish**. Branch nomi yo'qoladi, commit'lar esa `main` tarixida qoladi.

## Kod: uzoq yashovchi branch'lar

Pro Git yozadi: ko'p Git dasturchilari `master` (bugun ko'pincha `main`) branch'ida **faqat to'liq barqaror kodni** saqlaydi — ehtimol faqat reliz qilingan yoki reliz qilinadigan kodni. Unga parallel `develop` yoki `next` nomli branch bo'ladi: unda ishlashadi yoki barqarorlikni sinashadi. U har doim barqaror emas, lekin barqaror holatga kelganda `main`ga merge qilinadi. Topic branch'lar tayyor bo'lganda avval shu `develop`ga qo'shiladi — testlardan o'tishi va xato kiritmasligiga ishonch hosil qilish uchun.

```bash
$ git switch -c develop
Switched to a new branch 'develop'
$ # ... "Kesh qatlami" commit'i
$ git switch -c izlash
Switched to a new branch 'izlash'
$ # ... "Izlash: indeks", "Izlash: interfeys"
$ git switch develop
Switched to branch 'develop'
$ git merge --no-ff --no-edit izlash
Merge made by the 'ort' strategy.
 izlash.txt | 2 ++
 1 file changed, 2 insertions(+)
 create mode 100644 izlash.txt
$ git branch -d izlash
Deleted branch izlash (was 1db8c2a).
$ git log --oneline --graph --all --decorate
*   130e9e2 (HEAD -> develop) Merge branch 'izlash' into develop
|\  
| * 1db8c2a Izlash: interfeys
| * 04d62e6 Izlash: indeks
|/  
* 36bef58 Kesh qatlami
* 6bd1edc (tag: v1.0, main) Birinchi reliz
```

`--no-ff` — fast-forward mumkin bo'lsa ham merge commit yaratish ([21-bob](21-branch-va-merge.md)). Integratsiya branch'larida bu foydali: tarixda "bu yerda `izlash` mavzusi qo'shildi" degan aniq nuqta qoladi va uni kerak bo'lsa bitta `revert -m 1` bilan qaytarish mumkin ([26-bob](26-murakkab-merge.md)).

`main` hali `v1.0`da. "Relizga nima kutib turibdi?" degan savolga `..` diapazoni javob beradi ([19-bob](19-revision-tanlash.md)):

```bash
$ git log --oneline main..develop
130e9e2 Merge branch 'izlash' into develop
1db8c2a Izlash: interfeys
04d62e6 Izlash: indeks
36bef58 Kesh qatlami
```

`develop` sinovdan o'tdi deylik. Uni `main`ga ko'taramiz. `main` — `develop`ning ajdodi, shuning uchun fast-forward kifoya; `--ff-only` esa "agar tarix ajralib qolgan bo'lsa — to'xta" degan himoya:

```bash
$ git switch main
Switched to branch 'main'
$ git merge --ff-only develop
Updating 6bd1edc..130e9e2
Fast-forward
 app.txt    | 1 +
 izlash.txt | 2 ++
 2 files changed, 3 insertions(+)
 create mode 100644 izlash.txt
$ git log --oneline --graph --all --decorate
*   130e9e2 (HEAD -> main, develop) Merge branch 'izlash' into develop
|\  
| * 1db8c2a Izlash: interfeys
| * 04d62e6 Izlash: indeks
|/  
* 36bef58 Kesh qatlami
* 6bd1edc (tag: v1.0) Birinchi reliz
```

### Ikki xil qarash: chiziq va "silos"

Pro Git aytadi: aslida bu yerda gap commit'lar chizig'i bo'ylab **yuqoriga siljiydigan ko'rsatkichlar** haqida. Barqaror branch'lar tarixda pastroqda (eskiroq commit'da), eng yangi ("bleeding-edge") branch'lar yuqoriroqda turadi:

```text
  Chiziqli ko'rinish: ko'rsatkichlar bitta tarix bo'ylab turli balandlikda

  C1 ─── C2 ─── C3 ─── C4 ─── C5 ─── C6 ─── C7
                ▲                    ▲             ▲
              main                develop        topic
          (eng barqaror)       (sinovda)     (eng yangi)
```

Lekin ularni **silos**lar (alohida omborlar) deb tasavvur qilish osonroq: commit'lar to'plami to'liq sinovdan o'tganda barqarorroq silosga "bitiradi" (graduate):

```text
  "Silos" ko'rinishi: o'zgarish barqarorroq darajaga ko'tariladi

  ┌───────────────┐   tayyor   ┌───────────────┐  barqaror  ┌───────────────┐
  │ topic         │ ─────────▶ │ develop       │ ─────────▶ │ main          │
  │ C6, C7        │   merge    │ C3, C4, C5    │   merge    │ C1, C2        │
  └───────────────┘            └───────────────┘            └───────────────┘
     tajriba                      sinov                       reliz
```

Darajalar soni ikki bilan cheklanmaydi. Pro Git yozadi: ba'zi katta loyihalarda yana `proposed` yoki `pu` (proposed updates — taklif qilingan yangilanishlar) branch'i bor — unga hali `next` yoki `master`ga tayyor bo'lmagan branch'lar integratsiya qilinadi. G'oya: branch'lar turli barqarorlik darajasida; barqarorroq darajaga yetganda yuqoridagi branch'ga merge qilinadi. Bir nechta uzoq yashovchi branch **shart emas**, lekin katta va murakkab loyihalarda foydali.

> **Nom haqida.** Pro Git'dagi `pu` — Git loyihasining eski nomi; u keyinchalik `seen` deb o'zgartirilgan. v2.56.0 `gitworkflows` hujjatida faqat `seen` ishlatiladi. Quyida aynan shu tizimni ko'ramiz.

## Kod: Git loyihasining o'z tizimi — `maint`, `master`, `next`, `seen`

`git help workflows` (ya'ni `gitworkflows(7)`) — Git'ning rasmiy hujjati bo'lib, unda **`git.git`** (Git'ning o'z manba kodi repo'si) ishlatadigan workflow elementlari yozilgan. Hujjatning o'zi ogohlantiradi: ko'p g'oyalar umumiy, lekin to'liq workflow kichik loyihalarda kamdan-kam kerak bo'ladi; qoidalarni har doim so'zma-so'z qabul qilmang — **asosli sabab** man sahifadan muhimroq.

### To'rtta integratsiya branch'i

**Integratsiya branch'i** — topic branch'lar birlashtiriladigan uzoq yashovchi branch. `git.git`da ular to'rtta:

| Branch | Nimani kuzatadi | Barqarorlik |
| --- | --- | --- |
| `maint` | Keyingi **texnik xizmat relizi**ga (oxirgi barqaror versiyaning yangilanishi, masalan 1.0 → 1.0.1) kiradigan commit'lar | Eng barqaror |
| `master` | Keyingi **asosiy reliz**ga (masalan 1.1) kiradigan commit'lar | Barqaror |
| `next` | `master`ga o'tish uchun barqarorlik sinovidan o'tayotgan topic'lar | Sinov |
| `seen` | "Maintainer ko'rgan patch'lar" — hali qo'shishga to'liq tayyor bo'lmagan narsalar | **Bir martalik**, istalgan payt qayta quriladi |

Hujjat bo'yicha to'rttasining har biri odatda **o'zidan yuqoridagisining to'g'ridan-to'g'ri avlodi**: `master` `maint`ni o'z ichiga oladi, `next` — `master`ni, `seen` — `next`ni.

```text
  Qatlamlar: har biri yuqoridagini o'z ichiga oladi

  maint  ⊂  master  ⊂  next  ⊂  seen
  (tuzatish) (reliz)   (sinov)  (tajriba, bir martalik)
```

Xususiyat **beqaror** branch'dan (odatda `next` yoki `seen`) kiradi va yetarlicha barqaror deb topilganda keyingi reliz uchun `master`ga **bitiradi** (graduation).

### Tajriba maydoni

Uchta repo: server (bare), maintainer (barcha integratsiya branch'larini yuritadigan odam) va tester (faqat `fetch` qilib sinab ko'radigan odam).

```text
31-gitgit/
├── server.git/   ← hamma o'qiydigan ommaviy repo (bare)
├── maintainer/   ← integratsiya branch'larini yurituvchi
└── tester/       ← klon: next va seen'ni sinaydi
```

```bash
$ git init --bare -b master server.git
Initialized empty Git repository in .../31-gitgit/server.git/
$ git init -b master maintainer
Initialized empty Git repository in .../31-gitgit/maintainer/.git/
$ cd maintainer
$ # ... "Qo'shish amali", "Ayirish amali"
$ git tag -a v1.0 -m 'Versiya 1.0'
$ git branch maint
$ # ... master'da "1.1 uchun reliz eslatmalari boshlandi"
$ git branch next
$ git branch seen
$ git remote add origin ../server.git
$ git push origin maint master next seen v1.0
To ../server.git
 * [new branch]      maint -> maint
 * [new branch]      master -> master
 * [new branch]      next -> next
 * [new branch]      seen -> seen
 * [new tag]         v1.0 -> v1.0
$ git log --oneline --graph --decorate --all
* 6901e91 (HEAD -> master, origin/seen, origin/next, origin/master, seen, next) 1.1 uchun reliz eslatmalari boshlandi
* 35cc492 (tag: v1.0, origin/maint, maint) Ayirish amali
* 068220e Qo'shish amali
```

`-b master` — bu misolda Git loyihasining nomlarini aynan saqlash uchun; o'z loyihangizda `main` bo'lishi mumkin ([23-bob](23-branch-boshqaruvi.md)). Server uchun ham `-b master` berildi, aks holda bare repo'ning `HEAD`i mavjud bo'lmagan `main`ga qarab, klon "remote HEAD refers to nonexistent ref" ogohlantirishi bilan bo'sh qolardi.

`maint` `v1.0` relizida qoldi, `master` esa bir commit oldinga ketdi — keyingi asosiy reliz ustida ish boshlandi.

### Qoida: topic'ni eng eski integratsiya branch'idan oching

`gitworkflows` qoidasi:

> **Har mavzu (xususiyat, xato tuzatish, ...) uchun yon branch oching. Uni oxir-oqibat merge qilmoqchi bo'lgan eng eski integratsiya branch'idan ajrating.**

Nega? Topic'ning ajdodlari unga **qo'shilib** keladi. Agar `maint`ga kirishi kerak bo'lgan tuzatish `master`dan ochilsa, uni `maint`ga merge qilganda `master`dagi hali relizga tayyor bo'lmagan hamma narsa ham `maint`ga o'tib ketadi.

Shuning uchun xato tuzatish `maint`dan, yangi xususiyatlar `master`dan ochiladi. Nomlarda `git.git` uslubi: **muallif bosh harflari / qisqa tavsif** (`ab/nol-xato`) — hujjatdagi retseptlarda ham `ai/topic_in_next1` kabi nomlar ishlatiladi.

```bash
$ git switch -c ab/nol-xato maint
Switched to a new branch 'ab/nol-xato'
$ # ... "Nolga bo'lishda xato chiqarish"
$ git switch -c cd/foiz master
Switched to a new branch 'cd/foiz'
$ # ... "Foiz hisoblash", "Foiz uchun testlar"
$ git switch -c ef/daraja master
Switched to a new branch 'ef/daraja'
$ # ... "Darajaga ko'tarish (tajriba)"
```

### Noto'g'ri joydan ochilgan topic: `rebase --onto`

To'rtinchi tuzatish xato bilan `master`dan ochildi, holbuki u `maint`ga ham kerak:

```bash
$ git switch -c kl/yaxlitlash master
Switched to a new branch 'kl/yaxlitlash'
$ # ... "Yaxlitlashdagi xatoni tuzatish"
$ git log --oneline maint..kl/yaxlitlash
7b7a1b2 Yaxlitlashdagi xatoni tuzatish
6901e91 1.1 uchun reliz eslatmalari boshlandi
```

Ko'rinib turibdiki, bu branch'ni `maint`ga merge qilsak, `6901e91` (master'dagi reliz eslatmasi) ham `maint`ga o'tadi. Hujjat aytadi: noto'g'ri branch'dan ajratganingizni sezsangiz va uni "vaqtda orqaga" ko'chirmoqchi bo'lsangiz — `git rebase` ishlating. `--onto maint master kl/yaxlitlash` degani: "`master`dan keyingi commit'larni olib, `maint` ustiga qo'y" ([24-bob](24-rebase.md)):

```bash
$ git rebase --onto maint master kl/yaxlitlash
Rebasing (1/1)Successfully rebased and updated refs/heads/kl/yaxlitlash.
$ git log --oneline maint..kl/yaxlitlash
f6949ed Yaxlitlashdagi xatoni tuzatish
```

Endi topic'da faqat o'zining bitta commit'i. Hash o'zgardi (`7b7a1b2` → `f6949ed`) — rebase yangi commit yaratadi. Hujjat shu yerda ogohlantiradi: bu imkoniyat boshqa ikkitasi bilan to'qnashadi — **boshqa joyga merge qilingan topic'ni rebase qilmang** (`git rebase` hujjatidagi "RECOVERING FROM UPSTREAM REBASE" bo'limi). `kl/yaxlitlash` hali hech qayerga qo'shilmagan, shuning uchun xavfsiz.

### Qoida: bir martalik integratsiya — `seen`

Ko'p kichik topic'lar paydo bo'ldi. Ular bir-biri bilan qanday ishlaydi? Balki birlashtirilgan natija umuman ishlamas? Lekin ularni biror "barqaror" joyga merge qilishni istamaymiz — bunday merge'larni oson qaytarib bo'lmaydi. Hujjat yechimi: **qaytarib bo'ladigan merge qiling — bir martalik (throw-away) branch'ga**.

> **Bir nechta topic'ning o'zaro ta'sirini sinash uchun ularni bir martalik branch'ga merge qiling. Bunday branch ustiga hech qachon hech qanday ish qurmang!**

```bash
$ git switch seen
Switched to branch 'seen'
$ git merge --no-ff --no-edit ab/nol-xato
Merge made by the 'ort' strategy.
 kalk.txt | 1 +
 1 file changed, 1 insertion(+)
$ git merge --no-ff --no-edit cd/foiz
...
$ git merge --no-ff --no-edit ef/daraja
...
$ git merge --no-ff --no-edit kl/yaxlitlash
...
$ git log --oneline --graph --decorate seen
*   8d8cd9f (HEAD -> seen) Merge branch 'kl/yaxlitlash' into seen
|\  
| * f6949ed (kl/yaxlitlash) Yaxlitlashdagi xatoni tuzatish
* |   aa603e4 Merge branch 'ef/daraja' into seen
|\ \  
| * | 2e8b607 (ef/daraja) Darajaga ko'tarish (tajriba)
* | |   d9aca08 Merge branch 'cd/foiz' into seen
|\ \ \  
| * | | 17c67ba (cd/foiz) Foiz uchun testlar
| * | | dd4a8a7 Foiz hisoblash
| |/ /  
* | |   1e6b74f Merge branch 'ab/nol-xato' into seen
|\ \ \  
| |/ /  
|/| |   
| * | de758ca (ab/nol-xato) Nolga bo'lishda xato chiqarish
| |/  
* / 6901e91 (origin/seen, origin/next, origin/master, next, master) 1.1 uchun reliz eslatmalari boshlandi
|/  
* 35cc492 (tag: v1.0, origin/maint, maint) Ayirish amali
* 068220e Qo'shish amali
```

Hujjat bo'yicha, agar bu branch testdan keyin o'chirilishi (yoki qayta qurilishi) **juda aniq** e'lon qilingan bo'lsa, uni hatto **ommaga chiqarish** mumkin — testerlar u bilan ishlab ko'rsin, boshqa dasturchilar o'z ishi mos kelishini tekshirsin. `git.git`da aynan shunday rasmiy bir martalik branch bor — `seen`.

```bash
$ git push origin seen
To ../server.git
   6901e91..8d8cd9f  seen -> seen
$ cd ..
$ git clone server.git tester
Cloning into 'tester'...
done.
$ cd tester
$ git branch -r
  origin/HEAD -> origin/master
  origin/maint
  origin/master
  origin/next
  origin/seen
```

### `next`: sinov uchun integratsiya

Uchta topic yaxshi ko'rindi — ular `next`ga o'tadi. `ef/daraja` hali tajriba, faqat `seen`da qoladi:

```bash
$ cd ../maintainer
$ git switch next
Switched to branch 'next'
$ git merge --no-ff --no-edit ab/nol-xato
...
$ git merge --no-ff --no-edit cd/foiz
...
$ git merge --no-ff --no-edit kl/yaxlitlash
...
$ git log --oneline --graph --decorate next
*   ae2a63a (HEAD -> next) Merge branch 'kl/yaxlitlash' into next
|\  
| * f6949ed (kl/yaxlitlash) Yaxlitlashdagi xatoni tuzatish
* |   5fa9b79 Merge branch 'cd/foiz' into next
|\ \  
| * | 17c67ba (cd/foiz) Foiz uchun testlar
| * | dd4a8a7 Foiz hisoblash
* | |   b616db0 Merge branch 'ab/nol-xato' into next
...
```

Muhim nuqta: `ab/nol-xato` `maint`dan ochilgan, lekin u birinchi bo'lib `next`ga tushdi. Hujjat buni aniq aytadi: topic'ni avval eng eski integratsiya branch'iga merge qilish **shart emas**. Masalan, tuzatishni avval `next`ga qo'yib, sinovga vaqt berib, barqarorligiga ishonch hosil qilgach `maint`ga merge qilish mumkin. Topic `maint`dan ochilgani buni **imkon** qiladi: u `maint`ga kirganda ortiqcha narsa olib kirmaydi.

### `seen`ni qayta qurish va majburiy push

Endi `seen` "`next` + `next`ga hali kirmagan topic'lar" bo'lishi kerak (har branch yuqoridagining avlodi). Uni joyida tuzatish o'rniga noldan quramiz. `git switch -C seen next` — `seen`ni majburan `next`ga o'rnatib, o'tadi (`-C` = mavjud bo'lsa ham qayta yaratish):

```bash
$ git switch -C seen next
Switched to and reset branch 'seen'
$ git merge --no-ff --no-edit ef/daraja
Merge made by the 'ort' strategy.
 daraja.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 daraja.txt
$ git log --oneline --graph --decorate -4 seen
*   dc17ef9 (HEAD -> seen) Merge branch 'ef/daraja' into seen
|\  
| * 2e8b607 (ef/daraja) Darajaga ko'tarish (tajriba)
* |   ae2a63a (next) Merge branch 'kl/yaxlitlash' into next
|\ \  
```

Eski `seen` uchi (`8d8cd9f`) yangi `seen`ning ajdodi emas — tarix qayta yozildi. Shuning uchun oddiy push rad etiladi ([27-bob](27-remote.md)dagi fast-forward qoidasi):

```bash
$ git push origin next seen
To ../server.git
   6901e91..ae2a63a  next -> next
 ! [rejected]        seen -> seen (non-fast-forward)
error: failed to push some refs to '../server.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

Bu yerda Git maslahati ("`git pull` qiling") **noto'g'ri yo'l**: `seen` ataylab qayta yozilgan. Refspec oldidagi `+` faqat shu bitta ref uchun majburlashni yoqadi ([29-bob](29-fetch-push-ichidan.md)):

```bash
$ git push origin next +seen
To ../server.git
 + 8d8cd9f...dc17ef9 seen -> seen (forced update)
```

Tester `fetch` qilganda farqni aniq ko'radi — `..` (oddiy oldinga siljish) va `...` bilan `+` (qayta yozish):

```bash
$ cd ../tester
$ git fetch
From .../31-gitgit/server
   6901e91..ae2a63a  next       -> origin/next
 + 8d8cd9f...dc17ef9 seen       -> origin/seen  (forced update)
```

Agar tester eski `origin/seen` ustiga o'z branch'ini qurgan bo'lsa, endi uning branch'ida serverda yo'q bo'lib ketgan beshta merge commit qolardi va har yangi `seen` bilan yana ajralardi. Qoidadagi "hech qachon ish qurmang" shuning uchun.

> **`git.git` amaliyotida** `seen` ommaviy serverda tez-tez majburan yangilanadi. Pro Git ("Large-Merging Workflows") buni shunday ifodalaydi: `master` deyarli doim oldinga yuradi, `next` vaqti-vaqti bilan, `seen` esa undan ham tez-tez qayta quriladi. Uni klon qilib sinab ko'rish mumkin, lekin topic'ingizni har doim `master` yoki `maint`dan oching. Maintainer nuqtai nazaridan bu jarayon — [34-bob](34-loyihani-yuritish.md).

### Qoida: merge upwards — tuzatishni eng eski branch'ga

Endi bitiruv (graduation). `ab/nol-xato` va `kl/yaxlitlash` `next`da sinovdan o'tdi, ular `maint`ga — keyingi 1.0.x relizga kirishi kerak. Ular `master`ga ham kerak. Qanday qilib?

"Pastga qarab bitirish"ni haqiqatan **pastga merge** qilib bo'lmaydi: `next`ni `master`ga merge qilsak, `next`dagi **hamma** beqaror narsa ham o'tib ketadi. Shuning uchun hujjatdagi qoida:

> **Tuzatishlaringizni har doim ularga muhtoj bo'lgan eng eski qo'llab-quvvatlanadigan branch'ga commit qiling. Keyin integratsiya branch'larini (vaqti-vaqti bilan) bir-biriga yuqoriga qarab merge qiling.**

```text
  Tuzatish eng pastga tushadi, keyin yuqoriga "ko'tariladi"

  seen    ▲  ... next'ni qayta qurganda
  next    ▲  git merge master
  master  ▲  git merge maint
  maint   ●  git merge ab/nol-xato   ← tuzatish shu yerdan kiradi
```

```bash
$ cd ../maintainer
$ git switch maint
Switched to branch 'maint'
$ git merge --no-ff --no-edit ab/nol-xato
Merge made by the 'ort' strategy.
...
$ git merge --no-ff --no-edit kl/yaxlitlash
Merge made by the 'ort' strategy.
...
$ git switch master
Switched to branch 'master'
$ git merge --no-ff --no-edit maint
Merge made by the 'ort' strategy.
 kalk.txt   | 1 +
 yaxlit.txt | 1 +
 2 files changed, 2 insertions(+)
 create mode 100644 yaxlit.txt
```

`cd/foiz` ham bitiradi — u `master`dan ochilgan, to'g'ridan-to'g'ri `master`ga:

```bash
$ git merge --no-ff --no-edit cd/foiz
Merge made by the 'ort' strategy.
 foiz.txt | 2 ++
 1 file changed, 2 insertions(+)
 create mode 100644 foiz.txt
$ git log --oneline --graph --decorate --first-parent master
* e2f5cc2 (HEAD -> master) Merge branch 'cd/foiz'
* 6698e36 Merge branch 'maint'
* 6901e91 (origin/master) 1.1 uchun reliz eslatmalari boshlandi
* 35cc492 (tag: v1.0, origin/maint) Ayirish amali
* 068220e Qo'shish amali
```

`--first-parent` faqat birinchi ota zanjiri bo'ylab yuradi — ya'ni `master`ning **o'z** tarixi: qaysi topic qachon kirdi. `--no-ff` merge'lar tufayli bu ko'rinish xuddi changelog kabi o'qiladi.

Endi qatlamlarni tekshiramiz. `git merge-base --is-ancestor A B` — A B'ning ajdodi bo'lsa 0 (muvaffaqiyat) kodi bilan chiqadi:

```bash
$ git log master..maint
$ git merge-base --is-ancestor maint master && echo "maint master ichida"
maint master ichida
$ git merge-base --is-ancestor master next || echo "master next ichida emas"
master next ichida emas
```

`master` `next`dan oldinga ketdi (yangi merge'lar). Yuqoriga merge — `master`ni `next`ga:

```bash
$ git switch next
Switched to branch 'next'
$ git merge --no-ff --no-edit master
Merge made by the 'ort' strategy.
$ git merge-base --is-ancestor master next && echo "master next ichida"
master next ichida
```

Qaysi topic qayerga yetib borganini `--merged`/`--no-merged` ko'rsatadi:

```bash
$ git switch master
Switched to branch 'master'
$ git branch --merged master
  ab/nol-xato
  cd/foiz
  kl/yaxlitlash
  maint
* master
$ git branch --no-merged master
  ef/daraja
  next
  seen
```

### Istisno: cherry-pick pastga

Hujjat aytadi: agar `maint`ga ham kerak bo'lgan tuzatishni xato bilan `master`ga qo'llaganingizni sezsangiz, uni `cherry-pick` bilan **pastga** ko'chirishingiz kerak. Bu ba'zan bo'ladi va tez-tez bo'lmasa, tashvishlanishga arzimaydi.

```bash
$ git switch master
Switched to branch 'master'
$ # ... xato bilan master'da: "Ayirishda manfiy natija xatosini tuzatish"
$ git log --oneline -1
9640597 Ayirishda manfiy natija xatosini tuzatish
$ git switch maint
Switched to branch 'maint'
$ git cherry-pick -x master
[maint e04b399] Ayirishda manfiy natija xatosini tuzatish
 Date: Wed Oct 7 10:35:00 2026 +0500
 1 file changed, 1 insertion(+)
$ git log -1 --format=%B
Ayirishda manfiy natija xatosini tuzatish

(cherry picked from commit 9640597b662b40cec412b7a409ee62386905c145)
```

`-x` xabar oxiriga asl commit hash'ini yozadi — keyinchalik "bu tuzatish qayerdan kelgan" degan savolga javob. (` Date:` qatori: `cherry-pick` va `revert` xulosasida Git muallif sanasini ham ko'rsatadi; cherry-pick'da muallif va uning sanasi asl commit'dan olinadi.) `cherry-pick` batafsil — [34-bob](34-loyihani-yuritish.md).

Cherry-pick **yangi** commit yaratadi (`e04b399` ≠ `9640597`), shuning uchun Git uchun ular boshqa-boshqa commit'lar:

```bash
$ git log --oneline master..maint
e04b399 Ayirishda manfiy natija xatosini tuzatish
```

`master` endi `maint`ni to'liq o'z ichiga olmaydi. Yechim — yana yuqoriga merge. Mazmun bir xil bo'lgani uchun merge hech qanday fayl o'zgartirmaydi, faqat ajdodlik munosabatini tiklaydi:

```bash
$ git switch master
Switched to branch 'master'
$ git merge --no-ff --no-edit maint
Merge made by the 'ort' strategy.
$ git log --oneline master..maint
$
```

### Topic'ni `next`dan chiqarib tashlash

Yana ikki topic `next`ga kirdi: `gh/kesh` va `ij/eksport`. Sinovda `gh/kesh` muammoli chiqdi. `next`ni qayta yozish o'rniga (u ommaviy va odamlar uni kuzatadi), uning merge commit'i **revert** qilinadi ([26-bob](26-murakkab-merge.md)):

```bash
$ git switch next
Switched to branch 'next'
$ git merge --no-ff --no-edit gh/kesh
...
$ git merge --no-ff --no-edit ij/eksport
...
$ git log --oneline -1 HEAD^
feef218 Merge branch 'gh/kesh' into next
$ git revert -m 1 --no-edit HEAD^
[next 1f92809] Revert "Merge branch 'gh/kesh' into next"
 Date: Wed Oct 7 10:34:00 2026 +0500
 1 file changed, 1 deletion(-)
 delete mode 100644 kesh.txt
$ git log --oneline -4 next
1f92809 Revert "Merge branch 'gh/kesh' into next"
9901243 Merge branch 'ij/eksport' into next
feef218 Merge branch 'gh/kesh' into next
f219aed CSV eksport
$ git branch --merged next
  ab/nol-xato
  cd/foiz
  gh/kesh
  ij/eksport
  kl/yaxlitlash
  maint
  master
* next
```

Diqqat: `gh/kesh` hali ham "`next`ga merge qilingan" deb ko'rinadi. Revert **mazmunni** qaytaradi, **tarixni** emas — uning commit'lari `next`ning ajdodlari bo'lib qoladi. Muallif topic'ni tuzatib qayta merge qilsa, Git eski commit'larni "allaqachon bor" deb hisoblaydi va revert qilingan o'zgarish qaytib kelmaydi. Hujjat buni shunday ifodalaydi: "topic `next`dan revert qilindi, lekin u bir paytlar merge qilinib, revert qilingani tarixda qoladi". Bu muammoning toza yechimi — pastda, relizdan keyin `next`ni qayta qurish.

### Reliz: `master`ni teglash va `maint`ni siljitish

Asosiy reliz `master`dan chiqariladi. Avval hujjatdagi retsept bo'yicha `master` `maint`ning **ustki to'plami** (superset) ekanini tekshiramiz — aks holda `maint`dagi ba'zi tuzatishlar relizga kirmay qoladi:

```bash
$ git log master..maint
$
```

Bo'sh — hammasi joyida (bo'sh bo'lmasa: `master`ga o'tib `maint`ni merge qilish kerak, yuqoridagi cherry-pick holatidagi kabi). Endi teg:

```bash
$ git tag -a -m 'Versiya 1.1' v1.1 master
```

Hujjatdagi retsept `git tag -s -m "Git X.Y.Z" vX.Y.Z master` — `-s` tegni GPG bilan **imzolaydi** ([12-bob](12-teglar-va-aliaslar.md)). Bu sinov muhitida kalit yo'q, shuning uchun `-a` (imzosiz annotated teg). Texnik xizmat relizi uchun ham shu qadamlar, faqat `master` o'rniga `maint` teglanadi.

Relizdan keyin `maint` bilan ish. Agar oldingi versiyaga (1.0.x) ham tuzatishlar chiqarishni davom ettirmoqchi bo'lsangiz, joriy `maint`ni eski versiya raqami bilan nusxalaysiz. Keyin `maint` yangi relizga fast-forward qilinadi:

```bash
$ git branch maint-1.0 maint
$ git switch maint
Switched to branch 'maint'
$ git merge --ff-only master
Updating e04b399..a097eeb
Fast-forward
 RelNotes.txt | 1 +
 foiz.txt     | 2 ++
 2 files changed, 3 insertions(+)
 create mode 100644 RelNotes.txt
 create mode 100644 foiz.txt
$ git log --oneline --decorate -1 maint
a097eeb (HEAD -> maint, tag: v1.1, master) Merge branch 'maint'
$ git log --oneline --decorate -1 maint-1.0
e04b399 (maint-1.0) Ayirishda manfiy natija xatosini tuzatish
```

Hujjat bo'yicha: agar `--ff-only` fast-forward emasligi sababli to'xtasa — demak `maint`dagi ba'zi tuzatishlar relizga kirmagan. Oldingi tekshiruv (`git log master..maint` bo'sh) bajarilgan bo'lsa, bu bo'lmaydi.

> Hujjatdagi nusxa nomi `maint-X.Y.(Z-1)` ko'rinishida (masalan `v1.1` dan keyin `maint-1.0`). Bu yerda soddalik uchun `maint-1.0`.

### Relizdan keyin `next` va `seen`ni qayta qurish

Relizdan keyin `next` **ixtiyoriy ravishda** `master` uchidan qayta qurilishi mumkin — `next`da "tirik qolgan" topic'lar bilan. Hozir `next`da `master`da yo'q nimalar bor?

```bash
$ git log --oneline master..next
1f92809 Revert "Merge branch 'gh/kesh' into next"
9901243 Merge branch 'ij/eksport' into next
feef218 Merge branch 'gh/kesh' into next
f219aed CSV eksport
bb91576 Natijalarni keshlash
da04f96 Merge branch 'master' into next
ae2a63a Merge branch 'kl/yaxlitlash' into next
5fa9b79 Merge branch 'cd/foiz' into next
b616db0 Merge branch 'ab/nol-xato' into next
```

Bitirgan topic'larning eski `next` merge'lari, `master`ni yuqoriga merge qilish, `gh/kesh` va uning revert'i... Tirik qolgan haqiqiy topic — faqat `ij/eksport`. Hujjatdagi retsept:

```bash
$ git switch -C next master
Switched to and reset branch 'next'
$ git merge --no-ff --no-edit ij/eksport
Merge made by the 'ort' strategy.
 eksport.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 eksport.txt
$ git switch -C seen next
Switched to and reset branch 'seen'
$ git merge --no-ff --no-edit ef/daraja
Merge made by the 'ort' strategy.
 daraja.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 daraja.txt
$ git log --oneline --graph --decorate master..seen
*   58b5f8e (HEAD -> seen) Merge branch 'ef/daraja' into seen
|\  
| * 2e8b607 (ef/daraja) Darajaga ko'tarish (tajriba)
* ceaabfa (next) Merge branch 'ij/eksport' into next
* f219aed (ij/eksport) CSV eksport
```

Foydasi: `next` tarixi toza bo'ladi. `gh/kesh` kabi avval umidli ko'ringan, keyin keraksiz yoki erta deb topilgan topic'larning "merge + revert" izi yo'qoladi va ularning yangi variantiga **toza imkoniyat** beriladi. Hujjat aytadi: reliz — buning uchun yaxshi nuqta. `gh/kesh` muallifi endi topic'ni tuzatib, `next`ga qaytadan merge qilsa, o'zgarish to'liq kiradi.

Shartlardan biri: `next`ni qayta qurganingizni **ommaga e'lon qilishingiz** kerak — uni kuzatayotganlar buni bilishi lozim. `seen` uchun e'lon shart emas — u baribir bir martalik.

Hammasini serverga yuboramiz. Ikki branch majburan, qolganlari oddiy:

```bash
$ git push origin maint-1.0 maint master +next +seen v1.1
To ../server.git
   35cc492..a097eeb  maint -> maint
   6901e91..a097eeb  master -> master
 + ae2a63a...ceaabfa next -> next (forced update)
 + dc17ef9...58b5f8e seen -> seen (forced update)
 * [new branch]      maint-1.0 -> maint-1.0
 * [new tag]         v1.1 -> v1.1
$ cd ../tester
$ git fetch
From .../31-gitgit/server
   6901e91..a097eeb  master     -> origin/master
   35cc492..a097eeb  maint      -> origin/maint
 * [new branch]      maint-1.0  -> origin/maint-1.0
 + ae2a63a...ceaabfa next       -> origin/next  (forced update)
 + dc17ef9...58b5f8e seen       -> origin/seen  (forced update)
 * [new tag]         v1.1       -> v1.1
$ git log --oneline origin/master..origin/next
ceaabfa Merge branch 'ij/eksport' into next
f219aed CSV eksport
```

Tester uchun `master`, `maint` — oddiy oldinga siljish; `next` va `seen` — `(forced update)`. Bitirgan topic'lar endi o'chiriladi:

```bash
$ cd ../maintainer
$ git branch --merged master
  ab/nol-xato
  cd/foiz
  kl/yaxlitlash
  maint
  maint-1.0
  master
$ git branch -d ab/nol-xato cd/foiz kl/yaxlitlash
Deleted branch ab/nol-xato (was de758ca).
Deleted branch cd/foiz (was 17c67ba).
Deleted branch kl/yaxlitlash (was f6949ed).
$ git branch --no-merged master
  ef/daraja
  gh/kesh
  ij/eksport
  next
* seen
```

Hammasi bitta rasmda:

```text
  Bir topic'ning hayoti git.git tizimida

  ab/nol-xato  (maint'dan ochilgan)
     │
     ├──▶ seen     1) boshqa topic'lar bilan o'zaro ta'sirni sinash (bir martalik)
     ├──▶ next     2) barqarorlik sinovi
     └──▶ maint    3) bitirish: keyingi 1.0.x relizga
            │
            └──▶ master    4) merge upwards: git merge maint
                   │
                   └──▶ next   5) merge upwards: git merge master

  Relizdan keyin: v1.1 teg, maint → --ff-only master, next va seen master'dan qayta quriladi
```

## Kod: qoida — pastga faqat aniq sabab bilan merge qiling

Topic ustida ishlayotganingizda `master`dagi yangi narsalarni olish uchun `git merge master` qilish mumkin. Hujjat ruxsat beradi: agar topic'ingizni davom ettirish uchun `other` branch'idagi yangi xususiyatlar **kerak** bo'lsa — `other`ni topic'ga merge qiling. Lekin shu zahoti ogohlantiradi:

> **Aniq sababsiz pastga merge qilmang: yuqoridagi API o'zgarishi branch'ingizga ta'sir qiladi; branch'ingiz endi yuqoriga toza merge bo'lmaydi; va hokazo.**

"Odat bo'yicha" (muntazam, real sababsiz) integratsiya branch'ini topic'larga merge qilish yoqtirilmaydi. Sabablar:

- merge qilingan topic birdan bitta (yaxshi ajratilgan) o'zgarishdan ko'p narsani o'z ichiga oladi;
- ko'plab kichik merge'lar tarixni chalkashtiradi;
- keyinchalik faylning tarixini o'rgangan odam har bir shunday merge topic'ga ta'sir qilganmi-yo'qmi, aniqlashi kerak bo'ladi;
- yuqoridagi narsa tasodifan "barqarorroq" branch'ga merge bo'lib ketishi mumkin.

Masalan `ef/daraja` `master`dan ochilgan. Agar unga `next`ni merge qilsangiz, endi `ef/daraja`ni `master`ga bitirganda `next`dagi hamma narsa ham `master`ga o'tadi — butun tizim buziladi.

Hujjat qoidasidan bitta muhim istisno bor (keyingi bobdagi taqsimlangan ish bilan bog'liq): maintainer quyidan kelgan o'zgarishni merge qilishda konflikt olsa, u quyi tomondan (hissa qo'shuvchidan) yuqorini o'ziga merge qilib, konfliktni o'zi hal qilishni so'rashi mumkin — ehtimol u qanday hal qilishni yaxshiroq biladi. Bu quyi tomon yuqoridan merge qilishi **kerak** bo'lgan kam holatlardan biri.

## Muhandislik nuqtai nazari: nega integratsiya branch'iga to'g'ridan-to'g'ri commit qilinmaydi

`gitworkflows` sanaydi: hamma narsani integratsiya branch'iga to'g'ridan-to'g'ri commit qilish ko'p muammo keltiradi.

- **Yomon commit'larni olib tashlab bo'lmaydi** — ularni birma-bir revert qilish kerak. Bu chalkash tarix va qo'shimcha xato imkoniyati beradi: bir guruh o'zgarishning bir qismini revert qilishni unutish oson.
- **Parallel ish aralashadi** — ikki vazifaning commit'lari bir-biriga kirishib ketadi.

Topic branch'lar ikkalasini hal qiladi: yomon mavzu butunligicha bitta merge'ni qaytarish bilan yoki umuman merge qilmaslik bilan chiqariladi; mavzular bir-biridan ajralgan.

Yana bir bog'liq qoida (hujjatning "SEPARATE CHANGES" bo'limi): o'zgarishlarni kichik mantiqiy qadamlarga bo'lib, har birini commit qiling — har biri izchil, keyingi commit'larsiz ham ishlaydigan va testlardan o'tadigan bo'lsin. Bir nechta commit'ni birlashtirish bitta katta commit'ni bo'lishdan doim osonroq. Bu review'ni yengillashtiradi va `git blame`, `git bisect` bilan tarixni tahlil qilishni foydali qiladi ([10-bob](10-yaxshi-commit.md), [41-bob](41-blame-va-bisect.md)). Publish qilishdan oldin `git rebase --interactive` bilan commit'larni tahrirlash mumkin ([25-bob](25-tarixni-qayta-yozish.md)).

## Muhandislik nuqtai nazari: qaysi sxemani tanlash

`git.git` tizimi — eng to'liq variant. Hujjat o'zi aytadi: kichik loyihada to'liq workflow kamdan-kam kerak. Amaliy tanlov:

| Vaziyat | Minimal sxema | Nimani `git.git`dan olish |
| --- | --- | --- |
| Bitta dasturchi, kichik loyiha | `main` + topic branch'lar | Topic'lar, `--no-ff`, `--merged` bilan tozalash |
| Jamoa, doimiy deploy | `main` + qisqa topic'lar + PR ([35-bob](35-github-fork-va-pr.md)) | "Eng eski branch'dan oching", pastga merge qilmaslik |
| Rejali relizlar, sinov bosqichi | `main` + `develop` (yoki `next`) | Graduation, `log main..develop` |
| Eski versiyalar qo'llab-quvvatlanadi | `main` + `maint` (yoki `release/1.x`) | Merge upwards, `log master..maint` tekshiruvi, `maint-X.Y` nusxasi |
| Ko'p topic, integratsiya xavfi yuqori | + bir martalik `seen` | Qayta qurish, `+seen` push, "ustiga qurmang" e'loni |

> Pro Git batafsilroq taqqoslash uchun Martin Fowler'ning "Patterns for Managing Source Code Branches" maqolasini tavsiya qiladi (martinfowler.com/articles/branching-patterns.html) — bu Git hujjati emas, tashqi manba.

Har qanday sxemada asosiy savol bitta: **o'zgarish qaysi yo'nalishda oqadi?** `git.git` javobi — topic'lar yuqoriga merge qilinadi, integratsiya branch'lari faqat **yuqoriga** (barqarordan beqarorga) bir-biriga merge qilinadi, pastga — faqat cherry-pick bilan, kamdan-kam.

## Muhandislik nuqtai nazari: ichkarida nima bo'ladi

Bu bobdagi hamma narsa oddiy ref amallari:

| Amal | Ichkarida |
| --- | --- |
| Topic ochish | `refs/heads/ab/nol-xato` fayli yaratiladi (`/` — papka: `refs/heads/ab/`) |
| `switch -C seen next` | `refs/heads/seen` ichiga `next` hash'i yoziladi, eski qiymat faqat reflog'da qoladi |
| Graduation (`merge --no-ff`) | Yangi merge commit, integratsiya branch'i unga siljiydi; topic ref'i o'zgarmaydi |
| `+seen` push | Serverdagi `refs/heads/seen` fast-forward bo'lmasa ham qayta yoziladi |
| `branch maint-1.0 maint` | Bir xil hash'li ikkinchi ref fayl |
| Topic'ni o'chirish | Ref fayli o'chadi, commit'lar integratsiya branch'i orqali yetib boriladigan bo'lib qoladi |

Shuning uchun integratsiya branch'ining "sog'lig'i"ni ham oddiy revision ifodalari bilan tekshirasiz: `git log A..B` (B'da bor, A'da yo'q), `git merge-base --is-ancestor A B`, `git branch --merged/--no-merged/--contains`.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Hamma ishni to'g'ridan-to'g'ri `main`da qilish | Yomon commit'ni olib tashlab bo'lmaydi, parallel ishlar aralashadi | Har vazifa uchun topic branch |
| Xato tuzatishni `master`dan ochib, `maint`ga merge qilish | `master`dagi relizga tayyor bo'lmagan narsalar `maint`ga o'tadi | Tuzatishni `maint`dan oching; xato qilinsa `rebase --onto maint master <topic>` (merge qilinmaguncha) |
| `next`ni `master`ga merge qilib "graduation" qilish | `next`dagi hamma beqaror topic `master`ga o'tadi | Har topic'ni alohida `master`ga merge qiling |
| `seen` (yoki boshqa bir martalik branch) ustiga ish qurish | Har qayta qurishda tarixingiz ajraladi, o'chgan merge'lar sizda qoladi | Topic'ni `master`/`maint`dan oching |
| Qayta qurilgan branch push'i rad etilganda `git pull` | Eski va yangi integratsiya aralashadi | Ataylab qayta yozilgan bo'lsa — `+branch` yoki `--force-with-lease` |
| Topic'ga "odat bo'yicha" `master`ni merge qilish | Topic ko'p mavzuli bo'ladi, tarix chalkashadi | Faqat aniq sabab bilan (API o'zgardi, toza merge bo'lmay qoldi) |
| Boshqa joyga merge qilingan topic'ni rebase qilish | Ikki nusxadagi commit'lar, takroriy konfliktlar | Rebase faqat hech qayerga qo'shilmagan topic uchun |
| Revert qilingan topic'ni tuzatib qayta merge qilish va o'zgarish kutish | Eski commit'lar allaqachon ajdod — o'zgarish qaytmaydi | Revert'ni revert qiling ([26-bob](26-murakkab-merge.md)) yoki relizdan keyin `next`ni qayta quring |
| Relizdan oldin `git log master..maint` ni tekshirmaslik | `maint`dagi tuzatishlar relizga kirmay qoladi | Bo'sh bo'lmasa — `master`ga `maint`ni merge qiling |
| `next`ni qayta qurib, e'lon qilmaslik | Uni kuzatayotganlar kutilmagan `forced update` oladi | Qayta qurishni ommaga e'lon qiling |

## Amaliyot

1. Pro Git misolini takrorlang: `main`, `iss91`, `iss91v2` (`iss91` ichidan), `dumbidea`. `iss91`ni `-D` bilan o'chiring, qolgan ikkitasini merge qiling. `git reflog` dan o'chgan commit hash'ini toping va `git branch iss91 <hash>` bilan tiklang.
2. `main` + `develop` sxemasini yarating. Ikki topic'ni `develop`ga `--no-ff` bilan qo'shing, `git log --oneline main..develop` bilan relizga nima kutayotganini ko'ring, keyin `main`ni `--ff-only` bilan siljiting. `develop`ga to'g'ridan-to'g'ri commit qilib, `--ff-only` qachon rad etishini tekshiring.
3. Bare server va ikki klon bilan `maint`, `master`, `next`, `seen` tizimini quring. `maint`dan bitta tuzatish, `master`dan ikki xususiyat oching. Tuzatishni avval `next`ga, keyin `maint`ga merge qiling va yuqoriga merge zanjirini (`maint` → `master` → `next`) bajaring. Har qadamdan keyin `git merge-base --is-ancestor` bilan qatlamlarni tekshiring.
4. Xato bilan `master`dan ochilgan tuzatish branch'ini yarating, `git log maint..<topic>` da ortiqcha commit'larni ko'ring va `rebase --onto` bilan ko'chiring.
5. `seen`ni ikki marta qayta quring va serverga push qiling. Ikkinchi klonda eski `origin/seen` ustiga branch ochib, keyingi `fetch`dan so'ng `git log origin/seen..<branch>` nima ko'rsatishini kuzating — nega "ustiga qurmang" qoidasi bor?
6. `master`ga tuzatish commit qilib, `cherry-pick -x` bilan `maint`ga ko'chiring. `git log master..maint` nima deydi va nega? Uni yuqoriga merge bilan tuzating.
7. `next`ga topic merge qiling, keyin `revert -m 1` bilan qaytaring. Topic'ga yangi commit qo'shib qayta merge qiling va asl o'zgarish qaytmaganini ko'ring. So'ng `switch -C next master` bilan `next`ni qayta qurib, topic'ni qaytadan merge qiling — farqni tushuntiring.
8. (Qiyinroq) To'liq reliz siklini bajaring: `git log master..maint` tekshiruvi, `v1.1` annotated teg, `maint-1.0` nusxasi, `maint`ni `--ff-only` bilan siljitish, `next`/`seen`ni qayta qurish va bitta `push` bilan (`+next +seen`) yuborish. Tester klonida `fetch` chiqishidagi `..` va `...` belgilarini izohlang. Keyin `maint-1.0`ga tuzatish qilib, uni `maint-1.0` → `maint` → `master` → `next` zanjiri bo'ylab yuqoriga merge qiling.

## Rasmiy hujjat

- Pro Git — Branching Workflows: <https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows>
- `gitworkflows` — An overview of recommended workflows with Git: <https://git-scm.com/docs/gitworkflows>
- `git merge` (`--no-ff`, `--ff-only`): <https://git-scm.com/docs/git-merge>
- `git branch` (`--merged`, `--no-merged`, `-D`): <https://git-scm.com/docs/git-branch>
- `git switch` (`-C`): <https://git-scm.com/docs/git-switch>
- `git rebase` (`--onto`, "Recovering from upstream rebase"): <https://git-scm.com/docs/git-rebase>
- `git cherry-pick` (`-x`): <https://git-scm.com/docs/git-cherry-pick>
- `git revert` (`-m`): <https://git-scm.com/docs/git-revert>
- `git merge-base` (`--is-ancestor`): <https://git-scm.com/docs/git-merge-base>
- `git tag`: <https://git-scm.com/docs/git-tag>
