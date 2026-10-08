# 12 — Teglar va alias'lar

[← Oldingi: Bekor qilish: `amend` va `restore`](11-bekor-qilish.md) · [Mundarija](README.md) · [Keyingi: Plumbing, porcelain va `.git` papkasi →](13-plumbing-va-porcelain.md)

## Tushuncha

Loyiha tarixida ba'zi nuqtalar boshqalaridan muhimroq: "1.0 versiya shu yerda chiqdi", "mijozga aynan shu holat topshirildi". Har safar 40 belgili hash'ni eslab qolish noqulay. **Teg** (tag) — tarixdagi aniq bir nuqtaga qo'yiladigan doimiy nom: `v1.0`, `v2.3.1`.

Teg branch'ga o'xshaydi — ikkalasi ham commit'ga ko'rsatkich. Farqi: branch yangi commit qilganda oldinga siljiydi, teg esa **joyida qoladi**. Kitobdagi xatcho'pga o'xshatsak: branch — o'qiyotgan joyingiz (har kuni ko'chadi), teg — "shu sahifa muhim" degan doimiy belgi.

Git'da tegning ikki turi bor:

| Tur | Nima | Qayerda saqlanadi | Kimga |
| --- | --- | --- | --- |
| **Lightweight** (yengil) | Faqat nom → commit hash'i | `.git/refs/tags/<nom>` faylida commit hash'i | Shaxsiy, vaqtinchalik belgilar |
| **Annotated** (izohli) | Alohida **teg obyekti**: kim qo'ygani, qachon, xabar, ixtiyoriy imzo | Omborda `tag` obyekti, `refs/tags/<nom>` unga ko'rsatadi | Relizlar, ommaviy versiyalar |

Rasmiy `git tag` ma'lumotnomasi aniq aytadi: annotated teglar **reliz uchun**, lightweight teglar **shaxsiy yoki vaqtinchalik** belgilar uchun. Shu sababli ba'zi buyruqlar (masalan `git describe`) standart bo'yicha lightweight teglarni e'tiborga olmaydi.

Bobning ikkinchi mavzusi — **alias** (taxallus): tez-tez yoziladigan buyruqqa o'zingiz qo'ygan qisqa nom. `git st` → `git status`, `git last` → `git log -1 HEAD`. Alias Git'ning o'zini o'zgartirmaydi — faqat siz yozgan so'zni boshqa buyruqqa almashtiradi.

## Nega shunday: nega ikki xil teg?

Ikki xil ehtiyoj bor:

1. **"Bu commit'ni tez topay"** — o'zingiz uchun, bir-ikki kunga. Nom va hash yetarli. Bu lightweight teg — bitta kichik fayl.
2. **"Bu — rasmiy reliz"** — boshqalar uchun, yillar davomida. Savollar paydo bo'ladi: tegni *kim* qo'ydi? *Qachon*? Nima uchun (reliz eslatmasi)? Teg haqiqatan muallifniki ekaniga ishonsa bo'ladimi (imzo)? Bu ma'lumotlar commit'ning o'zida yo'q — commit'ni bir kishi, tegni boshqa kishi boshqa kuni qo'yishi mumkin. Shuning uchun Git ular uchun alohida obyekt yaratadi.

Annotated teg — Git obyekti, demak o'z hash'iga ega va o'zgarmas ([14-bob](14-obyektlar-blob.md)). Imzolangan teg esa "bu relizni men chiqardim" degan kriptografik isbot ([44-bob](44-imzolash.md)). Pro Git va ma'lumotnoma bir xil maslahat beradi: **odatda annotated teg yarating**.

## Kod: tajriba repo'si

Beshta commit. Har commit'ga alohida vaqt beramiz (hash'lar takrorlanishi uchun):

```bash
$ git init -q -b main 12-teglar && cd 12-teglar
$ c() { echo "$2" >> app.txt; git add app.txt
        GIT_AUTHOR_DATE="2026-10-07T$1+05:00" GIT_COMMITTER_DATE="2026-10-07T$1+05:00" \
        git commit -q -m "$2"; }
$ c 10:00:00 "Loyiha boshlandi"; c 10:05:00 "Kirish sahifasi"; c 10:10:00 "Login formasi"
$ c 10:15:00 "Parolni tiklash";  c 10:20:00 "Xatolar tuzatildi"
$ git log --oneline
6a1d9ca Xatolar tuzatildi
28d5d36 Parolni tiklash
fcabdb7 Login formasi
cd64455 Kirish sahifasi
5ceb3ee Loyiha boshlandi
$ git tag
$
```

Argumentsiz `git tag` — teglar ro'yxati. Hozircha bo'sh.

## Kod: lightweight teg

`-a`, `-s`, `-m` opsiyalarining hech birini bermaysiz — faqat nom:

```bash
$ git tag v1.0-lw
$ find .git/refs/tags -type f
.git/refs/tags/v1.0-lw
$ cat .git/refs/tags/v1.0-lw
6a1d9ca994b575e2479418dc2b1124a887889b27
$ git cat-file -t v1.0-lw
commit
```

Hammasi shu: `refs/tags/` ichida 41 baytlik fayl (hash + yangi qator), ichida joriy commit hash'i. Obyektlar omboriga hech narsa qo'shilmadi; `cat-file -t` teg nomini hash'ga aylantirib, turini aytdi — `commit`. (Ref'lar — [17-bob](17-reflar-va-head.md).)

`git show` lightweight teg uchun faqat commit'ni ko'rsatadi — tegning o'zi haqida aytadigan narsa yo'q:

```bash
$ git show v1.0-lw --stat
commit 6a1d9ca994b575e2479418dc2b1124a887889b27
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:20:00 2026 +0500

    Xatolar tuzatildi

 app.txt | 1 +
 1 file changed, 1 insertion(+)
```

## Kod: annotated teg

`-a` (annotate) va `-m` (xabar). Teg vaqti commit'dan farqli bo'lishi uchun sanani 11:00 qildik:

```bash
$ GIT_COMMITTER_DATE="2026-10-07T11:00:00+05:00" git tag -a v1.0 -m "1.0 versiya: login va parol tiklash"
$ git show v1.0
tag v1.0
Tagger: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 11:00:00 2026 +0500

1.0 versiya: login va parol tiklash

commit 6a1d9ca994b575e2479418dc2b1124a887889b27
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:20:00 2026 +0500

    Xatolar tuzatildi

diff --git a/app.txt b/app.txt
...
```

Teg qo'yuvchi ismi commit qiluvchi ma'lumotlaridan (`user.name`, `user.email`), sanasi `GIT_COMMITTER_DATE` dan olinadi. Ikki sana bor — `Tagger` (11:00) va commit (10:20) — ular bog'liq emas. `-m` berilmasa, Git muharrirni ochadi; yozilayotgan xabar `.git/TAG_EDITMSG` da turadi (xato bilan chiqib ketsangiz, o'sha yerdan topasiz, lekin keyingi `git tag` uni ustidan yozishi mumkin).

Ichkarida ref fayli endi commit'ga emas, **boshqa** hash'ga ko'rsatadi:

```bash
$ cat .git/refs/tags/v1.0
b8243654011859e62385c4aca1ffdae2219364dc
$ git cat-file -t v1.0
tag
$ git cat-file -p v1.0
object 6a1d9ca994b575e2479418dc2b1124a887889b27
type commit
tag v1.0
tagger Ali Valiyev <ali@example.com> 1791352800 +0500

1.0 versiya: login va parol tiklash
```

`b824365` — yangi **teg obyekti**: qaysi obyektga ko'rsatadi (`object`), uning turi (`type`), teg nomi, teg qo'yuvchi va Unix vaqt (`1791352800` = 2026-10-07 11:00 +0500), bo'sh qator va xabar. Diskda u [14-bob](14-obyektlar-blob.md)dagi blob bilan bir xil sxemada, faqat sarlavhada `tag`:

```bash
$ python3 -c "import zlib,sys;print(zlib.decompress(open(sys.argv[1],'rb').read()))" \
    .git/objects/b8/243654011859e62385c4aca1ffdae2219364dc
b'tag 160\x00object 6a1d9ca994b575e2479418dc2b1124a887889b27\ntype commit\ntag v1.0\ntagger Ali Valiyev <ali@example.com> 1791352800 +0500\n\n1.0 versiya: login va parol tiklash\n'
```

```text
refs/tags/v1.0-lw ─────────────────────────────► commit 6a1d9ca
refs/tags/v1.0    ──► tag b824365 ──(object)───► commit 6a1d9ca
                       tagger, sana, xabar
```

Tegdan commit'ga "o'tish" — `^{commit}` yoki `^{}` (teg qatlamlarini ochadi; [19-bob](19-revision-tanlash.md)):

```bash
$ git rev-parse v1.0 v1.0^{commit} v1.0^{}
b8243654011859e62385c4aca1ffdae2219364dc
6a1d9ca994b575e2479418dc2b1124a887889b27
6a1d9ca994b575e2479418dc2b1124a887889b27
```

`log`, `switch`, `diff` buni o'zlari qiladi. Teg obyektini `mktag` bilan qo'lda yaratish — [17-bobda](17-reflar-va-head.md).

## Kod: teg yaratish opsiyalari

Ma'lumotnomadagi qoidalar:

- `-a`, `-s` yoki `-u <kalit>` — teg obyekti yaratiladi, xabar talab qilinadi.
- `-m`, `-F` yoki `--trailer` berilib, `-a`/`-s`/`-u` yo'q bo'lsa — **`-a` nazarda tutiladi**. Ya'ni `git tag -m "..." nom` ham annotated.
- Hech biri bo'lmasa — lightweight.

Alohida `12-saralash` repo'sida (shuning uchun commit hash'i boshqa):

```bash
$ git tag -m "Sarlavha qatori" -m "Batafsil: ikkinchi paragraf." \
    --trailer "Reviewed-by: Vali <vali@example.com>" t-xabar
$ git cat-file -p t-xabar
object 1f42c79eeaf67b2fdd2b54a1d494942640a49bc3
type commit
tag t-xabar
tagger Ali Valiyev <ali@example.com> 1791349200 +0500

Sarlavha qatori

Batafsil: ikkinchi paragraf.
Reviewed-by: Vali <vali@example.com>
```

Bir nechta `-m` — alohida paragraflar. `--trailer` xabar oxiriga `Kalit: qiymat` qatorini qo'shadi (keyin `--format="%(trailers)"` bilan ajratib olinadi).

`-F <fayl>` — xabarni fayldan (`-F -` — standart kirishdan). Xabar standart bo'yicha `strip` rejimida tozalanadi: chetdagi bo'sh qatorlar va `#` bilan boshlanadigan izohlar olib tashlanadi. `--cleanup=verbatim` — hech narsa o'zgarmaydi, `whitespace` — faqat bo'sh qatorlar tozalanadi:

```bash
$ printf "Fayldan xabar\n\n# izoh qatori\n" > msg.txt
$ git tag -F msg.txt t-fayl
$ git cat-file -p t-fayl | tail -n +6
Fayldan xabar
$ git tag -F msg.txt --cleanup=verbatim t-verbatim
$ git cat-file -p t-verbatim | tail -n +6
Fayldan xabar

# izoh qatori
```

`-e` — `-m`/`-F` dan olingan xabarni muharrirda yana tahrirlash. Imzolash: `-s` (standart kalit), `-u <kalit-id>`, tekshirish `-v`. Imzosiz tegda `-v` xato beradi (`12-teglar` da):

```bash
$ git tag -v v1.0
object 6a1d9ca994b575e2479418dc2b1124a887889b27
...
1.0 versiya: login va parol tiklash
error: no signature found
```

GPG/SSH imzo, `gpg.format`, `user.signingKey`, `tag.gpgSign` — [44-bobda](44-imzolash.md).

## Kod: keyinroq teglash

Teg istalgan commit'ga qo'yiladi — oxirida hash (yoki qisqa hash, yoki revision nomi). 0.9 demo "Kirish sahifasi" commit'ida bo'lgan, teg esdan chiqqan:

```bash
$ GIT_COMMITTER_DATE="2026-10-07T11:05:00+05:00" git tag -a v0.9 cd64455 -m "0.9: birinchi demo"
$ GIT_COMMITTER_DATE="2026-10-07T11:06:00+05:00" git tag -m "0.5: prototip" v0.5 5ceb3ee
$ git cat-file -t v0.5
tag
```

Ikkinchisida `-a` yo'q, lekin `-m` bor — demak annotated. Tartib: `git tag <nom> [<commit>]`, nom commit'dan oldin.

**Sanani o'tmishga qo'yish.** Ma'lumotnomaning "On Backdating Tags" bo'limi: boshqa VCS'dan import qilingan tarixga eski relizlar uchun teg qo'ysangiz, teg sanasi ham o'sha davrniki bo'lgani ma'qul (ba'zi interfeyslar teglarni shu sana bo'yicha saralaydi). `12-saralash` da:

```bash
$ GIT_COMMITTER_DATE="2024-01-15 09:30" git tag -a v0.1 -m "eski reliz"
$ git tag --format="%(refname:strip=2) %(taggerdate:iso)" -l v0.1
v0.1 2024-01-15 09:30:00 +0500
```

Vaqt zonasi berilmasa, lokal zona olinadi (bu yerda +0500).

## Kod: mavjud teg va `-f`

```bash
$ git tag v0.9
fatal: tag 'v0.9' already exists
$ git tag -f v0.9-lw fcabdb7
$ git tag -f v0.9-lw 28d5d36
Updated tag 'v0.9-lw' (was fcabdb7)
```

Bir xil nomli teg qayta yaratilmaydi. `-f` (`--force`) — mavjud tegni almashtirish; teg yangi bo'lsa, `-f` jim ishlaydi, mavjud bo'lsa eski qiymatni aytadi. Vaqtinchalik `v0.9-lw` ni keyinroq o'chiramiz.

## Kod: teglar ro'yxati — qidirish va saralash

Ro'yxat standart bo'yicha alifbo tartibida. **Pattern bilan qidirish uchun `-l` (`--list`) majburiy** — Pro Git alohida eslatadi: argumentsiz `git tag` ro'yxat chiqaradi, `git tag <nimadir>` esa *teg yaratadi*. Pattern'ni qo'shtirnoqqa oling, aks holda shell uni o'zi ochishga urinadi:

```bash
$ zsh -c 'git tag v1.*'
zsh:1: no matches found: v1.*
$ bash -c 'git tag v1.*'
fatal: 'v1.*' is not a valid tag name.
$ git tag -l "v1.*"
v1.0
v1.0-lw
$ git tag -l "v0.*" "*-lw"
v0.5
v0.9
v0.9-lw
v1.0-lw
```

Pattern — shell wildcard (`fnmatch`); bir nechtasidan istalgan biriga mos kelgani chiqadi. `-i` — katta-kichik harfni farqlamaslik.

`-n[<son>]` — annotated teg xabaridan nechta qator (raqamsiz — birinchisi). Lightweight teg uchun commit xabari chiqadi:

```bash
$ git tag -n
v0.5            0.5: prototip
v0.9            0.9: birinchi demo
v0.9-lw         Parolni tiklash
v1.0            1.0 versiya: login va parol tiklash
v1.0-lw         Xatolar tuzatildi
```

**Versiya bo'yicha saralash.** Alifboda `v1.10` `v1.2` dan oldin chiqadi. `--sort=v:refname` nomlarni versiya sifatida solishtiradi, `-` prefiksi teskari tartib (`12-saralash` da):

```bash
$ git tag
v1.10
v1.2
v1.9
v2.0
v2.0-rc1
v2.0-rc2
$ git tag --sort=v:refname
v1.2
v1.9
v1.10
v2.0
v2.0-rc1
v2.0-rc2
$ git -c versionsort.suffix=-rc tag --sort=v:refname
v1.2
v1.9
v1.10
v2.0-rc1
v2.0-rc2
v2.0
```

Oddiy `v:refname` `v2.0-rc1` ni `v2.0` dan **keyin** qo'ydi. `versionsort.suffix=-rc` reliz nomzodlarini (release candidate) relizdan oldinga o'tkazdi. Doimiy qilish: `tag.sort=version:refname` va `versionsort.suffix=-rc`. `--column` — ustunlarda chiqarish.

## Kod: teg nomlari

Teg nomi ref nomi qoidalariga (`git check-ref-format`) bo'ysunadi: bo'sh joy, `..`, `~`, `^`, `:`, `?`, `*`, `[`, `\` mumkin emas (`12-teglar` da):

```bash
$ git tag "v1.0 beta"
fatal: 'v1.0 beta' is not a valid tag name.
$ git tag v1..0
fatal: 'v1..0' is not a valid tag name.
$ git check-ref-format refs/tags/v1.0-beta; echo $?
0
```

Teg va branch bir xil nomda bo'lsa, Git ogohlantiradi (`12-saralash` da, `v1.2` tegi bor):

```bash
$ git branch v1.2
$ git log --oneline -1 v1.2
warning: refname 'v1.2' is ambiguous.
1f42c79 x
```

`gitrevisions` dagi qidiruv tartibida `refs/tags/` `refs/heads/` dan oldin tekshiriladi ([19-bob](19-revision-tanlash.md)). Aniqlik uchun to'liq nom: `refs/heads/v1.2`. Lekin yaxshisi — bunday nomlardan qochish.

## Kod: tegni o'chirish

```bash
$ git tag -d v0.9-lw
Deleted tag 'v0.9-lw' (was 28d5d36)
$ git tag -d v0.9-lw
error: tag 'v0.9-lw' not found.
```

`-d` (`--delete`) — o'chirish, bir nechta nom bilan ham. `(was 28d5d36)` — xavfsizlik to'ri: xato o'chirsangiz, `git tag v0.9-lw 28d5d36` bilan qaytarasiz. Annotated tegda bu hash teg obyektiniki; obyekt omborda `gc` tozalamaguncha turadi ([18-bob](18-packfile-va-gc.md)).

`-d` faqat **lokal** tegni o'chiradi; remote'dagisi alohida (pastda).

## Kod: filtrlar va format

Filtrlar — "commit qaysi teglarning tarixida bor?" degan savolga javob. `<commit>` berilmasa — `HEAD`:

| Opsiya | Qaysi teglar |
| --- | --- |
| `--contains <commit>` | Tarixida shu commit bor |
| `--no-contains <commit>` | Tarixida shu commit yo'q |
| `--merged <commit>` | Teg commit'i shu commit'dan erishiladi (eskiroqlar) |
| `--no-merged <commit>` | Erishilmaydi |
| `--points-at <obyekt>` | Aynan shu obyektga ko'rsatadi |

```bash
$ git tag --contains fcabdb7
v1.0
v1.0-lw
$ git tag --no-contains fcabdb7
v0.5
v0.9
$ git tag --points-at HEAD
v1.0
v1.0-lw
$ git tag --merged cd64455
v0.5
v0.9
```

`--contains` amalda juda foydali: "bu tuzatish qaysi relizlarga kirgan?" — `git tag --contains <tuzatish-hash>`.

**O'z formatingiz** — `--format`, `git for-each-ref` bilan bir xil `%(maydon)` sintaksisi. `*` bilan boshlangan maydon — teg obyekti ko'rsatayotgan obyektniki:

```bash
$ git tag --format="%(refname:strip=2) %(objecttype) %(*objectname:short) %(objectname:short) %(taggerdate:short)"
v0.5 tag 5ceb3ee ec917fc 2026-10-07
v0.9 tag cd64455 00836f2 2026-10-07
v1.0 tag 6a1d9ca b824365 2026-10-07
v1.0-lw commit  6a1d9ca 
```

Farq yaqqol: annotated teglarda tur `tag` va ikki xil hash (teg obyekti va commit); lightweight'da tur `commit`, `*objectname` va `taggerdate` bo'sh.

## Kod: teglarni ulashish — `push`

**Standart bo'yicha `git push` teglarni yubormaydi.** "Server" vazifasida lokal bare repo ([27-bob](27-remote.md)):

```bash
$ git init -q --bare ../12-markaz.git
$ git remote add origin ../12-markaz.git
$ git push origin main
To ../12-markaz.git
 * [new branch]      main -> main
$ git ls-remote --tags origin
$ git push origin v1.0
To ../12-markaz.git
 * [new tag]         v1.0 -> v1.0
$ git ls-remote --tags origin
b8243654011859e62385c4aca1ffdae2219364dc	refs/tags/v1.0
6a1d9ca994b575e2479418dc2b1124a887889b27	refs/tags/v1.0^{}
```

Branch bordi, teg — faqat nomi bilan so'ralganda. `refs/tags/v1.0^{}` qatori — server annotated tegni "ochib", u ko'rsatayotgan commit'ni ham aytmoqda.

Hammasini birdaniga — `--tags`, serverda yo'q **barcha** teglar, lightweight ham:

```bash
$ git push origin --tags
To ../12-markaz.git
 * [new tag]         v0.5 -> v0.5
 * [new tag]         v0.9 -> v0.9
 * [new tag]         v1.0-lw -> v1.0-lw
```

Shaxsiy `v1.0-lw` ham ketib qoldi. Yaxshiroq yo'l — `--follow-tags`: ma'lumotnomaga ko'ra u yuborilayotgan ref'lar bilan birga serverda yo'q va yuborilayotgan commit'lardan erishiladigan **faqat annotated** teglarni qo'shib yuboradi. Sinash uchun ikki tegni serverdan o'chiramiz (keyingi bo'lim), yangi commit va ikki xil teg yaratamiz:

```bash
$ git push origin :refs/tags/v1.0-lw
To ../12-markaz.git
 - [deleted]         v1.0-lw
$ git push origin --delete v0.5
To ../12-markaz.git
 - [deleted]         v0.5
$ echo "Profil sahifasi" >> app.txt; git add app.txt
$ GIT_AUTHOR_DATE="2026-10-07T12:00:00+05:00" GIT_COMMITTER_DATE="2026-10-07T12:00:00+05:00" \
    git commit -q -m "Profil sahifasi"
$ GIT_COMMITTER_DATE="2026-10-07T12:01:00+05:00" git tag -a v1.1 -m "1.1: profil"
$ git tag v1.1-lw
$ git push --follow-tags origin main
To ../12-markaz.git
   6a1d9ca..e97a3f5  main -> main
 * [new tag]         v0.5 -> v0.5
 * [new tag]         v1.1 -> v1.1
```

Annotated `v1.1` ketdi, lightweight `v1.1-lw` ketmadi. Va **`v0.5` qaytib keldi** — u annotated, `main` dan erishiladi va serverda yo'q edi. Ya'ni `--follow-tags` — "faqat yangi teg" emas, "serverda yo'q har qanday erishiladigan annotated teg". Pro Git eslatmasi ham shu: faqat lightweight teglarni yuboradigan opsiya yo'q.

Doimiy qilish: `git config --global push.followTags true` (bir martalik bekor qilish — `--no-follow-tags`).

## Kod: remote'dagi tegni o'chirish

Yuqorida ishlatilgan ikki yo'l (Pro Git'dan):

```bash
$ git push origin :refs/tags/v1.0-lw
$ git push origin --delete v0.5
```

Birinchisini shunday o'qing: `<manba>:<manzil>` refspec'ida manba **bo'sh** — "serverdagi `refs/tags/v1.0-lw` ga hech narsani yoz", ya'ni o'chir (refspec — [29-bob](29-fetch-push-ichidan.md)). Ikkinchisi tushunarliroq; bir xil nomli branch bo'lsa, to'liq nom yozing: `--delete refs/tags/v0.5`. Serverdan o'chirish boshqalarning lokal nusxasidagi tegni **o'chirmaydi**.

## Kod: `clone` teglarni olib keladi

```bash
$ git clone -q 12-markaz.git 12-nusxa
$ git -C 12-nusxa tag
v0.5
v0.9
v1.0
v1.1
```

`fetch` ham standart bo'yicha teglarni kuzatadi — buni bob oxiroqida, yangi commit bilan ko'ramiz. Hozir esa shu nusxa yordamida eng nozik vaziyatni sinaymiz.

## Kod: e'lon qilingan tegni qayta qo'yish

Teg noto'g'ri commit'ga qo'yildi va **allaqachon push qilingan**. Lokal'da `-f` bilan almashtirish oson, lekin server rad etadi:

```bash
$ GIT_COMMITTER_DATE="2026-10-07T12:30:00+05:00" git tag -f -a v1.1 -m "1.1: profil (qayta)" HEAD~1
Updated tag 'v1.1' (was 4876234)
$ git push origin v1.1
To ../12-markaz.git
 ! [rejected]        v1.1 -> v1.1 (already exists)
error: failed to push some refs to '../12-markaz.git'
hint: Updates were rejected because the tag already exists in the remote.
$ git push origin --force v1.1
To ../12-markaz.git
 + 4876234...861f5cf v1.1 -> v1.1 (forced update)
```

`--force` bilan serverda almashdi. Lekin tegni oldin olgan odam (`12-nusxa`) uni **avtomatik yangilamaydi**:

```bash
$ git rev-parse v1.1
487623454c07ca2a00bf9f62603ab64b8098d13a
$ git fetch origin --tags
From /tmp/misol/12-markaz
 ! [rejected] v1.1       -> v1.1  (would clobber existing tag)
$ git tag -d v1.1; git fetch origin tag v1.1
Deleted tag 'v1.1' (was 4876234)
From /tmp/misol/12-markaz
 * [new tag]         v1.1       -> v1.1
$ git rev-parse v1.1
861f5cf8ce39d4a2af33e4e0245bea305c79f8cc
```

Bu ataylab qilingan himoya. Ma'lumotnoma ("On Re-tagging") keskin aytadi: Git foydalanuvchi bilmagan holda teglarni almashtirmaydi va almashtirmasligi **kerak** — odamlar teg nomlariga ishona olishi shart, bu xavfsizlik masalasi. Aks holda ikki kishida bir xil "X versiya" bo'ladi, ichi esa har xil. Hujjat ikki yo'l taklif qiladi:

1. **Oqilona yo'l** — xatoni tan oling va **yangi nom** bering (`v1.1.1`).
2. **"Aqldan ozgan" yo'l** (hujjatning o'z ifodasi) — o'sha nomni `-f` bilan qayta qo'yish. Shunda hammaga ochiq e'lon qiling: "eski tegni `git tag -d X` bilan o'chiring, `git fetch origin tag X` bilan yangisini oling, `git rev-parse X` shu hash'ni berishi kerak".

Push qilinmagan tegni esa `-f` bilan bemalol almashtiring. (Keyingi misollar uchun asl `v1.1` ni qaytardik: xuddi o'sha sana va xabar bilan qayta yaratilgan teg obyekti yana `4876234` hash'ini oldi.)

## Kod: tegdagi holatni ko'rish — detached HEAD

Teg — branch emas, unga "o'tib" bo'lmaydi:

```bash
$ git switch v1.0
fatal: a branch is expected, got tag 'v1.0'
hint: If you want to detach HEAD at the commit, try again with the --detach option.
$ git switch --detach v1.0
HEAD is now at 6a1d9ca Xatolar tuzatildi
$ git status | head -1
HEAD detached at v1.0
$ cat .git/HEAD
6a1d9ca994b575e2479418dc2b1124a887889b27
$ git switch -
Previous HEAD position was 6a1d9ca Xatolar tuzatildi
Switched to branch 'main'
```

**Detached HEAD** — `HEAD` branch nomiga emas (odatda `ref: refs/heads/main`), to'g'ridan-to'g'ri commit hash'iga ko'rsatgan holat ([17-bob](17-reflar-va-head.md)). Ko'rish, build qilish, sinash mumkin. Commit qilsangiz, teg joyida qoladi, yangi commit esa hech bir branch'ga tegishli bo'lmaydi — undan uzoqlashgach, uni faqat hash yoki reflog ([42-bob](42-reflog-va-tiklash.md)) orqali topasiz.

Pro Git eski `git checkout <teg>` ni ko'rsatadi — u hali ishlaydi va batafsil ogohlantiradi (`You are in 'detached HEAD' state...`). Eski reliz ustida ishlash kerak bo'lsa (1.0 da xato tuzatish) — **tegdan branch yarating**. Pro Git'dagi `git checkout -b version2 v2.0.0` ning hozirgi shakli:

```bash
$ git switch -c hotfix-1.0 v1.0
Switched to a new branch 'hotfix-1.0'
```

`hotfix-1.0` da commit qilsangiz, branch oldinga siljiydi, `v1.0` esa joyida qoladi.

## Kod: `git describe` — commit'ga odam o'qiy oladigan nom

`git describe` savoli: "bu commit eng yaqin tegdan qanchalik uzoqda?". Natija — `<teg>-<commit soni>-g<qisqa hash>`. Hozir `HEAD` = `e97a3f5` (`v1.1`):

```bash
$ git describe fcabdb7
v0.9-1-gfcabdb7
$ git describe
v1.1
$ git describe HEAD~1
v1.0
```

`v0.9-1-gfcabdb7`: "`v0.9` dan keyin **1** commit, commit'ning o'zi `fcabdb7`". Commit soni — `git log <teg>..<commit>` ko'rsatadigan commit'lar soni. `g` — "git": dastur versiyasi qaysi VCS'dan olingani aniq bo'lishi uchun (hash'ning qismi emas). Teg aynan shu commit'da bo'lsa — faqat teg nomi.

| Opsiya | Ma'nosi |
| --- | --- |
| `--tags` | Lightweight teglar ham (standart — faqat annotated) |
| `--all` | Istalgan ref: branch, remote branch ham |
| `--long` | Teg ustida bo'lsa ham to'liq shakl (`-0-g...`) |
| `--abbrev=<n>` | Hash uzunligi; `0` — faqat eng yaqin teg nomi |
| `--match`/`--exclude <pattern>` | Faqat mos (mos bo'lmagan) teglar |
| `--exact-match` | Faqat aniq moslik, aks holda xato (`--candidates=0`) |
| `--contains` | Teskari: commit'dan **keyingi**, uni o'z ichiga olgan teg; `--tags` ni nazarda tutadi |
| `--first-parent` | Merge'da faqat birinchi ota bo'ylab |
| `--always` | Teg topilmasa — qisqa hash |
| `--dirty[=<belgi>]` | Working tree o'zgargan bo'lsa `-dirty` qo'shiladi |

```bash
$ git describe --long
v1.1-0-ge97a3f5
$ git describe --abbrev=0 fcabdb7
v0.9
$ git describe --all HEAD~1
tags/v1.0
$ git describe --match "v0.*" HEAD
v0.9-4-ge97a3f5
$ git describe --exact-match fcabdb7
fatal: no tag exactly matches 'fcabdb7a05b4cf47f9f7a4205edae99f4e4a853d'
$ git describe --contains fcabdb7
v1.0-lw~2
$ echo x >> app.txt
$ git describe --dirty
v1.1-dirty
$ git describe --dirty=-ozgargan
v1.1-ozgargan
```

`--contains` natijasi `v1.0-lw~2` — "`v1.0-lw` dan ikki commit orqada" (`--tags` nazarda tutilgani uchun lightweight teg ham hisobga olindi). `--dirty` build skriptlari uchun muhim: usiz commit qilinmagan o'zgarishli build "v1.1" deb belgilanardi.

**Faqat annotated teglar** — buni yangi commit va unga lightweight `sinov` tegi bilan ko'ramiz:

```bash
$ git restore app.txt
$ echo "Sozlamalar" >> app.txt; git add app.txt
$ GIT_AUTHOR_DATE="2026-10-07T13:00:00+05:00" GIT_COMMITTER_DATE="2026-10-07T13:00:00+05:00" \
    git commit -q -m "Sozlamalar"
$ git tag sinov
$ git describe
v1.1-1-g22a2a21
$ git describe --tags
sinov
$ git describe --abbrev=12
v1.1-1-g22a2a211678c
$ git describe --always --match "yoq*"
22a2a21
$ git describe --match "yoq*"
fatal: No names found, cannot describe anything.
```

Natija haqiqiy revision nomi sifatida ham ishlaydi — Git `-g<hash>` qismidan commit'ni topadi. Shuning uchun `describe` build versiyasi uchun qulay: odam "1.1 dan biroz keyin" deb tushunadi, Git esa aniq commit'ni topadi:

```bash
$ git rev-parse v1.1-1-g22a2a21
22a2a211678c224cb06a73813e054ac4b3564b4f
```

**Qidiruv strategiyasi** (ma'lumotnomadan): avval aynan shu commit'ga qo'yilgan teg qidiriladi — bir nechta bo'lsa, **annotated lightweight'dan**, **yangi sanali eskisidan** ustun. Topilmasa, tarix bo'ylab orqaga yuriladi va eng kam commit farqli teg tanlanadi; standart bo'yicha 10 ta eng yangi teg nomzod (`--candidates=<n>`). `e97a3f5` da `v1.1` va `v1.1-lw` bor — `--tags` bilan ham annotated tanlanadi:

```bash
$ git describe --tags e97a3f5
v1.1
```

## Kod: `fetch` teglarni avtomatik kuzatadi

Ma'lumotnomaga ko'ra `fetch` standart bo'yicha yuklab olinayotgan tarixga ko'rsatadigan teglarni ham oladi (auto-follow). Asl repo'da yana bir commit va reliz:

```bash
$ echo "Eksport" >> app.txt; git commit -q -am "Eksport"
$ GIT_COMMITTER_DATE="2026-10-07T14:01:00+05:00" git tag -a v1.2 -m "1.2: eksport"
$ git push -q origin main v1.2
```

Nusxada:

```bash
$ git fetch origin
From /tmp/misol/12-markaz
   22a2a21..8babdb7  main       -> origin/main
 * [new tag]         v1.2       -> v1.2
```

`v1.2` alohida so'ralmadi — yangi commit bilan birga keldi. `--no-tags` yoki `remote.<nom>.tagOpt` bu xatti-harakatni o'chiradi; `--tags` esa serverdagi **hamma** teglarni olib keladi. Ma'lumotnomaning "On Automatic following" bo'limi sababini aytadi: kimningdir tarixini doimiy kuzatsangiz, uning teglari sizga kerak; bir martalik `git pull <url> <branch>` da esa begona odamning ichki "langar" teglari kerak emas.

## Kod: alias'lar — qisqa nomlar

Git qisman yozilgan buyruqni o'zi "taxmin qilmaydi", faqat o'xshashini taklif qiladi:

```bash
$ git comit -m x
git: 'comit' is not a git command. See 'git --help'.

The most similar command is
	commit
```

Alias — `alias.<nom>` sozlamasi. Pro Git misollari:

```bash
$ git config --global alias.co checkout
$ git config --global alias.br branch
$ git config --global alias.ci commit
$ git config --global alias.st status
$ git br
* main
```

Ular `~/.gitconfig` ga ([3-bob](03-birinchi-sozlash.md)) yoziladi — faylni qo'lda tahrirlash ham mumkin:

```ini
[alias]
	co = checkout
	br = branch
	ci = commit
	st = status
```

Alias'dan keyingi argumentlar oxiriga qo'shiladi: `git ci -m "x"` → `git commit -m "x"`.

**Yo'q buyruqni "yaratish".** Pro Git `unstage = reset HEAD --` ni taklif qiladi. Hozirgi Git'da buning uchun `restore --staged` bor ([11-bob](11-bekor-qilish.md)):

```bash
$ git config --global alias.unstage "restore --staged --"
$ echo y >> app.txt; git add app.txt; git st -s
M  app.txt
$ git unstage app.txt; git st -s
 M app.txt
$ git config --global alias.last "log -1 HEAD"
$ git last
commit 8babdb768253fd1b3c47cba06ababf87eb1b67b8
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:00:00 2026 +0500

    Eksport
$ git config --global alias.lg "log --oneline --graph --decorate -5"
$ git lg
* 8babdb7 (HEAD -> main, tag: v1.2, origin/main) Eksport
* 22a2a21 (tag: sinov) Sozlamalar
* e97a3f5 (tag: v1.1-lw, tag: v1.1) Profil sahifasi
* 6a1d9ca (tag: v1.0-lw, tag: v1.0) Xatolar tuzatildi
* 28d5d36 Parolni tiklash
```

`--` — "bundan keyin faqat fayl nomlari": fayl nomi branch nomiga o'xshasa ham chalkashlik bo'lmaydi.

**Ko'rish, tekshirish, o'chirish:**

```bash
$ git help co
'co' is aliased to 'checkout'
$ git config --global --get-regexp "^alias\."
alias.co checkout
alias.br branch
alias.ci commit
alias.st status
alias.unstage restore --staged --
alias.last log -1 HEAD
...
$ GIT_TRACE=1 git last
...
git.c:453               trace: alias expansion: last => log -1 HEAD
git.c:888               trace: exec: git log -1 HEAD
...
```

Yangi `git config` sintaksisida: `git config get --all --show-names --regexp "^alias\."`. O'chirish: `git config --global --unset alias.co`. `GIT_TRACE=1` — alias nimaga ochilayotganini ko'rishning ma'lumotnoma tavsiya qilgan yo'li.

## Kod: alias qoidalari va chegaralari

**Mavjud buyruqni yashirib bo'lmaydi.** Ma'lumotnomaga ko'ra mavjud Git buyrug'i nomidagi alias'lar (eskirgan buyruqlardan tashqari) **jim e'tiborsiz qoldiriladi** — skriptlar buzilmasligi uchun:

```bash
$ git config --global alias.status "status -s"
$ git status | head -1
On branch main
```

**Birinchi so'z `git` opsiyasi bo'lishi mumkin.** Ma'lumotnoma misollari: `loud-rebase = -c commit.verbose=true rebase` (bir martalik sozlama) va `ps = -p status` (`status` chiqishini pager orqali).

**Alias alias'ni chaqirishi mumkin**, sikl bo'lsa Git to'xtatadi:

```bash
$ git config --global alias.a1 a2; git config --global alias.a2 a1; git a1
fatal: alias loop detected: expansion of 'a1' does not terminate:
  a1 <==
  a2 ==>
```

**Nom qoidalari — ikki sintaksis.** Git 2.54 dan (`RelNotes/2.54.0`: alias sintaksisi ASCII harf-raqam va `-` dan tashqari belgilarga ruxsat beradigan qilib kengaytirildi):

| Sintaksis | Misol | Nomda | Katta-kichik harf |
| --- | --- | --- | --- |
| Bo'limsiz | `[alias] co = checkout` | Faqat ASCII harf, raqam, `-` | Farqlanmaydi |
| Bo'lim bilan (2.54+) | `[alias "co"] command = checkout` | Yangi qator va NUL dan boshqa hamma narsa, UTF-8 ham | Farqlanadi |

```bash
$ git config --global "alias.ko_rish" "show -s"
error: invalid key: alias.ko_rish
$ git config --global alias.Joriy "branch --show-current"
$ git joriy; git JORIY
main
main
$ git config --global "alias.oxirgi muallif.command" "log -1 --format=%an"
$ git "oxirgi muallif"
Ali Valiyev
$ git config --global "alias.holat.command" "status -sb"
$ git Holat
git: 'Holat' is not a git command. See 'git --help'.

The most similar command is
	holat
```

Faylda:

```ini
[alias "oxirgi muallif"]
	command = log -1 --format=%an
[alias "holat"]
	command = status -sb
```

`alias.last` va `alias.last.command` bir xil ma'noli. Bo'lim bilan yozilgan alias'larni **2.54 dan eski Git tushunmaydi** — jamoa bilan bo'lishiladigan konfiguratsiyada eski sintaksisda qoling.

## Kod: shell alias'lari — `!`

Qiymat `!` bilan boshlansa, u **shell buyrug'i** sifatida bajariladi (Pro Git misoli — `alias.visual '!gitk'`). Ma'lumotnoma uch qoidani aytadi.

**1. Shell buyrug'i repo'ning yuqori papkasida bajariladi.** Asl papka `GIT_PREFIX` da:

```bash
$ git config --global alias.joy '!pwd; echo "prefix=$GIT_PREFIX"'
$ mkdir -p src/ui; cd src/ui; git joy
/tmp/misol/12-teglar
prefix=src/ui/
```

**2. Qo'shimcha argumentlar doim oxiriga qo'shiladi:**

```bash
$ git config --global alias.kim '!echo $1 | grep $2'
$ git kim salom sa
grep: salom: No such file or directory
grep: sa: No such file or directory
$ GIT_TRACE=1 git kim salom sa
...
trace: start_command: /bin/sh -c 'echo $1 | grep $2 "$@"' 'echo $1 | grep $2' salom sa
```

Git skript oxiriga `"$@"` qo'shdi: natija `echo salom | grep sa salom sa` — `grep` `salom` va `sa` nomli **fayllarni** qidirdi.

**3. Yechim — funksiya.** Skriptni ichki funksiyaga o'rang va chaqiring:

```bash
$ git config --global alias.kim '!f() { echo "$1" | grep "$2"; }; f'
$ git kim salom sa
salom
```

Shell alias ichida Git buyrug'ini `git` bilan to'liq yozing, masalan ma'lumotnomadagi `alias.new = !gitk --all --not ORIG_HEAD`.

## Muhandislik nuqtai nazari: qachon qaysi teg

| Vaziyat | Teg | Nega |
| --- | --- | --- |
| Ommaviy reliz (`v2.3.0`) | Annotated, iloji bo'lsa imzolangan | Kim, qachon, nima uchun saqlanadi; `describe` ko'radi; `--follow-tags` yuboradi |
| CI/CD reliz trigger'i | Annotated | Ko'p tizimlar `refs/tags/v*` ga qaraydi; xabar — reliz eslatmasi |
| "Shu yerga qaytaman" | Lightweight | Faqat siz uchun; `--tags` ishlatmasangiz push qilinmaydi |
| Bisect/tajriba belgisi | Lightweight yoki branch | Vaqtinchalik; keyin `-d` |

Keng tarqalgan nomlash — `v` prefiksi va semantik versiya (`vMAJOR.MINOR.PATCH`). Bu Git qoidasi emas, tashqi kelishuv (semver.org); Git uchun teg nomi shunchaki ref nomi. Muhimi — jamoada bir xil uslub va `--sort=v:refname` to'g'ri ishlaydigan nomlar.

Teglarning kuchi — **ko'chmasligi**: "1.0 da nima bor edi?" degan savolga besh yildan keyin ham bir xil javob. Bu kafolatni o'zingiz buzmang.

## Muhandislik nuqtai nazari: teg ichkarida

```text
lightweight:  refs/tags/v1.0-lw  →  6a1d9ca (commit)

annotated:    refs/tags/v1.0     →  b824365 (tag obyekti)
                                      ├─ object 6a1d9ca
                                      ├─ type   commit
                                      ├─ tag    v1.0
                                      ├─ tagger Ali Valiyev ... 1791352800 +0500
                                      └─ xabar
```

Amaliy xulosalar:

- Har ikki turda `tag -d` faqat ref'ni o'chiradi; annotated teg obyekti omborda "osilib" qoladi va keyin `gc` bilan tozalanadi.
- Ma'lumotnoma sintaksisida `<commit> | <object>` — teg blob yoki tree'ga ham qo'yilishi mumkin. Bunday teglarni `describe` ta'riflay olmaydi.
- Teglar uchun reflog standart bo'yicha yozilmaydi; `--create-reflog` yoki `core.logAllRefUpdates=always` bilan yoqiladi.
- Ref'lar `packed-refs` faylida yoki `reftable` formatida ham saqlanishi mumkin ([17-bob](17-reflar-va-head.md)). Skriptda `cat .git/refs/tags/...` emas, `git rev-parse` yoki `git for-each-ref refs/tags` ishlating.

## Muhandislik nuqtai nazari: alias'lar — qulaylik va xavf

- Boshqa kompyuterda (server, CI, hamkasb noutbuki) alias'laringiz yo'q. Asosiy buyruqlarni asl nomi bilan bilish shart — Pro Git ham kitob davomida alias ishlatmasligini shu bilan tushuntiradi.
- Hujjat yoki skriptga alias yozmang — boshqalar uchun `git co` hech narsani anglatmaydi.
- `!` alias — oddiy shell kodi. Begona `.gitconfig` dan ko'chirilgan `!` alias'ni o'qimasdan qo'shmang.
- `co = checkout` eski buyruqqa bog'laydi; yangi odat uchun `sw = switch`, `rs = restore` ma'qulroq.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `git tag v1.*` bilan qidirish | Bu teg yaratish urinishi; shell ham pattern'ni ochadi | `git tag -l "v1.*"` |
| Reliz uchun lightweight teg | Muallif, sana, xabar yo'q; `describe` ko'rmaydi; `--follow-tags` yubormaydi | `git tag -a v1.0 -m "..."` |
| `git push` dan keyin teg serverda deb o'ylash | `push` standart bo'yicha teg yubormaydi | `git push origin v1.0` yoki `push.followTags=true` |
| Doim `git push --tags` | Shaxsiy lightweight teglar ham ketadi | `git push --follow-tags` |
| E'lon qilingan tegni `-f` + `push --force` bilan almashtirish | Boshqalarda eski teg qoladi (`would clobber existing tag`) | Yangi nom (`v1.0.1`); majbur bo'lsangiz — ochiq e'lon |
| `tag -d` serverdan ham o'chirdi deb o'ylash | Faqat lokal ref o'chadi | `git push origin --delete <teg>` |
| Tegga o'tib, detached HEAD'da commit qilish | Commit hech bir branch'da emas | `git switch -c <branch> <teg>` |
| Teg va branch'ga bir xil nom | `refname is ambiguous`, kutilmagan ref tanlanishi | Teglar uchun `v` prefiksi |
| `alias.status = status -s` | Mavjud buyruq nomidagi alias jim e'tiborsiz qoldiriladi | Boshqa nom (`st`) yoki `status.short=true` |
| `!` alias'da `$1`, `$2` ni bevosita ishlatish | Argumentlar oxiriga yana qo'shiladi | `'!f() { ...; }; f'` |
| Umumiy konfiguratsiyada `[alias "nom"]` | Git 2.54 dan eskisi tushunmaydi | Eski `[alias] nom = ...` |

## Amaliyot

1. Uch commit'li repo yarating. Oxirgisiga lightweight `tez`, birinchisiga annotated `v0.1` teg qo'ying. `git cat-file -t` va `cat .git/refs/tags/*` bilan farqini ko'rsating.
2. `git tag -m "..." nom` qaysi turdagi teg yaratishini oldindan ayting, keyin `git cat-file -t nom` bilan tekshiring.
3. `v1.2`, `v1.10`, `v1.9`, `v2.0-beta`, `v2.0` teglarini yarating. Alifbo, `--sort=v:refname` va `versionsort.suffix=-beta` bilan ro'yxatlarni solishtiring.
4. Lokal bare repo yarating. Bitta annotated va bitta lightweight tegni `--follow-tags` bilan push qiling. `git ls-remote --tags` da qaysi biri borligini va `^{}` qatorlari nimaligini tushuntiring.
5. `git describe`, `--tags`, `--long`, `--dirty` ni turli commit'larda sinang. `v1.0-3-g...` dagi `3` ni `git log --oneline v1.0..HEAD | wc -l` bilan tekshiring.
6. `alias.lg = log --oneline --graph --decorate --all` qo'shing va `GIT_TRACE=1 git lg` bilan ochilishini ko'ring. Keyin `alias.log` yaratib, nega u ishlamasligini tushuntiring.
7. Joriy branch va eng yaqin teg nomini bir qatorda chiqaradigan `!` alias yozing (`git branch --show-current`, `git describe --abbrev=0`). Pastki papkadan ishga tushirib, `GIT_PREFIX` ni ham chiqaring.
8. (Qiyinroq) Ikki klonli muhit yarating. Birinchisida annotated tegni push qiling, ikkinchisi `fetch` qilsin. Keyin tegni boshqa commit'ga qayta qo'yib `--force` bilan push qiling. Ikkinchi klonda `fetch` va `fetch --tags` natijalarini kuzating va ma'lumotnomadagi "oqilona yo'l" bilan qanday hal qilinishini ko'rsating.

## Rasmiy hujjat

- Pro Git — Tagging: <https://git-scm.com/book/en/v2/Git-Basics-Tagging>
- Pro Git — Git Aliases: <https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases>
- `git tag` ("On Re-tagging", "On Automatic following", "On Backdating Tags"): <https://git-scm.com/docs/git-tag>
- `git describe`: <https://git-scm.com/docs/git-describe>
- `git config` — `alias.*`, `tag.sort`, `versionsort.suffix`, `push.followTags`: <https://git-scm.com/docs/git-config>
- `git push` (`--tags`, `--follow-tags`, `--delete`): <https://git-scm.com/docs/git-push>
- `git fetch` (teglarni avtomatik kuzatish): <https://git-scm.com/docs/git-fetch>
- `git check-ref-format`: <https://git-scm.com/docs/git-check-ref-format>
- Git 2.54.0 reliz eslatmalari (yangi alias sintaksisi): <https://github.com/git/git/blob/master/Documentation/RelNotes/2.54.0.adoc>
