# HTTP/2: bitta TLS ulanishda uch so'rov parallel (-Z). ALPN'da h2 kelishiladi, har so'rov — alohida oqim (stream).
# SSLKEYLOGFILE — HTTP/2 kadrlari shifrlangan, laboratoriya yozuvini ochish uchun. DNS aralashmasin deb --resolve.
SSLKEYLOGFILE=/tmp/kalitlar.log curl -sS --http2 -Z --cacert /tls/ildiz.pem --resolve sayt.test:443:203.0.113.10 \
  -w '%{url} http=%{http_code} versiya=%{http_version} hajm=%{size_download} ulanish=%{num_connects}\n' \
  -o /dev/null https://sayt.test/ -o /dev/null https://sayt.test/uslub.css -o /dev/null https://sayt.test/ilova.js
