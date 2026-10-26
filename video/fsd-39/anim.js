// FSD 39-bob videosi: "Tez-tez beriladigan savollar" (FAQ) — FSD amaliyotidagi eng muhim yechimlar
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
    blue: '#3b5bdb',
    purple: '#8b5cf6',
    teal: '#0d9488',
    cyan: '#0891b2'
  };

  // Qatlamlar (pastdan yuqoriga)
  const LAYERS = [
    { id: 'shared', col: '#94a3b8', uz: 'shared/: ui, api, config, lib, auth' },
    { id: 'entities', col: '#fb7185', uz: 'entities/: biznes modellari (ixtiyoriy)' },
    { id: 'features', col: '#fbbf24', uz: 'features/: foydalanuvchi amallari' },
    { id: 'widgets', col: '#34d399', uz: 'widgets/: qayta ishlatiladigan kompozitsiyalar' },
    { id: 'pages', col: '#60a5fa', uz: 'pages/: sahifalar va marshrutlar' },
    { id: 'app', col: '#a78bfa', uz: 'app/: router, main layout, providerlar' },
  ];
  const BW = 8, BD = 5, FH = 0.9, FS = 1.25, U = 60;

  // ---------- yordamchilar ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const P = (t, a, d) => clamp((t - a) / d);
  const lerp = (a, b, k) => a + (b - a) * k;
  const eo = (k) => 1 - Math.pow(1 - k, 3);
  const eio = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const rnd = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const hex = (c) => {
    if (c.startsWith('rgb')) return c.match(/\d+/g).slice(0, 3).map(Number);
    const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const shade = (c, k) => { const v = hex(c).map((x) => Math.round(k > 0 ? x + (255 - x) * k : x * (1 + k))); return `rgb(${v.join(',')})`; };
  const font = (s, w = 600, f = UI) => `${w} ${s}px ${f}`;
  function withA(a, fn) { if (a <= 0.002) return; ctx.save(); ctx.globalAlpha *= Math.min(1, a); fn(); ctx.restore(); }
  function tw(s, size, w = 600, f = UI) { ctx.font = font(size, w, f); return ctx.measureText(s).width; }
  function text(s, x, y, o = {}) { ctx.font = font(o.size || 30, o.weight || 600, o.fam || UI); ctx.fillStyle = o.color || C.ink; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
  function wrapText(s, x, y, maxW, lineH, o = {}) {
    ctx.font = font(o.size || 16, o.weight || 600, o.fam || UI);
    ctx.fillStyle = o.color || C.ink;
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = 'middle';
    const words = s.split(' ');
    let line = '';
    let curY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + (line ? ' ' : '') + words[n];
      if (ctx.measureText(testLine).width > maxW && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n];
        curY += lineH;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
  }
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
      const cx = (x + t * v) % (SW + 300) - 150;
      ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath();
      ctx.arc(cx, y, r, 0, Math.PI * 2); ctx.arc(cx + r * 0.7, y - 10, r * 0.7, 0, Math.PI * 2);
      ctx.arc(cx - r * 0.7, y - 5, r * 0.6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    });
  }

  function floorLabel(i, k, lift = 0, desc = true) {
    withA(k, () => {
      const z = floorZ(i) + lift;
      const [px, py] = proj(BW + 0.4, BD / 2, z + FH / 2);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 8;
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(px + 12, py - 20, desc ? 350 : 160, 40, 8); ctx.fill();
      ctx.strokeStyle = shade(LAYERS[i].col, -0.2); ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      ctx.fillStyle = LAYERS[i].col; ctx.beginPath(); ctx.roundRect(px + 16, py - 16, 8, 32, 4); ctx.fill();
      text(LAYERS[i].id, px + 32, py + 1, { size: 20, weight: 700, color: C.ink });
      if (desc) text(LAYERS[i].uz, px + 126, py + 1, { size: 12, weight: 500, color: C.soft });
    });
  }

  function drawTower(t, o = {}) {
    ground(o.groundA == null ? 1 : o.groundA);
    const drop = (i) => clamp(P(t, 0.4 + i * 0.28, 0.7));
    for (let i = 0; i < LAYERS.length; i++) {
      const k = drop(i), l = LAYERS[i];
      const zBase = floorZ(i), zDrop = (1 - eo(k)) * 6;
      const lift = o.lift && o.lift[i] ? o.lift[i] : 0;
      const col = o.hlFloor === i ? shade(l.col, 0.25) : l.col;
      box(0, 0, zBase + zDrop + lift, BW, BD, FH, col, { a: o.alpha == null ? 1 : o.alpha });
      if (k > 0.4 && o.showLabels !== false) floorLabel(i, P(k, 0.4, 0.6), lift, o.descLabels !== false);
    }
  }

  // ---------- Sahna chizish ----------
  function draw(t) {
    ctx.clearRect(0, 0, SW, SH);
    sky(t);

    const S = TM.scenes;
    const camFrames = [
      [0, [90, -30, 1]],
      [S.asoslar_faq.s, [320, 10, 0.95]],
      [S.qatlam_tanlash_faq.s, [360, 20, 0.92]],
      [S.chegaralar_faq.s, [380, 25, 0.9]],
      [S.steiger_va_asboblar_faq.s, [360, 20, 0.92]],
      [S.frameworklar_faq.s, [400, 30, 0.9]],
      [S.xulosa.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.asoslar_faq.s)
    if (t < S.asoslar_faq.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill("39-BOB: TEZ-TEZ BERILADIGAN SAVOLLAR (FAQ)", SW / 2, 80, C.cyan, { size: 28, align: 'center' });
        text("FSD amaliyotidagi eng qiyin savollar va rasmiy yechimlar", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating badges
      const kBadges = eo(P(t, L('L1').s + 2.5, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: '5 ta Asosiy Guruh', x: 260, y: 320, col: C.blue },
          { s: 'Feature vs Entity', x: 280, y: 440, col: C.green },
          { s: '@x Cross-importlar', x: 270, y: 560, col: C.purple },
          { s: 'Next.js & Nuxt 4', x: 1420, y: 340, col: C.amber },
          { s: 'Steiger & Barrel index', x: 1440, y: 460, col: C.teal }
        ];
        badges.forEach((b, idx) => {
          const bob = Math.sin(t * 2.5 + idx) * 8;
          pill(b.s, b.x, b.y + bob, b.col, { size: 20, mono: true });
        });
      });

      const k2 = eo(P(t, L('L2').s, 0.8));
      withA(k2, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 470, SH - 140, 940, 75, 16); ctx.fill();
        ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Ikkilanmaslik uchun barcha muhim savollarni 5 guruhga ajratamiz!", SW / 2, SH - 103, { size: 22, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: ASOSLAR FAQ (S.asoslar_faq.s - S.qatlam_tanlash_faq.s)
    else if (t < S.qatlam_tanlash_faq.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("1-GURUH: FSD ASOSLARI VA QATLAM QOIDALARI", 180, 80, C.cyan, { size: 26 });

      const kAsos = eo(P(t, S.asoslar_faq.s + 0.3, 0.8));
      withA(kAsos, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const faqs = [
          {
            q: "Hamma qatlamlar shartmi?",
            a: "Yo'q! Ko'pincha faqat app + pages + shared bilan boshlanadi va yetarli bo'ladi.",
            col: C.green,
            tag: "Boshlang'ich arxitektura"
          },
          {
            q: "O'z qatlamimni (core, modules) ochsam bo'ladimi?",
            a: "Tavsiya etilmaydi! Bu FSD standartini buzadi va linterlar taniy olmaydi.",
            col: C.red,
            tag: "Standart buzilishi"
          },
          {
            q: "processes qatlami qayerga ketdi?",
            a: "v2.1 da eskirgan deb topilgan. Kodni features va app/ ga ko'chiring.",
            col: C.amber,
            tag: "v2.1 yangilanishi"
          },
          {
            q: "Atomic Design bilan birga ishlatsa bo'ladimi?",
            a: "Ha! Masalan, shared/ui yoki slice ui ichida atom, molekula uslubi mumkin.",
            col: C.blue,
            tag: "Metodologiya uyg'unligi"
          }
        ];

        faqs.forEach((fq, idx) => {
          const colIdx = idx % 2;
          const rowIdx = Math.floor(idx / 2);
          const bx = 180 + colIdx * 800;
          const by = 190 + rowIdx * 370;

          ctx.save();
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath(); ctx.roundRect(bx, by, 760, 340, 16); ctx.fill();
          ctx.strokeStyle = fq.col;
          ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();

          pill("❓ " + fq.q, bx + 30, by + 40, fq.col, { size: 16 });
          pill(fq.tag, bx + 730, by + 40, C.soft, { size: 13, align: 'right' });

          ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(bx + 25, by + 105, 710, 205, 12); ctx.fill();
          ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          text("Javob:", bx + 45, by + 145, { size: 15, weight: 700, color: C.soft });
          wrapText(fq.a, bx + 45, by + 185, 640, 28, { size: 16.5, weight: 600, color: C.ink });
        });
      });
    }

    // SCENE 3: QATLAM TANLASH FAQ (S.qatlam_tanlash_faq.s - S.chegaralar_faq.s)
    else if (t < S.chegaralar_faq.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("2-GURUH: QATLAM TANLASH (ENTITY, FEATURE, AUTH)", 180, 80, C.cyan, { size: 26 });

      const kQat = eo(P(t, S.qatlam_tanlash_faq.s + 0.3, 0.8));
      withA(kQat, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const faqs2 = [
          {
            q: "Feature va Entity farqi nima?",
            a: "Entity — ilova ishlaydigan biznes tushunchasi (ot: product, order). Feature — foydalanuvchiga qiymat beradigan harakat (fe'l: add-to-cart).",
            col: C.blue
          },
          {
            q: "Bitta sahifada ishlatiladigan komponent qayerda?",
            a: "Faqat sahifa ichida! Uni oldindan entities ga chiqarish 'insignificant-slice' xatosini keltirib chiqaradi.",
            col: C.green
          },
          {
            q: "Auth tokenlar va sessiya qayerda turadi?",
            a: "shared/auth, shared/api yoki entities/session da. Sahifa yoki widget ichida saqlash qat'iyan man etiladi.",
            col: C.purple
          },
          {
            q: "Entity'siz loyiha FSD hisoblanadimi?",
            a: "Ha, albatta! Qayta ishlatiladigan biznes modellari bo'lmasa, entities qatlami majburiy emas.",
            col: C.teal
          }
        ];

        faqs2.forEach((fq, idx) => {
          const colIdx = idx % 2;
          const rowIdx = Math.floor(idx / 2);
          const bx = 180 + colIdx * 800;
          const by = 190 + rowIdx * 370;

          ctx.save();
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath(); ctx.roundRect(bx, by, 760, 340, 16); ctx.fill();
          ctx.strokeStyle = fq.col;
          ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();

          pill("❓ " + fq.q, bx + 30, by + 40, fq.col, { size: 16 });

          ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(bx + 25, by + 105, 710, 205, 12); ctx.fill();
          ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          text("Rasmiy Tavsiya:", bx + 45, by + 145, { size: 15, weight: 700, color: C.soft });
          wrapText(fq.a, bx + 45, by + 185, 640, 28, { size: 16, weight: 600, color: C.ink });
        });
      });
    }

    // SCENE 4: CHEGARALAR FAQ (S.chegaralar_faq.s - S.steiger_va_asboblar_faq.s)
    else if (t < S.steiger_va_asboblar_faq.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("3-GURUH: CHEGARALAR VA KOMPOZITSIYA", 180, 80, C.cyan, { size: 26 });

      const kCheg = eo(P(t, S.chegaralar_faq.s + 0.3, 0.8));
      withA(kCheg, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: Feature to Feature taqiqi
        ctx.save(); ctx.fillStyle = '#fff5f5'; ctx.beginPath(); ctx.roundRect(180, 190, 760, 740, 16); ctx.fill();
        ctx.strokeStyle = C.red; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
        pill("Feature boshqa Feature ni import qilsa bo'ladimi?", 210, 230, C.red, { size: 16 });

        text("❌ QAT'IYAN TAQIQLANADI! (Cross-import taqiqi)", 210, 290, { size: 18, weight: 700, color: C.red });

        const solutions = [
          { t: "1. Yuqori qatlamda kompozitsiya", d: "Widget yoki Page ichida ikkala feature ni slot/prop orqali birlashtiring." },
          { t: "2. Bitta feature ga birlashtirish", d: "Agar ular bir-birsiz yashay olmasa — demak ular aslida bitta amal." },
          { t: "3. Mantiqni pastga tushirish", d: "Umumiy hisob-kitobni entities yoki shared/lib ga ko'chiring." }
        ];

        solutions.forEach((sol, i) => {
          const sy = 360 + i * 160;
          ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(210, sy, 700, 130, 12); ctx.fill();
          ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          text(sol.t, 235, sy + 35, { size: 18, weight: 700, color: C.ink });
          text(sol.d, 235, sy + 80, { size: 15, weight: 500, color: C.soft });
        });

        // Right: Ikki Entity bog'lanishi (@x)
        const kRight = eo(P(t, L('L9').s, 0.8));
        withA(kRight, () => {
          ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(970, 190, 770, 740, 16); ctx.fill();
          ctx.strokeStyle = C.purple; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
          pill("Ikki Entity bir-biriga ishora qilsa nima qilish kerak?", 1000, 230, C.purple, { size: 16 });

          text("FSD v2.1 rasmiy standarti: @x cross-importlar!", 1000, 290, { size: 18, weight: 700, color: C.purple });

          // Terminal / Code box
          ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(1000, 340, 710, 190, 12); ctx.fill();
          ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          text("// entities/order/@x/user.ts", 1025, 385, { size: 15, fam: MONO, color: '#94a3b8' });
          text("export type { OrderSummary } from '../model/types'", 1025, 425, { size: 15, fam: MONO, color: '#38bdf8' });
          text("// Faqat entities qatlamida va @x prefiksi bilan ruxsat etiladi!", 1025, 480, { size: 14, fam: MONO, color: '#fbbf24' });

          const entPoints = [
            "• @x — slice'lararo aloqani oshkora va qat'iy nazoratda ushlaydi.",
            "• Agar bog'liqlik juda kuchli bo'lsa — slice'larni birlashtirish yaxshiroq.",
            "• Slice'lar parallel yashaydi, hech qachon ichma-ich joylashmaydi."
          ];
          entPoints.forEach((ep, idx) => {
            text(ep, 1000, 580 + idx * 60, { size: 16.5, weight: 600, color: C.ink });
          });
        });
      });
    }

    // SCENE 5: STEIGER VA ASBOBLAR FAQ (S.steiger_va_asboblar_faq.s - S.frameworklar_faq.s)
    else if (t < S.frameworklar_faq.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("4-GURUH: STEIGER, ESLINT VA BARREL FAYLLAR", 180, 80, C.cyan, { size: 26 });

      const kAsb = eo(P(t, S.steiger_va_asboblar_faq.s + 0.3, 0.8));
      withA(kAsb, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const toolFaqs = [
          {
            q: "Steiger importlarni 'no references' deydi?",
            a: "Sababi: tsconfig.json dagi paths noto'g'ri sozlangan. Steiger importlarni aynan tsconfig paths orqali aniqlaydi.",
            col: C.amber,
            tag: "Konfiguratsiya"
          },
          {
            q: "Barrel fayllar (index.ts) ilovani sekinlashtiradimi?",
            a: "Katta loyihada ha. Yechim: shared/ui da bitta ulkan index.ts emas, balki button/index.ts kabi komponent darajasida index qilinadi.",
            col: C.blue,
            tag: "Unumdorlik"
          },
          {
            q: "src/assets yoki src/tests ni Steiger tekshiradimi?",
            a: "Yo'q! Qatlamdan tashqari papkalar tekshirilmaydi. Shuning uchun biznes kodi bunday papkalarga adashib tushmasligi shart.",
            col: C.purple,
            tag: "Chegara qoidasi"
          },
          {
            q: "IDE da darhol xatoni ko'rish uchun nima kerak?",
            a: "ESLint da eslint-plugin-boundaries yoki no-restricted-imports qoidalarini yoqing — xato real vaqtda tagiga chiziladi.",
            col: C.green,
            tag: "IDE Integratsiyasi"
          }
        ];

        toolFaqs.forEach((tf, idx) => {
          const colIdx = idx % 2;
          const rowIdx = Math.floor(idx / 2);
          const bx = 180 + colIdx * 800;
          const by = 190 + rowIdx * 370;

          ctx.save();
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath(); ctx.roundRect(bx, by, 760, 340, 16); ctx.fill();
          ctx.strokeStyle = tf.col;
          ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();

          pill("❓ " + tf.q, bx + 30, by + 40, tf.col, { size: 16 });
          pill(tf.tag, bx + 730, by + 40, C.soft, { size: 13, align: 'right' });

          ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(bx + 25, by + 105, 710, 205, 12); ctx.fill();
          ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          text("Yechim:", bx + 45, by + 145, { size: 15, weight: 700, color: C.soft });
          wrapText(tf.a, bx + 45, by + 185, 640, 26, { size: 15.5, weight: 600, color: C.ink });
        });
      });
    }

    // SCENE 6: FRAMEWORKLAR FAQ (S.frameworklar_faq.s - S.xulosa.s)
    else if (t < S.xulosa.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("5-GURUH: FRAMEWORKLAR VA AUTO-IMPORTLAR", 180, 80, C.cyan, { size: 26 });

      const kFw = eo(P(t, S.frameworklar_faq.s + 0.3, 0.8));
      withA(kFw, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const fwItems = [
          {
            fw: "Next.js (App Router)",
            point: "app/ va pages/ to'qnashuvi",
            ans: "Ildizdagi app/ faqat re-export qiladi, haqiqiy FSD kodi src/_app va src/_pages da saqlanadi. Next 16 da middleware ildizdagi proxy.ts ga aylandi.",
            col: C.blue
          },
          {
            fw: "Nuxt 4",
            point: "app/ qobig'i va FSD",
            ans: "Nuxt ning app/ papkasi qobiq bo'lib xizmat qiladi. Barcha FSD qatlamlari src/ ichida yashaydi va @ aliyasi src ga yo'naltiriladi.",
            col: C.green
          },
          {
            fw: "Vue va Pinia",
            point: "stores/ va composables/ papkalari",
            ans: "FSD da stores/ yoki composables/ papkalari taqiqlanadi! Holat va keshlar slice ichidagi model/ segmentiga joylashadi.",
            col: C.amber
          },
          {
            fw: "Auto-importlar (Nuxt / Vue)",
            point: "Unplugin va chegaralar xavfi",
            ans: "Komponentlar uchun auto-import ishlatmang! Importlar yashirin bo'lsa, qatlam chegaralari buzilishi linterda ko'rinmay qoladi.",
            col: C.red
          }
        ];

        fwItems.forEach((fi, idx) => {
          const colIdx = idx % 2;
          const rowIdx = Math.floor(idx / 2);
          const bx = 180 + colIdx * 800;
          const by = 190 + rowIdx * 370;

          ctx.save();
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath(); ctx.roundRect(bx, by, 760, 340, 16); ctx.fill();
          ctx.strokeStyle = fi.col;
          ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();

          pill(fi.fw, bx + 30, by + 40, fi.col, { size: 16 });
          text("⚠️ " + fi.point, bx + 260, by + 40, { size: 17, weight: 700, color: C.ink });

          ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(bx + 25, by + 95, 710, 215, 12); ctx.fill();
          ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          text("Rasmiy Tavsiya:", bx + 45, by + 135, { size: 15, weight: 700, color: C.soft });
          wrapText(fi.ans, bx + 45, by + 180, 640, 26, { size: 15.5, weight: 600, color: C.ink });
        });
      });
    }

    // SCENE 7: XULOSA (S.xulosa.s - TM.end)
    else {
      drawTower(t, { alpha: 1, showLabels: true });
      pill("XULOSA: DOGMA EMAS, ANIQLIK VA BARQARORLIK", SW / 2, 80, C.cyan, { size: 28, align: 'center' });

      const kSum = eo(P(t, S.xulosa.s + 0.3, 0.8));
      withA(kSum, () => {
        const cards = [
          {
            title: "Kelishuv Standarti",
            desc: "FSD qoidalari qotib qolgan dogma emas, balki jamoaviy barqarorlik kelishuvi",
            col: C.green,
            x: 240,
            y: 750
          },
          {
            title: "Chegaralar Himoyasi",
            desc: "Slot, prop, @x va public API yordamida qatlamlar doimo toza saqlanadi",
            col: C.blue,
            x: 740,
            y: 750
          },
          {
            title: "Barcha Steklarga Mos",
            desc: "React, Next, Vue, Nuxt va Angular bilan to'liq tekshirilgan va moslashuvchan",
            col: C.purple,
            x: 1240,
            y: 750
          }
        ];

        cards.forEach((c) => {
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 14;
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(c.x, c.y, 440, 120, 16); ctx.fill();
          ctx.strokeStyle = c.col; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();

          pill(c.title, c.x + 25, c.y + 35, c.col, { size: 16 });
          text(c.desc, c.x + 25, c.y + 85, { size: 14, weight: 600, color: C.ink });
        });
      });

      const kNext = eo(P(t, L('L15').s, 0.8));
      withA(kNext, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 470, SH - 140, 940, 75, 16); ctx.fill();
        ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Keyingi bob: 40 — FSD Yakuniy Konspekti va To'liq Shpargalkasi (Cheat Sheet)", SW / 2, SH - 103, { size: 22, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // Pastki progress bar
    const prg = clamp(t / TM.end);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, SH - 6, SW, 6);
    ctx.fillStyle = C.cyan; ctx.fillRect(0, SH - 6, SW * prg, 6);
  }

  window.draw = draw;
  window.render = draw;
  window.seekAnim = (t) => draw(t);
  window.DURATION = TM.end;
  window.TOTAL_DURATION = TM.end;

  window.renderPoster = () => {
    draw(0.001);
    ctx.globalAlpha = 1;
    cam = { tx: 620, ty: -40, z: 0.78 };
    sky(3);
    ground(1);
    drawTower(10, { hlFloor: 4, lift: [0, 0, 0, 0, 0, 0], descLabels: false });
    text('FSD', 1150, 360, { size: 170, weight: 800, color: C.cyan });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('39-bob · tez-tez beriladigan savollar', 1158, 545, { size: 34, color: C.soft });
  };
})();
