// FSD 12-bob videosi: "app" — dasturni ishga tushirish va provayderlar qatlami
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
    blue: '#3b5bdb'
  };

  // Qatlamlar (pastdan yuqoriga) va ranglari
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
  const rgba = (c, a) => `rgba(${hex(c).join(',')},${a})`;
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
      const col = s.red ? '#f87171' : s.green ? '#4ade80' : ly.col;
      box(0, 0, z, BW, BD, FH, col, { a: a * (s.dim ? 0.35 : 1), shadow: i === 0 && !s.ghost, dashed: s.ghost, stroke: s.ghost ? shade(ly.col, -0.3) : undefined });
      if (s.glow > 0) withA(s.glow, () => { const pts = [proj(0, 0, z + FH), proj(BW, 0, z + FH), proj(BW, BD, z + FH), proj(0, BD, z + FH)]; ctx.save(); ctx.shadowColor = s.red ? C.red : '#a78bfa'; ctx.shadowBlur = 40; poly(pts, null, s.red ? C.red : '#a78bfa', 4); ctx.restore(); });
      if (extra.onFloor) extra.onFloor(i, z + FH, a);
    });
  }

  function floorLabel(i, k, lift = 0, desc = false) {
    if (k <= 0) return;
    const ly = LAYERS[i], [x, y] = proj(0, BD, floorZ(i) + lift + FH / 2);
    withA(k, () => {
      const xx = x - 30 - (1 - eo(k)) * 30;
      const w = pill(ly.id, xx, y, ly.col, { size: 28, align: 'right', mono: true, fg: C.ink });
      if (desc) text(ly.uz, xx - w - 16, y + 1, { size: 26, color: C.soft, align: 'right' });
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
  function crossB(x, y, k, s = 1) { withA(k, () => { ctx.save(); ctx.translate(x, y); ctx.scale(eback(k) * s, eback(k) * s); ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-9, -9); ctx.lineTo(9, 9); ctx.moveTo(9, -9); ctx.lineTo(-9, 9); ctx.stroke(); ctx.restore(); }); }
  function arrow2(x1, y1, x2, y2, col, k, o = {}) {
    if (k <= 0) return;
    const x = lerp(x1, x2, eo(k)), y = lerp(y1, y2, eo(k));
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = o.w || 7; ctx.lineCap = 'round';
    if (o.dash) ctx.setLineDash(o.dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
    if (k > 0.9) { const a = Math.atan2(y2 - y1, x2 - x1), hs = (o.w || 7) * 3.2; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4); ctx.lineTo(x - Math.cos(a - 0.5) * hs, y - Math.sin(a - 0.5) * hs); ctx.lineTo(x - Math.cos(a + 0.5) * hs, y - Math.sin(a + 0.5) * hs); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }

  const SIDE = [330, -10, 0.92];
  const APP_CAM = [280, ((4 + 2.5) * U) / 2 - (floorZ(5) + 1.2) * U, 1.15];
  function camera(t) {
    const s = TM.scenes;
    const frames = [
      [0, [-160, -30, 0.95]],
      [s.vazifasi.s, APP_CAM],
      [s.segmentlar.s, SIDE],
      [s.router_va_ulanish.s, SIDE],
      [s.import_qoidasi.s, APP_CAM],
      [s.steiger.s, SIDE],
      [s.xulosa.s, [90, -60, 0.65]],
    ];
    const v = kfv(t, frames, 1.6);
    cam = { tx: v[0], ty: v[1], z: v[2] };
  }

  const PX = 1120, PW = 740;
  function card(y, h, k) { withA(k, () => panel(PX, y + (1 - eo(k)) * 20, PW, h)); }

  // App qavati segmentlari
  const APP_SEGS = [
    ['entrypoint', 0.5, 0.6, 3.4, 1.8, '#a78bfa'],
    ['routes', 0.5, 2.6, 3.4, 1.8, '#8b5cf6'],
    ['providers', 4.3, 0.6, 3.2, 1.8, '#7c3aed'],
    ['styles', 4.3, 2.6, 3.2, 1.8, '#6d28d9'],
  ];

  function drawAppSegments(zTop, k, t) {
    if (k <= 0) return;
    APP_SEGS.forEach(([name, x, y, w, d, col], idx) => {
      const kr = P(k, idx * 0.15, 0.4);
      if (kr <= 0) return;
      const h = 1.0 * eback(kr);
      box(x, y, zTop, w, d, h, col, { a: clamp(kr * 2), shadow: false });
      const [lx, ly] = proj(x + w / 2, y + d / 2, zTop + h);
      withA(clamp(kr * 1.5), () => pill(name, lx, ly - 8, col, { size: 21, mono: true, align: 'center', fg: '#fff' }));
    });
  }

  // ==========================================
  // SAHNALAR
  // ==========================================

  // 1-SAHNA: Kirish
  function sIntro(t) {
    ground(1);
    building(t, (i) => ({
      a: P(t, 0.4 + i * 0.25, 0.4),
      lift: (1 - eo(P(t, 0.4 + i * 0.25, 0.7))) * 4,
      glow: i === 5 ? P(t, 2.0, 0.8) : 0
    }));
    const k = eo(P(t, 1.0, 0.9));
    withA(k, () => {
      text('FSD', 80, 140 + (1 - k) * 30, { size: 150, weight: 800, color: '#3b5bdb' });
      text('12-bob · app qatlami', 86, 245 + (1 - k) * 30, { size: 46, weight: 700 });
      text('Ilovani Ishga Tushirish va Provayderlar', 88, 305 + (1 - k) * 30, { size: 32, color: C.soft });
    });
  }

  // 2-SAHNA: App qatlami vazifasi
  function sVazifasi(t) {
    title('App Qatlami Vazifasi', 'Texnik sozlamalar, kirish nuqtasi va provayderlar', t, L('L2').s - 0.3);
    ground(1);

    const kSegs = P(t, W('L3', 'segmentlardan'), 0.6);

    building(t, (i) => ({
      lift: 0,
      a: i === 5 ? 1 : 0.35,
      glow: i === 5 ? 0.9 : 0,
      dim: i < 5
    }), {
      onFloor: (i, zTop) => {
        if (i === 5) drawAppSegments(zTop, kSegs, t);
      }
    });

    floorLabel(5, 1, 0, false);

    const kc = P(t, L('L2').s, 0.5);
    card(240, 240, kc);
    withA(kc, () => {
      text("Arxitektura Cho'qqisi (App)", PX + 36, 290, { size: 30, weight: 800, color: '#a78bfa' });
      text("App — butun ilovani yig'uvchi boshqaruv pulti:", PX + 36, 335, { size: 23, color: C.soft });
      text("entrypoint, routes, providers, styles", PX + 36, 375, { size: 21, fam: MONO, weight: 700, color: '#7c3aed' });
      text("Shared kabi slice'siz: to'g'ridan-to'g'ri segmentlar.", PX + 36, 420, { size: 22, color: C.soft });
      text("Texnik sozlamalar va umumiy ulanishlar yashaydi.", PX + 36, 455, { size: 22, color: C.soft });
    });

    const kOnlyCard = P(t, L('L4').s, 0.5);
    card(510, 200, kOnlyCard);
    withA(kOnlyCard, () => {
      text("Faqat Yig'ish Joyi (No Business Logic)", PX + 36, 560, { size: 27, weight: 800, color: C.amber });
      text("App ichida biznes UI yoki domen mantiqi yozilmaydi.", PX + 36, 605, { size: 22, color: C.soft });
      text("Sahifa komponentlari — pages qatlamida.", PX + 36, 645, { size: 22, color: C.soft });
      text("Tugma va modallar — shared/ui yoki features'da.", PX + 36, 680, { size: 21, weight: 700, color: C.ink });
    });
  }

  // 3-SAHNA: Segmentlar
  function sSegmentlar(t) {
    title('App Segmentlari Tuzilishi', 'entrypoint, providers, routes va styles', t, L('L5').s - 0.3);
    ground(1);

    building(t, (i) => ({ a: i === 5 ? 1 : 0.35 }), {
      onFloor: (i, zTop) => {
        if (i === 5) drawAppSegments(zTop, 1, t);
      }
    });
    floorLabel(5, 1, 0, false);

    const segs = [
      ['entrypoint', 'Ilovaning kirish nuqtasi', 'createRoot(root).render(...)', '#a78bfa', L('L5').s],
      ['providers', 'Kontekst va mijoz sozlamalari', 'TanStack Query, ThemeProvider, i18n', '#7c3aed', L('L6').s],
      ['routes', 'Markaziy marshrutlar daraxti', 'createBrowserRouter, lazy import pages', '#3b82f6', L('L7').s],
    ];

    segs.forEach(([name, desc, rule, col, at], j) => {
      const k = P(t, at, 0.4);
      const y = 240 + j * 180;
      card(y, 160, k);
      withA(k, () => {
        pill(name, PX + 36, y + 45, col, { size: 24, mono: true });
        text(desc, PX + 190, y + 46, { size: 26, weight: 700 });
        text('• ' + rule, PX + 36, y + 105, { size: 21, fam: MONO, weight: 600, color: C.soft });
      });
    });
  }

  // 4-SAHNA: Router va ulanish
  function sRouterVaUlanish(t) {
    title('Router va Kirish Nuqtasi', 'app/routes/router.tsx va app/entrypoint/main.tsx', t, L('L8').s - 0.3);
    ground(1);

    building(t, (i) => ({ a: i === 5 ? 1 : 0.3 }), {
      onFloor: (i, zTop) => {
        if (i === 5) drawAppSegments(zTop, 1, t);
      }
    });

    const kCode = P(t, L('L8').s, 0.5);
    withA(kCode, () => {
      panel(PX, 230, PW, 390, { dark: true, title: 'app/routes/router.tsx (Lazy Loading)' });
      const cy = 285;
      text("export const router = createBrowserRouter([", PX + 36, cy, { size: 20, fam: MONO, color: '#a78bfa' });
      text("  {", PX + 36, cy + 30, { size: 20, fam: MONO, color: '#e2e8f0' });
      text("    path: ROUTES.home,", PX + 36, cy + 58, { size: 20, fam: MONO, color: '#38bdf8' });
      text("    lazy: async () => {", PX + 36, cy + 86, { size: 20, fam: MONO, color: '#e2e8f0' });
      text("      const { HomePage } = await import('@/pages/home')", PX + 36, cy + 114, { size: 18, fam: MONO, color: '#4ade80' });
      text("      return { Component: HomePage }", PX + 36, cy + 142, { size: 18, fam: MONO, color: '#4ade80' });
      text("    },", PX + 36, cy + 170, { size: 20, fam: MONO, color: '#e2e8f0' });
      text("  },", PX + 36, cy + 198, { size: 20, fam: MONO, color: '#e2e8f0' });
      text("  {", PX + 36, cy + 226, { size: 20, fam: MONO, color: '#e2e8f0' });
      text("    path: ROUTES.catalog,", PX + 36, cy + 254, { size: 20, fam: MONO, color: '#38bdf8' });
      text("    lazy: () => import('@/pages/catalog'),", PX + 36, cy + 282, { size: 19, fam: MONO, color: '#4ade80' });
      text("  },", PX + 36, cy + 310, { size: 20, fam: MONO, color: '#e2e8f0' });
      text("])", PX + 36, cy + 338, { size: 20, fam: MONO, color: '#a78bfa' });
    });

    const kMain = P(t, L('L10').s, 0.5);
    withA(kMain, () => {
      panel(PX, 640, PW, 200, { dark: true, title: 'app/entrypoint/main.tsx' });
      const cy = 690;
      text("// Provayderlar va router ildiz elementiga ulanadi:", PX + 36, cy, { size: 19, fam: MONO, color: '#94a3b8' });
      text("createRoot(document.getElementById('root')!).render(", PX + 36, cy + 35, { size: 20, fam: MONO, color: '#a78bfa' });
      text("  <QueryProvider>", PX + 36, cy + 68, { size: 20, fam: MONO, color: '#38bdf8' });
      text("    <RouterProvider router={router} />", PX + 36, cy + 98, { size: 20, fam: MONO, color: '#4ade80' });
      text("  </QueryProvider>", PX + 36, cy + 128, { size: 20, fam: MONO, color: '#38bdf8' });
    });
  }

  // 5-SAHNA: Import qoidasi
  function sImportQoidasi(t) {
    title("Pastdan Yuqoriga Import Taqiqi", "App hamma qatlamni oladi, pastdagilar app'dan ololmaydi", t, L('L11').s - 0.3);
    ground(1);

    const tDown = W('L11', 'barcha');
    const tErr = W('L12', 'store');

    building(t, (i) => ({
      a: 1,
      glow: i === 5 ? 0.9 : 0
    }));

    // Yuqoridan pastga yashil oqim
    if (t > tDown) {
      const [ax, ay] = proj(2.0, 2.5, floorZ(5) + FH + 0.3);
      const [bx, by] = proj(2.0, 2.5, floorZ(4) + 0.2);
      arrow2(ax, ay, bx, by, C.green, P(t, tDown, 0.4), { w: 9 });
    }

    // Pastdan yuqoriga taqiqlangan qizil strelka
    if (t > tErr) {
      const [px, py] = proj(4.5, 2.5, floorZ(4) + FH + 0.2);
      const [ax, ay] = proj(4.5, 2.5, floorZ(5) + 0.2);
      arrow2(px, py, ax, ay, C.red, P(t, tErr, 0.4), { w: 9, dash: [10, 8] });
      crossB((px + ax) / 2, (py + ay) / 2, P(t, tErr + 0.3, 0.4), 0.8);
    }

    const kc = P(t, L('L11').s, 0.5);
    card(240, 230, kc);
    withA(kc, () => {
      text("Oltin Qoida: Qatlamlar Yo'nalishi", PX + 36, 290, { size: 30, weight: 800, color: C.green });
      text("app --> pages, widgets, features, entities, shared  ✅", PX + 36, 340, { size: 20, fam: MONO, weight: 700, color: C.green });
      text("App eng yuqorida bo'lgani uchun barcha quyi qatlamlarni", PX + 36, 385, { size: 22, color: C.soft });
      text("erkin import qilib, ilovani to'liq yig'ish huquqiga ega.", PX + 36, 420, { size: 22, color: C.soft });
      check(PX + PW - 50, 290, 1, C.green, 0.7);
    });

    const kErrCard = P(t, tErr, 0.5);
    card(500, 250, kErrCard);
    withA(kErrCard, () => {
      text("Qat'iyan Taqiq: Pastdan Yuqoriga Import", PX + 36, 550, { size: 29, weight: 800, color: C.red });
      text("pages/home  -->  app/store  ❌", PX + 36, 595, { size: 22, fam: MONO, weight: 700, color: C.red });
      text("Hech bir sahifa yoki widget app'dan import qilmaydi.", PX + 36, 635, { size: 22, color: C.soft });
      text("Marshrut URL'lari ham shared/routes da saqlanadi.", PX + 36, 670, { size: 22, color: C.soft });
      text("Bu arxitekturada siklik bog'lanishlarning oldini oladi.", PX + 36, 705, { size: 22, color: C.soft });
      crossB(PX + PW - 50, 550, 1, 0.7);
    });
  }

  // 6-SAHNA: Steiger
  function sSteiger(t) {
    title("Steiger Tekshiruvi va Qoidalar", "no-higher-layer-imports nazorati", t, L('L13').s - 0.3);
    ground(1);

    const tErr = W('L13', 'Stayger') + 0.8;
    const tClean = W('L14', 'barqaror');

    building(t, (i) => ({
      a: 1,
      red: t > tErr && t < tClean && i === 4,
      green: t >= tClean && i === 5
    }));

    const kTerminal = P(t, L('L13').s, 0.5);
    withA(kTerminal, () => {
      panel(PX, 240, PW, 580, { dark: true, title: 'terminal · steiger ./src' });
      let ty = 300;
      text("$ npx steiger ./src", PX + 36, ty, { size: 22, fam: MONO, color: '#38bdf8' });

      if (t > tErr && t < tClean) {
        ty += 60;
        text("✖ fsd/no-higher-layer-imports", PX + 36, ty, { size: 24, fam: MONO, color: '#f87171', weight: 800 });
        ty += 40;
        text("  src/pages/home/ui/HomePage.tsx", PX + 36, ty, { size: 20, fam: MONO, color: '#e2e8f0' });
        ty += 30;
        text("  imports from '@/app/store'", PX + 36, ty, { size: 20, fam: MONO, color: '#f87171' });
        ty += 35;
        text("  Lower layer 'pages' cannot import from higher layer 'app'.", PX + 36, ty, { size: 19, fam: MONO, color: '#94a3b8' });

        ty += 70;
        text("Failed: 1 architectural violation found!", PX + 36, ty, { size: 22, fam: MONO, color: '#f87171', weight: 700 });
      }

      if (t >= tClean) {
        ty += 60;
        text("✔ fsd/no-higher-layer-imports passed", PX + 36, ty, { size: 22, fam: MONO, color: '#4ade80', weight: 700 });
        ty += 40;
        text("✔ fsd/no-cross-imports passed", PX + 36, ty, { size: 22, fam: MONO, color: '#4ade80', weight: 700 });
        ty += 40;
        text("✔ fsd/public-api passed", PX + 36, ty, { size: 22, fam: MONO, color: '#4ade80', weight: 700 });
        ty += 60;
        text("Passed: 0 errors. App cleanly orchestrates the project!", PX + 36, ty, { size: 21, fam: MONO, color: '#4ade80', weight: 700 });
      }
    });
  }

  // 7-SAHNA: Xulosa
  function sXulosa(t) {
    title("Xulosa: App Qatlami", "Qoidalar va keyingi qadam", t, L('L15').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: 1,
      glow: i === 5 ? 0.9 : 0
    }));

    LAYERS.forEach((_, i) => floorLabel(i, 1, 0, false));

    const kCard = P(t, L('L15').s, 0.5);
    card(240, 380, kCard);
    withA(kCard, () => {
      text("App Qoidalarining Xulosasi", PX + 36, 285, { size: 30, weight: 800, color: '#a78bfa' });
      const points = [
        ["1. Arxitektura Cho'qqisi", "Butun ilovani yig'uvchi va ishga tushiruvchi qatlam"],
        ["2. Slice'siz Qatlam", "To'g'ridan-to'g'ri texnik segmentlardan tashkil topadi"],
        ["3. Qat'iy Import Qoidasi", "Pastki qatlamlar hech qachon app'dan import qilmaydi"],
        ["4. URL Konstantalari", "Havolalar uchun URL'lar shared/routes da saqlanadi"],
      ];
      points.forEach(([h, d], j) => {
        const py = 335 + j * 66;
        text(h, PX + 36, py, { size: 21, weight: 700, color: C.ink });
        text('— ' + d, PX + 36, py + 26, { size: 19, color: C.soft });
      });
    });

    const kNext = P(t, L('L16').s, 0.5);
    card(640, 180, kNext);
    withA(kNext, () => {
      text("Keyingi Bob: 13 — slice guruhlari", PX + 36, 690, { size: 30, weight: 800, color: '#38bdf8' });
      text("Yirik loyihalarni guruhlash va papkalarni tartibga solish.", PX + 36, 740, { size: 22, color: C.soft });
      text("E'tiboringiz uchun rahmat!", PX + 36, 780, { size: 24, weight: 700, color: C.ink });
      check(PX + PW - 50, 690, 1, '#38bdf8', 0.7);
    });
  }

  const SCENES = {
    intro: sIntro,
    vazifasi: sVazifasi,
    segmentlar: sSegmentlar,
    router_va_ulanish: sRouterVaUlanish,
    import_qoidasi: sImportQoidasi,
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
  window.DURATION = TM.end;
  window.renderPoster = () => {
    render(0.001);
    ctx.globalAlpha = 1;
    cam = { tx: 620, ty: -40, z: 0.78 };
    sky(3);
    ground(1);
    building(6, (i) => ({ glow: i === 5 ? 0.9 : 0 }));
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#3b5bdb' });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('12-bob · app qatlami', 1158, 545, { size: 34, color: C.soft });
  };

  if (typeof location !== 'undefined' && location.hash === '#play') {
    const t0 = performance.now();
    const loop = () => { render(((performance.now() - t0) / 1000) % TM.end); requestAnimationFrame(loop); };
    document.fonts.ready.then(loop);
  } else render(0);
})();
