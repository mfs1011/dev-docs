#!/bin/sh
# tshark bilan aylantirish uchun fayllar: <dars>.pdml, .cols, .hex (scripts/paket/aylantir.mjs o'qiydi)
# TCP qayta yig'ish o'chirilgan: har segment o'z baytlari bilan ko'rinadi (inspektordagi pos/len shu paketga tegishli).
set -eu
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
echo "eksport: $(wc -l < "$DARS.cols") paket"
