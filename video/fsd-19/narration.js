// FSD 19-bob videosi: "Qaror daraxti: kod qayerga?" (content/fsd/19-qaror-daraxti.md). Ovoz — Kore, metafora — qaror daraxti va element evolyutsiyasi.
(function (g) {
  const scenes = ['intro', 'daraxt_asosiy', 'sahifalar_va_lokallik', 'widgets_features_entities', 'element_hayoti', 'steiger', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Kod Qayerga Boradi?',
    daraxt_asosiy: 'Qaror Daraxti: Yuqoridan Pastga',
    sahifalar_va_lokallik: 'Eng Muhim Tamoyil: Sahifadan Boshlash',
    widgets_features_entities: 'Widget, Feature yoki Entity?',
    element_hayoti: 'Bitta Element Hayoti: Yulduzchalar Misoli',
    steiger: 'Steiger Linteri va Qatlamlar Tartibi',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'n to'qqizinchi bobi — Qaror daraxti: kod qayerga boradi? Bugun yangi yozilgan har qanday kodni qaysi qatlamga qo'yishni bir necha soniyada aniqlash algoritmini o'rganamiz."],
    ['L2', 'intro', "FSD me'moriyatida eng ko'p beriladigan savol — bu yangi komponent yoki funksiyaning joyini tanlashdir. Buning uchun aniq va sodda qaror daraxti mavjud."],

    ['L3', 'daraxt_asosiy', "Boshlang'ich qoida: kod ilovani ishga tushirish, sozlash yoki routerga tegishlimi? Ha bo'lsa — to'g'ridan-to'g'ri app qatlamiga."],
    ['L4', 'daraxt_asosiy', "Agar kod loyihadan tashqarida ham ma'noga ega bo'lgan sof texnik element bo'lsa, masalan tugma yoki sana formati — u shared poydevoriga boradi."],

    ['L5', 'sahifalar_va_lokallik', "Uchinchi va eng muhim savol: bu kod faqat bitta sahifada ishlatiladimi? Agar javob ha bo'lsa — ikkilanmasdan joriy pages qatlamida qoldiring."],
    ['L6', 'sahifalar_va_lokallik', "FSD ning oltin tamoyili — doimo eng lokal joydan boshlashdir. Kodni oldindan umumiy qatlamlarga tushirish chalkashliklarga olib keladi."],
    ['L7', 'sahifalar_va_lokallik', "Qachonki haqiqiy ikkinchi sahifa xuddi shu kodga muhtoj bo'lsagina, uni pastroq qatlamlarga ko'chirish tavsiya etiladi."],

    ['L8', 'widgets_features_entities', "Agar kod bir nechta joyda ishlatilsa: u katta mustaqil blok bo'lsa — widgets, masalan header yoki filtrlar paneli."],
    ['L9', 'widgets_features_entities', "Agar u foydalanuvchining aniq bir harakati bo'lsa — features, masalan savatga qo'shish yoki sharh yuborish."],
    ['L10', 'widgets_features_entities', "Agar u shunchaki biznes obyekti, uning ko'rinishi yoki qoidasi bo'lsa — entities, masalan mahsulot kartasi yoki foydalanuvchi ma'lumoti."],

    ['L11', 'element_hayoti', "Keling, mahsulot reytingi hayotini ko'rib chiqamiz: dastlab u faqat mahsulot sahifasida turadi, keyin esa katalog kartasiga ham kerak bo'lib entities ga o'tadi."],
    ['L12', 'element_hayoti', "Vaqt o'tib foydalanuvchi baholashi qo'shilgach — u rate-product feature'siga aylanadi, to'liq sharhlar bloki esa widget ga jamlanadi."],
    ['L13', 'element_hayoti', "Shunday qilib, loyiha o'sgani sari kodning o'rni tabiiy ravishda kengayib boradi."],

    ['L14', 'steiger', "Steiger linteri loyihangizdagi har bir import yo'nalishini tekshirib, qatlamlar iyerarxiyasiga to'liq rioya qilinishini nazorat qiladi."],
    ['L15', 'steiger', "Qaror daraxtiga qat'iy amal qilinganda, linter barcha modullarni yashil tasdiq bilan qabul qiladi."],

    ['L16', 'xulosa', "Xulosa qilsak: doimo sahifadan boshlang, fe'llarni features ga, otlarni entities ga bering va qaror daraxtidan foydalaning. Keyingi bobda API so'rovlari arxitekturasini o'rganamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
