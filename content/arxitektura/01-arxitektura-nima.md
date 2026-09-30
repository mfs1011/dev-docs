# 01 — Arxitektura nima va nega kerak

[Mundarija](README.md) · [Keyingi: Sifat atributlari va trade-off →](02-sifat-atributlari.md)

## Tushuncha

Dasturiy arxitektura — **o'zgartirish qimmat bo'lgan qarorlar** majmui. Martin Fowler ta'rifi: "arxitektura — muhim narsalar, qaysilari muhim ekanini esa siz hal qilasiz". Amaliyroq ta'rif:

> Arxitektura qarori — orqaga qaytarish narxi yuqori bo'lgan qaror.

| Arxitektura qarori | Arxitektura qarori emas |
| --- | --- |
| Monolit yoki servislar | O'zgaruvchi nomi |
| Ma'lumot qayerda saqlanadi, kim egasi | `for` yoki `map` |
| Autentifikatsiya modeli (sessiya/token) | Tugma rangi |
| API shartnomasi shakli | Bitta funksiyaning ichki tuzilishi |
| Render strategiyasi (SSR/CSR) | Qaysi komponentga qaysi CSS klass |
| Modul chegaralari va bog'liqlik yo'nalishi | Kodni formatlash qoidasi |

Chegara qat'iy emas: bitta papka nomi arzon, lekin 300 ta fayl import qiladigan umumiy papka nomi — allaqachon qimmat.

## Nega shunday

Har loyiha arxitekturaga ega — **ongli yoki ongsiz**. "Arxitekturasiz" loyiha yo'q: faqat qarorlari tasodifan, bosim ostida, hujjatsiz qabul qilingan loyiha bor. Ikkinchisining belgilari tanish:

- Kichik o'zgarish 15 ta faylga tegadi.
- "Buni o'zgartirsak nima buziladi?" — hech kim bilmaydi.
- Yangi dasturchi 2 oyda ham tizimni tushunmaydi.
- Tezlik vaqt o'tishi bilan **pasayadi**: har yangi feature oldingisidan qimmatroq.

Arxitekturaning iqtisodiy ma'nosi — oxirgi punkt. Yaxshi arxitektura vaqt o'tishi bilan o'zgarish narxini **past** ushlab turadi:

```text
o'zgarish narxi
  ▲
  │                          ╱  arxitekturasiz ("big ball of mud")
  │                       ╱
  │                   ╱
  │              ╱
  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   ongli arxitektura
  │ ╱
  └──────────────────────────▶ vaqt
     ↑ boshida arxitektura biroz sekinroq ko'rinadi
```

Boshida "tez yozish" yutadi. Bir necha oydan keyin — yo'qotadi. Bu kitobning maqsadi — egri chiziqni pastda ushlab turish usullari.

### AI davrida nega muhimroq

Kod yozish arzonlashdi — AI bir daqiqada 500 qator yozadi. Lekin **qaror** arzonlashmadi: AI qaysi modulga yozishni, qaysi chegarani buzmaslikni, qaysi trade-off'ni tanlashni sizning kontekstingizsiz bilmaydi. Arxitektura bilimi — AI'ga to'g'ri vazifa berish va natijani baholash uchun asos (89-bob).

## Psevdokod: bir xil feature, ikki arxitektura

"Buyurtma berilganda mijozga email yuborilsin, omborga xabar ketsin":

```text
// A — hammasi bir joyda
function createOrder(request):
    validate(request)
    db.insert("orders", request)
    smtp.send(request.email, "Buyurtmangiz qabul qilindi")
    http.post("https://warehouse/api/reserve", request.items)
    return ok
```

```text
// B — chegaralar bilan
function createOrder(command):                 // Buyurtma moduli
    order = Order.place(command)               // domen qoidalari
    orders.save(order)
    events.publish(OrderPlaced(order.id))      // kim eshitishi — bu modulning ishi emas
    return order.id

on OrderPlaced(e):  notifications.sendConfirmation(e.orderId)   // Bildirishnoma moduli
on OrderPlaced(e):  warehouse.reserve(e.orderId)                // Ombor moduli (fon ishi)
```

A — kichik va tushunarli. B — ko'proq qism. Qaysi biri to'g'ri? **Kontekstga bog'liq:**

| Savol | A yetadi | B kerak |
| --- | --- | --- |
| Ombor API ishlamay qolsa, buyurtma ham to'xtasinmi? | Ha | Yo'q |
| Yangi reaksiya (SMS, bonus) tez-tez qo'shiladimi? | Yo'q | Ha |
| Jamoa bitta odammi? | Ha | Bir nechta jamoa |
| Email sekin — foydalanuvchi kutsinmi? | Mayli | Yo'q |

Arxitektura — shu savollarni **ongli** berish va javobni yozib qo'yish.

## Framework'larda

Framework'lar arxitekturaning bir qismini **siz uchun** hal qiladi — va bu yaxshi. Lekin qolgan qismini emas:

| Framework hal qiladi | Siz hal qilasiz |
| --- | --- |
| So'rov hayot sikli, marshrutlash | Domen modullari chegarasi |
| DI konteyner mexanizmi | Nima nimaga bog'liq bo'lishi |
| ORM, migratsiya vositasi | Ma'lumot egaligi, tranzaksiya chegarasi |
| Komponent modeli, reaktivlik | Holat qayerda yashashi |
| SSR mexanizmi | Qaysi sahifa qaysi rejimda |

Misol — B variantidagi "hodisa + reaksiya" har framework'da:

- **Symfony:** Messenger bilan hodisa va asinxron handler — [Symfony 26-bob](../symfony/26-messenger.md), [27-bob](../symfony/27-event-va-doctrine-hodisalari.md).
- **Laravel:** Events + Listeners + Queue — [Laravel 25-bob](../laravel/25-navbatlar.md), [26-bob](../laravel/26-hodisalar-va-observerlar.md).
- **Frontend'da** xuddi shu g'oya — holat o'zgarishiga bir nechta mustaqil reaksiya: Angular signal store'lari ([Angular 60-bob](../angular/60-signal-xizmatlar.md)), NgRx Events ([61-bob](../angular/61-ngrx.md)), Pinia ([Vue 42-bob](../vue/42-pinia.md)).

Framework mexanizmni beradi. **Qachon** A, qachon B — bu kitobning mavzusi.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Arxitekturaga oldindan ko'p vaqt | Kelajakdagi o'zgarishlar arzon | Hali bo'lmagan muammo uchun murakkablik (YAGNI buziladi) |
| "Keyin tuzatamiz" | Tez start | Qarorlar tasodifiy, keyin qimmat |
| **Oqilona o'rta** | Qimmat qarorlarni ongli, arzonlarini tez | Qaysi qaror qimmat ekanini ajrata bilish kerak — shu ko'nikma |

Qoida: **qaytarish qiyin** qarorlarga vaqt ajrating, **qaytarish oson**larini tez qabul qiling va keyinga qoldiring ("last responsible moment").

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Arxitekturani "katta loyihalar uchun" deb o'ylash | Kichik loyiha ham o'sadi; qarorlar baribir qabul qilinadi | Kichik loyihada ham chegaralar va ADR |
| Framework'ni arxitektura deb bilish | Framework mexanizm, qaror emas | Domen chegaralari sizda |
| Moda arxitekturani ko'chirish (mikroservis, chunki Netflix) | Kontekst boshqa | Talabdan qarorga (3-bob) |
| Hamma narsani oldindan loyihalash | Hali ma'lum bo'lmagan talab uchun murakkablik | Qimmat qarorlarni ajrating |
| Qarorlarni yozmaslik | 6 oydan keyin "nega shunday?" — javob yo'q | ADR (7-bob) |

## Amaliyot

1. Joriy loyihangizdagi 5 ta qarorni yozing, har biri uchun: "buni o'zgartirish qancha turadi?" (soat/kun/oy).
2. Eng qimmat 2 tasini tanlang: ular ongli qabul qilinganmi yoki tasodifanmi?
3. So'nggi 3 oydagi eng og'riqli o'zgarishni eslang: qaysi arxitektura qarori uni qimmatlashtirdi?
4. Yuqoridagi A/B misolini o'z loyihangizdagi bitta feature bilan qayta yozing.

## Manbalar

- Martin Fowler — *Who Needs an Architect?* <https://martinfowler.com/ieeeSoftware/whoNeedsArchitect.pdf>
- Mark Richards, Neal Ford — *Fundamentals of Software Architecture*, 1–2-boblar
- Brian Foote, Joseph Yoder — *Big Ball of Mud* <http://www.laputan.org/mud/>
