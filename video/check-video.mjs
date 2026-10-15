import { chromium } from 'playwright-core';
import path from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node check-video.mjs <video-dir>");
  process.exit(1);
}

const fullPath = path.resolve(dir, 'index.html');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

const errs = [];
page.on('pageerror', e => errs.push(String(e)));
page.on('console', m => {
  if (m.type() === 'error') errs.push(m.text());
});

await page.goto('file://' + fullPath);
await page.evaluate(() => document.fonts.ready);

const dur = await page.evaluate(() => window.DURATION || (window.TM && window.TM.end) || 0);
if (!dur) {
  console.error(`Xatolik: ${dir} davomiyligi topilmadi!`);
  await browser.close();
  process.exit(1);
}

const missing = await page.evaluate(() => [...new Set((window.SY && window.SY.missing) || [])]);
const overflows = [];
let undefinedTitles = 0;

for (let t = 0; t <= dur; t += 1) {
  const res = await page.evaluate((time) => {
    window.OVERFLOWS = [];
    render(time);
    const ofs = window.OVERFLOWS || [];
    return { ofs };
  }, t);

  if (res.ofs.length > 0) {
    overflows.push({ t, ofs: res.ofs });
  }
}

await browser.close();

console.log(`Tekshiruv: ${dir} (${dur.toFixed(1)}s)`);
if (errs.length) console.error("Konsol xatolari:", errs);
if (missing.length) console.error("Topilmagan so'zlar (missing):", missing);
if (overflows.length) {
  console.error(`DIQQAT: ${overflows.length} ta kadrda matn toshishi (overflow) aniqlandi!`);
  overflows.slice(0, 5).forEach(o => console.error(`  t=${o.t}s:`, o.ofs));
}

if (!errs.length && !missing.length && !overflows.length) {
  console.log(`✓ MUVAFFAQIYATLI: 0 xato, 0 missing, 0 overflow! Video renderga to'liq tayyor.`);
  process.exit(0);
} else {
  console.error(`✗ TEKSHIRUVDAN O'TMADI: Xatoliklarni tuzating!`);
  process.exit(1);
}
