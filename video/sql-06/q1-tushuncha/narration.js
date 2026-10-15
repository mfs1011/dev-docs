// SQL 6-bob, 1-video: "Tushuncha" — Raqamli ma'lumot turlari
(function (g) {
  const scenes = ['intro', 'integers', 'numeric', 'floats', 'money', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    integers: 'Butun sonlar: smallint, integer, bigint',
    numeric: 'Aniq kasr sonlar: numeric(p, s)',
    floats: 'Taqribiy kasr sonlar: real va double precision',
    money: 'money tipi va mintaqa xavfi',
    xulosa: 'Xulosa'
  };
  const hold = {
    L1: 0.8,
    L4: 1.0,
    L8: 1.0,
    L12: 1.0,
    L15: 1.0,
    L17: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Oltinchi bobda SQL dagi barcha raqamli ma’lumot turlarini, ularning ichki xotiradagi farqlarini va hisob-kitobdagi xavfli jihatlarini ko‘rib chiqamiz.'],
    ['L2', 'intro', 'Raqamli turlar uchta asosiy guruhga bo‘linadi: butun sonlar, aniq kasr sonlar va taqribiy kasr sonlar.'],

    ['L3', 'integers', 'Birinchi guruh — butun sonlar. PostgreSQL da ular uch xil hajmda bo‘ladi: ikki baytli smol-int, to‘rt baytli intijer, va sakkiz baytli big-int.'],
    ['L4', 'integers', 'Odatdagi hisob-kitob va miqdorlar uchun intijer eng yaxshi tanlovdir. Lekin yirik jadvallardagi identifikatorlar uchun boshidanoq big-int tanlash tavsiya etiladi, aks holda ikki milliarddan keyin oraliq to‘lib qoladi.'],

    ['L5', 'numeric', 'Ikkinchi guruh — nyumerik yoki desimal deb ataluvchi aniq kasr sonlar. Ular pul va moliyaviy hisoblar uchun maxsus yaratilgan.'],
    ['L6', 'numeric', 'Nyumerikda ikkita ko‘rsatkich bor: prezishn — barcha raqamlar soni, va skeyl — verguldan keyingi xonalar soni.'],
    ['L7', 'numeric', 'Qiymat yozilganda, agar kasr qismi skeyldan ko‘p bo‘lsa, u avtomatik yaxlitlanadi. Agar butun qismi sig‘masa, xato beriladi.'],
    ['L8', 'numeric', 'Eng muhimi: nyumerik qo‘shish va ayirishda bir tiyin ham yo‘qolmaydi, natija har doim mutlaq aniq chiqadi.'],

    ['L9', 'floats', 'Uchinchi guruh — real va dabl prezishn deb ataluvchi taqribiy kasr sonlar. Ular kompyuter xotirasida ikkilik kasr shaklida saqlanadi.'],
    ['L10', 'floats', 'Shu sababli, inson uchun oddiy ko‘ringan nol butun o‘ndan bir sonini ikkilik formatda aniq ifodalab bo‘lmaydi.'],
    ['L11', 'floats', 'Natijada nol butun o‘ndan birga nol butun o‘ndan ikkini qo‘shganda, nol butun o‘ndan uch emas, balki oxirida to‘rt bilan tugaydigan taqribiy son hosil bo‘ladi.'],
    ['L12', 'floats', 'Shuning uchun taqribiy kasr sonlarni tenglikka solishtirish xavfli va ularni pul hisob-kitoblarida mutlaqo ishlatmaslik kerak!'],

    ['L13', 'money', 'PostgreSQL da pul uchun alohida mani tipi ham mavjud. U qiymatni mintaqa valyutasi bilan birga ko‘rsatadi.'],
    ['L14', 'money', 'Biroq bu tip bazaning lokaliga qattiq bog‘langan bo‘lib, boshqa serverga ko‘chirilganda format buzilishi mumkin.'],
    ['L15', 'money', 'Bundan tashqari, mani tipini bo‘lishda kasr qismi yaxlitlanmasdan kesib tashlanadi. Shu sababli moliya uchun har doim nyumerik ma’qul.'],

    ['L16', 'xulosa', 'Xulosa qilib aytganda: butun miqdorlarga intijer va big-int, pul va aniq hisobga nyumerik, faqat ilmiy hisob-kitoblargagina dabl prezishn ishlatiladi.'],
    ['L17', 'xulosa', 'Keyingi qismda ushbu qoidalarni PostgreSQL terminalida jonli sinovlar orqali isbotlaymiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
