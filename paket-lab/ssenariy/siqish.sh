# Siqish va qism: bitta TCP ulanishda uch so'rov (curl --next ulanishni qayta ishlatadi):
# 1) Accept-Encoding'siz — to'liq sahifa; 2) Accept-Encoding: gzip — siqilgan; 3) Range: bytes=0-99 — 206, faqat 100 bayt.
# Ochiq HTTP — sarlavhalar yozuvda ko'rinsin. DNS aralashmasin deb --resolve.
curl -sS --http1.1 --resolve sayt.test:80:203.0.113.10 \
  -o /dev/null -w '1: http=%{http_code} hajm=%{size_download}\n' http://sayt.test/ \
  --next -H 'Accept-Encoding: gzip' -o /tmp/siqilgan.gz -w '2: http=%{http_code} hajm=%{size_download}\n' http://sayt.test/ \
  --next -r 0-99 -o /tmp/qism -w '3: http=%{http_code} hajm=%{size_download}\n' http://sayt.test/
gzip -dc /tmp/siqilgan.gz | wc -c
wc -c < /tmp/qism
