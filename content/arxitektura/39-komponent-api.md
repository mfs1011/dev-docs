# 39 — Komponent API dizayni

[← Oldingi: Modul tuzilmasi](38-modul-tuzilmasi.md) · [Mundarija](README.md) · [Keyingi: Holat turlari →](40-holat-turlari.md)

## Tushuncha

Komponent — kichik modul: uning **ochiq API**si (11-bob) — kiritmalar (input/props), chiqishlar (output/events), slotlar (kontent proyeksiyasi). Yaxshi komponent API'si — oson ishlatiladi, noto'g'ri ishlatish qiyin, va ichki o'zgarishlar iste'molchini buzmaydi.

Uch asosiy uslub:

| Uslub | G'oya | Misol |
| --- | --- | --- |
| **Konfiguratsiya** | Ko'p input bilan boshqarish | `<Table columns=... sortable pageSize=... />` |
| **Kompozitsiya** | Kichik qismlardan yig'ish | `<Tabs><Tab>…</Tab></Tabs>` |
| **Headless** | Xulq-atvor beriladi, ko'rinish — sizda | Aria/Radix/Headless UI |

## Nega shunday

Konfiguratsiya uslubi boshida qulay, lekin har yangi talab — yangi input: `showHeader`, `headerIcon`, `headerAlign`, `headerTemplate`… 30 input'li komponent — hech kim to'liq tushunmaydi, har kombinatsiya test qilinmagan. Kompozitsiya esa moslashuvchanlikni **iste'molchiga** beradi.

## Psevdokod: konfiguratsiyadan kompozitsiyaga

```text
// Konfiguratsiya — har variant uchun yangi input
<Card title="Buyurtma" subtitle="#42" icon="box" showFooter footerText="Jami" footerAction="Pay" />

// Kompozitsiya — tuzilma iste'molchida
<Card>
  <CardHeader><Icon name="box" /> Buyurtma <small>#42</small></CardHeader>
  <CardBody>…</CardBody>
  <CardFooter>Jami <Button>To'lash</Button></CardFooter>
</Card>
```

Qoida: **tuzilma o'zgaruvchan bo'lsa — kompozitsiya**, faqat qiymatlar o'zgarsa — input.

## Psevdokod: API tamoyillari

```text
1. Minimal: faqat kerakli input — keyin qo'shish oson, olib tashlash qiyin
2. Aniq tiplar: variant: 'primary' | 'secondary' | 'danger'  (boolean to'plami emas: primary, secondary, danger)
3. Mustaqil boolean'lardan qoching: isLoading + isError + isEmpty → state: 'loading' | 'error' | 'empty' | 'ready'
4. Boshqariladigan va boshqarilmaydigan:  value + valueChange (tashqi holat)  YOKI  defaultValue (ichki holat)
5. Nomlash — domen tili emas, UI tili (ui-kit darajasida): Button "danger", "deleteUser" emas
6. Erishimlilik — API'ning bir qismi: label, aria-* ni o'tkazish imkoni
```

## Psevdokod: boshqariladigan komponent

```text
// Boshqarilmaydigan — o'z holati
<DatePicker defaultValue="2026-10-01" />

// Boshqariladigan — holat tashqarida (forma, URL, store)
<DatePicker [value]="date()" (valueChange)="date.set($event)" />
<DatePicker [(value)]="date" />              // ikki tomonlama qisqa yozuv

Ikkala rejimni qo'llash — kutubxona komponentlari uchun; ilova komponentlari uchun odatda bittasi yetarli
```

## Framework'larda

| Tushuncha | Angular | React | Vue |
| --- | --- | --- | --- |
| Kiritma | `input()`, `input.required()` — [25-bob](../angular/25-input.md) | props — [React 11-bob](../react/11-props.md) | `defineProps` — [Vue 22-bob](../vue/22-props.md) |
| Chiqish | `output()` — [26-bob](../angular/26-output-va-model.md) | callback props | `defineEmits` — [Vue 23-bob](../vue/23-emits.md) |
| Ikki tomonlama | `model()` — [26-bob](../angular/26-output-va-model.md) | `value` + `onChange` | `defineModel` — [Vue 24-bob](../vue/24-komponent-v-model.md) |
| Kompozitsiya | `ng-content`, ko'p slot — [28-bob](../angular/28-kontent-proyeksiyasi.md) | `children` — [React 14-bob](../react/14-kompozitsiya.md) | slotlar — [Vue 26-bob](../vue/26-slotlar.md) |
| Xulq kompozitsiyasi | `hostDirectives` — [29-bob](../angular/29-host-va-host-directives.md) | custom hooks | composables |
| Headless primitivlar | Angular Aria — [67-bob](../angular/67-angular-aria.md) | Radix, React Aria | Headless UI, Reka UI |

Forma kontrollari uchun maxsus shartnoma — Angular'da `FormValueControl` (`value = model()`), eski `ControlValueAccessor` ([Angular 51, 54-boblar](../angular/54-cva-va-template-driven.md)); Vue'da `defineModel`. Bu — "boshqariladigan komponent" tamoyilining framework shakli.

## Trade-off

| Uslub | Yutuq | Narx |
| --- | --- | --- |
| Konfiguratsiya | Ishlatish oddiy, bir xillik | Input portlashi, moslashuvchanlik past |
| Kompozitsiya | Moslashuvchan, kichik qismlar | Ko'proq markup, noto'g'ri yig'ish mumkin |
| Headless | To'liq dizayn erkinligi, a11y tayyor | Stilni o'zingiz yozasiz |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| 20+ input | Tushunib bo'lmaydi | Kompozitsiya, slotlar |
| Mustaqil boolean'lar holat uchun | Imkonsiz kombinatsiyalar | Bitta `state` union |
| Komponent ichida API chaqiruvi (ui-kit'da) | Qayta ishlatib bo'lmaydi | Ma'lumot tashqaridan |
| Input'ni ichkarida o'zgartirish | Bir tomonlama oqim buziladi | `output`/`model` |
| `aria-*` o'tkazib bo'lmaydi | Erishimlilik cheklanadi | Atributlarni host'ga o'tkazish |

## Amaliyot

1. Eng ko'p input'li komponentingizni toping va kompozitsiya variantini eskizlang.
2. Mustaqil boolean'lar to'plamini bitta `state`/`variant` tipiga almashtiring.
3. Bitta forma kontrolini boshqariladigan shartnomaga (`model`/`defineModel`) o'tkazing.
4. ui-kit komponentlaringizda API chaqiruvi yoki store'ga bog'liqlik bormi — tekshiring.

## Manbalar

- Kent C. Dodds — *Compound Components*, *Inversion of Control* <https://kentcdodds.com/blog/inversion-of-control>
- React — *Thinking in React*
- Adobe — *React Aria* (headless yondashuv) <https://react-spectrum.adobe.com/react-aria/>
