/**
 * Kitoblar ro'yxati. Yangi qo'llanma qo'shish uchun shu massivga bitta blok qo'shiladi —
 * qolgan hamma narsa (sidebar, marshrutlar, qidiruv, versiya, sana) avtomatik quriladi.
 */
export const contentRoot = process.env.DOCS_SOURCE ?? 'content'

export const books = [
  {
    id: 'symfony',
    title: 'Symfony',
    subtitle: 'noldan production darajasigacha',
    dir: 'symfony',
    logo: 'symfony',
    accent: '#0b6e4f',
    accentDark: '#4cc79a',
    versionLabel: 'Symfony',
    versionRow: /^\|\s*Symfony\s*\|\s*([^|]+)\|/m,
    groups: [
      { title: 'I — Poydevor', from: 1, to: 8 },
      { title: 'II — HTTP qatlami', from: 9, to: 14 },
      { title: 'III — Ma\'lumotlar bazasi', from: 15, to: 19 },
      { title: 'IV — API qurish', from: 20, to: 24 },
      { title: 'V — Fon ishlari va xizmatlar', from: 25, to: 29 },
      { title: 'VI — Sifat va yakun', from: 30, to: 34 },
      { title: 'VII — Production darajasi', from: 35, to: 40 },
    ],
    folders: [
      { dir: 'patterns', title: 'Pattern katalogi' },
    ],
  },
  {
    id: 'laravel',
    title: 'Laravel',
    subtitle: 'Symfony dasturchilari uchun',
    dir: 'laravel',
    logo: 'laravel',
    accent: '#b5331f',
    accentDark: '#ff7a5c',
    versionLabel: 'Laravel',
    versionRow: /^\|\s*Laravel Framework\s*\|\s*([^|]+)\|/m,
    groups: [
      { title: 'I — Poydevor', from: 1, to: 8 },
      { title: 'II — HTTP qatlami', from: 9, to: 13 },
      { title: 'III — Ma\'lumotlar bazasi', from: 14, to: 19 },
      { title: 'IV — API qurish', from: 20, to: 23 },
      { title: 'V — Fon ishlari va xizmatlar', from: 24, to: 28 },
      { title: 'VI — Sifat va yakun', from: 29, to: 34 },
    ],
    folders: [],
  },
  {
    id: 'vue',
    title: 'Vue',
    subtitle: 'noldan senior darajasigacha',
    dir: 'vue',
    logo: 'vue',
    accent: '#35845f',
    accentDark: '#42d392',
    versionLabel: 'Vue',
    versionRow: /^\|\s*Vue\s*\|\s*([^|]+)\|/m,
    // Options / Composition API almashtirgichi shu kitobda ko'rinadi
    apiSwitcher: true,
    groups: [
      { title: 'I — Poydevor', from: 1, to: 7 },
      { title: 'II — Shablon va reaktivlik', from: 8, to: 17 },
      { title: 'III — Komponentlar', from: 18, to: 28 },
      { title: 'IV — Qayta ishlatish va ichki komponentlar', from: 29, to: 36 },
      { title: 'V — Ilova miqyosi', from: 37, to: 47 },
      { title: 'VI — TypeScript', from: 48, to: 50 },
      { title: 'VII — Sifat va testlash', from: 51, to: 55 },
      { title: 'VIII — SSR, Nuxt va SEO', from: 56, to: 61 },
      { title: 'IX — Production darajasi', from: 62, to: 70 },
    ],
    folders: [],
  },
]
