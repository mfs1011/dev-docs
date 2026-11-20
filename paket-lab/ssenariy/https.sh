# HTTPS: vaqt qayerga ketadi. Bitta sahifa uch xil: ochiq HTTP, HTTPS TLS 1.2 bilan, HTTPS TLS 1.3 bilan.
# Har biri — yangi curl: DNS so'rovi (laboratoriya DNS'i, --resolve yo'q), yangi TCP, kerak bo'lsa TLS, keyin GET.
# curl -w vaqtlari — so'rov boshidan jamlanib boradi (curl hujjati, --write-out). SSLKEYLOGFILE — yozuvni ochish uchun.
W='%{url} dns=%{time_namelookup} tcp=%{time_connect} tls=%{time_appconnect} birinchi_bayt=%{time_starttransfer} jami=%{time_total}\n'
curl -sS --http1.1 -o /dev/null -w "$W" http://sayt.test/
sleep 1
SSLKEYLOGFILE=/tmp/kalitlar.log curl -sS --http1.1 --tlsv1.2 --tls-max 1.2 --cacert /tls/ildiz.pem -o /dev/null -w "$W" https://sayt.test/
sleep 1
SSLKEYLOGFILE=/tmp/kalitlar.log curl -sS --http1.1 --tlsv1.3 --cacert /tls/ildiz.pem -o /dev/null -w "$W" https://sayt.test/
