#!/bin/bash
# havola.sh FAYL... — fayldagi barcha https havolalarni (#anchor'siz) tekshiradi, 200 bo'lmaganlarini chiqaradi.
#   linux-trenajor/asboblar/havola.sh content/linux/48-*.md
for f in "$@"; do
  n=0
  for u in $(grep -oE 'https://[^) >]+' "$f" | sed 's/#.*//' | sort -u); do
    n=$((n+1)); c=$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 30 -A 'Mozilla/5.0 docs-research' "$u")
    [ "$c" != 200 ] && echo "  $c $u"
  done
  echo "$f: $n havola"
done
