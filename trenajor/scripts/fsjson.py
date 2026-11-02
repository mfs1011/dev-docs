#!/usr/bin/env python3
"""build/rootfs.tar -> public/fs/fs.json + public/fs/base/<sha256[:10]>.bin

v86 ning 9p "JSON/HTTP" formati (version 3): har tugun [nom, hajm, mtime, mode, uid, gid, nishon],
nishon — papkada bolalar ro'yxati, symlink'da manzil, faylda base/ dagi fayl nomi.
Brauzer faylni faqat birinchi ochilganda yuklaydi.

  python3 scripts/fsjson.py
"""
import hashlib, json, os, tarfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAR = os.path.join(ROOT, "build", "rootfs.tar")
OUT = os.path.join(ROOT, "..", "public", "trenajor", "fs")
S_IFREG, S_IFDIR, S_IFLNK = 0x8000, 0x4000, 0xA000
HASH_LENGTH = 10


def main():
    os.makedirs(os.path.join(OUT, "base"), exist_ok=True)
    root, dirs, total, written = [], {"": None}, 0, 0
    dirs[""] = root
    with tarfile.open(TAR) as tar:
        members = tar.getmembers()
        by_name = {m.name: m for m in members}
        for m in members:
            parent, _, name = m.name.rpartition("/")
            children = dirs.get(parent)
            if children is None:
                raise SystemExit(f"ota papka yo'q: {m.name}")
            node = [name, m.size, int(m.mtime), m.mode, m.uid, m.gid]
            if m.isfile() or m.islnk():
                src = by_name[m.linkname] if m.islnk() else m
                data = tar.extractfile(src).read()
                node[1] = len(data)
                node[3] |= S_IFREG
                h = hashlib.sha256(data).hexdigest()
                fn = h[:HASH_LENGTH] + ".bin"
                path = os.path.join(OUT, "base", fn)
                if not os.path.exists(path):
                    with open(path, "wb") as f:
                        f.write(data)
                    written += len(data)
                node.append(fn)
            elif m.isdir():
                node[3] |= S_IFDIR
                kids = []
                node.append(kids)
                dirs[m.name] = kids
            elif m.issym():
                node[3] |= S_IFLNK
                node.append(m.linkname)
            else:
                continue
            total += node[1]
            children.append(node)
    with open(os.path.join(OUT, "fs.json"), "w") as f:
        json.dump({"fsroot": root, "version": 3, "size": total}, f, separators=(",", ":"))
    print(f"fs.json tayyor; jami {total // 1024} KB, yangi yozilgan {written // 1024} KB")


if __name__ == "__main__":
    main()
