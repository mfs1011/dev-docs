# 02 — Terminal va o'rnatish

[← Oldingi: Versiya nazorati va Git nima](01-versiya-nazorati.md) · [Mundarija](README.md) · [Keyingi: Birinchi sozlash va yordam →](03-birinchi-sozlash.md)

## Tushuncha

Git'dan foydalanishning ko'p yo'li bor: asl **buyruq qatori** (command line) vositalari va imkoniyatlari turlicha bo'lgan ko'plab **grafik interfeyslar** (GUI) — masalan, kod muharriridagi Git paneli yoki alohida dasturlar. Bu qo'llanmada Git'ni buyruq qatorida ishlatamiz.

**Terminal** (buyruq qatori, *shell*) — kompyuterga matnli buyruq yozib, natijani matn ko'rinishida oladigan oyna. macOS'da u **Terminal** dasturi, Windows'da **Command Prompt** yoki **PowerShell** (Git for Windows bilan kelgan **Git Bash** ham), Linux'da odatda shunchaki "Terminal" deb ataladi.

Bu bobda ikki narsani qilamiz:

1. Git'ni kompyuterga o'rnatamiz (yoki o'rnatilganini tekshiramiz) va qaysi Git ishlayotganini aniq bilib olamiz.
2. Git buyruqlari qanday tuzilganini — opsiyalar, argumentlar, `--`, qo'shtirnoq — o'rganamiz. Bu keyingi barcha boblardagi buyruqlarni to'g'ri o'qish uchun kerak.

Kitobdagi misollar quyidagicha yoziladi:

```text
$ git --version
git version 2.56.0
```

`$` — terminalning taklif belgisi (*prompt*), uni yozmaysiz. `$` dan keyingi qism — siz yozadigan buyruq. Uning ostidagi `$`siz qatorlar — Git'ning javobi. Sizda prompt boshqacha ko'rinishi mumkin (`%`, `>`, papka nomi bilan va hokazo) — bu muhim emas.

## Nega shunday: nega aynan buyruq qatori

Pro Git buyruq qatorini tanlashning uch sababini aytadi:

- **Barcha** Git buyruqlarini faqat buyruq qatorida ishga tushirish mumkin. Ko'p GUI'lar soddalik uchun Git imkoniyatlarining faqat bir qismini amalga oshiradi. Ushbu kitobdagi `cat-file`, `fsck`, `reflog`, `bisect` kabi buyruqlarning ko'pchiligi GUI'da umuman yo'q.
- Buyruq qatori versiyasini bilsangiz, GUI versiyasini ham ehtimol tushunib olasiz. **Teskarisi esa shart emas**: tugmani bosishni bilish uning ortida nima bo'layotganini tushunish degani emas.
- Qaysi GUI'ni tanlash — shaxsiy did masalasi. Buyruq qatori vositalari esa Git o'rnatilgan **har bir** kompyuterda bor.

To'rtinchi, amaliy sabab: buyruq — bu **matn**. Uni hujjatga ko'chirish, hamkasbga yuborish, skriptga qo'yish, aniq takrorlash mumkin. "Mana bu tugmani bosing, keyin o'ngdagi menyudan..." degan ko'rsatmani esa takrorlash qiyin, xatoni topish undan ham qiyin.

Bu GUI'dan voz keching degani emas. Ko'p tajribali dasturchilar diff ko'rish yoki konflikt hal qilish uchun grafik vositadan foydalanadi ([7-bob](07-diff.md), [22-bob](22-konfliktlar.md)). Lekin GUI biror narsani "g'alati" qilganda, nima bo'lganini tushunish va tuzatish uchun buyruq qatori kerak bo'ladi.

> Terminalni qanday ochishni bilmasangiz, davom etishdan oldin shuni qisqacha o'rganib oling: macOS'da Spotlight orqali "Terminal", Windows'da Start menyusidan "PowerShell" yoki "Git Bash". Keyingi misollarning hammasi terminalda bajariladi.

## Kod: Git o'rnatilganmi?

Avval tekshiring — ko'p tizimlarda Git allaqachon bor:

```text
$ git --version
git version 2.56.0
```

`git --version` (qisqasi `git -v`) — Git dasturining versiyasini chiqaradi. Rasmiy ma'lumotnomaga ko'ra bu opsiya ichkarida `git version` buyrug'iga aylantiriladi, shuning uchun uchala yozuv bir xil natija beradi:

```text
$ git -v
git version 2.56.0
$ git version
git version 2.56.0
```

Agar javob o'rniga `command not found` (yoki Windows'da "is not recognized...") chiqsa — Git o'rnatilmagan yoki terminal uni topa olmayapti. Quyidagi o'rnatish bo'limiga o'ting.

Allaqachon o'rnatilgan bo'lsa ham, Pro Git **eng so'nggi versiyaga yangilashni** tavsiya qiladi. Git orqaga moslikni juda yaxshi saqlaydi, shuning uchun har qanday yangi versiya kitobdagi misollar bilan ishlaydi. Juda eski versiyalarda esa ba'zi buyruqlar bo'lmasligi yoki biroz boshqacha ishlashi mumkin — masalan, bu kitobda ko'p ishlatiladigan `git switch` va `git restore` Git 2.23 da paydo bo'lgan.

> **Bu kitob versiyasi.** Pro Git (2-nashr) Git 2 bo'yicha yozilgan. Bu qo'llanmadagi barcha misollar **Git 2.56.0** da ishga tushirilgan ([Mundarija](README.md)). Sizda versiya boshqacha bo'lsa, chiqishdagi matn biroz farq qilishi mumkin, lekin mazmuni bir xil bo'ladi.

## O'rnatish

Git'ni o'rnatishning ikki asosiy yo'li bor: tayyor **paket** yoki o'rnatuvchi dastur (*installer*) orqali, yoki **manba kodini** yuklab olib, o'zingiz yig'ish (*compile*).

> **Muhim izoh.** Quyidagi Linux va Windows buyruqlari Pro Git'dan olingan va bu qo'llanmaning sinov muhitida (macOS) **ishga tushirilmagan** — ular tizim paketlarini o'rnatadi. Tarqatmangizning rasmiy ko'rsatmasini <https://git-scm.com/downloads> sahifasida tekshiring.

### Linux

Linux'da asosiy Git vositalarini odatda tarqatmangiz (*distribution*) bilan keladigan **paket menejeri** orqali o'rnatasiz.

Fedora yoki unga yaqin RPM asosidagi tarqatmalar (RHEL, CentOS) — `dnf`:

```bash
$ sudo dnf install git-all
```

Debian asosidagi tarqatmalar (masalan, Ubuntu) — `apt`:

```bash
$ sudo apt install git-all
```

`sudo` — buyruqni administrator huquqi bilan bajarish (parol so'raladi). `git-all` — Git va unga yondosh barcha qismlar (masalan, `git svn`, `gitk`, hujjatlar) to'plami. Faqat asosiy Git kerak bo'lsa, ko'p tarqatmalarda `git` nomli kichikroq paket ham bor.

Boshqa Unix tarqatmalari uchun ko'rsatmalar Git saytida: <https://git-scm.com/download/linux>.

**Eslatma.** Tarqatma paketlari ko'pincha eng so'nggi Git versiyasidan **orqada** bo'ladi (barqaror tarqatmalar versiyani muzlatib qo'yadi). Kitobdagi yangi imkoniyatlar (masalan, `git switch -m` dagi 2.54 xatti-harakati, [20-bob](20-branch-bu-ref.md)) eski versiyada bo'lmasligi mumkin. `git --version` ni har doim tekshiring.

### macOS

macOS'da bir nechta yo'l bor.

**1. Xcode Command Line Tools.** Eng oson yo'l. Mavericks (10.9) va undan yangi tizimlarda terminalda birinchi marta `git` ni ishga tushirishning o'zi yetarli:

```bash
$ git --version
```

Agar o'rnatilmagan bo'lsa, tizim uni o'rnatishni taklif qiladi. Bu Apple tomonidan yig'ilgan Git, u `/usr/bin/git` da turadi va versiyasi o'z belgisi bilan chiqadi. Bizning sinov kompyuterimizda:

```text
$ /usr/bin/git --version
git version 2.50.1 (Apple Git-155)
$ xcode-select -p
/Library/Developer/CommandLineTools
```

Apple versiyasi odatda eng so'nggi Git'dan bir necha versiya orqada bo'ladi (bu yerda 2.50.1, eng so'nggisi esa 2.56.0).

**2. Rasmiy o'rnatuvchi.** Yangiroq versiya kerak bo'lsa, Git saytidagi macOS bo'limidan o'rnatuvchini yuklab olish mumkin: <https://git-scm.com/download/mac>.

**3. Paket menejeri.** Ko'p dasturchilar Homebrew ishlatadi (`brew install git`). Bu kitobning sinov muhitidagi Git aynan shu yo'l bilan o'rnatilgan:

```text
$ brew list --versions git
git 2.56.0
```

(Homebrew — Git loyihasiga tegishli emas, uchinchi tomon vositasi. U Pro Git'da tilga olinmagan; bu yerda faqat sinov muhitini tushuntirish uchun ko'rsatildi.)

### Windows

Windows'da ham bir necha yo'l bor. Eng rasmiy yig'ma — Git saytida: <https://git-scm.com/download/win> sahifasiga kirsangiz, yuklab olish avtomatik boshlanadi.

E'tibor bering: bu **Git for Windows** deb ataladigan loyiha. U Git'ning o'zidan **alohida** loyiha (Git'ni Windows'ga moslab yig'adi va ustiga Git Bash, credential manager kabi qismlar qo'shadi). Batafsil: <https://gitforwindows.org>.

Avtomatlashtirilgan o'rnatish uchun **Chocolatey** paketi bor: <https://community.chocolatey.org/packages/git>. Bu paketni Git jamoasi emas, **hamjamiyat** yuritadi.

O'rnatgandan keyin terminalni (PowerShell yoki Git Bash) **qayta oching** — ochiq turgan oyna yangi `PATH` ni bilmaydi — va `git --version` bilan tekshiring.

### Manbadan yig'ish

Ba'zilar Git'ni manba kodidan o'rnatishni afzal ko'radi, chunki shunda **eng so'nggi** versiya olinadi. Tayyor o'rnatuvchilar biroz orqada qoladi, garchi Git yetuklashgani sari bu farq kamroq ahamiyatli bo'lib qolgan.

**Bog'liqliklar** (Git yig'ilishi uchun kerak bo'lgan kutubxonalar). Pro Git ro'yxati: autotools, curl, zlib, openssl, expat va libiconv. Fedora va Debian'da minimal to'plam:

```bash
$ sudo dnf install dh-autoreconf curl-devel expat-devel gettext-devel \
  openssl-devel perl-devel zlib-devel
$ sudo apt-get install dh-autoreconf libcurl4-gnutls-dev libexpat1-dev \
  gettext libz-dev libssl-dev
```

(Qator oxiridagi `\` — "buyruq keyingi qatorda davom etadi" degani.)

Hujjatlarni turli formatlarda (doc, html, info) ham yig'ish uchun qo'shimcha:

```bash
$ sudo dnf install asciidoc xmlto docbook2X
$ sudo apt-get install asciidoc xmlto docbook2x
```

Tarqatmaga xos qo'shimchalar:

- RHEL va uning hosilalari (CentOS, Scientific Linux) `docbook2X` paketini olish uchun **EPEL** repo'sini yoqishi kerak;
- Debian asosidagi tarqatmalarga `install-info` paketi kerak (`sudo apt-get install install-info`);
- RPM asosidagi tarqatmalarga `getopt` paketi kerak (`sudo dnf install getopt`; Debian'da u allaqachon bor);
- Fedora/RHEL'da binar nomlari farqi tufayli: `sudo ln -s /usr/bin/db2x_docbook2texi /usr/bin/docbook2x-texi`.

Git manba kodidagi rasmiy `INSTALL` fayli (v2.56.0) bog'liqliklarni aniqroq ajratadi: **zlib** — majburiy ("Git usiz yig'ilmaydi"); qolganlari ixtiyoriy va `NO_<KUTUBXONA>=YesPlease` bilan o'chirilishi mumkin — masalan, **libcurl** (`http://`/`https://` orqali fetch/push uchun, kamida 7.61.0 versiya, `NO_CURL`), **expat** (`NO_EXPAT`), **Perl** 5.26.0+ (`git send-email`, `git svn` uchun, `NO_PERL`), **gettext** (tarjimalar, `NO_GETTEXT`), **Tcl/Tk** (`gitk` va `git-gui` uchun, `NO_TCLTK`), **Python** 2.7+ (`git-p4` uchun). Bundan tashqari tarmoq orqali push/pull uchun **ssh** va ba'zi skriptlar uchun POSIX shell kerak.

**Manba arxivini olish.** Eng so'nggi teglangan reliz arxivini quyidagi joylardan olasiz:

- kernel.org: <https://www.kernel.org/pub/software/scm/git> — bu yerda reliz **imzolari** ham bor, yuklab olingan faylni tekshirish uchun;
- GitHub'dagi nusxa: <https://github.com/git/git/tags> — eng so'nggi versiya qaysi ekani odatda aniqroq ko'rinadi.

**Yig'ish va o'rnatish** (Pro Git misoli; versiya raqamini o'zingizniki bilan almashtiring):

```bash
$ tar -zxf git-2.8.0.tar.gz
$ cd git-2.8.0
$ make configure
$ ./configure --prefix=/usr
$ make all doc info
$ sudo make install install-doc install-html install-info
```

- `tar -zxf` — arxivni ochadi;
- `make configure` + `./configure --prefix=/usr` — tizimingizni tekshirib, Git **qayerga** o'rnatilishini belgilaydi (`/usr/bin/git` va hokazo);
- `make all doc info` — dastur va hujjatlarni yig'adi;
- `sudo make install ...` — tizimga o'rnatadi.

`INSTALL` faylidagi muhim nozik joy: yig'ilgan Git'da `prefix`dan kelib chiqqan yo'llar **ichiga yozib qo'yiladi**. Shuning uchun `make all` qilib, keyin `make prefix=/usr install` qilish ishlamaydi — `prefix` yig'ishda ham, o'rnatishda ham bir xil bo'lishi kerak. `prefix` berilmasa, `make` + `make install` Git'ni `~/bin/` ga o'rnatadi.

O'rnatgandan keyin Git'ning keyingi versiyalarini **Git'ning o'zi bilan** olishingiz mumkin:

```bash
$ git clone https://git.kernel.org/pub/scm/git/git.git
```

### Manbadan yig'ish: Pro Git'dan keyin nima o'zgardi

Pro Git bu bo'limni yozganidan beri Git'ning yig'ish tizimida ikkita muhim o'zgarish bo'ldi (v2.56.0 manba kodi va `BreakingChanges` hujjati bo'yicha):

**Meson.** `Makefile`dan tashqari Git endi **Meson** yig'ish tizimini ham qo'llab-quvvatlaydi (`meson.build` fayli). Uning afzalliklari: manba papkasidan tashqarida yig'ish, IDE'lar bilan yaxshiroq integratsiya, tizimdagi imkoniyatlarni avtomatik aniqlash. Eng oddiy holat (`meson.build` dagi izohdan):

```bash
$ meson setup build/
$ cd build
$ meson compile
$ meson test
```

**Rust.** Git kodining bir qismi Rust tilida yozila boshladi:

- Git 2.49 dan Rust qismlari qo'shila boshlagan, hozircha ular **ixtiyoriy**;
- Git 2.55 dan ikkala yig'ish tizimida Rust **standart holatda yoqilgan** — Rust kompilyatori bo'lmasa, standart yig'ish buziladi; uni yig'ish opsiyasi bilan hali o'chirish mumkin;
- Git 3.0 da Rust **majburiy** bo'lishi rejalashtirilgan (`BreakingChanges`; agar tarqatmalarga ta'siri katta bo'lsa, keyinga surilishi mumkin).

Amalda: Git'ni hozir manbadan yig'ayotgan bo'lsangiz, Rust toolchain'ini ham o'rnating yoki Rust'ni o'chirib yig'ing.

Sizning Git'ingiz qanday yig'ilganini `--build-options` ko'rsatadi:

```text
$ git version --build-options
git version 2.56.0
cpu: arm64
no commit associated with this build
sizeof-long: 8
sizeof-size_t: 8
shell-path: /bin/sh
rust: disabled
feature: fsmonitor--daemon
gettext: enabled
libcurl: 8.7.1
zlib: 1.2.12
SHA-1: SHA1_DC
SHA-256: SHA256_BLK
default-ref-format: files
default-hash: sha1
```

Bu chiqishdan foydali narsalar:

- `rust: disabled` — bu yig'ma Rust'siz yig'ilgan (2.55 dan Rust standart yoqilgan bo'lsa ham, paket tayyorlovchi uni o'chirib qo'ygan);
- `SHA-1: SHA1_DC` — SHA-1 **to'qnashuvni aniqlaydigan** (*collision detection*) kutubxona bilan hisoblanmoqda. Ma'lumotnomaga ko'ra `SHA1_APPLE`, `SHA1_OPENSSL` va `SHA1_BLK` variantlari to'qnashuvni aniqlamaydi va ma'lum SHA-1 to'qnashuv hujumlariga zaif bo'lishi mumkin ([1-bob](01-versiya-nazorati.md));
- `default-hash: sha1` va `default-ref-format: files` — yangi repo'lar SHA-1 va oddiy fayl ref'lari bilan yaratiladi. Git 3.0 da bular `sha256` va `reftable` bo'ladi ([20-bob](20-branch-bu-ref.md)).

Xato haqida xabar berganda (masalan, Git ro'yxatiga) `git version --build-options` chiqishini qo'shish odatiy hol.

## Kod: qaysi Git ishlayapti?

Bitta kompyuterda bir nechta Git bo'lishi juda keng tarqalgan holat — masalan, macOS'da Apple'ning `/usr/bin/git` va Homebrew o'rnatgan yangi versiya. Terminal `git` deb yozganingizda **`PATH`** muhit o'zgaruvchisidagi papkalarni chapdan o'ngga ko'rib chiqadi va birinchi topilgan `git` ni ishga tushiradi.

**Muhit o'zgaruvchisi** (*environment variable*) — terminal har ishga tushirgan dasturga uzatadigan nom=qiymat juftligi. `PATH` — dastur qidiriladigan papkalar ro'yxati, `:` bilan ajratilgan (Windows'da `;`).

`type -a git` (bash/zsh) shu tartibda **hamma** `git` larni ko'rsatadi. Bir kompyuterda `PATH` tartibini o'zgartirib ko'ramiz:

```text
$ PATH=/opt/homebrew/opt/git/bin:/usr/bin:/bin
$ type -a git
git is /opt/homebrew/opt/git/bin/git
git is /usr/bin/git
$ git --version
git version 2.56.0

$ PATH=/usr/bin:/bin:/opt/homebrew/opt/git/bin
$ type -a git
git is /usr/bin/git
git is /opt/homebrew/opt/git/bin/git
$ git --version
git version 2.50.1 (Apple Git-155)
```

Ikki Git ham o'rnatilgan, lekin qaysi biri ishlashini `PATH` tartibi hal qiladi. "Yangi Git o'rnatdim, lekin versiya o'zgarmadi" degan muammoning sababi deyarli har doim shu. Windows'da xuddi shu vazifani `where git` bajaradi.

Git dasturining o'z qismlari qayerda turganini ham so'rash mumkin:

```text
$ git --exec-path
/opt/homebrew/opt/git/libexec/git-core
$ git --man-path
/opt/homebrew/opt/git/share/man
$ git --html-path
/opt/homebrew/opt/git/share/doc/git-doc
```

`--exec-path` — Git'ning ichki dasturlari (`git-add`, `git-commit` va hokazo, bu yig'mada 183 ta fayl) joylashgan papka; `--man-path` va `--html-path` — hujjatlar ([3-bob](03-birinchi-sozlash.md)dagi `git help` shulardan foydalanadi).

## Kod: Git buyrug'ining tuzilishi

Har bir Git buyrug'i bir xil tuzilishga ega:

```text
git  [global opsiyalar]  <buyruq>  [buyruq opsiyalari]  [argumentlar]  [--]  [yo'llar]
 │          │               │              │                 │          │       │
 │          │               │              │                 │          │       └ fayl/papka nomlari
 │          │               │              │                 │          └ "bundan keyin faqat yo'l"
 │          │               │              │                 └ ko'pincha revision (commit, branch)
 │          │               │              └ masalan -m, --oneline
 │          │               └ add, commit, log, ... (ichki buyruq, subcommand)
 │          └ -C, -c, --no-pager — HAMMA buyruqqa tegishli
 └ dasturning o'zi
```

Misol: `git -C loyiha log --oneline main -- README.md` — "`loyiha` papkasida, `main` tarixini, faqat `README.md` ga tegishli commit'larni, qisqa formatda ko'rsat".

Git'ni argumentsiz ishga tushirsangiz, global opsiyalar va eng ko'p ishlatiladigan buyruqlar ro'yxatini ko'rasiz:

```text
$ git
usage: git [-v | --version] [-h | --help] [-C <path>] [-c <name>=<value>]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--no-lazy-fetch]
           [--no-optional-locks] [--no-advice] [--bare] [--git-dir=<path>]
           [--work-tree=<path>] [--namespace=<name>] [--config-env=<name>=<envvar>]
           <command> [<args>]

These are common Git commands used in various situations:

start a working area (see also: git help tutorial)
   clone      Clone a repository into a new directory
   init       Create an empty Git repository or reinitialize an existing one
...
```

Barcha buyruqlar `git help -a` da (bizning 2.56.0 da 190 dan ortiq qator). Ma'lumotnoma ularni ikki darajaga ajratadi: yuqori darajadagi **porcelain** (kundalik ish uchun: `add`, `commit`, `log`...) va past darajadagi **plumbing** (ichki ishlar va skriptlar uchun: `cat-file`, `hash-object`...). Bu farqni [13-bobda](13-plumbing-va-porcelain.md) batafsil ko'ramiz.

### Xato nom va chiqish kodi

Buyruq nomida xato qilsangiz, Git o'xshashini taklif qiladi:

```text
$ git stauts
git: 'stauts' is not a git command. See 'git --help'.

The most similar command is
	status
```

Har dastur tugaganda **chiqish kodi** (*exit code*) qaytaradi: `0` — muvaffaqiyat, boshqa son — xato. Terminalda oxirgi buyruq kodini `echo $?` ko'rsatadi. Skriptlar va CI aynan shu kodga qaraydi:

```text
$ git status
fatal: not a git repository (or any of the parent directories): .git
$ echo $?
128
```

`fatal:` bilan boshlanadigan xatolar odatda `128` kodini beradi. Noma'lum opsiya — `129`:

```text
$ git commit --bilmayman
error: unknown option `bilmayman'
usage: git commit [-a | --interactive | --patch] [-s] [-v] [-u[<mode>]] [--amend]
...
$ echo $?
129
```

### `-h`: tezkor yordam

Har buyruqdan keyin `-h` qisqa foydalanish ko'rsatmasini chiqaradi — repo ichida bo'lishingiz ham shart emas:

```text
$ git commit -h
usage: git commit [-a | --interactive | --patch] [-s] [-v] [-u[<mode>]] [--amend]
                  [--dry-run] [(-c | -C | --squash) <commit> | --fixup [(amend|reword):]<commit>]
                  [-F <file> | -m <msg>] [--reset-author] [--allow-empty]
                  [--allow-empty-message] [--no-verify] [-e] [--author=<author>]
                  [--date=<date>] [--cleanup=<mode>] [--[no-]status]
                  [-i | -o] [--pathspec-from-file=<file> [--pathspec-file-nul]]
                  [(--trailer <token>[(=|:)<value>])...] [-S[<keyid>]]
                  [--] [<pathspec>...]
...
$ echo $?
0
```

Yangi narsa: Git **2.56** dan boshlab ko'p buyruqlar `-h`/`--help` so'ralganda `0` kodi bilan chiqadi (avval `129` qaytarardi) — bu standart Unix odatiga moslashtirish (`RelNotes/2.56.0`). Eski skriptlarda `-h` ning chiqish kodiga tayangan joy bo'lsa, shuni hisobga oling.

`--help-all` — oddiy `-h` da yashirilgan opsiyalarni (plumbing uchun yoki eskirgan) ham ko'rsatadi. To'liq qo'llanma sahifasi — `git help <buyruq>` yoki `git <buyruq> --help` ([3-bob](03-birinchi-sozlash.md)).

## Kod: global opsiyalar `-C` va `-c`

**`-C <yo'l>`** — Git'ni go'yo `<yo'l>` papkasida ishga tushirilgandek bajaradi. `cd` qilmasdan boshqa repo bilan ishlash uchun qulay (bu kitobda ham ko'p ishlatiladi):

```text
$ git -C cli log --oneline
bf92c49 init
$ git -C cli status --short
A  HEAD
 M app.txt
```

Bir nechta `-C` berilsa, har keyingi nisbiy yo'l oldingisiga nisbatan hisoblanadi: `git -C cli -C ichki` — `cli/ichki` papkasida.

**`-c <nom>=<qiymat>`** — **faqat shu bitta buyruq uchun** sozlamani o'rnatadi; sozlama fayllaridagi qiymatdan ustun turadi va hech qayerga yozilmaydi. Masalan, chiqish terminalga bormayotgan bo'lsa ham ranglarni majburan yoqish:

```text
$ git -c color.ui=always status -s | cat -v
^[[32mA^[[m  HEAD
 ^[[31mM^[[m app.txt
```

(`^[[32m` — yashil rangning terminal kodi, `cat -v` uni ko'rinadigan qilib chiqardi.) `git config` va sozlamalar darajalari — [3-bob](03-birinchi-sozlash.md) va [45-bob](45-config-chuqur.md).

### Ustunlik qoidasi: opsiya > muhit o'zgaruvchisi > sozlama

`gitcli` hujjatidagi muhim qoida: bir xatti-harakatni sozlama ham, muhit o'zgaruvchisi ham, buyruq opsiyasi ham boshqarsa, **buyruq opsiyasi g'olib**. Rasmiy misol — commit muallifi nomi:

1. `user.name` sozlamasi — eng past;
2. `GIT_AUTHOR_NAME` muhit o'zgaruvchisi — o'rnatilgan bo'lsa, sozlamadan ustun;
3. `git commit --author=...` opsiyasi — ikkalasidan ham ustun.

Sinov muhitimizda `GIT_AUTHOR_NAME="Ali Valiyev"` muhit o'zgaruvchisi o'rnatilgan. Repo sozlamasiga boshqa nom yozamiz va uchala darajani ko'ramiz:

```text
$ git config user.name "Konfig Nomi"
$ git config user.email konfig@example.com
$ git config user.name
Konfig Nomi

$ echo x > a.txt && git add a.txt
$ git commit -q -m "1"
$ git log -1 --format='%an <%ae>'
Ali Valiyev <ali@example.com>

$ echo y >> a.txt
$ git commit -q -am "2" --author="Vali Aliyev <vali@example.com>"
$ git log -1 --format='%an <%ae> | commit qiluvchi: %cn'
Vali Aliyev <vali@example.com> | commit qiluvchi: Ali Valiyev
```

Sozlamadagi "Konfig Nomi" hech qayerda ishlatilmadi: birinchi commit'da muhit o'zgaruvchisi ustun keldi, ikkinchisida — `--author` opsiyasi. `--author` faqat **muallifni** o'zgartiradi, commit qiluvchi (`%cn`) esa hamon muhitdan olindi. Muallif va commit qiluvchi farqi — [16-bobda](16-commit-obyekti.md); muhit o'zgaruvchilari — [48-bobda](48-muhit-ozgaruvchilari.md).

"Sozlamani o'zgartirdim, lekin ta'sir qilmayapti" deganda birinchi navbatda shu qoidani eslang.

## Kod: opsiyalar qanday yoziladi

Bu qoidalar `gitcli` hujjatidan. Ular `-h` chiqishini va ma'lumotnoma sahifalarini o'qishga yordam beradi.

**Qisqa va uzun shakl.** Ko'p opsiyalarning ikki shakli bor: bitta chiziqcha va bitta harf (`-s`) yoki ikki chiziqcha va so'z (`--short`).

**Qisqa opsiyalarni birlashtirish.** `-s -b` o'rniga `-sb` yozish mumkin (`git rm -rf`, `git clean -fdx` ham shu):

```text
$ git status -sb
## main
A  HEAD
 M app.txt
$ git status -s -b
## main
A  HEAD
 M app.txt
```

Lekin skriptlarda `gitcli` qisqa opsiyalarni **alohida** yozishni tavsiya qiladi (`-a -b`): `-ab` ba'zi buyruqlarda ishlamasligi mumkin.

**`--no-` bilan inkor.** Uzun nomli opsiyalarni oldiga `--no-` qo'shib o'chirish mumkin: `--decorate` / `--no-decorate`, `--color` / `--no-color`, `--track` / `--no-track`. `-h` chiqishidagi `--[no-]short` yozuvi aynan "ikkala shakl ham bor" degani.

```text
$ git log --oneline --decorate
bf92c49 (HEAD -> main) init
$ git log --oneline --no-decorate
bf92c49 init
```

**Uzun opsiyani qisqartirish.** Yangi opsiya tahlilchisini (*parse-options*) ishlatadigan buyruqlar uzun opsiyaning **noyob boshlanishini** qabul qiladi:

```text
$ git status --shor
A  HEAD
 M app.txt
$ git branch --show-cur
main
```

Boshlanish noyob bo'lmasa — xato:

```text
$ git status --s
error: ambiguous option: s (could be --short or --show-stash)
usage: git status [<options>] [--] [<pathspec>...]
...
```

Va hamma buyruq buni qo'llamaydi — masalan `git log` opsiyalarini boshqa mexanizm tahlil qiladi:

```text
$ git log --onel
fatal: unrecognized argument: --onel
```

Eng muhimi: qisqartma bugun noyob bo'lsa ham, keyingi Git versiyasida shu boshlanishli yangi opsiya qo'shilishi mumkin (`gitcli`dagi misol: `--amen` bugun `--amend`, ertaga `--amenity` paydo bo'lsa — noaniq). **Skriptlarda opsiyalarni to'liq yozing.**

**Opsiya qiymati: "yopishgan" va "alohida" shakl.** Majburiy qiymatli opsiya uchun hamma shakl ishlaydi:

```text
git foo --long-opt=Arg
git foo --long-opt Arg
git foo -oArg
git foo -o Arg
```

Lekin qiymati **ixtiyoriy** bo'lgan opsiyalarda faqat yopishgan (`=`) shakl to'g'ri. `-h` da bu `--abbrev[=<n>]` kabi kvadrat qavs bilan ko'rsatiladi:

```text
$ git describe --always --abbrev=10 HEAD
bf92c4960d
$ git describe --always --abbrev 10 HEAD
fatal: Not a valid object name 10
```

Ikkinchi holatda `10` opsiya qiymati emas, alohida argument — "10 nomli commit" deb tushunildi. Shuning uchun `gitcli` skriptlarda har doim yopishgan shaklni (`--opt=Arg`, `-oArg`) tavsiya qiladi. Bitta istisno: qiymat `~/` bilan boshlanadigan yo'l bo'lsa, alohida shakl yaxshiroq (`--file ~/fayl`), chunki ko'p shell'lar `--file=~/fayl` ichidagi `~` ni uy papkasiga almashtirmaydi.

**Avval opsiyalar, keyin argumentlar.** Ba'zi buyruqlar argumentdan keyin kelgan opsiyani ham qabul qiladi, lekin `gitcli` bunga tayanmaslikni so'raydi — kelajakda "avval opsiyalar" qoidasi qat'iy qilinishi mumkin.

## Kod: `--` — revision va yo'lni ajratish

Ko'p buyruqlar ham **revision** (commit, branch, `HEAD`...), ham **yo'l** (fayl, papka) qabul qiladi. Qoida: **avval revision'lar, keyin yo'llar**. Masalan, `git diff v1.0 v2.0 src docs` da `v1.0`, `v2.0` — revision, `src`, `docs` — yo'l.

Muammo: nom ikkalasi ham bo'lishi mumkin. Repo'da ataylab `HEAD` nomli fayl yaratamiz:

```text
$ echo ikki >> app.txt
$ echo "HEAD fayli" > HEAD
$ git add HEAD
$ git diff HEAD
fatal: ambiguous argument 'HEAD': both revision and filename
Use '--' to separate paths from revisions, like this:
'git <command> [<revision>...] -- [<file>...]'
```

Git taxmin qilmaydi — noaniqlik bo'lsa, to'xtaydi va aniqlashtirishni so'raydi. `--` dan **oldingisi** revision, **keyingisi** yo'l:

```text
$ git diff HEAD --
diff --git a/HEAD b/HEAD
new file mode 100644
index 0000000..98458f9
--- /dev/null
+++ b/HEAD
@@ -0,0 +1 @@
+HEAD fayli
diff --git a/app.txt b/app.txt
index 5a59275..5431a42 100644
--- a/app.txt
+++ b/app.txt
@@ -1 +1,2 @@
 bir
+ikki

$ git diff -- HEAD
$
```

- `git diff HEAD --` — "`HEAD` commit'i bilan working tree'ni butunlay solishtir";
- `git diff -- HEAD` — "`HEAD` **nomli faylning** index'dagi va working tree'dagi versiyasini solishtir". Fayl stage qilingan va o'zgarmagan, shuning uchun chiqish bo'sh.

Bir xil so'z — butunlay boshqa ma'no. `diff` ning o'zi [7-bobda](07-diff.md), revision sintaksisi [19-bobda](19-revision-tanlash.md).

`gitcli` tavsiyasi: foydalanuvchi kiritgan ma'lumot bilan ishlaydigan skriptlarda `--` ni har doim aniq qo'ying (`git log -1 HEAD --`, `git diff -- "$fayl"`).

### `--end-of-options`: opsiya "kirib qolishidan" himoya

`--` ba'zi buyruqlarda revision va yo'lni ajratish uchun band, shuning uchun u yerda **opsiyalar** bilan revision'larni ajrata olmaydi. Buning uchun `--end-of-options` bor. Nega kerakligini ko'ramiz — skriptda revision o'zgaruvchidan kelyapti, lekin kimdir unga opsiya yozib qo'ygan:

```text
$ rev="--output=xabar.txt"
$ git log "$rev"
$ ls
HEAD
app.txt
xabar.txt
```

Git `$rev` ni opsiya deb tushundi va natijani `xabar.txt` fayliga yozdi — skript kutmagan fayl paydo bo'ldi. `--end-of-options` bilan:

```text
$ git log --end-of-options "$rev"
fatal: option '--output=xabar.txt' must come before non-option arguments
$ git log --oneline --end-of-options main
bf92c49 init
```

Endi `$rev` faqat argument sifatida qabul qilinadi, oddiy revision esa odatdagidek ishlaydi. Foydalanuvchi ma'lumotini Git'ga uzatuvchi har qanday skript yoki servis uchun bu muhim himoya.

## Kod: qo'shtirnoq va wildcard — shell'mi, Git'mi?

**Wildcard** (`*`, `?`) — "shu shaklga mos keladigan har qanday nom". Muammo shundaki, uni **ikki** dastur tushunadi: shell (terminal) va Git. Shell buyruqni ishga tushirishdan **oldin** `*.c` ni papkadagi mos fayllar ro'yxatiga almashtiradi. Qo'shtirnoqqa olingan yoki `\` bilan himoyalangan `*.c` esa Git'ga o'zgarmasdan yetib boradi va Git uni **o'zining** index'idagi yo'llarga moslaydi.

`gitcli` misolini haqiqiy repo'da takrorlaymiz. Uchta `.c` fayl commit qilingan; ikkitasini o'chiramiz, uchinchisini tahrirlaymiz:

```text
$ git status -s
 D a.c
 M main.c
 D src/b.c
```

Qo'shtirnoqsiz:

```text
$ echo git restore *.c
git restore main.c
$ git restore *.c
$ git status -s
 D a.c
 D src/b.c
```

Shell `*.c` ni papkada **mavjud** fayllarga almashtirdi — faqat `main.c`. Natija: o'chirilgan fayllar tiklanmadi, `main.c` dagi tahrir esa **yo'qoldi** (index'dagi versiya bilan ustidan yozildi). Himoyalangan shakl:

```text
$ git restore \*.c
$ git status -s
$ ls
a.c
main.c
src
```

Git `*.c` ni o'zi index bo'yicha moslab, `a.c` va hatto `src/b.c` ni ham tikladi (Git pattern'ida `*` papka chegarasidan ham o'tadi).

Shell'lar orasida ham farq bor: **bash** mos fayl topmasa, `*.c` ni o'zgarishsiz uzatadi (tasodifan "to'g'ri" ishlaydi), **zsh** (macOS'ning standart shell'i) esa buyruqni umuman ishga tushirmaydi (bu yerda mos fayl qolmagan papkada):

```text
$ zsh -c 'git restore *.c'
zsh:1: no matches found: *.c
```

Xulosa: Git'ga pattern bermoqchi bo'lsangiz, uni **har doim** qo'shtirnoqqa oling — `git restore '*.c'`, `git ls-files '*.c'`. Probel yoki maxsus belgili fayl nomlari va commit xabarlari uchun ham qo'shtirnoq kerak: `git commit -m "Ikki so'zli xabar"`. (Ichida `'` bo'lgan o'zbekcha matnni `"..."` ichida yozing.)

## Kod: Git'ga o'z buyrug'ingizni qo'shish

Ma'lumotnomadagi `PATH` bo'limi: `git <buyruq>` deb yozganingizda, agar `<buyruq>` Git'ning ichki dasturlari orasida (`--exec-path`) bo'lmasa, Git `PATH` dan **`git-<buyruq>`** nomli bajariladigan faylni qidiradi va qolgan argumentlarni unga o'zgarishsiz uzatadi. Shundan keyingina alias'lar ([12-bob](12-teglar-va-aliaslar.md)) tekshiriladi.

```bash
$ mkdir -p bin
$ cat > bin/git-salom <<'EOF'
#!/bin/sh
echo "Salom, $(git config user.name)! Argumentlar: $*"
EOF
$ chmod +x bin/git-salom
$ export PATH="$PWD/bin:$PATH"
```

```text
$ git salom bir ikki
Salom, Ali Valiyev! Argumentlar: bir ikki
$ git -c user.name="Vali Aliyev" salom
Salom, Vali Aliyev! Argumentlar:
$ git --list-cmds=others
salom
```

Global `-c` ham tashqi buyruqqa yetib bordi: Git uni muhit orqali uzatadi, skript ichidagi `git config` esa uni o'qiydi. Ko'p tashqi vositalar (masalan, `git lfs`) aynan shu mexanizm bilan "Git buyrug'i" bo'lib ko'rinadi.

## Muhandislik nuqtai nazari: versiya tanlash va yangilash

- **Eng kamida qaysi versiya?** Bu kitob 2.56.0 da sinalgan. `switch`/`restore` uchun kamida 2.23 kerak; kitob davomida yangi versiyada qo'shilgan narsalar alohida eslatiladi. Juda eski Git (masalan, eski server tarqatmalarida) bilan ishlasangiz, `-h` bilan opsiya borligini tekshiring.
- **Jamoada bir xil versiya shartmi?** Shart emas — Git repo formati va tarmoq protokoli versiyalar orasida mos. Lekin CI, hook'lar ([47-bob](47-hooklar.md)) va skriptlar ma'lum opsiyaga tayansa, eng eski ishlatiladigan versiyani bilish kerak.
- **Xavfsizlik yangilanishlari.** Git vaqti-vaqti bilan xavfsizlik tuzatishlarini chiqaradi (ko'pincha `clone` paytida begona repo bilan bog'liq). Tarqatma yoki o'rnatuvchi orqali Git'ni yangilab turish — oddiy, lekin muhim odat.
- **Git 3.0.** `BreakingChanges` ga ko'ra Git 3.0 dan oldingi oxirgi versiya uzoq muddat qo'llab-quvvatlanadigan (LTS) reliz deb e'lon qilinadi. Git 3.0 dagi standart o'zgarishlar (`sha256`, `reftable`, `main`, majburiy Rust) mavjud repo'larni buzmaydi — ular asosan **yangi** repo'lar va yig'ish jarayoniga tegishli.

## Muhandislik nuqtai nazari: skriptda Git'dan foydalanish

Bobdagi `gitcli` qoidalari bitta ro'yxatda — bular kelgusidagi skript, CI va hook'lar uchun asos:

| Qoida | Nega |
| --- | --- |
| Opsiyalarni to'liq yozing (`--oneline`, `--onel` emas) | Keyingi versiyada qisqartma noaniq bo'lib qolishi mumkin |
| Qisqa opsiyalarni alohida yozing (`-a -b`) | `-ab` hamma buyruqda ishlamaydi |
| Qiymatni yopishtiring (`--abbrev=10`) | Ixtiyoriy qiymatli opsiyalarda alohida shakl boshqa ma'no beradi |
| Revision va yo'lni `--` bilan ajrating | Fayl nomi revision bilan to'qnashsa, xato yoki noto'g'ri natija |
| Foydalanuvchi ma'lumotidan oldin `--end-of-options` | Opsiya "kirib qolishi" (injection) oldini oladi |
| Pattern'larni qo'shtirnoqqa oling | Shell va Git turlicha kengaytiradi |
| Chiqish kodini tekshiring (`$?`) | `0` dan boshqasi — xato; `fatal` odatda `128` |
| Mashina o'qiydigan chiqish uchun plumbing yoki `--porcelain` | Porcelain chiqishi tarjima va versiya bilan o'zgarishi mumkin ([13-bob](13-plumbing-va-porcelain.md)) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Yangi Git o'rnatib, versiya o'zgarmaganiga hayron bo'lish | `PATH` da eski Git oldinda turibdi | `type -a git` (Windows: `where git`), `PATH` tartibini tuzating, terminalni qayta oching |
| Homebrew/paket o'rnatildi deb ishonish, lekin buyruq eski | Paket o'rnatilgan, lekin `PATH` ga bog'lanmagan bo'lishi mumkin | `type -a git` va `git --version` bilan aniq tekshiring |
| Faqat GUI orqali ishlash | Ko'p buyruqlar GUI'da yo'q; muammo bo'lsa sabab tushunarsiz | Buyruq qatorini asos qiling, GUI'ni yordamchi sifatida ishlating |
| Kitobdagi `$` belgisini ham yozish | `$: command not found` | `$` — prompt, uni yozmang |
| `git restore *.c` (qo'shtirnoqsiz) | Shell mavjud fayllar bilan almashtiradi: tahrir yo'qoladi, o'chirilganlar tiklanmaydi | `git restore '*.c'` |
| Skriptda `--onel`, `--abbrev 10` | Noaniq yoki boshqa ma'no; keyingi versiyada buzilishi mumkin | To'liq nom, yopishgan qiymat: `--oneline`, `--abbrev=10` |
| `HEAD` yoki branch nomi bilan bir xil fayl bo'lganda `--` siz buyruq | `ambiguous argument` yoki kutilmagan natija | `git diff HEAD --` / `git diff -- HEAD` |
| Foydalanuvchi kiritgan qiymatni to'g'ridan-to'g'ri `git log "$x"` ga berish | `--output=...` kabi opsiya "kirib qoladi" | `git log --end-of-options "$x"` |
| `git config` bilan nom o'zgartirib, commit'da eski nom chiqishi | Muhit o'zgaruvchisi (`GIT_AUTHOR_NAME`) sozlamadan ustun | `env | grep GIT_` bilan tekshiring; ustunlik: opsiya > muhit > sozlama |
| Manbadan `make all` keyin `make prefix=/usr install` | Yo'llar yig'ishda yozilgan, o'rnatish noto'g'ri ishlaydi | `prefix` ni ikkala bosqichda bir xil bering |

## Amaliyot

1. Terminalni oching va `git --version`, `git -v`, `git version` ni ishga tushiring. Uchalasi bir xil natija berdimi? Versiyangiz 2.23 dan yangimi?
2. `type -a git` (Windows'da `where git`) bilan kompyuteringizda nechta Git borligini toping. Har birining `--version` ini alohida to'liq yo'l bilan chaqiring.
3. `git version --build-options` chiqishini o'qing: SHA-1 qaysi kutubxona bilan hisoblanadi, u to'qnashuvni aniqlaydimi? `default-hash` nima?
4. Repo bo'lmagan papkada `git status` ni ishga tushirib, `echo $?` bilan chiqish kodini ko'ring. Keyin `git status -h` va noto'g'ri opsiya (`git status --yoq`) uchun ham kodlarni solishtiring.
5. Sinov repo'sida `HEAD` nomli fayl yarating va `git diff HEAD`, `git diff HEAD --`, `git diff -- HEAD` natijalarini solishtiring. Har biri nimani solishtirganini o'z so'zlaringiz bilan yozing.
6. Uchta `.c` faylli repo'da bittasini o'chirib, bittasini tahrirlang. Avval `echo git restore *.c` bilan shell nima uzatishini ko'ring, keyin `git restore '*.c'` ni ishlating.
7. `git-salom` kabi o'z buyrug'ingizni yarating: u joriy branch nomini (`git branch --show-current`) va oxirgi commit xabarini chiqarsin. `git salom` bilan ishlashini tekshiring.
8. (Qiyinroq) `rev` o'zgaruvchisini qabul qilib `git log --oneline` chiqaradigan kichik skript yozing. Uni `rev="--output=x.txt"` bilan sinang, muammoni ko'rsating, keyin `--end-of-options` va chiqish kodini tekshirish bilan xavfsiz qiling.

## Rasmiy hujjat

- Pro Git — The Command Line: <https://git-scm.com/book/en/v2/Getting-Started-The-Command-Line>
- Pro Git — Installing Git: <https://git-scm.com/book/en/v2/Getting-Started-Installing-Git>
- `git` (global opsiyalar, `PATH`): <https://git-scm.com/docs/git>
- `gitcli` (buyruq qatori qoidalari): <https://git-scm.com/docs/gitcli>
- `git version`: <https://git-scm.com/docs/git-version>
- Git yuklab olish sahifasi: <https://git-scm.com/downloads>
- Git 3.0 o'zgarishlari (`BreakingChanges`): <https://git-scm.com/docs/BreakingChanges>
