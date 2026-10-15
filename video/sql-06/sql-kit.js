// SQL videolari uchun umumiy "daftar" komponentlari (sql-umumiy/anim.js dan) + haqiqiy terminal.
// Ishlatish: const K = SQLKIT(ctx); K.table(...), K.term(...). Uslub — video/SQL-VIDEO-USLUBI.md.
(function (g) {
  g.SQLKIT = function (ctx) {
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
    if (s == null || s === '') return;
    const str = String(s);
    const size = o.size || 30, fam = o.fam || UI, weight = o.weight || 500;
    const lh = o.lh || Math.round(size * 1.35);
    ctx.font = font(size, weight, fam);
    ctx.fillStyle = o.color || C.ink;
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.baseline || 'middle';

    const maxW = o.wrap;
    let lines = [];
    if (maxW && maxW > 0) {
      const rawLines = str.split('\n');
      for (const raw of rawLines) {
        if (ctx.measureText(raw).width <= maxW) {
          lines.push(raw);
          continue;
        }
        const words = raw.split(' ');
        let cur = '';
        for (const w of words) {
          const test = cur ? cur + ' ' + w : w;
          if (ctx.measureText(test).width <= maxW) {
            cur = test;
          } else {
            if (cur) lines.push(cur);
            cur = w;
          }
        }
        if (cur) lines.push(cur);
      }
    } else if (str.includes('\n')) {
      lines = str.split('\n');
    } else {
      lines = [str];
    }

    if (typeof window !== 'undefined') {
      window.OVERFLOWS = window.OVERFLOWS || [];
      lines.forEach((line) => {
        const w = ctx.measureText(line).width;
        let left = x, right = x + w;
        if (ctx.textAlign === 'center') { left = x - w / 2; right = x + w / 2; }
        else if (ctx.textAlign === 'right') { left = x - w; right = x; }
        if (left < 10 || right > 1910 || (maxW && w > maxW + 5)) {
          window.OVERFLOWS.push({ text: line, left, right, maxW });
        }
      });
    }

    if (lines.length === 1) {
      ctx.fillText(lines[0], x, y);
    } else {
      const totalH = (lines.length - 1) * lh;
      let startY = y;
      if (ctx.textBaseline === 'middle') {
        startY = y - totalH / 2;
      } else if (ctx.textBaseline === 'bottom') {
        startY = y - totalH;
      }
      lines.forEach((line, idx) => {
        ctx.fillText(line, x, startY + idx * lh);
      });
    }
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


    // ---------- terminal (haqiqiy interaktiv chiqish) ----------
    // Yozuvni bloklarga bo'ladi: [{ cmd: 'qollanma=# SELECT …', out: ['…', …] }]
    function blocks(textAll, promptRe) {
      const res = [];
      textAll.split('\n').forEach((ln) => {
        if (promptRe.test(ln)) res.push({ cmd: ln, out: [] });
        else if (res.length) res[res.length - 1].out.push(ln);
      });
      res.forEach((b) => { while (b.out.length && !b.out[b.out.length - 1].trim()) b.out.pop(); });
      return res;
    }
    // term: o.items = [{ b: blok, t: buyruq yozila boshlagan vaqt yoki progress, typeDur, outDur }], o.t — joriy vaqt
    // o.hl = [{ match: 'Ali', col, from, to }] — chiqishdagi qatorni ajratish
    function term(x, y, w, h, titleOrOpts, maybeItems, maybeOpts) {
      let o;
      if (typeof titleOrOpts === 'string') {
        o = {
          title: titleOrOpts,
          items: maybeItems || [],
          ...(maybeOpts || {})
        };
      } else {
        o = titleOrOpts || {};
      }
      if (o.t == null && typeof window !== 'undefined' && window.CURRENT_T != null) {
        o.t = window.CURRENT_T;
      }
      const size = o.size || o.font || 24, lh = size * 1.42, cw = size * 0.602, maxCh = Math.floor((w - 48) / cw);
      ctx.save();
      ctx.shadowColor = 'rgba(40,30,10,0.28)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#1e1f29'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#2a2c3a'; ctx.beginPath(); ctx.roundRect(x, y, w, 40, [16, 16, 0, 0]); ctx.fill();
      ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 24 + i * 20, y + 20, 6, 0, 7); ctx.fill(); });
      text(o.title || '', x + w / 2, y + 21, { size: 18, weight: 600, fam: MONO, color: '#a9adc1', align: 'center' });
      // ko'rinadigan qatorlar
      const rows = [];
      const wrap = (s) => {
        const r = [];
        String(s).split('\n').forEach((line) => {
          if (!line) { r.push(''); return; }
          for (let i = 0; i < line.length; i += maxCh) r.push(line.slice(i, i + maxCh));
        });
        return r;
      };
      (o.items || []).forEach((it) => {
        const isProgress = (typeof it.t === 'number' && it.t >= 0 && it.t <= 1.0);
        const cmdProgress = isProgress ? clamp(it.t * 2, 0, 1) : (o.t == null || o.t < it.t ? 0 : clamp((o.t - it.t) / (it.typeDur ?? Math.min(2.4, 0.4 + it.b.cmd.length * 0.03)), 0, 1));
        if (cmdProgress <= 0) return;

        const m = o.prompt ? it.b.cmd.match(o.prompt) : null;
        const pr = m ? m[0] : '';
        const cmd = it.b.cmd.slice(pr.length);
        const typed = cmd.slice(0, Math.floor(cmd.length * cmdProgress));
        wrap(pr + typed).forEach((s, i) => rows.push({ s, k: 'cmd', pr: i === 0 ? pr.length : 0, a: 1 }));

        const outProgress = isProgress ? clamp((it.t - 0.5) * 2, 0, 1) : (() => {
          if (o.t == null) return 0;
          const typeDur = it.typeDur ?? Math.min(2.4, 0.4 + it.b.cmd.length * 0.03);
          const t0 = it.t + typeDur + 0.15;
          const outDur = it.outDur ?? Math.min(1.2, 0.08 * (it.b.out ? it.b.out.length : 1) + 0.2);
          return clamp((o.t - t0) / outDur, 0, 1);
        })();

        if (outProgress > 0 && it.b.out) {
          const outLines = Array.isArray(it.b.out) ? it.b.out : String(it.b.out).split('\n');
          const count = Math.ceil(outLines.length * outProgress);
          outLines.slice(0, count).forEach((ln) => {
            wrap(ln).forEach((s) => rows.push({ s, k: /ERROR|Parse error|Warning \|/.test(ln) ? 'err' : 'out', a: clamp(outProgress * 2, 0, 1), src: ln }));
          });
        }
        if (cmdProgress > 0 && cmdProgress < 1) rows.push({ s: '', k: 'cursor', a: 1 });
      });
      const vis = Math.floor((h - 60) / lh);
      const shown = rows.slice(Math.max(0, rows.length - vis));
      ctx.save(); ctx.beginPath(); ctx.rect(x, y + 40, w, h - 40); ctx.clip();
      shown.forEach((r, i) => {
        const ly = y + 56 + lh / 2 + i * lh;
        withA(r.a, () => {
          (o.hl || []).forEach((hl) => {
            if (r.src && r.src.includes(hl.match) && o.t >= hl.from && o.t < (hl.to ?? 1e9)) {
              ctx.fillStyle = hl.col || 'rgba(255,214,10,0.25)'; ctx.fillRect(x + 14, ly - lh / 2, w - 28, lh);
            }
          });
          if (r.k === 'cmd') {
            const pr = r.s.slice(0, r.pr), rest = r.s.slice(r.pr);
            text(pr, x + 24, ly, { size, weight: 700, fam: MONO, color: o.promptCol || '#7ee787', align: 'left' });
            text(rest, x + 24 + pr.length * cw, ly, { size, weight: 500, fam: MONO, color: '#f0f2f8', align: 'left' });
          } else if (r.k === 'cursor') {
            ctx.fillStyle = '#f0f2f8'; ctx.fillRect(x + 24, ly - size / 2, cw, size);
          } else {
            text(r.s, x + 24, ly, { size, weight: 500, fam: MONO, color: r.k === 'err' ? '#ff9b8e' : '#c9cde0', align: 'left' });
          }
        });
      });
      // so'nggi buyruq yozilayotganda kursor
      const last = rows[rows.length - 1];
      if (last && last.k === 'cmd' && Math.floor((o.t || 0) * 2.5) % 2 === 0) {
        const ly = y + 56 + lh / 2 + (shown.length - 1) * lh;
        ctx.fillStyle = '#f0f2f8'; ctx.fillRect(x + 24 + last.s.length * cw + 2, ly - size / 2, cw * 0.9, size);
      }
      ctx.restore();
    }

    return { W0, H0, C, HAND, UI, MONO, clamp, P, lerp, eo, eio, eback, rnd, font, withA, tw, text, hand, sketchPath, linePts, sline, srect, sellipse, arrow, marker, card, heading, codeCard, outCard, table, RH, HH, colCenter, rowCenter, kf, dbCylinder, keyIcon, sticky, shop, bookIcon, laptop, serverBox, fileIcon, check, cross, bg, blocks, term };
  };
})(window);
