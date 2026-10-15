// SQL 5-bob 1-qism: "Tushuncha" — Baza, sxema va jadval ierarxiyasi, Shablonlar va search_path
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
    hand("5-bob", 960, 260, { size: 60, align: 'center', p: k, color: C.soft });
    hand("Baza, sxema va jadval", 960, 390, { size: 100, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("SQL obyektlar ierarxiyasi va qidiruv yo'li", 960, 510, { size: 54, align: 'center', p: P(t, 1.2, 1.2) });
    marker(480, 550, 960 * eio(P(t, 2.0, 0.7)), 20, C.hl, 1);

    const kBadges = P(t, W('L1', 'ierarxiyasi'), 0.8);
    withA(kBadges, () => {
      pill("Klaster (Server)", 600, 680, C.blue, kBadges, 28);
      pill("Baza (Database)", 880, 680, C.purple, kBadges, 28);
      pill("Sxema (Namespace)", 1160, 680, C.green, kBadges, 28);
      pill("Jadval (Table)", 1400, 680, C.orange, kBadges, 28);
    });

    const kDesc = P(t, W('L1', 'o‘rganamiz'), 0.8);
    withA(kDesc, () => {
      card(380, 780, 1160, 160, { fill: C.card, col: C.blue, p: kDesc });
      text("Bitta ulanish — bitta baza qoidasi va shablonlar (template1, template0)", 960, 830, { size: 30, weight: 700, align: 'center', color: C.ink });
      text("Sxemalararo nomlar, search_path parametri va xavfsizlik talablari", 960, 880, { size: 26, align: 'center', color: C.soft });
    });
  }

  // 2. IERARXIYA
  function sIerarxiya(t) {
    heading("SQL Obyektlar Ierarxiyasi", t, L('L2').s - 0.4);

    const kTree = P(t, W('L2', 'klaster'), 0.6);
    withA(kTree, () => {
      // Chap: Daraxt kartasi
      card(140, 230, 760, 720, { fill: C.card, col: C.blue, p: kTree });
      hand("PostgreSQL Ob'ektlar Ierarxiyasi", 180, 285, { size: 34, color: C.blue, p: kTree });

      // Klaster
      card(180, 330, 680, 95, { fill: '#eff6ff', col: C.blue, p: kTree });
      hand("1. KLASTER (Bitta PostgreSQL serveri)", 210, 370, { size: 26, color: C.blue, p: kTree });
      text("Umumiy: Rollar, foydalanuvchilar, tablespace'lar, WAL", 210, 405, { size: 19, color: C.soft });

      // Baza
      card(230, 445, 630, 115, { fill: '#faf5ff', col: C.purple, p: kTree });
      hand("2. BAZA (Database)", 260, 485, { size: 26, color: C.purple, p: kTree });
      text("Nomlangan SQL obyektlari to'plami. Ulanish faqat bitta bazaga kiradi!", 260, 520, { size: 19, color: C.ink, wrap: 560 });

      // Sxema
      card(280, 580, 580, 115, { fill: '#f0fdf4', col: C.green, p: kTree });
      hand("3. SXEMA (Nomlar fazosi / Namespace)", 310, 620, { size: 26, color: C.green, p: kTree });
      text("Mantiqiy papka: jadvallar, funksiyalar, tiplar to'qnashuvsiz saqlanadi", 310, 655, { size: 19, color: C.ink, wrap: 510 });

      // Jadval
      card(330, 715, 530, 100, { fill: '#fff7ed', col: C.orange, p: kTree });
      hand("4. JADVAL, VIEW, INDEKS", 360, 755, { size: 26, color: C.orange, p: kTree });
      text("Ustunlar, qatorlar, cheklovlar va haqiqiy ma'lumotlar", 360, 790, { size: 19, color: C.ink });
    });

    // O'ng: Qat'iy qoidalar
    const kRules = P(t, W('L3', 'eng'), 0.6);
    withA(kRules, () => {
      card(940, 230, 840, 720, { fill: C.card, col: C.purple, p: kRules });
      hand("Bitta ulanish — Bitta baza!", 980, 285, { size: 36, color: C.purple, p: kRules });

      card(980, 340, 760, 180, { fill: '#fef2f2', col: C.red, p: kRules });
      pill("TAQIQLANGAN", 1080, 385, C.red, kRules, 22);
      text("Bitta ulanish ichidan boshqa bazadagi jadvalni o'qib bo'lmaydi!", 1210, 390, { size: 22, weight: 700, color: C.red });
      text("SELECT * FROM qollanma.public.talabalar;  -->  ERROR!", 1000, 445, { size: 21, fam: MONO, weight: 700, color: C.ink });
      text("ERROR: cross-database references are not implemented", 1000, 485, { size: 19, fam: MONO, color: C.red });

      card(980, 545, 760, 365, { fill: '#f0fdf4', col: C.green, p: kRules });
      hand("Qachon Bazalarga, qachon Sxemalarga?", 1010, 590, { size: 28, color: C.green, p: kRules });
      
      text("• ALOHIDA BAZALARGA: Bir-biriga umuman aloqasi yo'q loyihalar va mijozlar. Zaxiralash va huquqlar to'liq mustaqil bo'ladi.", 1010, 650, { size: 21, color: C.ink, wrap: 700 });
      text("• BIR BAZADAGI ALOHIDA SXEMALARGA: Bir-biri bilan ma'lumot almashadigan yoki bitta loyihaning modullari (ombor, savdo, kadrlar). Bitta so'rovda JOIN qilish mumkin!", 1010, 770, { size: 21, color: C.ink, wrap: 700 });
    });
  }

  // 3. SHABLONLAR
  function sShablonlar(t) {
    heading("Shablon bazalar: template1 va template0", t, L('L5').s - 0.4);

    const kCopy = P(t, W('L5', 'shablon'), 0.6);
    withA(kCopy, () => {
      card(140, 230, 1640, 350, { fill: C.card, col: C.blue, p: kCopy });
      hand("CREATE DATABASE shablondan nusxa oladi!", 180, 285, { size: 36, color: C.blue, p: kCopy });
      text("PostgreSQL yangi bazani noldan qurmaydi, balki mavjud shablon bazani faylma-fayl klonlaydi.", 180, 340, { size: 24, color: C.soft });

      // template1
      card(180, 390, 760, 160, { fill: '#eff6ff', col: C.blue, p: kCopy });
      hand("template1 (Sukut bo'yicha shablon)", 210, 435, { size: 26, color: C.blue, p: kCopy });
      text("• Yangi baza yaratilganda shu bazadan nusxa olinadi\n• Unga jadval yoki extension qo'shsangiz, keyingi HAR BIR yangi bazada paydo bo'ladi!\n• Maslahat: template1 ni toza saqlang!", 210, 480, { size: 19, color: C.ink });

      // template0
      card(980, 390, 760, 160, { fill: '#f0fdf4', col: C.green, p: kCopy });
      hand("template0 (Mutlaqo toza etalon)", 1010, 435, { size: 26, color: C.green, p: kCopy });
      text("• PostgreSQL versiyasining toza boshlang'ich holati\n• Unga yangi ulanishlar QAT'IY TAQIQLANGAN (datallowconn = false)\n• Dump tiklashda va boshqa locale bilan yaratishda ishlatiladi", 1010, 480, { size: 19, color: C.ink });
    });

    // Nusxalash paytidagi qoida
    const kLock = P(t, W('L8', 'ulanmagan'), 0.6);
    withA(kLock, () => {
      card(140, 620, 1640, 330, { fill: '#fff9e6', col: C.orange, p: kLock });
      pill("DIQQAT: BOShQA ULANISh BO'LMASLIGI SHART", 440, 675, C.orange, kLock, 24);
      text("Shablon qilib ko'rsatilgan bazadan nusxa olinayotganda, unga boshqa hech kim ulanmagan bo'lishi kerak!", 180, 735, { size: 24, weight: 700, color: C.ink });

      text("CREATE DATABASE dokon_nusxa TEMPLATE dokon;", 180, 800, { size: 22, fam: MONO, weight: 700, color: C.blue });
      text("ERROR: source database \"dokon\" is being accessed by other users\nDETAIL: There is 1 other session using the database.", 180, 845, { size: 20, fam: MONO, color: C.red });
      pill("5 soniya kutadi", 1520, 825, C.soft, kLock, 20);
    });
  }

  // 4. SXEMALAR
  function sSxemalar(t) {
    heading("Sxema: Baza ichidagi Nomlar Fazosi", t, L('L9').s - 0.4);

    const kSchema = P(t, W('L9', 'sxema'), 0.6);
    withA(kSchema, () => {
      card(140, 230, 800, 720, { fill: C.card, col: C.green, p: kSchema });
      hand("Sxema (Schema) — Mantiqiy Papka", 180, 285, { size: 36, color: C.green, p: kSchema });
      text("Sxemani operatsion tizimdagi papkaga o'xshatish mumkin", 180, 335, { size: 24, color: C.soft });

      const points = [
        { tit: "Sxema ichida sxema bo'lmaydi", desc: "Papkalardan farqli ravishda sxema faqat 1 qatlamli bo'ladi.", col: C.blue },
        { tit: "Bitta sxemada nomlar yagona", desc: "Bitta sxemada jadval, view, sequence va indeks bir xil nomga ega bo'lolmaydi!", col: C.orange },
        { tit: "Turli sxemalarda bir xil nom mumkin", desc: "ombor.mahsulot va savdo.mahsulot bemalol yonma-yon yashaydi.", col: C.green },
        { tit: "Bitta so'rovda birlashtirish (JOIN)", desc: "Sxemalar ajratilmagan: foydalanuvchi huquqi bo'lsa, bitta SELECT da ikkala sxemadagi jadvalni birlashtiradi.", col: C.purple }
      ];

      points.forEach((pt, i) => {
        const y = 370 + i * 135;
        card(170, y, 740, 115, { fill: '#f8fafc', col: pt.col, p: kSchema });
        hand(pt.tit, 195, y + 35, { size: 24, color: pt.col, p: kSchema });
        text(pt.desc, 195, y + 75, { size: 19, color: C.ink, wrap: 690 });
      });
    });

    // O'ng: Malakali nom va misol
    const kQual = P(t, W('L11', 'ombor'), 0.6);
    withA(kQual, () => {
      card(980, 230, 800, 720, { fill: C.card, col: C.blue, p: kQual });
      hand("Malakali nom (Qualified Name)", 1020, 285, { size: 36, color: C.blue, p: kQual });
      text("sxema.jadval shaklidagi to'liq murojaat", 1020, 335, { size: 24, color: C.soft });

      // sxema 1: ombor
      card(1010, 380, 740, 230, { fill: '#eff6ff', col: C.blue, p: kQual });
      hand("Sxema: ombor", 1035, 425, { size: 28, color: C.blue, p: kQual });
      text("CREATE TABLE ombor.mahsulot (id int, nom text);", 1035, 475, { size: 20, fam: MONO, weight: 700, color: C.ink });
      text("Qatorlar: (1, 'Non')", 1035, 515, { size: 20, fam: MONO, color: C.soft });
      pill("ombor.mahsulot", 1600, 425, C.blue, kQual, 20);

      // sxema 2: savdo
      card(1010, 640, 740, 230, { fill: '#faf5ff', col: C.purple, p: kQual });
      hand("Sxema: savdo", 1035, 685, { size: 28, color: C.purple, p: kQual });
      text("CREATE TABLE savdo.mahsulot (id int, narx numeric);", 1035, 735, { size: 20, fam: MONO, weight: 700, color: C.ink });
      text("Qatorlar: (1, 4000)", 1035, 775, { size: 20, fam: MONO, color: C.soft });
      pill("savdo.mahsulot", 1600, 685, C.purple, kQual, 20);

      text("• Ikkala jadval ham bitta bazada, to'qnashuvsiz saqlanadi!", 1010, 910, { size: 21, weight: 600, color: C.green });
    });
  }

  // 5. SEARCH_PATH & SECURITY
  function sSearchPath(t) {
    heading("search_path va Xavfsizlik", t, L('L13').s - 0.4);

    const kPath = P(t, W('L13', 'sörch'), 0.6);
    withA(kPath, () => {
      card(140, 230, 1640, 360, { fill: C.card, col: C.blue, p: kPath });
      hand("Qidiruv yo'li (search_path)", 180, 285, { size: 36, color: C.blue, p: kPath });
      text("Sxemasiz yozilgan qisqa nomlar ketma-ket shu yo'l bo'yicha qidiriladi", 180, 335, { size: 24, color: C.soft });

      card(180, 375, 760, 180, { fill: '#f8fafc', col: C.blue, p: kPath });
      hand("Sukut bo'yicha qiymat", 205, 415, { size: 24, color: C.blue, p: kPath });
      text("SHOW search_path;  -->  \"$user\", public", 205, 465, { size: 22, fam: MONO, weight: 700, color: C.ink });
      text("1. Joriy foydalanuvchi nomli sxema\n2. public sxemasi", 205, 505, { size: 19, color: C.soft });

      card(980, 375, 760, 180, { fill: '#f0fdf4', col: C.green, p: kPath });
      hand("pg_catalog (Yashirin birinchi o'rin)", 1005, 415, { size: 24, color: C.green, p: kPath });
      text("search_path da yozilmagan bo'lsa ham DOIM BIRINCHI qidiriladi!", 1005, 465, { size: 21, color: C.ink });
      text("Tizim jadvallari, ichki tiplar va funksiyalar shu yerda turadi.\nMaslahat: o'z jadvallaringizni pg_ bilan nomlamang!", 1005, 505, { size: 19, color: C.soft });
    });

    // Xavfsizlik tuzog'i
    const kSec = P(t, W('L16', 'yovuz'), 0.6);
    withA(kSec, () => {
      card(140, 620, 1640, 330, { fill: '#fef2f2', col: C.red, p: kSec });
      pill("XAVFSIZLIK TUZOG'I: YOVUZ KOD IJROSI", 410, 675, C.red, kSec, 24);
      text("search_path ga boshqa foydalanuvchilar yoza oladigan sxemani qo'shish xavfli!", 180, 735, { size: 24, weight: 700, color: C.red });

      text("• Begona foydalanuvchi siz ishlatadigan funksiya nomida zararli kod yaratib qo'yishi mumkin.", 180, 785, { size: 22, color: C.ink });
      text("• Shu sababli PostgreSQL 15 dan boshlab public sxemasida hamma uchun CREATE huquqi bekor qilingan:", 180, 830, { size: 22, color: C.ink });
      text("REVOKE CREATE ON SCHEMA public FROM PUBLIC;", 180, 885, { size: 24, fam: MONO, weight: 700, color: '#991b1b' });
      pill("PostgreSQL 15+", 1530, 885, C.red, kSec, 20);
    });
  }

  // 6. XULOSA
  function sXulosa(t) {
    heading("Xulosa va Qoidalar", t, L('L17').s - 0.4);

    const rules = [
      { tit: "Bitta ulanish = bitta baza", desc: "Boshqa bazaga to'g'ridan-to'g'ri murojaat yo'q. Bog'liq loyihalarni bitta bazadagi alohida sxemalarda saqlang.", col: C.blue },
      { tit: "template1 ni toza saqlang", desc: "Unga sinov jadvali qo'shmang. Zaxira nusxani toza tiklashda template0 dan foydalaning.", col: C.green },
      { tit: "search_path ga ishonmang", desc: "Muhim SQL kodlarida va ilovalarda malakali nom (sxema.jadval) yozing yoki search_path ni qat'iy belgilang.", col: C.orange },
      { tit: "pg_ prefiksidan qoching", desc: "O'z obyektlaringizni pg_ bilan nomlamang, chunki pg_catalog tizim sxemasi har doim birinchi qidiriladi.", col: C.purple }
    ];

    rules.forEach((r, i) => {
      const k = P(t, W('L17', 'demak') + i * 0.4, 0.6);
      withA(k, () => {
        const x = 140 + i * 420, y = 240;
        card(x, y, 380, 420, { fill: C.card, col: r.col, p: k });
        hand(r.tit, x + 30, y + 60, { size: 30, color: r.col, p: k });
        text(r.desc, x + 30, y + 160, { size: 23, color: C.ink, wrap: 320 });
      });
    });

    const kNext = P(t, W('L18', 'keyingi'), 0.6);
    withA(kNext, () => {
      card(140, 710, 1640, 190, { fill: '#eff6ff', col: C.blue, p: kNext });
      hand("Keyingi qismda: Jonli kod va psql terminali", 180, 775, { size: 38, color: C.blue, p: kNext });
      text("PostgreSQL 18 psql terminalida dokon bazasi, ombor va savdo sxemalari, search_path o'zgarishi va DROP SCHEMA CASCADE ni sinaymiz.", 180, 840, { size: 26, color: C.ink });
      pill("05-2 KOD", 1600, 775, C.blue, kNext, 24);
    });
  }

  function render(t) {
    bg();
    if (t < TM.scenes.ierarxiya.s) sIntro(t);
    else if (t < TM.scenes.shablonlar.s) sIerarxiya(t);
    else if (t < TM.scenes.sxemalar.s) sShablonlar(t);
    else if (t < TM.scenes.search_path.s) sSxemalar(t);
    else if (t < TM.scenes.xulosa.s) sSearchPath(t);
    else sXulosa(t);
  }

  function renderPoster() {
    bg();
    hand("5-bob: Baza, sxema va jadval", 960, 220, { size: 80, align: 'center', color: C.blue });
    hand("SQL ob'ektlar ierarxiyasi va qidiruv yo'li (search_path)", 960, 320, { size: 48, align: 'center', color: C.ink });

    card(140, 420, 500, 460, { fill: C.card, col: C.blue });
    hand("Klaster va Baza", 180, 480, { size: 34, color: C.blue });
    text("• Klaster: rollar, WAL\n• Bitta ulanish = bitta baza!\n• cross-database yo'q\n• CREATE DATABASE shablon", 180, 550, { size: 22, fam: MONO, color: C.ink });
    pill("Klaster -> Baza", 390, 810, C.blue, 1, 20);

    card(710, 420, 500, 460, { fill: C.card, col: C.green });
    hand("Sxema (Namespace)", 750, 480, { size: 34, color: C.green });
    text("• Mantiqiy papka\n• ombor.mahsulot\n• savdo.mahsulot\n• Bitta so'rovda JOIN!", 750, 550, { size: 22, fam: MONO, color: C.ink });
    pill("Sxema -> Jadval", 960, 810, C.green, 1, 20);

    card(1280, 420, 500, 460, { fill: C.card, col: C.orange });
    hand("search_path va Xavfsizlik", 1320, 480, { size: 34, color: C.orange });
    text("• \"$user\", public\n• pg_catalog (har doim birinchi)\n• REVOKE CREATE ON SCHEMA public\n• CASCADE bilan tozalash", 1320, 550, { size: 22, fam: MONO, color: C.ink });
    pill("search_path xavfsizligi", 1530, 810, C.orange, 1, 20);

    pill("PostgreSQL 18.6", 960, 970, C.blue, 1, 24);
  }

  window.render = render;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
})();
