// SQL 11-bob, 1-video: "Tushuncha" — Kodlash va collation tushunchalari
(function (g) {
  const scenes = ['intro', 'concepts', 'effects', 'providers', 'deterministic', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Kodlash va collation',
    concepts: 'Kodlash vs Collation mohiyati',
    effects: 'Collation nimalarga ta’sir qiladi',
    providers: 'Mintaqalar va provayderlar (libc, ICU)',
    deterministic: 'Deterministik va nondeterministik collation',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L3: 1.0,
    L5: 1.0,
    L7: 1.0,
    L9: 1.0,
    L11: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! O‘n birinchi bobda ma’lumotlar bazasida matnlar qanday saqlanishi va saralanishini belgilovchi kodlash hamda collation tushunchalari bilan tanishamiz.'],

    ['L2', 'concepts', 'Kodlash, ya’ni character set — harflar va ularning raqamli kodlari to‘plamidir. Masalan, A harfiga nol, B harfiga bir raqami to‘g‘ri keladi.'],
    ['L3', 'concepts', 'Collation esa ushbu belgilarni o‘zaro solishtirish va saralash qoidalaridir. Nol birdan kichik bo‘lgani uchun A B dan oldin kelishi collation orqali aniqlanadi.'],

    ['L4', 'effects', 'Collation bazadagi eng muhim amallarni boshqaradi: ORDER BY tartibi, tenglik va taqqoslashlar, upper va lower funksiyalari, hamda LIKE qidiruvi.'],
    ['L5', 'effects', 'Shuni unutmang: murakkab milliy mintaqalar saralashni sekinlashtirishi mumkin, oddiy C mintaqasi esa faqat baytlar bo‘yicha eng tez ishlaydi.'],

    ['L6', 'providers', 'PostgreSQL da mintaqa provayderlari uch xil bo‘ladi: operatsion tizimning libc kutubxonasi, platformadan mustaqil ICU, hamda ichki builtin provayderi.'],
    ['L7', 'providers', 'Eng muhim cheklov: bazaning LC_COLLATE va LC_CTYPE sozlamalari yaratilishda belgilanadi va keyin o‘zgartirib bo‘lmaydi! Chunki indekslar buzilib ketishi mumkin.'],

    ['L8', 'deterministic', 'Collationlar deterministik va nondeterministik turlarga bo‘linadi. Deterministik collation faqat baytlari bir xil bo‘lgan satrlarnigina teng deb hisoblaydi.'],
    ['L9', 'deterministic', 'Nondeterministik collation esa katta-kichik harflardan qat’i nazar, masalan katta Salom bilan kichik salomni teng deb ko‘rish imkonini beradi.'],

    ['L10', 'xulosa', 'Xulosa: o‘zbek tili kabi maxsus alifbolarni to‘g‘ri saralash va harflar registrini boshqarishda mos collation tanlash juda muhimdir.'],
    ['L11', 'xulosa', 'Keyingi qismda ushbu qoidalarni PostgreSQL terminalida o‘zbekcha so‘zlar bilan amalda sinab ko‘ramiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
