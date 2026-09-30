# 14 — DDD: til va kontekst

[← Oldingi: Domen modeli](13-domen-modeli.md) · [Mundarija](README.md) · [Keyingi: Qatlamli, olti burchakli, Clean →](15-qatlamli-arxitektura.md)

## Tushuncha

Domain-Driven Design'ning **strategik** qismi — kodni biznes tuzilishiga moslash. Uch asosiy tushuncha:

| Tushuncha | Nima |
| --- | --- |
| **Ubiquitous language** (umumiy til) | Biznes va dasturchilar bir xil so'zlarni bir xil ma'noda ishlatadi — kodda ham |
| **Bounded context** | Bitta model va til amal qiladigan chegara |
| **Context map** | Kontekstlar o'rtasidagi munosabatlar xaritasi |

Asosiy g'oya: **bitta universal model yo'q**. "Mahsulot" savdo bo'limi uchun — rasm, tavsif, narx; ombor uchun — og'irlik, joylashuv, qoldiq; buxgalteriya uchun — tannarx, soliq stavkasi. Hammasini bitta `Product` klassiga yig'ish — 80 maydonli, hamma uchun noqulay ob'ekt.

## Nega shunday

Til nomuvofiqligi — arxitektura xatolarining yashirin manbai:

```text
Biznes:       "Buyurtma tasdiqlanganda..."
Dasturchi A:  status = "confirmed"     (to'lov o'tdi deb tushungan)
Dasturchi B:  status = "approved"      (menejer ko'rib chiqdi deb tushungan)
Kod:          ikkalasi ham bor, farqi hech kimga noma'lum
```

Umumiy til buni hal qiladi: "tasdiqlangan" = aniq bir biznes hodisasi, kodda — aniq bir nom (`OrderConfirmed`), glossariyda — ta'rif.

## Psevdokod: bitta so'z — ikki kontekst

```text
context Catalog:
    class Product { id; title; description; images; price; category }

context Warehouse:
    class StockItem { sku; weight; location: Shelf; quantityOnHand; reserved }

context Billing:
    class BillableItem { sku; costPrice; vatRate }

// Ular bir-biriga ID (sku) orqali bog'lanadi, ob'ekt orqali emas.
// Har kontekst o'z modelini o'z ehtiyojiga ko'ra o'zgartiradi.
```

## Diagramma: context map — munosabat turlari

```text
┌──────────────┐   Customer/Supplier   ┌──────────────┐
│   Ordering   │ ◀──────────────────── │   Catalog    │   Catalog (upstream) Ordering ehtiyojini hisobga oladi
└──────┬───────┘                        └──────────────┘
       │ Published language (OrderPlaced hodisasi)
       ▼
┌──────────────┐        ACL            ┌──────────────┐
│  Warehouse   │ ─────────────────────▶│  1C (legacy) │   Anti-Corruption Layer — 1C modeli bizning modelimizga kirmaydi
└──────────────┘                        └──────────────┘

┌──────────────┐     Conformist        ┌──────────────┐
│   Billing    │ ─────────────────────▶│ Click/Payme  │   Tashqi API'ni o'zgartira olmaymiz — moslashamiz
└──────────────┘                        └──────────────┘
```

| Munosabat | Ma'no | Qachon |
| --- | --- | --- |
| **Partnership** | Ikki jamoa birga rejalashtiradi | Qattiq bog'liq, bir maqsad |
| **Customer/Supplier** | Upstream downstream ehtiyojini hisobga oladi | Ichki jamoalar |
| **Conformist** | Downstream upstream modelini qabul qiladi | Tashqi API, kuch yo'q |
| **Anti-Corruption Layer** | Tarjima qatlami — begona model ichkariga kirmaydi | Legacy, sifati past tashqi tizim |
| **Open Host / Published Language** | Hammaga ochiq, hujjatlashtirilgan shartnoma | Ko'p iste'molchi |
| **Shared Kernel** | Umumiy kichik model | Ehtiyotkorlik bilan — bog'lanish kuchli |

## Psevdokod: Anti-Corruption Layer

```text
// 1C javobi (o'z nomlari, o'z formati): { "Nomenklatura": "...", "Ostatok": "12,000", "EdIzm": "sht" }
class OneCStockAdapter implements StockProvider:
    getStock(sku): Stock
        raw = oneC.fetch(sku)
        return Stock(
            sku = Sku(raw["Kod"]),
            quantity = parseQuantity(raw["Ostatok"], raw["EdIzm"]),   // "12,000" → 12
        )
// Ichki kod faqat Stock ni biladi. 1C almashtirilsa — faqat adapter.
```

Tashqi tizimning nomlari va formati (vergulli son, qisqartmalar) adapterdan ichkariga o'tmaydi — ACL'ning ma'nosi aynan shu.

## Psevdokod: kontekstlarni topish — event storming

Domen ekspertlari bilan birga devorga hodisalarni yopishtirish:

```text
[Mahsulot qo'shildi] [Narx o'zgardi] | [Savatga qo'shildi] [Buyurtma berildi] [To'lov o'tdi] |
[Tovar band qilindi] [Jo'natildi] | [Hisob-faktura yaratildi]
             ↑ katalog              ↑ savdo                               ↑ ombor          ↑ buxgalteriya
```

Hodisalar guruhlari, til o'zgaradigan joylar va turli "egalar" — kontekst chegaralariga nomzodlar.

## Framework'larda

DDD framework'ga bog'liq emas, lekin framework tuzilmasi uni osonlashtirishi yoki qiyinlashtirishi mumkin:

- **Backend:** har bounded context — alohida modul (namespace, papka), o'z entity'lari va DB sxemasi yoki jadval prefiksi bilan. Modulli monolitda kontekstlar bir deployda (20-bob). Symfony'da modullar tuzilishi — [Symfony 39-bob](../symfony/39-arxitektura.md); kontekstlararo hodisalar — [Symfony 26-bob](../symfony/26-messenger.md), [Laravel 26-bob](../laravel/26-hodisalar-va-observerlar.md).
- **Frontend:** kontekst chegaralari ko'pincha **feature** va **entity** qatlamlariga aylanadi — FSD'da `entities/product` va `entities/stock-item` alohida. Katta frontend'da bir xil backend kontekstlari bilan mos kelgan papka tuzilishi — navigatsiyani osonlashtiradi.
- **API:** har kontekst o'z API'si bilan (Published Language) — frontend "universal Product" emas, sahifaga kerakli kontekst ma'lumotini oladi; kerak bo'lsa BFF birlashtiradi (69-bob).

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Bitta universal model | Takror yo'q (ko'rinishda) | Hamma uchun noqulay, hamma o'zgarishga bog'liq |
| Bounded context'lar | Har soha o'z modelida erkin | Kontekstlar orasida tarjima, ma'lumot takrorlanishi |
| ACL | Begona model izolyatsiyasi | Qo'shimcha qatlam va xaritalash kodi |
| Shared kernel | Kam takror | Kuchli bog'lanish — ikkala jamoa kelishishi shart |

**Kichik loyihada DDD strategik qismi** — ko'pincha faqat umumiy til va glossariy: bu arzon va darhol foyda beradi. Context map — tizim 3+ jamoa yoki 3+ tashqi integratsiyaga yetganda.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Bitta `Product` hamma uchun | 80 maydon, hamma bog'langan | Kontekst bo'yicha modellar |
| Koddagi nomlar biznes tilidan farq qiladi | Tarjimada xatolar | Umumiy til, glossariy |
| Tashqi tizim modeli ichkariga kiradi | Legacy qarorlar sizning kodingizni belgilaydi | ACL |
| Kontekstni texnik belgi bo'yicha ajratish ("API konteksti") | Biznes chegarasi emas | Til va ega bo'yicha |
| DDD = faqat entity/repository | Strategik qism (eng qimmatli) e'tibordan chetda | Avval til va kontekstlar |

## Amaliyot

1. Loyihangiz uchun 15–20 so'zli glossariy tuzing; har so'z uchun — kodda qanday nomlangan?
2. Bir so'zni tanlang va u nechta ma'noda ishlatilishini toping.
3. Tizimingizning context map'ini chizing, tashqi tizimlar va munosabat turlari bilan.
4. Eng "iflos" tashqi integratsiya uchun ACL bormi? Yo'q bo'lsa — rejasini tuzing.

## Manbalar

- Eric Evans — *Domain-Driven Design*, IV qism
- Vlad Khononov — *Learning Domain-Driven Design*
- Alberto Brandolini — *Introducing EventStorming*
- DDD Crew context mapping: <https://github.com/ddd-crew/context-mapping>
