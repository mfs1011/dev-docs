#!/usr/bin/env bash
# Videoning asl (1080p) nusxasini Google Drive'ga arxivlaydi: video/<nom>/full.mp4 -> gdrive:dev-docs/video/<nom>/
# Bir martalik sozlash: rclone config create gdrive drive scope=drive.file
# Ishlatish: video/arxiv.sh git-umumiy   (nomsiz — hamma papkalar)
set -euo pipefail
cd "$(dirname "$0")"
REMOTE="${VIDEO_ARXIV_REMOTE:-gdrive:dev-docs/video}"

# Testing rejimidagi OAuth ilovada ruxsat 7 kunda eskiradi — aniq ko'rsatma beramiz
if ! err=$(rclone lsf "${REMOTE%%:*}:" --max-depth 1 2>&1 >/dev/null); then
  if grep -qiE "invalid_grant|token.*(expired|revoked)" <<<"$err"; then
    echo "Google Drive ruxsati eskirgan. Qayta ulang: rclone config reconnect ${REMOTE%%:*}:" >&2
  else
    echo "$err" >&2
  fi
  exit 1
fi

names=("$@")
[ ${#names[@]} -eq 0 ] && names=($(ls -d */ | tr -d /))

for name in "${names[@]}"; do
  src="$name/full.mp4"
  if [ ! -f "$src" ]; then echo "o'tkazildi: $src yo'q"; continue; fi
  rclone copy "$src" "$REMOTE/$name" --progress
  # Hajm va hash bo'yicha solishtirish: Drive'dagi nusxa to'liq yetib bordimi
  rclone check "$name" "$REMOTE/$name" --one-way --include full.mp4 && echo "✓ $name — Drive'dagi nusxa mos"
done
