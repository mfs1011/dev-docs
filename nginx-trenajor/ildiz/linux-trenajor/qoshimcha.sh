#!/bin/sh
# Nginx trenajori profili (stage2.sh oxirida, emulyator ichida bajariladi).
set -e
# nginx.org paketining preinst/postinst skriptlaridagi kabi: tizim foydalanuvchisi va log fayllari
getent group nginx > /dev/null || groupadd --system nginx
getent passwd nginx > /dev/null || useradd --system --gid nginx --no-create-home --home /nonexistent \
  --comment "nginx user" --shell /usr/sbin/nologin nginx
mkdir -p /var/log/nginx /var/cache/nginx /usr/lib/nginx/modules
ln -sfn /usr/lib/nginx/modules /etc/nginx/modules
for f in access.log error.log; do touch /var/log/nginx/$f; chmod 640 /var/log/nginx/$f; chown nginx:adm /var/log/nginx/$f; done
systemctl enable nginx.service ilova.service nginx-kuzatuv.service
# trenajor-kuzatuv.conf log'i /run da (servis ishga tushganda yaratiladi) — tekshiruv uchun hozir ham kerak
mkdir -p /run/nginx-kuzatuv
/usr/sbin/nginx -t -q
/usr/sbin/nginx -t -q -c /etc/ilova/nginx.conf
