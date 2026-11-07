#!/bin/bash
# VPS'da buyruqlarni bajarib, bobga qo'yiladigan "$ buyruq + chiqish" ko'rinishida chiqaradi.
# VPS manzili va kalit repoda YO'Q: ~/.ssh/config da "Host lab" (HostName, User root, IdentityFile) bo'lishi kerak,
# ochiq IP esa VPS_IP muhit o'zgaruvchisida — chiqishda u 203.0.113.10 (RFC 5737) bilan almashtiriladi.
#   VPS_IP=x.x.x.x linux-trenajor/asboblar/vps.sh 'c ip -br addr; c "ss -tln | grep 22"'
#   (har buyruq oldiga c; quvurli buyruq qo'shtirnoq ichida)
: "${VPS_IP:?VPS_IP berilmagan}"
ssh lab 'export LANG=C.UTF-8; c(){ echo "\$ $*"; eval "$@" 2>&1; }; '"$1" \
  | sed "s/${VPS_IP//./\\.}/203.0.113.10/g"
