# Qo'llanma videolari — manba

Har papka — bitta video. Tayyor fayl `public/video/<kitob>/` ga qo'yiladi va bobga `<figure class="video">` bilan qo'shiladi (namuna: `content/git/README.md`).

Tuzilishi (`git-umumiy/`):

| Fayl | Vazifasi |
| --- | --- |
| `timeline.js` | Sahna va voqea vaqtlari. Animatsiya ham, musiqa ham shundan o'qiydi — vaqt bir joyda o'zgaradi |
| `anim.js` | Canvas sahnalari; `render(t)` — `t` soniyadagi kadrni chizadi (deterministik) |
| `index.html` | Sahifa. Brauzerda `index.html#play` — real vaqtda ko'rish |
| `music.mjs` | Fon musiqasi va ovoz effektlari sintezi → `music.wav` |
| `poster.mjs` | Muqova (`renderPoster()` — markaz pleyer tugmasi uchun bo'sh) → `poster.png` |
| `stills.mjs` | Tanlangan soniyalarni `stills/*.jpg` ga chiqaradi (tez tekshirish) |
| `render.mjs` | Barcha kadrlar → `segs/*.mp4` (4 parallel brauzer) |

Yig'ish (papka ichida):

```bash
npm i --no-save playwright-core@1.57.0   # Chromium ~/Library/Caches/ms-playwright dan olinadi
node stills.mjs 4 33 90 131              # kadrlarni ko'rib chiqish
node music.mjs
node render.mjs
ffmpeg -f concat -safe 0 -i segs/list.txt -i music.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart full.mp4
# sayt uchun siqish va muqova
ffmpeg -i full.mp4 -c:v libx264 -preset slow -crf 23 -tune animation -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart web.mp4
node poster.mjs && ffmpeg -i poster.png -vf scale=1280:-2 -q:v 3 poster.jpg
```

`render.mjs` dagi `DUR` `timeline.js` dagi `S.end` bilan bir xil bo'lishi kerak.
