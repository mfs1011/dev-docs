# 54 — E2E testlar: Playwright

[← Oldingi: Composable va store testi](53-composable-va-store-testi.md) · [Mundarija](README.md) · [Keyingi: Kod sifati →](55-kod-sifati.md)

## Tushuncha

E2E (end-to-end) test haqiqiy brauzerda haqiqiy ilovani ochadi va foydalanuvchi qiladigan ishni takrorlaydi: bosadi, yozadi, kutadi, natijani ko'radi.

```bash
npm init playwright@latest
```

```js
// playwright.config.js
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',           // yiqilganda qadamlar yozuvi
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],

  // Testdan oldin ilovani ko'taradi
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
})
```

`webServer` bilan **production build** ustida test qiling — dev serverdan farqli natijalar shu yerda ushlanadi (06-bob).

## Kod: birinchi test

```js
// e2e/cart.spec.js
import { expect, test } from '@playwright/test'

test('foydalanuvchi mahsulotni savatga qo\'shadi', async ({ page }) => {
  await page.goto('/products')

  await page.getByRole('button', { name: 'Savatga' }).first().click()

  await expect(page.getByTestId('cart-count')).toHaveText('1')
})
```

Playwright **avtomatik kutadi**: element paydo bo'lishini, ko'rinishini, bosilishga tayyor bo'lishini. `waitForTimeout` deyarli hech qachon kerak emas.

## Kod: selektorlar tartibi

```js
// 1. Rol va nom — eng barqaror, erishimlilikni ham tekshiradi
page.getByRole('button', { name: 'Saqlash' })
page.getByRole('link', { name: 'Savat' })
page.getByRole('heading', { level: 1 })

// 2. Label bo'yicha (formalar)
page.getByLabel('Pochta')

// 3. Matn
page.getByText('Buyurtma qabul qilindi')

// 4. Test ID — razmetka o'zgarishidan himoya (25-bob)
page.getByTestId('cart-count')

// 5. CSS — oxirgi chora
page.locator('.cart__count')
```

Birinchi ikkitasini afzal ko'ring: ular ilovangiz skrinriderlar uchun ham ishlashini bilvosita tekshiradi (64-bob).

## Kod: autentifikatsiya holatini qayta ishlatish

Har testda qayta kirish — sekin. Playwright holatni faylga saqlab, qayta ishlatishga imkon beradi:

```js
// e2e/auth.setup.js
import { expect, test as setup } from '@playwright/test'

const authFile = 'e2e/.auth/user.json'

setup('kirish', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Pochta').fill('test@example.com')
  await page.getByLabel('Parol').fill('parol123')
  await page.getByRole('button', { name: 'Kirish' }).click()

  await expect(page.getByRole('heading', { name: 'Boshqaruv paneli' })).toBeVisible()

  await page.context().storageState({ path: authFile })
})
```

```js
// playwright.config.js
projects: [
  { name: 'setup', testMatch: /auth\.setup\.js/ },
  {
    name: 'chromium',
    dependencies: ['setup'],
    use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' },
  },
]
```

`e2e/.auth/` ni `.gitignore` ga qo'shing.

## Kod: tarmoqni boshqarish

```js
test('server xatosida xabar ko\'rsatiladi', async ({ page }) => {
  await page.route('**/api/users', (route) =>
    route.fulfill({ status: 500, body: JSON.stringify({ message: 'Server xatosi' }) }),
  )

  await page.goto('/users')

  await expect(page.getByText(/qayta urinish/i)).toBeVisible()
})

test('sekin tarmoqda skelet ko\'rinadi', async ({ page }) => {
  await page.route('**/api/users', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await route.continue()
  })

  await page.goto('/users')

  await expect(page.getByTestId('skeleton')).toBeVisible()
})
```

E2E'da **haqiqiy backend** bilan ishlash ham mumkin (ishonchliroq, lekin sekin va ma'lumot tayyorlash kerak), yoki tarmoqni to'liq mock qilish (tez, lekin integratsiya qamrovi kamayadi). Amaliy yechim — aralash: asosiy oqim haqiqiy backend bilan (test muhitida), chekka holatlar (xato, sekinlik) mock bilan.

## Kod: foydali tekshiruvlar

```js
// URL va navigatsiya
await expect(page).toHaveURL('/checkout')
await expect(page).toHaveTitle(/Savat/)

// Ko'rinish
await expect(page.getByRole('alert')).toBeVisible()
await expect(page.getByRole('button', { name: 'Yuborish' })).toBeDisabled()
await expect(page.getByTestId('total')).toHaveText('18 000 so\'m')

// Ro'yxat
await expect(page.getByRole('listitem')).toHaveCount(3)

// Skrinshot solishtirish (vizual regressiya)
await expect(page).toHaveScreenshot('cart.png', { maxDiffPixels: 100 })
```

## Kod: CI'da ishlatish

```yaml
# .github/workflows/e2e.yml
name: E2E

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

Yiqilgan testning `trace` faylini yuklab olib, `npx playwright show-trace` bilan qadamma-qadam ko'rish mumkin — bu E2E'ning eng kuchli debug vositasi.

## Muhandislik nuqtai nazari: nechta E2E test kerak

E2E testlar qimmat: sekin ishlaydi, ko'proq buziladi, ta'mirlash vaqt oladi. Shuning uchun ularni **kritik oqimlarga** cheklang:

| Ilova turi | E2E qamrovi |
| --- | --- |
| E-commerce | Ro'yxatdan o'tish, katalog → savat → to'lov, buyurtma tarixi |
| Admin panel | Kirish, ro'yxat filtri, yaratish/tahrirlash/o'chirish |
| SaaS | Onboarding, asosiy ish oqimi, obuna |

10–20 ta yaxshi E2E test 200 ta yomonidan foydaliroq. Qolgan holatlarni komponent testlari qoplaydi (52-bob).

## Muhandislik nuqtai nazari: beqarorlik (flakiness) bilan kurash

| Sabab | Yechim |
| --- | --- |
| Qat'iy kutish (`waitForTimeout`) | Playwright avtomatik kutuvidan foydalaning |
| Animatsiya tugashini kutmaslik | `toBeVisible()` va `expect` retry mexanizmi |
| Testlar bir xil ma'lumotni o'zgartiradi | Har testga o'z ma'lumoti (noyob email, `test-${Date.now()}`) |
| Parallel ishga tushirishda to'qnashuv | `fullyParallel` + izolyatsiya, yoki `workers: 1` kritik testlar uchun |
| Tarmoq sekinligi | `route` bilan mock yoki `timeout` ni oshirish |
| Avvalgi testdan qolgan holat | `storageState` ni har guruh uchun tozalash |

CI'da `retries: 2` — pragmatik yechim, lekin doim yiqiladigan testni "retry bilan yashirmang": sababi topilishi kerak.

## Muhandislik nuqtai nazari: E2E va erishimlilik

`getByRole` bilan yozilgan testlar bir vaqtning o'zida erishimlilikni ham tekshiradi: agar tugma `<div onclick>` bo'lsa, `getByRole('button')` uni topmaydi va test yiqiladi.

Bundan tashqari, avtomatik a11y tekshiruvini qo'shish mumkin:

```bash
npm i -D @axe-core/playwright
```

```js
import AxeBuilder from '@axe-core/playwright'

test('bosh sahifada a11y buzilishi yo\'q', async ({ page }) => {
  await page.goto('/')

  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})
```

64-bobda bu mavzu batafsil.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `waitForTimeout(2000)` | Beqaror va sekin | Avtomatik kutuv / `expect` |
| CSS selektorlarga tayanish | Razmetka o'zgarsa sinadi | `getByRole` / `getByTestId` |
| Dev serverda test qilish | Production build'dan farq qiladi | `webServer` bilan `preview` |
| Har testda UI orqali kirish | Sekin | `storageState` |
| Testlar umumiy ma'lumotni o'zgartiradi | Parallel ishlashda to'qnashadi | Noyob ma'lumot |
| E2E bilan hamma narsani qoplashga urinish | Sekin, beqaror | Kritik oqimlar (51-bob) |
| `trace` va artefaktlarni saqlamaslik | CI'dagi yiqilishni tahlil qilib bo'lmaydi | `trace: 'on-first-retry'` + upload |

## Amaliyot

1. Playwright'ni o'rnating va bitta oqim uchun test yozing (masalan ro'yxat → detal).
2. `webServer` sozlang: test `npm run preview` ustida ishlasin.
3. `auth.setup.js` bilan kirish holatini saqlang va uni ikkita testda qayta ishlating.
4. `page.route` bilan 500 xatosini simulyatsiya qiling va xato holati ko'rinishini tekshiring.
5. Testni ataylab yiqiting, `npx playwright show-trace` bilan qadamlarni ko'ring.
6. `@axe-core/playwright` bilan bitta sahifaga a11y testini qo'shing.

## Rasmiy hujjat

- Playwright: <https://playwright.dev/docs/intro>
- Selektorlar: <https://playwright.dev/docs/locators>
- Autentifikatsiya: <https://playwright.dev/docs/auth>
- Trace viewer: <https://playwright.dev/docs/trace-viewer>
