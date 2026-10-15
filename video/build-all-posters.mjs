import { chromium } from 'playwright-core';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const POSTER_MAP = {
  'video/fsd-01': 'public/video/fsd/01-fsd-nima.jpg',
  'video/fsd-02': 'public/video/fsd/02-pages-first.jpg',
  'video/fsd-03': 'public/video/fsd/03-qatlamlar.jpg',
  'video/fsd-04': 'public/video/fsd/04-slicelar.jpg',
  'video/fsd-05': 'public/video/fsd/05-segmentlar.jpg',
  'video/fsd-umumiy': 'public/video/fsd/fsd-qanday-ishlaydi.jpg',
  'video/git-umumiy': 'public/video/git/git-qanday-ishlaydi.jpg',
  'video/sql-umumiy': 'public/video/sql/sql-qanday-ishlaydi.jpg',
  'video/sql-01/q1-tushuncha': 'public/video/sql/01-1-tushuncha.jpg',
  'video/sql-01/q2-kod': 'public/video/sql/01-2-kod.jpg',
  'video/sql-01/q3-dialekt': 'public/video/sql/01-3-dialektlar.jpg',
  'video/sql-02/q1-tushuncha': 'public/video/sql/02-1-tushuncha.jpg',
  'video/sql-02/q2-kod': 'public/video/sql/02-2-kod.jpg',
  'video/sql-02/q3-dialekt': 'public/video/sql/02-3-dialektlar.jpg',
  'video/sql-03/q1-tushuncha': 'public/video/sql/03-1-tushuncha.jpg',
  'video/sql-03/q2-kod': 'public/video/sql/03-2-kod.jpg',
  'video/sql-03/q3-dialekt': 'public/video/sql/03-3-dialektlar.jpg',
  'video/sql-04/q1-tushuncha': 'public/video/sql/04-1-tushuncha.jpg',
  'video/sql-04/q2-kod': 'public/video/sql/04-2-kod.jpg',
  'video/sql-04/q3-dialekt': 'public/video/sql/04-3-dialektlar.jpg',
  'video/sql-05/q1-tushuncha': 'public/video/sql/05-1-tushuncha.jpg',
  'video/sql-05/q2-kod': 'public/video/sql/05-2-kod.jpg',
  'video/sql-05/q3-dialekt': 'public/video/sql/05-3-dialektlar.jpg',
  'video/sql-06/q1-tushuncha': 'public/video/sql/06-1-tushuncha.jpg',
  'video/sql-06/q2-kod': 'public/video/sql/06-2-kod.jpg',
  'video/sql-06/q3-dialekt': 'public/video/sql/06-3-dialektlar.jpg',
};

console.log(`Rebuilding and syncing posters for ${Object.keys(POSTER_MAP).length} video directories...\n`);

const browser = await chromium.launch();

for (const [dir, publicTarget] of Object.entries(POSTER_MAP)) {
  const fullHtml = path.resolve(dir, 'index.html');
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('file://' + fullHtml);
  await page.evaluate(() => document.fonts.ready);

  const pngBase64 = await page.evaluate(() => {
    const fn = typeof renderPoster === 'function' ? renderPoster : window.renderPoster;
    if (typeof fn !== 'function') throw new Error('renderPoster not defined');
    fn();
    return document.getElementById('c').toDataURL('image/png');
  });

  const pngPath = path.resolve(dir, 'poster.png');
  const jpgPath = path.resolve(dir, 'poster.jpg');
  fs.writeFileSync(pngPath, Buffer.from(pngBase64.slice(22), 'base64'));

  // Convert to 1280px web poster
  execSync(`ffmpeg -loglevel error -y -i "${pngPath}" -vf scale=1280:-2 -q:v 3 "${jpgPath}"`);

  // Copy to public target
  fs.copyFileSync(jpgPath, path.resolve(publicTarget));

  console.log(`✓ [POSTER] ${dir} -> ${publicTarget}`);
  await page.close();
}

await browser.close();
console.log('\nAll 26 posters regenerated and synced successfully!');
