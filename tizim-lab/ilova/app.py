# Laboratoriya ilovasi: bir vaqtda BITTA so'rovni bajaradi (oddiy HTTPServer, oqimsiz).
# /tez — 20 ms ish, /ogir — 300 ms ish (time.sleep bilan; ish vaqti aniq bo'lishi uchun — CPU raqobati
# o'lchovni buzmasin). Shuning uchun bitta nusxa sekundiga ko'pi bilan ~50 ta /tez ga ulguradi.
import os, time
from http.server import BaseHTTPRequestHandler, HTTPServer

NOM = os.environ.get('NOM', '?')
ISH = {'/tez': 0.020, '/ogir': 0.300}

class H(BaseHTTPRequestHandler):
    # Javob bitta yozuv bilan ketadi (bufer) va Nagle o'chirilgan: aks holda sarlavha va tana alohida paket bo'lib,
    # delayed ACK bilan har javobga ~40 ms qo'shiladi. HTTP/1.0 — har so'rovdan keyin ulanish yopiladi
    # (bitta oqimli server bo'sh keep-alive ulanishda qotib qolmasin).
    protocol_version = 'HTTP/1.0'
    wbufsize = 65536
    disable_nagle_algorithm = True
    def do_GET(self):
        t = ISH.get(self.path.split('?')[0])
        if t is None:
            self.send_response(404); self.send_header('Content-Length', '0'); self.end_headers(); return
        time.sleep(t)
        body = NOM.encode()
        self.send_response(200)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('X-Server', NOM)
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *a):
        pass

class S(HTTPServer):
    request_queue_size = 512

S(('0.0.0.0', 8000), H).serve_forever()
