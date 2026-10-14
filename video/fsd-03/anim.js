// FSD 3-bob videosi (Qatlamlar) — izometrik 3D bino va uzluksiz kamera. Ovoz birinchi: harakatlar aytilgan so'zga bog'langan (SY.W).
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
  const SZ = floorZ(0) + FH;           // shared qavati usti
  const SHARED_CAM = [230, (6.5 * U) / 2 - (SZ + 0.4) * U, 1.15];
  function camera(t) {
    const s = TM.scenes;
    const frames = [
      [0, [-160, -30, 0.95]],
      [s.tartib.s, SIDE],
      [s.istisno.s, SHARED_CAM],
      [s.tanlash.s, SIDE],
      [s.xulosa.s, [90, -60, 0.62]],
    ];
    const v = kfv(t, frames, 1.6);
    cam = { tx: v[0], ty: v[1], z: v[2] };
  }

  // O'ng panel: karta (oq)
  const PX = 1150, PW = 720;
  function card(y, h, k) { withA(k, () => panel(PX, y + (1 - eo(k)) * 20, PW, h)); }
  // Bino o'ng tomonidagi vertikal strelka (qavatdan qavatga)
  function sideArrow(i0, i1, col, k, o = {}) {
    const [ax, ay] = proj(BW + (o.dx || 2.6), 2.5, floorZ(i0) + 0.5), [bx, by] = proj(BW + (o.dx || 2.6), 2.5, floorZ(i1) + 0.5);
    arrow2(ax, ay, bx, by, col, k, { w: 8, dash: o.dash });
    return [bx, by];
  }

  function sIntro(t) {
    ground(1);
    building(t, (i) => ({ a: P(t, 0.4 + i * 0.28, 0.4), lift: (1 - eo(P(t, 0.4 + i * 0.28, 0.7))) * 4 }));
    const k = eo(P(t, 1.0, 0.9));
    withA(k, () => {
      text('FSD', 80, 140 + (1 - k) * 30, { size: 150, weight: 800, color: '#3b5bdb' });
      text('3-bob · Qatlamlar', 86, 245 + (1 - k) * 30, { size: 46, weight: 700 });
    });
    withA(eo(P(t, W('L1', 'har'), 0.8)), () => text('nima uchun kerak · kim kimni import qiladi', 86, 300, { size: 32, color: C.soft }));
  }

  function sTartib(t) {
    title('Qatlam', 'src/ ichidagi standart nomli papka', t, L('L2').s - 0.3);
    ground(1);
    const t7 = W('L2', 'yettita'), tUp = W('L3', 'yuqoridagisi'), tDown = W('L3', 'pastga');
    building(t, (i) => ({ glow: P(t, t7 + (5 - i) * 0.15, 0.3) * (1 - P(t, t7 + 1.8, 0.5)) }));
    LAYERS.forEach((_, i) => floorLabel(i, P(t, t7 + (5 - i) * 0.15, 0.5), 0, false));
    // mas'uliyat shkalasi: o'ng tomonda yuqoridan pastga
    const [ax, ay] = proj(BW + 2.6, 2.5, floorZ(5) + 0.5), [bx, by] = proj(BW + 2.6, 2.5, floorZ(0) + 0.5);
    arrow2(ax, ay, bx, by, '#3b5bdb', P(t, W('L2', 'masuliyat'), 1.0), { w: 8 });
    withA(P(t, tUp, 0.4), () => pill('ko‘p biladi · ko‘p bog‘liq', ax + 30, ay - 10, C.amber, { size: 24 }));
    withA(P(t, tDown, 0.4), () => pill('kam bog‘liq', bx + 30, by + 10, '#475569', { size: 24 }));
    const kc = P(t, t7, 0.5);
    card(240, 150, kc);
    withA(kc, () => { text('7 ta qatlam', PX + 36, 290, { size: 40, weight: 800, color: '#3b5bdb' }); text('mas’uliyat va bog‘liqlik bo‘yicha', PX + 36, 342, { size: 28, color: C.soft }); });
  }

  // Qatlam tavsiflari — rasmiy Layers sahifasidan
  const DESC = [
    ['shared', 'L10', 'sherd', ['poydevor, biznes yo‘q:', 'UI to‘plami, API klient, sozlamalar']],
    ['entities', 'L9', 'entitiz', ['real biznes tushunchalari:', 'foydalanuvchi, maqola']],
    ['features', 'L8', 'fichers', ['asosiy foydalanuvchi harakatlari']],
    ['widgets', 'L7', 'vijets', ['katta mustaqil UI bloklari,', 'bir necha sahifada foydali']],
    ['pages', 'L6', 'peyjiz', ['ilova ekranlari: odatda', 'har sahifa — bitta slice']],
    ['app', 'L4', 'ep', ['butun ilova: provayderlar,', 'marshrutlar, analitika']],
  ];
  function sQatlamlar(t) {
    title('Yettita qatlam', 'yuqoridan pastga', t, L('L4').s - 0.3);
    ground(1);
    const at = (i) => W(DESC[i][1], DESC[i][2]);
    const cur = (() => { let c = -1; [5, 4, 3, 2, 1, 0].forEach((i) => { if (t > at(i) - 0.2) c = i; }); return c; })();
    building(t, (i) => ({ dim: cur >= 0 && i !== cur && t < L('L10').e + 0.6, glow: i === cur ? 0.8 : 0 }));
    LAYERS.forEach((_, i) => floorLabel(i, cur >= 0 && i !== cur ? 0.4 : 1, 0, false));
    // eskirgan processes — bino yonida punktir qavat
    const kp = P(t, W('L5', 'proseses'), 0.6) * (1 - P(t, L('L6').s, 0.5));
    if (kp > 0) {
      box(BW + 1.5, -1, floorZ(5) - 0.6, 4, 3, FH, '#c4b5fd', { a: kp * 0.9, dashed: true, stroke: '#7c3aed' });
      const [x, y] = proj(BW + 3.5, 0.5, floorZ(5) + 0.4);
      withA(kp, () => { pill('processes', x, y - 40, '#7c3aed', { size: 26, align: 'center', mono: true }); text('eskirgan', x, y + 10, { size: 30, weight: 800, color: C.red, align: 'center' }); });
    }
    // joriy qatlam kartasi
    DESC.forEach(([name, , , lines], i) => {
      const s0 = at(i) - 0.2, nxt = i === 5 ? W('L5', 'proseses') - 0.2 : i > 0 ? at(i - 1) - 0.2 : L('L10').e + 0.8;
      const k = P(t, s0, 0.4) * (1 - P(t, nxt, 0.3));
      card(560, 190, k);
      withA(k, () => {
        pill(name, PX + 36, 615, LAYERS[i].col, { size: 32, mono: true, fg: C.ink });
        lines.forEach((ln, j) => text(ln, PX + 36, 670 + j * 40, { size: 28, weight: 600, color: j ? C.soft : C.ink }));
      });
    });
    const k5 = P(t, W('L5', 'proseses'), 0.4) * (1 - P(t, L('L6').s - 0.2, 0.3));
    card(560, 190, k5);
    withA(k5, () => { pill('processes', PX + 36, 615, '#7c3aed', { size: 32, mono: true }); text('eskirgan — tarkibi', PX + 36, 670, { size: 28, weight: 600 }); text('features va app ga ko‘chiriladi', PX + 36, 710, { size: 28, weight: 600, color: C.soft }); });
  }

  function sImport(t) {
    title('Import qoidasi', 'faqat qat’iy pastdagi qatlamlardan', t, L('L11').s - 0.3);
    ground(1);
    const tOk = W('L12', 'fichers'), tW = W('L13', 'vijetdan'), tP = W('L13', 'peyjiz');
    building(t, (i) => ({
      glow: i === 3 ? P(t, L('L11').s, 0.4) : 0,
      green: t > tOk && t < tW && i < 3 && i !== 3,
      red: t > tW && (i === 3 && t < tP + 0.3 || i === 4 && t > tP),
    }));
    LAYERS.forEach((_, i) => floorLabel(i, 1, 0, false));
    // ruxsat: widgets -> pastga
    sideArrow(3, 0, C.green, P(t, W('L11', 'qatiy'), 1.0) * (1 - P(t, tW - 0.3, 0.4)));
    // taqiqlangan: widgets -> pages (yuqoriga)
    const kUp = P(t, tP, 0.8);
    if (kUp > 0) { const [ux, uy] = sideArrow(3, 4, C.red, kUp, { dash: [14, 10] }); crossB(ux - 44, uy, P(t, tP + 0.6, 0.4), 0.8); }
    // kod kartasi
    const kc = P(t, W('L12', 'masalan'), 0.5);
    withA(kc, () => {
      panel(PX + 40, 250, PW - 40, 420, { dark: true, title: 'widgets/header/ui/header.ts' });
      const ln = (s, y, col, k) => withA(k, () => text(s, PX + 70, y, { size: 24, weight: 600, fam: MONO, color: col }));
      ln("✓ from '@/features/auth'", 320, '#86efac', P(t, W('L12', 'fichers'), 0.4));
      ln("✓ from '@/entities/cart'", 370, '#86efac', P(t, W('L12', 'entitiz'), 0.4));
      ln("✓ from '@/shared/ui'", 420, '#86efac', P(t, W('L12', 'sherd'), 0.4));
      ln("✗ from '@/widgets/sidebar'  bir qatlam", 500, '#fda4af', P(t, tW, 0.4));
      ln("✗ from '@/pages/home'       yuqorida", 550, '#fda4af', P(t, tP, 0.4));
    });
  }

  function sIstisno(t) {
    title('app va shared — istisno', 'ham qatlam, ham slice', t, L('L14').s - 0.3);
    ground(1);
    const ex = eio(P(t, L('L14').s - 0.6, 1.0)), tSeg = W('L15', 'segmentlar'), tFree = W('L15', 'erkin'), tLib = W('L15', 'libdan');
    building(t, (i) => ({ a: i === 0 ? 1 : 1 - ex, lift: i > 0 ? ex * 7 : 0, glow: i === 0 ? P(t, W('L14', 'sherd'), 0.4) * (1 - P(t, tSeg, 0.5)) : 0 }));
    floorLabel(0, 1, 0, false);
    // shared segmentlari — to'g'ridan-to'g'ri qavat ustida (slice yo'q)
    const segs = [['ui', '#60a5fa', 1.0, 1.4], ['lib', '#a78bfa', 5.4, 1.4], ['api', '#34d399', 3.2, 2.6], ['config', '#94a3b8', 1.0, 3.4]];
    segs.forEach(([n, col, x, y], i) => {
      const k = P(t, tSeg + i * 0.2, 0.6);
      if (k <= 0) return;
      box(x, y, SZ + 0.02, 1.4, 1.2, 0.8 * eback(k), col, { shadow: false });
      const [lx, ly] = proj(x + 0.7, y + 0.6, SZ + 1.2);
      withA(k, () => pill(n, lx, ly - 10, col, { size: 24, mono: true, align: 'center', fg: C.ink }));
    });
    // ui -> lib erkin import
    const kA = P(t, tLib, 0.8);
    if (kA > 0) {
      const [ax, ay] = proj(2.4, 2.0, SZ + 1.0), [bx, by] = proj(5.4, 2.0, SZ + 1.0);
      arrow2(ax, ay - 30, bx, by - 30, C.green, kA, { w: 7 });
      check((ax + bx) / 2, (ay + by) / 2 - 80, P(t, tLib + 0.6, 0.4), C.green, 0.8);
    }
    const kc = P(t, W('L14', 'ikki'), 0.5);
    card(240, 230, kc);
    withA(kc, () => {
      text('app, shared', PX + 36, 290, { size: 36, weight: 800, fam: MONO, color: '#3b5bdb' });
      text('slice yo‘q — segmentlar', PX + 36, 345, { size: 30, weight: 700 });
      withA(P(t, tFree, 0.4), () => text('segmentlar bir-birini erkin import qiladi', PX + 36, 395, { size: 26, color: C.soft }));
    });
    withA(P(t, tLib, 0.4), () => pill('shared/ui → shared/lib  ✓', PX + PW / 2, 520, C.green, { size: 28, align: 'center', mono: true }));
  }

  function sTanlash(t) {
    title('Qaysi qatlamlar kerak', 'rasmiy Layers sahifasi', t, L('L16').s - 0.3);
    ground(1);
    const tMin = W('L16', 'kamida'), tRest = W('L17', 'qolganlari'), tNew = W('L18', 'yangi');
    const minimal = (i) => i === 0 || i === 4 || i === 5;
    const grow = (i) => P(t, tRest + 0.4 + (i - 1) * 0.5, 0.6);
    building(t, (i) => {
      if (t < tMin || minimal(i)) return { glow: minimal(i) && t > tMin ? P(t, tMin, 0.3) * (1 - P(t, tMin + 2.4, 0.5)) : 0 };
      const g = grow(i);
      return { a: 0.25 + 0.75 * g, ghost: g < 0.5 };
    });
    LAYERS.forEach((_, i) => floorLabel(i, t < tMin || minimal(i) ? 1 : 0.3 + 0.7 * grow(i), 0, false));
    // o'z qatlami — core/
    const kc = P(t, tNew, 0.6);
    if (kc > 0) {
      const z = floorZ(6) + (1 - eo(kc)) * 2;
      box(0, 0, z, BW, BD, FH, '#fecaca', { a: kc, dashed: true, stroke: C.red });
      const [x, y] = proj(0, BD, z + FH / 2);
      withA(kc, () => pill('core/', x - 30, y, C.red, { size: 26, mono: true, align: 'right' }));
      const [cx, cy] = proj(BW / 2, BD / 2, z + FH);
      crossB(cx, cy - 20, P(t, W('L18', 'tavsiya'), 0.4), 1.2);
    }
    const km = P(t, tMin, 0.5);
    card(240, 200, km);
    withA(km, () => {
      text('kamida 3 ta qatlam', PX + 36, 292, { size: 36, weight: 800 });
      ['shared', 'pages', 'app'].forEach((s, i) => withA(P(t, tMin + 0.3 + i * 0.3, 0.4), () => pill(s, PX + 36 + i * 180, 362, LAYERS[[0, 4, 5][i]].col, { size: 28, mono: true, fg: C.ink })));
    });
    const kr = P(t, tRest, 0.5);
    card(470, 110, kr);
    withA(kr, () => text('qolganlari — haqiqatan kerak bo‘lganda', PX + 36, 525, { size: 28, weight: 700, color: '#3b5bdb' }));
    const kn = P(t, W('L18', 'tavsiya'), 0.5);
    card(610, 110, kn);
    withA(kn, () => { crossB(PX + 56, 665, 1, 0.7); text('yangi qatlam — tavsiya etilmaydi', PX + 96, 666, { size: 28, weight: 700, color: C.red }); });
  }

  // Steiger chiqishi — steiger-xato.txt / steiger-toza.txt (xabarlar so'zma-so'z)
  const ERR = [
    ['src/widgets/header/ui/header.ts:3:26', '✘', 'Forbidden cross-import from slice "sidebar".', 'fsd/forbidden-imports'],
    ['src/widgets/header/ui/header.ts:4:27', '⚠', 'Forbidden import from higher layer "pages".', 'fsd/forbidden-imports'],
    ['src/processes', '✘', 'Layer "processes" is deprecated, avoid using it', 'fsd/no-processes'],
  ];
  function sSteiger(t) {
    title('Steiger', 'xatolar ataylab kiritilgan loyiha', t, L('L19').s - 0.3);
    ground(1);
    const tE = [W('L20', 'xeder'), W('L20', 'peyjiz'), W('L21', 'eskirgan')], tCore = W('L22', 'kor'), tFix = W('L23', 'tuzatilgan'), tLib = W('L23', 'yu-ay');
    const fixed = t > tFix + 0.3;
    building(t, (i) => ({
      red: !fixed && i === 3 && t > tE[0],
      green: t > tFix + 0.6,
      glow: fixed ? P(t, tFix + 0.6, 0.4) * (1 - P(t, tFix + 2.6, 0.6)) : 0,
    }));
    LAYERS.forEach((_, i) => floorLabel(i, 1, 0, false));
    const x = PX - 20, y = 220, w = PW + 20, h = 640;
    withA(P(t, W('L19', 'stayger'), 0.6), () => {
      panel(x, y, w, h, { dark: true, title: 'terminal' });
      text('$ npx steiger src', x + 30, y + 74, { size: 24, weight: 700, fam: MONO, color: '#86efac' });
      if (!fixed) {
        ERR.forEach(([loc, mark, msg, rule], i) => withA(P(t, tE[i], 0.5), () => {
          const yy = y + 130 + i * 130, col = mark === '⚠' ? '#fcd34d' : '#fda4af';
          text('┌ ' + loc, x + 30, yy, { size: 19, fam: MONO, color: '#94a3b8', weight: 500 });
          text(mark + ' ' + msg, x + 30, yy + 34, { size: 21, fam: MONO, color: col, weight: 700 });
          text('└ ' + rule, x + 30, yy + 68, { size: 19, fam: MONO, color: '#94a3b8', weight: 500 });
        }));
        withA(P(t, tE[2] + 0.8, 0.4), () => text('Found 2 errors and 1 warning (none can be fixed automatically)', x + 30, y + 540, { size: 17, fam: MONO, color: '#fda4af', weight: 700 }));
        withA(P(t, tCore, 0.4), () => { pill('src/core/ — xabar yo‘q', x + w / 2, y + h - 40, C.amber, { size: 24, mono: true, align: 'center' }); });
      } else {
        withA(P(t, tFix + 0.6, 0.4), () => text('✔ No problems found!', x + 30, y + 140, { size: 38, fam: MONO, color: '#86efac', weight: 800 }));
        withA(P(t, tLib, 0.4), () => text('shared/ui → shared/lib — xato emas', x + 30, y + 210, { size: 24, fam: MONO, color: '#cbd5e1', weight: 600 }));
      }
    });
  }

  function sXulosa(t) {
    ground(1);
    const t25 = L('L25').s, out = 1 - P(t, t25 - 0.2, 0.6);
    withA(out, () => {
      building(t, () => ({}));
      text('Xulosa', 960, 110, { size: 56, weight: 800, align: 'center' });
      const cards = [['7 qatlam', 'yuqoridan pastga', 'yettita', '#3b5bdb'], ['Import', 'faqat pastga', 'import', C.green], ['Istisno', 'app · shared', 'ep', '#7c3aed']];
      cards.forEach(([h, s, word, col], i) => {
        const k = eback(P(t, W('L24', word), 0.6)), x = 260 + i * 480, y = 830;
        if (k <= 0) return;
        withA(clamp(k), () => {
          ctx.save(); ctx.translate(x + 200, y + 70); ctx.scale(k, k); ctx.translate(-x - 200, -y - 70);
          panel(x, y, 420, 140);
          ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x, y, 14, 140, [18, 0, 0, 18]); ctx.fill();
          text(h, x + 40, y + 52, { size: 38, weight: 800, color: col }); text(s, x + 40, y + 102, { size: 28, color: C.soft, fam: i === 2 ? MONO : UI });
          ctx.restore();
        });
      });
    });
    const kt = eo(P(t, t25, 0.9));
    withA(kt, () => {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, SW, SH);
      text('Rahmat!', 960, 450 + (1 - kt) * 30, { size: 150, weight: 800, align: 'center', color: '#3b5bdb' });
      withA(P(t, W('L25', 'keyingi'), 0.6), () => { text('Keyingi bob: Slice’lar', 960, 590, { size: 40, align: 'center', color: C.soft }); text('mfs1011.github.io/dev-docs', 960, 660, { size: 40, weight: 700, fam: MONO, align: 'center', color: '#e11d48' }); });
    });
  }

  const SCENES = { intro: sIntro, tartib: sTartib, qatlamlar: sQatlamlar, import: sImport, istisno: sIstisno, tanlash: sTanlash, steiger: sSteiger, xulosa: sXulosa };
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
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#3b5bdb' }); text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 }); text('3-bob · Qatlamlar', 1158, 545, { size: 34, color: C.soft });
  };
  if (location.hash === '#play') {
    const t0 = performance.now();
    const loop = () => { render(((performance.now() - t0) / 1000) % TM.end); requestAnimationFrame(loop); };
    document.fonts.ready.then(loop);
  } else render(0);
})();
