# HTTP/3: haqiqiy brauzer (headless Chromium) https://sayt.test/h3.html ni QUIC (UDP 443) orqali ochadi; sahifa uslub va
# skriptni chaqiradi — bitta QUIC ulanishda uch so'rov. Chromium hujjati ("Playing with QUIC"): o'z CA'si bilan QUIC uchun
# --origin-to-force-quic-on va leaf sertifikat SPKI xeshi bilan --ignore-certificate-errors-spki-list kerak.
# SSLKEYLOGFILE — QUIC paketlari shifrlangan, laboratoriya yozuvini ochish uchun.
SPKI=$(openssl x509 -pubkey -noout -in /tls/sayt.pem | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64)
SSLKEYLOGFILE=/tmp/kalitlar.log chromium --headless --no-sandbox --disable-gpu --no-first-run --disable-background-networking \
  --disable-component-update --disable-sync --disable-default-apps --metrics-recording-only \
  --disable-features=MediaRouter,OptimizationHints --user-data-dir=/tmp/profil \
  --enable-quic --origin-to-force-quic-on=sayt.test:443 --ignore-certificate-errors-spki-list="$SPKI" \
  --host-resolver-rules='MAP sayt.test 203.0.113.10, MAP * ~NOTFOUND' \
  --virtual-time-budget=5000 --dump-dom https://sayt.test/h3.html 2>/dev/null | grep -o '<title>[^<]*</title>\|<h1>[^<]*</h1>'
