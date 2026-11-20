#!/bin/sh
# Ishlatish: ./yoz.sh <dars>   — natija: chiqish/<dars>.pcap, <dars>.log, versiyalar.txt
# PROFIL=dns — qo'shimcha xizmatlar (compose profili); QAYERDA=rezolver — tcpdump shu konteynerda (standart: klient);
# KIM=brauzer — ssenariy shu konteynerda ishlaydi (standart: klient)
set -eu
DARS=$1
QAYERDA=${QAYERDA:-klient}
KIM=${KIM:-klient}
PROFIL_ARG=${PROFIL:+--profile $PROFIL}
cd "$(dirname "$0")"
mkdir -p chiqish
sh tls/yarat.sh >/dev/null
docker compose $PROFIL_ARG up -d --build --quiet-pull >/dev/null
sleep 2
# interfeys — uy tarmog'idagisi (192.168.1.x): klientda yagona, routerda — Wi-Fi tomoni (MITM darsi)
docker compose $PROFIL_ARG exec -T "$QAYERDA" sh -c 'I=$(ip -o -4 addr show | grep " inet 192.168.1." | cut -d" " -f2); rm -f /tmp/y.pcap; tcpdump -Z root -i "$I" -n -w /tmp/y.pcap -U not arp and not ip6 >/dev/null 2>&1 & echo $! > /tmp/td.pid; sleep 1'
docker compose $PROFIL_ARG exec -T "$KIM" sh -s < "ssenariy/$DARS.sh" > "chiqish/$DARS.log" 2>&1 || true
# TLS kalitlari (bo'lsa): tshark yozuvni shu bilan ochadi
docker compose $PROFIL_ARG exec -T "$KIM" sh -c 'cat /tmp/kalitlar.log 2>/dev/null; rm -f /tmp/kalitlar.log' > "chiqish/$DARS.keys"
[ -s "chiqish/$DARS.keys" ] && chmod 644 "chiqish/$DARS.keys" || rm -f "chiqish/$DARS.keys"
sleep 1
docker compose $PROFIL_ARG exec -T "$QAYERDA" sh -c 'kill -INT $(cat /tmp/td.pid); sleep 1'
docker compose $PROFIL_ARG cp "$QAYERDA":/tmp/y.pcap "chiqish/$DARS.pcap"
chmod 644 "chiqish/$DARS.pcap"
{
  echo "sana: $(date -u +%F)"
  docker compose exec -T klient sh -c 'curl --version | head -1; tcpdump --version 2>&1 | head -1'
  docker compose exec -T veb nginx -v 2>&1
  docker compose exec -T veb sh -c 'nginx -V 2>&1 | grep -o "built with OpenSSL [0-9.]*"'
  echo "sinov CA: $(openssl version)"
  docker compose exec -T dns dnsmasq --version | head -1
  if [ "${PROFIL:-}" = dns ]; then
    echo "unbound $(docker compose $PROFIL_ARG exec -T rezolver unbound -V | head -1)"
    docker compose $PROFIL_ARG exec -T ildiz nsd -v 2>&1 | head -1
    docker compose exec -T klient dig -v 2>&1 | head -1
  fi
  [ "${PROFIL:-}" = brauzer ] && docker compose $PROFIL_ARG exec -T brauzer chromium --version 2>/dev/null | head -1
  tshark --version | head -1
} > chiqish/versiyalar.txt
docker compose $PROFIL_ARG down >/dev/null 2>&1
echo "tayyor: chiqish/$DARS.pcap"
