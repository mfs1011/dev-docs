# 18 — Packfile'lar va `gc`

[← Oldingi: Ref'lar, HEAD va teg obyekti](17-reflar-va-head.md) · [Mundarija](README.md) · [Keyingi: Revision'larni tanlash →](19-revision-tanlash.md)

## Tushuncha

[14–16-boblarda](14-obyektlar-blob.md) har obyekt `.git/objects/` ichida alohida fayl bo'lib yozildi: `.git/objects/f1/ad0c97...` — bitta commit, `.git/objects/83/baae61...` — bitta blob. Bu shakl **loose** (bo'sh, "sochilgan") obyekt deyiladi. Har loose obyekt alohida zlib bilan siqilgan, lekin boshqa obyektlardan butunlay mustaqil.

Bu modelning narxini [14-bobda](14-obyektlar-blob.md) aytgan edik: Git diff saqlamaydi, har versiyaning **to'liq** mazmunini saqlaydi. 30 KB faylga bitta qator qo'shsangiz — omborda ikkita deyarli bir xil 30 KB'lik blob paydo bo'ladi. Ming marta o'zgargan fayl — ming nusxa.

Pro Git savoli: bittasini to'liq, ikkinchisini esa faqat birinchisidan **farqi** (delta) sifatida saqlasa bo'lmaydimi? Bo'ladi. Git vaqti-vaqti bilan loose obyektlarni bitta katta ikkilik faylga yig'adi — **packfile** (`.pack`). Unda:

- ko'p obyekt bitta faylda turadi (minglab mayda fayl o'rniga);
- o'xshash obyektlar bir-biriga nisbatan **delta** bilan saqlanadi;
- yonida **index** fayli (`.idx`) turadi — "qaysi obyekt pack ichida qaysi baytdan boshlanadi" degan jadval, shu tufayli istalgan obyektni tez topish mumkin.

Bu **saqlash darajasidagi** optimallashtirish. Model darajasida hech narsa o'zgarmaydi: commit baribir to'liq surat, blob baribir faylning to'liq mazmuni, hash'lar ham o'sha-o'sha ([1-bob](01-versiya-nazorati.md)). `git cat-file -p` obyekt loose'mi yoki pack ichidami — farqini sezmaysiz.

Packlash qachon bo'ladi? Pro Git uchta holatni sanaydi: loose obyektlar juda ko'payganda (avtomatik), `git gc` ni qo'lda ishga tushirganda, va serverga push qilganda (tarmoq orqali obyektlar doim pack bo'lib uzatiladi — [4-bobdagi](04-repo-olish.md) klonda ham shuni ko'rgan edik).

Bu ishni bajaradigan buyruq — **`git gc`** (garbage collection, "axlat yig'ish"). Nomi faqat bitta vazifasini aytadi; aslida u repo'ni tartibga keltiradigan bir nechta ishni qiladi: obyektlarni pack'laydi, ref'larni `packed-refs` ga yig'adi ([17-bob](17-reflar-va-head.md)), eskirgan reflog yozuvlarini o'chiradi ([42-bob](42-reflog-va-tiklash.md)), hech narsadan yetib bo'lmaydigan eski obyektlarni tozalaydi va yordamchi indekslarni (commit-graph) yangilaydi. Git 2.56 da bu vazifalar uchun umumiyroq buyruq ham bor — **`git maintenance`**.

## Nega shunday: nega Git boshidanoq delta bilan yozmaydi

Delta yaxshi bo'lsa, nega `git add` darhol delta yozmaydi? Loose format bir nechta muhim sababga ko'ra boshlang'ich holat:

1. **Yozish tez va oddiy.** `git add` va `git commit` bitta faylni siqib yozadi, xolos. Delta hisoblash uchun esa "qaysi obyekt bunga o'xshaydi?" degan savolga javob izlash kerak — bu butun ombor hajmiga bog'liq qimmat ish. `git maintenance` hujjati aynan shuni aytadi: `git add` yoki `git fetch` kabi buyruqlar tez javob berishga moslashtirilgan; optimallashtirish butun repo hajmiga bog'liq bo'lgani uchun ular bu vaqtni sarflamaydi.
2. **Xavfsiz.** Har loose obyekt o'zi yetarli: uni o'qish uchun boshqa hech qaysi faylga murojaat qilinmaydi. Yozish paytida to'xtab qolish boshqa obyektlarni buzmaydi.
3. **Optimallashtirishni keyinga qoldirish mumkin.** Obyektlar o'zgarmaydi, shuning uchun ularni istalgan paytda qayta pack'lash, boshqa tartibda delta qilish, yaxshiroq siqish mumkin — natija (hash'lar, tarix) aynan bir xil qoladi. Pro Git: pack'ni istalgan vaqtda qayta yig'ish mumkin, Git ham buni vaqti-vaqti bilan o'zi qiladi.

Bundan tashqari, delta **fayl nomi va tarixga bog'liq emas**. Git "bu faylning oldingi versiyasi" degan tushunchani saqlamaydi; pack yasashda u obyektlarni tur, nom va hajm bo'yicha saralab, bir-biriga eng o'xshashlarini qidiradi. Delta asosi boshqa nomdagi fayl yoki umuman boshqa tarix chizig'idagi obyekt ham bo'lishi mumkin.

## Kod: boshlang'ich holat — faqat loose obyektlar

[16-bobdagi](16-commit-obyekti.md) repo nusxasida davom etamiz. Unda uchta commit va 16-bobdagi sinovlardan qolgan bir nechta "osilgan" obyekt bor:

```bash
$ cp -r 16-commit 18-pack && cd 18-pack
$ git log --oneline
bf3788a Third commit
f1ad0c9 Second commit
35492cf First commit
$ git count-objects
21 objects, 84 kilobytes
$ git count-objects -v
count: 21
size: 84
in-pack: 0
packs: 0
size-pack: 0
prune-packable: 0
garbage: 0
size-garbage: 0
```

`git count-objects` — loose obyektlarni sanaydi. Ma'lumotnomaga ko'ra uning vazifasi — "qachon qayta pack'lash vaqti kelganini hal qilishga yordam berish". `-v` maydonlari:

| Maydon | Ma'nosi |
| --- | --- |
| `count` | Loose obyektlar soni |
| `size` | Loose obyektlar egallagan disk joyi, KiB (`-H` bilan — o'qishga qulay birlikda) |
| `in-pack` | Pack'lar ichidagi obyektlar soni |
| `packs` | Pack fayllar soni |
| `size-pack` | Pack'lar egallagan disk joyi |
| `prune-packable` | Ham loose, ham pack'da bor obyektlar — loose nusxasini o'chirsa bo'ladi |
| `garbage` | `objects` ichidagi na obyekt, na pack bo'lmagan fayllar |

**84 kilobayt** — 21 ta mayda fayl uchun ko'pdek tuyuladi. Haqiqiy baytlarni sanaymiz:

```bash
$ cat .git/objects/??/* | wc -c
    2145
```

Atigi 2145 bayt. `size` — **disk joyi**: fayl tizimi har faylga kamida bitta blok (bu yerda 4 KiB) ajratadi, 21 × 4 = 84. Minglab mayda loose obyektlar mana shunday joyni isrof qiladi — pack'lashning birinchi foydasi shu.

## Kod: katta fayl va uning ikki versiyasi

Pro Git bu yerda 22 KB'lik manba faylini yuklab oladi. Biz shunga o'xshash faylni Python bilan yasaymiz (natija har safar bir xil):

```bash
$ python3 - <<'EOF'
lines = []
for i in range(1, 301):
    lines.append(f"def hisobla_{i}(x, y):\n    \"\"\"{i}-hisob: x va y ustida amal.\"\"\"\n    return x * {i} + y * {(i * 37) % 101} - {(i * i) % 97}\n\n")
open('ombor.py', 'w').write(''.join(lines))
EOF
$ wc -c ombor.py
   29002 ombor.py
$ git add ombor.py
$ GIT_AUTHOR_DATE=2026-10-07T10:20:00+05:00 GIT_COMMITTER_DATE=2026-10-07T10:20:00+05:00 git commit -m "ombor.py qo'shildi"
[main b336d1a] ombor.py qo'shildi
 1 file changed, 1200 insertions(+)
 create mode 100644 ombor.py
$ git cat-file -p main^{tree}
040000 tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579	bak
100644 blob fa49b077972391ad58037050f2a75f74e3671e92	new.txt
100644 blob 9f32a04a5cf6744e9f09925fffc33be855999caf	ombor.py
100644 blob 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a	test.txt
$ git cat-file -s 9f32a04
29002
```

Endi faylga bitta qator qo'shamiz:

```bash
$ echo '# sinov' >> ombor.py
$ GIT_AUTHOR_DATE=2026-10-07T10:25:00+05:00 GIT_COMMITTER_DATE=2026-10-07T10:25:00+05:00 git commit -am "ombor.py biroz o'zgardi"
[main 2d7a93b] ombor.py biroz o'zgardi
 1 file changed, 1 insertion(+)
$ git cat-file -p main^{tree}
040000 tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579	bak
100644 blob fa49b077972391ad58037050f2a75f74e3671e92	new.txt
100644 blob 83ea834c15d18eccbc8f35d830e53745dce5e88e	ombor.py
100644 blob 1f7a7a472abf3dd9643fd615f6da379c4acb3e3a	test.txt
$ git cat-file -s 83ea834
29010
```

1200 qatorli faylga bitta qator qo'shildi — va Git butunlay **yangi** blob yozdi (8 bayt kattaroq). Diskda:

```bash
$ wc -c .git/objects/9f/32a04a5cf6744e9f09925fffc33be855999caf .git/objects/83/ea834c15d18eccbc8f35d830e53745dce5e88e
    4134 .git/objects/9f/32a04a5cf6744e9f09925fffc33be855999caf
    4143 .git/objects/83/ea834c15d18eccbc8f35d830e53745dce5e88e
    8277 total
$ git count-objects -v
count: 27
size: 116
in-pack: 0
packs: 0
...
$ cat .git/objects/??/* | wc -c
   11050
$ ls .git/objects/pack
$
```

Ikkala blob zlib bilan ~4 KB gacha siqilgan, lekin ikkalasi ham to'liq — bir-biridan deyarli farq qilmasa ham. `objects/pack` hali bo'sh.

## Kod: `git gc` — loose'dan pack'ga

```bash
$ git gc
Enumerating objects: 15, done.
Counting objects: 100% (15/15), done.
Delta compression using up to 10 threads
Compressing objects: 100% (11/11), done.
Writing objects: 100% (15/15), done.
Total 15 (delta 2), reused 0 (delta 0), pack-reused 0 (from 0)
Enumerating cruft objects: 12, done.
Traversing cruft objects: 16, done.
Counting objects: 100% (12/12), done.
Delta compression using up to 10 threads
Compressing objects: 100% (10/10), done.
Writing objects: 100% (12/12), done.
Total 12 (delta 7), reused 0 (delta 0), pack-reused 0 (from 0)
```

(Jarayon foizlari terminalda bitta qatorda yangilanadi; bu yerda yakuniy holati qoldirildi. Terminal bo'lmasa — masalan, skriptda — `gc` jim ishlaydi. "10 threads" — protsessor yadrolari soniga bog'liq.)

Ikki bosqich ko'rinadi: avval **15** ta obyekt (`Total 15 (delta 2)` — ikkitasi delta bo'lib yozildi), keyin alohida **12** ta "cruft" obyekt. Ular nima ekanini pastda ko'ramiz. `.git/objects` ga qaraymiz:

```bash
$ find .git/objects -type f | sort
.git/objects/info/commit-graph
.git/objects/info/packs
.git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.idx
.git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.pack
.git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.rev
.git/objects/pack/pack-f4aecac48820d927b268c41beb600943c1097682.idx
.git/objects/pack/pack-f4aecac48820d927b268c41beb600943c1097682.mtimes
.git/objects/pack/pack-f4aecac48820d927b268c41beb600943c1097682.pack
.git/objects/pack/pack-f4aecac48820d927b268c41beb600943c1097682.rev
$ git count-objects -v
count: 0
size: 0
in-pack: 27
packs: 2
size-pack: 8
prune-packable: 0
garbage: 0
size-garbage: 0
```

Barcha 27 ta loose fayl yo'qoldi, o'rniga ikki pack paydo bo'ldi:

| Fayl | Nima |
| --- | --- |
| `pack-<hash>.pack` | Obyektlarning o'zi — siqilgan, qisman delta |
| `pack-<hash>.idx` | Index: obyekt hash'i → pack ichidagi ofset |
| `pack-<hash>.rev` | Teskari index: pack ichidagi tartib → `.idx` dagi tartib (`gitformat-pack`) |
| `pack-<hash>.mtimes` | Faqat **cruft pack** uchun: har obyektning "oxirgi o'zgartirilgan vaqti" |
| `info/packs` | Mavjud pack'lar ro'yxati — eski "dumb" HTTP protokoli uchun |
| `info/commit-graph` | Commit grafining tezkor indeksi (pastda) |

Hajmlar:

```bash
$ wc -c .git/objects/pack/*
    1492 .git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.idx
    4987 .git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.pack
     112 .git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.rev
    1408 .git/objects/pack/pack-f4aecac48820d927b268c41beb600943c1097682.idx
     100 .git/objects/pack/pack-f4aecac48820d927b268c41beb600943c1097682.mtimes
     699 .git/objects/pack/pack-f4aecac48820d927b268c41beb600943c1097682.pack
     100 .git/objects/pack/pack-f4aecac48820d927b268c41beb600943c1097682.rev
    8898 total
$ git count-objects -vH | grep size-pack
size-pack: 8.38 KiB
```

Loose holatda 11 050 bayt (diskda 116 KiB) edi, endi barcha obyektlar `.pack` larda 4987 + 699 = 5686 bayt. Diskdagi joy esa 116 KiB dan ~9 KiB ga tushdi. (`size-pack` `.pack` va `.idx` ni birga sanaydi: 4987 + 1492 + 699 + 1408 = 8586 bayt = 8.38 KiB.)

`gc` ref'larni ham yig'di ([17-bob](17-reflar-va-head.md)):

```bash
$ ls .git/refs/heads
$ cat .git/packed-refs
# pack-refs with: peeled fully-peeled sorted 
2d7a93ba2401da39cafd7dc5fa99266695480e33 refs/heads/main
```

Obyektlarni o'qish esa avvalgidek ishlaydi:

```bash
$ git cat-file -p main~1:ombor.py | head -3
def hisobla_1(x, y):
    """1-hisob: x va y ustida amal."""
    return x * 1 + y * 37 - 1
$ git fsck
dangling commit 516c2096f9373aa12481354e0cbfa4f44bdf19d2
...
```

## Kod: `git verify-pack -v` — pack ichida nima bor

`git verify-pack` — `.idx` va unga mos `.pack` ni tekshiradigan plumbing buyruq. `-v` bilan har obyektni va delta zanjirlari gistogrammasini chiqaradi. Asosiy pack:

```bash
$ git verify-pack -v .git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.idx
2d7a93ba2401da39cafd7dc5fa99266695480e33 commit 230 164 12
b336d1a19459d57cf25b530875cb59d17f100dd6 commit 225 160 176
bf3788a9541a2b113176e9ada6d55ae10750d077 commit 219 151 336
f1ad0c9778f71df4dd5c987597ed24518e65a927 commit 220 153 487
35492cfd394c29c3ae03d9b527d8d8d9b1342749 commit 171 122 640
83baae61804e65cc73a7201a7252750c76066a30 blob   10 19 762
fa49b077972391ad58037050f2a75f74e3671e92 blob   9 18 781
83ea834c15d18eccbc8f35d830e53745dce5e88e blob   29010 3714 799
1f7a7a472abf3dd9643fd615f6da379c4acb3e3a blob   10 19 4513
362651b3ab442573b86d9fe71d9598c843dd8968 tree   137 137 4532
d8329fc1cc938780ffdd9f94e0d364e0ea74f579 tree   36 46 4669
117c386fc6c274595df28178dd0b6d20bba0b2ba tree   137 137 4715
9f32a04a5cf6744e9f09925fffc33be855999caf blob   9 20 4852 1 83ea834c15d18eccbc8f35d830e53745dce5e88e
3c4e9cd789d88d8d89c1073707c3585e41b0e614 tree   8 19 4872 1 117c386fc6c274595df28178dd0b6d20bba0b2ba
0155eb4229851634a0f03eb265b69f5a2d56f341 tree   71 76 4891
non delta: 13 objects
chain length = 1: 2 objects
.git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.pack: ok
```

Ma'lumotnomadagi format:

```text
<hash> <tur> <hajm> <pack'dagi hajm> <ofset>                             ← delta emas
<hash> <tur> <hajm> <pack'dagi hajm> <ofset> <zanjir chuqurligi> <asos>  ← delta
```

- **hajm** — delta bo'lmagan obyektda obyektning asl (ochilgan) hajmi; delta'da esa **delta'ning** ochilgan hajmi.
- **pack'dagi hajm** — shu yozuv pack faylida egallagan baytlar (sarlavha + siqilgan ma'lumot).
- **ofset** — `.pack` boshidan necha baytda boshlanadi.

Ikkita qatorga e'tibor bering:

```text
83ea834... blob   29010 3714 799                ← ikkinchi (yangi) versiya — to'liq
9f32a04... blob   9 20 4852 1 83ea834...         ← birinchi (eski) versiya — delta
```

Birinchi versiya (`9f32a04`) endi **9 baytlik delta** (pack'da 20 bayt) bo'lib saqlanyapti va uning asosi — ikkinchi versiya `83ea834`. Ya'ni Git **yangi** versiyani to'liq, **eskisini** delta qilib saqladi. Pro Git'dagi natija ham aynan shunday va u sababini shunday tushuntiradi: sizga ko'pincha faylning eng yangi versiyasi tezroq kerak bo'ladi. (Aslida asosiy mezon — hajm: Git kattaroq obyektni asos qilishni afzal ko'radi, va o'sib boradigan fayllarda bu odatda yangi versiya. Pastda boshqacha holatni ham ko'ramiz.)

Tree'lar ham delta bo'lishi mumkin: `3c4e9cd` (15-bobdagi uchinchi tree) — `117c386` ga nisbatan 8 baytlik delta.

`non delta: 13 objects`, `chain length = 1: 2 objects` — gistogramma: 13 ta obyekt to'liq, 2 tasi bevosita to'liq obyektga tayanadigan delta (zanjir uzunligi 1). `ok` — pack checksum'i va har obyekt to'g'ri.

`-s` (`--stat-only`) obyektlarni tekshirmasdan faqat gistogrammani chiqaradi. Katta pack'lardan eng katta obyektlarni topish uchun `verify-pack -v` chiqishini 3-ustun bo'yicha saralash — [42-bobdagi](42-reflog-va-tiklash.md) usul.

## Kod: delta ichida nima bor

Loose va packed obyektlarni bir xil ko'rsatadigan zamonaviyroq vosita — `git cat-file --batch-check` formatlari bilan:

```bash
$ printf 'main:ombor.py\nmain~1:ombor.py\nmain\n' | git cat-file --batch-check='%(objectname) %(objecttype) %(objectsize) %(objectsize:disk) %(deltabase)'
83ea834c15d18eccbc8f35d830e53745dce5e88e blob 29010 3714 0000000000000000000000000000000000000000
9f32a04a5cf6744e9f09925fffc33be855999caf blob 29002 20 83ea834c15d18eccbc8f35d830e53745dce5e88e
2d7a93ba2401da39cafd7dc5fa99266695480e33 commit 230 164 0000000000000000000000000000000000000000
```

`%(objectsize)` — obyektning **mantiqiy** hajmi (29002, delta bo'lsa ham), `%(objectsize:disk)` — diskdagi haqiqiy hajmi (20 bayt), `%(deltabase)` — delta asosi (nollar — delta emas). `verify-pack` dagi "9" esa delta'ning o'z hajmi edi — ikkisini chalkashtirmang.

9 baytda nima yozilgan? `gitformat-pack` hujjati bo'yicha pack'dagi har yozuv quyidagicha boshlanadi: 3 bit **tur** va o'zgaruvchan uzunlikdagi **hajm**. Turlar: `1` commit, `2` tree, `3` blob, `4` tag, `6` OFS_DELTA (asos — shu pack ichidagi ofset bo'yicha), `7` REF_DELTA (asos — hash bo'yicha). Python bilan 4852-baytdagi yozuvni ochamiz:

```bash
$ python3 - <<'EOF'
import zlib, glob
data = open(glob.glob('.git/objects/pack/pack-d22*.pack')[0], 'rb').read()
pos = 4852
c = data[pos]; typ = (c >> 4) & 7; size = c & 15; shift = 4; pos += 1
while c & 0x80:
    c = data[pos]; size |= (c & 0x7f) << shift; shift += 7; pos += 1
print('tur:', typ, 'delta hajmi:', size)
c = data[pos]; ofs = c & 0x7f; pos += 1
while c & 0x80:
    c = data[pos]; ofs = ((ofs + 1) << 7) | (c & 0x7f); pos += 1
print('baza ofseti:', 4852 - ofs)
delta = zlib.decompress(data[pos:])
print('delta baytlari:', delta.hex(' '))
EOF
tur: 6 delta hajmi: 9
baza ofseti: 799
delta baytlari: d2 e2 01 ca e2 01 b0 4a 71
```

- Tur `6` — OFS_DELTA; asos 799-baytda, ya'ni `83ea834` (`verify-pack` dagi ofset bilan mos).
- `d2 e2 01` — asos hajmi, 7 bitli bo'laklarda: `0x52 + 0x62·128 + 1·16384 = 29010`.
- `ca e2 01` — natija hajmi: `29002`.
- `b0 4a 71` — bitta **nusxalash** (copy) buyrug'i: birinchi bayt `1`-bit bilan boshlanadi (`0xb0 = 10110000`), ofset berilmagan (0), hajm `0x714a = 29002`. Ya'ni: "asosning boshidan 29002 baytni nusxala".

Eski versiya — yangi versiyaning oxirgi 8 baytisiz o'zi. Delta formatida ikki xil buyruq bor: asosdan bayt oralig'ini **nusxalash** va yangi baytlarni **qo'shish** (birinchi bit `0`, keyingi 7 bit — qo'shiladigan baytlar soni). Har qanday delta shu ikkisining ketma-ketligi.

Yana bir nozik joy (hujjatdan): pack ichidagi obyektlarda loose'dagi `blob 29002\0` sarlavhasi **yo'q** — tur va hajm yozuv boshidagi baytlarda. Hash hisoblanganda esa sarlavha qayta tiklanadi, shuning uchun hash'lar loose holatdagi bilan bir xil.

## Kod: `.pack` va `.idx` baytlari

`.pack` boshi:

```bash
$ xxd .git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.pack | head -1
00000000: 5041 434b 0000 0002 0000 000f 960e 789c  PACK..........x.
```

```text
50 41 43 4b    "PACK" — imzo
00 00 00 02    versiya 2 (Git 2 va 3 ni o'qiydi, faqat 2 ni yozadi)
00 00 00 0f    obyektlar soni: 15
96 0e          1-yozuv: tur 1 (commit), hajm 6 + 14·16 = 230 → 2d7a93b
78 9c          zlib oqimining boshlanishi
```

`.idx` (2-versiya) — `gitformat-pack` bo'yicha tuzilishi:

```text
ff 74 4f 63            imzo "\377tOc"
00 00 00 02            versiya 2
256 × 4 bayt           fan-out jadvali
N × 20 bayt            saralangan obyekt hash'lari
N × 4 bayt             har obyekt uchun CRC32
N × 4 bayt             ofsetlar (2 GiB dan katta pack'larda — qo'shimcha 8 baytli jadval)
20 bayt                .pack checksum'i
20 bayt                .idx ning o'z checksum'i
```

Hajmini tekshiramiz: 8 + 1024 + 15·20 + 15·4 + 15·4 + 40 = 1492 — `wc -c` bergan bilan bir xil.

**Fan-out jadvali** — qidiruvni tezlashtirish uchun: `fanout[k]` — birinchi bayti `k` dan kichik yoki teng bo'lgan obyektlar soni. `83ea834` ni topish uchun Git `fanout[0x82]` va `fanout[0x83]` ni o'qiydi va faqat shu oraliqdagi hash'lar orasida ikkilik qidiruv qiladi:

```bash
$ python3 - <<'EOF'
import struct, glob
idx = open(glob.glob('.git/objects/pack/pack-*.idx')[0], 'rb').read()
print(idx[:4], struct.unpack('>I', idx[4:8])[0])
fan = struct.unpack('>256I', idx[8:8+1024])
n = fan[255]; print('jami:', n)
print('fanout[0x82] =', fan[0x82], ' fanout[0x83] =', fan[0x83])
names = [idx[1032+20*i:1052+20*i].hex() for i in range(n)]
crc0 = 1032 + 20*n
offs = struct.unpack('>%dI' % n, idx[crc0+4*n:crc0+8*n])
for i in range(fan[0x82], fan[0x83]):
    print(i, names[i], 'ofset', offs[i])
EOF
b'\xfftOc' 2
jami: 15
fanout[0x82] = 7  fanout[0x83] = 9
7 83baae61804e65cc73a7201a7252750c76066a30 ofset 762
8 83ea834c15d18eccbc8f35d830e53745dce5e88e ofset 799
```

`83` bilan boshlanadigan ikki obyekt bor — 7- va 8-o'rinda. `83ea834` ofseti 799 — `verify-pack` bilan bir xil. Million obyektli pack'da ham bu bir necha o'nlab taqqoslash: fan-out qidiruvni 256 marta toraytiradi.

Oxirgi baytlar:

```bash
$ tail -c 20 .git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.pack | xxd -p
d2242bc45602605407df99ac1edb0beac5dc1e4d
$ tail -c 40 .git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.idx | xxd -p
d2242bc45602605407df99ac1edb0beac5dc1e4d6280a371b11c19813206
c80caebe5ce13840c914
```

Pack'ning nomi (`pack-d2242bc...`) — uning checksum'i, ya'ni pack mazmunidan hisoblangan hash. `.idx` ham shu checksum'ni saqlaydi — shu orqali to'g'ri `.pack` ga tegishli ekani tekshiriladi.

## Kod: delta zanjirlari, `--depth` va `--window`

Delta'ning asosi o'zi ham delta bo'lishi mumkin — shunday qilib **delta zanjiri** hosil bo'ladi. Obyektni o'qish uchun Git zanjirning boshidagi to'liq obyektdan boshlab har deltani ketma-ket qo'llaydi. Zanjir qanchalik uzun bo'lsa — joy tejaladi, lekin o'qish sekinlashadi.

Buni ko'rish uchun yangi repo'da `ombor.py` ning olti versiyasini yasaymiz. Har versiyada faylning **o'rtasidagi** boshqa bir funksiya nomi o'zgaradi (`hisobla_20` → `hisob_20`, keyin `hisobla_30` ...):

```bash
$ git init -q -b main 18-zanjir && cd 18-zanjir
$ git -C ../18-pack show main~1:ombor.py > ombor.py
$ git add ombor.py && git commit -q -m "v1"
$ for v in 2 3 4 5 6; do
    perl -pi -e "s/hisobla_${v}0\(/hisob_${v}0(/" ombor.py
    GIT_AUTHOR_DATE=2026-10-07T10:0$v:00+05:00 GIT_COMMITTER_DATE=2026-10-07T10:0$v:00+05:00 git commit -q -am "v$v"
  done
$ git log --oneline | head -2
478d988 v6
fdc1423 v5
$ git gc -q
$ git verify-pack -v .git/objects/pack/*.idx | grep -E "blob|chain|non delta"
9f32a04a5cf6744e9f09925fffc33be855999caf blob   29002 3704 860
674c69e12fa0b65acfa5983ff3a3c70005b374cc blob   24 37 4564 1 9f32a04a5cf6744e9f09925fffc33be855999caf
47192308cbfed36074039e8ca0c29993b6131545 blob   19 31 4601 2 674c69e12fa0b65acfa5983ff3a3c70005b374cc
0acbbf22e1e344773cd96b356cf4931fdf171fac blob   14 25 4726 2 674c69e12fa0b65acfa5983ff3a3c70005b374cc
5f01b658de8c96218fbda28e16d886ca14bab38c blob   19 32 4845 1 9f32a04a5cf6744e9f09925fffc33be855999caf
d20937caa1eb572c50198570f07426fa0e2158fe blob   14 26 4924 1 9f32a04a5cf6744e9f09925fffc33be855999caf
non delta: 13 objects
chain length = 1: 3 objects
chain length = 2: 2 objects
$ wc -c .git/objects/pack/*.pack
    5017 .git/objects/pack/pack-1d0e3f6e8b534dffe444e4aa2e70e9ae01cc0d1d.pack
```

Bu safar to'liq saqlangan — **birinchi** versiya `9f32a04` (18-pack'dagi `ombor.py` ning birinchi versiyasi bilan bir xil hash — mazmun bir xil). Sababi — hajm: har o'zgarish nomdan 2 belgini olib tashladi, shuning uchun v1 eng katta (29002), v6 eng kichik. Git kattasini asos qildi. Pro Git'dagi "eng yangisi to'liq" — qoida emas, ko'p uchraydigan natija.

Zanjirlar:

```text
9f32a04 (v1, to'liq)
 ├── d20937c (v2)           chuqurlik 1
 ├── 5f01b65 (v3)           chuqurlik 1
 └── 674c69e (v4)           chuqurlik 1
      ├── 0acbbf2 (v5)      chuqurlik 2
      └── 4719230 (v6)      chuqurlik 2
```

Ikki sozlama bu jarayonni boshqaradi (`git repack` ma'lumotnomasi):

- **`--window=<n>`** (standart 10) — obyektlar tur, hajm va nom bo'yicha saralanadi, keyin har obyekt o'zidan oldingi `n` ta obyekt bilan solishtiriladi: qaysi biriga nisbatan delta eng kichik chiqsa, o'sha asos bo'ladi. Katta oyna — yaxshiroq delta, lekin sekinroq.
- **`--depth=<n>`** (standart 50, maksimum 4095) — zanjirning eng katta uzunligi. Ma'lumotnoma: juda chuqur zanjir o'qish tomonini sekinlashtiradi, chunki obyektni olish uchun delta'lar shuncha marta qo'llanadi.

Sinaymiz. `-a -d` — hammasini bitta pack'ga yig'ib, eskisini o'chirish; `-f` — mavjud deltalarni qayta ishlatmasdan qaytadan hisoblash:

```bash
$ git repack -a -d -f --depth=1 -q
$ git verify-pack -v .git/objects/pack/*.idx | grep -E "blob|chain|non delta"
9f32a04a5cf6744e9f09925fffc33be855999caf blob   29002 3704 860
47192308cbfed36074039e8ca0c29993b6131545 blob   34 45 4564 1 9f32a04a5cf6744e9f09925fffc33be855999caf
0acbbf22e1e344773cd96b356cf4931fdf171fac blob   29 41 4703 1 9f32a04a5cf6744e9f09925fffc33be855999caf
674c69e12fa0b65acfa5983ff3a3c70005b374cc blob   24 37 4791 1 9f32a04a5cf6744e9f09925fffc33be855999caf
5f01b658de8c96218fbda28e16d886ca14bab38c blob   19 32 4875 1 9f32a04a5cf6744e9f09925fffc33be855999caf
d20937caa1eb572c50198570f07426fa0e2158fe blob   14 26 4954 1 9f32a04a5cf6744e9f09925fffc33be855999caf
non delta: 13 objects
chain length = 1: 5 objects
$ wc -c .git/objects/pack/*.pack
    5047 .git/objects/pack/pack-e6ef16002e45275de93cf59e36203b8448d1ddb2.pack
```

Hamma delta endi to'g'ridan-to'g'ri v1 ga tayanadi — o'qish uchun bitta qadam. Lekin har delta kattaroq (v6 uchun 19 → 34 bayt): v1 dan uzoqroq versiyalar ko'proq farq qiladi. Pack 30 bayt kattalashdi. Endi oynani nolga qo'yamiz — delta qidirilmaydi:

```bash
$ git repack -a -d -f --window=0 -q
$ git verify-pack -v .git/objects/pack/*.idx | grep -E "blob|chain|non delta"
47192308cbfed36074039e8ca0c29993b6131545 blob   28992 3718 860
0acbbf22e1e344773cd96b356cf4931fdf171fac blob   28994 3717 4672
674c69e12fa0b65acfa5983ff3a3c70005b374cc blob   28996 3715 8436
5f01b658de8c96218fbda28e16d886ca14bab38c blob   28998 3711 12198
d20937caa1eb572c50198570f07426fa0e2158fe blob   29000 3707 15956
9f32a04a5cf6744e9f09925fffc33be855999caf blob   29002 3704 19710
non delta: 18 objects
$ wc -c .git/objects/pack/*.pack
   23434 .git/objects/pack/pack-995290526f7b23c5b37745eaa4d0ae9c3ceb2b5b.pack
```

Deltasiz pack 4,7 marta katta. Endi oddiy `git gc` qilamiz — u tuzatadimi?

```bash
$ git gc -q
$ git verify-pack -v .git/objects/pack/*.idx | tail -3
9f32a04a5cf6744e9f09925fffc33be855999caf blob   29002 3704 19710
non delta: 18 objects
.git/objects/pack/pack-995290526f7b23c5b37745eaa4d0ae9c3ceb2b5b.pack: ok
$ git repo structure | sed -n '20,25p'
|     * Tags                |      0 B   |
|   * Disk size             |  22.85 KiB |
|     * Commits             |    848 B   |
|     * Trees               |    282 B   |
|     * Blobs               |  21.75 KiB |
|     * Tags                |      0 B   |
```

**Yo'q.** Oddiy `gc` mavjud pack'dagi ma'lumotni qayta ishlatadi (`reused`) — tez bo'lishi uchun deltalarni qaytadan qidirmaydi. (`git repo structure` — Git 2.52 da qo'shilgan buyruq: repo'dagi ref'lar va obyektlar soni, ochilgan va diskdagi hajmi haqida jadval.) Deltalarni qaytadan hisoblash uchun `--aggressive` kerak:

```bash
$ git gc -q --aggressive
$ git verify-pack -v .git/objects/pack/*.idx | grep -E "chain|non"
non delta: 13 objects
chain length = 1: 3 objects
chain length = 2: 2 objects
$ wc -c .git/objects/pack/*.pack
    5017 .git/objects/pack/pack-1d0e3f6e8b534dffe444e4aa2e70e9ae01cc0d1d.pack
$ git repo structure | sed -n '21p'
|   * Disk size             |   4.87 KiB |
```

Pack birinchi `gc` dagi bilan **aynan bir xil** (o'sha nom — `pack-1d0e3f6...`). `git gc` ma'lumotnomasining "AGGRESSIVE" bo'limi: `--aggressive` `repack -f` ni chaqiradi (mavjud deltalarni tashlab, qaytadan hisoblaydi) va oynani 250 ga (`gc.aggressiveWindow`), chuqurlikni 50 ga (`gc.aggressiveDepth`) qo'yadi. Natija ko'p jihatdan doimiy bo'ladi — keyingi oddiy `gc` lar bu deltalarni qayta ishlatadi. Hujjat ogohlantiradi: bu ancha uzoq ishlaydi va ko'pchilik repo'lar uchun o'zini oqlamaydi; o'lchab ko'rmasdan ishlatmang. Amaliy holat — boshqa tizimdan yomon import qilingan repo'ni bir marta tozalash.

## Kod: cruft pack va yetib bo'lmaydigan obyektlar

18-pack'ga qaytamiz. `gc` ikkinchi bosqichda 12 ta obyektni alohida pack'ga yozgan edi. Ular kimlar?

```bash
$ git verify-pack -v .git/objects/pack/pack-f4aecac48820d927b268c41beb600943c1097682.idx
f0a62b9da3e8fe4f9c802ce27f55b52fad6bf975 commit 219 153 12
eab77747e84335186bce350b12b97ba0d06a594a commit 59 57 165 1 f0a62b9da3e8fe4f9c802ce27f55b52fad6bf975
516c2096f9373aa12481354e0cbfa4f44bdf19d2 commit 46 57 222 2 eab77747e84335186bce350b12b97ba0d06a594a
135184415ca7c9328906a00c20f43bf59ccf793c commit 20 31 279 3 516c2096f9373aa12481354e0cbfa4f44bdf19d2
2885f9cdebb0177ad14fb36db64716b706a541e3 commit 21 33 310 2 eab77747e84335186bce350b12b97ba0d06a594a
32eb30f2144e9c1887ff4528474dfa2f90fa5d17 tree   136 119 343
63a19cab225ea0d619c8e0eeab228b82abb9abe0 commit 15 26 462 4 135184415ca7c9328906a00c20f43bf59ccf793c
7e3cd2978fc6512a267c5e0e336b61bf7bdef215 commit 29 41 488 2 eab77747e84335186bce350b12b97ba0d06a594a
b1c0df9657b54681181a3f5aa59373135bc0348f tree   108 85 529
bd9dbf5aae1a3862dd1526723246b20206e5fc37 blob   16 26 614
d670460b4b4aece5915caf5c68d12f560a9fe3e4 blob   13 22 640
d78df762e1611be4893ce9298c07f33bcd7badec commit 6 17 662 2 eab77747e84335186bce350b12b97ba0d06a594a
non delta: 5 objects
chain length = 1: 1 object
chain length = 2: 4 objects
chain length = 3: 1 object
chain length = 4: 1 object
```

Tanish hash'lar: 16-bobda "hash'ni nima o'zgartiradi" bo'limida yasalgan commit'lar (`7e3cd29`, `1351844`, `63a19ca`, `f0a62b9` ...), 15-bobdagi ikki tree va 14-bobdagi ikki blob. Ularning birortasiga hech qaysi ref, reflog yoki index ishora qilmaydi — **yetib bo'lmaydigan** (unreachable) obyektlar. Bu yerda chuqurligi 4 gacha bo'lgan delta zanjirlari ham bor: deyarli bir xil commit'lar bir-biriga nisbatan bir necha o'n baytdan iborat.

Bu **cruft pack** ("chiqindi" pack). Ma'lumotnoma: `--cruft` (standart yoqilgan, `gc.cruftPacks = true`) bo'lsa, yetib bo'lmaydigan obyektlar loose fayllar o'rniga alohida pack'ga yoziladi. Yonidagi `.mtimes` fayli har obyektning oxirgi o'zgartirilgan vaqtini saqlaydi — chunki pack ichida har obyektning o'z fayl vaqti yo'q, `gc` esa "qancha vaqtdan beri keraksiz" degan savolga javob berishi kerak.

**Pro Git bilan farq.** Pro Git'da `gc` dan keyin ikki "osilgan" blob (`what is up, doc?` va `test content`) **loose** bo'lib qolgan. Bu — cruft pack'lardan oldingi xatti-harakat. Uni hozir ham ko'rish mumkin:

```bash
$ git -c gc.cruftPacks=false gc -q
$ find .git/objects -type f | sort
.git/objects/13/5184415ca7c9328906a00c20f43bf59ccf793c
.git/objects/28/85f9cdebb0177ad14fb36db64716b706a541e3
.git/objects/32/eb30f2144e9c1887ff4528474dfa2f90fa5d17
.git/objects/51/6c2096f9373aa12481354e0cbfa4f44bdf19d2
.git/objects/63/a19cab225ea0d619c8e0eeab228b82abb9abe0
.git/objects/7e/3cd2978fc6512a267c5e0e336b61bf7bdef215
.git/objects/b1/c0df9657b54681181a3f5aa59373135bc0348f
.git/objects/bd/9dbf5aae1a3862dd1526723246b20206e5fc37
.git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4
.git/objects/d7/8df762e1611be4893ce9298c07f33bcd7badec
.git/objects/ea/b77747e84335186bce350b12b97ba0d06a594a
.git/objects/f0/a62b9da3e8fe4f9c802ce27f55b52fad6bf975
.git/objects/info/commit-graph
.git/objects/info/packs
.git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.idx
.git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.pack
.git/objects/pack/pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.rev
$ git count-objects -v | head -4
count: 12
size: 48
in-pack: 15
packs: 1
```

Cruft pack yo'qoldi va 12 ta obyekt loose bo'lib "sochildi" (`repack -A` xatti-harakati). Ma'lumotnoma ikkala usulning maqsadi bir ekanini aytadi: yetib bo'lmaydigan obyektlar **darhol o'chirilmaydi**, balki keyingi `gc` lardan birida muddati o'tgach o'chiriladi. Cruft pack'ning afzalligi: minglab keraksiz obyekt minglab mayda fayl bo'lib qolmaydi.

### Qachon o'chiriladi: `gc.pruneExpire` va `git prune`

`gc.pruneExpire` ma'lumotnomasi: `git gc` `git prune --expire 2.weeks.ago` ni (cruft pack'larda — `repack --cruft --cruft-expiration 2.weeks.ago` ni) chaqiradi. Ya'ni yetib bo'lmaydigan obyekt **ikki haftadan eski** bo'lsagina o'chiriladi. Bizning obyektlar bugun yaratilgan:

```bash
$ git prune --dry-run --expire=2.weeks.ago
$ git prune --dry-run | head -4
135184415ca7c9328906a00c20f43bf59ccf793c commit
2885f9cdebb0177ad14fb36db64716b706a541e3 commit
32eb30f2144e9c1887ff4528474dfa2f90fa5d17 tree
516c2096f9373aa12481354e0cbfa4f44bdf19d2 commit
```

`--expire` bilan — hech narsa (hammasi yangi). `--expire` siz `prune` yoshiga qaramaydi va hammasini o'chirishga tayyor. `-n`/`--dry-run` — faqat ko'rsatish. Ma'lumotnoma bo'yicha `git prune` — `fsck --unreachable` ning natijasini olib, faqat **loose** obyektlarni o'chiradi; pack ichidagi yetib bo'lmaydigan obyektlar qoladi (ular uchun `repack`). Odatda uni to'g'ridan-to'g'ri emas, `gc` orqali ishlatish tavsiya etiladi.

Muhlatni bekor qilish — `--prune=now`:

```bash
$ git gc -q --prune=now
$ git count-objects -v | head -4
count: 0
size: 0
in-pack: 15
packs: 1
$ git fsck
$ git cat-file -t d670460b4b4aece5915caf5c68d12f560a9fe3e4
fatal: git cat-file: could not get object info
```

Endi faqat yetib boriladigan 15 obyekt qoldi, `fsck` jim. 14-bobdan beri omborda turgan `test content` blob'i (`d670460`) **butunlay** yo'q.

> **Ogohlantirish.** `--prune=now` ni oddiy ishda ishlatmang. `gc` ma'lumotnomasi ("NOTES") buning sababini tushuntiradi: boshqa Git jarayoni (masalan IDE ichidagi Git yoki parallel `commit`) obyekt yozib, hali unga ref yaratmagan bo'lishi mumkin. Muhlat bo'lmasa, `gc` shu obyektni "keraksiz" deb o'chiradi va repo **buziladi**. Ikki haftalik muhlat aynan shundan himoya: muhlatdan yangi obyekt va undan yetib boriladigan hamma narsa saqlanadi, mavjud obyektni qayta yozayotgan buyruqlar esa uning vaqtini yangilaydi. Bundan tashqari, `--prune=now` dan keyin "yo'qolgan" commit'ni tiklab bo'lmaydi.

### `gc` nimani "kerakli" deb hisoblaydi

`gc` ma'lumotnomasi ro'yxati — bularning birortasidan yetib boriladigan obyekt **o'chirilmaydi**:

- branch'lar va teglar (`refs/heads`, `refs/tags`);
- remote-tracking branch'lar (`refs/remotes`);
- `refs/` ostidagi har qanday boshqa ref (`refs/stash`, `refs/notes` ...);
- **reflog'lar** — `amend` yoki `reset` dan keyin branch'dan chiqib qolgan commit'lar ham;
- **index** — `git add` qilingan, lekin commit qilinmagan blob'lar.

Hujjat bitta istisnoni alohida aytadi: `git notes` bilan obyektga qo'shilgan eslatma o'sha obyektni "tirik" saqlamaydi. Shuning uchun `reset --hard` dan keyin "yo'qolgan" commit `gc` dan keyin ham joyida — reflog unga ishora qiladi. Reflog yozuvlarining o'zi muddati o'tgach (standart 90 va 30 kun) `reflog expire` bilan o'chadi — bu tafsilotlar va qo'lda tozalash [42-bobda](42-reflog-va-tiklash.md).

```text
reflog yozuvi muddati o'tadi (30/90 kun)
        ↓
obyekt hech qaysi ref/reflog/index'dan yetib bo'lmaydi → cruft pack (yoki loose)
        ↓
yana 2 hafta (gc.pruneExpire)
        ↓
keyingi gc → obyekt o'chiriladi
```

## Kod: `gc` ichida nima ishlaydi

`GIT_TRACE` bilan `gc` chaqiradigan buyruqlarni ko'rish mumkin ([48-bob](48-muhit-ozgaruvchilari.md)). Pack'lashdan oldingi 18-pack nusxasida:

```bash
$ GIT_TRACE=1 git gc --quiet 2>&1 | grep run_command
... run_command: git pack-refs --all --prune
... run_command: git reflog expire --all
... run_command: git worktree prune --expire 3.months.ago
... run_command: git rerere gc
... run_command: git repack -d -l -q --cruft --cruft-expiration=2.weeks.ago
... run_command: git pack-objects --local --quiet --delta-base-offset --honor-pack-keep .git/objects/pack/.tmp-31242-pack --keep-true-parents --non-empty --all --reflog --indexed-objects
... run_command: git pack-objects --local --quiet --delta-base-offset --honor-pack-keep .git/objects/pack/.tmp-31242-pack --cruft --cruft-expiration=2.weeks.ago --non-empty
... run_command: git prune --expire 2.weeks.ago --no-progress
```

Har qatorni bobning qaysi qismi tushuntiradi:

| Buyruq | Vazifa |
| --- | --- |
| `pack-refs --all --prune` | Ref'larni `packed-refs` ga yig'ish ([17-bob](17-reflar-va-head.md)); `gc.packRefs` bilan o'chiriladi |
| `reflog expire --all` | Eski reflog yozuvlarini o'chirish (`gc.reflogExpire`, [42-bob](42-reflog-va-tiklash.md)) |
| `worktree prune --expire 3.months.ago` | Yo'qolgan worktree'lar yozuvlarini tozalash ([49-bob](49-worktree-va-katta-repo.md)) |
| `rerere gc` | Eski `rerere` yozuvlarini tozalash ([26-bob](26-murakkab-merge.md)) |
| `repack -d -l --cruft` | Yetib boriladiganlarni bitta pack'ga, qolganlarini cruft pack'ga |
| `pack-objects ... --all --reflog --indexed-objects` | Ichki ishchi: "hamma ref'lar, reflog va index'dan yetib boriladigan obyektlar" |
| `prune --expire 2.weeks.ago` | Muddati o'tgan loose obyektlarni o'chirish |

Bulardan tashqari `gc` commit-graph faylini yozadi (`gc.writeCommitGraph`, standart `true`) — `.git/objects/info/commit-graph`. Bu fayl har commit'ning otalari, tree'si va "avlod raqami"ni ikkilik ko'rinishda saqlaydi: `git log --graph`, `merge-base` kabi graf ustidagi amallar commit obyektlarini ochmasdan ishlaydi. Katta tarixda bu sezilarli tezlik.

## Kod: avtomatik — `gc --auto` va `maintenance run --auto`

Pro Git: Git vaqti-vaqti bilan "auto gc" ni ishga tushiradi; ko'pincha u hech narsa qilmaydi:

```bash
$ git gc --auto
$ echo "exit=$?"
exit=0
```

Pro Git (va `gc.auto` ma'lumotnomasi) chegaralarni aytadi: taxminan **6700** loose obyekt (`gc.auto`) yoki **50** dan ortiq pack (`gc.autoPackLimit`). `gc.auto = 0` avtomatikani butunlay o'chiradi.

Git 2.56 da avtomatik ishni kim boshlaydi? Yangi repo'da bitta commit'ni kuzatamiz:

```bash
$ git init -q -b main 18-auto && cd 18-auto
$ echo a > a; git add a
$ GIT_TRACE=1 git commit -q -m a 2>&1 | grep -E "built-in|run_command"
git.c:506               trace: built-in: git commit -q -m a
run-command.c:673       trace: run_command: git maintenance run --auto --quiet --detach
git.c:506               trace: built-in: git maintenance run --auto --quiet --detach
```

Har commit oxirida `git maintenance run --auto --quiet --detach` chaqiriladi (`maintenance.auto`, standart `true`). `--detach` — fon rejimida, commit'ni kutdirmasdan (`maintenance.autoDetach`). `--auto` — "faqat chegaradan oshgan bo'lsa". `git maintenance is-needed` (Git 2.53) shu savolni ishga tushirmasdan beradi: kod `0` — kerak, `1` — kerak emas.

Chegarani ko'ramiz. Avval 7000 ta mayda fayl:

```bash
$ git init -q -b main 18-avto && cd 18-avto
$ mkdir kesh; python3 -c "
for i in range(1, 7001): open(f'kesh/f{i}.txt','w').write(f'yozuv {i}\n')"
$ git add kesh; git commit -q -m "7000 ta fayl"
$ git count-objects -v | head -2
count: 7003
size: 28180
$ ls .git/objects/17 | wc -l
      24
$ git maintenance is-needed --auto; echo "exit=$?"
exit=1
```

7003 > 6700, lekin "kerak emas". Sababi — `gc.auto` hujjatidagi **"taxminan"** so'zi: Git hamma papkalarni sanamaydi, bitta papkadagi fayllar soni bo'yicha umumiy sonni baholaydi. `17/` da 24 ta fayl — 256 papka bo'yicha bu ~6100. Yana 2000 fayl qo'shamiz:

```bash
$ python3 -c "
for i in range(7001, 9001): open(f'kesh/f{i}.txt','w').write(f'yozuv {i}\n')"
$ git add kesh
$ git count-objects
9003 objects, 36180 kilobytes
$ ls .git/objects/17 | wc -l
      34
$ git maintenance is-needed --auto; echo "exit=$?"
exit=0
$ git config set maintenance.autoDetach false
$ GIT_TRACE=1 git commit -q -m "yana 2000 ta" 2>&1 | grep run_command
... run_command: git maintenance run --auto --quiet --no-detach
... run_command: git repack -d -l -q --cruft --cruft-expiration=2.weeks.ago --write-midx
... run_command: git pack-objects --local --quiet --delta-base-offset --honor-pack-keep .git/objects/pack/.tmp-30963-pack --keep-true-parents --non-empty --all --reflog --indexed-objects
... run_command: git pack-objects --local --quiet --delta-base-offset --honor-pack-keep .git/objects/pack/.tmp-30963-pack --cruft --cruft-expiration=2.weeks.ago --non-empty
... run_command: git multi-pack-index write --no-progress --preferred-pack=pack-1a7bfa84d876e2967665d2591d7e7b5eff94b488.pack --refs-snapshot=... --stdin-packs
$ git count-objects -v | head -4
count: 0
size: 0
in-pack: 9006
packs: 1
$ ls .git/objects/pack
multi-pack-index
pack-1a7bfa84d876e2967665d2591d7e7b5eff94b488.idx
pack-1a7bfa84d876e2967665d2591d7e7b5eff94b488.pack
pack-1a7bfa84d876e2967665d2591d7e7b5eff94b488.rev
```

(`autoDetach` ni o'chirdik — jarayon fonda emas, ko'z oldimizda ishlashi uchun.) Commit oxirida avtomatik xizmat ishladi va 9006 obyektni bitta pack'ga yig'di. E'tibor bering: chaqirilgani — `git gc` emas, `repack ... --write-midx`. Bu Git 2.54 dagi o'zgarish: `git maintenance` standart holatda **`geometric`** strategiyasidan foydalanadi (`maintenance.strategy` ma'lumotnomasi; reliz eslatmasi: "git maintenance starts using the geometric strategy by default"). U pack'larni geometrik progressiya bo'yicha birlashtiradi (har pack keyingisidan kamida ikki marta katta bo'lishi kerak, `maintenance.geometric-repack.splitFactor`) — har safar butun omborni qaytadan yig'maydi. Hammasini bitta pack'ga yig'ish zarur bo'lgandagina cruft pack ham yasaladi. Yonidagi **`multi-pack-index`** — bir nechta pack uchun umumiy index: obyektni har `.idx` dan alohida izlamaslik uchun.

Pro Git va eski maqolalardagi "har nechta buyruqdan keyin `git gc --auto` ishlaydi" degan gap shu tarzda yangilangan: hozir `git maintenance run --auto` ishlaydi, u esa sozlamaga qarab `gc` ni yoki boshqa vazifalarni tanlaydi. `gc.auto`, `gc.autoPackLimit` chegaralari `gc` vazifasi uchun hamon amal qiladi.

## Kod: `git maintenance` — vazifalar va strategiyalar

`git maintenance run` vazifalarni bajaradi. Qaysi vazifa — `--task=<vazifa>` yoki sozlamadan. Ma'lumotnomadagi vazifalar:

| Vazifa | Nima qiladi |
| --- | --- |
| `gc` | To'liq `git gc` (sekin, katta repo'da butun omborni qayta yig'adi) |
| `geometric-repack` | Pack'larni geometrik progressiya bo'yicha birlashtirish |
| `loose-objects` | Loose obyektlarni kichik pack'ga yig'ish, pack'dagi nusxalarini o'chirish |
| `incremental-repack` | `multi-pack-index` orqali kichik pack'larni kattasiga yig'ish |
| `commit-graph` | commit-graph fayllarini bosqichma-bosqich yangilash |
| `prefetch` | Remote'lardan obyektlarni oldindan olib kelish (`refs/prefetch/` ga, remote-tracking branch'larga tegmasdan) |
| `pack-refs` | Ref'larni `packed-refs` ga yig'ish |
| `reflog-expire` | Eski reflog yozuvlarini o'chirish |
| `rerere-gc`, `worktree-prune` | `rerere` keshi va eskirgan worktree'larni tozalash |

Qo'lda `git maintenance run` (geometric strategiyasi) nima qilishini ko'ramiz — pack'lashdan oldingi 18-pack nusxasida:

```bash
$ GIT_TRACE=1 git maintenance run 2>&1 | grep run_command
... run_command: git pack-refs --all --prune
... run_command: git reflog expire --all
... run_command: git repack -d -l -q --cruft --cruft-expiration=2.weeks.ago --write-midx
... run_command: git pack-objects ... --all --reflog --indexed-objects
... run_command: git pack-objects ... --cruft --cruft-expiration=2.weeks.ago --non-empty
... run_command: git multi-pack-index write --no-progress --preferred-pack=pack-d2242bc45602605407df99ac1edb0beac5dc1e4d.pack --refs-snapshot=... --stdin-packs
... run_command: git commit-graph write --split --reachable --no-progress
... run_command: git worktree prune --expire 3.months.ago
... run_command: git rerere gc
```

Natijada o'sha `pack-d2242bc...` va cruft pack — `gc` bilan bir xil — va qo'shimcha ravishda `multi-pack-index` va bo'lingan commit-graph (`info/commit-graphs/`). Bir ogohlantirish (ma'lumotnoma, "TROUBLESHOOTING"): `git gc` va `git maintenance run` ni bir vaqtda ishlatmang — `gc` obyekt omborini `maintenance` kabi qulflamaydi. Iloji bo'lsa, `git gc` o'rniga `git maintenance run --task=gc` ishlating.

### `loose-objects` — ikki bosqichli xavfsiz yig'ish

```bash
$ git init -q -b main 18-loose && cd 18-loose
$ for i in $(seq 1 30); do echo "fayl $i" > f$i.txt; done; git add . && git commit -q -m "30 ta fayl"
$ git maintenance run --task=loose-objects
$ git count-objects -v
count: 32
size: 128
in-pack: 32
packs: 1
size-pack: 3
prune-packable: 32
garbage: 0
size-garbage: 0
$ ls .git/objects/pack
loose-8ede52bf217270d06749fa79faa95bad9cd51809.idx
loose-8ede52bf217270d06749fa79faa95bad9cd51809.pack
loose-8ede52bf217270d06749fa79faa95bad9cd51809.rev
```

32 obyekt pack'ga (`loose-` nomli) yozildi, lekin loose fayllar **o'chirilmadi**: `count: 32`, `prune-packable: 32` — hammasi ikki joyda. Ma'lumotnoma sababini aytadi: parallel Git buyruqlari bilan to'qnashmaslik uchun vazifa ikki bosqichda ishlaydi — avval pack'da allaqachon bor loose obyektlarni o'chiradi, keyin qolganlarni yangi pack'ga yozadi. Birinchi ishga tushishda o'chiriladigan narsa yo'q edi; ikkinchisida loose nusxalar o'chadi. Buni qo'lda `git prune-packed` bilan ham qilish mumkin:

```bash
$ git prune-packed -n | head -3
rm -f .git/objects/00/6822714bd5e7833e657dfb46f1cd375a74ee99
rm -f .git/objects/01/8dd7d89d64210deee856b660168463111cc0b8
rm -f .git/objects/06/3adda0007b3ba4fc9fdd22a8466548e2b52510
$ git prune-packed
$ git count-objects -v | head -4
count: 0
size: 0
in-pack: 32
packs: 1
```

Hujjat bitta maslahat beradi: `loose-objects` va `gc` vazifalarini birga yoqmang — `gc` yetib bo'lmaydigan obyektlarni loose qilib qo'yishi mumkin, `loose-objects` esa ularni yana pack'ga qaytaradi.

`count-objects` dagi `garbage` ham shu yerda foydali — masalan, uzilib qolgan `repack` dan qolgan vaqtinchalik fayl:

```bash
$ echo x > .git/objects/pack/tmp_pack_eskirgan
$ git count-objects -v
warning: garbage found: .git/objects/pack/tmp_pack_eskirgan
...
garbage: 1
size-garbage: 0
$ rm .git/objects/pack/tmp_pack_eskirgan
```

### Rejali xizmat: `register` va `start`

`git maintenance start` repo'ni ro'yxatga oladi va operatsion tizim rejalashtiruvchisiga (Linux'da `systemd` taymeri yoki `cron`, macOS'da `launchctl`, Windows'da `schtasks`) soatlik `git maintenance run --schedule=hourly` qo'shadi; kunlik va haftalik vazifalar ham shu jarayonda bajariladi. `stop` — to'xtatish, `unregister` — ro'yxatdan chiqarish. `start` tizim sozlamalarini o'zgartirgani uchun uni bu yerda ishga tushirmaymiz; uning sozlama qismi — `register` ni alohida fayl bilan ko'ramiz:

```bash
$ git maintenance register --config-file ../18-maint.cfg
$ cat ../18-maint.cfg
[maintenance]
	repo = /tmp/misol/18-maint
$ git config list --local | grep -i maint
maintenance.auto=false
maintenance.strategy=incremental
```

Ma'lumotnomaga mos: `register` repo yo'lini `maintenance.repo` ga yozadi (odatda global config'ga, `--config-file` bo'lmasa), repo'da avtomatik "oldingi plan" xizmatni o'chiradi (`maintenance.auto = false`) va `maintenance.strategy = incremental` qo'yadi. `incremental` strategiyasida `gc` umuman ishlamaydi — hech narsa o'chirilmaydi, faqat yengil vazifalar: `prefetch` va `commit-graph` soatlik, `loose-objects` va `incremental-repack` kunlik, `pack-refs` haftalik.

Strategiyalar xulosasi (`maintenance.strategy`):

| Strategiya | Nima ishlaydi | Qachon |
| --- | --- | --- |
| `none` | Hech narsa | Rejali xizmat uchun standart |
| `gc` | `gc` vazifasi | Eski xatti-harakat |
| `geometric` | Geometrik repack, cruft pack, reflog va worktree tozalash, commit-graph | Qo'lda va avtomatik xizmat uchun standart (Git 2.54+); katta repo'lar uchun tavsiya |
| `incremental` | Ma'lumot o'chirmaydigan yengil vazifalar | `register`/`start` qo'yadi |

## Muhandislik nuqtai nazari: qachon nima qilish kerak

**Odatda — hech narsa.** `gc` ma'lumotnomasi ochiq aytadi: `git gc` ni qo'lda ishga tushirish faqat porcelain buyruqlarisiz obyekt qo'shilganda (masalan, `fast-import` bilan import), bir martalik optimallashtirishda yoki ommaviy importdan keyin tozalashda kerak. Kundalik ishda avtomatik xizmat yetarli.

**Katta repo'lar.** Bir necha gigabaytli repo'da to'liq `gc` daqiqalab ishlaydi va butun omborni qayta yozadi. Shunday repo'lar uchun:

- `git maintenance start` — fonda `incremental` strategiyasi (ma'lumot o'chirmaydi, foydalanuvchini kutdirmaydi);
- `geometric` strategiyasi — har safar hammasini emas, faqat kichik pack'larni birlashtiradi;
- `multi-pack-index` va reachability bitmap'lar (`repack -b`, `repack.writeBitmaps`) — ko'p pack'li omborda tez qidiruv va tez klon/fetch uchun;
- `gc.bigPackThreshold` yoki `--keep-largest-pack` — eng katta pack'ni har safar qayta yozmaslik.

Bular [49-bobda](49-worktree-va-katta-repo.md) `scalar` bilan birga ko'riladi.

**Server tomonda** pack'lar yanada muhim: har `fetch`/`clone` uchun server kerakli obyektlardan pack yasaydi va iloji boricha mavjud pack'lardan tayyor bo'laklarni qayta ishlatadi (`pack-reused`). Tarmoq protokoli va "thin pack" — [29-bobda](29-fetch-push-ichidan.md).

**Joy tejash uchun `.git` ni o'chirmang.** `.git` katta bo'lsa, avval `git count-objects -vH` va `git repo structure` bilan sababini toping. Ko'pincha sabab — tarixdagi katta binar fayl; uni `gc` emas, tarixni qayta yozish hal qiladi ([42-bob](42-reflog-va-tiklash.md)).

**Butunlikni tekshirish.** `verify-pack` pack checksum'ini va har obyektni tekshiradi; `git fsck` esa butun ombor bo'yicha bog'lanishni ham ([1-bob](01-versiya-nazorati.md)). Zaxira nusxadan tiklagandan keyin yoki disk xatosiga shubha bo'lganda ikkalasini ishga tushiring.

**`.keep` fayllari.** `pack-<hash>.keep` fayli bo'lsa, `repack` shu pack'ga tegmaydi (`--honor-pack-keep`). `fetch`/`push` paytida vaqtincha shunday fayl yaratiladi — kelayotgan pack parallel `gc` tomonidan o'chirib yuborilmasligi uchun.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Git har versiyani to'liq nusxa qilib "isrof qiladi" deb o'ylash | Pack'da o'xshash obyektlar delta bo'ladi; model to'liq surat, saqlash esa siqilgan | `git count-objects -vH`, `verify-pack -v` bilan o'lchang |
| `count-objects` dagi `size` ni baytlar deb o'qish | Bu disk bloklari; mayda fayllarda haqiqiy hajmdan ko'p marta katta | `-H` bilan va `cat .git/objects/??/* \| wc -c` bilan solishtiring |
| `verify-pack` dagi 3-ustunni obyekt hajmi deb hisoblash | Delta obyektda bu delta'ning hajmi | `cat-file --batch-check='%(objectsize) %(objectsize:disk)'` |
| Pack'dan keyin `.git/objects/xx/` bo'sh — "obyektlar yo'qoldi" deb qo'rqish | Ular `.pack` ichida | `git cat-file -p`, `git fsck` |
| `gc` dan keyin keraksiz commit hali bor — "gc ishlamadi" | Reflog unga ishora qiladi yoki 2 haftalik muhlat tugamagan | Odatda kutish; zarur bo'lsa [42-bobdagi](42-reflog-va-tiklash.md) tartib |
| Oddiy ishda `git gc --prune=now` | Parallel jarayon yozayotgan obyekt o'chib, repo buzilishi mumkin; tiklash imkoni yo'qoladi | Standart `2.weeks.ago` muhlatini qoldiring |
| Har kuni `git gc --aggressive` | Juda sekin, ko'pincha foydasi yo'q; natija baribir doimiy | Faqat yomon importdan keyin, bir marta, o'lchab |
| Yomon pack'ni oddiy `gc` tuzatadi deb kutish | `gc` mavjud deltalarni qayta ishlatadi | `git repack -a -d -f` yoki `gc --aggressive` |
| `git gc` va `git maintenance run` ni parallel ishlatish | `gc` ombor qulfini `maintenance` kabi olmaydi | `git maintenance run --task=gc` |
| Pro Git bo'yicha "gc dan keyin osilgan obyektlar loose qoladi" deb kutish | Git 2.56 da ular cruft pack'ga yoziladi | `ls .git/objects/pack/*.mtimes`; eski xatti-harakat — `gc.cruftPacks=false` |
| Eski maqoladagi "har commit'dan keyin `gc --auto`" | Hozir `maintenance run --auto`, standart strategiya `geometric` | `GIT_TRACE=1` bilan tekshiring |

## Amaliyot

1. Yangi repo'da 20 ta kichik fayl commit qiling. `git count-objects -v` dagi `size` ni `cat .git/objects/??/* | wc -c` bilan solishtiring. Farq qayerdan?
2. 20–30 KB matnli fayl yarating, commit qiling, oxiriga bitta qator qo'shib yana commit qiling. Ikkala blob'ning loose hajmini `wc -c` bilan o'lchang. `git gc` dan keyin `git verify-pack -v` da qaysi versiya to'liq, qaysi biri delta? `cat-file --batch-check` dagi `%(objectsize)` va `%(objectsize:disk)` ni solishtiring.
3. `.pack` faylining birinchi 12 baytini `xxd` bilan o'qing: imzo, versiya, obyektlar soni. `.idx` ning oxirgi 40 baytidan pack nomini toping.
4. Faylni oxiridan qisqartiradigan (yoki o'rtasini o'zgartiradigan) 6 ta versiya yarating. Qaysi versiya asos bo'lishini oldindan ayting va `verify-pack -v` bilan tekshiring. Keyin `git repack -a -d -f --depth=1` va `--window=0` bilan pack hajmi qanday o'zgarishini jadvalga yozing.
5. `--window=0` dan keyin oddiy `git gc` va `git gc --aggressive` ni sinang. Nega birinchisi pack'ni tuzatmaydi?
6. `git hash-object -w --stdin` bilan "osilgan" blob yarating. `git gc`, `git -c gc.cruftPacks=false gc`, `git prune --dry-run --expire=2.weeks.ago` va `git prune --dry-run` natijalarini solishtiring. Blob qachon haqiqatan o'chadi?
7. `GIT_TRACE=1 git commit ...` bilan commit qiling va avtomatik xizmat qanday chaqirilishini ko'ring. `git maintenance is-needed --auto` qachon `0` qaytarishini topish uchun loose obyektlar sonini oshiring.
8. (Qiyinroq) Python'da `.idx` (2-versiya) parser'ini yozing: fan-out jadvali orqali berilgan hash'ning ofsetini topsin, keyin `.pack` dan shu ofsetdagi yozuvni o'qib, tur va hajmni chiqarsin; OFS_DELTA bo'lsa, asosni topib, delta buyruqlarini (copy/insert) qo'llab, obyektni tiklasin. Natijani `git cat-file -p` bilan solishtiring.

## Rasmiy hujjat

- Pro Git — Packfiles: <https://git-scm.com/book/en/v2/Git-Internals-Packfiles>
- Pro Git — Maintenance and Data Recovery: <https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery>
- `git gc`: <https://git-scm.com/docs/git-gc>
- `git maintenance`: <https://git-scm.com/docs/git-maintenance>
- `git repack`: <https://git-scm.com/docs/git-repack>
- `git verify-pack`: <https://git-scm.com/docs/git-verify-pack>
- `git count-objects`: <https://git-scm.com/docs/git-count-objects>
- `git prune`: <https://git-scm.com/docs/git-prune>
- `git prune-packed`: <https://git-scm.com/docs/git-prune-packed>
- `gitformat-pack` — `.pack`, `.idx`, `.rev` formatlari: <https://git-scm.com/docs/gitformat-pack>
- `git config` — `gc.*` va `maintenance.*` sozlamalari: <https://git-scm.com/docs/git-config>
- `git repo`: <https://git-scm.com/docs/git-repo>
- Git 2.54 reliz eslatmalari (`geometric` standart strategiya): <https://github.com/git/git/blob/master/Documentation/RelNotes/2.54.0.adoc>
