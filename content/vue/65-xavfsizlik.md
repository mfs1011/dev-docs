# 65 — Xavfsizlik

[← Oldingi: Erishimlilik](64-erishimlilik.md) · [Mundarija](README.md) · [Keyingi: Ko'p tillilik (i18n) →](66-i18n.md)

## Tushuncha

Frontend xavfsizligining birinchi qoidasi: **klientdagi hech narsa ishonchli emas.** Foydalanuvchi JS'ni o'zgartirishi, so'rovni qo'lda yuborishi, DevTools'da holatni tahrirlashi mumkin.

Demak, klient tomonda qilinadigan ish uchta narsaga qisqaradi:

1. **XSS'ga yo'l qo'ymaslik** (o'z kodingizdagi teshiklar);
2. **Sirlarni klientga chiqarmaslik**;
3. **Token va sessiyani to'g'ri saqlash**.

Avtorizatsiya, ma'lumot tekshiruvi va biznes qoidalari — **har doim serverda**.

## Kod: XSS va `v-html`

Vue interpolyatsiyasi (`{{ }}`) HTML'ni ekranlaydi, shuning uchun u xavfsiz (08-bob):

```vue
<!-- Xavfsiz: matn sifatida chiqadi -->
<p>{{ userComment }}</p>
```

Xavf `v-html` bilan boshlanadi:

```vue
<!-- ✗ Foydalanuvchi mazmuni bilan — XSS -->
<div v-html="userComment" />
```

```js
// userComment = '<img src=x onerror="fetch(`/api/steal?c=${document.cookie}`)">'
```

Yechim — tozalash:

```bash
npm i dompurify
```

```vue
<script setup>
import DOMPurify from 'dompurify'
import { computed } from 'vue'

const safeHtml = computed(() =>
  DOMPurify.sanitize(props.html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  }),
)
</script>

<template>
    <div v-html="safeHtml" />
</template>
```

Eng yaxshi yechim esa — **HTML'ni umuman qabul qilmaslik**: markdown saqlang va uni klientda xavfsiz render qiling, yoki tuzilgan ma'lumot (JSON) ishlating.

## Kod: boshqa in'ektsiya nuqtalari

```vue
<!-- ✗ javascript: sxemasi -->
<a :href="userUrl">Havola</a>
<!-- userUrl = 'javascript:alert(document.cookie)' -->

<!-- ✓ Tekshiring -->
<script setup>
const safeUrl = computed(() => {
  try {
    const url = new URL(props.userUrl, window.location.origin)

    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : '#'
  } catch {
    return '#'
  }
})
</script>
```

```vue
<!-- ✗ Dinamik atribut nomi foydalanuvchidan -->
<div :[userKey]="value" />

<!-- ✗ Foydalanuvchi mazmuni bilan style -->
<div :style="userStyle" />          <!-- CSS in'ektsiyasi mumkin -->

<!-- ✗ Foydalanuvchi bergan komponent nomi -->
<component :is="userComponent" />
```

Umumiy qoida: foydalanuvchi ma'lumoti **matn** sifatida ishlatilsin, kod yoki struktura sifatida emas.

## Kod: tashqi havolalar

```vue
<a :href="externalUrl" target="_blank" rel="noopener noreferrer">Tashqi sayt</a>
```

`noopener` — yangi oynadagi sahifa `window.opener` orqali sizning sahifangizni boshqara olmasin (tabnabbing hujumi). Zamonaviy brauzerlar `target="_blank"` uchun buni avtomatik qo'shadi, lekin aniq yozish ishonchliroq.

## Kod: token saqlash

| Usul | XSS'da o'g'irlanadimi | CSRF xavfi | Tavsiya |
| --- | --- | --- | --- |
| `localStorage` | ✅ Ha (JS o'qiy oladi) | Yo'q | Tavsiya etilmaydi |
| `sessionStorage` | ✅ Ha | Yo'q | Tavsiya etilmaydi |
| Oddiy cookie | ✅ Ha | Ha | Yo'q |
| **httpOnly + Secure + SameSite cookie** | ❌ Yo'q | Himoyalanadi | ✅ Tavsiya |
| Xotirada (`ref`) + refresh cookie | ❌ Yo'q (sahifa yangilanishida yo'qoladi) | — | ✅ Yaxshi |

```
Set-Cookie: token=...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600
```

```js
// Klient: cookie avtomatik yuboriladi
await fetch('/api/me', { credentials: 'include' })
```

`localStorage` dagi token — bitta XSS teshigi butun akkauntni ochib beradi degani. Agar loyihada baribir `localStorage` ishlatilsa (masalan mobil ilova bilan bo'lishiladigan API), XSS himoyasiga (CSP, sanitizatsiya) ikki barobar e'tibor bering.

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

CSP — XSS'ga qarshi ikkinchi mudofaa qatori: hujumchi skript in'ektsiya qila olsa ham, brauzer uni bajarmaydi.

Vue bilan nozik joylar:

- **Runtime kompilyator** (CDN build, 02-bob) `unsafe-eval` talab qiladi. Shuning uchun production'da SFC + build ishlating — u yerda shablonlar oldindan kompilyatsiya qilingan va `eval` kerak emas;
- Inline `<style>` uchun `unsafe-inline` kerak bo'ladi (scoped CSS) — yoki nonce ishlating;
- SSR'da holat skripti uchun nonce qo'shish mumkin (57-bob).

## Kod: sirlarni chiqarmaslik

```js
// ✗ Build'da kodga matn sifatida yoziladi — har kim ko'radi (06-bob)
const apiKey = import.meta.env.VITE_STRIPE_SECRET
```

```js
// ✓ Klient faqat o'z backend'iga murojaat qiladi
const session = await $fetch('/api/checkout/session', { method: 'POST', body: { items } })
// Server tomonda: process.env.STRIPE_SECRET ishlatiladi (60-bob)
```

Tekshiruv usuli:

```bash
npm run build
grep -rE "(sk_live|secret|password|api[_-]?key)" dist/assets/*.js
```

Bu buyruqni CI'ga qo'shish mumkin — sir tasodifan bundle'ga tushsa, PR yiqiladi.

## Kod: bog'liqliklar xavfsizligi

```bash
npm audit
npm audit fix

# Eskirgan paketlar
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

`npm audit` ko'p false positive beradi (dev bog'liqliklardagi zaifliklar production'ga chiqmaydi). Shuning uchun `--omit=dev` bilan filtrlang va har ogohlantirishni kontekstda baholang.

Qo'shimcha xavf — **supply chain**: yangi paket qo'shishdan oldin muallifini, yuklab olishlar sonini, oxirgi relizni tekshiring (63-bobdagi bog'liqlik qarori ro'yxati).

## Muhandislik nuqtai nazari: klient tekshiruvlari nima uchun kerak

Agar hamma narsa serverda tekshirilsa, klient validatsiyasi nega kerak? Javob: **UX uchun, xavfsizlik uchun emas.**

```js
// Klient: tez javob, yaxshi tajriba
if (!isValid.value) return

// Server: haqiqiy himoya
// - autentifikatsiya
// - avtorizatsiya (bu foydalanuvchi shu resursga egami?)
// - validatsiya
// - rate limiting
```

Xuddi shu mantiq `v-if="isAdmin"` uchun ham amal qiladi (12-bob): u interfeysni tozalaydi, lekin himoya emas. Admin API endpoint'i har doim serverda tekshirilishi kerak.

## Muhandislik nuqtai nazari: xavfsizlik tekshiruv ro'yxati

- [ ] `v-html` faqat tozalangan yoki ishonchli mazmun bilan
- [ ] Foydalanuvchi bergan URL'lar protokoli tekshiriladi
- [ ] Token `httpOnly` cookie'da yoki xotirada
- [ ] Sirlar `VITE_` prefiksi bilan berilmagan
- [ ] CSP sarlavhasi sozlangan
- [ ] Tashqi havolalarda `rel="noopener"`
- [ ] Barcha `POST/PUT/DELETE` serverda avtorizatsiyadan o'tadi
- [ ] Fayl yuklashda tur va hajm serverda tekshiriladi
- [ ] Xato xabarlari ichki tafsilotlarni oshkor qilmaydi (stack, SQL)
- [ ] `npm audit` CI'da ishlaydi
- [ ] SSR holatida maxfiy maydonlar yo'q (56-bob)
- [ ] HTTPS majburiy (HSTS)

## Muhandislik nuqtai nazari: xatolar va ma'lumot oshkorligi

```js
// ✗ Foydalanuvchiga texnik tafsilot
catch (error) {
  toast(error.stack)
}

// ✓ Foydalanuvchiga tushunarli, tafsilot monitoringga
catch (error) {
  reportError(error)                      // Sentry (68-bob)
  toast('Saqlab bo\'lmadi. Qayta urinib ko\'ring.')
}
```

Serverdan keladigan xato xabarlari ham nazoratda bo'lsin: "SQLSTATE[23000]: Duplicate entry 'ali@mail.uz' for key 'users_email_unique'" — bu foydalanuvchiga ko'rsatiladigan matn emas va u baza tuzilmasini oshkor qiladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `v-html` ga foydalanuvchi mazmuni | XSS | DOMPurify yoki markdown |
| Token `localStorage` da | XSS'da o'g'irlanadi | httpOnly cookie |
| API kaliti `VITE_` orqali | Bundle'da ochiq | Server proksi |
| Faqat klient validatsiyasi | Chetlab o'tiladi | Server tekshiruvi |
| `target="_blank"` `rel` siz | Tabnabbing | `rel="noopener noreferrer"` |
| Xato stack'ini ko'rsatish | Ichki tuzilma oshkor bo'ladi | Umumiy xabar + monitoring |
| CSP yo'q | XSS'ga ikkinchi to'siq yo'q | CSP sarlavhasi |
| `npm audit` ni e'tiborsiz qoldirish | Ma'lum zaifliklar qoladi | CI'da tekshirish |

## Amaliyot

1. `v-html` bilan XSS'ni o'z loyihangizda ko'rsating (`<img src=x onerror=alert(1)>`), keyin DOMPurify bilan to'sing.
2. Foydalanuvchi URL'ini tekshiradigan `safeUrl` computed'ini yozing va `javascript:` bilan sinab ko'ring.
3. `npm run build` dan keyin `grep` bilan bundle ichida sir qidiring.
4. CSP sarlavhasini qo'shing (dev'da `<meta http-equiv>` orqali sinash mumkin) va nima buzilishini kuzating.
5. Tokenni `localStorage` dan httpOnly cookie'ga ko'chirish rejasini yozing: qaysi kod o'zgaradi?

## Rasmiy hujjat

- Vue xavfsizlik: <https://vuejs.org/guide/best-practices/security.html>
- OWASP Top 10: <https://owasp.org/www-project-top-ten/>
- CSP: <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>
- DOMPurify: <https://github.com/cure53/DOMPurify>
