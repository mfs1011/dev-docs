#!/bin/sh
# 2-bosqich (emulyator ichida, PID 1 sifatida): debootstrap --second-stage kabi — haqiqiy dpkg paketlarni
# o'rnatadi va maintainer skriptlarini bajaradi. Oxirida tayyor tizim /natija.tar ga yoziladi.
export PATH=/usr/sbin:/usr/bin:/sbin:/bin DEBIAN_FRONTEND=noninteractive DEBCONF_NONINTERACTIVE_SEEN=true LC_ALL=C
# Bu skript PID 1. dpkg ish davomida libc6'ni (bir necha marta) almashtiradi; eski libc.so.6 o'chiriladi, 9p esa
# o'chirilgan faylning hali yuklanmagan sahifalarini bera olmaydi — init SIGBUS bilan o'ladi ("Kernel panic -
# Attempted to kill init! exitcode=0x00000007", CI'da tasodifan). Shuning uchun init o'zini tmpfs'dagi (/run) sh, ld.so
# va libc nusxalari bilan qayta ishga tushiradi: dpkg ularga tegmaydi. Bolalar (dpkg va boshqalar) tizimnikini ishlatadi.
if [ "${1:-}" != sabit ]; then
  mount -t proc proc /proc
  mount -t sysfs sys /sys
  mountpoint -q /dev || mount -t devtmpfs dev /dev
  mount -t tmpfs tmpfs /run
  mkdir -p /run/sabit
  cp -L /bin/sh /lib/ld-linux.so.2 /lib/i386-linux-gnu/libc.so.6 /run/sabit/
  exec /run/sabit/ld-linux.so.2 --library-path /run/sabit /run/sabit/sh "$0" sabit
fi
echo "[stage2] boshlandi (init: $(readlink /proc/self/exe 2>/dev/null; readlink /proc/1/exe))"

# o'rnatish paytida servislar ishga tushmasin (debootstrap ham shunday qiladi)
printf '#!/bin/sh\nexit 101\n' > /usr/sbin/policy-rc.d && chmod +x /usr/sbin/policy-rc.d

cd /var/cache/apt/archives
for p in $(cat /linux-trenajor/birinchi.txt); do
  dpkg --force-depends --install ${p}*.deb > /dev/null 2>/tmp/xato.txt || { echo "[stage2] $p: xato"; head -8 /tmp/xato.txt; }
done
echo "[stage2] asosiylar o'rnatildi"
dpkg --force-depends --force-confdef --force-confold --unpack *.deb > /dev/null 2>/tmp/xato.txt || tail -5 /tmp/xato.txt
echo "[stage2] hammasi ochildi"
dpkg --configure --pending --force-confdef --force-confold > /dev/null 2>/tmp/xato.txt || grep -v '^ ' /tmp/xato.txt | head -30
dpkg --configure -a > /dev/null 2>&1
echo "[stage2] sozlandi: $(dpkg-query -W -f='${db:Status-Abbrev}\n' | grep -c '^ii') ta paket o'rnatilgan, muammoli: $(dpkg-query -W -f='${db:Status-Abbrev} ${Package}\n' | grep -v '^ii' | tr '\n' ' ')"

# trenajor sozlamalari
rm -f /usr/sbin/policy-rc.d /var/cache/apt/archives/*.deb
echo trenajor > /etc/hostname
# /tmp — tmpfs (Debian 13 va Ubuntu'dagi kabi). Ildiz fayl tizimi 9p: unda havola ruxsatlari, ctime va inode hisobi
# haqiqiy diskdan farq qiladi — fayl tizimiga oid boblar va mashqlar /tmp da (haqiqiy yadro fayl tizimida) ishlaydi
cp /usr/share/systemd/tmp.mount /etc/systemd/system/tmp.mount
systemctl enable tmp.mount
# /etc/motd — kirishda ko'rsatiladigan matn (base-files paketidagi Debian matni o'rniga trenajor eslatmasi)
cp /linux-trenajor/motd /etc/motd
printf '127.0.0.1\tlocalhost\n127.0.1.1\ttrenajor\n' > /etc/hosts
: > /etc/machine-id
passwd -d root > /dev/null
mkdir -p /etc/systemd/system/serial-getty@ttyS0.service.d
printf '[Service]\nExecStart=\nExecStart=-/sbin/agetty --autologin root --noclear --keep-baud 115200,38400,9600 %%I $TERM\n' \
  > /etc/systemd/system/serial-getty@ttyS0.service.d/autologin.conf
# profil (deb.py): trenajorning o'z sozlamalari (masalan, nginx foydalanuvchisi va servisi)
if [ -x /linux-trenajor/qoshimcha.sh ]; then
  /linux-trenajor/qoshimcha.sh > /tmp/qoshimcha.txt 2>&1 || { echo "[stage2] qoshimcha.sh: xato"; tail -10 /tmp/qoshimcha.txt | sed 's/^/[stage2]   /'; }
  echo "[stage2] qoshimcha.sh bajarildi"
fi

cd /
# Arxivlash yangi jarayonda: dpkg shu skript ishlayotganda libc6'ni yangilagan — bu shell va undan ochilgan subshell'lar
# eski, o'chirilgan libc.so.6 bilan ishlaydi. 9p'da o'chirilgan faylni qayta o'qib bo'lmaydi: sahifalari keshdan
# chiqsa, jarayon yiqiladi (CI'da: "stage2.sh: segfault ... in libc.so.6 (deleted)"; tar "Exiting with failure status",
# chala tasvir). exec bilan yangi sh joriy libc'ni yuklaydi.
cat > /run/arxiv.sh <<'ARXIV'
# katta faylni emulyatordan bir urinishda o'qib bo'lmaydi — 48 MB'lik bo'laklar
mkdir -p /natija
cd /
# tar natijasi tekshiriladi va 3 martagacha qayta uriniladi; bo'lmasa TAR_XATO — stage2.mjs yig'ishni to'xtatadi
urinish=1
while :; do
  rm -f /natija/qism.*
  # endi yangi jarayondamiz — keshni tozalash xavfsiz (CI'da 512 MB'da "Cannot savedir: Cannot allocate memory" bo'lgan)
  sync; echo 3 > /proc/sys/vm/drop_caches
  { tar --numeric-owner -cf - --exclude=./proc --exclude=./sys --exclude=./dev --exclude=./run \
      --exclude=./natija --exclude=./linux-trenajor --exclude=./tmp/xato.txt . \
      2> /run/tar-xato.txt; echo $? > /run/tar-kod; } | split -b 48M --filter='cat > $FILE && sync' - /natija/qism.
  # 9p cache=loose: yozilgan ma'lumot avval VM keshida (xotirada) turadi — har bo'lakdan keyin va oxirida sync:
  # xotira to'lmaydi va host o'qishidan oldin hammasi diskda bo'ladi
  sync
  [ "$(cat /run/tar-kod)" = 0 ] && break
  echo "[stage2] tar xatosi (urinish $urinish, kod $(cat /run/tar-kod)):"
  head -15 /run/tar-xato.txt | sed 's/^/[stage2]   /'
  urinish=$((urinish + 1))
  if [ $urinish -gt 3 ]; then echo "[stage2] TAR_XATO"; while true; do sleep 3600; done; fi
done
echo "[stage2] TAR_TAYYOR $(cat /natija/qism.* | wc -c) $(cd /natija && echo qism.*)"
while true; do sleep 3600; done
ARXIV
exec /bin/sh /run/arxiv.sh
