// FSD 5-bob videosi (Segmentlar) — izometrik 3D bino va uzluksiz kamera. Ovoz birinchi: harakatlar aytilgan so'zga bog'langan (SY.W).
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
  const SIDE = [330, -10, 0.92];       // bino chapda, panel o'ngda
  const FZ = floorZ(2) + FH;           // features qavati usti
  const SZ = floorZ(0) + FH;           // shared qavati usti
  const FEAT_CAM = [290, ((4 + 2.5) * U) / 2 - (FZ + 0.6) * U, 1.2];
  const SHARED_CAM = [230, (6.5 * U) / 2 - (SZ + 0.4) * U, 1.15];
  function camera(t) {
    const s = TM.scenes;
    const frames = [
      [0, [-160, -30, 0.95]],
      [s.tarif.s, SIDE],
      [W('L3', 'binoda') - 0.3, FEAT_CAM],
      [s.ozingiz.s, SHARED_CAM],
      [s.nom.s, FEAT_CAM],
      [s.steiger.s, SIDE],
      [s.xulosa.s, [90, -60, 0.62]],
    ];
    const v = kfv(t, frames, 1.6);
    cam = { tx: v[0], ty: v[1], z: v[2] };
  }

  // O'ng panel: karta (oq)
  const PX = 1150, PW = 720;
  function card(y, h, k) { withA(k, () => panel(PX, y + (1 - eo(k)) * 20, PW, h)); }
  function room(name, x, y, w, d, zTop, k, col, o = {}) {
    if (k <= 0) return;
    const h = (o.h || 1.1) * eback(k);
    box(x, y, zTop, w, d, h, col, { a: clamp(k * 2) * (o.a == null ? 1 : o.a), shadow: false });
    const [lx, ly] = proj(x + w / 2, y + d / 2, zTop + h);
    withA(clamp(k * 1.5) * (o.labelA == null ? 1 : o.labelA), () => text(name, lx, ly, { size: (o.size || 24) * Math.min(1.5, cam.z), weight: 800, fam: MONO, color: C.ink, align: 'center' }));
  }
  // Segment kubi (nomi bilan)
  function cube(name, x, y, zTop, col, k, o = {}) {
    if (k <= 0) return;
    box(x, y, zTop + 0.02, 1.2, 1.2, 0.8 * eback(k), col, { shadow: false, dashed: o.dashed, stroke: o.stroke });
    const [lx, ly] = proj(x + 0.6, y + 0.6, zTop + 1.1);
    withA(clamp(k), () => pill(name, lx, ly - 12, o.pill || col, { size: 22, mono: true, align: 'center', fg: o.fg || C.ink }));
  }
  const ROOM = [0.4, 0.6, 7.2, 3.8];
  const SEGS = [['ui', 'yu-ay', 'L4', '#60a5fa', 0.9, 1.0], ['api', 'ey-pi-ay', 'L5', '#34d399', 2.7, 1.0], ['model', 'model', 'L6', '#fbbf24', 4.5, 1.0], ['lib', 'lib', 'L7', '#a78bfa', 1.8, 2.7], ['config', 'konfig', 'L8', '#94a3b8', 3.6, 2.7]];

  function sIntro(t) {
    ground(1);
    building(t, (i) => ({ a: P(t, 0.4 + i * 0.28, 0.4), lift: (1 - eo(P(t, 0.4 + i * 0.28, 0.7))) * 4 }));
    const k = eo(P(t, 1.0, 0.9));
    withA(k, () => {
      text('FSD', 80, 140 + (1 - k) * 30, { size: 150, weight: 800, color: '#3b5bdb' });
      text('5-bob · Segmentlar', 86, 245 + (1 - k) * 30, { size: 46, weight: 700 });
    });
    withA(eo(P(t, W('L1', 'ular'), 0.8)), () => text('xona ichida — texnik vazifa bo‘yicha', 86, 300, { size: 32, color: C.soft }));
  }

  function sTarif(t) {
    title('Segment — kub', 'uchinchi va oxirgi daraja', t, L('L2').s - 0.3);
    ground(1);
    const ex = eio(P(t, W('L3', 'binoda') - 0.6, 1.0));
    building(t, (i) => ({ a: i > 2 ? 1 - ex : 1, lift: i > 2 ? ex * 7 : 0, glow: P(t, W('L2', 'uchinchi'), 0.3) * (1 - P(t, W('L2', 'guruhlaydi') + 1, 0.5)) * (i === 2 ? 1 : 0) }), {
      onFloor: (i, zTop) => {
        if (i !== 2) return;
        const kr = P(t, W('L3', 'epplay-promo-kod') - 0.3, 0.7);
        room('apply-promo-code', ...ROOM, zTop, kr, shade(LAYERS[2].col, 0.2), { a: 1 - 0.65 * P(t, W('L3', 'kub'), 0.5), labelA: 1 });
        const kc = P(t, W('L3', 'kub'), 0.6);
        if (kc > 0) cube('?', 5.6, 2.6, zTop, '#cbd5e1', kc);
      },
    });
    LAYERS.forEach((_, i) => floorLabel(i, i > 2 ? 1 - ex : 1, 0, false));
    const k1 = P(t, L('L2').s, 0.5);
    card(240, 150, k1);
    withA(k1, () => { text('Segment', PX + 36, 290, { size: 40, weight: 800, color: '#d97706' }); text('kod — texnik vazifasi bo‘yicha', PX + 36, 342, { size: 28, color: C.soft }); });
  }

  // Rasmiy tavsiflar (Slices and segments — Segments)
  const DESC = { ui: ['ko‘rinishga oid hamma narsa:', 'komponentlar, sana formatlovchilari, stillar'], api: ['backend bilan aloqa:', 'so‘rov funksiyalari, ma’lumot tiplari, mapper'], model: ['ma’lumot modeli:', 'sxema, interfeys, store, biznes mantiqi'], lib: ['shu slice’dagi boshqa modullarga', 'kerak yordamchi kod'], config: ['konfiguratsiya fayllari', 'va feature flag’lar'] };
  function sBeshta(t) {
    title('Beshta odatiy segment', 'ui · api · model · lib · config', t, L('L4').s - 0.3);
    ground(1);
    building(t, (i) => ({ a: i > 2 ? 0 : 1, lift: i > 2 ? 7 : 0 }), {
      onFloor: (i, zTop) => {
        if (i !== 2) return;
        room('apply-promo-code', ...ROOM, zTop, 1, shade(LAYERS[2].col, 0.2), { a: 0.35, labelA: 0 });
        SEGS.forEach(([n, w, l, col, x, y]) => cube(n, x, y, zTop, col, P(t, W(l, w) - 0.2, 0.6)));
      },
    });
    floorLabel(2, 1, 0, false);
    withA(1, () => { const [x, y] = proj(0.4, 0.6, FZ + 1.3); pill('features/apply-promo-code', x, y - 20, '#b45309', { size: 22, mono: true, align: 'center' }); });
    SEGS.forEach(([n, w, l, col], j) => {
      const s0 = W(l, w) - 0.2, nxt = j < 4 ? W(SEGS[j + 1][2], SEGS[j + 1][1]) - 0.2 : L('L8').e + 1.0;
      const k = P(t, s0, 0.4) * (1 - P(t, nxt, 0.3));
      card(260, 200, k);
      withA(k, () => {
        pill(n, PX + 36, 315, col, { size: 34, mono: true, fg: C.ink });
        DESC[n].forEach((ln, m) => text(ln, PX + 36, 380 + m * 42, { size: 28, weight: 600, color: m ? C.soft : C.ink }));
      });
    });
  }

  function sOzingiz(t) {
    title('O‘z segmentlaringiz', 'ko‘pincha app va shared’da', t, L('L9').s - 0.3);
    ground(1);
    const ex = eio(P(t, TM.scenes.ozingiz.s, 1.0));
    building(t, (i) => ({ a: i === 0 ? 1 : 1 - ex, lift: i > 0 ? ex * 7 : 0, glow: i === 0 ? P(t, W('L9', 'sherd'), 0.4) * (1 - P(t, W('L9', 'sherd') + 2, 0.5)) : 0 }));
    floorLabel(0, 1, 0, false);
    [['ui', '#60a5fa', 0.6, 0.8], ['api', '#34d399', 2.4, 0.8], ['lib', '#a78bfa', 4.2, 0.8], ['config', '#94a3b8', 6.0, 0.8]].forEach(([n, col, x, y], j) => cube(n, x, y, SZ, col, P(t, TM.scenes.ozingiz.s + 0.8 + j * 0.15, 0.6)));
    [['routes', 1.5, 2.8], ['i18n', 4.5, 2.8]].forEach(([n, x, y], j) => cube(n, x, y, SZ, '#fde68a', P(t, W('L9', 'yaratish') + j * 0.3, 0.6), { pill: C.amber, fg: '#fff' }));
    const kc = P(t, W('L9', 'yaratish'), 0.5);
    card(240, 210, kc);
    withA(kc, () => {
      text('o‘z segmentlari', PX + 36, 290, { size: 36, weight: 800, color: C.amber });
      text('mumkin — ko‘pincha app va shared’da,', PX + 36, 345, { size: 27, weight: 600 });
      withA(P(t, W('L9', 'chunki'), 0.4), () => text('chunki u yerda slice yo‘q', PX + 36, 390, { size: 27, color: C.soft }));
    });
    withA(P(t, W('L9', 'yaratish') + 0.4, 0.4), () => pill('shared/routes  ·  shared/i18n', PX + PW / 2, 500, C.amber, { size: 26, mono: true, align: 'center' }));
  }

  function sNom(t) {
    title('Nom — maqsad', 'nima uchun, nima ekani emas', t, L('L10').s - 0.3);
    ground(1);
    const tBad = W('L11', 'komponents');
    building(t, (i) => ({ a: i > 2 ? 0 : 1, lift: i > 2 ? 7 : 0 }), {
      onFloor: (i, zTop) => {
        if (i !== 2) return;
        room('apply-promo-code', ...ROOM, zTop, 1, shade(LAYERS[2].col, 0.2), { a: 0.35, labelA: 0 });
        const bad = P(t, tBad - 0.3, 0.5);
        SEGS.slice(0, 3).forEach(([n, , , col, x, y]) => cube(n, x, y, zTop, col, 1 - bad));
        [['components', W('L11', 'komponents'), 0.9, 1.0], ['hooks', W('L11', 'xuks'), 2.7, 1.0], ['types', W('L11', 'tayps'), 4.5, 1.0]].forEach(([n, w, x, y]) => cube(n, x, y, zTop, '#fecaca', P(t, w, 0.5), { pill: C.red, fg: '#fff' }));
      },
    });
    floorLabel(2, 1, 0, false);
    const kc = P(t, W('L10', 'maqsadini'), 0.5);
    card(240, 260, kc);
    withA(kc, () => {
      check(PX + 56, 300, 1, C.green, 0.7); text('maqsad: “bu kod nima uchun?”', PX + 96, 301, { size: 28, weight: 700, color: C.green });
      text('ui  ·  model  ·  lib  ·  routes', PX + 96, 345, { size: 24, fam: MONO, color: C.soft });
      withA(P(t, W('L10', 'mohiyatini'), 0.4), () => { crossB(PX + 56, 410, 1, 0.7); text('mohiyat: “bu kod nima?”', PX + 96, 411, { size: 28, weight: 700, color: C.red }); text('components  ·  hooks  ·  types', PX + 96, 455, { size: 24, fam: MONO, color: C.soft }); });
    });
    withA(P(t, W('L11', 'qidirishda'), 0.4), () => pill('qidirishda yordam bermaydi', PX + PW / 2, 560, C.red, { size: 28, align: 'center' }));
  }

  // Steiger chiqishi — steiger-xato.txt (5 ta segment, bir xil xabar) / steiger-toza.txt
  const ERRSEG = ['components', 'constants', 'hooks', 'types', 'utils'];
  const SAYW = { components: 'komponents', constants: 'konstants', hooks: 'xuks', types: 'tayps', utils: 'yutils' };
  function sSteiger(t) {
    title('Steiger', 'fsd/segments-by-purpose', t, L('L12').s - 0.3);
    ground(1);
    const tFix = W('L14', 'segmentlar'), tOk = W('L14', 'muammo');
    const fixed = t > tFix + 0.3;
    building(t, (i) => ({ red: !fixed && i === 2 && t > W('L13', 'komponents'), green: t > tOk, glow: t > tOk ? P(t, tOk, 0.4) * (1 - P(t, tOk + 2, 0.6)) : 0 }));
    LAYERS.forEach((_, i) => floorLabel(i, 1, 0, false));
    const x = PX - 20, y = 190, w = PW + 20, h = 700;
    withA(P(t, W('L12', 'stayger'), 0.6), () => {
      panel(x, y, w, h, { dark: true, title: 'terminal' });
      text('$ npx steiger src', x + 30, y + 70, { size: 22, weight: 700, fam: MONO, color: '#86efac' });
      if (!fixed) {
        ERRSEG.forEach((n, i) => withA(P(t, W('L13', SAYW[n]), 0.4), () => {
          const yy = y + 116 + i * 104;
          text('┌ src/features/apply-promo-code/' + n, x + 30, yy, { size: 17, fam: MONO, color: '#94a3b8', weight: 500 });
          text('✘ This segment\'s name should describe the purpose of', x + 30, yy + 28, { size: 18, fam: MONO, color: '#fda4af', weight: 700 });
          text('  its contents, not what the contents are.', x + 30, yy + 52, { size: 18, fam: MONO, color: '#fda4af', weight: 700 });
          text('└ fsd/segments-by-purpose', x + 30, yy + 76, { size: 17, fam: MONO, color: '#94a3b8', weight: 500 });
        }));
        withA(P(t, W('L13', 'yutils') + 0.6, 0.4), () => text('Found 5 errors (none can be fixed automatically)', x + 30, y + h - 34, { size: 18, fam: MONO, color: '#fda4af', weight: 700 }));
      } else {
        withA(P(t, tOk, 0.4), () => text('✔ No problems found!', x + 30, y + 140, { size: 38, fam: MONO, color: '#86efac', weight: 800 }));
        withA(P(t, tFix + 0.4, 0.4), () => text('ui · api · model · lib · config', x + 30, y + 210, { size: 26, fam: MONO, color: '#cbd5e1', weight: 600 }));
      }
    });
  }

  function sXulosa(t) {
    ground(1);
    const t16 = L('L16').s, out = 1 - P(t, t16 - 0.2, 0.6);
    withA(out, () => {
      building(t, () => ({}));
      text('Xulosa', 960, 110, { size: 56, weight: 800, align: 'center' });
      const cards = [['Kub', 'segment', 'kub', '#d97706'], ['5 ta nom', 'ui · api · model · lib · config', 'beshta', '#3b5bdb'], ['Nom', 'maqsadni bildiradi', 'maqsadni', C.green]];
      cards.forEach(([h, s, word, col], i) => {
        const k = eback(P(t, W('L15', word), 0.6)), x = 140 + i * 560, y = 830;
        if (k <= 0) return;
        withA(clamp(k), () => {
          ctx.save(); ctx.translate(x + 250, y + 70); ctx.scale(k, k); ctx.translate(-x - 250, -y - 70);
          panel(x, y, 500, 140);
          ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x, y, 14, 140, [18, 0, 0, 18]); ctx.fill();
          text(h, x + 40, y + 52, { size: 38, weight: 800, color: col }); text(s, x + 40, y + 102, { size: 24, color: C.soft, fam: i === 1 ? MONO : UI });
          ctx.restore();
        });
      });
    });
    const kt = eo(P(t, t16, 0.9));
    withA(kt, () => {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, SW, SH);
      text('Rahmat!', 960, 450 + (1 - kt) * 30, { size: 150, weight: 800, align: 'center', color: '#3b5bdb' });
      withA(P(t, W('L16', 'keyingi'), 0.6), () => { text('Keyingi bob: Import qoidasi va public API', 960, 590, { size: 40, align: 'center', color: C.soft }); text('mfs1011.github.io/dev-docs', 960, 660, { size: 40, weight: 700, fam: MONO, align: 'center', color: '#e11d48' }); });
    });
  }

  const SCENES = { intro: sIntro, tarif: sTarif, beshta: sBeshta, ozingiz: sOzingiz, nom: sNom, steiger: sSteiger, xulosa: sXulosa };
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
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#3b5bdb' }); text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 }); text('5-bob · Segmentlar', 1158, 545, { size: 34, color: C.soft });
  };
  if (location.hash === '#play') {
    const t0 = performance.now();
    const loop = () => { render(((performance.now() - t0) / 1000) % TM.end); requestAnimationFrame(loop); };
    document.fonts.ready.then(loop);
  } else render(0);
})();
