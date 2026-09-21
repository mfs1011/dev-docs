# Symfony 8.1 — noldan production darajasigacha

Bu qo'llanma **rasmiy hujjat** (<https://symfony.com/doc/current>) asosida yozilgan va haqiqiy loyihada tekshirilgan. Tekshiruv muhiti — `symfony new demo --webapp` buyrug'i bilan yaratilgan toza skeleton:

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Symfony | 8.1.7 (stable, LTS emas) | `php bin/console about` |
| PHP | 8.5.7 (Symfony 8.1 minimum — 8.4) | `php -v` |
| Symfony CLI | 5.17.1 | `symfony version` |
| Composer | 2.10.1 | `composer --version` |
| Doctrine ORM | 3.7.1 (`doctrine/doctrine-bundle` 3.3.2) | `composer show --direct` |
| Doctrine Migrations Bundle | 4.0.1 | `composer show --direct` |
| PHPUnit | 13.3.4 | `composer show --direct` |
| MakerBundle | 1.68.0 | `composer show --direct` |

> **Versiya siyosati.** Symfony har 6 oyda minor (may va noyabr), har 2 yilda major chiqaradi. Har majorning oxirgi minori — LTS (3 yil bugfix, 4 yil xavfsizlik). Hozirgi LTS — **7.4** (bugfix 2028-11 gacha), 8.1 esa oddiy stable (2027-01 gacha). Yangi loyihada 8.x, uzoq muddatli korporativ loyihada 7.4 LTS mantiqan to'g'ri. Qo'llanmadagi kod 8.1 uchun; 7.4 dan farq qiladigan joylarda alohida eslatma bor.

---

## Bu qo'llanma kimga va nimaga

Siz Symfony bilan tanishsiz, lekin "nima yozishni bilaman, nega shunday yozilishini bilmayman" darajasidasiz. Bu qo'llanmaning maqsadi — sizni **shu darajadan olib chiqish**: har bobda faqat API emas, uning ostidagi mexanizm, qaror sabablari va production'da nima buzilishi ko'rsatiladi.

Shuning uchun har bobda quyidagi bo'limlar bor:

- **Tushuncha** — nima va qaysi muammoni yechadi.
- **Nega shunday** — Symfony jamoasi nega aynan shu dizaynni tanlagan; ichkarida nima bo'ladi.
- **Kod** — ishlaydigan, to'liq misollar (qisqartirilgan "..." lar minimal).
- **Muhandislik nuqtai nazari** — umumiy dasturlash bilimi (dizayn patternlar, HTTP semantikasi, ma'lumotlar bazasi ichki ishlashi, konkurrentlik, keshlash, xavfsizlik) aynan Symfony konteksida.
- **Tipik xatolar** — jadval: noto'g'ri yondashuv → nega yomon → to'g'ri yechim.
- **Amaliyot** — mashq; mashqlar bir-biriga ulanadi va 32-bobdagi to'liq loyihaga yig'iladi.
- **Rasmiy hujjat** — o'sha mavzuning `symfony.com/doc/current/...` havolalari.

---

## I qism — Poydevor (1–8)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 01 | [Symfony nima va nega shunday](01-kirish.md) | Komponentlar, falsafa, versiya siyosati |
| 02 | [O'rnatish va ishga tushirish](02-ornatish-va-ishga-tushirish.md) | CLI, Flex, `symfony server:start`, `.env` |
| 03 | [Papkalar tuzilmasi va Kernel](03-papkalar-va-kernel.md) | `src/`, `config/`, `var/`, `MicroKernelTrait` |
| 04 | [So'rovning hayot sikli](04-sorov-hayot-sikli.md) | `index.php` → `HttpKernel` → `Response` |
| 05 | [Service container va autowiring](05-service-container.md) | DI, `services.yaml`, `#[Autowire]` |
| 06 | [Container: chuqur qatlam](06-container-chuqur.md) | Tag, compiler pass, decorator, lazy, locator |
| 07 | [Bundlelar va Flex retseptlari](07-bundle-va-flex.md) | Bundle nima, retsept, `symfony.lock` |
| 08 | [Konfiguratsiya va muhitlar](08-konfiguratsiya.md) | `when@`, parametrlar, env processor, secrets |

## II qism — HTTP qatlami (9–14)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 09 | [Routing](09-routing.md) | `#[Route]`, requirements, prioritet, URL generatsiya |
| 10 | [Kontrollerlar](10-kontrollerlar.md) | `AbstractController`, argument resolver, `#[MapRequestPayload]` |
| 11 | [So'rov va javob (HttpFoundation)](11-request-response.md) | `Request`, `Response`, JSON, fayl, stream |
| 12 | [Event listener va subscriber](12-event-listener.md) | Kernel eventlari, prioritet, `#[AsEventListener]` |
| 13 | [Validatsiya](13-validatsiya.md) | Constraint, `ValidatorInterface`, guruhlar |
| 14 | [Formalar (qisqacha)](14-formalar.md) | Form type, `handleRequest`, CSRF |

## III qism — Ma'lumotlar bazasi (15–19)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 15 | [Doctrine ORM asoslari](15-doctrine-asoslari.md) | Data Mapper, `EntityManager`, `persist`/`flush` |
| 16 | [Migratsiyalar](16-migratsiyalar.md) | `diff`/`migrate`, xavfsiz sxema o'zgarishi |
| 17 | [Repository, DQL, QueryBuilder](17-repository-va-dql.md) | So'rov yozish, indeks, `EXPLAIN` |
| 18 | [Aloqalar va N+1](18-aloqalar.md) | `OneToMany`, `ManyToMany`, `JOIN FETCH` |
| 19 | [Fixtures va test ma'lumotlari](19-fixtures.md) | DoctrineFixturesBundle, Foundry |

## IV qism — API qurish (20–24)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 20 | [Serializer va DTO](20-serializer-va-dto.md) | Guruhlar, normalizer, kontrakt barqarorligi |
| 21 | [REST API: qo'lda va API Platform](21-rest-api.md) | Resurs dizayni, paginatsiya, xato formati |
| 22 | [Xavfsizlik: autentifikatsiya](22-xavfsizlik.md) | `security.yaml`, firewall, authenticator, JWT |
| 23 | [Avtorizatsiya: rollar va Voter](23-avtorizatsiya.md) | `#[IsGranted]`, Voter, ierarxiya |
| 24 | [Xatoliklar va Monolog](24-xatolik-va-log.md) | Exception listener, log kanallari, structured log |

## V qism — Fon ishlari va xizmatlar (25–29)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 25 | [Console buyruqlari va Scheduler](25-console-va-scheduler.md) | `#[AsCommand]`, signal, cron |
| 26 | [Messenger](26-messenger.md) | Transport, handler, retry, failure, idempotentlik |
| 27 | [EventDispatcher va Doctrine hodisalari](27-event-va-doctrine-hodisalari.md) | O'z eventing, lifecycle, `#[AsEntityListener]` |
| 28 | [Cache, Lock, Filesystem, HttpClient](28-cache-lock-httpclient.md) | Kesh strategiyalari, qulf, retry, timeout |
| 29 | [Mailer va Notifier](29-mailer-va-notifier.md) | DSN, async yuborish, shablon |

## VI qism — Sifat va yakun (30–34)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 30 | [Testlash](30-testlash.md) | `WebTestCase`, `KernelTestCase`, tez suite |
| 31 | [Twig va AssetMapper](31-twig-va-asset.md) | Shablon, escaping, importmap |
| 32 | [Amaliy loyiha: to'liq REST API](32-amaliy-loyiha.md) | Entity → migratsiya → DTO → voter → test |
| 33 | [Unumdorlik va profiling](33-unumdorlik.md) | Profiler, OPcache, preload, Blackfire mantiqi |
| 34 | [Kod sifati: PHPStan, CS Fixer, Rector](34-kod-sifati.md) | Statik tahlil, avtomatik refaktoring |

## VII qism — Production darajasi (35–40)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 35 | [Real-time: Mercure](35-mercure.md) | SSE, hub, JWT, private update |
| 36 | [Ko'p tillilik: Translation va Intl](36-tarjima-va-intl.md) | `t()`, ICU, locale, sana/valyuta |
| 37 | [Ilg'or Doctrine](37-ilgor-doctrine.md) | Custom type, batch, lock, ikkinchi daraja kesh |
| 38 | [API pro](38-api-pro.md) | Idempotentlik, ETag, webhook, OpenAPI, versiyalash |
| 39 | [Arxitektura](39-arxitektura.md) | Qatlamlar, CQRS-lite, hexagonal, modul chegarasi |
| 40 | [Deploy, Docker, CI/CD + checklist](40-deploy-va-checklist.md) | Yakuniy production tekshiruv ro'yxati |

---

## Pattern katalogi (ma'lumotnoma)

Boblar — **o'rganish yo'li**. Kod yozayotganda kerak bo'ladigan tayyor yechimlar esa alohida katalogda, mavzu bo'yicha guruhlangan:

| Fayl | Nima haqida |
| --- | --- |
| [Katalog haqida](patterns/README.md) | Qanday ishlatish, pattern formati, ogohlantirish |
| [01 — HTTP qatlami](patterns/01-http-qatlam.md) | Input/Output DTO, yupqa kontroller, xato xaritasi, idempotentlik |
| [02 — Domen modeli](patterns/02-domen.md) | Invariantlar, value object, holat mashinasi, domen hodisalari |
| [03 — Persistence](patterns/03-persistence.md) | Repository, read model, N+1, batch, optimistik qulflash |
| [04 — Asinxron ishlov](patterns/04-async.md) | Buyruq/hodisa, idempotent handler, retry, outbox, worker |
| [05 — Xizmatlar va DI](patterns/05-xizmat-va-di.md) | Strategiya, dekorator, port/adapter, feature flag, holatsizlik |
| [06 — Testlash](patterns/06-testlash.md) | Test ma'lumoti, chegarani mock qilish, so'rovlar soni, kontrakt testi |
| [07 — Antipatternlar](patterns/07-antipatternlar.md) | 16 ta tipik noto'g'ri qaror va ularning sababi |

Har patternda **"Qachon kerak emas"** bo'limi bor — pattern'ni o'rinsiz qo'llash uni umuman qo'llamaslikdan yomonroq.

---

## Qanday o'qish kerak

1. **Tartib bilan.** Har bob oldingisiga tayanadi; 15-bobni 05-bobsiz o'qish mumkin, lekin foydasi kam bo'ladi.
2. **Kodni o'zingiz tering.** Nusxa-ko'chirish o'rganish emas. Har bobda `symfony new` bilan yaratilgan loyihada sinab ko'ring.
3. **Amaliyot bo'limini bajaring.** Ular ketma-ket bitta API loyihasini quradi (32-bob).
4. **Shubha tug'ilsa — rasmiy hujjat.** Har bob oxirida aniq havolalar bor. Ikkinchi manba — `vendor/symfony/...` ichidagi haqiqiy kod: `grep -rn "function handle(" vendor/symfony/http-kernel/HttpKernel.php`.
5. **Profiler'ni oching.** `dev` muhitda har sahifaning pastidagi panel — eng yaxshi o'qituvchi: qaysi so'rov, qancha vaqt, qaysi listener ishladi.

Boshlash: [01 — Symfony nima va nega shunday →](01-kirish.md)
