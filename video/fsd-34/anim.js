// FSD 34-bob videosi: "ESLint, TypeScript va alias'lar" — ESLint 9 flat config, no-restricted-imports, eslint-plugin-boundaries 7 va IDE himoyasi
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
    violet: '#7c3aed'
  };

  // Qatlamlar (pastdan yuqoriga)
  const LAYERS = [
    { id: 'shared', col: '#94a3b8', uz: 'shared o\'z segmentlarini ko\'radi' },
    { id: 'entities', col: '#fb7185', uz: 'faqat shared ni ko\'radi' },
    { id: 'features', col: '#fbbf24', uz: 'entities va shared ni ko\'radi' },
    { id: 'widgets', col: '#34d399', uz: 'features, entities, shared' },
    { id: 'pages', col: '#60a5fa', uz: 'widgets, features, entities, shared' },
    { id: 'app', col: '#a78bfa', uz: 'barcha qatlamlarni import qiladi' },
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

  // Qizil to'lqinsimon chiziq (IDE xatosi indikatori)
  function wavyUnderline(x1, x2, y, col = C.red) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
    for (let x = x1; x <= x2; x += 4) {
      const wave = Math.sin((x - x1) * 1.5) * 2;
      if (x === x1) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.stroke(); ctx.restore();
  }

  // ---------- Sahna chizish ----------
  function draw(t) {
    ctx.clearRect(0, 0, SW, SH);
    sky(t);

    const S = TM.scenes;
    const camFrames = [
      [0, [90, -30, 1]],
      [S.alias_sozlamalari.s, [320, 10, 0.95]],
      [S.no_restricted_imports.s, [360, 20, 0.92]],
      [S.boundaries_plagini.s, [380, 25, 0.9]],
      [S.natijalar_va_ide.s, [360, 20, 0.92]],
      [S.tipik_xatolar.s, [400, 30, 0.9]],
      [S.xulosa.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.alias_sozlamalari.s)
    if (t < S.alias_sozlamalari.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill('34-BOB: ESLINT, TYPESCRIPT VA ALIASLAR', SW / 2, 80, C.violet, { size: 28, align: 'center' });
        text("Steiger CI da, ESLint esa IDE da kod yozish paytida himoyalaydi", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating tech badges
      const kBadges = eo(P(t, L('L1').s + 3.0, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: 'ESLint 9 Flat Config', x: 260, y: 320, col: C.violet },
          { s: 'eslint-plugin-boundaries', x: 290, y: 440, col: C.blue },
          { s: 'no-restricted-imports', x: 270, y: 560, col: C.purple },
          { s: 'IDE Real-Time Underline', x: 1560, y: 340, col: C.red },
          { s: 'TypeScript 6 paths', x: 1510, y: 460, col: C.green }
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
        ctx.strokeStyle = C.violet; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("IDE darajasida tezkor fikr-mulohaza va qat'iy FSD yo'nalishi", SW / 2, SH - 103, { size: 22, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: ALIAS SOZLAMALARI (S.alias_sozlamalari.s - S.no_restricted_imports.s)
    else if (t < S.no_restricted_imports.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("TSCONFIG VA BUNDLER ALIASLAR INTIZOMI", 180, 80, C.blue, { size: 26 });

      const kRes = eo(P(t, S.alias_sozlamalari.s + 0.3, 0.8));
      withA(kRes, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: Jadval
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 800, 740, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill("Frameworklar Bo'yicha Alias Sozlamalari", 210, 225, C.ink, { size: 17 });

        const fwTable = [
          { fw: 'React + Vite', bundler: 'vite.config.ts alias', ts: 'tsconfig.app.json paths' },
          { fw: 'Vue 3 + Vite', bundler: 'create-vue sukuti', ts: 'tsconfig.app.json paths' },
          { fw: 'Next.js 16', bundler: 'O\'zi tushunadi', ts: 'tsconfig.json ("./src/*" ga o\'zgartiring!)' },
          { fw: 'Nuxt 4', bundler: 'nuxt.config.ts alias', ts: '.nuxt/ avtomatik xaritalaydi' },
          { fw: 'Angular 22', bundler: 'esbuild o\'zi tushunadi', ts: 'tsconfig.json paths' }
        ];

        fwTable.forEach((row, i) => {
          const ry = 280 + i * 115;
          pill(row.fw, 210, ry, C.blue, { size: 14.5 });
          text("Bundler: " + row.bundler, 210, ry + 42, { size: 14, color: C.soft, weight: 600 });
          text("TypeScript: " + row.ts, 210, ry + 68, { size: 13.5, color: C.ink, fam: MONO, weight: 600 });
        });

        // Right: tsconfig.json va muhim eslatma
        const kRight = eo(P(t, L('L4').s, 0.8));
        withA(kRight, () => {
          ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(1010, 190, 730, 740, 16); ctx.fill();
          ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("tsconfig.json: Yagona Qoida", 1040, 225, C.blue, { size: 16 });

          const tsCode = [
            '// TypeScript 6.0 da baseUrl shart emas!',
            '{',
            '  "compilerOptions": {',
            '    "paths": {',
            '      "@/*": ["./src/*"]',
            '    }',
            '  }',
            '}',
            '',
            '// ⚠️ DIQQAT Next.js loyihalarida:',
            '// create-next-app sukut bo\'yicha paths ni "./*" qilib qo\'yadi.',
            '// Uni darhol "./src/*" ga o\'zgartiring, aks holda linter',
            '// root katalogdagi configlarni ham tahlil qilib chalkashadi.'
          ];
          tsCode.forEach((line, i) => {
            text(line, 1040, 280 + i * 36, { size: 14.5, fam: MONO, weight: 600, color: line.startsWith('// ⚠️') ? C.red : line.startsWith('//') ? C.soft : C.ink });
          });
        });
      });
    }

    // SCENE 3: NO_RESTRICTED_IMPORTS (S.no_restricted_imports.s - S.boundaries_plagini.s)
    else if (t < S.boundaries_plagini.s) {
      drawTower(t, { hlFloor: 1, alpha: 0.35, showLabels: false });
      pill("PUBLIC API HIMOYASI: NO-RESTRICTED-IMPORTS", 180, 80, C.purple, { size: 26 });

      const kRest = eo(P(t, S.no_restricted_imports.s + 0.3, 0.8));
      withA(kRest, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: ESLint konfiguratsiyasi
        ctx.save(); ctx.fillStyle = '#faf5ff'; ctx.beginPath(); ctx.roundRect(180, 190, 880, 740, 16); ctx.fill();
        ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("eslint.config.mjs (Core ESLint qoidasi)", 210, 225, C.purple, { size: 16 });

        const restCode = [
          '// Qo\'shimcha plaginlarsiz, ESLint ning o\'z imkoniyati:',
          '{',
          '  files: ["src/**/*.{ts,tsx,vue}"],',
          '  rules: {',
          '    "no-restricted-imports": ["error", {',
          '      patterns: [{',
          '        // Slice ichidagi fayllarga chuqur kirishni taqiqlash:',
          '        // Ruxsat: @/entities/product',
          '        // Taqiq:  @/entities/product/lib/format-price',
          '        regex: "^@/(pages|widgets|features|entities)/[^/]+/(?!index\\\\.server$).+",',
          '        message: "Slice ga faqat public API orqali kiring: \'@/<qatlam>/<slice>\'"',
          '      }]',
          '    }]',
          '  }',
          '}'
        ];
        restCode.forEach((line, i) => {
          text(line, 210, 275 + i * 35, { size: 14.5, fam: MONO, weight: 600, color: line.startsWith('        regex:') ? C.purple : line.startsWith('        //') || line.startsWith('//') ? C.soft : C.ink });
        });

        // Right: Nega bu qoida zarur?
        const kWhy = eo(P(t, L('L6').s, 0.8));
        withA(kWhy, () => {
          ctx.save(); ctx.fillStyle = '#fff1f2'; ctx.beginPath(); ctx.roundRect(1090, 190, 650, 740, 16); ctx.fill();
          ctx.strokeStyle = '#fecdd3'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("IDE Auto-Import Tuzog'i", 1120, 225, C.red, { size: 16 });

          text("IDE auto-import qanday qilib xato qiladi?", 1120, 280, { size: 16, weight: 700, color: C.red });

          const whyNotes = [
            {
              title: "1. Chuqur yo'lni tanlash",
              desc: "Komponent bir necha joydan eksport bo'lsa, IDE ko'pincha eng chuqur faylni taklif qiladi."
            },
            {
              title: "2. Public API ni chetlab o'tish",
              desc: "@/entities/product/ui/ProductCard.tsx importi ichki tuzilmaga bog'lab qo'yadi."
            },
            {
              title: "3. Darhol qizil ogohlantirish",
              desc: "ESLint bu satr yozilishi bilanoq IDE da xato beradi va to'g'ri public API ni eslatadi."
            }
          ];

          whyNotes.forEach((wn, i) => {
            const wny = 340 + i * 160;
            pill(wn.title, 1120, wny, C.red, { size: 15 });
            text(wn.desc, 1120, wny + 45, { size: 14.5, weight: 500, color: C.ink });
          });
        });
      });
    }

    // SCENE 4: BOUNDARIES_PLAGINI (S.boundaries_plagini.s - S.natijalar_va_ide.s)
    else if (t < S.natijalar_va_ide.s) {
      drawTower(t, { hlFloor: 3, alpha: 0.35, showLabels: false });
      pill("ESLINT-PLUGIN-BOUNDARIES VA QATLAM IERARXIYASI", 180, 80, C.blue, { size: 26 });

      const kBnd = eo(P(t, S.boundaries_plagini.s + 0.3, 0.8));
      withA(kBnd, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: boundaries konfiguratsiyasi
        ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(180, 190, 880, 740, 16); ctx.fill();
        ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("eslint-plugin-boundaries (7-versiya API)", 210, 225, C.blue, { size: 16 });

        const bndCode = [
          'import boundaries from "eslint-plugin-boundaries"',
          '',
          'const layer = (type, ...below) => ({',
          '  from: { element: { type } },',
          '  allow: { to: { element: { types: { anyOf: [',
          '    type === "shared" ? "shared" : null, ...below',
          '  ].filter(Boolean) } } } }',
          '})',
          '',
          '// Ierarxiya qoidalari (policies):',
          'policies: [',
          '  { allow: { to: { module: { origin: "external" } } } }, // npm paketlar',
          '  layer("app", "app", "pages", "widgets", "features", "entities", "shared"),',
          '  layer("pages", "widgets", "features", "entities", "shared"),',
          '  layer("widgets", "features", "entities", "shared"),',
          '  layer("features", "entities", "shared"),',
          '  layer("entities", "shared"),',
          '  layer("shared")',
          ']'
        ];
        bndCode.forEach((line, i) => {
          text(line, 210, 268 + i * 29, { size: 13.5, fam: MONO, weight: 600, color: line.startsWith('  layer') ? C.blue : line.startsWith('//') ? C.soft : C.ink });
        });

        // Right: Qatlamlar sxemasi
        const kRightBnd = eo(P(t, L('L9').s, 0.8));
        withA(kRightBnd, () => {
          ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(1090, 190, 650, 740, 16); ctx.fill();
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("Ierarxiya va Cross-Import Taqiqlari", 1120, 225, C.indigo, { size: 16 });

          const hierarchy = [
            { l: 'app', ok: 'barcha qatlamlarni ko\'radi', col: '#a78bfa' },
            { l: 'pages', ok: 'widgets, features, entities, shared', col: '#60a5fa' },
            { l: 'widgets', ok: 'features, entities, shared', col: '#34d399' },
            { l: 'features', ok: 'entities va shared (boshqa feature taqiqlanadi)', col: '#fbbf24' },
            { l: 'entities', ok: 'faqat shared (yuqoriga yoki yonlama taqiq)', col: '#fb7185' },
            { l: 'shared', ok: 'faqat o\'z segmentlari', col: '#94a3b8' }
          ];

          hierarchy.forEach((h, i) => {
            const hy = 290 + i * 105;
            pill(h.l, 1120, hy, h.col, { size: 14.5, mono: true });
            text(h.ok, 1120, hy + 38, { size: 13.5, weight: 600, color: C.ink });
          });
        });
      });
    }

    // SCENE 5: NATIJALAR VA IDE (S.natijalar_va_ide.s - S.tipik_xatolar.s)
    else if (t < S.tipik_xatolar.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("IDE DA REAL VAQTLI HIMOYASI VA NATIJALAR", 180, 80, C.green, { size: 26 });

      const kIde = eo(P(t, S.natijalar_va_ide.s + 0.3, 0.8));
      withA(kIde, () => {
        // Container: Mock IDE Editor
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#1e1e2e'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#313244'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // IDE Window header
        ctx.fillStyle = '#181825'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 50, [20, 20, 0, 0]); ctx.fill();
        ctx.fillStyle = '#f38ba8'; ctx.beginPath(); ctx.arc(170, 175, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f9e2af'; ctx.beginPath(); ctx.arc(195, 175, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#a6e3a1'; ctx.beginPath(); ctx.arc(220, 175, 7, 0, Math.PI * 2); ctx.fill();
        text("CatalogPage.tsx — Visual Studio Code", SW / 2, 175, { size: 15, color: '#a6adc8', align: 'center', fam: MONO });

        // Line 1: Chuqur import xatosi
        const kL1 = eo(P(t, L('L10').s, 0.8));
        withA(kL1, () => {
          const l1Code = "import { formatPrice } from '@/entities/product/lib/format-price';";
          text("1", 170, 250, { size: 16, color: '#585b70', fam: MONO });
          text(l1Code, 210, 250, { size: 17, color: '#cdd6f4', fam: MONO });
          wavyUnderline(490, 930, 260, C.red);

          // Error tooltip
          ctx.save(); ctx.fillStyle = 'rgba(243, 139, 168, 0.15)'; ctx.beginPath(); ctx.roundRect(210, 280, 1200, 75, 10); ctx.fill();
          ctx.strokeStyle = '#f38ba8'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
          text("✕ no-restricted-imports: Slice ga faqat public API orqali kiring: '@/entities/product'", 230, 317, { size: 15, fam: MONO, weight: 600, color: '#f38ba8' });
        });

        // Line 2: Yuqoriga import xatosi
        const kL2 = eo(P(t, L('L10').s + 2.5, 0.8));
        withA(kL2, () => {
          const l2Code = "import { AddToCartButton } from '@/features/add-to-cart'; // in entities/product";
          text("5", 170, 420, { size: 16, color: '#585b70', fam: MONO });
          text(l2Code, 210, 420, { size: 17, color: '#cdd6f4', fam: MONO });
          wavyUnderline(210, 720, 430, C.red);

          // Error tooltip
          ctx.save(); ctx.fillStyle = 'rgba(243, 139, 168, 0.15)'; ctx.beginPath(); ctx.roundRect(210, 450, 1200, 75, 10); ctx.fill();
          ctx.strokeStyle = '#f38ba8'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
          text("✕ boundaries/dependencies: No policy allowing import from 'entities' to 'features'", 230, 487, { size: 15, fam: MONO, weight: 600, color: '#f38ba8' });
        });

        // Benefits Banner
        const kBen = eo(P(t, L('L11').s, 0.8));
        withA(kBen, () => {
          ctx.save(); ctx.fillStyle = '#11111b'; ctx.beginPath(); ctx.roundRect(180, 590, 1560, 220, 16); ctx.fill();
          ctx.strokeStyle = '#a6e3a1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

          pill("✅ Real-Time Himoya Natijasi", 210, 625, C.green, { size: 16 });
          text("• Dasturchi kod yozayotgandayoq xatoni ko'radi va darhol to'g'irlaydi.", 210, 675, { size: 16, color: '#cdd6f4' });
          text("• CI ga hech qanday noto'g'ri import yetib bormaydi, vaqt tejaladi.", 210, 715, { size: 16, color: '#cdd6f4' });
          text("• Jamoa yangi a'zolari FSD qoidalarini IDE orqali tabiiy o'rganadi.", 210, 755, { size: 16, color: '#cdd6f4' });
        });
      });
    }

    // SCENE 6: TIPIK XATOLAR (S.tipik_xatolar.s - S.xulosa.s)
    else if (t < S.xulosa.s) {
      drawTower(t, { alpha: 0.2, showLabels: false });
      pill("ALIAS VA ESLINT DAGI TIPIK XATOLAR", 180, 80, C.red, { size: 26 });

      const kErr = eo(P(t, S.tipik_xatolar.s + 0.3, 0.8));
      withA(kErr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const errors = [
          {
            title: "1. Faqat bundler aliasini sozlab, tsconfig paths ni unutish",
            bad: "Vite yoki Webpack ishlaydi, ammo IDE, tsc va ESLint resolver '@/' yo'llarini topolmaydi.",
            good: "Ikkalasini ham bir xil sozlang: tsconfig paths '@/*': ['./src/*'].",
            line: 'L12'
          },
          {
            title: "2. Internetdagi eski boundaries 6 sintaksisidan nusxa olish",
            bad: "Eski 'boundaries/element-types' qoidasi 7-versiyada eskirgan va xatolik beradi.",
            good: "Joriy 7-versiya sintaksisi: 'boundaries/dependencies' va 'policies' massividan foydalaning.",
            line: 'L12'
          },
          {
            title: "3. eslint-import-resolver-typescript plaginini o'rnatmaslik",
            bad: "ESLint resolver bo'lmasa, boundaries plagini tsconfig paths ni o'qiy olmaydi.",
            good: "'npm i -D eslint-import-resolver-typescript' o'rnating va settings ga qo'shing.",
            line: 'L13'
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
        pill('34-BOB: XULOSA VA KEYINGI QADAM', SW / 2, 80, C.violet, { size: 28, align: 'center' });
        text("Steiger va ESLint — arxitektura intizomini ham IDE da, ham CI da 100% ta'minlaydi", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      const kCards = eo(P(t, L('L14').s, 0.8));
      withA(kCards, () => {
        const cards = [
          {
            title: 'ESLint: IDE Himoyasi',
            desc: 'no-restricted-imports va boundaries real-time',
            col: C.violet,
            x: 240,
            y: 750
          },
          {
            title: 'Steiger: CI Himoyasi',
            desc: 'Butun loyiha tuzilmasini qat\'iy tekshirish',
            col: C.green,
            x: 740,
            y: 750
          },
          {
            title: 'Yagona tsconfig paths',
            desc: 'Barcha vositalar uchun bir xil @/ aliasi',
            col: C.blue,
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

      const kNext = eo(P(t, L('L15').s, 0.8));
      withA(kNext, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 450, SH - 140, 900, 75, 16); ctx.fill();
        ctx.strokeStyle = C.violet; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Keyingi bob: 35 — FSD'da testlash strategiyasi", SW / 2, SH - 103, { size: 24, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // Pastki progress bar
    const prg = clamp(t / TM.end);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, SH - 6, SW, 6);
    ctx.fillStyle = C.violet; ctx.fillRect(0, SH - 6, SW * prg, 6);
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
    drawTower(10, { hlFloor: 2, lift: [0, 0, 0, 0, 0, 0], descLabels: false });
    text('FSD', 1150, 360, { size: 170, weight: 800, color: C.violet });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('34-bob · eslint, typescript va aliaslar', 1158, 545, { size: 34, color: C.soft });
  };
})();
