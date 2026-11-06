# 18 — grep va regex

[← Oldingi: Faylni ko'rish](17-faylni-korish.md) · [Mundarija](README.md) · [Keyingi: find va xargs →](19-find-va-xargs.md)

## Tushuncha

`grep` fayldan (yoki stdin'dan) **shablonga mos qatorlarni** tanlab chiqaradi. Shablon — **regex** (regular expression, muntazam ifoda): matnni tasvirlaydigan qisqa til. Masalan, `[0-9]+` "bir yoki bir nechta raqam" degani.

Logdan xatolarni ajratish, sozlama faylidan izohlarni olib tashlash, papkadagi barcha fayllardan bitta so'zni qidirish — hammasi `grep`.

Misollar uchun kichik veb-server kirish logi (access log) yaratamiz. Har qatorda: IP manzil, vaqt, so'rov, javob kodi (status) va javob hajmi:

```text
$ mkdir -p /tmp/grep && cd /tmp/grep
$ printf '%s\n' '10.0.0.5 - - [06/Nov/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 512' '10.0.0.7 - - [06/Nov/2026:10:00:02 +0000] "GET /api/users HTTP/1.1" 200 1024' '10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64' '192.168.1.20 - - [06/Nov/2026:10:00:04 +0000] "GET /admin HTTP/1.1" 404 128' '10.0.0.7 - - [06/Nov/2026:10:00:05 +0000] "GET /api/orders HTTP/1.1" 500 32' > access.log
$ cat access.log
10.0.0.5 - - [06/Nov/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 512
10.0.0.7 - - [06/Nov/2026:10:00:02 +0000] "GET /api/users HTTP/1.1" 200 1024
10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64
192.168.1.20 - - [06/Nov/2026:10:00:04 +0000] "GET /admin HTTP/1.1" 404 128
10.0.0.7 - - [06/Nov/2026:10:00:05 +0000] "GET /api/orders HTTP/1.1" 500 32
```

## Oddiy qidirish

```text
$ grep api access.log
10.0.0.7 - - [06/Nov/2026:10:00:02 +0000] "GET /api/users HTTP/1.1" 200 1024
10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64
10.0.0.7 - - [06/Nov/2026:10:00:05 +0000] "GET /api/orders HTTP/1.1" 500 32
```

Eng ko'p ishlatiladigan bayroqlar (GNU grep qo'llanmasidan):

| Bayroq | Nima qiladi |
| --- | --- |
| `-i` | Katta-kichik harfni farqlamaydi |
| `-v` | Teskari: shablon **topilmagan** qatorlar |
| `-n` | Qator raqamini qo'shadi |
| `-c` | Qatorlar o'rniga ularning **sonini** chiqaradi |
| `-o` | Butun qator emas, faqat **topilgan qism** |
| `-w` | Faqat butun so'z bo'lib kelgan moslik |
| `-l` | Faqat fayl nomlari |
| `-r` | Papka ichidagi barcha fayllarda |
| `-A N`, `-B N`, `-C N` | Topilgan qatordan keyin / oldin / ikki tomonidan N qator |
| `-q` | Hech narsa chiqarmaydi, faqat chiqish kodi |
| `-E` | Kengaytirilgan regex (ERE) |
| `-F` | Shablon regex emas, oddiy matn |

```text
$ grep -c api access.log
3
$ grep -n POST access.log
3:10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64
$ grep -v ' 200 ' access.log
10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64
192.168.1.20 - - [06/Nov/2026:10:00:04 +0000] "GET /admin HTTP/1.1" 404 128
10.0.0.7 - - [06/Nov/2026:10:00:05 +0000] "GET /api/orders HTTP/1.1" 500 32
$ grep -i get access.log | wc -l
4
$ grep -A1 POST access.log
10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64
192.168.1.20 - - [06/Nov/2026:10:00:04 +0000] "GET /admin HTTP/1.1" 404 128
```

- `-v ' 200 '` — muvaffaqiyatli bo'lmagan so'rovlar. Probellar `200` ni javob hajmi yoki vaqt ichidagi raqamlardan ajratadi.
- `-A1` — xato atrofida nima bo'lganini ko'rish uchun qulay: topilgan qator va undan keyingi bitta qator.

## Regex: asosiy belgilar

Regex'da ba'zi belgilar o'zini emas, **qoidani** bildiradi. Debian Reference jadvalidan asosiylari:

| Belgi | Ma'nosi | Misol |
| --- | --- | --- |
| `.` | Istalgan bitta belgi | `a.c` → `abc`, `a-c` |
| `^` | Qator boshi | `^10\.` → 10. bilan boshlanadigan qator |
| `$` | Qator oxiri | `500$` → 500 bilan tugaydigan qator |
| `[abc]` | Qavs ichidagi belgilardan biri | `[45]` → 4 yoki 5 |
| `[^abc]` | Qavs ichida **yo'q** belgi | `[^0-9]` → raqam emas |
| `[0-9]` | Oraliq | bitta raqam |
| `*` | Oldingisi 0 yoki ko'p marta | `ab*` → `a`, `ab`, `abb` |
| `+` | Oldingisi 1 yoki ko'p marta (ERE) | `[0-9]+` → `7`, `512` |
| `?` | Oldingisi 0 yoki 1 marta (ERE) | `https?` → `http`, `https` |
| `{n}` | Oldingisi aynan n marta (ERE) | `[0-9]{3}` → uch xonali son |
| `a\|b` | a yoki b (ERE) | `GET\|POST` |
| `( )` | Guruh (ERE) | `/api/(users\|orders)` |
| `\` | Keyingi belgining maxsus ma'nosini o'chiradi | `\.` → nuqtaning o'zi |

Quyida har bir shablon log qatorlarining qaysi qismini tutishini ko'ring. Raqamlar bilan shablonni almashtiring:

<div data-animatsiya="regex"></div>

### Nuqta tuzog'i

IP manzilni qidiramiz:

```text
$ grep 10.0.0.5 access.log
10.0.0.5 - - [06/Nov/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 512
10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64
$ echo 10a0b0c5 | grep 10.0.0.5
10a0b0c5
$ echo 10.0.0.50 | grep 10.0.0.5
10.0.0.50
```

To'g'ri ishlayotganga o'xshaydi, lekin ikki xato bor:

- `.` — **istalgan** belgi. Shuning uchun `10a0b0c5` ham mos keldi.
- `10.0.0.5` qidirsangiz, `10.0.0.50` ham chiqadi: u ham shu matnni o'z ichiga oladi.

Birinchisini `-F` (oddiy matn) yoki `\.` tuzatadi, ikkinchisini `-w` (butun so'z):

```text
$ echo 10a0b0c5 | grep -F 10.0.0.5; echo "kod: $?"
kod: 1
$ echo 10.0.0.50 | grep -w 10.0.0.5; echo "kod: $?"
kod: 1
```

GNU grep qo'llanmasiga ko'ra `-w` mosliki oldidan va ortidan harf, raqam yoki `_` kelmasligi kerak. `10.0.0.50` da `5` dan keyin `0` keladi, shuning uchun mos emas.

## BRE va ERE

Regex'ning ikki asosiy turi bor:

- **BRE** (basic regular expression, oddiy regex) — `grep` va `sed` ning standart holati.
- **ERE** (extended regular expression, kengaytirilgan regex) — `grep -E` va `awk`.

Farq bitta narsada. GNU grep qo'llanmasiga ko'ra BRE'da `?`, `+`, `{`, `|`, `(`, `)` maxsus ma'nosini yo'qotadi. Ular o'rniga oldiga `\` qo'yilgan shakli ishlatiladi:

| Ma'nosi | ERE (`grep -E`) | BRE (`grep`) |
| --- | --- | --- |
| 4 yoki 5 | `(4\|5)` | `\(4\|5\)` |
| 2 marta | `{2}` | `\{2\}` |
| 1 yoki ko'p | `+` | `\+` |

Ikkala buyruq bir xil natija beradi: 4xx va 5xx javob kodli so'rovlar.

```text
$ grep -E '" (4|5)[0-9]{2} ' access.log
10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64
192.168.1.20 - - [06/Nov/2026:10:00:04 +0000] "GET /admin HTTP/1.1" 404 128
10.0.0.7 - - [06/Nov/2026:10:00:05 +0000] "GET /api/orders HTTP/1.1" 500 32
$ grep '" \(4\|5\)[0-9]\{2\} ' access.log
10.0.0.5 - - [06/Nov/2026:10:00:03 +0000] "POST /api/login HTTP/1.1" 401 64
192.168.1.20 - - [06/Nov/2026:10:00:04 +0000] "GET /admin HTTP/1.1" 404 128
10.0.0.7 - - [06/Nov/2026:10:00:05 +0000] "GET /api/orders HTTP/1.1" 500 32
```

ERE o'qishga osonroq. `-E` ni unutsangiz, `grep` xato bermaydi — shunchaki hech narsa topmaydi:

```text
$ grep 'GET /api/(users|orders)' access.log; echo "kod: $?"
kod: 1
$ grep -E 'GET /api/(users|orders)' access.log
10.0.0.7 - - [06/Nov/2026:10:00:02 +0000] "GET /api/users HTTP/1.1" 200 1024
10.0.0.7 - - [06/Nov/2026:10:00:05 +0000] "GET /api/orders HTTP/1.1" 500 32
```

BRE'da `(` va `|` oddiy belgi, logda esa `(users|orders)` degan matn yo'q.

### `egrep` va `fgrep`

GNU grep qo'llanmasiga ko'ra `egrep` va `fgrep` eskirgan: POSIX ularni 1992-yilda eskirgan deb e'lon qilgan va 2001-yilda olib tashlagan. Debian va Ubuntu'da ular oddiy o'ram (wrapper):

```text
$ cat /usr/bin/egrep
#!/bin/sh
cmd=${0##*/}
exec grep -E "$@"
```

Skriptlarda `grep -E` va `grep -F` yozing.

## `-o`: faqat kerakli qismni olish

`-o` qatordan faqat topilgan qismni chiqaradi. Ma'lumot ajratib olish uchun asosiy usul:

```text
$ grep -oE '^[0-9.]+' access.log
10.0.0.5
10.0.0.7
10.0.0.5
192.168.1.20
10.0.0.7
```

`^[0-9.]+` — qator boshidan raqam va nuqtalar. Natija — IP manzillar ro'yxati. Uni `sort | uniq -c` ga uzatib, kim necha marta so'rov yuborganini sanash 20–21-boblarda.

## Papkada qidirish: `-r`

```text
$ mkdir -p etc-nusxa && cp /etc/hostname /etc/hosts /etc/os-release etc-nusxa/
$ grep -r trenajor etc-nusxa
etc-nusxa/hosts:127.0.1.1	trenajor
etc-nusxa/hostname:trenajor
$ grep -rl trenajor etc-nusxa
etc-nusxa/hosts
etc-nusxa/hostname
$ grep -rn PRETTY etc-nusxa
etc-nusxa/os-release:1:PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"
```

- `-r` har qatorning oldiga fayl nomini qo'yadi.
- `-l` faqat fayl nomlarini beradi: "bu sozlama qaysi faylda?" degan savolga javob.
- Man sahifaga ko'ra `-r` faqat buyruq qatorida berilgan simvolik havolalarga ergashadi, `-R` esa hammasiga. Fayl operandi berilmasa, `-r` joriy papkada qidiradi.

## Sozlama faylidan izohlarni olib tashlash

Sozlama fayllarining ko'p qismi izoh. Masalan, `/etc/login.defs` da 402 qator bor. Ulardan haqiqiy sozlamalarni ajratamiz:

```text
$ grep -c '' /etc/login.defs
402
$ grep -Ev '^[[:space:]]*(#|$)' /etc/login.defs | wc -l
37
$ grep -Ev '^[[:space:]]*(#|$)' /etc/login.defs | head -3
MAIL_DIR        /var/mail
FAILLOG_ENAB		yes
LOG_UNKFAIL_ENAB	no
```

Shablonni qismlarga ajratamiz:

| Qism | Ma'nosi |
| --- | --- |
| `^` | Qator boshi |
| `[[:space:]]*` | Probel yoki tab, 0 yoki ko'p marta (`[:space:]` — "bo'sh joy belgisi" sinfi) |
| `(#\|$)` | Keyin `#` (izoh) yoki darhol qator oxiri (bo'sh qator) |
| `-v` | Bularni **olib tashla** |

402 qatordan 37 tasi qoldi. Begona serverda sozlama bilan tanishishning tez yo'li shu.

## Chiqish kodi

GNU grep qo'llanmasiga ko'ra:

| Kod | Ma'nosi |
| --- | --- |
| `0` | Kamida bitta qator topildi |
| `1` | Hech narsa topilmadi |
| `2` | Xato (masalan, fayl yo'q) |

```text
$ grep -q yoq access.log; echo "kod: $?"
kod: 1
$ grep yoq /yoq; echo "kod: $?"
grep: /yoq: No such file or directory
kod: 2
```

`-q` skriptlarda shart sifatida ishlatiladi (12-bobdagi zanjir):

```bash
grep -q '^PermitRootLogin no' /etc/ssh/sshd_config || echo "root kirishi yopilmagan"
```

## Debian va Ubuntu

| | Debian 12 (trenajor) | Ubuntu 26.04 (VPS) |
| --- | --- | --- |
| `grep` | GNU grep 3.8 | GNU grep 3.12 |
| `egrep` | `grep -E` o'rami | `grep -E` o'rami |

Ubuntu 26.04 dagi rust-coreutils `grep` ga tegishli emas: `grep` alohida paket, ikkala tizimda ham GNU. Bu bobdagi misollarning natijasi ikkalasida bir xil.

## Tipik xatolar

**1. Nuqtani oddiy belgi deb o'ylash.**
`grep 10.0.0.5` boshqa narsalarni ham topadi.
To'g'risi: `grep -F` yoki `grep '10\.0\.0\.5'`, kerak bo'lsa `-w`.

**2. `-E` ni unutish.**
`grep 'a|b'` BRE'da `a|b` matnini qidiradi va jim turadi.
To'g'risi: `grep -E 'a|b'`.

**3. Shablonni qo'shtirnoqsiz yozish.**
Papkada `1a` va `2b` fayllari bo'lsa, qobiq (shell) `[0-9]*` ni ularning nomlariga kengaytiradi (14-bob):

```text
$ echo grep [0-9]* fayl
grep 1a 2b fayl
$ grep [0-9]* fayl; echo "kod: $?"
kod: 1
$ grep '[0-9]*' fayl
v 42
```

`grep` endi `1a` ni shablon, `2b` va `fayl` ni fayl deb oldi.
To'g'risi: shablonni doim bitta qo'shtirnoqqa oling.

**4. `grep ... | wc -l` o'rniga `-c`.**
Xato emas, lekin `grep -c` qisqaroq va bitta jarayon.

**5. "Topilmadi"ni xato deb hisoblash.**
Skriptda `set -e` bo'lsa, hech narsa topmagan `grep` (kod `1`) skriptni to'xtatadi.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=18-grep)** "Logdan qidirish": kirish logidan xatolarni, IP manzillarni va kerakli so'rovlarni ajratib olasiz.

Savollar:

1. `grep -v` va `grep -c` nima qiladi?
2. `grep 'a+'` va `grep -E 'a+'` farqi nima?
3. `grep 192.168.1.2 access.log` qaysi qatorlarni topadi va nega bu xato bo'lishi mumkin?
4. Papkadagi qaysi fayllarda `DB_HOST` yozilganini qanday bilasiz?
5. `grep` `1` kodi bilan tugadi. Bu xatomi?

<details>
<summary>Javoblar</summary>

1. `-v` shablon topilmagan qatorlarni chiqaradi. `-c` qatorlar o'rniga ularning sonini chiqaradi.
2. BRE'da `+` oddiy belgi: `a+` matni qidiriladi. ERE'da `+` — "1 yoki ko'p marta".
3. `192.168.1.20` qatorini ham topadi: u shu matnni o'z ichiga oladi, `.` esa istalgan belgi. To'g'risi: `grep -wF 192.168.1.2`.
4. `grep -rl DB_HOST papka`.
5. Yo'q: hech narsa topilmadi degani. Xato — `2`.

</details>

## Rasmiy hujjat

- [GNU Grep Manual](https://www.gnu.org/software/grep/manual/grep.html) (3.12): bayroqlar, Exit Status, Basic vs Extended Regular Expressions
- [Debian Reference 1.6.1–1.6.2 — Regular expressions](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_regular_expressions)
- [regex(7) — man7.org](https://man7.org/linux/man-pages/man7/regex.7.html)
- Trenajorda: `man grep`, `man 7 regex`
