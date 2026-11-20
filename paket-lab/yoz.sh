#!/bin/sh
# Ishlatish: ./yoz.sh <dars>   — natija: chiqish/<dars>.pcap, <dars>.log, versiyalar.txt
# PROFIL=dns — qo'shimcha xizmatlar (compose profili); QAYERDA=rezolver — tcpdump shu konteynerda (standart: klient)
set -eu
DARS=$1
QAYERDA=${QAYERDA:-klient}
PROFIL_ARG=${PROFIL:+--profile $PROFIL}
cd "$(dirname "$0")"
mkdir -p chiqish
docker compose $PROFIL_ARG up -d --build --quiet-pull >/dev/null
sleep 2
docker compose exec -T "$QAYERDA" sh -c 'rm -f /tmp/y.pcap; tcpdump -Z root -i eth0 -n -w /tmp/y.pcap -U not arp and not ip6 >/dev/null 2>&1 & echo $! > /tmp/td.pid; sleep 1'
docker compose exec -T klient sh -s < "ssenariy/$DARS.sh" > "chiqish/$DARS.log" 2>&1 || true
sleep 1
docker compose exec -T "$QAYERDA" sh -c 'kill -INT $(cat /tmp/td.pid); sleep 1'
docker compose cp "$QAYERDA":/tmp/y.pcap "chiqish/$DARS.pcap"
chmod 644 "chiqish/$DARS.pcap"
{
  echo "sana: $(date -u +%F)"
  docker compose exec -T klient sh -c 'curl --version | head -1; tcpdump --version 2>&1 | head -1'
  docker compose exec -T veb nginx -v 2>&1
  docker compose exec -T dns dnsmasq --version | head -1
  if [ -n "${PROFIL:-}" ]; then
    echo "unbound $(docker compose $PROFIL_ARG exec -T rezolver unbound -V | head -1)"
    docker compose $PROFIL_ARG exec -T ildiz nsd -v 2>&1 | head -1
    docker compose exec -T klient dig -v 2>&1 | head -1
  fi
  tshark --version | head -1
} > chiqish/versiyalar.txt
docker compose $PROFIL_ARG down >/dev/null 2>&1
echo "tayyor: chiqish/$DARS.pcap"
