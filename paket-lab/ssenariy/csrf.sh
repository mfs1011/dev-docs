# CSRF: haqiqiy brauzer (headless Chromium). 1) https://sayt.test/csrf/kirish — ikki cookie (SameSite=Lax va None);
# 2) o'sha sahifa o'z saytiga POST qiladi (fetch); 3) http://yomon.test/hujum.html ga o'tadi — u sayt.test ga forma yuboradi.
# Server har POST'da ko'rgan Cookie va Sec-Fetch-Site ni qaytaradi. Laboratoriya CA'si uchun leaf SPKI (http3 darsidagidek).
SPKI=$(openssl x509 -pubkey -noout -in /tls/sayt.pem | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64)
SSLKEYLOGFILE=/tmp/kalitlar.log chromium --headless --no-sandbox --disable-gpu --no-first-run --disable-background-networking \
  --disable-component-update --disable-sync --disable-default-apps --metrics-recording-only \
  --disable-features=MediaRouter,OptimizationHints --user-data-dir=/tmp/profil --disable-quic \
  --ignore-certificate-errors-spki-list="$SPKI" \
  --host-resolver-rules='MAP sayt.test 203.0.113.10, MAP yomon.test 203.0.113.10, MAP * ~NOTFOUND' \
  --virtual-time-budget=8000 --dump-dom https://sayt.test/csrf/kirish 2>/dev/null | sed 's/<[^>]*>/ /g' | tr -s ' '
