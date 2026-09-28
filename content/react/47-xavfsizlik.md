# 47 — Xavfsizlik

[← Oldingi: Kod sifati](46-kod-sifati.md) · [Mundarija](README.md) · [Keyingi: Deploy va monitoring →](48-deploy-va-monitoring.md)

## Tushuncha

Birinchi qoida: **klientdagi hech narsa ishonchli emas.** Foydalanuvchi JS'ni o'zgartirishi, so'rovni qo'lda yuborishi, DevTools'da holatni tahrirlashi mumkin.

Frontend tomonidagi ish uchtaga qisqaradi:

1. **XSS'ga yo'l qo'ymaslik** (o'z kodingizdagi teshiklar);
2. **Sirlarni klientga chiqarmaslik**;
3. **Token va sessiyani to'g'ri saqlash** (39-bob).

Avtorizatsiya, validatsiya va biznes qoidalari — **har doim serverda**.

## Kod: XSS va `dangerouslySetInnerHTML`

React JSX ichidagi qiymatlarni **avtomatik ekranlaydi** — bu asosiy himoya:

```jsx
{/* Xavfsiz: HTML matn sifatida chiqadi */}
<p>{userComment}</p>
```

Xavf faqat siz uni ataylab o'chirsangiz paydo bo'ladi:

```jsx
{/* ✗ Foydalanuvchi mazmuni bilan — XSS */}
<div dangerouslySetInnerHTML={{ __html: userComment }} />
```

```js
// userComment = '<img src=x onerror="fetch(`/steal?c=${document.cookie}`)">'
```

Yechim — tozalash:

```bash
npm i dompurify
```

::: ts
```tsx
import DOMPurify from 'dompurify'

function RichText({ html }: { html: string }) {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'br'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      }),
    [html],
  )

  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```
:::

::: js
```jsx
import DOMPurify from 'dompurify'

function RichText({ html }) {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'br'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      }),
    [html],
  )

  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```
:::

Eng yaxshi yechim — **HTML ni umuman qabul qilmaslik**: markdown saqlang va uni xavfsiz render qiling, yoki tuzilgan ma'lumot (JSON) ishlating.

## Kod: boshqa in'ektsiya nuqtalari

```jsx
{/* ✗ javascript: sxemasi */}
<a href={userUrl}>Havola</a>
{/* userUrl = 'javascript:alert(document.cookie)' */}
```

::: ts
```tsx
function safeHref(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin)

    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.href : '#'
  } catch {
    return '#'
  }
}

<a href={safeHref(userUrl)} target="_blank" rel="noopener noreferrer">Havola</a>
```
:::

::: js
```jsx
function safeHref(url) {
  try {
    const parsed = new URL(url, window.location.origin)

    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.href : '#'
  } catch {
    return '#'
  }
}
```
:::

Boshqa xavfli joylar:

```jsx
<div style={userStyle} />                  {/* CSS in'ektsiyasi mumkin */}
<Component {...userProps} />               {/* nazoratsiz props */}
{React.createElement(userTag)}             {/* dinamik teg */}
<iframe src={userUrl} />                   {/* sandbox siz */}
```

Qoida: foydalanuvchi ma'lumoti **matn** sifatida ishlatilsin, kod yoki struktura sifatida emas.

## Kod: token va sessiya

39-bobdagi jadvalni qisqacha takrorlaymiz:

| Joy | XSS'da o'g'irlanadimi | Tavsiya |
| --- | --- | --- |
| `localStorage` | ✅ Ha | ❌ |
| Oddiy cookie | ✅ Ha | ❌ |
| **httpOnly cookie** | ❌ Yo'q | ✅ |
| **Xotira (JS o'zgaruvchisi)** | ❌ Saqlanmaydi | ✅ (refresh cookie bilan) |

```
access token  → xotirada
refresh token → httpOnly + Secure + SameSite=Lax cookie
```

CSRF himoyasi: `SameSite=Lax` ko'p hollarda yetarli; murakkab holatlarda (cross-site POST) CSRF token qo'shiladi.

## Kod: sirlarni chiqarmaslik

```js
// ✗ Build'da kodga matn sifatida yoziladi — har kim ko'radi (03-bob)
const stripeSecret = import.meta.env.VITE_STRIPE_SECRET_KEY
```

```js
// ✓ Klient faqat o'z backend'iga murojaat qiladi
const session = await api.post('/checkout/session', { items })
// Server tomonda: process.env.STRIPE_SECRET_KEY
```

CI'da tekshirish:

```bash
npm run build
grep -rE "(sk_live|secret|password|private_key)" dist/assets/*.js && exit 1 || true
```

## Kod: CSP (Content Security Policy)

```nginx
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://api.example.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
" always;
```

CSP — XSS'ga qarshi **ikkinchi mudofaa qatori**: hujumchi skript in'ektsiya qila olsa ham, brauzer uni bajarmaydi.

React bilan nozik joy: `style-src` uchun `unsafe-inline` ko'pincha kerak bo'ladi (inline `style` prop). Uni yo'q qilish uchun CSS Modules/Tailwind'ga to'liq o'tish kerak.

## Kod: bog'liqliklar

```bash
npm audit --omit=dev
npm outdated
```

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    open-pull-requests-limit: 5
```

`npm audit` ko'p false positive beradi (dev bog'liqliklardagi zaifliklar production'ga chiqmaydi) — `--omit=dev` bilan filtrlang.

Qo'shimcha xavf — **supply chain**: yangi paket qo'shishdan oldin muallifini, yuklab olishlar sonini, oxirgi relizni tekshiring.

## Kod: ruxsatlar — faqat interfeys

```jsx
{/* Bu — interfeys cheklovi, xavfsizlik EMAS */}
{user.roles.includes('admin') && <DeleteButton />}
```

Foydalanuvchi:

- DevTools'da holatni o'zgartirib tugmani ko'rsata oladi;
- To'g'ridan-to'g'ri `DELETE /api/users/1` so'rovini yuborishi mumkin.

Demak: har bir mutatsiya serverda tekshirilishi shart va **maxfiy ma'lumot klientga umuman yuborilmasligi** kerak.

## Kod: xato xabarlari

```jsx
// ✗ Ichki tuzilma oshkor bo'ladi
catch (error) {
  toast.error(error.stack)
}

// ✓ Foydalanuvchiga tushunarli, tafsilot monitoringga (48-bob)
catch (error) {
  reportError(error)
  toast.error(getErrorMessage(error).title)
}
```

Serverdan keladigan xabarlarni ham nazorat qiling: "SQLSTATE[23000]: Duplicate entry 'ali@mail.uz'..." — bu foydalanuvchiga ko'rsatiladigan matn emas.

## Muhandislik nuqtai nazari: tekshiruv ro'yxati

- [ ] `dangerouslySetInnerHTML` faqat tozalangan mazmun bilan
- [ ] Foydalanuvchi URL'lari protokoli tekshiriladi
- [ ] Token `httpOnly` cookie'da yoki xotirada
- [ ] Sirlar `VITE_` bilan berilmagan
- [ ] CSP sarlavhasi sozlangan
- [ ] Tashqi havolalarda `rel="noopener noreferrer"`
- [ ] Barcha mutatsiyalar serverda avtorizatsiyadan o'tadi
- [ ] Fayl yuklashda tur va hajm serverda tekshiriladi
- [ ] Xato xabarlari ichki tafsilotni oshkor qilmaydi
- [ ] `npm audit` CI'da ishlaydi
- [ ] HTTPS majburiy (HSTS)
- [ ] Kirish formasida rate limiting (serverda)

## Muhandislik nuqtai nazari: klient validatsiyasi nima uchun

Agar hamma narsa serverda tekshirilsa, klient validatsiyasi nega kerak? **UX uchun, xavfsizlik uchun emas** (38-bob).

```
Klient: tez javob, yaxshi tajriba
Server: autentifikatsiya, avtorizatsiya, validatsiya, rate limiting
```

Bu ikkisini chalkashtirish — eng keng tarqalgan xavfsizlik xatosi.

## Muhandislik nuqtai nazari: uchinchi tomon skriptlari

Analitika, chat vidjeti, reklama — ular sizning sahifangizda **to'liq huquq bilan** ishlaydi:

| Xavf | Yumshatish |
| --- | --- |
| Skript o'zgartirilsa (supply chain) | `integrity` (SRI) atributi |
| Ma'lumot yig'ish | CSP `connect-src`, faqat kerakli skriptlar |
| Unumdorlik | `async`/`defer`, lazy yuklash |
| Cookie o'qish | `httpOnly` (JS o'qiy olmaydi) |

```html
<script
  src="https://cdn.example.com/widget.js"
  integrity="sha384-..."
  crossorigin="anonymous"
  defer
></script>
```

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `dangerouslySetInnerHTML` ga foydalanuvchi mazmuni | XSS | DOMPurify yoki markdown |
| Token `localStorage` da | XSS'da o'g'irlanadi | httpOnly cookie |
| API kaliti `VITE_` bilan | Bundle'da ochiq | Server proksi |
| Faqat klient validatsiyasi | Chetlab o'tiladi | Serverda ham |
| `target="_blank"` `rel` siz | Tabnabbing | `rel="noopener noreferrer"` |
| Xato stack'ini ko'rsatish | Ichki tuzilma oshkor | Umumiy xabar |
| CSP yo'q | XSS'ga ikkinchi to'siq yo'q | CSP sarlavhasi |
| Foydalanuvchi URL'ini tekshirmaslik | `javascript:` in'ektsiyasi | Protokol tekshiruvi |

## Amaliyot

1. `dangerouslySetInnerHTML` bilan XSS'ni o'z loyihangizda ko'rsating (`<img src=x onerror=alert(1)>`), keyin DOMPurify bilan to'sing.
2. `safeHref` ni yozing va `javascript:` URL bilan sinang.
3. `npm run build` dan keyin `grep` bilan bundle ichida sir qidiring va bu tekshiruvni CI'ga qo'shing.
4. CSP sarlavhasini qo'shing (dev'da `<meta http-equiv>` bilan sinash mumkin) va nima buzilishini kuzating.
5. Tokenni `localStorage` dan httpOnly cookie'ga ko'chirish rejasini yozing (39-bob).
6. Admin tugmasini DevTools orqali ko'rsating va serverga so'rov yuborib, u rad etishini tasdiqlang.

## Rasmiy hujjat

- React xavfsizligi: <https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html>
- OWASP Top 10: <https://owasp.org/www-project-top-ten/>
- CSP: <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>
- DOMPurify: <https://github.com/cure53/DOMPurify>
