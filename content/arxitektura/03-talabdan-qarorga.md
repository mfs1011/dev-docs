# 03 — Talabdan qarorga

[← Oldingi: Sifat atributlari va trade-off](02-sifat-atributlari.md) · [Mundarija](README.md) · [Keyingi: Chegaralar: modul, kontekst, servis →](04-chegaralar.md)

## Tushuncha

Talablar arxitekturaga to'g'ridan-to'g'ri aylanmaydi. Oraliqda uch qadam bor:

```text
Biznes maqsadi  →  Talablar  →  Arxitektura drayverlari  →  Qarorlar  →  ADR
"sotuvni oshirish"  "mobil orqali    "p95 ≤ 300 ms 3G da"      "SSR + CDN"   "nega SSR"
                     buyurtma"
```

**Arxitektura drayveri** (architecturally significant requirement) — arxitekturani majburan o'zgartiradigan talab. Ko'p talablar drayver emas: "tugma yashil bo'lsin" — yo'q; "to'lov ma'lumoti saqlanmasin (PCI DSS)" — ha.

Drayver turlari:

| Tur | Misol |
| --- | --- |
| Sifat atributi | "Aksiya kuni 20× trafik" |
| Cheklov (constraint) | "Faqat O'zbekistondagi serverlarda", "jamoa PHP biladi", "3 oyda chiqish" |
| Asosiy funksional ssenariy | "Kuryer internetsiz ham buyurtmani yopa olsin" |
| Integratsiya | "1C bilan sinxron", "Click/Payme to'lov" |

## Nega shunday

Eng keng tarqalgan xato — talab **yechim** shaklida keladi: "bizga Kafka kerak", "mikroservis qilaylik", "GraphQL bo'lsin". Bu — talab emas, taklif qilingan qaror. Uning ortidagi haqiqiy ehtiyojni topish kerak:

```text
"Bizga Kafka kerak"
   → Nega?          "Buyurtmalar yo'qolib qolyapti"
   → Qachon?        "Ombor API ishlamay qolganda"
   → Haqiqiy talab: "Tashqi tizim ishlamasa ham buyurtma yo'qolmasin"
   → Variantlar:     DB'dagi outbox jadvali + fon ishchisi (27-bob) — Kafka shart emas
```

"Besh nega" usuli — yechimdan ehtiyojga qaytish.

## Psevdokod: sifat ssenariysi

Noaniq talablarni (**"tez"**, **"ishonchli"**) o'lchanadigan **ssenariy**ga aylantirish (SEI usuli):

```text
Ssenariy: Aksiya kuni yuk
  Manba:     foydalanuvchilar
  Stimul:    odatdagidan 20× ko'p so'rov (10 000 RPS)
  Muhit:     production, aksiya kuni 20:00–22:00
  Artefakt:  katalog va savat
  Javob:     so'rovlar xizmat qilinadi, checkout ishlaydi
  O'lchov:   katalog p95 ≤ 800 ms, checkout xatolari ≤ 0,1%
```

```text
Ssenariy: Ombor tizimi ishlamaydi
  Stimul:    ombor API 30 daqiqa javob bermaydi
  Javob:     buyurtmalar qabul qilinadi, ombor tiklanganda sinxronlanadi
  O'lchov:   yo'qolgan buyurtma = 0; sinxron kechikishi ≤ 5 daqiqa (tiklangandan keyin)
```

Ssenariy yozilgach, qaror o'zi ko'rinadi: birinchisi — kesh, CDN, gorizontal masshtab; ikkinchisi — asinxron integratsiya, outbox, idempotentlik (27, 70-boblar).

## Psevdokod: qaror matritsasi

Bir nechta variantni drayverlar bo'yicha solishtirish:

```text
Drayver (og'irlik)        | Monolit | Modulli monolit | Mikroservislar
--------------------------+---------+-----------------+---------------
3 oyda chiqish (5)        |   5     |       4         |      1
Jamoa 4 kishi (4)         |   5     |       5         |      2
Aksiya kuni 20× (3)       |   3     |       4         |      5
Modullar alohida deploy(1)|   1     |       2         |      5
--------------------------+---------+-----------------+---------------
Jami (ball × og'irlik)    |   61    |       63        |     37
```

Raqamlar sub'ektiv — maqsad aniq javob emas, **bahsni tuzilmali qilish**: kim nimaga qancha og'irlik beradi va nega.

## Framework'larda

Talab → framework imkoniyati xaritasi (qayerda o'qish):

| Talab (drayver) | Qaror | Symfony / Laravel | Frontend |
| --- | --- | --- | --- |
| "Tashqi tizim yiqilsa ham buyurtma yo'qolmasin" | Asinxron navbat, retry | [Symfony Messenger](../symfony/26-messenger.md), [Laravel Queue](../laravel/25-navbatlar.md) | — |
| "Mahsulot sahifasi Google'da topilsin" | SSR/SSG | — | [Angular 63-bob](../angular/63-server-marshrutlar.md), [Next.js 3-bob](../nextjs/03-render-strategiyalari.md), [Vue 58-bob](../vue/58-ssg-va-prerender.md) |
| "Real vaqtda narx yangilansin" | Push kanal | [Symfony Mercure](../symfony/35-mercure.md) | [Next.js 37-bob](../nextjs/37-real-vaqt.md) |
| "Admin kodi oddiy foydalanuvchiga bormasin" | Kod bo'linishi + marshrut guard | — | [Angular 44-bob](../angular/44-guard-va-resolver.md) (`canMatch`) |
| "Ikki tilda" | i18n build/runtime | [Symfony 36-bob](../symfony/36-tarjima-va-intl.md) | [Angular 77-bob](../angular/77-i18n.md), [Vue 66-bob](../vue/66-i18n.md) |

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Hamma talabni oldindan yig'ish (big design up front) | Kam kutilmagan narsa | Sekin; talablar baribir o'zgaradi |
| Faqat birinchi sprint talablari | Tez start | Qimmat drayver kech topiladi (masalan, "ma'lumot O'zbekistonda") |
| **Drayverlarni erta, tafsilotni kech** | Qimmat qarorlar asosli, arzonlari moslashuvchan | Drayverni tafsilotdan ajrata bilish kerak |

Cheklovlarga alohida e'tibor: ular muzokara qilinmaydi va eng ko'p variantni kesadi. "Jamoa faqat PHP biladi" — Go mikroservislarini kitobdagi har qanday afzallikdan kuchliroq istisno qiladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Yechimni talab sifatida qabul qilish | Haqiqiy ehtiyoj yashirinadi | "Besh nega" |
| "Tez", "xavfsiz" — raqamsiz | Tekshirib bo'lmaydi | Sifat ssenariysi |
| Cheklovlarni oxirida bilish | Tanlangan arxitektura yaroqsiz | Birinchi uchrashuvda so'rash |
| Barcha talab teng muhim | Ziddiyatda qaror yo'q | Og'irliklar, drayverlarni ajratish |
| Talablar faqat backlog'da, arxitekturada iz yo'q | "Nega shunday qildik?" javobsiz | Har drayver → qaror → ADR |

## Amaliyot

1. Loyihangizdagi 3 ta "yechim ko'rinishidagi talab"ni toping va "besh nega" bilan haqiqiy ehtiyojga qaytaring.
2. Eng muhim 2 drayver uchun sifat ssenariysi yozing (manba, stimul, javob, o'lchov).
3. Joriy yoki rejadagi katta qaror uchun 3 variantli qaror matritsasini to'ldiring.
4. Loyihaning barcha cheklovlarini ro'yxatlang: huquqiy, jamoa, vaqt, budjet, mavjud tizimlar.

## Manbalar

- Len Bass va boshq. — *Software Architecture in Practice*: quality attribute scenarios
- SEI — *Architecture Tradeoff Analysis Method (ATAM)*
- Michael Keeling — *Design It!*, 5–7-boblar
