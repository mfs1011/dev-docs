# 01 — Angular nima va nega shunday

[Mundarija](README.md) · [Keyingi: O'rnatish va birinchi ilova →](02-ornatish.md)

## Tushuncha

Angular — Google qo'llab-quvvatlaydigan, veb-ilovalar qurish uchun **platforma**. "Platforma" so'zi bu yerda asosiy farqni bildiradi.

React va Vue ko'rinish (view) qatlamini hal qiladi. Marshrutlash, formalar, HTTP, holat boshqaruvi — bularni ekotizimdan o'zingiz tanlaysiz va birlashtirasiz. Angular esa hammasini **bitta paket oilasida, bitta versiya raqami bilan** beradi:

| Vazifa | Angular'da | React'da (odatiy tanlov) |
| --- | --- | --- |
| Komponentlar | `@angular/core` | `react` |
| Marshrutlash | `@angular/router` | React Router, TanStack Router |
| Formalar | `@angular/forms` (Signal Forms) | React Hook Form, Formik |
| HTTP | `HttpClient`, `httpResource` | `fetch`, TanStack Query |
| Dependency Injection | O'rnatilgan | Yo'q (kontekst bilan taqlid) |
| Testlash | `TestBed` + Vitest | Vitest + Testing Library |
| Server rendering | `@angular/ssr` | Next.js (alohida freymvork) |
| Ko'p tillilik | `@angular/localize` | react-intl, i18next |
| CLI va build | `ng` (esbuild) | Vite + qo'lda sozlash |

Bu jadvalning ma'nosi: Angular loyihasida "qaysi router olamiz?", "formalar uchun nima?" degan muhokama yo'q. Javob allaqachon bor va hamma loyihada bir xil.

## Nega shunday

Angular aniq bir muammo uchun qurilgan: **katta jamoa, uzoq yashaydigan ilova**.

Tasavvur qiling: 40 dasturchi, 6 jamoa, ilova 8 yil yashaydi, odamlar almashib turadi. Bunday sharoitda eng qimmat narsa — har jamoaning o'z yo'li. Bir jamoa Redux, boshqasi Zustand, uchinchisi o'zi yozgan holat boshqaruvi. Yangi odam har bo'limni alohida o'rganadi.

Angular bu erkinlikni ataylab cheklaydi:

| Angular tanlagan narsa | Evaziga nima beradi |
| --- | --- |
| Qat'iy fayl va nomlash qoidalari | Har loyihada kod bir xil joyda |
| O'rnatilgan DI | Xizmatlarni almashtirish va testlash bir xil usulda |
| TypeScript majburiy | Katta kod bazasida refaktoring xavfsiz |
| Bitta versiya raqami | Paketlar bir-biriga mosligi kafolatlangan |
| `ng update` migratsiyalari | Yangi versiyaga o'tish avtomatlashtirilgan |

Narxi ham bor: **boshlanishi qiyinroq**. Dekoratorlar, DI, injector iyerarxiyasi, RxJS — bular birinchi haftada ortiqcha murakkablik bo'lib ko'rinadi. Ular kichik loyihada o'zini oqlamaydi; katta loyihada esa aynan ular tartibni ushlab turadi.

## Ikki davr: eski va zamonaviy Angular

Angular o'rganishdagi eng katta chalkashlik manbai — **internetdagi materiallarning yarmi boshqa davrga tegishli**.

| Yil | Versiya | Nima o'zgardi |
| --- | --- | --- |
| 2010 | AngularJS 1.x | Birinchi versiya. JavaScript, `$scope`, `ng-controller`. **Bugungi Angular bilan umumiy joyi yo'q** |
| 2016 | Angular 2 | TypeScript'da noldan qayta yozildi. Komponentlar, `NgModule`, RxJS, zone.js |
| 2020 | v9 | Ivy kompilyatori — kichikroq bundle, tezroq build |
| 2022 | v14 | Standalone komponentlar (sinov rejimida) |
| 2023 | v16 | Signallar (sinov rejimida) |
| 2023 | v17 | `@if` / `@for` / `@defer`, yangi sayt angular.dev |
| 2024 | v19 | Standalone sukut bo'yicha — `standalone: true` yozish shart emas |
| 2025 | v20 | Signallar stable, fayl nomlash qoidalari yangilandi |
| 2025 | v21 | Yangi loyihalar zoneless, test uchun Vitest |
| 2026 | v22 | Signal Forms, Angular Aria, `resource` stable |

Shundan ikki davr kelib chiqadi:

| | Eski Angular (2016–2022) | Zamonaviy Angular (2023+) |
| --- | --- | --- |
| Komponent | `NgModule` ichida e'lon qilinadi | Standalone |
| Shart va sikl | `*ngIf`, `*ngFor` | `@if`, `@for` |
| Holat | Oddiy maydon, `BehaviorSubject` | `signal()`, `computed()` |
| Kiritma | `@Input()` dekoratori | `input()` funksiyasi |
| DI | Konstruktor parametri | `inject()` funksiyasi |
| O'zgarishlarni aniqlash | zone.js | Zoneless |
| Fayl nomi | `user-profile.component.ts` | `user-profile.ts` |

Eski usul **hali ishlaydi** — Angular orqaga moslikka jiddiy qaraydi. Lekin yangi kodni zamonaviy usulda yozish kerak. Bu qo'llanma zamonaviy Angular bo'yicha yoziladi, eski ekvivalentini kerak joyda ko'rsatadi.

> **AngularJS ≠ Angular.** Qidiruvda "AngularJS" chiqsa — o'tkazib yuboring. `$scope`, `ng-app`, `angular.module(...)` — bular 2016-yilda tugagan boshqa freymvork.

## Kod: birinchi komponent

Zamonaviy Angular'da hisoblagich:

```ts
import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <p>Bosildi: {{ count() }} marta</p>
    <p>Ikki barobari: {{ doubled() }}</p>
    <button type="button" (click)="increment()">+1</button>
  `,
})
export class Counter {
  protected readonly count = signal(0);
  protected readonly doubled = computed(() => this.count() * 2);

  protected increment() {
    this.count.update((value) => value + 1);
  }
}
```

Qatorma-qator:

| Qism | Nima |
| --- | --- |
| `@Component({...})` | Dekorator — klassni Angular komponentiga aylantiradi |
| `selector: 'app-counter'` | HTML'da qanday ishlatiladi: `<app-counter />` |
| `template` | Komponent ko'rinishi. `{{ }}` — qiymat chiqarish |
| `signal(0)` | O'zgaruvchan qiymat. O'zgarsa — shablon yangilanadi |
| `count()` | Signalni o'qish — **funksiya chaqiruvi** |
| `computed(...)` | Boshqa signallardan hisoblanadigan qiymat |
| `(click)="increment()"` | Hodisaga metod bog'lash |
| `protected readonly` | Shablon uchun ochiq, tashqaridan yopiq, qayta tayinlanmaydi |

Solishtirish uchun — xuddi shu komponent eski usulda:

```ts
// Ilgari (Angular 2–16)
@Component({
  selector: 'app-counter',
  template: `
    <p>Bosildi: {{ count }} marta</p>
    <button (click)="increment()">+1</button>
  `,
})
export class CounterComponent {
  count = 0;

  get doubled() {
    return this.count * 2;
  }

  increment() {
    this.count++;
  }
}

// ... va alohida faylda:
@NgModule({
  declarations: [CounterComponent],
  imports: [BrowserModule],
})
export class AppModule {}
```

Farq faqat sintaksisda emas. Eski usulda Angular **qaysi qiymat o'zgarganini bilmaydi** — zone.js har hodisadan keyin butun daraxtni tekshirardi. Signal bilan esa Angular aniq biladi: `count` o'zgardi, demak faqat undan bog'liq joylar yangilanadi. Bu 16–24-boblarda chuqur ochiladi.

## Muhandislik nuqtai nazari: qachon Angular

| Vaziyat | Angular | Nega |
| --- | --- | --- |
| Katta jamoa, korporativ ilova | ✅ Juda mos | Qat'iy tuzilma, DI, bir xillik |
| Uzoq yashaydigan ichki tizim (CRM, ERP, admin) | ✅ Juda mos | `ng update`, barqarorlik |
| Murakkab formalar ko'p | ✅ Mos | Signal Forms, tipli validatsiya |
| Kontent sayt, blog, landing | ❌ Ortiqcha | Astro, Next.js soddaroq |
| Tez prototip, bir kishi | ⚠️ Mumkin | Boshlanish narxi yuqori |
| Mavjud jamoa React'ni biladi | ⚠️ O'ylab ko'ring | O'rganish vaqti real xarajat |

Ko'p hollarda tanlovni texnologiya emas, **jamoa** hal qiladi: kimni yollay olasiz, kim allaqachon biladi.

## Muhandislik nuqtai nazari: versiyalar siyosati

Angular'ning reliz jadvali oldindan ma'lum:

| Narsa | Qoida |
| --- | --- |
| Major versiya | Har ~6 oyda (odatda may va noyabr) |
| Minor / patch | Har hafta-ikki haftada |
| Faol qo'llab-quvvatlash | 6 oy |
| LTS (faqat xavfsizlik va jiddiy xatolar) | Yana 12 oy — jami 18 oy |
| Eskirgan (deprecated) API | Olib tashlashdan oldin odatda kamida ikki major davomida qoladi |

Amaliy xulosa: **har 6 oyda yangilanib boring**. Bir versiyadan keyingisiga `ng update` deyarli avtomatik o'tkazadi. Uch-to'rt versiya o'tkazib yuborilsa, yangilanish haftalab ishga aylanadi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| AngularJS qo'llanmasini o'qish | Boshqa freymvorkni o'rganasiz | angular.dev va v17+ materiallari |
| 2019-yilgi javobni ko'chirish | `NgModule`, `*ngIf` — ishlaydi, lekin eskirgan | Maqola sanasiga qarang |
| Angular'ni React kabi ishlatish | DI va xizmatlar chetlab o'tiladi, kod tarqoq | Freymvork naqshlariga amal qiling |
| Hammasini RxJS bilan qilish | Oddiy holat uchun ortiqcha murakkablik | Holat — signal, oqim — RxJS (24-bob) |
| Router yoki forma kutubxonasini izlash | Keraksiz bog'liqlik | O'rnatilganini ishlating |
| Versiyalarni o'tkazib yuborish | Yangilanish og'ir bo'ladi | Har 6 oyda `ng update` |

## Amaliyot

1. <https://angular.dev/playground> ni oching va yuqoridagi `Counter` komponentini ishga tushiring.
2. `computed` ni olib tashlab, `doubled` ni oddiy metod qiling. Ishlayaptimi? Nima farq qiladi? (Javob 16-bobda.)
3. Eski va yangi versiyani solishtiring: qaysi birida tushunish uchun kamroq fayl kerak?
4. Terminalda `npm view @angular/core time --json` ni ishga tushiring va major versiyalar sanasini toping — 6 oylik siklni o'zingiz tasdiqlang.
5. Hozirgi yoki kelajakdagi loyihangizni "qachon Angular" jadvali bo'yicha baholang.

## Rasmiy hujjat

- Angular nima: <https://angular.dev/overview>
- Relizlar va qo'llab-quvvatlash: <https://angular.dev/reference/releases>
- Yo'l xaritasi: <https://angular.dev/roadmap>
- Playground: <https://angular.dev/playground>
