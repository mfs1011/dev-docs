// SQL 10-bob, 1-video: "Tushuncha" — NULL va tip konversiyasi
(function (g) {
  const scenes = ['intro', 'null_nature', 'three_logic', 'cmp_predicates', 'type_conv', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: NULL va tip konversiyasi',
    null_nature: 'NULL nima: Qiymatning yo‘qligi',
    three_logic: 'Uch qiymatli mantiq (3VL)',
    cmp_predicates: 'Taqqoslash va predikatlar',
    type_conv: 'Tip konversiyasi qoidalari',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L3: 1.0,
    L5: 1.0,
    L8: 1.0,
    L11: 1.0,
    L12: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! O‘ninchi bobda relyatsion bazalarning eng nozik mavzulari — NULL qiymati va ma’lumot turlari konversiyasi bilan tanishamiz.'],

    ['L2', 'null_nature', 'NULL — nol ham emas, bo‘sh satr ham emas. U qiymatning yo‘qligini yoki hozircha noma’lum ekanini bildiradi.'],
    ['L3', 'null_nature', 'Masalan, telefon ustuniga NULL yozilsa — raqam noma’lum. Bo‘sh satr yozilsa — uning telefoni yo‘qligi aniq ma’lum degan ma’noni anglatadi.'],

    ['L4', 'three_logic', 'SQL da mantiqiy ifodalar uchta qiymat qaytaradi: rost, yolg‘on va noma’lum, ya’ni NULL.'],
    ['L5', 'three_logic', 'Mantiqiy amallarda FALSE bilan noma’lum har doim FALSE beradi, chunki yolg‘on har qanday noma’lumni yengadi. Ammo TRUE bilan noma’lum esa yana noma’lum bo‘lib qoladi.'],

    ['L6', 'cmp_predicates', 'Eng muhim qoida: oddiy tenglik operatori bilan NULL ni solishtirib bo‘lmaydi. Yetti barobar NULL ham, NULL barobar NULL ham natijada noma’lum beradi.'],
    ['L7', 'cmp_predicates', 'Shuning uchun WHERE ustun barobar NULL deb yozsangiz, baza birorta ham qator qaytarmaydi! Chunki WHERE faqat rost shartlarni qabul qiladi.'],
    ['L8', 'cmp_predicates', 'NULL ni to‘g‘ri tekshirish uchun IS NULL, IS NOT NULL hamda IS DISTINCT FROM kabi maxsus predikatlar ishlatiladi.'],

    ['L9', 'type_conv', 'Tip konversiyasiga kelsak, SQL qat’iy tiplangan til hisoblanadi. Qiymatni boshqa tipga o‘tkazish uchun CAST ifodasi yoki ikkita ikki nuqta belgisi yoziladi.'],
    ['L10', 'type_conv', 'Noma’lum literal o‘z tipini kontekstdan oladi. Masalan, bir qo‘shuv satrdagi bir ifodasi ishlaydi, chunki satr butun son sifatida tushuniladi.'],
    ['L11', 'type_conv', 'Ammo jadval ustunidagi matn son bilan solishtirilsa, PostgreSQL yashirin o‘girishga yo‘l qo‘ymaydi va qat’iy xato beradi.'],

    ['L12', 'xulosa', 'Xulosa: NULL bilan ishlashda doimo uch qiymatli mantiqni yodda tuting va tiplarni aniq boshqaring. Keyingi qismda ushbu qoidalarni amalda sinaymiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
