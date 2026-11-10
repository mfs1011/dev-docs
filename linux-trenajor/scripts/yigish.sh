#!/bin/sh
# Linux trenajorini noldan yig'ish (CI va lokal): Debian 12 paketlari rasmiy ombordan olinadi,
# dpkg emulyator ichida ishlaydi, natija — build/web/{fs/, holat.zst} (sayt uni public/linux-trenajor/ dan beradi).
# Kerak: python3, node (>= 22.15, zlib zstd), zstd, npm ci qilingan (v86 moduli).
# Boshqa trenajor tasviri: TRENAJOR_PROFIL=nginx sh linux-trenajor/scripts/yigish.sh  ->  nginx-trenajor/build/web
set -eu
cd "$(dirname "$0")/.."
B=build
[ -n "${TRENAJOR_PROFIL:-}" ] && B="$PWD/../$TRENAJOR_PROFIL-trenajor/build"
python3 scripts/yadro.py
rm -rf "$B/fs-stage1" "$B/fs" "$B/stage2.tar"
python3 scripts/rootfs.py
python3 scripts/fsjson.py "$B/stage1.tar" "$B/fs-stage1"
node scripts/stage2.mjs > "$B/stage2.log" 2>&1 || { tail -40 "$B/stage2.log"; exit 1; }
natija=$(grep "sozlandi" "$B/stage2.log") || { tail -40 "$B/stage2.log"; exit 1; }
echo "$natija"
# "muammoli:" dan keyin paket nomi bo'lsa — dpkg biror paketni sozlay olmagan
case "$natija" in *"muammoli: "[a-z]*) echo "dpkg xatosi"; exit 1;; esac
grep -q "qoshimcha.sh: xato" "$B/stage2.log" && { echo "qoshimcha.sh xatosi"; exit 1; }
python3 scripts/fsjson.py "$B/stage2.tar" "$B/fs" --zstd
node scripts/holat.mjs
