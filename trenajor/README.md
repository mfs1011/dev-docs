# Git trenajori

Brauzerda **haqiqiy git**: v86 emulyatorida Linux (Alpine 3.24, git 2.54) ishlaydi, terminal — xterm.js.
Har buyruqdan keyin repo holati haqiqiy git'dan so'raladi va animatsiya qilinadi: commit grafi, uch quti
(ishchi papka → index → HEAD), haqiqiy `.git` papka (obyektlarni ochib ko'rish bilan).

Sayt ichidagi sahifa: `/git/trenajor` (`src/views/TrenajorPage.vue`, kod `src/trenajor/`).
Og'ir qismlar (v86, xterm) alohida chunk — faqat shu sahifa ochilganda yuklanadi.

```bash
npm run dev               # http://localhost:5180/git/trenajor
npm run trenajor:rootfs   # Linux fayl tizimini qayta yig'ish (trenajor/overlay/ o'zgarganda) -> public/trenajor/fs/
npm run trenajor:test     # Node'da VM: ishga tushish, 27 mashqning har qadami, graf joylashuvi
npm run trenajor:havolalar  # boblarning «Amaliyot» bo'limiga mashq havolalarini yozadi
```

| Papka | Nima |
| --- | --- |
| `src/trenajor/` | VM, holat, maslahatlar, komponentlar |
| `public/trenajor/` | v86.wasm, BIOS, Linux yadrosi, fayl tizimi (`fs/`) — statik fayllar |
| `trenajor/scripts/`, `trenajor/overlay/` | fayl tizimini yig'ish skriptlari va VM ichiga qo'shiladigan fayllar |
| `trenajor/test/` | Node va brauzer sinovlari |

## Qanday ishlaydi

| Qism | Fayl | Vazifa |
| --- | --- | --- |
| Linux VM | `src/trenajor/vm.js` | v86 + buildroot yadrosi (Linux 6.8, 9p ichida), ildiz fayl tizimi 9p orqali HTTP'dan, fayllar faqat kerak bo'lganda yuklanadi |
| Fayl tizimi | `trenajor/scripts/rootfs.py`, `fsjson.py` | Alpine minirootfs + paketlar (git, bash, bash-completion, nano, less) Docker'siz yig'iladi → `public/trenajor/fs/` |
| VM ichidagi fayllar | `trenajor/overlay/` | `trenajor-init` (PID 1), `.bashrc`, `trenajor-holat` (har prompt oldidan repo holati), `trenajor-salom` |
| Holat | `src/trenajor/holat.js` | `@cwd/@refs/@commits/@status/...` bo'limlarini o'qiydi, ikki holat farqidan o'zbekcha izoh yasaydi |
| Terminal | `src/trenajor/Terminal.vue` | xterm + xira maslahat (Tab) — joriy qator xterm buferidan o'qiladi |
| Maslahatlar | `src/trenajor/katalog.js`, `src/trenajor/maslahat.js` | git buyruqlari, flaglar, branch/fayl nomlari |
| Ko'rinish | `Graf.vue`, `UchQuti.vue`, `GitPapka.vue` | SVG graf (CSS transition), uch quti, `.git` daraxti va obyekt ko'rish |
| Mashqlar | `src/trenajor/mashqlar.js`, `MashqTanlash.vue` | har mashq: `setup` (VM ichida bash, yordamchilar `overlay/usr/local/lib/trenajor/mashq.sh`), qadamlar va `check(holat, buyruq)`; `?mashq=<id>` bilan ochiladi |
| Graf joylashuvi | `src/trenajor/grafLayout.js` | branch'lar yaratilgan tartibda (reflog); har bo'lak ota qatorga eng yaqin, chiziqlar kesishmaydigan qatorga tushadi |

Sahifa va VM o'rtasidagi aloqa — terminal oqimidagi ko'rinmas OSC ketma-ketliklari:
`OSC 7770` — prompt tayyor, `OSC 7771;<base64>` — repo holati.

## O'lchovlar (lokal, Chromium)

- Ishga tushish: ~3,5 s; birinchi yuklash: 19,3 MB (yadro 9,6 MB + v86.wasm 1,9 MB + ishlatilgan fayllar).
- Keyingi buyruqlar deyarli hech narsa yuklamaydi (9p fayllari xotirada keshlanadi — `src/trenajor/vm.js`).

## Litsenziyalar

v86 — BSD-2-Clause; buildroot yadrosi (copy.sh) — GPL-2.0; Alpine paketlari — o'z litsenziyalari (git — GPL-2.0).
