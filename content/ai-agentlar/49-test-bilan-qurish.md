# 49 — Funksiyani test bilan qurish

[Mundarija](README.md)

## Tushuncha

48-bobda reja, qarorlar va `CLAUDE.md` tayyor bo'ldi. Endi kod. Bu bobning asosiy savoli 8-bobdagi bilan bir xil: **agent ishi
to'g'riligini nima bilan tekshiradi?**

CC (Best practices — Give Claude a check to run): agent "tayyor" deb, aslida to'liq bo'lmasa, odatda sababi — o'z ishini tekshirish yo'li
yo'q edi. Tekshiruv — test, kutilgan natija, skrinshot. Bu bobda uch qatlam ishlatiladi:

| Qatlam | Kim ishga tushiradi | Nimani ushlaydi |
| --- | --- | --- |
| Avval yozilgan testlar (`npm test`) | Agent, har qadamda | Kelishilgan xatti-harakatdan og'ish |
| Yashirin tekshiruv | Siz, agentdan alohida | Agent testlari qamramagan holatlar |
| Haqiqiy muhit (brauzer, telefon kengligi) | Siz yoki brauzer tool'i bor agent | Test muhiti va haqiqiy muhit farqi |

### Avval test, keyin kod

Tartib: agent avval faqat testlarni yozadi va ular **yiqilishini** ko'rsatadi, keyin kodni yozadi va testlar o'tishini ko'rsatadi.
Muhim qoida: "testlarni o'tkazish uchun testlarni o'zgartirma" — aks holda agent testni kodga moslab qo'yishi mumkin (11-bob).

## Amalda: 2-bosqich — hisob-kitob funksiyasi

48-bobdagi sessiyani davom ettirib (`--resume`):

```text
2-bosqich: hisob-kitob funksiyasi. Tartib:
1. Avval faqat testlarni yoz (test/installments.test.js) va npm test bilan ular yiqilishini ko'rsat.
2. Keyin src/installments.js ni yoz va testlar o'tishini ko'rsat.
Testlarni o'tkazish uchun testlarni o'zgartirma. Commit qil va to'xta.
```

Tool chaqiruvlari:

```text
Write  test/installments.test.js
Bash   npm test   → ℹ tests 1  ℹ pass 0  ℹ fail 1
Write  src/installments.js
Bash   npm test   → ℹ tests 32  ℹ pass 32  ℹ fail 0
Bash   git commit
```

Agent yozgan funksiya:

```js
export function split(amount, months) {
  if (!Number.isSafeInteger(amount)) {
    throw new TypeError('amount xavfsiz butun son bo\'lishi kerak');
  }
  if (!Number.isSafeInteger(months)) {
    throw new TypeError('months xavfsiz butun son bo\'lishi kerak');
  }
  if (amount < 0) {
    throw new RangeError('amount manfiy bo\'lmasligi kerak');
  }
  if (months < 1) {
    throw new RangeError('months kamida 1 bo\'lishi kerak');
  }

  const base = Math.floor(amount / months);
  const remainder = amount % months;

  return Array.from({ length: months }, (_, i) => (i < remainder ? base + 1 : base));
}
```

Ikki narsaga e'tibor bering.

**"Qizil" bosqich zaif edi.** Birinchi `npm test` — `1 fail`, lekin sababi `ERR_MODULE_NOT_FOUND`: modul hali yo'q. Bu testlar
**to'g'ri narsani** tekshirayotganini isbotlamaydi — faqat fayl yo'qligini. Kuchliroq usul: avval bo'sh funksiya (`return []`) yozdirib,
testlar **tasdiq** (assertion) bo'yicha yiqilishini ko'rish. Keyingi bosqichlarda ham agent shu yo'ldan bordi (`ERR_MODULE_NOT_FOUND`
bilan yiqilish), demak buni so'rovda aniq aytish kerak edi.

**Yashirin tekshiruv.** Agent ko'rmagan skript — 1–3000 so'm (7 qadam) va 1–13 oy: yig'indi, farq ≤ 1 va "ortiqcha so'm birinchi
oylarda" sharti:

```text
{"tekshirildi":"summa 1..3000 (7 qadam) x oy 1..13","xato":0}
```

## 3–4-bosqichlar: validatsiya va HTTP server

```text
3 va 4-bosqichlar: validatsiya va HTTP server (API, /healthz, statik fayllar uchun oq ro'yxat). Har bosqichda avval testlar, keyin kod.
API testlari serverni port 0 da ko'tarsin. Har bosqichdan keyin alohida commit. Oxirida serverni ishga tushirib, curl bilan bitta to'g'ri
va bitta noto'g'ri so'rov natijasini ko'rsat, keyin serverni to'xtat. CLAUDE.md dagi npm start qatorini yangila.
```

Testlar soni: 32 → 76 (validatsiya) → 137 (server). Agent ko'rsatgan `curl` natijalari:

```text
HTTP/1.1 200 OK
{"amount":1000,"months":3,"payments":[{"month":1,"amount":334},{"month":2,"amount":333},{"month":3,"amount":333}]}

HTTP/1.1 400 Bad Request
{"error":{"code":"VALIDATION_ERROR","message":"Kiritilgan ma'lumotlar noto'g'ri","details":[
  {"field":"amount","message":"Summa son bo'lishi kerak (masalan, 1000)"},
  {"field":"months","message":"Oylar soni 1 dan 120 gacha bo'lishi kerak"}]}}
```

Sessiyada ruxsat to'siqlari ham ko'rindi: `PORT=3917 npm start` — "This command requires approval" (faqat `npm *` ruxsat etilgan,
muhit o'zgaruvchisi bilan boshlangan buyruq mos kelmadi); fon jarayoni va o'zgaruvchili skript — "A variable in this command can't be
checked before it runs". Agent to'xtamadi: serverni Node skripti ichidan (`spawn`) ishga tushirib, xuddi shu tekshiruvni qildi
(46-bobdagi "rad etilsa — boshqa yo'l").

Agent so'ralmagan, lekin rejada aytilgan xavfsizlik ishlarini ham qildi: URL hech qachon fayl yo'liga aylantirilmaydi
(`/../package.json` → 404, testlar bilan), server `Content-Security-Policy` sarlavhasini qaytaradi.

## 5-bosqich: veb-sahifa va brauzerda tekshirish

```text
5-bosqich: frontend (public/index.html, app.js, style.css). Forma: summa va oylar; natija jadvali va Jami qatori; xatolar tegishli
maydon yonida; summalar uz-UZ formatida; 360 px telefon kengligida ham to'g'ri ko'rinsin. Oq ro'yxatga yangi fayllarni qo'sh va
API testlari bilan tekshir. Commit qil va to'xta.
```

Agent 168 ta test bilan tugatdi, lekin ochiq aytdi: "Sahifani haqiqiy brauzerda, 360 px kenglikda ochib ko'ra olmadim: bu muhitda
brauzer ishga tushirishga ruxsat yo'q. Telefonda bir marta ochib ko'rishingizni so'rayman."

Sahifa brauzerda 360 px kenglikda ochildi (23-bobdagi kabi brauzer tool'i bilan). Joylashuv to'g'ri — `scrollWidth` 345 px, gorizontal
aylantirish yo'q. Lekin jadvalda:

```text
1-oy    142,858 so'm
Jami  1,000,000 so'm
```

Vergul — ingliz formati. Sababi:

```js
// Chrome 157
new Intl.NumberFormat('uz-UZ').format(1000000)   // "1,000,000"
// Node 26
new Intl.NumberFormat('uz-UZ').format(1000000)   // "1 000 000" (NBSP bilan)
```

Ikkalasi ham `uz-UZ` lokalini "qo'llab-quvvatlaydi" (`supportedLocalesOf` → `["uz-UZ"]`), lekin formatlash ma'lumoti turlicha.
Agentning testlari Node'da ishlagan va o'tgan — **test muhiti haqiqiy muhitdan farq qilgan**.

Agentga topilmani aynan shu faktlar bilan berdik:

```text
Brauzerda tekshirdim (Chrome 157, 360 px). Joylashuv to'g'ri, gorizontal aylantirish yo'q. Lekin summalar "142,858 so'm" ko'rinishida
chiqyapti: Chrome'da new Intl.NumberFormat('uz-UZ').format(1000000) → "1,000,000", Node'da esa "1 000 000" (NBSP). Ya'ni Node testlari
brauzerdagi natijani kafolatlamaydi. Formatlashni muhitga bog'liq bo'lmaydigan qil (guruhlar NBSP bilan) va bunga test qo'sh. Commit qil.
```

Agent javobidan:

```text
Nima uchun eski testlar xatoni ushlamagan: ular guruh ajratuvchisini oddiy bo'shliqqa almashtirib, keyin solishtirardi.
Undan tashqari faqat Node'ning Intl i ishlatilardi.
...
Chrome kabi muhit. Test Intl.NumberFormat va toLocaleString ni "1,000,000" qaytaradigan qilib almashtiradi va lib.js ni qaytadan
yuklaydi. Natija baribir NBSP bilan chiqishi kerak.
```

Ya'ni eski test xatoni ikki sabab bilan o'tkazib yuborgan: ajratuvchini "normallashtirib" solishtirgan va faqat Node muhitida ishlagan.
Yangi test Chrome xatti-harakatini taqlid qiladi — tuzatishdan oldin u yiqilgan. Brauzerda qayta tekshiruv:

```text
1-oy    142 858 so'm
Jami  1 000 000 so'm
2 so'm / 3 oy → "Summa oylar sonidan kam bo'lmasligi kerak (har oyga kamida 1 so'm)"  (maydon ostida, qizil hoshiya bilan)
```

179 ta test, hammasi o'tadi.

## Narx va sessiya uzunligi

Bitta sessiya `--resume` bilan davom ettirildi. `total_cost_usd` yig'ma — har bosqich farqi:

| Bosqich | Navbatlar | Narx |
| --- | --- | --- |
| 2. Hisob-kitob (testlar + kod) | 6 | $0.23 |
| 3–4. Validatsiya va server | 23 | $0.89 |
| 5. Veb-sahifa | 18 | $0.74 |
| Formatlash tuzatishi | 13 | $0.42 |
| **Jami (48-bob bilan)** | | **$2.77** |

Har keyingi bosqichda butun oldingi tarix qayta yuboriladi (41-bob). Bosqichlar orasida tarixdan kerakli narsa — reja va qarorlar — endi
`CLAUDE.md` da. Shuning uchun keyingi bobda yangi, toza sessiya bilan davom etamiz.

## Variantlar

| Usul | Qachon | Trade-off |
| --- | --- | --- |
| Avval test, keyin kod (shu bob) | Talab aniq, natija tekshiriladigan | Ishonchli; qizil bosqichni tasdiq bilan ko'rsatish kerak |
| Kod, keyin test | Prototip, natija hali noaniq | Tez; testlar kodga moslashib qolishi mumkin |
| Yashirin tekshiruv | Muhim mantiq (pul, ruxsatlar) | Agentdan mustaqil; siz yozasiz |
| Brauzer tool'i bilan agent o'zi tekshiradi | Frontend ko'p | Agent tuzatish siklini o'zi yopadi (23-bob); ruxsat kerak |
| Inson brauzerda tekshiradi | `-p`, brauzer tool'i yo'q | Oddiy; har o'zgarishda qo'lda |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| "Qizil" bosqichni modul yo'qligi bilan qabul qilish | Testlar to'g'ri narsani tekshirishini isbotlamaydi | Bo'sh funksiya bilan tasdiq bo'yicha yiqilish |
| Faqat agent testlariga ishonish | Agent testi uning tushunchasini tekshiradi | Yashirin tekshiruv |
| Node testlari o'tdi — brauzerda ham ishlaydi | Tajribada `Intl` formatlash farq qildi | Haqiqiy muhitda tekshirish |
| Testda natijani "normallashtirib" solishtirish | Xato aynan normallashtirilgan joyda yashirindi | Aniq kutilgan satr bilan solishtirish |
| Bitta sessiyada barcha bosqichlar | Har bosqich qimmatlashadi | Qarorlar CLAUDE.md'da, keyin yangi sessiya |
| Topilmani "ishlamayapti" deb berish | Agent qayta izlaydi | Aniq kuzatuv: nima, qayerda, qanday takrorlanadi |

## Amaliyot

1. Bu bobda qaysi uch tekshiruv qatlami ishlatildi?
2. Nega 2-bosqichdagi "qizil" bosqich zaif edi va qanday kuchaytirish mumkin?
3. Agentga ruxsat berilmagan buyruq rad etilganda u nima qildi?
4. Brauzerda qanday xato topildi va nega agent testlari uni ushlamagan?
5. Topilmani agentga qanday berish samarali?
6. Nega keyingi bosqichni yangi sessiyada boshlash yaxshiroq?

<details>
<summary>Javoblar</summary>

1. Avval yozilgan testlar (agent ishga tushiradi), yashirin tekshiruv (agentdan alohida), haqiqiy muhit (brauzer, 360 px).
2. Testlar faqat modul yo'qligi (`ERR_MODULE_NOT_FOUND`) sababli yiqildi — tasdiqlar tekshirilmadi. Avval bo'sh funksiya yozdirib, testlar tasdiq bo'yicha yiqilishini ko'rish kerak.
3. To'xtamadi: serverni Node skripti ichidan (`spawn`) ishga tushirib, o'sha tekshiruvni boshqa yo'l bilan qildi.
4. Chrome'da `uz-UZ` formati vergul bilan chiqdi, Node'da NBSP bilan. Testlar faqat Node'da ishlagan va ajratuvchini normallashtirib solishtirgan.
5. Aniq faktlar bilan: qayerda (Chrome 157, 360 px), nima ko'rindi, takrorlash usuli (ikki muhitdagi `Intl` natijasi), kutilgan natija.
6. Har bosqichda butun tarix qayta yuboriladi va narx oshadi; kerakli qarorlar allaqachon CLAUDE.md'da.

</details>

## Rasmiy hujjat

- [CC: Best practices — Give Claude a check to run](https://code.claude.com/docs/en/best-practices)
- [CC: Common workflows](https://code.claude.com/docs/en/common-workflows)
- [CC: Manage costs — Why usage climbs in a long session](https://code.claude.com/docs/en/costs)
