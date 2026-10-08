# 48 — Muhit o'zgaruvchilari

[← Oldingi: Hook'lar](47-hooklar.md) · [Mundarija](README.md) · [Keyingi: Worktree va katta repo'lar →](49-worktree-va-katta-repo.md)

## Tushuncha

**Muhit o'zgaruvchisi** (*environment variable*) — har bir ishga tushgan dasturga operatsion tizim beradigan `NOM=qiymat` juftliklari ro'yxati. O'xshatish: dastur ishga ketayotganda cho'ntagiga solib qo'yilgan xat. Dastur xatni o'qiydi va unga qarab ishlaydi; u boshqa dasturni chaqirsa, xatning nusxasi yangi dasturning cho'ntagiga ham tushadi (*meros*).

Git ham shunday xatlarni o'qiydi. Ularning ko'pchiligi `GIT_` bilan boshlanadi, ba'zilari umumiy (`HOME`, `EDITOR`, `PAGER`, `EMAIL`). Pro Git aytganidek, ularni bilish kamdan-kam kerak bo'ladi, lekin kerak bo'lganda — skript yozganda, CI sozlaganda, "Git nega bunday qilyapti?" degan savolga javob izlaganda — boshqa yo'l yo'q.

O'rnatishning uch yo'li:

```bash
GIT_TRACE=1 git status        # faqat shu bitta buyruq uchun
export GIT_PAGER=cat          # shu terminal oynasidagi hamma keyingi buyruqlar uchun
unset GIT_PAGER               # olib tashlash
```

Birinchi shakl eng xavfsizi: o'zgaruvchi faqat shu jarayonda (va u chaqirgan jarayonlarda) yashaydi, shell'da hech narsa qolmaydi. Bu bobdagi misollarning deyarli hammasi shu shaklda.

Ma'lumotnoma (`git` sahifasi, "Environment Variables") ikki umumiy qoidani aytadi:

- **"Boolean" deb belgilangan** o'zgaruvchilar config'dagi mantiqiy qiymatlar kabi o'qiladi: `true`, `yes`, `on`, musbat son — "ha"; `false`, `no`, `off`, `0` — "yo'q".
- Ba'zilari esa **qiymatidan qat'i nazar**, faqat borligi bilan ishlaydi (masalan `GIT_SSL_NO_VERIFY` — "har qanday qiymatga" o'rnatilsa yetarli).

Ustunlik qayerda? Odatda: **buyruq qatori opsiyasi > muhit o'zgaruvchisi > config fayli**. `--git-dir` va `GIT_DIR`, `--work-tree` va `GIT_WORK_TREE`, `--namespace` va `GIT_NAMESPACE` — juftlar. Istisnolar ham bor (masalan `GIT_DIFF_OPTS` `-U` dan ustun, `GIT_CONFIG_COUNT` esa `-c` dan past) — ular quyida sinab ko'rsatiladi.

Bob bo'limlari Pro Git ("Environment Variables") va ma'lumotnoma tartibiga yaqin:

| Guruh | Asosiy o'zgaruvchilar | Bo'lim |
| --- | --- | --- |
| Global xatti-harakat | `GIT_EXEC_PATH`, `HOME`, `PREFIX`, `GIT_CONFIG_*`, `GIT_PAGER`, `GIT_EDITOR` | Kod: Git o'zi qayerda va sozlamani qayerdan oladi |
| Repo joyi | `GIT_DIR`, `GIT_WORK_TREE`, `GIT_CEILING_DIRECTORIES`, `GIT_DISCOVERY_ACROSS_FILESYSTEM`, `GIT_COMMON_DIR` | Kod: repo qanday topiladi |
| Ichki fayllar | `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES` | Kod: ikkinchi index; obyekt ombori |
| Pathspec | `GIT_GLOB_PATHSPECS`, `GIT_NOGLOB_PATHSPECS`, `GIT_LITERAL_PATHSPECS`, `GIT_ICASE_PATHSPECS` | Kod: pathspec |
| Commit | `GIT_AUTHOR_*`, `GIT_COMMITTER_*`, `EMAIL` | Kod: muallif va sana |
| Tarmoq | `GIT_SSH_COMMAND`, `GIT_SSL_NO_VERIFY`, `GIT_ASKPASS`, `GIT_TERMINAL_PROMPT`, `GIT_HTTP_*` | Kod: tarmoq |
| Diff/merge | `GIT_DIFF_OPTS`, `GIT_EXTERNAL_DIFF`, `GIT_MERGE_VERBOSITY` | Kod: diff va merge |
| Debug | `GIT_TRACE`, `GIT_TRACE_SETUP`, `GIT_TRACE_PACK_ACCESS`, `GIT_TRACE_PERFORMANCE`, `GIT_TRACE2*` | Kod: Git ichiga qarash |
| Boshqa | `GIT_REFLOG_ACTION`, `GIT_NAMESPACE`, `GIT_FLUSH`, `GIT_NO_REPLACE_OBJECTS`, `GIT_OPTIONAL_LOCKS`, `GIT_ADVICE` | Kod: qolganlari |

### Sinov muhiti haqida (muhim)

Bu qo'llanmadagi hamma misollar kichik o'rash skripti (wrapper) orqali ishlatilgan — u haqiqiy `git` ni chaqirishdan oldin o'zi bir nechta muhit o'zgaruvchisini o'rnatadi. Aynan shu bobda bu sezilarli, shuning uchun ochiq aytamiz:

```bash
export HOME=/tmp/misol/sinov-uy XDG_CONFIG_HOME=/tmp/misol/sinov-uy/.config
export GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-Ali Valiyev}"        # va EMAIL, DATE
export GIT_COMMITTER_NAME="${GIT_COMMITTER_NAME:-Ali Valiyev}"  # va EMAIL, DATE
export GIT_PAGER=cat PAGER=cat LANG=C LC_ALL=C
```

Ya'ni `HOME`, `GIT_PAGER` va `GIT_CONFIG_NOSYSTEM` ni buyruq oldida o'zgartirib bo'lmaydi (wrapper ustidan yozadi), muallif/committer o'zgaruvchilarini esa o'zgartirish mumkin (`:-` — "berilmagan bo'lsa"). Hash'lar har safar bir xil chiqishining sababi ham shu — sanalar qotirilgan ([16-bob](16-commit-obyekti.md)). Wrapper o'rnatgan o'zgaruvchini olib tashlash kerak bo'lgan joylarda buyruq `env -u NOM ...` bilan ko'rsatilgan: oddiy terminalda bu shunchaki ortiqcha, lekin natija bir xil.

## Nega shunday: nega sozlama fayli emas, muhit o'zgaruvchisi?

Config fayli ([3-bob](03-birinchi-sozlash.md), [45-bob](45-config-chuqur.md)) doimiy sozlama uchun. Muhit o'zgaruvchisining o'ziga xos uchta xususiyati bor:

1. **Bir martalik.** `GIT_TRACE=1 git push` hech qaysi faylni o'zgartirmaydi; keyingi buyruq odatdagidek ishlaydi.
2. **Meros qoladi.** Git o'zi chaqiradigan har narsaga — hook'lar, alias'dagi `!` buyruqlar, `ssh`, tashqi diff, `upload-pack` — o'zgaruvchilar avtomatik o'tadi. Fayl bunday qila olmaydi: bola jarayon qaysi faylni o'qishni bilmasligi mumkin.
3. **Repo topilishidan oldin ishlaydi.** `GIT_DIR` yoki `GIT_CEILING_DIRECTORIES` ni config'ga yozib bo'lmaydi — config `.git/config` da, `.git` esa hali topilmagan.

Ikkinchi xususiyatni Git o'zi ham ishlatadi: [47-bobda](47-hooklar.md) hook ichida `GIT_INDEX_FILE`, `GIT_PREFIX`, `GIT_EDITOR=:` borligini ko'rgan edik — Git ularni bola jarayonga xabar yetkazish uchun o'rnatadi. `git -c` bilan berilgan sozlamalar ham bolaga xuddi shu yo'l bilan yetadi:

```text
$ GIT_TRACE=1 git -c color.ui=never -c core.abbrev=8 -c alias.x='!env | grep ^GIT_CONFIG' x
18:04:59.927760 git.c:815               trace: exec: git-x
18:04:59.927864 run-command.c:673       trace: run_command: git-x
18:04:59.928137 run-command.c:673       trace: run_command: 'env | grep ^GIT_CONFIG'
18:04:59.928140 run-command.c:765       trace: start_command: /bin/sh -c 'env | grep ^GIT_CONFIG' 'env | grep ^GIT_CONFIG'
GIT_CONFIG_PARAMETERS='color.ui'='never' 'core.abbrev'='8' 'alias.x'=''\!'env | grep ^GIT_CONFIG'
GIT_CONFIG_NOSYSTEM=1
```

`GIT_CONFIG_PARAMETERS` — ichki o'zgaruvchi, uni qo'lda yozmang; lekin u borligini bilish foydali: alias ichidagi `git` ham `-c` sozlamalarini "ko'radi".

Merosning teskari tomoni ham bor: hook yoki skript ichida **boshqa** repo bilan ishlasangiz, meros qolgan `GIT_DIR` sizni eski repo'ga qaytarib yuboradi. Qaysi o'zgaruvchilar "shu repo'ga bog'langan" ekanini Git o'zi aytadi:

```text
$ git rev-parse --local-env-vars
GIT_ALTERNATE_OBJECT_DIRECTORIES
GIT_CONFIG
GIT_CONFIG_PARAMETERS
GIT_CONFIG_COUNT
GIT_OBJECT_DIRECTORY
GIT_DIR
GIT_WORK_TREE
GIT_IMPLICIT_WORK_TREE
GIT_GRAFT_FILE
GIT_INDEX_FILE
GIT_NO_REPLACE_OBJECTS
GIT_REPLACE_REF_BASE
GIT_PREFIX
GIT_SHALLOW_FILE
GIT_COMMON_DIR
```

Boshqa repo'ga o'tishdan oldin — `unset $(git rev-parse --local-env-vars)` (bu [47-bobdagi](47-hooklar.md) maslahat).

## Kod: Git o'zi qayerda va sozlamani qayerdan oladi

### `GIT_EXEC_PATH` — yordamchi dasturlar papkasi

`git commit` — aslida `git` + `commit`. Ichki buyruqlar `git` dasturining o'zida (built-in), lekin bir qismi alohida fayl: `git-remote-https`, `git-sh-setup`, yordamchi skriptlar. Ular `GIT_EXEC_PATH` papkasida. Joriy qiymatni `--exec-path` ko'rsatadi:

```text
$ git --version
git version 2.56.0
$ git --exec-path
/opt/homebrew/opt/git/libexec/git-core
$ ls $(git --exec-path) | wc -l
     183
$ ls $(git --exec-path) | grep -E "^git-(commit|upload-pack|remote-https|sh-setup)$"
git-commit
git-remote-https
git-sh-setup
git-upload-pack
```

Ma'lumotnoma (`PATH` bandi) qidirish tartibini aytadi: `git foo` uchun avval `GIT_EXEC_PATH` dagi ichki dastur, keyin `PATH` dagi `git-foo` nomli istalgan bajariladigan fayl, va faqat shundan keyin `foo` alias'i. Shuning uchun `~/bin/git-salom` skriptini yozsangiz, `git salom` ishlaydi. Git bola jarayonlar uchun exec-path'ni `PATH` boshiga qo'shadi — alias ichidan `command -v git` ni so'rasak:

```text
$ git -c alias.qaysi='!command -v git; echo $PATH | tr : "\n" | head -2' qaysi
/opt/homebrew/opt/git/libexec/git-core/git
/opt/homebrew/opt/git/libexec/git-core
/tmp/misol/scratch/gitlab/bin
```

`GIT_EXEC_PATH` ni o'zgartirish kerak bo'ladigan holat — bir kompyuterda bir nechta Git o'rnatilgan va bir versiyaning `git` i boshqasining yordamchi dasturlarini chaqirib yuborayotgan bo'lsa. Oddiy ishda unga tegilmaydi.

### `HOME`, `XDG_CONFIG_HOME` — global sozlama qayerda

Global config ikki joyda bo'lishi mumkin: `$XDG_CONFIG_HOME/git/config` (bo'lmasa `~/.config/git/config`) va `~/.gitconfig`. Ikkalasi ham `HOME` ga bog'liq. Git qaysi yo'llarga qarashini `git var` aytadi:

```text
$ git var GIT_CONFIG_GLOBAL
/tmp/misol/sinov-uy/.config/git/config
/tmp/misol/sinov-uy/.gitconfig
$ git config list --show-origin --show-scope
global	file:/tmp/misol/sinov-uy/.gitconfig	user.name=Ali Valiyev
global	file:/tmp/misol/sinov-uy/.gitconfig	user.email=ali@example.com
global	file:/tmp/misol/sinov-uy/.gitconfig	init.defaultbranch=main
global	file:/tmp/misol/sinov-uy/.gitconfig	advice.defaultbranchname=false
```

Bu — wrapper o'rnatgan `HOME`. Pro Git maslahati: "ko'chma" (masalan, fleshkadagi) Git yasamoqchi bo'lsangiz, uning shell profilida `HOME` ni o'zgartiring. Lekin `HOME` ga `ssh`, muharrir va boshqa ko'p dastur ham qaraydi; faqat Git sozlamasini almashtirish uchun aniqroq vosita bor — `GIT_CONFIG_GLOBAL` (quyida). Windows'da `HOME` bo'lmasa, Git uni `HOMEDRIVE`+`HOMEPATH` yoki `USERPROFILE` dan yasaydi (ma'lumotnoma).

### `PREFIX` — Pro Git bilan farq

Pro Git: "`PREFIX` ham shunday, faqat system config uchun; Git faylni `$PREFIX/etc/gitconfig` da qidiradi." Sinovda bu tasdiqlanmadi:

```text
$ env -u GIT_CONFIG_NOSYSTEM git var GIT_CONFIG_SYSTEM
/opt/homebrew/etc/gitconfig
$ env -u GIT_CONFIG_NOSYSTEM PREFIX=/opt/boshqa git var GIT_CONFIG_SYSTEM
/opt/homebrew/etc/gitconfig
```

Ma'lumotnoma system faylni `$(prefix)/etc/gitconfig` deb yozadi — bu yerda `prefix` **Git yig'ilgan (build) paytdagi** o'rnatish joyi, ish paytidagi muhit o'zgaruvchisi emas. Homebrew Git'i uchun u `/opt/homebrew`. System faylni almashtirmoqchi bo'lsangiz — `GIT_CONFIG_SYSTEM`.

### `GIT_CONFIG_NOSYSTEM`, `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_SYSTEM`

- `GIT_CONFIG_NOSYSTEM` (Boolean) — system faylni umuman o'qima. Ma'lumotnoma ikki holatni aytadi: "injiq" skript uchun oldindan aytib bo'ladigan muhit (`HOME`, `XDG_CONFIG_HOME` bilan birga) va buzuq `/etc/gitconfig` ni administrator tuzatguncha chetlab o'tish.
- `GIT_CONFIG_GLOBAL=<fayl>` — `~/.gitconfig` va `$XDG_CONFIG_HOME/git/config` o'rniga shu faylni o'qi.
- `GIT_CONFIG_SYSTEM=<fayl>` — system fayl o'rniga shu fayl.
- Ikkalasiga `/dev/null` berish — "bu darajani bo'sh deb hisobla".

```text
$ GIT_CONFIG_GLOBAL=/tmp/misol/48-commit/boshqa-global.gitconfig git config list --show-scope --show-origin
global	file:/tmp/misol/48-commit/boshqa-global.gitconfig	core.abbrev=5
global	file:/tmp/misol/48-commit/boshqa-global.gitconfig	alias.qisqa=log --oneline -1
local	file:.git/config	core.repositoryformatversion=0
...
local	file:.git/config	core.abbrev=10
$ GIT_CONFIG_GLOBAL=/dev/null git config list --show-scope
local	core.repositoryformatversion=0
local	core.filemode=true
local	core.bare=false
local	core.logallrefupdates=true
local	core.ignorecase=true
local	core.precomposeunicode=true
local	core.abbrev=10
```

`/dev/null` bilan global daraja bo'sh — `user.name` ham yo'q. Endi ikki o'zgaruvchi to'qnashsa nima bo'ladi? Wrapper `GIT_CONFIG_NOSYSTEM=1` qo'ygan, biz esa `GIT_CONFIG_SYSTEM` beramiz:

```text
$ GIT_CONFIG_SYSTEM=/tmp/misol/48-commit/boshqa-global.gitconfig git config list --show-scope
global	user.name=Ali Valiyev
global	user.email=ali@example.com
global	init.defaultbranch=main
global	advice.defaultbranchname=false
local	core.repositoryformatversion=0
...
$ env -u GIT_CONFIG_NOSYSTEM GIT_CONFIG_SYSTEM=/tmp/misol/48-commit/boshqa-global.gitconfig git config list --show-scope
system	core.abbrev=5
system	alias.qisqa=log --oneline -1
global	user.name=Ali Valiyev
...
```

Xulosa: `GIT_CONFIG_NOSYSTEM` g'olib — u bor ekan, `GIT_CONFIG_SYSTEM` dagi fayl ham o'qilmaydi.

### `GIT_CONFIG_COUNT`, `GIT_CONFIG_KEY_<n>`, `GIT_CONFIG_VALUE_<n>`

Bu — `git -c` ning muhit o'zgaruvchisi shakli. Juftlar **noldan** sanaladi:

```text
$ GIT_CONFIG_COUNT=2 GIT_CONFIG_KEY_0=core.abbrev GIT_CONFIG_VALUE_0=7 GIT_CONFIG_KEY_1=alias.oxirgi GIT_CONFIG_VALUE_1='log --oneline -1' git oxirgi
520d340 chore: muharrirsiz xabar
```

Repo'da `core.abbrev=10` turibdi, lekin hash 7 belgi — muhitdagi qiymat fayldan ustun. `-c` bilan to'qnashsa:

```text
$ GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.abbrev GIT_CONFIG_VALUE_0=7 git -c core.abbrev=12 log --oneline -1
520d34040cc0 chore: muharrirsiz xabar
$ GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.abbrev GIT_CONFIG_VALUE_0=7 git config list --show-scope | grep abbrev
local	core.abbrev=10
command	core.abbrev=7
```

`-c` g'olib (ma'lumotnoma: "fayllardan ustun, lekin `git -c` dan past"). Daraja nomi — `command`. Xato holatlar:

```text
$ GIT_CONFIG_COUNT=2 GIT_CONFIG_KEY_0=core.abbrev GIT_CONFIG_VALUE_0=7 git log --oneline -1
error: missing config key GIT_CONFIG_KEY_1
fatal: unable to parse command-line config
$ GIT_CONFIG_COUNT= git log --oneline -1
520d34040c chore: muharrirsiz xabar
```

Yetishmagan juft — fatal xato; bo'sh `GIT_CONFIG_COUNT` — `0` bilan teng, hech narsa qo'shilmaydi. Nega `-c` turganda bu kerak? Ma'lumotnoma: bir xil sozlama bilan **ko'p** git buyrug'ini ishga tushiradigan skriptda, config fayliga tayanib bo'lmaganda — bir marta `export` qilasiz va har chaqiriqqa `-c` yozmaysiz. Yana bir afzallik: qiymat buyruq qatorida ko'rinmaydi (`ps` chiqishida), bu token kabi narsalar uchun muhim. Eski `GIT_CONFIG` o'zgaruvchisi faqat `git config` buyrug'iga `--file` sifatida ta'sir qiladi va tarixiy moslik uchun qolgan.

### `GIT_PAGER` va `PAGER`

Pager — uzun chiqishni sahifalab ko'rsatadigan dastur (odatda `less`). Pro Git: "`GIT_PAGER` bo'lmasa, `PAGER` ishlatiladi." To'liq tartib (`git var` ma'lumotnomasi): `GIT_PAGER` → `core.pager` → `PAGER` → `less`. Wrapper `GIT_PAGER=cat` qo'ygani uchun avval uning g'alabasini ko'ramiz, keyin olib tashlaymiz:

```text
$ GIT_PAGER=less git var GIT_PAGER
cat
$ git -c core.pager=less var GIT_PAGER
cat
$ env -u GIT_PAGER -u PAGER git var GIT_PAGER
less
$ env -u GIT_PAGER PAGER=most git var GIT_PAGER
most
$ env -u GIT_PAGER PAGER=most git -c core.pager=bat var GIT_PAGER
bat
```

Birinchi qatorda `less` emas `cat` — wrapper buyruq oldidagi qiymatni ustidan yozdi. Ikkinchisi muhim: `GIT_PAGER` `core.pager` dan ham ustun. Ma'lumotnoma qo'shimchasi: `GIT_PAGER` bo'sh satr yoki `cat` bo'lsa, Git pager'ni umuman ishga tushirmaydi. Skriptlarda `git --no-pager` yoki `GIT_PAGER=cat` — chiqish quvurga (`|`) ketayotganda Git pager'ni o'zi ham ochmaydi, lekin terminalda ishlaydigan skript uchun bu kafolat.

### `GIT_EDITOR` va `GIT_SEQUENCE_EDITOR`

Muharrir tanlash tartibi ([3-bob](03-birinchi-sozlash.md) da sinalgan): `GIT_EDITOR` → `core.editor` → `VISUAL` → `EDITOR` → `vi`. Pro Git faqat `EDITOR` ni aytadi; ma'lumotnoma `VISUAL` ni ham qo'shadi. Bu yerda boshqa tomoni — `GIT_EDITOR` ni **avtomatlashtirish** uchun ishlatish. Git muharrirni shell orqali `$GIT_EDITOR <fayl>` shaklida chaqiradi, shuning uchun "muharrir" o'rnida istalgan buyruq bo'lishi mumkin:

```text
$ GIT_EDITOR='printf "%s\n" "chore: muharrirsiz xabar" >' git commit -q
$ git log -1 --format=%s
chore: muharrirsiz xabar
```

Shell buni `printf ... > .git/COMMIT_EDITMSG` deb o'qidi — xabar fayliga yozildi. `GIT_EDITOR=:` (hech narsa qilmaydigan buyruq) esa "taklif qilingan xabarni o'zgartirmasdan qabul qil" degani — [47-bobda](47-hooklar.md) Git o'zi ham hook'larga shu qiymatni bergan edi.

`GIT_SEQUENCE_EDITOR` faqat `rebase -i` ning "todo" ro'yxati uchun ([24-bob](24-rebase.md)) va `GIT_EDITOR` dan ustun. Interaktiv rebase'ni skriptdan bajarish:

```text
$ git log --oneline
4ed801f chore: muharrirsiz xabar
670e3f7 Sana formatlari
3cfcbde Valining patchi
2e5e01c Birinchi
$ GIT_SEQUENCE_EDITOR='sed -i.bak "1d"' git rebase -q -i HEAD~2
$ git log --oneline
520d340 chore: muharrirsiz xabar
3cfcbde Valining patchi
2e5e01c Birinchi
```

Ro'yxatning birinchi qatori (`pick 670e3f7 Sana formatlari`) o'chirildi — commit tarixdan tushib qoldi, keyingisi qayta yaratildi (hash o'zgardi). Xato bo'lsa — `git reflog` bilan qaytariladi ([42-bob](42-reflog-va-tiklash.md)).

## Kod: repo qanday topiladi — `GIT_TRACE_SETUP`

Git buyrug'i birinchi navbatda **repo'ni topadi**: `.git` papkasi (`GIT_DIR`) qayerda, working tree ildizi qayerda, siz ildizga nisbatan qayerdasiz (**prefix**). `GIT_TRACE_SETUP` shu bosqich natijasini ko'rsatadi:

```text
$ cd ilova/src/lib
$ GIT_TRACE_SETUP=1 git status --short
18:03:33.639759 trace.c:316             setup: git_dir: .git
18:03:33.639848 trace.c:317             setup: git_common_dir: .git
18:03:33.639850 trace.c:318             setup: worktree: /tmp/misol/48-joy/ilova
18:03:33.639852 trace.c:319             setup: cwd: /tmp/misol/48-joy/ilova
18:03:33.639853 trace.c:320             setup: prefix: src/lib/
18:03:33.639878 chdir-notify.c:58       setup: chdir from '/tmp/misol/48-joy/ilova' to '/tmp/misol/48-joy/ilova'
```

Biz `src/lib` da turibmiz, lekin `cwd` — working tree ildizi. Git topgandan keyin **ildizga ko'chadi** (`chdir`) va qayerdan kelganini `prefix` da eslab qoladi; `git status` dagi nisbiy yo'llar shu `prefix` bilan hisoblanadi. `git_dir` nisbiy (`.git`), chunki u endi ildizga nisbatan. `git_common_dir` — worktree'lar uchun (quyida).

Ichkarida algoritm shunday (ma'lumotnoma: `GIT_DIR`, `GIT_CEILING_DIRECTORIES`, `GIT_DISCOVERY_ACROSS_FILESYSTEM` bandlari):

```text
GIT_DIR berilganmi? ── ha ──> shu repo; worktree = GIT_WORK_TREE / core.worktree / joriy papka
      │ yo'q
      v
joriy papka: .git bormi? (papka yoki "gitdir: ..." fayli) ── ha ──> topildi
      │ yo'q  (yoki o'zi bare repo'mi? ── ha ──> worktree yo'q)
      v
bir papka yuqoriga ── to'xtash: "/" ga yetdi
                       yoki GIT_CEILING_DIRECTORIES dagi papkaga yetdi
                       yoki boshqa fayl tizimiga o'tish kerak (GIT_DISCOVERY_ACROSS_FILESYSTEM yo'q)
      │
      v
fatal: not a git repository (or any of the parent directories): .git
```

Pro Git "Git `~` yoki `/` ga yetguncha yuqoriga chiqadi" deydi; ma'lumotnomada to'xtash nuqtasi sifatida `~` emas, yuqoridagi uchtasi aytilgan.

`.git` ichida turib ishlatsak — Git o'zini bare repo ichida deb hisoblaydi:

```text
$ cd ilova/.git
$ GIT_TRACE_SETUP=1 git status
18:03:33.662259 trace.c:316             setup: git_dir: .
18:03:33.662337 trace.c:317             setup: git_common_dir: .
18:03:33.662338 trace.c:318             setup: worktree: (null)
18:03:33.662339 trace.c:319             setup: cwd: /tmp/misol/48-joy/ilova/.git
18:03:33.662340 trace.c:320             setup: prefix: (null)
fatal: this operation must be run in a work tree
```

`worktree: (null)` — working tree yo'q, shuning uchun `log` ishlaydi, `status` esa yo'q. Eslatma: `git rev-parse` setup bosqichini boshqacha o'tadi va `GIT_TRACE_SETUP` qatorlarini chiqarmaydi — sinash uchun `status` yoki `log` ishlating.

### `GIT_DIR` yolg'iz — keng tarqalgan tuzoq

Ma'lumotnoma (`GIT_WORK_TREE` bandi, Pro Git ham takrorlaydi): `GIT_DIR` berilsa-yu, `GIT_WORK_TREE`/`--work-tree`/`core.worktree` berilmasa, **joriy papka** working tree ildizi hisoblanadi. Repo'dan bir papka tashqarida (`48-joy`, unda faqat `ilova` papkasi bor) turib sinaymiz:

```text
$ GIT_TRACE_SETUP=1 GIT_DIR=ilova/.git git status --short
18:03:25.606939 trace.c:316             setup: git_dir: ilova/.git
18:03:25.607029 trace.c:317             setup: git_common_dir: ilova/.git
18:03:25.607031 trace.c:318             setup: worktree: /tmp/misol/48-joy
18:03:25.607032 trace.c:319             setup: cwd: /tmp/misol/48-joy
18:03:25.607034 trace.c:320             setup: prefix: (null)
18:03:25.607064 chdir-notify.c:58       setup: chdir from '/tmp/misol/48-joy' to '/tmp/misol/48-joy'
18:03:25.607069 setup.c:1086            setup: move $GIT_DIR to 'ilova/.git'
 D README.md
 D src/app.js
?? ilova/
$ GIT_DIR=ilova/.git GIT_WORK_TREE=ilova git status --short
$
```

Birinchi buyruqda Git working tree'ni `48-joy` deb oldi: u yerda `README.md` yo'q — "o'chirilgan" (`D`), `ilova/` esa "yangi". Shu holatda `git add -A` yoki `git commit -a` qilinsa, haqiqatan ham hamma fayl o'chirilgan commit yaratiladi. Ikkinchi buyruqda working tree to'g'ri — o'zgarish yo'q. Qoida: **`GIT_DIR` ni doim `GIT_WORK_TREE` bilan birga bering** (yoki `git -C <papka>` ishlating — u avval papkaga o'tadi, keyin odatdagidek qidiradi).

### `GIT_CEILING_DIRECTORIES` — yuqoriga chiqish chegarasi

`:` bilan ajratilgan **mutlaq** yo'llar ro'yxati: Git qidiruvda bu papkalarga **ko'tarilmaydi**. Pro Git sababini aytadi: sekin papkalar (tarmoq disklari) va ayniqsa shell prompt'i — har Enter bosilganda `git` ishga tushadi va sekin diskda yuqoriga qidirish terminalni qotiradi.

```text
$ cd ilova/src
$ GIT_CEILING_DIRECTORIES=/tmp/misol/48-joy/ilova git status
fatal: not a git repository (or any of the parent directories): .git
$ GIT_CEILING_DIRECTORIES=/tmp/misol/48-joy git status --short
$
```

Birinchida `ilova` chegara — Git `src` dan unga ko'tarilmadi va `.git` ni topmadi. Ikkinchida chegara bir pog'ona yuqorida, `ilova` ga chiqish mumkin. Ma'lumotnoma nozikliklari:

- Joriy papkaning o'zi va `GIT_DIR` bilan berilgan repo chegaradan qat'i nazar ishlaydi.
- Git ro'yxatdagi yo'llarning simlink'larini ochib, haqiqiy yo'l bilan solishtiradi (macOS'da `/tmp` — `/private/tmp` ga simlink). Bu ham sekin bo'lsa, ro'yxatga **bo'sh element** qo'shing: undan keyingilar "simlink emas" deb, ochilmasdan solishtiriladi — `GIT_CEILING_DIRECTORIES=/balki/simlink::/juda/sekin/papka`.

### `GIT_DISCOVERY_ACROSS_FILESYSTEM`

Odatda Git yuqoriga qidirganda **fayl tizimi chegarasini kesib o'tmaydi** (masalan, `/mnt/disk` boshqa diskda bo'lsa, undan `/` ga chiqmaydi). Bu Boolean o'zgaruvchi `true` bo'lsa, chegaradan o'tadi. Xuddi `GIT_CEILING_DIRECTORIES` kabi, `GIT_DIR` bilan aniq berilgan repo'ga ta'sir qilmaydi. Chegarada to'xtaganda Git xato matnining oxiriga shu izohni qo'shadi (Git 2.56 dasturidagi satr):

```text
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
```

Bu xabarni ko'rsangiz — repo boshqa diskda va siz uning "ichida" emas, ostidagi boshqa disk papkasidasiz.

### `GIT_COMMON_DIR` — worktree'lar uchun

Qo'shimcha worktree'da ([49-bob](49-worktree-va-katta-repo.md)) ikki `.git` bor: worktree'ning shaxsiy papkasi (`HEAD`, `index`) va hammaga umumiy papka (obyektlar, branch'lar). `GIT_TRACE_SETUP` buni ochiq ko'rsatadi:

```text
$ cat .git
gitdir: /tmp/misol/48-joy/ilova/.git/worktrees/ilova-tuzatish
$ GIT_TRACE_SETUP=1 git status --short
18:09:07.571912 trace.c:316             setup: git_dir: /tmp/misol/48-joy/ilova/.git/worktrees/ilova-tuzatish
18:09:07.572003 trace.c:317             setup: git_common_dir: /tmp/misol/48-joy/ilova/.git
18:09:07.572005 trace.c:318             setup: worktree: /tmp/misol/48-joy/ilova-tuzatish
...
```

Ma'lumotnoma: `GIT_COMMON_DIR` berilsa, worktree'ga xos bo'lmagan fayllar shu yo'ldan olinadi; uning ustunligi `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY` kabi aniq yo'l o'zgaruvchilaridan past. Qo'lda kamdan-kam o'rnatiladi — Git `.git` faylidagi `gitdir:` va `commondir` faylidan o'zi hisoblaydi.

## Kod: dotfiles repo — `GIT_DIR` + `GIT_WORK_TREE`

Mashhur usul: uy papkasidagi sozlama fayllarini (`.bashrc`, `.config/nvim/...`) Git'da saqlash, lekin uy papkasini to'liq repo'ga aylantirmaslik. Yechim — `.git` o'rniga alohida nomli bare repo va working tree sifatida uy papkasi. Bu yerda "uy" — sinov papkasi `uy/`:

```text
$ ls -A
.bashrc
.config
Hujjatlar
$ git init -q --bare .dotfiles
$ export GIT_DIR=$PWD/.dotfiles GIT_WORK_TREE=$PWD
$ git config status.showUntrackedFiles no
$ git status --short
$ git add .bashrc .config/nvim/init.vim
$ git commit -q -m "Dotfiles: bash va nvim"
$ git status
On branch main
nothing to commit (use -u to show untracked files)
$ git ls-files
.bashrc
.config/nvim/init.vim
$ git log --oneline --stat
6e0e472 Dotfiles: bash va nvim
 .bashrc               | 1 +
 .config/nvim/init.vim | 1 +
 2 files changed, 2 insertions(+)
```

Nima bo'ldi:

- `--bare` — repo'da o'zining working tree'si yo'q (`core.bare = true`), lekin `GIT_WORK_TREE` berilgani uchun Git uy papkasini working tree deb oldi. `GIT_WORK_TREE` `core.bare` dan ustun.
- `status.showUntrackedFiles no` — **muhim**. Usiz `git status` uy papkasidagi minglab "kuzatilmagan" faylni chiqarardi. Bu sozlama `.dotfiles/config` ga yozildi, ya'ni faqat shu repo'ga ta'sir qiladi.
- `export` dan keyin `GIT_DIR` shu terminaldagi **hamma** git buyrug'iga ta'sir qiladi — boshqa loyihaga `cd` qilsangiz ham. Shuning uchun amalda `export` emas, alias ishlatiladi:

```bash
alias dot='git --git-dir=$HOME/.dotfiles --work-tree=$HOME'
dot status
dot add .vimrc && dot commit -m "vim"
```

```text
$ unset GIT_DIR GIT_WORK_TREE
$ git status --short
fatal: not a git repository (or any of the parent directories): .git
$ git --git-dir=$PWD/.dotfiles --work-tree=$PWD log --oneline
6e0e472 Dotfiles: bash va nvim
```

Bitta tuzoq: repo papkasi `.git` deb nomlanmagani uchun Git uni "o'zimniki" deb tanimaydi. `-u` bilan qarasak:

```text
$ git status --short -u
?? .bashrc
?? .config/nvim/init.vim
?? .dotfiles/HEAD
?? .dotfiles/config
?? .dotfiles/description
?? .dotfiles/hooks/applypatch-msg.sample
...
?? Hujjatlar/xat.txt
```

(bu chiqish `export` dan keyin, birinchi `git add` dan oldin olingan). `.dotfiles/` ning o'zi kuzatilmagan fayl sifatida ko'rinyapti — `git add .` qilinsa, repo o'zini o'ziga qo'shib yuboradi. Himoya — repo papkasini o'zining exclude fayliga yozish:

```text
$ echo .dotfiles >> .dotfiles/info/exclude
$ git status --short -u
?? Hujjatlar/xat.txt
```

Boshqa kompyuterga ko'chirishda: `git clone --bare <url> ~/.dotfiles`, keyin `dot checkout` (mavjud fayllar bilan to'qnashsa, avval ularni chetga oling).

## Kod: ikkinchi index — `GIT_INDEX_FILE`

Index ([15-bob](15-tree-va-index.md)) — `.git/index` fayli: keyingi commit'ning tayyorlanayotgan surati. `GIT_INDEX_FILE` boshqa faylni index sifatida ishlatishni buyuradi. Bu bilan **asosiy staging'ga tegmasdan** boshqa commit yasash mumkin.

Vaziyat: `app.js` va `yangi.js` stage qilingan, chala ish. Shu payt `README.md` dagi xatoni alohida branch'ga tuzatish kerak:

```text
$ git status --short
M  app.js
A  yangi.js
$ GIT_INDEX_FILE=.git/index-docs git read-tree HEAD
$ GIT_INDEX_FILE=.git/index-docs git ls-files --stage
100644 772a81e2ac0916c63f9d68308f9cce4fe3491081 0	README.md
100644 626799f0f85326a8c1fc522db584e86cdfccd51f 0	app.js
100644 8d5ebb9cc550999d85599c93344ba9f079ad676d 0	sozlama.env
```

`read-tree HEAD` yangi index faylini oxirgi commit holati bilan to'ldirdi — unda chala `yangi.js` yo'q, `app.js` eski versiyada. Endi faqat README'ni o'zgartirib, shu index'ga qo'shamiz va plumbing buyruqlari ([16-bob](16-commit-obyekti.md)) bilan commit yasaymiz:

```text
$ echo '# Loyiha (yangilangan)' > README.md
$ GIT_INDEX_FILE=.git/index-docs git add README.md
$ GIT_INDEX_FILE=.git/index-docs git diff --cached --stat
 README.md | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
$ GIT_INDEX_FILE=.git/index-docs git write-tree
155c04698c5b7552aa49411bdf189e5078f2c353
$ GIT_AUTHOR_DATE=2026-10-07T10:05:00+05:00 GIT_COMMITTER_DATE=2026-10-07T10:05:00+05:00 git commit-tree 155c04698c5b7552aa49411bdf189e5078f2c353 -p HEAD -m 'docs: README yangilandi'
a151dc8e6d3e6b0cac739433eb8823420d3fd599
$ git update-ref refs/heads/docs a151dc8e6d3e6b0cac739433eb8823420d3fd599
$ git log --oneline --all --graph
* a151dc8 docs: README yangilandi
* 1377dfb Boshlang'ich
```

Asosiy index'ga nima bo'ldi?

```text
$ git status --short
 M README.md
M  app.js
A  yangi.js
$ git diff --cached --stat
 app.js   | 2 +-
 yangi.js | 1 +
 2 files changed, 2 insertions(+), 1 deletion(-)
$ ls -l .git/index .git/index-docs
-rw-r--r--@ 1 ali  staff  342 Oct  8 18:04 .git/index
-rw-r--r--@ 1 ali  staff  289 Oct  8 18:04 .git/index-docs
```

Hech narsa: stage qilingan `app.js` va `yangi.js` joyida, `README.md` esa asosiy index nuqtai nazaridan "o'zgargan, stage qilinmagan" (` M`). `docs` branch'ida esa faqat README tuzatishi bor. Ikkita mustaqil staging maydoni bitta working tree ustida.

Qayerda ishlatiladi: [47-bobda](47-hooklar.md) `commit -a` hook'ga vaqtinchalik `.git/index.lock` ni `GIT_INDEX_FILE` sifatida berganini ko'rgan edik — Git o'zi shu mexanizm bilan "qisman" commit'larni tayyorlaydi. Skriptlar (masalan, avtomatik "snapshot" yoki boshqa branch'ga fayl yozuvchi deploy skripti) ham shunday qiladi. Ish tugagach vaqtinchalik index'ni o'chiring: `rm .git/index-docs`.

`GIT_INDEX_VERSION` (2, 3 yoki 4) — yangi yoziladigan index formatini tanlaydi, mavjud fayllarga ta'sir qilmaydi.

## Kod: obyekt ombori — `GIT_OBJECT_DIRECTORY` va alternates

`GIT_OBJECT_DIRECTORY` — `.git/objects` o'rniga boshqa papka ([14-bob](14-obyektlar-blob.md)). `GIT_ALTERNATE_OBJECT_DIRECTORIES` — obyekt asosiy omborda topilmasa, qo'shimcha qarab chiqiladigan papkalar ro'yxati (`:` bilan, Windows'da `;`). Ma'lumotnoma: alternates'ga **yangi obyekt yozilmaydi**, ular faqat o'qish uchun. Pro Git misoli: bir xil katta fayllari bor ko'p loyiha — har birida nusxa saqlamaslik.

```text
$ mkdir ../ombor
$ echo 'katta fayl' | GIT_OBJECT_DIRECTORY=../ombor git hash-object -w --stdin
e043a6a0f3241f2bace13fa71961b4dab268a968
$ find ../ombor -type f
../ombor/e0/43a6a0f3241f2bace13fa71961b4dab268a968
$ find .git/objects -type f
$ git cat-file -p e043a6a
fatal: Not a valid object name e043a6a
$ GIT_ALTERNATE_OBJECT_DIRECTORIES=../ombor git cat-file -p e043a6a
katta fayl
```

Blob tashqi papkaga yozildi (repo'ning o'z `objects` i bo'sh), repo uni oddiy holda ko'rmaydi, alternates bilan ko'radi. Doimiy shakli — `.git/objects/info/alternates` fayli; undagi nisbiy yo'l `objects` papkasiga nisbatan hisoblanadi:

```text
$ echo '../../../ombor' > .git/objects/info/alternates
$ git cat-file -p e043a6a
katta fayl
$ git count-objects -v
count: 0
size: 0
in-pack: 0
packs: 0
size-pack: 0
prune-packable: 0
garbage: 0
size-garbage: 0
alternate: /tmp/misol/48-obyekt/ombor
```

`git clone --shared` va `--reference` aynan shu faylni yozadi ([4-bob](04-repo-olish.md)). Xavfi: alternate ombordagi obyekt o'chirilsa (masalan, u yerda `gc` ishlasa), sizning repo'ngiz buziladi — o'zida nusxa yo'q. Yo'lda `:` yoki `"` bo'lsa, elementni C uslubidagi qo'shtirnoqqa olish mumkin (ma'lumotnoma: `"path-with-\"-and-:-in-it":vanilla-path` — ikki yo'l).

Yangi repo formatini tanlovchi ikki o'zgaruvchi ham shu guruhda (ma'lumotnoma; klon paytida e'tiborsiz qoldiriladi — remote'niki olinadi):

```text
$ GIT_DEFAULT_HASH=sha256 git init -q h256
$ git -C h256 rev-parse --show-object-format
sha256
$ GIT_DEFAULT_REF_FORMAT=reftable git init -q rt
$ git -C rt rev-parse --show-ref-format
reftable
```

(`sha256` — [14-bob](14-obyektlar-blob.md), `reftable` — [17-bob](17-reflar-va-head.md).)

## Kod: pathspec — yulduzcha qachon yulduzcha

**Pathspec** — Git buyruqlariga beriladigan yo'l namunasi (`git add '*.c'`, `git log -- src/`). Pro Git aytganidek, wildcard'lar (`*`, `?`, `[...]`) bor. Muhit o'zgaruvchilari ularning standart ma'nosini butun buyruq uchun o'zgartiradi. Sinov uchun ataylab noqulay fayl nomlari: nomida haqiqiy `*` belgisi bor fayl va katta harfli `BIG.C`:

```text
$ git ls-files
BIG.C
main.c
src/util.c
yulduz*.c
$ git ls-files '*.c'
main.c
src/util.c
yulduz*.c
```

Standart holatda `*` **`/` ni ham qamraydi** — `src/util.c` ham tushdi. Endi har bir o'zgaruvchi:

```text
$ GIT_GLOB_PATHSPECS=1 git ls-files '*.c'
main.c
yulduz*.c
$ GIT_GLOB_PATHSPECS=1 git ls-files '**/*.c'
main.c
src/util.c
yulduz*.c
$ GIT_NOGLOB_PATHSPECS=1 git ls-files '*.c'
$ GIT_NOGLOB_PATHSPECS=1 git ls-files 'yulduz*.c'
yulduz*.c
$ GIT_NOGLOB_PATHSPECS=1 git ls-files ':(glob)*.c'
main.c
yulduz*.c
$ GIT_LITERAL_PATHSPECS=1 git ls-files 'yulduz*.c'
yulduz*.c
$ GIT_LITERAL_PATHSPECS=1 git ls-files ':(glob)*.c'
$ GIT_ICASE_PATHSPECS=1 git ls-files '*.c'
BIG.C
main.c
src/util.c
yulduz*.c
$ GIT_GLOB_PATHSPECS=1 GIT_NOGLOB_PATHSPECS=1 git ls-files '*.c'
fatal: global 'glob' and 'noglob' pathspec settings are incompatible
```

| O'zgaruvchi | Ma'nosi | Bitta pathspec uchun "magic" |
| --- | --- | --- |
| (hech narsa) | `*` istalgan belgiga, shu jumladan `/` ga mos | — |
| `GIT_GLOB_PATHSPECS=1` | shell'dagi kabi glob: `*` `/` ni kesmaydi, `**` papkalarni kesadi | `:(glob)` |
| `GIT_NOGLOB_PATHSPECS=1` | wildcard yo'q, `*` — oddiy belgi; lekin `:(glob)` ishlaydi | `:(literal)` |
| `GIT_LITERAL_PATHSPECS=1` | hamma narsa so'zma-so'z, `:(...)` prefikslari ham ishlamaydi | — |
| `GIT_ICASE_PATHSPECS=1` | katta-kichik harf farqlanmaydi | `:(icase)` |

Pro Git bilan farq: u "`GIT_GLOB_PATHSPECS=1` — wildcard'lar wildcard bo'lib ishlaydi (bu standart holat)" deydi. Sinov ko'rsatdiki, `glob` rejimi standartdan **farq qiladi**: `*.c` endi `src/util.c` ga mos kelmadi. Ma'lumotnoma ham uni "glob magic" deb ataydi, standart emas.

`GIT_LITERAL_PATHSPECS` nega kerak? Ma'lumotnoma: yo'llarni Git'ning o'zidan olib (`git ls-tree`, `--raw` diff chiqishi) qayta Git'ga berayotgan skript uchun. Fayl nomida `*` yoki `[` bo'lsa (`yulduz*.c` kabi), oddiy rejimda u namuna sifatida o'qilib, kutilmagan boshqa fayllarni ham qamrab oladi.

## Kod: commit muallifi va sanalari

Pro Git: commit obyektini oxir-oqibat `git commit-tree` yasaydi va u ma'lumotni **avval** muhit o'zgaruvchilaridan, ular bo'lmasa config'dan oladi. Olti o'zgaruvchi: `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_AUTHOR_DATE`, `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL`, `GIT_COMMITTER_DATE`. Ma'lumotnoma qo'shimchasi: ular teg obyektlari va reflog yozuvlariga ham ta'sir qiladi, `user.*` hamda `author.*`/`committer.*` sozlamalaridan ustun.

Ustunlikni tekshiramiz. Wrapper muallif o'zgaruvchilarini o'rnatgan, biz `-c user.name` beramiz:

```text
$ git -c user.name='Boshqa Odam' -c user.email=boshqa@example.com commit -q -m 'Birinchi'
$ git log -1 --format='%an <%ae> | %cn <%ce>'
Ali Valiyev <ali@example.com> | Ali Valiyev <ali@example.com>
```

`-c` bo'lsa ham, muhit g'olib — bu bobda "buyruq qatori har doim ustun" degan qoidadan muhim istisno: `user.name` — sozlama, `-c` uni faqat sozlama darajasida o'zgartiradi. CI'da "nega commit boshqa nom bilan chiqdi?" degan savolning javobi ko'pincha shu: muhitda `GIT_AUTHOR_*` qolib ketgan.

Muallif va committer'ni alohida berish — boshqa odamning patch'ini qo'llashdagi holat ([33-bob](33-hissa-qoshish.md)):

```text
$ GIT_AUTHOR_NAME='Vali Aliyev' GIT_AUTHOR_EMAIL=vali@example.com GIT_AUTHOR_DATE='2026-10-01T09:30:00+05:00' git commit -q -m 'Valining patchi'
$ git log -1 --format='author:    %an <%ae> %ad%ncommitter: %cn <%ce> %cd' --date=iso
author:    Vali Aliyev <vali@example.com> 2026-10-01 09:30:00 +0500
committer: Ali Valiyev <ali@example.com> 2026-10-07 10:00:00 +0500
$ git cat-file -p HEAD
tree f4b354863caa9cea99b95422c9dab70465757d87
parent 2e5e01c876bf1efd5544e12a55bb57b3043aad6c
author Vali Aliyev <vali@example.com> 1790829000 +0500
committer Ali Valiyev <ali@example.com> 1791349200 +0500

Valining patchi
```

Commit obyektida sana — Unix vaqti (1970-yildan beri soniyalar) va mintaqa. Sana formatlari (ma'lumotnoma `git commit`, DATE FORMATS): Git ichki formati `@<soniya> <mintaqa>`, RFC 2822 va ISO 8601:

```text
$ GIT_AUTHOR_DATE='@1791349200 +0000' GIT_COMMITTER_DATE='Wed, 7 Oct 2026 12:00:00 +0500' git commit -q -m 'Sana formatlari'
$ git log -1 --format='%ad | %cd' --date=iso
2026-10-07 05:00:00 +0000 | 2026-10-07 12:00:00 +0500
$ GIT_AUTHOR_DATE='2 days ago' git var GIT_AUTHOR_IDENT
fatal: invalid date format: 2 days ago
```

`git log --since="2 days ago"` dagi "erkin" sanalar bu yerda ishlamaydi — muhit o'zgaruvchisi qat'iy formatni talab qiladi.

`--amend` va `rebase` muallif sanasini saqlaydi, committer sanasini yangilaydi ([11-bob](11-bekor-qilish.md), [24-bob](24-rebase.md)); committer sanasini ham boshqarish kerak bo'lsa — `GIT_COMMITTER_DATE`:

```text
$ GIT_COMMITTER_DATE='2026-10-07T11:00:00+05:00' git commit -q --amend --no-edit
$ git log -1 --format='%ad | %cd' --date=iso
2026-10-07 05:00:00 +0000 | 2026-10-07 11:00:00 +0500
```

### `EMAIL` — oxirgi chora

Pro Git: `user.email` sozlanmagan bo'lsa, `EMAIL` ishlatiladi; u ham bo'lmasa — tizim foydalanuvchi nomi va kompyuter nomidan yasaladi. Wrapper email o'zgaruvchilarini o'rnatgani uchun ularni olib tashlab sinaymiz:

```text
$ env -u GIT_AUTHOR_EMAIL -u GIT_COMMITTER_EMAIL EMAIL=pochta@example.com git var GIT_AUTHOR_IDENT
Ali Valiyev <ali@example.com> 1791349200 +0500
$ env -u GIT_AUTHOR_EMAIL -u GIT_COMMITTER_EMAIL EMAIL=pochta@example.com GIT_CONFIG_GLOBAL=/dev/null git var GIT_AUTHOR_IDENT
Ali Valiyev <pochta@example.com> 1791349200 +0500
```

Birinchida global `user.email` bor — `EMAIL` e'tiborsiz. Ikkinchida global config o'chirilgan — `EMAIL` ishladi. To'liq tartib: `GIT_AUTHOR_EMAIL` → `author.email` → `user.email` → `EMAIL` → tizimdan taxmin. Bir buyruq bilan hammasini ko'rish:

```text
$ git var -l | grep IDENT
GIT_COMMITTER_IDENT=Ali Valiyev <ali@example.com> 1791349200 +0500
GIT_AUTHOR_IDENT=Ali Valiyev <ali@example.com> 1791349200 +0500
```

## Kod: tarmoq

### `GIT_SSH_COMMAND`, `GIT_SSH`, `GIT_SSH_VARIANT`

[30-bobda](30-ssh-va-credential.md) `GIT_SSH_COMMAND` bilan soxta `ssh` yasab, ustunlik tartibini (`GIT_SSH_COMMAND` > `core.sshCommand` > `GIT_SSH` > `ssh`) ko'rgan edik. Bu yerda — Git qiymatni **qanday** ishga tushirishi. Pro Git'ning odatiy misoli — boshqa kalit bilan ulanish:

```text
$ GIT_SSH_COMMAND='ssh -i ~/.ssh/ish_kaliti -o IdentitiesOnly=yes' GIT_TRACE=1 git ls-remote ssh://git@127.0.0.1:1/x.git 2>&1 | grep start_command
18:05:15.126456 run-command.c:765       trace: start_command: /bin/sh -c 'ssh -i ~/.ssh/ish_kaliti -o IdentitiesOnly=yes "$@"' 'ssh -i ~/.ssh/ish_kaliti -o IdentitiesOnly=yes' -o SendEnv=GIT_PROTOCOL -p 1 git@127.0.0.1 'git-upload-pack '\''/x.git'\'''
```

`GIT_SSH_COMMAND` shell (`/bin/sh -c '... "$@"'`) orqali ishga tushadi — shuning uchun unga argumentlar va `~` yozish mumkin. Git o'z argumentlarini oxiriga qo'shadi: `-o SendEnv=GIT_PROTOCOL` (protokol versiyasini serverga yetkazish, [29-bob](29-fetch-push-ichidan.md)), `-p <port>`, `user@host` va serverda bajariladigan buyruq. `GIT_SSH` esa shell'siz, faqat dastur yo'li — qo'shimcha argument kerak bo'lsa, o'rash skripti yozish kerak (Pro Git, ma'lumotnoma).

Qaysi argumentlar qo'shilishi **ssh varianti**ga bog'liq. Nomi `ssh` bo'lmagan dastur uchun Git avval `<dastur> -G` bilan OpenSSH ekanini tekshiradi, javob bermasa — `simple` variant (faqat host va buyruq). Soxta ssh skripti bilan:

```text
$ cat soxta-ssh
#!/bin/sh
# ssh o'rniga: argumentlarni ko'rsatadi, buyruqni shu kompyuterda bajaradi
echo "soxta-ssh argv: $*" >&2
for a; do oxirgi=$a; done
exec sh -c "$oxirgi"
$ GIT_SSH_COMMAND=$PWD/soxta-ssh git ls-remote ssh://ali@server.example.com:2222/tmp/misol/48-tarmoq/server.git
fatal: ssh variant 'simple' does not support setting port
$ GIT_SSH_COMMAND=$PWD/soxta-ssh GIT_SSH_VARIANT=ssh git ls-remote ssh://ali@server.example.com:2222/tmp/misol/48-tarmoq/server.git
soxta-ssh argv: -o SendEnv=GIT_PROTOCOL -p 2222 ali@server.example.com git-upload-pack '/tmp/misol/48-tarmoq/server.git'
599b7e6a584e784a965d77de4a1e4426df3d4754	HEAD
599b7e6a584e784a965d77de4a1e4426df3d4754	refs/heads/main
```

`simple` variantda port berib bo'lmaydi — fatal. `GIT_SSH_VARIANT=ssh` (yoki `ssh.variant` sozlamasi) aniqlashni bekor qiladi; qiymatlar: `ssh`, `simple`, `plink`, `putty`, `tortoiseplink`, `auto`. Ma'lumotnoma maslahati: odatda bularning hammasidan ko'ra `~/.ssh/config` qulayroq.

### `GIT_ALLOW_PROTOCOL` — qaysi transportlarga ruxsat

`:` bilan ajratilgan protokollar ro'yxati; berilsa, qolganlari taqiqlanadi (`protocol.allow=never` + ro'yxatdagilarga `always`). Lokal yo'l ham protokol — `file`:

```text
$ GIT_ALLOW_PROTOCOL=https:ssh git clone -q server.git nusxa
fatal: transport 'file' not allowed
$ GIT_ALLOW_PROTOCOL=file git clone -q server.git nusxa && echo tayyor
tayyor
```

Ishonchsiz URL'larni qabul qiladigan xizmatlarda (masalan, foydalanuvchi bergan repo'ni klon qiluvchi CI) `GIT_ALLOW_PROTOCOL=https:ssh` — `ext::` kabi buyruq bajaradigan transportlarni yopadi. Yaqin qarindoshi `GIT_PROTOCOL_FROM_USER=0` — `user` darajasidagi protokollarni (masalan, ishonchsiz repo'dagi submodule'lar uchun) taqiqlaydi.

### Parol so'rash: `GIT_ASKPASS`, `GIT_TERMINAL_PROMPT`

Ikkalasi [30-bobda](30-ssh-va-credential.md) haqiqiy chiqish bilan ko'rsatilgan; qisqacha:

- `GIT_ASKPASS=<dastur>` — login/parol kerak bo'lganda Git shu dasturni savol matni bilan (`Username for 'https://...': `) chaqiradi va javobni uning stdout'idan oladi. `core.askPass` va `SSH_ASKPASS` dan ustun.
- `GIT_TERMINAL_PROMPT=0` — terminaldan so'ramaslik. CI'da muhim: aks holda job ko'rinmas savolda "osilib" qoladi.

```text
$ printf 'protocol=https\nhost=example.com\n\n' | GIT_TERMINAL_PROMPT=0 git credential fill
fatal: could not read Username for 'https://example.com': terminal prompts disabled
```

### HTTP: `GIT_SSL_NO_VERIFY` va `GIT_HTTP_*`

HTTP(S) ishlarini Git `curl` kutubxonasi orqali bajaradi. Ko'p `http.*` sozlamaning muhitdagi juftligi bor (`config/http` ma'lumotnomasi):

| O'zgaruvchi | Sozlama | Ma'nosi |
| --- | --- | --- |
| `GIT_SSL_NO_VERIFY` | `http.sslVerify=false` | Sertifikatni **tekshirmaslik** (har qanday qiymat) |
| `GIT_SSL_CAINFO`, `GIT_SSL_CAPATH` | `http.sslCAInfo`, `http.sslCAPath` | Ishonchli CA sertifikatlari fayli/papkasi |
| `GIT_SSL_CERT`, `GIT_SSL_KEY` | `http.sslCert`, `http.sslKey` | Mijoz sertifikati (mTLS) |
| `GIT_HTTP_LOW_SPEED_LIMIT`, `GIT_HTTP_LOW_SPEED_TIME` | `http.lowSpeedLimit`, `http.lowSpeedTime` | Tezlik N bayt/s dan past bo'lib T soniya davom etsa — uzish |
| `GIT_HTTP_USER_AGENT` | `http.userAgent` | User-Agent sarlavhasi (standart: `git/<versiya>`) |
| `GIT_HTTP_MAX_REQUESTS` | `http.maxRequests` | Parallel so'rovlar (standart 5) |
| `GIT_HTTP_MAX_RETRIES`, `GIT_HTTP_RETRY_AFTER`, `GIT_HTTP_MAX_RETRY_TIME` | `http.maxRetries`, ... | Qayta urinishlar |
| `GIT_HTTP_PROXY_AUTHMETHOD` | `http.proxyAuthMethod` | Proksi autentifikatsiyasi |
| `GIT_TRACE_CURL` | — | `curl --trace-ascii` kabi to'liq dump (debug bo'limi) |

**`GIT_SSL_NO_VERIFY` — xavfli.** Pro Git uni o'z-o'zidan imzolangan sertifikatli yoki hali sertifikati o'rnatilmagan server uchun tilga oladi. Lekin tekshiruv o'chirilsa, Git **kim bilan gaplashayotganini bilmaydi**: tarmoqdagi istalgan "o'rtadagi odam" (masalan, jamoat Wi-Fi'si yoki buzilgan router) o'zini server deb ko'rsatib, login/token'ingizni oladi va sizga o'zgartirilgan kodni beradi. Ayniqsa `export` qilib yoki CI o'zgaruvchisiga qo'yib unutib yuborilsa. To'g'ri yo'l — o'sha serverning sertifikatini ishonchli deb ko'rsatish, tekshiruvni o'chirmasdan:

```bash
GIT_SSL_CAINFO=/path/ichki-ca.pem git clone https://git.ichki.example/loyiha.git
# yoki doimiy, faqat shu server uchun:
git config --global http.https://git.ichki.example/.sslCAInfo /path/ichki-ca.pem
```

Pro Git'dagi `GIT_CURL_VERBOSE` hali ishlaydi, lekin Git 2.28 reliz yozuvlariga ko'ra u `GIT_TRACE_CURL` ustiga qayta yozilgan; ma'lumotnomaning asosiy ro'yxatida `GIT_TRACE_CURL` turadi.

## Kod: diff va merge

### `GIT_DIFF_OPTS` — kontekst qatorlari

Pro Git: nomi chalg'ituvchi — yagona to'g'ri qiymat `-u<n>` yoki `--unified=<n>`. Ma'lumotnoma qo'shimchasi: u buyruq qatoridagi `-U` dan ham **ustun**:

```text
$ GIT_DIFF_OPTS=-u1 git diff sonlar.txt
diff --git a/sonlar.txt b/sonlar.txt
index f00c965..2aeb61f 100644
--- a/sonlar.txt
+++ b/sonlar.txt
@@ -4,3 +4,3 @@
 4
-5
+BESH
 6
$ GIT_DIFF_OPTS=-u1 git diff -U5 sonlar.txt
diff --git a/sonlar.txt b/sonlar.txt
index f00c965..2aeb61f 100644
--- a/sonlar.txt
+++ b/sonlar.txt
@@ -4,3 +4,3 @@
 4
-5
+BESH
 6
```

`-U5` so'radik, baribir 1 qator kontekst. Muhitda `GIT_DIFF_OPTS` qolib ketgan bo'lsa, `-U` "ishlamay" qoladi — g'alati xatoning manbai.

### `GIT_EXTERNAL_DIFF`, `GIT_DIFF_PATH_COUNTER`, `GIT_DIFF_PATH_TOTAL`

`GIT_EXTERNAL_DIFF` — `diff.external` sozlamasining muhitdagi juftligi: ichki diff o'rniga sizning dasturingiz chaqiriladi. 7 argument (`yo'l eski-fayl eski-hash eski-rejim yangi-fayl yangi-hash yangi-rejim`) [45-bobda](45-config-chuqur.md) batafsil ko'rilgan. Bu yerda Pro Git alohida tilga olgan ikki yordamchi o'zgaruvchi — nechanchi fayl va jami nechta:

```text
$ cat ../tashqi-diff.sh
#!/bin/sh
echo "[$GIT_DIFF_PATH_COUNTER/$GIT_DIFF_PATH_TOTAL] $# ta argument"
echo "  yo'l=$1"
echo "  eski: fayl=$2 hash=$3 rejim=$4"
echo "  yangi: fayl=$5 hash=$6 rejim=$7"
$ GIT_EXTERNAL_DIFF=../tashqi-diff.sh git diff
[1/3] 7 ta argument
  yo'l=a.txt
  eski: fayl=/tmp/git-blob-fNc5Io/a.txt hash=4de65895076ffaf8572ae06909fa475a10567eea rejim=100644
  yangi: fayl=a.txt hash=0000000000000000000000000000000000000000 rejim=100644
[2/3] 7 ta argument
  yo'l=sonlar.txt
  eski: fayl=/tmp/git-blob-A9NPcd/sonlar.txt hash=f00c965d8307308469e537302baa73048488f162 rejim=100644
  yangi: fayl=sonlar.txt hash=0000000000000000000000000000000000000000 rejim=100644
[3/3] 7 ta argument
  yo'l=yangi.txt
  eski: fayl=/dev/null hash=. rejim=.
  yangi: fayl=yangi.txt hash=0000000000000000000000000000000000000000 rejim=100644
$ GIT_EXTERNAL_DIFF=../tashqi-diff.sh git diff --no-ext-diff --stat
 a.txt      | 1 +
 sonlar.txt | 2 +-
 yangi.txt  | 1 +
 3 files changed, 3 insertions(+), 1 deletion(-)
```

Kuzatuvlar: index'dagi eski nusxa vaqtinchalik faylga (`$TMPDIR/git-blob-...`) chiqarildi — dastur tugagach Git uni o'zi o'chiradi; yangi tomon — working tree'dagi fayl, hash'i hali hisoblanmagan (nol). Yangi fayl (`add -N`) uchun eski tomon `/dev/null`. Hisoblagich bilan dastur "3 tadan 1-chi" kabi progress yoki birinchi/oxirgi fayl uchun sarlavha chiqara oladi. `GIT_EXTERNAL_DIFF_TRUST_EXIT_CODE=true` bo'lsa, dastur `diff(1)` kabi "farq bor" uchun 1 qaytarishi mumkin; aks holda (standart) 0 dan boshqa kod — fatal xato.

### `GIT_MERGE_VERBOSITY`

Pro Git "rekursiv strategiya chiqishi"ni boshqaradi deydi va 0–5 darajalarni sanaydi (standart 2). Hozir: ma'lumotnomaga ko'ra `recursive` Git 2.50 dan beri `ort` ning sinonimi ([26-bob](26-murakkab-merge.md)), `merge.verbosity` ning muhitdagi juftligi esa saqlangan. Konfliktli merge bilan sinadik:

```text
$ GIT_MERGE_VERBOSITY=0 git merge feat
Automatic merge failed; fix conflicts and then commit the result.
$ GIT_MERGE_VERBOSITY=1 git merge feat
Auto-merging a.txt
CONFLICT (content): Merge conflict in a.txt
Automatic merge failed; fix conflicts and then commit the result.
$ GIT_MERGE_VERBOSITY=5 git merge feat
Auto-merging a.txt
CONFLICT (content): Merge conflict in a.txt
Automatic merge failed; fix conflicts and then commit the result.
```

`0` haqiqatan faqat yakuniy xatoni qoldirdi. Lekin 1 dan 5 gacha (2, 3, 4 ham) chiqish bir xil bo'ldi — `ort` da Pro Git sanagan nozik darajalar (o'tkazib yuborilgan fayllar, debug) bu holatda farq bermadi. Amalda foydali qiymat — skriptda shovqinni kamaytirish uchun `0`.

## Kod: Git ichiga qarash — `GIT_TRACE` oilasi

Pro Git: "Git nima qilayotganini *haqiqatan* bilmoqchimisiz?" Trace o'zgaruvchilarining qiymatlari (ma'lumotnoma):

- `1`, `2` yoki `true` — stderr'ga;
- 3 dan 9 gacha son — shu raqamli ochiq fayl deskriptoriga;
- `/` bilan boshlanadigan **mutlaq** yo'l — shu faylga qo'shib yozish;
- bo'sh, `0`, `false` yoki yo'q — o'chiq.

### `GIT_TRACE` — umumiy: alias'lar, ichki va tashqi buyruqlar

```text
$ git config set alias.lg "log --graph --oneline --decorate --all"
$ GIT_TRACE=1 git lg
18:05:56.195311 git.c:815               trace: exec: git-lg
18:05:56.195402 run-command.c:673       trace: run_command: git-lg
18:05:56.195569 git.c:453               trace: alias expansion: lg => log --graph --oneline --decorate --all
18:05:56.195572 git.c:888               trace: exec: git log --graph --oneline --decorate --all
18:05:56.195574 run-command.c:673       trace: run_command: git log --graph --oneline --decorate --all
18:05:56.195578 run-command.c:765       trace: start_command: /opt/homebrew/opt/git/libexec/git-core/git log --graph --oneline --decorate --all
18:05:56.198791 git.c:506               trace: built-in: git log --graph --oneline --decorate --all
* 8875210 (HEAD -> main) commit 3
* 10e7cb9 commit 2
* 762876c commit 1
```

O'qilishi: avval Git `git-lg` nomli dastur qidirdi (`exec: git-lg` — yuqoridagi `PATH` qoidasi), topmadi, keyin alias'ni ochdi va natijani ichki (`built-in`) `log` sifatida bajardi. Har qator boshida vaqt (mikrosoniyagacha) va Git manba kodidagi fayl:qator. `!` bilan boshlanadigan shell alias'da `start_command: /bin/sh -c ...` qatori ko'rinadi — "alias nega ishlamayapti?" savolining eng tez javobi.

Faylga yozish va keng tarqalgan xato:

```text
$ GIT_TRACE=$PWD/../trace.log git status --short; cat ../trace.log
18:05:56.241331 git.c:506               trace: built-in: git status --short
$ GIT_TRACE=../nisbiy.log git status --short
warning: unknown trace value for 'GIT_TRACE': ../nisbiy.log
         If you want to trace into a file, then please set GIT_TRACE
         to an absolute pathname (starting with /)
```

Nisbiy yo'l qabul qilinmaydi. Fayl usuli muhim: trace stderr'ni buyruqning o'z xatolari bilan aralashtirmaydi, va bitta faylga bir nechta jarayon (masalan, `fetch` va u chaqirgan `upload-pack`) yozadi.

### `GIT_TRACE_SETUP` va `GIT_TRACE_PACKET`

`GIT_TRACE_SETUP` — yuqorida, repo topish bo'limida. `GIT_TRACE_PACKET` — tarmoq protokolining har paketi; [29-bobda](29-fetch-push-ichidan.md) `want`/`have` muzokarasi bilan to'liq ko'rilgan. Ma'lumotnoma: `PACK` bilan boshlanadigan paketdan keyin trace to'xtaydi; packfile'ning o'zini yozib olish uchun — `GIT_TRACE_PACKFILE=/tmp/olingan.pack` (hozircha faqat klient tomonida, `clone`/`fetch` uchun).

### `GIT_TRACE_PACK_ACCESS` — packfile'ga murojaatlar

Har satr: qaysi packfile va undagi qaysi joy (offset, baytlarda). Obyektlar pack'da bo'lishi uchun avval `gc` ([18-bob](18-packfile-va-gc.md)):

```text
$ git gc -q
$ GIT_TRACE_PACK_ACCESS=1 git show --stat --oneline HEAD~1
18:06:06.243525 packfile.c:1492         .git/objects/pack/pack-0dfca5e0106e79dca2f43c585fa5c76741ba245b.pack 573
18:06:06.243633 packfile.c:1492         .git/objects/pack/pack-0dfca5e0106e79dca2f43c585fa5c76741ba245b.pack 559
18:06:06.243649 packfile.c:1492         .git/objects/pack/pack-0dfca5e0106e79dca2f43c585fa5c76741ba245b.pack 161
18:06:06.243687 packfile.c:1492         .git/objects/pack/pack-0dfca5e0106e79dca2f43c585fa5c76741ba245b.pack 439
10e7cb9 commit 2
 f2.txt | 1 +
 1 file changed, 1 insertion(+)
```

To'rtta o'qish: commit, uning ota-onasi va ikki tree (stat uchun). Katta repo'da bu ro'yxat minglab qator bo'ladi va qaysi pack "qizib" ketganini, qaysi buyruq kutilmaganda butun tarixni o'qiyotganini ko'rsatadi.

### `GIT_TRACE_PERFORMANCE` — har buyruq qancha vaqt oldi

```text
$ GIT_TRACE_PERFORMANCE=1 git gc
18:05:56.327166 trace.c:416             performance: 0.001020000 s: git command: /opt/homebrew/opt/git/libexec/git-core/git pack-refs --all --prune
18:05:56.332563 trace.c:416             performance: 0.001509000 s: git command: /opt/homebrew/opt/git/libexec/git-core/git reflog expire --all
18:05:56.336793 trace.c:416             performance: 0.000372000 s: git command: /opt/homebrew/opt/git/libexec/git-core/git worktree prune --expire 3.months.ago
18:05:56.340402 trace.c:416             performance: 0.000202000 s: git command: /opt/homebrew/opt/git/libexec/git-core/git rerere gc
18:05:56.348748 read-cache.c:2378       performance: 0.000025000 s:  read cache .git/index
18:05:56.350196 trace.c:416             performance: 0.002547000 s: git command: /opt/homebrew/opt/git/libexec/git-core/git pack-objects --local --delta-base-offset --honor-pack-keep .git/objects/pack/.tmp-81925-pack --keep-true-parents --non-empty --all --reflog --indexed-objects
18:05:56.355068 trace.c:416             performance: 0.001211000 s: git command: /opt/homebrew/opt/git/libexec/git-core/git pack-objects --local --delta-base-offset --honor-pack-keep .git/objects/pack/.tmp-81925-pack --cruft --cruft-expiration=2.weeks.ago --non-empty
18:05:56.356262 trace.c:416             performance: 0.012268000 s: git command: /opt/homebrew/opt/git/libexec/git-core/git repack -d -l --cruft --cruft-expiration=2.weeks.ago
18:05:56.360928 trace.c:416             performance: 0.001063000 s: git command: /opt/homebrew/opt/git/libexec/git-core/git prune --expire 2.weeks.ago
18:05:56.361979 trace.c:416             performance: 0.040000000 s: git command: /opt/homebrew/opt/git/bin/git gc
```

Bu `gc` ning "ichki retsepti" ham: `pack-refs`, `reflog expire`, `worktree prune`, `rerere gc`, `repack` (u o'z navbatida ikki `pack-objects` chaqiradi — biri tirik obyektlar, biri `--cruft`) va `prune`. Pro Git'dagi (2014-yil) chiqishdan farq: `--unpack-unreachable` o'rnida endi **cruft pack** ([18-bob](18-packfile-va-gc.md)), `worktree prune` qo'shilgan, `update-server-info` yo'q. Oxirgi qator — umumiy vaqt (0.04 s).

### `GIT_TRACE_REFS` va boshqa maxsus trace'lar

`GIT_TRACE_REFS` ref bazasiga har murojaatni ko'rsatadi ([17-bob](17-reflar-va-head.md)). `git branch yangi` dan parchalar:

```text
$ GIT_TRACE_REFS=1 git branch yangi
18:06:06.305780 refs/debug.c:28         ref_store for .git
18:06:06.305884 refs/debug.c:242        read_raw_ref: HEAD: 0000000000000000000000000000000000000000 (=> refs/heads/main) type 1: 0
18:06:06.305900 refs/debug.c:242        read_raw_ref: refs/heads/main: 887521035ef42d7c357e7a4acd2d301340202deb (=> refs/heads/main) type 2: 0
18:06:06.305909 refs/debug.c:246        read_raw_ref: refs/heads/yangi: -1 (errno 2)
18:06:06.305914 refs/debug.c:246        read_raw_ref: main: -1 (errno 2)
18:06:06.305917 refs/debug.c:246        read_raw_ref: refs/main: -1 (errno 2)
18:06:06.305920 refs/debug.c:246        read_raw_ref: refs/tags/main: -1 (errno 2)
18:06:06.305922 refs/debug.c:242        read_raw_ref: refs/heads/main: 887521035ef42d7c357e7a4acd2d301340202deb (=> refs/heads/main) type 2: 0
...
18:06:06.306793 refs/debug.c:93         transaction {
18:06:06.306794 refs/debug.c:88         0: refs/heads/yangi 0000000000000000000000000000000000000000 -> 887521035ef42d7c357e7a4acd2d301340202deb (F=0xc, T=0x0) "branch: Created from main"
18:06:06.306796 refs/debug.c:99         }
18:06:06.306796 refs/debug.c:112        finish: 0
...
```

Bu yerda [19-bobdagi](19-revision-tanlash.md) qidiruv qoidasi jonli ko'rinadi: `main` nomi uchun Git ketma-ket `main`, `refs/main`, `refs/tags/main`, `refs/heads/main` ni sinadi (`errno 2` — "fayl yo'q"). Keyin tranzaksiya: nol hash'dan (ref yo'q edi) `8875210...` ga, reflog xabari bilan.

Qolganlari (ma'lumotnoma): `GIT_TRACE_FSMONITOR` (fsmonitor kengaytmasi), `GIT_TRACE_SHALLOW` (sayoz klon), `GIT_TRACE_CURL` va `GIT_TRACE_CURL_NO_DATA` (HTTP — faqat sarlavhalar). Trace'lar standart bo'yicha cookie, `Authorization:` va `Proxy-Authorization:` sarlavhalarini **yashiradi**; `GIT_TRACE_REDACT=0` buni o'chiradi — bunday log'ni hech kimga yubormang.

### `GIT_TRACE2`, `GIT_TRACE2_EVENT`, `GIT_TRACE2_PERF`

Trace2 — yangiroq, tuzilgan kuzatuv tizimi. Uch format:

```text
$ GIT_TRACE2=1 git status --short
18:06:06.250886 common-init.c:77                  version 2.56.0
18:06:06.251037 common-init.c:78                  start /opt/homebrew/opt/git/bin/git status --short
...
18:06:06.251229 repository.c:256                  worktree /tmp/misol/48-trace/t
18:06:06.251321 git.c:507                         cmd_name status (status)
18:06:06.253003 git.c:789                         exit elapsed:0.002330 code:0
18:06:06.253008 trace2/tr2_tgt_normal.c:128       atexit elapsed:0.002335 code:0
```

(`...` o'rnidagi `cmd_ancestry` qatori — buyruqni qaysi jarayonlar zanjiri ishga tushirganini, ya'ni shell va terminal dasturini ko'rsatadi; u kompyuterga xos bo'lgani uchun qisqartirildi.) Oddiy format odam uchun: versiya, argv, repo, buyruq nomi, chiqish kodi va vaqt.

`GIT_TRACE2_EVENT` — har hodisa bitta JSON qator, dastur o'qishi uchun:

```text
$ GIT_TRACE2_EVENT=$PWD/../event.json git status --short
$ wc -l ../event.json
      41 ../event.json
$ head -1 ../event.json
{"event":"version","sid":"20261008T130606.259692Z-H<host-hash>-P000141c5","thread":"main","time":"2026-10-08T13:06:06.259795Z","file":"common-init.c","line":77,"evt":"4","exe":"2.56.0"}
$ python3 -c "import json,sys; [print(e['event'], e.get('name',e.get('argv',e.get('exe','')))) for e in map(json.loads, open('../event.json'))]"
version 2.56.0
start ['/opt/homebrew/opt/git/bin/git', 'status', '--short']
cmd_ancestry 
def_repo 
cmd_name status
region_enter 
region_enter 
region_leave 
data 
data 
...
exit 
data_json 
atexit 
```

Bitta `git status` uchun 41 hodisa. `sid` — sessiya identifikatori; bola jarayonlar ota-onaning `sid` iga o'zinikini qo'shadi, shuning uchun bitta faylda butun jarayonlar daraxtini tiklash mumkin. `GIT_TRACE2_PERF` — jadval ko'rinishi, ichma-ich "region"lar va har birining vaqti bilan:

```text
$ GIT_TRACE2_PERF=1 git status --short 2>&1 | head -20
...
18:06:06.297947 read-cache.c:2375            | d0 | main                     | region_enter | r1  |  0.000819 |           | index        | label:do_read_index .git/index
18:06:06.297970 cache-tree.c:726             | d0 | main                     | region_enter | r1  |  0.000841 |           | cache_tree   | ..label:read
18:06:06.297973 cache-tree.c:728             | d0 | main                     | region_leave | r1  |  0.000845 |  0.000004 | cache_tree   | ..label:read
18:06:06.297977 read-cache.c:2328            | d0 | main                     | data         | r1  |  0.000849 |  0.000030 | index        | ..read/version:2
18:06:06.297980 read-cache.c:2330            | d0 | main                     | data         | r1  |  0.000852 |  0.000033 | index        | ..read/cache_nr:3
18:06:06.297983 read-cache.c:2380            | d0 | main                     | region_leave | r1  |  0.000854 |  0.000035 | index        | label:do_read_index .git/index
18:06:06.297989 read-cache.c:1539            | d0 | main                     | region_enter |     |  0.000861 |           | index        | label:refresh
18:06:06.297999 read-cache.c:1621            | d0 | main                     | data         |     |  0.000871 |  0.000010 | index        | ..refresh/sum_lstat:3
...
```

Bu yerdan `status` index'ni o'qigani (versiya 2, 3 yozuv), keyin 3 faylni `lstat` bilan tekshirgani ko'rinadi — katta repo'da "status nega sekin?" savoliga aynan shu qatorlar javob beradi ([49-bob](49-worktree-va-katta-repo.md)). Trace2 qiymatlari `GIT_TRACE` dagidek, qo'shimcha ikkitasi bilan: mavjud **papka** yo'li berilsa, har jarayon alohida faylga yoziladi; `af_unix:<yo'l>` — Unix soketiga. Doimiy yoqish uchun `trace2.normalTarget`, `trace2.eventTarget`, `trace2.perfTarget` sozlamalari bor (kompaniyalar Git'dan foydalanish statistikasini shu bilan yig'adi).

## Kod: qolganlari

### `GIT_REFLOG_ACTION`

Ref yangilanganda reflog'ga ([42-bob](42-reflog-va-tiklash.md)) "nega" yoziladi — odatda buyruq nomi. `GIT_REFLOG_ACTION` uni almashtiradi:

```text
$ GIT_REFLOG_ACTION='deploy-skript' git commit -q --allow-empty -m 'Reliz 1.0'
$ git reflog -2
41af846 HEAD@{0}: deploy-skript: Reliz 1.0
56dd828 HEAD@{1}: commit (initial): Birinchi
$ GIT_REFLOG_ACTION='tozalash' git reset -q --hard HEAD~1
$ git reflog -2
56dd828 HEAD@{0}: tozalash: updating HEAD
41af846 HEAD@{1}: deploy-skript: Reliz 1.0
```

Ma'lumotnoma: bu asosan Git ustiga yozilgan skript-buyruqlar uchun — ular reflog'da `commit`/`reset` emas, o'z nomi bilan ko'rinsin (Git'ning eski shell'da yozilgan buyruqlari `git-sh-setup` dagi `set_reflog_action` bilan shunday qilgan). Keyinchalik "bu `reset` ni kim qildi?" degan savolga reflog javob beradi.

### `GIT_NAMESPACE` — bitta repo'da bir nechta "repo"

Ma'lumotnoma (`gitnamespaces`): ref'larni nomlar maydonlariga bo'lish — har birining o'z branch'lari, teglari va `HEAD` i bor, lekin **obyekt ombori umumiy**. Server tomonidagi vosita: `upload-pack` va `receive-pack` ref nomlarini `refs/namespaces/<nom>/` ga qayta yozadi va boshqa nomlar maydonini ko'rmaydi. Lokal transportda bu jarayonlar bizning muhitimizni meros oladi, shuning uchun sinash oson:

```text
$ GIT_NAMESPACE=mijoz-a git push -q ../server.git main
$ GIT_NAMESPACE=mijoz-b git push -q ../server.git HEAD~1:refs/heads/main
$ git -C server.git for-each-ref
e0b0a216727deb354a0492488128819a03bf68a6 commit	refs/namespaces/mijoz-a/refs/heads/main
56dd828c61baf322b941520a19be6df7c3096679 commit	refs/namespaces/mijoz-b/refs/heads/main
$ GIT_NAMESPACE=mijoz-a git ls-remote server.git
e0b0a216727deb354a0492488128819a03bf68a6	refs/heads/main
$ GIT_NAMESPACE=mijoz-b git ls-remote server.git
56dd828c61baf322b941520a19be6df7c3096679	refs/heads/main
$ git ls-remote server.git
e0b0a216727deb354a0492488128819a03bf68a6	refs/namespaces/mijoz-a/refs/heads/main
56dd828c61baf322b941520a19be6df7c3096679	refs/namespaces/mijoz-b/refs/heads/main
$ GIT_NAMESPACE=mijoz-b git clone -q server.git b-nusxa
$ git -C b-nusxa log --oneline
56dd828 Birinchi
```

Ikki "mijoz" bitta bare repo'ga `main` push qildi — to'qnashuv yo'q, har biri o'z `main` ini ko'radi. Pro Git: bu bir loyihaning ko'p fork'ini bitta repo'da saqlash uchun foydali. `/` bilan nom ierarxiya bo'ladi: `foo/bar` → `refs/namespaces/foo/refs/namespaces/bar/`. HTTP serverda `git http-backend` `GIT_NAMESPACE` ni o'tkazadi. **Ogohlantirish** (ma'lumotnomadagi "transfer data leaks" bo'limi): nomlar maydoni xavfsizlik chegarasi emas — obyektlar umumiy, ayyor klient boshqa nomlar maydonidagi obyektni hash'i bo'yicha olishi mumkin. Maxfiy ma'lumotni alohida repo'larda saqlang.

### `GIT_NO_REPLACE_OBJECTS`

`git replace` ([43-bob](43-submodule-bundle-replace.md)) obyektni boshqasi bilan "almashtirib" ko'rsatadi. `GIT_NO_REPLACE_OBJECTS` (borligi yetarli) yoki `git --no-replace-objects` — almashtirishlarni e'tiborsiz qoldirib, haqiqiy obyektni ko'rsatadi:

```text
$ git replace e0b0a216727deb354a0492488128819a03bf68a6 31381bbbc388a0604aa73b88a329f51488f6770c
$ git log --oneline
e0b0a21 Ikkinchi (almashtirilgan)
56dd828 Birinchi
$ GIT_NO_REPLACE_OBJECTS=1 git log --oneline
e0b0a21 Ikkinchi
56dd828 Birinchi
```

Hash bir xil (`e0b0a21`), xabar boshqa — `replace` aynan shunday ishlaydi. Tekshiruv skriptlari (masalan, imzo yoki tarix auditi) almashtirishlar tufayli aldanmasligi uchun shu o'zgaruvchi bilan ishlashi kerak.

### `GIT_FLUSH`

Chiqishni qachon "itarib" yuborish (*flush*). Boolean: `true` — `git log`, `git rev-list`, `git blame --incremental`, `git check-attr`, `git check-ignore` kabi buyruqlar har yozuvdan keyin chiqishni darhol yuboradi; `false` — to'liq buferlangan (tezroq, lekin natija bo'laklab keladi). Berilmasa — chiqish faylga/quvurga ketyaptimi, shunga qarab Git o'zi tanlaydi. Qachon kerak: boshqa dastur Git chiqishini **satrma-satr, real vaqtda** o'qiyotgan bo'lsa (masalan, `git check-ignore --stdin` bilan "savol-javob" qilayotgan muharrir plagini) — aks holda javob buferda qolib, ikki dastur bir-birini kutib qotadi.

### `GIT_OPTIONAL_LOCKS`, `GIT_ADVICE` va boshqalar

`GIT_OPTIONAL_LOCKS=0` — "ixtiyoriy" qulf talab qiladigan yon ishlarni qilmaslik. Ma'lumotnomadagi misol: `git status` odatda index'dagi vaqt belgilarini yangilab, faylni qayta yozadi. Fon jarayonlari (IDE, shell prompt) uchun bu ortiqcha — foydalanuvchining `git commit` i bilan qulf uchun to'qnashadi:

```text
$ touch -t 202610071200 a
$ stat -f '%Sm' -t '%H:%M:%S' .git/index
18:08:56
$ GIT_OPTIONAL_LOCKS=0 git status --short; stat -f '%Sm' -t '%H:%M:%S' .git/index
18:08:56
$ git status --short; stat -f '%Sm' -t '%H:%M:%S' .git/index
18:08:58
```

`GIT_OPTIONAL_LOCKS=0` bilan index tegilmadi, oddiy `status` uni qayta yozdi.

`GIT_ADVICE=0` — hamma maslahat qatorlarini o'chiradi (`--no-advice` bilan bir xil; Git'ning eski versiyasi `--no-advice` ni tushunmay xato beradi, o'zgaruvchini esa shunchaki e'tiborsiz qoldiradi — skriptlar uchun shu qulayroq):

```text
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   c

$ GIT_ADVICE=0 git status
On branch main
Changes to be committed:
	new file:   c

```

Qisqa ro'yxat (ma'lumotnoma):

| O'zgaruvchi | Vazifasi |
| --- | --- |
| `GIT_PROGRESS_DELAY` | Progress ko'rsatkichi necha soniyadan keyin chiqsin (standart 1) |
| `GIT_ATTR_SOURCE` | `.gitattributes` ni qaysi tree'dan o'qish ([46-bob](46-gitattributes.md)) |
| `GIT_NO_LAZY_FETCH` | Partial clone'da yetishmagan obyektni avtomatik yuklamaslik ([49-bob](49-worktree-va-katta-repo.md)) |
| `GIT_REF_PARANOIA=0` | Buzuq ref'larni e'tiborsiz qoldirish — faqat buzilgan repo'dan ma'lumot qutqarishda |
| `GIT_COMMIT_GRAPH_PARANOIA` | commit-graph'dagi commit'lar haqiqatan bormi, tekshirish (sekinroq) |
| `GIT_REFERENCE_BACKEND` | Ref backend'ini URI bilan tanlash (`extensions.refStorage` dan ustun) |
| `GIT_PROTOCOL` | Faqat ichki: protokol muzokarasi ([29-bob](29-fetch-push-ichidan.md)) |
| `GIT_REDIRECT_STDIN/STDOUT/STDERR` | Faqat Windows: standart oqimlarni fayl yoki nomli quvurga yo'naltirish |
| `GIT_PRINT_SHA1_ELLIPSIS` | Eskirgan: qisqa hash'dan keyin `...` chiqarish |

## Muhandislik nuqtai nazari: skript va CI uchun oldindan aytib bo'ladigan Git

Skript foydalanuvchining shaxsiy sozlamalariga bog'liq bo'lmasligi kerak: kimdadir `core.pager`, kimdadir `color.ui=always`, kimdadir alias `log` ni o'zgartirgan. Ma'lumotnoma (`GIT_CONFIG_NOSYSTEM` bandi) aynan shu "injiq skript" uchun retsept beradi. Amaliy to'plam:

```bash
export GIT_CONFIG_NOSYSTEM=1          # /etc/gitconfig yo'q
export GIT_CONFIG_GLOBAL=/dev/null    # ~/.gitconfig yo'q
export GIT_TERMINAL_PROMPT=0          # parol so'rab osilib qolmaslik
export GIT_PAGER=cat                  # pager yo'q
export GIT_ADVICE=0                   # maslahat matnlari yo'q
export GIT_OPTIONAL_LOCKS=0           # fon jarayoni bo'lsa
export LC_ALL=C                       # chiqish matni tarjima qilinmasin (parse qilinsa)
export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.abbrev GIT_CONFIG_VALUE_0=12
```

Bu qo'llanmaning sinov wrapper'i aynan shu g'oyaning kichik versiyasi (bob boshida). Shunga qaramay, skriptda **porcelain** chiqishini parse qilmang — `git status --porcelain=v2`, `git for-each-ref --format`, `git rev-parse` kabi barqaror formatlar bor ([13-bob](13-plumbing-va-porcelain.md)).

Takrorlanadigan natija (test, hujjat, "reproducible build") uchun — muallif va sana o'zgaruvchilarini qotiring: bir xil kirish → bir xil hash. Bu qo'llanmadagi hash'lar shuning uchun har safar bir xil.

## Muhandislik nuqtai nazari: meros — ham kuch, ham tuzoq

Muhit o'zgaruvchisi ko'rinmaydi. `export GIT_DIR=...` qilib unutilgan terminal, CI'ning "global environment" bo'limida qolgan `GIT_SSL_NO_VERIFY=1`, `.bashrc` dagi `GIT_DIFF_OPTS` — bularning hammasi haftalar o'tib "Git g'alati ishlayapti" bo'lib chiqadi. Tekshirish odati:

```bash
env | grep -E '^(GIT_|EMAIL=|EDITOR=|VISUAL=|PAGER=)'
```

Hook va alias yozganda esa teskari tomoni: Git o'zi bola jarayonga `GIT_DIR`, `GIT_INDEX_FILE`, `GIT_PREFIX`, `GIT_CONFIG_PARAMETERS` beradi. Boshqa repo'da ishlash kerak bo'lsa — `unset $(git rev-parse --local-env-vars)`; xuddi shu repo'da ishlash kerak bo'lsa — ularni saqlang (aks holda, masalan, `commit -a` paytida hook vaqtinchalik index o'rniga asosiysini o'qiydi, [47-bob](47-hooklar.md)).

Xavfsizlik nuqtai nazaridan: buyruq bajaradigan o'zgaruvchilar (`GIT_SSH_COMMAND`, `GIT_EDITOR`, `GIT_PAGER`, `GIT_EXTERNAL_DIFF`, `GIT_ASKPASS`) muhitni boshqara oladigan har kimga sizning nomingizdan dastur ishga tushirish imkonini beradi. Ishonchsiz kirishdan (masalan, web forma yoki PR sarlavhasidan) muhit o'zgaruvchisi yasamang. Trace log'larini (`GIT_TRACE_CURL`, ayniqsa `GIT_TRACE_REDACT=0` bilan) ochiq joyga qo'ymang — ularda URL, token va server nomlari bo'ladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `GIT_DIR` ni `GIT_WORK_TREE` siz berish | Joriy papka working tree bo'ladi, hamma fayl "o'chirilgan" ko'rinadi; `commit -a` ularni haqiqatan o'chiradi | Ikkalasini birga bering yoki `git -C <papka>` |
| `export GIT_DIR=...` qilib unutish | Terminaldagi hamma keyingi buyruqlar boshqa repo'ga ketadi | Bir martalik `VAR=x git ...` yoki alias |
| Dotfiles repo'sida `status.showUntrackedFiles no` va `info/exclude` siz ishlash | Uy papkasining hammasi va repo papkasining o'zi "kuzatilmagan" bo'lib chiqadi | Ikkalasini ham sozlang |
| `GIT_TRACE=trace.log` (nisbiy yo'l) | Ogohlantirish, hech narsa yozilmaydi | Mutlaq yo'l: `GIT_TRACE=$PWD/trace.log` |
| `PREFIX` bilan system config'ni almashtirmoqchi bo'lish | Pro Git'da shunday yozilgan, lekin ish paytida ta'siri yo'q | `GIT_CONFIG_SYSTEM=<fayl>` |
| `GIT_CONFIG_SYSTEM` bergan-u `GIT_CONFIG_NOSYSTEM` qolib ketgan | System fayl umuman o'qilmaydi | `unset GIT_CONFIG_NOSYSTEM` |
| `GIT_CONFIG_COUNT` ni juftlar sonidan katta berish | `missing config key` — fatal | Son noldan sanalgan juftlar soniga teng bo'lsin |
| `-c user.name=...` muhitdagi `GIT_AUTHOR_NAME` ni yengadi deb o'ylash | Muhit g'olib, commit boshqa nom bilan chiqadi | `env | grep GIT_AUTHOR` bilan tekshiring |
| `GIT_AUTHOR_DATE='2 days ago'` | `invalid date format` | ISO 8601, RFC 2822 yoki `@<soniya> <mintaqa>` |
| `GIT_DIFF_OPTS` qolib ketgan | `-U` ishlamaydi (muhit ustun) | `unset GIT_DIFF_OPTS` |
| `GIT_SSL_NO_VERIFY=1` ni doimiy qo'yish | O'rtadagi odam hujumi: token o'g'irlanadi, kod almashtiriladi | `GIT_SSL_CAINFO` yoki `http.<url>.sslCAInfo` |
| `GIT_SSH_COMMAND` ga nostandart nomli skript, port bilan | `ssh variant 'simple' does not support setting port` | `GIT_SSH_VARIANT=ssh` yoki `~/.ssh/config` |
| Pathspec'da fayl nomida `*` bo'lgan yo'llarni oddiy rejimda berish | Namuna sifatida o'qiladi, boshqa fayllarni ham qamraydi | `GIT_LITERAL_PATHSPECS=1` yoki `:(literal)` |
| `GIT_GLOB_PATHSPECS=1` ni "standart bilan bir xil" deb o'ylash | `*` endi `/` ni kesmaydi, `src/` dagi fayllar tushib qoladi | Chuqur moslik uchun `**/` |
| `GIT_NAMESPACE` ni maxfiylik vositasi deb bilish | Obyektlar umumiy, hash bo'yicha olish mumkin | Alohida repo'lar |
| CI'da `GIT_TERMINAL_PROMPT=0` yo'qligi | Job parol so'rab, timeout'gacha osilib turadi | CI muhitida doim `GIT_TERMINAL_PROMPT=0` |

## Amaliyot

1. `GIT_TRACE_SETUP=1` bilan bitta repo'da to'rt joydan `git status` ishlating: ildizdan, ichki papkadan, `.git` ichidan va `git worktree add` bilan yaratilgan worktree'dan. Har birida `git_dir`, `git_common_dir`, `worktree`, `prefix` qanday o'zgarishini jadvalga yozing.
2. Sinov "uy" papkasida dotfiles repo'sini quring: `alias dot=...`, `status.showUntrackedFiles no`, `.dotfiles` ni `info/exclude` ga qo'shing. Keyin `git clone --bare` bilan boshqa "uy" papkasiga ko'chirib, `dot checkout` qiling. Mavjud `.bashrc` bilan to'qnashuvda nima bo'ladi?
3. `GIT_INDEX_FILE` bilan: asosiy index'da chala ish turgan holda, `gh-pages` nomli branch'ga faqat `index.html` dan iborat commit yasang (`read-tree --empty`, `add`, `write-tree`, `commit-tree`, `update-ref`). Asosiy `git status` o'zgarmaganini tasdiqlang.
4. `GIT_CEILING_DIRECTORIES` ni shell prompt'ingizda ishlatiladigan papkalar uchun sozlang va `GIT_TRACE_PERFORMANCE=1` bilan `git rev-parse --show-toplevel` vaqtini solishtiring. macOS'da `/tmp` va `/private/tmp` farqini sinang.
5. Nomida `*`, `?` va `[a]` bo'lgan fayllar yarating. `git add`, `git log --`, `git rm --cached` ni standart, `GIT_LITERAL_PATHSPECS=1` va `GIT_GLOB_PATHSPECS=1` bilan ishlatib, qaysi fayllar tushishini yozing.
6. Takrorlanadigan commit: ikki xil papkada bir xil fayl va bir xil `GIT_AUTHOR_*`/`GIT_COMMITTER_*` bilan commit yarating — hash'lar mos keladimi? Faqat `GIT_COMMITTER_DATE` ni 1 soniyaga o'zgartiring — nima bo'ladi va nega ([16-bob](16-commit-obyekti.md))?
7. `GIT_TRACE2_EVENT` ni papkaga yo'naltiring (`mkdir /tmp/t2; GIT_TRACE2_EVENT=/tmp/t2 git fetch`) va lokal remote'dan `fetch` qiling. Nechta fayl paydo bo'ldi? `sid` maydonlari orqali qaysi jarayon qaysi birining bolasi ekanini aniqlang.
8. (Qiyinroq) CI uchun `git-toza` skripti yozing: u yuqoridagi "oldindan aytib bo'ladigan" muhitni o'rnatsin, `unset $(git rev-parse --local-env-vars)` qilsin va argumentlarini `git` ga uzatsin. `GIT_ALLOW_PROTOCOL=https:ssh` qo'shib, `ext::` va lokal yo'l bilan klon rad etilishini ko'rsating. Skriptni `pre-push` hook ichidan boshqa repo'ga murojaat qilish uchun ishlatib, `GIT_DIR` merosi muammosi hal bo'lganini tekshiring.

## Rasmiy hujjat

- Pro Git — Environment Variables: <https://git-scm.com/book/en/v2/Git-Internals-Environment-Variables>
- `git` — Environment Variables (to'liq ro'yxat): <https://git-scm.com/docs/git#_environment_variables>
- `git config` — ENVIRONMENT (`GIT_CONFIG_GLOBAL`, `GIT_CONFIG_COUNT`, `GIT_CONFIG`): <https://git-scm.com/docs/git-config#ENVIRONMENT>
- `git var` (`GIT_EDITOR`, `GIT_PAGER`, `GIT_CONFIG_GLOBAL`, `GIT_*_IDENT`): <https://git-scm.com/docs/git-var>
- `git rev-parse` (`--local-env-vars`, `--git-path`): <https://git-scm.com/docs/git-rev-parse>
- `gitglossary` — pathspec va "magic" so'zlar: <https://git-scm.com/docs/gitglossary#Documentation/gitglossary.txt-aiddefpathspecapathspec>
- `gitnamespaces`: <https://git-scm.com/docs/gitnamespaces>
- `git config` — `http.*` va `ssh.variant`: <https://git-scm.com/docs/git-config#Documentation/git-config.txt-httpsslVerify>
- `git commit` — DATE FORMATS: <https://git-scm.com/docs/git-commit#_date_formats>
- Trace2 API: <https://git-scm.com/docs/api-trace2>
- Git 2.28.0 reliz yozuvlari (`GIT_CURL_VERBOSE` → `GIT_TRACE_CURL`): <https://github.com/git/git/blob/master/Documentation/RelNotes/2.28.0.adoc>
