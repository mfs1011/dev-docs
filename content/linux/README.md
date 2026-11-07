# Linux — dasturchi uchun server asoslari

Bu qo'llanma dasturchiga serverda kerak bo'ladigan Linux'ni o'rgatadi. Bular: fayl tizimi va ruxsatlar, qobiq (shell) va matn bilan ishlash, paketlar, jarayonlar, systemd servislari va loglar, tarmoq, SSH, Bash skriptlar va "server ishlamayapti" holatini tekshirish.

Asos — **Debian va Ubuntu**. Arzon VPS'larning aksariyatida shu ikkisidan biri turadi. Init tizimi — **systemd**.

Qo'llanma ikki muhitda sinaladi:

- **Trenajor** (brauzerda) — Debian 12 + systemd 252, hech narsa o'rnatish shart emas. Tarmog'i yo'q.
- **VPS** — haqiqiy Ubuntu 26.04 LTS server. Tarmoq, SSH, `apt install` va boshqa internet kerak bo'lgan mavzular shu yerda sinaladi.

Mundarija rasmiy hujjatlar tuzilmasiga solishtirib tuzilgan. Har bob yonida u tayanadigan rasmiy sahifalar ko'rsatilgan. Har bobni yozishdan oldin shu sahifalar qayta o'qiladi. Buyruqlar real muhitda ishga tushirilib tekshiriladi, chiqishlar haqiqiy.

Manbalar va versiyalar (2026-11-05 da tekshirilgan):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Debian | 13 "trixie" (13.7, 2026-09-12) — joriy barqaror; 12 "bookworm" — oldstable, LTS 2028-06-30 gacha | <https://www.debian.org/releases/> |
| Ubuntu | 26.04 LTS (2026-yil aprel, standart xavfsizlik yangilanishlari 2031-yil maygacha) | <https://ubuntu.com/about/release-cycle> |
| Debian Reference | 2.152 (2026-10-10) | <https://www.debian.org/doc/manuals/debian-reference/> |
| Ubuntu Server hujjati | Ubuntu 26.04 LTS uchun | <https://ubuntu.com/server/docs/> |
| systemd hujjati | 262 (man sahifalarida har imkoniyat qaysi versiyada qo'shilgani yozilgan) | <https://www.freedesktop.org/software/systemd/man/latest/> |
| Trenajor | Debian 12, Linux 6.1 (i386), systemd 252, bash 5.2.15, GNU coreutils 9.1, apt 2.6.1, sudo 1.9.13 | Debian'ning rasmiy paketlaridan yig'ilgan (`linux-trenajor/`) |
| Sinov VPS | Ubuntu 26.04.1 LTS, systemd 259, bash 5.3.9, uutils coreutils 0.10.0, apt 3.2.0, sudo-rs 0.2.13, OpenSSH 10.2p1 | `--version` chiqishlari, 2026-11-05 |

Muhit tanlovi haqida:

- **Trenajor nega Debian 12.** Brauzerdagi emulyator (v86) 32-bitli protsessorni emulyatsiya qiladi. Debian 13 da i386 uchun yadro (kernel) yo'q, Debian 12 da bor. Debian 12 ning oddiy qo'llab-quvvatlashi 2026-07-11 da tugagan, LTS 2028-06-30 gacha davom etadi. Qo'llanmadagi asosiy mavzular (fayllar, ruxsatlar, qobiq (shell), jarayonlar, systemd) 12 va 13 da bir xil. Farq chiqqan joyda bobda alohida aytiladi.
- **Ubuntu 26.04 dagi yangi vositalar.** Rasmiy reliz izohlariga ko'ra:
  - Asosiy utilitalar (`ls`, `cat`, `sort` va boshqalar) endi Rust'da qayta yozilgan **uutils** (rust-coreutils) dan keladi. "Hal qilinmagan xatolar sababli" `cp`, `mv` va `rm` hali GNU'niki. VPS'da `df` ham GNU'niki (`readlink -f $(command -v df)` → `/usr/bin/gnudf`). GNU versiyasini `gnu` prefiksi bilan chaqirish mumkin (`gnuls`).
  - `sudo` o'rnida **sudo-rs** turadi, asl sudo esa `sudo.ws` deb qayta nomlangan.
  - Vaqt sinxronizatsiyasini endi `systemd-timesyncd` emas, **chrony** qiladi.

  Debian'da bularning hammasi klassik GNU vositalari. Buyruq ikkala tizimda farqli ishlasa, bobda ikkala chiqish ham ko'rsatiladi.
- **VPS provayder shabloni.** Sinov VPS'i hosting provayderining tayyor shabloni (image) dan o'rnatilgan va Ubuntu'ning standart o'rnatishidan farq qiladi:
  - Tarmoqni Netplan emas, `ifupdown` (`/etc/network/interfaces`) boshqaradi.
  - `cron` o'rnatilmagan. Tizimdagi hamma rejali ishlar systemd timer'larida.
  - `vim`, `tmux`, `rsync` yo'q.

  Haqiqiy serverlarda bunday farq ko'p uchraydi. Shuning uchun qo'llanma "bu serverda nima ishlatilganini qanday aniqlash"ni ham o'rgatadi.

Qisqartmalar:

- **DR** — Debian Reference.
- **UB** — Ubuntu Server hujjati.
- **SD** — systemd man sahifalari (freedesktop.org).
- **MAN** — Linux man-pages (man7.org).
- **GNU** — GNU qo'llanmalari (Bash, Coreutils, grep, sed, gawk, findutils).
- **SSH** — OpenSSH qo'llanmalari (man.openbsd.org).
- **DM** — Debian man sahifalari (manpages.debian.org, bookworm).
- **FHS** — Filesystem Hierarchy Standard 3.0.

"Muhit" ustunida:

- **T** — trenajorda sinaladi.
- **V** — VPS'da sinaladi.
- **T+V** — ikkalasida.

Bu qo'llanmaga kirmaydigan mavzular:

- Serverni himoyalash (sshd sozlamalari, firewall, fail2ban) — **"Server xavfsizligi"** kitobida.
- Veb-server va HTTPS — **"Nginx"** kitobida.
- Konteynerlar, namespace va cgroup — **"Docker"** kitobida.

> **Holat.** Qo'llanma yozilmoqda: 47/54 bob tayyor. Havolasi borlari — tayyor boblar. Har bobning "Amaliyot" bo'limida trenajordagi mashqqa havola bor.

---

## Har bobning skeleti

- **Tushuncha** — mavzu nima, oddiy so'zlar bilan. Qiyin joy animatsiya bilan.
- **Buyruqlar** — trenajor yoki VPS'da ishga tushirilgan buyruqlar va ularning **haqiqiy** chiqishi.
- **Debian va Ubuntu** — farq bo'lsa (uutils, sudo-rs, chrony, Netplan va boshqalar).
- **Variantlar** — bir ishning bir necha yo'li bo'lsa, jadvalda: qachon qaysi biri, yutug'i va kamchiligi.
- **Tipik xatolar** — xato → nega yomon → to'g'ri yo'l.
- **Amaliyot** — trenajordagi mashqlar.
- **Rasmiy hujjat** — bob tayangan sahifalar.

---

## I qism — Kirish (1–3)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 01 | [Linux, Debian va Ubuntu](01-linux-debian-ubuntu.md) | Yadro va distributiv; Debian relizlari (stable, oldstable, LTS); Ubuntu LTS sikli; Ubuntu Debian'dan nimasi bilan farq qiladi; serverda qaysi versiya ekanini aniqlash (`/etc/os-release`, `uname -r`) | T+V | [DR "What is Debian"](https://www.debian.org/doc/manuals/debian-reference/pr01.en.html) · [Debian releases](https://www.debian.org/releases/) · [Ubuntu release cycle](https://ubuntu.com/about/release-cycle) · [Ubuntu 26.04 summary](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/) |
| 02 | [Terminal va qobiq (shell)](02-terminal-va-qobiq.md) | Terminal, qobiq (shell), prompt; buyruq, parametr va argument; oddiy foydalanuvchi va root; `exit`, sessiyadan chiqish; buzilgan konsolni tiklash (`reset`) | T | [DR 1.1](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_console_basics) · [UB Welcome to the terminal](https://ubuntu.com/server/docs/tutorial/welcome-to-the-terminal/) · [GNU Bash: Introduction](https://www.gnu.org/software/bash/manual/bash.html#Introduction) |
| 03 | [Yordamni topish](03-yordam.md) | `man` (bo'limlar 1/5/8), `--help`, `whatis`, `apropos`, `type`, `help` (bash ichki buyruqlari); man sahifasini o'qish tartibi | T | [DR 1.4.10](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_basic_unix_commands) · [UB Getting help](https://ubuntu.com/server/docs/tutorial/welcome-to-the-terminal/) · [DM man(1)](https://manpages.debian.org/bookworm/man-db/man.1.en.html) |

## II qism — Fayl tizimi (4–10)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 04 | [Katalog daraxti](04-katalog-daraxti.md) | Bitta ildiz `/`; `/etc`, `/var`, `/usr`, `/home`, `/tmp`, `/opt`, `/srv`; merged-/usr (`/bin → usr/bin`); ilovaning konfiguratsiyasi, logi va ma'lumoti qayerga qo'yiladi | T | [FHS 3.0](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html) · [MAN hier(7)](https://man7.org/linux/man-pages/man7/hier.7.html) · [SD file-hierarchy(7)](https://www.freedesktop.org/software/systemd/man/latest/file-hierarchy.html) · [UB FHS](https://ubuntu.com/server/docs/tutorial/welcome-to-the-terminal/) |
| 05 | [Fayllar bilan ishlash](05-fayllar.md) | `pwd`, `cd`, `ls`, `mkdir`, `touch`, `cp`, `mv`, `rm`; nisbiy va mutlaq yo'l; yashirin fayllar; `rm -r` xavfi; uutils va GNU farqi | T+V | [UB Navigating, Working with files](https://ubuntu.com/server/docs/tutorial/welcome-to-the-terminal/) · [GNU Coreutils](https://www.gnu.org/software/coreutils/manual/coreutils.html) · [DR 1.4.10](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_basic_unix_commands) |
| 06 | [Inode va havolalar](06-inode-va-havolalar.md) | Fayl nomi va fayl mazmuni alohida (inode); hard link va symlink; `ln`, `ls -li`, `stat`; vaqt belgilari (mtime, ctime, atime) | T | [DR 1.2.2](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_filesystem_internals) · [DR 1.2.6–1.2.7](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_links) · [MAN inode(7)](https://man7.org/linux/man-pages/man7/inode.7.html) · [MAN symlink(7)](https://man7.org/linux/man-pages/man7/symlink.7.html) |
| 07 | [Ruxsatlar](07-ruxsatlar.md) | Egasi, guruh, boshqalar; `rwx` fayl va katalogda nimani anglatadi; `chmod` (belgili va sonli yozuv), `chown`, `chgrp`; `umask` | T | [DR 1.2.3–1.2.5](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_filesystem_permissions) · [UB Users, groups, and permissions](https://ubuntu.com/server/docs/tutorial/welcome-to-the-terminal/) · [MAN credentials(7)](https://man7.org/linux/man-pages/man7/credentials.7.html) |
| 08 | [Maxsus bitlar va ACL](08-maxsus-bitlar-va-acl.md) | setuid, setgid (umumiy katalog), sticky bit (`/tmp`); ACL: `setfacl`, `getfacl`; ACL va guruh — qachon qaysi biri | T | [DR 1.2.3](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_filesystem_permissions) · [DR 4.7.1](https://www.debian.org/doc/manuals/debian-reference/ch04.en.html#_access_control_lists) · [DM setfacl(1)](https://manpages.debian.org/bookworm/acl/setfacl.1.en.html) |
| 09 | [Hamma narsa — fayl](09-hamma-narsa-fayl.md) | Qurilma fayllari (`/dev/null`, `/dev/zero`, `/dev/urandom`); socket va nomli pipe; `/proc` va `/sys`; tmpfs | T | [DR 1.2.8–1.2.13](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_device_files) · [MAN proc(5)](https://man7.org/linux/man-pages/man5/proc.5.html) |
| 10 | [Disk va mount](10-disk-va-mount.md) | `df`, `du`, `lsblk`, `findmnt`, `mount`; `/etc/fstab` va UUID; "disk to'la, lekin fayl topilmaydi" — o'chirilgan, lekin ochiq fayl | T+V | [DR 9.6.1](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_disk_space_usage) · [DR 9.6.3](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_accessing_partition_using_uuid) · [DR 9.8.12](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_invisible_disk_space_consumption) · [DM lsblk(8)](https://manpages.debian.org/bookworm/util-linux/lsblk.8.en.html) |

## III qism — Qobiq (shell) (11–16)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 11 | [Standart oqimlar](11-standart-oqimlar.md) | stdin, stdout, stderr; `>`, `>>`, `2>`, `2>&1`, `<`; here-document; `/dev/null` ga yo'naltirish; yo'naltirish tartibi nega muhim | T | [UB Standard streams](https://ubuntu.com/server/docs/tutorial/cli-in-depth/) · [GNU Bash: Redirections](https://www.gnu.org/software/bash/manual/bash.html#Redirections) · [DR 1.5.8](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_typical_command_sequences_and_shell_redirection) |
| 12 | [Pipe va buyruqlar zanjiri](12-pipe.md) | `\|`, `;`, `&&`, `\|\|`; chiqish kodi (`$?`); `pipefail`; `tee` | T | [UB Pipes, Chaining commands](https://ubuntu.com/server/docs/tutorial/cli-in-depth/) · [GNU Bash: Pipelines, Lists](https://www.gnu.org/software/bash/manual/bash.html#Pipelines) · [DR 1.5.7](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_return_value_of_the_command) |
| 13 | [O'zgaruvchilar va muhit](13-ozgaruvchilar.md) | Qobiq (shell) o'zgaruvchisi va muhit o'zgaruvchisi; `export`, `env`, `unset`; `PATH`, `HOME`, `LANG`; buyruq qayerdan topiladi (`command -v`, `type`) | T | [UB Shell environment variables](https://ubuntu.com/server/docs/tutorial/cli-in-depth/) · [DR 1.5.1–1.5.4](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_command_execution_and_environment_variable) · [MAN environ(7)](https://man7.org/linux/man-pages/man7/environ.7.html) |
| 14 | [Kengaytmalar va qo'shtirnoq](14-kengaytmalar.md) | Qobiq (shell) buyruqni qanday o'qiydi (bosqichma-bosqich); tilde, `$var`, `$(...)`, `$((...))`, `{a,b}`, glob (`*`, `?`, `[...]`); bitta va qo'sh qo'shtirnoq; probelli fayl nomlari | T | [UB Shell expansion](https://ubuntu.com/server/docs/tutorial/cli-in-depth/) · [GNU Bash: Shell Expansions, Quoting](https://www.gnu.org/software/bash/manual/bash.html#Shell-Expansions) · [DR 12.1.6](https://www.debian.org/doc/manuals/debian-reference/ch12.en.html#_the_shell_command_line_processing_sequence) · [MAN glob(7)](https://man7.org/linux/man-pages/man7/glob.7.html) |
| 15 | [Bash'ni sozlash](15-bash-sozlash.md) | Login va interaktiv qobiq (shell); `.profile`, `.bashrc` qachon o'qiladi; `alias`; tarix (`history`, Ctrl+R); foydali tugmalar | T | [DR 1.4.1–1.4.3](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_the_login_shell) · [DR 1.5.9](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_command_alias) · [GNU Bash: Bash Startup Files](https://www.gnu.org/software/bash/manual/bash.html#Bash-Startup-Files) |
| 16 | [Matn muharriri](16-matn-muharriri.md) | Serverda faylni tahrirlash: `nano` va `vim` asoslari; `EDITOR`/`VISUAL`; `update-alternatives` bilan standart muharrirni tanlash; nano va vim qiyosi | T | [DR 1.4.6–1.4.7](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_the_text_editor) · [DM nano(1)](https://manpages.debian.org/bookworm/nano/nano.1.en.html) |

## IV qism — Matn va loglar bilan ishlash (17–21)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 17 | [Faylni ko'rish](17-faylni-korish.md) | `cat`, `less`, `head`, `tail -f`, `wc`; katta logni ochish; `less` ichida qidirish | T | [DR 1.4.5](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_the_pager) · [GNU Coreutils](https://www.gnu.org/software/coreutils/manual/coreutils.html) |
| 18 | [grep va regex](18-grep-va-regex.md) | `grep` (`-i`, `-r`, `-n`, `-v`, `-E`, `-o`); oddiy va kengaytirilgan regex (BRE va ERE) | T | [GNU grep](https://www.gnu.org/software/grep/manual/grep.html) · [DR 1.6.2](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_regular_expressions) · [MAN regex(7)](https://man7.org/linux/man-pages/man7/regex.7.html) |
| 19 | [find va xargs](19-find-va-xargs.md) | Nomi, turi, hajmi, vaqti bo'yicha qidirish; `-exec` va `xargs`; probelli nomlar (`-print0`, `-0`) | T | [GNU findutils](https://www.gnu.org/software/findutils/manual/find.html) · [DR 9.4.9](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_repeating_a_command_looping_over_files) |
| 20 | [Matnni o'zgartirish](20-matnni-ozgartirish.md) | `sed` (almashtirish, `-i`); `cut`, `sort`, `uniq -c`, `tr`; `awk` bilan ustunlarni olish | T | [GNU sed](https://www.gnu.org/software/sed/manual/sed.html) · [GNU gawk](https://www.gnu.org/software/gawk/manual/gawk.html) · [DR 1.6.3–1.6.6](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_replacement_expressions) |
| 21 | [Amaliy: log tahlili](21-log-tahlili.md) | Kirish logidan eng ko'p so'rov yuborgan IP, xato kodlari soni, vaqt oralig'ini kesib olish — 17–20-boblarni birlashtirish | T | [DR 1.6.5–1.6.6](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_extracting_data_from_text_file_table) |

## V qism — Foydalanuvchilar (22–23)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 22 | [Foydalanuvchi va guruh](22-foydalanuvchi-va-guruh.md) | `/etc/passwd`, `/etc/group`, `/etc/shadow`; `adduser`, `usermod -aG`, `deluser`; tizim (servis) foydalanuvchisi; `id`, `groups`; guruh o'zgarishi qachon kuchga kiradi | T+V | [DR 4.1–4.2](https://www.debian.org/doc/manuals/debian-reference/ch04.en.html#_normal_unix_authentication) · [UB User management](https://ubuntu.com/server/docs/how-to/security/user-management/) · [DM adduser(8)](https://manpages.debian.org/bookworm/adduser/adduser.8.en.html) |
| 23 | [sudo](23-sudo.md) | `sudo` va `su` farqi; `sudoers`, `visudo`, `/etc/sudoers.d/`; `sudo -i`, `sudo -u`; sudo-rs (Ubuntu 26.04) va sudo farqi | T+V | [DR 1.1.12](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_sudo_configuration) · [DR 4.7.2](https://www.debian.org/doc/manuals/debian-reference/ch04.en.html#_sudo) · [UB sudo-rs](https://ubuntu.com/server/docs/reference/other-tools/sudo-rs/) · [DM sudoers(5)](https://manpages.debian.org/bookworm/sudo/sudoers.5.en.html) |

## VI qism — Paketlar (24–27)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 24 | [apt](24-apt.md) | `apt update`, `upgrade`, `full-upgrade`, `install`, `remove`, `purge`, `autoremove`, `search`, `show`; bog'liqliklar | V | [UB Managing your software](https://ubuntu.com/server/docs/tutorial/managing-software/) · [DR 2.2](https://www.debian.org/doc/manuals/debian-reference/ch02.en.html) · [DM apt(8)](https://manpages.debian.org/bookworm/apt/apt.8.en.html) |
| 25 | [Paket ichida nima bor](25-paket-ichida.md) | `dpkg -l`, `-L`, `-S`; conffile va yangilanishda konfiguratsiya fayli nima bo'ladi; `apt-mark hold`; repozitoriy, seriya, pocket, komponent | T+V | [UB Managing your software](https://ubuntu.com/server/docs/tutorial/managing-software/) · [UB Changing package files](https://ubuntu.com/server/docs/explanation/software/changing-package-files/) · [DR 2.5](https://www.debian.org/doc/manuals/debian-reference/ch02.en.html) · [DM dpkg(1)](https://manpages.debian.org/bookworm/dpkg/dpkg.1.en.html) |
| 26 | [Tashqi repozitoriy](26-tashqi-repozitoriy.md) | Distributiv paketi, tashqi repozitoriy (masalan, Node.js yoki PostgreSQL rasmiy repo'si) va snap — qachon qaysi biri; `.sources` (deb822) fayli; `signed-by` kaliti | V | [UB Third party repository usage](https://ubuntu.com/server/docs/explanation/software/third-party-repository-usage/) · [DM sources.list(5)](https://manpages.debian.org/bookworm/apt/sources.list.5.en.html) |
| 27 | [Avtomatik yangilanishlar](27-avtomatik-yangilanish.md) | `unattended-upgrades`; Ubuntu'ning bosqichma-bosqich yangilanishi (phased updates); yangilanishdan keyin qayta ishga tushirish kerakmi | V | [UB Automatic updates](https://ubuntu.com/server/docs/how-to/software/automatic-updates/) · [UB About apt upgrade and phased updates](https://ubuntu.com/server/docs/explanation/software/about-apt-upgrade-and-phased-updates/) |

## VII qism — Jarayonlar (28–32)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 28 | [Jarayon nima](28-jarayon.md) | Dastur va jarayon; PID va PPID; jarayon daraxti (`ps`, `pstree`); jarayon qanday tug'iladi (fork va exec); `/proc/<pid>` | T | [DR 9.4.3](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_the_ps_command) · [MAN ps(1)](https://man7.org/linux/man-pages/man1/ps.1.html) · [MAN proc(5)](https://man7.org/linux/man-pages/man5/proc.5.html) · [MAN credentials(7)](https://man7.org/linux/man-pages/man7/credentials.7.html) |
| 29 | [Signallar](29-signallar.md) | `kill`, `pkill`; SIGTERM, SIGKILL, SIGHUP, SIGINT (Ctrl+C); ilova to'xtatilganda ishini tugatib chiqishi (graceful shutdown) | T | [MAN signal(7)](https://man7.org/linux/man-pages/man7/signal.7.html) · [DR 9.4.12](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_killing_a_process) · [GNU Bash: Signals](https://www.gnu.org/software/bash/manual/bash.html#Signals) |
| 30 | [Fon rejimi](30-fon-rejimi.md) | `&`, `jobs`, `fg`, `bg`, Ctrl+Z; SSH uzilganda jarayon nima bo'ladi; `nohup`, `tmux`, systemd servisi — qiyos | T+V | [GNU Bash: Job Control](https://www.gnu.org/software/bash/manual/bash.html#Job-Control) · [UB Terminal multiplexers](https://ubuntu.com/server/docs/reference/other-tools/terminal-multiplexers/) · [DR 9.1.2](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_the_screen_program) |
| 31 | [Resurslar](31-resurslar.md) | `top`, `free`, `uptime` va yuklama (load average); `nice`; xotira tugaganda (OOM) nima bo'ladi | T+V | [DR 9.4.2, 9.4.4](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_the_top_command) · [DR 9.5.9](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_memory_usage) · [MAN free(1)](https://man7.org/linux/man-pages/man1/free.1.html) · [MAN proc(5)](https://man7.org/linux/man-pages/man5/proc.5.html) |
| 32 | [Ochiq fayllar va portlar](32-ochiq-fayllar-va-portlar.md) | `lsof`, `fuser`; qaysi jarayon qaysi portni tinglayapti (`ss -tlnp`); "port band" xatosi | T+V | [DR 9.4.5, 9.4.7](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_listing_files_opened_by_a_process) · [MAN ss(8)](https://man7.org/linux/man-pages/man8/ss.8.html) · [DM lsof(8)](https://manpages.debian.org/bookworm/lsof/lsof.8.en.html) |

## VIII qism — systemd (33–39)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 33 | [Server qanday yonadi](33-server-qanday-yonadi.md) | UEFI → boot loader → yadro va initramfs → systemd; unit nima, unit turlari (service, socket, timer, target, mount) | T | [DR 3.1](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_an_overview_of_the_boot_strap_process) · [DR 3.3](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_systemd) · [SD systemd.unit(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html) |
| 34 | [systemctl](34-systemctl.md) | `status`, `start`, `stop`, `restart`, `reload`, `enable`, `disable`, `--now`, `is-active`, `list-units --failed`; `enable` va `start` farqi | T+V | [SD systemctl(1)](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html) · [DR 3.6](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_system_management_operations) |
| 35 | [O'z servisingiz](35-oz-servisingiz.md) | Ilovani (Node.js yoki Python) `.service` qilish: `ExecStart`, `User`, `WorkingDirectory`, `Environment`/`EnvironmentFile`, `Restart=on-failure`; servis turlari (`simple`, `exec`, `notify`) | T+V | [SD systemd.service(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html) · [SD systemd.exec(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html) |
| 36 | [Unit'ni o'zgartirish](36-unitni-ozgartirish.md) | Paket bergan unit'ni tahrirlamaslik; `systemctl edit` va drop-in (`.d/override.conf`); `daemon-reload`; `systemctl cat` | T+V | [SD systemd.unit(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html) · [DR 3.8.5](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_customization_example_to_tweak_sshd_service) |
| 37 | [Loglar: journalctl](37-journalctl.md) | `journalctl -u`, `-f`, `-b`, `--since`, `-p`; logni saqlash (persistent) va hajm cheklovi; `/var/log` dagi matnli loglar va logrotate | T+V | [SD journalctl(1)](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html) · [SD journald.conf(5)](https://www.freedesktop.org/software/systemd/man/latest/journald.conf.html) · [DR 3.4–3.5](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_the_kernel_message) |
| 38 | [Rejali ishlar](38-rejali-ishlar.md) | systemd timer (`OnCalendar`, `Persistent`) va cron — qiyos; `systemctl list-timers`; vaqt ifodalari (`systemd-analyze calendar`); Ubuntu 26.04 VPS'da cron yo'qligi | T+V | [SD systemd.timer(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html) · [SD systemd.time(7)](https://www.freedesktop.org/software/systemd/man/latest/systemd.time.html) · [DR 9.4.13–9.4.14](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_scheduling_tasks_regularly) · [DM crontab(5)](https://manpages.debian.org/bookworm/cron/crontab.5.en.html) |
| 39 | [Servisni cheklash](39-servisni-cheklash.md) | `MemoryMax`, `CPUQuota`; `ProtectSystem`, `ProtectHome`, `NoNewPrivileges`, `PrivateTmp`; `systemd-analyze security` | T+V | [SD systemd.resource-control(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.resource-control.html) · [SD systemd.exec(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html) · [SD systemd-analyze(1)](https://www.freedesktop.org/software/systemd/man/latest/systemd-analyze.html) |

## IX qism — Tarmoq (40–44)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 40 | [IP, interfeys va marshrut](40-ip-interfeys-marshrut.md) | `ip addr`, `ip route`; localhost, `127.0.0.1` va `0.0.0.0` farqi; IPv4 va IPv6 | T+V | [UB Networking key concepts](https://ubuntu.com/server/docs/explanation/networking/networking-key-concepts/) · [DR 5.1](https://www.debian.org/doc/manuals/debian-reference/ch05.en.html#_the_basic_network_infrastructure) · [DR 5.5.1](https://www.debian.org/doc/manuals/debian-reference/ch05.en.html#_iproute2_commands) · [MAN ip(8)](https://man7.org/linux/man-pages/man8/ip.8.html) |
| 41 | [Tarmoqni kim boshqaradi](41-tarmoqni-kim-boshqaradi.md) | Netplan, ifupdown, systemd-networkd, NetworkManager — serverda qaysi biri ishlayotganini aniqlash; nega VPS'da tarmoqni o'zgartirish xavfli (ulanishni yo'qotish) | V | [UB About Netplan](https://ubuntu.com/server/docs/explanation/networking/about-netplan/) · [UB Configuring networks](https://ubuntu.com/server/docs/explanation/networking/configuring-networks/) · [DR 5.3–5.4](https://www.debian.org/doc/manuals/debian-reference/ch05.en.html#_the_modern_network_configuration_for_cloud) |
| 42 | [DNS va nom aniqlash](42-dns-va-nom-aniqlash.md) | `/etc/hosts`, `/etc/resolv.conf`, systemd-resolved (`resolvectl`); `dig`, `getent hosts`; nom qaysi tartibda qidiriladi | V | [DR 5.1.1](https://www.debian.org/doc/manuals/debian-reference/ch05.en.html#_the_hostname_resolution) · [SD resolvectl(1)](https://www.freedesktop.org/software/systemd/man/latest/resolvectl.html) · [DR 4.5](https://www.debian.org/doc/manuals/debian-reference/ch04.en.html#_pam_and_nss) |
| 43 | [Port va ulanishni tekshirish](43-port-va-ulanishni-tekshirish.md) | `ss`; `curl -v` bilan HTTP so'rov; port ochiqmi, servis tinglayaptimi, firewall to'syaptimi — farqlash | V | [MAN ss(8)](https://man7.org/linux/man-pages/man8/ss.8.html) · [DM curl(1)](https://manpages.debian.org/bookworm/curl/curl.1.en.html) · [DR 6.7](https://www.debian.org/doc/manuals/debian-reference/ch06.en.html#_the_diagnosis_of_the_system_daemons) |
| 44 | [Vaqt va xost nomi](44-vaqt-va-xost-nomi.md) | `hostnamectl`, `timedatectl`; vaqt zonasi; vaqt sinxronizatsiyasi (Debian'da timesyncd, Ubuntu 26.04 da chrony) | T+V | [SD hostnamectl(1)](https://www.freedesktop.org/software/systemd/man/latest/hostnamectl.html) · [SD timedatectl(1)](https://www.freedesktop.org/software/systemd/man/latest/timedatectl.html) · [UB Time synchronisation](https://ubuntu.com/server/docs/explanation/networking/about-time-synchronisation/) · [DR 3.8.1](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_the_hostname) |

## X qism — SSH va masofaviy ish (45–47)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 45 | [SSH bilan ulanish](45-ssh-bilan-ulanish.md) | Kalit juftligi (`ssh-keygen`, ed25519), `authorized_keys`, `known_hosts` va server barmoq izi; `~/.ssh/config`; `ssh-agent` | V | [DR 6.3](https://www.debian.org/doc/manuals/debian-reference/ch06.en.html#_the_remote_access_server_and_utilities_ssh) · [UB OpenSSH](https://ubuntu.com/server/docs/how-to/security/openssh-server/) · [SSH ssh(1)](https://man.openbsd.org/ssh.1) · [SSH ssh-keygen(1)](https://man.openbsd.org/ssh-keygen.1) · [SSH ssh_config(5)](https://man.openbsd.org/ssh_config.5) |
| 46 | [Fayl ko'chirish](46-fayl-kochirish.md) | `scp`, `sftp`, `rsync` — qiyos; `rsync` bilan faqat o'zgarganni yuborish; oxiridagi `/` farqi | V | [SSH scp(1)](https://man.openbsd.org/scp.1) · [DM rsync(1)](https://manpages.debian.org/bookworm/rsync/rsync.1.en.html) · [DR 10.1](https://www.debian.org/doc/manuals/debian-reference/ch10.en.html) |
| 47 | [SSH tunnel](47-ssh-tunnel.md) | Port yo'naltirish (`-L`, `-R`): serverdagi bazaga yoki admin paneliga xavfsiz ulanish; `ProxyJump` | V | [SSH ssh(1)](https://man.openbsd.org/ssh.1) · [SSH ssh_config(5)](https://man.openbsd.org/ssh_config.5) · [DR 6.3.7](https://www.debian.org/doc/manuals/debian-reference/ch06.en.html#_port_forwarding_for_smtp_pop3_tunneling) |

## XI qism — Bash skriptlar (48–51)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 48 | Birinchi skript | Shebang, bajarish ruxsati; parametrlar (`$1`, `$@`, `$#`); `sh` (Debian'da dash) va `bash` farqi; `set -e`, `-u`, `-o pipefail` — foydasi va tuzoqlari | T | [DR 12.1.1–12.1.2](https://www.debian.org/doc/manuals/debian-reference/ch12.en.html#_posix_shell_compatibility) · [GNU Bash: Shell Scripts](https://www.gnu.org/software/bash/manual/bash.html#Shell-Scripts) · [GNU Bash: The Set Builtin](https://www.gnu.org/software/bash/manual/bash.html#The-Set-Builtin) |
| 49 | Shart va sikl | `if`, `test`/`[ ]`/`[[ ]]`, `case`; `for`, `while read`; fayllarni xavfsiz aylanish | T | [DR 12.1.3–12.1.4](https://www.debian.org/doc/manuals/debian-reference/ch12.en.html#_shell_conditionals) · [GNU Bash: Conditional Constructs, Looping Constructs](https://www.gnu.org/software/bash/manual/bash.html#Conditional-Constructs) |
| 50 | Funksiya va xatolar | Funksiya, `local`, `return`; chiqish kodlari; `trap` bilan vaqtinchalik fayllarni tozalash; `shellcheck` | T | [GNU Bash: Shell Functions](https://www.gnu.org/software/bash/manual/bash.html#Shell-Functions) · [GNU Bash: Bourne Shell Builtins (trap)](https://www.gnu.org/software/bash/manual/bash.html#Bourne-Shell-Builtins) · [DR 12.4](https://www.debian.org/doc/manuals/debian-reference/ch12.en.html#_static_code_analysis_tools) |
| 51 | Amaliy: zaxira skripti | `tar` + siqish, sanali nom, eski nusxalarni o'chirish, systemd timer bilan har kuni ishga tushirish | T+V | [UB Backup with shell scripts](https://ubuntu.com/server/docs/how-to/backups/back-up-using-shell-scripts/) · [DR 10.1–10.2](https://www.debian.org/doc/manuals/debian-reference/ch10.en.html) · [DM tar(1)](https://manpages.debian.org/bookworm/tar/tar.1.en.html) |

## XII qism — Muammoni topish (52–54)

Bu qismdagi tekshiruv tartibi (qaysi buyruq qaysi ketma-ketlikda) rasmiy hujjatlarda bitta joyda yozilmagan. ⚑ belgisi shuni bildiradi: ishlatiladigan har bir buyruq rasmiy manbadan olingan, lekin ketma-ketlik VPS va trenajorda sinalgan amaliyot.

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 52 | ⚑ Servis ishlamayapti | `systemctl status` → `journalctl -u` → port (`ss`) → ruxsatlar → konfiguratsiya sintaksisi; trenajorda ataylab buzilgan servislar | T+V | [DR 6.7](https://www.debian.org/doc/manuals/debian-reference/ch06.en.html#_the_diagnosis_of_the_system_daemons) · [SD systemctl(1)](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html) · [SD journalctl(1)](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html) |
| 53 | ⚑ Server sekin | Yuklama, CPU, xotira va swap, disk I/O — qaysi biri sabab ekanini aniqlash | T+V | [DR 3.7](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_other_system_monitors) · [DR 9.4](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_monitoring_controlling_and_starting_program_activities) · [MAN proc(5)](https://man7.org/linux/man-pages/man5/proc.5.html) |
| 54 | ⚑ Disk to'ldi | `df` va `du`; o'chirilgan, lekin ochiq fayl; journal hajmi (`journalctl --vacuum-size`); eski yadrolar va apt keshi | T+V | [DR 9.8.12](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_invisible_disk_space_consumption) · [SD journalctl(1)](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html) · [DM df(1)](https://manpages.debian.org/bookworm/coreutils/df.1.en.html) |

---

## Animatsiyalar (qiyin tushunchalar)

| Bob | Nimani ko'rsatadi |
| --- | --- |
| 06 | Nom → inode → ma'lumot bloklari; hard link va symlink o'chirilganda nima qoladi |
| 07 | `rwx` bitlari → sonli yozuv (`754`); katalogda `x` nima uchun kerak |
| 11 | Uchta oqim va fayl deskriptorlari; `2>&1` tartibi |
| 14 | Qobiq (shell) bir qatorni qadam-baqadam kengaytiradi: tilde → o'zgaruvchi → `$()` → so'zlarga bo'lish → glob |
| 28 | `fork` va `exec`: bash ichidan buyruq ishga tushganda jarayon daraxti qanday o'sadi |
| 29 | Signal yuborilishi: SIGTERM — ilova ishini tugatadi, SIGKILL — yadro darhol to'xtatadi |
| 33 | Yonish bosqichlari va systemd unit'lari bog'liqlik grafi |
| 47 | SSH tunnel: so'rov noutbukdan server ichidagi portga qanday yetadi |

## Trenajor

Trenajorga boblar uchun kerakli paketlar qo'shilgan: `cron` (38-bob), `lsof` (32), `tmux` (30), `vim-tiny` (16), `acl` (08), `neofetch`. Trenajorda tarmoq yo'q, shuning uchun `dig` (42-bob) va boshqa tarmoq mavzulari VPS'da sinaladi.

Trenajor terminali hozircha Git trenajorining buyruq tavsiyalaridan foydalanadi. Ular Linux buyruqlariga almashtiriladi.
