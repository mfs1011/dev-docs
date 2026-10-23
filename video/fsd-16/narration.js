// FSD 16-bob videosi: "Yuqori qatlamda kompozitsiya" (content/fsd/16-kompozitsiya.md). Ovoz — Kore, metafora — bloklarni yuqorida yig'ish va slotlar.
(function (g) {
  const scenes = ['intro', 'ioc_tushunchasi', 'slotlar_va_render_props', 'hodisalar_va_callback', 'di_va_kontekst', 'steiger', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Yuqori Qatlamda Kompozitsiya',
    ioc_tushunchasi: 'Boshqaruvni Teskari Qilish (IoC)',
    slotlar_va_render_props: 'Slot, Render Props va Content Projection',
    hodisalar_va_callback: 'Hodisalar va Callback Props',
    di_va_kontekst: 'DI, Kontekst va Keng Tarqalgan Xatolar',
    steiger: 'Steiger va Arxitektura Nazorati',
    xulosa: 'Xulosa va Keyingi Qadam'
  };
  const hold = {
    L1: 0.8,
    L4: 1.2,
    L7: 1.2,
    L10: 1.2,
    L13: 1.2,
    L15: 1.2,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'n oltinchi bobi — Yuqori qatlamda kompozitsiya. Bugun bir qatlamdagi slice'larni o'zaro bog'lamasdan, toza kompozitsiya orqali birga ishlatish san'atini o'rganamiz."],
    ['L2', 'intro', "FSD ning asosiy qoidasi: agar ikki slice birga ishlashi kerak bo'lsa, ularni gorizontal ulamaymiz, balki widgets yoki pages qatlamida yonma-yon jamlaymiz."],

    ['L3', 'ioc_tushunchasi', "Ushbu yondashuv Inversion of Control, ya'ni boshqaruvni teskari qilish deb ataladi. Slice o'z ichida nima ko'rsatilishini bilmaydi, faqat bo'sh joy qoldiradi."],
    ['L4', 'ioc_tushunchasi', "Masalan, izohlar ro'yxati foydalanuvchi avatarini to'g'ridan chaqirmaydi, balki yuqori qatlam beradigan joy orqali qabul qiladi."],

    ['L5', 'slotlar_va_render_props', "React muhitida bu render props yoki children orqali, Vue da slotlar, Angular da esa content projection yordamida amalga oshiriladi."],
    ['L6', 'slotlar_va_render_props', "Bitta mahsulot kartasi ProductCard actions nomli bo'sh joy qoldiradi, sahifa esa unga AddToCart tugmasini uzatadi."],
    ['L7', 'slotlar_va_render_props', "Natijada entities qatlamidagi ProductCard hech qanday feature'ga bog'lanmaydi va butun loyiha bo'ylab erkin qayta ishlatiladi."],

    ['L8', 'hodisalar_va_callback', "Ikkinchi keng tarqalgan holat — bir slice'dagi amal tugagach, ikkinchisi yangilanishi kerak bo'lgan holatdir."],
    ['L9', 'hodisalar_va_callback', "Masalan, promokod kiritilganda savatdagi jami summa qayta hisoblanishi lozim. Bu yerda ham feature'lar bir-birini bilmaydi."],
    ['L10', 'hodisalar_va_callback', "Promokod komponenti onApplied hodisasini chiqaradi, sahifa esa bu hodisani ushlab, savat summasini qayta yuklaydi."],

    ['L11', 'di_va_kontekst', "Agar kompozitsiya juda chuqur komponentlar daraxtiga tushib ketsa, prop drilling o'rniga Dependency Injection yoki kontekst ishlatiladi."],
    ['L12', 'di_va_kontekst', "Lekin ehtiyot bo'ling: global event bus ochish yoki feature'larga yashirin pub-sub signallarini kiritish qat'iyan tavsiya etilmaydi."],
    ['L13', 'di_va_kontekst', "Yashirin bog'lanishlar loyihani tushunarsiz qiladi va xatolarni qidirishni ancha murakkablashtiradi."],

    ['L14', 'steiger', "Steiger linteri slice'lar orasidagi noqonuniy ulanishlarni va to'g'ridan-to'g'ri importlarni doimiy nazorat qiladi."],
    ['L15', 'steiger', "Kompozitsiya to'g'ri qo'llanilganda, linter barcha qatlamlarni toza va xatosiz holatda tasdiqlaydi."],

    ['L16', 'xulosa', "Xulosa qilsak: slice'larni pastda bir-biriga ulamang, yuqorida kompozitsiya qiling va doimo toza slotlardan foydalaning. Keyingi bobda desegmentatsiya va nomlashni o'rganamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
