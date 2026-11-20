# Yo'ldagi kuzatuvchi: bitta login formasi (POST) — avval ochiq HTTP, keyin HTTPS. Yozuv routerda (uy tarmog'i tomoni) —
# ochiq Wi-Fi egasi yoki o'rtaga kirgan qurilma ko'radigan narsa. Login/parol — faqat laboratoriya uchun sinov qiymatlari.
# SSLKEYLOGFILE — faqat darsda "ichida nima bor edi"ni ko'rsatish uchun; kuzatuvchida bu kalit yo'q.
curl -sS --http1.1 --resolve sayt.test:80:203.0.113.10 -d 'login=lab&parol=sinov-parol' \
  -w 'http: %{http_code}\n' http://sayt.test/kirish
sleep 1
SSLKEYLOGFILE=/tmp/kalitlar.log curl -sS --http1.1 --tlsv1.3 --cacert /tls/ildiz.pem --resolve sayt.test:443:203.0.113.10 \
  -d 'login=lab&parol=sinov-parol' -w 'https: %{http_code}\n' https://sayt.test/kirish
