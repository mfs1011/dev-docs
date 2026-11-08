# 11 — JSON

[Mundarija](README.md)

## Tushuncha

RD (JSON): Redis Open Source'ning **JSON** imkoniyati — JSON (JavaScript Object Notation) qiymatlarni boshqa turlar kabi saqlash, yangilash va o'qish. Asosiy xususiyatlari (RD):

- JSON standartini to'liq qo'llaydi;
- hujjat ichidagi elementlarni tanlash va yangilash uchun **JSONPath** sintaksisi;
- hujjat **ikkilik daraxt** ko'rinishida saqlanadi — ichki elementlarga tez murojaat;
- har JSON turi uchun **atomar** amallar (masalan, sonni oshirish).

JSON — Redis Open Source tarkibida (alohida o'rnatilmaydi; 2-bobda o'rnatilgan paketda bor). Redis Search bilan birga indekslash va qidirish mumkin (RD).

### Yo'l (path)

Har buyruqda **yo'l** — hujjatning qaysi qismi. `$` — ildiz (butun hujjat). RD: yo'l `$` bilan boshlansa — **JSONPath** sintaksisi, aks holda — **eski** (legacy) sintaksis (birinchi versiyadan qolgan).

| Element | Ma'nosi |
| --- | --- |
| `$` | Ildiz |
| `.` yoki `[]` | Ichki element: `$.inventory`, `$["mountain_bikes"]` (maxsus belgili nomlar uchun qavs) |
| `..` | Rekursiv — hamma chuqurlikda qidirish |
| `*` | Hamma elementlar |
| `[0]`, `[-1]` | Massiv elementi (manfiy — oxiridan) |
| `[boshi:oxiri:qadam]` | Massiv bo'lagi |
| `?()` | Filtr: `==`, `!=`, `<`, `<=`, `>`, `>=`, `=~` (muntazam ifoda), `&&`, `\|\|` |
| `@` | Filtrdagi joriy element |

RD: JSONPath yo'li **bir nechta joyga** mos kelishi mumkin — buyruq har biriga qo'llanadi, javob **massiv**. Eski yo'l — faqat birinchi mos joyga, javob — qiymatning o'zi. Redis 8.10 dan filtrlarda qo'shimcha operator va funksiyalar: `in`, `nin`, `size`, `empty`, `length()`, `min()`/`max()`/`avg()`/`sum()` va boshqalar.

### Buyruqlar

| Buyruq | Nima |
| --- | --- |
| `JSON.SET k yo'l qiymat [NX\|XX]` | Yozish; `NX` — yo'l yo'q bo'lsa, `XX` — bor bo'lsa |
| `JSON.GET k [yo'l …]` | O'qish; bir nechta yo'l — obyekt `{yo'l: [qiymatlar]}` |
| `JSON.DEL k yo'l`, `JSON.TYPE` | O'chirish, tur |
| `JSON.STRLEN`, `JSON.STRAPPEND` | Satr uzunligi, satrga qo'shish |
| `JSON.NUMINCRBY`, `JSON.NUMMULTBY` | Sonni oshirish, ko'paytirish |
| `JSON.ARRAPPEND`, `JSON.ARRINSERT`, `JSON.ARRTRIM`, `JSON.ARRPOP` | Massiv amallari |
| `JSON.OBJLEN`, `JSON.OBJKEYS` | Obyekt maydonlari soni, nomlari |

**Cheklov** (RD): JSON qiymatning ichma-ichligi — 128 gacha; undan chuqur obyekt yoki massiv — xato.

`redis-cli --raw` bilan `JSON.GET … INDENT … NEWLINE … SPACE …` — chiroyli formatlangan chiqish (RD).

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3), RD misollari.

### JSON moduli

```text vps
$ redis-cli FLUSHALL
OK
$ redis-cli MODULE LIST | grep -A1 -x name | grep -v -- -- | paste - - | head -6
name	bf
name	search
name	vectorset
name	ReJSON
name	timeseries
```

`ReJSON` — JSON imkoniyati; bundan tashqari qidiruv (`search`), ehtimollik tuzilmalari (`bf`), vaqt qatorlari (`timeseries`), vektorlar (`vectorset`) — hammasi Redis Open Source tarkibida.

### Satr va son

```text vps
$ redis-cli JSON.SET bike '$' '"Hyperion"'; redis-cli JSON.GET bike '$'; redis-cli JSON.TYPE bike '$'; redis-cli JSON.STRLEN bike '$'; redis-cli JSON.STRAPPEND bike '$' '" (Enduro bikes)"'; redis-cli JSON.GET bike '$'
OK
["Hyperion"]
string
8
23
["Hyperion (Enduro bikes)"]
$ redis-cli JSON.SET crashes '$' 0; redis-cli JSON.NUMINCRBY crashes '$' 1; redis-cli JSON.NUMINCRBY crashes '$' 1.5; redis-cli JSON.NUMINCRBY crashes '$' -0.75; redis-cli JSON.NUMMULTBY crashes '$' 24
OK
[1]
[2.5]
[1.75]
[42.0]
```

`$` yo'li bilan javoblar **massiv** ichida: `["Hyperion"]`, `[1]`.

### Massiv va obyekt

```text vps
$ redis-cli JSON.SET newbike '$' '["Deimos", {"crashes": 0}, null]'; redis-cli JSON.GET newbike '$'; redis-cli JSON.GET newbike '$[1].crashes'; redis-cli JSON.DEL newbike '$[-1]'; redis-cli JSON.GET newbike '$'
OK
[["Deimos",{"crashes":0},null]]
[0]
1
[["Deimos",{"crashes":0}]]
$ redis-cli JSON.SET riders '$' '[]'; redis-cli JSON.ARRAPPEND riders '$' '"Norem"'; redis-cli JSON.ARRINSERT riders '$' 1 '"Prickett"' '"Royce"' '"Castilla"'; redis-cli JSON.GET riders '$'; redis-cli JSON.ARRTRIM riders '$' 1 1; redis-cli JSON.GET riders '$'; redis-cli JSON.ARRPOP riders '$'; redis-cli JSON.ARRPOP riders '$'
OK
1
4
[["Norem","Prickett","Royce","Castilla"]]
1
[["Prickett"]]
"Prickett"
$ redis-cli JSON.SET bike:1 '$' '{"model": "Deimos", "brand": "Ergonom", "price": 4972}'; redis-cli JSON.OBJLEN bike:1 '$'; redis-cli JSON.OBJKEYS bike:1 '$'; redis-cli TYPE bike:1
OK
3
model
brand
price
ReJSON-RL
```

- `$[1].crashes` — massivning ikkinchi elementidagi maydon; `$[-1]` — oxirgisi o'chirildi.
- `ARRINSERT … 1` — 1-o'ringa uchta element; `ARRTRIM … 1 1` — faqat 1-element qoldi; bo'sh massivga `ARRPOP` — `nil` (bo'sh qator).
- Kalit turi — `ReJSON-RL`.

### Maydonni alohida yangilash

```text vps
$ redis-cli JSON.SET bike:1 '$.price' 4500; redis-cli JSON.SET bike:1 '$.color' '"qora"' NX; redis-cli JSON.SET bike:1 '$.color' '"oq"' NX; redis-cli JSON.GET bike:1
OK
OK

{"model":"Deimos","brand":"Ergonom","price":4500,"color":"qora"}
```

Butun hujjat qayta yozilmadi — faqat `price` almashtirildi va `color` qo'shildi. Ikkinchi `NX` — `nil`: maydon allaqachon bor, yozilmadi.

### JSONPath

RD'dagi do'kon hujjati (qisqartirish uchun `description` maydonlari olib tashlangan):

```text vps
$ redis-cli JSON.SET bikes:inventory '$' '{"inventory":{"mountain_bikes":[{"id":"bike:1","model":"Phoebe","price":1920,"specs":{"material":"carbon","weight":13.1},"colors":["black","silver"]},{"id":"bike:2","model":"Quaoar","price":2072,"specs":{"material":"aluminium","weight":7.9},"colors":["black","white"]},{"id":"bike:3","model":"Weywot","price":3264,"specs":{"material":"alloy","weight":13.8}}],"commuter_bikes":[{"id":"bike:4","model":"Salacia","price":1475,"specs":{"material":"aluminium","weight":16.6},"colors":["black","silver"]},{"id":"bike:5","model":"Mimas","price":3941,"specs":{"material":"alloy","weight":11.6}}]}}'
OK
$ redis-cli JSON.GET bikes:inventory '$.inventory.mountain_bikes[*].model'; redis-cli JSON.GET bikes:inventory '$..model'; redis-cli JSON.GET bikes:inventory '$..mountain_bikes[0:2].model'
["Phoebe","Quaoar","Weywot"]
["Phoebe","Quaoar","Weywot","Salacia","Mimas"]
["Phoebe","Quaoar"]
```

| Yo'l | Natija |
| --- | --- |
| `$.inventory.mountain_bikes[*].model` | Tog' velosipedlari modellari |
| `$..model` | Hujjatdagi **hamma** `model` lar |
| `$..mountain_bikes[0:2].model` | Birinchi ikkitasi |

Filtrlar:

```text vps
$ redis-cli JSON.GET bikes:inventory '$..mountain_bikes[?(@.price < 3000 && @.specs.weight < 10)].model'; redis-cli JSON.GET bikes:inventory '$..[?(@.specs.material == "alloy")].model'; redis-cli JSON.GET bikes:inventory '$..[?(@.specs.material =~ "(?i)al")].model'
["Quaoar"]
["Weywot","Mimas"]
["Quaoar","Weywot","Salacia","Mimas"]
```

- Narxi 3000 dan kam **va** og'irligi 10 dan kam — `Quaoar`.
- Materiali aynan `alloy` — `Weywot`, `Mimas`.
- `=~ "(?i)al"` — muntazam ifoda, katta-kichik harf farqsiz: `aluminium` ham, `alloy` ham.

### Bir nechta yo'l va eski sintaksis

```text vps
$ redis-cli JSON.GET bikes:inventory '$..mountain_bikes[0].model' '$..commuter_bikes[0].model'
{"$..mountain_bikes[0].model":["Phoebe"],"$..commuter_bikes[0].model":["Salacia"]}
$ redis-cli JSON.GET bikes:inventory '.inventory.mountain_bikes[0].model'; redis-cli JSON.GET bikes:inventory '$.inventory.mountain_bikes[0].model'
"Phoebe"
["Phoebe"]
```

- Ikki yo'l — javob obyekt: har yo'lga o'z massivi.
- Eski yo'l (`.` bilan) — qiymatning o'zi (`"Phoebe"`); JSONPath (`$`) — massiv (`["Phoebe"]`).

### Ko'p joyga birdan

```text vps
$ redis-cli JSON.NUMINCRBY bikes:inventory '$..price' 100; redis-cli JSON.GET bikes:inventory '$..price'
[2020,2172,3364,1575,4041]
[2020,2172,3364,1575,4041]
```

`$..price` — beshta narx; `NUMINCRBY` **hammasini** bitta buyruqda 100 ga oshirdi.

### Redis 8.10: `in`

```text vps
$ redis-cli JSON.SET doc '$' '{"a":[1,2,3,4],"allow":[2,3]}'; redis-cli JSON.GET doc '$.a[?@ in $.allow]'
OK
[2,3]
```

`a` dagi elementlardan `allow` ichida borlari.

### Formatlangan chiqish

```text vps
$ redis-cli --raw JSON.GET bike:1 INDENT "  " NEWLINE $'\n' SPACE " " '$'
[
  {
    "model": "Deimos",
    "brand": "Ergonom",
    "price": 4500,
    "color": "qora"
  }
]
```

### Ichma-ichlik chegarasi

```text vps
$ for n in 126 127 128; do printf "$n qavat: "; python3 -c "print('['*$n + ']'*$n)" | redis-cli -x JSON.SET chuqur '$'; done; redis-cli DEL chuqur
126 qavat: OK
127 qavat: OK
128 qavat: recursion limit exceeded at line 1 column 128

1
```

RD 128 gacha deydi; kuzatildi: 127 qavat ichma-ich massiv qabul qilindi, 128 qavatli rad etildi (`recursion limit exceeded`). Amalda chegara — 127 qavat.

## Variantlar: obyektni qanday saqlash

| | Hash (6-bob) | JSON |
| --- | --- | --- |
| Tuzilma | Tekis: maydon → satr | Ichma-ich obyekt va massivlar, son/bool/null turlari |
| Qism yangilash | Maydon bo'yicha | Yo'l bo'yicha, bir nechta joyga birdan |
| Maydon muddati | Bor (`HEXPIRE`) | Kalit muddati (4-bob) |
| Qidiruv | Redis Search bilan | Redis Search bilan, JSONPath filtrlari |
| Qachon | Oddiy tekis obyekt, hisoblagichlar | Ichma-ich hujjat, massivlar |

Tanlash qoidalari — 12-bob.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| JSON'ni string'da saqlab, bitta maydon uchun hammasini qayta yozish | Ortiqcha trafik, poyga holati | `JSON.SET k $.maydon …` |
| Qobiqda yo'lni qo'shtirnoqsiz yozish | `$`, `?`, `*` qobiq tomonidan o'zgartiriladi | Yo'lni bitta qo'shtirnoq ichida: `'$..model'` |
| `$` yo'li javobini qiymat deb o'qish | JSONPath javobi — massiv | Massivning elementini olish yoki eski yo'l |
| Satr qiymatni qo'shtirnoqsiz berish | `JSON.SET k $ Hyperion` — yaroqsiz JSON | `'"Hyperion"'` |
| Juda chuqur ichma-ich hujjat | 128 qavatdan (kuzatildi: 127 dan) chuqur — xato | Tuzilmani tekislash |

## Amaliyot

1. `$` va eski yo'l sintaksisi qanday farqlanadi? Javob ko'rinishi-chi?
2. Hujjatdagi barcha `price` qiymatlarini qanday olasiz va hammasini 10 ga qanday oshirasiz?
3. Narxi 2000 dan kichik velosipedlar modellarini qaysi yo'l bilan olasiz?
4. `JSON.SET k $.color '"qora"' NX` maydon allaqachon bo'lsa nima qaytaradi?
5. Hash o'rniga JSON qachon tanlanadi?
6. JSON ichma-ichligi chegarasi qancha?

<details>
<summary>Javoblar</summary>

1. `$` bilan boshlansa — JSONPath, bir nechta joyga mos kelishi mumkin, javob — massiv; aks holda — eski sintaksis, birinchi mos joy, javob — qiymatning o'zi.
2. `JSON.GET k '$..price'`; `JSON.NUMINCRBY k '$..price' 10`.
3. `'$..[?(@.price < 2000)].model'`.
4. `nil` — yozilmaydi.
5. Ichma-ich obyekt va massivlar, yo'l bo'yicha qism yangilash, bir nechta joyga birdan amal kerak bo'lganda.
6. RD: 128; sinovda 127 qavat qabul qilindi, 128 — rad etildi.

</details>

## Rasmiy hujjat

- [RD: JSON](https://redis.io/docs/latest/develop/data-types/json/)
- [RD: JSON path](https://redis.io/docs/latest/develop/data-types/json/path/)
- [RD: JSON.SET](https://redis.io/docs/latest/commands/json.set/) · [JSON.GET](https://redis.io/docs/latest/commands/json.get/) · [JSON.NUMINCRBY](https://redis.io/docs/latest/commands/json.numincrby/)
