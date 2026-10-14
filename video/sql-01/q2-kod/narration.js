// SQL 1-bob, 2-video: "Kod" bo'limi — qatorlar tartibi va sql_features. Terminal chiqishi: ../natijalar/pg-tty.txt (PostgreSQL 18.6).
(function (g) {
  const scenes = ['intro', 'jadval', 'update', 'orderby', 'features', 'xulosa'];
  const sceneNames = { intro: 'Kirish', jadval: 'Jadval va SELECT', update: 'UPDATE dan keyin', orderby: 'ORDER BY', features: 'sql_features', xulosa: 'Xulosa' };
  const hold = { L2: 1.6, L3: 2.6, L4: 2.4, L5: 1.4, L6: 1.2, L7: 2.6, L8: 1.0, L9: 1.2, L10: 2.6, L11: 1.4, L12: 2.8, L13: 1.2 };
  const lines = [
    ['L1', 'intro', 'Birinchi bobdagi qoidalarni endi haqiqiy PostgreSQL’da tekshiramiz. Hamma natija — haqiqiy.'],

    ['L2', 'jadval', 'Talabalar jadvalini yaratamiz va unga uchta qator qo‘shamiz.'],
    ['L3', 'jadval', 'SELECT barcha qatorlarni qaytaradi. Natija qo‘shilgan tartibda chiqdi: Ali, Vali, Dilnoza.'],

    ['L4', 'update', 'Endi Alining kursini o‘zgartiramiz va xuddi shu so‘rovni qaytaramiz.'],
    ['L5', 'update', 'So‘rov o‘zgarmadi, lekin Ali endi oxirida chiqdi!'],
    ['L6', 'update', 'ORDER BY bo‘lmasa, baza qatorlarni o‘ziga qulay tartibda qaytaradi. PostgreSQL UPDATE paytida qatorning yangi versiyasini yozadi. Bu mexanizm MVCC deyiladi, uni keyingi boblarda ko‘ramiz.'],

    ['L7', 'orderby', 'Tartib kerak bo‘lsa, uni aniq so‘raymiz: ORDER BY id. Endi natija har doim id bo‘yicha chiqadi.'],

    ['L8', 'features', 'Standartning o‘n birinchi qismi — information_schema. PostgreSQL unda sql_features jadvalini saqlaydi: standart xususiyatlari va har biri bajarilgan yoki bajarilmagani.'],
    ['L9', 'features', 'Ularni guruhlab sanaymiz.'],
    ['L10', 'features', 'Uch yuz yigirmatasi bajarilgan, ikki yuz to‘qson beshtasi yo‘q. Bu yerda Core va ixtiyoriy xususiyatlar birga sanalgan, shuning uchun son katta.'],
    ['L11', 'features', 'Har bir xususiyatning kodi bor. To‘rttasini nomi bilan ko‘ramiz.'],
    ['L12', 'features', 'E011 — raqamli tiplar, F302 — INTERSECT, T611 — window funksiyalar, T626 — ANY_VALUE. Qo‘llanmada imkoniyatning standartdagi o‘rnini shu kodlar bilan ko‘rsatamiz.'],
    ['L13', 'features', 'Hujjat ogohlantiradi: bu ro‘yxat taqribiy. Aniq ma’lumot hujjatning asosiy qismida beriladi.'],

    ['L14', 'xulosa', 'Xulosa: natija tartibiga hech qachon tayanmang. Tartib kerak bo‘lsa, doim ORDER BY yozing.'],
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
