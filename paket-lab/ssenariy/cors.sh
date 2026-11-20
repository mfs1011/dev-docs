# CORS: haqiqiy brauzer (headless Chromium) sayt.test/cors.html ni ochadi; sahifadagi JavaScript api.sayt.test ga uch so'rov
# yuboradi (GET, JSON bilan PUT, DELETE). CORS'ni brauzer qo'llaydi — shuning uchun curl emas.
# Nomlar DNS'siz (--host-resolver-rules); boshqa hamma nom topilmaydi, fon tarmoq xizmatlari o'chirilgan — yozuvda faqat dars paketlari.
chromium --headless --no-sandbox --disable-gpu --no-first-run --disable-background-networking --disable-component-update \
  --disable-sync --disable-default-apps --metrics-recording-only --disable-features=MediaRouter,OptimizationHints \
  --host-resolver-rules='MAP sayt.test 203.0.113.10, MAP api.sayt.test 203.0.113.10, MAP * ~NOTFOUND' \
  --virtual-time-budget=5000 --dump-dom http://sayt.test/cors.html 2>/dev/null | sed -n '/<pre/,/<\/pre>/p'
