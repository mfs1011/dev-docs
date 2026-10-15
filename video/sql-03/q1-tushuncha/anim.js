// SQL 3-bob 1-qism: Ulanish parametrlari, Socket vs TCP va Klaster yaratish
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
    hand("O'rnatish va ulanish", 960, 390, { size: 100, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Parametrlar, Socket va Klaster", 960, 510, { size: 64, align: 'center', p: P(t, 1.2, 1.2) });
    marker(560, 550, 800 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L1', 'to‘rtta'), 0.8);
    withA(kBadges, () => {
      pill("PostgreSQL 18.6", 660, 680, C.blue, kBadges, 28);
      pill("MySQL 9.7.2", 960, 680, C.orange, kBadges, 28);
      pill("SQLite 3.54.0", 1260, 680, C.teal, kBadges, 28);
    });

    const kDesc = P(t, W('L1', 'serverni'), 0.8);
    withA(kDesc, () => {
      card(420, 780, 1080, 160, { fill: C.card, col: C.blue, p: kDesc });
      text("Klient-Server arxitekturasi: Host, Port, Foydalanuvchi, Baza", 960, 830, { size: 30, weight: 700, align: 'center', color: C.ink });
      text("Lokal ulanishlarda Unix socket va xavfsiz initdb / mysqld sozlamalari", 960, 880, { size: 26, align: 'center', color: C.soft });
    });
  }

  // 2. PARAMETRLAR
  function sParametrlar(t) {
    heading("Ulanishning 4 parametri", t, L('L2').s - 0.4);

    const cards = [
      { tit: "HOST", sub: "Server qayerda?", val: "localhost / 127.0.0.1", col: C.blue, w: 'host' },
      { tit: "PORT", sub: "Raqamli eshik", val: "PG: 5432 | MY: 3306", col: C.purple, w: 'port' },
      { tit: "FOYDALANUVCHI", sub: "Kim nomidan?", val: "postgres / talaba / root", col: C.green, w: 'foydalanuvchi' },
      { tit: "BAZA (DB)", sub: "Qaysi bazaga?", val: "qollanma / mydb", col: C.orange, w: 'baza' }
    ];

    cards.forEach((c, i) => {
      const k = P(t, W('L2', c.w), 0.5);
      withA(k, () => {
        const x = 140 + i * 420, y = 230;
        card(x, y, 380, 230, { fill: C.card, col: c.col, p: k });
        hand(c.tit, x + 30, y + 55, { size: 38, color: c.col, p: k });
        text(c.sub, x + 30, y + 115, { size: 24, weight: 600, color: C.soft });
        pill(c.val, x + 190, y + 175, c.col, k, 20);
      });
    });

    // Parol callout
    const kPass = P(t, W('L4', 'parol'), 0.5);
    withA(kPass, () => {
      card(140, 500, 1640, 110, { fill: '#fff9e6', col: C.orange, p: kPass });
      pill("PAROL", 240, 555, C.orange, kPass, 24);
      text("Tarmoq orqali ulanishda shaxsni tasdiqlovchi maxfiy kalit: SCRAM-SHA-256 yoki caching_sha2_password", 340, 555, { size: 24, weight: 600, color: C.ink });
    });

    // Taqqoslash jadvali
    const kTab = P(t, W('L3', 'postgres'), 0.6);
    withA(kTab, () => {
      table(140, 640, "Sukut bo'yicha qiymatlar", [
        { label: 'Parametr', w: 260 },
        { label: "Ma'nosi", w: 380 },
        { label: "PostgreSQL sukut bo'yicha", w: 500 },
        { label: "MySQL sukut bo'yicha", w: 500 }
      ], [
        ['Host', 'Server qaysi kompyuterda', "Unix'da socket; Windows'da localhost", "localhost (Unix'da socket!)"],
        ['Port', 'Server raqamli eshigi', '5432', '3306'],
        ['Foydalanuvchi', 'Baza foydalanuvchisi', 'OS foydalanuvchi nomi', 'Unix tizim foydalanuvchisi'],
        ['Baza', 'Qaysi baza ochiladi', 'Foydalanuvchi nomi bilan bir xil', 'Tanlanmaydi (keyin use qilinadi)']
      ], { p: kTab });
    });
  }

  // 3. SOCKET VS TCP/IP
  function sSocketTcp(t) {
    heading("Socket va TCP/IP", t, L('L5').s - 0.4);

    // Chap: Unix socket
    const kSock = P(t, W('L5', 'yuniks'), 0.6);
    withA(kSock, () => {
      card(140, 240, 780, 470, { fill: C.card, col: C.green, p: kSock });
      hand("Unix Domain Socket", 180, 290, { size: 40, color: C.green, p: kSock });
      pill("Lokal kompyuter ichida", 740, 290, C.green, kSock, 20);

      laptop(300, 420, 1.0);
      serverBox(720, 420, 1.0);
      arrow(380, 420, 640, 420, { bend: -15, col: C.green, w: 4, p: kSock });
      text("Soket fayli", 510, 380, { size: 22, weight: 700, color: C.green, align: 'center', fam: MONO });

      text("• Tarmoq drayverisiz, xotira orqali o'ta tezkor aloqa", 180, 520, { size: 24, color: C.ink });
      text("• PostgreSQL: /tmp/.s.PGSQL.5432", 180, 565, { size: 22, color: C.soft, fam: MONO });
      text("• MySQL: /tmp/my97.sock", 180, 605, { size: 22, color: C.soft, fam: MONO });
      text("• Faqat shu kompyuterdagi dasturlar ulana oladi", 180, 660, { size: 22, weight: 600, color: C.green });
    });

    // O'ng: TCP/IP
    const kTcp = P(t, W('L6', 'ti-si-pi'), 0.6);
    withA(kTcp, () => {
      card(1000, 240, 780, 470, { fill: C.card, col: C.blue, p: kTcp });
      hand("TCP/IP Tarmog'i", 1040, 290, { size: 40, color: C.blue, p: kTcp });
      pill("Masofaviy yoki Tarmoq", 1580, 290, C.blue, kTcp, 20);

      laptop(1160, 420, 1.0);
      serverBox(1580, 420, 1.0);
      arrow(1240, 420, 1500, 420, { bend: -15, col: C.blue, w: 4, p: kTcp });
      text("IP:Port tarmog'i", 1370, 380, { size: 22, weight: 700, color: C.blue, align: 'center', fam: MONO });

      text("• Boshqa kompyuter, bulut yoki Docker konteynerlar", 1040, 520, { size: 24, color: C.ink });
      text("• PostgreSQL: 127.0.0.1:5432 yoki 192.168.1.5", 1040, 565, { size: 22, color: C.soft, fam: MONO });
      text("• MySQL: 127.0.0.1:3307", 1040, 605, { size: 22, color: C.soft, fam: MONO });
      text("• Parol va shifrlash (TLS/SSL) muhim", 1040, 660, { size: 22, weight: 600, color: C.blue });
    });

    // MySQL localhost tuzog'i
    const kWarn = P(t, W('L7', 'lokal-xost'), 0.6);
    withA(kWarn, () => {
      card(140, 740, 1640, 130, { fill: '#fff2f0', col: C.red, p: kWarn });
      pill("OGOHLANTIRISH", 270, 785, C.red, kWarn, 22);
      text("MySQL Unix tizimlarida 'localhost' yozilsa, tarmoqqa emas, Unix socket fayliga ulanadi!", 410, 785, { size: 25, weight: 700, color: C.red });
      text("TCP/IP orqali ulanish uchun aniq '127.0.0.1' yoki '--protocol=TCP' deb yozishingiz shart.", 410, 830, { size: 23, color: C.ink });
    });

    // SQLite eslatma
    const kSqlite = P(t, W('L8', 'es-kyu-layt'), 0.5);
    withA(kSqlite, () => {
      pill("SQLite", 210, 920, C.teal, kSqlite, 24);
      text("SQLite'da soket ham, port ham yo'q: ulanish — bu shunchaki diskdagi faylni ochishdir!", 300, 920, { size: 24, weight: 700, color: C.teal });
    });
  }

  // 4. POSTGRESQL INITDB
  function sInitdb(t) {
    heading("PostgreSQL: Klaster va initdb", t, L('L9').s - 0.4);

    const kInit = P(t, W('L9', 'init-di-bi'), 0.6);
    withA(kInit, () => {
      card(140, 240, 1640, 280, { fill: C.card, col: C.blue, p: kInit });
      hand("1. Klasterni yaratish (initdb)", 180, 295, { size: 38, color: C.blue, p: kInit });
      text("Klaster — bitta server dasturi boshqaradigan ma'lumotlar bazalari to'plami:", 180, 355, { size: 24, color: C.soft });

      const cmd = "initdb -D ~/pg/data -U postgres -E UTF8 --locale=en_US.UTF-8 -A scram-sha-256 --pwfile=parol.txt";
      srect(180, 395, 1560, 60, { col: C.blue, p: kInit });
      text(cmd, 205, 425, { size: 22, fam: MONO, weight: 700, color: C.ink });

      pill("-A scram-sha-256", 300, 485, C.green, kInit, 22);
      text("Foydalanuvchilarni kuchli SCRAM-SHA-256 shifrlangan paroli bilan tekshirish", 470, 485, { size: 22, color: C.soft });
    });

    // Trust ogohlantirish
    const kTrust = P(t, W('L10', 'trust'), 0.6);
    withA(kTrust, () => {
      card(140, 550, 1640, 210, { fill: '#fff2f0', col: C.red, p: kTrust });
      pill("XAVFSIZLIK TUZOG'I", 280, 600, C.red, kTrust, 22);
      text("Sukut bo'yicha initdb -A siz ishlatilsa: 'warning: enabling \"trust\" authentication'", 450, 600, { size: 24, weight: 700, color: C.red });
      text("Bu kompyuterdagi har qanday lokal foydalanuvchiga hech qanday parolsiz superuser bo'lib kirishga yo'l ochadi!", 180, 660, { size: 23, color: C.ink });
      text("Shuning uchun har doim -A scram-sha-256 va --pwfile ko'rsatilishi shart.", 180, 710, { size: 23, weight: 600, color: C.green });
    });

    // pg_ctl
    const kCtl = P(t, W('L12', 'pi-ji-si-ti-el'), 0.6);
    withA(kCtl, () => {
      card(140, 790, 1640, 160, { fill: C.card, col: C.purple, p: kCtl });
      hand("2. Serverni boshqarish (pg_ctl)", 180, 840, { size: 34, color: C.purple, p: kCtl });
      text("Ishga tushirish: pg_ctl -D ~/pg/data -l ~/pg/server.log start", 180, 905, { size: 23, fam: MONO, color: C.green });
      text("To'xtatish: pg_ctl -D ~/pg/data stop", 1080, 905, { size: 23, fam: MONO, color: C.red });
    });
  }

  // 5. MYSQL INIT
  function sMysqlInit(t) {
    heading("MySQL: mysqld --initialize", t, L('L13').s - 0.4);

    const kMy = P(t, W('L13', 'may-es-kyu-el-di'), 0.6);
    withA(kMy, () => {
      card(140, 240, 1640, 320, { fill: C.card, col: C.orange, p: kMy });
      hand("mysqld --initialize (Sukut bo'yicha xavfsiz)", 180, 295, { size: 38, color: C.orange, p: kMy });

      text("Buyruq: mysqld --initialize --datadir=~/my/data", 180, 360, { size: 26, fam: MONO, weight: 700, color: C.ink });

      const kTmp = P(t, W('L14', 'tasodifiy'), 0.6);
      withA(kTmp, () => {
        text("Server logida tasodifiy vaqtinchalik parol hosil bo'ladi:", 180, 420, { size: 24, color: C.soft });
        text("[Note] [MY-010454] [Server] A temporary password is generated for root@localhost: *?(4lVN&wKdt", 180, 465, { size: 22, fam: MONO, color: C.purple });
        pill("MUDDATI O'TGAN (EXPIRED)", 300, 520, C.orange, kTmp, 20);
        text("Ushbu parol bilan oddiy SELECT so'rovlarini bajarib bo'lmaydi!", 520, 520, { size: 22, weight: 600, color: C.ink });
      });
    });

    const kAlter = P(t, W('L15', 'alter'), 0.6);
    withA(kAlter, () => {
      card(140, 590, 1640, 190, { fill: C.card, col: C.blue, p: kAlter });
      hand("Parolni darhol yangilash shart", 180, 645, { size: 34, color: C.blue, p: kAlter });
      text("Birinchi ulanishda parolni yangilash talab qilinadi:", 180, 700, { size: 23, color: C.soft });
      text("ALTER USER 'root'@'localhost' IDENTIFIED BY 'Yangi-Parol-2026';", 180, 745, { size: 25, fam: MONO, weight: 700, color: C.blue });
    });

    // Insecure ogohlantirish
    withA(kAlter, () => {
      card(140, 810, 1640, 140, { fill: '#fff2f0', col: C.red, p: kAlter });
      pill("XAVFLI", 220, 855, C.red, kAlter, 22);
      text("--initialize-insecure parametri root'ni parolsiz qoldiradi!", 310, 855, { size: 24, weight: 700, color: C.red });
      text("Ishlab chiqarishda hech qachon bunday qoldirmang, darhol parol o'rnating.", 310, 895, { size: 22, color: C.soft });
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa: Asosiy Saboqlar", t, L('L16').s - 0.4);

    const kX = P(t, W('L16', 'demak'), 0.6);
    withA(kX, () => {
      card(260, 240, 1400, 500, { fill: C.card, col: C.blue, p: kX });
      hand("Ushbu qismda bilib oldik:", 310, 300, { size: 40, color: C.blue, p: kX });

      const points = [
        ["To'rtta parametr", "Host, Port, Foydalanuvchi va Baza (+ Parol).", C.blue],
        ["Socket va TCP", "Lokal kompyuterda Unix socket eng tezkor, tarmoqda esa TCP/IP.", C.green],
        ["MySQL localhost siri", "localhost yozsangiz socketga ulanadi, TCP uchun 127.0.0.1 kerak.", C.purple],
        ["PostgreSQL initdb", "Doim -A scram-sha-256 ishlating, aks holda trust tuzog'iga tushasiz.", C.red],
        ["MySQL initialize", "mysqld --initialize muddati o'tgan parol beradi, ALTER USER bilan yangilanadi.", C.orange]
      ];

      points.forEach(([tit, desc, col], idx) => {
        const kPt = P(t, W('L16', 'demak') + 0.3 + idx * 0.5, 0.5);
        withA(kPt, () => {
          const y = 370 + idx * 68;
          pill(tit, 450, y, col, kPt, 22);
          text(`— ${desc}`, 590, y, { size: 23, color: C.ink });
        });
      });
    });

    const kNext = P(t, W('L17', 'keyingi'), 0.6);
    withA(kNext, () => {
      card(260, 770, 1400, 180, { fill: '#f0f7ff', col: C.blue, p: kNext });
      hand("Keyingi qismda (03-2): CLI Mijozlar", 310, 825, { size: 36, color: C.blue, p: kNext });
      text("psql, mysql va sqlite3 dasturlari orqali haqiqiy terminalda ulanishlar,", 310, 880, { size: 24, weight: 600, color: C.ink });
      text(".pgpass, option fayllar va eng muhim meta-buyruqlarni amalda ko'ramiz!", 310, 920, { size: 23, color: C.soft });
    });
  }

  function render(time) {
    ctx.clearRect(0, 0, 1920, 1080);
    bg();

    const t = Math.max(0, time);
    const s = TM.scenes;

    if (t < s.parametrlar.s) sIntro(t);
    else if (t < s.socket_tcp.s) sParametrlar(t);
    else if (t < s.initdb.s) sSocketTcp(t);
    else if (t < s.mysql_init.s) sInitdb(t);
    else if (t < s.xulosa.s) sMysqlInit(t);
    else sXulosa(t);
  }

  function renderPoster() {
    ctx.clearRect(0, 0, 1920, 1080);
    bg();

    hand("3-bob", 960, 150, { size: 50, align: 'center', p: 1, color: C.soft });
    hand("O'rnatish va ulanish", 960, 240, { size: 80, align: 'center', p: 1, color: C.blue });
    hand("1-qism: Parametrlar, Socket va Klaster", 960, 320, { size: 50, align: 'center', p: 1 });

    card(140, 390, 780, 380, { fill: C.card, col: C.blue, p: 1 });
    hand("Ulanishning 4 parametri", 180, 450, { size: 36, color: C.blue, p: 1 });
    text("• Host: Server qaysi kompyuterda", 180, 520, { size: 24, weight: 600 });
    text("• Port: Server raqamli eshigi (5432 / 3306)", 180, 570, { size: 24, weight: 600 });
    text("• Foydalanuvchi: Baza hisobi", 180, 620, { size: 24, weight: 600 });
    text("• Baza: Qaysi ma'lumotlar bazasi", 180, 670, { size: 24, weight: 600 });
    pill("+ Maxfiy Parol (SCRAM-SHA-256)", 360, 725, C.green, 1, 22);

    card(1000, 390, 780, 380, { fill: C.card, col: C.purple, p: 1 });
    hand("Socket vs TCP/IP", 1040, 450, { size: 36, color: C.purple, p: 1 });
    text("• Unix socket: Lokal kompyuterda eng tezkor", 1040, 520, { size: 24, weight: 600 });
    text("• TCP/IP: Tarmoq yoki Docker orqali aloqa", 1040, 570, { size: 24, weight: 600 });
    text("• MySQL'da 'localhost' = Unix soket!", 1040, 620, { size: 24, color: C.red, weight: 700 });
    text("• TCP uchun '127.0.0.1' yozish shart", 1040, 670, { size: 24, color: C.blue, weight: 700 });
    pill("SQLite: Serversiz oddiy bitta fayl", 1390, 725, C.teal, 1, 22);

    card(140, 810, 1640, 190, { fill: '#fff9e6', col: C.orange, p: 1 });
    hand("Xavfsiz ishga tushirish qoidalari", 180, 865, { size: 34, color: C.orange, p: 1 });
    text("PostgreSQL: initdb -A scram-sha-256 (sukut bo'yicha 'trust' qoldirmang!)", 180, 925, { size: 24, color: C.ink });
    text("MySQL: mysqld --initialize (vaqtinchalik parol, darhol ALTER USER bilan yangilang)", 180, 965, { size: 24, color: C.ink });
  }

  window.render = render;
  window.renderPoster = renderPoster;
})();
