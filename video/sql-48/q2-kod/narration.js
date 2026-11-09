// SQL 48-bob 2-qism: "Kod" — Sahifalash
(function (g) {
  g.NR = {
    title: "SQL Sahifalash: Kod",
    scenes: [
      "pg_offset_0_va_900k",
      "pg_keyset_row_constructor",
      "pg_or_yozuvi_xatosi",
      "pg_drift_jonli_sinov"
    ],
    sceneNames: {
      pg_offset_0_va_900k: "PostgreSQL: OFFSET 0 va OFFSET 900000",
      pg_keyset_row_constructor: "Keyset va Qator Konstruktori",
      pg_or_yozuvi_xatosi: "PostgreSQL da OR Yozuvi: 29 ms Filter",
      pg_drift_jonli_sinov: "Yangi Qator Qo'shilganda Drift Sinovi"
    },
    hold: {
      l2: 1.0,
      l4: 1.0,
      l6: 1.0,
      l8: 1.5
    },
    lines: [
      {
        scene: "pg_offset_0_va_900k",
        id: "l1",
        text: "Postgresda bir million qatorli buyurtmalar jadvalida ofset nol bilan birinchi sahifa nol butun yuzdan uch millisekundda o'qiladi."
      },
      {
        scene: "pg_offset_0_va_900k",
        id: "l2",
        text: "Biroq to'qson minginchi sahifada server to'qqiz yuz mingta yozuvni behuda elab, bajarilish vaqti o'ttiz olti millisekundgacha cho'ziladi."
      },
      {
        scene: "pg_keyset_row_constructor",
        id: "l3",
        text: "Keyset so'rovida qator konstruktori orqali sana va ay-di berilganda, rejalashtiruvchi indeks shartini aynan kerakli nuqtadan boshlaydi."
      },
      {
        scene: "pg_keyset_row_constructor",
        id: "l4",
        text: "Natijada bor-yo'g'i yigirmata qator o'qilib, birinchi sahifadek nol butun yuzdan ikki millisekundda yakunlanadi."
      },
      {
        scene: "pg_or_yozuvi_xatosi",
        id: "l5",
        text: "Agar xuddi shu shartni o-er mantiqiy amali bilan yozsak, Postgres uni indeks sharti emas, balki filtr sifatida bajarib yigirma to'qqiz millisekund sarflaydi."
      },
      {
        scene: "pg_or_yozuvi_xatosi",
        id: "l6",
        text: "Shuning uchun Postgresda keyset pagination uchun doim qator konstruktori yozuvidan foydalanish lozim."
      },
      {
        scene: "pg_drift_jonli_sinov",
        id: "l7",
        text: "Jonli sinovda birinchi sahifadan keyin yangi buyurtma qo'shilganda, ofset uchinchi qatorni ikkinchi sahifada yana takror ko'rsatdi."
      },
      {
        scene: "pg_drift_jonli_sinov",
        id: "l8",
        text: "Keyset esa oxirgi qatordan keyingi haqiqiy yangi yozuvlarni aniq topib, ma'lumot surilishining oldini oldi."
      }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);
