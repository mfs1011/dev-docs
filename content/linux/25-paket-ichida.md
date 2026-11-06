# 25 — Paket ichida nima bor

[← Oldingi: apt](24-apt.md) · [Mundarija](README.md) · [Keyingi: Tashqi repozitoriy →](26-tashqi-repozitoriy.md)

## Tushuncha

24-bobda `apt` paketlarni o'rnatdi. Bu bobda o'rnatilgan paketlarni **ichidan** ko'ramiz:

- Serverda qaysi paketlar bor va ular qanday holatda?
- Paket qaysi fayllarni qo'ydi? Bu fayl qaysi paketdan?
- Sozlama faylini o'zgartirsam, paket yangilanganda nima bo'ladi?
- Paketlar qayerdan keladi?

Ubuntu qo'llanmasiga ko'ra APT asosiy ishlarni qiladi, `dpkg` esa fayllarni tekshirish va paket haqida ma'lumot olish uchun foydali buyruqlarni saqlab qolgan.

Bu bobning ko'p qismi trenajorda ishlaydi: internet kerak emas.

## `dpkg -l`: paketlar ro'yxati

```text
$ dpkg -l cron sudo tree | cat
Desired=Unknown/Install/Remove/Purge/Hold
| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend
|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)
||/ Name           Version            Architecture Description
+++-==============-==================-============-=======================================================
ii  cron           3.0pl1-162         i386         process scheduling daemon
ii  sudo           1.9.13p3-1+deb12u4 i386         Provide limited super user privileges to specific users
ii  tree           2.1.0-1            i386         displays an indented directory tree, in color
```

Terminalda `dpkg -l` pager (17-bob) ochadi; `| cat` uni o'chiradi. Paket nomisiz — hamma paketlar.

Birinchi ikki harf — paket holati. Sarlavhadagi izohdan:

| Belgi | 1-harf: nima xohlangan | 2-harf: haqiqiy holat |
| --- | --- | --- |
| `i` | Install — o'rnatish | Inst — o'rnatilgan |
| `r` | Remove — o'chirish | — |
| `h` | Hold — ushlab turish | — |
| `c` | — | Conf-files — faqat sozlamalari qolgan |
| `n` / `u` | Unknown (`u`) | Not — o'rnatilmagan (`n`) |

Amalda uchraydiganlari: `ii` — o'rnatilgan; `rc` — o'chirilgan, sozlamalari qolgan; `hi` — o'rnatilgan va yangilanishdan ushlab turilgan; `un` — o'rnatilmagan.

## Paket va fayllar: `-L` va `-S`

```text
$ dpkg -L cron | head -n 12
/.
/etc
/etc/default
/etc/default/cron
/etc/init.d
/etc/init.d/cron
/etc/pam.d
/etc/pam.d/cron
/lib
/lib/systemd
/lib/systemd/system
/lib/systemd/system/cron.service
$ dpkg -S /usr/bin/crontab
cron: /usr/bin/crontab
$ dpkg -S /etc/crontab
cron-daemon-common: /etc/crontab
```

- `-L` (`--listfiles`) — paket qo'ygan fayllar.
- `-S` (`--search`) — fayl qaysi paketdan. `/etc/crontab` `cron` dan emas, `cron-daemon-common` dan ekan.

`-S` shablon bilan ham qidiradi — natija ko'p bo'lishi mumkin:

```text
$ dpkg -S bin/ls
util-linux: /bin/lsblk
util-linux-extra: /usr/bin/lsirq
util-linux: /usr/bin/lsns
e2fsprogs: /usr/bin/lsattr
util-linux: /usr/bin/lsmem
util-linux-extra: /usr/bin/lsfd
util-linux: /usr/bin/lslogins
util-linux: /usr/bin/lsipc
util-linux: /usr/bin/lslocks
lsof: /usr/bin/lsof
coreutils: /bin/ls
util-linux: /usr/bin/lscpu
```

Har fayl paketga tegishli emas:

```text
$ dpkg -S /etc/hostname; echo "kod: $?"
dpkg-query: no path found matching pattern /etc/hostname
kod: 1
```

Debian Reference'ga ko'ra `dpkg -S` paket o'rnatish skriptlari yaratgan fayllarni ko'rmaydi. `/etc/hostname` o'rnatishda yaratilgan, u hech bir paketning ro'yxatida yo'q.

Ubuntu qo'llanmasiga ko'ra `dpkg -S` paket ma'lumotiga qaraydi, shuning uchun fayl o'chirilgan bo'lsa ham ishlaydi:

```text vps
$ rm /etc/logrotate.conf
$ dpkg -S /etc/logrotate.conf
logrotate: /etc/logrotate.conf
```

(Bu fayl quyida qayta tiklanadi.)

## Conffile: sozlama fayllari

Paket fayllari ikki xil. Ubuntu qo'llanmasiga ko'ra:

- **Conffile** — paket egasi (maintainer) "sozlama" deb belgilagan fayl. Yangilanishda sizning o'zgarishlaringiz **himoyalanadi**.
- **Qolgan hamma fayllar** — yangilanishda paketdagi versiya bilan **ustidan yoziladi**. Ularga qilingan o'zgarish yo'qoladi.

Conffile'lar ro'yxati va ularning asl MD5 yig'indisi:

```text
$ dpkg-query -W -f='${Conffiles}\n' cron
 /etc/default/cron eae0d979b5007d2af41540d8c2631359
 /etc/init.d/cron 4824366b523de668591f5b6e258c7043
 /etc/pam.d/cron 11e788a7f7cd5477b10da2c7fd5ecdf0
```

Ubuntu qo'llanmasiga ko'ra conffile'lar odatda `/etc` da bo'ladi, lekin bunga majbur emas: ularni faqat paket egasining belgisi ajratadi.

### Nima o'zgargan: `dpkg --verify`

```text
$ echo 'EXTRA_OPTS="-L 15"' >> /etc/default/cron
$ dpkg --verify cron | grep -v missing
??5?????? c /etc/default/cron
```

- `5` — MD5 yig'indisi asl nusxadan farq qiladi: fayl o'zgargan.
- `c` — bu conffile.

Ubuntu qo'llanmasidagi misol: `c` siz qator — oddiy paket fayli o'zgargan. U keyingi yangilanishda qaytadan yoziladi, `apt install --reinstall paket` bilan darhol tiklanadi. Buzilgan yoki begona qo'l tekkan fayllarni topishning yo'li ham shu.

> Trenajorda `dpkg --verify` `/usr/share/doc` dagi fayllarni `missing` deb ko'rsatadi: brauzerga yuklanadigan hajmni kichraytirish uchun trenajorda hujjatlar o'rnatilmagan. `grep -v missing` shu shovqinni olib tashlaydi.

### Yangilanishda conffile bilan nima bo'ladi

Natija ikki savolga bog'liq: siz faylni o'zgartirdingizmi va paketning yangi versiyasida u o'zgarganmi. Tugmalarni bosing:

<div data-animatsiya="konffayl"></div>

Ubuntu qo'llanmasiga ko'ra siz o'zgartirgan conffile'ni APT **hech qachon so'ramasdan** ustidan yozmaydi.

Savol avtomatik yangilanishda (27-bob) yoki skriptda chiqsa, javob beradigan odam yo'q. Shuning uchun Ubuntu "Changing package files" sahifasi asosiy faylni tahrirlamaslikni maslahat beradi:

- Ko'p paketlar qo'shimcha `<nom>.d/` papkasini o'qiydi. O'zgarishni o'sha yerga alohida fayl qilib yozing: asosiy conffile o'zgarmaydi, savol ham chiqmaydi. `/etc/sudoers.d` (23-bob) shu yondashuvga misol.
- systemd unit fayllari uchun — `systemctl edit` (36-bob).

### Conffile'ni tiklash

Conffile o'chirilgan bo'lsa, oddiy `--reinstall` uni qaytarmaydi: dpkg buni sizning qaroringiz deb hisoblaydi. Ubuntu qo'llanmasidagi usul — dpkg'ga `--force-confmiss` berish:

```text vps
$ dpkg --verify logrotate
missing   c /etc/logrotate.conf
$ apt-get install -y --reinstall -o Dpkg::Options::=--force-confmiss logrotate
0 upgraded, 0 newly installed, 1 reinstalled, 0 to remove and 5 not upgraded.
Need to get 53.7 kB of archives.
After this operation, 0 B of additional disk space will be used.
Unpacking logrotate (3.22.0-1build1) over (3.22.0-1build1)…
Setting up logrotate (3.22.0-1build1)…

Configuration file «/etc/logrotate.conf», does not exist on system.
Installing new config file as you requested.
$ ls -l /etc/logrotate.conf
-rw-r--r-- 1 root root 586 Dec  6  2025 /etc/logrotate.conf
```

Tiklangan fayl o'chirilishidan oldingi zaxira nusxa bilan `cmp` orqali solishtirildi — bir xil.

## `remove`, `purge` va holatlar

Trenajorda `cron` ni avval o'chirib, keyin tozalaymiz:

```text
$ dpkg -r cron 2>&1 | tail -2
Removing cron (3.0pl1-162) ...
Processing triggers for man-db (2.11.2-2) ...
$ dpkg -l cron | tail -n 1
rc  cron           3.0pl1-162   i386         process scheduling daemon
$ dpkg -L cron
/etc
/etc/default
/etc/default/cron
/etc/init.d
/etc/init.d/cron
/etc/pam.d
/etc/pam.d/cron
$ dpkg --purge cron 2>&1 | tail -2
(Reading database ... 13102 files and directories currently installed.)
Purging configuration files for cron (3.0pl1-162) ...
$ dpkg -l cron | tail -n 1
un  cron           <none>       <none>       (no description available)
```

- `rc` holatida paketdan faqat conffile'lar qolgan — `dpkg -L` aynan ularni ko'rsatdi.
- `--purge` dan keyin `un`: paketdan iz qolmadi.

VPS'da `apt` bilan xuddi shunday. `apt purge` chiqishidagi `*` belgisi paket sozlamalari bilan birga o'chishini bildiradi:

```text vps
$ apt purge -y cron
REMOVING:
  cron*
Purging configuration files for cron (3.0pl1-200ubuntu1)…
$ ls /etc/default/cron
ls: cannot access '/etc/default/cron': No such file or directory
```

`dpkg -r` va `dpkg --purge` faqat bitta paketga tegadi. `apt` bog'liqliklarni ham hisobga oladi — kundalik ishda `apt` ishlating.

## Versiyani ushlab turish: `apt-mark hold`

Ba'zan paketni yangilanishdan to'xtatish kerak: masalan, ma'lumotlar bazasini rejali vaqtda, qo'lda yangilash uchun.

```text
$ apt-mark hold cron
cron set on hold.
$ apt-mark showhold
cron
$ dpkg -l cron | tail -n 1
hi  cron           3.0pl1-162   i386         process scheduling daemon
$ apt-mark unhold cron
Canceled hold on cron.
```

`hi` — hold, installed. `apt upgrade` bu paketni o'tkazib yuboradi. Hold — vaqtinchalik chora: xavfsizlik yangilanishlari ham kelmaydi. `apt-mark showhold` ni muntazam tekshiring.

## Paketlar qayerdan keladi

Ubuntu qo'llanmasiga ko'ra Ubuntu paket arxivi qatlamlarga bo'linadi:

| Qatlam | Ma'nosi | Misol |
| --- | --- | --- |
| **Seriya** (series) | Reliz kod nomi | `resolute` (26.04), `noble` (24.04) |
| **Pocket** | Paket hayotining bosqichi | `resolute` (reliz paytidagi), `-updates`, `-security`, `-backports`, `-proposed` |
| **Komponent** | Litsenziya va kim qo'llab-quvvatlaydi | `main`, `restricted`, `universe`, `multiverse` |

Pocket'lar:

- `resolute` (`-release`) — reliz chiqqan paytdagi paketlar.
- `-security` — xavfsizlik yangilanishlari, `-updates` — boshqa tuzatishlar.
- `-backports` — reliz paytida bo'lmagan yangi versiyalar.
- `-proposed` — sinovdagi yangilanishlar.

Komponentlar:

| | Ochiq kodli | Yopiq kodli |
| --- | --- | --- |
| Canonical qo'llab-quvvatlaydi | `main` | `restricted` |
| Hamjamiyat qo'llab-quvvatlaydi | `universe` | `multiverse` |

Debian'da ham shunga o'xshash: `bookworm`, `bookworm-updates`, `bookworm-security`; komponentlar `main`, `contrib`, `non-free`, `non-free-firmware`.

### `apt policy`: versiya qayerdan

```text vps
$ apt policy jq
jq:
  Installed: (none)
  Candidate: 1.8.1-4ubuntu2
  Version table:
     1.8.1-4ubuntu2 500
        500 http://mirror.hoztnode.net/ubuntu resolute-security/main amd64 Packages
        500 http://mirror.hoztnode.net/ubuntu resolute-updates/main amd64 Packages
     1.8.1-4ubuntu1 500
        500 http://mirror.hoztnode.net/ubuntu resolute/main amd64 Packages
```

- `Installed` — o'rnatilgan versiya, `Candidate` — `apt install` tanlaydigan versiya.
- `1.8.1-4ubuntu1` reliz bilan chiqqan (`resolute`), `1.8.1-4ubuntu2` keyin xavfsizlik yangilanishi sifatida kelgan (`resolute-security`).
- `500` — ustuvorlik (priority). O'rnatilgan versiya yonida `100 /var/lib/dpkg/status` turadi (24-bobdagi `linux-image-virtual` chiqishiga qarang).

### Manbalar fayli

Manbalar `/etc/apt/sources.list.d/` dagi `.sources` fayllarida (deb822 formati):

```text vps
$ cat /etc/apt/sources.list.d/Resolute.sources
Types: deb
URIs: http://mirror.hoztnode.net/ubuntu/
Suites: resolute
Components: main multiverse restricted universe
Signed-By: /usr/share/keyrings/Resolute-archive-keyring.gpg
trusted: yes
check-valid-until: no
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
```

`URIs` — mirror manzili, `Suites` — seriya va pocket, `Components` — komponentlar, `Signed-By` — imzo kaliti. Bu provayder fayli; undagi `trusted: yes` qatori jiddiy muammo — 26-bobda.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `dpkg` | 1.21.23 | 1.23.7 |
| Komponentlar | `main`, `contrib`, `non-free`, `non-free-firmware` | `main`, `restricted`, `universe`, `multiverse` |
| Manbalar fayli | `/etc/apt/sources.list` yoki `.sources` | `.sources` (deb822) |

`dpkg -L`, `-S`, `--verify`, `apt-mark hold`, `remove`/`purge` holatlari ikkala tizimda bir xil ishladi.

## Tipik xatolar

**1. Paketdagi oddiy faylni (conffile emas) tahrirlash.**
Keyingi yangilanishda o'zgarish jimgina yo'qoladi.
Tekshirish: `dpkg-query -W -f='${Conffiles}\n' paket`.

**2. Asosiy conffile'ni tahrirlash.**
Paket ham uni o'zgartirsa, yangilanishda savol chiqadi — avtomatik yangilanishda bu muammo.
To'g'risi: `.d/` papkasidagi alohida fayl.

**3. `remove` dan keyin "toza" o'rnatish kutish.**
`rc` holatida eski sozlamalar qolgan va qayta o'rnatishda ishlatiladi.
To'g'risi: `apt purge`.

**4. `hold` ni unutish.**
Paket oylab xavfsizlik yangilanishisiz qoladi.
Tekshirish: `apt-mark showhold`.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=25-dpkg)** "Paket tergovi": fayl qaysi paketdan ekanini topasiz, conffile o'zgarishini aniqlaysiz va paketni ushlab turasiz.

Savollar:

1. `/usr/bin/sudo` qaysi paketdan ekanini qanday bilasiz?
2. `dpkg -l` da `rc` nimani bildiradi?
3. `dpkg --verify` chiqishidagi `??5?????? c` nimani anglatadi?
4. Siz ham, paket egasi ham conffile'ni o'zgartirgan. `apt upgrade` paytida nima bo'ladi?
5. `-security` va `-updates` pocket'lari farqi nima?

<details>
<summary>Javoblar</summary>

1. `dpkg -S /usr/bin/sudo`.
2. Paket o'chirilgan (`r`), faqat sozlama fayllari qolgan (`c`).
3. Conffile (`c`) mazmuni (MD5, `5`) asl nusxadan farq qiladi.
4. dpkg so'raydi: paket egasining versiyasini o'rnatish (Y), o'zingiznikini qoldirish (N, standart) yoki farqni ko'rish (D).
5. `-security` — xavfsizlik yangilanishlari, `-updates` — boshqa tuzatishlar.

</details>

## Rasmiy hujjat

- [Ubuntu Server — Managing your software](https://ubuntu.com/server/docs/tutorial/managing-software/): dpkg, conffiles, pockets, components
- [Ubuntu Server — Changing package files](https://ubuntu.com/server/docs/explanation/software/changing-package-files/)
- [Debian Reference 2 — Debian package management](https://www.debian.org/doc/manuals/debian-reference/ch02.en.html)
- [dpkg(1) — Debian bookworm](https://manpages.debian.org/bookworm/dpkg/dpkg.1.en.html)
- [apt-mark(8) — Debian bookworm](https://manpages.debian.org/bookworm/apt/apt-mark.8.en.html)
- Trenajorda: `man dpkg`, `man dpkg-query`, `man apt-mark`
