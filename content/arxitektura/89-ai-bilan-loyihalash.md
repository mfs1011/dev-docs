# 89 — AI bilan tizim loyihalash

[← Oldingi: AI xavfsizligi](88-ai-xavfsizligi.md) · [Mundarija](README.md) · [Keyingi: Amaliy keys: to'liq tizim →](90-amaliy-keys.md)

## Tushuncha

Oldingi to'rt bob — AI'ni **mahsulot ichiga** qo'yish haqida edi. Bu bob — AI'ni **ishlab chiqish vositasi** sifatida ishlatish: kod yozuvchi assistentlar va agentlar bilan tizimni qanday loyihalash va qurish.

Asosiy tezis (1-bob): kod yozish arzonlashdi, **qaror** arzonlashmadi. AI bir daqiqada 500 qator yozadi — lekin qaysi modulga, qaysi chegarani buzmasdan, qaysi trade-off bilan — bu sizning kontekstingizga bog'liq, va kontekstni AI'ga siz berasiz.

| Muhandisning roli | Oldin | AI bilan |
| --- | --- | --- |
| Kod yozish | Asosiy vaqt | Ko'pincha delegatsiya qilinadi |
| Vazifani aniqlash | Muhim | **Eng muhim** — noaniq vazifa = tez yozilgan noto'g'ri kod |
| Kontekst berish | Jamoadoshga og'zaki | Yozma: ADR, qoidalar, misollar |
| Natijani tekshirish | Code review | Review + testlar + fitness function'lar — **hajm ko'p** |
| Mas'uliyat | Muallifda | **Baribir sizda** — "AI yozdi" degan javob yo'q |

## Nega shunday

AI kodi odatda **lokal to'g'ri, global noto'g'ri**: funksiya ishlaydi, test o'tadi — lekin u boshqa modulning ichki klassini import qiladi, mavjud yordamchini takrorlaydi, xatolar modeliga (17-bob) mos kelmaydi, yangi bog'liqlik qo'shadi. Har biri kichik — bir oyda arxitektura eroziyasi (83-bob) odamdan ko'ra tezroq keladi. Arxitektura bilimi aynan shu yerda kerak: nima so'rashni va nimani qabul qilmaslikni bilish.

## Psevdokod: vazifani qanday berish

```text
❌ "Buyurtmaga chegirma qo'sh"

✅ Vazifa:
  Maqsad:    Promo-kod bilan buyurtma chegirmasi (foiz yoki summa).
  Qayerda:   Ordering moduli, Domain qatlami — Order.applyPromo(); Application — ApplyPromoCode handler.
  Chegaralar: Catalog'ga tegma. Promo ma'lumoti — Promotions modulining ochiq API'si orqali (11-bob).
  Qoidalar:  pul — Money (minor units), float yo'q; xatolar — domen xatolari (17-bob), exception emas.
             bitta promo bir buyurtmaga; muddati o'tgan → PromoExpired.
  Shartnoma: POST /orders/{id}/promo  → 200 OrderView | 422 { code: "promo_expired" } (59-bob)
  Testlar:   domen unit testlari: foiz, summa, muddati o'tgan, takroriy qo'llash.
  Qilma:     yangi composer/npm paket qo'shma; migratsiyani expand/contract bilan (71-bob).
  Misol:     shunga o'xshash — Order.applyShippingRule() (src/Ordering/Domain/Order.php)
```

Yaxshi vazifa — yaxshi tiketga o'xshaydi: maqsad, joy, chegaralar, qabul mezonlari. AI bilan farq — **chegaralar va "qilma"lar** aniqroq yozilishi kerak, chunki AI so'ramaydi, taxmin qiladi.

## Psevdokod: doimiy kontekst — repo ichida

```text
Repo ildizida AI uchun qoidalar fayli (CLAUDE.md, AGENTS.md va h.k.):
  - arxitektura: modullar, qatlamlar, bog'liqlik yo'nalishi (C4, 7-bob)
  - konvensiyalar: nomlash, xatolar modeli, pul, sana, ID'lar
  - buyruqlar: test, lint, typecheck — "ish tugadi" = ular yashil
  - taqiqlar: qaysi papkalarga tegmaslik, qaysi kutubxonalarni ishlatmaslik
  - havolalar: docs/adr/ — qarorlar va ularning sabablari (84-bob)

ADR'lar ikki marta foyda beradi: odam uchun ham, AI uchun ham kontekst.
Qoida faylda yozilgan, lekin buzilyaptimi? → u fitness function bo'lishi kerak (83-bob), matn emas.
```

## Psevdokod: natijani tekshirish

```text
Avtomatik darvoza (har o'zgarishda, odamdan oldin):
  typecheck, lint, testlar                         → "ishlaydi"
  fitness function'lar: import chegaralari, sikllar → "arxitekturaga mos"
  shartnoma diff (OpenAPI, hodisa sxemasi)          → "klientlarni buzmaydi" (58-bob)
  bog'liqlik audit, secret scan                     → "xavfsiz" (76-bob)

Odam review'i — avtomatlashtirib bo'lmaydigan savollar:
  □ to'g'ri muammo hal qilinganmi (vazifa noto'g'ri tushunilmaganmi)?
  □ to'g'ri joyda (modul, qatlam)? mavjud kod takrorlanmaganmi?
  □ chekka holatlar: bo'sh, null, parallel so'rov, retry, katta hajm?
  □ xavfsizlik: avtorizatsiya, kiritma tekshiruvi, sir yo'qmi (77-bob)?
  □ o'zim tushuntira olamanmi? Tushuntira olmasam — qabul qilmayman.

Diff kichik bo'lsin: 2000 qatorlik AI PR'ini hech kim chinakam review qilmaydi.
```

## Psevdokod: qayerda AI kuchli, qayerda ehtiyot bo'lish kerak

```text
Kuchli:                                   Ehtiyot (odam qarori shart):
  aniq naqshli kod (CRUD, DTO, mapper)      chegaralar va modul tuzilmasi
  testlar (ayniqsa chekka holatlar ro'yxati)  ma'lumot modeli, migratsiyalar
  refaktoring mexanik qismi                  xavfsizlik, auth, pul hisoblari
  legacy kodni tushuntirish (82-bob)         ommaviy shartnoma (API, hodisa)
  variantlarni solishtirish loyihasi          qaytarilmaydigan qarorlar (83-bob)
  hujjat va ADR qoralamasi                   "nega" — biznes konteksti

Variantlar uchun AI'dan foydalaning: "3 ta yondashuv, har birining trade-off'i" —
lekin tanlov va ADR'dagi imzo — sizniki.
```

## Framework'larda

| Darvoza | Qayerda |
| --- | --- |
| Kod sifati va statik tahlil | [Symfony 34](../symfony/34-kod-sifati.md), [React 46](../react/46-kod-sifati.md), [Vue 55-bob](../vue/55-kod-sifati.md) |
| Arxitektura qoidalari (Deptrac, boundaries) | [Symfony 39](../symfony/39-arxitektura.md), [Arxitektura 83-bob](83-evolyutsion-arxitektura.md) |
| Testlar | [Arxitektura 35](35-backend-testlash.md), [52-bob](52-frontend-testlash.md); [Laravel 29](../laravel/29-testlash.md), [Angular 71-bob](../angular/71-birlik-testlari.md) |
| ADR va C4 | [Arxitektura 7-bob](07-c4-va-adr.md) |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Katta vazifalarni AI'ga berish | Tezlik | Review qiyin, global xatolar |
| Kichik, aniq vazifalar | Sifat, oson review | Vazifani bo'lishga vaqt |
| Batafsil qoidalar fayli | Izchil natija | Yangilab borish kerak, eskirsa — zarar |
| Qat'iy avtomatik darvozalar | Eroziya to'xtaydi | Sozlash va CI vaqti |
| AI'siz ishlash | To'liq nazorat | Raqobatda sekinlik |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Noaniq vazifa | Tez yozilgan noto'g'ri kod | Maqsad, joy, chegaralar, qabul mezonlari |
| Tushunmagan kodni qabul qilish | Keyin hech kim tuzata olmaydi | "Tushuntira olmasam — qabul qilmayman" |
| Katta AI PR'lari | Review yuzaki | Kichik diff'lar |
| Qoidalar faqat promptda | Buziladi | Fitness function'lar CI'da |
| AI'ga arxitektura qarorini topshirish | Kontekstsiz "o'rtacha" yechim | Variantlarni so'rash, qarorni o'zingiz qilish |
| Testlarni ham, kodni ham bir xil so'rovda yozdirish | Testlar kod xatosini "tasdiqlaydi" | Avval qabul mezonlari va testlar, keyin kod |

## Amaliyot

1. Loyihangiz uchun AI qoidalar faylini yozing: modullar, konvensiyalar, buyruqlar, taqiqlar.
2. Keyingi vazifani yuqoridagi shablon bo'yicha yozing va natijani oddiy so'rov natijasi bilan solishtiring.
3. Oxirgi AI yordamida yozilgan PR'ni review checklist bo'yicha qayta ko'rib chiqing.
4. Qoidalar faylidagi bitta qoidani fitness function'ga aylantiring.

## Manbalar

- Anthropic — *Claude Code best practices*
- Martin Fowler sayti — *Exploring Generative AI* maqolalar turkumi <https://martinfowler.com/articles/exploring-gen-ai.html>
- Neal Ford va boshq. — *Building Evolutionary Architectures* (fitness function'lar)
