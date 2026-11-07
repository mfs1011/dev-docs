# Rasmiy hujjat sahifasining tuzilmasini olish (keshlanadi: $TMPDIR/docs-web-sahifa).
# Foydalanish: python3 -I sahifa.py URL rejim [naqsh]
#   rejim: h  — sarlavhalar (h1-h4, id bilan)
#          a  — havolalar (matn → href), naqsh bo'yicha filtr (href yoki matn)
#          t  — matn qatorlari, naqsh bo'yicha filtr (regex), atrofi bilan
import sys, re, html, subprocess, hashlib, os
url, rejim = sys.argv[1], sys.argv[2]
naqsh = sys.argv[3] if len(sys.argv) > 3 else ''
d = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'docs-web-sahifa')
os.makedirs(d, exist_ok=True)
f = os.path.join(d, hashlib.md5(url.encode()).hexdigest() + '.html')
if not os.path.exists(f):
    subprocess.run(['curl', '-sL', '--max-time', '40', '-A', 'Mozilla/5.0 docs-research', '-o', f, url], check=True)
s = open(f, encoding='utf-8', errors='replace').read()
s = re.sub(r'<script.*?</script>|<style.*?</style>|<!--.*?-->', '', s, flags=re.S)
toza = lambda x: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', x))).strip()
if rejim == 'h':
    for m in re.finditer(r'<h([1-4])([^>]*)>(.*?)</h\1>', s, re.S):
        i = re.search(r'id="([^"]+)"', m.group(2))
        t = toza(m.group(3))
        if t and (not naqsh or re.search(naqsh, t, re.I)):
            print('  ' * (int(m.group(1)) - 1) + t + (f'  #{i.group(1)}' if i else ''))
elif rejim == 'a':
    seen = set()
    for m in re.finditer(r'<a\s[^>]*href="([^"#][^"]*)"[^>]*>(.*?)</a>', s, re.S):
        h, t = m.group(1), toza(m.group(2))
        if not t or (h, t) in seen: continue
        if naqsh and not re.search(naqsh, h + ' ' + t, re.I): continue
        seen.add((h, t)); print(f'{t}  →  {h}')
else:
    q = [l.strip() for l in toza(re.sub(r'<(br|p|div|li|h\d|tr|td|th|dt|dd)[^>]*>', '\n', s)).split('\n')] if False else \
        [toza(l) for l in re.split(r'<(?:br|p|div|li|h\d|tr|dt|dd)[^>]*>', s)]
    q = [l for l in q if l]
    for i, l in enumerate(q):
        if not naqsh or re.search(naqsh, l, re.I): print(i, l[:400])
