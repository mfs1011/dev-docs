// FSD 38-bob videosi: "Code review checklist" (content/fsd/38-review-checklist.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'avtomatik_darvoza', 'joylashuv_va_chegaralar', 'public_api_va_nomlash', 'pr_shabloni_va_adr', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Avtomatika va Inson Tekshiruvi Chegarasi',
    avtomatik_darvoza: '1-Bosqich: Avtomatik Darvoza (CI/CD Gates)',
    joylashuv_va_chegaralar: '2-Bosqich: Joylashuv va Qatlam Chegaralari',
    public_api_va_nomlash: '3-Bosqich: Public API va Domen Bo\'yicha Nomlash',
    pr_shabloni_va_adr: 'Pull Request Shabloni va ADR Kelishuvlari',
    tipik_xatolar: 'Kod Ko\'rigidagi Tipik Xatolar',
    xulosa: 'Xulosa va Keyingi Qadam'
  };
  const hold = {
    L1: 0.8,
    L4: 1.2,
    L7: 1.2,
    L9: 1.2,
    L11: 1.2,
    L13: 1.2,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'ttiz sakkizinchi bobi — pull requestlarni ko'rib chiqishda FSD arxitekturasini tekshirish cheklisti."],
    ['L2', 'intro', "Stayger va linterlar mexanik xatolarni ushlasa-da, kodning ma'nosi, to'g'ri qatlami va arxitektura tozaligini faqat inson baholay oladi."],

    ['L3', 'avtomatik_darvoza', "Birinchi qoida — avtomatik darvoza: Stayger, ESLint, TypeScript tekshiruvi va testlar to'liq yashil bo'lmasa, revyuni boshlamang."],
    ['L4', 'avtomatik_darvoza', "Linter ushlay oladigan sintaksis yoki taqiqlangan importlarni muhokama qilish dasturchilar vaqtini bekorga sarflaydi."],

    ['L5', 'joylashuv_va_chegaralar', "Inson tekshiradigan asosiy savol — kod eng lokal joydami: bitta sahifa kodi sahifa ichida, ikkitadan ko'p joy ishlatsa pastki qatlamda bo'lishi shart."],
    ['L6', 'joylashuv_va_chegaralar', "Fe'l harakatlar features qatlamiga, ot biznes modellari entities qatlamiga, qatlamlararo aloqa esa faqat kompozitsiya orqali ulanishi kerak."],
    ['L7', 'joylashuv_va_chegaralar', "Entity komponenti hech qachon feature harakatini o'zi import qilmasligi, slot va prop orqali qabul qilishi shart."],

    ['L8', 'public_api_va_nomlash', "Public API da faqat tashqariga kerakli belgilar eksport qilinishi, eksport asterisk esa qat'iyan ishlatilmasligi kerak."],
    ['L9', 'public_api_va_nomlash', "Nomlashda texnik so'zlar emas, domen biznes tili ustuvor: forms yoki modals emas, add-to-cart yoki order kabi aniq nomlar tanlanadi."],

    ['L10', 'pr_shabloni_va_adr', "Jamoada har bir pull request uchun FSD shabloni joriy etiladi: yangi slice sababi, pastga tushirilgan kod va public API o'zgarishi yoziladi."],
    ['L11', 'pr_shabloni_va_adr', "Bahsli arxitektura savollari har PR da qayta tortishilmaydi, balki arxitektura qarorlari yozuvi ya'ni ADR da mustahkamlab qo'yiladi."],

    ['L12', 'tipik_xatolar', "Tipik xatolar — \"keyin to'g'rilaymiz\" deb noto'g'ri qatlamni tasdiqlash hamda har bir PR da noldan falsafiy bahslarga kirishishdir."],
    ['L13', 'tipik_xatolar', "Vaqt o'tishi bilan bunday murosalar arxitektura eroziyasiga va butun tizimning ifloslanishiga olib keladi."],

    ['L14', 'xulosa', "Xulosa: qat'iy avtomatika va ongli inson ko'rigi uyg'unligi loyihani yillar davomida toza va barqaror saqlaydi."],
    ['L15', 'xulosa', "Keyingi o'ttiz to'qqizinchi bobda FSD bo'yicha eng ko'p beriladigan qiyin savollarga aniq javoblarni ko'rib chiqamiz."],
    ['L16', 'xulosa', "E'tiboringiz uchun rahmat, sifatli va hushyor kod-revyu o'tkazishda davom eting!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
