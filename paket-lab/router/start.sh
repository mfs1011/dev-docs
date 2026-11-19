# Haqiqiy NAT va kechikish: uy tarmog'idan chiqqan paket manbasi router manziliga almashadi;
# internet tomoniga 10 ms (borib-kelish ~20 ms) kechikish — laboratoriya bir mashinada bo'lgani uchun.
WAN=$(ip -o -4 addr show | awk '/203\.0\.113\.1\//{print $2}')
iptables-legacy -t nat -A POSTROUTING -o "$WAN" -j MASQUERADE 2>/dev/null || iptables -t nat -A POSTROUTING -o "$WAN" -j MASQUERADE
LAN=$(ip -o -4 addr show | awk '/192\.168\.1\.1\//{print $2}')
# Router paketlarni simdagidek (≤1514 bayt) uzatsin: katta GSO/TSO bloklari dasturiy bo'linadi
ethtool -K "$WAN" gro off gso off tso off 2>/dev/null || true
ethtool -K "$LAN" gro off gso off tso off 2>/dev/null || true
tc qdisc add dev "$WAN" root netem delay 10ms
tc qdisc add dev "$LAN" root netem delay 10ms
exec sleep infinity
