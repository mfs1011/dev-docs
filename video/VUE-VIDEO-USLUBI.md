# Vue videolari — uslub

Faqat **Vue qo'llanmasi** videolari uchun. Namuna: `vue-umumiy/` ("Vue — boshlang'ich video").
Git (neon), SQL (daftar), FSD (3D bino), React (konstruktor bloklari) uslublari boshqa — aralashtirmang.
Texnik zanjir FSD bilan bir xil (ovoz birinchi, `SY.W` so'z bog'lanishi).

## 1. Metafora — qog'oz applikatsiya va ip

| Vue | Videoda | Ko'rinishi |
| --- | --- | --- |
| Sahifa, komponent | Rangli **qog'oz bo'lagi** | Chetlari yirtiq, biroz qiyshiq, skotch bilan yopishtirilgan (`piece`, `paste`) |
| Reaktiv qiymat (`ref`) | To'g'nog'ichli **manba bo'lagi** | Qiymat o'zgarganda qog'oz ag'dariladi |
| Bog'liqlik | Qizil **ip** | Faqat qiymatni ishlatadigan bo'laklarga tortiladi; o'zgarishda ip tebranadi, munchoq yuguradi (`thread`) |
| Yangilanish | Yashil yorug' chegara | Faqat ip bog'langan bo'lak yonadi, qolgani "tegilmadi" |
| Computed | Yashil iplar bir bo'lakka yig'iladi | "saqlandi" muhri (`stamp`) |
| Komponentlarga bo'lish | Qaychi bilan kesish | Punktir chiziq (`cutLine`), bo'laklar ajraladi |
| Props / emit | Ipda osilgan yorliq pastga / qog'oz samolyot yuqoriga | `plane` |
| Kod | Chiziqli **daftar varag'i** | Ko'k chiziqlar, qizil hoshiya, Courier New (`notebook`) |
| Haqiqiy natija | **Kassa cheki** | Tishli pastki chet, chop etilgandek ochiladi (`receipt`) |

Misol sohasi — internet do'kon (boshqa videolar bilan bir xil): Olma, Non, Sut, savat.

## 2. Vizual uslub

| Narsa | Qiymat |
| --- | --- |
| Fon | Och qog'oz `#efe8da`, tola teksturasi (protsedural), chetlari biroz qoraygan |
| Ranglar | Vue yashil `#42b883`, to'q `#35495e`; pastel qog'ozlar — pushti, sariq, havorang, binafsha, shaftoli, yalpiz; ip — qizil `#c93a3a` |
| Shriftlar | Sarlavha — Chalkboard SE; qo'lyozma matn — Noteworthy; kod — Courier New Bold |
| Sahna yorlig'i | Chap yuqorida pushti skotch bo'lagi (`sceneTag`) — markazda sarlavha chizilmaydi |
| Joylashuv | Kontent `y 150–930`; pastki qism CC uchun bo'sh |
| Harakat | Bo'lak biroz kattaroq va qiyshiq tushib "yopishadi", keyin skotch qo'yiladi |

## 3. Ovoz va musiqa

| Narsa | Qiymat |
| --- | --- |
| TTS | Gemini `gemini-3.8-flash-tts`, ovoz **Aoede** (ayol), yengil va shoshilmasdan |
| Talaffuz (`voice.mjs` `SAY`) | Vue → Vyu, computed → kompyuted, v-if → vi-if, template → templeyt, style → stayl, composable → kompouzabl, use → yuz, .value → nuqta velyu |
| Musiqa (`music.mjs`) | **6/8**, nuqtali chorak = 84; Mi major, E–C#m–A–B; plukli gitara (Karplus-Strong), past viyolonchel, pitsikato bas, cho'tka |
| Effektlar (`cues.js`) | `paste` — qog'oz yopishishi, `tape` — skotch, `pluck` — ip chertilishi, `thread`, `snip` — qaychi, `stamp`, `print` — chek printeri, `flip`, `chime`, `wrong`, `plane`, `strum` |

## 4. Haqiqiy dalil

`dalil/savat.mjs` — Vue 3.5.43: `computed` getter necha marta ishlaganini sanaydi.
Natija (`dalil/savat.txt`): bog'liq bo'lmagan qiymat o'zgarganda **qayta hisoblanmaydi** (1 marta), narx qo'shilganda — 2 marta. Videodagi chek shu fayldan so'zma-so'z.

```bash
cd <scratch> && npm i vue@3.5.43 && node savat.mjs > savat.txt
```
