# 03 — Birinchi sozlash va yordam

[← Oldingi: Terminal va o'rnatish](02-terminal-va-ornatish.md) · [Mundarija](README.md) · [Keyingi: Repo olish: `init` va `clone` →](04-repo-olish.md)

## Tushuncha

Git o'rnatilgandan keyin birinchi ish — uni **sozlash**: siz kimsiz, qaysi matn muharririda ishlaysiz, yangi repo'larda birinchi branch qanday nomlanadi. Bu ishlar bir kompyuterda **bir marta** qilinadi, Git yangilanganda ham saqlanib qoladi va istalgan payt o'zgartiriladi.

Hamma sozlamalar bitta buyruq bilan o'qiladi va yoziladi: `git config`. Sozlama (konfiguratsiya o'zgaruvchisi) — `bo'lim.kalit = qiymat` ko'rinishidagi juftlik. Masalan, `user.name` — `user` bo'limidagi `name` kaliti.

Sozlamalar oddiy matn fayllarda saqlanadi va bunday fayl bir nechta joyda bo'lishi mumkin. Har joy — bitta **daraja** (rasmiy hujjatda *scope*):

| Daraja | Fayl | Kimga ta'sir qiladi | `git config` opsiyasi |
| --- | --- | --- | --- |
| system | `$(prefix)/etc/gitconfig` (masalan `/etc/gitconfig`) | Kompyuterdagi **hamma** foydalanuvchi va ularning hamma repo'si | `--system` |
| global | `~/.gitconfig` yoki `~/.config/git/config` | **Siz** (joriy foydalanuvchi), sizning hamma repo'ingiz | `--global` |
| local | `.git/config` (repo ichida) | Faqat **shu bitta repo** | `--local` (standart) |
| worktree | `.git/config.worktree` | Faqat bitta worktree ([49-bob](49-worktree-va-katta-repo.md)) | `--worktree` |
| command | `git -c ...` va `GIT_CONFIG_*` muhit o'zgaruvchilari | Faqat **shu bitta buyruq** | — |

Qoida oddiy: **tor daraja keng darajadan ustun**. Git fayllarni tartib bilan o'qiydi — system, global, local, worktree, command — va bir kalit bir necha joyda uchrasa, **oxirgi o'qilgan qiymat** g'olib bo'ladi. Shuning uchun `.git/config` dagi qiymat `~/.gitconfig` dagini, u esa `/etc/gitconfig` dagini "bosib" turadi.

```text
  system   /etc/gitconfig           user.email = tizim@example.com
     │
     ▼  ustidan yoziladi
  global   ~/.gitconfig             user.email = ali@example.com
     │
     ▼  ustidan yoziladi
  local    .git/config              user.email = ali@ishxona.uz   ◄── g'olib
     │
     ▼  ustidan yoziladi
  command  git -c user.email=...    (faqat bitta buyruq uchun)
```

`$(prefix)` — Git qayerga o'rnatilganiga bog'liq: Linux paketlarida odatda `/etc/gitconfig`, macOS'dagi Homebrew'da `/opt/homebrew/etc/gitconfig`. Windows'da (Git for Windows) global fayl `$HOME` papkasida (`C:\Users\<siz>\.gitconfig`), system fayl esa o'rnatish papkasiga nisbatan `etc/gitconfig` va qo'shimcha ravishda `C:\ProgramData\Git\config`.

## Nega shunday: nega ism va email shunchalik muhim

Har commit ichida muallif (`author`) va commit qiluvchi (`committer`) qatorlari bor. Ular **aynan** `user.name` va `user.email` sozlamalaridan olinadi va commit obyektining bir qismi bo'lib qoladi. Commit obyektining hash'i esa uning butun mazmunidan, shu jumladan ism va emaildan hisoblanadi ([16-bob](16-commit-obyekti.md)).

Natija: commit qilingandan keyin ism yoki emailni "shunchaki tuzatib qo'yib" bo'lmaydi. Sozlamani o'zgartirsangiz, bu **keyingi** commit'larga ta'sir qiladi; eski commit'ni o'zgartirish esa yangi hash'li yangi commit yaratish demak (bu bobning oxirida ko'ramiz). Shuning uchun Pro Git birinchi qadam sifatida aynan identifikatsiyani sozlashni tavsiya qiladi.

Darajalar nega kerak? Chunki ehtiyojlar har xil:

- **system** — administrator butun kompyuter uchun umumiy narsa qo'yadi (masalan, kompaniya proksisi yoki credential helper);
- **global** — sizning shaxsiy odatlaringiz: ism, email, muharrir, alias'lar ([12-bob](12-teglar-va-aliaslar.md));
- **local** — bitta loyihaning o'ziga xosligi: ish repo'sida ish emaili, ochiq manba loyihada shaxsiy email;
- **command** — bir martalik tajriba yoki skript, hech qaysi faylni o'zgartirmasdan.

Bitta umumiy fayl bo'lganida, ish va shaxsiy loyihalarni ajratish yoki administrator sozlamasini o'zingizniki bilan almashtirish imkoni bo'lmasdi.

## Kod: hozir nima sozlangan

Toza o'rnatilgan Git'da global fayl yo'q. Repo ichida `git config list` faqat `git init` yozgan local sozlamalarni ko'rsatadi:

```text
$ git config list --show-scope
local	core.repositoryformatversion=0
local	core.filemode=true
local	core.bare=false
local	core.logallrefupdates=true
local	core.ignorecase=true
local	core.precomposeunicode=true
```

`--show-scope` har qator oldiga darajani, `--show-origin` esa aniq faylni qo'shadi. Ikkalasi birga — "bu qiymat qayerdan keldi?" degan savolga eng tez javob. (`core.ignorecase` va `core.precomposeunicode` macOS'da paydo bo'ladi: `git init` fayl tizimini tekshirib, katta-kichik harfni farqlamasligini aniqlagan.)

> **Yangi va eski sintaksis.** Git 2.46 dan boshlab `git config` buyrug'i kichik buyruqlarga bo'lingan: `list`, `get`, `set`, `unset`, `rename-section`, `remove-section`, `edit`. Pro Git va ko'p maqolalar eski shaklni ishlatadi: `git config --list`, `git config user.name`, `git config user.name "Ali"`, `git config --unset ...`. Eski shakllar hamon ishlaydi, lekin rasmiy ma'lumotnomada "deprecated" (eskirgan) bo'limida turibdi. Bu qo'llanmada yangi shakl ishlatiladi, eskisi yonida ko'rsatiladi.

| Vazifa | Yangi (2.46+) | Eski |
| --- | --- | --- |
| Hammasini ko'rish | `git config list` | `git config --list` (`-l`) |
| Qiymatni o'qish | `git config get user.name` | `git config user.name` yoki `--get` |
| Hamma qiymat (ko'p qiymatli kalit) | `git config get --all ...` | `git config --get-all ...` |
| Yozish | `git config set user.name "Ali"` | `git config user.name "Ali"` |
| Qo'shish (o'chirmasdan) | `git config set --append ...` | `git config --add ...` |
| O'chirish | `git config unset user.name` | `git config --unset user.name` |
| Faylni muharrirda ochish | `git config edit` | `git config --edit` (`-e`) |

## Kod: ism va email

```bash
$ git config set --global user.name "Ali Valiyev"
$ git config set --global user.email ali@example.com
```

Hech narsa chiqmaydi — `git config` muvaffaqiyatda jim turadi. `--global` bo'lgani uchun yozuv `~/.gitconfig` ga tushdi:

```text
$ cat ~/.gitconfig
[user]
	name = Ali Valiyev
	email = ali@example.com
```

Eski sintaksis bilan ham aynan shu natija chiqadi: `git config --global user.email ali@example.com`.

O'qish:

```text
$ git config get user.name
Ali Valiyev
$ git config list --global
user.name=Ali Valiyev
user.email=ali@example.com
```

E'tibor bering: ism ichida bo'sh joy bor, shuning uchun qo'shtirnoq kerak — aks holda shell `Valiyev`ni alohida argument deb uzatadi.

### Sozlanmagan bo'lsa nima bo'ladi

Git ism va emailni topa olmasa, ularni **taxmin qilishga** urinadi: operatsion tizimdagi foydalanuvchi nomi va kompyuter nomidan (`login@kompyuter-nomi.local` kabi). Commit bajariladi, lekin ogohlantirish chiqadi (shaxsiy ma'lumotlar `...` bilan yashirildi):

```text
$ git commit -m "Birinchi"
[master (root-commit) ...] Birinchi
 Committer: ...
Your name and email address were configured automatically based
on your username and hostname. Please check that they are accurate.
You can suppress this message by setting them explicitly. Run the
following command and follow the instructions in your editor to edit
your configuration file:

    git config --global --edit

After doing this, you may fix the identity used for this commit with:

    git commit --amend --reset-author
```

Bunday commit'da "email" — GitHub yoki GitLab hech qachon sizning hisobingizga bog'lay olmaydigan `...@...local` manzil. Agar taxmin qilishning imkoni bo'lmasa (yoki `user.useConfigOnly` yoqilgan bo'lsa), Git commit qilishdan bosh tortadi:

```text
$ git -c user.useConfigOnly=true commit --allow-empty -m x
Author identity unknown

*** Please tell me who you are.

Run

  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"

to set your account's default identity.
Omit --global to set the identity only in this repository.

fatal: no email was given and auto-detection is disabled
```

Git hozir kim nomidan commit qilishini oldindan bilish uchun — `git var`:

```text
$ git var GIT_AUTHOR_IDENT
Ali Valiyev <ali@example.com> 1791349200 +0500
```

Oxirgi ikki qism — Unix vaqt belgisi (1970-yildan beri o'tgan soniyalar) va vaqt mintaqasi. Commit obyektiga aynan shu qator yoziladi.

### `user.useConfigOnly`: taxminni o'chirish

Ma'lumotnoma bu sozlamani bir nechta emaili bor odamlar uchun tavsiya qiladi: global darajada `user.useConfigOnly = true` va faqat `user.name` qo'ysangiz, global email yo'q bo'ladi va Git har yangi repo'da commit oldidan emailni so'raydi — ish repo'siga tasodifan shaxsiy email bilan commit qilib qo'yish imkoni qolmaydi.

### `author.*` va `committer.*`

`user.name`/`user.email` ikkala maydonni to'ldiradi. Kamdan-kam hollarda ular farqlanishi kerak bo'lsa, `author.name`, `author.email`, `committer.name`, `committer.email` sozlamalari bor. Ularning hammasidan ustun — muhit o'zgaruvchilari `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL` va `EMAIL` ([48-bob](48-muhit-ozgaruvchilari.md)).

> **Ism — bu login emas.** `user.name` — commit'da ko'rinadigan shaxsiy ism, GitHub foydalanuvchi nomi yoki parol bilan aloqasi yo'q. Kirish ma'lumotlari credential helper orqali boshqariladi ([30-bob](30-ssh-va-credential.md)).

## Kod: bitta repo uchun boshqa email

Ish loyihasida ish emaili bilan commit qilish kerak. Repo ichida `--global`siz yozamiz — standart daraja `--local`:

```text
$ git config set user.email ali@ishxona.uz
$ cat .git/config
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
	ignorecase = true
	precomposeunicode = true
[user]
	email = ali@ishxona.uz
```

Endi `user.email` ikki joyda bor. Qaysi biri ishlatiladi va qayerdan keladi:

```text
$ git config get --show-origin user.email
file:.git/config	ali@ishxona.uz

$ git config get --all --show-scope user.email
global	ali@example.com
local	ali@ishxona.uz
```

`get` faqat oxirgi (g'olib) qiymatni beradi, `get --all` — o'qish tartibida hammasini. `user.name` esa local'da yo'q, shuning uchun global'dan olinadi. Commit qilsak:

```text
$ git commit -q -m "Birinchi commit"
$ git cat-file -p HEAD
tree 4fb1dba79134c7521fb146f3d6bef9b4032c9e76
author Ali Valiyev <ali@ishxona.uz> 1791349200 +0500
committer Ali Valiyev <ali@ishxona.uz> 1791349200 +0500

Birinchi commit
```

Ism global'dan, email local'dan — ikki darajaning birikmasi to'g'ridan-to'g'ri commit obyektiga yozildi.

## Kod: to'rt daraja birga

Darajalar ustunligini ko'rish uchun system fayliga ham email qo'yamiz va `-c` bilan bir martalik qiymat beramiz:

```text
$ git config get --all --show-scope user.email
system	tizim@example.com
global	ali@example.com
local	ali@ishxona.uz

$ git config get --show-scope user.email
local	ali@ishxona.uz

$ git -c user.email=bir.martalik@example.com config get --all --show-scope user.email
system	tizim@example.com
global	ali@example.com
local	ali@ishxona.uz
command	bir.martalik@example.com
```

Ro'yxat har doim o'qish tartibida: system → global → local → command. G'olib — pastdagisi.

`git -c <kalit>=<qiymat> <buyruq>` — istalgan Git buyrug'iga bir martalik sozlama beradi va hech qaysi faylni o'zgartirmaydi. `=`siz yozilsa (`git -c foo.bar ...`) qiymat `true` bo'ladi. Skriptlar uchun xuddi shu ishni `GIT_CONFIG_COUNT`, `GIT_CONFIG_KEY_0`, `GIT_CONFIG_VALUE_0` muhit o'zgaruvchilari qiladi (ular fayllardan ustun, `-c`dan esa past).

System darajasiga yozish administrator huquqini talab qiladi (Linux'da `sudo git config set --system ...`). Hozirgi system fayl qayerdaligini ko'rish:

```text
$ git config list --system --show-origin
file:/opt/homebrew/etc/gitconfig	credential.helper=osxkeychain
```

Bu macOS'dagi Homebrew Git — u `credential.helper`ni oldindan system darajasida qo'yib beradi.

### Global'ning ikki fayli

Global daraja ikki faylni o'z ichiga oladi: `~/.gitconfig` va `$XDG_CONFIG_HOME/git/config` (`XDG_CONFIG_HOME` o'rnatilmagan bo'lsa — `~/.config/git/config`). Ikkalasi bo'lsa, Git avval XDG faylini, keyin `~/.gitconfig`ni o'qiydi — ya'ni `~/.gitconfig` ustun:

```text
$ git config list --show-scope --show-origin
global	file:.../.config/git/config	color.ui=auto
global	file:.../.gitconfig	user.name=Ali Valiyev
...
```

(Uzun yo'llar `...` bilan qisqartirildi.) Yozishda `--global` doim `~/.gitconfig`ga yozadi; faqat `~/.gitconfig` **yo'q**, XDG fayli esa **bor** bo'lsa — XDG fayliga. Ikki faylni aralashtirib yubormaslik uchun bittasini tanlang.

> **Sinovda ko'rilgan nozik joy.** Ma'lumotnomada `--global` o'qishda ikkala faylni o'qishi yozilgan. Git 2.56.0 da sinaganimizda, `~/.gitconfig` mavjud bo'lsa, `git config list --global` XDG faylidagi qiymatlarni **ko'rsatmadi** (oddiy `git config list` esa ko'rsatdi). "Qiymat qayerdan keldi" degan savolga `--global` bilan emas, `--show-origin` bilan javob izlang.

## Kod: muharrir

Git sizdan matn yozishni so'raganda (commit xabari, teg izohi, interaktiv rebase ro'yxati) matn muharririni ochadi. Qaysi muharrir ochilishi — `git var` hujjatida aniq tartib bilan yozilgan:

1. `GIT_EDITOR` muhit o'zgaruvchisi;
2. `core.editor` sozlamasi;
3. `VISUAL` muhit o'zgaruvchisi;
4. `EDITOR` muhit o'zgaruvchisi;
5. Git yig'ilganda tanlangan standart — odatda `vi`.

Har birini sinab ko'ramiz (`git var GIT_EDITOR` muharrirni ochmaydi, faqat qaysi biri ochilishini aytadi):

```text
$ git var GIT_EDITOR
vi
$ EDITOR=nano git var GIT_EDITOR
nano
$ VISUAL=code git var GIT_EDITOR
code

$ git config set --global core.editor nano
$ VISUAL=code git var GIT_EDITOR
nano
$ GIT_EDITOR=vim git var GIT_EDITOR
vim
```

`core.editor` `VISUAL`/`EDITOR`dan ustun, lekin `GIT_EDITOR`dan past. Hech narsa sozlanmagan bo'lsa — `vi`. Pro Git ogohlantiradi: muharrirni sozlamasangiz, Git uni ishga tushirganda chalkash holatga tushib qolishingiz mumkin. Boshlovchilar ko'pincha `vi` ichida qolib ketadi: chiqish uchun `Esc`, keyin `:q!` va `Enter` (saqlamasdan) yoki `:wq` (saqlab).

Mashhur muharrirlar uchun qiymatlar:

```bash
$ git config set --global core.editor nano
$ git config set --global core.editor vim
$ git config set --global core.editor emacs
$ git config set --global core.editor "code --wait"      # VS Code
```

Qiymat shell orqali bajariladi, shuning uchun argumentlar ham yozish mumkin. `code --wait` dagi `--wait` muhim: usiz VS Code oynani ochadi-yu darhol "tugadim" deb qaytadi, Git esa bo'sh xabarni ko'rib commit'ni bekor qiladi. Grafik muharrirlarning ko'pchiligida shunday "kutish" opsiyasi bor.

Windows'da muharrirning bajariladigan fayliga **to'liq yo'l** kerak. Pro Git Notepad++ uchun shunday misol beradi:

```bash
$ git config set --global core.editor "'C:/Program Files/Notepad++/notepad++.exe' -multiInst -notabbar -nosession -noPlugin"
```

Yo'lda bo'sh joy bo'lgani uchun u bittalik qo'shtirnoq ichida, butun qiymat esa qo'shtirnoq ichida.

Yana ikki yaqin sozlama: `sequence.editor` (faqat `rebase -i` ro'yxati uchun, [25-bob](25-tarixni-qayta-yozish.md)) va `core.pager` (`log`, `diff` chiqishini sahifalab ko'rsatuvchi dastur, odatda `less`). Ularning tartibi ham `git var` hujjatida: `GIT_PAGER` → `core.pager` → `PAGER` → `less`.

## Kod: boshlang'ich branch nomi

`git init` yangi repo'da birinchi branch'ni yaratadi ([4-bob](04-repo-olish.md)). Hech narsa sozlanmagan Git 2.56 uni `master` deb ataydi va shu haqda uzun maslahat chiqaradi:

```text
$ git init yangi
hint: Using 'master' as the name for the initial branch. This default branch name
hint: will change to "main" in Git 3.0. To configure the initial branch name
hint: to use in all of your new repositories, which will suppress this warning,
hint: call:
hint:
hint: 	git config --global init.defaultBranch <name>
hint:
hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
hint: 'development'. The just-created branch can be renamed via this command:
hint:
hint: 	git branch -m <name>
hint:
hint: Disable this message with "git config set advice.defaultBranchName false"
Initialized empty Git repository in .../yangi/.git/
$ cat yangi/.git/HEAD
ref: refs/heads/master
```

Maslahatni bajaramiz:

```text
$ git config set --global init.defaultBranch main
$ git init ish
Initialized empty Git repository in .../ish/.git/
$ cat ish/.git/HEAD
ref: refs/heads/main
$ git var GIT_DEFAULT_BRANCH
main
```

Maslahat yo'qoldi, `HEAD` endi `refs/heads/main`ga ishora qiladi. `init.defaultBranch` Git 2.28 da qo'shilgan; undan oldin nom faqat `master` bo'lardi.

**Git 3.0.** Rasmiy `BreakingChanges` hujjatiga ko'ra Git 3.0 da yangi repo'larda standart nom `main` bo'ladi — bu katta Git xostinglari (GitHub, GitLab) allaqachon ishlatayotgan nom bilan mos. Maslahat matnining o'zi ham shuni aytyapti. Sozlamani hozir qo'yib qo'ysangiz, Git 3.0 ga o'tishda hech narsa o'zgarmaydi.

Nom — shunchaki nom: `main` hech qanday maxsus branch emas ([20-bob](20-branch-bu-ref.md)). Bitta repo uchun boshqa nom kerak bo'lsa, `git init -b trunk` ([4-bob](04-repo-olish.md)); mavjud branch'ni qayta nomlash — `git branch -m` ([23-bob](23-branch-boshqaruvi.md)).

Shu bo'limdagi qo'shni sozlamalar `init.defaultObjectFormat` (SHA-1 yoki SHA-256, [14-bob](14-obyektlar-blob.md)) va `init.defaultRefFormat` (`files` yoki `reftable`, [17-bob](17-reflar-va-head.md)) — ikkalasi ham Git 3.0 da standarti o'zgaradigan narsalar.

## Kod: config faylining sintaksisi

Config fayllari oddiy matn — ularni `git config` orqali ham, muharrirda ham tahrirlash mumkin:

```bash
$ git config edit --global       # ~/.gitconfig ni muharrirda ochadi
$ git config edit                # .git/config ni ochadi
```

Ma'lumotnomadagi qoidalar:

```ini
# '#' yoki ';' — qator oxirigacha izoh
[user]                          ; bo'lim — kvadrat qavsda
	name = Ali Valiyev          ; kalit = qiymat, atrofidagi bo'sh joylar e'tiborsiz
	email = ali@example.com

[core]
	editor = code --wait

[remote "origin"]               ; bo'lim + qo'shtirnoqdagi kichik bo'lim (subsection)
	url = https://example.com/loyiha.git

[http]
	sslVerify                   ; qiymatsiz kalit = true
```

- Bo'lim va kalit nomlari katta-kichik harfni **farqlamaydi**: `user.email`, `USER.EMAIL`, `User.Email` — bitta kalit. Kichik bo'lim nomi (`"origin"`) esa farqlaydi.
- Kalit nomida faqat harf, raqam va `-`, harf bilan boshlanadi.
- Qiymat boshida yoki oxirida bo'sh joy kerak bo'lsa — qo'shtirnoq. Qo'shtirnoq ichida `\"` va `\\`; `\n`, `\t`, `\b` qochish belgilari tan olinadi.
- Ba'zi kalitlar bir necha marta yozilishi mumkin (ko'p qiymatli, *multivalued*), masalan `remote.origin.fetch`.

```text
$ git config get USER.EMAIL
ali@ishxona.uz

$ git config set nomsiz qiymat
error: key does not contain a section: nomsiz
```

`git config list` kalit nomlarini kichik harfga keltirib chiqaradi — shuning uchun faylda `defaultBranch` yozilgan bo'lsa ham ro'yxatda `init.defaultbranch=main` ko'rinadi.

### Izoh bilan yozish va tur tekshiruvi

`--comment` yozilgan qator oxiriga izoh qo'shadi:

```text
$ git config set --comment "ishxona hisobi" user.email ali@ishxona.uz
$ tail -2 .git/config
[user]
	email = ali@ishxona.uz # ishxona hisobi
```

Mantiqiy (boolean) qiymatlar ko'p shaklda yozilishi mumkin: `true`/`yes`/`on`/`1` va `false`/`no`/`off`/`0`. `--type=bool` ularni bir xil shaklga keltiradi — skriptlarda foydali:

```text
$ git config set core.filemode yes
$ git config get core.filemode
yes
$ git config get --type=bool core.filemode
true
```

Boshqa turlar: `int` (`k`, `m`, `g` qo'shimchalari bilan), `bool-or-int`, `path` (`~`ni kengaytiradi), `expiry-date`, `color`.

### Chiqish kodlari

Skriptda `git config` natijasini tekshirish uchun chiqish kodi (exit code) muhim. Ba'zilari:

```text
$ git config get yoq.kalit; echo $?
1
$ git config set nomsiz qiymat; echo $?
error: key does not contain a section: nomsiz
2
$ git config unset user.email; echo $?
0
$ git config unset user.email; echo $?
5
```

`1` — kalit topilmadi (yoki noto'g'ri), `2` — bo'lim ko'rsatilmagan, `5` — o'chirilayotgan kalit yo'q (yoki bir nechta qatorga mos keldi). Topilmagan kalit uchun standart qiymat — `--default`:

```text
$ git config get --default=yoq user.signingkey
yoq
```

## Muhandislik nuqtai nazari: identifikatsiya commit'ga "pishib" qoladi

Commit qilingandan keyin sozlamani o'zgartirish eski commit'ni o'zgartirmaydi:

```text
$ git log -1 --format='%an <%ae>'
Ali Valiyev <ali@ishxona.uz>
$ git config set user.name "Ali V."
$ git log -1 --format='%an <%ae>'
Ali Valiyev <ali@ishxona.uz>
$ git var GIT_AUTHOR_IDENT
Ali V. <ali@ishxona.uz> 1791349200 +0500
```

Eski commit'da eski ism qoldi, **keyingi** commit esa yangisini oladi. Oxirgi commit'ni tuzatish uchun Git maslahatidagi buyruq — `git commit --amend --reset-author` ([11-bob](11-bekor-qilish.md)). Local `user.name` va `user.email`ni o'chirib (global `Ali Valiyev <ali@example.com>` qoladi), sinab ko'ramiz:

```text
$ git rev-parse --short HEAD
b3978ec
$ git config unset user.name
$ git config unset user.email
$ git commit --amend --reset-author --no-edit -q
$ git log -1 --format='%h %an <%ae>'
13e0551 Ali Valiyev <ali@example.com>
```

Hash `b3978ec` dan `13e0551` ga o'zgardi: bu boshqa commit. Agar eski commit allaqachon boshqalarga yuborilgan (push qilingan) bo'lsa, bu tarixni qayta yozish bo'ladi va jamoadoshlaringizga muammo tug'diradi ([24-bob](24-rebase.md), [25-bob](25-tarixni-qayta-yozish.md)). Ko'p commit'larda ism/emailni ommaviy almashtirish — `.mailmap` (faqat ko'rinishda) yoki `filter-repo` (haqiqiy qayta yozish) ishi. Eng arzon yo'l — birinchi commit'dan oldin to'g'ri sozlash.

## Muhandislik nuqtai nazari: ish va shaxsiy emailni avtomatik ajratish

Har yangi ish repo'sida `git config set user.email ...` ni eslab qolish — xato manbai. Git'da **shartli include** bor: global fayl, repo qaysi papkada joylashganiga qarab, boshqa faylni qo'shib o'qiydi.

```ini
# ~/.gitconfig
[user]
	name = Ali Valiyev
	email = ali@example.com
[includeIf "gitdir:~/ish/"]
	path = ~/.gitconfig-ish
```

```ini
# ~/.gitconfig-ish
[user]
	email = ali@ishxona.uz
```

`~/ish/` ichidagi har repo'da email avtomatik almashadi, boshqa joyda esa shaxsiy email qoladi:

```text
$ cd ~/ish/mijoz && git config get --show-origin user.email
file:.../.gitconfig-ish	ali@ishxona.uz

$ cd ~/shaxsiy/blog && git config get --show-origin user.email
file:.../.gitconfig	ali@example.com
```

`gitdir:` pattern'idagi oxirgi `/` muhim: u "shu papka ichidagi hamma narsa" (`~/ish/**`) degani. `includeIf` ning boshqa shartlari (`gitdir/i`, `onbranch`, `hasconfig:remote.*.url`) va shunga o'xshash ilg'or sozlamalar [45-bobda](45-config-chuqur.md).

## Muhandislik nuqtai nazari: himoyalangan config va xavfsizlik

`.git/config` — repo ichidagi fayl. Begona odamdan olingan repo (masalan, arxivdan ochilgan papka) ichida kimdir `core.editor` yoki `core.pager` kabi "buyruq bajaradigan" sozlamani yozib qo'ygan bo'lishi mumkin. Shuning uchun ma'lumotnoma **himoyalangan config** (*protected configuration*) tushunchasini kiritadi: system, global va command darajalari. Ba'zi xavfsizlik bilan bog'liq sozlamalar (masalan, `safe.directory`) faqat shu darajalarda o'qiladi, `.git/config`dagisi e'tiborsiz qoldiriladi — aks holda repo o'zini o'zi "xavfsiz" deb e'lon qila olardi.

Amaliy xulosa: begona repo'ni ochishdan oldin `.git/config` ni ko'zdan kechiring, shaxsiy sozlamalarni esa global darajada saqlang.

Skript yoki CI uchun esa teskari ehtiyoj bor — foydalanuvchi sozlamalari umuman ta'sir qilmasin. Buning uchun:

```bash
$ GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 git ...
```

`GIT_CONFIG_GLOBAL` va `GIT_CONFIG_SYSTEM` global/system fayl o'rniga boshqa faylni (yoki `/dev/null` — hech narsani) o'qitadi, `GIT_CONFIG_NOSYSTEM` system faylni o'tkazib yuboradi ([48-bob](48-muhit-ozgaruvchilari.md)). Bu qo'llanmadagi misollar ham shunday ajratilgan muhitda sinalgan.

## Kod: yordam olish

Git'ning to'liq qo'llanmasi (man sahifalari) kompyuteringizda o'rnatilgan va **internetsiz** ishlaydi. Uchta teng yo'l bilan ochiladi:

```bash
$ git help config
$ git config --help
$ man git-config
```

`git --help ...` ichkarida `git help ...` ga aylantiriladi, shuning uchun natija bir xil. Sahifa `man` dasturida ochiladi: o'qish — strelkalar va `Space`, qidirish — `/so'z`, chiqish — `q`.

Butun man sahifasi kerak bo'lmasa, opsiyalarni eslash uchun `-h` — qisqa ro'yxat to'g'ridan-to'g'ri terminalga:

```text
$ git add -h
usage: git add [<options>] [--] <pathspec>...

    -n, --[no-]dry-run    dry run
    -v, --[no-]verbose    be verbose

    -i, --[no-]interactive
                          interactive picking
    -p, --[no-]patch      select hunks interactively
    ...
    -f, --[no-]force      allow adding otherwise ignored files
    -u, --[no-]update     update tracked files
    ...
    -A, --[no-]all        add changes from all tracked and untracked files
    ...
```

`--[no-]` yozuvi — opsiyaning teskari shakli ham borligini bildiradi (`--no-verbose`). Pro Git'dagi `git add -h` chiqishi biroz eskirgan: 2.56 da `--auto-advance`, `-U`, `--resolved` kabi yangi opsiyalar bor. Shuning uchun har doim **o'z** Git versiyangizning `-h` va `help` chiqishiga ishoning.

`git help` ning boshqa shakllari:

| Buyruq | Nima ko'rsatadi |
| --- | --- |
| `git help` | Eng ko'p ishlatiladigan buyruqlar, vazifa bo'yicha guruhlangan |
| `git help -a` | Hamma buyruqlar (alias'lar va `PATH`dagi tashqi `git-*` buyruqlar ham) |
| `git help -g` | Konseptual qo'llanmalar (`glossary`, `workflows`, `everyday`, ...) |
| `git help -c` | Hamma config o'zgaruvchilari ro'yxati (2.56 da 1000 dan ortiq qator) |
| `git help <alias>` | Alias nimaga teng ekanini |
| `git help -w <buyruq>` | Sahifani brauzerda HTML ko'rinishida (o'rnatilgan bo'lsa) |
| `git help git` | Git'ning o'zi haqida umumiy sahifa |

```text
$ git help -g
The Git concept guides are:
   core-tutorial    A Git core tutorial for developers
   credentials      Providing usernames and passwords to Git
   cvs-migration    Git for CVS users
   datamodel        Git's core data model
   diffcore         Tweaking diff output
   everyday         A useful minimum set of commands for Everyday Git
   faq              Frequently asked questions about using Git
   glossary         A Git Glossary
   namespaces       Git namespaces
   remote-helpers   Helper programs to interact with remote repositories
   submodules       Mounting one repository inside another
   tutorial         A tutorial introduction to Git
   tutorial-2       A tutorial introduction to Git: part two
   workflows        An overview of recommended workflows with Git
...

$ git help -c | grep -E '^(init|user)\.'
init.defaultBranch
init.defaultObjectFormat
init.defaultRefFormat
init.defaultSubmodulePathConfig
init.templateDir
user.email
user.name
user.signingKey
user.useConfigOnly

$ git config set --global alias.st status
$ git help st
'st' is aliased to 'status'
```

Konseptual qo'llanma ham `git help <nom>` bilan ochiladi: `git help glossary` — Git atamalari lug'ati, `git help everyday` — kundalik minimum buyruqlar.

Yordam formatini sozlash mumkin: `help.format` (`man`, `info`, `web`), `help.browser` yoki `web.browser`, `man.viewer`. Ma'lumotnoma ularni `--global` darajada qo'yishni tavsiya qiladi, chunki bu repo'ga emas, foydalanuvchiga tegishli narsa.

Odamlardan yordam kerak bo'lsa, Pro Git Libera Chat IRC serveridagi `#git`, `#github`, `#gitlab` kanallarini tilga oladi. Bu qo'llanmaning har bobi oxirida ham rasmiy hujjat havolalari bor — ular git-scm.com'dagi xuddi shu man sahifalari.

## Muhandislik nuqtai nazari: birinchi kunlik minimal sozlama

Yangi kompyuterda Git ishlatishdan oldin quyidagilar yetarli:

```bash
$ git config set --global user.name "Ism Familiya"
$ git config set --global user.email siz@example.com
$ git config set --global init.defaultBranch main
$ git config set --global core.editor "code --wait"     # yoki nano, vim...
$ git config list --show-origin                          # tekshirish
```

Natijaviy `~/.gitconfig`:

```ini
[user]
	name = Ali Valiyev
	email = ali@example.com
[init]
	defaultBranch = main
[core]
	editor = code --wait
```

Qolgan foydali sozlamalar o'z boblarida keladi: alias'lar ([12-bob](12-teglar-va-aliaslar.md)), qator oxirlari `core.autocrlf` va ranglar ([45-bob](45-config-chuqur.md)), `pull.rebase` ([27-bob](27-remote.md)), imzolash ([44-bob](44-imzolash.md)). Hamma narsani birdaniga sozlashga shoshilmang: har sozlama nimani o'zgartirishini bilgan holda qo'shing.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Ism/emailni sozlamay commit qilish | Commit'da `login@kompyuter.local` kabi taxminiy identifikatsiya qoladi; xosting uni hisobingizga bog'lamaydi | Birinchi commit'dan oldin `git config set --global user.name/user.email`; kerak bo'lsa `user.useConfigOnly=true` |
| Push qilingan commit'lar uchun emailni sozlamada o'zgartirib, "tuzaldi" deb o'ylash | Sozlama faqat keyingi commit'larga ta'sir qiladi; eski commit'lar hash bilan qotgan | Oxirgi lokal commit — `commit --amend --reset-author`; ko'pi — `.mailmap` yoki `filter-repo` |
| `--global`ni unutib, bitta repo ichida "global" sozlama qilish | Qiymat faqat shu `.git/config`ga yoziladi, boshqa repo'larda yo'q | `git config get --show-origin <kalit>` bilan qayerga yozilganini tekshiring |
| `core.editor = code` (`--wait`siz) | Muharrir darhol qaytadi, Git bo'sh xabar bilan commit'ni bekor qiladi | `code --wait`, `subl -w` kabi kutish opsiyasi bilan |
| Windows'da muharrirni faqat nomi bilan berish | Git dasturni topa olmaydi yoki yo'ldagi bo'sh joyda bo'linadi | To'liq yo'l, bo'sh joyli yo'l ichki qo'shtirnoqda |
| `vi` ochilib qolganda terminalni yopish | Commit chala qoladi, `.git` ichida vaqtinchalik fayllar qolishi mumkin | `Esc`, `:q!` (bekor) yoki `:wq` (saqlash); keyin `core.editor` sozlang |
| Ism ichidagi bo'sh joyni qo'shtirnoqsiz yozish | `git config set user.name Ali Valiyev` → `error: wrong number of arguments, should be 2` | `"Ali Valiyev"` |
| Qiymat qayerdan kelganini taxmin qilish | System, global, XDG, local, include — beshta manba bo'lishi mumkin | `git config list --show-origin --show-scope` |
| Begona repo'ning `.git/config`iga ishonish | U yerda buyruq bajaradigan sozlamalar bo'lishi mumkin | Ochishdan oldin ko'zdan kechiring; shaxsiy sozlamalarni global'da saqlang |

## Amaliyot

1. `git config list --show-origin --show-scope` ni repo tashqarisida va ichida ishlating. Qaysi darajalar bor, qaysi fayllardan o'qilyapti? System fayl qayerda ekanini toping.
2. Global `user.name`, `user.email`, `init.defaultBranch`, `core.editor`ni sozlang. `~/.gitconfig` ni `cat` bilan oching va har qator qaysi buyruqdan kelganini ayting. Xuddi shuni eski sintaksis (`git config --global ...`) bilan qiling — fayl o'zgardimi?
3. Vaqtinchalik papkada repo yarating, local `user.email` qo'ying, commit qiling va `git cat-file -p HEAD` bilan ism global'dan, email local'dan kelganini ko'ring.
4. `git var GIT_EDITOR` bilan muharrir tartibini tekshiring: avval hech narsasiz, keyin `EDITOR=nano`, keyin `core.editor` bilan, oxirida `GIT_EDITOR=...` bilan. Natijalarni beshta pog'onali ro'yxat bilan solishtiring.
5. `git -c user.email=test@example.com var GIT_AUTHOR_IDENT` ni ishlating, keyin `git config list` — sozlama faylga yozilmaganini tasdiqlang.
6. `git help -g` dan bitta qo'llanmani (masalan `glossary`) oching. `git add -h` va `git help add` farqini o'z so'zingiz bilan tushuntiring.
7. (Qiyinroq) `includeIf "gitdir:..."` bilan ikki papka uchun ikki xil email sozlang. Har papkada repo yaratib, `git config get --show-origin user.email` bilan tekshiring. Pattern oxiridagi `/` ni olib tashlang — nima o'zgaradi va nega? (Ma'lumotnomadagi "Conditional includes" bo'limiga qarang.)

## Rasmiy hujjat

- Pro Git — First-Time Git Setup: <https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup>
- Pro Git — Getting Help: <https://git-scm.com/book/en/v2/Getting-Started-Getting-Help>
- `git config` (darajalar, fayllar, sintaksis, `includeIf`): <https://git-scm.com/docs/git-config>
- `git help`: <https://git-scm.com/docs/git-help>
- `git var` (muharrir va pager tartibi): <https://git-scm.com/docs/git-var>
- `git` (`-c`, `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_NOSYSTEM`): <https://git-scm.com/docs/git>
- Git 3.0 o'zgarishlari (`main`, SHA-256, reftable): <https://git-scm.com/docs/BreakingChanges>
