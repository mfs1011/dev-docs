// SQL 5-bob 3-qism: "Dialektlar" — MySQL, SQLite va 6 ta tipik xato
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, dbCylinder, serverBox, laptop, fileIcon, check, cross, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("5-bob", 960, 240, { size: 60, align: 'center', p: k, color: C.soft });
    hand("Dialektlar va 6 ta Tipik Xato", 960, 370, { size: 90, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("PostgreSQL vs MySQL vs SQLite", 960, 480, { size: 50, align: 'center', p: P(t, 1.2, 1.2) });
    marker(500, 520, 920 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L1', 'postgres'), 0.8);
    withA(kBadges, () => {
      pill("PostgreSQL: 4 bosqich", 520, 640, C.blue, kBadges, 26);
      pill("MySQL: baza = sxema", 960, 640, C.orange, kBadges, 26);
      pill("SQLite: Fayl + ATTACH", 1400, 640, C.green, kBadges, 26);
    });

    const kDesc = P(t, W('L1', 'oltita'), 0.8);
    withA(kDesc, () => {
      card(300, 740, 1320, 200, { fill: C.card, col: C.red, p: kDesc });
      text("Tizimlar orasidagi eng katta chalkashliklar va amaliyotdagi 6 ta xavfli tuzoq", 960, 800, { size: 30, weight: 700, align: 'center', color: C.ink });
      text("Bitta ulanishda bazalararo JOIN, search_path yo'qligi va shablonlar xavfi", 960, 860, { size: 26, align: 'center', color: C.soft });
    });
  }

  // 2. MYSQL (baza = sxema)
  function sMysql(t) {
    heading("MySQL: Baza va Sxema Aynan Bir Narsa!", t, L('L2').s - 0.4);

    // Terminal 1: CREATE SCHEMA = CREATE DATABASE
    const k1 = P(t, W('L2', 'sxema'), 0.5);
    term(140, 230, 780, 360, "1. MySQL da CREATE SCHEMA = CREATE DATABASE", [{
      b: {
        cmd: "CREATE SCHEMA ombor;\nCREATE DATABASE savdo;\nSHOW DATABASES LIKE '%o%';",
        out: (TTY.mysql && TTY.mysql.createdb ? TTY.mysql.createdb.split("\n") : [
          "+--------------------+",
          "| Database (%o%)     |",
          "+--------------------+",
          "| ombor              |",
          "| savdo              |",
          "+--------------------+"
        ])
      },
      t: k1,
      typeDur: 1.0
    }], { font: 15 });

    // Terminal 2: Bazalararo JOIN (Cross-DB JOIN)
    const k2 = P(t, W('L4', 'bitta'), 0.5);
    term(960, 230, 820, 360, "2. Bazalararo JOIN: MySQL da BEMALOL!", [{
      b: {
        cmd: "SELECT o.nom, s.narx\nFROM ombor.mahsulot o\nJOIN savdo.mahsulot s ON o.id = s.id;",
        out: (TTY.mysql && TTY.mysql.cross ? TTY.mysql.cross.split("\n") : [
          "+------+---------+",
          "| nom  | narx    |",
          "+------+---------+",
          "| Non  | 4000.00 |",
          "+------+---------+"
        ])
      },
      t: k2,
      typeDur: 1.0
    }], { font: 16 });

    // Pastdagi tushuntirish & USE talabi
    const kExplain = P(t, W('L5', 'qisqa'), 0.6);
    withA(kExplain, () => {
      card(140, 630, 1640, 360, { fill: C.card, col: C.orange, p: kExplain });
      pill("MySQL IERARXIYASI & QOIDALARI", 360, 680, C.orange, kExplain, 22);

      text("• MySQL da alohida 'sxema' qatlami YO'Q: Server -> Baza (Sxema) -> Jadval (faqat 3 bosqich).", 180, 735, { size: 23, weight: 700, color: C.ink });
      text("• Bitta ulanish bilan istalgan bazadagi jadvallarni bog'lash (JOIN) mumkin (PostgreSQL dagi taqiq yo'q).", 180, 780, { size: 23, color: C.green });
      text("• MySQL da search_path YO'Q! Qisqa nom (mahsulot) ishlatish uchun USE baza; buyrug'i shart.", 180, 825, { size: 23, color: C.ink });

      // Kichik terminal: No database selected
      card(180, 860, 1560, 100, { fill: '#fef2f2', col: C.red, p: kExplain });
      text("mysql> SELECT * FROM mahsulot;  -->  ERROR 1046 (3D000): No database selected", 220, 910, { size: 22, fam: MONO, weight: 700, color: C.red });
    });
  }

  // 3. SQLITE (Fayl = Baza & ATTACH)
  function sSqlite(t) {
    heading("SQLite: Diskdagi Fayl va ATTACH Arxitekturasi", t, L('L6').s - 0.4);

    // Chap tomon: Arxitektura kartasi (main, temp, savdo.db)
    const kArch = P(t, W('L6', 'diskdagi'), 0.5);
    withA(kArch, () => {
      card(140, 230, 720, 420, { fill: '#f0fdf4', col: C.green, p: kArch });
      hand("SQLite da Fayllar va Sxemalar", 180, 280, { size: 30, color: C.green, p: kArch });
      text("SQLite da server jarayoni yo'q. Har bir baza — alohida fayl!", 180, 330, { size: 22, weight: 600, color: C.ink });

      // main
      card(180, 370, 640, 70, { fill: '#fff', col: C.blue, p: kArch });
      pill("main", 260, 405, C.blue, kArch, 20);
      text("Asosiy ulanish fayli (masalan, ombor.db)", 360, 405, { size: 20, color: C.ink });

      // temp
      card(180, 460, 640, 70, { fill: '#fff', col: C.purple, p: kArch });
      pill("temp", 260, 495, C.purple, kArch, 20);
      text("Vaqtinchalik xotira (temporary tables)", 360, 495, { size: 20, color: C.ink });

      // attached
      card(180, 550, 640, 70, { fill: '#fff', col: C.green, p: kArch });
      pill("savdo", 260, 585, C.green, kArch, 20);
      text("ATTACH qilingan ikkinchi fayl (/tmp/savdo.db)", 360, 585, { size: 20, color: C.ink });
    });

    // O'ng tomon: Terminal: ATTACH va JOIN
    const kTerm = P(t, W('L7', 'bitta'), 0.5);
    term(900, 230, 880, 420, "SQLite da ATTACH va Bazalararo JOIN", [{
      b: {
        cmd: "ATTACH DATABASE '/tmp/savdo.db' AS savdo;\n.databases\nSELECT o.nom, s.narx FROM mahsulot o JOIN savdo.mahsulot s ON o.id = s.id;",
        out: (TTY.sqlite && TTY.sqlite.attach ? TTY.sqlite.attach.split("\n") : [
          "seq  name   file",
          "---  -----  ---------------------",
          "0    main   /tmp/ombor.db",
          "2    savdo  /tmp/savdo.db",
          "",
          "nom  narx",
          "---  ----",
          "Non  4000"
        ])
      },
      t: kTerm,
      typeDur: 1.0
    }], { font: 15 });

    // Pastki xulosa
    const kFoot = P(t, W('L8', 'meyn'), 0.5);
    withA(kFoot, () => {
      card(140, 680, 1640, 270, { fill: C.card, col: C.blue, p: kFoot });
      hand("SQLite ATTACH Qoidasi", 180, 735, { size: 30, color: C.blue, p: kFoot });
      text("• SQLite bitta ulanishda 10 tagacha (yoki sozlansa 125 tagacha) alohida faylni ATTACH qila oladi.", 180, 790, { size: 23, color: C.ink });
      text("• Ulangan har bir fayl alohida 'sxema' nomiga ega bo'ladi (masalan, savdo.mahsulot).", 180, 835, { size: 23, color: C.ink });
      text("• Boshlang'ich fayl har doim 'main' deb ataladi. Vaqtinchalik jadvallar esa 'temp' da turadi.", 180, 880, { size: 23, weight: 600, color: C.purple });
    });
  }

  // 4. COMPARISON TABLE
  function sComparison(t) {
    heading("Uch Tizim Taqqoslash Taxtasi", t, L('L9').s - 0.4);

    const kTable = P(t, W('L9', 'uchala'), 0.6);
    withA(kTable, () => {
      const x = 140, y = 230, w = 1640;
      card(x, y, w, 750, { fill: C.card, col: C.blue, p: kTable });

      // Table sarlavhalari
      const colX = [0, 400, 820, 1240];
      const colW = [400, 420, 420, 400];

      // Header row
      card(x, y, w, 70, { fill: '#1e293b', col: '#1e293b' });
      text("Xususiyat", x + 30, y + 35, { size: 24, weight: 700, fam: UI, color: '#fff' });
      text("PostgreSQL 18", x + 430, y + 35, { size: 24, weight: 700, fam: UI, color: '#93c5fd' });
      text("MySQL 9", x + 850, y + 35, { size: 24, weight: 700, fam: UI, color: '#fdba74' });
      text("SQLite 3", x + 1270, y + 35, { size: 24, weight: 700, fam: UI, color: '#86efac' });

      // Qatorlar
      const rows = [
        {
          prop: "Ierarxiya darajasi",
          pg: "Klaster > Baza > Sxema > Jadval (4)",
          my: "Server > Baza/Sxema > Jadval (3)",
          sq: "Fayl/Ulanish > Sxema > Jadval",
          at: W('L9', 'postgres')
        },
        {
          prop: "Baza va Sxema tengligi",
          pg: "Baza != Sxema (qat'iy ajratilgan)",
          my: "Baza = Sxema (sinonimlar)",
          sq: "Sxema = ATTACH qilingan fayl",
          at: W('L9', 'may')
        },
        {
          prop: "Bitta ulanishda Cross-DB",
          pg: "TAQIQLANGAN (faqat FDW orqali)",
          my: "RUXSAT ETILGAN (baza.jadval)",
          sq: "RUXSAT ETILGAN (ATTACH orqali)",
          at: W('L10', 'postgres')
        },
        {
          prop: "search_path bormi?",
          pg: "HA (search_path ustuvorligi)",
          my: "YO'Q (faqat USE baza;)",
          sq: "YO'Q (main, temp, sxema)",
          at: W('L10', 'may')
        },
        {
          prop: "Yangi baza yaratish",
          pg: "template1 dan fayl nusxalash",
          my: "Diskda yangi katalog ochish",
          sq: "Yangi .db fayl yaratish",
          at: W('L11', 'yangi')
        }
      ];

      rows.forEach((r, idx) => {
        const rowY = y + 70 + idx * 130;
        const kRow = P(t, r.at, 0.4);
        withA(kRow, () => {
          // Row background zebra
          if (idx % 2 === 1) {
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(x, rowY, w, 130);
          }
          // Chiziq
          sline(x, rowY, x + w, rowY, { p: 1, w: 1, col: 'rgba(0,0,0,0.08)' });

          // Ustunlar
          text(r.prop, x + 30, rowY + 65, { size: 22, weight: 700, color: C.ink });

          // PG
          text(r.pg, x + 430, rowY + 65, { size: 20, fam: MONO, weight: 600, color: C.blue, wrap: 380 });
          // MySQL
          text(r.my, x + 850, rowY + 65, { size: 20, fam: MONO, weight: 600, color: C.orange, wrap: 380 });
          // SQLite
          text(r.sq, x + 1270, rowY + 65, { size: 20, fam: MONO, weight: 600, color: C.green, wrap: 360 });
        });
      });
    });
  }

  // 5. 6 TA TIPIK XATO (Traps)
  function sTraps(t) {
    heading("Amaliyotdagi 6 ta Tipik Xato", t, L('L12').s - 0.4);

    const traps = [
      { num: "1", tit: "Har modulga alohida baza ochish", desc: "PG da boshqa bazaga JOIN qilib bo'lmaydi! Modullarni alohida sxemalarga ajrating.", col: C.red, at: W('L13', 'birinchi') },
      { num: "2", tit: "template1 ga sinov jadvali qo'shish", desc: "Bu jadval keyinchalik yaratilgan barcha yangi bazalarga avtomatik o'tib ketadi.", col: C.orange, at: W('L14', 'ikkinchi') },
      { num: "3", tit: "Zaxira nusxani template1 ga tiklash", desc: "Eski bazadagi iflosliklar takrorlanmasligi uchun toza template0 dan foydalaning.", col: C.purple, at: W('L15', 'uchinchi') },
      { num: "4", tit: "search_path ga ochiq sxema qo'shish", desc: "Boshqalar yoza oladigan sxemani yo'lga qo'shish xavfli kod ijrosiga sabab bo'ladi.", col: C.red, at: W('L16', 'tortinchi') },
      { num: "5", tit: "O'z jadvaliga 'pg_' prefiksi berish", desc: "PostgreSQL tizim kataloglari bilan to'qnashuv kelib chiqadi. Bu prefiks taqiqlangan.", col: C.blue, at: W('L17', 'beshinchi') },
      { num: "6", tit: "MySQL da USE qilmasdan so'rov yozish", desc: "Joriy baza tanlanmasa, 'ERROR 1046: No database selected' xatosi chiqadi.", col: C.orange, at: W('L18', 'oltinchi') }
    ];

    traps.forEach((trap, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 140 + col * 840, y = 230 + row * 240;
      const k = P(t, trap.at, 0.4);
      withA(k, () => {
        // Active highlight
        const isCurrent = t >= trap.at && (i === 5 || t < traps[i + 1].at);
        const fill = isCurrent ? '#fef2f2' : C.card;
        const bcol = isCurrent ? C.red : trap.col;

        card(x, y, 800, 215, { fill, col: bcol, p: k });
        pill(`XATO #${trap.num}`, x + 90, y + 45, bcol, k, 20);
        hand(trap.tit, x + 200, y + 45, { size: 28, color: bcol, p: k });

        text(trap.desc, x + 30, y + 125, { size: 22, color: C.ink, wrap: 740 });
        if (isCurrent) {
          marker(x + 25, y + 175, 750, 12, C.hlRed, 1);
        }
      });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Keyingi Bob", t, L('L19').s - 0.4);

    const pillars = [
      { tit: "PostgreSQL", sub: "Klaster > Baza > Sxema > Jadval", desc: "Sxema orqali xavfsiz ajratish, search_path va template arxitekturasi.", col: C.blue },
      { tit: "MySQL", sub: "Server > Baza/Sxema > Jadval", desc: "Baza va sxema bir narsa. Bitta ulanishda erkin JOIN, USE baza shart.", col: C.orange },
      { tit: "SQLite", sub: "Fayl > ATTACH > Jadval", desc: "Server yo'q, fayllar ATTACH qilinadi. main va temp har doim mavjud.", col: C.green }
    ];

    pillars.forEach((p, i) => {
      const k = P(t, W('L19', 'ierarxiyasini') + i * 0.3, 0.5);
      withA(k, () => {
        const x = 140 + i * 560, y = 250;
        card(x, y, 520, 420, { fill: C.card, col: p.col, p: k });
        hand(p.tit, x + 40, y + 60, { size: 36, color: p.col, p: k });
        pill(p.sub, x + 260, y + 120, p.col, k, 18);
        text(p.desc, x + 40, y + 210, { size: 24, color: C.ink, wrap: 440 });
      });
    });

    const kNext = P(t, W('L20', 'oltinchi'), 0.6);
    withA(kNext, () => {
      card(140, 720, 1640, 200, { fill: '#eff6ff', col: C.blue, p: kNext });
      hand("Keyingi 6-bobda: Raqamli Ma'lumot Turlari", 180, 785, { size: 38, color: C.blue, p: kNext });
      text("INTEGER turlari (SMALLINT, INT, BIGINT), aniq NUMERIC/DECIMAL, va suzuvchi vergulli REAL/DOUBLE tahlili.", 180, 855, { size: 26, color: C.ink });
      pill("06 RAQAMLAR", 1560, 785, C.blue, kNext, 22);
    });
  }

  function render(t) {
    bg();
    if (t < TM.scenes.mysql.s) sIntro(t);
    else if (t < TM.scenes.sqlite.s) sMysql(t);
    else if (t < TM.scenes.comparison.s) sSqlite(t);
    else if (t < TM.scenes.traps.s) sComparison(t);
    else if (t < TM.scenes.xulosa.s) sTraps(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("5-bob: Baza, sxema va jadval — Dialektlar", 960, 200, { size: 80, align: 'center', color: C.blue });
    hand("MySQL (baza = sxema), SQLite (ATTACH) va 6 ta tipik xato", 960, 300, { size: 46, align: 'center', color: C.ink });

    card(140, 400, 500, 480, { fill: C.card, col: C.orange });
    hand("MySQL Dialekti", 180, 460, { size: 34, color: C.orange });
    text("• CREATE SCHEMA = DATABASE\n• Server darajasida JOIN\n• search_path yo'q\n• USE baza; shart\n• No database selected", 180, 540, { size: 22, fam: MONO, color: C.ink });
    pill("baza = sxema", 390, 830, C.orange, 1, 20);

    card(710, 400, 500, 480, { fill: C.card, col: C.green });
    hand("SQLite Arxitekturasi", 750, 460, { size: 34, color: C.green });
    text("• Baza = Diskdagi fayl\n• ATTACH DATABASE 'fayl'\n• main va temp xotira\n• Server yo'q, yengil\n• Fayllararo JOIN", 750, 540, { size: 22, fam: MONO, color: C.ink });
    pill("Fayl + ATTACH", 960, 830, C.green, 1, 20);

    card(1280, 400, 500, 480, { fill: C.card, col: C.red });
    hand("6 ta Tipik Xato", 1320, 460, { size: 34, color: C.red });
    text("1. Modullarga ortiqcha baza\n2. template1 ga sinov jadvali\n3. Dumpni template1 ga tiklash\n4. search_path xavfsizligi\n5. 'pg_' prefiksi taqiqi\n6. MySQL USE unutish", 1320, 540, { size: 20, fam: MONO, color: C.ink });
    pill("6 ta amaliy tuzoq", 1530, 830, C.red, 1, 20);

    pill("PostgreSQL vs MySQL vs SQLite", 960, 970, C.blue, 1, 24);
  }

  window.render = render;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
})();
