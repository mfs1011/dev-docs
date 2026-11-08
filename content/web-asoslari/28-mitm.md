# 28 — O'rtadagi odam hujumi

[Mundarija](README.md)

## Tushuncha

MDN (Manipulator in the Middle): **MITM** (manipulator in the middle — o'rtadagi odam) hujumida hujumchi bir-biri bilan aloqa qilayotgan ikki tomon **orasiga** kiradi. Vebda bu odatda foydalanuvchi brauzeri va server orasi: hujumchi HTTP orqali almashilayotgan **barcha** trafikni ko'radi va o'zgartirishi mumkin.

MDN misoli: hujumchi kafe yoki aeroportda ochiq Wi-Fi nuqtasi o'rnatadi va kimdir ulanishini kutadi. Ulangan foydalanuvchining brauzeri va u ochgan har qanday sayt orasidagi ma'lumotni hujumchi o'qiy va o'zgartira oladi.

TLS shunday hujumchiga qarshi loyihalangan: RFC 9846 (1-bo'lim) — TLS xususiyatlari hujumchi **tarmoqni to'liq nazorat qilsa ham** saqlanishi kerak (25-bob).

### Hujumchi nima qila oladi

| Imkoniyat | HTTP'da | HTTPS'da |
| --- | --- | --- |
| So'rov va javobni **o'qish** (parol, cookie, sahifa) | Ha — 25-bobdagi `tcpdump`: `GET / HTTP/1.1` va `Host` ochiq matnda | Yo'q — shifrlangan (`GET` qatori ko'rinmadi) |
| Sahifa yoki skriptni **o'zgartirish** | Ha — sezdirmasdan | Yo'q — yaxlitlik buzilsa TLS ulanishni to'xtatadi |
| O'zini sayt deb ko'rsatish | Ha — HTTP'da server haqiqiyligi tekshirilmaydi | Faqat sayt nomiga **ishonchli CA bergan** sertifikat bilan — aks holda brauzer rad etadi (26-bob) |
| Qaysi saytga ulanishni bilish | Ha | Qisman — IP manzil va SNI'dagi domen nomi ko'rinadi (25-bob) |
| Ulanishni uzib qo'yish | Ha | Ha — TLS bunga qarshi emas |

### Hujum yo'llari va ularga qarshi himoya

Oldingi boblarda har bir zaif nuqta va uning himoyasi ko'rildi. MITM nuqtai nazaridan:

| Zaif nuqta | Hujumchi nima qiladi | Himoya | Bob |
| --- | --- | --- | --- |
| Sayt HTTP'da | Hammasini o'qiydi va o'zgartiradi | Butun sayt HTTPS | 25 |
| Birinchi HTTP so'rov (`http://` yoki `301` dan oldin) | HTTPS'ga o'tishni to'xtatadi (SSL stripping) | HSTS, preload ro'yxati | 27 |
| HTTPS sahifada HTTP resurs | Skript yoki rasmni almashtiradi | Brauzer bloklaydi/yangilaydi; barcha resurslar HTTPS | 23 |
| Sertifikat xatosini e'tiborsiz qoldirish | O'z sertifikatini taqdim etadi | Tekshiruvni o'chirmaslik; HSTS xostda xatoni o'tkazib bo'lmaydi | 26, 27 |
| Cookie `Secure` siz | Cookie HTTP so'rov bilan ochiq ketadi | `Secure` atributi | 14 |
| Sessiya ID'si yo'lda | Tutib olib, sessiyani o'g'irlaydi | TLS + `Secure` cookie | 15 |
| Basic autentifikatsiya HTTP'da | Login va parolni `base64 -d` bilan o'qiydi | Faqat HTTPS | 16 |
| Eskirgan TLS versiyasi yoki shifr | Zaif algoritmga majburlaydi | TLS 1.2/1.3, tavsiya etilgan sozlamalar | 25 |
| Begona CA ishonchli ro'yxatga qo'shilgan | Har qanday sayt uchun "ishonchli" sertifikat chiqaradi | Ommaviy CT jurnallari noto'g'ri sertifikatlarni topishga yordam beradi | 26 |

Oxirgi qator bo'yicha MDN (HTTP caching) eslatadi: ba'zi tashkilotlar xodimlar kompyuteriga o'z CA'sini o'rnatib, **TLS'ni oraliqda ochuvchi proksi** (TLS bridge proxy) bilan trafikni ko'radi. Bunday holatda brauzer ulanishni xavfsiz deb ko'rsatadi, chunki CA tizimga ishonchli qilib qo'shilgan. Ya'ni HTTPS himoyasi ildiz sertifikatlar ro'yxatiga kim nimani qo'shganiga bog'liq.

### MDN tavsiyalari

Asosiy himoya — saytni **HTTPS** orqali berish: HTTPS hujumchiga trafikni o'qishga va uni oldindan aytib bo'ladigan tarzda o'zgartirishga yo'l qo'ymaydi. Faqat "muhim" sahifalar emas — **barcha** sahifalar. MDN TLS qo'llanmasidan:

- xavfsiz TLS sozlamasi;
- server autentifikatsiyasi (sertifikat);
- barcha resurslar (skript, stil, rasm, shrift) TLS orqali;
- HTTP'dan HTTPS'ga yo'naltirilsa — HSTS.

## Ko'rib chiqamiz

Bu bob — tushuncha bobi: hujum bu yerda ko'rsatilmaydi. Himoyalarning ishlashi oldingi boblarda real muhitda tekshirilgan:

| Nima tekshirildi | Natija | Bob |
| --- | --- | --- |
| HTTP va HTTPS paketlari (`tcpdump -A`) | HTTP'da `GET` va `Host` ochiq; HTTPS'da `GET` yo'q, faqat SNI'da domen | 25 |
| Basic autentifikatsiya qiymati | `base64 -d` bilan login va parol darhol o'qildi | 16 |
| Noto'g'ri nom, muddati o'tgan, o'z-o'zidan imzolangan, ishonchsiz ildizli sertifikatlar | `curl` har birida ulanishni to'xtatdi (`60`) | 26 |
| HSTS'dan keyin `http://` | Brauzer va `curl` so'rovni tarmoqqa chiqarmasdan HTTPS'ga o'tkazdi | 27 |
| HTTPS sahifada HTTP skript va `fetch()` | Bloklandi, so'rov yuborilmadi | 23 |
| `Secure` cookie | `localhost` da (MDN istisnosi) saqlandi; curl cookie faylida "faqat HTTPS" belgisi `TRUE` | 14 |

## Standartda nima deyilgan

| Hujjat | Nima |
| --- | --- |
| RFC 9846, 1-bo'lim | TLS xususiyatlari tarmoqni to'liq nazorat qiluvchi hujumchiga qarshi |
| RFC 3552 | Internet xavfsizligi hujjatlaridagi hujumchi modeli (RFC 9846 shunga tayanadi) |
| RFC 6797, 14.6 | HSTS'ning birinchi tashrif zaifligi |
| RFC 9162 | Certificate Transparency |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| "Bizda maxfiy ma'lumot yo'q — HTTPS shart emas" | Hujumchi sahifaga begona skript yoki havola qo'sha oladi | Barcha sahifalar HTTPS (MDN) |
| Faqat login sahifasini HTTPS qilish | Keyingi sahifalarda sessiya cookie'si ochiq ketadi | Butun sayt va `Secure` cookie |
| Brauzer sertifikat ogohlantirishini o'tkazib yuborish odati | Aynan shu holat MITM bo'lishi mumkin | Ogohlantirishni jiddiy qabul qilish; saytda HSTS |
| Ilovada sertifikat tekshiruvini o'chirish (`verify=False`, `-k`) | Har qanday sertifikat qabul qilinadi | Tekshiruv yoqiq; sinov uchun alohida, lokal CA |
| Ochiq Wi-Fi'da HTTP saytga parol kiritish | Tarmoq egasi parolni ko'radi | HTTPS saytlar; HSTS bilan himoyalangan saytlar |
| "HTTPS bilan hech kim hech narsani bilmaydi" | IP, SNI'dagi domen, trafik hajmi ko'rinadi | HTTPS — mazmun va yaxlitlik himoyasi, anonimlik emas |

## Amaliyot

1. MITM hujumi nima? MDN qanday oddiy misol keltiradi?
2. HTTP va HTTPS'da hujumchi nimalarni ko'ra oladi?
3. HTTPS bo'lsa ham, `http://` yozilgan birinchi so'rov nega xavfli va unga qarshi nima bor?
4. Nega sertifikat xatosini e'tiborsiz qoldirish MITM'ga yo'l ochadi?
5. Tashkilotdagi TLS'ni ochuvchi proksi qanday qilib brauzerga "xavfsiz" ko'rinadi?
6. MDN MITM'ga qarshi qaysi to'rt chorani tavsiya qiladi?

<details>
<summary>Javoblar</summary>

1. Hujumchi ikki tomon orasiga kirib, trafikni ko'radi va o'zgartiradi. Misol — kafe yoki aeroportdagi soxta Wi-Fi nuqtasi.
2. HTTP'da — hammasi (mazmun, cookie, parol) va o'zgartira oladi. HTTPS'da — IP manzil, SNI'dagi domen, trafik hajmi; mazmunni ko'rmaydi va sezdirmasdan o'zgartira olmaydi.
3. U shifrlanmagan — hujumchi HTTPS'ga o'tishni to'xtatishi mumkin (SSL stripping). Himoya — HSTS va preload ro'yxati.
4. Hujumchi o'z sertifikatini taqdim etadi; tekshiruv o'chirilsa, mijoz uni qabul qiladi va hujumchi bilan "xavfsiz" gaplashadi.
5. Tashkilot o'z CA'sini xodim kompyuterining ishonchli ro'yxatiga qo'shgan — proksi chiqargan sertifikatlar shu CA bilan imzolangani uchun ishonchli ko'rinadi.
6. Xavfsiz TLS sozlamasi, server autentifikatsiyasi, barcha resurslarni TLS orqali berish, HSTS.

</details>

## Rasmiy hujjat

- [MDN: Manipulator in the Middle (MITM)](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/MITM)
- [MDN: Transport Layer Security](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security)
- [MDN: HTTP caching — Proxy caches](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
- [RFC 9846: TLS 1.3](https://www.rfc-editor.org/rfc/rfc9846) · [RFC 3552: Guidelines for Writing RFC Text on Security Considerations](https://www.rfc-editor.org/rfc/rfc3552)
- [OWASP: Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html)
