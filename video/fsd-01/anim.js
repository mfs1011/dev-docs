// FSD 1-bob videosi (FSD nima va qachon kerak) — izometrik 3D bino va uzluksiz kamera. Ovoz birinchi: harakatlar aytilgan so'zga bog'langan (SY.W).
// Metafora: qatlam — qavat, slice — xona, segment — quti, public API — eshik (index.ts), import qoidasi — faqat pastga yuradigan lift.
(function () {
  const { L, W } = window.SY;
  const TM = window.TM;
  const cv = document.getElementById('c'), ctx = cv.getContext('2d');
  const SW = 1920, SH = 1080;
  const UI = '"Avenir Next", "Helvetica Neue", Arial, sans-serif', MONO = 'Menlo, Monaco, monospace';
  const C = { ink: '#1f2a44', soft: '#5b6785', green: '#16a34a', red: '#e11d48', white: '#ffffff', amber: '#f59e0b' };
  // Qatlamlar (pastdan yuqoriga) va ranglari
  const LAYERS = [
    { id: 'shared', col: '#94a3b8', uz: 'tugma, API klient' },
    { id: 'entities', col: '#fb7185', uz: 'mahsulot, savat' },
    { id: 'features', col: '#fbbf24', uz: 'savatga qo‘shish' },
    { id: 'widgets', col: '#34d399', uz: 'sarlavha, ro‘yxat' },
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
  // Izometrik quti: ko'rinadigan yuzlar — usti, chap (y+d) va o'ng (x+w)
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
  // Yer usti: katakli izometrik maydon
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

  // ---------- fon ----------
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

  // ---------- bino ----------
  // st(i) -> { a, lift, glow, dim, ghost }
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
  // Qavat yorlig'i: binoning chap old qirrasi yonida
  function floorLabel(i, k, lift = 0, desc = true) {
    if (k <= 0) return;
    const ly = LAYERS[i], [x, y] = proj(0, BD, floorZ(i) + lift + FH / 2);
    withA(k, () => {
      const xx = x - 30 - (1 - eo(k)) * 30;
      const w = pill(ly.id, xx, y, ly.col, { size: 28, align: 'right', mono: true, fg: C.ink });
      if (desc) text(ly.uz, xx - w - 16, y + 1, { size: 26, color: C.soft, align: 'right' });
    });
  }
  // Xonalar (slice'lar) qavat ustida
  const ROOMS = {
    1: [['product', 0.4, 0.6, 3.4, 3.8], ['cart', 4.3, 0.6, 3.3, 3.8]],
    2: [['add-to-cart', 0.4, 0.6, 7.2, 3.8]],
    3: [['header', 0.4, 0.6, 3.4, 3.8], ['product-list', 4.3, 0.6, 3.3, 3.8]],
    4: [['catalog', 0.4, 0.6, 3.4, 3.8], ['cart', 4.3, 0.6, 3.3, 3.8]],
  };
  function rooms(i, zTop, k, o = {}) {
    (ROOMS[i] || []).forEach(([name, x, y, w, d], r) => {
      const kr = o.roomK ? o.roomK(r) : k;
      if (kr <= 0) return;
      const h = 1.1 * eback(kr);
      box(x, y, zTop, w, d, h, o.roomCol ? o.roomCol(r) : shade(LAYERS[i].col, 0.15), { a: (o.roomA ? o.roomA(r) : 1) * clamp(kr * 2), shadow: false });
      const [lx, lyy] = proj(x + w / 2, y + d / 2, zTop + h);
      withA(clamp(kr * 1.5) * (o.labelA ? o.labelA(r) : 1), () => text(name, lx, lyy, { size: 30 * Math.min(1.5, cam.z), weight: 800, fam: MONO, color: C.ink, align: 'center' }));
    });
  }

  // ---------- 2D panellar ----------
  function panel(x, y, w, h, o = {}) {
    ctx.save(); ctx.shadowColor = 'rgba(30,40,70,0.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    ctx.fillStyle = o.dark ? '#111827' : '#ffffff'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill(); ctx.restore();
    if (o.title) {
      ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 24 + i * 20, y + 22, 6, 0, 7); ctx.fill(); });
      text(o.title, x + w / 2, y + 22, { size: 18, weight: 600, fam: MONO, color: o.dark ? '#94a3b8' : C.soft, align: 'center' });
    }
  }
  // Sarlavha olam ustidan chiziladi: sahna oxirida render() navbatdan chiqaradi
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

  // ---------- sahnalar ----------
  // Kamera va bino har sahnada; sahnalar orasida kamera silliq ko'chadi (keyframe'lar global vaqtda)
  const ENT = floorZ(1) + FH;
  const ROOM_CAM = [(4 - 2.5) * U, ((4 + 2.5) * U) / 2 - (ENT + 0.6) * U, 1.55];
  const SEG_CAM = [(2.1 - 2.5) * U, ((2.1 + 2.5) * U) / 2 - (ENT + 0.6) * U, 2.4];
  const SIDE = [330, -10, 0.92];       // bino chapda, panel o'ngda
  function camera(t) {
    const s = TM.scenes;
    const frames = [
      [0, [-160, -30, 0.95]],
      [s.savollar.s, SIDE],
      [s.daraja.s, [90, -30, 0.95]],
      [W('L8', 'qavat') - 0.3, ROOM_CAM],
      [W('L9', 'xona') - 0.3, SEG_CAM],
      [s.kimga.s, SIDE],
      [W('L13', 'bir') - 0.4, [90, -40, 0.5]],
      [W('L14', 'ikkinchisi') - 0.3, SIDE],
      [s.xatolar.s, SIDE],
      [s.xulosa.s, [90, -60, 0.62]],
    ];
    const v = kfv(t, frames, 1.6);
    cam = { tx: v[0], ty: v[1], z: v[2] };
  }

  // O'ng panel: karta (oq) — sarlavha va qatorlar
  const PX = 1150, PW = 720;
  function card(y, h, k) { withA(k, () => panel(PX, y + (1 - eo(k)) * 20, PW, h)); }
  function numDot(n, x, y, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 24, 0, 7); ctx.fill(); text(String(n), x, y + 1, { size: 28, weight: 800, color: '#fff', align: 'center' }); }
  // Bino yonida (o'ng tomonda) qavatga ishora qiluvchi yorliq
  function sideTag(i, s, col, k, lift = 0) {
    if (k <= 0) return;
    const [x, y] = proj(BW, 0, floorZ(i) + lift + FH / 2);
    withA(k, () => pill(s, x + 24 + (1 - eo(k)) * 20, y, col, { size: 24 }));
  }
  // Product xonasining eshigi (public API)
  function door(k) {
    if (k <= 0) return;
    const zTop = ENT;
    const pts = [proj(1.6, 4.4, zTop), proj(2.6, 4.4, zTop), proj(2.6, 4.4, zTop + 0.85), proj(1.6, 4.4, zTop + 0.85)];
    withA(k, () => { poly(pts, '#7c2d12', '#431407', 3); const [dx, dy] = proj(2.1, 4.4, zTop + 1.4); pill('index.ts', dx, dy - 10, '#3b5bdb', { size: 22, mono: true, align: 'center' }); });
  }
  // Kichik bino (bir xillik): o'sha qavatlar, boshqa joyda
  function miniBuilding(ox, oy, a) {
    LAYERS.forEach((ly, i) => box(ox, oy, floorZ(i), BW, BD, FH, ly.col, { a, shadow: i === 0 }));
  }

  function sIntro(t) {
    ground(1);
    building(t, (i) => ({ a: P(t, 0.4 + i * 0.28, 0.4), lift: (1 - eo(P(t, 0.4 + i * 0.28, 0.7))) * 4 }));
    const k = eo(P(t, 1.0, 0.9));
    withA(k, () => {
      text('FSD', 80, 140 + (1 - k) * 30, { size: 150, weight: 800, color: '#3b5bdb' });
      text('1-bob · FSD nima va qachon kerak', 86, 245 + (1 - k) * 30, { size: 46, weight: 700 });
    });
    withA(eo(P(t, W('L1', 'nima'), 0.8)), () => text('nima · nima beradi · qachon kerak', 86, 300, { size: 32, color: C.soft }));
  }

  function sSavollar(t) {
    title('FSD nima', 'kodni tartiblash qoidalari va kelishuvlari', t, L('L2').s - 0.3);
    ground(1);
    const tQ1 = W('L3', 'birinchisi'), tQ2 = W('L4', 'ikkinchisi'), tQ3 = W('L5', 'uchinchisi');
    const q1 = P(t, W('L3', 'papkaga'), 0.6);
    // portlatilgan ko'rinish: 1-savolda (xona) va 3-savolda (eshik) entities'dan yuqori qavatlar ko'tariladi
    const ex = eio(P(t, tQ1, 1.0)) * (1 - eio(P(t, tQ2 - 0.6, 1.0))) + eio(P(t, tQ3, 1.0)) * (1 - eio(P(t, W('L6', 'shuning') - 0.2, 1.0)));
    building(t, (i) => ({ glow: i === 1 ? q1 * (1 - P(t, tQ2, 0.5)) : 0, a: i <= 1 ? 1 : 1 - ex, lift: i > 1 ? ex * 7 : 0 }), {
      onFloor: (i, zTop) => { if (i === 1) rooms(1, zTop, P(t, W('L3', 'papkaga'), 0.8) * (1 - P(t, W('L6', 'shuning') - 0.2, 0.6)), { roomA: (r) => (r === 0 ? 1 : 0.5) }); },
    });
    LAYERS.forEach((_, i) => floorLabel(i, P(t, L('L2').s + i * 0.12, 0.5) * (i <= 1 ? 1 : 1 - ex), 0, false));
    // 1-savol: yo'l — qavat/xona
    withA(q1 * (1 - P(t, tQ2, 0.4)), () => { const [x, y] = proj(2.1, 2.5, ENT + 1.8); pill('src/entities/product/…', x, y - 20, C.ink, { size: 24, mono: true, align: 'center' }); });
    // 2-savol: faqat pastga
    const [ax, ay] = proj(BW + 1.2, 2.5, floorZ(5) + 0.5), [bx, by] = proj(BW + 1.2, 2.5, floorZ(0) + 0.5);
    arrow2(ax, ay, bx, by, C.green, P(t, W('L4', 'import'), 1.0), { w: 8 });
    // 3-savol: eshik
    door(P(t, W('L5', 'interfeysi'), 0.6) * (1 - P(t, W('L6', 'shuning') - 0.2, 0.5)));
    // o'ng panel
    const kDef = P(t, W('L2', 'frontend'), 0.6);
    card(220, 150, kDef);
    withA(kDef, () => {
      text('frontend ilovalar uchun', PX + 36, 270, { size: 32, weight: 700, color: C.soft });
      text('arxitektura metodologiyasi', PX + 36, 320, { size: 38, weight: 800, color: '#3b5bdb' });
    });
    const Q = [['Fayl qaysi papkaga?', tQ1, 'qatlam · slice · segment'], ['Kim kimni import qiladi?', tQ2, 'faqat pastga'], ['Tashqi interfeys qayerda?', tQ3, 'index.ts']];
    Q.forEach(([q, at, a], i) => {
      const k = P(t, at, 0.5), y = 420 + i * 120;
      card(y, 100, k);
      withA(k, () => {
        numDot(i + 1, PX + 50, y + 50, ['#fb7185', C.green, '#7c2d12'][i]);
        text(q, PX + 96, y + 34, { size: 32, weight: 800 });
        text(a, PX + 96, y + 72, { size: 24, weight: 600, fam: MONO, color: C.soft });
      });
    });
    withA(P(t, W('L6', 'yangi'), 0.5), () => pill('har FSD loyiha — bir xil tuzilma', PX + PW / 2, 820, '#3b5bdb', { size: 30, align: 'center' }));
  }

  function sDaraja(t) {
    title('Uch daraja', 'qatlam → slice → segment', t, L('L7').s - 0.3);
    ground(1);
    const tLayer = W('L7', 'qatlam'), tRooms = W('L8', 'xonalar'), tSeg = W('L9', 'segmentlar');
    const explode = eio(P(t, W('L8', 'qavat') - 0.4, 1.0));
    building(t, (i) => ({
      a: i <= 1 ? 1 : 1 - explode, lift: i > 1 ? explode * 7 : 0,
      glow: P(t, tLayer + i * 0.15, 0.3) * (1 - P(t, tLayer + 1.8, 0.6)),
    }), {
      onFloor: (i, zTop) => {
        if (i !== 1) return;
        const segOn = P(t, tSeg - 0.4, 0.6);
        rooms(1, zTop, P(t, tRooms, 0.8), {
          roomK: (r) => P(t, W('L8', r ? 'kart' : 'prodakt') - 0.3, 0.7),
          roomA: (r) => (r === 0 ? 1 - 0.72 * segOn : 1 - 0.4 * segOn), labelA: (r) => (r === 0 ? 1 - segOn : 1),
        });
      },
    });
    LAYERS.forEach((_, i) => floorLabel(i, P(t, tLayer, 0.6) * (i <= 1 ? 1 : 1 - explode), 0, false));
    // segment kublari product xonasi ichida
    const segs = [['ui', 'yu-ay', '#60a5fa'], ['api', 'ey-pi-ay', '#34d399'], ['model', 'model', '#fbbf24']];
    const pos = [[0.7, 0.9], [1.9, 0.9], [1.3, 2.4]];
    segs.forEach(([name, word, col], i) => {
      const k = P(t, W('L9', word), 0.6);
      if (k <= 0) return;
      const [x, y] = pos[i];
      box(x, y, ENT + 0.05, 0.85, 0.85, 0.7 * eback(k), col, { shadow: false });
      const [lx, ly] = proj(x + 0.42, y + 0.42, ENT + 1.0);
      withA(k, () => pill(name, lx, ly - 18, col, { size: 22, mono: true, align: 'center', fg: C.ink }));
    });
    // o'ng panel: uch daraja
    const rows = [['Qatlam', 'qavat', 'qanchalik umumiy', tLayer, '#3b5bdb'], ['Slice', 'xona', 'biznes sohasi', W('L8', 'slays'), '#e11d48'], ['Segment', 'kub', 'texnik vazifa', tSeg, '#d97706']];
    const kP = P(t, tLayer, 0.5);
    withA(kP, () => panel(1470, 260, 410, 430));
    rows.forEach(([h, m, d, at, col], i) => {
      const k = P(t, at, 0.5), y = 330 + i * 130;
      withA(k, () => {
        text(h, 1500, y, { size: 40, weight: 800, color: col });
        text('= ' + m, 1500 + tw(h, 40, 800) + 16, y, { size: 32, weight: 700, color: C.ink });
        text(d, 1500, y + 46, { size: 28, color: C.soft });
      });
    });
  }

  function sKimga(t) {
    title('Kimga mos', 'rasmiy hujjat: “Is it right for me?”', t, L('L10').s - 0.3);
    ground(1);
    const land = eio(P(t, TM.scenes.kimga.s, 1.2));
    building(t, (i) => ({ a: i <= 1 ? 1 : land, lift: i > 1 ? (1 - land) * 7 : 0 }));
    LAYERS.forEach((_, i) => floorLabel(i, land, 0, false));
    // 1-karta: frontend
    const k1 = P(t, W('L10', 'frontend'), 0.5);
    card(220, 200, k1);
    withA(k1, () => {
      text('frontend', PX + 36, 262, { size: 36, weight: 800, color: '#3b5bdb' });
      ['veb', 'mobil', 'desktop'].forEach((s, i) => withA(P(t, W('L10', s), 0.4), () => pill(s, PX + 36 + i * 170, 320, '#60a5fa', { size: 26 })));
      withA(P(t, W('L10', 'kutubxona'), 0.4), () => { crossB(PX + 60, 382, 1, 0.7); text('kutubxona', PX + 96, 383, { size: 28, weight: 700, color: C.red }); });
      withA(P(t, W('L10', 'ilova'), 0.4), () => { check(PX + 340, 382, 1, C.green, 0.7); text('ilova', PX + 376, 383, { size: 28, weight: 700, color: C.green }); });
    });
    // 2-karta: cheklov yo'q
    const k2 = P(t, W('L11', 'dasturlash'), 0.5);
    card(450, 180, k2);
    withA(k2, () => {
      text('til · framework · holat menejeri', PX + 36, 492, { size: 30, weight: 700 });
      text('cheklov yo‘q', PX + 36, 536, { size: 28, color: C.soft });
      [['React', 'react', '#0ea5e9'], ['Vue', 'vyu', '#16a34a'], ['Angular', 'angular', '#dc2626']].forEach(([s, w, col], i) => withA(P(t, W('L11', w), 0.4), () => pill(s, PX + 36 + i * 190, 590, col, { size: 26 })));
    });
    withA(P(t, W('L11', 'qoidalar'), 0.4), () => check(PX + PW - 60, 590, 1, C.green, 0.8));
    // 3-karta: istalgan hajm
    const k3 = P(t, W('L12', 'istalgan'), 0.5);
    card(660, 120, k3);
    withA(k3, () => {
      text('istalgan hajmdagi', PX + 36, 702, { size: 30, weight: 700 });
      text('loyiha va jamoa', PX + 36, 744, { size: 30, weight: 700, color: '#3b5bdb' });
      for (let i = 0; i < 6; i++) withA(P(t, W('L12', 'jamoada') + i * 0.1, 0.3), () => { const x = PX + 420 + i * 44, y = 724; ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(x, y - 14, 11, 0, 7); ctx.fill(); ctx.beginPath(); ctx.roundRect(x - 15, y, 30, 26, 10); ctx.fill(); });
    });
  }

  function sFoyda(t) {
    title('Nima beradi', 'rasmiy hujjat: afzalliklar', t, L('L13').s - 0.3);
    ground(1);
    const t13 = W('L13', 'bir'), t14 = W('L14', 'ikkinchisi'), t15 = W('L15', 'uchinchisi'), t16 = W('L16', 'bundan');
    // 1) bir xillik — uchta bir xil bino
    const kMini = P(t, t13 + 0.4, 0.8) * (1 - P(t, t14 - 0.6, 0.6));
    if (kMini > 0) { miniBuilding(-8, 8, kMini); miniBuilding(8, -8, kMini); }
    const changed = W('L14', 'ozgartirsangiz'), safe = W('L14', 'kutilmagan');
    building(t, (i) => ({
      glow: i === 1 ? P(t, changed, 0.3) * (1 - P(t, L('L14').e + 0.8, 0.5)) : 0,
      green: i === 0 && t > safe && t < L('L15').s,
    }));
    const labelsOn = P(t, t14 - 0.3, 0.6);
    LAYERS.forEach((_, i) => floorLabel(i, labelsOn, 0, false));
    withA(kMini, () => {
      const [x, y] = proj(4, 2.5, floorZ(5) + 3.2);
      pill('bir xil tuzilma — tez moslashish', x, y, '#3b5bdb', { size: 30, align: 'center' });
    });
    // 2) barqarorlik — lift faqat pastga, o'zgarish pastga tarqalmaydi
    const k2 = P(t, t14, 0.5) * (1 - P(t, t15 - 0.4, 0.4));
    sideTag(1, 'o‘zgarish', C.amber, P(t, changed, 0.4) * k2);
    sideTag(0, 'kutilmagan joy buzilmaydi', C.green, P(t, safe, 0.4) * k2);
    card(260, 200, k2);
    withA(k2, () => { text('Barqarorlik', PX + 36, 310, { size: 38, weight: 800, color: C.green }); text('modul faqat pastdagini ishlatadi', PX + 36, 360, { size: 28, color: C.ink }); text('o‘z qatlami va yuqorisi — ✗', PX + 36, 404, { size: 28, color: C.red }); });
    // 3) qayta ishlatish — umumiy va lokal
    const k3 = P(t, t15, 0.5) * (1 - P(t, t16 - 0.3, 0.4));
    card(260, 160, k3);
    withA(k3, () => { text('Qayta ishlatish', PX + 36, 310, { size: 38, weight: 800, color: '#3b5bdb' }); text('qatlamga qarab: umumiy ↔ lokal', PX + 36, 362, { size: 28, color: C.ink }); });
    sideTag(0, 'juda umumiy  (shared)', '#475569', P(t, W('L15', 'umumiy'), 0.4) * k3);
    sideTag(4, 'juda lokal  (pages)', '#2563eb', P(t, W('L15', 'lokal'), 0.4) * k3);
    // 4) asboblar
    const tools = [['linter', 'linteri', 'Steiger'], ['papka generatorlari', 'generatorlari', 'CLI, IDE'], ['misollar', 'misollari', 'rasmiy saytda']];
    const k4 = P(t, t16, 0.5);
    card(260, 380, k4);
    withA(k4, () => text('Asboblar', PX + 36, 310, { size: 40, weight: 800, color: '#3b5bdb' }));
    tools.forEach(([h, w, s], i) => withA(P(t, W('L16', w), 0.4), () => { const y = 390 + i * 82; check(PX + 60, y + 6, 1, C.green, 0.7); text(h, PX + 100, y - 6, { size: 32, weight: 800 }); text(s, PX + 100, y + 30, { size: 24, fam: MONO, color: C.soft }); }));
  }

  function sQachon(t) {
    title('Qachon kerak', 'rasmiy hujjat va Layers sahifasi', t, L('L17').s - 0.3);
    ground(1);
    const t18 = W('L18', 'hamma'), tMin = W('L18', 'kamida'), tStep = W('L19', 'bosqichma');
    const minimal = (i) => i === 0 || i === 4 || i === 5;
    const grow = (i) => P(t, tStep + 0.4 + (i - 1) * 0.6, 0.6); // entities, features, widgets ketma-ket qaytadi
    building(t, (i) => {
      if (t < tMin || minimal(i)) return { glow: minimal(i) && t > tMin ? P(t, tMin, 0.3) * (1 - P(t, tMin + 2.4, 0.5)) : 0, green: t > L('L17').s && t < t18 };
      const g = grow(i);
      return { a: 0.25 + 0.75 * g, dim: g < 0.5 };
    });
    LAYERS.forEach((_, i) => floorLabel(i, t < tMin || minimal(i) ? 1 : 0.3 + 0.7 * grow(i), 0, false));
    // iqtibos
    const kq = P(t, W('L17', 'rasmiy'), 0.5) * (1 - P(t, t18 - 0.3, 0.4));
    card(260, 260, kq);
    withA(kq, () => {
      text('“If the current architecture works,', PX + 36, 318, { size: 30, weight: 600, fam: MONO, color: C.ink });
      text(' maybe it’s not worth changing.”', PX + 36, 360, { size: 30, weight: 600, fam: MONO, color: C.ink });
      text('— feature-sliced.design, Overview', PX + 36, 412, { size: 22, color: C.soft });
      withA(P(t, W('L17', 'ishlayotgan'), 0.4), () => pill('ishlayapti → almashtirish shart emas', PX + 36, 476, C.green, { size: 26 }));
    });
    const km = P(t, tMin, 0.5) * (1 - P(t, tStep - 0.3, 0.4));
    card(260, 200, km);
    withA(km, () => {
      text('kamida 3 ta qatlam', PX + 36, 314, { size: 36, weight: 800 });
      ['shared', 'pages', 'app'].forEach((s, i) => withA(P(t, W('L18', ['sherd', 'peyjiz', 'ep'][i]), 0.4), () => pill(s, PX + 36 + i * 180, 384, LAYERS[[0, 4, 5][i]].col, { size: 28, mono: true, fg: C.ink })));
    });
    const ks = P(t, tStep, 0.5);
    card(260, 150, ks);
    withA(ks, () => { text('bosqichma-bosqich', PX + 36, 314, { size: 36, weight: 800, color: '#3b5bdb' }); text('qatlam kerak bo‘lganda qo‘shiladi', PX + 36, 362, { size: 28, color: C.soft }); });
  }

  // Steiger chiqishi — ../fsd-umumiy/steiger-xato.txt (qisqartirilmagan xabar matnlari)
  const ERR = [
    ['src/entities/cart/model/cart.ts:1:31', 'Forbidden cross-import from slice "product".', 'fsd/forbidden-imports'],
    ['src/entities/product/ui/product-card.ts:2:34', 'Forbidden import from higher layer "features".', 'fsd/forbidden-imports'],
    ['src/widgets/header/ui/header.ts:1:29', 'Forbidden sidestep of public API when importing from', 'fsd/no-public-api-sidestep'],
  ];
  function sXatolar(t) {
    title('Tipik xatolar', 'bob: “Tipik xatolar” jadvali', t, L('L20').s - 0.3);
    ground(1);
    const t20 = W('L20', 'birinchisi'), tStart = W('L20', 'uchta'), t21 = W('L21', 'ikkinchisi'), t22 = W('L22', 'uchinchisi'), tRes = W('L23', 'mana');
    const tooMany = t > W('L20', 'hamma') && t < tStart + 0.4;
    building(t, (i) => {
      if (t > tRes) return { red: i === 1 || i === 3 };
      if (tooMany) return { ghost: i >= 1 && i <= 3 };
      if (t > tStart && t < t21) return { a: i >= 1 && i <= 3 ? 0.2 : 1 };
      return {};
    });
    LAYERS.forEach((_, i) => floorLabel(i, 1, 0, false));
    // o'z qatlami: modules / core — bino ustida qizil punktir qavat
    const kc = P(t, W('L21', 'modyuls'), 0.6) * (1 - P(t, t22 - 0.3, 0.4));
    if (kc > 0) {
      const z = floorZ(6) + (1 - eo(kc)) * 2;
      box(0, 0, z, BW, BD, FH, '#fecaca', { a: kc, dashed: true, stroke: C.red });
      const [x, y] = proj(0, BD, z + FH / 2);
      withA(kc, () => pill('modules/  core/', x - 30, y, C.red, { size: 26, mono: true, align: 'right' }));
      const [cx, cy] = proj(BW / 2, BD / 2, z + FH);
      crossB(cx, cy - 20, P(t, W('L21', 'tavsiya'), 0.4), 1.2);
    }
    // o'ng panel: uchta xato kartasi
    const cardsOff = P(t, tRes, 0.4);
    const items = [['Hamma qatlam birinchi kunda', '→ uchta qatlamdan boshlang', t20, W('L20', 'uchta')], ['O‘z qatlamingiz (modules, core)', '→ tavsiya etilmaydi', t21, W('L21', 'tavsiya')], ['Faqat papka nomlari', '→ import qoidalari muhim', t22, W('L22', 'asosiysi')]];
    items.forEach(([h, s, at, at2], i) => {
      const k = P(t, at, 0.5) * (1 - cardsOff), y = 240 + i * 150;
      card(y, 124, k);
      withA(k, () => {
        crossB(PX + 50, y + 44, 1, 0.75);
        text(h, PX + 92, y + 44, { size: 30, weight: 800 });
        withA(P(t, at2, 0.4), () => text(s, PX + 92, y + 90, { size: 26, weight: 700, color: C.green }));
      });
    });
    // haqiqiy Steiger natijasi
    const kT = P(t, tRes, 0.5);
    const x = PX - 60, y = 230, w = PW + 60, h = 600;
    withA(kT, () => {
      panel(x, y, w, h, { dark: true, title: 'terminal' });
      text('$ npx steiger src', x + 30, y + 74, { size: 24, weight: 700, fam: MONO, color: '#86efac' });
      ERR.forEach(([loc, msg, rule], i) => withA(P(t, tRes + 0.4 + i * 0.4, 0.4), () => {
        const yy = y + 126 + i * 150;
        text('┌ ' + loc, x + 30, yy, { size: 19, fam: MONO, color: '#94a3b8', weight: 500 });
        text('✘ ' + msg, x + 30, yy + 34, { size: 21, fam: MONO, color: '#fda4af', weight: 700 });
        if (i === 2) text('  "@/entities/cart/model/cart".', x + 30, yy + 64, { size: 21, fam: MONO, color: '#fda4af', weight: 700 });
        text('└ ' + rule, x + 30, yy + (i === 2 ? 96 : 66), { size: 19, fam: MONO, color: '#94a3b8', weight: 500 });
      }));
      withA(P(t, W('L23', 'xato'), 0.4), () => text('Found 3 errors (none can be fixed automatically)', x + 30, y + h - 40, { size: 21, fam: MONO, color: '#fda4af', weight: 700 }));
    });
  }

  function sXulosa(t) {
    ground(1);
    const t25 = L('L25').s, out = 1 - P(t, t25 - 0.2, 0.6);
    withA(out, () => {
      building(t, () => ({}));
      text('Xulosa', 960, 110, { size: 56, weight: 800, align: 'center' });
      const cards = [['Qavat', 'qatlam', 'qavat', '#3b5bdb'], ['Xona', 'slice', 'xona', '#e11d48'], ['Kub', 'segment', 'segmentga', '#d97706'], ['Lift ↓', 'faqat pastga', 'pastga', C.green]];
      cards.forEach(([h, s, word, col], i) => {
        const k = eback(P(t, W('L24', word), 0.6)), x = 140 + i * 430, y = 830;
        if (k <= 0) return;
        withA(clamp(k), () => {
          ctx.save(); ctx.translate(x + 180, y + 70); ctx.scale(k, k); ctx.translate(-x - 180, -y - 70);
          panel(x, y, 360, 140);
          ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x, y, 14, 140, [18, 0, 0, 18]); ctx.fill();
          text(h, x + 40, y + 52, { size: 40, weight: 800, color: col }); text(s, x + 40, y + 102, { size: 28, color: C.soft, fam: i < 3 ? MONO : UI });
          ctx.restore();
        });
      });
      withA(P(t, W('L24', 'bosqichma'), 0.5), () => pill('kerak bo‘lganda · bosqichma-bosqich', 960, 190, '#3b5bdb', { size: 30, align: 'center' }));
    });
    const kt = eo(P(t, t25, 0.9));
    withA(kt, () => {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, SW, SH);
      text('Rahmat!', 960, 450 + (1 - kt) * 30, { size: 150, weight: 800, align: 'center', color: '#3b5bdb' });
      withA(P(t, W('L25', 'keyingi'), 0.6), () => { text('Keyingi bob: Pages-first — sahifadan boshlash', 960, 590, { size: 40, align: 'center', color: C.soft }); text('mfs1011.github.io/dev-docs', 960, 660, { size: 40, weight: 700, fam: MONO, align: 'center', color: '#e11d48' }); });
    });
  }

  const SCENES = { intro: sIntro, savollar: sSavollar, daraja: sDaraja, kimga: sKimga, foyda: sFoyda, qachon: sQachon, xatolar: sXatolar, xulosa: sXulosa };
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    camera(t);
    sky(t);
    for (const [name, fn] of Object.entries(SCENES)) {
      const sc = TM.scenes[name];
      if (t >= sc.s && t < sc.e) {
        // uzluksiz olam: bino o'chmaydi, faqat sahnaga xos qatlam (yozuv, panel) silliq almashadi
        const al = Math.min(name === 'intro' ? 1 : P(t, sc.s, 0.4), 1 - P(t, sc.e - 0.4, 0.4));
        titleQueue = [];
        ctx.save(); ctx.globalAlpha = 0.35 + 0.65 * al; fn(t);
        titleQueue.forEach(([args, a]) => { ctx.globalAlpha = a; drawTitle(...args); });
        ctx.restore();
      }
    }
    const fin = Math.max(1 - P(t, 0, 0.8), P(t, TM.end - 1.4, 1.3));
    if (fin > 0) { ctx.globalAlpha = fin; ctx.fillStyle = '#eef5ff'; ctx.fillRect(0, 0, SW, SH); ctx.globalAlpha = 1; }
  }
  window.render = render;
  window.DURATION = TM.end;
  window.renderPoster = () => {
    render(0.001); ctx.globalAlpha = 1; cam = { tx: 620, ty: -40, z: 0.78 }; sky(3); ground(1); building(6, () => ({}));
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#3b5bdb' }); text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 }); text('1-bob · FSD nima va qachon kerak', 1158, 545, { size: 34, color: C.soft });
  };
  if (location.hash === '#play') {
    const t0 = performance.now();
    const loop = () => { render(((performance.now() - t0) / 1000) % TM.end); requestAnimationFrame(loop); };
    document.fonts.ready.then(loop);
  } else render(0);
})();
