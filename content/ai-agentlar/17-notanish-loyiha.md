# 17 — Notanish loyihani o'rganish

[Mundarija](README.md)

## Tushuncha

Yangi jamoaga qo'shildingiz yoki boshqa birovning repo'sida xatoni tuzatishingiz kerak. Bir necha yuz faylni o'zingiz varaqlab
chiqish bir necha soat oladi. Agent esa kodni tez o'qiydi. CC (Best practices) bo'yicha hozirgi modellar fayl tuzilishini,
konvensiyalarni va komponentlar qanday qurilganini juda yaxshi topadi.

CC (Common workflows) notanish kod bazasini o'rganishning ikki retseptini beradi:

| Retsept | Qadamlar |
| --- | --- |
| **Umumiy ko'rinish** | `give me an overview of this codebase` → `explain the main architecture patterns used here` → `what are the key data models?` → `how is authentication handled?` |
| **Kerakli kodni topish** | `find the files that handle user authentication` → `how do these authentication files work together?` → `trace the login process from front-end to database` |

Hujjatdagi maslahatlar:

- **Kengdan torga:** avval umumiy savollar, keyin aniq joylar.
- **Konvensiya va naqshlarni so'rang:** loyihada qanday yozish qabul qilingan.
- **Loyiha lug'atini so'rang:** loyihaga xos atamalar (domen so'zlari) ro'yxati.
- **Aniq bo'ling va loyihaning o'z tilini ishlating.** "To'lov" emas, kodda `checkout` deyilsa, `checkout` deng.
- Kod tahlili plaginini o'rnating (16-bob): u "ta'rifga o'tish" va "murojaatlarni topish"ni aniq qiladi.

### Nega plan mode

O'rganish bosqichida agent hech narsani o'zgartirmasligi kerak. Plan mode (7-bob) aynan shuni kafolatlaydi: agent fayllarni
o'qiydi va buyruqlar bilan o'rganadi, lekin manba fayllarni tahrirlamaydi. CC (Permission modes) plan mode'ni "kod bazasini
o'zgartirishdan oldin o'rganish" uchun tavsiya qiladi.

## Amalda

Sinov uchun **shu saytning** manba kodi olindi: `src/`, `scripts/`, `docs.config.mjs`, `package.json` (167 fayl, qo'llanma matnlarisiz).
Agent bu kodni avval ko'rmagan. Claude Code 2.1.325, plan mode.

### 1. Umumiy ko'rinish

CC retseptidagi birinchi savol:

```text
give me an overview of this codebase. Javobni o'zbekcha, qisqa ber (10 qatorgacha).
```

3 navbat, taxminan 20 soniyada javob keldi (qisqartirilgan):

```text
Bu o'zbek tilidagi o'quv sayti: dasturlash bo'yicha qo'llanmalar va interaktiv trenajorlar bor. Ichida 167 ta fayl.

- **Stek:** Vue 3, Vite, Vue Router va Pinia. Sayt PWA sifatida ishlaydi, foydalanuvchi akkaunti va progress
  sinxronizatsiyasi uchun Supabase ishlatiladi (`src/sync.js`, `src/progress.js`).
- **Kitoblar:** ro'yxat `docs.config.mjs` faylida ... Markdown matnlar repoda yo'q: `scripts/sync-content.mjs` ularni
  `content/` papkasidan yoki `DOCS_SOURCE` ko'rsatgan joydan oladi va markdown-it bilan chiqaradi.
- **Trenajorlar:** har biri o'z papkasida joylashgan: ...
- **Ishga tushirish:** `npm run dev` yoki `npm run build`; ikkalasi ham avval `sync` ni ishga tushiradi.

`trenajor:test` kabi test skriptlari repoda yo'q papkalarga murojaat qiladi (`trenajor/`, `sql-trenajor/` va boshqalar),
shuning uchun bu yerda ishlamaydi.
```

Oxirgi qator diqqatga sazovor: agent sinov nusxasida yetishmayotgan papkalarni o'zi sezdi. Haqiqatan ham ular nusxaga
kiritilmagan edi. Notanish loyihada aynan shunday "ishlamaydigan joy" haqidagi ogohlantirish eng qimmatli ma'lumot.

### 2. Aniq yo'lni kuzatish

CC'dagi "trace the login process" retsepti kabi, shu sessiyaning davomida (`--resume`):

```text
Markdown fayl content/ papkasidan brauzerdagi sahifagacha qanday yo'l bosib o'tadi? Yo'lni fayl:qator bilan kuzat, o'zbekcha, qisqa.
```

Javob (qisqartirilgan):

```text
Markdown fayl ikki bosqichdan o'tadi: avval build vaqtida bir marta yig'iladi, keyin brauzerda har bir sahifa ochilganda
render qilinadi.

**1. Build vaqtida**
1. `docs.config.mjs:5`: manba papka `contentRoot` ga yoziladi; bu `content` yoki `DOCS_SOURCE` qiymati.
2. `scripts/sync-content.mjs:362` `main()` har bir kitob uchun `collectBook()` ni chaqiradi.
3. ... `routeFor()` (`:127`) esa URL yo'lini hisoblaydi.
4. `sync-content.mjs:231` `swapIntoPlace()`: tayyor papka `src/content/` o'rniga qo'yiladi.
5. `sync-content.mjs:424-425`: sahifalar ro'yxati `src/manifest.json` ga, qidiruv indeksi `src/search-index.json` ga yoziladi.

**2. Brauzerda**
6. `src/docs.js:3`: `import.meta.glob('./content/**/*.md', '?raw')` har bir bobni alohida, kerak bo'lganda yuklanadigan
   bo'lak (chunk) qiladi.
...
8. `src/router.js:31`: catch-all marshrut `/:pathMatch(.*)*` sahifani `DocPage.vue` ga yuboradi.
9. `src/views/DocPage.vue:554`: `watch(route.path)` o'zgarganda `load()` (`:470`) chaqiriladi ...
11. `DocPage.vue:495`: `renderMarkdown()` (`src/markdown.js:254`) matnni HTML ga aylantiradi. ...
```

### 3. Da'volarni tekshirish

Agent bergan fayl:qator havolalari `sed -n` bilan birma-bir tekshirildi:

| Havola | Haqiqiy qator |
| --- | --- |
| `docs.config.mjs:5` | `export const contentRoot = process.env.DOCS_SOURCE ?? 'content'` |
| `scripts/sync-content.mjs:362` | `async function main() {` |
| `scripts/sync-content.mjs:127` | `function routeFor(book, relPath) {` |
| `scripts/sync-content.mjs:231` | `async function swapIntoPlace(staging, target, attempts = 5) {` |
| `src/docs.js:3` | `const sources = import.meta.glob('./content/**/*.md', { query: '?raw', … })` |
| `src/router.js:31` | `{ path: '/:pathMatch(.*)*', name: 'doc', component: DocPage },` |
| `src/views/DocPage.vue:554` | `watch(() => route.path, load, { immediate: true })` |
| `src/markdown.js:254` | `export function renderMarkdown(source) {` |

Tekshirilgan 13 ta havolaning hammasi to'g'ri chiqdi. Shuning uchun "fayl:qator bilan" degan talab foydali. Agentning har bir
da'vosi bir buyruq bilan tekshiriladi, va gallyutsinatsiya bo'lsa darhol ko'rinadi (2, 11-boblar).

## O'rganishni qanday tashkil qilish

| Bosqich | Savol namunasi | Natija |
| --- | --- | --- |
| 1. Umumiy | `give me an overview of this codebase` | Stek, asosiy qismlar, ishga tushirish |
| 2. Lug'at | `bu loyihaga xos atamalar lug'atini tuz` | Domen so'zlari va ularning koddagi joyi |
| 3. Konvensiyalar | `loyihada qanday konvensiya va naqshlar ishlatiladi?` | Yangi kodni qanday yozish |
| 4. Aniq yo'l | `X qanday ishlaydi? fayl:qator bilan kuzat` | Bitta jarayonning to'liq yo'li |
| 5. Tekshirish | Havolalarni o'zingiz ochib ko'rish | Ishonch |
| 6. Saqlash | Topilgan "ko'rinmas" faktlarni CLAUDE.md'ga yozish | Keyingi sessiya qaytadan qidirmaydi (13-bob) |

Oxirgi qadam CC (Best practices) tavsiyasiga bog'liq: koddan topish uchun bir necha daqiqa qazish kerak bo'lgan va agent har
sessiya boshida qayta qaziydigan ma'lumot CLAUDE.md'ga yozishga arziydi.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Kodni o'zingiz o'qish | Chuqur tushunish | Ko'p vaqt | Kichik loyiha yoki juda muhim qism |
| Agentdan umumiy ko'rinish | Bir necha daqiqada xarita | Yuzaki; tafsilotlar tekshirilmagan | Birinchi kun |
| Agent bilan yo'lni kuzatish (fayl:qator) | Aniq va tekshiriladigan | Bir savol — bitta jarayon | Aniq vazifadan oldin |
| Katta o'rganishni subagentga berish | Asosiy kontekst toza qoladi | Faqat xulosa qaytadi | Juda katta repo (30-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| O'rganishni oddiy rejimda boshlash | Agent "yordam berib" fayllarni o'zgartirishi mumkin | Plan mode |
| Birinchi savoldayoq tor savol berish | Umumiy kontekstsiz javobni baholash qiyin | CC: kengdan torga |
| Javobni tekshirmasdan qabul qilish | Gallyutsinatsiya xavfi (2-bob) | Fayl:qator so'rang va bir nechtasini oching |
| Loyihaning o'z atamalarini ishlatmaslik | Agent noto'g'ri joyni qidiradi | CC: loyihaning domen tilini ishlating |
| Topilganlarni saqlamaslik | Keyingi sessiyada agent hammasini qaytadan qidiradi | Ko'rinmas faktlarni CLAUDE.md'ga yozing |

## Amaliyot

1. CC'dagi notanish kod bazasini o'rganishning ikki retsepti qaysilar?
2. O'rganish bosqichida nega plan mode ishlatish kerak?
3. Tajribada agentning umumiy javobidagi eng foydali ma'lumot nima edi?
4. Nega "fayl:qator bilan kuzat" talabi foydali?
5. O'rganish natijasida topilgan qaysi ma'lumotni CLAUDE.md'ga yozish kerak?
6. Yangi loyihada "to'lov qanday ishlaydi?" deb so'rash o'rniga qanday so'raysiz?

<details>
<summary>Javoblar</summary>

1. Umumiy ko'rinish (overview → arxitektura naqshlari → ma'lumot modellari → aniq mavzu) va kerakli kodni topish (fayllarni topish → ular qanday birga ishlaydi → jarayonni boshidan oxirigacha kuzatish).
2. Agent fayllarni o'qiydi va buyruqlar bilan o'rganadi, lekin manba fayllarni tahrirlamaydi.
3. `trenajor:test` kabi skriptlar repoda yo'q papkalarga murojaat qilishi va shuning uchun ishlamasligi haqidagi ogohlantirish.
4. Har bir da'voni bitta buyruq bilan tekshirish mumkin; gallyutsinatsiya bo'lsa darhol ko'rinadi. Tajribada 13 ta havolaning hammasi to'g'ri chiqdi.
5. Koddan topish uchun qazish kerak bo'lgan va agent har sessiyada qayta qaziydigan ma'lumot: tekshirish buyruqlari, chalg'ituvchi joylar, ishlamaydigan qismlar, repo'da yozilmagan qarorlar.
6. Loyihaning o'z atamalari bilan, masalan: "`checkout` jarayonini savat sahifasidan to'lov provayderiga so'rovgacha fayl:qator bilan kuzat".

</details>

## Rasmiy hujjat

- [CC: Common workflows — Understand new codebases](https://code.claude.com/docs/en/common-workflows#understand-new-codebases)
- [CC: Choose a permission mode — Plan mode](https://code.claude.com/docs/en/permission-modes#analyze-before-you-edit-with-plan-mode)
- [CC: Best practices — Tell Claude what it can't see](https://code.claude.com/docs/en/best-practices#tell-claude-what-it-cant-see)
- [CC: Code intelligence plugins](https://code.claude.com/docs/en/plugins/code-intelligence)
