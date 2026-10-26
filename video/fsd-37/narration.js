// FSD 37-bob videosi: "Amaliy loyiha: do'kon frontendi" (content/fsd/37-amaliy-loyiha.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'bosqich1_uch_qatlam', 'bosqich2_3_takrorlanish', 'bosqich4_5_header_admin', 'steiger_metrikalari', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: "Bozor" Do\'koni Frontendi va Bosqichli Yondashuv',
    bosqich1_uch_qatlam: '1-Bosqich: Boshlanishida Faqat Uch Qatlam (app, pages, shared)',
    bosqich2_3_takrorlanish: '2 va 3-Bosqichlar: Takrorlanish va Kompozitsiya (Slot/Prop)',
    bosqich4_5_header_admin: '4 va 5-Bosqichlar: Header Widget va Admin Slice Guruhi',
    steiger_metrikalari: 'Steiger Nazorati: insignificant-slice va excessive-slicing',
    tipik_xatolar: 'Loyihani Shakllantirishdagi Tipik Xatolar',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'ttiz yettinchi bobi — butun FSD nazariyasini \"Bozor\" onlayn do'koni frontendida bosqichma-bosqich qo'llash."],
    ['L2', 'intro', "Asosiy falsafa: loyihani birinchi kundan yigirma beshta bo'sh papka bilan emas, ehtiyojga qarab bosqichma-bosqich kengaytirish kerak."],

    ['L3', 'bosqich1_uch_qatlam', "Birinchi bosqichda faqat uchta qatlam ochiladi: app, pages va shared; katalog, mahsulot, savat va checkout sahifalari quriladi."],
    ['L4', 'bosqich1_uch_qatlam', "Mahsulot kartasi hozircha katalog sahifasi ichida turadi; uni oldindan entities ga chiqarish Steiger da xatolik beradi."],

    ['L5', 'bosqich2_3_takrorlanish', "Ikkinchi bosqichda qidiruv sahifasi ham mahsulot kartasini so'raganida, u entities product ga olib chiqiladi."],
    ['L6', 'bosqich2_3_takrorlanish', "Uchinchi bosqichda bir nechta sahifada savatga qo'shish harakati paydo bo'lgach, features add-to-cart komponenti yaratiladi."],
    ['L7', 'bosqich2_3_takrorlanish', "Diqqat: entity hech qachon feature ni import qilmaydi, tugma kartaga actions sloti yoki prop orqali uzatiladi."],

    ['L8', 'bosqich4_5_header_admin', "To'rtinchi bosqichda barcha sahifalar uchun umumiy bo'lgan widgets header va asosiy layout shakllantiriladi."],
    ['L9', 'bosqich4_5_header_admin', "Beshinchi bosqichda admin paneli buyurtmalari uchun pages admin-order slice guruhi ochilib, tartibsizlik oldi olinadi."],

    ['L10', 'steiger_metrikalari', "Stayger loyihani har bosqichda tekshirib boradi: agar bitta joyda ishlatilgan slice bo'lsa insignificant-slice xatosi chiqadi."],
    ['L11', 'steiger_metrikalari', "Agar qatlamda yigirmadan ortiq bo'linmagan slice to'planib qolsa, Stayger excessive-slicing orqali guruhlashni talab qiladi."],

    ['L12', 'tipik_xatolar', "Tipik xatolar — birinchi kunda barcha qatlamlarni sun'iy yaratish hamda mahsulot kartasi ichida savat tugmasini qattiq import qilishdir."],
    ['L13', 'tipik_xatolar', "Shuningdek, admin sahifalarini guruhsiz tekis tashlab qo'yish va Stayger ogohlantirishlarini e'tiborsiz qoldirish xatodir."],

    ['L14', 'xulosa', "Xulosa: FSD da arxitektura oldindan bashorat qilinmaydi, balki haqiqiy biznes takrorlanishlari asosida tabiiy o'sib boradi."],
    ['L15', 'xulosa', "Keyingi o'ttiz sakkizinchi bobda FSD arxitekturasini kod-revyu qilish bo'yicha to'liq cheklistni ko'rib chiqamiz."],
    ['L16', 'xulosa', "E'tiboringiz uchun rahmat, amaliyotda toza va barqaror tizimlar quring!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
