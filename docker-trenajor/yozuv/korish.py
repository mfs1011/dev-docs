#!/usr/bin/env python3
"""Yozuvni o'qish uchun: python3 korish.py natija/yozuvlar/04-*.json [--xom]"""
import json, re, sys
xom = '--xom' in sys.argv
for f in [a for a in sys.argv[1:] if not a.startswith('--')]:
    for s in json.load(open(f))['ssenariylar']:
        for b in s['buyruqlar']:
            if 'cmd' not in b:
                print('#!', b['direktiva']); continue
            out = b['out']
            if not xom:
                out = re.sub(r'\x1b\[[0-9;?]*[A-Za-z]', '', out).replace('\r\n', '\n').replace('\r', '')
            print(f"$ {b['cmd']}   ⟨kod {b['kod']}, {b['ms']} ms⟩")
            if b.get('kirish'): print('  ⟨kirish⟩', b['kirish'])
            print(repr(out) if xom else out, end='' if out.endswith('\n') or xom else '\n')
            if xom: print()
