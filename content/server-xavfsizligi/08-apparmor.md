# 08 — AppArmor

[Mundarija](README.md)

## Tushuncha

UB (Security suggestions): **AppArmor** tizimdagi dasturlarning kirish va imkoniyatlarini cheklash uchun **qat'iy tavsiya etiladi**. U alohida dasturlar uchun **majburiy kirish nazorati** (MAC — Mandatory Access Control) qoidalarini qo'llaydi: dastur buzilgan taqdirda ham yetkazishi mumkin bo'lgan zarar cheklanadi.

UB (AppArmor): AppArmor — Linux Security Module (LSM) amalga oshirilishi; dasturlarning imkoniyat va ruxsatlarini har dastur uchun **profil** bilan cheklaydi. Oddiy fayl huquqlariga (DAC — kim, qaysi guruh) **qo'shimcha** nazorat: root nomidan ishlayotgan dastur ham profilida ruxsat berilmagan narsani qila olmaydi. Ubuntu'da standart o'rnatilgan va yuklangan.

### Rejimlar

| Rejim | Nima (UB) |
| --- | --- |
| **complain** (o'rganish) | Profil buzilishlariga **ruxsat beriladi**, lekin jurnalga yoziladi — yangi profilni sinash va ishlab chiqish uchun |
| **enforce** (cheklash) | Profil qoidasi **majburiy**, buzilish jurnalga ham yoziladi |

### Buyruqlar

| Buyruq | Nima |
| --- | --- |
| `aa-status` (`apparmor_status`) | Profillar va ularning holati |
| `aa-complain /yo'l/dastur` | complain rejimiga |
| `aa-enforce /yo'l/dastur` | enforce rejimiga |
| `apparmor_parser -r profil` | Profilni yadroga (qayta) yuklash |
| `apparmor_parser -R profil` | Profilni yadrodan olib tashlash |
| `systemctl reload apparmor.service` | Barcha profillarni qayta yuklash |
| `aa-genprof`, `aa-logprof` | Profil yaratish va jurnal asosida yangilash |

`aa-complain`, `aa-enforce` va boshqalar — ixtiyoriy **`apparmor-utils`** paketida (UB).

### Profil

UB: profillar — `/etc/apparmor.d/` dagi matnli fayllar, nomi — dasturning to'liq yo'li, `/` o'rniga `.` (`/bin/ping` → `bin.ping`). Ikki asosiy qoida turi:

- **Yo'l qoidalari** — dastur qaysi fayllarga qanday kira oladi (`r` o'qish, `w` yozish, `ix` — shu profil ichida bajarish, `m` — xotiraga map …);
- **Imkoniyat qoidalari** (`capability net_raw,`) — qaysi imtiyozlarni ishlatishi mumkin.

`#include <abstractions/base>` — ko'p umumiy kutubxonalar, jurnalga yozish va hokazo uchun tayyor qoidalar.

### Rad etishni topish

UB: rad etishlar yadro jurnalida (`dmesg`, `journalctl -k`): `apparmor="DENIED" operation="open" profile="…" name="…" requested_mask="r" denied_mask="r"` — qaysi profil, qanday amal, nima so'raldi. Diqqat: **aniq** `deny` qoidalari jurnalga hech narsa yozmaydi.

### Profilni moslash

UB: profilni o'zgartirish (`/etc` dagi conffile — paket yangilanganda savol chiqishi mumkin); **tunables** (masalan, `tunables/home`); yoki **local** fayllar — `/etc/apparmor.d/local/` (yangilanishlarda muammo chiqarmaydi). AppArmor'ni o'chirish (24.04 dan yadro parametri `apparmor=0`) **xavfsizlikni pasaytiradi**.

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04).

### Holat

```text vps
$ aa-status 2>&1 | grep -E 'module is loaded|profiles are loaded|profiles are in (enforce|complain)|processes have profiles|processes are (in|un)' ; aa-status 2>&1 | sed -n '/processes are in enforce mode/,/processes are in complain/p' | sed '$d' | tail -n +2 | head -6
apparmor module is loaded.
179 profiles are loaded.
103 profiles are in enforce mode.
2 profiles are in complain mode.
6 processes have profiles defined.
6 processes are in enforce mode.
0 processes are in complain mode.
0 processes are in prompt mode.
0 processes are in kill mode.
0 processes are unconfined but have a profile defined.
0 processes are in mixed mode.
   /usr/sbin/chronyd (743) 
   /usr/sbin/chronyd (746) 
   /bin/registry (1333) docker-default
   /usr/sbin/nginx (1334) docker-default
   /usr/sbin/nginx (1479) docker-default
   /usr/sbin/rsyslogd (766) rsyslogd
```

- 179 profil yuklangan, 103 tasi enforce'da.
- 6 jarayon cheklangan: `chronyd`, `rsyslogd`, va Docker konteynerlaridagi jarayonlar (`docker-default` profili).
- Kuzatildi: xostdagi nginx, sshd, Redis — profilsiz (bu ro'yxatda yo'q).

### Utilitalar

```text vps
$ readlink -f /usr/bin/cat /usr/bin/head; dpkg -l apparmor apparmor-utils 2>/dev/null | awk '/^[a-z]/ {print $1, $2, $3}'
/usr/lib/cargo/bin/coreutils/cat
/usr/lib/cargo/bin/coreutils/head
ii apparmor 5.0.2-0ubuntu1~26.04.1
ii apparmor-utils 5.0.2-0ubuntu1~26.04.1
```

`apparmor-utils` (`aa-complain`, `aa-enforce`) shablonda yo'q edi — o'rnatildi. Kuzatildi: Ubuntu 26.04 da `cat`, `head` va boshqalar — `/usr/lib/cargo/bin/coreutils/` dagi fayllarga havola; AppArmor yo'l qoidasi **haqiqiy** yo'lga yoziladi.

### O'z profilimiz

Sinov skripti — `/etc/hostname` ni o'qiydi, `/etc/shadow` ni o'qishga urinadi va `/tmp` ga yozadi:

```bash
#!/bin/bash
# Sinov skripti: bitta ruxsat etilgan va bitta taqiqlanadigan fayl
echo "hostname: $(cat /etc/hostname)"
echo "shadow birinchi qator: $(head -1 /etc/shadow | cut -d: -f1)"
echo "yozildi" > /tmp/aa-sinov.txt && echo "/tmp ga yozish: ok"
```

Profilsiz, root nomidan:

```text vps
$ install -m 755 /root/aa-sinov /usr/local/bin/aa-sinov; rm /root/aa-sinov; /usr/local/bin/aa-sinov
hostname: lab
shadow birinchi qator: systemd-network
/tmp ga yozish: ok
```

Hammasi ishladi — root `/etc/shadow` ni o'qiy oladi.

```text vps
$ mv /root/usr.local.bin.aa-sinov /etc/apparmor.d/; cat /etc/apparmor.d/usr.local.bin.aa-sinov; apparmor_parser -r /etc/apparmor.d/usr.local.bin.aa-sinov; aa-status | grep aa-sinov
#include <tunables/global>

/usr/local/bin/aa-sinov {
  #include <abstractions/base>
  #include <abstractions/bash>

  /usr/local/bin/aa-sinov r,
  /usr/bin/bash ix,
  # Ubuntu 26.04: /usr/bin/cat va boshqalar -> /usr/lib/cargo/bin/coreutils/…
  /usr/lib/cargo/bin/coreutils/{cat,head,cut} ix,

  /etc/hostname r,
  /tmp/aa-sinov.txt w,
}
   /usr/local/bin/aa-sinov
```

Profilda: `bash` va uchta utilita (`ix`), `/etc/hostname` — o'qish, `/tmp/aa-sinov.txt` — yozish. `/etc/shadow` **yo'q**.

### enforce

```text vps
$ /usr/local/bin/aa-sinov; journalctl -k --since -1min --no-pager -o cat | grep 'apparmor="DENIED"' | grep 'profile="/usr/local/bin/aa-sinov"' | tail -1 | grep -oE 'apparmor="DENIED" operation="[^"]+" .*profile="[^"]+" name="[^"]+"|requested_mask="[^"]+" denied_mask="[^"]+"'
hostname: lab
head: cannot open '/etc/shadow' for reading: Permission denied
shadow birinchi qator: 
/tmp ga yozish: ok
apparmor="DENIED" operation="open" class="file" profile="/usr/local/bin/aa-sinov" name="/etc/shadow"
requested_mask="r" denied_mask="r"
```

`hostname` va `/tmp` ga yozish ishladi, `/etc/shadow` — **Permission denied**, garchi skript **root** nomidan ishlasa ham. Yadro jurnalida: `apparmor="DENIED" operation="open" profile="/usr/local/bin/aa-sinov" name="/etc/shadow"`, `requested_mask="r"`.

### complain

```text vps
$ aa-complain /usr/local/bin/aa-sinov; /usr/local/bin/aa-sinov; journalctl -k --since -1min --no-pager -o cat | grep 'apparmor="ALLOWED"' | grep shadow | tail -1 | grep -oE 'apparmor="ALLOWED" operation="[^"]+"|name="[^"]+"'
Setting /usr/local/bin/aa-sinov to complain mode.
hostname: lab
shadow birinchi qator: systemd-network
/tmp ga yozish: ok
apparmor="ALLOWED" operation="file_perm"
name="/etc/shadow"
```

complain rejimida `/etc/shadow` o'qildi, lekin jurnalda — `apparmor="ALLOWED"`: profilga nimani qo'shish kerakligini shu yozuvlardan bilib olish mumkin (`aa-logprof` ham shularni o'qiydi).

```text vps
$ aa-enforce /usr/local/bin/aa-sinov >/dev/null; apparmor_parser -R /etc/apparmor.d/usr.local.bin.aa-sinov; rm /etc/apparmor.d/usr.local.bin.aa-sinov /usr/local/bin/aa-sinov /tmp/aa-sinov.txt; aa-status | grep -c aa-sinov
0
```

Profil yadrodan olib tashlandi, fayllar o'chirildi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Muammo bo'lsa AppArmor'ni o'chirish | Xavfsizlik pasayadi (UB) | Profilni complain'ga, jurnal bo'yicha tuzatish |
| Yangi profilni darhol enforce'da | Kerakli amallar to'xtab qoladi | Avval complain, keyin enforce |
| Havola (`/usr/bin/cat`) yo'lini profilga yozish | Haqiqiy yo'l boshqa — rad etildi (sinovda) | `readlink -f` bilan haqiqiy yo'l |
| Paket profilini to'g'ridan-to'g'ri tahrirlash | Yangilanishda conffile savoli (UB) | `/etc/apparmor.d/local/` |
| Rad etish bo'lmasa — hammasi ruxsat deb o'ylash | Aniq `deny` jurnalga yozilmaydi (UB) | Profilni o'qish |
| root bo'lsa hamma narsa mumkin deb o'ylash | MAC root'ni ham cheklaydi (sinovda) | Profil bilan cheklash |

## Amaliyot

1. AppArmor oddiy fayl huquqlaridan nimasi bilan farq qiladi?
2. complain va enforce rejimlari farqi?
3. Profil fayli qayerda va qanday nomlanadi?
4. Rad etishni qayerdan topasiz va yozuvda nimalar bor?
5. Sinovda root nomidan ishlagan skript nega `/etc/shadow` ni o'qiy olmadi?
6. Yangi profil qanday tartibda joriy qilinadi?

<details>
<summary>Javoblar</summary>

1. Dastur uchun majburiy qoidalar (MAC) — foydalanuvchi va root'dan qat'i nazar.
2. complain — ruxsat beradi va yozadi; enforce — taqiqlaydi va yozadi.
3. `/etc/apparmor.d/`, dastur yo'li `/` o'rniga `.` bilan.
4. Yadro jurnalida (`journalctl -k`, `dmesg`): `apparmor="DENIED"`, amal, profil, fayl nomi, so'ralgan va rad etilgan ruxsat.
5. Profilda `/etc/shadow` ga ruxsat yo'q edi.
6. complain'da sinash → jurnal bo'yicha to'ldirish (`aa-logprof`) → enforce.

</details>

## Rasmiy hujjat

- [UB: AppArmor](https://ubuntu.com/server/docs/how-to/security/apparmor/)
- [US: AppArmor](https://documentation.ubuntu.com/security/security-features/privilege-restriction/apparmor/)
- [UB: Security suggestions](https://ubuntu.com/server/docs/explanation/security/security_suggestions/)
