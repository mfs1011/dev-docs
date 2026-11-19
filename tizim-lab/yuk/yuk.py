# Ochiq tsiklli yuklama: so'rovlar javobni kutmasdan, belgilangan tezlikda yuboriladi (haqiqiy foydalanuvchilar kabi).
# Ishlatish: python3 yuk.py <url_asosi> <so'rov/s> <soniya> <naqsh, masalan tez,tez,ogir> [to'xtatish_soniyasi]
# Natija (stdout, JSON): p50, p95, xatolar, har server ulushi, birinchi so'rovlar ketma-ketligi, vaqt bo'yicha.
import json, sys, time, threading, http.client
from concurrent.futures import ThreadPoolExecutor

asos, tezlik, davom, naqsh = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4].split(',')
host, port = asos.split(':')
natija, qulf = [], threading.Lock()

def sorov(i, yol, t0):
    bosh = time.monotonic()
    try:
        c = http.client.HTTPConnection(host, int(port), timeout=10)
        c.request('GET', '/' + yol)
        r = c.getresponse(); r.read()
        kod, server = r.status, r.getheader('X-Upstream', '?')
        c.close()
    except Exception as e:
        kod, server = 0, 'xato'
    with qulf:
        natija.append({'i': i, 'yol': yol, 'kod': kod, 'server': server, 'ms': (time.monotonic() - bosh) * 1000, 'at': bosh - t0})

t0 = time.monotonic()
with ThreadPoolExecutor(max_workers=400) as ex:
    n = int(tezlik * davom)
    for i in range(n):
        kerak = t0 + i / tezlik
        while (d := kerak - time.monotonic()) > 0: time.sleep(d)
        ex.submit(sorov, i, naqsh[i % len(naqsh)], t0)

natija.sort(key=lambda x: x['i'])
def foiz(xs, p):
    xs = sorted(xs); return round(xs[min(len(xs) - 1, int(len(xs) * p))], 1) if xs else None
ok = [x for x in natija if x['kod'] == 200]
serverlar = {}
for x in ok: serverlar[x['server']] = serverlar.get(x['server'], 0) + 1
ogir = {}
for x in ok:
    if x['yol'] == 'ogir': ogir[x['server']] = ogir.get(x['server'], 0) + 1
print(json.dumps({
    'sorovlar': len(natija), 'tezlik': tezlik, 'soniya': davom, 'naqsh': naqsh,
    'p50': foiz([x['ms'] for x in ok], .50), 'p95': foiz([x['ms'] for x in ok], .95),
    'p95_tez': foiz([x['ms'] for x in ok if x['yol'] == 'tez'], .95),
    'xato': len(natija) - len(ok), 'xato_foiz': round(100 * (len(natija) - len(ok)) / max(1, len(natija)), 2),
    'serverlar': serverlar, 'ogir_serverlar': ogir,
    'ketma': [x['server'] for x in natija[:12]],
    'har_soniya': [{'s': s, 'p95': foiz([x['ms'] for x in ok if s <= x['at'] < s + 1], .95), 'xato': sum(1 for x in natija if s <= x['at'] < s + 1 and x['kod'] != 200)} for s in range(int(davom))],
}))
