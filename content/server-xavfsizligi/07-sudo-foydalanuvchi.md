# 07 — Root emas, sudo foydalanuvchi

[Mundarija](README.md)

## Tushuncha

UB (Security suggestions): **eng kam huquq tamoyili** (principle of least privilege) — iloji boricha kam huquqli, root bo'lmagan foydalanuvchilar; `sudo` (root huquqi) faqat boshqaruv vazifalari uchun.

UB (User management): foydalanuvchi va huquqlarni yomon boshqarish ko'pincha tizim buzilishiga olib keladi.

### Root qayerda

UB: Ubuntu'da administrator `root` hisobi standart holatda **o'chirilgan** — o'chirib tashlanmagan, lekin unga hech qanday parolga mos kelmaydigan xesh berilgan. Boshqaruv uchun **`sudo`**: ruxsat berilgan foydalanuvchi root parolini bilmasdan, **o'z** paroli bilan vaqtincha huquqini oshiradi. O'rnatuvchi yaratgan birinchi foydalanuvchi `sudo` guruhida; boshqasiga to'liq root huquqini berish — `sudo` guruhiga qo'shish.

| Buyruq (UB) | Nima |
| --- | --- |
| `sudo adduser username` | Foydalanuvchi qo'shish |
| `sudo adduser username sudo` | `sudo` guruhiga qo'shish |
| `sudo deluser username` | O'chirish (uy papkasi qoladi) |
| `sudo passwd -l username` / `-u` | Parolni bloklash / ochish |
| `sudo passwd -l root` | Root parolini o'chirish |

### `sudo-rs`

UB: Ubuntu 25.10 dan `sudo` — **`sudo-rs`** paketidan (Rust'da yozilgan). Asl `sudo` bilan 100% mos emas, lekin ko'p holatlarda farq sezilmaydi. Asl `sudo` 26.04 LTS da ham bor — `.ws` qo'shimchasi bilan (`sudo.ws`, `visudo.ws`); unga qaytish (`update-alternatives --set sudo /usr/bin/sudo.ws`) tavsiya etilmaydi.

### Uy papkasi huquqlari

UB: yangi foydalanuvchining uy papkasi standart **`0750`** (`drwxr-x---`) — faqat egasi va guruhi kira oladi. Eskiroq standart `0755` edi — hamma ko'ra olardi. Barcha yangi foydalanuvchilar uchun — `/etc/adduser.conf` dagi `DIR_MODE`.

### Parol siyosati

UB: kuchli parol siyosati — xavfsizlikning eng muhim jihatlaridan biri; ko'p muvaffaqiyatli buzilishlar zaif parollarga qarshi oddiy **parol terish** (brute force) va **lug'at** hujumlaridan.

- Minimal uzunlik: standart 6 belgi va oddiy entropiya tekshiruvi — `/etc/pam.d/common-password` (`pam_unix.so … minlen=8`). Bu qoidalar `sudo` bilan foydalanuvchi yaratayotgan administratorga qo'llanmaydi.
- Muddat: `sudo chage -l username` (holat), `sudo chage -E … -m 5 -M 90 -I 30 -W 14 username`.

**Muhim** (UB): parolni bloklash yoki o'chirish foydalanuvchining **SSH kaliti** bilan kirishini **to'xtatmaydi**. Kirishni butunlay to'xtatish — `.ssh/` papkasini olib tashlash yoki nomini o'zgartirish va ochiq sessiyalarni `pkill`. SSH'ga faqat kerakli foydalanuvchilar — `AllowGroups` (9-bob).

## Ko'rib chiqamiz

VPS'da (Ubuntu 26.04). 2-bobda topilgan: kirish qobig'i bor yagona foydalanuvchi — root, `sudo` guruhi bo'sh.

### `sudo` va root holati

```text vps
$ sudo --version | head -1; update-alternatives --display sudo | head -3; ls /usr/bin/sudo.ws
sudo-rs 0.2.13-0ubuntu1.2
sudo - auto mode
  link best version is /usr/lib/cargo/bin/sudo
  link currently points to /usr/lib/cargo/bin/sudo
/usr/bin/sudo.ws
$ passwd -S root | awk '{print $1, $2, $3}'; grep -E '^root:' /etc/shadow | cut -d: -f2 | cut -c1-3
root P 2026-11-05
$y$
```

- `sudo` — `sudo-rs` 0.2.13 (`update-alternatives` bo'yicha), `sudo.ws` ham o'rnatilgan.
- Kuzatildi: provayder shablonida root'ning **paroli bor** (`P`, `yescrypt` xeshi `$y$`) — Ubuntu standartidan farqli; 2-bobdagi `PasswordAuthentication yes` va `PermitRootLogin yes` bilan birga — parol terish hujumlarining nishoni.

### Admin foydalanuvchi

```text vps
$ adduser --disabled-password --comment "" boshqaruv 2>&1 | grep -vE '^\s*$'; adduser boshqaruv sudo 2>&1 | tail -1; id boshqaruv; ls -ld /home/boshqaruv | awk '{print $1, $3, $4, $NF}'; grep -E '^DIR_MODE' /etc/adduser.conf
usermod: no changes
uid=1000(boshqaruv) gid=1000(boshqaruv) groups=1000(boshqaruv),27(sudo),100(users)
drwxr-x--- boshqaruv boshqaruv /home/boshqaruv
```

`--disabled-password` — hozircha parolsiz; `sudo` guruhiga qo'shildi; uy papkasi — `drwxr-x---` (UB'dagi `0750` standart).

`sudo` o'z parolini so'raydi — tasodifiy uzun parol berildi va faqat root o'qiy oladigan faylga yozildi (ekranda ko'rsatilmaydi):

```text vps
$ p=$(head -c 24 /dev/urandom | base64 | tr -d '/+=' | cut -c1-28); echo "boshqaruv:$p" | chpasswd; umask 077; echo "$p" > /root/boshqaruv-parol; ls -l /root/boshqaruv-parol | awk '{print $1, $3, $NF}'; passwd -S boshqaruv | awk '{print $1, $2}'
-rw------- root /root/boshqaruv-parol
boshqaruv P
```

SSH bilan kirish uchun root'ning kalitlari yangi foydalanuvchiga nusxalandi (huquqlar: `.ssh` — `700`, `authorized_keys` — `600`):

```text vps
$ install -d -m 700 -o boshqaruv -g boshqaruv /home/boshqaruv/.ssh; install -m 600 -o boshqaruv -g boshqaruv /root/.ssh/authorized_keys /home/boshqaruv/.ssh/authorized_keys; ls -la /home/boshqaruv/.ssh | awk 'NR>1 {print $1, $3, $NF}'
drwx------ boshqaruv .
drwxr-x--- boshqaruv ..
-rw------- boshqaruv authorized_keys
```

### Sinov: kompyuterdan yangi foydalanuvchi bilan

```text tashqi
$ ssh -o User=boshqaruv lab "whoami; id -nG; sudo -n true"
boshqaruv
boshqaruv sudo users
sudo: interactive authentication is required
$ ssh -o User=boshqaruv lab "sudo -S -p \"\" whoami" < parol

root
$ ssh -o User=boshqaruv lab "cat /etc/shadow"
cat: /etc/shadow: Permission denied
```

- Kalit bilan kirdi; guruhlar — `sudo` bor.
- `sudo -n` (parolsiz) — rad: `sudo` **o'z paroli**ni talab qiladi.
- Parol bilan — `root` sifatida bajarildi.
- `sudo` siz `/etc/shadow` — `Permission denied`: oddiy foydalanuvchi huquqi bilan ishlaydi, faqat kerak bo'lganda root.

```text vps
$ journalctl -t sudo --since -10min --no-pager -o cat | grep boshqaruv | sed -E 's/TTY=[^ ]+ ; //'
pam_unix(sudo:session): session opened for user root(uid=0) by boshqaruv(uid=1000)
boshqaruv :  PWD=/home/boshqaruv ; USER=root ; COMMAND=/usr/bin/whoami
```

Har `sudo` — jurnalda: kim, qaysi papkadan, qaysi buyruq.

### Parol siyosati

```text vps
$ grep -E '^password\s.*pam_unix' /etc/pam.d/common-password; chage -l boshqaruv | head -5
password	[success=1 default=ignore]	pam_unix.so obscure yescrypt
Last password change					: Nov 08, 2026
Password expires					: never
Password inactive					: never
Account expires						: never
Minimum number of days between password change		: 0
```

`pam_unix.so obscure yescrypt` — `minlen` yo'q (standart 6), xesh — yescrypt; parol muddati — cheksiz.

### Hali qilinmagan

Root parolini o'chirish (`passwd -l root`) va root'ning SSH bilan kirishini taqiqlash — 9–10-boblarda, yangi foydalanuvchi bilan kirish va `sudo` ishlashi tasdiqlangandan keyin (yuqorida tasdiqlandi) va provayder konsoli tayyor turganda. UB eslatmasi: `passwd -l` SSH **kalit** bilan kirishni to'xtatmaydi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Hamma ish root bilan | Eng kam huquq tamoyiliga zid (UB) | Oddiy foydalanuvchi + `sudo` |
| Root kirishini o'chirib, keyin yangi foydalanuvchini sinash | Serverga kirib bo'lmay qolishi mumkin | Avval yangi foydalanuvchi bilan kirish va `sudo` ni sinash |
| `passwd -l` bilan foydalanuvchi bloklandi deb o'ylash | SSH kalit bilan kira oladi (UB) | `.ssh/` ni olib tashlash, sessiyalarni `pkill` |
| `sudo` uchun `NOPASSWD` hamma buyruqqa | Hisob buzilsa — darhol root | `sudo` o'z paroli bilan |
| `authorized_keys` ni hamma o'qiy oladigan qilish | sshd rad etishi yoki oshkor bo'lishi | `.ssh` — 700, fayl — 600 |
| Uy papkalari `0755` | Boshqalar fayllarni ko'radi (UB) | `0750`, `DIR_MODE` |

## Amaliyot

1. Ubuntu'da root standart holatda qanday holatda?
2. `sudo` root parolini so'raydimi?
3. Ubuntu 26.04 da `sudo` qaysi paketdan? Asl `sudo` qayerda?
4. Foydalanuvchini `sudo` guruhiga qanday qo'shasiz?
5. `passwd -l` bilan bloklangan foydalanuvchi SSH bilan kira oladimi?
6. Sinovda VPS'da root haqida nima kuzatildi?

<details>
<summary>Javoblar</summary>

1. O'chirilgan: hech qanday parolga mos kelmaydigan xesh (o'chirib tashlanmagan).
2. Yo'q — foydalanuvchining o'z parolini.
3. `sudo-rs`; asl — `sudo.ws`.
4. `sudo adduser username sudo`.
5. Ha, SSH kaliti bo'lsa (UB).
6. Root'da parol bor va SSH root hamda parol bilan kirishga ruxsat beradi — Ubuntu standartidan farqli.

</details>

## Rasmiy hujjat

- [UB: User management](https://ubuntu.com/server/docs/how-to/security/user-management/)
- [UB: Security suggestions](https://ubuntu.com/server/docs/explanation/security/security_suggestions/)
- [UM: sudo-rs(8)](https://manpages.ubuntu.com/manpages/resolute/man8/sudo-rs.8.html) · [chage(1)](https://manpages.ubuntu.com/manpages/resolute/man1/chage.1.html)
