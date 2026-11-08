# 07 — List

[Mundarija](README.md)

## Tushuncha

RD (Redis lists): **list** — satrlarning **bog'langan ro'yxati** (linked list). Ko'pincha **stek** va **navbat** sifatida, fon ishlari (background jobs) navbati uchun ishlatiladi.

### Nega bog'langan ro'yxat

RD: "List" so'zi ko'pincha noto'g'ri ishlatiladi — masalan, Python'dagi `list` aslida **massiv**. Bog'langan ro'yxatda:

- boshiga yoki oxiriga element qo'shish **o'zgarmas vaqtda** (O(1)): 10 elementli ro'yxatga ham, 10 million elementliga ham bir xil tezlikda;
- lekin **indeks bo'yicha** murojaat sekinroq — ish indeksga mutanosib.

Ma'lumotlar bazasi uchun uzun ro'yxatga juda tez qo'shish muhim — shuning uchun Redis shu yo'lni tanlagan. O'rtadagi elementlarga tez kirish kerak bo'lsa — sorted set (9-bob).

### Buyruqlar

| Buyruq | Nima |
| --- | --- |
| `LPUSH` / `RPUSH k v …` | Chapga (boshiga) / o'ngga (oxiriga) qo'shish; bir nechta element birdan (variadic) |
| `LPOP` / `RPOP k` | Chapdan / o'ngdan **olib tashlab** qaytarish; ro'yxat bo'sh bo'lsa — `nil` |
| `LRANGE k boshi oxiri` | Oraliq; manfiy indeks oxiridan: `-1` — oxirgi, `-2` — oxiridan ikkinchi |
| `LLEN k` | Uzunlik |
| `LTRIM k boshi oxiri` | Faqat shu oraliqni qoldirish, qolganini o'chirish |
| `LMOVE manba manzil LEFT\|RIGHT LEFT\|RIGHT` | Bir ro'yxatdan olib, boshqasiga **atomar** qo'shish |
| `BLPOP`, `BRPOP`, `BLMOVE` | Kutib turuvchi (blocking) variantlar |
| `LINDEX`, `LINSERT`, `LSET`, `LREM` | O'rtadagi elementlar bilan ishlash — odatda **O(n)** |

| Naqsh | Qanday |
| --- | --- |
| **Navbat** (FIFO — birinchi kelgan birinchi chiqadi) | `LPUSH` + `RPOP` |
| **Stek** (LIFO — oxirgi kelgan birinchi chiqadi) | `LPUSH` + `LPOP` |
| **Oxirgi N ta** (capped list) | `LPUSH` + `LTRIM 0 N-1` — masalan, foydalanuvchilarning oxirgi postlari |

RD: `LRANGE` texnik jihatdan O(N), lekin boshi yoki oxiridagi kichik oraliq — o'zgarmas vaqt.

### Kutib turuvchi buyruqlar

Ishlab chiqaruvchi (producer) `LPUSH` qiladi, ishlovchi (consumer, worker) `RPOP`. Ro'yxat bo'sh bo'lsa, `RPOP` `nil` qaytaradi va ishlovchi kutib, qayta so'rashi kerak — bu **so'rab turish** (polling). RD: bu ikki jihatdan yomon — Redis va mijozlar foydasiz buyruqlarni ishlaydi, va ish kechikadi.

`BRPOP`/`BLPOP` — ro'yxat bo'sh bo'lsa **kutib turadi** va element kelishi bilan yoki muddat tugaganda qaytadi (RD):

- muddat `0` — cheksiz kutish; bir nechta ro'yxatni birdan kutish mumkin;
- mijozlar **navbat bilan** xizmat oladi: birinchi kutayotgan birinchi oladi;
- javob — **ikki** element: ro'yxat nomi va qiymat (bir nechta ro'yxatni kutganda qaysidan kelgani muhim);
- muddat tugasa — `nil`.

### Ishonchli navbat

RD (LMOVE, "reliable queue"): oddiy `RPOP`/`BRPOP` bilan navbat **ishonchli emas** — tarmoq muammosi bo'lsa yoki ishlovchi xabarni olib, ishlab ulgurmay qulasa, xabar **yo'qoladi**. `LMOVE`/`BLMOVE` bilan ishlovchi xabarni olish bilan bir vaqtda uni **"ishlanmoqda"** ro'yxatiga o'tkazadi; ish tugagach `LREM` bilan o'chiradi. Boshqa mijoz "ishlanmoqda" ro'yxatida uzoq qolganlarni kuzatib, navbatga qaytarishi mumkin. Fon ishlari navbati — 21-bob.

### Kalitlarni avtomatik yaratish va o'chirish

RD — ko'p elementli barcha turlar (list, set, sorted set, hash, stream) uchun uch qoida:

1. Element qo'shilganda kalit yo'q bo'lsa — bo'sh tuzilma avtomatik yaratiladi.
2. Elementlar olib tashlanib, tuzilma **bo'sh qolsa — kalit o'chiriladi** (istisno: stream).
3. Bo'sh kalitga o'qish buyrug'i (`LLEN`) yoki o'chirish buyrug'i — xuddi bo'sh tuzilmadagi kabi natija beradi.

Mavjud kalit boshqa turda bo'lsa — `WRONGTYPE` xatosi (5-bob).

Ro'yxatning maksimal uzunligi — 2^32 − 1 element. RD: noaniq uzunlikdagi hodisalar ketma-ketligi uchun list o'rniga **stream** (10-bob) ham ko'rib chiqilsin.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3), RD misollari.

### Navbat va stek

```text vps
$ redis-cli FLUSHALL
OK
$ redis-cli LPUSH bikes:repairs bike:1; redis-cli LPUSH bikes:repairs bike:2; redis-cli RPOP bikes:repairs; redis-cli RPOP bikes:repairs
1
2
bike:1
bike:2
$ redis-cli LPUSH bikes:repairs bike:1; redis-cli LPUSH bikes:repairs bike:2; redis-cli LPOP bikes:repairs; redis-cli LPOP bikes:repairs
1
2
bike:2
bike:1
```

- `LPUSH` + `RPOP` — `bike:1` birinchi qo'shilgan, birinchi chiqdi (navbat).
- `LPUSH` + `LPOP` — `bike:2` oxirgi qo'shilgan, birinchi chiqdi (stek).

### Oraliq, uzunlik, `LMOVE`

```text vps
$ redis-cli RPUSH bikes:repairs bike:1 bike:2 bike:3; redis-cli LPUSH bikes:repairs bike:important_bike; redis-cli LRANGE bikes:repairs 0 -1; redis-cli LLEN bikes:repairs; redis-cli LRANGE bikes:repairs -2 -1
3
4
bike:important_bike
bike:1
bike:2
bike:3
4
bike:2
bike:3
$ redis-cli LMOVE bikes:repairs bikes:finished LEFT LEFT; redis-cli LRANGE bikes:repairs 0 -1; redis-cli LRANGE bikes:finished 0 -1
bike:important_bike
bike:1
bike:2
bike:3
bike:important_bike
```

`LPUSH` bilan qo'shilgan `bike:important_bike` — boshida. `LMOVE … LEFT LEFT` — chapdan olib, boshqa ro'yxatning chapiga.

### Oxirgi 3 ta

```text vps
$ redis-cli DEL oxirgilar > /dev/null; for i in 1 2 3 4 5 6; do redis-cli LPUSH oxirgilar post:$i > /dev/null; redis-cli LTRIM oxirgilar 0 2 > /dev/null; done; redis-cli LRANGE oxirgilar 0 -1
post:6
post:5
post:4
```

Har `LPUSH` dan keyin `LTRIM 0 2` — ro'yxatda doim eng yangi 3 ta.

### Kutish: `BRPOP`

```text vps
$ TIMEFORMAT='kutildi: %R s'; time redis-cli BRPOP bosh:navbat 1 | od -c | head -1
0000000  \n
kutildi: 1.100 s
$ ( sleep 1; redis-cli LPUSH ishlar ish:1 > /dev/null ) & TIMEFORMAT='kutildi: %R s'; time redis-cli BRPOP ishlar 0; wait
ishlar
ish:1
kutildi: 1.015 s
```

- Bo'sh ro'yxatda `BRPOP … 1` — 1 soniya kutib, `nil` (bo'sh qator).
- Ikkinchisida `BRPOP … 0` cheksiz kutdi; 1 soniyadan keyin boshqa mijoz `LPUSH` qildi — `BRPOP` darhol qaytdi: ro'yxat nomi va qiymat.

Ikki ishlovchi bir navbatni kutmoqda:

```text vps
$ ( redis-cli BLPOP navbat 5 | tr '\n' ' ' | sed 's/^/1-mijoz oldi: /'; echo ) & sleep 0.3; ( redis-cli BLPOP navbat 5 | tr '\n' ' ' | sed 's/^/2-mijoz oldi: /'; echo ) & sleep 0.3; redis-cli RPUSH navbat birinchi ikkinchi > /dev/null; wait
1-mijoz oldi: navbat birinchi 2-mijoz oldi: navbat ikkinchi 
```

Birinchi kutgan mijoz birinchi elementni oldi — RD aytgan tartib.

### Bo'sh ro'yxat — kalit yo'q

```text vps
$ redis-cli DEL yangi > /dev/null; redis-cli EXISTS yangi; redis-cli LPUSH yangi a; redis-cli EXISTS yangi; redis-cli RPOP yangi; redis-cli EXISTS yangi; redis-cli LLEN yangi
0
1
1
a
0
0
```

`LPUSH` kalitni yaratdi; oxirgi element olingach — kalit o'chdi (`EXISTS` — `0`); yo'q kalitga `LLEN` — `0`.

### Ishonchli navbat

```text vps
$ redis-cli FLUSHALL > /dev/null; redis-cli RPUSH vazifalar xat:1 xat:2 xat:3
3
$ v=$(redis-cli BLMOVE vazifalar ishlanmoqda LEFT RIGHT 5); echo "olindi: $v"; redis-cli LREM ishlanmoqda 1 "$v"; echo "bajarildi: $v"
olindi: xat:1
1
bajarildi: xat:1
$ v=$(redis-cli BLMOVE vazifalar ishlanmoqda LEFT RIGHT 5); echo "olindi: $v (ishlovchi shu yerda to'xtab qoldi)"
olindi: xat:2 (ishlovchi shu yerda to'xtab qoldi)
$ echo "navbatda: $(redis-cli LRANGE vazifalar 0 -1 | tr '\n' ' ')"; echo "ishlanmoqda: $(redis-cli LRANGE ishlanmoqda 0 -1 | tr '\n' ' ')"
navbatda: xat:3 
ishlanmoqda: xat:2 
$ redis-cli LMOVE ishlanmoqda vazifalar RIGHT LEFT; echo "navbatda: $(redis-cli LRANGE vazifalar 0 -1 | tr '\n' ' ')"
xat:2
navbatda: xat:2 xat:3 
```

- `xat:1` — olindi (`BLMOVE` uni `ishlanmoqda` ga o'tkazdi), ishlandi va `LREM` bilan o'chirildi.
- `xat:2` — olindi, lekin ishlovchi "qulab" qoldi: xabar **yo'qolmadi** — `ishlanmoqda` ro'yxatida turibdi.
- Kuzatuvchi uni navbat boshiga qaytardi — boshqa ishlovchi oladi.

Oddiy `RPOP` bilan `xat:2` butunlay yo'qolardi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Bo'sh navbatni sikl bilan `RPOP` qilib so'rash | Foydasiz buyruqlar va kechikish (RD) | `BRPOP`/`BLMOVE` |
| `RPOP` bilan olib, keyin ishlash | Ishlovchi qulasa — xabar yo'qoladi | `BLMOVE` + "ishlanmoqda" ro'yxati + `LREM` |
| Katta ro'yxatda `LINDEX`/`LINSERT`/`LSET` ni ko'p ishlatish | O(n) | O'rtaga tez kirish kerak bo'lsa — sorted set |
| Ro'yxatni cheksiz o'stirish | Xotira tugaydi | `LTRIM` bilan chegara |
| `LPUSH` + `LPOP` ni navbat deb ishlatish | Bu stek (LIFO) | Navbat — `LPUSH` + `RPOP` |
| Ko'p o'quvchi va qayta o'qish kerak bo'lgan hodisalar uchun list | Element olingach yo'qoladi | Stream (10-bob) |

## Amaliyot

1. Nega Redis list bog'langan ro'yxat sifatida qilingan? Buning kamchiligi nima?
2. Navbat va stekni qaysi buyruqlar bilan qilasiz?
3. Oxirgi 100 ta hodisani qanday saqlaysiz?
4. `BRPOP` `RPOP` dan nimasi bilan farq qiladi? Javobida nechta element bo'ladi?
5. Ishlovchi xabarni olib, qulab qolsa, xabar yo'qolmasligi uchun nima qilinadi?
6. Ro'yxatdan oxirgi element olinganda kalit bilan nima bo'ladi?

<details>
<summary>Javoblar</summary>

1. Uzun ro'yxatning boshiga/oxiriga tez (O(1)) qo'shish uchun. Kamchiligi — indeks bo'yicha murojaat indeksga mutanosib vaqt oladi.
2. Navbat — `LPUSH` + `RPOP`; stek — `LPUSH` + `LPOP`.
3. `LPUSH` + `LTRIM k 0 99`.
4. Ro'yxat bo'sh bo'lsa kutib turadi; javob — ro'yxat nomi va qiymat (ikki element).
5. `BLMOVE` bilan xabarni "ishlanmoqda" ro'yxatiga o'tkazish, ishlagach `LREM`; uzoq qolganlarini navbatga qaytarish.
6. Kalit o'chiriladi (stream'dan tashqari barcha ko'p elementli turlarda).

</details>

## Rasmiy hujjat

- [RD: Redis lists](https://redis.io/docs/latest/develop/data-types/lists/)
- [RD: LMOVE (reliable queue)](https://redis.io/docs/latest/commands/lmove/) · [BLMOVE](https://redis.io/docs/latest/commands/blmove/) · [BRPOP](https://redis.io/docs/latest/commands/brpop/) · [LTRIM](https://redis.io/docs/latest/commands/ltrim/)
