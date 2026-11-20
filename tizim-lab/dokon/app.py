# Kesh darsi ilovasi: mahsulot kartochkasi = PostgreSQL'dagi og'ir so'rov (indekssiz, 500 000 sharhdan o'rtacha baho) yoki
# Redis'dagi nusxa (cache-aside, Arxitektura 25-bob). Ko'p oqimli (ThreadingHTTPServer). Hisoblagichlar — /statistika.
#   GET  /mahsulot/<id>                — kartochka (sozlamaga qarab keshli yoki keshsiz)
#   GET  /db/<id>                      — to'g'ridan-to'g'ri DB (solishtirish uchun)
#   POST /narx/<id>?narx=N&invalid=0|1 — narxni o'zgartirish; invalid=1 bo'lsa kesh kaliti o'chiriladi
#   POST /sozla?kesh=1&ttl=60&qulf=0   — rejim; POST /nol — hisoblagich va keshni tozalash; GET /statistika
import json, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
import psycopg, redis

R = redis.Redis(host='10.70.0.21')
YER = threading.local()
SOZ = {'kesh': True, 'ttl': 60, 'qulf': False}
STAT = {'db': 0, 'hit': 0, 'miss': 0, 'kutdi': 0}
Q = threading.Lock()
SQL = ('select m.id, m.nom, m.narx, round(avg(s.baho), 2) from mahsulot m join sharh s on s.mahsulot_id = m.id '
       'where m.id = %s group by m.id')

def db():
    if not hasattr(YER, 'c'):
        YER.c = psycopg.connect('host=10.70.0.20 user=postgres password=lab dbname=dokon', autocommit=True)
    return YER.c

def sana(k):
    with Q: STAT[k] += 1

def hisobla(i):
    sana('db')
    r = db().execute(SQL, (i,)).fetchone()
    return {'id': r[0], 'nom': r[1], 'narx': r[2], 'baho': float(r[3])}

def ol(i):
    if not SOZ['kesh']:
        return hisobla(i)
    k = f'mahsulot:v1:{i}'
    v = R.get(k)
    if v:
        sana('hit'); return json.loads(v)
    sana('miss')
    if SOZ['qulf']:  # faqat bittasi DB'ga boradi, qolganlari keshda paydo bo'lishini kutadi (25-bob, stampede himoyasi a)
        if R.set(k + ':qulf', '1', nx=True, ex=5):
            v = hisobla(i); R.set(k, json.dumps(v), ex=SOZ['ttl']); R.delete(k + ':qulf'); return v
        for _ in range(100):
            time.sleep(0.02)
            v = R.get(k)
            if v:
                sana('kutdi'); return json.loads(v)
    v = hisobla(i)
    R.set(k, json.dumps(v), ex=SOZ['ttl'])
    return v

class H(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.0'
    def javob(self, kod, obj):
        b = json.dumps(obj).encode()
        self.send_response(kod); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(b)))
        self.send_header('X-Upstream', 'dokon'); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        u = urlparse(self.path); q = u.path.strip('/').split('/')
        if q[0] == 'mahsulot': return self.javob(200, ol(int(q[1])))
        if q[0] == 'db': return self.javob(200, hisobla(int(q[1])))
        if q[0] == 'statistika': return self.javob(200, {**STAT, **SOZ})
        self.javob(404, {})
    def do_POST(self):
        u = urlparse(self.path); q = u.path.strip('/').split('/'); p = {k: v[0] for k, v in parse_qs(u.query).items()}
        if q[0] == 'narx':
            db().execute('update mahsulot set narx = %s where id = %s', (int(p['narx']), int(q[1])))
            if p.get('invalid') == '1': R.delete(f'mahsulot:v1:{q[1]}')
            return self.javob(200, {'ok': True})
        if q[0] == 'sozla':
            SOZ.update(kesh=p.get('kesh', '1') == '1', ttl=int(p.get('ttl', 60)), qulf=p.get('qulf', '0') == '1')
            return self.javob(200, SOZ)
        if q[0] == 'nol':
            with Q:
                for k in STAT: STAT[k] = 0
            R.flushdb(); return self.javob(200, {'ok': True})
        self.javob(404, {})
    def log_message(self, *a): pass

class S(ThreadingHTTPServer):
    request_queue_size = 512
    daemon_threads = True

S(('0.0.0.0', 8000), H).serve_forever()
