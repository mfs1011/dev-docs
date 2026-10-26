// FSD 26-bob videosi: "Marshrutlash va lazy loading" — app/routes, shared/routes, guardlar va lazy public API
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
    teal: '#0d9488'
  };

  // Qatlamlar (pastdan yuqoriga)
  const LAYERS = [
    { id: 'shared', col: '#94a3b8', uz: 'shared/routes: URL konstantalari' },
    { id: 'entities', col: '#fb7185', uz: 'session: sessiya holati' },
    { id: 'features', col: '#fbbf24', uz: 'amallar va formalar' },
    { id: 'widgets', col: '#34d399', uz: 'navigatsiya panellari' },
    { id: 'pages', col: '#60a5fa', uz: 'lazy chunk sahifalar' },
    { id: 'app', col: '#a78bfa', uz: 'app/routes: router konfiguratsiyasi' },
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
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(px + 12, py - 20, desc ? 330 : 160, 40, 8); ctx.fill();
      ctx.strokeStyle = shade(LAYERS[i].col, -0.2); ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      ctx.fillStyle = LAYERS[i].col; ctx.beginPath(); ctx.roundRect(px + 16, py - 16, 8, 32, 4); ctx.fill();
      text(LAYERS[i].id, px + 32, py + 1, { size: 20, weight: 700, color: C.ink });
      if (desc) text(LAYERS[i].uz, px + 126, py + 1, { size: 13, weight: 500, color: C.soft });
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

  function check(x, y, k, s = 1) {
    withA(k, () => {
      ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 4 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(x - 12 * s, y); ctx.lineTo(x - 3 * s, y + 9 * s); ctx.lineTo(x + 14 * s, y - 8 * s); ctx.stroke();
      ctx.restore();
    });
  }

  function crossB(x, y, k, s = 1) {
    withA(k, () => {
      ctx.save(); ctx.fillStyle = '#fee2e2'; ctx.beginPath(); ctx.arc(x, y, 16 * s, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.red; ctx.lineWidth = 3.5 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - 7 * s, y - 7 * s); ctx.lineTo(x + 7 * s, y + 7 * s);
      ctx.moveTo(x + 7 * s, y - 7 * s); ctx.lineTo(x - 7 * s, y + 7 * s); ctx.stroke();
      ctx.restore();
    });
  }

  // ---------- Sahna chizish ----------
  function draw(t) {
    ctx.clearRect(0, 0, SW, SH);
    sky(t);

    const S = TM.scenes;
    const camFrames = [
      [0, [90, -30, 1]],
      [S.app_va_shared_routes.s, [320, 10, 0.95]],
      [S.guard_va_auth.s, [360, 20, 0.92]],
      [S.lazy_loading_va_public_api.s, [360, 20, 0.92]],
      [S.kod_namunalari.s, [400, 30, 0.9]],
      [S.tipik_xatolar.s, [400, 30, 0.9]],
      [S.xulosa.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.app_va_shared_routes.s)
    if (t < S.app_va_shared_routes.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill('26-BOB: MARSHRUTLASH VA LAZY LOADING', SW / 2, 80, C.blue, { size: 28, align: 'center' });
        text("app/routes konfiguratsiyasi, shared/routes va sahifalar public API'si", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating badges
      const kBadges = eo(P(t, L('L1').s + 4, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: 'app/routes/router.tsx', x: 260, y: 320, col: C.purple },
          { s: 'shared/routes/index.ts', x: 300, y: 440, col: '#475569' },
          { s: 'requireAuth() guard', x: 270, y: 560, col: C.amber },
          { s: 'lazy(() => import(...))', x: 1560, y: 340, col: C.blue },
          { s: 'Chunk: [pages-checkout.js]', x: 1510, y: 460, col: C.green }
        ];
        badges.forEach((b, idx) => {
          const bob = Math.sin(t * 2.5 + idx) * 8;
          pill(b.s, b.x, b.y + bob, b.col, { size: 20, mono: true });
        });
      });

      const k2 = eo(P(t, L('L2').s, 0.8));
      withA(k2, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 440, SH - 140, 880, 75, 16); ctx.fill();
        ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Ikki markaz: app/routes (daraxt) va shared/routes (konstantalar)", SW / 2, SH - 103, { size: 23, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: APP VA SHARED ROUTES (S.app_va_shared_routes.s - S.guard_va_auth.s)
    else if (t < S.guard_va_auth.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("IKKI ASOSIY MARKAZ: APP/ROUTES VA SHARED/ROUTES", 180, 80, C.blue, { size: 26 });

      const kSplit = eo(P(t, S.app_va_shared_routes.s + 0.3, 0.8));
      withA(kSplit, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Top Box: app/routes (Router Konfiguratsiyasi)
        const kTop = eo(P(t, L('L3').s, 0.8));
        withA(kTop, () => {
          ctx.save(); ctx.fillStyle = '#f5f3ff'; ctx.beginPath(); ctx.roundRect(180, 180, 1560, 310, 16); ctx.fill();
          ctx.strokeStyle = C.purple; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

          pill('app/routes/router.tsx — Butun Ilova Daraxti', 220, 230, C.purple, { size: 22, mono: true });
          text("• Hamma sahifalarni (pages/*), layoutlarni (app/layouts) va guardlarni (shared/auth) biladi", 220, 290, { size: 20, weight: 600, color: C.ink });
          text("• Qaysi URL ga qaysi sahifa komponenti ochilishi va kimlar ruxsat etilganini belgilaydi", 220, 335, { size: 19, weight: 500, color: C.soft });
          text("• Faqat app qatlami yuqorida turgani sababli barcha sahifalarni import qila oladi", 220, 380, { size: 19, weight: 500, color: C.soft });

          pill("✓ Yagona markazlashtirilgan router", 220, 440, C.green, { size: 18 });
        });

        // Middle Warning: Quyi qatlamlar app/routes dan import qila olmaydi!
        const kMid = eo(P(t, L('L4').s, 0.8));
        withA(kMid, () => {
          ctx.save(); ctx.fillStyle = '#fef2f2'; ctx.beginPath(); ctx.roundRect(180, 510, 1560, 75, 12); ctx.fill();
          ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

          crossB(220, 547, 1, 1.0);
          text("Taqiq: widgets, features yoki entities qatlamlari app/routes dan havola URL'larini import qila olmaydi!", 255, 547, { size: 18, weight: 700, color: C.red });
        });

        // Bottom Box: shared/routes (URL Konstantalari)
        const kBot = eo(P(t, L('L5').s, 0.8));
        withA(kBot, () => {
          ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 605, 1560, 320, 16); ctx.fill();
          ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

          pill('shared/routes/index.ts — Umumiy Manzillar Xaritasi', 220, 655, '#475569', { size: 22, mono: true });
          text("• URL satrlari va yasovchi funksiyalar poydevor qatlamida yashaydi:", 220, 715, { size: 20, weight: 600, color: C.ink });

          const codeSnippets = [
            `export const ROUTES = {`,
            `  home: '/', catalog: '/catalog', product: (id: string) => '/products/' + id, checkout: '/checkout'`,
            `}`
          ];
          codeSnippets.forEach((cs, idx) => {
            text(cs, 240, 765 + idx * 32, { size: 18, fam: MONO, weight: 600, color: '#0f172a' });
          });

          pill("✓ Barcha qatlamlar havola (<Link to={ROUTES.catalog}>) yasash uchun shared dan foydalanadi", 220, 885, C.teal, { size: 17 });
        });
      });
    }

    // SCENE 3: GUARD VA AUTH (S.guard_va_auth.s - S.lazy_loading_va_public_api.s)
    else if (t < S.lazy_loading_va_public_api.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("NAVIGATSIYA GUARDLARI VA SESSIYA HIMOYASI", 180, 80, C.amber, { size: 26 });

      const kGuard = eo(P(t, S.guard_va_auth.s + 0.3, 0.8));
      withA(kGuard, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Workflow Steps
        const steps = [
          {
            title: "1. Foydalanuvchi Himoyalangan Sahifaga O'tadi",
            desc: "Masalan: URL satrida /checkout manziliga so'rov",
            pillText: "URL: /checkout", pillCol: C.blue
          },
          {
            title: "2. Router Navigatsiya Guardini Ishga Tushiradi",
            desc: "Guard funksiyasi shared/auth yoki entities/session dan olinadi",
            pillText: "loader: requireAuth", pillCol: C.purple
          },
          {
            title: "3. Sessiya Mavjudligi Tekshiriladi",
            desc: "await getSession() orqali token yoki kuki tekshiruvi amalga oshadi",
            pillText: "if (!session) redirect(...)", pillCol: C.amber
          },
          {
            title: "4. Xavfsiz Qaytish URL'i (returnTo)",
            desc: "Avtorizatsiyadan o'tgach yana /checkout ga qaytarish uchun returnTo beriladi",
            pillText: "redirect('/sign-in?returnTo=/checkout')", pillCol: C.green
          }
        ];

        steps.forEach((st, idx) => {
          const y0 = 190 + idx * 165;
          const kSt = eo(P(t, L('L6').s + idx * 2.2, 0.7));
          withA(kSt, () => {
            ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, y0, 1560, 140, 16); ctx.fill();
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

            pill(st.pillText, 220, y0 + 45, st.pillCol, { size: 18, mono: true });
            text(st.title, 220, y0 + 100, { size: 21, weight: 700, color: C.ink });
            text(st.desc, 650, y0 + 45, { size: 19, weight: 500, color: C.soft });
          });
        });

        // Bottom alert
        const kNote = eo(P(t, L('L7').s + 4, 0.8));
        withA(kNote, () => {
          pill("🛡️ returnTo parametri faqat ichki yo'l ekanini tekshiring (Open Redirect zaifligi oldini olish)", 180, 885, '#dc2626', { size: 18 });
        });
      });
    }

    // SCENE 4: LAZY LOADING VA PUBLIC API (S.lazy_loading_va_public_api.s - S.kod_namunalari.s)
    else if (t < S.kod_namunalari.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("LAZY LOADING VA PUBLIC API INTIZOMI", 180, 80, C.teal, { size: 26 });

      const kLazy = eo(P(t, S.lazy_loading_va_public_api.s + 0.3, 0.8));
      withA(kLazy, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: ❌ Chuqur Import (Xato)
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.06)'; ctx.shadowBlur = 12;
        ctx.fillStyle = '#fef2f2'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 520, 16); ctx.fill();
        ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

        crossB(230, 245, 1, 1.2);
        text("❌ Chuqur Import (Public API Buzildi)", 270, 245, { size: 24, weight: 800, color: C.red });

        const badCode = [
          `// app/routes/router.tsx — XATO!`,
          `lazy: () =>`,
          `  import('@/pages/checkout/ui/CheckoutPage')`,
          ``,
          `• Slice ichki fayl tuzilmasiga to'g'ridan-to'g'ri bog'lanadi`,
          `• Public API (index.ts) butunlay chetlab o'tildi`,
          `• Steiger linteri tomonidan qat'iy to'xtatiladi`,
          `• Kelajakda refaktoring qilish imkonsizlashadi`
        ];
        badCode.forEach((bc, idx) => {
          text(bc, 220, 310 + idx * 42, {
            size: 17,
            fam: bc.startsWith('//') || bc.startsWith('lazy') || bc.startsWith('  import') ? MONO : UI,
            weight: 600,
            color: bc.startsWith('•') ? C.ink : '#dc2626'
          });
        });

        // Right: ✓ Public API orqali Lazy Import (To'g'ri)
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.06)'; ctx.shadowBlur = 12;
        ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 520, 16); ctx.fill();
        ctx.strokeStyle = '#86efac'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

        check(1010, 245, 1, 1.2);
        text("✓ Public API Orqali Lazy Import", 1050, 245, { size: 24, weight: 800, color: C.green });

        const goodCode = [
          `// app/routes/router.tsx — TO'G'RI!`,
          `lazy: async () => ({`,
          `  Component: (await import('@/pages/checkout')).CheckoutPage`,
          `})`,
          ``,
          `• Faqat pages/checkout public API'siga murojaat qiladi`,
          `• Sahifa mustaqil chunk (checkout.chunk.js) bo'lib ajraladi`,
          `• Public API ichki tuzilmani o'zgartirish erkinligini beradi`,
          `• Steiger qoidalariga 100% mos keladi`
        ];
        goodCode.forEach((gc, idx) => {
          text(gc, 1000, 310 + idx * 42, {
            size: 17,
            fam: gc.startsWith('//') || gc.startsWith('lazy') || gc.startsWith('  Component') || gc.startsWith('})') ? MONO : UI,
            weight: 600,
            color: gc.startsWith('•') ? C.ink : '#15803d'
          });
        });

        // Bottom: Chunk summary pill
        pill("⚡ Natija: Har bir sahifa alohida JS chunk fayli sifatida faqat ochilgandagina tarmoqdan yuklanadi", 180, 780, C.blue, { size: 19 });
        pill("Bosh sahifa: Eager (darhol)  |  Katalog, Savat, Sozlamalar: Lazy (on-demand)", 180, 850, '#475569', { size: 18 });
      });
    }

    // SCENE 5: KOD NAMUNALARI (S.kod_namunalari.s - S.tipik_xatolar.s)
    else if (t < S.tipik_xatolar.s) {
      drawTower(t, { alpha: 0.2, showLabels: false });
      pill("AMALIY KOD: REACT, VUE VA ANGULAR", 180, 80, C.blue, { size: 26 });

      const kCode = eo(P(t, S.kod_namunalari.s + 0.3, 0.8));
      withA(kCode, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: React Router code
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(180, 190, 720, 720, 16); ctx.fill(); ctx.restore();
        pill('React Router — Loader va Lazy', 220, 240, C.blue, { size: 19 });

        const reactLines = [
          `// app/routes/router.tsx`,
          `import { ROUTES } from '@/shared/routes'`,
          `import { requireAuth } from '@/shared/auth'`,
          ``,
          `export const router = createBrowserRouter([`,
          `  {`,
          `    path: ROUTES.checkout,`,
          `    loader: requireAuth,`,
          `    lazy: async () => {`,
          `      const m = await import('@/pages/checkout')`,
          `      return { Component: m.CheckoutPage }`,
          `    },`,
          `  },`,
          `])`
        ];
        reactLines.forEach((rl, idx) => {
          const isHl = rl.includes('ROUTES.checkout') || rl.includes('requireAuth') || rl.includes('@/pages/checkout');
          text(rl, 220, 290 + idx * 38, {
            size: 19,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#38bdf8' : rl.startsWith('//') ? '#94a3b8' : '#f8fafc'
          });
        });

        // Right: Vue & Angular
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(940, 190, 800, 720, 16); ctx.fill(); ctx.restore();
        pill('Vue Router & Angular Router', 980, 240, C.green, { size: 19 });

        const otherLines = [
          `// Vue Router (app/routes/router.ts)`,
          `{`,
          `  ...ROUTES.checkout,`,
          `  beforeEnter: requireAuth,`,
          `  component: () =>`,
          `    import('@/pages/checkout').then(m => m.CheckoutPage),`,
          `}`,
          ``,
          `// Angular Router (app/routes/app.routes.ts)`,
          `{`,
          `  path: 'checkout',`,
          `  canActivate: [requireAuth],`,
          `  loadComponent: () =>`,
          `    import('@/pages/checkout').then(m => m.CheckoutPage),`,
          `}`
        ];
        otherLines.forEach((ol, idx) => {
          const isHl = ol.includes('beforeEnter') || ol.includes('canActivate') || ol.includes('loadComponent');
          text(ol, 980, 290 + idx * 38, {
            size: 19,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#4ade80' : ol.startsWith('//') ? '#94a3b8' : '#f8fafc'
          });
        });
      });
    }

    // SCENE 6: TIPIK XATOLAR (S.tipik_xatolar.s - S.xulosa.s)
    else if (t < S.xulosa.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("MARSHRUTLASHDAGI TIPIK XATOLAR VA XAVFSIZLIK", 180, 80, C.red, { size: 26 });

      const kErr = eo(P(t, S.tipik_xatolar.s + 0.3, 0.8));
      withA(kErr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#fecaca'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const errors = [
          {
            title: "1. Public API ni chetlab o'tib chuqur ui import qilish",
            bad: "import('@/pages/checkout/ui/CheckoutPage') — ichki modullashtirishni buzadi va qaramlikni oshiradi.",
            fix: "✓ Faqat public API orqali import qiling: import('@/pages/checkout')"
          },
          {
            title: "2. URL satrlarini 50 ta alohida komponentda hardcode qilish",
            bad: "Agar URL marshruti o'zgarsa, butun kod bo'ylab o'nlab fayllarni qidirib tuzatish talab etiladi.",
            fix: "✓ Barcha URL konstantalari va generatorlarini shared/routes da saqlang"
          },
          {
            title: "3. Feature yoki widget'dan app/routes ga teskari import qilish",
            bad: "Quyi qatlamlar eng yuqori app qatlamini bilishi qat'iyan taqiqlangan (Steiger xatosi).",
            fix: "✓ Konstantalarni shared/routes ga tushiring va pastdan import qiling"
          },
          {
            title: "4. Frontend guard'ni yagona himoya devori deb o'ylash",
            bad: "Frontend kodini brauzerda chetlab o'tish juda oson. Guard faqat foydalanuvchi qulayligi uchun.",
            fix: "✓ Haqiqiy xavfsizlik va avtorizatsiya har doim backend API tomonidan tekshiriladi"
          }
        ];

        errors.forEach((err, idx) => {
          const kCard = eo(P(t, L('L13').s + idx * 2.8, 0.7));
          withA(kCard, () => {
            const y0 = 180 + idx * 175;
            ctx.save(); ctx.fillStyle = '#fef2f2'; ctx.beginPath(); ctx.roundRect(180, y0, 1560, 155, 14); ctx.fill();
            ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

            crossB(225, y0 + 35, 1, 1.0);
            text(err.title, 260, y0 + 35, { size: 22, weight: 800, color: C.red });

            text(err.bad, 225, y0 + 80, { size: 18, weight: 500, color: C.ink });
            pill(err.fix, 225, y0 + 125, '#dcfce7', { size: 17, fg: '#15803d' });
          });
        });
      });
    }

    // SCENE 7: XULOSA (S.xulosa.s - TM.end)
    else {
      drawTower(t);
      pill("XULOSA: MARSHRUTLASH VA LAZY LOADING QOIDALARI", SW / 2, 80, C.green, { size: 28, align: 'center' });

      const kEnd = eo(P(t, S.xulosa.s + 0.5, 0.9));
      withA(kEnd, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowBlur = 24;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 580, 150, 1160, 750, 24); ctx.fill();
        ctx.strokeStyle = '#bbf7d0'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

        const checklist = [
          "Router daraxti va konfiguratsiyasi -> app/routes (yagona markaz)",
          "Barcha URL konstantalari va funksiyalari -> shared/routes",
          "Navigatsiya guardlari mantiqi -> shared/auth yoki entities/session",
          "Sahifalar alohida mustaqil chunk sifatida lazy yuklanishi shart",
          "Lazy import faqat sahifaning index.ts (Public API) orqali chaqiriladi",
          "Bosh sahifa: eager (tezkor start); qolgan sahifalar: on-demand lazy",
          "Frontend guard faqat qulaylik, haqiqiy xavfsizlik esa backend da!"
        ];

        checklist.forEach((item, idx) => {
          const ki = eo(P(t, L('L15').s + idx * 1.3, 0.6));
          withA(ki, () => {
            const y0 = 210 + idx * 72;
            check(SW / 2 - 530, y0, 1, 1.1);
            text(item, SW / 2 - 490, y0, { size: 20, weight: 600, color: C.ink });
          });
        });

        const kNext = eo(P(t, L('L16').s, 0.8));
        withA(kNext, () => {
          pill("Keyingi dars: 27-bob — React + Vite ishlab chiqarish shabloni →", SW / 2, 820, C.blue, { size: 22, align: 'center' });
        });
      });
    }

    requestAnimationFrame(() => {});
  }

  window.render = draw;
  window.renderFrame = draw;
  window.seekAnim = (t) => draw(t);
  window.DURATION = TM.end;
  window.TOTAL_DURATION = TM.end;

  window.renderPoster = () => {
    draw(0.001);
    ctx.globalAlpha = 1;
    cam = { tx: 620, ty: -40, z: 0.78 };
    sky(3);
    ground(1);
    drawTower(10, { hlFloor: 5, lift: [0, 0, 0, 0, 0, 0], descLabels: false });
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#3b5bdb' });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('26-bob · marshrutlash va lazy loading', 1158, 545, { size: 34, color: C.soft });
  };
})();
