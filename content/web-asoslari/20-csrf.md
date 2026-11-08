# 20 — CSRF

[Mundarija](README.md)

## Tushuncha

MDN (CSRF): sayt foydalanuvchi nomidan maxsus amallarni (xarid, sozlamani o'zgartirish, pul o'tkazish) brauzerdan kelgan HTTP so'rovi bo'yicha bajaradi. So'rov haqiqatan o'sha foydalanuvchidan ekanini server odatda **cookie**'dagi sessiya bo'yicha tekshiradi (15-bob). Bunday so'rovni MDN **holatni o'zgartiruvchi so'rov** (state-changing request) deydi.

**CSRF** (Cross-Site Request Forgery — saytlararo so'rovni soxtalashtirish): boshqa saytdagi sahifa brauzerni foydalanuvchi bilmagan holda **shu saytga** holatni o'zgartiruvchi so'rov yuborishga majburlaydi. Brauzer so'rovga foydalanuvchining haqiqiy cookie'sini qo'shsa, server uni foydalanuvchining o'zi deb qabul qiladi.

Nega bu mumkin — oldingi boblardan:

- boshqa origin'ga **yozish ruxsat**: forma yuborish (18-bob);
- forma — **oddiy so'rov**, CORS preflight'siz serverga yetadi (19-bob);
- cookie boshqa saytdan kelgan so'rovda ham yuborilishi mumkin (`SameSite`, 14-bob).

MDN: sayt CSRF'ga zaif bo'ladi, agar:

- HTTP so'rovlari bilan server holatini o'zgartirsa;
- so'rov kimdan ekanini **faqat cookie** bilan tekshirsa;
- so'rovdagi parametrlarning hammasini begona tomon **oldindan bila olsa**.

Agar amal `GET` bilan bajarilsa, forma ham kerak emas — oddiy `<img src="…">` yetadi (MDN). Shuning uchun holat **`GET` bilan o'zgartirilmaydi** (7-bob: `GET` xavfsiz metod bo'lishi kerak).

### Himoyalar

MDN uch asosiy himoya va bitta qo'shimcha qatlamni beradi:

| Himoya | Qanday ishlaydi |
| --- | --- |
| **CSRF token** | Server sahifaga taxmin qilib bo'lmaydigan qiymat joylaydi (formada yashirin maydon, `fetch()` da header). So'rovda token mos kelmasa — rad. Begona sayt tokenni bilmaydi va (same-origin tufayli) sahifamizdan o'qiy olmaydi. Ko'p framework'larda tayyor (masalan, Django `csrf_token`) |
| **Fetch metadata** | Brauzer so'rovga **`Sec-Fetch-Site`** header'ini qo'shadi: `same-origin`, `same-site`, `cross-site` yoki `none` (foydalanuvchi o'zi manzil kiritgan, xatcho'pdan ochgan). Server `cross-site` dan kelgan holat o'zgartiruvchi so'rovni rad etadi |
| **Oddiy so'rovdan qochish** | `fetch()` bilan ishlaydigan ilovada holat o'zgartiruvchi so'rovlar **oddiy bo'lmasin**: `Content-Type: application/json` yoki maxsus header. Bunday so'rov boshqa origin'dan preflight'siz ketmaydi. Lekin server CORS bilan o'sha origin'ga `Access-Control-Allow-Origin` va `Access-Control-Allow-Credentials` bersa — himoya yo'qoladi |
| **`SameSite` cookie** (qo'shimcha qatlam) | `Strict` — cookie boshqa saytdan kelgan **hech qanday** so'rovda yuborilmaydi; `Lax` — faqat yuqori darajadagi o'tishda **va** xavfsiz metodda (`GET`). `POST` forma bilan `Lax` cookie ketmaydi |

`SameSite` cheklovlari (MDN): `Lax` bilan `GET` orqali amal bajarilsa — himoya yo'q; ba'zi framework'lardagi "method override" (`GET` ni `POST` deb ko'rsatish) uni chetlab o'tadi; `SameSite` **sayt** bo'yicha ishlaydi, origin bo'yicha emas — `foo.example.org` va `bar.example.org` bir sayt. Shuning uchun `SameSite` — **yagona** himoya emas.

MDN nazorat ro'yxati:

- Saytda sessiya cookie'si bilan tekshiriladigan holat o'zgartiruvchi so'rovlar qayerda ekanini bilish.
- Kamida bitta asosiy himoya: formalar — framework'ning CSRF tokeni; `fetch()` — oddiy bo'lmagan so'rovlar; har ikkalasida — Fetch metadata bilan `cross-site` ni rad etish.
- Holatni `GET` bilan o'zgartirmaslik.
- Sessiya cookie'si — `SameSite=Strict`, iloji bo'lmasa `Lax`.

## Ko'rib chiqamiz

Namuna server: **A** (`http://localhost:8101`) — bizning sayt; **B** (`http://127.0.0.1:8101`) — boshqa sayt. Har himoyani alohida ko'rish uchun:

- `sid_none` — `SameSite=None` cookie: boshqa saytdan kelgan so'rovda ham **keladi** (eng yomon holat). `/tokenli` va `/metadata` shunga tayanadi — demak ularni faqat token yoki `Sec-Fetch-Site` himoya qiladi.
- `sid_lax` — `SameSite=Lax` cookie: `/lax` faqat shunga tayanadi, boshqa himoyasiz.

Namuna — mexanizmni ko'rish uchun; real loyihada token va sessiyani framework boshqaradi.

```python
import hmac, secrets, sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs

SESSIYA = {'sid': 'ali', 'token': secrets.token_urlsafe(32)}   # namuna: bitta kirgan foydalanuvchi


class Ishlovchi(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def cookie(self, nom):
        for q in (self.headers.get('Cookie') or '').split(';'):
            k, _, v = q.strip().partition('=')
            if k == nom:
                return v
        return None

    def javob(self, kod, matn, **h):
        tana = matn.encode()
        self.send_response(kod)
        for k, v in h.items():
            self.send_header(k.replace('_', '-'), v)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(tana)))
        self.end_headers()
        self.wfile.write(tana)

    def do_GET(self):
        if self.path == '/kirish':                 # ikki xil cookie: taqqoslash uchun
            self.send_response(200)
            self.send_header('Set-Cookie', 'sid_none=sid; SameSite=None; Secure; HttpOnly; Path=/')
            self.send_header('Set-Cookie', 'sid_lax=sid; SameSite=Lax; HttpOnly; Path=/')
            self.send_header('Content-Length', '0')
            return self.end_headers()
        if self.path == '/sozlama':                # o'z sahifamiz: forma ichida CSRF token
            return self.javob(200, f'''<form method="POST" action="/tokenli">
<input type="hidden" name="csrf" value="{SESSIYA['token']}">
<input name="ism" value="Ali Valiyev"><button>Saqlash</button></form>''')
        self.javob(200, '<!doctype html><title>sahifa</title>')

    def do_POST(self):
        forma = parse_qs(self.rfile.read(int(self.headers.get('Content-Length', 0))).decode())
        sfs = self.headers.get('Sec-Fetch-Site')
        if self.path == '/lax':                    # faqat SameSite=Lax cookie'ga tayanadi
            sid = self.cookie('sid_lax')
            qaror = (401, 'sessiya yo\'q') if sid != 'sid' else (200, 'bajarildi')
        else:                                      # cookie doim keladi (SameSite=None) — himoya boshqa
            if self.cookie('sid_none') != 'sid':
                qaror = (401, 'sessiya yo\'q')
            elif self.path == '/tokenli':
                ok = hmac.compare_digest(forma.get('csrf', [''])[0], SESSIYA['token'])
                qaror = (200, 'bajarildi') if ok else (403, 'CSRF token yo\'q yoki xato')
            elif self.path == '/metadata':
                ok = sfs in ('same-origin', 'same-site', 'none')
                qaror = (200, 'bajarildi') if ok else (403, f'Sec-Fetch-Site={sfs} — rad etildi')
            else:
                qaror = (404, 'topilmadi')
        print(f'POST {self.path:10} Sec-Fetch-Site={sfs:12} sid_none={self.cookie("sid_none")} '
              f'sid_lax={self.cookie("sid_lax")} csrf={"bor" if forma.get("csrf") else "yoq"} -> {qaror[0]} {qaror[1]}', flush=True)
        self.javob(*qaror)

    def log_message(self, *a):
        pass


ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1])), Ishlovchi).serve_forever()
```

Chromium 158: foydalanuvchi A saytga kirgan (`/kirish`), keyin A'dagi o'z formasidan foydalanadi; so'ngra B saytdagi sahifadan A'ga uch xil forma `POST` yuboriladi:

```js
import { chromium } from '/Users/mfsv/Projects/dev-docs/node_modules/playwright-core/index.mjs'
const A = 'http://localhost:8101', B = 'http://127.0.0.1:8101'
const b = await chromium.launch(); const p = await b.newPage()
await p.goto(A + '/kirish')
// 1) o'z sahifamizdagi forma (token bilan)
await p.goto(A + '/sozlama'); await Promise.all([p.waitForNavigation(), p.click('button')])
console.log('1 A sahifasidagi forma ->', await p.textContent('body'))
// 2-4) boshqa saytdagi sahifadan A'ga forma POST (tokensiz)
for (const yol of ['/tokenli', '/metadata', '/lax']) {
  await p.goto(B + '/')
  await p.evaluate(([A, yol]) => {
    const f = document.createElement('form'); f.method = 'POST'; f.action = A + yol
    const i = document.createElement('input'); i.name = 'ism'; i.value = 'boshqa'; f.append(i)
    document.body.append(f); f.submit()
  }, [A, yol])
  await p.waitForURL(A + yol)
  console.log(`B sahifasidan forma ${yol} ->`, await p.textContent('body'))
}
console.log('chromium', b.version())
await b.close()
```

```text tashqi
1 A sahifasidagi forma -> bajarildi
B sahifasidan forma /tokenli -> CSRF token yo'q yoki xato
B sahifasidan forma /metadata -> Sec-Fetch-Site=cross-site — rad etildi
B sahifasidan forma /lax -> sessiya yo'q
```

Server jurnali:

```text tashqi
POST /tokenli   Sec-Fetch-Site=same-origin  sid_none=sid sid_lax=sid csrf=bor -> 200 bajarildi
POST /tokenli   Sec-Fetch-Site=cross-site   sid_none=sid sid_lax=None csrf=yoq -> 403 CSRF token yo'q yoki xato
POST /metadata  Sec-Fetch-Site=cross-site   sid_none=sid sid_lax=None csrf=yoq -> 403 Sec-Fetch-Site=cross-site — rad etildi
POST /lax       Sec-Fetch-Site=cross-site   sid_none=sid sid_lax=None csrf=yoq -> 401 sessiya yo'q
```

| So'rov | Cookie keldimi | Nima to'xtatdi |
| --- | --- | --- |
| A'ning o'z formasi | Ikkalasi ham | — : `Sec-Fetch-Site=same-origin`, token bor → bajarildi |
| B → `/tokenli` | `sid_none` **keldi** | **CSRF token** yo'q — `403` |
| B → `/metadata` | `sid_none` **keldi** | Brauzer qo'ygan **`Sec-Fetch-Site=cross-site`** — `403` |
| B → `/lax` | `sid_lax` **kelmadi** | **`SameSite=Lax`**: boshqa saytdan `POST` bilan cookie yuborilmadi — server foydalanuvchini tanimadi (`401`) |

Ko'ring: `/tokenli` va `/metadata` ga cookie **kelgan** — cookie'ga tayanib so'rovni qabul qilish xato bo'lardi. Ularni faqat qo'shimcha tekshiruv saqladi.

## Standartda nima deyilgan

| Hujjat | Nima |
| --- | --- |
| MDN CSRF | Hujum sharti, uch asosiy himoya, `SameSite` cheklovlari, nazorat ro'yxati |
| W3C Fetch Metadata Request Headers | `Sec-Fetch-Site`, `Sec-Fetch-Mode`, `Sec-Fetch-Dest` — brauzer qo'yadi. Fetch Standard: `Sec-` bilan boshlanadigan header — **taqiqlangan** (forbidden request-header), sahifa skripti uni qo'ya yoki o'zgartira olmaydi |
| RFC 6265bis (qoralama) | `SameSite` (14-bob) |
| OWASP CSRF Prevention Cheat Sheet | Token naqshlari, framework himoyalari |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Faqat cookie bilan tekshirish | Boshqa saytdan kelgan so'rovda ham cookie bo'lishi mumkin (jurnalda `sid_none=sid`) | Token yoki Fetch metadata |
| Holatni `GET` bilan o'zgartirish (`/ochir?id=5`) | `<img>` bilan ham yuboriladi; `Lax` cookie `GET` o'tishda ketadi | `POST`/`DELETE` + himoya |
| "CORS bor — CSRF bo'lmaydi" | Forma — oddiy so'rov, CORS'siz yetadi (19-bob) | CSRF himoyasi alohida |
| Faqat `SameSite=Lax` ga tayanish | `GET` amallar, method override, bir saytdagi boshqa subdomenlar (MDN) | Asosiy himoya + `SameSite` qo'shimcha |
| Tokenni hamma foydalanuvchiga bitta qilish yoki taxmin qilinadigan | Begona tomon uni bilib oladi | Sessiyaga bog'langan tasodifiy token (`secrets`) |
| CSRF tokenni URL'da (`?csrf=…`) | URL jurnallarga va havolalarga tushadi | Yashirin maydon yoki header |
| JSON API'ga credentials bilan har qanday origin'ga CORS berish | Oddiy bo'lmagan so'rov himoyasi yo'qoladi (MDN) | CORS faqat ishonchli origin'larga |
| O'z himoyasini yozish | Xatoga moyil | Framework'ning CSRF himoyasi |

## Amaliyot

1. CSRF qanday holatda mumkin bo'ladi (MDN'ning uch sharti)?
2. Nega same-origin siyosati va CORS CSRF'ni to'xtatmaydi?
3. CSRF token qanday ishlaydi va nega begona sayt uni yubora olmaydi?
4. `Sec-Fetch-Site` qanday qiymatlar oladi? Qaysi birini rad etish kerak?
5. Sinovda `/lax` ga so'rov nega `401` oldi?
6. Nega `SameSite` yagona himoya bo'la olmaydi?

<details>
<summary>Javoblar</summary>

1. Server so'rov bilan holatni o'zgartiradi; kimligini faqat cookie bilan tekshiradi; so'rov parametrlarini begona tomon oldindan bila oladi.
2. Ular javobni o'qishni boshqaradi, so'rov yuborishni emas: forma `POST` serverga yetadi.
3. Server sahifaga tasodifiy token joylaydi va so'rovda uni kutadi. Begona sayt tokenni taxmin qila olmaydi, sahifamizni esa same-origin tufayli o'qiy olmaydi.
4. `same-origin`, `same-site`, `cross-site`, `none`. Holat o'zgartiruvchi so'rovlarda — `cross-site`.
5. `sid_lax` (`SameSite=Lax`) cookie boshqa saytdan kelgan `POST` bilan yuborilmadi — server sessiyani topmadi.
6. U sayt bo'yicha ishlaydi (subdomenlar bir sayt), `Lax` `GET` o'tishlarda cookie yuboradi, method override bilan chetlab o'tilishi mumkin (MDN).

</details>

## Rasmiy hujjat

- [MDN: Cross-site request forgery (CSRF)](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF)
- [MDN: Sec-Fetch-Site](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Site) · [Fetch metadata](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Fetch_metadata)
- [W3C: Fetch Metadata Request Headers](https://www.w3.org/TR/fetch-metadata/)
- [OWASP: Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
