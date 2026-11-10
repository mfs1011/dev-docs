# 01 — Hodisalar oqimi nima

[Mundarija](README.md)

## Tushuncha

### Hodisa

KD (Introduction): **hodisa** (event) — dunyoda yoki biznesingizda "nimadir **bo'ldi**" degan faktni qayd etadigan yozuv. Hujjatda u **record** yoki **message** deb ham ataladi. Kafka'ga ma'lumot yozish va undan o'qish — hodisalar shaklida bo'ladi.

Misol (KD):

| Qism | Qiymat |
| --- | --- |
| Kalit (key) | "Alice" |
| Qiymat (value) | "Bob'ga 200 $ to'lov qildi" |
| Vaqt belgisi (timestamp) | "2020-yil 25-iyun, 14:06" |

Hodisa holatni emas, **o'zgarishni** yozadi: "Alice hisobida 800 $" emas, "Alice 200 $ to'ladi".

### Hodisalar oqimi

KD: texnik jihatdan **hodisalar oqimi** (event streaming) to'rt ishdan iborat:

1. Ma'lumotni manbalardan — bazalar, sensorlar, mobil qurilmalar, bulut xizmatlari, ilovalar — **real vaqtda** hodisalar oqimi sifatida yig'ish;
2. bu oqimlarni keyin o'qish uchun **ishonchli saqlash**;
3. oqimni real vaqtda va **orqaga qaytib** ham qayta ishlash va unga javob berish;
4. oqimlarni kerakli boshqa tizimlarga yo'naltirish.

Natija: ma'lumot to'xtovsiz oqadi va kerakli ma'lumot kerakli joyga kerakli vaqtda yetadi.

### Kafka — hodisalar oqimi platformasi (KD)

Kafka uchta asosiy imkoniyatni birlashtiradi:

| Imkoniyat | Ma'nosi |
| --- | --- |
| Yozish va obuna bo'lish | Hodisalar oqimini yozish (publish) va o'qish (subscribe), boshqa tizimlardan doimiy import/eksport ham |
| Saqlash | Oqimlarni **xohlagancha** uzoq, ishonchli saqlash |
| Qayta ishlash | Oqimni hodisa sodir bo'lgan zahoti yoki keyinroq qayta ishlash |

Bularning hammasi taqsimlangan, kengayadigan, nosozlikka chidamli va xavfsiz tarzda bajariladi. Kafka oddiy serverda, virtual mashinada, konteynerda, o'z serveringizda yoki bulutda ishlaydi.

### Qayerda ishlatiladi (KD Use Cases)

| Holat | KD izohi |
| --- | --- |
| **Xabar almashish** (messaging) | An'anaviy xabar brokerlari o'rnini bosadi: ishlovni ma'lumot manbaidan ajratish, ishlanmagan xabarlarni buferlash. O'tkazuvchanligi yuqori, partition'lash o'rnatilgan, nusxalanadi, nosozlikka chidamli. Bu sohada ActiveMQ va RabbitMQ bilan solishtiriladi |
| **Sayt faolligini kuzatish** | Kafka'ning **dastlabki** vazifasi: sahifa ko'rishlari, qidiruvlar va boshqa harakatlar — har tur uchun alohida topic. Hajmi juda katta: har sahifa ko'rishda ko'p hodisa |
| **Metrikalar** | Taqsimlangan ilovalarning statistikasini markaziy oqimga yig'ish |
| **Log yig'ish** | Fayllar tafsilotini yashirib, loglarni xabarlar oqimi sifatida beradi: kechikish kamroq, ko'p manba va ko'p o'quvchi oson |
| **Oqimni qayta ishlash** | Ko'p bosqichli quvur: masalan, maqolalar `articles` topic'iga yoziladi, keyingi bosqich ularni tozalab yangi topic'ga yozadi, oxirgisi foydalanuvchiga tavsiya qiladi |
| **Event sourcing** | Holat o'zgarishlari vaqt bo'yicha tartiblangan yozuvlar ketma-ketligi sifatida saqlanadi. Kafka juda katta jurnalni saqlay olgani uchun bunga mos |
| **Commit log** | Taqsimlangan tizim uchun tashqi jurnal: tugunlar orasida ma'lumotni nusxalash, ishdan chiqqan tugunni tiklash. **Log compaction** (9-bob) shunga yordam beradi |

### Navbatdan farqi

Oddiy navbatda o'qilgan xabar o'chadi. KD: Kafka topic'idagi hodisalarni **istalgancha qayta o'qish** mumkin — ular o'qilgandan keyin o'chirilmaydi, topic sozlamasida belgilangan muddat saqlanadi. Kafka'ning unumdorligi saqlanayotgan ma'lumot hajmiga deyarli bog'liq emas, shuning uchun uzoq saqlash muammo emas.

Navbat, pub/sub va jurnal modellari, RabbitMQ va Redis bilan taqqoslash — **"Xabar tizimlari"** kitobida.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Hodisaga holatni yozish ("balans 800") | Hodisa — bo'lgan fakt ("200 to'ladi") (KD) | O'zgarishni yozish |
| Kafka'ni o'qilgan xabar o'chadigan navbat deb tushunish | Hodisalar saqlash muddati tugaguncha qoladi (KD) | Saqlash muddatini rejalash (8-bob) |
| Kafka'ni faqat "katta ma'lumot" uchun deb o'ylash | Xabar almashish ham asosiy holatlardan biri (KD Use Cases) | Vazifaga qarab |

## Amaliyot

1. Hodisa nima va unda qanday qismlar bor?
2. Hodisalar oqimi qaysi to'rt ishdan iborat?
3. Kafka birlashtiradigan uchta imkoniyatni ayting.
4. Kafka'ning dastlabki vazifasi qaysi holat edi?
5. Kafka topic'idagi hodisa o'qilgandan keyin nima bo'ladi?

<details>
<summary>Javoblar</summary>

1. "Nimadir bo'ldi" degan yozuv: kalit, qiymat, vaqt belgisi (va ixtiyoriy header'lar).
2. Real vaqtda yig'ish, ishonchli saqlash, real vaqtda va keyinroq qayta ishlash, kerakli joyga yo'naltirish.
3. Yozish va obuna bo'lish, saqlash, qayta ishlash.
4. Sayt faolligini kuzatish.
5. O'chmaydi — saqlash muddati tugaguncha qoladi va qayta o'qilishi mumkin.

</details>

## Rasmiy hujjat

- [KD: Introduction](https://kafka.apache.org/44/getting-started/introduction/)
- [KD: Use Cases](https://kafka.apache.org/44/getting-started/uses/)
