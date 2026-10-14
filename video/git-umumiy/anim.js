(function () {
  const TL = window.TL, S = TL.S;
  const cv = document.getElementById('c'), ctx = cv.getContext('2d');
  const W = 1920, H = 1080;
  const C = {
    text: '#eef1fb', mute: '#8f99bf', blue: '#4f8cff', purple: '#b46cff', green: '#34d399', orange: '#ffb547',
    red: '#ff6b7a', git: '#f05133', yellow: '#ffd166', pink: '#ff7ab6', dark: '#0b1020',
  };
  const UI = '"Avenir Next", "Helvetica Neue", Arial, sans-serif';
  const MONO = 'Menlo, Monaco, monospace';

  // ---------- yordamchilar ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const P = (u, a, d) => clamp((u - a) / d);
  const lerp = (a, b, k) => a + (b - a) * k;
  const eo = (k) => 1 - Math.pow(1 - k, 3);
  const eio = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const eback = (k) => { const c1 = 1.9, c3 = c1 + 1; return k <= 0 ? 0 : 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const rnd = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const hex = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rgba = (c, a) => { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; };
  const light = (c, k) => { const v = hex(c).map((x) => Math.round(x + (255 - x) * k)); return `rgb(${v.join(',')})`; };
  const font = (s, w = 500, f = UI) => `${w} ${s}px ${f}`;
  // kalit kadrlar: [[t, qiymat], ...] — har o'tish t dan boshlanib dur davom etadi
  function kf(u, frames, dur = 0.8) {
    let v = frames[0][1];
    for (let i = 1; i < frames.length; i++) {
      const [t, nv] = frames[i];
      if (u < t) break;
      const k = eio(P(u, t, dur));
      v = Array.isArray(v) ? v.map((x, j) => lerp(x, nv[j], k)) : lerp(v, nv, k);
    }
    return v;
  }
  function withA(a, fn) { if (a <= 0.002) return; ctx.save(); ctx.globalAlpha *= Math.min(1, a); fn(); ctx.restore(); }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function text(s, x, y, o = {}) {
    ctx.font = font(o.size || 32, o.weight || 500, o.fam || UI);
    ctx.fillStyle = o.color || C.text; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }
  function tw(s, size, weight = 500, fam = UI) { ctx.font = font(size, weight, fam); return ctx.measureText(s).width; }
  function glow(x, y, r, col) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }

  // ---------- fon ----------
  const PARTS = Array.from({ length: 90 }, (_, i) => ({
    x: rnd(i) * W, y: rnd(i + 99) * H, s: 0.6 + rnd(i + 7) * 2.2, v: 5 + rnd(i + 3) * 16, a: 0.08 + rnd(i + 5) * 0.25, ph: rnd(i + 11) * 6.28,
  }));
  function bg(t) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#080d1c'); g.addColorStop(1, '#121a38');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    glow(W * 0.2 + Math.sin(t * 0.13) * 140, H * 0.25 + Math.cos(t * 0.11) * 90, 760, 'rgba(79,140,255,0.15)');
    glow(W * 0.82 + Math.cos(t * 0.09) * 150, H * 0.78 + Math.sin(t * 0.12) * 100, 800, 'rgba(180,108,255,0.12)');
    glow(W * 0.6 + Math.sin(t * 0.07) * 200, H * 0.05, 520, 'rgba(240,81,51,0.06)');
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (let x = 30; x < W; x += 60) for (let y = 30; y < H; y += 60) ctx.fillRect(x - 1, y - 1, 2, 2);
    PARTS.forEach((p) => {
      const y = (((p.y - t * p.v) % H) + H) % H, x = p.x + Math.sin(t * 0.5 + p.ph) * 20;
      ctx.fillStyle = `rgba(165,195,255,${p.a * (0.6 + 0.4 * Math.sin(t * 1.3 + p.ph))})`;
      ctx.beginPath(); ctx.arc(x, y, p.s, 0, 7); ctx.fill();
    });
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.98);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  // ---------- komponentlar ----------
  function node(x, y, r, col, o = {}) {
    const s = o.s == null ? 1 : o.s;
    if (s <= 0.001) return;
    withA(o.a == null ? 1 : o.a, () => {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.shadowColor = col; ctx.shadowBlur = 34 * (o.glow == null ? 1 : o.glow);
      const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
      g.addColorStop(0, light(col, 0.45)); g.addColorStop(1, col);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
      ctx.shadowBlur = 0; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.stroke();
      if (o.label) text(o.label, 0, 1, { size: o.lsize || r * 0.48, weight: 700, fam: MONO, color: C.dark });
      ctx.restore();
    });
  }
  function ring(x, y, r, col, a, w = 4) {
    withA(a, () => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); });
  }
  function burst(x, y, k, col, r0 = 30) { // pop paytidagi to'lqin
    if (k <= 0 || k >= 1) return;
    ring(x, y, r0 + eo(k) * 60, col, (1 - k) * 0.8, 3);
  }
  function curvePts(x1, y1, x2, y2, bend) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    const cx = mx - (dy / L) * bend, cy = my + (dx / L) * bend, pts = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      pts.push([(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2]);
    }
    return pts;
  }
  function link(x1, y1, x2, y2, o = {}) {
    const p = o.p == null ? 1 : o.p;
    if (p <= 0) return;
    const r1 = o.r1 || 0, r2 = (o.r2 || 0) + (o.head === false ? 0 : 6), w = o.w || 4, col = o.col || 'rgba(200,215,255,0.6)';
    let pts = curvePts(x1, y1, x2, y2, o.bend || 0).filter((q) => Math.hypot(q[0] - x1, q[1] - y1) >= r1 && Math.hypot(q[0] - x2, q[1] - y2) >= r2);
    if (pts.length < 2) return;
    pts = pts.slice(0, Math.max(2, Math.round(pts.length * p)));
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    if (o.glowCol) { ctx.shadowColor = o.glowCol; ctx.shadowBlur = 16; }
    if (o.dash) ctx.setLineDash(o.dash);
    ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke();
    ctx.setLineDash([]);
    if (o.head !== false && p > 0.95) {
      const a = pts[pts.length - 1], b = pts[Math.max(0, pts.length - 4)], ang = Math.atan2(a[1] - b[1], a[0] - b[0]), hs = w * 3.4;
      ctx.beginPath();
      ctx.moveTo(a[0] + Math.cos(ang) * hs * 0.5, a[1] + Math.sin(ang) * hs * 0.5);
      ctx.lineTo(a[0] - Math.cos(ang - 0.55) * hs, a[1] - Math.sin(ang - 0.55) * hs);
      ctx.lineTo(a[0] - Math.cos(ang + 0.55) * hs, a[1] - Math.sin(ang + 0.55) * hs);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function pill(txt, x, y, col, o = {}) {
    const s = o.s == null ? 1 : o.s, size = o.size || 24, mono = o.mono !== false;
    if (s <= 0.001) return;
    withA(o.a == null ? 1 : o.a, () => {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      const w = tw(txt, size, 700, mono ? MONO : UI) + 34, h = size + 20;
      ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.fillStyle = col;
      rr(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.shadowBlur = 0;
      if (o.dir) {
        const ty = o.dir > 0 ? h / 2 - 1 : -h / 2 + 1;
        ctx.beginPath(); ctx.moveTo(-9, ty); ctx.lineTo(9, ty); ctx.lineTo(0, ty + o.dir * 11); ctx.closePath(); ctx.fill();
      }
      text(txt, 0, 1, { size, weight: 700, fam: mono ? MONO : UI, color: o.fg || C.dark });
      ctx.restore();
    });
  }
  function docIcon(x, y, w, h, col) {
    const f = w * 0.32;
    ctx.fillStyle = col; ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + w - f, y); ctx.lineTo(x + w, y + f); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.moveTo(x + w - f, y); ctx.lineTo(x + w - f, y + f); ctx.lineTo(x + w, y + f); ctx.closePath(); ctx.fill();
  }
  const STATUS = { mod: ['o‘zgargan', C.orange], staged: ['staged', C.green] };
  function fileChip(name, cx, cy, o = {}) {
    const s = o.s == null ? 1 : o.s, w = 400, h = 58;
    if (s <= 0.001) return;
    withA(o.a == null ? 1 : o.a, () => {
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
      const st = o.status ? STATUS[o.status] : null, col = st ? st[1] : '#7d88b3';
      ctx.fillStyle = '#19224a'; rr(-w / 2, -h / 2, w, h, 12); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = rgba(st ? st[1] : '#7d88b3', st ? 0.75 : 0.25); ctx.stroke();
      docIcon(-w / 2 + 18, -16, 24, 32, col);
      text(name, -w / 2 + 58, 1, { size: 24, weight: 600, fam: MONO, align: 'left' });
      if (st) {
        withA(o.tagA == null ? 1 : o.tagA, () => {
          const tw2 = tw(st[0], 18, 700) + 22;
          ctx.fillStyle = rgba(st[1], 0.2); rr(w / 2 - tw2 - 12, -15, tw2, 30, 15); ctx.fill();
          text(st[0], w / 2 - 12 - tw2 / 2, 1, { size: 18, weight: 700, color: st[1] });
        });
      }
      ctx.restore();
    });
  }
  function terminal(x, y, w, h, cmds, u) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30;
    ctx.fillStyle = 'rgba(9,13,28,0.94)'; rr(x, y, w, h, 14); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1.5; ctx.stroke();
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 22 + i * 20, y + 17, 6, 0, 7); ctx.fill(); });
    text('terminal', x + w / 2, y + 17, { size: 15, color: C.mute, fam: MONO });
    const lines = []; let typing = false, last = null;
    cmds.forEach((c) => {
      if (u < c.t) return;
      const n = Math.floor((u - c.t) * TL.CPS);
      lines.push({ k: 'cmd', s: c.text.slice(0, Math.min(n, c.text.length)) });
      if (n < c.text.length) typing = true;
      else if (c.out && u >= c.end + 0.25) lines.push({ k: 'out', s: c.out });
      last = c;
    });
    if (!last || (!typing && u >= last.end + 0.25)) lines.push({ k: 'cmd', s: '' });
    const show = lines.slice(-3);
    ctx.beginPath(); ctx.rect(x, y + 34, w, h - 34); ctx.clip();
    show.forEach((l, i) => {
      const ly = y + 34 + 22 + i * 30;
      if (l.k === 'cmd') {
        text('$', x + 24, ly, { size: 22, weight: 700, fam: MONO, color: C.green, align: 'left' });
        text(l.s, x + 48, ly, { size: 22, weight: 500, fam: MONO, align: 'left' });
        if (i === show.length - 1 && (typing || Math.floor(u * 2) % 2 === 0)) {
          ctx.fillStyle = C.text; ctx.fillRect(x + 50 + tw(l.s, 22, 500, MONO), ly - 12, 12, 24);
        }
      } else text(l.s, x + 48, ly, { size: 20, fam: MONO, color: C.mute, align: 'left' });
    });
    ctx.restore();
  }
  function caption(list, u) {
    const c = list.find((e) => u >= e[0] && u < e[1]);
    if (!c) return;
    const a = Math.min(P(u, c[0], 0.35), 1 - P(u, c[1] - 0.35, 0.35)), size = 34, lh = 48;
    const lines = c[2].split('\n').map((l) => l.split('`').map((p, i) => ({ p, code: i % 2 === 1 })));
    const widths = lines.map((segs) => segs.reduce((w, s) => w + (s.code ? tw(s.p, size * 0.9, 600, MONO) + 16 : tw(s.p, size, 500)), 0));
    const bw = Math.max(...widths) + 72, bh = lines.length * lh + 30, by = 1058 - bh + (1 - eo(P(u, c[0], 0.4))) * 14;
    withA(a, () => {
      ctx.fillStyle = 'rgba(6,10,24,0.78)'; rr(960 - bw / 2, by, bw, bh, 18); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1.5; ctx.stroke();
      lines.forEach((segs, li) => {
        let x = 960 - widths[li] / 2; const y = by + 15 + lh / 2 + li * lh;
        segs.forEach((s) => {
          if (s.code) {
            const w = tw(s.p, size * 0.9, 600, MONO);
            ctx.fillStyle = 'rgba(240,81,51,0.2)'; rr(x, y - size * 0.66, w + 16, size * 1.32, 8); ctx.fill();
            text(s.p, x + 8, y + 1, { size: size * 0.9, weight: 600, fam: MONO, color: '#ffb3a1', align: 'left' });
            x += w + 16;
          } else { text(s.p, x, y, { size, align: 'left' }); x += tw(s.p, size, 500); }
        });
      });
    });
  }
  function chip(n, title, u, start = 0) {
    const k = eo(P(u, start + 0.15, 0.6));
    withA(k, () => {
      const x = 70 - (1 - k) * 30, y = 52, h = 58, w = tw(title, 28, 600) + 96;
      ctx.fillStyle = 'rgba(18,26,58,0.85)'; rr(x, y, w, h, 29); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = C.git; ctx.beginPath(); ctx.arc(x + 29, y + 29, 19, 0, 7); ctx.fill();
      text(String(n), x + 29, y + 30, { size: 22, weight: 700, color: '#fff' });
      text(title, x + 62, y + 30, { size: 28, weight: 600, align: 'left' });
    });
  }
  function panel(x, y, w, h, col, title, sub, a, k) {
    withA(a, () => {
      ctx.save(); ctx.translate(0, (1 - k) * 40);
      ctx.fillStyle = 'rgba(17,24,52,0.8)'; rr(x, y, w, h, 22); ctx.fill();
      ctx.strokeStyle = rgba(col, 0.45); ctx.lineWidth = 2; ctx.stroke();
      const g = ctx.createLinearGradient(x, y, x, y + 120); g.addColorStop(0, rgba(col, 0.18)); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; rr(x, y, w, 120, 22); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + 36, y + 48, 9, 0, 7); ctx.fill();
      text(title, x + 58, y + 48, { size: 32, weight: 700, align: 'left' });
      text(sub, x + 36, y + 86, { size: 18, fam: MONO, color: C.mute, align: 'left' });
      ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(x + 24, y + 112, w - 48, 1.5);
      ctx.restore();
    });
  }

  // ---------- 0. Kirish ----------
  // o: muqova uchun siljitish (gy — graf, ty — sarlavha), markaz pleyer tugmasiga bo'sh qoladi
  function sceneIntro(u, o = { gy: 0, ty: 0, foot: true }) {
    const T = TL.intro, f = Math.sin(u * 1.2) * 6 + o.gy;
    const N = [[640, 380, C.blue], [800, 380, C.blue], [900, 255, C.purple], [1060, 255, C.purple], [960, 380, C.blue], [1120, 380, C.blue], [1280, 380, C.git]];
    const E = [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [5, 6], [3, 6]];
    E.forEach(([a, b]) => {
      const st = Math.max(T.nodes[a], T.nodes[b]) - 0.25, k = eio(P(u, st, 0.35));
      link(N[a][0], N[a][1] + f, N[b][0], N[b][1] + f, { p: k, head: false, w: 7, col: rgba(N[b][2], 0.65), bend: (a === 1 && b === 2) || (a === 3 && b === 6) ? (a === 1 ? 20 : 20) : 0 });
    });
    N.forEach(([x, y, c], i) => { const k = P(u, T.nodes[i], 0.5); node(x, y + f, i === 6 ? 34 : 26, c, { s: eback(k) }); burst(x, y + f, P(u, T.nodes[i], 0.7), c); });
    const k1 = eo(P(u, T.title, 0.9));
    withA(k1, () => {
      const y = 600 + o.ty + (1 - k1) * 40, w1 = tw('Git ', 112, 800), w2 = tw('qanday ishlaydi?', 112, 800), x = 960 - (w1 + w2) / 2;
      ctx.shadowColor = 'rgba(240,81,51,0.6)'; ctx.shadowBlur = 40;
      text('Git ', x, y, { size: 112, weight: 800, color: C.git, align: 'left' });
      ctx.shadowBlur = 0;
      text('qanday ishlaydi?', x + w1, y, { size: 112, weight: 800, align: 'left' });
    });
    const k2 = eo(P(u, T.sub, 0.9));
    withA(k2, () => text('Vizual qo‘llanma: commit, branch, merge, push', 960, 700 + o.ty + (1 - k2) * 24, { size: 38, color: C.mute }));
    if (o.foot) withA(eo(P(u, 3.6, 0.9)), () => text('dev-docs · o‘zbekcha', 960, 975, { size: 24, weight: 600, color: 'rgba(143,153,191,0.8)' }));
  }

  // ---------- 1. Muammo ----------
  function bigDoc(cx, cy, rot, s, name, a) {
    withA(a, () => {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s);
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
      docIcon(-62, -80, 124, 160, '#e9eefc');
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = C.blue; rr(-46, -58, 40, 26, 5); ctx.fill();
      text('W', -26, -44, { size: 20, weight: 800, color: '#fff' });
      ctx.fillStyle = 'rgba(30,40,80,0.25)';
      for (let i = 0; i < 5; i++) ctx.fillRect(-46, -16 + i * 16, i === 4 ? 50 : 92, 6);
      text(name, 0, 112, { size: 22, weight: 600, fam: MONO });
      ctx.restore();
    });
  }
  function sceneMuammo(u) {
    const T = TL.muammo;
    chip(1, 'Muammo', u);
    const F = [
      [500, 430, -0.14, 'loyiha.docx'], [780, 350, 0.09, 'loyiha_yangi.docx'], [1090, 440, -0.07, 'loyiha_yakuniy.docx'],
      [1400, 360, 0.12, 'loyiha_yakuniy_2.docx'], [930, 640, -0.05, 'loyiha_ENG_YAKUNIY.docx'],
    ];
    const DX = (i) => 560 + i * 200, DY = 520;
    const shake = P(u, T.worry, 0.3) * (1 - P(u, T.fly - 0.3, 0.3));
    const fly = eio(P(u, T.fly, 1.0));
    F.forEach(([x, y, r, name], i) => {
      const k = P(u, T.files[i], 0.55);
      const rot = r + Math.sin(u * 22 + i * 2) * 0.05 * shake;
      const px = lerp(x, DX(i), fly), py = lerp(y, DY, fly) - Math.sin(Math.PI * fly) * 80;
      bigDoc(px, py, rot * (1 - fly), eback(k) * lerp(1, 0.25, fly), name, 1 - P(u, T.fly + 0.75, 0.3));
    });
    // xavotir belgilari
    [[640, 230, -0.2], [1250, 220, 0.18], [1560, 560, 0.1], [330, 640, -0.1]].forEach(([x, y, r], i) => {
      const k = P(u, T.worry + i * 0.18, 0.4), a = k * (1 - P(u, T.fly - 0.2, 0.4));
      withA(a, () => { ctx.save(); ctx.translate(x, y + Math.sin(u * 3 + i) * 8); ctx.rotate(r); ctx.scale(eback(k), eback(k));
        ctx.shadowColor = C.red; ctx.shadowBlur = 30; text('?', 0, 0, { size: 110, weight: 800, color: C.red }); ctx.restore(); });
    });
    // tartibli tarix
    const MSG = ['Boshlang‘ich', 'Kirish qismi', 'Rasmlar', 'Tuzatishlar', 'Yakuniy'];
    for (let i = 4; i > 0; i--) link(DX(i), DY, DX(i - 1), DY, { r1: 30, r2: 30, p: eio(P(u, T.nodes[i] + 0.2, 0.4)) });
    MSG.forEach((m, i) => {
      const k = P(u, T.nodes[i], 0.5);
      node(DX(i), DY, 30, i === 4 ? C.git : C.blue, { s: eback(k) });
      burst(DX(i), DY, P(u, T.nodes[i], 0.7), C.blue);
      withA(P(u, T.nodes[i] + 0.2, 0.4), () => text(m, DX(i), DY + 62, { size: 24, weight: 600, color: C.mute }));
    });
    const kh = eo(P(u, T.head, 0.8));
    withA(kh, () => text('Bitta loyiha — bitta tartibli tarix', 960, 350 + (1 - kh) * 20, { size: 54, weight: 700 }));
    if (TL.burnCaptions) caption(TL.captions.muammo, u);
  }

  // ---------- 2. Uch hudud ----------
  function sceneHudud(u) {
    const T = TL.hudud;
    chip(2, 'Uch hudud', u);
    const PX = [120, 720, 1320], PY = 150, PW = 480, PH = 610, cols = [C.orange, C.green, C.blue];
    const titles = [['Ishchi papka', 'working directory'], ['Staging', 'staging area (index)'], ['Repozitoriy', 'repository (.git)']];
    PX.forEach((x, i) => { const k = eo(P(u, 0.3 + i * 0.35, 0.7)); panel(x, PY, PW, PH, cols[i], titles[i][0], titles[i][1], k, k); });
    withA(P(u, 1.6, 0.6), () => {
      [['add', 600, C.green], ['commit', 1200, C.blue]].forEach(([l, x, c]) => {
        link(x + 14, 455, x + 106, 455, { col: rgba(c, 0.8), w: 4 });
        text(l, x + 60, 425, { size: 18, weight: 700, fam: MONO, color: c });
      });
    });
    const WX = 360, SX = 960, SY = (j) => 300 + j * 84, WY = (i) => 300 + i * 84;
    const names = ['index.html', 'style.css', 'app.js'];
    const SNAP = [960, 455];
    // repozitoriy tarixi
    const RN = [[1400, 430, '9f8e7d6', 'Boshlang‘ich', -1], [1560, 430, 'a1b2c3d', 'Bosh sahifa', T.node1], [1720, 430, 'e4f5a6b', 'Tugma qo‘shildi', T.node2]];
    const repoA = P(u, 1.0, 0.6);
    withA(repoA, () => {
      link(1560, 430, 1400, 430, { r1: 30, r2: 30, p: eio(P(u, T.node1 + 0.2, 0.4)) });
      link(1720, 430, 1560, 430, { r1: 30, r2: 30, p: eio(P(u, T.node2 + 0.2, 0.4)) });
      RN.forEach(([x, y, h, m, t], i) => {
        const k = t < 0 ? 1 : P(u, t, 0.5);
        node(x, y, 30, i === 0 ? '#5b6aa0' : C.blue, { s: eback(k) });
        if (t > 0) burst(x, y, P(u, t, 0.8), C.blue);
        withA(t < 0 ? 1 : P(u, t + 0.2, 0.4), () => {
          text(h, x, y + 58, { size: 19, weight: 600, fam: MONO, color: C.text });
          text(m, x, y + 86, { size: 18, color: C.mute });
        });
      });
    });
    // ishchi papka fayllari
    names.forEach((n, i) => {
      const k = P(u, T.files + i * 0.2, 0.5);
      const ed = i < 2 ? T.edit1 : T.edit2, fl = i < 2 ? T.fly1 + i * 0.15 : T.fly2;
      const mod = u >= ed && u < fl + 0.45;
      const pulse = 1 + 0.07 * Math.sin(Math.PI * P(u, ed, 0.4));
      fileChip(n, WX, WY(i), { s: eback(k) * pulse, status: mod ? 'mod' : null, tagA: P(u, ed, 0.3) });
    });
    // staging nusxalari
    const staged = [[0, T.fly1, T.snap1, 0], [1, T.fly1 + 0.15, T.snap1, 1], [2, T.fly2, T.snap2, 0]];
    staged.forEach(([fi, fl, sn, j]) => {
      if (u < fl || u > sn + 0.6) return;
      const k = eio(P(u, fl, 0.9));
      let x = lerp(WX, SX, k), y = lerp(WY(fi), SY(j), k) - Math.sin(Math.PI * k) * 70, s = 1, a = 1;
      const c = eio(P(u, sn, 0.5));
      x = lerp(x, SNAP[0], c); y = lerp(y, SNAP[1], c); s = lerp(1, 0.25, c); a = 1 - P(u, sn + 0.35, 0.15);
      fileChip(names[fi], x, y, { s, a, status: k >= 1 ? 'staged' : 'mod', tagA: 1 });
    });
    // surat (snapshot) va repozitoriyga uchish
    [[T.snap1, RN[1]], [T.snap2, RN[2]]].forEach(([sn, dst]) => {
      const fk = P(u, sn + 0.45, 0.5);
      if (fk > 0 && fk < 1) {
        ring(SNAP[0], SNAP[1], 20 + eo(fk) * 110, '#ffffff', (1 - fk) * 0.9, 5);
        withA((1 - fk) * 0.6, () => glow(SNAP[0], SNAP[1], 180, 'rgba(255,255,255,0.5)'));
      }
      const ok = P(u, sn + 0.5, 0.9);
      if (ok > 0 && ok < 1) {
        const k = eio(ok), x = lerp(SNAP[0], dst[0], k), y = lerp(SNAP[1], dst[1], k) - Math.sin(Math.PI * k) * 140;
        glow(x, y, 60, 'rgba(120,170,255,0.55)'); node(x, y, 15, '#cfe0ff', { glow: 1.5 });
      }
    });
    terminal(510, 780, 900, 140, T.cmds, u);
    if (TL.burnCaptions) caption(TL.captions.hudud, u);
  }

  // ---------- 3. Commit ichida ----------
  function sceneCommit(u) {
    const T = TL.commit;
    chip(3, 'Commit ichida nima bor?', u);
    const cx = 120, cy = 165, cw = 790, ch = 590;
    const ka = eo(P(u, 0.3, 0.7));
    withA(ka, () => {
      ctx.save(); ctx.translate(0, (1 - ka) * 30);
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40;
      ctx.fillStyle = 'rgba(17,24,52,0.92)'; rr(cx, cy, cw, ch, 24); ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = rgba(C.blue, 0.45); ctx.lineWidth = 2; ctx.stroke();
      node(cx + 52, cy + 56, 20, C.blue);
      text('commit', cx + 88, cy + 56, { size: 32, weight: 700, align: 'left' });
      text('e4f5a6b', cx + 88 + tw('commit ', 32, 700), cy + 57, { size: 30, weight: 700, fam: MONO, color: C.yellow, align: 'left' });
      ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(cx + 28, cy + 100, cw - 56, 1.5);
      const rows = [
        ['hash', 'e4f5a6b9c0d1e2f3a4b5…', MONO, C.yellow],
        ['muallif', 'Ali Valiyev <ali@misol.uz>', UI, C.text],
        ['sana', '2026-10-13 14:05', MONO, C.text],
        ['xabar', '«Tugma qo‘shildi»', UI, C.text],
        ['ota (parent)', 'a1b2c3d', MONO, C.blue],
        ['snapshot', 'index.html · style.css · app.js', MONO, C.green],
      ];
      rows.forEach(([l, v, fam, col], i) => {
        const k = eo(P(u, T.rows[i], 0.45)), y = cy + 150 + i * 74;
        withA(k, () => {
          ctx.save(); ctx.translate((1 - k) * -30, 0);
          if (i === 4) {
            const hk = P(u, T.parent, 0.4) * (0.75 + 0.25 * Math.sin(u * 5));
            withA(hk, () => { ctx.fillStyle = rgba(C.blue, 0.18); rr(cx + 20, y - 30, cw - 40, 60, 12); ctx.fill(); ctx.strokeStyle = rgba(C.blue, 0.6); ctx.lineWidth = 2; ctx.stroke(); });
          }
          text(l, cx + 44, y, { size: 24, weight: 600, color: C.mute, align: 'left' });
          text(v, cx + 300, y, { size: fam === MONO ? 24 : 27, weight: 600, fam, color: col, align: 'left' });
          ctx.restore();
        });
      });
      ctx.restore();
    });
    const CH = [[1120, 470, '9f8e7d6', 'Boshlang‘ich'], [1370, 470, 'a1b2c3d', 'Bosh sahifa'], [1620, 470, 'e4f5a6b', 'Tugma qo‘shildi']];
    for (let i = 2; i > 0; i--) {
      const p = eio(P(u, T.chain[i] + 0.3, 0.4)), hot = i === 2 ? P(u, T.parent, 0.4) : 0;
      link(CH[i][0], CH[i][1], CH[i - 1][0], CH[i - 1][1], { r1: 34, r2: 34, p, w: 4 + hot * 2, col: hot ? rgba(C.blue, 0.6 + 0.4 * hot) : undefined, glowCol: hot ? C.blue : null });
      withA(p, () => text('ota', (CH[i][0] + CH[i - 1][0]) / 2, CH[i][1] - 26, { size: 18, weight: 600, color: C.mute }));
    }
    CH.forEach(([x, y, h, m], i) => {
      const k = P(u, T.chain[i], 0.5);
      node(x, y, 34, i === 2 ? C.blue : '#5b7bd6', { s: eback(k) });
      burst(x, y, P(u, T.chain[i], 0.8), C.blue);
      withA(P(u, T.chain[i] + 0.2, 0.4), () => {
        text(h, x, y + 64, { size: 21, weight: 600, fam: MONO });
        text(m, x, y + 94, { size: 19, color: C.mute });
      });
    });
    // kartadan zanjirdagi commit'ga ishora
    link(cx + cw + 6, cy + 56, 1620, 420, { bend: -90, p: eio(P(u, T.link, 0.7)), dash: [10, 10], col: rgba(C.yellow, 0.7), w: 3, r2: 18 });
    ring(1620, 470, 46 + Math.sin(u * 4) * 3, C.yellow, P(u, T.link + 0.5, 0.4) * (1 - P(u, T.travel, 0.3)), 3);
    withA(P(u, 9.8, 0.6), () => text('←  strelka ota-commit’ni ko‘rsatadi', 1370, 640, { size: 24, weight: 600, color: C.mute }));
    // vaqt bo'ylab sayohat
    const tx = kf(u, [[0, 1620], [T.travel + 0.3, 1120], [T.travel + 3.2, 1620]], 1.2);
    const ta = P(u, T.travel, 0.3) * (1 - P(u, 19.4, 0.3));
    withA(ta, () => {
      ring(tx, 470, 50 + Math.sin(u * 5) * 4, C.yellow, 1, 4);
      glow(tx, 470, 110, 'rgba(255,209,102,0.18)');
      pill('ko‘rib turgan holat', tx, 360, C.yellow, { size: 20, mono: false, dir: 1 });
    });
    if (TL.burnCaptions) caption(TL.captions.commit, u);
  }

  // ---------- 4–5. Branch va merge ----------
  function sceneBranch(u) {
    const T = TL.branch;
    withA(1 - P(u, T.mergeChip - 0.4, 0.4), () => chip(4, 'Branch — tarmoq', u));
    withA(P(u, T.mergeChip, 0.01), () => chip(5, 'Merge — birlashtirish', u, T.mergeChip));
    const N = {
      c1: [400, 600, '9f8e', C.blue, T.base[0]], c2: [640, 600, 'a1b2', C.blue, T.base[1]], c3: [880, 600, 'e4f5', C.blue, T.base[2]],
      f1: [1120, 420, '3c4d', C.purple, T.f1], f2: [1360, 420, '8a9b', C.purple, T.f2],
      c4: [1120, 600, '5f6a', C.blue, T.c4], m: [1600, 600, '9d0e', C.git, T.m],
    };
    const L = [['c2', 'c1', 0], ['c3', 'c2', 0], ['f1', 'c3', -40], ['f2', 'f1', 0], ['c4', 'c3', 0], ['m', 'c4', 0], ['m', 'f2', 40]];
    L.forEach(([a, b, bend]) => {
      const A = N[a], B = N[b];
      link(A[0], A[1], B[0], B[1], { r1: 34, r2: 34, bend, p: eio(P(u, A[4] + 0.15, 0.45)), col: rgba(A[3], 0.7) });
    });
    Object.values(N).forEach(([x, y, l, c, t]) => {
      const big = c === C.git;
      node(x, y, big ? 40 : 34, c, { s: eback(P(u, t, 0.5)), label: l, lsize: 16 });
      burst(x, y, P(u, t, big ? 1.1 : 0.8), c, big ? 40 : 30);
      if (big) burst(x, y, P(u, t + 0.15, 1.2), C.yellow, 50);
    });
    // ko'rsatkichlar
    const mainP = kf(u, [[0, [880, 680]], [T.c4 + 0.1, [1120, 680]], [T.m + 0.1, [1600, 680]]], 0.7);
    const featP = kf(u, [[0, [880, 520]], [T.f1 + 0.1, [1120, 340]], [T.f2 + 0.1, [1360, 340]]], 0.7);
    pill('main', mainP[0], mainP[1], C.blue, { dir: -1, s: eback(P(u, T.mainPill, 0.5)) });
    pill('feature', featP[0], featP[1], C.purple, { dir: 1, s: eback(P(u, T.feat, 0.5)) });
    const onF = eio(P(u, T.sw1, 0.8)) - eio(P(u, T.sw2, 0.8));
    const hx = lerp(mainP[0], featP[0], onF) - Math.sin(Math.PI * onF) * 170;
    const hy = lerp(mainP[1] + 60, featP[1] - 60, onF);
    pill('HEAD', hx, hy, C.yellow, { dir: onF > 0.5 ? 1 : -1, size: 22, s: eback(P(u, T.head, 0.5)) });
    // main joyida qolganini ta'kidlash
    const mp = P(u, 19.2, 0.3) * (1 - P(u, 24.5, 0.3));
    ring(mainP[0], 600, 50 + Math.sin(u * 5) * 4, C.blue, mp, 4);
    // konflikt kartasi
    const kc = eo(P(u, T.conflict, 0.6));
    withA(kc * (1 - P(u, 42.4, 0.4)), () => {
      const x = 420, y = 150 + (1 - kc) * 20, w = 540, h = 250;
      ctx.fillStyle = 'rgba(30,14,22,0.92)'; rr(x, y, w, h, 18); ctx.fill();
      ctx.strokeStyle = rgba(C.red, 0.6); ctx.lineWidth = 2; ctx.stroke();
      text('⚠  Konflikt bo‘lsa:', x + 28, y + 36, { size: 26, weight: 700, color: C.red, align: 'left' });
      [['<<<<<<< HEAD', C.red], ['rang: ko‘k', C.blue], ['=======', C.mute], ['rang: yashil', C.purple], ['>>>>>>> feature', C.red]]
        .forEach(([s, c], i) => text(s, x + 32, y + 82 + i * 34, { size: 22, weight: 600, fam: MONO, color: c, align: 'left' }));
    });
    terminal(510, 790, 900, 140, T.cmds, u);
    if (TL.burnCaptions) caption(TL.captions.branch, u);
  }

  // ---------- 6. Remote ----------
  function laptop(cx, cy, w, h, a) {
    withA(a, () => {
      ctx.fillStyle = 'rgba(14,20,44,0.95)'; rr(cx - w / 2, cy - h / 2, w, h, 18); ctx.fill();
      ctx.strokeStyle = 'rgba(160,180,255,0.35)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = 'rgba(160,180,255,0.35)'; ctx.beginPath();
      ctx.moveTo(cx - w / 2 - 30, cy + h / 2 + 6); ctx.lineTo(cx + w / 2 + 30, cy + h / 2 + 6);
      ctx.lineTo(cx + w / 2 + 50, cy + h / 2 + 24); ctx.lineTo(cx - w / 2 - 50, cy + h / 2 + 24); ctx.closePath(); ctx.fill();
    });
  }
  function cloud(cx, cy, s, a) {
    withA(a, () => {
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
      ctx.shadowColor = 'rgba(120,160,255,0.45)'; ctx.shadowBlur = 50;
      ctx.fillStyle = 'rgba(30,42,88,0.95)';
      ctx.beginPath();
      [[-190, 40, 110], [-70, -40, 150], [90, -20, 140], [210, 50, 100], [0, 70, 150]].forEach(([x, y, r]) => { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 7); });
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.restore();
    });
  }
  function sceneRemote(u) {
    const T = TL.remote;
    chip(6, 'Remote — GitHub bilan ishlash', u);
    const LX = (i) => 200 + i * 88, LY = 470, RX = (i) => 1280 + i * 88, RY = 500;
    const la = eo(P(u, 0.2, 0.7)), ca = eo(P(u, 0.5, 0.7));
    laptop(420, 470, 620, 330, la);
    withA(la, () => { text('Sizning kompyuteringiz', 420, 265, { size: 30, weight: 700 }); text('lokal repozitoriy', 420, 380, { size: 20, fam: MONO, color: C.mute }); });
    cloud(1500, 470, 1.0, ca);
    withA(ca, () => { text('origin', 1500, 380, { size: 34, weight: 700 }); text('GitHub · remote repozitoriy', 1500, 420, { size: 20, fam: MONO, color: C.mute }); });
    // yo'llar
    const pushOn = P(u, T.push - 0.2, 0.3) * (1 - P(u, T.push + 1.8, 0.4));
    const pullOn = P(u, T.pull - 0.2, 0.3) * (1 - P(u, T.pull + 1.8, 0.4));
    withA(P(u, 1.2, 0.6), () => {
      link(760, 420, 1200, 420, { col: rgba(C.green, 0.35 + 0.6 * pushOn), w: 5, glowCol: pushOn > 0.1 ? C.green : null });
      text('git push', 980, 388, { size: 24, weight: 700, fam: MONO, color: C.green });
      link(1200, 560, 760, 560, { col: rgba(C.pink, 0.35 + 0.6 * pullOn), w: 5, glowCol: pullOn > 0.1 ? C.pink : null });
      text('git pull', 980, 594, { size: 24, weight: 700, fam: MONO, color: C.pink });
    });
    // lokal zanjir
    const localN = [[C.blue, -1], [C.blue, -1], [C.blue, -1], [C.blue, -1], [C.blue, -1], [C.pink, T.pull + 1.1]];
    const cloudN = [[C.blue, -1], [C.blue, -1], [C.blue, -1], [C.blue, T.push + 1.1], [C.blue, T.push + 1.35], [C.pink, T.mateSend + 1.0]];
    const chain = (X, Y, list, a) => withA(a, () => {
      list.forEach(([c, t], i) => { if (i > 0) link(X(i), Y, X(i - 1), Y, { r1: 22, r2: 22, w: 3, p: t < 0 ? 1 : eio(P(u, t, 0.3)) }); });
      list.forEach(([c, t], i) => { node(X(i), Y, 22, c, { s: t < 0 ? 1 : eback(P(u, t, 0.5)), glow: 0.7 }); if (t > 0) burst(X(i), Y, P(u, t, 0.7), c, 22); });
    });
    chain(LX, LY, localN, la); chain(RX, RY, cloudN, ca);
    // uchayotgan commit'lar
    const flyDot = (x1, y1, x2, y2, t0, dur, col, lift) => {
      const k = P(u, t0, dur);
      if (k <= 0 || k >= 1) return;
      const e = eio(k), x = lerp(x1, x2, e), y = lerp(y1, y2, e) - Math.sin(Math.PI * e) * lift;
      glow(x, y, 50, rgba(col, 0.5)); node(x, y, 16, col, { glow: 1.4 });
    };
    flyDot(LX(3), LY, RX(3), RY, T.push, 1.1, C.blue, 150);
    flyDot(LX(4), LY, RX(4), RY, T.push + 0.25, 1.1, C.blue, 150);
    flyDot(RX(5), RY, LX(5), LY, T.pull, 1.1, C.pink, -150);
    // jamoadosh
    const ma = eo(P(u, T.mate, 0.6));
    withA(ma, () => {
      laptop(1500, 840, 220, 120, 1);
      ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(1500, 826, 20, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(1500, 870, 32, Math.PI, 0); ctx.fill();
      text('Jamoadosh', 1680, 840, { size: 26, weight: 700, color: C.pink, align: 'left' });
    });
    flyDot(1500, 780, RX(5), RY, T.mateSend, 1.0, C.pink, 40);
    // fetch + merge
    const kfm = eo(P(u, T.fetchMerge, 0.6));
    withA(kfm, () => {
      const y = 722 + (1 - kfm) * 16, s = 'git pull  =  git fetch  +  git merge', w = tw(s, 26, 700, MONO) + 50;
      ctx.fillStyle = 'rgba(255,122,182,0.12)'; rr(980 - w / 2, y - 30, w, 60, 30); ctx.fill();
      ctx.strokeStyle = rgba(C.pink, 0.5); ctx.lineWidth = 2; ctx.stroke();
      text(s, 980, y + 1, { size: 26, weight: 700, fam: MONO, color: '#ffc2dc' });
    });
    terminal(120, 790, 640, 140, T.cmds, u);
    if (TL.burnCaptions) caption(TL.captions.remote, u);
  }

  // ---------- 7. Xulosa ----------
  function sceneXulosa(u) {
    const T = TL.xulosa, out = 1 - P(u, T.outro, 0.8);
    withA(out, () => {
      const k0 = eo(P(u, 0.1, 0.6));
      withA(k0, () => text('Xulosa', 960, 120 + (1 - k0) * 20, { size: 56, weight: 800 }));
      const cx = 960, cy = 530, R = 290;
      withA(P(u, 0.3, 0.8), () => {
        ctx.setLineDash([4, 14]); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(200,215,255,0.35)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        ctx.shadowColor = 'rgba(240,81,51,0.6)'; ctx.shadowBlur = 40;
        text('Git', cx, cy - 14, { size: 110, weight: 800, color: C.git }); ctx.shadowBlur = 0;
        text('kundalik sikl', cx, cy + 64, { size: 28, weight: 600, color: C.mute });
      });
      const ang = -Math.PI / 2 + Math.max(0, u - 2.2) * 1.05;
      withA(P(u, 2.2, 0.4), () => { glow(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R, 70, 'rgba(255,209,102,0.6)'); node(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R, 10, C.yellow, { glow: 2 }); });
      const ST = [['tahrirlash', C.orange, false], ['git add', C.green, true], ['git commit', C.blue, true], ['git push', C.purple, true], ['git pull', C.pink, true]];
      ST.forEach(([l, c, mono], i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        pill(l, x, y, c, { size: 30, mono, s: eback(P(u, T.stations[i], 0.5)) });
      });
      if (TL.burnCaptions) caption(TL.captions.xulosa, u);
    });
    const kt = eo(P(u, T.thanks, 1.0));
    withA(kt, () => {
      ctx.shadowColor = 'rgba(240,81,51,0.5)'; ctx.shadowBlur = 50;
      text('Rahmat!', 960, 470 + (1 - kt) * 30, { size: 140, weight: 800 }); ctx.shadowBlur = 0;
    });
    const k2 = eo(P(u, T.thanks + 0.8, 0.9));
    withA(k2, () => {
      text('Batafsil — Git qo‘llanmasi:', 960, 610, { size: 34, color: C.mute });
      text('mfs1011.github.io/dev-docs', 960, 665, { size: 36, weight: 700, fam: MONO, color: C.git });
    });
  }

  const SCENES = [
    [S.intro, S.muammo, sceneIntro], [S.muammo, S.hudud, sceneMuammo], [S.hudud, S.commit, sceneHudud],
    [S.commit, S.branch, sceneCommit], [S.branch, S.remote, sceneBranch], [S.remote, S.xulosa, sceneRemote], [S.xulosa, S.end, sceneXulosa],
  ];
  // t — video vaqti (ovozga moslab cho'zilgan); sahnalar eski vaqtda yozilgan, TL.toOld o'tkazadi
  function render(t) {
    const T = TL.toOld(t), END = TL.toNew(S.end);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    bg(t);
    for (const [a, b, fn] of SCENES) {
      if (T >= a && T < b) {
        const u = T - a, al = Math.min(P(u, 0, 0.6), 1 - P(u, b - a - 0.6, 0.6));
        withA(al, () => fn(u));
      }
    }
    const fin = Math.max(1 - P(t, 0, 1.0), P(t, END - 1.6, 1.5));
    if (fin > 0) { ctx.globalAlpha = fin; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }
  window.render = render;
  window.renderPoster = () => { render(0.0001); ctx.globalAlpha = 1; bg(4); sceneIntro(6, { gy: -150, ty: 190, foot: false }); };
  window.DURATION = TL.toNew(S.end);
  // Ovozli versiyada subtitr videoga yozilmaydi — pleyerda CC bilan yoqiladi (voice/subtitles.vtt)
  TL.burnCaptions = !TL.warp;

  if (location.hash === '#play') {
    const t0 = performance.now();
    const loop = () => { render(((performance.now() - t0) / 1000) % window.DURATION); requestAnimationFrame(loop); };
    document.fonts.ready.then(loop);
  } else render(0);
})();
