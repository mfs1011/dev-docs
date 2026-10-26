// FSD 38-bob videosi: "Code review checklist" — Pull requestlarda FSD tekshiruvi
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
    { id: 'shared', col: '#94a3b8', uz: 'shared/: faqat umumiy texnik kod' },
    { id: 'entities', col: '#fb7185', uz: 'entities/: biznes modellari (ot so\'zlar)' },
    { id: 'features', col: '#fbbf24', uz: 'features/: foydalanuvchi harakatlari (fe\'l)' },
    { id: 'widgets', col: '#34d399', uz: 'widgets/: ko\'p marta ishlatiladigan bloklar' },
    { id: 'pages', col: '#60a5fa', uz: 'pages/: sahifalar va lokal bloklar' },
    { id: 'app', col: '#a78bfa', uz: 'app/: router va global konfiguratsiya' },
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
      [S.avtomatik_darvoza.s, [320, 10, 0.95]],
      [S.joylashuv_va_chegaralar.s, [360, 20, 0.92]],
      [S.public_api_va_nomlash.s, [380, 25, 0.9]],
      [S.pr_shabloni_va_adr.s, [360, 20, 0.92]],
      [S.tipik_xatolar.s, [400, 30, 0.9]],
      [S.xulosa.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.avtomatik_darvoza.s)
    if (t < S.avtomatik_darvoza.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill("38-BOB: FSD CODE REVIEW CHECKLIST", SW / 2, 80, C.cyan, { size: 28, align: 'center' });
        text("Pull requestlarni ko'rib chiqishda arxitektura tozaligini ta'minlash", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating badges
      const kBadges = eo(P(t, L('L1').s + 2.5, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: 'Avtomatika vs Inson', x: 260, y: 320, col: C.blue },
          { s: 'Qatlam joylashuvi', x: 280, y: 440, col: C.green },
          { s: 'Kompozitsiya (Slot/Prop)', x: 270, y: 560, col: C.purple },
          { s: 'PR Shabloni va ADR', x: 1420, y: 340, col: C.amber },
          { s: 'Linterdan keyingi ko\'rik', x: 1440, y: 460, col: C.teal }
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
        text("Stayger mexanikani tekshiradi, lekin to'g'ri qatlamni faqat inson baholaydi!", SW / 2, SH - 103, { size: 22, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: AVTOMATIK DARVOZA (S.avtomatik_darvoza.s - S.joylashuv_va_chegaralar.s)
    else if (t < S.joylashuv_va_chegaralar.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("1-BOSQICH: AVTOMATIK DARVOZA (CI/CD GATES)", 180, 80, C.cyan, { size: 26 });

      const kGate = eo(P(t, S.avtomatik_darvoza.s + 0.3, 0.8));
      withA(kGate, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: 4 ta Avtomatik Chek (CI buyruqlari)
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 760, 740, 16); ctx.fill();
        ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("CI/CD Avtomatika Tekshiruvlari", 210, 225, C.green, { size: 16 });

        const gates = [
          { cmd: 'npx steiger src', desc: 'FSD qatlamlari, taqiqlangan importlar, public API — 0 xato', col: C.green },
          { cmd: 'npm run lint (ESLint / oxlint)', desc: 'Sintaksis, import tartibi, unused vars tozaligi', col: C.blue },
          { cmd: 'npm run typecheck && build', desc: 'TypeScript turlari to\'liq mos, build xatosiz yig\'iladi', col: C.purple },
          { cmd: 'npm run test (Vitest / Playwright)', desc: 'Barcha unit, komponent va integratsion testlar yashil', col: C.amber }
        ];

        gates.forEach((g, i) => {
          const gy = 290 + i * 150;
          ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(210, gy, 700, 125, 12); ctx.fill();
          ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          // Green check circle
          ctx.save(); ctx.fillStyle = '#dcfce7'; ctx.beginPath(); ctx.arc(245, gy + 38, 20, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = C.green; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
          text("✓", 245, gy + 39, { size: 20, weight: 800, color: C.green, align: 'center' });

          text(g.cmd, 280, gy + 38, { size: 17, fam: MONO, weight: 700, color: C.ink });
          text(g.desc, 280, gy + 82, { size: 14.5, weight: 500, color: C.soft });
        });

        // Right: Qat'iy Qoida (Inson vaqtini asrash)
        const kRight = eo(P(t, L('L4').s, 0.8));
        withA(kRight, () => {
          ctx.save(); ctx.fillStyle = '#fff5f5'; ctx.beginPath(); ctx.roundRect(970, 190, 770, 740, 16); ctx.fill();
          ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

          pill("⛔ Oltin Qoida: Qizil bo'lsa ko'rmang!", 1000, 225, C.red, { size: 16 });

          text("Agar avtomatik tekshiruvlar o'tmagan bo'lsa:", 1000, 290, { size: 20, weight: 700, color: C.ink });

          const points = [
            "• CI/CD dagi xatolar muallif tomonidan mustaqil tuzatiladi.",
            "• Linter ushlaydigan importlar yoki sintaksisni muhokama qilish",
            "  review qiluvchining vaqtini bekorga o'g'irlaydi.",
            "• Faqat barcha 'check'lar yashil bo'lgach, odam ko'rigi boshlanadi."
          ];
          points.forEach((pt, idx) => {
            text(pt, 1000, 355 + idx * 45, { size: 16.5, weight: 600, color: C.ink });
          });

          // Insight box
          ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(1000, 580, 710, 300, 14); ctx.fill();
          ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

          pill("Inson Review'sining Asl Maqsadi", 1030, 620, C.blue, { size: 15 });
          text("1. Yangi kod to'g'ri qatlamga qo'yilganmi?", 1030, 680, { size: 17, weight: 700, color: C.ink });
          text("2. Nomlar biznes domeniga mosmi yoki texnikmi?", 1030, 735, { size: 17, weight: 700, color: C.ink });
          text("3. Chegaralar slot va kompozitsiya bilan saqlanganmi?", 1030, 790, { size: 17, weight: 700, color: C.ink });
          text("4. Public API da ortiqcha narsalar chiqib ketmaganmi?", 1030, 845, { size: 17, weight: 700, color: C.ink });
        });
      });
    }

    // SCENE 3: JOYLASHUV VA CHEGARALAR (S.joylashuv_va_chegaralar.s - S.public_api_va_nomlash.s)
    else if (t < S.public_api_va_nomlash.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("2-BOSQICH: JOYLASHUV VA QATLAM CHEGARALARI", 180, 80, C.cyan, { size: 26 });

      const kLoc = eo(P(t, S.joylashuv_va_chegaralar.s + 0.3, 0.8));
      withA(kLoc, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const questions = [
          {
            q: "1. Yangi kod eng LOKAL joydami?",
            crit: "Bitta joyda ishlatilsa — sahifa/slice ichida qoladi. Oldindan 'kelajak uchun' pastga tushirish taqiqlanadi.",
            col: C.blue,
            tStart: L('L5').s
          },
          {
            q: "2. Pastga tushirish uchun 2+ foydalanuvchi bormi?",
            crit: "Kodni entities yoki shared ga chiqarish uchun hozirning o'zida ikkita alohida sahifa uni so'rashi shart.",
            col: C.green,
            tStart: L('L5').s + 4.0
          },
          {
            q: "3. Fe'lmi yoki Ot? (features vs entities)",
            crit: "Foydalanuvchi harakati (add-to-cart, filter) → feature; Biznes modeli (product, order) → entity.",
            col: C.amber,
            tStart: L('L6').s
          },
          {
            q: "4. Kompozitsiya chegaralari buzilmaganmi?",
            crit: "Entity hech qachon Feature ni import qilmaydi! Tugma va amallar kartaga slot yoki prop orqali uzatiladi.",
            col: C.purple,
            tStart: L('L7').s
          }
        ];

        questions.forEach((qu, idx) => {
          const colIdx = idx % 2;
          const rowIdx = Math.floor(idx / 2);
          const bx = 180 + colIdx * 800;
          const by = 190 + rowIdx * 370;
          const isAct = t >= qu.tStart;

          ctx.save();
          ctx.fillStyle = isAct ? '#f8fafc' : '#ffffff';
          ctx.beginPath(); ctx.roundRect(bx, by, 760, 340, 16); ctx.fill();
          ctx.strokeStyle = isAct ? qu.col : '#e2e8f0';
          ctx.lineWidth = isAct ? 2.5 : 1.5; ctx.stroke();
          ctx.restore();

          pill(qu.q, bx + 30, by + 40, qu.col, { size: 17 });

          text(qu.crit, bx + 30, by + 110, { size: 16.5, weight: 600, color: C.ink });

          // Practical checklist badge
          ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(bx + 25, by + 195, 710, 115, 12); ctx.fill();
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          if (idx === 0) {
            text("Misol: CatalogFilters faqat katalogda bo'lsa — pages/catalog/ui/ da!", bx + 45, by + 252, { size: 15.5, fam: MONO, color: C.soft, weight: 600 });
          } else if (idx === 1) {
            text("Misol: ProductCard katalog va qidiruvda kerak bo'lgach — entities/product!", bx + 45, by + 252, { size: 15, fam: MONO, color: C.green, weight: 600 });
          } else if (idx === 2) {
            text("Misol: like-button — feature; post-model — entity!", bx + 45, by + 252, { size: 16, fam: MONO, color: C.amber, weight: 600 });
          } else {
            text("Misol: <ProductCard actions={<AddToCartButton />} />", bx + 45, by + 252, { size: 16, fam: MONO, color: C.purple, weight: 700 });
          }
        });
      });
    }

    // SCENE 4: PUBLIC API VA NOMLASH (S.public_api_va_nomlash.s - S.pr_shabloni_va_adr.s)
    else if (t < S.pr_shabloni_va_adr.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("3-BOSQICH: PUBLIC API VA DOMEN NOMLARI", 180, 80, C.cyan, { size: 26 });

      const kApi = eo(P(t, S.public_api_va_nomlash.s + 0.3, 0.8));
      withA(kApi, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left Panel: Public API Tekshiruvi
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 760, 740, 16); ctx.fill();
        ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
        pill("Public API (index.ts) Qoidalari", 210, 230, C.blue, { size: 18 });

        const apiChecks = [
          { t: "Faqat tashqariga kerak narsalar", d: "Ichki yordamchi funksiyalar index.ts da eksport qilinmasligi shart" },
          { t: "export * qat'iyan taqiqlanadi", d: "Har bir eksport aniq nomlanadi: export { ProductCard } from './ui/...'" },
          { t: "Server kod mijoz index'ida emas", d: "Next.js/Nuxt da server kod faqat index.server.ts orqali chiqadi" },
          { t: "Public API o'zgarishi — ataylabmi?", d: "Eski nom o'zgarsa, uni ishlatuvchi barcha joylar yangilangan bo'lishi shart" }
        ];

        apiChecks.forEach((ac, i) => {
          const y = 300 + i * 145;
          ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(230, y + 10, 8, 0, Math.PI * 2); ctx.fill();
          text(ac.t, 255, y + 10, { size: 19, weight: 700, color: C.ink });
          text(ac.d, 255, y + 45, { size: 14.5, weight: 500, color: C.soft });
        });

        // Right Panel: Domen Nomlash
        const kRight = eo(P(t, L('L9').s, 0.8));
        withA(kRight, () => {
          ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(970, 190, 770, 740, 16); ctx.fill();
          ctx.strokeStyle = C.green; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
          pill("Domen Bo'yicha Nomlash Qoidalari", 1000, 230, C.green, { size: 18 });

          const nameRows = [
            { bad: '❌ forms/', good: '✅ features/add-to-cart/', desc: 'Texnik nom emas, biznes maqsadi' },
            { bad: '❌ modals/', good: '✅ features/auth-dialog/', desc: 'UI turi emas, domen tili' },
            { bad: '❌ utils.ts', good: '✅ delivery-calculator.ts', desc: 'Domenli fayl nomi' },
            { bad: '❌ types.ts', good: '✅ order.dto.ts', desc: 'Aniq DTO va ma\'lumot turi' }
          ];

          nameRows.forEach((nr, i) => {
            const ny = 300 + i * 145;
            ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(1000, ny - 15, 710, 115, 12); ctx.fill();
            ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

            text(nr.bad, 1025, ny + 20, { size: 17, fam: MONO, weight: 700, color: C.red });
            text(nr.good, 1260, ny + 20, { size: 17, fam: MONO, weight: 700, color: C.green });
            text(nr.desc, 1025, ny + 65, { size: 14.5, weight: 500, color: C.soft });
          });
        });
      });
    }

    // SCENE 5: PR SHABLONI VA ADR (S.pr_shabloni_va_adr.s - S.tipik_xatolar.s)
    else if (t < S.tipik_xatolar.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("PULL REQUEST SHABLONI VA ADR KELISHUVLARI", 180, 80, C.cyan, { size: 26 });

      const kPr = eo(P(t, S.pr_shabloni_va_adr.s + 0.3, 0.8));
      withA(kPr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: PR Shabloni
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(180, 190, 760, 740, 16); ctx.fill();
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill(".github/pull_request_template.md", 210, 230, C.purple, { size: 16, mono: true });

        const prLines = [
          { s: '## FSD Arxitekturasi Tekshiruvi', col: '#38bdf8' },
          { s: '', col: '' },
          { s: '- [ ] Yangi slice\'lar: ...', col: '#f8fafc' },
          { s: '      (Nega aynan shu qatlamga qo\'yildi?)', col: '#94a3b8' },
          { s: '', col: '' },
          { s: '- [ ] Pastga tushirilgan kod: ...', col: '#f8fafc' },
          { s: '      (Qaysi 2+ ta sahifa/slice ishlatadi?)', col: '#94a3b8' },
          { s: '', col: '' },
          { s: '- [ ] Cross-import / @x / Steiger istisnosi:', col: '#f8fafc' },
          { s: '      [ ] Yo\'q   [ ] Bor — sababi: ...', col: '#fbbf24' },
          { s: '', col: '' },
          { s: '- [ ] Public API o\'zgarishi:', col: '#f8fafc' },
          { s: '      [ ] Yo\'q   [ ] Bor — barcha joylar yangilandi', col: '#4ade80' }
        ];

        prLines.forEach((pl, i) => {
          if (pl.s) text(pl.s, 210, 285 + i * 36, { size: 15, fam: MONO, color: pl.col, weight: 600 });
        });

        // Right: ADR (Architecture Decision Record)
        const kRight = eo(P(t, L('L11').s, 0.8));
        withA(kRight, () => {
          ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(970, 190, 770, 740, 16); ctx.fill();
          ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
          pill("ADR: Arxitektura Qarorlari Yozuvi", 1000, 230, C.amber, { size: 18 });

          const adrPoints = [
            {
              title: "Har PR da qayta tortishmaslik",
              desc: "Bahsli qarorlar (masalan, auth token qayerda turadi) jamoada bir marta muhokama qilinadi va ADR ga yoziladi."
            },
            {
              title: "docs/adr/003-auth-placement.md",
              desc: "Loyihada qabul qilingan har bir arxitektura kelishuvi raqamlangan fayl sifatida repo ichida saqlanadi."
            },
            {
              title: "Review paytida ADR ga havola berish",
              desc: "Review paytida uzoq falsafiy bahslar o'rniga tayyor ADR havolasi beriladi va vaqt tejaladi."
            }
          ];

          adrPoints.forEach((ap, idx) => {
            const ay = 300 + idx * 165;
            ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(1000, ay, 710, 135, 12); ctx.fill();
            ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

            pill(ap.title, 1025, ay + 35, C.ink, { size: 16 });
            text(ap.desc, 1025, ay + 85, { size: 15, weight: 500, color: C.soft });
          });

          // Bottom alert
          ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(1000, 800, 710, 95, 12); ctx.fill();
          ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
          text("Natija: PR ko'rigi 10 daqiqadan oshmaydi!", 1030, 848, { size: 18, weight: 700, color: C.blue });
        });
      });
    }

    // SCENE 6: TIPIK XATOLAR (S.tipik_xatolar.s - S.xulosa.s)
    else if (t < S.xulosa.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("KOD KO'RIGIDAGI TIPIK XATOLAR", 180, 80, C.cyan, { size: 26 });

      const kErr = eo(P(t, S.tipik_xatolar.s + 0.3, 0.8));
      withA(kErr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const mistakes = [
          {
            title: '1. Linter ushlaydigan narsani muhokama qilish',
            bad: 'Import yo\'li, format yoki sintaksis bo\'yicha izoh yozish',
            why: 'Dasturchilar vaqti bekorga sarflanadi, diqqat chalg\'iydi',
            good: 'To\'g\'ri: Avval CI/CD avtomatik darvozasini kutish',
            col: C.red,
            tStart: L('L12').s
          },
          {
            title: '2. "Keyin to\'g\'rilaymiz" deb noto\'g\'ri qatlamni o\'tkazish',
            bad: 'Vaqt yo\'qligi bahonasida noto\'g\'ri importni merge qilish',
            why: 'Boshqalar unga bog\'lanadi, keyin ko\'chirish 10 barobar qiyin bo\'ladi',
            good: 'To\'g\'ri: Arxitekturani darhol shu PR ning o\'zida to\'g\'rilash',
            col: C.amber,
            tStart: L('L12').s + 4.0
          },
          {
            title: '3. Har bir PR da noldan falsafiy bahslashish',
            bad: 'Kelishilgan qoidalar bo\'yicha har safar qayta tortishuv',
            why: 'Jamoada charchoq paydo bo\'ladi, relizlar kechikadi',
            good: 'To\'g\'ri: Qarorni ADR ga yozib, faqat unga tayanish',
            col: C.purple,
            tStart: L('L13').s
          },
          {
            title: '4. Steiger istisnolariga ko\'z yumish',
            bad: 'ignore-pattern yoki // eslint-disable qo\'shib merge qilish',
            why: 'Arxitektura eroziyasi boshlanadi va eski xaos qaytadi',
            good: 'To\'g\'ri: Istisno sababini jiddiy muhokama qilib yechish',
            col: C.blue,
            tStart: L('L13').s + 3.0
          }
        ];

        mistakes.forEach((m, idx) => {
          const colIdx = idx % 2;
          const rowIdx = Math.floor(idx / 2);
          const bx = 180 + colIdx * 800;
          const by = 190 + rowIdx * 370;
          const isAct = t >= m.tStart;

          ctx.save();
          ctx.fillStyle = isAct ? '#fff5f5' : '#ffffff';
          ctx.beginPath(); ctx.roundRect(bx, by, 760, 340, 16); ctx.fill();
          ctx.strokeStyle = isAct ? m.col : '#e2e8f0';
          ctx.lineWidth = isAct ? 2.5 : 1.5; ctx.stroke();
          ctx.restore();

          pill(m.title, bx + 30, by + 40, m.col, { size: 16 });

          text("❌ Xato: " + m.bad, bx + 30, by + 105, { size: 16, weight: 700, color: C.red });
          text("⚠️ Oqibat: " + m.why, bx + 30, by + 160, { size: 15, weight: 600, color: C.ink });

          ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(bx + 25, by + 215, 710, 95, 12); ctx.fill();
          ctx.strokeStyle = '#86efac'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          text("✅ " + m.good, bx + 45, by + 262, { size: 16, weight: 700, color: C.green });
        });
      });
    }

    // SCENE 7: XULOSA (S.xulosa.s - TM.end)
    else {
      drawTower(t, { alpha: 1, showLabels: true });
      pill("XULOSA: HUSHYOR VA MADANIYATLI KOD KO'RIGI", SW / 2, 80, C.cyan, { size: 28, align: 'center' });

      const kSum = eo(P(t, S.xulosa.s + 0.3, 0.8));
      withA(kSum, () => {
        const cards = [
          {
            title: "Avtomatika Darvozasi",
            desc: "Steiger, ESLint va testlar to'liq yashil bo'lgach ko'rik boshlanadi",
            col: C.green,
            x: 240,
            y: 750
          },
          {
            title: "Domen Tili va Chegaralar",
            desc: "Kod eng lokal joyda, entity feature ga bog'lanmagan bo'lishi shart",
            col: C.blue,
            x: 740,
            y: 750
          },
          {
            title: "ADR Intizomi",
            desc: "Bahslar ADR da saqlanadi va review vaqti 10 daqiqadan oshmaydi",
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
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 450, SH - 140, 900, 75, 16); ctx.fill();
        ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Keyingi bob: 39 — FSD bo'yicha tez-tez beriladigan savollar (FAQ)", SW / 2, SH - 103, { size: 23, weight: 700, color: C.ink, align: 'center' });
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
    text('38-bob · code review checklist', 1158, 545, { size: 34, color: C.soft });
  };
})();
