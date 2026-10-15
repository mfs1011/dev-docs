// SQL 9-bob, 1-video: "Tushuncha" — Boolean, UUID va Enum tushunchalari
(function (g) {
  const scenes = ['intro', 'boolean', 'uuid', 'enum', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Uchta muhim va qulay tip',
    boolean: 'Boolean va uch qiymatli mantiq',
    uuid: 'UUID: v4 tasodifiy va v7 vaqt tartibi',
    enum: 'Enum: Maxsus tartiblangan turlar',
    xulosa: 'Xulosa'
  };
  const hold = {
    L2: 0.8,
    L5: 1.0,
    L8: 1.0,
    L11: 1.0,
    L13: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! To‘qqizinchi bobda dasturlashda har kuni ishlatiladigan uchta ajoyib tip — boolean, UUID va enum bilan tanishamiz.'],
    ['L2', 'intro', 'Boolean ha yoki yo‘q degan savolga javob beradi. UUID taqsimlangan tizimlarda takrorlanmas identifikator yaratadi. Enum esa oldindan belgilangan maxsus ro‘yxatdir.'],

    ['L3', 'boolean', 'SQL standartida boolean tipi mavjud bo‘lib, PostgreSQL da atigi bir bayt joy egallaydi.'],
    ['L4', 'boolean', 'Eng muhim xususiyati: uning uchta holati bor: rost, ya’ni TRUE; yolg‘on, ya’ni FALSE; hamda noma’lum, ya’ni NULL qiymati.'],
    ['L5', 'boolean', 'Kiritishda baza yes yoki no, on yoki off, bir yoki nol kabi yozuvlarni qabul qiladi. Ammo standartga muvofiq doimo TRUE va FALSE kalit so‘zlarini yozish tavsiya etiladi.'],

    ['L6', 'uuid', 'UUID — yuz yigirma sakkiz bitlik universal identifikator. U butun dunyo bo‘yicha takrorlanmaslik ehtimoli eng yuqori bo‘lgan kalit hisoblanadi.'],
    ['L7', 'uuid', 'PostgreSQL da asosan ikkita versiya ishlatiladi: to‘rtinchi versiya butunlay tasodifiy sonlardan, yangi yettinchi versiya esa vaqt bo‘yicha tartiblangan o‘suvchi sonlardan iborat.'],
    ['L8', 'uuid', 'UUID ni matn sifatida saqlash qirq bayt joy olsa, maxsus uuid tipida saqlash atigi o‘n olti bayt oladi va qidiruvni ancha tezlashtiradi.'],

    ['L9', 'enum', 'Enum — cheklangan va o‘zgarmas qiymatlar ro‘yxatidan iborat maxsus ma’lumot turi.'],
    ['L10', 'enum', 'PostgreSQL da enum avval mustaqil tip sifatida yaratiladi. Uning ichidagi qiymatlar alifbo bo‘yicha emas, aynan e’lon qilingan tartib bo‘yicha saralanadi va taqqoslanadi.'],
    ['L11', 'enum', 'Har bir enum qiymati diskda atigi to‘rt bayt joy oladi. Ammo unutmang: enum ga yangi qiymat qo‘shish mumkin, biroq kiritilgan qiymatni o‘chirib bo‘lmaydi!'],

    ['L12', 'xulosa', 'Xulosa: mantiqiy holatlarga boolean, global kalitlarga uuid, o‘zgarmas holatlarga esa enum eng to‘g‘ri tanlovdir.'],
    ['L13', 'xulosa', 'Keyingi qismda ushbu turlarni PostgreSQL terminalida jonli buyruqlar yordamida sinab ko‘ramiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
