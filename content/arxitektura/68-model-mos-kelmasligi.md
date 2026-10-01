# 68 — Model mos kelmasligi

[← Oldingi: Cheklovlar shartnomasi](67-cheklovlar.md) · [Mundarija](README.md) · [Keyingi: BFF va API gateway →](69-bff.md)

## Tushuncha

Bitta biznes tushunchasi tizimda kamida **uch xil modelda** yashaydi — va ular bir xil bo'lmasligi kerak:

```text
Domen modeli (backend ichi)      API modeli (shartnoma)             UI modeli (frontend)
Order                            OrderDto                           OrderView / OrderFormModel
  - invariantlar, metodlar         - JSON, barqaror, versiyalangan    - sahifaga moslangan
  - markPaid(), cancel()           - { id, status, total: Money }     - { statusLabel, canCancel,
  - ichki holat mashinasi          - ichki tafsilot yo'q                  totalFormatted, age: number|null }
  - DB bilan bog'langan (ORM)                                          - forma: bo'sh maydonlar null
```

Va to'rtinchisi — **DB sxemasi** (jadvallar, ustunlar), u ham domen modelidan farq qilishi mumkin.

## Nega shunday

Hammasini bitta model qilish — eng keng tarqalgan "tejash" va eng qimmat xato:

| Bitta model bo'lsa | Oqibat |
| --- | --- |
| Entity to'g'ridan-to'g'ri JSON'ga | DB ustuni nomini o'zgartirish — API'ni buzadi; `password_hash` tasodifan javobga tushadi |
| API DTO — forma modeli | `age: number` deb tiplangan, forma esa bo'sh maydonda `null` beradi — tip yolg'on |
| UI holati domen modelida | Backend'ga `isExpanded` kabi maydonlar sizib kiradi |
| Frontend biznes qoidasini takrorlaydi | Ikki joyda — nomuvofiqlik (62-bob, `_actions`) |

Har model **boshqa sababga ko'ra o'zgaradi** (8-bob, S tamoyili): domen — biznes qoidalari bilan, API — shartnoma jarayoni bilan (sekin), UI — dizayn bilan (tez). Bitta model — ularni bir-biriga zanjirlaydi.

## Psevdokod: o'giruvchilar (mapper) — chegaralarda

```text
// Backend: domen → API
function toOrderDto(order: Order, user): OrderDto
    return {
      id: order.id.toString(),
      status: order.status.value,                      // ichki enum → barqaror satr
      total: { amount: order.total().minor, currency: order.total().currency },
      createdAt: order.placedAt.toIso8601(),
      _actions: { cancel: policy.can(user, "cancel", order) },
    }

// Frontend: API → UI
function toOrderView(dto: OrderDto): OrderView
    return {
      id: dto.id,
      statusLabel: t("order.status." + dto.status),      // noma'lum status — standart yorliq
      totalFormatted: formatMoney(dto.total, locale),
      canCancel: dto._actions.cancel,
    }

// Frontend: forma → API
function toCreateOrderDto(form: OrderFormModel): CreateOrderDto
    return { items: form.items.filter(i => i.qty > 0).map(...), promoCode: form.promo.trim() || undefined }
```

O'giruvchi — **sof funksiya**: oson test qilinadi (35, 52-boblar), bir joyda yashaydi, shartnoma o'zgarsa — faqat u o'zgaradi.

## Psevdokod: qachon modellarni birlashtirish mumkin

```text
Oddiy CRUD (sozlamalar, ma'lumotnoma):
  domen ≈ API ≈ UI — alohida modellar marosim bo'lib qoladi
  → bitta DTO + kerakli joyda kichik moslashtirish yetarli

Murakkab domen (buyurtma, to'lov, ombor):
  → alohida modellar, aniq o'giruvchilar

Qoida: farq paydo bo'lganda ajrating — "ehtimol farq bo'ladi" deb oldindan emas (6-bob).
```

## Framework'larda

| Chegara | Backend | Frontend |
| --- | --- | --- |
| Domen → API | Symfony Serializer guruhlari / DTO — [Symfony 20-bob](../symfony/20-serializer-va-dto.md); Laravel API Resource — [Laravel 20-bob](../laravel/20-api-resurslar.md) | — |
| API → UI | — | `computed`/selektorlar; API tiplari OpenAPI'dan (54-bob) |
| Forma → API | — | `toDto()` — [Angular 53-bob](../angular/53-tiplangan-reactive-forms.md), Signal Forms modeli — [48-bob](../angular/48-signal-forms-model.md) |
| Runtime parse | — | Zod — chegarada (12-bob) |
| Next.js | Server Component'dan klientga faqat kerakli maydonlar — [Next.js 4-bob](../nextjs/04-server-klient-chegarasi.md) | — |

Next.js'da bu chegara ayniqsa xavfli: server komponentdan klient komponentga uzatilgan ob'ekt **brauzerga ketadi**. Butun DB yozuvini prop sifatida berish — ichki maydonlarni oshkor qiladi.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Bitta model hamma joyda | Kam kod | Bog'lanish, sizib chiqish, yolg'on tiplar |
| Har chegarada alohida model | Har qatlam erkin o'zgaradi | O'giruvchi kodi, takrorlanishga o'xshash ko'rinish |
| Avtomatik mapper kutubxonalari | Kam qo'l kodi | "Sehr", xatolar ish vaqtida, maydon tasodifan o'tib ketadi |
| Qo'lda yozilgan o'giruvchilar | Aniq, tipli, test qilinadi | Ko'proq yozish |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Entity'ni to'g'ridan-to'g'ri `json_encode` | Maxfiy maydonlar sizadi, DB sxemasi = API | DTO / Resource |
| API tipini forma modeli sifatida | Bo'sh qiymatlar, formatlar — tip yolg'on | Alohida forma modeli + `toDto` |
| Frontend formatlangan qiymatni API'ga yuboradi ("890 000 so'm") | Backend parse qilolmaydi | API — xom qiymat, formatlash — UI'da |
| Server komponentdan butun DB yozuvi | Brauzerga oshkor | Faqat kerakli maydonlar |
| O'giruvchilar komponentlarga tarqalgan | Shartnoma o'zgarsa — ko'p joy | Ma'lumot qatlamida bitta joy |

## Amaliyot

1. Eng muhim resursingiz uchun domen, API va UI modellarini yonma-yon yozing — qayerda ular aralashgan?
2. API javoblaringizda ichki maydonlar (`password_hash`, `deleted_at`, ichki ID'lar) bormi — tekshiring.
3. Bitta forma uchun forma modeli va `toDto` o'giruvchisini ajrating, unit test yozing.
4. Frontend'da UI modeliga o'girish qayerda bo'layotganini toping va bitta joyga yig'ing.

## Manbalar

- Martin Fowler — *Data Transfer Object* <https://martinfowler.com/eaaCatalog/dataTransferObject.html>
- Eric Evans — *Domain-Driven Design* (model chegaralari)
- Mark Seemann — *Code That Fits in Your Head* (chegaralarda parse va o'girish)
