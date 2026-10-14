# SQLite CLI'ni soxta terminalda (pty) boshqaradi: TTY'dagi haqiqiy ko'rinish (prompt, box jadval) yozib olinadi
import os, pty, sys, time, re, select
cmds = [l.rstrip('\n') for l in open(sys.argv[2]) if l.strip()]
pid, fd = pty.fork()
if pid == 0:
    os.environ['COLUMNS'] = '100'; os.environ['LINES'] = '40'
    args = sys.argv[3:] or [':memory:']
    os.execv(sys.argv[1], [sys.argv[1], *args])
out = b''
def drain(t=0.6):
    global out
    end = time.time() + t
    while time.time() < end:
        r, _, _ = select.select([fd], [], [], 0.05)
        if r:
            try: out += os.read(fd, 65536)
            except OSError: return
drain(1.0)
for c in cmds:
    os.write(fd, (c + '\n').encode()); drain(0.6)
os.write(fd, (os.environ.get('QUIT', '.quit') + '\n').encode()); drain(0.4)
text = out.decode('utf-8', 'replace')
text = re.sub(r'\x1b\[[0-9;?]*[A-Za-z]', '', text).replace('\r', '')
print(text)
