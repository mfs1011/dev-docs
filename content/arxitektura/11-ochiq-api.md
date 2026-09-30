# 11 — Modulning ochiq API'si

[← Oldingi: Bog'liqlikni teskari qilish va DI](10-di.md) · [Mundarija](README.md) · [Keyingi: Tiplar orqali dizayn →](12-tiplar.md)

## Tushuncha

Har modulning ikki qismi bor:

| Qism | Kim ishlatadi | O'zgarish narxi |
| --- | --- | --- |
| **Ochiq API** (public surface) | Boshqa modullar | Yuqori — hamma iste'molchilar ta'sirlanadi |
| **Ichki qism** (internals) | Faqat modulning o'zi | Past — xohlagancha refaktor |

Maqsad — ochiq qismni **kichik va barqaror**, ichki qismni **erkin** ushlash. John Ousterhout buni "chuqur modul" deydi: kichik interfeys ortida katta funksionallik.

```text
Chuqur modul (yaxshi)          Sayoz modul (yomon)
┌──────────┐                   ┌──────────────────────────────┐
│ open()   │  ← kichik API     │ a() b() c() d() e() f() g()  │ ← katta API
├──────────┤                   ├──────────────────────────────┤
│          │                   │   kam ish                    │
│  ko'p    │                   └──────────────────────────────┘
│  ish     │
└──────────┘
```

## Nega shunday

Til darajasidagi `private` / `public` — klass uchun. Modul (papka, paket) darajasida ko'p tillar **hech narsa majburlamaydi**: PHP'da namespace — ochiq, TypeScript'da har `export` — ochiq. Natijada boshqa modul `orders/internal/pricing/rules.ts` ni import qiladi — va sizning "ichki" kodingiz endi ochiq API.

Hyrum qonuni: *"Foydalanuvchilar soni yetarli bo'lsa, tizimning har qanday kuzatiladigan xulqiga kimdir tayanadi."* Shuning uchun ochiq bo'lishi shart bo'lmagan narsani ochmang.

## Psevdokod: bitta kirish nuqtasi

```text
orders/
├── index           ← ochiq API: faqat shu fayldan import qilinadi
├── domain/         ← ichki
├── application/    ← ichki
└── infrastructure/ ← ichki

// orders/index
export placeOrder(command) -> OrderId
export getOrderSummary(id) -> OrderSummary        // DTO, entity emas
export type OrderSummary { id, total, status }
export event OrderPlaced { orderId, placedAt }
// Order entity, repository, narx qoidalari — eksport qilinmaydi
```

Ochiq API'da nima bo'ladi:

| Eksport qiling | Eksport qilmang |
| --- | --- |
| Buyruqlar va so'rovlar (use case'lar) | Entity'lar (ichki invariantlar bilan) |
| DTO / tiplar (shartnoma) | Repository'lar |
| Hodisalar | Yordamchi funksiyalar |
| Xatolar turlari | Konfiguratsiya tafsilotlari |

**Entity o'rniga DTO** — muhim nuqta: boshqa modul sizning `Order` ob'ektingizni olsa, uning metodlarini chaqirib, invariantlarni chetlab o'tadi va sizning ichki tuzilmangizga bog'lanadi.

## Psevdokod: majburlash

Chegarani faqat kelishuv bilan ushlab bo'lmaydi — 3 oyda buziladi. Avtomatik tekshiruv:

```text
// Qoida: boshqa modul faqat "orders/index" ni import qila oladi
rule "no-deep-imports":
    from: "features/*/**"
    disallow: "orders/{domain,application,infrastructure}/**"
    allow:    "orders/index"
```

| Stack | Vosita |
| --- | --- |
| PHP | Deptrac (qatlam va modul qoidalari), PHPStan qoidalari |
| TypeScript | ESLint `no-restricted-imports`, `eslint-plugin-boundaries`, `package.json` `exports` (monorepoda) |
| Monorepo | Nx `enforce-module-boundaries`, Turborepo + `exports` (74-bob) |

## Psevdokod: API'ni o'zgartirish

```text
1. Qo'shish — xavfsiz (yangi funksiya, yangi ixtiyoriy maydon)
2. O'zgartirish/o'chirish — bosqichma-bosqich:
   a) yangi variant qo'shiladi
   b) eskisi @deprecated — sababi va muqobili bilan
   c) iste'molchilar ko'chadi (grep / IDE / linter ogohlantirishi)
   d) eskisi o'chiriladi
```

Bu — API versiyalashning (58-bob) modul ichidagi kichik ko'rinishi.

## Framework'larda

| Joy | Ochiq API qanday | Qayerda |
| --- | --- | --- |
| Frontend feature | `index.ts` public API, ichki papkalardan import taqiqlangan — FSD'ning asosiy qoidasi | [React 34-bob](../react/34-arxitektura.md), FSD qo'llanmasi |
| Angular | Lazy bo'lim faqat `*.routes.ts` orqali ulanadi; ichidan statik import — bundle chegarasini buzadi | [Angular 43-bob](../angular/43-lazy-loading.md) |
| Angular komponent | `input()`/`output()` — ochiq; `protected` a'zolar — faqat shablon uchun | [Angular 25–26-boblar](../angular/25-input.md) |
| Vue komponent | `defineProps`/`defineEmits`/`defineExpose` — nima ochiq ekanini aniq e'lon qilish | [Vue 22-bob](../vue/22-props.md), [Vue 18-bob](../vue/18-shablon-reflari.md) |
| Symfony modul | Faqat interfeys/facade xizmati `public`, qolganlar private (konteynerda sukut) | [Symfony 6-bob](../symfony/06-container-chuqur.md), [39-bob](../symfony/39-arxitektura.md) |
| Holat | Store'dan `WritableSignal` emas — `asReadonly()` + metodlar | [Angular 39-bob](../angular/39-di-naqshlari.md) |

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Hamma narsa ochiq | Tez boshlash, qulay import | Har refaktor — hammaga ta'sir; Hyrum qonuni |
| Qat'iy `index` + linter | Erkin ichki refaktor | Yangi narsa kerak bo'lsa — API'ni kengaytirish qarori |
| Entity'ni ulashish | Kam kod (DTO yo'q) | Invariantlar chetlab o'tiladi, kuchli bog'lanish |
| DTO | Izolyatsiya | O'giruvchi kod (mapper) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Chuqur importlar (`orders/domain/...`) | Ichki qism ochiqqa aylanadi | Faqat `orders/index` |
| `index.ts` hamma narsani qayta eksport qiladi (`export *`) | Chegara nominal | Tanlab eksport |
| Entity'ni boshqa modulga berish | Invariant buzilishi | DTO |
| Chegara faqat kelishuvda | Tez buziladi | Linter CI'da |
| API'ni to'g'ridan-to'g'ri o'chirish | Iste'molchilar buziladi | Deprecate → ko'chish → o'chirish |

## Amaliyot

1. Bitta modul uchun `index` fayl yarating; boshqa modullardagi chuqur importlarni unga o'tkazing.
2. `eslint-plugin-boundaries` yoki Deptrac bilan "chuqur import taqiqlangan" qoidasini CI'ga qo'shing.
3. Boshqa modulga entity qaytarayotgan bitta joyni DTO'ga almashtiring.
4. Ochiq API'dagi eng kam ishlatiladigan eksportni toping — kerakmi?

## Manbalar

- John Ousterhout — *A Philosophy of Software Design*, 4-bob (deep modules)
- Hyrum's Law: <https://www.hyrumslaw.com>
- eslint-plugin-boundaries: <https://github.com/javierbrea/eslint-plugin-boundaries>
