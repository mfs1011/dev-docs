# 02 — Asosiy tushunchalar

[Mundarija](README.md)

## Tushuncha

Bu bob kitob davomida ishlatiladigan atamalarni KD (Introduction, API) bo'yicha jamlaydi.

### Hodisa tarkibi

| Qism | Ma'nosi |
| --- | --- |
| **Kalit** (key) | Hodisa kimga yoki nimaga tegishli: mijoz, mashina ID'si. Qaysi partition'ga tushishini belgilaydi |
| **Qiymat** (value) | Hodisaning o'zi — nima bo'lgani |
| **Vaqt belgisi** (timestamp) | Qachon bo'lgani |
| **Sarlavhalar** (headers) | Ixtiyoriy qo'shimcha metama'lumot |

### Producer va consumer

- **Producer** — Kafka'ga hodisa **yozadigan** (publish) klient ilova.
- **Consumer** — hodisalarga obuna bo'lib, ularni **o'qiydigan** va qayta ishlaydigan klient ilova.

KD: producer va consumer bir-biridan **to'liq ajratilgan** va bir-birini bilmaydi. Bu — Kafka'ning yuqori kengayuvchanligi asosidagi muhim dizayn qarori. Masalan, producer hech qachon consumer'larni kutmaydi.

### Topic

**Topic** — hodisalar tartiblangan va ishonchli saqlanadigan joy. KD o'xshatishi: topic — fayl tizimidagi papka, hodisalar — undagi fayllar. Misol nomi: `payments`.

- Topic doim **ko'p yozuvchi va ko'p o'quvchili**: unga nol, bir yoki ko'p producer yozadi va nol, bir yoki ko'p consumer obuna bo'ladi.
- Hodisalarni istalgancha qayta o'qish mumkin — o'qilgandan keyin o'chirilmaydi. Har topic uchun saqlash muddati belgilanadi, keyin eski hodisalar tashlanadi.

### Partition

Topic **partition**'larga bo'lingan — turli broker'larda joylashgan "bo'laklar". Bu kengayish uchun juda muhim: klientlar ko'p broker'dan bir vaqtda o'qiydi va yozadi.

- Yangi hodisa topic partition'laridan biriga **oxiriga qo'shiladi** (append).
- **Bir xil kalitli** hodisalar (masalan, bitta mijoz) **bir xil partition**'ga yoziladi.
- Kafka kafolati: topic-partition'ni o'qiydigan har consumer uning hodisalarini **aynan yozilgan tartibda** o'qiydi.

```text
topic: payments
  partition 0:  [h0][h1][h2][h3] ← yangi hodisa oxiriga
  partition 1:  [h0][h1]
  partition 2:  [h0][h1][h2]
```

### Replika

Ma'lumot nosozlikka chidamli bo'lishi uchun har topic **nusxalanishi** mumkin — hatto turli hududlar yoki ma'lumot markazlari orasida. Shunda ma'lumotning bir nechta broker'da nusxasi bo'ladi: muammo chiqqanda yoki broker'lar ta'mirlanayotganda ham. KD: production'da keng tarqalgan sozlama — **replication factor 3**, ya'ni ma'lumotning doim uchta nusxasi. Nusxalash topic-partition darajasida bajariladi (20-bob).

### Broker va klaster

KD: Kafka — yuqori unumdorli TCP tarmoq protokoli orqali bog'lanadigan **serverlar** va **klientlar**dan iborat taqsimlangan tizim.

- **Klaster** — bir yoki bir nechta server. Ular bir nechta ma'lumot markazi yoki bulut hududiga tarqalishi mumkin.
- **Broker** — klasterning saqlash qatlamini tashkil qiluvchi serverlar.
- Boshqa serverlar **Kafka Connect** ishlatadi — bazalar va boshqa klasterlar bilan ma'lumotni hodisa oqimi sifatida import va eksport qiladi (25-bob).
- Serverlardan biri ishdan chiqsa, qolganlari uning ishini oladi — ish to'xtamaydi, ma'lumot yo'qolmaydi.

### Klientlar

Klientlar hodisalarni parallel, kengayuvchan va nosozlikka chidamli tarzda o'qiydi, yozadi va qayta ishlaydi. KD (API): Kafka barcha imkoniyatlarini **tilga bog'liq bo'lmagan protokol** orqali beradi, ko'p tillarda klientlar bor. Lekin Kafka loyihasining o'zi faqat **Java** klientlarini yuritadi, qolganlari mustaqil ochiq loyihalar. Shuning uchun bu kitobdagi kod misollari Java'da.

### Kafka API'lari (KD: API)

| API | Vazifasi | Bob |
| --- | --- | --- |
| **Producer** | Topic'larga ma'lumot oqimini yuborish | 10–13 |
| **Consumer** | Topic'lardan ma'lumot oqimini o'qish | 14–18 |
| **Share Consumer** | Share group ichida ma'lumotni birgalikda o'qish va qayta ishlash | 19 |
| **Streams** | Kirish topic'laridagi oqimni o'zgartirib, chiqish topic'lariga yozish | 27–28 |
| **Connect** | Tashqi tizimdan Kafka'ga doimiy olish va Kafka'dan tashqi tizimga yozish (connector'lar) | 25–26 |
| **Admin** | Topic, broker, ACL va boshqa obyektlarni boshqarish va ko'rish | 5, 31 |

Producer, Consumer, Share Consumer va Admin — `kafka-clients` kutubxonasida, Streams — `kafka-streams` da (4.4.0).

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Butun topic bo'yicha tartib kutish | Tartib faqat partition ichida (KD) | Tartib kerak hodisalarga bir xil kalit |
| Kalitni e'tiborsiz qoldirish | Bir obyektning hodisalari turli partition'larga tarqalib, tartibi yo'qoladi | Mazmunli kalit (mijoz ID'si) |
| Producer consumer'ni kutadi deb o'ylash | Ular to'liq ajratilgan (KD) | Mustaqil kengaytirish |
| Bitta nusxa (replication factor 1) bilan production | Broker ishdan chiqsa ma'lumot yo'qoladi | Odatda 3 (KD) |

## Amaliyot

1. Hodisa qanday to'rt qismdan iborat?
2. Topic va partition farqi nima?
3. Bir xil kalitli hodisalar qayerga yoziladi va bu nima beradi?
4. Production'da odatiy replication factor qancha?
5. Kafka qaysi tildagi klientlarni o'zi yuritadi?

<details>
<summary>Javoblar</summary>

1. Kalit, qiymat, vaqt belgisi, sarlavhalar.
2. Topic — hodisalar to'plami (papka); partition — topic'ning turli broker'lardagi bo'lagi.
3. Bir xil partition'ga; o'sha partition consumer'i ularni yozilgan tartibda o'qiydi.
4. 3.
5. Java.

</details>

## Rasmiy hujjat

- [KD: Introduction](https://kafka.apache.org/44/getting-started/introduction/) — Main Concepts and Terminology
- [KD: API](https://kafka.apache.org/44/apis/)
