#!/bin/sh
# Erlang/OTP'ni brauzerdagi VM (v86, 32-bit) uchun yig'ish: Debian 12 i386 konteynerida, erlang/otp rasmiy manba arxividan.
# Debian 12 paketidagi Erlang 25 RabbitMQ 4.4 ga yetmaydi (rabbitmq.com/docs/which-erlang: 4.4.0 — Erlang 27–29).
# Faqat RabbitMQ uchun kerakli ilovalar: wx, odbc, java, debugger/observer GUI va hujjatlar o'chirilgan; 32-bit'da JIT yo'q.
# Docker bor kompyuterda (sinov VPS) ishlatiladi:
#   sh rabbitmq-trenajor/scripts/erlang-yigish.sh  ->  rabbitmq-trenajor/build/otp-$V-i386.tar.gz
set -eu
V=28.5.0.8
cd "$(dirname "$0")/.."
mkdir -p build
cd build
[ -f otp_src_$V.tar.gz ] || curl -fsSLO https://github.com/erlang/otp/releases/download/OTP-$V/otp_src_$V.tar.gz
[ -f SHA256.txt ] || curl -fsSL -o SHA256.txt https://github.com/erlang/otp/releases/download/OTP-$V/SHA256.txt
grep " otp_src_$V.tar.gz\$" SHA256.txt | sha256sum -c -
docker run --rm --security-opt seccomp=unconfined --platform linux/386 -v "$PWD:/w" -w /w debian:bookworm setarch i686 sh -euc "
  export DEBIAN_FRONTEND=noninteractive
  apt-get -o Acquire::Retries=3 update -qq && apt-get -o Acquire::Retries=3 install -y -qq build-essential autoconf libncurses-dev libssl-dev > /dev/null
  rm -rf /tmp/b && mkdir /tmp/b && tar -xzf otp_src_$V.tar.gz -C /tmp/b && cd /tmp/b/otp_src_$V
  ./configure --prefix=/usr/local --without-wx --without-odbc --without-javac --without-debugger --without-observer \
    --without-et --without-megaco --without-diameter --without-jinterface --without-common_test --without-eunit \
    --without-ssh --without-snmp --without-edoc --without-erl_docgen --without-dialyzer --without-typer \
    --disable-jit > /tmp/configure.log 2>&1 || { tail -30 /tmp/configure.log; exit 1; }
  make -j\$(nproc) > /tmp/make.log 2>&1 || { tail -40 /tmp/make.log; exit 1; }
  make install DESTDIR=/tmp/out > /dev/null 2>&1
  find /tmp/out -name '*.so' -exec strip --strip-unneeded {} + 2>/dev/null || true
  find /tmp/out/usr/local/lib/erlang/erts-*/bin -type f -exec strip {} + 2>/dev/null || true
  tar -czf /w/otp-$V-i386.tar.gz -C /tmp/out usr
  /tmp/out/usr/local/bin/erl -noshell -eval 'io:format(\"OTP ~s, so'\''z hajmi ~p bit~n\", [erlang:system_info(otp_release), erlang:system_info(wordsize)*8]), halt().'
"
ls -l otp-$V-i386.tar.gz
