# 67 — Angular Aria

[← Oldingi: Angular Material va CDK](66-material-va-cdk.md) · [Mundarija](README.md) · [Keyingi: RxJS chuqur →](68-rxjs-chuqur.md)

## Tushuncha

`@angular/aria` — **stilsiz** (headless) komponent primitivlari. Ular HTML'ga ko'rinish emas, **xulq-atvor** beradi: ARIA rollari va atributlari, klaviatura navigatsiyasi, fokus boshqaruvi, tanlash mantiqi. Ko'rinish — to'liq sizning CSS'ingizda.

```bash
npm i @angular/aria
```

Tekshirildi — 22.2.1 dagi primitivlar (alohida kirish nuqtalari):

| Import | Naqsh (WAI-ARIA) |
| --- | --- |
| `@angular/aria/tabs` | Tabs |
| `@angular/aria/accordion` | Accordion |
| `@angular/aria/listbox` | Listbox (tanlash ro'yxati) |
| `@angular/aria/combobox` | Combobox / autocomplete |
| `@angular/aria/menu` | Menu, menubar |
| `@angular/aria/toolbar` | Toolbar |
| `@angular/aria/tree` | Tree |
| `@angular/aria/grid` | Grid (klaviatura bilan jadval) |

Har birida `*-testing` harness ham bor.

## Nega shunday

Material'ning ko'rinishi sizga mos kelmaydi, lekin tabs'ni noldan yozish — ARIA spetsifikatsiyasini o'qish, `ArrowLeft/Right/Home/End`, roving `tabindex`, `aria-selected`, `aria-controls`, RTL... Bu yerda ko'p dasturchi xato qiladi va natijada ekran o'quvchi va klaviatura foydalanuvchilari uchun buzilgan UI chiqadi.

| | Material | CDK | Aria |
| --- | --- | --- | --- |
| Stil | Material Design | Yo'q | Yo'q |
| Daraja | Tayyor komponent | Past darajadagi vositalar | Komponent naqshi (tabs, menu) |
| Dizayn tizimi uchun | Tema bilan cheklangan | Ko'p qo'l mehnati | ✅ Aynan shu uchun |

## Kod: Tabs

```ts
import { Tabs, TabList, Tab, TabPanel, TabContent } from '@angular/aria/tabs';

@Component({
  selector: 'app-product-tabs',
  imports: [Tabs, TabList, Tab, TabPanel, TabContent],
  template: `
    <div ngTabs class="tabs">
      <ul ngTabList [(selectedTab)]="selected" class="tab-list">
        <li ngTab value="desc" class="tab">Tavsif</li>
        <li ngTab value="specs" class="tab">Xususiyatlar</li>
        <li ngTab value="reviews" class="tab">Sharhlar</li>
      </ul>

      <div ngTabPanel value="desc" class="panel">
        <ng-template ngTabContent><app-description /></ng-template>
      </div>
      <div ngTabPanel value="specs" class="panel">
        <ng-template ngTabContent><app-specs /></ng-template>
      </div>
      <div ngTabPanel value="reviews" class="panel">
        <ng-template ngTabContent><app-reviews /></ng-template>
      </div>
    </div>
  `,
  styles: `
    .tab-list { display: flex; gap: 4px; list-style: none; padding: 0; }
    .tab { padding: 8px 16px; cursor: pointer; border-bottom: 2px solid transparent; }
    .tab[aria-selected='true'] { border-color: var(--accent); font-weight: 600; }
    .tab:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    .panel[inert] { display: none; }
  `,
})
export class ProductTabs {
  protected readonly selected = signal<string | undefined>('desc');
}
```

Tekshirildi — Aria **o'zi** qo'ygan atributlar:

| Element | Atributlar |
| --- | --- |
| `ngTabList` | `role="tablist"` |
| Faol tab | `role="tab"`, `aria-selected="true"`, `tabindex="0"`, `aria-controls="ng-tabpanel-…"`, `id="ng-tab-…"` |
| Nofaol tab | `aria-selected="false"`, `tabindex="-1"` (roving tabindex) |
| Panel | `role="tabpanel"`, `aria-labelledby` — tabga bog'langan |
| Yashirin panel | **`inert`** atributi |

Xulq:

| Harakat | Natija |
| --- | --- |
| Birinchi tabda `ArrowRight` | Fokus va tanlov ikkinchi tabga (`selected()` → `'specs'`) |
| Tabga bosish | Tanlandi |
| `ngTabContent` | Faqat **faol** panel kontenti DOM'da (dangasa) |

**Diqqat:** yashirin panel faqat `inert` oladi — erishimlilik daraxtidan chiqariladi, lekin **ko'rinib turadi**. Vizual yashirish — sizning CSS'ingiz: `.panel[inert] { display: none; }`. Stilsiz kutubxonaning ma'nosi shu.

Sozlamalar (`ngTabList`):

| Input | Qiymatlar |
| --- | --- |
| `selectionMode` | `'follow'` — fokus bilan tanlanadi; `'explicit'` — Enter/Space/bosish bilan |
| `orientation` | `'horizontal'` / `'vertical'` (strelkalar yo'nalishi) |
| `focusMode` | `'roving'` (tabindex) / `'activedescendant'` |
| `wrap` | Oxiridan boshiga o'tish |
| `softDisabled` | O'chirilgan tabga fokus tushadimi |

## Kod: Accordion

```ts
import { AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent } from '@angular/aria/accordion';

@Component({
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
  template: `
    <div ngAccordionGroup>
      @for (q of faq; track q.id) {
        <h3>
          <button ngAccordionTrigger [panel]="panel">{{ q.question }}</button>
        </h3>
        <div ngAccordionPanel #panel="ngAccordionPanel">
          <ng-template ngAccordionContent>{{ q.answer }}</ng-template>
        </div>
      }
    </div>
  `,
})
export class Faq { ... }
```

`[panel]` — majburiy input (tekshirildi, `.d.ts` da `required: true`): trigger qaysi panelni ochishini aniq bog'laydi. `aria-expanded`, `aria-controls` — avtomatik.

## Kod: dizayn tizimi komponentiga o'rash

Aria primitivlarini to'g'ridan-to'g'ri har sahifada ishlatmang — o'z komponentingizga o'rang:

```ts
@Component({
  selector: 'ui-tabs',
  imports: [Tabs, TabList, Tab, TabPanel, TabContent, NgTemplateOutlet],
  template: `
    <div ngTabs class="ui-tabs">
      <ul ngTabList [(selectedTab)]="selected" class="ui-tabs__list">
        @for (t of tabs(); track t.value) {
          <li ngTab [value]="t.value" class="ui-tabs__tab">{{ t.label }}</li>
        }
      </ul>
      @for (t of tabs(); track t.value) {
        <div ngTabPanel [value]="t.value" class="ui-tabs__panel">
          <ng-template ngTabContent><ng-container [ngTemplateOutlet]="t.template" /></ng-template>
        </div>
      }
    </div>
  `,
})
export class UiTabs {
  readonly tabs = input.required<{ value: string; label: string; template: TemplateRef<unknown> }[]>();
  readonly selected = model<string | undefined>();
}
```

Dizayn tizimi: Aria (xulq) + sizning tokenlaringiz (ko'rinish) + bitta API (`ui-tabs`). FSD'da bu `shared/ui` qatlami.

## Kod: test

```ts
import { TabsHarness, TabHarness } from '@angular/aria/tabs/testing';
```

Harness'lar DOM tuzilmasiga bog'lanmay test yozish imkonini beradi (72-bob). Klaviatura xulqi kutubxona tomonidan test qilingan — sizning testlaringiz **sizning** mantiqingizni tekshirsin (qaysi tab tanlanganda nima yuklanadi).

## Muhandislik nuqtai nazari

**Erishimlilik — funksionallik.** Klaviatura bilan ishlay olmaydigan tabs — ba'zi foydalanuvchilar uchun ishlamaydigan tabs. Aria bu ishni kafolatlaydi, lekin sizdan talab qiladi:

- Ko'rinadigan fokus (`:focus-visible` stillari) — **o'chirmang**.
- Yetarli rang kontrasti.
- `inert` / `aria-*` holatlariga CSS'ni bog'lash (`[aria-selected='true']`), alohida `.active` klass emas — bitta haqiqat manbai.

Aria yangi paket — API rivojlanmoqda. Yangilanishlarda CHANGELOG'ni o'qing.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Tabs'ni `@if` + `(click)` bilan qo'lda | Klaviatura, ARIA yo'q | `@angular/aria/tabs` |
| `inert` panel ko'rinadi deb hayron | Stilsiz — ko'rinish sizda | `[inert] { display: none }` |
| `.active` klass qo'lda | ARIA holati bilan nomuvofiqlik | `[aria-selected='true']` selektori |
| `:focus-visible` outline o'chirilgan | Klaviatura foydalanuvchisi adashadi | Aniq fokus stili |
| `ngAccordionTrigger` da `[panel]` yo'q | Kompilyatsiya xatosi (required) | `#panel="ngAccordionPanel"` bilan bog'lash |
| Har sahifada Aria to'g'ridan-to'g'ri | Stil va API takrorlanadi | `ui-*` komponentga o'rash |

## Amaliyot

1. Mahsulot sahifasi tablarini Aria bilan yozing; faqat klaviatura (Tab, strelkalar) bilan boshqaring.
2. `selectionMode="explicit"` bilan farqni sezing.
3. DevTools → Accessibility panelida rollar va nomlarni tekshiring.
4. FAQ ni Accordion bilan.
5. `ui-tabs` o'rovchi komponentini yozing — dizayn tokenlari bilan.
6. VoiceOver/NVDA bilan tablarni o'qitib ko'ring.

## Rasmiy hujjat

- Angular Aria: <https://angular.dev/guide/aria/overview>
- Tabs: <https://angular.dev/guide/aria/tabs>
- WAI-ARIA naqshlari: <https://www.w3.org/WAI/ARIA/apg/patterns/>
