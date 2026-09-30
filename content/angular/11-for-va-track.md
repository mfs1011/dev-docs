# 11 — `@for` va `track`

[← Oldingi: Boshqaruv oqimi: @if va @switch](10-if-va-switch.md) · [Mundarija](README.md) · [Keyingi: @defer →](12-defer.md)

## Tushuncha

Ro'yxatni chiqarish:

```html
<ul>
  @for (order of orders(); track order.id) {
    <li>{{ order.number }} — {{ order.total }} so'm</li>
  } @empty {
    <li>Buyurtmalar yo'q</li>
  }
</ul>
```

Uchta qism: **nimani aylanamiz** (`order of orders()`), **qanday taniymiz** (`track order.id`), va **bo'sh bo'lsa nima** (`@empty`).

## Nega shunday: `track` nima uchun majburiy

Ro'yxat o'zgarganda Angular DOM'ni yangilashi kerak. Ikki yo'l bor:

1. Hammasini o'chirib, qaytadan chizish — sekin, fokus va animatsiya yo'qoladi.
2. Qaysi element qaysi ma'lumotga tegishli ekanini bilib, faqat o'zgarganlarini yangilash — tez.

Ikkinchisi uchun Angular har elementni **tanib olishi** kerak. `track` — shu tanish kaliti:

```
Oldin:   [A:1] [B:2] [C:3]
Keyin:   [A:1] [C:3]           ← B o'chirildi

track id bilan:   A va C DOM elementlari qoladi, faqat B o'chiriladi
track siz:        hamma qaytadan chiziladi
```

Shuning uchun `track` **majburiy** — yozilmasa, build to'xtaydi (Angular 22 da tekshirildi):

```html
@for (item of items()) {
  <p>{{ item.name }}</p>
}
```

```
✘ [ERROR] NG5002: @for loop must have a "track" expression
```

> **Ilgari:** `*ngFor` da `trackBy` ixtiyoriy edi va ko'pincha unutilardi — natijada katta ro'yxatlar sekin ishlardi. Yangi sintaksis bu xatoni imkonsiz qiladi.

## Kod: nimani `track` qilish

| Ma'lumot | `track` | Nega |
| --- | --- | --- |
| Serverdan kelgan obyektlar | `track item.id` | Barqaror, noyob |
| Noyob satrlar ro'yxati | `track tag` | Qiymatning o'zi — kalit |
| O'zgarmaydigan statik ro'yxat | `track $index` | Tartib o'zgarmaydi |
| Tartibi o'zgaradigan ro'yxat | **`$index` EMAS** | Pastga qarang |

`track $index` ning xavfi — ro'yxat o'rtasidan element o'chirilsa yoki tartib o'zgarsa, Angular elementlarni **noto'g'ri** bog'laydi:

```html
<!-- ❌ tartiblanadigan ro'yxatda -->
@for (task of tasks(); track $index) {
  <li>
    <input type="checkbox">
    {{ task.title }}
  </li>
}
```

Birinchi vazifani belgilab, ro'yxatni tartiblasangiz — belgi **birinchi qatorda qoladi**, garchi u endi boshqa vazifa bo'lsa ham. DOM elementi indeksga bog'langan, ma'lumotga emas.

```html
<!-- ✅ -->
@for (task of tasks(); track task.id) { ... }
```

Qoida: **ID bo'lsa — ID**. `$index` faqat hech qachon o'zgarmaydigan ro'yxat uchun.

## Kod: kontekst o'zgaruvchilari

`@for` ichida Angular bir nechta o'zgaruvchi beradi:

| O'zgaruvchi | Qiymat |
| --- | --- |
| `$index` | Joriy indeks (0 dan) |
| `$count` | Jami elementlar soni |
| `$first` | Birinchimi |
| `$last` | Oxirgimi |
| `$even` | Juft indeksmi |
| `$odd` | Toq indeksmi |

To'g'ridan-to'g'ri ishlatish:

```html
@for (item of items(); track item.id) {
  <li [class.striped]="$odd">
    {{ $index + 1 }}/{{ $count }}. {{ item.name }}
    @if (!$last) { <hr> }
  </li>
}
```

Nom berish — ichma-ich `@for` da qaysi `$index` ekanini aniq qilish uchun:

```html
@for (group of groups(); track group.id; let gi = $index) {
  <h3>{{ gi + 1 }}. {{ group.title }}</h3>

  @for (item of group.items; track item.id; let ii = $index, last = $last) {
    <p [class.last]="last">{{ gi + 1 }}.{{ ii + 1 }} {{ item.name }}</p>
  }
}
```

## Kod: `@empty`

```html
@for (result of results(); track result.id) {
  <app-result-card [result]="result" />
} @empty {
  <div class="empty-state">
    <p>Hech narsa topilmadi</p>
    <button type="button" (click)="clearFilters()">Filtrlarni tozalash</button>
  </div>
}
```

`@empty` bo'lmasa, ro'yxat bo'sh bo'lganda ekranda hech narsa chiqmaydi — foydalanuvchi "yuklanmoqdami yoki bo'shmi?" deb o'ylaydi.

Diqqat: `@empty` faqat **bo'sh massiv** uchun. "Yuklanmoqda" va "xato" holatlari alohida — `resource` bilan (20-bob):

```html
@if (orders.isLoading()) {
  <app-skeleton />
} @else if (orders.error()) {
  <app-error [error]="orders.error()" />
} @else {
  @for (order of orders.value(); track order.id) {
    <app-order-row [order]="order" />
  } @empty {
    <p>Buyurtmalar yo'q</p>
  }
}
```

## Kod: ro'yxat bilan ishlash — signallarni to'g'ri yangilash

`@for` signal massivni o'qiydi. Massivni **o'zgartirish** emas, **almashtirish** kerak:

```ts
protected readonly todos = signal<Todo[]>([]);
protected readonly count = computed(() => this.todos().length);

// ❌ mutatsiya — signal o'zgarganini bilmaydi
protected addWrong(title: string) {
  this.todos().push({ id: Date.now(), title, done: false });
}

// ✅ yangi massiv
protected add(title: string) {
  this.todos.update((list) => [...list, { id: Date.now(), title, done: false }]);
}

protected remove(id: number) {
  this.todos.update((list) => list.filter((t) => t.id !== id));
}

protected toggle(id: number) {
  this.todos.update((list) =>
    list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  );
}
```

Signal qiymat **yangi obyekt** bo'lgandagina o'zgarganini biladi (16-bob). `push`, `splice`, `sort` — eski massivni o'zgartiradi, signal esa o'sha massivni ko'rsatib turaveradi.

Mutatsiyaning oqibati "ekran yangilanmaydi" dan ham yomonroq. Angular 22 da test bilan tekshirildi:

| `addWrong` qayerdan chaqirildi | `@for` ro'yxati | `count()` |
| --- | --- | --- |
| `(click)` ishlovchisidan | **Yangilandi** — 2 ta element | **Eskirgan** — "1" |
| `setTimeout` ichidan | Yangilanmadi | Yangilanmadi |

Birinchi qator — eng xavflisi: hodisa komponentni qayta tekshirishga majbur qiladi, `@for` o'zgargan massivni ko'radi va yangi elementni chizadi. Lekin `computed` signal o'zgarmagani uchun **qayta hisoblanmaydi**. Natija — ekran o'ziga zid: ro'yxatda 2 ta vazifa, sarlavhada "1 ta vazifa". Bunday xato ishlab chiqishda sezilmaydi (ko'rinishidan ishlayapti) va keyin qidirish qiyin bo'ladi.

Qoida istisnosiz: **signal ichidagi massiv va obyektni o'zgartirmang, almashtiring**.

## Kod: eski koddan ko'chirish

```bash
ng generate @angular/core:control-flow-migration
```

Haqiqiy natija:

```html
<!-- Oldin -->
<li *ngFor="let item of items; trackBy: byId">{{ item.name }}</li>

<!-- Keyin -->
@for (item of items; track byId($index, item)) {
  <li>{{ item.name }}</li>
}
```

Migratsiya eski `trackBy` funksiyasini saqlab qoladi. Keyin qo'lda soddalashtirish mumkin: `track item.id` va `byId` metodini o'chirish.

| Eski | Yangi |
| --- | --- |
| `*ngFor="let x of list"` | `@for (x of list; track ...)` |
| `trackBy: fn` | `track x.id` |
| `let i = index` | `let i = $index` yoki shunchaki `$index` |
| `*ngIf="list.length === 0"` alohida | `@empty` |

## Muhandislik nuqtai nazari: katta ro'yxatlar

`@for` 10 000 elementni ham chiqaradi, lekin brauzer 10 000 DOM tugunini chizishi sekin. Belgilar va yechimlar:

| Belgi | Yechim |
| --- | --- |
| 100–500 element, sahifa sekin | `track` to'g'rimi? Har element og'ir komponentmi? |
| 1 000+ element | Sahifalash (server tomonida) |
| Cheksiz scroll | Virtual scroll — CDK `cdk-virtual-scroll-viewport` (66-bob) |
| Ro'yxat pastda, darhol kerak emas | `@defer (on viewport)` (12-bob) |

Ko'p holatda to'g'ri javob — **serverdan kamroq olish**. Foydalanuvchi baribir 5 000 qatorni o'qimaydi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `track` yo'q | NG5002 | `track item.id` |
| Tartiblanadigan ro'yxatda `track $index` | Belgilar va fokus noto'g'ri qatorda | `track item.id` |
| `track item` (obyektning o'zi) | Serverdan qayta yuklanganda hamma obyekt yangi — hammasi qayta chiziladi | Barqaror maydon (`id`) |
| `todos().push(...)` | Ekran o'ziga zid: ro'yxat yangi, `computed` eski | `todos.update(l => [...l, x])` |
| `@empty` yo'q | Bo'sh ro'yxatda bo'sh ekran | `@empty { }` |
| `@empty` ni "yuklanmoqda" uchun | Yuklanayotganda "yo'q" deb ko'rsatadi | Alohida holat (20-bob) |
| Ichma-ich `@for` da nomsiz `$index` | Qaysi indeks ekani chalkash | `let gi = $index` |

## Amaliyot

1. Vazifalar ro'yxatini yozing: qo'shish, o'chirish, belgilash — hammasi `update` bilan, `track task.id`.
2. `track $index` ga o'zgartiring, bir nechta vazifani belgilang, keyin ro'yxatni teskari tartiblang — muammoni ko'ring. `track task.id` ga qaytaring.
3. `count = computed(() => todos().length)` qo'shing va tugma ichida `todos().push()` qiling — ro'yxat va hisoblagich bir-biriga zid bo'lishini ko'ring.
4. `$index`, `$count`, `$first`, `$last`, `$odd` ni bitta ro'yxatda ishlating.
5. Guruhlangan ro'yxat (kategoriya → mahsulotlar) uchun ichma-ich `@for` yozing, indekslarni nomlang.
6. `@empty` bilan "hech narsa topilmadi" holatini "filtrlarni tozalash" tugmasi bilan qiling.

## Rasmiy hujjat

- `@for`: <https://angular.dev/guide/templates/control-flow#repeat-content-with-the-for-block>
- `track` tanlash: <https://angular.dev/guide/templates/control-flow#why-is-track-in-for-blocks-important>
- Migratsiya: <https://angular.dev/reference/migrations/control-flow>
