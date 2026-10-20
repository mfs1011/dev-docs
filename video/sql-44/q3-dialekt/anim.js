// SQL 44-bob 3-qism: "Dialektlar" — MySQL va SQLite farqlari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. MYSQL INNODB HASH (0 -> 17.51s)
  function sMysqlHashInnoDB(t) {
    const k = P(t, 0.3, 1.0);
    hand("44-bob. Dialektlar", 960, 110, { size: 48, align: 'center', p: k, color: C.soft });
    hand("MySQL InnoDB: Hash Indeksi Cheklovi", 960, 195, { size: 64, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("USING HASH deb yozilsa ham, InnoDB uni B-tree qiladi", 960, 275, { size: 28, align: 'center', p: P(t, 1.2, 1.0) });
    marker(280, 305, 1360 * eio(P(t, 1.8, 0.7)), 12, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: CREATE INDEX va WARNING
      card(140, 340, 780, 480, { fill: C.card, col: C.orange, p: kBox });
      text("MySQL InnoDB Indeks Yaratish:", 180, 390, { size: 24, weight: 700, color: C.orange, fam: UI });
      sline(180, 415, 880, 415, { col: C.pencil, w: 1.5 });

      text("CREATE INDEX t_kod_hash ON t (kod) USING HASH;", 180, 455, { size: 16, fam: MONO, color: C.ink });
      text("SHOW WARNINGS;", 180, 490, { size: 16, fam: MONO, color: C.blue });

      srect(180, 520, 700, 150, { fill: '#fffaf0', stroke: C.orange });
      text("Note 3502:", 200, 555, { size: 16, weight: 700, fam: MONO, color: C.orange });
      text("This storage engine does not support", 200, 590, { size: 15, fam: MONO, color: C.ink });
      text("the HASH index algorithm, storage engine", 200, 620, { size: 15, fam: MONO, color: C.ink });
      text("default was used instead.", 200, 650, { size: 15, fam: MONO, color: C.ink });

      text("• Xato bermaydi, lekin B-tree qilib yaratadi!", 180, 700, { size: 18, color: C.orange, fam: UI });

      pill("InnoDB sukut bo'yicha B-tree'ga aylantiradi", 530, 765, C.orange, kBox, 16);

      // O'ng: information_schema va MEMORY
      const kRight = P(t, 8.5, 0.8);
      withA(kRight, () => {
        card(1000, 340, 780, 480, { fill: C.card, col: C.blue, p: kRight });
        text("Statistika va MEMORY Dvigateli:", 1040, 390, { size: 24, weight: 700, color: C.blue, fam: UI });
        sline(1040, 415, 1740, 415, { col: C.pencil, w: 1.5 });

        text("SELECT index_name, index_type", 1040, 455, { size: 16, fam: MONO, color: C.ink });
        text("FROM information_schema.statistics ...;", 1040, 485, { size: 16, fam: MONO, color: C.ink });

        srect(1040, 520, 700, 110, { fill: '#f0f5ff', stroke: C.blue });
        text("INDEX_NAME | INDEX_TYPE", 1060, 555, { size: 16, weight: 700, fam: MONO, color: C.blue });
        sline(1060, 575, 1720, 575, { col: C.pencil, w: 1 });
        text("PRIMARY    | BTREE", 1060, 605, { size: 16, fam: MONO, color: C.ink });
        text("t_kod_hash | BTREE  (HASH emas!)", 1060, 630, { size: 16, weight: 700, fam: MONO, color: C.red });

        text("Haqiqiy Hash MySQL'da qayerda bor?", 1040, 665, { size: 19, weight: 700, color: C.ink, fam: UI });
        text("Faqat MEMORY dvigatelidagi jadvallarda: ENGINE=MEMORY", 1040, 700, { size: 17, color: C.soft, fam: UI });

        pill("MEMORY jadvallarida: INDEX_TYPE = HASH bo'ladi", 1390, 765, C.blue, kRight, 16);
      });

      // Pastki xulosa
      const kFoot = P(t, 14.0, 0.8);
      withA(kFoot, () => {
        card(280, 855, 1360, 140, { fill: '#fff8e7', col: C.orange, p: kFoot });
        text("Xulosa: MySQL InnoDB'da alohida Hash indeksi qidirib yurmang!", 960, 905, { size: 24, weight: 700, color: C.orange, fam: UI, align: 'center' });
        text("InnoDB B-tree'lari adaptive hash index nomli ichki keshga ega, lekin u foydalanuvchi tomonidan yaratilmaydi.", 960, 945, { size: 19, color: C.ink, fam: UI, align: 'center' });
      });
    });
  }

  // 2. MYSQL SPATIAL VA INVISIBLE (17.51 -> 35.07s)
  function sMysqlSpatialInvisible(t) {
    heading("2. MySQL: SPATIAL VA INVISIBLE", "R-tree koordinatalar va xavfsiz test o'chirish", t, TM.scenes.mysql_spatial_invisible);

    const kSpat = P(t, 18.5, 0.8);
    withA(kSpat, () => {
      // Chap: SPATIAL R-tree
      card(140, 240, 780, 560, { fill: C.card, col: C.blue, p: kSpat });
      text("SPATIAL Indeks (R-tree)", 180, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("CREATE TABLE t (..., joy POINT NOT NULL SRID 0);", 180, 355, { size: 16, fam: MONO, color: C.ink });
      text("CREATE SPATIAL INDEX t_joy ON t (joy);", 180, 390, { size: 16, fam: MONO, color: C.blue });

      srect(180, 425, 700, 150, { fill: '#f0f5ff', stroke: C.blue });
      text("WHERE MBRContains(ST_GeomFromText('POLYGON...'), joy)", 200, 460, { size: 15, fam: MONO, color: C.ink });
      text("EXPLAIN FORMAT=TREE:", 200, 495, { size: 15, weight: 700, fam: MONO, color: C.blue });
      text("-> Filter: mbrcontains(...) (cost=0.71 rows=1)", 200, 530, { size: 15, fam: MONO, color: C.green });
      text("   -> Index range scan on t using t_joy", 200, 560, { size: 15, weight: 700, fam: MONO, color: C.green });

      text("• Fazoviy nuqtalarni to'rtburchak (MBR) bilan filtrlaydi.", 180, 610, { size: 17, color: C.ink, fam: UI });
      text("• MySQL'da faqat R-tree arxitekturasi qo'llanadi.", 180, 645, { size: 17, color: C.soft, fam: UI });
      text("• Ustun NOT NULL va aniq SRID bilan bo'lishi shart.", 180, 680, { size: 17, weight: 600, color: C.blue, fam: UI });

      pill("SPATIAL: Koordinatalar va geolokatsiya uchun", 530, 745, C.blue, kSpat, 16);
    });

    const kInvis = P(t, 26.5, 0.8);
    withA(kInvis, () => {
      // O'ng: INVISIBLE indeks
      card(1000, 240, 780, 560, { fill: C.card, col: C.purple, p: kInvis });
      text("INVISIBLE Indeks — Ajoyib Imkoniyat!", 1040, 290, { size: 24, weight: 700, color: C.purple, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("ALTER TABLE t ALTER INDEX t_j INVISIBLE;", 1040, 355, { size: 16, fam: MONO, color: C.purple });

      srect(1040, 395, 700, 160, { fill: '#fffaf0', stroke: C.purple });
      text("EXPLAIN FORMAT=TREE SELECT * FROM t WHERE j = 2;", 1060, 430, { size: 15, fam: MONO, color: C.ink });
      text("-> Table scan on t (cost=0.55 rows=3)", 1060, 470, { size: 16, weight: 700, fam: MONO, color: C.red });
      text("Statistika: IS_VISIBLE = NO", 1060, 510, { size: 16, weight: 700, fam: MONO, color: C.purple });

      text("• Indeks diskda saqlanadi va INSERT/UPDATE'da yangilanadi,", 1040, 590, { size: 17, color: C.ink, fam: UI });
      text("  lekin so'rov optimizatori uni 'ko'rmaydi'.", 1040, 620, { size: 17, color: C.ink, fam: UI });
      text("• Maqsad: Indeksni o'chirishdan oldin uning ta'sirini sinash!", 1040, 660, { size: 17, weight: 700, color: C.green, fam: UI });
      text("  Agar so'rovlar sekinlashsa, ALTER INDEX ... VISIBLE (1 soniya).", 1040, 690, { size: 16, color: C.soft, fam: UI });

      pill("PRIMARY KEY ga qo'llanmaydi — faqat ikkilamchi indekslarga", 1390, 745, C.purple, kInvis, 15);
    });

    // Pastki xulosa
    const kFoot2 = P(t, 31.5, 0.8);
    withA(kFoot2, () => {
      card(280, 835, 1360, 150, { fill: '#f4f6fc', col: C.purple, p: kFoot2 });
      text("PostgreSQL'da invisible indeks yo'q (u yerda enable_indexscan kabi rejalar bor).", 960, 885, { size: 22, weight: 700, color: C.purple, fam: UI, align: 'center' });
      text("MySQL'ning INVISIBLE indeksi katta ma'lumotlar bazasida xavfsiz monitoring uchun juda qulay.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // 3. SQLITE RTREE (35.07 -> 51.70s)
  function sSqliteRtree(t) {
    heading("3. SQLite: FAQAT B-TREE VA R*TREE", "USING yo'qligi va virtual jadval orqali indeks", t, TM.scenes.sqlite_rtree);

    const kSqlBtree = P(t, 36.0, 0.8);
    withA(kSqlBtree, () => {
      // Chap: USING yo'q
      card(140, 240, 780, 560, { fill: C.card, col: C.red, p: kSqlBtree });
      text("SQLite: CREATE INDEX Cheklovi", 180, 290, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      text("CREATE INDEX t_h ON t USING HASH (kod);", 180, 355, { size: 16, fam: MONO, color: C.ink });

      srect(180, 395, 700, 140, { fill: '#fff1f0', stroke: C.red });
      text("Parse error near line 2:", 200, 435, { size: 16, weight: 700, fam: MONO, color: C.red });
      text("near \"USING\": syntax error", 200, 475, { size: 18, weight: 700, fam: MONO, color: C.red });

      text("• SQLite faqat va faqat B-tree tuzilmasini qo'llaydi.", 180, 565, { size: 18, weight: 700, color: C.ink, fam: UI });
      text("• Hash, GiST, GIN, BRIN kabi maxsus turlar yo'q.", 180, 600, { size: 17, color: C.soft, fam: UI });
      text("• Skalyar qiymatlar, tenglik va oraliqlar uchun B-tree yetarli.", 180, 635, { size: 17, color: C.ink, fam: UI });

      pill("SQLite'da standart indeks faqat B-tree", 530, 745, C.red, kSqlBtree, 16);
    });

    const kRtree = P(t, 43.0, 0.8);
    withA(kRtree, () => {
      // O'ng: R*Tree moduli
      card(1000, 240, 780, 560, { fill: C.card, col: C.green, p: kRtree });
      text("SQLite R*Tree Moduli (Virtual Jadval)", 1040, 290, { size: 24, weight: 700, color: C.green, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("CREATE VIRTUAL TABLE joylar USING rtree(", 1040, 355, { size: 16, fam: MONO, color: C.ink });
      text("  id, minX, maxX, minY, maxY);", 1040, 385, { size: 16, fam: MONO, color: C.blue });

      srect(1040, 425, 700, 160, { fill: '#f6ffed', stroke: C.green });
      text("EXPLAIN QUERY PLAN SELECT id FROM joylar", 1060, 460, { size: 15, fam: MONO, color: C.ink });
      text("WHERE minX >= 0 AND maxX <= 6 ...;", 1060, 490, { size: 15, fam: MONO, color: C.ink });
      text("`--SCAN joylar VIRTUAL TABLE INDEX 2:D0B1D2B3", 1060, 535, { size: 16, weight: 700, fam: MONO, color: C.green });

      text("• Fazoviy koordinatalar va ko'p o'lchamli to'rtburchaklar.", 1040, 615, { size: 17, color: C.ink, fam: UI });
      text("• Alohida indeks emas, virtual jadval arxitekturasi.", 1040, 650, { size: 17, color: C.soft, fam: UI });
      text("• Kesh, geolokatsiya va grafik oraliqlar uchun maxsus modul.", 1040, 685, { size: 17, weight: 600, color: C.green, fam: UI });

      pill("R*Tree: SQLite'dagi ko'p o'lchamli oraliq yechimi", 1390, 745, C.green, kRtree, 16);
    });

    // Pastki xulosa
    const kFoot3 = P(t, 48.0, 0.8);
    withA(kFoot3, () => {
      card(280, 835, 1360, 150, { fill: '#fffaf0', col: C.green, p: kFoot3 });
      text("SQLite yengil va ixcham bo'lgani sababli B-tree'ga tayanadi.", 960, 885, { size: 22, weight: 700, color: C.green, fam: UI, align: 'center' });
      text("Murakkab fazoviy hisoblar uchun esa R*Tree kengaytmasi muammoni hal etadi.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // 4. TAQQOSLASH VA XATOLAR (51.70 -> 69.3s)
  function sTaqqoslashVaXatolar(t) {
    heading("4. TAQQOSLASH JADVALI VA TIPIK XATOLAR", "Arxitekturaviy farqlar va keng tarqalgan adashishlar", t, TM.scenes.taqqoslash_va_xatolar);

    const kTab = P(t, 52.5, 0.8);
    withA(kTab, () => {
      // Chap: Taqqoslash jadvali
      card(140, 240, 780, 560, { fill: C.card, col: C.blue, p: kTab });
      text("Baza Tizimlari Indeks Qobiliyati:", 180, 290, { size: 24, weight: 700, color: C.blue, fam: UI });
      sline(180, 315, 880, 315, { col: C.pencil, w: 1.5 });

      const matrix = [
        ["Indeks Turi", "Postgres", "MySQL", "SQLite"],
        ["B-tree", "✓ Sukut", "✓ Sukut", "✓ Yagona"],
        ["Hash", "✓ USING HASH", "✗ (B-tree)", "✗ (Xato)"],
        ["GiST / SP-GiST", "✓ Infratuzilma", "✗ Yo'q", "✗ Yo'q"],
        ["GIN (massiv, jsonb)", "✓ Teskari", "✗ Yo'q", "✗ Yo'q"],
        ["BRIN (blok xulosasi)", "✓ 24 kB", "✗ Yo'q", "✗ Yo'q"],
        ["Fazoviy (spatial)", "✓ GiST/SP-GiST", "✓ SPATIAL", "✓ R*Tree"],
        ["Invisible indeks", "✗ Yo'q", "✓ INVISIBLE", "✗ Yo'q"]
      ];

      matrix.forEach((r, idx) => {
        const yPos = 345 + idx * 42;
        const isHdr = idx === 0;
        text(r[0], 180, yPos, { size: isHdr ? 16 : 15, weight: isHdr ? 700 : 600, fam: isHdr ? UI : MONO, color: isHdr ? C.blue : C.ink });
        text(r[1], 440, yPos, { size: 15, weight: isHdr ? 700 : 500, fam: UI, color: r[1].startsWith('✓') ? C.green : C.soft });
        text(r[2], 600, yPos, { size: 15, weight: isHdr ? 700 : 500, fam: UI, color: r[2].startsWith('✓') ? C.green : C.soft });
        text(r[3], 760, yPos, { size: 15, weight: isHdr ? 700 : 500, fam: UI, color: r[3].startsWith('✓') ? C.green : C.soft });
        if (isHdr) sline(180, yPos + 12, 880, yPos + 12, { col: C.pencil, w: 1 });
      });

      pill("PostgreSQL eng boy indeks turlari to'plamiga ega", 530, 745, C.blue, kTab, 16);
    });

    const kTraps = P(t, 58.5, 0.8);
    withA(kTraps, () => {
      // O'ng: Tipik xatolar
      card(1000, 240, 780, 560, { fill: C.card, col: C.red, p: kTraps });
      text("Keng Tarqalgan Tipik Xatolar:", 1040, 290, { size: 24, weight: 700, color: C.red, fam: UI });
      sline(1040, 315, 1740, 315, { col: C.pencil, w: 1.5 });

      text("1. BRIN ni tasodifiy tartibli ustunga qo'yish:", 1040, 360, { size: 19, weight: 700, color: C.red, fam: UI });
      text("   Diskdagi har blokda min-max keng bo'lib, deyarli butun jadval", 1040, 395, { size: 17, color: C.ink, fam: UI });
      text("   qayta o'qiladi. Faqat vaqt va loglarga qo'ying!", 1040, 425, { size: 17, color: C.green, fam: UI });

      text("2. Hash indeksni 'kichikroq va tezroq B-tree' deb o'ylash:", 1040, 480, { size: 19, weight: 700, color: C.red, fam: UI });
      text("   U oraliq (<, >) va saralashga yaramaydi, hajmi ham katta bo'lishi mumkin.", 1040, 515, { size: 17, color: C.soft, fam: UI });

      text("3. MySQL'da katta indeksni darhol DROP qilish:", 1040, 570, { size: 19, weight: 700, color: C.red, fam: UI });
      text("   Avval INVISIBLE qiling, monitoring qiling, keyin o'chiring.", 1040, 605, { size: 17, color: C.green, fam: UI });

      text("4. GIN indeksdan Index-Only Scan kutish:", 1040, 660, { size: 19, weight: 700, color: C.red, fam: UI });
      text("   GIN uni qo'llamaydi, doim Bitmap Heap Scan ishlatadi.", 1040, 695, { size: 17, color: C.soft, fam: UI });

      pill("Xatolarni chetlab o'tish bazangizni sog'lom saqlaydi", 1390, 745, C.red, kTraps, 16);
    });

    // Pastki xulosa
    const kFoot4 = P(t, 63.5, 0.8);
    withA(kFoot4, () => {
      card(280, 835, 1360, 150, { fill: '#fff8e7', col: C.blue, p: kFoot4 });
      text("Bosh qoida: Har bir vazifaga mos eng optimal indeksni tanlang!", 960, 885, { size: 22, weight: 700, color: C.blue, fam: UI, align: 'center' });
      text("B-tree, GIN, GiST, BRIN va R-tree — to'g'ri tanlov so'rovlarni millisoniyalarda bajaradi.", 960, 925, { size: 19, color: C.ink, fam: UI, align: 'center' });
    });
  }

  // ASOSIY CHIZISH SIKLI
  function draw(t) {
    bg();
    if (t < TM.scenes.mysql_hash_innoDB.e) sMysqlHashInnoDB(t);
    else if (t < TM.scenes.mysql_spatial_invisible.e) sMysqlSpatialInvisible(t);
    else if (t < TM.scenes.sqlite_rtree.e) sSqliteRtree(t);
    else sTaqqoslashVaXatolar(t);
  }

  window.renderFrame = draw;
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () { window.renderFrame(5.0); };
})();
