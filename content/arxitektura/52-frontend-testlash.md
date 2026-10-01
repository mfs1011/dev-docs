# 52 — Frontend testlash strategiyasi

[← Oldingi: Offline va optimistik UI](51-offline-va-optimistik-ui.md) · [Mundarija](README.md) · [Keyingi: API shartnomasi kimniki →](53-api-shartnoma.md)

## Tushuncha

Frontend testlash — backend'dagidek (35-bob) **riskni qaysi test qoplashini** tanlash. Lekin frontend'ning risklari boshqa: ko'rinish, interaksiya, brauzerlar, tarmoq holatlari, erishimlilik.

| Tur | Nimani tekshiradi | Vosita | Soni |
| --- | --- | --- | --- |
| **Statik** | Tiplar, lint, a11y qoidalari | TypeScript `strict`, ESLint | Har faylda, avtomatik |
| **Birlik** | Sof funksiyalar, store, composable/hook | Vitest | Ko'p |
| **Komponent** | Komponent + shablon + interaksiya | Testing Library, TestBed + harness | O'rtacha |
| **Integratsiya** | Sahifa + router + soxta API | Komponent testlari + MSW | Kamroq |
| **E2E** | Haqiqiy brauzer, butun ilova | Playwright | Kam — asosiy oqimlar |
| **Vizual** | Piksel farqi | Playwright screenshots, Chromatic | Dizayn tizimi uchun |

Kent C. Dodds'ning "test kubogi" (testing trophy): asosiy og'irlik — **integratsiya/komponent** testlarida, chunki ular foydalanuvchi ko'rgan narsani tekshiradi va refaktorda kam buziladi.

## Nega shunday

Frontend'da implementatsiya tafsilotini test qilish — eng ko'p uchraydigan xato:

```text
// Mo'rt: ichki holatni tekshiradi
expect(component.isOpen).toBe(true)
expect(wrapper.find('.dropdown__menu--visible').exists()).toBe(true)

// Barqaror: foydalanuvchi ko'radigan narsani
await user.click(screen.getByRole('button', { name: 'Menyu' }))
expect(screen.getByRole('menu')).toBeVisible()
```

Birinchisi CSS klass yoki o'zgaruvchi nomi o'zgarsa buziladi — xulq o'zgarmagan bo'lsa ham. Ikkinchisi — faqat xulq buzilsa. Bonus: `getByRole` topa olmasa, ko'pincha erishimlilik muammosi bor.

## Psevdokod: nimani qayerda

```text
Narx/chegirma hisobi, formatlash, validator     → birlik (DOM'siz, ms)
Store: add/remove/total, effect natijasi         → birlik (framework test util bilan)
Komponent: props → ko'rinish, bosish → event     → komponent testi
Sahifa: yuklanish / xato / bo'sh / ma'lumot       → integratsiya (API soxta, MSW)
Forma: bo'sh yuborish, server 422 → maydon xatosi → integratsiya
Login → katalog → savat → checkout               → E2E (bir nechta)
Dizayn tizimi komponentlari ko'rinishi           → vizual regressiya
Rol bo'yicha ruxsat (admin ko'radi, user yo'q)   → E2E (UX) + backend testi (xavfsizlik)
```

## Psevdokod: API'ni soxtalashtirish — qaysi darajada

```text
1. Xizmat/hook'ni mock          tez, lekin HTTP qatlami tekshirilmaydi
2. HTTP testing controller      framework darajasida (Angular HttpTestingController)
3. MSW (Mock Service Worker)    tarmoq darajasida — komponent "haqiqiy" fetch qiladi;
                                 bir xil handler'lar unit, integratsiya, Storybook va dev'da
4. Haqiqiy backend (staging)    E2E uchun — eng ishonchli, eng sekin

Shartnoma: soxta javoblar OpenAPI sxemasidan generatsiya qilinsa — backend o'zgarishi testlarni darhol buzadi (54-bob)
```

## Psevdokod: beqaror (flaky) testlar

```text
Sabablar:                                Yechim:
  vaqtga bog'liq (setTimeout, sana)        → fake timers, boshqariladigan Clock
  animatsiyalar                            → testda o'chirish, prefers-reduced-motion
  asinxron yangilanish (zoneless/signal)   → avtomatik kutuvchi assertion'lar (findBy, toHaveText)
  testlar orasida umumiy holat              → har test toza muhit
  tashqi tarmoq                             → soxta API
  sleep(2000)                               → hech qachon; holatni kutish

Qoida: flaky test — darhol tuzatiladi yoki karantinga; "qayta ishga tushir" madaniyati — xavfli
```

## Framework'larda

| Daraja | Angular | React / Next | Vue |
| --- | --- | --- | --- |
| Strategiya | [71–73-boblar](../angular/71-birlik-testlari.md) | [React 43-bob](../react/43-testlash-strategiyasi.md), [Next.js 42-bob](../nextjs/42-testlash.md) | [Vue 51-bob](../vue/51-testlash-strategiyasi.md) |
| Birlik / store | Vitest + `TestBed.inject`, effect — `TestBed.tick()` — [71-bob](../angular/71-birlik-testlari.md) | Vitest — [React 44-bob](../react/44-vitest-testing-library.md) | [Vue 53-bob](../vue/53-composable-va-store-testi.md) |
| Komponent | TestBed + harness'lar — [72-bob](../angular/72-komponent-testlari.md) | Testing Library — [44-bob](../react/44-vitest-testing-library.md) | [Vue 52-bob](../vue/52-vitest-komponent-testi.md) |
| E2E | Playwright — [73-bob](../angular/73-e2e.md) | Playwright | [Vue 54-bob](../vue/54-e2e-playwright.md) |

Angular'da tekshirilgan nozik joylar framework tanlovidan qat'i nazar ibratli: `effect` testda `TestBed.tick()` siz ishlamaydi; required input bermasdan komponentni render qilish — xato (NG0950); SSR sahifada Playwright `page.route` mock'i ta'sir qilmaydi — ma'lumot serverda olingan ([Angular 73-bob](../angular/73-e2e.md)). Ya'ni test strategiyasi **render strategiyasiga** (37-bob) ham bog'liq.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Ko'p birlik testi | Tez, aniq lokalizatsiya | Integratsiya xatolari o'tadi |
| Komponent/integratsiya ko'p | Foydalanuvchi ko'zi bilan, refaktorga chidamli | Sekinroq, sozlash |
| Ko'p E2E | Eng real | Sekin, beqaror, debug qiyin |
| Snapshot testlar | Tez yoziladi | Ko'r-ko'rona yangilanadi, ma'nosiz farqlar |
| Vizual regressiya | Dizayn buzilishi ushlanadi | Infratuzilma, shovqin (shriftlar, antialiasing) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| CSS klasslar/ichki holat bilan test | Refaktorda buziladi | Rol, label, matn bo'yicha |
| Faqat "baxtli yo'l" | Xato/bo'sh/yuklanish holatlari tekshirilmaydi | Har resurs uchun to'rt holat |
| `sleep` bilan kutish | Sekin va baribir beqaror | Avtomatik kutuvchi assertion |
| Snapshot'larni o'qimasdan yangilash | Regressiya o'tib ketadi | Kichik, maqsadli snapshot yoki umuman yo'q |
| Hamma narsani E2E bilan | Sekin pipeline | Kubok: asosiy og'irlik — integratsiya |
| Frontend testi xavfsizlikni tekshiradi deb o'ylash | Ruxsat — server ishi | Backend ruxsat testlari (35-bob) |

## Amaliyot

1. Test to'plamingizni turlarga ajratib sanang — kubok shakliga o'xshaydimi?
2. CSS klass yoki ichki holatga tayanadigan 5 ta testni rol/label asosidagisiga o'tkazing.
3. Bitta ma'lumot sahifasi uchun yuklanish, xato, bo'sh va ma'lumot holatlarining integratsiya testini yozing.
4. CI'dagi eng beqaror testni toping va sababini aniqlang.

## Manbalar

- Kent C. Dodds — *The Testing Trophy* <https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications>
- Testing Library — *Guiding Principles* <https://testing-library.com/docs/guiding-principles>
- MSW <https://mswjs.io>
