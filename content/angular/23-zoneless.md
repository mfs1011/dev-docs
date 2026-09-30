# 23 — Zoneless o'zgarishlarni aniqlash

[← Oldingi: Debounced signallar](22-debounced-signallar.md) · [Mundarija](README.md) · [Keyingi: RxJS va signallar birga →](24-rxjs-va-signallar.md)

## Tushuncha

**O'zgarishlarni aniqlash** (change detection) — Angular ekranni qachon va qaysi qismini yangilashni hal qiladigan mexanizm.

Angular 21 dan yangi loyihalar **zoneless** — `zone.js` kutubxonasisiz. Rasmiy hujjat: "Zoneless is the default in Angular v21+ so you do not need to do anything to enable it". `ng new` yaratgan `package.json` da `zone.js` umuman yo'q (3-bob).

Bu bob — zoneless nimani o'zgartirdi, ekran qachon yangilanadi, qachon yo'q, va eski loyihani qanday o'tkazish.

## Nega shunday

### Eski usul: zone.js

`zone.js` brauzerning **barcha** asinxron API'larini "yamab" chiqardi: `setTimeout`, `Promise`, `addEventListener`, `fetch`, `XMLHttpRequest`. Har biri tugaganda Angular'ga xabar berardi: "nimadir sodir bo'ldi, tekshir".

```
setTimeout tugadi ──► zone.js ──► "tekshir!" ──► Angular BUTUN daraxtni tekshiradi
```

Qulay edi: oddiy maydonni istalgan joyda o'zgartirsangiz — ekran yangilanardi. Lekin narxi bor edi:

| Muammo | Tafsilot |
| --- | --- |
| Bundle hajmi | zone.js ~30 KB (siqilmagan) |
| Keraksiz tekshiruvlar | Har `setTimeout`, har `mousemove` — butun daraxt |
| Nosozlik tuzatish | Stack trace'lar zone.js ichidan o'tadi |
| Mos kelmaslik | `async/await` ni native'da yamab bo'lmasdi — transpile kerak edi |
| Uchinchi tomon kodi | Boshqa kutubxonaning har taymeri ham Angular'ni qo'zg'atardi |

### Yangi usul: aniq xabarlar

Zoneless'da Angular faqat **aniq sabab** bo'lganda tekshiradi. Rasmiy ro'yxat:

| Sabab | Misol |
| --- | --- |
| Shablonda o'qilgan **signal** o'zgardi | `count.set(5)` |
| Shablon yoki host **hodisa** ishlovchisi | `(click)="save()"` |
| `ChangeDetectorRef.markForCheck()` | `async` quvuri buni o'zi chaqiradi |
| `ComponentRef.setInput()` | Dinamik komponentga kiritma berish |

Boshqa hech narsa — `setTimeout`, `fetch`, `Promise` — o'z-o'zidan tekshiruvga olib kelmaydi.

## Kod: nima yangilanadi, nima yo'q

5-bobda test bilan ko'rsatilgan jadval — zoneless'ning mohiyati:

```ts
export class Lab {
  protected plain = "boshlang'ich";
  protected readonly sig = signal("boshlang'ich");

  protected clickPlain() {
    this.plain = 'bosildi';                          // ✅ yangilanadi — hodisa
  }

  laterPlain() {
    setTimeout(() => (this.plain = 'kechikib'));     // ❌ YANGILANMAYDI
  }

  laterSignal() {
    setTimeout(() => this.sig.set('kechikib'));      // ✅ yangilanadi — signal
  }
}
```

Bu yerdan bitta amaliy qoida: **ekranda ko'rinadigan holat — signal**. Shu qoidaga amal qilsangiz, zoneless haqida o'ylashingiz umuman shart emas.

Oddiy maydon ishlatish mumkin bo'lgan joy — faqat hodisa ishlovchisida o'zgarib, boshqa hech qayerda o'zgarmaydigan qiymat. Lekin keyinchalik kimdir uni `setTimeout` da o'zgartirsa — jim buziladi. Signal xavfsizroq.

## Kod: signalsiz o'zgarishni topish — `exhaustive`

Eski kodni zoneless'ga o'tkazayotganda eng qiyin savol: "qayerda oddiy maydon asinxron o'zgaryapti?". Angular buni dev rejimida o'zi topa oladi:

```ts
// app.config.ts — faqat dev uchun
import { provideCheckNoChangesConfig } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    ...(isDevMode() ? [provideCheckNoChangesConfig({ exhaustive: true, interval: 1000 })] : []),
  ],
};
```

Har soniyada Angular butun daraxtni tekshiradi: xabarsiz o'zgargan binding bormi? Topsa — xato. Angular 22 da test bilan tekshirildi — `setTimeout` ichida oddiy maydon o'zgartirilganda:

```
NG0100: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after
it was checked. Previous value: 'boshlang'ich'...
```

Xato qaysi komponent va qaysi ifoda ekanini ko'rsatadi. Bittalab tuzatib, signalga o'tkazasiz.

Productionda **o'chiring** — har soniyada butun daraxtni tekshirish qimmat.

## Kod: eski loyihani zoneless'ga o'tkazish

Rasmiy qo'llanma bo'yicha qadamlar:

**1. `zone.js` ni polyfill'lardan olib tashlash** — `angular.json` da `build` va `test` uchun:

```json
"polyfills": ["zone.js"]          // ❌ olib tashlang
"polyfills": ["zone.js", "zone.js/testing"]   // test'da ham
```

Yoki `polyfills.ts` bo'lsa, undan:

```ts
import 'zone.js';           // ❌
import 'zone.js/testing';   // ❌
```

**2. Paketni o'chirish:**

```bash
npm uninstall zone.js
```

**3. Angular 20 da** — zoneless'ni yoqish (v21+ da kerak emas):

```ts
bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection()],
});
```

**4. `NgZone` ga tayanadigan kodni almashtirish.** Zoneless'da:

| API | Holati |
| --- | --- |
| `NgZone.onStable`, `onMicrotaskEmpty`, `onUnstable` | **Hech qachon emit qilmaydi** |
| `NgZone.isStable` | Doim `true` |
| `NgZone.run()`, `runOutsideAngular()` | Ta'sirsiz (xato ham bermaydi) |

O'rniga:

```ts
// ❌ ilgari
this.zone.onStable.pipe(first()).subscribe(() => this.measure());

// ✅
afterNextRender(() => this.measure());
```

**5. Signalsiz asinxron o'zgarishlarni tuzatish** — `exhaustive` rejim bilan topib, signalga o'tkazish.

**6. Testlarni yangilash:**

```ts
// ❌ ilgari — qo'lda
fixture.detectChanges();

// ✅ zoneless — production'dagidek
await fixture.whenStable();
```

`ng new` yaratgan testlar allaqachon `await fixture.whenStable()` ishlatadi (3-bob).

**Tartib muhim:** avval ilova signal va OnPush bilan yozilgan bo'lsin, keyin zone.js olib tashlansin. Aks holda "hamma joyda ekran yangilanmayapti" holatiga tushasiz.

## Kod: SSR va `PendingTasks`

Server rendering'da (62-bob) Angular sahifani qachon "tayyor" deb yuborishni bilishi kerak. zone.js buni o'zi kuzatardi. Zoneless'da — `HttpClient` va `resource` o'zlari xabar beradi. O'z asinxron ishingiz bo'lsa:

```ts
import { PendingTasks, inject } from '@angular/core';

export class Dashboard {
  private readonly tasks = inject(PendingTasks);
  protected readonly stats = signal<Stats | null>(null);

  constructor() {
    this.tasks.run(async () => {
      const data = await this.loadStatsSomehow();   // HttpClient bo'lmagan manba
      this.stats.set(data);
    });
  }
}
```

`run` tugamaguncha server sahifani yubormaydi. Observable uchun — `pendingUntilEvent()` operatori (`@angular/core/rxjs-interop`).

## Kod: uchinchi tomon kutubxonalari

Eski kutubxona zone.js'ga tayansa (masalan o'z taymerlarida holatni o'zgartirib, Angular'ning o'zi yangilashini kutsa) — zoneless'da uning UI'i yangilanmasligi mumkin.

| Yechim | Qachon |
| --- | --- |
| Kutubxonaning yangi versiyasi | Ko'p mashhur kutubxonalar zoneless'ni qo'llab-quvvatlaydi |
| Natijani signalga o'rash | Kutubxona callback beradi: `onChange: (v) => this.value.set(v)` |
| `markForCheck()` | Callback'da qo'lda xabar berish |
| `provideZoneChangeDetection()` + zone.js | Oxirgi chora — butun ilova zone rejimiga qaytadi |

## Muhandislik nuqtai nazari: zoneless nimani beradi

| O'lchov | zone.js | Zoneless |
| --- | --- | --- |
| Bundle | +~30 KB (siqilmagan) | 0 |
| Tekshiruv chastotasi | Har asinxron hodisa | Faqat aniq sabab |
| Stack trace | zone.js orqali | Toza |
| `async/await` | Transpile kerak edi | Native |
| O'rganish | "Sehrli" — hammasi o'zi yangilanadi | Signal qoidasini bilish kerak |
| Xato turi | Sekinlik | Ekran yangilanmasligi |

Oxirgi qator — muhim almashinuv. zone.js bilan xato **sekinlik** edi (keraksiz tekshiruvlar). Zoneless bilan xato — **yangilanmaslik** (signal unutilgan). Ikkinchisi darhol ko'rinadi va `exhaustive` rejim bilan topiladi — shuning uchun tuzatish osonroq.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `setTimeout`/`fetch` ichida oddiy maydon | Ekran yangilanmaydi | Signal |
| `NgZone.onStable` ga obuna | Hech qachon ishlamaydi | `afterNextRender` |
| `ngZone.run(() => ...)` bilan "yangilash" | Ta'sirsiz | Signal yoki `markForCheck` |
| Testda `detectChanges()` ga tayanish | Production xulqidan farq qiladi | `await fixture.whenStable()` |
| `exhaustive` ni productionda qoldirish | Har soniyada to'liq tekshiruv | Faqat `isDevMode()` |
| Signal/OnPush'siz eski kodda zone.js ni olib tashlash | Ko'p joyda ekran yangilanmaydi | Avval signallar, keyin zoneless |
| SSR'da o'z asinxron ishini kutmaslik | Server bo'sh sahifa yuboradi | `PendingTasks.run` |
| Yangi loyihaga `zone.js` qo'shish | Keraksiz | Zoneless'da qoling |

## Amaliyot

1. `Lab` komponentini yozing va uchala holatni (tugma, `setTimeout` + oddiy maydon, `setTimeout` + signal) sinang.
2. Dev konfiguratsiyaga `provideCheckNoChangesConfig({ exhaustive: true, interval: 1000 })` qo'shing va `setTimeout` + oddiy maydon holatida konsoldagi NG0100 xatosini o'qing.
3. Xatoni signalga o'tkazib tuzating va xato yo'qolganini tasdiqlang.
4. `NgZone.onStable` ishlatadigan eski kodni `afterNextRender` ga o'tkazing.
5. Loyihangizda `detectChanges()` chaqiradigan testlarni toping va `await fixture.whenStable()` ga o'tkazing.
6. `package.json` da `zone.js` borligini tekshiring. Bo'lsa — yuqoridagi qadamlar bo'yicha rejani yozing.

## Rasmiy hujjat

- Zoneless: <https://angular.dev/guide/zoneless>
- O'zgarishlarni aniqlash: <https://angular.dev/best-practices/runtime-performance>
- `PendingTasks`: <https://angular.dev/api/core/PendingTasks>
- NG0100: <https://angular.dev/errors/NG0100>
