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
