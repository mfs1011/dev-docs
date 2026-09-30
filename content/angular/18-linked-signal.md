# 18 — `linkedSignal()` — bog'liq, lekin yoziladigan holat

[← Oldingi: effect() va afterRenderEffect()](17-effect.md) · [Mundarija](README.md) · [Keyingi: Reaktiv kontekst qoidalari →](19-reaktiv-kontekst.md)

## Tushuncha

Ba'zi qiymatlar ikki xil yo'l bilan o'zgaradi:

1. **Boshqa signaldan kelib chiqadi** — `computed` kabi;
2. **Foydalanuvchi qo'lda o'zgartiradi** — `signal` kabi.

Misol: yetkazib berish usullari ro'yxati va tanlangan usul. Ro'yxat o'zgarsa — tanlov birinchi usulga qaytishi kerak. Lekin foydalanuvchi boshqasini tanlashi ham mumkin.

```ts
import { linkedSignal, signal } from '@angular/core';

const methods = signal(['Kuryer', 'Pochta', "O'zi olib ketish"]);
const selected = linkedSignal(() => methods()[0]);

selected();                 // 'Kuryer'  — ro'yxatdan kelib chiqdi
selected.set('Pochta');     // qo'lda
selected();                 // 'Pochta'

methods.set(['Express', 'Oddiy']);
selected();                 // 'Express' — ro'yxat o'zgardi, qayta hisoblandi
```

Angular 22 da test bilan tasdiqlandi.

## Nega shunday

`linkedSignal` dan oldin bu vazifa ikki noqulay yo'l bilan hal qilinardi:

```ts
// ❌ 1-yo'l: computed — lekin yozib bo'lmaydi
const selected = computed(() => methods()[0]);
selected.set('Pochta');     // ✘ computed'da set yo'q

// ❌ 2-yo'l: signal + effect — 17-bobdagi yomon naqsh
const selected = signal('');

effect(() => {
  selected.set(methods()[0]);     // effect ichida set
});
```

Ikkinchisining muammolari: bir lahza `selected` bo'sh (effect sinxron emas), qo'shimcha o'zgarishlarni aniqlash sikli, va "nima nimaga bog'liq" ko'rinmaydi.

`linkedSignal` ikkalasini birlashtiradi: **sinxron hisoblanadi** (computed kabi) va **yoziladi** (signal kabi).

## Kod: qisqa shakl

```ts
const selected = linkedSignal(() => methods()[0]);
```

Qoida oddiy: manba signal o'zgarsa — hisoblash funksiyasi qayta ishlaydi va qo'lda yozilgan qiymat **o'chiriladi**.

| Nima bo'ldi | `selected()` |
| --- | --- |
| Boshida | `methods()[0]` |
| `selected.set('Pochta')` | `'Pochta'` |
| Boshqa hech narsa o'zgarmadi | `'Pochta'` qoladi |
| `methods` o'zgardi | Yangi `methods()[0]` — qo'lda tanlov yo'qoldi |

## Kod: to'liq shakl — oldingi qiymatni hisobga olish

Qisqa shaklning kamchiligi: ro'yxat o'zgarsa, tanlov **har doim** yo'qoladi. Ko'pincha kerakli xulq boshqacha: "tanlangan usul yangi ro'yxatda **bor bo'lsa** — qolsin, **yo'q bo'lsa** — birinchisiga qayt".

```ts
const methods = signal(['Kuryer', 'Pochta', "O'zi olib ketish"]);

const selected = linkedSignal<string[], string>({
  source: methods,
  computation: (list, previous) => {
    if (previous && list.includes(previous.value)) {
      return previous.value;          // tanlov hali ham mavjud — saqlaymiz
    }

    return list[0];                   // yo'q — birinchisiga qaytamiz
  },
});
```

Tekshirilgan xulq:

```ts
selected.set('Pochta');

methods.set(['Pochta', 'Express']);
selected();                 // 'Pochta'   — yangi ro'yxatda bor, saqlandi

methods.set(['Express']);
selected();                 // 'Express'  — yo'q, birinchisiga qaytdi
```

`computation` ikki argument oladi:

| Argument | Nima |
| --- | --- |
| `list` | Manbaning **yangi** qiymati |
| `previous` | `{ source, value }` — oldingi manba va oldingi natija; birinchi marta `undefined` |

`source` — `previous.source` bilan solishtirish va `computation` ga toza qiymat berish uchun. Lekin diqqat: `computation` ichida **boshqa signalni o'qisangiz, u ham bog'liqlik bo'ladi** (Angular 22 da tekshirildi):

```ts
const src = signal(1);
const other = signal('a');

const ls = linkedSignal<number, string>({
  source: src,
  computation: (s) => `${s}-${other()}`,
});

ls();              // '1-a'
other.set('b');
ls();              // '1-b' — other o'zgardi, qayta hisoblandi
```

Ya'ni `source` — "yagona bog'liqlik" emas. `computation` xuddi `computed` kabi: ichida o'qilgan har signal kuzatiladi. Faqat `source` o'zgarganda qayta hisoblanishini istasangiz — boshqa o'qishlarni `untracked` ga o'rang.

## Kod: amaliy misollar

**1. Sahifalash — filtr o'zgarsa birinchi sahifaga:**

```ts
export class ProductList {
  protected readonly category = signal('all');
  protected readonly search = signal('');

  // Filtr o'zgarsa — 1-sahifaga qaytadi, lekin foydalanuvchi sahifani o'zi almashtira oladi
  protected readonly page = linkedSignal({
    source: () => ({ category: this.category(), search: this.search() }),
    computation: () => 1,
  });

  protected next() {
    this.page.update((p) => p + 1);
  }
}
```

`source` funksiya bo'lishi mumkin — bir nechta signalni birlashtiradi.

**2. Tahrirlash formasi — tashqaridan kelgan qiymatdan qoralama:**

```ts
export class ProfileEditor {
  readonly user = input.required<User>();

  // Tahrirlanadigan nusxa: user o'zgarsa (boshqa foydalanuvchi ochilsa) — qayta nusxalanadi
  protected readonly draft = linkedSignal(() => ({ ...this.user() }));

  protected rename(name: string) {
    this.draft.update((d) => ({ ...d, name }));
  }

  protected reset() {
    this.draft.set({ ...this.user() });
  }
}
```

`input` faqat o'qiladi (25-bob). Uni tahrirlash kerak bo'lsa — `linkedSignal` bilan lokal nusxa. Bu `model()` (26-bob) va Signal Forms (48-bob) dan oldingi eng oddiy yo'l.

**3. Jadval saralash — ustunlar o'zgarsa, mavjud bo'lmagan ustun bo'yicha saralanmasin:**

```ts
protected readonly columns = input.required<string[]>();

protected readonly sortBy = linkedSignal<string[], string | null>({
  source: this.columns,
  computation: (cols, prev) => (prev?.value && cols.includes(prev.value) ? prev.value : null),
});
```

## Kod: `linkedSignal` va `computed` — tanlov

| Savol | Javob |
| --- | --- |
| Qiymat faqat boshqalardan kelib chiqadimi? | `computed` |
| Foydalanuvchi uni o'zgartira oladimi? | `linkedSignal` |
| Manba o'zgarsa qo'lda tanlov saqlanishi kerakmi? | `linkedSignal` + `previous` |
| Asinxron (serverdan) qiymatmi? | `resource` (20-bob) |

## Muhandislik nuqtai nazari: "effect ichida set" ni qidiring

Mavjud kod bazasida `linkedSignal` ga aylantirish mumkin bo'lgan joylarni topish oson:

```bash
grep -rn "effect(" src/app | xargs grep -l "\.set("
```

Effect ichida bitta signalni boshqasidan kelib chiqib yozayotgan har joy — `linkedSignal` nomzodi. Ko'chirishdan keyin effect yo'qoladi, kod sinxron va tushunarli bo'ladi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `signal` + `effect` bilan sinxronlash | Bir lahza eski qiymat, qo'shimcha sikl | `linkedSignal` |
| Qisqa shakl — tanlov saqlanishi kutilganda | Manba o'zgarsa tanlov har doim yo'qoladi | To'liq shakl + `previous` |
| `computation` ichida signal o'qib, faqat `source` bog'liq deb o'ylash | O'sha signal o'zgarsa ham qayta hisoblanadi — qo'lda tanlov yo'qoladi | Kerak bo'lmasa `untracked(() => ...)` |
| `previous` birinchi marta `undefined` ekanini unutish | `previous.value` da xato | `previous?.value` |
| `input` ni to'g'ridan-to'g'ri o'zgartirishga urinish | `input` da `set` yo'q | `linkedSignal` bilan nusxa |
| Faqat hisoblanadigan qiymat uchun `linkedSignal` | Keraksiz yozish imkoniyati | `computed` |

## Amaliyot

1. Yetkazib berish usullari va tanlangan usulni qisqa shaklda yozing; ro'yxatni almashtirib, tanlov qayta hisoblanishini ko'ring.
2. To'liq shaklga o'tkazing: tanlov yangi ro'yxatda bo'lsa saqlansin.
3. Mahsulot ro'yxatida `page` ni `linkedSignal` qiling: kategoriya yoki qidiruv o'zgarsa 1-sahifa.
4. `ProfileEditor` yozing: `user` kiritmasidan qoralama, "Bekor qilish" — `reset()`.
5. Loyihangizda `effect` ichida `set` qiladigan joyni toping va `linkedSignal` ga o'tkazing.

## Rasmiy hujjat

- `linkedSignal`: <https://angular.dev/guide/signals/linked-signal>
- API: <https://angular.dev/api/core/linkedSignal>
