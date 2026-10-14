// SQL 1-bob, 3-video: "Dialektlar" va "Tipik xatolar" bo'limlari. Terminal chiqishlari: ../natijalar/{pg,my,sqlite,sqlite-pragma}-tty.txt
// (PostgreSQL 18.6, MySQL 9.7.2 sukut rejimida, SQLite 3.54.0 — rasmiy manbadan ./configure && make, DQS=0).
(function (g) {
  const scenes = ['intro', 'concat', 'tirnoq', 'tip', 'sqlmode', 'xulosa'];
  const sceneNames = { intro: 'Kirish', concat: '|| bilan ulash', tirnoq: 'Qo‘shtirnoq: nom yoki satr', tip: 'Tipga mos kelmaydigan qiymat', sqlmode: 'MySQL sql_mode', xulosa: 'Tipik xatolar' };
  const hold = { L2: 0.4, L3: 2.4, L4: 2.6, L5: 1.4, L7: 2.2, L8: 2.2, L9: 2.6, L10: 2.4, L13: 2.4, L14: 2.0, L15: 2.0, L16: 1.2, L17: 2.4, L18: 2.6, L19: 1.0, L20: 1.0, L21: 0.6 };
  const lines = [
    ['L1', 'intro', 'Bitta so‘rov uch tizimda uch xil natija berishi mumkin. Uchta misolni PostgreSQL, MySQL va SQLite’da ko‘ramiz.'],

    ['L2', 'concat', 'Standartda ikkita vertikal chiziq — ikki satrni bir-biriga ulash amali.'],
    ['L3', 'concat', 'PostgreSQL kutilgandek javob beradi: Salom, dunyo. SQLite ham xuddi shunday.'],
    ['L4', 'concat', 'MySQL esa nol qaytaradi va uchta ogohlantirish beradi.'],
    ['L5', 'concat', 'Ogohlantirishlarni ko‘ramiz. MySQL’da bu belgi sukut bo‘yicha mantiqiy YOKI degani. Ikkala satr songa aylanib, nol bo‘ldi. Xato emas, faqat ogohlantirish. MySQL’da satrlar CONCAT funksiyasi bilan ulanadi.'],

    ['L6', 'tirnoq', 'Standartda bitta tirnoq — satr, qo‘shtirnoq esa jadval yoki ustun nomi.'],
    ['L7', 'tirnoq', 'PostgreSQL standartga amal qiladi: salom degan ustun yo‘q, shuning uchun xato.'],
    ['L8', 'tirnoq', 'MySQL qo‘shtirnoqni satr deb tushunadi va salom so‘zini qaytaradi.'],
    ['L9', 'tirnoq', 'SQLite’da bu qanday yig‘ilganiga bog‘liq. Rasmiy manbadan yig‘ilgan bizning versiyamizda DQS nolga teng, shuning uchun xato beradi.'],
    ['L10', 'tirnoq', 'Lekin dbconfig bilan yoqilsa, xuddi shu so‘rov satr qaytaradi. SQLite hujjati bu imkoniyatni xato imkoniyat deb ataydi.'],
    ['L11', 'tirnoq', 'Qoida: satrni doim bitta tirnoq bilan yozing. Shunda kod uchala tizimda bir xil ishlaydi.'],

    ['L12', 'tip', 'Endi butun son ustuniga abc matnini yozib ko‘ramiz.'],
    ['L13', 'tip', 'PostgreSQL xato beradi.'],
    ['L14', 'tip', 'MySQL ham xato beradi.'],
    ['L15', 'tip', 'SQLite esa qiymatni qabul qiladi va matn sifatida saqlaydi. Uning hujjati buni moslashuvchan tiplash deb ataydi.'],

    ['L16', 'sqlmode', 'MySQL’ning ko‘p xatti-harakatini SQL rejimlari boshqaradi. Sukut bo‘yicha qat’iy rejim yoqilgan, shuning uchun abc xato berdi.'],
    ['L17', 'sqlmode', 'ANSI rejimini yoqsak, MySQL standartga yaqinlashadi: ikki chiziq satrlarni ulaydi, qo‘shtirnoq esa nom bo‘ladi.'],
    ['L18', 'sqlmode', 'Ehtiyot bo‘ling: bitta so‘rov rejimga qarab boshqa natija beradi. Hujjat partitsiyalangan jadvallar yaratilgandan keyin rejimni o‘zgartirmaslikni qat’iy tavsiya qiladi.'],

    ['L19', 'xulosa', 'Tipik xatolardan saqlaning. Natija tartibiga ORDER BY siz tayanmang. Satrni qo‘shtirnoq bilan yozmang.'],
    ['L20', 'xulosa', 'MySQL ogohlantirishlariga e’tibor bering. SQLite noto‘g‘ri tipni ham qabul qilishini unutmang.'],
    ['L21', 'xulosa', 'Va har bir tizimning dialektini uning hujjatidan tekshiring. E’tiboringiz uchun rahmat!'],
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
