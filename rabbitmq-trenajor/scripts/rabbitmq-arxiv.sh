#!/bin/sh
# RabbitMQ'ning rasmiy "generic UNIX" arxivini (arxitekturaga bog'liq emas — Erlang .beam fayllari) olib, GPG imzosini
# tekshiradi (rabbitmq.com/docs/signatures, kalit 0x0A9AF2115F4687BD29803A206B73A36E6026DFCA) va trenajor tasviri uchun
# opt/rabbitmq ga qayta joylaydi:  ->  rabbitmq-trenajor/build/rabbitmq-4.4.0-opt.tar.gz
set -eu
V=4.4.0
KALIT=0x0A9AF2115F4687BD29803A206B73A36E6026DFCA
cd "$(dirname "$0")/.."
mkdir -p build
cd build
A=rabbitmq-server-generic-unix-$V.tar.xz
U=https://github.com/rabbitmq/rabbitmq-server/releases/download/v$V
[ -f $A ] || curl -fsSLO $U/$A
[ -f $A.asc ] || curl -fsSLO $U/$A.asc
export GNUPGHOME="$PWD/.gnupg"; mkdir -p "$GNUPGHOME"; chmod 700 "$GNUPGHOME"
gpg -q --keyserver hkps://keys.openpgp.org --recv-keys $KALIT
gpg -q --verify $A.asc $A
rm -rf tmp && mkdir -p tmp/opt && tar -xJf $A -C tmp/opt && mv tmp/opt/rabbitmq_server-$V tmp/opt/rabbitmq
tar -czf rabbitmq-$V-opt.tar.gz -C tmp opt && rm -rf tmp
ls -l rabbitmq-$V-opt.tar.gz
