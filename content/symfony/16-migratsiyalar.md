# 16 — Migratsiyalar

[← Oldingi: Doctrine asoslari](15-doctrine-asoslari.md) · [Mundarija](README.md) · [Keyingi: Repository, DQL, QueryBuilder →](17-repository-va-dql.md)

---

## Nima uchun migratsiya

Baza sxemasi — kodning bir qismi va u **kod bilan birga versiyalanishi** kerak. Migratsiya bu muammoni hal qiladi: har o'zgarish nomerlangan fayl bo'ladi, bajarilganlari `doctrine_migration_versions` jadvalida qayd etiladi, va har muhitda aynan bir xil tartibda qo'llanadi.

```yaml
# config/packages/doctrine_migrations.yaml
doctrine_migrations:
    migrations_paths:
        'DoctrineMigrations': '%kernel.project_dir%/migrations'
    enable_profiler: false
```

---

## Ish oqimi

```shell
# 1. Entity'ni o'zgartirdingiz
php bin/console make:entity Post

# 2. Farqdan migratsiya generatsiya qiling
php bin/console make:migration
#    (yoki to'g'ridan-to'g'ri: php bin/console doctrine:migrations:diff)

# 3. Generatsiya qilingan SQL ni O'QING va kerak bo'lsa tuzating

# 4. Qo'llang
php bin/console doctrine:migrations:migrate

# Holatni ko'rish
php bin/console doctrine:migrations:status
php bin/console doctrine:migrations:list
```

Generatsiya qilingan fayl:

```php
declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260921093000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'posts jadvaliga published_at ustuni va indeks qo\'shish';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE posts ADD published_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('CREATE INDEX idx_posts_status_published ON posts (status, published_at)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX idx_posts_status_published');
        $this->addSql('ALTER TABLE posts DROP published_at');
    }
}
```

**`getDescription()` ni to'ldiring.** Olti oydan keyin `Version20260921093000` nomli fayl nima qilganini hech kim eslay olmaydi; tavsif `migrations:list` chiqishida ko'rinadi.

---

## Boshqa foydali buyruqlar

```shell
php bin/console doctrine:migrations:migrate --dry-run            # SQL ni ko'rsatadi, bajarmaydi
php bin/console doctrine:migrations:migrate prev                 # bitta orqaga (down())
php bin/console doctrine:migrations:migrate 'DoctrineMigrations\Version20260921093000'
php bin/console doctrine:migrations:generate                     # bo'sh migratsiya (ma'lumot ko'chirish uchun)
php bin/console doctrine:migrations:up-to-date                   # CI uchun: sxema yangimi
php bin/console doctrine:migrations:version 'DoctrineMigrations\Version...' --add   # bajarilgan deb belgilash
```

Deploy uchun standart chaqiruv:

```shell
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration
```

`--allow-no-migration` — yangi migratsiya bo'lmasa deploy skripti xato bilan tugamasligi uchun.

---

## Xavfsiz sxema o'zgarishlari (production)

Bu bo'lim — junior va senior farqining eng aniq ko'rinadigan joyi. Migratsiya **ishlab turgan tizimda** bajariladi: eski kod hali ishlayapti, yangi kod endi chiqmoqda.

### Kengaytir–ko'chir–qisqartir (expand–migrate–contract)

Ustun nomini o'zgartirish kerak, deylik `name` → `full_name`. Bitta `ALTER TABLE ... RENAME` — deploy paytida xatolik demakdir: eski kod hali `name` ni yozadi.

To'g'ri yo'l — uch deploy:

| Qadam | Migratsiya | Kod |
| --- | --- | --- |
| 1. Kengaytirish | `full_name` ustunini `NULL` bilan qo'shish | Kod ikkala ustunga yozadi, `name` dan o'qiydi |
| 2. Ko'chirish | Ma'lumotni `name` dan `full_name` ga ko'chirish (batch bilan) | Kod `full_name` dan o'qishga o'tadi |
| 3. Qisqartirish | `name` ustunini o'chirish | Kod faqat `full_name` bilan ishlaydi |

### Qulflanishdan ehtiyot bo'ling

- **`NOT NULL` ustunini standart qiymat bilan qo'shish** ba'zi baza versiyalarida butun jadvalni qayta yozadi va uni qulflaydi. Avval `NULL` bilan qo'shing, to'ldiring, keyin `NOT NULL` qiling.
- **Indeksni odatdagidek yaratish** jadvalni yozuvdan qulflaydi. PostgreSQL'da `CREATE INDEX CONCURRENTLY` ishlating — lekin u tranzaksiya ichida ishlamaydi:

```php
public function up(Schema $schema): void
{
    $this->addSql('CREATE INDEX CONCURRENTLY idx_posts_author ON posts (author_id)');
}

public function isTransactional(): bool
{
    return false;   // CONCURRENTLY tranzaksiyada bajarilmaydi
}
```

- **Katta jadvalda `UPDATE`** — bitta so'rovda emas, bo'laklab (`WHERE id BETWEEN ...`) yoki alohida konsol buyrug'i orqali.

### Migratsiyada entity ishlatmang

```php
// ❌ noto'g'ri — migratsiya kelajakdagi entity'ga bog'lanadi
$posts = $this->em->getRepository(Post::class)->findAll();
```

Migratsiya — tarixning bir nuqtasi. Entity esa o'zgarib turadi: bugun ishlagan migratsiya, entity o'zgargandan keyin ishlamay qoladi. Migratsiya ichida faqat **xom SQL** yozing.

---

## Muhandislik nuqtai nazari: sxema migratsiyasi — deploy strategiyasining bir qismi

Migratsiyani "baza yangilash" emas, **nol to'xtovli deployning bir bosqichi** deb qarang. Shundan quyidagilar kelib chiqadi:

1. **Orqaga va oldinga moslik.** Deploy davomida eski va yangi kod bir vaqtda ishlaydi (rolling deploy). Demak sxema ikkalasini ham qoniqtirishi kerak — expand–contract naqshi aynan shuning uchun.
2. **Migratsiya idempotent bo'lmasa ham, qayta ishga tushirishga chidamli bo'lsin.** Ma'lumot ko'chirishda `WHERE full_name IS NULL` shartini qo'shing: yarim bajarilgan migratsiya qayta ishga tushganda dublikat yaratmaydi.
3. **`down()` ni yozing, lekin unga ishonmang.** Production'da rollback odatda ma'lumot yo'qotish demak. Haqiqiy strategiya — "oldinga tuzatish" (fix forward): yangi migratsiya bilan tuzatish.
4. **Migratsiyalar CI'da tekshirilsin.** Bo'sh bazada barcha migratsiyalarni ketma-ket ishga tushirish — CI bosqichi. Bu "faqat mening mashinamda ishlaydi" holatini yo'q qiladi.

Bu — "evolutionary database design" amaliyoti: sxema kod kabi, kichik qadamlar bilan, teskari qaytarilishi hisobga olingan holda o'zgaradi.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Generatsiya qilingan SQL ni o'qimay qo'llash | `diff` ba'zan ortiqcha/xavfli SQL yozadi (masalan ustun o'chirish) | Har doim qo'lda ko'rib chiqing |
| Ustunni bir deployda qayta nomlash | Eski kod ishlamay qoladi | Expand–migrate–contract |
| Migratsiyada entity/repository ishlatish | Kelajakda buziladi | Xom SQL |
| Production'da `doctrine:schema:update --force` | Ma'lumot yo'qotish, tarix yo'q | Faqat migratsiya |
| Katta jadvalda oddiy `CREATE INDEX` | Yozuv qulflanadi, downtime | `CONCURRENTLY` + `isTransactional(): false` |
| `getDescription()` ni bo'sh qoldirish | Tarixni o'qib bo'lmaydi | Bir jumla yozing |
| Bir nechta dasturchi bir vaqtda `diff` qilishi | Ketma-ketlik konflikti | Merge'dan keyin `status` bilan tekshiring |
| Migratsiyani CI'da sinamaslik | Deploy paytida yiqilish | CI'da bo'sh bazaga `migrate` |

---

## Amaliyot

1. `Post` entity'ga `publishedAt` maydonini qo'shing, `make:migration` bilan migratsiya yarating va SQL ni o'qing.
2. `--dry-run` bilan ishga tushirib, aynan qaysi SQL bajarilishini ko'ring.
3. `doctrine:migrations:migrate prev` bilan orqaga qaytaring va `down()` to'g'ri ishlaganini tekshiring.
4. Bo'sh migratsiya yarating (`migrations:generate`) va unda ma'lumot ko'chirish SQL yozing (`UPDATE ... WHERE ... IS NULL`).
5. `doctrine:migrations:up-to-date` buyrug'ini CI bosqichi sifatida qanday ishlatishni yozib qo'ying ([40-bob](40-deploy-va-checklist.md)).

---

## Rasmiy hujjat

- DoctrineMigrationsBundle: <https://symfony.com/doc/current/bundles/DoctrineMigrationsBundle/index.html>
- Doctrine Migrations (rasmiy): <https://www.doctrine-project.org/projects/doctrine-migrations/en/current/index.html>
- Doctrine bilan ishlash: <https://symfony.com/doc/current/doctrine.html>

---

[← Oldingi: Doctrine asoslari](15-doctrine-asoslari.md) · [Mundarija](README.md) · [Keyingi: Repository, DQL, QueryBuilder →](17-repository-va-dql.md)
