// FSD 17-bob videosi: "Desegmentatsiya va nomlash" — domen bo'yicha jamlash va aniq nomlash
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
      if (s.glow > 0) withA(s.glow, () => { const pts = [proj(0, 0, z + FH), proj(BW, 0, z + FH), proj(BW, BD, z + FH), proj(0, BD, z + FH)]; ctx.save(); ctx.shadowColor = s.red ? C.red : '#10b981'; ctx.shadowBlur = 40; poly(pts, null, s.red ? C.red : '#10b981', 4); ctx.restore(); });
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

  const SIDE = [330, -10, 0.92];
  const PAGES_CAM = [280, ((4 + 2.5) * U) / 2 - (floorZ(4) + 1.2) * U, 1.15];
  function camera(t) {
    const s = TM.scenes;
    const frames = [
      [0, [-160, -30, 0.95]],
      [s.muammolar.s, SIDE],
      [s.domen_boyicha.s, PAGES_CAM],
      [s.nomlash_qoidalari.s, SIDE],
      [s.istisnolar_va_xatolar.s, SIDE],
      [s.steiger.s, SIDE],
      [s.xulosa.s, [90, -60, 0.65]],
    ];
    const v = kfv(t, frames, 1.6);
    cam = { tx: v[0], ty: v[1], z: v[2] };
  }

  const PX = 1120, PW = 740;
  function card(y, h, k) { withA(k, () => panel(PX, y + (1 - eo(k)) * 20, PW, h)); }

  function drawSlicePill(x, y, zTop, name, col, k) {
    if (k <= 0) return;
    const [px, py] = proj(x, y, zTop);
    withA(k, () => {
      pill(name, px, py - 15, col, { size: 19, mono: true, align: 'center', fg: '#fff' });
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
      glow: (i === 0 || i === 4) ? P(t, 2.0, 0.8) : 0
    }));
    const k = eo(P(t, 1.0, 0.9));
    withA(k, () => {
      text('FSD', 80, 140 + (1 - k) * 30, { size: 150, weight: 800, color: '#3b5bdb' });
      text('17-bob · desegmentatsiya va nomlash', 86, 245 + (1 - k) * 30, { size: 44, weight: 700 });
      text('Texnik Sochilish Xatosi va Domenli Jamlanish', 88, 305 + (1 - k) * 30, { size: 32, color: C.soft });
    });

    const kBad = P(t, L('L2').s, 0.6);
    card(410, 280, kBad);
    withA(kBad, () => {
      text("❌ Desegmentatsiya (Texnik Sochilish)", PX + 36, 455, { size: 27, weight: 800, color: C.red });
      text("app/components/DeliveryCard.tsx", PX + 36, 495, { size: 19, fam: MONO, color: C.red });
      text("app/composables/delivery.ts", PX + 36, 525, { size: 19, fam: MONO, color: C.red });
      text("app/utils/delivery.ts", PX + 36, 555, { size: 19, fam: MONO, color: C.red });
      text("app/stores/delivery/actions.ts", PX + 36, 585, { size: 19, fam: MONO, color: C.red });
      text("Bitta 'Yetkazib berish' mantiqi 4-5 papkaga sochilgan!", PX + 36, 630, { size: 21, color: C.soft });
      crossB(PX + PW - 50, 455, 1, 0.7);
    });
  }

  // 2-SAHNA: Muammolar
  function sMuammolar(t) {
    title("Texnik Ajratishning 3 Katta Muammosi", "Nega 'types/' va 'components/' loyihani sekinlashtiradi", t, L('L3').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: 1,
      red: i === 4,
      dim: i !== 4
    }));
    floorLabel(4, 1, 0, false);

    const kProb = P(t, L('L3').s, 0.5);
    card(230, 240, kProb);
    withA(kProb, () => {
      text("1. Past Bog'liqlik (Low Cohesion)", PX + 36, 275, { size: 28, weight: 800, color: C.red });
      text("Yetkazib berish funksiyasini o'zgartirish uchun", PX + 36, 320, { size: 21, color: C.ink });
      text("beshta turli papkadagi fayllarni ochish kerak!", PX + 36, 355, { size: 21, color: C.ink });
      text("Dasturchi doimiy ravishda papkalar orasida sarson.", PX + 36, 400, { size: 21, color: C.soft });
      crossB(PX + PW - 50, 275, 1, 0.7);
    });

    const kCoupling = P(t, L('L4').s, 0.5);
    card(490, 240, kCoupling);
    withA(kCoupling, () => {
      text("2. Kuchli Bog'lanish va Refaktoring Azobi", PX + 36, 535, { size: 28, weight: 800, color: C.red });
      text("Komponentlar o'rtasida yashirin chigal rishtalar.", PX + 36, 580, { size: 21, color: C.ink });
      text("Biror xususiyatni o'chirish yoki almashtirish", PX + 36, 615, { size: 21, color: C.ink });
      text("butun loyihani sindirish xavfiga aylanadi.", PX + 36, 660, { size: 21, color: C.soft });
      crossB(PX + PW - 50, 535, 1, 0.7);
    });
  }

  // 3-SAHNA: Domen bo'yicha guruhlash
  function sDomenBoyicha(t) {
    title("Domen Bo‘yicha Guruhlash", "FSD yondashuvi: barcha bog'liq kodlar bitta papkada", t, L('L5').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: i === 4 ? 1 : 0.35,
      glow: i === 4 ? 0.9 : 0,
      dim: i !== 4
    }), {
      onFloor: (i, zTop) => {
        if (i === 4) drawSlicePill(4.0, 2.5, zTop, 'pages/delivery', '#10b981', 1);
      }
    });
    floorLabel(4, 1, 0, false);

    const kDomain = P(t, L('L6').s, 0.5);
    card(230, 290, kDomain);
    withA(kDomain, () => {
      text("✅ pages/delivery/ — Yagona Domen", PX + 36, 275, { size: 28, weight: 800, color: C.green });
      text("├── ui/    (DeliveryPage, DeliveryCard, RegionSelect)", PX + 36, 320, { size: 19, fam: MONO, color: C.green });
      text("├── model/ (delivery.ts, region.ts)", PX + 36, 355, { size: 19, fam: MONO, color: C.green });
      text("├── api/   (load-delivery-options.ts)", PX + 36, 390, { size: 19, fam: MONO, color: C.green });
      text("└── index.ts", PX + 36, 425, { size: 19, fam: MONO, color: '#94a3b8' });
      text("Barcha yetkazib berish kodi faqat bitta papkada!", PX + 36, 470, { size: 21, color: C.soft });
      check(PX + PW - 50, 275, 1, C.green, 0.7);
    });

    const kSpeed = P(t, L('L7').s, 0.5);
    card(540, 200, kSpeed);
    withA(kSpeed, () => {
      text("O'zgarishlar Tezligi va Izolyatsiya", PX + 36, 580, { size: 26, weight: 800, color: '#0284c7' });
      text("Yetkazib berish o'zgardimi? Faqat shu papka ochiladi.", PX + 36, 620, { size: 21, color: C.ink });
      text("Loyihaning boshqa qismlariga mutlaqo daxl qilmaydi.", PX + 36, 655, { size: 20, color: C.soft });
      check(PX + PW - 50, 580, 1, '#0284c7', 0.7);
    });
  }

  // 4-SAHNA: Nomlash qoidalari
  function sNomlashQoidalari(t) {
    title("Nomlashning Oltin Qoidasi", "Kod QANDAY yozilgani emas, NIMA UCHUN ekani", t, L('L8').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: 1,
      lift: i > 2 ? 3.5 : 0
    }));

    const kAsk = P(t, L('L8').s, 0.5);
    card(230, 240, kAsk);
    withA(kAsk, () => {
      text("Oltin Savol: Nima Uchun vs Qanday?", PX + 36, 275, { size: 28, weight: 800, color: '#8b5cf6' });
      text("❌ types.ts   — qanday (bu shunchaki tip)", PX + 36, 320, { size: 20, fam: MONO, color: C.red });
      text("❌ utils.ts   — qanday (bu yordamchi funksiya)", PX + 36, 355, { size: 20, fam: MONO, color: C.red });
      text("✅ product.ts — nima uchun (mahsulot modeli va tipi)", PX + 36, 395, { size: 20, fam: MONO, color: C.green, weight: 700 });
      text("Har bir fayl nomi biznes maqsadini ifodalasin.", PX + 36, 435, { size: 21, color: C.soft });
      check(PX + PW - 50, 275, 1, '#8b5cf6', 0.7);
    });

    const kTypes = P(t, L('L10').s, 0.5);
    card(490, 240, kTypes);
    withA(kTypes, () => {
      text("Tiplarni Model Yonida Saqlang", PX + 36, 535, { size: 28, weight: 800, color: C.green });
      text("// model/delivery.ts ichida:", PX + 36, 575, { size: 19, fam: MONO, color: '#94a3b8' });
      text("export interface DeliveryOption { id: string; ... }", PX + 36, 610, { size: 19, fam: MONO, color: C.green });
      text("export const formatDeliveryPrice = (price) => ...", PX + 36, 645, { size: 19, fam: MONO, color: C.green });
      text("Alohida types.ts ochib domenlarni aralashtirmang!", PX + 36, 690, { size: 21, color: C.soft });
      check(PX + PW - 50, 535, 1, C.green, 0.7);
    });
  }

  // 5-SAHNA: Istisnolar va xatolar
  function sIstisnolarVaXatolar(t) {
    title("Ruxsat Etilgan Holatlar va Xatolar", "Qachon texnik guruhlash normal, qachon zararli", t, L('L11').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: i === 0 ? 1 : 0.35,
      glow: i === 0 ? 0.9 : 0,
      dim: i !== 0
    }));
    floorLabel(0, 1, 0, false);

    const kShared = P(t, L('L11').s, 0.5);
    card(230, 240, kShared);
    withA(kShared, () => {
      text("Shared: Biznessiz Qatlamdagi Istisno", PX + 36, 275, { size: 28, weight: 800, color: '#0284c7' });
      text("shared/ui ichida 30 ta komponent bo'lishi normal.", PX + 36, 320, { size: 21, color: C.ink });
      text("Chunki shared da biznes domeni yo'q, u sof texnik.", PX + 36, 355, { size: 21, color: C.ink });
      text("Tugmalar, inputlar, modallar umumiy turadi.", PX + 36, 400, { size: 21, color: C.soft });
      check(PX + PW - 50, 275, 1, '#0284c7', 0.7);
    });

    const kJunk = P(t, L('L12').s, 0.5);
    card(490, 250, kJunk);
    withA(kJunk, () => {
      text("❌ shared/lib/utils.ts Axlat Qutisi Emas", PX + 36, 535, { size: 28, weight: 800, color: C.red });
      text("Hamma narsani bitta utils.ts ga tashlamang!", PX + 36, 580, { size: 21, color: C.ink });
      text("Yo'nalishli modullar: shared/lib/date, shared/lib/money", PX + 36, 615, { size: 19, fam: MONO, color: C.green, weight: 700 });
      text("ui/components/ kabi ortiqcha papkalar ham taqiqlanadi.", PX + 36, 660, { size: 21, color: C.soft });
    });
  }

  // 6-SAHNA: Steiger
  function sSteiger(t) {
    title("Steiger Nazorati va Segmentlar", "fsd/forbidden-segments nazorati amalda", t, L('L14').s - 0.3);
    ground(1);

    const tErr = (W('L14', 'Stayger') || L('L14').s) + 1.0;
    const tClean = (W('L15', 'saqlaydi.') || L('L15').s) + 2.0;

    building(t, (i) => ({
      a: 1,
      red: t > tErr && t < tClean && i === 4,
      green: t >= tClean && i === 4
    }));

    const kTerminal = P(t, L('L14').s, 0.5);
    withA(kTerminal, () => {
      panel(PX, 240, PW, 580, { dark: true, title: 'terminal · steiger ./src' });
      let ty = 300;
      text("$ npx steiger ./src", PX + 36, ty, { size: 22, fam: MONO, color: '#38bdf8' });

      if (t > tErr && t < tClean) {
        ty += 60;
        text("✖ fsd/forbidden-segments", PX + 36, ty, { size: 24, fam: MONO, color: '#f87171', weight: 800 });
        ty += 40;
        text("  src/pages/delivery/components/DeliveryCard.tsx", PX + 36, ty, { size: 19, fam: MONO, color: '#e2e8f0' });
        ty += 30;
        text("  Folder 'components' is forbidden inside slice.", PX + 36, ty, { size: 20, fam: MONO, color: '#f87171' });
        ty += 35;
        text("  Use standard segment 'ui' and group by domain.", PX + 36, ty, { size: 19, fam: MONO, color: '#94a3b8' });

        ty += 70;
        text("Failed: 1 architectural violation found!", PX + 36, ty, { size: 22, fam: MONO, color: '#f87171', weight: 700 });
      }

      if (t >= tClean) {
        ty += 60;
        text("✔ fsd/forbidden-segments passed", PX + 36, ty, { size: 22, fam: MONO, color: '#4ade80', weight: 700 });
        ty += 40;
        text("✔ fsd/public-api passed", PX + 36, ty, { size: 22, fam: MONO, color: '#4ade80', weight: 700 });
        ty += 40;
        text("✔ fsd/no-cross-imports passed", PX + 36, ty, { size: 22, fam: MONO, color: '#4ade80', weight: 700 });
        ty += 60;
        text("Passed: 0 errors. Domain grouping verified!", PX + 36, ty, { size: 21, fam: MONO, color: '#4ade80', weight: 700 });
      }
    });
  }

  // 7-SAHNA: Xulosa
  function sXulosa(t) {
    title("Xulosa: Desegmentatsiya va Nomlash", "Qoidalar va keyingi qadam", t, L('L16').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: 1,
      glow: (i === 0 || i === 4) ? 0.9 : 0
    }));

    LAYERS.forEach((_, i) => floorLabel(i, 1, 0, false));

    const kCard = P(t, L('L16').s, 0.5);
    card(240, 420, kCard);
    withA(kCard, () => {
      text("Desegmentatsiya Qoidalarining Xulosasi", PX + 36, 285, { size: 30, weight: 800, color: '#10b981' });
      const points = [
        ["1. Texnik Sochilish — Qat'iy Taqiqlanadi", "Kodni components, hooks kabi papkalarga sochmang"],
        ["2. Domen Bo'yicha Guruhlash", "Bitta biznes imkoniyati bitta slice ichida jamlanadi"],
        ["3. Aniq Nomlash", "types.ts yoki utils.ts emas, delivery.ts, user.ts"],
        ["4. Steiger Linteri Nazorati", "Segmentlar tozaligini avtomatlashtirilgan tekshiruvi"],
      ];
      points.forEach(([h, d], j) => {
        const py = 340 + j * 70;
        text(h, PX + 36, py, { size: 21, weight: 700, color: C.ink });
        text('— ' + d, PX + 36, py + 26, { size: 19, color: C.soft });
      });
      check(PX + PW - 50, 285, 1, '#10b981', 0.7);
    });

    const kNext = P(t, L('L16').s + 4.0, 0.5);
    card(680, 160, kNext);
    withA(kNext, () => {
      text("Keyingi Bob: 18 — Ortiqcha Entity'lar", PX + 36, 725, { size: 27, weight: 800, color: '#3b5bdb' });
      text("Entity'larni haddan tashqari maydalab yuborish xavfi.", PX + 36, 765, { size: 21, color: C.soft });
      text("E'tiboringiz uchun rahmat!", PX + 36, 800, { size: 22, weight: 700, color: C.ink });
      check(PX + PW - 50, 725, 1, '#3b5bdb', 0.7);
    });
  }

  const SCENES = {
    intro: sIntro,
    muammolar: sMuammolar,
    domen_boyicha: sDomenBoyicha,
    nomlash_qoidalari: sNomlashQoidalari,
    istisnolar_va_xatolar: sIstisnolarVaXatolar,
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
    building(6, (i) => ({ glow: (i === 0 || i === 4) ? 0.9 : 0 }));
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#3b5bdb' });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('17-bob · desegmentatsiya va nomlash', 1158, 545, { size: 34, color: C.soft });
  };
})();
