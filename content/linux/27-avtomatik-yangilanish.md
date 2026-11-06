# 27 — Avtomatik yangilanishlar

[← Oldingi: Tashqi repozitoriy](26-tashqi-repozitoriy.md) · [Mundarija](README.md)

## Tushuncha

Xavfsizlik teshigi topilib, tuzatish chiqqan kundan boshlab har bir yangilanmagan server xavf ostida. Har kuni qo'lda `apt upgrade` qilish esa unutiladi. Ubuntu buni avtomatlashtiradi.

Ubuntu hujjatiga ko'ra Ubuntu **xavfsizlik yangilanishlarini avtomatik**, foydalanuvchi aralashuvisiz o'rnatadi. Buni `unattended-upgrades` paketi qiladi va u standart holatda o'rnatilgan. Paket faqat xavfsizlik bilan cheklanmaydi: kerak bo'lsa serverni qayta yondira oladi, boshqa yangilanishlarni ham o'rnata oladi, ba'zi paketlarni chetlab o'tishi mumkin.

> Bu bob VPS'da (Ubuntu 26.04) sozlamalarni **o'qib** yozilgan, hech narsa o'zgartirilmagan. Trenajorda `unattended-upgrades` yo'q.

## Qayerda sozlanadi

| Fayl | Nima uchun |
| --- | --- |
| `/etc/apt/apt.conf.d/20auto-upgrades` | Yoqilgan/o'chirilgan va qanchalik tez-tez |
| `/etc/apt/apt.conf.d/50unattended-upgrades` | Nimani o'rnatish, nimani chetlash, qayta yondirish |
| `/var/log/unattended-upgrades/` | Har ishga tushishning logi |

```text vps
$ cat /etc/apt/apt.conf.d/20auto-upgrades
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

Ubuntu hujjatiga ko'ra bu ikki qator `apt update` va `apt upgrade` ning avtomatik nusxasi. Qiymat — kunlar: `1` — har kuni, `2` — har ikki kunda, `0` — o'chiq.

Ishni ikkita systemd timer (38-bob) boshlaydi:

```text vps
$ systemctl list-timers apt-daily.timer apt-daily-upgrade.timer --no-pager
NEXT                        LEFT LAST                          PASSED UNIT                    ACTIVATES
Sat 2026-11-07 01:09:08 MSK  11h Fri 2026-11-06 13:18:41 MSK 8min ago apt-daily.timer         apt-daily.service
Sat 2026-11-07 06:17:04 MSK  16h Fri 2026-11-06 06:15:54 MSK   7h ago apt-daily-upgrade.timer apt-daily-upgrade.service
```

- `apt-daily` — paketlar ro'yxatini yangilaydi.
- `apt-daily-upgrade` — yangilanishlarni o'rnatadi.
- Ubuntu hujjatiga ko'ra ikkalasi belgilangan vaqtda, tasodifiy kechikish bilan ishga tushadi.

Ubuntu hujjati bir nozik holatni ham aytadi: server o'chiq paytda timer vaqti o'tib ketsa, yangilanish **keyingi yonishda** darhol boshlanishi mumkin. Shunda bir muddat boshqa `apt` buyruqlari kutib turadi.

### Qaysi manbalardan

```text vps
$ grep -vE '^\s*//|^\s*$' /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Allowed-Origins {
	"${distro_id}:${distro_codename}";
	"${distro_id}:${distro_codename}-security";
	"${distro_id}ESMApps:${distro_codename}-apps-security";
	"${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::Package-Blacklist {
};
Unattended-Upgrade::DevRelease "auto";
```

`//` — izoh. Standart holatda faqat **xavfsizlik** pocket'i (`-security`) va ESM. `-updates` izohda — oddiy tuzatishlar avtomatik o'rnatilmaydi.

Ubuntu hujjatidagi muhim ogohlantirish: **tashqi repozitoriy qo'shish uni avtomatik yangilanishlarga qo'shmaydi.** 26-bobdagi PostgreSQL repo'sidan kelgan paketlar avtomatik yangilanishi uchun uning `Origin` qiymati `Allowed-Origins` ga yozilishi kerak.

### Paketni chetlash

`Package-Blacklist` ga Python regex'lari yoziladi. Ubuntu hujjatidagi misol:

```text
Unattended-Upgrade::Package-Blacklist {
    "libc6$";
    "libc-bin$";
};
```

Hujjat ogohlantiradi: chetlangan paketga bog'liq boshqa yangilanishlar ham o'rnatilmay qolishi mumkin.

Debian wiki maslahati: `50unattended-upgrades` ni o'zini emas, uning nusxasini — `52unattended-upgrades-local` ni tahrirlang. apt.conf(5) ga ko'ra `/etc/apt/apt.conf.d/` dagi fayllar nomi bo'yicha alifbo tartibida o'qiladi, shuning uchun `52...` dagi qiymat `50...` dagisidan keyin o'qiladi. Asosiy fayl paket nazoratida qoladi (25-bobdagi `.d/` yondashuvi).

## Log: nima bo'ldi

```text vps
$ tail -n 6 /var/log/unattended-upgrades/unattended-upgrades.log
2026-11-06 06:15:55,730 INFO Initial blacklist: 
2026-11-06 06:15:55,730 INFO Initial whitelist (not strict): 
2026-11-06 06:16:03,349 INFO Packages that will be upgraded: apt apt-utils bind9-dnsutils bind9-host bind9-libs ca-certificates libapt-pkg7.0 libpcre2-8-0 linux-image-virtual
2026-11-06 06:16:03,350 INFO Writing dpkg log to /var/log/unattended-upgrades/unattended-upgrades-dpkg.log
2026-11-06 06:16:22,673 WARNING package linux-image-virtual upgradable but fails to be marked for upgrade (E:Unable to correct problems, you have held broken packages.)
2026-11-06 06:17:17,718 INFO All upgrades installed
```

Bugun ertalab 06:16 da VPS o'zi 8 ta paketni yangiladi. `linux-image-virtual` — 24-bobda ko'rgan holat: mirror'da kerakli paket yo'q, shuning uchun o'tkazib yuborildi va ogohlantirish yozildi. Paketlarning batafsil o'rnatilish jarayoni — `unattended-upgrades-dpkg.log` da.

## Qayta yondirish kerakmi

Bir kunda nima bo'lganini bosqichma-bosqich ko'ring:

<div data-animatsiya="qadamli" data-nom="avto"></div>

### Yadro: `reboot-required`

Ubuntu hujjatiga ko'ra ba'zi yangilanishlar to'liq kuchga kirishi uchun qayta yondirish kerak va ular bu haqda tizimga xabar beradi. Mexanizm — `/var/run/reboot-required` fayli:

```text vps
$ ls -l /var/run/reboot-required /var/run/reboot-required.pkgs
-rw-r--r-- 1 root root  0 Nov  6 06:17 /var/run/reboot-required
-rw-r--r-- 1 root root 29 Nov  6 06:17 /var/run/reboot-required.pkgs
$ cat /var/run/reboot-required.pkgs
linux-image-7.0.0-42-generic
$ uname -r
7.0.0-38-generic
```

Diskda yangi yadro (`7.0.0-42`) bor, server esa hali eskisi (`7.0.0-38`) bilan ishlayapti. Yangi yadrodagi tuzatishlar **faqat qayta yonganda** kuchga kiradi.

`unattended-upgrades` serverni o'zi qayta yondira oladi. Ubuntu hujjatidagi sozlamalar:

| Sozlama | Standart | Ma'nosi |
| --- | --- | --- |
| `Automatic-Reboot` | `false` | `true` bo'lsa, kerak bo'lganda so'ramasdan qayta yondiradi |
| `Automatic-Reboot-WithUsers` | `true` | Tizimda foydalanuvchilar bo'lsa ham |
| `Automatic-Reboot-Time` | `now` | Qachon: masalan, `"02:00"` (shutdown(8) formati) |

VPS'da `Automatic-Reboot` izohda turibdi — ya'ni `false`. Shuning uchun server o'zi qayta yonmadi. Ubuntu hujjati ham ogohlantiradi: qayta yondirish ishni to'xtatadi, ayniqsa server qaytib yonmasa. Shuning uchun ko'pincha qayta yondirishni administrator **rejali vaqtda** qiladi.

### Servislar: `needrestart`

Ko'p yangilanish to'liq reboot talab qilmaydi, lekin yangilangan kutubxonani ishlatayotgan servislar qayta ishga tushishi kerak. Ubuntu hujjatiga ko'ra ishlab turgan servis kutubxonaning **eski versiyasini xotirada** ushlab turadi. Buni `needrestart` kuzatadi, `unattended-upgrades` uni yangilanishdan keyin chaqiradi. 24-bobda `apt install` oxirida uning chiqishini ko'rgandik.

```text vps
$ needrestart -b -r l
NEEDRESTART-VER: 3.11
NEEDRESTART-KCUR: 7.0.0-38-generic
NEEDRESTART-KEXP: 7.0.0-42-generic
NEEDRESTART-KSTA: 3
NEEDRESTART-SVC: dbus.service
NEEDRESTART-SVC: systemd-logind.service
NEEDRESTART-SVC: unattended-upgrades.service
NEEDRESTART-SESS: root @ session #25
NEEDRESTART-SESS: root @ session #3
NEEDRESTART-SESS: root @ user manager
```

- `-b` — skriptlar uchun qisqa format (batch), `-r l` — faqat ro'yxat, hech narsani qayta ishga tushirmaydi.
- `KCUR` — ishlab turgan yadro, `KEXP` — kutilgan yadro.
- `KSTA: 3` — needrestart hujjatiga (`README.batch.md`) ko'ra "yadro versiyasi yangilangan, qayta yondirish kutilmoqda".
- `SVC` — qayta ishga tushirilishi kerak bo'lgan servislar, `SESS` — eski fayllar bilan ishlayotgan sessiyalar.

Ubuntu hujjatiga ko'ra 24.04 dan beri `needrestart` kerakli servislarni **avtomatik** qayta ishga tushiradi (o'zining ro'yxatidagi istisnolardan tashqari). Muhim servis kutilmagan paytda qayta ishga tushmasligi kerak bo'lsa, `/etc/needrestart/conf.d/` ga sozlama qo'shiladi (`$nrconf{override_rc}`). 24-bobdagi `apt install` chiqishida `dbus` va `systemd-logind` "Service restarts being deferred" (qayta ishga tushirish keyinga qoldirildi) ro'yxatida edi: needrestart ularni o'zi qayta ishga tushirmadi. Ular qo'lda yoki reboot bilan yangilanadi.

## Bosqichma-bosqich yangilanish (phased updates)

24-bobda `apt upgrade` ba'zi paketlarni "kept back" qilishini ko'rdik. Ubuntu hujjatiga ko'ra bunday xabarning eng ko'p uchraydigan sababi — **phased updates**:

- Yangilanish avval kompyuterlarning kichik qismiga beriladi.
- Muammo topilmasa, ulush asta-sekin oshib, oxiri hammaga yetadi.
- Kim birinchi oladi — kompyuterning "Machine ID" si, paket nomi va versiyasidan **mahalliy** hisoblanadi; serverga hech qanday ma'lumot yuborilmaydi.
- **Xavfsizlik yangilanishlari hech qachon bosqichma-bosqich berilmaydi.**

Bosqichdagi paketni `apt policy` ko'rsatadi. Ubuntu hujjatidagi misol:

```text
libglapi-mesa:
  Installed: 22.0.5-0ubuntu0.3
  Candidate: 22.2.5-0ubuntu0.1~22.04.1
  Version table:
     22.2.5-0ubuntu0.1~22.04.1 500 (phased 20%)
        500 http://archive.ubuntu.com/ubuntu jammy-updates/main amd64 Packages
 *** 22.0.5-0ubuntu0.3 100
        100 /var/lib/dpkg/status
```

`(phased 20%)` — yangilanish hozircha kompyuterlarning 20% iga berilmoqda.

Hujjat tavsiyasi: "kept back" xabarini **e'tiborsiz qoldirish mumkin**, paket xavfsiz deb topilgach, o'zi o'rnatiladi. Phased updates'ni o'chirish mumkin, lekin shunda server buzuq yangilanishni birinchilardan bo'lib oladi.

> Bizning VPS'dagi "kept back" (`linux-image-virtual`) phased updates emas: `apt policy` da `phased` yozuvi yo'q, sabab — mirror'da paket yo'qligi (24-bob). Xabar bir xil, sabab har xil — `apt policy` va `apt-get -s install paket` bilan aniqlang.

## Avtomatik yangilanishni qachon o'chirish kerak

Ubuntu hujjati bir nechta holatni aytadi. Masalan, server yangilanmasdan, yangi tasvir (image) dan **qayta yaratiladigan** bo'lsa (bulut va konteynerlar). Hujjat ta'kidlaydi: xavf yo'qolmaydi, yangilanish faqat boshqa joyga — yangi tasvirni yig'ishga ko'chadi.

Oddiy VPS uchun xavfsizlik yangilanishlarini **yoqiq qoldiring**. Qayta yondirishni rejalashtiring.

## Debian va Ubuntu

| | Debian 12 | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `unattended-upgrades` | Ko'p hollarda o'rnatiladi, lekin o'rnatilmagan yoki o'chirilgan bo'lishi mumkin. Tekshirish: `dpkg-reconfigure unattended-upgrades` | O'rnatilgan va yoqilgan |
| `needrestart` | Alohida paket | O'rnatilgan, servislarni o'zi qayta ishga tushiradi |
| Phased updates | Yo'q (Ubuntu mexanizmi) | Bor |
| `reboot-required` | Bor | Bor |

> Debian ustunidagi `unattended-upgrades` qatori Debian'ning `UnattendedUpgrades` wiki sahifasiga tayanadi: "ko'p Debian versiyalari uni ehtiyotkor sozlamalar bilan o'rnatadi, lekin paket umuman o'rnatilmagan yoki o'chirilgan bo'lishi mumkin". Trenajorda bu paket yo'q, uni u yerda sinab bo'lmadi.

## Tipik xatolar

**1. Avtomatik yangilanish bor — demak hammasi yangi, deb o'ylash.**
Yadro va ba'zi servislar qayta yondirishsiz eski holicha ishlaydi.
Tekshirish: `/var/run/reboot-required`, `needrestart -b -r l`.

**2. Tashqi repo avtomatik yangilanadi, deb kutish.**
To'g'risi: `Allowed-Origins` ga qo'shish.

**3. Loglarni hech qachon ko'rmaslik.**
Bizning VPS'dagi `WARNING` faqat logda ko'rinadi.

**4. `Automatic-Reboot "true"` ni vaqt belgilamasdan yoqish.**
Server ish vaqtida qayta yonadi.
To'g'risi: `Automatic-Reboot-Time "02:00"` kabi rejali vaqt.

## Amaliyot

Trenajorda `unattended-upgrades` yo'q, shuning uchun bu bob uchun mashq yo'q. O'z serveringizda tekshiring:

```text vps
$ cat /etc/apt/apt.conf.d/20auto-upgrades
$ systemctl list-timers 'apt-daily*'
$ tail /var/log/unattended-upgrades/unattended-upgrades.log
$ ls /var/run/reboot-required* 2>/dev/null
$ needrestart -b -r l
```

Savollar:

1. Ubuntu'da standart holatda qaysi yangilanishlar avtomatik o'rnatiladi?
2. `20auto-upgrades` dagi `"1"` nimani bildiradi?
3. Yangi yadro o'rnatildi. U qachon ishlay boshlaydi?
4. `needrestart` nima uchun kerak?
5. `apt upgrade` "kept back" desa, nima qilish kerak?

<details>
<summary>Javoblar</summary>

1. Xavfsizlik yangilanishlari (`-security` va ESM). `-updates` standart holatda o'chiq.
2. Amal har kuni bajariladi. `0` — o'chiq.
3. Server qayta yonganda. Ungacha `/var/run/reboot-required` turadi.
4. Yangilangan kutubxonalarni eski versiyasi bilan ishlatayotgan servislarni topadi va (Ubuntu 24.04+) ularni qayta ishga tushiradi.
5. Sababini aniqlash: `apt policy paket` da `phased` bo'lsa — kutish kifoya; bo'lmasa — `apt-get -s install paket` bilan bog'liqlik muammosini ko'rish.

</details>

## Rasmiy hujjat

- [Ubuntu Server — Automatic updates](https://ubuntu.com/server/docs/how-to/software/automatic-updates/)
- [Ubuntu Server — About apt upgrade and phased updates](https://ubuntu.com/server/docs/explanation/software/about-apt-upgrade-and-phased-updates/)
- [Debian Wiki — UnattendedUpgrades](https://wiki.debian.org/UnattendedUpgrades)
- needrestart: VPS'da `/usr/share/doc/needrestart/README.batch.md`
