# 46 — Fayl ko'chirish

[← Oldingi: SSH bilan ulanish](45-ssh-bilan-ulanish.md) · [Mundarija](README.md) · [Keyingi: SSH tunnel →](47-ssh-tunnel.md)

## Tushuncha

Kompyuter va server orasida fayl ko'chirishning uchta asosiy vositasi bor. Uchalasi ham SSH ustida ishlaydi (45-bob), ya'ni xuddi shu kalit va `~/.ssh/config` ishlatiladi:

| Vosita | Nima uchun | Xususiyati |
| --- | --- | --- |
| `scp` | Bir nechta fayl yoki katalogni bir martada ko'chirish | `cp` ga o'xshaydi |
| `sftp` | Interaktiv ish: kataloglarni ko'rish, fayl olish va yuborish | FTP'ga o'xshash buyruqlar |
| `rsync` | Katalogni sinxronlash: faqat o'zgargan fayllarni yuborish | Qayta ishga tushirsa, faqat farqni yuboradi |

Debian Reference (10.1.2) ga ko'ra `rsync` bilan nusxalash boshqa vositalarga qaraganda boyroq imkoniyatlar beradi.

> **Chiqishlar haqida.** Trenajorda `scp`, `sftp` va `rsync` yo'q. Bob noutbuk (macOS) va VPS'da sinalgan, VPS manzili `203.0.113.10` bilan yashirilgan. VPS shablonida `rsync` yo'q edi — `apt install rsync` bilan o'rnatildi.

Ulanish uchun 45-bobdagi kabi alohida `config` fayli:

```text tashqi
$ cat config
Host lab
    HostName 203.0.113.10
    User root
    IdentityFile ~/.ssh/docs_web_lab
    IdentitiesOnly yes
```

## `scp`

Kichik sayt yaratib, uni serverga yuboramiz:

```text tashqi
$ mkdir -p sayt/css && echo '<h1>Salom</h1>' > sayt/index.html && echo 'body {}' > sayt/css/style.css
$ find sayt
sayt
sayt/index.html
sayt/css
sayt/css/style.css
$ scp -F config sayt/index.html lab:/tmp/
$ ssh -F config lab 'ls -l /tmp/index.html'
-rw-r--r-- 1 root root 15 Nov  7 13:56 /tmp/index.html
$ scp -F config -r sayt lab:/tmp/
$ ssh -F config lab 'find /tmp/sayt'
/tmp/sayt
/tmp/sayt/css
/tmp/sayt/css/style.css
/tmp/sayt/index.html
```

- `lab:/tmp/` — `server:yo'l`. Ikki nuqta bo'lmasa, scp uni mahalliy fayl deb tushunadi.
- `-r` — katalogni ichidagilari bilan birga (rekursiv).
- scp muvaffaqiyatli bo'lsa, hech narsa chiqarmaydi.
- scp(1): `-O` eski SCP protokoliga qaytaradi. Demak, hozirgi scp standart holatda SFTP protokoli orqali ishlaydi.

Serverdan faylni olish ham shu ko'rinishda, faqat argumentlar o'rni almashadi: `scp lab:/yo'l/fayl .`

## `sftp`

`sftp` odatda interaktiv: `sftp lab` deb kirib, `ls`, `cd`, `get`, `put` buyruqlarini yozasiz. Bu yerda buyruqlarni `-b -` (stdin'dan buyruqlar to'plami) bilan berdik — chiqish xuddi interaktiv ishdagidek ko'rinadi:

```text tashqi
$ printf 'cd /tmp/sayt\nls -l\nget index.html yuklangan.html\n' | sftp -F config -b - lab
sftp> cd /tmp/sayt
sftp> ls -l
drwxr-xr-x    ? root     root           60 Nov  7 15:56 css
-rw-r--r--    ? root     root           15 Nov  7 15:56 index.html
sftp> get index.html yuklangan.html
$ cat yuklangan.html
<h1>Salom</h1>
```

| Buyruq | Ma'nosi |
| --- | --- |
| `cd`, `ls` | Serverdagi katalog |
| `lcd`, `lls` | Mahalliy katalog |
| `get` | Serverdan olish |
| `put` | Serverga yuborish |

## `rsync`: oxiridagi `/` farqi

rsync(1): manba oxiridagi `/` qo'shimcha katalog darajasi yaratilishining oldini oladi. Uni "shu katalogning **ichidagini** nusxala" deb tushunish mumkin; `/` siz — "katalogni **nomi bilan** nusxala". VPS'da sinaymiz:

```text vps
$ rsync --version | head -n 1
rsync  version 3.4.1  protocol version 32
$ mkdir -p /tmp/m1 /tmp/m2
$ rsync -a /tmp/sayt /tmp/m1/
$ find /tmp/m1
/tmp/m1
/tmp/m1/sayt
/tmp/m1/sayt/index.html
/tmp/m1/sayt/css
/tmp/m1/sayt/css/style.css
$ rsync -a /tmp/sayt/ /tmp/m2/
$ find /tmp/m2
/tmp/m2
/tmp/m2/index.html
/tmp/m2/css
/tmp/m2/css/style.css
```

- `/tmp/sayt` → `m1` ichida `sayt` katalogi paydo bo'ldi.
- `/tmp/sayt/` → `m2` ga katalogning ichidagilar tushdi.
- `-a` (archive) — kataloglarni rekursiv nusxalash va ruxsatlar, vaqt, egasi kabi xususiyatlarni saqlash.

## `rsync`: faqat farqni yuborish

```text vps
$ rsync -av /tmp/sayt/ /tmp/m2/
sending incremental file list

sent 127 bytes  received 13 bytes  280.00 bytes/sec
total size is 23  speedup is 0.16
$ echo yangi > /tmp/sayt/yangi.txt
$ rsync -av /tmp/sayt/ /tmp/m2/
sending incremental file list
./
yangi.txt

sent 215 bytes  received 39 bytes  508.00 bytes/sec
total size is 29  speedup is 0.11
```

Ikkinchi marta ishga tushirganda hech qanday fayl yuborilmadi: hammasi allaqachon bir xil. Yangi fayl qo'shilgach — faqat o'sha (`./` — katalogning o'z xususiyatlari yangilandi). `-v` — nima yuborilayotganini ko'rsatish.

## `--delete` va `--dry-run`

Manbada yo'q fayllar qabul qiluvchi tomonda qolib ketadi. rsync(1): `--delete` qabul qiluvchi tomondagi ortiqcha fayllarni — yuboruvchi tomonda yo'qlarini — o'chiradi. Bu xavfli, shuning uchun avval `--dry-run` (`-n`) bilan sinab ko'riladi: rsync hech narsani o'zgartirmaydi, faqat nima qilishini ko'rsatadi.

```text vps
$ touch /tmp/m2/ortiqcha.txt
$ rsync -av --delete --dry-run /tmp/sayt/ /tmp/m2/
sending incremental file list
deleting ortiqcha.txt

sent 159 bytes  received 36 bytes  390.00 bytes/sec
total size is 29  speedup is 0.15 (DRY RUN)
$ ls /tmp/m2
css
index.html
ortiqcha.txt
yangi.txt
```

`(DRY RUN)` — sinov edi, `ortiqcha.txt` joyida. Natija to'g'ri bo'lsa, xuddi shu buyruq `--dry-run` siz bajariladi.

## `rsync` serverga

Masofaviy manzil scp'dagidek `server:yo'l` ko'rinishida yoziladi. `-e` — qaysi SSH buyrug'i bilan ulanish:

```text tashqi
$ rsync --version | head -n 1
openrsync: protocol version 29
$ rsync -av -e 'ssh -F config' sayt/ lab:/tmp/sayt2/
Transfer starting: 4 files
created directory /tmp/sayt2
./
index.html
css/
css/style.css

sent 292 bytes  received 76 bytes  3501 bytes/sec
total size is 23  speedup is 0.06
$ ssh -F config lab 'find /tmp/sayt2'
/tmp/sayt2
/tmp/sayt2/index.html
/tmp/sayt2/css
/tmp/sayt2/css/style.css
```

macOS'dagi `rsync` — boshqa dastur, **openrsync** (birinchi qator). U serverdagi rsync 3.4.1 bilan ishladi, lekin chiqishi biroz boshqacha (`Transfer starting`). Linux'dagi `rsync` chiqishi yuqoridagi VPS bloklaridagidek bo'ladi.

Tajribadan keyin VPS'ni tozalaymiz:

```text vps
$ rm -r /tmp/sayt /tmp/sayt2 /tmp/m1 /tmp/m2 /tmp/index.html
$ ls /tmp | grep -cE '^(sayt|m1|m2|index.html)'
0
```

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) | Noutbuk (macOS) |
| --- | --- | --- | --- |
| `scp`, `sftp` | yo'q | OpenSSH 10.2p1 | OpenSSH 10.2p1 |
| `rsync` | yo'q | 3.4.1 (`apt install rsync` bilan) | openrsync |

rsync(1): `rsync` yuboruvchi va qabul qiluvchi **ikkala** kompyuterda ham o'rnatilgan bo'lishi kerak. Serverda rsync bo'lmasa, masofaviy sinxronlash ishlamaydi.

## Tipik xatolar

**1. Manba oxiridagi `/` ni unutish yoki ortiqcha qo'yish.**
Natija bir daraja chuqurroq (`m1/sayt/...`) yoki aksincha chiqadi.
To'g'risi: "ichidagini" — `papka/`, "katalogni o'zini" — `papka`.

**2. `--delete` ni sinovsiz ishlatish.**
Noto'g'ri katalog berilsa, qabul qiluvchi tomondagi kerakli fayllar o'chib ketadi.
To'g'risi: avval `--dry-run` bilan.

**3. `scp` da ikki nuqtani unutish.**
`scp fayl lab` mahalliy `lab` nomli faylga nusxalaydi.
To'g'risi: `lab:` yoki `lab:/yo'l/`.

**4. Serverda `rsync` yo'q.**
To'g'risi: `apt install rsync`.

## Amaliyot

Trenajorda bu vositalar yo'q, shuning uchun mashq yo'q.

Savollar:

1. `rsync -a src dst/` va `rsync -a src/ dst/` farqi nima?
2. `rsync -av` ni ikkinchi marta ishga tushirganda nima uchun hech narsa yuborilmadi?
3. `--delete` dan oldin nima qilish kerak?
4. Serverdan `/var/log/syslog` ni joriy katalogga qanday olasiz?
5. Bitta faylni tez yuborish uchun qaysi vosita, katta katalogni muntazam yangilab turish uchun qaysi biri qulay?

<details>
<summary>Javoblar</summary>

1. Birinchisi `dst/src/...` yaratadi, ikkinchisi `src` ichidagilarni to'g'ridan-to'g'ri `dst/` ga qo'yadi.
2. Fayllar ikkala tomonda bir xil edi: rsync faqat farqni yuboradi.
3. `--dry-run` bilan nima o'chishini ko'rish.
4. `scp lab:/var/log/syslog .`
5. Bitta fayl — `scp`, katalogni muntazam sinxronlash — `rsync`.

</details>

## Rasmiy hujjat

- [Debian Reference 10.1.2](https://www.debian.org/doc/manuals/debian-reference/ch10.en.html#_copy_and_synchronization_tools) · [10.1.4](https://www.debian.org/doc/manuals/debian-reference/ch10.en.html#_idioms_for_the_copy) — nusxalash va sinxronlash vositalari
- [scp(1)](https://man.openbsd.org/scp) · [sftp(1)](https://man.openbsd.org/sftp)
- [rsync(1)](https://download.samba.org/pub/rsync/rsync.1) — oxiridagi `/`, `-a`, `--delete`, `--dry-run`
