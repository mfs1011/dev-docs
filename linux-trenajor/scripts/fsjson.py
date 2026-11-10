#!/usr/bin/env python3
"""<tar> -> <papka>/fs.json + <papka>/base/<sha256[:10]>.bin  (trenajor/scripts/fsjson.py ning parametrli nusxasi)

v86 ning 9p "JSON/HTTP" formati (version 3): har tugun [nom, hajm, mtime, mode, uid, gid, nishon],
nishon — papkada bolalar ro'yxati, symlink'da manzil, faylda base/ dagi fayl nomi.
Brauzer faylni faqat birinchi ochilganda yuklaydi.

  python3 linux-trenajor/scripts/fsjson.py build/stage1.tar build/fs-stage1
  python3 linux-trenajor/scripts/fsjson.py build/stage2.tar build/fs --zstd   # brauzer uchun: siqilgan

--zstd: fayl zstd bilan siqiladi va base/<hash>.bin.zst deb yoziladi — v86 nomi ".zst" bilan tugagan faylni
o'zi ochadi (load_from_server). Siqish 10% dan kam foyda bersa, fayl siqilmay qoladi.
"""
import hashlib, json, os, subprocess, sys, tarfile
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAR = os.path.join(ROOT, sys.argv[1])  # nisbiy yo'l linux-trenajor/ ga nisbatan; mutlaq yo'l ham bo'ladi
OUT = os.path.join(ROOT, sys.argv[2])
S_IFREG, S_IFDIR, S_IFLNK = 0x8000, 0x4000, 0xA000
HASH_LENGTH = 10
ZSTD = "--zstd" in sys.argv


def siq(data):
    if not ZSTD or len(data) < 512:
        return None
    z = subprocess.run(["zstd", "-19", "-q", "-c"], input=data, capture_output=True, check=True).stdout
    return z if len(z) < len(data) * 0.9 else None


def main():
    os.makedirs(os.path.join(OUT, "base"), exist_ok=True)
    root, dirs, total, written = [], {"": None}, 0, 0
    yozish = {}  # hash -> ma'lumot (bir xil fayllar bitta)
    dirs[""] = root
    with tarfile.open(TAR) as tar:
        members = tar.getmembers()
        by_name = {m.name.lstrip("./"): m for m in members}
        for m in members:
            m.name = m.name.lstrip("./").rstrip("/") if m.name not in (".", "./") else ""
            if not m.name:
                continue
            parent, _, name = m.name.rpartition("/")
            children = dirs.get(parent)
            if children is None:
                raise SystemExit(f"ota papka yo'q: {m.name}")
            node = [name, m.size, int(m.mtime), m.mode, m.uid, m.gid]
            if m.isfile() or m.islnk():
                src = by_name[m.linkname.lstrip("./")] if m.islnk() else m
                data = tar.extractfile(src).read()
                node[1] = len(data)
                node[3] |= S_IFREG
                h = hashlib.sha256(data).hexdigest()[:HASH_LENGTH]
                node.append(h)
                yozish.setdefault(h, data)
            elif m.isdir():
                node[3] |= S_IFDIR
                kids = []
                node.append(kids)
                dirs[m.name] = kids
            elif m.issym():
                node[3] |= S_IFLNK
                # Linux'da symlink hajmi — nishon yo'li uzunligi (tar'da 0 turadi); dpkg buni readlink bilan
                # solishtiradi va farq qilsa «size has changed» deb to'xtaydi
                node[1] = len(m.linkname.encode())
                node.append(m.linkname)
            else:
                continue
            total += node[1]
            children.append(node)
    def yoz(h):
        data = yozish[h]
        z = siq(data)
        fn = h + (".bin.zst" if z else ".bin")
        path = os.path.join(OUT, "base", fn)
        if not os.path.exists(path):
            with open(path, "wb") as f:
                f.write(z or data)
            return fn, len(z or data)
        return fn, 0
    with ThreadPoolExecutor(os.cpu_count()) as ex:
        nomlar = dict(zip(yozish, ex.map(yoz, yozish)))
    written = sum(n for _, n in nomlar.values())

    def nomla(kids):
        for node in kids:
            if isinstance(node[6], list):
                nomla(node[6])
            elif node[3] & 0xF000 == S_IFREG:
                node[6] = nomlar[node[6]][0]
    nomla(root)
    with open(os.path.join(OUT, "fs.json"), "w") as f:
        json.dump({"fsroot": root, "version": 3, "size": total}, f, separators=(",", ":"))
    print(f"fs.json tayyor; jami {total // 1024} KB, yangi yozilgan {written // 1024} KB{' (zstd)' if ZSTD else ''}")


if __name__ == "__main__":
    main()
