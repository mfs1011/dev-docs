#!/bin/sh
# Linux trenajorini noldan yig'ish (CI va lokal): Debian 12 paketlari rasmiy ombordan olinadi,
# dpkg emulyator ichida ishlaydi, natija — build/web/{fs/, holat.zst} (sayt uni public/linux-trenajor/ dan beradi).
# Kerak: python3, node (>= 22.15, zlib zstd), zstd, npm ci qilingan (v86 moduli).
set -eu
cd "$(dirname "$0")/.."
python3 scripts/yadro.py
rm -rf build/fs-stage1 build/fs build/stage2.tar
python3 scripts/rootfs.py
python3 scripts/fsjson.py build/stage1.tar build/fs-stage1
node scripts/stage2.mjs > build/stage2.log 2>&1 || { tail -40 build/stage2.log; exit 1; }
natija=$(grep "sozlandi" build/stage2.log) || { tail -40 build/stage2.log; exit 1; }
echo "$natija"
# "muammoli:" dan keyin paket nomi bo'lsa — dpkg biror paketni sozlay olmagan
case "$natija" in *"muammoli: "[a-z]*) echo "dpkg xatosi"; exit 1;; esac
python3 scripts/fsjson.py build/stage2.tar build/fs --zstd
node scripts/holat.mjs
