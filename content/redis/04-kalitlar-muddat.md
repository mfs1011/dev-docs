# 04 — Kalitlar va muddat

[Mundarija](README.md)

## Tushuncha

RD (Keys and values): Redis'dagi har bir ma'lumot obyektining o'z **noyob kaliti** bor. Kalit — satr; uni buyruqqa berib, qiymatni olasiz yoki o'zgartirasiz. Kalit va unga bog'langan **qiymat** — **kalit-qiymat juftligi**.

### Kalit qanday bo'lishi kerak

RD:

- Kalit formatiga cheklov kam: bo'sh joy va tinish belgilari ham bo'laveradi (`"1st Attempt"`). Redis **binary-safe**: istalgan baytlar ketma-ketligi kalit bo'la oladi, bo'sh satr ham.
- Redis'da **nomlar fazosi** (namespace) yo'q — to'qnashuvdan o'zingiz saqlanasiz. Odatiy kelishuv — **`:`** bilan bo'laklarga ajratish: `person:1`, `office:London`, `user:1000:followers`.
- Juda **uzun** kalit (masalan, 1024 bayt) — xotira va qidiruv uchun yomon; katta qiymat bo'yicha kalit kerak bo'lsa, uning xeshi (masalan, SHA1) yaxshiroq.
- Juda **qisqa** kalit ham yaxshi emas: `u1000flw` o'rniga `user:1000:followers` — o'qiladi, qo'shimcha joy arzimas.
- Bir **sxemaga** amal qiling: `obyekt-turi:id` (`user:1000`); ko'p so'zli maydonlar uchun nuqta yoki chiziqcha: `comment:4321:reply.to`.
- Maksimal kalit hajmi — **512 MB**.

**Hashtag** (`{…}`): Redis kalitdan xesh orqali **slot** raqamini hisoblaydi; kalitda `{…}` bo'lsa — faqat qavs ichidagi qism hisoblanadi. `{person}:1` va `{person}:2` — bir slot. Bu **klaster**da ko'p kalitli buyruqlar (masalan, `SINTER`) ishlashi uchun kerak; RD: buni odatga aylantirmang — bir slotga juda ko'p kalit tushsa, tezlik yomonlashadi (32-bob).

### Kalitlar bilan ishlash

Har qanday turdagi kalitga ishlaydigan buyruqlar:

| Buyruq | Nima |
| --- | --- |
| `EXISTS k [k …]` | Nechta kalit mavjud (bir kalit ikki marta yozilsa — ikki marta sanaladi) |
| `DEL k [k …]` | O'chirish; nechta o'chirilganini qaytaradi |
| `TYPE k` | Qiymat turi; kalit yo'q bo'lsa — `none` |
| `RENAME eski yangi` | Nomini o'zgartirish |

### Muddat (TTL)

RD: kalitga **yashash muddati** (time to live, **TTL**) berish mumkin — muddat tugaganda kalit **avtomatik o'chiriladi**. Bunday kalit Redis atamasida **volatile** (o'zgaruvchan).

- Muddat soniya yoki millisekundda beriladi, aniqlik doim **1 ms**.
- Muddat haqidagi ma'lumot replikalarga uzatiladi va diskka saqlanadi; Redis to'xtab tursa ham vaqt "o'tadi" — Redis kalit **qachon** o'lishini saqlaydi.

| Buyruq | Nima |
| --- | --- |
| `EXPIRE k soniya` / `PEXPIRE k ms` | Muddat berish |
| `EXPIRE … NX` / `XX` / `GT` / `LT` | Faqat muddat **yo'q** bo'lsa / **bor** bo'lsa / yangisi **kattaroq** / **kichikroq** bo'lsa (`GT`/`LT` uchun muddatsiz kalit — cheksiz muddatli) |
| `SET k v EX soniya` | Qiymat va muddat birga |
| `TTL k` / `PTTL k` | Qolgan vaqt; `-1` — kalit bor, muddati yo'q; `-2` — kalit yo'q |
| `PERSIST k` | Muddatni olib tashlash |

Muddat **qachon yo'qoladi** (RD, EXPIRE): faqat kalit mazmunini **o'chiradigan yoki almashtiradigan** buyruqlar — `DEL`, `SET`, `GETSET`, `*STORE`. Qiymatni almashtirmay **o'zgartiradigan** buyruqlar muddatga tegmaydi (pastda `INCR` misoli). `RENAME` muddatni yangi nomga o'tkazadi. Musbat bo'lmagan muddat (`EXPIRE k 0`) — kalit darhol **o'chiriladi**.

**Qanday o'chiriladi** (RD, EXPIRE): ikki yo'l bilan —

- **passiv**: mijoz muddati o'tgan kalitga murojaat qilganda;
- **faol**: Redis vaqti-vaqti bilan muddatli kalitlardan tasodifan bir nechtasini tekshirib, muddati o'tganlarini o'chiradi (hech kim murojaat qilmaydiganlar uchun).

### Hamma kalitni ko'rish: `SCAN`, `KEYS` emas

RD: **`KEYS pattern`** bilan server **bloklanib**, barcha kalitlarni qaytarguncha boshqa ishlarni qilmaydi; katta bazada tezlikni buzadi. Uni oddiy ilova kodida ishlatmang — faqat tuzatish va maxsus ishlar uchun, production'da "juda ehtiyot bilan".

**`SCAN kursor [MATCH pattern] [COUNT n] [TYPE tur]`** — **kursorli** ko'rib chiqish: har chaqiruv oz element qaytaradi va keyingi kursorni beradi. `0` dan boshlanadi, server `0` qaytarganda **to'liq aylanma** (full iteration) tugaydi.

- `MATCH` — glob naqshi (`KEYS` dagi kabi): `h?llo`, `h*llo`, `h[ae]llo`, `h[^e]llo`, `h[a-b]llo`; maxsus belgi — `\` bilan.
- `COUNT` — har chaqiruvda taxminan nechta element ko'rilsin (standart 10); aniq son kafolatlanmaydi, hatto `0` element qaytishi mumkin — tugadi deb faqat kursor `0` bo'lganda hisoblang.
- `TYPE` — faqat shu turdagi kalitlar.

Kafolatlar (RD): to'liq aylanma boshidan oxirigacha mavjud bo'lgan **har bir** kalitni qaytaradi va bu davomida umuman bo'lmagan kalitni qaytarmaydi. Lekin bitta kalit **bir necha marta** qaytishi mumkin — ilova buni hisobga olsin. `SSCAN`, `HSCAN`, `ZSCAN` — set, hash va sorted set ichini xuddi shunday ko'rib chiqadi.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3, xom rejimdagi `redis-cli`, 3-bob).

### `EXISTS`, `DEL`, `TYPE`

```text vps
$ redis-cli FLUSHALL
OK
$ redis-cli SET mykey hello; redis-cli EXISTS mykey; redis-cli DEL mykey; redis-cli EXISTS mykey; redis-cli DEL mykey
OK
1
1
0
0
$ redis-cli MSET a 1 b 2; redis-cli EXISTS a b c a; redis-cli DEL a b c
OK
3
2
$ redis-cli SET s x; redis-cli LPUSH l y; redis-cli TYPE s; redis-cli TYPE l; redis-cli TYPE yoq
OK
1
string
list
none
```

- `DEL` ikkinchi marta — `0`: kalit allaqachon yo'q.
- `EXISTS a b c a` — `3`: `a` ikki marta sanaldi, `c` yo'q.
- `TYPE yoq` — `none`.

### Muddat

```text vps
$ redis-cli SET key some-value; redis-cli EXPIRE key 5; redis-cli TTL key; redis-cli GET key; sleep 6; redis-cli GET key | od -c | head -1; redis-cli TTL key
OK
1
5
some-value
0000000  \n
-2
$ redis-cli SET key 100 EX 10; redis-cli TTL key; redis-cli PERSIST key; redis-cli TTL key
OK
10
1
-1
```

`EXPIRE key 5` dan 6 soniya keyin `GET` — bo'sh (kalit yo'q), `TTL` — `-2`. `PERSIST` dan keyin `TTL` — `-1`: kalit bor, muddatsiz.

### Muddat qachon saqlanadi va qachon yo'qoladi

```text vps
$ redis-cli SET hisob 1 EX 100; redis-cli INCR hisob; redis-cli TTL hisob; redis-cli SET hisob 5; redis-cli TTL hisob
OK
2
100
OK
-1
$ redis-cli SET eski v EX 60; redis-cli RENAME eski yangi; redis-cli TTL yangi | awk '{print ($1>55)?"TTL saqlandi (>55)":$1}'
OK
OK
TTL saqlandi (>55)
$ redis-cli SET z v; redis-cli EXPIRE z 0; redis-cli EXISTS z
OK
1
0
```

- `INCR` qiymatni **o'zgartirdi** — muddat (`100`) saqlandi; `SET` qiymatni **almashtirdi** — muddat yo'qoldi (`-1`).
- `RENAME` — muddat yangi nomga o'tdi.
- `EXPIRE z 0` — kalit darhol o'chdi.

### `NX`, `XX`, `GT`, `LT` va millisekundlar

```text vps
$ redis-cli SET k v; redis-cli EXPIRE k 100 XX; redis-cli EXPIRE k 100 NX; redis-cli EXPIRE k 50 GT; redis-cli EXPIRE k 200 GT; redis-cli TTL k; redis-cli EXPIRE k 30 LT; redis-cli TTL k
OK
0
1
0
1
200
1
30
$ redis-cli PEXPIRE k 1500; redis-cli PTTL k | awk '{print ($1>1000 && $1<=1500) ? "PTTL 1000..1500 oralig'"'"'ida" : $1}'
1
PTTL 1000..1500 oralig'ida
```

| Buyruq | Natija | Sabab |
| --- | --- | --- |
| `EXPIRE k 100 XX` | `0` | Muddat yo'q edi |
| `EXPIRE k 100 NX` | `1` | Muddat yo'q — berildi |
| `EXPIRE k 50 GT` | `0` | 50 < 100 |
| `EXPIRE k 200 GT` | `1` | 200 > 100 → `TTL` 200 |
| `EXPIRE k 30 LT` | `1` | 30 < 200 → `TTL` 30 |

### `SCAN` bilan to'liq aylanma

1000 ta `user:*` (string) va 200 ta `queue:*` (list) kalit; `SCAN` ni kursor `0` bo'lguncha chaqiramiz:

```text vps
$ redis-cli FLUSHALL > /dev/null; for i in $(seq 1 1000); do echo "SET user:$i x"; done | redis-cli > /dev/null; for i in $(seq 1 200); do echo "LPUSH queue:$i x"; done | redis-cli > /dev/null; redis-cli DBSIZE
1200
$ c=0; n=0; t=0; while :; do r=$(redis-cli SCAN $c COUNT 100); c=$(echo "$r" | head -1); k=$(echo "$r" | tail -n +2 | grep -c .); t=$((t+k)); n=$((n+1)); [ "$c" = 0 ] && break; done; echo "SCAN chaqiruvlari: $n, jami kalit: $t"
SCAN chaqiruvlari: 12, jami kalit: 1200
$ c=0; n=0; t=0; while :; do r=$(redis-cli SCAN $c MATCH 'queue:*' COUNT 100); c=$(echo "$r" | head -1); k=$(echo "$r" | tail -n +2 | grep -c .); t=$((t+k)); n=$((n+1)); [ "$c" = 0 ] && break; done; echo "MATCH queue:* — chaqiruvlar: $n, topilgan: $t"
MATCH queue:* — chaqiruvlar: 12, topilgan: 200
$ redis-cli SCAN 0 TYPE list COUNT 2000 | tail -n +2 | wc -l
200
```

- `COUNT 100` bilan 12 chaqiruv — hamma 1200 kalit.
- `MATCH 'queue:*'` ham **12 chaqiruv**: naqsh ko'rib chiqishni qisqartirmaydi — har chaqiruv baribir shuncha kalitni ko'radi, faqat mos kelganini qaytaradi.
- `TYPE list` — 200 ta ro'yxat.

Glob naqshlari (kichik bazada `KEYS` bilan):

```text vps
$ redis-cli KEYS 'user:99?' | sort | tr '\n' ' '; echo
user:990 user:991 user:992 user:993 user:994 user:995 user:996 user:997 user:998 user:999 
$ redis-cli KEYS 'user:[12]' | sort | tr '\n' ' '; echo
user:1 user:2 
```

### `KEYS` serverni to'xtatadi

2 000 000 kalit `redis-cli --pipe` bilan (RD: Redis protokolida yozilgan buyruqlarni tez yuklash usuli) yuklandi. Keyin fonda `KEYS '*'` ishga tushirilib, 50 ms dan keyin oddiy `PING` yuborildi:

```text vps
$ redis-cli FLUSHALL > /dev/null; seq 1 2000000 | awk '{printf "*3\r\n$3\r\nSET\r\n$%d\r\nkey:%d\r\n$1\r\nx\r\n", length("key:"$1), $1}' | redis-cli --pipe | tail -1
errors: 0, replies: 2000000
$ redis-cli SLOWLOG RESET > /dev/null; TIMEFORMAT='PING yolg'"'"'iz: %R s'; time redis-cli PING
PONG
PING yolg'iz: 0.005 s
$ TIMEFORMAT='KEYS paytida PING kutdi: %R s'; ( redis-cli KEYS '*' > /dev/null & ); sleep 0.05; time redis-cli PING
PONG
KEYS paytida PING kutdi: 0.799 s
$ sleep 2; redis-cli SLOWLOG GET 1 | sed -n 2,4p
1794140246
851698
KEYS
$ TIMEFORMAT='SCAN 0 COUNT 100: %R s'; time redis-cli SCAN 0 COUNT 100 > /dev/null
SCAN 0 COUNT 100: 0.005 s
```

- Yolg'iz `PING` — 5 ms; `KEYS` paytida — **0,8 soniya**: server `KEYS` ni tugatguncha boshqa mijozga javob bermadi.
- Sekin buyruqlar jurnali (`SLOWLOG`, 33-bob): `KEYS` **851 698 mikrosoniya** (~0,85 s) davom etgan.
- `SCAN 0 COUNT 100` — 5 ms: kichik qadamlar, server bloklanmaydi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Production kodida `KEYS *` | Server bloklanadi (sinovda 0,85 s, shu vaqtda `PING` ham kutdi) | `SCAN` yoki indeks sifatida set (8-bob) |
| `SCAN` ni bitta chaqiruvda tugadi deb hisoblash | Bitta javob — faqat bir qism; `COUNT` aniq emas | Kursor `0` bo'lguncha |
| `SCAN` takror kalitlarga tayyor bo'lmaslik | Bir kalit ikki marta kelishi mumkin (RD) | Takror ishlov zararsiz bo'lsin |
| `SET` bilan qayta yozib, muddat qoladi deb o'ylash | `SET` muddatni o'chiradi | `SET … EX` bilan qayta berish (5-bob) |
| Kalitlarni prefikssiz nomlash (`1000`) | To'qnashuv, qaysi tur ekani noma'lum | `user:1000`, `order:1000:items` |
| Juda uzun kalitlar | Xotira va tezlik | Qisqa sxema yoki xesh |
| `MATCH` ni indeks deb o'ylash | Baribir hamma kalit ko'riladi (sinovda bir xil 12 chaqiruv) | Kerakli kalitlarni alohida set'da saqlash |

## Amaliyot

1. Redis kalitlari uchun qanday nomlash kelishuvi tavsiya etiladi?
2. `TTL` `-1` va `-2` qaytarsa nimani anglatadi?
3. Muddatli kalitga `INCR` va `SET` qilinsa, muddat bilan nima bo'ladi?
4. Redis muddati o'tgan kalitni qanday ikki yo'l bilan o'chiradi?
5. Nega `KEYS *` xavfli? Sinovda nima bo'ldi?
6. `SCAN` qachon tugagan hisoblanadi va qanday kafolat beradi?

<details>
<summary>Javoblar</summary>

1. `:` bilan bo'laklar, `obyekt-turi:id` sxemasi (`user:1000:followers`); juda uzun va juda qisqa emas.
2. `-1` — kalit bor, muddati yo'q; `-2` — kalit yo'q.
3. `INCR` — muddat saqlanadi (qiymat o'zgartirildi); `SET` — muddat o'chadi (qiymat almashtirildi).
4. Passiv — murojaat qilinganda; faol — vaqti-vaqti bilan tasodifiy muddatli kalitlarni tekshirib.
5. Barcha kalitlarni qaytarguncha serverni bloklaydi; 2 mln kalitda ~0,85 s, shu paytda `PING` ham kutdi.
6. Server kursor `0` qaytarganda. Butun aylanma davomida mavjud kalitlarning hammasi qaytadi, lekin ba'zilari takror kelishi mumkin.

</details>

## Rasmiy hujjat

- [RD: Keys and values](https://redis.io/docs/latest/develop/using-commands/keyspace/)
- [RD: EXPIRE](https://redis.io/docs/latest/commands/expire/) · [TTL](https://redis.io/docs/latest/commands/ttl/) · [PERSIST](https://redis.io/docs/latest/commands/persist/)
- [RD: SCAN](https://redis.io/docs/latest/commands/scan/) · [KEYS](https://redis.io/docs/latest/commands/keys/)
- [RD: Redis CLI — mass insertion](https://redis.io/docs/latest/develop/tools/cli/)
