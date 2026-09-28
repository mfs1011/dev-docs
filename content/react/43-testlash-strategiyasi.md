# 43 — Testlash strategiyasi

[← Oldingi: Erishimlilik](42-erishimlilik.md) · [Mundarija](README.md) · [Keyingi: Vitest va Testing Library →](44-vitest-testing-library.md)

## Tushuncha

Test yozishdan oldingi savol: **nimani test qilamiz?** Noto'g'ri javob ikki tomonlama zarar keltiradi — testlar vaqt oladi, har refaktoringda sinadi, lekin haqiqiy xatolarni ushlamaydi.

Uch daraja:

| Daraja | Nima tekshiriladi | Vosita | Tezlik |
| --- | --- | --- | --- |
| **Birlik** | Toza funksiya, hook, store, reducer | Vitest | ~ms |
| **Komponent/integratsiya** | Komponent + bolalari + store birga | Vitest + Testing Library | ~10–50 ms |
| **E2E** | Haqiqiy brauzerda foydalanuvchi ssenariysi | Playwright | ~sekundlar |

## Nega shunday: nimani test qilish kerak

Foydali mezon — **"agar buzilsa, kim sezadi?"**

| Kod | Test kerakmi | Sabab |
| --- | --- | --- |
| Narx hisoblash, chegirma, soliq | **Ha, albatta** | Buzilsa pul yo'qoladi va sezilmasligi mumkin |
| Reducer va holat o'tishlari (19-bob) | **Ha** | Toza funksiya — test arzon |
| Custom hooklar (26-bob) | **Ha** | Ko'p joyda ishlatiladi |
| Store action'lari (36-bob) | **Ha** | Biznes mantiq |
| Shartli ko'rinish (loading/error/empty) | Ha, komponent testi | Ko'p kombinatsiya |
| Kritik oqim (kirish, buyurtma, to'lov) | Ha, E2E | Butun zanjir |
| CSS class nomlari, joylashuv | Yo'q | Har dizayn o'zgarishida sinadi |
| Tashqi kutubxona ishlashi | Yo'q | Ularning o'z testlari bor |
| Oddiy props uzatish | Yo'q | Qiymati past |

Qoida: **ko'rinishni emas, xatti-harakatni test qiling.** "Tugma `btn-primary` class'iga ega" — yomon test. "Tugma bosilganda savatga mahsulot qo'shiladi" — yaxshi test.

## Kod: uch daraja misolda

```js
// 1. Birlik: toza mantiq
import { calculateTotal } from '@/shared/lib/pricing'

it('chegirma 10% qo\'llanadi', () => {
  expect(calculateTotal([{ price: 1000, qty: 2 }], { discount: 0.1 })).toBe(1800)
})
```

```jsx
// 2. Komponent: foydalanuvchi ko'radigan xatti-harakat
it('bo\'sh ro\'yxatda "topilmadi" ko\'rsatadi', () => {
  render(<UserList users={[]} />)

  expect(screen.getByText(/topilmadi/i)).toBeVisible()
})
```

```js
// 3. E2E: butun oqim
test('foydalanuvchi buyurtma beradi', async ({ page }) => {
  await page.goto('/products')
  await page.getByRole('button', { name: 'Savatga' }).first().click()
  await page.getByRole('link', { name: /savat/i }).click()
  await page.getByRole('button', { name: /buyurtma/i }).click()

  await expect(page.getByText(/qabul qilindi/i)).toBeVisible()
})
```

## Muhandislik nuqtai nazari: piramida yoki trofey

Klassik "test piramidasi" ko'p birlik, kam E2E deydi. Frontend'da **"testing trophy"** ko'proq mos keladi:

```
       E2E          ← kam, faqat kritik oqimlar
  ██ Integratsiya   ← ENG KO'P: komponent + store + router birga
     Birlik         ← toza mantiq uchun
    Statik          ← TypeScript + ESLint (test emas, lekin xato ushlaydi)
```

Sabab: frontend xatolarining katta qismi **bo'laklar orasidagi aloqada** bo'ladi (komponent store'dan noto'g'ri o'qidi, router params tipi o'zgardi), alohida funksiya ichida emas.

Amaliy natija: komponentni bolalari bilan birga test qiling (`shallow` render qilmang), store'ni mock qilmang — haqiqiysini ishlating, faqat **tarmoqni** mock qiling (44-bob).

## Muhandislik nuqtai nazari: qancha qamrov kerak

Qamrov foizi — **maqsad emas, o'lchov**. 100% qamrov hech narsani kafolatlamaydi: har qatorni bajarib, hech narsa tekshirmaslik mumkin.

| Kod turi | Maqsad |
| --- | --- |
| Biznes mantiq (`lib/`, store, reducer) | 80–100% |
| Hooklar | 70–90% |
| Sahifa komponentlari | Asosiy holatlar |
| Dizayn tizimi (`shared/ui`) | Kritiklari (Button, Input, Modal) |
| Statik ko'rinish komponentlari | Past, muhim emas |

CI'da qamrov pasayishini bloklash faqat biznes mantiq papkalari uchun mantiqiy.

## Muhandislik nuqtai nazari: testni qachon yozish

| Vaziyat | Tavsiya |
| --- | --- |
| Xato topildi | Avval xatoni ko'rsatadigan test, keyin tuzatish |
| Murakkab mantiq (hisob, holat mashinasi) | Kod bilan birga (TDD mazmunli bo'ladigan joy) |
| Prototip, dizayn o'zgaradi | Keyinroq |
| Refaktoring oldidan | Mavjud xatti-harakatni qamrang |
| Kritik oqim | Har doim, E2E darajasida |

Eng foydali odat: **xatoni test bilan yopish** — ikki oyda testlar to'plami ilovangizning haqiqiy og'riq nuqtalarini aks ettiradi.

## Muhandislik nuqtai nazari: sinadigan testlar

Test refaktoringda sinsa va xato yo'q bo'lsa — test noto'g'ri yozilgan:

```jsx
// ✗ Ichki tuzilmaga bog'langan
expect(wrapper.state.internalCounter).toBe(3)
expect(container.querySelector('.list > div:nth-child(2) span').textContent).toBe('Aziz')

// ✓ Foydalanuvchi ko'radigan natijaga bog'langan
expect(screen.getByRole('listitem', { name: /aziz/i })).toBeVisible()
```

Qoida: test faqat **komponentning ommaviy shartnomasi** bilan ishlasin (props, hodisalar, ko'rinadigan matn, rollar) — ichki holat va DOM tuzilmasi bilan emas.

## Muhandislik nuqtai nazari: React'ga xos test qarorlari

| Savol | Javob |
| --- | --- |
| Hookni alohida test qilaymi? | Murakkab bo'lsa — ha (`renderHook`), oddiy bo'lsa — komponent orqali |
| Context provider'ni mock qilaymi? | Yo'q — haqiqiysi bilan o'rang |
| Router kerakmi? | `MemoryRouter` bilan o'rang |
| TanStack Query'ni mock qilaymi? | Yo'q — `QueryClientProvider` + MSW |
| `useEffect` ni kutish | `findBy*` yoki `waitFor` |
| Vaqt (`setTimeout`) | `vi.useFakeTimers()` |

Umumiy tamoyil: **tashqi dunyoni mock qiling (tarmoq, vaqt, brauzer API), o'z kodingizni emas.**

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Hamma narsani E2E bilan test qilish | Sekin, beqaror (flaky) | Piramidani balanslang |
| CSS class va tuzilmani test qilish | Dizayn o'zgarishida sinadi | Rol va matn bo'yicha |
| Har bolani mock qilish (shallow) | Integratsiya tekshirilmaydi | To'liq render |
| 100% qamrovni maqsad qilish | Ma'nosiz testlar | Kritik kodga yo'naltiring |
| Faqat "baxtli yo'l" ni test qilish | Xato holatlari sinalmaydi | Loading/error/empty ham |
| Testlar bir-biriga bog'liq | Tartibga sezgir, beqaror | Har testda toza holat |
| Test yozishni "keyinga" qoldirish | Hech qachon yozilmaydi | Har xato uchun bitta test |

## Amaliyot

1. Loyihangizdagi kodni yuqoridagi jadval bo'yicha uch guruhga ajrating: albatta test kerak / foydali / kerak emas.
2. Oxirgi uchta production xatosini eslang: qaysi daraja testi ularni ushlardi?
3. Bitta kritik oqimni (kirish yoki buyurtma) qadamlar ro'yxati sifatida yozing — bu E2E testingiz skeleti bo'ladi.
4. Mavjud testlaringizdan bittasi ichki tuzilmaga bog'langan bo'lsa, uni rol/matn bo'yicha qayta yozing.
5. Jamoangiz uchun "nimani test qilamiz" hujjatini bir sahifada yozing.

## Rasmiy hujjat

- React testlash: <https://react.dev/learn/testing>
- Testing Library tamoyillari: <https://testing-library.com/docs/guiding-principles>
- Vitest: <https://vitest.dev>
