# 09 — Header'lar va kontent turi

[Mundarija](README.md)

## Tushuncha

MDN (HTTP headers): **header**'lar — mijoz va server so'rov yoki javob bilan birga uzatadigan **qo'shimcha ma'lumot**. HTTP/1.x da header — katta-kichik harfni farqlamaydigan nom, `:`, ixtiyoriy bo'sh joy (e'tiborsiz qoldiriladi) va qiymat: `Allow: POST`. HTTP/2 va undan keyin dasturchi vositalarida nomlar kichik harfda ko'rinadi (`accept: */*`), psevdo-header'lar `:` bilan boshlanadi (6-bob).

### Header guruhlari

Kontekst bo'yicha (MDN):

| Guruh | Nima haqida | Misol |
| --- | --- | --- |
| **So'rov header'lari** | So'ralayotgan resurs yoki mijoz haqida | `Host`, `User-Agent`, `Accept` |
| **Javob header'lari** | Javob haqida: joylashuv, server | `Server`, `Location`, `Allow` |
| **Taqdimot header'lari** (representation) | Tana haqida: MIME turi, siqish/kodlash | `Content-Type`, `Content-Encoding`, `Content-Language` |
| **Yuk header'lari** (payload) | Taqdimotdan qat'i nazar, uzatiladigan ma'lumot haqida: uzunlik, uzatish kodlashi | `Content-Length`, `Transfer-Encoding` |

Proksilar ularni qanday ishlashi bo'yicha (MDN):

- **Uchdan-uchgacha** (end-to-end) — oxirgi qabul qiluvchiga (so'rovda serverga, javobda mijozga) yetishi **shart**; proksi ularni o'zgartirmasdan uzatadi, kesh saqlaydi.
- **Bo'g'indan-bo'g'ingacha** (hop-by-hop) — faqat bitta transport ulanishi uchun; proksi uzatmaydi va keshlamaydi. Masalan, `Connection`.

**`X-` prefiksi.** MDN: maxsus header'larga ilgari `X-` qo'shilardi; RFC 6648 (2012-yil iyun) bu odatdan voz kechishni tavsiya qildi — standart bo'lib qolgan header'larda noqulaylik tug'dirgani uchun. Rasmiy header'lar ro'yxatini IANA yuritadi (HTTP Field Name Registry).

### MIME turi

MDN (MIME types): **media turi** (avvalgi nomi **MIME turi** — Multipurpose Internet Mail Extensions) hujjat, fayl yoki baytlar to'plamining **tabiati va formatini** bildiradi. Standart — RFC 6838 (2013-yil yanvar); rasmiy ro'yxat — IANA'ning "Media Types" sahifasi.

Tuzilishi:

```text
text/plain;charset=UTF-8
└┬─┘ └─┬─┘ └─────┬─────┘
tur  tur ost   parametr
```

- **Tur** (type) — umumiy toifa: `text`, `image`, `video`.
- **Tur osti** (subtype) — aniq format: `text` uchun `plain`, `html`, `calendar`.
- **Parametr** — ixtiyoriy qo'shimcha: `text` turlari uchun `charset` — belgilar to'plami. MDN: `charset` berilmasa, foydalanuvchi agenti sozlamasi boshqacha bo'lmasa, standart — ASCII (`US-ASCII`).
- MIME turi katta-kichik harfni farqlamaydi, lekin odatda kichik harfda yoziladi; parametr **qiymati** farqlashi mumkin.

Asosiy turlar (MDN, IANA'da ro'yxatdan o'tgan):

| Tur | Nima | Misol |
| --- | --- | --- |
| `text` | Odam o'qiydigan matn, manba kodi, CSV | `text/plain`, `text/html`, `text/css`, `text/csv` |
| `application` | Boshqa toifaga kirmaydigan ikkilik yoki dastur talqin qiladigan ma'lumot | `application/json`, `application/pdf`, `application/zip`, `application/wasm` |
| `image` | Rasm | `image/png`, `image/jpeg`, `image/svg+xml` |
| `audio`, `video` | Ovoz, video | `audio/mpeg`, `video/mp4` |
| `font` | Shrift | `font/woff2`, `font/ttf` |
| `multipart` | Bir nechta qismdan iborat hujjat | `multipart/form-data` (6-bob), `multipart/byteranges` (12-bob) |

Turi noma'lum bo'lsa (MDN):

- matn uchun — `text/plain` (brauzer uni ko'rsata oladi deb hisoblaydi);
- ikkilik fayl uchun — `application/octet-stream`: "noma'lum ikkilik fayl". Brauzer uni odatda bajarmaydi, "Saqlash" oynasini taklif qiladi.

**Eng muhim qoida** (MDN, ogohlantirish): brauzer URL'ni qanday ishlashni **fayl kengaytmasiga emas, MIME turiga** qarab hal qiladi. Server noto'g'ri `Content-Type` yuborsa, brauzer faylni noto'g'ri talqin qiladi, sayt ishlamaydi.

**MIME sniffing** (MDN): MIME turi bo'lmasa yoki brauzer uni noto'g'ri deb hisoblasa, u baytlarga qarab turini **taxmin qiladi**. Har brauzer buni turlicha qiladi; ba'zi turlar bajariladigan kontent bo'lgani uchun bu xavfli. Server `X-Content-Type-Options: nosniff` bilan taxminni taqiqlaydi (22-bob).

### `Content-Length`

RFC 9110 (8.6): taqdimot ma'lumotining uzunligi — **baytlarda** (octets), manfiy bo'lmagan butun son. Belgilar soni emas: UTF-8 da `‘` kabi belgi 3 bayt (pastdagi sinov).

### Kontentni kelishish

MDN (Content negotiation): bitta URL uchun resursning bir nechta **ko'rinishi** (representation) bo'lishi mumkin — turli tilda, formatda, siqishda. Qaysi biri berilishini tanlash — **kontentni kelishish** (content negotiation).

Ikki usul:

| Usul | Qanday |
| --- | --- |
| **Server boshqaradigan** (server-driven, proactive) | Mijoz afzalliklarini header'larda yuboradi, server tanlaydi. Asosiy usul |
| **Agent boshqaradigan** (agent-driven, reactive) | Server variantlar ro'yxatini beradi (`300 Multiple Choices`) yoki mos variant yo'qligini aytadi (`406 Not Acceptable`, `415 Unsupported Media Type`); tanlovni mijoz qiladi |

Mijoz header'lari:

| Header | Nimani bildiradi | Misol |
| --- | --- | --- |
| `Accept` | Qabul qilinadigan MIME turlari | `text/html,application/xml;q=0.9,*/*;q=0.8` |
| `Accept-Language` | Afzal tillar | `uz, en;q=0.7` |
| `Accept-Encoding` | Qo'llanadigan siqish usullari (12-bob) | `br, gzip;q=0.8` |

**Sifat qiymati** (quality value, `q`, RFC 9110, 12.4.2): afzallik "og'irligi", 0 dan 1 gacha; `1` — eng afzal, `0` — "qabul qilinmaydi"; `q` yozilmasa — `1`.

Server javobida:

- `Content-Type`, `Content-Language` — **tanlangan** variant;
- **`Vary`** — server tanlovda qaysi so'rov header'lariga qaragani. MDN: bu **kesh** uchun kerak — kesh tanlovni takrorlay olishi va boshqa tildagi foydalanuvchiga noto'g'ri nusxani bermasligi uchun.

MDN ogohlantirishlari: `Accept-Language` ko'pincha interfeys tilidan olinadi va foydalanuvchi niyatini aks ettirmasligi mumkin — saytda **tilni qo'lda tanlash** imkoni bo'lishi kerak, tanlangandan keyin header'ga qaralmaydi. `User-Agent` ga qarab imkoniyatni aniqlash yomon amaliyot.

## Ko'rib chiqamiz

Hammasi VPS'da.

### nginx kengaytmaga qarab tur tanlaydi

nginx statik fayllar uchun `Content-Type` ni **kengaytma** bo'yicha `types` jadvalidan oladi (nginx hujjati, `types`); Docker obrazida bu jadval `/etc/nginx/mime.types`, topilmasa — `default_type application/octet-stream`:

```text
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
```

Sozlama (`conf.d/default.conf`):

```nginx
server {
    listen 8080;
    root /usr/share/nginx/html;

    location /utf8/ {
        alias /usr/share/nginx/html/;
        charset utf-8;
    }
}
```

`charset utf-8` — `Content-Type` ga `charset` parametrini qo'shadi (nginx hujjati, `charset`; standart holatda `off`).

```text vps
$ for f in index.html app.js logo.svg data.json salom.txt arxiv.xyz; do printf '%-11s ' $f; curl -s -o /dev/null -w '%{content_type} | %{size_download} bayt\n' http://127.0.0.1:8080/$f; done
index.html  text/html | 15 bayt
app.js      application/javascript | 15 bayt
logo.svg    image/svg+xml | 7 bayt
data.json   application/json | 8 bayt
salom.txt   text/plain | 27 bayt
arxiv.xyz   application/octet-stream | 100 bayt
```

- Har fayl kengaytmasiga mos tur oldi.
- `.xyz` jadvalda yo'q — `application/octet-stream`: brauzer uni yuklab olishni taklif qiladi.
- `app.js` — `application/javascript`. MDN: JavaScript **doim** `text/javascript` bilan berilishi kerak; `application/javascript` — tarixiy sabab bilan brauzerlar qo'llashi mumkin bo'lgan **eskirgan** tur, unga tayanib bo'lmaydi (RFC 9239). Ya'ni Docker obrazidagi standart jadval bu yerda eskirgan turni beradi — kerak bo'lsa `types` bilan almashtiriladi.

### `charset` va `Content-Length`

```text vps
$ wc -c /tmp/k9/html/salom.txt
27 /tmp/k9/html/salom.txt
$ curl -sI http://127.0.0.1:8080/salom.txt | tr -d '\r' | grep -i '^content-'
Content-Type: text/plain
Content-Length: 27
$ curl -sI http://127.0.0.1:8080/utf8/salom.txt | tr -d '\r' | grep -i '^content-'
Content-Type: text/plain; charset=utf-8
Content-Length: 27
```

- Faylda `G'ijduvon o‘zbekcha matn` va qator oxiri — 25 ta **belgi**, lekin **27 bayt**: `‘` (U+2018) UTF-8 da 3 bayt. `Content-Length` — baytlar soni.
- Birinchi javobda `charset` yo'q. MDN bo'yicha bunda standart — ASCII; brauzer o'z sozlamasiga qarab boshqacha o'qishi mumkin va `‘` buzilib ko'rinadi. `/utf8/` da `charset=utf-8` aniq aytilgan.

### Server tilni va formatni tanlaydi

Python'da kichik server: `Accept` bo'yicha JSON yoki HTML, `Accept-Language` bo'yicha o'zbekcha yoki inglizcha (`127.0.0.1:8082`):

```python
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

KITOB = {'uz': {'nom': 'Git asoslari', 'til': "o'zbek"},
         'en': {'nom': 'Git basics', 'til': 'English'}}


def tanlash(sarlavha, mavjud):
    """Accept* qatoridan eng yuqori q qiymatli mos variantni tanlaydi."""
    nomzodlar = []
    for qism in (sarlavha or '*').split(','):
        nom, *param = [s.strip() for s in qism.split(';')]
        q = 1.0
        for p in param:
            if p.startswith('q='):
                q = float(p[2:])
        for m in mavjud:
            if q > 0 and (nom in (m, '*', '*/*') or nom == m.split('/')[0] + '/*' or nom == m.split('-')[0]):
                nomzodlar.append((q, -mavjud.index(m), m))
    return max(nomzodlar)[2] if nomzodlar else None


class Ishlovchi(BaseHTTPRequestHandler):
    def do_GET(self):
        tur = tanlash(self.headers.get('Accept'), ['application/json', 'text/html'])
        til = tanlash(self.headers.get('Accept-Language'), ['uz', 'en']) or 'uz'
        if tur is None:
            self.send_response(406)
            self.send_header('Content-Length', '0')
            self.end_headers()
            return
        k = KITOB[til]
        if tur == 'application/json':
            tana = json.dumps(k, ensure_ascii=False).encode()
        else:
            tana = f"<h1>{k['nom']}</h1>".encode()
        self.send_response(200)
        self.send_header('Content-Type', f'{tur}; charset=utf-8')
        self.send_header('Content-Language', til)
        self.send_header('Content-Length', str(len(tana)))
        self.send_header('Vary', 'Accept, Accept-Language')
        self.end_headers()
        self.wfile.write(tana)


ThreadingHTTPServer(('127.0.0.1', 8082), Ishlovchi).serve_forever()
```

`tanlash()` — soddalashtirilgan: header qatoridan eng yuqori `q` li mos variantni oladi (teng bo'lsa — ro'yxatda birinchisi).

```text vps
$ curl -si -H 'Accept: application/json' -H 'Accept-Language: uz' http://127.0.0.1:8082/kitob | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 200 OK
Content-Type: application/json; charset=utf-8
Content-Language: uz
Content-Length: 40
Vary: Accept, Accept-Language

{"nom": "Git asoslari", "til": "o'zbek"}
```

Brauzer odatda yuboradigan qatorlar bilan:

```text vps
$ curl -si -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: en-US,en;q=0.9,uz;q=0.8' http://127.0.0.1:8082/kitob | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 200 OK
Content-Type: text/html; charset=utf-8
Content-Language: en
Content-Length: 19
Vary: Accept, Accept-Language

<h1>Git basics</h1>
```

- `text/html` (`q=1`) JSON'dan (`*/*;q=0.8` orqali) afzal — HTML keldi.
- `en` (`q=0.9`) `uz` (`q=0.8`) dan afzal — inglizcha.
- Bir xil URL — boshqa javob. `Vary` keshga buni bildiradi.

Header'siz va qabul qilib bo'lmaydigan tur bilan:

```text vps
$ curl -si http://127.0.0.1:8082/kitob | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 200 OK
Content-Type: application/json; charset=utf-8
Content-Language: uz
Content-Length: 40
Vary: Accept, Accept-Language

{"nom": "Git asoslari", "til": "o'zbek"}
$ curl -si -H 'Accept: image/png' http://127.0.0.1:8082/kitob | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.0 406 Not Acceptable
Content-Length: 0

```

- `curl` standart holatda `Accept: */*` yuboradi (6-bob) — server birinchi variantni (JSON) berdi.
- `image/png` — server bera olmaydi: `406 Not Acceptable`.

### Haqiqiy sayt: MDN tilni tanlaydi

```text vps
$ curl -sI -H 'Accept-Language: fr' https://developer.mozilla.org/ | tr -d '\r' | grep -i '^HTTP\|^location\|^vary'
HTTP/2 302 
location: /fr/
vary: Accept
$ curl -sI -H 'Accept-Language: uz' https://developer.mozilla.org/ | tr -d '\r' | grep -i '^HTTP\|^location'
HTTP/2 302 
location: /en-US/
```

- Fransuzcha so'ragan mijoz `/fr/` ga yo'naltirildi (`302`, 10-bob).
- O'zbekcha versiya yo'q — `/en-US/` ga.
- Til header bo'yicha faqat **kirish sahifasida** tanlandi; keyin har til o'z URL'ida (`/fr/`, `/en-US/`) — MDN maqolasidagi tavsiya ham shunday: header faqat kirish sahifasi uchun, keyin foydalanuvchi tanlovi.

## Standartda nima deyilgan

| Hujjat | Bo'lim | Gap |
| --- | --- | --- |
| RFC 9110 | 8.3 | `Content-Type` bo'lmasa, qabul qiluvchi `application/octet-stream` deb hisoblashi yoki ma'lumotga qarab turini aniqlashi mumkin. Amalda serverlar har doim to'g'ri tur bermaydi, shuning uchun ba'zi agentlar kontentni tekshiradi |
| RFC 9110 | 8.6 | `Content-Length` — baytlar soni |
| RFC 9110 | 12, 12.1 | Kontentni kelishish; server boshqaradigan (proactive) usul |
| RFC 9110 | 12.4.2 | `q` — 0..1; `0` — qabul qilinmaydi; yo'q bo'lsa — 1 |
| RFC 9110 | 12.5.1, 12.5.4 | `Accept`, `Accept-Language` |
| RFC 9110 | 12.5.5 | `Vary` — so'rovning qaysi qismlari javob tanloviga ta'sir qilgan bo'lishi mumkin |
| RFC 9110 | 15.5.7 | `406 Not Acceptable` |
| RFC 6838 (2013-yil yanvar) | — | Media turlari va ularni ro'yxatdan o'tkazish |
| RFC 6648 (2012-yil iyun) | — | `X-` prefiksidan voz kechish |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| "Brauzer `.js` kengaytmasidan biladi" | Brauzer **MIME turiga** qaraydi (MDN) | Server to'g'ri `Content-Type` yuborishi kerak |
| Noma'lum kengaytmali yuklab olinadigan fayl brauzerda ochilishini kutish | Server `application/octet-stream` beradi — brauzer saqlashni taklif qiladi | Kerakli tur uchun `types` ga qo'shish |
| Matnni `charset` siz yuborish | Brauzer kodlashni taxmin qiladi, o'zbekcha `‘`, `ʻ` buziladi | `text/html; charset=utf-8` (nginx: `charset utf-8;`) |
| `Content-Length` ni belgilar soni deb hisoblash | Baytlar soni; UTF-8 da bir belgi 1–4 bayt | Baytlarni sanash (`wc -c`) |
| Tanlov header'ga bog'liq, lekin `Vary` yo'q | Kesh inglizcha nusxani o'zbek foydalanuvchiga beradi | `Vary: Accept-Language` |
| Tilni faqat `Accept-Language` dan aniqlash | MDN: foydalanuvchi niyatini aks ettirmasligi mumkin | Tilni tanlash menyusi va URL'da til (`/fr/`) |
| Yangi maxsus header'ga `X-` qo'shish | RFC 6648 bu odatdan voz kechgan | Aniq, prefikssiz nom |

## Amaliyot

1. `image/svg+xml` da tur, tur osti qaysi? `text/html; charset=utf-8` da parametr qaysi?
2. Nega server kengaytmasi `.js` bo'lgan faylga `text/plain` yuborsa muammo bo'ladi?
3. Fayl 10 ta o'zbekcha belgidan iborat, ulardan ikkitasi `ʻ`. `Content-Length` 10 bo'ladimi?
4. `Accept: application/json;q=0.5, text/html` — server ikkalasini ham bera olsa, qaysi birini tanlaydi?
5. `Vary: Accept-Language` nima uchun kerak?
6. `406` qachon qaytariladi?

<details>
<summary>Javoblar</summary>

1. Tur `image`, tur osti `svg+xml`. Parametr — `charset=utf-8`.
2. Brauzer fayl turini kengaytmadan emas, `Content-Type` dan aniqlaydi — skript sifatida ishlamasligi mumkin.
3. Yo'q: `ʻ` (U+02BB) UTF-8 da 2 bayt — jami 12 bayt.
4. `text/html` — uning `q` si 1 (yozilmagan), JSON'niki 0.5.
5. Javob tilga qarab tanlanganini keshga bildirish uchun — kesh boshqa tildagi foydalanuvchiga noto'g'ri nusxani bermasligi uchun.
6. Server mijoz qabul qiladigan formatlarning hech birini bera olmasa (sinovda `Accept: image/png`).

</details>

## Rasmiy hujjat

- [MDN: HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers)
- [MDN: MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types) · [Common media types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types)
- [MDN: Content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation)
- [MDN: Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type) · [Content-Length](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Length) · [Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept) · [Accept-Language](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Language) · [Vary](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Vary)
- [RFC 9110 §8.3, §8.6, §12](https://www.rfc-editor.org/rfc/rfc9110#name-content-negotiation)
- [RFC 6838: Media Type Specifications](https://www.rfc-editor.org/rfc/rfc6838) · [RFC 9239: JavaScript media types](https://www.rfc-editor.org/rfc/rfc9239) · [RFC 6648: Deprecating the "X-" Prefix](https://www.rfc-editor.org/rfc/rfc6648)
- [IANA: Media Types](https://www.iana.org/assignments/media-types/media-types.xhtml)
- [nginx: `types`, `default_type`](https://nginx.org/en/docs/http/ngx_http_core_module.html) · [`charset`](https://nginx.org/en/docs/http/ngx_http_charset_module.html)
