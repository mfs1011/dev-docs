# 80 — Deploy arxitekturasi

[← Oldingi: Ishonchlilik](79-ishonchlilik.md) · [Mundarija](README.md) · [Keyingi: Jamoa va Conway qonuni →](81-conway.md)

## Tushuncha

Deploy arxitekturasi — kod commit'dan production'gacha **qanday, qanchalik tez va qanchalik xavfsiz** yetib borishi. DB migratsiyasi va moslik (expand/contract) 71-bobda; bu bob — muhitlar, pipeline, ehtiyotkor reliz va qaytarish.

Asosiy g'oya: **deploy** (kodni serverga qo'yish) va **reliz** (foydalanuvchiga yoqish) — ikki alohida qaror.

| Tushuncha | Ma'no |
| --- | --- |
| **Muhitlar** | local → CI → staging → production (+ preview har PR uchun) |
| **Artefakt** | Bir marta yig'ilgan image/bundle — hamma muhitda bir xil |
| **Feature flag** | Kod production'da, lekin o'chiq (18-bob) |
| **Canary** | Yangi versiya avval kichik ulushga |
| **Rollback** | Oldingi versiyaga daqiqalarda qaytish |

## Nega shunday

DORA tadqiqotlari bir xil natijani ko'rsatadi: kichik va tez-tez reliz qiladigan jamoalarda **xatolar kamroq** va tiklanish tezroq. Oyda bir katta reliz — 200 ta o'zgarish, buzilganda qaysi biri aybdor ekanini topish qiyin. Kuniga 10 ta kichik deploy — har biri kichik xavf.

DORA'ning to'rt metrikasi: deploy chastotasi, o'zgarish yetkazish vaqti, o'zgarishlarning muvaffaqiyatsizlik ulushi, tiklanish vaqti.

## Psevdokod: pipeline

```text
PR ochildi:
  lint → typecheck → unit testlar → build → integratsion testlar
  → preview muhit (PR uchun alohida URL)  → review

main'ga merge:
  build artefakt (image: app:sha-4f2a1c)  ← BIR MARTA
  → staging deploy → smoke + e2e testlar
  → production: canary 5% → metrikalar → 25% → 100%

Qoidalar:
  - har muhitda bir xil artefakt; farq — faqat konfiguratsiya (18-bob)
  - production'ga qo'lda o'zgartirish yo'q (SSH orqali "tuzatish" — taqiq)
  - pipeline — kod (git'da), review'dan o'tadi
```

## Psevdokod: canary va avtomatik tahlil

```text
deploy v2.15 → trafikning 5%
kuzatish 15 daqiqa, v2.14 bilan solishtirish:
  xatolar ulushi:  v2.15 0.4%  vs  v2.14 0.3%   ✓ (chegara: +0.5%)
  p95 latency:     v2.15 230ms vs  v2.14 210ms  ✓ (chegara: +20%)
  biznes:          checkout konversiyasi        ✓
→ hammasi yaxshi: 25% → 50% → 100%
→ biror chegara buzildi: avtomatik rollback + alert

Frontend canary: CDN/edge darajasida cookie bo'yicha versiya (sticky — foydalanuvchi aralashmasin)
```

## Psevdokod: feature flag turlari

```text
| Tur            | Umri        | Misol                                  |
| Reliz flag     | kunlar-haftalar | yangi checkout — avval ichki xodimlarga |
| Tajriba (A/B)  | haftalar    | ikki xil narx sahifasi                  |
| Ops "kill switch" | doimiy   | og'ir tavsiyalarni yuk paytida o'chirish (79-bob) |
| Ruxsat flag    | doimiy      | premium tarif funksiyalari (aslida — avtorizatsiya) |

if flags.enabled("new-checkout", { userId, tenantId, country }):
  return newCheckout()
return oldCheckout()

Qoida: reliz flag'i 100% bo'lgach — eski yo'l va flag KODDAN O'CHIRILADI (muddat va ega bilan)
```

## Psevdokod: rollback

```text
Rollback — oldingi artefaktni qayta deploy qilish (bir buyruq, < 5 daqiqa)
  shart: DB migratsiyasi orqaga mos (71-bob: expand/contract)
  shart: hodisa/API sxemasi orqaga mos (58-bob)
Roll-forward — tez tuzatish va yangi deploy: kichik o'zgarishlarda, pipeline tez bo'lsa
Flag o'chirish — eng tez "rollback": deploy kerak emas

Frontend: eski bundle chunk'lari CDN'da qoladi — ochiq tablar eski versiya bilan ishlashda davom etadi
  (49-bob), yangilanish taklifi — PWA prompt kabi
```

## Framework'larda

| Mavzu | Qayerda |
| --- | --- |
| Backend deploy | [Symfony 40-bob](../symfony/40-deploy-va-checklist.md), [Laravel 32-bob](../laravel/32-optimallashtirish-va-deploy.md) |
| Frontend deploy | [Vue 67](../vue/67-deploy.md), [Angular 65](../angular/65-prerender-va-deploy.md), [React 48-bob](../react/48-deploy-va-monitoring.md) |
| Next.js | Vercel preview va rollback — [Next.js 47](../nextjs/47-vercel.md); o'z serverida — [48-bob](../nextjs/48-docker-selfhost.md) |
| Konfiguratsiya va flag'lar | [Arxitektura 18-bob](18-konfiguratsiya.md) |
| Flag vositalari | OpenFeature (standart API), Unleash, LaunchDarkly, GrowthBook; Laravel Pennant |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Tez-tez kichik deploy | Kichik xavf, tez feedback | Kuchli avtomatlashtirish talab |
| Canary | Xato kam foydalanuvchiga tegadi | Metrikalar, trafik boshqaruvi |
| Feature flag'lar | Deploy ≠ reliz | Kod murakkabligi, texnik qarz |
| Preview muhitlar | Tez review | Narx, DB/sirlar bilan murakkablik |
| Qo'lda tasdiq bosqichi | Nazorat | Sekinlik, odamlar "ko'r-ko'rona" bosadi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Har muhit uchun alohida build | Staging'da sinalgan ≠ production'dagi | Bitta artefakt |
| Rollback hech qachon sinalmagan | Kerak bo'lganda ishlamaydi | Muntazam mashq |
| Orqaga mos bo'lmagan migratsiya | Rollback imkonsiz | Expand/contract (71-bob) |
| Flag'lar abadiy qoladi | Kombinatsiyalar portlashi | Muddat, ega, tozalash |
| Juma kuni katta reliz | Tunda kuzatuvsiz buzilish | Kichik, kuzatiladigan deploy'lar |
| Canary metrikalarisiz | Faqat "server ishlayapti" | Xato, latency, biznes metrikalari |

## Amaliyot

1. DORA'ning to'rt metrikasini jamoangiz uchun taxminan hisoblang.
2. Pipeline'ingizda artefakt necha marta yig'iladi? Bittaga keltiring.
3. Staging'da rollback'ni bajarib ko'ring va vaqtini o'lchang.
4. Barcha feature flag'lar ro'yxatini tuzing: qaysilari 100% va o'chirilishi kerak?

## Manbalar

- Nicole Forsgren, Jez Humble, Gene Kim — *Accelerate*; DORA <https://dora.dev/>
- Martin Fowler — *Feature Toggles* <https://martinfowler.com/articles/feature-toggles.html>
- OpenFeature <https://openfeature.dev/>
