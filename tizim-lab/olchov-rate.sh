#!/bin/sh
# "Rate limiting" darsining o'lchovlari. Ikki manba bir vaqtda: foydalanuvchi (yuk, 10.70.0.100) va bot (yuk2, 10.70.0.101).
# Natija: chiqish/rate-limiting/<qadam>.json + versiyalar.txt
set -eu
cd "$(dirname "$0")"
O=chiqish/rate-limiting; mkdir -p "$O"
A="server 10.70.0.11:8000;"; B="server 10.70.0.12:8000;"; C="server 10.70.0.13:8000;"
ZONA='limit_req_zone $binary_remote_addr zone=ip:10m rate=20r/s;'
lb() {  # $1 — limit_req satri (bo'sh bo'lsa — cheklovsiz)
  sed "s|__UPSTREAM__|$A $B $C|; s|__ZONA__|$ZONA|; s|__LIMIT__|$1|" lb/nginx.conf.tmpl > lb/nginx.conf
  docker compose up -d --build --quiet-pull >/dev/null 2>&1
  docker compose exec -T lb nginx -s reload >/dev/null 2>&1 || true
  sleep 3
}
yuk() { docker compose exec -T "$1" python3 /yuk.py 10.70.0.2:80 "$2" "$3" tez; }

# 1) cheklovsiz: bot 300/s, foydalanuvchi 10/s — bir vaqtda 20 s
lb ''
yuk yuk2 300 20 > "$O/yoq-bot.json" & yuk yuk 10 20 > "$O/yoq-foyd.json"; wait
sleep 15
# 2) IP bo'yicha 20 so'rov/s, ortig'i — 429
lb 'limit_req zone=ip; limit_req_status 429;'
yuk yuk2 300 20 > "$O/limit-bot.json" & yuk yuk 10 20 > "$O/limit-foyd.json"; wait
# 3) foydalanuvchi portlashi: 0,3 s ichida 30 so'rov (100/s) — burst'siz va burst=20 nodelay bilan
yuk yuk 100 0.3 > "$O/portlash-burstsiz.json"
lb 'limit_req zone=ip burst=20 nodelay; limit_req_status 429;'
yuk yuk 100 0.3 > "$O/portlash-burst.json"
{
  echo "sana: $(date -u +%F)"
  docker compose exec -T lb nginx -v 2>&1
  docker compose exec -T yuk python3 --version
  echo "vCPU: $(nproc)"
} > "$O/versiyalar.txt"
docker compose down >/dev/null 2>&1
echo "olchov tayyor"
