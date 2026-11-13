#!/bin/sh
# 2-bosqich (emulyator ichida, PID 1 sifatida): debootstrap --second-stage kabi — haqiqiy dpkg paketlarni
# o'rnatadi va maintainer skriptlarini bajaradi. Oxirida tayyor tizim /natija.tar ga yoziladi.
export PATH=/usr/sbin:/usr/bin:/sbin:/bin DEBIAN_FRONTEND=noninteractive DEBCONF_NONINTERACTIVE_SEEN=true LC_ALL=C
mount -t proc proc /proc
mount -t sysfs sys /sys
mountpoint -q /dev || mount -t devtmpfs dev /dev
mount -t tmpfs tmpfs /run
echo "[stage2] boshlandi"

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
# katta faylni emulyatordan bir urinishda o'qib bo'lmaydi — 48 MB'lik bo'laklar
mkdir -p /natija
# tar xatosi tekshiriladi: CI'da (sekin protsessor, 512 MB) yadro xotira bosimida xato berib, tar ba'zi fayllarni
# o'tkazib yuborgan ("Exiting with failure status due to previous errors") — chala tasvirda servis ishga tushmay,
# holat.mjs soatlab kutib qolgan. Endi: kesh tozalanib qayta urinish, uch marta ham bo'lmasa — TAR_XATO.
urinish=1
while :; do
  rm -f /natija/qism.*
  sync; echo 3 > /proc/sys/vm/drop_caches
  { tar --numeric-owner -cf - --exclude=./proc --exclude=./sys --exclude=./dev --exclude=./run \
      --exclude=./natija --exclude=./linux-trenajor --exclude=./tmp/xato.txt --exclude=./tmp/tar-xato.txt . \
      2> /tmp/tar-xato.txt; echo $? > /tmp/tar-kod; } | split -b 48M - /natija/qism.
  # 9p cache=loose: yozilgan ma'lumot avval VM keshida turadi — host o'qishidan oldin sync shart
  sync
  [ "$(cat /tmp/tar-kod)" = 0 ] && break
  echo "[stage2] tar xatosi (urinish $urinish, kod $(cat /tmp/tar-kod)):"
  head -15 /tmp/tar-xato.txt | sed 's/^/[stage2]   /'
  urinish=$((urinish + 1))
  if [ $urinish -gt 3 ]; then echo "[stage2] TAR_XATO"; while true; do sleep 3600; done; fi
done
echo "[stage2] TAR_TAYYOR $(cat /natija/qism.* | wc -c) $(cd /natija && echo qism.*)"
while true; do sleep 3600; done
