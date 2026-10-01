# 62 — Avtorizatsiya

[← Oldingi: Access va refresh tokenlar](61-tokenlar.md) · [Mundarija](README.md) · [Keyingi: Fayl yuklash oqimi →](63-fayl-yuklash.md)

## Tushuncha

Avtorizatsiya — "bu foydalanuvchi **shu amalni shu resurs ustida** bajara oladimi?" Uch daraja:

| Daraja | Savol | Misol |
| --- | --- | --- |
| **Funksiya** | Bu turdagi amalga ruxsat bormi? | "Buyurtmalarni o'chira oladimi?" |
| **Ob'ekt** | **Aynan shu** ob'ektgami? | "Buyurtma #42 uniki yoki uning tashkilotinikimi?" |
| **Maydon** | Ob'ektning qaysi qismini ko'radi/o'zgartiradi? | "Tannarx maydonini ko'radimi?" |

OWASP API Top 10'ning birinchi ikkitasi — aynan ob'ekt (BOLA) va maydon (BOPLA) darajasidagi xatolar (77-bob).

## Nega shunday

Eng keng tarqalgan xato — faqat funksiya darajasida tekshirish:

```text
GET /orders/{id}
  requireRole("customer")       ✅ funksiya: mijoz buyurtma ko'ra oladi
  return orders.find(id)        ❌ ob'ekt: ID'ni o'zgartirsa — boshqa mijozning buyurtmasi
```

URL'dagi ID'ni 42 dan 43 ga o'zgartirish — eng oddiy hujum, va u ko'p API'larda ishlaydi.

## Psevdokod: modellar

```text
RBAC (rolga asoslangan):
  rollar → ruxsatlar:   admin → [orders:*, users:*]   manager → [orders:read, orders:update]
  oddiy, tushunarli; "faqat o'z filialining buyurtmalari" kabi qoidalarga yetmaydi

ABAC (atributlarga asoslangan):
  qaror = f(foydalanuvchi atributlari, resurs atributlari, amal, kontekst)
  "manager buyurtmani o'zgartira oladi, agar order.branchId == user.branchId va order.status != 'shipped'"

ReBAC (munosabatlarga asoslangan, Zanzibar uslubi):
  "user:7 — document:42 ning editor'i", "folder:3 ichidagi hamma narsaga viewer" — munosabatlar grafi
  Google Docs, GitHub kabi ulashish modellari uchun
```

Amalda: **RBAC asos + ob'ekt darajasidagi qoidalar** (policy/voter) ko'p ilovalar uchun yetarli.

## Psevdokod: qaror qayerda qabul qilinadi

```text
Har amal uchun bitta markaziy joy — policy:

policy OrderPolicy:
    view(user, order)   = order.customerId == user.id or user.can("orders:read:any")
    cancel(user, order) = view(user, order) and order.status in ["pending", "paid"]
    viewCost(user)      = user.can("orders:cost")

controller:
    order = orders.find(id) or 404
    authorize("view", order) or 404          // 403 emas — mavjudligini oshkor qilmaslik
    return present(order, fields = user.can("orders:cost") ? all : without(cost))
```

Ro'yxatlar uchun — so'rovning o'zida filtr: `WHERE customer_id = :me` (keyin filtrlash — sahifalashni buzadi va xato qilish oson).

## Psevdokod: UI va server mas'uliyati

```text
Server:   HAQIQAT — har so'rovda policy; frontend nima ko'rsatishidan qat'i nazar
Frontend: UX — ko'rsatmaslik/o'chirish, marshrut guardlari, chunk yuklamaslik (canMatch)

Frontend ruxsatlarni qayerdan biladi?
  - login/me javobida: { permissions: ["orders:read", "orders:cancel"] }   — funksiya darajasi
  - resurs javobida:   { id, ..., "_actions": { "cancel": true, "refund": false } }  — ob'ekt darajasi
    (server shu ob'ekt uchun policy natijasini beradi — frontend qoidani takrorlamaydi)
```

Ikkinchi naqsh muhim: "tasdiqlangan buyurtmani bekor qilib bo'lmaydi" qoidasini frontend'da **qayta yozish** o'rniga, server `_actions.cancel: false` qaytaradi. Bitta qoida — bitta joyda.

## Framework'larda

| Ehtiyoj | Backend | Frontend |
| --- | --- | --- |
| Policy / voter | Symfony Voters — [Symfony 23-bob](../symfony/23-avtorizatsiya.md); Laravel Policies & Gates — [Laravel 22-bob](../laravel/22-avtorizatsiya.md) | — |
| Ruxsat bo'yicha UI | — | `*appCan` direktivasi, `Permissions` xizmati — [Angular 59-bob](../angular/59-himoyalangan-marshrutlar.md) |
| Marshrut guardlari | — | `canMatch` (chunk yuklanmaydi) — [Angular 44](../angular/44-guard-va-resolver.md); [Next.js 30-bob](../nextjs/30-himoyalangan-marshrutlar.md) |
| Tashqi PDP | OpenFGA, Cerbos, OPA — ReBAC/ABAC uchun | — |

## Trade-off

| Model | Yutuq | Narx |
| --- | --- | --- |
| RBAC | Oddiy, audit oson | Ob'ekt qoidalariga yetmaydi; "rol portlashi" |
| ABAC | Moslashuvchan | Qoidalarni tushunish va test qilish qiyin |
| ReBAC | Ulashish modellari tabiiy | Infratuzilma (Zanzibar-uslub servis) |
| Qoidalar kodda (policy) | Versiyalangan, test qilinadi | Har o'zgarish — deploy |
| Tashqi policy engine | Markazlashgan, ko'p servis | Yana bir tizim, tarmoq chaqiruvi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Faqat rol tekshiruvi, ob'ekt yo'q | BOLA — boshqaning ma'lumoti | Har resursda policy |
| Ruxsatsiz ob'ektga 403 | Mavjudligini oshkor qiladi | 404 |
| Ro'yxatni keyin filtrlash | Sahifalash buziladi, xato oson | So'rovda `WHERE` |
| Qoidalar frontend'da takrorlanadi | Nomuvofiqlik | `_actions` serverdan |
| Faqat frontend guardlari | API ochiq | Server — haqiqat |
| Ruxsat testlari yo'q | Regressiya sezilmaydi | "Begona foydalanuvchi" testlari (35-bob) |

## Amaliyot

1. Har resurs endpoint'ingizda ID'ni boshqa foydalanuvchinikiga almashtirib ko'ring — nechtasida ma'lumot qaytadi?
2. Eng muhim resurs uchun policy klassini yozing (view, update, delete).
3. Resurs javobiga `_actions` qo'shing va frontend'dagi takroriy qoidalarni olib tashlang.
4. Har endpoint uchun "begona foydalanuvchi → 404" avtomatik testini yozing.

## Manbalar

- OWASP API Security Top 10 — API1 (BOLA), API3 (BOPLA), API5 (BFLA)
- Google — *Zanzibar: Google's Consistent, Global Authorization System*
- OpenFGA <https://openfga.dev>
