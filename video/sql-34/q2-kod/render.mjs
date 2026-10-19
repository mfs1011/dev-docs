import { chromium } from 'playwright-core';
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';

const FPS = 30, WORKERS = 4;
fs.mkdirSync('segs', { recursive: true });

const browser = await chromium.launch();
const probe = await browser.newPage();
await probe.goto('file://' + process.cwd() + '/index.html');
const DURATION = await probe.evaluate(() => window.DURATION || window.TM.end);
const TOTAL = Math.ceil(DURATION * FPS);
await probe.close();

console.log(`Davomiylik: ${DURATION}s, Jami kadrlar: ${TOTAL}, Ishchilar: ${WORKERS}`);

const per = Math.ceil(TOTAL / WORKERS);
let done = 0;

async function worker(w) {
  const from = w * per, to = Math.min(TOTAL, from + per);
  if (from >= to) return;
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + process.cwd() + '/index.html');
  await page.evaluate(() => document.fonts.ready.then(() => 1));

  const ff = spawn('ffmpeg', [
    '-loglevel', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18', '-tune', 'animation', '-pix_fmt', 'yuv420p',
    `segs/seg${w}.mp4`
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let f = from; f < to; f++) {
    const d = await page.evaluate((t) => { (window.render || window.renderFrame || render)(t); return document.getElementById('c').toDataURL('image/png'); }, f / FPS);
    if (!ff.stdin.write(Buffer.from(d.slice(22), 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (++done % 300 === 0) console.log(`${done}/${TOTAL} (${Math.round((done / TOTAL) * 100)}%)`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await page.close();
}

await Promise.all(Array.from({ length: WORKERS }, (_, w) => worker(w)));
await browser.close();

fs.writeFileSync('segs/list.txt', Array.from({ length: WORKERS }, (_, w) => `file 'seg${w}.mp4'`).join('\n'));
console.log('Kadrlar render qilindi. Birlashtirilmoqda va ovoz qo‘shilmoqda...');

execSync("ffmpeg -loglevel error -y -f concat -safe 0 -i segs/list.txt -i mix.wav -c:v copy -c:a aac -b:a 192k -shortest full.mp4");
console.log('full.mp4 tayyor. Web versiyasi siqilmoqda...');

execSync("ffmpeg -loglevel error -y -i full.mp4 -c:v libx264 -preset slow -crf 23 -tune animation -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart web.mp4");
console.log('web.mp4 tayyor!');
