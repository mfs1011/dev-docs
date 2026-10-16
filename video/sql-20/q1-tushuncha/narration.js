// SQL 20-bob, 1-video: "Tushuncha" — UPSERT va MERGE
(function (g) {
  const scenes = ['intro', 'select_insert_trap', 'upsert_on_conflict', 'excluded_table', 'merge_standard', 'xulosa'];
  const sceneNames = {
    intro: 'Qator bo‘lmasa qo‘sh, bo‘lsa yangila',
    select_insert_trap: 'SELECT va INSERT tuzog‘i',
    upsert_on_conflict: 'UPSERT va ON CONFLICT mohiyati',
    excluded_table: 'EXCLUDED maxsus virtual jadvali',
    merge_standard: 'Standart SQL: MERGE buyrug‘i',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L2: 1.0,
    L3: 1.0,
    L4: 1.0,
    L5: 1.0,
    L6: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Amaliyotda eng ko‘p uchraydigan vazifalardan biri — qator mavjud bo‘lmasa uni qo‘shish, agar allaqachon mavjud bo‘lsa yangilashdir.'],

    ['L2', 'select_insert_trap', 'Avval SELECT qilib, so‘ng INSERT yoki UPDATE yozish parallel so‘rovlar oqimida kalit to‘qnashuvi yoki ma’lumotlar yo‘qolishiga sabab bo‘ladi.'],

    ['L3', 'upsert_on_conflict', 'UPSERT yondashuvi bitta atomar buyruqda ishlaydi: PostgreSQL da INSERT ON CONFLICT takrorlanmas cheklov buzilganda muqobil yangilashni kafolatlaydi.'],

    ['L4', 'excluded_table', 'EXCLUDED so‘zi chetlatilgan, ya’ni qo‘shilmoqchi bo‘lgan yangi qiymatlarni ifodalaydi va mavjud jadval ustunlari bilan qo‘shish imkonini beradi.'],

    ['L5', 'merge_standard', 'Standart MERGE buyrug‘i esa manba va maqsad jadvallarini solishtirib, bitta so‘rovda INSERT, UPDATE hamda DELETE amallarini birgalikda bajaradi.'],

    ['L6', 'xulosa', 'UPSERT va MERGE buyruqlaridan foydalanish ma’lumotlar bazasida poyga holatlarining oldini oluvchi eng asosiy xavfsizlik chorasidir.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
