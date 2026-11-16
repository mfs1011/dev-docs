# React videolari — uslub

Faqat **React qo'llanmasi** videolari uchun. Namuna: `react-umumiy/` ("React — boshlang'ich video").
Git, SQL va FSD uslublari boshqa — aralashtirmang. Texnik zanjir FSD bilan bir xil (ovoz birinchi, `SY.W` so'z bog'lanishi).

## 1. Metafora — konstruktor bloklari

| React | Videoda | Ko'rinishi |
| --- | --- | --- |
| Komponent | **G'isht** (bo'rtiqli konstruktor bloki) | Yumaloq to'rtburchak, ustida bo'rtiqlar, pastida qalin "lab", soya; nomi `<Nom />` |
| Sahifa | Bloklardan yig'ilgan **maket** (`page()`) | Brauzer ramkasi `dokon.uz`: `<Sarlavha />`, uchta `<Karta />`, `<Savat />` |
| Props | Pastga tushadigan **yorliq** | Binafsha strelka, yorliqda `nom="Olma" narx={12000}`; qulf belgisi — "faqat o'qish" |
| Holat | Blok ichidagi **xotira** | Sariq ramkali `xotira (holat)` qutisi, `son = 0` |
| Qayta chizish | Faqat o'zgargan blok **yonadi** | Sariq nur (`glow`), eski/yangi daraxtda bitta tugun |
| Ma'lumot oqimi | Ko'k nuqtalar pastga, to'q sariq nuqta yuqoriga | `ma'lumot ↓ props`, `hodisa ↑ funksiya` |
| Effekt | Komponentdan tashqi qutiga **kabel** | Yashil kabel, `useEffect` yorlig'i; tozalashda kabel uziladi |

Misol sohasi — internet do'kon (SQL va FSD videolari bilan bir xil): Olma, Non, Sut, savat.

## 2. Vizual uslub

| Narsa | Qiymat |
| --- | --- |
| Fon | Krem `#f7f0e4`, konstruktor plitasi kabi och nuqtali to'r (48 px) |
| Ranglar | Ko'k `#3fb6d3` (komponent), marjon `#ff7a59`, sariq `#ffc23c` (holat), yashil `#3fae6f` (✓, effekt), binafsha `#8e7dff` (props), qizil `#e5484d` (✗) |
| Shriftlar | Sarlavha — Futura 800; matn — Avenir Next; kod — Menlo |
| Sahna yorlig'i | Chap yuqorida g'isht ko'rinishidagi yorliq (`sceneTag`) — markazda sarlavha chizilmaydi |
| Joylashuv | Kontent `y 150–930`; pastki ~150 px CC uchun bo'sh |
| Harakat | Bloklar yuqoridan tushib "qo'nadi" (`dropBrick`, `eback`); kod qatorma-qator ochiladi |
| Terminal | Faqat haqiqiy buyruq chiqishi uchun (`dalil/`) |

## 3. Ovoz va musiqa

| Narsa | Qiymat |
| --- | --- |
| TTS | Gemini `gemini-3.8-flash-tts`, ovoz **Charon**, butun matn bitta so'rovda |
| Talaffuz (`voice.mjs` `SAY`) | React → Riakt, JSX → Jey-es-eks, useState → yuz-steyt, hook → xuk, Vite → Vit, React Router → Riakt Rauter, TanStack Query → Tenstek Kveri, Next.js → Nekst-jey-es |
| Musiqa (`music.mjs`) | Sol major, 112 BPM, G–Em–C–D; **kalimba** arpejiosi (sakkizliklar), yumshoq pad, bas, qarsak (2 va 4-zarb) |
| Effektlar (`cues.js`) | `snap` — blok qo'nishi (plastik "chiq"); `click` — tugma; `pop`, `ding`, `error`, `whoosh`, `tick`, `swell` |

## 4. Haqiqiy dalil

`dalil/hisoblagich.mjs` — React 19.3.0 + jsdom: tugma bosilgach DOM'dagi o'zgarishlar `MutationObserver` bilan sanaladi.
Natija (`dalil/hisoblagich.txt`): **1 ta o'zgarish** — `"Mahsulotlar: 0" -> "Mahsulotlar: 1"`. Videodagi terminal shu fayldan so'zma-so'z.

```bash
cd <scratch> && npm i react@19.3.0 react-dom@19.3.0 jsdom@26 && node hisoblagich.mjs > hisoblagich.txt
```
