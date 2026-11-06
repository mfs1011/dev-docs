# 20 — Matnni o'zgartirish

[← Oldingi: find va xargs](19-find-va-xargs.md) · [Mundarija](README.md) · [Keyingi: Amaliy: log tahlili →](21-log-tahlili.md)

## Tushuncha

18-bobda `grep` qatorlarni **tanladi**. Bu bobdagi buyruqlar matnni **o'zgartiradi**: almashtiradi, ustunlarni kesib oladi, saralaydi, sanaydi.

| Vazifa | Buyruq |
| --- | --- |
| Matnni almashtirish, qatorlarni o'chirish yoki tanlash | `sed` |
| Ustunni kesib olish | `cut`, `awk` |
| Saralash | `sort` |
| Takrorlarni sanash yoki olib tashlash | `uniq` |
| Belgilarni almashtirish yoki o'chirish | `tr` |
| Ustunlar bilan shart, hisob | `awk` |

Ularning kuchi pipe'da (12-bob): har biri bitta kichik ish qiladi, birgalikda esa logdan hisobot chiqaradi.

Misollar uchun 18-bobdagi kirish logi va kichik sozlama fayli:

```text
$ mkdir -p /tmp/matn && cd /tmp/matn
$ printf '%s\n' '10.0.0.5 - - [06/Nov/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 512' '10.0.0.7 - - [06/Nov/2026:10:00:02 +0000] "GET /api/users HTTP/1.1" 200 1024' '10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64' '192.168.1.20 - - [06/Nov/2026:10:00:04 +0000] "GET /admin HTTP/1.1" 404 128' '10.0.0.7 - - [06/Nov/2026:10:00:05 +0000] "GET /api/orders HTTP/1.1" 500 32' > access.log
$ printf '# ilova\nport=80\nhost=127.0.0.1\nroot=/var/www/html\n' > app.conf
```

## `sed`: oqim muharriri

`sed` (stream editor) matnni qatorma-qator o'qiydi, buyruqni qo'llaydi va natijani stdout'ga chiqaradi. **Faylning o'zi o'zgarmaydi**, `-i` berilmasa.

### Almashtirish: `s/eski/yangi/`

```text
$ sed 's/port=80/port=8080/' app.conf
# ilova
port=8080
host=127.0.0.1
root=/var/www/html
$ cat app.conf
# ilova
port=80
host=127.0.0.1
root=/var/www/html
```

Natija ekranga chiqdi, fayl esa avvalgidek. Bu xavfsiz: avval natijani ko'rasiz, keyin faylga yozasiz.

Faylning o'zini o'zgartirish — `-i` (in-place). Man sahifaga ko'ra `-i` dan keyin qo'shimcha (suffix) yozilsa, zaxira nusxa olinadi:

```text
$ sed -i.bak 's/port=80/port=8080/' app.conf
$ diff app.conf.bak app.conf
2c2
< port=80
---
> port=8080
```

`app.conf.bak` — eski holat. Serverda sozlamani `sed -i` bilan o'zgartirsangiz, zaxirasini oling.

### `g`: qatordagi hammasini

```text
$ echo 'a-a-a' | sed 's/a/b/'
b-a-a
$ echo 'a-a-a' | sed 's/a/b/g'
b-b-b
```

`g` siz faqat har qatordagi **birinchi** moslik almashadi.

### Ehtiyot bo'ling: qism ham mos keladi

```text
$ echo 'port=80 port=8080' | sed 's/port=80/port=9000/g'
port=9000 port=900080
$ echo 'port=80 port=8080' | sed 's/port=80\>/port=9000/g'
port=9000 port=8080
```

`port=80` matni `port=8080` ning boshida ham bor, shuning uchun u buzildi. `\>` — so'z oxiri (Debian Reference regex jadvalidan): `80` dan keyin raqam kelmasligi kerak.

### Boshqa ajratuvchi

Yo'llarda `/` ko'p. `s` dan keyingi belgi ajratuvchi bo'ladi, shuning uchun `|` ishlatish mumkin:

```text
$ sed 's|/var/www/html|/srv/ilova|' app.conf
# ilova
port=8080
host=127.0.0.1
root=/srv/ilova
```

### Topilgan matnni qayta ishlatish

Debian Reference'ga ko'ra almashtirish matnida `&` — butun topilgan matn, `\1`, `\2` — qavsdagi guruhlar:

```text
$ echo 'host=db' | sed 's/.*/[&]/'
[host=db]
$ echo zzz1abc2efg3hij4 | sed -E 's/(1[a-z]*)[0-9]*(.*)$/\2===\1/'
zzzefg3hij4===1abc
```

Ikkinchisi Debian Reference'dagi misol: `(1[a-z]*)` — 1-guruh `1abc`, `(.*)` — 2-guruh, ular joyi almashtirildi. `-E` — ERE (18-bob); usiz qavslar `\(` `\)` bilan yoziladi.

### Qatorlarni tanlash va o'chirish

```text
$ sed -n '2p' app.conf
port=8080
$ sed -n '2,3p' app.conf
port=8080
host=127.0.0.1
$ sed '/^#/d' app.conf
port=8080
host=127.0.0.1
root=/var/www/html
$ sed -n '/POST/p' access.log
10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64
```

| Buyruq | Ma'nosi |
| --- | --- |
| `-n` | Qatorlarni avtomatik chiqarmaydi (man: "suppress automatic printing") |
| `2p` | 2-qatorni chiqar |
| `2,3p` | 2-dan 3-gacha |
| `/^#/d` | `#` bilan boshlangan qatorlarni o'chir |
| `/POST/p` | `POST` bor qatorlarni chiqar (`-n` bilan — `grep` kabi) |

17-bobdagi "500-qatorni olish" vazifasi `sed` bilan: `sed -n 500p app.log`.

## `cut`: ustunni kesish

```text
$ cut -d: -f1,7 /etc/passwd | head -3
root:/bin/bash
daemon:/usr/sbin/nologin
bin:/usr/sbin/nologin
$ cut -d' ' -f1 access.log
10.0.0.5
10.0.0.7
10.0.0.5
192.168.1.20
10.0.0.7
$ cut -c1-10 access.log | head -2
10.0.0.5 -
10.0.0.7 -
```

- `-d:` — ajratuvchi `:` (standart holatda tab).
- `-f1,7` — 1- va 7-ustun (field).
- `-c1-10` — 1-dan 10-gacha belgi.

`cut` ning cheklovi: ajratuvchi **aynan bitta belgi**. Ustunlar bir nechta probel bilan tekislangan bo'lsa, `cut` ishlamaydi:

```text
$ echo 'a   b' | cut -d' ' -f2

$ echo 'a   b' | awk '{print $2}'
b
```

`cut` uchun har probel yangi ustun: 2-ustun bo'sh. `awk` esa probellar ketma-ketligini bitta ajratuvchi deb oladi. `ps`, `df`, `ls -l` kabi chiqishlarda `awk` ishlating.

## `sort`

```text
$ printf '10\n9\n100\n' | sort
10
100
9
$ printf '10\n9\n100\n' | sort -n
9
10
100
$ printf '1G\n512K\n20M\n' | sort -h
512K
20M
1G
```

Standart holatda `sort` **matn** sifatida saralaydi: `1` belgisi `9` dan oldin, shuning uchun `100` `9` dan oldin chiqdi. Sonlar uchun `-n`, `du -h` kabi "inson o'qiydigan" hajmlar uchun `-h`.

| Bayroq | Ma'nosi |
| --- | --- |
| `-n` | Son sifatida |
| `-h` | `2K`, `1G` kabi hajmlar |
| `-r` | Teskari tartib |
| `-t:` | Ustun ajratuvchisi |
| `-k3` | 3-ustun bo'yicha |
| `-u` | Takrorlarni olib tashlash |

```text
$ sort -t: -k3 -n /etc/passwd | tail -2
systemd-network:x:998:998:systemd Network Management:/:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
```

`/etc/passwd` 3-ustun (UID) bo'yicha saralandi: eng katta UID — `nobody`.

## `uniq`: takrorlarni sanash

```text
$ cut -d' ' -f1 access.log | uniq -c
      1 10.0.0.5
      1 10.0.0.7
      1 10.0.0.5
      1 192.168.1.20
      1 10.0.0.7
$ cut -d' ' -f1 access.log | sort | uniq -c
      2 10.0.0.5
      2 10.0.0.7
      1 192.168.1.20
```

Birinchi urinishda hamma IP bir marta chiqdi. Man sahifaga ko'ra `uniq` faqat **yonma-yon turgan** bir xil qatorlarni birlashtiradi. Shuning uchun avval `sort` kerak.

Eng ko'p so'rov yuborgan IP — logni tahlil qilishning klassik buyrug'i:

```text
$ cut -d' ' -f1 access.log | sort | uniq -c | sort -rn
      2 10.0.0.7
      2 10.0.0.5
      1 192.168.1.20
```

Har bosqichda oqim qanday o'zgarishini ko'ring:

<div data-animatsiya="qadamli" data-nom="quvur"></div>

Faqat noyob qiymatlar kerak bo'lsa (sanamasdan), `sort -u` yetarli:

```text
$ cut -d' ' -f1 access.log | sort -u
10.0.0.5
10.0.0.7
192.168.1.20
```

## `tr`: belgilarni almashtirish

```text
$ echo 'salom dunyo' | tr a-z A-Z
SALOM DUNYO
$ printf 'host=db\r\n' | tr -d '\r' | cat -A
host=db$
$ echo 'a    b  c' | tr -s ' '
a b c
$ echo "$PATH" | tr ':' '\n'
/usr/local/sbin
/usr/local/bin
/usr/sbin
/usr/bin
/sbin
/bin
```

- `tr a-z A-Z` — har kichik harfni kattasiga.
- `tr -d '\r'` — belgini o'chiradi. 17-bobdagi Windows qator oxirini shunday tozalaysiz.
- `tr -s ' '` — takrorlangan probellarni bittaga qisadi (squeeze). Shundan keyin `cut -d' '` ishlaydi.
- `tr ':' '\n'` — `PATH` ni o'qishga qulay ro'yxatga aylantirish.

`tr` faqat stdin'dan o'qiydi, fayl nomi qabul qilmaydi: `tr -d '\r' < win.conf`.

## `awk`: ustunlar bilan ishlash

`awk` har qatorni **ustunlarga** (maydonlarga) bo'ladi: `$1`, `$2`, ..., butun qator — `$0`. Standart holatda ajratuvchi — probel va tablar ketma-ketligi.

Kirish logida ustunlar:

```text
10.0.0.5  -  -  [06/Nov/2026:10:00:01  +0000]  "GET  /  HTTP/1.1"  200  512
   $1     $2 $3           $4             $5     $6  $7    $8       $9   $10
```

```text
$ awk '{print $1, $9}' access.log
10.0.0.5 200
10.0.0.7 200
10.0.0.5 401
192.168.1.20 404
10.0.0.7 500
$ awk -F: '{print $1, $7}' /etc/passwd | head -3
root /bin/bash
daemon /usr/sbin/nologin
bin /usr/sbin/nologin
```

`awk` dasturi `shart { amal }` ko'rinishida. Shart bo'lmasa — har qatorga; amal bo'lmasa — qatorni chiqaradi:

```text
$ awk '$9 >= 400' access.log
10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64
192.168.1.20 - - [06/Nov/2026:10:00:04 +0000] "GET /admin HTTP/1.1" 404 128
10.0.0.7 - - [06/Nov/2026:10:00:05 +0000] "GET /api/orders HTTP/1.1" 500 32
$ awk '$9 >= 400 {print $9, $7}' access.log
401 /api/login
404 /admin
500 /api/orders
```

`grep` bilan "status 400 dan katta" shartini yozish qiyin edi (18-bobda `(4|5)[0-9]{2}`). `awk` ustunni **son** sifatida solishtiradi.

Hisoblash: `END` bloki barcha qatorlar o'qilgandan keyin bir marta bajariladi:

```text
$ awk '{s += $10} END {print s}' access.log
1760
```

Javoblarning umumiy hajmi — 1760 bayt.

Foydali o'zgaruvchilar:

| | Ma'nosi |
| --- | --- |
| `NR` | Joriy qator raqami: `awk 'NR == 2'` — 2-qator |
| `NF` | Qatordagi ustunlar soni: `$NF` — oxirgi ustun |
| `-F:` | Ajratuvchi |
| `~`, `!~` | Regex'ga mos / mos emas |

```text
$ awk -F: '$7 !~ /nologin|false/ {print $1, $7}' /etc/passwd
root /bin/bash
sync /bin/sync
```

Tizimga kira oladigan (qobig'i (shell) `nologin` yoki `false` bo'lmagan) foydalanuvchilar. Debian Reference'dagi `awk '($1=="Ian") { print }'` misoli ham shu shakl: shart va amal.

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `sed` | GNU sed 4.9 | GNU sed 4.9 |
| `awk` → | GNU Awk 5.2.1 | GNU Awk 5.3.2 |
| `sort`, `uniq`, `cut`, `tr` | GNU coreutils 9.1 | uutils (rust-coreutils) 0.10.0 |

`sort`, `uniq -c`, `cut`, `tr -d`/`-s` va `sed -E` misollari VPS'da ham sinaldi, natijalar bir xil.

`awk` — alternatives (16-bob) orqali tanlanadigan buyruq: ikkala tizimda `/etc/alternatives/awk` → `/usr/bin/gawk`. Trenajorda `mawk` ham o'rnatilgan. Bu bobdagi `awk` dasturlari faqat POSIX imkoniyatlaridan foydalanadi.

## Tipik xatolar

**1. `sed -i` ni sinamasdan ishlatish.**
Xato almashtirish faylni buzadi.
To'g'risi: avval `-i` siz natijani ko'ring, keyin `-i.bak`.

**2. Qisman moslikni unutish.**
`s/port=80/.../g` `port=8080` ni ham buzadi.
To'g'risi: so'z chegarasi `\>` yoki aniqroq shablon `^port=80$`.

**3. `uniq` ni `sort` siz ishlatish.**
Yonma-yon bo'lmagan takrorlar sanalmaydi.
To'g'risi: `sort | uniq -c`.

**4. Sonlarni `-n` siz saralash.**
`100` `9` dan oldin chiqadi.

**5. Bir nechta probelli chiqishda `cut -d' '`.**
To'g'risi: `awk '{print $N}'` yoki avval `tr -s ' '`.

**6. `awk` dasturini qo'sh qo'shtirnoqqa olish.**
Qobiq (shell) `$1` ni o'zi kengaytiradi (14-bob). U bo'sh, `awk` esa `{print }` ni oladi va butun qatorni chiqaradi:

```text
$ awk "{print $1}" access.log | head -1
10.0.0.5 - - [06/Nov/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 512
```

To'g'risi: `awk` dasturini doim bitta qo'shtirnoqqa oling.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=20-matn)** "Sozlama va hisobot": sozlama faylini `sed` bilan o'zgartirasiz va logdan IP hisobotini tuzasiz.

Savollar:

1. `sed 's/a/b/'` faylni o'zgartiradimi?
2. `sort | uniq -c` da nega `sort` kerak?
3. `ps aux` chiqishidan 2-ustunni (PID) olish uchun `cut` mi, `awk` mi?
4. Logdagi 5xx javoblar sonini `awk` bilan qanday sanaysiz?
5. `sed -n '10,20p' fayl` nima qiladi?

<details>
<summary>Javoblar</summary>

1. Yo'q, natijani stdout'ga chiqaradi. Fayl `-i` bilan o'zgaradi.
2. `uniq` faqat yonma-yon turgan bir xil qatorlarni birlashtiradi.
3. `awk '{print $2}'`: ustunlar bir nechta probel bilan tekislangan.
4. `awk '$9 >= 500' access.log | wc -l` yoki `awk '$9 >= 500 {n++} END {print n}' access.log`.
5. 10-dan 20-gacha qatorlarni chiqaradi.

</details>

## Rasmiy hujjat

- [GNU sed manual](https://www.gnu.org/software/sed/manual/sed.html)
- [GNU Awk User's Guide](https://www.gnu.org/software/gawk/manual/gawk.html)
- [GNU Coreutils — sort, uniq, cut, tr](https://www.gnu.org/software/coreutils/manual/coreutils.html)
- [Debian Reference 1.6.3–1.6.6](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_replacement_expressions)
- Trenajorda: `man sed`, `man awk`, `man sort`, `man uniq`, `man cut`, `man tr`
