#!/usr/bin/env python3
"""Docker trenajori uchun haqiqiy chiqishlarni yozib olish (sinov VPS'ida ishlaydi).

Har ssenariy toza Docker Engine'da bajariladi: `docker:29.9.3-dind` konteyneri (docker-in-docker — konteyner ichidagi
alohida dockerd). VPS'ning o'z konteynerlari va image'lari chiqishga aralashmaydi.

Buyruqlar haqiqiy terminal (pty, 100x30) orqali bajariladi — o'quvchi trenajor terminalida ko'radigan ko'rinish
(masalan `docker pull` progress chiziqlari). Har bo'lak vaqti bilan saqlanadi: simulyator animatsiyani shu tezlikda
qayta ko'rsatadi.

Ssenariy fayli (ssenariylar/*.txt):
  $ buyruq            — yozib olinadi
  > davomi            — oldingi buyruqning keyingi qatori (heredoc)
  < matn              — buyruq ishlayotganda klaviaturadan yoziladigan qator (-it sessiya)
  <! \x03             — xom baytlar (masalan Ctrl+C)
  #! tayyor IMG ...   — image'larni oldindan yuklash (yozilmaydi; katalog.json dagi digest bo'yicha, keyin teg beriladi)
  #! sukut CMD        — buyruqni yozmasdan bajarish (fayl tayyorlash va h.k.)
  #! kut N            — N soniya kutish
  # ...               — izoh

Foydalanish: python3 yoz.py katalog.json ssenariylar/04-konteynerlar.txt ... > natija.json
"""
import json, os, pty, select, subprocess, sys, time, fcntl, termios, struct

DIND = 'dt-dind'
DIND_IMAGE = 'docker:29.9.3-dind'
COLS, ROWS = int(os.environ.get('COLS', 100)), 30
CTR = 'ctr --address /var/run/docker/containerd/containerd.sock -n moby'


def sh(*a, check=True, **kw):
    return subprocess.run(a, check=check, capture_output=True, text=True, **kw)


def dind_ishga():
    sh('docker', 'rm', '-f', DIND, check=False)
    # mirror.gcr.io — Google'ning ochiq Docker Hub nusxasi: Docker Hub'ning anonim so'rov limiti (429) tugaganda ham
    # digest bo'yicha yuklash ishlaydi. Chiqish matni o'zgarmaydi (nom baribir docker.io/...).
    sh('docker', 'run', '-d', '--privileged', '--name', DIND, '--hostname', 'lab', DIND_IMAGE, '--registry-mirror=https://mirror.gcr.io')
    for _ in range(120):
        if sh('docker', 'exec', DIND, 'docker', 'info', check=False).returncode == 0:
            break
        time.sleep(0.5)
    else:
        raise SystemExit('dind dockerd ishga tushmadi')
    # host qobig'i uchun: bash va curl (kitobdagi VPS kabi)
    sh('docker', 'exec', DIND, 'apk', 'add', '-q', 'bash', 'curl', 'coreutils', 'grep')


def ichida(cmd, check=True):
    return sh('docker', 'exec', '-w', '/root', DIND, 'bash', '-c', cmd, check=check)


def tozala():
    ichida('docker rm -f $(docker ps -aq) >/dev/null 2>&1; docker volume rm $(docker volume ls -q) >/dev/null 2>&1; '
           'docker network prune -f >/dev/null; docker builder prune -af >/dev/null 2>&1; '
           'find /root -mindepth 1 -not -name ".*" -exec rm -rf {} + ; true', check=False)


def tayyorla(katalog, nomlar):
    for nom in nomlar:
        k = katalog[nom]
        ref = f"{k['repo']}@{k['digest']}"
        ichida(f'docker pull -q {ref} >/dev/null && docker tag {ref} {nom} && ' + CTR + f' images rm docker.io/library/{ref} >/dev/null')


def pty_bajar(cmd, kirish=()):
    """Buyruqni pty ichida bajarish: [(ms, matn), ...], chiqish kodi. kirish — klaviaturadan yoziladigan qatorlar."""
    argv = ['docker', 'exec', '-it', '-w', '/root', '-e', f'COLUMNS={COLS}', '-e', f'LINES={ROWS}', '-e', 'TERM=xterm-256color',
            DIND, 'bash', '-c', cmd]
    pid, fd = pty.fork()
    if pid == 0:
        os.execvp(argv[0], argv)
    fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack('HHHH', ROWS, COLS, 0, 0))
    t0 = time.monotonic()
    bolaklar = []
    navbat = list(kirish)
    keyingi = t0 + 1.5
    while True:
        if navbat and time.monotonic() >= keyingi:
            x = navbat.pop(0)
            # '<! \x03' — xom baytlar (Ctrl+C va h.k.), aks holda qator + Enter
            os.write(fd, x[3:].encode().decode('unicode_escape').encode('latin-1') if x.startswith('!! ') else (x + '\r').encode())
            keyingi = time.monotonic() + 1.5
        r, _, _ = select.select([fd], [], [], 0.05)
        if r:
            try:
                d = os.read(fd, 65536)
            except OSError:
                break
            if not d:
                break
            bolaklar.append([round((time.monotonic() - t0) * 1000), d.decode('utf-8', 'replace')])
    _, st = os.waitpid(pid, 0)
    os.close(fd)
    return bolaklar, os.waitstatus_to_exitcode(st), round((time.monotonic() - t0) * 1000)


def ssenariy(yol, katalog):
    qatorlar = open(yol, encoding='utf-8').read().splitlines()
    buyruqlar, joriy = [], None
    for q in qatorlar:
        if q.startswith('> ') or q == '>':
            joriy['cmd'] += '\n' + q[2:]
            continue
        if q.startswith('<! '):
            joriy.setdefault('kirish', []).append('!! ' + q[3:])
            continue
        if q.startswith('< ') or q == '<':
            joriy.setdefault('kirish', []).append(q[2:])
            continue
        if joriy:
            buyruqlar.append(joriy)
            joriy = None
        if q.startswith('$ '):
            joriy = {'cmd': q[2:]}
        elif q.startswith('#! '):
            buyruqlar.append({'direktiva': q[3:]})
    if joriy:
        buyruqlar.append(joriy)

    tozala()
    natija = []
    for b in buyruqlar:
        if 'direktiva' in b:
            nom, _, arg = b['direktiva'].partition(' ')
            if nom == 'tayyor':
                tayyorla(katalog, arg.split())
            elif nom == 'sukut':
                ichida(arg, check=False)
            elif nom == 'kut':
                time.sleep(float(arg))
            natija.append({'direktiva': b['direktiva']})
            continue
        bolaklar, kod, ms = pty_bajar(b['cmd'], b.get('kirish', ()))
        out = ''.join(x for _, x in bolaklar)
        yozuv = {'cmd': b['cmd'], 'out': out, 'kod': kod, 'ms': ms}
        if b.get('kirish'):
            yozuv['kirish'] = b['kirish']
        if ms > 400 and len(bolaklar) > 1:
            yozuv['bolaklar'] = bolaklar
        natija.append(yozuv)
        print(f"  {b['cmd'][:70]!r} -> {kod} ({ms} ms)", file=sys.stderr)
    return {'ssenariy': os.path.basename(yol), 'buyruqlar': natija}


def main():
    katalog = json.load(open(sys.argv[1]))
    dind_ishga()
    versiya = ichida('docker version --format "{{.Server.Version}}"').stdout.strip()
    sana = time.strftime('%Y-%m-%d')
    natija = {'docker': versiya, 'sana': sana, 'terminal': [COLS, ROWS], 'ssenariylar': []}
    for yol in sys.argv[2:]:
        print(yol, file=sys.stderr)
        natija['ssenariylar'].append(ssenariy(yol, katalog))
    json.dump(natija, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
