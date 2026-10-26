// FSD 25-bob videosi: "Assetlar, stillar va i18n" — turi bo'yicha emas, ishlatilishi bo'yicha taqsimlash
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
    { id: 'shared', col: '#94a3b8', uz: 'poydevor: ui, api, i18n' },
    { id: 'entities', col: '#fb7185', uz: 'biznes obyektlar' },
    { id: 'features', col: '#fbbf24', uz: 'billing: invoice.pdf' },
    { id: 'widgets', col: '#34d399', uz: 'yirik bloklar' },
    { id: 'pages', col: '#60a5fa', uz: 'sahifa assetlari: hero.jpg' },
    { id: 'app', col: '#a78bfa', uz: 'global: styles, fonts, providers' },
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
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(px + 12, py - 20, desc ? 310 : 160, 40, 8); ctx.fill();
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
      [S.oltin_qoida.s, [320, 10, 0.95]],
      [S.joylashuv_xaritasi.s, [360, 20, 0.92]],
      [S.i18n_arxitekturasi.s, [360, 20, 0.92]],
      [S.kod_va_import.s, [400, 30, 0.9]],
      [S.tipik_xatolar.s, [400, 30, 0.9]],
      [S.xulosa.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.oltin_qoida.s)
    if (t < S.oltin_qoida.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill('25-BOB: ASSETLAR, STILLAR VA I18N', SW / 2, 80, C.blue, { size: 28, align: 'center' });
        text("Turi bo'yicha emas, ishlatilishi bo'yicha taqsimlash", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating asset badges
      const kBadges = eo(P(t, L('L1').s + 4, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: 'hero.jpg', x: 280, y: 320, col: '#3b82f6' },
          { s: 'chevron.svg', x: 340, y: 440, col: '#64748b' },
          { s: 'invoice.pdf', x: 260, y: 560, col: '#f59e0b' },
          { s: 'reset.css', x: 1580, y: 340, col: '#8b5cf6' },
          { s: 'i18n: uz.json', x: 1520, y: 460, col: '#0d9488' }
        ];
        badges.forEach((b, idx) => {
          const bob = Math.sin(t * 2.5 + idx) * 8;
          pill(b.s, b.x, b.y + bob, b.col, { size: 20, mono: true });
        });
      });

      const k2 = eo(P(t, L('L2').s, 0.8));
      withA(k2, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 420, SH - 140, 840, 75, 16); ctx.fill();
        ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Oltin qoida: Assetlar o'zini ishlatuvchi kod yonida yashaydi!", SW / 2, SH - 103, { size: 23, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: OLTIN QOIDA (S.oltin_qoida.s - S.joylashuv_xaritasi.s)
    else if (t < S.joylashuv_xaritasi.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("OLTIN QOIDA: TURI EMAS, ISHLATILISHI BO'YICHA", 180, 80, C.amber, { size: 26 });

      const kCards = eo(P(t, S.oltin_qoida.s + 0.3, 0.8));
      withA(kCards, () => {
        // Left Card: ❌ An'anaviy src/assets/
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 160, 780, 760, 20); ctx.fill();
        ctx.strokeStyle = '#fecaca'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

        crossB(200, 225, 1, 1.2);
        text("❌ An'anaviy: Markaziy src/assets/", 240, 225, { size: 28, weight: 800, color: C.red });

        const badPoints = [
          "Barcha rasm, ikonka va stillar bitta ulkan qopda",
          "Qaysi rasm qaysi sahifaga tegishli ekani noma'lum",
          "Faylni o'chirish xavfli: kutilmagan buzilishlar qo'rquvi",
          "O'lik fayllar qabristoniga (dead assets) aylanadi",
          "Qatlamlar orasida sun'iy yuqori bog'liqlik tug'iladi"
        ];
        badPoints.forEach((p, idx) => {
          const kp = eo(P(t, L('L3').s + idx * 1.4, 0.5));
          withA(kp, () => {
            ctx.fillStyle = '#fee2e2'; ctx.beginPath(); ctx.arc(190, 310 + idx * 80, 6, 0, Math.PI * 2); ctx.fill();
            text(p, 220, 310 + idx * 80, { size: 20, weight: 600, color: C.ink });
          });
        });

        // Right Card: ✓ FSD Lokal Joylashuv (Colocation)
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(980, 160, 800, 760, 20); ctx.fill();
        ctx.strokeStyle = '#bbf7d0'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

        check(1040, 225, 1, 1.2);
        text("✓ FSD: Kod Yonida (Colocation)", 1080, 225, { size: 28, weight: 800, color: C.green });

        const goodPoints = [
          { loc: "pages/home/ui/hero.jpg", desc: "Faqat shu sahifaga xos rasm va bannerlar" },
          { loc: "features/billing/model/invoice.pdf", desc: "Biznes mantig'i bilan birga yuruvchi shablon" },
          { loc: "shared/ui/dropdown/chevron.svg", desc: "Shared komponentining o'z shaxsiy asseti" },
          { loc: "shared/ui/icons/ (cart, user)", desc: "Haqiqatan umumiy qayta ishlatiladigan ikonkalar" },
          { loc: "app/styles/ & app/fonts/", desc: "Butun loyihaga ta'sir qiluvchi global qoidalar" }
        ];
        goodPoints.forEach((gp, idx) => {
          const kp = eo(P(t, L('L4').s + idx * 1.5, 0.6));
          withA(kp, () => {
            pill(gp.loc, 1020, 305 + idx * 88, '#ecfdf5', { size: 17, mono: true, fg: '#065f46' });
            text(gp.desc, 1030, 345 + idx * 88, { size: 19, weight: 500, color: C.soft });
          });
        });
      });
    }

    // SCENE 3: JOYLASHUV XARITASI (S.joylashuv_xaritasi.s - S.i18n_arxitekturasi.s)
    else if (t < S.i18n_arxitekturasi.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("FAYLLAR XARITASI VA QATLAMLAR TAQSIMOTI", 180, 80, C.blue, { size: 26 });

      const kMap = eo(P(t, S.joylashuv_xaritasi.s + 0.3, 0.8));
      withA(kMap, () => {
        // Central Tree Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // 4 Columns for Layers
        const cols = [
          {
            title: "app/ (Global)",
            bg: '#f5f3ff', border: '#ddd6fe', tagCol: C.purple,
            items: [
              { name: "styles/reset.css", sub: "Global CSS tozalash" },
              { name: "styles/tokens.css", sub: "Dizayn tokenlari (rang, o'lcham)" },
              { name: "fonts/Inter.woff2", sub: "Global shriftlar" },
              { name: "providers/I18nProvider", sub: "Ilova ko'p tillilik o'rami" }
            ]
          },
          {
            title: "pages/ (Sahifa)",
            bg: '#eff6ff', border: '#bfdbfe', tagCol: C.blue,
            items: [
              { name: "home/ui/hero.jpg", sub: "Bosh sahifa asosiy banneri" },
              { name: "home/ui/previews/", sub: "Sahifaga xos kichik rasmlar" },
              { name: "checkout/i18n/uz.json", sub: "To'lov sahifasining tarjimasi" }
            ]
          },
          {
            title: "features/ (Amal)",
            bg: '#fffbeb', border: '#fde68a', tagCol: C.amber,
            items: [
              { name: "billing/model/", sub: "invoice-template.pdf" },
              { name: "create-invoice.ts", sub: "Biznes hujjati va shablon" },
              { name: "Mantiq yonida!", sub: "UI emas, biznes asset" }
            ]
          },
          {
            title: "shared/ (Poydevor)",
            bg: '#f1f5f9', border: '#cbd5e1', tagCol: '#475569',
            items: [
              { name: "ui/dropdown/chevron.svg", sub: "Komponent shaxsiy asseti" },
              { name: "ui/icons/ (user.svg)", sub: "Qayta ishlatiladigan ikonka" },
              { name: "i18n/locales/uz.json", sub: "Global umumiy satrlar" }
            ]
          }
        ];

        cols.forEach((col, cIdx) => {
          const x0 = 175 + cIdx * 395;
          const kCol = eo(P(t, S.joylashuv_xaritasi.s + 0.4 + cIdx * 0.3, 0.7));
          withA(kCol, () => {
            ctx.save();
            ctx.fillStyle = col.bg; ctx.beginPath(); ctx.roundRect(x0, 180, 370, 740, 16); ctx.fill();
            ctx.strokeStyle = col.border; ctx.lineWidth = 2.5; ctx.stroke();
            ctx.restore();

            pill(col.title, x0 + 20, 220, col.tagCol, { size: 19 });

            col.items.forEach((it, rIdx) => {
              const y0 = 290 + rIdx * 110;
              ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(x0 + 15, y0, 340, 90, 12); ctx.fill();
              ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

              text(it.name, x0 + 30, y0 + 32, { size: 16, weight: 700, fam: MONO, color: C.ink });
              text(it.sub, x0 + 30, y0 + 64, { size: 15, weight: 500, color: C.soft });
            });
          });
        });
      });
    }

    // SCENE 4: I18N ARXITEKTURASI (S.i18n_arxitekturasi.s - S.kod_va_import.s)
    else if (t < S.kod_va_import.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("i18n: GLOBAL VA SAHIFA DARAJASIDAGI TARJIMALAR", 180, 80, C.teal, { size: 26 });

      const kI18n = eo(P(t, S.i18n_arxitekturasi.s + 0.3, 0.8));
      withA(kI18n, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // 3 Tiers
        // Tier 1: app/providers (Top)
        const kApp = eo(P(t, L('L10').s - 1.0, 0.8));
        withA(kApp, () => {
          ctx.save(); ctx.fillStyle = '#f5f3ff'; ctx.beginPath(); ctx.roundRect(200, 190, 1520, 180, 16); ctx.fill();
          ctx.strokeStyle = C.purple; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

          pill('app/providers/I18nProvider.tsx', 240, 240, C.purple, { size: 22, mono: true });
          text("Ilova qobig'i: Barcha sahifalar va komponentlarni i18n konteksti bilan o'raydi", 240, 310, { size: 21, weight: 600, color: C.ink });
          text("Til o'zgarishini butun ilova bo'ylab sinxronlashtiradi", 240, 345, { size: 18, weight: 500, color: C.soft });
        });

        // Downward arrows
        const kArr = eo(P(t, L('L8').s, 0.8));
        withA(kArr, () => {
          ctx.save(); ctx.strokeStyle = C.soft; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
          ctx.beginPath(); ctx.moveTo(600, 370); ctx.lineTo(600, 440); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(1320, 370); ctx.lineTo(1320, 440); ctx.stroke();
          ctx.setLineDash([]); ctx.restore();
        });

        // Tier 2: Left = shared/i18n (Global)
        const kShared = eo(P(t, L('L8').s + 0.5, 0.8));
        withA(kShared, () => {
          ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(200, 440, 720, 460, 16); ctx.fill();
          ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

          pill('shared/i18n/ (Doimiy poydevor)', 240, 490, '#475569', { size: 21 });
          text("📁 setup.ts — i18next / vue-i18n sozlamasi va til aniqlash", 240, 560, { size: 18, weight: 600, fam: MONO, color: C.ink });
          text("📁 locales/uz.json — faqat global umumiy satrlar:", 240, 610, { size: 18, weight: 600, fam: MONO, color: C.ink });

          const globals = [
            `{ "save": "Saqlash", "cancel": "Bekor qilish" }`,
            `{ "loading": "Yuklanmoqda...", "error": "Xatolik" }`,
            `{ "confirm": "Tasdiqlash", "back": "Orqaga" }`
          ];
          globals.forEach((gStr, idx) => {
            ctx.save(); ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.roundRect(240, 650 + idx * 65, 640, 50, 8); ctx.fill(); ctx.restore();
            text(gStr, 260, 675 + idx * 65, { size: 17, fam: MONO, weight: 600, color: '#334155' });
          });
        });

        // Tier 3: Right = pages/.../i18n (Lokal lazy)
        const kPage = eo(P(t, L('L9').s, 0.8));
        withA(kPage, () => {
          ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(980, 440, 740, 460, 16); ctx.fill();
          ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

          pill('pages/checkout/i18n/ (Lazy yuklanuvchi)', 1020, 490, C.blue, { size: 21 });
          text("📁 uz.json — faqat shu sahifaga tegishli satrlar:", 1020, 560, { size: 18, weight: 600, fam: MONO, color: C.ink });

          const locals = [
            `{ "checkoutTitle": "Buyurtmani rasmiylashtirish" }`,
            `{ "cardPayment": "Karta orqali xavfsiz to'lov" }`,
            `{ "deliveryAddress": "Yetkazib berish manzili" }`
          ];
          locals.forEach((lStr, idx) => {
            ctx.save(); ctx.fillStyle = '#dbeafe'; ctx.beginPath(); ctx.roundRect(1020, 610 + idx * 65, 660, 50, 8); ctx.fill(); ctx.restore();
            text(lStr, 1040, 635 + idx * 65, { size: 17, fam: MONO, weight: 600, color: '#1e40af' });
          });

          pill("⚡ Sahifa ochilgandagina tarjima yuklanadi (Lazy Chunks)", 1020, 840, C.green, { size: 18 });
        });
      });
    }

    // SCENE 5: KOD VA IMPORT (S.kod_va_import.s - S.tipik_xatolar.s)
    else if (t < S.tipik_xatolar.s) {
      drawTower(t, { alpha: 0.2, showLabels: false });
      pill("KOD MISOLI: NISBIY IMPORT VA BUILD SOZLAMALARI", 180, 80, C.blue, { size: 26 });

      const kCode = eo(P(t, S.kod_va_import.s + 0.3, 0.8));
      withA(kCode, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: React / Vite relative import
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(180, 190, 720, 720, 16); ctx.fill(); ctx.restore();
        pill('React / Vite — Nisbiy Import', 220, 240, C.blue, { size: 19 });

        const reactCode = [
          `// pages/home/ui/HomePage.tsx`,
          `import heroUrl from './hero.jpg'`,
          `import { useTranslation } from 'react-i18next'`,
          ``,
          `export function HomePage() {`,
          `  const { t } = useTranslation()`,
          `  return (`,
          `    <section className="hero">`,
          `      <img src={heroUrl} alt={t('heroAlt')} />`,
          `    </section>`,
          `  )`,
          `}`,
          ``,
          `// app/entrypoint/main.tsx (Global)`,
          `import '../styles/reset.css'`,
          `import '@/shared/i18n/setup'`
        ];
        reactCode.forEach((line, idx) => {
          const isHl = line.includes('hero.jpg') || line.includes('reset.css');
          text(line, 220, 290 + idx * 36, {
            size: 19,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#38bdf8' : line.startsWith('//') ? '#94a3b8' : '#f8fafc'
          });
        });

        // Right: Angular Build config
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(940, 190, 800, 720, 16); ctx.fill(); ctx.restore();
        pill('Angular — angular.json Assets Glob', 980, 240, C.red, { size: 19 });

        const angularCode = [
          `// angular.json — Slice rasmlarini nusxalash`,
          `{`,
          `  "styles": [`,
          `    "src/app/styles/global.css"`,
          `  ],`,
          `  "assets": [`,
          `    { "glob": "**/*", "input": "public" },`,
          `    {`,
          `      "glob": "**/*.{jpg,png,svg}",`,
          `      "input": "src/pages",`,
          `      "output": "pages"`,
          `    }`,
          `  ]`,
          `}`,
          ``,
          `// Muqobil: esbuild loader { ".svg": "file" }`
        ];
        angularCode.forEach((line, idx) => {
          const isHl = line.includes('assets') || line.includes('src/pages');
          text(line, 980, 290 + idx * 36, {
            size: 19,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#4ade80' : line.startsWith('//') ? '#94a3b8' : '#f8fafc'
          });
        });
      });
    }

    // SCENE 6: TIPIK XATOLAR (S.tipik_xatolar.s - S.xulosa.s)
    else if (t < S.xulosa.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("ASSET VA STILLAR BOSHQARUVIDAGI TIPIK XATOLAR", 180, 80, C.red, { size: 26 });

      const kErr = eo(P(t, S.tipik_xatolar.s + 0.3, 0.8));
      withA(kErr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#fecaca'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const errors = [
          {
            title: "1. Barcha rasmlarni bitta src/assets/ papkasiga tiqish",
            bad: "Qaysi rasm qaysi sahifa yoki komponentga tegishliligi yo'qoladi. Sahifa o'chirilganda rasmlar qolib ketadi.",
            fix: "✓ Assetlarni faqat ularni ishlatuvchi slice/segment (pages/home/ui) yonida saqlang."
          },
          {
            title: "2. Sahifaga xos maxsus stillarni app/styles ga yozish",
            bad: "Global CSS fayl asossiz shishadi, klasslar nomi to'qnashadi va loyiha stillari bir-birini buzadi.",
            fix: "✓ app/styles faqat global reset, font va tokenlar uchun. Sahifa stillari o'z slice'ida qoladi."
          },
          {
            title: "3. Barcha tarjimalarni ulkan bitta locales/uz.json da saqlash",
            bad: "Foydalanuvchi birinchi sahifaga kirgandayoq butun saytning minglab satrlarini yuklashga majbur bo'ladi.",
            fix: "✓ Global so'zlar shared/i18n da, sahifaga xos satrlar esa sahifa ichida bo'lib, lazy yuklanishi shart."
          }
        ];

        errors.forEach((err, idx) => {
          const kCard = eo(P(t, L('L13').s + idx * 3.5, 0.7));
          withA(kCard, () => {
            const y0 = 190 + idx * 230;
            ctx.save(); ctx.fillStyle = '#fef2f2'; ctx.beginPath(); ctx.roundRect(180, y0, 1560, 205, 16); ctx.fill();
            ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

            crossB(225, y0 + 40, 1, 1.1);
            text(err.title, 260, y0 + 40, { size: 24, weight: 800, color: C.red });

            text("Oqibati: " + err.bad, 225, y0 + 95, { size: 19, weight: 500, color: C.ink });
            pill(err.fix, 225, y0 + 155, '#dcfce7', { size: 18, fg: '#15803d' });
          });
        });
      });
    }

    // SCENE 7: XULOSA (S.xulosa.s - TM.end)
    else {
      drawTower(t);
      pill("XULOSA: ASSETLAR, STILLAR VA I18N QOIDALARI", SW / 2, 80, C.green, { size: 28, align: 'center' });

      const kEnd = eo(P(t, S.xulosa.s + 0.5, 0.9));
      withA(kEnd, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowBlur = 24;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 580, 150, 1160, 750, 24); ctx.fill();
        ctx.strokeStyle = '#bbf7d0'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

        const checklist = [
          "Assetlar turi bo'yicha emas, aynan ishlatilishi bo'yicha kod yonida turadi",
          "Bitta slice'ga xos rasm -> o'sha slice'ning ui segmentida (pages/home/ui)",
          "Biznes mantig'i hujjati (PDF) -> tegishli model ichida (features/billing/model)",
          "Qayta ishlatiladigan ikonka va placeholderlar -> shared/ui/icons",
          "Global stillar va tokenlar -> app/styles (reset.css, tokens.css)",
          "i18n -> shared/i18n (global umumiy satrlar) + slice/i18n (lokal lazy yuklanuvchi)",
          "App darajasi -> faqat ilovani o'rab oluvchi provayderlar (I18nProvider)"
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
          pill("Keyingi dars: 26-bob — Marshrutlash va lazy loading →", SW / 2, 820, C.blue, { size: 22, align: 'center' });
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
    drawTower(10, { hlFloor: 0, lift: [0, 0, 0, 0, 0, 0], descLabels: false });
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#3b5bdb' });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('25-bob · assetlar, stillar va i18n', 1158, 545, { size: 34, color: C.soft });
  };
})();
