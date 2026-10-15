// SQL 2-bob, 3-video: Dialektlar, Taqqoslash va Tipik xatolar — daftar uslubi.
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, RH, HH, colCenter, rowCenter, kf, dbCylinder, keyIcon, sticky, check, cross, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 28) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 30;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  function sIntro(t) {
    hand('2-bob · Xulosalar', 960, 310, { size: 66, align: 'center', p: P(t, 0.3, 0.9), color: C.soft });
    hand('Taqqoslash, reliz siyosati va tipik xatolar', 960, 430, { size: 76, align: 'center', p: P(t, 0.7, 1.3), color: C.blue });
    marker(450, 470, 1020 * eio(P(t, 1.8, 0.7)), 18, C.hl, 1);
    [['PostgreSQL', C.blue], ['MySQL', C.orange], ['SQLite', C.teal]].forEach(([n, col], i) => {
      pill(n, 620 + i * 340, 620, col, P(t, W('L1', 'asosiy') + i * 0.4, 0.6), 32);
    });
  }

  function sTaqqoslah(t) {
    heading('Uch tizim taqqoslash jadvali', t, L('L2').s - 0.4);
    const x = 160, y = 240;
    const cols = [
      { label: 'Mezon', w: 340 },
      { label: 'PostgreSQL', w: 420 },
      { label: 'MySQL', w: 420 },
      { label: 'SQLite', w: 420 }
    ];
    const rows = [
      ['Arxitektura', 'Client / Server', 'Client / Server', 'Embedded (kutubxona)'],
      ['Server dasturi', 'postgres', 'mysqld', 'Yo‘q (in-process)'],
      ['Ulanish resursi', 'Alohida jarayon', 'Bitta jarayonda thread', 'Funksiya chaqiruvi'],
      ['Diskdagi ko‘rinishi', 'Ma’lumot papkasi', 'Ma’lumot papkasi', 'Bitta fayl (dokon.db)'],
      ['Bir vaqtda yozish', 'Ko‘p yozuvchi', 'Ko‘p yozuvchi', 'Bir paytda 1 ta yozuvchi'],
      ['Reliz siyosati', 'Yiliga 1 ta (5 yil)', 'LTS (5+3 yil) & Innov.', '2050-yilgacha barqaror']
    ];

    const tRows = [
      W('L2', 'arxitektura'),
      W('L3', 'server'),
      W('L4', 'ulanishga'),
      W('L5', 'diskdagi'),
      W('L6', 'bir'),
      L('L6').e
    ];

    table(x, y, null, cols, rows, {
      p: P(t, L('L2').s, 0.8),
      row: (i) => ({
        hl: i < 5 && t >= tRows[i] && t < (tRows[i + 1] ?? 1e9) ? 0.35 : 0,
        hlCol: C.hl
      })
    });
  }

  function sVersiyalar(t) {
    heading('Reliz siyosati va qo‘llab-quvvatlash', t, L('L7').s - 0.4);
    const x = 200, y = 270;

    // PostgreSQL
    const kPG = P(t, L('L8').s, 0.8);
    withA(kPG, () => {
      card(x, y, 480, 580, { seed: 101, fill: '#f6f9fe' });
      pill('PostgreSQL', x + 240, y + 60, C.blue, 1, 32);
      hand('5 yillik tsikl', x + 240, y + 140, { size: 36, align: 'center', color: C.blue });
      text('• Yiliga bitta asosiy reliz (18)', x + 40, y + 215, { size: 22, fam: UI, wrap: 400 });
      text('• Har reliz 5 yil qo‘llab-quvvatlanadi', x + 40, y + 265, { size: 22, fam: UI, wrap: 400 });
      text('• Kichik relizlar har 3 oyda (18.6)', x + 40, y + 315, { size: 22, fam: UI, color: C.soft, wrap: 400 });
      text('• Kichik relizda dump/restore shart emas', x + 40, y + 365, { size: 20, fam: UI, color: C.pencil, wrap: 400 });
      sticky(x + 40, y + 460, 400, 70, 'Barqaror 5 yillik hayot davri', '#dceefb', 1);
    });

    // MySQL
    const kMY = P(t, L('L9').s, 0.8);
    withA(kMY, () => {
      card(x + 520, y, 480, 580, { seed: 102, fill: '#fffbf5' });
      pill('MySQL', x + 760, y + 60, C.orange, 1, 32);
      hand('LTS va Innovation', x + 760, y + 140, { size: 36, align: 'center', color: C.orange });
      text('• LTS: 5 yil asosiy + 3 yil kengaytma', x + 560, y + 215, { size: 22, weight: 700, fam: UI, color: C.green, wrap: 400 });
      text('  (jami 8 yil uzoq qo‘llab-quvvatlash)', x + 560, y + 260, { size: 20, fam: UI, color: C.soft, wrap: 400 });
      text('• Innovation: yangi funksiyalar', x + 560, y + 315, { size: 22, fam: UI, color: C.blue, wrap: 400 });
      text('  (keyingi Innovationgacha)', x + 560, y + 360, { size: 20, fam: UI, color: C.soft, wrap: 400 });
      sticky(x + 560, y + 460, 400, 70, 'LTS — ishlab chiqarish uchun', '#feefd0', 1);
    });

    // SQLite
    const kSL = P(t, L('L10').s, 0.8);
    withA(kSL, () => {
      card(x + 1040, y, 480, 580, { seed: 103, fill: '#f2faf8' });
      pill('SQLite', x + 1280, y + 60, C.teal, 1, 32);
      hand('2050-yilgacha reja!', x + 1280, y + 140, { size: 36, align: 'center', color: C.teal });
      text('• Rasmiy reja: 2050-yilgacha!', x + 1080, y + 215, { size: 22, weight: 700, fam: UI, color: C.teal, wrap: 400 });
      text('• Fayl formati hech qachon buzilmaydi', x + 1080, y + 265, { size: 22, fam: UI, wrap: 400 });
      text('• Bugun yozilgan fayl 20 yil keyin ham o‘zgarishsiz o‘qiladi', x + 1080, y + 320, { size: 21, fam: UI, color: C.soft, wrap: 400 });
      sticky(x + 1080, y + 460, 400, 70, 'Ultra-barqaror fayl arxivi', '#cbf3eb', 1);
    });
  }

  function sXatolar(t) {
    heading('Tipik xatolar (amaliy ogohlantirishlar)', t, L('L11').s - 0.4);
    const x = 160, y = 230;
    const errors = [
      ['1. SQLite’ni “o‘yinchoq” deb bilish', 'Hujjat: kam va o‘rta trafikli saytlarda (<100k) va qurilmalarda a’lo yechim', W('L11', 'es-kyu-laytni')],
      ['2. SQLite faylini tarmoq papkasiga (NFS) qo‘yish', 'Tarmoq qulflash xatolari tufayli baza buzilishi xavfi bor!', W('L12', 'tarmoq')],
      ['3. PostgreSQL ulanishini “arzon” deb bilish', 'Har ulanish alohida OS jarayoni. Connection pool ishlatish shart (64-bob)', W('L13', 'postgres')],
      ['4. MySQL’da jadval storage engine’iga qaramaslik', 'Tranzaksiyalarni (ACID, rollback) faqat InnoDB to‘liq qo‘llaydi!', W('L14', 'may')],
      ['5. Ishlab turgan SQLite bazasidan cp bilan nusxa olish', 'Yozish paytidagi nusxa buziladi. SQLite backup API yoki VACUUM INTO kerak', W('L15', 'ishlab')]
    ];

    errors.forEach(([title, desc, tAt], i) => {
      const ke = P(t, tAt, 0.6);
      withA(ke, () => {
        card(x, y + i * 130, 1600, 110, { seed: 201 + i });
        cross(x + 40, y + 55 + i * 130, 1, 0.8);
        text(title, x + 80, y + 38 + i * 130, { size: 28, weight: 700, color: C.red });
        text('→ ' + desc, x + 80, y + 78 + i * 130, { size: 22, weight: 600, fam: MONO, color: C.ink });
      });
    });
  }

  function sXulosa(t) {
    heading('Xulosa', t, L('L16').s - 0.4);
    const x = 300, y = 320;
    card(x, y, 1320, 360, { seed: 301, fill: '#fffef9' });
    hand('To‘g‘ri arxitektura tanlash — muvaffaqiyat garovi', 960, y + 70, { size: 44, align: 'center', color: C.blue });
    text('Har bir tizim o‘z o‘rnida kuchli: PostgreSQL (veb/korxona), MySQL (ekotizim), SQLite (lokal/oddiy).', 960, y + 160, { size: 26, weight: 600, fam: UI, align: 'center' });
    text('Keyingi 3-bobda: O‘rnatish va ulanish (PostgreSQL, MySQL va SQLite)', 960, y + 230, { size: 28, weight: 700, fam: MONO, color: C.green, align: 'center' });
    hand('E’tiboringiz uchun rahmat!', 960, y + 300, { size: 36, align: 'center', color: C.pencil });
  }

  window.render = function (t) {
    ctx.clearRect(0, 0, 1920, 1080);
    bg();
    const sc = TM.scenes;
    if (t < sc.taqqoslash.s) sIntro(t);
    else if (t < sc.versiyalar.s) sTaqqoslah(t);
    else if (t < sc.xatolar.s) sVersiyalar(t);
    else if (t < sc.xulosa.s) sXatolar(t);
    else sXulosa(t);
  };

  window.renderPoster = () => {
    ctx.globalAlpha = 1; bg();
    hand('2-bob · Xulosalar', 330, 310, { size: 56, color: C.soft });
    hand('Taqqoslash, reliz siyosati va tipik xatolar', 330, 430, { size: 76, color: C.blue });
    hand('8 ta mezon · 3 ta reliz siyosati · 5 ta tipik xato', 330, 540, { size: 54 });
    [['PostgreSQL (5 yil)', C.blue], ['MySQL LTS (8 yil)', C.orange], ['SQLite (2050)', C.teal]].forEach(([n, col], i) => {
      pill(n, 330 + i * 360, 680, col, 1, 30);
    });
  };
  window.DURATION = TM.end;
})();
