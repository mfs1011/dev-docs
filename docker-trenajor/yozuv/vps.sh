#!/bin/sh
# Yozib olish skriptlarini sinov VPS'iga ko'chirib, u yerda bajarish. Natija docker-trenajor/yozuv/natija/ ga qaytadi.
#   sh vps.sh katalog                       — katalog.json + fs/
#   sh vps.sh yoz ssenariylar/04-*.txt      — yozuvlar/<nom>.json (har ssenariy alohida fayl)
#   sh vps.sh host                          — host.txt (docker version/info VPS'ning o'zidan)
set -e
cd "$(dirname "$0")"
# Server manzili repo'da yozilmaydi: VPS — ssh config'dagi nom yoki user@host, SSH_KALIT — kalit fayli (ixtiyoriy)
#   VPS=root@<server> SSH_KALIT=~/.ssh/<kalit> sh vps.sh ...
VPS=${VPS:-lab}
SSH_OPT="${SSH_KALIT:+-i $SSH_KALIT -o IdentitiesOnly=yes}"
SSH="ssh $SSH_OPT $VPS"
UZOQ=/root/docker-trenajor-yozuv
tar cf - --exclude natija . | $SSH "rm -rf $UZOQ && mkdir -p $UZOQ && tar xf - -C $UZOQ"
mkdir -p natija/yozuvlar
case "$1" in
  katalog)
    $SSH "cd $UZOQ && rm -rf natija && python3 katalog.py pin.json natija"
    $SSH "cd $UZOQ/natija && tar cf - katalog.json fs" | tar xf - -C natija ;;
  host)
    # docker version/info VPS'ning o'zidan (kitobdagi muhit: Ubuntu 26.04, Compose v5.7.0, Buildx 0.38.1 — dind'da boshqacha)
    # daemon ID (machine-id kabi) yozilmaydi
    $SSH 'docker version; echo ===; docker info; echo ===; docker compose version; echo ===; docker buildx version; echo ===; docker --version' | sed -E 's/^ ID: .*/ ID: <yashirilgan>/' > natija/host.txt ;;
  yoz)
    shift
    for f in "$@"; do
      n=$(basename "$f" .txt)
      $SSH "cd $UZOQ && COLS=${COLS:-100} python3 yoz.py pin.json $f" > natija/yozuvlar/$n.json
    done ;;
esac
$SSH "docker rm -f dt-dind >/dev/null 2>&1 || true"
