# 41 — Tarmoqni kim boshqaradi

[← Oldingi: IP, interfeys va marshrut](40-ip-interfeys-marshrut.md) · [Mundarija](README.md) · [Keyingi: DNS va nom aniqlash →](42-dns-va-nom-aniqlash.md)

## Tushuncha

40-bobda `ip` bilan manzil qo'shdik. Ubuntu Server hujjatiga ko'ra `ip` bilan qilingan sozlama darhol ishlaydi, lekin doimiy emas: reboot'da yo'qoladi. Doimiy sozlama faylda saqlanadi, uni yonishda o'qib interfeyslarni ko'taradigan dastur esa **tarmoq boshqaruvchisi** deb ataladi.

Debian va Ubuntu'da bunday vositalar bir nechta:

| Vosita | Sozlama qayerda | Izoh (Debian Reference 5, Ubuntu hujjati) |
| --- | --- | --- |
| ifupdown | `/etc/network/interfaces` | Debian'ga xos an'anaviy vosita; `networking.service` |
| systemd-networkd | `/etc/systemd/network/*.network` | systemd tarkibidagi tarmoq xizmati |
| NetworkManager | NetworkManager sozlamalari | Ish stoli kompyuterlari uchun (DR 5.2) |
| Netplan | `/etc/netplan/*.yaml` | Ubuntu'da tarmoq sozlamasi shu orqali yoziladi. Netplan o'zi interfeysni ko'tarmaydi: YAML'ni networkd yoki NetworkManager sozlamasiga aylantiradi |

Netplan hujjatiga ko'ra `renderer` ko'rsatilmasa, standart holatda `networkd` ishlatiladi.

Debian Reference ogohlantiradi: yangi vositalarni an'anaviy ifupdown va uning `/etc/network/interfaces` fayli bilan to'qnashmaydigan qilib sozlash kerak. Ya'ni bitta interfeysni ikki boshqaruvchi boshqarmasligi kerak.

## Serverda qaysi biri ishlayapti

Tarmoq sozlamasini o'zgartirishdan oldin qaysi vosita ishlayotganini aniqlash kerak — boshqa joyni tahrirlasangiz, o'zgarish shunchaki o'qilmaydi. VPS'da:

```text vps
$ ls /etc/netplan/
ls: cannot access '/etc/netplan/': No such file or directory
$ systemctl is-active systemd-networkd NetworkManager networking
inactive
inactive
active
$ networkctl
IDX LINK TYPE     OPERATIONAL SETUP
  1 lo   loopback -           unmanaged
  2 ens3 ether    -           unmanaged

2 links listed.
```

- `/etc/netplan` yo'q — Netplan ishlatilmaydi.
- `networking` faol — bu ifupdown'ning servisi.
- networkctl(1) bo'yicha `unmanaged` — systemd-networkd bu interfeysni boshqarmaydi.

> **VPS shabloni haqida.** Ubuntu tarmoqni Netplan bilan sozlaydi. Bizning VPS esa hosting provayderining tayyor shablonidan o'rnatilgan va unda ifupdown ishlatilgan (mundarija boshidagi izoh). Haqiqiy serverlarda bunday farq ko'p uchraydi — shuning uchun avval tekshiriladi.

## ifupdown: `/etc/network/interfaces`

```text vps
$ cat /etc/network/interfaces
# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
auto ens3
iface ens3 inet static
    address   203.0.113.10
    netmask   255.255.255.255
    gateway   10.0.0.1
    hwaddress ether 52:54:00:15:DD:4B
    dns-nameservers 2a01:230:1:1::229 2a01:230:1:1::230 188.120.247.2 188.120.247.8 82.146.59.250 185.60.132.11
```

(Ochiq IP 40-bobdagi kabi `203.0.113.10` bilan almashtirilgan.)

interfaces(5) bo'yicha:

- `auto ens3` — bu interfeys `ifup -a` bilan, jumladan yonish paytida ko'tariladi.
- `iface ens3 inet static` — `ens3` uchun sozlama: `inet` — IPv4, `static` — manzil qo'lda beriladi (`dhcp` bo'lsa, avtomatik olinadi).
- `address`, `netmask`, `gateway` — 40-bobdagi manzil (`/32` = `255.255.255.255`) va shlyuz.
- `dns-nameservers` — provayderning DNS serverlari (42-bob).

Fayl qanday o'qilganini `ifquery` ko'rsatadi. U hech narsani o'zgartirmaydi:

```text vps
$ ifquery ens3
address: 203.0.113.10
netmask: 255.255.255.255
gateway: 10.0.0.1
hwaddress: 52:54:00:15:DD:4B
dns-nameservers: 2a01:230:1:1::229 2a01:230:1:1::230 188.120.247.2 188.120.247.8 82.146.59.250 185.60.132.11
broadcast: 203.0.113.10
$ systemctl status networking --no-pager | head -n 6
● networking.service - Raise network interfaces
     Loaded: loaded (/usr/lib/systemd/system/networking.service; enabled; preset: enabled)
     Active: active (exited) since Sat 2026-11-07 08:12:50 MSK; 5h 17min ago
 Invocation: 6b8acba36e9145db9440ceaa2a730a20
       Docs: man:interfaces(5)
   Main PID: 952 (code=exited, status=0/SUCCESS)
$ systemctl list-units 'ifup@*' --no-pager
  UNIT              LOAD   ACTIVE SUB    DESCRIPTION
  ifup@ens3.service loaded active exited ifup for ens3

Legend: LOAD   → Reflects whether the unit definition was properly loaded.
        ACTIVE → The high-level unit activation state, i.e. generalization of SUB.
        SUB    → The low-level unit activation state, values depend on unit type.

1 loaded units listed. Pass --all to see loaded but inactive units, too.
To show all installed unit files use 'systemctl list-unit-files'.
```

`networking.service` yonishda interfeyslarni ko'tarib, tugaydi (`active (exited)`): bu `Type=oneshot` servis (`systemctl cat networking` da ko'rinadi, 35-bob). `ifup@ens3.service` — aynan `ens3` uchun.

## Bir xil sozlama uch formatda

Debian Reference'dagi namunalar: `192.168.0.15/24` statik manzil va `192.168.0.1` shlyuz. Bular hujjatdan olingan namunalar — bizning VPS'da bu vositalar ishlatilmaydi, shuning uchun ular unda sinalmagan.

systemd-networkd, `/etc/systemd/network/static.network` (DR 5.3):

```ini
[Match]
Name=en*

[Network]
Address=192.168.0.15/24
Gateway=192.168.0.1
```

Netplan, `/etc/netplan/50-static.yaml` (DR 5.4.2):

```yaml
network:
  version: 2
  ethernets:
    eth0:
      addresses:
        - 192.168.0.15/24
      routes:
        - to: default
          via: 192.168.0.1
```

ifupdown'da xuddi shu narsa yuqoridagi `iface ... inet static` bloki bilan yoziladi.

## Masofadan tarmoqni o'zgartirish nega xavfli

Biz serverga SSH orqali, aynan shu tarmoq interfeysi orqali ulanganmiz. Yangi sozlama xato bo'lsa (manzil, niqob yoki shlyuz noto'g'ri), server tarmoqdan uziladi. U bilan birga SSH ham uziladi, xatoni masofadan tuzatib bo'lmaydi.

Rasmiy vositalar va xavfsiz tartib:

1. **Avval faqat o'qish.** Debian Reference (5.5.2) sozlamani o'zgartirmaydigan buyruqlarni sanaydi: `ip addr show`, `ip route show`, `ip neigh`. Bu bobdagi `ifquery`, `networkctl`, `systemctl status` ham hech narsani o'zgartirmaydi.
2. **Netplan bo'lsa — `netplan try`.** Netplan hujjati: `netplan try` sozlamani qo'llaydi va foydalanuvchi uni belgilangan vaqt ichida tasdiqlamasa, avtomatik orqaga qaytaradi. Standart kutish vaqti — 120 soniya. `netplan apply` esa darhol va qaytarishsiz qo'llaydi.
3. **ifupdown'da** (bizning VPS) bunday avtomatik qaytarish ifup(8) va interfaces(5) da ko'rsatilmagan. Shuning uchun o'zgarishdan oldin provayder panelidagi konsol (tarmoqsiz kirish yo'li) tayyor turishi kerak.
4. **Vaqtinchalik sinash.** `ip` bilan qilingan o'zgarish reboot'da yo'qoladi. Demak, xato bo'lsa, provayder panelidan serverni qayta yondirish eski, doimiy sozlamani qaytaradi.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu (standart o'rnatish) | Bizning VPS (Ubuntu 26.04) |
| --- | --- | --- | --- |
| Boshqaruvchi | yo'q — trenajorda faqat `lo` | Netplan (`renderer` standart holatda networkd) | ifupdown (provayder shabloni) |
| Sozlama fayli | — | `/etc/netplan/*.yaml` | `/etc/network/interfaces` |

## Tipik xatolar

**1. Boshqa boshqaruvchining faylini tahrirlash.**
Netplan'li serverda `/etc/network/interfaces` ni o'zgartirish (yoki aksincha) hech narsa bermaydi.
To'g'risi: avval `ls /etc/netplan`, `systemctl is-active ...`, `networkctl` bilan aniqlash.

**2. Bitta interfeysni ikki vosita boshqaradi.**
Debian Reference shunday to'qnashuvdan ogohlantiradi.
To'g'risi: har interfeys faqat bitta joyda sozlanadi.

**3. `ip addr add` ni doimiy sozlama deb o'ylash.**
Reboot'dan keyin manzil yo'qoladi.
To'g'risi: doimiy sozlama — boshqaruvchining faylida.

**4. Masofadan `netplan apply`.**
Xato bo'lsa, ulanish uziladi va qaytarish yo'q.
To'g'risi: `netplan try`.

## Amaliyot

Bu bob VPS'da: trenajorda tarmoq boshqaruvchisi yo'q, shuning uchun mashq yo'q.

Savollar:

1. Serverda qaysi tarmoq boshqaruvchisi ishlayotganini qanday aniqlaysiz?
2. `/etc/network/interfaces` dagi `auto ens3` nimani bildiradi?
3. `networkctl` interfeysni `unmanaged` deb ko'rsatdi. Bu nimani anglatadi?
4. Netplan'li serverda masofadan yangi sozlamani qanday xavfsiz qo'llaysiz?
5. `ip addr add` bilan qo'shilgan manzil reboot'dan keyin qoladimi?

<details>
<summary>Javoblar</summary>

1. `ls /etc/netplan/`, `systemctl is-active systemd-networkd NetworkManager networking`, `networkctl`.
2. `ens3` yonishda (`ifup -a` bilan) avtomatik ko'tariladi.
3. systemd-networkd bu interfeysni boshqarmayapti — uni boshqa vosita boshqaradi.
4. `netplan try`: tasdiqlanmasa, 120 soniyadan keyin eski sozlamaga qaytadi.
5. Yo'q: `ip` bilan qilingan sozlama doimiy emas.

</details>

## Rasmiy hujjat

- [Ubuntu Server: About Netplan](https://ubuntu.com/server/docs/explanation/networking/about-netplan/)
- [Ubuntu Server: Configuring networks](https://ubuntu.com/server/docs/explanation/networking/configuring-networks/) — vaqtinchalik va doimiy sozlama
- [Debian Reference 5.1–5.5](https://www.debian.org/doc/manuals/debian-reference/ch05.en.html#_the_modern_network_configuration_for_cloud) — tarmoq vositalari, networkd va Netplan namunalari
- [Netplan: netplan try](https://netplan.readthedocs.io/en/stable/netplan-try/) · [Netplan YAML](https://netplan.readthedocs.io/en/stable/netplan-yaml/) — `renderer`
- [interfaces(5)](https://manpages.ubuntu.com/manpages/resolute/man5/interfaces.5.html) · [ifup(8)](https://manpages.ubuntu.com/manpages/resolute/man8/ifup.8.html)
- [networkctl(1)](https://www.freedesktop.org/software/systemd/man/latest/networkctl.html) — `unmanaged`
