#!/usr/bin/env bash
# Videoning asl (1080p) nusxasini Google Drive'ga arxivlaydi: video/<nom>/full.mp4 -> gdrive:dev-docs/video/<nom>/
# Bir martalik sozlash: rclone config create gdrive drive scope=drive.file
# Ishlatish: video/arxiv.sh [papka...]  (argumentsiz — mavjud barcha full.mp4 larni yuklaydi)
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
if [ ${#names[@]} -eq 0 ]; then
  # Barcha full.mp4 fayllarini topish (1, 2 yoki 3-darajali papkalar)
  files=($(find . -mindepth 2 -maxdepth 3 -name "full.mp4" | sed 's|^\./||'))
  for src in "${files[@]}"; do
    dir="$(dirname "$src")"
    echo "Yuklanmoqda: $src -> $REMOTE/$dir/"
    rclone copy "$src" "$REMOTE/$dir" --progress
    rclone check "$dir" "$REMOTE/$dir" --one-way --include full.mp4 && echo "✓ $dir — Drive'dagi nusxa mos"
  done
else
  for name in "${names[@]}"; do
    if [ -f "$name/full.mp4" ]; then
      src="$name/full.mp4"
      dir="$name"
      echo "Yuklanmoqda: $src -> $REMOTE/$dir/"
      rclone copy "$src" "$REMOTE/$dir" --progress
      rclone check "$dir" "$REMOTE/$dir" --one-way --include full.mp4 && echo "✓ $dir — Drive'dagi nusxa mos"
    else
      for src in $(find "$name" -name "full.mp4" 2>/dev/null); do
        dir="$(dirname "$src")"
        echo "Yuklanmoqda: $src -> $REMOTE/$dir/"
        rclone copy "$src" "$REMOTE/$dir" --progress
        rclone check "$dir" "$REMOTE/$dir" --one-way --include full.mp4 && echo "✓ $dir — Drive'dagi nusxa mos"
      done
    fi
  done
fi
