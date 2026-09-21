# Pattern katalogi

[← Asosiy mundarija](../README.md)

---

## Bu katalog nima va nega alohida

40 bobdagi qo'llanma — **o'rganish yo'li**: tartib bilan o'qiladi, har bob oldingisiga tayanadi.

Bu katalog — **ishlash paytidagi ma'lumotnoma**: kod yozayotganda "shu holatda qanday qilish to'g'ri?" degan savolga bir sahifada javob beradi. Har pattern bitta takrorlanadigan muammoni va uning tajribada sinalgan yechimini tasvirlaydi.

Ular **alohida** turibdi, chunki ikki xil ehtiyoj:

| Ehtiyoj | Qayerga qarash |
| --- | --- |
| "Symfony'da Messenger qanday ishlaydi?" | [26-bob](../26-messenger.md) |
| "Handler ikki marta chaqirilsa nima bo'ladi?" | [P-24 Idempotent handler](04-async.md) |

---

## Muhim ogohlantirish

Pattern — **retsept emas, vosita**. Har birining narxi bor: qo'shimcha klass, qo'shimcha bilvositalik, jamoaga o'rgatish vaqti.

Shuning uchun har patternda **"Qachon kerak emas"** bo'limi bor va u sarlavhadan kam muhim emas. Pattern'ni muammo paydo bo'lmasdan qo'llash — texnik qarzning eng keng tarqalgan manbayi.

Amaliy tartib:

1. Oddiy yo'l bilan yozing.
2. Og'riq paydo bo'lsin (takrorlanish, test qilib bo'lmaslik, bag qaytishi).
3. Og'riqqa mos pattern'ni qo'llang.
4. Qarorni yozib qo'ying (ADR — [39-bob](../39-arxitektura.md)).

---

## Katalog

| Fayl | Nima haqida | Patternlar |
| --- | --- | --- |
| [01 — HTTP qatlami](01-http-qatlam.md) | Kirish/chiqish, kontroller, xatolar | P-01 … P-07 |
| [02 — Domen modeli](02-domen.md) | Entity, invariantlar, holat, hodisalar | P-08 … P-15 |
| [03 — Persistence](03-persistence.md) | Repository, so'rovlar, tranzaksiya | P-16 … P-22 |
| [04 — Asinxron ishlov](04-async.md) | Messenger, retry, idempotentlik | P-23 … P-28 |
| [05 — Xizmatlar va DI](05-xizmat-va-di.md) | Strategiya, dekorator, tashqi API | P-29 … P-35 |
| [06 — Testlash](06-testlash.md) | Test ma'lumoti, chegara, regressiya | P-36 … P-41 |
| [07 — Antipatternlar](07-antipatternlar.md) | Nima qilmaslik kerak va nega | A-01 … A-16 |

---

## Pattern formati

Har pattern to'rt savolga javob beradi:

- **Muammo** — qanday holat va nima og'riydi;
- **Yechim** — ishlaydigan kod;
- **Qachon kerak emas** — qo'llash zarar keltiradigan holat;
- **Bog'liq** — tegishli boblar va boshqa patternlar.

---

[← Asosiy mundarija](../README.md) · [01 — HTTP qatlami →](01-http-qatlam.md)
