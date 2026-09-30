# 49 — Build va yetkazib berish

[← Oldingi: Frontend xatolari va kuzatuvchanlik](48-frontend-xatolari.md) · [Mundarija](README.md) · [Keyingi: Mikro-frontendlar →](50-mikro-frontendlar.md)

## Tushuncha

Frontend "deploy" — backend'dan farqli: kod **foydalanuvchi brauzeriga** ko'chiriladi va u yerda soatlab, kunlab yashaydi. Shuning uchun build va yetkazish qarorlari:

| Qaror | Savol |
| --- | --- |
| **Chunk strategiyasi** | Kod qanday bo'laklarga bo'linadi? |
| **Kesh-busting** | Yangi versiya qanday yetkaziladi, eskisi qanday unutiladi? |
| **Versiya nomuvofiqligi** | Eski tab yangi backend bilan qanday ishlaydi? |
| **Artefakt** | Bitta build — ko'p muhitmi? (18-bob) |

## Nega shunday

Backend yangilansa — hamma so'rovlar darhol yangi kodga boradi. Frontend yangilansa — ochiq tablar **eski kod**da qoladi. Bu yangi muammo sinfini keltiradi:

```text
09:00  Foydalanuvchi sahifani ochdi — main-A1.js (v1)
10:00  Deploy v2: main-B2.js, eski chunk'lar serverdan o'chirildi, API o'zgardi
11:00  Foydalanuvchi "Hisobotlar" ga bosdi → v1 kodi reports-A7.js ni so'raydi → 404
       yoki: v1 kodi eski API formatini yuboradi → 422
```

## Psevdokod: kesh-busting

```text
Fayl nomida kontent hash'i:  main-7F3A2C.js, styles-91BD.css
  → Cache-Control: public, max-age=31536000, immutable      (hech qachon o'zgarmaydi — abadiy kesh)

index.html (hash'siz, kirish nuqtasi):
  → Cache-Control: no-cache                                  (har safar serverdan tekshiriladi)

Natija: yangi deploy'dan keyin index.html yangi hash'larni ko'rsatadi, eski fayllar keshda qolsa ham ishlatilmaydi
```

## Psevdokod: versiya nomuvofiqligi

```text
1. Eski chunk'larni saqlash: deploy'da eski versiya fayllari bir necha kun serverda qoladi
   (bir nechta versiya ustma-ust — obyekt storage'da oson)
2. Chunk xatosini ushlash: dinamik import yiqilsa → sahifani qayta yuklash (bir marta, siklsiz)
3. Yangi versiya haqida xabar: /version.json ni vaqti-vaqti bilan so'rash →
   "Yangi versiya mavjud — yangilash" banneri (forma to'ldirilayotgan bo'lsa majburlamasdan)
4. API orqaga moslik: backend kamida N-1 frontend versiyasini qo'llaydi (58-bob, expand/contract)
```

4-qoida — kesishma (V qism) masalasi: frontend va backend **turli vaqtda** deploy bo'ladi, shuning uchun API o'zgarishlari doim ikki bosqichli.

## Psevdokod: chunk strategiyasi

```text
entry (main)        — ilova qobig'i, router, asosiy layout
vendor / framework  — kam o'zgaradigan kutubxonalar (alohida — uzoq keshlanadi)
route chunk'lar     — har bo'lim (lazy)
@defer / dynamic    — sahifa ichidagi og'ir qismlar
umumiy chunk'lar    — bundler avtomatik (bir nechta route ishlatadigan kod)

Muvozanat: juda ko'p mayda chunk — ko'p so'rov (HTTP/2 da kamroq muammo); juda katta — keraksiz kod
```

## Framework'larda

| Mavzu | Angular | React / Next | Vue |
| --- | --- | --- | --- |
| Build vositasi | esbuild (`@angular/build`) — [Angular 6](../angular/06-angular-cli.md), [70-bob](../angular/70-devtools-va-cli.md) | Vite / Turbopack — [Next.js 6-bob](../nextjs/06-turbopack-va-build.md) | Vite — [Vue 38-bob](../vue/38-tooling.md) |
| Hash'li fayllar | `outputHashing: "all"` (sukut) | sukut | sukut |
| Chunk xatosi | `withNavigationErrorHandler` + brauzerga qarab xabar regex — [Angular 43-bob](../angular/43-lazy-loading.md) | `lazy()` + boundary | `router.onError` |
| Deploy | [Angular 65-bob](../angular/65-prerender-va-deploy.md) | [Next.js 47–48](../nextjs/47-vercel.md) | [Vue 67-bob](../vue/67-deploy.md) |
| Statik hosting fallback | `index.csr.html` (SSG bilan) — [65-bob](../angular/65-prerender-va-deploy.md) | — | — |

Angular'da tekshirilgan misol: chunk yuklash xatosi xabari brauzerga qarab farq qiladi (Chrome: "Failed to fetch dynamically imported module", Safari: "Importing a module script failed") — shuning uchun matn emas, regex bilan tekshiriladi.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Eski chunk'larni saqlash | Eski tablar ishlaydi | Storage, tozalash siyosati |
| Majburiy qayta yuklash | Hamma yangi versiyada | Kiritilgan ma'lumot yo'qolishi |
| "Yangi versiya" banneri | Foydalanuvchi tanlaydi | Eski versiyada qolishi mumkin |
| Ko'p mayda chunk | Keraksiz kod yuklanmaydi | Ko'p so'rov, waterfall |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `index.html` uzoq keshlanadi | Yangi versiya ko'rinmaydi | `no-cache` |
| Hash'siz JS fayllar + uzoq kesh | Eski kod abadiy | Kontent hash |
| Deploy'da eski chunk'lar o'chiriladi | Ochiq tablarda 404 | Bir necha versiya saqlash |
| API'ni frontend bilan bir vaqtda buzish | Eski tablar yiqiladi | N-1 moslik |
| Chunk xatosida cheksiz qayta yuklash | Sahifa aylanib qoladi | Bir marta, `sessionStorage` bayrog'i |

## Amaliyot

1. Production'da `index.html` va JS fayllaringizning `Cache-Control` sarlavhalarini tekshiring.
2. Ochiq tab bilan yangi versiyani deploy qiling va boshqa bo'limga o'ting — nima bo'ladi?
3. Chunk yuklash xatosi uchun bir martalik qayta yuklash mantiqini qo'shing.
4. `/version.json` + "yangi versiya" bannerini qiling.

## Manbalar

- web.dev — *HTTP caching* <https://web.dev/articles/http-cache>
- Jake Archibald — *Caching best practices & max-age gotchas*
- Vite — *Build for production* <https://vite.dev/guide/build>
