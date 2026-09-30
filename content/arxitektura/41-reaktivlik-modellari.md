# 41 — Reaktivlik modellari

[← Oldingi: Holat turlari](40-holat-turlari.md) · [Mundarija](README.md) · [Keyingi: Ma'lumot qatlami →](42-malumot-qatlami.md)

## Tushuncha

Reaktivlik — holat o'zgarganda UI'ni **avtomatik** yangilash. Barcha zamonaviy framework'lar buni qiladi, lekin **qanday** — turlicha, va bu farq kod yozish uslubiga, unumdorlikka va xato turlariga ta'sir qiladi.

| Model | G'oya | Framework |
| --- | --- | --- |
| **Virtual DOM + qayta render** | Holat o'zgarsa komponent funksiyasi qayta ishlaydi, yangi daraxt eskisi bilan solishtiriladi | React |
| **Proxy asosidagi kuzatish** | Ob'ekt o'qishlari avtomatik kuzatiladi, faqat bog'liq joylar yangilanadi | Vue |
| **Signallar (nozik donador)** | Har qiymat — signal; bog'liqlik grafi aniq, faqat o'qigan joy yangilanadi | Angular (v16+), Solid, Preact Signals, Vue ichida ham |
| **Kompilyator** | Build vaqtida kod tahlil qilinib, yangilash kodi generatsiya | Svelte, React Compiler (memoizatsiya), Vue Vapor |

## Nega shunday

Farq — **qancha ish** qilinadi va **kim** optimallashtiradi:

```text
Holat: count o'zgardi. Sahifada 1000 element, faqat bittasi count'ni ko'rsatadi.

VDOM:     komponent (va bolalari) qayta render → yangi virtual daraxt → diff → 1 ta DOM o'zgarishi
          optimallashtirish: memo, useMemo, useCallback (yoki React Compiler avtomatik)
Signal:   count ni o'qigan joy (1 ta matn tuguni) yangilanadi — qolganlari tegilmaydi
          optimallashtirish: odatda kerak emas
```

VDOM modeli — **oddiy mental model** ("UI = f(state)", har renderda hammasini qayta hisoblayman). Signal modeli — **aniq bog'liqliklar**, lekin o'z qoidalari bilan (o'qish kontekstlari, mutatsiya).

## Psevdokod: har modelning tuzog'i

```text
// Signal / proxy: mutatsiya sezilmasligi
items = signal([1, 2])
items().push(3)          // signal bilmaydi — mos yozuvlar tenglashuvi (===) o'zgarmadi
items.update(a => [...a, 3])      // to'g'ri — yangi massiv

// VDOM: har renderda yangi ob'ekt → keraksiz qayta renderlar
<Child options={{ sort: "asc" }} />     // har render — yangi ob'ekt, Child memo'lansa ham qayta render
// yechim: useMemo yoki React Compiler

// Hammasida: hosila holatni effect bilan sinxronlash
effect(() => total.set(sum(items())))    // ortiqcha — computed yetadi
```

## Psevdokod: change detection strategiyalari

```text
Angular tarixi — reaktivlik modellarining yaxshi misoli:
  zone.js (eski)   : har async hodisadan keyin butun daraxtni tekshirish ("nimadir o'zgargan bo'lishi mumkin")
  OnPush           : faqat input o'zgarsa yoki hodisa bo'lsa
  Signals + zoneless (v22 sukut): faqat signal o'zgargan joy — aniq bilinadi
```

Bu yo'nalish — **taxmin qilishdan aniq bilishga**: framework "nima o'zgardi?" savoliga javobni kuzatish orqali biladi, butun ilovani tekshirib topmaydi.

## Framework'larda

| Mavzu | Angular | React | Vue |
| --- | --- | --- | --- |
| Asosiy model | Signallar — [16-bob](../angular/16-signal-asoslari.md), zoneless — [23-bob](../angular/23-zoneless.md) | Render modeli — [5](../react/05-render-modeli.md), [6-bob](../react/06-reaktivlik-react-yoli.md) | Proxy — [7](../vue/07-reaktivlik-mental-modeli.md), [17-bob](../vue/17-reaktivlik-chuqur.md) |
| Hosila | `computed` | Render ichida hisoblash / `useMemo` — [22-bob](../react/22-usememo-usecallback.md) | `computed` — [10-bob](../vue/10-computed.md) |
| Yon ta'sir | `effect` — [17-bob](../angular/17-effect.md) | `useEffect` — [27–29](../react/27-useeffect-asoslar.md) | `watch` — [16-bob](../vue/16-watch-va-watcheffect.md) |
| Kompilyator | — | React Compiler — [7-bob](../react/07-react-compiler.md) | Vapor mode — [47-bob](../vue/47-vapor-mode.md) |
| Tuzoqlar | Mutatsiya, reaktiv kontekst — [19-bob](../angular/19-reaktiv-kontekst.md) | "Effekt kerak emas" — [28-bob](../react/28-effekt-kerak-emas.md) | `ref` va `reactive` farqi |

Umumiy qoida uchala framework'da ham bir xil: **hosila holat — computed/render, effect — faqat tashqi dunyo bilan sinxronlash uchun** (DOM, localStorage, analitika).

## Trade-off

| Model | Yutuq | Narx |
| --- | --- | --- |
| VDOM | Oddiy mental model, oqim aniq | Keraksiz renderlar, qo'lda memoizatsiya (kompilyatorsiz) |
| Proxy | Tabiiy JS sintaksisi | Destrukturizatsiyada reaktivlik yo'qolishi, "sehr" |
| Signallar | Aniq, tez, kam optimallashtirish | Chaqiruv sintaksisi `count()`, o'qish konteksti qoidalari |
| Kompilyator | Eng kam runtime ish | Build'ga bog'liq, debug qiyinroq |

Framework tanlashda reaktivlik modeli **hal qiluvchi emas** — hammasi tez. Hal qiluvchisi — jamoa uni tushunishi va tuzoqlarini bilishi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Signal/proxy ichidagi massivni mutatsiya | UI yangilanmaydi | Yangi ob'ekt/massiv |
| Hosilani effect bilan sinxronlash | Qo'shimcha sikl, kechikish | `computed` |
| React'da har renderda yangi ob'ekt props | Keraksiz renderlar | Memo yoki kompilyator |
| O'lchovsiz memoizatsiya | Murakkablik, foyda yo'q | Profiler bilan |
| Framework modelini boshqasiga "ko'chirish" | Idiomatik bo'lmagan kod | Har framework'ning o'z qoidalari |

## Amaliyot

1. Loyihangizdagi barcha effect/useEffect/watch'larni sanang: nechtasi aslida `computed` bo'lishi kerak?
2. DevTools profiler bilan bitta sekin interaksiyada nechta komponent qayta render/tekshirilganini o'lchang.
3. Massiv/ob'ekt mutatsiyasi bor joylarni qidiring.
4. Ikki framework'da bir xil kichik komponentni yozib, yangilanish mexanizmini solishtiring.

## Manbalar

- Ryan Carniato — *A Hands-on Introduction to Fine-Grained Reactivity* <https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf>
- React — *Preserving and Resetting State*, *You Might Not Need an Effect*
- Angular — *Signals* va *Zoneless* qo'llanmalari
