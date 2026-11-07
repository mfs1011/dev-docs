# 36 — Unit'ni o'zgartirish

[← Oldingi: O'z servisingiz](35-oz-servisingiz.md) · [Mundarija](README.md) · [Keyingi: Loglar: journalctl →](37-journalctl.md)

## Tushuncha

Paket bergan servisning sozlamasini o'zgartirish kerak bo'ladi: qayta ishga tushirish siyosati, xotira cheklovi, ustuvorlik, buyruq parametrlari. Eng oson yo'l — `/lib/systemd/system/` dagi unit faylini tahrirlash. Bu **xato**.

Sababi 25-bobda: paket yangilanganda conffile bo'lmagan fayllar ustidan yoziladi. `cron` paketining unit fayli conffile emas:

```text
$ dpkg -S /lib/systemd/system/cron.service
cron: /lib/systemd/system/cron.service
$ dpkg-query -W -f='${Conffiles}\n' cron
 /etc/default/cron eae0d979b5007d2af41540d8c2631359
 /etc/init.d/cron 4824366b523de668591f5b6e258c7043
 /etc/pam.d/cron 11e788a7f7cd5477b10da2c7fd5ecdf0
```

`cron.service` conffile'lar ro'yxatida yo'q — keyingi yangilanishda o'zgarishingiz jimgina yo'qoladi.

To'g'ri yo'l — **drop-in**. systemd.unit(5) ga ko'ra `foo.service` bilan birga `foo.service.d/` papkasi bo'lishi mumkin. Undagi `.conf` bilan tugaydigan fayllar alifbo tartibida, **asosiy unit faylidan keyin** o'qiladi va uning sozlamalarini o'zgartiradi yoki to'ldiradi. Asosiy faylga tegilmaydi.

| | Unit faylini tahrirlash | Drop-in |
| --- | --- | --- |
| Paket yangilansa | O'zgarish yo'qoladi | Saqlanadi |
| Nima o'zgargani ko'rinadimi | Yo'q, butun fayl | Ha — faqat o'zgargan qatorlar |
| Qaytarish | Qo'lda | `systemctl revert` |

Ubuntu'ning "Changing package files" sahifasi ham unit'larni to'g'ridan-to'g'ri tahrirlamaslikni va `systemctl edit` dan foydalanishni maslahat beradi.

## `systemctl edit`

systemctl(1) ga ko'ra `systemctl edit UNIT` unit uchun drop-in fayl yaratadi va uni muharrirda (16-bob) ochadi. Muharrir yopilgach, fayl `/etc/systemd/system/UNIT.d/override.conf` ga yoziladi va systemd uni qayta o'qiydi.

```bash
systemctl edit cron
```

Muharrirda faqat **o'zgartirmoqchi bo'lgan** qatorlarni, bo'lim sarlavhasi bilan yozasiz:

```ini
[Service]
Nice=10
```

`Nice=` (systemd.exec(5)) — servis jarayonlarining nice qiymati (31-bob).

Trenajorda muharrirsiz, xuddi shu natijani beradigan buyruqlar bilan qilamiz — drop-in papkasi va faylini o'zimiz yaratamiz:

```text
$ ps -o pid,ni,cmd -C cron
  PID  NI CMD
  151   0 /usr/sbin/cron -f
$ mkdir -p /etc/systemd/system/cron.service.d
$ printf '[Service]\nNice=10\n' > /etc/systemd/system/cron.service.d/override.conf
$ systemctl daemon-reload
$ systemctl restart cron
$ ps -o pid,ni,cmd -C cron
  PID  NI CMD
  205  10 /usr/sbin/cron -f
```

`NI` `0` dan `10` ga o'zgardi. `systemctl edit` dan farqli o'laroq, faylni qo'lda yaratganda `daemon-reload` ni o'zingiz qilasiz.

### Natijani ko'rish

```text
$ systemctl cat cron --no-pager
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

# /etc/systemd/system/cron.service.d/override.conf
[Service]
Nice=10
$ systemd-delta --type=extended --no-pager
[EXTENDED]   /usr/lib/systemd/system/cron.service → /etc/systemd/system/cron.service.d/override.conf
[EXTENDED]   /usr/lib/systemd/system/rc-local.service → /usr/lib/systemd/system/rc-local.service.d/debian.conf
[EXTENDED]   /usr/lib/systemd/system/systemd-localed.service → /usr/lib/systemd/system/systemd-localed.service.d/locale-gen.conf
[EXTENDED]   /usr/lib/systemd/system/user@.service → /usr/lib/systemd/system/user@.service.d/10-login-barrier.conf

4 overridden configuration files found.
```

- `systemctl cat` — asosiy fayl va uning ostida drop-in, ikkalasi ham `# fayl yo'li` sarlavhasi bilan. systemd nimani o'qiyotganini bir joyda ko'rasiz.
- `systemd-delta --type=extended` — qaysi unit'lar drop-in bilan kengaytirilgan.

VPS'da `systemd-delta` shuni ko'rsatadi — Ubuntu paketlarining **o'zi** ham drop-in ishlatadi:

```text vps
$ systemd-delta --type=extended --no-pager
[EXTENDED]   /etc/systemd/system/salom.service → /etc/systemd/system/salom.service.d/override.conf
[EXTENDED]   /usr/lib/systemd/system/rc-local.service → /usr/lib/systemd/system/rc-local.service.d/debian.conf
[EXTENDED]   /usr/lib/systemd/system/systemd-fsck-root.service → /usr/lib/systemd/system/systemd-fsck-root.service.d/10-skip-fsck-initramfs.conf
[EXTENDED]   /usr/lib/systemd/system/systemd-journald.service → /usr/lib/systemd/system/systemd-journald.service.d/nice.conf
[EXTENDED]   /usr/lib/systemd/system/systemd-localed.service → /usr/lib/systemd/system/systemd-localed.service.d/x11-keyboard.conf
[EXTENDED]   /usr/lib/systemd/system/systemd-logind.service → /usr/lib/systemd/system/systemd-logind.service.d/dbus.conf
[EXTENDED]   /usr/lib/systemd/system/systemd-udevd.service → /usr/lib/systemd/system/systemd-udevd.service.d/syscall-architecture.conf
[EXTENDED]   /usr/lib/systemd/system/user@.service → /usr/lib/systemd/system/user@.service.d/10-login-barrier.conf
[EXTENDED]   /usr/lib/systemd/system/user@.service → /usr/lib/systemd/system/user@.service.d/timeout.conf

9 overridden configuration files found.
```

(Birinchi qator — biz pastda yaratadigan drop-in.)

## Tuzoq: `ExecStart=` ni almashtirish

Ko'p sozlamalar drop-in'da shunchaki **almashtiriladi** (`Nice=10`). Lekin `ExecStart=` kabi ro'yxat sozlamalari **qo'shiladi**. Drop-in'da yangi `ExecStart=` yozsangiz, systemd uni ikkinchi buyruq deb qabul qiladi:

```text
$ printf '[Service]\nExecStart=/usr/sbin/cron -f -L 15\n' > /etc/systemd/system/cron.service.d/buyruq.conf
$ systemctl daemon-reload
$ systemctl restart cron
Failed to restart cron.service: Unit cron.service has a bad unit file setting.
See system logs and 'systemctl status cron.service' for details.
$ journalctl -u cron --no-pager -o cat | tail -n 2
(CRON) INFO (Skipping @reboot jobs -- not system startup)
cron.service: Service has more than one ExecStart= setting, which is only allowed for Type=oneshot services. Refusing.
```

systemd servisni ishga tushirmadi: `simple` servisda `ExecStart=` faqat bitta bo'lishi mumkin. To'g'risi — avval **bo'sh** `ExecStart=` bilan ro'yxatni tozalash, keyin yangisini yozish:

```text
$ printf '[Service]\nExecStart=\nExecStart=/usr/sbin/cron -f -L 15\n' > /etc/systemd/system/cron.service.d/buyruq.conf
$ systemctl daemon-reload
$ systemctl restart cron
$ ps -o pid,ni,cmd -C cron
  PID  NI CMD
  292  10 /usr/sbin/cron -f -L 15
```

Endi `cron -f -L 15` ishlayapti, `Nice=10` esa birinchi drop-in'dan — ikkala `.conf` ham o'qildi.

## Qaytarish: `systemctl revert`

systemctl(1) ga ko'ra `revert` unit'ning drop-in papkalarini (`/etc/systemd/system/` va `/run/systemd/system/` dagi) o'chiradi va paket bergan holatga qaytaradi:

```text
$ systemctl revert cron
Removed "/etc/systemd/system/cron.service.d/override.conf".
Removed "/etc/systemd/system/cron.service.d/buyruq.conf".
Removed "/etc/systemd/system/cron.service.d".
$ systemctl restart cron
$ ps -o pid,ni,cmd -C cron
  PID  NI CMD
  311   0 /usr/sbin/cron -f
```

## VPS'da: yana bir tuzoq

35-bobdagi `salom.service` portni `EnvironmentFile=/etc/salom.env` dan (`PORT=8000`) oladi. Portni drop-in bilan 8001 ga o'zgartirishga urinamiz. VPS'dagi systemd 259 da `systemctl edit --stdin` bor — drop-in matnini muharrirsiz, stdin'dan oladi:

```text vps
$ printf '[Service]\nEnvironment=PORT=8001\n' | systemctl edit --stdin salom
Successfully installed edited file '/etc/systemd/system/salom.service.d/override.conf'.
$ systemctl restart salom
$ ss -tlnp 'sport = :8000 or sport = :8001'
State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess                           
LISTEN 0      5          127.0.0.1:8000      0.0.0.0:*    users:(("python3",pid=1716,fd=3))
```

Port **o'zgarmadi**. Sababi 35-bobda: systemd.exec(5) ga ko'ra `EnvironmentFile=` dagi qiymatlar `Environment=` dagidan ustun. Drop-in to'g'ri o'qildi, lekin uning qiymati yutqazdi.

Bu holatda to'g'ri yo'l — sozlama faylining o'zini (`/etc/salom.env`) o'zgartirish. Drop-in bilan esa `ExecStart=` ni almashtirish mumkin:

```text vps
$ printf '[Service]\nExecStart=\nExecStart=/usr/bin/python3 -m http.server 8001 --bind 127.0.0.1\n' | systemctl edit --stdin salom
Successfully installed edited file '/etc/systemd/system/salom.service.d/override.conf'.
$ systemctl restart salom
$ ss -tlnp 'sport = :8000 or sport = :8001'
State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess                           
LISTEN 0      5          127.0.0.1:8001      0.0.0.0:*    users:(("python3",pid=1758,fd=3))
$ systemctl revert salom
Removed '/etc/systemd/system/salom.service.d/override.conf'.
Removed '/etc/systemd/system/salom.service.d'.
$ systemctl restart salom
$ ss -tlnp 'sport = :8000 or sport = :8001'
State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess                           
LISTEN 0      5          127.0.0.1:8000      0.0.0.0:*    users:(("python3",pid=1802,fd=3))
```

`systemctl edit --stdin` har safar `override.conf` ni **butunlay** almashtiradi: ikkinchi chaqiruvdan keyin unda `Environment=PORT=8001` qolmadi.

<div data-animatsiya="qadamli" data-nom="drop-in"></div>

## Butun unit'ni almashtirish

Ba'zan o'zgarish shunchalik katta bo'ladiki, drop-in emas, butun fayl kerak. Ikki yo'l bor:

- `systemctl edit --full UNIT` — systemctl(1) ga ko'ra asl unit nusxalanadi va o'sha nusxa tahrirlanadi;
- `/etc/systemd/system/` ga xuddi shu nomli fayl yozish — 33-bobdagi qoida bo'yicha u `/lib/systemd/system/` dagisidan ustun.

Debian Reference 3.8.5 dagi misol shunday: paketdagi `sshd.service` `mask` qilinadi (34-bob) va o'rniga `/etc/systemd/system/` da socket orqali ishga tushadigan yangi unit'lar yoziladi. Kamchiligi: paket unit'ni yangilasa (masalan, xavfsizlik sozlamasi qo'shsa), sizning nusxangizga bu o'tmaydi. Shuning uchun imkon bo'lsa — drop-in.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| systemd | 252 | 259 |
| `systemctl edit --stdin` | Yo'q (faqat muharrir bilan) | Bor |
| Paket unit'lari | `/lib/systemd/system/` | `/usr/lib/systemd/system/` |

## Tipik xatolar

**1. `/lib/systemd/system/` dagi faylni tahrirlash.**
Keyingi yangilanishda yo'qoladi.
To'g'risi: `systemctl edit`.

**2. Drop-in'da `ExecStart=` ni tozalamasdan yozish.**
To'g'risi: avval `ExecStart=` (bo'sh), keyin yangi qiymat.

**3. Drop-in'ni qo'lda yaratib, `daemon-reload` ni unutish.**
To'g'risi: `systemctl daemon-reload` (yoki `systemctl edit` — u o'zi qiladi), keyin `restart`.

**4. `Environment=` ni `EnvironmentFile=` dagi o'zgaruvchiga qarshi ishlatish.**
Fayldagi qiymat yutadi.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=36-dropin)** "Paket servisini sozlash": `cron` ga drop-in bilan ustuvorlik qo'yasiz, natijani tekshirasiz va asl holiga qaytarasiz.

Savollar:

1. Nega `/lib/systemd/system/cron.service` ni tahrirlash mumkin emas?
2. Drop-in fayl qayerda bo'ladi va qanday nomlanadi?
3. Drop-in'da `ExecStart=/yangi/buyruq` yozdingiz, servis ishga tushmadi. Nega?
4. Drop-in'larni qanday ko'rasiz va olib tashlaysiz?

<details>
<summary>Javoblar</summary>

1. U conffile emas: paket yangilanganda ustidan yoziladi (25-bob).
2. `/etc/systemd/system/UNIT.service.d/` da, `.conf` bilan tugaydigan nom; `systemctl edit` `override.conf` yaratadi.
3. `ExecStart=` qo'shiladigan sozlama: ikkita buyruq bo'lib qoldi. Avval bo'sh `ExecStart=` yozish kerak.
4. `systemctl cat UNIT` yoki `systemd-delta`; olib tashlash — `systemctl revert UNIT`.

</details>

## Rasmiy hujjat

- [systemd.unit(5) — drop-in papkalari](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html)
- [systemctl(1) — `edit`, `cat`, `revert`](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html)
- [systemd-delta(1)](https://www.freedesktop.org/software/systemd/man/latest/systemd-delta.html)
- [Ubuntu Server — Changing package files](https://ubuntu.com/server/docs/explanation/software/changing-package-files/)
- [Debian Reference 3.8.5](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html#_customization_example_to_tweak_sshd_service)
- Trenajorda: `man systemd.unit`, `man systemctl`, `man systemd-delta`
