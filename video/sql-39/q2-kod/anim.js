// SQL 39-bob 2-qism: "Kod" — Birlamchi kalitni tanlash
(function () {
  const { L, W } = window.SY, TM = window.TM, TTY = window.TTY;
  const ctx = document.getElementById('c').getContext('2d');
  const K = window.SQLKIT(ctx);
  const { C, P, eo, eio, eback, lerp, clamp, withA, text, hand, sline, srect, sellipse, arrow, marker, card, heading, bg, tw, MONO, UI } = K;

  const pill = (s, x, y, col, k = 1, size = 20) => withA(k, () => {
    const w = tw(s, size, 700, MONO) + 24;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.8, w, size * 1.6, size * 0.8); ctx.fill(); ctx.restore();
    text(s, x, y + 1, { size, weight: 700, fam: MONO, color: '#fff', align: 'center', ignoreCardCheck: true });
  });

  // 1. POSTGRESQL INDEKS HAJMI (0 -> 20.51s)
  function sPgIndeks(t) {
    const k = P(t, 0.3, 1.0);
    hand("39-bob. Amaliy Kod va Tajribalar", 960, 130, { size: 50, align: 'center', p: k, color: C.soft });
    hand("PostgreSQL 18.6: B-Tree Kalit Indekslari O'lchami", 960, 220, { size: 66, align: 'center', p: P(t, 0.6, 1.2), color: C.blue });
    hand("Bir xil 100 000 qatorda BIGINT vs UUID v7 vs UUID v4 indekslari", 960, 305, { size: 28, align: 'center', p: P(t, 1.2, 1.2) });
    marker(280, 335, 1360 * eio(P(t, 1.8, 0.7)), 14, C.hl, 1);

    const kBox = P(t, 2.2, 0.8);
    withA(kBox, () => {
      // Chap: SQL jadvallar va insert
      card(140, 380, 800, 420, { fill: C.card, col: C.blue, p: kBox });
      text("PostgreSQL 18.6 da Kalit Turlari:", 180, 430, { size: 24, weight: 700, color: C.blue, fam: UI });

      text("CREATE TABLE k_bigint (", 180, 480, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY);", 200, 515, { size: 19, fam: MONO, color: C.blue });
      text("CREATE TABLE k_v7 (", 180, 560, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("  id uuid DEFAULT uuidv7() PRIMARY KEY);", 200, 595, { size: 19, fam: MONO, color: C.green });
      text("CREATE TABLE k_v4 (", 180, 640, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("  id uuid DEFAULT uuidv4() PRIMARY KEY);", 200, 675, { size: 19, fam: MONO, color: C.red });

      sline(180, 715, 900, 715, { col: C.pencil, w: 1.5 });
      text("-- Har biriga 100 000 tadan qator qo'shildi", 180, 755, { size: 19, color: C.soft, fam: MONO });
      pill("100 000 qator / generate_series", 540, 775, C.blue, kBox, 16);

      // O'ng: TTY Natijasi
      const kRes = P(t, 7.5, 0.8);
      withA(kRes, () => {
        card(980, 380, 800, 420, { fill: '#1e1e2e', col: C.purple, p: kRes });
        text("Terminal: pg_relation_size(pkey)", 1020, 430, { size: 23, weight: 700, color: '#cdd6f4', fam: MONO });
        sline(1020, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("    relname    | indeks  | kalit bayti", 1020, 500, { size: 21, weight: 700, fam: MONO, color: '#89b4fa' });
        sline(1020, 520, 1740, 520, { col: '#45475a', w: 1 });
        text(" k_bigint_pkey | 2208 kB | 8 bayt", 1020, 560, { size: 21, fam: MONO, color: '#a6e3a1' });
        text(" k_v7_pkey     | 3104 kB | 16 bayt (tartibli)", 1020, 615, { size: 21, fam: MONO, color: '#f9e2af' });
        text(" k_v4_pkey     | 4376 kB | 16 bayt (tasodifiy)", 1020, 670, { size: 21, weight: 700, fam: MONO, color: '#f38ba8' });

        sline(1020, 710, 1740, 710, { col: '#45475a', w: 1 });
        text("v7_timestamp: 2026-10-20 09:42:19.772+05", 1020, 755, { size: 19, fam: MONO, color: '#cdd6f4' });
      });

      // Pastki izoh kartasi
      const kFoot = P(t, 13.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#fff8f6', col: C.red, p: kFoot });
        text("Nega bir xil 16 baytli UUID v4 indeksi v7 ga nisbatan 41% katta?", 180, 875, { size: 23, weight: 700, color: C.red, fam: UI });
        text("UUID v4 tasodifiy qiymat bo'lgani sababli B-tree daraxtining ixtiyoriy sahifalariga tushadi va ularni bo'lib", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("yuboradi (Page Splits). UUID v7 esa vaqt tartibida bo'lib, daraxt barglarini ixcham to'ldiradi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 2. MYSQL IKKILAMCHI INDEKS (20.51 -> 37.55s)
  function sMySqlIkkilamchi(t) {
    heading("MySQL 9.7.2 InnoDB: Ikkilamchi Indekslar Hajmi", t, TM.scenes.mysql_ikkilamchi.s);

    const kCards = P(t, TM.scenes.mysql_ikkilamchi.s + 0.3, 0.8);
    withA(kCards, () => {
      // Chap: SQL jadvallar
      card(140, 380, 800, 420, { fill: C.card, col: C.orange, p: kCards });
      text("InnoDB Jadvallari: Ikkilamchi KEY (x):", 180, 430, { size: 24, weight: 700, color: C.orange, fam: UI });

      text("CREATE TABLE k_int  (", 180, 480, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("  id int AUTO_INCREMENT PRIMARY KEY, x int, KEY (x));", 200, 515, { size: 19, fam: MONO, color: C.blue });
      text("CREATE TABLE k_bin  (", 180, 560, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("  id binary(16) PRIMARY KEY, x int, KEY (x));", 200, 595, { size: 19, fam: MONO, color: C.green });
      text("CREATE TABLE k_char (", 180, 640, { size: 20, weight: 600, fam: MONO, color: C.ink });
      text("  id char(36)   PRIMARY KEY, x int, KEY (x));", 200, 675, { size: 19, fam: MONO, color: C.red });

      sline(180, 715, 900, 715, { col: C.pencil, w: 1.5 });
      text("-- Har birida x ustunidagi ikkilamchi indeks bir xil", 180, 755, { size: 19, color: C.soft, fam: MONO });
      pill("50 000 qator / CTE rekursiya", 540, 775, C.orange, kCards, 16);

      // O'ng: TTY Natijasi
      const kRes = P(t, 26.5, 0.8);
      withA(kRes, () => {
        card(980, 380, 800, 420, { fill: '#1e1e2e', col: C.blue, p: kRes });
        text("Terminal: information_schema.tables", 1020, 430, { size: 23, weight: 700, color: '#cdd6f4', fam: MONO });
        sline(1020, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("TABLE_NAME | data_mb | ikkilamchi_mb", 1020, 500, { size: 22, weight: 700, fam: MONO, color: '#89b4fa' });
        sline(1020, 520, 1740, 520, { col: '#45475a', w: 1 });
        text("k_int      | 1.5 MB  | 1.5 MB  (standart int)", 1020, 565, { size: 21, fam: MONO, color: '#a6e3a1' });
        text("k_bin      | 2.5 MB  | 1.5 MB  (binary(16))", 1020, 625, { size: 21, fam: MONO, color: '#f9e2af' });
        text("k_char     | 3.5 MB  | 2.5 MB  (+66% shishish!)", 1020, 685, { size: 21, weight: 700, fam: MONO, color: '#f38ba8' });

        sline(1020, 725, 1740, 725, { col: '#45475a', w: 1 });
        text("200 000 qatorda: int (3.5 MB) -> char (9.6 MB!)", 1020, 765, { size: 19, fam: MONO, color: '#cdd6f4' });
      });

      // Pastki taqqoslash kartasi
      const kFoot = P(t, 31.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#fff8f6', col: C.orange, p: kFoot });
        text("InnoDB qoidasi: Ikkilamchi indeks har bir qatorda Birlamchi Kalit nusxasini saqlaydi!", 180, 875, { size: 23, weight: 700, color: C.orange, fam: UI });
        text("Agar jadvalda 4 ta ikkilamchi indeks bo'lsa va char(36) ishlatilsa, har bir yangi qator 144 bayt qo'shimcha", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("xotira talab qiladi. MySQL'da UUID zarur bo'lsa, uni BINARY(16) ko'rinishida saqlang.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 3. SQLITE WITHOUT ROWID (37.55 -> 52.81s)
  function sSqliteWithoutRowid(t) {
    heading("SQLite 3.54.0: WITHOUT ROWID Sintaksisi", t, TM.scenes.sqlite_without_rowid.s);

    const kSqlite = P(t, TM.scenes.sqlite_without_rowid.s + 0.3, 0.8);
    withA(kSqlite, () => {
      // Chap: WITHOUT ROWID
      card(140, 380, 800, 420, { fill: C.card, col: C.green, p: kSqlite });
      text("WITHOUT ROWID Jadvali:", 180, 430, { size: 24, weight: 700, color: C.green, fam: UI });

      text("CREATE TABLE wordcount (", 180, 480, { size: 21, weight: 600, fam: MONO, color: C.ink });
      text("  word TEXT PRIMARY KEY,", 200, 520, { size: 21, fam: MONO, color: C.blue });
      text("  cnt  INTEGER", 200, 560, { size: 21, fam: MONO, color: C.blue });
      text(") WITHOUT ROWID;", 180, 600, { size: 21, weight: 700, fam: MONO, color: C.green });

      text("INSERT INTO wordcount VALUES ('salom', 3);", 180, 655, { size: 20, fam: MONO, color: C.ink });
      text("SELECT rowid, word FROM wordcount;", 180, 700, { size: 20, weight: 700, fam: MONO, color: C.red });

      sline(180, 735, 900, 735, { col: C.pencil, w: 1.5 });
      pill("Jadval to'g'ridan-to'g'ri 'word' bo'yicha klasterlanadi", 540, 775, C.green, kSqlite, 16);

      // O'ng: Natijalar va Xatolik
      const kRes = P(t, 43.0, 0.8);
      withA(kRes, () => {
        card(980, 380, 800, 420, { fill: '#1e1e2e', col: C.red, p: kRes });
        text("Terminal: rowid So'rovi Natijasi", 1020, 430, { size: 23, weight: 700, color: '#cdd6f4', fam: MONO });
        sline(1020, 455, 1740, 455, { col: '#45475a', w: 1.5 });

        text("Parse error: no such column: rowid", 1020, 505, { size: 22, weight: 700, fam: MONO, color: '#f38ba8' });
        text("  SELECT rowid, word FROM wordcount;", 1020, 545, { size: 20, fam: MONO, color: '#a6adc8' });
        text("         ^--- error here", 1020, 580, { size: 20, fam: MONO, color: '#f38ba8' });

        sline(1020, 620, 1740, 620, { col: '#45475a', w: 1 });
        text("Oddiy jadvalda (Taqqoslash):", 1020, 660, { size: 20, weight: 600, color: '#89b4fa', fam: UI });
        text("SELECT rowid, word FROM oddiy;  -->  rowid: 1, word: 'salom'", 1020, 700, { size: 19, fam: MONO, color: '#a6e3a1' });
        text("Oddiy jadvalda ikkita B-tree: rowid daraxti + word UNIQUE indeksi.", 1020, 755, { size: 18, color: '#cdd6f4', fam: UI });
      });

      // Pastki izoh kartasi
      const kFoot = P(t, 47.5, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#f6f9fc', col: C.blue, p: kFoot });
        text("WITHOUT ROWID afzalligi qachon seziladi?", 180, 875, { size: 23, weight: 700, color: C.blue, fam: UI });
        text("Matnli yoki ko'p ustunli kompozit kalitli, qatorlari ixcham jadvallarda alohida rowid B-tree daraxtini", 180, 920, { size: 20, color: C.ink, fam: UI });
        text("saqlashdan qutqaradi va qidiruvni to'g'ridan-to'g'ri kalit bo'yicha tezlashtiradi.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  // 4. SQLITE CHEKLOVLAR (52.81 -> 70.36s)
  function sSqliteCheklovlar(t) {
    heading("SQLite: WITHOUT ROWID Cheklovlari va Qat'iy Qoidalar", t, TM.scenes.sqlite_cheklovlar.s);

    const kRules = P(t, TM.scenes.sqlite_cheklovlar.s + 0.3, 0.8);
    withA(kRules, () => {
      // Chap: Xatolik keltirib chiqaruvchi holatlar
      card(140, 380, 800, 420, { fill: C.card, col: C.red, p: kRules });
      text("Taqiqlangan va Xato Sintaksislar:", 180, 430, { size: 24, weight: 700, color: C.red, fam: UI });

      text("1. PRIMARY KEY majburiy:", 180, 480, { size: 20, weight: 700, fam: UI, color: C.ink });
      text("   CREATE TABLE xpk (a INT) WITHOUT ROWID;", 180, 515, { size: 19, fam: MONO, color: C.red });
      text("   --> PRIMARY KEY missing on table xpk", 220, 545, { size: 18, fam: MONO, color: C.soft });

      text("2. AUTOINCREMENT taqiqlangan:", 180, 595, { size: 20, weight: 700, fam: UI, color: C.ink });
      text("   CREATE TABLE xai (id INT PK AUTOINCREMENT) WITHOUT ROWID;", 180, 630, { size: 19, fam: MONO, color: C.red });
      text("   --> AUTOINCREMENT not allowed", 220, 660, { size: 18, fam: MONO, color: C.soft });

      sline(180, 700, 900, 700, { col: C.pencil, w: 1.5 });
      pill("Klasterli indeks uchun qat'iy cheklovlar", 540, 765, C.red, kRules, 16);

      // O'ng: NOT NULL va avto-to'ldirish yo'qligi
      const kNotNull = P(t, 59.5, 0.8);
      withA(kNotNull, () => {
        card(980, 380, 800, 420, { fill: C.card, col: C.orange, p: kNotNull });
        text("NOT NULL Cheklovi va Avto-to'ldirish:", 1020, 430, { size: 24, weight: 700, color: C.orange, fam: UI });

        text("CREATE TABLE wi (id INT PRIMARY KEY, a) WITHOUT ROWID;", 1020, 485, { size: 18, fam: MONO, color: C.ink });
        text("INSERT INTO wi (a) VALUES ('x');", 1020, 530, { size: 19, weight: 700, fam: MONO, color: C.red });
        text("--> Error: NOT NULL constraint failed: wi.id", 1020, 570, { size: 19, weight: 700, fam: MONO, color: C.red });

        sline(1020, 610, 1740, 610, { col: C.pencil, w: 1.5 });
        text("Oddiy rowid jadvalida esa:", 1020, 650, { size: 20, weight: 600, color: C.blue, fam: UI });
        text("CREATE TABLE ri (id INT PRIMARY KEY, a);", 1020, 690, { size: 19, fam: MONO, color: C.ink });
        text("INSERT INTO ri (a) VALUES ('x'); --> id = 1 (Avtomatik!)", 1020, 730, { size: 19, fam: MONO, color: C.green });
        pill("WITHOUT ROWID da avtomatik ID yo'q", 1380, 765, C.orange, kNotNull, 16);
      });

      // Pastki xulosa kartasi
      const kFoot = P(t, 64.0, 0.8);
      withA(kFoot, () => {
        card(140, 830, 1640, 170, { fill: '#fbfbfb', col: C.green, p: kFoot });
        text("SQLite Hujjatining Rasmiy Tavsiyasi:", 180, 875, { size: 23, weight: 700, color: C.green, fam: UI });
        text("Bitta butun sonli kalitli jadvallarga WITHOUT ROWID ishlatmang — oddiy INTEGER PRIMARY KEY tezroq ishlaydi.", 180, 920, { size: 20, weight: 600, color: C.ink, fam: UI });
        text("WITHOUT ROWID ni faqat kompozit kalitli oraliq jadvallarda (masalan order_items) sinab ko'ring.", 180, 960, { size: 20, color: C.soft, fam: UI });
      });
    });
  }

  window.renderFrame = function (t) {
    bg();
    if (t < TM.scenes.mysql_ikkilamchi.s) {
      sPgIndeks(t);
    } else if (t < TM.scenes.sqlite_without_rowid.s) {
      sMySqlIkkilamchi(t);
    } else if (t < TM.scenes.sqlite_cheklovlar.s) {
      sSqliteWithoutRowid(t);
    } else {
      sSqliteCheklovlar(t);
    }
  };
  window.drawFrame = window.renderFrame;
  window.render = window.renderFrame;
  window.renderPoster = function () {
    window.renderFrame(5.0);
  };
})();
