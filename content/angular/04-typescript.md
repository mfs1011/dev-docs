# 04 — Angular uchun TypeScript

[← Oldingi: Loyiha tuzilmasi va bootstrap](03-loyiha-tuzilmasi.md) · [Mundarija](README.md) · [Keyingi: Komponent anatomiyasi →](05-komponent-anatomiyasi.md)

## Tushuncha

Angular'da TypeScript ixtiyoriy emas — freymvork unga qurilgan. Bu bob TypeScript'ni noldan o'rgatmaydi (buning uchun <https://www.typescriptlang.org/docs/>), balki **Angular'da boshqacha ishlaydigan** joylarni ko'rsatadi:

1. Dekoratorlar — `@Component`, `@Service`, `@Pipe`
2. Qat'iy rejim — kod va **shablon** ikkalasi ham tip tekshiriladi
3. Kirish modifikatorlari — `protected`, `readonly` qachon va nega
4. Shablondagi tiplar — null, toraytirish, `$any()`

Angular 22 **TypeScript 6.0** bilan ishlaydi (`~6.0.2`). npm'dagi 7.0 hali qo'llab-quvvatlanmaydi.

## Nega shunday

Angular kompilyatori shablonni oddiy matn deb emas, **TypeScript kodi** deb tekshiradi. Shablonda `{{ user.name }}` yozsangiz, kompilyator `user` ning tipini biladi va `name` maydoni borligini tekshiradi.

Natija: ko'p xatolar **brauzerda emas, build vaqtida** chiqadi. React yoki Vue'da shablon xatolari ko'pincha ish vaqtida `undefined` bo'lib chiqadi; Angular'da ular kompilyatsiyani to'xtatadi.

## Kod: dekoratorlar

Dekorator — klassga metama'lumot biriktiradigan funksiya. Angular klassning **nima ekanini** shu orqali biladi:

```ts
@Component({ selector: 'app-user-card', template: '...' })
export class UserCard {}

@Service()
export class UserApi {}

@Pipe({ name: 'shortDate' })
export class ShortDatePipe {}

@Directive({ selector: '[appHighlight]' })
export class Highlight {}
```

Dekoratorsiz `UserCard` — oddiy klass. `@Component` uni Angular komponentiga aylantiradi: selektor, shablon, stillar biriktiriladi.

`tsconfig.json` dagi `"experimentalDecorators": true` — Angular TypeScript'ning **eski** dekorator tizimidan foydalanadi, JavaScript standartidagi yangisidan emas. Shuning uchun bu bayroqni o'chirmang.

> **Dekoratorlar kamaymoqda.** Zamonaviy Angular'da maydon dekoratorlari (`@Input()`, `@Output()`, `@ViewChild()`) o'rnini funksiyalar egalladi: `input()`, `output()`, `viewChild()`. Klass dekoratorlari (`@Component`) esa qoladi.

## Kod: qat'iy rejim

TypeScript 6.0 dan `strict: true` **sukut bo'yicha**. Shuning uchun `tsconfig.json` da ko'rinmaydi, lekin ishlaydi. U quyidagilarni yoqadi:

| Tekshiruv | Nimani to'xtatadi |
| --- | --- |
| `strictNullChecks` | `null` bo'lishi mumkin qiymatni tekshirmasdan ishlatish |
| `noImplicitAny` | Tipi aniqlanmagan parametr |
| `strictPropertyInitialization` | Konstruktorda qiymat berilmagan maydon |
| `strictFunctionTypes` | Mos kelmaydigan funksiya tiplari |

Angular yana o'z bayroqlarini qo'shadi (`ng new` yaratganlari):

| Bayroq | Nima qiladi |
| --- | --- |
| `noImplicitOverride` | Ota klass metodini qayta yozganda `override` so'zi majburiy |
| `noPropertyAccessFromIndexSignature` | Indeks tipida `obj.key` emas, `obj['key']` |
| `noImplicitReturns` | Funksiyaning hamma yo'li qiymat qaytarsin |
| `noFallthroughCasesInSwitch` | `case` da `break` unutilmasin |

`noPropertyAccessFromIndexSignature` birinchi kunda to'qnash keladi:

```ts
const params: Record<string, string> = { id: '42' };

params.id;       // ❌ TS4111: Property 'id' comes from an index signature
params['id'];    // ✅
```

Ma'nosi: "bu kalit bo'lmasligi mumkin" — kod o'qiyotgan odamga ko'rinib tursin.

## Kod: shablon tip tekshiruvi

Angular kompilyatorida `strictTemplates` sukut bo'yicha yoqilgan. Shablon xatolari build'ni to'xtatadi. Quyidagi xatolar haqiqiy Angular 22 loyihasida olingan:

```ts
@Component({
  selector: 'app-badge',
  template: `<span>{{ label() }}: {{ count() }}</span>`,
})
export class Badge {
  readonly label = input.required<string>();
  readonly count = input(0);
}
```

```html
<!-- Boshqa komponent shablonida -->
<app-badge [label]="42" [count]="'ko\'p'" />
```

```
✘ [ERROR] TS2322: Type 'number' is not assignable to type 'string'.
✘ [ERROR] TS2322: Type 'string' is not assignable to type 'number'.
```

Null tekshiruvi ham shablonda ishlaydi:

```ts
protected readonly user = signal<{ name: string } | null>(null);
```

```html
<p>{{ user().name }}</p>
```

```
✘ [ERROR] TS2531: Object is possibly 'null'.
```

Tuzatish — shablonda toraytirish:

```html
@if (user(); as u) {
  <p>{{ u.name }}</p>
}
```

`@if` ichida `u` — `{ name: string }`, `null` emas. Kompilyator buni tushunadi. Yoki qisqa yo'l:

```html
<p>{{ user()?.name }}</p>
```

Noma'lum element:

```html
<app-unknown />
```

```
✘ [ERROR] NG8001: 'app-unknown' is not a known element
```

Sabab deyarli har doim bitta: komponent `imports` ga qo'shilmagan (3-bob).

## Kod: signal chaqirilmasa

Signalni qavssiz yozish xato emas, lekin kompilyator **ogohlantiradi**:

```html
<p>{{ title }}</p>
```

```
▲ [WARNING] NG8109: title is a function and should be invoked: title()
```

Bu — "kengaytirilgan diagnostika" (extended diagnostics). Ular xato emas, lekin deyarli har doim xato kodni ko'rsatadi. Ogohlantirishlarni e'tiborsiz qoldirmang.

Yana biri — ishlatilmagan import:

```
▲ [WARNING] NG8113: RouterOutlet is not used within the template of App
```

## Kod: kirish modifikatorlari

Rasmiy uslub qo'llanmasi aniq qoida beradi:

```ts
@Component({ ... })
export class OrderList {
  // Angular boshqaradigan narsalar — readonly
  readonly orders = input.required<Order[]>();
  readonly selected = output<Order>();

  // Shablon ishlatadigan narsalar — protected
  protected readonly filter = signal('');
  protected readonly visible = computed(() =>
    this.orders().filter((o) => o.title.includes(this.filter())),
  );

  // Faqat klass ichida — private
  private readonly api = inject(OrderApi);

  protected select(order: Order) {
    this.selected.emit(order);
  }
}
```

| Modifikator | Qachon | Nega |
| --- | --- | --- |
| `readonly` | `input`, `output`, `model`, `viewChild` va boshqalar | Angular ularni o'zi yaratadi, qayta tayinlash — xato |
| `protected` | Shablon o'qiydigan maydon va metodlar | Shablon uchun ochiq, tashqi kod uchun yopiq |
| `private` | Faqat klass ichidagi narsalar | Shablon ham, tashqi kod ham ishlatmaydi |
| `public` (yozilmaydi) | Boshqa klass chaqiradigan API | Kamdan-kam kerak |

Diqqat: kompilyator shablondan `private` maydonga murojaatni **to'xtatmaydi** — tekshirib ko'rdik, Angular 22 da build o'tadi. `protected` — texnik talab emas, **niyatni bildirish**: "bu shablon uchun". `private` esa "bu faqat klass ichida" degani bo'lib qolsin.

## Kod: tiplar va modellar

Ma'lumot shakli uchun `interface` yoki `type`:

```ts
// order.ts
export interface Order {
  id: number;
  number: string;
  total: number;
  status: OrderStatus;
  createdAt: string;         // API'dan satr keladi
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';
```

| | `interface` | `type` |
| --- | --- | --- |
| Obyekt shakli | ✅ | ✅ |
| Birlashma (`'a' \| 'b'`) | ❌ | ✅ |
| Kengaytirish | `extends` | `&` |
| Amaliy tavsiya | Obyektlar uchun | Birlashma va yordamchi tiplar uchun |

Signal va xizmatlarda generik:

```ts
protected readonly user = signal<User | null>(null);
protected readonly tags = signal<string[]>([]);
```

Boshlang'ich qiymat `null` yoki bo'sh massiv bo'lsa, tipni aniq yozing — aks holda TypeScript uni `null` yoki `never[]` deb qaror qiladi.

`satisfies` — konfiguratsiya obyektlari uchun:

```ts
const statusLabels = {
  pending: 'Kutilmoqda',
  paid: "To'langan",
  shipped: "Jo'natildi",
  cancelled: 'Bekor qilindi',
} satisfies Record<OrderStatus, string>;
```

Bitta holat unutilsa — kompilyator xato beradi. Yangi `OrderStatus` qo'shilsa — shu obyektni to'ldirish esdan chiqmaydi.

## Kod: `$any()` — qochish yo'li

Shablonda tip tekshiruvini o'chirish:

```html
<p>{{ $any(item).legacyField }}</p>
```

Bu — oxirgi chora. Ko'p hollarda to'g'ri yechim tipni tuzatish. `$any()` ko'p ishlatilgan loyiha — tipsiz loyiha.

## Muhandislik nuqtai nazari: tiplar qayerdan keladi

Backend bilan ishlaganda tiplarni qo'lda yozish xato manbai: backend maydonni o'zgartiradi, frontend tipi eskiradi, xato faqat ish vaqtida chiqadi.

| Yondashuv | Afzalligi | Kamchiligi |
| --- | --- | --- |
| Qo'lda `interface` | Tez boshlanadi | Backend bilan sinxron emas |
| OpenAPI'dan generatsiya | Doim sinxron | Sozlash kerak |
| Umumiy paket (monorepo) | Bitta manba | Backend ham TS bo'lsa |

Backend OpenAPI sxemasi bersa (Symfony, Laravel, NestJS beradi):

```bash
npx openapi-typescript https://api.example.com/openapi.json -o src/app/api-types.ts
```

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `experimentalDecorators` ni o'chirish | Angular kompilyatsiya bo'lmaydi | Qoldiring |
| `strict: false` qo'yish | Shablon va kod xatolari ish vaqtiga ko'chadi | Qat'iy rejimda qoling |
| `signal(null)` tipsiz | Tip `null` bo'lib qoladi | `signal<User \| null>(null)` |
| Shablonda `user().name` (null bo'lishi mumkin) | TS2531 | `@if (user(); as u)` yoki `?.` |
| NG8109 ogohlantirishini e'tiborsiz qoldirish | Ekranda funksiya matni | `title()` |
| Hamma joyda `$any()` | Tip xavfsizligi yo'qoladi | Tipni tuzating |
| `obj.key` indeks tipida | TS4111 | `obj['key']` |
| Shablon uchun `private` | Ishlaydi, lekin niyat noaniq | `protected` |

## Amaliyot

1. `Badge` komponentini yozing va unga noto'g'ri tipli qiymat bering — xato matnini o'qing.
2. `signal<User | null>(null)` yarating va shablonda `user().name` yozing — TS2531 ni ko'ring, keyin `@if ... as` bilan tuzating.
3. Shablonda signalni qavssiz yozing va NG8109 ogohlantirishini toping.
4. `Record<string, string>` ga nuqta bilan murojaat qiling — TS4111 ni ko'ring.
5. `satisfies Record<OrderStatus, string>` bilan obyekt yozing va bitta holatni o'chiring — xatoni ko'ring.
6. Komponent maydonlarini uslub qo'llanmasi bo'yicha `readonly`/`protected`/`private` ga ajrating.

## Rasmiy hujjat

- Shablon tip tekshiruvi: <https://angular.dev/tools/cli/template-typecheck>
- Kompilyator sozlamalari: <https://angular.dev/reference/configs/angular-compiler-options>
- Kengaytirilgan diagnostika: <https://angular.dev/extended-diagnostics>
- Uslub qo'llanmasi: <https://angular.dev/style-guide>
- TypeScript 6.0: <https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html>
