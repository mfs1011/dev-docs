# 64 — Real vaqt

[← Oldingi: Fayl yuklash oqimi](63-fayl-yuklash.md) · [Mundarija](README.md) · [Keyingi: Kesh kelishuvi →](65-kesh-kelishuvi.md)

## Tushuncha

Real vaqt — server o'zgarishni klientga **so'ralmasdan** yetkazishi: yangi xabar, buyurtma holati, narx, "eksport tayyor". To'rt texnika:

| Texnika | Yo'nalish | Ulanish | Qachon |
| --- | --- | --- | --- |
| **Polling** | Klient → server, vaqti-vaqti bilan | Har safar yangi so'rov | Kam o'zgaradi, oddiylik muhim |
| **Long polling** | Server javobni o'zgarish bo'lguncha ushlab turadi | Uzoq so'rov | Eski infratuzilma |
| **SSE** (Server-Sent Events) | Server → klient (bir tomonlama) | Bitta uzoq HTTP | Bildirishnomalar, holat, oqim (LLM javobi ham) |
| **WebSocket** | Ikki tomonlama | Doimiy TCP | Chat, hamkorlikda tahrirlash, o'yinlar |

## Nega shunday

WebSocket — ko'pincha "real vaqt = WebSocket" deb avtomatik tanlanadi. Lekin ko'p ehtiyojlar **bir tomonlama** (server → klient): bildirishnoma, holat yangilanishi. Ular uchun SSE oddiyroq: oddiy HTTP (proksilar, auth cookie, HTTP/2 multiplexing), brauzer avtomatik qayta ulanadi, `Last-Event-ID` bilan uzilgan joydan davom etadi.

## Psevdokod: SSE

```text
GET /events  (Accept: text/event-stream, cookie bilan)

HTTP/1.1 200 OK
Content-Type: text/event-stream

id: 1842
event: order.status
data: {"orderId":"7f3a","status":"shipped"}

id: 1843
event: export.ready
data: {"exportId":"ex_91","url":"/exports/ex_91"}
```

```text
// Klient
source = new EventSource("/events", { withCredentials: true })
source.addEventListener("order.status", (e) => updateOrder(JSON.parse(e.data)))
// Uzilsa — brauzer o'zi qayta ulanadi va Last-Event-ID: 1843 yuboradi → server o'tkazib yuborilganlarni beradi
```

## Psevdokod: real vaqt — signal, ma'lumot emas

```text
Ishonchli naqsh: push — "nimadir o'zgardi" signali, haqiqiy ma'lumot — oddiy API'dan

on "order.updated" { orderId }:
    queryCache.invalidate(["order", orderId])      // ma'lumot qatlami qayta so'raydi (42-bob)

Nega: push kanali xabarni yo'qotishi, takrorlashi, tartibini buzishi mumkin;
      API esa — haqiqat manbai. Xabar yo'qolsa ham keyingi so'rov to'g'ri holatni beradi.
```

To'liq holatni push orqali yuborish (event-carried state, 27-bob) — tezroq, lekin tartib va versiya nazorati kerak.

## Psevdokod: masshtab

```text
Muammo: 3 ta server nusxasi; foydalanuvchi #1 serverga ulangan, hodisa #2 serverda yuz berdi

Yechim: pub/sub qatlami
  server #2: redis.publish("user:7", event)
  server #1: redis.subscribe("user:7") → ulangan klientga yuboradi
yoki: alohida real vaqt xizmati (Mercure, Centrifugo, Soketi/Pusher-mos, Ably) — ilova unga faqat publish qiladi
```

PHP-FPM har so'rovni qisqa jarayonda ishlaydi — minglab uzoq ulanishni ushlab turishga mos emas. Shuning uchun PHP ekotizimida ulanishlarni **alohida hub** ushlaydi (Mercure, Laravel Reverb), ilova esa hodisani hubga yuboradi.

## Psevdokod: polling — hali ham to'g'ri tanlov bo'lishi mumkin

```text
Hisobot tayyor bo'lishini kutish (1–2 daqiqa):
  poll every 3s, backoff to 10s, stop when status in [ready, failed] or after 5 min
  + oddiy, har qanday infratuzilmada ishlaydi
  + sahifa yopilsa — so'rovlar to'xtaydi
Kam foydalanuvchi, kam o'zgarish — polling'ning narxi arzimas
```

## Framework'larda

| Ehtiyoj | Backend | Frontend |
| --- | --- | --- |
| SSE hub | Symfony Mercure — [Symfony 35-bob](../symfony/35-mercure.md) | `EventSource` |
| WebSocket | Laravel Reverb + Echo; Centrifugo, Soketi | Laravel Echo, Socket.IO klient |
| Next.js | Route handler'da SSE/stream — [Next.js 37-bob](../nextjs/37-real-vaqt.md) | — |
| RxJS bilan | — | `webSocket()` subject, `retry` + backoff — [Angular 68-bob](../angular/68-rxjs-chuqur.md) |
| Holat yangilash | — | So'rov keshini invalidatsiya — [React 32-bob](../react/32-tanstack-query.md) |

## Trade-off

| Texnika | Yutuq | Narx |
| --- | --- | --- |
| Polling | Eng oddiy, infratuzilmasiz | Kechikish, keraksiz so'rovlar |
| SSE | HTTP, avtomatik qayta ulanish, auth oson | Faqat server → klient; HTTP/1.1 da domen bo'yicha ulanish limiti (~6) |
| WebSocket | Ikki tomonlama, past kechikish | Alohida protokol: auth, proksi, qayta ulanish, masshtab — qo'lda |
| Boshqariladigan servis (Ably, Pusher) | Ops yo'q | Narx, vendor bog'liqligi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Bir tomonlama ehtiyojga WebSocket | Keraksiz murakkablik | SSE |
| Push — yagona haqiqat manbai | Xabar yo'qolsa holat noto'g'ri | Push = signal, API = haqiqat |
| Qayta ulanishda o'tkazib yuborilganlar yo'qoladi | Holat nomuvofiq | `Last-Event-ID` / ulanganda qayta yuklash |
| Ko'p nusxada pub/sub yo'q | Hodisa boshqa serverda qoladi | Redis/hub |
| WebSocket auth faqat ulanishda | Token eskirsa ham ulanish tirik | Muddatni tekshirish, qayta autentifikatsiya |
| Har tab o'z ulanishi | Ulanishlar ko'payadi | SharedWorker / BroadcastChannel (ixtiyoriy) |

## Amaliyot

1. Real vaqt ehtiyojlaringizni ro'yxatlang: qaysilari bir tomonlama?
2. Bitta bildirishnomani SSE bilan, "signal + qayta so'rov" naqshida yozing.
3. Ulanishni uzib, qayta ulaning — o'tkazib yuborilgan hodisalar tiklanadimi?
4. Ikki server nusxasi bilan sinab, pub/sub kerakligini tekshiring.

## Manbalar

- MDN — *Using server-sent events* <https://developer.mozilla.org/docs/Web/API/Server-sent_events>
- RFC 6455 — *The WebSocket Protocol*
- Mercure <https://mercure.rocks>
