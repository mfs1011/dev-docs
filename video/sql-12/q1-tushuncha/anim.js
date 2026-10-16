// SQL 12-bob 1-qism: "Tushuncha" — CREATE TABLE, DEFAULT va tizim ustunlari
(function () {
  const { L, W } = window.SY, TM = window.TM;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, table, bg, tw, MONO, UI, term } = K;

  const pill = (s, x, y, col, k = 1, size = 24) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 26;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center' });
  });

  // 1. INTRO
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand("12-bob", 960, 200, { size: 54, align: 'center', p: k, color: C.soft });
    hand("CREATE TABLE va DEFAULT", 960, 300, { size: 84, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Jadvallar Arxitekturasi, Sukut Qiymatlari va Yashirin Tizim Ustunlari", 960, 395, { size: 36, align: 'center', p: P(t, 1.2, 1.2) });
    marker(400, 430, 1120 * eio(P(t, 1.8, 0.7)), 16, C.hl, 1);

    const kBadges = P(t, W('L1', 'yaratish'), 0.8);
    withA(kBadges, () => {
      pill("1. Jadval: Ustunlar va Multito'plam", 440, 580, C.blue, kBadges, 22);
      pill("2. DEFAULT: Statik va Dinamik", 960, 580, C.green, kBadges, 22);
      pill("3. Tizim Ustunlari: ctid va xmin", 1480, 580, C.purple, kBadges, 22);
    });

    const kDesc = P(t, W('L1', 'tizim'), 0.8);
    withA(kDesc, () => {
      card(200, 680, 1520, 230, { fill: C.card, col: C.blue, p: kDesc });
      text("Relyatsion ma'lumotlar bazalarining poydevori — bu qat'iy tuzilishga ega jadvallardir:", 960, 740, { size: 26, weight: 700, align: 'center', color: C.ink, wrap: 1440 });
      text("Jadval qanday yaratiladi, DEFAULT qiymatlar qanday ishlaydi va PostgreSQL ostida", 960, 795, { size: 23, align: 'center', color: C.soft, wrap: 1440 });
      text("qanday yashirin tizim ustunlari (ctid, xmin, MVCC) mavjudligini batafsil o'rganamiz.", 960, 845, { size: 23, weight: 700, align: 'center', color: C.blue, wrap: 1440 });
    });
  }

  // 2. RELATIONAL MODEL
  function sRelModel(t) {
    heading("Relyatsion Model: Ustunlar va Qatorlar", t, TM.scenes.rel_model.s);

    const k1 = P(t, W('L2', 'qat\'iy'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 680, { fill: C.card, col: C.blue, p: k1 });
      hand("Jadval va Ustunlar Strukturasi", 180, 280, { size: 28, color: C.blue, p: k1 });

      card(180, 320, 700, 240, { fill: '#fff', col: C.soft, p: k1 });
      text("Ustunlar (Columns / Attributes):", 210, 360, { size: 21, weight: 700, color: C.blue, wrap: 640 });
      text("• Soni va tartibi jadval yaratilganda qat'iy belgilanadi.", 210, 405, { size: 19, color: C.ink, wrap: 640 });
      text("• Har bir ustun aniq nom va ma'lumot tipiga ega bo'ladi.", 210, 445, { size: 19, color: C.ink, wrap: 640 });
      text("• Ustun tipi maydonga qanday qiymat tushishini boshqaradi.", 210, 485, { size: 19, color: C.ink, wrap: 640 });

      card(180, 590, 700, 270, { fill: '#fff', col: C.soft, p: k1 });
      text("Qatorlar (Rows / Tuples):", 210, 630, { size: 21, weight: 700, color: C.blue, wrap: 640 });
      text("• Qatorlar soni o'zgaruvchan — hozir bazada qancha yozuv borligini bildiradi.", 210, 675, { size: 19, color: C.ink, wrap: 640 });
      text("• SQL qatorlar tartibini kafolatlamaydi!", 210, 730, { size: 19, weight: 700, color: C.red, wrap: 640 });
      text("  ORDER BY siz so'rov natijasi istalgan tartibda qaytishi mumkin.", 210, 770, { size: 18, color: C.soft, wrap: 640 });
    });

    const k2 = P(t, W('L2', 'dublikat'), 0.5);
    withA(k2, () => {
      card(1000, 220, 780, 680, { fill: C.card, col: C.purple, p: k2 });
      hand("Matematik Model va Dublikatlar", 1040, 280, { size: 28, color: C.purple, p: k2 });

      card(1040, 320, 700, 240, { fill: '#fff', col: C.soft, p: k2 });
      text("SQL dagi Jadvallar — Multito'plam (Multiset):", 1070, 360, { size: 21, weight: 700, color: C.purple, wrap: 640 });
      text("• SQL qatorlarga avtomatik unikal identifikator bermaydi.", 1070, 405, { size: 19, color: C.ink, wrap: 640 });
      text("• Cheklovlarsiz jadvalda bir xil qatorlar bir necha bor takrorlanishi mumkin.", 1070, 450, { size: 19, color: C.ink, wrap: 640 });
      text("• Bu matematik nazariya bo'yicha to'g'ri, ammo amaliyotda xavfli!", 1070, 505, { size: 19, weight: 700, color: C.red, wrap: 640 });

      card(1040, 590, 700, 270, { fill: '#fff', col: C.soft, p: k2 });
      text("Yechim: Birlamchi Kalit va Cheklovlar:", 1070, 630, { size: 21, weight: 700, color: C.green, wrap: 640 });
      text("• PRIMARY KEY: har bir qatorni yagona deb kafolatlaydi.", 1070, 675, { size: 19, color: C.ink, wrap: 640 });
      text("• UNIQUE: ustunda takrorlanmaslikni ta'minlaydi.", 1070, 715, { size: 19, color: C.ink, wrap: 640 });
      text("• CHECK: mantiqiy shartlarni tekshiradi (14-bobda ko'riladi).", 1070, 755, { size: 19, color: C.ink, wrap: 640 });
      text("  Haqiqiy loyihalarda har doim PRIMARY KEY bo'lishi shart!", 1070, 805, { size: 18, weight: 700, color: C.green, wrap: 640 });
    });
  }

  // 3. CREATE TABLE SYNTAX
  function sCreateTable(t) {
    heading("CREATE TABLE Sintaksisi va Nomlash Odatlari", t, TM.scenes.create_table.s);

    const k1 = P(t, W('L3', 'jadval'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 680, { fill: C.card, col: C.blue, p: k1 });
      hand("Asosiy CREATE TABLE Sintaksisi", 180, 280, { size: 28, color: C.blue, p: k1 });

      card(180, 320, 700, 360, { fill: '#fff', col: C.soft, p: k1 });
      text("-- Eng oddiy ko'rinish:", 210, 360, { size: 20, fam: MONO, color: C.soft });
      text("CREATE TABLE mahsulotlar (", 210, 405, { size: 22, fam: MONO, weight: 700, color: C.blue });
      text("    id         integer,", 210, 450, { size: 21, fam: MONO, color: C.ink });
      text("    nom        text,", 210, 490, { size: 21, fam: MONO, color: C.ink });
      text("    narx       numeric(12,2) DEFAULT 0,", 210, 530, { size: 21, fam: MONO, color: C.green });
      text("    soni       integer DEFAULT 1", 210, 570, { size: 21, fam: MONO, color: C.green });
      text(");", 210, 610, { size: 22, fam: MONO, weight: 700, color: C.blue });
      text("DROP TABLE mahsulotlar; -- Jadvalni butunlay o'chirish", 210, 655, { size: 18, fam: MONO, color: C.red });

      card(180, 705, 700, 160, { fill: '#fff', col: C.soft, p: k1 });
      text("Asosiy qoidalar:", 210, 745, { size: 21, weight: 700, color: C.blue, wrap: 640 });
      text("• Ustunlar vergul bilan ajratiladi va umumiy qavs ichiga olinadi.", 210, 785, { size: 19, color: C.ink, wrap: 640 });
      text("• Oxirgi ustundan keyin vergul qo'yilmaydi.", 210, 825, { size: 19, color: C.ink, wrap: 640 });
    });

    const k2 = P(t, W('L3', 'ko‘plik'), 0.5);
    withA(k2, () => {
      card(1000, 220, 780, 680, { fill: C.card, col: C.green, p: k2 });
      hand("Nomlash Odatlari va Cheklovlar", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 320, 700, 260, { fill: '#fff', col: C.soft, p: k2 });
      text("Izchil Nomlash (Naming Conventions):", 1070, 360, { size: 21, weight: 700, color: C.green, wrap: 640 });
      text("• Jadvallarni ko'plikda nomlash tavsiya etiladi:", 1070, 405, { size: 19, color: C.ink, wrap: 640 });
      text("  'mahsulotlar', 'foydalanuvchilar', 'buyurtmalar'.", 1070, 445, { size: 19, fam: MONO, color: C.green, wrap: 640 });
      text("• Kichik harflar va pastki chiziqdan (snake_case) foydalaning.", 1070, 490, { size: 19, color: C.ink, wrap: 640 });
      text("• Qo'shtirnoqli aralash harflardan ('UsersTable') saqlaning.", 1070, 530, { size: 19, color: C.soft, wrap: 640 });

      card(1040, 605, 700, 260, { fill: '#fff', col: C.soft, p: k2 });
      text("Ustunlar Soni Cheklovi:", 1070, 645, { size: 21, weight: 700, color: C.ink, wrap: 640 });
      text("• Postgres da jadval 250 dan 1600 tagacha ustunga ega bo'lishi mumkin.", 1070, 690, { size: 19, color: C.ink, wrap: 640 });
      text("• Ammo rasmiy hujjat 100+ ustunli jadvallarni 'shubhali dizayn' deydi.", 1070, 740, { size: 19, weight: 700, color: C.red, wrap: 640 });
      text("• Yechim: Ma'lumotlarni normalizatsiya qilib bog'liq jadvallarga ajrating.", 1070, 795, { size: 18, color: C.soft, wrap: 640 });
    });
  }

  // 4. DEFAULT VALUES
  function sDefaultVal(t) {
    heading("DEFAULT: Sukut Bo'yicha Qiymatlar Mantiqi", t, TM.scenes.default_val.s);

    const k1 = P(t, W('L4', 'difolt'), 0.5);
    withA(k1, () => {
      card(140, 220, 780, 680, { fill: C.card, col: C.blue, p: k1 });
      hand("DEFAULT Qoidalari va NULL", 180, 280, { size: 28, color: C.blue, p: k1 });

      card(180, 320, 700, 280, { fill: '#fff', col: C.soft, p: k1 });
      text("Qiymat berilmaganda nima yoziladi?", 210, 360, { size: 21, weight: 700, color: C.blue, wrap: 640 });
      text("• Agar DEFAULT ko'rsatilmagan bo'lsa, sukut qiymat — NULL!", 210, 405, { size: 19, weight: 700, color: C.red, wrap: 640 });
      text("• Bu mantiqiy, chunki kiritilmagan ma'lumot 'noma'lum' hisoblanadi.", 210, 450, { size: 19, color: C.ink, wrap: 640 });
      text("• INSERT da ustunni tashlab ketsangiz, unga DEFAULT qo'yiladi.", 210, 495, { size: 19, color: C.ink, wrap: 640 });
      text("• INSERT INTO mahsulotlar (id, nom) VALUES (1, 'Non');", 210, 545, { size: 18, fam: MONO, color: C.blue, wrap: 640 });

      card(180, 625, 700, 240, { fill: '#fff', col: C.soft, p: k1 });
      text("Aynan 'DEFAULT' Kalit So'zini So'rash:", 210, 665, { size: 21, weight: 700, color: C.ink, wrap: 640 });
      text("INSERT INTO mahsulotlar VALUES (2, 'Sut', DEFAULT, 5);", 210, 715, { size: 18, fam: MONO, color: C.green, wrap: 640 });
      text("Sukut qiymat nima ekanini bilmasangiz ham DEFAULT deb yozish mumkin.", 210, 770, { size: 19, color: C.soft, wrap: 640 });
      text("UPDATE mahsulotlar SET soni = DEFAULT WHERE id = 1;", 210, 815, { size: 18, fam: MONO, color: C.ink, wrap: 640 });
    });

    const k2 = P(t, W('L5', 'dinamik'), 0.5);
    withA(k2, () => {
      card(1000, 220, 780, 680, { fill: C.card, col: C.green, p: k2 });
      hand("Dinamik Ifodalar — Muhim Qoida!", 1040, 280, { size: 28, color: C.green, p: k2 });

      card(1040, 320, 700, 300, { fill: '#fff', col: C.soft, p: k2 });
      text("DEFAULT now() / CURRENT_TIMESTAMP:", 1070, 360, { size: 21, weight: 700, color: C.green, wrap: 640 });
      text("yaratilgan timestamptz DEFAULT now()", 1070, 405, { size: 20, fam: MONO, color: C.blue, wrap: 640 });
      text("• Eng katta yanglishish: 'bu vaqt baza ochilganda muzlab qoladi' deb o'ylash.", 1070, 455, { size: 19, color: C.soft, wrap: 640 });
      text("• Aslida: DEFAULT ifodasi har bir yangi qator yozilayotgan soniyada qayta hisoblanadi!", 1070, 515, { size: 19, weight: 700, color: C.green, wrap: 640 });
      text("• Shuning uchun bugun yozilgan qator bugungi vaqtni, ertaga yozilgani ertangi vaqtni oladi.", 1070, 580, { size: 18, color: C.ink, wrap: 640 });

      card(1040, 645, 700, 220, { fill: '#fff', col: C.soft, p: k2 });
      text("Boshqa Dinamik Misollar:", 1070, 685, { size: 21, weight: 700, color: C.purple, wrap: 640 });
      text("• DEFAULT nextval('ketma_ketlik') — avtomatik raqam (serial)", 1070, 730, { size: 18, fam: MONO, color: C.ink, wrap: 640 });
      text("• DEFAULT gen_random_uuid() — har qatorga yangi UUID v4", 1070, 770, { size: 18, fam: MONO, color: C.ink, wrap: 640 });
      text("• Har bir qator o'zining yagona dinamik qiymatini oladi.", 1070, 815, { size: 18, color: C.soft, wrap: 640 });
    });
  }

  // 5. SYSTEM COLUMNS
  function sSysCols(t) {
    heading("PostgreSQL Yashirin Tizim Ustunlari", t, TM.scenes.sys_cols.s);

    const k1 = P(t, W('L6', 'yashirin'), 0.5);
    withA(k1, () => {
      card(140, 220, 1640, 680, { fill: C.card, col: C.purple, p: k1 });
      hand("Har Bir Jadvaldagi Yashirin Tizim Ustunlari (System Columns)", 180, 280, { size: 28, color: C.purple, p: k1 });

      const cols = [
        { name: "ctid", type: "tid", desc: "Qatorning diskdagi jismoniy koordinatasi: (sahifa, joy). DIQQAT: UPDATE bo'lganda o'zgaradi!" },
        { name: "xmin", type: "xid", desc: "Qatorning ushbu versiyasini yozgan tranzaksiya raqami. PostgreSQL MVCC arxitekturasining asosi." },
        { name: "xmax", type: "xid", desc: "Qatorni o'chirgan yoki yangilagan tranzaksiya raqami (yoki faol bo'lsa 0)." },
        { name: "tableoid", type: "oid", desc: "Ushbu qator tegishli bo'lgan jadvalning ichki OID raqami (partitsiyalashda juda foydali)." },
        { name: "cmin, cmax", type: "cid", desc: "Bitta tranzaksiya ichidagi buyruqlar ketma-ketlik raqami." }
      ];

      cols.forEach((col, idx) => {
        const y = 330 + idx * 95;
        card(180, y, 1560, 80, { fill: '#fff', col: C.soft, p: k1 });
        pill(col.name, 260, y + 40, C.purple, k1, 20);
        pill(col.type, 380, y + 40, C.soft, k1, 16);
        text(col.desc, 460, y + 40, { size: 20, color: C.ink, wrap: 1240 });
      });

      card(180, 815, 1560, 65, { fill: C.hl, col: C.red, p: k1 });
      text("OGOHLANTIRISH: Tizim ustunlari nomini o'z ustuningizga berib bo'lmaydi (CREATE TABLE xato (ctid int) -> ERROR)!", 960, 850, { size: 19, weight: 700, align: 'center', color: C.red, wrap: 1500 });
    });
  }

  // 6. SPECIAL TABLES: TEMPORARY, UNLOGGED, LIKE
  function sSpecialTables(t) {
    heading("Maxsus Jadvallar: TEMPORARY, UNLOGGED va LIKE", t, TM.scenes.special_tables.s);

    const k1 = P(t, W('L7', 'temporari'), 0.5);
    withA(k1, () => {
      // 3 cards side by side
      card(140, 220, 500, 680, { fill: C.card, col: C.blue, p: k1 });
      hand("TEMPORARY (TEMP)", 170, 280, { size: 28, color: C.blue, p: k1 });
      card(170, 320, 440, 550, { fill: '#fff', col: C.soft, p: k1 });
      text("Vaqtinchalik Jadvallar:", 190, 360, { size: 20, weight: 700, color: C.blue, wrap: 400 });
      text("• Seans yoki tranzaksiya tugaganda avtomatik o'chiriladi.", 190, 410, { size: 18, color: C.ink, wrap: 400 });
      text("• Maxsus 'pg_temp_...' sxemasida joylashadi va doimiy jadvalni yashirishi mumkin.", 190, 475, { size: 18, color: C.ink, wrap: 400 });
      text("• Autovacuum bularga yetib bormaydi, qo'lda ANALYZE qilish tavsiya etiladi.", 190, 565, { size: 18, color: C.soft, wrap: 400 });
      text("CREATE TEMP TABLE t (x int);", 190, 680, { size: 17, fam: MONO, color: C.blue, wrap: 400 });

      card(710, 220, 500, 680, { fill: C.card, col: C.red, p: k1 });
      hand("UNLOGGED", 740, 280, { size: 28, color: C.red, p: k1 });
      card(740, 320, 440, 550, { fill: '#fff', col: C.soft, p: k1 });
      text("WAL-siz Tezkor Jadvallar:", 760, 360, { size: 20, weight: 700, color: C.red, wrap: 400 });
      text("• Ma'lumotlar WAL (Write-Ahead Log) jurnaliga yozilmaydi.", 760, 410, { size: 18, color: C.ink, wrap: 400 });
      text("• Natijada oddiy jadvallarga nisbatan ancha tez ishlaydi.", 760, 475, { size: 18, color: C.ink, wrap: 400 });
      text("• Katta xavf: Server to'xtab qolsa (crash), jadval butunlay bo'shatiladi!", 760, 550, { size: 18, weight: 700, color: C.red, wrap: 400 });
      text("CREATE UNLOGGED TABLE kesh (k text, v text);", 760, 680, { size: 16, fam: MONO, color: C.red, wrap: 400 });

      const k2 = P(t, W('L8', 'layk'), 0.5);
      withA(k2, () => {
        card(1280, 220, 500, 680, { fill: C.card, col: C.green, p: k2 });
        hand("LIKE vs AS SELECT", 1310, 280, { size: 28, color: C.green, p: k2 });
        card(1310, 320, 440, 550, { fill: '#fff', col: C.soft, p: k2 });
        text("Nusxa Yaratish Usullari:", 1330, 360, { size: 20, weight: 700, color: C.green, wrap: 400 });
        text("• CREATE TABLE n (LIKE m): Faqat ustun nomlari va tiplarini ko'chiradi.", 1330, 410, { size: 18, color: C.ink, wrap: 400 });
        text("• INCLUDING ALL: DEFAULT va indekslarni ham qo'shadi.", 1330, 485, { size: 18, color: C.green, wrap: 400 });
        text("• CREATE TABLE n AS SELECT: So'rov ma'lumotlari bilan bir martalik nusxa oladi.", 1330, 560, { size: 18, color: C.ink, wrap: 400 });
        text("  Ammo DEFAULT va cheklovlar ko'chmaydi!", 1330, 645, { size: 17, weight: 700, color: C.red, wrap: 400 });
      });
    });
  }

  // 7. XULOSA
  function sOutro(t) {
    heading("Xulosa: Jadvallarni To'g'ri Loyihalash", t, TM.scenes.xulosa.s);

    const k = P(t, TM.scenes.xulosa.s + 0.3, 0.8);
    withA(k, () => {
      card(140, 220, 500, 560, { fill: C.card, col: C.blue, p: k });
      hand("Jadval Tuzilishi", 170, 280, { size: 30, color: C.blue, p: k });
      card(170, 310, 440, 440, { fill: '#fff', col: C.soft, p: k });
      text("• Qat'iy ustunlar va tiplar.", 190, 360, { size: 19, weight: 700, color: C.blue, wrap: 400 });
      text("• Tartibsizlikni unutmang — har doim ORDER BY ishlating.", 190, 420, { size: 18, color: C.ink, wrap: 400 });
      text("• Dublikatlardan saqlanish uchun har bir jadvalda PRIMARY KEY bo'lsin.", 190, 500, { size: 18, color: C.ink, wrap: 400 });

      card(710, 220, 500, 560, { fill: C.card, col: C.green, p: k });
      hand("DEFAULT Qiymatlari", 740, 280, { size: 30, color: C.green, p: k });
      card(740, 310, 440, 440, { fill: '#fff', col: C.soft, p: k });
      text("• Sukut bo'yicha qiymat — NULL.", 760, 360, { size: 19, weight: 700, color: C.green, wrap: 400 });
      text("• DEFAULT now() har yangi qatorda qayta hisoblanadi.", 760, 420, { size: 18, color: C.ink, wrap: 400 });
      text("• INSERT da aniq 'DEFAULT' so'zidan foydalanish mumkin.", 760, 500, { size: 18, color: C.ink, wrap: 400 });

      card(1280, 220, 500, 560, { fill: C.card, col: C.purple, p: k });
      hand("Tizim va Maxsuslik", 1310, 280, { size: 30, color: C.purple, p: k });
      card(1310, 310, 440, 440, { fill: '#fff', col: C.soft, p: k });
      text("• ctid jismoniy joy, UPDATE da o'zgaradi.", 1330, 360, { size: 19, weight: 700, color: C.purple, wrap: 400 });
      text("• xmin qatorning MVCC tranzaksiya versiyasi.", 1330, 420, { size: 18, color: C.ink, wrap: 400 });
      text("• Kesh uchun UNLOGGED, seans uchun TEMP jadvallardan foydalaning.", 1330, 500, { size: 18, color: C.ink, wrap: 400 });

      const kBanner = P(t, W('L9', 'loyihalash'), 0.6);
      withA(kBanner, () => {
        card(140, 810, 1640, 160, { fill: C.card, col: C.green, p: kBanner });
        text("Jadval strukturasini to‘g‘ri loyihalash va DEFAULT qiymatlarini oqilona tanlash ma'lumotlar yaxlitligining garovidir.", 960, 895, { size: 26, weight: 700, align: 'center', color: C.green, wrap: 1560 });
      });
    });
  }

  function draw(t) {
    bg();
    const sc = TM.scenes;
    if (t < sc.rel_model.s) sIntro(t);
    else if (t < sc.create_table.s) sRelModel(t);
    else if (t < sc.default_val.s) sCreateTable(t);
    else if (t < sc.sys_cols.s) sDefaultVal(t);
    else if (t < sc.special_tables.s) sSysCols(t);
    else if (t < sc.xulosa.s) sSpecialTables(t);
    else sOutro(t);
  }

  function renderPoster() {
    bg();
    hand("12-bob: Tushuncha", 960, 160, { size: 48, align: 'center', p: 1, color: C.soft });
    hand("CREATE TABLE va DEFAULT", 960, 245, { size: 76, align: 'center', p: 1, color: C.blue });
    hand("Relyatsion Jadvallar Arxitekturasi va Yashirin Tizim Ustunlari", 960, 325, { size: 32, align: 'center', p: 1 });
    marker(400, 355, 1120, 14, C.hl, 1);

    pill("1. Relyatsion Multito'plam", 440, 430, C.blue, 1, 22);
    pill("2. DEFAULT & now() Dinamikasi", 960, 430, C.green, 1, 22);
    pill("3. Tizim Ustunlari: ctid & xmin", 1480, 430, C.purple, 1, 22);

    card(140, 490, 780, 220, { fill: C.card, col: C.blue, p: 1 });
    hand("CREATE TABLE va Nomlash", 170, 540, { size: 26, color: C.blue, p: 1 });
    text("• Ustunlar qat'iy tartib va tipga ega bo'ladi.", 170, 585, { size: 19, color: C.ink, wrap: 720 });
    text("• Jadvallarni ko'plik shaklida nomlash tavsiya etiladi (mahsulotlar).", 170, 625, { size: 19, color: C.ink, wrap: 720 });
    text("• Birlamchi kalitsiz dublikat qatorlar paydo bo'lishi mumkin.", 170, 665, { size: 19, color: C.soft, wrap: 720 });

    card(1000, 490, 780, 220, { fill: C.card, col: C.green, p: 1 });
    hand("DEFAULT Qiymatlar Mantiqi", 1030, 540, { size: 26, color: C.green, p: 1 });
    text("• DEFAULT berilmagan ustunga sukutda NULL yoziladi.", 1030, 585, { size: 19, color: C.ink, wrap: 720 });
    text("• now() kabi ifodalar jadval ochilganda emas, har qatorda hisoblanadi.", 1030, 625, { size: 19, color: C.green, wrap: 720 });
    text("• INSERT da aynan DEFAULT kalit so'zini ko'rsatish mumkin.", 1030, 665, { size: 19, color: C.soft, wrap: 720 });

    card(140, 740, 780, 220, { fill: C.card, col: C.purple, p: 1 });
    hand("Yashirin Tizim Ustunlari", 170, 790, { size: 26, color: C.purple, p: 1 });
    text("• ctid — qatorning jismoniy joylashuvi (UPDATE da o'zgaradi!).", 170, 835, { size: 19, color: C.purple, wrap: 720 });
    text("• xmin — qator versiyasining tranzaksiya raqami (MVCC).", 170, 875, { size: 19, color: C.ink, wrap: 720 });
    text("• O'z ustuningizga tizim ustuni nomini berib bo'lmaydi.", 170, 915, { size: 19, color: C.soft, wrap: 720 });

    card(1000, 740, 780, 220, { fill: C.card, col: C.red, p: 1 });
    hand("Maxsus Jadvallar", 1030, 790, { size: 26, color: C.red, p: 1 });
    text("• TEMPORARY — seans tugaganda o'chib ketadi.", 1030, 835, { size: 19, color: C.ink, wrap: 720 });
    text("• UNLOGGED — WAL jurnalisiz ishlaydi, o'ta tezkor ammo crash-unsafe.", 1030, 875, { size: 19, color: C.red, wrap: 720 });
    text("• LIKE m INCLUDING ALL — sxemani to'liq nusxalaydi.", 1030, 915, { size: 19, color: C.soft, wrap: 720 });
  }

  window.render = draw;
  window.renderFrame = draw;
  window.renderPoster = renderPoster;
  window.DURATION = TM.end;
  window.TOTAL_DURATION = TM.end;
})();
