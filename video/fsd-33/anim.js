// FSD 33-bob videosi: "Steiger" — FSD rasmiy linteri, CLI bayroqlari, 17 ta qoida, config va CI
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
    emerald: '#059669'
  };

  // Qatlamlar (pastdan yuqoriga)
  const LAYERS = [
    { id: 'shared', col: '#94a3b8', uz: 'shared-lib-grouping, public-api' },
    { id: 'entities', col: '#fb7185', uz: 'inconsistent-naming, public-api' },
    { id: 'features', col: '#fbbf24', uz: 'no-cross-imports, segments-by-purpose' },
    { id: 'widgets', col: '#34d399', uz: 'forbidden-imports, public-api' },
    { id: 'pages', col: '#60a5fa', uz: 'insignificant-slice, public-api' },
    { id: 'app', col: '#a78bfa', uz: 'no-ui-in-app, typo-in-layer-name' },
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
      [S.ornatish_va_bayroqlar.s, [320, 10, 0.95]],
      [S.asosiy_qoidalar.s, [360, 20, 0.92]],
      [S.konfiguratsiya_va_istisnolar.s, [380, 25, 0.9]],
      [S.ci_va_katta_loyihalar.s, [360, 20, 0.92]],
      [S.tipik_xatolar.s, [400, 30, 0.9]],
      [S.xulosa.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.ornatish_va_bayroqlar.s)
    if (t < S.ornatish_va_bayroqlar.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill('33-BOB: STEIGER — FSD ARXITEKTURA LINTERI', SW / 2, 80, C.emerald, { size: 28, align: 'center' });
        text("FSD qoidalarini CI da majburiy va qat'iy tekshirish vositasi", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating tech badges
      const kBadges = eo(P(t, L('L1').s + 3.0, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: 'steiger 0.7.0', x: 260, y: 320, col: C.emerald },
          { s: '@feature-sliced/plugin', x: 290, y: 440, col: C.teal },
          { s: '17 Qat\'iy Qoidalar', x: 270, y: 560, col: C.blue },
          { s: 'CI: exit 1 on error', x: 1560, y: 340, col: C.red },
          { s: 'tsconfig paths integratsiya', x: 1510, y: 460, col: C.purple }
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
        ctx.strokeStyle = C.emerald; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("FSD qoidalari kelishuvda qolsa buziladi — Steiger ularni CI da kafolatlaydi", SW / 2, SH - 103, { size: 22, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: O'RNATISH VA BAYROQLAR (S.ornatish_va_bayroqlar.s - S.asosiy_qoidalar.s)
    else if (t < S.asosiy_qoidalar.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("O'RNATISH VA CLI BAYROQLARI", 180, 80, C.emerald, { size: 26 });

      const kRes = eo(P(t, S.ornatish_va_bayroqlar.s + 0.3, 0.8));
      withA(kRes, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: O'rnatish va asosiy buyruqlar
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 740, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill("Terminal Buyruqlari", 210, 225, C.ink, { size: 18, mono: true });

        const cmds = [
          '# 1. Paketlarni o\'rnatish',
          '$ npm i -D steiger @feature-sliced/steiger-plugin',
          '',
          '# 2. Bir marta tekshirish (CI va lokal)',
          '$ npx steiger src',
          '',
          '# 3. Fayl o\'zgarishlarini kuzatish',
          '$ npx steiger src --watch',
          '',
          '# 4. Yetishmayotgan public API larni avto-tuzatish',
          '$ npx steiger src --fix',
          '',
          '// Xato bo\'lsa exit code 1 bilan tugaydi va CI ni to\'xtatadi!'
        ];
        cmds.forEach((cmd, i) => {
          text(cmd, 210, 275 + i * 35, { size: 14.5, fam: MONO, weight: 600, color: cmd.startsWith('$') ? C.emerald : cmd.startsWith('//') ? C.red : C.soft });
        });

        // Right: CLI Flaglar jadvali
        const kRight = eo(P(t, L('L4').s, 0.8));
        withA(kRight, () => {
          ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 740, 16); ctx.fill();
          ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("Asosiy CLI Bayroqlari (Flags)", 990, 225, C.blue, { size: 16 });

          const flags = [
            { flag: '--watch, -w', desc: 'Fayllar saqlanishi bilan avtomatik qayta tekshiradi' },
            { flag: '--fix', desc: 'Yetishmayotgan index.ts public API larni avtomatik yaratadi' },
            { flag: '--fail-on-warnings', desc: 'Ogohlantirishlarda ham exit 1 qaytarib, CI ni qizil qiladi' },
            { flag: '--ignore-warnings', desc: 'Faqat xatolarni (errors) ko\'rsatadi — katta loyihalar uchun' },
            { flag: '--reporter json', desc: 'CI vositalari tahlili uchun mashina o\'qiydigan JSON format' }
          ];

          flags.forEach((f, i) => {
            const fy = 285 + i * 115;
            pill(f.flag, 990, fy, C.blue, { size: 15, mono: true });
            text(f.desc, 990, fy + 45, { size: 14.5, weight: 500, color: C.ink });
          });
        });
      });
    }

    // SCENE 3: ASOSIY QOIDALAR (S.asosiy_qoidalar.s - S.konfiguratsiya_va_istisnolar.s)
    else if (t < S.konfiguratsiya_va_istisnolar.s) {
      drawTower(t, { hlFloor: 2, alpha: 0.35, showLabels: false });
      pill("TAVSIYA ETILGAN 17 TA ASOSIY QOIDA", 180, 80, C.blue, { size: 26 });

      const kRules = eo(P(t, S.asosiy_qoidalar.s + 0.3, 0.8));
      withA(kRules, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: 5 ta eng muhim qoida
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 740, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("Eng Muhim Arxitektura Qoidalari", 210, 225, C.ink, { size: 16 });

        const topRules = [
          { name: 'forbidden-imports', desc: 'Yuqoriga import va yonlama cross-importni to\'liq taqiqlaydi' },
          { name: 'no-public-api-sidestep', desc: 'Slice ichki fayllariga chuqur import qilishni to\'xtatadi' },
          { name: 'public-api', desc: 'Har bir slice va segmentda index.ts bo\'lishini talab qiladi' },
          { name: 'insignificant-slice', desc: 'Faqat 1 joyda ishlatilgan slice ni tegishli joyga qo\'shishni aytadi' },
          { name: 'excessive-slicing', desc: 'Qatlamda 20 tadan ko\'p guruhlanmagan slice bo\'lishini cheklaydi' }
        ];

        topRules.forEach((r, i) => {
          const ry = 280 + i * 115;
          pill(r.name, 210, ry, C.purple, { size: 14.5, mono: true });
          text(r.desc, 210, ry + 42, { size: 13.5, weight: 500, color: C.ink });
        });

        // Right: segments-by-purpose va taqiqlangan nomlar
        const kPurp = eo(P(t, L('L7').s, 0.8));
        withA(kPurp, () => {
          ctx.save(); ctx.fillStyle = '#fff1f2'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 740, 16); ctx.fill();
          ctx.strokeStyle = '#fecdd3'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("segments-by-purpose: Rad etiladigan nomlar", 990, 225, C.red, { size: 16 });

          text("Steiger tur bo'yicha nomlangan papkalarni qat'iy rad etadi:", 990, 275, { size: 15, weight: 600, color: C.red });

          const banned = [
            'components', 'helpers', 'utils', 'constants',
            'types', 'stores', 'services', 'enums',
            'hooks', 'context', 'providers', 'pipes',
            'actions', 'reducers', 'selectors', 'assets'
          ];

          banned.forEach((b, idx) => {
            const col = idx % 4;
            const row = Math.floor(idx / 4);
            const bx = 990 + col * 180;
            const by = 320 + row * 60;
            pill('✕ ' + b, bx, by, '#fee2e2', { size: 14, mono: true, fg: C.red });
          });

          text("To'g'ri FSD segment nomlari: faqat maqsad bo'yicha:", 990, 600, { size: 15, weight: 700, color: C.green });
          const allowed = [
            'ui', 'model', 'api', 'lib', 'config', 'routes'
          ];
          allowed.forEach((a, idx) => {
            const ax = 990 + idx * 125;
            pill('✓ ' + a, ax, 650, '#dcfce7', { size: 15, mono: true, fg: C.green });
          });
        });
      });
    }

    // SCENE 4: KONFIGURATSIYA VA ISTISNOLAR (S.konfiguratsiya_va_istisnolar.s - S.ci_va_katta_loyihalar.s)
    else if (t < S.ci_va_katta_loyihalar.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("STEIGER.CONFIG.TS VA ANIQ ISTISNOLAR", 180, 80, C.purple, { size: 26 });

      const kCfg = eo(P(t, S.konfiguratsiya_va_istisnolar.s + 0.3, 0.8));
      withA(kCfg, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: steiger.config.ts kodi
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 880, 740, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("steiger.config.ts (ESLint Flat Config uslubida)", 210, 225, C.purple, { size: 16 });

        const cfgCode = [
          'import { defineConfig } from "steiger"',
          'import fsd from "@feature-sliced/steiger-plugin"',
          '',
          'export default defineConfig([',
          '  // 1. Tavsiya etilgan 17 ta FSD qoidasi:',
          '  ...fsd.configs.recommended,',
          '',
          '  // 2. app qatlamidagi providers papkasi uchun istisno (12-bob):',
          '  {',
          '    files: ["./src/app/**"],',
          '    rules: { "fsd/segments-by-purpose": "off" }',
          '  },',
          '',
          '  // 3. Next.js dagi _app va _pages uchun nom xatosini o\'chirish (28-bob):',
          '  {',
          '    rules: { "fsd/typo-in-layer-name": "off" }',
          '  },',
          '])'
        ];
        cfgCode.forEach((line, i) => {
          text(line, 210, 275 + i * 32, { size: 14.5, fam: MONO, weight: 600, color: line.startsWith('  //') ? C.soft : C.ink });
        });

        // Right: Qoidalar tushuntirishi
        const kRightCfg = eo(P(t, L('L9').s, 0.8));
        withA(kRightCfg, () => {
          ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(1090, 190, 650, 740, 16); ctx.fill();
          ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("Istisno Yozish Madaniyati", 1120, 225, C.blue, { size: 16 });

          const notes = [
            {
              title: "1. Har doim izoh yozing",
              desc: "Nega qoida o'chirilganini va qachon qayta ko'rilishini aniq ko'rsating."
            },
            {
              title: "2. Faqat kerakli fayllarga (files)",
              desc: "Butun loyihada emas, faqat istisno talab qiladigan papkaga 'off' bering."
            },
            {
              title: "3. Framework talablari uchun",
              desc: "Next.js (_app) yoki Angular (providers) kabi tizimli nomlarni moslashtiring."
            },
            {
              title: "4. tsconfig paths tekshiruvi",
              desc: "Steiger importlarni tsconfig orqali o'qiydi — aliaslar to'g'ri bo'lishi shart."
            }
          ];

          notes.forEach((n, i) => {
            const ny = 290 + i * 140;
            pill(n.title, 1120, ny, C.indigo, { size: 15 });
            text(n.desc, 1120, ny + 45, { size: 14, weight: 500, color: C.ink });
          });
        });
      });
    }

    // SCENE 5: CI VA KATTA LOYIHALAR (S.ci_va_katta_loyihalar.s - S.tipik_xatolar.s)
    else if (t < S.tipik_xatolar.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("CI INTEGRATSIYASI VA BOSQICHMA-BOSQICH JORIY QILISH", 180, 80, C.green, { size: 26 });

      const kCi = eo(P(t, S.ci_va_katta_loyihalar.s + 0.3, 0.8));
      withA(kCi, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: GitHub Actions CI
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 740, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill(".github/workflows/ci.yml (Avtomat Tekshiruv)", 210, 225, C.ink, { size: 16 });

        const ymlCode = [
          '# Har bir Pull Request da Steiger ishga tushadi:',
          'jobs:',
          '  lint-and-build:',
          '    runs-on: ubuntu-latest',
          '    steps:',
          '      - uses: actions/checkout@v4',
          '      - uses: actions/setup-node@v4',
          '        with: { node-version: 22 }',
          '',
          '      - run: npm ci',
          '      - run: npm run lint:fsd    # <-- EXIT 1: PR qizil bo\'ladi!',
          '      - run: npm run build',
          '',
          '// Natija: Hech bir arxitektura buzilishi main ga kirmaydi!'
        ];
        ymlCode.forEach((line, i) => {
          text(line, 210, 275 + i * 34, { size: 14.5, fam: MONO, weight: 600, color: line.includes('EXIT 1') ? C.red : line.startsWith('#') ? C.soft : C.ink });
        });

        // Right: Katta loyihalarga kiritish rejasi
        const kPlan = eo(P(t, L('L11').s, 0.8));
        withA(kPlan, () => {
          ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 740, 16); ctx.fill();
          ctx.strokeStyle = '#bbf7d0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("Mavjud Loyihaga Bosqichma-bosqich Kiritish", 990, 225, C.green, { size: 16 });

          const steps = [
            {
              s: "1-Qadam: npx steiger src --ignore-warnings",
              d: "Ogohlantirishlarni chetga surib, faqat qizil xatolarni ro'yxatga oling."
            },
            {
              s: "2-Qadam: npx steiger src --fix",
              d: "Yetishmayotgan barcha public API index fayllarini avtomatik yarating."
            },
            {
              s: "3-Qadam: Qoidalar bo'yicha guruhlab tuzatish",
              d: "Avval forbidden-imports, keyin sidestep xatolarini jamoa bilan to'g'rilang."
            },
            {
              s: "4-Qadam: CI ga kiritish va yangi xatolarni to'xtatish",
              d: "Loyiha toza bo'lgach, CI da qat'iy majburiy qiling."
            }
          ];

          steps.forEach((st, i) => {
            const sy = 285 + i * 140;
            check(1005, sy + 10, 1, 0.9);
            text(st.s, 1035, sy + 10, { size: 16, weight: 700, color: C.green });
            text(st.d, 1035, sy + 45, { size: 14.5, weight: 500, color: C.ink });
          });
        });
      });
    }

    // SCENE 6: TIPIK XATOLAR (S.tipik_xatolar.s - S.xulosa.s)
    else if (t < S.xulosa.s) {
      drawTower(t, { alpha: 0.2, showLabels: false });
      pill("STEIGER FOYDALANISHIDAGI TIPIK XATOLAR", 180, 80, C.red, { size: 26 });

      const kErr = eo(P(t, S.tipik_xatolar.s + 0.3, 0.8));
      withA(kErr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const errors = [
          {
            title: "1. Steigerni faqat lokalda ishlatib, CI ga qo'shmaslik",
            bad: "Dasturchilar shoshilganda tekshirmaydi va birinchi shoshilinch PR da arxitektura buziladi.",
            good: "CI da 'npm run lint:fsd' ni majburiy qiling — exit 1 nosoz PR ni to'xtatadi.",
            line: 'L12'
          },
          {
            title: "2. Xatolarni o'rganmasdan qoidalarni shunchaki o'chirib tashlash",
            bad: "Linter xato berganda 'off' qilib ketaverish FSD arxitekturasini jimgina yo'q qiladi.",
            good: "Kodni to'g'rilang; faqat oqlangan holatlarda (masalan app/providers) izoh bilan istisno bering.",
            line: 'L12'
          },
          {
            title: "3. tsconfig paths noto'g'ri sozlanganligi tufayli soxta xatolar",
            bad: "Steiger aliasni topolmaydi va slice larni 'hech kim ishlatmaydi' deb xato beradi.",
            good: "Qoidani emas, avval tsconfig.json paths: { '@/*': ['./src/*'] } sozlamasini tekshiring.",
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
        pill('33-BOB: XULOSA VA KEYINGI QADAM', SW / 2, 80, C.emerald, { size: 28, align: 'center' });
        text("Steiger — jamoada FSD intizomini saqlash va kod sifatini himoya qilish kafolati", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      const kCards = eo(P(t, L('L14').s, 0.8));
      withA(kCards, () => {
        const cards = [
          {
            title: '17 Qat\'iy Qoida',
            desc: 'Cross-import va public API buzilishidan to\'liq himoya',
            col: C.blue,
            x: 240,
            y: 750
          },
          {
            title: 'CI Exit Code 1',
            desc: 'Nosoz kod hech qachon asosiy tarmoqqa kirmaydi',
            col: C.red,
            x: 740,
            y: 750
          },
          {
            title: 'Aniq Istisnolar',
            desc: 'Framework talablariga mos egiluvchan sozlash',
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

      const kNext = eo(P(t, L('L15').s, 0.8));
      withA(kNext, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 450, SH - 140, 900, 75, 16); ctx.fill();
        ctx.strokeStyle = C.emerald; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Keyingi bob: 34 — ESLint, TypeScript va aliaslar sozlamasi", SW / 2, SH - 103, { size: 24, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // Pastki progress bar
    const prg = clamp(t / TM.end);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, SH - 6, SW, 6);
    ctx.fillStyle = C.emerald; ctx.fillRect(0, SH - 6, SW * prg, 6);
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
    text('FSD', 1150, 360, { size: 170, weight: 800, color: C.emerald });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('33-bob · steiger linteri', 1158, 545, { size: 34, color: C.soft });
  };
})();
