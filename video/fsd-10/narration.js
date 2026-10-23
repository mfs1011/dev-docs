// FSD 10-bob videosi: "widgets" (content/fsd/10-widgets.md). Ovoz — Kore, metafora — bino xonalari va yirik bloklar.
(function (g) {
  const scenes = ['intro', 'kompozitsiya', 'qachon_ishlatish', 'segmentlar', 'cross_import', 'steiger', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Yirik UI Bloklari',
    kompozitsiya: 'Widget — Qatlamlar Kompozitsiyasi',
    qachon_ishlatish: 'Qachon Widget, Qachon Sahifa?',
    segmentlar: 'Widget Tuzilishi va Header Misoli',
    cross_import: "Widget'lar O'rtasida Cross-Import Taqiqi",
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'ninchi bobi — widgets qatlami. Widgets — bu butun bir foydalanish ssenariysini qamrab oluvchi, mustaqil va yirik interfeys bloklaridir."],

    ['L2', 'kompozitsiya', "Widget alohida kichik element emas, balki bir nechta feature, entity va shared komponentlarini birlashtiruvchi kompozitsiya qatlamidir."],
    ['L3', 'kompozitsiya', "Masalan, sayt bosh qismi — Header widget'i: unda logo, qidiruv feature'i, savat hisoblagichi va profil menyusi jamlanadi."],
    ['L4', 'kompozitsiya', "Sahifa esa ushbu yirik bloklarni qulay joylashtirib, foydalanuvchiga to'liq ekran sifatida taqdim etadi."],

    ['L5', 'qachon_ishlatish', "Widget qachon ochilishi kerak? Birinchidan, agar UI bloki bir nechta sahifada takrorlansa — masalan, Header yoki Footer."],
    ['L6', 'qachon_ishlatish', "Ikkinchidan, sahifa mustaqil katta qismlardan iborat bo'lsa: masalan, dashboard'dagi tahlil bloklari yoki filtrlar paneli."],
    ['L7', 'qachon_ishlatish', "Agar blok faqat bitta sahifada ishlatilsa va kichik bo'lsa, uni widget qilish shart emas — sahifaning o'zida qolishi to'g'ri."],

    ['L8', 'segmentlar', "Har bir widget slice'i o'z ui papkasiga, kerak bo'lsa model va lib qismlariga ega bo'ladi."],
    ['L9', 'segmentlar', "Header misolida ko'rsak, u turli qatlamlardan kelgan komponentlarni bir joyga yig'adi va toza layout yaratadi."],
    ['L10', 'segmentlar', "Barcha bu yaxlit blok tashqi olamga index nuqtasi orqali yagona Header sifatida eksport qilinadi."],

    ['L11', 'cross_import', "FSD arxitekturasining qat'iy qoidasi: widget'lar bir-birini to'g'ridan-to'g'ri import qila olmaydi."],
    ['L12', 'cross_import', "Masalan, header widget'i sidebar widget'ini import qila olmaydi; ularni sahifa yoki app qatlami o'zaro birlashtiradi."],

    ['L13', 'steiger', "Steiger linteri widget slice'larining o'zaro cross-import qilinmasligini va to'g'ri qatlamlardan foydalanishini nazorat qiladi."],
    ['L14', 'steiger', "Har bir widget o'z chegarasida mustaqil qolganda, dizaynni o'zgartirish va boshqa sahifalarga ko'chirish oson kechadi."],

    ['L15', 'xulosa', "Xulosa qilsak: widgets — bu yirik mustaqil bloklar, bir nechta qatlamning kompozitsiyasi va qulay interfeys g'ishtchalaridir."],
    ['L16', 'xulosa', "Keyingi bobda marshrutlar va to'liq ekranlarni ifodalovchi pages qatlami bilan tanishamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
