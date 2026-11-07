# Bobdagi ```text vps va ```text tashqi bloklarining har qatori yozib olingan haqiqiy chiqishda borligini tekshiradi.
#   python3 linux-trenajor/asboblar/chiqish_tekshir.py content/linux/48-x.md yozuv1.txt [yozuv2.txt ...]
# Yozuv fayllari — vps.sh (yoki noutbukda xuddi shunday "$ buyruq" + chiqish) bilan olingan matn.
import re, sys
bob = open(sys.argv[1]).read()
haqiqiy = set()
for f in sys.argv[2:]:
    haqiqiy |= set(open(f).read().split('\n'))
yoq = [q for blok in re.findall(r'```text (?:vps|tashqi)\n(.*?)```', bob, re.S) for q in blok.rstrip('\n').split('\n') if q not in haqiqiy]
for q in yoq:
    print('YOZUVDA YOQ:', repr(q))
print('mos kelmagan qatorlar:', len(yoq))
sys.exit(1 if yoq else 0)
