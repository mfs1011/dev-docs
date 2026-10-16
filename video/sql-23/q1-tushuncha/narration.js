// SQL 23-bob, 1-video: "Tushuncha" — SQL da WHERE va Filtrlash Asoslari
(function (g) {
  const scenes = ['intro', 'between_range', 'in_null_trap', 'distinct_from', 'pattern_search', 'xulosa'];
  const sceneNames = {
    intro: 'WHERE va uch qiymatli mantiq',
    between_range: 'BETWEEN va BETWEEN SYMMETRIC',
    in_null_trap: 'IN va NOT IN dagi NULL tuzog‘i',
    distinct_from: 'IS DISTINCT FROM va NULL xavfsizligi',
    pattern_search: 'LIKE, ILIKE va Regex bilan qidiruv',
    xulosa: 'Filtrlashning oltin qoidalari'
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
    ['L1', 'intro', 'SQL da WHERE bandi ma’lumotlarni filtrlash uchun xizmat qiladi: u faqat shart rost bo‘lgan qatorlarni tanlab oladi, yolg‘on yoki noaniq NULL natijalarni esa butunlay chiqarib tashlaydi.'],

    ['L2', 'between_range', 'BETWEEN operatori belgilangan ikki chegara oralig‘idagi qiymatlarni tekshiradi va ikkala chekka qiymatni ham kiritadi; chegaralar teskari bo‘lsa esa faqat BETWEEN SYMMETRIC yordamga keladi.'],

    ['L3', 'in_null_trap', 'IN ro‘yxatdagi tengliklarni tekshiradi, ammo NOT IN ro‘yxatida bitta bo‘lsa ham NULL uchrasa, butun ifoda noaniq bo‘lib qoladi va natijada birorta ham qator qaytmaydi.'],

    ['L4', 'distinct_from', 'Oddiy tengsizlik operatori NULL qiymatlarni yo‘qotib yuboradi; barcha noma’lum qatorlarni ham xavfsiz hisobga olish uchun esa IS DISTINCT FROM konstruksiyasidan foydalaniladi.'],

    ['L5', 'pattern_search', 'Matnlarni namuna bo‘yicha qidirishda an’anaviy LIKE, registrga sezgir bo‘lmagan ILIKE hamda murakkab qoidalar uchun kuchli POSIX muntazam ifodalari qo‘llaniladi.'],

    ['L6', 'xulosa', 'Shartlarni yozishda doimo uch qiymatli mantiqni, ro‘yxatlardagi NULL xavfini va qidiruv namunalarining unumdorlikka ta’sirini hisobga olish yuqori tezlik va aniqlik kafolatidir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
