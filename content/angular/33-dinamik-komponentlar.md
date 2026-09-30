# 33 — Dinamik komponentlar

[← Oldingi: DOM bilan ishlash](32-dom-bilan-ishlash.md) · [Mundarija](README.md) · [Keyingi: DI modeli →](34-di-modeli.md)

## Tushuncha

Odatda qaysi komponent chiqishi **shablonda** yozilgan: `<app-user-card />`. Dinamik komponent — qaysi komponent chiqishi **ish vaqtida** aniqlanadi:

| Holat | Misol |
| --- | --- |
| Konfiguratsiyadan kelgan komponent | Dashboard vidjetlari (foydalanuvchi o'zi tanlaydi) |
| Serverdan kelgan tur | Bildirishnoma turiga qarab turli kartalar |
| Dasturiy ochiladigan oyna | Modal, toast, dialog xizmati |
| Plagin tizimi | Tashqi modul yuklagan komponent |

Uchta vosita:

| Vosita | Qachon |
| --- | --- |
| `@switch` / `@if` | Variantlar oldindan ma'lum va kam |
| `NgComponentOutlet` | Shablonda, komponent turi signaldan |
| `ViewContainerRef.createComponent` | Koddan — modal, toast xizmati |

## Nega shunday

Birinchi savol: **haqiqatan dinamik kerakmi?** Ko'p hollarda `@switch` yetadi va yaxshiroq — tip tekshiruvi to'liq, kod o'qiladi:

```html
@switch (notification().type) {
  @case ('order') { <app-order-notice [data]="notification()" /> }
  @case ('message') { <app-message-notice [data]="notification()" /> }
  @case ('system') { <app-system-notice [data]="notification()" /> }
  @default never;
}
```

Dinamik komponent kerak bo'ladigan joylar — variantlar **ro'yxati oldindan noma'lum** yoki komponent **kod orqali** yaratilishi kerak (modal xizmati).

## Kod: `NgComponentOutlet`

```ts
import { Component, Type, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';

const WIDGETS: Record<string, Type<unknown>> = {
  sales: SalesWidget,
  orders: OrdersWidget,
  weather: WeatherWidget,
};

@Component({
  selector: 'app-dashboard',
  imports: [NgComponentOutlet],
  template: `
    @for (w of layout(); track w.id) {
      <section class="widget">
        <ng-container *ngComponentOutlet="widgets[w.type]; inputs: { title: w.title, config: w.config }" />
      </section>
    }
  `,
})
export class Dashboard {
  protected readonly widgets = WIDGETS;
  protected readonly layout = signal<WidgetConfig[]>([]);
}
```

`inputs` — kiritmalar obyekti. Haqiqiy test natijasi (Angular 22): `*ngComponentOutlet="cmp(); inputs: { title: t() }"` — `t` o'zgarsa kiritma yangilandi, `cmp` o'zgarsa komponent almashdi:

```
A:salom → (t = 'xayr') → A:xayr → (cmp = B) → B:xayr
```

## Kod: `ViewContainerRef.createComponent`

Koddan yaratish — joy (`ViewContainerRef`) kerak:

```ts
import { Component, ViewContainerRef, inputBinding, outputBinding, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-host',
  template: `<ng-container #slot />`,
})
export class Host {
  private readonly slot = viewChild.required('slot', { read: ViewContainerRef });
  protected readonly name = signal('Ali');

  protected show() {
    const ref = this.slot().createComponent(Hello, {
      bindings: [
        inputBinding('name', this.name),                          // signal — reaktiv
        outputBinding<string>('bye', (value) => this.onBye(value)),
      ],
    });
  }

  private onBye(value: string) { ... }
}
```

Tekshirildi: `name` signali `'Vali'` ga o'zgarganda dinamik komponent ham yangilandi; `bye` chiqishi `onBye` ga keldi.

| Funksiya | Nima |
| --- | --- |
| `inputBinding('name', signal)` | Kiritmani signalga bog'laydi — signal o'zgarsa yangilanadi |
| `outputBinding('event', fn)` | Chiqishni funksiyaga ulaydi |
| `twoWayBinding('value', writableSignal)` | `model` bilan ikki tomonlama |

### `bindings` va `setInput` — aralashtirmang

Eski usul — `setInput`:

```ts
const ref = this.slot().createComponent(Hello);
ref.setInput('name', 'Ali');
```

Ishlaydi, lekin **reaktiv emas** — qiymat o'zgarsa, qo'lda qayta chaqirish kerak. `bindings` bilan yaratilgan komponentga `setInput` chaqirish esa **xato** (tekshirildi):

```
NG0317: Cannot call `setInput` on a component that is using the `inputBinding`
or `twoWayBinding` functions.
```

Bitta usulni tanlang — yangi kodda `bindings`.

## Kod: modal xizmati

Dinamik komponentning eng keng tarqalgan ishlatilishi:

```ts
import { ApplicationRef, EnvironmentInjector, Service, Type, createComponent, inject, inputBinding, outputBinding, signal } from '@angular/core';

@Service()
export class Dialog {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  open<T>(component: Type<T>, data: unknown): Promise<unknown> {
    return new Promise((resolve) => {
      const host = document.createElement('div');
      document.body.appendChild(host);

      const ref = createComponent(component, {
        environmentInjector: this.injector,
        hostElement: host,
        bindings: [
          inputBinding('data', signal(data)),
          outputBinding('closed', (result: unknown) => {
            this.appRef.detachView(ref.hostView);
            ref.destroy();
            host.remove();
            resolve(result);
          }),
        ],
      });

      this.appRef.attachView(ref.hostView);     // o'zgarishlarni aniqlashga ulash
    });
  }
}
```

```ts
// Ishlatish
const confirmed = await this.dialog.open(ConfirmDialog, { message: "O'chirilsinmi?" });
```

Muhim qadamlar:

| Qadam | Nega |
| --- | --- |
| `createComponent(..., { hostElement })` | Komponentni `body` dagi elementga joylash |
| `appRef.attachView` | Busiz komponent yangilanmaydi |
| Yopilganda `detachView` + `destroy` + `remove` | Xotira oqmasin |

**Diqqat:** bu misolda `document` to'g'ridan-to'g'ri ishlatilgan — faqat brauzerda chaqiriladigan xizmat uchun (modal foydalanuvchi harakatiga javoban ochiladi). Production'da **Angular CDK Dialog** (66-bob) — fokus tuzog'i, Escape, erishimlilik, animatsiya bilan tayyor. O'zingiz yozgan modal deyarli har doim erishimlilikda kamchilikka ega.

## Kod: kechiktirib yuklash

Dinamik komponent kodi ham alohida chunk'ga ajralishi mumkin:

```ts
protected async openEditor() {
  const { RichEditor } = await import('./rich-editor/rich-editor');

  this.slot().createComponent(RichEditor, {
    bindings: [inputBinding('content', this.content)],
  });
}
```

`import()` — editor kodi faqat tugma bosilganda yuklanadi. Shablon ichidagi kechiktirish uchun esa `@defer` (12-bob) soddaroq.

## Muhandislik nuqtai nazari: tanlov daraxti

```
Qaysi komponent chiqishi oldindan ma'lummi?
├── Ha, 2–5 variant ──────────────────► @switch + @default never
├── Ha, lekin og'ir ──────────────────► @defer
└── Yo'q (konfiguratsiya, plagin)
    ├── Shablonda joylashadi ─────────► NgComponentOutlet
    └── Koddan ochiladi (modal, toast)
        ├── Standart dialog ──────────► CDK Dialog
        └── Maxsus holat ─────────────► createComponent + bindings
```

Dinamik komponentlarning narxi: tip tekshiruvi kuchsizroq (`Type<unknown>`, `inputs` obyekti), o'qish qiyinroq, xotira boshqaruvi sizda. Faqat haqiqatan kerak bo'lganda.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| 3 variant uchun dinamik komponent | Keraksiz murakkablik, tip yo'qoladi | `@switch` |
| `bindings` + `setInput` | NG0317 | Bittasini tanlang |
| `setInput` bilan "reaktiv" kutish | Qiymat o'zgarsa yangilanmaydi | `inputBinding(name, signal)` |
| `createComponent` + `attachView` yo'q | Komponent yangilanmaydi | `appRef.attachView` |
| Yopilganda `destroy` yo'q | Xotira oqishi | `detachView`, `destroy`, `remove` |
| O'z modal xizmatini productionda | Fokus, Escape, ARIA kamchiliklari | CDK Dialog |
| `NgComponentOutlet` ni `imports` ga qo'shmaslik | Ishlamaydi | `imports: [NgComponentOutlet]` |

## Amaliyot

1. Bildirishnomalarni `@switch` bilan uch xil kartada chiqaring, `@default never;` qo'shing.
2. Dashboard vidjetlarini `NgComponentOutlet` + `inputs` bilan yozing; tartib signalda saqlansin.
3. `createComponent` + `inputBinding` bilan komponent yarating va signal o'zgarganda yangilanishini tekshiring.
4. Xuddi shu komponentga `setInput` chaqiring — NG0317 ni ko'ring.
5. `Dialog` xizmatini yozing va `await dialog.open(ConfirmDialog, ...)` bilan tasdiqlash oynasini qiling.
6. Og'ir muharrirni `import()` bilan faqat tugma bosilganda yuklang; build'da alohida chunk'ni toping.

## Rasmiy hujjat

- Dasturiy render: <https://angular.dev/guide/components/programmatic-rendering>
- `NgComponentOutlet`: <https://angular.dev/api/common/NgComponentOutlet>
- `createComponent`: <https://angular.dev/api/core/createComponent>
- CDK Dialog: <https://material.angular.dev/cdk/dialog/overview>
