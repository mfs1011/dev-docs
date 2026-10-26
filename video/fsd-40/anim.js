// FSD 40-bob videosi: "Shpargalka" — Butun Feature-Sliced Design metodologiyasi yakuni
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
    cyan: '#0891b2',
    gold: '#eab308'
  };

  // Qatlamlar (pastdan yuqoriga)
  const LAYERS = [
    { id: 'shared', col: '#94a3b8', uz: 'shared/: ui kit, api klient, lib, config, routes' },
    { id: 'entities', col: '#fb7185', uz: 'entities/: biznes modellari va tushunchalar (ot)' },
    { id: 'features', col: '#fbbf24', uz: 'features/: foydalanuvchi harakatlari (fe\'l)' },
    { id: 'widgets', col: '#34d399', uz: 'widgets/: mustaqil yirik UI bloklari (2+ sahifa)' },
    { id: 'pages', col: '#60a5fa', uz: 'pages/: sahifalar (v2.1: shu yerdan boshlang!)' },
    { id: 'app', col: '#a78bfa', uz: 'app/: router, provayderlar, global stillar' },
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
      [S.olti_qatlam_ierarxiya.s, [320, 10, 0.95]],
      [S.ikki_asosiy_qonun.s, [360, 20, 0.92]],
      [S.kod_qayerga.s, [380, 25, 0.9]],
      [S.segmentlar_va_steiger.s, [360, 20, 0.92]],
      [S.tipik_xatolar.s, [400, 30, 0.9]],
      [S.grand_finale.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.olti_qatlam_ierarxiya.s)
    if (t < S.olti_qatlam_ierarxiya.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill("40-BOB: FEATURE-SLICED DESIGN SHPARGALKASI", SW / 2, 80, C.cyan, { size: 28, align: 'center' });
        text("Butun metodologiya bir sahifada: asosiy qonunlar, qoidalar va xulosalar", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating badges
      const kBadges = eo(P(t, L('L1').s + 2.5, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: 'Yakuniy 40-Bob', x: 260, y: 320, col: C.purple },
          { s: 'Yagona Shpargalka', x: 280, y: 440, col: C.blue },
          { s: 'AGENTS.md & CLAUDE.md', x: 270, y: 560, col: C.teal },
          { s: 'Ikki Oltin Qonun', x: 1420, y: 340, col: C.amber },
          { s: 'Steiger CI Standarti', x: 1440, y: 460, col: C.green }
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
        text("Loyihangizda har kuni foydalanish va AI yordamchilarga qoida sifatida berish uchun!", SW / 2, SH - 103, { size: 22, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: OLTI QATLAM IERARXIYA (S.olti_qatlam_ierarxiya.s - S.ikki_asosiy_qonun.s)
    else if (t < S.ikki_asosiy_qonun.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("1. OLTITA QATLAM VA QAT'IY IERARXIYA", 180, 80, C.cyan, { size: 26 });

      const kOlti = eo(P(t, S.olti_qatlam_ierarxiya.s + 0.3, 0.8));
      withA(kOlti, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // 6 Layers Vertical Hierarchy on Left
        const layersData = [
          { name: 'app/', desc: 'entrypoint, providers, routes, styles (slice\'siz · hammani import qiladi)', col: '#a78bfa', rank: 'Eng yuqori' },
          { name: 'pages/', desc: 'sahifalar (har biri alohida slice) — v2.1: BU YERDAN BOSHLANG!', col: '#60a5fa', rank: 'Boshlang\'ich' },
          { name: 'widgets/', desc: 'katta mustaqil UI bloklari (header, sidebar, 2+ sahifada ishlatilsa)', col: '#34d399', rank: 'Ixtiyoriy' },
          { name: 'features/', desc: 'foydalanuvchi harakatlari va biznes qiymati (fe\'l: add-to-cart, auth)', col: '#fbbf24', rank: 'Ixtiyoriy' },
          { name: 'entities/', desc: 'biznes obyektlari va modellari (ot: user, product, order)', col: '#fb7185', rank: 'Ixtiyoriy' },
          { name: 'shared/', desc: 'poydevor: ui kit, api klient, lib, config, routes (slice\'siz · biznessiz)', col: '#94a3b8', rank: 'Poydevor' }
        ];

        layersData.forEach((ld, idx) => {
          const ly = 190 + idx * 120;
          ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, ly, 1560, 100, 14); ctx.fill();
          ctx.strokeStyle = ld.col; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();

          pill(ld.name, 215, ly + 50, ld.col, { size: 18, mono: true });
          pill(ld.rank, 380, ly + 50, C.soft, { size: 13 });

          text(ld.desc, 520, ly + 50, { size: 17, weight: 600, color: C.ink });

          if (idx < 5) {
            text("▼", 185, ly + 110, { size: 14, color: C.soft });
          }
        });
      });
    }

    // SCENE 3: IKKI ASOSIY QONUN (S.ikki_asosiy_qonun.s - S.kod_qayerga.s)
    else if (t < S.kod_qayerga.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("2. FSD NING IKKI ASOSIY QONUNI", 180, 80, C.cyan, { size: 26 });

      const kLaw = eo(P(t, S.ikki_asosiy_qonun.s + 0.3, 0.8));
      withA(kLaw, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: 1-Qonun: IMPORT FAQAT PASTGA
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 760, 740, 16); ctx.fill();
        ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
        pill("1-Qonun: Import Faqat Pastga", 210, 230, C.blue, { size: 18 });

        const law1Rules = [
          { t: "app → pages → widgets → features → entities → shared", d: "Import faqat yuqoridan pastga oqadi, orqaga qaytish qat'iyan man etiladi" },
          { t: "Bitta qatlamdagi slice'lar bir-birini bilmaydi", d: "Feature boshqa Feature ni, Page boshqa Page ni import qila olmaydi" },
          { t: "Yagona istisno: @x cross-importlar", d: "Faqat entities da va faqat @x papkasi orqali (oxirgi chora sifatida)" },
          { t: "app va shared erkin", d: "Bu ikki qatlamda slayslar yo'q, shuning uchun ichki segmentlar o'zaro erkin import qila oladi" }
        ];

        law1Rules.forEach((lr, i) => {
          const y = 300 + i * 145;
          ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(230, y + 10, 8, 0, Math.PI * 2); ctx.fill();
          text(lr.t, 255, y + 10, { size: 17, weight: 700, color: C.ink });
          wrapText(lr.d, 255, y + 45, 660, 24, { size: 14.5, weight: 500, color: C.soft });
        });

        // Right: 2-Qonun: PUBLIC API
        const kRight = eo(P(t, L('L6').s, 0.8));
        withA(kRight, () => {
          ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(970, 190, 770, 740, 16); ctx.fill();
          ctx.strokeStyle = C.green; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
          pill("2-Qonun: Qat'iy Public API", 1000, 230, C.green, { size: 18 });

          const law2Rules = [
            { t: "Tashqaridan faqat @/<qatlam>/<slice>", d: "Ichki fayllarga (masalan @/entities/x/ui/Card) to'g'ridan kirish qat'iyan taqiqlangan" },
            { t: "Slice ichida — nisbiy importlar", d: "Slice o'z ichidagi fayllarni nisbiy yo'l ('../lib/format', './ui/Header') bilan chaqiradi" },
            { t: "shared/ui da komponent index'lari", d: "shared/ui dan to'g'ridan emas, @/shared/ui/button kabi komponent darajasida olinadi" },
            { t: "export * mutlaqo ishlatilmaydi", d: "Har bir eksport aniq nom bilan bo'lishi shart, wildcard eksport taqiqlangan" }
          ];

          law2Rules.forEach((lr, i) => {
            const y = 300 + i * 145;
            ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(1020, y + 10, 8, 0, Math.PI * 2); ctx.fill();
            text(lr.t, 1045, y + 10, { size: 17, weight: 700, color: C.ink });
            wrapText(lr.d, 1045, y + 45, 660, 24, { size: 14.5, weight: 500, color: C.soft });
          });
        });
      });
    }

    // SCENE 4: KOD QAYERGA JOYLASHADI (S.kod_qayerga.s - S.segmentlar_va_steiger.s)
    else if (t < S.segmentlar_va_steiger.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("3. QARORLAR XARITASI: KOD QAYERGA JOYLASHADI?", 180, 80, C.cyan, { size: 26 });

      const kMap = eo(P(t, S.kod_qayerga.s + 0.3, 0.8));
      withA(kMap, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const mapItems = [
          { code: "Faqat bitta sahifada ishlatilsa", place: "pages/<sahifa>", col: C.blue },
          { code: "UI kit komponenti, logo, karkas", place: "shared/ui/<komponent>", col: C.teal },
          { code: "HTTP klient, CRUD, DTO, so'rovlar", place: "shared/api", col: C.teal },
          { code: "Token, sessiya, joriy foydalanuvchi", place: "shared/auth yoki entities/session", col: C.purple },
          { code: "Biznes obyekti (2+ joyda kerak)", place: "entities/<ot> (product, order)", col: C.red },
          { code: "Foydalanuvchi harakati (2+ joyda)", place: "features/<fe'l> (add-to-cart, filter)", col: C.amber }
        ];

        mapItems.forEach((mi, idx) => {
          const colIdx = idx % 2;
          const rowIdx = Math.floor(idx / 2);
          const bx = 180 + colIdx * 800;
          const by = 190 + rowIdx * 175;

          ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(bx, by, 760, 155, 14); ctx.fill();
          ctx.strokeStyle = mi.col; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

          text("Kod turi:", bx + 30, by + 40, { size: 14, weight: 700, color: C.soft });
          text(mi.code, bx + 30, by + 75, { size: 17.5, weight: 700, color: C.ink });

          text("To'g'ri joyi:", bx + 30, by + 115, { size: 14, weight: 600, color: C.soft });
          pill(mi.place, bx + 120, by + 115, mi.col, { size: 15, mono: true });
        });

        // Bottom banner
        ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(180, 740, 1560, 190, 16); ctx.fill();
        ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("Oltin Qoida: Eng Lokal Joy", 215, 785, C.blue, { size: 16 });
        text("Agar biror kodning joyiga shubhangiz bo'lsa — uni eng lokal joyda qoldiring!", 215, 840, { size: 21, weight: 700, color: C.ink });
        text("Keyinroq 2+ foydalanuvchi paydo bo'lgach pastga tushirish — noto'g'ri tushirilganni qaytarishdan osonroq.", 215, 885, { size: 18, weight: 600, color: C.soft });
      });
    }

    // SCENE 5: SEGMENTLAR VA STEIGER (S.segmentlar_va_steiger.s - S.tipik_xatolar.s)
    else if (t < S.tipik_xatolar.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("4. STANDART SEGMENTLAR VA STEIGER LINTERI", 180, 80, C.cyan, { size: 26 });

      const kSeg = eo(P(t, S.segmentlar_va_steiger.s + 0.3, 0.8));
      withA(kSeg, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left Panel: Segment Nomlari
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 760, 740, 16); ctx.fill();
        ctx.strokeStyle = C.amber; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
        pill("Ruxsat Berilgan va Taqiqlangan Segmentlar", 210, 230, C.amber, { size: 18 });

        // Taqiqlangan
        ctx.save(); ctx.fillStyle = '#fff5f5'; ctx.beginPath(); ctx.roundRect(210, 280, 700, 180, 12); ctx.fill();
        ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
        pill("❌ Taqiqlangan Segment Nomlari (Steiger rad etadi)", 235, 315, C.red, { size: 14 });
        wrapText("components, helpers, utils, constants, types, store(s), modals, services, hooks, context, composables, actions, reducers, sagas", 235, 375, 650, 26, { size: 14.5, fam: MONO, weight: 700, color: C.red });

        // Ruxsat berilgan
        ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(210, 490, 700, 190, 12); ctx.fill();
        ctx.strokeStyle = '#86efac'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
        pill("✅ Standart Segment Nomlari", 235, 525, C.green, { size: 14 });
        wrapText("ui (komponentlar), model (holat, turlar), api (so'rovlar), lib (yordamchilar), config (konstantalar)", 235, 580, 650, 26, { size: 15, fam: MONO, weight: 700, color: C.green });
        text("Yoki maqsad nomi: testing, auth, routes, i18n", 235, 640, { size: 15, weight: 600, color: C.soft });

        // Right Panel: Steiger CI Konfiguratsiyasi
        const kRight = eo(P(t, L('L10').s, 0.8));
        withA(kRight, () => {
          ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(970, 190, 770, 740, 16); ctx.fill();
          ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("steiger.config.ts (CI Standarti)", 1000, 230, C.purple, { size: 16, mono: true });

          const codeLines = [
            { s: "import { defineConfig } from 'steiger'", col: '#f8fafc' },
            { s: "import fsd from '@feature-sliced/steiger-plugin'", col: '#f8fafc' },
            { s: '', col: '' },
            { s: 'export default defineConfig([', col: '#f8fafc' },
            { s: '  ...fsd.configs.recommended,', col: '#38bdf8' },
            { s: '  {', col: '#f8fafc' },
            { s: '    rules: {', col: '#f8fafc' },
            { s: "      'fsd/import-locality': 'error',", col: '#4ade80' },
            { s: "      'fsd/no-wildcard-exports': 'error'", col: '#4ade80' },
            { s: '    }', col: '#f8fafc' },
            { s: '  }', col: '#f8fafc' },
            { s: '])', col: '#f8fafc' },
            { s: '', col: '' },
            { s: '# CI Pipeline buyrug\'i (0 xato talab qilinadi):', col: '#94a3b8' },
            { s: 'npx steiger src', col: '#fbbf24' }
          ];

          codeLines.forEach((cl, i) => {
            if (cl.s) text(cl.s, 1000, 290 + i * 36, { size: 15.5, fam: MONO, color: cl.col, weight: 600 });
          });
        });
      });
    }

    // SCENE 6: TIPIK XATOLAR (S.tipik_xatolar.s - S.grand_finale.s)
    else if (t < S.grand_finale.s) {
      drawTower(t, { alpha: 0.25, showLabels: false });
      pill("5. ENG KATTA 5 TA FSD ANTIPATTERNLARI", 180, 80, C.cyan, { size: 26 });

      const kErr = eo(P(t, S.tipik_xatolar.s + 0.3, 0.8));
      withA(kErr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const mistakes = [
          {
            title: '1. 1-kunda 6 qatlam ochish',
            bad: 'Hamma narsani oldindan taxminlab maydalash',
            good: 'To\'g\'ri: Boshlanishida faqat app + pages + shared!',
            col: C.red
          },
          {
            title: '2. entities ichida features importi',
            bad: 'Entity qatlamidan yuqoridagi Feature ga qaramlik',
            good: 'To\'g\'ri: Slot / props orqali sahifada kompozitsiya',
            col: C.amber
          },
          {
            title: '3. Chuqur importlar (@/entities/x/ui/Card)',
            bad: 'Public API index.ts ni aylanib o\'tish (sidestep)',
            good: 'To\'g\'ri: Tashqaridan faqat @/entities/x orqali olish',
            col: C.purple
          },
          {
            title: '4. Texnik va mavhum nomlar',
            bad: 'utils.ts, types.ts, forms/, modals/ nomlari',
            good: 'To\'g\'ri: Domenli nomlar: delivery.ts, order.dto.ts',
            col: C.blue
          }
        ];

        mistakes.forEach((m, idx) => {
          const colIdx = idx % 2;
          const rowIdx = Math.floor(idx / 2);
          const bx = 180 + colIdx * 800;
          const by = 190 + rowIdx * 370;

          ctx.save(); ctx.fillStyle = '#fff5f5'; ctx.beginPath(); ctx.roundRect(bx, by, 760, 340, 16); ctx.fill();
          ctx.strokeStyle = m.col; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();

          pill(m.title, bx + 30, by + 40, m.col, { size: 16 });

          text("❌ Xato: " + m.bad, bx + 30, by + 115, { size: 17, weight: 700, color: C.red });

          ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(bx + 25, by + 185, 710, 125, 12); ctx.fill();
          ctx.strokeStyle = '#86efac'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          text("✅ " + m.good, bx + 45, by + 248, { size: 18, weight: 700, color: C.green });
        });
      });
    }

    // SCENE 7: GRAND FINALE (S.grand_finale.s - TM.end)
    else {
      drawTower(t, { alpha: 1, showLabels: true });
      pill("TABRIKLAYMIZ! FSD BO'YICHA 40 TA BOB YAKUNLANDI!", SW / 2, 80, C.gold, { size: 28, align: 'center', fg: '#1f2a44' });

      // Celebration Particles
      const kFin = eo(P(t, S.grand_finale.s + 0.3, 1.0));
      withA(kFin, () => {
        for (let i = 0; i < 40; i++) {
          const px = (rnd(i * 3) * SW + Math.sin(t * 3 + i) * 60) % SW;
          const py = (rnd(i * 7) * SH + t * 40 * (rnd(i + 2) + 0.5)) % SH;
          const pr = 4 + rnd(i) * 6;
          const pCol = [C.gold, C.cyan, C.green, C.purple, C.amber][i % 5];
          ctx.save(); ctx.fillStyle = pCol; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }

        const cards = [
          {
            title: "40 ta Professional Bob",
            desc: "Nazariya, diagrammalar, animatsiyalar va real kod",
            col: C.green,
            x: 240,
            y: 750
          },
          {
            title: "5 ta Zamonaviy Framework",
            desc: "React, Next.js 16, Vue 3, Nuxt 4 va Angular 22",
            col: C.blue,
            x: 740,
            y: 750
          },
          {
            title: "Tizimli Muhandislik",
            desc: "Steiger linter, testlash, migratsiya va checklist",
            col: C.purple,
            x: 1240,
            y: 750
          }
        ];

        cards.forEach((c) => {
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 18;
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(c.x, c.y, 440, 120, 16); ctx.fill();
          ctx.strokeStyle = c.col; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();

          pill(c.title, c.x + 25, c.y + 35, c.col, { size: 16 });
          text(c.desc, c.x + 25, c.y + 85, { size: 14, weight: 600, color: C.ink });
        });
      });

      const kLast = eo(P(t, L('L16').s, 0.8));
      withA(kLast, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 24;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 470, SH - 140, 940, 75, 16); ctx.fill();
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3.5; ctx.stroke(); ctx.restore();
        text("Katta rahmat va yangi buyuk loyihalaringizda omad yor bo'lsin!", SW / 2, SH - 103, { size: 24, weight: 800, color: C.ink, align: 'center' });
      });
    }

    // Pastki progress bar
    const prg = clamp(t / TM.end);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, SH - 6, SW, 6);
    ctx.fillStyle = C.gold; ctx.fillRect(0, SH - 6, SW * prg, 6);
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
    drawTower(10, { hlFloor: 5, lift: [0, 0, 0, 0, 0, 0], descLabels: false });
    text('FSD', 1150, 360, { size: 170, weight: 800, color: C.cyan });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('40-bob · fsd shpargalka (yakun)', 1158, 545, { size: 34, color: C.soft });
  };
})();
