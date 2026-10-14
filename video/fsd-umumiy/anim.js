// FSD videosi — izometrik 3D bino va uzluksiz kamera. Ovoz birinchi: harakatlar aytilgan so'zga bog'langan (SY.W).
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
      const g = [proj(-6, -6, 0), proj(14, -6, 0), proj(14, 11, 0), proj(-6, 11, 0)];
      poly(g, 'rgba(220, 232, 214, 0.9)');
      ctx.strokeStyle = 'rgba(120, 150, 120, 0.18)'; ctx.lineWidth = 1;
      for (let i = -6; i <= 14; i++) { const a1 = proj(i, -6, 0), b1 = proj(i, 11, 0); ctx.beginPath(); ctx.moveTo(...a1); ctx.lineTo(...b1); ctx.stroke(); }
      for (let j = -6; j <= 11; j++) { const a1 = proj(-6, j, 0), b1 = proj(14, j, 0); ctx.beginPath(); ctx.moveTo(...a1); ctx.lineTo(...b1); ctx.stroke(); }
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
      box(0, 0, z, BW, BD, FH, col, { a: a * (s.dim ? 0.35 : 1), shadow: i === 0 });
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
  function camera(t) {
    const s = TM.scenes;
    const ent = floorZ(1) + FH;
    const frames = [
      [0, [90, -30, 0.95]],
      [s.muammo.s, [90, -30, 0.95]],
      [W('L5', 'ef-es-di') - 0.4, [210, -10, 0.92]],
      [W('L12', 'eng'), [330, 0, 0.92]],
      [W('L15', 'har') - 0.3, [(4 - 2.5) * U, ((4 + 2.5) * U) / 2 - (ent + 0.6) * U, 1.55]],
      [W('L17', 'xona') - 0.3, [(2.1 - 2.5) * U, ((2.1 + 2.5) * U) / 2 - (ent + 0.6) * U, 2.4]],
      [W('L19', 'har') - 0.3, [(2.1 - 2.5) * U, ((2.1 + 2.5) * U) / 2 - (ent + 0.6) * U, 2.0]],
      [W('L21', 'bu') - 0.3, [580, -30, 0.8]],
      [W('L24', 'qayerdan') - 0.3, [150, -30, 0.92]],
      [W('L26', 'xulosa') - 0.3, [90, -60, 0.62]],
    ];
    const v = kfv(t, frames, 1.6);
    cam = { tx: v[0], ty: v[1], z: v[2] };
  }

  function sIntro(t) {
    ground(1);
    building(t, (i) => ({ a: P(t, 0.4 + i * 0.28, 0.4), lift: (1 - eo(P(t, 0.4 + i * 0.28, 0.7))) * 4 }));
    const k = eo(P(t, 1.0, 0.9));
    withA(k, () => {
      text('FSD', 80, 140 + (1 - k) * 30, { size: 150, weight: 800, color: '#3b5bdb' });
      text('Feature-Sliced Design', 86, 245 + (1 - k) * 30, { size: 46, weight: 700 });
    });
    withA(eo(P(t, W('L1', 'frontend'), 0.8)), () => text('frontend loyihani tartibli qurish usuli', 86, 300, { size: 32, color: C.soft }));
  }

  function sMuammo(t) {
    const t2 = L('L2').s, fly = eio(P(t, W('L4', 'ef-es-di'), 1.4));
    // bino sekin paydo bo'ladi (FSD aytilganda)
    ground(P(t, W('L4', 'ef-es-di'), 1.0));
    building(t, (i) => ({ a: P(t, W('L4', 'aniq') + i * 0.12, 0.5) }));
    withA(1 - P(t, W('L4', 'ef-es-di') + 0.9, 0.5), () => {
      title('Muammo', 'loyiha o‘sgan sari', t, t2 - 0.4);
      const folders = [['components/', 'komponents', 260, 330], ['utils/', 'yutils', 760, 300], ['helpers/', 'xelpers', 1260, 340]];
      const files = [];
      folders.forEach(([name, word, x, y], fi) => {
        const k = eback(P(t, W('L2', word), 0.6));
        if (k <= 0) return;
        withA(clamp(k), () => {
          const fx = lerp(x, 960, fly), fy = lerp(y, 600, fly);
          panel(fx, fy, 380, 320);
          text('📁 ' + name, fx + 24, fy + 40, { size: 30, weight: 800 });
          for (let j = 0; j < 5; j++) {
            const yy = fy + 90 + j * 44, shake = name === 'utils/' && j === 2 ? Math.sin(t * 40) * 6 * P(t, W('L3', 'buziladi'), 0.2) * (1 - P(t, W('L4', 'ef-es-di'), 0.3)) : 0;
            const broken = shake !== 0;
            text(['Button.tsx', 'formatPrice.ts', 'useCart.ts', 'api.ts', 'Header.tsx', 'helpers.ts', 'store.ts', 'types.ts', 'Modal.tsx', 'utils.ts', 'date.ts', 'Card.tsx', 'auth.ts', 'cart.ts', 'list.tsx'][fi * 5 + j], fx + 40 + shake, yy, { size: 24, weight: 500, fam: MONO, color: broken ? C.red : C.soft });
            files.push([fx + 36, yy]);
          }
        });
      });
      // chigal importlar
      const kI = P(t, W('L3', 'import'), 1.6);
      if (kI > 0 && files.length >= 15) {
        ctx.save(); ctx.strokeStyle = 'rgba(225, 29, 72, 0.55)'; ctx.lineWidth = 2.5;
        for (let i = 0; i < 18; i++) {
          if (i / 18 > kI) break;
          const a = files[Math.floor(rnd(i * 3) * 15)], b = files[Math.floor(rnd(i * 7 + 1) * 15)];
          if (!a || !b) continue;
          ctx.beginPath(); ctx.moveTo(a[0] + 200, a[1]); ctx.bezierCurveTo(a[0] + 200 + 200 * rnd(i), a[1] - 200, b[0] - 100, b[1] + 160 * rnd(i + 2), b[0], b[1]); ctx.stroke();
        }
        ctx.restore();
      }
      withA(P(t, W('L3', 'buziladi'), 0.4), () => pill('bitta o‘zgarish — ko‘p joy buziladi', 960, 760, C.red, { size: 30, align: 'center' }));
    });
  }

  function sQatlamlar(t) {
    title('Qatlamlar', 'har bir qatlam — bino qavati', t, L('L5').s - 0.3);
    ground(1);
    const words = ['sherd', 'entitiz', 'fichers', 'vijets', 'peyjiz', 'ep'];
    const lineOf = ['L6', 'L7', 'L8', 'L9', 'L10', 'L10'];
    const at = (i) => W(lineOf[i], words[i]);
    const optional = P(t, W('L11', 'shart'), 0.5) * (1 - P(t, L('L11').e + 0.6, 0.5));
    building(t, (i) => ({
      a: 0.25 + 0.75 * P(t, at(i) - 0.2, 0.5),
      glow: P(t, at(i), 0.3) * (1 - P(t, at(i) + 1.6, 0.6)),
      dim: optional > 0.5 && (i === 2 || i === 3),
    }));
    LAYERS.forEach((_, i) => floorLabel(i, P(t, at(i), 0.6)));
    // eskirgan processes
    const kp = P(t, W('L11', 'proseses'), 0.6);
    if (kp > 0) {
      box(BW + 1.5, -1, floorZ(5) - 0.6, 4, 3, FH, '#c4b5fd', { a: kp * 0.9, dashed: true, stroke: '#7c3aed' });
      const [x, y] = proj(BW + 3.5, 0.5, floorZ(5) + 0.4);
      withA(kp, () => { pill('processes', x, y - 40, '#7c3aed', { size: 26, align: 'center', mono: true }); text('eskirgan', x, y + 10, { size: 30, weight: 800, color: C.red, align: 'center' }); ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 90, y - 40); ctx.lineTo(x + 90, y - 40); ctx.stroke(); });
    }
    withA(P(t, W('L11', 'yettita'), 0.5), () => pill('7 ta qatlam', 1500, 860, '#3b5bdb', { size: 30, align: 'center' }));
    withA(optional, () => pill('hammasi shart emas', 1500, 930, C.soft, { size: 28, align: 'center' }));
  }

  function sImport(t) {
    title('Import qoidasi', 'faqat pastdagi qatlamlardan', t, L('L12').s - 0.3);
    ground(1);
    const tLift = W('L13', 'liftga'), tOk = W('L13', 'sahifa'), tNo = W('L13', 'entiti');
    const pagesI = 4, widgetsI = 3, entI = 1, featI = 2;
    building(t, (i) => ({
      green: (t > tOk && t < tNo && (i === pagesI || i === widgetsI)),
      red: (t > tNo + 0.3 && t < L('L14').s && (i === entI || i === featI)),
      glow: i <= 3 ? P(t, W('L14', 'xavfsiz'), 0.4) * (1 - P(t, L('L14').e + 0.6, 0.5)) : 0,
    }));
    LAYERS.forEach((_, i) => floorLabel(i, 1, 0, false));
    // lift shaxtasi
    const ks = P(t, W('L12', 'muhim'), 0.8);
    if (ks > 0) {
      box(BW + 0.6, 1.8, 0, 1.2, 1.4, floorZ(5) + FH, '#e2e8f0', { a: ks * 0.55, shadow: false, stroke: '#64748b' });
      // kabina: pages -> widgets (ruxsat), entities -> features (taqiqlangan, qaytadi)
      let cz = floorZ(pagesI);
      if (t > tOk) cz = lerp(floorZ(pagesI), floorZ(widgetsI), eio(P(t, tOk, 1.2)));
      if (t > tNo) cz = lerp(floorZ(entI), floorZ(entI) + 0.7 * Math.sin(Math.PI * P(t, tNo, 1.2)), 1);
      box(BW + 0.7, 1.9, cz + 0.05, 1.0, 1.2, 0.8, t > tNo ? '#fca5a5' : '#86efac', { a: ks, shadow: false });
      // strelkalar
      const [ax, ay] = proj(BW + 2.6, 2.5, floorZ(pagesI) + 0.5), [bx, by] = proj(BW + 2.6, 2.5, floorZ(0) + 0.5);
      arrow2(ax, ay, bx, by, C.green, P(t, W('L12', 'pastdagi'), 1.0), { w: 8 });
      withA(P(t, W('L12', 'pastdagi'), 0.6), () => text('faqat pastga', ax + 30, (ay + by) / 2, { size: 30, weight: 800, color: C.green }));
    }
    const msg = (s, ok, k) => withA(k, () => { const x = 1420, y = 860; (ok ? check : crossB)(x - 40, y, k); text(s, x, y + 1, { size: 32, weight: 800, fam: MONO, color: ok ? C.green : C.red }); });
    msg('pages → widgets', true, P(t, tOk, 0.4) * (1 - P(t, tNo, 0.3)));
    msg('entities → features', false, P(t, tNo, 0.4) * (1 - P(t, L('L14').s + 0.5, 0.4)));
  }

  function sSlice(t) {
    title('Slice — xonalar', 'biznes sohasi bo‘yicha', t, L('L15').s - 0.3);
    ground(1);
    const explode = eio(P(t, W('L15', 'xonalarga') - 0.6, 1.0));
    const tRooms = W('L15', 'xonalarga'), tNoDoor = W('L16', 'eshik'), tImp = W('L16', 'import');
    building(t, (i) => ({ a: i <= 1 ? 1 : 1 - explode, lift: i > 1 ? explode * 7 : 0 }), {
      onFloor: (i, zTop, a) => { if (i === 1) rooms(1, zTop, P(t, tRooms, 0.8), { roomK: (r) => P(t, W('L15', r ? 'kart' : 'prodakt') - 0.3, 0.7), roomCol: (r) => (t > tImp && t < L('L16').e + 0.8 ? '#fecaca' : shade(LAYERS[1].col, 0.2 + r * 0.05)) }); },
    });
    floorLabel(1, P(t, tRooms, 0.6), 0, false);
    // devor: eshik yo'q
    const kd = P(t, tNoDoor, 0.5);
    if (kd > 0) {
      const zTop = floorZ(1) + FH;
      const [x1, y1] = proj(4.0, 0.6, zTop + 1.6), [x2, y2] = proj(4.0, 4.4, zTop + 1.6);
      withA(kd, () => { ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.setLineDash([16, 10]); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); });
      const [mx, my] = proj(4.0, 2.5, zTop + 2.4);
      crossB(mx, my, P(t, tImp, 0.4), 1.4);
      withA(P(t, tImp, 0.5), () => pill('cart  ✗→  product', mx, my - 80, C.red, { size: 28, align: 'center', mono: true }));
    }
  }

  function sSegment(t) {
    title('Segmentlar', 'xona ichida — vazifa bo‘yicha', t, L('L17').s - 0.3);
    ground(1);
    const zTop = floorZ(1) + FH;
    building(t, (i) => ({ a: i <= 1 ? 1 : 0, lift: i > 1 ? 7 : 0 }), {
      onFloor: (i, zz) => { if (i === 1) rooms(1, zz, 1, { roomA: (r) => (r === 0 ? 0.28 : 0.6), labelA: (r) => (r === 0 ? 0 : 1) }); },
    });
    const segs = [['ui', 'yu-ay', '#60a5fa', 'ko‘rinish'], ['api', 'ey-pi-ay', '#34d399', 'server'], ['model', 'model', '#fbbf24', 'ma’lumot'], ['lib', 'lib', '#a78bfa', 'yordamchi'], ['config', 'konfig', '#94a3b8', 'sozlama']];
    const pos = [[0.7, 0.9], [1.9, 0.9], [0.7, 2.4], [1.9, 2.4], [1.3, 3.5]];
    const [hx, hy] = proj(0.4, 0.6, zTop + 1.1);
    withA(P(t, L('L17').s, 0.6), () => pill('entities/product', hx, hy - 30, '#e11d48', { size: 26, mono: true, align: 'center' }));
    withA(P(t, W('L18', 'yu-ay'), 0.5), () => panel(1400, 280, 470, 400));
    segs.forEach(([name, word, col, uz], i) => {
      const k = P(t, W('L18', word), 0.6);
      if (k <= 0) return;
      const [x, y] = pos[i];
      box(x, y, zTop + 0.05, 0.85, 0.85, 0.7 * eback(k), col, { shadow: false });
      const [lx, ly] = proj(x + 0.42, y + 0.42, zTop + 1.0);
      withA(k, () => { pill(name, lx, ly - 18, col, { size: 22, mono: true, align: 'center', fg: C.ink }); });
      withA(k, () => text(`${name} — ${uz}`, 1440, 340 + i * 70, { size: 34, weight: 700, fam: MONO, color: shade(col, -0.4) }));
    });
  }

  function sApi(t) {
    title('Public API', 'har slice’ning bitta eshigi', t, L('L19').s - 0.3);
    ground(1);
    const zTop = floorZ(1) + FH;
    building(t, (i) => ({ a: i <= 1 ? 1 : 0, lift: i > 1 ? 7 : 0 }), {
      onFloor: (i, zz) => { if (i === 1) rooms(1, zz, 1, { roomA: () => 1 }); },
    });
    // eshik — product xonasining chap yuzida
    const kDoor = P(t, W('L19', 'eshigi'), 0.6);
    const door = [proj(1.6, 4.4, zTop), proj(2.6, 4.4, zTop), proj(2.6, 4.4, zTop + 0.85), proj(1.6, 4.4, zTop + 0.85)];
    withA(kDoor, () => { poly(door, '#7c2d12', '#431407', 3); const [dx, dy] = proj(2.1, 4.4, zTop + 1.3); pill('index.ts', dx, dy - 10, '#3b5bdb', { size: 26, mono: true, align: 'center' }); });
    // to'g'ri yo'l — eshik orqali
    const [ex, ey] = proj(2.1, 4.4, zTop + 0.4);
    arrow2(ex - 260, ey + 160, ex - 10, ey + 10, C.green, P(t, W('L20', 'eshik'), 0.8), { w: 8 });
    check(ex - 300, ey + 190, P(t, W('L20', 'eshik') + 0.6, 0.4));
    // noto'g'ri yo'l — devor orqali ichki faylga
    const [ix, iy] = proj(3.4, 2.5, zTop + 0.6);
    arrow2(ix + 340, iy - 120, ix + 20, iy, C.red, P(t, W('L20', 'ichki'), 0.8), { w: 8, dash: [16, 10] });
    crossB(ix + 360, iy - 140, P(t, W('L20', 'ichki') + 0.6, 0.4));
    withA(P(t, W('L20', 'ichki') + 0.4, 0.5), () => pill('…/product/model/types', ix + 360, iy - 210, C.red, { size: 24, mono: true, align: 'center' }));
    withA(P(t, W('L20', 'eshik') + 0.4, 0.5), () => pill("from '@/entities/product'", ex - 300, ey + 260, C.green, { size: 24, mono: true, align: 'center' }));
  }

  // Steiger chiqishi — steiger-xato.txt / steiger-toza.txt (qisqartirilmagan xabar matnlari)
  const ERR = [
    ['src/entities/cart/model/cart.ts:1:31', 'Forbidden cross-import from slice "product".', 'fsd/forbidden-imports'],
    ['src/entities/product/ui/product-card.ts:2:34', 'Forbidden import from higher layer "features".', 'fsd/forbidden-imports'],
    ['src/widgets/header/ui/header.ts:1:29', 'Forbidden sidestep of public API when importing from', 'fsd/no-public-api-sidestep'],
  ];
  function sSteiger(t) {
    title('Steiger', 'FSD’ning rasmiy linteri', t, L('L21').s - 0.3);
    ground(1);
    const tE = [W('L22', 'yuqori'), W('L22', 'bir'), W('L22', 'chetlab')], tFix = W('L23', 'tuzatilgach'), tOk = W('L23', 'muammo');
    const fixed = t > tFix + 0.3;
    building(t, (i) => ({
      red: !fixed && ((i === 1 && t > tE[0]) || (i === 3 && t > tE[2])),
      green: t > tOk,
      glow: t > tOk ? P(t, tOk, 0.4) * (1 - P(t, tOk + 2, 0.6)) : 0,
    }));
    LAYERS.forEach((_, i) => floorLabel(i, 1, 0, false));
    const x = 1010, y = 210, w = 860, h = 690;
    withA(P(t, W('L21', 'stayger'), 0.6), () => {
      panel(x, y, w, h, { dark: true, title: 'terminal' });
      text('$ npx steiger src', x + 30, y + 74, { size: 26, weight: 700, fam: MONO, color: '#86efac' });
      if (!fixed) {
        ERR.forEach(([loc, msg, rule], i) => {
          const k = P(t, tE[i === 0 ? 1 : i === 1 ? 0 : 2], 0.5);
          withA(k, () => {
            const yy = y + 130 + i * 170;
            text('┌ ' + loc, x + 30, yy, { size: 20, fam: MONO, color: '#94a3b8', weight: 500 });
            text('✘ ' + msg, x + 30, yy + 38, { size: 22, fam: MONO, color: '#fda4af', weight: 700 });
            if (i === 2) text('  "@/entities/cart/model/cart".', x + 30, yy + 70, { size: 22, fam: MONO, color: '#fda4af', weight: 700 });
            text('└ ' + rule, x + 30, yy + (i === 2 ? 104 : 74), { size: 20, fam: MONO, color: '#94a3b8', weight: 500 });
          });
        });
        withA(P(t, tE[2] + 0.8, 0.4), () => text('Found 3 errors (none can be fixed automatically)', x + 30, y + h - 50, { size: 22, fam: MONO, color: '#fda4af', weight: 700 }));
      } else {
        withA(P(t, tOk, 0.4), () => { text('✔ No problems found!', x + 30, y + 140, { size: 38, fam: MONO, color: '#86efac', weight: 800 }); });
      }
    });
  }

  function sPages(t) {
    title('Sahifadan boshlang', 'FSD v2.1 tavsiyasi', t, L('L24').s - 0.3);
    ground(1);
    const tDim = W('L24', 'sahifadan'), tMove = W('L25', 'kochiring'), tTwo = W('L25', 'bir');
    const used = (i) => i === 0 || i === 4 || i === 5 || (t > tMove + 0.6 && i === 2);
    const open = eio(P(t, tDim, 1.0));
    building(t, (i) => ({ dim: t > tDim && !used(i), lift: i === 5 ? open * 3 : 0, a: i === 5 ? 1 - 0.6 * open : 1, glow: i === 4 ? P(t, tDim, 0.4) * (1 - P(t, tDim + 2, 0.5)) : 0 }));
    LAYERS.forEach((_, i) => floorLabel(i, t > tDim ? (used(i) ? 1 : 0.35) : 1, i === 5 ? open * 3 : 0, false));
    // sahifalardagi kod bo'laklari — pages qavati ustida (app ko'tarilgan)
    const zP = floorZ(4) + FH;
    const k1 = P(t, W('L25', 'kodni'), 0.6), k2 = P(t, tTwo, 0.6);
    if (k1 > 0) { box(1.0, 1.4, zP, 1.6, 1.6, 0.9 * eback(k1), '#fde047', { shadow: false }); const [x, y] = proj(1.8, 2.2, zP + 1.3); withA(k1, () => pill('pages/catalog', x, y - 10, C.ink, { size: 22, mono: true, align: 'center' })); }
    if (k2 > 0) { box(5.0, 1.4, zP, 1.6, 1.6, 0.9 * eback(k2), '#fde047', { shadow: false }); const [x, y] = proj(5.8, 2.2, zP + 1.3); withA(k2, () => pill('pages/cart', x, y - 10, C.ink, { size: 22, mono: true, align: 'center' })); }
    // ikkala sahifada takrorlangan bo'lak: bino tashqarisidan features qavatiga tushadi
    const ka = P(t, tTwo + 0.8, 0.5);
    if (ka > 0) {
      const km = eio(P(t, tMove, 1.4));
      const z = lerp(zP + 0.1, floorZ(2) + 0.1, km);
      box(BW + 0.7, 1.9, z, 1.1, 1.1, 0.7, '#f97316', { shadow: false, a: ka });
      const [ax, ay] = proj(BW + 2.4, 2.5, zP + 0.4), [bx, by] = proj(BW + 2.4, 2.5, floorZ(2) + 0.4);
      arrow2(ax, ay, bx, by, C.green, P(t, tMove, 1.0), { w: 7 });
      withA(P(t, tMove + 1.2, 0.5), () => pill('takrorlangan kod → features', bx + 20, by + 10, C.green, { size: 26 }));
    }
  }

  function sXulosa(t) {
    ground(1);
    const t26 = L('L26').s, t27 = L('L27').s, out = 1 - P(t, t27 - 0.2, 0.6);
    withA(out, () => {
      building(t, () => ({}));
      text('Xulosa', 960, 110, { size: 56, weight: 800, align: 'center' });
      const cards = [['Qatlamlar', 'tartib', 'qatlamlar', '#3b5bdb'], ['Lift ↓', 'faqat pastga', 'lift', C.green], ['Xonalar', 'mustaqil', 'xonalar', '#e11d48'], ['Eshik', 'index.ts', 'eshikdan', '#7c2d12']];
      cards.forEach(([h, s, word, col], i) => {
        const k = eback(P(t, W('L26', word), 0.6)), x = 140 + i * 430, y = 830;
        if (k <= 0) return;
        withA(clamp(k), () => {
          ctx.save(); ctx.translate(x + 180, y + 70); ctx.scale(k, k); ctx.translate(-x - 180, -y - 70);
          panel(x, y, 360, 140);
          ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x, y, 14, 140, [18, 0, 0, 18]); ctx.fill();
          text(h, x + 40, y + 52, { size: 40, weight: 800, color: col }); text(s, x + 40, y + 102, { size: 28, color: C.soft, fam: i === 3 ? MONO : UI });
          ctx.restore();
        });
      });
    });
    const kt = eo(P(t, t27, 0.9));
    withA(kt, () => {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(0, 0, SW, SH);
      text('Rahmat!', 960, 470 + (1 - kt) * 30, { size: 150, weight: 800, align: 'center', color: '#3b5bdb' });
      withA(P(t, t27 + 0.8, 0.6), () => { text('Batafsil — FSD qo‘llanmasi:', 960, 610, { size: 40, align: 'center', color: C.soft }); text('mfs1011.github.io/dev-docs', 960, 680, { size: 40, weight: 700, fam: MONO, align: 'center', color: '#e11d48' }); });
    });
  }

  const SCENES = { intro: sIntro, muammo: sMuammo, qatlamlar: sQatlamlar, import: sImport, slice: sSlice, segment: sSegment, api: sApi, steiger: sSteiger, pages: sPages, xulosa: sXulosa };
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
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#3b5bdb' }); text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 }); text('qatlam · slice · segment', 1158, 545, { size: 34, color: C.soft });
  };
  if (location.hash === '#play') {
    const t0 = performance.now();
    const loop = () => { render(((performance.now() - t0) / 1000) % TM.end); requestAnimationFrame(loop); };
    document.fonts.ready.then(loop);
  } else render(0);
})();
