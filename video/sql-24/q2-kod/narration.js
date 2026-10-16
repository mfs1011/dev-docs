// SQL 24-bob, 2-video: "Kod" — PostgreSQL 18 da Saralash va Sahifalash Amaliyoti
(function (g) {
  const scenes = ['intro', 'nulls_order_demo', 'pagination_demo', 'with_ties_demo', 'multi_column_demo', 'xulosa'];
  const sceneNames = {
    intro: 'PostgreSQL 18: Sinov jadvali va vazifalar',
    nulls_order_demo: 'ORDER BY va NULLS LAST amaliyoti',
    pagination_demo: 'LIMIT va OFFSET bilan barqaror sahifalash',
    with_ties_demo: 'FETCH FIRST va WITH TIES amaliyoti',
    multi_column_demo: 'Bir nechta ustun bo‘yicha saralash',
    xulosa: 'Amaliy xulosalar va tavsiyalar'
  };
  const hold = {
    L1: 0.8,
    L2: 1.0,
    L3: 1.2,
    L4: 1.0,
    L5: 1.0,
    L6: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Ushbu amaliy qismda PostgreSQL 18 da talabalar jadvali misolida ORDER BY, NULLS LAST va sahifalash imkoniyatlarini sinab ko‘ramiz.'],

    ['L2', 'nulls_order_demo', 'Kamayish tartibida saralanganda bali bo‘lmagan Sobir boshiga chiqib qoladi; uni oxiriga tushirish uchun NULLS LAST bandi qo‘shiladi.'],

    ['L3', 'pagination_demo', 'LIMIT va OFFSET yordamida har bir sahifada ikkitadan talaba olinadi; tartib doim barqaror bo‘lishi uchun esa ikkinchi ustun sifatida id beriladi.'],

    ['L4', 'with_ties_demo', 'Standartdagi FETCH FIRST va WITH TIES sintaksisi esa eng yuqori ballni teng olgan Vali va Dilnozani birgalikda tanlab oladi.'],

    ['L5', 'multi_column_demo', 'Bir nechta ustun bo‘yicha saralashda guruh o‘sish, ball esa kamayish tartibida alohida yo‘nalish bilan xatosiz boshqariladi.'],

    ['L6', 'xulosa', 'Baza bilan ishlashda doimo deterministik tartibni ta’minlash va NULLS LAST dan foydalanish to‘g‘ri ma’lumot berish garovidir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
