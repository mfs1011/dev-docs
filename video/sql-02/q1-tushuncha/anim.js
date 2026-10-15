// SQL 2-bob, 1-video: Tushuncha va Nega shunday — daftar uslubi, harakatlar so'zga bog'langan.
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, RH, HH, colCenter, rowCenter, kf, dbCylinder, keyIcon, sticky, check, cross, bg, tw, MONO, UI, laptop, serverBox } = K;

  const pill = (s, x, y, col, k = 1, size = 28) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 30;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  function sIntro(t) {
    hand('2-bob', 960, 290, { size: 60, align: 'center', p: P(t, 0.3, 0.9), color: C.soft });
    hand('PostgreSQL, MySQL va SQLite', 960, 410, { size: 90, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand('Arxitektura va tanlov mezonlari', 960, 530, { size: 68, align: 'center', p: P(t, 1.1, 1.1) });
    marker(540, 560, 840 * eio(P(t, 1.8, 0.7)), 18, C.hl, 1);
    // uchta pill
    [['PostgreSQL', C.blue, 'postgres'], ['MySQL', C.orange, 'may'], ['SQLite', C.teal, 'es-kyu-layt']].forEach(([n, col, w], i) => {
      pill(n, 620 + i * 340, 680, col, P(t, W('L1', w), 0.6), 32);
    });
  }

  function sArxitektura(t) {
    heading('Ikki xil arxitektura', t, L('L2').s - 0.4);
    // chapda: Client / Server
    const kCS = P(t, W('L2', 'mijoz'), 0.8);
    withA(kCS, () => {
      card(140, 240, 780, 650, { seed: 101 });
      hand('Client / Server', 530, 300, { size: 48, align: 'center', color: C.blue });
      text('PostgreSQL · MySQL', 530, 350, { size: 28, weight: 600, fam: MONO, color: C.soft, align: 'center' });
      // server
      serverBox(530, 480, P(t, W('L3', 'server'), 0.8), C.blue);
      hand('Server dasturi', 530, 570, { size: 32, align: 'center', color: C.blue });
      text('doim ishlab turadi (TCP/IP)', 530, 610, { size: 24, color: C.soft, align: 'center' });
      // mijozlar
      const kCl = P(t, W('L3', 'mijoz'), 0.8);
      laptop(310, 750, 1.1, kCl);
      laptop(750, 750, 1.1, kCl);
      hand('Mijoz ilovalar', 530, 830, { size: 30, align: 'center', color: C.ink });
      arrow(330, 700, 450, 550, { col: C.blue, w: 2.5, bend: -20, p: P(t, W('L3', 'tarmoq'), 0.6) });
      arrow(730, 700, 610, 550, { col: C.blue, w: 2.5, bend: 20, p: P(t, W('L3', 'tarmoq'), 0.6) });
    });

    // o'ngda: Embedded (O'rnatiladigan)
    const kEmb = P(t, W('L2', 'embeddid'), 0.8);
    withA(kEmb, () => {
      card(1000, 240, 780, 650, { seed: 102 });
      hand('O‘rnatiladigan (Embedded)', 1390, 300, { size: 48, align: 'center', color: C.teal });
      text('SQLite', 1390, 350, { size: 28, weight: 600, fam: MONO, color: C.soft, align: 'center' });
      // ilova ichida
      srect(1060, 420, 660, 280, { col: C.teal, w: 3, seed: 103, p: P(t, W('L4', 'ilovaning'), 0.8) });
      hand('Ilova jarayoni', 1090, 460, { size: 34, color: C.teal });
      text('Masalan: mobil ilova, Python, CLI', 1090, 500, { size: 24, color: C.soft });
      // SQLite kutubxonasi
      card(1100, 540, 580, 120, { seed: 104, a: P(t, W('L4', 'kutubxona'), 0.6) });
      text('SQLite kutubxonasi (in-process)', 1390, 580, { size: 28, weight: 700, fam: MONO, color: C.ink, align: 'center' });
      text('alohida server jarayoni yo‘q', 1390, 620, { size: 24, color: C.soft, align: 'center' });
      // diskdagi fayl
      const kF = P(t, W('L4', 'kutubxona') + 0.5, 0.6);
      arrow(1390, 710, 1390, 770, { col: C.teal, w: 3, p: kF });
      withA(kF, () => {
        card(1220, 780, 340, 80, { seed: 105 });
        text('📁 dokon.db (bitta fayl)', 1390, 820, { size: 26, weight: 700, fam: MONO, color: C.teal, align: 'center' });
      });
    });
  }

  function sPostgres(t) {
    heading('PostgreSQL: har ulanishga jarayon', t, L('L5').s - 0.4);
    const x = 200, y = 260;
    // bosh postgres jarayoni
    card(x, y, 480, 320, { seed: 201, a: P(t, L('L5').s, 0.6) });
    hand('Bosh postgres jarayoni', x + 240, y + 50, { size: 36, align: 'center', color: C.blue });
    text('PID: 44311 · port 5432', x + 240, y + 100, { size: 26, fam: MONO, align: 'center', color: C.soft });
    serverBox(x + 240, y + 210, P(t, L('L5').s, 0.8), C.blue);
    withA(P(t, W('L5', 'kutadi'), 0.6), () => sticky(x + 50, y + 280, 380, 60, 'yangi ulanishlarni kutadi', '#e3f2fd', 1));

    // mijoz 1 va jarayon 1
    const kM1 = P(t, W('L6', 'mijoz'), 0.8);
    withA(kM1, () => {
      arrow(x + 490, y + 80, x + 720, y + 40, { col: C.purple, w: 3, bend: -20, p: kM1 });
      hand('fork()', x + 610, y + 30, { size: 28, color: C.purple });
      card(x + 720, y, 680, 170, { seed: 202 });
      hand('Jarayon 1 (PID 57937)', x + 750, y + 40, { size: 32, color: C.green });
      text('postgres: postgres qollanma [local] SELECT', x + 750, y + 85, { size: 22, fam: MONO });
      text('Mijoz: psql (Ali)', x + 750, y + 125, { size: 24, color: C.soft });
    });

    // mijoz 2 va jarayon 2
    const kM2 = P(t, W('L6', 'ochiladi'), 0.8);
    withA(kM2, () => {
      arrow(x + 490, y + 170, x + 720, y + 230, { col: C.purple, w: 3, bend: 20, p: kM2 });
      card(x + 720, y + 200, 680, 170, { seed: 203 });
      hand('Jarayon 2 (PID 57938)', x + 750, y + 240, { size: 32, color: C.green });
      text('postgres: postgres qollanma [local] SELECT', x + 750, y + 285, { size: 22, fam: MONO });
      text('Mijoz: Veb-server (Malika)', x + 750, y + 325, { size: 24, color: C.soft });
    });

    // tarmoq va fayllar ogohlantirishi
    const kNote = P(t, L('L7').s, 0.8);
    withA(kNote, () => {
      card(x, y + 420, 1400, 180, { seed: 204 });
      hand('Mijoz va server boshqa kompyuterda bo‘lishi mumkin', x + 40, y + 470, { size: 36, color: C.red });
      text('Mijoz kompyuteridagi fayl (/home/ali/data.csv) serverda mavjud emas!', x + 40, y + 525, { size: 28, fam: MONO });
      text('Bu ayniqsa COPY va \copy buyruqlarida muhim (21-bob).', x + 40, y + 565, { size: 24, color: C.soft });
    });
  }

  function sMysql(t) {
    heading('MySQL: bitta jarayon, ko‘p thread', t, L('L8').s - 0.4);
    const x = 180, y = 260;
    // mysqld bitta jarayon
    srect(x, y, 1560, 640, { col: C.orange, w: 3.5, seed: 301, p: P(t, L('L8').s, 0.8) });
    hand('mysqld — bitta ko‘p oqimli jarayon (PID 44433)', x + 40, y + 45, { size: 38, color: C.orange });

    // yuqori qism: threadlar
    const kT = P(t, W('L9', 'tredlar'), 0.8);
    withA(kT, () => {
      card(x + 40, y + 80, 1480, 240, { seed: 302 });
      hand('Ulanish menejeri va Threadlar (one_connection)', x + 70, y + 120, { size: 34, color: C.ink });
      [['Thread 1 (ID 21)', 'Mijoz 1 so‘rovi: SELECT SLEEP(5)', C.green], ['Thread 2 (ID 22)', 'Mijoz 2 so‘rovi: SELECT SLEEP(5)', C.green], ['Thread 3 (ID 23)', 'Mijoz 3: PROCESSLIST', C.blue]].forEach(([th, q, col], i) => {
        card(x + 70 + i * 480, y + 160, 450, 130, { seed: 303 + i });
        text(th, x + 90 + i * 480, y + 195, { size: 26, weight: 700, fam: MONO, color: col });
        text(q, x + 90 + i * 480, y + 245, { size: 20, fam: MONO, color: C.soft });
      });
    });

    // pastki qism: Storage engine'lar
    const kEng = P(t, W('L10', 'storidj'), 0.8);
    withA(kEng, () => {
      card(x + 40, y + 350, 1480, 310, { seed: 306 });
      hand('Almashtiriladigan Storage Engine’lar', x + 70, y + 395, { size: 36, color: C.blue });
      text('Server SQL tahlilini qiladi, diskka yozishni esa tanlangan engine bajaradi', x + 70, y + 435, { size: 24, color: C.soft });

      // InnoDB (asosiy)
      const kInno = P(t, W('L11', 'inno-di-bi'), 0.6);
      withA(kInno, () => {
        card(x + 70, y + 470, 680, 160, { seed: 307, fill: '#f1f8f3' });
        hand('InnoDB (DEFAULT)', x + 90, y + 510, { size: 34, color: C.green });
        check(x + 690, y + 510, 1);
        text('✓ Tranzaksiyalar (ACID: commit, rollback)', x + 90, y + 555, { size: 23, weight: 600, fam: MONO });
        text('✓ Qator darajasidagi qulflar · Tashqi kalitlar', x + 90, y + 595, { size: 23, fam: MONO, color: C.soft });
      });

      // Boshqalar: MyISAM, MEMORY
      withA(kEng, () => {
        card(x + 780, y + 470, 700, 160, { seed: 308 });
        hand('Boshqa maxsus engine’lar', x + 810, y + 510, { size: 32, color: C.pencil });
        text('• MyISAM: tranzaksiyasiz, jadval darajasida qulf', x + 810, y + 555, { size: 22, fam: MONO });
        text('• MEMORY: ma’lumot faqat RAM’da (tezkor)', x + 810, y + 595, { size: 22, fam: MONO });
      });
    });
  }

  function sSqlite(t) {
    heading('SQLite: kutubxona va bitta fayl', t, L('L12').s - 0.4);
    const x = 200, y = 260;
    // ilova jarayoni
    card(x, y, 760, 620, { seed: 401, a: P(t, L('L12').s, 0.8) });
    hand('Ilova jarayoni (ilova ichida)', x + 40, y + 50, { size: 36, color: C.teal });
    text('Serversiz · mustaqil · 0 ta sozlash', x + 40, y + 95, { size: 24, color: C.soft });

    // kutubxona bloklari
    const blks = ['Tokenizer & Parser', 'Kod generatori (bytecode)', 'Virtual mashina (VDBE)', 'B-Tree & Pager'];
    blks.forEach((b, i) => {
      const kb = P(t, L('L12').s + 0.3 + i * 0.2, 0.4);
      withA(kb, () => {
        card(x + 60, y + 140 + i * 90, 640, 70, { seed: 410 + i });
        text(b, x + 380, y + 175 + i * 90, { size: 26, weight: 600, fam: MONO, align: 'center', color: C.ink });
      });
    });

    // o'ngda: bitta fayl va fopen()
    const x2 = 1040;
    const kF = P(t, L('L13').s, 0.8);
    withA(kF, () => {
      card(x2, y, 680, 280, { seed: 402 });
      hand('Butun baza — bitta fayl', x2 + 40, y + 50, { size: 36, color: C.teal });
      text('📁 dokon.db', x2 + 40, y + 105, { size: 32, weight: 700, fam: MONO, color: C.blue });
      text('Jadvallar, indekslar, triggerlar bitta faylda.', x2 + 40, y + 155, { size: 24, color: C.soft });
      text('Platformadan mustaqil (32/64-bit ko‘chirish oson).', x2 + 40, y + 195, { size: 24, color: C.soft });
      const kWarn = P(t, W('L14', 'bitta'), 0.6);
      withA(kWarn, () => sticky(x2 + 40, y + 235, 600, 50, 'Bir vaqtda faqat 1 ta yozuvchi!', '#ffebee', 1));
    });

    // fopen() taqqoslash
    const kFopen = P(t, L('L15').s, 0.8);
    withA(kFopen, () => {
      card(x2, y + 360, 680, 260, { seed: 403, fill: '#fffdf0' });
      hand('SQLite’ni tushunish', x2 + 40, y + 410, { size: 36, color: C.orange });
      text('“SQLite’ni Oracle o‘rnini bosuvchi emas,', x2 + 40, y + 470, { size: 26, weight: 600 });
      text('fopen() o‘rnini bosuvchi deb tushuning.”', x2 + 40, y + 515, { size: 26, weight: 700, color: C.red });
      text('— SQLite rasmiy hujjati', x2 + 40, y + 575, { size: 22, color: C.pencil });
    });
  }

  function sTanlov(t) {
    heading('Qaysi biri qachon? (SQLite checklist)', t, L('L16').s - 0.4);
    const x = 240, y = 260;
    const questions = [
      ['1. Ma’lumot ilovadan tarmoq orqali ajratilganmi?', W('L17', 'birinchi'), 'Client/Server tanlang (PostgreSQL / MySQL)'],
      ['2. Ko‘p yozuvchi bir vaqtda yozishi kerakmi?', W('L18', 'ikkinchi'), 'Client/Server tanlang (PostgreSQL / MySQL)'],
      ['3. Ma’lumot bitta faylga sig‘maydimi? (>281 TB)', W('L19', 'uchinchi'), 'Client/Server tanlang (PostgreSQL / MySQL)'],
    ];

    questions.forEach(([q, tAt, ans], i) => {
      const kq = P(t, tAt, 0.6);
      withA(kq, () => {
        card(x, y + i * 140, 1440, 115, { seed: 501 + i });
        text(q, x + 40, y + 40 + i * 140, { size: 30, weight: 700 });
        text('Javob “HA” bo‘lsa → ', x + 40, y + 80 + i * 140, { size: 24, color: C.soft });
        text(ans, x + 240, y + 80 + i * 140, { size: 24, weight: 700, fam: MONO, color: C.blue });
      });
    });

    // Yo'q bo'lsa -> SQLite!
    const kSq = P(t, L('L20').s, 0.8);
    withA(kSq, () => {
      card(x, y + 450, 1440, 210, { seed: 505, fill: '#e8f8f5' });
      hand('Qolgan barcha holatlarda → SQLite tanlang!', x + 40, y + 500, { size: 40, color: C.teal });
      text('✓ Qurilmalar va mobil ilovalar (telefon, televizor, avtomobil)', x + 40, y + 550, { size: 26, fam: UI });
      text('✓ Kam va o‘rta trafikli saytlar (< 100k so‘rov/kun)', x + 40, y + 590, { size: 26, fam: UI });
      text('✓ Ma’lumot tahlili, lokal kesh, desktop ilovalar', x + 40, y + 630, { size: 26, fam: UI });
    });
  }

  function sXulosa(t) {
    heading('Xulosa', t, L('L21').s - 0.4);
    const x = 200, y = 300;
    const cards = [
      ['PostgreSQL', 'Mijoz-Server', 'Har ulanishga alohida jarayon · Kuchli standart · Veb uchun asosiy', C.blue],
      ['MySQL', 'Mijoz-Server', 'Bitta jarayonda threadlar · InnoDB engine · Keng tarqalgan', C.orange],
      ['SQLite', 'O‘rnatiladigan', 'Kutubxona · Bitta fayl · Oddiy va tejamkor · 0 ta server', C.teal],
    ];
    cards.forEach(([name, type, desc, col], i) => {
      const k = P(t, L('L21').s + i * 0.4, 0.6);
      withA(k, () => {
        card(x + i * 520, y, 480, 420, { seed: 601 + i });
        pill(name, x + 240 + i * 520, y + 60, col, 1, 32);
        hand(type, x + 240 + i * 520, y + 140, { size: 34, align: 'center', color: col });
        text(desc.split(' · ')[0], x + 240 + i * 520, y + 210, { size: 24, fam: MONO, align: 'center' });
        text(desc.split(' · ')[1], x + 240 + i * 520, y + 260, { size: 24, fam: MONO, align: 'center', color: C.soft });
        text(desc.split(' · ')[2], x + 240 + i * 520, y + 310, { size: 24, fam: MONO, align: 'center', color: C.pencil });
      });
    });
  }

  window.render = function (t) {
    ctx.clearRect(0, 0, 1920, 1080);
    bg();
    const sc = TM.scenes;
    if (t < sc.arxitektura.s) sIntro(t);
    else if (t < sc.postgres.s) sArxitektura(t);
    else if (t < sc.mysql.s) sPostgres(t);
    else if (t < sc.sqlite.s) sMysql(t);
    else if (t < sc.tanlov.s) sSqlite(t);
    else if (t < sc.xulosa.s) sTanlov(t);
    else sXulosa(t);
  };

  window.renderPoster = () => {
    ctx.globalAlpha = 1; bg();
    hand('2-bob', 330, 310, { size: 56, color: C.soft });
    hand('PostgreSQL, MySQL va SQLite', 330, 430, { size: 84, color: C.blue });
    hand('Arxitektura va tanlov mezonlari', 330, 540, { size: 62 });
    [['PostgreSQL', C.blue], ['MySQL', C.orange], ['SQLite', C.teal]].forEach(([n, col], i) => {
      pill(n, 330 + i * 280, 680, col, 1, 30);
    });
  };
  window.DURATION = TM.end;
})();
