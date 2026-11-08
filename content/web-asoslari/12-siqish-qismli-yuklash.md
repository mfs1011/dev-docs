# 12 — Siqish va qismli yuklash

[Mundarija](README.md)

## Tushuncha

Ikki mavzu — ikkalasi ham uzatiladigan baytlarni kamaytiradi:

- **siqish** — javobni kichikroq qilib yuborish;
- **qismli yuklash** — resursning faqat kerakli bo'lagini so'rash.

### Siqish uch darajada

MDN (Compression in HTTP): siqish ba'zi hujjatlarni 70% gacha kichraytiradi. Dasturchi algoritmni o'zi yozmaydi — brauzer va serverda bor, faqat server to'g'ri sozlanishi kerak. Uch daraja:

| Daraja | Qayerda | Misol |
| --- | --- | --- |
| **Fayl formati** | Faylning o'zi siqilgan | Yo'qotishsiz (lossless): `png`, `gif`; yo'qotishli (lossy): `jpeg`, video. `webp` — ikkalasi |
| **Uchdan-uchgacha** (end-to-end) | Server tanani siqadi, oraliq tugunlar unga tegmaydi, mijoz ochadi | `Content-Encoding: gzip` |
| **Bo'g'indan-bo'g'ingacha** (hop-by-hop) | Ikki qo'shni tugun orasida | `TE` / `Transfer-Encoding` — amalda kam ishlatiladi |

MDN: siqilgan faylni ikkinchi marta siqish odatda foyda bermaydi, hatto **kattalashtiradi** (algoritmning qo'shimcha ma'lumoti yutuqdan ko'p). Shuning uchun HTTP siqish rasm, audio, video uchun yoqilmaydi.

### Kelishish: `Accept-Encoding` va `Content-Encoding`

Uchdan-uchgacha siqishda algoritm **kontentni kelishish** bilan tanlanadi (9-bob):

```http
GET /doc HTTP/1.1
Accept-Encoding: br, gzip

HTTP/1.1 200 OK
Content-Encoding: br
Vary: Accept-Encoding
```

- `Accept-Encoding` — mijoz qo'llaydigan algoritmlar (ustuvorligi bilan, `q`).
- `Content-Encoding` — server qaysi birini ishlatgani.
- `Vary: Accept-Encoding` — kesh siqilgan va siqilmagan nusxalarni aralashtirmasligi uchun (11-bob).

MDN: hozir asosiylari — `gzip` (eng keng tarqalgan) va `br` (Brotli). Zamonaviy formatlar (Brotli, Zstandard) lug'at (dictionary) bilan yanada yaxshi siqadi. nginx'da siqish — `ngx_http_gzip_module`.

### Qismli so'rov: `Range`

MDN (HTTP range requests): `Range` so'rovi resursning **bir qismini** so'raydi. Kerak bo'ladi: istalgan joyga o'tadigan media pleyerlarga, katta faylning faqat bir qismi kerak bo'lgan dasturlarga, yuklashni to'xtatib, keyin davom ettiradigan yuklovchilarga.

| Header | Kim yuboradi | Ma'nosi |
| --- | --- | --- |
| `Accept-Ranges: bytes` | Server | Qismli so'rovlar qo'llanadi; birlik — bayt. Yo'q yoki `none` — qo'llanmaydi |
| `Range: bytes=0-1023` | Mijoz | Qaysi baytlar kerak |
| `Content-Range: bytes 0-1023/146515` | Server | Yuborilgan qism to'liq resursning qayeri; `/` dan keyin — to'liq hajm |
| `If-Range: <ETag yoki sana>` | Mijoz | "Resurs o'zgarmagan bo'lsa — qismni ber, o'zgargan bo'lsa — butunini" |

`Range` qiymati shakllari: `0-1023` (boshidan 1024 bayt), `500-` (500-baytdan oxirigacha), `-500` (oxirgi 500 bayt), vergul bilan bir nechta oraliq.

Javoblar (MDN):

| Kod | Qachon |
| --- | --- |
| `206 Partial Content` | Qism yuborildi. `Content-Length` — **qismning** hajmi |
| `416 Range Not Satisfiable` | Oraliq resurs chegarasidan tashqarida |
| `200 OK` | Server qismli so'rovni qo'llamaydi — butun resurs |

Bir nechta oraliq so'ralsa — javob `multipart/byteranges`: har qism o'z `Content-Type` va `Content-Range` i bilan, chegaralovchi (boundary) qator bilan ajratilgan (6-bobdagi `multipart/form-data` ga o'xshash).

## Ko'rib chiqamiz

VPS'da nginx 1.30.6, sozlama:

```nginx
server {
    listen 8080;
    root /usr/share/nginx/html;

    gzip on;
    gzip_types application/javascript text/plain image/jpeg;
    gzip_vary on;
}
```

nginx hujjati: `gzip on` — siqishni yoqadi (standart `off`); `gzip_types` — `text/html` dan **tashqari** qaysi turlar siqilsin (`text/html` doim siqiladi); `gzip_vary on` — `Vary: Accept-Encoding` qo'shadi (standart `off`). `image/jpeg` bu yerda **ataylab** qo'shilgan — ikkinchi marta siqish nima berishini ko'rish uchun.

Fayllar: `sahifa.html` (800 qator HTML), `app.js` (600 ta funksiya), `rasm.jpg` (50 KB tasodifiy bayt — siqilgan ma'lumotga o'xshaydi), `raqamlar.txt` (1000 bayt: `000`, `001`, … ketma-ket):

```text vps
26184 app.js
1000 raqamlar.txt
51200 rasm.jpg
44692 sahifa.html
```

### Qancha tejaladi

```text vps
$ for f in sahifa.html app.js rasm.jpg; do a=$(curl -s -o /dev/null -w '%{size_download}' http://127.0.0.1:8080/$f); g=$(curl -s -H 'Accept-Encoding: gzip' -o /dev/null -w '%{size_download}' http://127.0.0.1:8080/$f); echo "$f: siqilmagan $a bayt, gzip $g bayt"; done
sahifa.html: siqilmagan 44692 bayt, gzip 2107 bayt
app.js: siqilmagan 26184 bayt, gzip 2858 bayt
rasm.jpg: siqilmagan 51200 bayt, gzip 51238 bayt
```

| Fayl | Siqilmagan | gzip | Natija |
| --- | --- | --- | --- |
| `sahifa.html` | 44692 | 2107 | ~21 marta kichik (takrorlanuvchi matn) |
| `app.js` | 26184 | 2858 | ~9 marta kichik |
| `rasm.jpg` | 51200 | 51238 | **38 bayt katta** — MDN aytgandek |

Bu fayllar sun'iy va juda takrorlanuvchi; haqiqiy HTML/JS'da nisbat kamroq bo'ladi. Lekin yo'nalish bir xil: matn yaxshi siqiladi, siqilgan ma'lumot — yo'q.

### Header'lar

```text vps
$ curl -sI http://127.0.0.1:8080/sahifa.html | tr -d '\r' | grep -i '^content-length\|^content-encoding\|^vary\|^etag\|^accept-ranges'
Content-Length: 44692
Vary: Accept-Encoding
ETag: "6af03b08-ae94"
Accept-Ranges: bytes
$ curl -sI -H 'Accept-Encoding: gzip' http://127.0.0.1:8080/sahifa.html | tr -d '\r' | grep -i '^content-length\|^content-encoding\|^vary\|^etag\|^accept-ranges'
Vary: Accept-Encoding
ETag: W/"6af03b08-ae94"
Content-Encoding: gzip
```

Siqilgan javobda:

- `Content-Encoding: gzip`;
- `Content-Length` yo'q — siqilgan tananing hajmi oldindan aytilmadi (kuzatildi; bunday javob bo'laklab yuboriladi, 6-bob);
- `Accept-Ranges` yo'q — siqilgan javobda qismli so'rov taklif qilinmadi (kuzatildi);
- `ETag` oldiga `W/` qo'shildi — **kuchsiz** (weak) validator. RFC 9110 (8.8.1): **kuchli** validator tana baytlari o'zgarganda o'zgaradi; kuchsizi — faqat ma'nosi o'zgarganda. Siqilgan baytlar asl fayldan boshqa, ma'nosi esa bir xil — kuchli belgi endi to'g'ri kelmaydi va nginx uni kuchsizga aylantirdi (kuzatildi).

Mijoz siqilgan javobni ochganda asl fayl chiqadimi — `curl --compressed` (qo'llanma: siqilgan javob so'raydi va o'zi ochadi):

```text vps
$ curl -s --compressed http://127.0.0.1:8080/sahifa.html | sha256sum; sha256sum < /tmp/k12/html/sahifa.html
cc47497d26fd7ae991aeb33bd1d6d38a86aae43152ecc1dd25d4c277866a3397  -
cc47497d26fd7ae991aeb33bd1d6d38a86aae43152ecc1dd25d4c277866a3397  -
```

Xeshlar bir xil — `gzip` yo'qotishsiz.

Server bilmaydigan algoritm va haqiqiy sayt:

```text vps
$ curl -sI -H 'Accept-Encoding: br' http://127.0.0.1:8080/sahifa.html | tr -d '\r' | grep -i '^content-length\|^content-encoding'
Content-Length: 44692
$ curl -sI -H 'Accept-Encoding: br, gzip, zstd' https://developer.mozilla.org/en-US/ | tr -d '\r' | grep -i '^HTTP\|^content-encoding\|^vary'
HTTP/2 200 
content-encoding: br
vary: Accept-Encoding
```

- Bu nginx'da `br` moduli yo'q — faqat `br` so'ralganda server siqmasdan yubordi (`Content-Encoding` yo'q). Kelishuvda mos variant topilmasa — siqilmagan javob.
- MDN uchta variantdan `br` ni tanladi.

### Qismli so'rovlar

```text vps
$ cat /tmp/k12/html/raqamlar.txt | head -c 40; echo
0000010020030040050060070080090100110120
$ curl -sI http://127.0.0.1:8080/raqamlar.txt | tr -d '\r' | grep -i '^HTTP\|^content-length\|^accept-ranges\|^etag'
HTTP/1.1 200 OK
Content-Length: 1000
ETag: "6af03b08-3e8"
Accept-Ranges: bytes
```

`Accept-Ranges: bytes` — server qismlarni beradi. Birinchi 10 bayt (`curl -r 0-9` — `Range: bytes=0-9`):

```text vps
$ curl -si -r 0-9 http://127.0.0.1:8080/raqamlar.txt | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:\|^Last-Modified:'; echo
HTTP/1.1 206 Partial Content
Content-Type: text/plain
Content-Length: 10
Vary: Accept-Encoding
ETag: "6af03b08-3e8"
Content-Range: bytes 0-9/1000

0000010020
```

`206`, `Content-Length: 10` — qism hajmi, `Content-Range: bytes 0-9/1000` — 1000 baytdan 0–9-baytlar.

Oxirgi 5 bayt:

```text vps
$ curl -si -H 'Range: bytes=-5' http://127.0.0.1:8080/raqamlar.txt | tr -d '\r' | grep -i '^HTTP\|^content-range'; curl -s -H 'Range: bytes=-5' http://127.0.0.1:8080/raqamlar.txt; echo
HTTP/1.1 206 Partial Content
Content-Range: bytes 995-999/1000
13323
```

Ikki oraliq:

```text vps
$ curl -si -H 'Range: bytes=0-4, 10-14' http://127.0.0.1:8080/raqamlar.txt | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:\|^Last-Modified:'
HTTP/1.1 206 Partial Content
Content-Type: multipart/byteranges; boundary=00000000000000000001
Content-Length: 210
Vary: Accept-Encoding
ETag: "6af03b08-3e8"


--00000000000000000001
Content-Type: text/plain
Content-Range: bytes 0-4/1000

00000
--00000000000000000001
Content-Type: text/plain
Content-Range: bytes 10-14/1000

03004
--00000000000000000001--
```

`multipart/byteranges`: ikki qism, har biri o'z `Content-Range` i bilan.

Chegaradan tashqari:

```text vps
$ curl -si -H 'Range: bytes=5000-' http://127.0.0.1:8080/raqamlar.txt | tr -d '\r' | grep -i '^HTTP\|^content-range'
HTTP/1.1 416 Requested Range Not Satisfiable
Content-Range: bytes */1000
```

`416`; `Content-Range: bytes */1000` — "resurs 1000 bayt" (RFC 9110, 14.4: bajarib bo'lmaydigan oraliqda shu shakl).

### `If-Range` va yuklashni davom ettirish

```text vps
If-Range mos: 206 10 bayt
If-Range eski: 200 1000 bayt
```

`If-Range` da joriy `ETag` — `206` va 10 bayt; eski `ETag` (`"eski"`) — resurs o'zgargan deb hisoblanib, **butun** fayl `200` bilan keldi. Shu tufayli yuklovchi o'zgargan faylning eski va yangi bo'laklarini aralashtirmaydi.

To'xtatilgan yuklashni davom ettirish: avval 300 bayt yuklandi (uzilish o'rniga), keyin `curl -C -` (qo'llanma: qayerdan davom etishni fayldan o'zi aniqlaydi):

```text vps
$ curl -s -r 0-299 -o /tmp/k12/qism.txt http://127.0.0.1:8080/raqamlar.txt; wc -c < /tmp/k12/qism.txt; curl -s -C - -o /tmp/k12/qism.txt -w '%{http_code} %{size_download} bayt yuklandi\n' http://127.0.0.1:8080/raqamlar.txt; cmp /tmp/k12/qism.txt /tmp/k12/html/raqamlar.txt && echo "fayl to'liq va bir xil"
300
206 700 bayt yuklandi
fayl to'liq va bir xil
```

Faylda 300 bayt bor edi — curl `Range: bytes=300-` yubordi, qolgan **700** bayt `206` bilan keldi, fayl asliga to'liq mos.

## Standartda nima deyilgan

| Hujjat | Bo'lim | Gap |
| --- | --- | --- |
| RFC 9110 | 8.4, 8.4.1.3 | `Content-Encoding`; `gzip` kodlashi |
| RFC 9110 | 12.5.3 | `Accept-Encoding` |
| RFC 9110 | 8.8.1 | Kuchli va kuchsiz validatorlar |
| RFC 9110 | 14.1.2 | Bayt oraliqlari: `0-499`, `500-`, `-500` |
| RFC 9110 | 14.2 | `Range`. Server uni e'tiborsiz qoldirishi **mumkin**, lekin imkon qadar qo'llashi kerak — uzilgan yuklashni tiklash uchun |
| RFC 9110 | 14.3, 14.4 | `Accept-Ranges`, `Content-Range` (`bytes */1000` — bajarib bo'lmaydigan oraliq) |
| RFC 9110 | 14.6 | `multipart/byteranges` |
| RFC 9110 | 13.1.5 | `If-Range` |
| RFC 9110 | 15.3.7, 15.5.17 | `206`, `416` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Siqishni yoqmaslik | Matnli resurslar bir necha marta katta ketadi (sinovda 44692 → 2107 bayt) | `gzip on` va `gzip_types` ga CSS/JS/JSON/SVG |
| `gzip_types` ga rasm/video qo'shish | Siqilgan ma'lumot kichraymaydi, kattalashadi (sinovda +38 bayt), protsessor vaqti ketadi | Faqat matnli turlar |
| `Vary: Accept-Encoding` siz siqish | Kesh siqilgan nusxani siqishni bilmaydigan mijozga berishi mumkin | `gzip_vary on` |
| Faqat `text/html` siqiladi deb bilmaslik | nginx'da standart `gzip_types text/html` | CSS, JS, JSON'ni qo'lda qo'shish |
| Katta fayl yuklashni har uzilishda boshidan boshlash | Server `Range` ni qo'llasa, davom ettirish mumkin | `curl -C -`; yuklovchida `Range` + `If-Range` |
| `206` dagi `Content-Length` ni to'liq hajm deb olish | U qism hajmi | To'liq hajm — `Content-Range` dagi `/` dan keyin |
| Qismlarni `If-Range` siz yig'ish | Fayl o'rtada o'zgarsa — eski va yangi bo'laklar aralashadi | `If-Range: <ETag>` |

## Amaliyot

1. Siqishning uch darajasini ayting. Qaysi biri sayt tezligiga eng ko'p ta'sir qiladi?
2. Nega JPEG rasmni `gzip` bilan siqish foydasiz?
3. `Accept-Encoding`, `Content-Encoding`, `Vary` — har birini kim yuboradi va nima uchun?
4. `Content-Range: bytes 200-299/5000` — qancha bayt keldi va to'liq fayl qancha?
5. `Range: bytes=9000-` 5000 baytli faylga — javob qanday?
6. `If-Range` nima uchun kerak?

<details>
<summary>Javoblar</summary>

1. Fayl formati, uchdan-uchgacha (`Content-Encoding`), bo'g'indan-bo'g'ingacha. MDN: eng katta yutuq — uchdan-uchgacha.
2. JPEG allaqachon siqilgan; qayta siqish kichraytirmaydi, hatto kattalashtiradi.
3. `Accept-Encoding` — mijoz (qaysi algoritmlarni biladi); `Content-Encoding` — server (qaysi biri ishlatildi); `Vary` — server (kesh nusxalarni `Accept-Encoding` bo'yicha ajratsin).
4. 100 bayt (200–299); to'liq fayl 5000 bayt.
5. `416 Range Not Satisfiable`, `Content-Range: bytes */5000`.
6. Resurs o'zgarmagan bo'lsa qism (`206`), o'zgargan bo'lsa butun fayl (`200`) olish uchun — bo'laklar aralashib ketmasligi uchun.

</details>

## Rasmiy hujjat

- [MDN: Compression in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression)
- [MDN: HTTP range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests)
- [RFC 9110 §8.4: Content-Encoding](https://www.rfc-editor.org/rfc/rfc9110#name-content-encoding) · [§14: Range Requests](https://www.rfc-editor.org/rfc/rfc9110#name-range-requests)
- [nginx: ngx_http_gzip_module](https://nginx.org/en/docs/http/ngx_http_gzip_module.html)
- [curl qo'llanmasi: `--compressed`, `-r`, `-C`](https://curl.se/docs/manpage.html)
