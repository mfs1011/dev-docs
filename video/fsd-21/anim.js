// FSD 21-bob videosi: "Server holati" — TanStack Query, Query Factory, kesh va mutatsiyalar
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
  const SHARED_CAM = [310, 50, 0.95];
  const PAGES_CAM = [290, ((4 + 2.5) * U) / 2 - (floorZ(4) + 1.2) * U, 1.1];
  const APP_CAM = [290, ((4 + 2.5) * U) / 2 - (floorZ(5) + 1.2) * U, 1.15];

  function camera(t) {
    const s = TM.scenes;
    const frames = [
      [0, [-160, -30, 0.95]],
      [s.query_factory.s, SHARED_CAM],
      [s.kesh_invalidatsiyasi.s, SHARED_CAM],
      [s.mutatsiyalar_joyi.s, PAGES_CAM],
      [s.yagona_query_klient.s, APP_CAM],
      [s.tipik_xatolar.s, SIDE],
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
      glow: (i === 0 || i === 1) ? P(t, 2.5, 0.8) : 0,
      glowCol: '#38bdf8'
    }));
    const k = eo(P(t, 1.0, 0.9));
    withA(k, () => {
      text('FSD', 80, 140 + (1 - k) * 30, { size: 150, weight: 800, color: '#3b5bdb' });
      text('21-bob · server holati', 86, 245 + (1 - k) * 30, { size: 44, weight: 700 });
      text('TanStack Query va Kesh Boshqaruvi', 88, 305 + (1 - k) * 30, { size: 30, color: C.soft });
    });

    const kWide = P(t, L('L2').s, 0.6);
    card(420, 260, kWide);
    withA(kWide, () => {
      text("Server Holati: Oddiy State Emas!", PX + 36, 465, { size: 28, weight: 800, color: '#0284c7' });
      text("Serverdan kelgan ma'lumotlar mijoz holati bilan", PX + 36, 510, { size: 21, color: C.ink });
      text("aralashtirilmasligi va kesh orqali boshqarilishi shart.", PX + 36, 550, { size: 21, color: C.ink });
      text("Kesh kalitlari daraxti va yagona QueryClient!", PX + 36, 595, { size: 21, color: C.green, weight: 700 });
      text("TanStack Query, Pinia Colada va Angular resource.", PX + 36, 630, { size: 21, color: C.soft });
      check(PX + PW - 50, 465, 1, '#0284c7', 0.7);
    });
  }

  // 2-SAHNA: Query factory
  function sQueryFactory(t) {
    title("Query Factory: Kesh Kalitlari Daraxti", "Iyerarxik va xavfsiz kalitlar boshqaruvi", t, L('L3').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: (i === 0 || i === 1) ? 1 : 0.35,
      glow: i === 0 ? 0.9 : 0,
      glowCol: '#38bdf8'
    }));
    floorLabel(0, 1, 0);

    const kTree = P(t, L('L3').s, 0.5);
    card(200, 270, kTree);
    withA(kTree, () => {
      text("PRODUCT_QUERIES Factory Daraxti", PX + 36, 245, { size: 26, weight: 800, color: '#0284c7' });
      text("all:   () => ['products']", PX + 36, 285, { size: 19, fam: MONO, color: C.ink });
      text("lists: () => [...all(), 'list']", PX + 36, 315, { size: 19, fam: MONO, color: C.ink });
      text("list:  (filters) => [...lists(), filters]", PX + 36, 345, { size: 19, fam: MONO, color: '#0284c7', weight: 700 });
      text("detail:(id) => [...all(), 'detail', id]", PX + 36, 375, { size: 19, fam: MONO, color: C.ink });
      text("Kalitlarni komponentda qo'lda yozish taqiqlanadi!", PX + 36, 420, { size: 20, color: C.red, weight: 600 });
      check(PX + PW - 50, 245, 1, '#0284c7', 0.7);
    });

    const kLoc = P(t, L('L4').s, 0.5);
    card(490, 240, kLoc);
    withA(kLoc, () => {
      text("Joylashuv: shared/api yoki entities", PX + 36, 535, { size: 26, weight: 800, color: C.green });
      text("shared/api/product/product.query.ts", PX + 36, 575, { size: 19, fam: MONO, color: C.ink, weight: 700 });
      text("Yoki loyihada entity'lar bo'lsa: entities/product/api", PX + 36, 610, { size: 19, fam: MONO, color: '#64748b' });
      text("queryOptions bilan so'rov funksiyasi birga bog'lanadi.", PX + 36, 655, { size: 20, color: C.green, weight: 600 });
      check(PX + PW - 50, 535, 1, C.green, 0.7);
    });
  }

  // 3-SAHNA: Kesh invalidatsiyasi
  function sKeshInvalidatsiyasi(t) {
    title("Aniq va Nozik Kesh Invalidatsiyasi", "Tarmoq trafigi va resurslarni tejash", t, L('L5').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: i === 0 ? 1 : 0.35,
      glow: i === 0 ? 0.9 : 0,
      glowCol: '#34d399'
    }));
    floorLabel(0, 1, 0);

    const kInv = P(t, L('L5').s, 0.5);
    card(220, 250, kInv);
    withA(kInv, () => {
      text("Keshni Nozik Yangilash Usuli", PX + 36, 265, { size: 26, weight: 800, color: '#059669' });
      text("invalidateQueries(PRODUCT_QUERIES.all())", PX + 36, 305, { size: 19, fam: MONO, color: '#64748b' });
      text("──▶ butun mahsulot keshini yangilaydi;", PX + 36, 335, { size: 19, color: C.ink });
      text("invalidateQueries(PRODUCT_QUERIES.lists())", PX + 36, 375, { size: 19, fam: MONO, color: '#059669', weight: 700 });
      text("──▶ faqat ro'yxatlarni yangilaydi, detail qoladi!", PX + 36, 405, { size: 19, color: C.ink });
      check(PX + PW - 50, 265, 1, '#059669', 0.7);
    });

    const kFast = P(t, L('L6').s, 0.5);
    card(490, 240, kFast);
    withA(kFast, () => {
      text("Yuqori Tezlik va Tejamkorlik", PX + 36, 535, { size: 26, weight: 800, color: C.amber });
      text("Bitta mahsulot yangilanganda butun ilovani", PX + 36, 580, { size: 21, color: C.ink });
      text("yoki barcha sahifalarni qayta yuklash shart emas.", PX + 36, 615, { size: 21, color: C.ink });
      text("Faqat o'zgargan kalit yangilanadi — UI chaqqon ishlaydi!", PX + 36, 660, { size: 21, color: C.green, weight: 700 });
      check(PX + PW - 50, 535, 1, C.amber, 0.7);
    });
  }

  // 4-SAHNA: Mutatsiyalar joyi
  function sMutatsiyalarJoyi(t) {
    title("Mutatsiyalar Qayerda Saqlanadi?", "Query va mutatsiyalarni aralashtirmang", t, L('L8').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: (i === 4 || i === 2) ? 1 : 0.35,
      glow: i === 4 ? 0.9 : 0,
      glowCol: '#60a5fa'
    }));
    floorLabel(4, 1, 0);

    const kMut1 = P(t, L('L8').s, 0.5);
    card(220, 250, kMut1);
    withA(kMut1, () => {
      text("Mutatsiya Hook'i — Ishlatiladigan Joyda", PX + 36, 265, { size: 26, weight: 800, color: '#2563eb' });
      text("// pages/product-edit/api/use-update-product.ts", PX + 36, 305, { size: 19, fam: MONO, color: '#64748b' });
      text("Yaratish, o'zgartirish yoki o'chirish amallari", PX + 36, 345, { size: 21, color: C.ink });
      text("aynan shu sahifa yoki feature slice ichida turadi.", PX + 36, 385, { size: 21, color: C.ink });
      check(PX + PW - 50, 265, 1, '#2563eb', 0.7);
    });

    const kMut2 = P(t, L('L10').s, 0.5);
    card(490, 240, kMut2);
    withA(kMut2, () => {
      text("onSuccess'da Keshni Yangilash", PX + 36, 535, { size: 26, weight: 800, color: C.green });
      text("useMutation({ mutationFn, onSuccess: () => {", PX + 36, 575, { size: 19, fam: MONO, color: C.ink });
      text("  queryClient.invalidateQueries(QUERIES.lists())", PX + 36, 605, { size: 19, fam: MONO, color: C.green, weight: 700 });
      text("}})", PX + 36, 635, { size: 19, fam: MONO, color: C.ink });
      text("UI holatini qo'lda setState bilan sinxronlamang!", PX + 36, 675, { size: 20, color: C.soft });
      check(PX + PW - 50, 535, 1, C.green, 0.7);
    });
  }

  // 5-SAHNA: Yagona QueryClient
  function sYagonaQueryKlient(t) {
    title("Yagona QueryClient va app/providers", "Bitta ilova — yagona kesh instansiyasi", t, L('L11').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: i === 5 ? 1 : 0.35,
      glow: i === 5 ? 0.9 : 0,
      glowCol: '#a78bfa'
    }));
    floorLabel(5, 1, 0);

    const kApp = P(t, L('L11').s, 0.5);
    card(220, 250, kApp);
    withA(kApp, () => {
      text("app/providers/QueryProvider", PX + 36, 265, { size: 26, weight: 800, color: '#8b5cf6' });
      text("const queryClient = new QueryClient({ ... })", PX + 36, 305, { size: 19, fam: MONO, color: C.ink, weight: 700 });
      text("Faqat bitta instansiya app qatlamida ochiladi.", PX + 36, 345, { size: 21, color: C.ink });
      text("Slice ichida alohida klient ochish — qat'iy taqiqlanadi!", PX + 36, 385, { size: 20, color: C.red, weight: 700 });
      check(PX + PW - 50, 265, 1, '#8b5cf6', 0.7);
    });

    const kStore = P(t, L('L13').s, 0.5);
    card(490, 250, kStore);
    withA(kStore, () => {
      text("Server Holati Redux/Pinia'da Nusxalanmaydi", PX + 36, 535, { size: 26, weight: 800, color: '#0284c7' });
      text("Server ma'lumotlarini store'larga ko'chirish — xato.", PX + 36, 575, { size: 21, color: C.ink });
      text("Ikki xil manba paydo bo'lib, sinxronizatsiya buziladi.", PX + 36, 615, { size: 21, color: C.red, weight: 600 });
      text("Keshning o'zi — yagona haqiqat manbaidir!", PX + 36, 655, { size: 21, color: C.green, weight: 700 });
      check(PX + PW - 50, 535, 1, '#0284c7', 0.7);
    });
  }

  // 6-SAHNA: Tipik xatolar
  function sTipikXatolar(t) {
    title("Kesh Boshqaruvidagi 4 Ta Xato", "Steiger va arxitektura qoidalari", t, L('L14').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: 1,
      glow: 0.8,
      glowCol: '#10b981'
    }));

    const kErr = P(t, L('L14').s, 0.5);
    withA(kErr, () => {
      panel(PX, 210, PW, 490, { dark: true, title: 'kesh boshqaruvi · audit tekshiruvi' });
      const items = [
        ["❌ Kalit satrlarini 20 ta faylda yozish", "✔ Query factory kesh daraxti"],
        ["❌ Slicelar ichida alohida QueryClient", "✔ app/providers'da yagona instansiya"],
        ["❌ Server holatini Redux/Pinia'da saqlash", "✔ TanStack Query keshining o'zidan o'qish"],
        ["❌ Mutatsiyada qo'lda setState chaqirish", "✔ onSuccess'da invalidateQueries() qilish"]
      ];
      items.forEach(([wrong, right], idx) => {
        const py = 265 + idx * 100;
        text(wrong, PX + 36, py, { size: 20, fam: MONO, color: '#f87171', weight: 700 });
        text(right, PX + 36, py + 30, { size: 19, fam: MONO, color: '#34d399', weight: 600 });
      });
      check(PX + PW - 50, 255, 1, '#10b981', 0.7);
    });
  }

  // 7-SAHNA: Xulosa
  function sXulosa(t) {
    title("Xulosa: Server Holati", "Asosiy qoidalar va keyingi bob", t, L('L16').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: 1,
      glow: 0.9,
      glowCol: '#3b5bdb'
    }));

    LAYERS.forEach((_, i) => floorLabel(i, 1, 0));

    const kCard = P(t, L('L16').s, 0.5);
    card(230, 420, kCard);
    withA(kCard, () => {
      text("Server Holatining 3 Ta Oltin Qoidasi", PX + 36, 275, { size: 28, weight: 800, color: '#10b981' });
      const points = [
        ["1. Query Factory Kesh Daraxti", "Kalitlarni bitta zavodda yig'ib, nozik invalidatsiya qiling"],
        ["2. Mutatsiyalar Slice API'sida", "Ishlatiladigan joyda saqlang va onSuccess orqali keshni yangilang"],
        ["3. Yagona QueryClient — app'da", "Ilovada yagona instansiya, keshni store'larda takrorlamang"],
        ["4. Single Source of Truth", "Keshning o'zi yagona haqiqat manbai bo'lib xizmat qiladi"]
      ];
      points.forEach(([h, d], j) => {
        const py = 330 + j * 70;
        text(h, PX + 36, py, { size: 21, weight: 700, color: C.ink });
        text('— ' + d, PX + 36, py + 26, { size: 19, color: C.soft });
      });
      check(PX + PW - 50, 275, 1, '#10b981', 0.7);
    });

    const kNext = P(t, L('L16').s + 4.0, 0.5);
    card(675, 160, kNext);
    withA(kNext, () => {
      text("Keyingi Bob: 22 — Autentifikatsiya", PX + 36, 720, { size: 27, weight: 800, color: '#3b5bdb' });
      text("Tokenlar, himoyalangan yo'llar va session slice arxitekturasi.", PX + 36, 760, { size: 21, color: C.soft });
      text("E'tiboringiz uchun rahmat!", PX + 36, 795, { size: 22, weight: 700, color: C.ink });
      check(PX + PW - 50, 720, 1, '#3b5bdb', 0.7);
    });
  }

  const SCENES = {
    intro: sIntro,
    query_factory: sQueryFactory,
    kesh_invalidatsiyasi: sKeshInvalidatsiyasi,
    mutatsiyalar_joyi: sMutatsiyalarJoyi,
    yagona_query_klient: sYagonaQueryKlient,
    tipik_xatolar: sTipikXatolar,
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
    building(6, (i) => ({ glow: 0.9, glowCol: '#0284c7' }));
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#3b5bdb' });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('21-bob · server holati', 1158, 545, { size: 34, color: C.soft });
  };
})();
