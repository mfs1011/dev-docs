# 21 — `httpResource()`

[← Oldingi: resource()](20-resource.md) · [Mundarija](README.md) · [Keyingi: Debounced signallar →](22-debounced-signallar.md)

## Tushuncha

`httpResource` — `resource` ning **HTTP uchun** tayyor shakli. `fetch` yozish, `abortSignal` uzatish, JSON parse qilish shart emas:

```ts
import { httpResource } from '@angular/common/http';

export class UserProfile {
  readonly userId = input.required<number>();

  protected readonly user = httpResource<User>(() => `/api/users/${this.userId()}`);
}
```

Bitta qator — `userId` o'zgarsa qayta yuklanadi, eski so'rov bekor qilinadi, holatlar `resource` bilan bir xil (20-bob).

Angular 22 da `httpResource` **stable**.

## Nega shunday

`resource` + `fetch` — umumiy vosita. Lekin Angular ilovasida HTTP so'rovlari odatda `HttpClient` orqali ketishi kerak, chunki u:

| `HttpClient` beradi | `fetch` da yo'q |
| --- | --- |
| **Interceptorlar** — token, loglash, xatolarni ushlash (56-bob) | Har so'rovda qo'lda |
| XSRF himoyasi | Qo'lda |
| Test vositalari — `HttpTestingController` | Global `fetch` ni mock qilish |
| SSR'da so'rov keshi (transfer cache) | Yo'q |

`httpResource` — `resource` ning qulayligi + `HttpClient` ning imkoniyatlari. Tekshirildi: `withInterceptors([auth])` bilan sozlangan interceptor `httpResource` so'roviga ham `Authorization` sarlavhasini qo'shdi.

## Kod: so'rov shakllari

**URL — GET so'rov:**

```ts
protected readonly user = httpResource<User>(() => `/api/users/${this.userId()}`);
```

**Obyekt — to'liq so'rov:**

```ts
protected readonly results = httpResource<Product[]>(() => ({
  url: '/api/products',
  params: {
    q: this.query(),
    page: this.page(),
    category: this.category(),
  },
  headers: { 'Accept-Language': 'uz' },
}));
```

Tekshirildi: `params: { q: 'kitob', page: 2 }` → `/api/search?q=kitob&page=2`.

| Maydon | Nima |
| --- | --- |
| `url` | Manzil |
| `method` | Sukut `GET` |
| `params` | So'rov parametrlari — obyekt yoki `HttpParams` |
| `headers` | Sarlavhalar |
| `body` | Tana |
| `context` | Interceptorlarga qo'shimcha ma'lumot (56-bob) |
| `withCredentials` | Cookie yuborish (boshqa domen) |
| `reportProgress` | `progress()` signalini yoqish |
| `timeout` | Muddat (ms) |
| `transferCache` | SSR keshi sozlamalari |

**Shartli yuklash** — `undefined` qaytaring:

```ts
protected readonly details = httpResource<Order>(() => {
  const id = this.selectedId();

  return id ? `/api/orders/${id}` : undefined;
});
```

Tekshirildi: `undefined` bo'lganda holat `idle` va **bitta ham so'rov** yuborilmaydi.

## Kod: javob turlari

Sukut bo'yicha — JSON. Boshqa turlar:

```ts
protected readonly readme = httpResource.text(() => `/api/docs/${this.slug()}.md`);
protected readonly avatar = httpResource.blob(() => `/api/users/${this.id()}/avatar`);
protected readonly file = httpResource.arrayBuffer(() => `/api/files/${this.fileId()}`);
```

## Kod: qo'shimcha signallar

`resource` dagilardan tashqari (`value`, `status`, `error`, `isLoading`, `hasValue`, `reload`):

| Signal | Nima |
| --- | --- |
| `headers()` | Javob sarlavhalari |
| `statusCode()` | HTTP status kodi — 200, 404 va h.k. |
| `progress()` | Yuklash progressi (`reportProgress: true` bilan) |

Xato holatida (tekshirildi, 404 javob):

```ts
user.status();        // 'error'
user.statusCode();    // 404
user.error();         // HttpErrorResponse
```

Xatoga qarab turli xabar:

```html
@if (user.error()) {
  @switch (user.statusCode()) {
    @case (404) { <p>Foydalanuvchi topilmadi</p> }
    @case (403) { <p>Ko'rishga ruxsat yo'q</p> }
    @default { <p>Xatolik yuz berdi</p> }
  }
} @else if (user.hasValue()) {
  <app-user-card [user]="user.value()" />
}
```

20-bobdagi qoida o'zgarmaydi: **xato holatida `value()` xato tashlaydi**, avval tekshiring.

## Kod: `parse` — javobni tekshirish

`httpResource<User>` — bu **TypeScript'ga va'da**, tekshiruv emas. Server boshqa shakl qaytarsa, xato ancha keyin, boshqa joyda chiqadi.

`parse` — javobni ish vaqtida tekshirish va o'zgartirish:

```ts
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;

protected readonly user = httpResource(() => `/api/users/${this.userId()}`, {
  parse: (raw) => UserSchema.parse(raw),
});
```

`parse` xato tashlasa — holat `error`, `error()` — o'sha xato. Tekshirildi: son kutilgan maydonga satr kelganda `status: 'error'`, xabar — `parse` tashlagan matn.

`parse` o'zgartirish uchun ham:

```ts
protected readonly orders = httpResource(() => '/api/orders', {
  parse: (raw) => (raw as ApiOrder[]).map(toOrder),     // API shakli → ilova shakli
  defaultValue: [],
});
```

## Kod: `defaultValue`

```ts
protected readonly tags = httpResource<string[]>(() => `/api/posts/${this.id()}/tags`, {
  defaultValue: [],
});
```

Tekshirildi: yuklanayotganda `value()` — `[]`, keyin serverdan kelgani.

## Kod: mutatsiya — `httpResource` emas

`httpResource` **o'qish** uchun. `POST` bilan ham ishlatish mumkin (tekshirildi — so'rov ketadi), lekin bu to'g'ri naqsh emas:

```ts
// ❌ mutatsiya httpResource bilan
protected readonly save = httpResource(() => ({
  url: '/api/orders',
  method: 'POST',
  body: this.draft(),                 // draft har o'zgarganda POST yuboriladi!
}));
```

`draft` signalining har o'zgarishi — yangi `POST`. Foydalanuvchi har harf yozganda buyurtma yaratiladi.

Mutatsiya — `HttpClient` bilan, aniq harakatga javoban:

```ts
private readonly http = inject(HttpClient);

protected async save() {
  await firstValueFrom(this.http.post('/api/orders', this.draft()));

  this.orders.reload();               // ro'yxatni yangilash
}
```

`POST` bilan `httpResource` faqat "qidiruv" kabi **ma'lumot o'zgartirmaydigan** so'rovlar uchun — masalan filtrlar tanada ketadigan murakkab qidiruv.

## Muhandislik nuqtai nazari: API qatlami

Komponentda to'g'ridan-to'g'ri URL yozish — kichik ilovada normal. Katta ilovada URL'lar, tiplar va `parse` bir joyda bo'lsin:

```ts
// orders/order-api.ts
@Service()
export class OrderApi {
  list(filter: () => OrderFilter) {
    return httpResource(() => ({ url: '/api/orders', params: { ...filter() } }), {
      parse: (raw) => OrderListSchema.parse(raw),
      defaultValue: { items: [], total: 0 },
    });
  }

  byId(id: () => number | undefined) {
    return httpResource(() => (id() ? `/api/orders/${id()}` : undefined), {
      parse: (raw) => OrderSchema.parse(raw),
    });
  }
}
```

```ts
// Komponentda
private readonly api = inject(OrderApi);

protected readonly filter = signal<OrderFilter>({ status: 'all', page: 1 });
protected readonly orders = this.api.list(this.filter);
```

Metodlar **signal** (funksiya) qabul qiladi — reaktivlik saqlanadi. `this.api.list(this.filter())` deb qiymatni uzatsangiz — `filter` o'zgarganda qayta yuklanmaydi.

`httpResource` metod ichida chaqirilgani uchun — metod **injection kontekstida** chaqirilishi kerak (maydon initsializatori yoki konstruktor).

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Xato holatida `value()` | Komponent sinadi | Avval `error()` / `hasValue()` |
| `httpResource<User>` ni tekshiruv deb o'ylash | Server boshqa shakl bersa, xato keyin chiqadi | `parse` bilan tekshiring |
| Mutatsiya uchun `httpResource` | Signal har o'zgarganda POST | `HttpClient` + `reload()` |
| API metodiga qiymat uzatish (`filter()`) | Reaktivlik yo'qoladi | Signalni uzating (`filter`) |
| Metodni `ngOnInit` da chaqirish | NG0203 | Maydon initsializatori |
| `fetch` bilan `resource` — interceptor kerak bo'lganda | Token qo'shilmaydi | `httpResource` |
| `statusCode()` ni tekshirmaslik | 404 va 500 bir xil xabar | `@switch (x.statusCode())` |

## Amaliyot

1. `UserProfile` ni `httpResource` bilan qayta yozing — 20-bobdagi `resource` versiyasi bilan qator sonini solishtiring.
2. Qidiruv natijalarini obyekt shaklida yozing: `params: { q, page }`; Network'da URL'ni tekshiring.
3. 404 va 403 uchun turli xabarlarni `statusCode()` bilan chiqaring.
4. `zod` bilan `parse` qo'shing; serverdan noto'g'ri maydon qaytaring va `error` holatini ko'ring.
5. `OrderApi` xizmatini yozing — `list(filter)` signal qabul qilsin.
6. Buyurtma yaratishni `HttpClient.post` bilan, keyin ro'yxatni `reload()` bilan yangilang.

## Rasmiy hujjat

- `httpResource`: <https://angular.dev/guide/http/http-resource>
- API: <https://angular.dev/api/common/http/httpResource>
- `resource`: <https://angular.dev/guide/signals/resource>
