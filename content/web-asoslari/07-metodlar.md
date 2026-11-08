# 07 — Metodlar

[Mundarija](README.md)

## Tushuncha

MDN (HTTP request methods): HTTP **so'rov metodlari** to'plamini belgilaydi. Metod so'rovning **maqsadini** va muvaffaqiyatli bo'lsa nima kutilishini bildiradi. Ularni ba'zan **HTTP fe'llari** (HTTP verbs) deyishadi, garchi ba'zilari ot bo'lsa ham (`OPTIONS`, `HEAD`).

### Asosiy metodlar

| Metod | Nima qiladi (MDN) | So'rovda tana | Muvaffaqiyatli javobda tana | HTML formada |
| --- | --- | --- | --- | --- |
| `GET` | Resursning **ko'rinishini** (representation) so'raydi. Faqat ma'lumot olish uchun | Yo'q | Ha | Ha |
| `HEAD` | `GET` bilan bir xil javob, lekin **tanasiz** — faqat header'lar | Yo'q | Yo'q | Yo'q |
| `POST` | Resursga ma'lumot yuboradi; ko'pincha serverda holat o'zgaradi yoki qo'shimcha ta'sir bo'ladi | Ha | Ha | Ha |
| `PUT` | Resursni yaratadi yoki uning joriy ko'rinishini so'rov mazmuni bilan **butunlay almashtiradi** | Ha | Bo'lishi mumkin | Yo'q |
| `PATCH` | Resursni **qisman** o'zgartiradi | Ha | Bo'lishi mumkin | Yo'q |
| `DELETE` | Resursni o'chiradi | Yo'q | Bo'lishi mumkin | Yo'q |
| `OPTIONS` | Resurs (yoki `*` — butun server) uchun ruxsat etilgan aloqa imkoniyatlari. CORS oldindan tekshiruvi ham shu (19-bob) | Ruxsat bor, ma'nosi belgilanmagan | Bo'lishi mumkin | Yo'q |

Boshqalari: `CONNECT` — tunnel ochadi (6-bobdagi authority form); `TRACE` — so'rov yo'li bo'ylab "aks-sado" sinovi; `QUERY` — tanasi bor, lekin `GET` kabi xavfsiz va idempotent so'rov (RFC 10008, 2026-yil iyun; MDN: brauzerlar uni o'zi yubormaydi).

`GET` va `DELETE` tanasi haqida MDN: uning ma'nosi belgilanmagan, ba'zi serverlar bunday so'rovni `4xx` xato bilan rad etadi.

**HTML forma** faqat `GET` va `POST` yubora oladi (MDN jadvallaridagi "Allowed in HTML forms"). `PUT`, `PATCH`, `DELETE` — JavaScript (`fetch()`) yoki boshqa mijozlar orqali.

### Uch xususiyat

| Xususiyat | Ta'rif (MDN) |
| --- | --- |
| **Xavfsiz** (safe) | Metod server holatini **o'zgartirmaydi** — faqat o'qish. Server baribir jurnal yoki statistika yozishi mumkin; muhimi — mijoz o'zgarish **so'ramaydi**. Shuning uchun brauzer xavfsiz metodlarni oldindan yuklash (pre-fetch) uchun, qidiruv robotlari esa sayt kezish uchun bemalol ishlatadi |
| **Idempotent** | Bitta so'rovning serverga **ko'zlangan ta'siri** bir nechta bir xil so'rovniki bilan teng. Javob har safar boshqacha bo'lishi mumkin: `DELETE` birinchi safar `200`/`204`, keyingilarida `404` |
| **Keshlanadigan** (cacheable) | Javobni saqlab, keyin serverga qayta murojaat qilmasdan ishlatish mumkin (11-bob) |

| Metod | Xavfsiz | Idempotent | Keshlanadigan |
| --- | --- | --- | --- |
| `GET` | Ha | Ha | Ha |
| `HEAD` | Ha | Ha | Ha |
| `OPTIONS` | Ha | Ha | Yo'q |
| `TRACE` | Ha | Ha | Yo'q |
| `PUT` | Yo'q | Ha | Yo'q |
| `DELETE` | Yo'q | Ha | Yo'q |
| `POST` | Yo'q | Yo'q | Shartli\* |
| `PATCH` | Yo'q | Yo'q | Shartli\* |
| `CONNECT` | Yo'q | Yo'q | Yo'q |

\* MDN: javobda yangilik ma'lumoti (freshness) va mos `Content-Location` bo'lsa; amalda kam qo'llanadi.

Barcha xavfsiz metodlar idempotent, lekin aksi emas: `PUT` va `DELETE` — idempotent, ammo xavfsiz emas.

**Nega idempotentlik muhim** (RFC 9110, 9.2.2): javobni o'qishdan oldin aloqa uzilsa, idempotent so'rovni **avtomatik qayta yuborish** mumkin — natija baribir bir xil. `POST` ni esa qayta yuborish, masalan, buyurtmani ikki marta yaratishi mumkin (MDN: `POST`).

**Qoidaga server amal qiladi.** MDN: xavfsizlik va idempotentlikni veb-server (nginx, Apache) emas, **ilova** ta'minlaydi. Spetsifikatsiya buni majburlay olmaydi: `GET` bilan ma'lumot o'zgartiradigan server ham yozish mumkin — lekin bu xato (pastda "Tipik xatolar").

### `PUT` va `PATCH` farqi

MDN: `PUT` — resursning **to'liq** almashtirilishi; `PATCH` — uni o'zgartirish **ko'rsatmalari**. `PUT` doim idempotent; `PATCH` har doim emas — masalan, resursda avtomatik oshadigan hisoblagich bo'lsa, `PUT` uni ustidan yozadi, `PATCH` esa yo'q.

## Ko'rib chiqamiz

VPS'da Python standart kutubxonasi bilan kichik **kitoblar API** yozildi (`127.0.0.1:8080`, ma'lumot xotirada):

```python
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

kitoblar = {}      # id -> {"nom": ..., "narx": ...}
keyingi_id = 1


class Ishlovchi(BaseHTTPRequestHandler):
    def javob(self, kod, tana=None, **headerlar):
        self.send_response(kod)
        for nom, qiymat in headerlar.items():
            self.send_header(nom.replace('_', '-'), qiymat)
        if tana is not None:
            matn = json.dumps(tana, ensure_ascii=False).encode()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(matn)))
            self.end_headers()
            if self.command != 'HEAD':
                self.wfile.write(matn)
        else:
            self.end_headers()

    def tana_oqi(self):
        uzunlik = int(self.headers.get('Content-Length', 0))
        return json.loads(self.rfile.read(uzunlik) or b'{}')

    def kitob_id(self):
        qism = self.path.strip('/').split('/')
        return int(qism[1]) if len(qism) == 2 and qism[1].isdigit() else None

    def do_GET(self):
        if self.path == '/kitoblar':
            return self.javob(200, kitoblar)
        i = self.kitob_id()
        if i in kitoblar:
            return self.javob(200, kitoblar[i])
        self.javob(404, {'xato': 'topilmadi'})

    do_HEAD = do_GET

    def do_POST(self):
        global keyingi_id
        if self.path != '/kitoblar':
            return self.javob(405, {'xato': 'ruxsat yo\'q'}, Allow='GET, HEAD, PUT, PATCH, DELETE, OPTIONS')
        i, keyingi_id = keyingi_id, keyingi_id + 1
        kitoblar[i] = self.tana_oqi()
        self.javob(201, kitoblar[i], Location=f'/kitoblar/{i}')

    def do_PUT(self):
        i = self.kitob_id()
        if i is None:
            return self.javob(405, {'xato': 'ruxsat yo\'q'}, Allow='GET, HEAD, POST, OPTIONS')
        yangi = i not in kitoblar
        kitoblar[i] = self.tana_oqi()          # butunlay almashtiradi
        self.javob(201 if yangi else 200, kitoblar[i])

    def do_PATCH(self):
        i = self.kitob_id()
        if i not in kitoblar:
            return self.javob(404, {'xato': 'topilmadi'})
        kitoblar[i].update(self.tana_oqi())    # faqat berilgan maydonlar
        self.javob(200, kitoblar[i])

    def do_DELETE(self):
        i = self.kitob_id()
        if i is None:
            return self.javob(405, {'xato': 'ruxsat yo\'q'}, Allow='GET, HEAD, POST, OPTIONS')
        if kitoblar.pop(i, None) is None:
            return self.javob(404, {'xato': 'topilmadi'})
        self.javob(204)

    def do_OPTIONS(self):
        if self.path == '/kitoblar':
            return self.javob(204, Allow='GET, HEAD, POST, OPTIONS')
        self.javob(204, Allow='GET, HEAD, PUT, PATCH, DELETE, OPTIONS')


ThreadingHTTPServer(('127.0.0.1', 8080), Ishlovchi).serve_forever()
```

`BaseHTTPRequestHandler` har metod uchun `do_<METOD>` funksiyasini chaqiradi. Javob kodlari RFC 9110 tavsiyalariga mos tanlangan (pastdagi "Standartda nima deyilgan").

`curl` da metod: `-X`. Qo'llanma: u metod nomini **o'zgartirmasdan** yuboradi; `GET`, `HEAD`, `POST`, `PUT` uchun odatda maxsus parametrlar yetadi (`--json`, `-d` → `POST`; `-I` → `HEAD`). Chiqishdagi `Server:` va `Date:` qatorlari qisqalik uchun olib tashlandi.

### `POST` — idempotent emas

Bir xil so'rov ikki marta:

```text vps
$ curl -si --json '{"nom":"Git","narx":45000}' http://127.0.0.1:8080/kitoblar | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 201 Created
Location: /kitoblar/1
Content-Type: application/json; charset=utf-8
Content-Length: 29

{"nom": "Git", "narx": 45000}
$ curl -si --json '{"nom":"Git","narx":45000}' http://127.0.0.1:8080/kitoblar | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 201 Created
Location: /kitoblar/2
Content-Type: application/json; charset=utf-8
Content-Length: 29

{"nom": "Git", "narx": 45000}
$ curl -s http://127.0.0.1:8080/kitoblar; echo
{"1": {"nom": "Git", "narx": 45000}, "2": {"nom": "Git", "narx": 45000}}
```

- `201 Created` va `Location: /kitoblar/1` — yangi resurs yaratildi va uning manzili.
- Ikkinchi `POST` **yana bitta** kitob yaratdi (`/kitoblar/2`). Bir xil so'rov — ikki xil ta'sir. Buyurtma, to'lov uchun shuning uchun xavfli.

### `PUT` — idempotent

```text vps
$ curl -si -X PUT --json '{"nom":"Docker","narx":60000}' http://127.0.0.1:8080/kitoblar/5 | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 201 Created
Content-Type: application/json; charset=utf-8
Content-Length: 32

{"nom": "Docker", "narx": 60000}
$ curl -si -X PUT --json '{"nom":"Docker","narx":60000}' http://127.0.0.1:8080/kitoblar/5 | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 32

{"nom": "Docker", "narx": 60000}
```

- `PUT` da manzilni **mijoz** beradi (`/kitoblar/5`); `POST` da — server.
- Birinchisi — `201 Created` (yo'q edi, yaratildi), ikkinchisi — `200 OK` (bor edi, almashtirildi). Kod har xil, lekin **natija bir xil**: `/kitoblar/5` da bitta Docker kitobi.

### `PATCH` va `PUT`: qisman va to'liq

Ikkala kitobda ham faqat narxni yuboramiz:

```text vps
$ curl -si -X PATCH --json '{"narx":40000}' http://127.0.0.1:8080/kitoblar/1 | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 29

{"nom": "Git", "narx": 40000}
$ curl -si -X PUT --json '{"narx":40000}' http://127.0.0.1:8080/kitoblar/2 | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 15

{"narx": 40000}
$ curl -s http://127.0.0.1:8080/kitoblar; echo
{"1": {"nom": "Git", "narx": 40000}, "2": {"narx": 40000}, "5": {"nom": "Docker", "narx": 60000}}
```

- `PATCH` faqat `narx` ni o'zgartirdi — `nom` qoldi.
- `PUT` resursni **butunlay** almashtirdi — `nom` yo'qoldi. `PUT` da har doim **to'liq** ko'rinish yuboriladi.

### `DELETE` — idempotent, lekin javob boshqacha

```text vps
$ curl -si -X DELETE http://127.0.0.1:8080/kitoblar/2 | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 204 No Content

$ curl -si -X DELETE http://127.0.0.1:8080/kitoblar/2 | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 404 Not Found
Content-Type: application/json; charset=utf-8
Content-Length: 21

{"xato": "topilmadi"}
```

Birinchisi — `204 No Content` (o'chirildi, tana yo'q), ikkinchisi — `404`. MDN misolidagi kabi: kod o'zgardi, lekin server holati ikkala holatda ham bir xil — kitob yo'q.

### Ruxsat etilmagan va noma'lum metod

```text vps
$ curl -si -X DELETE http://127.0.0.1:8080/kitoblar | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 405 Method Not Allowed
Allow: GET, HEAD, POST, OPTIONS
Content-Type: application/json; charset=utf-8
Content-Length: 23

{"xato": "ruxsat yo'q"}
$ curl -si -X FOO http://127.0.0.1:8080/kitoblar | tr -d '\r' | grep -v '^Server:\|^Date:' | head -3
HTTP/1.0 501 Unsupported method ('FOO')
Connection: close
Content-Type: text/html;charset=utf-8
```

- Butun ro'yxatni o'chirish ruxsat etilmagan — **405**, `Allow` header'ida ruxsat etilganlar.
- `FOO` — server bilmaydigan metod: `do_FOO` yo'q va `BaseHTTPRequestHandler` o'zi **501** qaytardi (kuzatildi; RFC 9110 ham bunday holatda 501 ni tavsiya etadi).

### `OPTIONS` va `HEAD`

```text vps
$ curl -si -X OPTIONS http://127.0.0.1:8080/kitoblar/1 | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 204 No Content
Allow: GET, HEAD, PUT, PATCH, DELETE, OPTIONS

$ curl -sI http://127.0.0.1:8080/kitoblar/1 | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 29

```

- `OPTIONS` — bu resurs uchun qaysi metodlar mumkin.
- `HEAD` — `GET` dagi header'lar, jumladan `Content-Length: 29`, lekin tana yuborilmadi. MDN: katta faylni yuklashdan oldin hajmini bilish uchun qulay.

Server jurnali — har so'rovning metodi va natijasi:

```text vps
$ cat /tmp/ks.log
127.0.0.1 - - [08/Nov/2026 11:40:37] "POST /kitoblar HTTP/1.1" 201 -
127.0.0.1 - - [08/Nov/2026 11:40:37] "POST /kitoblar HTTP/1.1" 201 -
127.0.0.1 - - [08/Nov/2026 11:40:37] "GET /kitoblar HTTP/1.1" 200 -
127.0.0.1 - - [08/Nov/2026 11:40:37] "PUT /kitoblar/5 HTTP/1.1" 201 -
127.0.0.1 - - [08/Nov/2026 11:40:37] "PUT /kitoblar/5 HTTP/1.1" 200 -
127.0.0.1 - - [08/Nov/2026 11:40:37] "PATCH /kitoblar/1 HTTP/1.1" 200 -
127.0.0.1 - - [08/Nov/2026 11:40:37] "PUT /kitoblar/2 HTTP/1.1" 200 -
127.0.0.1 - - [08/Nov/2026 11:40:37] "GET /kitoblar HTTP/1.1" 200 -
127.0.0.1 - - [08/Nov/2026 11:40:37] "DELETE /kitoblar/2 HTTP/1.1" 204 -
127.0.0.1 - - [08/Nov/2026 11:40:37] "DELETE /kitoblar/2 HTTP/1.1" 404 -
127.0.0.1 - - [08/Nov/2026 11:40:37] "DELETE /kitoblar HTTP/1.1" 405 -
127.0.0.1 - - [08/Nov/2026 11:40:37] "OPTIONS /kitoblar/1 HTTP/1.1" 204 -
127.0.0.1 - - [08/Nov/2026 11:40:37] "HEAD /kitoblar/1 HTTP/1.1" 200 -
127.0.0.1 - - [08/Nov/2026 11:40:37] code 501, message Unsupported method ('FOO')
127.0.0.1 - - [08/Nov/2026 11:40:37] "FOO /kitoblar HTTP/1.1" 501 -
```

## Standartda nima deyilgan

RFC 9110, 9-bo'lim:

| Bo'lim | Gap |
| --- | --- |
| 9.1 | Umumiy serverlar `GET` va `HEAD` ni qo'llashi **shart**, qolganlari ixtiyoriy. Server bilmaydigan yoki amalga oshirmagan metodga — `501`; biladigan, lekin shu resursga ruxsat etilmagan metodga — `405` |
| 9.2.1 | Xavfsiz metodlar: `GET`, `HEAD`, `OPTIONS`, `TRACE` |
| 9.2.2 | Idempotent: `PUT`, `DELETE` va xavfsiz metodlar. Ta'sir faqat **so'ralgan** narsaga tegishli; server har so'rovni alohida jurnalga yozishi mumkin. Aloqa uzilsa, idempotent so'rovni qayta yuborish mumkin |
| 9.3.3 | `POST` yangi resurs yaratsa — `201 Created` va `Location` yuborish tavsiya etiladi |
| 9.3.4 | `PUT` yangi resurs yaratsa — `201` **shart**; mavjudini o'zgartirsa — `200` yoki `204` |
| 9.3.5 | `DELETE` muvaffaqiyatli bo'lsa: `202` (qabul qilindi, hali bajarilmadi), `204` (bajarildi, qo'shimcha ma'lumot yo'q) yoki `200` (bajarildi, holat tavsifi bilan) |
| 10.2.1 | `Allow` — resurs qo'llaydigan metodlar; `405` javobida server uni yuborishi **shart** |

`PATCH` — alohida standart: RFC 5789 (2010-yil mart). `QUERY` — RFC 10008 (2026-yil iyun).

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `GET /ochir?id=5` bilan o'chirish | `GET` xavfsiz bo'lishi kerak; brauzer oldindan yuklashi, qidiruv roboti havolani "bosib" yuborishi mumkin (MDN: Safe) | `DELETE /kitoblar/5` yoki `POST` |
| `POST` ni avtomatik qayta yuborish (retry) | Idempotent emas — ikkinchi buyurtma yaratiladi | Faqat idempotent so'rovlarni avtomatik qaytarish |
| Bir maydonni o'zgartirish uchun `PUT` ga faqat shu maydonni yuborish | `PUT` resursni butunlay almashtiradi — boshqa maydonlar yo'qoladi (sinovda `nom` yo'qoldi) | `PATCH` yoki `PUT` ga to'liq ko'rinish |
| Ikkinchi `DELETE` dagi `404` ni "xato" deb hisoblash | Idempotentlik — natija bir xil, kod emas | Mijozda `404` ni "allaqachon yo'q" deb qabul qilish |
| Ruxsat etilmagan metodga `404` yoki `400` qaytarish | Resurs bor, metod mumkin emas | `405` va `Allow` |
| `GET` so'roviga tana qo'shish | Ma'nosi belgilanmagan, ba'zi serverlar rad etadi | Parametrlar — so'rov qatorida; murakkab qidiruv — `POST` yoki `QUERY` |
| HTML formada `method="put"` | Forma faqat `GET` va `POST` yuboradi | `fetch()` bilan `PUT`/`DELETE` |

## Amaliyot

1. Qaysi metodlar xavfsiz, qaysilari idempotent? `PUT` qaysi guruhda?
2. Nega `GET` bilan ma'lumot o'chirish xavfli?
3. Sinovda bir xil `POST` ikki marta yuborilganda nima bo'ldi? `PUT` dachi?
4. `PUT` ga faqat `{"narx":40000}` yuborilsa, kitobning `nom` maydoni nima bo'ladi? `PATCH` dachi?
5. Ikkinchi `DELETE` `404` qaytardi. `DELETE` idempotent emasmi?
6. `405` va `501` farqi nima?

<details>
<summary>Javoblar</summary>

1. Xavfsiz: `GET`, `HEAD`, `OPTIONS`, `TRACE`. Idempotent: ular va `PUT`, `DELETE`. `PUT` — idempotent, lekin xavfsiz emas.
2. `GET` xavfsiz hisoblanadi: brauzer oldindan yuklashi, robotlar havolalarni kezishi mumkin — ma'lumot bilmasdan o'chib ketadi.
3. `POST` — ikki xil kitob (`/kitoblar/1` va `/2`). `PUT` — bitta `/kitoblar/5` (`201`, keyin `200`).
4. `PUT` — `nom` yo'qoladi (resurs butunlay almashtirildi). `PATCH` — `nom` qoladi.
5. Idempotent: server holati ikkala safar bir xil — kitob yo'q. Idempotentlik javob kodiga emas, ta'sirga tegishli.
6. `405` — server metodni biladi, lekin bu resurs uchun ruxsat yo'q (`Allow` bilan). `501` — server bu metodni umuman qo'llamaydi.

</details>

## Rasmiy hujjat

- [MDN: HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)
- [MDN: GET](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/GET) · [HEAD](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/HEAD) · [POST](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST) · [PUT](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PUT) · [PATCH](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PATCH) · [DELETE](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/DELETE) · [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/OPTIONS)
- [MDN: Safe](https://developer.mozilla.org/en-US/docs/Glossary/Safe/HTTP) · [Idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent) · [Cacheable](https://developer.mozilla.org/en-US/docs/Glossary/Cacheable)
- [RFC 9110 §9: Methods](https://www.rfc-editor.org/rfc/rfc9110#name-methods)
- [RFC 5789: PATCH](https://www.rfc-editor.org/rfc/rfc5789) · [RFC 10008: QUERY](https://www.rfc-editor.org/rfc/rfc10008)
- [Python: http.server](https://docs.python.org/3/library/http.server.html)
- [curl qo'llanmasi: `-X`](https://curl.se/docs/manpage.html)
