# 05 — Bog'liqlik va bog'lanish

[← Oldingi: Chegaralar: modul, kontekst, servis](04-chegaralar.md) · [Mundarija](README.md) · [Keyingi: Abstraksiya darajalari →](06-abstraksiya.md)

## Tushuncha

Ikki tushuncha — arxitektura sifatining asosiy o'lchovi:

| Tushuncha | Savol | Maqsad |
| --- | --- | --- |
| **Cohesion** (ichki bog'liqlik) | Modul ichidagi narsalar bir maqsadga xizmat qiladimi? | **Yuqori** |
| **Coupling** (tashqi bog'lanish) | Bir modul o'zgarsa, boshqasi qanchalik o'zgarishi kerak? | **Past** |

Coupling yo'q bo'lmaydi — modullar hamkorlik qilishi kerak. Savol — **qanday** bog'langan va **qanchalik kuchli**.

## Nega shunday

Coupling — o'zgarish narxining asosiy manbai. A modul B'ga kuchli bog'langan bo'lsa, B'dagi har o'zgarish A'ni ham o'zgartirishga majbur qiladi — va bu zanjir bo'ylab tarqaladi. Yuqori cohesion esa aksincha: o'zgarish bir joyda to'planadi.

Bog'lanish **turlari** kuchdan zaifga (Page-Jones "connascence" g'oyasidan soddalashtirilgan):

| Tur | Misol | Kuch |
| --- | --- | --- |
| Ichki tuzilma | Boshqa modul jadvaliga SQL, private maydonga refleksiya | ⛔ Eng kuchli |
| Umumiy o'zgaruvchan holat | Global o'zgaruvchi, umumiy kesh kaliti | Juda kuchli |
| Vaqt/tartib | "Avval `init()`, keyin `load()` chaqirilsin" | Kuchli |
| Ma'no | `status = 3` — "3" nimaligini ikkala tomon bilishi kerak | O'rtacha |
| Tip/shartnoma | `OrderSummary` DTO | Zaif (normal) |
| Hodisa | `OrderPlaced` — kim eshitishini bilmaydi | Eng zaif |

Maqsad — kuchli turlarni zaif turlarga almashtirish.

## Psevdokod: bog'lanishni zaiflashtirish

```text
// Ma'no bo'yicha bog'lanish — "sehrli raqamlar"
if order.status == 3: ship(order)        // 3 = "to'langan" — buni ikkala modul bilishi shart

// Tipga aylantirish
enum OrderStatus { Draft, Placed, Paid, Shipped }
if order.status == OrderStatus.Paid: ship(order)
```

```text
// Vaqt bo'yicha bog'lanish — tartibni chaqiruvchi eslab qolishi kerak
client = new ApiClient()
client.setToken(token)       // unutilsa — keyingi qator xato
client.get("/orders")

// Konstruktorga ko'chirish — noto'g'ri tartibni imkonsiz qilish
client = new ApiClient(token)
client.get("/orders")
```

```text
// To'g'ridan-to'g'ri chaqiruv — buyurtma kim reaksiya qilishini biladi
function placeOrder(o):
    save(o); mailer.send(o); warehouse.reserve(o); analytics.track(o); loyalty.addPoints(o)

// Hodisa — buyurtma faqat "nima bo'ldi" deydi
function placeOrder(o):
    save(o); events.publish(OrderPlaced(o.id))
// Yangi reaksiya qo'shish — placeOrder o'zgarmaydi
```

Oxirgi misol — bog'lanish **yo'q bo'lmadi**, u boshqa joyga ko'chdi: endi reaksiyalar hodisa shakliga bog'liq. Hodisa — shartnoma, uni versiyalash kerak (58-bob).

## Psevdokod: o'lchash

Bog'lanishni sezgi bilan emas, raqam bilan ko'rish mumkin:

```text
Afferent coupling (Ca)  — menga nechta modul bog'liq
Efferent coupling (Ce)  — men nechta modulga bog'liqman
Instability  I = Ce / (Ca + Ce)      0 — barqaror, 1 — beqaror

shared/utils:   Ca = 40, Ce = 0   →  I = 0    (hamma unga tayanadi — kam o'zgarishi kerak)
features/cart:  Ca = 0,  Ce = 8   →  I = 1    (hech kim unga tayanmaydi — erkin o'zgaradi)
```

**Stable Dependencies Principle:** bog'liqlik barqarorlik yo'nalishida bo'lsin — beqaror modul barqaror modulga tayanadi, aksincha emas. `shared/` `features/` ni import qilsa — qoida buzilgan.

Amaliy o'lchov — **o'zgarish bog'lanishi** (change coupling): git tarixida qaysi fayllar birga o'zgaradi?

```bash
git log --since=6.months --name-only --format='' | sort | uniq -c | sort -rn | head
```

Turli modullardagi fayllar doim birga commit qilinsa — ular orasida yashirin bog'lanish bor.

## Framework'larda

| Bog'lanishni zaiflashtirish usuli | Backend | Frontend |
| --- | --- | --- |
| Interfeysga tayanish (DI) | [Symfony 5-bob](../symfony/05-service-container.md), [Laravel 5-bob](../laravel/05-service-container.md) | [Angular 36-bob](../angular/36-provayder-turlari.md) — abstrakt klass token |
| Hodisalar | [Symfony 12-bob](../symfony/12-event-listener.md), [Laravel 26-bob](../laravel/26-hodisalar-va-observerlar.md) | [Vue 23-bob](../vue/23-emits.md) (emits), [Angular 26-bob](../angular/26-output-va-model.md) (output) |
| DTO — ichki modelni yashirish | [Symfony 20-bob](../symfony/20-serializer-va-dto.md), [Laravel 20-bob](../laravel/20-api-resurslar.md) | API DTO ↔ forma modeli ([Angular 53-bob](../angular/53-tiplangan-reactive-forms.md)) |
| Holatni yopish | — | [Angular 39-bob](../angular/39-di-naqshlari.md) (`asReadonly`), [Vue 42-bob](../vue/42-pinia.md) |
| Import chegaralarini majburlash | Deptrac | ESLint `no-restricted-imports`, FSD qoidalari |

Frontend'da eng ko'p uchraydigan kuchli bog'lanish — **prop drilling** va global store'dan hamma narsani o'qish. Birinchisi — komponentlar bir-birining ichki ehtiyojini biladi; ikkinchisi — hamma store'ning shakliga bog'liq (umumiy o'zgaruvchan holat).

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| To'g'ridan-to'g'ri chaqiruv | Oddiy, oqimni kuzatish oson, tip tekshiruvi | Chaqiruvchi hammani biladi |
| Hodisa | Past bog'lanish, oson kengayish | "Kim reaksiya qiladi?" — kod o'qib topish qiyin; tartib va xato boshqaruvi murakkab |
| Interfeys + DI | Almashtirish oson, test | Qo'shimcha qatlam; bitta amalga oshirish bo'lsa — ortiqcha |
| Takrorlash (DRY buzish) | Modullar mustaqil | Ikki joyda tuzatish |

Oxirgi qator muhim: **ozgina takrorlash — noto'g'ri bog'lanishdan arzonroq.** Ikki modul tasodifan o'xshash kodga ega bo'lsa, ularni "umumiy" funksiyaga bog'lash — kelajakda turli yo'nalishda o'zgarishni to'sadi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Boshqa modul ichiga kirish | Eng kuchli bog'lanish | Ochiq API (11-bob) |
| Har narsa hodisa orqali | Oqim ko'rinmas, debug qiyin | Hodisa — faqat mustaqil reaksiyalar uchun |
| DRY'ni modullar orasida mutlaq qoida qilish | Tasodifiy o'xshashlik bog'lanishga aylanadi | "Uch marta" qoidasi, bir modul ichida DRY |
| `shared` biznes kodini import qiladi | Barqarorlik yo'nalishi buzilgan | Bog'liqlik faqat "pastga" |
| Coupling'ni o'lchamaslik | Muammo kech seziladi | Change coupling tahlili, CI'da chegara qoidalari |

## Amaliyot

1. Yuqoridagi `git log` buyrug'ini loyihangizda ishga tushiring; turli modullardan birga o'zgaradigan 3 juft faylni toping.
2. Bitta "sehrli qiymat" (holat raqami, satr) ni enum/tipga aylantiring.
3. Bitta funksiyadagi 3+ yon ta'sirni hodisaga o'tkazish kerakmi — trade-off jadvali bilan asoslang.
4. `shared/` papkangizdan "yuqoriga" import borligini tekshiring.

## Manbalar

- Robert C. Martin — *Clean Architecture*, 13–14-boblar (komponent prinsiplari, barqarorlik)
- Meilir Page-Jones — connascence tushunchasi; <https://connascence.io>
- Adam Tornhill — *Your Code as a Crime Scene* (change coupling)
