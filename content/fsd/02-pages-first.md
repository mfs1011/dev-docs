# 02 — Pages-first: v2.1 fikrlash modeli

[← Oldingi: FSD nima va qachon kerak](01-kirish.md) · [Mundarija](README.md) · [Keyingi: Qatlamlar →](03-qatlamlar.md)

## Qisqacha

FSD 2.1 ning asosiy o'zgarishi — **sahifalardan boshlash**. Avval ilovani sahifalarga bo'lasiz, har sahifa o'z UI'si, so'rovlari va holatini **o'z ichida** saqlaydi. Umumiy poydevor — `shared`'da. Biror kod **haqiqatan** bir nechta sahifada kerak bo'lgandagina u pastroq qatlamga (`widgets`, `features`, `entities`) tushiriladi.

Ko'p ilova uchun shu yetarli: `app` + `pages` + `shared`. Rasmiy qo'llanmadagi Medium kloni (Conduit) ham shu uch qatlamga sig'adi.

## Qoida

v2.0 va v2.1 orasidagi farq:

| | v2.0 ("pastdan yuqoriga") | v2.1 ("pages-first") |
| --- | --- | --- |
| Boshlanish nuqtasi | Entity va feature'larni topish, hatto eng kichik interaktiv bo'laklarni ham | Sahifalar ro'yxati |
| Mantiq qayerda | Asosan `entities` va `features`'da; sahifa — faqat yig'uvchi | Asosan sahifa ichida |
| Pastga tushirish | Oldindan, "kelajakda kerak bo'ladi" deb | Kechiktirilgan: qayta ishlatish paydo bo'lganda |
| Buzuvchi o'zgarish | — | Yo'q: v2.0 loyiha v2.1 da ham to'g'ri |

Rasmiy hujjatning muhim fikri: **qatlam — slice'lar uchun global nomlar maydoni**. Bir marta ishlatiladigan o'zgaruvchini global scope'ga chiqarmaganingiz kabi, bir sahifada ishlatiladigan narsaga `features/` yoki `entities/`'da joy ajratmang.

## Shablon: minimal boshlanish

```text
src/
├── app/
│   ├── routes/            marshrutlar konfiguratsiyasi
│   ├── styles/            global stil, reset
│   └── providers/         query client, tema, i18n (framework'ga qarab)
├── pages/
│   ├── feed/
│   │   ├── ui/            FeedPage, ArticlePreview, TagList, Pagination
│   │   ├── api/           loadArticles, loadTags, likeArticle
│   │   ├── model/         tanlangan teg, joriy sahifa (kerak bo'lsa)
│   │   └── index.ts
│   ├── sign-in/           login va ro'yxatdan o'tish — bitta slice (o'xshash sahifalar)
│   ├── article-read/
│   ├── article-edit/
│   ├── profile/
│   └── settings/
└── shared/
    ├── ui/                Button, Input, Card — dizayn tizimi
    ├── api/               HTTP klient, umumiy tiplar
    ├── config/            env, global flag'lar
    └── routes/            marshrut konstantalari
```

## Kod: sahifa ichida hammasi, keyin ajratish

Boshlanishda `ArticlePreview` faqat feed sahifasida — u sahifa ichida yashaydi:

::: react
```tsx
// pages/feed/ui/FeedPage.tsx
import { useQuery } from '@tanstack/react-query'
import { loadArticles } from '../api/load-articles'      // slice ichida — nisbiy import
import { ArticlePreview } from './ArticlePreview'

export function FeedPage() {
  const { data } = useQuery({ queryKey: ['articles'], queryFn: loadArticles })
  return <main>{data?.articles.map((a) => <ArticlePreview key={a.slug} article={a} />)}</main>
}
```
:::

::: vue
```vue
<!-- pages/feed/ui/FeedPage.vue -->
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { loadArticles } from '../api/load-articles'      // slice ichida — nisbiy import
import ArticlePreview from './ArticlePreview.vue'

const { data } = useQuery({ queryKey: ['articles'], queryFn: loadArticles })
</script>

<template>
  <main>
    <ArticlePreview v-for="a in data?.articles" :key="a.slug" :article="a" />
  </main>
</template>
```
:::

::: angular
```ts
// pages/feed/ui/feed-page.ts
import { Component } from '@angular/core'
import { httpResource } from '@angular/common/http'
import { articlesUrl, type ArticleList } from '../api/articles'   // slice ichida — nisbiy import
import { ArticlePreview } from './article-preview'

@Component({
  selector: 'app-feed-page',
  imports: [ArticlePreview],
  template: `
    <main>
      @for (a of articles.value()?.articles; track a.slug) {
        <app-article-preview [article]="a" />
      }
    </main>
  `,
})
export class FeedPage {
  protected readonly articles = httpResource<ArticleList>(() => articlesUrl())
}
```
:::

Keyin profil sahifasida ham xuddi shu maqola kartasi kerak bo'ldi. Endi — va faqat endi — uni pastga tushirasiz:

```text
Oldin                                   Keyin
pages/feed/ui/ArticlePreview      →     entities/article/ui/ArticlePreview   (ikki sahifa ishlatadi)
pages/profile/ui/ (nusxa bor edi)       entities/article/index.ts → export { ArticlePreview }
                                        pages/feed, pages/profile → import from '@/entities/article'
```

Qaysi qatlamga tushirish — 19-bobdagi qaror daraxti bo'yicha: biznes obyektining ko'rinishi → `entities`; foydalanuvchi harakati ("like", "follow") → `features`; katta mustaqil blok → `widgets`; biznesdan xoli UI → `shared/ui`.

## Qachon / qachon emas

| Pastga tushiring | Sahifada qoldiring |
| --- | --- |
| 2+ sahifa ishlatadi va ular **bir xil** o'zgaradi | Faqat bitta sahifa ishlatadi |
| Biznes qoidasi bir joyda bo'lishi shart (narx hisoblash) | "Kelajakda kerak bo'lishi mumkin" |
| Ikki nusxa allaqachon bir-biridan farqlana boshladi va bu xato | Ikki sahifada o'xshash, lekin har biri o'z yo'lida o'zgaradi |

Nusxa ko'chirish ba'zan to'g'ri yechim: ikkita o'xshash, lekin mustaqil o'zgaradigan komponent — noto'g'ri abstraksiyadan arzonroq.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Loyiha boshida `entities/` va `features/`'ni to'ldirish | Bo'sh yoki bir martalik slice'lar, navigatsiya qiyin | Sahifalardan boshlash |
| Sahifa — faqat 10 qatorlik "yig'uvchi" | Mantiq tarqoq, sahifani tushunish uchun 8 slice'ni ochish kerak | Sahifaga xos kod sahifada |
| Bir sahifa boshqasidan import qiladi | Import qoidasi buziladi | Umumiy qismni pastga tushirish |
| Takrorlanish paydo bo'lganda ham ajratmaslik | Bir qoida ikki joyda, farqlanib ketadi | Qayta ishlatish paydo bo'lgan zahoti ajratish |
| v2.0 loyihani "buzilgan" deb qayta yozish | Buzuvchi o'zgarish yo'q | Steiger bilan bosqichma-bosqich birlashtirish (33, 36-boblar) |

## Manbalar

- Rasmiy: *Migration from v2.0 to v2.1* <https://feature-sliced.design/docs/guides/migration/from-v2-0>
- Rasmiy: *Tutorial* (Conduit misoli) <https://feature-sliced.design/docs/get-started/tutorial>
- Arxitektura qo'llanmasi: [6-bob — Abstraksiya darajalari](../arxitektura/06-abstraksiya.md)
