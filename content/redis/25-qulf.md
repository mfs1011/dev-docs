# 25 — Taqsimlangan qulf

[Mundarija](README.md)

## Tushuncha

RD (Distributed locks): **taqsimlangan qulf** (distributed lock) — har xil jarayonlar umumiy resurs bilan **navbatma-navbat** (bir vaqtda faqat bittasi) ishlashi kerak bo'lganda kerak. Masalan, bitta buyurtmani ikki ishlovchi bir vaqtda qayta ishlamasligi uchun.

RD qulf uchun uch xususiyatni minimal talab deb belgilaydi:

1. **Xavfsizlik** (safety) — o'zaro istisno: har onda qulf faqat **bitta** mijozda.
2. **Tirik qolish A** (liveness) — o'lik qulf (deadlock) yo'q: qulf egasi qulasa yoki tarmoqdan uzilsa ham, oxir-oqibat qulfni olish mumkin.
3. **Tirik qolish B** — nosozlikka chidamlilik: Redis tugunlarining ko'pchiligi ishlasa, qulf olinadi va bo'shatiladi.

### Bitta Redis bilan to'g'ri qulf

RD — olish:

```text
SET resource_name my_random_value NX PX 30000
```

- `NX` — kalit **yo'q** bo'lsagina yoziladi (5-bob): kim birinchi bo'lsa, o'sha oladi;
- `PX 30000` — 30 soniyadan keyin **o'zi o'chadi** (4-bob): egasi qulasa ham qulf abadiy qolmaydi (2-xususiyat);
- qiymat — **barcha mijozlar va barcha so'rovlar orasida noyob** tasodifiy satr.

Bo'shatish (RD) — faqat qiymat **o'zimizniki** bo'lsa o'chirish:

```text
DELEX key IFEQ my_random_value
```

`DELEX` — Redis 8.4 dan; oldingi versiyalarda xuddi shu ishni Lua skript qiladi (15-bob):

```lua
if redis.call("get",KEYS[1]) == ARGV[1] then
    return redis.call("del",KEYS[1])
else
    return 0
end
```

**Nega oddiy `DEL` xavfli** (RD): mijoz qulfni oladi, keyin biror amalda qulf muddatidan uzoqroq to'xtab qoladi; qulf o'chadi va boshqa mijoz uni oladi; birinchi mijoz uyg'onib `DEL` qiladi — **boshqaning** qulfini o'chiradi. Tasodifiy qiymat — qulfning "imzosi".

Tasodifiy qiymat (RD): `/dev/urandom` dan 20 bayt; soddaroq — mikrosoniyali Unix vaqti + mijoz ID (kamroq xavfsiz, lekin ko'p hollarda yetarli).

**Qulf amal qilish vaqti** (lock validity time) — kalit muddati: avtomatik bo'shash vaqti va mijozga amalni bajarish uchun berilgan vaqt.

### Nega replika yetarli emas

RD: bitta Redis — yagona nosozlik nuqtasi. Replika qo'shish (30-bob) **xavfsizlikni buzadi**, chunki replikatsiya asinxron:

1. A mijoz master'da qulf oladi.
2. Master yozuvni replikaga uzatib ulgurmay qulaydi.
3. Replika master bo'ladi.
4. B mijoz o'sha resursga qulf oladi — **ikkalasida qulf**.

Nosozlik paytida ba'zan ikki mijozda qulf bo'lishi mumkin bo'lsa — replikali yechim ham bo'ladi (RD). Bo'lmasa — Redlock.

### Redlock

RD: N ta **bir-biridan mustaqil** Redis master (replikatsiyasiz; misolda N = 5). Qulf olish:

1. Joriy vaqtni millisoniyada olish.
2. Barcha N tugunda **bir xil** kalit va tasodifiy qiymat bilan qulf olishga urinish (parallel). Har tugunga qulf muddatiga nisbatan **kichik** timeout (masalan, muddat 10 s bo'lsa — ~5–50 ms) — ishlamayotgan tugunda uzoq kutib qolmaslik uchun.
3. Ketgan vaqtni hisoblash. Qulf **faqat** ko'pchilikda (kamida 3 ta) olingan **va** ketgan vaqt qulf muddatidan kam bo'lsa — olingan.
4. Qulf amal qilish vaqti = boshlang'ich muddat − ketgan vaqt.
5. Olinmagan bo'lsa (N/2+1 ta bo'lmasa yoki vaqt manfiy) — **barcha** tugunlarda bo'shatish (olinmagan deb o'ylanganlarida ham).

Qayta urinish (RD): olinmasa — **tasodifiy** kechikish bilan qayta (bir vaqtda urinayotgan mijozlar "hech kim ololmaydi" holatiga tushmasligi uchun); qisman olingan qulflarni darhol bo'shatish.

### Xavfsizlik shartlari (RD)

- O'zaro istisno **faqat** qulf egasi ishini qulf amal qilish vaqti ichida (soat og'ishi uchun bir necha ms olib tashlab) tugatsa kafolatlanadi. Jarayonlar soatlari bir xil tezlikda yurishi taxmin qilinadi.
- **Doimiy saqlash** (persistence): saqlashsiz tugun qayta ishga tushsa, qulfni "unutadi" — boshqa mijoz ko'pchilikni yana yig'ishi mumkin. AOF bilan toza `SHUTDOWN` muammosiz (muddat server o'chiq paytda ham o'tadi). Elektr uzilishida standart "har soniyada fsync" bilan kalit yo'qolishi mumkin — to'liq kafolat uchun `fsync=always` (unumdorlik pasayadi). Muqobil — **kechiktirilgan qayta ishga tushirish**: qulagan tugunni eng katta qulf muddatidan biroz ko'proq vaqt ishga tushirmaslik.
- **Uzaytirish**: ish kichik qadamlardan iborat bo'lsa — qisqa muddat va Lua skript bilan uzaytirish (kalit bor va qiymat o'zimizniki bo'lsa); uzaytirish ham ko'pchilikda bo'lishi kerak; urinishlar soni cheklansin.
- **Fencing token**lar (himoya tokenlari) — ayniqsa uzoq jarayonlar uchun; qulf egasi tirik ekan qulf saqlanadi deb **o'ylamang**.
- Redis TTL uchun **monoton soat ishlatmaydi**: tizim soati siljisa, qulfni bir nechta jarayon olishi mumkin. NTP'ni to'g'ri sozlash va soatni qo'lda o'zgartirmaslik — kamaytiradi, lekin yo'qotmaydi.
- Tarmoq bo'linishida qulf TTL vaqtigacha mavjud bo'lmay qolishi mumkin (tirik qolish narxi).

RD Redlock'ni tanqidiy tahlilni ham ko'rib chiqishni so'raydi: Martin Kleppmann maqolasi va antirez javobi (havolalar pastda).

Tayyor kutubxonalar (RD ro'yxati): Node.js — `node-redlock`, `redlock-universal`; PHP — `RedisMutex`, `Redlock-php`; Python, Go, Java va boshqalar.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3).

### Bitta Redis: olish va bo'shatish

```text vps
$ redis-cli FLUSHALL
OK
$ A=$(head -c 20 /dev/urandom | xxd -p); B=$(head -c 20 /dev/urandom | xxd -p); echo "A: $A"; echo "B: $B"
A: 7bc7604d2246ddd9c779ecc4e7fdbaa0b47e2931
B: ece0011d29598bb5484ead6e60aa91b4ff833298
$ redis-cli SET resource_name $A NX PX 30000; redis-cli SET resource_name $B NX PX 30000 | od -c | head -1; redis-cli PTTL resource_name
OK
0000000  \n
29979
$ redis-cli DELEX resource_name IFEQ $B; redis-cli GET resource_name; redis-cli DELEX resource_name IFEQ $A; redis-cli EXISTS resource_name
0
7bc7604d2246ddd9c779ecc4e7fdbaa0b47e2931
1
0
```

- A qulfni oldi; B ning `SET … NX` — `nil` (bo'sh qator); `PTTL` — qolgan muddat.
- B ning `DELEX … IFEQ` — `0`: qulf B niki emas. A niki — `1`, qulf bo'shadi.

### Oddiy `DEL` xavfi

A qulfni 1 soniyaga oldi va 1,5 soniya "to'xtab qoldi"; shu orada qulf o'chdi va B oldi. Endi A ishini tugatib, qulfni bo'shatmoqchi:

```text vps
$ redis-cli SET resource_name $A NX PX 1000 > /dev/null; sleep 1.5; redis-cli SET resource_name $B NX PX 30000; redis-cli DEL resource_name; redis-cli EXISTS resource_name
OK
1
0
$ redis-cli SET resource_name $A NX PX 1000 > /dev/null; sleep 1.5; redis-cli SET resource_name $B NX PX 30000; redis-cli DELEX resource_name IFEQ $A; redis-cli GET resource_name; redis-cli DEL resource_name > /dev/null
OK
0
ece0011d29598bb5484ead6e60aa91b4ff833298
```

- `DEL` — `1`: A **B ning** qulfini o'chirib yubordi (`EXISTS` — `0`). Endi uchinchi mijoz ham qulf ola oladi.
- `DELEX … IFEQ $A` — `0`: qulf A niki emas, tegilmadi; B ning qulfi joyida.

### Qulf bilan "o'qib, oshirib, yozish"

5-bobda 10 ta parallel mijoz `GET` + `SET` bilan 1000 oshirishdan 183 tasini saqlab qolgan edi. Endi xuddi shu amal qulf ichida — 10 ishlovchi, har biri 50 marta:

```text vps
$ ish() { for i in $(seq 1 50); do until [ "$(redis-cli SET qulf:hisob $1 NX PX 2000)" = OK ]; do :; done; v=$(redis-cli GET hisob); redis-cli SET hisob $((v+1)) > /dev/null; redis-cli DELEX qulf:hisob IFEQ $1 > /dev/null; done; }
$ redis-cli SET hisob 0 > /dev/null; for w in $(seq 1 10); do ish w$w & done; wait; echo "hisob: $(redis-cli GET hisob)"
hisob: 500
```

Natija aniq **500**: qulf amalni navbatma-navbat qildi. (Hisoblagich uchun baribir `INCR` — 5-bob; bu yerda maqsad — qulfni ko'rsatish.)

### Redlock: 5 ta mustaqil Redis

Bitta VPS'da 7001–7005 portlarda 5 ta alohida, saqlashsiz Redis (faqat namoyish uchun — haqiqiy Redlock'da tugunlar alohida kompyuterlarda bo'ladi):

```text vps
$ for p in 7001 7002 7003 7004 7005; do redis-server --port $p --daemonize yes --save '' --appendonly no --bind 127.0.0.1 --logfile /tmp/r$p.log; done; sleep 0.5; for p in 7001 7002 7003 7004 7005; do redis-cli -p $p PING; done | sort | uniq -c
      5 PONG
$ ochir() { for p in 7001 7002 7003 7004 7005; do redis-cli -p $p DELEX $1 IFEQ $2 > /dev/null 2>&1; done; }
$ qulfla() { local t0=$(date +%s%3N) ok=0; for p in 7001 7002 7003 7004 7005; do [ "$(redis-cli -p $p SET $1 $2 NX PX 10000 2>/dev/null)" = OK ] && ok=$((ok+1)); done; local dt=$(( $(date +%s%3N) - t0 )); if [ $ok -ge 3 ] && [ $dt -lt 10000 ]; then echo "$2: $ok/5 — qulf olindi ($dt ms ketdi)"; else echo "$2: $ok/5 — olinmadi, hamma joyda bo'shatiladi"; ochir $1 $2; fi; }
```

`qulfla` — RD algoritmining soddalashtirilgan shakli: tugunlarga **ketma-ket** murojaat (RD parallel deydi) va timeout'siz; 5 tadan kamida 3 tasida olinsa va ketgan vaqt 10 000 ms dan kam bo'lsa — olingan, aks holda hamma joyda bo'shatiladi.

```text vps
$ qulfla buyurtma:42 mijoz-A; qulfla buyurtma:42 mijoz-B
mijoz-A: 5/5 — qulf olindi (39 ms ketdi)
mijoz-B: 0/5 — olinmadi, hamma joyda bo'shatiladi
$ ochir buyurtma:42 mijoz-A; redis-cli -p 7001 SHUTDOWN NOSAVE; redis-cli -p 7002 SHUTDOWN NOSAVE; qulfla buyurtma:42 mijoz-B
mijoz-B: 3/5 — qulf olindi (44 ms ketdi)
$ ochir buyurtma:42 mijoz-B; redis-cli -p 7003 SHUTDOWN NOSAVE; qulfla buyurtma:42 mijoz-C; for p in 7004 7005; do redis-cli -p $p EXISTS buyurtma:42; done
mijoz-C: 2/5 — olinmadi, hamma joyda bo'shatiladi
0
0
```

| Holat | Natija |
| --- | --- |
| A — 5 tugun ishlaydi | 5/5 — olindi |
| B — A ushlab turibdi | 0/5 — olinmadi |
| 2 tugun o'chdi, B | 3/5 — ko'pchilik, olindi |
| 3 tugun o'chdi, C | 2/5 — olinmadi; qolgan ikkitasida ham bo'shatildi (`EXISTS` — `0`) |

Ko'pchilik ishlasa — qulf ishlaydi (3-xususiyat); ko'pchilik bo'lmasa — hech kim olmaydi (xavfsizlik saqlanadi).

## Variantlar

| Usul | Kafolat | Qachon |
| --- | --- | --- |
| Bitta Redis, `SET NX PX` + `DELEX IFEQ` | Bitta server ishlab tursa — to'g'ri; server qulasa — qulf yo'qoladi | Ba'zan poyga holati mumkin bo'lgan holatlar (RD) |
| Master + replika | Failover'da ikki egasi bo'lishi mumkin (RD) | Nosozlikda takroriy ish zararsiz bo'lsa |
| Redlock (N mustaqil master) | Ko'pchilik ishlasa; soat va saqlash shartlari bilan | Yuqori ishonchlilik kerak bo'lsa; tayyor kutubxona bilan |
| Fencing token bilan | Resurs eski egadan kelgan yozuvni rad etadi | To'g'rilik juda muhim bo'lsa (RD tavsiyasi) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Qulfni `DEL` bilan bo'shatish | Boshqaning qulfini o'chiradi (sinovda shunday bo'ldi) | `DELEX … IFEQ` yoki Lua skript |
| Hamma mijozlar bir xil qiymat (`1`) yozadi | Qulf egasini ajratib bo'lmaydi | Har so'rovga noyob tasodifiy qiymat |
| `SET NX` + alohida `EXPIRE` | Orada mijoz qulasa — muddatsiz qulf | Bitta buyruq: `SET … NX PX` |
| Muddatsiz qulf | Egasi qulasa — abadiy qulf | Har doim `PX` |
| Muddat ishdan qisqa | Ish tugamay qulf o'chadi, boshqa oladi | Yetarli muddat yoki uzaytirish |
| Replikali bitta Redis'ni to'liq xavfsiz deb o'ylash | Asinxron replikatsiya — failover'da ikki egasi (RD) | Redlock yoki fencing token |
| Redlock'da saqlashsiz tugunni darhol qayta ishga tushirish | Qulfni unutadi | AOF `fsync=always` yoki kechiktirilgan qayta ishga tushirish |
| Qulf olinmasa darhol qayta urinish | Mijozlar bir-biriga xalaqit beradi | Tasodifiy kechikish bilan |

## Amaliyot

1. Taqsimlangan qulfning uch minimal xususiyati qaysilar?
2. Nega qulf `SET … NX PX` bilan olinadi — `NX` va `PX` nima beradi?
3. Nega qiymat tasodifiy va noyob bo'lishi kerak? Sinovda `DEL` nimaga olib keldi?
4. Nega master + replika bilan qulf xavfsiz emas?
5. Redlock'da qulf qachon olingan hisoblanadi?
6. Redlock xavfsizligi uchun qanday shartlar kerak (kamida uchtasi)?

<details>
<summary>Javoblar</summary>

1. O'zaro istisno; o'lik qulf yo'qligi; nosozlikka chidamlilik (ko'pchilik ishlasa).
2. `NX` — faqat kalit yo'q bo'lsa (birinchi kelgan oladi); `PX` — muddatdan keyin o'zi bo'shaydi (egasi qulasa ham).
3. Faqat o'z qulfini bo'shatish uchun; `DEL` boshqa mijozning (B) qulfini o'chirib yubordi.
4. Replikatsiya asinxron: qulf replikaga yetmay master qulasa, yangi master'da boshqa mijoz qulf oladi.
5. Ko'pchilik tugunda (5 dan kamida 3) olinsa va ketgan vaqt qulf muddatidan kam bo'lsa.
6. Ish qulf amal qilish vaqtida tugashi; soatlar bir xil tezlikda (monoton soat yo'qligi, NTP); qayta ishga tushgan tugun qulfni unutmasligi (`fsync=always` yoki kechiktirilgan ishga tushirish); fencing token.

</details>

## Rasmiy hujjat

- [RD: Distributed locks with Redis](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/)
- [RD: SET](https://redis.io/docs/latest/commands/set/) · [DELEX](https://redis.io/docs/latest/commands/delex/)
- RD keltirgan tahlil: [Martin Kleppmann — How to do distributed locking](http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) · [antirez — javob](http://antirez.com/news/101)
