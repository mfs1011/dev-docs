# Server xavfsizligi — yangilanish, SSH, firewall va zaxira

Bu qo'llanma internetga ochiq Linux serverni himoyalashni o'rgatadi: tizimni yangilab turish, root o'rniga cheklangan foydalanuvchi, SSH'ni faqat kalit bilan ochish, firewall va kerakli portlar, AppArmor, parol terish hujumlariga qarshi fail2ban, zaxira nusxa olish va tiklash, kim kirganini loglardan ko'rish.

Asos — Ubuntu Server hujjatidagi "Security suggestions" sahifasi va uning havolalari: yangilanishlar → kirish nazorati → tarmoq xavfsizligi. Mundarija shu tuzilmaga solishtirib tuzilgan. Har bob yonida u tayanadigan rasmiy sahifalar ko'rsatilgan. Har bobni yozishdan oldin shu sahifalar qayta o'qiladi. Buyruqlar real muhitda ishga tushirilib tekshiriladi, chiqishlar haqiqiy.

Manbalar va versiyalar (2026-11-07 da tekshirilgan):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Ubuntu | 26.04 LTS, standart xavfsizlik yangilanishlari 2031-yil maygacha. Ubuntu Pro (shaxsiy va biznes maqsadida 5 tagacha mashinada bepul) main paketlari uchun muddatni 10 yilga uzaytiradi va universe paketlarini ham qamraydi | <https://ubuntu.com/about/release-cycle> · <https://ubuntu.com/server/docs/explanation/security/security_suggestions/> |
| Ubuntu Server hujjati | Ubuntu 26.04 LTS uchun | <https://ubuntu.com/server/docs/> |
| OpenSSH | 10.2p1 | VPS: `apt-cache policy openssh-server` |
| ufw | 0.36.2 | VPS: `apt-cache policy ufw` |
| unattended-upgrades | 2.12 | VPS: `apt-cache policy unattended-upgrades` |
| fail2ban | Ubuntu 26.04 da 1.1.0 (universe); loyihaning so'nggi relizi 1.1.1 (2026-08-15) | VPS: `apt-cache policy fail2ban` · <https://github.com/fail2ban/fail2ban/releases> |
| restic | Ubuntu 26.04 da 0.18.1 (main); loyihaning so'nggi relizi 0.19.1 (2026-07-05) | VPS: `apt-cache policy restic` · <https://github.com/restic/restic/releases> |
| Sinov VPS | Ubuntu 26.04 LTS | — |

Muhit tanlovi haqida:

- **Paketlar Ubuntu omboridan.** Ubuntu hujjati uchinchi tomon omborlaridan qochishni maslahat beradi. Shuning uchun bu kitobdagi barcha vositalar Ubuntu'ning o'z omboridan o'rnatiladi.
- **Haqiqiy server.** Har o'zgarish sinov VPS'ida qilinadi. SSH va firewall sozlamalari xato bo'lsa, serverga kirib bo'lmay qolishi mumkin. Shuning uchun har bobda "o'zgarishni xavfsiz qo'llash" qadami bor: ikkinchi SSH sessiya ochiq turadi, provayder konsoli tayyor turadi.

Qisqartmalar:

- **UB** — Ubuntu Server hujjati (ubuntu.com/server/docs).
- **US** — Ubuntu Security hujjati (documentation.ubuntu.com/security).
- **UM** — Ubuntu 26.04 man sahifalari (manpages.ubuntu.com).
- **SSH** — OpenSSH qo'llanmalari (man.openbsd.org).
- **DK** — Docker hujjati.
- **RS** — restic hujjati (restic.readthedocs.io).

"Muhit" ustunida:

- **V** — VPS'da sinaladi.
- **—** — tushuncha bobi, buyruqsiz.

⚑ belgisi: bobdagi har bir buyruq rasmiy manbadan olingan, lekin tekshirish ketma-ketligi VPS'da sinalgan amaliyot, rasmiy hujjatda bitta joyda yozilmagan.

Bu qo'llanmaga kirmaydigan mavzular:

- Foydalanuvchilar, ruxsatlar, systemd va SSH'ning asoslari — **"Linux"** kitobida (22–23, 33–39, 45–47-boblar).
- HTTPS sertifikati va nginx sozlamalari — **"Nginx va HTTPS"** kitobida.
- Ma'lumotlar bazasining zaxirasi — **"SQL"** kitobida.
- Server buzilganda nima qilish (incident response): Debian'ning shu mavzudagi "Securing Debian Manual" qo'llanmasi debian.org'da endi yo'q, boshqa joriy rasmiy manba topilmadi. Shu sababli bu mavzu kiritilmadi.

> **Holat.** Qo'llanma yozilmoqda: 12/24 bob tayyor. Havolasi borlari — tayyor boblar.

---

## Har bobning skeleti

- **Tushuncha** — nimadan himoyalanamiz, oddiy so'zlar bilan. Qiyin joy animatsiya bilan.
- **Buyruqlar** — VPS'da ishga tushirilgan buyruqlar va ularning **haqiqiy** chiqishi.
- **Xavfsiz qo'llash** — o'zgarishdan oldin nima tayyorlanadi va xato bo'lsa qanday qaytariladi.
- **Tipik xatolar** — xato → nega yomon → to'g'ri yo'l.
- **Amaliyot** — savollar va javoblar.
- **Rasmiy hujjat** — bob tayangan sahifalar.

---

## I qism — Kirish (1–2)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 01 | [Server nimadan himoyalanadi](01-nimadan-himoya.md) | Internetga ochiq server: portlarni skanerlash, parol terib ko'rish urinishlari. Hujum yuzasi (attack surface) — tashqaridan kirish mumkin bo'lgan joylar. Himoya qatlamlari: yangilanish, kirish nazorati, tarmoq, zaxira | — | [UB Security suggestions](https://ubuntu.com/server/docs/explanation/security/security_suggestions/) · [UB Introduction to security](https://ubuntu.com/server/docs/explanation/intro-to/security/) |
| 02 | [⚑ Boshlang'ich holatni tekshirish](02-boshlangich-holat.md) | Qaysi portlar ochiq (`ss`), qaysi servislar ishlaydi, kim kira oladi (`sshd -T`), oxirgi yangilanish qachon bo'lgan | V | [UB Security suggestions](https://ubuntu.com/server/docs/explanation/security/security_suggestions/) · [UM ss(8)](https://manpages.ubuntu.com/manpages/resolute/man8/ss.8.html) · [SSH sshd(8)](https://man.openbsd.org/sshd.8) |

## II qism — Yangilanishlar (3–6)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 03 | [Paketlarni yangilash](03-paket-yangilash.md) | `apt update` va `apt upgrade`. Bosqichma-bosqich yangilanishlar (phased updates). Keraksiz paketlarni olib tashlash. Uchinchi tomon omborlarining xavfi | V | [UB Security suggestions](https://ubuntu.com/server/docs/explanation/security/security_suggestions/) · [UB About apt upgrade and phased updates](https://ubuntu.com/server/docs/explanation/software/about-apt-upgrade-and-phased-updates/) · [UB Package management](https://ubuntu.com/server/docs/how-to/software/package-management/) |
| 04 | [Avtomatik yangilanishlar](04-avto-yangilash.md) | `unattended-upgrades`: sozlama fayllari, qaysi omborlardan, paketni istisno qilish, natija haqida xabar | V | [UB Automatic updates](https://ubuntu.com/server/docs/how-to/software/automatic-updates/) · [UM unattended-upgrade(8)](https://manpages.ubuntu.com/manpages/resolute/man8/unattended-upgrade.8.html) |
| 05 | [Qayta ishga tushirish](05-qayta-ishga-tushirish.md) | Yangilangan kutubxonadan foydalanayotgan servislarni qayta ishga tushirish (`needrestart`). Yadro yangilanganda reboot. Avtomatik reboot sozlamasi | V | [UB Automatic updates](https://ubuntu.com/server/docs/how-to/software/automatic-updates/) (Reboots, Service restarts) |
| 06 | [Qo'llab-quvvatlash muddati](06-qollab-muddati.md) | LTS muddati. Ubuntu Pro: ESM (10 yil) va Livepatch (yadroni rebootsiz yamash). Keyingi LTS'ga o'tish | V | [UB Security suggestions](https://ubuntu.com/server/docs/explanation/security/security_suggestions/) · [US ESM](https://documentation.ubuntu.com/security/security-updates/esm/) · [UB Upgrade your release](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/) |

## III qism — Foydalanuvchilar va dasturlar (7–8)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 07 | [Root emas, sudo foydalanuvchi](07-sudo-foydalanuvchi.md) | Eng kam huquq tamoyili (least privilege). Admin uchun alohida foydalanuvchi. `sudo-rs` (Ubuntu 26.04). Root parolini o'chirish. Parol siyosati | V | [UB User management](https://ubuntu.com/server/docs/how-to/security/user-management/) · [UB Security suggestions](https://ubuntu.com/server/docs/explanation/security/security_suggestions/) |
| 08 | [AppArmor](08-apparmor.md) | Dastur qila oladigan ishni profil bilan cheklash. `enforce` va `complain` rejimlari. `aa-status`. Rad etishlarni logdan topish | V | [UB AppArmor](https://ubuntu.com/server/docs/how-to/security/apparmor/) · [US AppArmor](https://documentation.ubuntu.com/security/security-features/privilege-restriction/apparmor/) |

## IV qism — SSH (9–13)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 09 | SSH serverni sozlash | `sshd_config` va `sshd_config.d/`. `sshd -t` bilan tekshirish, `sshd -T` bilan amaldagi qiymatlar. O'zgarishni xavfsiz qo'llash | V | [UB OpenSSH server](https://ubuntu.com/server/docs/how-to/security/openssh-server/) · [SSH sshd_config(5)](https://man.openbsd.org/sshd_config) · [SSH sshd(8)](https://man.openbsd.org/sshd.8) |
| 10 | Faqat kalit bilan kirish | `PasswordAuthentication no`, `KbdInteractiveAuthentication no`, `PermitRootLogin`. Kimga ruxsat: `AllowUsers`, `AllowGroups` | V | [UB OpenSSH server](https://ubuntu.com/server/docs/how-to/security/openssh-server/) · [SSH sshd_config(5)](https://man.openbsd.org/sshd_config) |
| 11 | Ikki bosqichli kirish | TOTP (telefondagi bir martalik kod) yoki U2F/FIDO kalit | V | [UB 2FA with TOTP/HOTP](https://ubuntu.com/server/docs/how-to/security/two-factor-authentication-with-totp-or-hotp/) · [UB 2FA with U2F/FIDO](https://ubuntu.com/server/docs/how-to/security/two-factor-authentication-with-u2f-or-fido/) |
| 12 | Kriptografiya va banner | Ubuntu'dagi standart algoritmlar (`KexAlgorithms`, `Ciphers`, `MACs`). Banner'da OS ma'lumotini yashirish | V | [UB OpenSSH crypto configuration](https://ubuntu.com/server/docs/explanation/crypto/openssh-crypto-configuration/) · [UB OpenSSH server](https://ubuntu.com/server/docs/how-to/security/openssh-server/) |
| 13 | fail2ban | Logdagi muvaffaqiyatsiz kirishlar bo'yicha IP'ni vaqtincha bloklash. `jail`, `filter`, `action`. sshd uchun jail. Bloklangan IP'larni ko'rish va ochish | V | [UM jail.conf(5)](https://manpages.ubuntu.com/manpages/resolute/man5/jail.conf.5.html) · [UM fail2ban-client(1)](https://manpages.ubuntu.com/manpages/resolute/man1/fail2ban-client.1.html) |

## V qism — Tarmoq (14–18)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 14 | Firewall: ufw | Standart holatda kiruvchini taqiqlash. Firewall'ni yoqishdan oldin SSH portini ochish. Port ochish va yopish, ma'lum manzildan ruxsat, ilova profillari, `--dry-run`, holat va loglar. Tez-tez ulanishni cheklash (`ufw limit`) | V | [UB Firewalls](https://ubuntu.com/server/docs/how-to/security/firewalls/) · [UM ufw(8)](https://manpages.ubuntu.com/manpages/resolute/man8/ufw.8.html) |
| 15 | ⚑ Faqat kerakli portlar | Ichki servislarni (Redis, RabbitMQ, bazalar) faqat `127.0.0.1` ga bog'lash. `ss` bilan tekshirish. Tashqaridan nima ko'rinishini tekshirish | V | [UB Security suggestions](https://ubuntu.com/server/docs/explanation/security/security_suggestions/) · [UM ss(8)](https://manpages.ubuntu.com/manpages/resolute/man8/ss.8.html) |
| 16 | nftables | ufw ortidagi qoidalar. `nft list ruleset`. O'z qoidalaringizni yozish | V | [nftables wiki](https://wiki.nftables.org/wiki-nftables/index.php/Main_Page) · [UM nft(8)](https://manpages.ubuntu.com/manpages/resolute/man8/nft.8.html) · [UB Firewalls](https://ubuntu.com/server/docs/how-to/security/firewalls/) |
| 17 | Docker va firewall | Docker hujjatiga ko'ra Docker va ufw bir-biriga mos emas: Docker chiqargan port ufw qoidalariga yetib bormay ochiladi. Nima qilish kerak | V | [DK Packet filtering and firewalls](https://docs.docker.com/engine/network/packet-filtering-firewalls/) |
| 18 | VPN: WireGuard | Boshqaruv portlarini faqat VPN orqali ochish | V | [UB Introduction to WireGuard](https://ubuntu.com/server/docs/explanation/intro-to/wireguard-vpn/) · [UB WireGuard VPN](https://ubuntu.com/server/docs/how-to/wireguard-vpn/) |

## VI qism — Zaxira va tiklash (19–22)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 19 | [Shell skript bilan zaxira](19-shell-zaxira.md) | Ubuntu hujjatidagi `tar` skripti, eski arxivlarni aylantirish (rotation), arxivdan tiklash. Rejali ishga tushirish | V | [UB Backup with shell scripts](https://ubuntu.com/server/docs/how-to/backups/back-up-using-shell-scripts/) · [UB Backups and version control](https://ubuntu.com/server/docs/how-to/backups/) |
| 20 | [restic](20-restic.md) | Shifrlangan va takrorlarni bir marta saqlaydigan zaxira. Ombor yaratish, zaxira, snapshot'lar, eskilarini o'chirish (`forget`, `prune`). Boshqa serverdagi omborga (SFTP) | V | [RS Documentation](https://restic.readthedocs.io/en/stable/) |
| 21 | [Zaxiradan tiklash](21-tiklash.md) | Tiklashni sinab ko'rish: `restic restore`, faylni alohida tiklash, zaxira butunligini tekshirish (`restic check`) | V | [RS Documentation](https://restic.readthedocs.io/en/stable/) |
| 22 | [`/etc` ni git bilan kuzatish](22-etckeeper.md) | `etckeeper`: sozlama fayllaridagi har o'zgarish tarixi | V | [UB etckeeper](https://ubuntu.com/server/docs/how-to/backups/install-etckeeper/) |

## VII qism — Kuzatish (23–24)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 23 | Kim kirdi | SSH loglari (`journalctl -u ssh`). Kirishlar tarixi: Ubuntu 26.04 da `last` buyrug'i `wtmpdb` paketidan keladi (bizning VPS shablonida o'rnatilmagan). sshd'ning `LogLevel` sozlamasi | V | [UM journalctl(1)](https://manpages.ubuntu.com/manpages/resolute/man1/journalctl.1.html) · [UM wtmpdb (last)](https://manpages.ubuntu.com/manpages/resolute/man1/last.1.html) · [SSH sshd_config(5)](https://man.openbsd.org/sshd_config) |
| 24 | ⚑ Yakuniy tekshiruv ro'yxati | Yangilanishlar, foydalanuvchilar, SSH, firewall, ochiq portlar, zaxira — butun kitob bo'yicha bitta ro'yxat | V | [UB Security suggestions](https://ubuntu.com/server/docs/explanation/security/security_suggestions/) |

---

## Animatsiyalar (qiyin tushunchalar)

| Bob | Nimani ko'rsatadi |
| --- | --- |
| 01 | Himoya qatlamlari: hujumchi har qatlamda qayerda to'xtaydi |
| 13 | fail2ban: logdagi muvaffaqiyatsiz kirishlar → hisoblagich → IP bloklanadi → muddatdan keyin ochiladi |
| 14 | `ufw enable` dan oldin SSH ochilmasa nima bo'ladi |
| 17 | Docker porti ufw qoidalarini chetlab o'tadi |
