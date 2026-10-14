# Qo'llanma videolari — manba

Har kitobning video uslubi alohida:
- **Git** — [GIT-VIDEO-USLUBI.md](GIT-VIDEO-USLUBI.md) (to'q neon, animatsiya ovozga cho'ziladi), namuna `git-umumiy/`
- **SQL** — [SQL-VIDEO-USLUBI.md](SQL-VIDEO-USLUBI.md) ("daftar" uslubi, ovoz birinchi, haqiqiy PostgreSQL ma'lumoti), namuna `sql-umumiy/`
- **FSD** — [FSD-VIDEO-USLUBI.md](FSD-VIDEO-USLUBI.md) (izometrik 3D bino, uzluksiz kamera, haqiqiy Steiger chiqishi, Kore ovozi), namuna `fsd-umumiy/`

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

Ovozli hikoya (Gemini TTS, Charon) — subtitrlar `timeline.js` dagi `captions` dan:

| Fayl | Vazifasi |
| --- | --- |
| `voice.mjs` | Subtitrlar → talaffuz shakli ("kommit", "brench"…) → **bitta** Gemini so'rovi → `voice/raw.wav` |
| `../align-lines.py` | MMS aligner (`scripts/align.py`) bilan har gapning audio'dagi chegarasi → `voice/lines.json` |
| `build-voice.mjs` | Gaplarni kesadi, animatsiya vaqtini ovozga moslab cho'zadi (`voice/warp.js`), `voice/voice.wav`, `voice/subtitles.vtt`, `voice/chapters.vtt` |
| `mix.sh` | Musiqa gap paytida cho'kadi (sidechain), ikki bosqichli loudnorm → `mix.wav` |

```bash
node voice.mjs --plan                                   # modelga ketadigan matn, so'rovsiz
set -a; . ../../.env; set +a; node voice.mjs            # kunlik bepul limitdan 1 so'rov
../../.venv-align/bin/python ../align-lines.py .        # (papka ichidan; .venv-align — asosiy repo'da)
node build-voice.mjs && node music.mjs && ./mix.sh
```

`voice/warp.js` bo'lsa, `index.html` va `music.mjs` cho'zilgan vaqtda ishlaydi va subtitr kadrga chizilmaydi (pleyerda CC).

Yig'ish (papka ichida):

```bash
npm i --no-save playwright-core@1.57.0   # Chromium ~/Library/Caches/ms-playwright dan olinadi
node stills.mjs 4 33 90 131              # kadrlarni ko'rib chiqish
node music.mjs
node render.mjs
ffmpeg -f concat -safe 0 -i segs/list.txt -i mix.wav -map 0:v -map 1:a -c:v copy \
  -c:a aac -b:a 192k -shortest -movflags +faststart full.mp4   # ovozsiz versiyada mix.wav o'rniga music.wav
# sayt uchun siqish va muqova
ffmpeg -i full.mp4 -c:v libx264 -preset slow -crf 23 -tune animation -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart web.mp4
node poster.mjs && ffmpeg -i poster.png -vf scale=1280:-2 -q:v 3 poster.jpg
```

`render.mjs` davomiylikni sahifadan (`window.DURATION`) oladi.

## Asl nusxalar — Google Drive

Repo'ga faqat saytga siqilgan nusxa (`public/video/`) tushadi. Asl 1080p `video/<nom>/full.mp4` (git'da yo'q) Google Drive'ga arxivlanadi:

```bash
rclone config create gdrive drive scope=drive.file   # bir marta: brauzerda Google akkauntga ruxsat
video/arxiv.sh git-umumiy                             # yoki argumentsiz — hamma videolar
```

`scope=drive.file` — rclone faqat o'zi yuklagan fayllarni ko'radi, Drive'dagi boshqa fayllarga kirmaydi. Fayllar Drive'da `dev-docs/video/<nom>/full.mp4` da turadi.

Ulanish o'z OAuth client'imiz orqali (Google Cloud: Drive API yoqilgan, Desktop client, foydalanuvchi — test user). rclone'ning umumiy client_id'si 2026-yilda yopiladi, shuning uchun u ishlatilmaydi. Ilova Testing rejimida — ruxsat 7 kunda eskiradi; skript buni aniqlab `rclone config reconnect gdrive:` ni so'raydi. Client ID/secret faqat `~/.config/rclone/rclone.conf` da, repo'da yo'q.
