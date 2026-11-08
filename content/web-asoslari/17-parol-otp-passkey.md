# 17 — Parol, bir martalik kod va passkey

[Mundarija](README.md)

## Tushuncha

MDN (Authentication): **autentifikatsiya** — foydalanuvchi o'zi aytgan shaxs ekanini tasdiqlash. Kirgan foydalanuvchi pul sarflashi, shaxsiy ma'lumotni ko'rishi, boshqalar bilan uning nomidan muloqot qilishi mumkin — shuning uchun hisobga kirish hujumchilarning asosiy nishoni.

MDN ko'rib chiqadigan usullar:

| Usul | Qisqacha |
| --- | --- |
| **Parol** | Foydalanuvchi biladigan uzoq muddatli sir. Server uni saqlangan **o'zgartirilgan** ko'rinishi bilan solishtiradi |
| **Bir martalik kod** (OTP) | Faqat bitta kirish urinishi uchun kod: email/SMS bilan yuboriladi yoki qurilma o'zi hisoblaydi |
| **Federatsiyalangan shaxs** (federated identity) | Uchinchi tomon — **shaxs provayderi** (identity provider) foydalanuvchini tanib, saytga aytadi |
| **Passkey** | Saytda parol yoki kod kiritilmaydi; qurilmadagi kalit juftligi bilan **imzo** |

Ular birga ham ishlatiladi — **ko'p omilli autentifikatsiya** (multi-factor authentication, MFA): masalan, parol + OTP.

### Parol: hujumlar

MDN:

| Hujum | Nima |
| --- | --- |
| **Taxmin qilish** (guessing) | Ko'p parolni sinash; odatda eng keng tarqalgan parollar ro'yxati bilan |
| **Credential stuffing** | Boshqa saytdan oqib chiqqan login/parol juftlarini shu saytda sinash — foydalanuvchi parolni takrorlagan bo'lishi umidida |
| **Tutib olish** (interception) | Parolni yo'lda o'qish — masalan, kafedagi soxta Wi-Fi |
| **Baza o'g'irlanishi** (database compromise) | Serverga kirib, saqlangan yozuvlarni olish |
| **Fishing** (phishing) | Asl saytga o'xshash soxta sahifa — foydalanuvchi parolni o'zi beradi |

### Parol: himoyalar

| Himoya | Nimaga qarshi (MDN) |
| --- | --- |
| **Parol menejerlarini qo'llash** | Kuchli, takrorlanmaydigan parol; soxta sahifada avtomatik to'ldirmaydi — fishingga ham qisman |
| **Kuchli parol siyosati** | Taxmin va stuffing |
| **Faqat HTTPS** | Tutib olish (butun sayt HTTPS'da bo'lishi kerak) |
| **Xavfsiz saqlash** — xesh, tuz | Baza o'g'irlanishi |

**Forma** parol menejerlariga mos bo'lsin (MDN): ro'yxatdan o'tish va kirish uchun alohida `<form>`; `type="password"`; `autocomplete="username"`, `"new-password"` (yangi parol), `"current-password"` (joriy parol).

**Parol siyosati** (MDN): uzun maksimal uzunlik (kamida 64 belgi); har qanday Unicode belgi; "katta harf, raqam, belgi bo'lsin" kabi **majburiy turlar talab qilinmaydi** — ular kuchli parol-iboralarni chetlatadi va foydalanuvchilar ularga oldindan aytsa bo'ladigan tarzda amal qiladi. Qo'shimcha: keng tarqalgan va oqib chiqqan parollarni rad etish (masalan, Have I Been Pwned ro'yxati). Mijozdagi tekshiruv — faqat qulaylik; server baribir tekshiradi.

**Kirishda** (MDN): login topilmasa ham, parol xato bo'lsa ham — **bir xil xato xabari**. Aks holda hujumchi qaysi hisob borligini biladi. Parolni tiklashda ham — email bazada bormi-yo'qmi, bir xil javob.

### Parolni saqlash: xesh, tuz, qalampir

MDN:

- Parol **ochiq matnda saqlanmaydi**. Saqlanadigan narsa — **xesh**: bir tomonlama funksiya natijasi, undan asl qiymatni chiqarib bo'lmaydi. Kirishda kiritilgan parol ham xeshlanadi va xeshlar solishtiriladi.
- Hujumchi bazani olsa, keng tarqalgan parollarni xeshlab, solishtiradi. Shuning uchun parol uchun xesh funksiyalari **ataylab sekin**, ish hajmi sozlanadi.
- **Tayyor jadval** (rainbow table) — "parol → xesh" oldindan hisoblangan jadval. Unga qarshi — **tuz** (salt): har parolga **alohida tasodifiy** qiymat qo'shiladi; sir emas, xesh yonida saqlanadi. Bir xil parol — har xil xesh.
- **Qalampir** (pepper) — qo'shimcha: hamma parollar uchun bitta, **sir**, bazada emas, alohida joyda (masalan, apparat xavfsizlik modulida — HSM).
- Algoritm — standart. OWASP (ustuvorlik tartibida): **Argon2id**, **scrypt**, **bcrypt**, **PBKDF2**. Iloji bo'lsa — framework funksiyasi (masalan, Django standart holatda PBKDF2).

### Bir martalik kod (OTP)

MDN: OTP foydalanuvchi **biladigan** narsaga (parol) emas, **egalik qiladigan** narsaga (telefon, email, ilovadagi sir) asoslanadi. Ko'pincha 6 xonali — taxmin qilish ehtimoli milliondan bir; asosiy himoya — **vaqt**: kod qisqa muddat (ideal ≤ 5 daqiqa) va bir marta amal qiladi.

| Turi | Qanday | Zaif tomoni (MDN) |
| --- | --- | --- |
| **Email OTP** | Kod yoki bir martalik havola emailga yuboriladi | Xabar tutib olinishi mumkin |
| **SMS OTP** | Kod SMS'da | Eng zaifi: A5/X shifrining zaifliklari, SS7 marshrutlash xatolari, SIM almashtirish firibgarligi (SIM swap), raqam boshqa egaga o'tishi. MDN: **yolg'iz o'zi** kirish uchun ishlatilmasin — faqat ikkinchi omil yoki to'lovni tasdiqlash uchun |
| **TOTP** (vaqtga asoslangan) | Sayt kod yubormaydi: sayt va foydalanuvchining **autentifikator ilovasi** umumiy sir va joriy vaqtdan bir xil kodni **mustaqil** hisoblaydi | Tutib olinmaydi, lekin umumiy sir o'g'irlanishi mumkin |

Barcha OTP turlari **fishingga zaif** (MDN): soxta sahifa kodni ham so'raydi va darhol asl saytda ishlatadi.

**TOTP algoritmi** — RFC 6238, u HOTP (RFC 4226) ning kengaytmasi: kod odatda 6 xonali, 30 soniya amal qiladi; sirni ro'yxatdan o'tishda sayt yaratadi va `otpauth://totp/…?secret=…&issuer=…` URI'sini QR kod qilib ko'rsatadi. MDN: sir kamida 160 bit; amalga oshirish uchun ishonchli kutubxona (Python — `pyotp`, Node — `otpauth`).

### Passkey

MDN: passkey — **ochiq kalit kriptografiyasi** (public-key cryptography): ma'lum saytdagi hisobga bog'langan **kalit juftligi**.

- **Shaxsiy kalit** (private key) — qurilmadagi **autentifikator**da: tizimga o'rnatilgan (Touch ID, Windows Hello — *platform authenticator*) yoki ko'chma (USB kalit, YubiKey — *roaming authenticator*), yoki parol menejeri ilovasida.
- **Ochiq kalit** (public key) — sayt serverida.

Brauzer API'si — **WebAuthn** (Web Authentication API). Sayt WebAuthn'da **Relying Party** (RP) deyiladi.

| Bosqich | Nima bo'ladi (MDN) |
| --- | --- |
| Ro'yxatdan o'tish | Server tasodifiy **chaqiruv** (challenge) beradi → `navigator.credentials.create()` → autentifikator (kerak bo'lsa, barmoq izi bilan tasdiqlatib) kalit juftligini yaratadi, shaxsiy kalitni o'zida saqlaydi, ochiq kalitni qaytaradi → server chaqiruvni tekshirib, ochiq kalitni hisobga yozadi |
| Kirish | Server yangi chaqiruv beradi → `navigator.credentials.get()` → autentifikator chaqiruv va kontekstni (jumladan, **origin**) shaxsiy kalit bilan **imzolaydi** → server imzoni ochiq kalit bilan tekshiradi |

**Passkey doirasi** (scope, MDN): yaratilganda passkey'ga **RP ID** — sahifa origin'idagi domen yoziladi. Ishlatishda brauzer joriy origin domenini yuboradi; mos kelmasa — autentifikator kalitni bermaydi. RP ID faqat joriy domenning o'zi yoki uning ota domeni bo'lishi mumkin.

Nega xavfsizroq (MDN):

| Parol muammosi | Passkey'da |
| --- | --- |
| Taxmin qilish | Qiymatni foydalanuvchi o'ylab topmaydi — autentifikator yaratadi |
| Credential stuffing | Har sayt uchun alohida kalit |
| Baza o'g'irlanishi | Serverda sir yo'q — faqat ochiq kalit |
| Fishing | `examp1e.com` dagi sahifa `example.com` ning passkey'idan foydalana olmaydi |

Yo'qotish xavfi: autentifikator yo'qolsa — undagi passkey'lar ham. MDN: bitta hisobga **bir nechta** passkey (masalan, telefonda va zaxira USB kalitda) yoki zaxiralashni qo'llaydigan autentifikator.

## Ko'rib chiqamiz

### Parolni xeshlash: tuz va sekinlik

Python standart kutubxonasidagi `hashlib.scrypt` (hujjat: RFC 7914 dagi scrypt; tuz `os.urandom()` dan, ~16 bayt yoki ko'proq). Parametrlar — OWASP'ning scrypt uchun minimal qiymatlari (`N=2^17`, `r=8`, `p=1`). Taqqoslash — `hmac.compare_digest` (hujjat: vaqt tahliliga qarshi — natija qancha belgi mos kelganiga qarab tezlashmaydi). Bu namuna; real loyihada framework funksiyasi.

```python
import hashlib, hmac, os, time

# OWASP: Argon2id bo'lmasa — scrypt, N=2**17, r=8, p=1
N, R, P = 2**17, 8, 1


def xeshla(parol, tuz=None):
    tuz = tuz or os.urandom(16)                       # har parolga yangi tasodifiy tuz
    xesh = hashlib.scrypt(parol.encode(), salt=tuz, n=N, r=R, p=P, maxmem=2**28)
    return tuz, xesh


def tekshir(parol, tuz, saqlangan):
    _, xesh = xeshla(parol, tuz)
    return hmac.compare_digest(xesh, saqlangan)       # vaqt bo'yicha bir xil taqqoslash


t0 = time.perf_counter()
tuz1, xesh1 = xeshla('Bahor-2026-olma')
sarf = time.perf_counter() - t0
tuz2, xesh2 = xeshla('Bahor-2026-olma')
print('1-foydalanuvchi:', tuz1.hex()[:16] + '…', xesh1.hex()[:24] + '…')
print('2-foydalanuvchi:', tuz2.hex()[:16] + '…', xesh2.hex()[:24] + '…')
print('bir xil parol, xeshlar teng?', xesh1 == xesh2)
print("to'g'ri parol:", tekshir('Bahor-2026-olma', tuz1, xesh1))
print('xato parol:   ', tekshir('bahor-2026-olma', tuz1, xesh1))
print(f'bitta xesh vaqti: {sarf:.2f} s')
t0 = time.perf_counter()
for _ in range(1000):
    hashlib.sha256(b'Bahor-2026-olma').digest()
print(f'1000 ta oddiy SHA-256: {time.perf_counter() - t0:.4f} s')
```

VPS'da (Python 3.14.4):

```text vps
$ python3 /tmp/k17/parol.py
1-foydalanuvchi: 522662ecfba1059c… faf93408f7477315f956ea08…
2-foydalanuvchi: 3b876f0a1c44cad3… 2be0580490983ead248b3f13…
bir xil parol, xeshlar teng? False
to'g'ri parol: True
xato parol:    False
bitta xesh vaqti: 0.94 s
1000 ta oddiy SHA-256: 0.0018 s
```

- Ikki foydalanuvchining paroli **bir xil**, lekin tuz har xil — xeshlar har xil. Tayyor jadval ishlamaydi.
- Bitta harf farq (`B` → `b`) — tekshiruv `False`.
- Bitta scrypt xeshi ~1 soniya; oddiy SHA-256 — **ming** marta 2 millisekundda. Hujumchi har parol uchun shuncha vaqt sarflashga majbur — "ataylab sekin" degani shu.

### TOTP: RFC 6238 test qiymatlari bilan

TOTP standart kutubxona bilan (`hmac`, `hashlib`) — algoritmni ko'rish uchun; real loyihada — kutubxona:

```python
import hashlib, hmac, struct


def hotp(kalit, hisob, raqamlar=6):
    """RFC 4226: HMAC-SHA1 va 'dynamic truncation'."""
    h = hmac.new(kalit, struct.pack('>Q', hisob), hashlib.sha1).digest()
    o = h[-1] & 0x0F
    son = struct.unpack('>I', h[o:o + 4])[0] & 0x7FFFFFFF
    return str(son % 10**raqamlar).zfill(raqamlar)


def totp(kalit, vaqt, qadam=30, raqamlar=6):
    """RFC 6238: hisob = vaqt // 30."""
    return hotp(kalit, int(vaqt) // qadam, raqamlar)


KALIT = b'12345678901234567890'      # RFC 6238, B ilova: sinov kaliti
RFC = {59: '94287082', 1111111109: '07081804', 1111111111: '14050471',
       1234567890: '89005924', 2000000000: '69279037', 20000000000: '65353130'}
for t, kutilgan in RFC.items():
    kod = totp(KALIT, t, raqamlar=8)
    print(f'{t:>11}  hisob={t // 30:<11} TOTP={kod}  RFC={kutilgan}  {"mos" if kod == kutilgan else "XATO"}')
print('6 xonali, t=59 va t=60:', totp(KALIT, 59), totp(KALIT, 60))
```

```text vps
$ python3 /tmp/k17/totp.py
         59  hisob=1           TOTP=94287082  RFC=94287082  mos
 1111111109  hisob=37037036    TOTP=07081804  RFC=07081804  mos
 1111111111  hisob=37037037    TOTP=14050471  RFC=14050471  mos
 1234567890  hisob=41152263    TOTP=89005924  RFC=89005924  mos
 2000000000  hisob=66666666    TOTP=69279037  RFC=69279037  mos
20000000000  hisob=666666666   TOTP=65353130  RFC=65353130  mos
6 xonali, t=59 va t=60: 287082 359152
```

- RFC 6238 (B ilova) dagi SHA1 test qiymatlarining hammasi mos — algoritm to'g'ri.
- **Hisob** (counter) = vaqt / 30: 30 soniya ichida bir xil, keyin yangi. `t=59` va `t=60` — boshqa 30 soniyalik oyna, boshqa kod.
- Kod sirsiz hisoblanmaydi: shuning uchun TOTP'da **sirni** himoyalash muhim (MDN).

### Passkey: fishingga chidamlilik

Chromium 158, Playwright va Chrome DevTools Protocol'dagi **virtual autentifikator** (haqiqiy qurilma o'rnida). Ikki origin: asl `http://kitob.localhost:8098` va unga o'xshatilgan soxta `http://kit0b.localhost:8098` (`o` o'rnida `0`). `*.localhost` — xavfsiz kontekst (W3C Secure Contexts: `.localhost` bilan tugaydigan xost "potentially trustworthy"), shuning uchun WebAuthn HTTP'da ham ishlaydi (23-bob).

```js
import { chromium } from '/Users/mfsv/Projects/dev-docs/node_modules/playwright-core/index.mjs'
const ASL = 'http://kitob.localhost:8098', SOXTA = 'http://kit0b.localhost:8098'   // 'o' va '0'
const b = await chromium.launch()
const p = await b.newPage()
const cdp = await p.context().newCDPSession(p)
await cdp.send('WebAuthn.enable')
const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: {
  protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true,
  isUserVerified: true, automaticPresenceSimulation: true } })

const yarat = () => p.evaluate(async () => {
  const c = await navigator.credentials.create({ publicKey: {
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    rp: { name: 'Kitob sayti', id: location.hostname },
    user: { id: new TextEncoder().encode('foydalanuvchi-42'), name: 'ali', displayName: 'Ali' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' } } })
  const d = JSON.parse(new TextDecoder().decode(c.response.clientDataJSON))
  return `create: turi=${c.type} | clientData.type=${d.type} | origin=${d.origin} | ochiq kalit ${c.response.getPublicKey().byteLength} bayt`
})
const kir = (rpId) => p.evaluate(async (rpId) => {
  try {
    const opt = { challenge: crypto.getRandomValues(new Uint8Array(32)), userVerification: 'preferred' }
    if (rpId) opt.rpId = rpId
    const a = await navigator.credentials.get({ publicKey: opt, signal: AbortSignal.timeout(3000) })
    const d = JSON.parse(new TextDecoder().decode(a.response.clientDataJSON))
    return `get: clientData.type=${d.type} | origin=${d.origin} | imzo ${a.response.signature.byteLength} bayt`
  } catch (e) { return `get${rpId ? ` (rpId=${rpId})` : ''}: ${e.name}` }
}, rpId)

await p.goto(ASL + '/')
console.log('[1]', ASL, '| isSecureContext:', await p.evaluate(() => isSecureContext))
console.log('[2]', await yarat())
const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId })
console.log('[3] autentifikatorda:', credentials.map(c => `rpId=${c.rpId}, resident=${c.isResidentCredential}`).join('; '))
console.log('[4]', await kir())
await p.goto(SOXTA + '/')
console.log('[5]', SOXTA, '|', await kir())
console.log('[6]', SOXTA, '|', await kir('kitob.localhost'))
console.log('chromium', b.version())
await b.close()
```

```text tashqi
[1] http://kitob.localhost:8098 | isSecureContext: true
[2] create: turi=public-key | clientData.type=webauthn.create | origin=http://kitob.localhost:8098 | ochiq kalit 91 bayt
[3] autentifikatorda: rpId=kitob.localhost, resident=true
[4] get: clientData.type=webauthn.get | origin=http://kitob.localhost:8098 | imzo 72 bayt
[5] http://kit0b.localhost:8098 | get: NotAllowedError
[6] http://kit0b.localhost:8098 | get (rpId=kitob.localhost): SecurityError
```

| Qadam | Natija |
| --- | --- |
| `[2]` | Kalit juftligi yaratildi; serverga faqat **ochiq kalit** (91 bayt) va `clientData` (unda `origin`) beriladi |
| `[3]` | Autentifikator passkey'ni `rpId=kitob.localhost` bilan saqladi |
| `[4]` | Asl saytda kirish: autentifikator chaqiruvni imzoladi (72 bayt). Server imzoni saqlangan ochiq kalit bilan tekshiradi va `origin` ni o'zi kutgan qiymat bilan solishtiradi |
| `[5]` | Soxta sayt passkey so'radi — **berilmadi** (`NotAllowedError`): uning domeni boshqa, mos passkey yo'q |
| `[6]` | Soxta sayt "men `kitob.localhost` man" deb `rpId` ni qo'lda yozdi — brauzer **rad etdi** (`SecurityError`): RP ID joriy domenning o'zi yoki ota domeni bo'lishi kerak |

Parol bilan bunday bo'lmaydi: foydalanuvchi `kit0b` ni sezmasa, parolni o'zi yozib beradi. Passkey'da tanlovni foydalanuvchi emas, **brauzer** domen bo'yicha qiladi.

(Namunada serverdagi imzo tekshiruvi ko'rsatilmagan — bu ishni WebAuthn server kutubxonasi qiladi.)

## Standartda nima deyilgan

| Hujjat | Gap |
| --- | --- |
| RFC 4226 (2005-yil dekabr) | HOTP: HMAC-SHA1 va hisob asosidagi kod |
| RFC 6238 (2011-yil may) | TOTP: hisob = vaqt / qadam (odatda 30 s); B ilovada test qiymatlari |
| RFC 7914 | scrypt |
| W3C Web Authentication (WebAuthn) | `create()`/`get()`, RP ID, imzolangan javob |
| W3C Secure Contexts | `localhost` va `*.localhost` — ishonchli deb hisoblanadi |
| OWASP Password Storage Cheat Sheet | Argon2id (m=19 MiB, t=2, p=1), bo'lmasa scrypt (N=2^17, r=8, p=1), bcrypt, PBKDF2 |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Parolni ochiq matnda yoki shifrlab saqlash | Baza o'g'irlansa — hammasi oshkor; shifrni ochish mumkin | Sekin xesh + tuz (Argon2id/scrypt/bcrypt/PBKDF2) |
| Oddiy SHA-256 bilan xeshlash | Juda tez — milliardlab urinish mumkin (sinovda 1000 ta 2 ms) | Parol uchun mo'ljallangan sekin algoritm |
| Hamma uchun bitta tuz yoki tuzsiz | Bir xil parol — bir xil xesh, tayyor jadval ishlaydi | Har parolga alohida tasodifiy tuz |
| "Bunday login yo'q" / "Parol xato" — alohida xabar | Hujumchi mavjud hisoblarni aniqlaydi | Bitta umumiy xabar |
| "Kamida bitta katta harf va belgi" | Oldindan aytsa bo'ladigan parollar, kuchli iboralar chetlatiladi | Uzunlik, oqib chiqqan parollar ro'yxati |
| Parolni 16 belgi bilan cheklash | Uzun iboralar va menejer parollari sig'maydi | Kamida 64 belgi |
| Faqat SMS kod bilan kirish | SIM swap, SS7 (MDN) | TOTP yoki passkey; SMS — ko'pi bilan ikkinchi omil |
| OTP'ni fishingdan himoya deb hisoblash | Soxta sahifa kodni ham so'raydi | Passkey |
| Hisobga bitta passkey | Qurilma yo'qolsa — kirish yo'q | Bir nechta passkey yoki zaxira |

## Amaliyot

1. Credential stuffing nima va unga qarshi qaysi himoyalar yordam beradi?
2. Nega parol xeshi ataylab sekin bo'lishi kerak? Tuz nimani hal qiladi?
3. Kirishda nega "login topilmadi" va "parol xato" uchun bir xil xabar beriladi?
4. TOTP'da sayt va ilova bir xil kodni qanday hisoblaydi? Nega kod har 30 soniyada o'zgaradi?
5. Nega SMS OTP eng zaif OTP turi?
6. Sinovda `kit0b.localhost` nega `kitob.localhost` ning passkey'idan foydalana olmadi?

<details>
<summary>Javoblar</summary>

1. Boshqa saytdan oqib chiqqan login/parollarni sinash. Parol menejerlari (har sayt uchun alohida parol), oqib chiqqan parollarni rad etish, MFA, passkey.
2. Bazani olgan hujumchi har parolni sinashga ko'p vaqt sarflasin. Tuz bir xil parollarni har xil xeshga aylantiradi va tayyor jadvallarni yaroqsiz qiladi.
3. Aks holda hujumchi qaysi hisoblar mavjudligini bilib oladi.
4. Umumiy sir va joriy vaqtdan: hisob = vaqt / 30, keyin HMAC. Hisob har 30 soniyada oshadi — kod o'zgaradi.
5. Shifrning zaifliklari, SS7 marshrutlash xatolari, SIM almashtirish, raqam boshqaga o'tishi (MDN).
6. Passkey `rpId=kitob.localhost` bilan saqlangan; boshqa domen uni so'raganda brauzer bermadi (`NotAllowedError`), `rpId` ni qo'lda yozish esa rad etildi (`SecurityError`).

</details>

## Rasmiy hujjat

- [MDN: Authentication](https://developer.mozilla.org/en-US/docs/Web/Security/Authentication)
- [MDN: Passwords](https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/Passwords)
- [MDN: One-time passwords](https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/OTP)
- [MDN: Passkeys](https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/Passkeys)
- [OWASP: Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [RFC 6238: TOTP](https://www.rfc-editor.org/rfc/rfc6238) · [RFC 4226: HOTP](https://www.rfc-editor.org/rfc/rfc4226)
- [W3C: Web Authentication](https://www.w3.org/TR/webauthn-3/) · [W3C: Secure Contexts](https://w3c.github.io/webappsec-secure-contexts/)
- [Python: hashlib.scrypt](https://docs.python.org/3/library/hashlib.html#hashlib.scrypt) · [hmac.compare_digest](https://docs.python.org/3/library/hmac.html#hmac.compare_digest)
- [Chrome DevTools Protocol: WebAuthn domain](https://chromedevtools.github.io/devtools-protocol/tot/WebAuthn/)
