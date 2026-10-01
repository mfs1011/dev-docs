# 74 — Monorepo va kod ulashish

[← Oldingi: Ko'p platformalilik](73-kop-platformalilik.md) · [Mundarija](README.md) · [Keyingi: Kuzatuvchanlik →](75-kuzatuvchanlik.md)

## Tushuncha

Monorepo — bir nechta loyiha (ilovalar, kutubxonalar, servislar) **bitta git repozitoriyasida**. Polirepo — har biri alohida repoda.

```text
monorepo/
├── apps/
│   ├── web/              Angular / React / Next ilova
│   ├── admin/
│   └── api/              backend (ixtiyoriy — ko'pincha frontend monorepolari)
├── packages/
│   ├── ui/               dizayn tizimi (43-bob)
│   ├── api-client/       OpenAPI'dan generatsiya (54-bob)
│   ├── tokens/           dizayn tokenlari (73-bob)
│   ├── config/           eslint, tsconfig, prettier — umumiy
│   └── utils/
└── tools/
```

Monorepo — **monolit emas**: ilovalar alohida deploy qilinadi, faqat kod bir joyda.

## Nega shunday

Bir nechta ilova umumiy kod (dizayn tizimi, API klient, tiplar) ishlatsa, polirepoda:

```text
packages/ui da tugma tuzatildi
  → npm publish ui@2.3.1
  → web repoda: npm update, PR, test, merge
  → admin repoda: xuddi shu
  → mobile-web repoda: unutildi → 3 oy eski tugma
```

Monorepoda — bitta PR: `packages/ui` o'zgaradi, unga bog'liq ilovalar shu PR'da test qilinadi va birga yangilanadi. **Atomik o'zgarishlar** — asosiy foyda.

## Psevdokod: chegaralar — monorepoda ham

```text
Muammo: hamma narsa bir joyda → har kim hamma narsani import qila oladi → "big ball of mud"

Qoidalar (Nx enforce-module-boundaries / eslint-plugin-boundaries):
  apps/*            → packages/* ni import qila oladi
  packages/ui       → faqat packages/tokens, packages/utils
  packages/*        → apps/* ni import QILA OLMAYDI
  apps/web          → apps/admin ni import QILA OLMAYDI
  har package — faqat package.json "exports" orqali (11-bob, ochiq API)

Teglar bilan:  type:app, type:ui, type:data, scope:shop, scope:admin
  scope:shop → scope:admin ni ishlata olmaydi
```

4 va 11-boblardagi chegara qoidalari monorepoda **majburiy** bo'ladi — aks holda u tez chigallashadi.

## Psevdokod: faqat o'zgarganini build/test qilish

```text
PR: packages/ui/button.ts o'zgardi
Bog'liqlik grafi:  ui ← web, admin    (mobile-web ui'ni ishlatmaydi)
CI:  affected = [ui, web, admin]  →  faqat shular lint/test/build
Kesh: o'zgarmagan paketlarning build/test natijasi — keshdan (lokal va masofaviy)
```

Bu bo'lmasa, monorepo o'sgan sari CI soatlab ishlaydi — monorepodan voz kechishning eng keng tarqalgan sababi.

## Psevdokod: monorepo yoki polirepo

```text
Monorepo mos:
  - bir jamoa yoki yaqin jamoalar bir nechta bog'liq ilova
  - umumiy dizayn tizimi, API klient, tiplar
  - atomik o'zgarishlar muhim (API + frontend bir PR'da)

Polirepo mos:
  - mustaqil jamoalar, mustaqil reliz sikllari, turli texnologiyalar
  - ochiq manbali alohida kutubxonalar
  - repoga kirish huquqlari alohida bo'lishi kerak (masalan, tashqi pudratchi)
```

## Framework'larda

| Vosita | Xususiyati |
| --- | --- |
| **pnpm workspaces** | Eng yengil asos: paketlar orasida bog'lanish, yagona lock fayl |
| **Turborepo** | Vazifa grafi, kesh (lokal + masofaviy), oddiy konfiguratsiya |
| **Nx** | Bog'liqlik grafi, affected, chegara qoidalari, generatorlar; Angular, React, Vue, Next uchun plaginlar |
| Angular CLI workspace | `projects/` — bir nechta ilova va kutubxona (`ng generate library`); CLI asoslari — [Angular 6-bob](../angular/06-angular-cli.md) |
| PHP | Composer path repositories; monorepo-split (alohida paketlarga avtomatik bo'lish) |

Frontend loyihalari uchun keng tarqalgan juftlik: **pnpm workspaces + Turborepo** (oddiylik) yoki **Nx** (katta, ko'p ilovali, qat'iy chegaralar). Angular ekotizimida Nx ayniqsa ommabop.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Polirepo | Mustaqillik, aniq egalik, oddiy CI | Versiyalarni sinxronlash, atomik o'zgarish yo'q |
| Monorepo (vositasiz) | Atomik o'zgarishlar | CI sekinlashadi, chegaralar eriydi |
| Monorepo + Turborepo/Nx | Affected build, kesh, chegaralar | Vosita o'rganish, konfiguratsiya |
| Ichki paketlar npm'ga publish | Versiya nazorati | Reliz jarayoni, iste'molchilarni yangilash |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Chegara qoidalarisiz monorepo | Hamma narsa hamma narsaga bog'lanadi | Teglar + lint qoidalari |
| Har PR'da hamma narsani build | CI soatlab | Affected + kesh |
| `packages/shared` hamma narsa uchun | Yangi markaziy bog'lanish | Maqsadli kichik paketlar |
| Paketga chuqur import (`ui/src/internal/...`) | Ochiq API ma'nosiz | `exports` maydoni |
| Monorepo = monolit deploy deb o'ylash | Ilovalar birga deploy qilinadi | Har ilova alohida pipeline |
| Turli ilovalarda bir kutubxonaning turli versiyalari | Monorepo foydasi yo'qoladi | Yagona versiya siyosati |

## Amaliyot

1. Ilovalaringiz orasida umumiy kod qanday ulashiladi — nusxa ko'chirish, npm paket yoki monorepo?
2. Bitta umumiy kod (UI tugma, API tiplar) bir nechta joyda nusxalanganmi — toping.
3. Monorepo bo'lsa: bog'liqlik grafini chiqaring (`nx graph` / `turbo run build --graph`) va kutilmagan bog'lanishlarni toping.
4. CI'da affected build/test qo'shing va vaqtni solishtiring.

## Manbalar

- monorepo.tools — monorepo vositalari solishtirmasi <https://monorepo.tools>
- Nx — *Enforce Module Boundaries* <https://nx.dev/features/enforce-module-boundaries>
- Turborepo <https://turborepo.com>
