# 02 — O'rnatish va birinchi ilova

[← Oldingi: Angular nima va nega shunday](01-kirish.md) · [Mundarija](README.md) · [Keyingi: Loyiha tuzilmasi va bootstrap →](03-loyiha-tuzilmasi.md)

## Tushuncha

Angular loyihasi **Angular CLI** (`ng`) orqali yaratiladi va boshqariladi. CLI — shunchaki yaratuvchi emas: u build qiladi, dev server ishga tushiradi, test yurgizadi, kod generatsiya qiladi va versiyalarni yangilaydi. Angular'da qo'lda Vite yoki webpack sozlash yo'q.

Bu bobda: talablar, o'rnatish, birinchi loyiha, ishga tushirish va birinchi o'zgarish.

## Nega shunday

CLI orqali ishlashning sababi — **bir xillik**. Har `ng new` bir xil tuzilma, bir xil build sozlamalari, bir xil test muhitini beradi. Shuning uchun istalgan Angular loyihasini ochib, `npm start` va `npm test` ishlashini kutish mumkin.

Ikkinchi sabab — **yangilanish**. `ng update` sizning konfiguratsiyangizni ham yangilaydi. Agar build'ni qo'lda sozlagan bo'lsangiz, bu avtomatlashtirish ishlamay qoladi.

## Kod: talablar

| Narsa | Talab | Tekshirish |
| --- | --- | --- |
| Node.js | **v22.22.3** yoki yangiroq | `node --version` |
| Paket menejeri | npm, pnpm, yarn yoki bun | `npm --version` |
| Muharrir | VS Code + Angular Language Service | 70-bob |

Node versiyasi eski bo'lsa, CLI darhol xato beradi. Bir necha loyiha turli Node versiyalarida bo'lsa — `nvm` yoki `fnm` bilan boshqaring.

## Kod: CLI'ni o'rnatish

```bash
npm install -g @angular/cli
ng version
```

`ng version` CLI, Node va Angular paketlari versiyasini chiqaradi. Global o'rnatmaslik ham mumkin — bir martalik buyruq uchun:

```bash
npx @angular/cli@latest new my-app
```

> **Global va lokal CLI.** Loyiha ichida `ng` buyrug'i loyihaning **o'z** `node_modules` dagi CLI versiyasini ishlatadi. Global CLI faqat `ng new` uchun kerak. Global va loyiha versiyasi farq qilsa ogohlantirish chiqadi — bu normal. Ishonch hosil qilish uchun `npm run ng -- version`.

## Kod: loyiha yaratish

```bash
ng new my-app
```

CLI bir nechta savol beradi: stil formati (CSS, SCSS, Sass, Less), server rendering (SSR/SSG) kerakmi va boshqalar. Savollarsiz, standart tanlovlar bilan:

```bash
ng new my-app --defaults
```

Foydali bayroqlar:

| Bayroq | Nima qiladi |
| --- | --- |
| `--style=scss` | Stil formati |
| `--ssr` | Server rendering bilan yaratadi (62-bob) |
| `--defaults` | Barcha savollarga standart javob |
| `--skip-git` | Git repozitoriy yaratmaydi |
| `--skip-install` | Paketlarni o'rnatmaydi (tez ko'rib chiqish uchun) |
| `--package-manager=pnpm` | npm o'rniga boshqa menejer |

Nima yaratiladi (Angular 22, `--defaults`):

```
my-app/
├── angular.json          ← loyiha konfiguratsiyasi (build, serve, test)
├── package.json
├── tsconfig.json         ← TypeScript sozlamalari
├── tsconfig.app.json
├── tsconfig.spec.json
├── .prettierrc           ← kod formati (Prettier)
├── .editorconfig
├── public/
│   └── favicon.ico       ← statik fayllar
└── src/
    ├── index.html
    ├── main.ts           ← kirish nuqtasi
    ├── styles.css        ← global stillar
    └── app/
        ├── app.ts        ← ildiz komponent
        ├── app.html
        ├── app.css
        ├── app.spec.ts   ← test
        ├── app.config.ts ← ilova konfiguratsiyasi
        └── app.routes.ts ← marshrutlar
```

Har fayl 3-bobda batafsil ko'riladi. Hozir e'tibor bering: `app.component.ts` emas, **`app.ts`**. v20 dan fayl nomlarida `.component` qo'shimchasi yo'q.

## Kod: ishga tushirish

```bash
cd my-app
npm start
```

`npm start` aslida `ng serve` ni chaqiradi (`package.json` dagi `scripts` ga qarang). Natija:

```
  ➜  Local:   http://localhost:4200/
```

Brauzerda <http://localhost:4200> ni oching — Angular'ning salomlashuv sahifasi chiqadi.

Dev server fayllarni kuzatadi. Shablon yoki stilni o'zgartirsangiz, sahifa **qayta yuklanmasdan** yangilanadi (hot module replacement). TypeScript o'zgarishida sahifa qayta yuklanadi.

Port band bo'lsa:

```bash
ng serve --port 4300
```

## Kod: birinchi o'zgarish

`src/app/app.html` — 20 KB lik salomlashuv shabloni. Uning hammasini o'chirib, o'rniga yozing:

```html
<main>
  <h1>Salom, {{ title() }}!</h1>
  <p>Birinchi Angular ilovam.</p>
</main>

<router-outlet />
```

`title` qayerdan keladi? `src/app/app.ts` ni oching:

```ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('my-app');
}
```

`title` — signal, shuning uchun shablonda `title()` deb **chaqiriladi**. Qavslarni unutsangiz, ekranda funksiyaning matni chiqadi — bu eng birinchi uchraydigan xato.

Signal qiymatini o'zgartirib ko'ring:

```ts
protected readonly title = signal('Angular');
```

Saqlaganda brauzer o'zi yangilanadi.

## Kod: production build

```bash
npm run build
```

Natija `dist/my-app/browser/` papkasida — oddiy statik fayllar (HTML, JS, CSS). Ularni istalgan statik hosting'ga qo'yish mumkin.

Build **byudjetlarni** tekshiradi (`angular.json` da):

| Byudjet | Ogohlantirish | Xato |
| --- | --- | --- |
| Boshlang'ich bundle | 500 kB | 1 MB |
| Bitta komponent stili | 4 kB | 8 kB |

Byudjet oshsa build ogohlantiradi yoki to'xtaydi. Bu — unumdorlik "o'z-o'zidan buzilib qolmasligi" uchun qo'yilgan to'siq (74-bob).

## Kod: test

```bash
npm test
```

Angular 21 dan standart test muhiti — **Vitest**. `app.spec.ts` dagi ikki test ishlaydi. Birinchi o'zgarishdan keyin "should render title" testi yiqilishi mumkin — chunki matn o'zgardi. Bu yaxshi belgi: test haqiqatan tekshiryapti. Testlash 71–72-boblarda.

## Muhandislik nuqtai nazari: paket menejeri tanlash

| Menejer | Afzalligi | Qachon |
| --- | --- | --- |
| npm | Node bilan keladi, hamma biladi | Standart tanlov |
| pnpm | Tezroq, disk tejaydi, qat'iyroq | Monorepo, katta loyiha |
| yarn | Eski loyihalarda keng tarqalgan | Mavjud loyiha shuni ishlatsa |
| bun | Eng tez o'rnatish | Sinab ko'rish, kichik loyiha |

Muhimi — **bitta loyihada bitta menejer** va lock faylni (`package-lock.json`, `pnpm-lock.yaml`) commit qilish. `ng new` `package.json` ga `packageManager` maydonini yozadi — bu jamoadagi hamma bir xil menejer ishlatishi uchun.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Eski Node versiyasi | CLI ishga tushmaydi | Node v22.22.3+ |
| Shablonda `title` (qavssiz) | Funksiya matni chiqadi | `title()` |
| `sudo npm install -g` | Ruxsat muammolari | nvm/fnm bilan Node o'rnating |
| Build sozlamalarini qo'lda o'zgartirish | `ng update` ishlamay qoladi | `angular.json` orqali |
| Lock faylni commit qilmaslik | Har kompyuterda boshqa versiyalar | Doim commit qiling |
| Global CLI versiyasiga tayanish | Loyihada boshqa versiya | `npm run ng -- ...` |

## Amaliyot

1. Node versiyangizni tekshiring, kerak bo'lsa yangilang.
2. `ng new my-app --defaults` bilan loyiha yarating va `npm start` qiling.
3. `app.html` ni tozalab, o'z matningizni yozing; `title` signalini o'zgartiring.
4. Shablonda `title()` dagi qavslarni olib tashlang va nima chiqishini ko'ring. Qaytaring.
5. `npm run build` qiling va `dist/` ichidagi fayllar hajmiga qarang.
6. `npm test` ni ishga tushiring; yiqilgan testni o'qib, nega yiqilganini tushuning.

## Rasmiy hujjat

- O'rnatish: <https://angular.dev/installation>
- `ng new`: <https://angular.dev/cli/new>
- `ng serve`: <https://angular.dev/cli/serve>
- Birinchi qadamlar: <https://angular.dev/tutorials/learn-angular>
