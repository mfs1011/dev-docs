# 29 — `fetch` va `push` ichidan

[← Oldingi: Remote branch'lar va kuzatish](28-remote-branchlar.md) · [Mundarija](README.md) · [Keyingi: SSH kalit va credential'lar →](30-ssh-va-credential.md)

## Tushuncha

[27-bobda](27-remote.md) `fetch` va `push` ni foydalanuvchi ko'zi bilan ko'rdik: biri olib keladi, biri yuboradi. Bu bobda ikki savolga ichkaridan javob beramiz:

1. **Qaysi ref qaysi ref'ga yoziladi?** Bunga **refspec** javob beradi.
2. **Ikki repo o'zaro qanday gaplashadi?** Bunga **uzatish protokoli** (transfer protocol) javob beradi.

**Refspec** — "u tomondagi qaysi ref'lar bu tomondagi qaysi ref'larga yozilsin" degan qoida. Pochta bo'limidagi taqsimlash jadvaliga o'xshaydi: "Toshkentdan kelgan hamma xat — 3-javonga, Samarqanddan kelgan — 5-javonga". Ref nima ekanini [17-bobda](17-reflar-va-head.md) ko'rgan edik — `refs/heads/main` kabi, ichida hash turgan nom. Refspec shunday nomlarni bir-biriga bog'laydi.

`git remote add` yozgan qatorni eslang:

```ini
[remote "origin"]
	url = ../server.git
	fetch = +refs/heads/*:refs/remotes/origin/*
```

Bu qatorning tuzilishi (rasmiy `git fetch` hujjati va Pro Git bo'yicha):

```text
  +   refs/heads/*   :   refs/remotes/origin/*
  │   └── <src> ──┘      └──────── <dst> ─────┘
  │   u tomonda           bu tomonda
  └── fast-forward bo'lmasa ham yangilansin
```

- `<src>` — **manba** ref (`fetch` da — remote'dagi, `push` da — sizdagi);
- `<dst>` — **maqsad** ref (`fetch` da — sizdagi, `push` da — remote'dagi);
- `*` — "istalgan nom": `refs/heads/main` → `refs/remotes/origin/main`, `refs/heads/qa/kirish` → `refs/remotes/origin/qa/kirish`;
- `+` — **majburlash**: yangilanish fast-forward bo'lmasa ham qabul qilinsin.

**Uzatish protokoli** — ikki Git jarayoni o'rtasidagi "suhbat" tartibi. Siz `git fetch` desangiz, sizning kompyuteringizda `fetch-pack`, serverda esa `upload-pack` jarayoni ishga tushadi; `git push` da — `send-pack` va `receive-pack`. Ular avval ref'lar ro'yxatini almashadi, keyin "menda nima bor, senga nima kerak" deb kelishadi va faqat yetishmagan obyektlarni bitta **packfile** ([18-bob](18-packfile-va-gc.md)) ichida yuboradi.

Git to'rt xil transportni biladi — lokal, HTTP(S), SSH va Git protokoli. Ularning farqi bobning oxirida.

## Nega shunday: nega `fetch` refspec'i `+` bilan, `push` esa `+` siz

Standart `fetch` refspec'i `+` bilan boshlanadi, `push` esa oddiy holatda fast-forward talab qiladi. Bu nomutanosiblik ataylab.

**`refs/remotes/origin/*` — sizning ishingiz emas, kuzatuv.** Remote-tracking branch "server'dagi branch oxirgi marta qayerda edi" degan eslatma ([28-bob](28-remote-branchlar.md)). Kimdir serverda tarixni qayta yozsa (`push --force`), sizning eslatmangiz ham shunga ergashishi kerak — aks holda u yolg'on gapiradi. Sizning commit'laringiz `refs/heads/*` da, ularga `fetch` tegmaydi. Shuning uchun `+` xavfsiz.

**Server'dagi `refs/heads/*` — hammaning ishi.** Push'da branch faqat oldinga surilsa (fast-forward), hech kimning commit'i yo'qolmaydi. Majburiy push esa boshqaning ishini tarixdan chiqarib yuborishi mumkin. Shuning uchun majburlash har safar ongli qaror bo'lishi kerak — va uning xavfsizroq shakllari bor: `--force-with-lease` va `--force-if-includes`. Ularni bobning o'rtasida ikki dasturchi misolida sinaymiz.

**Nega protokol "aqlli"?** Pro Git ikki rejimni ajratadi: "soqov" (*dumb*) protokol — serverda Git kodi yo'q, mijoz oddiy fayllarni birma-bir so'raydi; "aqlli" (*smart*) protokol — server tomonda Git jarayoni ishlaydi, u mijozda nima borligini hisoblab, aynan kerakli obyektlardan maxsus packfile yasaydi. Aqlli protokol tezroq va yozishni (push) ham qo'llab-quvvatlaydi. Bugun deyarli hamma joyda aynan u ishlatiladi.

## Kod: tajriba maydoni

[27-bob](27-remote.md)dagidek: bitta bare server va ikki dasturchi.

```text
29-fetch-push/
├── server.git/   ← bare "server"
├── ali/          ← Ali (git init + remote add)
└── vali/         ← Vali (git clone)
```

```bash
$ git init -q --bare server.git
$ git init -q -b main ali && cd ali
$ echo "# Kutubxona" > README.md && git add README.md
$ git commit -m "Boshlang'ich commit"
[main (root-commit) 3c8955c] Boshlang'ich commit
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
$ git remote add origin ../server.git
$ git push origin main
To ../server.git
 * [new branch]      main -> main
```

Vali klon qiladi, bitta commit qo'shadi va bir nechta branch ochib, hammasini bitta buyruqda yuboradi. `git push` ga bir nechta refspec berish mumkin — bu yerda har biri qisqa shaklda (`qa/kirish` = `refs/heads/qa/kirish:refs/heads/qa/kirish`):

```bash
$ git clone server.git vali && cd vali
$ echo "Kitoblar ro'yxati" > kitoblar.txt && git add kitoblar.txt
$ git commit -q -m "Kitoblar ro'yxatini qo'shish"
$ git branch qa/kirish; git branch qa/qidiruv; git branch qa-tezkor
$ git branch dev-tajriba; git branch mavzu
$ git push origin main qa/kirish qa/qidiruv qa-tezkor dev-tajriba mavzu
To /tmp/misol/29-fetch-push/server.git
   3c8955c..5d32771  main -> main
 * [new branch]      qa/kirish -> qa/kirish
 * [new branch]      qa/qidiruv -> qa/qidiruv
 * [new branch]      qa-tezkor -> qa-tezkor
 * [new branch]      dev-tajriba -> dev-tajriba
 * [new branch]      mavzu -> mavzu
$ git remote set-url origin ../server.git
```

(`clone` URL'ni absolyut yo'l qilib saqlaydi — chiqish qisqa bo'lishi uchun keyin nisbiy yo'lga almashtirdik, [27-bob](27-remote.md).)

## Kod: `fetch` refspec'lari

### Bir martalik refspec

Buyruq qatorida refspec bersangiz, u faqat shu safar ishlaydi. Pro Git misoli — server'dagi `main` ni sizda boshqa nom bilan saqlash:

```bash
$ git fetch origin main:refs/remotes/origin/mymain
From ../server
 * [new branch]      main       -> origin/mymain
   3c8955c..5d32771  main       -> origin/main
$ git branch -r
  origin/main
  origin/mymain
```

Ikkinchi qatorga e'tibor bering — biz so'ramagan `origin/main` ham yangilandi. Bu Pro Git'da yozilmagan, lekin `git fetch` hujjatining "CONFIGURED REMOTE-TRACKING BRANCHES" bo'limida tushuntirilgan: buyruq qatorida refspec berilganda **nimani olish** buyruq qatoridan aniqlanadi, lekin `remote.origin.fetch` qiymatlari **xarita** sifatida ishlatiladi — "`main` olib kelindimi? Konfiguratsiyaga ko'ra u `origin/main` ga yozilishi kerak". Bu xaritani `--refmap=<refspec>` bilan almashtirish, `--refmap=''` bilan esa butunlay o'chirish mumkin.

Uchala yozuv bir xil ref'ni bildiradi, chunki Git qisqa nomni `refs/remotes/origin/mymain` gacha kengaytiradi ([17-bobdagi](17-reflar-va-head.md) yechish qoidasi):

```bash
$ git log --oneline origin/mymain -1
5d32771 Kitoblar ro'yxatini qo'shish
$ git log --oneline remotes/origin/mymain -1
5d32771 Kitoblar ro'yxatini qo'shish
$ git log --oneline refs/remotes/origin/mymain -1
5d32771 Kitoblar ro'yxatini qo'shish
```

### `<dst>` siz: faqat `FETCH_HEAD`

`git fetch origin mavzu` — bu `mavzu:` ning qisqa shakli, ya'ni "olib kel, lekin buyruq qatorida qayerga yozishni aytmayman". Olingan narsa doim `FETCH_HEAD` ga yoziladi, qo'shimcha ravishda konfiguratsiyadagi xarita mos kelsa — remote-tracking branch'ga ham.

### `+` siz refspec rad etiladi

Endi Vali o'z commit'ini `--amend` bilan o'zgartiradi va majburlab yuboradi. Avval oddiy push — rad etiladi, keyin refspec oldiga `+` qo'yib:

```bash
$ git commit -q -a --amend -m "Kitoblar ro'yxatini qo'shish"
$ git log --oneline -1
2f0abc5 Kitoblar ro'yxatini qo'shish
$ git push origin main
To ../server.git
 ! [rejected]        main -> main (non-fast-forward)
error: failed to push some refs to '../server.git'
...
$ git push origin +main
To ../server.git
 + 5d32771...2f0abc5 main -> main (forced update)
```

`+main` — `--force` ning faqat bitta ref uchun shakli. Xulosa qatorida ikki nuqta emas, **uch nuqta** (`5d32771...2f0abc5`): majburiy yangilanishda ikki commit bir-birining ajdodi emas, ular orasidagi farqni `git log 5d32771...2f0abc5` ([19-bob](19-revision-tanlash.md)) ko'rsatadi.

Server'dagi `main` "orqaga" qaytdi. Ali Pro Git'dagi misolni takrorlaydi — ikki refspec, biri `+` siz:

```bash
$ git fetch origin main:refs/remotes/origin/mymain mavzu:refs/remotes/origin/mavzu
From ../server
 ! [rejected] main       -> origin/mymain  (non-fast-forward)
 * [new branch] mavzu      -> origin/mavzu
 + 5d32771...2f0abc5 main       -> origin/main  (forced update)
$ echo "exit=$?"
exit=1
```

Bitta chiqishda uch xil natija:

- `origin/mymain` — refspec'da `+` yo'q, yangilanish fast-forward emas → **rad etildi**;
- `origin/mavzu` — yangi ref, yaratish doim ruxsat → **yaratildi**;
- `origin/main` — konfiguratsiyadagi xarita (`+refs/heads/*:...`) orqali yozildi, unda `+` bor → **majburan yangilandi**.

`+` qo'shsak:

```bash
$ git fetch origin +main:refs/remotes/origin/mymain
From ../server
 + 5d32771...2f0abc5 main       -> origin/mymain  (forced update)
```

Rasmiy hujjat maslahati: agar biror branch serverda muntazam qayta yozilishini (rebase qilinishini) bilsangiz, uning refspec'ida `+` bo'lishi kerak. Git buni o'zi aniqlay olmaydi — bu siz bilishingiz kerak bo'lgan kelishuv.

### Konfiguratsiyadagi refspec'lar

Har `git fetch` da hamma branch'larni emas, faqat keraklilarini olmoqchimisiz? `remote.origin.fetch` ni o'zgartiring. Bir nechta `fetch =` qatori bo'lishi mumkin:

```bash
$ git config --replace-all remote.origin.fetch '+refs/heads/main:refs/remotes/origin/main'
$ git config --add remote.origin.fetch '+refs/heads/qa/*:refs/remotes/origin/qa/*'
$ sed -n '/remote/,$p' .git/config
[remote "origin"]
	url = ../server.git
	fetch = +refs/heads/main:refs/remotes/origin/main
	fetch = +refs/heads/qa/*:refs/remotes/origin/qa/*
$ git fetch origin
From ../server
 * [new branch]      qa/kirish  -> origin/qa/kirish
 * [new branch]      qa/qidiruv -> origin/qa/qidiruv
```

Pro Git buni jamoa ish oqimiga bog'laydi: QA jamoasi o'z branch'larini `qa/` nomlar maydoniga (papkasiga) yuboradi, siz esa faqat `main` va `qa/*` ni kuzatasiz. `qa-tezkor`, `dev-tajriba` olinmadi.

Git 2.6 dan beri `*` nomning bir qismida ham bo'lishi mumkin (*partial glob*):

```bash
$ git config --add remote.origin.fetch '+refs/heads/qa*:refs/remotes/origin/qa*'
$ git fetch origin
From ../server
 * [new branch]      qa-tezkor  -> origin/qa-tezkor
```

Qoida (`git fetch` hujjati): naqshli refspec'da `<src>` da ham, `<dst>` da ham **aynan bitta** `*` bo'lishi shart.

### Inkor refspec: `^`

Pro Git'da yo'q, lekin v2.56 hujjatida bor (Git 2.29 dan beri): `^` bilan boshlangan refspec — **istisno**. Ref kamida bitta oddiy refspec'ga mos kelsa va hech bir inkor refspec'ga mos kelmasa, olinadi. Inkor refspec'da faqat `<src>` bo'ladi, `<dst>` yo'q.

```bash
$ git config --replace-all remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'
$ git config --add remote.origin.fetch '^refs/heads/dev-*'
$ git config --get-all remote.origin.fetch
+refs/heads/*:refs/remotes/origin/*
^refs/heads/dev-*
$ git fetch origin
From ../server
 * [new branch]      mavzu      -> origin/mavzu
$ git branch -r
  origin/HEAD -> origin/main
  origin/main
  origin/mavzu
  origin/qa-tezkor
  origin/qa/kirish
  origin/qa/qidiruv
```

"Hammasini ol, lekin har kimning `dev-*` tajriba branch'larini emas" — ko'p dasturchili repo'da foydali.

### O'chirilgan branch'lar: `--prune`

Vali serverdan `qa-tezkor` ni o'chirdi. Ali'da `origin/qa-tezkor` o'z-o'zidan yo'qolmaydi — `fetch` standart holatda faqat qo'shadi va yangilaydi. `--prune` refspec'ning o'ng tomoniga mos, lekin serverda endi yo'q ref'larni o'chiradi:

```bash
$ git fetch --prune origin
From ../server
 - [deleted]         (none)     -> origin/qa-tezkor
```

Doim shunday bo'lishi uchun — `fetch.prune=true` (yoki bitta remote uchun `remote.<nom>.prune`). Tafsilotlar [28-bobda](28-remote-branchlar.md).

### Teglar: Git 2.20 dan keyingi qoida

`pull-fetch-param` hujjati muhim tarixiy o'zgarishni qayd etadi: Git 2.20 gacha `fetch` mavjud tegni `+` siz ham yangilardi, 2.20 dan beri esa xuddi `push` dagi kabi rad etadi. Vali serverdagi `v1.0` tegini majburlab boshqa commit'ga ko'chirdi; Ali'da:

```bash
$ git fetch origin
$ echo "exit=$?"
exit=0
$ git fetch --tags origin
From ../server
 ! [rejected] v1.0       -> v1.0  (would clobber existing tag)
$ echo "exit=$?"
exit=1
```

Oddiy `fetch` jim qoldi: u teglarni avtomatik "ergashtiradi" (olinayotgan commit'larga ishora qiluvchi **yangi** teglarni oladi), lekin mavjud tegni almashtirmaydi. `--tags` esa `refs/tags/*:refs/tags/*` refspec'ini qo'shadi — unda `+` yo'q, shuning uchun rad. Teg ko'chirilishi — jiddiy hodisa ([12-bob](12-teglar-va-aliaslar.md)); uni qabul qilish uchun ongli ravishda `git fetch --tags --force` yoki `+refs/tags/v1.0:refs/tags/v1.0` kerak.

Yana bir istisno (hujjatdan): `refs/heads/*` va `refs/tags/*` dan **tashqaridagi** ref'larni `fetch` `+` siz ham har qanday yangilaydi; `push` dan farqli ravishda bu qoidalarni o'zgartiruvchi sozlama yoki `pre-fetch` hook yo'q.

## Kod: `push` refspec'lari

`git push` refspec'i — `[+]<src>[:<dst>]`. `fetch` dan farqi: `<src>` faqat ref emas, **istalgan revision** bo'lishi mumkin (`HEAD~2`, hash, [19-bob](19-revision-tanlash.md)); `<dst>` esa doim ref nomi.

### Boshqa nom bilan yuborish

Pro Git'dagi QA misoli — lokal `main` ni server'dagi `qa/main` ga:

```bash
$ git push origin main:refs/heads/qa/main
To ../server.git
 * [new branch]      main -> qa/main
```

Qisqa yozuv `HEAD:sinov` ham ishlaydi — `HEAD` `refs/heads/main` ga yechiladi, shuning uchun Git `<dst>` oldiga ham `refs/heads/` qo'shadi:

```bash
$ git push origin HEAD:sinov
To ../server.git
 * [new branch]      HEAD -> sinov
```

`<src>` hash bo'lsa, Git `<dst>` ning turini taxmin qila olmaydi:

```bash
$ git push origin 3c8955c:eski2
error: The destination you provided is not a full refname (i.e.,
starting with "refs/"). We tried to guess what you meant by:

- Looking for a ref that matches 'eski2' on the remote side.
- Checking if the <src> being pushed ('3c8955c')
  is a ref in "refs/{heads,tags}/". If so we add a corresponding
  refs/{heads,tags}/ prefix on the remote side.

Neither worked, so we gave up. You must fully qualify the ref.
hint: The <src> part of the refspec is a commit object.
hint: Did you mean to create a new branch by pushing to
hint: '3c8955c:refs/heads/eski2'?
error: failed to push some refs to '../server.git'
$ git push origin 3c8955c:refs/heads/eski
To ../server.git
 * [new branch]      3c8955c -> eski
```

Xato matni aynan hujjatdagi kengaytirish qoidalarini sanab beradi. To'liq qoidalar (`git push` hujjati, `<refspec>` bo'limi):

| Yozuv | Ma'nosi |
| --- | --- |
| `main` | `main:refs/heads/main` (agar `remote.<nom>.push` boshqacha demasa) |
| `main:boshqa` | `<src>` branch bo'lgani uchun → `main:refs/heads/boshqa` |
| `HEAD:v1.0` | Remote'da `v1.0` teg bo'lsa → `HEAD:refs/tags/v1.0` |
| `+main` | Faqat shu ref uchun `--force` |
| `:dev` | `<src>` bo'sh → remote'dagi `dev` ni **o'chirish** |
| `:` | "Mos" branch'lar: sizda ham, remote'da ham bor bo'lgan har bir branch |
| `refs/heads/*:refs/heads/*` | Hamma branch'lar |
| `^refs/heads/dev-*` | Inkor: `dev-*` bundan mustasno |
| `tag v1.0` | `refs/tags/v1.0:refs/tags/v1.0` (ikki alohida argument) |

### O'chirish

Refspec `<src>:<dst>` bo'lgani uchun `<src>` ni bo'sh qoldirish "maqsadni hech narsaga teng qil" degani. Pro Git eski va yangi (Git 1.7.0 dan) yozuvni beradi:

```bash
$ git push origin :sinov
To ../server.git
 - [deleted]         sinov
$ git push origin --delete mavzu
To ../server.git
 - [deleted]         mavzu
```

### Doimiy push qoidasi: `remote.<nom>.push`

QA jamoasi har `git push origin` da `main` ni `qa/main` ga yubormoqchi bo'lsa:

```bash
$ git config remote.origin.push 'refs/heads/main:refs/heads/qa/main'
$ git commit -q -am "README yangilandi"
$ git push origin
To ../server.git
   2f0abc5..a5d896f  main -> qa/main
```

Hujjatdagi tartib: push qilinadigan ref'lar (1) buyruq qatoridagi refspec yoki `--all`/`--mirror`/`--tags` dan, (2) bo'lmasa `remote.<nom>.push` dan, (3) u ham bo'lmasa `push.default` dan (standart `simple` — joriy branch'ni bir xil nomli upstream'ga, [28-bob](28-remote-branchlar.md)) aniqlanadi.

Pro Git ogohlantiradi: refspec bilan **bir repo'dan olib, boshqasiga yozib** bo'lmaydi. Buning uchun ikki alohida remote kerak ([27-bob](27-remote.md)).

### Teg yuborish

```bash
$ git tag -a v1.0 -m "Birinchi reliz" HEAD~1
$ git push origin tag v1.0
To ../server.git
 * [new tag]         v1.0 -> v1.0
```

Mavjud tegni qayta yuborish — push qoidalariga ko'ra **har doim** rad etiladi (`already exists`), faqat `--force` bilan o'tadi.

### Bir nechta ref: `--atomic`

Bitta push'da bir nechta ref bo'lsa, odatda har biri alohida hal qilinadi — biri o'tib, biri rad etilishi mumkin:

```bash
$ git push origin main:refs/heads/yangi 3c8955c:refs/heads/qa/main
To ../server.git
 * [new branch]      main -> yangi
 ! [rejected]        3c8955c -> qa/main (non-fast-forward)
error: failed to push some refs to '../server.git'
...
```

`--atomic` bilan server tomonda tranzaksiya ishlatiladi — "hammasi yoki hech biri" (oldinroq, `yangi` hali yo'q payt):

```bash
$ git push --atomic origin main:refs/heads/yangi 3c8955c:refs/heads/qa/main
error: atomic push failed for ref refs/heads/qa/main. status: 2
To ../server.git
 ! [rejected]        3c8955c -> qa/main (non-fast-forward)
 ! [rejected]        main -> yangi (atomic push failed)
error: failed to push some refs to '../server.git'
...
```

Bu [17-bobdagi](17-reflar-va-head.md) `update-ref --stdin` tranzaksiyasining tarmoq orqali shakli. Server qo'llab-quvvatlamasa, push butunlay muvaffaqiyatsiz bo'ladi.

### Skriptlar uchun: `--dry-run` va `--porcelain`

```bash
$ git push --porcelain --dry-run origin main:refs/heads/yangi2 :refs/heads/yangi
To ../server.git
-	:refs/heads/yangi	[deleted]
*	refs/heads/main:refs/heads/yangi2	[new branch]
Done
```

`--dry-run` hech narsani yubormaydi (lekin serverga ulanadi — uning ref'larini bilishi kerak). `--porcelain` qatorlarni tab bilan ajratib, to'liq ref nomlari bilan **stdout** ga chiqaradi. Belgilar `fetch` dagi bilan bir xil: ` ` fast-forward, `+` majburiy, `-` o'chirildi, `*` yangi, `!` rad etildi, `=` o'zgarmagan.

## Kod: `--force-with-lease` va `--force-if-includes` — ikki dasturchi

Endi bobning eng amaliy qismi. Alohida tajriba maydoni `29-lease/` — yana server, Ali va Vali.

**Boshlanish.** Ali `cc71ff6 "Muallifni qo'shish"` ni push qildi. Vali uni oldi va ustiga o'z commit'ini qurib push qildi. Ali esa Vali'dan bexabar, o'z (allaqachon push qilingan) commit'ini `--amend` bilan tuzatdi:

```bash
$ git log --oneline --graph --all
* c101f60 Muallifni qo'shish
| * cc71ff6 Muallifni qo'shish
|/
* 3c8955c Boshlang'ich commit
```

Ali'ning nazarida server'dagi `main` hali `cc71ff6` da (`origin/main`). Aslida esa u allaqachon Vali'ning `53d10cf` sida:

```text
Server:         3c8955c---cc71ff6---53d10cf   ← main (Vali'ning ishi)
Ali (lokal):    3c8955c---c101f60             ← main
Ali'ning origin/main: cc71ff6 (eskirgan)
```

Ali o'z tarixini qayta yozgani uchun oddiy push ishlamaydi, majburlash kerak. Endi uch xil majburlashni solishtiramiz.

### 1. `--force` — ko'r-ko'rona

```bash
$ git push --force
To ../server.git
 + 53d10cf...c101f60 main -> main (forced update)
```

Server Ali'ning `c101f60` sini qabul qildi — Vali'ning `53d10cf` i hech qaysi branch'da qolmadi. Ali buni hatto ko'rmadi ham: chiqishdagi `53d10cf` u hech qachon ko'rmagan commit. Hujjatdagi `git push origin +dev:master` misoli aynan shu haqda ogohlantiradi: yo'qolgan commit'lar serverda "osilib" qoladi va keyingi `gc` ularni o'chiradi.

(Bu tajriba nusxada qilindi — asl `29-lease` holati o'zgarmagan.)

### 2. `--force-with-lease` — "ijara" sharti

`--force-with-lease` — "server'dagi ref hali men kutgan joyda bo'lsagina majburla". Qiymatsiz shaklda "kutilgan joy" — sizdagi remote-tracking branch, ya'ni `origin/main`. Bu [17-bobdagi](17-reflar-va-head.md) `update-ref <ref> <yangi> <eski>` — compare-and-swap'ning tarmoq ko'rinishi.

```bash
$ git push --force-with-lease
To ../server.git
 ! [rejected]        main -> main (stale info)
error: failed to push some refs to '../server.git'
$ git ls-remote origin main
53d10cf54d737cb4424c3269296ac5abb709df5f	refs/heads/main
```

`stale info` — "ma'lumotingiz eskirgan": Ali kutgan `cc71ff6`, serverda esa `53d10cf`. Vali'ning ishi saqlandi. Hujjat buni "ref'ni qulflamasdan uni ijaraga olish" deb ataydi: ijara (sizning ko'rgan holatingiz) hali amalda bo'lsagina yozasiz.

### 3. Lekin fon `fetch` ijarani buzadi

Ko'p IDE va muharrirlar fonda o'zi `git fetch` qilib turadi. Ali hech narsani ko'rmadi, ishlatmadi, lekin `origin/main` yangilandi:

```bash
$ git fetch
From ../server
   cc71ff6..53d10cf  main       -> origin/main
```

Endi `origin/main` = `53d10cf` = server. `--force-with-lease` uchun hamma narsa joyida:

```bash
$ git push --force-with-lease
To ../server.git
 + 53d10cf...c101f60 main -> main (forced update)
$ echo "exit=$?"
exit=0
```

Vali'ning commit'i **baribir yo'qoldi** — xuddi `--force` dagi kabi. Rasmiy hujjat bu haqda ochiq ogohlantiradi: qiymatsiz `--force-with-lease` fonda `git fetch` qiladigan har qanday narsa (cron, muharrir) bilan "juda yomon chiqishadi". Git'da "siz nimani ko'rganingiz" haqida remote-tracking ma'lumotidan boshqa dalil yo'q.

### 4. `--force-if-includes` — "men buni haqiqatan ko'rganmanmi?"

Xuddi shu holat (fon `fetch` dan keyin), lekin qo'shimcha opsiya bilan:

```bash
$ git push --force-with-lease --force-if-includes
To ../server.git
 ! [rejected]        main -> main (remote ref updated since checkout)
error: failed to push some refs to '../server.git'
hint: Updates were rejected because the tip of the remote-tracking branch has
hint: been updated since the last checkout. If you want to integrate the
hint: remote changes, use 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

Rad etildi. Qanday bildi? Hujjatga ko'ra `--force-if-includes` tekshiradi: remote-tracking ref'ning uchi (`53d10cf`) **lokal branch'ning reflog yozuvlaridan birortasidan yetib boriladimi** ([42-bob](42-reflog-va-tiklash.md)). Ali'ning reflog'iga qaraymiz:

```bash
$ git reflog main
c101f60 main@{0}: commit (amend): Muallifni qo'shish
cc71ff6 main@{1}: commit: Muallifni qo'shish
3c8955c main@{2}: commit (initial): Boshlang'ich commit
$ git reflog origin/main
53d10cf refs/remotes/origin/main@{0}: fetch: fast-forward
cc71ff6 refs/remotes/origin/main@{1}: update by push
3c8955c refs/remotes/origin/main@{2}: update by push
```

`origin/main` `53d10cf` ga yetdi, lekin Ali'ning `main` i hech qachon `53d10cf` ni o'z ichiga olgan holatda bo'lmagan. Demak, Ali Vali'ning ishini ko'rmagan va birlashtirmagan — majburlash rad etiladi.

### 5. To'g'ri yo'l: avval birlashtirish, keyin majburlash

Ali Vali'ning ishini saqlagan holda o'z tuzatishini qo'llamoqchi. U server holatini oladi va Vali'ning commit'ini o'zining yangi `c101f60` i ustiga ko'chiradi ([24-bob](24-rebase.md)dagi `--onto`):

```bash
$ git fetch
From ../server
   cc71ff6..53d10cf  main       -> origin/main
$ git branch eski-tahrir
$ git reset --hard origin/main
HEAD is now at 53d10cf Kitoblar ro'yxati
$ git rebase --onto eski-tahrir cc71ff6
Successfully rebased and updated refs/heads/main.
$ git log --oneline --graph main origin/main
* 8de5280 Kitoblar ro'yxati
* c101f60 Muallifni qo'shish
| * 53d10cf Kitoblar ro'yxati
| * cc71ff6 Muallifni qo'shish
|/
* 3c8955c Boshlang'ich commit
$ git reflog -4 main
8de5280 main@{0}: rebase (finish): refs/heads/main onto c101f60ca95c8b52187316d4d90d9168d4e70a0f
53d10cf main@{1}: reset: moving to origin/main
c101f60 main@{2}: commit (amend): Muallifni qo'shish
cc71ff6 main@{3}: commit: Muallifni qo'shish
```

Endi reflog'da `main@{1}` = `53d10cf` — Ali server holatini o'z branch'iga olgan. Tekshiruv o'tadi:

```bash
$ git push --force-with-lease --force-if-includes
To ../server.git
 + 53d10cf...8de5280 main -> main (forced update)
$ git log --oneline origin/main
8de5280 Kitoblar ro'yxati
c101f60 Muallifni qo'shish
3c8955c Boshlang'ich commit
```

Push hali ham majburiy (`cc71ff6` tarixdan chiqdi — Ali aynan shuni xohlagan), lekin Vali'ning o'zgarishi `8de5280` sifatida saqlandi.

### Xulosa jadvali

| Holat | `--force` | `--force-with-lease` | `+ --force-if-includes` |
| --- | --- | --- | --- |
| Ali `fetch` qilmagan, serverda yangi commit | Yo'qotadi | **Rad** (`stale info`) | **Rad** |
| Fon `fetch` bo'lgan, Ali ko'rmagan | Yo'qotadi | Yo'qotadi | **Rad** (`remote ref updated since checkout`) |
| Ali server holatini o'z branch'iga olgan | O'tadi | O'tadi | O'tadi |

Muhim tafsilotlar (`git push` hujjatidan):

- `--force-with-lease=<ref>:<kutilgan>` — kutilgan qiymatni aniq berish. Bu yagona **barqaror** shakl; qiymatsiz shakllar hujjatda hali "eksperimental" deb belgilangan. Sinov: fon `fetch` dan keyin ham `--force-with-lease=main:cc71ff6` rad etildi (`stale info`), chunki solishtirish `origin/main` bilan emas, berilgan hash bilan.
- `<kutilgan>` bo'sh bo'lsa (`--force-with-lease=main:`) — "bu ref serverda umuman bo'lmasin".
- `--force-if-includes` faqat qiymatsiz `--force-with-lease` (yoki `=<ref>`) bilan ma'noga ega; yolg'iz yoki `=<ref>:<kutilgan>` bilan — hech narsa qilmaydi.
- `--force` hamma tekshiruvlarni, jumladan lease'ni ham o'chiradi. Ularni birga yozish lease'ni bekor qiladi.
- Doimiy yoqish: `git config --global push.useForceIfIncludes true`.

Hujjat fon `fetch` ga qarshi yana ikki usul beradi: push uchun alohida remote (`git remote add origin-push $(git config remote.origin.url)`) — fon jarayoni `origin` ni yangilaydi, `origin-push` ni emas; yoki kutilgan nuqtaga teg qo'yib (`git tag base main`), `--force-with-lease=main:base` bilan yuborish.

## Kod: protokol ichidan — `GIT_TRACE_PACKET`

`GIT_TRACE_PACKET=1` muhit o'zgaruvchisi Git jarayonlari almashadigan har bir paketni stderr'ga chiqaradi. Lokal transportda ham Git server tomonda haqiqiy `upload-pack` jarayonini ishga tushiradi — `GIT_TRACE=1` buni ko'rsatadi:

```bash
$ GIT_TRACE=1 git fetch origin
...
trace: run_command: unset GIT_PREFIX; GIT_PROTOCOL=version=2 'git-upload-pack '\''../server.git'\'''
...
trace: run_command: git pack-objects --revs --stdout --thin --delta-base-offset --include-tag --quiet
...
trace: run_command: git unpack-objects -q --pack_header=2,3
...
```

SSH'da ham aynan shu bo'ladi, faqat `git-upload-pack` `ssh` orqali uzoq kompyuterda ishga tushadi (Pro Git: `ssh -x git@server "git-upload-pack 'simplegit-progit.git'"`). `GIT_PROTOCOL=version=2` — protokolning 2-versiyasi so'ralmoqda; `protocol.version` sozlamasi o'rnatilmagan bo'lsa, standart — `2`.

### Paket chegarasi: pkt-line

Har xabar **pkt-line** formatida: birinchi 4 belgi — qatorning uzunligi 16 lik sanoqda (o'sha 4 baytni ham qo'shib). `0000` — "flush": xabar tugadi. Buni xom holda ko'rish uchun server jarayonini qo'lda chaqiramiz (`--advertise-refs` — faqat ref e'lonini chiqarib to'xta):

```bash
$ git upload-pack --advertise-refs server.git | tr '\0' '@'
01123c4c3c824326c094a5ab9eb3a6e0d08417fc0e9c HEAD@multi_ack thin-pack side-band side-band-64k ofs-delta shallow deepen-since deepen-not deepen-relative no-progress include-tag multi_ack_detailed no-done symref=HEAD:refs/heads/main object-format=sha1 agent=git/2.56.0-Darwin
00445d3277155bc55e05d6e281f26c8ececf78ff054f refs/heads/dev-tajriba
003d3c8955c614a4425231ef8cd867c61e8aed0e2a74 refs/heads/eski
...
```

`003d` = 61 bayt: 4 (uzunlik) + 40 (hash) + 1 (bo'sh joy) + 15 (`refs/heads/eski`) + 1 (`\n`). Birinchi qatorda NUL baytdan (biz uni `@` qilib ko'rsatdik) keyin server **imkoniyatlari** (capabilities) keladi. Bu — **0-versiya** (eski) protokol; Pro Git aynan shu formatni tasvirlaydi. 2-versiyada:

```bash
$ GIT_PROTOCOL=version=2 git upload-pack --advertise-refs server.git
000eversion 2
001cagent=git/2.56.0-Darwin
0013ls-refs=unborn
0020fetch=shallow wait-for-done
0012server-option
0017object-format=sha1
0000
```

Ref'lar e'lon qilinmadi — faqat imkoniyatlar va buyruqlar (`ls-refs`, `fetch`). `gitprotocol-v2` hujjati sababini aytadi: 0-versiyada server **hamma** ref'larni (minglab bo'lishi mumkin) majburan e'lon qiladi; 2-versiyada mijoz `ls-refs` bilan faqat keraklisini so'raydi, imkoniyatlar ham NUL bayt ortiga yashirilmaydi.

### `fetch` suhbati, qadamma-qadam

Vali yangi commit (`3c4c3c8 "Birinchi kitob"`) push qildi. Ali:

```bash
$ GIT_TRACE_PACKET=1 git fetch origin
```

Chiqishda ikkala tomon ham ko'rinadi (lokal transportda ikkala jarayon bir terminalda). Quyida faqat mijoz tomoni (`fetch>` — yuborildi, `fetch<` — qabul qilindi), har qator boshidagi vaqt va `pkt-line.c:85 packet:` ustuni olib tashlangan.

**1-qadam — server imkoniyatlarini e'lon qiladi:**

```text
fetch< version 2
fetch< agent=git/2.56.0-Darwin
fetch< ls-refs=unborn
fetch< fetch=shallow wait-for-done
fetch< server-option
fetch< object-format=sha1
fetch< 0000
```

**2-qadam — mijoz ref'larni so'raydi (`ls-refs`):**

```text
fetch> command=ls-refs
fetch> agent=git/2.56.0-Darwin
fetch> object-format=sha1
fetch> 0001
fetch> peel
fetch> symrefs
fetch> unborn
fetch> ref-prefix refs/heads/
fetch> ref-prefix refs/tags/
fetch> ref-prefix HEAD
fetch> 0000
```

`0001` — "delimiter": buyruq sarlavhasini argumentlardan ajratadi. `ref-prefix` lar Ali'ning refspec'idan (`refs/heads/*`) va teglarni ergashtirishdan kelib chiqqan — server `refs/pull/...` kabi boshqa ref'larni yubormaydi. `peel` — annotated teglarning commit'ini ham ayt, `symrefs` — `HEAD` qaysi branch'ga ishora qilishini ayt.

**3-qadam — server ref'lar ro'yxatini beradi:**

```text
fetch< 3c4c3c824326c094a5ab9eb3a6e0d08417fc0e9c HEAD symref-target:refs/heads/main
fetch< 5d3277155bc55e05d6e281f26c8ececf78ff054f refs/heads/dev-tajriba
fetch< 3c8955c614a4425231ef8cd867c61e8aed0e2a74 refs/heads/eski
fetch< 3c4c3c824326c094a5ab9eb3a6e0d08417fc0e9c refs/heads/main
fetch< 5d3277155bc55e05d6e281f26c8ececf78ff054f refs/heads/qa/kirish
fetch< a5d896fe99a138b42f4159b03f96dbcd28814ae1 refs/heads/qa/main
fetch< 5d3277155bc55e05d6e281f26c8ececf78ff054f refs/heads/qa/qidiruv
fetch< e682d0060ae51721cd34aa74616aad617251cbc5 refs/tags/v1.0 peeled:2f0abc593e33fd06e5b4a63cf0a7bf46ddab0da2
fetch< 0000
```

Bu `git ls-remote` ko'rsatadigan narsaning o'zi. `peeled:` — [17-bobdagi](17-reflar-va-head.md) `^{}` archish natijasi, server teg obyektini ochmasdan uning commit'ini aytdi.

**4-qadam — muzokara: `want` va `have`:**

```text
fetch> command=fetch
fetch> agent=git/2.56.0-Darwin
fetch> object-format=sha1
fetch> 0001
fetch> thin-pack
fetch> no-progress
fetch> include-tag
fetch> ofs-delta
fetch> want 3c4c3c824326c094a5ab9eb3a6e0d08417fc0e9c
fetch> have 5d3277155bc55e05d6e281f26c8ececf78ff054f
fetch> have a5d896fe99a138b42f4159b03f96dbcd28814ae1
fetch> 0000
```

Mijoz e'londagi ref'larni o'zidagi `refs/remotes/origin/*` bilan solishtirdi: faqat `main` o'zgargan (`3c4c3c8`), qolganlari allaqachon bor, `dev-tajriba` esa inkor refspec bilan chiqarilgan. Shuning uchun bitta `want`. `have` lar — "menda shu commit'lar (va ularning butun tarixi) bor". Opsiyalar (`gitprotocol-v2`): `thin-pack` — delta asosi packfile ichida bo'lmasligi mumkin (mijozda bor), `ofs-delta` — deltani pozitsiya bo'yicha ko'rsatish, `include-tag` — yuborilayotgan commit'larga tegishli annotated teglarni ham qo'sh.

**5-qadam — server tasdiqlaydi va packfile yuboradi:**

```text
fetch< acknowledgments
fetch< ACK 5d3277155bc55e05d6e281f26c8ececf78ff054f
fetch< ACK a5d896fe99a138b42f4159b03f96dbcd28814ae1
fetch< ready
fetch< 0001
fetch< packfile
sideband< PACK ...
sideband< 0000
From ../server
   2f0abc5..3c4c3c8  main       -> origin/main
```

`ACK` — "bu commit menda ham bor, umumiy nuqta topildi". `ready` — "yetarli, packfile yasayman". Packfile `sideband` kanali orqali keladi (bir ulanishda ma'lumot, progress va xato xabarlarini ajratish uchun). Server `3c4c3c8` dan boshlab `have` larga yetguncha bo'lgan obyektlarni yig'di: commit, uning tree'si va o'zgargan blob — 3 ta obyekt. Yuqoridagi `GIT_TRACE` dagi `--pack_header=2,3` ham shuni bildiradi: packfile 2-versiya, 3 obyekt. Obyektlar soni kichik (`fetch.unpackLimit`/`transfer.unpackLimit` standart 100 dan kam) bo'lgani uchun mijoz packfile'ni saqlamay, `unpack-objects` bilan loose obyektlarga ochdi ([18-bob](18-packfile-va-gc.md)).

Pro Git bilan farq: Pro Git (0-versiya) misolida mijoz oxirida `done` yuboradi. 2-versiyada server `ready` desa, `done` shart emas; klon paytida esa (`have` yo'q) mijoz darhol `done` yuboradi.

### `push` suhbati

`push` uchun hozir ham 0-versiya formati ishlatiladi (`gitprotocol-v2` faqat `fetch`/`ls-refs` buyruqlarini belgilaydi). Ali o'z commit'ini rebase qilib (`0840946`), push qiladi:

```bash
$ GIT_TRACE_PACKET=1 git push origin main
```

```text
push< 5d3277155bc55e05d6e281f26c8ececf78ff054f refs/heads/dev-tajriba\0report-status report-status-v2 delete-refs side-band-64k quiet atomic ofs-delta object-format=sha1 agent=git/2.56.0-Darwin
push< 3c8955c614a4425231ef8cd867c61e8aed0e2a74 refs/heads/eski
push< 3c4c3c824326c094a5ab9eb3a6e0d08417fc0e9c refs/heads/main
...
push< 0000
push> 3c4c3c824326c094a5ab9eb3a6e0d08417fc0e9c 0840946d985d68a02c27c0080a88b0ce7b8c5390 refs/heads/main\0 report-status-v2 side-band-64k quiet object-format=sha1 agent=git/2.56.0-Darwin
push> 0000
push< unpack ok
push< ok refs/heads/main
push< 0000
To ../server.git
   3c4c3c8..0840946  main -> main
```

1. `receive-pack` hamma ref'larini e'lon qiladi, birinchi qatorda NUL dan keyin imkoniyatlar (`atomic`, `delete-refs`, `report-status`...). `--atomic` ishlashi uchun server `atomic` ni e'lon qilishi kerak.
2. `send-pack` har yangilanadigan ref uchun bitta qator yuboradi: `<eski> <yangi> <ref>`. Yangi ref yaratishda `<eski>` — 40 ta nol, o'chirishda `<yangi>` — 40 ta nol (Pro Git). Server **eski** qiymatni tekshiradi — `--force-with-lease` aynan shu maydonga sizning "kutilgan" qiymatingizni qo'yadi.
3. `0000` dan keyin packfile yuboriladi (trace'da ko'rinmaydi — u pkt-line emas, xom oqim).
4. Server `unpack ok` (packfile qabul qilindi) va har ref uchun `ok` yoki `ng <ref> <sabab>` deb javob beradi. `[remote rejected]` xabarlari ([27-bob](27-remote.md)) shu `ng` qatoridan keladi.

## Kod: transportlar — lokal, HTTP, SSH, Git

### Lokal: yo'l va `file://` farqi

Pro Git: oddiy yo'l bilan klonlaganda Git **hardlink** yoki to'g'ridan-to'g'ri nusxa ishlatadi; `file://` bilan esa tarmoqdagidek protokol jarayonlarini ishga tushiradi.

```bash
$ git clone server.git k1
Cloning into 'k1'...
done.
$ git clone file:///tmp/misol/29-fetch-push/server.git k2
Cloning into 'k2'...
$ ls -l server.git/objects/3c/ k1/.git/objects/3c/
k1/.git/objects/3c/:
total 16
-r--r--r--@ 2 ali   staff  161 Oct  8 12:25 4c3c824326c094a5ab9eb3a6e0d08417fc0e9c
-r--r--r--@ 3 ali   staff  135 Oct  8 12:23 8955c614a4425231ef8cd867c61e8aed0e2a74

server.git/objects/3c/:
total 16
-r--r--r--@ 2 ali   staff  161 Oct  8 12:25 4c3c824326c094a5ab9eb3a6e0d08417fc0e9c
-r--r--r--@ 3 ali   staff  135 Oct  8 12:23 8955c614a4425231ef8cd867c61e8aed0e2a74
$ find k2/.git/objects -type f
k2/.git/objects/pack/pack-ae7cab65bd7b6a74435ac044dc7143ff8d2b1448.rev
k2/.git/objects/pack/pack-ae7cab65bd7b6a74435ac044dc7143ff8d2b1448.pack
k2/.git/objects/pack/pack-ae7cab65bd7b6a74435ac044dc7143ff8d2b1448.idx
```

`ls -l` dagi ikkinchi ustun — fayl nechta nomga ega (hardlink soni). `2` va `3` — bitta diskdagi fayl ham serverda, ham klonda (va `3c8955c` holida Vali'ning klonida ham) turibdi; joy qayta sarflanmadi. `file://` klon esa obyektlarni yangi packfile ichida oldi — keraksiz obyektlar va ref'lar tashlab ketiladi. Pro Git `file://` ni aynan shu "toza nusxa" uchun tavsiya qiladi. Xuddi shu natijani `git clone --no-local` beradi.

**Afzalligi:** sozlash shart emas, mavjud fayl ruxsatlari ishlaydi. **Kamchiligi:** umumiy disk (NFS) ko'pincha SSH'dan sekinroq; har foydalanuvchi "server" papkasini to'g'ridan-to'g'ri buzib qo'yishi mumkin — himoya yo'q.

### HTTP: aqlli va soqov

**Aqlli (smart) HTTP** — bugungi asosiy usul (GitHub, GitLab). U SSH kabi muzokara qiladi, lekin oddiy HTTPS porti orqali va login/parol yoki token bilan ishlaydi ([30-bob](30-ssh-va-credential.md)). Bitta URL ham o'qish, ham yozish uchun. Pro Git bo'yicha so'rovlar ketma-ketligi:

```text
fetch:  GET  $URL/info/refs?service=git-upload-pack     ← ref e'loni
        POST $URL/git-upload-pack                       ← want/have, javobda packfile
push:   GET  $URL/info/refs?service=git-receive-pack
        POST $URL/git-receive-pack                      ← eski/yangi qatorlar + packfile
```

2-versiyada mijoz `Git-Protocol: version=2` sarlavhasini yuboradi.

**Soqov (dumb) HTTP** — serverda Git yo'q, oddiy veb-server repo fayllarini beradi. Faqat o'qish uchun. Pro Git: bare repo'da `post-update` hook'ini yoqish kifoya — u har push'dan keyin `git update-server-info` ni chaqiradi. Bu buyruq ikki indeks faylni yozadi:

```bash
$ git update-server-info
$ cat info/refs
5d3277155bc55e05d6e281f26c8ececf78ff054f	refs/heads/dev-tajriba
3c8955c614a4425231ef8cd867c61e8aed0e2a74	refs/heads/eski
0840946d985d68a02c27c0080a88b0ce7b8c5390	refs/heads/main
...
e682d0060ae51721cd34aa74616aad617251cbc5	refs/tags/v1.0
2f0abc593e33fd06e5b4a63cf0a7bf46ddab0da2	refs/tags/v1.0^{}
$ git repack -q -a -d && git update-server-info
$ cat objects/info/packs
P pack-ae7cab65bd7b6a74435ac044dc7143ff8d2b1448.pack
```

Repo'ni lokal kompyuterdagi oddiy statik veb-server (`python3 -m http.server --bind 127.0.0.1`) orqali berib, `git clone http://127.0.0.1:8729/dumb.git` qildik. Server jurnalidagi so'rovlar (javob kodi va yo'l):

```text
200 GET /dumb.git/info/refs?service=git-upload-pack
200 GET /dumb.git/HEAD
404 GET /dumb.git/objects/08/40946d985d68a02c27c0080a88b0ce7b8c5390
404 GET /dumb.git/objects/5d/3277155bc55e05d6e281f26c8ececf78ff054f
404 GET /dumb.git/objects/3c/8955c614a4425231ef8cd867c61e8aed0e2a74
404 GET /dumb.git/objects/a5/d896fe99a138b42f4159b03f96dbcd28814ae1
404 GET /dumb.git/objects/e6/82d0060ae51721cd34aa74616aad617251cbc5
404 GET /dumb.git/objects/info/http-alternates
404 GET /dumb.git/objects/info/alternates
200 GET /dumb.git/objects/info/packs
200 GET /dumb.git/objects/pack/pack-ae7cab65bd7b6a74435ac044dc7143ff8d2b1448.idx
200 GET /dumb.git/objects/pack/pack-ae7cab65bd7b6a74435ac044dc7143ff8d2b1448.pack
```

Bu Pro Git "Transfer Protocols" bo'limidagi ssenariyning aynan o'zi:

1. Mijoz avval **aqlli** protokolni so'raydi (`?service=git-upload-pack`). Statik server buni tushunmaydi va oddiy `info/refs` faylini qaytaradi — Git soqov rejimga o'tadi.
2. `HEAD` — klondan keyin qaysi branch'ni checkout qilishni bilish uchun.
3. Ref uchlaridagi obyektlarni loose shaklda so'raydi — `404`: hammasi packfile ichida.
4. Muqobil (alternates) obyekt omborlari bormi — yo'q.
5. `objects/info/packs` — qanday packfile'lar bor; `.idx` — kerakli obyekt qaysi pack'da; nihoyat butun `.pack`.

Soqov protokol packfile'ni **to'liq** yuklaydi, hatto sizga uning kichik bir qismi kerak bo'lsa ham; Pro Git'ga ko'ra u yozishni (push) qo'llab-quvvatlamaydi. Pro Git: hozir u kam ishlatiladi, ko'p hostinglar uni qo'llab-quvvatlamaydi.

### SSH

```text
ssh://[user@]server/loyiha.git
[user@]server:loyiha.git        ← scp-ga o'xshash qisqa shakl
```

Foydalanuvchi nomi berilmasa — joriy tizim foydalanuvchingiz. **Afzalligi** (Pro Git): deyarli hamma serverda bor, hamma ma'lumot shifrlanadi va autentifikatsiya qilinadi, samarali. **Kamchiligi:** anonim o'qish yo'q — kim klon qilsa ham SSH ruxsati bo'lishi kerak. Shuning uchun ochiq loyihalarda SSH push uchun, boshqa protokol hamma uchun o'qishga ishlatiladi. Kalitlar va sozlash — [30-bob](30-ssh-va-credential.md).

### Git protokoli (`git://`)

Git bilan birga keladigan maxsus demon (`git daemon`), 9418-port. SSH'dagi kabi uzatish mexanizmi, lekin **autentifikatsiya ham, shifrlash ham yo'q**. Repo `git-daemon-export-ok` fayli bo'lsagina beriladi. Pro Git (hozirgi nashr) jiddiy ogohlantiradi: shifrlanmagan `git://` (va `http://`) orqali klon qilsangiz, tarmoqni nazorat qiluvchi (masalan, routeringizni egallagan) hujumchi klon qilingan kodga zararli kod qo'shishi mumkin. `https://` da bu muammo yo'q; SSH'da esa — faqat noto'g'ri host kalit barmoq izini qabul qilsangiz.

### Taqqoslash

| Transport | Autentifikatsiya | Shifrlash | Push | Qachon |
| --- | --- | --- | --- | --- |
| Lokal (yo'l, `file://`) | Fayl ruxsatlari | — | Ha | Umumiy disk, tez tajriba |
| Aqlli HTTPS | Login/token | TLS | Ha | Standart tanlov, firewall'dan o'tadi |
| Soqov HTTP | Veb-server | Ixtiyoriy | Yo'q | Faqat statik, faqat o'qish |
| SSH | Kalit | Ha | Ha | O'z serveringiz, kalit bilan ishlash |
| `git://` | Yo'q | Yo'q | Amalda yo'q | Ishonchli tarmoqda katta ommaviy o'qish |

## Muhandislik nuqtai nazari: majburiy push madaniyati

- **`--force` ni odat qilmang.** Shaxsiy branch'da ham `git push --force-with-lease --force-if-includes` yozing — qo'shimcha bir necha harf, lekin hamkasbingiz bir kun o'sha branch'ga push qilsa, uning ishi qutqariladi. Alias qilish mumkin: `git config --global alias.fpush 'push --force-with-lease --force-if-includes'`.
- **`push.useForceIfIncludes=true`** — global yoqib qo'ying; ta'siri faqat `--force-with-lease` bilan sezildi.
- **Umumiy branch'ni (`main`) majburlamang.** Server tomonda himoya qiling: `receive.denyNonFastForwards=true` yoki hosting'dagi himoyalangan branch ([36-bob](36-github-boshqaruv.md)). Bunday sozlamani `--force` ham o'tolmaydi — natija `[remote rejected]`.
- **Majburlashdan keyin xabar bering.** Hamkasblaringiz eski tarix ustida ishlayotgan bo'lsa, ular `git pull --rebase` yoki `git rebase --onto` qilishi kerak ([24-bob](24-rebase.md)).
- **Yo'qotilgan commit qaytariladi.** Majburiy push'dan keyin eski uch hali bir necha joyda bor: push chiqishidagi `eski...yangi` hash'i, sizning `origin/main` reflog'ingiz (`git reflog origin/main`), hamkasbning lokal branch'i. Serverdagi osilib qolgan obyektlar esa `gc` gacha yashaydi ([42-bob](42-reflog-va-tiklash.md)).

## Muhandislik nuqtai nazari: refspec bilan tarmoq yukini kamaytirish

Katta monorepo'larda yuzlab branch bo'ladi. Har `fetch` da hammasini olish — vaqt va disk:

- Faqat kerakli branch'larni kuzating: `fetch = +refs/heads/main:refs/remotes/origin/main` va `fetch = +refs/heads/<ism>/*:...`.
- Inkor refspec bilan shovqinli nomlar maydonini chiqaring: `^refs/heads/dependabot/*`.
- `git clone --single-branch` ham aslida refspec'ni bitta branch bilan yozadi ([4-bob](04-repo-olish.md)).
- Protokol 2-versiyasida `ref-prefix` tufayli server ham faqat so'ralgan ref'larni yuboradi — refspec'ni toraytirish e'lon hajmini ham kamaytiradi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Rad etilgan push'ni `--force` bilan bosish | Hamkasbning commit'lari serverdan yo'qoladi | `fetch`, birlashtirish, keyin `--force-with-lease --force-if-includes` yoki oddiy push |
| `--force-with-lease` yetarli deb o'ylash | Fon `fetch` `origin/*` ni yangilasa, himoya ishlamaydi | `--force-if-includes` qo'shing yoki `=<ref>:<hash>` bilan aniq qiymat bering |
| `--force-with-lease` bilan birga `--force` yozish | `--force` lease tekshiruvini o'chiradi | Faqat `--force-with-lease` |
| `git push origin <hash>:yangi` | `<dst>` turini taxmin qilib bo'lmaydi, xato | `<hash>:refs/heads/yangi` |
| Refspec'da `+` siz qayta yoziladigan branch'ni kuzatish | Har `fetch` da `[rejected] (non-fast-forward)` | Bunday branch'lar uchun `+` |
| `fetch` refspec'ida `*` ni bir tomonda qoldirish | Naqsh noto'g'ri, Git qabul qilmaydi | `<src>` va `<dst>` da aynan bitta `*` |
| `git fetch origin main` dan keyin "nega `origin/main` ham o'zgardi" deb hayron bo'lish | Konfiguratsiya xarita sifatida ishlatiladi | Kerak bo'lmasa `--refmap=''` |
| Mavjud tegni yangilash uchun oddiy `git fetch` kutish | Mavjud teg almashtirilmaydi; `--tags` bilan esa rad | Ataylab `git fetch --tags --force` (kim va nega ko'chirganini aniqlab) |
| `git://` yoki `http://` dan klon qilib, kodni ishga tushirish | Yo'lda kod almashtirilishi mumkin | `https://` yoki SSH |
| Push muvaffaqiyatsizligini `[rejected]` va `[remote rejected]` ni farqlamay tahlil qilish | Biri — sizning Git'ingiz, biri — server qarori | `rejected` — fetch/birlashtirish; `remote rejected` — hook/sozlama, server egasiga |

## Amaliyot

1. Bare server va ikki klon yarating. Ikkinchi klonda `remote.origin.fetch` ni faqat `main` va `qa/*` ni oladigan qilib o'zgartiring. Serverga besh xil nomli branch push qilib, `git fetch` dan keyin `git branch -r` ni tekshiring.
2. `^refs/heads/dev-*` inkor refspec'ini qo'shing. `dev-` bilan boshlanadigan branch'lar olinmasligini, lekin `git fetch origin dev-x` buyrug'i bilan aniq so'ralganda `FETCH_HEAD` ga tushishini ko'rsating.
3. Serverda bir branch'ni majburlab qayta yozing. Ikkinchi klonda `git fetch origin <branch>:refs/remotes/origin/nusxa` ni `+` siz va `+` bilan ishlating — chiqishdagi belgilarni (`!`, `+`, `*`) izohlang.
4. `git push origin HEAD:refs/heads/sinov`, `git push origin :sinov`, `git push --porcelain --dry-run` va `--atomic` ni sinang. `--atomic` siz va bilan bitta rad etiladigan ref qanday farq qiladi?
5. `GIT_TRACE_PACKET=1 git fetch` chiqishidan `want` va `have` qatorlarini toping. Nechta `have` yuborildi va nega aynan shular? Keyin `git -c protocol.version=0 ...` bilan bir xil fetch qilib, ref e'loni qanday o'zgarishini solishtiring.
6. `git upload-pack --advertise-refs` chiqishidagi uchta qator uzunlik prefiksini qo'lda hisoblab tekshiring.
7. Ikki dasturchi ssenariysini takrorlang: (a) `fetch` siz `--force-with-lease`; (b) fon `fetch` dan keyin `--force-with-lease`; (c) xuddi shu holatda `--force-if-includes` qo'shib. Har holatda `git reflog main` va `git reflog origin/main` ni yozib oling.
8. (Qiyinroq) Bare repo'ni `git update-server-info` bilan tayyorlab, `python3 -m http.server --bind 127.0.0.1` orqali bering va soqov HTTP klonni kuzating. Keyin repo'ga yangi commit push qilib, `update-server-info` ni **chaqirmasdan** `git fetch` qiling — nima bo'ladi va nega `post-update` hook'i kerak?

## Rasmiy hujjat

- Pro Git — The Refspec: <https://git-scm.com/book/en/v2/Git-Internals-The-Refspec>
- Pro Git — Transfer Protocols: <https://git-scm.com/book/en/v2/Git-Internals-Transfer-Protocols>
- Pro Git — The Protocols: <https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols>
- `git push` (refspec, `--force-with-lease`, `--force-if-includes`, PUSH RULES): <https://git-scm.com/docs/git-push>
- `git fetch` (refspec, CONFIGURED REMOTE-TRACKING BRANCHES): <https://git-scm.com/docs/git-fetch>
- `gitprotocol-v2`: <https://git-scm.com/docs/gitprotocol-v2>
- `gitprotocol-pack`: <https://git-scm.com/docs/gitprotocol-pack>
- `git update-server-info`: <https://git-scm.com/docs/git-update-server-info>
