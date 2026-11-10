// SQL 47-bob 2-qism: "Kod" — Sekin so'rovlar
(function (g) {
  g.NR = {
    title: "SQL Sekin So'rovlar: Kod",
    scenes: [
      "pg_lower_va_ifoda_indeksi",
      "pg_sana_extract_va_oraliq",
      "pg_telefon_tip_xatosi",
      "pg_or_va_count_amalda"
    ],
    sceneNames: {
      pg_lower_va_ifoda_indeksi: "PostgreSQL: lower() va Ifoda Indeksi",
      pg_sana_extract_va_oraliq: "Sana: EXTRACT va Oraliq Shart",
      pg_telefon_tip_xatosi: "Tip Mosligi: text = bigint Xatosi",
      pg_or_va_count_amalda: "OR BitmapOr va COUNT(*) Amalda"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "pg_lower_va_ifoda_indeksi",
        id: "l1",
        text: "Postgresda yuz ming qatorli mijozlar jadvalida louer imeyl so'rovi oddiy indeks borligiga qaramay to'liq skanerlashga tushadi."
      },
      {
        scene: "pg_lower_va_ifoda_indeksi",
        id: "l2",
        text: "Ammo louer ifodasi bo'yicha indeks yaratilgach, bajarilish vaqti o'n millisekunddan nol butun yuzdan ikki millisekundga, ya'ni to'rt yuz baravarga tezlashadi."
      },
      {
        scene: "pg_sana_extract_va_oraliq",
        id: "l3",
        text: "Sana bo'yicha yildan ajratish so'rovida esa rejalashtiruvchi ellik to'rt baravar adashib yetmish uch ming qatorni elaydi."
      },
      {
        scene: "pg_sana_extract_va_oraliq",
        id: "l4",
        text: "Shartni sana oralig'iga o'zgartirish esa bi-tri indeksini to'liq ishga solib, vaqtni bir millisekundga tushiradi."
      },
      {
        scene: "pg_telefon_tip_xatosi",
        id: "l5",
        text: "Matnli telefon ustunini raqam bilan so'raganimizda Postgres operator topilmadi deb darhol xato qaytaradi."
      },
      {
        scene: "pg_telefon_tip_xatosi",
        id: "l6",
        text: "To'g'ri satr uzatilganda esa telefon indeksi orqali bir zumda qidiruv amalga oshiriladi."
      },
      {
        scene: "pg_or_va_count_amalda",
        id: "l7",
        text: "Turli ustunlardagi o-er shartida bitmep-or har ikkala indeks xaritasini birlashtirib bir millisekunddan kam vaqt sarflaydi."
      },
      {
        scene: "pg_or_va_count_amalda",
        id: "l8",
        text: "Jadval qatorlarini sanash esa doim to'liq skan talab qiladi, shuning uchun tezkor hisobda reltyupls qiymatidan foydalanish lozim."
      }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);
