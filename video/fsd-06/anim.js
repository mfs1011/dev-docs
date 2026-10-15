// FSD 6-bob videosi (Import qoidasi va public API) — izometrik 3D bino va uzluksiz kamera. Ovoz birinchi: harakatlar aytilgan so'zga bog'langan (SY.W).
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
  const FEAT_CAM = [290, ((4 + 2.5) * U) / 2 - (FZ + 0.6) * U, 1.2];
  function camera(t) {
    const s = TM.scenes;
    const frames = [
      [0, [-160, -30, 0.95]],
      [s.import.s, SIDE],
      [s.api.s, FEAT_CAM],
      [s.yollar.s, SIDE],
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
  // Bino o'ng tomonida ikki qavat orasidagi strelka
  function stepArrow(i0, i1, col, k, o = {}) {
    const dx = o.dx || 2.6;
    const [ax, ay] = proj(BW + dx, 2.5, floorZ(i0) + 0.5), [bx, by] = proj(BW + dx, 2.5, floorZ(i1) + 0.5);
    arrow2(ax, ay, bx, by, col, k, { w: 7, dash: o.dash });
    return [ax, ay, bx, by];
  }
  const ATC = [0.4, 0.6, 7.2, 3.8];
  function door(k, zTop, o = {}) {
    if (k <= 0) return;
    const pts = [proj(3.0, 4.4, zTop), proj(4.2, 4.4, zTop), proj(4.2, 4.4, zTop + 0.9), proj(3.0, 4.4, zTop + 0.9)];
    withA(k, () => {
      if (o.glow) { ctx.save(); ctx.shadowColor = C.amber; ctx.shadowBlur = 40 * o.glow; poly(pts, '#7c2d12', C.amber, 5); ctx.restore(); }
      poly(pts, '#7c2d12', '#431407', 3);
      const [dx, dy] = proj(3.6, 4.4, zTop + 1.5); pill('index.ts', dx, dy - 10, '#3b5bdb', { size: 22, mono: true, align: 'center' });
    });
  }

  function sIntro(t) {
    ground(1);
    building(t, (i) => ({ a: P(t, 0.4 + i * 0.28, 0.4), lift: (1 - eo(P(t, 0.4 + i * 0.28, 0.7))) * 4 }));
    const k = eo(P(t, 1.0, 0.9));
    withA(k, () => {
      text('FSD', 80, 140 + (1 - k) * 30, { size: 150, weight: 800, color: '#3b5bdb' });
      text('6-bob · Import qoidasi va public API', 86, 245 + (1 - k) * 30, { size: 46, weight: 700 });
    });
    withA(eo(P(t, W('L1', 'butun'), 0.8)), () => text('FSD’ning ikki asosiy qoidasi', 86, 300, { size: 32, color: C.soft }));
  }

  function sImport(t) {
    title('Import qoidasi', 'faqat qat’iy pastdagi qatlamlardan', t, L('L2').s - 0.3);
    ground(1);
    const tSteps = [W('L3', 'peyjiz'), W('L3', 'vijets', 1), W('L3', 'fichers', 1)], tNo = W('L3', 'teskari'), tChange = W('L4', 'pastdagi'), tUp = W('L4', 'yuqoridagilar');
    const step = tSteps.findIndex((s0, j) => t > s0 - 0.2 && (j === 2 || t < tSteps[j + 1] - 0.2));
    building(t, (i) => ({
      glow: (step >= 0 && t < tNo && (i === 4 - step || i === 3 - step) ? 0.8 : 0) + (i === 1 ? P(t, tChange, 0.3) * (1 - P(t, L('L4').e + 0.8, 0.5)) : 0),
      dim: t > tUp && t < L('L4').e + 0.8 && i === 0,
    }));
    LAYERS.forEach((_, i) => floorLabel(i, 1, 0, false));
    stepArrow(5, 0, C.green, P(t, W('L2', 'qatiy'), 1.0) * (1 - P(t, tSteps[0] - 0.3, 0.3)));
    tSteps.forEach((s0, j) => stepArrow(4 - j, 3 - j, C.green, P(t, s0, 0.6) * (1 - P(t, tNo - 0.2, 0.3))));
    const kNo = P(t, tNo, 0.6) * (1 - P(t, L('L4').s - 0.2, 0.3));
    if (kNo > 0) { const [, , bx, by] = stepArrow(1, 2, C.red, kNo, { dash: [14, 10] }); crossB(bx + 44, by, P(t, tNo + 0.5, 0.4) * kNo, 0.8); }
    // o'zgarish ta'siri
    const kU = P(t, tUp, 0.4) * (1 - P(t, L('L4').e + 0.8, 0.4));
    if (kU > 0) { const [ax, ay] = proj(BW + 2.6, 2.5, floorZ(1) + 0.5), [bx, by] = proj(BW + 2.6, 2.5, floorZ(5) + 0.5); withA(kU, () => { ctx.fillStyle = 'rgba(245,158,11,0.18)'; ctx.fillRect(ax - 30, by - 20, 60, ay - by + 40); }); withA(kU, () => pill('ta’sirlanishi mumkin', ax + 40, (ay + by) / 2, C.amber, { size: 22 })); }
    withA(P(t, tChange, 0.4) * (1 - P(t, L('L4').e + 0.8, 0.4)), () => { const [x, y] = proj(BW, 0, floorZ(1) + 0.5); pill('o‘zgardi', x + 24, y + 40, '#e11d48', { size: 22 }); });
    // panel: kim -> kimni
    const kc = P(t, L('L2').s, 0.5);
    card(240, 400, kc);
    withA(kc, () => {
      text('Kim → kimni import qiladi', PX + 36, 290, { size: 32, weight: 800 });
      [['app', 'hammasini'], ['pages', 'widgets, features, entities, shared'], ['widgets', 'features, entities, shared'], ['features', 'entities, shared'], ['entities', 'shared'], ['shared', 'faqat o‘z segmentlari']].forEach(([a, b], j) => {
        const i = 5 - j;
        withA(P(t, L('L2').s + 0.3 + j * 0.15, 0.4), () => { pill(a, PX + 36, 350 + j * 50, LAYERS[i].col, { size: 20, mono: true, fg: C.ink }); text('→ ' + b, PX + 190, 351 + j * 50, { size: 22, weight: 600, color: C.soft }); });
      });
    });
  }

  const GOALS = [['qayta tuzish qolgan qismni buzmasin', 'birinchi', 'L7'], ['jiddiy o‘zgarish — public API’da ko‘rinsin', 'ikkinchi', 'L8'], ['faqat keraklisi tashqariga chiqsin', 'uchinchi', 'L9']];
  function sApi(t) {
    title('Public API', 'shartnoma va darvoza', t, L('L5').s - 0.3);
    ground(1);
    const tG = GOALS.map(([, w, l]) => W(l, w));
    // 1-maqsad: ichkarida kublar joy almashadi, eshik o'z joyida
    const shuffle = eio(P(t, tG[0] + 0.4, 1.4)) * (1 - eio(P(t, tG[1], 0.6)));
    building(t, (i) => ({ a: i > 2 ? 0 : 1, lift: i > 2 ? 7 : 0 }), {
      onFloor: (i, zTop) => {
        if (i !== 2) return;
        room('add-to-cart', ...ATC, zTop, 1, shade(LAYERS[2].col, 0.2), { a: 0.35, labelA: 0 });
        [['ui', '#60a5fa', 1.0, 1.2], ['api', '#34d399', 2.8, 1.2], ['model', '#fbbf24', 4.6, 1.2]].forEach(([n, col, x, y], j) => {
          const xx = lerp(x, [4.6, 1.0, 2.8][j], shuffle), yy = y + Math.sin(Math.PI * shuffle) * 1.2 * (j - 1);
          box(xx, yy, zTop + 0.02, 1.2, 1.2, 0.8, col, { shadow: false });
          const [lx, ly] = proj(xx + 0.6, yy + 0.6, zTop + 1.1);
          pill(n, lx, ly - 12, col, { size: 22, mono: true, align: 'center', fg: C.ink });
        });
      },
    });
    floorLabel(2, 1, 0, false);
    withA(1, () => { const [x, y] = proj(0.4, 0.6, FZ + 1.3); pill('features/add-to-cart', x, y - 20, '#b45309', { size: 22, mono: true, align: 'center' }); });
    door(P(t, W('L5', 'shartnoma'), 0.6), FZ, { glow: P(t, tG[1] + 0.3, 0.4) * (1 - P(t, tG[2], 0.4)) });
    // darvoza: kirish
    const [ex, ey] = proj(3.6, 4.4, FZ + 0.4);
    arrow2(ex - 240, ey + 170, ex - 10, ey + 10, C.green, P(t, W('L5', 'darvozadek'), 0.8), { w: 8 });
    // 3-maqsad: faqat bitta narsa chiqadi
    withA(P(t, tG[2] + 0.3, 0.5), () => pill('export { AddToCartButton }', ex - 120, ey + 250, C.green, { size: 22, mono: true, align: 'center' }));
    const kc = P(t, L('L5').s, 0.5);
    card(240, 150, kc);
    withA(kc, () => { text('Public API', PX + 36, 290, { size: 38, weight: 800, color: '#3b5bdb' }); text('slice va foydalanuvchisi orasidagi shartnoma', PX + 36, 340, { size: 26, color: C.soft }); });
    const kg = P(t, W('L6', 'uchta'), 0.5);
    card(420, 240, kg);
    withA(kg, () => {
      text('Uchta maqsad', PX + 36, 465, { size: 32, weight: 800 });
      GOALS.forEach(([s], j) => withA(P(t, tG[j], 0.4), () => { pill(String(j + 1), PX + 36, 520 + j * 50, '#3b5bdb', { size: 22 }); text(s, PX + 90, 521 + j * 50, { size: 25, weight: 600 }); }));
    });
  }

  function sYollar(t) {
    title('Import yo‘llari', 'qayerda qanday yoziladi', t, L('L10').s - 0.3);
    ground(1);
    const t1 = W('L10', 'nisbiy'), t2 = W('L11', 'eylias'), t3 = W('L12', 'sherd');
    building(t, (i) => ({ glow: (i === 2 ? P(t, t1, 0.3) * (1 - P(t, t2, 0.4)) : 0) + ((i === 4 || i === 1) ? P(t, t2, 0.3) * (1 - P(t, t3, 0.4)) : 0) + (i === 0 ? P(t, t3, 0.3) : 0) }));
    LAYERS.forEach((_, i) => floorLabel(i, 1, 0, false));
    const rows = [
      ['slice ichida — nisbiy, to‘liq yo‘l', "from '../api/add-to-cart'", t1, '#d97706'],
      ['slice’lar orasida — alias + public API', "from '@/entities/product'", t2, '#3b5bdb'],
      ['shared/ui, shared/lib — har biriga index', "from '@/shared/ui/button'", t3, '#475569'],
    ];
    rows.forEach(([h, code, at, col], j) => {
      const k = P(t, at, 0.5), y = 240 + j * 170;
      card(y, 140, k);
      withA(k, () => { text(h, PX + 36, y + 45, { size: 28, weight: 800, color: col }); text(code, PX + 36, y + 95, { size: 26, weight: 600, fam: MONO, color: C.ink }); check(PX + PW - 50, y + 95, 1, C.green, 0.6); });
    });
  }

  const RISKS = [['export *', 'interfeys noaniq bo‘ladi', 'L13', 'eksport'], ['IDE auto-import', 'ichki faylga chuqur yo‘l tanlaydi', 'L14', 'ay-di-i'], ['index.ts bor — yetarli emas', 'chuqur importni taqiqlamaydi → linter', 'L15', 'indeks']];
  function sXavf(t) {
    title('Uchta xavf', 'rasmiy Public API sahifasi', t, L('L13').s - 0.3);
    ground(1);
    building(t, (i) => ({ red: i === 2 && t > W('L14', 'ichki') && t < L('L15').s }));
    LAYERS.forEach((_, i) => floorLabel(i, 1, 0, false));
    RISKS.forEach(([h, s, l, w], j) => {
      const k = P(t, W(l, w) - 0.3, 0.5), y = 240 + j * 170;
      card(y, 140, k);
      withA(k, () => { (j === 2 ? check : (x, yy, kk) => crossB(x, yy, kk, 0.75))(PX + 56, y + 70, 1, C.amber, 0.75); text(h, PX + 100, y + 50, { size: 30, weight: 800, fam: j === 0 ? MONO : UI, color: j === 2 ? C.ink : C.red }); text(s, PX + 100, y + 96, { size: 26, color: C.soft }); });
    });
  }

  // Steiger chiqishi — steiger-xato.txt / steiger-toza.txt (xabarlar so'zma-so'z)
  const ERR = [
    ['src/entities/order/model/order.ts:1:39', '✘', ['Forbidden import from higher layer "features".'], 'fsd/forbidden-imports', ['L17', 'entitiz']],
    ['src/pages/catalog/ui/page.ts:1:30', '✘', ['Forbidden sidestep of public API when importing from', '"@/entities/product/ui/product-card".'], 'fsd/no-public-api-sidestep', ['L18', 'katalog']],
    ['src/features/add-to-cart/ui/add-to-cart-button.ts:2:28', '✘', ['Import from "@/features/add-to-cart" should be relative.'], 'fsd/import-locality', ['L19', 'ed-tu-kart']],
    ['src/features/add-to-cart/index.ts:1:1', '✘', ['Wildcard re-export from "./ui/add-to-cart-button" does not', 'define an explicit public API. Prefer explicit named exports.'], 'fsd/no-wildcard-exports', ['L20', 'ikkala']],
    ['src/features/add-to-cart/index.ts:2:1', '⚠', ['Wildcard re-export from "./api/add-to-cart" does not define', 'an explicit public API. Prefer explicit named exports.'], 'fsd/no-wildcard-exports', ['L20', 'eksport']],
  ];
  function sSteiger(t) {
    title('Steiger', 'recommended + ikki qo‘shimcha qoida', t, L('L16').s - 0.3);
    ground(1);
    const tFix = W('L21', 'tuzatilgan'), tOk = W('L21', 'muammo');
    const fixed = t > tFix + 0.3;
    building(t, (i) => ({
      red: !fixed && ((i === 1 && t > W('L17', 'entitiz')) || (i === 4 && t > W('L18', 'katalog')) || (i === 2 && t > W('L19', 'ed-tu-kart'))),
      green: t > tOk, glow: t > tOk ? P(t, tOk, 0.4) * (1 - P(t, tOk + 2, 0.6)) : 0,
    }));
    LAYERS.forEach((_, i) => floorLabel(i, 1, 0, false));
    const x = PX - 40, y = 180, w = PW + 40, h = 740;
    withA(P(t, W('L16', 'stayger'), 0.6), () => {
      panel(x, y, w, h, { dark: true, title: 'terminal' });
      text('$ npx steiger src', x + 30, y + 66, { size: 20, weight: 700, fam: MONO, color: '#86efac' });
      withA(P(t, W('L16', 'import-lokaliti'), 0.4), () => text("+ 'fsd/import-locality', 'fsd/no-wildcard-exports': 'error'", x + 30, y + 96, { size: 16, weight: 600, fam: MONO, color: '#fcd34d' }));
      if (!fixed) {
        let yy = y + 140;
        ERR.forEach(([loc, mark, msg, rule, [l, wd]]) => {
          withA(P(t, W(l, wd), 0.5), () => {
            text('┌ ' + loc, x + 30, yy, { size: 15, fam: MONO, color: '#94a3b8', weight: 500 });
            msg.forEach((m, j) => text((j ? '  ' : mark + ' ') + m, x + 30, yy + 25 + j * 23, { size: 16, fam: MONO, color: mark === '⚠' ? '#fcd34d' : '#fda4af', weight: 700 }));
            text('└ ' + rule, x + 30, yy + 25 + msg.length * 23 + 1, { size: 15, fam: MONO, color: '#94a3b8', weight: 500 });
          });
          yy += 25 + msg.length * 23 + 40;
        });
        withA(P(t, W('L20', 'afzal'), 0.4), () => text('Found 4 errors and 1 warning (none can be fixed automatically)', x + 30, y + h - 30, { size: 16, fam: MONO, color: '#fda4af', weight: 700 }));
      } else {
        withA(P(t, tOk, 0.4), () => text('✔ No problems found!', x + 30, y + 160, { size: 38, fam: MONO, color: '#86efac', weight: 800 }));
      }
    });
  }

  function sXulosa(t) {
    ground(1);
    const t23 = L('L23').s, out = 1 - P(t, t23 - 0.2, 0.6);
    withA(out, () => {
      building(t, () => ({}));
      text('Xulosa', 960, 110, { size: 56, weight: 800, align: 'center' });
      const cards = [['Import', 'faqat pastga', 'import', C.green], ['Kirish', 'public API orqali', 'pablik', '#7c2d12'], ['Ichkarida', 'nisbiy yo‘l', 'nisbiy', '#d97706']];
      cards.forEach(([h, s, word, col], i) => {
        const k = eback(P(t, W('L22', word), 0.6)), x = 260 + i * 480, y = 830;
        if (k <= 0) return;
        withA(clamp(k), () => {
          ctx.save(); ctx.translate(x + 200, y + 70); ctx.scale(k, k); ctx.translate(-x - 200, -y - 70);
          panel(x, y, 420, 140);
          ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x, y, 14, 140, [18, 0, 0, 18]); ctx.fill();
          text(h, x + 40, y + 52, { size: 38, weight: 800, color: col }); text(s, x + 40, y + 102, { size: 28, color: C.soft });
          ctx.restore();
        });
      });
      withA(P(t, W('L22', 'linter'), 0.5), () => pill('linter tekshiradi', 960, 190, '#3b5bdb', { size: 30, align: 'center' }));
    });
    const kt = eo(P(t, t23, 0.9));
    withA(kt, () => {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, SW, SH);
      text('Rahmat!', 960, 450 + (1 - kt) * 30, { size: 150, weight: 800, align: 'center', color: '#3b5bdb' });
      withA(P(t, W('L23', 'keyingi'), 0.6), () => { text('Keyingi bob: shared', 960, 590, { size: 40, align: 'center', color: C.soft }); text('mfs1011.github.io/dev-docs', 960, 660, { size: 40, weight: 700, fam: MONO, align: 'center', color: '#e11d48' }); });
    });
  }

  const SCENES = { intro: sIntro, import: sImport, api: sApi, yollar: sYollar, xavf: sXavf, steiger: sSteiger, xulosa: sXulosa };
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
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#3b5bdb' }); text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 }); text('6-bob · Import va public API', 1158, 545, { size: 34, color: C.soft });
  };
  if (location.hash === '#play') {
    const t0 = performance.now();
    const loop = () => { render(((performance.now() - t0) / 1000) % TM.end); requestAnimationFrame(loop); };
    document.fonts.ready.then(loop);
  } else render(0);
})();
