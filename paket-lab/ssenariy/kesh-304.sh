# Kesh va 304: 1-so'rov — 200 va ETag (curl uni faylga saqlaydi); 2-so'rov — If-None-Match bilan → 304, tanasiz.
# Ochiq HTTP — sarlavhalar yozuvda ko'rinsin. DNS aralashmasin deb --resolve.
curl -sS --http1.1 --resolve sayt.test:80:203.0.113.10 --etag-save /tmp/etag -o /dev/null -w '1: http=%{http_code} hajm=%{size_download}\n' http://sayt.test/
sleep 1
curl -sS --http1.1 --resolve sayt.test:80:203.0.113.10 --etag-compare /tmp/etag -o /dev/null -w '2: http=%{http_code} hajm=%{size_download}\n' http://sayt.test/
cat /tmp/etag
