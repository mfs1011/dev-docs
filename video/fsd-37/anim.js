// FSD 37-bob videosi: "Amaliy loyiha: do'kon frontendi" — "Bozor" do'koni arxitekturasi bosqichlari
(function () {
  const { L, W } = window.SY;
  const TM = window.TM;
  const cv = document.getElementById('c'), ctx = cv.getContext('2d');
  const SW = 1920, SH = 1080;
  const UI = '"Avenir Next", "Helvetica Neue", Arial, sans-serif', MONO = 'Menlo, Monaco, monospace';
  const C = {
    ink: '#1f2a44',
    soft: '#5b6785',
    green: '#16a34a',
    red: '#e11d48',
    white: '#ffffff',
    amber: '#f59e0b',
    blue: '#3b5bdb',
    purple: '#8b5cf6',
    teal: '#0d9488',
    cyan: '#0891b2'
  };

  // Qatlamlar (pastdan yuqoriga)
  const LAYERS = [
    { id: 'shared', col: '#94a3b8', uz: 'shared/: api klient, routes, button' },
    { id: 'entities', col: '#fb7185', uz: 'entities/: product, cart, order' },
    { id: 'features', col: '#fbbf24', uz: 'features/: add-to-cart, search' },
    { id: 'widgets', col: '#34d399', uz: 'widgets/: header, product-grid' },
    { id: 'pages', col: '#60a5fa', uz: 'pages/: catalog, product, cart, admin-order/*' },
    { id: 'app', col: '#a78bfa', uz: 'app/: router, main-layout, providers' },
  ];
  const BW = 8, BD = 5, FH = 0.9, FS = 1.25, U = 60;

  // ---------- yordamchilar ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const P = (t, a, d) => clamp((t - a) / d);
  const lerp = (a, b, k) => a + (b - a) * k;
  const eo = (k) => 1 - Math.pow(1 - k, 3);
  const eio = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const rnd = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const hex = (c) => {
    if (c.startsWith('rgb')) return c.match(/\d+/g).slice(0, 3).map(Number);
    const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const shade = (c, k) => { const v = hex(c).map((x) => Math.round(k > 0 ? x + (255 - x) * k : x * (1 + k))); return `rgb(${v.join(',')})`; };
  const font = (s, w = 600, f = UI) => `${w} ${s}px ${f}`;
  function withA(a, fn) { if (a <= 0.002) return; ctx.save(); ctx.globalAlpha *= Math.min(1, a); fn(); ctx.restore(); }
  function tw(s, size, w = 600, f = UI) { ctx.font = font(size, w, f); return ctx.measureText(s).width; }
  function text(s, x, y, o = {}) { ctx.font = font(o.size || 30, o.weight || 600, o.fam || UI); ctx.fillStyle = o.color || C.ink; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
  function pill(s, x, y, col, o = {}) {
    const size = o.size || 26, w = tw(s, size, 700, o.mono ? MONO : UI) + 32, h = size + 18;
    const x0 = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
    ctx.save(); ctx.shadowColor = 'rgba(30,40,70,0.18)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
    ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x0, y - h / 2, w, h, h / 2); ctx.fill(); ctx.restore();
    text(s, x0 + w / 2, y + 1, { size, weight: 700, fam: o.mono ? MONO : UI, color: o.fg || '#fff', align: 'center' });
    return w;
  }
  function kfv(t, frames, dur = 1.2) {
    let v = frames[0][1];
    for (let i = 1; i < frames.length; i++) { const [at, nv] = frames[i]; if (t < at) break; const k = eio(P(t, at, dur)); v = Array.isArray(v) ? v.map((x, j) => lerp(x, nv[j], k)) : lerp(v, nv, k); }
    return v;
  }

  // ---------- kamera va proyeksiya ----------
  let cam = { tx: 90, ty: -30, z: 1 };
  const proj = (x, y, z) => [((x - y) * U - cam.tx) * cam.z + SW / 2, (((x + y) * U) / 2 - z * U - cam.ty) * cam.z + SH / 2];
  function poly(pts, fill, stroke, lw = 2) {
    ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw * Math.min(1.6, cam.z); ctx.lineJoin = 'round'; ctx.stroke(); }
  }

  function box(x, y, z, w, d, h, col, o = {}) {
    withA(o.a == null ? 1 : o.a, () => {
      const p = (a, b, c) => proj(a, b, c);
      const st = o.stroke || shade(col, -0.35);
      if (o.dashed) ctx.setLineDash([10, 8]);
      if (o.shadow !== false && !o.dashed) withA(0.18, () => poly([p(x + 0.25, y + 0.25, 0), p(x + w + 0.25, y + 0.25, 0), p(x + w + 0.25, y + d + 0.25, 0), p(x + 0.25, y + d + 0.25, 0)], '#1f2a44'));
      poly([p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)], o.dashed ? null : shade(col, -0.05), st);
      poly([p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)], o.dashed ? null : shade(col, -0.2), st);
      poly([p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)], o.dashed ? null : shade(col, 0.28), st);
      ctx.setLineDash([]);
    });
  }

  function ground(a) {
    withA(a, () => {
      const g = [proj(-9, -9, 0), proj(40, -9, 0), proj(40, 35, 0), proj(-9, 35, 0)];
      poly(g, 'rgba(220, 232, 214, 0.9)');
      ctx.strokeStyle = 'rgba(120, 150, 120, 0.18)'; ctx.lineWidth = 1;
      for (let i = -9; i <= 40; i++) { const a1 = proj(i, -9, 0), b1 = proj(i, 35, 0); ctx.beginPath(); ctx.moveTo(...a1); ctx.lineTo(...b1); ctx.stroke(); }
      for (let j = -9; j <= 35; j++) { const a1 = proj(-9, j, 0), b1 = proj(40, j, 0); ctx.beginPath(); ctx.moveTo(...a1); ctx.lineTo(...b1); ctx.stroke(); }
    });
  }
  const floorZ = (i) => i * FS + 0.2;

  const CLOUDS = Array.from({ length: 7 }, (_, i) => [rnd(i) * SW, 80 + rnd(i + 9) * 300, 60 + rnd(i + 3) * 80, 6 + rnd(i + 5) * 10]);
  function sky(t) {
    const g = ctx.createLinearGradient(0, 0, 0, SH);
    g.addColorStop(0, '#cfe3ff'); g.addColorStop(0.65, '#eef5ff'); g.addColorStop(1, '#fff6e5');
    ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH);
    CLOUDS.forEach(([x, y, r, v]) => {
      const cx = (x + t * v) % (SW + 300) - 150;
      ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath();
      ctx.arc(cx, y, r, 0, Math.PI * 2); ctx.arc(cx + r * 0.7, y - 10, r * 0.7, 0, Math.PI * 2);
      ctx.arc(cx - r * 0.7, y - 5, r * 0.6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    });
  }

  function floorLabel(i, k, lift = 0, desc = true) {
    withA(k, () => {
      const z = floorZ(i) + lift;
      const [px, py] = proj(BW + 0.4, BD / 2, z + FH / 2);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 8;
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(px + 12, py - 20, desc ? 350 : 160, 40, 8); ctx.fill();
      ctx.strokeStyle = shade(LAYERS[i].col, -0.2); ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      ctx.fillStyle = LAYERS[i].col; ctx.beginPath(); ctx.roundRect(px + 16, py - 16, 8, 32, 4); ctx.fill();
      text(LAYERS[i].id, px + 32, py + 1, { size: 20, weight: 700, color: C.ink });
      if (desc) text(LAYERS[i].uz, px + 126, py + 1, { size: 12, weight: 500, color: C.soft });
    });
  }

  function drawTower(t, o = {}) {
    ground(o.groundA == null ? 1 : o.groundA);
    const drop = (i) => clamp(P(t, 0.4 + i * 0.28, 0.7));
    for (let i = 0; i < LAYERS.length; i++) {
      const k = drop(i), l = LAYERS[i];
      const zBase = floorZ(i), zDrop = (1 - eo(k)) * 6;
      const lift = o.lift && o.lift[i] ? o.lift[i] : 0;
      const col = o.hlFloor === i ? shade(l.col, 0.25) : l.col;
      box(0, 0, zBase + zDrop + lift, BW, BD, FH, col, { a: o.alpha == null ? 1 : o.alpha });
      if (k > 0.4 && o.showLabels !== false) floorLabel(i, P(k, 0.4, 0.6), lift, o.descLabels !== false);
    }
  }

  // ---------- Sahna chizish ----------
  function draw(t) {
    ctx.clearRect(0, 0, SW, SH);
    sky(t);

    const S = TM.scenes;
    const camFrames = [
      [0, [90, -30, 1]],
      [S.bosqich1_uch_qatlam.s, [320, 10, 0.95]],
      [S.bosqich2_3_takrorlanish.s, [360, 20, 0.92]],
      [S.bosqich4_5_header_admin.s, [380, 25, 0.9]],
      [S.steiger_metrikalari.s, [360, 20, 0.92]],
      [S.tipik_xatolar.s, [400, 30, 0.9]],
      [S.xulosa.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.bosqich1_uch_qatlam.s)
    if (t < S.bosqich1_uch_qatlam.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill("37-BOB: AMALIY LOYIHA: \"BOZOR\" DO'KONI FRONTENDI", SW / 2, 80, C.cyan, { size: 28, align: 'center' });
        text("Butun FSD qo'llanmasini real onlayn do'konda bosqichma-bosqich qo'llash", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating badges
      const kBadges = eo(P(t, L('L1').s + 2.5, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: '"Bozor" do\'koni', x: 260, y: 320, col: C.blue },
          { s: '1-kunda faqat 3 qatlam', x: 280, y: 440, col: C.green },
          { s: 'Oldindan bashorat YO\'Q', x: 270, y: 560, col: C.red },
          { s: 'Takrorlanish bo\'lsa → qatlam', x: 1420, y: 340, col: C.purple },
          { s: 'Steiger har bosqichda', x: 1440, y: 460, col: C.teal }
        ];
        badges.forEach((b, idx) => {
          const bob = Math.sin(t * 2.5 + idx) * 8;
          pill(b.s, b.x, b.y + bob, b.col, { size: 20, mono: true });
        });
      });

      const k2 = eo(P(t, L('L2').s, 0.8));
      withA(k2, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 470, SH - 140, 940, 75, 16); ctx.fill();
        ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("25 ta bo'sh papka ochish emas — ehtiyoj bo'lganda bosqichma-bosqich kengaytirish!", SW / 2, SH - 103, { size: 22, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: BOSQICH 1 (S.bosqich1_uch_qatlam.s - S.bosqich2_3_takrorlanish.s)
    else if (t < S.bosqich2_3_takrorlanish.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("1-BOSQICH: BOSHLANISHIDA FAQAT UCHTA QATLAM", 180, 80, C.cyan, { size: 26 });

      const kRes = eo(P(t, S.bosqich1_uch_qatlam.s + 0.3, 0.8));
      withA(kRes, () => {
        // Asosiy konteyner
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: Papka daraxti (1-bosqich: app, pages, shared)
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 760, 740, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill("📁 1-Bosqich Strukturasi (app, pages, shared)", 210, 225, C.ink, { size: 16, mono: true });

        const treeLines = [
          { s: 'src/', col: C.ink, note: '' },
          { s: '├── app/       routes/, providers/, styles/', col: C.purple, note: 'kirish nuqtasi' },
          { s: '├── pages/', col: C.blue, note: 'barcha sahifalar' },
          { s: '│   ├── catalog/', col: C.ink, note: '' },
          { s: '│   │   ├── ui/CatalogPage.tsx', col: C.soft, note: 'sahifa kodi' },
          { s: '│   │   ├── ui/ProductCard.tsx', col: C.green, note: '← Hali shu sahifa ichida!' },
          { s: '│   │   └── ui/Filters.tsx', col: C.soft, note: 'faqat katalog uchun' },
          { s: '│   ├── product/    ui/ProductPage, Gallery', col: C.soft, note: '' },
          { s: '│   ├── cart/       ui/CartPage', col: C.soft, note: '' },
          { s: '│   └── checkout/   ui/CheckoutPage, model', col: C.soft, note: '' },
          { s: '└── shared/', col: '#475569', note: 'poydevor' },
          { s: '    ├── api/        client, endpoints', col: C.teal, note: '' },
          { s: '    └── ui/         button, input, modal', col: C.teal, note: 'umumiy UI kit' }
        ];

        treeLines.forEach((tl, i) => {
          const y = 275 + i * 46;
          text(tl.s, 210, y, { size: 15, fam: MONO, weight: 700, color: tl.col });
          if (tl.note) text(tl.note, 560, y, { size: 14, color: tl.note.startsWith('←') ? C.green : C.soft, weight: 600 });
        });

        // Right: Steiger Ogohlantirishi (Oldindan entities yaratmaslik)
        const kRight = eo(P(t, L('L4').s, 0.8));
        withA(kRight, () => {
          ctx.save(); ctx.fillStyle = '#fff5f5'; ctx.beginPath(); ctx.roundRect(970, 190, 770, 740, 16); ctx.fill();
          ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

          pill("⚠️ Steiger: Oldindan entities/ yaratmang!", 1000, 225, C.red, { size: 16 });

          text("Agar ProductCard ni darhol entities/ ga qo'ysangiz:", 1000, 290, { size: 19, weight: 700, color: C.ink });

          // Terminal xatolik bloki
          ctx.save(); ctx.fillStyle = '#1e1e2e'; ctx.beginPath(); ctx.roundRect(1000, 330, 710, 180, 12); ctx.fill();
          ctx.strokeStyle = '#313244'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          text("✘ This slice has only one reference in", 1025, 375, { size: 16, fam: MONO, color: '#f38ba8', weight: 700 });
          text("  slice \"pages/catalog\". Consider merging them.", 1025, 410, { size: 16, fam: MONO, color: '#f38ba8', weight: 700 });
          text("└ fsd/insignificant-slice", 1025, 465, { size: 15, fam: MONO, color: '#a6adc8', weight: 600 });

          // Tushuntirish
          const explanations = [
            "• Faqat 1 ta sahifa ishlatadigan kod sahifa ichida turadi.",
            "• Qidiruv sahifasi hali yo'q — demak qayta ishlatish ham yo'q.",
            "• Yangi qatlam ochish uchun haqiqiy takrorlanish talab etiladi."
          ];
          explanations.forEach((ex, idx) => {
            text(ex, 1000, 560 + idx * 55, { size: 17, weight: 600, color: C.ink });
          });

          ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(1000, 750, 710, 140, 12); ctx.fill();
          ctx.strokeStyle = '#86efac'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
          text("Oltin qoida: 1-bosqichda faqat app, pages, shared!", 1030, 800, { size: 19, weight: 700, color: C.green });
          text("Kodni oldindan kelajak uchun maydalash qat'iyan man etiladi.", 1030, 845, { size: 16, weight: 500, color: C.soft });
        });
      });
    }

    // SCENE 3: BOSQICH 2 VA 3 (S.bosqich2_3_takrorlanish.s - S.bosqich4_5_header_admin.s)
    else if (t < S.bosqich4_5_header_admin.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("2 VA 3-BOSQICHLAR: TAKRORLANISH VA KOMPOZITSIYA", 180, 80, C.cyan, { size: 26 });

      const kComp = eo(P(t, S.bosqich2_3_takrorlanish.s + 0.3, 0.8));
      withA(kComp, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: 2-Bosqich (entities/product paydo bo'lishi)
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 760, 340, 16); ctx.fill();
        ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("2-Bosqich: Qidiruv sahifasi kartani so'radi", 210, 225, C.blue, { size: 16 });

        text("Endi ProductCard 2 ta joyda kerak (catalog va search):", 210, 280, { size: 17, weight: 600, color: C.ink });
        text("pages/catalog/ui/ProductCard  ──►  entities/product/", 210, 325, { size: 16, fam: MONO, weight: 700, color: C.green });
        text("✓ Endi Steiger xato bermaydi, chunki havolalar 2 ta bo'ldi!", 210, 370, { size: 16, weight: 600, color: C.soft });

        // Left Bottom: 3-Bosqich (features/add-to-cart)
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 560, 760, 370, 16); ctx.fill();
        ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("3-Bosqich: \"Savatga\" tugmasi 3 sahifada", 210, 595, C.amber, { size: 16 });

        text("Har bir kartada savatga qo'shish harakati kerak:", 210, 650, { size: 17, weight: 600, color: C.ink });
        text("──► features/add-to-cart/ui/AddToCartButton", 210, 695, { size: 16, fam: MONO, weight: 700, color: C.amber });
        text("DIQQAT: ProductCard (entity) HECH QACHON AddToCartButton (feature) ni", 210, 750, { size: 15, weight: 700, color: C.red });
        text("to'g'ridan-to'g'ri import qilmaydi! (FSD qatlam qoidasi: yuqoriga import taqiq)", 210, 785, { size: 14.5, weight: 600, color: C.soft });

        // Right: Kompozitsiya KODI (Slot / Prop orqali)
        const kRight = eo(P(t, L('L7').s, 0.8));
        withA(kRight, () => {
          ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(970, 190, 770, 740, 16); ctx.fill();
          ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("Kompozitsiya (Inversion of Control)", 1000, 225, C.green, { size: 16, mono: true });

          const codeLines = [
            { s: '// pages/catalog/ui/CatalogPage.tsx (Sahifa ikkisini ulaydi)', col: '#94a3b8' },
            { s: "import { ProductCard } from '@/entities/product'", col: '#38bdf8' },
            { s: "import { AddToCartButton } from '@/features/add-to-cart'", col: '#fbbf24' },
            { s: '', col: '' },
            { s: 'export function CatalogPage() {', col: '#f8fafc' },
            { s: '  return (', col: '#f8fafc' },
            { s: '    <main>', col: '#f8fafc' },
            { s: '      {products.map((p) => (', col: '#f8fafc' },
            { s: '        <ProductCard', col: '#38bdf8' },
            { s: '          key={p.id}', col: '#cbd5e1' },
            { s: '          product={p}', col: '#cbd5e1' },
            { s: '          actions={<AddToCartButton productId={p.id} />}', col: '#4ade80' },
            { s: '        />', col: '#38bdf8' },
            { s: '      ))}', col: '#f8fafc' },
            { s: '    </main>', col: '#f8fafc' },
            { s: '  )', col: '#f8fafc' },
            { s: '}', col: '#f8fafc' },
            { s: '', col: '' },
            { s: '// Vue da: <template #actions><AddToCartButton ... /></template>', col: '#94a3b8' },
            { s: '// Angular da: <app-add-to-cart-button actions ... />', col: '#94a3b8' }
          ];

          codeLines.forEach((cl, i) => {
            if (cl.s) text(cl.s, 1000, 275 + i * 32, { size: 14.5, fam: MONO, color: cl.col, weight: 600 });
          });
        });
      });
    }

    // SCENE 4: BOSQICH 4 VA 5 (S.bosqich4_5_header_admin.s - S.steiger_metrikalari.s)
    else if (t < S.steiger_metrikalari.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("4 VA 5-BOSQICHLAR: HEADER WIDGET VA ADMIN GURUHI", 180, 80, C.cyan, { size: 26 });

      const kHd = eo(P(t, S.bosqich4_5_header_admin.s + 0.3, 0.8));
      withA(kHd, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: 4-Bosqich: widgets/header
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 760, 740, 16); ctx.fill();
        ctx.strokeStyle = C.green; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
        pill("4-Bosqich: widgets/header va MainLayout", 210, 230, C.green, { size: 18 });

        const headerSteps = [
          { t: "Header hamma sahifaga kerak", d: "features/search, entities/cart va shared/ui/logo ni bitta widgetga birlashtiradi" },
          { t: "app/routes/layouts/MainLayout", d: "Layout ichida Header + PageShell + <Outlet /> bir marta joylashtiriladi" },
          { t: "Sahifalar toza qoladi", d: "Har bir sahifa header haqida qayg'urmaydi, faqat o'z kontentini qaytaradi" }
        ];

        headerSteps.forEach((hs, i) => {
          const y = 300 + i * 140;
          ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(230, y + 10, 8, 0, Math.PI * 2); ctx.fill();
          text(hs.t, 255, y + 10, { size: 20, weight: 700, color: C.ink });
          text(hs.d, 255, y + 45, { size: 15, weight: 500, color: C.soft });
        });

        // Right: 5-Bosqich: Admin Paneli va Slice guruhi
        const kRight = eo(P(t, L('L9').s, 0.8));
        withA(kRight, () => {
          ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(970, 190, 770, 740, 16); ctx.fill();
          ctx.strokeStyle = C.purple; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
          pill("5-Bosqich: pages/admin-order/ Slice Guruhi", 1000, 230, C.purple, { size: 18 });

          const treeAdmin = [
            { s: 'pages/', col: C.ink },
            { s: '├── catalog/   product/   cart/   checkout/', col: C.soft },
            { s: '└── admin-order/                ← SLICE GURUHI', col: C.purple },
            { s: '    ├── list/   ui/, api/, index.ts', col: C.ink },
            { s: '    ├── detail/ ui/, api/, index.ts', col: C.ink },
            { s: '    └── edit/   ui/, model/, api/, index.ts', col: C.ink },
            { s: 'entities/', col: C.ink },
            { s: '└── order/                      ← ENDI 2 JOYDA ISHLATILADI', col: C.blue },
            { s: '    ├── model/order-status      canBeCancelled(), statusLabel()', col: C.soft },
            { s: '    └── ui/OrderStatusBadge', col: C.soft }
          ];

          treeAdmin.forEach((ta, idx) => {
            text(ta.s, 1000, 290 + idx * 42, { size: 15, fam: MONO, weight: 700, color: ta.col });
          });

          ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(1000, 750, 710, 140, 12); ctx.fill();
          ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
          text("Muhim qoida: Slice guruhi papkasida index.ts bo'lmaydi!", 1030, 800, { size: 18, weight: 700, color: C.blue });
          text("Faqat ichki list/, detail/, edit/ slice'lari o'z public API siga ega.", 1030, 845, { size: 15.5, weight: 500, color: C.soft });
        });
      });
    }

    // SCENE 5: STEIGER METRIKALARI (S.steiger_metrikalari.s - S.tipik_xatolar.s)
    else if (t < S.tipik_xatolar.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("STEIGER LINTERI: ARXITEKTURA SIGNALCHISI", 180, 80, C.cyan, { size: 26 });

      const kSt = eo(P(t, S.steiger_metrikalari.s + 0.3, 0.8));
      withA(kSt, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left Card: insignificant-slice
        ctx.save(); ctx.fillStyle = '#fff5f5'; ctx.beginPath(); ctx.roundRect(180, 190, 760, 520, 16); ctx.fill();
        ctx.strokeStyle = C.red; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
        pill("✘ fsd/insignificant-slice", 210, 230, C.red, { size: 18, mono: true });

        text("Signali: Slice faqat bitta joyda ishlatilgan!", 210, 290, { size: 19, weight: 700, color: C.ink });

        ctx.save(); ctx.fillStyle = '#1e1e2e'; ctx.beginPath(); ctx.roundRect(210, 330, 700, 140, 12); ctx.fill();
        ctx.strokeStyle = '#313244'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
        text("✘ This slice has only one reference in", 235, 375, { size: 15, fam: MONO, color: '#f38ba8', weight: 700 });
        text("  slice \"pages/catalog\". Consider merging them.", 235, 415, { size: 15, fam: MONO, color: '#f38ba8', weight: 700 });

        text("Sababi: Erta abstraksiya. Hali umumiy bo'lmagan kod.", 210, 520, { size: 16.5, weight: 600, color: C.ink });
        text("To'g'ri yechim: Uni ishlatayotgan sahifa ichiga qaytarish.", 210, 565, { size: 16.5, weight: 700, color: C.green });

        // Right Card: excessive-slicing
        const kRight = eo(P(t, L('L11').s, 0.8));
        withA(kRight, () => {
          ctx.save(); ctx.fillStyle = '#fefce8'; ctx.beginPath(); ctx.roundRect(970, 190, 770, 520, 16); ctx.fill();
          ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
          pill("✘ fsd/excessive-slicing", 1000, 230, C.amber, { size: 18, mono: true });

          text("Signali: Qatlamda 20 dan ortiq tarqoq slice to'plangan!", 1000, 290, { size: 19, weight: 700, color: C.ink });

          ctx.save(); ctx.fillStyle = '#1e1e2e'; ctx.beginPath(); ctx.roundRect(1000, 330, 710, 140, 12); ctx.fill();
          ctx.strokeStyle = '#313244'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
          text("✘ Layer \"pages\" has 23 ungrouped slices, which is", 1025, 375, { size: 15, fam: MONO, color: '#f9e2af', weight: 700 });
          text("  above recommended threshold of 20.", 1025, 415, { size: 15, fam: MONO, color: '#f9e2af', weight: 700 });

          text("Sababi: Sahifalar ko'payib ketib, papka tartibsiz bo'lgan.", 1000, 520, { size: 16.5, weight: 600, color: C.ink });
          text("To'g'ri yechim: pages/admin-order/* kabi slice guruhi ochish.", 1000, 565, { size: 16.5, weight: 700, color: C.green });
        });

        // Bottom banner
        ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(180, 740, 1560, 190, 16); ctx.fill();
        ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("Stayger Yordamchi", 215, 785, C.green, { size: 16 });
        text("Stayger ogohlantirishlari — loyihaning to'g'ri me'yorda va", 215, 840, { size: 21, weight: 700, color: C.ink });
        text("ortiqcha sun'iy murakkabliklarsiz rivojlanishiga xizmat qiladi!", 215, 885, { size: 20, weight: 600, color: C.soft });
      });
    }

    // SCENE 6: TIPIK XATOLAR (S.tipik_xatolar.s - S.xulosa.s)
    else if (t < S.xulosa.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("LOYIHANI QURASHDAGI TIPIK XATOLAR", 180, 80, C.cyan, { size: 26 });

      const kErr = eo(P(t, S.tipik_xatolar.s + 0.3, 0.8));
      withA(kErr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const mistakes = [
          {
            title: '1. 1-kunda 6 qatlam va 25 ta slice ochish',
            bad: 'Hamma narsani oldindan taxminlab maydalash',
            why: 'Steiger insignificant-slice xatolari va bo\'sh papkalar to\'plami',
            good: 'To\'g\'ri: Boshlanishida faqat app, pages, shared!',
            col: C.red,
            tStart: L('L12').s
          },
          {
            title: '2. ProductCard ichida AddToCartButton import',
            bad: 'Entity qatlamidan Feature qatlamiga qaramlik o\'rnatish',
            why: 'FSD qoidasi buziladi (yuqoriga import taqiqlangan)',
            good: 'To\'g\'ri: Slot / prop orqali sahifada kompozitsiya qilish',
            col: C.amber,
            tStart: L('L12').s + 4.0
          },
          {
            title: '3. Admin sahifalarini tekis 23 ta qilib tashlash',
            bad: 'Barcha admin sahifalarini bitta papkada guruhsiz saqlash',
            why: 'Fayllar bo\'yicha navigatsiya qilish va tushunish juda qiyinlashadi',
            good: 'To\'g\'ri: pages/admin-order/* slice guruhi ochish',
            col: C.purple,
            tStart: L('L13').s
          },
          {
            title: '4. Steiger linterini o\'chirib qo\'yish',
            bad: 'Xatolik chiqqanda eslint-disable qo\'yish yoki o\'chirish',
            why: 'Arxitektura eroziyasi boshlanadi va eski spagetti kodi qaytadi',
            good: 'To\'g\'ri: Xabarni o\'qib, arxitekturaviy qarorni qayta ko\'rish',
            col: C.blue,
            tStart: L('L13').s + 4.0
          }
        ];

        mistakes.forEach((m, idx) => {
          const colIdx = idx % 2;
          const rowIdx = Math.floor(idx / 2);
          const bx = 180 + colIdx * 800;
          const by = 190 + rowIdx * 370;
          const isAct = t >= m.tStart;

          ctx.save();
          ctx.fillStyle = isAct ? '#fff5f5' : '#ffffff';
          ctx.beginPath(); ctx.roundRect(bx, by, 760, 340, 16); ctx.fill();
          ctx.strokeStyle = isAct ? m.col : '#e2e8f0';
          ctx.lineWidth = isAct ? 2.5 : 1.5; ctx.stroke();
          ctx.restore();

          pill(m.title, bx + 30, by + 40, m.col, { size: 16 });

          text("❌ Xato: " + m.bad, bx + 30, by + 105, { size: 16, weight: 700, color: C.red });
          text("⚠️ Oqibat: " + m.why, bx + 30, by + 160, { size: 15, weight: 600, color: C.ink });

          ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(bx + 25, by + 215, 710, 95, 12); ctx.fill();
          ctx.strokeStyle = '#86efac'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          text("✅ " + m.good, bx + 45, by + 262, { size: 16, weight: 700, color: C.green });
        });
      });
    }

    // SCENE 7: XULOSA (S.xulosa.s - TM.end)
    else {
      drawTower(t, { alpha: 1, showLabels: true });
      pill("XULOSA: TABIIY VA BARQAROR FSD RIVOJI", SW / 2, 80, C.cyan, { size: 28, align: 'center' });

      const kSum = eo(P(t, S.xulosa.s + 0.3, 0.8));
      withA(kSum, () => {
        const cards = [
          {
            title: "Pages-First Tamoyili",
            desc: "Dastlab faqat sahifalar quriladi, ortiqcha qatlamlar ochilmaydi",
            col: C.blue,
            x: 240,
            y: 750
          },
          {
            title: "Slot / Prop Kompozitsiya",
            desc: "Entity feature ga bog'lanmaydi, tugmalar sahifada ulanadi",
            col: C.green,
            x: 740,
            y: 750
          },
          {
            title: "Steiger Bilganini Qiladi",
            desc: "Linter xabarlari loyihani sog'lom chegarada ushlab turadi",
            col: C.purple,
            x: 1240,
            y: 750
          }
        ];

        cards.forEach((c) => {
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 14;
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(c.x, c.y, 440, 120, 16); ctx.fill();
          ctx.strokeStyle = c.col; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();

          pill(c.title, c.x + 25, c.y + 35, c.col, { size: 16 });
          text(c.desc, c.x + 25, c.y + 85, { size: 14, weight: 600, color: C.ink });
        });
      });

      const kNext = eo(P(t, L('L15').s, 0.8));
      withA(kNext, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 450, SH - 140, 900, 75, 16); ctx.fill();
        ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Keyingi bob: 38 — FSD arxitekturasini Code Review qilish checklisti", SW / 2, SH - 103, { size: 23, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // Pastki progress bar
    const prg = clamp(t / TM.end);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, SH - 6, SW, 6);
    ctx.fillStyle = C.cyan; ctx.fillRect(0, SH - 6, SW * prg, 6);
  }

  window.draw = draw;
  window.render = draw;
  window.seekAnim = (t) => draw(t);
  window.DURATION = TM.end;
  window.TOTAL_DURATION = TM.end;

  window.renderPoster = () => {
    draw(0.001);
    ctx.globalAlpha = 1;
    cam = { tx: 620, ty: -40, z: 0.78 };
    sky(3);
    ground(1);
    drawTower(10, { hlFloor: 4, lift: [0, 0, 0, 0, 0, 0], descLabels: false });
    text('FSD', 1150, 360, { size: 170, weight: 800, color: C.cyan });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text("37-bob · amaliy loyiha: do'kon", 1158, 545, { size: 34, color: C.soft });
  };
})();
