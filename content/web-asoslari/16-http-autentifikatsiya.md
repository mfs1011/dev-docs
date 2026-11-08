# 16 — HTTP autentifikatsiyasi

[Mundarija](README.md)

## Tushuncha

MDN (HTTP authentication): HTTP'da kirishni cheklash va **autentifikatsiya** (kimligini tasdiqlash) uchun umumiy tuzilma bor. U RFC 9110 ning 11-bo'limida (avval RFC 7235) ta'riflangan.

### Chaqiruv va javob

| Qadam | Kim | Nima |
| --- | --- | --- |
| 1 | Server | `401 Unauthorized` va **`WWW-Authenticate`** header'ida kamida bitta **chaqiruv** (challenge): qaysi usul bilan kelish kerak |
| 2 | Mijoz | **`Authorization`** header'ida hisob ma'lumotlari (credentials) bilan qayta so'raydi |
| 3 | Brauzer | Odatda foydalanuvchiga login/parol oynasini ko'rsatadi va shu header bilan so'raydi |

```http
WWW-Authenticate: <sxema> realm=<soha>
Authorization: <sxema> <ma'lumotlar>
```

- **Sxema** (scheme) — usul: `Basic`, `Bearer`, `Digest`…
- **`realm`** — himoyalangan soha nomi; foydalanuvchiga qayerga kirayotganini aytadi ("Sinov sahifasi").

Proksi uchun xuddi shu mexanizm, boshqa nomlar bilan: `407 Proxy Authentication Required`, `Proxy-Authenticate`, `Proxy-Authorization`.

**`401` va `403`** (MDN, 8-bob): ma'lumotlar **yaroqsiz** — `401` (yana urinish mumkin); ma'lumotlar to'g'ri, lekin **huquq yetmaydi** — `403` (qayta kirish foyda bermaydi). Ikkala holatda ham server sahifa borligini yashirish uchun `404` qaytarishi mumkin.

### Sxemalar

IANA sxemalar ro'yxatini yuritadi. Keng tarqalganlari (MDN):

| Sxema | Standart | Nima |
| --- | --- | --- |
| `Basic` | RFC 7617 | Login va parol, base64 bilan kodlangan |
| `Bearer` | RFC 6750 | OAuth 2.0 tokeni |
| `Digest` | RFC 7616 | Xesh asosida |
| `Negotiate` / `NTLM` | RFC 4559 | Windows/Kerberos muhitlari |
| `AWS4-HMAC-SHA256` | AWS hujjati | Imzolangan so'rov |

### Basic

RFC 7617: `Authorization: Basic <base64(login:parol)>`. Login va parol `:` bilan qo'shiladi va **base64** bilan kodlanadi. Shuning uchun loginda `:` bo'lishi mumkin emas — birinchi `:` ajratuvchi.

**Xavfsizligi** (MDN, ogohlantirish): base64 — **shifrlash emas**, qaytariladigan kodlash; login va parol tarmoqda amalda ochiq matn. Faqat HTTPS bilan. Bundan tashqari Basic CSRF'ga ayniqsa zaif: brauzer bu ma'lumotlarni qaysi saytdan bo'lishidan qat'i nazar har so'rovga qo'shadi (cookie'lar esa ko'pincha boshqa saytdan kelgan so'rovda bloklanadi, 14-bob). MDN: bunday himoyalarsiz Basic muhim ma'lumotni himoya qilish uchun ishlatilmasin.

**URL'dagi login va parol** (`https://login:parol@example.com/`) — MDN: zamonaviy brauzerlarda bu sintaksisga endi ruxsat yo'q, login va parol so'rov yuborilishidan oldin olib tashlanadi (2-bobda `new URL()` ularni ajratib ko'rsatgan edi).

### Bearer

RFC 6750 (2012-yil oktabr): **bearer token** — "egasi" (bearer) bo'lgan **har kim** uni ishlata oladigan token; ishlatish uchun kriptografik kalitga egalikni isbotlash kerak emas. Ya'ni token — kalitning o'zi: o'g'irlansa, o'g'ri ham ishlatadi.

```http
Authorization: Bearer mF_9.B5f-4.1JqM
```

Tokenni yuborish usullari:

| Usul | RFC 6750 |
| --- | --- |
| `Authorization: Bearer …` header | Asosiy; resurs serverlari uni qo'llashi **shart** (2.1) |
| Forma tanasida `access_token` | Ma'lum shartlarda (2.2) |
| URL'da `?access_token=…` | **Tavsiya etilmaydi** (2.3): URL jurnallarga tushish ehtimoli yuqori; boshqa iloj bo'lmasagina |

Xato kodlari (3.1) — `WWW-Authenticate` ichida:

| `error` | Qachon | HTTP kodi |
| --- | --- | --- |
| `invalid_request` | So'rov noto'g'ri tuzilgan | `400` |
| `invalid_token` | Token muddati o'tgan, bekor qilingan, buzilgan | `401` |
| `insufficient_scope` | Token huquqi yetmaydi; `scope` — nima kerakligi | `403` |
| (xato kodi yo'q) | So'rovda autentifikatsiya umuman yo'q yoki boshqa usul | `401` |

## Ko'rib chiqamiz

VPS'da nginx 1.30.6: `/maxfiy/` — Basic (nginx o'zi tekshiradi); `/api/` — Python backend, Bearer tokenni u tekshiradi.

### Basic: nginx

Parol fayli — nginx hujjati (`auth_basic_user_file`): `nom:parol` qatorlari; parol `crypt()` yoki Apache'ning MD5 varianti (`apr1`) bilan, `openssl passwd` bilan yaratish mumkin:

```text vps
$ printf 'ali:%s\n' "$(openssl passwd -apr1 'ochiq-sinov-paroli')" > /tmp/k16/htpasswd && cut -c1-10 /tmp/k16/htpasswd
ali:$apr1$
```

Faylda parolning o'zi emas, **xeshi** (`$apr1$…`). Sozlama:

```nginx
server {
    listen 8080;

    location /maxfiy/ {
        auth_basic           "Sinov sahifasi";
        auth_basic_user_file /etc/nginx/htpasswd;
        alias /usr/share/nginx/html/;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8097;
    }
}
```

```text vps
$ curl -si http://127.0.0.1:8080/maxfiy/ | tr -d '\r' | grep -i '^HTTP\|^www-authenticate\|<title>'
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic realm="Sinov sahifasi"
<head><title>401 Authorization Required</title></head>
$ curl -si -u ali:xato http://127.0.0.1:8080/maxfiy/ | tr -d '\r' | grep -i '^HTTP\|^www-authenticate\|<title>'
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic realm="Sinov sahifasi"
<head><title>401 Authorization Required</title></head>
$ curl -sv -u ali:ochiq-sinov-paroli http://127.0.0.1:8080/maxfiy/ 2>&1 | tr -d '\r' | grep -E '^> Authorization|^< HTTP|<title>'
> Authorization: Basic YWxpOm9jaGlxLXNpbm92LXBhcm9saQ==
< HTTP/1.1 200 OK
<title>Welcome to nginx!</title>
```

- Ma'lumotsiz va xato parol — `401` va chaqiruv: `Basic realm="Sinov sahifasi"`. Brauzer shu yerda login oynasini ochadi.
- `curl -u` — `Authorization: Basic …` header'ini o'zi yasadi; to'g'ri parol — `200`.

`Authorization` dagi qiymat **shifrlangan emas**:

```text vps
$ echo 'YWxpOm9jaGlxLXNpbm92LXBhcm9saQ==' | base64 -d; echo
ali:ochiq-sinov-paroli
```

Tarmoqda kim ko'rsa — parolni ham biladi. Basic faqat HTTPS bilan.

nginx xato jurnali:

```text vps
$ docker logs k16 2>&1 | grep -E '\[error\]' | sed -E 's/^[0-9\/: ]+//; s/, client: .*//'
[error] 22#22: *2 user "ali": password mismatch
```

### Ehtiyot bo'ling: `return` va `auth_basic`

Bu sinov dastlab boshqacha sozlama bilan o'tkazildi — sahifa matni `return` bilan berilgan edi:

```nginx
server {
    listen 8080;

    location /maxfiy/ {
        auth_basic           "Sinov sahifasi";
        auth_basic_user_file /etc/nginx/htpasswd;
        return 200 "Xush kelibsiz, $remote_user\n";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8097;
    }
}
```

Natija — himoya **ishlamadi**:

```text vps
$ curl -si http://127.0.0.1:8080/maxfiy/ | tr -d '\r' | grep -i '^HTTP\|^www-authenticate\|^{\|^Xush'
HTTP/1.1 200 OK
Xush kelibsiz, 
$ curl -si -u ali:xato http://127.0.0.1:8080/maxfiy/ | tr -d '\r' | grep -i '^HTTP\|^www-authenticate\|^{\|^Xush'
HTTP/1.1 200 OK
Xush kelibsiz, ali
```

Sabab — nginx so'rovni **bosqichlarda** (phases) ishlaydi. nginx dasturchi qo'llanmasi: `rewrite` moduli (`return` shu modulda) **rewrite** bosqichida, `auth_basic` esa undan keyingi **access** bosqichida ishlaydi. `return` javobni darhol yuborib, ishlovni to'xtatadi (nginx hujjati) — tekshiruvgacha navbat yetmaydi. Himoyalangan `location` da `return` ishlatmang; kontentni fayl yoki `proxy_pass` bilan bering.

### Bearer: backend

```python
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# namuna: haqiqiy tizimda tokenlar token serveri tomonidan beriladi va tekshiriladi
TOKENLAR = {'tok-ali-7Qx2': {'kim': 'ali', 'ruxsat': {'oqish'}},
            'tok-admin-9Lm4': {'kim': 'admin', 'ruxsat': {'oqish', 'yozish'}}}
KERAK = {'GET': 'oqish', 'DELETE': 'yozish'}


class Ishlovchi(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def javob(self, kod, malumot, challenge=None):
        tana = json.dumps(malumot, ensure_ascii=False).encode()
        self.send_response(kod)
        if challenge:
            self.send_header('WWW-Authenticate', challenge)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(tana)))
        self.end_headers()
        self.wfile.write(tana)

    def tekshir(self):
        sxema, _, token = (self.headers.get('Authorization') or '').partition(' ')
        if sxema != 'Bearer':        # token yo'q yoki boshqa sxema: xato kodisiz
            return self.javob(401, {'xato': 'kirish kerak'}, 'Bearer realm="kitoblar"')
        egasi = TOKENLAR.get(token)
        if egasi is None:
            return self.javob(401, {'xato': 'token yaroqsiz'},
                              'Bearer realm="kitoblar", error="invalid_token"')
        kerak = KERAK[self.command]
        if kerak not in egasi['ruxsat']:
            return self.javob(403, {'xato': 'ruxsat yetarli emas'},
                              f'Bearer realm="kitoblar", error="insufficient_scope", scope="{kerak}"')
        self.javob(200, {'kim': egasi['kim'], 'amal': self.command, 'yol': self.path})

    do_GET = do_DELETE = tekshir

    def log_message(self, *a):
        pass


ThreadingHTTPServer(('127.0.0.1', 8097), Ishlovchi).serve_forever()
```

Tekshiruv RFC 6750 jadvaliga mos: token yo'q — xato kodisiz `401`; yaroqsiz — `invalid_token`; huquq yetmaydi — `403` va `insufficient_scope`.

```text vps
$ curl -si http://127.0.0.1:8080/api/kitoblar | tr -d '\r' | grep -i '^HTTP\|^www-authenticate\|^{\|^Xush'; echo
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="kitoblar"
{"xato": "kirish kerak"}

$ curl -si -u ali:ochiq-sinov-paroli http://127.0.0.1:8080/api/kitoblar | tr -d '\r' | grep -i '^HTTP\|^www-authenticate\|^{\|^Xush'; echo
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="kitoblar"
{"xato": "kirish kerak"}

$ curl -si -H 'Authorization: Bearer tok-eski-0000' http://127.0.0.1:8080/api/kitoblar | tr -d '\r' | grep -i '^HTTP\|^www-authenticate\|^{\|^Xush'; echo
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="kitoblar", error="invalid_token"
{"xato": "token yaroqsiz"}

```

- Token yo'q, yoki boshqa sxema (`Basic`) — `401`, xato kodi yo'q: mijozga "Bearer bilan kel" deyiladi.
- Noma'lum token — `invalid_token`: mijoz yangi token olib, qayta urinishi mumkin.

`curl --oauth2-bearer` — `Authorization: Bearer` ni o'zi qo'shadi (qo'llanma: RFC 6750 bo'yicha):

```text vps
$ curl -si --oauth2-bearer tok-ali-7Qx2 http://127.0.0.1:8080/api/kitoblar | tr -d '\r' | grep -i '^HTTP\|^www-authenticate\|^{\|^Xush'; echo
HTTP/1.1 200 OK
{"kim": "ali", "amal": "GET", "yol": "/api/kitoblar"}

$ curl -si --oauth2-bearer tok-ali-7Qx2 -X DELETE http://127.0.0.1:8080/api/kitoblar/3 | tr -d '\r' | grep -i '^HTTP\|^www-authenticate\|^{\|^Xush'; echo
HTTP/1.1 403 Forbidden
WWW-Authenticate: Bearer realm="kitoblar", error="insufficient_scope", scope="yozish"
{"xato": "ruxsat yetarli emas"}

$ curl -si --oauth2-bearer tok-admin-9Lm4 -X DELETE http://127.0.0.1:8080/api/kitoblar/3 | tr -d '\r' | grep -i '^HTTP\|^www-authenticate\|^{\|^Xush'; echo
HTTP/1.1 200 OK
{"kim": "admin", "amal": "DELETE", "yol": "/api/kitoblar/3"}

```

- `ali` tokeni o'qiy oladi, o'chira olmaydi: `403`, `scope="yozish"` — nima yetishmasligi.
- `admin` tokeni — ikkalasiga ham ruxsat.

## Standartda nima deyilgan

| Hujjat | Bo'lim | Gap |
| --- | --- | --- |
| RFC 9110 | 11.3 | `401` — kamida bitta chaqiruv bilan `WWW-Authenticate`; `407` — `Proxy-Authenticate`. Ko'p mijoz noma'lum sxemali chaqiruvni o'qiy olmaydi — keng qo'llanadigan sxemani (`basic`) birinchi yozish tavsiya etiladi |
| RFC 9110 | 11.5 | Himoya sohasi (`realm`) |
| RFC 9110 | 11.6.1, 11.6.2 | `WWW-Authenticate`, `Authorization` |
| RFC 9110 | 15.5.2 | `401` da `WWW-Authenticate` yuborish **shart** |
| RFC 7617 (2015-yil sentabr) | 2 | Basic: `login:parol` base64; loginda `:` bo'lishi mumkin emas |
| RFC 6750 (2012-yil oktabr) | 1.2, 2.1, 2.3, 3.1 | Bearer token ta'rifi; header — shart; URL'da — tavsiya etilmaydi; xato kodlari |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Basic'ni HTTP orqali | Parol ochiq matnda ketadi (`base64 -d` bilan o'qildi) | Faqat HTTPS |
| "Base64 — shifrlash" | Qaytariladigan kodlash | Shifrlash — TLS (25-bob) |
| `auth_basic` bilan bir `location` da `return` | `return` rewrite bosqichida, tekshiruvdan oldin ishlaydi — himoya chetlab o'tiladi (sinovda xato parol bilan `200`) | Fayl yoki `proxy_pass` bilan kontent |
| Tokenni URL'da (`?access_token=`) | Jurnallarga tushadi (RFC 6750) | `Authorization: Bearer` |
| Yaroqsiz tokenga `403` | Token muammosi — `401` + `invalid_token`; `403` — huquq yetmaganda | RFC 6750 jadvali |
| `401` ni `WWW-Authenticate` siz | RFC 9110 talabi buziladi, mijoz qanday kelishni bilmaydi | Har doim chaqiruv bilan |
| Bearer tokenni uzoq muddatli qilish | Egasi bo'lgan har kim ishlatadi | Qisqa muddat, yangilash tokeni (15-bob) |
| Parollarni ochiq holda faylda saqlash | Fayl o'qilsa — hammasi oshkor | Xesh (`openssl passwd -apr1`, yaxshisi zamonaviy algoritmlar, 17-bob) |

## Amaliyot

1. Chaqiruv-javob mexanizmidagi uch qadamni ayting. Qaysi header'lar ishlatiladi?
2. `Authorization: Basic dXN1cjpwYXNz` — undagi login va parolni qanday topish mumkin? Bu nimani anglatadi?
3. Bearer token nima va nega uni "kalitning o'zi" deyish mumkin?
4. Yaroqsiz token, huquqi yetmaydigan token va tokensiz so'rov uchun qaysi kod va `error` qaytariladi?
5. Sinovda nginx'dagi birinchi sozlama nega himoya qilmadi?
6. Nega Basic CSRF'ga ayniqsa zaif?

<details>
<summary>Javoblar</summary>

1. Server `401` + `WWW-Authenticate`; mijoz `Authorization` bilan qayta so'raydi; brauzer foydalanuvchidan ma'lumot so'raydi.
2. `base64 -d`: `user:pass`. Basic shifrlamaydi — faqat HTTPS bilan ishlatish kerak.
3. Egasi bo'lgan har kim ishlata oladigan token; qo'shimcha isbot talab qilinmaydi (RFC 6750, 1.2).
4. Yaroqsiz — `401`, `invalid_token`; huquq yetmaydi — `403`, `insufficient_scope`; tokensiz — `401`, xato kodisiz.
5. `return` rewrite bosqichida ishlab, javobni access bosqichigacha (`auth_basic`) yuborib yubordi.
6. Brauzer Basic ma'lumotlarini qaysi saytdan bo'lishidan qat'i nazar har so'rovga qo'shadi (MDN).

</details>

## Rasmiy hujjat

- [MDN: HTTP authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication)
- [RFC 9110 §11: HTTP Authentication](https://www.rfc-editor.org/rfc/rfc9110#name-http-authentication)
- [RFC 7617: The 'Basic' HTTP Authentication Scheme](https://www.rfc-editor.org/rfc/rfc7617)
- [RFC 6750: OAuth 2.0 Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750)
- [IANA: HTTP Authentication Schemes](https://www.iana.org/assignments/http-authschemes)
- [nginx: ngx_http_auth_basic_module](https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html) · [Development guide: phases](https://nginx.org/en/docs/dev/development_guide.html#http_phases)
- [curl qo'llanmasi: `-u`, `--oauth2-bearer`](https://curl.se/docs/manpage.html)
