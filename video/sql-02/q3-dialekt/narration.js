// SQL 2-bob, 3-video: "Dialektlar", "Versiyalar" va "Tipik xatolar" bo'limlari (content/sql/02-uch-tizim.md).
(function (g) {
  const scenes = ['intro', 'taqqoslash', 'versiyalar', 'xatolar', 'xulosa'];
  const sceneNames = {
    intro: 'Kirish',
    taqqoslash: 'Uch tizim taqqoslash',
    versiyalar: 'Reliz siyosati',
    xatolar: 'Tipik xatolar',
    xulosa: 'Xulosa'
  };
  const hold = {
    L2: 1.0, L3: 1.0, L4: 1.0, L5: 1.0, L6: 1.2,
    L8: 1.0, L9: 1.2, L10: 1.2,
    L11: 1.2, L12: 1.2, L13: 1.2, L14: 1.2, L15: 1.2, L16: 0.8
  };
  const lines = [
    ['L1', 'intro', 'Bob yakunida uch tizimni asosiy mezonlar bo‘yicha taqqoslaymiz, ularning reliz siyosatini ko‘rib chiqamiz va eng ko‘p uchraydigan tipik xatolardan ogohlantiramiz.'],

    ['L2', 'taqqoslash', 'Arxitektura bo‘yicha: PostgreSQL va MySQL — mijoz-server bazalar, SQLite esa ilova ichidagi kutubxona.'],
    ['L3', 'taqqoslash', 'Server dasturi: PostgreSQL’da postgres, MySQL’da mysqld, SQLite’da esa serverning o‘zi yo‘q.'],
    ['L4', 'taqqoslash', 'Ulanishga resurs: PostgreSQL alohida jarayon ochadi, MySQL bitta jarayon ichida alohida thread ajratadi, SQLite esa oddiy funksiya chaqiruvidir.'],
    ['L5', 'taqqoslash', 'Diskdagi ko‘rinishi: dastlabki ikkisi server boshqaradigan ma’lumot papkasi, SQLite esa bitta disk fayli.'],
    ['L6', 'taqqoslash', 'Bir vaqtda yozish: mijoz-server tizimlarda bir vaqtda ko‘p yozuvchi yoza oladi, SQLite’da esa bir paytda faqat bitta yozuvchi.'],

    ['L7', 'versiyalar', 'Endi reliz siyosatlari. Ishlab chiqarishda qaysi versiyani tanlash shunga bog‘liq.'],
    ['L8', 'versiyalar', 'PostgreSQL har yili bitta asosiy versiya chiqaradi va har bir versiya besh yil davomida qo‘llab-quvvatlanadi. Kichik relizlar har uch oyda chiqadi.'],
    ['L9', 'versiyalar', 'MySQL ikkita yo‘nalishga ega: besh yil asosiy va uch yil kengaytirilgan muddatga ega LTS relizlar, hamda eng yangi imkoniyatlar uchun Innovation relizlar.'],
    ['L10', 'versiyalar', 'SQLite esa ishlab chiquvchilar tomonidan ikki ming ellikinchi yilgacha qo‘llab-quvvatlanishi rejalashtirilgan. Uning fayl formati o‘nlab yillar davomida barqaror qoladi.'],

    ['L11', 'xatolar', 'Endi tipik xatolardan saqlaning. Birinchi xato: SQLite’ni o‘yinchoq baza deb bilish. Hujjatga ko‘ra u qurilmalar va o‘rta trafikli saytlarda a’lo darajada ishlaydi.'],
    ['L12', 'xatolar', 'Ikkinchi xato: SQLite faylini tarmoq papkasiga qo‘yib, ko‘p kompyuterdan bir vaqtda yozish. Tarmoq fayl tizimidagi qulflash xatolari bazani buzishi mumkin.'],
    ['L13', 'xatolar', 'Uchinchi xato: PostgreSQL ulanishini arzon deb o‘ylash. Har ulanish alohida jarayon bo‘lgani sababli, amaliyotda connection pool ishlatish shart.'],
    ['L14', 'xatolar', 'To‘rtinchi xato: MySQL’da jadval qaysi engine’da ekaniga qaramaslik. Tranzaksiyalarni faqat InnoDB to‘liq qo‘llab-quvvatlaydi.'],
    ['L15', 'xatolar', 'Beshinchi xato: ishlab turgan SQLite bazasidan oddiy cp bilan nusxa olish. Baza yozish paytida olingan fayl buzilishi mumkin, buning uchun maxsus backup usullari bor.'],

    ['L16', 'xulosa', 'Tizimning tuzilishini tushunish to‘g‘ri texnologiya tanlashning asosi. Keyingi bobda PostgreSQL, MySQL va SQLite’ni o‘rnatish va ulanishni amalda ko‘ramiz. Rahmat!'],
  ].map(([id, scene, text]) => ({ id, scene, text }));
  g.NR = { scenes, sceneNames, hold, lines };
})(typeof window !== 'undefined' ? window : globalThis);
