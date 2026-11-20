#!/bin/sh
# tshark bilan aylantirish uchun fayllar: <dars>.pdml, .cols, .hex (scripts/paket/aylantir.mjs o'qiydi)
# TCP qayta yig'ish o'chirilgan: har segment o'z baytlari bilan ko'rinadi (inspektordagi pos/len shu paketga tegishli).
set -eu
# Vaqtlar (sertifikat muddati va h.k.) VPS'ning mahalliy zonasida emas, UTC'da chiqsin
export TZ=UTC
DARS=$1
cd "$(dirname "$0")/chiqish"
O="-o tcp.desegment_tcp_streams:FALSE -o tcp.relative_sequence_numbers:TRUE"
tshark -r - $O -T pdml < "$DARS.pcap" > "$DARS.pdml"
tshark -r - $O -T fields -E separator=/t -e frame.number -e frame.time_relative -e ip.src -e ip.dst -e _ws.col.protocol -e _ws.col.info -e frame.len < "$DARS.pcap" > "$DARS.cols"
tshark -r - $O -T json -x < "$DARS.pcap" | python3 -c '
import json, sys
for p in json.load(sys.stdin):
    l = p["_source"]["layers"]
    print(l["frame"]["frame.number"] + "\t" + l["frame_raw"][0])
' > "$DARS.hex"
# TLS: kalitlar jurnali bo'lsa — "kalit bilan ochilgan" ko'rinish alohida (.ochiq.pdml, .ochiq.cols). Bu yerda TCP qayta
# yig'ish yoqiq: bir nechta segmentga bo'lingan TLS yozuvi (masalan, HTTP javobi) oxirgi segmentida ochiladi.
if [ -s "$DARS.keys" ]; then
  cp "$DARS.keys" /tmp/pl-kalitlar.log && chmod 644 /tmp/pl-kalitlar.log
  K="-o tcp.relative_sequence_numbers:TRUE -o tls.keylog_file:/tmp/pl-kalitlar.log"
  tshark -r - $K -T pdml < "$DARS.pcap" > "$DARS.ochiq.pdml"
  tshark -r - $K -T fields -E separator=/t -e frame.number -e _ws.col.protocol -e _ws.col.info < "$DARS.pcap" > "$DARS.ochiq.cols"
  rm -f /tmp/pl-kalitlar.log
fi
echo "eksport: $(wc -l < "$DARS.cols") paket"
