// SQL 36-bob 3-qism: "Dialektlar" — PostgreSQL, MySQL, SQLite solishtirmasi
(function (g) {
  g.NR = {
    title: "SQL Dialektlar: PG Maxsus Tiplari Muqobillari",
    scenes: [
      "dialektlar_kirish",
      "mysql_muqobillari",
      "sqlite_nozikliklari",
      "solishtirma_jadval",
      "loyihalash_va_xulosalar"
    ],
    sceneNames: {
      dialektlar_kirish: "PostgreSQL Eksklyuziv Tiplari",
      mysql_muqobillari: "MySQL: JSON va Alohida Jadvallar",
      sqlite_nozikliklari: "SQLite va text[] Tuzog'i",
      solishtirma_jadval: "Dialektlar Solishtirma Matritsasi",
      loyihalash_va_xulosalar: "Arxitektura va Portativlik Xulosasi"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.0,
      l10: 1.5
    },
    lines: [
      {
        scene: "dialektlar_kirish",
        id: "l1",
        text: "Ko'rib o'tilgan to'rtta tip asosan PostgreSQL'ga xos bo'lib, boshqa relyatsion bazalarda to'g'ridan-to'g'ri mavjud emas."
      },
      {
        scene: "dialektlar_kirish",
        id: "l2",
        text: "Shuning uchun tizimlararo portativlik zarur bo'lganda muqobil yechimlardan foydalanishga to'g'ri keladi."
      },
      {
        scene: "mysql_muqobillari",
        id: "l3",
        text: "MySQL'da massiv o'rniga JSON massiv yoki alohida relyatsion jadvallar qo'llaniladi."
      },
      {
        scene: "mysql_muqobillari",
        id: "l4",
        text: "Oraliqlar ikki alohida ustunda saqlanadi, domen o'rniga esa har bir ustunda cheklov takrorlanadi."
      },
      {
        scene: "sqlite_nozikliklari",
        id: "l5",
        text: "SQLite'da massiv tipi yo'q, lekin text massiv yozsangiz xato bermay, oddiy matn sifatida qabul qiladi."
      },
      {
        scene: "sqlite_nozikliklari",
        id: "l6",
        text: "Bu katta tuzoq bo'lib, uning ichidan indeks bo'yicha element olib bo'lmaydi."
      },
      {
        scene: "solishtirma_jadval",
        id: "l7",
        text: "Solishtirma matritsada ko'rishingiz mumkinki, istisno cheklovi va oraliqlar faqat PostgreSQL'da to'liq ta'minlangan."
      },
      {
        scene: "solishtirma_jadval",
        id: "l8",
        text: "Boshqa bazalarda poyga holatlarini oldini olish dasturiy tranzaksiyalar orqali hal qilinadi."
      },
      {
        scene: "loyihalash_va_xulosalar",
        id: "l9",
        text: "Loyiha arxitekturasida relyatsion me'yorni saqlash va alohida jadvallar qurish eng universal yo'ldir."
      },
      {
        scene: "loyihalash_va_xulosalar",
        id: "l10",
        text: "Bu barcha tizimlarda yuqori unumdorlik, indekslash va ma'lumotlar yaxlitligini kafolatlaydi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
