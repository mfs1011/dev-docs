// FSD 39-bob videosi: "Tez-tez beriladigan savollar" (content/fsd/39-faq.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'asoslar_faq', 'qatlam_tanlash_faq', 'chegaralar_faq', 'steiger_va_asboblar_faq', 'frameworklar_faq', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: FSD Amaliyotidagi Eng Ko\'p Beriladigan Savollar',
    asoslar_faq: '1-Guruh: FSD Asoslari, Qatlamlar va processes Taqdiri',
    qatlam_tanlash_faq: '2-Guruh: Qatlam Tanlash (Feature vs Entity, Layout, Auth)',
    chegaralar_faq: '3-Guruh: Chegaralar (Feature-to-Feature, @x, Kompozitsiya)',
    steiger_va_asboblar_faq: '4-Guruh: Steiger, ESLint va Barrel Fayllar',
    frameworklar_faq: '5-Guruh: Next.js, Nuxt, Vue va Angular O\'ziga Xosliklari',
    xulosa: 'Xulosa va Yakuniy Qadam'
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'ttiz to'qqizinchi bobi — dasturchilar tomonidan eng ko'p beriladigan qiyin savollar va ularning rasmiy yechimlari."],
    ['L2', 'intro', "Yangi loyiha boshlashda yoki arxitekturani tekshirishda ikkilanmaslik uchun barcha muhim savollarni beshta asosiy guruhga ajratamiz."],

    ['L3', 'asoslar_faq', "Birinchi guruh — asoslar: barcha qatlamlar shartmi? Yo'q, ko'pincha faqat app, pages va shared yetarli bo'ladi."],
    ['L4', 'asoslar_faq', "processes qatlami eskirgan deb topilgan, o'zboshimchalik bilan core yoki modules kabi yangi qatlamlar ochish esa taqiqlanadi."],

    ['L5', 'qatlam_tanlash_faq', "Ikkinchi guruh — qatlam tanlash: fe'l harakatlar features qatlamiga, ot biznes modellari entities qatlamiga joylashadi."],
    ['L6', 'qatlam_tanlash_faq', "Bitta sahifada ishlatiladigan komponent sahifa ichida qoladi, tokenlar esa sahifada emas, shared auth yoki api da saqlanadi."],
    ['L7', 'qatlam_tanlash_faq', "Agar loyihada hozircha entities bo'lmasa — bu xato emas, FSD entity bo'lmagan holatda ham to'liq ishlayveradi."],

    ['L8', 'chegaralar_faq', "Uchinchi guruh — chegaralar: bir feature boshqa feature bilan bevosita bog'lanmaydi, faqat yuqori qatlamda slot va prop bilan birlashadi."],
    ['L9', 'chegaralar_faq', "Ikki entity bir-biriga muhtoj bo'lsa, @x cross-import standarti qo'llaniladi yoki ular bitta umumiy slice ga birlashtiriladi."],

    ['L10', 'steiger_va_asboblar_faq', "To'rtinchi guruh — asboblar: Stayger rasmiy linter bo'lib, importlarni tahlil qilish uchun tsconfig dagi paths ga to'g'ri bog'lanishi shart."],
    ['L11', 'steiger_va_asboblar_faq', "Barrel fayllar katta loyihalarda sekinlashsa, shared da segment emas, balki komponent darajasidagi index fayllaridan foydalaniladi."],

    ['L12', 'frameworklar_faq', "Beshinchi guruh — freymvorklar: Next.js da to'qnashuvni oldini olish uchun _app va _pages prefiksi hamda ildizda re-eksport ishlatiladi."],
    ['L13', 'frameworklar_faq', "Vue va Pinia da stores yoki composables degan papka ochilmaydi, ularning o'rniga slice ichida model segmenti qo'llaniladi."],

    ['L14', 'xulosa', "Xulosa: FSD qoidalari qotib qolgan dogma emas, balki jamoaviy barqarorlik va mustaqil rivojlanish uchun aniq kelishuvdir."],
    ['L15', 'xulosa', "Keyingi qirqinchi bobda FSD qo'llanmasining yakuniy konspekti va to'liq shpargalkasini jamlaymiz."],
    ['L16', 'xulosa', "E'tiboringiz uchun rahmat, savollarga to'g'ri arxitektura bilan javob berishda davom eting!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
