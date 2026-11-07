# 44 — Vaqt va xost nomi

[← Oldingi: Port va ulanishni tekshirish](43-port-va-ulanishni-tekshirish.md) · [Mundarija](README.md) · [Keyingi: SSH bilan ulanish →](45-ssh-bilan-ulanish.md)

## Tushuncha

Serverning ikki oddiy, lekin muhim sozlamasi:

| Sozlama | Nima uchun kerak | Buyruq |
| --- | --- | --- |
| Xost nomi (hostname) | Kompyuterning nomi: taklif qatorida (prompt), loglarda, `/etc/hosts` da | `hostnamectl` |
| Vaqt va vaqt zonasi | Loglar, rejali ishlar (38-bob), sertifikatlar muddati — hammasi vaqtga tayanadi | `timedatectl` |

Debian Reference (3.8.1): xost nomini yadro saqlaydi, yonishda systemd-hostnamed uni `/etc/hostname` dan o'rnatadi. Bu faylda faqat kompyuter nomi bo'lishi kerak, to'liq domen nomi (FQDN) emas.

## Xost nomi

```text
$ hostname
trenajor
$ cat /etc/hostname
trenajor
$ hostnamectl | grep -vE 'Machine ID|Boot ID|Product UUID'
 Static hostname: trenajor
       Icon name: computer-vm
         Chassis: vm 🖴
  Virtualization: vmware
Operating System: Debian GNU/Linux 12 (bookworm)
          Kernel: Linux 6.1.0-50-686
    Architecture: x86
```

`hostnamectl` xost nomidan tashqari tizim haqida ma'lumot beradi. `grep -v` bilan uchta qatorni chiqarib tashladik: machine-id(5) bo'yicha mashina identifikatori (Machine ID) maxfiy hisoblanadi va ishonchsiz muhitda, ayniqsa tarmoqda, oshkor qilinmasligi kerak. Shuning uchun uni hech qayerga — masalan, chatga yoki qo'llanmaga — ko'chirmang.

VPS'da:

```text vps
$ hostnamectl | grep -vE 'Machine ID|Boot ID|Product UUID'
 Static hostname: lab
       Icon name: computer-vm
         Chassis: vm 🖴
  Virtualization: kvm
Operating System: Ubuntu 26.04.1 LTS
          Kernel: Linux 7.0.0-42-generic
    Architecture: x86-64
 Hardware Vendor: Red Hat
  Hardware Model: KVM
Hardware Version: RHEL 10.0.0 PC _i440FX + PIIX, 1996_
Firmware Version: unknown
   Firmware Date: Wed 2022-02-02
    Firmware Age: 4y 9month 4d
$ cat /etc/hostname
lab
```

`Virtualization: kvm` — server virtual mashina. Trenajor brauzerda ishlaydigan emulyator, `hostnamectl` uni `vmware` deb aniqlaydi.

## Nomni o'zgartirish va `/etc/hosts`

hostnamectl(1): `hostnamectl hostname NAME` tizim nomini o'zgartiradi (standart holatda "chiroyli" (pretty), statik va vaqtinchalik (transient) nomlarning hammasini). `/etc/hosts` ga esa tegmaydi:

```text
$ hostnamectl hostname server1
$ hostname
server1
$ cat /etc/hostname
server1
$ grep 127.0.1.1 /etc/hosts
127.0.1.1	trenajor
$ sudo -n true
sudo: unable to resolve host server1: Temporary failure in name resolution
```

`/etc/hostname` yangilandi, `/etc/hosts` da esa eski nom qoldi. 42-bobda ko'rganimizdek, Debian Reference (5.1.1) ga ko'ra `/etc/hosts` dagi nom `/etc/hostname` bilan mos bo'lishi kerak. Mos kelmagani uchun `sudo` endi o'z kompyuterining nomini aniqlay olmayapti. Tuzatamiz va asl nomni qaytaramiz:

```text
$ sed -i 's/trenajor/server1/' /etc/hosts
$ sudo -n true
$ hostnamectl hostname trenajor
$ sed -i 's/server1/trenajor/' /etc/hosts
```

## Vaqt va vaqt zonasi

```text
$ timedatectl
               Local time: Sat 2026-11-07 10:46:38 UTC
           Universal time: Sat 2026-11-07 10:46:38 UTC
                 RTC time: Sat 2026-11-07 10:46:39
                Time zone: Etc/UTC (UTC, +0000)
System clock synchronized: no
              NTP service: n/a
          RTC in local TZ: no
$ ls -l /etc/localtime
lrwxrwxrwx 1 root root 27 Nov  5 11:39 /etc/localtime -> /usr/share/zoneinfo/Etc/UTC
```

| Qator | Ma'nosi |
| --- | --- |
| `Local time` | Vaqt zonasi bo'yicha mahalliy vaqt |
| `Universal time` | UTC |
| `RTC time` | Kompyuterning apparat soati |
| `Time zone` | Vaqt zonasi; u `/etc/localtime` symlink'i bilan belgilanadi |
| `System clock synchronized` | Soat tarmoqdagi vaqt serveri bilan sinxronlanganmi |
| `NTP service` | Vaqtni sinxronlovchi xizmat holati (`n/a` — yo'q) |

Vaqt zonasini o'zgartirish:

```text
$ timedatectl list-timezones | grep -E 'Tashkent|Samarkand'
Asia/Samarkand
Asia/Tashkent
$ timedatectl set-timezone Asia/Tashkent
$ date
Sat Nov  7 15:46:40 +05 2026
$ ls -l /etc/localtime
lrwxrwxrwx 1 root root 35 Nov  7  2026 /etc/localtime -> ../usr/share/zoneinfo/Asia/Tashkent
$ timedatectl set-timezone Etc/UTC
```

timedatectl(1): `set-timezone` tizim vaqt zonasini o'rnatadi va `/etc/localtime` symlink'ini o'zgartiradi. Soatning o'zi o'zgarmaydi — o'sha vaqt boshqa zonada ko'rsatiladi.

## Vaqt sinxronizatsiyasi

Kompyuter soati asta-sekin chetga chiqadi. Uni tarmoqdagi vaqt serverlari bilan NTP (Network Time Protocol) orqali to'g'rilab turish kerak.

- **Debian:** Debian Reference (9.5.5) systemd tizimida `systemd-timesyncd` ni ishlatishni aytadi. Trenajorda u o'rnatilmagan va tarmoq ham yo'q — `NTP service: n/a`.
- **Ubuntu:** Ubuntu Server hujjatiga ko'ra Ubuntu 25.10 dan boshlab vaqtni standart holatda **chrony** sinxronlaydi, u systemd-timesyncd o'rnini egallagan. `timedatectl` oddiy sozlamalar (masalan, vaqt zonasi) uchun ishlaydi, chuqurroq sozlama esa `chronyc` orqali.

VPS'da:

```text vps
$ timedatectl
               Local time: Sat 2026-11-07 13:44:58 MSK
           Universal time: Sat 2026-11-07 10:44:58 UTC
                 RTC time: Sat 2026-11-07 10:44:58
                Time zone: Europe/Moscow (MSK, +0300)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
$ systemctl is-active chrony systemd-timesyncd
active
inactive
$ chronyc tracking
Reference ID    : B97DBE7A (ntp-nts-2.ps5.canonical.com)
Stratum         : 3
Ref time (UTC)  : Sat Nov 07 10:41:02 2026
System time     : 0.000413264 seconds slow of NTP time
Last offset     : -0.000163566 seconds
RMS offset      : 0.000214791 seconds
Frequency       : 21.210 ppm slow
Residual freq   : -0.001 ppm
Skew            : 0.068 ppm
Root delay      : 0.045070104 seconds
Root dispersion : 0.001153068 seconds
Update interval : 2067.3 seconds
Leap status     : Normal
$ chronyc sources
MS Name/IP address         Stratum Poll Reach LastRx Last sample               
===============================================================================
^* ntp-nts-2.ps5.canonical.>     2  10   377   236  +1492us[+1329us] +/-   25ms
^+ ntp-nts-3.ps5.canonical.>     2  10   377   194   -738us[ -738us] +/-   25ms
^- ntp-nts-2.ps6.canonical.>     2  10   377  1008  -3123us[-3283us] +/-   80ms
^- ntp-nts-3.ps6.canonical.>     2  10   377   463  -2982us[-3144us] +/-   79ms
^- ntp-nts-1.ps6.canonical.>     2  10   377  1032  -2936us[-3096us] +/-   83ms
^- 172.31.225.106                3  10   377   233  -1666us[-1666us] +/- 3313us
^? 91.207.74.34                  2  10   377   718  -4749us[-4910us] +/-   58ms
^- vlan115.dci                   3  10   377   198  -1833us[-1833us] +/- 2681us
^- time-i1.hoztnode.net          3   9   377   446  -1816us[-1978us] +/- 2088us
^- 84.252.102.35                 2  10   377   20m   -678us[ -837us] +/-   22ms
```

- `System clock synchronized: yes` — soat sinxronlangan.
- `chronyc tracking` — soat qanchalik aniq: `System time` — NTP vaqtidan farqi (bu yerda yarim millisoniyadan kam).
- `chronyc sources` — vaqt manbalari. chronyc(1) bo'yicha: `^` — server; `*` — hozir sinxronlash uchun tanlangan eng yaxshi manba; `+` — u bilan birga hisobga olinadiganlar; `-` — tanlasa bo'ladigan, lekin hozir ishlatilmayotgan; `?` — tanlab bo'lmaydigan. `Reach 377` — oxirgi sakkizta so'rovning hammasiga to'g'ri javob kelgan.

Bizning VPS vaqt zonasi — `Europe/Moscow`: bu provayder shablonining sozlamasi. Uni o'zgartirmadik, chunki oldingi boblardagi VPS chiqishlari shu zonada.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| Vaqt zonasi | `Etc/UTC` | `Europe/Moscow` (provayder) |
| Sinxronizatsiya | `systemd-timesyncd` (DR 9.5.5); trenajorda o'rnatilmagan | chrony (Ubuntu 25.10 dan standart) |
| `hostnamectl` virtualizatsiya | `vmware` (brauzer emulyatori) | `kvm` |

## Tipik xatolar

**1. Xost nomini o'zgartirib, `/etc/hosts` ni unutish.**
`sudo` va boshqa dasturlar "unable to resolve host" deb ogohlantiradi.
To'g'risi: `/etc/hosts` dagi nomni ham yangilash.

**2. `/etc/hostname` ga to'liq domen nomini yozish.**
Debian Reference: bu faylda faqat kompyuter nomi bo'ladi.

**3. Ikki vaqt xizmatini birga ishlatish.**
Ubuntu hujjati ikki vaqt xizmati to'qnashmasligini ta'kidlaydi: eski versiyadan yangilangan tizimda systemd-timesyncd faol qolsa, chrony o'chirilgan bo'ladi.
To'g'risi: bitta xizmat (`systemctl is-active chrony systemd-timesyncd`).

**4. `hostnamectl` chiqishini to'liq ulashish.**
Machine ID — maxfiy identifikator (machine-id(5)).
To'g'risi: ulashishdan oldin `grep -v` bilan chiqarib tashlash.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=44-vaqt)** "Vaqt va nom": vaqt zonasini o'zgartirasiz, xost nomini almashtirib, `sudo` ogohlantirishini `/etc/hosts` orqali tuzatasiz.

Savollar:

1. Vaqt zonasini Toshkentga qanday o'zgartirasiz va bu qaysi faylga ta'sir qiladi?
2. `timedatectl` da `System clock synchronized: no`. Nimani tekshirasiz?
3. Xost nomini o'zgartirgandan keyin `sudo` "unable to resolve host" dedi. Nima qilasiz?
4. Ubuntu 26.04 da vaqtni qaysi xizmat sinxronlaydi?
5. `chronyc sources` da `^*` belgisi nimani bildiradi?

<details>
<summary>Javoblar</summary>

1. `timedatectl set-timezone Asia/Tashkent` — `/etc/localtime` symlink'i o'zgaradi.
2. Vaqt xizmati ishlayaptimi (`NTP service`, `systemctl is-active chrony` yoki `systemd-timesyncd`) va tarmoq bormi.
3. `/etc/hosts` dagi eski nomni yangisiga almashtirish.
4. chrony.
5. Server (`^`), hozir sinxronlash uchun tanlangan eng yaxshi manba (`*`).

</details>

## Rasmiy hujjat

- [Debian Reference 3.8.1](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_the_hostname) — `/etc/hostname`
- [Debian Reference 9.5.5](https://www.debian.org/doc/manuals/debian-reference/ch09.en.html#_system_and_hardware_time) — tizim vaqti, systemd-timesyncd
- [hostnamectl(1)](https://www.freedesktop.org/software/systemd/man/latest/hostnamectl.html) · [timedatectl(1)](https://www.freedesktop.org/software/systemd/man/latest/timedatectl.html)
- [machine-id(5)](https://www.freedesktop.org/software/systemd/man/latest/machine-id.html) — nega Machine ID maxfiy
- [Ubuntu Server: About time synchronisation](https://ubuntu.com/server/docs/explanation/networking/about-time-synchronisation/) — chrony
- [chronyc(1)](https://chrony-project.org/doc/latest/chronyc.html) — `tracking`, `sources`
