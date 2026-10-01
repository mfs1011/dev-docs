# 81 — Jamoa va Conway qonuni

[← Oldingi: Deploy arxitekturasi](80-deploy-arxitekturasi.md) · [Mundarija](README.md) · [Keyingi: Legacy bilan ishlash →](82-legacy.md)

## Tushuncha

**Conway qonuni** (1968): *tizimni loyihalovchi tashkilot o'z kommunikatsiya tuzilmasini nusxalovchi dizayn ishlab chiqaradi.* Uchta jamoa kompilyator yozsa — uch bosqichli kompilyator chiqadi.

Bu — kuzatuv, tavsiya emas. Lekin undan ikki amaliy xulosa kelib chiqadi:

| Xulosa | Ma'no |
| --- | --- |
| Arxitektura jamoa tuzilmasiga "tortiladi" | Jamoalar chegarasi kod chegarasiga aylanadi — xohlaysizmi, yo'qmi |
| **Teskari Conway manevri** | Kerakli arxitekturani olish uchun avval jamoalarni shunga moslab tuzish |

## Nega shunday

Chegara bo'ylab muloqot qimmat: boshqa jamoadan o'zgarish so'rash — uchrashuv, kutish, kelishuv. Shuning uchun odamlar tabiiy ravishda chegaralarni o'z jamoasi ichida yopishga intiladi. Ikki jamoa bitta modulga ega bo'lsa — modul ichida yashirin chegara paydo bo'ladi; bitta jamoa uchta servisga ega bo'lsa — servislar bir-biriga "o'sib" ketadi.

```text
Jamoa tuzilmasi:               Natijaviy arxitektura:
  Frontend jamoa                 SPA
  Backend jamoa                  API  ← har feature uchun ikki jamoa kelishishi kerak
  DBA jamoa                      DB (sxema o'zgarishi — tiket orqali)
→ "katalogga filtr qo'shish" = 3 jamoa, 3 navbat, 2 hafta

Feature jamoalar (stream-aligned):
  Katalog jamoasi:  UI + API + DB sxemasi
  Checkout jamoasi: UI + API + DB sxemasi
→ "katalogga filtr qo'shish" = 1 jamoa, 2 kun
```

## Psevdokod: Team Topologies — to'rt jamoa turi

```text
Stream-aligned  — bitta biznes oqimi uchun to'liq javobgar (katalog, checkout, to'lov)
                  → ko'pchilik jamoalar shu turda
Platform        — boshqa jamoalarga o'z-o'ziga xizmat vositalari (CI, deploy, monitoring, dizayn tizimi)
                  → mahsulot kabi: hujjat, API, SLA
Enabling        — vaqtincha yordam beradi, ko'nikma o'rgatadi (xavfsizlik, unumdorlik ekspertlari)
Complicated-subsystem — chuqur maxsus bilim talab qiladigan qism (narxlash algoritmi, video kodek, ML)

O'zaro ta'sir rejimlari:
  hamkorlik (vaqtincha, yangi narsani birga kashf qilish)
  X-as-a-Service (aniq API orqali, kam muloqot)
  yordam (enabling jamoa → stream-aligned)
```

## Psevdokod: kognitiv yuk — chegarani tanlash mezoni

```text
Jamoa o'z sohasini to'liq tushuna olishi kerak:
  ✅ 5–9 kishi, 1–3 bounded context (14-bob), o'z servislari/modullarini o'zi deploy qiladi
  ❌ 6 kishi, 14 mikroservis, 3 tilda, har biri boshqacha deploy

Belgilar: "bu kodni hech kim tushunmaydi", hamma narsaga bitta odam kerak, on-call — dahshat
Yechim: jamoaga kamroq narsa (servislarni birlashtirish — 19, 20-boblar), platformaga ko'proq
```

## Psevdokod: egalik

```text
Har modul/servis/paketning ANIQ egasi bor (bitta jamoa):
  CODEOWNERS:
    /src/Catalog/         @shop/catalog-team
    /src/Checkout/        @shop/checkout-team
    /packages/ui/         @shop/platform-design
  servislar katalogi (Backstage): ega, on-call, SLO, runbook, bog'liqliklar

"Hammaning kodi" = hech kimning kodi emas: yangilanmaydi, buziladi, hech kim javob bermaydi.
Ichki ochiq manba (inner source): boshqa jamoa PR yuborishi mumkin, lekin ega review qiladi.
```

## Framework'larda

Conway qonuni framework'ga bog'liq emas, lekin kod tuzilmasi jamoa chegarasini qo'llab-quvvatlashi yoki buzishi mumkin:

| Vosita | Nima beradi | Qayerda |
| --- | --- | --- |
| Modulli monolit | Jamoalar bitta deploy'da, lekin alohida modullarda | [Arxitektura 20-bob](20-modulli-monolit.md) |
| Chegara qoidalari (Deptrac, `eslint-plugin-boundaries`) | Jamoa moduliga begona import — CI xatosi | [Symfony 39-bob](../symfony/39-arxitektura.md), [Arxitektura 38-bob](38-modul-tuzilmasi.md) |
| Monorepo + CODEOWNERS | Egalik va affected build | [Arxitektura 74-bob](74-monorepo.md) |
| Mikro-frontendlar | Mustaqil frontend deploy (tashkiliy muammo yechimi) | [Arxitektura 50-bob](50-mikro-frontendlar.md) |
| Dizayn tizimi | Platforma jamoasining "mahsuloti" | [Arxitektura 43-bob](43-dizayn-tizimi.md) |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Komponent jamoalari (frontend/backend) | Chuqur texnik ekspertiza | Har feature — ko'p jamoa, kutish |
| Feature jamoalar | Tez yetkazish, to'liq egalik | Texnik izchillik qiyin — platforma kerak |
| Platforma jamoa | Takrorlanish kam, standart | Bottleneck bo'lishi mumkin, "minora" xavfi |
| Teskari Conway | Arxitektura maqsadga mos | Qayta tashkil etish — og'riqli, sekin |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Arxitekturani jamoalarsiz loyihalash | Qonun baribir ishlaydi — kutilmagan tomonga | Jamoa tuzilmasini ham loyihalash |
| 5 kishiga 20 mikroservis | Kognitiv yuk, sekinlik | Servislarni birlashtirish |
| Egasiz umumiy modul | Hech kim javob bermaydi | Aniq ega, CODEOWNERS |
| Har feature uchun 3 jamoa kelishuvi | Haftalab kutish | Stream-aligned jamoalar |
| Platforma — talablar tiketi | Bottleneck | O'z-o'ziga xizmat, hujjatlangan API |

## Amaliyot

1. Jamoalaringiz va servislar/modullaringiz xaritasini yonma-yon chizing — qayerda mos kelmaydi?
2. Oxirgi 3 feature uchun nechta jamoa ishtirok etganini sanang.
3. CODEOWNERS fayli tuzing: egasiz qolgan papkalar bormi?
4. Har jamoaning kognitiv yukini baholang: nechta servis, til, deploy usuli?

## Manbalar

- Melvin Conway — *How Do Committees Invent?* (1968)
- Matthew Skelton, Manuel Pais — *Team Topologies*
- Martin Fowler — *Conway's Law* <https://martinfowler.com/bliki/ConwaysLaw.html>
