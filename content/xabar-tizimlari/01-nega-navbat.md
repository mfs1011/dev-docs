# 01 — Nega navbat

[Mundarija](README.md)

## Tushuncha

Foydalanuvchi buyurtma beradi. Server tasdiq xatini yuborishi, to'lovni tekshirishi, rasmni kichraytirishi kerak. Bularning hammasini **so'rovning ichida** bajarsa, foydalanuvchi har biri tugaguncha kutadi. Bitta tashqi xizmat sekinlashsa, sahifa ham sekinlashadi.

Navbat bilan boshqacha: server ishni **xabar** (message) qilib **navbatga** (queue) qo'yadi va foydalanuvchiga darhol javob beradi. Ishni fonda turgan alohida jarayon — **ishchi** (worker) navbatdan olib, keyinroq bajaradi.

```text
Navbatsiz:   so'rov ──▶ [xat + to'lov + rasm] ──▶ javob        (hammasini kutadi)
Navbat bilan: so'rov ──▶ navbatga xabar ──▶ javob                (darhol)
                              │
                              └──▶ ishchi ──▶ xat, to'lov, rasm  (fonda)
```

### Uch asbob nima deydi

**RabbitMQ** (RT 2. Work Queues): ish navbati (task queue)ning asosiy g'oyasi — resurs talab qiladigan ishni **darhol bajarmaslik** va tugashini kutmaslik. Ish keyinga rejalashtiriladi: u xabar qilib navbatga yuboriladi, fonda ishlayotgan ishchi jarayon uni olib bajaradi. Ishchilar ko'p bo'lsa, ishlar ular orasida taqsimlanadi. Bu ayniqsa **veb-ilovalarda** foydali — murakkab ishni qisqa HTTP so'rovi ichida bajarib bo'lmaydi.

**Redis** (RD Job queue): fon ishlari — xat yuborish, to'lov, rasmga ishlov, ML xulosasi, webhook'lar — foydalanuvchi so'rovi yo'lidan chiqariladi va ishchilar orasida ishonchli taqsimlanadi. Sahifa bunday holatlarni ham sanab o'tadi:

- fon ishini sinxron bajarish so'rovlarni to'sib qo'yadi, yuklama ostida kechikish oshadi;
- bitta harakat bir nechta keyingi ishni chaqiradi (xat, analitika, hisob-kitob). Umumiy navbatsiz har xizmat boshqasiga to'g'ridan-to'g'ri ulanadi va bu kattalashganda mo'rt bo'ladi;
- jarayon ichidagi oddiy navbat qulaganda ishlarni yo'qotadi va ularni bir nechta ishchiga bo'la olmaydi;
- bazani "kutayotgan qator bormi" deb so'rab turish (polling) asosiy bazaga doimiy yuklama beradi va ishchilar bir qatorni talashadi.

**Kafka** (KD Use Cases → Messaging): xabar brokerlari turli sabablarga ko'ra ishlatiladi — ma'lumotni **ishlovdan ajratish** (decouple) uchun, **ishlanmagan xabarlarni bufer**da saqlash uchun va hokazo. Bu sohada Kafka ActiveMQ yoki RabbitMQ kabi an'anaviy tizimlar bilan solishtiriladi.

### Navbat nima beradi

| Foyda | Ma'nosi | Manba |
| --- | --- | --- |
| **Kuttirmaslik** | Og'ir ish so'rovdan tashqarida bajariladi, javob tez | RT 2, RD |
| **Ajratish** (decoupling) | Yuboruvchi qabul qiluvchini bilmaydi, faqat navbatni biladi; biri o'zgarsa, boshqasi o'zgarmaydi | KD, RD |
| **Bufer** | Ishchilar ulgurmasa yoki to'xtab qolsa, xabarlar navbatda kutib turadi | KD |
| **Taqsimlash** | Bir nechta ishchi ishni bo'lib oladi; yuklama oshsa — ishchi qo'shiladi | RT 2, RD |
| **Qayta urinish** | Ishchi qulasa, ish yo'qolmay boshqasiga beriladi (tasdiq — 5-bob) | RD |

### Bepul emas

RD sahifasi ham aytadi: alohida xabar brokerini (RabbitMQ, Kafka, SQS) qo'shish — **yana bitta infratuzilma**: uni joylash, kuzatish va unga pul to'lash kerak. Navbat qo'shilganda yangi savollar paydo bo'ladi:

- xabar yo'qolmasligini kim kafolatlaydi (4–6, 13-boblar);
- bitta xabar ikki marta kelsa nima bo'ladi (7-bob);
- tartib saqlanadimi (8-bob);
- ishlab bo'lmaydigan xabar bilan nima qilinadi (9-bob).

Bu kitob shu savollarni uch asbobda ko'rib chiqadi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Og'ir ishni HTTP so'rovi ichida bajarish | Foydalanuvchi kutadi, tashqi xizmat sekinlashsa sahifa ham sekinlashadi (RT 2, RD) | Navbat + ishchi |
| Jarayon ichidagi oddiy massivni navbat qilish | Qulaganda ishlar yo'qoladi, bir nechta ishchiga bo'linmaydi (RD) | Tashqi navbat |
| Bazani "yangi ish bormi" deb so'rab turish | Doimiy yuklama, ishchilar bir qatorni talashadi (RD) | Navbat |
| Navbat qo'shdim — hammasi ishonchli deb o'ylash | Yo'qolish, takror va tartib — alohida masalalar | 4–9-boblar |

## Amaliyot

1. Ish navbatining asosiy g'oyasi nima (RT)?
2. Navbat beradigan to'rt foydani ayting.
3. Nega jarayon ichidagi oddiy navbat yetarli emas?
4. Alohida broker qo'shishning narxi nima?

<details>
<summary>Javoblar</summary>

1. Og'ir ishni darhol bajarmaslik: uni xabar qilib navbatga qo'yish, fondagi ishchi keyin bajaradi.
2. Kuttirmaslik, ajratish, bufer, taqsimlash (va qayta urinish).
3. Jarayon qulasa ishlar yo'qoladi va ularni bir nechta ishchiga bo'lib bo'lmaydi.
4. Yana bitta infratuzilma: joylash, kuzatish, xarajat.

</details>

## Rasmiy hujjat

- [RT: 2. Work Queues](https://www.rabbitmq.com/tutorials/tutorial-two-javascript)
- [KD: Use Cases → Messaging](https://kafka.apache.org/44/getting-started/uses/)
- [RD: Redis job queue](https://redis.io/docs/latest/develop/use-cases/job-queue/)
