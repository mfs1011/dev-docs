# 15 — Lua skriptlar va funksiyalar

[Mundarija](README.md)

## Tushuncha

RD (Programmability): Redis'da **skript** — server ichida bajariladigan foydalanuvchi mantiqi. Ma'lumot turgan joyda ishlov beriladi (data locality): tarmoq trafigi va kechikish kamayadi. Skriptlar o'rnatilgan, **qum qutisidagi** (sandbox) dvigatelda bajariladi — hozircha yagona dvigatel **Lua 5.1**. Skript fayl tizimi, tarmoq yoki boshqa tizim chaqiruvlariga murojaat qilmasligi kerak — faqat Redis'dagi ma'lumot va berilgan argumentlar bilan ishlaydi.

### Atomarlik

RD: skript yoki funksiya **atomar** bajariladi — bajarilish davomida server **boshqa hech narsa qilmaydi** (tranzaksiyaga o'xshash, 14-bob). Skript ta'siri yoki hali boshlanmagan, yoki to'liq tugagan. Kamchiligi: sekin skript barcha mijozlarni to'xtatib turadi — skriptlar tez bo'lishi kerak.

Shuning uchun skript bilan "o'qib, tekshirib, yozish" kabi bir necha qadamni **poyga holatisiz** qilish mumkin (5-bobdagi `GET` + `SET` muammosi) — bir nechta kalit va turlarni birga shartli yangilash.

### Ikki usul

| | Eval skriptlari | Funksiyalar (Redis 7.0 dan) |
| --- | --- | --- |
| Kimniki | Ilovaning bir qismi | Bazaning bir qismi (serverni kengaytiradi) |
| Yuborish | Har safar matn (`EVAL`) yoki SHA1 (`EVALSHA`) | Bir marta yuklanadi (`FUNCTION LOAD`), nom bilan chaqiriladi (`FCALL`) |
| Nomi | Yo'q — SHA1 dayjesti | Bor — kuzatish va nosozlikni tuzatish oson |
| Saqlanishi | Faqat **kesh**: qayta ishga tushirish, failover, `SCRIPT FLUSH` da yo'qoladi | AOF'ga yoziladi va replikalarga uzatiladi — ma'lumot kabi saqlanadi |
| Kod ulashish | Bir skript boshqasini chaqira olmaydi | Bitta kutubxonadagi funksiyalar bir-birini chaqiradi |

RD: funksiyalar `EVAL` ni o'rnini bosadi; kutubxona **butunligicha** yangilanadi (alohida funksiyani emas).

### Kalitlar va argumentlar

`EVAL skript kalitlar_soni kalit… arg…`: kalit nomlari — `KEYS` jadvalida, qolganlari — `ARGV` da (Lua'da indeks 1 dan). RD — **muhim**: skript murojaat qiladigan **barcha** kalit nomlari kalit argumenti sifatida berilishi shart; dasturda yasalgan yoki ma'lumotdan olingan kalit nomlariga murojaat qilmaslik kerak — bu Redis Cluster (32-bob) uchun asos.

Skript matnini har safar dasturda o'zgartirib yasash — **anti-naqsh**: har varianti keshga tushib, xotirani to'ldiradi. To'g'risi — bitta umumiy skript va argumentlar.

### `redis.call` va `redis.pcall`

Ikkalasi ham Redis buyrug'ini chaqiradi. Farqi — xato (RD): `redis.call` xatosi to'g'ridan-to'g'ri mijozga qaytadi (skript to'xtaydi); `redis.pcall` xatosi skriptning o'ziga qaytadi — ushlab, ishlov berish mumkin.

### Skript keshi

RD: `EVAL` qilingan har skript SHA1 dayjesti bo'yicha keshga tushadi (`INFO` dagi `number_of_cached_scripts`). `SCRIPT LOAD` — bajarmasdan yuklaydi va SHA1 qaytaradi; `EVALSHA sha1 …` — keshdagini bajaradi. Kesh **doim o'zgaruvchan** (volatile): bazaning qismi emas, saqlanmaydi. SHA1 keshda bo'lmasa — `NOSCRIPT` xatosi; ilova `SCRIPT LOAD` qilib, qayta urinishi kerak (ko'p kutubxonalar buni o'zi qiladi). Pipeline ichida `NOSCRIPT` ni ishlab bo'lmaydi — u yerda oddiy `EVAL` (RD).

`SCRIPT EXISTS`, `SCRIPT FLUSH`, `SCRIPT KILL` — boshqaruv.

### Funksiyalar

Kutubxona matni **shebang** bilan boshlanadi: `#!lua name=kutubxona`. Ichida `redis.register_function('nom', funksiya)` — kamida bitta funksiya bo'lishi shart. Funksiya ikki argument oladi: `keys` va `args` jadvallari.

| Buyruq | Nima |
| --- | --- |
| `FUNCTION LOAD [REPLACE] matn` | Kutubxonani yuklash; mavjud bo'lsa — `REPLACE` kerak |
| `FCALL nom kalitlar_soni …` | Chaqirish |
| `FCALL_RO` | Faqat o'qiydigan funksiyani chaqirish |
| `FUNCTION LIST`, `FUNCTION DELETE`, `FUNCTION FLUSH` | Ro'yxat, o'chirish, hammasini o'chirish |

### Faqat o'qiydigan skriptlar

RD: kalitlarni o'zgartirmaydigan skript — `no-writes` bayrog'i yoki `EVAL_RO`/`EVALSHA_RO`/`FCALL_RO` bilan. Afzalliklari: replikada doim bajariladi, `SCRIPT KILL` bilan har doim to'xtatiladi, xotira chegarasida OOM xatosi bermaydi; ACL bilan foydalanuvchiga faqat shularni ruxsat berish mumkin. Skriptlarda `PUBLISH` va `PFCOUNT` ham yozish buyrug'i hisoblanadi.

### Maksimal bajarilish vaqti

RD: standart chegara — **5 soniya** (`busy-reply-threshold`, millisoniyada). Chegaradan oshgan skript **avtomatik to'xtatilmaydi** (atomarlik buzilmasligi uchun). Buning o'rniga:

- Redis jurnalga yozadi va boshqa mijozlarga `BUSY` xatosi qaytaradi;
- faqat o'qigan skriptni `SCRIPT KILL` (funksiyani — `FUNCTION KILL`) to'xtatadi;
- skript **bitta bo'lsa ham yozgan** bo'lsa — yagona yo'l `SHUTDOWN NOSAVE` (server ma'lumotni saqlamasdan to'xtaydi).

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3), RD misollari.

### `EVAL`, `KEYS`, `ARGV`

```text vps
$ redis-cli FLUSHALL > /dev/null; redis-cli SCRIPT FLUSH; redis-cli FUNCTION FLUSH
OK
OK
$ redis-cli EVAL "return 'Hello, scripting!'" 0; redis-cli EVAL "return ARGV[1]" 0 Parameterization!
Hello, scripting!
Parameterization!
$ redis-cli --no-raw EVAL "return { KEYS[1], KEYS[2], ARGV[1], ARGV[2], ARGV[3] }" 2 key1 key2 arg1 arg2 arg3
1) "key1"
2) "key2"
3) "arg1"
4) "arg2"
5) "arg3"
$ redis-cli EVAL "return redis.call('SET', KEYS[1], ARGV[1])" 1 foo bar; redis-cli GET foo
OK
bar
```

### Atomar "solishtir va o'chir"

Qulf egasi o'zinikini tekshirib o'chirishi kerak (taqsimlangan qulf — 25-bob). `GET` va `DEL` alohida yuborilsa, orada boshqa mijoz qulfni olib ulguradi; skript ichida ikkalasi bitta atomar qadam:

```text vps
$ redis-cli SET qulf egasi-A > /dev/null; S="if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end"; redis-cli EVAL "$S" 1 qulf egasi-B; redis-cli EVAL "$S" 1 qulf egasi-A; redis-cli EXISTS qulf
0
1
0
```

`egasi-B` — qiymat mos emas, o'chirilmadi (`0`); `egasi-A` — o'chirildi.

### `redis.call` va `redis.pcall`

```text vps
$ redis-cli EVAL "return redis.call('INCR', KEYS[1])" 1 foo; redis-cli EVAL "local ok = redis.pcall('INCR', KEYS[1]); if type(ok) == 'table' and ok.err then return 'ushlandi: ' .. ok.err end; return ok" 1 foo
ERR value is not an integer or out of range script: 61636018f4e6b5817b89791bbed242f93fa089e3, on @user_script:1.

ushlandi: ERR value is not an integer or out of range
```

`foo` da `bar` — son emas. `redis.call` xatosi mijozga skript SHA1 va qatori bilan qaytdi; `redis.pcall` xatoni skriptga qaytardi — skript uni ushlab, o'z javobini berdi.

### Skript keshi

```text vps
$ redis-cli SCRIPT LOAD "return 'Immabe a cached script'"; redis-cli EVALSHA c664a3bf70bd1d45c4284ffebb65a6f2299bfc9f 0; redis-cli EVALSHA ffffffffffffffffffffffffffffffffffffffff 0; redis-cli SCRIPT EXISTS c664a3bf70bd1d45c4284ffebb65a6f2299bfc9f
c664a3bf70bd1d45c4284ffebb65a6f2299bfc9f
Immabe a cached script
NOSCRIPT No matching script. Please use EVAL.

1
$ redis-cli INFO memory | grep -E '^number_of_cached_scripts'; for i in 1 2 3; do redis-cli EVAL "return $i" 0 > /dev/null; done; redis-cli INFO memory | grep -E '^number_of_cached_scripts'
number_of_cached_scripts:8
number_of_cached_scripts:11
```

- `SCRIPT LOAD` — SHA1; `EVALSHA` shu bilan bajardi.
- Yo'q SHA1 — `NOSCRIPT`.
- Har xil uchta `EVAL` — keshda +3 skript (matni farqli skript — alohida yozuv).

### Funksiyalar

```text vps
$ redis-cli FUNCTION LOAD "#!lua name=mylib"$'\n'; redis-cli FUNCTION LOAD "#!lua name=mylib"$'\n'"redis.register_function('knockknock', function() return 'Who\\'s there?' end)"; redis-cli FCALL knockknock 0
ERR No functions registered

mylib
Who's there?
```

Bo'sh kutubxona — `No functions registered`; bitta funksiya bilan yuklandi va `FCALL` bilan chaqirildi.

RD'dagi `my_hset` (hash'ga yozib, oxirgi o'zgarish vaqtini qo'shadi) va `no-writes` bayroqli `my_hlen`:

```text vps
$ printf '%s\n' '#!lua name=mylib' 'local function my_hset(keys, args)' '  local hash = keys[1]' "  local time = redis.call('TIME')[1]" "  return redis.call('HSET', hash, '_last_modified_', time, unpack(args))" 'end' "redis.register_function('my_hset', my_hset)" "redis.register_function{function_name='my_hlen', callback=function(keys) return redis.call('HLEN', keys[1]) end, flags={'no-writes'}}" > /root/mylib.lua; cat /root/mylib.lua
#!lua name=mylib
local function my_hset(keys, args)
  local hash = keys[1]
  local time = redis.call('TIME')[1]
  return redis.call('HSET', hash, '_last_modified_', time, unpack(args))
end
redis.register_function('my_hset', my_hset)
redis.register_function{function_name='my_hlen', callback=function(keys) return redis.call('HLEN', keys[1]) end, flags={'no-writes'}}
$ redis-cli -x FUNCTION LOAD < /root/mylib.lua; redis-cli -x FUNCTION LOAD REPLACE < /root/mylib.lua
ERR Library 'mylib' already exists

mylib
$ redis-cli FCALL my_hset 1 myhash myfield "some value" another_field "another value"; redis-cli HGETALL myhash | paste - - | sed 's/\t[0-9]\{10\}$/\t<vaqt>/'; redis-cli FCALL_RO my_hlen 1 myhash; redis-cli FCALL_RO my_hset 1 myhash a b
3
_last_modified_	<vaqt>
myfield	some value
another_field	another value
3
ERR Can not execute a script with write flag using *_ro command.
```

- `REPLACE` siz — kutubxona allaqachon bor, xato.
- `my_hset` — 3 ta yangi maydon, jumladan `_last_modified_` (`TIME` dan, sinov payti `<vaqt>` bilan almashtirildi).
- `FCALL_RO my_hlen` — ishladi; `FCALL_RO my_hset` — rad etildi: funksiyada `no-writes` yo'q.

### Faqat o'qish va e'lon qilinmagan kalit

```text vps
$ redis-cli EVAL_RO "return redis.call('SET', KEYS[1], 'x')" 1 foo; redis-cli EVAL "return redis.call('SET', 'boshqa', 'x')" 0
ERR Write commands are not allowed from read-only scripts. script: bd6f3018b28bbdb36260f19d3c44afed740db987, on @user_script:1.

OK
$ redis-cli FUNCTION LIST | grep -A1 -x 'library_name\|name' | grep -v -- --
library_name
mylib
name
my_hlen
name
my_hset
```

- `EVAL_RO` ichida `SET` — rad etildi.
- `EVAL … 0` bilan `boshqa` kalitiga yozish — `OK`: kuzatildi, bitta serverda Redis buni to'xtatmaydi. Lekin RD qoidasi buzilgan (kalit `KEYS` da berilmagan) — Cluster'da bunday skript ishlamasligi mumkin.

### Qayta ishga tushirishdan keyin

```text vps
$ redis-cli SCRIPT LOAD "return 1"; systemctl restart redis-server; sleep 1; redis-cli SCRIPT EXISTS e0e1f9fabfc9d4800c877a703b823ac0578ff8db; redis-cli FCALL_RO my_hlen 1 myhash; redis-cli CONFIG GET save | tail -1
e0e1f9fabfc9d4800c877a703b823ac0578ff8db
0
3
3600 1 300 100 60 10000
```

- `SCRIPT LOAD` qilingan skript qayta ishga tushirishdan keyin **yo'q** (`0`) — kesh o'zgaruvchan.
- Funksiya `my_hlen` **qoldi** va ishladi (kuzatildi: `save` sozlamasi yoqilgan, server to'xtashda RDB faylga yozdi — 28-bob).

### Cheksiz skript

```text vps
$ redis-cli CONFIG SET busy-reply-threshold 1000; (redis-cli EVAL "while true do end" 0 2>&1 | sed 's/^/skript: /') & sleep 1.5; redis-cli PING; redis-cli SCRIPT KILL; wait; redis-cli PING; redis-cli CONFIG SET busy-reply-threshold 5000
OK
BUSY Redis is busy running a script. You can only call SCRIPT KILL or SHUTDOWN NOSAVE.

OK
skript: ERR Script killed by user with SCRIPT KILL... script: 694a5fe1ddb97a4c6a1bf299d9537c7d3d0f84e7, on @user_script:1.
skript: 
PONG
OK
```

- Chegara 1 soniyaga tushirildi; `while true do end` — cheksiz sikl.
- 1,5 soniyadan keyin `PING` — `BUSY`: server faqat `SCRIPT KILL` yoki `SHUTDOWN NOSAVE` ni qabul qiladi.
- Skript hech narsa yozmagan — `SCRIPT KILL` uni to'xtatdi, server qayta javob bera boshladi (`PONG`).

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Skript matnini qiymatlar bilan yasash (`"return '" .. x .. "'"`) | Har variant keshga tushadi, xotira to'ladi (RD) | Bitta skript + `ARGV` |
| Kalit nomini skript ichida yasash yoki ma'lumotdan olish | RD qoidasi; Cluster'da buziladi | Barcha kalitlar `KEYS` orqali |
| `EVALSHA` keshda doim bor deb o'ylash | Qayta ishga tushirish/failover'da yo'qoladi (sinovda `0`) | `NOSCRIPT` da `SCRIPT LOAD` va qayta urinish, yoki funksiyalar |
| Uzoq ishlaydigan skript | Butun server to'xtaydi | Ishni kichik qismlarga bo'lish |
| Yozgan skript cheksiz siklga tushishi | Faqat `SHUTDOWN NOSAVE` (ma'lumot yo'qolishi) | Sinovda sinash; sikllarni chegaralash |
| O'qiydigan funksiyaga `no-writes` qo'ymaslik | `FCALL_RO` va replikada ishlamaydi | `flags={'no-writes'}` |
| Atomarlik uchun `GET` + `DEL` ni alohida yuborish | Orada boshqa mijoz o'zgartiradi | Skript yoki `DELEX … IFEQ` (5-bob) |

## Amaliyot

1. Nega skript atomar va bu qanday xavf tug'diradi?
2. `KEYS` va `ARGV` farqi nima? Nega kalit nomlarini `KEYS` orqali berish shart?
3. `redis.call` va `redis.pcall` farqi?
4. `EVALSHA` `NOSCRIPT` qaytarsa nima qilinadi? Bu qachon bo'ladi?
5. Funksiyalar eval skriptlaridan qanday afzal?
6. Skript 5 soniyadan uzoq ishlasa nima bo'ladi? Yozgan skriptni qanday to'xtatish mumkin?

<details>
<summary>Javoblar</summary>

1. Bajarilish davomida server boshqa ish qilmaydi; sekin skript hamma mijozlarni to'xtatadi.
2. `KEYS` — kalit nomlari, `ARGV` — boshqa argumentlar; Redis (ayniqsa Cluster) skript qaysi kalitlarga tegishini oldindan bilishi kerak.
3. `call` xatosi mijozga qaytadi; `pcall` xatosi skriptga qaytadi va ushlanishi mumkin.
4. `SCRIPT LOAD` qilib, qayta `EVALSHA`; kesh qayta ishga tushirish, failover yoki `SCRIPT FLUSH` dan keyin bo'shaydi.
5. Nomi bor, bazada saqlanadi va replikatsiya qilinadi, ilovada yuklash shart emas, kutubxona ichida kod ulashiladi.
6. Avtomatik to'xtatilmaydi; boshqalarga `BUSY`. Faqat o'qigan bo'lsa — `SCRIPT KILL`; yozgan bo'lsa — faqat `SHUTDOWN NOSAVE`.

</details>

## Rasmiy hujjat

- [RD: Programmability](https://redis.io/docs/latest/develop/programmability/)
- [RD: Scripting with Lua](https://redis.io/docs/latest/develop/programmability/eval-intro/)
- [RD: Redis Functions](https://redis.io/docs/latest/develop/programmability/functions-intro/)
- [RD: EVAL](https://redis.io/docs/latest/commands/eval/) · [FUNCTION LOAD](https://redis.io/docs/latest/commands/function-load/) · [SCRIPT KILL](https://redis.io/docs/latest/commands/script-kill/)
