# 72 — Testlash: komponentlar va DI

[← Oldingi: Testlash: birlik testlari](71-birlik-testlari.md) · [Mundarija](README.md) · [Keyingi: E2E testlash →](73-e2e.md)

## Tushuncha

Komponent testi — komponentni **haqiqiy** Angular muhitida (shablon, DI, change detection) yaratib, foydalanuvchi kabi ishlatish:

```ts
const fixture = TestBed.createComponent(Counter);
fixture.componentRef.setInput('label', 'Soni');
await fixture.whenStable();

fixture.nativeElement.querySelector('button').click();
await fixture.whenStable();

expect(fixture.nativeElement.textContent).toContain('Soni: 1');
```

| Vosita | Vazifa |
| --- | --- |
| `TestBed.createComponent` | Komponent + `ComponentFixture` |
| `fixture.componentRef.setInput` | `input()` ga qiymat |
| `await fixture.whenStable()` | Zoneless'da change detection va async ishlar tugashini kutish |
| `fixture.nativeElement` | DOM |
| Harness'lar | Material/Aria/o'z komponentlari uchun barqaror API |

## Nega shunday

Testni DOM tuzilmasiga (`div > span:nth-child(2)`) bog'lash — har HTML o'zgarishida buziladi. Yaxshi komponent testi **foydalanuvchi ko'radigan** narsani tekshiradi: matn, rol, holat. Harness'lar va role-asosli so'rovlar shunga yordam beradi.

Zoneless Angular 22 da `fixture.detectChanges()` o'rniga **`await fixture.whenStable()`** — asosiy usul: u signal yangilanishlari, `afterRender`, pending vazifalar tugashini kutadi.

## Kod: asosiy komponent testi

```ts
@Component({
  selector: 'app-counter',
  imports: [MatButton],
  template: `
    <p>{{ label() }}: {{ count() }}</p>
    <button matButton="filled" (click)="inc()">+</button>
    <button matButton [disabled]="count() === 0" (click)="reset.emit()">0</button>
  `,
})
export class Counter {
  readonly label = input.required<string>();
  readonly reset = output<void>();
  protected readonly count = signal(0);
  protected inc() { this.count.update((n) => n + 1); }
}
```

```ts
describe('Counter', () => {
  let fixture: ComponentFixture<Counter>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Counter);
    fixture.componentRef.setInput('label', 'Soni');
    loader = TestbedHarnessEnvironment.loader(fixture);
    await fixture.whenStable();
  });

  it('bosilganda oshadi', async () => {
    const [plus] = await loader.getAllHarnesses(MatButtonHarness);
    await plus.click();
    await plus.click();
    expect(fixture.nativeElement.querySelector('p').textContent).toBe('Soni: 2');
  });

  it("0 da reset o'chirilgan", async () => {
    const zero = await loader.getHarness(MatButtonHarness.with({ text: '0' }));
    expect(await zero.isDisabled()).toBe(true);
  });

  it('reset hodisasini chiqaradi', async () => {
    const [plus, zero] = await loader.getAllHarnesses(MatButtonHarness);
    let emitted = 0;
    fixture.componentInstance.reset.subscribe(() => emitted++);
    await plus.click();
    await zero.click();
    expect(emitted).toBe(1);
  });
});
```

Tekshirildi:

| Holat | Natija |
| --- | --- |
| Required input berilmasdan `whenStable` | `NG0950: Input "label" is required but no value is available yet.` |
| `setInput('label', 'Soni')` | `Soni: 0` |
| Harness bilan ikki bosish | `Soni: 2` — harness `click` o'zi `whenStable` kutadi |
| `zero.isDisabled()` | `true` |
| `output` ga obuna | `emitted === 1` |

Harness `click()`, `getText()` — asinxron va change detection'ni **o'zi** kutadi. Qo'lda `button.click()` dan keyin esa `await fixture.whenStable()` kerak.

## Kod: harness'lar

```ts
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { TabsHarness } from '@angular/aria/tabs/testing';

const input = await loader.getHarness(MatInputHarness.with({ placeholder: 'Email' }));
await input.setValue('ali@example.uz');

const tabs = await loader.getHarness(TabsHarness);
await tabs.selectTab(...);     // tekshirildi: getTabs, getSelectedTab, selectTab
```

Material ichki DOM'i versiyalar orasida o'zgaradi, harness API'si — yo'q. Material komponentlarini **faqat** harness orqali test qiling.

O'z komponentingiz uchun harness:

```ts
export class CounterHarness extends ComponentHarness {
  static hostSelector = 'app-counter';
  private readonly label = this.locatorFor('p');
  private readonly plus = this.locatorFor(MatButtonHarness.with({ text: '+' }));

  async text() { return (await this.label()).text(); }
  async increment() { return (await this.plus()).click(); }
}
```

Tekshirildi: `CounterHarness` ikki `increment()` dan keyin `text()` → `Soni: 2`; `MatButtonHarness.with({ text: '0' })` to'g'ri tugmani topdi.

Dizayn tizimi (`shared/ui`) komponentlariga harness — ularni ishlatadigan barcha testlar DOM tafsilotiga bog'lanmaydi.

## Kod: DI — provayderlarni almashtirish

```ts
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      { provide: ProductApi, useValue: { get: vi.fn(() => of(fakeProduct)) } },
      { provide: Permissions, useValue: { can: () => true, canAll: () => true } },
    ],
  });
});
```

**Komponent o'z `providers` idagi xizmat** — `configureTestingModule` bilan almashtirib **bo'lmaydi** (39-bobda tekshirilgan — haqiqiysi ishladi):

```ts
TestBed.overrideComponent(CheckoutPage, {
  set: { providers: [{ provide: CheckoutFacade, useValue: fakeFacade }] },
});
```

Bola komponentlarni soddalashtirish — og'ir bola (xarita, grafik) o'rniga "stub":

```ts
@Component({ selector: 'app-map', template: '' })
class MapStub { readonly center = input<LatLng>(); }

TestBed.overrideComponent(StorePage, {
  remove: { imports: [MapComponent] },
  add: { imports: [MapStub] },
});
```

Tekshirildi: `remove/add imports` bilan `app-map` o'rnida stub shabloni render bo'ldi.

## Kod: marshrutli komponent

```ts
it('mahsulot sahifasini id bilan ochadi', async () => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: 'products/:id', component: ProductDetail }], withComponentInputBinding()),
      { provide: ProductApi, useValue: fakeApi },
    ],
  });

  const harness = await RouterTestingHarness.create();
  const page = await harness.navigateByUrl('/products/42', ProductDetail);

  expect(page.id()).toBe('42');
  expect(harness.routeNativeElement?.textContent).toContain('Olma');
});
```

`RouterTestingHarness` — haqiqiy Router bilan, `withComponentInputBinding` va guardlar ham ishlaydi (40–44-boblardagi tekshiruvlar shu bilan qilingan). `RouterTestingModule` — eski; `router-testing-module-migration` ko'chiradi.

## Kod: formalar

```ts
it('yaroqsiz formada yubormaydi', async () => {
  const fixture = TestBed.createComponent(Signup);
  await fixture.whenStable();
  const api = TestBed.inject(AuthApi);
  const spy = vi.spyOn(api, 'register');

  (fixture.nativeElement.querySelector('button[type=submit], button') as HTMLButtonElement).click();
  await fixture.whenStable();

  expect(spy).not.toHaveBeenCalled();
  expect(fixture.nativeElement.textContent).toContain('Majburiy maydon');
});
```

Input'ga yozish: `input.value = '...'; input.dispatchEvent(new Event('input'))`, blur — `new Event('blur')`. Signal Forms va Reactive Forms ikkalasi ham shu hodisalarni tinglaydi (47–54-boblar testlari shunday qilingan).

## Muhandislik nuqtai nazari

**Nimani komponent testida:**

| Ha | Yo'q (birlik testiga) |
| --- | --- |
| Input → ko'rinish | Narx hisobi formulasi |
| Bosish → output / xizmat chaqiruvi | Store mantiqi |
| Xato/yuklanish holatlari ko'rinishi | Validator funksiyasi |
| Erishimlilik atributlari (`aria-*`, rol) | |

**HTTP testlarida** — `HttpClient` ni emas, API **xizmatini** mock qiling: komponent testi URL'larga bog'lanmasin.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Required input'siz `whenStable` | NG0950 | `componentRef.setInput` avval |
| `componentInstance.label = ...` (signal input) | Ishlamaydi / TS xatosi | `setInput` |
| Qo'lda `click()` dan keyin `whenStable` yo'q | Eski DOM | `await fixture.whenStable()` |
| Material DOM klasslari bilan so'rov | Yangilanishda buziladi | Harness |
| Komponent `providers` xizmatini `configureTestingModule` da | Haqiqiysi ishlaydi | `overrideComponent` |
| Og'ir bola komponentlar testda | Sekin, mo'rt | Stub bilan almashtirish |
| `RouterTestingModule` | Eskirgan | `provideRouter` + `RouterTestingHarness` |

## Amaliyot

1. `Counter` komponenti uchun uchta test (yuqoridagi).
2. `CounterHarness` yozing va testni unga o'tkazing.
3. `CheckoutPage` ni `overrideComponent` bilan soxta fasad bilan testlang.
4. `ProductDetail` ni `RouterTestingHarness` bilan `/products/42` da oching.
5. Forma: bo'sh yuborishda xato ko'rinishi va API chaqirilmasligi.
6. Og'ir `MapComponent` ni stub bilan almashtiring.

## Rasmiy hujjat

- Komponent testlash: <https://angular.dev/guide/testing/components-basics>
- Harness'lar: <https://angular.dev/guide/testing/using-component-harnesses>
- Router testlash: <https://angular.dev/guide/routing/testing>
