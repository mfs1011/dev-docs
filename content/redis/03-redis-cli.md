# 03 — redis-cli

[Mundarija](README.md)

## Tushuncha

RD (Redis CLI): **`redis-cli`** — Redis'ning buyruq satri interfeysi. U bilan Redis'ga buyruq yuborib, javobni terminalda o'qiysiz. Ikki rejim: **buyruq satri** (bitta buyruq — argument sifatida) va **interaktiv** (prompt'da buyruqlarni ketma-ket yozish). Undan tashqari maxsus rejimlar: kalitlarni ko'rib chiqish, katta kalitlarni topish, kuzatish va boshqalar.

### Ulanish parametrlari

Standart holatda `127.0.0.1:6379` ga ulanadi (RD):

| Parametr | Nima |
| --- | --- |
| `-h <xost>`, `-p <port>` | Boshqa server |
| `-a <parol>` | Parol bilan kirish. RD: xavfsizlik uchun parolni **`REDISCLI_AUTH`** muhit o'zgaruvchisida bering |
| `-n <raqam>` | Boshqa **ma'lumotlar bazasi** raqami (standart — `0`) |
| `-u redis://user:parol@xost:port/raqam` | Hammasi bitta URI'da; TLS uchun — `rediss://`; foydalanuvchi nomisiz kirish uchun — `default` |
| `--tls`, `--cacert`, `--cert`, `--key` | TLS bilan ulanish |
| `-4` / `-6` | DNS'da IPv4 yoki IPv6 afzal |

### Javob turlari va xom rejim

RD: Redis javoblari **turli** (string, massiv, butun son, `nil`, xato…). Chiqish **terminal** bo'lsa, `redis-cli` turini qavsda ko'rsatadi: `(integer) 7`. Chiqish faylga yoki boshqa buyruqqa (pipe) yo'naltirilsa — avtomatik **xom** (raw) rejim: faqat qiymat. Majburlash: `--raw` (doim xom), `--no-raw` (doim odam o'qiydigan).

### Qo'shtirnoq va maxsus belgilar

RD: bo'sh joy argumentlarni ajratadi. Bo'sh joyli yoki maxsus belgili qiymat — qo'shtirnoq ichida:

- `"…"` — escape ketma-ketliklari ishlaydi: `\"`, `\n`, `\r`, `\t`, `\b`, `\a`, `\\`, `\xhh`;
- `'…'` — matn aynan olinadi, faqat `\'` va `\\`.

### Boshqa dasturlardan kirish

- `-x` — standart kirish (stdin) **oxirgi argument** bo'ladi: `redis-cli -x SET kalit < fayl`.
- Buyruqlar faylini `redis-cli` ga uzatish — hammasi interaktiv rejimdagi kabi ketma-ket bajariladi.
- `-r <son>` va `-i <soniya>` — bir buyruqni necha marta va qanday oraliq bilan takrorlash (`-r -1` — cheksiz).
- `--csv` — bitta buyruq natijasini CSV ko'rinishida (butun bazani eksport qilish uchun emas).

### Interaktiv rejim

`redis-cli` argumentsiz ishga tushirilsa — prompt (RD):

```text
$ redis-cli
127.0.0.1:6379> PING
PONG
127.0.0.1:6379> SELECT 2
OK
127.0.0.1:6379[2]> DBSIZE
(integer) 1
```

- Prompt — server xosti va porti; `0` dan boshqa baza tanlansa — `[2]` ko'rinadi.
- `CONNECT <xost> <port>` — boshqa serverga o'tish; ulanib bo'lmasa — `not connected>`, keyingi har buyruqda qayta urinadi.
- Ulanish uzilib qayta tiklansa, oxirgi tanlangan baza qayta tanlanadi, lekin boshqa holat (masalan, `MULTI` tranzaksiyasi) **yo'qoladi**.
- `5 INCR mycounter` — buyruqni 5 marta bajarish.
- `HELP <buyruq>`, `HELP @<guruh>` (`@string`, `@list`, `@hash`…) — yordam; TAB bilan to'ldirish.

### Maxsus rejimlar

| Rejim | Nima (RD) |
| --- | --- |
| `--scan` (`--pattern`) | Kalitlar ro'yxati — `SCAN` bilan, serverni **bloklamasdan** (`KEYS *` esa bloklaydi). Ma'lumot o'zgarayotgan bo'lsa kalit takror chiqishi mumkin, lekin boshidan bor kalit tushib qolmaydi |
| `--bigkeys` | Har turdagi eng katta kalit va turlar bo'yicha statistika; `SCAN` bilan, `-i 0.01` bilan yuklamani yanada kamaytirish mumkin |
| `--memkeys` | Kalitlarning xotira sarfi bo'yicha |
| `--stat` | Doimiy statistika |
| `MONITOR` | Serverga kelayotgan **barcha** buyruqlarni ko'rsatish (33-bob) |
| `--latency` | Kechikishni o'lchash (33-bob) |
| `--rdb` | Masofadan RDB zaxira olish (28-bob) |

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3). Terminal rejimini ko'rsatish uchun `script -q -c '…' /dev/null` — buyruqni psevdo-terminalda bajaradi (vpsrun skriptida chiqish terminal emas).

### Javob turlari

```text vps
$ redis-cli FLUSHALL
OK
$ script -q -c 'redis-cli INCR mycounter' /dev/null
(integer) 1
$ redis-cli INCR mycounter > /tmp/output.txt; cat /tmp/output.txt; rm -f /tmp/output.txt
2
$ script -q -c 'redis-cli --raw INCR mycounter' /dev/null
3
$ redis-cli --no-raw INCR mycounter | cat
(integer) 4
$ script -q -c 'redis-cli GET yoq-kalit' /dev/null; redis-cli GET yoq-kalit | od -c | head -2
(nil)
0000000  \n
0000001
$ script -q -c 'redis-cli FOO' /dev/null
(error) ERR unknown command 'FOO'
```

| Chiqish | Ma'nosi |
| --- | --- |
| `(integer) 1` | Terminalda — butun son turi ko'rsatildi |
| `2` | Faylga yozilganda — xom rejim, faqat qiymat |
| `3` | `--raw` terminalda ham xom |
| `(integer) 4` | `--no-raw` pipe'da ham tur bilan |
| `(nil)` / bo'sh qator | Kalit yo'q: terminalda `(nil)`, xom rejimda — bo'sh qator (`od -c`: faqat `\n`) |
| `(error) ERR unknown command 'FOO'` | Xato javobi |

### Qo'shtirnoq: buyruq satri va stdin

```text vps
$ script -q -c 'redis-cli SET mykey "Hello\nWorld"' /dev/null; redis-cli GET mykey
OK
Hello\nWorld
$ redis-cli STRLEN mykey
12
$ printf 'SET mykey2 "Hello\\nWorld"\nGET mykey2\nSTRLEN mykey2\n' | redis-cli
OK
Hello
World
11
$ redis-cli SET ikki 'bitta argument' ; redis-cli STRLEN ikki
OK
14
```

- Buyruq **satri argumenti** (`redis-cli SET mykey "Hello\nWorld"`) — qo'shtirnoqni **shell** oladi; `\n` aynan ikki belgi bo'lib qoladi: qiymat 12 bayt, `GET` `Hello\nWorld` ni bir qatorda ko'rsatdi (kuzatildi).
- **Stdin** orqali (interaktiv rejim kabi) — `redis-cli` qo'shtirnoqni o'zi tahlil qiladi: `\n` haqiqiy yangi qatorga aylandi, 11 bayt, `GET` ikki qatorda.
- `'bitta argument'` — bo'sh joyli qiymat bitta argument (14 bayt).

### Boshqa dasturlardan

```text vps
$ printf 'SET item:3374 100\nINCR item:3374\nAPPEND item:3374 xxx\nGET item:3374\n' | redis-cli
OK
101
6
101xxx
$ printf 'Salom fayl\n' > /tmp/f.txt && redis-cli -x SET fayl < /tmp/f.txt && redis-cli GET fayl | od -c | tail -2; rm -f /tmp/f.txt
OK
0000000   S   a   l   o   m       f   a   y   l  \n  \n
0000014
$ redis-cli -r 3 -i 0.2 INCR counter_value
1
2
3
$ redis-cli LPUSH mylist a b c d; redis-cli --csv LRANGE mylist 0 -1
4
"d","c","b","a"
```

- Buyruqlar ro'yxati stdin orqali — ketma-ket bajarildi.
- `-x SET fayl` — fayl mazmuni qiymat bo'ldi (fayldagi yangi qator belgisi ham qiymat ichida).
- `-r 3 -i 0.2` — uch marta, 0,2 soniya oraliq bilan.
- `--csv` — ro'yxat CSV ko'rinishida (`LPUSH` boshiga qo'shgani uchun tartib teskari — 7-bob).

### Ma'lumotlar bazalari

```text vps
$ redis-cli -n 1 INCR a; redis-cli -n 1 INCR a; redis-cli -n 2 INCR a; redis-cli -n 0 DBSIZE; redis-cli -n 1 DBSIZE
1
2
1
7
1
$ printf 'SELECT 2\nDBSIZE\nSELECT 0\nDBSIZE\n' | redis-cli
OK
1
OK
33
```

`-n 1` va `-n 2` dagi `a` — **har xil** kalitlar: har baza alohida kalitlar fazosi. `SELECT` — interaktiv rejimdagi bilan bir xil, stdin orqali. (Raqamlangan bazalar faqat bitta serverda; Redis Cluster faqat `0` ni qo'llaydi — 32-bob.)

### Kalitlarni ko'rib chiqish va katta kalitlar

```text vps
$ for i in $(seq 1 25); do echo "SET user:$i ism$i"; done | redis-cli > /dev/null; redis-cli --scan --pattern 'user:1*' | sort -V | tr '\n' ' '; echo; redis-cli --scan --pattern 'user:*' | wc -l
user:1 user:10 user:11 user:12 user:13 user:14 user:15 user:16 user:17 user:18 user:19 
25
$ redis-cli --bigkeys 2>&1 | sed -n '/summary/,$p' | grep -v '^$'
-------- summary -------
Sampled 32 keys in the keyspace!
Total key length in bytes is 216 (avg len 6.75)
Biggest   list found "mylist" has 4 items
Biggest string found "ikki" has 14 bytes
1 lists with 4 items (03.12% of keys, avg size 4.00)
0 hashs with 0 fields (00.00% of keys, avg size 0.00)
0 streams with 0 entries (00.00% of keys, avg size 0.00)
31 strings with 161 bytes (96.88% of keys, avg size 5.19)
0 sets with 0 members (00.00% of keys, avg size 0.00)
0 zsets with 0 members (00.00% of keys, avg size 0.00)
```

- `--scan --pattern 'user:1*'` — mos kalitlar (tartibsiz keladi, bu yerda `sort -V` bilan tartiblandi); `wc -l` bilan sanash.
- `--bigkeys` — eng katta ro'yxat va satr, turlar bo'yicha statistika.

### Ulanish xatosi va yordam

```text vps
$ redis-cli -p 9999 PING; echo "exit: $?"
Could not connect to Redis at 127.0.0.1:9999: Connection refused
exit: 1
```

Ulanib bo'lmasa — xabar va chiqish kodi `1` (skriptda tekshirish uchun).

`HELP INCR` (terminalda rangli chiqadi):

```text
  INCR key
  summary: Increments the integer value of a key by one. Uses 0 as initial value if the key doesn't exist.
  since: 1.0.0
  group: string
```

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Skriptda `(integer)` kabi chiqishni kutish | Pipe va faylda xom rejim | `--no-raw` yoki xom qiymat bilan ishlash |
| Parolni `-a` bilan berish | RD xavfsizlik uchun boshqa yo'lni tavsiya qiladi | `REDISCLI_AUTH` |
| Production'da `KEYS *` | Serverni bloklaydi | `redis-cli --scan --pattern` |
| Buyruq satrida `"\n"` ni yangi qator deb kutish | Shell uni aynan uzatadi (sinovda 12 bayt) | Stdin/interaktiv rejim yoki `-x` |
| `--csv` bilan butun bazani eksport qilish | Faqat bitta buyruq natijasi | Zaxira — RDB (28-bob) |
| `-n` ni Cluster bilan ishlatish | Cluster'da faqat `0` | Kalit prefikslari (4-bob) |

## Amaliyot

1. `redis-cli INCR x` terminalda va `redis-cli INCR x > fayl` da natija qanday farq qiladi? Nega?
2. Parolni qanday xavfsiz berish kerak?
3. `"Salom\tdunyo"` va `'Salom\tdunyo'` interaktiv rejimda qanday farq qiladi?
4. Fayl mazmunini kalitga qanday yozish mumkin?
5. Nega kalitlar ro'yxati uchun `--scan`, `KEYS *` emas?
6. `redis-cli -n 3` nima qiladi?

<details>
<summary>Javoblar</summary>

1. Terminalda `(integer) N`, faylda faqat `N`: chiqish terminal bo'lmasa `redis-cli` xom rejimga o'tadi.
2. `REDISCLI_AUTH` muhit o'zgaruvchisi bilan.
3. Ikki qo'shtirnoqda `\t` — tab belgisi; bitta qo'shtirnoqda — aynan `\t` ikki belgi.
4. `redis-cli -x SET kalit < fayl`.
5. `SCAN` serverni bloklamaydi; `KEYS *` katta bazada serverni to'xtatib qo'yadi.
6. 3-raqamli ma'lumotlar bazasiga ulanadi.

</details>

## Rasmiy hujjat

- [RD: Redis CLI](https://redis.io/docs/latest/develop/tools/cli/)
- [RD: SCAN](https://redis.io/docs/latest/commands/scan/) · [SELECT](https://redis.io/docs/latest/commands/select/)
