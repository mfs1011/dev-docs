# 68 — ORM ortidagi SQL

[← Oldingi: Replikatsiya va monitoring](67-replikatsiya-va-monitoring.md) · [Mundarija](README.md) · [Keyingi: Dialektlar xaritasi →](69-dialektlar-xaritasi.md)

## Tushuncha

**ORM** (Object-Relational Mapping — obyekt va jadvalni bog'lash) — ilovada jadval qatorlari bilan obyekt sifatida ishlash: `$kitob->muallif->ism` deb yozasiz, kutubxona esa uning o'rniga SQL yasab, bazaga yuboradi. Laravel'da bu **Eloquent**, Symfony'da **Doctrine ORM**. Ikkalasi ham oxir-oqibat oddiy SQL yuboradi — va bu kitobdagi hamma narsa (indekslar, rejalar, tranzaksiyalar) unga ham taalluqli.

Muammo — SQL ko'rinmaydi. Eng ko'p uchraydigan oqibati — **N+1** muammosi:

| Kod | Haqiqatda yuborilgan SQL |
| --- | --- |
| Hamma kitoblarni ol | 1 ta so'rov |
| Har kitobning muallifini ko'rsat | Har kitob (yoki muallif) uchun **yana bitta** so'rov |

Laravel hujjati (Eloquent: Relationships → Eager Loading) buni shunday tushuntiradi: munosabat (relationship) xossasiga murojaat qilinganda u **lazy loading** (kerak bo'lgandagina yuklash) bilan yuklanadi. 25 ta kitobli siklda bu 26 ta so'rov: bitta — kitoblar uchun, 25 ta — har kitobning muallifi uchun. Doctrine hujjati (DQL → Joins) ham shuni ogohlantiradi: lazy loading'ga tayanish bazaga ko'p mayda so'rovlar yuboradi va bu ilova unumdorligiga sezilarli ta'sir qilishi mumkin.

Yechimi ikkala ORM'da ham bir xil g'oya: bog'langan ma'lumotni **oldindan** yuklash.

| | Laravel (Eloquent) | Symfony (Doctrine) |
| --- | --- | --- |
| SQL'ni ko'rish | `toSql()`, `toRawSql()`, `dumpRawSql()`; `DB::listen` | `doctrine` monolog kanali (`var/log/dev.log`), Symfony profiler |
| Oldindan yuklash | Eager loading: `with('muallif')` | Fetch join: DQL'da `SELECT k, m … JOIN` |
| Lazy loading'ni taqiqlash | `Model::preventLazyLoading()` | — |

## Kod

Sinov VPS'ida (Ubuntu 26.04): PostgreSQL 18.6, PHP 8.5.4, Laravel Framework 13.40.0, Symfony 8.1.11 + Doctrine ORM 3.7.6 (DBAL 4.5.0, DoctrineBundle 3.3.4). Ikkala loyihada ham bir xil ma'lumot: 3 muallif va 5 kitob (`mualliflar`, `kitoblar`, kitobda `muallif_id`).

### Laravel: ORM qanday SQL yasaydi

```php
// app/Models/Kitob.php
class Kitob extends Model
{
    protected $table = 'kitoblar';
    public $timestamps = false;

    public function muallif(): BelongsTo
    {
        return $this->belongsTo(Muallif::class);
    }
}
```

Laravel hujjati (Database: Query Builder → Debugging): `dumpRawSql` va `ddRawSql` so'rovning SQL'ini parametrlari o'z o'rniga qo'yilgan holda chiqaradi; `toSql()` esa placeholder (`?`) bilan.

```php
// routes/console.php
Artisan::command('orm:sql', function () {
    $sorov = Kitob::where('narx', '>', 50000)->orderBy('nomi');
    $this->line($sorov->toSql());
    $this->line(json_encode($sorov->getBindings()));
    $this->line($sorov->toRawSql());
});
```

```text
$ php artisan orm:sql
select * from "kitoblar" where "narx" > ? order by "nomi" asc
[50000]
select * from "kitoblar" where "narx" > 50000 order by "nomi" asc
```

Bazaga aslida birinchi ko'rinish ketadi: SQL matni `?` bilan, qiymat (`[50000]`) esa alohida. Bu 62-bobdagi parametrli so'rovning o'zi. Laravel hujjati: query builder SQL injection'dan himoya uchun PDO parametr bog'lashidan foydalanadi. `toRawSql()` — faqat ko'rish uchun yasalgan matn.

### Laravel: N+1 va `DB::listen`

Laravel hujjati (Database → Listening for Query Events): `DB::listen` har bajarilgan SQL so'rov uchun chaqiriladigan funksiyani ro'yxatdan o'tkazadi — loglash va xatolarni izlash uchun. Unga `QueryExecuted` obyekti keladi (`sql`, `bindings`, `time`, `toRawSql()`).

```php
Artisan::command('orm:n1', function () {
    DB::listen(fn (QueryExecuted $q) => $this->line('SQL: ' . $q->toRawSql()));
    foreach (Kitob::all() as $kitob) {
        $this->line($kitob->nomi . ' — ' . $kitob->muallif->ism);
    }
});
```

```text
$ php artisan orm:n1
SQL: select * from "kitoblar"
SQL: select * from "mualliflar" where "mualliflar"."id" = 1 limit 1
O'tkan kunlar — Abdulla Qodiriy
SQL: select * from "mualliflar" where "mualliflar"."id" = 1 limit 1
Mehrobdan chayon — Abdulla Qodiriy
SQL: select * from "mualliflar" where "mualliflar"."id" = 2 limit 1
Kecha va kunduz — Cho'lpon
SQL: select * from "mualliflar" where "mualliflar"."id" = 3 limit 1
Navoiy — Oybek
SQL: select * from "mualliflar" where "mualliflar"."id" = 3 limit 1
Qutlug' qon — Oybek
```

5 kitob — **6 ta so'rov**. E'tibor bering: 1-muallif ikki marta so'raldi — Eloquent har kitob uchun alohida yuklaydi.

Eager loading — `with()`:

```php
foreach (Kitob::with('muallif')->get() as $kitob) { … }
```

```text
$ php artisan orm:eager
SQL: select * from "kitoblar"
SQL: select * from "mualliflar" where "mualliflar"."id" in (1, 2, 3)
O'tkan kunlar — Abdulla Qodiriy
Mehrobdan chayon — Abdulla Qodiriy
Kecha va kunduz — Cho'lpon
Navoiy — Oybek
Qutlug' qon — Oybek
```

Kitoblar soni nechta bo'lmasin — **2 ta so'rov** (Laravel hujjatidagi `select * from books` / `select * from authors where id in (…)` kabi).

Laravel hujjati (Preventing Lazy Loading): `Model::preventLazyLoading()` dan keyin Eloquent lazy loading urinishida `LazyLoadingViolationException` tashlaydi — N+1 ni ishlab chiqish paytidayoq ushlash uchun. Hujjatdagi misol uni faqat production bo'lmagan muhitda yoqadi: `Model::preventLazyLoading(! $this->app->isProduction());`.

```text
$ php artisan orm:lazy --no-ansi 2>&1 | head -n 4

   Illuminate\Database\LazyLoadingViolationException 

  Attempted to lazy load [muallif] on model [App\Models\Kitob] but lazy loading is disabled.
```

### Doctrine: sxema va SQL logi

Doctrine'da jadval entity klassidagi atributlardan yasaladi. U yaratadigan DDL'ni `--dump-sql` bilan bajarmasdan ko'rish mumkin:

```php
// src/Entity/Kitob.php
#[ORM\Entity]
#[ORM\Table(name: 'kitoblar')]
class Kitob
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private Muallif $muallif;

    #[ORM\Column(length: 255)]
    private string $nomi;

    #[ORM\Column]
    private int $narx;

    public function getNomi(): string { return $this->nomi; }
    public function getMuallif(): Muallif { return $this->muallif; }
}
```

```text
$ php bin/console doctrine:schema:create --dump-sql
CREATE TABLE mualliflar (id INT GENERATED BY DEFAULT AS IDENTITY NOT NULL, ism VARCHAR(255) NOT NULL, PRIMARY KEY (id));
CREATE TABLE kitoblar (id INT GENERATED BY DEFAULT AS IDENTITY NOT NULL, nomi VARCHAR(255) NOT NULL, narx INT NOT NULL, muallif_id INT NOT NULL, PRIMARY KEY (id));
CREATE INDEX IDX_6F5382C341A98978 ON kitoblar (muallif_id);
ALTER TABLE kitoblar ADD CONSTRAINT FK_6F5382C341A98978 FOREIGN KEY (muallif_id) REFERENCES mualliflar (id) NOT DEFERRABLE;
```

Identity ustun (13-bob), tashqi kalit va unga **indeks** — Doctrine ularni o'zi qo'shdi (tashqi kalit va indeks — 37-bob).

So'rovlar qayerda ko'rinadi: DoctrineBundle konfiguratsiyasi bo'yicha `logging` yoqilgan bo'lsa (standart qiymati — `%kernel.debug%`, ya'ni dev muhitida yoqiq), so'rovlar monolog'ning `doctrine` kanaliga yoziladi. Symfony'ning standart monolog sozlamasida dev muhitidagi hamma kanallar (`event` dan tashqari) `var/log/dev.log` ga tushadi. DBAL hujjati (Architecture): loglashni DBAL'ning `Logging\Middleware` qatlami bajaradi.

Buyruq — oddiy holatda `findAll()`, `--fetch-join` bilan esa DQL:

```php
#[AsCommand(name: 'app:kitoblar')]
class KitoblarCommand
{
    public function __construct(private EntityManagerInterface $em) {}

    public function __invoke(OutputInterface $output, #[Option] bool $fetchJoin = false): int
    {
        if ($fetchJoin) {
            $qb = $this->em->createQueryBuilder()
                ->select('k', 'm')->from(Kitob::class, 'k')->join('k.muallif', 'm');
            $output->writeln('DQL: ' . $qb->getDql());
            $kitoblar = $qb->getQuery()->getResult();
        } else {
            $kitoblar = $this->em->getRepository(Kitob::class)->findAll();
        }
        foreach ($kitoblar as $kitob) {
            $output->writeln($kitob->getNomi() . ' — ' . $kitob->getMuallif()->getIsm());
        }
        return 0;
    }
}
```

```text
$ truncate -s 0 var/log/dev.log
$ php bin/console app:kitoblar
O'tkan kunlar — Abdulla Qodiriy
Mehrobdan chayon — Abdulla Qodiriy
Kecha va kunduz — Cho'lpon
Navoiy — Oybek
Qutlug' qon — Oybek
$ grep -o '"sql":"[^"]*"' var/log/dev.log
"sql":"SELECT t0.id AS id_1, t0.nomi AS nomi_2, t0.narx AS narx_3, t0.muallif_id AS muallif_id_4 FROM kitoblar t0"
"sql":"SELECT t0.id AS id_1, t0.ism AS ism_2 FROM mualliflar t0 WHERE t0.id = ?"
"sql":"SELECT t0.id AS id_1, t0.ism AS ism_2 FROM mualliflar t0 WHERE t0.id = ?"
"sql":"SELECT t0.id AS id_1, t0.ism AS ism_2 FROM mualliflar t0 WHERE t0.id = ?"
```

Logning to'liq qatorida parametr qiymati ham bor:

```text
$ grep -c 'doctrine.DEBUG: Executing' var/log/dev.log
4
$ grep 'FROM mualliflar' var/log/dev.log | head -n 1
[2026-11-09T10:54:24.000380+00:00] doctrine.DEBUG: Executing statement: SELECT t0.id AS id_1, t0.ism AS ism_2 FROM mualliflar t0 WHERE t0.id = ? (parameters: array{"1":1}, types: array{"1":0}) {"sql":"SELECT t0.id AS id_1, t0.ism AS ism_2 FROM mualliflar t0 WHERE t0.id = ?","params":{"1":1},"types":{"1":{"Doctrine\\DBAL\\ParameterType":0}}} []
```

Bu ham N+1, lekin **4 ta** so'rov (Laravel'da 6 ta edi). Sabab — Doctrine'ning **identity map**'i (hujjat: Working with Objects → Entities and the Identity Map): bir ID'li entity'ning EntityManager ichida faqat **bitta** nusxasi bo'ladi. 1-muallif bir marta yuklangach, ikkinchi kitob o'sha obyektni oladi. Baribir so'rovlar soni **turli mualliflar soniga** qarab o'sadi.

Symfony hujjati (Doctrine Associations) mexanizmni tushuntiradi: Doctrine bog'langan obyekt o'rniga **proxy** qaytaradi va `getMuallif()->getIsm()` chaqirilgandagina "jimgina" ikkinchi so'rovni bajaradi; bu ortiqcha so'rovdan JOIN bilan qochish mumkin.

Fetch join:

```text
$ truncate -s 0 var/log/dev.log
$ php bin/console app:kitoblar --fetch-join
DQL: SELECT k, m FROM App\Entity\Kitob k INNER JOIN k.muallif m
O'tkan kunlar — Abdulla Qodiriy
Mehrobdan chayon — Abdulla Qodiriy
Kecha va kunduz — Cho'lpon
Navoiy — Oybek
Qutlug' qon — Oybek
$ grep -o '"sql":"[^"]*"' var/log/dev.log
"sql":"SELECT k0_.id AS id_0, k0_.nomi AS nomi_1, k0_.narx AS narx_2, m1_.id AS id_3, m1_.ism AS ism_4, k0_.muallif_id AS muallif_id_5 FROM kitoblar k0_ INNER JOIN mualliflar m1_ ON k0_.muallif_id = m1_.id"
```

**Bitta** so'rov. Doctrine hujjati (DQL → Joins): DQL'da alohida kalit so'z yo'q — JOIN qilingan entity'ning maydonlari `SELECT` qismida bo'lsa (bu yerda `m`), u **fetch join** bo'ladi: bog'langan entity'lar ham shu so'rovda olinib, natijaga qo'shiladi. Oddiy JOIN (faqat `SELECT k`) esa natijani cheklash yoki agregatsiya uchun.

Ikkala ORM'ning yechimi SQL darajasida farq qiladi: Eloquent — ikkinchi so'rov `WHERE id IN (…)`, Doctrine fetch join — bitta `INNER JOIN`. Natijalar bir xil, so'rovlar soni esa kitoblar soniga bog'liq bo'lmay qoldi.

## Dialektlar

ORM bir xil koddan har baza uchun o'z dialektida SQL yasaydi. Laravel'da `toSql()` bazaga ulanmasdan ishlaydi, shuning uchun bitta so'rovni uchala ulanish uchun ko'rish mumkin:

```php
Artisan::command('orm:dialekt', function () {
    foreach (['pgsql', 'mysql', 'sqlite'] as $ulanish) {
        $sql = DB::connection($ulanish)->table('kitoblar')
            ->where('nomi', 'like', 'Q%')->orderBy('narx', 'desc')->limit(2)->toSql();
        $this->line(str_pad($ulanish, 7) . $sql);
    }
});
```

```text
$ php artisan orm:dialekt
pgsql  select * from "kitoblar" where "nomi"::text like ? order by "narx" desc limit 2
mysql  select * from `kitoblar` where `nomi` like ? order by `narx` desc limit 2
sqlite select * from "kitoblar" where "nomi" like ? order by "narx" desc limit 2
```

- Identifikatorlar: PG va SQLite — `"…"`, MySQL — `` `…` `` (4-bob, 69-bob).
- PG uchun Laravel ustunni `::text` ga aylantirib `LIKE` qiladi.
- Uchalasida ham qiymat — `?` placeholder.

Doctrine'ning `--dump-sql` chiqishidagi `GENERATED BY DEFAULT AS IDENTITY` ham PostgreSQL dialekti: DBAL ulanishdagi platformaga (`serverVersion=18`) qarab DDL yasaydi.

### Qisqacha jadval

| | Laravel (Eloquent) | Doctrine ORM |
| --- | --- | --- |
| SQL matnini olish | `toSql()`, `toRawSql()`, `dumpRawSql()` | `doctrine` log kanali; DQL — `getDql()` |
| Har so'rovni ushlash | `DB::listen(QueryExecuted)` | DBAL `Logging\Middleware` (monolog orqali) |
| N+1 (5 kitob, 3 muallif) | 6 so'rov | 4 so'rov (identity map) |
| Yechim | `with()` — 2 so'rov (`IN (…)`) | Fetch join — 1 so'rov (`JOIN`) |
| Lazy loading'ni taqiqlash | `preventLazyLoading()` | — |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Siklda munosabatga murojaat (`$kitob->muallif`) | N+1: so'rovlar soni yozuvlar soni bilan o'sadi (sinovda 6 va 4) | `with()` yoki fetch join |
| Faqat natijaga qarab "ishlayapti" deyish | Natija bir xil, so'rovlar soni esa har xil (sinovda 6 va 2) | Ishlab chiqishda SQL'ni ko'rish: `DB::listen`, Doctrine logi, profiler |
| Foydalanuvchi kiritgan qiymatni `whereRaw`/`DB::raw` ga qo'shish | Laravel hujjati: raw ifodalar SQL injection'dan himoyalanmaydi (62-bob) | Parametrlar (`whereRaw('narx > ?', [$n])`) |
| Foydalanuvchiga `orderBy` ustunini tanlatish | Laravel hujjati: PDO ustun nomini bog'lay olmaydi | Ruxsat ro'yxati (62-bob) |
| `toRawSql()` natijasini bazaga yuborish | U faqat ko'rish uchun; himoyani yo'qotadi | Bazaga — placeholder'li so'rov |

## Amaliyot

1. `orm:n1` ga `DB::listen` ichida so'rovlar sonini sanaydigan hisoblagich qo'shing va oxirida chiqaring. Kitoblar sonini 50 taga ko'paytirib, `orm:n1` va `orm:eager` ni solishtiring.
2. Laravel hujjatidagi `handleLazyLoadingViolationUsing` bilan istisno o'rniga faqat log yozadigan qiling.
3. Doctrine buyrug'ida `select('k', 'm')` ni `select('k')` ga o'zgartiring (oddiy JOIN). Logda nechta so'rov bo'ldi va nega?
4. `orm:sql` dagi so'rovning `EXPLAIN` ini psql'da ko'ring (45-bob). `narx` ga indeks qo'shsangiz reja o'zgaradimi?
5. Doctrine `--dump-sql` dagi `IDX_6F5382C341A98978` indeksini o'chirib, fetch join so'rovining rejasini solishtiring.

## Rasmiy hujjat

- Laravel — Query Builder → Debugging (`dumpRawSql`), SQL injection va ustun nomlari: <https://laravel.com/framework/docs/13.x/queries>
- Laravel — Database → Listening for Query Events (`DB::listen`): <https://laravel.com/framework/docs/13.x/database>
- Laravel — Eloquent: Relationships → Eager Loading, Preventing Lazy Loading: <https://laravel.com/framework/docs/13.x/eloquent-relationships>
- Doctrine DBAL — Architecture (Middlewares, Logging): <https://www.doctrine-project.org/projects/doctrine-dbal/en/latest/reference/architecture.html>
- Doctrine ORM — DQL → Joins (fetch join, lazy loading): <https://www.doctrine-project.org/projects/doctrine-orm/en/latest/reference/dql-doctrine-query-language.html>
- Doctrine ORM — Working with Objects → Entities and the Identity Map: <https://www.doctrine-project.org/projects/doctrine-orm/en/latest/reference/working-with-objects.html>
- Doctrine ORM — The QueryBuilder (`getDql()`): <https://www.doctrine-project.org/projects/doctrine-orm/en/latest/reference/query-builder.html>
- DoctrineBundle — Configuration (`logging`): <https://symfony.com/bundles/DoctrineBundle/current/configuration.html>
- Symfony — Doctrine Associations (proxy va JOIN): <https://symfony.com/doc/current/doctrine/associations.html>
