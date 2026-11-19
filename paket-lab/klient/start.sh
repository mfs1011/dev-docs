# Uydagi noutbuk: chiqish yo'li — router, DNS — laboratoriya rezolveri (Docker'ning ichki DNS'i emas)
# Yozuv tarmoqdagidek bo'lsin: yadro qabul qilingan segmentlarni birlashtirmasin (GRO), har paket alohida
ethtool -K eth0 gro off lro off 2>/dev/null || true
ip route replace default via 192.168.1.1
echo "nameserver 203.0.113.53" > /etc/resolv.conf
exec sleep infinity
