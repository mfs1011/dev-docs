// FSD 32-bob videosi: "Monorepo va bir nechta FSD ildizi" — Monorepo, har paket FSD ildizi, package.json exports va Steiger
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
    indigo: '#4f46e5'
  };

  // Qatlamlar (pastdan yuqoriga)
  const LAYERS = [
    { id: 'shared', col: '#94a3b8', uz: 'katta shared: @shop/ui, api-client' },
    { id: 'entities', col: '#fb7185', uz: 'catalog-domain: product, category' },
    { id: 'features', col: '#fbbf24', uz: 'add-to-cart, filter-panel' },
    { id: 'widgets', col: '#34d399', uz: 'header, catalog-grid' },
    { id: 'pages', col: '#60a5fa', uz: 'storefront va admin sahifalari' },
    { id: 'app', col: '#a78bfa', uz: 'apps/storefront/src/app, apps/admin' },
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
      [S.ildiz_tamoyili.s, [320, 10, 0.95]],
      [S.paketlarni_ulash.s, [360, 20, 0.92]],
      [S.steiger_intizomi.s, [380, 25, 0.9]],
      [S.ajratish_mezonlari.s, [360, 20, 0.92]],
      [S.tipik_xatolar.s, [400, 30, 0.9]],
      [S.xulosa.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.ildiz_tamoyili.s)
    if (t < S.ildiz_tamoyili.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill('32-BOB: MONOREPO VA KO\'P ILDIZLI FSD', SW / 2, 80, C.indigo, { size: 28, align: 'center' });
        text("Bir nechta ilovalar, mustaqil FSD ildizlari va umumiy paketlar", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating tech badges
      const kBadges = eo(P(t, L('L1').s + 3.5, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: 'Monorepo Workspaces', x: 260, y: 320, col: C.indigo },
          { s: 'Paket == FSD Ildizi', x: 280, y: 440, col: C.purple },
          { s: 'apps/storefront + admin', x: 270, y: 560, col: C.blue },
          { s: 'packages/ui & catalog', x: 1560, y: 340, col: C.teal },
          { s: 'Steiger: per workspace', x: 1510, y: 460, col: C.green }
        ];
        badges.forEach((b, idx) => {
          const bob = Math.sin(t * 2.5 + idx) * 8;
          pill(b.s, b.x, b.y + bob, b.col, { size: 20, mono: true });
        });
      });

      const k2 = eo(P(t, L('L2').s, 0.8));
      withA(k2, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 450, SH - 140, 900, 75, 16); ctx.fill();
        ctx.strokeStyle = C.indigo; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Storefront, admin va umumiy domenlarni yagona tartibda birlashtirish", SW / 2, SH - 103, { size: 22, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: ILDIZ TAMOYILI (S.ildiz_tamoyili.s - S.paketlarni_ulash.s)
    else if (t < S.paketlarni_ulash.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("HAR BIR PAKET — ALOHIDA FSD ILDIZI", 180, 80, C.indigo, { size: 26 });

      const kRes = eo(P(t, S.ildiz_tamoyili.s + 0.3, 0.8));
      withA(kRes, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: Monorepo tuzilmasi
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 740, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill("📦 shop/ Monorepo Daraxti", 210, 230, C.ink, { size: 18, mono: true });

        const treeLines = [
          { s: '├── package.json', col: C.ink, note: 'workspaces: ["apps/*", "packages/*"]' },
          { s: '├── apps/', col: C.blue, note: 'Asosiy ilovalar' },
          { s: '│   ├── storefront/   ← FSD ildizi #1', col: C.purple, note: 'app, pages, widgets, features, entities, shared' },
          { s: '│   │   └── steiger.config.ts', col: C.soft, note: 'o\'z linter sozlamalari' },
          { s: '│   └── admin/        ← FSD ildizi #2', col: C.blue, note: 'app, pages, shared (ixcham 3 qatlam)' },
          { s: '├── packages/', col: C.teal, note: 'Umumiy paketlar' },
          { s: '│   ├── ui/           ← "katta shared"', col: C.green, note: 'button, input, modal (dizayn tizimi)' },
          { s: '│   ├── api-client/   ← tashqi SDK', col: C.amber, note: 'OpenAPI dan generatsiya qilingan' },
          { s: '│   └── catalog-domain/ ← FSD #3', col: C.red, note: 'faqat entities + shared qatlamlari' },
          { s: '└── services/bff/   ← backend', col: C.soft, note: 'Node.js / Go / BFF (FSD emas)' }
        ];

        treeLines.forEach((tl, i) => {
          const y = 280 + i * 44;
          text(tl.s, 210, y, { size: 15, fam: MONO, weight: 700, color: tl.col });
          text(tl.note, 560, y, { size: 13.5, color: C.soft, weight: 500 });
        });

        // Right: Paket exports va import intizomi
        const kRight = eo(P(t, L('L4').s + 1.0, 0.8));
        withA(kRight, () => {
          // Box 1: packages/catalog-domain/package.json
          ctx.save(); ctx.fillStyle = '#fff1f2'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 340, 16); ctx.fill();
          ctx.strokeStyle = '#fecdd3'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("1. packages/catalog-domain/package.json (exports)", 990, 225, C.red, { size: 16 });

          const pkgJson = [
            '// Paketning public API\'si exports bilan qat\'iy belgilanadi:',
            '{',
            '  "name": "@shop/catalog-domain",',
            '  "exports": {',
            '    "./entities/product": "./src/entities/product/index.ts",',
            '    "./entities/category": "./src/entities/category/index.ts"',
            '  }',
            '}'
          ];
          pkgJson.forEach((line, i) => {
            text(line, 1000, 275 + i * 32, { size: 15, fam: MONO, weight: 600, color: line.startsWith('//') ? C.soft : C.ink });
          });

          // Box 2: apps/storefront ichida chaqirish
          const kImp = eo(P(t, L('L5').s, 0.8));
          withA(kImp, () => {
            ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(960, 560, 780, 370, 16); ctx.fill();
            ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
            pill("2. apps/storefront sahifasida iste'mol qilish", 990, 595, C.blue, { size: 16 });

            const impCode = [
              '// apps/storefront/src/pages/catalog/ui/CatalogPage.tsx',
              '',
              '// Boshqa FSD ildizining public API si (exports orqali):',
              'import { ProductCard } from "@shop/catalog-domain/entities/product"',
              '',
              '// O\'z ilovasining shared qatlami orqali:',
              'import { Button } from "@/shared/ui/button"',
              '',
              '// Paketlararo aloqa node_modules kutubxonasi kabi tashqi hisoblanadi!',
              '// Ichki fayllarga chuqur kirish qat\'iyan taqiqlanadi.'
            ];
            impCode.forEach((line, i) => {
              text(line, 1000, 635 + i * 28, { size: 14, fam: MONO, weight: 600, color: line.startsWith('//') ? C.teal : C.ink });
            });
          });
        });
      });
    }

    // SCENE 3: PAKETLARNI ULASH (S.paketlarni_ulash.s - S.steiger_intizomi.s)
    else if (t < S.steiger_intizomi.s) {
      drawTower(t, { hlFloor: 0, alpha: 0.35, showLabels: false });
      pill("PAKETLARNI SHARED QATLAMIDA O'RASH", 180, 80, C.teal, { size: 26 });

      const kWrap = eo(P(t, S.paketlarni_ulash.s + 0.3, 0.8));
      withA(kWrap, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: Wrapper misollari
        ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 740, 16); ctx.fill();
        ctx.strokeStyle = '#bbf7d0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("1. shared Segmentida O'rab Eksport Qilish", 210, 225, C.green, { size: 16 });

        const wrapLines = [
          '// apps/storefront/src/shared/ui/button/index.ts',
          'export { Button } from "@shop/ui/button"',
          '',
          '// apps/storefront/src/shared/api/index.ts',
          'export { createApiClient } from "@shop/api-client"',
          'export type { ProductDto } from "@shop/api-client"',
          '',
          '// apps/storefront/src/shared/config/index.ts',
          'export { APP_ENV } from "./env"',
          '',
          '// Sahifalarda yoki widgetlarda ishlatish:',
          'import { Button } from "@/shared/ui/button"',
          'import { createApiClient } from "@/shared/api"'
        ];
        wrapLines.forEach((l, i) => {
          text(l, 210, 275 + i * 36, { size: 14.5, fam: MONO, weight: 600, color: l.startsWith('//') ? C.soft : C.ink });
        });

        // Right: Nega bu yondashuv eng yaxshi?
        const kBen = eo(P(t, L('L7').s, 0.8));
        withA(kBen, () => {
          ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 740, 16); ctx.fill();
          ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("2. shared orqali o'rashning 4 ta ulkan afzalligi", 990, 225, C.blue, { size: 16 });

          const benefits = [
            {
              title: '1. Oson almashtirish (Decoupling)',
              desc: 'Agar dizayn tizimi yoki API o\'zgarsa, faqat bitta shared fayli tahrirlanadi.'
            },
            {
              title: '2. Yagona konfiguratsiya nuqtasi',
              desc: 'Tashqi komponentlar uchun ilovaga xos default parametrlar bir joyda beriladi.'
            },
            {
              title: "3. Qat'iy FSD yo'li (@/shared/...)",
              desc: 'Dasturchilar va Steiger butun ilova bo\'ylab bir xil import intizomini ko\'radi.'
            },
            {
              title: '4. Tree-shaking va kesh himoyasi',
              desc: 'Paketning faqat kerakli qismi yuklanadi, ortiqcha kod ilovaga kirmaydi.'
            }
          ];

          benefits.forEach((b, i) => {
            const by = 280 + i * 150;
            pill(b.title, 990, by, C.indigo, { size: 15 });
            text(b.desc, 990, by + 45, { size: 15, weight: 500, color: C.ink });
          });
        });
      });
    }

    // SCENE 4: STEIGER INTIZOMI (S.steiger_intizomi.s - S.ajratish_mezonlari.s)
    else if (t < S.ajratish_mezonlari.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("STEIGER LINTERINI HAR BIR ILDIZDA ISHLATISH", 180, 80, C.green, { size: 26 });

      const kStg = eo(P(t, S.steiger_intizomi.s + 0.3, 0.8));
      withA(kStg, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: Ildizdan ishga tushirish muammosi
        ctx.save(); ctx.fillStyle = '#fff1f2'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 740, 16); ctx.fill();
        ctx.strokeStyle = '#fecdd3'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("⚠️ Diqqat: Ildizdan npx steiger ishga tushirish", 210, 225, C.red, { size: 16 });

        const rootStg = [
          '# Agar monorepo ildizidan bunday chaqirilsa:',
          '$ npx steiger apps/storefront/src',
          '',
          '// Natija:',
          '// Steiger aliaslarni to\'g\'ri hal qiladi, AMMO...',
          '// paketning apps/storefront/steiger.config.ts faylini O\'QIMAYDI!',
          '',
          '// Config joriy papkadan (ildizdan) qidiriladi.',
          '// Oqibatda, ilovangiz uchun yozilgan barcha istisnolar',
          '// va maxsus konfiguratsiyalar yo\'qoladi!'
        ];
        rootStg.forEach((line, i) => {
          text(line, 210, 280 + i * 36, { size: 15, fam: MONO, weight: 600, color: line.startsWith('#') || line.startsWith('// Natija') ? C.red : C.ink });
        });

        // Right: To'g'ri yechim: workspaces skripti
        const kRightStg = eo(P(t, L('L10').s, 0.8));
        withA(kRightStg, () => {
          ctx.save(); ctx.fillStyle = '#ecfdf5'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 740, 16); ctx.fill();
          ctx.strokeStyle = '#a7f3d0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("✅ To'g'ri Yechim: npm --workspaces bilan tekshirish", 990, 225, C.green, { size: 16 });

          const fixStg = [
            '// 1. Har bir FSD paketining package.json fayliga yozing:',
            '{',
            '  "scripts": {',
            '    "lint:fsd": "steiger src"',
            '  }',
            '}',
            '',
            '// 2. Monorepo ildizidan barcha paketlarni birvarakay tekshiring:',
            '$ npm run lint:fsd --workspaces --if-present',
            '',
            '// Natija: Har bir paket o\'z katalogida ishga tushadi,',
            '// o\'z steiger.config.ts faylini o\'qiydi va 0 xato beradi!'
          ];
          fixStg.forEach((line, i) => {
            text(line, 1000, 280 + i * 34, { size: 14.5, fam: MONO, weight: 600, color: line.startsWith('$') ? C.green : C.ink });
          });
        });
      });
    }

    // SCENE 5: AJRATISH MEZONLARI (S.ajratish_mezonlari.s - S.tipik_xatolar.s)
    else if (t < S.tipik_xatolar.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("QACHON MONOREPOGA BO'LISH KERAK?", 180, 80, C.blue, { size: 26 });

      const kCriteria = eo(P(t, S.ajratish_mezonlari.s + 0.3, 0.8));
      withA(kCriteria, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: Monorepoga bo'ling
        ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 740, 16); ctx.fill();
        ctx.strokeStyle = '#86efac'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("✅ Monorepoga Bo'ling", 210, 225, C.green, { size: 18 });

        const doSplit = [
          {
            title: 'Ilovada mutlaqo turli mas\'uliyatlar',
            desc: 'Google Docs dagi tahrirchi va fayl brauzeri kabi mustaqil qismlar.'
          },
          {
            title: 'Bir nechta ilova umumiy dizayn tizimida',
            desc: 'Do\'kon, admin paneli va mobil veb bitta UI kutubxonasini ulashganda.'
          },
          {
            title: 'Jamoalar mustaqil reliz qilishi zarur',
            desc: 'Har bir paket o\'z versiyasi va o\'z chiqarilish jadvaliga ega bo\'lganda.'
          },
          {
            title: 'Dev server barrel tufayli sekinlashganda',
            desc: 'Katta qatlamlar alohida paketlarga bo\'linib, keshdan tez yuklanganda.'
          }
        ];

        doSplit.forEach((item, i) => {
          const y = 280 + i * 150;
          check(225, y + 10, 1, 0.9);
          text(item.title, 255, y + 10, { size: 16, weight: 700, color: C.green });
          text(item.desc, 255, y + 45, { size: 14.5, weight: 500, color: C.ink });
        });

        // Right: Bitta FSD yetarli
        const kDont = eo(P(t, L('L12').s, 0.8));
        withA(kDont, () => {
          ctx.save(); ctx.fillStyle = '#fffbeb'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 740, 16); ctx.fill();
          ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("⏸️ Bitta FSD Ildizi Yetarli", 990, 225, C.amber, { size: 18 });

          const dontSplit = [
            {
              title: 'Bitta mahsulot va bitta jamoa',
              desc: 'Oddiy yoki o\'rta hajmdagi mahsulot bitta standart FSD daraxtida qolishi kerak.'
            },
            {
              title: 'Shunchaki "papkalar ko\'payib ketgani" uchun',
              desc: 'Papkalar soni ko\'pligi monorepo talab qilmaydi — bu faqat sun\'iy xarajat keltiradi.'
            },
            {
              title: 'Hali qayta ishlatilmagan kodlar',
              desc: 'Faqat bitta ilova ishlatadigan kodni oldindan paketga chiqarish taqiqlanadi.'
            },
            {
              title: 'Infratuzilma tayyor bo\'lmaganda',
              desc: 'Monorepo vositalari (Turborepo, Nx, CI) sozlanmagan bo\'lsa, boshlamang.'
            }
          ];

          dontSplit.forEach((item, i) => {
            const y = 280 + i * 150;
            crossB(1005, y + 10, 1, 0.9);
            text(item.title, 1035, y + 10, { size: 16, weight: 700, color: C.amber });
            text(item.desc, 1035, y + 45, { size: 14.5, weight: 500, color: C.ink });
          });
        });
      });
    }

    // SCENE 6: TIPIK XATOLAR (S.tipik_xatolar.s - S.xulosa.s)
    else if (t < S.xulosa.s) {
      drawTower(t, { alpha: 0.2, showLabels: false });
      pill("MONOREPO VA FSD DA TIPIK XATOLAR", 180, 80, C.red, { size: 26 });

      const kErr = eo(P(t, S.tipik_xatolar.s + 0.3, 0.8));
      withA(kErr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const errors = [
          {
            title: '1. Paket ichki fayliga chuqur import qilish',
            bad: 'import { Button } from "@shop/ui/src/button/Button" — ichki strukturaga to\'g\'ridan kirish.',
            good: 'Faqat package.json exports da e\'lon qilingan public API orqali: "@shop/ui/button".',
            line: 'L13'
          },
          {
            title: '2. Ikki ilovaning bir-birini import qilishi',
            bad: 'apps/admin ilovasi apps/storefront dan komponentlarni to\'g\'ridan tortib olishi.',
            good: 'Ilovani emas, umumiy qismini packages/catalog-domain yoki packages/ui ga chiqaring.',
            line: 'L13'
          },
          {
            title: '3. packages/shared-utils "axlat qutisi" yaratish',
            bad: 'Har xil bog\'liq bo\'lmagan yordamchi funksiyalarni bitta ulkan paketga tiqish.',
            good: 'Yo\'nalishli aniq paketlar oching: packages/ui, packages/api-client, packages/date.',
            line: 'L14'
          }
        ];

        errors.forEach((err, i) => {
          const kItem = eo(P(t, L(err.line).s + i * 0.4, 0.8));
          withA(kItem, () => {
            const y = 190 + i * 250;
            // Card
            ctx.save(); ctx.fillStyle = '#fffafb'; ctx.beginPath(); ctx.roundRect(180, y, 1560, 220, 16); ctx.fill();
            ctx.strokeStyle = '#fecdd3'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

            pill(err.title, 210, y + 35, C.red, { size: 17 });

            // Bad box
            ctx.save(); ctx.fillStyle = '#fee2e2'; ctx.beginPath(); ctx.roundRect(210, y + 70, 720, 120, 12); ctx.fill(); ctx.restore();
            crossB(240, y + 100, 1);
            text("Noto'g'ri:", 270, y + 100, { size: 16, weight: 700, color: C.red });
            text(err.bad, 240, y + 145, { size: 14.5, weight: 600, color: C.ink });

            // Good box
            ctx.save(); ctx.fillStyle = '#dcfce7'; ctx.beginPath(); ctx.roundRect(970, y + 70, 740, 120, 12); ctx.fill(); ctx.restore();
            check(1000, y + 100, 1);
            text("To'g'ri yo'l:", 1030, y + 100, { size: 16, weight: 700, color: C.green });
            text(err.good, 1000, y + 145, { size: 14.5, weight: 600, color: C.ink });
          });
        });
      });
    }

    // SCENE 7: XULOSA (S.xulosa.s - oxiri)
    else {
      drawTower(t, { showLabels: true });
      const kX = eo(P(t, S.xulosa.s, 1.0));
      withA(kX, () => {
        pill('32-BOB: XULOSA VA KEYINGI QADAM', SW / 2, 80, C.indigo, { size: 28, align: 'center' });
        text("Monorepo + FSD — korxona darajasidagi yirik loyihalar uchun yagona intizom", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      const kCards = eo(P(t, L('L15').s, 0.8));
      withA(kCards, () => {
        const cards = [
          {
            title: 'Har Paket — FSD Ildizi',
            desc: 'Mustaqil yoki qisqartirilgan FSD qatlamlari',
            col: C.blue,
            x: 240,
            y: 750
          },
          {
            title: 'package.json exports',
            desc: 'Paketlararo aloqa public API orqali',
            col: C.purple,
            x: 740,
            y: 750
          },
          {
            title: 'Steiger Har Ildizda',
            desc: 'npm --workspaces orqali 100% tekshiruv',
            col: C.green,
            x: 1240,
            y: 750
          }
        ];

        cards.forEach((c) => {
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 14;
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(c.x, c.y, 440, 120, 16); ctx.fill();
          ctx.strokeStyle = c.col; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();

          pill(c.title, c.x + 25, c.y + 35, c.col, { size: 16 });
          text(c.desc, c.x + 25, c.y + 85, { size: 14.5, weight: 600, color: C.ink });
        });
      });

      const kNext = eo(P(t, L('L16').s, 0.8));
      withA(kNext, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 450, SH - 140, 900, 75, 16); ctx.fill();
        ctx.strokeStyle = C.indigo; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Keyingi bob: 33 — Steiger: linter va arxitektura tekshiruvi", SW / 2, SH - 103, { size: 24, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // Pastki progress bar
    const prg = clamp(t / TM.end);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, SH - 6, SW, 6);
    ctx.fillStyle = C.indigo; ctx.fillRect(0, SH - 6, SW * prg, 6);
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
    drawTower(10, { hlFloor: 1, lift: [0, 0, 0, 0, 0, 0], descLabels: false });
    text('FSD', 1150, 360, { size: 170, weight: 800, color: C.indigo });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('32-bob · monorepo va ko\'p ildizli fsd', 1158, 545, { size: 34, color: C.soft });
  };
})();
