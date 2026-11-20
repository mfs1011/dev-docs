# Sayt ochilmayapti: bir xil curl, besh xil nosozlik — har qatlamda qanday ko'rinadi (Web asoslari, 30-bob).
# 1) DNS: bunday nom yo'q; 2) TCP: portda dastur yo'q (rad); 3) TCP: xavfsizlik devori jim tashlaydi (kutish);
# 4) TLS: sertifikatdagi nom mos emas; 5) HTTP: proxy orqasidagi ilova ishlamayapti (502). Har biri — alohida curl.
W='  -> %{http_code} (%{time_total} s)\n'
echo 1; curl -sS --http1.1 -o /dev/null -w "$W" http://yoq.sayt.test/ 2>&1
sleep 1
echo 2; curl -sS --http1.1 -o /dev/null -w "$W" http://sayt.test:8080/ 2>&1
sleep 1
echo 3; curl -sS --http1.1 --connect-timeout 4 -o /dev/null -w "$W" http://sayt.test:8081/ 2>&1
sleep 1
echo 4; SSLKEYLOGFILE=/tmp/kalitlar.log curl -sS --http1.1 --tlsv1.3 --cacert /tls/ildiz.pem --resolve www.sayt.test:443:203.0.113.10 \
  -o /dev/null -w "$W" https://www.sayt.test/ 2>&1
sleep 1
echo 5; curl -sS --http1.1 --resolve fayl.sayt.test:80:203.0.113.10 -o /dev/null -w "$W" http://fayl.sayt.test/tashqi 2>&1
