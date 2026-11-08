# 05 — Qayta ishga tushirish

[Mundarija](README.md)

## Tushuncha

Paket yangilangani hali u **ishlatilayotgani**ni anglatmaydi. UB (Automatic updates):

- **Servislarni qayta ishga tushirish**: ko'p yangilanishlar to'liq reboot talab qilmaydi, lekin yangilangan fayllardan foydalanadigan servislar qayta ishga tushishi kerak. Masalan, umumiy kutubxona yangilansa, unga bog'langan har bir ishlab turgan servis xotirada **eski versiyani** ishlatishda davom etadi.
- **Qayta ishga tushirish (reboot)**: ba'zi yangilanishlar (masalan, yadro) to'liq qo'llanishi uchun tizimni qayta ishga tushirishni talab qiladi; Ubuntu'da buni bildiradigan mexanizm bor — `/var/run/reboot-required` fayli (sababi — `/var/run/reboot-required.pkgs`).

### `needrestart`

UB: `unattended-upgrades` yangilanishlardan keyin `needrestart` ni chaqiradi. Ubuntu 24.04 LTS dan u ta'sirlangan servislarni **avtomatik** qayta ishga tushiradi; lekin hammasini emas — `/etc/needrestart/needrestart.conf` da hech qachon avtomatik qayta ishga tushirilmaydiganlar ro'yxati bor.

| Sozlama | Nima |
| --- | --- |
| `$nrconf{restart}` | `'a'` — avtomatik qayta ishga tushirish, `'l'` — faqat ro'yxat (o'zingiz qilasiz) |
| `$nrconf{override_rc}` | Servis nomi → `0` — uni avtomatik qayta ishga tushirmaslik (muhim servis kutilmagan paytda o'chmasin) |

```text
$nrconf{override_rc} = {
    qr(^whatever-critical-service\.service$) => 0,
};
```

`needrestart -b` — **batch rejimi** (paket hujjati `README.batch.md`): hech narsani qayta ishga tushirmaydi, natijani skriptlar uchun chiqaradi. `NEEDRESTART-KSTA` — yadro holati: `0` — noma'lum, `1` — kutilayotgan yangilanish yo'q, `2` — ABI'ga mos yangilanish kutilmoqda, `3` — **versiya** yangilanishi kutilmoqda.

### Avtomatik reboot

UB: `unattended-upgrades` kerak bo'lsa tizimni o'zi qayta ishga tushira oladi. Reboot juda buzuvchi bo'lishi mumkin, ayniqsa tizim qaytib kelmasa:

| Sozlama | Standart | Nima |
| --- | --- | --- |
| `Unattended-Upgrade::Automatic-Reboot` | `"false"` | `true` — reboot kerak bo'lsa, yangilashdan keyin **tasdiqsiz** qayta ishga tushirish |
| `Unattended-Upgrade::Automatic-Reboot-WithUsers` | `"true"` | Tizimda foydalanuvchilar bo'lsa ham |
| `Unattended-Upgrade::Automatic-Reboot-Time` | `"now"` | Aniq vaqt (`shutdown(8)` formatida, masalan `"02:00"`) |

Livepatch (Ubuntu Pro) — yadroning yuqori va kritik zaifliklarini rebootsiz yamaydi (6-bob).

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04). 3-bobda yangi yadro o'rnatilgan edi.

### Reboot kerakmi

```text vps
$ uname -r; ls /boot/vmlinuz-*; ls -l /var/run/reboot-required* 2>&1 | awk '{print $NF}'; cat /var/run/reboot-required.pkgs
7.0.0-42-generic
/boot/vmlinuz-7.0.0-38-generic
/boot/vmlinuz-7.0.0-42-generic
/boot/vmlinuz-7.0.0-43-generic
/var/run/reboot-required
/var/run/reboot-required.pkgs
linux-image-7.0.0-43-generic
```

Ishlab turgan yadro — `7.0.0-42`, diskda `7.0.0-43` ham bor; `reboot-required` va sababi — yangi yadro paketi.

### `needrestart`

```text vps
$ dpkg -l needrestart | awk '/^ii/ {print $2, $3}'; grep -E '^\s*#?\s*\$nrconf\{restart\}' /etc/needrestart/needrestart.conf
needrestart 3.11-1ubuntu2
#$nrconf{restart} = 'i';
$ needrestart -b -r l 2>/dev/null | head -12
NEEDRESTART-VER: 3.11
NEEDRESTART-KCUR: 7.0.0-42-generic
NEEDRESTART-KEXP: 7.0.0-43-generic
NEEDRESTART-KSTA: 3
```

- `$nrconf{restart}` izohda — Ubuntu'ning standart xatti-harakati ishlaydi.
- `KCUR` — ishlab turgan, `KEXP` — kutilgan yadro, `KSTA: 3` — versiya yangilanishi kutilmoqda; qayta ishga tushirilishi kerak servislar yo'q (`SVC` qatorlari yo'q).

### Avtomatik reboot sozlamasi

```text vps
$ grep -nE 'Automatic-Reboot' /etc/apt/apt.conf.d/50unattended-upgrades | sed -E 's/^([0-9]+):/\1: /'; apt-config dump | grep -i 'Automatic-Reboot' || echo "apt-config: Automatic-Reboot o'rnatilmagan (standart false)"
94: //Unattended-Upgrade::Automatic-Reboot "false";
97: // when Unattended-Upgrade::Automatic-Reboot is set to true
98: //Unattended-Upgrade::Automatic-Reboot-WithUsers "true";
103: //Unattended-Upgrade::Automatic-Reboot-Time "02:00";
apt-config: Automatic-Reboot o'rnatilmagan (standart false)
```

Hammasi izohda — avtomatik reboot **o'chiq** (standart `false`): yadro yangilansa, server o'zi qayta ishga tushmaydi, administrator qaror qiladi.

### Qayta ishga tushirish

Kompyuterdan (VPS'ga SSH bilan):

```text tashqi
$ ssh lab "date -u +%T; systemctl reboot"
21:20:48
$ # 15 s kutib, server javob berguncha har 5 s da: ssh lab "uptime -s"
2026-11-09 00:20:59
qaytdi: 27 s
```

27 soniyada qaytdi.

```text vps
$ uname -r; uptime -s; ls /var/run/reboot-required 2>&1 | sed 's/^/tekshiruv: /'; needrestart -b -r l 2>/dev/null | grep KSTA
7.0.0-43-generic
2026-11-09 00:20:59
tekshiruv: ls: cannot access '/var/run/reboot-required': No such file or directory
NEEDRESTART-KSTA: 1
$ systemctl is-active ssh nginx redis-server docker php8.5-fpm unattended-upgrades | paste -sd' '; docker ps --format '{{.Names}} {{.Status}}'
active active active active active active
deploy-web-1 Up 17 seconds
registry Up 17 seconds
$ systemctl --failed --no-legend --plain | wc -l | sed "s/^/ishlamay qolgan unitlar: /"
ishlamay qolgan unitlar: 0
```

- Yangi yadro `7.0.0-43` ishlayapti; `reboot-required` yo'q; `KSTA: 1`.
- SSH, nginx, Redis, Docker, PHP-FPM — `active`; Docker konteynerlari o'zi qayta ko'tarildi; ishlamay qolgan unit — 0.

### Xavfsiz reboot uchun

| Oldin | Keyin |
| --- | --- |
| Muhim servislar `systemctl is-enabled` (yonganda ishga tushishi) | `uname -r` — yangi yadro |
| Provayder konsoli (SSH ishlamasa kirish uchun) | `systemctl --failed` — bo'sh |
| — | Servislar va konteynerlar `active` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Yadro yangilandi — himoyalangan deb o'ylash | Eski yadro ishlashda davom etadi (sinovda `7.0.0-42`) | Reboot yoki Livepatch |
| Kutubxona yangilandi, servislar qayta ishga tushmadi | Xotirada eski versiya (UB) | `needrestart` |
| Muhim servisni avtomatik qayta ishga tushirishga qoldirish | Kutilmagan paytda uziladi (UB) | `$nrconf{override_rc}` |
| `Automatic-Reboot "true"` ni vaqtsiz | Darhol, tasdiqsiz reboot | `Automatic-Reboot-Time` |
| Reboot'dan keyin tekshirmaslik | Biror servis ko'tarilmagan bo'lishi mumkin | `systemctl --failed`, servislar holati |
| Reboot paytida konsolsiz | Server qaytmasa kirish yo'q | Provayder konsoli tayyor |

## Amaliyot

1. Nega kutubxona yangilangach servisni qayta ishga tushirish kerak?
2. Reboot kerakligini Ubuntu qayerda bildiradi?
3. `needrestart -b` dagi `KSTA: 3` nimani anglatadi?
4. `Automatic-Reboot` standart holatda yoqilganmi?
5. Muhim servisni avtomatik qayta ishga tushirishdan qanday chiqarasiz?
6. Reboot'dan keyin nimalarni tekshirasiz?

<details>
<summary>Javoblar</summary>

1. Ishlab turgan servis xotirada eski kutubxonani ishlatadi.
2. `/var/run/reboot-required` (sababi — `.pkgs` faylida).
3. Yadroning yangi versiyasi o'rnatilgan, lekin hali ishlamayapti.
4. Yo'q — standart `false`.
5. `/etc/needrestart/needrestart.conf` da `$nrconf{override_rc}` → `0`.
6. `uname -r`, `systemctl --failed`, muhim servislar va konteynerlar holati.

</details>

## Rasmiy hujjat

- [UB: Automatic updates](https://ubuntu.com/server/docs/how-to/software/automatic-updates/) — Reboots, Service restarts
- [UM: needrestart(1)](https://manpages.ubuntu.com/manpages/resolute/man1/needrestart.1.html) · paket hujjati `/usr/share/doc/needrestart/README.batch.md`
- [UM: shutdown(8)](https://manpages.ubuntu.com/manpages/resolute/man8/shutdown.8.html)
