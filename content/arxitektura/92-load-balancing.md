# 92 — Load balancing

[← Oldingi: Gorizontal masshtab va stateless servislar](91-gorizontal-masshtab.md) · [Mundarija](README.md) · [Keyingi: CDN va chekka keshlash →](93-cdn.md)

## Tushuncha

**Load balancing** (yuklamani taqsimlash) — kelayotgan so'rovlarni bir nechta server (nusxa) o'rtasida bo'lish. 91-bobdagi gorizontal masshtab balansersiz ishlamaydi: klient bitta manzilni biladi, balanser esa so'rovni ortidagi nusxalardan biriga yuboradi.

NGINX hujjati uning maqsadlarini sanaydi: resurslardan samarali foydalanish, o'tkazuvchanlikni oshirish, kechikishni kamaytirish va nosozlikka chidamli konfiguratsiya.

Google SRE kitobi ("Load Balancing at the Frontend") nega bitta kuchli mashina yetmasligini ko'rsatadi. Cheksiz kuchli mashina va hech qachon buzilmaydigan tarmoq bo'lsa ham, yorug'lik tezligi masofaga qarab javob tezligiga yuqori chegara qo'yadi. Bundan tashqari bitta nosozlik nuqtasiga tayanish "yomon fikr".

### Balanslash qatlamlari

SRE kitobi Google'dagi balanslashni bir necha qatlamda tasvirlaydi:

```text
Klient
  │  1. DNS: qaysi datamarkaz / IP manzil?
  ▼
Virtual IP (VIP) — tarmoq balanseri: paket qaysi mashinaga?
  │
  ▼
Reverse proxy / HTTP balanser: so'rov qaysi ilova nusxasiga?
  │
  ▼
Ilova nusxalari (91-bob)
```

**DNS orqali balanslash.** Eng oddiy usul — DNS javobida bir nechta `A`/`AAAA` yozuv qaytarish, klient ulardan birini tanlaydi. SRE kitobiga ko'ra muammolari: klient xatti-harakati ustidan nazorat juda kam (yozuvlar tasodifiy tanlanadi), va klient odatda eng yaqin manzilni aniqlay olmaydi. Takomillashtirilgan variantlar (anycast, joylashuv xaritasi) esa DNS serverini ancha murakkablashtiradi.

**VIP va tarmoq balanseri.** Virtual IP hech bir tarmoq interfeysiga biriktirilmagan, ko'p qurilma ulashadi. Foydalanuvchi uchun u oddiy bitta IP; ortida nechta mashina borligi yashirin. Bu qatlam **paketlar** bilan ishlaydi.

**L4 va L7.** Balanser qaysi darajadagi ma'lumotga qarab qaror qilishiga ko'ra:

| | L4 (transport) | L7 (ilova) |
| --- | --- | --- |
| Nimani ko'radi | IP manzil, port, TCP/UDP ulanish | HTTP so'rov: yo'l, sarlavhalar, cookie |
| NGINX'da | `stream` moduli (`ngx_stream_upstream_module`) | `http` moduli (`upstream` + `proxy_pass`) |
| Qila oladi | Ulanishlarni taqsimlash | Yo'l bo'yicha marshrut (`/api` → bir guruh), sarlavha qo'shish, kesh |
| Narxi | Arzonroq — so'rovni tahlil qilmaydi | Har so'rov tahlil qilinadi |

NGINX hujjatiga ko'ra uning reverse proxy balanslashi HTTP, HTTPS, FastCGI, uwsgi, SCGI, memcached va gRPC uchun ishlaydi.

### Taqsimlash algoritmlari

NGINX hujjatidagi usullar:

| Usul | Qoida | NGINX direktivasi |
| --- | --- | --- |
| **Round-robin** (sukut) | Navbat bilan, aylana bo'ylab | — |
| **Least-connected** | Faol ulanishlari eng kam serverga | `least_conn` |
| **IP-hash** | Klient IP manzilining hash'i bo'yicha | `ip_hash` |
| **Vaznli** (weighted) | Server vazniga mutanosib | `server … weight=3` |

Hujjatdagi vazn misoli: `srv1` ning vazni 3, qolgan ikkitasiniki 1 bo'lsa, har 5 ta yangi so'rovdan 3 tasi `srv1` ga, bittadan `srv2` va `srv3` ga tushadi.

**Least-connected** NGINX hujjatiga ko'ra ba'zi so'rovlar uzoqroq bajariladigan holatda yuklamani **adolatliroq** taqsimlaydi — band serverga ortiqcha so'rov yuborilmaydi.

SRE kitobi ("Load Balancing in the Datacenter") oddiy round-robin narxini o'lchab beradi. U juda sodda va tasodifiy tanlovdan ancha yaxshi ishlaydi. Lekin Google tajribasida round-robin eng kam va eng ko'p yuklangan nusxa o'rtasida CPU sarfida **2 baravargacha farq** berishi mumkin. Sabablari — so'rovlar narxining har xilligi va mashinalarning bir xil emasligi. Kitobdagi yaxshiroq yondashuvlar:

- **least-loaded round robin** — faol so'rovlari eng kam nusxalar orasida round-robin;
- **weighted round robin** — nusxalar har javobda o'z holatini (so'rov va xato tezligi, CPU yuklamasi) yuboradi, klient shunga qarab vaznlarni moslaydi; xatolar keyingi qarorlarda "jarima" bo'ladi.

### Hash va "N o'zgarganda" muammosi

SRE kitobi ulanishni doim bitta serverga bog'lash kerak bo'lgan holatni ko'radi. Oddiy usul: `id(paket) mod N`, bunda N — serverlar soni. Lekin bitta server yiqilib N → N−1 bo'lsa, **deyarli har bir paket boshqa serverga** tushadi va mavjud ulanishlarning deyarli hammasi uziladi. Yechim — **consistent hashing** (1997-yilda taklif qilingan): server qo'shilsa yoki olib tashlansa, kalitlarning faqat kichik qismi ko'chadi. U 95-bobda (sharding) batafsil. NGINX `stream` modulida u `hash $remote_addr consistent` ko'rinishida.

### Sog'liqni tekshirish (health check)

Balanser buzilgan serverga so'rov yubormasligi kerak.

**Passiv (in-band) tekshiruv** — NGINX'ning ochiq versiyasida. Server xato bilan javob bersa, u "nosoz" deb belgilanadi va bir muddat tanlanmaydi:

- `max_fails` — `fail_timeout` ichida nechta ketma-ket muvaffaqiyatsiz urinishdan keyin server nosoz deb hisoblanadi (sukut — **1**; `0` — tekshiruv o'chiq);
- `fail_timeout` — server qancha vaqt nosoz deb belgilanadi; shundan keyin NGINX unga haqiqiy klient so'rovlari bilan ehtiyotkorlik bilan "tekshiruv" yuboradi, muvaffaqiyatli bo'lsa — qayta tirik.

Hujjatga ko'ra faol (application) health check'lar NGINX'ning pullik versiyasida (NGINX Plus).

**Faol tekshiruv — Kubernetes misolida.** **Readiness probe** konteyner trafik qabul qilishga **tayyor**ligini aniqlaydi. U muvaffaqiyatsiz bo'lsa, Pod'ning IP manzili Service'lar ro'yxatidan olib tashlanadi va unga trafik bormaydi. Hujjatga ko'ra bu uzoq boshlang'ich ishlar (ulanishlar, fayllar, keshni isitish) uchun va vaqtinchalik nosozlik yoki ortiqcha yuklamadan tiklanishda foydali. **Liveness probe** esa boshqa vazifali: konteynerni qachon **qayta ishga tushirish** kerakligini aniqlaydi (masalan, deadlock). Hujjat ogohlantiradi: u faqat haqiqatan tiklab bo'lmaydigan nosozlikni ko'rsatishi kerak. Noto'g'ri sozlangan liveness probe **zanjirli nosozlikka** olib keladi: yuqori yuklamada konteynerlar qayta ishga tushadi, so'rovlar xato oladi, qolgan Pod'larga yuklama oshadi.

**"Cho'loq o'rdak" holati** (lame duck). SRE kitobi nusxaning uchta holatini ajratadi: sog'lom; ulanishni rad etyapti; **lame duck** — port ochiq va xizmat qila oladi, lekin klientlardan so'rov yubormaslikni **aniq so'rayapti**. Bu holat to'g'ri to'xtashni (91-bob) soddalashtiradi: o'chirilayotgan nusxadagi joriy so'rovlar xato olmaydi.

### Sticky session

NGINX hujjati: round-robin va least-connected'da klientning har keyingi so'rovi **boshqa serverga** tushishi mumkin, bir serverga kafolat yo'q. Klientni serverga "yopishtirish" kerak bo'lsa — `ip_hash`: bir klientning so'rovlari (server mavjud bo'lsa) doim bitta serverga boradi.

Lekin 91-bobda ko'rilganidek, Twelve-Factor sticky session'ga **tayanishni** taqiqlaydi. To'g'ri yo'l — holatni tashqariga chiqarish, shunda istalgan algoritm ishlaydi.

## Nega shunday

Balanser — gorizontal masshtabning "kirish eshigi". U noto'g'ri sozlansa, nusxalar qo'shish yordam bermaydi:

- round-robin og'ir va yengil so'rovlarni ajratmaydi — bir nusxa bo'g'iladi, boshqasi bo'sh (SRE: 2× farq);
- health check'siz balanser o'lik nusxaga so'rov yuboraveradi;
- deploy paytida nusxani "lame duck"siz o'chirish — joriy so'rovlarda xato.

## Psevdokod: NGINX balanseri

```text
upstream app {
    least_conn;                                      # uzun so'rovlar bor — faol ulanish bo'yicha
    server app1:8080 max_fails=3 fail_timeout=10s;   # 10 s da 3 xato → 10 s chetga
    server app2:8080 max_fails=3 fail_timeout=10s;
    server app3:8080 weight=2;                       # kuchliroq mashina
}

server {
    listen 80;
    location /     { proxy_pass http://app; }        # L7: yo'l bo'yicha
    location /api/ { proxy_pass http://api; }        # boshqa guruh
}
```

## Psevdokod: algoritm tanlash

```text
So'rovlar bir xil va qisqa                    → round-robin
So'rovlar davomiyligi har xil (hisobot, yuklash) → least_conn / least-loaded
Serverlar quvvati har xil                      → vazn
Ulanish bitta serverga bog'lanishi shart (L4)  → consistent hash (95-bob)
"Sessiya serverda" — sticky kerak              → avval holatni tashqariga chiqaring (91-bob)
```

## Framework'larda

| Vazifa | Qayerda |
| --- | --- |
| Ilova nusxalarini balanser ortida ishga tushirish shartlari | 91-bob (stateless); Laravel deploy — [Laravel 32-bob](../laravel/32-optimallashtirish-va-deploy.md); Symfony — [Symfony 40-bob](../symfony/40-deploy-va-checklist.md) |
| Balanser ortida to'g'ri klient IP va protokol | Proxy sarlavhalari (`X-Forwarded-For`, `X-Forwarded-Proto`) — ilova ishonchli proksilarni bilishi kerak (77-bob) |
| Health endpoint | `/health` — ilova o'zi va bog'liqliklari tayyorligini qaytaradi; readiness va liveness'ni alohida |
| Real vaqt ulanishlari ko'p nusxada | WebSocket/SSE va pub/sub — 64-bob |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| DNS balanslash | Oddiy, qo'shimcha qurilma yo'q | Nazorat kam; DNS keshi tufayli o'zgarish sekin |
| L4 balanser | Tez, arzon, istalgan protokol | So'rov mazmuniga qarab marshrut yo'q |
| L7 balanser | Yo'l/sarlavha bo'yicha marshrut, kesh, TLS | Har so'rovni tahlil qilish narxi |
| Round-robin | Juda oddiy | Notekis yuklama (SRE: 2×) |
| Least-conn / weighted | Adolatliroq | Holat kuzatish kerak |
| `ip_hash` (sticky) | Holatli ilova "ishlaydi" | Notekis taqsimot; server yiqilsa sessiya yo'qoladi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Bitta balanser | Uning o'zi yagona nosozlik nuqtasi | Ikkita balanser, VIP yoki boshqariladigan servis |
| Health check yo'q | O'lik nusxaga so'rovlar | Passiv + faol (readiness) tekshiruv |
| Liveness probe vaqtincha sekinlikni ham "o'lim" deb biladi | Kubernetes: yuqori yuklamada qayta ishga tushishlar, zanjirli nosozlik | Liveness — faqat tiklanmas holat (deadlock); vaqtinchalik holat — readiness |
| Uzun so'rovlar bilan round-robin | Bir nusxa navbatga to'ladi | `least_conn` |
| `mod N` hash bilan ulanishni bog'lash | Server soni o'zgarsa deyarli hammasi ko'chadi | Consistent hashing |
| Deploy'da nusxani darhol o'chirish | Joriy so'rovlar xato oladi | Lame duck / readiness'ni o'chirish → kutish → to'xtatish |
| Ilova `X-Forwarded-*` ni bilmaydi | Klient IP noto'g'ri, HTTPS/HTTP aralashadi | Ishonchli proksi sozlamasi |

## Amaliyot

1. Ilovangiz oldidagi barcha balanslash qatlamlarini chizing: DNS, CDN, balanser, ilova.
2. Qaysi algoritm ishlatiladi? Nusxalar o'rtasidagi CPU farqini o'lchang — round-robin bo'lsa, SRE'dagi 2× ga yaqinmi?
3. Bitta nusxani "o'ldiring": balanser uni qancha vaqtda chetlatadi va bu orada nechta so'rov xato oldi?
4. `/health` endpoint'ingiz nimani tekshiradi? Readiness va liveness'ni ajrating.
5. Deploy paytida xato so'rovlar bormi? Bo'lsa — to'g'ri to'xtash ketma-ketligini qo'shing.

## Manbalar

- NGINX — Using nginx as HTTP load balancer: <https://nginx.org/en/docs/http/load_balancing.html>
- NGINX — Module ngx_stream_upstream_module: <https://nginx.org/en/docs/stream/ngx_stream_upstream_module.html>
- Google — *Site Reliability Engineering*, 19-bob: Load Balancing at the Frontend: <https://sre.google/sre-book/load-balancing-frontend/>
- Google — *Site Reliability Engineering*, 20-bob: Load Balancing in the Datacenter: <https://sre.google/sre-book/load-balancing-datacenter/>
- Kubernetes — Liveness, Readiness, and Startup Probes: <https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/>
