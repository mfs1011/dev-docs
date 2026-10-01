# 84 — Qaror qabul qilish

[← Oldingi: Evolyutsion arxitektura](83-evolyutsion-arxitektura.md) · [Mundarija](README.md) · [Keyingi: LLM integratsiyasi →](85-llm-integratsiyasi.md)

## Tushuncha

Arxitektorning asosiy ishi — diagramma chizish emas, **qaror qabul qilish va uni tushuntirish**. Har qaror — trade-off (2-bob): "eng yaxshi" yechim yo'q, faqat kontekstga eng mos yechim bor.

Qaror jarayoni:

| Bosqich | Savol |
| --- | --- |
| **Kontekst** | Qanday muammo? Qanday cheklovlar (vaqt, jamoa, byudjet, mavjud tizim)? |
| **Mezonlar** | Qaysi sifat atributlari muhim va qaysi tartibda? |
| **Variantlar** | Kamida 2–3 ta, shu jumladan "hech narsa qilmaslik" |
| **Tahlil** | Har variant mezonlar bo'yicha; xavflar |
| **Qaror va hujjat** | ADR (7-bob) |
| **Qayta ko'rish** | Qachon va qaysi signal bo'yicha qaror qayta ko'riladi |

## Nega shunday

Hujjatsiz qarorlar ikki marta qimmatga tushadi: birinchi — yangi odam "nega bunday?" deb so'raydi va javob yo'q; ikkinchi — kimdir "bu xato" deb uni o'zgartiradi va bir yil oldin hal qilingan muammo qaytadi. ADR'ning eng qimmatli qismi — **rad etilgan variantlar va nima uchun**.

## Psevdokod: trade-off matritsasi

```text
Muammo: buyurtma hodisalari 4 servisga yetkazilishi kerak
Mezonlar (og'irlik):  ishonchlilik 5, ops yuki 4, jamoa tajribasi 3, narx 2

                       | Ishonchl. | Ops | Tajriba | Narx | Jami
  A: DB outbox + cron  |    4      |  5  |    5    |  5   | 20+20+15+10 = 65
  B: RabbitMQ          |    4      |  3  |    4    |  4   | 20+12+12+8  = 52
  C: Kafka (managed)   |    5      |  3  |    2    |  2   | 25+12+6+4   = 47

Natija: A — hozircha. Qayta ko'rish signali: > 500 hodisa/s yoki 10+ iste'molchi.

Ogohlantirish: raqamlar — muhokama vositasi, kalkulyator emas.
Agar natija ichki sezgiga zid bo'lsa — mezon yoki og'irlik yetishmayapti, uni toping.
```

## Psevdokod: ADR shabloni

```text
# ADR-0017: Hodisalarni yetkazish uchun transactional outbox

Holat:    Qabul qilingan (2026-10-01)   | O'rnini bosgan: — | Bekor qilingan: —
Kontekst: Buyurtma hodisalari 4 servisga; hozir to'g'ridan-to'g'ri HTTP — xato bo'lsa yo'qoladi.
          Jamoa 5 kishi, broker tajribasi kam, ops — 1 kishi.
Qaror:    DB outbox jadvali + worker (27-bob). Broker hozircha yo'q.
Variantlar:
  - RabbitMQ — rad: qo'shimcha infratuzilma, foyda hozir kichik
  - Kafka    — rad: ops yuki va tajriba yo'q; hajm talab qilmaydi
Oqibatlar:
  + ma'lumot yo'qolmaydi, yangi infratuzilma yo'q
  − kechikish 1–5 s; iste'molchilar idempotent bo'lishi kerak (70-bob)
Qayta ko'rish: > 500 hodisa/s yoki 10+ iste'molchi
```

## Psevdokod: kim qaror qiladi

```text
Markazlashgan ("arxitektor qaror qiladi") — sekin, bottleneck, jamoalar mas'uliyatni his qilmaydi
To'liq erkin ("har jamoa o'zi") — 5 xil logging, 3 xil auth, izchillik yo'q

Muvozanat — arxitektura maslahat jarayoni (Andrew Harmel-Law):
  - har kim qaror qabul qilishi mumkin
  - SHART: avval ta'sir qiladiganlar va ekspertlardan maslahat so'rash
  - qaror va maslahatlar — ADR'da
  - haftalik ochiq "arxitektura maslahat forumi" (qaror emas, maslahat)

Qaror darajalari:
  jamoa ichida (modul tuzilmasi)    → jamoa, ADR ixtiyoriy
  jamoalararo (shartnoma, hodisa)   → maslahat jarayoni + ADR
  tashkilot (til, bulut, auth)      → platforma/arxitektura guruhi + ADR + "texnologiya radari"
```

## Psevdokod: qaror tuzoqlari

```text
Rezyume asosidagi dizayn — "Kafka'ni sinab ko'rmoqchiman"
Mode bo'yicha — "hamma mikroservisga o'tyapti"
Cho'kkan xarajat — "6 oy sarfladik, endi qaytib bo'lmaydi"
Bitta variant — "boshqa yo'l yo'q" (doim bor: hech narsa qilmaslik ham variant)
Analiz falaji — qaytariladigan qarorga 3 hafta (83-bob: ikki tomonlama eshik)
HiPPO — eng ko'p maosh oluvchining fikri (dalil o'rniga)

Qarshi vosita: "Qaysi dalil bizning fikrimizni o'zgartiradi?" — oldindan yozib qo'yish
```

## Framework'larda

Framework tanlash ham — arxitektura qarori, va bu sayt shu qarorni qo'llab-quvvatlash uchun yozilgan:

| Savol | Qayerda |
| --- | --- |
| Symfony yoki Laravel? Lug'at va farqlar | [Laravel 34-bob](../laravel/34-symfony-laravel-lugat.md), [Laravel 1-bob](../laravel/01-kirish.md) |
| Symfony'da arxitektura qarorlari | [Symfony 39-bob](../symfony/39-arxitektura.md) |
| React'da arxitektura | [React 34-bob](../react/34-arxitektura.md) |
| Render strategiyasi tanlash | [Arxitektura 37](37-render-strategiyasi.md), [Next.js 3-bob](../nextjs/03-render-strategiyalari.md) |
| ADR va C4 | [Arxitektura 7-bob](07-c4-va-adr.md) |

Vositalar: ADR fayllari git'da (`docs/adr/`), `adr-tools` yoki `log4brains`; texnologiya radari (Thoughtworks formati).

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Har qarorga ADR | To'liq tarix | Byurokratiya xavfi — faqat muhimlariga |
| Markazlashgan qaror | Izchillik | Sekinlik, bottleneck |
| Maslahat jarayoni | Tezlik + izchillik | Madaniyat va ishonch talab qiladi |
| Tez qaror | Harakat tezligi | Qaytarilmaydigan qarorda xavfli |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Rad etilgan variantlar yozilmaydi | Muhokama qayta-qayta takrorlanadi | ADR'da "Variantlar" bo'limi |
| Bitta variant ko'rib chiqiladi | Tasdiqlash xatosi | Kamida 2–3, shu jumladan "hech narsa" |
| Qayta ko'rish sharti yo'q | Eskirgan qaror abadiy qoladi | Aniq signal |
| ADR'lar o'zgartiriladi | Tarix yo'qoladi | Yangi ADR "o'rnini bosadi" |
| Kontekst yozilmaydi | Keyin qaror ahmoqona ko'rinadi | Cheklovlarni aniq yozish |

## Amaliyot

1. Oxirgi muhim texnik qaroringiz uchun ADR yozing — rad etilgan variantlari bilan.
2. Hozirgi ochiq savolingiz uchun trade-off matritsasini tuzing va jamoa bilan muhokama qiling.
3. Loyihangizda `docs/adr/` papkasini oching va birinchi 3 ta ADR'ni (orqaga qarab) yozing.
4. Bitta qaror uchun "qaysi dalil fikrimizni o'zgartiradi?" savoliga javob yozing.

## Manbalar

- Michael Nygard — *Documenting Architecture Decisions* (2011)
- Andrew Harmel-Law — *Facilitating Software Architecture*
- Neal Ford, Mark Richards — *Fundamentals of Software Architecture*, 19-bob
- ADR GitHub tashkiloti <https://adr.github.io/>
