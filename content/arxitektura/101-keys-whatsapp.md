# 101 — Keys: WhatsApp — millionlab ulanish

[← Oldingi: Keys: Twitter lentasi](100-keys-twitter.md) · [Mundarija](README.md) · [Keyingi: Keys: Uber — haydovchi topish →](102-keys-uber.md)

## Tushuncha

Twitter (100-bob) — **ko'p o'qiladigan** lenta. WhatsApp — boshqa turdagi yuk: **doimiy ochiq ulanishlar** va xabarni aniq kishiga (aniq qurilmaga) yetkazish. Bu yerda asosiy savollar: bitta server nechta ulanishni ushlab turadi? Qabul qiluvchi oflayn bo'lsa xabar qayerda turadi? Bir xabar bir nechta qurilmaga qanday boradi?

Manbalar — WhatsApp va Meta'ning o'z matnlari:

- WhatsApp blogi, "1 million is so 2011" (2012-yil yanvar) — bitta serverda 2 milliondan ortiq TCP ulanish;
- WhatsApp **Encryption Overview** texnik whitepaper'i (9-versiya, 2026-yil fevral) — transport, client-fanout, guruh xabarlari, media;
- Meta muhandislik blogi, "How WhatsApp enables multi-device capability" (2021);
- WhatsApp maxfiylik siyosati — yetkazilmagan xabarlar qancha saqlanadi;
- Erlang/OTP rasmiy hujjati — jarayonlar.

**Muhim chegara.** WhatsApp server arxitekturasining ichki tuzilishi (qaysi servislar, qanday baza, ulanish qaysi jarayonga bog'langan) rasmiy matnda batafsil yozilmagan. Bu haqda konferensiya chiqishlari (Erlang Factory) va ikkilamchi maqolalar bor, lekin ular matnli birlamchi manba bilan tekshirilmadi — bobda **fakt sifatida berilmaydi**.

### Bitta server — 2 million ulanish

2012-yil 6-yanvardagi postda WhatsApp muhandislari yozgan: bir necha oy oldin bitta mashinada **1 million** TCP ulanishga erishgan bo'lsalar, endi tizimni bemalol **2 million**dan oshirishadi. Postdagi haqiqiy chiqish:

```text
jkb@c123$ sysctl kern.ipc.numopensockets
kern.ipc.numopensockets: 2277845

CPU: 37.9% user, 0.0% nice, 13.6% system, 6.6% interrupt, 41.9% idle
Mem: 35G Active, 14G Inact, 18G Wired, 4K Cache, 9838M Buf, 27G Free
```

Post ta'kidlaydi: bu **barqaror** holat va CPU hamda xotirada hali **katta zaxira** bor (CPU ~42% bo'sh, 27 GB xotira bo'sh).

Uskuna va dasturiy ta'minot (post):

| Qatlam | Qiymat |
| --- | --- |
| Protsessor | Intel Xeon X5675 @ 3.07GHz, 24 yadro (`hw.ncpu: 24`) |
| Xotira | `hw.physmem: 103062118400` (~96 GiB) |
| OS | FreeBSD 8.2-STABLE amd64 |
| Runtime | Erlang R14B03, `smp:24:24` (24 scheduler) |

OS limitlari (`/boot/loader.conf.local` dan bir qismi):

```text
kern.ipc.maxsockets=2400000      # soketlar soni chegarasi
kern.maxfiles=3000000            # tizim bo'yicha ochiq fayllar
kern.maxfilesperproc=2700000     # bitta jarayon uchun
net.inet.tcp.tcbhashsize=524288  # TCP ulanishlar hash jadvali
```

Bu yerdagi saboq: millionlab ulanish uchun OS'ning **sukut bo'yicha** limitlari yetmaydi — har ulanish fayl deskriptori (ochiq fayl yoki soketni bildiruvchi raqam) talab qiladi, ular aniq sozlanadi. Bu Twitter'dagi kabi "ko'proq mashina" emas — **bitta mashinadan maksimum** olish yondashuvi (91-bobdagi vertikal va gorizontal masshtab muvozanati).

### Nega Erlang

Erlang/OTP rasmiy hujjati:

- "Erlang **ommaviy parallellik** uchun loyihalangan. Erlang jarayonlari **yengil** (dinamik o'sadi va kichrayadi), xotira izi kichik, yaratish va tugatish tez, rejalashtirish xarajati past."
- Efficiency Guide: yangi yaratilgan jarayon **327 so'z** (word) xotira ishlatadi, shundan 233 so'z — heap (stek bilan); keyin garbage collector kerak bo'lganda kattalashtiradi. 64 bitli tizimda so'z 8 bayt, ya'ni ~2,6 KB.
- System Limits: bir vaqtda tirik jarayonlar soni sukut bo'yicha **1 048 576**, ishga tushirishda `+P` bayrog'i bilan o'zgartiriladi.

Bu jarayonlar OS oqimlari emas — ular Erlang VM ichida yashaydi va bir nechta scheduler (postda 24 ta) ularni yadrolarga taqsimlaydi.

Taxminiy hisob (90-bob uslubida, WhatsApp'ning ichki tuzilishi haqida da'vo **emas**): agar har ulanish uchun bitta bo'sh Erlang jarayoni bo'lsa, 2 277 845 × 327 × 8 bayt ≈ **6 GB** — postdagi ~96 GiB xotirada bemalol sig'adi. Shuning uchun "har ulanishga bitta yengil jarayon" modeli bu masshtabda amalga oshirsa bo'ladigan narsa.

### Transport: uzoq yashaydigan ulanish

Whitepaper ("Transport Security"): klient va WhatsApp chat serverlari orasidagi aloqa **uzoq yashaydigan interaktiv ulanishlar** uchun Noise Protocol Framework'dagi **Noise Pipes** (Curve25519, AES-GCM, SHA256) bilan shifrlangan alohida kanal ichida boradi. Bu beradi:

1. juda tez va yengil ulanish o'rnatish va **qayta tiklash** (resume);
2. metama'lumotni tarmoq kuzatuvchisidan yashirish;
3. serverda klientning maxfiy autentifikatsiya kaliti saqlanmaydi — faqat ochiq kalit; foydalanuvchilar bazasi o'g'irlansa ham maxfiy ma'lumot chiqmaydi.

Mobil tarmoqda ulanish tez-tez uziladi — shuning uchun "tez qayta tiklash" asosiy talab (64-bob, real vaqt).

### Oflayn qabul qiluvchi: "saqla va yubor"

Maxfiylik siyosati:

- WhatsApp xabarlarni odatiy ishda **saqlamaydi** — ular qurilmada turadi; **yetkazilgandan keyin serverdan o'chiriladi**;
- qabul qiluvchi oflayn bo'lsa, xabar serverda **shifrlangan holda 30 kungacha** turadi va yetkazishga urinish davom etadi; 30 kundan keyin ham yetkazilmasa — o'chiriladi.

Ya'ni server — **doimiy arxiv emas, vaqtinchalik navbat** (26-bob). Bu "store-and-forward" (saqla va yubor) modeli.

### Bir xabar — ko'p qurilma: client-fanout

2021-yilgacha telefon yagona "haqiqat manbai" edi: veb va desktop telefon bilan doimiy ulanishni ushlab, uning ekranini aks ettirgan. Meta posti narxini ochiq yozadi: telefon tarmog'i yomon, batareyasi kam yoki OS ilovani o'ldirsa, qo'shimcha qurilmalar **sekin ishlaydi va tez-tez uziladi**; bir vaqtda faqat **bitta** qo'shimcha qurilma ishlay oladi.

Yangi arxitektura (post va whitepaper):

- har qurilmaning **o'z identifikatsiya kaliti** bor; server har akkaunt va uning barcha qurilmalari o'rtasidagi bog'lanishni saqlaydi;
- yuboruvchi klient xabarni **N marta**, N ta qurilmaga (yuboruvchi va qabul qiluvchining qurilmalari ro'yxati) yuboradi — har biri o'sha qurilma bilan juftlik sessiyasida alohida shifrlanadi. Bu **client-fanout**;
- telefondan tashqari **4 tagacha** qurilma, telefon o'chiq bo'lsa ham.

Bu 99-bobdagi fan-out — lekin **klient** tomonida: shifrlash uchun har qurilma kaliti kerak, u esa faqat klientda.

### Guruhlar: Sender Key va server-side fan-out

Whitepaper ("Group Messages"):

1. guruhga birinchi xabarda yuboruvchi **Sender Key** yaratadi va uni har a'zo qurilmaga juftlik sessiyasi orqali alohida yuboradi;
2. keyingi xabarlarda xabar **bir marta** shifrlanadi va **bitta** shifrlangan xabar serverga yuboriladi;
3. server uni barcha guruh a'zolariga tarqatadi — **server-side fan-out**;
4. a'zo guruhdan chiqsa, hamma Sender Key'ni tozalab, qaytadan boshlaydi.

### Media: alohida blob ombori

Whitepaper ("Transmitting Media and Other Attachments"): yuboruvchi ilovani shifrlab **blob store**'ga yuklaydi, so'ng qabul qiluvchilarga kalit, hash va blob'ga **ko'rsatkich** (pointer) bilan oddiy shifrlangan xabar yuboradi; qabul qiluvchi blob'ni yuklab, hash va MAC'ni tekshiradi va ochadi. Katta fayl xabar kanalidan o'tmaydi (32- va 63-boblar).

## Nega shunday

| Talab | Yechim (manba) | Bob |
| --- | --- | --- |
| Millionlab doimiy ulanish | Yengil Erlang jarayonlari, OS limitlarini sozlash (blog, Erlang hujjati) | 64, 91 |
| Mobil tarmoqda tez qayta ulanish | Noise Pipes — tez setup va resume (whitepaper) | 64 |
| Oflayn qabul qiluvchi | Serverda shifrlangan, 30 kungacha, yetkazilgach o'chiriladi (maxfiylik siyosati) | 26 |
| Ko'p qurilma, E2E shifrlash | Client-fanout, har qurilmaga alohida shifr (whitepaper, Meta) | 99 |
| Katta guruh | Sender Key + bitta xabar + server-side fan-out (whitepaper) | 99 |
| Katta fayllar | Shifrlangan blob store + ko'rsatkich (whitepaper) | 32 |

## Psevdokod: xabar yetkazish

Quyidagi — umumiy **store-and-forward** sxemasi (WhatsApp'ning ichki protokoli emas):

```text
onMessage(from, toDevice, msg):              // msg allaqachon klientda shifrlangan
    conn = connections.lookup(toDevice)
    if conn != null:
        conn.push(msg)                        // onlayn — darhol
    else:
        pending.add(toDevice, msg, ttl=30d)   // oflayn — vaqtinchalik navbat

onAck(toDevice, msgId):
    pending.remove(toDevice, msgId)           // yetkazildi — serverda qolmaydi

onConnect(device):
    connections.register(device, conn)
    for msg in pending.list(device):          // qayta ulanganda navbatni bo'shatish
        conn.push(msg)

// ack kelmasa, xabar qayta yuboriladi => klient takrorni msgId bo'yicha tashlaydi (70-bob)
```

Guruh uchun:

```text
// Sender Key allaqachon a'zolarga tarqatilgan
sendGroup(group, plaintext):
    ct = encryptWithSenderKey(plaintext)      // bir marta
    server.send(group.id, ct)                 // bitta xabar
// server: for device in group.devices: onMessage(..., device, ct)
```

## Framework'larda

| Vazifa | Qayerda |
| --- | --- |
| WebSocket, SSE, qayta ulanish | 64-bob |
| Navbat va qayta urinish | 26-bob |
| Idempotent qabul (takror xabar) | 70-bob |
| Media yuklash va saqlash | 32-, 63-boblar |
| Erlang jarayonlari va `+P` limiti | Erlang/OTP hujjati (Manbalar) |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Bitta serverda millionlab ulanish | Kam mashina, sodda topologiya | Bitta server tushsa, millionlab klient qayta ulanadi; OS va runtime chuqur sozlanadi |
| Serverda xabar saqlamaslik | Maxfiylik, kichik saqlash | Tarix serverdan tiklanmaydi — qurilmalar o'zaro sinxronlanadi (Meta posti) |
| Client-fanout | Server kalitlarni bilmaydi | Yuboruvchi N marta shifrlaydi va yuboradi — qurilmalar ko'pi bilan cheklangan |
| Guruhda Sender Key | Bitta xabar, server tarqatadi | A'zo chiqsa kalitlar qayta tarqatiladi |
| Telefon — yagona manba (eski) | Sodda sinxronlash | Qo'shimcha qurilmalar sekin, tez uziladi, bittadan ortiq emas |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| OS limitlarini sukut bo'yicha qoldirish | Fayl deskriptorlari tez tugaydi | `maxfiles`, `maxsockets` kabi limitlarni aniq sozlash (blog) |
| Har ulanishga og'ir OS oqimi | Xotira va kontekst almashinuvi | Yengil jarayonlar yoki event loop |
| Oflayn xabarni abadiy saqlash | Saqlash cheksiz o'sadi | TTL (WhatsApp: 30 kun) |
| Ack'siz yuborish | Uzilishda xabar yo'qoladi | Ack + qayta yuborish + idempotent qabul |
| Katta faylni xabar kanalidan yuborish | Ulanishni band qiladi | Blob store + ko'rsatkich |
| Bitta qurilmani yagona manba qilish | Uning nosozligi hammasini to'xtatadi | Har qurilma mustaqil (multi-device) |

## Amaliyot

1. Real vaqt servisingiz bitta serverda nechta ulanishni ushlaydi? Chegara qayerda: fayl deskriptorlari, xotira yoki CPU? `ulimit -n` ni tekshiring.
2. Foydalanuvchi oflayn bo'lsa, xabar/bildirishnoma qayerda va qancha turadi? TTL bormi?
3. Xabar ikki marta kelsa klient nima qiladi? Idempotentlik kalitingiz bormi (70-bob)?
4. Yuqoridagi "6 GB" hisobini o'z runtime'ingiz uchun qiling: bitta ulanish qancha xotira oladi?
5. Server bitta guruh xabarini 1000 a'zoga tarqatsa — bu 99-bobdagi fan-out on write'mi? Mashhur guruhda nima bo'ladi?

## Manbalar

- WhatsApp Blog — *1 million is so 2011* (2012-01-06): <https://blog.whatsapp.com/1-million-is-so-2011>
- WhatsApp — *Encryption Overview*, texnik whitepaper, 9-versiya (2026-02-25): <https://www.whatsapp.com/security/WhatsApp-Security-Whitepaper.pdf>
- Engineering at Meta — *How WhatsApp enables multi-device capability* (2021-07-14): <https://engineering.fb.com/2021/07/14/security/whatsapp-multi-device/>
- WhatsApp — *Privacy Policy* ("Your Messages", "Undelivered Messages"): <https://www.whatsapp.com/legal/privacy-policy>
- Erlang/OTP — *Processes*: <https://www.erlang.org/doc/system/ref_man_processes.html>
- Erlang/OTP — *Efficiency Guide: Processes*: <https://www.erlang.org/doc/system/eff_guide_processes.html>
- Erlang/OTP — *System Limits*: <https://www.erlang.org/doc/system/system_limits.html>
