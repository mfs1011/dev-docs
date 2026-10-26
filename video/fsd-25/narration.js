// FSD 25-bob videosi: "Assetlar, stillar va i18n" (content/fsd/25-assetlar-va-i18n.md). Ovoz — Kore.
(function (g) {
  const scenes = ['intro', 'oltin_qoida', 'joylashuv_xaritasi', 'i18n_arxitekturasi', 'kod_va_import', 'tipik_xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Assetlar va Stillar Falsafasi',
    oltin_qoida: 'Oltin Qoida: Turi Emas, Ishlatilishi Bo\'yicha',
    joylashuv_xaritasi: 'Fayllar Xaritasi va Qatlamlar Bo\'yicha Taqsimot',
    i18n_arxitekturasi: 'i18n Arxitekturasi: Global va Sahifa Darajasi',
    kod_va_import: 'Kod Namunasi: Nisbiy Import va Build Sozlamalari',
    tipik_xatolar: 'Asset Boshqaruvidagi Tipik Xatolar',
    xulosa: 'Xulosa va Tavsiyalar'
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
    ['L1', 'intro', "Salom! Bu FSD qo'llanmasining yigirma beshinchi bobi — Assetlar, stillar va i18n tizimi. Bugun rasmlar, ikonkalar, shriftlar, PDF shablonlar va ko'p tillilik sozlamalarini FSD da to'g'ri joylashtirishni o'rganamiz."],
    ['L2', 'intro', "Assetlar va stillar qaysi qatlamda turishi kerak? Asosiy qoida: turi bo'yicha emas, balki ishlatilishi bo'yicha!"],

    ['L3', 'oltin_qoida', "Ko'plab an'anaviy loyihalarda barcha rasm va ikonkalarni bitta umumiy assets papkasiga tiqib qo'yishadi. FSD da esa bu usul qat'iyan tavsiya etilmaydi."],
    ['L4', 'oltin_qoida', "Asosiy tamoyil: asset qayerda ishlatilsa, aynan o'sha kod yonida turishi lozim. Masalan, faqat Bosh sahifaga tegishli banner pages/home/ui ichida saqlanadi."],
    ['L5', 'oltin_qoida', "Agar rasm yoki ikonka bir nechta mustaqil joyda qayta ishlatilsa — u shared/ui papkasiga ko'chiriladi."],

    ['L6', 'joylashuv_xaritasi', "Fayllar xaritasiga nazar solsak: Bosh sahifada hero nuqta jpg, billing modelida invoice-template nuqta pdf, shared da esa umumiy chevron svg ikonkalari turadi."],
    ['L7', 'joylashuv_xaritasi', "Global stillar va reset qoidalari app/styles da, umumiy shriftlar esa app/fonts yoki public katalogida joylashadi."],

    ['L8', 'i18n_arxitekturasi', "Ko'p tillilik, ya'ni i18n tizimi ham qatlamlarga bo'linadi. Kutubxona sozlamasi va barcha uchun umumiy satrlar shared/i18n da saqlanadi."],
    ['L9', 'i18n_arxitekturasi', "Sahifaga xos maxsus tarjimalar esa o'sha sahifa ichida, masalan pages/checkout/i18n papkasida joylashtirilib, sahifa ochilgandagina lazy usulda yuklanadi."],
    ['L10', 'i18n_arxitekturasi', "I18n provayderi esa butun ilovani o'rab turishi uchun eng yuqoridagi app/providers qatlamida ulanadi."],

    ['L11', 'kod_va_import', "Komponentlarda rasmlar to'g'ridan-to'g'ri nisbiy yo'l orqali import qilinadi: masalan, import heroUrl from './hero.jpg'."],
    ['L12', 'kod_va_import', "Angular loyihalarida esa slice rasmlari angular.json dagi assets glob orqali yoki esbuild file loader vositasida build natijasiga nusxalanadi."],

    ['L13', 'tipik_xatolar', "Tipik xatolar: barcha rasmlarni bitta src/assets ga jamlash, sahifa stillarini app/styles ga tiqish va barcha tarjimalarni bitta ulkan faylda saqlashdir."],
    ['L14', 'tipik_xatolar', "Markazlashtirilgan katta assets papkasi vaqt o'tishi bilan o'lik fayllar qabristoniga aylanadi, chunki ularni qaysi sahifa ishlatishini aniqlash qiyinlashadi."],

    ['L15', 'xulosa', "Xulosa: assetlarni ularni ishlatadigan kod yonida saqlang, global stillarni app qatlamiga bering, i18n ni esa shared va slice larda taqsimlang."],
    ['L16', 'xulosa', "Keyingi bobda FSD arxitekturasida marshrutlash va sahifalarni lazy loading qilish strategiyalarini batafsil o'rganamiz. Rahmat!"]
  ].map(([id, scene, text]) => ({ id, scene, text }));

  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
