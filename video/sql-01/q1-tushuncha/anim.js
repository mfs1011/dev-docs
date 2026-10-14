// SQL 1-bob, 1-video: Tushuncha va Standart — daftar uslubi, harakatlar so'zga bog'langan.
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, RH, HH, colCenter, rowCenter, kf, dbCylinder, keyIcon, sticky, check, cross, bg, tw, MONO, UI } = K;

  const TCOLS = [{ label: 'id', w: 100 }, { label: 'ism', w: 230 }, { label: 'kurs', w: 140, align: 'right' }];
  const TALABA = [[1, 'Ali', 1], [2, 'Vali', 2], [3, 'Dilnoza', 1]];
  const pill = (s, x, y, col, k = 1, size = 28) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 30;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand('1-bob', 960, 300, { size: 60, align: 'center', p: k, color: C.soft });
    hand('Relyatsion model', 960, 430, { size: 110, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand('va SQL standarti', 960, 560, { size: 76, align: 'center', p: P(t, 1.2, 1.2) });
    marker(640, 600, 640 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);
    dbCylinder(330, 470, 160, 180, P(t, W('L1', 'relyatsion'), 1.5));
    table(1430, 380, null, [{ label: 'id', w: 70 }, { label: 'ism', w: 150 }], [[1, 'Ali'], [2, 'Vali']], { p: P(t, W('L1', 'standarti'), 1.2) });
  }

  function sBaza(t) {
    heading('Ma’lumotlar bazasi', t, L('L2').s - 0.4);
    dbCylinder(330, 420, 220, 230, P(t, L('L2').s, 1.4));
    withA(P(t, W('L2', 'em-be-be-te'), 0.5), () => { hand('MBBT', 330, 640, { size: 56, align: 'center', color: C.blue }); hand('DBMS · Database Management System', 330, 700, { size: 28, align: 'center', color: C.soft }); });
    [['PostgreSQL', C.blue, 'postgres'], ['MySQL', C.orange, 'may'], ['SQLite', C.teal, 'es-kyu-layt']].forEach(([n, col, w], i) => {
      const k = P(t, W('L2', w), 0.5);
      pill(n, 330, 790 + i * 62, col, k, 26);
    });
    // relyatsion = jadval; ierarxik = papkalar
    const kR = P(t, W('L3', 'relyatsiya'), 0.8);
    table(720, 300, 'relyatsiya = jadval', [{ label: 'id', w: 70 }, { label: 'ism', w: 170 }], [[1, 'Ali'], [2, 'Vali'], [3, 'Dilnoza']], { p: kR });
    const kH = P(t, W('L3', 'papka'), 0.8);
    withA(kH, () => {
      hand('ierarxik baza', 1450, 260, { size: 40, color: C.purple, p: kH });
      const items = [['📁 hujjatlar', 0], ['📁 2026', 1], ['📄 hisobot.txt', 2], ['📁 rasmlar', 1]];
      items.forEach(([s, d], i) => { text(s, 1360 + d * 50, 330 + i * 56, { size: 30, weight: 600 }); if (d) sline(1345 + d * 50, 312 + i * 56, 1345 + d * 50, 330 + i * 56, { col: C.pencil, w: 2, seed: 900 + i, single: true }); });
    });
    // bitta katta ombor emas — alohida jadvallar, qoidalarni baza kuzatadi
    const kO = P(t, W('L4', 'omborga'), 0.6);
    withA(kO * (1 - P(t, W('L4', 'alohida'), 0.4)), () => { srect(720, 620, 560, 260, { col: C.pencil, w: 3, seed: 910 }); hand('bitta katta ombor?', 1000, 750, { size: 40, align: 'center', color: C.soft }); });
    cross(1000, 750, P(t, W('L4', 'emas'), 0.5) * (1 - P(t, W('L4', 'alohida'), 0.4)), 1.4);
    const kJ = P(t, W('L4', 'alohida'), 0.8);
    [[720, 640], [1000, 700], [1280, 640]].forEach(([x, y], i) => srect(x, y, 200, 140, { col: [C.blue, C.purple, C.green][i], w: 3, seed: 920 + i, p: P(kJ, i * 0.2, 0.5) }));
    arrow(920, 710, 1000, 760, { col: C.ink, w: 2.5, seed: 930, p: P(t, W('L4', 'qoidalarni'), 0.5) });
    arrow(1200, 760, 1280, 710, { col: C.ink, w: 2.5, seed: 931, p: P(t, W('L4', 'qoidalarni') + 0.2, 0.5) });
    withA(P(t, W('L4', 'bazaning'), 0.5), () => sticky(1180, 880, 420, 90, 'qoidalarni baza kuzatadi', '#c9f2cf', P(t, W('L4', 'bazaning'), 0.5), -0.02));
  }

  function sAtamalar(t) {
    heading('Asosiy atamalar', t, L('L5').s - 0.4);
    const x = 300, y = 330;
    const tRow = W('L5', 'qator'), tCol = W('L6', 'ustun'), tKey = W('L7', 'ay-di'), tNull = L('L8').s, tChk = L('L9').s, tKl = L('L10').s;
    const dimT = 1 - 0.6 * P(t, tKl, 0.6);
    table(x, y, 'talabalar', TCOLS, TALABA, {
      p: P(t, W('L5', 'talabalar'), 1.0), a: dimT,
      row: (i) => ({ hl: i === 0 ? P(t, tRow, 0.5) * (1 - P(t, tCol, 0.4)) : 0 }),
      col: (j) => ({ hl: j === 1 ? P(t, tCol, 0.5) * (1 - P(t, tKey, 0.4)) : j === 0 ? P(t, tKey, 0.5) * (1 - P(t, tNull, 0.4)) : 0, hlCol: j === 0 ? 'rgba(240,140,46,0.3)' : C.hl }),
    });
    const labOut = 1 - P(t, tKl, 0.5);
    const lab = (s, sub, yy, k, col) => withA(k * labOut, () => { hand(s, 900, yy, { size: 44, color: col, p: k }); text(sub, 902, yy + 46, { size: 26, color: C.soft }); });
    lab('qator · row', 'nazariyada: kortej (tuple)', 380, P(t, tRow, 0.6), C.ink);
    lab('ustun · column', 'nazariyada: atribut · tipi bor (text)', 500, P(t, tCol, 0.6), C.purple);
    withA(labOut, () => keyIcon(x - 110, rowCenter(y, 1), 1.3, P(t, W('L7', 'birlamchi'), 0.8)));
    lab('PRIMARY KEY', 'yagona · takrorlanmaydi · NULL emas', 620, P(t, W('L7', 'birlamchi'), 0.6), C.orange);
    // NULL ≠ 0 ≠ ''
    const kN = P(t, tNull, 0.6) * (1 - P(t, tKl, 0.5));
    withA(kN, () => {
      [['NULL', 'qiymat yo‘q', C.red], ['0', 'nol', C.ink], ["''", 'bo‘sh satr', C.ink]].forEach(([v, s, col], i) => {
        const cx = 960 + i * 270;
        card(cx, 720, 220, 140, { seed: 940 + i });
        text(v, cx + 110, 775, { size: 46, weight: 800, fam: MONO, color: col, align: 'center' });
        text(s, cx + 110, 830, { size: 24, color: C.soft, align: 'center' });
        if (i < 2) hand('≠', cx + 245, 790, { size: 56, align: 'center', color: C.red, p: P(t, W('L8', i ? 'bosh' : 'nol'), 0.4) });
      });
    });
    // cheklov va tashqi kalit
    const kC = P(t, tChk, 0.5) * (1 - P(t, tKl, 0.5));
    withA(kC, () => {
      text('ism text NOT NULL', colCenter(x, TCOLS, 1), y - 70, { size: 26, weight: 700, fam: MONO, color: C.red, align: 'center' });
      hand('cheklov', colCenter(x, TCOLS, 1), y - 110, { size: 34, align: 'center', color: C.red });
      const tk = P(t, W('L9', 'tashqi'), 0.6);
      table(300, 700, 'baholar', [{ label: 'talaba_id', w: 170 }, { label: 'baho', w: 110, align: 'right' }], [[1, 5], [3, 4]], { p: tk });
      arrow(300 - 14, rowCenter(700, 0), x - 20, rowCenter(y, 0), { col: C.blue, w: 3, bend: 60, seed: 950, p: P(t, W('L9', 'ishora'), 0.6) });
      withA(tk, () => hand('FOREIGN KEY', 610, 790, { size: 38, color: C.blue }));
    });
    // klaster > baza > jadval
    const kK = P(t, tKl, 0.8);
    if (kK > 0) {
      srect(860, 260, 960, 620, { col: C.purple, w: 3.5, seed: 960, p: kK });
      withA(kK, () => hand('klaster (bitta server)', 890, 300, { size: 38, color: C.purple }));
      srect(920, 360, 840, 480, { col: C.blue, w: 3, seed: 961, p: P(t, W('L10', 'baza'), 0.6) });
      withA(P(t, W('L10', 'baza'), 0.4), () => hand('baza: qollanma', 950, 400, { size: 34, color: C.blue }));
      srect(980, 450, 720, 340, { col: C.green, w: 3, seed: 962, p: P(t, W('L10', 'jadval'), 0.6) });
      withA(P(t, W('L10', 'jadval'), 0.4), () => { hand('jadval: talabalar', 1010, 490, { size: 32, color: C.green }); text('ustunlar: id | ism | kurs', 1010, 560, { size: 28, fam: MONO }); text("qatorlar: (1, 'Ali', 1), (2, 'Vali', 2), …", 1010, 620, { size: 24, fam: MONO, color: C.soft }); });
    }
  }

  function sTartib(t) {
    heading('Eng muhim qoida: qatorlarda tartib yo‘q', t, L('L11').s - 0.4);
    const x = 300, y = 340;
    const tShuf = W('L11', 'qatorlar'), tSet = W('L12', 'toplam');
    const order = (i) => kf(t, [[0, i], [tShuf + 0.3, [2, 0, 1][i]], [tShuf + 1.6, [1, 2, 0][i]], [tShuf + 2.9, i]], 0.8);
    table(x, y, 'talabalar', TCOLS, TALABA, { p: P(t, L('L11').s - 0.3, 0.8), a: 1 - 0.7 * P(t, tSet, 0.5), row: (i) => ({ slot: order(i) }) });
    // ustunlar qulflangan
    withA(P(t, W('L11', 'ustunlar'), 0.5), () => { pill('ustunlar tartibi — qat’iy', colCenter(x, TCOLS, 1), y - 60, C.green, 1, 26); });
    withA(P(t, tShuf, 0.5), () => hand('qatorlar tartibi — kafolatlanmaydi', 840, 560, { size: 44, color: C.red, p: P(t, tShuf, 1.2) }));
    // to'plam
    const kS = P(t, tSet, 0.8);
    withA(kS, () => {
      hand('{', 900, 300, { size: 220, color: C.purple });
      hand('}', 1690, 300, { size: 220, color: C.purple });
      [["(2, 'Vali', 2)", 1050, 250], ["(1, 'Ali', 1)", 1330, 330], ["(3, 'Dilnoza', 1)", 1080, 380]].forEach(([s, xx, yy], i) => text(s, xx + Math.sin(t * 1.3 + i) * 10, yy + Math.cos(t * 1.1 + i) * 8, { size: 32, weight: 600, fam: MONO }));
      hand('relyatsiya = to‘plam: tartib yo‘q', 900, 480, { size: 38, color: C.purple, p: kS });
    });
    withA(P(t, W('L12', 'aniq'), 0.5), () => sticky(820, 640, 720, 150, 'tartib kerak → ORDER BY', '#c9f2cf', P(t, W('L12', 'aniq'), 0.5), -0.02));
  }

  function sStandart(t) {
    heading('SQL standarti', t, L('L13').s - 0.4);
    const t13 = L('L13').s, t14 = L('L14').s, t16 = L('L16').s, t17 = L('L17').s;
    // nomi va ishlatish usullari
    withA(1 - P(t, t14, 0.5), () => {
      hand('SQL', 300, 330, { size: 130, color: C.blue, p: P(t, t13, 0.8) });
      hand('Structured Query Language', 300, 440, { size: 46, p: P(t, W('L13', 'strakchrd'), 1.0) });
      hand('tuzilmaviy so‘rovlar tili', 300, 500, { size: 40, color: C.soft, p: P(t, W('L13', 'tuzilmaviy'), 0.9) });
      [['to‘g‘ridan-to‘g‘ri', 'SELECT …', 'togridan-togri'], ['kod ichida', 'db.query("SELECT …")', 'kod'], ['ORM orqali', 'User.find(1)', 'o-er-em']].forEach(([h, code, w], i) => {
        const k = P(t, W('L13', w), 0.5);
        card(980, 250 + i * 190, 760, 150, { a: k, seed: 970 + i });
        withA(k, () => { hand(h, 1010, 300 + i * 190, { size: 38, color: [C.blue, C.purple, C.green][i] }); text(code, 1010, 355 + i * 190, { size: 28, fam: MONO, color: C.soft }); });
      });
    });
    // versiyalar chizig'i
    const kV = P(t, t14, 0.8) * (1 - P(t, t16, 0.5));
    withA(kV, () => {
      hand('ISO/IEC 9075 · Database Language SQL', 960, 270, { size: 48, align: 'center', p: P(t, W('L14', 'i-es-o'), 1.0) });
      sline(200, 520, 1720, 520, { col: C.ink, w: 4, seed: 980, p: P(t, t14 + 0.3, 1.2) });
      const vs = [['SQL-92', 'to‘qson', 'Entry · Intermediate · Full'], ['SQL:1999', 'bir', 'xususiyatlar ro‘yxati'], ['2003 … 2016', 'bir', 'tahrirlar'], ['SQL:2023', null, 'eng so‘nggi']];
      vs.forEach(([v, w, s], i) => {
        const xx = 300 + i * 440, k = w ? P(t, W('L14', w, w === 'bir' ? 0 : 0) + (i === 2 ? 1.2 : 0), 0.5) : P(t, L('L15').s, 0.5);
        withA(k, () => {
          ctx.fillStyle = i === 3 ? C.red : C.blue; ctx.beginPath(); ctx.arc(xx, 520, 14, 0, 7); ctx.fill();
          hand(v, xx, 460, { size: 42, align: 'center', color: i === 3 ? C.red : C.ink });
          text(s, xx, 580, { size: 24, color: C.soft, align: 'center' });
        });
      });
      withA(P(t, W('L15', 'almashtiradi'), 0.5), () => sticky(700, 680, 520, 110, 'yangisi oldingisini almashtiradi', '#ffe58a', P(t, W('L15', 'almashtiradi'), 0.5), 0.02));
    });
    // Core: 170 / 177
    const kC = P(t, t16, 0.6) * (1 - P(t, t17, 0.5));
    withA(kC, () => {
      hand('Core — majburiy xususiyatlar', 260, 330, { size: 50, color: C.orange, p: kC });
      const bw = 1300, fill = (170 / 177) * eio(P(t, W('L16', 'kamida'), 1.2));
      srect(260, 430, bw, 70, { col: C.ink, w: 3, seed: 990 });
      marker(266, 436, (bw - 12) * fill, 58, 'rgba(47,111,219,0.4)', 1);
      text('PostgreSQL 18:  ≥ 170 / 177  (SQL:2023 Core)', 280, 466, { size: 32, weight: 700, fam: MONO });
      withA(P(t, W('L16', 'hech'), 0.5), () => sticky(560, 600, 800, 130, 'hech bir MBBT Core’ga 100% mos emas', '#ffd9cf', P(t, W('L16', 'hech'), 0.5), -0.015));
    });
    // qismlar
    const kQ = P(t, t17, 0.6);
    withA(kQ, () => {
      const parts = [['9075-1', 'Framework'], ['9075-2', 'Foundation'], ['9075-3', 'CLI'], ['9075-4', 'PSM'], ['9075-9', 'MED'], ['9075-10', 'OLB'], ['9075-11', 'Schemata'], ['9075-13', 'JRT'], ['9075-14', 'XML'], ['9075-15', 'MDA'], ['9075-16', 'PGQ']];
      parts.forEach(([n, nm], i) => {
        const xx = 240 + (i % 4) * 380, yy = 290 + Math.floor(i / 4) * 150, k = P(t, t17 + 0.15 * i, 0.4), main = i === 1;
        card(xx, yy, 330, 110, { a: k, seed: 1000 + i, fill: main && t > W('L17', 'faundeyshn') ? '#fff3b0' : undefined });
        withA(k, () => { text(n, xx + 24, yy + 40, { size: 26, weight: 700, fam: MONO, color: main ? C.red : C.soft }); hand(nm, xx + 24, yy + 82, { size: 36, color: main ? C.red : C.ink }); });
      });
      withA(P(t, W('L17', 'faundeyshn'), 0.5), () => hand('← bu qo‘llanma: jadvallar, so‘rovlar, tiplar', 640, 770, { size: 40, color: C.red }));
    });
  }

  function sDialekt(t) {
    heading('Dialekt', t, L('L18').s - 0.4);
    const t19 = L('L19').s;
    withA(1 - 0.75 * P(t, t19, 0.5), () => {
      card(760, 330, 400, 230, { seed: 1100 });
      hand('Standart', 960, 410, { size: 50, align: 'center', color: C.blue });
      text('ISO/IEC 9075', 960, 480, { size: 28, fam: MONO, color: C.soft, align: 'center' });
      [['PostgreSQL', C.blue, 330, 330], ['MySQL', C.orange, 330, 640], ['SQLite', C.teal, 1590, 480]].forEach(([n, col, x, y], i) => {
        const k = P(t, W('L18', 'ikkita') + i * 0.3, 0.5);
        withA(k, () => { card(x - 170, y - 70, 340, 140, { seed: 1110 + i }); hand(n, x, y, { size: 44, align: 'center', color: col }); });
        arrow(x < 900 ? x + 175 : x - 175, y, x < 900 ? 750 : 1170, 445, { col, w: 3, seed: 1120 + i, p: P(t, W('L18', 'farq'), 0.6), bend: 30 });
        withA(P(t, W('L18', 'farq'), 0.5), () => hand('≠', x < 900 ? x + 260 : x - 260, y - 40, { size: 60, align: 'center', color: C.red }));
      });
    });
    const two = [['Kengaytma', 'standartda yo‘q, tizim qo‘shgan', '+', C.green, 'kengaytma'], ['Farq', 'standartdagi narsa boshqacha ishlaydi', '≠', C.red, 'farq']];
    two.forEach(([h, s, sym, col, w], i) => {
      const k = P(t, W('L19', w), 0.6);
      card(200 + i * 780, 640, 720, 220, { a: k, seed: 1130 + i });
      withA(k, () => { hand(sym, 270 + i * 780, 740, { size: 100, align: 'center', color: col }); hand(h, 360 + i * 780, 710, { size: 50, color: col }); text(s, 360 + i * 780, 780, { size: 28, color: C.soft }); });
    });
  }

  function sTizimlar(t) {
    heading('Uch tizim qisqacha', t, L('L20').s - 0.4);
    const sys = [
      ['PostgreSQL', C.blue, 'postgres', ['obyekt-relyatsion MBBT', 'standartning so‘nggi', 'versiyasiga intiladi']],
      ['MySQL', C.orange, 'may', ['relyatsion baza', 'tezlik va ishonchlilik —', 'kengaytmalar ko‘p']],
      ['SQLite', C.teal, 'es-kyu-layt', ['serversiz, ilova ichida', 'kutubxona sifatida', 'farqlari: Quirks sahifasi']],
    ];
    sys.forEach(([n, col, w, rows], i) => {
      const lid = i < 2 ? 'L20' : 'L21', k = P(t, W(lid, w), 0.6), x = 170 + i * 560;
      card(x, 260, 480, 580, { a: k, seed: 1200 + i });
      withA(k, () => {
        hand(n, x + 240, 330, { size: 52, align: 'center', color: col });
        rows.forEach((r, j) => text(r, x + 240, 450 + j * 70, { size: 30, align: 'center', color: j ? C.soft : C.ink, weight: j ? 500 : 700 }));
      });
    });
    if (P(t, W('L21', 'kutubxona'), 0.5) > 0) withA(P(t, W('L21', 'kutubxona'), 0.5), () => K.fileIcon(1480, 630, 'ilova.db', P(t, W('L21', 'kutubxona'), 0.8)));
  }

  function sXulosa(t) {
    heading('Har bobda — ikki savol', t, L('L22').s - 0.4);
    [['Standart nima deydi?', C.blue, 'standart'], ['Har tizim aslida nima qiladi?', C.orange, 'tizim']].forEach(([s, col, w], i) => {
      sticky(260 + i * 720, 330, 640, 220, s, i ? '#ffe58a' : '#bfe3ff', P(t, W('L22', w), 0.6), i ? 0.02 : -0.02);
    });
    withA(P(t, W('L22', 'keyingi'), 0.6), () => { hand('Keyingi video: terminalda →', 960, 700, { size: 56, align: 'center', color: C.green, p: P(t, W('L22', 'keyingi'), 1.0) }); });
  }

  const SCENES = { intro: sIntro, baza: sBaza, atamalar: sAtamalar, tartib: sTartib, standart: sStandart, dialekt: sDialekt, tizimlar: sTizimlar, xulosa: sXulosa };
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    bg();
    for (const [name, fn] of Object.entries(SCENES)) {
      const sc = TM.scenes[name];
      if (t >= sc.s && t < sc.e) withA(Math.min(name === 'intro' ? 1 : P(t, sc.s, 0.5), 1 - P(t, sc.e - 0.5, 0.5)), () => fn(t));
    }
    const fin = Math.max(1 - P(t, 0, 0.8), P(t, TM.end - 1.4, 1.3));
    if (fin > 0) { ctx.globalAlpha = fin; ctx.fillStyle = C.paper; ctx.fillRect(0, 0, 1920, 1080); ctx.globalAlpha = 1; }
  }
  window.render = render;
  window.DURATION = TM.end;
  window.renderPoster = () => { render(0.001); ctx.globalAlpha = 1; bg(); hand('1-bob', 330, 330, { size: 56, color: C.soft }); hand('Relyatsion model', 330, 450, { size: 96, color: C.blue }); hand('va SQL standarti', 330, 560, { size: 66 }); table(1270, 640, 'talabalar', TCOLS, TALABA, {}); };
  if (location.hash === '#play') { const t0 = performance.now(); const loop = () => { render(((performance.now() - t0) / 1000) % TM.end); requestAnimationFrame(loop); }; document.fonts.ready.then(loop); } else render(0);
})();
