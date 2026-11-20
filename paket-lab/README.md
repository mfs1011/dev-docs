# Paket yo'li laboratoriyasi

"Paket yo'li" darslari (`/paketlar`) uchun haqiqiy paket yozuvlari shu yerda olinadi. Reja:
[docs/vizualizator/paket-yoli.md](../docs/vizualizator/paket-yoli.md) 3-bo'lim.

Sinov VPS'ida ishlaydi (Docker Compose, `tshark` VPS'ning o'zida). Tarmoqlar `internal: true` — internetga chiqmaydi,
manzillar hujjatlar uchun ajratilgan diapazonlardan (`192.168.1.0/24` uy tarmog'i, `203.0.113.0/24` "internet").

| Konteyner | Manzil | Nima |
| --- | --- | --- |
| `klient` | 192.168.1.10 | curl, tcpdump; GRO o'chirilgan, DNS — laboratoriya rezolveri |
| `router` | 192.168.1.1 / 203.0.113.1 | NAT (`MASQUERADE`), har tomonga 10 ms `netem`, GSO/TSO o'chirilgan (paketlar ≤ 1514 bayt) |
| `dns` | 203.0.113.53 | dnsmasq: `sayt.test` → 203.0.113.10, `.test` mahalliy zona |
| `veb` | 203.0.113.10 | nginx 1.30.6, ~5,6 KB sahifa (bir nechta TCP segmentiga bo'linadi) |

Profil `dns` (faqat DNS darsi uchun, boshqa darslarga ta'sir qilmaydi):

| Konteyner | Manzil | Nima |
| --- | --- | --- |
| `rezolver` | 192.168.1.53 | Unbound — rekursiv rezolver, ildiz ro'yxati `rezolver/ildiz.hints` (laboratoriya ildizi), DNSSEC'siz |
| `ildiz` | 203.0.113.101 | NSD — ildiz zonasi `.`, `test.` ni `ns.test` ga topshiradi |
| `tld` | 203.0.113.102 | NSD — `test.` zonasi, `sayt.test.` ni `ns.sayt.test` ga topshiradi |
| `domen` | 203.0.113.103 | NSD — `sayt.test.` zonasi: `A 203.0.113.10`, TTL 300 |

```bash
./yoz.sh http-1-1        # ssenariy/http-1-1.sh ni klientda bajaradi, klient tomonida tcpdump → chiqish/http-1-1.pcap
./eksport.sh http-1-1    # tshark: .pdml (maydonlar, pos/size), .cols (jadval), .hex (baytlar)
# noutbukda:
rsync -az lab:/root/paket-lab/chiqish/ <papka>/
TAQIQ="<vps-ip>,…" node scripts/paket/aylantir.mjs <papka> http-1-1   # → src/sahna/paket/yozuvlar/http-1-1.json
```

DNS darsi: yozuv rezolverning interfeysida olinadi (klient so'rovi ham, iyerarxiya bo'ylab so'rovlar ham ko'rinadi):

```bash
PROFIL=dns QAYERDA=rezolver ./yoz.sh dns
```

`TAQIQ` — natijada uchramasligi kerak bo'lgan qatorlar (VPS'ning haqiqiy IP'si va h.k.); uchrasa fayl yozilmaydi.

Saboqlar:

- `veth` orqali katta GSO bloklari (2896 bayt) bo'linmasdan o'tadi — router'da `ethtool -K … gso off tso off`.
- dnsmasq'da `--local=/test/` bo'lmasa AAAA so'roviga `REFUSED` qaytadi; bilan — NODATA (to'g'ri javob).
- Unbound `.test` ni sukut bo'yicha o'zi NXDOMAIN bilan yopadi (RFC 6761 6.2) — `local-zone: "test." nodefault` kerak.
- Unbound QNAME minimisation (RFC 9156) bilan ishlaydi: ildizga to'liq nom emas, faqat `test` so'raladi.
- tshark `/root` dagi faylni o'qishni rad etdi ("permission") — fayl stdin orqali beriladi (`tshark -r - < fayl`).
