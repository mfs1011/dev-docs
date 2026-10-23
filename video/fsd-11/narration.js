// FSD 11-bob videosi: "pages" (content/fsd/11-pages.md). Ovoz — Kore, metafora — bino xonalari va ekranlar.
(function (g) {
  const scenes = ['intro', 'sahifa_va_slice', 'sahifaga_xos_kod', 'segmentlar', 'cross_import', 'steiger', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Sahifalar va Ekranlar',
    sahifa_va_slice: 'Bitta Sahifa — Bitta Slice',
    sahifaga_xos_kod: 'Sahifaga Xos Kod Shu Yerda',
    segmentlar: 'Sahifa Segmentlari: ui, api, xato chegaralari',
    cross_import: "Sahifalar O'rtasida Cross-Import Taqiqi",
    steiger: 'Steiger Linteri Nazorati',
    xulosa: 'Xulosa va Keyingi Qadam'
  };
  const hold = {
    L1: 0.8,
    L4: 1.2,
    L7: 1.2,
    L10: 1.2,
    L12: 1.2,
    L14: 1.2,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'n birinchi bobi — pages qatlami. Pages — bu foydalanuvchi ko'radigan to'liq ekranlar va ilovaning marshrut sahifalaridir."],

    ['L2', 'sahifa_va_slice', "FSD 2.1 da asosiy qoida juda oddiy: odatda bitta sahifa — bitta slice hisoblanadi."],
    ['L3', 'sahifa_va_slice', "Masalan, bosh sahifa — pages/home, katalog sahifasi — pages/catalog, mahsulot sahifasi — pages/product."],
    ['L4', 'sahifa_va_slice', "Login va ro'yxatdan o'tish kabi bir-biriga juda yaqin ekranlar esa bitta pages/sign-in slice'ida jamlanishi mumkin."],

    ['L5', 'sahifaga_xos_kod', "Eng katta qulaylik: sahifaga xos barcha UI va yuklash so'rovlari to'g'ridan-to'g'ri shu sahifa ichida saqlanadi."],
    ['L6', 'sahifaga_xos_kod', "Masalan, faqat mahsulot sahifasida ishlatiladigan rasmlar galereyasi yoki maxsus skeleton boshqa qatlamga chiqarilmaydi."],
    ['L7', 'sahifaga_xos_kod', "Qayta ishlatilmaydigan kodni sun'iy ravishda widget yoki feature qilish shart emas — u sahifaning o'zida yashashi ma'qul."],

    ['L8', 'segmentlar', "Sahifa slice'ida asosan ui, yuklanish holatlari, xato chegaralari va kerakli api so'rovlari joylashadi."],
    ['L9', 'segmentlar', "Mahsulot sahifasi routerdan id parametrini oladi, ma'lumotni yuklaydi va tayyor komponentlarni bitta ekranga joylaydi."],
    ['L10', 'segmentlar', "Tashqi router konfiguratsiyasiga faqat index nuqtasi orqali toza ProductPage komponenti eksport qilinadi."],

    ['L11', 'cross_import', "Pages qatlamida ham qat'iy cross-import taqiqi mavjud: bitta sahifa ikkinchi sahifani import qila olmaydi."],
    ['L12', 'cross_import', "Masalan, cart sahifasi checkout sahifasini import qilolmaydi; agar ikkalasida umumiy blok bo'lsa, u widgets yoki entities qatlamiga tushiriladi."],

    ['L13', 'steiger', "Steiger linteri sahifalarning o'zaro to'g'ridan-to'g'ri import qilinmasligini va yuqori app qatlamiga murojaat qilmasligini tekshiradi."],
    ['L14', 'steiger', "Natijada har bir sahifa mustaqil bo'lib, loyihadagi marshrutlarni o'zgartirish yoki yangi sahifa qo'shish oson kechadi."],

    ['L15', 'xulosa', "Xulosa qilsak: pages — bu marshrut ekranlari, to'liq sahifalar va mustaqil slice'lar qatlamidir."],
    ['L16', 'xulosa', "Keyingi bobda butun ilovani ishga tushiruvchi eng yuqori qatlam — app bilan tanishamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
