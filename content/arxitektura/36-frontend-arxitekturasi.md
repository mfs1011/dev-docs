# 36 — Frontend arxitekturasi nimani hal qiladi

[← Oldingi: Backend testlash strategiyasi](35-backend-testlash.md) · [Mundarija](README.md) · [Keyingi: Render strategiyasi →](37-render-strategiyasi.md)

## Tushuncha

Frontend arxitekturasi — "qaysi framework" emas. Framework tanlangandan keyin ham asosiy qarorlar qoladi:

| Soha | Savol | Bob |
| --- | --- | --- |
| **Render** | HTML qayerda va qachon yaratiladi? | 37 |
| **Tuzilma** | Kod qanday bo'linadi, kim kimni import qiladi? | 38 |
| **Komponentlar** | Komponent API'lari qanday loyihalanadi? | 39 |
| **Holat** | Ma'lumot qayerda yashaydi? | 40–41 |
| **Ma'lumot qatlami** | Server bilan qanday gaplashamiz, kesh, eskirish? | 42 |
| **Dizayn tizimi** | Ko'rinish qanday izchil qilinadi? | 43 |
| **Marshrut va formalar** | URL — holat; foydalanuvchi kiritmasi | 44–45 |
| **Sifat** | A11y, i18n, unumdorlik, xatolar, yetkazib berish | 46–49 |
| **Masshtab** | Mikro-frontendlar, offline, testlar | 50–52 |

## Nega shunday

Frontend'ni "backend'ning ko'rinish qatlami" deb ko'rish — eskirgan qarash. Zamonaviy frontend:

- **Holatli taqsimlangan tizim**: brauzerda kesh, optimistik yangilanishlar, offline, bir nechta tab.
- **Ishonchsiz muhitda** ishlaydi: kod foydalanuvchi qo'lida, tarmoq o'zgaruvchan, qurilmalar kuchsiz.
- **Unumdorlik — biznes metrikasi**: har 100 ms kechikish konversiyaga ta'sir qiladi.
- **Tez o'zgaradi**: dizayn, marketing, A/B testlar — backend'dan ko'ra tez-tez.

Oxirgi punkt — frontend arxitekturasining asosiy maqsadi: **tez o'zgarishni arzon qilish**, ko'rinishni o'zgartirish biznes mantiqni buzmasin.

## Psevdokod: frontend qatlamlari

Framework'dan qat'i nazar, deyarli har frontend shu qatlamlarga bo'linadi:

```text
┌──────────────────────────────────────────────┐
│ Sahifalar / marshrutlar     URL → layout     │   qaysi ekran
├──────────────────────────────────────────────┤
│ Feature'lar (ssenariylar)   "savatga qo'sh", │   foydalanuvchi amallari
│                             "checkout"       │
├──────────────────────────────────────────────┤
│ Entity'lar (domen)          Product, Order,  │   biznes tushunchalari, tiplar,
│                             User — tip, API  │   API chaqiruvlari, sxemalar
├──────────────────────────────────────────────┤
│ Shared                      UI kit, utils,   │   biznesdan xabarsiz
│                             http, config     │
└──────────────────────────────────────────────┘
 bog'liqlik — faqat pastga
```

Bu — Feature-Sliced Design'ning soddalashtirilgan ko'rinishi (38-bob va FSD qo'llanmasi). Backend'dagi qatlamli va feature-based yondashuvlarning (15–16-boblar) frontend varianti.

## Psevdokod: komponent turlari

```text
"Aqlli" (container)            "Ahmoq" (presentational)
- ma'lumot oladi (store, API)   - faqat input/props
- holat, navigatsiya             - faqat output/event
- feature/sahifa qatlamida       - shared/ui yoki entity qatlamida
                                 - hamma joyda qayta ishlatiladi, oson test qilinadi

ProductPage (aqlli)
  └── ProductGallery (ahmoq)  ProductPrice (ahmoq)  AddToCartButton (feature — amal)
```

Qat'iy qoida emas — lekin "har komponent API chaqiradi" holatidan qochish uchun foydali ajratish.

## Framework'larda

Bu kitobdagi frontend boblari framework'larning **umumiy** qarorlarini ko'rib chiqadi. Har framework'ning o'z yo'li — tegishli kitoblarda:

| Soha | Angular | React | Vue | Next.js |
| --- | --- | --- | --- | --- |
| Arxitektura umumiy | [78-bob](../angular/78-amaliy-loyiha.md) | [34-bob](../react/34-arxitektura.md) | [69-bob](../vue/69-amaliy-loyiha.md) | [50-bob](../nextjs/50-amaliy-loyiha.md) |
| Render | [62–65](../angular/62-ssr-asoslari.md) | [5-bob](../react/05-render-modeli.md) | [56](../vue/56-ssr-mexanizmi.md), [58](../vue/58-ssg-va-prerender.md) | [3-bob](../nextjs/03-render-strategiyalari.md) |
| Holat | [60–61](../angular/60-signal-xizmatlar.md) | [37-bob](../react/37-holat-qayerda.md) | [41–43](../vue/41-holat-boshqaruvi.md) | [24-bob](../nextjs/24-klient-holati.md) |
| Ma'lumot | [55](../angular/55-http-client.md), [21-bob](../angular/21-http-resource.md) | [31–32](../react/31-malumot-yuklash.md) | [44-bob](../vue/44-http-qatlami.md) | [17–19](../nextjs/17-malumot-yuklash.md) |
| Formalar | [47–54](../angular/47-formalar-tanlov.md) | [38-bob](../react/38-formalar.md) | [45-bob](../vue/45-formalar-arxitekturasi.md) | [22-bob](../nextjs/22-formalar.md) |

Qarang: bir xil savollar, turli mexanizmlar. Keyingi boblar — qarorning o'zi va har framework'da qanday ko'rinishi.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Framework sukuti bilan "o'z-o'zidan" | Tez boshlash | Loyiha o'sganda tuzilma tasodifiy |
| Aniq qatlamlar va qoidalar (FSD kabi) | Bashorat qilinadigan tuzilma, onboarding | O'rganish va majburlash |
| Frontend'da domen mantiq | Offline, tezkor UX | Backend bilan takrorlanish, nomuvofiqlik |
| Barcha mantiq backend'da | Bitta haqiqat | Har harakat — tarmoq, sekinroq UX |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Frontend arxitekturasi = framework tanlovi | Asosiy qarorlar e'tibordan chetda | Yuqoridagi sohalar bo'yicha qarorlar |
| `components/`, `services/` texnik papkalar | Feature tarqaladi | Feature/entity bo'yicha |
| Har komponent API chaqiradi | Takrorlanish, test qiyin | Ma'lumot qatlami, aqlli/ahmoq ajratish |
| Biznes qoidalarini faqat frontend'da tekshirish | Chetlab o'tiladi | Server — haqiqat, frontend — UX |
| Unumdorlik va a11y "keyin" | Keyin qimmat (46–47) | Boshidan byudjet va checklist |

## Amaliyot

1. Frontend loyihangiz uchun yuqoridagi 9 soha bo'yicha "qaror qabul qilinganmi?" jadvalini to'ldiring.
2. Papka tuzilmangizni qatlamlar sxemasi bilan solishtiring: qayerda bog'liqlik "yuqoriga" ketadi?
3. API chaqiradigan komponentlar sonini sanang — ma'lumot qatlami kerakmi?
4. Frontend'da takrorlangan biznes qoidalarini toping — ular backend bilan mosmi?

## Manbalar

- Feature-Sliced Design: <https://feature-sliced.design>
- Dan Abramov — *Presentational and Container Components* (va keyingi izohi) <https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0>
- web.dev — *Web Vitals* <https://web.dev/articles/vitals>
