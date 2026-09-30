# 43 — Dizayn tizimi

[← Oldingi: Ma'lumot qatlami](42-malumot-qatlami.md) · [Mundarija](README.md) · [Keyingi: Marshrutlash arxitekturasi →](44-marshrutlash.md)

## Tushuncha

Dizayn tizimi — UI'ni izchil qiladigan **qarorlar to'plami**, faqat komponentlar kutubxonasi emas:

| Qatlam | Nima | Misol |
| --- | --- | --- |
| **Tokenlar** | Nomlangan dizayn qiymatlari | `color.primary`, `space.4`, `radius.md`, `font.body` |
| **Komponentlar** | Tokenlardan qurilgan UI bloklar | Button, Input, Dialog, Tabs |
| **Naqshlar** | Komponentlar kombinatsiyasi va qoidalari | Forma tartibi, bo'sh holatlar, xato ko'rsatish |
| **Hujjat** | Qachon nima ishlatiladi | Storybook, sayt |

## Nega shunday

Dizayn tizimisiz: 14 xil ko'k rang, 9 xil tugma balandligi, har sahifada boshqacha xato ko'rsatish. Brend rangini o'zgartirish — 300 faylni qidirish. Dark mode — imkonsiz.

Tokenlar — **bitta joyda o'zgartirish**, komponentlar — **bitta joyda to'g'ri qilish** (a11y, fokus, klaviatura).

## Psevdokod: token darajalari

```text
Primitiv (xom qiymat)       blue-600 = #1f5fd6        gray-50 = #f7f8fa
Semantik (ma'no)            color.primary = blue-600  color.surface = gray-50   color.danger = red-600
Komponent (ixtiyoriy)       button.primary.bg = color.primary

Komponentlar FAQAT semantik tokenlarni ishlatadi.
Dark mode = semantik tokenlarni qayta xaritalash:  color.surface → gray-900 (primitivlar o'zgarmaydi)
Brend almashtirish = primitiv/semantik xaritani almashtirish, komponentlarga tegmasdan
```

```text
:root { --color-primary: #1f5fd6; --color-surface: #f7f8fa; }
@media (prefers-color-scheme: dark) { :root { --color-primary: #7aa7ff; --color-surface: #121316; } }
.button-primary { background: var(--color-primary); }
```

## Psevdokod: komponent shartnomasi va versiyalash

```text
Komponent API — ochiq API (11, 39-boblar):
  variant: 'primary' | 'secondary' | 'danger'
  size: 'sm' | 'md' | 'lg'
  Ichki klasslar, DOM tuzilmasi — shartnoma EMAS

Versiyalash (alohida paket bo'lsa):
  patch — xato tuzatish;  minor — yangi variant/komponent;  major — API o'zgarishi
  deprecation: eski prop ishlaydi + ogohlantirish → keyingi major'da olib tashlanadi
  codemod — ko'p iste'molchi bo'lsa avtomatik ko'chirish
```

## Framework'larda

| Qatlam | Angular | React | Vue |
| --- | --- | --- | --- |
| Tayyor tizim | Angular Material, `mat.theme` → `--mat-sys-*` CSS o'zgaruvchilar (`light-dark()` bilan) — [66-bob](../angular/66-material-va-cdk.md) | MUI, Mantine | Vuetify, PrimeVue |
| Headless (o'z dizayningiz) | Angular Aria + CDK — [67-bob](../angular/67-angular-aria.md) | Radix, React Aria | Reka UI, Headless UI |
| Stil yondashuvi | Komponent stillari, `:host` — [30-bob](../angular/30-stil-va-enkapsulatsiya.md) | [React 15-bob](../react/15-uslublar.md) | Scoped CSS — [Vue 11-bob](../vue/11-class-va-style.md) |
| Dizayn tizimi arxitekturasi | — | [React 40-bob](../react/40-dizayn-tizimi.md) | — |

Angular Material'da tekshirilgan misol: `mat.theme` bir marta chaqirilsa — barcha komponentlar semantik CSS o'zgaruvchilaridan foydalanadi, `color-scheme: light dark` bilan dark mode avtomatik. Nuqtaviy o'zgartirish — `mat.button-overrides(...)` tokenlari orqali, ichki klasslarni `::ng-deep` bilan bosish emas. Bu — "tokenlar shartnoma, DOM emas" tamoyilining aniq ko'rinishi.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Tayyor kutubxona (Material, MUI) | Tez, a11y tayyor | Brend dizayniga moslash qiyin, "hamma saytga o'xshash" |
| Headless + o'z stillari | To'liq erkinlik, a11y tayyor | Stil ishi sizda |
| Noldan komponentlar | Maksimal nazorat | A11y va klaviatura — deyarli har doim kamchilik |
| Alohida paket (monorepo) | Bir necha ilova ulashadi | Versiyalash, reliz jarayoni (74-bob) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| HEX ranglar komponentlarda | Dark mode, brend almashtirish imkonsiz | Semantik tokenlar |
| Kutubxona ichki klasslarini bosish | Yangilanishda buziladi | Token/override API |
| ui-kit komponent biznes mantiq biladi | Qayta ishlatib bo'lmaydi | Faqat props/events |
| Storybook/hujjat yo'q | Har kim o'z variantini yozadi | Katalog va qoidalar |
| Fokus stillari o'chirilgan | Klaviatura foydalanuvchisi adashadi | `:focus-visible` token bilan |

## Amaliyot

1. Loyihangizdagi noyob rang qiymatlarini sanang (`grep -o "#[0-9a-f]\{6\}"`). Nechta bo'lishi kerak?
2. Primitiv → semantik token qatlamini kiriting va bitta komponentni unga o'tkazing.
3. Dark mode'ni faqat semantik tokenlarni qayta xaritalash bilan qiling.
4. Eng ko'p takrorlangan UI blokini ui-kit komponentiga ajrating.

## Manbalar

- Brad Frost — *Atomic Design* <https://atomicdesign.bradfrost.com>
- W3C Design Tokens Community Group — format spetsifikatsiyasi <https://www.designtokens.org>
- Nathan Curtis — *Design Systems* maqolalari (EightShapes)
