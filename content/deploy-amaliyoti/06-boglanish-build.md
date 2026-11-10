# 06 — Bog'liqliklar va build

[Mundarija](README.md)

## Tushuncha

Ilova kodi o'zi yetarli emas: unga **bog'liqliklar** (dependencies — boshqa paketlar) kerak. Deploy'da ular har safar **aynan bir xil versiyalarda** o'rnatilishi kerak — sinovdan o'tgan versiya bilan production'dagisi farq qilmasligi uchun. Buni **lock-fayl** ta'minlaydi: unda har paketning aniq versiyasi yozilgan (`package-lock.json`, `composer.lock`). Lock-fayl repozitoriyga qo'shiladi.

### Node.js: `npm ci` (npm docs: npm-ci)

`npm install` ga o'xshaydi, lekin avtomatlashtirilgan muhit — test, CI va **deploy** uchun mo'ljallangan:

| `npm ci` | Nima |
| --- | --- |
| `package-lock.json` | **Bo'lishi shart** |
| Lock va `package.json` mos kelmasa | Lock'ni yangilamaydi — **xato bilan** to'xtaydi |
| `node_modules` | Avval **butunlay o'chiriladi**, keyin o'rnatiladi |
| `package.json` va lock | Hech qachon yozilmaydi — o'rnatish "muzlatilgan" |
| Bitta paket qo'shish | Mumkin emas — faqat butun loyiha |

`devDependencies` — faqat ishlab chiqishda kerak bo'lgan paketlar (test, linter). Production'da ular kerak emas. `--omit=dev` yoki `NODE_ENV=production` bilan o'rnatilmaydi (npm docs: npm-install).

### PHP: `composer install` (Composer: CLI)

- `composer.lock` bo'lsa — **aynan undagi versiyalar** o'rnatiladi. Bo'lmasa — bog'liqliklarni hal qilib, lock yaratadi.
- `composer update` — yangi versiyalarni topadi va lock'ni **qayta yozadi**. Bu ishlab chiqishda qilinadi, deploy'da emas.
- `--no-dev` — `require-dev` paketlari o'rnatilmaydi.
- `--optimize-autoloader` (`-o`) — PSR-4/PSR-0 autoload'ni **classmap**'ga aylantiradi, autoloader tezlashadi. "Ayniqsa production uchun tavsiya etiladi".

### Build qayerda bo'ladi

| Variant | Qanday | Afzallik | Kamchilik |
| --- | --- | --- | --- |
| **Serverda** | Kod serverga keladi, `npm ci` / `composer install` o'sha yerda | Oddiy | Serverga npm/Composer va tarmoq kerak; har serverda alohida o'rnatiladi |
| **CI'da** (artifact) | CI bir marta build qiladi, natijani arxiv qilib uzatadi; server faqat ochadi | Serverga build vositalari kerak emas; hamma serverda bir xil fayllar | Arxivni saqlash va uzatish kerak |

GH (Workflow artifacts): **artifact** — workflow ishga tushganda hosil bo'lgan fayl yoki fayllar to'plami. U job tugagandan keyin ham saqlanadi va boshqa job'ga uzatiladi (`actions/upload-artifact`, `actions/download-artifact`). GitHub Actions'da sinash III qismda (09-bobdan), sinov repozitoriysi bilan. Bu bobda artifact jarayoni VPS'da qo'lda ko'rsatiladi.

## Ko'rib chiqamiz

VPS'da (Node.js 26.13.0, npm 11.20.0, PHP 8.5.4, Composer 2.11.1).

### Node.js loyiha

```json
{
  "name": "ilova",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs",
  "dependencies": { "ms": "^2.1.3" },
  "devDependencies": { "is-odd": "^3.0.1" }
}
```

```js
// Ishlab chiqarishda kerak bo'ladigan bog'liqlik — ms
const ms = require('ms');
console.log(`ilova ishladi: 2 kun = ${ms('2d')} ms`);
```

```text vps
$ cd /root/d06/node && npm install --no-audit --no-fund 2>&1 | tail -1; ls; grep -c '"node_modules/' package-lock.json
added 3 packages in 1s
app.js
node_modules
package-lock.json
package.json
3
$ cd /root/d06/node && touch node_modules/eski-fayl.txt && npm ci --no-audit --no-fund 2>&1 | tail -1; ls node_modules | tr '\n' ' '; echo
added 3 packages in 622ms
is-number is-odd ms 
$ cd /root/d06/node && npm ci --omit=dev --no-audit --no-fund 2>&1 | tail -1; ls node_modules | tr '\n' ' '; echo; node app.js
added 1 package in 518ms
ms 
ilova ishladi: 2 kun = 172800000 ms
$ cd /root/d06/node && NODE_ENV=production npm ci --no-audit --no-fund 2>&1 | tail -1; ls node_modules | tr '\n' ' '; echo
added 1 package in 516ms
ms 
```

- `npm install` lock-fayl yaratdi (3 paket: `ms`, `is-odd` va uning bog'liqligi `is-number`).
- `npm ci` — `node_modules` ichiga qo'yilgan `eski-fayl.txt` yo'qoldi: papka avval butunlay o'chirildi.
- `--omit=dev` va `NODE_ENV=production` — faqat `ms`; ilova ishlaydi.

### Lock-fayl mos kelmasa yoki yo'q bo'lsa

`package.json` ga lock'da yo'q paket qo'shiladi:

```text vps
$ cd /root/d06/node && cp package.json package.json.asl && sed -i 's/"ms": "^2.1.3"/"ms": "^2.1.3", "kleur": "^4.1.5"/' package.json && npm ci --no-audit --no-fund 2>&1 | grep -E 'npm error' | head -4; echo "kod: ${PIPESTATUS[0]}"; mv package.json.asl package.json
npm error code EUSAGE
npm error
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
npm error
kod: 1
$ cd /root/d06/node && mv package-lock.json /tmp/lock.json && npm ci 2>&1 | grep 'npm error' | grep -v 'npm error$' | head -3 | cut -c1-200; mv /tmp/lock.json package-lock.json
npm error code EUSAGE
npm error The `npm ci` command can only install with an existing package-lock.json or
npm error npm-shrinkwrap.json with lockfileVersion >= 1. Run an install with npm@5 or
```

`npm ci` lock'ni o'zgartirmadi — `EUSAGE` xatosi bilan to'xtadi (kod 1). Lock-faylsiz — umuman ishlamaydi. Deploy'da bu **yaxshi**: tasdiqlanmagan versiya serverga tushmaydi.

### PHP loyiha

```json
{
    "name": "kamgapir/ilova",
    "require": { "psr/log": "^3.0" },
    "require-dev": { "psr/container": "^2.0" },
    "autoload": { "psr-4": { "Ilova\\": "src/" } }
}
```

```text vps
$ cd /root/d06/php && rm -rf vendor composer.lock && composer update --no-interaction --no-progress 2>&1 | grep -E 'Locking|Writing lock|Installing|rror'; ls vendor
  - Locking psr/container (2.0.2)
  - Locking psr/log (3.0.2)
Writing lock file
Installing dependencies from lock file (including require-dev)
  - Installing psr/container (2.0.2): Extracting archive
  - Installing psr/log (3.0.2): Extracting archive
autoload.php
composer
psr
$ cd /root/d06/php && rm -rf vendor && composer install --no-dev --optimize-autoloader --no-interaction --no-progress 2>&1 | grep -E 'Installing|Generating|from lock'; ls vendor/psr; php index.php
Installing dependencies from lock file
  - Installing psr/log (3.0.2): Extracting archive
Generating optimized autoload files
log
ilova ishladi, psr/log: bor
$ cd /root/d06/php && grep "Ilova" vendor/composer/autoload_classmap.php | sed 's/^ *//'
'Ilova\\Salom' => $baseDir . '/src/Salom.php',
```

- `composer update` lock'ni yozdi va ikkala paketni o'rnatdi (ishlab chiqish).
- `composer install --no-dev -o` — lock'dan, faqat `psr/log`. `psr/container` (`require-dev`) o'rnatilmadi.
- `-o` — ilova klassi `Ilova\Salom` classmap'ga yozildi.

```text vps
$ cd /root/d06/php && cp composer.json composer.json.asl && sed -i 's#"psr/log": "^3.0"#"psr/log": "^3.0", "psr/clock": "^1.0"#' composer.json && composer install --no-dev --no-interaction --no-progress 2>&1 | grep -E -i 'warning|Required package' | head -3; echo "kod: ${PIPESTATUS[0]}"; mv composer.json.asl composer.json
Warning: The lock file is not up to date with the latest changes in composer.json. You may be getting outdated dependencies. It is recommended that you run `composer update` or `composer update <package name>`.
- Required package "psr/clock" is not present in the lock file.
kod: 4
```

Kuzatildi: `composer.json` lock'dan farq qilsa, `composer install` ogohlantiradi va **4** kod bilan to'xtaydi — `npm ci` kabi, lock'siz paketni o'rnatmaydi.

### Artifact: build bir joyda, ishga tushirish boshqa joyda

"CI" o'rniga alohida `build` papkasi. Production bog'liqliklari bilan arxiv tayyorlanadi, release papkasiga ochiladi (05-bob):

```text vps
$ rm -rf /root/d06/build && mkdir /root/d06/build && cp /root/d06/node/package.json /root/d06/node/package-lock.json /root/d06/node/app.js /root/d06/build/ && cd /root/d06/build && npm ci --omit=dev --no-audit --no-fund 2>&1 | tail -1; tar -czf /root/d06/ilova-1.0.0.tar.gz -C /root/d06/build . && ls -lh /root/d06/ilova-1.0.0.tar.gz | awk '{print $5, $NF}'; tar -tzf /root/d06/ilova-1.0.0.tar.gz | grep -v '/$' | sort
added 1 package in 701ms
3.8K /root/d06/ilova-1.0.0.tar.gz
./app.js
./node_modules/.package-lock.json
./node_modules/ms/index.js
./node_modules/ms/license.md
./node_modules/ms/package.json
./node_modules/ms/readme.md
./package-lock.json
./package.json
$ R=/srv/d06/releases/$(date +%Y%m%d-%H%M%S); mkdir -p $R && tar -xzf /root/d06/ilova-1.0.0.tar.gz -C $R && ln -sfn $R /srv/d06/current.tmp && mv -T /srv/d06/current.tmp /srv/d06/current && cd /srv/d06/current && node app.js; ls /srv/d06/current/node_modules
ilova ishladi: 2 kun = 172800000 ms
ms
```

- Arxivda kod, lock-fayl va faqat production bog'liqliklari (`ms`).
- Release papkasida `npm` ishga tushmadi — ilova arxivdagi `node_modules` bilan ishladi.
- Sinov fayllari o'chirildi.

## Variantlar

| Holat | Tanlov |
| --- | --- |
| Node.js deploy | `npm ci --omit=dev` |
| PHP deploy | `composer install --no-dev --optimize-autoloader` |
| Bitta server, oddiy loyiha | Serverda build |
| Bir nechta server yoki serverda build vositalari yo'q | CI'da build + artifact |
| Frontend (bundle) | CI'da build, faqat natija (`dist/`) uzatiladi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Deploy'da `npm install` | Lock'ni yangilashi mumkin — boshqa versiyalar | `npm ci` (npm docs) |
| Deploy'da `composer update` | Yangi versiyalar, lock qayta yoziladi | `composer install` |
| Lock-faylni repozitoriyga qo'shmaslik | `npm ci` ishlamaydi (sinovda), versiyalar turlicha | Lock — repozitoriyda |
| Production'ga `devDependencies` | Ortiqcha kod va hajm | `--omit=dev`, `--no-dev` |
| `npm install` ni `--legacy-peer-deps` bilan, `npm ci` ni flag'siz | Xato beradi (npm docs) | Bir xil flag'lar yoki `.npmrc` |
| `node_modules` ni repozitoriyga qo'shish | Hajm, platforma farqi | Lock + `npm ci` |

## Amaliyot

1. Lock-fayl nima uchun kerak?
2. `npm ci` ning `npm install` dan to'rtta farqini ayting.
3. Sinovda `package.json` lock'dan farq qilganda `npm ci` nima qildi?
4. `composer install` va `composer update` farqi nima?
5. Artifact usulining afzalligi nima?

<details>
<summary>Javoblar</summary>

1. Har o'rnatishda aynan bir xil versiyalar bo'lishi uchun.
2. Lock shart; mos kelmasa xato beradi; `node_modules` ni o'chiradi; `package.json` va lock'ni yozmaydi.
3. `EUSAGE` xatosi bilan to'xtadi, lock'ni o'zgartirmadi.
4. `install` lock'dagi versiyalarni o'rnatadi; `update` yangi versiyalarni topib lock'ni qayta yozadi.
5. Bir marta build — hamma serverda bir xil fayllar, serverga build vositalari kerak emas.

</details>

## Rasmiy hujjat

- [npm Docs: npm ci](https://docs.npmjs.com/cli/commands/npm-ci) · [npm install](https://docs.npmjs.com/cli/commands/npm-install)
- [Composer: Command-line interface → install](https://getcomposer.org/doc/03-cli.md#install-i)
- [GH: Workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts)
