// SQL 49-bob 3-qism: "Dialektlar" — To'liq matnli qidiruv
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 18) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. MYSQL: FULLTEXT VA BOOLEAN REJIMI (0 -> 19.426s)
  function sMysqlFulltextRejimlari(t) {
    const k = P(t, 0.3, 1.0);
    hand("49-bob. To'liq Matnli Qidiruv", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("MySQL: FULLTEXT va Boolean Rejimi", 960, 195, { size: 60, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("MATCH(sarlavha, matn) AGAINST (...) qanday ishlaydi?", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(250, 305, 1420 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: FULLTEXT rejimlari
      card(140, 340, 780, 480, { fill: C.card, col: C.blue, p: kBox });
      text("1. FULLTEXT Indeksi va MATCH AGAINST", 180, 390, { size: 22, weight: 700, color: C.blue, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("CREATE TABLE maqolalar (id int PRIMARY KEY,", 180, 445, { size: 13, fam: MONO, color: C.ink });
      text("  sarlavha varchar(200), matn text,", 180, 465, { size: 13, fam: MONO, color: C.ink });
      text("  FULLTEXT KEY ft (sarlavha, matn));", 180, 485, { size: 13, weight: 700, fam: MONO, color: C.blue });

      srect(180, 510, 700, 125, { fill: '#e6f4ff', stroke: C.blue });
      text("A) Natural Language (Standart rejim):", 200, 535, { size: 14, weight: 700, fam: UI, color: C.blue });
      text("   AGAINST ('konteyner') -> id 1, 2 ('konteynerda' topilmadi)", 200, 560, { size: 13, fam: MONO, color: C.ink });
      text("B) Boolean Mode (Prefiks bilan):", 200, 590, { size: 14, weight: 700, fam: UI, color: C.green });
      text("   AGAINST ('konteyner*' IN BOOLEAN MODE) -> id 5, 1, 2 ✓", 200, 615, { size: 13, weight: 700, fam: MONO, color: C.green });

      text("• MySQL da ham o'zbek tilida qo'shimchalar uchun yulduzcha (*) shart.", 180, 665, { size: 15, color: C.ink, fam: UI, wrap: 700 });
      text("• Reja: type=fulltext, key=ft (Using where; Ft_hints: no_ranking).", 180, 695, { size: 15, color: C.soft, fam: UI, wrap: 700 });

      pill("Boolean rejimida yulduzcha (*) prefiks qidiruvini beradi", 530, 780, C.blue, kBox, 15);

      // O'ng: Boolean operatorlar va tuzoq
      const kRight = P(t, 9.5, 0.8);
      withA(kRight, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.orange, p: kRight });
        text("2. Boolean Mode Operatorlari va Katta Tuzoq", 1040, 390, { size: 22, weight: 700, color: C.orange, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("Asosiy operatorlar:", 1040, 450, { size: 17, weight: 700, color: C.ink, fam: UI });
        text("• '+' — majburiy bo'lishi kerak  |  '-' — bo'lmasligi kerak", 1040, 475, { size: 15, fam: MONO, color: C.ink });

        srect(1040, 505, 700, 130, { fill: '#fffbe6', stroke: C.orange });
        text("DIQQAT: Operatorsiz so'z IXTIYORIY (OR) hisoblanadi!", 1060, 530, { size: 15, weight: 700, fam: UI, color: C.red });
        text("AGAINST ('konteyner* ilova*' IN BOOLEAN MODE)", 1060, 555, { size: 13, fam: MONO, color: C.ink });
        text("-> 4-maqolada konteyner yo'q, lekin ilovalarni borligi uchun chiqdi!", 1060, 580, { size: 12, fam: UI, color: C.ink, wrap: 660 });
        text("Ikkalasi ham majburiy bo'lishi uchun: '+konteyner* +ilova*'", 1060, 610, { size: 13, weight: 700, fam: MONO, color: C.green });

        text("Taqiqlangan so'z misoli:", 1040, 665, { size: 16, weight: 700, color: C.ink, fam: UI });
        text("'+konteyner* -docker' -> faqat 5 va 2-maqolalar qaytdi.", 1040, 695, { size: 15, fam: MONO, color: C.green });

        pill("MySQL da majburiy so'zlar oldiga doim '+' qo'yilishi shart", 1390, 780, C.orange, kRight, 15);
      });

      // Pastki xulosa
      const kFoot = P(t, 15.0, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 135, { fill: '#fff8e7', col: C.blue, p: kFoot });
        text("MySQL da bir nechta so'z kiritilganda '+' belgisi qo'yilmasa, tizim ularni OR kabi tushunadi.", 960, 905, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
        text("Aniq natija olish uchun har bir kalit so'z oldiga plyus qo'yishni unutmang.", 960, 945, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
      });
    });
  }

  // 2. MYSQL: MINIMAL TOKEN VA NGRAM (19.426 -> 36.07s)
  function sMysqlMinTokenVaNgram(t) {
    heading("2. MYSQL: MINIMAL TOKEN VA NGRAM PARSER", "Qisqa so'zlar indeksi va so'z o'rtasidagi bo'laklarni topish", t, TM.scenes.mysql_min_token_va_ngram);

    const kBox = P(t, 20.0, 0.8);
    withA(kBox, () => {
      // Chap: Minimal token
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kBox });
      text("1. innodb_ft_min_token_size Tuzog'i", 180, 290, { size: 22, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("4-maqola: 'Kafka va xabarlar'", 180, 350, { size: 16, weight: 700, color: C.ink, fam: UI });
      text("SELECT id FROM maqolalar WHERE MATCH(...) AGAINST ('va');", 180, 380, { size: 13, fam: MONO, color: C.ink, wrap: 700 });

      srect(180, 415, 700, 150, { fill: '#fff2f0', stroke: C.red });
      text("Natija: BO'SH QATOR (Empty set)! Nega?", 200, 440, { size: 16, weight: 700, fam: UI, color: C.red });
      text("SELECT @@innodb_ft_min_token_size;  --> 3", 200, 475, { size: 16, weight: 700, fam: MONO, color: C.red });
      text("• Standart holatda InnoDB 3 belgidan qisqa so'zni indekslamaydi!", 200, 510, { size: 14, fam: UI, color: C.ink, wrap: 660 });
      text("• 'va', 'bu', 'u' kabi qisqa so'zlar indeksga kirmay qolgan.", 200, 535, { size: 14, fam: UI, color: C.soft, wrap: 660 });

      text("Yechim yo'li:", 180, 595, { size: 17, weight: 700, color: C.ink, fam: UI });
      text("1. Server sozlamasida innodb_ft_min_token_size=2 qilish.", 180, 625, { size: 15, fam: UI, color: C.ink });
      text("2. Serverni qayta ishga tushirib jadval indeksini OPTIMIZE qilish.", 180, 655, { size: 15, fam: UI, color: C.soft });

      pill("3 belgidan qisqa so'zlar standart MySQL da indekslanmaydi", 530, 765, C.red, kBox, 15);
    });

    const kRight = P(t, 27.0, 0.8);
    withA(kRight, () => {
      // O'ng: ngram parser
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kRight });
      text("2. ngram Parser: So'z Bo'lagi Bo'yicha Qidiruv", 1040, 290, { size: 22, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("Sharqiy tillar va satr bo'laklari uchun maxsus parser:", 1040, 350, { size: 17, weight: 700, color: C.green, fam: UI });

      srect(1040, 385, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("CREATE TABLE maqolalar_ng (", 1060, 410, { size: 13, fam: MONO, color: C.ink });
      text("  id int PRIMARY KEY, sarlavha varchar(200),", 1060, 430, { size: 13, fam: MONO, color: C.ink });
      text("  FULLTEXT KEY ft (sarlavha) WITH PARSER ngram);", 1060, 450, { size: 13, weight: 700, fam: MONO, color: C.green });
      text("WHERE MATCH(sarlavha) AGAINST ('\"teyner\"' IN BOOLEAN MODE);", 1060, 480, { size: 12, weight: 700, fam: MONO, color: C.green, wrap: 660 });
      text("Natija: id 1, 2, 5 — so'z o'rtasidagi 'teyner' topildi!", 1060, 515, { size: 14, weight: 700, fam: UI, color: C.green });

      text("Qanday ishlaydi?", 1040, 575, { size: 17, weight: 700, color: C.ink, fam: UI });
      text("• Matn ngram_token_size (standart 2) uzunlikdagi bo'laklarga ajraladi.", 1040, 605, { size: 15, fam: UI, color: C.ink, wrap: 700 });
      text("• 'konteyner' -> ko, on, nt, te, ey, yn, ne, er.", 1040, 635, { size: 15, fam: MONO, color: C.ink });
      text("• PostgreSQL'dagi pg_trgm kabi qidirish imkonini beradi.", 1040, 665, { size: 15, color: C.soft, fam: UI, wrap: 700 });

      pill("ngram parseri so'zning ixtiyoriy ichki bo'lagini topa oladi", 1390, 765, C.green, kRight, 15);
    });

    // Pastki xulosa
    const kFoot = P(t, 32.0, 0.8);
    withA(kFoot, () => {
      card(280, 835, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
      text("MySQL da so'z bo'laklari bo'yicha qidiruv kerak bo'lsa, ngram parseri bilan FULLTEXT indeks quring.", 960, 880, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("Standart parser esa faqat so'z boshi bo'yicha qidirish imkonini beradi.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 3. SQLITE: FTS5 VIRTUAL JADVAL (36.07 -> 53.119s)
  function sSqliteFts5VirtualJadval(t) {
    heading("3. SQLITE: FTS5 VIRTUAL JADVALI VA BM25", "External content va manfiy reyting siri", t, TM.scenes.sqlite_fts5_virtual_jadval);

    const kBox = P(t, 37.0, 0.8);
    withA(kBox, () => {
      // Chap: FTS5 virtual table
      card(140, 240, 780, 560, { fill: C.card, col: C.blue, p: kBox });
      text("1. FTS5 Virtual Jadvali (External Content)", 180, 290, { size: 22, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("CREATE VIRTUAL TABLE izlash USING fts5(", 180, 345, { size: 13, fam: MONO, color: C.ink });
      text("  sarlavha, matn, content='maqolalar', content_rowid='id');", 180, 365, { size: 13, fam: MONO, color: C.ink });
      text("INSERT INTO izlash(izlash) VALUES ('rebuild');", 180, 390, { size: 13, weight: 700, fam: MONO, color: C.blue });

      srect(180, 420, 700, 145, { fill: '#e6f4ff', stroke: C.blue });
      text("Qidiruv so'rovlari va natijalar:", 200, 445, { size: 14, weight: 700, fam: UI, color: C.blue });
      text("SELECT rowid, sarlavha FROM izlash WHERE izlash MATCH 'konteyner*';", 200, 475, { size: 12, fam: MONO, color: C.ink, wrap: 660 });
      text("1|Docker konteynerlari  |  2|Konteyner tarmoqlari  |  5|Konteynerda baza", 200, 505, { size: 12, weight: 700, fam: MONO, color: C.green, wrap: 660 });
      text("Operatorlar: OR, NOT so'z bilan; bo'shliq esa AND!", 200, 535, { size: 13, weight: 700, fam: UI, color: C.blue });

      text("• External content: matn ikki marta saqlanmaydi, disk tejaladi.", 180, 595, { size: 15, color: C.ink, fam: UI, wrap: 700 });
      text("• porter tokenizatori: inglizcha so'z shakllarini birlashtiradi.", 180, 625, { size: 15, color: C.soft, fam: UI, wrap: 700 });

      pill("FTS5 external content bilan qo'shimcha xotira sarflamaydi", 530, 765, C.blue, kBox, 15);
    });

    const kRight = P(t, 43.5, 0.8);
    withA(kRight, () => {
      // O'ng: bm25 reytingi va trigram
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kRight });
      text("2. bm25 Reytingi va trigram Tokenizatori", 1040, 290, { size: 22, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("bm25 Reytingi Siri (rank ustuni):", 1040, 350, { size: 17, weight: 700, color: C.green, fam: UI });

      srect(1040, 380, 700, 150, { fill: '#f6ffed', stroke: C.green });
      text("SELECT rowid, sarlavha, round(rank, 4) FROM izlash", 1060, 405, { size: 12, fam: MONO, color: C.ink });
      text("WHERE izlash MATCH 'konteyner* OR ilova*' ORDER BY rank;", 1060, 425, { size: 12, weight: 700, fam: MONO, color: C.green });
      text("4|Kafka va xabarlar    | -0.5965", 1060, 455, { size: 13, weight: 700, fam: MONO, color: C.green });
      text("1|Docker konteynerlari | -0.5711", 1060, 475, { size: 13, fam: MONO, color: C.green });
      text("DIQQAT: Qiymat qancha kichik bo'lsa, moslik shuncha yuqori!", 1060, 500, { size: 13, weight: 700, fam: UI, color: C.green });

      text("trigram tokenizatori bilan LIKE '%...%':", 1040, 560, { size: 16, weight: 700, color: C.ink, fam: UI });
      text("CREATE VIRTUAL TABLE izlash_tri USING fts5(..., tokenize='trigram');", 1040, 590, { size: 12, fam: MONO, color: C.ink, wrap: 700 });
      text("WHERE sarlavha LIKE '%teyner%' -> SCAN VIRTUAL TABLE INDEX!", 1040, 620, { size: 13, weight: 700, fam: MONO, color: C.green, wrap: 700 });
      text("SQLite ham LIKE so'rovini indeks orqali bir zumda bajaradi.", 1040, 650, { size: 15, color: C.soft, fam: UI, wrap: 700 });

      pill("bm25 manfiy reyting: ORDER BY rank (ASC) qilinadi", 1390, 765, C.green, kRight, 15);
    });

    // Pastki xulosa
    const kFoot = P(t, 49.0, 0.8);
    withA(kFoot, () => {
      card(280, 835, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
      text("Postgres va MySQL da reyting qancha katta bo'lsa shuncha yaxshi (DESC).", 960, 880, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("SQLite FTS5 da esa bm25 reytingi qancha kichik bo'lsa shuncha yuqori hisoblanadi (ASC)!", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  // 4. UCH TIZIM QIYOSIY TAHLILI (53.119 -> 73.08s)
  function sUchTizimQiyosiyXulosasi(t) {
    heading("4. QIYOSIY XULOSA: UCHALA TIZIM TAQQOSI", "PostgreSQL, MySQL va SQLite to'liq matnli qidiruv jadvali", t, TM.scenes.uch_tizim_qiyosiy_xulosasi);

    const kBox = P(t, 54.0, 0.8);
    withA(kBox, () => {
      // Katta taqqoslash kartasi
      card(140, 240, 1640, 560, { fill: C.card, col: C.blue, p: kBox });
      text("To'liq Matnli Qidiruv: Uchala Tizim Qiyosiy Ko'rsatkichlari", 180, 290, { size: 22, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      // Table Header
      srect(180, 335, 1560, 40, { fill: '#e6f4ff', stroke: C.blue });
      text("Xususiyat", 200, 360, { size: 15, weight: 700, fam: UI, color: C.blue });
      text("PostgreSQL 18.6", 520, 360, { size: 15, weight: 700, fam: UI, color: C.blue });
      text("MySQL 9.7.2", 960, 360, { size: 15, weight: 700, fam: UI, color: C.blue });
      text("SQLite 3.54.1", 1380, 360, { size: 15, weight: 700, fam: UI, color: C.blue });

      const rows = [
        ["So'rov turi", "tsvector @@ tsquery", "MATCH ... AGAINST", "fts5 ... MATCH"],
        ["Indeks turi", "GIN / GiST", "FULLTEXT (InnoDB)", "FTS5 Virtual Table"],
        ["O'zbek tili", "simple (qo'shimchalar qoladi)", "Standart (qo'shimchalar qoladi)", "unicode61 (qo'shimchalar qoladi)"],
        ["Prefiks sintaksisi", "konteyner:*", "konteyner* (boolean)", "konteyner*"],
        ["Reyting tartibi", "ts_rank (Kattasi yaxshi - DESC)", "MATCH() (Kattasi yaxshi - DESC)", "bm25 (Kichigi yaxshi - ASC)"],
        ["Mantiqiy operator", "&, ! (websearch: -)", "+, - (bo'shliq ixtiyoriy!)", "AND, NOT (bo'shliq AND)"],
        ["LIKE '%...%' indeksi", "pg_trgm (GIN) — 0.038 ms", "ngram parser — WITH PARSER", "trigram tokenizator"]
      ];

      rows.forEach(([feat, pg, my, sq], idx) => {
        const y = 385 + idx * 46;
        srect(180, y, 1560, 42, { fill: idx % 2 === 0 ? '#ffffff' : '#f9fbfd', stroke: '#e8e8e8' });
        text(feat, 200, y + 26, { size: 14, weight: 700, fam: UI, color: C.ink });
        text(pg, 520, y + 26, { size: 13, fam: MONO, color: C.blue });
        text(my, 960, y + 26, { size: 13, fam: MONO, color: C.orange });
        text(sq, 1380, y + 26, { size: 13, fam: MONO, color: C.green });
      });

      pill("O'zbek tili uchun har uchala tizimda ham prefiks yulduzchasi (:* yoki *) qo'llaniladi", 960, 755, C.green, kBox, 16);
    });

    // Pastki xulosa
    const kFoot = P(t, 66.0, 0.8);
    withA(kFoot, () => {
      card(280, 835, 1360, 140, { fill: '#fff8e7', col: C.blue, p: kFoot });
      text("Eng muhim amaliy qoida: O'zbek tilida tayyor stemming yo'qligi sababli,", 960, 880, { size: 21, weight: 700, color: C.blue, fam: UI, align: 'center', wrap: 1300 });
      text("har doim so'z o'zagidan keyin prefiks yulduzchasidan foydalanib barcha kelishik shakllarini qamrab oling.", 960, 925, { size: 18, color: C.soft, fam: UI, align: 'center', wrap: 1300 });
    });
  }

  function renderScene(t) {
    ctx.clearRect(0, 0, 1920, 1080);
    bg();
    if (t < TM.scenes.mysql_min_token_va_ngram.s) {
      sMysqlFulltextRejimlari(t);
    } else if (t < TM.scenes.sqlite_fts5_virtual_jadval.s) {
      sMysqlMinTokenVaNgram(t);
    } else if (t < TM.scenes.uch_tizim_qiyosiy_xulosasi.s) {
      sSqliteFts5VirtualJadval(t);
    } else {
      sUchTizimQiyosiyXulosasi(t);
    }
  }

  window.renderScene = window.render = window.renderFrame = renderScene;
  window.renderPoster = function () {
    window.renderFrame(10.0);
  };
})();
