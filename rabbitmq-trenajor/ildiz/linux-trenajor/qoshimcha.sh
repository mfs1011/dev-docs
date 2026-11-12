#!/bin/sh
# RabbitMQ trenajori profili (stage2.sh oxirida, emulyator ichida bajariladi).
set -e
getent group rabbitmq > /dev/null || groupadd --system rabbitmq
getent passwd rabbitmq > /dev/null || useradd --system --gid rabbitmq --home /var/lib/rabbitmq --shell /usr/sbin/nologin rabbitmq
mkdir -p /var/lib/rabbitmq /var/log/rabbitmq
# rabbitmqctl (root terminalda) va server (rabbitmq foydalanuvchisi) bitta Erlang cookie bilan ishlashi kerak
head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n' | cut -c1-40 > /var/lib/rabbitmq/.erlang.cookie
cp /var/lib/rabbitmq/.erlang.cookie /root/.erlang.cookie
chmod 400 /var/lib/rabbitmq/.erlang.cookie /root/.erlang.cookie
chown -R rabbitmq:rabbitmq /var/lib/rabbitmq /var/log/rabbitmq
chown -R rabbitmq:rabbitmq /opt/rabbitmq/var 2>/dev/null || true
/usr/local/bin/erl -noshell -eval 'io:format("Erlang/OTP ~s~n", [erlang:system_info(otp_release)]), halt().'
systemctl enable rabbitmq-server.service rmq-boshqaruv.service
