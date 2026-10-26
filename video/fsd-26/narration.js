// FSD 26-bob videosi: "Marshrutlash va lazy loading" (content/fsd/26-marshrutlash.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'app_va_shared_routes', 'guard_va_auth', 'lazy_loading_va_public_api', 'kod_namunalari', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Marshrutlash va Lazy Loading',
    app_va_shared_routes: 'Ikki Tomon: app/routes va shared/routes',
    guard_va_auth: 'Navigatsiya Guardlari va Sessiya Tekshiruvi',
    lazy_loading_va_public_api: 'Lazy Loading va Public API Qoidasi',
    kod_namunalari: 'Kod Namunasi: React, Vue va Angular',
    tipik_xatolar: 'Marshrutlashdagi Tipik Xatolar',
    xulosa: 'Xulosa va Keyingi Qadam'
  };
  const hold = {
    L1: 0.8,
    L5: 1.2,
    L7: 1.2,
    L10: 1.2,
    L12: 1.2,
    L14: 1.2,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining yigirma oltinchi bobi — Marshrutlash va lazy loading strategiyalari. Bugun marshrutlar daraxti, URL konstantalari, navigatsiya guardlari va sahifalarni alohida chunk sifatida yuklashni o'rganamiz."],
    ['L2', 'intro', "FSD da marshrutlash tizimi qatlamlar intizomiga qat'iy rioya qiladi va ikki asosiy markazga bo'linadi."],

    ['L3', 'app_va_shared_routes', "Birinchi markaz — app/routes. Bu yerda to'liq router daraxti, sahifalarni bog'lash va navigatsiya guardlari konfiguratsiya qilinadi, chunki faqat app barcha sahifalarni biladi."],
    ['L4', 'app_va_shared_routes', "Ikkinchi markaz — shared/routes. Pastki qatlamlardagi widget, feature yoki entity'lar havola berish yoki redirect qilish uchun URL manzillariga muhtoj."],
    ['L5', 'app_va_shared_routes', "Ular app qatlamidan import qila olmagani sababli, barcha URL konstantalari va marshrut yasovchi funksiyalar shared/routes ichiga joylashtiriladi."],

    ['L6', 'guard_va_auth', "Sahifalarni himoyalovchi guard mantiqi shared/auth yoki entities/session qatlamida qayta ishlatiladigan sof funksiya sifatida yoziladi."],
    ['L7', 'guard_va_auth', "Masalan, tizimga kirmagan foydalanuvchi checkout sahifasiga o'tsa, guard uni returnTo parametri bilan birga avtorizatsiya sahifasiga yo'naltiradi."],

    ['L8', 'lazy_loading_va_public_api', "Ilovaning dastlabki yuklanish tezligini oshirish uchun deyarli barcha sahifalar alohida chunk sifatida lazy import qilinishi shart."],
    ['L9', 'lazy_loading_va_public_api', "Bu yerda eng muhim qoida: sahifa faqat o'zining index nuqta ts public API fayli orqali lazy import qilinishi kerak."],
    ['L10', 'lazy_loading_va_public_api', "Ichki ui qismiga to'g'ridan-to'g'ri chuqur yo'l bilan kirish public API ni chetlab o'tish hisoblanadi va qat'iyan taqiqlanadi."],

    ['L11', 'kod_namunalari', "React va Vue loyihalarida router dinamik import va loader orqali sahifani chaqiradi, Angular da esa loadComponent va funksional guard ishlatiladi."],
    ['L12', 'kod_namunalari', "Bosh sahifa tezkor chiqishi uchun eager, qolgan ikkinchi darajali barcha sahifalar esa faqat URL ga kirilganda yuklanadi."],

    ['L13', 'tipik_xatolar', "Tipik xatolar: sahifa public API sini chetlab o'tish, URL satrlarini komponentlar ichida hardcode qilish va feature lardan app/routes ga teskari import qilishdir."],
    ['L14', 'tipik_xatolar', "Shuningdek, frontend dagi navigatsiya guardlari faqat foydalanuvchi qulayligi uchun, haqiqiy ma'lumot xavfsizligi esa har doim backend da tekshiriladi."],

    ['L15', 'xulosa', "Xulosa: router konfiguratsiyasini app da, URL konstantalarini shared da saqlang va sahifalarni faqat public API orqali lazy yuklang."],
    ['L16', 'xulosa', "Keyingi bobda FSD arxitekturasining React va Vite uchun ishlab chiqilgan tayyor ishlab chiqarish shablonini ko'rib chiqamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
