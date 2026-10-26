// FSD 31-bob videosi: "Angular shabloni" (content/fsd/31-angular-shabloni.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'loyiha_tuzilmasi', 'app_qatlami', 'sahifa_va_komponentlar', 'rasmlar_va_aktivlar', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Angular 22 va FSD Shabloni',
    loyiha_tuzilmasi: 'Loyiha Daraxti va angular.json Sozlamalari',
    app_qatlami: 'App Qatlami, Entrypoint va Marshrutlar',
    sahifa_va_komponentlar: 'Sahifa, Feature va Entity Integratsiyasi',
    rasmlar_va_aktivlar: 'Slicelar Rasmlari va Aktivlar Boshqaruvi',
    tipik_xatolar: 'Angular FSD Tipik Xatolari',
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining o'ttiz birinchi bobi — zamonaviy Angular 22 uchun to'liq ishlab chiqarish shabloni. Bugun standalone komponentlar, signallar va Steiger linteri asosida mustahkam Angular FSD loyihasini quramiz."],
    ['L2', 'intro', "Angular CLI yaratadigan src app qatlami FSD bilan ajoyib tarzda mos keladi va NgModule siz mustaqil modulli arxitektura beradi."],

    ['L3', 'loyiha_tuzilmasi', "Loyiha ildizida angular nuqta json brauzer kirish nuqtasini src app entrypoint main nuqta te-es ga yo'naltiradi."],
    ['L4', 'loyiha_tuzilmasi', "Te-es-konfig da et belgisi orqali butun src papkasi xaritalanadi, barcha FSD qatlamlari uning ichida tartibli joylashadi."],
    ['L5', 'loyiha_tuzilmasi', "Steiger linteri Angular te-es fayllaridagi cross-import va public API buzilishlarini to'liq va avtomatik aniqlaydi."],

    ['L6', 'app_qatlami', "Entrypoint papkasidagi main nuqta te-es bootstrapApplication funksiyasi bilan App karkasini ishga tushiradi."],
    ['L7', 'app_qatlami', "app nuqta konfig router, http klient va inyekt tokenlarini tayyorlasa, app routes da sahifalar loadComponent bilan chaqiriladi."],

    ['L8', 'sahifa_va_komponentlar', "Mahsulot sahifasi withComponentInputBinding orqali marshrut parametridan id ni qabul qiladi va httpResource bilan ma'lumotni yuklaydi."],
    ['L9', 'sahifa_va_komponentlar', "Savatga qo'shish tugmasi feature qatlamida turib, injekt orqali savat servisi va api bilan mustaqil bog'lanadi."],
    ['L10', 'sahifa_va_komponentlar', "Mahsulot kartasi esa entity qatlamida joylashib, ng-content proyeksiyasi orqali harakat tugmalarini tashqaridan qabul qiladi."],

    ['L11', 'rasmlar_va_aktivlar', "Slicelardagi rasmlar uchun ikki usul mavjud: angular nuqta json dagi asset glob yoki esbuild fayl loaderi."],
    ['L12', 'rasmlar_va_aktivlar', "Esbuild loaderi import qilingan fayl nomiga xesh qo'shadi, bu esa brauzer keshini boshqarish uchun eng qulay yondashuvdir."],

    ['L13', 'tipik_xatolar', "Tipik xatolar — kodni services, pipes yoki components kabi eski papkalarga ajratish va public API ni chetlab o'tishdir."],
    ['L14', 'tipik_xatolar', "Shuningdek, interceptorlarni feature ichiga tiqish yoki butun servislarni root tarzida shared da to'plash qat'iyan taqiqlanadi."],

    ['L15', 'xulosa', "Xulosa: Angular 22 ning zoneless va signal imkoniyatlari FSD qatlamlari bilan mukammal darajada birlashadi."],
    ['L16', 'xulosa', "Keyingi o'ttiz ikkinchi bobda monorepo va bir nechta FSD ildizlari bilan ishlashni o'rganamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
