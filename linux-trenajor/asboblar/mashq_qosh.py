# Mashq obyektini (JS matni, fayldan) src/trenajor/linuxMashqlar.js dagi LINUX_MASHQLAR massivining oxiriga qo'shadi.
#   python3 linux-trenajor/asboblar/mashq_qosh.py m48.js
import sys, re, os
ildiz = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
p = os.path.join(ildiz, 'src/trenajor/linuxMashqlar.js')
s = open(p).read(); obj = open(sys.argv[1]).read().rstrip('\n') + '\n'
m = list(re.finditer(r'^\]$', s, re.M))[-1]
idm = re.search(r"id: '([^']+)'", obj).group(1)
assert f"id: '{idm}'" not in s, 'bu mashq allaqachon bor: ' + idm
s = s[:m.start()] + obj + s[m.start():]
open(p, 'w').write(s); print('qo‘shildi:', idm)
