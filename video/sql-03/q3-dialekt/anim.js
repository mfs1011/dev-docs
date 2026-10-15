// SQL 3-bob 3-qism: Dialektlar va Tipik Xatolar
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, dbCylinder, serverBox, laptop, fileIcon, check, cross, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 26) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("3-bob", 960, 260, { size: 60, align: 'center', p: k, color: C.soft });
    hand("Dialektlar va Tipik Xatolar", 960, 390, { size: 90, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("6 ta eng xavfli ulanish xatosi", 960, 510, { size: 64, align: 'center', p: P(t, 1.2, 1.2), color: C.red });
    marker(560, 550, 800 * eio(P(t, 2.0, 0.7)), 20, C.hlRed, 1);

    const kBadges = P(t, W('L1', 'postgres'), 0.8);
    withA(kBadges, () => {
      pill("PostgreSQL 18.6", 600, 680, C.blue, kBadges, 26);
      pill("MySQL 9.7.2", 960, 680, C.orange, kBadges, 26);
      pill("SQLite 3.54.0", 1320, 680, C.teal, kBadges, 26);
    });

    const kDesc = P(t, W('L1', 'oltita'), 0.8);
    withA(kDesc, () => {
      card(420, 780, 1080, 160, { fill: C.card, col: C.red, p: kDesc });
      text("Tizimlararo ulanish sintaksisi, parollar va bayroqlar farqi", 960, 830, { size: 30, weight: 700, align: 'center', color: C.ink });
      text("Amaliyotda eng ko'p uchraydigan 6 ta jiddiy xato va ularning to'g'ri yechimlari", 960, 880, { size: 26, align: 'center', color: C.soft });
    });
  }

  // 2. TAQQOSLASH JADVALI
  function sTaqqoslash(t) {
    heading("Ulanish Dialektlari Taqqoslash", t, L('L2').s - 0.4);

    const kTab = P(t, W('L2', 'pi-es-kyu-el'), 0.6);
    withA(kTab, () => {
      table(140, 240, "Uch tizimning ulanish xususiyatlari", [
        { label: 'Xususiyat', w: 320 },
        { label: 'PostgreSQL 18', w: 440 },
        { label: 'MySQL 9.7', w: 440 },
        { label: 'SQLite 3.54', w: 440 }
      ], [
        ['Mijoz dasturi', 'psql', 'mysql', 'sqlite3'],
        ['Host, port, user', '-h, -p (kichik), -U', '-h, -P (katta), -u', '— (fayl nomi beriladi)'],
        ['Parol saqlash', '.pgpass fayli (chmod 600)', 'Option fayli (talaba.cnf)', 'Parol yo‘q (fayl ruxsati)'],
        ['Ulanish satri', 'postgresql:// URI va kalit=qiymat', 'CLI buyruq parametrlari', 'Fayl yo‘li (dokon.db)'],
        ['localhost yozilsa', 'TCP/IP (host berilmasa socket)', 'Unix socket fayli!', '—'],
        ['Mijoz buyruqlari', '\\dt, \\d, \\x, \\q (\\ bilan)', 'status, \\G, quit (--commands)', '.tables, .schema, .quit (. bilan)']
      ], { p: kTab });
    });

    const kNote = P(t, W('L3', 'katta'), 0.5);
    withA(kNote, () => {
      card(140, 780, 1640, 160, { fill: '#fff9e6', col: C.orange, p: kNote });
      pill("PORT VA PAROL HARFLARI", 310, 830, C.orange, kNote, 22);
      text("PostgreSQL'da kichik -p = PORT. MySQL'da esa KATTA -P = PORT, kichik -p esa PAROL!", 480, 830, { size: 24, weight: 700, color: C.ink });
      text("Bu yangi o'rganuvchilar eng ko'p chalkashtiradigan asosiy farqlardan biridir.", 180, 890, { size: 23, color: C.soft });
    });
  }

  // 3. XATOLAR 1 VA 2
  function sXatolar12(t) {
    heading("1 va 2-Xatolar: trust va Parol Xavfsizligi", t, L('L5').s - 0.4);

    // 1-xato
    const kE1 = P(t, W('L5', 'birinchi'), 0.5);
    withA(kE1, () => {
      card(140, 240, 780, 480, { fill: '#fff2f0', col: C.red, p: kE1 });
      pill("1-XATO", 220, 290, C.red, kE1, 24);
      hand("initdb ni -A siz ishlatish", 310, 290, { size: 34, color: C.red, p: kE1 });

      text("• Sukut bo'yicha 'trust' usuli yoqiladi", 180, 360, { size: 23, color: C.ink });
      text("• Kompyuterdagi HAR KIM parolsiz superuser", 180, 405, { size: 23, weight: 700, color: C.red });
      text("  (postgres) bo'lib bazaga kira oladi!", 180, 445, { size: 23, weight: 700, color: C.red });

      card(180, 500, 700, 180, { fill: '#f6ffed', col: C.green, p: kE1 });
      pill("TO'G'RI YO'L", 270, 545, C.green, kE1, 20);
      text("initdb -D ~/pg/data -A scram-sha-256 \\", 210, 600, { size: 21, fam: MONO, weight: 700, color: C.ink });
      text("       --pwfile=parol.txt", 210, 640, { size: 21, fam: MONO, weight: 700, color: C.green });
    });

    // 2-xato
    const kE2 = P(t, W('L6', 'ikkinchi'), 0.5);
    withA(kE2, () => {
      card(1000, 240, 780, 480, { fill: '#fff2f0', col: C.red, p: kE2 });
      pill("2-XATO", 1080, 290, C.red, kE2, 24);
      hand("Parolni buyruq satriga yozish", 1170, 290, { size: 34, color: C.red, p: kE2 });

      text("• mysql -u talaba -pMaxfiy-2026", 1040, 360, { size: 22, fam: MONO, color: C.red });
      text("• PGPASSWORD='...' psql", 1040, 405, { size: 22, fam: MONO, color: C.red });
      text("• Xavf: ps orqali boshqa foydalanuvchilar ko'radi!", 1040, 450, { size: 23, weight: 700, color: C.red });

      card(1040, 500, 700, 180, { fill: '#f6ffed', col: C.green, p: kE2 });
      pill("TO'G'RI YO'L", 1130, 545, C.green, kE2, 20);
      text("PostgreSQL: ~/.pgpass fayli", 1070, 600, { size: 23, weight: 600, color: C.ink });
      text("MySQL: option fayli ([client] guruhi)", 1070, 640, { size: 23, weight: 600, color: C.ink });
    });

    const kGood = P(t, W('L7', 'to‘g‘ri'), 0.5);
    withA(kGood, () => {
      card(140, 760, 1640, 160, { fill: '#f0f7ff', col: C.blue, p: kGood });
      pill("XAVFSIZLIK QOIDASI", 290, 810, C.blue, kGood, 22);
      text("Hech qachon ishlab chiqarish parollarini buyruq satrida yoki skript parametrlarida ochiq qoldirmang!", 470, 810, { size: 24, weight: 700, color: C.blue });
      text("Doim maxsus parol fayllaridan (0600 ruxsati bilan) yoki xavfsiz muhit menejerlaridan foydalaning.", 180, 870, { size: 23, color: C.soft });
    });
  }

  // 4. XATOLAR 3 VA 4
  function sXatolar34(t) {
    heading("3 va 4-Xatolar: chmod 600 va localhost Tuzog'i", t, L('L8').s - 0.4);

    // 3-xato
    const kE3 = P(t, W('L8', 'uchinchi'), 0.5);
    withA(kE3, () => {
      card(140, 240, 780, 480, { fill: '#fff2f0', col: C.red, p: kE3 });
      pill("3-XATO", 220, 290, C.red, kE3, 24);
      hand("chmod 600 qilmaslik", 310, 290, { size: 34, color: C.red, p: kE3 });

      text("• .pgpass fayli ruxsati 0644 bo'lib qolsa:", 180, 360, { size: 23, color: C.ink });
      text("  WARNING: password file has group/world access", 180, 405, { size: 20, fam: MONO, color: C.red });
      text("• libpq bunday faylni E'TIBORSIZ QOLDIRADI!", 180, 450, { size: 23, weight: 700, color: C.red });
      text("  va parolsiz ulanish xatosi (fe_sendauth) beradi.", 180, 490, { size: 22, color: C.soft });

      card(180, 540, 700, 140, { fill: '#f6ffed', col: C.green, p: kE3 });
      pill("TO'G'RI YO'L", 270, 585, C.green, kE3, 20);
      text("chmod 600 ~/.pgpass", 210, 640, { size: 24, fam: MONO, weight: 700, color: C.green });
    });

    // 4-xato
    const kE4 = P(t, W('L9', 'to‘rtinchi'), 0.5);
    withA(kE4, () => {
      card(1000, 240, 780, 480, { fill: '#fff2f0', col: C.red, p: kE4 });
      pill("4-XATO", 1080, 290, C.red, kE4, 24);
      hand("MySQL localhost va -p3307", 1170, 290, { size: 34, color: C.red, p: kE4 });

      text("• mysql -h localhost deb yozib TCP deb o'ylash:", 1040, 360, { size: 23, color: C.ink });
      text("  Unix'da localhost har doim UNIX soketga ulanadi!", 1040, 405, { size: 22, weight: 700, color: C.red });
      text("• Port uchun -p3307 yozish:", 1040, 455, { size: 23, color: C.ink });
      text("  Kichik -p port emas, parol deb o'qiladi!", 1040, 495, { size: 22, weight: 700, color: C.red });

      card(1040, 540, 700, 140, { fill: '#f6ffed', col: C.green, p: kE4 });
      pill("TO'G'RI YO'L", 1130, 585, C.green, kE4, 20);
      text("mysql -h 127.0.0.1 -P 3307", 1070, 640, { size: 24, fam: MONO, weight: 700, color: C.green });
    });

    // Ogohlantirish xulosasi
    const kPortWarn = P(t, W('L10', 'kichik'), 0.5);
    withA(kPortWarn, () => {
      card(140, 760, 1640, 160, { fill: '#fff9e6', col: C.orange, p: kPortWarn });
      pill("ESDA SAQLANG", 260, 810, C.orange, kPortWarn, 22);
      text("MySQL TCP ulanish uchun har doim '127.0.0.1' va KATTA '-P 3307' yozilishi shart!", 400, 810, { size: 24, weight: 700, color: C.ink });
      text("Aks holda mijoz mavjud bo'lmagan soketni qidiradi yoki parolda adashadi.", 180, 870, { size: 23, color: C.soft });
    });
  }

  // 5. XATOLAR 5 VA 6
  function sXatolar56(t) {
    heading("5 va 6-Xatolar: MySQL --commands va SQLite Fayllari", t, L('L11').s - 0.4);

    // 5-xato
    const kE5 = P(t, W('L11', 'beshinchi'), 0.5);
    withA(kE5, () => {
      card(140, 240, 780, 480, { fill: '#fff2f0', col: C.red, p: kE5 });
      pill("5-XATO", 220, 290, C.red, kE5, 24);
      hand("Skriptda \\G xatosi (MySQL 9.7)", 310, 290, { size: 34, color: C.red, p: kE5 });

      text("• mysql -e \"SELECT ... \\G\"", 180, 360, { size: 22, fam: MONO, color: C.red });
      text("  ERROR at line 1: Unknown command '\\G'.", 180, 405, { size: 21, fam: MONO, weight: 700, color: C.red });
      text("• Sababi: MySQL 9.7 da --commands sukutda FALSE!", 180, 455, { size: 22, color: C.ink });

      card(180, 510, 700, 170, { fill: '#f6ffed', col: C.green, p: kE5 });
      pill("TO'G'RI YO'L", 270, 555, C.green, kE5, 20);
      text("mysql --commands -e \"... \\G\"", 210, 610, { size: 23, fam: MONO, weight: 700, color: C.green });
      text("Yoki skriptlarda SQL'ni oddiy ';' bilan yozing", 210, 650, { size: 21, color: C.soft });
    });

    // 6-xato
    const kE6 = P(t, W('L12', 'oltinchi'), 0.5);
    withA(kE6, () => {
      card(1000, 240, 780, 480, { fill: '#fff2f0', col: C.red, p: kE6 });
      pill("6-XATO", 1080, 290, C.red, kE6, 24);
      hand("SQLite faylida adashish / faylsiz ochish", 1170, 290, { size: 34, color: C.red, p: kE6 });

      text("• sqlite3 nomida xato qilsangiz xato bermaydi!", 1040, 360, { size: 23, weight: 700, color: C.red });
      text("  U shunchaki yangi bo'sh fayl ochib qo'yadi.", 1040, 405, { size: 22, color: C.ink });
      text("• Faylsiz ochilsa: xotirada ochiladi va chiqqanda", 1040, 455, { size: 22, color: C.ink });
      text("  barcha kiritilgan ma'lumotlar butunlay yo'qoladi!", 1040, 495, { size: 23, weight: 700, color: C.red });

      card(1040, 540, 700, 140, { fill: '#f6ffed', col: C.green, p: kE6 });
      pill("TO'G'RI YO'L", 1130, 585, C.green, kE6, 20);
      text("Doim fayl yo'lini tekshiring: sqlite3 dokon.db", 1070, 640, { size: 22, weight: 600, color: C.green });
    });

    // Maslahat
    const kAdv = P(t, W('L13', 'nuqta'), 0.5);
    withA(kAdv, () => {
      card(140, 760, 1640, 160, { fill: '#f0f7ff', col: C.blue, p: kAdv });
      pill("MASLAHAT", 240, 810, C.blue, kAdv, 22);
      text("SQLite'ga ulangach, darhol .tables buyrug'ini bering. Agar u bo'sh chiqsa — darhol fayl nomini tekshiring!", 350, 810, { size: 24, weight: 700, color: C.ink });
      text("Balki noto'g'ri papkada turibsiz yoki fayl nomini noto'g'ri kiritgansiz.", 180, 870, { size: 23, color: C.soft });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: 3-Bob Yakuni", t, L('L14').s - 0.4);

    const kX = P(t, W('L14', 'uchinchi'), 0.6);
    withA(kX, () => {
      card(260, 240, 1400, 500, { fill: C.card, col: C.blue, p: kX });
      hand("3-bobda nimalarni o'rgandik:", 310, 300, { size: 40, color: C.blue, p: kX });

      const points = [
        ["Ulanish asoslari", "Host, Port, Foydalanuvchi, Baza va Parol parametrlari.", C.blue],
        ["Socket vs TCP", "Lokalda Unix socket tezkor, tarmoqda TCP/IP. MySQL localhost farqi.", C.green],
        ["Xavfsiz ishga tushirish", "initdb -A scram-sha-256 va mysqld --initialize (vaqtinchalik parol).", C.purple],
        ["CLI mijozlar", "psql (URI, .pgpass, \\dt), mysql (option fayl, status), sqlite3 (.tables).", C.orange],
        ["6 ta tipik xato", "trust tuzog'i, ps dagi ochiq parol, chmod 600, port harfi, --commands, bo'sh fayl.", C.red]
      ];

      points.forEach(([tit, desc, col], idx) => {
        const kPt = P(t, W('L14', 'uchinchi') + 0.3 + idx * 0.5, 0.5);
        withA(kPt, () => {
          const y = 370 + idx * 68;
          pill(tit, 450, y, col, kPt, 22);
          text(`— ${desc}`, 590, y, { size: 23, color: C.ink });
        });
      });
    });

    const kNext = P(t, W('L15', 'to‘rtinchi'), 0.6);
    withA(kNext, () => {
      card(260, 770, 1400, 180, { fill: '#f0f7ff', col: C.green, p: kNext });
      hand("Keyingi qadam: 4-bob — SQL Sintaksisi!", 310, 825, { size: 36, color: C.green, p: kNext });
      text("Endi haqiqiy SQL so'rovlarini yozishni boshlaymiz: kalit so'zlar, identifikatorlar,", 310, 880, { size: 24, weight: 600, color: C.ink });
      text("literallar, izohlar va barcha nozik sintaktik qoidalarni tahlil qilamiz!", 310, 920, { size: 23, color: C.soft });
    });
  }

  function render(time) {
    ctx.clearRect(0, 0, 1920, 1080);
    bg();

    const t = Math.max(0, time);
    const s = TM.scenes;

    if (t < s.taqqoslash.s) sIntro(t);
    else if (t < s.xatolar_1_2.s) sTaqqoslash(t);
    else if (t < s.xatolar_3_4.s) sXatolar12(t);
    else if (t < s.xatolar_5_6.s) sXatolar34(t);
    else if (t < s.xulosa.s) sXatolar56(t);
    else sXulosa(t);
  }

  function renderPoster() {
    ctx.clearRect(0, 0, 1920, 1080);
    bg();

    hand("3-bob", 960, 150, { size: 50, align: 'center', p: 1, color: C.soft });
    hand("Dialektlar va Tipik Xatolar", 960, 240, { size: 80, align: 'center', p: 1, color: C.blue });
    hand("3-qism: 6 ta xavfli ulanish xatosi", 960, 320, { size: 50, align: 'center', p: 1, color: C.red });

    card(140, 390, 780, 380, { fill: C.card, col: C.red, p: 1 });
    hand("Eng ko'p uchraydigan 3 ta xato", 180, 450, { size: 32, color: C.red, p: 1 });
    text("1. initdb ni -A siz ishlatish (trust tuzog'i)", 180, 520, { size: 23, weight: 600 });
    text("2. Parolni buyruq satrida ochiq yozish (ps ko'radi)", 180, 575, { size: 23, weight: 600 });
    text("3. .pgpass fayliga chmod 600 bermaslik", 180, 630, { size: 23, weight: 600 });
    pill("Himoya: Doim chmod 600 va -A scram-sha-256", 520, 710, C.green, 1, 20);

    card(1000, 390, 780, 380, { fill: C.card, col: C.orange, p: 1 });
    hand("Qolgan 3 ta chalg'ituvchi xato", 1040, 450, { size: 32, color: C.orange, p: 1 });
    text("4. MySQL'da localhost deb yozib TCP deb o'ylash", 1040, 520, { size: 23, weight: 600 });
    text("5. MySQL 9.7 da --commands siz \\G ishlatish", 1040, 575, { size: 23, weight: 600 });
    text("6. SQLite'da fayl nomida adashish (bo'sh baza)", 1040, 630, { size: 23, weight: 600 });
    pill("Echim: 127.0.0.1, -P 3307 va .tables tekshiruvi", 1380, 710, C.blue, 1, 20);

    card(140, 810, 1640, 190, { fill: '#f6ffed', col: C.green, p: 1 });
    hand("Xulosa:", 180, 865, { size: 34, color: C.green, p: 1 });
    text("Xavfsiz va to'g'ri ulanish sozlamalari ishlab chiqarishdagi xavfsizlikning poydevoridir.", 180, 925, { size: 24, color: C.ink });
    text("Keyingi bob: SQL tili sintaksisi va amaliy so'rovlar!", 180, 965, { size: 24, weight: 700, color: C.blue });
  }

  window.render = render;
  window.renderPoster = renderPoster;
})();
