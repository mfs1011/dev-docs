# 10 — Redirect'lar

[Mundarija](README.md)

## Tushuncha

MDN (Redirections in HTTP): **yo'naltirish** (URL redirection, URL forwarding) — sahifa, forma yoki butun saytga bir nechta URL berish usuli. Server maxsus javob — **redirect** yuboradi: holat kodi `3` bilan boshlanadi, **`Location`** header'ida yangi manzil. Brauzer redirect olishi bilan darhol `Location` dagi URL'ni yuklaydi; foydalanuvchi buni deyarli sezmaydi, faqat bitta qo'shimcha so'rov-javob vaqti ketadi.

```text
GET /doc HTTP/1.1                 ──►
                                  ◄──  HTTP/1.1 301 Moved Permanently
                                       Location: /doc_new
GET /doc_new HTTP/1.1             ──►
                                  ◄──  HTTP/1.1 200 OK
```

### Kodlar

**Doimiy** (permanent) — eski URL boshqa ishlatilmasligi kerak; qidiruv robotlari, RSS o'quvchilar eski URL'ni yangisiga almashtiradi:

| Kod | Matn | Metod (MDN) | Qachon |
| --- | --- | --- | --- |
| `301` | Moved Permanently | `GET` o'zgarmaydi; boshqalari `GET` ga o'zgarishi **mumkin** | Sayt tuzilmasi o'zgardi |
| `308` | Permanent Redirect | Metod va tana **o'zgarmaydi** | Xuddi shunday, `GET` bo'lmagan so'rovlar uchun ham |

**Vaqtinchalik** (temporary) — robotlar yangi URL'ni eslab qolmaydi:

| Kod | Matn | Metod (MDN) | Qachon |
| --- | --- | --- | --- |
| `302` | Found | `GET` o'zgarmaydi; boshqalari `GET` ga o'zgarishi **mumkin** | Sahifa kutilmagan sabab bilan vaqtincha boshqa joyda |
| `303` | See Other | `GET` o'zgarmaydi; boshqalari **`GET` ga o'zgaradi** (tana yo'qoladi) | `POST`/`PUT` dan keyin natija sahifasiga — sahifani yangilash amalni takrorlamasligi uchun |
| `307` | Temporary Redirect | Metod va tana **o'zgarmaydi** | `302` o'rniga, `GET` bo'lmagan amallar bor saytda |

**Maxsus**: `300 Multiple Choices` — tanadagi variantlardan foydalanuvchi tanlaydi (9-bob, agent boshqaradigan kelishuv); `304 Not Modified` — keshdagi nusxaga "yo'naltiradi" (11-bob).

**Nega 307 va 308 paydo bo'lgan** (RFC 9110, 15.4): HTTP/1.0 da `301` va `302` metodni **saqlashi** kerak edi. Lekin dastlabki brauzerlar `POST` ni kimdir `POST` bilan, kimdir `GET` bilan qayta yubordi; amalda `GET` ga o'tish odat bo'ldi. Shundan keyin metodni **aniq saqlaydigan** `307` va `308` qo'shildi, `301`/`302` esa `POST` ni `GET` ga o'zgartirishga rasman ruxsat beradigan qilib moslashtirildi.

Qoida:

| | Metodni o'zgartirishi mumkin | Metodni saqlaydi |
| --- | --- | --- |
| Doimiy | `301` | `308` |
| Vaqtinchalik | `302` (`303` — doim `GET`) | `307` |

### Redirect'ning boshqa usullari

MDN: HTTP redirect — eng yaxshi usul. Server sizning qo'lingizda bo'lmasa:

- **HTML**: `<meta http-equiv="Refresh" content="0; URL=https://example.com/">` — faqat HTML sahifa uchun; kirish imkoniyati (accessibility) uchun vaqt doim `0`.
- **JavaScript**: `window.location = "https://example.com/"` — faqat JS bajaradigan mijozda.

Tartib: avval HTTP redirect, keyin JavaScript, keyin `<meta>` (u sahifa to'liq yuklangandan keyin ishlaydi).

### Qachon ishlatiladi

MDN:

- **Domen taxalluslari**: `example.com` → `www.example.com`; yangi domenga ko'chish; `http://` → `https://`.
- **Havolalarni saqlash**: sayt tuzilmasi o'zgarganda eski URL'lar ishlashda davom etsin. Ichki havolalarda redirect'dan qochish kerak — har biri qo'shimcha so'rov; havolani tuzatgan yaxshi.
- **Xavfsiz bo'lmagan so'rovdan keyin**: `POST` natijasini to'g'ridan-to'g'ri qaytarsa, "yangilash" tugmasi `POST` ni qayta yuboradi. Server `303` bilan natija sahifasiga yo'naltirsa, yangilash faqat shu sahifani qayta ochadi.
- **Uzoq amallar**: `303` bilan "amal rejalashtirildi" sahifasiga.

### Redirect halqasi

MDN: redirect cheksiz takrorlansa — **halqa** (redirection loop): sahifa hech qachon topilmaydi. Ko'pincha server sozlamasi xatosi. Server sezmasa, brauzer sezadi va xato ko'rsatadi. RFC 9110: mijoz halqani aniqlashi va to'xtatishi kerak (SHOULD).

## Ko'rib chiqamiz

Python'da kichik server (VPS'da va lokal kompyuterda bir xil, `127.0.0.1:8083`): `/r/<kod>` — shu kod bilan `/natija` ga yo'naltiradi; `/natija` — qanday metod va necha bayt tana kelganini aytadi; `/aylana` — o'ziga yo'naltiradi (halqa).

```python
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class Ishlovchi(BaseHTTPRequestHandler):
    def ishla(self):
        uzunlik = int(self.headers.get('Content-Length', 0))
        tana = self.rfile.read(uzunlik)
        if self.path.startswith('/r/'):                    # /r/301, /r/302, ...
            kod = int(self.path[3:])
            self.send_response(kod)
            self.send_header('Location', '/natija')
            self.send_header('Content-Length', '0')
            self.end_headers()
        elif self.path == '/aylana':
            self.send_response(302)
            self.send_header('Location', '/aylana')
            self.send_header('Content-Length', '0')
            self.end_headers()
        else:
            javob = f'metod={self.command} tana={len(tana)} bayt\n'.encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(javob)))
            self.end_headers()
            self.wfile.write(javob)

    do_GET = do_POST = do_PUT = ishla


ThreadingHTTPServer(('127.0.0.1', 8083), Ishlovchi).serve_forever()
```

### Javob

```text vps
$ curl -si http://127.0.0.1:8083/r/301 | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 301 Moved Permanently
Location: /natija
Content-Length: 0

```

`Location: /natija` — **nisbiy** URL. RFC 9110 (15.4): mijoz uni asl so'rov URL'iga nisbatan hal qiladi (2-bobdagi kabi) — `http://127.0.0.1:8083/natija`.

### `curl -L`: `POST` va `PUT`

`-L` — curl redirect'larga ergashadi (standart holatda ergashmaydi). `-d` — tana `salom dunyo` (11 bayt), metod `POST`:

```text vps
$ for k in 301 302 303 307 308; do printf '%s: ' $k; curl -sL -d 'salom dunyo' http://127.0.0.1:8083/r/$k; done
301: metod=GET tana=0 bayt
302: metod=GET tana=0 bayt
303: metod=GET tana=0 bayt
307: metod=POST tana=11 bayt
308: metod=POST tana=11 bayt
```

curl qo'llanmasi aynan shuni aytadi: `POST` so'rovi `301`, `302`, `303` dan keyin `GET` bilan yuboriladi, boshqa `3xx` da — metod o'zgarmaydi. `307`/`308` da tana ham saqlandi.

`PUT` bilan (`-X PUT`):

```text vps
$ for k in 301 302 303 307 308; do printf '%s: ' $k; curl -sL -X PUT -d 'salom dunyo' http://127.0.0.1:8083/r/$k; done
301: metod=PUT tana=0 bayt
302: metod=PUT tana=0 bayt
303: metod=PUT tana=0 bayt
307: metod=PUT tana=11 bayt
308: metod=PUT tana=11 bayt
```

curl qo'llanmasi: `-X` bilan berilgan metod curl tanlaydigan metodni **bosib ketadi** — shuning uchun hammasi `PUT`. Lekin `301`/`302`/`303` da **tana yo'qoldi** (kuzatildi): metod `PUT`, tana `0` bayt — standartga mos bo'lmagan aralash natija. Xulosa: `-X` ni redirect bilan ishlatishda ehtiyot bo'lish kerak.

### Brauzer: `fetch()`

Chromium 158 da xuddi shu so'rovlar `fetch()` bilan (sahifa `http://127.0.0.1:8083/natija` da):

```js
for (const m of ['POST', 'PUT']) for (const k of [301, 302, 303, 307, 308]) {
  const j = await fetch('/r/' + k, { method: m, body: 'salom dunyo' })
  console.log(`${m} ${k}: ${(await j.text()).trim()}  (redirected=${j.redirected})`)
}
```

```text tashqi
POST 301: metod=GET tana=0 bayt  (redirected=true)
POST 302: metod=GET tana=0 bayt  (redirected=true)
POST 303: metod=GET tana=0 bayt  (redirected=true)
POST 307: metod=POST tana=11 bayt  (redirected=true)
POST 308: metod=POST tana=11 bayt  (redirected=true)
PUT 301: metod=PUT tana=11 bayt  (redirected=true)
PUT 302: metod=PUT tana=11 bayt  (redirected=true)
PUT 303: metod=GET tana=0 bayt  (redirected=true)
PUT 307: metod=PUT tana=11 bayt  (redirected=true)
PUT 308: metod=PUT tana=11 bayt  (redirected=true)
```

Brauzer **Fetch Standard** (4.5, HTTP-redirect fetch) qoidasiga aniq amal qildi:

- `301` yoki `302` **va** metod `POST` → `GET`, tana olib tashlanadi;
- `303` **va** metod `GET`/`HEAD` emas → `GET`, tana olib tashlanadi (`PUT 303` → `GET`);
- qolgan hollarda metod va tana saqlanadi: `PUT 301`, `PUT 302` — `PUT` va 11 bayt.

`redirected=true` — javob redirect orqali kelganini `fetch()` o'zi bildiradi.

### Halqa

```text vps
$ curl -sL -o /dev/null -w '%{http_code} %{num_redirects} %{url_effective}\n' http://127.0.0.1:8083/aylana; echo "exit: $?"
302 50 http://127.0.0.1:8083/aylana
exit: 47
$ curl -sS -L --max-redirs 5 -o /dev/null http://127.0.0.1:8083/aylana; echo "exit: $?"
curl: (47) Maximum (5) redirects followed
exit: 47
```

- curl standart holatda **50** ta redirect'dan keyin to'xtaydi (qo'llanma: `--max-redirs`, standart 50), chiqish kodi `47` — "Too many redirects".
- `--max-redirs 5` bilan — 5 tadan keyin.

Brauzerda:

```text tashqi
fetch /aylana: TypeError: Failed to fetch
goto /aylana: page.goto: net::ERR_TOO_MANY_REDIRECTS at http://127.0.0.1:8083/aylana
/aylana so'rovlari: 20
```

- `fetch()` — tarmoq xatosi (`TypeError: Failed to fetch`).
- Sahifaga o'tish — `ERR_TOO_MANY_REDIRECTS`. Playwright navigatsiyada 20 ta so'rov sanadi. Fetch Standard: redirect hisoblagichi 20 ga yetganda — tarmoq xatosi.

### Haqiqiy sayt: `http` → `https` va `www`

```text vps
$ curl -sI http://github.com/ | tr -d '\r' | grep -i '^HTTP\|^location'
HTTP/1.1 301 Moved Permanently
Location: https://github.com/
$ curl -sI https://www.github.com/ | tr -d '\r' | grep -i '^HTTP\|^location'
HTTP/2 301 
location: https://github.com/
$ curl -sL -o /dev/null -w 'redirect: %{num_redirects}, oxiri: %{url_effective}, kod: %{http_code}\n' http://www.github.com/
redirect: 2, oxiri: https://github.com/, kod: 200
```

- Ikkalasi ham **doimiy** `301`: GitHub'ning yagona manzili — `https://github.com/`.
- `http://www.github.com/` dan boshlansa — **ikki** redirect. Har biri qo'shimcha so'rov; to'g'ridan-to'g'ri `https://github.com/` yozgan tezroq.

### nginx'da redirect

MDN'dagi nginx misoli — alohida `server` bloki va `return 301` (nginx hujjati: `return` `301`, `302`, `303`, `307`, `308` kodlari uchun URL qabul qiladi):

```nginx
server {
    listen 8080;
    server_name example.com;
    return 301 $scheme://www.example.com$request_uri;
}
```

```text vps
$ curl -si -H 'Host: example.com' 'http://127.0.0.1:8080/kitob/git?bob=3' | tr -d '\r' | grep -i '^HTTP\|^location'
HTTP/1.1 301 Moved Permanently
Location: http://www.example.com/kitob/git?bob=3
```

`$scheme` — so'rov sxemasi, `$request_uri` — yo'l va so'rov qatori: foydalanuvchi aynan shu sahifaga, faqat yangi domenda tushadi.

## Standartda nima deyilgan

| Hujjat | Bo'lim | Gap |
| --- | --- | --- |
| RFC 9110 | 15.4 | `3xx` turlari. `Location` bo'lsa, mijoz noma'lum `3xx` kodda ham avtomatik yo'naltirishi mumkin. Xavfsiz bo'lmagan metodlarni avtomatik yo'naltirishda ehtiyot bo'lish kerak |
| RFC 9110 | 15.4 | Redirect'ga ergashganda: URL'ni `Location` ga almashtirish (nisbiy bo'lsa — hal qilib); `Host`, `Authorization`, `Cookie` kabi header'larni yangilash yoki olib tashlash; metod `GET` ga o'zgarsa — tana header'larini (`Content-Type`, `Content-Length`…) olib tashlash. Halqani aniqlash |
| RFC 9110 | 15.4.2, 15.4.3 | `301`, `302`: tarixiy sabab bilan mijoz `POST` ni `GET` ga o'zgartirishi mumkin; buni istamasangiz — `308` / `307` |
| RFC 9110 | 15.4.4 | `303` |
| RFC 9110 | 15.4.8, 15.4.9 | `307`, `308` — metodni o'zgartirmaslik shart |
| Fetch Standard | 4.5 | Brauzer qoidasi: `301`/`302` + `POST` → `GET`; `303` + `GET`/`HEAD` bo'lmagan → `GET`; redirect 20 ga yetsa — tarmoq xatosi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| API'da `POST` ni `301`/`302` bilan ko'chirish | Mijoz `GET` bilan qayta yuboradi — tana yo'qoladi (sinovda `POST 301 → GET, 0 bayt`) | `308` (doimiy) yoki `307` (vaqtinchalik) |
| Forma natijasini `POST` javobida to'g'ridan-to'g'ri ko'rsatish | "Yangilash" formani qayta yuboradi | `303` bilan natija sahifasiga (Post/Redirect/Get) |
| Vaqtinchalik ko'chishga `301` | Brauzer va robotlar uni doimiy deb eslab qoladi | `302`/`307` |
| Ichki havolalarni redirect orqali qoldirish | Har biri — qo'shimcha so'rov | Havolani yangi URL'ga tuzatish |
| `http → https` va `www → ` uchun ketma-ket ikki redirect | Ikki qo'shimcha so'rov (sinovda `http://www.github.com/` — 2 ta) | Bitta redirect bilan to'g'ridan-to'g'ri yakuniy URL'ga |
| `<meta>` va HTTP redirect'ni birga yuritish | Biri o'zgarib, ikkinchisi unutilsa — halqa (MDN) | Faqat HTTP redirect |
| `curl -X PUT -L` dan standart xatti-harakat kutish | `-X` metodni majburlaydi, lekin tana tashlanishi mumkin (sinovda `PUT 301 → PUT, 0 bayt`) | `-X` siz yoki `307`/`308` |

## Amaliyot

1. Redirect javobida qaysi ikki narsa bo'ladi?
2. `301` va `308` farqi nima? `302` va `307` dachi?
3. Nega forma yuborilgandan keyin `303` ishlatiladi?
4. Brauzer `PUT` so'roviga `302` olsa, qayta qaysi metod bilan yuboradi? `303` olsa-chi?
5. Saytni yangi domenga butunlay ko'chirdingiz, API'da `POST` so'rovlar ham bor. Qaysi kod?
6. Redirect halqasida curl va brauzer nima qiladi?

<details>
<summary>Javoblar</summary>

1. `3xx` holat kodi va `Location` header'ida yangi URL.
2. `301` — metod `GET` ga o'zgarishi mumkin, `308` — metod va tana saqlanadi. `302`/`307` — xuddi shunday, lekin vaqtinchalik.
3. Natija sahifasi `GET` bilan ochiladi — sahifani yangilash `POST` ni takrorlamaydi.
4. `302` — `PUT` (Fetch qoidasi faqat `POST` ni o'zgartiradi; sinovda `PUT 302 → PUT, 11 bayt`). `303` — `GET`.
5. `308` — doimiy va metodni saqlaydi.
6. curl 50 ta redirect'dan keyin `47` xato bilan to'xtaydi (`--max-redirs` bilan o'zgartiriladi). Brauzer 20 da to'xtaydi: `ERR_TOO_MANY_REDIRECTS`, `fetch()` — `TypeError`.

</details>

## Rasmiy hujjat

- [MDN: Redirections in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections)
- [MDN: Location](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Location)
- [RFC 9110 §15.4: Redirection 3xx](https://www.rfc-editor.org/rfc/rfc9110#name-redirection-3xx)
- [Fetch Standard: HTTP-redirect fetch](https://fetch.spec.whatwg.org/#http-redirect-fetch)
- [curl qo'llanmasi: `-L`, `--max-redirs`, `-X`](https://curl.se/docs/manpage.html)
- [nginx: `return`](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#return)
