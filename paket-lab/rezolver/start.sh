# Uy tarmog'idagi rekursiv rezolver (masalan, provayder yoki routerdagi DNS o'rnida).
# Internetga router orqali chiqadi; yozuv shu konteynerning eth0 da olinadi — klient so'rovi ham,
# iyerarxiya bo'ylab so'rovlar ham bitta interfeysdan o'tadi.
ethtool -K eth0 gro off lro off 2>/dev/null || true
ip route replace default via 192.168.1.1
exec unbound -d -c /etc/unbound/lab.conf
