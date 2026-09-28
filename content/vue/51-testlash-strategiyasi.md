# 51 — Testlash strategiyasi

[← Oldingi: TS + Options API](50-ts-options-api.md) · [Mundarija](README.md) · [Keyingi: Vitest va komponent testi →](52-vitest-komponent-testi.md)

## Tushuncha

Test yozishdan oldin javob berilishi kerak bo'lgan savol: **nimani test qilamiz?** Noto'g'ri javob ikki tomonlama zarar keltiradi — testlar ham vaqt oladi, ham har refaktoringda sinadi, lekin haqiqiy xatolarni ushlamaydi.

Frontend'da uch daraja bor:

| Daraja | Nima tekshiriladi | Vosita | Tezlik |
| --- | --- | --- | --- |
| **Birlik (unit)** | Toza funksiya, composable, store, validatsiya | Vitest | ~ms |
| **Komponent** | Komponent DOM'da to'g'ri ishlaydimi | Vitest + Testing Library / test-utils | ~10–50 ms |
| **E2E** | Haqiqiy brauzerda foydalanuvchi ssenariysi | Playwright | ~sekundlar |

## Nega shunday: nimani test qilish kerak

Foydali mezon — **"agar buzilsa, kim sezadi?"**

| Kod | Test kerakmi | Sabab |
| --- | --- | --- |
| Narx hisoblash, chegirma, validatsiya qoidalari | **Ha, albatta** | Buzilsa pul yo'qoladi, sezilmasligi mumkin |
| Composable (`useFetch`, `useCart`) | **Ha** | Ko'p joyda ishlatiladi |
| Store action'lari | **Ha** | Biznes mantiq shu yerda |
| Shartli ko'rinish (`v-if` mantiqi) | Ha, komponent testi | Ko'p holat kombinatsiyasi |
| Kritik oqim (kirish, buyurtma, to'lov) | Ha, E2E | Butun zanjir ishlashi kerak |
| Class nomlari, CSS, matn joylashuvi | Yo'q | Har dizayn o'zgarishida sinadi |
| Tashqi kutubxona ishlashi | Yo'q | Ular o'z testiga ega |
| Oddiy props uzatish | Yo'q | Qiymati past |

Qoida: **ko'rinishni emas, xatti-harakatni test qiling.** "Tugma `btn-primary` class'iga ega" — yomon test. "Tugma bosilganda savatga mahsulot qo'shiladi" — yaxshi test.

## Kod: qaysi daraja qachon

```js
// 1. Birlik: toza mantiq — eng arzon, eng barqaror
import { calculateTotal } from '@/lib/pricing'

it('chegirma 10% qo\'llanadi', () => {
  expect(calculateTotal([{ price: 1000, qty: 2 }], { discount: 0.1 })).toBe(1800)
})
```

```js
// 2. Komponent: foydalanuvchi ko'radigan xatti-harakat
it('bo\'sh ro\'yxatda "topilmadi" ko\'rsatadi', () => {
  const wrapper = mount(UserList, { props: { users: [] } })

  expect(wrapper.text()).toContain('topilmadi')
})
```

```js
// 3. E2E: butun oqim, haqiqiy brauzer
test('foydalanuvchi buyurtma beradi', async ({ page }) => {
  await page.goto('/products')
  await page.getByRole('button', { name: 'Savatga' }).first().click()
  await page.getByRole('link', { name: 'Savat' }).click()
  await page.getByRole('button', { name: 'Buyurtma berish' }).click()

  await expect(page.getByText('Buyurtmangiz qabul qilindi')).toBeVisible()
})
```

## Muhandislik nuqtai nazari: piramida yoki trofey

Klassik "test piramidasi" ko'p birlik, kam E2E deydi. Frontend'da esa **"testing trophy"** yondashuvi ko'proq mos keladi:

```
       E2E          ← kam, faqat kritik oqimlar
  ██ Integratsiya   ← ENG KO'P: komponent + store + router birga
     Birlik         ← toza mantiq uchun
    Statik          ← TypeScript + ESLint (test emas, lekin xato ushlaydi)
```

Sabab: frontend'dagi xatolarning katta qismi **bo'laklar orasidagi aloqada** bo'ladi (komponent store'dan noto'g'ri o'qidi, router params tipini o'zgartirdi), alohida funksiya ichida emas.

Amaliy natija: bitta komponentni uning bolalari bilan birga (`shallow: false`) test qiling, store'ni mock qilmang — haqiqiysini ishlating (43-bob), faqat tarmoqni mock qiling.

## Muhandislik nuqtai nazari: qancha qamrov kerak

Qamrov (coverage) foizi — **maqsad emas, o'lchov**. 100% qamrov hech narsani kafolatlamaydi: har qatorni bajarib, hech narsa tekshirmaslik mumkin.

Amaliy yondashuv:

| Kod turi | Maqsad |
| --- | --- |
| Biznes mantiq (`lib/`, `stores/`) | 80–100% |
| Composable'lar | 70–90% |
| Komponentlar | Kritiklari — to'liq, qolgani — asosiy holatlar |
| Ko'rinish komponentlari (`Ui*`) | Past, muhim emas |

CI'da qamrov pasayishini bloklash (`--coverage.thresholds`) foydali, lekin faqat biznes mantiq papkalari uchun.

## Muhandislik nuqtai nazari: testni qachon yozish

| Vaziyat | Tavsiya |
| --- | --- |
| Xato topildi | Avval xatoni ko'rsatadigan test yozing, keyin tuzating — u qayta chiqmaydi |
| Murakkab mantiq (hisob, holat mashinasi) | Kod bilan birga (TDD mazmunli bo'ladigan joy) |
| Prototip, dizayn hali o'zgaradi | Keyinroq — hozir yozilgan test ertaga o'chiriladi |
| Refaktoring oldidan | Mavjud xatti-harakatni qamrab oling, keyin qayta yozing |
| Kritik oqim (to'lov, kirish) | Har doim, E2E darajasida |

Eng foydali odat: **xatoni test bilan yopish.** Ikki oyda testlar to'plami sizning ilovangizning haqiqiy og'riq nuqtalarini aks ettiradi.

## Muhandislik nuqtai nazari: sinadigan testlar (brittle tests)

Test refaktoringda sinsa va xato yo'q bo'lsa — bu test noto'g'ri yozilgan:

```js
// ✗ Ichki tuzilmaga bog'langan
expect(wrapper.vm.internalCounter).toBe(3)
expect(wrapper.find('.list > div:nth-child(2) > span').text()).toBe('Aziz')

// ✓ Foydalanuvchi ko'radigan natijaga bog'langan
expect(wrapper.getByRole('listitem', { name: 'Aziz' })).toBeVisible()
```

Qoida: test faqat **komponentning ommaviy shartnomasi** bilan ishlasin (props, emit, ko'rinadigan matn, rollar) — ichki holat va DOM tuzilmasi bilan emas. Shunda ichkarini istagancha qayta yozasiz, testlar yashil qoladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Hamma narsani E2E bilan test qilish | Sekin, beqaror (flaky), sabab topish qiyin | Piramidani balanslang |
| Class nomlari va CSS'ni test qilish | Har dizayn o'zgarishida sinadi | Rol va matn bo'yicha qidiring |
| `wrapper.vm` orqali ichki holatni tekshirish | Refaktoringda sinadi | Ko'rinadigan natija |
| Store'ni har testda mock qilish | Haqiqiy integratsiya tekshirilmaydi | Haqiqiy store + mock tarmoq |
| 100% qamrovni maqsad qilish | Ma'nosiz testlar yoziladi | Kritik kodga yo'naltiring |
| Test yozishni "keyinga" qoldirish | Hech qachon yozilmaydi | Har xato uchun bitta test |
| Testlar bir-biriga bog'liq (tartibga sezgir) | Beqaror natija | Har testda toza holat (`beforeEach`) |

## Amaliyot

1. Loyihangizdagi kodni yuqoridagi jadval bo'yicha uch guruhga ajrating: albatta test kerak / foydali / kerak emas.
2. Oxirgi uchta production xatosini eslang. Ularning qaysi biri qaysi daraja testi bilan ushlanardi?
3. Bitta kritik oqimni (kirish yoki buyurtma) yozib chiqing: E2E test uchun qadamlar ro'yxati.
4. Mavjud testlaringizdan bittasini toping, u `vm` yoki CSS selektoriga bog'langan bo'lsa — rol/matn bo'yicha qayta yozing.

## Rasmiy hujjat

- Testlash: <https://vuejs.org/guide/scaling-up/testing.html>
- Testing Library tamoyillari: <https://testing-library.com/docs/guiding-principles>
- Vitest: <https://vitest.dev>
