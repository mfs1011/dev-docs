# Tizim dizayni laboratoriyasi

"Tizim dizayni darslari" (`/arxitektura/darslar`) dagi o'lchangan raqamlar shu yerda olinadi. Reja:
[docs/vizualizator/tizim-dizayni.md](../docs/vizualizator/tizim-dizayni.md) 3-bo'lim.

Sinov VPS'ida (1 vCPU) Docker Compose: nginx 1.30.6 load balancer + 3 ta ilova (`ilova/app.py`) + yuklama generatori
(`yuk/yuk.py`). Tarmoq `internal: true`.

- **Ilova** bir vaqtda bitta so'rovni bajaradi: `/tez` — 20 ms, `/ogir` — 300 ms (`time.sleep`; 1 vCPU'da CPU
  raqobati o'lchovni buzmasligi uchun). Demak bitta nusxa sekundiga ~50 ta `/tez` ga ulguradi. Bu — darsdagi model
  ilova; nginx taqsimlashi, navbat va vaqtlar esa haqiqiy.
- **Yuklama** ochiq tsiklli: so'rovlar javobni kutmasdan belgilangan tezlikda yuboriladi.

```bash
./olchov.sh      # → chiqish/load-balancing/*.json + versiyalar.txt
rsync -az lab:/root/tizim-lab/chiqish/load-balancing/ src/sahna/tizim/olchovlar/load-balancing/
```

Saboq: birinchi o'lchovda har javob ~63 ms chiqdi (ish 20 ms). Sabab — `BaseHTTPRequestHandler` sarlavha va tanani
alohida yozadi, Nagle + delayed ACK ~40 ms qo'shadi. Tuzatish: `wbufsize`, `disable_nagle_algorithm`, HTTP/1.0.

## Rate limiting darsi

```bash
./olchov-rate.sh   # → chiqish/rate-limiting/*.json
rsync -az lab:/root/tizim-lab/chiqish/rate-limiting/ src/sahna/tizim/olchovlar/rate-limiting/
```

Ikki yuklama generatori turli IP'dan bir vaqtda: `yuk` (10.70.0.100, foydalanuvchi) va `yuk2` (10.70.0.101, bot).
`lb/nginx.conf.tmpl` dagi `__ZONA__`/`__LIMIT__` — `limit_req_zone` va `limit_req` satrlari (Load balancing o'lchovida bo'sh).
429 javobiga `Retry-After` ni nginx o'zi qo'shmaydi — `error_page 429 = @cheklandi` orqali qo'shiladi.

Saboq: `yuk.py` 400 ta ishchi oqim bilan ishlaydi — 400 tadan ortiq javob kutilayotgan bo'lsa, keyingi so'rovlar
ishchi bo'shaguncha kutadi. Ya'ni juda katta tezlikda generator to'liq "ochiq tsikl" emas; darsda bu aytiladi.

## Kesh darsi

```bash
./olchov-kesh.sh   # profil "kesh": PostgreSQL 18.6 + Redis 8.10 + do'kon ilovasi → chiqish/kesh/*
rsync -az --exclude '*.vaqt.jsonl' lab:/root/tizim-lab/chiqish/kesh/ src/sahna/tizim/olchovlar/kesh/
```

`dokon/app.py` — cache-aside (Redis), `/sozla` bilan rejim (keshsiz, TTL, qulf), `/statistika` — DB, hit, miss hisoblagichlari.
`dokon/boshlash.sql` — 1000 mahsulot, 500 000 sharh; `sharh.mahsulot_id` da indeks ataylab yo'q (og'ir so'rov o'rnida).

Saboqlar:
- `generate_series` formulasida `i * 7919` `int` ga sig'madi (`integer out of range`) — baza bo'sh qoldi, skript uni cheksiz
  kutdi. Endi formula `bigint`, kutish esa 3 daqiqa bilan cheklangan.
- Ketma-ket o'lchovlar bir-birini buzadi: keshsiz yuklamadan keyin bazada navbatdagi so'rovlar qoladi. Har o'lchovdan
  oldin `pg_stat_activity` bo'shaguncha kutiladi.
