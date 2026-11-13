#!/bin/sh
# Redis trenajori profili (stage2.sh oxirida, emulyator ichida bajariladi).
set -e
getent group redis > /dev/null || groupadd --system redis
getent passwd redis > /dev/null || useradd --system --gid redis --home /var/lib/redis --shell /usr/sbin/nologin redis
mkdir -p /var/lib/redis
chown redis:redis /var/lib/redis
# asl redis.conf (Redis manbasidan) + trenajor sozlamalari
# Redis 8 manbasidagi redis.conf oxirida modullar (Bloom, Search, JSON, TimeSeries) yuklanadi — ular yig'ilmagan
# (scripts/redis-yigish.sh), shuning uchun bu qatorlar izohga aylantiriladi: aks holda Redis ishga tushmaydi.
sed 's|^loadmodule ./modules/|# trenajor: modul yig‘ilmagan — # loadmodule ./modules/|' /etc/redis/redis.conf.asl > /etc/redis/redis.conf
printf '\n# Redis trenajori sozlamalari\ninclude /etc/redis/trenajor.conf\n' >> /etc/redis/redis.conf
# arxivdagi redis.conf 600 bilan keladi — redis foydalanuvchisi o'qiy olishi kerak ("Permission denied")
chown root:redis /etc/redis/redis.conf /etc/redis/trenajor.conf
chmod 640 /etc/redis/redis.conf /etc/redis/trenajor.conf
/usr/local/bin/redis-server --version
systemctl enable redis-server.service redis-boshqaruv.service
