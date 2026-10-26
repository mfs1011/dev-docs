// FSD 27-bob videosi: "React + Vite shabloni" — React 19, Vite, TanStack Query, React Router va Steiger
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
    { id: 'shared', col: '#94a3b8', uz: 'api, ui/button, routes, config' },
    { id: 'entities', col: '#fb7185', uz: 'product: ProductCard' },
    { id: 'features', col: '#fbbf24', uz: 'add-to-cart: AddToCartButton' },
    { id: 'widgets', col: '#34d399', uz: 'header: Header' },
    { id: 'pages', col: '#60a5fa', uz: 'home, product: lazy sahifalar' },
    { id: 'app', col: '#a78bfa', uz: 'entrypoint, providers, routes' },
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
      [S.yaratish_va_sozlash.s, [320, 10, 0.95]],
      [S.steiger_linteri.s, [360, 20, 0.92]],
      [S.app_va_provayderlar.s, [360, 20, 0.92]],
      [S.kompozitsiya_amalda.s, [400, 30, 0.9]],
      [S.tipik_xatolar.s, [400, 30, 0.9]],
      [S.xulosa.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.yaratish_va_sozlash.s)
    if (t < S.yaratish_va_sozlash.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill('27-BOB: REACT + VITE ISHLAB CHIQARISH SHABLONI', SW / 2, 80, C.blue, { size: 28, align: 'center' });
        text("React 19 + Vite 8 + TanStack Query + React Router + Steiger", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating tech stack badges
      const kBadges = eo(P(t, L('L1').s + 4, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: 'React 19 & React Router 8', x: 260, y: 320, col: '#38bdf8' },
          { s: 'Vite 8 & TypeScript 6', x: 300, y: 440, col: '#6366f1' },
          { s: 'TanStack Query 5', x: 270, y: 560, col: '#ef4444' },
          { s: 'Steiger FSD Linter', x: 1560, y: 340, col: C.purple },
          { s: 'Build: 0 errors (Passed)', x: 1510, y: 460, col: C.green }
        ];
        badges.forEach((b, idx) => {
          const bob = Math.sin(t * 2.5 + idx) * 8;
          pill(b.s, b.x, b.y + bob, b.col, { size: 20, mono: true });
        });
      });

      const k2 = eo(P(t, L('L2').s, 0.8));
      withA(k2, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 460, SH - 140, 920, 75, 16); ctx.fill();
        ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Haqiqiy ishlab chiqarish talablarida sinovdan o'tgan FSD arxitekturasi", SW / 2, SH - 103, { size: 23, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: YARATISH VA SOZLASH (S.yaratish_va_sozlash.s - S.steiger_linteri.s)
    else if (t < S.steiger_linteri.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("LOYIHANI YARATISH VA BOSH SOZLAMALAR", 180, 80, C.blue, { size: 26 });

      const kSetup = eo(P(t, S.yaratish_va_sozlash.s + 0.3, 0.8));
      withA(kSetup, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Terminal block
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(180, 190, 1560, 220, 16); ctx.fill(); ctx.restore();
        pill('Boshlang\'ich buyruqlar', 220, 235, C.purple, { size: 18 });

        const cmds = [
          `npm create vite@latest my-shop -- --template react-ts --no-interactive`,
          `cd my-shop && npm i react-router @tanstack/react-query`,
          `npm i -D steiger @feature-sliced/steiger-plugin`,
          `rm -rf src && mkdir src  # Standart src o'rniga FSD qatlamlari yoziladi`
        ];
        cmds.forEach((cmd, idx) => {
          text(cmd, 220, 280 + idx * 34, { size: 18, fam: MONO, weight: 600, color: '#38bdf8' });
        });

        // 2 Side Config Cards
        // Left: index.html entrypoint
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 440, 750, 470, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill('index.html — Kirish Nuqtasi', 220, 485, C.blue, { size: 20 });
        text("Standart src/main.tsx o'rniga app qatlamiga ulanadi:", 220, 540, { size: 19, weight: 600, color: C.ink });

        const htmlCode = [
          `<!doctype html>`,
          `<html lang="uz">`,
          `  <body>`,
          `    <div id="root"></div>`,
          `    <!-- Yangi to'g'ri FSD yo'li: -->`,
          `    <script type="module"`,
          `      src="/src/app/entrypoint/main.tsx">`,
          `    </script>`,
          `  </body>`,
          `</html>`
        ];
        htmlCode.forEach((hl, idx) => {
          const isHl = hl.includes('main.tsx');
          text(hl, 220, 580 + idx * 30, { size: 17, fam: MONO, weight: isHl ? 700 : 500, color: isHl ? '#0284c7' : '#334155' });
        });

        // Right: vite.config.ts & tsconfig.app.json alias
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(970, 440, 770, 470, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill('Alias Sozlamasi (@/* → src/*)', 1010, 485, C.green, { size: 20 });
        text("Vite va TypeScript uchun bir vaqtda moslanishi shart:", 1010, 540, { size: 19, weight: 600, color: C.ink });

        const aliasCode = [
          `// vite.config.ts`,
          `resolve: {`,
          `  alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }`,
          `}`,
          ``,
          `// tsconfig.app.json (compilerOptions ichida)`,
          `"paths": {`,
          `  "@/*": ["./src/*"]`,
          `}`
        ];
        aliasCode.forEach((al, idx) => {
          const isHl = al.includes('alias') || al.includes('"paths"');
          text(al, 1010, 580 + idx * 32, { size: 17, fam: MONO, weight: isHl ? 700 : 500, color: isHl ? '#15803d' : '#334155' });
        });
      });
    }

    // SCENE 3: STEIGER LINTERI (S.steiger_linteri.s - S.app_va_provayderlar.s)
    else if (t < S.app_va_provayderlar.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("STEIGER LINTERI VA QOIDALAR KONFIGURATSIYASI", 180, 80, C.purple, { size: 26 });

      const kSteiger = eo(P(t, S.steiger_linteri.s + 0.3, 0.8));
      withA(kSteiger, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: steiger.config.ts Code
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(180, 190, 800, 720, 16); ctx.fill(); ctx.restore();
        pill('steiger.config.ts', 220, 240, C.purple, { size: 19 });

        const steigerLines = [
          `import { defineConfig } from 'steiger'`,
          `import fsd from '@feature-sliced/steiger-plugin'`,
          ``,
          `export default defineConfig([`,
          `  ...fsd.configs.recommended,`,
          `  {`,
          `    // app/providers rasmiy FSD segmenti hisoblanadi`,
          `    files: ['./src/app/**'],`,
          `    rules: {`,
          `      'fsd/segments-by-purpose': 'off'`,
          `    },`,
          `  },`,
          `])`
        ];
        steigerLines.forEach((sl, idx) => {
          const isHl = sl.includes('recommended') || sl.includes('segments-by-purpose');
          text(sl, 220, 290 + idx * 38, {
            size: 19,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#38bdf8' : sl.startsWith('//') ? '#94a3b8' : '#f8fafc'
          });
        });

        // Right: Steiger checks & rules summary
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(1020, 190, 720, 720, 16); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill('Steiger Nazorat Qiladigan Qoidalar', 1060, 240, C.blue, { size: 20 });

        const rules = [
          { name: "Public API Integrity", desc: "Har bir slice faqat index.ts orqali import qilinishi shart" },
          { name: "No Cross-Imports", desc: "Bir xil qatlamdagi slice'lar bir-birini import qila olmaydi" },
          { name: "Strict Hierarchy", desc: "Pastki qatlam yuqori qatlamni (app, pages) import qila olmaydi" },
          { name: "App Providers Exception", desc: "app/providers segmenti erkin qoida sifatida ruxsat etiladi" }
        ];

        rules.forEach((r, idx) => {
          const y0 = 310 + idx * 105;
          ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(1060, y0, 640, 85, 12); ctx.fill();
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          check(1095, y0 + 42, 1, 1.1);
          text(r.name, 1130, y0 + 28, { size: 19, weight: 700, color: C.ink });
          text(r.desc, 1130, y0 + 58, { size: 16, weight: 500, color: C.soft });
        });

        // Bottom terminal verification
        pill("✓ npx steiger src — 0 xato, to'liq muvofiqlik", 1060, 840, C.green, { size: 20, mono: true });
      });
    }

    // SCENE 4: APP VA PROVAYDERLAR (S.app_va_provayderlar.s - S.kompozitsiya_amalda.s)
    else if (t < S.kompozitsiya_amalda.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("APP QATLAMI: KIRISH NUQTASI VA PROVAYDERLAR", 180, 80, C.purple, { size: 26 });

      const kApp = eo(P(t, S.app_va_provayderlar.s + 0.3, 0.8));
      withA(kApp, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: src/app/entrypoint/main.tsx
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 720, 16); ctx.fill(); ctx.restore();
        pill('src/app/entrypoint/main.tsx', 220, 240, C.purple, { size: 19 });

        const mainCode = [
          `import { StrictMode } from 'react'`,
          `import { createRoot } from 'react-dom/client'`,
          `import { RouterProvider } from 'react-router'`,
          `import { QueryProvider } from '../providers/QueryProvider'`,
          `import { router } from '../routes/router'`,
          `import '../styles/global.css'`,
          ``,
          `createRoot(document.getElementById('root')!).render(`,
          `  <StrictMode>`,
          `    <QueryProvider>`,
          `      <RouterProvider router={router} />`,
          `    </QueryProvider>`,
          `  </StrictMode>`,
          `)`
        ];
        mainCode.forEach((ml, idx) => {
          const isHl = ml.includes('QueryProvider') || ml.includes('RouterProvider');
          text(ml, 220, 290 + idx * 38, {
            size: 19,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#38bdf8' : ml.startsWith('//') ? '#94a3b8' : '#f8fafc'
          });
        });

        // Right: QueryProvider & Router with lazy
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 720, 16); ctx.fill(); ctx.restore();
        pill('QueryProvider & Lazy Router', 1000, 240, C.blue, { size: 19 });

        const rightCode = [
          `// src/app/providers/QueryProvider.tsx`,
          `export function QueryProvider({ children }: { children: ReactNode }) {`,
          `  const [client] = useState(() => new QueryClient({`,
          `    defaultOptions: { queries: { staleTime: 30_000 } }`,
          `  }))`,
          `  return (`,
          `    <QueryClientProvider client={client}>`,
          `      {children}`,
          `    </QueryClientProvider>`,
          `  )`,
          `}`,
          ``,
          `// src/app/routes/router.tsx (Lazy sahifalar)`,
          `export const router = createBrowserRouter([`,
          `  {`,
          `    Component: MainLayout,`,
          `    children: [`,
          `      {`,
          `        path: ROUTES.home,`,
          `        lazy: async () => {`,
          `          const m = await import('@/pages/home')`,
          `          return { Component: m.HomePage }`,
          `        }`,
          `      }`,
          `    ]`,
          `  }`,
          `])`
        ];
        rightCode.forEach((rc, idx) => {
          const isHl = rc.includes('staleTime') || rc.includes('lazy: async');
          text(rc, 1000, 275 + idx * 24, {
            size: 15,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#4ade80' : rc.startsWith('//') ? '#94a3b8' : '#f8fafc'
          });
        });
      });
    }

    // SCENE 5: KOMPOZITSIYA AMALDA (S.kompozitsiya_amalda.s - S.tipik_xatolar.s)
    else if (t < S.tipik_xatolar.s) {
      drawTower(t, { alpha: 0.2, showLabels: false });
      pill("KOMPOZITSIYA: SAHIFA, FEATURE VA ENTITY", 180, 80, C.amber, { size: 26 });

      const kComp = eo(P(t, S.kompozitsiya_amalda.s + 0.3, 0.8));
      withA(kComp, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left Code: HomePage.tsx
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(180, 190, 820, 720, 16); ctx.fill(); ctx.restore();
        pill('src/pages/home/ui/HomePage.tsx — Kompozitsiya Maydoni', 220, 240, C.blue, { size: 19 });

        const homeCode = [
          `import { useQuery } from '@tanstack/react-query'`,
          `import { PRODUCT_QUERIES } from '@/shared/api'`,
          `import { ProductCard } from '@/entities/product'`,
          `import { AddToCartButton } from '@/features/add-to-cart'`,
          ``,
          `export function HomePage() {`,
          `  const { data, isPending } = useQuery(PRODUCT_QUERIES.list())`,
          `  if (isPending) return <p>Yuklanmoqda…</p>`,
          ``,
          `  return (`,
          `    <main>`,
          `      {data?.map(p => (`,
          `        <ProductCard key={p.id} product={p}`,
          `          actions={<AddToCartButton productId={p.id} />}>`,
          `          <Link to={ROUTES.product(p.id)}>Batafsil</Link>`,
          `        </ProductCard>`,
          `      ))}`,
          `    </main>`,
          `  )`,
          `}`
        ];
        homeCode.forEach((hc, idx) => {
          const isHl = hc.includes('ProductCard') || hc.includes('AddToCartButton') || hc.includes('actions=');
          text(hc, 220, 285 + idx * 31, {
            size: 17,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#38bdf8' : hc.startsWith('//') ? '#94a3b8' : '#f8fafc'
          });
        });

        // Right Diagram: Slot & Dependency Inversion
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(1040, 190, 700, 720, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill('Nega Bu Arxitektura Ideal?', 1080, 240, C.green, { size: 20 });

        const archBenefits = [
          { title: "Entity Hech Kimni Bilmaydi", desc: "ProductCard sof ko'rinish beradi, savat feature'siga bog'lanmaydi" },
          { title: "Feature Mustaqil Amal", desc: "AddToCartButton o'z mutatsiyasi va invalidatsiya mantiqiga ega" },
          { title: "Sahifa Integratori", desc: "Faqat HomePage bu ikkisini slot (actions) orqali birlashtiradi" },
          { title: "Qatlam Qoidasi Saqlanadi", desc: "Cross-import nol, pastdan yuqoriga import umuman yo'q" }
        ];

        archBenefits.forEach((ab, idx) => {
          const y0 = 310 + idx * 125;
          ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(1080, y0, 620, 105, 12); ctx.fill();
          ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          check(1115, y0 + 52, 1, 1.2);
          text(ab.title, 1150, y0 + 38, { size: 20, weight: 700, color: C.ink });
          text(ab.desc, 1150, y0 + 72, { size: 17, weight: 500, color: C.soft });
        });
      });
    }

    // SCENE 6: TIPIK XATOLAR (S.tipik_xatolar.s - S.xulosa.s)
    else if (t < S.xulosa.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("SHABLON QURISHDA TIPIK XATOLAR", 180, 80, C.red, { size: 26 });

      const kErr = eo(P(t, S.tipik_xatolar.s + 0.3, 0.8));
      withA(kErr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#fecaca'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const errors = [
          {
            title: "1. src/main.tsx va App.tsx fayllarini ildizda qoldirish",
            bad: "Ilova kodi app qatlamidan tashqarida qolib ketadi va FSD qatlam intizomi buziladi.",
            fix: "✓ Barchasini src/app/entrypoint/main.tsx ga ko'chiring va index.html ni yangilang"
          },
          {
            title: "2. Faqat Vite alias qo'yib, tsconfig.app.json'da paths ni unutish",
            bad: "IDE va tsc -b tekshiruvi @/ yo'llarini topa olmaydi, qizil chiziqlar paydo bo'ladi.",
            fix: "✓ tsconfig.app.json da 'paths': { '@/*': ['./src/*'] } sozlamasini kiritish shart"
          },
          {
            title: "3. Lazy importda public API ni chetlab o'tish (ui/HomePage)",
            bad: "Steiger linteri 'fsd/public-api' qoidasi bo'yicha xato beradi va build to'xtaydi.",
            fix: "✓ import('@/pages/home') ko'rinishida faqat public API orqali yuklang"
          },
          {
            title: "4. Umumiy src/assets papkasini qoldirish",
            bad: "Steiger qatlamdan tashqaridagi fayllarni tekshirmaydi, natijada u o'lik fayllar qutisiga aylanadi.",
            fix: "✓ Rasmlarni o'z slice'i ichiga joylashtiring (pages/home/ui/hero.jpg)"
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
      pill("XULOSA: REACT + VITE SHABLONI TAYYOR!", SW / 2, 80, C.green, { size: 28, align: 'center' });

      const kEnd = eo(P(t, S.xulosa.s + 0.5, 0.9));
      withA(kEnd, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowBlur = 24;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 580, 150, 1160, 750, 24); ctx.fill();
        ctx.strokeStyle = '#bbf7d0'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

        const checklist = [
          "React 19 + Vite 8 + TanStack Query 5 + React Router 8 to'liq sinovdan o'tdi",
          "Standart src tuzilmasi to'liq FSD qatlamlariga almashtirildi",
          "index.html -> /src/app/entrypoint/main.tsx orqali ishga tushadi",
          "Steiger linteri: 0 ta xato bilan qat'iy arxitektura nazorati o'rnatildi",
          "app/entrypoint va app/providers orqali global o'ramlar boshqariladi",
          "Kompozitsiya: sahifa entity va feature'larni slot orqali bog'laydi",
          "Katta va uzoq muddatli loyihalar uchun ishonchli poydevor yaratildi!"
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
          pill("Keyingi dars: 28-bob — Next.js va server komponentlari shabloni →", SW / 2, 820, C.blue, { size: 22, align: 'center' });
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
    drawTower(10, { hlFloor: 4, lift: [0, 0, 0, 0, 0, 0], descLabels: false });
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#3b5bdb' });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('27-bob · react + vite shabloni', 1158, 545, { size: 34, color: C.soft });
  };
})();
