# 01 — nginx nima qiladi

[Mundarija](README.md)

## Tushuncha

NG (nginx.org): nginx ("engine x" deb o'qiladi) — **HTTP veb-server**, **reverse proxy**, **kontent keshi**, **yuklama taqsimlovchi** (load balancer), TCP/UDP proksi va pochta proksi serveri. Muallifi — Igor Sysoev.

Bu qo'llanmada asosan HTTP tomoni: veb-server, reverse proxy, yuklama taqsimlash, kesh va HTTPS. TCP/UDP (stream) va pochta proksi — kirmaydi (README).

### To'rt asosiy vazifa

| Vazifa | Nima | Bob |
| --- | --- | --- |
| **Veb-server** | Diskdagi fayllarni (HTML, rasm, JS) to'g'ridan-to'g'ri beradi | 5–10 |
| **Reverse proxy** (teskari proksi) | So'rovni orqadagi ilovaga (Node.js, PHP) uzatadi va javobni mijozga qaytaradi | 11–14, 17 |
| **Yuklama taqsimlovchi** | So'rovlarni bir nechta bir xil ilova serveri orasida bo'ladi; biri ishlamasa — qolganlariga | 15 |
| **HTTPS'ni tugatuvchi** (TLS termination) | Mijoz bilan shifrlangan ulanishni nginx o'zi ushlaydi, orqadagi ilova oddiy HTTP bilan ishlaydi | 18–25 |

NA (NGINX Reverse Proxy): proksi odatda yuklamani bir nechta serverga taqsimlash, turli saytlardagi kontentni bir joyda ko'rsatish yoki so'rovni HTTP'dan boshqa protokollar orqali ilova serverlariga ishlov berishga uzatish uchun ishlatiladi.

Oddiy **proksi** (forward proxy) mijoz tomonida turadi va mijoz nomidan internetga chiqadi. **Reverse proxy** esa server tomonida turadi: mijoz faqat nginx'ni ko'radi, orqadagi ilovalar yashirin qoladi.

```text
Brauzer ──HTTPS──▶ nginx ──HTTP──▶ Node.js ilova (127.0.0.1:3000)
                     │
                     ├──▶ PHP-FPM
                     └──▶ /var/www/sayt (statik fayllar)
```

### HTTP server imkoniyatlari (NG)

NG'dagi asosiy ro'yxatdan:

- statik va `index` fayllarni berish, papka ro'yxati (autoindex), ochiq fayllar keshi;
- keshlash bilan tezlashtirilgan reverse proxy; yuklama taqsimlash va nosozlikka chidamlilik;
- FastCGI (PHP-FPM), uwsgi, SCGI va memcached serverlarini keshlash bilan qo'llash;
- modulli tuzilma: filtrlar — gzip siqish, bayt oraliqlari (range), chunked javoblar, SSI va boshqalar;
- SSL/TLS va SNI; HTTP/2; HTTP/3;
- nom va IP bo'yicha **virtual serverlar** (bitta nginx'da bir nechta sayt);
- keep-alive ulanishlar;
- kirish jurnali formatlari, buferli yozish, syslog;
- 3xx–5xx xato kodlarini yo'naltirish, `rewrite` moduli (muntazam ifodalar bilan URI o'zgartirish);
- mijoz IP manzili, parol (HTTP Basic) bo'yicha kirishni cheklash;
- ulanishlar va so'rovlar sonini cheklash.

### Master va worker jarayonlar

NG (Beginner's Guide): nginx'da **bitta master** va **bir nechta worker** jarayon bor.

| Jarayon | Vazifasi |
| --- | --- |
| **master** | Konfiguratsiyani o'qiydi va tekshiradi, worker jarayonlarni boshqaradi |
| **worker** | So'rovlarga haqiqatda ishlov beradi |

- nginx **hodisalarga asoslangan** model (event-based) va OS mexanizmlaridan (Linux'da `epoll`) foydalanib, so'rovlarni worker'lar orasida samarali taqsimlaydi. Bitta worker bir vaqtda ko'p ulanishga xizmat qiladi.
- Worker'lar soni konfiguratsiyada (`worker_processes`) — qat'iy son yoki protsessor yadrolari soniga qarab avtomatik.
- Worker'lar **imtiyozsiz foydalanuvchi** nomidan ishlaydi (NG). Rasmiy paketda (2-bob) master — `root`, worker — `nginx` foydalanuvchisi (`user nginx;` direktivasi).
- Konfiguratsiyani qayta yuklash va hatto bajariladigan faylni yangilash — mijozlarga xizmatni **to'xtatmasdan** (NG). Qayta yuklashda master yangi sozlamani tekshiradi; to'g'ri bo'lsa — yangi worker'larni ishga tushirib, eskilariga to'xtash buyrug'ini yuboradi; eskilari yangi ulanish qabul qilmay, joriy so'rovlarni tugatib chiqadi. Xato bo'lsa — eski sozlama bilan ishlashda davom etadi (4-bob).
- NG: 10 000 ta faol bo'lmagan HTTP keep-alive ulanish ~2,5 MB xotira oladi.

### Konfiguratsiya fayli

nginx va modullarining ishlashi konfiguratsiya faylida belgilanadi. Standart nomi — `nginx.conf`, joylashuvi: `/usr/local/nginx/conf`, `/etc/nginx` yoki `/usr/local/etc/nginx` (NG). Rasmiy Linux paketlarida — `/etc/nginx/nginx.conf` (2–3-boblar).

### Boshqarish (qisqacha)

`nginx -s signal` (NG):

| Signal | Nima |
| --- | --- |
| `stop` | Tez to'xtatish |
| `quit` | Joriy so'rovlarni tugatib to'xtatish |
| `reload` | Konfiguratsiyani qayta yuklash |
| `reopen` | Jurnal fayllarini qayta ochish |

Konfiguratsiyadagi o'zgarish `reload` yoki qayta ishga tushirishsiz kuchga kirmaydi. Batafsil — 4-bob.

### NGINX Open Source va NGINX Plus

NGINX Admin Guide pullik **NGINX Plus**ni ham yoritadi. Bu qo'llanma faqat bepul nginx (NGINX Open Source) bilan ishlaydi; faqat Plus'da bor imkoniyatlar (faol health check, API orqali dinamik sozlash va boshqalar) kirmaydi (README).

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Ilovani (Node.js) to'g'ridan-to'g'ri 80/443 portga ochish | HTTPS, statik fayl, siqish, cheklashlarni ilova o'zi qilishi kerak | nginx'ni oldiga reverse proxy qilib qo'yish |
| Konfiguratsiyani o'zgartirib, kuchga kirdi deb o'ylash | `reload` siz kuchga kirmaydi (NG) | `nginx -t`, keyin `nginx -s reload` |
| Sozlamani o'zgartirish uchun nginx'ni to'xtatib-yoqish | Ulanishlar uziladi | `reload` — to'xtatmasdan |
| Reverse proxy va forward proxy'ni aralashtirish | Har xil tomonda turadi | Reverse — server tomonida, ilovalar oldida |
| NGINX Plus maqolasidagi direktivani bepul nginx'da ishlatish | Plus'ga xos imkoniyat ishlamaydi | Hujjatda "NGINX Plus" belgisini tekshirish |

## Amaliyot

1. nginx qaysi vazifalarni bajara oladi (kamida to'rttasi)?
2. Reverse proxy oddiy proksidan nimasi bilan farq qiladi?
3. Master va worker jarayonlar vazifasi nima?
4. `nginx -s quit` va `nginx -s stop` farqi nima?
5. Qayta yuklashda yangi konfiguratsiyada xato bo'lsa nima bo'ladi?
6. Nega nginx bir worker bilan ham ko'p ulanishga xizmat qila oladi?

<details>
<summary>Javoblar</summary>

1. Veb-server, reverse proxy, yuklama taqsimlovchi, kontent keshi, HTTPS'ni tugatish (shuningdek TCP/UDP va pochta proksi).
2. Reverse proxy server tomonida, ilovalar oldida turadi; mijoz faqat uni ko'radi. Oddiy proksi mijoz tomonida, mijoz nomidan chiqadi.
3. Master — konfiguratsiyani o'qiydi va worker'larni boshqaradi; worker'lar — so'rovlarga ishlov beradi.
4. `quit` — joriy so'rovlarni tugatib to'xtaydi; `stop` — tez to'xtaydi.
5. Master o'zgarishni qo'llamaydi va eski konfiguratsiya bilan ishlashda davom etadi.
6. Hodisalarga asoslangan model va OS mexanizmlari (`epoll`) tufayli.

</details>

## Rasmiy hujjat

- [NG: nginx](https://nginx.org/en/) (imkoniyatlar ro'yxati, arxitektura)
- [NG: Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html)
- [NA: Configuring NGINX as a Web Server](https://docs.nginx.com/nginx/admin-guide/web-server/web-server/)
- [NA: NGINX Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
