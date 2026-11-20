# TLS 1.3: sinov CA zanjiri bilan HTTPS so'rov. DNS aralashmasin deb --resolve.
# SSLKEYLOGFILE — curl (OpenSSL) sessiya kalitlarini faylga yozadi; faqat shu laboratoriya yozuvini ochish uchun.
SSLKEYLOGFILE=/tmp/kalitlar.log curl -sS --http1.1 --tlsv1.3 --cacert /tls/ildiz.pem \
  --resolve sayt.test:443:203.0.113.10 -o /dev/null \
  -w 'http=%{http_code} tekshiruv=%{ssl_verify_result} tcp=%{time_connect} tls=%{time_appconnect} birinchi_bayt=%{time_starttransfer} jami=%{time_total}\n' \
  https://sayt.test/
