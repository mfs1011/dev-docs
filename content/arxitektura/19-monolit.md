# 19 — Monolit: to'g'ri qilingan

[← Oldingi: Konfiguratsiya va muhitlar](18-konfiguratsiya.md) · [Mundarija](README.md) · [Keyingi: Modulli monolit →](20-modulli-monolit.md)

## Tushuncha

Monolit — bitta deploy qilinadigan birlik: bitta kod bazasi, bitta jarayon (yoki bir xil nusxalar), odatda bitta ma'lumotlar bazasi. Monolit **yomon** degani emas — u eng oddiy va ko'p hollarda eng to'g'ri boshlanish.

Muammo monolitning o'zida emas, **ichki tartibsizlikda** ("big ball of mud"). Tartibli monolit va tartibsiz monolit — butunlay boshqa narsalar.

| | Tartibsiz monolit | To'g'ri monolit |
| --- | --- | --- |
| Ichki chegaralar | Yo'q — hamma hamma narsani chaqiradi | Modullar, ochiq API (11-bob) |
| Ma'lumot | Har kod har jadvalga yozadi | Har jadval bitta modulga tegishli |
| Deploy | Qo'rqinchli, kam | Tez-tez, avtomatik |
| Testlar | Kam, sekin | Qatlamlangan, tez |

## Nega shunday

Monolitning afzalliklari — ko'pincha kam baholanadi:

| Afzallik | Nega muhim |
| --- | --- |
| **Oddiy deploy** | Bitta artefakt, bitta pipeline |
| **Lokal chaqiruvlar** | Tarmoq kechikishi, qisman xato, versiya nomuvofiqligi yo'q |
| **ACID tranzaksiyalar** | "Buyurtma + to'lov + qoldiq" bitta tranzaksiyada — saga kerak emas |
| **Refaktor oson** | IDE bitta harakatda butun kod bo'ylab nom o'zgartiradi |
| **Debug oson** | Bitta stack trace, bitta log |
| **Kam infratuzilma** | Service mesh, tarqatilgan trace, har servis uchun CI shart emas |

Martin Fowler kuzatishi (*MonolithFirst*): muvaffaqiyatli mikroservis tizimlarining ko'pi monolit sifatida boshlangan; noldan mikroservis bilan boshlanganlarning ko'pi muammoga duch kelgan. Sabab — chegaralar boshida **noma'lum**, noto'g'ri chegara esa tarmoq bilan "betonlanadi" (4-bob).

## Psevdokod: monolit masshtablanadi

"Monolit masshtablanmaydi" — keng tarqalgan afsona:

```text
                    ┌──────────────┐
    so'rovlar ────▶ │ Load balancer│
                    └──────┬───────┘
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    [monolit #1]     [monolit #2]     [monolit #3]      ← gorizontal: bir xil nusxalar (stateless)
          │                │                │
          └────────┬───────┴────────┬───────┘
                   ▼                ▼
              [(DB primary)]──▶[(DB replica)]            ← o'qish replikalari
                   │
              [Redis kesh]  [Navbat + worker'lar]         ← og'ir ishlar fonda
```

Shartlar:
- **Stateless** — sessiya DB/Redis'da, fayllar obyekt storage'da (32-bob), lokal diskda emas.
- Og'ir va sekin ishlar — navbatda (26-bob).
- DB — to'g'ri indekslar (23-bob) va o'qish replikalari.

Bu sxema kuniga millionlab so'rovga bardosh beradi. Ko'p kompaniyalar (Shopify, GitHub, Basecamp) yillar davomida katta monolitlarda ishlagan.

## Psevdokod: monolit qachon og'riydi

```text
Haqiqiy belgilar (sezgi emas):
- Build + test 30+ daqiqa va tezlashtirib bo'lmaydi
- 5+ jamoa bir-birining deploy'ini kutadi (merge konfliktlari, "release poezdi")
- Bitta qismning yuki boshqalardan 100× katta va alohida masshtab kerak
- Bitta qism boshqa texnologiya talab qiladi (ML — Python)
- Bitta qismdagi xato butun tizimni yiqitadi va izolyatsiya qilib bo'lmaydi

Birinchi yechim — modulli monolit (20-bob), keyin kerak bo'lsa — alohida servis (21–22-boblar)
```

## Framework'larda

Symfony va Laravel — **monolit uchun yaratilgan** framework'lar va buni yaxshi qiladi:

| Ehtiyoj | Symfony | Laravel |
| --- | --- | --- |
| Fon ishlari | Messenger — [26-bob](../symfony/26-messenger.md) | Queue — [25-bob](../laravel/25-navbatlar.md) |
| Kesh, lock | Cache, Lock — [28-bob](../symfony/28-cache-lock-httpclient.md) | Cache — [27-bob](../laravel/27-kesh-va-fayllar.md) |
| Rejalashtirilgan ishlar | Scheduler — [25-bob](../symfony/25-console-va-scheduler.md) | Scheduler — [24-bob](../laravel/24-artisan-va-konsol.md) |
| Real vaqt | Mercure — [35-bob](../symfony/35-mercure.md) | Reverb/Echo |
| Deploy | [40-bob](../symfony/40-deploy-va-checklist.md) | [32-bob](../laravel/32-optimallashtirish-va-deploy.md) |

Frontend'da "monolit" — bitta SPA/SSR ilova. U ham to'g'ri boshlanish: lazy bo'limlar ([Angular 43-bob](../angular/43-lazy-loading.md)) bundle'ni bo'ladi, feature papkalari kodni bo'ladi. Mikro-frontendlar (50-bob) — kamdan-kam kerak.

Full-stack monolit variantlari — Laravel + Inertia/Livewire, Symfony + Twig/UX, Next.js (UI + route handlers) — kichik jamoa uchun eng tez yo'l: bitta repo, bitta deploy, API shartnomasi muammosi yo'q.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Monolit | Oddiylik, tezlik, tranzaksiyalar | Katta jamoada muvofiqlashtirish, bitta texnologiya |
| Monolit + ichki chegaralar | Yuqoridagi + kelajakda bo'lish imkoni | Chegaralarni majburlash intizomi |
| Noldan mikroservislar | Mustaqil deploy (nazariyada) | Taqsimlangan tizim narxi birinchi kundan, noto'g'ri chegaralar |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| "Monolit — eskirgan" | Moda qaror | Drayverlarga qarab (3-bob) |
| Stateful monolit (lokal sessiya, lokal fayllar) | Gorizontal masshtab imkonsiz | Holat tashqarida |
| Ichki chegarasiz monolit | "Big ball of mud" | Modullar (20-bob) |
| Sekin build'ni "monolit aybi" deyish | Ko'pincha test va build sozlamasi muammosi | Parallel testlar, kesh |
| Og'ir ishlar so'rov ichida | Sekin javob, timeout | Navbat |

## Amaliyot

1. Ilovangiz stateless'mi? Ikki nusxani load balancer ortida ishga tushiring — nima buziladi?
2. "Monolit og'riydi" belgilaridan qaysilari sizda **haqiqatan** bor?
3. So'rov ichidagi eng sekin 3 ishni toping — ularni navbatga ko'chirish mumkinmi?
4. Build va test vaqtini o'lchang; eng sekin qismini toping.

## Manbalar

- Martin Fowler — *MonolithFirst* <https://martinfowler.com/bliki/MonolithFirst.html>
- DHH — *The Majestic Monolith* <https://signalvnoise.com/svn3/the-majestic-monolith/>
- Shopify Engineering — *Deconstructing the Monolith* <https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity>
