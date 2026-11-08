# 15 — Sessiya

[Mundarija](README.md)

## Tushuncha

MDN (Session management): HTTP holatsiz — ketma-ket so'rovlarni bir-biriga bog'laydigan ichki mexanizm yo'q. Saytga esa ularni **bitta sessiya** sifatida ko'rish kerak: tanlangan mavzu, savatcha, ayniqsa — **kim kirgani**. Kirgan foydalanuvchining shaxsi hujumchi uchun eng qimmatli holat, shuning uchun sessiyani juda ehtiyotkorlik bilan qurish kerak.

### Markazlashgan sessiya

Eng keng tarqalgan model (MDN) — **markazlashgan** (centralized): sessiya holati **serverda**.

1. Foydalanuvchi kirganda server holatni yozadi va unga **sessiya identifikatori** (session ID) yaratadi. Identifikator nusxasi mijozga beriladi (odatda cookie'da, 14-bob).
2. Keyingi so'rovlarda mijoz identifikatorni yuboradi; server u bo'yicha holatni topadi va foydalanuvchi nima qila olishini hal qiladi.

```text
brauzer                              server
  │  POST /kirish (login, parol)  ──►  tekshiradi, SESSIYALAR[ID] = {kim: ali}
  │  ◄── Set-Cookie: sid=ID; HttpOnly; …
  │  GET /profil, Cookie: sid=ID  ──►  SESSIYALAR[ID] → ali
```

Cookie'da faqat **ma'nosiz kalit**; foydalanuvchi ma'lumoti serverda.

### Hujumlar

Hujumchining maqsadi (MDN): saytning kirish tizimini buzmasdan, boshqa foydalanuvchi **nomidan** ish ko'rish.

| Hujum | Qanday | Himoya (MDN) |
| --- | --- | --- |
| **Sessiyani o'g'irlash** (session hijacking) — yo'lda tutib olish | ID mijoz va server orasida o'qib olinadi (MITM, 28-bob) | TLS (HTTPS) va `Secure` |
| — taxmin qilish | ID ni topish, taxmin qilish yoki ko'p urinish bilan topish | Uzun va tasodifiy ID |
| — mijozga hujum | Saytda begona skript (XSS, 21-bob) ID ni o'qib, jo'natadi | XSS'ga qarshi choralar; ID — `HttpOnly` cookie'da |
| **Sessiyani biriktirish** (session fixation) | Hujumchi ID ni **o'zi o'ylab topadi** va saytni foydalanuvchi uchun shu ID dan foydalanishga majburlaydi (masalan, URL parametri orqali). Foydalanuvchi kirgach, hujumchi ham shu ID bilan kiradi | Har kirishda server **yangi ID** yaratadi, eskisini bekor qiladi. ID ni URL'da emas, cookie'da tashish |

### ID qanday bo'lishi kerak

MDN:

- **Yetarli tasodif** (entropy): OWASP — kamida 64 bit.
- **Ma'nosiz**: foydalanuvchi yoki hisob haqida hech qanday ma'lumot yo'q.
- Iloji bo'lsa, ishonchli framework yoki kutubxona yaratsin.

### ID qayerda saqlanadi va qanday yuboriladi

MDN tavsiyasi — **cookie** (`localStorage` emas): `HttpOnly` bilan XSS bo'lsa ham skript ID ni o'qiy olmaydi. Lekin bu to'liq himoya emas — skript foydalanuvchi brauzeridan so'rov yuborishi mumkin, cookie u bilan birga ketadi.

| Atribut | Nega |
| --- | --- |
| `Secure` | Shifrlanmagan ulanishda yuborilmaydi |
| `HttpOnly` | JavaScript o'qimaydi |
| `SameSite=Lax` yoki `Strict` | Boshqa saytdan kelgan so'rovlarni cheklaydi — CSRF himoyasining **bir qismi** (20-bob) |
| `Domain`/`Path` | Iloji boricha tor; standart holatda — faqat o'rnatgan xostga |

### Sessiya muddati

MDN: uzun sessiya — hujumchiga ko'proq vaqt; tez-tez qayta kirish — foydalanuvchiga noqulay. `Expires`/`Max-Age` bo'lsa cookie brauzer qayta ochilganda ham qoladi; OWASP ularni **yozmaslikni** tavsiya qiladi (brauzer yopilganda unutilsin), lekin ko'p saytlar doimiy cookie ishlatadi.

OWASP'ning uch xil muddati (MDN):

| Muddat | Qachon tugaydi |
| --- | --- |
| **Faoliyatsizlik** (idle timeout) | Mijoz ma'lum vaqt so'rov yubormasa |
| **Mutlaq** (absolute timeout) | Faoliyatdan qat'i nazar, belgilangan vaqtdan keyin |
| **Yangilash** (renewal timeout) | Mutlaqdan qisqa; tugaganda server yangi ID beradi, eskisini bekor qiladi — foydalanuvchi qayta kirmaydi |

**Muhim:** muddat **serverda** hisoblanadi va sessiya serverda tugatiladi. Mijozdagi cookie'ni o'chirish — faqat qulaylik; xavfsizlik nuqtai nazaridan server holati hal qiladi.

Sessiyani bekor qilish kerak bo'lgan hodisalar: parol o'zgartirish yoki tiklash kabi xavfli amallar; ID o'g'irlangan degan shubha (masalan, yangi IP yoki qurilmadan kirish).

### Markazlashmagan sessiya (token)

MDN: muqobil model — holat **mijozda**, server **raqamli imzolagan** obyekt sifatida (odatda **JWT** — JSON Web Token). Server tokenni yaratadi, imzolaydi, mijozga beradi; mijoz uni har so'rovda ko'rsatadi, server imzoni tekshirib, ichidagi holatga qarab ishlaydi. Ko'p serverli tizimlarda qulay: resurs serveri token beruvchi bilan bog'lanmasdan tekshira oladi.

Kamchiliklari (MDN):

- Murakkabroq; kerak bo'lmasa — markazlashgan model yaxshi.
- Token katta (cookie 4 KB bilan cheklangan); boshqa ro'yxatdan o'tgan domenlarga cookie ketmaydi.
- **Imzo tekshiruvi** — asosiy xavf nuqtasi: imzosiz tokenni qabul qilgan kutubxonalar bo'lgan. Kutubxona imzoni **doim** tekshirishi shart.
- **Bekor qilish qiyin**: token o'zi yetarli. Yechim — qisqa muddatli **kirish tokeni** (access token) va uzun muddatli **yangilash tokeni** (refresh token); bekor qilish yangilash nuqtasida.

## Ko'rib chiqamiz

Markazlashgan modelning soddalashtirilgan namunasi (Python standart kutubxonasi). ID — `secrets.token_urlsafe(32)`: Python hujjati — `secrets` moduli tokenlar uchun, 32 bayt (256 bit) tasodif odatiy holatlar uchun yetarli deb hisoblanadi. Haqiqiy loyihada buni framework qiladi (MDN tavsiyasi), bu kod — mexanizmni ko'rish uchun.

```python
import secrets, sys, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs

FOYDALANUVCHILAR = {'ali': 'sir123'}      # namuna; haqiqiy tizimda parol xeshi saqlanadi (17-bob)
SESSIYALAR = {}                            # sessiya ID -> {"kim": ..., "oxirgi": ...}
FAOLIYATSIZLIK = 10                        # soniya; namunaviy qisqa "idle timeout"


class Ishlovchi(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def sid(self):
        for qism in (self.headers.get('Cookie') or '').split(';'):
            nom, _, qiymat = qism.strip().partition('=')
            if nom == 'sid':
                return qiymat
        return None

    def sessiya(self):
        s = SESSIYALAR.get(self.sid())
        if s and time.time() - s['oxirgi'] > FAOLIYATSIZLIK:
            del SESSIYALAR[self.sid()]
            print('muddati tugadi:', s['kim'], flush=True)
            return None
        if s:
            s['oxirgi'] = time.time()
        return s

    def javob(self, kod, matn, cookie=None):
        tana = (matn + '\n').encode()
        self.send_response(kod)
        if cookie:
            self.send_header('Set-Cookie', cookie)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.send_header('Content-Length', str(len(tana)))
        self.end_headers()
        self.wfile.write(tana)

    def do_GET(self):
        s = self.sessiya()
        self.javob(200, f"Salom, {s['kim']}!" if s else 'Salom, mehmon.')

    def do_POST(self):
        forma = parse_qs(self.rfile.read(int(self.headers.get('Content-Length', 0))).decode())
        if self.path == '/kirish':
            kim, parol = forma.get('kim', [''])[0], forma.get('parol', [''])[0]
            if FOYDALANUVCHILAR.get(kim) != parol:
                return self.javob(401, 'Login yoki parol xato.')
            SESSIYALAR.pop(self.sid(), None)            # eski ID — bekor
            yangi = secrets.token_urlsafe(32)           # 32 bayt tasodif
            SESSIYALAR[yangi] = {'kim': kim, 'oxirgi': time.time()}
            print('kirdi:', kim, '| sessiyalar:', len(SESSIYALAR), flush=True)
            return self.javob(200, 'Kirdingiz.', f'sid={yangi}; HttpOnly; SameSite=Lax; Path=/')
        if self.path == '/chiqish':
            SESSIYALAR.pop(self.sid(), None)            # serverda o'chirish — asosiysi shu
            print('chiqdi | sessiyalar:', len(SESSIYALAR), flush=True)
            return self.javob(200, 'Chiqdingiz.', 'sid=; Max-Age=0; Path=/')
        self.javob(404, 'topilmadi')

    def log_message(self, *a):
        pass


ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1])), Ishlovchi).serve_forever()
```

Namunada `Secure` yo'q, chunki sinov `http://` da; HTTPS saytda sessiya cookie'si `Secure` bilan bo'lishi shart (yuqoridagi jadval).

### Kirish

VPS'da (`127.0.0.1:8096`), `curl` cookie fayli (`jar`) bilan:

```text vps
$ cd /tmp/k15 && curl -s -c jar http://127.0.0.1:8096/
Salom, mehmon.
$ cd /tmp/k15 && curl -s -b jar -c jar -w '%{http_code}\n' -d 'kim=ali&parol=xato' http://127.0.0.1:8096/kirish
Login yoki parol xato.
401
$ cd /tmp/k15 && curl -s -b jar -c jar -D - -d 'kim=ali&parol=sir123' http://127.0.0.1:8096/kirish | tr -d '\r' | grep -i '^HTTP\|^set-cookie\|kirdingiz' | sed -E 's/sid=[A-Za-z0-9_-]{6}[A-Za-z0-9_-]*/sid=…(yashirildi)/'
HTTP/1.1 200 OK
Set-Cookie: sid=…(yashirildi); HttpOnly; SameSite=Lax; Path=/
Kirdingiz.
$ cd /tmp/k15 && S1=$(awk '$6=="sid"{print $7}' jar); echo "ID uzunligi: ${#S1} belgi"; curl -s -b jar http://127.0.0.1:8096/
ID uzunligi: 43 belgi
Salom, ali!
```

- Noto'g'ri parol — `401` (8-bob), cookie berilmadi.
- To'g'ri parol — `Set-Cookie` (qiymat bobda yashirilgan). 32 bayt Base64 bilan — 43 belgi (hujjat: har bayt ~1,3 belgi).
- Keyingi so'rov — server cookie'dagi ID bo'yicha `ali` ni topdi.

### Qayta kirish — yangi ID

```text vps
$ cd /tmp/k15 && S1=$(awk '$6=="sid"{print $7}' jar); curl -s -b jar -c jar -o /dev/null -d 'kim=ali&parol=sir123' http://127.0.0.1:8096/kirish; S2=$(awk '$6=="sid"{print $7}' jar); [ "$S1" != "$S2" ] && echo "qayta kirish: ID yangilandi"; printf 'eski ID bilan: '; curl -s -b "sid=$S1" http://127.0.0.1:8096/; printf 'yangi ID bilan: '; curl -s -b "sid=$S2" http://127.0.0.1:8096/
qayta kirish: ID yangilandi
eski ID bilan: Salom, mehmon.
yangi ID bilan: Salom, ali!
```

Kirishda server avvalgi ID ni o'chirdi va yangisini berdi — oldindan ma'lum bo'lgan ID endi ishlamaydi. Sessiyani biriktirishga (fixation) qarshi asosiy himoya shu (MDN).

### Chiqish — serverda o'chirish

```text vps
$ cd /tmp/k15 && S2=$(awk '$6=="sid"{print $7}' jar); curl -s -b jar -c jar -d '' http://127.0.0.1:8096/chiqish; printf 'chiqishdan keyin eski cookie qiymati bilan: '; curl -s -b "sid=$S2" http://127.0.0.1:8096/
Chiqdingiz.
chiqishdan keyin eski cookie qiymati bilan: Salom, mehmon.
```

Brauzerga `Max-Age=0` yuborildi, lekin muhimi — server sessiyani **o'zi o'chirdi**: kimdadir cookie nusxasi qolgan bo'lsa ham, u endi ishlamaydi. Faqat cookie'ni o'chirib, serverda sessiyani qoldirish — xato.

### Faoliyatsizlik muddati

```text vps
$ cd /tmp/k15 && curl -s -b jar -c jar -o /dev/null -d 'kim=ali&parol=sir123' http://127.0.0.1:8096/kirish && curl -s -b jar http://127.0.0.1:8096/ && sleep 11 && printf '11 soniyadan keyin: ' && curl -s -b jar http://127.0.0.1:8096/
Salom, ali!
11 soniyadan keyin: Salom, mehmon.
$ printf 'tasodifiy ID: '; curl -s -b 'sid=AAAAAAAAAAAAAAAAAAAA' http://127.0.0.1:8096/
tasodifiy ID: Salom, mehmon.
```

- 10 soniya so'rov bo'lmadi — server sessiyani tugatdi (namunada ataylab qisqa).
- O'ylab topilgan ID — serverda yo'q, hech narsa bermaydi.

Server jurnali:

```text vps
$ cat /tmp/k15/server.log
kirdi: ali | sessiyalar: 1
kirdi: ali | sessiyalar: 1
chiqdi | sessiyalar: 0
kirdi: ali | sessiyalar: 1
muddati tugadi: ali
```

Ikkinchi kirishdan keyin ham sessiyalar soni `1` — eski sessiya qolmadi.

### Brauzerda

Xuddi shu server lokal kompyuterda, Chromium 158: sahifadan `fetch()` bilan kirish, keyin sahifani yangilash:

```text tashqi
[1] sahifa: Salom, mehmon.
[2] kirish: 200 Kirdingiz. | document.cookie: ""
[3] sahifa: Salom, ali!
[4] brauzer omborida: sid | uzunligi 43 | httpOnly true | sameSite Lax
```

Brauzer cookie'ni saqladi va keyingi so'rovda yubordi (sahifa `ali` ni ko'rsatdi), lekin JavaScript uni **ko'rmaydi**: `document.cookie` bo'sh.

## Standartda nima deyilgan

Sessiya boshqaruvi — protokol emas, **amaliyot**: alohida RFC yo'q. Bob tayanadiganlar:

| Manba | Nima |
| --- | --- |
| MDN Session management | Ikki model, hujumlar, nazorat ro'yxati (pastda) |
| OWASP Session Management Cheat Sheet | ID entropiyasi (≥ 64 bit), muddatlar, cookie atributlari |
| RFC 6265 (8.4) | Sessiya identifikatorlarini cookie'da saqlash xavflari |
| Python `secrets` hujjati | Tasodifiy token yaratish |

MDN nazorat ro'yxati:

- Imkon bo'lsa — markazlashgan model.
- ID — cookie'da: `Secure`, `HttpOnly`; CSRF himoyasi — `SameSite=Lax` (yaxshisi `Strict`) va boshqa usullar (fetch metadata, CSRF token).
- Muddat siyosati: faoliyatsizlik, mutlaq, yangilash.
- O'g'irlash belgilari bo'lganda sessiyani bekor qilish.
- Token modelida: imzoni to'g'ri tekshirish, qisqa kirish tokeni va yangilash tokeni.
- O'zingiz yozmasdan, ishonchli framework yoki kutubxonadan foydalanish.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Kirgandan keyin ID ni o'zgartirmaslik | Session fixation | Har kirishda yangi ID, eskisi bekor (sinovda eski ID — "mehmon") |
| Chiqishda faqat cookie'ni o'chirish | Nusxasi bor kishi sessiyadan foydalanishda davom etadi | Serverda sessiyani o'chirish |
| ID'da ma'lumot: `sid=ali-2026` yoki ketma-ket raqam | Taxmin qilish oson | `secrets.token_urlsafe(32)` kabi tasodifiy, ma'nosiz qiymat |
| ID ni `localStorage` da saqlash | XSS bo'lsa skript o'qiydi | `HttpOnly` cookie |
| ID ni URL'da yuborish (`?session=…`) | Havola orqali biriktirish oson (MDN misoli) | Cookie |
| Muddatni faqat cookie `Max-Age` bilan boshqarish | Mijoz cookie'ni qayta yubora oladi | Muddat serverda hisoblanadi |
| JWT kutubxonasida imzoni tekshirmaslik | Soxta token qabul qilinadi (MDN) | Imzo doim tekshirilsin; algoritm qat'iy belgilansin |
| Uzoq muddatli JWT, bekor qilish yo'li yo'q | O'g'irlangan token muddati tugaguncha ishlaydi | Qisqa kirish tokeni + yangilash tokeni |

## Amaliyot

1. Markazlashgan sessiyada nima serverda, nima mijozda saqlanadi?
2. Session hijacking va session fixation farqi nima?
3. Session fixation'ga qarshi asosiy himoya qaysi? Sinovda u qanday ko'rindi?
4. Nega sessiya ID'si `localStorage` da emas, `HttpOnly` cookie'da saqlanadi? Bu XSS'dan to'liq himoya qiladimi?
5. Faoliyatsizlik, mutlaq va yangilash muddatlari farqi nima?
6. Nega JWT sessiyani bekor qilish qiyin va bunga qanday yechim bor?

<details>
<summary>Javoblar</summary>

1. Serverda — sessiya holati (kim kirgan va h.k.); mijozda — faqat ma'nosiz ID (cookie'da).
2. Hijacking — hujumchi mavjud ID ni o'g'irlaydi yoki taxmin qiladi; fixation — hujumchi ID ni oldindan o'zi tanlab, foydalanuvchiga shuni ishlattiradi.
3. Har kirishda yangi ID yaratib, eskisini bekor qilish. Sinovda qayta kirgandan keyin eski ID bilan so'rov "mehmon" qaytardi.
4. `HttpOnly` cookie'ni JavaScript o'qiy olmaydi. To'liq emas: skript foydalanuvchi brauzeridan so'rov yuborishi mumkin, cookie u bilan ketadi.
5. Faoliyatsizlik — so'rov bo'lmagan vaqt; mutlaq — faoliyatdan qat'i nazar umumiy vaqt; yangilash — qisqa davr, tugaganda ID almashtiriladi, qayta kirish shart emas.
6. Token o'zi yetarli — server uni tekshirish uchun hech narsaga murojaat qilmaydi. Yechim: qisqa muddatli kirish tokeni va yangilash tokeni; bekor qilish — yangi kirish tokeni bermaslik.

</details>

## Rasmiy hujjat

- [MDN: Session management](https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/Session_management)
- [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [RFC 6265 §8.4: Session Identifiers](https://www.rfc-editor.org/rfc/rfc6265#section-8.4)
- [Python: secrets](https://docs.python.org/3/library/secrets.html)
