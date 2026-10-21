import { chromium } from 'playwright-core';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const dir = import.meta.dirname;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(new URL('index.html', import.meta.url).href);
await p.evaluate(() => document.fonts.ready.then(() => 1));
const d = await p.evaluate(() => { (window.renderPoster || renderPoster)(); return document.getElementById('c').toDataURL('image/png'); });
fs.writeFileSync(path.join(dir, 'poster.png'), Buffer.from(d.slice(22), 'base64'));
await b.close();

execSync(`ffmpeg -loglevel error -y -i "${path.join(dir, 'poster.png')}" -vf scale=1280:-2 -q:v 3 "${path.join(dir, 'poster.jpg')}"`);
