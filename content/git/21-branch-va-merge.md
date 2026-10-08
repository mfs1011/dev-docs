# 21 — Branch yaratish va merge

[← Oldingi: Branch — bu ko'rsatkich](20-branch-bu-ref.md) · [Mundarija](README.md) · [Keyingi: Konfliktlar →](22-konfliktlar.md)

## Tushuncha

[20-bobda](20-branch-bu-ref.md) branch'ni ochishni, unga o'tishni va tarixni ajratishni ko'rdik. Endi teskari ish: ajralgan tarixni yana bitta qilish. Buni **merge** (birlashtirish) bajaradi.

`git merge` hujjati buyruqni bir jumlada ta'riflaydi: "ikki yoki undan ko'p rivojlanish tarixini bir-biriga qo'shadi". Aniqrog'i: siz ko'rsatgan commit'larda **tarixlar ajralgan paytdan beri** qilingan o'zgarishlarni **joriy branch'ga** olib kiradi.

Ikki narsani darhol yodda tuting:

1. **Yo'nalish.** `git merge X` — "X'ni **hozirgi** branch'ga qo'sh". O'zgaradigan branch — `HEAD` ishora qilgan branch. `X` o'zi joyida qoladi. Shuning uchun avval qabul qiluvchi branch'ga o'tasiz (`git switch main`), keyin qo'shiladigan branch nomini berasiz (`git merge iss53`).
2. **Natija ikki xil bo'ladi**, va qaysi biri bo'lishini commit grafi hal qiladi, siz emas (opsiyalar bilan majburlash mumkin, pastda ko'ramiz):

| Holat | Git nima qiladi | Yangi obyekt |
| --- | --- | --- |
| Joriy branch qo'shilayotgan commit'ning **ajdodi** (o'zida yangi ish yo'q) | **Fast-forward**: branch ko'rsatkichini oldinga suradi | Yo'q — faqat ref fayli o'zgaradi |
| Tarix **ajralgan** (ikkala tomonda yangi commit bor) | **Uch tomonlama merge** (*three-way merge*) va **merge commit** | Yangi tree (va kerak bo'lsa blob'lar) + ikki otali commit |

`git merge` hujjatidagi rasm (joriy branch — `master`):

```text
          A---B---C topic
         /
    D---E---F---G master
```

`git merge topic` dan keyin:

```text
          A---B---C topic
         /         \
    D---E---F---G---H master
```

`H` — **merge commit**: otasi ikkita (`G` va `C`). Uning snapshot'i uchta snapshot asosida hisoblangan: ikki branch uchi (`G`, `C`) va ularning eng yaqin umumiy ajdodi `E`. Bu umumiy ajdod **merge base** (birlashtirish asosi) deyiladi va uni `git merge-base` buyrug'i topadi.

Atamalar:

- **ajdod** (*ancestor*) — commit'dan `parent` qatorlari bo'ylab orqaga yurib yetib boriladigan har qanday commit ([16-bob](16-commit-obyekti.md));
- **fast-forward** ("oldinga o'tkazib yuborish") — branch ko'rsatkichini to'g'ridan-to'g'ri yangi commit'ga surish, chunki orada birlashtiriladigan hech narsa yo'q;
- **merge commit** — ikki (yoki undan ko'p) `parent` qatori bor commit;
- **merge base** — ikki commit'ning eng yaxshi umumiy ajdodi.

## Nega shunday: nega Git ba'zan yangi commit yaratadi, ba'zan yo'q

Branch — faqat ko'rsatkich ([20-bob](20-branch-bu-ref.md)). Merge'ning vazifasi — branch'ni shunday holatga keltirish: undan orqaga yurganda **ikkala** tarixdagi commit'lar ham uchrasin.

**Fast-forward holati.** `main` `hotfix`ning ajdodi bo'lsa, `hotfix`dan orqaga yurganda `main`dagi hamma commit allaqachon uchraydi. Ya'ni `hotfix` uchi — tayyor javob: unda `main`ning hamma ishi va `hotfix`ning ishi bor. Yangi snapshot hisoblashga hojat yo'q, `main` faylidagi hash'ni almashtirish yetarli. Pro Git buni shunday aytadi: birlashtiriladigan "ajralgan ish" (*divergent work*) yo'q, shuning uchun Git ko'rsatkichni shunchaki oldinga suradi.

**Ajralgan holat.** Endi ikkala tomonda o'z commit'lari bor. Hech bir uch ikkinchisini o'z ichiga olmaydi. Javobni Git **hisoblab** chiqishi va yangi commit sifatida yozishi kerak. Bu commit ikkala uchni ham `parent` sifatida saqlaydi — shunda keyinchalik undan orqaga yurganda ikkala tarix ham topiladi, va Git keyingi merge'larda "bu yer allaqachon birlashtirilgan" ekanini biladi.

**Nega aynan uch snapshot?** Ikki faylni solishtirsangiz, faqat "ular har xil" deysiz. Lekin **kim** o'zgartirgan? `main`dagi qator yangimi yoki `iss53`dagisi? Bunga umumiy ajdod javob beradi: ajdodda qator qanday bo'lgan, qaysi tomon undan uzoqlashgan. Ajdodga nisbatan faqat bir tomon o'zgartirgan joyda Git o'sha tomonni oladi; ikkala tomon bir joyni har xil o'zgartirgan joyda — konflikt ([22-bob](22-konfliktlar.md)). Ikki tomonlama solishtirish bilan buni aniqlab bo'lmaydi.

Har commit otasini saqlagani uchun ([20-bob](20-branch-bu-ref.md), "Nega shunday") Git umumiy ajdodni graf bo'ylab o'zi topadi — siz "qayerdan ajralgan edi" deb eslab yurishingiz shart emas. Git'da merge oson va xavfsiz bo'lishining asosiy sababi shu.

## Kod: Pro Git ssenariysi — tayyorgarlik

Pro Git'dagi haqiqiy hayotga yaqin ssenariyni takrorlaymiz: veb-saytda ishlaymiz, yangi vazifa (issue #53) uchun branch ochamiz, shu payt shoshilinch xato haqida xabar keladi.

Sayt uchun uchta commit:

```bash
$ git init
$ # index.html: sarlavha, salomlashish, footer
$ # aloqa.html: email
$ git add . && git commit -m "Sayt karkasi"
$ git commit -am "Bosh sahifa matni"
$ git commit -am "Aloqa sahifasi"
```

```text
$ git log --oneline
59b6ff3 Aloqa sahifasi
cbdb8b0 Bosh sahifa matni
648fdf8 Sayt karkasi
```

Issue #53 uchun branch ochib, footer'ni o'zgartiramiz ([20-bob](20-branch-bu-ref.md), `switch -c`):

```text
$ git switch -c iss53
Switched to a new branch 'iss53'
$ git commit -am "Yangi footer [issue 53]"
[iss53 2ccf6c0] Yangi footer [issue 53]
 1 file changed, 1 insertion(+), 1 deletion(-)
```

Shoshilinch xabar: aloqa sahifasidagi email noto'g'ri. Git'da `iss53`dagi chala ishni bekor qilish yoki u bilan birga deploy qilish shart emas — ishlab turgan versiyaga (`main`) qaytib, undan alohida `hotfix` branch'i ochamiz:

```text
$ git switch main
Switched to branch 'main'
$ git switch -c hotfix
Switched to a new branch 'hotfix'
$ git commit -am "Email manzilini tuzatish"
[hotfix 36852c9] Email manzilini tuzatish
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git log --oneline --decorate --graph --all
* 36852c9 (HEAD -> hotfix) Email manzilini tuzatish
| * 2ccf6c0 (iss53) Yangi footer [issue 53]
|/
* 59b6ff3 (main) Aloqa sahifasi
* cbdb8b0 Bosh sahifa matni
* 648fdf8 Sayt karkasi
```

`main`ga o'tganda working tree `main` snapshot'iga qaytadi — `iss53`dagi footer o'zgarishi ko'rinmaydi. Pro Git ta'kidlaydi: o'tishdan oldin commit qilinmagan ish bo'lmagani ma'qul ([20-bob](20-branch-bu-ref.md), switch himoyasi; [38-bob](38-stash-va-clean.md), stash).

```text
                     36852c9  ← hotfix
                    /
  648fdf8---cbdb8b0---59b6ff3  ← main
                    \
                     2ccf6c0  ← iss53
```

## Kod: fast-forward — faqat bitta fayl o'zgaradi

Tuzatish tekshirildi, uni `main`ga qo'shamiz. Avval qabul qiluvchi branch'ga o'tamiz:

```text
$ git switch main
Switched to branch 'main'
```

Merge'dan **oldin** holatni qayd qilamiz:

```text
$ git rev-parse main hotfix
59b6ff3dcae16c3d0426e175a694de87cdb0d43d
36852c940f577415eabe9da3ce2c1b48085aa9a8
$ cat .git/refs/heads/main
59b6ff3dcae16c3d0426e175a694de87cdb0d43d
$ git count-objects
16 objects, 64 kilobytes
```

Fast-forward bo'lish-bo'lmasligini merge'dan oldin ham bilish mumkin. Ikki savol:

```text
$ git merge-base main hotfix
59b6ff3dcae16c3d0426e175a694de87cdb0d43d
$ git merge-base --is-ancestor main hotfix
$ echo $?
0
```

Umumiy ajdod — `main`ning **o'zi** (`59b6ff3`). `--is-ancestor` chiqish kodi `0` — "ha, `main` `hotfix`ning ajdodi". Demak `main`da yangi ish yo'q va merge fast-forward bo'ladi.

```text
$ git merge hotfix
Updating 59b6ff3..36852c9
Fast-forward
 aloqa.html | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

`Updating 59b6ff3..36852c9` — `main` qayerdan qayerga surilgani. `Fast-forward` — merge turi. Ostidagi diffstat — `ORIG_HEAD` bilan natija orasidagi farq (`merge.stat` sozlamasi, standart yoqilgan).

Merge'dan **keyin**:

```text
$ cat .git/refs/heads/main
36852c940f577415eabe9da3ce2c1b48085aa9a8
$ git rev-parse main hotfix
36852c940f577415eabe9da3ce2c1b48085aa9a8
36852c940f577415eabe9da3ce2c1b48085aa9a8
$ git count-objects
16 objects, 64 kilobytes
```

Nima o'zgardi:

| Narsa | Oldin | Keyin |
| --- | --- | --- |
| `.git/refs/heads/main` | `59b6ff3...` | `36852c9...` (`hotfix` bilan bir xil) |
| `.git/refs/heads/hotfix` | `36852c9...` | o'zgarmadi |
| `.git/HEAD` | `ref: refs/heads/main` | o'zgarmadi |
| `.git/objects` | 16 obyekt | 16 obyekt — **birorta yangi obyekt yo'q** |
| index va working tree | `59b6ff3` snapshot'i | `36852c9` snapshot'i |

Ikki qo'shimcha iz qoladi. Birinchisi — `ORIG_HEAD`: `git merge` hujjatiga ko'ra, merge boshlanishidan oldin Git joriy branch uchini shu yerga yozadi:

```text
$ cat .git/ORIG_HEAD
59b6ff3dcae16c3d0426e175a694de87cdb0d43d
```

Ikkinchisi — reflog: `main`ning ham, `HEAD`ning ham jurnaliga yozuv tushadi ([42-bob](42-reflog-va-tiklash.md)):

```text
$ tail -1 .git/logs/refs/heads/main
59b6ff3dcae16c3d0426e175a694de87cdb0d43d 36852c940f577415eabe9da3ce2c1b48085aa9a8 Ali Valiyev <ali@example.com> 1791349560 +0500	merge hotfix: Fast-forward
```

Grafda esa hech qanday "merge izi" yo'q — chiziq to'g'ri:

```text
$ git log --oneline --decorate --graph --all
* 36852c9 (HEAD -> main, hotfix) Email manzilini tuzatish
| * 2ccf6c0 (iss53) Yangi footer [issue 53]
|/
* 59b6ff3 Aloqa sahifasi
* cbdb8b0 Bosh sahifa matni
* 648fdf8 Sayt karkasi
```

```text
  oldin:
                     36852c9  ← hotfix
                    /
  ...---59b6ff3  ← main

  keyin (main shunchaki oldinga surildi):

  ...---59b6ff3---36852c9  ← main, hotfix
```

Fast-forward — bitta ref faylining mazmunini almashtirish, xolos. Tuzatish endi `main` ko'rsatgan snapshot'da — uni deploy qilish mumkin.

`hotfix` endi kerak emas: `main` aynan o'sha joyda. Uni o'chiramiz (o'chirishning hamma tafsiloti — [23-bobda](23-branch-boshqaruvi.md)):

```text
$ git branch -d hotfix
Deleted branch hotfix (was 36852c9).
```

Commit `36852c9` o'chmadi — uni hali `main` ko'rsatib turibdi. O'chgani faqat `.git/refs/heads/hotfix` fayli.

## Kod: uch tomonlama merge va merge commit

`iss53`ga qaytib ishni tugatamiz:

```text
$ git switch iss53
Switched to branch 'iss53'
$ cat aloqa.html
<p>Email: info@kutubxona.uz</p>
<p>Manzil: Toshkent</p>
$ git commit -am "Footer tayyor [issue 53]"
[iss53 85ddfe4] Footer tayyor [issue 53]
 1 file changed, 2 insertions(+), 1 deletion(-)
```

E'tibor bering: `iss53`da email hali eski. `hotfix` ishi `iss53`ga o'tmagan — u `main`ga qo'shilgan, `iss53` esa undan oldin ajralgan. Pro Git aytganidek, kerak bo'lsa `iss53` ichida `git merge main` qilish mumkin, yoki `iss53`ni `main`ga qo'shganda birlashishini kutish mumkin. Biz ikkinchi yo'ldan boramiz.

```text
$ git switch main
Switched to branch 'main'
$ git log --oneline --decorate --graph --all
* 85ddfe4 (iss53) Footer tayyor [issue 53]
* 2ccf6c0 Yangi footer [issue 53]
| * 36852c9 (HEAD -> main) Email manzilini tuzatish
|/
* 59b6ff3 Aloqa sahifasi
* cbdb8b0 Bosh sahifa matni
* 648fdf8 Sayt karkasi
```

Tarix ajralgan. Merge'dan oldingi savollar:

```text
$ git merge-base main iss53
59b6ff3dcae16c3d0426e175a694de87cdb0d43d
$ git merge-base --is-ancestor main iss53
$ echo $?
1
$ git rev-parse main iss53
36852c940f577415eabe9da3ce2c1b48085aa9a8
85ddfe476816c250596c427cf558083a8043f3c8
$ git count-objects
19 objects, 76 kilobytes
```

Merge base — `59b6ff3`, u `main` ham emas, `iss53` ham emas. `--is-ancestor` kodi `1` — "`main` `iss53`ning ajdodi emas". Fast-forward mumkin emas.

### Merge nimani olib kirishini oldindan ko'rish

Uch nuqtali `git diff A...B` — "merge base'dan B'gacha" farq ([19-bob](19-revision-tanlash.md)), ya'ni aynan merge B tomondan olib keladigan o'zgarishlar:

```text
$ git diff --stat main...iss53
 index.html | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
$ git diff --stat iss53...main
 aloqa.html | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

(`git diff main...iss53` = `git diff $(git merge-base main iss53) iss53`.) `iss53` faqat `index.html`ga, `main` esa faqat `aloqa.html`ga tekkan. Bir faylga ikki tomon tegmagan — konflikt bo'lmaydi.

### Merge

```text
$ git merge iss53
Merge made by the 'ort' strategy.
 index.html | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```

`Merge made by the 'ort' strategy.` — merge commit yaratildi, buni `ort` strategiyasi bajardi (Pro Git'da `'recursive'` deb yozilgan — farqi pastda). Interaktiv terminalda Git bu yerda merge commit xabari uchun tahrirlovchini ochadi — tayyor xabar `Merge branch 'iss53'`; uni o'zgartirmay yopsangiz yetarli (`--no-edit` tahrirlovchisiz qabul qiladi).

```text
$ git log --oneline --decorate --graph --all
*   be8cf0b (HEAD -> main) Merge branch 'iss53'
|\
| * 85ddfe4 (iss53) Footer tayyor [issue 53]
| * 2ccf6c0 Yangi footer [issue 53]
* | 36852c9 Email manzilini tuzatish
|/
* 59b6ff3 Aloqa sahifasi
* cbdb8b0 Bosh sahifa matni
* 648fdf8 Sayt karkasi
```

Endi ichkarida nima o'zgarganini birma-bir tekshiramiz.

**Ref'lar:**

```text
$ git rev-parse main iss53 ORIG_HEAD
be8cf0b4a9a47e66c7e3cdda136a280dac079abd
85ddfe476816c250596c427cf558083a8043f3c8
36852c940f577415eabe9da3ce2c1b48085aa9a8
```

`main` — yangi commit `be8cf0b`. `iss53` — joyida (`85ddfe4`): merge qo'shilayotgan branch'ga tegmaydi. `ORIG_HEAD` — merge'dan oldingi `main`.

**Obyektlar:**

```text
$ git count-objects
21 objects, 84 kilobytes
```

19 dan 21 ga — ikkita yangi obyekt: merge natijasining tree'si va merge commit. Yangi blob yo'q — nega, hozir ko'ramiz.

**Merge commit ichida:**

```text
$ git cat-file -p HEAD
tree 86073633ed25e3538bb575fd8826ec97cf853284
parent 36852c940f577415eabe9da3ce2c1b48085aa9a8
parent 85ddfe476816c250596c427cf558083a8043f3c8
author Ali Valiyev <ali@example.com> 1791349680 +0500
committer Ali Valiyev <ali@example.com> 1791349680 +0500

Merge branch 'iss53'
```

Ikkita `parent` qatori — merge commit'ni oddiy commit'dan ajratib turadigan yagona narsa. Tartib muhim:

- **birinchi ota** (`HEAD^1`, qisqasi `HEAD^`) — merge paytidagi joriy branch uchi (`36852c9`, eski `main`);
- **ikkinchi ota** (`HEAD^2`) — qo'shilgan branch uchi (`85ddfe4`, `iss53`).

```text
$ git rev-parse HEAD^1 HEAD^2
36852c940f577415eabe9da3ce2c1b48085aa9a8
85ddfe476816c250596c427cf558083a8043f3c8
```

`^1`/`^2` sintaksisi [19-bobda](19-revision-tanlash.md). `git show` merge commit uchun `Merge:` qatorida ikkala otaning qisqa hash'ini ko'rsatadi:

```text
$ git show --stat HEAD
commit be8cf0b4a9a47e66c7e3cdda136a280dac079abd
Merge: 36852c9 85ddfe4
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:08:00 2026 +0500

    Merge branch 'iss53'

 index.html | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)
```

**Merge tree'si qayerdan olindi:**

```text
$ git cat-file -p HEAD^{tree}
100644 blob 45b4819875eef2c9aa2b1aa1d0bd95adb25b2f8d	aloqa.html
100644 blob 013989e25369052b6c5611cba5c320412de886d8	index.html

$ git rev-parse HEAD:index.html iss53:index.html HEAD^1:index.html
013989e25369052b6c5611cba5c320412de886d8
013989e25369052b6c5611cba5c320412de886d8
3940e7be7235c59a655010c9a3388d16f924177f

$ git rev-parse HEAD:aloqa.html HEAD^1:aloqa.html iss53:aloqa.html
45b4819875eef2c9aa2b1aa1d0bd95adb25b2f8d
45b4819875eef2c9aa2b1aa1d0bd95adb25b2f8d
275bba380a3c4a77f8e8cd23916e6ba0de8d02dc
```

Mana uch tomonlama merge'ning mantig'i, obyektlar darajasida:

| Fayl | Merge base `59b6ff3` | `main` (ota 1) | `iss53` (ota 2) | Natija |
| --- | --- | --- | --- | --- |
| `index.html` | asl | asl (tegmagan) | o'zgargan `013989e` | `iss53`niki — `013989e` |
| `aloqa.html` | asl | o'zgargan `45b4819` | asl (tegmagan) | `main`niki — `45b4819` |

Har faylni faqat bitta tomon o'zgartirgan, shuning uchun Git o'sha tomonning **mavjud blob'ini** oldi. Yangi tree — shu ikki blob'ning yangi birikmasi. Mana nega yangi blob yaratilmadi.

**Reflog:**

```text
$ tail -1 .git/logs/refs/heads/main
36852c940f577415eabe9da3ce2c1b48085aa9a8 be8cf0b4a9a47e66c7e3cdda136a280dac079abd Ali Valiyev <ali@example.com> 1791349680 +0500	merge iss53: Merge made by the 'ort' strategy.
```

```text
                     36852c9 ──────────┐
                    /                   \
  648fdf8---cbdb8b0---59b6ff3            be8cf0b  ← main (HEAD)
                    \  (merge base)     /
                     2ccf6c0---85ddfe4 ┘  ← iss53
```

### Birinchi ota bo'ylab tarix

Ota tartibi tufayli "`main`da qadam-baqadam nima bo'lgan" degan savolga javob olish mumkin — faqat birinchi otalar zanjiri bo'ylab yurib:

```text
$ git log --oneline --first-parent
be8cf0b Merge branch 'iss53'
36852c9 Email manzilini tuzatish
59b6ff3 Aloqa sahifasi
cbdb8b0 Bosh sahifa matni
648fdf8 Sayt karkasi
```

`iss53`ning ichki commit'lari (`2ccf6c0`, `85ddfe4`) ko'rinmaydi — ular "bitta qadam" — merge commit sifatida ko'rinadi. Bu jamoalarda keng ishlatiladi: `main`ga har birlashtirish bitta yozuv bo'lib ko'rinadi.

`iss53` ham endi kerak emas (Pro Git ham shunday qiladi): `git branch -d iss53`. Uning commit'lari yo'qolmaydi — merge commit'ning ikkinchi otasi ular orqali o'tadi.

### Bir faylni ikki tomon o'zgartirsa

Yuqorida har faylni bitta tomon o'zgartirgan edi. Endi bir faylning **turli joylarini** ikki tomon o'zgartiradi: `sarlavha` branch'i 1-qatorni, `main` oxirgi qatorni.

```text
$ git switch -c sarlavha
$ git commit -am "Sarlavhani kengaytirish"
[sarlavha caa84a8] Sarlavhani kengaytirish
$ git switch main
$ echo "<p>Yangi kitoblar har dushanba</p>" >> index.html
$ git commit -am "Yangiliklar qatori"
[main e34e036] Yangiliklar qatori

$ git merge sarlavha
Auto-merging index.html
Merge made by the 'ort' strategy.
 index.html | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

`Auto-merging index.html` — Git bu faylni qatorma-qator uch tomonlama birlashtirdi va muvaffaqiyatli bo'ldi. Natija blob'i:

```text
$ git rev-parse HEAD:index.html HEAD^1:index.html HEAD^2:index.html
a832b19efbc1029ddfef41fc3a65a85f612aab58
92484de42b5383fbf88b2ab7bee4371cad213759
70657599c65bc245b6710676089d389d3e4d66f1

$ cat index.html
<h1>Kutubxona — onlayn</h1>
<p>Xush kelibsiz! Bu yerda kitob topasiz.</p>

<footer>Kutubxona, 2026 · aloqa.html</footer>
<p>Kitoblar katalogi</p>
<p>Biz bilan bog'laning</p>
<p>Yangi kitoblar har dushanba</p>
```

Uchta **har xil** hash: natija blob'i `a832b19` — hech bir otada yo'q, uni merge yangi yaratdi. Faylda ikkala o'zgarish ham bor. `diff HEAD^1 HEAD` — "merge `main`ga nimani olib kirdi":

```diff
$ git diff HEAD^1 HEAD
diff --git a/index.html b/index.html
index 92484de..a832b19 100644
--- a/index.html
+++ b/index.html
@@ -1,4 +1,4 @@
-<h1>Kutubxona</h1>
+<h1>Kutubxona — onlayn</h1>
 <p>Xush kelibsiz! Bu yerda kitob topasiz.</p>

 <footer>Kutubxona, 2026 · aloqa.html</footer>
```

Ikki tomon **bir joyni** har xil o'zgartirganda Git to'xtaydi — bu konflikt va u [22-bobning](22-konfliktlar.md) mavzusi. U yerda `MERGE_HEAD`, index bosqichlari va hal qilish yo'llari batafsil ko'riladi.

## Kod: "Already up to date."

Allaqachon qo'shilgan branch'ni qayta merge qilsak:

```text
$ git merge iss53
Already up to date.
$ git merge-base --is-ancestor iss53 main
$ echo $?
0
```

`git merge` hujjati (PRE-MERGE CHECKS): ko'rsatilgan commit'larning hammasi allaqachon `HEAD`ning ajdodi bo'lsa, buyruq hech narsa qilmay chiqadi. Hech qanday ref, obyekt yoki fayl o'zgarmaydi. Bu fast-forward'ning teskarisi: u yerda `HEAD` qo'shilayotgan commit'ning ajdodi edi, bu yerda — aksincha.

## Kod: `--ff-only` — faqat fast-forward, aks holda rad et

`--ff-only` bilan Git fast-forward mumkin bo'lsa qiladi, mumkin bo'lmasa **hech narsa qilmay**, nol bo'lmagan kod bilan chiqadi. `katalog` branch'ini ochib commit qilamiz, `main`da ham commit qilamiz — tarix ajraladi:

```text
$ git switch -c katalog
$ git commit -m "Katalog sahifasi"
[katalog 18d9cf4] Katalog sahifasi
$ git switch main
$ git commit -am "Ish vaqti"
[main e7ba129] Ish vaqti

$ git merge --ff-only katalog
hint: Diverging branches can't be fast-forwarded, you need to either:
hint:
hint: 	git merge --no-ff
hint:
hint: or:
hint:
hint: 	git rebase
hint:
hint: Disable this message with "git config set advice.diverging false"
fatal: Not possible to fast-forward, aborting.
$ echo $?
128
$ git rev-parse main
e7ba1291cdb9d8089797f03c112475752c73101d
```

`main` joyida, `.git`da `MERGE_HEAD` ham paydo bo'lmadi — merge umuman boshlanmadi. Maslahat ikki yo'lni taklif qiladi: merge commit bilan birlashtirish yoki `katalog`ni `main` ustiga qayta qurish ([24-bob](24-rebase.md), rebase).

Bu opsiya qachon kerak: "men bu yerda **o'z** commit'imni kutmayman, faqat yangilanish kerak" degan joyda. Masalan, lokal `main`ni serverdagi `main`ga tenglashtirish — u yerda kutilmagan merge commit paydo bo'lishi xato belgisi. Shuning uchun `git pull` hozir standart holatda (`pull.rebase` yoki `pull.ff` sozlanmagan bo'lsa) aynan `--ff-only` kabi ishlaydi ([27-bob](27-remote.md)).

### Branch'ni yangilab, keyin fast-forward

Keng tarqalgan usul: avval `main`ni `katalog`ga qo'shish (branch'ni yangilash), keyin `main`ni fast-forward qilish:

```text
$ git switch katalog
$ git merge main
Merge made by the 'ort' strategy.
 aloqa.html | 1 +
 1 file changed, 1 insertion(+)
$ git switch main
$ git merge-base --is-ancestor main katalog
$ echo $?
0
$ git merge --ff-only katalog
Updating e7ba129..8a783a8
Fast-forward
 katalog.html | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 katalog.html
```

Ishladi, lekin natijaga diqqat bilan qarang:

```text
$ git log --oneline --decorate --graph -5
*   8a783a8 (HEAD -> main, katalog) Merge branch 'main' into katalog
|\
| * e7ba129 Ish vaqti
* | 18d9cf4 Katalog sahifasi
|/
*   006ea37 Merge branch 'qidiruv'

$ git log --oneline --first-parent -4
8a783a8 Merge branch 'main' into katalog
18d9cf4 Katalog sahifasi
006ea37 Merge branch 'qidiruv'
26386c9 Merge branch 'sarlavha'
```

Merge commit `katalog`da yaratilgan, shuning uchun uning **birinchi otasi** — `katalog` (`18d9cf4`), `main`ning o'z commit'i `Ish vaqti` esa ikkinchi otaga tushib qoldi. `--first-parent` bo'yicha `main` tarixi endi `katalog` orqali o'tadi. Xabar ham `Merge branch 'main' into katalog`. Mazmun to'g'ri, lekin "`main`ning birinchi otalar zanjiri — `main`da bo'lgan qadamlar" degan kelishuv buzildi. Bu muhim bo'lgan jamoalar `main`ga yo'nalishni saqlaydi: `git switch main && git merge katalog` (yoki rebase, [24-bob](24-rebase.md)).

## Kod: `--no-ff` — har doim merge commit

Teskari holat: fast-forward mumkin, lekin biz baribir merge commit xohlaymiz.

```text
$ git switch -c qidiruv
$ git commit -m "Qidiruv sahifasi"
[qidiruv 1dbba0e] Qidiruv sahifasi
$ git commit -am "Qidiruv tugmasi"
[qidiruv f7e3e60] Qidiruv tugmasi
$ git switch main

$ git merge --no-ff qidiruv
Merge made by the 'ort' strategy.
 qidiruv.html | 2 ++
 1 file changed, 2 insertions(+)
 create mode 100644 qidiruv.html
```

`main` `qidiruv`ning ajdodi edi — oddiy `git merge` bu yerda fast-forward qilardi. `--no-ff` ga ko'ra (hujjat: "har qanday holatda merge commit yarat") Git merge commit yozdi:

```text
$ git log --oneline --decorate --graph -4
*   006ea37 (HEAD -> main) Merge branch 'qidiruv'
|\
| * f7e3e60 (qidiruv) Qidiruv tugmasi
| * 1dbba0e Qidiruv sahifasi
|/
*   26386c9 Merge branch 'sarlavha'

$ git cat-file -p HEAD
tree 669ed4dacb618b01b1fe7b9a120604c7edc49801
parent 26386c98268ae8e79443575a52c6819482643bb6
parent f7e3e60b13183c0acf9eddeb13306d8294695da3
author Ali Valiyev <ali@example.com> 1791349980 +0500
committer Ali Valiyev <ali@example.com> 1791349980 +0500

Merge branch 'qidiruv'
```

Birinchi ota — merge'dan oldingi `main` (`26386c9`, `ORIG_HEAD` bilan bir xil), ikkinchisi — `qidiruv` uchi. Qiziq tafsilot — tree:

```text
$ git rev-parse HEAD^{tree} qidiruv^{tree}
669ed4dacb618b01b1fe7b9a120604c7edc49801
669ed4dacb618b01b1fe7b9a120604c7edc49801
```

Merge commit'ning snapshot'i `qidiruv` uchi bilan **aynan bir xil** — `main` tomonida yangi ish bo'lmagani uchun boshqacha bo'lishi ham mumkin emas edi. Ya'ni `--no-ff` fayllarga hech narsa qo'shmaydi, u faqat **tarixga** ma'lumot qo'shadi: "bu ikki commit bitta vazifa sifatida, shu paytda qo'shilgan".

```text
  fast-forward:   26386c9---1dbba0e---f7e3e60  ← main, qidiruv

  --no-ff:        26386c9-----------------006ea37  ← main
                         \               /
                          1dbba0e---f7e3e60  ← qidiruv
```

Foydasi: `git log --first-parent` da vazifa bitta qadam bo'lib turadi; vazifani butunlay qaytarish uchun bitta commit'ni `git revert -m 1` qilish yetarli ([26-bob](26-murakkab-merge.md)). Fast-forward'da esa "qaysi commit'lar shu vazifaga tegishli edi" degan ma'lumot yo'qoladi — `main` shunchaki boshqa commit'larga o'xshab ketadi.

## Kod: `--squash` — bitta oddiy commit

`--squash` ning hujjatdagi ta'rifi: working tree va index'ni **haqiqiy merge bo'lgandek** tayyorla, lekin commit qilma, `HEAD`ni siljitma va `MERGE_HEAD` yozma. Natijada keyingi `git commit` merge commit emas, **bitta otali oddiy commit** yaratadi — mazmuni butun branch merge qilingandek.

Uch commit'li `tema` branch'i va `main`da bitta commit:

```text
$ git switch -c tema
$ git commit -m "Tema: asosiy rang"
[tema 97e5c06] Tema: asosiy rang
$ git commit -am "Tema: havolalar"
[tema 2e10a9c] Tema: havolalar
$ git commit -am "Tema: sarlavha, tuzatish"
[tema ce2634b] Tema: sarlavha, tuzatish
$ git switch main
$ git commit -am "Dam olish kuni"
[main 2550421] Dam olish kuni
```

```text
$ git rev-parse HEAD
255042141e5fe54981c69053c3633a3311318ee2
$ git merge --squash tema
Automatic merge went well; stopped before committing as requested
Squash commit -- not updating HEAD
$ git rev-parse HEAD
255042141e5fe54981c69053c3633a3311318ee2
```

`HEAD` joyida. `.git`ga qaraymiz:

```text
$ ls .git
AUTO_MERGE
COMMIT_EDITMSG
HEAD
ORIG_HEAD
SQUASH_MSG
config
...
```

`MERGE_HEAD` **yo'q** — demak keyingi commit'ga ikkinchi ota qo'shilmaydi. O'rniga `SQUASH_MSG` — tayyor xabar loyihasi, unda qo'shilgan commit'lar ro'yxati:

```text
$ cat .git/SQUASH_MSG
Squashed commit of the following:

commit ce2634b37ba0980eb2351672bc8710ae69eb1560
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:20:00 2026 +0500

    Tema: sarlavha, tuzatish

commit 2e10a9c1196f79c33f70eef377ee8cd79ac2cc0c
...
    Tema: asosiy rang

$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   style.css
```

O'zgarishlar index'da, xuddi qo'lda `git add` qilgandek. Commit qilamiz (`-m`siz bo'lsa tahrirlovchida `SQUASH_MSG` ochiladi):

```text
$ git commit -m "Tema qo'shildi (squash)"
[main 84f3817] Tema qo'shildi (squash)
 1 file changed, 3 insertions(+)
 create mode 100644 style.css

$ git cat-file -p HEAD
tree c857a2aad6bcd6a267e2c25e16385b3c8902e323
parent 255042141e5fe54981c69053c3633a3311318ee2
author Ali Valiyev <ali@example.com> 1791350520 +0500
committer Ali Valiyev <ali@example.com> 1791350520 +0500

Tema qo'shildi (squash)
```

**Bitta** `parent`. Graf:

```text
$ git log --oneline --decorate --graph --all -6
* 84f3817 (HEAD -> main) Tema qo'shildi (squash)
* 2550421 Dam olish kuni
| * ce2634b (tema) Tema: sarlavha, tuzatish
| * 2e10a9c Tema: havolalar
| * 97e5c06 Tema: asosiy rang
|/
*   8a783a8 Merge branch 'main' into katalog
```

`tema` va `main` grafda **bog'lanmagan**: `84f3817` ning `tema`dan xabari yo'q. Mazmun bir xil, lekin Git uchun `tema` hali qo'shilmagan:

```text
$ git merge-base --is-ancestor tema main
$ echo $?
1
$ git branch -d tema
error: the branch 'tema' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D tema'
hint: Disable this message with "git config set advice.forceDeleteBranch false"
```

Shuning uchun squash'dan keyin branch `-D` bilan o'chiriladi ([23-bob](23-branch-boshqaruvi.md)). Agar uni yana `merge` qilsangiz, Git merge base sifatida eski ajralish nuqtasini oladi va o'sha o'zgarishlarni **qaytadan** birlashtiradi:

```text
$ git merge tema
Merge made by the 'ort' strategy.
$ git diff HEAD^1 HEAD --stat
$ git rev-parse HEAD^{tree} HEAD^1^{tree}
c857a2aad6bcd6a267e2c25e16385b3c8902e323
c857a2aad6bcd6a267e2c25e16385b3c8902e323
```

Bu safar o'zgarishlar aynan bir xil bo'lgani uchun konflikt chiqmadi — lekin **bo'sh** merge commit paydo bo'ldi (tree ota bilan bir xil). Agar squash'dan keyin `tema`da ham, `main`da ham o'sha fayllar o'zgargan bo'lsa, xuddi shu yerda konflikt chiqadi. Qoida: squash qilingan branch'ni tashlab yuboring, ustida ishlashni davom ettirmang.

Keraksiz merge commit'ni olib tashlaymiz. **Ogohlantirish:** `reset --hard` commit qilinmagan o'zgarishlarni o'chiradi ([39-bob](39-reset-sirlari.md)); bu yerda working tree toza edi:

```text
$ git reset --hard ORIG_HEAD
HEAD is now at 84f3817 Tema qo'shildi (squash)
$ git branch -D tema
Deleted branch tema (was ce2634b).
```

`--squash` bilan `--commit` birga ishlatilmaydi (hujjat: "fail" bo'ladi). GitHub'dagi "Squash and merge" tugmasi ham aynan shu natijani beradi ([35-bob](35-github-fork-va-pr.md)).

## Kod: `--no-commit`, `-m`, `--log`

**`--no-commit`** — merge'ni bajar, lekin commit'dan oldin to'xta: natijani tekshirish yoki xabarni o'zingiz yozish uchun.

```text
$ git merge --no-ff --no-commit izoh
Automatic merge went well; stopped before committing as requested
$ git rev-parse HEAD
84f38173f119991f757faaf3dc323f79c588cb20
$ cat .git/MERGE_HEAD
c667d5ce8416bef7e84e458c96fb3409d4ae9599
$ cat .git/MERGE_MSG
Merge branch 'izoh'
$ cat .git/MERGE_MODE
no-ff
$ git status
On branch main
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:
	new file:   izoh.html
```

`--squash` dan farqi: bu yerda `MERGE_HEAD` **bor**, ya'ni keyingi `git commit` ikki otali merge commit yaratadi. Holat konfliktdan keyingi holatga o'xshaydi (bu fayllar [22-bobda](22-konfliktlar.md) batafsil), faqat konflikt yo'q. Davom ettirish — `git commit`, voz kechish — `git merge --abort`.

Nozik joy: **fast-forward'ni `--no-commit` to'xtatmaydi**, chunki u commit yaratmaydi (hujjat). `main` `logo`ning ajdodi bo'lganda:

```text
$ git merge --no-commit logo
Updating 1fe7fea..e584bc6
Fast-forward
 logo.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 logo.txt
```

`main` darhol siljidi. Branch'ni o'zgartirmasdan oldin ko'rish kerak bo'lsa — `--no-ff --no-commit` birga.

Hujjat yana ogohlantiradi: `--no-commit`ni merge commit ichiga katta, aloqasiz o'zgarishlarni "yashirib" kiritish uchun ishlatmang. Versiya raqamini oshirish kabi mayda tuzatishlar — mumkin.

**`-m` va `--log`** — xabarni buyruq qatorida berish va unga qo'shilayotgan commit'larning qisqa ro'yxatini qo'shish:

```text
$ git merge --no-ff --log -m "Izohlar bo'limi" izoh
Merge made by the 'ort' strategy.
 izoh.html | 2 ++
 1 file changed, 2 insertions(+)
 create mode 100644 izoh.html

$ git log -1 --format=%B
Izohlar bo'limi

* izoh:
  Izoh formasi
  Izohlar sahifasi
```

`--log` ni doimiy qilish — `merge.log true` (ro'yxatda ko'pi bilan 20 commit; `merge.log 50` kabi son ham berish mumkin). `-e` (`--edit`) — `-m` bilan berilgan loyihani tahrirlovchida yana o'zgartirish. Eski skriptlarda tahrirlovchi ochilmasligi uchun `GIT_MERGE_AUTOEDIT=no` muhit o'zgaruvchisi bor.

Standart xabar `Merge branch 'iss53'` da "into main" yo'q, `katalog`ga merge'da esa `Merge branch 'main' into katalog` bo'ldi. Buni `merge.suppressDest` boshqaradi: ro'yxatdagi branch'larga merge'da "into ..." yozilmaydi. Hujjatda standart qiymat faqat `master` deb yozilgan, lekin 2.56 da sinov ko'rsatadi (va manba kodida ham shunday) — `main` uchun ham "into" qo'shilmaydi.

## Kod: octopus — ikkidan ortiq ota

`git merge`ga bir nechta commit bersangiz, Git ularning hammasini bitta merge commit bilan qo'shadi. Hujjat buni "erkalab" **octopus** (sakkizoyoq) merge deb ataydi.

```text
$ git merge-base --octopus main ru en uz
e584bc66ccc1e16307f0df6cd2f92ae98c922bcd
$ git rev-parse HEAD
e584bc66ccc1e16307f0df6cd2f92ae98c922bcd

$ git merge ru en uz
Fast-forwarding to: ru
Trying simple merge with en
Trying simple merge with uz
Merge made by the 'octopus' strategy.
 en.html | 1 +
 ru.html | 1 +
 uz.html | 1 +
 3 files changed, 3 insertions(+)
 create mode 100644 en.html
 create mode 100644 ru.html
 create mode 100644 uz.html

$ git cat-file -p HEAD
tree 09e7b16d10fdac0c9ec2d4f56e0ada18d323af64
parent f4c3628b7920d4761bee1cc79fa2c20ec9ad8955
parent 3341ae6e3d7f180d491919b461b4d6a23cfba9ca
parent d14e41419fb46c23f8194dfc41913bd864bfe75b
author Ali Valiyev <ali@example.com> 1791351120 +0500
committer Ali Valiyev <ali@example.com> 1791351120 +0500

Merge branches 'ru', 'en' and 'uz'
```

Uchta `parent`; `HEAD^3` — uchinchi ota (`uz`):

```text
$ git log --oneline --decorate --graph -5
*-.   5eadd1e (HEAD -> main) Merge branches 'ru', 'en' and 'uz'
|\ \
| | * d14e414 (uz) Ozbekcha sahifa
| * | 3341ae6 (en) Inglizcha sahifa
| |/
* / f4c3628 (ru) Ruscha sahifa
|/
* e584bc6 Logo
```

E'tibor bering: `Fast-forwarding to: ru`. `main` o'zida yangi commit bo'lmagani uchun `octopus` strategiyasi avval `ru`ga fast-forward qildi, shuning uchun **birinchi ota — `ru`**, eski `main` emas. `main`da o'z commit'i bo'lganda birinchi ota `main` bo'lardi.

Hujjat: bir nechta branch'da standart strategiya `octopus`; u murakkab, qo'lda hal qilinadigan merge'ni **rad etadi** — konflikt bo'lsa to'xtaydi. Mo'ljali — bir-biriga tegmaydigan mavzu branch'larini bir to'plamga yig'ish. Odatiy ishda octopus kam uchraydi.

## Kod: umumiy ajdodi yo'q tarixlar

Ikki mustaqil boshlangan tarixni (masalan, `--orphan` branch yoki boshqa loyiha, [20-bob](20-branch-bu-ref.md)) Git standart holatda birlashtirmaydi:

```text
$ git switch --orphan hujjat
$ git commit -m "Hujjat boshlanishi"
$ git switch main
$ git merge hujjat
fatal: refusing to merge unrelated histories
$ git merge-base main hujjat
$ echo $?
1
```

Merge base yo'q — uch tomonlama merge'ning uchinchi nuqtasi yo'q. Bu himoya: ko'pincha noto'g'ri repo yoki noto'g'ri branch'ni qo'shayotganingizni bildiradi. Ataylab qilinayotgan bo'lsa:

```text
$ git merge --allow-unrelated-histories hujjat
Merge made by the 'ort' strategy.
 HUJJAT.md | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 HUJJAT.md
```

Bunda Git bo'sh tree'ni asos sifatida oladi. Hujjat: bu juda kam uchraydigan holat, shuning uchun uni doimiy yoqadigan sozlama yo'q va qo'shilmaydi.

## Kod: `git merge-base` chuqurroq

`git merge-base` — merge ichidagi "umumiy ajdodni top" qadamini alohida bajaradigan plumbing buyrug'i ([13-bob](13-plumbing-va-porcelain.md)). Hujjat ta'rifi: umumiy ajdodlardan biri boshqasidan **yaxshiroq**, agar ikkinchisi birinchisining ajdodi bo'lsa. Yaxshirog'i yo'q umumiy ajdod — **eng yaxshi umumiy ajdod**, ya'ni merge base.

**`--is-ancestor`** — skriptlar uchun "fast-forward bo'ladimi?" savoli. Chiqish kodi: `0` — ha, `1` — yo'q, boshqa son — xato. Eski skriptlarda shu ish uzunroq yozilgan, uni tanib oling:

```bash
# eski usul
if test "$(git rev-parse A)" = "$(git merge-base A B)"; then ...; fi
# hozirgi usul
if git merge-base --is-ancestor A B; then ...; fi
```

**Bir nechta merge base: `--all`.** Ikki branch bir-birini "kesishib" merge qilgan bo'lsa (*criss-cross merge*), eng yaxshi ajdod ikkita bo'lishi mumkin:

```text
$ git log --oneline --decorate --graph --all
* 9b89724 (x) x2
*   aed2eac Merge branch 'm1' into x
|\
| | * 3b63331 (HEAD -> main) m2
| | * 391a63b Merge branch 'x1'
| |/|
| |/
|/|
* | 843fe10 (x1) x1
| * 6cd214f (m1) m1
|/
* 62c004a Asos

$ git merge-base main x
6cd214fc7dc4af70d0b355055a45aa7b572aae0b
$ git merge-base --all main x
6cd214fc7dc4af70d0b355055a45aa7b572aae0b
843fe100c8bbdfada4703c2d0349eb9a91e5ea26
```

`main` `x1`ni, `x` esa `m1`ni qo'shgan. Endi `m1` ham, `x1` ham ikkala branch'ning umumiy ajdodi va hech biri ikkinchisidan "yaxshiroq" emas. `--all`siz qaysi biri chiqishi aniqlanmagan (hujjat: *unspecified*). Merge paytida `ort` strategiyasi bunday holatda ikkala asosni avval o'zaro birlashtirib, "virtual" asos tree'si yasaydi va shu bilan uch tomonlama merge qiladi (`merge-strategies` hujjati):

```text
$ git merge x
Merge made by the 'ort' strategy.
 x.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

**`--independent`** — berilgan commit'lardan boshqalaridan yetib bo'lmaydiganlarini qoldiradi ("qaysilari haqiqiy uchlar"):

```text
$ git merge-base --independent main x x1 m1
3b63331c8239ffffbc8e827083e1fa1521dfff41
9b897241a2d8ae9dfb2facf0d39cd7e451cb33f6
```

`x1` va `m1` tushib qoldi — ular `main` va `x`dan yetib boriladi.

**`--octopus`** — hamma berilgan commit'larning umumiy eng yaxshi ajdodi (octopus merge uchun, yuqorida ko'rdik). Diqqat: `--octopus`siz `git merge-base A B C` boshqa narsani hisoblaydi — A bilan "B va C'ning faraziy merge'i" orasidagi asosni.

**`--fork-point`** — branch boshqa branch'dan qayerda ajralganini o'sha branch'ning **reflog**'ini ham hisobga olib topadi (serverdagi branch qayta yozilgan holatlar uchun). U asosan rebase bilan ishlatiladi — [24-bobda](24-rebase.md).

## Muhandislik nuqtai nazari: qaysi usul qachon

| Usul | Tarixda nima qoladi | Qachon mos |
| --- | --- | --- |
| Fast-forward (standart, mumkin bo'lsa) | To'g'ri chiziq, merge izi yo'q | Lokal yangilanish, bitta kichik commit, "branch" vaqtinchalik ish joyi bo'lgan holatlar |
| `--ff-only` | To'g'ri chiziq yoki rad etish | O'z commit'ingiz bo'lmasligi kerak bo'lgan joy: lokal `main`ni serverga tenglash, CI skriptlari |
| `--no-ff` | Har vazifa — merge commit, ichki commit'lar ikkinchi ota ortida | Vazifa (feature) branch'larini `main`ga qo'shish, `--first-parent` tarixi va bitta `revert -m 1` kerak bo'lganda |
| Uch tomonlama merge (ajralganda avtomatik) | Merge commit | Ikkala tomonda ish bo'lganda — tarixni o'zgartirmasdan birlashtirishning yagona yo'li |
| `--squash` | Bitta oddiy commit, branch bilan aloqa yo'q | Branch'dagi oraliq commit'lar ("wip", "tuzatish") qadrsiz bo'lganda; branch keyin tashlab yuboriladi |

Hech biri "to'g'ri" yoki "noto'g'ri" emas — bu jamoa kelishuvi. Muhimi — izchillik. Jamoa kelishuvini sozlamaga aylantirish mumkin:

```bash
$ git config merge.ff false                    # hamma merge --no-ff kabi
$ git config merge.ff only                     # hamma merge --ff-only kabi
$ git config branch.main.mergeOptions "--no-ff"  # faqat main'ga merge qilganda
```

`merge.ff false` bilan oddiy `git merge` ham merge commit yaratadi:

```text
$ git config merge.ff false
$ git merge footer2
Merge made by the 'ort' strategy.
 index.html | 1 +
 1 file changed, 1 insertion(+)
```

Buyruq qatoridagi `--ff` sozlamani bekor qiladi. `git pull` uchun alohida `pull.ff` sozlamasi bor ([27-bob](27-remote.md)). Hujjatdagi yana bir nozik joy: tabiiy joyida (`refs/tags/`da) **turmagan** annotatsiyali tegni merge qilsangiz, standart `--ff` emas, `--no-ff` qo'llanadi — teg obyekti ma'lumoti merge commit'da saqlanishi uchun.

Rebase — tarixni chiziq qilib birlashtirishning boshqa yo'li — merge bilan solishtirish [24-bobda](24-rebase.md).

## Muhandislik nuqtai nazari: `ort` va Pro Git'dagi `recursive`

Pro Git (2-nashr) chiqishida `Merge made by the 'recursive' strategy.` deb yozilgan. Hozirgi chiqish — `'ort'`. Sababi (`merge-strategies` hujjati):

- `ort` ("Ostensibly Recursive's Twin") eski `recursive` o'rniga yozilgan va Git 2.34 dan beri bitta branch'ni merge qilishda standart strategiya;
- `recursive` 2.33 gacha standart edi; 2.50.0 dan boshlab `recursive` nomi shunchaki `ort`ning sinonimi.

Ya'ni `-s recursive` yozilgan eski maqola ham ishlaydi, lekin aslida `ort` ishlaydi. `ort` qayta nomlashlarni (*rename*) aniqlaydi, bir nechta merge base'ni yuqorida aytilgandek birlashtiradi. Boshqa strategiyalar (`ours`, `subtree`, `resolve`) va `-X ours/theirs` kabi opsiyalar — [26-bobda](26-murakkab-merge.md).

## Muhandislik nuqtai nazari: merge'ni orqaga qaytarish

Merge **hali push qilinmagan** bo'lsa, eng to'g'ridan-to'g'ri yo'l — branch'ni merge'dan oldingi joyga qaytarish. `ORIG_HEAD` aynan shu uchun:

```bash
$ git reset --hard ORIG_HEAD
```

Bu fast-forward'ni ham, merge commit'ni ham bekor qiladi — ikkalasida ham faqat branch ko'rsatkichi o'zgargan edi. **Ogohlantirish:** `--hard` commit qilinmagan o'zgarishlarni o'chiradi; `ORIG_HEAD`ni keyingi `reset`, `rebase` va boshqa merge ham qayta yozadi — merge'dan keyin darhol ishlating. Kechikkan bo'lsangiz, eski qiymat reflog'da (`git reflog main` — `main@{1}`), [42-bob](42-reflog-va-tiklash.md):

```text
$ git reflog -4 main
1f7ee25 main@{0}: merge hujjat: Merge made by the 'ort' strategy.
c0f1ce2 main@{1}: merge footer2: Merge made by the 'ort' strategy.
5eadd1e main@{2}: merge ru en uz: Merge made by the 'octopus' strategy.
e584bc6 main@{3}: merge logo: Fast-forward
```

Merge **allaqachon push qilingan** bo'lsa, tarixni qayta yozish boshqalarga zarar beradi — u holda `git revert -m 1 <merge>` ([26-bob](26-murakkab-merge.md)).

## Muhandislik nuqtai nazari: merge'ni boshqaradigan narsalar ro'yxati

Bob davomida ko'rgan "merge ichida nima o'zgaradi" xulosasi:

| Narsa | Fast-forward | Merge commit | `--squash` | `--no-commit` |
| --- | --- | --- | --- | --- |
| Joriy branch ref'i | Qo'shilgan commit'ga | Yangi merge commit'ga | O'zgarmaydi | O'zgarmaydi (commit'gacha) |
| Qo'shilgan branch ref'i | O'zgarmaydi | O'zgarmaydi | O'zgarmaydi | O'zgarmaydi |
| Yangi obyektlar | Yo'q | Commit + tree (+ yangi blob'lar) | Hali yo'q (commit'da: oddiy commit) | Hali yo'q |
| `ORIG_HEAD` | Yoziladi | Yoziladi | Yoziladi | Yoziladi |
| `MERGE_HEAD` | — | Faqat konfliktda, oxirida o'chadi | Yozilmaydi | Yoziladi |
| `SQUASH_MSG` | — | — | Yoziladi | — |
| Reflog | `merge X: Fast-forward` | `merge X: Merge made by ...` | Keyingi `commit:` yozuvi | Keyingi `commit (merge):` yozuvi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Noto'g'ri branch'da turib `git merge` qilish (`iss53`da turib `git merge main` o'rniga teskarisi) | Qabul qiluvchi branch noto'g'ri; birinchi ota va xabar teskari bo'ladi | Avval `git branch --show-current`; qabul qiluvchiga `switch`, keyin `merge <qo'shiladigan>` |
| Merge'dan keyin qo'shilgan branch ham siljiydi deb kutish | `merge` faqat joriy branch'ni o'zgartiradi | Ikkinchi branch'ni yangilash uchun unga o'tib alohida merge |
| `--no-commit` fast-forward'ni to'xtatadi deb o'ylash | Fast-forward commit yaratmaydi, branch darhol siljiydi | `--no-ff --no-commit` |
| Squash qilingan branch'da ishni davom ettirish va qayta merge qilish | Git branch'ni qo'shilmagan deb biladi; o'zgarishlar qayta birlashtiriladi, konflikt yoki bo'sh merge commit | Squash'dan keyin branch'ni `-D` bilan o'chirish, yangi ishni yangi branch'da |
| `refusing to merge unrelated histories` ni ko'r-ko'rona `--allow-unrelated-histories` bilan chetlash | Ko'pincha noto'g'ri repo/branch qo'shilayotgan bo'ladi | Avval `git log --oneline --graph --all` va remote'ni tekshiring |
| `main`ni feature'ga merge qilib, keyin `main`ni fast-forward qilish | `main`ning birinchi otalar tarixi feature orqali o'tadi | `main`da turib `git merge feature` |
| Push qilingan merge'ni `reset --hard ORIG_HEAD` bilan "o'chirish" | Boshqalardagi tarix bilan ajralish, majburiy push | `git revert -m 1 <merge>` ([26-bob](26-murakkab-merge.md)) |
| Saqlanmagan ish bilan merge boshlash | Konfliktda `--abort` uni tiklay olmasligi mumkin | Avval commit yoki `git stash` ([22-bob](22-konfliktlar.md)) |
| Skriptda `merge-base` natijasini solishtirib "fast-forward"ni tekshirish | Uzun va xatoga moyil | `git merge-base --is-ancestor A B` |

## Amaliyot

1. Pro Git ssenariysini takrorlang: `main`da 3 commit, `iss53` va `hotfix` branch'lari. `hotfix`ni merge qilishdan oldin va keyin `cat .git/refs/heads/main`, `git count-objects` va `cat .git/ORIG_HEAD` natijalarini yozib qo'ying. Nima o'zgardi, nima o'zgarmadi?
2. Merge'dan oldin `git merge-base --is-ancestor main <branch>; echo $?` bilan merge turi fast-forward bo'lishini oldindan ayting, keyin tekshiring.
3. `iss53`ni merge qiling. `git cat-file -p HEAD` dagi ikkala `parent`ni `HEAD^1` va `HEAD^2` bilan solishtiring. Har fayl uchun `git rev-parse HEAD:<fayl> HEAD^1:<fayl> HEAD^2:<fayl>` bilan blob qaysi tomondan olinganini aniqlang.
4. Bir faylning turli qatorlarini ikki branch'da o'zgartirib merge qiling. Natija blob'i ikkala otadagidan farq qilishini isbotlang. `git diff main...<branch>` merge'dan oldin nimani ko'rsatganini natija bilan solishtiring.
5. Bir xil holatda (`git branch` bilan nusxa olib) bir marta oddiy merge, bir marta `--no-ff` qiling. `git log --oneline --graph` va `git log --first-parent` ni solishtiring. `--no-ff` merge commit'ining tree'si qo'shilgan branch uchidagi tree bilan bir xilmi?
6. Uch commit'li branch'ni `--squash` bilan qo'shing. `ls .git` da qaysi fayl paydo bo'ldi va qaysi biri yo'q? Commit'dan keyin `git branch -d` nega rad etishini `merge-base --is-ancestor` bilan tushuntiring.
7. Uchta mustaqil branch yaratib octopus merge qiling. Ota'lar tartibi qanday? `main`da oldindan o'z commit'i bo'lganda tartib qanday o'zgaradi?
8. (Qiyinroq) Criss-cross tarix yarating (bobdagi `x`/`main` misoli). `git merge-base --all` ikki natija berishini ko'ring. Ikkala asos tarixda bir faylni har xil o'zgartiradigan qilib tuzing va `git merge` natijasini kuzating: `ort` virtual asos bilan qanday natija berdi? Shu tarixni `-s resolve` bilan merge qilib (`git reset --hard ORIG_HEAD` bilan qaytib) solishtiring.

## Rasmiy hujjat

- Pro Git — Basic Branching and Merging: <https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging>
- `git merge` (FAST-FORWARD MERGE, TRUE MERGE, `--ff`, `--no-ff`, `--ff-only`, `--squash`, `--no-commit`, `--log`): <https://git-scm.com/docs/git-merge>
- `git merge-base` (`--is-ancestor`, `--all`, `--independent`, `--octopus`, `--fork-point`): <https://git-scm.com/docs/git-merge-base>
- `git switch`: <https://git-scm.com/docs/git-switch>
- Merge strategiyalari (`ort`, `recursive`, `octopus`): <https://git-scm.com/docs/merge-strategies>
- `git fmt-merge-msg` (`merge.log`, `merge.suppressDest`): <https://git-scm.com/docs/git-fmt-merge-msg>
