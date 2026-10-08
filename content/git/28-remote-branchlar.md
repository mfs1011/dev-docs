# 28 — Remote branch'lar va kuzatish

[← Oldingi: Remote'lar](27-remote.md) · [Mundarija](README.md) · [Keyingi: `fetch` va `push` ichidan →](29-fetch-push-ichidan.md)

## Tushuncha

[27-bobda](27-remote.md) remote'ni qo'shdik, `fetch`, `pull`, `push` qildik va bir necha marta `origin/main` degan nomni ishlatdik. Bu bob shu nomning ortida nima turganini ochadi.

Uch xil "branch" bor va ularni chalkashtirmaslik kerak:

| Nima | Qayerda | Misol | Kim suradi |
| --- | --- | --- | --- |
| **Lokal branch** | `refs/heads/` | `main`, `qidiruv` | Siz (`commit`, `merge`, `reset`) |
| **Remote'dagi branch** | Server repo'sining `refs/heads/` | serverdagi `main` | Server'ga `push` qilganlar |
| **Remote-tracking branch** | Sizdagi `refs/remotes/<remote>/` | `origin/main` | Faqat Git — `fetch`, `push` paytida |

**Remote-tracking branch** — remote'dagi branch oxirgi marta qayerda turganini eslab qoluvchi lokal ref. Pro Git o'xshatishi: bu **xatcho'p** (bookmark) — "oxirgi marta server bilan gaplashganimda, uning `main`i shu commit'da edi". Siz uni o'zingiz sura olmaysiz; Git uni har tarmoq aloqasida (fetch, push) yangilaydi. Server bilan aloqa bo'lmasa, `origin/main` joyidan qimirlamaydi — hatto serverda yangi commit'lar paydo bo'lsa ham.

Ikkinchi tushuncha — **kuzatish** (*tracking*). Lokal branch remote-tracking branch bilan bog'langan bo'lsa, u **tracking branch** deyiladi, bog'langan branch esa uning **upstream**'i. Bog'liqlik ikki narsa beradi:

1. argumentsiz `git pull` va `git push` qayerga borishni biladi;
2. `git status` va `git branch -vv` "siz serverdan qancha oldinda yoki orqadasiz" (**ahead/behind**) deb aytadi.

Bu bog'liqlik hech qanday sehr emas — `.git/config` dagi ikki qator. Bob davomida har amalni `.git` ichidagi haqiqiy fayllar bilan kuzatamiz.

## Nega shunday: nega Git serverdagi holatni lokal nusxada saqlaydi

Savol tug'iladi: `origin/main` nima uchun kerak? Serverga har safar ulanib, `main` qayerdaligini so'rash mumkin edi-ku (`git ls-remote` aynan shunday qiladi).

Uch sabab bor:

- **Oflayn ishlash.** Git taqsimlangan ([1-bob](01-versiya-nazorati.md)): poyezdda, internetsiz ham `git log main..origin/main`, `git diff origin/main` ishlaydi. Buning uchun server holatining lokal nusxasi kerak.
- **Tezlik.** `git status` har chaqirilganda tarmoqqa chiqsa, sekin bo'lardi. U faqat lokal ref'larni solishtiradi.
- **Xavfsizlik va nazorat.** `fetch` faqat `refs/remotes/` ni yangilaydi, sizning `refs/heads/` ingizga tegmaydi ([27-bob](27-remote.md)). Siz nima kelganini ko'rib, keyin qaror qilasiz.

Narxi — **eskirish** (*staleness*). `origin/main` — oxirgi aloqa paytidagi surat. Pro Git alohida ta'kidlaydi: `git branch -vv` dagi ahead/behind raqamlari "faqat oxirgi fetch'dan beri" to'g'ri; bu buyruq serverga ulanmaydi. Bu bobda buni amalda ko'ramiz — `git status` "up to date" deydi, aslida esa serverda yangi commit bor.

## Kod: tajriba maydoni

[27-bobdagi](27-remote.md) uslub davom etadi: bitta bare "server" va ikki dasturchi.

```text
28-remote-branchlar/
├── server.git/   ← bare repo
├── ali/          ← git init + remote add + push -u
└── vali/         ← git clone
```

```bash
$ git init --bare server.git
$ git init ali && cd ali
$ echo "# Kutubxona" > README.md
$ git add . && git commit -m "Boshlang'ich commit"
$ git remote add origin ../server.git
$ git push -u origin main
To ../server.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
$ cd ..
$ git clone server.git vali
Cloning into 'vali'...
done.
```

(Vali o'z ismini sozlaydi va URL'ni nisbiy qiladi — [27-bobdagi](27-remote.md) kabi.)

## Kod: `refs/remotes/origin/*` — `.git` ichida

Vali endigina klonladi. Uning ref'lari:

```bash
$ find .git/refs -type f | sort
.git/refs/heads/main
.git/refs/remotes/origin/HEAD
```

`origin/main` qani? `clone` ref'larni bitta faylga — `packed-refs` ga yozgan ([17-bob](17-reflar-va-head.md)):

```bash
$ cat .git/packed-refs
# pack-refs with: peeled fully-peeled sorted
3c8955c614a4425231ef8cd867c61e8aed0e2a74 refs/remotes/origin/main
```

Remote-tracking branch — oddiy ref, faqat boshqa nomlar maydonida. Lokal `main` — `refs/heads/main`, serverdagi `main`ning nusxasi — `refs/remotes/origin/main`. Ikkalasi ham 40 belgili hash saqlaydigan ref; ularni ajratib turadigan yagona narsa — papka.

`origin/HEAD` — boshqa tur, **symbolic ref**:

```bash
$ cat .git/refs/remotes/origin/HEAD
ref: refs/remotes/origin/main
```

U remote'ning "standart branch"ini ko'rsatadi. Shuning uchun `origin` ning o'zini yozsangiz, Git uni `origin/HEAD` → `origin/main` deb tushunadi ([19-bob](19-revision-tanlash.md)): `git log origin` = `git log origin/main`. Bu ref qanday paydo bo'lishi va yangilanishi — pastda, `fetch.followRemoteHEAD` bo'limida.

`git branch` uchun bayroqlar:

```bash
$ git branch -vv
* main 3c8955c [origin/main] Boshlang'ich commit
$ git branch -avv
* main                3c8955c [origin/main] Boshlang'ich commit
  remotes/origin/HEAD -> origin/main
  remotes/origin/main 3c8955c Boshlang'ich commit
```

`-r` — faqat remote-tracking branch'lar, `-a` — hammasi. `-vv` dagi kvadrat qavs `[origin/main]` — shu branch'ning upstream'i.

### Remote-tracking branch'ni "sura olmaysiz"

Unga o'tishga urinib ko'ring:

```bash
$ git switch origin/main
fatal: a branch is expected, got remote branch 'origin/main'
hint: If you want to detach HEAD at the commit, try again with the --detach option.
$ git switch --detach origin/main
HEAD is now at 2f8b68c README tuzatish
$ cat .git/HEAD
2f8b68c5f1518c3dd631b89b8360e0ac971e1ec9
```

`HEAD` branch'ga emas, to'g'ridan-to'g'ri commit'ga ko'rsatadi — **detached HEAD** ([20-bob](20-branch-bu-ref.md)). Bu yerda commit qilsangiz, `origin/main` baribir surilmaydi. Remote-tracking branch'da ishlash uchun undan **lokal** branch ochiladi (pastda).

(Bu chiqish bob oxiridagi holatdan olingan, shuning uchun hash boshqacha.)

## Kod: tracking config — `branch.<nom>.remote` va `branch.<nom>.merge`

Valining `.git/config`:

```ini
[remote "origin"]
	url = ../server.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main
```

Upstream aynan shu ikki qatordan iborat:

| Kalit | Ma'nosi (v2.56 `config/branch`) |
| --- | --- |
| `branch.main.remote = origin` | `main`da turganda `fetch` va `push` qaysi remote bilan ishlaydi |
| `branch.main.merge = refs/heads/main` | Remote'ning **qaysi branch'i** upstream (remote tomonidagi nom!) |

E'tibor bering: `merge` qiymati `refs/remotes/origin/main` emas, `refs/heads/main` — ya'ni **serverdagi** ref nomi. Git uni `remote.origin.fetch` refspec'i orqali lokal `refs/remotes/origin/main` ga "tarjima qiladi" ([29-bob](29-fetch-push-ichidan.md)). Natija:

```bash
$ git rev-parse --symbolic-full-name @{u}
refs/remotes/origin/main
$ git rev-parse --abbrev-ref @{u}
origin/main
```

`@{upstream}` (qisqa — `@{u}`) — "joriy branch'ning upstream'i"; `main@{u}` — `main`niki ([19-bob](19-revision-tanlash.md)). Pro Git maslahati: `git merge origin/main` o'rniga `git merge @{u}` yozish mumkin.

### `FETCH_HEAD` endi "merge uchun" belgilaydi

[27-bobda](27-remote.md) Alining `FETCH_HEAD` ida `not-for-merge` bor edi — upstream yo'q edi. Upstream bo'lsa, `fetch` uni birlashtirish nomzodi deb belgilaydi (Vali, bir nechta branch'li holatda):

```bash
$ cat .git/FETCH_HEAD
2f8b68c5f1518c3dd631b89b8360e0ac971e1ec9		branch 'main' of ../server
d9c264187f941990795d6593af25940125593996	not-for-merge	branch 'bosh-sahifa' of ../server
2f8b68c5f1518c3dd631b89b8360e0ac971e1ec9	not-for-merge	branch 'umumiy' of ../server
```

Birinchi qatorda ikkinchi ustun bo'sh — bu `branch.main.merge` ga mos ref. `git pull` aynan shu qatorni birlashtiradi. Ma'lumotnoma: `branch.<nom>.merge` bir necha marta yozilsa, `pull` octopus merge qiladi ([26-bob](26-murakkab-merge.md)).

## Kod: yangi branch'ni push qilish — `push.autoSetupRemote`

Vali `qidiruv` branch'ini ochadi. [27-bobda](27-remote.md) ko'rdik: upstream yo'q branch'da argumentsiz `git push` `fatal: The current branch ... has no upstream branch` deydi va `push.autoSetupRemote` ni eslatadi. Yoqamiz:

```bash
$ git switch -c qidiruv
$ echo "qidiruv moduli" > qidiruv.txt && git add . && git commit -m "Qidiruv moduli"
$ git config push.autoSetupRemote true
$ git push
To ../server.git
 * [new branch]      qidiruv -> qidiruv
branch 'qidiruv' set up to track 'origin/qidiruv'.
```

Bitta `git push` uch ish qildi:

1. Serverda `refs/heads/qidiruv` yaratdi;
2. Lokal `refs/remotes/origin/qidiruv` yaratdi (push muvaffaqiyatli — demak server holati ma'lum);
3. Config'ga upstream yozdi:

```bash
$ sed -n '/branch "qidiruv"/,$p' .git/config
[branch "qidiruv"]
	remote = origin
	merge = refs/heads/qidiruv
$ cat .git/refs/remotes/origin/qidiruv
8a9b94b2c62929202337a49f23e647d8e92752f1
```

Ma'lumotnoma (`push.autoSetupRemote`): `true` bo'lsa, joriy branch'ning upstream'i yo'q bo'lganda argumentsiz push `--set-upstream` berilgandek ishlaydi; `push.default` `simple`, `upstream` yoki `current` bo'lganda ta'sir qiladi. Bu — hamma branch'lar serverda bir xil nomda bo'ladigan oddiy markazlashgan workflow uchun. Sozlamasiz ekvivalenti — `git push -u origin qidiruv` (`-u` = `--set-upstream`).

## Kod: remote branch'dan lokal branch ochish

Ali `fetch` qiladi:

```bash
$ find .git/refs/remotes -type f | sort
.git/refs/remotes/origin/main
$ git fetch
From ../server
 * [new branch]      qidiruv    -> origin/qidiruv
$ find .git/refs/remotes -type f | sort
.git/refs/remotes/origin/HEAD
.git/refs/remotes/origin/main
.git/refs/remotes/origin/qidiruv
```

Ikki yangi fayl. `origin/qidiruv` — kutilgan. `origin/HEAD` esa Alida avval yo'q edi (u klonlamagan) — uni `fetch` o'zi yaratdi. Bu [27-bobda](27-remote.md) va'da qilingan `fetch.followRemoteHEAD` ning standart xatti-harakati; pastda batafsil.

Pro Git muhim nuqtani ta'kidlaydi: `fetch` yangi remote-tracking branch olib kelganda, sizda **tahrirlanadigan lokal nusxa paydo bo'lmaydi** — faqat qimirlatib bo'lmaydigan `origin/qidiruv` ko'rsatkichi. Ishni birlashtirish — `git merge origin/qidiruv`; ustida ishlash — lokal branch ochish. Bir necha yo'li bor:

```bash
$ git switch qidiruv
Switched to a new branch 'qidiruv'
branch 'qidiruv' set up to track 'origin/qidiruv'.
```

Lokal `qidiruv` yo'q edi, lekin Git uni yaratdi. Bu — **taxmin** (`--guess`, standart yoqilgan): nom mavjud bo'lmasa va **aynan bitta** remote'da shu nomli branch bo'lsa, Git `git switch -c qidiruv --track origin/qidiruv` qiladi. Taxminni o'chirsangiz:

```bash
$ git switch --no-guess qidiruv
fatal: invalid reference: qidiruv
```

Boshqa yo'llar:

```bash
$ git switch -c sf origin/qidiruv          # boshqa nom bilan
Switched to a new branch 'sf'
branch 'sf' set up to track 'origin/qidiruv'.

$ git switch --track origin/qidiruv        # nom remote'dan olinadi
Switched to a new branch 'qidiruv'
branch 'qidiruv' set up to track 'origin/qidiruv'.

$ git branch tajriba origin/qidiruv        # o'tmasdan yaratish
branch 'tajriba' set up to track 'origin/qidiruv'.

$ git branch --no-track tajriba2 origin/qidiruv
$ git branch -vv
* main     3c8955c [origin/main] Boshlang'ich commit
  tajriba  8a9b94b [origin/qidiruv] Qidiruv moduli
  tajriba2 8a9b94b Qidiruv moduli
```

`tajriba2` — upstream'siz. Nega `tajriba` ga `--track` yozmasak ham upstream belgilandi? `branch.autoSetupMerge` sozlamasi tufayli (standart `true`): boshlang'ich nuqta remote-tracking branch bo'lsa, upstream avtomatik belgilanadi.

> **Pro Git bilan farq.** Pro Git `git checkout -b serverfix origin/serverfix` ni ko'rsatadi va chiqish `Branch serverfix set up to track remote branch serverfix from origin.` Hozirgi Git'da tavsiya — `git switch` ([20-bob](20-branch-bu-ref.md)), chiqish esa `branch 'qidiruv' set up to track 'origin/qidiruv'.` `checkout` ning eski shakllari ham ishlaydi.

### Bir xil nom ikki remote'da bo'lsa

Alining `origin` va `fork` remote'larida `umumiy` branch'i bor (bu holat bob oxirida tuziladi):

```bash
$ git switch umumiy
hint: Branch name 'umumiy' appears in multiple remotes:
hint:   origin
hint:   fork
hint: If you meant to check out a remote tracking branch on <remote>,
hint: you can do so by fully qualifying the name with the --track option:
hint:
hint:     git switch --track <remote>/umumiy
hint:
hint: If you'd like to always have checkouts of an ambiguous name prefer
hint: one remote, e.g. the 'origin' remote, consider setting
hint: checkout.defaultRemote=origin in your config.
fatal: 'umumiy' matched multiple (2) remote tracking branches

$ git -c checkout.defaultRemote=origin switch umumiy
Switched to a new branch 'umumiy'
branch 'umumiy' set up to track 'origin/umumiy'.
```

Taxmin faqat bir ma'noli bo'lganda ishlaydi. `checkout.defaultRemote` — ziddiyatda qaysi remote ustun.

## Kod: upstream'ni o'zgartirish — `-u`, `--set-upstream-to`, `--unset-upstream`

Mavjud branch'ga upstream belgilash yoki uni almashtirish — `git branch -u` (`--set-upstream-to`):

```bash
$ git branch --unset-upstream tajriba
$ git branch -u origin/qidiruv tajriba2
branch 'tajriba2' set up to track 'origin/qidiruv'.
$ git branch --set-upstream-to=main tajriba
branch 'tajriba' set up to track 'main'.
$ git branch -vv
* main     3c8955c [origin/main] Boshlang'ich commit
  tajriba  8a9b94b [main: ahead 1] Qidiruv moduli
  tajriba2 8a9b94b [origin/qidiruv] Qidiruv moduli
```

`--unset-upstream` config'dagi `[branch "tajriba"]` bo'limini olib tashladi. `tajriba` ning yangi upstream'i — **lokal** `main`. Config'da bu qanday ko'rinadi:

```ini
[branch "tajriba"]
	remote = .
	merge = refs/heads/main
```

`remote = .` — "joriy repo'ning o'zi" (ma'lumotnoma: *dot-repository*). Ya'ni upstream lokal branch ham bo'lishi mumkin; ahead/behind va `git pull` ular bilan ham ishlaydi.

Branch nomi berilmasa, `-u` joriy branch'ga qo'llanadi: `git branch -u origin/qidiruv`. Mavjud bo'lmagan upstream'ni belgilab bo'lmaydi:

```bash
$ git branch -u origin/nimadir
fatal: the requested upstream branch 'origin/nimadir' does not exist
hint:
hint: If you are planning on basing your work on an upstream
hint: branch that already exists at the remote, you may need to
hint: run "git fetch" to retrieve it.
hint:
hint: If you are planning to push out a new local branch that
hint: will track its remote counterpart, you may want to use
hint: "git push -u" to set the upstream config as you push.
...
```

Eski `git branch --set-upstream` (oxirida `-to` siz) — ma'lumotnoma bo'yicha "sintaksisi chalkash bo'lgani uchun endi qo'llab-quvvatlanmaydi". Eski maqolalarda uchrasa, `--set-upstream-to` yoki `--track` ishlating.

### Yangi branch'larda upstream qanday tanlanadi

`branch.autoSetupMerge` (va `--track[=direct|inherit]`) — `git branch`, `git switch -c`, `git checkout -b` yangi branch'ga upstream belgilashi qoidasi:

| Qiymat | Qachon upstream belgilanadi |
| --- | --- |
| `true` (standart) | Boshlang'ich nuqta remote-tracking branch bo'lsa (`--track=direct`) |
| `false` | Hech qachon (`--no-track`) |
| `always` | Boshlang'ich nuqta lokal yoki remote-tracking branch bo'lsa |
| `inherit` | Boshlang'ich nuqtaning upstream'i nusxalanadi (`--track=inherit`) |
| `simple` | Faqat remote-tracking branch'dan **va** nomlari bir xil bo'lsa |

Sinovda:

```bash
$ git branch --track=inherit r2 bs            # bs ning upstream'i origin/bosh-sahifa
branch 'r2' set up to track 'origin/bosh-sahifa'.

$ git -c branch.autoSetupMerge=simple branch r3 origin/main    # nom boshqa → upstream yo'q
$ git branch -vv | grep r3
  r3      2f8b68c README tuzatish

$ git branch --track r4 main
branch 'r4' set up to track 'main'.

$ git -c branch.autoSetupRebase=always branch r1 origin/main
branch 'r1' set up to track 'origin/main' by rebasing.
```

`branch.autoSetupRebase` (`never` standart, `local`, `remote`, `always`) — yangi tracking branch'ga `branch.<nom>.rebase = true` ham yozadi, ya'ni `git pull` u yerda rebase qiladi ([27-bob](27-remote.md)dagi `pull.rebase` ning bitta branch uchun shakli):

```ini
[branch "r1"]
	remote = origin
	merge = refs/heads/main
	rebase = true
```

## Kod: ahead va behind

Endi asosiy foyda — "men serverdan qanchalik farq qilaman". Vali `main`ga commit qilib push qiladi, Ali esa o'z `main`ida ikkita commit qiladi:

```bash
$ # vali:
$ git push
To ../server.git
   3c8955c..d9c2641  main -> main
```

Ali hali `fetch` qilmagan:

```bash
$ git status
On branch main
Your branch is ahead of 'origin/main' by 2 commits.
  (use "git push" to publish your local commits)
```

Bu **yarim haqiqat**: Ali'da push qilinmagan 2 commit bor — to'g'ri, lekin serverda yangi commit borligini `status` bilmaydi. U faqat lokal `refs/remotes/origin/main` bilan solishtirdi, u esa eskirgan. `fetch` dan keyin:

```bash
$ git fetch
From ../server
   3c8955c..d9c2641  main       -> origin/main
$ git status
On branch main
Your branch and 'origin/main' have diverged,
and have 2 and 1 different commits each, respectively.
  (use "git pull" if you want to integrate the remote branch with yours)
```

Qisqa shakllar:

```bash
$ git status -sb
## main...origin/main [ahead 2, behind 1]
$ git branch -vv
* main bc6e608 [origin/main: ahead 2, behind 1] Litsenziya
```

- **ahead N** — sizda bor, upstream'da yo'q N commit (push qilinmagan);
- **behind M** — upstream'da bor, sizda yo'q M commit (hali birlashtirilmagan).

Bu raqamlar qayerdan keladi? Ular [19-bobdagi](19-revision-tanlash.md) uch nuqta oralig'i:

```bash
$ git rev-list --left-right --count main...origin/main
2	1
$ git rev-list --left-right --count @...@{u}
2	1
$ git log --oneline --left-right main...origin/main
< bc6e608 Litsenziya
< a370af1 Muallif
> d9c2641 Kitoblar ro'yxati
```

`main...origin/main` — ikkalasidan birida bor, lekin ikkalasida emas; `<` — chap (ahead), `>` — o'ng (behind). Git har `status` da shu hisobni lokal ref'lar ustida bajaradi. Skriptlar uchun — `for-each-ref`:

```bash
$ git for-each-ref --format='%(refname:short) %(upstream:short) %(upstream:track) %(upstream:trackshort)' refs/heads
main origin/main [ahead 2, behind 1] <>
```

`%(upstream:trackshort)` belgilari: `>` — faqat ahead, `<` — faqat behind, `<>` — ikkalasi, `=` — teng.

| Holat | `git status` | Nima qilish kerak |
| --- | --- | --- |
| Teng | `Your branch is up to date with 'origin/main'.` | Hech narsa (yoki avval `fetch`) |
| Ahead | `ahead of 'origin/main' by N commits` | `git push` |
| Behind | `behind 'origin/main' by M commits, and can be fast-forwarded` | `git pull` (fast-forward) |
| Diverged | `have N and M different commits each` | `git pull --rebase` yoki merge ([27-bob](27-remote.md)) |
| Upstream o'chgan | `based on 'origin/x', but the upstream is gone` | `--unset-upstream` yoki branch'ni o'chirish (pastda) |

Pro Git qoidasi: aniq raqamlar uchun avval hamma remote'dan olib keling — `git fetch --all; git branch -vv`.

Ali sinxronlanadi:

```bash
$ git pull --rebase
$ git push
To ../server.git
   d9c2641..46c3f9b  main -> main
```

### Remote-tracking branch'ning ham reflog'i bor

Non-bare repo'da `core.logAllRefUpdates` standart yoqilgan, shuning uchun `refs/remotes/` dagi har siljish ham yoziladi ([42-bob](42-reflog-va-tiklash.md)). Vali:

```bash
$ git reflog origin/main
2f8b68c refs/remotes/origin/main@{0}: fetch -q: fast-forward
d9c2641 refs/remotes/origin/main@{1}: update by push
$ ls .git/logs/refs/remotes/origin/
HEAD
bosh-sahifa
main
umumiy
```

"`fetch` dan oldin `origin/main` qayerda edi?" — `origin/main@{1}`. Masalan, `git log origin/main@{1}..origin/main` — oxirgi `fetch` nima olib kelgani. (Bu yerda reflog `clone` paytidan emas, birinchi push'dan boshlangan: `clone` ref'ni `packed-refs` ga yozganda reflog yozuvi qoldirmagan.)

## Kod: remote branch'ni o'chirish

`qidiruv` ishi tugadi. Vali uni serverdan o'chiradi:

```bash
$ git push origin --delete qidiruv
To ../server.git
 - [deleted]         qidiruv
```

`-` belgisi — o'chirildi. `--delete` (`-d`) ma'lumotnoma bo'yicha "ref oldiga ikki nuqta qo'yish" bilan bir xil — eski yozuv `git push origin :qidiruv` (refspec'ning bo'sh chap tomoni — "hech narsani `qidiruv` ga yoz", [29-bob](29-fetch-push-ichidan.md)). Pro Git: bu faqat serverdagi **ko'rsatkichni** o'chiradi; obyektlar `gc` ishlaguncha serverda qoladi:

```bash
$ git -C server.git cat-file -t 8a9b94b
commit
```

Valining o'zida push o'zi `origin/qidiruv` ni ham o'chirdi, lekin lokal `qidiruv` qoldi:

```bash
$ git branch -vv
* main    d9c2641 [origin/main] Kitoblar ro'yxati
  qidiruv 8a9b94b [origin/qidiruv: gone] Qidiruv moduli
$ find .git/refs/remotes -type f
.git/refs/remotes/origin/HEAD
.git/refs/remotes/origin/main
```

`gone` — config'da upstream yozilgan, lekin unga mos remote-tracking ref yo'q.

### Boshqalarda: "stale" ref'lar va `--prune`

Ali'da esa `origin/qidiruv` hali bor — va oddiy `fetch` uni **o'chirmaydi**:

```bash
$ git fetch
$ git branch -vv
* main    46c3f9b [origin/main] Litsenziya
  qidiruv 8a9b94b [origin/qidiruv] Qidiruv moduli
```

Ma'lumotnoma (git-fetch, PRUNING) buni Git'ning umumiy tamoyili bilan izohlaydi: Git ma'lumotni aniq aytilmaguncha saqlaydi, bu remote'da o'chirilgan branch'larning lokal nusxalariga ham taalluqli. `git remote show` serverga ulanadi va farqni ko'radi:

```bash
$ git remote show origin
* remote origin
  Fetch URL: ../server.git
  Push  URL: ../server.git
  HEAD branch: main
  Remote branches:
    main                        tracked
    refs/remotes/origin/qidiruv stale (use 'git remote prune' to remove)
  Local branches configured for 'git pull':
    main    merges with remote main
    qidiruv merges with remote qidiruv
  Local ref configured for 'git push':
    main pushes to main (up to date)
```

**Stale** ("eskirgan") — serverda yo'q, sizda qolgan remote-tracking ref. Tozalash:

```bash
$ git fetch --prune
From ../server
 - [deleted]         (none)     -> origin/qidiruv
$ git branch -vv
* main    46c3f9b [origin/main] Litsenziya
  qidiruv 8a9b94b [origin/qidiruv: gone] Qidiruv moduli
$ git switch qidiruv
$ git status
On branch qidiruv
Your branch is based on 'origin/qidiruv', but the upstream is gone.
  (use "git branch --unset-upstream" to fixup)
```

`(none) -> origin/qidiruv` — "manba yo'q, lokal ref o'chirildi". Lokal `qidiruv` branch'ingiz **o'chirilmaydi** — prune faqat `refs/remotes/` ga tegadi. Undagi ish yo'qolmaydi.

Faqat tozalash, olib kelmasdan:

```bash
$ git remote prune --dry-run origin
Pruning origin
URL: ../server.git
 * [would prune] origin/vaqtincha2
$ git remote prune origin
Pruning origin
URL: ../server.git
 * [pruned] origin/vaqtincha2
```

Bitta remote-tracking ref'ni qo'lda o'chirish — `git branch -d -r origin/<nom>`. Ma'lumotnoma: bu faqat ref serverda ham yo'q bo'lsa yoki fetch uni qayta olib kelmaydigan qilib sozlangan bo'lsa ma'noli — aks holda keyingi `fetch` uni qaytaradi:

```bash
$ git branch -d -r origin/umumiy
Deleted remote-tracking branch origin/umumiy (was 2f8b68c).
$ git fetch
From ../server
 * [new branch]      umumiy     -> origin/umumiy
```

### `fetch.prune` — har safar avtomatik

```bash
$ git config fetch.prune true
```

Endi oddiy `git fetch` ham tozalaydi (`vaqtincha` serverda o'chirilgandan keyin):

```bash
$ git fetch
From ../server
 - [deleted]         (none)     -> origin/vaqtincha
```

Bitta remote uchun — `remote.<nom>.prune`. Ma'lumotnoma ehtiyotkorlikni so'raydi: prune branch'larni emas, **refspec'ga mos** ref'larni tozalaydi. Refspec'da `refs/tags/*:refs/tags/*` bo'lsa yoki `--prune-tags` (`fetch.pruneTags`) yoqilsa, remote'da yo'q **lokal teglaringiz ham** o'chadi — ular boshqa remote'dan kelgan bo'lsa ham ([12-bob](12-teglar-va-aliaslar.md)). `fetch.prune` ni global yoqish xavfsiz; `pruneTags` ni esa o'ylab yoqing.

### `git branch --delete-merged` (Git 2.56)

Prune `refs/remotes/` ni tozalaydi; lokal branch'lar to'planib qolaveradi. Git 2.56 yangi opsiya qo'shdi (reliz eslatmalari): upstream'iga allaqachon birlashtirilgan lokal branch'larni o'chirish.

Ali `origin/main` ni kuzatuvchi ikki topic branch ochadi; `tuzatish` dagi ish serverdagi `main`ga tushadi, `eski-ish` da yangi commit yo'q:

```bash
$ git switch -c tuzatish --track origin/main
$ # README.md tuzatildi
$ git commit -am "README tuzatish"
$ git push origin tuzatish:main
To ../server.git
   46c3f9b..2f8b68c  tuzatish -> main
$ git switch -c eski-ish --track origin/main
$ git switch main && git merge --ff-only origin/main

$ git branch -vv
  eski-ish 2f8b68c [origin/main] README tuzatish
* main     2f8b68c [origin/main] README tuzatish
  qidiruv  8a9b94b [origin/qidiruv: gone] Qidiruv moduli
  tuzatish 2f8b68c [origin/main] README tuzatish

$ git branch --dry-run --delete-merged origin/main
Would delete branch eski-ish (was 2f8b68c).
Would delete branch tuzatish (was 2f8b68c).
$ git branch --delete-merged origin/main
Deleted branch eski-ish (was 2f8b68c).
Deleted branch tuzatish (was 2f8b68c).
```

`main` o'chirilmadi, `qidiruv` ham. Ma'lumotnoma bo'yicha branch o'chirilmaydi, agar:

- uning upstream ref'i endi mavjud bo'lmasa (`qidiruv` — `gone`);
- u biror worktree'da checkout qilingan bo'lsa (`main`);
- uni `branch.<nom>.remote` ga push qilish aynan uning upstream'ini yangilasa — `pull` dan keyin "to'liq birlashgandek" ko'rinadigan branch'dan farqlab bo'lmaydi; ya'ni serverda **bir xil nomda** kuzatilayotgan branch'lar (masalan, `qidiruv` → `origin/qidiruv`) bu buyruq bilan o'chmaydi;
- u o'chirilmayotgan boshqa branch'ning lokal upstream'i bo'lsa;
- `branch.<nom>.deleteMerged = false` bo'lsa.

Ya'ni `--delete-merged` asosan "integratsiya branch'ini (`origin/main`) kuzatuvchi topic branch'lar" uchun. Pattern remote nomi (`origin` — uning `HEAD`i ko'rsatgan branch) yoki glob (`'origin/*'`) bo'lishi mumkin. Har doim avval `--dry-run`.

## Kod: `fetch.followRemoteHEAD` — `origin/HEAD` ni kuzatish (Git 2.56)

`refs/remotes/origin/HEAD` — remote'ning standart branch'iga symbolic ref. Uni `clone` yaratadi; Alida esa (`remote add` + `fetch`) uni `fetch` o'zi yaratdi. Serverdagi standart branch keyinroq o'zgarsa-chi (masalan, `master` → `main` ko'chishi)?

Serverda `dev` branch'ini yaratib, uni standart qilamiz (bare repo'da `HEAD` — oddiy fayl):

```bash
$ git -C server.git symbolic-ref HEAD refs/heads/dev
$ cat server.git/HEAD
ref: refs/heads/dev
$ git ls-remote --symref origin HEAD
ref: refs/heads/dev	HEAD
d9c264187f941990795d6593af25940125593996	HEAD
```

Ali `fetch` qiladi:

```bash
$ git fetch
From ../server
 * [new branch]      dev        -> origin/dev
$ cat .git/refs/remotes/origin/HEAD
ref: refs/remotes/origin/main
```

Lokal `origin/HEAD` o'zgarmadi va hech qanday xabar yo'q. Bu — standart `create` rejimi. Git 2.56 reliz eslatmalari: `fetch.followRemoteHEAD` sozlamasi qo'shildi — u har remote uchun mavjud `remote.<nom>.followRemoteHEAD` ga **umumiy standart** beradi. Qiymatlar (`config/fetch`):

| Qiymat | Xatti-harakat |
| --- | --- |
| `create` (standart) | Remote'da `HEAD` bor, lokalda yo'q bo'lsa — yaratadi. Mavjudiga tegmaydi |
| `warn` | Remote boshqa `HEAD` e'lon qilsa — ogohlantiradi. Lokal yo'q bo'lsa — `create` kabi |
| `always` | Remote yangi qiymat e'lon qilsa — jimgina yangilaydi |
| `never` | `remotes/<nom>/HEAD` ni hech qachon yaratmaydi va o'zgartirmaydi |

Faqat standart refspec bilan fetch qilinganda ishlaydi. `warn`:

```bash
$ git config fetch.followRemoteHEAD warn
$ git fetch
hint: Run 'git remote set-head origin dev' to follow the change, or modify
hint: either of the 'remote.origin.followRemoteHEAD' or 'fetch.followRemoteHEAD'
hint: configuration variables to handle the situation differently.
hint:
hint: Using this specific setting
hint:
hint:     git config set remote.origin.followRemoteHEAD warn-if-not-dev
hint:
hint: will suppress the warning until the remote changes HEAD to something else.
hint: Disable this message with "git config set advice.fetchRemoteHEADWarn false"
'HEAD' at 'origin' is 'dev', but we have 'main' locally.
```

Maslahatdagi `warn-if-not-<branch>` — faqat `remote.<nom>.followRemoteHEAD` da mavjud qo'shimcha qiymat: `warn` kabi, lekin remote'ning `HEAD`i aynan `<branch>` bo'lsa jim turadi. Ya'ni "remote `dev` ga o'tganini bilaman, men `main` da qolaman — yana o'zgarsa ayt":

```bash
$ git config remote.origin.followRemoteHEAD warn-if-not-dev
$ git fetch
$
```

Remote darajasidagi sozlama `fetch.followRemoteHEAD` dan ustun. `always`:

```bash
$ git config fetch.followRemoteHEAD always
$ git fetch
$ cat .git/refs/remotes/origin/HEAD
ref: refs/remotes/origin/dev
$ git branch -r
  origin/HEAD -> origin/dev
  origin/dev
  origin/main
```

Qo'lda boshqarish — `git remote set-head`:

```bash
$ git remote set-head origin main          # aniq belgilash
$ git remote set-head origin --auto        # remote'dan so'rab olish
'origin/HEAD' has changed from 'main' and now points to 'dev'
$ git remote set-head origin -d            # o'chirish
$ git -c fetch.followRemoteHEAD=never fetch
$ ls .git/refs/remotes/origin
dev
main
$ git fetch                                # standart create
$ cat .git/refs/remotes/origin/HEAD
ref: refs/remotes/origin/dev
```

`never` bilan `HEAD` yaratilmadi; keyingi oddiy `fetch` (`create`) uni yaratdi — endi `dev` ga, chunki serverning hozirgi standarti shu.

> **Pro Git bilan farq.** Pro Git `origin/HEAD` ni faqat `clone` yaratadi deb biladi va `fetch` ning bunday xatti-harakatini tilga olmaydi. Hozir (Git 2.48 dan `remote.<nom>.followRemoteHEAD`, 2.56 dan umumiy `fetch.followRemoteHEAD`) `fetch` uni standart holatda yaratadi va sozlamaga qarab kuzatadi.

**Qachon kerak.** `origin/HEAD` ga tayanadigan narsalar: qisqa `origin` yozuvi, `git branch --delete-merged origin`, ba'zi skriptlar "asosiy branch qaysi" ni shu ref'dan aniqlaydi. Loyiha standart branch'ini o'zgartirganda (`master` → `main`), `warn` yoki `always` sizni eskirgan `origin/HEAD` dan saqlaydi.

## Kod: `push.default` — argumentsiz `push` qayerga boradi

Argumentsiz `git push` da Git ikki savolga javob beradi: **qaysi remote** (`branch.<nom>.pushRemote` → `remote.pushDefault` → `branch.<nom>.remote` → `origin`) va **qaysi branch** (`push.default`).

Ali serverdagi `bosh-sahifa` branch'idan **boshqa nom** bilan lokal branch ochadi:

```bash
$ git switch -c bs origin/bosh-sahifa
Switched to a new branch 'bs'
branch 'bs' set up to track 'origin/bosh-sahifa'.
$ # index.html qo'shildi
$ git commit -m "Bosh sahifa"
$ git status -sb
## bs...origin/bosh-sahifa [ahead 1]
$ git push
fatal: The upstream branch of your current branch does not match
the name of your current branch.  To push to the upstream branch
on the remote, use

    git push origin HEAD:bosh-sahifa

To push to the branch of the same name on the remote, use

    git push origin HEAD

To choose either option permanently, see push.default in 'git help config'.

To avoid automatically configuring an upstream branch when its name
won't match the local branch, see option 'simple' of branch.autoSetupMerge
in 'git help config'.
```

Standart `push.default = simple` — "joriy branch'ni remote'dagi **bir xil nomli** branch'ga; o'zi pull qiladigan remote'ga push qilganda upstream nomi ham bir xil bo'lishi shart". Nomlar farq qiladi — Git taxmin qilmaydi, to'xtaydi. Boshqa rejimlar (`--dry-run` bilan sinab):

```bash
$ git -c push.default=upstream push --dry-run
To ../server.git
   d9c2641..42e3324  bs -> bosh-sahifa

$ git -c push.default=current push --dry-run
To ../server.git
 * [new branch]      bs -> bs

$ git -c push.default=nothing push
fatal: You didn't specify any refspecs to push, and push.default is "nothing".
```

| Rejim | Joriy branch qayerga | Qachon |
| --- | --- | --- |
| `simple` (Git 2.0 dan standart) | Bir xil nomli branch'ga; markazlashgan workflow'da upstream nomi ham mos bo'lishi kerak | Eng xavfsiz, boshlovchilar uchun |
| `upstream` (eskirgan sinonim — `tracking`) | Upstream'ga (`@{u}`), nomi har xil bo'lsa ham | Faqat pull qiladigan joyga push qilganda (markazlashgan) |
| `current` | Bir xil nomli branch'ga; yo'q bo'lsa yaratadi | Markazlashgan va markazlashmagan workflow'lar |
| `matching` (Git 2.0 gacha standart) | **Hamma** ikki tomonda bir xil nomli branch'lar birdan | Kamdan-kam; tayyor bo'lmagan branch'lar ham ketib qoladi |
| `nothing` | Hech qayerga — refspec majburiy | Har doim aniq yozishni xohlaganlar |

`push.autoSetupRemote` `simple`, `upstream` va `current` bilan ishlaydi (yuqorida).

## Kod: uchburchak workflow — `remote.pushDefault` va `branch.<nom>.pushRemote`

[27-bobda](27-remote.md) ogohlantirilgan edi: bitta remote'ning `url` va `pushurl` i turli joylarni ko'rsatmasligi kerak; "bir joydan olib, boshqa joyga yozish" uchun ikki remote kerak. Bu — **uchburchak** (*triangular*) workflow: asl loyihadan (`origin`) olasiz, o'z fork'ingizga (`fork`) yozasiz ([33-bob](33-hissa-qoshish.md)).

```bash
$ git init --bare fork.git
$ git remote add fork ../fork.git
$ git config remote.pushDefault fork
$ git push
To ../fork.git
 * [new branch]      bs -> bs
```

`bs` ning upstream'i hamon `origin/bosh-sahifa` (pull shu yerdan), push esa `fork` ga ketdi va u yerda `bs` nomini oldi. Ma'lumotnoma: `simple` boshqa remote'ga push qilganda nom moslashuvi talab qilinmaydi (u "o'zi pull qiladigan remote" emas).

Endi ikki xil "u yerda" bor:

- `@{upstream}` — qayerdan **olaman**;
- `@{push}` — argumentsiz `git push` qayerga **yuboradi** (shu yerning remote-tracking branch'i).

```bash
$ git rev-parse --symbolic-full-name @{u}
refs/remotes/origin/bosh-sahifa
$ git -c push.default=current rev-parse --symbolic-full-name @{push}
refs/remotes/fork/bs
$ git -c push.default=current log --oneline -1 @{push}
42e3324 Bosh sahifa
```

> **Sinovdagi nozik joy.** Standart `simple` bilan `git push` muvaffaqiyatli ishladi, lekin `@{push}` hal qilinmadi:
>
> ```bash
> $ git rev-parse --symbolic-full-name @{push}
> fatal: cannot resolve 'simple' push to a single destination
> ```
>
> Rasmiy `gitrevisions` misoli ham `@{push}` ni `push.default current` bilan ko'rsatadi. Uchburchak workflow'da `@{push}` dan foydalanmoqchi bo'lsangiz, `push.default=current` qiling. Uchburchaksiz workflow'da esa `@{push}` `@{upstream}` bilan bir xil va kerak emas (ma'lumotnoma).

`remote.pushDefault` hamma branch'lar uchun; bitta branch uchun ustun sozlama — `branch.<nom>.pushRemote`:

```bash
$ git config --unset remote.pushDefault
$ git config branch.bs.pushRemote fork
```

```ini
[branch "bs"]
	remote = origin
	merge = refs/heads/bosh-sahifa
	pushRemote = fork
```

Ustunlik tartibi (`config/branch`): `branch.<nom>.pushRemote` > `remote.pushDefault` > `branch.<nom>.remote`. `pushRemote` qiymati remote nomi yoki to'g'ridan-to'g'ri URL bo'lishi mumkin.

## Kod: `.git` ichida — loose va packed remote ref'lar

Bob boshida Vali'ning `origin/main` i faqat `packed-refs` da edi. Bir necha fetch'dan keyin:

```bash
$ find .git/refs/remotes -type f | sort
.git/refs/remotes/origin/HEAD
.git/refs/remotes/origin/bosh-sahifa
.git/refs/remotes/origin/main
.git/refs/remotes/origin/umumiy
$ cat .git/packed-refs
# pack-refs with: peeled fully-peeled sorted
3c8955c614a4425231ef8cd867c61e8aed0e2a74 refs/remotes/origin/main
$ cat .git/refs/remotes/origin/main
2f8b68c5f1518c3dd631b89b8360e0ac971e1ec9
$ git rev-parse origin/main
2f8b68c5f1518c3dd631b89b8360e0ac971e1ec9
```

`packed-refs` da eski qiymat (`3c8955c`) qolgan, lekin `fetch` yangi qiymatni **loose** faylga yozdi va u ustun ([17-bob](17-reflar-va-head.md)). Shuning uchun ref'larni faqat fayl o'qib tekshirish ishonchsiz — `git rev-parse`, `git show-ref` yoki `git for-each-ref` ishlating:

```bash
$ git for-each-ref --format='%(refname) %(objectname:short)' refs/remotes
refs/remotes/origin/HEAD 2f8b68c
refs/remotes/origin/bosh-sahifa d9c2641
refs/remotes/origin/main 2f8b68c
refs/remotes/origin/umumiy 2f8b68c
```

(Repo `reftable` formatida bo'lsa, ref'lar umuman alohida fayllarda turmaydi — [17-bob](17-reflar-va-head.md); bu bobdagi repo'lar `files` formatida.)

Bobdagi hamma holat bitta rasmda:

```text
.git/
├── config
│   ├── [remote "origin"]  url, fetch = +refs/heads/*:refs/remotes/origin/*
│   ├── [remote "fork"]    url, fetch = +refs/heads/*:refs/remotes/fork/*
│   ├── [branch "main"]    remote = origin, merge = refs/heads/main      ← upstream
│   ├── [branch "bs"]      remote = origin, merge = refs/heads/bosh-sahifa,
│   │                      pushRemote = fork                             ← @{push}
│   ├── [branch "tajriba"] remote = ., merge = refs/heads/main           ← lokal upstream
│   ├── [push]  autoSetupRemote = true
│   └── [fetch] prune = true, followRemoteHEAD = ...
├── refs/heads/            ← lokal branch'lar (siz surasiz)
├── refs/remotes/origin/   ← remote-tracking (fetch/push suradi)
│   ├── HEAD               ← "ref: refs/remotes/origin/main" (followRemoteHEAD)
│   └── main, ...
├── packed-refs            ← clone yozgan, eskirgan bo'lishi mumkin
├── logs/refs/remotes/     ← origin/main@{1} uchun reflog
└── FETCH_HEAD             ← oxirgi fetch; upstream qatori not-for-merge'siz
```

## Muhandislik nuqtai nazari: kundalik ish tartibi

- **`fetch` — ahead/behind'dan oldin.** `git status` faqat lokal `origin/*` bilan solishtiradi. Ish boshida `git fetch` (yoki `git fetch --all`), keyin `git status` yoki `git branch -vv`.
- **Hamma joyda bir xil nom.** Lokal branch serverdagi bilan bir xil nomda bo'lsa, `simple`, `autoSetupRemote`, taxmin (`--guess`) — hammasi muammosiz ishlaydi. Boshqa nom kerak bo'lsa, `branch.autoSetupMerge=simple` bilan upstream umuman belgilanmaydi — `simple` push xatosidan saqlaydi.
- **Global sozlamalar to'plami** (ixtiyoriy, kelishilgan holda):

  ```bash
  $ git config --global push.autoSetupRemote true
  $ git config --global fetch.prune true
  $ git config --global fetch.followRemoteHEAD warn
  ```

- **Branch'larni tozalash.** Merge qilingan topic branch'ni serverdan `git push origin --delete <nom>` bilan o'chiring (yoki PR yopilganda GitHub o'chiradi, [36-bob](36-github-boshqaruv.md)); boshqalarda `fetch.prune` ref'larni tozalaydi; lokal branch'larni `git branch -d` yoki `--delete-merged` bilan.
- **Fork bilan ishlash** — `remote.pushDefault=fork` + `push.default=current`: pull asl loyihadan, push o'z fork'ingizga, `@{u}` va `@{push}` alohida.

## Muhandislik nuqtai nazari: `origin/main` va `main` — kimga ishonish

Kod ko'rib chiqish, CI yoki release paytida savol: "serverdagi holat qaysi?" Javob — `git fetch` dan **keyingi** `origin/main`. Lokal `main` sizning nusxangiz: unda push qilinmagan commit'lar bo'lishi mumkin yoki u orqada qolgan. Shuning uchun:

- yangi branch'ni serverdagi holatdan oching: `git fetch && git switch -c yangi origin/main` (lokal `main`dan emas — u eskirgan bo'lishi mumkin);
- "PR'imda nima bor" — `git log origin/main..HEAD`;
- "serverda nima yangi" — `git log HEAD..origin/main` yoki `git log origin/main@{1}..origin/main`.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `fetch` qilmasdan `git status`dagi "up to date" ga ishonish | `origin/main` eskirgan; serverdagi yangi commit'lar ko'rinmaydi | Avval `git fetch`, keyin `status` |
| `git switch origin/main` qilib, shu yerda commit qilish | Detached HEAD; `origin/main` surilmaydi, commit'lar "osilib" qoladi | `git switch -c <nom> origin/main` yoki `git switch <nom>` (taxmin) |
| `git branch --set-upstream origin/x` (eski sintaksis) | Endi qo'llab-quvvatlanmaydi | `git branch -u origin/x` (`--set-upstream-to`) |
| Lokal branch'ni boshqa nom bilan ochib, argumentsiz `git push` | `simple` rad etadi | Bir xil nom, `git push origin HEAD:<nom>` yoki `push.default=upstream` |
| `push.default=matching` ni yoqish | Tayyor bo'lmagan branch'lar ham serverga ketadi | Standart `simple` yoki `current` |
| `git push origin --delete x` dan keyin boshqalarda `origin/x` qoladi deb hayron bo'lish | Oddiy `fetch` prune qilmaydi | `git fetch --prune` yoki `fetch.prune=true` |
| `fetch.pruneTags` ni o'ylamay yoqish | Remote'da yo'q lokal teglar (boshqa manbadan kelganlari ham) o'chadi | Faqat teglarni remote bilan 1:1 saqlash kerak bo'lsa |
| `gone` upstream'li branch'ni ishlatishda davom etish | `pull` ishlamaydi, `status` ogohlantiradi | Ish birlashgan bo'lsa — `git branch -d`; davom etsa — `--unset-upstream` yoki yangi `push -u` |
| `.git/refs/remotes/...` faylini o'qib, ref qiymati deb bilish | `packed-refs` yoki `reftable` da boshqa qiymat bo'lishi, fayl umuman bo'lmasligi mumkin | `git rev-parse`, `git for-each-ref` |
| Uchburchak workflow'da `@{push}` ni `simple` bilan ishlatish | `cannot resolve 'simple' push to a single destination` | `push.default=current` |

## Amaliyot

1. `server.git`, `ali/` (`remote add` + `push -u`) va `vali/` (`clone`) yarating. Ikkalasida `find .git/refs -type f`, `cat .git/packed-refs` va `.git/config` dagi `[branch "main"]` bo'limini solishtiring. `origin/HEAD` qaysi birida va qachon paydo bo'ldi?
2. `push.autoSetupRemote` ni yoqib, yangi branch'ni argumentsiz `git push` qiling. Push'dan oldin va keyin `.git/config` va `.git/refs/remotes/origin/` ni ko'ring.
3. Ikkinchi klonda `git switch <nom>` (taxmin), `git switch -c boshqa origin/<nom>` va `git branch --no-track` bilan uch branch oching. `git branch -vv` natijasini tushuntiring. Keyin `--unset-upstream` va `-u` bilan upstream'larni almashtiring, bittasiga lokal `main`ni upstream qiling va config'dagi `remote = .` ni toping.
4. Ikki klonda parallel commit qiling. `fetch` dan **oldin** va **keyin** `git status`, `git status -sb`, `git rev-list --left-right --count @...@{u}` natijalarini yozing. Nega oldingi natija noto'g'ri edi?
5. Serverdagi branch'ni `git push origin --delete` bilan o'chiring. Ikkinchi klonda `git fetch`, `git remote show origin`, `git fetch --prune` va `git branch -vv` ketma-ketligini bajaring; `stale` va `gone` holatlarini ajrating.
6. Bare server'da `git symbolic-ref HEAD refs/heads/<boshqa>` qiling va klonda `fetch.followRemoteHEAD` ning `create`, `warn`, `always`, `never` qiymatlarini sinang. Har birida `cat .git/refs/remotes/origin/HEAD`.
7. Serverdagi branch'dan boshqa nomli lokal branch oching va `push.default` ning `simple`, `upstream`, `current`, `nothing` rejimlarini `--dry-run` bilan solishtiring.
8. (Qiyinroq) Ikkinchi bare repo'ni `fork` sifatida qo'shib, uchburchak workflow quring: `remote.pushDefault`, keyin `branch.<nom>.pushRemote`. `@{u}` va `@{push}` ni `push.default` ning `simple` va `current` qiymatlarida tekshiring. So'ng `origin/main` ni kuzatuvchi ikki topic branch'dan birini serverdagi `main` ga push qilib, `git branch --dry-run --delete-merged origin/main` nimani o'chirishini oldindan ayting va tekshiring.

## Rasmiy hujjat

- Pro Git — Remote Branches: <https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches>
- `git branch` (`-u`, `--set-upstream-to`, `--unset-upstream`, `--track`, `-vv`, `--delete-merged`): <https://git-scm.com/docs/git-branch>
- `git push` (`--delete`, `-u`, `push.default`): <https://git-scm.com/docs/git-push>
- `git fetch` (PRUNING, `--prune`): <https://git-scm.com/docs/git-fetch>
- `git remote` (`prune`, `set-head`, `show`): <https://git-scm.com/docs/git-remote>
- `git switch` (`--guess`, `--track`): <https://git-scm.com/docs/git-switch>
- `git config` — `branch.*`, `push.*`, `fetch.*`, `remote.<nom>.followRemoteHEAD`: <https://git-scm.com/docs/git-config>
- `gitrevisions` (`@{upstream}`, `@{push}`): <https://git-scm.com/docs/gitrevisions>
- Git 2.56 reliz eslatmalari (`fetch.followRemoteHEAD`, `--delete-merged`): <https://github.com/git/git/blob/v2.56.0/Documentation/RelNotes/2.56.0.adoc>
