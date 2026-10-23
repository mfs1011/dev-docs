// FSD 9-bob videosi: "features" (content/fsd/09-features.md). Ovoz — Kore, metafora — bino xonalari va harakatlar.
(function (g) {
  const scenes = ['intro', 'entity_vs_feature', 'qayta_ishlatish', 'segmentlar', 'cross_import', 'steiger', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Foydalanuvchi Amallari',
    entity_vs_feature: 'Entity va Feature Farqi',
    qayta_ishlatish: 'Qayta Ishlatish va Chegaralar',
    segmentlar: 'Feature Ichki Tuzilishi: ui, api, model',
    cross_import: "Feature'lar O'rtasida Cross-Import Taqiqi",
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining to'qqizinchi bobi — features qatlami. Features — bu foydalanuvchiga real qiymat beruvchi asosiy harakatlar va amallardir."],

    ['L2', 'entity_vs_feature', "Entity dastur ishlaydigan otlar bo'lsa, feature esa ular ustida bajariladigan aniq fe'llardir."],
    ['L3', 'entity_vs_feature', "Masalan: mahsulot bu entity, uni savatga qo'shish yoki izoh qoldirish esa alohida feature hisoblanadi."],
    ['L4', 'entity_vs_feature', "Lekin eng muhim qoida: har qanday kichik amal ham feature bo'lavermaydi."],

    ['L5', 'qayta_ishlatish', "Harakat mustaqil feature bo'lishi uchun u bir nechta sahifada qayta ishlatilishi shart."],
    ['L6', 'qayta_ishlatish', "Faqat bitta sahifaga xos yagona amalni alohida feature qilish o'rniga, to'g'ridan-to'g'ri o'sha sahifaning o'zida qoldirish ma'qul."],
    ['L7', 'qayta_ishlatish', "Yangi dasturchi pages va features ro'yxatiga qarab, loyiha nimalarga qodirligini bir qarashda tushunishi kerak."],

    ['L8', 'segmentlar', "Har bir feature slice'i odatda harakat tugmasi yoki formasi, api so'rovlari va validatsiya modelidan tashkil topadi."],
    ['L9', 'segmentlar', "Ed-tu-kart tugmasi bosilganda serverga so'rov yuboriladi va kesh optimistik tarzda yangilanadi."],
    ['L10', 'segmentlar', "Barcha bu mantiq ixcham index nuqtasi orqali bitta tayyor komponent sifatida tashqariga eksport qilinadi."],

    ['L11', 'cross_import', "Xuddi entity'lardagi kabi, bitta feature ikkinchi feature'ni to'g'ridan-to'g'ri import qila olmaydi."],
    ['L12', 'cross_import', "Masalan, add-to-cart va apply-promo-code faqat yuqoridagi widget yoki sahifa qatlamida o'zaro birlashtiriladi."],

    ['L13', 'steiger', "Steiger linteri feature slice'larining to'g'ri shakllanishini va taqiqlangan o'zaro importlarni doimiy tekshirib boradi."],
    ['L14', 'steiger', "Har bir harakat mustaqil qolganda tizimni kengaytirish va yangi sahifalarga ko'chirish osonlashadi."],

    ['L15', 'xulosa', "Xulosa qilsak: features — qiymat beruvchi takrorlanuvchi harakatlar, mustaqil slice'lar va aniq fe'llar qatlamidir."],
    ['L16', 'xulosa', "Keyingi bobda yirik bloklarni birlashtiruvchi widgets qatlami bilan tanishamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
