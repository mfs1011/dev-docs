// FSD 6-bob videosi: "Import qoidasi va public API" (content/fsd/06-import-va-public-api.md). Ovoz — Kore, metafora — bino.
// Da'volar manbasi (feature-sliced.design): reference/layers ("strictly below"), reference/public-api ("contract", "gate",
// uch maqsad, wildcard re-export "hurts the discoverability", "always use relative imports and write the full import path",
// Shared'da "separate index file for each component or library", IDE auto-import "breaking the public API rule",
// index fayl "you don't actually forbid anyone ... importing directly"). Steiger chiqishi — steiger-xato.txt / steiger-toza.txt
// (steiger 0.7.0, plugin 0.8.0; recommended + fsd/import-locality va fsd/no-wildcard-exports yoqilgan — ular sukut bo'yicha o'chiq).
(function (g) {
  const scenes = ['intro', 'import', 'api', 'yollar', 'xavf', 'steiger', 'xulosa'];
  const sceneNames = { intro: 'Kirish', import: 'Import qoidasi', api: 'Public API', yollar: 'Import yo‘llari', xavf: 'Uchta xavf', steiger: 'Steiger', xulosa: 'Xulosa' };
  const hold = { L2: 0.8, L3: 1.4, L4: 1.2, L5: 1.0, L6: 0.4, L7: 0.8, L8: 0.8, L9: 1.0, L10: 1.0, L11: 1.0, L12: 1.4, L13: 1.2, L14: 1.2, L15: 1.2, L16: 0.8, L17: 1.0, L18: 1.0, L19: 1.0, L20: 1.2, L21: 1.6, L22: 0.8 };
  const lines = [
    ['L1', 'intro', 'Salom! Bu FSD qo‘llanmasining oltinchi bobi — import qoidasi va public API. FSD’ning butun foydasi shu ikki qoidaga tayanadi.'],

    ['L2', 'import', 'Import qoidasi: slice ichidagi fayl boshqa slice’larni faqat ular qat’iy pastdagi qatlamlarda bo‘lsa import qila oladi.'],
    ['L3', 'import', 'Pages widgets’dan, widgets features’dan, features esa entities’dan oladi. Teskari yo‘nalishda import taqiqlangan.'],
    ['L4', 'import', 'Shuning uchun o‘zgarish ta’siri oldindan ma’lum: pastdagi slice o‘zgarsa, faqat undan yuqoridagilar ta’sirlanishi mumkin.'],

    ['L5', 'api', 'Public API — slice va uni ishlatadigan kod orasidagi shartnoma. U darvozadek ishlaydi: faqat ruxsat etilgan narsalar va faqat shu yo‘l bilan.'],
    ['L6', 'api', 'Yaxshi public API’ning uchta maqsadi bor.'],
    ['L7', 'api', 'Birinchi: slice ichidagi qayta tuzish ilovaning qolgan qismini buzmasin.'],
    ['L8', 'api', 'Ikkinchi: slice xatti-harakatidagi jiddiy o‘zgarish public API o‘zgarishida ko‘rinsin.'],
    ['L9', 'api', 'Uchinchi: faqat kerakli qismlar tashqariga chiqarilsin.'],

    ['L10', 'yollar', 'Import yo‘llari qanday yoziladi? Bitta slice ichida — doim nisbiy va to‘liq yo‘l bilan.'],
    ['L11', 'yollar', 'Slice’lar orasida — alias bilan va faqat public API orqali.'],
    ['L12', 'yollar', 'Shared ichidagi ui va lib uchun esa har bir komponent yoki kutubxonaga alohida index fayl tavsiya qilinadi.'],

    ['L13', 'xavf', 'Uchta xavf bor. Birinchisi: hamma narsani export yulduzcha bilan chiqarish oson, lekin slice’ning interfeysi noaniq bo‘lib qoladi.'],
    ['L14', 'xavf', 'Ikkinchisi: IDE avtomatik import qilganda ba’zan ichki faylga to‘g‘ridan-to‘g‘ri yo‘l tanlaydi va public API chetlab o‘tiladi.'],
    ['L15', 'xavf', 'Uchinchisi: index fayl borligi chuqur importni o‘zi taqiqlamaydi. Shuning uchun qoidalarni linter tekshirishi kerak.'],

    ['L16', 'steiger', 'Steiger bilan tekshiramiz. Bu safar sukut bo‘yicha o‘chiq ikki qoidani ham yoqdik: import-locality va no-wildcard-exports.'],
    ['L17', 'steiger', 'Entities qatlamidagi order features’dan tip import qildi. Tip ham bog‘liqlik — bu xato.'],
    ['L18', 'steiger', 'Katalog sahifasi ProductCard’ni ichki fayldan oldi — public API chetlab o‘tildi.'],
    ['L19', 'steiger', 'Add-to-cart slice ichida o‘z public API’sidan import qildi. Steiger bu importni nisbiy qilishni talab qiladi.'],
    ['L20', 'steiger', 'Ikkala export yulduzcha uchun ham xabar chiqdi: aniq nomlangan eksport afzal.'],
    ['L21', 'steiger', 'Tuzatilgan loyihada esa Steiger hech qanday muammo topmaydi.'],

    ['L22', 'xulosa', 'Xulosa qilsak: import faqat pastga, slice’ga kirish faqat public API orqali, slice ichida esa nisbiy yo‘l. Bularni linter tekshiradi.'],
    ['L23', 'xulosa', 'Keyingi bobda shared qatlamini ko‘ramiz. E’tiboringiz uchun rahmat!'],
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
