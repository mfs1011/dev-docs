// SQL 17-bob, 1-video: "Tushuncha" — View va Materialized View
(function (g) {
  const scenes = ['intro', 'view_tushunchasi', 'updatable_va_check', 'materialized_view', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: View va Materialized View',
    view_tushunchasi: 'View: Nomlangan virtual so‘rov',
    updatable_va_check: 'Yangilanadigan view va CHECK OPTION',
    materialized_view: 'Materialized view va REFRESH',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L2: 1.0,
    L3: 1.0,
    L4: 1.0,
    L5: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Ushbu darsda SQL da view tushunchasi, yangilanadigan viewlar, WITH CHECK OPTION hamda ma’lumotni saqlovchi materialized viewlar bilan tanishamiz.'],

    ['L2', 'view_tushunchasi', 'View — bu diskda ma’lumot saqlamaydigan nomlangan so‘rovdir. U murakkab jadvallar tuzilmasini o‘zgarmas qulay interfeys ortiga yashirib, har chaqirilganda qayta bajariladi.'],

    ['L3', 'updatable_va_check', 'Oddiy bitta jadvalga tayangan viewlar orqali asosiy jadvalga yozish mumkin. WITH CHECK OPTION esa view chegarasidan chiqib ketadigan yangi yoki o‘zgartirilgan qatorlarni rad etadi.'],

    ['L4', 'materialized_view', 'Materialized view esa so‘rov natijasini alohida jadval qilib diskda saqlaydi. U juda tez o‘qiladi, ma’lumot esa REFRESH buyrug‘i bilan, hatto CONCURRENTLY rejimida yangilab boriladi.'],

    ['L5', 'xulosa', 'Tezkor virtual interfeys uchun oddiy view, og‘ir tahliliy hisobotlar uchun esa materialized view eng to‘g‘ri arxitektura yechimidir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
