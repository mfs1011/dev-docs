import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';

const targetDirs = process.argv.slice(2);
let dirsToAudit = [];

if (targetDirs.length > 0) {
  dirsToAudit = targetDirs;
} else {
  // Find all directories with index.html in video/
  const videoRoot = path.resolve('video');
  function findDirs(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory()) {
        const sub = path.join(dir, ent.name);
        if (fs.existsSync(path.join(sub, 'index.html'))) {
          dirsToAudit.push(sub);
        } else {
          findDirs(sub);
        }
      }
    }
  }
  findDirs(videoRoot);
  dirsToAudit.sort();
}

console.log(`Auditing ${dirsToAudit.length} video directories...\n`);

const browser = await chromium.launch();
const results = [];

for (const dir of dirsToAudit) {
  const relDir = path.relative(process.cwd(), dir);
  const fullPath = path.resolve(dir, 'index.html');
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('console', m => {
    if (m.type() === 'error') errs.push(m.text());
  });

  // Inject fillText watcher
  await page.addInitScript(() => {
    window.GLOBAL_OVERFLOWS = [];
    window.UNDEFINED_TEXTS = [];
    const origFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      if (this.globalAlpha > 0.002 && text != null) {
        const str = String(text);
        if (str === 'undefined' || str.includes('undefined')) {
          window.UNDEFINED_TEXTS.push({ text: str, t: window.CURRENT_T || 0 });
        }
        const m = this.getTransform ? this.getTransform() : { a: 1, c: 0, e: 0 };
        const w = this.measureText(str).width;
        let left = x, right = x + w;
        if (this.textAlign === 'center') { left = x - w / 2; right = x + w / 2; }
        else if (this.textAlign === 'right') { left = x - w; right = x; }
        const p1x = m.a * left + m.c * y + m.e;
        const p2x = m.a * right + m.c * y + m.e;
        const screenLeft = Math.min(p1x, p2x);
        const screenRight = Math.max(p1x, p2x);
        if (screenLeft < 5 || screenRight > 1915) {
          window.GLOBAL_OVERFLOWS.push({ text: str, screenLeft, screenRight, t: window.CURRENT_T || 0 });
        }
      }
      return origFillText.apply(this, arguments);
    };
  });

  try {
    await page.goto('file://' + fullPath);
    await page.evaluate(() => document.fonts.ready);

    const dur = await page.evaluate(() => window.DURATION || (window.TM && window.TM.end) || (window.TL && window.TL.end) || 0);
    const missing = await page.evaluate(() => [...new Set((window.SY && window.SY.missing) || (window.TL && window.TL.missing) || [])]);

    const overflows = [];
    const undefinedTexts = [];

    // Step every 1.0 second through video
    for (let t = 0; t <= dur; t += 1) {
      const res = await page.evaluate((time) => {
        window.CURRENT_T = time;
        window.OVERFLOWS = [];
        window.GLOBAL_OVERFLOWS = [];
        window.UNDEFINED_TEXTS = [];
        if (typeof render === 'function') {
          render(time);
        }
        return {
          kitOfs: window.OVERFLOWS || [],
          globOfs: window.GLOBAL_OVERFLOWS || [],
          undefs: window.UNDEFINED_TEXTS || []
        };
      }, t);

      const combinedOfs = [...res.kitOfs, ...res.globOfs];
      if (combinedOfs.length > 0) {
        overflows.push({ t, ofs: combinedOfs });
      }
      if (res.undefs.length > 0) {
        undefinedTexts.push({ t, undefs: res.undefs });
      }
    }

    const report = {
      dir: relDir,
      dur,
      errs,
      missing,
      overflows,
      undefinedTexts,
      passed: (errs.length === 0 && missing.length === 0 && overflows.length === 0 && undefinedTexts.length === 0)
    };
    results.push(report);

    if (report.passed) {
      console.log(`✓ [PASS] ${relDir} (${dur.toFixed(1)}s)`);
    } else {
      console.log(`✗ [FAIL] ${relDir} (${dur.toFixed(1)}s):`);
      if (errs.length) console.log(`   - Errors: ${errs.length}`);
      if (missing.length) console.log(`   - Missing words: ${missing.join(', ')}`);
      if (overflows.length) console.log(`   - Overflow frames: ${overflows.length} (sample: t=${overflows[0].t}s "${overflows[0].ofs[0].text}")`);
      if (undefinedTexts.length) console.log(`   - Undefined text frames: ${undefinedTexts.length} (sample: t=${undefinedTexts[0].t}s "${undefinedTexts[0].undefs[0].text}")`);
    }
  } catch (err) {
    console.log(`✗ [CRASH] ${relDir}: ${err.message}`);
    results.push({ dir: relDir, crash: err.message, passed: false });
  } finally {
    await page.close();
  }
}

await browser.close();

console.log('\n=======================================');
console.log('SUMMARY AUDIT REPORT:');
console.log(`Total: ${results.length}`);
console.log(`Passed: ${results.filter(r => r.passed).length}`);
console.log(`Failed: ${results.filter(r => !r.passed).length}`);
console.log('=======================================\n');
