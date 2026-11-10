#!/usr/bin/env python3
"""Debian 12 (bookworm) i386 ildiz fayl tizimi, 1-bosqich — debootstrap --foreign kabi, lekin Docker'siz.

Rasmiy ombordan Priority: required paketlar + trenajorga keraklilari (systemd, iproute2, sudo…) bog'liqliklari
bilan yuklanadi. Fayllar tar'ga ochiladi (dpkg va sh ishlashi uchun), .deb'lar /var/cache/apt/archives ga
qo'yiladi. 2-bosqich (stage2.sh) emulyator ichida haqiqiy dpkg bilan paketlarni o'rnatadi va sozlaydi.

  python3 linux-trenajor/scripts/rootfs.py   ->  linux-trenajor/build/stage1.tar
"""
import fnmatch, io, json, os, sys, tarfile

from deb import BUILD, MIRROR, PROFIL, PROFIL_DIR, ROOT, deb_data, fetch, paketlar, yech

# Priority: required dan tashqari — trenajor mavzulari uchun (servislar, tarmoq, foydalanuvchilar, tahrirlash)
QOSHIMCHA = [
    "systemd", "systemd-sysv", "dbus", "udev", "procps", "iproute2", "iputils-ping", "sudo",
    "bash-completion", "nano", "less", "ncurses-term", "psmisc", "file", "tree", "man-db", "manpages",
    # qo'llanma boblari uchun: cron (38), lsof (32), tmux (30), vim-tiny (16), acl (08)
    "cron", "lsof", "tmux", "vim-tiny", "acl",
    # tizim haqida qisqa ma'lumot; fastfetch Debian 13 dan boshlab bor (libc6 >= 2.38), bookworm'da — neofetch
    "neofetch",
]
# init-system-helpers "usrmerge | usr-is-merged" ga bog'liq: debootstrap /usr ni o'zi birlashtiradi va
# usr-is-merged ni oladi (usrmerge — eski tizimni ko'chiruvchi, perl'ni olib keladi)
AFZAL = {"usr-is-merged"}
# merged-/usr: bu papkalar /usr ichida, ildizda faqat symlink (Debian 12 da standart)
BIRLASHGAN = ["bin", "sbin", "lib", "lib32", "lib64", "libx32"]
# dpkg(1) --path-exclude/--path-include: tarjimalar, hujjatlar (copyright qoladi), apparat bazasi o'rnatilmaydi.
# Inglizcha man sahifalari qoladi. Oxirgi mos kelgan qoida ustun. dpkg paket ichidagi asl yo'lni tekshiradi
# (udev — /lib/udev/…), shuning uchun merged-/usr dan oldingi yo'l ham yoziladi.
DPKG_FILTR = """\
# Linux trenajori: brauzerga yuklanadigan hajmni kamaytirish (dpkg(1), --path-exclude)
path-exclude=/usr/share/locale/*
path-exclude=/usr/share/man/*
path-include=/usr/share/man/man[1-9]/*
path-exclude=/usr/share/doc/*
path-include=/usr/share/doc/*/copyright
path-exclude=/usr/share/info/*
path-exclude=/usr/share/lintian/*
path-exclude=/lib/udev/hwdb.d/*
path-exclude=/usr/lib/udev/hwdb.d/*
"""


def chiqarilsinmi(yol):
    """DPKG_FILTR qoidalarini 1-bosqichdagi fayllarga ham qo'llaydi (dpkg kabi: oxirgi mos qoida)."""
    natija = False
    for q in DPKG_FILTR.splitlines():
        if q.startswith("path-exclude=") and fnmatch.fnmatchcase(yol, q[13:]):
            natija = True
        elif q.startswith("path-include=") and fnmatch.fnmatchcase(yol, q[13:]):
            natija = False
    return natija


def birlashtir(nom):
    """bin/ls -> usr/bin/ls (merged-/usr)"""
    bosh = nom.split("/")[0]
    return "usr/" + nom if bosh in BIRLASHGAN else nom
# debootstrap kabi: shular birinchi o'rnatiladi (qolganlarining maintainer skriptlari ularga tayanadi)
BIRINCHI = ["base-passwd", "base-files", "dpkg", "libc6", "libc-bin", "debianutils", "bash", "dash", "coreutils", "diffutils", "sed", "grep", "tar", "gzip", "mawk"]
OUT = os.path.join(BUILD, "stage1.tar")
# Profil (deb.py): profil.json — {"paketlar": [...], "arxivlar": ["build/nginx-…-i386.tar.gz"]}; ildiz/ — fayllar.
# Arxivlar va ildiz/ dagi fayllar Debian paketlaridan keyin qo'shiladi (bir xil yo'lni almashtiradi).
PROFIL_SOZ = json.load(open(os.path.join(PROFIL_DIR, "profil.json"))) if PROFIL else {}


def main():
    p = paketlar()
    talab = sorted(n for n, f in p.items() if f.get("Priority") == "required")
    hammasi = yech(p, talab + QOSHIMCHA + PROFIL_SOZ.get("paketlar", []), AFZAL)
    hajm = sum(int(p[n].get("Size", 0)) for n in hammasi)
    print(f"{len(hammasi)} ta paket, yuklanadi {hajm / 1048576:.1f} MB")
    if "--faqat-hisob" in sys.argv:
        return

    fayllar = {}  # nom -> (TarInfo, ma'lumot) — keyingi paket oldingisini almashtiradi
    debs = []
    for n in hammasi:
        path = fetch(f"{MIRROR}/{p[n]['Filename']}")
        debs.append((n, path))
        t = deb_data(path)
        for m in t.getmembers():
            asl = m.name.lstrip("./").rstrip("/")
            nom = birlashtir(asl)
            if not nom or nom in BIRLASHGAN or chiqarilsinmi("/" + asl):
                continue
            m.name = nom
            if m.islnk():
                m.linkname = birlashtir(m.linkname.lstrip("./"))
            fayllar[nom] = (m, t.extractfile(m).read() if m.isfile() else None)

    # profil: tayyor arxivlar (masalan, i386 uchun yig'ilgan nginx) va ildiz/ papkasi
    for a in PROFIL_SOZ.get("arxivlar", []):
        with tarfile.open(os.path.join(PROFIL_DIR, a)) as t:
            for m in t.getmembers():
                nom = birlashtir(m.name.lstrip("./").rstrip("/"))
                if not nom or nom in BIRLASHGAN:
                    continue
                m.name, m.uid, m.gid, m.uname, m.gname = nom, 0, 0, "root", "root"
                fayllar[nom] = (m, t.extractfile(m).read() if m.isfile() else None)
    ildiz = os.path.join(PROFIL_DIR, "ildiz") if PROFIL else ""
    if ildiz and os.path.isdir(ildiz):
        for papka_, _, fl in os.walk(ildiz):
            for f in fl:
                yol = os.path.join(papka_, f)
                nom = birlashtir(os.path.relpath(yol, ildiz))
                ti = tarfile.TarInfo(nom)
                data = open(yol, "rb").read()
                ti.size, ti.mode = len(data), 0o755 if os.access(yol, os.X_OK) else 0o644
                fayllar[nom] = (ti, data)

    def papka(nom):
        ti = tarfile.TarInfo(nom)
        ti.type, ti.mode = tarfile.DIRTYPE, 0o755
        return ti

    with tarfile.open(OUT, "w") as out:
        yozildi = set()

        def yoz(ti, data=None):
            # ota papkalar avval (fsjson ham, v86 ham shuni kutadi)
            qism = ti.name.split("/")
            for i in range(1, len(qism)):
                ota = "/".join(qism[:i])
                if ota not in yozildi:
                    out.addfile(fayllar[ota][0] if ota in fayllar and fayllar[ota][0].isdir() else papka(ota))
                    yozildi.add(ota)
            if ti.name in yozildi:
                return
            out.addfile(ti, io.BytesIO(data) if data is not None else None)
            yozildi.add(ti.name)

        for nom in sorted(fayllar, key=lambda s: (s.count("/"), s)):
            m, data = fayllar[nom]
            if m.islnk():
                # qattiq havola — nishon fayl nusxasi (fsjson oddiy fayl sifatida yozadi)
                src = fayllar.get(m.linkname.lstrip("./"))
                if src and src[1] is not None:
                    ti = tarfile.TarInfo(nom)
                    ti.size, ti.mode, ti.mtime = len(src[1]), src[0].mode, src[0].mtime
                    yoz(ti, src[1])
                continue
            yoz(m, data)
        for d in ["proc", "sys", "dev", "run", "tmp", "var/lib/dpkg/info", "var/lib/dpkg/updates", "var/cache/apt/archives"]:
            if d not in yozildi:
                yoz(papka(d))
        for d in BIRLASHGAN:
            if f"usr/{d}" in yozildi:
                ti = tarfile.TarInfo(d)
                ti.type, ti.linkname, ti.mode = tarfile.SYMTYPE, f"usr/{d}", 0o777
                ti.mtime = fayllar[f"usr/{d}"][0].mtime if f"usr/{d}" in fayllar else 0
                yoz(ti)
        for n, path in debs:
            data = open(path, "rb").read()
            ti = tarfile.TarInfo(f"var/cache/apt/archives/{os.path.basename(path)}")
            ti.size, ti.mode = len(data), 0o644
            yoz(ti, data)
        tartib = [n for n in BIRINCHI if n in hammasi]
        for nom, matn in [
            ("var/lib/dpkg/status", ""), ("var/lib/dpkg/available", ""),
            ("etc/dpkg/dpkg.cfg.d/trenajor", DPKG_FILTR),
            ("linux-trenajor/birinchi.txt", "\n".join(f"{n}_" for n in tartib) + "\n"),
            ("linux-trenajor/stage2.sh", open(os.path.join(os.path.dirname(__file__), "stage2.sh")).read()),
            # terminal ochilganda chiqadigan salomlashish matni (holat.mjs: clear; cat /etc/motd)
            ("linux-trenajor/motd", open(os.path.join(os.path.dirname(__file__), "motd"), encoding="utf-8").read()),
        ]:
            ti = tarfile.TarInfo(nom)
            b = matn.encode()
            ti.size, ti.mode = len(b), 0o755 if nom.endswith(".sh") else 0o644
            yoz(ti, b)
    print(f"tayyor: {OUT} ({os.path.getsize(OUT) / 1048576:.0f} MB)")


main()
