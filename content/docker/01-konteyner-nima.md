# 01 — Konteyner nima

[← Mundarija](README.md)

## Tushuncha

Tasavvur qiling: loyihangizda React'dagi frontend, Python'dagi API va PostgreSQL bazasi bor. Loyiha ustida ishlash uchun kompyuteringizga Node, Python va PostgreSQL o'rnatishingiz kerak. Docker hujjati shu yerda uchta savol qo'yadi:

- Jamoadagi boshqalarda, CI'da va production'da xuddi shu versiyalar ekanini qanday kafolatlaysiz?
- Ilovangizga kerakli Python versiyasiga kompyuteringizda allaqachon o'rnatilgan boshqa versiya xalaqit bermasligini qanday ta'minlaysiz?
- Ikki loyihaga bir dasturning ikki xil versiyasi kerak bo'lsa-chi?

Docker'ning javobi — **konteyner** (container). Docker hujjatining ta'rifi: konteyner — ilovaning har bir qismi uchun **ajratilgan jarayon** (isolated process). Frontend, API va baza har biri o'z alohida muhitida, kompyuterdagi boshqa hamma narsadan ajratilgan holda ishlaydi.

Hujjat konteynerning to'rt xususiyatini sanaydi:

| Xususiyat | Ma'nosi |
| --- | --- |
| O'zi yetarli (self-contained) | Ishlashi uchun kerakli hamma narsa ichida — kompyuterda oldindan o'rnatilgan narsaga tayanmaydi |
| Ajratilgan (isolated) | Kompyuterga va boshqa konteynerlarga ta'siri minimal — bu xavfsizlikni oshiradi |
| Mustaqil (independent) | Har biri alohida boshqariladi: bittasini o'chirish boshqalariga ta'sir qilmaydi |
| Ko'chma (portable) | Noutbukda ishlagan konteyner data markazda yoki bulutda ham xuddi shunday ishlaydi |

## Konteyner va virtual mashina

Ajratish uchun avval virtual mashinalar (VM) ishlatilgan. Farqi — nima ajratilishida:

| | Virtual mashina | Konteyner |
| --- | --- | --- |
| Ichida nima bor | To'liq operatsion tizim: o'z yadrosi (kernel), drayverlari, dasturlari | Jarayon va unga kerakli fayllar |
| Yadro | Har VM'da o'ziniki | Barcha konteynerlar kompyuterning **bitta yadrosini** bo'lishadi |
| Bitta ilovani ajratish uchun | Ortiqcha og'ir: butun OT ishga tushiriladi | Yengil: oddiy jarayon |

Docker hujjati: konteynerlar bitta yadroni bo'lishgani uchun bir xil jihozda ko'proq ilova ishlatish mumkin. Docker'ni gipervizor (hypervisor) asosidagi virtual mashinalarga yengil va arzon muqobil deb ataydi.

Ikkalasi ko'pincha **birga** ishlatiladi. Hujjatdagi misol: bulutda olingan server odatda virtual mashina bo'ladi, unda esa bitta ilova o'rniga konteynerlar ishlaydi va bir nechta ilova joylashadi. Linux kitobidagi sinov VPS'imiz ham virtual mashina edi (Linux, 44-bob: `Virtualization: kvm`) — keyingi boblarda unga Docker o'rnatamiz.

### Ajratish qanday ishlaydi

Docker hujjati: konteyner ajratilgan ish joyini Linux yadrosining **namespace** (nomlar maydoni) imkoniyati bilan oladi. Konteyner ishga tushganda Docker unga namespace'lar to'plamini yaratadi; konteynerning har jihati alohida namespace'da ishlaydi va faqat shu namespace doirasidagiga kira oladi. Buni 4-bobda o'z ko'zimiz bilan ko'ramiz.

Shuning uchun konteyner — **Linux** texnologiyasi. macOS va Windows'da esa Docker Desktop konteynerlarni o'zi boshqaradigan **Linux virtual mashinasi** ichida ishga tushiradi (Docker Desktop hujjati, Virtual Machine Manager; 2-bob).

## Image: konteyner nimadan yasaladi

Konteyner — ajratilgan jarayon. U o'z fayllari va sozlamalarini qayerdan oladi? **Image**dan (obraz). Docker hujjati: image — konteynerni ishga tushirish uchun kerakli barcha fayllar, dasturlar, kutubxonalar va sozlamalarni o'z ichiga olgan standart paket.

| Image | Ichida |
| --- | --- |
| PostgreSQL | Baza dasturi, sozlama fayllari, bog'liqliklar |
| Python veb-ilova | Python, ilova kodi va uning barcha bog'liqliklari |

Image'ning ikki asosiy tamoyili (Docker hujjati):

1. **O'zgarmas** (immutable). Image yaratilgandan keyin uni o'zgartirib bo'lmaydi — faqat yangisini yasash yoki ustiga o'zgarish qo'shish mumkin.
2. **Qatlamlardan** (layers) iborat. Har qatlam — fayllar qo'shilishi, o'chirilishi yoki o'zgarishi.

Shu ikkisi tufayli tayyor image'ni kengaytirish mumkin. Masalan, Python ilovasi uchun hammasini noldan qurmaysiz: rasmiy Python image'idan boshlab, ustiga bog'liqliklar va kodingiz qatlamlarini qo'shasiz. Image'ni o'zingiz **Dockerfile** bilan yasaysiz (7-bob): undagi har ko'rsatma (instruction) image'da qatlam yaratadi va Dockerfile o'zgarsa, faqat o'zgargan qatlamlar qayta quriladi.

Image va konteyner farqi — dastur fayli va ishlayotgan jarayon farqiga o'xshaydi (Linux, 28-bob):

| | Image | Konteyner |
| --- | --- | --- |
| Nima | Konteyner uchun faqat o'qiladigan shablon | Image'ning ishga tushirilgan nusxasi (instance) |
| O'zgaradimi | Yo'q | Ha — ishlayotganda fayl yaratadi, o'zgartiradi |
| Nechta | Bitta image | Undan istalgancha konteyner |
| O'chirilganda | — | Doimiy omborga (6-bob) saqlanmagan o'zgarishlar **yo'qoladi** |

## Registry: image'lar qayerda saqlanadi

**Registry** (reyestr) — image'larni saqlash va ulashish markazi. U ochiq yoki yopiq bo'lishi mumkin. **Docker Hub** — hamma foydalana oladigan ochiq registry va Docker standart holatda image'larni shu yerdan qidiradi. Boshqalari ham bor: bulut provayderlarining registry'lari, GitHub Container Registry (25-bob), o'zingizning registry'ingiz.

Registry va **repozitoriy** (repository) — boshqa-boshqa narsa:

- **registry** — image'lar saqlanadigan joyning o'zi (masalan, Docker Hub);
- **repozitoriy** — registry ichidagi bir loyihaga tegishli image'lar to'plami, xuddi papka kabi. Undagi har image o'z **tegi** (tag) bilan ajraladi:

```text sxema
Registry (Docker Hub)
├── Repozitoriy: postgres
│   ├── postgres:17
│   └── postgres:18
└── Repozitoriy: nginx
    ├── nginx:1.29
    └── nginx:alpine
```

Docker Hub'dagi ishonchli image turlari (Docker hujjati):

| Tur | Kim chiqaradi |
| --- | --- |
| Docker Official Images | Docker tanlab yuritadigan to'plam; ko'pchilik uchun boshlang'ich nuqta |
| Docker Hardened Images | Hujum yuzasi kichik, minimal image'lar (11-bob) |
| Docker Verified Publishers | Docker tasdiqlagan tijorat kompaniyalari |
| Docker-Sponsored Open Source | Docker homiylik qiladigan ochiq loyihalar |

## Docker qanday tuzilgan

Docker hujjati: Docker **klient-server** arxitekturasida ishlaydi.

| Qism | Nima qiladi |
| --- | --- |
| Docker daemon (`dockerd`) | Server: Docker API so'rovlarini tinglaydi, image, konteyner, tarmoq va volume'larni boshqaradi — og'ir ishning hammasi shu yerda |
| Docker klient (`docker`) | Siz yozadigan buyruq. `docker run` yozganingizda klient buyruqni `dockerd` ga yuboradi, u bajaradi |
| Registry | Image'lar ombori; `docker pull`/`run` undan oladi, `docker push` unga yuboradi |
| Docker Desktop | Mac, Windows va Linux uchun ilova: ichida `dockerd`, `docker`, Docker Compose va boshqalar |

Klient va daemon REST API orqali, UNIX soketi yoki tarmoq orqali gaplashadi. Ular bitta kompyuterda bo'lishi shart emas: klient boshqa kompyuterdagi daemon'ga ham ulana oladi. Docker Compose (15-bob) — yana bir klient, bir nechta konteynerdan iborat ilovalar uchun.

## `docker run` ichida nima bo'ladi

Docker hujjati `docker run -i -t ubuntu /bin/bash` misolida qadamma-qadam tushuntiradi (standart registry sozlamasi bilan):

<div data-animatsiya="qadamli" data-nom="docker-run"></div>

1. `ubuntu` image'i kompyuterda bo'lmasa, Docker uni registry'dan yuklaydi — xuddi `docker pull ubuntu` qilgandek.
2. Yangi konteyner yaratadi — xuddi `docker container create` kabi.
3. Konteynerga oxirgi qatlam sifatida **yoziladigan** fayl tizimi ajratadi: ishlayotgan konteyner fayl yaratishi va o'zgartirishi mumkin, image esa o'zgarmaydi.
4. Tarmoq interfeysi yaratib, konteynerni standart tarmoqqa ulaydi va IP manzil beradi. Konteyner kompyuterning ulanishi orqali tashqi tarmoqqa chiqa oladi.
5. Konteynerni ishga tushiradi va `/bin/bash` ni bajaradi. `-i` va `-t` tufayli u terminalingizga ulangan — klaviaturadan buyruq yozish mumkin.
6. `exit` bilan `/bin/bash` tugasa, konteyner **to'xtaydi, lekin o'chirilmaydi**: uni qayta ishga tushirish yoki o'chirish mumkin.

Bu buyruqlarning hammasini 2–4-boblarda o'zimiz bajaramiz.

## Docker nima uchun kerak

Docker hujjati uch asosiy foydani sanaydi:

| Foyda | Amalda |
| --- | --- |
| Tez va bir xil yetkazish | Dasturchilar bir xil muhitda ishlaydi; o'zgarish testga, keyin production'ga **o'sha image** bilan boradi — CI/CD (26-bob) uchun qulay |
| Ko'chirish va kengaytirish | Bir konteyner noutbukda, data markazdagi serverda va bulutda bir xil ishlaydi; kerak bo'lsa nusxalarini tez ko'paytirish yoki kamaytirish mumkin |
| Bir jihozda ko'proq ish | Virtual mashinaga qaraganda yengil — server sig'imidan to'liqroq foydalanish |

## Tipik xatolar

**1. Konteynerni kichik virtual mashina deb o'ylash.**
Konteynerda o'z yadrosi yo'q — u kompyuter yadrosini bo'lishadigan ajratilgan jarayon.
To'g'risi: "ajratilgan jarayon va uning fayllari" deb tushunish.

**2. Image va konteynerni chalkashtirish.**
Image — o'zgarmas shablon, konteyner — undan ishga tushirilgan nusxa. Bitta image'dan ko'p konteyner bo'ladi.

**3. Konteyner ichidagi ma'lumot saqlanib qoladi deb o'ylash.**
Konteyner o'chirilsa, doimiy omborga yozilmagan o'zgarishlar yo'qoladi.
To'g'risi: muhim ma'lumot — volume'da (6-bob).

**4. Registry va repozitoriyni bir narsa deb bilish.**
Registry — ombor (Docker Hub), repozitoriy — undagi bir loyiha image'lari (`postgres`), teg — aniq versiya (`postgres:18`).

## Amaliyot

Savollar:

1. Konteyner va virtual mashinaning asosiy farqi nimada?
2. Image nega o'zgarmas, va bu qanday foyda beradi?
3. `docker run` dan keyin konteyner ichida yaratilgan fayl image'ga yoziladimi?
4. `docker` buyrug'ini yozganingizda ishni aslida kim bajaradi?
5. `docker run -it ubuntu bash` dan `exit` bilan chiqsangiz, konteyner bilan nima bo'ladi?

<details>
<summary>Javoblar</summary>

1. VM — o'z yadrosi bilan to'liq OT; konteyner — kompyuter yadrosini bo'lishadigan ajratilgan jarayon.
2. Yaratilgandan keyin o'zgarmaydi — faqat ustiga yangi qatlam qo'shiladi. Shuning uchun tayyor image'ni kengaytirish mumkin va bir image'dan ishga tushgan har konteyner bir xil boshlanadi.
3. Yo'q: konteynerga alohida yoziladigan qatlam ajratiladi, image o'zgarmaydi.
4. Docker daemon (`dockerd`): klient buyruqni unga API orqali yuboradi.
5. To'xtaydi, lekin o'chirilmaydi — qayta ishga tushirish yoki o'chirish mumkin.

</details>

## Rasmiy hujjat

- [What is Docker?](https://docs.docker.com/get-started/docker-overview/) — platforma, arxitektura, `docker run` qadamlari, namespace'lar
- [What is a container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/) — konteyner va VM
- [What is an image?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/) — image tamoyillari, Docker Hub image turlari
- [What is a registry?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/) — registry va repozitoriy
- [Docker Desktop: Virtual Machine Manager](https://docs.docker.com/desktop/features/vmm/) — macOS'da konteynerlar Linux VM ichida
