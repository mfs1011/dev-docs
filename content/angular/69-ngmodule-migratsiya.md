# 69 — NgModule'dan standalone'ga migratsiya

[← Oldingi: RxJS chuqur](68-rxjs-chuqur.md) · [Mundarija](README.md) · [Keyingi: DevTools, Language Service, CLI chuqur →](70-devtools-va-cli.md)

## Tushuncha

Angular 14 gacha har komponent `NgModule` ichida e'lon qilinardi. Angular 19 dan standalone — sukut, Angular 22 da NgModule'li komponent uchun **`standalone: false`** ni aniq yozish kerak. Mavjud katta loyihalar esa hali NgModule'larda.

Migratsiya — bir necha avtomatik schematic + qo'lda tozalash:

| Schematic | Nima qiladi |
| --- | --- |
| `standalone-migration` (3 rejim) | Komponentlarni standalone qiladi, modullarni o'chiradi, `bootstrapApplication` ga o'tkazadi |
| `control-flow-migration` | `*ngIf/*ngFor/*ngSwitch` → `@if/@for/@switch` |
| `inject-migration` | Konstruktor DI → `inject()` |
| `signal-input-migration`, `output-migration`, `signal-queries-migration` | `@Input/@Output/@ViewChild` → `input/output/viewChild` |
| `route-lazy-loading-migration` | `component:` → `loadComponent:` |
| `service-migration` | `@Injectable({ providedIn: 'root' })` → `@Service()` |
| `self-closing-tags-migration`, `cleanup-unused-imports` | Kosmetika |

```bash
ng g @angular/core:<nom>
```

## Nega shunday

NgModule'lar — bilvosita bog'lanish: komponent qaysi direktivalarni ko'ra olishi modul ichidagi `imports`/`exports` ga bog'liq. Standalone'da har komponent o'z `imports` ini aniq ko'rsatadi: nimaga bog'liqligi bir faylda ko'rinadi, lazy loading oson, tree-shaking yaxshi, test sozlamasi qisqa.

Yangi Angular xususiyatlari (signal API'lar, `@defer`, incremental hydration) standalone bilan yozilgan hujjatlarga asoslanadi — NgModule'li kodni saqlash tobora qimmatlashadi.

## Kod: real migratsiya — nima bo'ladi

Kichik NgModule ilovada (`AppModule` + `SharedModule` + ikki komponent) uch rejimni ketma-ket ishga tushirdik. Natijalar — haqiqiy, sayqallanmagan:

**1-bosqich: `--mode=convert-to-standalone`**

```bash
ng g @angular/core:standalone-migration --mode=convert-to-standalone --path=./
```

```ts
// badge.component.ts — oldin
@Component({ selector: 'app-badge', standalone: false, template: `<span *ngIf="text">{{ text | uppercase }}</span>` })

// keyin
@Component({
  selector: "app-badge",
  template: `<span *ngIf="text">{{ text | uppercase }}</span>`,
  imports: [NgIf, UpperCasePipe],
})
```

`SharedModule` da `declarations: [BadgeComponent]` → `imports: [CommonModule, BadgeComponent]`. **Bootstrap komponenti (`AppComponent`) o'zgarmadi** — u 3-bosqichda. Build — ✅.

**2-bosqich: `--mode=prune-ng-modules`**

`SharedModule` o'chirildi va `AppModule.imports` dan olib tashlandi. Lekin `AppComponent` hali `AppModule.declarations` da va `<app-badge>` ishlatadi — build **buzildi**:

```
NG8001: 'app-badge' is not a known element
NG8002: Can't bind to 'text' since it isn't a known property of 'app-badge'.
```

**3-bosqich: `--mode=standalone-bootstrap`**

```ts
// main.ts — keyin
bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(BrowserModule, FormsModule)],
});
```

`AppModule` o'chirildi, `AppComponent` standalone bo'ldi — `imports: [FormsModule]`, lekin `BadgeComponent` **yo'q**. Build hali ham buzuq. Qo'lda tuzatish:

```ts
@Component({
  selector: 'app-root',
  imports: [FormsModule, BadgeComponent],     // qo'shildi
  template: `...`,
})
```

```ts
bootstrapApplication(AppComponent, {
  providers: [],                               // BrowserModule, FormsModule — keraksiz
});
```

Build — ✅. Oxirida `control-flow-migration`:

```ts
template: `@if (text) {
  <span>{{ text | uppercase }}</span>
}`,
imports: [UpperCasePipe],       // NgIf o'zi olib tashlandi
```

Schematic o'zi ogohlantiradi: *"IMPORTANT! Please verify manually that your application builds and behaves as expected."* Bu rasmiyatchilik emas — yuqoridagi tajribada ikki bosqichdan keyin build buzildi.

## Kod: tavsiya etilgan reja

```
0. Toza git holati, testlar yashil, e2e smoke testlar bor
1. ng update — eng so'nggi Angular'ga (migratsiyalar shu versiyada to'g'ri)
2. convert-to-standalone  → build + test → commit
3. prune-ng-modules       → build → qo'lda tuzatish (NG8001) → test → commit
4. standalone-bootstrap   → build → qo'lda tuzatish → test → commit
5. importProvidersFrom(...) ni provide*() funksiyalariga almashtirish:
     HttpClientModule        → provideHttpClient()
     RouterModule.forRoot()  → provideRouter(routes)
     BrowserAnimationsModule → (kerak bo'lsa) animate.enter/leave (30-bob)
6. control-flow-migration → commit
7. route-lazy-loading-migration → bundle tahlili (70-bob) → commit
8. inject / signal-input / output / signal-queries migratsiyalari → commit
```

Katta loyihada — **qism-qism**: `--path=src/app/orders` bilan bitta feature, keyin keyingisi. Har commit — kichik, qaytarib bo'ladigan.

## Kod: qo'lda qoladigan ishlar

| Holat | Nima qilish |
| --- | --- |
| `forRoot()`/`forChild()` bilan sozlanadigan modullar | `provide*()` funksiyasiga (kutubxona hujjati) |
| Modul `providers` dagi xizmatlar | `@Service()` yoki marshrut `providers` (37-bob) |
| `entryComponents`, `CUSTOM_ELEMENTS_SCHEMA` | Qayta ko'rib chiqish |
| Uchinchi tomon kutubxona faqat NgModule beradi | `imports: [TheirModule]` — standalone komponentda ham ishlaydi |
| `SharedModule` 40 ta narsani eksport qilgan | Har komponentga faqat kerakligini (schematic buni qiladi, lekin tekshiring) |

NgModule'ni standalone komponentning `imports` iga qo'yish **mumkin** — shuning uchun kutubxonalar kutib turishi migratsiyani to'xtatmaydi.

## Kod: testlarni moslashtirish

```ts
// oldin
TestBed.configureTestingModule({ declarations: [BadgeComponent], imports: [CommonModule] });

// keyin
TestBed.configureTestingModule({ imports: [BadgeComponent] });
```

`router-testing-module-migration` — `RouterTestingModule` → `provideRouter([])` / `RouterTestingHarness`.

## Muhandislik nuqtai nazari

**Migratsiya — refaktor, feature emas.** Biznes o'zgarishlar bilan aralashtirmang: bitta PR — faqat migratsiya. Code review'da diff mexanik bo'lsin.

**Qiymatni o'lchang:** migratsiyadan oldin va keyin `ng build` hajmi va boshlang'ich chunk. Lazy loading'ga o'tish (7-qadam) odatda eng katta foyda beradi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Uch rejimni ketma-ket, orasida build'siz | Qaysi bosqich buzganini bilmaysiz | Har bosqichdan keyin build + test + commit |
| Schematic natijasiga to'liq ishonish | NG8001, keraksiz importlar | Qo'lda tekshirish |
| `importProvidersFrom(BrowserModule, ...)` qoldirish | Keraksiz, chalkash | Olib tashlash, `provide*()` |
| Butun loyihani bitta PR'da | Review qilib bo'lmaydi | `--path` bilan feature-feature |
| Eski Angular versiyasida migratsiya | Schematic'lar eskiroq, xatoliroq | Avval `ng update` |
| Migratsiya + yangi feature bir PR'da | Xatoni topish qiyin | Alohida PR |

## Amaliyot

1. Kichik NgModule ilova yarating (yoki mavjudini oling) — git'da toza holat.
2. Uch rejimni birma-bir ishga tushiring, har biridan keyin `ng build` — qaysi bosqichda xato chiqishini kuzating.
3. NG8001 ni qo'lda tuzating.
4. `importProvidersFrom` ni `provide*()` ga almashtiring.
5. `control-flow-migration` va `inject-migration` ni ishga tushirib, diffni o'qing.
6. Oldin/keyin bundle hajmini solishtiring.

## Rasmiy hujjat

- Standalone migratsiyasi: <https://angular.dev/reference/migrations/standalone>
- Barcha migratsiyalar: <https://angular.dev/reference/migrations>
- `ng update`: <https://angular.dev/update-guide>
