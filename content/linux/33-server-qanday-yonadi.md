# 33 — Server qanday yonadi

[← Oldingi: Ochiq fayllar va portlar](32-ochiq-fayllar-va-portlar.md) · [Mundarija](README.md) · [Keyingi: systemctl →](34-systemctl.md)

## Tushuncha

Debian Reference'ga ko'ra tok berilgandan to tizim ishga tayyor bo'lguncha yonish (boot) **to'rt bosqichdan** o'tadi. Har bosqich boshqaruvni keyingisiga beradi:

| Bosqich | Kim | Nima qiladi |
| --- | --- | --- |
| 1 | **Mikrodastur** (firmware): UEFI yoki eski kompyuterlarda BIOS | Yuklovchini topib ishga tushiradi |
| 2 | **Yuklovchi** (boot loader): odatda GRUB | Yadroni va initramfs'ni xotiraga yuklaydi |
| 3 | **initramfs** — xotiradagi kichik tizim | Asosiy diskni ochish uchun kerakli narsalarni tayyorlaydi (modullar, shifrlangan disk) |
| 4 | **Asosiy tizim**: yadro + **systemd** (PID 1) | Servislarni ishga tushiradi |

Server yonmay qolsa yoki sekin yonsa, qaysi bosqichda to'xtaganini bilish kerak. Yangi yadroning qachon kuchga kirishini tushunish uchun ham kerak (27-bob).

Bosqichlarni bizning VPS misolida bosqichma-bosqich ko'ring:

<div data-animatsiya="qadamli" data-nom="yonish"></div>

## 1–3-bosqichlar: VPS'da

VPS'da hammasini haqiqiy ma'lumot bilan ko'ramiz.

**Mikrodastur.** `/sys/firmware/efi` papkasi bo'lsa — tizim UEFI orqali yongan:

```text vps
$ [ -d /sys/firmware/efi ] && echo UEFI || echo "BIOS (legacy)"
UEFI
```

**Yuklovchi va yadro.** GRUB, yadro fayllari va initramfs `/boot` da turadi:

```text vps
$ dpkg -l 'grub*' | grep ^ii | head -n 1
ii  grub-efi-amd64          2.14-2ubuntu1       amd64        GRand Unified Bootloader, version 2 (EFI-AMD64 version)
$ ls /boot
System.map-7.0.0-38-generic
System.map-7.0.0-42-generic
config-7.0.0-38-generic
config-7.0.0-42-generic
efi
grub
initrd.img
initrd.img-7.0.0-38-generic
initrd.img-7.0.0-42-generic
initrd.img.old
mbrid
vmlinuz
vmlinuz-7.0.0-38-generic
vmlinuz-7.0.0-42-generic
vmlinuz.old
```

- `vmlinuz-...` — yadro, `initrd.img-...` — uning initramfs'i. Har yadro versiyasi uchun juft.
- Diskda **ikki** yadro turibdi: `7.0.0-38` va `7.0.0-42`. Qisqa nomlar — havolalar:

```text vps
$ ls -l /boot/vmlinuz /boot/vmlinuz.old
lrwxrwxrwx 1 root root 24 Nov  6 06:16 /boot/vmlinuz -> vmlinuz-7.0.0-42-generic
lrwxrwxrwx 1 root root 24 Oct 28 11:30 /boot/vmlinuz.old -> vmlinuz-7.0.0-38-generic
```

`vmlinuz` — eng yangi yadro (27-bobda avtomatik yangilanish o'rnatgan), `vmlinuz.old` — oldingisi.

Debian Reference'ga ko'ra GRUB menyu fayli paketlar tomonidan boshqariladi va uni to'g'ridan-to'g'ri tahrirlash tavsiya etilmaydi. Sozlamalar `/etc/default/grub` va `/etc/grub.d/` da.

GRUB yadroga qanday parametrlar berganini yadroning o'zi aytadi:

```text vps
$ cat /proc/cmdline
BOOT_IMAGE=/boot/vmlinuz-7.0.0-38-generic root=UUID=caaa98a8-869e-4008-a15d-d75d96af40f7 ro console=tty1
```

`root=UUID=...` — asosiy fayl tizimi qaysi diskda (10-bob), `ro` — avval faqat o'qish uchun ulanadi.

### Qayta yondirish: yangi yadro kuchga kiradi

27-bobda VPS'da yangi yadro o'rnatilgan, lekin server eski yadro bilan ishlayotgan edi (`reboot-required`). Yuqoridagi chiqishlar o'sha paytdagisi: `/proc/cmdline` da `7.0.0-38`. Serverni qayta yondiramiz:

```text vps
$ uname -r
7.0.0-38-generic
$ systemctl reboot
```

22 soniyadan keyin SSH qaytdi:

```text vps
$ uname -r
7.0.0-42-generic
$ ls -l /var/run/reboot-required
ls: cannot access '/var/run/reboot-required': No such file or directory
$ journalctl --list-boots --no-pager | tail -n 3
 -2 a17687b2836c48f8ac96e632bda2883a Thu 2026-11-05 09:23:12 MSK Thu 2026-11-05 09:23:26 MSK
 -1 5696aa17a19c471e9d7e90a4f971421d Thu 2026-11-05 09:23:39 MSK Sat 2026-11-07 07:55:19 MSK
  0 96e10938625744ea90ff7738e3344506 Sat 2026-11-07 07:55:31 MSK Sat 2026-11-07 07:55:46 MSK
```

- Yangi yadro ishlayapti, `reboot-required` yo'qoldi.
- `journalctl --list-boots` — jurnaldagi yonishlar: `0` — joriy, `-1` — oldingisi. Har birining loglarini alohida ko'rish mumkin (`journalctl -b -1`, 37-bob).

## 4-bosqich: systemd

Debian Reference'ga ko'ra 4-bosqichda init PID 1 bo'lib ishga tushadi va Debian 8 dan beri bu — **systemd** (28-bobda `/proc/1/exe` ni ko'rgandik). systemd servislarni eski SysV skriptlari o'rniga **deklarativ unit fayllar** bo'yicha, parallel ishga tushiradi. Har jarayon o'z boshqaruv guruhida (cgroup) ishlaydi — 29 va 31-boblarda shu guruhlar ustida ishladik.

Yonish qancha vaqt olgani:

```text vps
$ systemd-analyze
Startup finished in 1.408s (kernel) + 2.882s (initrd) + 6.857s (userspace) = 11.148s 
multi-user.target reached after 6.784s in userspace.
```

Uch bosqich alohida: yadro, initramfs (`initrd`) va systemd ishga tushirgan hamma narsa (`userspace`).

Qaysi unit ko'p vaqt oldi (`blame`) va maqsadga yetish yo'lidagi eng uzun zanjir (`critical-chain`):

```text vps
$ systemd-analyze blame --no-pager | head -n 5
6.387s dev-rfkill.device
6.386s sys-devices-virtual-misc-rfkill.device
5.510s dev-vport2p1.device
5.510s dev-virtio\x2dports-org.qemu.guest_agent.0.device
5.510s sys-devices-pci0000:00-0000:00:04.0-virtio2-virtio\x2dports-vport2p1.device
$ systemd-analyze critical-chain --no-pager
The time when unit became active or started is printed after the "@" character.
The time the unit took to start is printed after the "+" character.

multi-user.target @6.784s
└─tuned.service @6.062s +720ms
  └─polkit.service @6.732s +123ms
    └─basic.target @4.110s
      └─sockets.target @4.107s
        └─systemd-logind-varlink.socket @4.106s +53us
          └─sysinit.target @4.045s
            └─apparmor.service @2.465s +1.575s
              └─local-fs.target @2.453s
                └─boot-efi.mount @2.391s +59ms
                  └─dev-vda2.device
```

`blame` dagi narsalar parallel ishlaydi, shuning uchun ularning yig'indisi umumiy vaqtga teng emas. Sekin yonishni tekshirganda `critical-chain` muhimroq: `@` — unit qachon tayyor bo'lgani, `+` — o'zi qancha vaqt olgani.

Trenajorda boshqacha:

```text
$ ls -d /sys/firmware/efi 2>/dev/null || echo "EFI yo'q: BIOS"
EFI yo'q: BIOS
$ systemd-analyze
Startup finished in 6.079s (kernel) + 16.463s (userspace) = 22.542s 
graphical.target reached after 16.155s in userspace.
```

Trenajor brauzerdagi emulyatorda BIOS orqali yonadi, yadroni esa GRUB'siz, emulyatorning o'zi yuklaydi. Shuning uchun `initrd` bosqichi yo'q. `systemd-analyze` trenajorda birinchi marta 10–15 soniya o'ylab turishi mumkin — kuting.

## Unit nima

**Unit** — systemd boshqaradigan narsa: servis, port, papka ulanishi, taymer va hokazo. systemd.unit(5) ga ko'ra unit — ini uslubidagi oddiy matn fayli. Turi fayl nomining oxiridan bilinadi:

| Tur | Nima | Misol |
| --- | --- | --- |
| `.service` | Dastur yoki servis | `cron.service`, `ssh.service` |
| `.socket` | Port yoki soket; ulanish kelganda servisni ishga tushiradi | `ssh.socket` (32-bob) |
| `.target` | Unit'lar guruhi, "holat" | `multi-user.target` |
| `.timer` | Rejali ish (38-bob) | `apt-daily.timer` (27-bob) |
| `.mount` | Fayl tizimini ulash (10-bob) | `tmp.mount`, `boot-efi.mount` |
| `.path` | Fayl yoki papka o'zgarishini kuzatish | |
| `.slice` | Resurs guruhi (39-bob) | `system.slice` |
| `.device`, `.swap`, `.automount`, `.scope` | Qurilma, swap, talab bo'yicha ulanish, tashqaridan yaratilgan jarayonlar guruhi | `dev-zram0.device` |

Trenajorda paketlar o'rnatgan unit fayllari qaysi turdan nechta:

```text
$ systemctl --version | head -n 1
systemd 252 (252.39-1~deb12u2)
$ find /lib/systemd/system -maxdepth 1 -type f | sed -n 's/.*\.\([a-z]*\)$/\1/p' | sort | uniq -c | sort -rn
     87 service
     64 target
     13 socket
      7 timer
      7 mount
      3 slice
      2 path
      1 automount
```

> Bu yerda `systemctl list-unit-files` ishlatmadik: brauzerdagi trenajorda u barcha unit fayllarini o'qib chiqishga ulgurmay, `Connection timed out` bilan tugaydi — fayllar brauzerga serverdan bittalab yuklanadi. Haqiqiy serverda unit fayllari ro'yxati `systemctl list-unit-files` bilan ko'riladi.

### Unit fayli qanday ko'rinadi

```text
$ systemctl cat cron.service --no-pager
# /lib/systemd/system/cron.service
[Unit]
Description=Regular background program processing daemon
Documentation=man:cron(8)
After=remote-fs.target nss-user-lookup.target

[Service]
EnvironmentFile=-/etc/default/cron
ExecStart=/usr/sbin/cron -f $EXTRA_OPTS
IgnoreSIGPIPE=false
KillMode=process
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

| Bo'lim | Nima uchun |
| --- | --- |
| `[Unit]` | Tavsif, hujjat, tartib (`After=`) — har qanday unit turida bor |
| `[Service]` | Faqat servisda: nimani ishga tushirish (`ExecStart=`), qayta ishga tushirish (`Restart=`) |
| `[Install]` | `systemctl enable` nima qiladi: `WantedBy=multi-user.target` — "multi-user.target ishga tushganda meni ham ishga tushir" (34-bob) |

Debian Reference'ga ko'ra bog'liqliklar `Wants=`, `Requires=`, `Before=`, `After=` kabi qatorlar bilan yoziladi. O'z servisingizni yozish — 35-bobda.

### Unit fayllari qayerda

Debian Reference'ga ko'ra unit fayllari uch joydan qidiriladi, **yuqoridagisi ustun**:

| Joy | Kimniki |
| --- | --- |
| `/etc/systemd/system/` | Administrator (siz) |
| `/run/systemd/system/` | Ish vaqtida yaratilganlar (masalan, `systemd-run`) |
| `/lib/systemd/system/` (Ubuntu'da `/usr/lib/systemd/system/`) | Paketlar |

Paket bergan unit'ni `/lib` da tahrirlamang: yangilanishda ustidan yoziladi. O'zgartirish yo'li — 36-bobda.

## Target'lar

**Target** — unit'lar guruhi. Debian Reference'ga ko'ra yonishda `default.target` ishga tushiriladi. Asosiylari:

| Target | Ma'nosi |
| --- | --- |
| `multi-user.target` | Grafikasiz, ko'p foydalanuvchili tizim — server uchun |
| `graphical.target` | `multi-user` + grafik interfeys |
| `rescue.target` | Bitta foydalanuvchi, tiklash rejimi |

Debian Reference ogohlantiradi: eski runlevel 2, 3 va 4 ning hammasi bitta `multi-user.target` ga havola.

```text
$ systemctl get-default
graphical.target
$ systemctl list-dependencies multi-user.target --no-pager | head -n 12
multi-user.target
● ├─cron.service
● ├─dbus.service
○ ├─e2scrub_reap.service
● ├─systemd-ask-password-wall.path
● ├─systemd-logind.service
○ ├─systemd-update-utmp-runlevel.service
● ├─systemd-user-sessions.service
● ├─basic.target
● │ ├─tmp.mount
● │ ├─paths.target
● │ ├─slices.target
```

`list-dependencies` — target ishga tushganda nima ishga tushishi. `●` — hozir faol, `○` — faol emas.

Trenajorda standart target — `graphical.target`, garchi grafik interfeys o'rnatilmagan bo'lsa ham. Bu paket bergan sozlama:

```text
$ ls -l /lib/systemd/system/default.target
lrwxrwxrwx 1 root root 16 Apr 27  2026 /lib/systemd/system/default.target -> graphical.target
```

VPS'da esa:

```text vps
$ systemctl get-default
multi-user.target
$ ls -l /etc/systemd/system/default.target /usr/lib/systemd/system/default.target
lrwxrwxrwx 1 root root 41 Oct 28 11:31 /etc/systemd/system/default.target -> /usr/lib/systemd/system/multi-user.target
lrwxrwxrwx 1 root root 16 Sep 16 17:55 /usr/lib/systemd/system/default.target -> graphical.target
```

Paket `default.target` ni `graphical.target` ga yo'naltirgan, lekin `/etc/systemd/system/` dagi havola **ustun** turadi va `multi-user.target` ni tanlaydi. Yuqoridagi "joylar ustunligi" qoidasining haqiqiy namunasi. Bu havolani `systemctl set-default multi-user.target` yaratadi.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| Mikrodastur | BIOS (emulyator) | UEFI |
| Yuklovchi | Yo'q (emulyator yadroni o'zi yuklaydi) | GRUB 2.14 (EFI) |
| initramfs | Yo'q | Bor |
| systemd | 252 | 259 |
| `default.target` | `graphical.target` | `multi-user.target` |
| Paket unit'lari | `/lib/systemd/system/` | `/usr/lib/systemd/system/` |

## Tipik xatolar

**1. Yadro yangilanganidan keyin qayta yondirmaslik.**
Yangi yadro diskda turadi, server eski yadro bilan ishlayveradi (27-bob).
Tekshirish: `uname -r` va `/var/run/reboot-required`.

**2. `/lib/systemd/system/` dagi unit'ni tahrirlash.**
Paket yangilanganda o'zgarish yo'qoladi.
To'g'risi: `systemctl edit` (36-bob).

**3. `systemd-analyze blame` dagi eng uzun qatorni "aybdor" deb bilish.**
Unit'lar parallel ishlaydi.
To'g'risi: `critical-chain`.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=33-yonish)** "Unit'lar xaritasi": yonish vaqtini, standart target'ni, unit fayl ichini va bog'liqliklarni ko'rasiz.

Savollar:

1. Yonishning to'rt bosqichi qaysilar?
2. Server qaysi yadro bilan ishlayotganini va qaysi yadrolar o'rnatilganini qanday bilasiz?
3. `/etc/systemd/system/` va `/lib/systemd/system/` da bir xil nomli unit bo'lsa, qaysi biri ishlaydi?
4. Server uchun qaysi target to'g'ri?
5. Server sekin yonyapti. Qaysi buyruqdan boshlaysiz?

<details>
<summary>Javoblar</summary>

1. Mikrodastur (UEFI/BIOS) → yuklovchi (GRUB) → initramfs → yadro va systemd.
2. `uname -r` — ishlayotgani, `ls /boot` (yoki `dpkg -l 'linux-image*'`) — o'rnatilganlar.
3. `/etc/systemd/system/` dagisi.
4. `multi-user.target`.
5. `systemd-analyze`, keyin `systemd-analyze critical-chain`.

</details>

## Rasmiy hujjat

- [Debian Reference 3.1 — An overview of the boot strap process](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_an_overview_of_the_boot_strap_process)
- [Debian Reference 3.3 — Systemd](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_systemd)
- [systemd.unit(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html)
- [systemd.special(7) — target'lar](https://www.freedesktop.org/software/systemd/man/latest/systemd.special.html)
- [systemd-analyze(1)](https://www.freedesktop.org/software/systemd/man/latest/systemd-analyze.html)
- Trenajorda: `man systemd.unit`, `man systemd-analyze`, `man bootup`
