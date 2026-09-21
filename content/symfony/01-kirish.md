# 01 — Symfony nima va nega shunday

[Mundarija](README.md) · [Keyingi: O'rnatish va ishga tushirish →](02-ornatish-va-ishga-tushirish.md)

---

## Tushuncha: ikki xil Symfony

"Symfony" so'zi ikki narsani anglatadi va ularni aralashtirish — yangi boshlovchining birinchi xatosi:

1. **Symfony Components** — mustaqil PHP kutubxonalar to'plami (`symfony/http-foundation`, `symfony/console`, `symfony/validator`, ...). Har biri alohida `composer require` qilinadi va Symfony'siz ham ishlaydi. Laravel, Drupal, Magento, phpBB — hammasi shu komponentlardan foydalanadi.
2. **Symfony Framework** — o'sha komponentlarni bitta ilovaga bog'lab beruvchi qatlam (`symfony/framework-bundle` + Flex + skeleton).

Bu bo'linish tasodifiy emas. U **"framework — bu kutubxonalar ustidagi yupqa integratsiya qatlami"** degan falsafadan kelib chiqadi: siz kerak bo'lgan qismni olasiz, keraksizini olmaysiz.

```shell
# Faqat bitta komponent — framework'siz
composer require symfony/http-client

# To'liq framework (API/mikroservis uchun minimal skeleton)
symfony new my_api --version="8.1.*"

# To'liq framework + Twig, Doctrine, Security, Mailer va h.k.
symfony new my_app --version="8.1.*" --webapp
```

---

## Nega shunday: uchta asosiy qaror

### 1. Aniqlik (explicit) > sehr (magic)

Symfony'da "o'zidan-o'zi ishlaydigan" narsa kam; deyarli hamma narsa konfiguratsiyada yoki atributda ko'rinib turadi. Route qayerdan kelgani, qaysi servis qaysi interfeys uchun ishlatilayotgani — hammasi `bin/console` buyruqlari bilan ko'rsatilishi mumkin:

```shell
php bin/console debug:router           # barcha route'lar
php bin/console debug:autowiring       # qaysi interfeys qaysi servisga bog'langan
php bin/console debug:event-dispatcher # qaysi listener qaysi eventda, qanday prioritet bilan
php bin/console debug:config framework # framework konfiguratsiyasining yakuniy holati
```

**Nega?** Katta jamoada va 5 yil yashaydigan kod bazasida "bu qayerdan kelayapti?" degan savolga javob topish tezligi — asosiy unumdorlik omili. Sehrli qisqartmalar yozishni tezlashtiradi, o'qishni sekinlashtiradi; Symfony ikkinchisini tanlagan.

### 2. Bog'liqlik inversiyasi (DI) — ixtiyoriy emas, asosiy

Symfony'da ilovangizning har bir bo'lagi — **servis**, va servislar bir-birini `new` bilan yaratmaydi, konteyner ularni konstruktorga uzatadi ([05-bob](05-service-container.md)). Bu Symfony'ning eng muhim arxitektura qarori: u testlanuvchanlikni, almashtiriluvchanlikni va kompilyatsiya vaqtidagi tekshiruvni beradi.

### 3. Standartlarga sodiqlik

PSR-4 (autoload), PSR-3 (log), PSR-6/PSR-16 (cache), PSR-11 (container), PSR-7 (ixtiyoriy ko'prik orqali). Natijada Symfony ekotizimidan tashqaridagi kutubxona ham ishlaydi.

---

## Versiya siyosati va BC va'dasi

Bu — professional darajadagi eng muhim bo'lim, chunki u sizning **yangilash strategiyangizni** belgilaydi.

| Tushuncha | Ma'nosi |
| --- | --- |
| Minor relizlar | Har 6 oyda: may va noyabr (8.1 → 8.2 → 8.3 ...) |
| Major relizlar | Har 2 yilda (7.0, 8.0 ...) |
| LTS | Har majorning oxirgi minori (7.4): 3 yil bugfix, 4 yil xavfsizlik |
| Semver | Minor **hech qachon** BC buzmaydi; faqat major buzadi |
| Deprecation | Minor'da eskirgan API `trigger_deprecation()` bilan ogohlantiradi, lekin ishlashda davom etadi |

**Amaliy natija — Symfony'ni yangilash bir marta qilinadigan "katta migratsiya" emas, doimiy kichik ish:**

1. Minor versiyaga chiqasiz (masalan 8.1 → 8.2) — kod buzilmaydi.
2. `dev`/test muhitida deprecation loglarini o'qiysiz (Profiler'da alohida panel bor).
3. Deprecation'larni birma-bir tuzatasiz.
4. Major chiqqanda (9.0) migratsiya deyarli nolga teng bo'ladi — chunki ogohlantirishlar allaqachon tuzatilgan.

BC va'dasi **nimani qamramaydi** — bu ham muhim:

| Belgi | Ma'nosi | Sizga qoida |
| --- | --- | --- |
| `@internal` | Symfony ichki ishlatadi | Hech qachon ishlatmang, extends qilmang |
| `@experimental` | API hali barqaror emas (bir minorgacha) | Production'da ehtiyot bo'ling |
| `@final since Symfony 8.1` | Keyingi majorda `final` bo'ladi | Extends qilmang, dekorator ishlating ([06-bob](06-container-chuqur.md)) |

---

## Muhandislik nuqtai nazari: framework tanlash mezonlari

Junior "qaysi framework yaxshi?" deb so'raydi. Senior boshqa savol beradi: **"loyihaning 5 yillik umri davomida qaysi xarajat katta — yozish xarajatimi yoki o'zgartirish xarajatimi?"**

- **Yozish xarajati past** bo'lgan freymvorklar konvensiya va sehrga tayanadi: tez start, lekin kod bazasi kattalashganda "bu qayerdan?" savollari va yashirin bog'liqliklar ko'payadi.
- **O'zgartirish xarajati past** bo'lgan freymvorklar aniqlik va DI'ga tayanadi: start sekinroq, lekin refaktoring, test va jamoada parallel ishlash arzon.

Symfony — ikkinchi lager. Shuning uchun u banklar, telekom, e-commerce platformalar va uzoq yashaydigan korporativ tizimlarda ustun.

Yana bir muhim jihat — **kuplaj (coupling) yo'nalishi**. Symfony sizni o'z interfeyslariga (`LoggerInterface`, `CacheInterface`, `MailerInterface`) bog'laydi, konkret implementatsiyaga emas. Bu — Dependency Inversion Principle (SOLID'dagi "D"). Natijada Monolog'ni boshqa loggerga, Doctrine'ni boshqa saqlovchiga almashtirish nazariy emas, amaliy imkon bo'lib qoladi.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Blog postlardagi Symfony 4/5 kodini 8.x da ishlatish | 5 yil ichida katta qism deprecate bo'lgan (`@Route` annotation, `ContainerAwareCommand`, `getDoctrine()`) | `symfony.com/doc/current` — `current` doim eng oxirgi stable |
| "Symfony sekin" deb boshqa framework'ga o'tish | `dev` muhit qasddan sekin (profiler, deprecation, cache invalidation). `prod` butunlay boshqa | `APP_ENV=prod` da o'lchang ([33-bob](33-unumdorlik.md)) |
| LTS'ni "eng yaxshi" deb bilish | LTS = yangi feature yo'q, faqat tuzatish. Aktiv loyiha uchun eskirish tezlashadi | Aktiv rivojlanayotgan loyiha: stable. Muzlatilgan loyiha: LTS |
| Deprecation loglarini e'tiborsiz qoldirish | Major chiqqanda migratsiya haftalarga cho'ziladi | Har sprintda deprecation'larni nolga tushirish — CI qoidasi |
| `@internal` klassni extends qilish | Minor yangilanishda kod buziladi, BC va'dasi himoya qilmaydi | Ommaviy interfeys yoki dekorator |

---

## Amaliyot

1. `symfony new symfony_book --version="8.1.*" --webapp` bilan loyiha yarating (keyingi boblarda shu loyihada ishlaymiz).
2. `php bin/console about` chiqishini o'qing: versiya, muhit, cache papkasi, OPcache holati. Har qatorining ma'nosini o'zingizga aytib bering.
3. `composer show --direct` bilan o'rnatilgan komponentlar ro'yxatini ko'ring. Ulardan 5 tasini tanlab, `symfony.com/components` da nima qilishini o'qing.
4. `php bin/console debug:event-dispatcher kernel.request` ni ishga tushiring. Hozircha tushunmasangiz ham, chiqishini saqlab qo'ying — [04-bob](04-sorov-hayot-sikli.md) da shu jadvalga qaytamiz.
5. `symfony.com/releases` sahifasidan hozirgi LTS va uning qo'llab-quvvatlash muddatini yozib oling.

---

## Rasmiy hujjat

- Symfony haqida umumiy: <https://symfony.com/what-is-symfony>
- Relizlar va qo'llab-quvvatlash muddatlari: <https://symfony.com/releases>
- Backward Compatibility va'dasi: <https://symfony.com/doc/current/contributing/code/bc.html>
- Best Practices: <https://symfony.com/doc/current/best_practices.html>
- Komponentlar ro'yxati: <https://symfony.com/components>

---

[Mundarija](README.md) · [Keyingi: O'rnatish va ishga tushirish →](02-ornatish-va-ishga-tushirish.md)
