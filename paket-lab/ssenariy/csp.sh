# CSP va clickjacking: haqiqiy brauzer (headless Chromium). 1) http://himoya.sayt.test/csp.html — CSP nonce'siz skriptlarni
# to'sadi va buzilish hisobotini /hisobot ga POST qiladi; 2) 1,5 s dan keyin http://yomon.test/ramka.html — u panel.html ni
# freymga qo'ymoqchi, panel esa X-Frame-Options: DENY bilan javob beradi. Brauzer konsoli stderr'da (--enable-logging).
chromium --headless --no-sandbox --disable-gpu --no-first-run --disable-background-networking --disable-component-update \
  --disable-sync --disable-default-apps --metrics-recording-only --disable-features=MediaRouter,OptimizationHints \
  --user-data-dir=/tmp/profil --enable-logging=stderr --v=0 \
  --host-resolver-rules='MAP himoya.sayt.test 203.0.113.10, MAP yomon.test 203.0.113.10, MAP * ~NOTFOUND' \
  --virtual-time-budget=15000 --dump-dom http://himoya.sayt.test/csp.html 2>/tmp/konsol.txt | sed 's/<[^>]*>/ /g' | tr -s ' \n' | head -5
echo '--- konsol:'
grep -iE 'refused|security policy|x-frame|frame-ancestors' /tmp/konsol.txt | sed 's/^.*\] //' | cut -c1-260
