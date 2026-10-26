// FSD 35-bob videosi: "FSD'da testlash" — Testlarni joylashtirish, shared/testing, Vitest, MSW va Steiger qoidalari
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
    cyan: '#0891b2'
  };

  // Qatlamlar (pastdan yuqoriga)
  const LAYERS = [
    { id: 'shared', col: '#94a3b8', uz: 'shared/testing: MSW server, vitest-setup' },
    { id: 'entities', col: '#fb7185', uz: 'lib/format-price.test.ts, model unit' },
    { id: 'features', col: '#fbbf24', uz: 'ui/AddToCartButton.test.tsx' },
    { id: 'widgets', col: '#34d399', uz: 'ui/Header.test.tsx' },
    { id: 'pages', col: '#60a5fa', uz: '__tests__/checkout-flow.test.tsx' },
    { id: 'app', col: '#a78bfa', uz: 'e2e/ Playwright butun oqim' },
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
      [S.test_turlari_va_joylashuv.s, [320, 10, 0.95]],
      [S.soxtalar_va_shared_testing.s, [360, 20, 0.92]],
      [S.steiger_testlarda.s, [380, 25, 0.9]],
      [S.komponent_testi_misoli.s, [360, 20, 0.92]],
      [S.tipik_xatolar.s, [400, 30, 0.9]],
      [S.xulosa.s, [90, -30, 1]],
    ];
    const [cx, cy, cz] = kfv(t, camFrames, 1.4);
    cam.tx = cx; cam.ty = cy; cam.z = cz;

    // SCENE 1: INTRO (0 - S.test_turlari_va_joylashuv.s)
    if (t < S.test_turlari_va_joylashuv.s) {
      drawTower(t);
      const k1 = eo(P(t, L('L1').s - 0.5, 1.2));
      withA(k1, () => {
        pill('35-BOB: FSD ARXITEKTURASIDA TESTLASH', SW / 2, 80, C.cyan, { size: 28, align: 'center' });
        text("Test har doim o'zi tekshiradigan kod yonida turadi (Co-location)", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      // Floating tech badges
      const kBadges = eo(P(t, L('L1').s + 3.0, 1.0));
      withA(kBadges, () => {
        const badges = [
          { s: 'Unit: kod yonida', x: 260, y: 320, col: C.green },
          { s: 'Komponent: UI yonida', x: 280, y: 440, col: C.blue },
          { s: 'shared/testing: MSW', x: 270, y: 560, col: C.purple },
          { s: 'Steiger: testlarni tekshiradi', x: 1460, y: 340, col: C.red },
          { s: 'E2E: Playwright (e2e/)', x: 1480, y: 460, col: C.amber }
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
        ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Slice o'zgarishi yoki ko'chishi bilan testlar ham birga ko'chadi", SW / 2, SH - 103, { size: 22, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // SCENE 2: TEST TURLARI VA JOYLASHUV (S.test_turlari_va_joylashuv.s - S.soxtalar_va_shared_testing.s)
    else if (t < S.soxtalar_va_shared_testing.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("TEST TURLARI VA PAPKA DARAXTI", 180, 80, C.cyan, { size: 26 });

      const kRes = eo(P(t, S.test_turlari_va_joylashuv.s + 0.3, 0.8));
      withA(kRes, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: Papka daraxti
        ctx.save(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(180, 190, 760, 740, 16); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        pill("📁 FSD Test Strukturasi", 210, 225, C.ink, { size: 17, mono: true });

        const treeLines = [
          { s: 'src/', col: C.ink, note: '' },
          { s: '├── entities/product/', col: C.red, note: '' },
          { s: '│   ├── lib/format-price.ts', col: C.soft, note: 'biznes mantiq' },
          { s: '│   └── lib/format-price.test.ts', col: C.green, note: '← UNIT: eng arzon va eng ko\'p' },
          { s: '├── features/add-to-cart/', col: C.amber, note: '' },
          { s: '│   ├── ui/AddToCartButton.tsx', col: C.soft, note: 'UI tugma' },
          { s: '│   └── ui/AddToCartButton.test.tsx', col: C.blue, note: '← KOMPONENT: render + click + MSW' },
          { s: '├── pages/checkout/', col: '#2563eb', note: '' },
          { s: '│   └── __tests__/checkout-flow.test.tsx', col: C.purple, note: '← INTEGRATSIYA: sahifa ichi' },
          { s: '└── shared/testing/', col: C.teal, note: '← SOXTALAR: server.ts, setup.ts' },
          { s: 'e2e/checkout.spec.ts', col: C.cyan, note: '← E2E: Playwright (src/ tashqarisida)' }
        ];

        treeLines.forEach((tl, i) => {
          const y = 275 + i * 40;
          text(tl.s, 210, y, { size: 14.5, fam: MONO, weight: 700, color: tl.col });
          if (tl.note) text(tl.note, 530, y, { size: 13, color: tl.note.startsWith('←') ? C.ink : C.soft, weight: 600 });
        });

        // Right: Qoidalar va import yo'nalishi
        const kRight = eo(P(t, L('L4').s, 0.8));
        withA(kRight, () => {
          ctx.save(); ctx.fillStyle = '#eff6ff'; ctx.beginPath(); ctx.roundRect(970, 190, 770, 740, 16); ctx.fill();
          ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("Testlar Qoidalari va Import Yo'nalishi", 1000, 225, C.blue, { size: 16 });

          const testRules = [
            {
              title: "1. Unit Test (lib & model)",
              desc: "Sof funksiyalar va modellar uchun. Frameworksiz ishlaydi, nisbiy import: './format-price'."
            },
            {
              title: "2. Komponent Testi (ui/)",
              desc: "Slice ichini nisbiy import qiladi ('./Button'), boshqa qatlamlarni public API orqali chaqiradi."
            },
            {
              title: "3. Integratsion Test (slice __tests__/)",
              desc: "Slice ichidagi butun oqimni (masalan checkout) tekshiradi. Slice chegarasidan chiqmaydi."
            },
            {
              title: "4. E2E Test (e2e/ papkasida)",
              desc: "src/ tashqarisida bo'lgani uchun FSD qatlamlar qoidasiga bo'ysunmaydi — butun ilovani tekshiradi."
            }
          ];

          testRules.forEach((tr, i) => {
            const try_y = 285 + i * 145;
            pill(tr.title, 1000, try_y, C.indigo, { size: 15 });
            text(tr.desc, 1000, try_y + 45, { size: 14.5, weight: 500, color: C.ink });
          });
        });
      });
    }

    // SCENE 3: SOXTALAR VA SHARED_TESTING (S.soxtalar_va_shared_testing.s - S.steiger_testlarda.s)
    else if (t < S.steiger_testlarda.s) {
      drawTower(t, { hlFloor: 0, alpha: 0.35, showLabels: false });
      pill("SOXTA MA'LUMOTLAR VA SHARED/TESTING QATLAMI", 180, 80, C.teal, { size: 26 });

      const kMocks = eo(P(t, S.soxtalar_va_shared_testing.s + 0.3, 0.8));
      withA(kMocks, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: Noto'g'ri joylashuvlar (Steiger rad etadi)
        ctx.save(); ctx.fillStyle = '#fff1f2'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 740, 16); ctx.fill();
        ctx.strokeStyle = '#fecdd3'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("❌ Noto'g'ri: Steiger Rad Etadigan Joylar", 210, 225, C.red, { size: 16 });

        const badMocks = [
          {
            title: "1. shared/api/fixtures/ papkasi",
            reason: "Steiger segments-by-purpose qoidasi 'fixtures' nomini qat'iy rad etadi."
          },
          {
            title: "2. shared/api/mocks/ papkasi",
            reason: "@/shared/api/mocks importi public API ni chetlab o'tish deb baholanadi."
          },
          {
            title: "3. src/tests/ qatlamdan tashqari papkasi",
            reason: "Steiger bu papkani umuman tekshirmaydi, natijada qoidalar buziladi."
          }
        ];

        badMocks.forEach((bm, i) => {
          const bmy = 285 + i * 180;
          crossB(225, bmy + 10, 1, 0.9);
          text(bm.title, 255, bmy + 10, { size: 16, weight: 700, color: C.red });
          text(bm.reason, 255, bmy + 45, { size: 14.5, weight: 500, color: C.ink });
        });

        // Right: To'g'ri yechim: shared/testing
        const kRightMocks = eo(P(t, L('L6').s, 0.8));
        withA(kRightMocks, () => {
          ctx.save(); ctx.fillStyle = '#f0fdf4'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 740, 16); ctx.fill();
          ctx.strokeStyle = '#bbf7d0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("✅ To'g'ri: src/shared/testing/ segmenti", 990, 225, C.green, { size: 16 });

          const goodCode = [
            '// 1. src/shared/testing/server.ts (MSW sozlamasi)',
            'import { setupServer } from "msw/node"',
            'export const server = setupServer()',
            '',
            '// 2. src/shared/testing/index.ts (Public API)',
            'export { server } from "./server"',
            '',
            '// 3. vitest.config.ts — setupFiles sozlamasi',
            'export default defineConfig({',
            '  test: {',
            '    setupFiles: ["./src/shared/testing/vitest-setup.ts"]',
            '  }',
            '})',
            '',
            '// 4. Testlarda ishlatish:',
            'import { server } from "@/shared/testing" // Toza public API!'
          ];
          goodCode.forEach((line, i) => {
            text(line, 990, 275 + i * 32, { size: 14, fam: MONO, weight: 600, color: line.startsWith('import { server }') ? C.green : line.startsWith('//') ? C.soft : C.ink });
          });
        });
      });
    }

    // SCENE 4: STEIGER TESTLARDA (S.steiger_testlarda.s - S.komponent_testi_misoli.s)
    else if (t < S.komponent_testi_misoli.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("STEIGER TEST FAYLLARINI HAM TEKSHIRADI", 180, 80, C.purple, { size: 26 });

      const kStg = eo(P(t, S.steiger_testlarda.s + 0.3, 0.8));
      withA(kStg, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Left: Steiger nimalarni ushlaydi
        ctx.save(); ctx.fillStyle = '#faf5ff'; ctx.beginPath(); ctx.roundRect(180, 190, 740, 740, 16); ctx.fill();
        ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        pill("Steiger Test Fayllari Tahlili", 210, 225, C.purple, { size: 16 });

        const testViolations = [
          {
            title: "Forbidden cross-import",
            code: "pages/checkout/checkout.test.tsx -> import '@/pages/home'",
            desc: "Test fayllari ham yonlama slice import qilolmaydi."
          },
          {
            title: "Forbidden sidestep of public API",
            code: "features/add-to-cart.test.tsx -> import '@/entities/product/lib/calc'",
            desc: "Boshqa slice ning ichki lib yoki modeliga kirish taqiqlanadi."
          },
          {
            title: "Forbidden import from higher layer",
            code: "entities/product.test.ts -> import '@/features/add-to-cart'",
            desc: "Test ichida ham yuqori qatlamga murojaat qilish qat'iy xato."
          }
        ];

        testViolations.forEach((tv, i) => {
          const tvy = 285 + i * 175;
          pill(tv.title, 210, tvy, C.red, { size: 15 });
          text(tv.code, 210, tvy + 40, { size: 13, fam: MONO, weight: 600, color: C.red });
          text(tv.desc, 210, tvy + 72, { size: 14, weight: 500, color: C.ink });
        });

        // Right: Qoidaga to'liq rioya qilgan test
        const kRightStg = eo(P(t, L('L9').s, 0.8));
        withA(kRightStg, () => {
          ctx.save(); ctx.fillStyle = '#ecfdf5'; ctx.beginPath(); ctx.roundRect(960, 190, 780, 740, 16); ctx.fill();
          ctx.strokeStyle = '#a7f3d0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
          pill("✅ To'g'ri Import Namunasi", 990, 225, C.green, { size: 16 });

          const validTestCode = [
            '// features/add-to-cart/ui/AddToCartButton.test.tsx',
            '',
            '// 1. O\'z slice ichi — nisbiy import:',
            'import { AddToCartButton } from "./AddToCartButton"',
            '',
            '// 2. Boshqa qatlamlar — faqat public API orqali:',
            'import { CartStore } from "@/entities/cart"',
            'import { server } from "@/shared/testing"',
            'import { Button } from "@/shared/ui/button"',
            '',
            '// Natija: Steiger 0 ta xato beradi!',
            '// Testlar arxitektura buzilishining manbasiga aylanmaydi.'
          ];
          validTestCode.forEach((line, i) => {
            text(line, 990, 275 + i * 36, { size: 14.5, fam: MONO, weight: 600, color: line.startsWith('// Natija') ? C.green : line.startsWith('//') ? C.soft : C.ink });
          });
        });
      });
    }

    // SCENE 5: KOMPONENT TESTI MISOLI (S.komponent_testi_misoli.s - S.tipik_xatolar.s)
    else if (t < S.tipik_xatolar.s) {
      drawTower(t, { alpha: 0.28, showLabels: false });
      pill("KOMPONENT TESTI VA MSW INTEGRATSIYASI", 180, 80, C.blue, { size: 26 });

      const kComp = eo(P(t, S.komponent_testi_misoli.s + 0.3, 0.8));
      withA(kComp, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // Editor Box: AddToCartButton.test.tsx
        ctx.save(); ctx.fillStyle = '#1e1e2e'; ctx.beginPath(); ctx.roundRect(180, 190, 1560, 740, 16); ctx.fill();
        ctx.strokeStyle = '#313244'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        // IDE Window header
        ctx.fillStyle = '#181825'; ctx.beginPath(); ctx.roundRect(180, 190, 1560, 45, [16, 16, 0, 0]); ctx.fill();
        text("features/add-to-cart/ui/AddToCartButton.test.tsx — Vitest + MSW", 210, 212, { size: 14, color: '#a6adc8', fam: MONO });

        const testFullCode = [
          'import { expect, it, vi } from "vitest"',
          'import { render, screen } from "@testing-library/react"',
          'import userEvent from "@testing-library/user-event"',
          'import { http, HttpResponse } from "msw"',
          'import { server } from "@/shared/testing"             // public API orqali',
          'import { AddToCartButton } from "./AddToCartButton"   // slice ichi — nisbiy',
          '',
          'it("savatga qo\'shadi va tarmoq so\'rovini yuboradi", async () => {',
          '  let requestBody: unknown',
          '  server.use(http.post("*/cart/items", async ({ request }) => {',
          '    requestBody = await request.json()',
          '    return HttpResponse.json({ count: 1, totalMinor: 100 })',
          '  }))',
          '',
          '  render(<AddToCartButton productId="42" />)',
          '  await userEvent.click(screen.getByRole("button", { name: "Savatga" }))',
          '',
          '  await vi.waitFor(() => {',
          '    expect(requestBody).toEqual({ productId: "42" })',
          '  })',
          '})'
        ];

        testFullCode.forEach((line, i) => {
          text(line, 210, 265 + i * 28, { size: 14, fam: MONO, weight: 600, color: line.startsWith('  server.use') || line.startsWith('  await userEvent') ? '#a6e3a1' : line.startsWith('import') ? '#89b4fa' : '#cdd6f4' });
        });
      });
    }

    // SCENE 6: TIPIK XATOLAR (S.tipik_xatolar.s - S.xulosa.s)
    else if (t < S.xulosa.s) {
      drawTower(t, { alpha: 0.2, showLabels: false });
      pill("TESTLASHDAGI TIPIK XATOLAR", 180, 80, C.red, { size: 26 });

      const kErr = eo(P(t, S.tipik_xatolar.s + 0.3, 0.8));
      withA(kErr, () => {
        // Container
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(140, 150, 1640, 820, 20); ctx.fill();
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

        const errors = [
          {
            title: "1. Barcha testlarni bitta global tests/ papkasiga to'plash",
            bad: "Slice ko'chganda yoki o'chirilganda testlar qolib ketadi; Steiger bu papkani tekshirmaydi.",
            good: "Testni har doim o'zi tekshiradigan kod yonida (Co-location) saqlang.",
            line: 'L12'
          },
          {
            title: "2. Test ichida boshqa slice ning ichki modeliga kirish",
            bad: "import { internalStore } from '@/entities/cart/model/internal' — refaktoring testlarni sindiradi.",
            good: "Boshqa slice ga faqat public API orqali murojaat qiling yoki soxta (mock) ishlating.",
            line: 'L12'
          },
          {
            title: "3. Faqat E2E testlariga suyanib, unit/komponent testlarini yozmaslik",
            bad: "E2E sekin ishlaydi, CI ni ortiqcha yuklaydi va aynan qaysi mantiq buzilganini aniqlash qiyin.",
            good: "Test piramidasi: ko'p unit va komponent testlari, faqat asosiy oqimlar uchun E2E.",
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
        pill('35-BOB: XULOSA VA KEYINGI QADAM', SW / 2, 80, C.cyan, { size: 28, align: 'center' });
        text("FSD da to'g'ri izolyatsiya qilingan slicelar testlarni oson va mustahkam qiladi", SW / 2, 135, { size: 22, color: C.soft, align: 'center', weight: 500 });
      });

      const kCards = eo(P(t, L('L14').s, 0.8));
      withA(kCards, () => {
        const cards = [
          {
            title: 'Co-location',
            desc: 'Test har doim o\'zi tekshiradigan kod yonida',
            col: C.green,
            x: 240,
            y: 750
          },
          {
            title: 'shared/testing',
            desc: 'MSW server va soxtalar uchun yagona manzil',
            col: C.teal,
            x: 740,
            y: 750
          },
          {
            title: 'Chegaralar Himoyasi',
            desc: 'Steiger testlarda ham cross-importni ushlaydi',
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
        ctx.strokeStyle = C.cyan; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        text("Keyingi bob: 36 — Mavjud loyihalarni FSD ga xavfsiz migratsiya qilish", SW / 2, SH - 103, { size: 24, weight: 700, color: C.ink, align: 'center' });
      });
    }

    // Pastki progress bar
    const prg = clamp(t / TM.end);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, SH - 6, SW, 6);
    ctx.fillStyle = C.cyan; ctx.fillRect(0, SH - 6, SW * prg, 6);
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
    drawTower(10, { hlFloor: 3, lift: [0, 0, 0, 0, 0, 0], descLabels: false });
    text('FSD', 1150, 360, { size: 170, weight: 800, color: C.cyan });
    text('Feature-Sliced Design', 1156, 480, { size: 50, weight: 700 });
    text('35-bob · fsd da testlash', 1158, 545, { size: 34, color: C.soft });
  };
})();
