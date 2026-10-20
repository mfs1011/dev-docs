// SQL 44-bob 3-qism: "Dialektlar" — MySQL va SQLite farqlari
(function (g) {
  g.NR = {
    title: "SQL Indeks Turlari: Dialektlar",
    scenes: [
      "mysql_hash_innoDB",
      "mysql_spatial_invisible",
      "sqlite_rtree",
      "taqqoslash_va_xatolar"
    ],
    sceneNames: {
      mysql_hash_innoDB: "MySQL InnoDB: Hash Yo'qligi",
      mysql_spatial_invisible: "MySQL: Spatial va Invisible Indeks",
      sqlite_rtree: "SQLite: Faqat B-tree va R*Tree",
      taqqoslash_va_xatolar: "Taqqoslash Jadvali va Xatolar"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "mysql_hash_innoDB",
        id: "l1",
        text: "MySQL'ning InnoDB mexanizmida alohida Hash indeksi mavjud emas, sintaksis xato bermasdan B-tree'ga aylanadi."
      },
      {
        scene: "mysql_hash_innoDB",
        id: "l2",
        text: "Baza faqat ogohlantirish beradi: haqiqiy hesh indeksi faqat tezkor xotiradagi Memory jadvallarida ishlaydi."
      },
      {
        scene: "mysql_spatial_invisible",
        id: "l3",
        text: "Geometrik koordinatalar uchun MySQL'da ar-tri asosidagi speyshl indeks va MBR konteyns funksiyasi qo'llanadi."
      },
      {
        scene: "mysql_spatial_invisible",
        id: "l4",
        text: "Yana bir qulaylik: invizibl indeks orqali indeksni o'chirmasdan, uning tizimga ta'sirini bexatar sinash mumkin."
      },
      {
        scene: "sqlite_rtree",
        id: "l5",
        text: "SQLite'da CREATE INDEX faqat B-tree quradi, yuzing sintaksisi esa sintaksis xatosiga olib keladi."
      },
      {
        scene: "sqlite_rtree",
        id: "l6",
        text: "Fazoviy va oraliqli so'rovlar uchun alohida ar-star-tri moduli virtual jadval ko'rinishida taqdim etilgan."
      },
      {
        scene: "taqqoslash_va_xatolar",
        id: "l7",
        text: "Eng katta xato — tasodifiy ustunlarga BRIN qurish yoki hesh indeksni har doim tez deb o'ylashdir."
      },
      {
        scene: "taqqoslash_va_xatolar",
        id: "l8",
        text: "Har bir baza imkoniyatlarini bilish va to'g'ri indeks tanlash eng og'ir yuklamalarni ham yengillashtiradi."
      }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
