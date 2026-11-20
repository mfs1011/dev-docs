# Kesh darsi: eskirgan qiymat va invalidatsiya ketma-ketligi (dokon ilovasi). Natija — JSON.
import json, sys, urllib.request
A = 'http://10.70.0.30:8000'
def so(m, yol):
    r = urllib.request.urlopen(urllib.request.Request(A + yol, method=m, data=b'' if m == 'POST' else None))
    return json.loads(r.read())
so('POST', '/sozla?kesh=1&ttl=60'); so('POST', '/nol')
n = {}
n['oldin'] = so('GET', '/mahsulot/1')['narx']
so('POST', '/narx/1?narx=99900&invalid=0')
n['db_invalidsiz'] = so('GET', '/db/1')['narx']; n['kesh_invalidsiz'] = so('GET', '/mahsulot/1')['narx']
so('POST', '/narx/1?narx=88800&invalid=1')
n['db_invalid'] = so('GET', '/db/1')['narx']; n['kesh_invalid'] = so('GET', '/mahsulot/1')['narx']
so('POST', '/narx/1?narx=10100&invalid=1')
print(json.dumps(n))
