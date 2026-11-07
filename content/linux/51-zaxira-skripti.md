# 51 — Amaliy: zaxira skripti

[← Oldingi: Funksiya va xatolar](50-funksiya-va-xatolar.md) · [Mundarija](README.md)

## Tushuncha

Bu bobda 48–50-boblardagi hamma narsani bitta foydali skriptga yig'amiz: papkani **zaxiralaydigan** (backup), eski zaxiralarni o'chiradigan va har kuni o'zi ishga tushadigan skript.

Debian Reference (10.2.1) zaxira siyosatini uch savolga bo'ladi:

| Savol | Debian Reference javobi (qisqa) |
| --- | --- |
| Nimani? | O'zingiz yaratgan ma'lumot (`~/`), dasturlar ma'lumoti (`/var/`, keshlar va vaqtinchaliklardan tashqari), tizim sozlamalari (`/etc/`), lokal dasturlar (`/usr/local/`, `/opt/`) |
| Qanday? | Xavfsiz saqlash, muntazam (rejali) zaxira, bir nechta nusxa, bitta buyruq bilan ishlaydigan oddiy jarayon |
| Qanday xavf bor? | Ma'lumot boshqa diskda, iloji bo'lsa boshqa kompyuterda bo'lishi kerak; maxfiy fayllar (`/etc/shadow`, SSH kalitlari) zaxirasi shifrlanishi kerak |

Ubuntu Server hujjati ("Backup with shell scripts") yondashuvi: skript `tar` bilan papkalarni bitta arxiv faylga yig'adi; arxivni boshqa joyga ko'chirish mumkin. Biz shunday skript yozamiz va uni systemd timer (38-bob) bilan rejaga qo'yamiz.

| Qism | Qaysi bobdan |
| --- | --- |
| `set -euo pipefail`, `${1:-/etc}` | 48 |
| `[ -d … ]`, `${o'zgaruvchi#naqsh}` | 49 |
| funksiya, `exit 1`, `mktemp`, `trap … EXIT` | 50 |
| `find -mtime +N -delete` | 19 |
| `.service` + `.timer`, `Persistent=true` | 35, 38 |

## tar: arxiv

`tar(1)` ko'p fayl va papkani bitta arxiv faylga yig'adi. Ubuntu hujjatidagi `tar czf` ning harflari:

| Parametr | Ma'nosi (tar(1)) |
| --- | --- |
| `-c` | Yangi arxiv yaratish; papkalar ichidagilari bilan |
| `-z` | Arxivni `gzip` orqali siqish (`.tar.gz`) |
| `-f FAYL` | Arxiv fayli. Usiz natija standart chiqishga ketadi |
| `-t` | Arxiv ichidagilar ro'yxati |
| `-x` | Arxivdan chiqarish |
| `-C PAPKA` | Ishni boshlashdan oldin shu papkaga o'tish |

```text
$ cd /tmp
$ tar -czf hosts.tar.gz /etc/hosts /etc/hostname
tar: Removing leading `/' from member names
tar: Removing leading `/' from hard link targets
$ tar -tzf hosts.tar.gz
etc/hosts
etc/hostname
```

`tar` yo'llar boshidagi `/` ni olib tashladi va bu haqda ogohlantirdi. tar(1): bu standart xatti-harakat, `-P` (`--absolute-names`) uni o'chiradi. Sababi: arxivni chiqarganda fayllar **joriy papkaga** yoziladi, `/etc/hosts` ning ustiga emas. Ogohlantirishsiz arxivlash uchun `-C /` bilan ildizga o'tib, yo'lni `/` siz beramiz:

```text
$ tar -czf hosts.tar.gz -C / etc/hosts etc/hostname
$ tar -tzf hosts.tar.gz
etc/hosts
etc/hostname
$ rm hosts.tar.gz
```

Debian Reference (10.1.3) `-J` (xz) bilan misol beradi — u sekinroq, lekin kichikroq arxiv qiladi. Biz Ubuntu hujjatidagidek `-z` (gzip) ni ishlatamiz.

## Skript

Skriptni Ubuntu hujjatidagidek `/usr/local/bin/` ga qo'yamiz — lokal dasturlar joyi (4-bob):

```text
$ cat > /usr/local/bin/zaxira.sh <<'EOF'
> #!/bin/bash
> # Papkani sanali .tar.gz arxivga zaxiralaydi va eski arxivlarni o'chiradi.
> #   zaxira.sh [PAPKA]    (standart: /etc)
> set -euo pipefail
> 
> manba=${1:-/etc}
> dest=/var/backups/zaxira
> saqlash_kun=7
> 
> xato() {
>   echo "xato: $*" >&2
>   exit 1
> }
> 
> [ -d "$manba" ] || xato "papka yo'q: $manba"
> mkdir -p "$dest"
> 
> nom="$(hostname -s)-$(basename "$manba")-$(date +%F_%H%M%S).tar.gz"
> yarim=$(mktemp "$dest/.yarim.XXXXXX")
> trap 'rm -f "$yarim"' EXIT
> 
> tar -czf "$yarim" -C / "${manba#/}"
> mv "$yarim" "$dest/$nom"
> echo "zaxira: $dest/$nom ($(stat -c %s "$dest/$nom") bayt)"
> 
> find "$dest" -name '*.tar.gz' -mtime +"$saqlash_kun" -printf "o'chirildi: %p\n" -delete
> EOF
$ chmod 755 /usr/local/bin/zaxira.sh
```

Qatorma-qator:

| Qator | Nima uchun |
| --- | --- |
| `#!/bin/bash`, `set -euo pipefail` | `pipefail` faqat bash'da (48-bob); har xatoda to'xtash |
| `manba=${1:-/etc}` | Argument berilmasa — `/etc` |
| `xato()` | Xabar standart xato oqimiga, kod `1` (50-bob) |
| `nom=…` | `lab-etc-2026-11-07_031500.tar.gz` kabi: xost nomi (Ubuntu hujjatidagidek, bir nechta server zaxirasi bir joyda turishi uchun), papka va sana. Sana `%F` (YYYY-MM-DD) bo'lgani uchun nomlar alifbo tartibida vaqt tartibida turadi |
| `mktemp` + `trap` | Arxiv avval vaqtinchalik `.yarim.*` faylga yoziladi. `tar` yarim yo'lda yiqilsa (disk to'ldi va h.k.), trap uni o'chiradi — chala arxiv "tayyor zaxira" nomini olmaydi |
| `"${manba#/}"` | Boshidagi `/` ni olib tashlash: `-C /` bilan `etc` — ogohlantirishsiz |
| `mv` | Arxiv to'liq yozilgandan keyingina haqiqiy nomini oladi. `mv` dan keyin `$yarim` fayli yo'q — trap'dagi `rm -f` hech narsa qilmaydi |
| `find … -mtime +7 … -delete` | 7 kundan eski arxivlar o'chiriladi (19-bob: `+7` amalda 8 kun va undan eski). `-name '*.tar.gz'` — `.yarim.*` va boshqa fayllarga tegmaydi |

`mktemp` fayli `u+rw` ruxsat bilan yaratiladi (mktemp(1)) va `mv` ruxsatni o'zgartirmaydi: arxivni faqat root o'qiy oladi. Bu muhim, chunki `/etc` ichida `/etc/shadow` bor.

Ishga tushiramiz:

```text
$ zaxira.sh
zaxira: /var/backups/zaxira/trenajor-etc-2026-11-07_162655.tar.gz (122133 bayt)
$ ls -l /var/backups/zaxira
total 1
-rw------- 1 root root 122133 Nov  7 16:26 trenajor-etc-2026-11-07_162655.tar.gz
$ zaxira.sh /yoq; echo "kod: $?"
xato: papka yo'q: /yoq
kod: 1
```

`zaxira.sh` nomi `./` siz ishladi: `/usr/local/bin` — `PATH` da (13-bob).

## Zaxirani tekshirish

Ubuntu hujjati: arxiv yaratilgandan keyin uni **sinash** muhim; ro'yxatni ko'rish ham sinov, lekin eng yaxshisi — undan faylni tiklab ko'rish. Arxivdan bitta faylni boshqa papkaga chiqaramiz:

```text
$ arx=$(ls /var/backups/zaxira/*.tar.gz)
$ tar -tzf "$arx" | head -3
etc/
etc/adduser.conf
etc/alternatives/
$ mkdir -p /tmp/tiklash
$ tar -xzf "$arx" -C /tmp/tiklash etc/hostname
$ ls /tmp/tiklash/etc
hostname
$ diff /etc/hostname /tmp/tiklash/etc/hostname && echo "bir xil"
bir xil
```

- `-C /tmp/tiklash` — chiqarish shu papkaga; `tar` papkalar tuzilmasini qayta yaratdi: `etc/hostname`.
- Fayl nomi `/` siz yoziladi — arxivda u shunday saqlangan (Ubuntu hujjati ham shuni ta'kidlaydi).
- Butun arxivni `/` ga chiqarish (`tar -xzf … -C /`) mavjud fayllar ustidan yozadi — Ubuntu hujjati bu haqda ogohlantiradi.

## Eski zaxiralarni o'chirish

Skript har ishga tushganda 7 kundan eski arxivlarni o'chiradi. 8 kun kutmaslik uchun eski arxivni `touch -d` bilan "o'tmishga" o'tkazamiz:

```text
$ cp "$arx" /var/backups/zaxira/eski-sinov.tar.gz
$ touch -d '10 days ago' /var/backups/zaxira/eski-sinov.tar.gz
$ ls -l --time-style=+%F /var/backups/zaxira
total 120
-rw------- 1 root root 122133 2026-10-28 eski-sinov.tar.gz
-rw------- 1 root root 122133 2026-11-07 trenajor-etc-2026-11-07_162655.tar.gz
$ zaxira.sh
zaxira: /var/backups/zaxira/trenajor-etc-2026-11-07_162657.tar.gz (122133 bayt)
o'chirildi: /var/backups/zaxira/eski-sinov.tar.gz
$ ls /var/backups/zaxira
trenajor-etc-2026-11-07_162655.tar.gz  trenajor-etc-2026-11-07_162657.tar.gz
```

Yangi zaxira qo'shildi, 10 kunlik — o'chdi.

## Har kuni: systemd timer

Ubuntu hujjati skriptni cron bilan rejaga qo'yadi. Bizning VPS shablonida cron o'rnatilmagan (38-bob), systemd timer esa hamma joyda bor. 38-bobdagidek ikki unit:

```text
$ cat > /etc/systemd/system/zaxira.service <<'EOF'
> [Unit]
> Description=/etc zaxirasi
> 
> [Service]
> Type=oneshot
> ExecStart=/usr/local/bin/zaxira.sh /etc
> EOF
$ cat > /etc/systemd/system/zaxira.timer <<'EOF'
> [Unit]
> Description=/etc zaxirasi har kuni
> 
> [Timer]
> OnCalendar=daily
> Persistent=true
> 
> [Install]
> WantedBy=timers.target
> EOF
$ systemctl daemon-reload
$ systemctl start zaxira.service
$ systemctl status zaxira.service --no-pager | grep -E 'Loaded|Active'
     Loaded: loaded (/etc/systemd/system/zaxira.service; static)
     Active: inactive (dead)
$ journalctl -u zaxira.service --no-pager -o cat | grep zaxira:
zaxira: /var/backups/zaxira/trenajor-etc-2026-11-07_162702.tar.gz (122280 bayt)
```

- `Type=oneshot` — ish tugaguncha ishlaydigan servis (35-bob).
- Skript chiqishi (`echo`) jurnalga tushdi (37-bob) — zaxira qachon olingani va hajmi shu yerda.
- Xato bo'lsa skript `1` qaytaradi va servis `failed` bo'ladi — buni `systemctl --failed` ko'rsatadi.

Timer'ni yoqamiz:

```text
$ systemctl enable --now zaxira.timer
Created symlink /etc/systemd/system/timers.target.wants/zaxira.timer → /etc/systemd/system/zaxira.timer.
$ systemctl list-timers zaxira.timer --no-pager
NEXT                        LEFT    LAST PASSED UNIT         ACTIVATES     
Sun 2026-11-08 00:00:00 UTC 7h left -    -      zaxira.timer zaxira.service

1 timers listed.
Pass --all to see loaded but inactive timers, too.
```

`OnCalendar=daily` — har kuni 00:00 da (38-bob: `systemd-analyze calendar daily`). `Persistent=true` — server shu payt o'chiq bo'lsa, yonganda bajariladi.

Trenajorni tozalaymiz:

```text
$ systemctl disable --now zaxira.timer
Removed "/etc/systemd/system/timers.target.wants/zaxira.timer".
$ rm /etc/systemd/system/zaxira.service /etc/systemd/system/zaxira.timer /usr/local/bin/zaxira.sh
$ systemctl daemon-reload
$ rm -rf /var/backups/zaxira /tmp/tiklash
```

## VPS'da

Xuddi shu skript va unitlarni VPS'ga o'rnatdik (fayllar mazmuni yuqoridagi bilan bir xil) va `shellcheck` (50-bob) bilan tekshirdik:

```text vps
$ chmod 755 /usr/local/bin/zaxira.sh
$ shellcheck /usr/local/bin/zaxira.sh; echo "kod: $?"
kod: 0
$ tar --version | head -1
tar (GNU tar) 1.35
$ systemctl daemon-reload
$ systemctl start zaxira.service
$ journalctl -u zaxira.service --no-pager -o cat | grep zaxira:
zaxira: /var/backups/zaxira/lab-etc-2026-11-07_192733.tar.gz (465346 bayt)
$ ls -l /var/backups/zaxira
total 456
-rw------- 1 root root 465346 Nov  7 19:27 lab-etc-2026-11-07_192733.tar.gz
$ systemctl enable --now zaxira.timer
Created symlink '/etc/systemd/system/timers.target.wants/zaxira.timer' → '/etc/systemd/system/zaxira.timer'.
$ systemctl list-timers zaxira.timer --no-pager
NEXT                            LEFT LAST PASSED UNIT         ACTIVATES
Sun 2026-11-08 00:00:00 MSK 4h 32min -         - zaxira.timer zaxira.service

1 timers listed.
Pass --all to see loaded but inactive timers, too.
```

- `shellcheck` skriptda birorta ham muammo topmadi (`kod: 0`).
- VPS'dagi `/etc` kattaroq: arxiv 465 KB.
- Vaqt `MSK`: VPS vaqt zonasi `Europe/Moscow` (44-bob).

Haqiqiy serverda timer yoqilgan holda qoladi. Bu sinov VPS bo'lgani uchun tozaladik:

```text vps
$ systemctl disable --now zaxira.timer
Removed '/etc/systemd/system/timers.target.wants/zaxira.timer'.
$ rm /etc/systemd/system/zaxira.service /etc/systemd/system/zaxira.timer /usr/local/bin/zaxira.sh
$ systemctl daemon-reload
$ rm -rf /var/backups/zaxira
```

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| tar | GNU tar 1.34 | GNU tar 1.35 |
| cron | bor | o'rnatilmagan (provayder shabloni) |
| Skript va timer | bir xil ishlaydi | bir xil ishlaydi |

## Tipik xatolar

**1. Zaxirani o'sha diskda saqlash.**
Disk buzilsa, zaxira ham yo'qoladi (Debian Reference 10.2.1).
To'g'risi: arxivni boshqa disk yoki serverga ko'chirish (masalan, `rsync`, 46-bob).

**2. Zaxirani hech qachon tiklab ko'rmaslik.**
Arxiv buzuq yoki kerakli fayl yo'qligi faqat kerak bo'lganda ma'lum bo'ladi.
To'g'risi: muntazam `tar -t` va sinov tiklash (Ubuntu hujjati).

**3. Arxivni to'g'ridan-to'g'ri yakuniy nom bilan yozish.**
`tar` yiqilsa, chala fayl "zaxira" bo'lib qoladi.
To'g'risi: vaqtinchalik fayl + `mv`, `trap` bilan tozalash.

**4. Butun arxivni `-C /` bilan chiqarish.**
Hozirgi fayllar ustidan yoziladi.
To'g'risi: avval boshqa papkaga chiqarib, solishtirish.

**5. Maxfiy fayllar zaxirasini hammaga ochiq qoldirish.**
`/etc` arxivida `/etc/shadow` bor.
To'g'risi: arxivni faqat root o'qisin (`600`); boshqa joyga ko'chirishda — shifrlash (Debian Reference 10.2.1).

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=51-zaxira)** "Zaxira skripti": tayyor skript bilan zaxira olasiz, arxivdan faylni tiklaysiz va eski zaxira o'chirilishini tekshirasiz.

Savollar:

1. `tar -czf a.tar.gz /etc/hosts` nega `Removing leading '/'` deydi va bu nima uchun foydali?
2. Arxivdan faqat `etc/hosts` ni `/tmp/t` ga qanday chiqarasiz?
3. Skript nega arxivni avval `.yarim.*` faylga yozadi?
4. `find … -mtime +7 -delete` 7 kun-u 12 soatlik faylni o'chiradimi?
5. Server 00:00 da o'chiq edi. `OnCalendar=daily` timer'i zaxirani qachon oladi?

<details>
<summary>Javoblar</summary>

1. tar yo'l boshidagi `/` ni olib tashlaydi: chiqarishda fayllar joriy papkaga yoziladi, tizimdagi fayllar ustiga emas.
2. `tar -xzf a.tar.gz -C /tmp/t etc/hosts` (`/tmp/t` oldindan mavjud bo'lishi kerak).
3. `tar` yiqilsa, chala arxiv yakuniy nomni olmasligi va `trap` uni o'chirishi uchun.
4. Yo'q: `+7` — 8 kun va undan eski (19-bob).
5. `Persistent=true` bo'lsa — server yonganda; bo'lmasa — keyingi kuni 00:00 da.

</details>

## Rasmiy hujjat

- [Ubuntu Server: Backup with shell scripts](https://ubuntu.com/server/docs/how-to/backups/back-up-using-shell-scripts/) — `tar czf`, `/usr/local/bin`, arxivni sinash va tiklash
- [Debian Reference 10.1](https://www.debian.org/doc/manuals/debian-reference/ch10.en.html#_sharing_copying_and_archiving) — arxiv vositalari, `tar` idiomalari
- [Debian Reference 10.2](https://www.debian.org/doc/manuals/debian-reference/ch10.en.html#_backup_and_recovery) — zaxira siyosati
- [tar(1)](https://manpages.debian.org/bookworm/tar/tar.1.en.html) — `-c`, `-t`, `-x`, `-z`, `-f`, `-C`, `-P`
- [mktemp(1)](https://manpages.debian.org/bookworm/coreutils/mktemp.1.en.html) · [find(1)](https://manpages.debian.org/bookworm/findutils/find.1.en.html) — `-mtime`, `-printf`, `-delete`
- [systemd.timer(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html) — `OnCalendar=`, `Persistent=`
