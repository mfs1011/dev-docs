# Tizim dizayni simulyatori

Arxitektura kitobining IX qismi (tizim dizayni) uchun interaktiv model: foydalanuvchilar oqimi → (CDN) →
load balancer → serverlar → kesh / asosiy baza / replikalar. O'quvchi komponent qo'shadi, serverni yiqitadi,
yuklamani o'zgartiradi — har 0,1 soniyada bandlik, javob vaqti (o'rtacha va p95) va xatolar qayta hisoblanadi.
Sahifa: `/arxitektura/trenajor` (`src/views/ArxitekturaTrenajorPage.vue`, kod `src/arxitektura/`).

```bash
npm run dev                                  # http://localhost:5180/arxitektura/trenajor
npm run arxitektura-trenajor:test            # mashqlar model bilan (brauzersiz)
npx vite --port 5182 & node arxitektura-simulyator/test/brauzer.mjs   # brauzerda
```

## Model — taxminiy

Bu haqiqiy tizim o'lchovi emas va sahifada shunday deyiladi. Kitobning 90-bobi aytganidek, QPS — tartibni
baholash uchun; haqiqiy sig'im yuklama sinovida resurslar bo'yicha o'lchanadi.

| Narsa | Qiymat (`TAXMIN`) |
| --- | --- |
| Bitta ilova serveri | 400 so'rov/s, 25 ms |
| Asosiy baza / replika | 2 000 so'rov/s, 8 ms |
| Kesh | 50 000 so'rov/s, 1 ms |
| CDN | 20 ms, cheklanmagan |
| Tarmoq (foydalanuvchi ↔ datamarkaz) | 40 ms |
| Navbat chegarasi (timeout) | 3 s |

- Bandlik = oqim ÷ sig'im; kutish ≈ xizmat vaqti ÷ (1 − bandlik) — navbat nazariyasining eng sodda ko'rinishi.
- Sig'imdan oshgan so'rovlar navbatga yig'iladi; navbatda kutish 3 soniyadan oshsa — xato. Navbat vaqt bo'yicha
  o'sadi va kamayadi, shuning uchun tiqilish va tiklanish ko'rinadi.
- p95 — navbatda kutish qismi o'rtachadan ~3 barobar (eksponensial taqsimot).
- Har dinamik so'rov bazaga bitta murojaat qiladi; o'qishlar asosiy baza va replikalar orasida teng bo'linadi,
  yozish — faqat asosiyga. Load balancer yo'q bo'lsa hamma oqim birinchi serverga boradi.

## Mashqlar

| Mashq | Bob | Nima o'rgatadi |
| --- | --- | --- |
| Gorizontal masshtab va load balancer | 91, 92 | LB'siz qo'shimcha server ishlamaydi; stateless |
| Zaif bo'g'in: baza va kesh | 25, 90 | tiqilgan joyni topish, kesh bazani yengillatadi |
| O'qish uchun replikalar | 94 | replika faqat o'qishga yordam beradi; yozish ko'p bo'lsa — sharding |
| CDN | 93 | statik fayllar serverga yetib bormaydi |
| Server yiqilsa-chi? (N+1) | 92 | health check, zaxira sig'im |
