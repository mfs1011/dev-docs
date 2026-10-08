# 45 — `git config` chuqur

[← Oldingi: Imzolash](44-imzolash.md) · [Mundarija](README.md) · [Keyingi: `.gitattributes` →](46-gitattributes.md)

## Tushuncha

[3-bobda](03-birinchi-sozlash.md) `git config` ning asoslarini ko'rdik: sozlama — `bo'lim.kalit = qiymat` juftligi, u bir nechta **darajada** (system, global, local, worktree, command) saqlanadi, tor daraja keng darajadan ustun, yangi `git config list/get/set` sintaksisi eski `--list`/`--get` o'rnini egallagan. Ism, email, muharrir, `init.defaultBranch` va `includeIf "gitdir:..."` ning eng oddiy shakli ham o'sha yerda.

Bu bob o'sha poydevor ustiga quriladi. Uch savolga javob beramiz:

1. **Qiymat qayerdan keldi?** Sozlama endi beshta darajadan tashqari `include` qilingan fayllardan, shartli `includeIf` lardan, hatto commit qilingan blob'dan kelishi mumkin. `--show-origin` va `--show-scope` bu chalkashlikni yechadigan asosiy asbob.
2. **Qaysi sozlamalar kundalik ishga ta'sir qiladi?** Pager, ranglar, xato yozilgan buyruqni tuzatish, global ignore, tashqi diff/merge dasturlari, qator oxirlari (`core.autocrlf`) va bo'sh joy (whitespace) qoidalari.
3. **Server tomonda nima sozlanadi?** Push qabul qiluvchi repo'ning `receive.*` sozlamalari: obyektlarni tekshirish, force-push va branch o'chirishni taqiqlash.

Git juda ko'p sozlamani taniydi. Ularning ro'yxati `git help -c` da:

```text
$ git help -c | wc -l
    1012
```

Pro Git ham ta'kidlaydi: ularning katta qismi kamdan-kam holatlar uchun. Pro Git sozlamalarni ikki guruhga ajratadi: **klient** sozlamalari (sizning shaxsiy ish uslubingiz — ko'pchilik shu yerda) va **server** sozlamalari (push qabul qiladigan repo uchun — oz, lekin muhim). Biz ham shu tartibda boramiz.

## Nega shunday: nega "qiymat qayerdan keldi" eng muhim savol

Git sozlamani bitta fayldan emas, **zanjirdan** o'qiydi. Har fayl o'z navbatida boshqa fayllarni qo'shib olishi mumkin (`include`), ba'zilarini esa faqat shart bajarilganda (`includeIf`). Natija — bitta kalitning qiymati o'nlab joydan kelishi mumkin, oxirgi o'qilgani esa g'olib.

```text
  system   /etc/gitconfig
  global   ~/.config/git/config
           ~/.gitconfig
              ├── [include]   .gitconfig-alias          (doim)
              ├── [includeIf "gitdir:~/ish/"]           (repo ~/ish/ ichida bo'lsa)
              ├── [includeIf "onbranch:hotfix/"]        (hotfix/* branch'da bo'lsa)
              └── [includeIf "worktree:~/qurilish/"]    (worktree ~/qurilish/ ichida bo'lsa)
  local    .git/config
              └── [include]   ../.gitconfig-loyiha      (repo ichidagi jamoa fayli)
  worktree .git/config.worktree
  command  GIT_CONFIG_COUNT/KEY/VALUE, git -c ...
```

Shuning uchun "nega Git bu emailni ishlatyapti?" degan savolga faylni ko'zdan kechirib javob topish qiyin. Git o'zi aytib bera oladi — `--show-origin` (qaysi **fayl**) va `--show-scope` (qaysi **daraja**). Bu bobdagi deyarli har misolda ular bor.

Ikkinchi sabab — xavfsizlik. Sozlamalarning bir qismi buyruq bajaradi (`core.pager`, `diff.external`, `core.editor`, filtrlar). Ular qayerdan kelayotganini bilmasangiz, begona fayl sizning nomingizdan dastur ishga tushirishi mumkin ([3-bob](03-birinchi-sozlash.md), "himoyalangan config").

## Kod: qiymat qayerdan keldi — `--show-origin` va `--show-scope`

Bu bob uchun sinov muhiti: alohida `HOME` (`~` deb ko'rsatamiz), unda global `~/.gitconfig` va bir nechta qo'shimcha fayl. Uzun yo'llar `~` bilan qisqartirilgan.

```ini
# ~/.gitconfig
[user]
	name = Ali Valiyev
	email = ali@example.com
[init]
	defaultBranch = main
[include]
	path = .gitconfig-alias
[includeIf "gitdir:~/ish/"]
	path = ~/.gitconfig-ish
```

```ini
# ~/.gitconfig-alias
[alias]
	st = status -sb
	lg = log --oneline --graph
```

```ini
# ~/.gitconfig-ish
[user]
	email = ali@ishxona.uz
```

`~/ish/mijoz` repo'si ichida hamma sozlamani manbasi bilan ko'ramiz:

```text
$ git config list --show-scope --show-origin
global	file:~/.gitconfig	user.name=Ali Valiyev
global	file:~/.gitconfig	user.email=ali@example.com
global	file:~/.gitconfig	init.defaultbranch=main
global	file:~/.gitconfig	include.path=.gitconfig-alias
global	file:~/.gitconfig-alias	alias.st=status -sb
global	file:~/.gitconfig-alias	alias.lg=log --oneline --graph
global	file:~/.gitconfig	includeif.gitdir:~/ish/.path=~/.gitconfig-ish
global	file:~/.gitconfig-ish	user.email=ali@ishxona.uz
local	file:.git/config	core.repositoryformatversion=0
local	file:.git/config	core.filemode=true
local	file:.git/config	core.bare=false
local	file:.git/config	core.logallrefupdates=true
local	file:.git/config	core.ignorecase=true
local	file:.git/config	core.precomposeunicode=true
```

Uchta narsaga e'tibor bering:

- **Include qilingan fayl o'zining yo'li bilan ko'rinadi** (`file:~/.gitconfig-alias`), lekin darajasi — uni qo'shgan faylniki (`global`). Ya'ni include darajani o'zgartirmaydi, faqat qatorlarni "shu joyga qo'yadi".
- **Tartib — o'qish tartibi.** `.gitconfig-alias` qatorlari aynan `include.path` qatoridan keyin, `.gitconfig-ish` qatorlari esa `includeif...path` qatoridan keyin turibdi. Ma'lumotnoma shunday ta'riflaydi: include qilingan fayl mazmuni "xuddi direktiva turgan joyda yozilgandek" darhol qo'yiladi.
- **`include.path` ning o'zi ham sozlama.** U oddiy kalit sifatida ro'yxatda bor — shuning uchun `git config set --append include.path ...` bilan qo'shish mumkin.

Bitta kalit uchun:

```text
$ git config get --show-origin user.email          # ~/ish/mijoz ichida
file:~/.gitconfig-ish	ali@ishxona.uz

$ git config get --show-origin user.email          # ~/shaxsiy/blog ichida
file:~/.gitconfig	ali@example.com
```

### Manba turlari

`--show-origin` faqat fayl ko'rsatmaydi. Ma'lumotnomadagi manba turlari: fayl, standart kirish, blob va buyruq qatori.

```text
$ GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=color.ui GIT_CONFIG_VALUE_0=never \
    git -c core.pager=less config list --show-origin --show-scope | grep command
command	command line:	color.ui=never
command	command line:	core.pager=less

$ printf '[color]\n\tui = false\n' | git config list --file - --show-origin
standard input:	color.ui=false
```

Muhit o'zgaruvchilari orqali berilgan sozlama ham `command line:` bo'lib ko'rinadi va `-c` dan oldin turadi — ya'ni `-c` undan ustun ([48-bob](48-muhit-ozgaruvchilari.md)).

### `--includes`: bitta faylni o'qiganda

Ma'lumotnomadagi qoida: aniq fayl berilganda (`--global`, `--file` va h.k.) include'lar standart bo'yicha **o'qilmaydi**, hamma fayllar o'qilganda esa o'qiladi:

```text
$ git config list --global
user.name=Ali Valiyev
user.email=ali@example.com
init.defaultbranch=main
include.path=.gitconfig-alias
includeif.gitdir:~/ish/.path=~/.gitconfig-ish

$ git config list --global --includes
user.name=Ali Valiyev
user.email=ali@example.com
init.defaultbranch=main
include.path=.gitconfig-alias
alias.st=status -sb
alias.lg=log --oneline --graph
includeif.gitdir:~/ish/.path=~/.gitconfig-ish
```

Ikkinchi chiqishda alias'lar paydo bo'ldi, lekin `.gitconfig-ish` dagi email yo'q: buyruq repo tashqarisida (`~`) ishlatildi, `gitdir:` sharti bajarilmadi.

### Boshqa o'qish opsiyalari

| Opsiya | Nima qiladi |
| --- | --- |
| `--file <fayl>` (`-f`) | Faqat shu faylni o'qiydi/yozadi (`-` — standart kirish) |
| `--blob <blob>` | Faylni repo'dagi blob'dan o'qiydi, masalan `HEAD:.gitmodules` |
| `get --all` | Ko'p qiymatli kalitning hamma qiymati |
| `get --regexp` | Kalit nomi regex sifatida; `--show-names` bilan nomlari ham chiqadi |
| `get --url=<URL>` | `bo'lim.<URL>.kalit` dan URL'ga eng mos keladiganini tanlaydi |
| `--name-only` | Faqat kalit nomlari |
| `-z` | Qiymatlarni NUL bilan ajratadi (qiymatda yangi qator bo'lsa ham xavfsiz o'qish) |
| `--type=<tur>` | Qiymatni shu turga keltiradi (`bool`, `int`, `path`, `color`...) |

`--url` ning amaliy ma'nosi: bir xil sozlama turli serverlar uchun turlicha bo'lishi mumkin. Masalan ichki serverda SSL tekshiruvini o'chirib, boshqa hamma joyda yoqiq qoldirish:

```text
$ git config set http.sslVerify true
$ git config set http.https://gitlab.ishxona.uz.sslVerify false
$ git config get --url=https://gitlab.ishxona.uz/web/blog.git http.sslverify
false
$ git config get --url=https://github.com/x/y.git http.sslverify
true
```

Git o'zi ham `http.*` sozlamalarini shu qoida bilan tanlaydi — `--url` uni oldindan tekshirish imkonini beradi. (`sslVerify = false` — faqat ishonchli ichki tarmoq uchun; aslida sertifikatni to'g'ri o'rnatgan ma'qul.)

## Kod: `include` va shartli `includeIf`

Ma'lumotnoma qoidalari (`git-config`, "Includes" va "Conditional includes"):

- `include.path` (yoki `includeIf.<shart>.path`) qiymati — fayl yo'li, `~` kengaytiriladi, bir necha marta yozilishi mumkin.
- **Nisbiy yo'l** — include direktivasi turgan **faylga nisbatan** (joriy papkaga nisbatan emas). `~/.gitconfig` dagi `path = .gitconfig-alias` — `~/.gitconfig-alias`; `.git/config` dagi `path = ../x` — repo ildizidagi `x`.
- Fayl mavjud bo'lmasa — xato emas, shunchaki hech narsa qo'shilmaydi.
- `includeIf` — xuddi `include`, faqat shart bajarilmasa e'tiborsiz qoldiriladi.

### Tartib muhim

Include qilingan qatorlar direktiva joyida turadi, shuning uchun direktivadan **keyin** yozilgan bir xil kalit uni bosib ketadi. `includeIf` ni `[user]` dan oldinga qo'yib ko'ramiz:

```ini
[includeIf "gitdir:~/ish/"]
	path = ~/.gitconfig-ish
[user]
	name = Ali Valiyev
	email = ali@example.com
```

```text
$ git config get --all --show-origin user.email     # ~/ish/mijoz ichida
file:~/.gitconfig-ish	ali@ishxona.uz
file:~/.gitconfig	ali@example.com
$ git config get user.email
ali@example.com
```

Shart bajarildi, fayl o'qildi — lekin keyin kelgan `[user]` g'olib bo'ldi. Qoida: **"maxsuslashtiruvchi" include'larni faylning oxiriga qo'ying.**

### `gitdir` va `gitdir/i`

`gitdir:` dan keyingi matn — glob pattern, u `.git` papkasining joylashuviga solishtiriladi. Ma'lumotnomadagi qulayliklar:

- `~/` bilan boshlansa — `HOME` qo'yiladi;
- `./` bilan boshlansa — joriy config fayli turgan papka;
- `~/`, `./` yoki `/` bilan boshlanmasa — oldiga avtomatik `**/` qo'shiladi (`mijoz/` → `**/mijoz/`);
- `/` bilan tugasa — oxiriga `**` qo'shiladi (`ish/` → `ish/**`, ya'ni "ichidagi hamma narsa").

To'rt variantni bir vaqtda sinaymiz (`~/ish/mijoz` ichida):

```ini
[includeIf "gitdir:~/ish"]
	path = ~/.gitconfig-test1        ; test.bir = slashsiz
[includeIf "gitdir:~/ISH/"]
	path = ~/.gitconfig-test2        ; test.ikki = katta
[includeIf "gitdir/i:~/ISH/"]
	path = ~/.gitconfig-test3        ; test.uch = katta-i
[includeIf "gitdir:mijoz/"]
	path = ~/.gitconfig-test4        ; test.tort = nisbiy
```

```text
$ git config list --show-origin | grep test
file:~/.gitconfig	includeif.gitdir:~/ish.path=~/.gitconfig-test1
file:~/.gitconfig	includeif.gitdir:~/ISH/.path=~/.gitconfig-test2
file:~/.gitconfig	includeif.gitdir/i:~/ISH/.path=~/.gitconfig-test3
file:~/.gitconfig-test3	test.uch=katta-i
file:~/.gitconfig	includeif.gitdir:mijoz/.path=~/.gitconfig-test4
file:~/.gitconfig-test4	test.tort=nisbiy
```

- `gitdir:~/ish` (slashsiz) — **mos kelmadi**: `.git` joylashuvi `~/ish/mijoz/.git`, pattern esa aynan `~/ish` ni so'raydi.
- `gitdir:~/ISH/` — mos kelmadi: harf katta-kichikligi farqlanadi (macOS fayl tizimi farqlamasa ham!).
- `gitdir/i:~/ISH/` — mos keldi: `/i` — katta-kichik harfni farqlamaydigan solishtirish.
- `gitdir:mijoz/` — mos keldi: `**/mijoz/**` ga aylandi.

Ma'lumotnomadagi yana ikki nozik joy: `$GIT_DIR` dagi symlink'lar yechilmaydi; `$GIT_DIR` dan tashqaridagi yo'lda esa symlink va haqiqiy yo'l ikkalasi ham tekshiriladi (`~/git` → `/mnt/storage/git` bo'lsa, ikkala yozuv ham ishlaydi). `../` maxsus emas — so'zma-so'z solishtiriladi, bu deyarli hech qachon kerakli narsa emas.

Submodule yoki bog'langan worktree'da `.git` — fayl, `gitdir:` esa u ko'rsatgan **haqiqiy** `.git` papkasiga solishtiriladi. Bu quyidagi `worktree:` shartining paydo bo'lish sababi.

### `onbranch`: branch nomiga qarab

```ini
[includeIf "onbranch:hotfix/"]
	path = ~/.gitconfig-hotfix
```

```ini
# ~/.gitconfig-hotfix
[core]
	hooksPath = ~/hotfix-hooklar
```

```text
$ git config get core.hookspath; echo $?            # main'da
1
$ git switch -q -c hotfix/login
$ git config get --show-origin core.hookspath
file:~/.gitconfig-hotfix	~/hotfix-hooklar
```

`hotfix/` oxiridagi `/` — `hotfix/**`, ya'ni shu ierarxiyadagi hamma branch. Shart worktree'da hozir checkout qilingan branch nomiga qaraydi; detached `HEAD` da hech qaysi `onbranch:` bajarilmaydi. Hook'lar papkasini (`core.hooksPath`, [47-bob](47-hooklar.md)) shunday almashtirish — bitta misol; xuddi shunday branch'ga qarab boshqa imzolash kaliti yoki boshqa `push` sozlamasi berish mumkin.

### `hasconfig:remote.*.url`: remote manziliga qarab

Ish loyihalari bitta papkada turmasa ham, ularni **remote manzili** bo'yicha tanish mumkin:

```ini
[includeIf "hasconfig:remote.*.url:https://gitlab.ishxona.uz/**"]
	path = ~/.gitconfig-ish-remote
```

```ini
# ~/.gitconfig-ish-remote
[user]
	signingKey = ~/.ssh/ish_ed25519.pub
```

```text
$ cd ~/shaxsiy/blog
$ git config get user.signingkey; echo $?
1
$ git remote add origin https://gitlab.ishxona.uz/web/blog.git
$ git config get --show-origin --show-scope user.signingkey
global	file:~/.gitconfig-ish-remote	~/.ssh/ish_ed25519.pub
```

Remote URL `.git/config` da (local), shart esa global faylda. Global o'qilayotganda local hali o'qilmagan bo'ladi — shuning uchun Git bu kalit so'zni birinchi uchratganda qolgan config fayllarini **oldindan ko'zdan kechirib** remote URL'larni yig'adi. Tuxum-tovuq muammosining oldini olish uchun cheklov bor: bu shart orqali qo'shilgan fayl o'zi remote URL e'lon qila olmaydi. Sinab ko'ramiz:

```text
$ printf '[remote "zaxira"]\n\turl = https://example.com/z.git\n' >> ~/.gitconfig-ish-remote
$ git config get user.signingkey
fatal: remote URLs cannot be configured in file directly or indirectly included by includeIf.hasconfig:remote.*.url
```

(Ma'lumotnomaga ko'ra, hozircha `hasconfig:` ning faqat shu bitta shakli — `remote.*.url` — qo'llab-quvvatlanadi; nom kelajakda boshqa o'zgaruvchilar uchun kengaytirish mumkin bo'lsin deb tanlangan.)

### `worktree:` — Git 2.56 yangiligi

Git 2.56.0 reliz yozuvi: `includeIf` endi shartda **worktree joylashuvini** ham ishlata oladi. `gitdir:` `.git` papkasiga qaraydi; bog'langan worktree'da esa (`git worktree add`, [49-bob](49-worktree-va-katta-repo.md)) `.git` asosiy repo ichida qoladi. Ya'ni bitta repo'ning ikkita worktree'si uchun `gitdir:` doim bir xil javob beradi. `worktree:` esa fayllar checkout qilingan papkaga (`git rev-parse --show-toplevel`) qaraydi.

```ini
[includeIf "worktree:~/qurilish/"]
	path = ~/.gitconfig-qurilish
```

```ini
# ~/.gitconfig-qurilish
[core]
	fsmonitor = false
[status]
	showUntrackedFiles = no
```

```text
$ cd ~/ish/mijoz
$ git worktree add -q ~/qurilish/mijoz-build
$ git worktree list
~/ish/mijoz            1ed7a6e [main]
~/qurilish/mijoz-build 1ed7a6e [mijoz-build]

$ git config get --show-origin status.showuntrackedfiles     # ~/ish/mijoz
$ git config get --show-origin user.email
file:~/.gitconfig-ish	ali@ishxona.uz

$ cd ~/qurilish/mijoz-build
$ git rev-parse --git-dir
~/ish/mijoz/.git/worktrees/mijoz-build
$ git config get --show-origin status.showuntrackedfiles
file:~/.gitconfig-qurilish	no
$ git config get --show-origin user.email
file:~/.gitconfig-ish	ali@ishxona.uz
```

Asosiy worktree'da `status.showUntrackedFiles` yo'q, qurilish worktree'sida bor. `user.email` esa ikkalasida bir xil — chunki `gitdir:~/ish/` ikkala holatda ham `~/ish/mijoz/.git...` ga mos keladi. Bu ikki shart birgalikda ishlaydi.

Ma'lumotnomadagi cheklovlar: bare repo'da `worktree:` hech qachon bajarilmaydi (unda worktree yo'q); `gitdir:` dan farqli ravishda hozircha faqat haqiqiy (realpath) yo'l solishtiriladi — worktree'ga symlink orqali kirgan bo'lsangiz, patternda haqiqiy yo'lni yozing. Katta-kichik harfni farqlamaydigan varianti — `worktree/i:`. `extensions.worktreeConfig` + `git config --worktree` ham har worktree'ga alohida sozlama beradi, lekin har worktree ichida alohida buyruq talab qiladi; `includeIf "worktree:..."` esa global faylda bir marta yoziladi va hamma repo'larga ta'sir qiladi.

| Shart | Nimaga solishtiriladi | Misol |
| --- | --- | --- |
| `gitdir:` | `.git` papkasining yo'li | `gitdir:~/ish/` |
| `gitdir/i:` | xuddi shu, harf farqlanmaydi | `gitdir/i:c:/ish/` |
| `worktree:` (2.56+) | worktree (checkout) papkasi | `worktree:~/qurilish/` |
| `worktree/i:` (2.56+) | xuddi shu, harf farqlanmaydi | |
| `onbranch:` | joriy branch nomi | `onbranch:hotfix/` |
| `hasconfig:remote.*.url:` | biror remote URL | `hasconfig:remote.*.url:git@github.com:kompaniya/**` |

## Kod: pager — chiqishni sahifalash

**Pager** — uzun chiqishni ekranma-ekran ko'rsatadigan dastur (odatda `less`). `git log`, `git diff`, `git branch` chiqishi terminalga sig'masa, Git uni pager orqali ko'rsatadi. Tartib ([3-bob](03-birinchi-sozlash.md)da qisqa aytilgan): `GIT_PAGER` → `core.pager` → `PAGER` → yig'ishda tanlangan standart (`less`).

```text
$ git var GIT_PAGER
less
$ PAGER=more git var GIT_PAGER
more
$ git -c core.pager='less -S' var GIT_PAGER
less -S
$ git -c core.pager= var GIT_PAGER
cat
$ GIT_PAGER=cat git -c core.pager='less -S' var GIT_PAGER
cat
```

Pro Git'dagi `git config --global core.pager ''` — pager'ni butunlay o'chirish: bo'sh qiymat `cat` bilan teng, ya'ni hamma chiqish to'g'ridan-to'g'ri terminalga tushadi.

### `LESS=FRX` — Git'ning yashirin sozlamasi

Ma'lumotnoma: `LESS` muhit o'zgaruvchisi o'rnatilmagan bo'lsa, Git uni `FRX` ga tenglaydi. `F` — chiqish bir ekranga sig'sa, `less` darhol yopiladi; `R` — rang kodlarini o'tkazadi; `X` — chiqqandan keyin ekranni tozalamaydi. Shuning uchun qisqa `git log` "pager'siz" ko'rinadi. Pager'ga tushgan muhitni o'z ko'zimiz bilan ko'ramiz (pager o'rniga `env` ni chaqiradigan buyruq; Git pager'ni faqat terminalda ishga tushiradi, shuning uchun `script` bilan terminalga taqlid qildik):

```text
$ git -c core.pager='env | grep "^LESS"; cat >/dev/null' log -1
LESS=FRX
$ LESS=R git -c core.pager='env | grep "^LESS"; cat >/dev/null' log -1
LESS=R
```

`LESS` o'rnatilgan bo'lsa, Git unga tegmaydi. Bitta bayroqni qo'shish uchun `core.pager = less -S` (uzun qatorlarni kesish) — natijada `LESS=FRX less -S` bajariladi; bitta bayroqni o'chirish uchun `less -+F` ("bir ekranga sig'sa chiqib ketish"ni bekor qiladi).

### `pager.<buyruq>`: bitta buyruq uchun

```text
$ git -c core.pager='echo PAGER ISHLADI; cat >/dev/null' branch
PAGER ISHLADI
$ git -c core.pager='echo PAGER ISHLADI; cat >/dev/null' -c pager.branch=false branch
* main
```

`pager.<buyruq>` qiymati mantiqiy bo'lsa — shu buyruq uchun pager'ni yoqadi/o'chiradi; matn bo'lsa — shu buyruq uchun alohida pager (`pager.blame = less -S`). Buyruq qatoridagi `--paginate` (`-p`) va `--no-pager` (`-P`) bu sozlamadan ustun. Ko'p odamlar `git config set --global pager.branch false` ni qo'yadi: branch ro'yxati qisqa, uni pager'da ko'rib `q` bosish noqulay.

## Kod: ranglar

Git terminal chiqishini standart bo'yicha ranglaydi. Bosh kalit — `color.ui`:

| Qiymat | Ma'nosi |
| --- | --- |
| `auto` (standart) | Faqat chiqish terminalga ketganda rang; pipe yoki faylga yo'naltirilganda — rang kodlarisiz |
| `false` / `never` | Hech qachon rang yo'q |
| `true` / `always` | Doim rang — pipe'ga ham ANSI kodlari tushadi |

Pro Git `always` ni deyarli hech qachon tavsiya qilmaydi: rangli chiqish kerak bo'lsa, bitta buyruqqa `--color` bering. `less` yoki `grep` ga yuborilgan `always` kodlari matnni buzadi. Farqni `cat -v` bilan ko'ramiz (u ko'rinmas `ESC` belgisini `^[` qilib ko'rsatadi):

```text
$ git diff | cat -v | head -3
diff --git a/a b/a
index 587be6b..b77b4eb 100644
--- a/a
$ git diff --color | cat -v | head -3
^[[1mdiff --git a/a b/a^[[m
^[[1mindex 587be6b..b77b4eb 100644^[[m
^[[1m--- a/a^[[m
```

### Buyruq bo'yicha va qism bo'yicha

`color.ui` dan tashqari har buyruqning o'z kaliti bor (`color.branch`, `color.diff`, `color.interactive`, `color.status`, `color.grep`, `color.decorate`...) — ular `color.ui` dan ustun. Har birining ichida **slot**'lar — chiqishning alohida qismlari. Masalan `color.diff.<slot>`: `meta` (sarlavha qatorlari), `frag` (`@@` hunk sarlavhasi), `func` (hunk sarlavhasidagi funksiya), `old`, `new`, `context`, `commit`, `whitespace` (whitespace xatolari), `oldMoved`/`newMoved` (`--color-moved` uchun) va boshqalar.

Pro Git misoli — diff sarlavhasini ko'k matn, qora fon, qalin qilish:

```text
$ git -c color.diff.meta="blue black bold" -c color.ui=always diff | cat -v | head -3
^[[1;34;40mdiff --git a/a b/a^[[m
^[[1;34;40mindex 587be6b..b77b4eb 100644^[[m
^[[1;34;40m--- a/a^[[m
```

`1` — qalin, `34` — ko'k matn, `40` — qora fon.

### Rang qiymati sintaksisi

Ma'lumotnoma (`git-config`, "Values → color") Pro Git'dagidan kengroq:

- ko'pi bilan **ikki rang** — birinchisi matn, ikkinchisi fon;
- asosiy ranglar: `normal`, `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `default`; `normal` va `default` dan boshqasining yorqin varianti — `brightred` kabi;
- `0`–`255` raqamlari (256 rang rejimi) va `#ff0ab3` yoki `#f1b` (24-bit RGB);
- **atributlar**: `bold`, `dim`, `ul` (tagiga chizish), `blink`, `reverse`, `italic`, `strike`; oldiga `no`/`no-` qo'yilsa o'chiriladi (`nobold`);
- `reset` — oldin hamma rang va atributni tozalaydi;
- bo'sh qator — "hech qanday rang effekti yo'q".

`--type=color` qiymatni haqiqiy ANSI ketma-ketligiga aylantirib beradi — sozlamani tekshirishning qulay usuli:

```text
$ git config get --type=color --default="blue black bold" color.diff.meta | cat -v
^[[1;34;40m
$ git config get --type=color --default="#ff8800 ul" x.y | cat -v
^[[4;38;2;255;136;0m
$ git config get --type=color --default="qizil" x.y
error: invalid color value: qizil
fatal: failed to format default config value: qizil
```

### Skript uchun: `--get-colorbool`

O'z skriptingiz Git sozlamasiga qarab rang ishlatishi kerak bo'lsa:

```text
$ git config --get-colorbool color.diff; echo "exit=$?"
exit=1
$ git config --get-colorbool color.diff true
true
$ git config --get-colorbool color.diff false
false
$ git -c color.ui=always config --get-colorbool color.diff false
true
$ git -c color.ui=false -c color.diff=always config --get-colorbool color.diff false
true
```

Ikkinchi argument — "chiqish terminalmi?" degan savolga javob; `auto` holatda natija shunga bog'liq. Argumentsiz buyruq o'z stdout'ini tekshiradi va javobni chiqish kodi bilan beradi (bu yerda stdout terminal emas — `1`). `color.diff` sozlanmagan bo'lsa, `color.ui` ga qaraladi.

## Kod: boshqa kundalik klient sozlamalari

### `help.autocorrect`: xato yozilgan buyruq

```text
$ git stauts
git: 'stauts' is not a git command. See 'git --help'.

The most similar command is
	status
```

Git taxmin qiladi, lekin bajarmaydi. `help.autocorrect` buni o'zgartiradi. **Pro Git bilan farq bor**: Pro Git `1` ni "0,1 soniyadan keyin bajarish" deb tushuntiradi. 2.56 ma'lumotnomasida qiymatlar boshqacha:

| Qiymat | Xatti-harakat |
| --- | --- |
| `0`, `false`, `off`, `no`, `show` | Taklifni ko'rsatish (standart) |
| `1`, `true`, `on`, `yes`, `immediate` | Darhol bajarish |
| `1` dan katta son | Shuncha **detsisekund** (0,1 s) kutib bajarish |
| `never` | Hech narsa ko'rsatmaslik |
| `prompt` | Taklif qilish va tasdiq so'rash |

```text
$ git -c help.autocorrect=immediate stauts
WARNING: You called a Git command named 'stauts', which does not exist.
Continuing under the assumption that you meant 'status'.
On branch main
...

$ git -c help.autocorrect=5 stauts
WARNING: You called a Git command named 'stauts', which does not exist.
Continuing in 0.5 seconds, assuming that you meant 'status'.
On branch main
...

$ git -c help.autocorrect=never stauts
git: 'stauts' is not a git command. See 'git --help'.
```

`5` — yarim soniya ichida `Ctrl+C` bosib to'xtatishga ulgurasiz. `prompt` faqat terminalda savol beradi; stdin terminal bo'lmasa (skriptda) taklifsiz xato bilan tugaydi. Alias'lar ham taklifga kiradi:

```text
$ git sw main
git: 'sw' is not a git command. See 'git --help'.

The most similar commands are
	switch
	show
	st
```

Ehtiyot bo'ling: `immediate` "o'xshash" buyruqni so'ramasdan bajaradi. Faqat bitta mos buyruq topilgandagina ishlaydi, lekin xavfli buyruqqa o'xshash xato (masalan `git rset` → `reset`) kutilmagan natija berishi mumkin. Kichik kutish (`10`–`20`) yoki `prompt` xavfsizroq.

### `core.excludesFile` va `core.attributesFile`

Har repo'ning `.gitignore` siga `.DS_Store` yoki muharrirning `*.swp` fayllarini qo'shish — boshqalarning repo'sini sizning shaxsiy muhitingiz bilan ifloslantirish. Buning o'rniga **global ignore** fayli ([8-bob](08-gitignore-rm-mv.md)). Pro Git uni `core.excludesfile ~/.gitignore_global` bilan sozlaydi; ma'lumotnomaga ko'ra esa standart joy allaqachon bor — `$XDG_CONFIG_HOME/git/ignore` (yoki `~/.config/git/ignore`), ya'ni sozlamasiz ham ishlaydi:

```text
$ printf '.DS_Store\n*.swp\n' > ~/.config/git/ignore
$ touch .DS_Store x.swp
$ git status --short
$ git check-ignore -v .DS_Store x.swp
~/.config/git/ignore:1:.DS_Store	.DS_Store
~/.config/git/ignore:2:*.swp	x.swp
$ git config get core.excludesfile; echo $?
1
```

`git status` hech narsa ko'rsatmadi, `core.excludesFile` esa umuman sozlanmagan. Xuddi shunday `core.attributesFile` — global `.gitattributes` ([46-bob](46-gitattributes.md)), standart joyi `~/.config/git/attributes`.

### `commit.template`, `user.signingKey`

- `commit.template` — commit xabari uchun shablon fayl; jamoa xabar formatini eslatish uchun. To'liq misol va `--cleanup` bilan aloqasi [10-bobda](10-yaxshi-commit.md).
- `user.signingKey` — imzolash kaliti, `git tag -s` va `git commit -S` har safar kalitni so'ramasligi uchun ([44-bob](44-imzolash.md)). Yuqoridagi `hasconfig:` misolida u ish remote'lari uchun avtomatik almashdi.

## Kod: tashqi diff va merge dasturlari

Git'ning ichki diff'i bor, lekin uning o'rniga tashqi dastur qo'yish mumkin. Ikki yo'l bor va ular bir-biridan farq qiladi:

| Yo'l | Sozlama | Qachon ishlaydi |
| --- | --- | --- |
| `git difftool` / `git mergetool` | `diff.tool`, `merge.tool`, `difftool.<nom>.cmd`, `mergetool.<nom>.cmd` | Faqat shu buyruqlarni chaqirganingizda — [7-bob](07-diff.md) (`difftool`), [22-bob](22-konfliktlar.md) (`mergetool`) |
| `diff.external` | `diff.external`, `GIT_EXTERNAL_DIFF` | **Har** `git diff` da, ichki diff o'rniga |

Pro Git P4Merge misolida ikkalasini birga ishlatadi: `extMerge` (P4Merge'ni chaqiruvchi qobiq) va `extDiff` (7 argumentdan ikkitasini `extMerge` ga uzatuvchi qobiq):

```ini
[merge]
	tool = extMerge
[mergetool "extMerge"]
	cmd = extMerge "$BASE" "$LOCAL" "$REMOTE" "$MERGED"
	trustExitCode = false
[diff]
	external = extDiff
```

`mergetool` qismi [22-bobda](22-konfliktlar.md) batafsil sinalgan. Bu yerda `diff.external` ning o'zi qanday ishlashini ko'ramiz. Tashqi diff dasturi qanday argument olishini bilish uchun ularni chop etadigan oddiy skript yozamiz:

```bash
#!/bin/sh
# ~/bin/argdiff — Git'dan kelgan 7 argumentni ko'rsatadi, keyin oddiy diff
echo "argumentlar soni: $#"
i=1; for a in "$@"; do echo "  \$$i = $a"; i=$((i+1)); done
echo "  GIT_DIFF_PATH_COUNTER/TOTAL = $GIT_DIFF_PATH_COUNTER/$GIT_DIFF_PATH_TOTAL"
diff -u "$2" "$5" | tail -n +3
exit 0
```

```text
$ git config set diff.external '~/bin/argdiff'
$ git diff
argumentlar soni: 7
  $1 = a
  $2 = /tmp/...
  $3 = 587be6b4c3f93f93c489c0111bba5596147a26cb
  $4 = 100644
  $5 = a
  $6 = 0000000000000000000000000000000000000000
  $7 = 100644
  GIT_DIFF_PATH_COUNTER/TOTAL = 1/1
@@ -1 +1,2 @@
 x
+y
```

Yetti argument — `git` ma'lumotnomasidagi tartib: `path old-file old-hex old-mode new-file new-hex new-mode`. Kuzatishlar:

- `old-file` — Git yaratgan **vaqtinchalik fayl** (index'dagi versiya); dastur tugashi bilan Git uni o'zi o'chiradi.
- `new-file` — working tree'dagi faylning o'zi (`a`), uning hash'i hali hisoblanmagan, shuning uchun `0000...`.
- Yangi qo'shilgan fayl uchun `old-file` = `/dev/null`, hex va mode o'rnida `.` keladi.
- `GIT_DIFF_PATH_COUNTER` / `GIT_DIFF_PATH_TOTAL` — nechanchi fayl va jami nechta.
- Qiymatni qo'shtirnoqda yozdik (`'~/bin/argdiff'`): aks holda shell `~` ni hozir kengaytirib yuboradi; qo'shtirnoqda esa `~` faylga yoziladi va Git buyruqni shell orqali bajarganda kengaytiriladi.

**`git log` tashqi diff'ni standart bo'yicha ishlatmaydi.** Ma'lumotnoma: `git log` oilasi uchun `--ext-diff` kerak.

```text
$ git log -1 -p --format=%s
a

diff --git a/a b/a
new file mode 100644
...
$ git log -1 -p --ext-diff --format=%s
a

argumentlar soni: 7
  $1 = a
  $2 = /dev/null
  $3 = .
  $4 = .
  $5 = /tmp/...
  $6 = 587be6b4c3f93f93c489c0111bba5596147a26cb
  $7 = 100644
...
$ git diff --no-ext-diff
diff --git a/a b/a
index 587be6b..b77b4eb 100644
...
```

`--no-ext-diff` — bir martalik ichki diff'ga qaytish (masalan, patch yaratishda — tashqi dastur chiqishi patch emas). Dastur muvaffaqiyatda `0` qaytarishi kerak; `diff` kabi "farq bor" deb `1` qaytarsa, Git `fatal: external diff died` bilan to'xtaydi ([7-bob](07-diff.md)) — buni `diff.trustExitCode = true` hal qiladi. Muhit o'zgaruvchisi `GIT_EXTERNAL_DIFF` sozlamadan ustun.

**Qachon kerak emas.** Ma'lumotnoma o'zi ogohlantiradi: tashqi dastur faqat ba'zi fayllar uchun kerak bo'lsa, `diff.external` emas, `.gitattributes` dagi `diff=<driver>` + `diff.<driver>.command` ishlating ([46-bob](46-gitattributes.md)). Global `diff.external` hamma faylga — matnga ham — ta'sir qiladi.

## Kod: qator oxirlari — `core.autocrlf`

Windows'da matn faylidagi har qator ikki belgi bilan tugaydi — **CR** (`\r`, "karetkani qaytarish") va **LF** (`\n`, "yangi qator"), qisqacha **CRLF**. macOS va Linux'da faqat **LF**. Ko'p Windows muharrirlari LF'ni jimgina CRLF ga almashtiradi yoki Enter bosilganda CRLF qo'yadi. Natija: faylning har qatori "o'zgargan" ko'rinadi, diff'lar ma'nosiz bo'ladi.

Git buni hal qila oladi: faylni index'ga qo'shishda (`add`) CRLF → LF, checkout'da LF → CRLF. Bu `core.autocrlf` bilan yoqiladi:

| Qiymat | Commit'da (index'ga) | Checkout'da (working tree'ga) | Kim uchun |
| --- | --- | --- | --- |
| `true` | CRLF → LF | LF → CRLF | Windows'da, repo esa LF bo'lsa |
| `input` | CRLF → LF | o'zgartirmaydi | macOS/Linux'da — tasodifiy CRLF'ni tuzatish uchun |
| `false` (sozlanmagan) | o'zgartirmaydi | o'zgartirmaydi | Faqat Windows'da ishlanadigan, CRLF'ni saqlamoqchi bo'lgan loyiha |

Ma'lumotnomadagi aniq ta'rif: `core.autocrlf = true` — hamma faylga `text=auto` atributini va `core.eol = crlf` ni qo'yish bilan teng; `input` — xuddi shu, lekin chiqishda konvertatsiya yo'q.

### Sinov: `input`

Ikki fayl: biri CRLF, biri LF. `git ls-files --eol` har faylning index (`i/`) va working tree (`w/`) dagi qator oxirini ko'rsatadi:

```text
$ printf 'salom\r\ndunyo\r\n' > win.txt
$ printf 'bir\nikki\n' > unix.txt
$ git config get core.autocrlf; echo $?
1
$ git add win.txt unix.txt
$ git ls-files --eol
i/lf    w/lf    attr/                 	unix.txt
i/crlf  w/crlf  attr/                 	win.txt
```

Sozlamasiz Git CRLF'ni index'ga **o'zgarishsiz** yozdi. Qaytarib, `input` bilan qaytadan qo'shamiz:

```text
$ git rm -q --cached win.txt unix.txt
$ git config set core.autocrlf input
$ git add win.txt unix.txt
warning: in the working copy of 'win.txt', CRLF will be replaced by LF the next time Git touches it
$ git ls-files --eol
i/lf    w/lf    attr/                 	unix.txt
i/lf    w/crlf  attr/                 	win.txt
$ git commit -q -m eol
$ git cat-file -p HEAD:win.txt | od -c | head -2
0000000    s   a   l   o   m  \n   d   u   n   y   o  \n
0000014
```

Blob'da faqat `\n`. Working tree'dagi fayl o'zgarmadi (`w/crlf`) — ogohlantirish aynan shuni aytyapti: "keyingi safar Git bu faylga tegsa (checkout), CRLF yo'qoladi".

### Sinov: `true` va sozlamani almashtirish xavfi

```text
$ git config set core.autocrlf true
$ rm unix.txt win.txt
$ git checkout -q -- .
$ git ls-files --eol
i/lf    w/crlf  attr/                 	unix.txt
i/lf    w/crlf  attr/                 	win.txt
$ od -c unix.txt | head -2
0000000    b   i   r  \r  \n   i   k   k   i  \r  \n
0000013
$ git status --short
```

Repo'da LF, diskda CRLF, `status` toza — Windows dasturchisi uchun ideal holat. Endi sozlamani o'chirib qo'yamiz:

```text
$ git config set core.autocrlf false
$ git status --short
 M unix.txt
 M win.txt
$ git diff --stat
 unix.txt | 4 ++--
 win.txt  | 4 ++--
 2 files changed, 4 insertions(+), 4 deletions(-)
```

Hech kim hech narsani tahrirlamagan, lekin har qator "o'zgargan": diskdagi CRLF endi konvertatsiya qilinmaydi va index'dagi LF bilan solishtiriladi. Jamoada har kim o'z `core.autocrlf` ini turlicha qo'yganida aynan shu narsa yuz beradi — butun fayl "o'zgarib" commit qilinadi va `blame` tarixi buziladi. Shuning uchun zamonaviy tavsiya: qator oxiri siyosatini **repo'ning o'zida**, `.gitattributes` da (`* text=auto`, `*.sh text eol=lf`) belgilash ([46-bob](46-gitattributes.md)). `core.autocrlf` — shaxsiy sozlama; `.gitattributes` — commit qilinadigan, hamma uchun bir xil qoida, va u `core.autocrlf` dan ustun.

### `core.safecrlf` va `core.eol`

Aralash fayl — ba'zi qatorlari CRLF, ba'zilari LF:

```text
$ printf 'aralash\r\nqator\n' > aralash.txt
$ git add aralash.txt                       # core.autocrlf=input
warning: in the working copy of 'aralash.txt', CRLF will be replaced by LF the next time Git touches it
$ git ls-files --eol aralash.txt
i/lf    w/mixed attr/                 	aralash.txt
$ git rm -q --cached aralash.txt
$ git -c core.safecrlf=true add aralash.txt
fatal: CRLF would be replaced by LF in aralash.txt
```

`core.safecrlf` konvertatsiya **qaytariladigan**mi, tekshiradi: commit qilib keyin checkout qilganda asl fayl tiklanishi kerak. Aralash fayl uchun bu imkonsiz. `true` — rad etadi, `warn` — ogohlantiradi va davom etadi (yuqoridagi `warning:` qatori aynan shu). Ma'lumotnoma ogohlantiradi: "matn" deb noto'g'ri tanilgan binar faylda CRLF konvertatsiyasi ma'lumotni **buzadi**, va buni matn faylini tuzatishdan farqlab bo'lmaydi. Bunday faylni `.gitattributes` da binar deb belgilang.

`core.eol` — `text` deb belgilangan fayllar uchun working tree'dagi qator oxiri: `lf`, `crlf` yoki `native` (standart, platformaga mos). `core.autocrlf` `true` yoki `input` bo'lsa, `core.eol` e'tiborsiz qoldiriladi.

## Kod: whitespace qoidalari — `core.whitespace`

[10-bobda](10-yaxshi-commit.md) `git diff --check` bilan asosiy whitespace xatolarini topdik. Bu yerda — qaysi narsa "xato" hisoblanishini to'liq boshqarish. Pro Git oltita muammoni sanaydi; 2.56 ma'lumotnomasida yettinchisi ham bor:

| Muammo | Standart | Nima |
| --- | --- | --- |
| `blank-at-eol` | yoqiq | Qator oxiridagi bo'sh joy |
| `blank-at-eof` | yoqiq | Fayl oxiriga qo'shilgan bo'sh qatorlar |
| `space-before-tab` | yoqiq | Chekinishda tab'dan oldingi probel |
| `indent-with-non-tab` | o'chiq | Tab o'rniga probellar bilan chekinish (`tabwidth` dan ko'p probel) |
| `tab-in-indent` | o'chiq | Chekinishdagi tab (probel siyosati uchun) |
| `cr-at-eol` | o'chiq | Qator oxiridagi CR'ni qator tugashining bir qismi deb hisoblash (xato emas) |
| `incomplete-line` | o'chiq | Fayl oxirgi qatorida yangi qator belgisi yo'q (Pro Git'da yo'q) |

Qo'shimcha: `trailing-space` — `blank-at-eol` + `blank-at-eof` ning qisqartmasi; `tabwidth=<n>` — tab kengligi (standart 8, 1–63). Qiymat — vergul bilan ajratilgan ro'yxat; oldiga `-` qo'yilsa o'chiriladi; ro'yxatda yo'q narsa standart holatida qoladi.

Bir faylda bir nechta muammo qilamiz va turli qoidalar bilan tekshiramiz:

```text
$ printf 'def salom():\n    return 1   \n\tif x:\n        pass\n\n' > kod.py
$ git diff --check
kod.py:2: trailing whitespace.
+    return 1   
kod.py:5: new blank line at EOF.

$ git -c core.whitespace=indent-with-non-tab,-blank-at-eof diff --check
kod.py:2: trailing whitespace.
+    return 1   
kod.py:4: indent with spaces.
+        pass

$ git -c core.whitespace=tab-in-indent diff --check
kod.py:2: trailing whitespace.
+    return 1   
kod.py:3: tab in indent.
+	if x:
kod.py:5: new blank line at EOF.
```

E'tibor bering: `indent-with-non-tab` 2-qatorni (4 probel) emas, faqat 4-qatorni (8 probel) belgiladi — xato faqat probellar soni `tabwidth` (8) ga yetganda, ya'ni ularni tab bilan almashtirish mumkin bo'lganda hisoblanadi. `-blank-at-eof` esa 5-qator xatosini o'chirdi.

Yangi `incomplete-line`:

```text
$ printf 'def salom():\n    return 2' > kod.py
$ git -c core.whitespace=incomplete-line diff --check; echo $?
kod.py:2: no newline at the end of file.
2
$ git diff --check; echo $?
0
```

`diff --check` xato topsa `2` bilan chiqadi — skript va hook'lar uchun qulay. Rangli `git diff` da shu xatolar `color.diff.whitespace` rangi bilan ajratiladi.

### `git apply --whitespace` va `git rebase --whitespace`

`core.whitespace` faqat `diff` ga emas, patch qo'llashga ham ta'sir qiladi ([32-bob](32-taqsimlangan-workflowlar.md)). Qator oxirida bo'sh joyli va oxirida ikki bo'sh qatorli patch:

```text
$ git apply ../bosh-joy.patch
../bosh-joy.patch:8: trailing whitespace.
    return 1   
../bosh-joy.patch:9: new blank line at EOF.
+
warning: 2 lines add whitespace errors.

$ git apply --whitespace=error ../bosh-joy.patch; echo $?
../bosh-joy.patch:8: trailing whitespace.
    return 1   
error: 1 line adds whitespace errors.
128

$ git apply --whitespace=fix ../bosh-joy.patch
../bosh-joy.patch:8: trailing whitespace.
    return 1   
../bosh-joy.patch:9: new blank line at EOF.
+
warning: 1 line applied after fixing whitespace errors.
$ cat -e kod.py
def salom():$
    return 1$
```

`warn` (standart) — qo'llaydi va ogohlantiradi; `error` — rad etadi va hech narsa o'zgartirmaydi; `fix` — xatolarni tuzatib qo'llaydi (`cat -e` qator oxirini `$` bilan ko'rsatadi: bo'sh joy ham, oxirgi bo'sh qatorlar ham yo'q); `nowarn` — jim qo'llaydi.

Pro Git eslatadi: xuddi shu opsiya `rebase` da ham bor. Hali push qilinmagan commit'lardagi whitespace xatolarini tarixni qayta yozish yo'li bilan tuzatadi ([24-bob](24-rebase.md)):

```text
$ git log --oneline
69a7364 return qatori
e74cdd6 kod
d346b3a eol
$ git rebase --whitespace=fix HEAD~1
First, rewinding head to replay your work on top of it...
Applying: return qatori
$ git log --oneline
dbd7741 return qatori
e74cdd6 kod
d346b3a eol
$ cat -e kod.py
def salom():$
    return 1$
```

Hash o'zgardi (`69a7364` → `dbd7741`) — bu yangi commit. Ma'lumotnomaga ko'ra `--whitespace` patch'ni qo'llovchi `git apply` ga uzatiladi va shuning uchun eski **apply backend**'ni (`--apply`) yoqadi; chiqishdagi "First, rewinding head..." va "Applying:" qatorlari aynan shu backend'niki. Push qilingan tarixda ishlatmang.

## Kod: server sozlamalari — `receive.*`

Server tomonidagi sozlamalar push **qabul qiluvchi** repo'ga (odatda bare repo) qo'yiladi va `git receive-pack` jarayoni o'qiydi ([29-bob](29-fetch-push-ichidan.md)). Pro Git ularni `--system` bilan ko'rsatadi (serverdagi hamma repo uchun); bitta repo uchun — o'sha repo'ning `config` iga. Sinov uchun lokal bare repo va undan klon:

```text
$ git init -q --bare server/markaz.git
$ git clone -q server/markaz.git ali
$ cd ali
$ ... (ikki commit, main va eski branch'lari push qilindi)
```

### `receive.denyNonFastForwards`: force-push'ni taqiqlash

**Fast-forward bo'lmagan** yangilanish — remote branch ko'rsatayotgan commit yangi commit'ning ajdodi emas, ya'ni push remote'dagi tarixning bir qismini tashlab yuboradi. Odatda bunday push'ni Git o'zi rad etadi, `--force` esa majburlaydi ([29-bob](29-fetch-push-ichidan.md)). Server sozlamasi `--force` ni ham to'xtatadi:

```text
$ git -C ~/server/markaz.git config set receive.denyNonFastForwards true
$ git reset -q --hard HEAD~1
$ git push --force origin main
remote: error: denying non-fast-forward refs/heads/main (you should pull first)
To ~/server/markaz.git
 ! [remote rejected] main -> main (non-fast-forward)
error: failed to push some refs to '~/server/markaz.git'
```

`! [remote rejected]` — klient emas, **server** rad etdi. Ma'lumotnomadagi qiziq tafsilot: bu sozlama umumiy (`--shared`) repo yaratilganda avtomatik qo'yiladi:

```text
$ git init -q --bare --shared=group server/umumiy.git
$ git -C server/umumiy.git config list --local
core.repositoryformatversion=0
core.filemode=true
core.bare=true
core.ignorecase=true
core.precomposeunicode=true
core.sharedrepository=1
receive.denynonfastforwards=true
```

### `receive.denyDeletes`: o'chirishni taqiqlash

Pro Git aytganidek, `denyNonFastForwards` ni aylanib o'tish yo'li bor: branch'ni o'chirib, keyin yangi tarix bilan qaytadan push qilish. Buni `receive.denyDeletes` yopadi:

```text
$ git -C ~/server/markaz.git config set receive.denyDeletes true
$ git push origin --delete eski
remote: error: denying ref deletion for refs/heads/eski
To ~/server/markaz.git
 ! [remote rejected] eski (deletion prohibited)
error: failed to push some refs to '~/server/markaz.git'
```

Endi hech kim push orqali branch yoki tegni o'chira olmaydi. Kerak bo'lsa, administrator serverning o'zida o'chiradi (`git update-ref -d refs/heads/<nom>` — Pro Git "ref faylini qo'lda o'chirish" deydi; reftable formatida fayl yo'q, shuning uchun buyruq to'g'riroq, [17-bob](17-reflar-va-head.md)). Foydalanuvchiga qarab nozik qoidalar (kimgadir ruxsat, kimgadir yo'q) — `pre-receive`/`update` hook'lari ishi ([47-bob](47-hooklar.md)).

### `receive.fsckObjects`: kelgan obyektlarni tekshirish

Git push orqali kelgan har obyektning hash'i to'g'riligini va to'g'ri tuzilganini (masalan, commit'da muallif qatori to'g'ri formatdami) tekshira oladi, lekin standart bo'yicha **tekshirmaydi** — bu katta repo'larda qimmat. Buzuq commit yasab ko'ramiz: muallif emaili `<...>` qavslarsiz ([16-bob](16-commit-obyekti.md)), `--literally` Git'ga tekshiruvsiz yozishni buyuradi:

```text
$ printf 'tree %s\nparent %s\nauthor Ali Valiyev ali@example.com 1791349500 +0500\ncommitter Ali Valiyev <ali@example.com> 1791349500 +0500\n\nbuzuq muallif qatori\n' \
    $(git rev-parse HEAD^{tree}) $(git rev-parse HEAD) | git hash-object -t commit -w --literally --stdin
c2bb3c5d9a528d80c1e743795bf04198e10921e0
$ git update-ref refs/heads/buzuq c2bb3c5d9a528d80c1e743795bf04198e10921e0
$ git fsck
error in commit c2bb3c5d9a528d80c1e743795bf04198e10921e0: missingEmail: invalid author/committer line - missing email
...
```

Sozlamasiz server buni jimgina qabul qiladi:

```text
$ git push origin buzuq
To ~/server/markaz.git
 * [new branch]      buzuq -> buzuq
```

Serverda branch'ni o'chirib (`denyDeletes` yoqiq, shuning uchun serverning o'zida `git update-ref -d refs/heads/buzuq`), tekshiruvni yoqamiz va qaytadan push qilamiz:

```text
$ git -C ~/server/markaz.git config set receive.fsckObjects true
$ git push origin buzuq
remote: error: object c2bb3c5d9a528d80c1e743795bf04198e10921e0: missingEmail: invalid author/committer line - missing email
remote: fatal: fsck error in packed object
error: remote unpack failed: unpack-objects abnormal exit
To ~/server/markaz.git
 ! [remote rejected] buzuq -> buzuq (unpacker error)
error: failed to push some refs to '~/server/markaz.git'
```

Ma'lumotnomaga ko'ra `receive.fsckObjects` o'rnatilmagan bo'lsa, `transfer.fsckObjects` qiymati ishlatiladi — u fetch va push ikkala yo'nalish uchun. Alohida tekshiruvlarni yumshatish: `receive.fsck.<xabar-id>` (masalan `receive.fsck.missingEmail = warn`) — tarixida eski buzuq commit'lari bor repo'lar uchun.

### `receive.denyCurrentBranch`: bare bo'lmagan repo'ga push

Pro Git'da yo'q, lekin amalda tez-tez uchraydi. Checkout qilingan branch'ga push qilish standart bo'yicha rad etiladi:

```text
$ git push ../sayt main
remote: error: refusing to update checked out branch: refs/heads/main
remote: error: By default, updating the current branch in a non-bare repository
remote: is denied, because it will make the index and work tree inconsistent
remote: with what you pushed, and will require 'git reset --hard' to match
remote: the work tree to HEAD.
...
 ! [remote rejected] main -> main (branch is currently checked out)
```

Sababi xabarning o'zida: ref yangilansa-yu index va working tree eski holatda qolsa, ular bir-biriga mos kelmaydi. Qiymatlar: `refuse` (standart), `warn`, `ignore` va `updateInstead` — working tree toza bo'lsa, uni ham yangilaydi (oddiy sayt yoki virtual mashinaga "push bilan deploy" uchun):

```text
$ git -C ../sayt config set receive.denyCurrentBranch updateInstead
$ git push ../sayt main
To ../sayt
   4c62654..244e270  main -> main
$ git -C ../sayt log --oneline -1
244e270 uch
```

## Muhandislik nuqtai nazari: jamoa sozlamalarini repo'da saqlash

`.git/config` commit qilinmaydi — u har klonda alohida. Jamoa bir xil `core.whitespace`, `diff.algorithm` yoki `pull.rebase` ishlatishini istasa nima qiladi? Qulay usul: sozlamalarni repo'dagi oddiy faylga yozib commit qilish va har dasturchi uni **ongli ravishda** `include` qilishi.

```text
$ git config set --file .gitconfig-loyiha core.whitespace tab-in-indent,trailing-space
$ git config set --file .gitconfig-loyiha diff.algorithm histogram
$ git config set -f .gitconfig-loyiha pull.rebase true
$ cat .gitconfig-loyiha
[core]
	whitespace = tab-in-indent,trailing-space
[diff]
	algorithm = histogram
[pull]
	rebase = true
$ git add .gitconfig-loyiha
$ git commit -q -m "Jamoa sozlamalari"
```

Commit qilingan faylni Git **o'zi** o'qimaydi:

```text
$ git config get diff.algorithm; echo "exit=$?"
exit=1
$ git config get --blob HEAD:.gitconfig-loyiha diff.algorithm
histogram
$ git config list --blob HEAD:.gitconfig-loyiha --show-origin
blob:HEAD:.gitconfig-loyiha	core.whitespace=tab-in-indent,trailing-space
blob:HEAD:.gitconfig-loyiha	diff.algorithm=histogram
blob:HEAD:.gitconfig-loyiha	pull.rebase=true
```

`--blob` faylni checkout qilmasdan, to'g'ridan-to'g'ri commit'dan o'qiydi (Git `.gitmodules` ni shunday o'qiydi, [43-bob](43-submodule-bundle-replace.md)). Har dasturchi bir marta ulaydi:

```text
$ git config set include.path ../.gitconfig-loyiha
$ git config get --show-origin --show-scope diff.algorithm
local	file:.git/../.gitconfig-loyiha	histogram
```

Nisbiy yo'l `.git/config` ga nisbatan — shuning uchun `../`. Daraja `local`, chunki include'ni local fayl qildi.

**Nega Git buni avtomatik qilmaydi?** Xavfsizlik. Agar klon qilingan repo'dagi fayl avtomatik o'qilganida, begona repo `core.pager`, `diff.external` yoki `core.fsmonitor` orqali sizning kompyuteringizda istalgan buyruqni bajara olardi. Include — ongli qaror: uni qo'shishdan oldin faylni o'qing va u o'zgarganda (`git log -p .gitconfig-loyiha`) qayta ko'zdan kechiring. Xuddi shu sababdan ko'p jamoalar buyruq bajaruvchi sozlamalarni bunday faylga umuman qo'ymaydi — faqat "xavfsiz" (`diff.algorithm`, `core.whitespace`) qiymatlar. Repo'ga ko'proq aloqador qoidalar — qator oxiri, binar fayllar, diff driver nomi — esa `.gitattributes` ga yoziladi, u avtomatik o'qiladi, lekin dastur nomini emas, faqat driver **nomini** beradi ([46-bob](46-gitattributes.md)).

## Muhandislik nuqtai nazari: qaysi sozlama qaysi darajaga

| Sozlama turi | Daraja | Sabab |
| --- | --- | --- |
| Ism, email, muharrir, pager, ranglar, alias'lar | global | Bu sizning odatlaringiz, repo'ga bog'liq emas |
| Ish/shaxsiy email, imzolash kaliti | global + `includeIf` | Har repo'da eslab qolish shart emas |
| `core.autocrlf` | global (Windows'da `true`, boshqalarda `input` yoki yo'q) | Platformaga bog'liq; repo siyosati esa `.gitattributes` da |
| `core.whitespace`, `diff.algorithm` | jamoa fayli + `include.path` yoki `.gitattributes` (`whitespace` atributi) | Jamoa bilan bir xil bo'lishi kerak |
| `receive.*` | server: system yoki har bare repo'ning `config` i | Klient sozlamasi bu yerda hech narsa qilmaydi |
| Bir martalik tajriba | `git -c ...` | Hech qaysi faylni o'zgartirmaydi |

Va doimiy odat: sozlama kutilganday ishlamasa, birinchi qadam — `git config list --show-origin --show-scope`. Ko'pincha javob "qiymat boshqa joydan, keyinroq o'qilgan fayldan kelyapti".

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `includeIf` ni `[user]` dan oldin yozish | Keyingi qator include qilingan qiymatni bosib ketadi; shart bajarilsa ham email almashmaydi | Maxsuslashtiruvchi include'larni fayl oxiriga qo'ying; `get --all --show-origin` bilan tekshiring |
| `gitdir:~/ish` (oxirida `/` siz) | Faqat aynan `~/ish/.git` ga mos keladi, ichidagi repo'larga emas | `gitdir:~/ish/` |
| Linked worktree'larni `gitdir:` bilan ajratishga urinish | Hamma worktree'ning `.git` i asosiy repo ichida — shart bir xil javob beradi | Git 2.56+ da `worktree:` sharti |
| `hasconfig:` orqali qo'shilgan faylga `remote.*.url` yozish | `fatal: remote URLs cannot be configured in file ... included by includeIf.hasconfig` | Bunday faylda faqat boshqa sozlamalar |
| `git config set diff.external ~/bin/x` (qo'shtirnoqsiz) | Shell `~` ni joriy foydalanuvchi uyiga kengaytirib yozadi — boshqa muhitda yo'l noto'g'ri | `'~/bin/x'` yoki to'liq yo'l |
| `diff.external` ni hamma fayl uchun qo'yish | Matn fayllari ham tashqi dasturdan o'tadi; patch yaratish buziladi | Faqat kerakli fayllar uchun `.gitattributes` da `diff=<driver>`; bir martalik — `--no-ext-diff` |
| `color.ui = always` | Pipe va fayllarga ANSI kodlari tushadi, `grep`/skriptlar buziladi | `auto`; bir buyruq uchun `--color` |
| Jamoada har kim `core.autocrlf` ni o'zicha qo'yishi | Butun fayllar "o'zgargan" bo'lib commit qilinadi, `blame` buziladi | Repo'da `.gitattributes` (`* text=auto`), `core.autocrlf` faqat shaxsiy fallback |
| `help.autocorrect = 1` ni "0,1 soniya" deb o'ylash (Pro Git) | 2.56 da `1` = darhol bajarish | Kutish uchun `>1` qiymat (detsisekund) yoki `prompt` |
| `receive.*` ni klient repo'siga yozish | Bu sozlamalarni faqat push qabul qiluvchi `receive-pack` o'qiydi | Serverdagi bare repo'ning `config` iga yoki `--system` |
| Klon qilingan repo'dagi config faylini o'qimay `include.path` qilish | Undagi `core.pager`/`diff.external` sizning nomingizdan buyruq bajaradi | Avval o'qing; faqat xavfsiz kalitlarni include qiling |

## Amaliyot

1. `git config list --show-origin --show-scope` ni repo ichida va tashqarisida ishlating. Global faylingizga `[include] path = .gitconfig-alias` qo'shib, alias'larni o'sha faylga ko'chiring. Chiqishda alias qatorlari qaysi fayl va qaysi daraja bilan ko'rinadi? `git config list --global` va `--global --includes` farqini tushuntiring.
2. `gitdir:~/ish/` va `gitdir:~/ish` (slashsiz), `gitdir:ISH/` va `gitdir/i:ISH/` variantlarini sinang. Har biri qaysi repo'larda bajarilishini jadvalga yozing va ma'lumotnomadagi to'rt qoida bilan izohlang.
3. `onbranch:release/` sharti bilan faqat `release/*` branch'larda ishlaydigan `commit.template` sozlang. Branch'lar orasida o'tib, `git config get --show-origin commit.template` bilan tekshiring.
4. Git 2.56+ da bitta repo'ga ikkita worktree yarating va faqat bittasiga ta'sir qiladigan `includeIf "worktree:..."` yozing. Xuddi shuni `gitdir:` bilan qilib bo'lmasligini `git rev-parse --git-dir` chiqishi bilan isbotlang.
5. `core.pager` ni `less -S`, keyin `''` qilib `git log` ni ko'ring. `pager.branch false` ni qo'ying. `color.diff.meta`, `color.diff.new`, `color.diff.old` ni o'zingizga yoqqan rangga sozlab, `git config get --type=color` bilan ANSI ketma-ketligini tekshiring.
6. `diff.external` uchun 7 argumentni chop etuvchi skript yozing. `git diff`, `git diff --cached`, `git log -p --ext-diff` va yangi qo'shilgan fayl uchun argumentlar qanday farq qilishini yozib qo'ying.
7. CRLF va LF fayllar bilan `core.autocrlf` ning uchala qiymatini sinang (`git ls-files --eol` va `od -c` bilan). `true` dan `false` ga o'tganda `git status` nima ko'rsatadi va nega?
8. (Qiyinroq) Lokal bare repo yarating va unga `receive.denyNonFastForwards`, `receive.denyDeletes`, `receive.fsckObjects` ni qo'ying. Uchala himoyani buzishga urinib ko'ring: `push --force`, `push --delete`, `hash-object --literally` bilan yasalgan buzuq commit. Har rad javobidagi `[remote rejected]` sababini yozing. So'ng `receive.fsck.missingEmail = ignore` bilan buzuq commit'ni o'tkazib ko'ring va bu nima uchun xavfli ekanini tushuntiring.

## Rasmiy hujjat

- Pro Git — Git Configuration: <https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration>
- `git config` (Includes, Conditional includes, `--show-origin`, `--show-scope`, `--blob`, `--url`, `--type=color`): <https://git-scm.com/docs/git-config>
- Git 2.56.0 reliz yozuvi (`includeIf "worktree:..."`): <https://github.com/git/git/blob/master/Documentation/RelNotes/2.56.0.adoc>
- `core.autocrlf`, `core.safecrlf`, `core.eol`, `core.whitespace`, `core.pager`: <https://git-scm.com/docs/git-config#Documentation/git-config.txt-coreautocrlf>
- `git` (`GIT_EXTERNAL_DIFF`, 7 argument): <https://git-scm.com/docs/git#Documentation/git.txt-codeGITEXTERNALDIFFcode>
- `git apply` (`--whitespace`): <https://git-scm.com/docs/git-apply>
- `git rebase` (`--whitespace`): <https://git-scm.com/docs/git-rebase>
- `git receive-pack` va `receive.*` sozlamalari: <https://git-scm.com/docs/git-receive-pack>
- `gitattributes` (`text`, `eol`, diff driver'lar): <https://git-scm.com/docs/gitattributes>
