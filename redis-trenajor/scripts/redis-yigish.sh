#!/bin/sh
# Redis Open Source'ni brauzerdagi VM (v86, 32-bit) uchun yig'ish: Debian 12 i386 konteynerida, rasmiy manba arxividan
# (download.redis.io; SHA256 — github.com/redis/redis-hashes). Faqat Redis'ning o'zi (redis-server, redis-cli,
# redis-benchmark …): Redis 8 modullari (JSON, Search, TimeSeries, Bloom) BUILD_WITH_MODULES bilan alohida yig'iladi,
# ular Rust va qo'shimcha vositalarni talab qiladi — trenajorda yo'q.
# Docker bor kompyuterda (masalan, sinov VPS) ishlatiladi:
#   sh redis-trenajor/scripts/redis-yigish.sh  ->  redis-trenajor/build/redis-8.10.3-i386.tar.gz (profil.json shuni kutadi)
set -eu
V=8.10.3
SHA256=edde778f6bdee7581e42fc139ca9e07e2822212092f7501f99989656e3629d02
cd "$(dirname "$0")/.."
mkdir -p build
cd build
[ -f redis-$V.tar.gz ] || curl -fsSLO https://download.redis.io/releases/redis-$V.tar.gz
echo "$SHA256  redis-$V.tar.gz" | sha256sum -c -
# seccomp=unconfined: nginx-trenajor/scripts/nginx-yigish.sh dagi izohga qarang (i386 konteynerda DNS)
docker run --rm --security-opt seccomp=unconfined --platform linux/386 -v "$PWD:/w" -w /w debian:bookworm setarch i686 sh -euc "
  export DEBIAN_FRONTEND=noninteractive
  apt-get -o Acquire::Retries=3 update -qq && apt-get -o Acquire::Retries=3 install -y -qq build-essential pkg-config > /dev/null
  rm -rf /tmp/b && mkdir /tmp/b && tar -xzf redis-$V.tar.gz -C /tmp/b && cd /tmp/b/redis-$V
  # "make" (scripts/build.sh) modullarni ham yig'adi; src/ — faqat Redis'ning o'zi (yuqori Makefile izohi bo'yicha)
  make -C src -j\$(nproc) > /tmp/make.log 2>&1 || { tail -40 /tmp/make.log; exit 1; }
  make -C src install PREFIX=/tmp/out/usr/local > /dev/null
  strip /tmp/out/usr/local/bin/redis-server /tmp/out/usr/local/bin/redis-cli /tmp/out/usr/local/bin/redis-benchmark
  mkdir -p /tmp/out/etc/redis && cp redis.conf /tmp/out/etc/redis/redis.conf.asl
  /tmp/out/usr/local/bin/redis-server --version
  tar -czf /w/redis-$V-i386.tar.gz -C /tmp/out .
"
ls -l redis-$V-i386.tar.gz
