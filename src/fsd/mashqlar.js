// FSD tekshiruvchisi mashqlari. Har biri — toza «do'kon» loyihasidan (ASOS) bitta qoida buzilgan nusxa.
// Tekshiruv haqiqiy Steiger bilan (steiger.js): qadam `check(s)` — s.muammolar (Steiger natijasi), s.fayllar,
// s.tanlangan (o'quvchi bosgan muammo). Asos va har mashqning boshlang'ich holati Steiger CLI bilan ham sinalgan
// (fsd-tekshiruvchi/test/steiger.mjs).

export const ASOS = {
  'src/app/index.ts': `import { AppRouter } from './routes'

export const App = AppRouter
`,
  'src/app/routes/index.ts': `import { HomePage } from '@/pages/home'
import { CatalogPage } from '@/pages/catalog'

export const AppRouter = { '/': HomePage, '/katalog': CatalogPage }
`,
  'src/pages/home/index.ts': `export { HomePage } from './ui/HomePage'
`,
  'src/pages/home/ui/HomePage.tsx': `import { Header } from '@/widgets/header'
import { ProductCard } from '@/entities/product'
import { AddToCart } from '@/features/add-to-cart'

export function HomePage() {
  return [Header, ProductCard, AddToCart]
}
`,
  'src/pages/catalog/index.ts': `export { CatalogPage } from './ui/CatalogPage'
`,
  'src/pages/catalog/ui/CatalogPage.tsx': `import { Header } from '@/widgets/header'
import { ProductCard, formatPrice } from '@/entities/product'
import { AddToCart } from '@/features/add-to-cart'

export function CatalogPage() {
  return [Header, ProductCard, AddToCart, formatPrice(12000)]
}
`,
  'src/widgets/header/index.ts': `export { Header } from './ui/Header'
`,
  'src/widgets/header/ui/Header.tsx': `import { Button } from '@/shared/ui'
import { SAYT_NOMI } from '@/shared/config'

export function Header() {
  return [SAYT_NOMI, Button]
}
`,
  'src/features/add-to-cart/index.ts': `export { AddToCart } from './ui/AddToCart'
`,
  'src/features/add-to-cart/ui/AddToCart.tsx': `import { Button } from '@/shared/ui'
import type { Product } from '@/entities/product'

export function AddToCart(product: Product) {
  return [Button, product.id]
}
`,
  'src/entities/product/index.ts': `export { ProductCard } from './ui/ProductCard'
export { formatPrice } from './lib/format-price'
export type { Product } from './model/types'
`,
  'src/entities/product/ui/ProductCard.tsx': `import { formatPrice } from '../lib/format-price'

export function ProductCard() {
  return formatPrice(5000)
}
`,
  'src/entities/product/lib/format-price.ts': `export const formatPrice = (n: number) => \`\${n} so‘m\`
`,
  'src/entities/product/model/types.ts': `export interface Product {
  id: number
  nom: string
  narx: number
}
`,
  'src/shared/ui/index.ts': `export { Button } from './Button'
`,
  'src/shared/ui/Button.tsx': `export function Button() {
  return 'tugma'
}
`,
  'src/shared/config/index.ts': `export const SAYT_NOMI = 'Do‘kon'
`,
}

// asosdan nusxa: o'zgartirish (matn) va o'chirish (null)
const nusxa = (oz) => {
  const f = { ...ASOS }
  for (const [k, v] of Object.entries(oz)) {
    if (v === null) delete f[k]
    else f[k] = v
  }
  return f
}
const tozami = (s) => s.muammolar.length === 0
const yoq = (s, q) => !s.muammolar.some((m) => m.qoida === q)

export const MASHQLAR = [
  {
    id: 'fsd-qatlam',
    title: 'Yuqori qavatga import',
    bob: '/fsd/03-qatlamlar',
    intro: 'Qatlamlar — binoning qavatlari: har qavat faqat o‘zidan PASTDAGI qavatlardan foydalana oladi. `widgets` qavatidagi Header yuqoridagi `pages` qavatidan nimadir olyapti.',
    fayllar: nusxa({
      'src/widgets/header/ui/Header.tsx': `import { Button } from '@/shared/ui'
import { SAYT_NOMI } from '@/pages/home'

export function Header() {
  return [SAYT_NOMI, Button]
}
`,
      'src/pages/home/index.ts': `export { HomePage } from './ui/HomePage'
export const SAYT_NOMI = 'Do‘kon'
`,
      'src/shared/config/index.ts': null,
    }),
    manba: ['https://feature-sliced.design/docs/reference/layers', 'https://github.com/feature-sliced/steiger'],
    steps: [
      {
        text: 'Binodagi qizil strelkani yoki «Muammolar» ro‘yxatidagi xatoni bosing — u nimani ko‘rsatadi?',
        check: (s) => s.tanlangan?.qoida === 'forbidden-imports',
        natija: '`widgets/header` (pastki qavat) `pages/home` dan (yuqori qavat) import qilyapti. Yuqori qavat pastki qavatlarga tayanadi — teskarisi bo‘lsa, qavatlar bir-biriga chalkashib ketadi.',
      },
      {
        text: '`SAYT_NOMI` hamma uchun umumiy narsa — uni eng pastki qavatga ko‘chiring: `src/shared/config/index.ts` yarating, Header’da `@/shared/config` dan import qiling va `pages/home` dan o‘chiring.',
        yechim: {
          'src/shared/config/index.ts': ASOS['src/shared/config/index.ts'],
          'src/widgets/header/ui/Header.tsx': ASOS['src/widgets/header/ui/Header.tsx'],
          'src/pages/home/index.ts': ASOS['src/pages/home/index.ts'],
        },
        check: (s) => yoq(s, 'forbidden-imports') && tozami(s),
        natija: 'Strelka endi pastga — yashil. Umumiy konstanta `shared` da turibdi, uni istalgan qavat ishlatishi mumkin.',
      },
    ],
  },
  {
    id: 'fsd-public-api',
    title: 'Eshik orqali kirish (public API)',
    bob: '/fsd/06-import-va-public-api',
    intro: 'Har slice — xona, uning `index.ts` fayli — eshik (public API). Boshqalar xonaga faqat eshikdan kiradi: ichidagi fayllarga to‘g‘ridan-to‘g‘ri import qilish — «derazadan kirish».',
    fayllar: nusxa({
      'src/features/add-to-cart/index.ts': null,
      'src/pages/home/ui/HomePage.tsx': ASOS['src/pages/home/ui/HomePage.tsx'].replace("from '@/features/add-to-cart'", "from '@/features/add-to-cart/ui/AddToCart'"),
      'src/pages/catalog/ui/CatalogPage.tsx': ASOS['src/pages/catalog/ui/CatalogPage.tsx'].replace("from '@/features/add-to-cart'", "from '@/features/add-to-cart/ui/AddToCart'"),
    }),
    manba: ['https://feature-sliced.design/docs/reference/public-api'],
    steps: [
      {
        text: '`add-to-cart` xonasida eshik yo‘q. `src/features/add-to-cart/index.ts` yarating: `export { AddToCart } from \'./ui/AddToCart\'`.',
        yechim: { 'src/features/add-to-cart/index.ts': ASOS['src/features/add-to-cart/index.ts'] },
        check: (s) => yoq(s, 'public-api'),
        natija: 'Eshik paydo bo‘ldi. Lekin sahifalar hali ham derazadan kiryapti — ular `…/ui/AddToCart` ga to‘g‘ridan-to‘g‘ri murojaat qiladi.',
      },
      {
        text: 'HomePage va CatalogPage’da importni eshik orqali qiling: `from \'@/features/add-to-cart\'`.',
        yechim: { 'src/pages/home/ui/HomePage.tsx': ASOS['src/pages/home/ui/HomePage.tsx'], 'src/pages/catalog/ui/CatalogPage.tsx': ASOS['src/pages/catalog/ui/CatalogPage.tsx'] },
        check: (s) => yoq(s, 'no-public-api-sidestep') && tozami(s),
        natija: 'Endi xona ichini istalgancha o‘zgartirish mumkin (faylni ko‘chirish, nomini o‘zgartirish) — eshik (`index.ts`) o‘zgarmasa, tashqaridagilar buzilmaydi.',
      },
    ],
  },
  {
    id: 'fsd-cross-import',
    title: 'Qo‘shni xonaga kirish (cross-import)',
    bob: '/fsd/15-cross-import',
    intro: 'Bir qavatdagi xonalar bir-birini bilmasligi kerak: `features/add-to-cart` qo‘shni `features/like` dan foydalanyapti. Ularni bitta yuqoriroq qavat birlashtirishi kerak.',
    fayllar: nusxa({
      'src/features/like/index.ts': `export { Like } from './ui/Like'
`,
      'src/features/like/ui/Like.tsx': `export function Like() {
  return '♥'
}
`,
      'src/features/add-to-cart/ui/AddToCart.tsx': `import { Button } from '@/shared/ui'
import { Like } from '@/features/like'
import type { Product } from '@/entities/product'

export function AddToCart(product: Product) {
  return [Button, Like, product.id]
}
`,
      'src/pages/catalog/ui/CatalogPage.tsx': ASOS['src/pages/catalog/ui/CatalogPage.tsx'].replace("import { AddToCart } from '@/features/add-to-cart'", "import { AddToCart } from '@/features/add-to-cart'\nimport { Like } from '@/features/like'").replace('AddToCart, formatPrice(12000)]', 'AddToCart, Like, formatPrice(12000)]'),
    }),
    manba: ['https://feature-sliced.design/docs/guides/issues/cross-imports'],
    steps: [
      {
        text: 'AddToCart’dan `Like` importini olib tashlang. Ikkalasini sahifa birlashtirsin: HomePage’ga ham `import { Like } from \'@/features/like\'` qo‘shing va ro‘yxatga `Like` ni qo‘ying.',
        yechim: {
          'src/features/add-to-cart/ui/AddToCart.tsx': ASOS['src/features/add-to-cart/ui/AddToCart.tsx'],
          'src/pages/home/ui/HomePage.tsx': ASOS['src/pages/home/ui/HomePage.tsx'].replace("import { AddToCart } from '@/features/add-to-cart'", "import { AddToCart } from '@/features/add-to-cart'\nimport { Like } from '@/features/like'").replace('[Header, ProductCard, AddToCart]', '[Header, ProductCard, AddToCart, Like]'),
        },
        check: (s) => yoq(s, 'forbidden-imports') && tozami(s),
        natija: 'Endi `add-to-cart` va `like` bir-birini bilmaydi: ularni yuqoridagi sahifa yonma-yon qo‘yadi. Har birini alohida o‘zgartirish yoki o‘chirish mumkin.',
      },
    ],
  },
  {
    id: 'fsd-segment',
    title: 'Segment nomi — maqsad, turi emas',
    bob: '/fsd/05-segmentlar',
    intro: 'Xona ichidagi bo‘limlar (segment) nima UCHUN ekanini aytishi kerak: `ui`, `model`, `api`, `lib`, `config`. `components`, `utils`, `hooks` kabi nomlar faqat ichida nima turganini aytadi.',
    fayllar: nusxa({
      'src/entities/product/ui/ProductCard.tsx': null,
      'src/entities/product/components/ProductCard.tsx': ASOS['src/entities/product/ui/ProductCard.tsx'],
      'src/entities/product/index.ts': ASOS['src/entities/product/index.ts'].replace('./ui/ProductCard', './components/ProductCard'),
    }),
    manba: ['https://feature-sliced.design/docs/reference/slices-segments#segments'],
    steps: [
      {
        text: '`entities/product/components` papkasini `ui` ga o‘zgartiring (papkani tanlab «Nomini o‘zgartirish») va `index.ts` dagi yo‘lni tuzating.',
        yechim: {
          'src/entities/product/components/ProductCard.tsx': null,
          'src/entities/product/ui/ProductCard.tsx': ASOS['src/entities/product/ui/ProductCard.tsx'],
          'src/entities/product/index.ts': ASOS['src/entities/product/index.ts'],
        },
        check: (s) => yoq(s, 'segments-by-purpose') && tozami(s),
        natija: '`ui` nomidan darhol tushunarli: bu yerda ko‘rinish (UI) bor. Hamma xonada nomlar bir xil bo‘lgani uchun yangi odam ham loyihada adashmaydi.',
      },
    ],
  },
  {
    id: 'fsd-shared',
    title: 'Qavatda xonasiz turgan narsa',
    bob: '/fsd/07-shared',
    intro: '`features` qavatida xonalar (slice) bo‘lishi kerak. `features/ui` — xona emas, segment: u qavat o‘rtasida egasiz turibdi. Hamma ishlatadigan tugma `shared` ga tegishli.',
    fayllar: nusxa({
      'src/features/ui/Rating.tsx': `export function Rating() {
  return '★★★★☆'
}
`,
      'src/features/ui/index.ts': `export { Rating } from './Rating'
`,
      'src/pages/home/ui/HomePage.tsx': ASOS['src/pages/home/ui/HomePage.tsx'].replace("import { AddToCart } from '@/features/add-to-cart'", "import { AddToCart } from '@/features/add-to-cart'\nimport { Rating } from '@/features/ui'").replace('[Header, ProductCard, AddToCart]', '[Header, ProductCard, AddToCart, Rating]'),
      'src/pages/catalog/ui/CatalogPage.tsx': ASOS['src/pages/catalog/ui/CatalogPage.tsx'].replace("import { AddToCart } from '@/features/add-to-cart'", "import { AddToCart } from '@/features/add-to-cart'\nimport { Rating } from '@/features/ui'").replace('AddToCart, formatPrice(12000)]', 'AddToCart, Rating, formatPrice(12000)]'),
    }),
    manba: ['https://feature-sliced.design/docs/reference/layers#shared'],
    steps: [
      {
        text: '`Rating.tsx` ni `src/shared/ui/` ga ko‘chiring, `shared/ui/index.ts` ga eksport qo‘shing, sahifalarda `@/shared/ui` dan import qiling va `features/ui` ni o‘chiring.',
        yechim: {
          'src/features/ui/Rating.tsx': null,
          'src/features/ui/index.ts': null,
          'src/shared/ui/Rating.tsx': `export function Rating() {
  return '★★★★☆'
}
`,
          'src/shared/ui/index.ts': `export { Button } from './Button'
export { Rating } from './Rating'
`,
          'src/pages/home/ui/HomePage.tsx': ASOS['src/pages/home/ui/HomePage.tsx'].replace("import { AddToCart } from '@/features/add-to-cart'", "import { AddToCart } from '@/features/add-to-cart'\nimport { Rating } from '@/shared/ui'").replace('[Header, ProductCard, AddToCart]', '[Header, ProductCard, AddToCart, Rating]'),
          'src/pages/catalog/ui/CatalogPage.tsx': ASOS['src/pages/catalog/ui/CatalogPage.tsx'].replace("import { AddToCart } from '@/features/add-to-cart'", "import { AddToCart } from '@/features/add-to-cart'\nimport { Rating } from '@/shared/ui'").replace('AddToCart, formatPrice(12000)]', 'AddToCart, Rating, formatPrice(12000)]'),
        },
        check: (s) => yoq(s, 'no-segments-on-sliced-layers') && tozami(s),
        natija: '`shared` — xonasiz qavat: u yerda faqat segmentlar (`ui`, `config`, …). Biznesga bog‘liq bo‘lmagan, hamma ishlatadigan narsa shu yerda.',
      },
    ],
  },
]

export const ERKIN = [{ id: '', title: 'Erkin rejim — toza loyiha', note: 'xatosiz «do‘kon» loyihasi: o‘zingiz buzib ko‘ring' }]
export const findMashq = (id) => MASHQLAR.find((m) => m.id === id) ?? null
