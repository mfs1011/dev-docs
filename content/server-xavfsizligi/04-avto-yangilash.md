# 04 — Avtomatik yangilanishlar

[Mundarija](README.md)

## Tushuncha

UB (Automatic updates): Ubuntu xavfsizlik yangilanishlarini **foydalanuvchi aralashuvisiz** avtomatik o'rnatadi — standart o'rnatilgan **`unattended-upgrades`** paketi orqali. U yana: kerak bo'lsa tizimni qayta ishga tushira oladi (5-bob), xavfsizlikdan boshqa yangilanishlarni ham qo'llay oladi, ba'zi paketlarni avtomatik yangilashdan to'sib qo'ya oladi.

UB ogohlantiradi: tizimga yangi ombor qo'shish **uni avtomatik yangilashga qo'shmaydi**.

### Fayllar

| Fayl | Nima |
| --- | --- |
| `/etc/apt/apt.conf.d/50unattended-upgrades` | Xatti-harakat: qaysi omborlardan, qaysi paketlar to'siladi, reboot, xabar |
| `/etc/apt/apt.conf.d/20auto-upgrades` | Yoqilgan-o'chirilgani va qanchalik tez-tez |
| `/var/log/unattended-upgrades/` | Har ishga tushishning batafsil jurnali |

O'rnatilgandan keyin xavfsizlik yangilanishlari (mavjud bo'lsa ESM bilan) avtomatik o'rnatiladi; standart — **kuniga bir marta**.

### Yoqish va o'chirish

UB: `unattended-upgrades` `apt update` va `apt upgrade` ga teng ishni qiladi. `20auto-upgrades` da:

```text
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

Qiymat — kunlar soni: `1` — har kuni, `2` — har ikki kunda, `0` — o'chirilgan. Ishga tushirish — systemd taymerlari `apt-daily.timer` va `apt-daily-upgrade.timer` (tasodifiy kechikish bilan) orqali `/usr/lib/apt/apt.systemd.daily`. Mashina o'chiq bo'lib, vaqt o'tib ketgan bo'lsa — keyingi ishga tushishda darhol (taymerning `Persistent=false` bilan bu o'chiriladi).

### Qaysi omborlardan: `Allowed-Origins`

UB: standart — faqat rasmiy Ubuntu omborlari:

```text
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
//  "${distro_id}:${distro_codename}-updates";
//  "${distro_id}:${distro_codename}-proposed";
//  "${distro_id}:${distro_codename}-backports";
};
```

`//` — izoh. Xavfsizlikdan boshqa yangilanishlarni ham avtomatik o'rnatish — `-updates` qatorini ochish. Boshqa omborni qo'shish uchun uning **`Origin`** maydoni kerak — u omborning `InRelease` faylida (`apt update` dan keyin `/var/lib/apt/lists/` da). PPA uchun `Origin` — `LP-PPA-<user>-<name>`.

### Paketlarni to'sish: `Package-Blacklist`

UB: Python muntazam ifodalari ro'yxati, boshida `^` bor deb hisoblanadi: `"linux-"` — `linux-` bilan boshlanadigan hamma paket; `"libc6$"` — aynan `libc6` (`glibc6` emas). Diqqat: to'silgan paketga bog'liq boshqa yangilanishlar ham o'rnatilmay qolishi mumkin.

### Xabar

UB: `Unattended-Upgrade::Mail "user@example.com";` — hisobot yuborish (standart — yo'q); `Unattended-Upgrade::MailReport` — `always`, `only-on-error`, `on-change` (standart). Pochta yuborish uchun alohida `ssmtp` kabi mijoz sozlanadi.

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04).

### Sozlama

```text vps
$ dpkg -l unattended-upgrades | awk '/^ii/ {print $2, $3}'; cat /etc/apt/apt.conf.d/20auto-upgrades
unattended-upgrades 2.12ubuntu9
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
$ grep -vE '^\s*(//|$)' /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Allowed-Origins {
	"${distro_id}:${distro_codename}";
	"${distro_id}:${distro_codename}-security";
	"${distro_id}ESMApps:${distro_codename}-apps-security";
	"${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::Package-Blacklist {
};
Unattended-Upgrade::DevRelease "auto";
$ systemctl list-timers 'apt-daily*' --no-pager --no-legend | awk '{print $(NF-1), "keyingi:", $2, $3}'
apt-daily-upgrade.timer keyingi: 2026-11-09 06:02:17
apt-daily.timer keyingi: 2026-11-09 08:28:17
```

- Paket o'rnatilgan, har kuni ro'yxatlarni yangilash va yangilanishlarni o'rnatish yoqilgan.
- `Allowed-Origins` — standart: faqat Ubuntu (asosiy, `-security`, ESM). `-updates` o'chiq — 3-bobdagi `vim`, yadro kabi oddiy yangilanishlar avtomatik **o'rnatilmaydi**, faqat xavfsizlik yangilanishlari.
- Taymerlar: keyingi ishga tushish vaqtlari.

### Jurnal

```text vps
$ ls /var/log/unattended-upgrades/; grep -hE 'Allowed origins|Packages that will be upgraded|All upgrades installed|No packages found' /var/log/unattended-upgrades/unattended-upgrades.log | tail -4 | cut -c1-220
unattended-upgrades-dpkg.log
unattended-upgrades-shutdown.log
unattended-upgrades.log
2026-11-08 06:33:42,641 INFO Allowed origins are: o=Ubuntu,a=resolute, o=Ubuntu,a=resolute-security, o=UbuntuESMApps,a=resolute-apps-security, o=UbuntuESM,a=resolute-infra-security
2026-11-09 00:18:26,764 INFO Allowed origins are: o=Ubuntu,a=resolute, o=Ubuntu,a=resolute-security, o=UbuntuESMApps,a=resolute-apps-security, o=UbuntuESM,a=resolute-infra-security
2026-11-09 00:18:29,726 INFO No packages found that can be upgraded unattended and no pending auto-removals
2026-11-09 00:18:29,739 DEBUG upgrade result: True No packages found that can be upgraded unattended and no pending auto-removals
```

Har kuni ishlagan; shu kunlarda o'rnatiladigan xavfsizlik yangilanishi yo'q edi.

### Qaysi omborlar avtomatik yangilanmaydi

```text vps
$ for f in /var/lib/apt/lists/*InRelease; do printf '%-70s %s\n' "$(basename $f | cut -c1-68)" "$(grep -m1 '^Origin:' $f)"; done
download.docker.com_linux_ubuntu_dists_resolute_InRelease              Origin: Docker
mirror.hoztnode.net_ubuntu_dists_resolute-security_InRelease           Origin: Ubuntu
mirror.hoztnode.net_ubuntu_dists_resolute-updates_InRelease            Origin: Ubuntu
mirror.hoztnode.net_ubuntu_dists_resolute_InRelease                    Origin: Ubuntu
nginx.org_packages_mainline_ubuntu_dists_resolute_InRelease            Origin: nginx
packages.redis.io_deb_dists_resolute_InRelease                         Origin: packages.redis.io
```

Docker (`Origin: Docker`), nginx.org (`nginx`), Redis (`packages.redis.io`) — `Allowed-Origins` da yo'q: ular **avtomatik yangilanmaydi**. Ulardagi xavfsizlik tuzatishlari uchun qo'lda `apt upgrade` yoki ularni `Allowed-Origins` ga qo'shish (UB ogohlantirishini yodda tutib — 3-bob).

### To'sish va sinov ishga tushishi

```text vps
$ printf '%s\n' 'Unattended-Upgrade::Package-Blacklist {' '    "linux-";' '};' > /etc/apt/apt.conf.d/51sinov-blacklist; unattended-upgrade --dry-run --debug 2>&1 | grep -E 'Allowed origins|Initial blacklist|Packages that will be upgraded|No packages found' | cut -c1-200; rm /etc/apt/apt.conf.d/51sinov-blacklist
Allowed origins are: o=Ubuntu,a=resolute, o=Ubuntu,a=resolute-security, o=UbuntuESMApps,a=resolute-apps-security, o=UbuntuESM,a=resolute-infra-security
Initial blacklist: linux-
No packages found that can be upgraded unattended and no pending auto-removals
upgrade result: True No packages found that can be upgraded unattended and no pending auto-removals
```

Vaqtinchalik `51sinov-blacklist` fayli bilan `--dry-run --debug`: `Initial blacklist: linux-` — qoida o'qildi; o'rnatiladigan paket yo'q. Fayl o'chirildi. `--dry-run` — hech narsani o'zgartirmasdan nima qilinishini ko'rish.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Uchinchi tomon ombori ham avtomatik yangilanadi deb o'ylash | Faqat `Allowed-Origins` dagilar (UB) | `Origin` ni qo'shish yoki qo'lda yangilash |
| `-updates` ni xavfsizlik deb o'ylash | Xavfsizlik — `-security` | Ehtiyojga qarab `-updates` ni ochish |
| Keng regex bilan to'sish | Bog'liq yangilanishlar ham to'xtaydi (UB) | Aniq nom: `"libc6$"` |
| Jurnallarga qaramaslik | Xatolar sezilmaydi | `/var/log/unattended-upgrades/` yoki `Mail` |
| O'zgarishni sinamasdan kutish | Xato keyingi kuni ochiladi | `unattended-upgrade --dry-run --debug` |

## Amaliyot

1. `unattended-upgrades` qaysi ikki faylda sozlanadi va har biri nima uchun?
2. Uni qanday o'chirasiz?
3. Standart holatda qaysi omborlardan yangilanishlar avtomatik o'rnatiladi?
4. Sinovdagi VPS'da qaysi omborlar avtomatik yangilanmaydi va nega?
5. `"libc6$"` va `"libc6"` farqi?
6. O'zgartirishni darhol sinash uchun qaysi buyruq?

<details>
<summary>Javoblar</summary>

1. `50unattended-upgrades` — xatti-harakat; `20auto-upgrades` — yoqish va davriylik.
2. `20auto-upgrades` da ikkala qiymatni `"0"` qilish.
3. Ubuntu: asosiy, `-security`, ESM (`-updates` emas).
4. Docker, nginx.org, Redis — ularning `Origin` i `Allowed-Origins` da yo'q.
5. `libc6$` — faqat `libc6`; `libc6` — `libc6` bilan boshlanadigan hammasi.
6. `unattended-upgrade --dry-run --debug`.

</details>

## Rasmiy hujjat

- [UB: Automatic updates](https://ubuntu.com/server/docs/how-to/software/automatic-updates/)
- [UM: unattended-upgrade(8)](https://manpages.ubuntu.com/manpages/resolute/man8/unattended-upgrade.8.html)
