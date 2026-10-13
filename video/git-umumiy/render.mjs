import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const FPS = 30, DUR = 156, TOTAL = DUR * FPS, WORKERS = 4;
fs.mkdirSync('segs', { recursive: true });
const browser = await chromium.launch();
const per = Math.ceil(TOTAL / WORKERS);
let done = 0;
async function worker(w) {
  const from = w * per, to = Math.min(TOTAL, from + per);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + process.cwd() + '/index.html');
  await page.evaluate(() => document.fonts.ready.then(() => 1));
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-tune', 'animation', '-pix_fmt', 'yuv420p', `segs/seg${w}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = from; f < to; f++) {
    const d = await page.evaluate((t) => { render(t); return document.getElementById('c').toDataURL('image/png'); }, f / FPS);
    if (!ff.stdin.write(Buffer.from(d.slice(22), 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (++done % 300 === 0) console.log(`${done}/${TOTAL}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
}
await Promise.all(Array.from({ length: WORKERS }, (_, w) => worker(w)));
await browser.close();
fs.writeFileSync('segs/list.txt', Array.from({ length: WORKERS }, (_, w) => `file 'seg${w}.mp4'`).join('\n'));
console.log('frames done');
