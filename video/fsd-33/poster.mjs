import { chromium } from 'playwright-core';
import fs from 'node:fs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/index.html');
await p.evaluate(() => document.fonts.ready.then(() => 1));
const d = await p.evaluate(() => { renderPoster(); return document.getElementById('c').toDataURL('image/png'); });
fs.writeFileSync('poster.png', Buffer.from(d.slice(22), 'base64'));
await b.close();
