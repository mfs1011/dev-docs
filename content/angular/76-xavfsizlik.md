# 76 — Xavfsizlik

[← Oldingi: Erishimlilik](75-erishimlilik.md) · [Mundarija](README.md) · [Keyingi: Ko'p tillilik →](77-i18n.md)

## Tushuncha

Frontend xavfsizligining asosiy tahdidlari:

| Tahdid | Nima | Angular himoyasi |
| --- | --- | --- |
| **XSS** | Begona skript sahifangizda ishlaydi | Avtomatik sanitizatsiya, escape |
| **CSRF** | Boshqa sayt foydalanuvchi nomidan so'rov yuboradi | `HttpClient` XSRF (58-bob) |
| **Token o'g'irlash** | XSS orqali token olinadi | Saqlash strategiyasi (58-bob) |
| **Open redirect** | `?returnUrl=https://evil` | Ichki yo'l tekshiruvi (59-bob) |
| **SSRF** (SSR) | Soxta `Host` bilan server so'rovlari | `allowedHosts` (62-bob) |
| **Ta'minot zanjiri** | Zararli npm paket | `npm audit`, lock fayl |
| **Sirlar oshkor** | API kalit bundle'da | Sirlar faqat serverda |

**Asosiy qoida:** frontend — ishonchsiz muhit. Foydalanuvchi kodni o'qiydi, o'zgartiradi, API'ni to'g'ridan-to'g'ri chaqiradi. Haqiqiy himoya — serverda; frontend himoyasi — **zararni cheklash**.

## Nega shunday

XSS — eng xavfli: sahifada begona skript ishlasa, u foydalanuvchi ko'rgan hamma narsani ko'radi, uning nomidan har qanday amalni bajaradi. Angular shablon tizimi XSS'ning ko'p turlarini **sukut bo'yicha** to'sadi — lekin chetlab o'tish yo'llari bor va ular ko'pincha "qulaylik uchun" ishlatiladi.

## Kod: Angular nimani avtomatik qiladi

Tekshirildi:

```ts
html = '<b>qalin</b><script>alert(1)</script><img src=x onerror="alert(2)"><a href="javascript:alert(3)">l</a>';
bad = 'javascript:alert(1)';
```

| Shablon | Natija |
| --- | --- |
| `{{ html }}` | Hamma narsa **matn** sifatida: `&lt;b&gt;qalin…` |
| `[innerHTML]="html"` | `<b>qalin</b><img src="x"><a href="unsafe:javascript:alert(3)">l</a>` — `<script>` va `onerror` **olib tashlandi** |
| `[href]="bad"` | `unsafe:javascript:alert(1)` — ishlamaydi |
| `[style.background-image]="'url(javascript:…)'"` | Stil umuman qo'yilmadi |

Konsolda ogohlantirish: `WARNING: sanitizing HTML stripped some content`. Bu ogohlantirishni ko'rsangiz — ma'lumot manbasini tekshiring, ogohlantirishni o'chirmang.

## Kod: xavfli yo'llar

### `bypassSecurityTrust*`

```ts
private readonly sanitizer = inject(DomSanitizer);
trusted = this.sanitizer.bypassSecurityTrustHtml(userContent);   // ❌ foydalanuvchi kontenti bilan
```

Tekshirildi: `bypassSecurityTrustHtml('<button onclick="x()">')` — `onclick` **saqlandi**. Bu funksiya "men bu kontentga ishonaman" degani. Foydalanuvchi, CMS muharriri yoki API'dan kelgan kontent bilan — XSS.

Qachon qabul qilinadi: **o'zingiz** yaratgan, statik kontent (masalan, build vaqtidagi SVG ikonkalar). Foydalanuvchi HTML'i (rich text) kerak bo'lsa — serverda tozalash (masalan, HTML Purifier / `sanitize-html`) **va** `[innerHTML]` (ikki qatlam).

### DOM'ga to'g'ridan-to'g'ri

```ts
this.el.nativeElement.innerHTML = userContent;          // ❌ Angular sanitizatsiyasi ishlamaydi
document.write(...);                                     // ❌
new Function(userCode)();  eval(...)                     // ❌
this.renderer.setProperty(el, 'innerHTML', userContent); // ❌ ham tozalanmaydi
```

Angular himoyasi faqat **shablon bog'lanishlarida**. `ElementRef` orqali DOM bilan ishlash (32-bob) — himoyasiz.

### Shablonni satrdan yaratish

Foydalanuvchi kiritgan matnni shablon sifatida kompilyatsiya qilish (JIT, `Compiler`) — kod bajarish. Angular 22 AOT'da buning oddiy yo'li yo'q — va shunday qolsin.

## Kod: Content Security Policy

CSP — brauzerga "faqat shu manbalardan skript ishlat" degan qoida. XSS bo'lsa ham, begona skript ishlamaydi.

Angular build CSP'ni avtomatik yaratadi:

```json
// angular.json → architect.build.options
"security": { "autoCsp": true }
```

Tekshirildi — `index.html` ga qo'shildi:

```html
<meta http-equiv="Content-Security-Policy"
      content="script-src 'strict-dynamic' 'sha256-lD9…' https: 'unsafe-inline';object-src 'none';base-uri 'self';">
```

`'strict-dynamic'` + hash — faqat build'dagi inline skript va u yuklagan skriptlar ishonchli; zamonaviy brauzerlar `https:` va `'unsafe-inline'` ni e'tiborsiz qoldiradi (ular eski brauzerlar uchun zaxira).

Server sarlavhasi bilan to'liqroq CSP (nginx):

```nginx
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https://cdn.shop.uz; connect-src 'self' https://api.shop.uz; frame-ancestors 'none'" always;
```

`frame-ancestors 'none'` — clickjacking'dan (sahifangizni boshqa saytda iframe ichida ko'rsatish).

### Trusted Types

Brauzer darajasida `innerHTML` ga faqat "tasdiqlangan" qiymatlarni ruxsat berish:

```
Content-Security-Policy: require-trusted-types-for 'script'; trusted-types angular angular#bundler
```

Angular Trusted Types'ni qo'llaydi — yuqoridagi `nativeElement.innerHTML = string` kabi xavfli joylar brauzer xatosiga aylanadi. Katta ilovalarda — kuchli qo'shimcha himoya qatlami.

## Kod: sirlar

```ts
// ❌ environment.ts — bundle'da hamma ko'radi
export const environment = { stripeSecretKey: 'sk_live_…', openaiKey: 'sk-…' };
```

`environment.ts` va `config.json` — **ommaviy**. Faqat ommaviy qiymatlar: API URL, Stripe **publishable** key, Sentry DSN. Maxfiy kalit kerak bo'lgan har amal — backend orqali (yoki SSR `server.ts` da, muhit o'zgaruvchisidan).

Tekshirish: `ng build` → `grep -r "sk_live" dist/` — natija bo'lmasligi kerak.

## Kod: bog'liqliklar

```bash
npm audit --omit=dev          # prod bog'liqliklardagi ma'lum zaifliklar
npm ci                        # CI'da — faqat lock fayldan
ng update                     # Angular xavfsizlik tuzatishlari
```

| Amaliyot | Nega |
| --- | --- |
| `package-lock.json` commit | Hamma joyda bir xil versiyalar |
| CI'da `npm ci` | Lock fayldan chetga chiqmaydi |
| Yangi paket qo'shishdan oldin tekshirish | Yuklab olishlar, oxirgi yangilanish, muallif |
| Dependabot / Renovate | Zaifliklar tuzatilishi avtomatik PR |

## Muhandislik nuqtai nazari

**Xavfsizlik tekshiruv ro'yxati (reliz oldidan):**

- [ ] `bypassSecurityTrust*` — har bir ishlatilishi asoslanganmi? (`grep -r bypassSecurityTrust src/`)
- [ ] `nativeElement.innerHTML`, `eval`, `new Function` yo'q.
- [ ] CSP yoqilgan (`autoCsp` yoki server sarlavhasi).
- [ ] Bundle'da sirlar yo'q.
- [ ] Token saqlash — 58-bob tavsiyalariga mos.
- [ ] `returnUrl` va boshqa yo'naltirishlar tekshiriladi.
- [ ] SSR'da `allowedHosts`; `trustProxyHeaders` faqat proxy orqasida.
- [ ] `npm audit` toza (yoki qabul qilingan istisnolar).
- [ ] Server har API'da ruxsatni tekshiradi (frontend guardlariga ishonmaydi).

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Foydalanuvchi kontentiga `bypassSecurityTrustHtml` | XSS | Serverda tozalash + `[innerHTML]` |
| `nativeElement.innerHTML = …` | Sanitizatsiyasiz | Shablon bog'lanishi |
| Sanitizatsiya ogohlantirishini e'tiborsiz qoldirish | Ma'lumot manbasi muammosi yashirinadi | Manbani tekshirish |
| Maxfiy kalit `environment.ts` da | Hamma ko'radi | Backend orqali |
| CSP yo'q | XSS to'liq ta'sir qiladi | `autoCsp` / sarlavha |
| `frame-ancestors` yo'q | Clickjacking | CSP'da `'none'` |
| Faqat frontend ruxsat tekshiruvi | API ochiq | Server tekshiruvi |
| `npm install` CI'da | Kutilmagan versiyalar | `npm ci` |

## Amaliyot

1. `[innerHTML]` ga `<img onerror>` bering va natijani DevTools'da ko'ring.
2. Loyihada `bypassSecurityTrust` va `nativeElement.innerHTML` ni qidiring; har birini asoslang yoki olib tashlang.
3. `autoCsp` ni yoqing, build'dagi CSP'ni o'qing; sahifa ishlashini tekshiring.
4. nginx'da `frame-ancestors 'none'` va `connect-src` qo'shing.
5. `ng build` natijasida sirlarni `grep` bilan qidiring.
6. `npm audit --omit=dev` ni ishga tushirib, natijani tahlil qiling.

## Rasmiy hujjat

- Xavfsizlik: <https://angular.dev/best-practices/security>
- CSP: <https://angular.dev/best-practices/security#content-security-policy>
- OWASP XSS: <https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html>
