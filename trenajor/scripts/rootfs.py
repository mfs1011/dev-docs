#!/usr/bin/env python3
"""Alpine x86 rootfs (git + bash) — Docker'siz.

minirootfs + kerakli paketlar (bog'liqliklari APKINDEX dan) -> build/rootfs.tar.
Paketlar diskka ochilmaydi: macOS fayl tizimi katta-kichik harfni farqlamaydi, shuning uchun
tar oqimlari to'g'ridan-to'g'ri bitta tar'ga birlashtiriladi (keyingi yozuv oldingisini almashtiradi).

  python3 scripts/rootfs.py
"""
import gzip, hashlib, io, os, sys, tarfile, urllib.request, zlib

ALPINE = "v3.24"
MINIROOTFS = "alpine-minirootfs-3.24.3-x86.tar.gz"
MINIROOTFS_SHA256 = "a73bd9ed20a5ed1503a0688957add539e10340c7ca1d9e8c06c34a76ddc5f715"
MIRROR = "https://dl-cdn.alpinelinux.org/alpine"
REPOS = ["main", "community"]
WANT = ["bash", "bash-completion", "git", "git-bash-completion", "less", "nano", "ncurses-terminfo-base"]

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "build", "cache")
OUT = os.path.join(ROOT, "build", "rootfs.tar")
os.makedirs(CACHE, exist_ok=True)


def fetch(url, name):
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        print("yuklanmoqda:", url)
        urllib.request.urlretrieve(url, path + ".part")
        os.rename(path + ".part", path)
    return path


def gzip_members(data):
    """apk = ketma-ket gzip oqimlari (imzo, control, data); har birini alohida qaytaradi."""
    out = []
    while data:
        d = zlib.decompressobj(31)
        out.append(d.decompress(data) + d.flush())
        data = d.unused_data
    return out


def read_index(repo):
    raw = open(fetch(f"{MIRROR}/{ALPINE}/{repo}/x86/APKINDEX.tar.gz", f"APKINDEX-{repo}.tar.gz"), "rb").read()
    tar_bytes = b"".join(gzip_members(raw))
    pkgs = {}
    with tarfile.open(fileobj=io.BytesIO(tar_bytes)) as t:
        for m in t:
            if m.name != "APKINDEX":
                continue
            for block in t.extractfile(m).read().decode().split("\n\n"):
                rec = {}
                for line in block.splitlines():
                    if len(line) > 2 and line[1] == ":":
                        rec[line[0]] = line[2:]
                if "P" in rec:
                    rec["repo"] = repo
                    pkgs[rec["P"]] = rec
    return pkgs


def strip_ver(dep):
    for op in ("<", ">", "=", "~"):
        dep = dep.split(op)[0]
    return dep


def main():
    pkgs = {}
    for r in REPOS:
        pkgs.update(read_index(r))
    provides = {}
    for name, rec in pkgs.items():
        provides.setdefault(name, name)
        for p in rec.get("p", "").split():
            provides.setdefault(strip_ver(p), name)

    # minirootfs da bor paketlar qayta qo'shilmaydi
    mini = fetch(f"{MIRROR}/{ALPINE}/releases/x86/{MINIROOTFS}", MINIROOTFS)
    if hashlib.sha256(open(mini, "rb").read()).hexdigest() != MINIROOTFS_SHA256:
        sys.exit("minirootfs sha256 mos emas")
    with tarfile.open(mini) as t:
        f = t.extractfile("./lib/apk/db/installed")
        have = {l[2:] for l in f.read().decode().splitlines() if l.startswith("P:")}

    need, queue = [], list(WANT)
    while queue:
        dep = queue.pop(0)
        if dep.startswith("!"):
            continue
        name = provides.get(strip_ver(dep))
        if name is None:
            sys.exit(f"topilmadi: {dep}")
        if name in have or name in need:
            continue
        need.append(name)
        queue += pkgs[name].get("D", "").split()
    print("paketlar:", " ".join(need))

    entries = {}  # yo'l -> (TarInfo, bytes)
    def add_tar(tar_bytes):
        with tarfile.open(fileobj=io.BytesIO(tar_bytes)) as t:
            for m in t:
                name = m.name.lstrip("./") if m.name.startswith("./") else m.name
                # paket metama'lumoti (.PKGINFO, .SIGN.*, .post-install ...) — fayl tizimiga kirmaydi
                if not name or (name.startswith(".") and "/" not in name):
                    continue
                m.name = name
                m.uid = m.gid = 0
                m.uname = m.gname = "root"
                m.pax_headers = {}
                data = t.extractfile(m).read() if m.isfile() else None
                entries[name] = (m, data)

    with open(mini, "rb") as f:
        add_tar(gzip.decompress(f.read()))
    for name in need:
        rec = pkgs[name]
        apk = fetch(f"{MIRROR}/{ALPINE}/{rec['repo']}/x86/{name}-{rec['V']}.apk", f"{name}-{rec['V']}.apk")
        members = gzip_members(open(apk, "rb").read())
        add_tar(members[-1])  # oxirgi oqim — fayllar

    # o'z fayllarimiz: overlay/ papkasi (init, bashrc, yordamchi skriptlar)
    overlay = os.path.join(ROOT, "overlay")
    for base, dirs, files in os.walk(overlay):
        for dn in dirs:  # Alpine'da yo'q papkalar (masalan, usr/local/lib/trenajor)
            rel = os.path.relpath(os.path.join(base, dn), overlay)
            if rel not in entries and rel + "/" not in entries:
                ti = tarfile.TarInfo(rel)
                ti.type, ti.mode = tarfile.DIRTYPE, 0o755
                entries[rel] = (ti, None)
        for fn in files:
            full = os.path.join(base, fn)
            rel = os.path.relpath(full, overlay)
            data = open(full, "rb").read()
            ti = tarfile.TarInfo(rel)
            ti.size = len(data)
            ti.mode = 0o755 if os.access(full, os.X_OK) else 0o644
            ti.mtime = int(os.path.getmtime(full))
            entries[rel] = (ti, data)

    with tarfile.open(OUT, "w", format=tarfile.GNU_FORMAT) as out:
        for name in sorted(entries):
            m, data = entries[name]
            out.addfile(m, io.BytesIO(data) if data is not None else None)
    print("tayyor:", OUT, os.path.getsize(OUT) // 1024, "KB,", len(entries), "yozuv")


if __name__ == "__main__":
    main()
