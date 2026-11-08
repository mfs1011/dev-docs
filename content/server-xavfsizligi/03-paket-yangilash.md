# 03 — Paketlarni yangilash

[Mundarija](README.md)

## Tushuncha

UB (Security suggestions): tizimni **muntazam yangilang** — ma'lum zaifliklardan himoya uchun:

```text
sudo apt update && sudo apt upgrade
```

| Buyruq | Nima |
| --- | --- |
| `apt update` | Omborlardan paketlar ro'yxatini yangilaydi (o'zi hech narsa o'rnatmaydi) |
| `apt upgrade` | O'rnatilgan paketlarni yangi versiyaga; kerak bo'lsa **yangi paketlar o'rnatiladi**, lekin hech narsa **o'chirilmaydi** (UM apt(8)) |
| `apt full-upgrade` | `upgrade` + butun tizimni yangilash uchun kerak bo'lsa paketlarni **o'chiradi** |
| `apt autoremove` | Endi kerak bo'lmagan bog'liqliklarni olib tashlaydi |

Diqqat — `apt-get upgrade` boshqacha (UM apt-get(8)): u **hech qachon** yangi paket o'rnatmaydi va o'chirmaydi; boshqa paket holatini o'zgartirmasdan yangilab bo'lmaydiganlar eski versiyada qoladi ("kept back"). Yangi yadro — odatda **yangi paket** (`linux-image-<versiya>`), shuning uchun `apt-get upgrade` uni o'rnatmaydi.

### Bosqichma-bosqich yangilanishlar (phased updates)

UB (About apt upgrade and phased updates): ba'zi yangilanishlar hammaga birdan emas, **bosqichma-bosqich** chiqariladi — avval kichik bir qism mashinalarga; barqaror ekani tasdiqlangach — tobora ko'proqqa. Ba'zi xatolar sinovdan o'tib ketishi mumkin; bosqichlash ularni ko'pchilikka yetmasdan aniqlashga yordam beradi.

- `apt upgrade` da "packages have been kept back" chiqishi mumkin — bu xavfsiz, e'tiborsiz qoldirish mumkin; vaqti kelganda yangilanish o'zi keladi.
- **Xavfsizlik yangilanishlari hech qachon bosqichlanmaydi.**
- Bosqich mashinaning Machine ID'si, paket nomi va versiyasidan mijoz tomonida hisoblanadi — hech qanday ma'lumot yuborilmaydi.
- `apt policy <paket>` — `(phased 20%)` kabi ko'rsatadi.
- Alohida paketni `apt install` bilan majburan yangilash — tavsiya etilmaydi; o'chirish (`99-Phased-Updates` fayli) — faqat nima qilayotganingizni aniq bilsangiz.

### Keraksiz paketlar

UB: kerak bo'lmagan paketlarni olib tashlang — **hujum yuzasini** kamaytirish uchun (1-bob).

### Uchinchi tomon omborlari

UB (Security suggestions): uchinchi tomon omborlaridan **qoching**. UB (Third party repository usage) xavflari:

| Xavf | Nima |
| --- | --- |
| **Xavfsizlik** | APT omborlari sandbox'siz kod ishga tushiradi; APT va `dpkg` turli nashriyotchilar orasida xavfsizlik chegarasini ta'minlamaydi. Nashriyotchining niyatiga **va** uning o'z xavfsizligiga ishonasiz — u buzilsa, sizning tizimingiz ham |
| **Tizim yaxlitligi** | Ubuntu paketi bilan bir xil fayl — konflikt; Ubuntu paketining o'zgartirilgan versiyasi — ayniqsa ehtiyot |
| **Qo'llab-quvvatlash** | Ubuntu jamoasi yordam bera olmaydi — nashriyotchiga murojaat |

Kamaytirish (UB): mumkin bo'lsa **snap** (o'z bog'liqliklari bilan, izolyatsiyalangan, sandbox'da); bo'lmasa — manba kodini tekshirish, xavfsizlik tuzatishlari tezligini baholash, paketlar ombor **GPG kaliti** bilan imzolangan bo'lishi, **pinning** (Nginx kitobi, 2-bob), reliz yangilash o'rniga yangi relizga qayta joylash.

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04).

### Nima yangilanishi kerak

```text vps
$ apt-get update 2>&1 | tail -3
Hit:5 https://nginx.org/packages/mainline/ubuntu resolute InRelease
Hit:6 https://packages.redis.io/deb resolute InRelease
Reading package lists...
$ apt list --upgradable 2>/dev/null | tail -n +2
base-files/resolute-updates 14ubuntu6.3 amd64 [upgradable from: 14ubuntu6.2]
linux-image-virtual/resolute-updates 7.0.0-43.43 amd64 [upgradable from: 7.0.0-42.42]
vim-common/resolute-updates 2:9.1.2141-1ubuntu4.10 all [upgradable from: 2:9.1.2141-1ubuntu4.9]
vim-tiny/resolute-updates 2:9.1.2141-1ubuntu4.10 amd64 [upgradable from: 2:9.1.2141-1ubuntu4.9]
xxd/resolute-updates 2:9.1.2141-1ubuntu4.10 amd64 [upgradable from: 2:9.1.2141-1ubuntu4.9]
```

5 ta paket, jumladan yangi yadro (`linux-image-virtual` 7.0.0-43).

### `apt-get upgrade`

```text vps
$ apt-get -s upgrade 2>&1 | grep -E 'kept back|upgraded,|^  ' | head -8
The following packages have been kept back:
  linux-image-virtual
  base-files vim-common vim-tiny xxd
4 upgraded, 0 newly installed, 0 to remove and 1 not upgraded.
$ for p in $(apt list --upgradable 2>/dev/null | tail -n +2 | cut -d/ -f1); do apt-cache policy $p | grep -m1 -E 'phased' && echo "  ^ $p"; done; echo 'phased tekshiruvi tugadi'
phased tekshiruvi tugadi
```

- `linux-image-virtual` — "kept back"; qolgan 4 tasi yangilanadi.
- Bu **phased** emas — hech bir paketda `phased` belgisi yo'q.

```text vps
$ DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -q 2>&1 | grep -E '^(Setting up|[0-9]+ upgraded)' ; [ -f /var/run/reboot-required ] && cat /var/run/reboot-required.pkgs | sed 's/^/reboot sababi: /' || echo 'reboot shart emas'
4 upgraded, 0 newly installed, 0 to remove and 1 not upgraded.
Setting up base-files (14ubuntu6.3) ...
Setting up xxd (2:9.1.2141-1ubuntu4.10) ...
Setting up vim-common (2:9.1.2141-1ubuntu4.10) ...
Setting up vim-tiny (2:9.1.2141-1ubuntu4.10) ...
reboot shart emas
```

4 ta paket yangilandi, yadro qoldi.

### `apt-get upgrade` va `apt upgrade` farqi

```text vps
$ apt-get -s upgrade 2>&1 | grep -E 'kept back|^  linux|upgraded,'; apt -s upgrade 2>/dev/null | grep -E 'NEW packages|^  linux|upgraded,|^Inst' | head -8
The following packages have been kept back:
  linux-image-virtual
0 upgraded, 0 newly installed, 0 to remove and 1 not upgraded.
  linux-image-virtual
Installing dependencies:
  linux-image-7.0.0-43-generic
  linux-main-modules-v4l2loopback-7.0.0-43-generic
  linux-main-modules-zfs-7.0.0-43-generic
  linux-modules-7.0.0-43-generic
Inst linux-main-modules-zfs-7.0.0-43-generic (7.0.0-43.43 Ubuntu:26.04/resolute-updates [amd64]) []
Inst linux-main-modules-v4l2loopback-7.0.0-43-generic (7.0.0-43.43 Ubuntu:26.04/resolute-updates [amd64]) []
```

`apt-get upgrade` yadroni yana ushlab qoldi; `apt upgrade` esa uning uchun **yangi bog'liqliklarni** o'rnatishni rejalashtirdi (`linux-image-7.0.0-43-generic`, modullar) — man sahifalaridagi farq aynan shu.

```text vps
$ DEBIAN_FRONTEND=noninteractive apt upgrade -y -q 2>/dev/null | grep -E '^Setting up linux|upgraded,'; cat /var/run/reboot-required 2>/dev/null; cat /var/run/reboot-required.pkgs 2>/dev/null | sed 's/^/sabab: /'; uname -r
Setting up linux-image-7.0.0-43-generic (7.0.0-43.43) ...
Setting up linux-main-modules-v4l2loopback-7.0.0-43-generic (7.0.0-43.43) ...
Setting up linux-modules-7.0.0-43-generic (7.0.0-43.43) ...
Setting up linux-main-modules-zfs-7.0.0-43-generic (7.0.0-43.43) ...
Setting up linux-image-virtual (7.0.0-43.43) ...
sabab: linux-image-7.0.0-43-generic
7.0.0-42-generic
```

Yangi yadro o'rnatildi; `/var/run/reboot-required.pkgs` da sabab — `linux-image-7.0.0-43-generic`. Ishlab turgan yadro hali eski (`7.0.0-42`) — yangisi faqat qayta ishga tushirishdan keyin (5-bob).

### Keraksiz paketlar

```text vps
$ apt-get -s autoremove 2>&1 | grep -E '^Remv|upgraded,' | head -6
0 upgraded, 0 newly installed, 0 to remove and 1 not upgraded.
```

Hozircha olib tashlanadigan bog'liqlik yo'q.

### Omborlar

```text vps
$ ls /etc/apt/sources.list.d/; apt-cache policy | grep -E '^ +[0-9]+ https?://' | awk '{print $2, $3}' | sort -u
Resolute-security.sources
Resolute-updates.sources
Resolute.sources
docker.sources
nginx.list
redis.list
http://mirror.hoztnode.net/ubuntu resolute-security/main
http://mirror.hoztnode.net/ubuntu resolute-security/multiverse
http://mirror.hoztnode.net/ubuntu resolute-security/restricted
http://mirror.hoztnode.net/ubuntu resolute-security/universe
http://mirror.hoztnode.net/ubuntu resolute-updates/main
http://mirror.hoztnode.net/ubuntu resolute-updates/multiverse
http://mirror.hoztnode.net/ubuntu resolute-updates/restricted
http://mirror.hoztnode.net/ubuntu resolute-updates/universe
http://mirror.hoztnode.net/ubuntu resolute/main
http://mirror.hoztnode.net/ubuntu resolute/multiverse
http://mirror.hoztnode.net/ubuntu resolute/restricted
http://mirror.hoztnode.net/ubuntu resolute/universe
https://download.docker.com/linux/ubuntu resolute/stable
https://nginx.org/packages/mainline/ubuntu resolute/nginx
https://packages.redis.io/deb resolute/main
```

Ubuntu omborlari (provayder ko'zgusi orqali) bilan birga — **uchta uchinchi tomon ombori**: Docker, nginx.org, Redis. Ular oldingi kitoblar uchun aynan o'sha loyihalarning rasmiy hujjatlariga ko'ra qo'shilgan, GPG kalit bilan imzolangan. UB nuqtai nazaridan — har biri qo'shimcha ishonch: shu loyihalar va ularning infratuzilmasi xavfsizligiga.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Faqat `apt update` | Ro'yxat yangilanadi, paketlar emas | `apt update && apt upgrade` |
| `apt-get upgrade` bilan yadro yangilandi deb o'ylash | Yangi paket o'rnatmaydi (sinovda yadro qoldi) | `apt upgrade` yoki `apt full-upgrade` |
| "kept back" ni har doim xato deb o'ylash | Ko'pincha phased yoki yangi bog'liqlik | `apt policy` bilan sababini ko'rish |
| Phased paketni `apt install` bilan majburlash | UB tavsiya etmaydi | Kutish |
| Kerakli bo'lsa ham uchinchi tomon omborini o'ylamasdan qo'shish | Sandbox yo'q, konflikt, qo'llab-quvvatlash yo'q (UB) | Snap yoki imzo + pinning |
| Yadro yangilangach reboot'ni unutish | Eski (zaif) yadro ishlashda davom etadi (sinovda `7.0.0-42`) | 5-bob |

## Amaliyot

1. `apt update` va `apt upgrade` farqi nima?
2. `apt upgrade` va `apt-get upgrade` yangi paket o'rnatishda qanday farq qiladi?
3. Phased update nima? Xavfsizlik yangilanishlari phased bo'ladimi?
4. "packages have been kept back" ko'rsangiz nima qilasiz?
5. UB uchinchi tomon omborlarining qaysi uch xavfini aytadi?
6. Sinovda yangi yadro o'rnatilgandan keyin `uname -r` nima ko'rsatdi va nega?

<details>
<summary>Javoblar</summary>

1. `update` — paketlar ro'yxatini yangilaydi; `upgrade` — paketlarni yangilaydi.
2. `apt upgrade` kerak bo'lsa yangi paket o'rnatadi; `apt-get upgrade` hech qachon.
3. Yangilanishni bosqichma-bosqich chiqarish; xavfsizlik yangilanishlari hech qachon phased emas.
4. `apt policy` bilan sababini ko'rish; phased bo'lsa — kutish.
5. Xavfsizlik (sandbox yo'q, nashriyotchiga ishonch), tizim yaxlitligi (konfliktlar), rasmiy qo'llab-quvvatlash yo'qligi.
6. `7.0.0-42` — yangi yadro faqat qayta ishga tushirishdan keyin ishlaydi.

</details>

## Rasmiy hujjat

- [UB: Security suggestions](https://ubuntu.com/server/docs/explanation/security/security_suggestions/)
- [UB: About apt upgrade and phased updates](https://ubuntu.com/server/docs/explanation/software/about-apt-upgrade-and-phased-updates/)
- [UB: Third party repository usage](https://ubuntu.com/server/docs/explanation/software/third-party-repository-usage/)
- [UM: apt(8)](https://manpages.ubuntu.com/manpages/resolute/man8/apt.8.html) · [apt-get(8)](https://manpages.ubuntu.com/manpages/resolute/man8/apt-get.8.html)
