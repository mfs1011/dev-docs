# 93 — CDN va chekka keshlash

[← Oldingi: Load balancing](92-load-balancing.md) · [Mundarija](README.md) · [Keyingi: Replikatsiya →](94-replikatsiya.md)

## Tushuncha

**CDN** (Content Delivery Network) — foydalanuvchilarga **geografik jihatdan yaqin** joylashgan, javoblarni saqlab beradigan serverlar tarmog'i. Foydalanuvchi so'rovi asosiy serverga (**origin**) emas, eng yaqin **chekka** (edge) serverga boradi; javob u yerda bo'lsa, origin'gacha borilmaydi.

90-bobdagi kechikish jadvali sababni ko'rsatadi: datamarkaz ichida borib-kelish ~0.5 ms, qit'alararo esa ~150 ms. Toshkentdagi foydalanuvchi uchun Yevropadagi origin'ga har so'rov — yuzlab millisekund. Yaqin chekka server bu masofani olib tashlaydi.

### CDN — umumiy kesh

HTTP keshlash standarti RFC 9111 ikki turdagi keshni ajratadi:

- **xususiy kesh** (private cache) — bitta foydalanuvchi uchun, masalan brauzer keshi;
- **umumiy kesh** (shared cache) — javoblarni **bir nechta foydalanuvchi** uchun qayta ishlatadi.

CDN va reverse proxy — umumiy kesh. MDN ularni **boshqariladigan kesh** (managed cache) deb ataydi: xizmat egasi origin'dan yukni olish va kontentni samarali yetkazish uchun ataylab joylashtiradi (reverse proxy, CDN, service worker + Cache API).

Brauzer va HTTP keshining umumiy lug'ati (`max-age`, `no-cache`, `ETag`) — 65-bob (kesh kelishuvi). Bu bob — **umumiy keshga xos** qoidalar va CDN arxitekturasi.

### Umumiy keshni boshqaruvchi direktivalar

RFC 9111 dan:

| Direktiva | Ma'nosi |
| --- | --- |
| `private` | Umumiy kesh javobni **saqlamasligi** kerak — u bitta foydalanuvchi uchun |
| `public` | Javobni saqlash mumkin, hatto boshqa holatda taqiqlangan bo'lsa ham — masalan, `Authorization` li so'rovga javob |
| `s-maxage=N` | **Faqat umumiy kesh uchun**: `max-age` va `Expires` o'rniga shu muddat. Eskirgandan keyin origin bilan tekshirmasdan qayta ishlatilmaydi |
| `no-store` | Hech qanday kesh (xususiy ham, umumiy ham) saqlamaydi |
| `no-cache` | Saqlash mumkin, lekin har foydalanishdan oldin origin bilan **tekshirish** (revalidatsiya) shart |

**Autentifikatsiyalangan so'rovlar.** RFC 9111 (3.5-bo'lim): umumiy kesh `Authorization` sarlavhali so'rovga berilgan javobni boshqa so'rovga **ishlatmasligi** kerak. Istisno — javobda buni aniq ruxsat etuvchi direktiva bo'lsa: `must-revalidate`, `public` yoki `s-maxage`. Ya'ni shaxsiy ma'lumot sukut bo'yicha himoyalangan — lekin `public` qo'shilsa, himoya olib tashlanadi.

### Kesh kaliti va `Vary`

RFC 9111 ga ko'ra **kesh kaliti** (cache key) kamida so'rov metodi va manzildan (URI) iborat. Amalda ko'p keshlar faqat `GET` ni saqlaydi va kalit sifatida faqat URI'ni ishlatadi.

Bitta URI turli foydalanuvchiga turli javob bersa (til, siqish formati), javobga **`Vary`** qo'shiladi. RFC 9111 (4.1-bo'lim): `Vary` da ko'rsatilgan so'rov sarlavhalari asl so'rovdagi bilan mos kelmasa, saqlangan javob revalidatsiyasiz ishlatilmaydi. MDN misoli: `Vary: Accept-Language` — kesh URL va `Accept-Language` juftligi bo'yicha ajratiladi.

MDN ogohlantiradi: `Vary: User-Agent` yozish vasvasasi bor, lekin `User-Agent` qiymatlari juda xilma-xil — keshning qayta ishlatilish ehtimoli **keskin kamayadi**.

### Eskirgan javob: `stale-while-revalidate`, `stale-if-error`

RFC 5861 kengaytmalari:

- **`stale-while-revalidate=N`** — javob eskirgandan keyin ham N soniya davomida uni berish mumkin, kesh esa shu paytda (bloklamasdan) fonda revalidatsiya qiladi;
- **`stale-if-error=N`** — origin xato qaytarsa, eskirgan javobni N soniya davomida berish mumkin.

Ikkinchisi CDN'ni **ishonchlilik** vositasiga aylantiradi (79-bob): origin vaqtincha yiqilsa ham, foydalanuvchilar oxirgi to'g'ri javobni ko'radi.

### Invalidatsiya: standartda yo'q

MDN aniq aytadi: uzoq `max-age` bilan oraliq serverda saqlangan javobni **o'chirishning yo'li yo'q**. Javob keshda turgan ekan, so'rovlar origin'ga yetib bormaydi va server hech narsa qila olmaydi. Boshqariladigan keshlarda esa (CDN) saqlangan javobni **panel, API** yoki qayta ishga tushirish orqali istalgan payt o'chirish mumkin. Lekin bu HTTP standarti emas — har CDN provayderining **o'z** mexanizmi (purge).

Shuning uchun asosiy usul — **cache busting**: kontent o'zgarganda **URL o'zgaradi** (`app.3f9a1c.js`). MDN tavsiyasi:

- versiyalangan fayllar (JS, CSS, rasmlar) — `Cache-Control: public, max-age=31536000, immutable` (bir yil). `immutable` (RFC 8246) — resurs amal qilish muddati davomida o'zgarmaydi, klient uni qayta tekshirmasligi mumkin;
- **asosiy HTML** URL'ini versiyalab bo'lmaydi — u uchun `no-cache` (saqlanadi, lekin har safar tekshiriladi) va `ETag`/`Last-Modified`: o'zgarmagan bo'lsa `304 Not Modified`.

## Nega shunday

CDN uchta narsani beradi:

- **kechikish** — foydalanuvchiga yaqin server (90-bob: 150 ms o'rniga bir necha ms);
- **origin yuki** — takroriy so'rovlar origin'ga yetmaydi (91-bobdagi nusxalar soni kamayadi);
- **chidamlilik** — `stale-if-error` va keshlangan statik kontent origin nosozligida ham ishlaydi.

Narxi — **izchillik**: umumiy keshda eskirgan javob bir vaqtning o'zida **minglab** foydalanuvchiga beriladi. Noto'g'ri sarlavha esa yanada jiddiy: shaxsiy javob umumiy keshga tushsa, uni boshqa foydalanuvchi ko'radi.

## Psevdokod: resurs turi bo'yicha siyosat

```text
Versiyalangan statik fayllar (app.3f9a1c.js, logo.8d2e.png)
  Cache-Control: public, max-age=31536000, immutable
  → CDN va brauzer bir yil saqlaydi; yangi versiya = yangi URL

Asosiy HTML (index.html)
  Cache-Control: no-cache
  ETag: "v42"
  → har safar tekshiriladi; o'zgarmagan bo'lsa 304

Ommaviy API javobi (mahsulotlar katalogi)
  Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=30, stale-if-error=600
  → brauzer saqlamaydi; CDN 60 s saqlaydi, keyin 30 s eskisini berib fonda yangilaydi,
    origin yiqilsa 10 daqiqa eskisini beradi

Shaxsiy javob (savat, profil)
  Cache-Control: private, no-cache        // yoki no-store (maxfiy ma'lumot)
  → CDN saqlamaydi
```

## Psevdokod: kesh kalitini to'g'ri qurish

```text
// ❌ Til cookie'da, Vary yo'q: o'zbekcha sahifa ruscha foydalanuvchiga ketadi
GET /home   Cookie: lang=uz   →  Cache-Control: public, s-maxage=300

// ✅ Til URL'da (har biri alohida kalit)
GET /uz/home   GET /ru/home

// ✅ yoki sarlavha + Vary
GET /home   Accept-Language: uz   →  Vary: Accept-Language

// ❌ Vary: User-Agent — deyarli har so'rov alohida kalit, kesh foydasiz (MDN)
```

## Psevdokod: deploy va invalidatsiya

```text
deploy():
    build()                          // app.[hash].js — yangi nomlar
    upload(static, cdn)              // eski fayllar ham qoladi: ochiq sahifalar ularni so'raydi
    deploy(html)                     // HTML no-cache → yangi fayllarga havola darhol
    // purge kerak emas: URL'lar yangi

agar versiyalanmagan resurs o'zgarsa:
    cdnProvider.purge("/images/banner.jpg")    // provayder API'si — HTTP standarti emas
```

## Framework'larda

| Vazifa | Qayerda |
| --- | --- |
| Hash'li fayl nomlari (cache busting) | Laravel `@vite` direktivasi — [Laravel 30-bob](../laravel/30-blade-va-frontend.md); Vite loyiha tuzilmasi — [Vue 6-bob](../vue/06-loyiha-tuzilmasi-va-vite.md) |
| `Cache-Control` sarlavhalari | Symfony javob sarlavhalari — [Symfony 11-bob](../symfony/11-request-response.md); kesh lug'ati — 65-bob |
| Server render kesh va revalidatsiya | Next.js — [Next.js 18-bob](../nextjs/18-kesh.md), [19-bob](../nextjs/19-revalidatsiya.md) |
| Statik fayllar va media | Obyekt storage + CDN — 32-bob; render strategiyasi (SSG/ISR) — 37-bob |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| CDN'siz | Oddiy, har doim yangi | Uzoq foydalanuvchilarga sekin; origin yuki |
| Faqat statik fayllar CDN'da | Xavfsiz, katta foyda | Dinamik javoblar origin'dan |
| API javoblari ham `s-maxage` bilan | Origin yuki keskin kamayadi | Barcha foydalanuvchilarga bir xil eskirish |
| Uzoq `max-age` + versiyalangan URL | Maksimal kesh, purge kerak emas | Build jarayoni hash berishi kerak |
| Purge'ga tayanish | Versiyalanmagan URL ham yangilanadi | Provayderga bog'liqlik, standart emas |
| `stale-if-error` | Origin yiqilganda ham ishlaydi | Foydalanuvchi eski ma'lumot ko'radi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Shaxsiy javobga `public` | RFC 9111: `Authorization` himoyasi olib tashlanadi — boshqa foydalanuvchi ko'radi | `private` yoki `no-store` |
| Tilni cookie'da saqlab, kesh kalitini o'ylamaslik | Bir tildagi sahifa boshqasiga ketadi | Til URL'da yoki `Vary` |
| `Vary: User-Agent` | MDN: kesh deyarli ishlamaydi | Feature detection; kerak bo'lsa alohida URL |
| Versiyalanmagan faylga uzoq `max-age` | Yangilanish foydalanuvchiga yetmaydi; standart o'chirish yo'q | Hash'li nom yoki qisqa muddat |
| HTML'ga uzoq `max-age` | Eski HTML eski JS'ga havola qiladi | HTML — `no-cache` + `ETag` |
| Deploy'da eski statik fayllarni o'chirish | Ochiq sahifalar 404 oladi | Eski versiyalarni bir muddat saqlash |
| `max-age` ni CDN uchun ham, brauzer uchun ham bir xil | Brauzerdagi nusxani tozalab bo'lmaydi | Brauzerga qisqa `max-age`, CDN'ga `s-maxage` |

## Amaliyot

1. Saytingizdagi 5 xil resurs (HTML, JS, rasm, ommaviy API, shaxsiy API) uchun hozirgi `Cache-Control` ni yozing. Har biri yuqoridagi siyosatga mosmi?
2. Shaxsiy javoblarni tekshiring: birortasi `public` yoki `s-maxage` bilan ketmayaptimi?
3. Statik fayl nomlaringizda hash bormi? Bo'lmasa — build sozlamasini o'zgartiring.
4. Bitta ommaviy API endpoint'ga `s-maxage` va `stale-while-revalidate` qo'shing va origin'ga kelayotgan so'rovlar sonini solishtiring.
5. CDN provayderingizning purge mexanizmini toping: bitta URL'ni qanday tozalaysiz va qancha vaqt oladi?

## Manbalar

- RFC 9111 — *HTTP Caching* (shared cache, `private`, `public`, `s-maxage`, 3.5 va 4.1-bo'limlar): <https://www.rfc-editor.org/rfc/rfc9111>
- RFC 5861 — *HTTP Cache-Control Extensions for Stale Content*: <https://www.rfc-editor.org/rfc/rfc5861>
- RFC 8246 — *HTTP Immutable Responses*: <https://www.rfc-editor.org/rfc/rfc8246>
- MDN — *HTTP caching* (managed caches, cache busting, Vary, deleting stored responses): <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching>
