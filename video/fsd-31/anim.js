// FSD 31-bob videosi: "Angular shabloni" — Angular 22, standalone, signals, angular.json va Steiger
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
    ngRed: '#dd0031'
  };

  // Qatlamlar (pastdan yuqoriga)
  const LAYERS = [
    { id: 'shared', col: '#94a3b8', uz: 'api, config, routes, ui/button' },
    { id: 'entities', col: '#fb7185', uz: 'cart: CartStore, product: ProductCard' },
    { id: 'features', col: '#fbbf24', uz: 'add-to-cart: AddToCartButton' },
    { id: 'widgets', col: '#34d399', uz: 'header: Header' },
    { id: 'pages', col: '#60a5fa', uz: 'home, product: HomePage, ProductPage' },
    { id: 'app', col: '#a78bfa', uz: 'entrypoint/main.ts, routes, styles' },
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
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(px + 12, py - 20, desc ? 340 : 160, 40, 8); ctx.fill();
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
      [S.loyiha_tuzilmasi.s, [320, 10, 0.95]],
      [S.app_qatlami.s, [360, 20, 0.92]],
      [S.sahifa_va_komponentlar.s, [380, 25, 0.9]],
      [S.rasmlar_va_aktivlar.s, [360, 20, 0.92]],
      [S.tipik_xatolar.s, [400, 30, 0.9]],
      [S.xulosa.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.loyiha_tuzilmasi.s)
    if (t < S.loyiha_tuzilmasi.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill('31-BOB: ANGULAR 22 VA UNIVERSAL FSD SHABLONI', SW / 2, 80, C.ngRed, { size: 28, align: 'center' });
        text("Angular 22.2 + Standalone Komponentlar + Signals + Steiger", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating tech badges
      const kBadges = eo(P(t, L('L1').s + 4, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: 'Angular 22 (Zoneless)', x: 260, y: 320, col: C.ngRed },
          { s: 'Standalone (No NgModule)', x: 290, y: 440, col: C.purple },
          { s: 'src/app/ == FSD app layer', x: 280, y: 560, col: C.blue },
          { s: 'Signals: input/computed', x: 1560, y: 340, col: C.amber },
          { s: 'Steiger: 0 errors', x: 1510, y: 460, col: C.green }
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
        ctx.strokeStyle = C.ngRed; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Angular CLI ning src/app papkasi FSD app qatlamiga tabiiy mos keladi", SW / 2, SH - 103, { size: 22, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: LOYIHA TUZILMASI (S.loyiha_tuzilmasi.s - S.app_qatlami.s)
    else if (t < S.app_qatlami.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("LOYIHA TUZILMASI VA ANGULAR.JSON SOZLAMASI", 180, 80, C.ngRed, { size: 26 });

      const kRes = eo(P(t, S.loyiha_tuzilmasi.s + 0.3, 0.8));
      withA(kRes, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: Papkalar daraxti
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 740, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill("📁 my-shop/ Loyiha Daraxti", 210, 230, C.ink, { size: 18, mono: true });

        const treeLines = [
          { s: '├── angular.json', col: C.ngRed, note: '"browser": "src/app/entrypoint/main.ts"' },
          { s: '├── tsconfig.json', col: C.blue, note: '"paths": { "@/*": ["./src/*"] }' },
          { s: '├── steiger.config.ts', col: C.green, note: 'FSD tavsiya qoidalari' },
          { s: '└── src/', col: C.ink, note: 'Barcha kod' },
          { s: '    ├── app/', col: C.purple, note: 'app.ts, entrypoint/, routes/, styles/' },
          { s: '    ├── pages/', col: '#2563eb', note: 'home, product (loadComponent)' },
          { s: '    ├── widgets/', col: '#059669', note: 'header (Header komponent)' },
          { s: '    ├── features/', col: '#d97706', note: 'add-to-cart (AddToCartButton)' },
          { s: '    ├── entities/', col: '#e11d48', note: 'cart/model, product/ui' },
          { s: '    └── shared/', col: '#64748b', note: 'api/, config/, routes/, ui/button/' }
        ];

        treeLines.forEach((tl, i) => {
          const y = 280 + i * 44;
          text(tl.s, 220, y, { size: 16, fam: MONO, weight: 700, color: tl.col });
          text(tl.note, 520, y, { size: 14, color: C.soft, weight: 500 });
        });

        // Right: Konfiguratsiyalar
        const kRight = eo(P(t, L('L3').s + 1.0, 0.8));
        withA(kRight, () => {
          // Box 1: angular.json
          ctx.save(); ctx.fillStyle = '#fff1f2'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 230, 16); ctx.fill();
          ctx.strokeStyle = '#fecdd3'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("1. angular.json (build options)", 990, 225, C.ngRed, { size: 16 });

          const ngJson = [
            '// projects.<nom>.architect.build.options',
            '"browser": "src/app/entrypoint/main.ts",',
            '"styles": ["src/app/styles/global.css"],',
            '"assets": [ { "glob": "**/*", "input": "public" },',
            '  { "glob": "**/*.{svg,png}", "input": "src/pages", "output": "pages" } ]'
          ];
          ngJson.forEach((line, i) => {
            text(line, 1000, 265 + i * 28, { size: 14, fam: MONO, weight: 600, color: i === 0 ? C.soft : C.ink });
          });

          // Box 2: tsconfig.json paths
          const kTs = eo(P(t, L('L4').s, 0.8));
          withA(kTs, () => {
            ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(960, 440, 780, 210, 16); ctx.fill();
            ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
            pill("2. tsconfig.json (compilerOptions)", 990, 475, C.blue, { size: 16 });

            const tsJson = [
              '// esbuild builder paths ni to\'g\'ridan-to\'g\'ri tushunadi',
              '"baseUrl": ".",',
              '"paths": {',
              '  "@/*": ["./src/*"]',
              '}'
            ];
            tsJson.forEach((line, i) => {
              text(line, 1000, 515 + i * 28, { size: 15, fam: MONO, weight: 600, color: i === 0 ? C.soft : C.ink });
            });
          });

          // Box 3: Steiger linter
          const kSt = eo(P(t, L('L5').s, 0.8));
          withA(kSt, () => {
            ctx.save(); ctx.fillStyle = '#ecfdf5'; ctx.beginPath(); ctx.roundRect(960, 670, 780, 220, 16); ctx.fill();
            ctx.strokeStyle = '#a7f3d0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
            pill("3. steiger.config.ts (0 istisno kerak)", 990, 705, C.green, { size: 16 });

            const stCode = [
              'import { defineConfig } from "steiger"',
              'import fsd from "@feature-sliced/steiger-plugin"',
              '',
              'export default defineConfig([...fsd.configs.recommended])',
              '// npx steiger src -> 0 errors! Barcha cross-importlar nazoratda'
            ];
            stCode.forEach((line, i) => {
              text(line, 1000, 745 + i * 27, { size: 14, fam: MONO, weight: 600, color: i === 4 ? C.green : C.ink });
            });
          });
        });
      });
    }

    // SCENE 3: APP QATLAMI (S.app_qatlami.s - S.sahifa_va_komponentlar.s)
    else if (t < S.sahifa_va_komponentlar.s) {
      drawTower(t, { hlFloor: 5, alpha: 0.35, showLabels: false });
      pill("APP QATLAMI, ENTRYPOINT VA MARSHRUTLAR", 180, 80, C.purple, { size: 26 });

      const kMain = eo(P(t, S.app_qatlami.s + 0.3, 0.8));
      withA(kMain, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Top Left: main.ts
        ctx.save(); ctx.fillStyle = '#faf5ff'; ctx.beginPath(); ctx.roundRect(180, 190, 750, 340, 16); ctx.fill();
        ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("src/app/entrypoint/main.ts", 210, 225, C.purple, { size: 16 });

        const mainCode = [
          'import { bootstrapApplication } from "@angular/platform-browser"',
          'import { App } from "../app"',
          'import { appConfig } from "./app.config"',
          '',
          '// Ilova karkasini sozlamalar bilan ishga tushirish',
          'bootstrapApplication(App, appConfig)',
          '  .catch((err) => console.error(err))'
        ];
        mainCode.forEach((line, i) => {
          text(line, 210, 270 + i * 32, { size: 15, fam: MONO, weight: 600, color: line.startsWith('//') ? C.soft : C.ink });
        });

        // Bottom Left: app.routes.ts
        const kRoutes = eo(P(t, L('L7').s + 1.5, 0.8));
        withA(kRoutes, () => {
          ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(180, 560, 750, 370, 16); ctx.fill();
          ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("src/app/routes/app.routes.ts (Lazy Loading)", 210, 595, C.blue, { size: 16 });

          const routesCode = [
            'import type { Routes } from "@angular/router"',
            '',
            'export const routes: Routes = [',
            '  {',
            '    path: "",',
            '    loadComponent: () => import("@/pages/home").then((m) => m.HomePage)',
            '  },',
            '  {',
            '    path: "products/:id",',
            '    loadComponent: () => import("@/pages/product").then((m) => m.ProductPage)',
            '  }',
            ']'
          ];
          routesCode.forEach((line, i) => {
            text(line, 210, 635 + i * 26, { size: 14, fam: MONO, weight: 600, color: C.ink });
          });
        });

        // Right: app.config.ts
        const kCfg = eo(P(t, L('L7').s, 0.8));
        withA(kCfg, () => {
          ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(970, 190, 770, 740, 16); ctx.fill();
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("src/app/entrypoint/app.config.ts (Provayderlar)", 1000, 225, C.teal, { size: 16 });

          const cfgCode = [
            'import { type ApplicationConfig } from "@angular/core"',
            'import { provideRouter, withComponentInputBinding } from "@angular/router"',
            'import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http"',
            'import { APP_ENV } from "@/shared/config"',
            'import { apiUrlInterceptor } from "@/shared/api"',
            'import { routes } from "../routes/app.routes"',
            '',
            'export const appConfig: ApplicationConfig = {',
            '  providers: [',
            '    // 1. Marshrut parametrlari to\'g\'ridan-to\'g\'ri input ga ulanadi',
            '    provideRouter(routes, withComponentInputBinding()),',
            '',
            '    // 2. HTTP mijoz: fetch va interceptorlar bilan',
            '    provideHttpClient(withFetch(), withInterceptors([apiUrlInterceptor])),',
            '',
            '    // 3. Konfiguratsiya tokeni',
            '    { provide: APP_ENV, useValue: { apiUrl: "/api", isProd: false } },',
            '  ],',
            '}'
          ];
          cfgCode.forEach((line, i) => {
            text(line, 1000, 275 + i * 32, { size: 14, fam: MONO, weight: 600, color: line.startsWith('    //') ? C.teal : C.ink });
          });
        });
      });
    }

    // SCENE 4: SAHIFA VA KOMPONENTLAR (S.sahifa_va_komponentlar.s - S.rasmlar_va_aktivlar.s)
    else if (t < S.rasmlar_va_aktivlar.s) {
      drawTower(t, { hlFloor: 4, alpha: 0.35, showLabels: false });
      pill("SAHIFA, FEATURE VA ENTITY INTEGRATSIYASI", 180, 80, C.blue, { size: 26 });

      const kComps = eo(P(t, S.sahifa_va_komponentlar.s + 0.3, 0.8));
      withA(kComps, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Box 1: ProductPage (pages)
        ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 350, 16); ctx.fill();
        ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("1. pages/product/ui/product-page.ts (withComponentInputBinding)", 210, 225, C.blue, { size: 16 });

        const pageLines = [
          '@Component({',
          '  selector: "app-product-page",',
          '  imports: [AddToCartButton],',
          '  template: `',
          '    @if (product.value(); as p) {',
          '      <h1>{{ p.title }}</h1>',
          '      <app-add-to-cart-button [productId]="p.id" />',
          '    }`',
          '})',
          'export class ProductPage {',
          '  readonly id = input.required<string>()  // marshrutdan keladi',
          '  protected readonly product = httpResource<ProductDto>(',
          '    () => PRODUCT_REQUESTS.detail(this.id())',
          '  )',
          '}'
        ];
        pageLines.forEach((l, i) => {
          text(l, 210, 260 + i * 20, { size: 13, fam: MONO, weight: 600, color: C.ink });
        });

        // Box 2: AddToCartButton (features)
        const kFeat = eo(P(t, L('L9').s, 0.8));
        withA(kFeat, () => {
          ctx.save(); ctx.fillStyle = '#fffbeb'; ctx.beginPath(); ctx.roundRect(180, 560, 740, 370, 16); ctx.fill();
          ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("2. features/add-to-cart/ui/add-to-cart-button.ts (inject)", 210, 595, C.amber, { size: 16 });

          const featLines = [
            '@Component({',
            '  selector: "app-add-to-cart-button",',
            '  imports: [Button],',
            '  template: `<app-button [disabled]="pending()" (click)="add()">Savatga</app-button>`',
            '})',
            'export class AddToCartButton {',
            '  readonly productId = input.required<string>()',
            '  private readonly api = inject(CartApi)',
            '  private readonly cart = inject(CartStore)',
            '  protected readonly pending = signal(false)',
            '',
            '  add() {',
            '    this.pending.set(true)',
            '    this.api.add(this.productId())',
            '      .pipe(finalize(() => this.pending.set(false)))',
            '      .subscribe((summary) => this.cart.apply(summary))',
            '  }',
            '}'
          ];
          featLines.forEach((l, i) => {
            text(l, 210, 630 + i * 18, { size: 12.5, fam: MONO, weight: 600, color: C.ink });
          });
        });

        // Box 3: ProductCard (entities) with ng-content
        const kEnt = eo(P(t, L('L10').s, 0.8));
        withA(kEnt, () => {
          ctx.save(); ctx.fillStyle = '#fff1f2'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 740, 16); ctx.fill();
          ctx.strokeStyle = '#fecdd3'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("3. entities/product/ui/product-card.ts (ng-content proyeksiyasi)", 990, 225, C.red, { size: 16 });

          const entLines = [
            '// Harakat tugmasi tashqaridan ng-content orqali beriladi',
            '@Component({',
            '  selector: "app-product-card",',
            '  template: `',
            '    <article>',
            '      <h3>{{ product().title }}</h3>',
            '      <p>{{ price() }}</p>',
            '      <ng-content />',
            '      <ng-content select="[actions]" />',
            '    </article>',
            '  `',
            '})',
            'export class ProductCard {',
            '  readonly product = input.required<ProductDto>()',
            '  protected readonly price = computed(() => formatPrice(this.product().priceMinor))',
            '}',
            '',
            '// Sahifada birlashtirish:',
            '<app-product-card [product]="p">',
            '  <app-add-to-cart-button actions [productId]="p.id" />',
            '</app-product-card>'
          ];
          entLines.forEach((l, i) => {
            text(l, 990, 275 + i * 29, { size: 14, fam: MONO, weight: 600, color: l.startsWith('//') ? C.soft : C.ink });
          });
        });
      });
    }

    // SCENE 5: RASMLAR VA AKTIVLAR (S.rasmlar_va_aktivlar.s - S.tipik_xatolar.s)
    else if (t < S.tipik_xatolar.s) {
      drawTower(t, { hlFloor: 0, alpha: 0.35, showLabels: false });
      pill("SLICELARDAGI RASMLAR VA AKTIVLARNI BOSHQARISH", 180, 80, C.teal, { size: 26 });

      const kAssets = eo(P(t, S.rasmlar_va_aktivlar.s + 0.3, 0.8));
      withA(kAssets, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Method 1: Assets Glob
        ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 740, 16); ctx.fill();
        ctx.strokeStyle = '#bbf7d0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("1-USUL: angular.json assets glob (URL yo'l bilan)", 210, 225, C.green, { size: 16 });

        const m1 = [
          '// angular.json -> build.options.assets',
          '{',
          '  "glob": "**/*.{svg,png,jpg,webp}",',
          '  "input": "src/pages",',
          '  "output": "pages"',
          '}',
          '',
          '// Komponent shablonida to\'g\'ridan-to\'g\'ri chaqirish:',
          'template: `<img src="pages/home/ui/hero.svg" alt="" />`',
          '',
          '// Brauzerda hosil bo\'ladi:',
          '// dist/browser/pages/home/ui/hero.svg',
          '',
          '// Afzalliklari:',
          '// + Qo\'shimcha types va loader talab qilmaydi',
          '// + HTML shablonida oddiy va tushunarli'
        ];
        m1.forEach((l, i) => {
          text(l, 210, 275 + i * 35, { size: 14.5, fam: MONO, weight: 600, color: l.startsWith('//') ? C.soft : C.ink });
        });

        // Method 2: esbuild Loader
        const kEs = eo(P(t, L('L12').s, 0.8));
        withA(kEs, () => {
          ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 740, 16); ctx.fill();
          ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("2-USUL: esbuild loader (import + hash nom)", 990, 225, C.blue, { size: 16 });

          const m2 = [
            '// 1. angular.json -> build.options',
            '"loader": { ".svg": "file" }',
            '',
            '// 2. src/shared/lib/untyped-assets/svg.d.ts',
            'declare module "*.svg" {',
            '  const url: string;',
            '  export default url;',
            '}',
            '',
            '// 3. src/pages/home/ui/home-page.ts',
            'import heroUrl from "./hero.svg"',
            '',
            'export class HomePage {',
            '  protected readonly hero = heroUrl',
            '}',
            '// Natija: media/hero-E5SYJHAT.svg (kuchli kesh nazorati!)'
          ];
          m2.forEach((l, i) => {
            text(l, 990, 275 + i * 34, { size: 14.5, fam: MONO, weight: 600, color: l.startsWith('//') ? C.teal : C.ink });
          });
        });
      });
    }

    // SCENE 6: TIPIK XATOLAR (S.tipik_xatolar.s - S.xulosa.s)
    else if (t < S.xulosa.s) {
      drawTower(t, { alpha: 0.2, showLabels: false });
      pill("ANGULAR FSD DA TIPIK XATOLAR", 180, 80, C.red, { size: 26 });

      const kErr = eo(P(t, S.tipik_xatolar.s + 0.3, 0.8));
      withA(kErr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const errors = [
          {
            title: '1. src/app/components/, services/, pipes/ papkalarini ochish',
            bad: 'Tur bo\'yicha guruhlash FSD falsafasiga zid. Steiger bu nomlarni qat\'iy rad etadi.',
            good: 'Kodni maqsadi bo\'yicha slice\'larga ajrating: ui, model, api segmentlari.',
            line: 'L13'
          },
          {
            title: '2. loadComponent da public API ni chetlab o\'tish',
            bad: 'loadComponent: () => import("@/pages/home/ui/home-page") — ichki faylga to\'g\'ridan kirish.',
            good: 'loadComponent: () => import("@/pages/home").then(m => m.HomePage) — faqat public API orqali.',
            line: 'L13'
          },
          {
            title: '3. Interceptorlarni features ga qo\'yish yoki hamma servisni root qilish',
            bad: 'Global so\'rovlarni o\'zgartiruvchi interceptor feature emas; shared esa biznesga bog\'lanmasligi shart.',
            good: 'Interceptorlar faqat shared/api da, har bir servis o\'z slice modelida yashaydi.',
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
        pill('31-BOB: XULOSA VA KEYINGI QADAM', SW / 2, 80, C.ngRed, { size: 28, align: 'center' });
        text("Angular 22 + FSD — korxona darajasidagi mustahkam frontend arxitekturasi", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      const kCards = eo(P(t, L('L15').s, 0.8));
      withA(kCards, () => {
        const cards = [
          {
            title: 'src/app/ == FSD app layer',
            desc: 'Angular CLI yaratgan papka FSD bilan 100% mos',
            col: C.blue,
            x: 240,
            y: 750
          },
          {
            title: 'Standalone & Signals',
            desc: 'NgModule siz toza va mustaqil reaktivlik',
            col: C.purple,
            x: 740,
            y: 750
          },
          {
            title: 'Steiger: 0 Xato',
            desc: 'Cross-import va public API buzilishidan to\'liq himoya',
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
        ctx.strokeStyle = C.ngRed; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Keyingi bob: 32 — Monorepo va bir nechta FSD ildizi", SW / 2, SH - 103, { size: 24, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // Pastki progress bar
    const prg = clamp(t / TM.end);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, SH - 6, SW, 6);
    ctx.fillStyle = C.ngRed; ctx.fillRect(0, SH - 6, SW * prg, 6);
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
    text('FSD', 1150, 360, { size: 170, weight: 800, color: C.ngRed });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('31-bob · angular shabloni', 1158, 545, { size: 34, color: C.soft });
  };
})();
