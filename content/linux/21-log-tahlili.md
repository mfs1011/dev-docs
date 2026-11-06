# 21 — Amaliy: log tahlili

[← Oldingi: Matnni o'zgartirish](20-matnni-ozgartirish.md) · [Mundarija](README.md) · [Keyingi: Foydalanuvchi va guruh →](22-foydalanuvchi-va-guruh.md)

## Vaziyat

Foydalanuvchilar ertalab 10:00–10:30 orasida "buyurtma berib bo'lmadi" deb shikoyat qildi. Sizda veb-serverning kirish logi bor: biri joriy, biri aylantirilgan va siqilgan. Savollar:

1. Shu vaqt ichida qancha so'rov keldi va qanchasi xato bilan tugadi?
2. Xatolar qaysi manzilda va qachon bo'ldi?
3. Shubhali faollik bormi?

Bu bobda yangi buyruq yo'q. 17–20-boblardagi `zcat`, `awk`, `sort`, `uniq`, `grep` birlashtiriladi. Debian Reference ham shu yo'lni ko'rsatadi: kichik buyruqlarni pipe bilan ulash va murakkablashsa, skript yozish.

## Logni tayyorlash

Trenajorda bir xil log olish uchun uni `awk` bilan yaratamiz. `srand(7)` tasodifiy sonlarni har safar bir xil qiladi, shuning uchun natijalaringiz bu bobdagi bilan mos keladi:

<details>
<summary>Logni yaratish buyrug'i</summary>

```text
$ mkdir -p /tmp/tahlil && cd /tmp/tahlil
$ awk 'BEGIN { srand(7); split("10.0.0.5 10.0.0.7 10.0.0.12 192.168.1.20 192.168.1.33 172.16.0.4", ip, " "); split("/ /api/users /api/orders /api/products /static/app.js /static/app.css", p, " "); for (t = 0; t < 1800; t++) { m = int(t / 60); s = t % 60; a = ip[int(rand() * 6) + 1]; u = p[int(rand() * 6) + 1]; c = 200; if (rand() < 0.03) c = 404; if (m >= 20 && m < 23 && u == "/api/orders" && rand() < 0.7) c = 500; printf "%s - - [06/Nov/2026:10:%02d:%02d +0000] \"GET %s HTTP/1.1\" %d %d\n", a, m, s, u, c, int(rand() * 5000) + 100; if (m >= 12 && m < 14 && s % 2 == 0) printf "203.0.113.9 - - [06/Nov/2026:10:%02d:%02d +0000] \"POST /api/login HTTP/1.1\" 401 64\n", m, s } }' > hammasi.log
$ head -n 1000 hammasi.log > access.log.1 && gzip access.log.1 && tail -n +1001 hammasi.log > access.log && rm hammasi.log
```

</details>

Ubuntu VPS'dagi `gawk` 5.3.2 xuddi shu faylni yaratdi (`md5sum` bir xil).

```text
$ ls -lh
total 76K
-rw-r--r-- 1 root root  67K Nov  6 05:09 access.log
-rw-r--r-- 1 root root 7.6K Nov  6 05:09 access.log.1.gz
$ wc -l access.log
860 access.log
```

Joriy logda faqat 860 qator — vaqtning boshi `access.log.1.gz` da. Ikkalasini birga o'qish kerak.

## 1-qadam: barcha loglarni bitta oqimga

```text
$ zcat -f access.log.1.gz access.log | wc -l
1860
$ zcat -f access.log.1.gz access.log | head -n 2
10.0.0.5 - - [06/Nov/2026:10:00:00 +0000] "GET /api/orders HTTP/1.1" 200 2324
10.0.0.5 - - [06/Nov/2026:10:00:01 +0000] "GET /api/orders HTTP/1.1" 200 2013
$ zcat -f access.log.1.gz access.log > tahlil.log
```

`zcat` siqilgan faylni ochadi. gzip man sahifasiga ko'ra `-f` bilan siqilmagan faylni o'zgartirmasdan chiqaradi: "zcat `cat` kabi ishlaydi". Shuning uchun bitta buyruq ikkala faylni ham o'qiydi.

Fayllar tartibi muhim: eskisi (`.1.gz`) oldin. Keyingi qadamlar uchun natijani `tahlil.log` ga saqlab qo'ydik.

## 2-qadam: umumiy rasm

```text
$ awk '{print $9}' tahlil.log | sort | uniq -c | sort -rn
   1731 200
     60 401
     53 404
     16 500
```

20-bobdagi "sanash quvuri": 9-ustun (javob kodi) → saralash → sanash → ko'pidan ozigacha. 1860 so'rovdan:

- `500` — **16 ta**. Server ichidagi xato. Shikoyat shunga o'xshaydi.
- `401` — **60 ta**. Avtorizatsiya rad etilgan: kimdir noto'g'ri parol bilan kiryapti.
- `404` — 53 ta. Mavjud bo'lmagan sahifa, odatiy shovqin.

## 3-qadam: 500 xatolari — qayerda va qachon

```text
$ awk '$9 >= 500 {print $7}' tahlil.log | sort | uniq -c | sort -rn
     16 /api/orders
$ awk '$9 >= 500 {print substr($4, 14, 5)}' tahlil.log | uniq -c
      6 10:20
      5 10:21
      5 10:22
```

- Hamma 500 xato — **`/api/orders`** da.
- Ular **10:20–10:22** oralig'ida, uch daqiqada bo'lgan.

`substr($4, 14, 5)` — 4-ustundan (`[06/Nov/2026:10:20:13`) 14-belgidan boshlab 5 ta belgi, ya'ni `10:20`. Log vaqt bo'yicha tartiblangan, shuning uchun bu yerda `sort` kerak emas: bir daqiqaning qatorlari allaqachon yonma-yon.

Endi shu vaqt oralig'ini to'liq kesib olamiz:

```text
$ awk '$4 >= "[06/Nov/2026:10:20:00" && $4 < "[06/Nov/2026:10:23:00"' tahlil.log | wc -l
180
$ awk '$4 >= "[06/Nov/2026:10:20:00" && $4 < "[06/Nov/2026:10:23:00"' tahlil.log | head -n 1
192.168.1.33 - - [06/Nov/2026:10:20:00 +0000] "GET /static/app.js HTTP/1.1" 200 2215
$ awk '$4 >= "[06/Nov/2026:10:20:00" && $4 < "[06/Nov/2026:10:23:00"' tahlil.log | tail -n 1
10.0.0.7 - - [06/Nov/2026:10:22:59 +0000] "GET / HTTP/1.1" 200 4394
```

`awk` vaqtni **matn** sifatida solishtiryapti. Bu ishlaydi, chunki hamma qatorda vaqt bir xil formatda va bir kunda: `10:20:00` matn sifatida ham `10:19:59` dan keyin keladi. Bir necha kunlik logda bunday solishtirish buziladi: oy nomlari (`Nov`, `Dec`) alifbo bo'yicha emas, kalendar bo'yicha tartiblanadi.

Bu 180 qator — ilova logi bilan solishtirish uchun boshlang'ich nuqta. Servis loglarini aynan shu vaqt bo'yicha `journalctl --since` bilan olish 37-bobda.

## 4-qadam: 401 — kim?

```text
$ awk '$9 == 401 {print $1}' tahlil.log | sort | uniq -c
     60 203.0.113.9
$ awk '$9 == 401 {print substr($4, 14, 5)}' tahlil.log | uniq -c
     30 10:12
     30 10:13
```

Hamma 60 ta rad etilgan so'rov **bitta IP** dan, ikki daqiqa ichida, har 2 soniyada. Bu parolni terib topishga urinish (brute force) belgisi. `203.0.113.9` — hujjatlar va misollar uchun ajratilgan manzillardan (RFC 5737), shuning uchun bu yerda ishlatildi.

Daqiqalar bo'yicha yuklama ham buni ko'rsatadi:

```text
$ awk '{print substr($4, 14, 5)}' tahlil.log | uniq -c | sort -rn | head -n 3
     90 10:13
     90 10:12
     60 10:29
```

Odatda daqiqasiga 60 so'rov, 10:12 va 10:13 da esa 90 ta: hujum qo'shgan 30 ta.

## 5-qadam: hajm

```text
$ awk '{s += $10} END {printf "%.1f MB\n", s / 1024 / 1024}' tahlil.log
4.4 MB
$ sort -k10 -n -r tahlil.log | head -n 2
172.16.0.4 - - [06/Nov/2026:10:25:54 +0000] "GET /api/products HTTP/1.1" 200 5090
10.0.0.12 - - [06/Nov/2026:10:18:53 +0000] "GET /static/app.js HTTP/1.1" 200 5081
```

`sort -k10 -n -r` — butun qatorlarni 10-ustun bo'yicha son sifatida, kattasidan saralaydi. Eng og'ir javoblar oddiy, shubhali narsa yo'q.

## Tuzoq: `grep` bilan sanash

```text
$ grep -c 500 tahlil.log
20
$ grep -c ' 500 ' tahlil.log
16
$ awk '$9 == 500' tahlil.log | wc -l
16
```

`grep 500` **20** deydi, haqiqatda esa 500 xato **16** ta. Ortiqcha 4 tasi qaysilar:

```text
$ grep 500 tahlil.log | awk '$9 != 500'
10.0.0.5 - - [06/Nov/2026:10:05:26 +0000] "GET /api/users HTTP/1.1" 200 5001
10.0.0.7 - - [06/Nov/2026:10:11:50 +0000] "GET /api/products HTTP/1.1" 200 1500
172.16.0.4 - - [06/Nov/2026:10:15:50 +0000] "GET / HTTP/1.1" 200 3500
10.0.0.5 - - [06/Nov/2026:10:24:13 +0000] "GET /api/users HTTP/1.1" 200 5009
```

Hammasi muvaffaqiyatli (`200`) so'rovlar: `500` raqami javob hajmida (`5001`, `1500`) uchragan. Probellar yordam beradi, lekin eng ishonchlisi — `awk` bilan aynan 9-ustunni tekshirish.

## Xulosa

| Savol | Javob | Buyruq |
| --- | --- | --- |
| Jami so'rov | 1860 | `zcat -f ... \| wc -l` |
| 500 xatolar | 16, faqat `/api/orders`, 10:20–10:22 | `awk '$9 >= 500 ...'` |
| 401 | 60, bitta IP `203.0.113.9`, 10:12–10:13 | `awk '$9 == 401 ...'` |
| Yuklama | odatda 60/daq, hujumda 90/daq | `substr($4, 14, 5)` + `uniq -c` |

Shikoyatning sababi — 10:20–10:22 da `/api/orders` dagi server xatosi. Endi ilova logidan aynan shu uch daqiqani ko'rish kerak. 401 hujumi alohida masala: u buyurtmalarga ta'sir qilmagan (vaqtlari kesishmaydi), lekin e'tibor talab qiladi.

Bu tekshiruvni har kuni qo'lda yozish shart emas: buyruqlarni skriptga yig'ish 48–51-boblarda.

## Debian va Ubuntu

Bu bobdagi barcha hisoblar VPS'da ham bajarildi: `gawk` bir xil logni yaratdi, rust-coreutils'dagi `sort` va `uniq` bir xil sonlarni berdi (`320 10.0.0.12`, `1731 200`, `16 500`, `grep -c 500` → `20`).

## Tipik xatolar

**1. Faqat joriy logga qarash.**
Voqeaning boshi aylantirilgan `.1` yoki `.gz` faylda qolib ketadi.
To'g'risi: `zcat -f eski.gz joriy` — tartib bilan.

**2. `grep 500` bilan javob kodini sanash.**
Javob hajmidagi raqamlar ham sanaladi.
To'g'risi: `awk '$9 == 500'`.

**3. `sort` siz `uniq -c`.**
Log vaqt bo'yicha tartiblangan, IP bo'yicha emas.
To'g'risi: IP, yo'l, kod uchun `sort | uniq -c`. Daqiqalar uchun `sort` shart emas — ular allaqachon tartibda.

**4. Bir necha kunlik logda vaqtni matn sifatida solishtirish.**
Oy nomlari alifbo tartibida emas.
To'g'risi: bir kun ichida ishlating yoki vaqtni avval son ko'rinishiga keltiring.

## Amaliyot

**[Mashqni boshlash →](/linux/trenajor?mashq=21-log-tahlili)** "Log tahlili": shu bobdagi tergovni o'zingiz qilasiz — loglarni birlashtirasiz, xato kodlari, 500 lar vaqti va shubhali IP'ni topasiz.

Savollar:

1. `zcat -f a.log.1.gz a.log` dagi `-f` nima uchun kerak?
2. Eng ko'p 404 olgan 5 ta yo'lni qanday topasiz?
3. Nega `grep -c 500` va `awk '$9 == 500'` har xil son berdi?
4. Daqiqalar bo'yicha sanaganda nega `uniq -c` dan oldin `sort` shart emas edi?

<details>
<summary>Javoblar</summary>

1. Siqilmagan `a.log` ni ham o'zgartirmasdan chiqarishi uchun.
2. `awk '$9 == 404 {print $7}' tahlil.log | sort | uniq -c | sort -rn | head -n 5`.
3. `grep` qatorning istalgan joyida `500` ni topdi, javob hajmida ham (`1500`, `5001`). `awk` faqat 9-ustunni tekshirdi.
4. Log vaqt bo'yicha yozilgan: bir daqiqaning qatorlari allaqachon yonma-yon.

</details>

## Rasmiy hujjat

- [Debian Reference 1.6.5 — Extracting data from text file table](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_extracting_data_from_text_file_table)
- [Debian Reference 1.6.6 — Script snippets for piping commands](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_script_snippets_for_piping_commands)
- [GNU Awk User's Guide — String Functions (substr)](https://www.gnu.org/software/gawk/manual/html_node/String-Functions.html)
- [gzip(1) — Debian bookworm](https://manpages.debian.org/bookworm/gzip/gzip.1.en.html)
- [RFC 5737 — IPv4 Address Blocks Reserved for Documentation](https://www.rfc-editor.org/rfc/rfc5737)
