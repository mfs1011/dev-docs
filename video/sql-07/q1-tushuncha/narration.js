// SQL 7-bob, 1-video: "Tushuncha" — Matn va binary ma'lumot turlari
(function (g) {
  const scenes = ['intro', 'standart', 'postgres_text', 'toast', 'bytea_blob', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish: Matn va xom baytlar',
    standart: 'SQL standarti: char(n) va varchar(n)',
    postgres_text: 'PostgreSQL da text: eng yaxshi tanlov',
    toast: 'Ichki saqlash va TOAST mexanizmi',
    bytea_blob: 'Binary satrlar: bytea va BLOB',
    xulosa: 'Xulosa'
  };
  const hold = {
    L2: 0.8,
    L5: 1.0,
    L8: 1.0,
    L11: 1.0,
    L14: 1.0,
    L16: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Salom! Yettinchi bobda ma’lumotlar bazasidagi eng ko‘p ishlatiladigan turlar — matnli va ikkilik, ya’ni binary satrlar bilan tanishamiz.'],
    ['L2', 'intro', 'Matnli satr bu belgilar ketma-ketligi bo‘lib, bazaning kodlashiga qat’iy bo‘ysunadi. Binary satr esa istalgan xom baytlar, masalan rasm yoki shifrlangan fayllar uchun xizmat qiladi.'],

    ['L3', 'standart', 'SQL standartida ikkita asosiy matn turi bor: o‘zgarmas uzunlikdagi char va o‘zgaruvchan uzunlikdagi varcha.'],
    ['L4', 'standart', 'Ikkalasida ham qavs ichidagi en soni bayt emas, aynan belgilar sonini bildiradi. Agar char ustuniga qisqa so‘z yozilsa, qolgan joy probellar bilan to‘ldirilib saqlanadi.'],
    ['L5', 'standart', 'Varchada esa ortiqcha probel qo‘shilmaydi. Agar satr belgilangan uzunlikdan oshsa, baza xato beradi va uni yozishga yo‘l qo‘ymaydi.'],

    ['L6', 'postgres_text', 'PostgreSQL da standart turlardan tashqari yana bir ajoyib tur bor — bu cheksiz uzunlikdagi tekst turidir.'],
    ['L7', 'postgres_text', 'Ko‘pchilik dasturchilar char yoki varchani tezroq ishlaydi deb o‘ylashadi. Biroq PostgreSQL da bu uchala tur o‘rtasida tezlik farqi mutlaqo yo‘q!'],
    ['L8', 'postgres_text', 'Aksincha, char probellarni to‘ldirish va tozalash uchun qo‘shimcha resurs talab qilib, eng sekin tur hisoblanadi. Shuning uchun aniq biznes cheklovi bo‘lmasa, tekst yoki cheksiz varcha ishlatish tavsiya etiladi.'],

    ['L9', 'toast', 'PostgreSQL matnlarni qanday saqlaydi? Bir yuz yigirma olti baytgacha bo‘lgan qisqa satrlarga atigi bir baytlik sarlavha qo‘shiladi.'],
    ['L10', 'toast', 'Juda katta matnlar paydo bo‘lganda esa TOAST nomli maxsus mexanizm ishga tushadi: matn avtomatik siqiladi va alohida fon jadvaliga chiqariladi.'],
    ['L11', 'toast', 'Shu sababli millionlab belgidan iborat ulkan maqolalar ham oddiy ustunlarning o‘qilish tezligiga hech qanday xalal bermaydi.'],

    ['L12', 'bytea_blob', 'Endi ikkilik ma’lumotlarga kelsak: PostgreSQL da ular baytea deb ataladi, standartda esa bu tur blob deyiladi.'],
    ['L13', 'bytea_blob', 'Matn ustuniga kodi nol bo‘lgan belgini, ya’ni bayt nolni mutlaqo kiritib bo‘lmaydi — baza UTF-8 xatosini beradi. Baytea da esa istalgan bayt xatosiz saqlanadi.'],
    ['L14', 'bytea_blob', 'Baytea ma’lumotlar bilan ishlaganda ular ekranda o‘n oltilik, ya’ni heks ko‘rinishida aks etadi va harflarni katta-kichik qilish funksiyalari ularga ta’sir qilmaydi.'],

    ['L15', 'xulosa', 'Xulosa qilib aytganda: qisqa va uzun matnlarga bemalol tekst yoki varcha, xom fayllar va baytlarga esa baytea ishlatiladi.'],
    ['L16', 'xulosa', 'Keyingi qismda ushbu qoidalarni PostgreSQL terminalida jonli buyruqlar orqali sinab ko‘ramiz.']
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
