import { chromium } from 'playwright-core';
import fs from 'node:fs';
const times = process.argv.slice(2).map(Number);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type()==='error' && errs.push(m.text()));
await p.goto('file://' + process.cwd() + '/index.html');
await p.evaluate(() => document.fonts.ready.then(() => 1));
fs.mkdirSync('stills', { recursive: true });
for (const t of times) {
  const d = await p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.85); }, t);
  fs.writeFileSync(`stills/t${String(t).padStart(6,'0')}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
}
console.log('errors:', errs);
await b.close();
