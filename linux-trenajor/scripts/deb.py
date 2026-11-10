"""Debian ombori bilan ishlash (Docker'siz, debootstrap'siz): Packages indeksi, bog'liqliklarni yechish,
.deb (ar arxiv) ichidan control/data tar'larini o'qish. yadro.py va rootfs.py ishlatadi."""
import gzip, io, lzma, os, re, tarfile, urllib.request

MIRROR = "https://deb.debian.org/debian"
SUITE = "bookworm"
ARCH = "i386"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Profil: bir xil quvur boshqa trenajor tasvirini yig'adi (masalan, TRENAJOR_PROFIL=nginx -> nginx-trenajor/).
# Profil papkasida profil.json (qo'shimcha paketlar, arxivlar) va ildiz/ (fayl tizimiga qo'shiladigan fayllar).
PROFIL = os.environ.get("TRENAJOR_PROFIL", "")
PROFIL_DIR = os.path.join(os.path.dirname(ROOT), f"{PROFIL}-trenajor") if PROFIL else ""
BUILD = os.path.join(PROFIL_DIR, "build") if PROFIL else os.path.join(ROOT, "build")
# .deb keshi profillar uchun umumiy
CACHE = os.path.join(ROOT, "build", "cache")
os.makedirs(CACHE, exist_ok=True)


def fetch(url):
    path = os.path.join(CACHE, url.rsplit("/", 1)[1])
    if not os.path.exists(path):
        print("yuklanmoqda:", url.rsplit("/", 1)[1])
        urllib.request.urlretrieve(url, path + ".part")
        os.rename(path + ".part", path)
    return path


def paketlar():
    raw = lzma.decompress(open(fetch(f"{MIRROR}/dists/{SUITE}/main/binary-{ARCH}/Packages.xz"), "rb").read()).decode()
    out = {}
    for blok in raw.split("\n\n"):
        f = dict(re.findall(r"^([A-Za-z-]+): (.*)$", blok, re.M))
        if "Package" in f:
            out[f["Package"]] = f
    return out


def ar_azolari(path):
    data = open(path, "rb").read()
    assert data[:8] == b"!<arch>\n", path
    i, out = 8, {}
    while i < len(data):
        nom = data[i:i + 16].decode().strip().rstrip("/")
        hajm = int(data[i + 48:i + 58].decode().strip())
        out[nom] = data[i + 60:i + 60 + hajm]
        i += 60 + hajm + (hajm & 1)
    return out


def _tar(nom, raw):
    if nom.endswith(".xz"):
        raw = lzma.decompress(raw)
    elif nom.endswith(".gz"):
        raw = gzip.decompress(raw)
    elif nom.endswith(".zst"):
        raise SystemExit(f"zstd siqilgan paket: {nom}")
    return tarfile.open(fileobj=io.BytesIO(raw))


def deb_data(path):
    a = ar_azolari(path)
    nom = next(k for k in a if k.startswith("data.tar"))
    return _tar(nom, a[nom])


def yech(p, kerak, afzal=()):
    """Depends va Pre-Depends bo'yicha to'liq to'plam. Muqobillardan (a | b) afzal ro'yxatdagisi, bo'lmasa
    birinchi mavjudi olinadi; virtual paket (Provides) — uni beruvchi birinchi paket."""
    provides = {}
    for nom, f in p.items():
        for v in re.split(r",\s*", f.get("Provides", "")):
            v = v.split(" ")[0].strip()
            if v:
                provides.setdefault(v, nom)
    natija, navbat = [], list(kerak)
    while navbat:
        nom = navbat.pop(0)
        nom = nom if nom in p else provides.get(nom)
        if not nom or nom in natija:
            continue
        natija.append(nom)
        for maydon in ("Pre-Depends", "Depends"):
            for bog in re.split(r",\s*", p[nom].get(maydon, "")):
                if not bog:
                    continue
                muqobillar = [m.strip().split(" ")[0].split(":")[0] for m in bog.split("|")]
                muqobillar.sort(key=lambda n: n not in afzal)
                for n in muqobillar:
                    if n in p or n in provides:
                        navbat.append(n)
                        break
    return natija
