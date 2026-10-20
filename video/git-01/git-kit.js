// Git videolari uchun umumiy kutubxona (git-kit.js)
// Uslub va ranglar: GIT-VIDEO-USLUBI.md talablari asosida
(function (g) {
  function GITKIT(ctx) {
    const W = 1920, H = 1080;
    const C = {
      text: '#eef1fb',
      mute: '#8f99bf',
      blue: '#4f8cff',
      purple: '#b46cff',
      green: '#34d399',
      orange: '#ffb547',
      red: '#ff6b7a',
      git: '#f05133',
      yellow: '#ffd166',
      pink: '#ff7ab6',
      dark: '#0b1020',
      panel: 'rgba(17,24,52,0.85)',
      card: 'rgba(21,30,66,0.92)'
    };
    const UI = '"Avenir Next", "Helvetica Neue", Arial, sans-serif';
    const MONO = 'Menlo, Monaco, monospace';

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

    function withA(a, fn) { if (a <= 0.002) return; ctx.save(); ctx.globalAlpha *= Math.min(1, a); fn(); ctx.restore(); }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

    function tw(s, size, weight = 500, fam = UI) { ctx.font = font(size, weight, fam); return ctx.measureText(s).width; }

    function text(s, x, y, o = {}) {
      if (s == null) return;
      ctx.font = font(o.size || 32, o.weight || 500, o.fam || UI);
      ctx.fillStyle = o.color || C.text;
      ctx.textAlign = o.align || 'center';
      ctx.textBaseline = o.baseline || 'middle';
      ctx.fillText(s, x, y);
    }

    function glow(x, y, r, col) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    }

    // Fon
    const PARTS = Array.from({ length: 90 }, (_, i) => ({
      x: rnd(i) * W, y: rnd(i + 99) * H, s: 0.6 + rnd(i + 7) * 2.2, v: 5 + rnd(i + 3) * 16, a: 0.08 + rnd(i + 5) * 0.25, ph: rnd(i + 11) * 6.28,
    }));

    function bg(t = 0) {
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

    function burst(x, y, k, col, r0 = 30) {
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
      const s = o.s == null ? 1 : o.s, size = o.size || 22, mono = o.mono !== false;
      if (s <= 0.001) return;
      withA(o.a == null ? 1 : o.a, () => {
        ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
        const w = tw(txt, size, 700, mono ? MONO : UI) + 32, h = size + 18;
        ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.fillStyle = col;
        rr(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.shadowBlur = 0;
        if (o.dir) {
          const ty = o.dir > 0 ? h / 2 - 1 : -h / 2 + 1;
          ctx.beginPath(); ctx.moveTo(-8, ty); ctx.lineTo(8, ty); ctx.lineTo(0, ty + o.dir * 10); ctx.closePath(); ctx.fill();
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

    function fileChip(name, cx, cy, o = {}) {
      const s = o.s == null ? 1 : o.s, w = o.w || 380, h = o.h || 52;
      if (s <= 0.001) return;
      withA(o.a == null ? 1 : o.a, () => {
        ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
        const col = o.col || C.blue;
        ctx.fillStyle = '#162044'; rr(-w / 2, -h / 2, w, h, 12); ctx.fill();
        ctx.lineWidth = 1.8; ctx.strokeStyle = rgba(col, 0.45); ctx.stroke();
        docIcon(-w / 2 + 16, -15, 20, 28, col);
        text(name, -w / 2 + 48, 1, { size: o.size || 20, weight: 600, fam: MONO, align: 'left', color: C.text });
        if (o.tag) {
          const tw2 = tw(o.tag, 15, 700) + 20;
          ctx.fillStyle = rgba(col, 0.2); rr(w / 2 - tw2 - 12, -13, tw2, 26, 13); ctx.fill();
          text(o.tag, w / 2 - 12 - tw2 / 2, 1, { size: 15, weight: 700, color: col });
        }
        ctx.restore();
      });
    }

    function chip(n, title, u, start = 0) {
      const k = eo(P(u, start + 0.1, 0.5));
      withA(k, () => {
        const x = 70, y = 45, h = 54, w = tw(title, 24, 700) + 84;
        ctx.fillStyle = 'rgba(18,26,58,0.92)'; rr(x, y, w, h, 27); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = C.git; ctx.beginPath(); ctx.arc(x + 27, y + 27, 18, 0, 7); ctx.fill();
        text(String(n), x + 27, y + 28, { size: 20, weight: 800, color: '#fff' });
        text(title, x + 56, y + 28, { size: 24, weight: 700, align: 'left' });
      });
    }

    function panel(x, y, w, h, col, title, sub, a = 1, k = 1) {
      withA(a, () => {
        ctx.save(); ctx.translate(0, (1 - k) * 25);
        ctx.fillStyle = 'rgba(16,23,50,0.88)'; rr(x, y, w, h, 20); ctx.fill();
        ctx.strokeStyle = rgba(col, 0.45); ctx.lineWidth = 2; ctx.stroke();
        const g = ctx.createLinearGradient(x, y, x, y + 90); g.addColorStop(0, rgba(col, 0.16)); g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g; rr(x, y, w, 90, 20); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + 32, y + 36, 8, 0, 7); ctx.fill();
        text(title, x + 52, y + 36, { size: 26, weight: 700, align: 'left' });
        if (sub) text(sub, x + 32, y + 68, { size: 16, fam: MONO, color: C.mute, align: 'left' });
        ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 20, y + 86, w - 40, 1.5);
        ctx.restore();
      });
    }

    function card(x, y, w, h, o = {}) {
      const p = o.p == null ? 1 : o.p;
      if (p <= 0.001) return;
      const a = (o.a == null ? 1 : o.a) * (o.p == null ? 1 : p);
      if (a <= 0.002) return;
      const col = o.col || C.blue;
      withA(a, () => {
        ctx.save();
        if (o.p != null) ctx.translate(0, (1 - eo(p)) * 16);
        if (o.glow) { ctx.shadowColor = col; ctx.shadowBlur = o.glow; }
        ctx.fillStyle = o.fill || 'rgba(19,27,58,0.85)';
        rr(x, y, w, h, o.r || 16); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = rgba(col, o.strokeA || 0.4); ctx.lineWidth = o.lw || 1.8; ctx.stroke();
        ctx.restore();
      });
    }

    return {
      W, H, C, UI, MONO,
      clamp, P, lerp, eo, eio, eback, rnd, hex, rgba, light, font, withA, rr,
      tw, text, glow, bg, node, ring, burst, curvePts, link, pill, docIcon,
      fileChip, chip, panel, card
    };
  }

  g.GITKIT = GITKIT;
})(typeof window !== 'undefined' ? window : globalThis);
