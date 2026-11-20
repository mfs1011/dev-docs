# Aralash kontent va SRI: haqiqiy brauzer (headless Chromium) https://sayt.test/aralash.html ni ochadi. Sahifada http:// rasm
# (brauzer https ga o'tkazadi), http:// skript (bloklanadi), integrity'li ikki skript (biri mos, biri mos emas).
# Natija sahifaning o'zida (onload/onerror) va Chromium konsolida. HTTPS ichi — SSLKEYLOGFILE. Laboratoriya CA'si — leaf SPKI.
SPKI=$(openssl x509 -pubkey -noout -in /tls/sayt.pem | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64)
SSLKEYLOGFILE=/tmp/kalitlar.log chromium --headless --no-sandbox --disable-gpu --no-first-run --disable-background-networking \
  --disable-component-update --disable-sync --disable-default-apps --metrics-recording-only \
  --disable-features=MediaRouter,OptimizationHints --user-data-dir=/tmp/profil --disable-quic --enable-logging=stderr --v=0 \
  --ignore-certificate-errors-spki-list="$SPKI" \
  --host-resolver-rules='MAP sayt.test 203.0.113.10, MAP * ~NOTFOUND' \
  --virtual-time-budget=10000 --dump-dom https://sayt.test/aralash.html 2>/tmp/konsol.txt | sed -n '/<pre/,/<\/pre>/p' | sed 's/<[^>]*>//g'
echo '--- konsol:'
grep -iE 'mixed content|integrity|upgrad' /tmp/konsol.txt | sed 's/^.*\] //' | cut -c1-280
