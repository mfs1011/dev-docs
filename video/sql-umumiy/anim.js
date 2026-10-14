// SQL videosi — "daftar" uslubi: qog'oz fon, qo'lda chizilgandek chiziqlar, haqiqiy ma'lumot oqimi.
// Ovoz birinchi: har harakat aytilgan so'zga bog'langan (SY.W), vaqt — video soniyasi (t).
(function () {
  const { L, W, WE } = window.SY;
  const TM = window.TM;
  const cv = document.getElementById('c'), ctx = cv.getContext('2d');
  const W0 = 1920, H0 = 1080;
  const C = {
    paper: '#fbf7ee', grid: '#e9e2d1', grid5: '#ddd3bc', ink: '#2b2d42', pencil: '#8a8578', soft: '#5d6075',
    blue: '#2f6fdb', green: '#2e9e5b', red: '#e0533d', orange: '#f08c2e', purple: '#7c5cd6', teal: '#169c9c',
    hl: 'rgba(255, 214, 10, 0.45)', hlBlue: 'rgba(80, 150, 255, 0.25)', hlGreen: 'rgba(60, 200, 120, 0.28)', hlRed: 'rgba(240, 80, 60, 0.22)',
    card: '#fffdf8',
  };
  const HAND = 'Noteworthy, "Marker Felt", "Comic Sans MS", cursive';
  const UI = '"Avenir Next", "Helvetica Neue", Arial, sans-serif';
  const MONO = 'Menlo, Monaco, monospace';

  // ---------- yordamchilar ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const P = (t, a, d) => clamp((t - a) / d);
  const lerp = (a, b, k) => a + (b - a) * k;
  const eo = (k) => 1 - Math.pow(1 - k, 3);
  const eio = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const eback = (k) => { const c1 = 1.7, c3 = c1 + 1; return k <= 0 ? 0 : 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const rnd = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const font = (s, w = 500, f = UI) => `${w} ${s}px ${f}`;
  function withA(a, fn) { if (a <= 0.002) return; ctx.save(); ctx.globalAlpha *= Math.min(1, a); fn(); ctx.restore(); }
  function tw(s, size, weight = 500, fam = UI) { ctx.font = font(size, weight, fam); return ctx.measureText(s).width; }
  function text(s, x, y, o = {}) {
    ctx.font = font(o.size || 30, o.weight || 500, o.fam || UI);
    ctx.fillStyle = o.color || C.ink; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }
  // Qo'lda yozilgandek: chapdan o'ngga ochiladi (p)
  function hand(s, x, y, o = {}) {
    const p = o.p == null ? 1 : o.p;
    if (p <= 0) return;
    const size = o.size || 44, w = tw(s, size, o.weight || 700, HAND);
    const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    ctx.save();
    ctx.beginPath(); ctx.rect(x0 - 10, y - size, (w + 20) * eio(p), size * 2); ctx.clip();
    text(s, x0, y, { size, weight: o.weight || 700, fam: HAND, color: o.color || C.ink });
    ctx.restore();
  }

  // Qo'lda chizilgan chiziq: ikki qatlam, mayda tebranish; p — chizilgan qismi
  function sketchPath(pts, o = {}) {
    const p = o.p == null ? 1 : o.p;
    if (p <= 0 || pts.length < 2) return;
    const seed = o.seed || 1, j = o.j == null ? 1.4 : o.j;
    ctx.save();
    ctx.strokeStyle = o.col || C.ink; ctx.lineWidth = o.w || 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const n = Math.max(2, Math.ceil(pts.length * p));
    for (let pass = 0; pass < (o.single ? 1 : 2); pass++) {
      ctx.globalAlpha *= pass ? 0.55 : 1;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const [x, y] = pts[i], dx = (rnd(seed * 31 + i * 7 + pass * 101) - 0.5) * 2 * j, dy = (rnd(seed * 17 + i * 13 + pass * 59) - 0.5) * 2 * j;
        i ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  const linePts = (x1, y1, x2, y2, bend = 0) => {
    const n = Math.max(8, Math.round(Math.hypot(x2 - x1, y2 - y1) / 14)), pts = [];
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, L0 = Math.hypot(x2 - x1, y2 - y1) || 1;
    const cx = mx - ((y2 - y1) / L0) * bend, cy = my + ((x2 - x1) / L0) * bend;
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push([(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2]); }
    return pts;
  };
  const sline = (x1, y1, x2, y2, o = {}) => sketchPath(linePts(x1, y1, x2, y2, o.bend || 0), o);
  function srect(x, y, w, h, o = {}) {
    const pts = [...linePts(x, y, x + w, y), ...linePts(x + w, y, x + w, y + h).slice(1), ...linePts(x + w, y + h, x, y + h).slice(1), ...linePts(x, y + h, x, y).slice(1)];
    sketchPath(pts, o);
  }
  function sellipse(cx, cy, rx, ry, o = {}) {
    const pts = [];
    for (let i = 0; i <= 60; i++) { const a = -Math.PI / 2 + (i / 60) * Math.PI * 2.08; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    sketchPath(pts, o);
  }
  function arrow(x1, y1, x2, y2, o = {}) {
    const p = o.p == null ? 1 : o.p;
    const pts = linePts(x1, y1, x2, y2, o.bend || 0);
    sketchPath(pts, o);
    if (p > 0.97) {
      const a = pts[pts.length - 1], b = pts[pts.length - 3], ang = Math.atan2(a[1] - b[1], a[0] - b[0]), hs = o.head || 18;
      sline(a[0], a[1], a[0] - Math.cos(ang - 0.45) * hs, a[1] - Math.sin(ang - 0.45) * hs, { ...o, p: 1, bend: 0 });
      sline(a[0], a[1], a[0] - Math.cos(ang + 0.45) * hs, a[1] - Math.sin(ang + 0.45) * hs, { ...o, p: 1, bend: 0, seed: (o.seed || 1) + 3 });
    }
  }
  // Marker bilan bo'yash (chapdan o'ngga)
  function marker(x, y, w, h, col = C.hl, p = 1) {
    if (p <= 0) return;
    ctx.save(); ctx.fillStyle = col;
    ctx.beginPath();
    const ww = w * eio(p);
    ctx.moveTo(x - 4, y + 3); ctx.lineTo(x + ww, y - 2); ctx.lineTo(x + ww + 3, y + h + 1); ctx.lineTo(x - 2, y + h - 2); ctx.closePath();
    ctx.fill(); ctx.restore();
  }
  function card(x, y, w, h, o = {}) {
    withA(o.a == null ? 1 : o.a, () => {
      ctx.save();
      ctx.shadowColor = 'rgba(60, 50, 30, 0.16)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
      ctx.fillStyle = o.fill || C.card; ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill();
      ctx.restore();
      srect(x + 2, y + 2, w - 4, h - 4, { col: o.col || 'rgba(43,45,66,0.55)', w: 2, seed: o.seed || 3, j: 1.1, p: o.p == null ? 1 : o.p });
    });
  }
  // Sahna sarlavhasi: chap yuqorida, marker bilan tagiga chizilgan
  function heading(s, t, t0) {
    const k = P(t, t0, 0.9);
    hand(s, 90, 92, { size: 54, p: k });
    marker(88, 104, tw(s, 54, 700, HAND) + 8, 16, C.hl, P(t, t0 + 0.5, 0.6));
  }
  // Kod kartasi: SQL so'rovi, kalit so'zlar rangli; typed — yozilgan qism (0..1), hl — marker bilan ajratilgan qator
  const KW = /\b(SELECT|FROM|WHERE|ORDER BY|GROUP BY|JOIN|ON|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|CREATE INDEX|BEGIN|COMMIT|ROLLBACK|count)\b/g;
  function codeCard(x, y, w, lines, o = {}) {
    const size = o.size || 32, lh = size * 1.55, h = lines.length * lh + 44;
    card(x, y, w, h, { a: o.a, p: o.cardP, seed: 7 });
    withA(o.a == null ? 1 : o.a, () => {
      const total = lines.join('').length;
      let budget = Math.floor((o.typed == null ? 1 : o.typed) * total);
      lines.forEach((ln, i) => {
        const ly = y + 22 + lh / 2 + i * lh;
        if (o.hl && o.hl[i] > 0) marker(x + 18, ly - lh * 0.36, w - 36, lh * 0.72, o.hlCol || C.hl, o.hl[i]);
        const shown = ln.slice(0, Math.max(0, Math.min(ln.length, budget)));
        budget -= ln.length;
        let cx = x + 32;
        // kalit so'zlar ko'k, qolgani siyoh
        const parts = shown.split(KW);
        ctx.font = font(size, 600, MONO);
        parts.forEach((part) => {
          if (!part) return;
          const isKw = /^(SELECT|FROM|WHERE|ORDER BY|GROUP BY|JOIN|ON|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|CREATE INDEX|BEGIN|COMMIT|ROLLBACK|count)$/.test(part);
          text(part, cx, ly, { size, weight: isKw ? 700 : 500, fam: MONO, color: isKw ? C.blue : C.ink });
          cx += tw(part, size, isKw ? 700 : 500, MONO);
        });
        if (o.badges && o.badges[i]) {
          const [n, k] = o.badges[i];
          if (k > 0) withA(k, () => {
            const bx = x - 34, s = eback(k);
            ctx.save(); ctx.translate(bx, ly); ctx.scale(s, s);
            ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(0, 0, 24, 0, 7); ctx.fill();
            text(String(n), 0, 2, { size: 26, weight: 800, fam: UI, color: '#fff', align: 'center' });
            ctx.restore();
          });
        }
      });
    });
    return h;
  }
  // psql chiqishi (haqiqiy, natijalar.txt dan)
  function outCard(x, y, w, lines, o = {}) {
    const size = o.size || 26, lh = size * 1.5, h = lines.length * lh + 30;
    withA(o.a == null ? 1 : o.a, () => {
      ctx.save(); ctx.fillStyle = o.err ? '#fff1ee' : '#f1f7ef'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill(); ctx.restore();
      srect(x + 2, y + 2, w - 4, h - 4, { col: o.err ? C.red : C.green, w: 2, seed: 11, j: 1 });
      lines.forEach((ln, i) => text(ln, x + 22, y + 15 + lh / 2 + i * lh, { size, weight: 600, fam: MONO, color: o.err ? C.red : C.green }));
    });
    return h;
  }

  // ---------- jadval ----------
  // cols: [{ label, w, align }], rows: [[...]]; o.row(i) -> { dy, a, strike, hl, col }, o.col(j) -> { a, dx, hl }
  const RH = 58, HH = 62;
  function table(x, y, name, cols, rows, o = {}) {
    const p = o.p == null ? 1 : o.p, a = o.a == null ? 1 : o.a;
    if (p <= 0 || a <= 0) return;
    const colX = []; let cx = 0;
    cols.forEach((c, j) => { const cs = o.col ? o.col(j) : {}; colX.push(cx + (cs.dx || 0)); cx += c.w; });
    const width = o.width ?? cx;
    const nRows = o.visibleRows ?? rows.length;
    withA(a, () => {
      // nomi (qo'lda)
      if (name) hand(name, x + 6, y - 30, { size: 34, p: P(p, 0, 0.4) * 1, color: C.soft });
      ctx.save(); ctx.fillStyle = 'rgba(255,253,248,0.92)'; ctx.fillRect(x, y, width, HH + nRows * RH); ctx.restore();
      // sarlavha qatori
      cols.forEach((c, j) => {
        const cs = o.col ? o.col(j) : {}, ca = cs.a == null ? 1 : cs.a;
        withA(ca * P(p, 0.15, 0.4), () => {
          if (cs.hl) marker(x + colX[j] + 6, y + 12, c.w - 12, HH - 24, cs.hlCol || C.hl, cs.hl);
          text(c.label, x + colX[j] + (c.align === 'right' ? c.w - 18 : 18), y + HH / 2 + 1, { size: 30, weight: 700, fam: HAND, color: C.ink, align: c.align === 'right' ? 'right' : 'left' });
        });
      });
      // qatorlar
      rows.forEach((r, i) => {
        const rs = o.row ? o.row(i) : {}, ra = (rs.a == null ? 1 : rs.a) * P(p, 0.3 + (i / Math.max(1, rows.length)) * 0.5, 0.25);
        if (ra <= 0.002) return;
        const ry = y + HH + (rs.slot == null ? i : rs.slot) * RH + (rs.dy || 0);
        withA(ra, () => {
          if (rs.hl) marker(x + 6, ry + 8, width - 12, RH - 16, rs.hlCol || C.hl, rs.hl);
          r.forEach((v, j) => {
            const cs = o.col ? o.col(j) : {}, ca = cs.a == null ? 1 : cs.a, c = cols[j];
            if (ca <= 0.002) return;
            withA(ca, () => {
              const cellCol = rs.cellCol && rs.cellCol[j];
              if (cs.hl && cs.cellHl !== false) marker(x + colX[j] + 6, ry + 8, c.w - 12, RH - 16, cs.hlCol || C.hl, cs.hl);
              text(String(v), x + colX[j] + (c.align === 'right' ? c.w - 18 : 18), ry + RH / 2 + 1, { size: 29, weight: 500, fam: typeof v === 'number' ? MONO : UI, color: cellCol || rs.col || C.ink, align: c.align === 'right' ? 'right' : 'left' });
            });
          });
          if (rs.strike > 0) sline(x + 10, ry + RH / 2, x + 10 + (width - 20) * rs.strike, ry + RH / 2 + 2, { col: C.red, w: 4, seed: 40 + i, p: 1 });
        });
      });
      // chiziqlar (chizilib chiqadi)
      const hTotal = HH + nRows * RH;
      srect(x, y, width, hTotal, { p: P(p, 0, 0.5), w: 2.6, seed: 21 });
      sline(x, y + HH, x + width, y + HH, { p: P(p, 0.2, 0.4), w: 2.4, seed: 22 });
      for (let i = 1; i < nRows; i++) sline(x, y + HH + i * RH, x + width, y + HH + i * RH, { p: P(p, 0.35, 0.4), w: 1, col: 'rgba(43,45,66,0.25)', seed: 30 + i, single: true });
      cols.forEach((c, j) => { if (j) { const cs = o.col ? o.col(j) : {}; withA(cs.a == null ? 1 : cs.a, () => sline(x + colX[j], y, x + colX[j], y + hTotal, { p: P(p, 0.25, 0.4), w: 1.6, col: 'rgba(43,45,66,0.45)', seed: 50 + j, single: true })); } });
    });
  }
  const colCenter = (x, cols, j) => x + cols.slice(0, j).reduce((s, c) => s + c.w, 0) + cols[j].w / 2;
  const rowCenter = (y, i) => y + HH + i * RH + RH / 2;
  const kf = (t, frames, dur = 0.8) => {
    let v = frames[0][1];
    for (let i = 1; i < frames.length; i++) { const [at, nv] = frames[i]; if (t < at) break; const k = eio(P(t, at, dur)); v = lerp(v, nv, k); }
    return v;
  };

  // ---------- doodle'lar ----------
  function dbCylinder(cx, cy, w, h, p, col = C.blue) {
    sellipse(cx, cy - h / 2, w / 2, 18, { p: P(p, 0, 0.35), col, w: 3, seed: 61 });
    sline(cx - w / 2, cy - h / 2, cx - w / 2, cy + h / 2, { p: P(p, 0.3, 0.25), col, w: 3, seed: 62 });
    sline(cx + w / 2, cy - h / 2, cx + w / 2, cy + h / 2, { p: P(p, 0.3, 0.25), col, w: 3, seed: 63 });
    const pts = []; for (let i = 0; i <= 30; i++) { const a = Math.PI * (i / 30); pts.push([cx + Math.cos(a) * w / 2, cy + h / 2 + Math.sin(a) * 18]); }
    sketchPath(pts.reverse(), { p: P(p, 0.55, 0.25), col, w: 3, seed: 64 });
    for (let k = 1; k <= 2; k++) { const pts2 = []; for (let i = 0; i <= 30; i++) { const a = Math.PI * (i / 30); pts2.push([cx + Math.cos(a) * w / 2, cy - h / 2 + (h / 3) * k + Math.sin(a) * 18]); } sketchPath(pts2.reverse(), { p: P(p, 0.7, 0.3), col, w: 2, seed: 65 + k }); }
  }
  function keyIcon(x, y, s, p, col = C.orange) {
    sellipse(x, y, 16 * s, 16 * s, { p: P(p, 0, 0.5), col, w: 4, seed: 71 });
    sline(x + 16 * s, y, x + 58 * s, y, { p: P(p, 0.4, 0.3), col, w: 4, seed: 72 });
    sline(x + 44 * s, y, x + 44 * s, y + 14 * s, { p: P(p, 0.7, 0.2), col, w: 4, seed: 73 });
    sline(x + 54 * s, y, x + 54 * s, y + 10 * s, { p: P(p, 0.8, 0.2), col, w: 4, seed: 74 });
  }
  function sticky(x, y, w, h, label, col, k, rot = 0) {
    if (k <= 0) return;
    withA(k, () => {
      ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.scale(eback(k), eback(k));
      ctx.shadowColor = 'rgba(60,50,30,0.2)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
      ctx.fillStyle = col; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
      text(label, 0, 0, { size: 32, weight: 700, fam: HAND, align: 'center' });
      ctx.restore();
    });
  }
  function shop(x, y, p) {
    srect(x, y + 70, 300, 210, { p: P(p, 0, 0.4), w: 3, seed: 81 });
    for (let i = 0; i < 6; i++) {
      withA(P(p, 0.3 + i * 0.05, 0.2), () => { ctx.fillStyle = i % 2 ? '#fff' : 'rgba(224,83,61,0.75)'; ctx.beginPath(); ctx.moveTo(x - 10 + i * 53.3, y + 20); ctx.lineTo(x - 10 + (i + 1) * 53.3, y + 20); ctx.lineTo(x - 10 + (i + 1) * 53.3, y + 70); ctx.quadraticCurveTo(x - 10 + (i + 0.5) * 53.3, y + 92, x - 10 + i * 53.3, y + 70); ctx.fill(); });
    }
    sline(x - 10, y + 20, x + 310, y + 20, { p: P(p, 0.25, 0.3), w: 3, seed: 82 });
    srect(x + 110, y + 160, 80, 120, { p: P(p, 0.6, 0.3), w: 3, seed: 83 });
    srect(x + 24, y + 130, 64, 60, { p: P(p, 0.7, 0.3), w: 2.5, seed: 84 });
    srect(x + 212, y + 130, 64, 60, { p: P(p, 0.75, 0.3), w: 2.5, seed: 85 });
    hand('Do‘kon', x + 150, y + 4, { size: 40, align: 'center', p: P(p, 0.5, 0.4), color: C.red });
  }
  function bookIcon(x, y, p) {
    sline(x, y, x + 180, y + 20, { p: P(p, 0, 0.3), w: 3, seed: 91 }); sline(x + 180, y + 20, x + 360, y, { p: P(p, 0.1, 0.3), w: 3, seed: 92 });
    sline(x, y, x, y + 230, { p: P(p, 0.2, 0.3), w: 3, seed: 93 }); sline(x + 360, y, x + 360, y + 230, { p: P(p, 0.25, 0.3), w: 3, seed: 94 });
    sline(x, y + 230, x + 180, y + 250, { p: P(p, 0.35, 0.3), w: 3, seed: 95 }); sline(x + 180, y + 250, x + 360, y + 230, { p: P(p, 0.4, 0.3), w: 3, seed: 96 });
    sline(x + 180, y + 20, x + 180, y + 250, { p: P(p, 0.45, 0.3), w: 3, seed: 97 });
    for (let i = 0; i < 6; i++) { sline(x + 20, y + 50 + i * 30, x + 160, y + 60 + i * 30, { p: P(p, 0.55 + i * 0.05, 0.2), w: 1.6, col: C.pencil, seed: 100 + i, single: true }); sline(x + 200, y + 60 + i * 30, x + 340, y + 50 + i * 30, { p: P(p, 0.6 + i * 0.05, 0.2), w: 1.6, col: C.pencil, seed: 110 + i, single: true }); }
  }
  function laptop(x, y, s, p) {
    srect(x - 60 * s, y - 40 * s, 120 * s, 80 * s, { p: P(p, 0, 0.5), w: 2.5, seed: 121 });
    sline(x - 80 * s, y + 48 * s, x + 80 * s, y + 48 * s, { p: P(p, 0.5, 0.4), w: 3, seed: 122 });
  }
  function serverBox(x, y, p, col) {
    for (let i = 0; i < 3; i++) {
      srect(x - 70, y - 75 + i * 50, 140, 44, { p: P(p, i * 0.15, 0.4), w: 2.6, col, seed: 131 + i });
      withA(P(p, 0.5 + i * 0.1, 0.2), () => { ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x + 46, y - 53 + i * 50, 6, 0, 7); ctx.fill(); });
    }
  }
  function fileIcon(x, y, label, p) {
    sketchPath([[x, y], [x + 70, y], [x + 100, y + 30], [x + 100, y + 130], [x, y + 130], [x, y]], { p: P(p, 0, 0.6), w: 3, seed: 141, col: C.teal });
    sketchPath([[x + 70, y], [x + 70, y + 30], [x + 100, y + 30]], { p: P(p, 0.5, 0.3), w: 2.5, seed: 142, col: C.teal });
    hand(label, x + 50, y + 165, { size: 28, align: 'center', p: P(p, 0.6, 0.4), color: C.teal });
  }
  function check(x, y, k, col = C.green) { sketchPath([[x - 16, y], [x - 4, y + 14], [x + 20, y - 18]], { p: k, w: 6, col, seed: 151 }); }
  function cross(x, y, k, s = 1, col = C.red) { sline(x - 22 * s, y - 22 * s, x + 22 * s, y + 22 * s, { p: P(k, 0, 0.5), w: 7, col, seed: 152 }); sline(x + 22 * s, y - 22 * s, x - 22 * s, y + 22 * s, { p: P(k, 0.5, 0.5), w: 7, col, seed: 153 }); }

  // ---------- fon ----------
  const DOTS = Array.from({ length: 900 }, (_, i) => [rnd(i) * W0, rnd(i + 999) * H0, rnd(i + 77) * 0.06]);
  function bg() {
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W0, H0);
    ctx.lineWidth = 1;
    for (let x = 40, k = 0; x < W0; x += 40, k++) { ctx.strokeStyle = k % 5 === 4 ? C.grid5 : C.grid; ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H0); ctx.stroke(); }
    for (let y = 40, k = 0; y < H0; y += 40, k++) { ctx.strokeStyle = k % 5 === 4 ? C.grid5 : C.grid; ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W0, y + 0.5); ctx.stroke(); }
    DOTS.forEach(([x, y, a]) => { ctx.fillStyle = `rgba(120,100,60,${a})`; ctx.fillRect(x, y, 2, 2); });
    const v = ctx.createRadialGradient(W0 / 2, H0 / 2, H0 * 0.45, W0 / 2, H0 / 2, H0 * 1.05);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(90,70,30,0.16)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W0, H0);
  }

  // ---------- ma'lumot (natijalar.txt bilan bir xil) ----------
  const MAHSULOT = [[1, 'Daftar', 8000], [2, 'Qalam', 3000], [3, 'Kitob', 45000], [4, 'Ruchka', 5000], [5, 'Sumka', 120000]];
  const MIJOZ = [[1, 'Ali', 'Toshkent'], [2, 'Malika', 'Samarqand'], [3, 'Jasur', 'Buxoro'], [4, 'Nodira', 'Toshkent']];
  const BUYURTMA = [[1, 1, 1, 3], [2, 2, 3, 1], [3, 1, 2, 5], [4, 3, 5, 1], [5, 4, 1, 2], [6, 2, 4, 4]];
  const MCOLS = [{ label: 'id', w: 100 }, { label: 'nomi', w: 230 }, { label: 'narxi', w: 200, align: 'right' }];
  const ID_COL = { 1: C.blue, 2: C.purple, 3: C.green, 4: C.orange };

  // ---------- sahnalar ----------
  function sIntro(t) {
    const k = P(t, 0.3, 1.0);
    hand('SQL', 960, 400, { size: 230, align: 'center', p: k, color: C.blue });
    marker(760, 500, 400 * eio(P(t, 1.0, 0.6)), 26, C.hl, 1);
    hand('qanday ishlaydi?', 960, 590, { size: 76, align: 'center', p: P(t, 1.2, 1.2) });
    dbCylinder(470, 430, 180, 200, P(t, W('L1', 'malumotlar'), 1.6));
    withA(P(t, W('L1', 'gaplashish'), 0.6), () => {
      ctx.save(); ctx.translate(1450, 420);
      sellipse(0, 0, 140, 90, { col: C.green, w: 3, seed: 160, p: P(t, W('L1', 'gaplashish'), 0.8) });
      sketchPath([[-60, 80], [-90, 130], [-20, 86]], { col: C.green, w: 3, seed: 161, p: P(t, W('L1', 'gaplashish') + 0.4, 0.4) });
      ctx.restore();
      hand('SELECT …', 1450, 420, { size: 46, align: 'center', p: P(t, W('L1', 'gaplashish') + 0.3, 0.8), color: C.green });
    });
    hand('dev-docs · o‘zbekcha', 960, 980, { size: 30, align: 'center', p: P(t, 3, 1), color: C.pencil });
  }

  function sMuammo(t) {
    heading('Nega baza kerak?', t, L('L2').s - 0.6);
    shop(170, 260, P(t, W('L2', 'dokon'), 1.4));
    const notes = [['Mahsulotlar', '#ffe58a', 'mahsulotlar', -0.06], ['Mijozlar', '#bfe3ff', 'mijozlar', 0.05], ['Buyurtmalar', '#c9f2cf', 'buyurtmalar', -0.03]];
    const fly = eio(P(t, W('L4', 'bazasi'), 1.1));
    notes.forEach(([lbl, col, word, rot], i) => {
      const x0 = 620 + i * 300, y0 = 300 + (i % 2) * 40;
      const x = lerp(x0, 1440 - 130, fly), y = lerp(y0, 560, fly);
      withA(1 - P(t, W('L4', 'bazasi') + 0.9, 0.3), () => sticky(x, y, 260, 120, lbl, col, P(t, W('L2', word), 0.5), rot * (1 - fly)));
    });
    // chalkash daftar
    const mk = P(t, L('L3').s, 0.6) * (1 - P(t, W('L4', 'bazasi'), 0.5));
    withA(mk, () => {
      card(640, 520, 560, 330, { seed: 170 });
      const scribbles = ['Daftar — 8000? 7000?', 'Ali: 3 ta … yoki 2?', 'Kitob — ??', 'Malika — qarz?'];
      scribbles.forEach((s, i) => { hand(s, 680, 580 + i * 66, { size: 34, p: P(t, L('L3').s + 0.3 + i * 0.6, 0.8), color: i % 2 ? C.soft : C.ink }); });
      sline(680, 581, 980, 576, { col: C.red, w: 3, seed: 171, p: P(t, W('L3', 'chalkashib'), 0.5) });
      sline(680, 713, 900, 708, { col: C.red, w: 3, seed: 172, p: P(t, W('L3', 'chalkashib') + 0.3, 0.5) });
      [['qancha', 1240, 560], ['kim', 1290, 700], ['javob', 1225, 820]].forEach(([w, x, y], i) => withA(P(t, W('L3', w), 0.4), () => hand('?', x, y, { size: 110, color: C.red, p: 1 })));
    });
    // baza va SQL
    dbCylinder(1440, 600, 220, 230, P(t, W('L4', 'bazasi'), 1.4));
    withA(P(t, W('L4', 'es-kyu-el'), 0.6), () => {
      arrow(1060, 420, 1300, 520, { col: C.green, w: 4, bend: -40, seed: 175, p: P(t, W('L4', 'savol'), 0.7) });
      hand('savol', 1120, 400, { size: 38, color: C.green, p: P(t, W('L4', 'savol'), 0.6) });
      arrow(1300, 690, 1060, 780, { col: C.blue, w: 4, bend: -40, seed: 176, p: P(t, W('L4', 'buyruq'), 0.7) });
      hand('buyruq', 1040, 830, { size: 38, color: C.blue, p: P(t, W('L4', 'buyruq'), 0.6) });
      hand('SQL', 1440, 600, { size: 64, align: 'center', color: C.blue, p: P(t, W('L4', 'es-kyu-el'), 0.6) });
    });
  }

  function sJadval(t) {
    heading('Jadval va kalit', t, L('L5').s - 0.4);
    const x = 690, y = 380;
    const rowAt = (i) => W('L7', 'qator') + i * 0.42;
    const idK = P(t, W('L8', 'ay-di'), 0.6);
    table(x, y, 'mahsulotlar', MCOLS, MAHSULOT, {
      p: P(t, W('L5', 'jadvali'), 1.2),
      row: (i) => ({ a: P(t, rowAt(i), 0.4), hl: i === 0 ? P(t, W('L7', 'qator'), 0.5) * (1 - P(t, W('L7', 'daftar'), 0.6)) : 0 }),
      col: (j) => ({
        hl: j === 1 ? P(t, W('L6', 'nomi', 1), 0.5) * (1 - P(t, W('L6', 'narxi'), 0.4)) : j === 2 ? P(t, W('L6', 'narxi'), 0.5) * (1 - P(t, L('L7').s, 0.4)) : j === 0 ? idK : 0,
        hlCol: j === 0 ? 'rgba(240,140,46,0.3)' : C.hl, cellHl: true,
      }),
      visibleRows: 5,
    });
    // tiplar
    const tag = (s, uz, cx, k, col) => withA(k, () => {
      const w = tw(s, 26, 600, MONO) + 30;
      ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(cx - w / 2, y - 104, w, 44, 22); ctx.fill(); ctx.restore();
      text(s, cx, y - 82, { size: 26, weight: 600, fam: MONO, color: '#fff', align: 'center' });
      hand(uz, cx, y - 140, { size: 36, align: 'center', color: col, p: k });
    });
    tag('text', 'matn', colCenter(x, MCOLS, 1), P(t, W('L6', 'matn'), 0.5), C.purple);
    tag('integer', 'son', colCenter(x, MCOLS, 2), P(t, W('L6', 'son'), 0.5), C.teal);
    // birlamchi kalit
    keyIcon(x - 110, rowCenter(y, 2), 1.3, P(t, W('L8', 'birlamchi'), 0.8));
    withA(P(t, W('L8', 'birlamchi'), 0.6), () => { hand('PRIMARY KEY', x - 70, y + HH + 5 * RH + 70, { size: 40, color: C.orange, p: P(t, W('L8', 'birlamchi'), 0.9) }); });
    withA(P(t, W('L8', 'takrorlanmaydi'), 0.5), () => hand('1, 2, 3 … takrorlanmaydi', x + 300, y + HH + 5 * RH + 70, { size: 36, color: C.soft, p: P(t, W('L8', 'takrorlanmaydi'), 0.9) }));
  }

  function sAloqa(t) {
    heading('Jadvallar aloqasi', t, L('L9').s - 0.4);
    const mx = 150, my = 300, bx = 1080, by = 300;
    const MC = [{ label: 'id', w: 90 }, { label: 'ism', w: 180 }, { label: 'shahar', w: 230 }];
    const BC = [{ label: 'id', w: 90 }, { label: 'mijoz_id', w: 170 }, { label: 'mahsulot_id', w: 210 }, { label: 'soni', w: 110, align: 'right' }];
    const errT = W('L11', 'mavjud');
    const rows = BUYURTMA.concat(t >= errT ? [[7, 9, 1, 1]] : []);
    const fkK = P(t, W('L10', 'ishora'), 0.6);
    table(bx, by, 'buyurtmalar', BC, rows, {
      p: P(t, W('L9', 'buyurtmalar'), 1.2), visibleRows: rows.length,
      col: (j) => ({ hl: j === 1 ? P(t, W('L9', 'raqami'), 0.5) : 0, hlCol: 'rgba(80,150,255,0.18)', cellHl: false }),
      row: (i) => (i === 6 ? { a: P(t, errT, 0.5), hl: P(t, errT + 0.3, 0.5), hlCol: C.hlRed, cellCol: { 1: C.red } } : { cellCol: { 1: fkK > 0.5 ? ID_COL[BUYURTMA[i][1]] : null } }),
    });
    table(mx, my, 'mijozlar', MC, MIJOZ, {
      p: P(t, W('L10', 'mijozlar'), 1.1),
      row: (i) => ({ cellCol: { 0: fkK > 0.5 ? ID_COL[MIJOZ[i][0]] : null } }),
    });
    // tashqi kalit strelkalari: buyurtma.mijoz_id -> mijozlar qatori
    BUYURTMA.forEach((r, i) => {
      const k = P(t, W('L10', 'ishora') + i * 0.18, 0.6) * (1 - 0.6 * P(t, errT, 0.4));
      arrow(bx - 12, rowCenter(by, i), mx + 500 + 14, rowCenter(my, r[1] - 1), { p: k, col: ID_COL[r[1]], w: 2.6, bend: (i % 2 ? 1 : -1) * 30, seed: 200 + i, head: 14 });
    });
    withA(P(t, W('L10', 'tashqi'), 0.5), () => hand('FOREIGN KEY · tashqi kalit', mx, my + HH + 4 * RH + 70, { size: 40, color: C.blue, p: P(t, W('L10', 'tashqi'), 1) }));
    // yo'q mijoz -> xato
    if (t >= errT) {
      const ry = rowCenter(by, 6);
      arrow(bx - 12, ry, mx + 640, my + HH + 4 * RH + 150, { p: P(t, errT + 0.6, 0.7), col: C.red, w: 3, bend: 30, seed: 210 });
      hand('?', mx + 600, my + HH + 4 * RH + 150, { size: 70, color: C.red, p: P(t, errT + 1.2, 0.4) });
      withA(P(t, W('L11', 'xato'), 0.4), () => {
        withA(1 - P(t, W('L11', 'xato'), 0.01) * 0, () => {});
        ctx.save(); ctx.globalAlpha *= 1; ctx.restore();
      });
      const ek = P(t, W('L11', 'xato'), 0.5);
      withA(ek * (1 - P(t, W('L10', 'tashqi') + 999, 1)), () => {
        ctx.save(); ctx.fillStyle = 'rgba(251,247,238,0.85)'; ctx.fillRect(140, 820, 1660, 160); ctx.restore();
        outCard(150, 832, 1620, ['ERROR:  insert or update on table "buyurtmalar" violates foreign key', '        constraint "buyurtmalar_mijoz_id_fkey"', 'DETAIL:  Key (mijoz_id)=(9) is not present in table "mijozlar".'], { err: true, size: 24 });
      });
    }
  }

  function sSelect(t) {
    heading('SELECT: savol berish', t, L('L12').s - 0.4);
    // savol pufakchasi
    withA(P(t, L('L12').s, 0.5) * (1 - P(t, L('L13').s, 0.5)), () => {
      card(360, 380, 1200, 220, { seed: 230 });
      hand('Narxi 10 000 dan arzon mahsulotlar,', 960, 450, { size: 48, align: 'center', p: P(t, W('L12', 'narxi'), 1.5) });
      hand('eng arzonidan boshlab?', 960, 530, { size: 48, align: 'center', p: P(t, W('L12', 'eng'), 1.0), color: C.blue });
    });
    const t13 = L('L13').s;
    const q = ['SELECT nomi, narxi', 'FROM mahsulotlar', 'WHERE narxi < 10000', 'ORDER BY narxi;'];
    const tFrom = W('L14', 'from'), tWhere = W('L15', 'ver'), tSel = W('L16', 'selekt'), tOrd = W('L17', 'order');
    const step = (a, b) => P(t, a, 0.4) * (1 - P(t, b, 0.3));
    const tEnd = L('L17').e + 5;
    const orderK = P(t, W('L13', 'tartibida'), 0.5);
    codeCard(170, 340, 640, q, {
      a: P(t, t13, 0.5), typed: P(t, t13 + 0.2, 2.2), size: 34,
      hl: [step(tSel, tOrd), step(tFrom, tWhere), step(tWhere, tSel), step(tOrd, tEnd)],
      badges: [[3, orderK], [1, orderK], [2, orderK], [4, orderK]],
    });
    withA(orderK, () => hand('← bajarilish tartibi', 170, 720, { size: 38, color: C.orange, p: P(t, W('L13', 'tartibida'), 0.9) }));
    // ma'lumot oqimi
    const x = 1000, y = 360;
    const keep = [0, 1, 3];                              // narxi < 10000: Daftar, Qalam, Ruchka
    const sorted = [1, 3, 0];                            // ORDER BY narxi: Qalam, Ruchka, Daftar
    const collapse = tWhere + 1.6, sortAt = tOrd + 0.6;
    table(x, y, 'mahsulotlar', MCOLS, MAHSULOT, {
      p: P(t, tFrom + 0.2, 1.0),
      width: kf(t, [[0, 530], [tSel + 0.4, 430]], 0.8),
      visibleRows: Math.round(kf(t, [[0, 5], [collapse, 3]], 0.01)),
      col: (j) => (j === 0 ? { a: 1 - P(t, tSel + 0.2, 0.6) } : { dx: -100 * eio(P(t, tSel + 0.4, 0.8)) }),
      row: (i) => {
        const out = !keep.includes(i);
        const slot = kf(t, [[0, i], [collapse, out ? i : keep.indexOf(i)], [sortAt, out ? i : sorted.indexOf(i)]], 0.9);
        return {
          slot,
          a: out ? 1 - P(t, collapse - 0.3, 0.4) : 1,
          strike: out ? P(t, tWhere + 0.5, 0.6) : 0,
          hl: out ? 0 : P(t, tWhere + 0.5, 0.4) * (1 - P(t, collapse + 0.4, 0.5)),
          hlCol: C.hlGreen,
        };
      },
    });
    withA(P(t, W('L17', 'natija'), 0.5), () => {
      hand('(3 rows) ✓', x + 20, y + HH + 3 * RH + 60, { size: 40, color: C.green, p: P(t, W('L17', 'natija'), 0.8) });
    });
  }

  function sJoin(t) {
    heading('JOIN: jadvallarni bog‘lash', t, L('L18').s - 0.4);
    const BC = [{ label: 'id', w: 80 }, { label: 'mahsulot_id', w: 210 }, { label: 'soni', w: 100, align: 'right' }];
    const PC = [{ label: 'id', w: 80 }, { label: 'nomi', w: 210 }];
    const bx = 110, by = 290, px = 1500, py = 290;
    const tBog = W('L19', 'boglaydi'), tJuft = W('L19', 'juftlab'), tRes = W('L19', 'birlashtiradi');
    const dim = 1 - 0.65 * P(t, tRes, 0.6);
    table(bx, by, 'buyurtmalar', BC, BUYURTMA.map((r) => [r[0], r[2], r[3]]), {
      p: P(t, L('L18').s + 0.3, 1.1), a: dim,
      col: (j) => ({ hl: j === 1 ? P(t, W('L18', 'raqami'), 0.5) : 0, hlCol: C.hlBlue, cellHl: false }),
    });
    table(px, py, 'mahsulotlar', PC, MAHSULOT.map((r) => [r[0], r[1]]), {
      p: P(t, W('L18', 'nomi'), 1.0), a: dim,
      col: (j) => ({ hl: j === 0 ? P(t, W('L18', 'nomi'), 0.5) : 0, hlCol: C.hlBlue, cellHl: false }),
    });
    BUYURTMA.forEach((r, i) => {
      const k = P(t, tBog + i * 0.2, 0.6) * (1 - P(t, tRes + 0.3, 0.5));
      arrow(bx + 290 + 10, rowCenter(by, i), px - 10, rowCenter(py, r[2] - 1), { p: k, col: C.blue, w: 2.4, bend: (i - 2.5) * 6, seed: 260 + i, head: 14 });
    });
    // natija: id, nomi, soni (natijalar.txt: join)
    const RC = [{ label: 'id', w: 80 }, { label: 'nomi', w: 210 }, { label: 'soni', w: 100, align: 'right' }];
    const res = BUYURTMA.map((r) => [r[0], MAHSULOT[r[2] - 1][1], r[3]]);
    const rx = 765, ry = 290;
    table(rx, ry, 'natija', RC, res, {
      p: P(t, tJuft, 0.8),
      row: (i) => ({ a: P(t, tJuft + 0.3 + i * 0.22, 0.4), dy: (1 - eo(P(t, tJuft + 0.3 + i * 0.22, 0.5))) * 30, hl: P(t, tJuft + 0.3 + i * 0.22, 0.3) * (1 - P(t, tJuft + 1.4 + i * 0.22, 0.6)), hlCol: C.hlGreen }),
    });
    withA(P(t, L('L20').s, 0.6), () => codeCard(300, 760, 1320, ['SELECT b.id, p.nomi, b.soni FROM buyurtmalar b', 'JOIN mahsulotlar p ON p.id = b.mahsulot_id ORDER BY b.id;'], { size: 28, typed: P(t, L('L20').s, 1.6) }));
  }

  function sGroup(t) {
    heading('GROUP BY: guruhlash', t, L('L21').s - 0.4);
    const MC = [{ label: 'ism', w: 170 }, { label: 'shahar', w: 230 }];
    const mx = 120, my = 330;
    const tG = W('L22', 'grup'), tK = W('L22', 'kaunt');
    table(mx, my, 'mijozlar', MC, MIJOZ.map((r) => [r[1], r[2]]), { p: P(t, L('L21').s + 0.3, 1.1), a: 1 - 0.5 * P(t, tG + 2.5, 0.6) });
    const cities = ['Buxoro', 'Samarqand', 'Toshkent'], cityCol = [C.green, C.purple, C.blue];
    cities.forEach((c, i) => {
      const x = 760 + i * 360, y = 300, k = P(t, tG + i * 0.25, 0.8);
      srect(x, y, 300, 300, { p: k, col: cityCol[i], w: 3.2, seed: 300 + i });
      hand(c, x + 150, y - 34, { size: 40, align: 'center', color: cityCol[i], p: k });
    });
    const counts = { Buxoro: 0, Samarqand: 0, Toshkent: 0 };
    MIJOZ.forEach((r, i) => {
      const ci = cities.indexOf(r[2]), slot = counts[r[2]]++;
      const t0 = tG + 0.9 + i * 0.35, k = eio(P(t, t0, 0.9));
      const x0 = mx + 20, y0 = rowCenter(my, i), x1 = 760 + ci * 360 + 40, y1 = 360 + slot * 76;
      if (k <= 0) return;
      const x = lerp(x0, x1, k), y = lerp(y0, y1, k) - Math.sin(Math.PI * k) * 60;
      withA(1, () => { ctx.save(); ctx.fillStyle = 'rgba(255,253,248,0.95)'; ctx.beginPath(); ctx.roundRect(x - 10, y - 26, 230, 52, 10); ctx.fill(); ctx.restore(); srect(x - 10, y - 26, 230, 52, { col: cityCol[ci], w: 2, seed: 320 + i, j: 1 }); text(r[1], x + 10, y + 1, { size: 30, weight: 600 }); });
    });
    // count
    cities.forEach((c, i) => {
      const n = MIJOZ.filter((r) => r[2] === c).length, k = P(t, tK + i * 0.3, 0.5);
      withA(k, () => {
        const x = 760 + i * 360 + 250, y = 560;
        ctx.save(); ctx.translate(x, y); ctx.scale(eback(k), eback(k)); ctx.fillStyle = cityCol[i]; ctx.beginPath(); ctx.arc(0, 0, 38, 0, 7); ctx.fill(); ctx.restore();
        text(String(n), x, y + 2, { size: 40, weight: 800, color: '#fff', align: 'center' });
      });
    });
    const t23 = L('L23').s;
    withA(P(t, t23, 0.6), () => {
      codeCard(760, 690, 1040, ['SELECT shahar, count(*) FROM mijozlar', 'GROUP BY shahar ORDER BY shahar;'], { size: 28, typed: P(t, t23, 1.4) });
    });
    withA(P(t, t23 + 1.6, 0.6), () => table(120, 700, null, [{ label: 'shahar', w: 230 }, { label: 'count', w: 130, align: 'right' }], [['Buxoro', 1], ['Samarqand', 1], ['Toshkent', 2]], { p: P(t, t23 + 1.6, 1.0) }));
  }

  function sDml(t) {
    heading('INSERT, UPDATE, DELETE', t, L('L24').s - 0.4);
    const x = 160, y = 380;
    const tI = W('L25', 'insert'), tU = W('L26', 'apdeyt'), tD = W('L27', 'dilit'), tH = W('L28', 'hamma');
    const rows = MAHSULOT.map((r) => [...r]).concat([[6, 'Chizg‘ich', 4000]]);
    const delK = P(t, tD + 1.0, 0.8);
    table(x, y, 'mahsulotlar', MCOLS, rows, {
      p: P(t, L('L24').s + 0.2, 1.1), visibleRows: t >= tI + 0.3 && delK < 1 ? 6 : 5,
      row: (i) => {
        const flash = P(t, tH, 0.3) * (1 - P(t, tH + 1.3, 0.5));
        if (i === 5) return { a: P(t, tI + 0.3, 0.6) * (1 - delK), hl: P(t, tI + 0.5, 0.5) * (1 - P(t, tU, 0.5)), hlCol: C.hlGreen, strike: P(t, tD + 0.3, 0.6) };
        return { hl: Math.max(i === 0 ? P(t, tU + 0.4, 0.4) * (1 - P(t, tD, 0.5)) : 0, flash), hlCol: flash > 0 ? C.hlRed : C.hl };
      },
    });
    // Daftar narxi: 8000 -> 7000
    const uK = P(t, tU + 0.8, 0.6);
    if (uK > 0) {
      const cx = x + 330 + 182, cy = rowCenter(y, 0);
      ctx.save(); ctx.fillStyle = 'rgba(255,253,248,1)'; ctx.fillRect(x + 336, cy - 24, 188, 48); ctx.restore();
      withA(1 - uK, () => text('8000', cx, cy + 1, { size: 29, fam: MONO, align: 'right' }));
      withA(uK, () => text('7000', cx, cy + 1, { size: 29, fam: MONO, align: 'right', color: C.green, weight: 700 }));
    }
    // buyruq va javob
    const cmds = [
      [tI, ['INSERT INTO mahsulotlar', "VALUES (6, 'Chizg‘ich', 4000);"], 'INSERT 0 1'],
      [tU, ['UPDATE mahsulotlar SET narxi = 7000', "WHERE nomi = 'Daftar';"], 'UPDATE 1'],
      [tD, ['DELETE FROM mahsulotlar', 'WHERE id = 6;'], 'DELETE 1'],
    ];
    cmds.forEach(([at, lines, outp], i) => {
      const next = i < 2 ? cmds[i + 1][0] : W('L28', 'ver');
      const a = P(t, at, 0.4) * (1 - P(t, next - 0.2, 0.3));
      if (a <= 0) return;
      const h = codeCard(840, 400, 960, lines, { a, typed: P(t, at, 0.9), size: 32 });
      withA(a * P(t, at + 1.0, 0.3), () => outCard(840, 420 + h, 360, [outp], { size: 30 }));
    });
    // ogohlantirish
    withA(P(t, W('L28', 'ver'), 0.5), () => {
      sticky(900, 470, 820, 230, '', '#ffd9cf', P(t, W('L28', 'ver'), 0.5), -0.02);
      hand('WHERE yo‘q bo‘lsa —', 1310, 540, { size: 48, align: 'center', color: C.red, p: P(t, W('L28', 'ver') + 0.3, 0.9) });
      hand('hamma qatorlar o‘zgaradi!', 1310, 620, { size: 48, align: 'center', color: C.red, p: P(t, tH - 0.2, 0.9) });
    });
  }

  function sIndeks(t) {
    heading('Indeks: tez qidirish', t, L('L29').s - 0.4);
    const t29 = L('L29').s, tScan = W('L29', 'qatorma-qator'), t30 = L('L30').s;
    // uzun jadval (chap)
    const sx = 140, sy = 230, sw = 560, sh = 640;
    const ak = 1 - 0.55 * P(t, t30, 0.6);
    withA(ak, () => {
      card(sx, sy, sw, sh, { seed: 400, p: P(t, t29, 0.8) });
      ctx.save(); ctx.beginPath(); ctx.rect(sx + 6, sy + 6, sw - 12, sh - 12); ctx.clip();
      const scroll = Math.max(0, t - tScan) * 90;
      for (let i = 0; i < 40; i++) {
        const yy = sy + 30 + i * 34 - (scroll % 34) ;
        sline(sx + 30, yy, sx + 30 + 120 + rnd(i + Math.floor(scroll / 34)) * 300, yy, { col: 'rgba(43,45,66,0.35)', w: 3, seed: 410 + i, single: true, p: P(t, t29 + i * 0.02, 0.3) });
      }
      ctx.restore();
      hand('1 000 000 qator', sx + sw / 2, sy + sh + 50, { size: 40, align: 'center', color: C.soft, p: P(t, W('L29', 'millionlab'), 0.8) });
      const sk = P(t, W('L29', 'indekssiz'), 0.4);
      if (sk > 0) {
        const my = sy + 60 + ((Math.max(0, t - W('L29', 'indekssiz')) * 140) % (sh - 120));
        withA(sk, () => { marker(sx + 14, my - 18, sw - 28, 36, C.hlRed, 1); sellipse(sx + sw - 70, my, 34, 34, { col: C.red, w: 4, seed: 430 }); sline(sx + sw - 46, my + 24, sx + sw - 14, my + 56, { col: C.red, w: 6, seed: 431 }); });
        hand('qatorma-qator…', sx + sw + 30, sy + 120, { size: 40, color: C.red, p: P(t, tScan, 0.8) });
      }
    });
    // kitob va ko'rsatkich (o'ng)
    const bx = 1060, by = 300;
    bookIcon(bx, by, P(t, W('L30', 'kitob'), 1.2));
    withA(P(t, W('L30', 'alifbo'), 0.5), () => {
      card(bx + 400, by - 40, 380, 330, { seed: 450 });
      hand('Ko‘rsatkich', bx + 590, by + 10, { size: 36, align: 'center', color: C.purple });
      [['Daftar', '12'], ['Kitob', '37'], ['Qalam', '54'], ['Sumka', '81']].forEach(([w, pg], i) => {
        const yy = by + 80 + i * 56;
        text(w, bx + 430, yy, { size: 30, weight: 600 }); text('…… ' + pg + '-bet', bx + 750, yy, { size: 28, fam: MONO, align: 'right', color: C.soft });
        if (i === 1) marker(bx + 420, yy - 22, 340, 44, C.hl, P(t, W('L30', 'kerakli'), 0.5));
      });
    });
    arrow(bx + 430, by + 170, bx + 270, by + 120, { col: C.orange, w: 4, bend: 60, seed: 460, p: P(t, W('L30', 'darhol'), 0.6) });
    withA(P(t, W('L30', 'darhol'), 0.5), () => hand('37-bet', bx + 270, by + 300, { size: 40, align: 'center', color: C.orange }));
    // CREATE INDEX + daraxt
    const t31 = L('L31').s;
    withA(P(t, t31, 0.5), () => {
      const h = codeCard(820, 700, 760, ['CREATE INDEX ON mahsulotlar (nomi);'], { size: 30, typed: P(t, t31, 1.0) });
      withA(P(t, t31 + 1.2, 0.3), () => outCard(1600, 706, 240, ['CREATE INDEX'], { size: 26 }));
    });
  }

  function sTx(t) {
    heading('Tranzaksiya: hammasi yoki hech biri', t, L('L32').s - 0.4);
    const tAli = W('L32', 'ali'), tXato = W('L33', 'xato'), tTx = L('L34').s, tRb = W('L35', 'roulbek'), tCm = W('L35', 'kommit');
    // balans holati (natijalar.txt: tx-rollback / tx-commit)
    const aliBal = t >= tCm + 0.6 ? 50000 : t >= tRb + 0.6 ? 100000 : t >= tXato + 0.6 ? 50000 : 100000;
    const malBal = t >= tCm + 0.9 ? 70000 : 20000;
    const acct = (x, name, bal, col, k, warn) => {
      if (k <= 0) return;
      card(x, 240, 420, 200, { a: k, seed: 500 + x });
      withA(k, () => {
        hand(name, x + 30, 300, { size: 44, color: col });
        text(bal.toLocaleString('ru-RU').replace(/ /g, ' ') + ' so‘m', x + 30, 385, { size: 46, weight: 700, fam: MONO, color: warn ? C.red : C.ink });
      });
    };
    acct(300, 'Ali', aliBal, C.blue, P(t, tAli, 0.6), false);
    acct(1200, 'Malika', malBal, C.purple, P(t, W('L32', 'malikaga'), 0.6), t >= tXato + 0.6 && t < tTx);
    // o'tkazma
    const lost = t >= tXato + 0.4 && t < tTx;
    arrow(740, 340, 1180, 340, { col: lost ? C.red : C.green, w: 4, seed: 520, p: P(t, W('L32', 'ellik'), 0.8) });
    withA(P(t, W('L32', 'ellik'), 0.5), () => hand('50 000', 960, 300, { size: 40, align: 'center', color: lost ? C.red : C.green }));
    if (lost) {
      const k = P(t, tXato, 0.4);
      sketchPath([[970, 270], [935, 345], [985, 345], [950, 420]], { col: C.orange, w: 7, seed: 521, p: k });
      hand('yo‘qoldi?!', 960, 470, { size: 44, align: 'center', color: C.red, p: P(t, W('L33', 'yetib'), 0.8) });
    }
    // qadamlar
    const s1 = P(t, W('L32', 'ayirish'), 0.8), s2 = P(t, W('L32', 'qoshish'), 0.8);
    hand('1. Ali: − 50 000', 640, 600, { size: 42, p: s1 });
    hand('2. Malika: + 50 000', 640, 680, { size: 42, p: s2 });
    if (t >= tXato + 0.2 && t < tTx) check(600, 600, P(t, tXato + 0.2, 0.3)), cross(600, 680, P(t, tXato + 0.6, 0.4), 0.6);
    // tranzaksiya qutisi
    const bk = P(t, tTx, 1.0);
    srect(560, 545, 820, 190, { col: C.teal, w: 3.4, seed: 530, p: bk });
    withA(bk, () => { hand('BEGIN', 580, 525, { size: 34, color: C.teal, p: bk }); hand('COMMIT / ROLLBACK', 1360, 760, { size: 34, color: C.teal, align: 'right', p: P(t, tTx + 0.6, 0.8) }); });
    withA(P(t, W('L34', 'hammasi'), 0.4), () => hand('hammasi ✓', 1440, 610, { size: 40, color: C.green }));
    withA(P(t, W('L34', 'hech'), 0.4), () => hand('yo hech biri ✗', 1440, 680, { size: 40, color: C.red }));
    // ROLLBACK / COMMIT natijasi
    withA(P(t, tRb, 0.4) * (1 - P(t, tCm, 0.3)), () => outCard(560, 800, 820, ['ROLLBACK  →  Ali 100 000 · Malika 20 000'], { size: 28, err: true }));
    withA(P(t, tCm, 0.4), () => outCard(560, 800, 820, ['COMMIT  →  Ali 50 000 · Malika 70 000'], { size: 28 }));
  }

  function sTizimlar(t) {
    heading('PostgreSQL, MySQL, SQLite', t, L('L36').s - 0.4);
    const names = [['PostgreSQL', C.blue], ['MySQL', C.orange], ['SQLite', C.teal]];
    const t36 = L('L36').s, t37 = L('L37').s;
    withA(P(t, t36, 0.5), () => codeCard(560, 190, 800, ['SELECT nomi, narxi FROM mahsulotlar;'], { size: 30, typed: P(t, t36 + 0.2, 1.0) }));
    names.forEach(([n, col], i) => {
      const x = 170 + i * 560, y = 420, k = P(t, W('L36', i === 0 ? 'postgres' : i === 1 ? 'may' : 'es-kyu-layt'), 0.6);
      card(x, y, 460, 420, { a: k, seed: 600 + i });
      withA(k, () => hand(n, x + 230, y + 50, { size: 46, align: 'center', color: col }));
      arrow(960, 300, x + 230, y - 10, { col, w: 3, seed: 610 + i, bend: (i - 1) * -40, p: P(t, W('L36', 'deyarli'), 0.6) });
      check(x + 400, y + 50, P(t, W('L36', 'tushunadi') + i * 0.2, 0.4));
      if (i < 2) {
        serverBox(x + 230, y + 220, P(t, W('L37', 'server'), 0.8), col);
        laptop(x + 90, y + 360, 0.7, P(t, W('L37', 'server') + 0.4, 0.6)); laptop(x + 370, y + 360, 0.7, P(t, W('L37', 'server') + 0.5, 0.6));
        sline(x + 170, y + 270, x + 100, y + 320, { p: P(t, W('L37', 'server') + 0.7, 0.4), w: 2, col: C.pencil, seed: 620 + i });
        sline(x + 290, y + 270, x + 360, y + 320, { p: P(t, W('L37', 'server') + 0.7, 0.4), w: 2, col: C.pencil, seed: 630 + i });
        withA(P(t, W('L37', 'server'), 0.5), () => hand('server', x + 230, y + 105, { size: 30, align: 'center', color: C.soft }));
      } else {
        srect(x + 90, y + 110, 280, 270, { col: C.pencil, w: 2.4, seed: 640, p: P(t, W('L37', 'dastur'), 0.8) });
        withA(P(t, W('L37', 'dastur'), 0.5), () => hand('dastur', x + 230, y + 140, { size: 28, align: 'center', color: C.soft }));
        fileIcon(x + 180, y + 170, 'dokon.db', P(t, W('L37', 'fayl'), 0.9));
      }
    });
    withA(P(t, W('L38', 'farqlari'), 0.5), () => {
      hand('≈', 680, 630, { size: 90, align: 'center', color: C.soft }); hand('≈', 1240, 630, { size: 90, align: 'center', color: C.soft });
      hand('farqlar — qo‘llanmada yonma-yon', 960, 920, { size: 40, align: 'center', color: C.purple, p: P(t, W('L38', 'qollanmada'), 1) });
    });
  }

  function sXulosa(t) {
    const t39 = L('L39').s, t40 = L('L40').s;
    const out = 1 - P(t, t40 - 0.2, 0.6);
    withA(out, () => {
      hand('Xulosa', 960, 110, { size: 60, align: 'center', p: P(t, t39 - 0.3, 0.8) });
      const cx = 960, cy = 520;
      sellipse(cx, cy, 120, 80, { col: C.blue, w: 4, seed: 700, p: P(t, t39, 0.8) });
      hand('SQL', cx, cy, { size: 64, align: 'center', color: C.blue, p: P(t, t39, 0.8) });
      const nodes = [
        ['Jadval', 'jadvallarda', -2.6, C.purple], ['Kalit', 'kalitlar', -1.9, C.orange], ['SELECT', 'selekt', -0.9, C.blue], ['JOIN', 'selekt', -0.25, C.blue],
        ['GROUP BY', 'selekt', 0.4, C.green], ['INSERT · UPDATE · DELETE', 'tranzaksiya', 1.2, C.red], ['Indeks', 'tranzaksiya', 2.0, C.teal], ['Tranzaksiya', 'tranzaksiya', 2.7, C.teal],
      ];
      nodes.forEach(([lbl, word, ang, col], i) => {
        const k = P(t, W('L39', word) + (i % 3) * 0.25, 0.7);
        const nx = cx + Math.cos(ang) * 560, ny = cy + Math.sin(ang) * 300;
        sline(cx + Math.cos(ang) * 130, cy + Math.sin(ang) * 88, nx - Math.cos(ang) * 40, ny - Math.sin(ang) * 30, { col, w: 3, seed: 710 + i, p: k });
        withA(k, () => hand(lbl, nx, ny, { size: 40, align: 'center', color: col, p: k }));
      });
    });
    const kt = P(t, t40, 1.0);
    hand('Rahmat!', 960, 470, { size: 150, align: 'center', color: C.blue, p: kt });
    marker(760, 540, 400 * eio(P(t, t40 + 0.8, 0.6)), 22, C.hl, 1);
    withA(P(t, t40 + 1.2, 0.6), () => { hand('Batafsil — SQL qo‘llanmasi:', 960, 650, { size: 44, align: 'center', color: C.soft }); text('mfs1011.github.io/dev-docs', 960, 730, { size: 40, weight: 700, fam: MONO, color: C.red, align: 'center' }); });
  }

  const SCENES = { intro: sIntro, muammo: sMuammo, jadval: sJadval, aloqa: sAloqa, select: sSelect, join: sJoin, group: sGroup, dml: sDml, indeks: sIndeks, tx: sTx, tizimlar: sTizimlar, xulosa: sXulosa };
  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    bg();
    for (const [name, fn] of Object.entries(SCENES)) {
      const sc = TM.scenes[name];
      if (t >= sc.s && t < sc.e) {
        const al = Math.min(P(t, sc.s, 0.5), 1 - P(t, sc.e - 0.5, 0.5));
        withA(name === 'intro' ? Math.min(1, 1 - P(t, sc.e - 0.5, 0.5)) : al, () => fn(t));
      }
    }
    const fin = Math.max(1 - P(t, 0, 0.8), P(t, TM.end - 1.4, 1.3));
    if (fin > 0) { ctx.globalAlpha = fin; ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W0, H0); ctx.globalAlpha = 1; }
  }
  window.render = render;
  window.DURATION = TM.end;
  window.renderPoster = () => { render(0.001); ctx.globalAlpha = 1; bg(); const t = 8; hand('SQL', 960, 300, { size: 230, align: 'center', color: C.blue }); marker(760, 400, 400, 26, C.hl, 1); hand('qanday ishlaydi?', 960, 780, { size: 76, align: 'center' }); dbCylinder(470, 330, 180, 200, 1); };
  if (location.hash === '#play') {
    const t0 = performance.now();
    const loop = () => { render(((performance.now() - t0) / 1000) % TM.end); requestAnimationFrame(loop); };
    document.fonts.ready.then(loop);
  } else render(0);
})();
