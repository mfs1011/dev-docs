# 05 — Komponent anatomiyasi

[← Oldingi: Angular uchun TypeScript](04-typescript.md) · [Mundarija](README.md) · [Keyingi: Angular CLI →](06-angular-cli.md)

## Tushuncha

Komponent — Angular ilovasining asosiy qurilish bloki. Ekranda ko'ringan har narsa — sarlavha, tugma, jadval, butun sahifa — komponent yoki komponentlar daraxti.

Har komponent uch qismdan iborat:

```
┌─────────────────────────────────┐
│  TypeScript klass               │  ← holat va xulq
│  (user-card.ts)                 │
├─────────────────────────────────┤
│  Shablon                        │  ← nima ko'rinadi
│  (user-card.html)               │
├─────────────────────────────────┤
│  Stil                           │  ← qanday ko'rinadi
│  (user-card.css)                │
└─────────────────────────────────┘
        + @Component dekoratori — uchalasini bog'laydi
```

## Nega shunday

Komponent — **o'z-o'zini o'z ichiga olgan birlik**. Uning shabloni, stili va mantig'i birga turadi. Stil boshqa komponentlarga oqib chiqmaydi (30-bob), holat ichkarida saqlanadi, tashqi dunyo bilan faqat kiritma (`input`) va chiqish (`output`) orqali gaplashadi (25–26-boblar).

Bu — katta ilovada nimani qayerdan qidirishni bilish uchun. "Foydalanuvchi kartasi noto'g'ri ko'rinyapti" — `user-card/` papkasini ochasiz, hamma narsa shu yerda.

## Kod: generatsiya

```bash
ng generate component user-card
```

Angular 22 yaratadigan fayllar:

```
src/app/user-card/
├── user-card.ts
├── user-card.html
├── user-card.css
└── user-card.spec.ts
```

`user-card.ts`:

```ts
import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-user-card',
  styleUrl: './user-card.css',
  templateUrl: './user-card.html',
})
export class UserCard {}
```

Nomlash qoidalari (rasmiy uslub qo'llanmasi):

| Narsa | Qoida | Misol |
| --- | --- | --- |
| Fayl | kebab-case, qo'shimchasiz | `user-card.ts` |
| Klass | PascalCase, `Component` qo'shimchasiz | `UserCard` |
| Selektor | `app-` + kebab-case | `app-user-card` |
| Test | `.spec.ts` | `user-card.spec.ts` |

> **Ilgari:** `user-card.component.ts` va `UserCardComponent`. Eski loyihalarda shunday, yangi kodda qo'shimchasiz.

## Kod: `@Component` metama'lumoti

```ts
@Component({
  selector: 'app-user-card',          // HTML'da qanday nomlanadi
  imports: [DatePipe, Avatar],        // shablonda ishlatiladiganlar
  templateUrl: './user-card.html',    // yoki template: `...`
  styleUrl: './user-card.css',        // yoki styles: `...`
  host: { class: 'card' },            // host elementiga atributlar (29-bob)
  providers: [],                      // komponent darajasidagi DI (37-bob)
})
```

**`selector`** — uch turi bor:

| Tur | Selektor | Ishlatilishi |
| --- | --- | --- |
| Element | `'app-user-card'` | `<app-user-card />` |
| Atribut | `'[appUserCard]'` | `<div appUserCard>` |
| Klass | `'.app-user-card'` | `<div class="app-user-card">` |

Komponentlar uchun deyarli har doim **element** selektori. Atribut selektori — direktivalar uchun (14-bob).

**`template` va `templateUrl`**:

```ts
// Kichik shablon — shu faylda
@Component({
  selector: 'app-badge',
  template: `<span class="badge">{{ label() }}</span>`,
})

// Katta shablon — alohida faylda
@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.html',
})
```

Amaliy qoida: 5–10 qatordan oshsa — alohida fayl. Alohida faylda muharrir HTML'ni to'liq tushunadi.

**`imports`** — shablonda ishlatiladigan **har** komponent, direktiva va quvur shu yerda:

```ts
import { DatePipe } from '@angular/common';
import { Avatar } from '../avatar/avatar';

@Component({
  selector: 'app-user-card',
  imports: [DatePipe, Avatar],
  template: `
    <app-avatar [src]="user().photo" />
    <p>Ro'yxatdan o'tgan: {{ user().createdAt | date }}</p>
  `,
})
```

`Avatar` ni `imports` ga qo'shmasangiz — `NG8001: 'app-avatar' is not a known element`. Qo'shib, lekin ishlatmasangiz — `NG8113` ogohlantirishi.

## Kod: klass — holat va xulq

```ts
import { Component, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
})
export class UserCard {
  // 1. Tashqaridan keladi
  readonly user = input.required<User>();

  // 2. Tashqariga chiqadi
  readonly follow = output<number>();

  // 3. Ichki holat
  protected readonly expanded = signal(false);

  // 4. Hisoblangan qiymat
  protected readonly initials = computed(() =>
    this.user().name.split(' ').map((part) => part[0]).join(''),
  );

  // 5. Xulq
  protected toggle() {
    this.expanded.update((value) => !value);
  }

  protected followUser() {
    this.follow.emit(this.user().id);
  }
}
```

Uslub qo'llanmasi bo'yicha tartib: **Angular maydonlari (`input`, `output`, so'rovlar) yuqorida**, keyin ichki holat, keyin metodlar. Metod nomi **nima qilishini** aytadi (`followUser`), qaysi hodisadan chaqirilishini emas (`handleClick` — yomon).

`user-card.html`:

```html
<article class="card">
  <header>
    <span class="initials">{{ initials() }}</span>
    <h3>{{ user().name }}</h3>
  </header>

  @if (expanded()) {
    <p>{{ user().bio }}</p>
  }

  <button type="button" (click)="toggle()">
    {{ expanded() ? 'Yopish' : "Batafsil" }}
  </button>
  <button type="button" (click)="followUser()">Kuzatish</button>
</article>
```

## Kod: komponentni ishlatish

Boshqa komponent ichida:

```ts
import { UserCard } from './user-card/user-card';

@Component({
  selector: 'app-team',
  imports: [UserCard],
  template: `
    @for (member of members(); track member.id) {
      <app-user-card [user]="member" (follow)="onFollow($event)" />
    }
  `,
})
export class Team {
  protected readonly members = signal<User[]>([]);

  protected onFollow(userId: number) {
    console.log('Kuzatildi:', userId);
  }
}
```

`<app-user-card ... />` — o'z-o'zini yopuvchi teg. Ichida kontent bo'lmasa, `</app-user-card>` yozish shart emas.

`[user]="member"` — kiritma bog'lash, `(follow)="..."` — chiqish hodisasi. Ikkalasi 8–9 va 25–26-boblarda.

## Kod: o'zgarishlarni aniqlash — v22 dagi muhim o'zgarish

Angular komponentni qachon qayta chizishini (re-render) **o'zgarishlarni aniqlash** (change detection) hal qiladi. Angular 22 dan har komponent sukut bo'yicha **`OnPush`** strategiyasida ishlaydi.

OnPush komponent faqat quyidagi hollarda qayta tekshiriladi:

| Nima bo'ldi | Qayta tekshiriladimi |
| --- | --- |
| Shablonda o'qilgan **signal** o'zgardi | ✅ Ha |
| Komponentga yangi `input` qiymati keldi | ✅ Ha |
| Komponent ichida hodisa bo'ldi (`(click)` va h.k.) | ✅ Ha |
| `async` quvuri yangi qiymat oldi | ✅ Ha |
| **Oddiy maydon** `setTimeout`/`fetch`/`Promise` ichida o'zgardi | ❌ **Yo'q** |

Oxirgi qator — eng ko'p uchraydigan xato. Haqiqiy Angular 22 loyihasida test bilan tekshirildi:

```ts
@Component({
  selector: 'app-lab',
  template: `
    <p>{{ plain }}</p>
    <p>{{ sig() }}</p>
    <button (click)="clickPlain()">+</button>
  `,
})
export class Lab {
  protected plain = "boshlang'ich";
  protected readonly sig = signal("boshlang'ich");

  protected clickPlain() {
    this.plain = 'bosildi';          // ✅ ekranda yangilanadi — hodisa
  }

  laterPlain() {
    setTimeout(() => (this.plain = 'kechikib'));   // ❌ ekranda YANGILANMAYDI
  }

  laterSignal() {
    setTimeout(() => this.sig.set('kechikib'));    // ✅ yangilanadi — signal
  }
}
```

Sabab: Angular oddiy maydon o'zgarganini **bilmaydi**. Hodisa ishlovchisida bilib oladi (hodisaning o'zi signal), lekin `setTimeout` ichida — yo'q. Signal esa o'zgarganini o'zi xabar qiladi.

Xulosa — oddiy qoida: **ekranda ko'rinadigan holat — signal**. Shunda qachon yangilanishini o'ylashingiz shart emas.

> **Ilgari:** sukut strategiya `Default` edi — Angular har hodisadan keyin butun daraxtni tekshirardi (zone.js yordamida). v22 da u **`ChangeDetectionStrategy.Eager`** deb qayta nomlangan. `ng update` v22 ga o'tishda strategiyasi yozilmagan eski komponentlarga `Eager` ni avtomatik qo'shadi — xulq o'zgarmasin deb. Yangi komponentlarda strategiya yozilmaydi.

O'zgarishlarni aniqlash 23-bobda (zoneless) chuqur ochiladi.

## Kod: hayot siklidan qisqacha

Komponent yaratiladi, ekranga chiqadi, o'zgaradi, yo'q qilinadi. Zamonaviy Angular'da hayot sikli hooklari kamroq kerak — signal va `computed` ko'p ishni o'zi qiladi. Eng ko'p ishlatiladigani:

```ts
import { Component, DestroyRef, inject } from '@angular/core';

export class LiveClock {
  protected readonly now = signal(new Date());

  constructor() {
    const timer = setInterval(() => this.now.set(new Date()), 1000);

    // Komponent yo'q qilinganda taymerni to'xtatish
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}
```

Hayot sikli to'liq — 31-bobda.

## Muhandislik nuqtai nazari: komponentni qachon bo'lish

Bitta katta komponent yoki ko'p kichik? Belgilar:

| Belgi | Bo'lish kerak |
| --- | --- |
| Shablon 150 qatordan oshdi | ✅ |
| Bir qism boshqa joyda ham kerak | ✅ |
| Bir qismning o'z holati bor (ochiq/yopiq, tanlangan) | ✅ |
| Test yozish qiyin, ko'p narsa mock qilinadi | ✅ |
| Faqat 5 qatorli, bir marta ishlatiladigan bo'lak | ❌ Shablonda qoldiring |

Ikki xil komponentni ajratish foydali:

| Tur | Nima qiladi | Misol |
| --- | --- | --- |
| **Ko'rinish** (presentational) | Faqat `input` oladi, `output` chiqaradi. Xizmat ishlatmaydi | `UserCard`, `Button`, `PriceTag` |
| **Konteyner** (smart) | Xizmatdan ma'lumot oladi, ko'rinish komponentlariga uzatadi | `TeamPage`, `OrderList` |

Ko'rinish komponentlarini test qilish va qayta ishlatish oson. Mantiq konteynerlarda to'planadi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Ishlatilgan komponentni `imports` ga qo'shmaslik | NG8001 | `imports: [UserCard]` |
| `setTimeout`/`fetch` ichida oddiy maydonni o'zgartirish | Ekran yangilanmaydi (OnPush) | Signal ishlating |
| `UserCardComponent`, `user-card.component.ts` | Eski uslub | `UserCard`, `user-card.ts` |
| Komponentni atribut selektor bilan | Chalkash, direktivaga o'xshaydi | Element selektor |
| `handleClick()` nomli metod | Nima qilishi noma'lum | `followUser()` |
| Komponentda to'g'ridan-to'g'ri HTTP so'rov | Test qilish qiyin, qayta ishlatib bo'lmaydi | Xizmatga chiqaring (34-bob) |
| 400 qatorli shablon | O'qib bo'lmaydi | Kichik komponentlarga bo'ling |

## Amaliyot

1. `ng generate component user-card` qiling va yaratilgan to'rt faylni o'qing.
2. `UserCard` ga `input.required<User>()` qo'shib, `Team` komponentida `@for` bilan ishlating.
3. `Lab` misolini qayta yozing va uchala holatni o'zingiz sinang: tugma, `setTimeout` + oddiy maydon, `setTimeout` + signal.
4. `imports` dan `UserCard` ni olib tashlang — NG8001 xatosini ko'ring.
5. Mavjud komponentingizni "ko'rinish" va "konteyner" ga ajrating.
6. `LiveClock` ni yozing; boshqa sahifaga o'tganda taymer to'xtashini `console.log` bilan tekshiring.

## Rasmiy hujjat

- Komponent anatomiyasi: <https://angular.dev/guide/components>
- Selektorlar: <https://angular.dev/guide/components/selectors>
- O'zgarishlarni aniqlash (OnPush): <https://angular.dev/best-practices/skipping-subtrees>
- `ng generate component`: <https://angular.dev/cli/generate/component>
- Uslub qo'llanmasi: <https://angular.dev/style-guide>
