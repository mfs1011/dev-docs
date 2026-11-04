// Steiger xabarlarini yangi boshlovchi tushunadigan tilga o'giradi: binodagi metafora (qavat, xona, eshik,
// deraza), nega yomon va qanday tuzatiladi. Asl xabar ham saqlanadi (kitobdagi 33-bob jadvali bilan bir xil).
const c = (s) => `\`${s}\``
const xona = (yol) => yol.replace(/^src\//, '').split('/').slice(0, 2).join('/')

export const QAVATLAR = [
  { nom: 'app', ikon: '🏠', izoh: 'ilovani ishga tushirish: yo‘llar (routing), provayderlar, global sozlamalar' },
  { nom: 'pages', ikon: '📄', izoh: 'sahifalar — har biri bitta manzil (URL)' },
  { nom: 'widgets', ikon: '🧩', izoh: 'katta mustaqil bloklar: sarlavha, yon panel' },
  { nom: 'features', ikon: '⚡', izoh: 'foydalanuvchi harakatlari: savatga qo‘shish, yoqtirish' },
  { nom: 'entities', ikon: '📦', izoh: 'biznes obyektlari: mahsulot, foydalanuvchi, buyurtma' },
  { nom: 'shared', ikon: '🧰', izoh: 'hamma ishlatadigan asboblar: tugma, sozlamalar, yordamchi funksiyalar' },
]
export const XONASIZ = new Set(['app', 'shared'])

export function izoh(m) {
  const x = m.xabar
  const q = (re) => (re.exec(x) ?? [])[1]
  switch (m.qoida) {
    case 'forbidden-imports':
      if (/higher layer/.test(x)) {
        return {
          ikon: '⬆️',
          sarlavha: `Yuqori qavatga murojaat: ${c(xona(m.yol))} → ${c(q(/"([^"]+)"/))}`,
          nega: 'Har qavat faqat o‘zidan pastdagilarga tayanadi. Pastki qavat yuqoridagiga bog‘lansa, bitta o‘zgarish butun binoga tarqaladi va qavatlarni alohida tushunib bo‘lmaydi.',
          qanday: 'Kerakli narsani pastroq qavatga (ko‘pincha `shared` yoki `entities`) ko‘chiring yoki yuqoridagi qavat uni argument/props orqali bersin.',
        }
      }
      return {
        ikon: '↔️',
        sarlavha: `Qo‘shni xonaga kirish: ${c(xona(m.yol))} → ${c(q(/"([^"]+)"/))}`,
        nega: 'Bir qavatdagi xonalar (slice) bir-birini bilmasligi kerak — shunda birini o‘zgartirsangiz yoki o‘chirsangiz, qo‘shnisi buzilmaydi.',
        qanday: 'Ikkalasini yuqoriroq qavat (widget yoki sahifa) yonma-yon qo‘ysin; umumiy qism bo‘lsa — uni pastki qavatga tushiring.',
      }
    case 'no-public-api-sidestep':
      return {
        ikon: '🪟',
        sarlavha: `Derazadan kirish: ${c(q(/"([^"]+)"/))}`,
        nega: 'Xonaning ichki fayllari — uning shaxsiy ishi. Ularga to‘g‘ridan-to‘g‘ri murojaat qilsangiz, xona ichida fayl ko‘chirilganda sizning kodingiz buziladi.',
        qanday: 'Kerakli narsani slice’ning `index.ts` (eshik) faylidan eksport qiling va `@/qatlam/slice` dan import qiling.',
      }
    case 'public-api':
      return {
        ikon: '🚪',
        sarlavha: `Eshiksiz xona: ${c(xona(m.yol))}`,
        nega: '`index.ts` — slice’ning tashqi dunyoga ochiq yagona eshigi (public API). Usiz boshqalar ichki fayllarga «derazadan» kirishga majbur.',
        qanday: 'Slice ildizida `index.ts` yarating va tashqariga kerak bo‘lgan narsalarni eksport qiling.',
      }
    case 'insignificant-slice':
      return /no references/.test(x)
        ? { ikon: '👻', sarlavha: `Hech kim ishlatmaydigan xona: ${c(xona(m.yol))}`, nega: 'Hech qayerdan import qilinmaydigan slice — ortiqcha kod.', qanday: 'Kerak bo‘lmasa o‘chiring.' }
        : {
            ikon: '🪫',
            sarlavha: `Faqat bitta joyda ishlatiladi: ${c(xona(m.yol))} → ${c(q(/slice "([^"]+)"/))}`,
            nega: 'Bitta joyda ishlatiladigan narsani alohida xonaga chiqarish — ortiqcha bo‘linish. FSD 2.1 tamoyili: avval sahifa ichida yozing, ikkinchi foydalanuvchi chiqqanda ajrating.',
            qanday: 'Kodni ishlatadigan joyiga ko‘chiring yoki ikkinchi foydalanuvchi paydo bo‘lishini kuting.',
          }
    case 'segments-by-purpose':
      return {
        ikon: '🏷️',
        sarlavha: `Bo‘lim nomi maqsadni aytmaydi: ${c(m.yol.split('/').pop())}`,
        nega: '`components`, `utils`, `hooks` — ichida NIMA borligini aytadi, NIMA UCHUN ekanini emas. Loyiha o‘sgach bunday papkalar hamma narsa tashlanadigan joyga aylanadi.',
        qanday: 'Maqsad bo‘yicha nomlang: `ui` (ko‘rinish), `model` (holat va mantiq), `api` (server bilan aloqa), `lib` (yordamchi kod), `config` (sozlamalar).',
      }
    case 'no-segmentless-slices':
      return {
        ikon: '📭',
        sarlavha: `Bo‘limlarga ajratilmagan xona: ${c(m.yol.replace(/^src\//, ''))}`,
        nega: 'Xona ichidagi kod maqsadi bo‘yicha bo‘limlarga (segment: `ui`, `model`, `api`…) ajratilishi kerak.',
        qanday: 'Fayllarni `ui/`, `model/` kabi papkalarga joylang. Agar bu aslida bo‘lim bo‘lsa — u noto‘g‘ri joyda turibdi.',
      }
    case 'no-segments-on-sliced-layers':
      return {
        ikon: '🧳',
        sarlavha: `Qavatda egasiz bo‘lim: ${c(m.yol.replace(/^src\//, ''))}`,
        nega: '`pages`, `widgets`, `features`, `entities` qavatlarida faqat xonalar (slice) turadi; `ui`, `model` kabi bo‘limlar xona ichida bo‘ladi.',
        qanday: 'Uni tegishli xona ichiga joylang yoki hamma ishlatsa — `shared` ga ko‘chiring.',
      }
    case 'no-layer-public-api':
      return { ikon: '🏢', sarlavha: `Butun qavatga eshik: ${c(m.yol.replace(/^src\//, ''))}`, nega: 'Qavat butunligicha import qilinmaydi — har xonaning o‘z eshigi bor.', qanday: 'Qavat darajasidagi `index.ts` ni o‘chiring.' }
    case 'no-ui-in-app':
      return { ikon: '🏠', sarlavha: '`app` da `ui` bo‘limi', nega: '`app` — ilovani ishga tushirish joyi (yo‘llar, provayderlar). Ko‘rinish komponentlari sahifa va widget’larda bo‘ladi.', qanday: 'UI’ni tegishli sahifa yoki widget’ga ko‘chiring.' }
    case 'typo-in-layer-name':
      return { ikon: '✏️', sarlavha: `Qavat nomida xato: ${c(m.yol.replace(/^src\//, ''))}`, nega: 'Noma’lum nomli papka qavat deb tanilmaydi va tekshirilmaydi.', qanday: x }
    case 'no-processes':
      return { ikon: '🗄️', sarlavha: '`processes` qavati eskirgan', nega: 'FSD 2.1 da bu qavat yo‘q.', qanday: 'Mantiqni `features` yoki `app` ga ko‘chiring.' }
    default:
      return { ikon: '⚠️', sarlavha: m.qoida, nega: '', qanday: '' }
  }
}
