#!/bin/sh
# Web asoslari laboratoriyasi: sahifa ikkinchi serial port (/dev/ttyS1) orqali "ID BASE64" qatorini yuboradi —
# base64 ichida sh skript (curl so'rovi). Natija bitta qatorda qaytadi: "LAB ID BASE64(chiqish)".
T=/dev/ttyS1
stty -F $T raw -echo 115200 2>/dev/null
# Port avval o'qish uchun ochiladi, keyin "tayyor" yuboriladi — aks holda sahifa tayyor'dan so'ng darhol yuborgan
# birinchi so'rov port hali ochilmagan paytga to'g'ri kelib, yo'qolishi mumkin.
exec 3< $T
printf 'LAB tayyor -\n' > $T
while IFS=' ' read -r id kod <&3; do
  [ -n "$id" ] && [ -n "$kod" ] || continue
  printf '%s' "$kod" | base64 -d > /run/lab-sorov.sh 2>/dev/null || continue
  natija=$(sh /run/lab-sorov.sh 2>&1 | head -c 200000 | base64 -w0)
  printf 'LAB %s %s\n' "$id" "$natija" > $T
  : > /run/nginx-kuzatuv/debug.log 2>/dev/null   # nginx debug log'i bu yerda kerak emas
done
