#!/usr/bin/env python3
"""Trenajor katalogi: pin.json dagi har image haqidagi HAQIQIY ma'lumot (sinov VPS'ida, toza dind ichida).

- `docker image inspect` (Config: Cmd, Entrypoint, Env, ExposedPorts, WorkingDir, StopSignal ...);
- `docker image history --no-trunc` (har qatlam: yaratgan buyruq, hajm);
- registry manifest'lari (`buildx imagetools inspect --raw`): index, linux/amd64 manifest va uning attestation'i — pull
  paytidagi qatlamlar va ularning siqilgan hajmi;
- `docker image ls --format json` (DISK USAGE / CONTENT SIZE);
- fayl tizimi (`docker export` → tar): har yozuv nomi, turi, ruxsati, egasi, hajmi, vaqti, havola manzili; /etc va bir
  nechta papkadagi kichik matn fayllarining mazmuni.

Foydalanish: python3 katalog.py pin.json chiqish-papka/   (dt-dind konteyneri yoz.py bilan bir xil yaratiladi)
"""
import io, json, os, subprocess, sys, tarfile
sys.path.insert(0, os.path.dirname(__file__))
from yoz import dind_ishga, ichida, DIND, CTR  # noqa: E402

MAZMUN_PAPKALAR = ('etc/', 'usr/share/nginx/html/', 'docker-entrypoint', 'usr/lib/os-release', 'root/', 'home/')
MAZMUN_MAX = 16384


def fs_yoz(nom, chiqish):
    cid = ichida(f'docker create {nom} true').stdout.strip()
    tar = subprocess.run(['docker', 'exec', DIND, 'docker', 'export', cid], capture_output=True, check=True).stdout
    ichida(f'docker rm {cid} >/dev/null')
    yozuvlar = []
    with tarfile.open(fileobj=io.BytesIO(tar)) as t:
        for m in t:
            e = {'n': m.name, 'm': m.mode, 'u': m.uid, 'g': m.gid, 's': m.size, 't': int(m.mtime)}
            if m.issym():
                e['l'] = m.linkname
            elif m.islnk():
                e['h'] = m.linkname
            e['k'] = 'd' if m.isdir() else 'l' if m.issym() else 'f' if m.isreg() or m.islnk() else 'c' if m.ischr() else 'b' if m.isblk() else 'p'
            if m.isreg() and m.size <= MAZMUN_MAX and m.name.startswith(MAZMUN_PAPKALAR):
                d = t.extractfile(m).read()
                try:
                    e['c'] = d.decode('utf-8')
                except UnicodeDecodeError:
                    pass
            yozuvlar.append(e)
    fayl = nom.replace('/', '_').replace(':', '-') + '.json'
    json.dump(yozuvlar, open(os.path.join(chiqish, 'fs', fayl), 'w'), ensure_ascii=False, separators=(',', ':'))
    return fayl, len(yozuvlar)


def main():
    pin = {k: v for k, v in json.load(open(sys.argv[1])).items() if not k.startswith('_')}
    chiqish = sys.argv[2]
    os.makedirs(os.path.join(chiqish, 'fs'), exist_ok=True)
    dind_ishga()
    katalog = {}
    fslar = {}
    for nom, p in pin.items():
        ref = f"{p['repo']}@{p['digest']}"
        print(nom, file=sys.stderr)
        ichida(f'docker pull -q {ref} >/dev/null && docker tag {ref} {nom} && ' + CTR + f' images rm docker.io/library/{ref} >/dev/null')
        inspect = json.loads(ichida(f'docker image inspect {nom}').stdout)[0]
        history = [json.loads(q) for q in ichida(f"docker image history --no-trunc --format '{{{{json .}}}}' {nom}").stdout.splitlines()]
        ls = json.loads(ichida(f"docker image ls --format '{{{{json .}}}}' {nom}").stdout.splitlines()[0])
        # manifest'lar mirror.gcr.io dan o'qiladi (Docker Hub anonim limiti — 429); mazmuni va digest'i bir xil
        oyna = f"mirror.gcr.io/library/{p['repo']}"
        index = json.loads(ichida(f"docker buildx imagetools inspect --raw {oyna}@{p['digest']}").stdout)
        amd = next(m for m in index['manifests'] if m.get('platform', {}).get('architecture') == 'amd64' and m['platform'].get('os') == 'linux')
        manifest = json.loads(ichida(f"docker buildx imagetools inspect --raw {oyna}@{amd['digest']}").stdout)
        # amd64 uchun attestation (SBOM, provenance) — containerd uni ham yuklaydi, pull chiqishida ko'rinadi
        att = next((m for m in index['manifests'] if m.get('annotations', {}).get('vnd.docker.reference.digest') == amd['digest']), None)
        attestation = json.loads(ichida(f"docker buildx imagetools inspect --raw {oyna}@{att['digest']}").stdout) if att else None
        k = {'repo': p['repo'], 'digest': p['digest'], 'inspect': inspect, 'history': history, 'ls': ls,
             'index': index, 'manifest': manifest, 'manifestDigest': amd['digest'], 'attestation': attestation}
        if p['digest'] not in fslar:
            fslar[p['digest']] = fs_yoz(nom, chiqish)
        k['fs'], k['fsSoni'] = fslar[p['digest']]
        katalog[nom] = k
    # hajmlar: `docker image ls` (DISK USAGE, CONTENT SIZE) va `docker system df -v` — har image alohida (boshqasi yo'q
    # paytda) o'lchanadi, chunki umumiy qatlamlar ulushi boshqa image'larga bog'liq
    for nom in katalog:
        ichida('docker image ls -q | sort -u | xargs -r docker image rm -f >/dev/null 2>&1; true', check=False)
        p = pin[nom]
        ref = f"{p['repo']}@{p['digest']}"
        ichida(f'docker pull -q {ref} >/dev/null && docker tag {ref} {nom} && ' + CTR + f' images rm docker.io/library/{ref} >/dev/null')
        katalog[nom]['imageLs'] = ichida('docker image ls').stdout
        katalog[nom]['systemDf'] = ichida('docker system df').stdout
        katalog[nom]['systemDfV'] = ichida('docker system df -v --format json').stdout
    json.dump(katalog, open(os.path.join(chiqish, 'katalog.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
