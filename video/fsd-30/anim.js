// FSD 30-bob videosi: "Nuxt shabloni" — Nuxt 4, marshrut qobig'i, src/ FSD, useAsyncData va Steiger
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
    { id: 'entities', col: '#fb7185', uz: 'product: ProductCard' },
    { id: 'features', col: '#fbbf24', uz: 'add-to-cart: AddToCartButton' },
    { id: 'widgets', col: '#34d399', uz: 'header: Header' },
    { id: 'pages', col: '#60a5fa', uz: 'home, product: SSR sahifalar' },
    { id: 'app', col: '#a78bfa', uz: 'layouts/MainLayout, styles' },
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
      [S.toqnashuv_va_yechim.s, [320, 10, 0.95]],
      [S.konfiguratsiya_va_alias.s, [360, 20, 0.92]],
      [S.marshrut_qobigi.s, [360, 20, 0.92]],
      [S.ssr_va_asyncdata.s, [400, 30, 0.9]],
      [S.tipik_xatolar.s, [400, 30, 0.9]],
      [S.xulosa.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.toqnashuv_va_yechim.s)
    if (t < S.toqnashuv_va_yechim.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill('30-BOB: NUXT 4 VA UNIVERSAL FSD SHABLONI', SW / 2, 80, C.teal, { size: 28, align: 'center' });
        text("Nuxt 4.5 + SSR + Nitro Server + Steiger FSD", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating tech badges
      const kBadges = eo(P(t, L('L1').s + 4, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: 'Nuxt 4 (srcDir: app/)', x: 260, y: 320, col: '#00dc82' },
          { s: 'app/ — Faqat Qobiq', x: 300, y: 440, col: C.purple },
          { s: 'src/ — Haqiqiy FSD', x: 270, y: 560, col: C.blue },
          { s: 'useAsyncData (#imports)', x: 1560, y: 340, col: C.amber },
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
        ctx.strokeStyle = C.teal; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Nuxt marshrut qobig'i va FSD yadrosini ajratishning universal arxitekturasi", SW / 2, SH - 103, { size: 23, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: TO'QNASHUV VA YECHIM (S.toqnashuv_va_yechim.s - S.konfiguratsiya_va_alias.s)
    else if (t < S.konfiguratsiya_va_alias.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("NUXT 4 DA PAPKALAR TO'QNASHUVI VA YECHIM", 180, 80, C.teal, { size: 26 });

      const kRes = eo(P(t, S.toqnashuv_va_yechim.s + 0.3, 0.8));
      withA(kRes, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: ⚠️ Nuxt 4 Qoidasi
        ctx.save(); ctx.fillStyle = '#fffbeb'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 720, 16); ctx.fill();
        ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();

        pill('Nuxt 4 Konvensiyasi', 220, 240, C.amber, { size: 20 });

        const conflictPoints = [
          "Nuxt 4 da butun dastur kodi sukut bo'yicha ildizdagi app/ da kutiladi",
          "Fayl asosidagi router esa ildizdagi pages/ katalogini band qiladi",
          "FSD da ham eng yuqori qatlamlar aynan app va pages deb ataladi",
          "Agar FSD to'g'ridan-to'g'ri ildizda qurilsa, Nuxt hamma faylni routerga qo'shadi"
        ];
        conflictPoints.forEach((cp, idx) => {
          ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(225, 310 + idx * 75, 6, 0, Math.PI * 2); ctx.fill();
          text(cp, 245, 310 + idx * 75, { size: 18, weight: 600, color: C.ink });
        });

        pill("Nuxt 4 srcDir xatti-harakatiga moslashish shart", 220, 640, '#b45309', { size: 17 });

        // Right: ✓ FSD Yechimi
        ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 720, 16); ctx.fill();
        ctx.strokeStyle = '#86efac'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();

        pill('FSD Yechimi: Qobiq va Yadro', 1000, 240, C.green, { size: 20 });

        const solutionPoints = [
          { title: "Ildizdagi app/ — Faqat Qobiq", desc: "app.vue, layouts/default.vue, pages/*.vue faqat 1 qatorlik ko'rsatkich" },
          { title: "src/ — Haqiqiy FSD Qatlamlari", desc: "app, pages, widgets, features, entities, shared standart nomda" },
          { title: "server/ — Nitro Server API", desc: "Server endpointlari ildizda qoladi, FSD klient so'rovlari shared/api da" },
          { title: "To'liq Steiger Nazorati", desc: "Steiger src/ ni to'liq tekshiradi, 0 ta qatlam xatosi vujudga keladi" }
        ];

        solutionPoints.forEach((sp, idx) => {
          const y0 = 310 + idx * 105;
          ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(1000, y0, 700, 85, 12); ctx.fill();
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          check(1035, y0 + 42, 1, 1.1);
          text(sp.title, 1070, y0 + 28, { size: 19, weight: 700, color: C.ink });
          text(sp.desc, 1070, y0 + 58, { size: 16, weight: 500, color: C.soft });
        });

        pill("✓ Ildiz va FSD qatlamlari to'liq ajratildi", 1000, 770, C.teal, { size: 18 });
      });
    }

    // SCENE 3: KONFIGURATSIYA VA ALIAS (S.konfiguratsiya_va_alias.s - S.marshrut_qobigi.s)
    else if (t < S.marshrut_qobigi.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("NUXT.CONFIG.TS VA ALIASLAR INTIZOMI", 180, 80, C.blue, { size: 26 });

      const kConf = eo(P(t, S.konfiguratsiya_va_alias.s + 0.3, 0.8));
      withA(kConf, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left Code: nuxt.config.ts
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(180, 190, 800, 720, 16); ctx.fill(); ctx.restore();
        pill('nuxt.config.ts — Alias Sozlamasi', 220, 240, C.teal, { size: 19 });

        const nuxtCode = [
          `import { fileURLToPath } from 'node:url'`,
          ``,
          `export default defineNuxtConfig({`,
          `  compatibilityDate: '2025-07-15',`,
          `  devtools: { enabled: true },`,
          `  // Nuxt 4 da @ sukut bo'yicha app/ ga qaraydi.`,
          `  // FSD qatlamlari uchun uni src/ ga yo'naltiramiz:`,
          `  alias: {`,
          `    '@': fileURLToPath(new URL('./src', import.meta.url)),`,
          `  },`,
          `  css: ['@/app/styles/global.css'],`,
          `})`
        ];
        nuxtCode.forEach((nc, idx) => {
          const isHl = nc.includes("alias:") || nc.includes("fileURLToPath") || nc.includes("css:");
          text(nc, 220, 290 + idx * 36, {
            size: 18,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#38bdf8' : nc.startsWith('//') ? '#94a3b8' : '#f8fafc'
          });
        });

        // Right Card: Aliaslar intizomi
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(1020, 190, 720, 720, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill('Aliaslar Taqsimoti', 1060, 240, C.blue, { size: 20 });

        const aliasRoles = [
          {
            tag: "@/* (FSD Kodi)",
            desc: "src/ papkasiga yo'naladi. Barcha widgets, features, entities, shared importlari shu orqali amalga oshadi.",
            col: C.green
          },
          {
            tag: "~/* (Nuxt Qobig'i)",
            desc: "Nuxt ning app/ papkasiga qaraydi. Faqat tashqi router qobig'ida o'zgarishsiz qoldiriladi.",
            col: C.amber
          },
          {
            tag: "Avtomatik tsconfig",
            desc: "Nuxt .nuxt/tsconfig.app.json fayliga @ va ~ ni o'zi yozadi. Steiger shu orqali importlarni taniydi.",
            col: C.purple
          }
        ];

        aliasRoles.forEach((ar, idx) => {
          const y0 = 310 + idx * 140;
          ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(1060, y0, 640, 115, 12); ctx.fill();
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          pill(ar.tag, 1090, y0 + 35, ar.col, { size: 17, mono: true });
          text(ar.desc, 1090, y0 + 75, { size: 16, weight: 500, color: C.ink });
        });

        pill("✓ nuxi typecheck va npx steiger src — 0 xato!", 1060, 840, C.green, { size: 20, mono: true });
      });
    }

    // SCENE 4: MARSHRUT QOBIG'I (S.marshrut_qobigi.s - S.ssr_va_asyncdata.s)
    else if (t < S.ssr_va_asyncdata.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("MARSHRUT QOBIG'I: APP/ VA RE-EXPORT MEXANIZMI", 180, 80, C.purple, { size: 26 });

      const kShell = eo(P(t, S.marshrut_qobigi.s + 0.3, 0.8));
      withA(kShell, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left Code: app/app.vue & app/layouts/default.vue
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 720, 16); ctx.fill(); ctx.restore();
        pill('app/app.vue va app/layouts/default.vue', 220, 240, C.purple, { size: 18 });

        const leftLines = [
          `<!-- app/app.vue (Nuxt Karkasi) -->`,
          `<template>`,
          `  <NuxtLayout>`,
          `    <NuxtPage />`,
          `  </NuxtLayout>`,
          `</template>`,
          ``,
          `<!-- app/layouts/default.vue -->`,
          `<script setup lang="ts">`,
          `import { MainLayout } from '@/app/layouts'`,
          `</script>`,
          `<template>`,
          `  <MainLayout>`,
          `    <slot />`,
          `  </MainLayout>`,
          `</template>`
        ];
        leftLines.forEach((ll, idx) => {
          const isHl = ll.includes('MainLayout') || ll.includes('NuxtLayout');
          text(ll, 220, 285 + idx * 34, {
            size: 17,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#38bdf8' : ll.startsWith('<!--') ? '#94a3b8' : '#f8fafc'
          });
        });

        // Right Code: app/pages/*.vue
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 720, 16); ctx.fill(); ctx.restore();
        pill('app/pages/products/[id].vue (Faqat 1 ta import!)', 1000, 240, C.blue, { size: 18 });

        const rightLines = [
          `<!-- app/pages/index.vue -->`,
          `<script setup lang="ts">`,
          `import { HomePage } from '@/pages/home'`,
          `</script>`,
          `<template>`,
          `  <HomePage />`,
          `</template>`,
          ``,
          `<!-- app/pages/products/[id].vue -->`,
          `<script setup lang="ts">`,
          `import { ProductPage } from '@/pages/product'`,
          `</script>`,
          `<template>`,
          `  <ProductPage />`,
          `</template>`
        ];
        rightLines.forEach((rl, idx) => {
          const isHl = rl.includes('ProductPage') || rl.includes('HomePage');
          text(rl, 1000, 285 + idx * 34, {
            size: 17,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#4ade80' : rl.startsWith('<!--') ? '#94a3b8' : '#f8fafc'
          });
        });
      });
    }

    // SCENE 5: SSR VA ASYNCDATA (S.ssr_va_asyncdata.s - S.tipik_xatolar.s)
    else if (t < S.tipik_xatolar.s) {
      drawTower(t, { alpha: 0.2, showLabels: false });
      pill("FSD SAHIFASIDA USEASYNCDATA VA 404 BOSHQARUVI", 180, 80, C.teal, { size: 26 });

      const kSsr = eo(P(t, S.ssr_va_asyncdata.s + 0.3, 0.8));
      withA(kSsr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left Code: ProductPage.vue inside FSD
        ctx.save(); ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.roundRect(180, 190, 800, 720, 16); ctx.fill(); ctx.restore();
        pill('src/pages/product/ui/ProductPage.vue', 220, 240, C.teal, { size: 19 });

        const pageCode = [
          `<script setup lang="ts">`,
          `import { useAsyncData, useRoute, createError } from '#imports'`,
          `import { getProduct } from '@/shared/api'`,
          `import { formatPrice } from '@/entities/product'`,
          `import { AddToCartButton } from '@/features/add-to-cart'`,
          ``,
          `const route = useRoute()`,
          `const id = String(route.params.id)`,
          `const { data: product } = await useAsyncData(`,
          `  \`product-\${id}\`, () => getProduct(id)`,
          `)`,
          `if (!product.value) {`,
          `  throw createError({ statusCode: 404, statusMessage: 'Topilmadi' })`,
          `}`,
          `</script>`,
          `<template>`,
          `  <main v-if="product">`,
          `    <h1>{{ product.title }}</h1>`,
          `    <p>{{ formatPrice(product.priceMinor) }}</p>`,
          `    <AddToCartButton :product-id="product.id" />`,
          `  </main>`,
          `</template>`
        ];
        pageCode.forEach((pc, idx) => {
          const isHl = pc.includes('useAsyncData') || pc.includes('createError') || pc.includes('#imports');
          text(pc, 220, 280 + idx * 28, {
            size: 16,
            fam: MONO,
            weight: isHl ? 700 : 500,
            color: isHl ? '#38bdf8' : pc.startsWith('//') ? '#94a3b8' : '#f8fafc'
          });
        });

        // Right Explanation Card
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(1020, 190, 720, 720, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill('Nega Aniq #imports Ishlatiladi?', 1060, 240, C.blue, { size: 20 });

        const ssrRules = [
          {
            title: "Shaffof Bog'liqliklar",
            desc: "useAsyncData qayerdan kelayotgani kodda aniq ko'rinadi va IDE tahlil qiladi"
          },
          {
            title: "Serverda To'liq SSR Rendering",
            desc: "await useAsyncData serverda ma'lumotni yuklab, HTML bilan birga mijozga uzatadi"
          },
          {
            title: "Xavfsiz 404 Qaytarish",
            desc: "createError({ statusCode: 404 }) server va brauzer darajasida to'g'ri javob beradi"
          },
          {
            title: "Komponentlarda Auto-import Yo'q",
            desc: "FSD komponentlari faqat public API orqali chaqiriladi (Steiger ko'rishi uchun)"
          }
        ];

        ssrRules.forEach((sr, idx) => {
          const y0 = 310 + idx * 105;
          ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(1060, y0, 640, 85, 12); ctx.fill();
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();

          check(1095, y0 + 42, 1, 1.1);
          text(sr.title, 1130, y0 + 28, { size: 19, weight: 700, color: C.ink });
          text(sr.desc, 1130, y0 + 58, { size: 16, weight: 500, color: C.soft });
        });

        pill("✓ Server SSR va FSD qatlamlari to'liq uyg'un", 1060, 840, C.green, { size: 20, mono: true });
      });
    }

    // SCENE 6: TIPIK XATOLAR (S.tipik_xatolar.s - S.xulosa.s)
    else if (t < S.xulosa.s) {
      drawTower(t, { alpha: 0.22, showLabels: false });
      pill("NUXT FSD SHABLONIDAGI TIPIK XATOLAR", 180, 80, C.red, { size: 26 });

      const kErr = eo(P(t, S.tipik_xatolar.s + 0.3, 0.8));
      withA(kErr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.12)'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 800, 20); ctx.fill();
        ctx.strokeStyle = '#fecaca'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const errors = [
          {
            title: "1. To'liq sahifa kodini app/pages/*.vue ichiga yozish",
            bad: "Loyiha kodi FSD qatlamlaridan tashqarida qolib ketadi va Steiger uni tekshirmaydi.",
            fix: "✓ app/pages faqat 1 qatorlik ko'rsatkich bo'lsin, logika src/pages da yashasin"
          },
          {
            title: "2. nuxt.config da '@' aliasini src ga yo'naltirishni unutish",
            bad: "Nuxt 4 da @ sukut bo'yicha app/ ga qaraydi, natijada @/entities importlari topilmaydi.",
            fix: "✓ nuxt.config.ts da alias: { '@': fileURLToPath(...) } sozlamasini kiritish shart"
          },
          {
            title: "3. FSD komponentlari uchun app/components/ auto-importiga tayanish",
            bad: "Importlar yashirin bo'lib, Steiger qatlamlar orasidagi noqonuniy bog'lanishlarni ko'rmaydi.",
            fix: "✓ Barcha FSD komponentlarini har doim public API orqali aniq import qiling"
          },
          {
            title: "4. FSD pages qatlami bilan Nuxt pages papkasini aralashtirish",
            bad: "Nuxt har bir fayl va testlarni ham marshrut deb hisoblab, keraksiz URL larni yaratadi.",
            fix: "✓ Qobiq app/pages da, haqiqiy sahifalar src/pages da saqlansin"
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
      pill("XULOSA: NUXT 4 VA UNIVERSAL FSD SHABLONI!", SW / 2, 80, C.green, { size: 28, align: 'center' });

      const kEnd = eo(P(t, S.xulosa.s + 0.5, 0.9));
      withA(kEnd, () => {
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowBlur = 24;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(SW / 2 - 580, 150, 1160, 750, 24); ctx.fill();
        ctx.strokeStyle = '#bbf7d0'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

        const checklist = [
          "Nuxt 4.5 + SSR + Nitro Server + Steiger to'liq sinovdan o'tkazildi",
          "Nuxt app/ papkasi faqat toza marshrut qobig'i sifatida xizmat qiladi",
          "Haqiqiy FSD qatlamlari src/ katalogida standart nomlar bilan yashaydi",
          "nuxt.config da @ aliasi src ga, ~ esa Nuxt qobig'iga to'g'ri taqsimlandi",
          "FSD sahifalarida useAsyncData va 404 holatlari aniq boshqariladi",
          "nuxt build, nuxi typecheck va npx steiger src buyruqlari 0 xato bilan o'tdi",
          "Katta ko'lamli korporativ Vue va Nuxt ilovalari uchun universal poydevor!"
        ];

        checklist.forEach((item, idx) => {
          const ki = eo(P(t, L('L15').s + idx * 1.5, 0.6));
          withA(ki, () => {
            const y0 = 210 + idx * 72;
            check(SW / 2 - 530, y0, 1, 1.1);
            text(item, SW / 2 - 490, y0, { size: 20, weight: 600, color: C.ink });
          });
        });

        const kNext = eo(P(t, L('L16').s, 0.8));
        withA(kNext, () => {
          pill("Keyingi dars: 31-bob — Angular 22 uchun modulli FSD shabloni →", SW / 2, 820, C.blue, { size: 22, align: 'center' });
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
    text('FSD', 1150, 360, { size: 170, weight: 800, color: '#00dc82' });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('30-bob · nuxt shabloni', 1158, 545, { size: 34, color: C.soft });
  };
})();
