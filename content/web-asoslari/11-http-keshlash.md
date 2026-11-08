# 11 — HTTP keshlash

[Mundarija](README.md)

## Tushuncha

MDN (HTTP caching): **HTTP kesh** (cache) javobni so'rov bilan birga saqlab qo'yadi va keyingi so'rovlarda **qayta ishlatadi**. Foydasi:

- so'rov serverga bormaydi — kesh mijozga qanchalik yaqin bo'lsa, javob shunchalik tez (eng yaqini — brauzerning o'z keshi);
- server so'rovni ishlamaydi — sessiyani tiklash, bazaga so'rov, shablon chizish kerak emas, yuklama kamayadi.

### Kesh turlari

RFC 9111 ikki asosiy turni ajratadi (MDN):

| Tur | Qayerda | Nimani saqlash mumkin |
| --- | --- | --- |
| **Xususiy** (private) kesh | Bitta mijozga bog'langan — odatda brauzer keshi | Shaxsiy javoblar ham: boshqa foydalanuvchiga berilmaydi |
| **Umumiy** (shared) kesh | Mijoz va server orasida, ko'p foydalanuvchiga xizmat qiladi | Faqat hammaga bir xil javoblar |

Umumiy kesh ikki xil: **proksi kesh** (tarmoq trafikini kamaytirish uchun; servis egasi boshqarmaydi) va **boshqariladigan kesh** (managed cache) — servis egasi o'zi qo'ygan: teskari proksi (nginx), CDN, Service Worker. MDN: HTTPS keng tarqalgani uchun yo'ldagi proksilar ko'pincha javobni ko'ra olmaydi, faqat tunnel qiladi.

**Shaxsiy javob umumiy keshga tushsa — boshqa foydalanuvchi uni ko'rishi mumkin.** Shuning uchun shaxsiy kontentga `Cache-Control: private`. MDN: cookie borligi javobni avtomatik xususiy qilmaydi.

### Yangi va eskirgan

Saqlangan javob ikki holatda bo'ladi (MDN):

- **yangi** (fresh) — hali yaroqli, qayta ishlatiladi;
- **eskirgan** (stale) — muddati o'tgan.

Mezon — **yosh** (age): javob yaratilgandan beri o'tgan vaqt (DNS'dagi TTL'ga o'xshash, 4-bob).

```http
HTTP/1.1 200 OK
Cache-Control: max-age=604800
```

`max-age=604800` (bir hafta): yoshi bir haftadan kam bo'lsa — yangi, ko'p bo'lsa — eskirgan. Umumiy kesh javobni bir kun saqlagan bo'lsa, mijozga `Age: 86400` qo'shib beradi — mijoz yana 518400 soniya yangi deb biladi.

**`Expires`** — HTTP/1.0 dan qolgan, aniq sana bilan muddat. MDN: sana formatini o'qish qiyin, soat surilsa muammo — shuning uchun HTTP/1.1 da `max-age`. RFC 9111 (5.3): `max-age` bo'lsa, `Expires` e'tiborga olinmaydi.

**Evristik keshlash** (heuristic caching, MDN): `Cache-Control` umuman bo'lmasa ham, javob ba'zi shartlarda saqlanadi. Masalan, `Last-Modified` bir yil oldin bo'lsa, kesh uni bir muddat o'zgarmaydi deb hisoblaydi; RFC 9111 (4.2.2) — odatiy qiymat oraliqning ~10% i. MDN: shuning uchun **har bir** javobga `Cache-Control` ni aniq yozish kerak.

### Tekshirish: shartli so'rov

Eskirgan javob darhol tashlab yuborilmaydi. Kesh serverdan "o'zgardimi?" deb so'raydi — **tekshirish** (validation, revalidation). Bu **shartli so'rov** (conditional request) bilan qilinadi:

| Javobda (server beradi) | Keyingi so'rovda (kesh yuboradi) | O'zgarmagan bo'lsa |
| --- | --- | --- |
| `Last-Modified: <sana>` | `If-Modified-Since: <o'sha sana>` | `304 Not Modified` |
| `ETag: "33a64df5"` | `If-None-Match: "33a64df5"` | `304 Not Modified` |

- **`ETag`** — resurs **versiyasining belgisi**; qanday hisoblanishini server o'zi tanlaydi (tana xeshi, versiya raqami…). MDN: `Last-Modified` sanasini o'qish qiyin va bir nechta serverda fayl vaqtlarini moslash murakkab — `ETag` shuning uchun kiritilgan.
- `304` — tanasiz, juda kichik javob. Kesh o'zidagi nusxani yana "yangi" deb belgilaydi.
- O'zgargan bo'lsa — oddiy `200` va yangi versiya.
- Ikkalasi ham bo'lsa, `If-None-Match` ustun (RFC 9110, 13.2.2). MDN tavsiyasi: `ETag` ham, `Last-Modified` ham yuborilsin.

### `Cache-Control` direktivalari

| Direktiva | Ma'nosi (RFC 9111, MDN) |
| --- | --- |
| `max-age=N` | N soniya yangi |
| `no-cache` | Saqlash **mumkin**, lekin har ishlatishdan oldin serverda **tekshirish shart**. "Keshlama" degani emas! |
| `no-store` | **Umuman saqlamaslik** — na xususiy, na umumiy kesh |
| `private` | Faqat xususiy (brauzer) keshi saqlaydi |
| `public` | `Authorization` bor so'rov javobini ham saqlashga ruxsat |
| `must-revalidate` | Eskirgandan keyin tekshirmasdan ishlatmaslik |
| `immutable` | Kontent hech o'zgarmaydi — sahifa yangilanganda ham tekshirish kerak emas |

MDN izohlari:

- `no-cache` va `no-store` ni chalkashtirmang: `no-store` allaqachon saqlangan eski javobni **o'chirmaydi**; `no-cache` esa har safar tekshiruvni majburlaydi. Har doim yangi kontent kerak bo'lsa — `no-cache`.
- `no-store` brauzerning ko'p imkoniyatlarini (jumladan, orqaga/oldinga keshini — bfcache) yo'qotadi; MDN o'rniga `no-cache, private` ni tavsiya qiladi.
- Eski proksilar uchun yoziladigan "hammasi birga" qator (`no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate`) kerak emas.

### Tipik naqshlar

MDN:

| Resurs | `Cache-Control` | Nega |
| --- | --- | --- |
| Standart (har javob) | `no-cache` | Evristik keshlashdan qochish, har doim oxirgi versiya |
| Shaxsiy sahifa (login, cookie) | `no-cache, private` | Boshqa foydalanuvchiga tushmasin |
| URL'da versiya yoki xesh bor fayl (`bundle.v123.js`, `bundle.YsAI….js`) | `max-age=31536000` (1 yil) yoki `public, max-age=31536000`, kerak bo'lsa `immutable` | Kontent o'zgarsa — URL o'zgaradi (**cache busting**) |

Kesh resurslarni **URL** bo'yicha ajratadi; URL o'zgarsa — yangi resurs. Shuning uchun HTML'ni qisqa (yoki `no-cache`), undagi versiyalangan JS/CSS'ni uzoq keshlash mumkin.

**Saqlangan javobni o'chirib bo'lmaydi** (MDN): uzoq `max-age` bilan saqlangan javob kesh muddati tugaguncha ishlatiladi — so'rovlar serverga yetmaydi. Shuning uchun tez-tez o'zgaradigan resursga uzoq `max-age` berilmaydi.

### Sahifani yangilash

MDN: brauzerning **yangilash** (reload) tugmasi so'rovga `Cache-Control: max-age=0` va validatorlarni (`If-None-Match`, `If-Modified-Since`) qo'shadi — shartli tekshiruv. **Majburiy yangilash** (force reload) — `Cache-Control: no-cache` (va `Pragma: no-cache`), validatorlarsiz: aniq `200`. JavaScript'da: `fetch(url, { cache: "no-cache" })` — oddiy yangilashga, `{ cache: "reload" }` — majburiy yangilashga o'xshaydi.

## Ko'rib chiqamiz

Bitta Python serveri ikkala muhitda: har so'rovni jurnalga yozadi (qaysi `If-None-Match` va `Cache-Control` kelgani bilan). Yo'llar va ularning siyosati: `/vaqt` — `max-age=5`, `/profil` — `private, max-age=60`, `/yangilik` — `no-cache`, `/maxfiy` — `no-store`. `/ozgartir` — versiyani oshiradi (`ETag` `"v1"` → `"v2"`).

```python
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

versiya = 1
sorovlar = 0


class Ishlovchi(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'      # doimiy ulanish; Content-Length har doim aniq

    def do_GET(self):
        global versiya, sorovlar
        sorovlar += 1
        print(f'#{sorovlar} {self.path} If-None-Match={self.headers.get("If-None-Match")} '
              f'Cache-Control={self.headers.get("Cache-Control")}', flush=True)
        if self.path == '/ozgartir':
            versiya += 1
            return self.javob(200, 'no-store', f'versiya {versiya}\n')
        etag = f'"v{versiya}"'
        siyosat = {'/vaqt': 'max-age=5', '/profil': 'private, max-age=60',
                   '/yangilik': 'no-cache', '/maxfiy': 'no-store'}.get(self.path, 'max-age=5')
        if self.headers.get('If-None-Match') == etag:
            return self.javob(304, siyosat, None, etag)
        self.javob(200, siyosat, f'{self.path} versiya {versiya}\n', etag)

    def javob(self, kod, siyosat, matn, etag=None):
        self.send_response(kod)
        self.send_header('Cache-Control', siyosat)
        if etag:
            self.send_header('ETag', etag)
        if matn is not None:
            tana = matn.encode()
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Content-Length', str(len(tana)))
        self.end_headers()
        if matn is not None:
            self.wfile.write(tana)

    def log_message(self, *a):
        pass


ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1])), Ishlovchi).serve_forever()
```

`protocol_version = 'HTTP/1.1'` haqida — pastda, "Brauzer keshi" bo'limida.

### Statik fayl: nginx'ning `ETag` va `Last-Modified`

VPS'da nginx 1.30.6. Sozlama (`/statik/` — obrazdagi standart `index.html`; `/` — keyingi bo'lim uchun):

```nginx
proxy_cache_path /var/cache/nginx/kesh keys_zone=kesh:1m;

server {
    listen 8080;

    location / {
        proxy_pass http://127.0.0.1:8084;
        proxy_cache kesh;
        proxy_cache_revalidate on;
        add_header X-Cache $upstream_cache_status;
    }

    location /statik/ {
        alias /usr/share/nginx/html/;
    }
}
```

```text vps
$ curl -sI http://127.0.0.1:8080/statik/index.html | tr -d '\r' | grep -i '^HTTP\|^etag\|^last-modified\|^cache-control\|^x-cache'
HTTP/1.1 200 OK
Last-Modified: Fri, 02 Oct 2026 14:33:28 GMT
ETag: "6abfc0b8-380"
```

nginx statik faylga validatorlarni **o'zi** qo'shdi: fayl o'zgargan vaqt va `ETag`. Shartli so'rovlar:

```text vps
ETag="6abfc0b8-380"
Last-Modified=Fri, 02 Oct 2026 14:33:28 GMT
HTTP/1.1 304 Not Modified
HTTP/1.1 304 Not Modified
HTTP/1.1 200 OK
```

Uchta so'rov natijasi: `If-None-Match: "6abfc0b8-380"` → `304`; `If-Modified-Since: Fri, 02 Oct 2026 14:33:28 GMT` → `304`; `If-None-Match: "eski"` (boshqa versiya) → `200`, to'liq fayl.

`Cache-Control` yo'q — bunday javobga evristik keshlash qo'llanishi mumkin. Haqiqiy saytda unga siyosat yozilishi kerak.

### Umumiy kesh: nginx `proxy_cache`

`proxy_cache kesh` — nginx backend javoblarini keshlaydi; `proxy_cache_revalidate on` — eskirganini shartli so'rov (`If-None-Match`, `If-Modified-Since`) bilan tekshiradi (nginx hujjati); `X-Cache` — `$upstream_cache_status` (`MISS`, `HIT`, `EXPIRED`, `REVALIDATED`…).

Birinchi 5 soniya ichida `/vaqt` ga **to'rt** so'rov (sikl ichida har biridan keyin yana bitta, chiqishsiz):

```text vps
$ for i in 1 2; do curl -si http://127.0.0.1:8080/vaqt | tr -d '\r' | grep -i '^HTTP\|^etag\|^last-modified\|^cache-control\|^x-cache'; curl -s http://127.0.0.1:8080/vaqt -o /dev/null; done
HTTP/1.1 200 OK
Cache-Control: max-age=5
ETag: "v1"
X-Cache: MISS
HTTP/1.1 200 OK
Cache-Control: max-age=5
ETag: "v1"
X-Cache: HIT
```

`MISS` — keshda yo'q edi, backend'dan olindi; `HIT` — keshdan berildi.

6 soniyadan keyin (javob eskirdi):

```text vps
$ sleep 6; curl -si http://127.0.0.1:8080/vaqt | tr -d '\r' | grep -i '^HTTP\|^etag\|^last-modified\|^cache-control\|^x-cache'; curl -s http://127.0.0.1:8080/vaqt
HTTP/1.1 200 OK
Cache-Control: max-age=5
ETag: "v1"
X-Cache: REVALIDATED
/vaqt versiya 1
```

`REVALIDATED` — nginx backend'dan `If-None-Match: "v1"` bilan so'radi, `304` oldi va saqlangan nusxani berdi. Mijoz baribir `200` va to'liq tanani oldi: `304` faqat nginx bilan backend orasida.

Versiya o'zgargach:

```text vps
$ curl -s http://127.0.0.1:8080/ozgartir; sleep 6; curl -si http://127.0.0.1:8080/vaqt | tr -d '\r' | grep -i '^HTTP\|^etag\|^last-modified\|^cache-control\|^x-cache'; curl -s http://127.0.0.1:8080/vaqt
versiya 2
HTTP/1.1 200 OK
Cache-Control: max-age=5
ETag: "v2"
X-Cache: EXPIRED
/vaqt versiya 2
```

`EXPIRED` — eskirgan, tekshiruvda backend yangi versiyani (`"v2"`) `200` bilan berdi.

`private`, `no-cache`, `no-store` (har biri ikki marta):

```text vps
$ for i in 1 2; do curl -si http://127.0.0.1:8080/profil | tr -d '\r' | grep -i '^HTTP\|^etag\|^last-modified\|^cache-control\|^x-cache'; done
HTTP/1.1 200 OK
Cache-Control: private, max-age=60
ETag: "v2"
X-Cache: MISS
HTTP/1.1 200 OK
Cache-Control: private, max-age=60
ETag: "v2"
X-Cache: MISS
```

`private` — umumiy kesh (nginx) saqlamadi: ikkala safar `MISS`. `/yangilik` (`no-cache`) va `/maxfiy` (`no-store`) da ham ikkala safar `MISS`. `no-store` uchun bu standart talabi; `no-cache` da RFC 9111 saqlashga ruxsat beradi (har safar tekshirish sharti bilan), nginx esa uni umuman saqlamadi (kuzatildi).

Backend jurnali — haqiqatda nechta so'rov unga yetdi:

```text vps
$ cat /tmp/k11/backend.log
#1 /vaqt If-None-Match=None Cache-Control=None
#2 /vaqt If-None-Match="v1" Cache-Control=None
#3 /ozgartir If-None-Match=None Cache-Control=None
#4 /vaqt If-None-Match="v1" Cache-Control=None
#5 /profil If-None-Match=None Cache-Control=None
#6 /profil If-None-Match=None Cache-Control=None
#7 /yangilik If-None-Match=None Cache-Control=None
#8 /yangilik If-None-Match=None Cache-Control=None
#9 /maxfiy If-None-Match=None Cache-Control=None
#10 /maxfiy If-None-Match=None Cache-Control=None
```

- Mijoz `/vaqt` ga jami **8** so'rov yubordi, backend'ga **3** tasi yetdi (`#1`, `#2`, `#4`); `#2` va `#4` — nginx'ning shartli tekshiruvi.
- `/profil`, `/yangilik`, `/maxfiy` — har so'rov backend'ga bordi.

### Brauzer keshi

Xuddi shu server lokal kompyuterda (`127.0.0.1:8084`), Chromium 158 da sahifa ichidan `fetch()`:

```js
import { chromium } from '/Users/mfsv/Projects/dev-docs/node_modules/playwright-core/index.mjs'
const b = await chromium.launch(); const p = await b.newPage()
await p.goto('http://127.0.0.1:8084/bosh')
const f = (yol, opt) => p.evaluate(async ([y, o]) => { const r = await fetch(y, o); return `${y} ${JSON.stringify(o || {})} → ${r.status} ${(await r.text()).trim()}` }, [yol, opt])
const kut = ms => new Promise(r => setTimeout(r, ms))
console.log('[1]', await f('/vaqt')); console.log('[2]', await f('/vaqt'))
await kut(6000); console.log('[3, 6 s keyin]', await f('/vaqt'))
console.log('[4]', await f('/vaqt', { cache: 'no-cache' }))
console.log('[5]', await f('/vaqt', { cache: 'reload' }))
for (const y of ['/profil', '/profil', '/yangilik', '/yangilik', '/maxfiy', '/maxfiy']) console.log('[6]', await f(y))
await p.reload(); console.log('[7] sahifa qayta yuklandi (reload)')
console.log('chromium', b.version())
await b.close()
```

Brauzer natijalari (har biri `200` va bir xil tana — farq faqat server jurnalida):

```text tashqi
[1] /vaqt {} → 200 /vaqt versiya 1
[2] /vaqt {} → 200 /vaqt versiya 1
[3, 6 s keyin] /vaqt {} → 200 /vaqt versiya 1
[4] /vaqt {"cache":"no-cache"} → 200 /vaqt versiya 1
[5] /vaqt {"cache":"reload"} → 200 /vaqt versiya 1
```

Server jurnali:

```text tashqi
#1 /bosh If-None-Match=None Cache-Control=None
#2 /vaqt If-None-Match=None Cache-Control=None
#3 /vaqt If-None-Match="v1" Cache-Control=None
#4 /vaqt If-None-Match="v1" Cache-Control=max-age=0
#5 /vaqt If-None-Match=None Cache-Control=no-cache
#6 /profil If-None-Match=None Cache-Control=None
#7 /yangilik If-None-Match=None Cache-Control=None
#8 /yangilik If-None-Match="v1" Cache-Control=None
#9 /maxfiy If-None-Match=None Cache-Control=None
#10 /maxfiy If-None-Match=None Cache-Control=None
#11 /bosh If-None-Match="v1" Cache-Control=max-age=0
```

| Brauzerda | Jurnalda | Nima bo'ldi |
| --- | --- | --- |
| `[1]` | `#2` | Birinchi so'rov — serverdan |
| `[2]` | — | **Serverga bormadi**: `max-age=5` ichida, brauzer keshidan |
| `[3]` 6 s keyin | `#3` `If-None-Match="v1"` | Eskirdi → shartli so'rov → `304`. `fetch()` ga brauzer `200` va saqlangan tanani berdi |
| `[4]` `cache: "no-cache"` | `#4` `If-None-Match` + `Cache-Control: max-age=0` | MDN'dagi "oddiy yangilash" so'rovi |
| `[5]` `cache: "reload"` | `#5` `Cache-Control: no-cache`, validatorsiz | "Majburiy yangilash" — doim to'liq `200` |
| `/profil` ×2 | faqat `#6` | `private` — **brauzer** keshida saqlandi (nginx'da saqlanmagan edi) |
| `/yangilik` ×2 | `#7`, `#8` `If-None-Match` | `no-cache` — brauzer saqladi, lekin har safar tekshirdi |
| `/maxfiy` ×2 | `#9`, `#10` | `no-store` — umuman saqlanmadi |
| `page.reload()` | `#11` `If-None-Match` + `max-age=0` | Sahifani yangilash — MDN tavsifidagi aynan shu so'rov |

**HTTP/1.0 va `ETag` (kuzatildi).** Sinov dastlab `protocol_version` siz — Python standarti bo'yicha `HTTP/1.0` javoblar bilan o'tkazildi (5-bob). Shunda Chromium **birorta ham** shartli so'rov yubormadi: `[3]`, `[4]`, `/yangilik` va `reload` da `If-None-Match` yo'q edi, resurs har safar to'liq yuklandi. `HTTP/1.1` ga o'tkazilgach — yuqoridagi natija. Bu Chromium'ning xatti-harakati; RFC'larda bunday cheklov yo'q. Amaliy xulosa: ilova serveri HTTP/1.1 bilan javob bersin (nginx va boshqa production serverlar shunday qiladi).

## Standartda nima deyilgan

| Hujjat | Bo'lim | Gap |
| --- | --- | --- |
| RFC 9111 | 3 | Javobni qachon saqlash mumkin |
| RFC 9111 | 4.2.2 | Evristik muddat; odatiy ulush — 10% |
| RFC 9111 | 4.3 | Tekshirish (validation) |
| RFC 9111 | 5.1 | `Age` |
| RFC 9111 | 5.2.2.1, 5.2.2.4, 5.2.2.5, 5.2.2.7, 5.2.2.9 | `max-age`, `no-cache` (tekshirmasdan ishlatish **mumkin emas**), `no-store` (saqlash **mumkin emas**, xususiy va umumiy keshlar uchun), `private`, `public` |
| RFC 9111 | 5.3 | `max-age` bo'lsa, `Expires` e'tiborga olinmaydi |
| RFC 9110 | 8.8.2, 8.8.3 | `Last-Modified`, `ETag` |
| RFC 9110 | 13.1.2, 13.1.3, 13.2.2 | `If-None-Match`, `If-Modified-Since`, ularning ustuvorligi |
| RFC 9110 | 15.4.5 | `304 Not Modified` |

RFC 9111 (5.2.2.5) ogohlantiradi: `no-store` maxfiylikni ta'minlashning ishonchli vositasi **emas** — buzilgan yoki yomon niyatli kesh unga bo'ysunmasligi mumkin.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| "`no-cache` — keshlama" | Saqlaydi, faqat har safar tekshiradi (sinovda brauzer `If-None-Match` yubordi) | Umuman saqlamaslik — `no-store` |
| Shaxsiy sahifaga `max-age` (`private` siz) | Umumiy kesh boshqa foydalanuvchiga beradi | `no-cache, private` |
| `Cache-Control` yozmaslik | Evristik keshlash — javob kutilmagan muddat saqlanadi | Har javobga aniq siyosat |
| HTML'ga uzoq `max-age` | Yangi versiya chiqsa ham foydalanuvchi eskisini ko'radi; o'chirib bo'lmaydi | HTML — `no-cache`; JS/CSS — URL'da versiya + uzoq `max-age` |
| Yangilanadigan faylni bir xil URL'da uzoq keshlash | Kesh URL bo'yicha ishlaydi | Cache busting: `app.v124.js` |
| `ETag`/`Last-Modified` bermaslik | Tekshiruv imkonsiz — har safar to'liq javob | Validatorlarni yuborish (nginx statikka o'zi qo'shadi) |
| Ilova serveri `HTTP/1.0` bilan javob beradi | Chromium bunday javoblarni `ETag` bilan tekshirmadi (kuzatildi) | `HTTP/1.1` |
| "Hammasi birga" qator: `no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate` | MDN: kerak emas | Maqsadga mos bitta-ikkita direktiva |

## Amaliyot

1. Xususiy va umumiy kesh farqi nima? nginx `proxy_cache` qaysi turi?
2. `max-age=60` bilan olingan javob 30 soniyadan keyin va 90 soniyadan keyin qanday ishlatiladi?
3. `no-cache` va `no-store` farqi nima?
4. `304` javobida tana bormi? Unda mijoz kontentni qayerdan oladi?
5. Sinovda `/profil` nginx'da keshlanmadi, brauzerda keshlandi. Nega?
6. `app.js` ni bir yilga keshlamoqchisiz, lekin har relizda u o'zgaradi. Nima qilasiz?

<details>
<summary>Javoblar</summary>

1. Xususiy — bitta mijozniki (brauzer), umumiy — ko'p foydalanuvchiga xizmat qiladi. nginx `proxy_cache` — umumiy (boshqariladigan) kesh.
2. 30 s — yangi, serverga bormasdan ishlatiladi. 90 s — eskirgan: shartli so'rov bilan tekshiriladi.
3. `no-cache` — saqlash mumkin, lekin har ishlatishdan oldin tekshirish shart; `no-store` — umuman saqlamaslik.
4. Yo'q. Mijoz o'z keshidagi nusxani ishlatadi va uni yana yangi deb belgilaydi.
5. `private` — faqat xususiy kesh saqlashi mumkin: nginx umumiy, brauzer xususiy.
6. URL'ga versiya yoki xesh qo'shish (`app.3f9a2c.js`) va `max-age=31536000`; HTML'ni esa `no-cache` qilish.

</details>

## Rasmiy hujjat

- [MDN: HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
- [MDN: HTTP conditional requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Conditional_requests)
- [MDN: Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control) · [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag)
- [RFC 9111: HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111)
- [RFC 9110 §13: Conditional Requests](https://www.rfc-editor.org/rfc/rfc9110#name-conditional-requests)
- [nginx: `proxy_cache`, `proxy_cache_revalidate`](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) · [`$upstream_cache_status`](https://nginx.org/en/docs/http/ngx_http_upstream_module.html#var_upstream_cache_status)
