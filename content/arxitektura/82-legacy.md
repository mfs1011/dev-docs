# 82 — Legacy bilan ishlash

[← Oldingi: Jamoa va Conway qonuni](81-conway.md) · [Mundarija](README.md) · [Keyingi: Evolyutsion arxitektura →](83-evolyutsion-arxitektura.md)

## Tushuncha

Legacy — "eski kod" emas, **o'zgartirishdan qo'rqiladigan kod**: testlar yo'q, muallif ketgan, hujjat yo'q, lekin pul keltiradi. Michael Feathers ta'rifi: *legacy — testlari yo'q kod*.

Ko'p dasturchilarning ishi aynan shu: yangi loyihadan ko'ra mavjud tizimni rivojlantirish. Asosiy qoida — **katta qayta yozishdan qochish**.

| Yondashuv | Ma'no |
| --- | --- |
| **Big bang rewrite** | Hammasini noldan yozish, keyin bir kunda almashtirish — ko'pincha muvaffaqiyatsiz |
| **Strangler fig** | Yangi tizim eskisi atrofida o'sadi, funksiyalar birma-bir ko'chadi |
| **Branch by abstraction** | Kod ichida abstraksiya ortida eski va yangi implementatsiya birga |
| **Anti-corruption layer** | Eski modelni yangisiga "yuqtirmaslik" uchun tarjima qatlami (14-bob) |

## Nega shunday

Qayta yozish nega muvaffaqiyatsiz bo'ladi: eski tizimda **hujjatlanmagan qoidalar** yillar davomida yig'ilgan (har `if` — kimningdir bug report'i); qayta yozish davomida eski tizim ham o'zgaradi (ikki nishon); biznes 1–2 yil yangi funksiyasiz qoladi; yangi tizim "eski kabi ishlashi" kerak — lekin eski qanday ishlashini hech kim bilmaydi.

## Psevdokod: strangler fig

```text
Bosqich 0:   [Klient] → [Legacy monolit]

Bosqich 1:   [Klient] → [Proxy / gateway / BFF] → [Legacy]       ← hech narsa o'zgarmadi, lekin nazorat bor

Bosqich 2:   [Proxy] ── /catalog/*  → [Yangi katalog servisi]
                    └── qolgan hammasi → [Legacy]

Bosqich 3:   /catalog, /search, /cart → yangi;  /checkout, /admin → legacy
...
Bosqich N:   Legacy o'chiriladi (yoki kichik, barqaror qism sifatida qoladi — bu ham normal)

Ma'lumot: yangi servis avval legacy DB'dan o'qiydi (yoki CDC/hodisalar bilan sinxron, 27-bob),
          keyin o'z DB'siga o'tadi — yozish manbai bitta bo'lishi kerak har bosqichda
```

Frontend'da ham xuddi shunday: eski sahifalar (jQuery/server render) qoladi, yangilari SPA yoki mikro-frontend sifatida marshrut bo'yicha qo'shiladi (50-bob).

## Psevdokod: characterization testlari

```text
Maqsad: kod NIMA QILISHINI qayd etish (to'g'ri-noto'g'riligidan qat'i nazar)

test "narx hisoblash — joriy xatti-harakat":
  result = legacyCalculatePrice(cart: fixture("cart-with-promo.json"))
  assert result == snapshot("price-promo.json")       // hozirgi natija — "oltin" fayl

Qadamlar:
  1. o'zgartiriladigan joy atrofida characterization testlari
  2. "tikuv" (seam) toping — bog'liqlikni almashtirish mumkin bo'lgan joy (10-bob: DI)
  3. kichik refaktoring → testlar yashil
  4. yangi xatti-harakat → yangi test
G'alati natija topilsa — tuzatmang, avval biznesdan so'rang: bu bug'mi yoki kimdir unga tayanadi?
```

## Psevdokod: branch by abstraction va parallel ishlatish

```text
interface PriceCalculator { calculate(cart): Money }
  LegacyPriceCalculator  — eski kod o'ralgan
  NewPriceCalculator     — yangi

// Parallel ishlatish (shadow): natijalarni solishtirish, foydalanuvchiga eskisi
calculate(cart):
  old = legacy.calculate(cart)
  async: new_ = next.calculate(cart); if new_ != old: log.warn("price.mismatch", { cart, old, new_ })
  return old

farqlar 0 ga yaqin → flag bilan yangisiga o'tish (80-bob) → eski klass o'chiriladi
```

## Framework'larda

| Vaziyat | Yondashuv | Qayerda |
| --- | --- | --- |
| Eski PHP → Symfony/Laravel | Proxy (nginx / BFF) orqali marshrut bo'yicha ko'chirish | [Arxitektura 69-bob](69-bff.md) |
| Angular NgModule → standalone | Rasmiy migratsiya schematic'lari, bosqichma-bosqich | [Angular 69-bob](../angular/69-ngmodule-migratsiya.md) |
| Vue 2 → 3, Options → Composition | Bosqichma-bosqich reja | [Vue 70-bob](../vue/70-checklist-va-migratsiya.md) |
| Pages Router → App Router | Ikkalasi bir loyihada birga ishlaydi | [Next.js 40](../nextjs/40-migratsiya.md), [41-bob](../nextjs/41-eski-loyiha.md) |
| Mavjud sahifaga React/Vue qo'shish | Orol sifatida — bitta element ichida | [React 04](../react/04-foydalanish-usullari.md), [Vue 04-bob](../vue/04-foydalanish-usullari.md) |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Big bang rewrite | Toza boshlanish | Yuqori xavf, uzoq vaqt qiymatsiz |
| Strangler fig | Qiymat har bosqichda, past xavf | Uzoq davr ikki tizim birga, proxy murakkabligi |
| Shadow ishlatish | Yangi kod real ma'lumotda sinaladi | Ikki marta hisoblash, nojo'ya ta'sirlarni ajratish |
| Legacy'ni qoldirish | Arzon | Ko'nikma yo'qoladi, xavfsizlik yamoqlari |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Testsiz refaktoring | Yashirin qoidalar buziladi | Characterization testlari |
| Ikki tizim bir ma'lumotga yozadi | Nomuvofiqlik | Har bosqichda bitta yozish manbai |
| Ko'chirish oxiriga yetkazilmaydi | Endi ikkita legacy | Har bosqichning aniq tugash mezoni |
| G'alati xatti-harakatni "tuzatish" | Kimdir unga tayangan | Avval biznesdan so'rash |
| Eski modelni yangisiga ko'chirish | Yangi tizim ham legacy | Anti-corruption layer |

## Amaliyot

1. Eng qo'rqinchli modulingizni tanlang va unga 5 ta characterization test yozing.
2. Legacy tizim oldiga proxy qo'yish rejasini chizing: birinchi ko'chadigan marshrut qaysi?
3. Bitta hisoblash funksiyasi uchun shadow solishtirishni joriy qiling.
4. Ko'chirish uchun "tugadi" mezonini yozing (eski kod o'chirildi, trafik 0%).

## Manbalar

- Michael Feathers — *Working Effectively with Legacy Code*
- Martin Fowler — *Strangler Fig Application* <https://martinfowler.com/bliki/StranglerFigApplication.html>
- Sam Newman — *Monolith to Microservices*
