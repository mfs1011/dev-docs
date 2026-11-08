# 08 — Siqish

[Mundarija](README.md)

## Tushuncha

NA (Compression and Decompression): javoblarni **siqish** uzatiladigan ma'lumotni ko'pincha ancha kamaytiradi. Lekin siqish ish vaqtida bajariladi va protsessorga sezilarli yuk qo'shishi mumkin. nginx javobni mijozga yuborishdan oldin siqadi, allaqachon siqilgan javoblarni (masalan, orqadagi server siqqan) **qayta siqmaydi**.

Mijoz qaysi siqishni tushunishini `Accept-Encoding` so'rov header'ida aytadi; server siqsa — javobda `Content-Encoding: gzip` (Web asoslari kitobi).

### `gzip` direktivalari

| Direktiva | Standart (NG) | Nima |
| --- | --- | --- |
| `gzip on;` | `off` | Ish vaqtida gzip siqish |
| `gzip_types` | `text/html` | Qo'shimcha MIME turlari; `text/html` doim siqiladi; `*` — hammasi |
| `gzip_min_length` | `20` | Shundan qisqa javoblar siqilmaydi (uzunlik `Content-Length` dan) |
| `gzip_comp_level` | `1` | Daraja 1–9 |
| `gzip_http_version` | `1.1` | Siqish uchun so'rovning minimal HTTP versiyasi |
| `gzip_vary` | `off` | `Vary: Accept-Encoding` header'ini qo'shish |
| `gzip_proxied` | `off` | Proksi orqali kelgan so'rovlar (`Via` header'i bor) javoblarini siqish shartlari |

NA: bu direktivalar `http`, `server` yoki `location` da bo'la oladi. NA namunasi:

```nginx
server {
    gzip on;
    gzip_types      text/plain application/xml;
    gzip_proxied    no-cache no-store private expired auth;
    gzip_min_length 1000;
    ...
}
```

### Oldindan siqilgan fayllar: `gzip_static`

NA, NG: `gzip_static on;` — `/path/to/file` so'ralganda nginx `/path/to/file.gz` ni qidiradi va yuboradi. Fayl yo'q bo'lsa yoki mijoz gzip'ni qo'llamasa — siqilmagan fayl. Bu ish vaqtida siqish **emas** — faqat oldindan (`gzip` buyrug'i yoki boshqa asbob bilan) siqilgan fayldan foydalanadi. `always` — mijozni tekshirmasdan doim `.gz` (diskda siqilmagan fayl umuman bo'lmasa). NG: asl va siqilgan fayllarning o'zgartirilgan vaqti bir xil bo'lgani tavsiya etiladi. Modul paketda bor (`--with-http_gzip_static_module`, 2-bob).

### Teskari: `gunzip`

NA: ba'zi mijozlar gzip'ni qo'llamaydi; `gunzip on;` — siqilgan ma'lumotni shunday mijozlar uchun ochadi (alohida modul; standart yig'ishda bo'lmasligi mumkin).

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8), `127.0.0.1:8100`.

### Fayllar va konfiguratsiya

```text vps
$ mkdir -p /var/www/gz/css /var/www/gz/max /var/www/gz/tayyor; for i in $(seq 1 400); do echo "<p>Salom, bu $i-qator. nginx gzip bilan sahifani siqadi.</p>"; done > /var/www/gz/sahifa.html; for i in $(seq 1 400); do echo ".blok-$i { color: #333; margin: 0 auto; padding: ${i}px; }"; done > /var/www/gz/css/uslub.css; cp /var/www/gz/css/uslub.css /var/www/gz/uslub.css; cp /var/www/gz/css/uslub.css /var/www/gz/max/uslub.css; echo '<p>kichik</p>' > /var/www/gz/kichik.html; cp /var/www/gz/sahifa.html /var/www/gz/tayyor/; gzip -k -9 /var/www/gz/tayyor/sahifa.html; ls -l /var/www/gz /var/www/gz/tayyor | awk '/^-/ {print $5, $NF}'
14 kichik.html
24692 sahifa.html
23384 uslub.css
24692 sahifa.html
1124 sahifa.html.gz
```

```nginx
server {
    listen 127.0.0.1:8100;
    root /var/www/gz;

    gzip on;
    gzip_min_length 1000;
    gzip_vary on;

    location /css/ {
        gzip_types text/css;
    }
    location /max/ {
        gzip_types text/css;
        gzip_comp_level 9;
    }
    location /tayyor/ {
        gzip off;
        gzip_static on;
    }
}
```

```text vps
$ cp /root/siqish.conf /etc/nginx/conf.d/siqish.conf; rm /root/siqish.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo yuklandi
yuklandi
```

### Siqildimi?

`g URI [Accept-Encoding] [curl parametri]` — yuklangan bayt, `Content-Encoding` va `Vary`:

```text vps
$ g() { curl -s $3 -o /dev/null -D /tmp/h ${2:+-H "Accept-Encoding: $2"} -w '%{size_download}' "http://127.0.0.1:8100$1" > /tmp/s; printf '%-20s %-6s %-6s bayt=%-6s %s %s\n' "$1" "${2:--}" "$(head -1 /tmp/h | cut -d' ' -f1)" "$(cat /tmp/s)" "$(grep -i '^Content-Encoding:' /tmp/h | tr -d '\r')" "$(grep -i '^Vary:' /tmp/h | tr -d '\r')"; }; g /sahifa.html; g /sahifa.html gzip; g /uslub.css gzip; g /css/uslub.css gzip; g /max/uslub.css gzip; g /kichik.html gzip; g /sahifa.html gzip --http1.0
/sahifa.html         -      HTTP/1.1 bayt=24692   Vary: Accept-Encoding
/sahifa.html         gzip   HTTP/1.1 bayt=1092   Content-Encoding: gzip Vary: Accept-Encoding
/uslub.css           gzip   HTTP/1.1 bayt=23384   
/css/uslub.css       gzip   HTTP/1.1 bayt=2085   Content-Encoding: gzip Vary: Accept-Encoding
/max/uslub.css       gzip   HTTP/1.1 bayt=2128   Content-Encoding: gzip Vary: Accept-Encoding
/kichik.html         gzip   HTTP/1.1 bayt=14      
/sahifa.html         gzip   HTTP/1.1 bayt=24692   Vary: Accept-Encoding
```

| So'rov | Bayt | Nega |
| --- | --- | --- |
| `sahifa.html`, `Accept-Encoding` siz | 24 692 | Mijoz gzip so'ramadi |
| `sahifa.html`, `gzip` | **1 092** | `text/html` doim siqiladi — ~22 marta kichik |
| `uslub.css` | 23 384 | `text/css` `gzip_types` da yo'q (server darajasida) |
| `css/uslub.css` | 2 085 | Shu location'da `gzip_types text/css` |
| `max/uslub.css` (`gzip_comp_level 9`) | 2 128 | Kuzatildi: bu kichik, takroriy faylda 9-daraja 1-darajadan **yutmadi** |
| `kichik.html` | 14 | `gzip_min_length 1000` dan kichik |
| `sahifa.html`, HTTP/1.0 | 24 692 | `gzip_http_version 1.1` — HTTP/1.0 so'rov siqilmaydi |

`Vary: Accept-Encoding` — keshlar (brauzer, CDN) siqilgan va siqilmagan nusxani aralashtirmasligi uchun; `gzip_vary on` bilan.

### ETag

```text vps
$ curl -s -D - -o /dev/null http://127.0.0.1:8100/sahifa.html | grep -i '^ETag'; curl -s -D - -o /dev/null -H 'Accept-Encoding: gzip' http://127.0.0.1:8100/sahifa.html | grep -i '^ETag'
ETag: "6af0afd9-6074"
ETag: W/"6af0afd9-6074"
```

Kuzatildi: siqilgan javobda `ETag` **zaif** (`W/` prefiksi bilan) bo'lib qoldi — siqilgan baytlar asl fayl baytlariga teng emas.

### `gzip_static`

```text vps
$ g /tayyor/sahifa.html gzip; g /tayyor/sahifa.html; curl -s -H 'Accept-Encoding: gzip' http://127.0.0.1:8100/tayyor/sahifa.html | gunzip | head -1
/tayyor/sahifa.html  gzip   HTTP/1.1 bayt=1124   Content-Encoding: gzip Vary: Accept-Encoding
/tayyor/sahifa.html  -      HTTP/1.1 bayt=24692   Vary: Accept-Encoding
<p>Salom, bu 1-qator. nginx gzip bilan sahifani siqadi.</p>
```

- `gzip` so'rovi — diskdagi `sahifa.html.gz` (1124 bayt) yuborildi.
- `Accept-Encoding` siz — asl fayl.
- Ochilgan matn — asl sahifa.

Kuzatildi: `gzip -9` bilan oldindan siqilgan fayl (1124) ish vaqtidagi 1-daraja natijasidan (1092) katta chiqdi; afzalligi — **har so'rovda protsessor sarflanmaydi**.

```text vps
$ rm /etc/nginx/conf.d/siqish.conf; rm -rf /var/www/gz; nginx -t -q && nginx -s reload; echo ok
ok
```

## Variantlar

| Usul | Qachon | Narx |
| --- | --- | --- |
| `gzip on` | Dinamik javoblar, ko'p turli fayllar | Har so'rovda protsessor |
| `gzip_static on` | Yig'ish (build) bosqichida siqiladigan statik fayllar | `.gz` fayllarni yangilab turish |
| `gzip_static always` | Diskda faqat `.gz` bor | Gzip'siz mijozlarga `gunzip` kerak |
| Siqmaslik | Rasm, video, arxiv — allaqachon siqilgan | — |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Faqat `gzip on` — CSS/JS siqilyapti deb o'ylash | Standart faqat `text/html` (sinovda CSS siqilmadi) | `gzip_types text/css application/javascript …` |
| `gzip_vary` siz | Kesh siqilgan javobni gzip'siz mijozga berishi mumkin | `gzip_vary on` |
| Rasm, video uchun gzip | Allaqachon siqilgan — foyda yo'q, protsessor sarfi | Faqat matnli turlar |
| Eng yuqori `gzip_comp_level` ni tanlash | Ko'proq protsessor, natija yaxshilanmasligi mumkin (sinovda) | O'lchab tanlash |
| `gzip_static` ni ish vaqtida siqish deb o'ylash | Faqat tayyor `.gz` ni beradi (NA) | Fayllarni oldindan siqish |
| Juda kichik javoblarni siqish | Foyda kam | `gzip_min_length` |

## Amaliyot

1. Standart holatda `gzip on` qaysi MIME turini siqadi?
2. Mijoz siqishni qo'llashini nginx qayerdan biladi?
3. `gzip_vary on` nima uchun kerak?
4. `gzip_static` va `gzip` farqi nima?
5. Sinovda nega `kichik.html` siqilmadi? HTTP/1.0 so'rov-chi?
6. Siqilgan javobda `ETag` qanday o'zgardi?

<details>
<summary>Javoblar</summary>

1. Faqat `text/html`.
2. So'rovdagi `Accept-Encoding` header'idan.
3. Keshlar `Accept-Encoding` ga qarab siqilgan va siqilmagan nusxalarni ajratishi uchun.
4. `gzip` — ish vaqtida siqadi; `gzip_static` — diskdagi tayyor `.gz` faylni beradi.
5. `gzip_min_length 1000` dan kichik; HTTP/1.0 — `gzip_http_version 1.1` sababli.
6. Zaif bo'ldi: `W/"…"`.

</details>

## Rasmiy hujjat

- [NA: Compression and Decompression](https://docs.nginx.com/nginx/admin-guide/web-server/compression/)
- [NG: ngx_http_gzip_module](https://nginx.org/en/docs/http/ngx_http_gzip_module.html)
- [NG: ngx_http_gzip_static_module](https://nginx.org/en/docs/http/ngx_http_gzip_static_module.html)
