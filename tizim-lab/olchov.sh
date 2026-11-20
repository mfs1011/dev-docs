#!/bin/sh
# "Load balancing" darsining o'lchovlari. Natija: chiqish/load-balancing/<qadam>.json + versiyalar.txt
set -eu
cd "$(dirname "$0")"
O=chiqish/load-balancing; mkdir -p "$O"
upstream() {
  sed "s|__UPSTREAM__|$1|; s|__ZONA__||; s|__LIMIT__||" lb/nginx.conf.tmpl > lb/nginx.conf
  docker compose up -d --build --quiet-pull >/dev/null 2>&1
  docker compose exec -T lb nginx -s reload >/dev/null 2>&1 || true
  sleep 2
}
yuk() { docker compose exec -T yuk python3 /yuk.py 10.70.0.2:80 "$@"; }
A="server 10.70.0.11:8000;"; B="server 10.70.0.12:8000;"; C="server 10.70.0.13:8000;"

upstream "$A"
yuk 60 20 tez > "$O/bitta.json"
upstream "$A $B $C"
yuk 60 20 tez > "$O/round-robin.json"
yuk 15 30 tez,tez,ogir > "$O/ogir-rr.json"
upstream "least_conn; $A $B $C"
yuk 15 30 tez,tez,ogir > "$O/ogir-lc.json"
upstream "least_conn; $A $B $C"
( sleep 8; docker compose stop a2 >/dev/null 2>&1 ) &
yuk 30 25 tez > "$O/yiqildi.json"
wait
docker compose start a2 >/dev/null 2>&1
{
  echo "sana: $(date -u +%F)"
  docker compose exec -T lb nginx -v 2>&1
  docker compose exec -T yuk python3 --version
  echo "vCPU: $(nproc)"
} > "$O/versiyalar.txt"
docker compose down >/dev/null 2>&1
echo "olchov tayyor"
