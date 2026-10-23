// FSD 8-bob videosi: "entities" — biznes obyektlar modeli va harakat qoidasi
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
      if (s.glow > 0) withA(s.glow, () => { const pts = [proj(0, 0, z + FH), proj(BW, 0, z + FH), proj(BW, BD, z + FH), proj(0, BD, z + FH)]; ctx.save(); ctx.shadowColor = s.red ? C.red : '#fff'; ctx.shadowBlur = 40; poly(pts, null, s.red ? C.red : '#fff', 4); ctx.restore(); });
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
  const ENT_CAM = [280, ((4 + 2.5) * U) / 2 - (floorZ(1) + 1.2) * U, 1.15];
  function camera(t) {
    const s = TM.scenes;
    const frames = [
      [0, [-160, -30, 0.95]],
      [s.tushuncha.s, ENT_CAM],
      [s.segmentlar.s, SIDE],
      [s.harakat_qoidasi.s, SIDE],
      [s.cross_import.s, ENT_CAM],
      [s.steiger.s, SIDE],
      [s.xulosa.s, [90, -60, 0.65]],
    ];
    const v = kfv(t, frames, 1.6);
    cam = { tx: v[0], ty: v[1], z: v[2] };
  }

  const PX = 1120, PW = 740;
  function card(y, h, k) { withA(k, () => panel(PX, y + (1 - eo(k)) * 20, PW, h)); }

  // Entities qavati xonalari (slices)
  const ENT_SLICES = [
    ['product', 0.5, 0.6, 3.2, 3.8, '#fb7185'],
    ['order', 4.3, 0.6, 3.2, 1.8, '#f43f5e'],
    ['user', 4.3, 2.6, 3.2, 1.8, '#fda4af'],
  ];

  function drawEntitySlices(zTop, k, t) {
    if (k <= 0) return;
    ENT_SLICES.forEach(([name, x, y, w, d, col], idx) => {
      const kr = P(k, idx * 0.15, 0.4);
      if (kr <= 0) return;
      const h = 1.0 * eback(kr);
      box(x, y, zTop, w, d, h, col, { a: clamp(kr * 2), shadow: false });
      const [lx, ly] = proj(x + w / 2, y + d / 2, zTop + h);
      withA(clamp(kr * 1.5), () => pill(name, lx, ly - 8, col, { size: 22, mono: true, align: 'center', fg: '#fff' }));
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
      glow: i === 1 ? P(t, 2.0, 0.8) : 0
    }));
    const k = eo(P(t, 1.0, 0.9));
    withA(k, () => {
      text('FSD', 80, 140 + (1 - k) * 30, { size: 150, weight: 800, color: '#3b5bdb' });
      text('8-bob · entities qatlami', 86, 245 + (1 - k) * 30, { size: 46, weight: 700 });
      text('Biznes Obyektlari va Ma’lumot Modeli', 88, 305 + (1 - k) * 30, { size: 32, color: C.soft });
    });
  }

  // 2-SAHNA: Real dunyo tushunchalari va slice'lar
  function sTushuncha(t) {
    title('entities — biznes otlari', 'user, product, order mustaqil slice sifatida', t, L('L2').s - 0.3);
    ground(1);

    const kSlices = P(t, W('L3', 'slays'), 0.6);

    building(t, (i) => ({
      lift: i > 1 ? 3.5 : 0,
      a: i === 1 ? 1 : 0.4,
      glow: i === 1 ? 0.8 : 0,
      dim: i !== 1
    }), {
      onFloor: (i, zTop) => {
        if (i === 1) drawEntitySlices(zTop, kSlices, t);
      }
    });

    floorLabel(1, 1, 0, false);

    const kc = P(t, L('L2').s, 0.5);
    card(240, 200, kc);
    withA(kc, () => {
      text('Biznes Otlari (Entities)', PX + 36, 290, { size: 32, weight: 800, color: '#fb7185' });
      text("Mahsulotni tasvirlashda ishlatiladigan otlar:", PX + 36, 335, { size: 24, color: C.soft });
      text("product (mahsulot), order (buyurtma), user", PX + 36, 375, { size: 20, fam: MONO, weight: 700, color: C.ink });
      text("Ilovaning asosiy ma'lumot qoliplari shu yerda yashaydi.", PX + 36, 415, { size: 22, color: C.soft });
    });

    const kSliceCard = P(t, L('L3').s, 0.5);
    card(470, 210, kSliceCard);
    withA(kSliceCard, () => {
      text("Mustaqil Slice'lar", PX + 36, 520, { size: 30, weight: 800 });
      text("Shared'dan farqli ravishda entities slice'larga bo'linadi:", PX + 36, 565, { size: 24, color: C.soft });
      text("entities/product/  va  entities/order/", PX + 36, 605, { size: 24, fam: MONO, weight: 700, color: C.ink });
      text("Har bir slice o'z public API darvozasiga ega.", PX + 36, 645, { size: 23, color: C.soft });
    });

    const kApiCard = P(t, W('L4', 'pablik'), 0.5);
    card(710, 160, kApiCard);
    withA(kApiCard, () => {
      text("Public API Shartnomasi", PX + 36, 760, { size: 30, weight: 800, color: C.green });
      text("Tashqi modullar faqat index.ts orqali kiradi:", PX + 36, 805, { size: 23, color: C.soft });
      text("export { ProductCard, type Product } from './ui/index'", PX + 36, 840, { size: 21, fam: MONO, weight: 700, color: C.ink });
    });
  }

  // 3-SAHNA: Segmentlar: model, ui, api
  function sSegmentlar(t) {
    title('Entity Ichki Tuzilishi', 'model, ui, api segmentlari', t, L('L5').s - 0.3);
    ground(1);

    building(t, (i) => ({ a: i === 1 ? 1 : 0.35, lift: i > 1 ? 4 : 0 }), {
      onFloor: (i, zTop) => {
        if (i === 1) drawEntitySlices(zTop, 1, t);
      }
    });
    floorLabel(1, 1, 0, false);

    const segs = [
      ['model', 'Tiplar, validatsiya va biznes qoidalari', 'isInStock(product), canBeCancelled(order)', '#fbbf24', L('L5').s],
      ['ui', 'Qayta ishlatiladigan ko‘rinish', 'ProductCard, UserAvatar (harakatsiz)', '#38bdf8', L('L6').s],
      ['api', 'Faqat ob’ektga xos maxsus so‘rovlar', 'Oddiy CRUD so‘rovlar shared/api da yaxshiroq', '#a855f7', L('L7').s],
    ];

    segs.forEach(([name, desc, rule, col, at], j) => {
      const k = P(t, at, 0.4);
      const y = 240 + j * 180;
      card(y, 160, k);
      withA(k, () => {
        pill(name, PX + 36, y + 45, col, { size: 24, mono: true });
        text(desc, PX + 160, y + 46, { size: 26, weight: 700 });
        text('• ' + rule, PX + 36, y + 105, { size: 23, weight: 600, color: C.soft });
      });
    });
  }

  // 4-SAHNA: Harakat qoidasi — actions tashqaridan
  function sHarakatQoidasi(t) {
    title("Harakat Qoidasi: Action Tashqaridan", "ProductCard savatga qo'shishni bilmaydi!", t, L('L8').s - 0.3);
    ground(1);

    building(t, (i) => ({ a: i === 1 ? 1 : 0.3, lift: i > 1 ? 4 : 0 }), {
      onFloor: (i, zTop) => {
        if (i === 1) drawEntitySlices(zTop, 1, t);
      }
    });

    const kCode = P(t, L('L8').s, 0.5);
    withA(kCode, () => {
      panel(PX, 240, PW, 320, { dark: true, title: 'entities/product/ui/ProductCard.tsx' });
      const cy = 300;
      text("export function ProductCard({ product, actions }: Props) {", PX + 36, cy, { size: 21, fam: MONO, color: '#fbbf24' });
      text("  return (", PX + 36, cy + 32, { size: 21, fam: MONO, color: '#e2e8f0' });
      text("    <article class=\"card\">", PX + 36, cy + 64, { size: 21, fam: MONO, color: '#e2e8f0' });
      text("      <img src={product.imageUrl} />", PX + 36, cy + 96, { size: 21, fam: MONO, color: '#38bdf8' });
      text("      <h3>{product.title}</h3>", PX + 36, cy + 128, { size: 21, fam: MONO, color: '#38bdf8' });
      text("      {actions}  {/* Tugma slot/props orqali beriladi! */}", PX + 36, cy + 164, { size: 21, fam: MONO, color: '#4ade80', weight: 700 });
      text("    </article>", PX + 36, cy + 200, { size: 21, fam: MONO, color: '#e2e8f0' });
      text("  )", PX + 36, cy + 232, { size: 21, fam: MONO, color: '#e2e8f0' });
      text("}", PX + 36, cy + 264, { size: 21, fam: MONO, color: '#fbbf24' });
    });

    const kComp = P(t, W('L9', 'slot'), 0.5);
    withA(kComp, () => {
      panel(PX, 590, PW, 240, { dark: true, title: 'pages/catalog/ui/CatalogPage.tsx (Kompozitsiya)' });
      const cy = 650;
      text("// Kompozitsiya yuqori qatlamda birlashtiriladi:", PX + 36, cy, { size: 20, fam: MONO, color: '#94a3b8' });
      text("<ProductCard", PX + 36, cy + 40, { size: 22, fam: MONO, color: '#fbbf24' });
      text("  product={p}", PX + 36, cy + 72, { size: 22, fam: MONO, color: '#38bdf8' });
      text("  actions={<AddToCartButton productId={p.id} />}", PX + 36, cy + 104, { size: 22, fam: MONO, color: '#4ade80', weight: 700 });
      text("/>", PX + 36, cy + 136, { size: 22, fam: MONO, color: '#fbbf24' });
    });
  }

  // 5-SAHNA: Cross-import taqiqi
  function sCrossImport(t) {
    title("Cross-Import Taqiqi", "entity'lar bir-birini import qila olmaydi", t, L('L11').s - 0.3);
    ground(1);

    const tCross = W('L11', 'import');
    const tUp = W('L12', 'fichers');

    building(t, (i) => ({
      a: i === 1 ? 1 : 0.4,
      lift: i > 1 ? 3.5 : 0
    }), {
      onFloor: (i, zTop) => {
        if (i === 1) drawEntitySlices(zTop, 1, t);
      }
    });

    // Qavat 1 ustida order dan product ga gorizontal qizil chiziq
    if (t > tCross) {
      const [ax, ay] = proj(4.3, 1.5, floorZ(1) + FH + 0.5);
      const [bx, by] = proj(3.7, 1.5, floorZ(1) + FH + 0.5);
      arrow2(ax, ay, bx, by, C.red, P(t, tCross, 0.4), { w: 9, dash: [10, 8] });
      crossB((ax + bx) / 2, (ay + by) / 2, P(t, tCross + 0.3, 0.4), 0.8);
    }

    // Yuqoriga yashil strelkalar: kompozitsiya yuqorida
    if (t > tUp) {
      const [px, py] = proj(2.0, 2.5, floorZ(1) + FH + 0.5);
      const [fx, fy] = proj(2.0, 2.5, floorZ(2) + 3.5);
      arrow2(px, py, fx, fy, C.green, P(t, tUp, 0.5), { w: 8 });
    }

    const kc = P(t, L('L11').s, 0.5);
    card(240, 220, kc);
    withA(kc, () => {
      text("Cross-Import Qat'iyan Man Etiladi", PX + 36, 290, { size: 30, weight: 800, color: C.red });
      text("entities/order  -->  entities/product  ❌", PX + 36, 340, { size: 24, fam: MONO, weight: 700, color: C.red });
      text("Bitta entity boshqa entity'ni bevosita import qilsa,", PX + 36, 385, { size: 23, color: C.soft });
      text("ular bir-biriga bog'lanib qoladi va ajratib bo'lmaydi.", PX + 36, 420, { size: 23, color: C.soft });
      crossB(PX + PW - 50, 340, 1, 0.7);
    });

    const kSolution = P(t, tUp, 0.5);
    card(490, 240, kSolution);
    withA(kSolution, () => {
      text("To'g'ri Yechim: Yuqorida Birlashtirish", PX + 36, 540, { size: 30, weight: 800, color: C.green });
      text("O'zaro munosabatlarni features yoki pages hal qiladi:", PX + 36, 590, { size: 23, color: C.soft });
      text("features/add-to-cart  ikkala entity'ni birlashtiradi.", PX + 36, 630, { size: 22, fam: MONO, weight: 700, color: C.ink });
      text("Natijada entity'lar butunlay toza va mustaqil qoladi.", PX + 36, 675, { size: 23, color: C.soft });
      check(PX + PW - 50, 540, 1, C.green, 0.7);
    });
  }

  // 6-SAHNA: Steiger
  function sSteiger(t) {
    title("Steiger Tekshiruvi va Xatolar", "no-cross-imports qoidasi amalda", t, L('L13').s - 0.3);
    ground(1);

    const tErr = W('L13', 'stayger') + 0.8;
    const tClean = W('L14', 'mustaqil');

    building(t, (i) => ({
      a: i === 1 ? 1 : 0.3,
      red: t > tErr && t < tClean && i === 1,
      green: t >= tClean && i === 1
    }));

    const kTerminal = P(t, L('L13').s, 0.5);
    withA(kTerminal, () => {
      panel(PX, 240, PW, 580, { dark: true, title: 'terminal · steiger ./src' });
      let ty = 300;
      text("$ npx steiger ./src", PX + 36, ty, { size: 22, fam: MONO, color: '#38bdf8' });

      if (t > tErr && t < tClean) {
        ty += 60;
        text("✖ fsd/no-cross-imports", PX + 36, ty, { size: 24, fam: MONO, color: '#f87171', weight: 800 });
        ty += 40;
        text("  src/entities/order/model/types.ts", PX + 36, ty, { size: 20, fam: MONO, color: '#e2e8f0' });
        ty += 30;
        text("  imports from '@/entities/product'", PX + 36, ty, { size: 20, fam: MONO, color: '#f87171' });
        ty += 35;
        text("  Cross-imports between slices of 'entities' are forbidden.", PX + 36, ty, { size: 19, fam: MONO, color: '#94a3b8' });

        ty += 70;
        text("Failed: 1 architectural violation found!", PX + 36, ty, { size: 22, fam: MONO, color: '#f87171', weight: 700 });
      }

      if (t >= tClean) {
        ty += 60;
        text("✓ No FSD violations found!", PX + 36, ty, { size: 26, fam: MONO, color: '#4ade80', weight: 800 });
        ty += 45;
        text("  Entities are completely decoupled.", PX + 36, ty, { size: 21, fam: MONO, color: '#e2e8f0' });
        ty += 30;
        text("  Composition handled correctly in upper layers.", PX + 36, ty, { size: 21, fam: MONO, color: '#e2e8f0' });
        ty += 50;
        text("  Barcha entity slice'lari to'liq mustaqil!", PX + 36, ty, { size: 22, fam: MONO, color: '#38bdf8', weight: 700 });
      }
    });
  }

  // 7-SAHNA: Xulosa
  function sXulosa(t) {
    title("Xulosa va Keyingi Qadam", "entities qatlamining uch ustuni", t, L('L15').s - 0.3);
    ground(1);

    building(t, (i) => ({
      a: 1,
      glow: i === 1 ? 0.9 : 0
    }), {
      onFloor: (i, zTop) => {
        if (i === 1) drawEntitySlices(zTop, 1, t);
      }
    });
    LAYERS.forEach((_, i) => floorLabel(i, 1, 0, false));

    const kc = P(t, L('L15').s, 0.5);
    card(240, 360, kc);
    withA(kc, () => {
      text("entities — Uch Asosiy Tamoyil", PX + 36, 290, { size: 32, weight: 800, color: '#fb7185' });
      const points = [
        ["1. Real dunyo tushunchalari", "Biznes otlari: user, product, order."],
        ["2. Mustaqil slice'lar", "Cross-import taqiqlangan, har biri alohida."],
        ["3. Harakat tashqaridan", "UI harakat tugmasini bilmaydi, slot/props orqali beriladi."],
      ];
      points.forEach(([h, d], j) => {
        text(h, PX + 36, 350 + j * 70, { size: 26, weight: 700 });
        text(d, PX + 36, 385 + j * 70, { size: 22, color: C.soft });
      });
    });

    const kNext = P(t, L('L16').s, 0.5);
    card(630, 180, kNext);
    withA(kNext, () => {
      text("Keyingi Bob:", PX + 36, 680, { size: 28, weight: 800, color: '#fbbf24' });
      text("09 — features (Foydalanuvchi harakatlari)", PX + 36, 730, { size: 26, weight: 700 });
      text("E'tiboringiz uchun rahmat!", PX + 36, 770, { size: 24, color: C.soft });
    });
  }

  // ==========================================
  // ASOSIY SIKL
  // ==========================================
  const SCENES = {
    intro: sIntro,
    tushuncha: sTushuncha,
    segmentlar: sSegmentlar,
    harakat_qoidasi: sHarakatQoidasi,
    cross_import: sCrossImport,
    steiger: sSteiger,
    xulosa: sXulosa,
  };

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    camera(t);
    sky(t);

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
    building(6, (i) => ({ glow: i === 1 ? 0.9 : 0 }));
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#3b5bdb' });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('8-bob · entities qatlami', 1158, 545, { size: 34, color: C.soft });
  };

  if (typeof location !== 'undefined' && location.hash === '#play') {
    const t0 = performance.now();
    const loop = () => { render(((performance.now() - t0) / 1000) % TM.end); requestAnimationFrame(loop); };
    document.fonts.ready.then(loop);
  } else render(0);
})();
