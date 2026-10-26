// FSD 19-bob videosi: "Qaror daraxti: kod qayerga?" — Yangi kodni qatlamlarga joylashtirish algoritmi
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
    teal: '#0d9488'
  };

  // Qatlamlar (pastdan yuqoriga)
  const LAYERS = [
    { id: 'shared', col: '#94a3b8', uz: 'poydevor: ui, api, lib' },
    { id: 'entities', col: '#fb7185', uz: 'biznes obyektlar: user, product' },
    { id: 'features', col: '#fbbf24', uz: 'foydalanuvchi amallari' },
    { id: 'widgets', col: '#34d399', uz: 'yirik bloklar: header, feed' },
    { id: 'pages', col: '#60a5fa', uz: 'sahifalar' },
    { id: 'app', col: '#a78bfa', uz: 'ishga tushirish' },
  ];
  const BW = 8, BD = 5, FH = 0.9, FS = 1.25, U = 60;

  // ---------- yordamchilar ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const P = (t, a, d) => clamp((t - a) / d);
  const lerp = (a, b, k) => a + (b - a) * k;
  const eo = (k) => 1 - Math.pow(1 - k, 3);
  const eio = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const eback = (k) => { const c1 = 1.7, c3 = c1 + 1; return k <= 0 ? 0 : 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
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
      const cx = ((x + t * v) % (SW + 400)) - 200;
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      [[0, 0, r], [r * 0.9, 8, r * 0.75], [-r * 0.9, 10, r * 0.7], [r * 0.3, -r * 0.4, r * 0.7]].forEach(([dx, dy, rr]) => { ctx.beginPath(); ctx.arc(cx + dx, y + dy, rr, 0, 7); ctx.fill(); });
    });
  }

  function building(t, st = () => ({}), extra = {}) {
    LAYERS.forEach((ly, i) => {
      const s = st(i), a = s.a == null ? 1 : s.a;
      if (a <= 0.002) return;
      const z = floorZ(i) + (s.lift || 0);
      const col = s.col || ly.col;
      box(0, 0, z, BW, BD, FH, col, { a: a * (s.dim ? 0.35 : 1), shadow: i === 0 && !s.ghost, dashed: s.ghost, stroke: s.ghost ? shade(ly.col, -0.3) : undefined });
      if (s.glow > 0) withA(s.glow, () => { const pts = [proj(0, 0, z + FH), proj(BW, 0, z + FH), proj(BW, BD, z + FH), proj(0, BD, z + FH)]; ctx.save(); ctx.shadowColor = s.glowCol || ly.col; ctx.shadowBlur = 40; poly(pts, null, s.glowCol || ly.col, 4); ctx.restore(); });
      if (extra.onFloor) extra.onFloor(i, z + FH, a);
    });
  }

  function floorLabel(i, k, lift = 0) {
    if (k <= 0) return;
    const ly = LAYERS[i], [x, y] = proj(0, BD, floorZ(i) + lift + FH / 2);
    withA(k, () => {
      const xx = x - 30 - (1 - eo(k)) * 30;
      pill(ly.id, xx, y, ly.col, { size: 28, align: 'right', mono: true, fg: C.ink });
    });
  }

  function panel(x, y, w, h, o = {}) {
    ctx.save(); ctx.shadowColor = 'rgba(30,40,70,0.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    ctx.fillStyle = o.dark ? '#111827' : '#ffffff'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill(); ctx.restore();
    if (o.title) {
      ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 24 + i * 20, y + 22, 6, 0, 7); ctx.fill(); });
      text(o.title, x + w / 2, y + 22, { size: 18, weight: 600, fam: MONO, color: o.dark ? '#94a3b8' : C.soft, align: 'center' });
    }
  }

  let titleQueue = [];
  function title(...args) { titleQueue.push([args, ctx.globalAlpha]); }
  function drawTitle(s, sub, t, t0) {
    const k = eo(P(t, t0, 0.8));
    withA(k, () => {
      text(s, 80, 90 + (1 - k) * 20, { size: 52, weight: 800 });
      if (sub) text(sub, 82, 142 + (1 - k) * 20, { size: 28, weight: 600, color: C.soft });
    });
  }
  function check(x, y, k, col = C.green, s = 1) { withA(k, () => { ctx.save(); ctx.translate(x, y); ctx.scale(eback(k) * s, eback(k) * s); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-11, 1); ctx.lineTo(-3, 10); ctx.lineTo(12, -9); ctx.stroke(); ctx.restore(); }); }

  const SIDE = [330, -10, 0.92];
  const TOP_BOTTOM_CAM = [310, 40, 0.92];
  const PAGES_CAM = [290, ((4 + 2.5) * U) / 2 - (floorZ(4) + 1.2) * U, 1.1];
  const MID_CAM = [290, ((4 + 2.5) * U) / 2 - (floorZ(2) + 1.2) * U, 1.05];

  function camera(t) {
    const s = TM.scenes;
    const frames = [
      [0, [-160, -30, 0.95]],
      [s.daraxt_asosiy.s, TOP_BOTTOM_CAM],
      [s.sahifalar_va_lokallik.s, PAGES_CAM],
      [s.widgets_features_entities.s, MID_CAM],
      [s.element_hayoti.s, SIDE],
      [s.steiger.s, SIDE],
      [s.xulosa.s, [90, -60, 0.65]],
    ];
    const v = kfv(t, frames, 1.6);
    cam = { tx: v[0], ty: v[1], z: v[2] };
  }

  const PX = 1120, PW = 740;
  function card(y, h, k) { withA(k, () => panel(PX, y + (1 - eo(k)) * 20, PW, h)); }

  // ==========================================
  // SAHNALAR
  // ==========================================

  // 1-SAHNA: Kirish
  function sIntro(t) {
    ground(1);
    building(t, (i) => ({
      a: P(t, 0.4 + i * 0.25, 0.4),
      lift: (1 - eo(P(t, 0.4 + i * 0.25, 0.7))) * 4,
      glow: P(t, 2.5, 0.8)
    }));
    const k = eo(P(t, 1.0, 0.9));
    withA(k, () => {
      text('FSD', 80, 140 + (1 - k) * 30, { size: 150, weight: 800, color: '#3b5bdb' });
      text('19-bob · qaror daraxti', 86, 245 + (1 - k) * 30, { size: 44, weight: 700 });
      text('Yangi Kod Qayerga Boradi: Aniq Algoritm', 88, 305 + (1 - k) * 30, { size: 30, color: C.soft });
    });

    const kWide = P(t, L('L2').s, 0.6);
    card(420, 260, kWide);
    withA(kWide, () => {
      text("Eng Ko'p Beriladigan Savol", PX + 36, 465, { size: 28, weight: 800, color: '#3b5bdb' });
      text('"Bu yangi fayl qaysi qatlamga boradi?"', PX + 36, 510, { size: 21, fam: MONO, color: C.ink, weight: 700 });
      text("Bitta diagramma va aniq savollar ketma-ketligi", PX + 36, 550, { size: 21, color: C.ink });
      text("har qanday yangi kod o'rnini soniyada belgilab beradi.", PX + 36, 595, { size: 21, color: C.green, weight: 600 });
      text("Yuqoridan pastga qaror daraxti algoritmi!", PX + 36, 630, { size: 21, color: C.soft });
      check(PX + PW - 50, 465, 1, '#3b5bdb', 0.7);
    });
  }

  // 2-SAHNA: Daraxt asosiy (App va Shared)
  function sDaraxtAsosiy(t) {
    title("Qaror Daraxti: Yuqoridan Pastga", "Boshlang'ich ikkita texnik filtr", t, L('L3').s - 0.3);
    ground(1);

    // App (5) va Shared (0) ni yoritish
    building(t, (i) => ({
      a: (i === 0 || i === 5) ? 1 : 0.35,
      glow: i === 5 ? P(t, L('L3').s, 0.5) : i === 0 ? P(t, L('L4').s, 0.5) : 0,
      glowCol: i === 5 ? '#a78bfa' : '#94a3b8'
    }));
    floorLabel(5, 1, 0);
    floorLabel(0, 1, 0);

    const kApp = P(t, L('L3').s, 0.5);
    card(230, 240, kApp);
    withA(kApp, () => {
      text("1-Savol: Ishga Tushirish / Router? -> app", PX + 36, 275, { size: 26, weight: 800, color: '#8b5cf6' });
      text("Router konfiguratsiyasi, global provayderlar,", PX + 36, 320, { size: 21, color: C.ink });
      text("analitika va butun ilova sozlamalari.", PX + 36, 355, { size: 21, color: C.ink });
      text("Javob HA bo'lsa — to'g'ridan-to'g'ri app qatlamiga!", PX + 36, 400, { size: 21, color: '#8b5cf6', weight: 700 });
      check(PX + PW - 50, 275, 1, '#8b5cf6', 0.7);
    });

    const kShared = P(t, L('L4').s, 0.5);
    card(490, 240, kShared);
    withA(kShared, () => {
      text("2-Savol: Sof Texnik / Loyihasizmi? -> shared", PX + 36, 535, { size: 26, weight: 800, color: '#64748b' });
      text("Button, Input, HTTP klient, formatDate, debounce.", PX + 36, 580, { size: 21, color: C.ink });
      text("Loyihadan tashqarida ham ma'noga ega sof vositalar.", PX + 36, 615, { size: 21, color: C.ink });
      text("Biznesdan mutlaqo xoli poydevor — shared qatlami!", PX + 36, 660, { size: 21, color: '#64748b', weight: 700 });
      check(PX + PW - 50, 535, 1, '#64748b', 0.7);
    });
  }

  // 3-SAHNA: Sahifalar va lokallik
  function sSahifalarVaLokallik(t) {
    title("Eng Muhim Tamoyil: Sahifadan Boshlash", "Lokallik va kechiktirilgan ko'chirish", t, L('L5').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: i === 4 ? 1 : 0.35,
      glow: i === 4 ? 0.9 : 0,
      glowCol: '#60a5fa'
    }));
    floorLabel(4, 1, 0);

    const kPage = P(t, L('L5').s, 0.5);
    card(230, 240, kPage);
    withA(kPage, () => {
      text("3-Savol: Faqat 1 Ta Sahifadami? -> pages", PX + 36, 275, { size: 26, weight: 800, color: '#2563eb' });
      text("Ko'p hollarda eng to'g'ri javob aynan shu!", PX + 36, 320, { size: 21, color: C.ink, weight: 700 });
      text("Sahifaning o'z ui, model yoki api segmentida saqlang.", PX + 36, 355, { size: 21, color: C.ink });
      text("Ortiqcha umumiy qatlamlarga tushirish shart emas.", PX + 36, 400, { size: 21, color: C.soft });
      check(PX + PW - 50, 275, 1, '#2563eb', 0.7);
    });

    const kGolden = P(t, L('L6').s, 0.5);
    card(490, 240, kGolden);
    withA(kGolden, () => {
      text("FSD Oltin Qoidasi: Doimo Eng Lokaldan", PX + 36, 535, { size: 26, weight: 800, color: C.amber });
      text("Kodni oldindan umumiy qilib yaratish — xatodir.", PX + 36, 580, { size: 21, color: C.ink });
      text("Kechiktirilgan dekompozitsiya arxitekturani toza tutadi.", PX + 36, 615, { size: 21, color: C.ink });
      text("Faqat 2-sahifa muhtoj bo'lsagina pastga tushiring!", PX + 36, 660, { size: 21, color: C.amber, weight: 700 });
      check(PX + PW - 50, 535, 1, C.amber, 0.7);
    });
  }

  // 4-SAHNA: Widgets, Features yoki Entities?
  function sWidgetsFeaturesEntities(t) {
    title("Widget, Feature yoki Entity?", "2 yoki undan ortiq joyda ishlatilganda", t, L('L8').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: (i >= 1 && i <= 3) ? 1 : 0.3,
      glow: i === 3 ? P(t, L('L8').s, 0.4) : i === 2 ? P(t, L('L9').s, 0.4) : i === 1 ? P(t, L('L10').s, 0.4) : 0,
      glowCol: i === 3 ? '#34d399' : i === 2 ? '#fbbf24' : '#fb7185'
    }));
    floorLabel(3, 1, 0);
    floorLabel(2, 1, 0);
    floorLabel(1, 1, 0);

    const kWid = P(t, L('L8').s, 0.5);
    card(200, 190, kWid);
    withA(kWid, () => {
      text("Katta Mustaqil UI Blok -> widgets", PX + 36, 240, { size: 25, weight: 800, color: '#059669' });
      text("Header, Filtrlar paneli, Sharhlar bo'limi.", PX + 36, 280, { size: 20, color: C.ink });
      text("Bir nechta slice'larni birlashtiruvchi yirik blok.", PX + 36, 315, { size: 19, color: C.soft });
      check(PX + PW - 50, 240, 1, '#059669', 0.65);
    });

    const kFeat = P(t, L('L9').s, 0.5);
    card(410, 190, kFeat);
    withA(kFeat, () => {
      text("Foydalanuvchi HARAKATI (Fe'llar) -> features", PX + 36, 450, { size: 25, weight: 800, color: '#d97706' });
      text("add-to-cart, rate-product, sign-in, filter-by-price.", PX + 36, 490, { size: 20, fam: MONO, color: C.ink });
      text("Foydalanuvchi biznes qiymat oladigan aniq harakatlar.", PX + 36, 525, { size: 19, color: C.soft });
      check(PX + PW - 50, 450, 1, '#d97706', 0.65);
    });

    const kEnt = P(t, L('L10').s, 0.5);
    card(620, 190, kEnt);
    withA(kEnt, () => {
      text("Biznes OBYEKTI va Ko'rinishi (Otlar) -> entities", PX + 36, 660, { size: 25, weight: 800, color: '#e11d48' });
      text("ProductCard, UserProfile, OrderSummary, CartItem.", PX + 36, 700, { size: 20, fam: MONO, color: C.ink });
      text("Obyekt modeli, ma'lumoti va uning ko'rinishi.", PX + 36, 735, { size: 19, color: C.soft });
      check(PX + PW - 50, 660, 1, '#e11d48', 0.65);
    });
  }

  // 5-SAHNA: Element hayoti (ProductRating evolyutsiyasi)
  function sElementHayoti(t) {
    title("Bitta Element Hayoti: Yulduzchalar Misoli", "ProductRating komponentining o'sish evolyutsiyasi", t, L('L11').s - 0.3);
    ground(1);

    // Dinamik qatlam nurlanishi
    const isW1 = t < L('L12').s;
    building(t, (i) => ({
      a: 1,
      glow: isW1 ? (i === 4 ? 0.9 : i === 1 ? 0.7 : 0) : (i === 2 ? 0.9 : i === 3 ? 0.8 : 0),
      glowCol: isW1 ? '#60a5fa' : '#fbbf24'
    }));

    const kEv1 = P(t, L('L11').s, 0.5);
    card(210, 260, kEv1);
    withA(kEv1, () => {
      text("1-qadam: Sahifadan Entities'ga O'tish", PX + 36, 255, { size: 26, weight: 800, color: '#0284c7' });
      text("1-hafta: faqat mahsulot sahifasida kerak:", PX + 36, 295, { size: 19, color: C.soft });
      text("→ pages/product/ui/ProductRating.tsx", PX + 36, 325, { size: 19, fam: MONO, color: C.ink, weight: 700 });
      text("3-hafta: katalog kartasida ham yulduzcha kerak:", PX + 36, 365, { size: 19, color: C.soft });
      text("→ entities/product/ui/ProductRating.tsx", PX + 36, 395, { size: 19, fam: MONO, color: '#e11d48', weight: 700 });
      text("Ko'chirilgach, Public API orqali eksport qilinadi.", PX + 36, 430, { size: 19, color: C.green, weight: 600 });
      check(PX + PW - 50, 255, 1, '#0284c7', 0.7);
    });

    const kEv2 = P(t, L('L12').s, 0.5);
    card(490, 260, kEv2);
    withA(kEv2, () => {
      text("2-qadam: Feature va Widget'ga Boyitish", PX + 36, 535, { size: 26, weight: 800, color: '#d97706' });
      text("5-hafta: foydalanuvchi baholash harakati qo'shildi:", PX + 36, 575, { size: 19, color: C.soft });
      text("→ features/rate-product (RateProduct.tsx)", PX + 36, 605, { size: 19, fam: MONO, color: '#d97706', weight: 700 });
      text("8-hafta: sharhlar va baholar butun mustaqil blok:", PX + 36, 645, { size: 19, color: C.soft });
      text("→ widgets/product-reviews", PX + 36, 675, { size: 19, fam: MONO, color: '#059669', weight: 700 });
      text("Kengayish tabiiy va arxitektura buzilmasdan kechadi!", PX + 36, 710, { size: 19, color: C.green, weight: 600 });
      check(PX + PW - 50, 535, 1, '#d97706', 0.7);
    });
  }

  // 6-SAHNA: Steiger linteri
  function sSteiger(t) {
    title("Steiger Linteri va Qatlamlar Nazorati", "Qatlamlar iyerarxiyasining avtomatik kafolati", t, L('L14').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: 1,
      glow: 0.8,
      glowCol: '#10b981'
    }));

    const kTerm = P(t, L('L14').s, 0.5);
    withA(kTerm, () => {
      panel(PX, 220, PW, 490, { dark: true, title: 'terminal · npx steiger ./src' });
      const lines = [
        ['$ npx steiger ./src', '#94a3b8', 19],
        ['Scanning project layer hierarchy...', '#64748b', 18],
        ['✔ app/routes: imports pages, widgets, shared', '#34d399', 19],
        ['✔ pages/catalog: imports widgets/header, entities/product', '#34d399', 19],
        ['✔ widgets/reviews: imports features/rate, entities/product', '#34d399', 19],
        ['✔ features/rate-product: imports entities/product/model', '#34d399', 19],
        ['✔ entities/product: no cross-import detected', '#34d399', 19],
        ['✔ shared/ui: zero project dependencies', '#34d399', 19],
        ['', '#94a3b8', 10],
        ['Result: 0 errors, 0 warnings. Hierarchy valid! ✨', '#38bdf8', 21]
      ];
      lines.forEach(([str, col, sz], idx) => {
        text(str, PX + 36, 280 + idx * 36, { size: sz, fam: MONO, color: col, weight: 600 });
      });
      check(PX + PW - 50, 265, 1, '#10b981', 0.7);
    });
  }

  // 7-SAHNA: Xulosa
  function sXulosa(t) {
    title("Xulosa: Qaror Daraxti", "Uchta oltin qoida va keyingi bob", t, L('L16').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: 1,
      glow: 0.9,
      glowCol: '#3b5bdb'
    }));

    LAYERS.forEach((_, i) => floorLabel(i, 1, 0));

    const kCard = P(t, L('L16').s, 0.5);
    card(230, 430, kCard);
    withA(kCard, () => {
      text("Qaror Daraxtining 3 Ta Oltin Qoidasi", PX + 36, 275, { size: 28, weight: 800, color: '#10b981' });
      const points = [
        ["1. Doimo Sahifadan Boshlang", "Oldindan umumiy qilmang, faqat 2-joy kerak bo'lganda tushiring"],
        ["2. Fe'llar — Features, Otlar — Entities", "Amal bo'lsa features, biznes modeli yoki ko'rinishi bo'lsa entities"],
        ["3. Katta Bloklar — Widgets", "Bir nechta feature va entity'larni jamlovchi mustaqil UI bloklar"],
        ["4. Poydevor — Shared", "Loyihadan tashqarida ham ma'noli bo'lgan sof texnik elementlar"]
      ];
      points.forEach(([h, d], j) => {
        const py = 330 + j * 70;
        text(h, PX + 36, py, { size: 21, weight: 700, color: C.ink });
        text('— ' + d, PX + 36, py + 26, { size: 19, color: C.soft });
      });
      check(PX + PW - 50, 275, 1, '#10b981', 0.7);
    });

    const kNext = P(t, L('L16').s + 4.0, 0.5);
    card(680, 160, kNext);
    withA(kNext, () => {
      text("Keyingi Bob: 20 — API So'rovlari", PX + 36, 725, { size: 27, weight: 800, color: '#3b5bdb' });
      text("Backend bilan aloqa, HTTP client va endpointlar tuzilishi.", PX + 36, 765, { size: 21, color: C.soft });
      text("E'tiboringiz uchun rahmat!", PX + 36, 800, { size: 22, weight: 700, color: C.ink });
      check(PX + PW - 50, 725, 1, '#3b5bdb', 0.7);
    });
  }

  const SCENES = {
    intro: sIntro,
    daraxt_asosiy: sDaraxtAsosiy,
    sahifalar_va_lokallik: sSahifalarVaLokallik,
    widgets_features_entities: sWidgetsFeaturesEntities,
    element_hayoti: sElementHayoti,
    steiger: sSteiger,
    xulosa: sXulosa
  };

  // Asosiy render funksiyasi
  function render(t) {
    ctx.clearRect(0, 0, SW, SH);
    sky(t);
    camera(t);

    for (const [name, fn] of Object.entries(SCENES)) {
      const sc = TM.scenes[name];
      if (sc && t >= sc.s && t < sc.e) {
        const al = Math.min(name === 'intro' ? 1 : P(t, sc.s, 0.4), 1 - P(t, sc.e - 0.4, 0.4));
        titleQueue = [];
        ctx.save();
        ctx.globalAlpha = 0.35 + 0.65 * al;
        fn(t);
        titleQueue.forEach(([args, a]) => {
          ctx.globalAlpha = a;
          drawTitle(...args);
        });
        ctx.restore();
      }
    }

    const fin = Math.max(1 - P(t, 0, 0.8), P(t, TM.end - 1.4, 1.3));
    if (fin > 0) {
      ctx.globalAlpha = fin;
      ctx.fillStyle = '#eef5ff';
      ctx.fillRect(0, 0, SW, SH);
      ctx.globalAlpha = 1;
    }
  }

  window.render = render;
  window.renderFrame = render;
  window.DURATION = TM.end;
  window.TOTAL_DURATION = TM.end;

  window.renderPoster = () => {
    render(0.001);
    ctx.globalAlpha = 1;
    cam = { tx: 620, ty: -40, z: 0.78 };
    sky(3);
    ground(1);
    building(6, (i) => ({ glow: 0.9, glowCol: '#3b5bdb' }));
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#3b5bdb' });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('19-bob · qaror daraxti: kod qayerga?', 1158, 545, { size: 34, color: C.soft });
  };
})();
