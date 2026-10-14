# 102 — Keys: Uber — haydovchi topish

[← Oldingi: Keys: WhatsApp — millionlab ulanish](101-keys-whatsapp.md) · [Mundarija](README.md) · [Keyingi: Amaliy keys: to'liq tizim →](103-amaliy-keys.md)

## Tushuncha

Twitter (100-bob) — lenta, WhatsApp (101-bob) — ulanishlar. Uber'ning asosiy savoli esa **geografik**: "shu nuqtaga eng yaqin bo'sh haydovchilar kim?" va "shahrning qaysi qismida talab taklifdan ko'p?". Oddiy indeks (B-tree) bitta ustun bo'yicha qidiradi, kenglik va uzunlik esa ikki o'lchamli — "yaqinlik" so'rovi uchun boshqa usul kerak.

Uber bunga **H3** bilan javob bergan — Yer sharini olti burchakli kataklarga bo'luvchi ochiq kodli tizim. Manbalar:

- Uber muhandislik blogi, "H3: Uber's Hexagonal Hierarchical Spatial Index" (2018-yil 27-iyun) — asl sahifa avtomatik so'rovlarni bloklaydi, Internet Archive nusxasidan o'qildi;
- H3 rasmiy hujjati (`h3geo.org`, 4.x versiya);
- Redis rasmiy hujjati — geofazoviy (geospatial) indeks.

**Muhim chegara.** Uber'ning haydovchini buyurtmaga biriktirish (dispatch) tizimining ichki arxitekturasi rasmiy matnda batafsil yozilmagan — bu haqdagi konferensiya chiqishlari (masalan, InfoQ'dagi "Scaling Uber's Real-time Market Platform") video ko'rinishida, transkript bilan tekshirilmadi. Shuning uchun quyidagi "yaqin haydovchini topish" psevdokodi — H3 hujjatidagi funksiyalar asosida **umumiy sxema**, Uber'ning ichki kodi emas.

### Uber H3 ni nima uchun yaratgan

Blog posti:

- H3 — "safar narxi va dispatch'ni samarali optimallashtirish, fazoviy ma'lumotni vizuallashtirish va o'rganish uchun" yaratilgan grid tizimi; Uber uni barcha bozorlarida tahlil va optimallashtirish uchun ishlatadi;
- har kuni bozorda **millionlab hodisalar**: yo'lovchi safar so'raydi, haydovchi safarni boshlaydi, kimdir ovqat buyuradi — har biri aniq joyda;
- bu hodisalar, masalan, shahrning bir qismida **talab taklifdan ko'p** ekanini aytadi va narx shunga qarab o'zgaradi; yoki uberPOOL'da bitta haydovchiga yaqin ikki so'rov borligini bildiradi;
- har bir aniq nuqtada tahlil qilish **juda qiyin va qimmat** — hududlar bo'yicha tahlil ancha amaliy;
- **surge pricing** (talab oshganda narxni ko'tarish) Uber xizmat ko'rsatadigan har shaharda **olti burchakli kataklar** ichidagi talab va taklifni o'lchab hisoblanadi.

Nega pochta indekslari yoki qo'lda chizilgan zonalar emas? Post: pochta hududlari g'alati shakl va o'lchamda va Uber'ga aloqasi yo'q sabablarga ko'ra o'zgaradi; operatsiya jamoasi chizgan zonalar shahar o'zgargani sari tez-tez yangilanishi kerak va chegaralari ixtiyoriy. Grid esa barcha shaharlarda bir xil shakl va o'lchamda, o'zboshimcha o'zgarmaydi.

### Nega olti burchak

H3 hujjati ("Aggregation") va blog:

| Shakl | Qo'shnilar | Qo'shni markazlarigacha masofalar |
| --- | --- | --- |
| Uchburchak | 12 | 3 xil |
| Kvadrat | 8 | 2 xil (qirra orqali va burchak orqali) |
| **Olti burchak** | **6** | **1 xil** — hamma qo'shni bir xil masofada |

Natija: harakatni tahlil qilish soddalashadi; qo'shnilar halqasi kengaygan sari **doiraga yaqinlashadi** (radius bo'yicha qidiruv uchun qulay); blog qo'shimcha qiladi — shaharda odamlar doim harakatda va olti burchak ular harakatlanganda paydo bo'ladigan **kvantlash xatosini** (nuqtani katakka "yaxlitlash"dagi xato) kamaytiradi.

### H3 tuzilishi

Hujjat va blogdan:

- **16 ta aniqlik darajasi** (resolution, 0 — eng yirik, 15 — eng mayda);
- har katak — **64 bitli butun son** (H3 index);
- har darajada katak maydoni oldingisining taxminan **1/7** qismi; har olti burchakning **7 ta bolasi** bor ("aperture 7");
- olti burchakni yettita kichik olti burchakka aniq bo'lib bo'lmaydi — shuning uchun bola kataklar ota katak ichida **taxminan** joylashadi; lekin indeksdagi **mantiqiy** tegishlilik aniq;
- darajani o'zgartirish (`cellToParent`, `cellToChildren`) bir necha bit amali bilan bajariladi — **juda tez**;
- geografik yaqin joylar odatda **son jihatdan yaqin** indeksga ega bo'ladi;
- Yer **122 ta asosiy katak** bilan qoplangan; har darajada aniq **12 ta beshburchak** bor — blog: ular ikosaedr uchlarida, hammasi **suv ustida** joylashtirilgan, ishda kam uchrashi uchun.

Rasmiy jadvaldan (o'rtacha qiymatlar):

| Daraja | Kataklar soni | O'rtacha maydon | O'rtacha qirra |
| --- | --- | --- | --- |
| 7 | 98 825 162 | 5.16 km² | 1.41 km |
| 8 | 691 776 122 | 0.74 km² | 0.53 km |
| 9 | 4 842 432 842 | 0.105 km² | 0.20 km |

### Haqiqiy misol: Toshkent

H3 Python kutubxonasi 4.4.2 bilan ishga tushirildi (koordinatalar — Amir Temur xiyoboni va Chorsu atrofi):

```python
import h3
lat, lng = 41.3111, 69.2797          # Toshkent, Amir Temur xiyoboni
for r in (7, 8, 9):
    c = h3.latlng_to_cell(lat, lng, r)
    print(r, c, round(h3.cell_area(c, 'km^2'), 4))
c = h3.latlng_to_cell(lat, lng, 9)
print('parent7', h3.cell_to_parent(c, 7))
print('children', len(h3.cell_to_children(c, 10)))
for k in (1, 2, 3):
    print('disk', k, len(h3.grid_disk(c, k)))
d = h3.latlng_to_cell(41.3260, 69.2280, 9)   # Chorsu
print('dist', h3.grid_distance(c, d), round(h3.great_circle_distance((lat,lng),(41.3260,69.2280),'km'),2))
```

Chiqish:

```text
7 8720a52d3ffffff 6.1565
8 8820a52d33fffff 0.8795
9 8920a52d33bffff 0.1256
parent7 8720a52d3ffffff
children 7
disk 1 7
disk 2 19
disk 3 37
dist 13 4.62
```

Nimani ko'rsatadi:

- 9-darajadagi katakning otasi 7-darajada — aynan nuqtaning o'zi tushgan 7-darajali katak (`8720a52d3ffffff`), hisob kerak emas;
- bitta katakning 10-darajada **7 ta** bolasi bor;
- `grid_disk` — k qadamgacha bo'lgan kataklar "diski": 1, 7, 19, 37... (1 + 3k(k+1)) — doiraga yaqin halqalar;
- Toshkentdagi katak maydoni (0.1256 km²) jadvaldagi o'rtachadan (0.105) farq qiladi — hujjat aytganidek, maydon katakning ikosaedr uchlariga nisbatan joyiga bog'liq;
- ~4.6 km masofa 9-darajada 13 katak qadamiga teng.

### Ikkinchi yo'l: Redis GEO

Redis rasmiy hujjati: geofazoviy indekslar koordinatalarni saqlash va ular bo'yicha qidirish imkonini beradi — berilgan **radius** yoki **to'rtburchak** ichidagi yaqin nuqtalarni topish uchun. Buyruqlar: `GEOADD` (sorted set'ga qo'shish, har element uchun O(log N)), `GEOSEARCH`, `GEODIST`, `GEOPOS`. Hujjatdagi misol — "eng yaqin velosiped ijarasi stansiyalarini topish". H3 esa **tahlil va agregatsiya** uchun kuchli (kataklar bo'yicha sanash, ierarxiya, kataklarni turli ma'lumotlar to'plamlarini birlashtirish kaliti sifatida ishlatish).

## Nega shunday

| Muammo | Yechim (manba) | Bob |
| --- | --- | --- |
| Har nuqtada tahlil qimmat | Hodisalarni kataklarga guruhlash (Uber blog) | — |
| Zonalar o'zgaruvchan va ixtiyoriy | Global, barqaror grid (Uber blog) | — |
| Kvadrat qo'shnilari ikki xil masofada | Olti burchak — bitta masofa (H3, blog) | — |
| Turli aniqlikdagi ma'lumotlar | Ierarxiya, bit amallari bilan ota/bola (H3) | — |
| Katta hududni ko'p katak bilan saqlash | `compactCells`: Kaliforniya 10 633 → 901 katak (H3) | — |
| Kataklar kalit sifatida | 64 bitli son — shard yoki kesh kaliti bo'la oladi | 25, 95 |

## Psevdokod: yaqin haydovchilar (umumiy sxema)

```text
RES = 9                                        // ~0.1 km² katak

onDriverLocation(driverId, lat, lng):          // har necha soniyada (64-bob)
    cell = latLngToCell(lat, lng, RES)
    old  = driverCell.get(driverId)
    if old != cell:
        cells[old].remove(driverId)
        cells[cell].add(driverId)
        driverCell.set(driverId, cell)

findNearby(lat, lng, need):
    origin = latLngToCell(lat, lng, RES)
    for k in 0..K_MAX:                         // halqa-halqa kengaytirish
        candidates = union(cells[c] for c in gridDisk(origin, k))
        if candidates.size >= need: break
    // katak — faqat tez filtr; aniq tartib haqiqiy masofa yoki yo'l vaqti bo'yicha
    return sortBy(candidates, d -> distance(d.location, (lat, lng)))[:need]
```

Talab va taklif xaritasi:

```text
everyMinute():
    demand = countBy(rideRequests.lastMinutes(5), r -> latLngToCell(r.lat, r.lng, 8))
    supply = countBy(idleDrivers(),               d -> latLngToCell(d.lat, d.lng, 8))
    for cell in demand.keys: ratio[cell] = demand[cell] / max(supply[cell], 1)
```

Hujjat maslahati: aniq chegara kerak bo'lganda grid — **optimallashtirish**, uning ustidan aniq "nuqta poligon ichidami" tekshiruvi qilinadi.

## Framework'larda

| Vazifa | Vosita |
| --- | --- |
| Gridga indekslash, qo'shnilar, ierarxiya | H3 (C kutubxona; Java, JavaScript, Python va boshqa bog'lamalar) |
| Radius bo'yicha yaqin nuqtalar | Redis `GEOADD` / `GEOSEARCH` |
| Real vaqtda joylashuv oqimi | 64-bob |
| Katak kaliti bo'yicha kesh va shard | 25-, 95-boblar |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Olti burchakli grid | Bir xil qo'shni masofasi, doiraga yaqin halqalar | Ota-bola tegishliligi geometrik jihatdan taxminiy |
| Mayda daraja (9+) | Aniq joylashuv | Kataklar ko'p, siyrak ma'lumot; disk katta bo'ladi |
| Yirik daraja (7) | Ko'p hodisa bitta katakda — barqaror statistika | Shahar ichidagi farqlar yo'qoladi |
| Grid zonalar o'rniga | Barqaror, shaharlar o'rtasida taqqoslanadi | Ko'cha va mahallalarga mos kelmaydi — klasterlash kerak |
| Redis GEO | Tayyor radius qidiruvi | Agregatsiya va ierarxiya yo'q |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Har so'rovda barcha haydovchilar bilan masofa hisoblash | O(N) — shahar kattalashgani sari sekinlashadi | Grid yoki geo indeks bilan oldindan filtrlash |
| Katakni aniq chegara deb olish | Bola kataklar ota ichida taxminiy | Kerak bo'lsa aniq poligon tekshiruvi (H3 hujjati) |
| Barcha kataklarni bir xil maydonli deb hisoblash | Maydon joyga qarab o'zgaradi (Toshkent: 0.126 vs o'rtacha 0.105) | `cellArea` bilan hisoblash |
| Bitta darajani hamma vazifaga ishlatish | Dispatch va narx tahlili turli aniqlik talab qiladi | Vazifaga mos daraja, ierarxiya orqali bog'lash |
| Pochta yoki qo'lda chizilgan zonalar | Shakli g'alati, o'zgaruvchan (Uber blog) | Global grid |

## Amaliyot

1. H3 kutubxonasini o'rnating (`pip install h3`) va yuqoridagi misolni o'z shahringiz koordinatalari bilan ishga tushiring. Katak maydoni o'rtachadan qancha farq qiladi?
2. Shahringizda bitta "Toshkent markazi" katagi 7-darajada qancha maydonni qoplaydi? Taksi narxini hisoblash uchun qaysi daraja mos?
3. `findNearby` psevdokodini yozing va `K_MAX` cheklanmasa nima bo'lishini o'ylang (chekkadagi bo'sh hududlar).
4. Joylashuv har 4 soniyada keladi, haydovchilar 50 000 ta — sekundiga nechta yozuv? (90-bob uslubida hisoblang.)
5. Kataklar bo'yicha shard qilsangiz, mashhur hudud (aeroport) "issiq" shard bo'lib qolmaydimi (95-bob)?

## Manbalar

- Uber Engineering — *H3: Uber's Hexagonal Hierarchical Spatial Index* (2018-06-27; Internet Archive nusxasi): <https://web.archive.org/web/2024/https://www.uber.com/en-US/blog/h3/>
- H3 — *Introduction*: <https://h3geo.org/docs/>
- H3 — *Aggregation*: <https://h3geo.org/docs/highlights/aggregation>
- H3 — *Indexing*: <https://h3geo.org/docs/highlights/indexing>
- H3 — *Tables of Cell Statistics Across Resolutions*: <https://h3geo.org/docs/core-library/restable>
- H3 — *Grid traversal functions* (`gridDisk`, `gridDistance`): <https://h3geo.org/docs/api/traversal>
- Redis — *Redis geospatial*: <https://redis.io/docs/latest/develop/data-types/geospatial/>
