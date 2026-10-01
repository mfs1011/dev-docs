# 73 — Ko'p platformalilik

[← Oldingi: Uchinchi tomon integratsiyalari](72-integratsiyalar.md) · [Mundarija](README.md) · [Keyingi: Monorepo va kod ulashish →](74-monorepo.md)

## Tushuncha

Bitta mahsulot — bir nechta klient: web, iOS, Android, ba'zan desktop, admin panel, partner API. Arxitektura savoli: **nimani ulashish** va **nimani har platformada alohida** qilish.

| Qatlam | Ulashish | Izoh |
| --- | --- | --- |
| Biznes qoidalari | ✅ Backend'da | Har klientda takrorlanmasin |
| API shartnomasi | ✅ Bitta (yoki klient bo'yicha BFF, 69-bob) | OpenAPI dan har platformaga tiplar |
| Dizayn tokenlari | ✅ Bitta manba | Ranglar, shriftlar — web CSS, iOS, Android formatlariga generatsiya |
| Tarjimalar | ✅ Bitta manba | Kalitlar umumiy |
| UI komponentlar | ⚠️ Ba'zan | React Native / Flutter / Capacitor — trade-off |
| Navigatsiya, platforma xulqi | ❌ Alohida | iOS va Android konvensiyalari farqli |

## Nega shunday

Mobil ilova web'dan **uch jihatdan** tubdan farq qiladi:

| Jihat | Web | Mobil ilova |
| --- | --- | --- |
| Yangilanish | Deploy — hamma darhol yangi versiyada | Do'kon tekshiruvi, foydalanuvchi yangilamasligi mumkin — eski versiyalar oylab |
| Tarmoq | Odatda barqaror | Uziladi, sekin, offline (51-bob) |
| Imkoniyatlar | Brauzer API | Push, kamera, biometrika, fon ishlari |

Birinchisi eng muhim: backend **bir paytda ko'p klient versiyasini** qo'llashi kerak (58-bob). Web'dagi "deploy qildim — tuzatildi" mobil'da ishlamaydi.

## Psevdokod: klient versiyasi bilan ishlash

```text
Har so'rov:   X-Client: ios/4.12.0 (build 812)

Backend:
  min_supported = { ios: "4.0.0", android: "4.0.0" }
  if client < min_supported: 426 Upgrade Required + { "type": ".../upgrade-required", "storeUrl": "..." }
  feature flag'lar klient versiyasi bo'yicha: yangi feature faqat >= 4.10 ga
  metrika: qaysi versiyalar hali faol → eski API maydonlarini qachon olib tashlash (58-bob)

Remote config:
  ilova ishga tushganda: GET /config → { features, minVersion, maintenance }
  → do'kon relizisiz xulqni o'zgartirish (ehtiyotkorlik bilan: do'kon qoidalari)
```

## Psevdokod: dizayn tokenlari — bitta manba

```text
tokens.json (W3C Design Tokens formati)
  { "color": { "primary": { "$value": "#0b6e4f" } }, "space": { "4": { "$value": "16px" } } }
    │  Style Dictionary
    ├──▶ web:      --color-primary: #0b6e4f;
    ├──▶ iOS:      static let primary = UIColor(...)
    └──▶ Android:  <color name="primary">#0b6e4f</color>
```

Brend rangi bir joyda o'zgaradi — barcha platformalarga generatsiya (43-bob).

## Psevdokod: yondashuvlar spektri

```text
To'liq native (Swift + Kotlin)           eng yaxshi UX va imkoniyat; ikki kod bazasi, ikki jamoa
Kross-platforma (Flutter, React Native)  bitta kod, deyarli native UX; platforma xususiyatlari uchun ko'priklar
Web asosida (Capacitor/Ionic, PWA)       web jamoasi va kodi; UX va imkoniyatlar cheklanganroq
PWA (51-bob)                             o'rnatiladi, offline; iOS'da push va fon imkoniyatlari cheklangan

Tanlov drayverlari (3-bob): jamoa ko'nikmasi, kerakli qurilma imkoniyatlari, UX talabi, budjet
```

React Native — React kitobidagi bilimlar (komponentlar, hooklar, holat) to'g'ridan-to'g'ri o'tadi; Capacitor — Angular/Vue/React web ilovasini o'raydi.

## Framework'larda

| Ehtiyoj | Vositalar | Qayerda |
| --- | --- | --- |
| Umumiy API tiplari | OpenAPI → TS / Swift / Kotlin generatorlar | 54-bob |
| Dizayn tokenlari | Style Dictionary, Tokens Studio | 43-bob |
| Web → mobil | Capacitor (Angular, Vue, React), Ionic | — |
| React → mobil | React Native, Expo | [React kitobi](../react/README.md) bilimlari asosida |
| PWA | Workbox, `vite-plugin-pwa` | 51-bob, shu saytning o'zi |
| Push | FCM, APNs; web — Push API | — |

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Har platforma native | Eng yaxshi UX | Ikki-uch kod bazasi, xulq nomuvofiqligi |
| Kross-platforma | Bitta kod, tezroq | Ko'priklar, platforma yangilanishlarida kechikish |
| Web asosida | Web jamoasi yetarli | UX va imkoniyatlar cheklangan |
| Biznes qoidalari klientlarda | Offline ishlash | Takrorlanish, nomuvofiqlik |
| Biznes qoidalari faqat backend'da | Bitta haqiqat | Offline'da cheklangan |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Mobil ilova web kabi "darhol yangilanadi" deb o'ylash | Eski versiyalar buziladi | Versiya bo'yicha moslik, minimal versiya |
| Klient versiyasi yuborilmaydi | Kim eski ekanini bilmaysiz | `X-Client` sarlavhasi |
| Biznes qoidasi uch platformada qayta yozilgan | Uch xil natija | Backend yoki `_actions` (62-bob) |
| Ranglar har platformada qo'lda | Brend nomuvofiq | Tokenlar generatsiyasi |
| Mobil uchun web API'ni o'zgarishsiz ishlatish | Ortiqcha ma'lumot, ko'p so'rov | Mobil BFF yoki maqsadli endpoint'lar |
| Majburiy yangilash mexanizmi yo'q | Xavfsizlik tuzatishini yetkazib bo'lmaydi | 426 + do'kon havolasi |

## Amaliyot

1. Platformalaringiz ro'yxati va har biri qaysi API versiyasini ishlatishini aniqlang.
2. So'rovlarga klient versiyasi sarlavhasini qo'shing va faol versiyalar metrikasini yig'ing.
3. Biznes qoidalari takrorlangan joylarni toping (masalan, narx hisobi web va mobil'da).
4. Dizayn tokenlarini bitta faylga yig'ib, kamida ikki platformaga generatsiya qiling.

## Manbalar

- W3C Design Tokens — format <https://www.designtokens.org>
- Style Dictionary <https://styledictionary.com>
- Capacitor <https://capacitorjs.com>, React Native <https://reactnative.dev>
