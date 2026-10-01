# 56 — GraphQL

[← Oldingi: REST dizayni](55-rest.md) · [Mundarija](README.md) · [Keyingi: gRPC va RPC uslubi →](57-grpc.md)

## Tushuncha

GraphQL — klient **qaysi ma'lumot kerakligini o'zi so'raydigan** API tili. Bitta endpoint, qat'iy tiplangan sxema, so'rovda — kerakli maydonlar aniq:

```text
query OrderPage($id: ID!) {
  order(id: $id) {
    id
    status
    total { amount currency }
    customer { name }
    lines { qty product { title image(width: 400) } }
  }
}
```

Javob — aynan shu shaklda. REST'da bu 3–4 ta so'rov bo'lishi mumkin edi (`/orders/7f3a`, `/customers/…`, `/products?ids=…`).

## Nega shunday

GraphQL ikki REST muammosini hal qiladi:

| Muammo | REST'da | GraphQL'da |
| --- | --- | --- |
| **Underfetching** | Bir sahifaga 5 ta so'rov (waterfall) | Bitta so'rov |
| **Overfetching** | Javobda 40 maydon, kerak — 5 | Faqat so'ralgan maydonlar |
| Ko'p klient (web, mobil, TV) har xil ehtiyoj | Har biriga endpoint yoki BFF | Har klient o'z so'rovi |

Lekin bu moslashuvchanlik **serverga yuk** ko'chiradi: klient istalgan kombinatsiyani so'rashi mumkin, server esa hammasiga tayyor bo'lishi kerak.

## Psevdokod: N+1 — asosiy texnik muammo

```text
query { orders(first: 50) { id customer { name } } }

// Sodda resolver'lar:
orders()           → SELECT * FROM orders LIMIT 50          (1 so'rov)
order.customer()   → SELECT * FROM customers WHERE id = ?   (50 so'rov!)

// DataLoader — bitta "tick" ichidagi so'rovlarni to'plash:
order.customer() → loader.load(customerId)
                   → SELECT * FROM customers WHERE id IN (...50 ta id...)   (1 so'rov)
```

DataLoader (yoki shunga o'xshash batching) — GraphQL server uchun majburiy.

## Psevdokod: xavfsizlik va resurs nazorati

```text
// Klient bunday so'rov yuborishi mumkin:
query { users { friends { friends { friends { friends { posts { comments { author { ... } } } } } } } } }

Himoyalar:
  - chuqurlik limiti (masalan 8)
  - murakkablik bahosi (har maydon og'irligi, ro'yxatlar × first)
  - persisted queries — production'da faqat oldindan ro'yxatdan o'tgan so'rovlar (ixtiyoriy so'rov yo'q)
  - introspection production'da o'chiq (yoki faqat ichki)
  - har resolver'da ruxsat tekshiruvi — maydon darajasida (62-bob)
```

REST'da har endpoint o'z ruxsatini tekshiradi; GraphQL'da bitta so'rov o'nlab resolver'dan o'tadi — **har biri** tekshirishi kerak, aks holda `order { customer { email } }` orqali begona ma'lumot sizadi.

## Psevdokod: kesh

```text
REST:      GET /products/42 → HTTP kesh, CDN, ETag — bepul
GraphQL:   POST /graphql (tanada so'rov) → HTTP keshi ishlamaydi

Yechimlar:
  - klient normalizatsiyalangan keshi (Apollo, urql, Relay) — ob'ektlar __typename:id bo'yicha
  - persisted queries + GET → CDN keshlashi mumkin
  - server tomonda resolver/DataLoader keshi
```

## Psevdokod: qachon tanlash

```text
GraphQL mos:
  - ko'p turli klient, har biri boshqa ma'lumot to'plamini oladi
  - murakkab bog'langan ma'lumot (graf), bir ekranda ko'p ob'ekt
  - kuchli frontend jamoa, tipli klient generatsiyasi kerak
  - API ustidan "BFF qatlami" sifatida bir nechta servisni birlashtirish

REST yetarli (va oddiyroq):
  - bitta asosiy klient, sahifalar resurslarga mos
  - ommaviy API (kesh, oddiy vositalar, hamma tushunadi)
  - fayl yuklash, oddiy CRUD
  - kichik jamoa
```

## Framework'larda

| Tomon | Vositalar |
| --- | --- |
| Symfony | API Platform — REST va GraphQL bitta sxemadan ([Symfony 38-bob](../symfony/38-api-pro.md)); `overblog/graphql-bundle` |
| Laravel | Lighthouse (sxema-birinchi, Eloquent bilan), rebing/graphql-laravel |
| Node | Apollo Server, GraphQL Yoga, Pothos (TS sxema) |
| Frontend klient | Apollo Client (Angular — Apollo Angular), urql (React/Vue), TanStack Query + `graphql-request`, Relay |
| Tip generatsiyasi | GraphQL Code Generator — so'rovlardan TypeScript tiplari |

Tip generatsiyasi GraphQL'ning eng katta foydalaridan biri: sxema + so'rovlar → har komponent uchun aniq tiplar (OpenAPI'ning 54-bobdagi g'oyasi, yanada aniqroq — chunki tip **so'rovning o'zidan** chiqadi).

## Trade-off

| Jihat | REST | GraphQL |
| --- | --- | --- |
| Klient moslashuvchanligi | Past | Yuqori |
| HTTP kesh | Bepul | Qo'shimcha ish |
| Server murakkabligi | Past | Yuqori (N+1, murakkablik, ruxsatlar) |
| Monitoring | Endpoint bo'yicha | So'rov/operatsiya nomi bo'yicha |
| Xato modeli | Status kodlar | Odatda 200 + `errors` massivi |
| Fayl yuklash | Tabiiy | Noqulay (ko'pincha alohida REST) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| DataLoader'siz resolver'lar | N+1, sekin | Batching |
| Chuqurlik/murakkablik limitsiz | DoS | Limitlar, persisted queries |
| Ruxsat faqat ildiz resolver'da | Ichki maydonlar orqali sizish | Har resolver/maydon |
| Moda uchun GraphQL | Murakkablik, foyda kam | Ehtiyojga qarab |
| Xato `200` bilan, monitoringda ko'rinmaydi | Muammolar sezilmaydi | `errors` ni metrika qilish |
| DB sxemasini to'g'ridan-to'g'ri GraphQL qilish | Ichki tuzilma oshkor, o'zgartirib bo'lmaydi | Domen/klient uchun sxema |

## Amaliyot

1. Eng murakkab sahifangiz uchun REST'da nechta so'rov ketishini sanang — GraphQL nima beradi?
2. Mavjud GraphQL server bo'lsa: bitta ro'yxat so'rovida SQL so'rovlar sonini o'lchang (N+1 bormi?).
3. Chuqurlik limiti va murakkablik bahosini qo'shing.
4. Ichki maydon orqali begona ma'lumotga kirishni sinab ko'ring (`order { customer { email } }`).

## Manbalar

- GraphQL — *Best Practices* <https://graphql.org/learn/best-practices/>
- DataLoader <https://github.com/graphql/dataloader>
- OWASP — *GraphQL Cheat Sheet* <https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html>
