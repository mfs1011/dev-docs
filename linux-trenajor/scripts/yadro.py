#!/usr/bin/env python3
"""Debian 12 (bookworm) i386 yadrosi va 9p initramfs — Docker'siz, faqat Debian'ning rasmiy paketlaridan.

Brauzerdagi emulyator (v86) 32-bit; Debian 12 i386 ni to'liq qo'llab-quvvatlaydi (Debian 13 da i386 uchun
yadro yo'q). Yadro paketidan bzImage va 9p/virtio modullari olinadi, busybox-static bilan kichik initramfs
yig'iladi: u modullarni yuklab, ildiz fayl tizimini 9p orqali ulaydi va /sbin/init (systemd) ga o'tadi.

  python3 linux-trenajor/scripts/yadro.py   ->  linux-trenajor/build/{vmlinuz,initrd.img}
"""
import gzip, io, lzma, os, re

from deb import BUILD, MIRROR, ROOT, deb_data, fetch, paketlar

# 9p ildiz fayl tizimi uchun kerakli modullar (bog'liqliklari .modinfo dan topiladi)
MODULLAR = ["9p", "9pnet_virtio", "virtio_pci"]
OUT = BUILD
os.makedirs(OUT, exist_ok=True)


def modinfo(ko):
    """ELF .modinfo bo'limidan depends= ni o'qiydi (modules.dep yo'q — u depmod bilan o'rnatishda yasaladi)."""
    m = re.search(rb"depends=([^\x00]*)\x00", ko)
    return [d for d in (m.group(1).decode().split(",") if m else []) if d]


def cpio_newc(fayllar):
    """fayllar: [(yo'l, rejim, ma'lumot yoki symlink nishoni)] -> newc cpio"""
    out = io.BytesIO()
    ino = 1
    for nom, mode, data in fayllar + [("TRAILER!!!", 0, b"")]:
        nb = nom.encode() + b"\x00"
        hdr = b"070701" + b"".join(b"%08X" % v for v in (ino, mode, 0, 0, 1, 0, len(data), 0, 0, 0, 0, len(nb), 0))
        out.write(hdr + nb)
        out.write(b"\x00" * ((4 - out.tell() % 4) % 4))
        out.write(data)
        out.write(b"\x00" * ((4 - out.tell() % 4) % 4))
        ino += 1
    return out.getvalue()


INIT = """#!/bin/busybox sh
/bin/busybox --install -s /bin
mount -t proc proc /proc
mount -t sysfs sys /sys
mount -t devtmpfs dev /dev
for m in {modullar}; do insmod /lib/modules/$m.ko || echo "insmod $m: xato"; done
mkdir -p /root
mount -t 9p -o trans=virtio,version=9p2000.L,cache=loose,msize=512000 host9p /root || {{ echo "9p ulanmadi"; exec sh; }}
for a in $(cat /proc/cmdline); do case $a in init=*) INIT=${{a#init=}};; esac; done
umount /proc /sys
mount --move /dev /root/dev 2>/dev/null || umount /dev
exec switch_root /root ${{INIT:-/sbin/init}}
"""


def main():
    p = paketlar()
    meta = p["linux-image-686"]
    yadro_nomi = re.match(r"(linux-image-[^ ,]+)", meta["Depends"]).group(1)
    yadro = p[yadro_nomi]
    print("yadro paketi:", yadro_nomi, yadro["Version"])
    t = deb_data(fetch(f"{MIRROR}/{yadro['Filename']}"))
    a = {m.name.lstrip("./"): m for m in t.getmembers()}
    vmlinuz = next(k for k in a if re.match(r"boot/vmlinuz-", k))
    ver = vmlinuz.split("vmlinuz-")[1]
    open(os.path.join(OUT, "vmlinuz"), "wb").write(t.extractfile(a[vmlinuz]).read())
    builtin = set()
    bkey = f"lib/modules/{ver}/modules.builtin"
    if bkey in a:
        builtin = {os.path.basename(l).replace(".ko", "").replace("-", "_") for l in t.extractfile(a[bkey]).read().decode().split()}

    # modul nomi -> yo'l (".ko" yoki ".ko.xz")
    ko_yol = {}
    for k in a:
        mm = re.match(rf"lib/modules/{re.escape(ver)}/kernel/.*/([^/]+)\.ko(\.xz)?$", k)
        if mm:
            ko_yol[mm.group(1).replace("-", "_")] = k

    def ol(nom):
        k = ko_yol[nom]
        d = t.extractfile(a[k]).read()
        return lzma.decompress(d) if k.endswith(".xz") else d

    tartib, ko = [], {}
    def qosh(nom):
        nom = nom.replace("-", "_")
        if nom in tartib or nom in builtin:
            return
        if nom not in ko_yol:
            raise SystemExit(f"modul topilmadi: {nom}")
        ko[nom] = ol(nom)
        for d in modinfo(ko[nom]):
            qosh(d)
        tartib.append(nom)
    for m in MODULLAR:
        qosh(m)
    print("modullar (yuklash tartibi):", " ".join(tartib), "| ichki:", ", ".join(sorted(x for x in MODULLAR if x in builtin)) or "—")

    bb = p["busybox-static"]
    tb = deb_data(fetch(f"{MIRROR}/{bb['Filename']}"))
    busybox = tb.extractfile(next(m for m in tb.getmembers() if m.name.endswith("bin/busybox"))).read()

    f = [("bin", 0o40755, b""), ("dev", 0o40755, b""), ("proc", 0o40755, b""), ("sys", 0o40755, b""), ("root", 0o40755, b""),
         ("lib", 0o40755, b""), ("lib/modules", 0o40755, b""), ("bin/busybox", 0o100755, busybox)]
    f += [(f"lib/modules/{n}.ko", 0o100644, ko[n]) for n in tartib]
    f.append(("init", 0o100755, INIT.format(modullar=" ".join(tartib)).encode()))
    open(os.path.join(OUT, "initrd.img"), "wb").write(gzip.compress(cpio_newc(f), 9))
    print(f"tayyor: vmlinuz {os.path.getsize(os.path.join(OUT, 'vmlinuz')) // 1024} KB, initrd.img {os.path.getsize(os.path.join(OUT, 'initrd.img')) // 1024} KB, yadro {ver}")


main()
