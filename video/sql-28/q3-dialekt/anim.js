// SQL 28-bob 3-qism: "Dialektlar" — MySQL va SQLite da Set Amallari Farqlari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI, term } = K;
  const TTY = window.TTY || {};

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("28-bob. Dialektlar", 960, 160, { size: 54, align: 'center', p: k, color: C.soft });
    hand("MySQL va SQLite da Set Amallari Farqlari", 960, 255, { size: 76, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("ALL yo'qligi, ustuvorlik tafovuti, tiplar va qism ichida LIMIT xususiyatlari", 960, 345, { size: 32, align: 'center', p: P(t, 1.2, 1.2) });
    marker(220, 380, 1480 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kCards = P(t, W('intro', 'May'), 0.8);
    withA(kCards, () => {
      // 3 engine comparison cards
      card(140, 440, 500, 520, { fill: C.card, col: C.blue, p: kCards });
      pill("PostgreSQL 18", 390, 490, C.blue, kCards, 22);
      text("• INTERSECT / EXCEPT ALL bor", 170, 560, { size: 20, weight: 700, color: C.ink, fam: UI });
      text("• INTERSECT ustunroq (precedence)", 170, 610, { size: 19, color: C.green, fam: UI });
      text("• Qismda (SELECT ... LIMIT 1) ishlaydi", 170, 655, { size: 19, color: C.blue, fam: UI });
      text("• ORDER BY ifoda bilan XATO", 170, 700, { size: 19, color: C.red, fam: UI });
      text("• Tiplar qat'iy tekshiriladi", 170, 745, { size: 19, color: C.soft, fam: UI });
      text("• NULL takror hisoblanadi", 170, 790, { size: 18, color: C.soft, fam: UI });

      card(680, 440, 540, 520, { fill: C.card, col: C.green, p: kCards });
      pill("MySQL 9.7", 950, 490, C.green, kCards, 22);
      text("• Barcha amallar va ALL to'liq bor", 710, 560, { size: 20, weight: 700, color: C.green, fam: UI });
      text("• TABLE va VALUES sintaksisi bor", 710, 610, { size: 19, color: C.blue, fam: UI });
      text("• Tiplar mos kelmasa matnga o'tadi", 710, 655, { size: 19, color: C.green, fam: UI });
      text("• ORDER BY m + n (ifoda) ishlaydi", 710, 700, { size: 19, color: C.green, fam: UI });
      text("• Error 1222: ustunlar soni farqi", 710, 745, { size: 19, color: C.orange, fam: UI });
      text("• INTERSECT ustunroq", 710, 790, { size: 18, color: C.soft, fam: UI });

      card(1260, 440, 520, 520, { fill: C.card, col: C.purple, p: kCards });
      pill("SQLite 3.54", 1520, 490, C.purple, kCards, 22);
      text("• INTERSECT/EXCEPT ALL YO'Q!", 1290, 560, { size: 20, weight: 700, color: C.red, fam: UI });
      text("• USTUVORLIK YO'Q: chapdan o'ngga!", 1290, 610, { size: 19, weight: 700, color: C.red, fam: UI });
      text("• (a UNION b INTERSECT c) = 2 rows!", 1290, 655, { size: 19, color: C.purple, fam: UI });
      text("• Qismda LIMIT faqat FROM subquery", 1290, 700, { size: 19, color: C.orange, fam: UI });
      text("• ORDER BY ifoda bilan ishlamaydi", 1290, 745, { size: 19, color: C.soft, fam: UI });
      text("• Tiplar aralashib turaveradi", 1290, 790, { size: 18, color: C.soft, fam: UI });
    });
  }

  // 2. MYSQL XUSUSIYATLARI
  function sMysqlXususiyatlari(t) {
    heading("MySQL: Tiplar Moslashuvchanligi va ORDER BY Ifodalar", t, TM.scenes.mysql_xususiyatlari.s);

    const k = P(t, TM.scenes.mysql_xususiyatlari.s + 0.3, 0.8);
    withA(k, () => {
      // Left: Type flexibility
      card(100, 200, 840, 760, { fill: C.card, col: C.green, p: k });
      pill("Tiplar Mos Kelmasa: Umumiy Matnga Kengayadi", 520, 250, C.green, k, 19);

      card(140, 310, 760, 160, { fill: '#fff', col: C.green, p: k });
      text("SELECT m FROM a  -- integer ustun", 170, 360, { size: 20, color: C.ink, fam: MONO });
      text("UNION", 170, 400, { size: 20, color: C.blue, fam: MONO });
      text("SELECT 'matn' ORDER BY 1; -- string", 170, 440, { size: 20, color: C.green, fam: MONO });

      card(140, 490, 760, 220, { fill: '#1e293b', col: '#334155', p: k });
      text("+------+", 170, 530, { size: 18, color: '#64748b', fam: MONO });
      text("| m    |", 170, 560, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("+------+", 170, 590, { size: 18, color: '#64748b', fam: MONO });
      text("| 1    |\n| 2    |\n| 3    |\n| matn |", 170, 620, { size: 18, color: '#fff', fam: MONO });

      card(140, 730, 760, 200, { fill: '#f0fdf4', col: C.green, p: k });
      text("Taqqoslash:", 170, 775, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• PostgreSQL: ERROR: invalid input syntax for integer: 'matn'", 170, 820, { size: 17, color: C.red, fam: MONO });
      text("• MySQL: Tiplarni solishtirib, barchasini sig'diradigan umumiy tipga (VARCHAR) o'tkazadi va xatosiz ishlaydi!", 170, 865, { size: 18, color: C.ink, fam: UI, maxW: 700 });

      // Right: ORDER BY expression & TABLE syntax
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("ORDER BY m + n va TABLE Sintaksisi", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 180, { fill: '#fff', col: C.blue, p: k });
      text("SELECT m, n FROM a UNION SELECT m, n FROM b", 1070, 355, { size: 17, color: C.ink, fam: MONO });
      text("ORDER BY m + n; -- Ifoda orqali saralash!", 1070, 400, { size: 17, weight: 700, color: C.green, fam: MONO });
      text("-> (1,2: 3), (1,3: 4), (2,3: 5), (3,4: 7) — To'g'ri saralandi!", 1070, 445, { size: 17, weight: 700, color: C.blue, fam: UI });

      card(1040, 510, 740, 200, { fill: '#eff6ff', col: C.blue, p: k });
      text("TABLE va VALUES sintaksisi:", 1070, 555, { size: 20, weight: 700, color: C.blue, fam: UI });
      text("TABLE a INTERSECT TABLE b;", 1070, 605, { size: 19, weight: 700, color: C.purple, fam: MONO });
      text("Bu 'SELECT * FROM a INTERSECT SELECT * FROM b' ning qisqa va qulay shaklidir.", 1070, 655, { size: 18, color: C.ink, fam: UI, maxW: 680 });

      card(1040, 730, 740, 200, { fill: '#fff5f5', col: C.red, p: k });
      text("Ustunlar soni farqi (ERROR 1222):", 1070, 775, { size: 19, weight: 700, color: C.red, fam: UI });
      text("ERROR 1222 (21000): The used SELECT statements have a different number of columns", 1070, 825, { size: 16, color: C.red, fam: MONO });
    });
  }

  // 3. SQLITE ALL YOQLIGI
  function sSqliteAllYoqligi(t) {
    heading("SQLite: INTERSECT ALL va EXCEPT ALL Mavjud Emas", t, TM.scenes.sqlite_all_yoqligi.s);

    const k = P(t, TM.scenes.sqlite_all_yoqligi.s + 0.3, 0.8);
    withA(k, () => {
      card(100, 200, 1720, 760, { fill: C.card, col: C.red, p: k });
      pill("SQLite Sintaksisida INTERSECT ALL va EXCEPT ALL YO'Q!", 960, 255, C.red, k, 21);

      card(140, 310, 1640, 160, { fill: '#fff5f5', col: C.red, p: k });
      text("SELECT * FROM c INTERSECT ALL SELECT * FROM c;", 180, 360, { size: 20, weight: 700, color: C.red, fam: MONO });
      text("Parse error near line 11: near \"ALL\": syntax error", 180, 415, { size: 20, weight: 700, color: '#dc2626', fam: MONO });

      // Explanation
      card(140, 490, 1640, 440, { fill: '#fff', col: C.purple, p: k });
      text("SQLiteCompound Select Operators:", 180, 540, { size: 24, weight: 700, color: C.purple, fam: UI });

      const allowed = [
        { name: "UNION", status: "Bor (Takrorlar olib tashlanadi)", col: C.green },
        { name: "UNION ALL", status: "Bor (Barcha takrorlar saqlanadi)", col: C.green },
        { name: "INTERSECT", status: "Bor (Faqat DISTINCT — ALL varianti yo'q!)", col: C.orange },
        { name: "EXCEPT", status: "Bor (Faqat DISTINCT — ALL varianti yo'q!)", col: C.orange },
      ];

      allowed.forEach((a, i) => {
        const ay = 590 + i * 65;
        pill(a.name, 320, ay + 20, a.col, k, 18);
        text(a.status, 470, ay + 26, { size: 20, weight: 600, color: C.ink, fam: UI });
      });

      card(180, 855, 1560, 55, { fill: '#eff6ff', col: C.blue, p: k });
      text("Xulosa: SQLite da INTERSECT va EXCEPT natijasi doimo DISTINCT bo'ladi, takrorlar qolmaydi.", 200, 890, { size: 18, weight: 600, color: C.blue, fam: UI });
    });
  }

  // 4. SQLITE USTUVORLIK YOQLIGI
  function sSqliteUstuvorlikYoqligi(t) {
    heading("KATTA TUZOQ: SQLite da Ustuvorlik Yo'q!", t, TM.scenes.sqlite_ustuvorlik_yoqligi.s);

    const k = P(t, TM.scenes.sqlite_ustuvorlik_yoqligi.s + 0.3, 0.8);
    withA(k, () => {
      // Comparison header
      card(100, 200, 1720, 120, { fill: '#fff5f5', col: C.red, p: k });
      text("Bir Xil So'rov — Mutlaqo Boshqa Natija (Xatosiz!):", 140, 245, { size: 22, weight: 700, color: C.red, fam: UI });
      text("SELECT * FROM a UNION SELECT * FROM b INTERSECT SELECT * FROM c ORDER BY m, n;", 140, 290, { size: 18, weight: 700, color: C.ink, fam: MONO });

      // Left: PG and MySQL
      card(100, 350, 840, 610, { fill: C.card, col: C.green, p: k });
      pill("PostgreSQL 18 va MySQL 9.7 (Standart)", 520, 400, C.green, k, 19);

      card(140, 460, 760, 170, { fill: '#1e293b', col: '#334155', p: k });
      text("a UNION (b INTERSECT c)  -- INTERSECT ustun!", 170, 505, { size: 18, weight: 700, color: '#86efac', fam: MONO });
      text("Natija: (1,2), (1,3), (2,3), (3,4)", 170, 555, { size: 20, color: '#fff', fam: MONO });
      text("Jami: 4 rows", 170, 595, { size: 20, weight: 700, color: '#4ade80', fam: MONO });

      card(140, 650, 760, 280, { fill: '#f0fdf4', col: C.green, p: k });
      text("Standart SQL Qoidasi:", 170, 695, { size: 21, weight: 700, color: C.green, fam: UI });
      text("• INTERSECT amali har doim UNION dan avval hisoblanadi.", 170, 745, { size: 19, color: C.ink, fam: UI });
      text("• Chunki to'plamlar nazariyasida kesishma birlashmaga nisbatan ko'paytirish kabi ustuvor hisoblanadi.", 170, 795, { size: 18, color: C.ink, fam: UI, maxW: 700 });

      // Right: SQLite
      card(1000, 350, 820, 610, { fill: '#fffdf5', col: C.orange, p: k });
      pill("SQLite 3.54 (Qat'iy Chapdan O'ngga!)", 1410, 400, C.orange, k, 19);

      card(1040, 460, 740, 170, { fill: '#1e293b', col: '#334155', p: k });
      text("(a UNION b) INTERSECT c  -- Ustuvorlik yo'q!", 1070, 505, { size: 18, weight: 700, color: '#fb923c', fam: MONO });
      text("Natija: (1,3), (3,4)", 1070, 555, { size: 20, color: '#fff', fam: MONO });
      text("Jami: 2 rows (2 baravar kam!)", 1070, 595, { size: 20, weight: 700, color: '#f87171', fam: MONO });

      card(1040, 650, 740, 280, { fill: '#fff5f5', col: C.red, p: k });
      text("Xavf va Yechim:", 1070, 695, { size: 21, weight: 700, color: C.red, fam: UI });
      text("• Hech qanday xato chiqmaydi, lekin natija butkul boshqa!", 1070, 745, { size: 19, weight: 700, color: C.red, fam: UI });
      text("• Agar kod turli bazalarda ishlatilsa, albatta qavs yoki subquery bilan tartibni qat'iy belgilang!", 1070, 795, { size: 18, color: C.ink, fam: UI, maxW: 680 });
    });
  }

  // 5. SQLITE TARTIB VA TIPLARI
  function sSqliteTartibVaTiplar(t) {
    heading("SQLite: Qismlarda LIMIT va Tiplar Xulqi", t, TM.scenes.sqlite_tartib_va_tiplar.s);

    const k = P(t, TM.scenes.sqlite_tartib_va_tiplar.s + 0.3, 0.8);
    withA(k, () => {
      // Left: LIMIT in parts
      card(100, 200, 840, 760, { fill: C.card, col: C.purple, p: k });
      pill("Qismlarga LIMIT: Qavs Xatosi va Subquery Yechimi", 520, 250, C.purple, k, 19);

      card(140, 310, 760, 160, { fill: '#fff5f5', col: C.red, p: k });
      text("(SELECT m FROM a LIMIT 1) UNION (SELECT ... LIMIT 1);", 170, 360, { size: 17, color: C.red, fam: MONO });
      text("Parse error: near '(': syntax error", 170, 415, { size: 18, weight: 700, color: '#dc2626', fam: MONO });

      card(140, 490, 760, 240, { fill: '#f0fdf4', col: C.green, p: k });
      text("SQLite dagi Yechim: FROM dagi Subquery!", 170, 540, { size: 20, weight: 700, color: C.green, fam: UI });
      text("SELECT * FROM (SELECT m FROM a ORDER BY m DESC LIMIT 1)", 170, 590, { size: 16, color: C.green, fam: MONO });
      text("UNION", 170, 625, { size: 16, color: C.blue, fam: MONO });
      text("SELECT * FROM (SELECT m FROM b ORDER BY m LIMIT 1)", 170, 660, { size: 16, color: C.green, fam: MONO });
      text("ORDER BY m;", 170, 695, { size: 16, color: C.orange, fam: MONO });

      pill("Natija: 1, 3 (2 rows)", 520, 820, C.green, k, 20);

      // Right: Type affinity
      card(1000, 200, 820, 760, { fill: C.card, col: C.blue, p: k });
      pill("SQLite Tiplar Aralashishi (Type Affinity)", 1410, 250, C.blue, k, 19);

      card(1040, 310, 740, 160, { fill: '#fff', col: C.blue, p: k });
      text("SELECT m FROM a UNION SELECT 'matn';", 1070, 360, { size: 18, color: C.blue, fam: MONO });
      text("Har qanday xatosiz ishlaydi!", 1070, 415, { size: 19, weight: 700, color: C.green, fam: UI });

      card(1040, 490, 740, 240, { fill: '#1e293b', col: '#334155', p: k });
      text("╭──────╮", 1070, 530, { size: 18, color: '#64748b', fam: MONO });
      text("│  m   │  <- Bitta ustunda har xil tiplar!", 1070, 560, { size: 18, weight: 700, color: '#93c5fd', fam: MONO });
      text("╞══════╡", 1070, 590, { size: 18, color: '#64748b', fam: MONO });
      text("│    1 │  (integer)\n│    2 │  (integer)\n│    3 │  (integer)\n│ matn │  (text)", 1070, 620, { size: 18, color: '#fff', fam: MONO });

      card(1040, 750, 740, 180, { fill: '#eff6ff', col: C.blue, p: k });
      text("SQLite dinamik tiplashga asoslangani sababli,", 1070, 795, { size: 18, color: C.ink, fam: UI });
      text("ustun umumiy tipga keltirilmaydi, har bir qator", 1070, 835, { size: 18, color: C.ink, fam: UI });
      text("o'zining asl tipida saqlanib qolaveradi.", 1070, 875, { size: 18, weight: 700, color: C.blue, fam: UI });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.mysql_xususiyatlari.s) sIntro(t);
    else if (t < TM.scenes.sqlite_all_yoqligi.s) sMysqlXususiyatlari(t);
    else if (t < TM.scenes.sqlite_ustuvorlik_yoqligi.s) sSqliteAllYoqligi(t);
    else if (t < TM.scenes.sqlite_tartib_va_tiplar.s) sSqliteUstuvorlikYoqligi(t);
    else sSqliteTartibVaTiplar(t);
  };
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
