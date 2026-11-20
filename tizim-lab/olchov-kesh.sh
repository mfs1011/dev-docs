#!/bin/sh
# "Kesh" darsining o'lchovlari (profil kesh): do'kon ilovasi + PostgreSQL + Redis. Natija: chiqish/kesh/<qadam>.json
set -eu
cd "$(dirname "$0")"
O=chiqish/kesh; mkdir -p "$O"
DC="docker compose --profile kesh"
$DC up -d --build --quiet-pull >/dev/null 2>&1
i=0; until $DC exec -T pg psql -U postgres -d dokon -tAc 'select count(*) from sharh' 2>/dev/null | grep -q 500000; do
  i=$((i + 1)); [ $i -gt 90 ] && { echo 'baza tayyor bo'"'"'lmadi'; $DC logs --tail 5 pg; exit 1; }; sleep 2
done
sleep 2
post() { $DC exec -T yuk python3 -c "import urllib.request,sys; print(urllib.request.urlopen(urllib.request.Request('http://10.70.0.30:8000$1', method='POST', data=b'')).read().decode())" >/dev/null; }
stat() { $DC exec -T yuk python3 -c "import urllib.request; print(urllib.request.urlopen('http://10.70.0.30:8000/statistika').read().decode())"; }
yuk() { $DC exec -T yuk python3 /yuk.py 10.70.0.30:8000 "$@"; }
ISSIQ=$(seq -s, -f 'mahsulot/%g' 1 20)   # 20 ta mashhur mahsulot, navbat bilan
# baza bo'shaguncha kutish: oldingi o'lchovning navbatdagi so'rovlari keyingisini buzmasin
boshla() {
  i=0; until [ "$($DC exec -T pg psql -U postgres -d dokon -tAc "select count(*) from pg_stat_activity where state = 'active' and datname = 'dokon'")" -le 1 ]; do
    i=$((i + 1)); [ $i -gt 60 ] && break; sleep 2
  done
  sleep 3
}
olchov() {  # $1 — nom, qolgani yuk argumentlari
  nom=$1; shift
  boshla; post /nol
  yuk "$@" > "$O/$nom.yuk.json"
  stat > "$O/$nom.stat.json"
}
# 1) keshsiz — har so'rov DB'ga (8 so'rov/s; bitta so'rov ~90 ms, 1 vCPU — sig'im ~10/s)
post '/sozla?kesh=0'; olchov keshsiz 8 20 "$ISSIQ"
# 2) cache-aside, TTL 60 s
post '/sozla?kesh=1&ttl=60'; olchov cache-aside 8 20 "$ISSIQ"
# 3) eskirish va invalidatsiya
boshla; $DC exec -T yuk python3 /tekshir.py > "$O/invalidatsiya.json"
# 4) kesh bo'roni: bitta mashhur kalit, TTL 2 s, 100 so'rov/s, 10 s — qulfsiz va qulf bilan
post '/sozla?kesh=1&ttl=2&qulf=0'; olchov boron-qulfsiz 100 10 mahsulot/1
post '/sozla?kesh=1&ttl=2&qulf=1'; olchov boron-qulf 100 10 mahsulot/1
# DB so'rovining o'zi: EXPLAIN ANALYZE
$DC exec -T pg psql -U postgres -d dokon -tAc "explain (analyze, format json) select m.id, m.nom, m.narx, round(avg(s.baho), 2) from mahsulot m join sharh s on s.mahsulot_id = m.id where m.id = 1 group by m.id" > "$O/explain.json"
{
  echo "sana: $(date -u +%F)"
  $DC exec -T pg postgres --version
  $DC exec -T redis redis-server --version | cut -d' ' -f1-3
  $DC exec -T dokon python3 -c "import sys, psycopg, redis; print('Python', sys.version.split()[0], '· psycopg', psycopg.__version__, '· redis-py', redis.__version__)"
  echo "vCPU: $(nproc)"
} > "$O/versiyalar.txt"
$DC down >/dev/null 2>&1
echo "olchov tayyor"
