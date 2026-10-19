// SQL 37-bob 3-qism: "Dialektlar" — Dialektlar farqi va qiyosiy tahlil
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. DIALEKTLAR KIRISH (0 -> 16.5s)
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("37-bob. Aloqalar va Tashqi Kalitlar", 960, 140, { size: 52, align: 'center', p: k, color: C.soft });
    hand("Tashqi Kalitlarda Dialektlar Farqi", 960, 230, { size: 72, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL, MySQL va SQLite: Indekslash, cheklovlar va xato qaytarish", 960, 315, { size: 30, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 345, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // 3 ta tizim kartalari
      const systems = [
        {
          name: "PostgreSQL",
          sub: "Standartga qat'iy va mukammal",
          col: C.blue,
          points: [
            "Tashqi kalitlar doimo faol",
            "Bola ustuniga avtomatik indeks yaratmaydi",
            "SET NULL (ustunlar) sintaksisi bor (PG 15+)",
            "Ota kaliti unikal bo'lmasa CREATE paytida rad etadi"
          ]
        },
        {
          name: "MySQL (InnoDB)",
          sub: "Avtomatik indeks va nozik cheklovlar",
          col: C.orange,
          points: [
            "Bola kalitiga avtomatik BTREE indeks qo'shadi",
            "SET NULL (ustunlar) qisman null qilish yo'q",
            "SET DEFAULT amalda ishlamaydi (ERROR 1451)",
            "Xato matnida to'liq cheklov nomi va ta'rifini beradi"
          ]
        },
        {
          name: "SQLite",
          sub: "Yengil, lekin PRAGMA talab qiladi",
          col: C.purple,
          points: [
            "Tashqi kalit sukut bo'yicha o'chiq (PRAGMA kerak)",
            "Bola kalitiga avtomatik indeks qo'ymaydi",
            "SET NULL (ustunlar) yo'q (syntax error)",
            "Ota kaliti unikal bo'lmasa DML da mismatch xatosi"
          ]
        }
      ];

      systems.forEach((sys, i) => {
        const bx = 120 + i * 570;
        card(bx, 400, 540, 580, { fill: C.card, col: sys.col, p: kBox });
        pill(sys.name, bx + 270, 450, sys.col, kBox, 22);
        text(sys.sub, bx + 30, 515, { size: 20, weight: 700, color: sys.col, fam: UI });

        sys.points.forEach((pt, j) => {
          const py = 575 + j * 75;
          srect(bx + 30, py - 10, 16, 16, { col: sys.col, w: 2.5, p: kBox });
          text(pt, bx + 60, py, { size: 19, color: C.ink, fam: UI, maxW: 450 });
        });
      });
    });
  }

  // 2. MYSQL AVTOMATIK INDEKS (16.5 -> 31.5s)
  function sMysql(t) {
    heading("MySQL: Avtomatik Indeks va SET DEFAULT Cheklovi", t, TM.scenes.mysql_avtomatik_indeks.s);

    const kMain = P(t, TM.scenes.mysql_avtomatik_indeks.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap: SHOW INDEX natijasi
      card(120, 200, 810, 480, { fill: C.card, col: C.orange, p: kMain });
      pill("MySQL 9.7.2 Xususiyati", 525, 250, C.orange, kMain, 20);
      text("Bola Ustuniga Avtomatik Indeks Yaratilishi:", 160, 315, { size: 24, weight: 700, color: C.orange, fam: UI });

      text("SHOW INDEX FROM order_items;", 160, 375, { size: 21, weight: 700, fam: MONO, color: C.ink });

      text("Table       | Key_name | Seq | Column_name", 160, 435, { size: 20, weight: 700, fam: MONO, color: C.soft });
      sline(160, 455, 870, 455, { col: C.pencil, w: 1.5 });
      text("order_items | PRIMARY  |   1 | product_no ", 160, 490, { size: 20, fam: MONO, color: C.ink });
      text("order_items | PRIMARY  |   2 | order_id   ", 160, 530, { size: 20, fam: MONO, color: C.ink });
      text("order_items | order_id |   1 | order_id   ", 160, 575, { size: 20, weight: 700, fam: MONO, color: C.green });

      pill("order_id uchun MySQL o'zi indeks qo'shdi!", 525, 635, C.green, kMain, 18);

      // O'ng: SET DEFAULT tuzog'i
      card(990, 200, 810, 480, { fill: C.card, col: C.red, p: kMain });
      pill("ON DELETE SET DEFAULT Tuzog'i", 1395, 250, C.red, kMain, 20);
      text("Hujjat va Amaliyot O'rtasidagi Farq:", 1030, 315, { size: 24, weight: 700, color: C.red, fam: UI });

      text("-- Jadval xatosiz yaratiladi:", 1030, 375, { size: 19, color: C.soft, fam: MONO });
      text("CREATE TABLE p2 (id INT PRIMARY KEY, r INT DEFAULT 0,", 1030, 410, { size: 18, fam: MONO, color: C.ink });
      text("    FOREIGN KEY (r) REFERENCES tenants(id)", 1030, 440, { size: 18, fam: MONO, color: C.ink });
      text("    ON DELETE SET DEFAULT); -- Qabul qilindi!", 1030, 470, { size: 18, weight: 700, fam: MONO, color: C.blue });

      card(1020, 505, 750, 150, { fill: '#fff8f6', col: C.red, p: kMain });
      text("Ammo ota yozuv o'chirilganda:", 1040, 535, { size: 18, weight: 700, color: C.red, fam: UI });
      text("DELETE FROM tenants WHERE tenant_id = 5;", 1040, 570, { size: 18, weight: 700, fam: MONO, color: C.ink });
      text("ERROR 1451: Cannot delete or update a parent row!", 1040, 615, { size: 17, weight: 700, fam: MONO, color: C.red });

      // Pastki xulosa
      const kFoot = P(t, W('l4', 'default'), 0.8);
      withA(kFoot, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.blue, p: kFoot });
        text("MySQL Uchun Muhim Xulosalar:", 160, 785, { size: 26, weight: 700, color: C.blue, fam: UI });
        text("1. Avtomatik yaratilgan indeks keyinchalik mos boshqa indeks qo'shilsa jimgina o'chib ketishi mumkin.", 160, 845, { size: 21, color: C.ink, fam: UI });
        text("2. SET DEFAULT ga hech qachon tayanmang — xato jadval yaratishda emas, birinchi o'chirishda chiqadi.", 160, 895, { size: 21, weight: 700, color: C.red, fam: UI });
        text("3. Kompozit kalitda qisman ustunni null qilish kerak bo'lsa, MySQL da triggerlardan foydalaning.", 160, 945, { size: 21, color: C.soft, fam: UI });
      });
    });
  }

  // 3. SQLITE FK VA MISMATCH (31.5 -> 45.8s)
  function sSqlite(t) {
    heading("SQLite: PRAGMA va Foreign Key Mismatch", t, TM.scenes.sqlite_fk_va_mismatch.s);

    const kMain = P(t, TM.scenes.sqlite_fk_va_mismatch.s + 0.3, 0.8);
    withA(kMain, () => {
      // Chap: PRAGMA foreign_keys
      card(120, 200, 810, 480, { fill: C.card, col: C.purple, p: kMain });
      pill("SQLite Asosiy Sharti", 525, 250, C.purple, kMain, 20);
      text("Tashqi Kalitlar Sukut Bo'yicha O'chiq!", 160, 315, { size: 24, weight: 700, color: C.purple, fam: UI });

      text("• Tarixiy moslik (backward compatibility) tufayli", 160, 380, { size: 21, color: C.ink, fam: UI });
      text("  SQLite da tashqi kalitlar avtomatik ishlamaydi.", 160, 420, { size: 21, color: C.ink, fam: UI });
      text("• Har bir ulanishda (session) quyidagi buyruq shart:", 160, 470, { size: 21, color: C.ink, fam: UI });

      card(160, 515, 730, 85, { fill: '#f5f3ff', col: C.purple, p: kMain });
      text("PRAGMA foreign_keys = ON;", 200, 555, { size: 26, weight: 700, fam: MONO, color: C.purple });

      text("• Aks holda cheklovlar tekshirilmaydi va yetim qatorlar yoziladi.", 160, 640, { size: 20, weight: 600, color: C.red, fam: UI });

      // O'ng: DDL vs DML (foreign key mismatch)
      card(990, 200, 810, 480, { fill: C.card, col: C.red, p: kMain });
      pill("Foreign Key Mismatch Xatosi", 1395, 250, C.red, kMain, 20);
      text("Ota Kaliti Unikal Bo'lmagan Holat:", 1030, 315, { size: 24, weight: 700, color: C.red, fam: UI });

      text("CREATE TABLE p (a PRIMARY KEY, e);", 1030, 375, { size: 19, fam: MONO, color: C.ink });
      text("CREATE INDEX pe ON p(e); -- oddiy indeks (unique emas)", 1030, 410, { size: 19, color: C.soft, fam: MONO });
      text("CREATE TABLE c4 (l, m REFERENCES p(e)); -- OK yaratildi!", 1030, 445, { size: 19, weight: 700, fam: MONO, color: C.green });

      card(1020, 485, 750, 160, { fill: '#fff8f6', col: C.red, p: kMain });
      text("Ma'lumot kiritish paytida:", 1040, 520, { size: 18, weight: 700, color: C.red, fam: UI });
      text("INSERT INTO c4 VALUES (1, 1);", 1040, 560, { size: 20, weight: 700, fam: MONO, color: C.ink });
      text("Parse error near line 6: foreign key mismatch - \"c4\"", 1040, 605, { size: 18, weight: 700, fam: MONO, color: C.red });

      // Pastki taqqoslash
      const kFoot = P(t, W('l6', 'aniqlanadi'), 0.8);
      withA(kFoot, () => {
        card(120, 730, 1680, 260, { fill: '#fff', col: C.blue, p: kFoot });
        text("PostgreSQL vs SQLite Solishtirmasi:", 160, 785, { size: 26, weight: 700, color: C.blue, fam: UI });
        text("• PostgreSQL: Ota ustunida UNIQUE bo'lmasa, CREATE TABLE paytidayoq rad etadi.", 160, 845, { size: 21, weight: 700, color: C.green, fam: UI });
        text("• SQLite: Jadvalni yarataveradi, lekin birinchi INSERT amalida mismatch xatosi beradi.", 160, 895, { size: 21, weight: 700, color: C.red, fam: UI });
        text("• Xulosa: SQLite da ota jadval ustunida aniq UNIQUE yoki PRIMARY KEY bo'lishini tekshiring.", 160, 945, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. SOLISHTIRMA MATRITSA (45.8 -> 62.0s)
  function sMatritsa(t) {
    heading("Uch Dialektning Qiyosiy Matritsasi", t, TM.scenes.solishtirma_matritsa.s);

    const kMain = P(t, TM.scenes.solishtirma_matritsa.s + 0.3, 0.8);
    withA(kMain, () => {
      card(120, 200, 1680, 780, { fill: C.card, col: C.blue, p: kMain });
      pill("To'liq Texnik Solishtirma", 960, 250, C.blue, kMain, 22);

      // Jadval sarlavhasi
      const startY = 320;
      card(160, startY, 1600, 65, { fill: '#f1f5f9', col: C.blue, p: kMain });
      text("Xususiyat", 200, startY + 32, { size: 22, weight: 700, color: C.ink, fam: UI });
      text("PostgreSQL", 660, startY + 32, { size: 22, weight: 700, color: C.blue, fam: UI });
      text("MySQL (InnoDB)", 1050, startY + 32, { size: 22, weight: 700, color: C.orange, fam: UI });
      text("SQLite", 1460, startY + 32, { size: 22, weight: 700, color: C.purple, fam: UI });

      // Matritsa qatorlari
      const rows = [
        {
          feature: "Tashqi kalit faolligi",
          pg: "Doim faol (sukut bo'yicha)",
          my: "InnoDB'da doim faol",
          sq: "PRAGMA foreign_keys = ON shart"
        },
        {
          feature: "Bola kalitiga indeks",
          pg: "Qo'lda yaratiladi",
          my: "Avtomatik BTREE yaratiladi",
          sq: "Qo'lda yaratiladi"
        },
        {
          feature: "Kompozit SET NULL (ustunlar)",
          pg: "Ha (PostgreSQL 15+)",
          my: "Yo'q (sintaksis xatosi)",
          sq: "Yo'q (syntax error)"
        },
        {
          feature: "ON DELETE SET DEFAULT",
          pg: "Ha (to'liq ishlaydi)",
          my: "Ishlamaydi (ERROR 1451)",
          sq: "Ha (ishlaydi)"
        },
        {
          feature: "Ota kaliti unikal bo'lmasa",
          pg: "CREATE da xato beradi",
          my: "Sozlamaga bog'liq",
          sq: "INSERT da mismatch xatosi"
        },
        {
          feature: "Xato xabari tafsiloti",
          pg: "Aniq kalit va qiymat bilan",
          my: "To'liq cheklov ta'rifi bilan",
          sq: "Umumiy (constraint failed)"
        }
      ];

      rows.forEach((r, i) => {
        const ry = startY + 75 + i * 62;
        if (i % 2 === 0) {
          ctx.save();
          ctx.fillStyle = 'rgba(240,245,255,0.45)';
          ctx.fillRect(160, ry - 15, 1600, 58);
          ctx.restore();
        }
        text(r.feature, 200, ry + 15, { size: 20, weight: 600, color: C.ink, fam: UI });
        text(r.pg, 660, ry + 15, { size: 19, weight: 600, color: C.blue, fam: UI });
        text(r.my, 1050, ry + 15, { size: 19, weight: 600, color: C.orange, fam: UI });
        text(r.sq, 1460, ry + 15, { size: 19, weight: 600, color: C.purple, fam: UI });
      });

      // Pastdagi eslatma
      text("Eslatma: Har uchala tizimda ham xavfsiz va tez ishlash uchun bola kalitini doimo indekslang.", 960, startY + 450, { size: 20, weight: 700, color: C.green, fam: UI, align: 'center', ignoreCardCheck: true });
    });
  }

  // 5. XULOSA VA LOYIHA (62.0 -> 80.6s)
  function sXulosa(t) {
    heading("Tipik Xatolar va Loyihalash Xulosasi", t, TM.scenes.xulosa_va_loyiha.s);

    const kMain = P(t, TM.scenes.xulosa_va_loyiha.s + 0.3, 0.8);
    withA(kMain, () => {
      // 4 ta tipik xato kartasi
      const mistakes = [
        {
          mistake: "M:N ni massiv yoki vergulli matnda saqlash",
          bad: "Tashqi kalit, indeks va yaxlitlik yo'qoladi.",
          fix: "Doimo alohida oraliq jadval (junction table) quring.",
          col: C.red
        },
        {
          mistake: "Oraliq jadvalda narxni saqlamaslik",
          bad: "Mahsulot narxi oshganda eski hisobotlar buziladi.",
          fix: "Sotilgan paytdagi price snapshotini oraliq jadvalga yozing.",
          col: C.orange
        },
        {
          mistake: "Har yerga o'ylamasdan CASCADE qo'yish",
          bad: "Bitta o'chirish butun biznes ma'lumotlarini qirib yuborishi mumkin.",
          fix: "Faqat ajralmas qismlarga CASCADE, qolganiga RESTRICT.",
          col: C.blue
        },
        {
          mistake: "Bola kalitiga indeks qo'yishni unutish",
          bad: "Ota o'chganda butun jadval skanerlanib qotadi.",
          fix: "PostgreSQL va SQLite da doimo qo'lda CREATE INDEX qo'ying.",
          col: C.green
        }
      ];

      mistakes.forEach((m, i) => {
        const bx = 120 + (i % 2) * 850;
        const by = 200 + Math.floor(i / 2) * 260;
        card(bx, by, 830, 240, { fill: C.card, col: m.col, p: kMain });
        
        pill(`Xato #${i + 1}`, bx + 70, by + 35, m.col, kMain, 18);
        text(m.mistake, bx + 160, by + 35, { size: 21, weight: 700, color: C.ink, fam: UI });

        text("Oqibati:", bx + 40, by + 90, { size: 19, weight: 700, color: C.red, fam: UI });
        text(m.bad, bx + 130, by + 90, { size: 19, color: C.ink, fam: UI, maxW: 660 });

        text("Yechim:", bx + 40, by + 145, { size: 19, weight: 700, color: C.green, fam: UI });
        text(m.fix, bx + 130, by + 145, { size: 20, weight: 600, color: C.green, fam: UI, maxW: 660 });
      });

      // Pastdagi yakuniy xulosa
      const kFinal = P(t, W('l10', 'boring'), 0.8);
      withA(kFinal, () => {
        card(120, 740, 1680, 250, { fill: '#f0fdf4', col: C.green, p: kFinal });
        text("37-bob Xulosasi: Kuchli va Mustahkam Relyatsion Arxitektura", 160, 795, { size: 26, weight: 700, color: C.green, fam: UI });
        text("Tashqi kalitlar relyatsion ma'lumotlar bazalarining yuragi hisoblanadi.", 160, 855, { size: 23, color: C.ink, fam: UI });
        text("Ularni to'g'ri loyihalash, indekslash va ongli ravishda boshqarish xavfsiz tizimlarning poydevoridir.", 160, 905, { size: 23, weight: 700, color: C.blue, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    window.CURRENT_T = t;
    bg();
    if (t < TM.scenes.mysql_avtomatik_indeks.s) sIntro(t);
    else if (t < TM.scenes.sqlite_fk_va_mismatch.s) sMysql(t);
    else if (t < TM.scenes.solishtirma_matritsa.s) sSqlite(t);
    else if (t < TM.scenes.xulosa_va_loyiha.s) sMatritsa(t);
    else sXulosa(t);
  };

  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
