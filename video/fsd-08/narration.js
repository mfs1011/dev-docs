// FSD 8-bob videosi: "entities" (content/fsd/08-entities.md). Ovoz — Kore, metafora — bino xonalari.
(function (g) {
  const scenes = ['intro', 'tushuncha', 'segmentlar', 'harakat_qoidasi', 'cross_import', 'steiger', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Biznes Obyektlari',
    tushuncha: "Real Dunyo Obyektlari va Slice'lar",
    segmentlar: 'Entity Ichki Tuzilishi: model, ui, api',
    harakat_qoidasi: 'Eng Muhim Qoida: Harakat Tashqaridan',
    cross_import: "Cross-Import Taqiqi va Bog'liqlik",
    steiger: 'Steiger Tekshiruvi va Xatolar',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining sakkizinchi bobi — entities qatlami. Entities — bu loyihadagi real dunyo tushunchalari va biznes modellari."],

    ['L2', 'tushuncha', "Biznes o'z mahsulotini tasvirlashda ishlatadigan otlar: user, product, order yoki post aynan shu qatlamda joylashadi."],
    ['L3', 'tushuncha', "Shared'dan farqli ravishda, bu yerda har bir entity mustaqil slice sifatida tashkil etiladi."],
    ['L4', 'tushuncha', "Har bir slice o'z modeliga, ko'rinishiga va public API darvozasiga ega bo'ladi."],

    ['L5', 'segmentlar', "Model segmenti — ma'lumot tiplari, validatsiya va ob'ektning sof biznes qoidalarini saqlaydi."],
    ['L6', 'segmentlar', "Ui segmenti esa qayta ishlatiladigan kartalar, avatarlar yoki qatorlarni o'z ichiga oladi."],
    ['L7', 'segmentlar', "Api segmentida esa faqat shu ob'ektga xos maxsus so'rovlar turadi, oddiy operatsiyalar esa shared'da qolgani ma'qul."],

    ['L8', 'harakat_qoidasi', "Entity UI o'zida harakat yoki mutatsiya tugmalarini qat'iy o'rnatmasligi kerak."],
    ['L9', 'harakat_qoidasi', "Masalan, Prodakt-kard savatga qo'shish tugmasini bilmaydi — tugma slot yoki props orqali tashqaridan uzatiladi."],
    ['L10', 'harakat_qoidasi', "Buning sharofati bilan bir xil karta do'konda ham, sevimlilar ro'yxatida ham erkin qayta ishlatiladi."],

    ['L11', 'cross_import', "Entity'lar bir-birini to'g'ridan-to'g'ri import qila olmaydi: order bevosita product'ga bog'lanmasligi lozim."],
    ['L12', 'cross_import', "Ular orasidagi o'zaro ta'sir yuqoriroq qatlamlarda — features yoki pages'da kompozitsiya qilinadi."],

    ['L13', 'steiger', "Steiger linteri no-cross-imports qoidasi orqali entity'lar o'rtasidagi to'g'ridan-to'g'ri bog'liqlikni darhol aniqlaydi."],
    ['L14', 'steiger', "Xatolik bartaraf etilgach, har bir entity boshqasiga qaram bo'lmagan mustaqil modulga aylanadi."],

    ['L15', 'xulosa', "Xulosa qilsak: entities — biznes otlari, mustaqil slice'lar va harakatsiz toza ko'rinishlar qatlamidir."],
    ['L16', 'xulosa', "Keyingi bobda foydalanuvchi harakatlarini boshqaruvchi features qatlamini ko'rib chiqamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
