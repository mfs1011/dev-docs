# 24 — apt

[← Oldingi: sudo](23-sudo.md) · [Mundarija](README.md) · [Keyingi: Paket ichida nima bor →](25-paket-ichida.md)

## Tushuncha

Debian va Ubuntu'da dasturlar **paket** (`.deb` fayl) ko'rinishida o'rnatiladi. Paket ichida dastur fayllari, uning tavsifi va unga kerakli boshqa paketlar ro'yxati (**bog'liqliklar**, dependencies) bor.

Paketlar bilan ikki daraja ishlaydi:

| Vosita | Nima qiladi |
| --- | --- |
| `dpkg` | Bitta `.deb` faylni o'rnatadi yoki o'chiradi. Bog'liqliklarni o'zi yuklab olmaydi (25-bob) |
| `apt` | Repozitoriydan (internetdagi paketlar omboridan) paketni topadi, bog'liqliklari bilan yuklab oladi va `dpkg` orqali o'rnatadi |

Ubuntu qo'llanmasiga ko'ra APT — Ubuntu'dagi barcha paketlar ma'lumotlar bazasi va ular bilan ishlash vositasi.

> Bu bob **VPS'da** (Ubuntu 26.04) bajarilgan. Trenajorda internet yo'q, shuning uchun `apt update` va `apt install` u yerda ishlamaydi. Buyruqlar Debian 12 da ham xuddi shunday.

## `apt update` va `apt upgrade`

Ubuntu qo'llanmasi tizimni yangilash uchun ikki buyruqni **doim shu tartibda** bajarishni aytadi:

| Buyruq | Nima qiladi |
| --- | --- |
| `apt update` | Paketlar **ro'yxatini** (package index) yangilaydi: qaysi versiyalar borligini bilib oladi. Hech narsa o'rnatmaydi |
| `apt upgrade` | O'rnatilgan paketlarni ro'yxatdagi yangi versiyalarga ko'taradi |

```text vps
$ apt update
Hit:2 http://mirror.hoztnode.net/ubuntu resolute-updates InRelease
Hit:3 http://mirror.hoztnode.net/ubuntu resolute InRelease
Reading package lists...
Building dependency tree...
Reading state information...
5 packages can be upgraded. Run 'apt list --upgradable' to see them.
$ apt list --upgradable
Listing...
base-files/resolute-updates 14ubuntu6.3 amd64 [upgradable from: 14ubuntu6.2]
linux-image-virtual/resolute-updates 7.0.0-43.43 amd64 [upgradable from: 7.0.0-42.42]
vim-common/resolute-updates 2:9.1.2141-1ubuntu4.10 all [upgradable from: 2:9.1.2141-1ubuntu4.9]
vim-tiny/resolute-updates 2:9.1.2141-1ubuntu4.10 amd64 [upgradable from: 2:9.1.2141-1ubuntu4.9]
xxd/resolute-updates 2:9.1.2141-1ubuntu4.10 amd64 [upgradable from: 2:9.1.2141-1ubuntu4.9]
```

`apt update` siz `apt upgrade` eski ro'yxat bilan ishlaydi va yangi versiyalarni "ko'rmaydi".

Har qatorda: paket nomi, qayerdan keladi (`resolute-updates` — 25-bob), yangi versiya, arxitektura va hozirgi versiya.

### Avval nima bo'lishini ko'ring: `-s`

`-s` (simulate) — hech narsa o'zgartirmasdan, nima qilinishini ko'rsatadi:

```text vps
$ apt upgrade -s
Calculating upgrade...
Upgrading:
  base-files  vim-common  vim-tiny  xxd

Not upgrading:
  linux-image-virtual

Summary:
  Upgrading: 4, Installing: 0, Removing: 0, Not Upgrading: 1
```

`linux-image-virtual` yangilanmaydi. Sababini so'raymiz:

```text vps
$ apt-get -s install linux-image-virtual
 linux-image-virtual : Depends: linux-image-7.0.0-43-generic but it is not going to be installed
E: Unable to satisfy dependencies. Reached two conflicting assignments:
   1. linux-image-7.0.0-43-generic:amd64 is selected for install because:
      1. linux-image-virtual:amd64=7.0.0-43.43 is selected as an upgrade
      2. linux-image-virtual:amd64=7.0.0-43.43 Depends linux-image-7.0.0-43-generic
   2. linux-image-7.0.0-43-generic:amd64 Depends linux-modules-7.0.0-43-generic
      but none of the choices are installable:
      [no choices]
```

Yangi yadro paketi `linux-modules-7.0.0-43-generic` ga bog'liq, provayder **mirror**'ida (repozitoriy nusxasida) esa u hali yo'q. apt chala o'rnatish o'rniga paketni **o'tkazib yubordi**. Bu xato emas: mirror yangilangach, keyingi `upgrade` uni o'rnatadi.

### `upgrade` va `full-upgrade`

Debian Reference'ga ko'ra:

| Buyruq | Boshqa paketlarni o'chiradimi |
| --- | --- |
| `apt upgrade` | **Yo'q.** O'chirishni talab qiladigan yangilanish o'tkazib yuboriladi |
| `apt full-upgrade` | Kerak bo'lsa, **o'chiradi** |

Ubuntu qo'llanmasiga ko'ra `upgrade` ni avtomatik (skriptda) ishlatish xavfsiz, `full-upgrade` (eski nomi `dist-upgrade`) esa faqat qaysi paketlar o'chishini ko'rib chiqa olganingizda. Avval `apt full-upgrade -s` bilan tekshiring.

Ubuntu'ning yangi relizga o'tishi (masalan, 24.04 → 26.04) boshqa buyruq: `do-release-upgrade`. `apt upgrade` faqat joriy reliz ichida yangilaydi.

## Qidirish va ma'lumot

```text vps
$ apt search --names-only '^jq$'
Sorting...
Full Text Search...
jq/resolute-security,resolute-updates 1.8.1-4ubuntu2 amd64
  lightweight and flexible command-line JSON processor
$ apt show jq
Package: jq
Version: 1.8.1-4ubuntu2
Section: utils
Depends: libjq1 (= 1.8.1-4ubuntu2), libc6 (>= 2.38), libonig5 (>= 6.8.1)
APT-Sources: http://mirror.hoztnode.net/ubuntu resolute-security/main amd64 Packages
Description: lightweight and flexible command-line JSON processor
```

`apt show` chiqishidan kerakli qatorlar `grep` (18-bob) bilan ajratilgan. `apt search` nom va tavsifdan qidiradi; `--names-only` — faqat nomdan.

## O'rnatish va bog'liqliklar

```text vps
$ apt install -y jq
Solving dependencies...
Installing:
  jq

Installing dependencies:
  libjq1  libonig5

Summary:
  Upgrading: 0, Installing: 3, Removing: 0, Not Upgrading: 5
  Download size: 393 kB
  Space needed: 1,179 kB / 38.5 GB available
$ jq --version
jq-1.8.1
```

`-y` — "Davom etaymi?" savoliga avtomatik "ha". Interaktiv ishda `-y` siz yozing: apt nima o'rnatishini ko'rib, keyin tasdiqlaysiz.

Ubuntu qo'llanmasiga ko'ra bog'liqlik uch xil:

| Turi | Ma'nosi | apt nima qiladi |
| --- | --- | --- |
| `Depends` | Usiz paket ishlamaydi | Doim o'rnatadi |
| `Recommends` | Kuchli tavsiya, lekin usiz ham ishlaydi | Ubuntu'da standart holatda o'rnatadi |
| `Suggests` | Foydali bo'lishi mumkin | O'rnatmaydi |

Serverda ortiqcha paket kerak emas: `apt install --no-install-recommends paket` faqat `Depends` ni o'rnatadi.

## O'chirish va `autoremove`

O'rnatish, o'chirish va bog'liqliklar bosqichma-bosqich:

<div data-animatsiya="qadamli" data-nom="apt-bogliq"></div>

```text vps
$ apt-mark showauto libjq1 libonig5 jq
libjq1
libonig5
$ apt remove -y jq
The following packages were automatically installed and are no longer required:
  libjq1  libonig5
Use 'apt autoremove' to remove them.

REMOVING:
  jq

Summary:
  Upgrading: 0, Installing: 0, Removing: 1, Not Upgrading: 5
  Freed space: 125 kB
$ apt autoremove -y
REMOVING:
  libjq1  libonig5

Summary:
  Upgrading: 0, Installing: 0, Removing: 2, Not Upgrading: 5
  Freed space: 1,054 kB
```

- apt bog'liqlik sifatida o'rnatgan paketlarni **auto** deb belgilaydi.
- `remove` faqat so'ralgan paketni o'chiradi.
- `autoremove` — hech bir paketga kerak bo'lmagan "auto" paketlarni.
- Auto paketni saqlab qolish kerak bo'lsa: `apt install paket` (yoki `apt-mark manual paket`) uni "manual" qiladi. Ubuntu qo'llanmasida shunday misol bor.

Ubuntu qo'llanmasi ogohlantiradi: boshqa paket **talab qiladigan** paketni o'chirsangiz, unga bog'liq paket ham o'chadi va bu zanjir bo'ylab davom etadi. `REMOVING:` ro'yxatini doim o'qing.

### `remove` va `purge`

| Buyruq | Dastur fayllari | Sozlama fayllari (`/etc/...`) |
| --- | --- | --- |
| `apt remove` | O'chadi | **Qoladi** |
| `apt purge` | O'chadi | O'chadi |

Ubuntu qo'llanmasiga ko'ra sozlamalar ataylab qoldiriladi: paketni qayta o'rnatsangiz, eski sozlamalaringiz bilan ishlaydi. Tafsilotlari va misol 25-bobda.

## Skriptlarda: `apt-get`

Skriptda `apt` ni ishlatsangiz, u ogohlantiradi:

```text vps
$ apt list jq libjq1

WARNING: apt does not have a stable CLI interface. Use with caution in scripts.

Listing...
```

Debian Reference ham shuni maslahat beradi: `apt` — **interaktiv** ish uchun, skriptlarda `apt-get` va `apt-cache`. Farqni bir xil buyruqda ko'rish mumkin. Ubuntu'dagi `apt-get`:

```text vps
$ apt-get -s remove vim-tiny
The following packages will be REMOVED:
  vim-tiny
0 upgraded, 0 newly installed, 1 to remove and 4 not upgraded.
Remv vim-tiny [2:9.1.2141-1ubuntu4.9]
```

Debian 12 dagi `apt-get` ham xuddi shu formatda (`The following packages will be REMOVED:`). `apt` esa apt 3 da chiqishini butunlay o'zgartirgan (`REMOVING:`, `Summary:`). Skript chiqishni o'qisa, `apt` yangilanganda buziladi.

| Interaktiv | Skriptda |
| --- | --- |
| `apt update` | `apt-get update` |
| `apt install -y paket` | `apt-get install -y paket` |
| `apt search`, `apt show` | `apt-cache search`, `apt-cache show` |

Ushbu bobdagi chiqishlarda bu ogohlantirish va yuklash jarayoni qatorlari (`Get:`, `Unpacking` ...) qisqalik uchun olib tashlangan.

## Yangilangandan keyin

Ubuntu'da `apt install` yoki `upgrade` oxirida `needrestart` dasturi qaysi servislar eski kutubxonalar bilan ishlayotganini aytadi:

```text vps
Restarting services...

Service restarts being deferred:
 /etc/needrestart/restart.d/dbus.service
 systemctl restart systemd-logind.service
 systemctl restart unattended-upgrades.service
```

Bu haqda — 27-bobda.

## Debian va Ubuntu

| | Debian 12 | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `apt` | 2.6.1 (trenajor) | 3.2.1 |
| `apt` chiqishi | `The following packages will be REMOVED:` | `REMOVING:`, `Summary:` |
| `apt-get` chiqishi | `The following packages will be REMOVED:` | `The following packages will be REMOVED:` |
| `needrestart` | Trenajorda yo'q | O'rnatilgan |

Buyruqlar va bayroqlar ikkalasida bir xil.

## Tipik xatolar

**1. `apt update` siz `apt install`.**
apt eski ro'yxat bilan ishlaydi va yangi versiyalarni ko'rmaydi.
To'g'risi: `apt update && apt install paket`.

**2. `full-upgrade` ni ko'rib chiqmasdan ishlatish.**
To'g'risi: avval `-s`, `REMOVING:` ni o'qing.

**3. Skriptlarda `apt`.**
To'g'risi: `apt-get`, `apt-cache`.

**4. `remove` dan keyin sozlamalar ketdi deb o'ylash.**
`/etc` dagi fayllar qoladi. Toza holat uchun `purge`.

**5. Har o'rnatishda `-y`.**
Bog'liqliklar ro'yxatini ko'rmasdan tasdiqlaysiz.

## Amaliyot

Trenajorda internet yo'q, shuning uchun bu bob uchun alohida mashq yo'q. O'rnatilgan paketlar bilan ishlash (`dpkg`, `apt-mark`) — 25-bob mashqida.

O'z serveringizda sinab ko'ring:

```text vps
$ apt update
$ apt list --upgradable
$ apt upgrade -s
$ apt show tree
$ apt install tree
$ apt remove tree
```

Savollar:

1. `apt update` va `apt upgrade` farqi nima?
2. `upgrade` qaysi holatda paketni yangilamaydi?
3. `apt remove nginx` dan keyin `/etc/nginx` nima bo'ladi?
4. `autoremove` qaysi paketlarni o'chiradi?
5. Deploy skriptida `apt` mi, `apt-get` mi?

<details>
<summary>Javoblar</summary>

1. `update` paketlar ro'yxatini yangilaydi, `upgrade` paketlarning o'zini.
2. Yangilash boshqa paketni o'chirishni yoki o'rnatib bo'lmaydigan paketni talab qilsa (bobdagi `linux-image-virtual`).
3. Qoladi: `remove` sozlama fayllarini o'chirmaydi. Hammasini o'chirish — `purge`.
4. Bog'liqlik sifatida avtomatik o'rnatilgan va endi hech bir paketga kerak bo'lmaganlarini.
5. `apt-get`: uning chiqishi barqaror, `apt` esa skriptda ogohlantiradi.

</details>

## Rasmiy hujjat

- [Ubuntu Server — Managing your software](https://ubuntu.com/server/docs/tutorial/managing-software/)
- [Debian Reference 2 — Debian package management](https://www.debian.org/doc/manuals/debian-reference/ch02.en.html)
- [apt(8) — Debian bookworm](https://manpages.debian.org/bookworm/apt/apt.8.en.html)
- [apt-get(8) — Debian bookworm](https://manpages.debian.org/bookworm/apt/apt-get.8.en.html)
