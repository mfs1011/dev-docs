# 20 — `resource()` — asinxron holat

[← Oldingi: Reaktiv kontekst qoidalari](19-reaktiv-kontekst.md) · [Mundarija](README.md) · [Keyingi: httpResource() →](21-http-resource.md)

## Tushuncha

`resource` — **asinxron ma'lumotni signal sifatida** ifodalash: yuklanmoqdami, tayyormi, xatomi — hammasi signal.

```ts
import { resource, signal } from '@angular/core';

export class UserProfile {
  readonly userId = input.required<number>();

  protected readonly user = resource({
    params: () => this.userId(),
    loader: async ({ params: id, abortSignal }) => {
      const response = await fetch(`/api/users/${id}`, { signal: abortSignal });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return (await response.json()) as User;
    },
  });
}
```

```html
@if (user.isLoading()) {
  <app-skeleton />
} @else if (user.error()) {
  <p role="alert">Yuklab bo'lmadi</p>
} @else if (user.hasValue()) {
  <h2>{{ user.value().name }}</h2>
}
```

`userId` o'zgarsa — `resource` o'zi qayta yuklaydi, eski so'rovni bekor qiladi.

Angular 22 da `resource` **stable**.

## Nega shunday

`resource` dan oldin har komponentda shu kod yozilardi:

```ts
// ❌ Qo'lda
protected readonly user = signal<User | null>(null);
protected readonly loading = signal(false);
protected readonly error = signal<string | null>(null);

constructor() {
  effect(() => {
    const id = this.userId();

    this.loading.set(true);
    this.error.set(null);

    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((u) => this.user.set(u))
      .catch((e) => this.error.set(e.message))
      .finally(() => this.loading.set(false));
  });
}
```

Muammolar:

| Muammo | Oqibat |
| --- | --- |
| **Poyga holati** — ID tez o'zgarsa, eski javob keyinroq kelishi mumkin | Ekranda boshqa foydalanuvchi |
| Bekor qilish yo'q | Keraksiz so'rovlar davom etadi |
| Uchta signal qo'lda sinxronlanadi | Biri unutiladi — `loading` abadiy `true` |
| Effect ichida `set` | 17-bobdagi yomon naqsh |

`resource` bularning hammasini o'zi hal qiladi.

## Kod: tuzilishi

```ts
resource({
  params: () => ...,                 // qaysi so'rov — reaktiv
  loader: async ({ params, abortSignal, previous }) => ...,   // qanday yuklash
  defaultValue: ...,                 // yuklanguncha qaytadigan qiymat
  equal: ...,                        // natijani solishtirish
  injector: ...,                     // injection kontekstidan tashqarida
  id: 'user-profile',                // SSR keshi uchun (65-bob)
})
```

| Qism | Nima |
| --- | --- |
| `params` | Signallarni o'qiydigan funksiya. Natijasi o'zgarsa — qayta yuklanadi |
| `loader` | `params` ni oladi, `Promise` qaytaradi. **Reaktiv emas** — ichida signal o'qilmaydi |
| `abortSignal` | Yangi so'rov boshlanganda yoki komponent yo'q qilinganda bekor bo'ladi |
| `previous.status` | Oldingi holat (masalan `reloading` bo'lsa boshqacha ishlash uchun) |

Asosiy g'oya: **`params` — nima kerak** (sinxron, reaktiv), **`loader` — qanday olish** (asinxron). 19-bobdagi "`await` dan keyingi o'qish kuzatilmaydi" muammosi shu ajratish bilan yo'qoladi.

## Kod: holatlar

`resource.status()` oltita qiymatdan birini oladi. Haqiqiy ketma-ketlik (Angular 22 da test bilan olingan):

```
loading → resolved → (params o'zgardi) loading → resolved
       → reload() reloading → set() local → params undefined → idle → error
```

| Holat | Qachon | `value()` |
| --- | --- | --- |
| `idle` | `params` `undefined` qaytardi — so'rov kerak emas | `defaultValue` yoki `undefined` |
| `loading` | Yangi `params` bilan yuklanmoqda | `defaultValue` yoki `undefined` |
| `reloading` | `reload()` — o'sha `params` bilan qayta | Oldingi qiymat saqlanadi |
| `resolved` | Muvaffaqiyatli yuklandi | Natija |
| `local` | Qo'lda `set()` yoki `update()` qilindi | Qo'lda qiymat |
| `error` | `loader` xato tashladi | **Xato tashlaydi!** |

Yordamchi signallar:

| Signal | Qachon `true` |
| --- | --- |
| `isLoading()` | `loading` yoki `reloading` |
| `hasValue()` | Foydalanish mumkin bo'lgan qiymat bor |
| `error()` | Xato obyekti yoki `undefined` |

## Kod: eng xavfli tuzoq — xato holatida `value()`

Xato holatida `value()` ni o'qish **xato tashlaydi** — tekshirildi:

```
Resource is currently in an error state (see Error.cause for details)
```

Shablonda:

```html
<!-- ❌ loader yiqilsa — butun komponent sinadi -->
<h2>{{ user.value()?.name }}</h2>
```

`?.` yordam bermaydi: xato `value()` chaqiruvining **o'zida**. To'g'risi — avval tekshirish:

```html
<!-- ✅ -->
@if (user.hasValue()) {
  <h2>{{ user.value().name }}</h2>
}
```

`hasValue()` bilan tekshirgandan keyin tip ham toraytiriladi: `user.value()` — `User`, `undefined` emas.

Shablon uchun ishonchli tartib:

```html
@if (user.error()) {
  <app-error [error]="user.error()" (retry)="user.reload()" />
} @else if (user.hasValue()) {
  <app-user-card [user]="user.value()" />
} @else {
  <app-skeleton />
}
```

Xato birinchi — shunda `value()` hech qachon xato holatida o'qilmaydi.

## Kod: bekor qilish

`params` o'zgarsa, oldingi so'rovning `abortSignal` i bekor bo'ladi. Uni `fetch` ga uzating:

```ts
loader: async ({ params: query, abortSignal }) => {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
    signal: abortSignal,          // ← shu qator
  });

  return response.json();
},
```

Uzatilmasa: `resource` eski natijani baribir **e'tiborsiz qoldiradi** (poyga yo'q), lekin tarmoq so'rovi oxirigacha davom etadi — trafik va server resursi isrof.

## Kod: shartli yuklash — `undefined`

`params` `undefined` qaytarsa — so'rov **yuborilmaydi**, holat `idle`:

```ts
protected readonly selectedId = signal<number | undefined>(undefined);

protected readonly details = resource({
  params: () => this.selectedId(),         // tanlanmagan bo'lsa — undefined
  loader: ({ params: id }) => this.api.getOrder(id),
});
```

`loader` ichida `params` tipi `number` — `undefined` avtomatik chiqarib tashlangan.

Bir nechta shart:

```ts
params: () => {
  const user = this.user();
  const tab = this.tab();

  if (!user || tab !== 'orders') return undefined;   // kerak emas

  return { userId: user.id, status: this.statusFilter() };
},
```

## Kod: `reload`, `set`, `update`

```ts
protected refresh() {
  this.orders.reload();                  // o'sha params bilan qayta — reloading
}

protected rename(name: string) {
  // Optimistik yangilash — serverni kutmasdan ekranda ko'rsatish
  this.user.update((u) => (u ? { ...u, name } : u));   // holat: local

  this.api.rename(name).catch(() => this.user.reload()); // xato bo'lsa — serverdan qaytarish
}
```

| Metod | Holat | Qachon |
| --- | --- | --- |
| `reload()` | `reloading` | "Yangilash" tugmasi, mutatsiyadan keyin |
| `set(v)` / `update(fn)` | `local` | Optimistik yangilash |
| `destroy()` | `idle` | Qo'lda to'xtatish (odatda kerak emas) |

`reloading` paytida eski qiymat **saqlanadi** — foydalanuvchi bo'sh ekran emas, eski ma'lumotni ko'radi. `loading` da esa yo'q (yangi `params` — eski ma'lumot boshqa narsa haqida).

## Kod: bog'liq resurslar — `chain`

Bir resurs boshqasining natijasiga bog'liq bo'lsa:

```ts
protected readonly user = resource({
  params: () => this.userId(),
  loader: ({ params }) => this.api.getUser(params),
});

protected readonly team = resource({
  params: (ctx) => ctx.chain(this.user)?.teamId,    // user tayyor bo'lgandagina
  loader: ({ params: teamId }) => this.api.getTeam(teamId),
});
```

`?.` shart: `defaultValue` siz resurs tipi `User | undefined`, shuning uchun `ctx.chain(this.user).teamId` kompilyatsiya bo'lmaydi — `TS2532: Object is possibly 'undefined'` (tekshirildi). `undefined` chiqsa `team` shunchaki `idle` bo'ladi.

`ctx.chain(this.user)`:

| `user` holati | `team` nima qiladi |
| --- | --- |
| `resolved` / `local` | `user` qiymatini oladi, yuklashni boshlaydi |
| `loading` | O'zi ham `loading` holatiga o'tadi, kutadi |
| `error` | O'zi ham `error` — `ResourceDependencyError` bilan |

Uchala holat Angular 22 da test bilan tasdiqlangan.

`chain` siz `params` ichida `this.user.value()` o'qisangiz — `user` xato holatida bo'lsa, `params` ham xato tashlaydi (yuqoridagi tuzoq).

## Kod: `defaultValue`

```ts
protected readonly tags = resource({
  params: () => this.postId(),
  loader: ({ params }) => this.api.getTags(params),
  defaultValue: [],
});
```

Endi `tags.value()` tipi `string[]` (`undefined` emas) — yuklanayotganda `[]`. Shablonda `@for (tag of tags.value(); ...)` tekshiruvsiz ishlaydi. Lekin **xato holatida** `value()` baribir xato tashlaydi — `defaultValue` bundan himoya qilmaydi (tekshirildi).

## Muhandislik nuqtai nazari: `resource` qayerda yashaydi

`resource` — **komponent yoki xizmat** bilan birga yashaydi va yo'q qilinadi. Bundan kelib chiqadi:

| Holat | Natija |
| --- | --- |
| Ikki komponent bir xil `resource` yaratsa | **Ikki so'rov** — kesh yo'q |
| Sahifadan chiqib qaytsangiz | Qaytadan yuklanadi |
| Bir necha joyda bir xil ma'lumot kerak | Xizmatga chiqaring |

Ma'lumot bir necha komponentda kerak bo'lsa — `resource` ni **xizmatda** yarating:

```ts
@Service()
export class CurrentUser {
  readonly user = resource({
    loader: () => fetch('/api/me').then((r) => r.json() as Promise<User>),
  });
}
```

Xizmat bitta (root), demak so'rov ham bitta. Murakkabroq keshlash (vaqt bo'yicha eskirish, fon rejimida yangilash) — 60-bob.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Xato holatida `value()` o'qish | "Resource is currently in an error state" — komponent sinadi | Avval `error()` yoki `hasValue()` |
| `value()?.name` bilan himoyalanish | Yordam bermaydi — xato chaqiruvning o'zida | `@if (x.hasValue())` |
| `abortSignal` ni `fetch` ga uzatmaslik | Eski so'rovlar tarmoqda davom etadi | `{ signal: abortSignal }` |
| `loader` ichida signal o'qish | Kuzatilmaydi — o'zgarsa qayta yuklanmaydi | `params` ga ko'chiring |
| `effect` + `fetch` + uchta signal | Poyga, bekor qilish yo'q | `resource` |
| Bog'liq resursda `params` ichida `other.value()` | `other` xatoda `params` ham sinadi | `ctx.chain(other)` |
| Har komponentda bir xil resurs | Takroriy so'rovlar | Xizmatga chiqaring |
| Mutatsiya uchun `resource` | Noto'g'ri vosita — faqat o'qish uchun | Xizmat metodi + `reload()` |

## Amaliyot

1. `UserProfile` ni `resource` bilan yozing; `userId` ni tez-tez o'zgartirib, DevTools Network'da eski so'rovlar bekor bo'lishini kuzating.
2. `loader` da ataylab xato tashlang va shablonda `value()?.name` yozing — komponent sinishini ko'ring. Keyin `hasValue()` bilan tuzating.
3. Tanlangan buyurtma tafsilotlarini `params: () => selectedId()` bilan yozing; tanlanmaganda `idle` ekanini tekshiring.
4. "Yangilash" tugmasiga `reload()` ulang va `reloading` paytida eski ma'lumot ko'rinib turishini tasdiqlang.
5. `user` → `team` bog'liq resursini `ctx.chain` bilan yozing; `user` ni ataylab yiqitib, `team` holatini ko'ring.
6. Optimistik nom o'zgartirishni `update` bilan qiling; server xatosida `reload()` bilan qaytaring.

## Rasmiy hujjat

- Asinxron reaktivlik: <https://angular.dev/guide/signals/resource>
- `resource` API: <https://angular.dev/api/core/resource>
