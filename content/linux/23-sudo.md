# 23 — sudo

[← Oldingi: Foydalanuvchi va guruh](22-foydalanuvchi-va-guruh.md) · [Mundarija](README.md)

## Tushuncha

Debian Reference'ga ko'ra root (superuser) fayl ruxsatlaridan qat'i nazar istalgan faylni o'qiy, yoza va o'chira oladi. Shuning uchun serverda doim root bo'lib ishlash xavfli: bitta xato buyruq hammasini buzadi.

Odatiy yo'l — oddiy foydalanuvchi bo'lib ishlash va faqat kerak paytda root huquqini olish. Buning ikki usuli bor:

| | `su` | `sudo` |
| --- | --- | --- |
| Nima qiladi | Boshqa foydalanuvchiga (odatda root'ga) o'tadi | Bitta buyruqni boshqa foydalanuvchi nomidan bajaradi |
| Kimning paroli | **O'tilayotgan** foydalanuvchiniki (root paroli) | **O'zingizniki** |
| Nimaga ruxsat | Hammasiga | `sudoers` da yozilganiga |

Debian Reference sudo'ni shunday ta'riflaydi: administratorga foydalanuvchilarga **cheklangan** root huquqi berish va root faolligini jurnalga yozish uchun mo'ljallangan dastur. U faqat oddiy foydalanuvchining parolini talab qiladi.

Root parolini bir nechta odamga berish shart emas. Ubuntu'da root hisobi umuman yopiq: Ubuntu hujjatiga ko'ra uning parol xeshi hech qanday parolga mos kelmaydi, administratorlar `sudo` dan foydalanadi.

## sudo qanday ishlaydi

Trenajorda parolli foydalanuvchi yaratamiz (parol — faqat trenajor uchun sinov qiymati):

```text
$ adduser --quiet --disabled-password --gecos '' ali && echo 'ali:sinov-parol' | chpasswd
$ echo sinov-parol | runuser -u ali -- sudo -S true; echo "kod: $?"
[sudo] password for ali: ali is not in the sudoers file.
kod: 1
```

`-S` — parolni stdin'dan o'qish (bu yerda faqat namoyish uchun; odatda parol klaviaturadan kiritiladi). Parol to'g'ri, lekin `ali` ga ruxsat yo'q. Ruxsat `/etc/sudoers` da:

```text
$ grep -Ev '^[[:space:]]*(#|$)' /etc/sudoers
Defaults	env_reset
Defaults	mail_badpass
Defaults	secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Defaults	use_pty
root	ALL=(ALL:ALL) ALL
%sudo	ALL=(ALL:ALL) ALL
@includedir /etc/sudoers.d
```

`%sudo` — `sudo` **guruhi**. Unga a'zo bo'lish kifoya:

```text
$ adduser --quiet ali sudo
$ echo sinov-parol | runuser -u ali -- sudo -S whoami
[sudo] password for ali: root
$ runuser -u ali -- sudo -n whoami
root
$ runuser -u ali -- sudo -k
$ runuser -u ali -- sudo -n whoami; echo "kod: $?"
sudo: a password is required
kod: 1
```

- Parol bir marta kiritilgach, sudo uni bir muddat eslab qoladi. sudoers man sahifasiga ko'ra standart muddat (`timestamp_timeout`) — **15 daqiqa**.
- `sudo -k` — eslab qolinganini o'chiradi.
- `sudo -n` — parol so'ramaydi: kerak bo'lsa, xato bilan tugaydi. Skriptlarda shu bilan "osilib qolish"ning oldi olinadi.

Bosqichma-bosqich:

<div data-animatsiya="qadamli" data-nom="sudo"></div>

## sudoers qatori

```text
%sudo   ALL=(ALL:ALL) ALL
deploy  ALL=(root)    NOPASSWD: /usr/bin/systemctl restart cron
KIM     QAYERDA=(KIM NOMIDAN)    QAYSI BUYRUQ
```

| Qism | Ma'nosi |
| --- | --- |
| `%sudo` / `deploy` | Foydalanuvchi yoki (`%` bilan) guruh |
| `ALL=` | Qaysi xostda (bir nechta serverga umumiy fayl uchun). Odatda `ALL` |
| `(ALL:ALL)` | Qaysi foydalanuvchi va guruh nomidan. `(root)` — faqat root |
| `NOPASSWD:` | Parol so'ralmaydi |
| oxirgisi | Ruxsat etilgan buyruq(lar) — to'liq yo'l bilan |

### Cheklangan huquq: deploy foydalanuvchisi

Deploy skripti servisni qayta ishga tushirishi kerak, lekin unga butun serverni berish shart emas:

```text
$ echo 'deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart cron' > /tmp/deploy
$ visudo -cf /tmp/deploy
/tmp/deploy: parsed OK
$ install -m 0440 /tmp/deploy /etc/sudoers.d/deploy
$ sudo -l -U deploy
Matching Defaults entries for deploy on trenajor:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin, use_pty

User deploy may run the following commands on trenajor:
    (root) NOPASSWD: /usr/bin/systemctl restart cron
$ runuser -u deploy -- sudo -n systemctl restart cron; echo "kod: $?"
kod: 0
$ runuser -u deploy -- sudo -n systemctl stop cron; echo "kod: $?"
sudo: a password is required
kod: 1
```

- Qoida `/etc/sudoers` ga emas, **`/etc/sudoers.d/`** ga alohida fayl qilib yozildi. `/etc/sudoers` oxiridagi `@includedir /etc/sudoers.d` shu papkani o'qitadi. Har qoida o'z faylida bo'lsa, uni ko'rish va olib tashlash oson.
- Fayl avval `/tmp` da `visudo -cf` bilan **tekshirildi**, keyin `0440` ruxsat bilan joyiga qo'yildi.
- `sudo -l -U deploy` — foydalanuvchiga nima ruxsat etilganini ko'rsatadi.
- `restart` ishladi, `stop` esa yo'q: qoida aynan shu buyruqqa berilgan.

### `/etc/sudoers.d` dagi fayl nomlari

Debian'dagi `/etc/sudoers.d/README` ga ko'ra papkadagi nomi `~` bilan tugagan yoki **nuqtasi bor** fayllar o'qilmaydi:

```text
$ echo 'deploy ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/hamma.conf && chmod 440 /etc/sudoers.d/hamma.conf
$ sudo -l -U deploy | tail -2
User deploy may run the following commands on trenajor:
    (root) NOPASSWD: /usr/bin/systemctl restart cron
```

`hamma.conf` dagi qoida hisobga olinmadi. Faylni `deploy.conf` deb nomlasangiz, qoidangiz **jimgina** ishlamaydi. Xuddi shunday `deploy.bak` zaxira fayli ham o'qilmaydi — bu yaxshi.

### `visudo`: xatodan himoya

sudoers'dagi xato sudo'ning o'zini buzishi mumkin. visudo man sahifasiga ko'ra u faylni qulflaydi, tahrirdan keyin sintaksisni tekshiradi va xato bo'lsa saqlamaydi. Xatoli qatorni tekshiramiz (`NOPASSWD` dan keyin `:` tushib qolgan):

```text
$ echo 'deploy ALL=(root) NOPASSWD /usr/bin/systemctl' > /tmp/yomon
$ visudo -cf /tmp/yomon; echo "kod: $?"
/tmp/yomon:1:46: syntax error
deploy ALL=(root) NOPASSWD /usr/bin/systemctl
                                             ^
kod: 1
```

Bunday fayl `visudo` ni chetlab, to'g'ridan-to'g'ri `/etc/sudoers.d` ga tushsa:

```text
$ cp /tmp/yomon /etc/sudoers.d/yomon
$ sudo -n true; echo "kod: $?"
/etc/sudoers.d/yomon:1:46: syntax error
deploy ALL=(root) NOPASSWD /usr/bin/systemctl
                                             ^
kod: 0
$ visudo -c; echo "kod: $?"
/etc/sudoers.d/yomon:1:46: syntax error
deploy ALL=(root) NOPASSWD /usr/bin/systemctl
                                             ^
kod: 1
```

Bu sinovda sudo ishlashda davom etdi, lekin har chaqiruvda xato chiqaradi. `visudo -c` barcha sudoers fayllarini tekshiradi. Qoida:

- `/etc/sudoers` ni faqat `visudo` bilan tahrirlang.
- `/etc/sudoers.d/` dagi faylni `visudo -f /etc/sudoers.d/deploy` bilan tahrirlang yoki avval `visudo -cf` bilan tekshiring.
- sudoers'ni o'zgartirayotganda **ikkinchi root sessiyasini** ochiq qoldiring: sudo buzilsa, qaytarish uchun yo'l kerak.

## `sudo -u`, `sudo -i`, `sudo -s`

```text
$ sudo -u ilova id
uid=101(ilova) gid=107(ilova) groups=107(ilova)
```

`-u` — root emas, boshqa foydalanuvchi nomidan. Servis foydalanuvchisi (22-bob) huquqlari bilan biror narsani tekshirish uchun qulay: "ilova shu faylni o'qiy oladimi?".

```text
$ runuser -u ali -- bash -c 'cd /tmp && sudo -i pwd && sudo -s pwd'
/root
/tmp
```

| Buyruq | Nima ochiladi |
| --- | --- |
| `sudo -i` | root'ning **login** qobig'i (shell): `.profile` o'qiladi, uy papkasiga o'tadi (`/root`) |
| `sudo -s` | Qobiq (shell), joriy papkada qoladi (`/tmp`) |
| `su -` | root'ning login qobig'i, lekin **root paroli** bilan |

Man sahifaga ko'ra `-i` maqsadli foydalanuvchining login qobig'ini ishga tushiradi va login fayllarini (`.profile`) o'qiydi. Ko'p buyruq bajarish kerak bo'lsa `sudo -i` qulay, lekin bu ham root sessiyasi: ishni tugatgach `exit`.

## Ikki tuzoq

### `sudo` va yo'naltirish

```text
$ runuser -u ali -- bash -c 'sudo echo salom > /root/test.txt'
bash: line 1: /root/test.txt: Permission denied
```

`sudo` faqat `echo` ni root qildi. `>` yo'naltirishni esa sudo'dan **oldin** `ali` ning qobig'i (shell) bajaradi (11-bob) — va `ali` `/root` ga yoza olmaydi. To'g'risi — faylga root nomidan yozadigan buyruq, `tee`:

```text
$ runuser -u ali -- bash -c 'echo salom | sudo tee /root/test.txt'
salom
$ runuser -u ali -- bash -c 'echo ikkinchi | sudo tee -a /root/test.txt > /dev/null'
$ cat /root/test.txt
salom
ikkinchi
```

`tee -a` — faylga qo'shadi (`>>` kabi), `> /dev/null` — ekranga takror chiqarmaydi.

### `sudo` va kengaytma

```text
$ runuser -u ali -- bash -c 'sudo echo $HOME'
/home/ali
$ runuser -u ali -- bash -c "sudo sh -c 'echo \$HOME'"
/root
```

`$HOME` ni sudo ishga tushishidan oldin `ali` ning qobig'i (shell) kengaytirdi (14-bob). Root muhitida kengaytirish kerak bo'lsa — `sudo sh -c '...'`.

## Jurnal

sudo har bir buyruqni jurnalga yozadi:

```text
$ journalctl --no-pager -q _COMM=sudo | grep COMMAND | tail -n 2
Nov 06 10:00:48 trenajor sudo[301]:      ali : TTY=ttyS0 ; PWD=/root ; USER=root ; COMMAND=/bin/bash --login -c pwd
Nov 06 10:00:48 trenajor sudo[300]:      ali : TTY=ttyS0 ; PWD=/tmp ; USER=root ; COMMAND=/bin/bash -c pwd
```

Kim, qaysi papkadan, kim nomidan, qaysi buyruqni bajargani ko'rinadi. `journalctl` — 37-bobda.

## Debian va Ubuntu: sudo-rs

Ubuntu hujjatiga ko'ra Ubuntu 25.10 dan boshlab standart `sudo` — Rust'da qayta yozilgan **sudo-rs**. Asl sudo (sudo.ws) ham o'rnatilgan va tanlash mumkin:

```text vps
$ sudo --version | head -1
sudo-rs 0.2.13-0ubuntu1.2
$ update-alternatives --list sudo
/usr/bin/sudo.ws
/usr/lib/cargo/bin/sudo
```

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `sudo` | sudo 1.9.13p3 | sudo-rs 0.2.13 (sudo.ws 1.9.17 ham bor) |
| sudoers sintaksisi | `sudoers(5)` | O'sha fayllar; qo'llab-quvvatlanadigan sozlamalar — `man sudoers-rs` |
| Parol so'rovi | `[sudo] password for ali:` | `[sudo: authenticate] Password:` (Ubuntu hujjatidan) |
| `/etc/sudoers` dagi qo'shimcha qator | — | `%admin ALL=(ALL) ALL` |

VPS'da shu bobdagi `deploy` qoidasi, `sudo -l -U`, `visudo -cf`, nuqtali fayl nomi va sintaksis xatosi sudo-rs bilan ham sinaldi. Natijalar mos keldi, faqat xabarlar boshqacha:

```text vps
$ runuser -u sinovdeploy -- sudo -n systemctl stop ssh
sudo: I'm sorry sinovdeploy. I'm afraid I can't do that
$ visudo -cf /tmp/y1
/tmp/y1:1:33: syntax error: expecting ':' but found '/'
sinovdeploy ALL=(root) NOPASSWD /usr/bin/systemctl
                                ^
visudo: invalid sudoers file
```

Ubuntu hujjatiga ko'ra sudo-rs'da yo'q narsalar: kiritish/chiqarishni yozib olish va `sudoreplay`, `sudoers.ldap` (LDAP — PAM orqali). Avtomatlashtirilgan skriptlar parol so'rovi matniga tayansa (Expect), yangi format tufayli buziladi.

## Tipik xatolar

**1. sudoers'ni oddiy muharrir bilan tahrirlash.**
Bitta xato sudo'ni buzadi; root paroli yopiq Ubuntu'da qaytish qiyin.
To'g'risi: `visudo`, `visudo -f`, `visudo -c`.

**2. `/etc/sudoers.d/` dagi faylni `.conf` bilan nomlash.**
Qoida jimgina e'tiborsiz qoladi.
To'g'risi: nuqtasiz nom — `deploy`.

**3. Deploy foydalanuvchisiga `NOPASSWD: ALL` berish.**
Uning kaliti o'g'irlansa — butun server ketadi.
To'g'risi: faqat kerakli buyruqlar, to'liq yo'l bilan.

**4. `sudo echo ... > /etc/fayl`.**
`Permission denied`: yo'naltirishni sudo emas, sizning qobig'ingiz (shell) qiladi.
To'g'risi: `echo ... | sudo tee /etc/fayl`.

**5. Doim `sudo -i` da ishlash.**
Bu root bo'lib ishlash bilan bir xil.
To'g'risi: har buyruq oldidan `sudo`.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=23-sudo)** "Deploy uchun sudo": deploy foydalanuvchisiga faqat bitta buyruqqa ruxsat berasiz va qoidani tekshirasiz.

Savollar:

1. `su` va `sudo` qaysi parolni so'raydi?
2. `/etc/sudoers.d/deploy.conf` dagi qoida nega ishlamaydi?
3. `sudo echo 'x' > /etc/motd` nega `Permission denied` beradi?
4. `deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart ilova` qoidasi bilan `deploy` `systemctl stop ilova` ni bajara oladimi?
5. sudoers'ni tahrirlashdan oldin nima qilish kerak?

<details>
<summary>Javoblar</summary>

1. `su` — o'tilayotgan foydalanuvchining (root) parolini. `sudo` — o'zingizning parolingizni.
2. Nomida nuqta bor: bunday fayllar o'qilmaydi.
3. Yo'naltirishni sudo emas, oddiy foydalanuvchining qobig'i (shell) bajaradi. To'g'risi: `echo 'x' | sudo tee /etc/motd`.
4. Yo'q: qoida faqat `restart ilova` ga.
5. Ikkinchi root sessiyasini ochiq qoldirish va faylni `visudo` bilan tahrirlash yoki `visudo -cf` bilan tekshirish.

</details>

## Rasmiy hujjat

- [Debian Reference 1.1.12 — sudo configuration](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_sudo_configuration)
- [Debian Reference 4.7.2 — sudo](https://www.debian.org/doc/manuals/debian-reference/ch04.en.html#_sudo)
- [Ubuntu Server — User management](https://ubuntu.com/server/docs/how-to/security/user-management/)
- [Ubuntu Server — System utility replacements (sudo-rs)](https://ubuntu.com/server/docs/reference/other-tools/sudo-rs/)
- [sudoers(5) — Debian bookworm](https://manpages.debian.org/bookworm/sudo/sudoers.5.en.html)
- [visudo(8) — Debian bookworm](https://manpages.debian.org/bookworm/sudo/visudo.8.en.html)
- Trenajorda: `man sudo`, `man sudoers`, `man visudo`, `cat /etc/sudoers.d/README`
