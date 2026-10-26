// FSD 29-bob videosi: "Vue + Vite shabloni" — Vue 3, Pinia, Vue Query, SFC public API va slotlar
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
    { id: 'shared', col: '#94a3b8', uz: 'api, routes, ui/button' },
    { id: 'entities', col: '#fb7185', uz: 'cart: model/cart-store.ts' },
    { id: 'features', col: '#fbbf24', uz: 'add-to-cart: AddToCartButton' },
    { id: 'widgets', col: '#34d399', uz: 'header: AppHeader.vue' },
    { id: 'pages', col: '#60a5fa', uz: 'home, product: lazy sahifalar' },
    { id: 'app', col: '#a78bfa', uz: 'App.vue, entrypoint/main.ts' },
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
      [S.yaratish_va_tuzilma.s, [320, 10, 0.95]],
      [S.pinia_va_composablelar.s, [360, 20, 0.92]],
      [S.public_api_va_main.s, [360, 20, 0.92]],
      [S.slotlar_va_reaktivlik.s, [400, 30, 0.9]],
      [S.tipik_xatolar.s, [400, 30, 0.9]],
      [S.xulosa.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.yaratish_va_tuzilma.s)
    if (t < S.yaratish_va_tuzilma.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill('29-BOB: VUE 3 + VITE ISHLAB CHIQARISH SHABLONI', SW / 2, 80, C.green, { size: 28, align: 'center' });
        text("Vue 3.5 + Pinia 4 + TanStack Vue Query + Vue Router + Steiger", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating tech badges
      const kBadges = eo(P(t, L('L1').s + 4, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: 'Vue 3.5 & Vite 8', x: 260, y: 320, col: '#42b883' },
          { s: 'Pinia 4 Store', x: 300, y: 440, col: '#f59e0b' },
          { s: 'TanStack Vue Query', x: 270, y: 560, col: '#ef4444' },
          { s: 'SFC Steiger Linter', x: 1560, y: 340, col: C.purple },
          { s: 'vue-tsc: 0 errors', x: 1510, y: 460, col: C.blue }
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
        ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Single File Component'lar ichidagi importlar ham to'liq tekshiriladi", SW / 2, SH - 103, { size: 23, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: YARATISH VA TUZILMA (S.yaratish_va_tuzilma.s - S.pinia_va_composablelar.s)
    else if (t < S.pinia_va_composablelar.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("LOYIHANI YARATISH VA FSD QATLAMLARI", 180, 80, C.green, { size: 26 });

      const kSetup = eo(P(t, S.yaratish_va_tuzilma.s + 0.3, 0.8));
      withA(kSetup, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Terminal block
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(180, 190, 1560, 220, 16); ctx.fill(); ctx.restore();
        pill('create-vue Boshlang\'ich Buyruqlari', 220, 235, C.green, { size: 18 });

        const cmds = [
          `npm create vue@latest my-shop -- --ts --router --pinia`,
          `cd my-shop && npm i @tanstack/vue-query`,
          `npm i -D steiger @feature-sliced/steiger-plugin`,
          `rm -rf src && mkdir src  # Eski views/, components/, stores/ o'rniga FSD tuzilmasi`
        ];
        cmds.forEach((cmd, idx) => {
          text(cmd, 220, 280 + idx * 34, { size: 18, fam: MONO, weight: 600, color: '#38bdf8' });
        });

        // 2 Side Cards
        // Left: src/app/App.vue
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 440, 750, 470, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill('src/app/App.vue — Ildiz O\'rami', 220, 485, C.green, { size: 20 });
        text("App.vue src ildizida emas, app qatlamida turadi:", 220, 540, { size: 19, weight: 600, color: C.ink });

        const vueCode = [
          `<script setup lang="ts">`,
          `import { AppHeader } from '@/widgets/header'`,
          `</script>`,
          ``,
          `<template>`,
          `  <AppHeader />`,
          `  <RouterView />`,
          `</template>`
        ];
        vueCode.forEach((vc, idx) => {
          const isHl = vc.includes('AppHeader') || vc.includes('RouterView');
          text(vc, 220, 585 + idx * 34, { size: 18, fam: MONO, weight: isHl ? 700 : 500, color: isHl ? '#059669' : '#334155' });
        });

        // Right: index.html entrypoint & alias
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(970, 440, 770, 470, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill('Kirish Nuqtasi (main.ts)', 1010, 485, C.blue, { size: 20 });
        text("index.html yangi manzilga yo'naltiriladi:", 1010, 540, { size: 19, weight: 600, color: C.ink });

        const rightCode = [
          `<!-- index.html -->`,
          `<script type="module"`,
          `  src="/src/app/entrypoint/main.ts">`,
          `</script>`,
          ``,
          `// create-vue da @ alias allaqachon sozlangan:`,
          `// vite.config.ts -> '@': fileURLToPath(...)`,
          `// tsconfig.app.json -> 'paths': { '@/*': ['./src/*'] }`
        ];
        rightCode.forEach((rc, idx) => {
          const isHl = rc.includes('main.ts') || rc.includes('paths');
          text(rc, 1010, 585 + idx * 34, { size: 17, fam: MONO, weight: isHl ? 700 : 500, color: isHl ? '#2563eb' : '#334155' });
        });
      });
    }

    // SCENE 3: PINIA VA COMPOSABLELAR (S.pinia_va_composablelar.s - S.public_api_va_main.s)
    else if (t < S.public_api_va_main.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("PINIA STORE VA COMPOSABLE'LAR QAYERDA YASHAYDI?", 180, 80, C.amber, { size: 26 });

      const kPinia = eo(P(t, S.pinia_va_composablelar.s + 0.3, 0.8));
      withA(kPinia, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left Card: ❌ Markaziy Stores / Composables (Taqiqlangan)
        ctx.save(); ctx.fillStyle = '#fef2f2'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 720, 16); ctx.fill();
        ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();

        crossB(225, 240, 1, 1.2);
        text("❌ Markaziy stores/ va composables/", 265, 240, { size: 24, weight: 800, color: C.red });

        const badPinia = [
          "Barcha Pinia store larni bitta src/stores ga tiqish",
          "Barcha useX composable larni bitta src/composables ga yig'ish",
          "Steiger bu nomlarni qatlam yoki segment deb tan olmaydi",
          "Bunday desegmentatsiya kod modulliligini butunlay yo'q qiladi"
        ];
        badPinia.forEach((bp, idx) => {
          ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(225, 310 + idx * 80, 6, 0, Math.PI * 2); ctx.fill();
          text(bp, 245, 310 + idx * 80, { size: 18, weight: 600, color: C.ink });
        });

        pill("Steiger 'composables' segmentini rad etadi", 220, 680, '#b91c1c', { size: 18 });

        // Right Card: ✓ FSD Qoidasi (Slice Model/Lib)
        ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 720, 16); ctx.fill();
        ctx.strokeStyle = '#86efac'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();

        check(1005, 240, 1, 1.2);
        text("✓ FSD: Slice ichida model va lib", 1045, 240, { size: 24, weight: 800, color: C.green });

        const goodPinia = [
          { title: "entities/cart/model/cart-store.ts", desc: "Savat holati va amallari o'z entity'si ichida yashaydi" },
          { title: "entities/session/model/session-store.ts", desc: "Foydalanuvchi sessiya ma'lumotlari session entity'sida" },
          { title: "pages/home/model/use-filters.ts", desc: "Faqat bir sahifaga xos composable shu sahifaning modelida" },
          { title: "shared/lib/use-debounce.ts", desc: "Umumiy yordamchi composable'lar shared/lib da turadi" }
        ];

        goodPinia.forEach((gp, idx) => {
          const y0 = 310 + idx * 105;
          ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(1000, y0, 700, 85, 12); ctx.fill();
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          check(1035, y0 + 42, 1, 1.1);
          text(gp.title, 1070, y0 + 28, { size: 18, weight: 700, fam: MONO, color: C.ink });
          text(gp.desc, 1070, y0 + 58, { size: 16, weight: 500, color: C.soft });
        });

        pill("✓ Har bir store va composable o'z egasi yonida!", 1000, 770, C.teal, { size: 18 });
      });
    }

    // SCENE 4: PUBLIC API VA MAIN (S.public_api_va_main.s - S.slotlar_va_reaktivlik.s)
    else if (t < S.slotlar_va_reaktivlik.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("SFC PUBLIC API VA MAIN.TS KIRISH NUQTASI", 180, 80, C.blue, { size: 26 });

      const kMain = eo(P(t, S.public_api_va_main.s + 0.3, 0.8));
      withA(kMain, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left Code: SFC Public API (index.ts)
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 720, 16); ctx.fill(); ctx.restore();
        pill('SFC Public API (index.ts)', 220, 240, C.blue, { size: 19 });

        const apiLines = [
          `// src/entities/product/index.ts`,
          `// SFC default eksport bo'lgani sababli nomlanadi:`,
          `export { default as ProductCard } from './ui/ProductCard.vue'`,
          `export { formatPrice } from './lib/format-price'`,
          ``,
          `// src/entities/cart/index.ts`,
          `export { useCartStore } from './model/cart-store'`,
          `export { default as CartCounter } from './ui/CartCounter.vue'`,
          ``,
          `// ⚠️ export * from './ui/ProductCard.vue' XATO!`,
          `// Chunki default eksport nomi yo'qolib ketadi`
        ];
        apiLines.forEach((al, idx) => {
          const isHl = al.includes('export { default as') || al.includes('useCartStore');
          const isErr = al.includes('XATO');
          text(al, 220, 290 + idx * 36, {
            size: 17,
            fam: MONO,
            weight: isHl || isErr ? 700 : 500,
            color: isErr ? '#ef4444' : isHl ? '#38bdf8' : al.startsWith('//') ? '#94a3b8' : '#f8fafc'
          });
        });

        // Right Code: main.ts & router.ts
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 720, 16); ctx.fill(); ctx.restore();
        pill('main.ts va router.ts (Lazy)', 1000, 240, C.green, { size: 19 });

        const mainLines = [
          `// src/app/entrypoint/main.ts`,
          `import { createApp } from 'vue'`,
          `import { createPinia } from 'pinia'`,
          `import { VueQueryPlugin } from '@tanstack/vue-query'`,
          `import App from '../App.vue'`,
          `import { router } from '../routes/router'`,
          ``,
          `createApp(App)`,
          `  .use(createPinia())`,
          `  .use(VueQueryPlugin)`,
          `  .use(router)`,
          `  .mount('#app')`,
          ``,
          `// src/app/routes/router.ts (Public API orqali lazy)`,
          `routes: [`,
          `  { ...ROUTES.home, component: () => import('@/pages/home').then(m => m.HomePage) }`,
          `]`
        ];
        mainLines.forEach((ml, idx) => {
          const isHl = ml.includes('.use') || ml.includes('import(');
          text(ml, 1000, 285 + idx * 34, {
            size: 16,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#4ade80' : ml.startsWith('//') ? '#94a3b8' : '#f8fafc'
          });
        });
      });
    }

    // SCENE 5: SLOTLAR VA REAKTIVLIK (S.slotlar_va_reaktivlik.s - S.tipik_xatolar.s)
    else if (t < S.tipik_xatolar.s) {
      drawTower(t, { alpha: 0.2, showLabels: false });
      pill("SLOTLAR ORQALI KOMPOZITSIYA VA REAKTIV QUERY", 180, 80, C.teal, { size: 26 });

      const kSlot = eo(P(t, S.slotlar_va_reaktivlik.s + 0.3, 0.8));
      withA(kSlot, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left Code: HomePage.vue (Slotlar)
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(180, 190, 800, 720, 16); ctx.fill(); ctx.restore();
        pill('src/pages/home/ui/HomePage.vue (Slotlar)', 220, 240, C.green, { size: 19 });

        const slotCode = [
          `<script setup lang="ts">`,
          `import { useQuery } from '@tanstack/vue-query'`,
          `import { ProductCard } from '@/entities/product'`,
          `import { AddToCartButton } from '@/features/add-to-cart'`,
          `const { data, isPending } = useQuery(PRODUCT_QUERIES.list())`,
          `</script>`,
          ``,
          `<template>`,
          `  <main>`,
          `    <ProductCard v-for="p in data" :key="p.id" :product="p">`,
          `      <!-- Default slot: Mahsulot havolasi -->`,
          `      <RouterLink :to="{ name: 'product', params: { id: p.id } }">`,
          `        Batafsil`,
          `      </RouterLink>`,
          `      <!-- #actions slot: Savatga qo'shish tugmasi -->`,
          `      <template #actions>`,
          `        <AddToCartButton :product-id="p.id" />`,
          `      </template>`,
          `    </ProductCard>`,
          `  </main>`,
          `</template>`
        ];
        slotCode.forEach((sc, idx) => {
          const isHl = sc.includes('#actions') || sc.includes('AddToCartButton') || sc.includes('ProductCard');
          text(sc, 220, 280 + idx * 28, {
            size: 16,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#38bdf8' : sc.startsWith('<!--') ? '#94a3b8' : '#f8fafc'
          });
        });

        // Right Code: Reaktiv Query (ProductPage.vue)
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(1020, 190, 720, 720, 16); ctx.fill(); ctx.restore();
        pill('Reaktiv Query Parametrlari', 1060, 240, C.amber, { size: 19 });

        const queryCode = [
          `// src/pages/product/ui/ProductPage.vue`,
          `import { computed } from 'vue'`,
          `import { useRoute } from 'vue-router'`,
          `import { useQuery } from '@tanstack/vue-query'`,
          ``,
          `const route = useRoute()`,
          ``,
          `// ⚠️ DIQQAT: computed shart!`,
          `// Aks holda marshrut o'zgarganda so'rov`,
          `// yangilanmay, eski sahifa ma'lumoti qoladi:`,
          `const { data: product } = useQuery(`,
          `  computed(() =>`,
          `    PRODUCT_QUERIES.detail(String(route.params.id))`,
          `  )`,
          `)`
        ];
        queryCode.forEach((qc, idx) => {
          const isHl = qc.includes('computed(() =>') || qc.includes('DIQQAT');
          text(qc, 1060, 285 + idx * 34, {
            size: 17,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#f59e0b' : qc.startsWith('//') ? '#94a3b8' : '#f8fafc'
          });
        });
      });
    }

    // SCENE 6: TIPIK XATOLAR (S.tipik_xatolar.s - S.xulosa.s)
    else if (t < S.xulosa.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("VUE FSD SHABLONIDAGI TIPIK XATOLAR", 180, 80, C.red, { size: 26 });

      const kErr = eo(P(t, S.tipik_xatolar.s + 0.3, 0.8));
      withA(kErr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#fecaca'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const errors = [
          {
            title: "1. src/stores/, composables/ va views/ papkalarini qoldirish",
            bad: "FSD arxitekturasida bunday segmentlar taqiqlangan. Steiger linteri xato beradi.",
            fix: "✓ Kodlarni tegishli slice'lar ichidagi model, ui va lib segmentlariga ko'chiring"
          },
          {
            title: "2. index.ts da 'export * from ProductCard.vue' qilish",
            bad: "Vue SFC lar default eksport bo'lgani sababli komponent nomi eksport qilinmaydi.",
            fix: "✓ Har doim 'export { default as ProductCard } from ...' deb nomlang"
          },
          {
            title: "3. useQuery queryKey parametri uchun computed ishlatmaslik",
            bad: "Foydalanuvchi bir mahsulotdan ikkinchisiga o'tganda ma'lumotlar qayta yuklanmaydi.",
            fix: "✓ URL parametriga bog'liq queryOptions ni computed bilan o'rang"
          },
          {
            title: "4. unplugin auto-import plaginlari bilan importlarni yashirish",
            bad: "Steiger yashirin importlarni tahlil qila olmaydi, qatlam chegaralari nazoratsiz qoladi.",
            fix: "✓ FSD loyihalarida aniq va shaffof importlardan foydalanish tavsiya etiladi"
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
      pill("XULOSA: VUE 3 + VITE SHABLONI TAYYOR!", SW / 2, 80, C.green, { size: 28, align: 'center' });

      const kEnd = eo(P(t, S.xulosa.s + 0.5, 0.9));
      withA(kEnd, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowBlur = 24;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 580, 150, 1160, 750, 24); ctx.fill();
        ctx.strokeStyle = '#bbf7d0'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

        const checklist = [
          "Vue 3.5 + Vite 8 + Pinia 4 + TanStack Vue Query to'liq integratsiya qilindi",
          "Standart views va stores papkalari o'rniga FSD ning 6 qatlami barpo etildi",
          "App.vue -> src/app/App.vue ga ko'chirildi (<AppHeader/> + <RouterView/>)",
          "Pinia store'lar alohida papkada emas, slice modelida joylashadi",
          "Vue SFC lar public API orqali 'export { default as X }' bilan nomlanadi",
          "vue-tsc va Steiger linterida 0 ta xato bilan to'liq tekshiruvdan o'tdi",
          "Slotlar va reaktivlik uyg'unligida mustahkam arxitekturaga erishildi!"
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
          pill("Keyingi dars: 30-bob — Nuxt frameworki va universal FSD shabloni →", SW / 2, 820, C.blue, { size: 22, align: 'center' });
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
    drawTower(10, { hlFloor: 3, lift: [0, 0, 0, 0, 0, 0], descLabels: false });
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#42b883' });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('29-bob · vue + vite shabloni', 1158, 545, { size: 34, color: C.soft });
  };
})();
