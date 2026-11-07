# Yangi bobni ulaydi: oldingi bobga "Keyingi" havolasi, README qatorini havolaga aylantirish, "NN/54" sanog'i.
#   python3 linux-trenajor/asboblar/bob_ulash.py 48 48-birinchi-skript.md "Birinchi skript"
#   (nom content/linux/README.md mundarijasidagi bilan aynan bir xil bo'lishi kerak)
import sys, re, os
n, fayl, nom = int(sys.argv[1]), sys.argv[2], sys.argv[3]
d=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'content/linux') + '/'
oldingi=[f for f in os.listdir(d) if re.match(r'%02d-' % (n-1), f)][0]
s=open(d+oldingi).read()
if f']({fayl})' not in s.split('\n\n')[1]:
    q=s.split('\n')[2]
    assert q.startswith('[← Oldingi') or q.startswith('[Mundarija') or 'Mundarija' in q, q
    s=s.replace(q, q+f" · [Keyingi: {nom} →]({fayl})",1); open(d+oldingi,'w').write(s)
r=open(d+'README.md').read()
pat=f"| {n} | {nom} |"
if pat in r: r=r.replace(pat, f"| {n} | [{nom}]({fayl}) |",1)
else: assert f"| {n} | [{nom}]({fayl}) |" in r, 'README qatori topilmadi'
tayyor=len([f for f in os.listdir(d) if re.match(r'\d\d-.*\.md$', f)])
r=re.sub(r'\d+/54 bob tayyor', f'{tayyor}/54 bob tayyor', r); open(d+'README.md','w').write(r)
print(oldingi, '→', fayl, '| tayyor:', tayyor)
