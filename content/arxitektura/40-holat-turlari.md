# 40 — Holat turlari

[← Oldingi: Komponent API dizayni](39-komponent-api.md) · [Mundarija](README.md) · [Keyingi: Reaktivlik modellari →](41-reaktivlik-modellari.md)

## Tushuncha

Frontend'dagi "holat" — bitta narsa emas. Uni turlarga ajratish — holat boshqaruvining eng muhim qadami:

| Tur | Nima | Egasi | Qayerda saqlash |
| --- | --- | --- | --- |
| **Server holati** | Mahsulotlar, buyurtmalar — serverdagi ma'lumotning **nusxasi** | Server | So'rov keshi (`httpResource`, TanStack Query) |
| **URL holati** | Sahifa, filtr, tanlangan tab, qidiruv | Foydalanuvchi (havola) | Query/path parametrlar |
| **Forma holati** | Kiritilayotgan qiymatlar, touched, xatolar | Forma | Forma kutubxonasi |
| **Global klient holati** | Joriy foydalanuvchi, tema, savat (offline) | Klient | Store/xizmat |
| **Lokal UI holati** | Modal ochiq, hover, akkordeon | Komponent | Komponent signali/state |

## Nega shunday

Klassik xato — hammasini bitta global store'ga yig'ish: mahsulotlar ro'yxati, filtrlar, modal holati, forma qoralamasi — hammasi `store`da. Natijada:

- **Server holati** qo'lda keshlanadi — eskirish, qayta yuklash, loading/error — hammasi qo'lda.
- **URL holati** store'da — havola ulashilmaydi, "orqaga" ishlamaydi.
- **Lokal holat** global — hamma komponent bir-biriga bog'lanadi.

Har tur o'z vositasiga ega — va har biri boshqa muammoni yechadi.

## Psevdokod: qaror daraxti

```text
Bu ma'lumot serverdan keladimi?
├── Ha → server holati → so'rov keshi (o'z store'ingizga nusxalamang)
└── Yo'q
    ├── Havola ulashilganda saqlanishi kerakmi? → URL
    ├── Forma kiritmasimi?                        → forma holati
    ├── Bir nechta uzoq komponent ishlatadimi?     → global store
    └── Aks holda                                  → lokal holat (eng yaqin komponentda)
```

## Psevdokod: server holati — alohida muammo

```text
Server holatining xususiyatlari (klient holatida yo'q):
  - Eskiradi (boshqa foydalanuvchi o'zgartirdi)
  - Asinxron: loading / error / data
  - Bir nechta komponent bir xil ma'lumotni so'raydi → takrorlanmasin
  - Mutatsiyadan keyin invalidatsiya
  - Parametr o'zgarsa — eski so'rovni bekor qilish

Bular so'rov keshi kutubxonalarining vazifasi — qo'lda qayta yozmang (42-bob).
```

## Psevdokod: hosila holat — saqlamang

```text
// Yomon: hosila qiymatni alohida saqlash
state = { items, total, count, isEmpty }
addItem(x): items.push(x); total += x.price; count += 1; isEmpty = false    // birortasi unutiladi

// Yaxshi: faqat manba saqlanadi, qolgani hisoblanadi
items = signal([])
total = computed(() => sum(items()))
isEmpty = computed(() => items().length === 0)
```

Qoida: **minimal manba holat + hosilalar**. Bir haqiqatni ikki joyda saqlash — nomuvofiqlik.

## Framework'larda

| Tur | Angular | React | Vue |
| --- | --- | --- | --- |
| Server | `httpResource`, `resource` — [21](../angular/21-http-resource.md), [20-bob](../angular/20-resource.md) | TanStack Query — [32-bob](../react/32-tanstack-query.md) | composable/Pinia Colada — [44-bob](../vue/44-http-qatlami.md) |
| URL | Input binding — [41-bob](../angular/41-parametrlar.md) | React Router search params — [35-bob](../react/35-react-router.md) | Vue Router query — [39-bob](../vue/39-router-asoslari.md) |
| Forma | Signal Forms — [48-bob](../angular/48-signal-forms-model.md) | [38-bob](../react/38-formalar.md) | [45-bob](../vue/45-formalar-arxitekturasi.md) |
| Global | `@Service()` signal store, NgRx — [60–61](../angular/60-signal-xizmatlar.md) | Zustand, Context — [36](../react/36-zustand.md), [37-bob](../react/37-holat-qayerda.md) | Pinia — [42-bob](../vue/42-pinia.md) |
| Hosila | `computed`, `linkedSignal` — [18-bob](../angular/18-linked-signal.md) | render ichida hisoblash, `useMemo` | `computed` — [Vue 10-bob](../vue/10-computed.md) |

Angular'da tekshirilgan tuzoq — URL holatining nozik joyi: router input binding'da yo'q parametr standart qiymat emas, `undefined` beradi ([Angular 41-bob](../angular/41-parametrlar.md)). URL — holat manbai, lekin uning "yo'qligi" ham qiymat.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Hamma narsa global store'da | Bitta joy, DevTools | Server holatini qo'lda, bog'lanish, "hammasi hammasiga ta'sir" |
| Turlarga ajratish | Har tur o'z vositasida, kam kod | Bir nechta vositani bilish kerak |
| Hosilalarni saqlash | O'qish tez (nazariyada) | Nomuvofiqlik |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Server ma'lumotini store'ga nusxalash | Eskirish, qo'lda sinxron | So'rov keshi |
| Filtr faqat komponent holatida | Havola ulashilmaydi | URL |
| Modal holati global store'da | Keraksiz bog'lanish | Lokal |
| Hosila qiymatni saqlash | Nomuvofiqlik | `computed` |
| Forma qoralamasini store'da | Forma kutubxonasi bilan ikki manba | Forma holati (kerak bo'lsa persist) |

## Amaliyot

1. Global store'ingizdagi har maydonni jadvalga yozing: qaysi turga tegishli? Nechtasi aslida server yoki URL holati?
2. Bitta ro'yxat filtrini URL'ga ko'chiring.
3. Store'dagi bitta server ma'lumotini so'rov keshiga o'tkazing.
4. Saqlangan hosila qiymatlarni toping va `computed`ga almashtiring.

## Manbalar

- Kent C. Dodds — *Application State Management with React* <https://kentcdodds.com/blog/application-state-management-with-react>
- TkDodo — *React Query as a State Manager* <https://tkdodo.eu/blog/react-query-as-a-state-manager>
- Angular — *Signals* <https://angular.dev/guide/signals>
