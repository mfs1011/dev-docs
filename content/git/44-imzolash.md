# 44 — Imzolash

[← Oldingi: Submodule, `bundle` va `replace`](43-submodule-bundle-replace.md) · [Mundarija](README.md) · [Keyingi: `git config` chuqur →](45-config-chuqur.md)

## Tushuncha

Git obyektlari hash bilan nomlanadi ([14-bob](14-obyektlar-blob.md)): commit'ning bitta harfi o'zgarsa, hash ham o'zgaradi. Bu **yaxlitlikni** kafolatlaydi — "olgan narsam yuborilgan narsa bilan bir xil". Lekin **muallifni** kafolatlamaydi. Commit'dagi `author` va `committer` qatorlari — oddiy matn, ular `user.name` va `user.email` dan olinadi ([03-bob](03-birinchi-sozlash.md)), va bu sozlamalarga istalgan kishi istalgan ism yozishi mumkin. Pro Git bobni shunday boshlaydi: Git kriptografik jihatdan xavfsiz, lekin "hamma narsadan himoyalangan" emas — internetdan olingan ish haqiqatan ishonchli manbadan ekanini tekshirish uchun alohida vosita kerak.

Bu vosita — **raqamli imzo**. Oddiy so'z bilan: sizda ikki qismli kalit bor. **Maxfiy kalit** faqat sizda turadi va u bilan matnga "muhr" bosasiz. **Ommaviy kalit** hammaga beriladi va u bilan har kim "bu muhrni haqiqatan shu maxfiy kalit egasi bosganmi va matn shundan keyin o'zgarmaganmi" degan savolga javob oladi. Maxfiy kalitsiz bunday muhrni yasab bo'lmaydi.

Git'da imzolanadigan narsalar (`gitformat-signature` ma'lumotnomasi bo'yicha):

| Nima | Qanday yaratiladi | Imzo qayerda turadi |
| --- | --- | --- |
| Teg | `git tag -s` | Annotated teg obyektining oxiriga qo'shiladi |
| Commit | `git commit -S` | Commit obyektidagi `gpgsig` sarlavhasida |
| Imzoli tegni merge qilish | `git merge <imzoli-teg>` | Butun teg obyekti merge commit'ning `mergetag` sarlavhasiga ko'chiriladi |
| Push | `git push --signed` | Obyektga emas, uzatishning o'ziga (bu bob doirasidan tashqarida) |

Imzoni Git o'zi hisoblamaydi — u tashqi dasturni chaqiradi. Qaysi dastur ekanini `gpg.format` belgilaydi:

| `gpg.format` | Dastur (standart) | Imzo boshlanishi |
| --- | --- | --- |
| `openpgp` (standart) | `gpg` | `-----BEGIN PGP SIGNATURE-----` |
| `x509` | `gpgsm` | `-----BEGIN SIGNED MESSAGE-----` |
| `ssh` | `ssh-keygen` | `-----BEGIN SSH SIGNATURE-----` |

Nomlarda "gpg" so'zi ko'p (`gpg.format`, `commit.gpgSign`, `--gpg-sign`) — bu tarixiy: avval faqat GPG bor edi. Hozir bu nomlar uchala formatga ham tegishli.

```text
     imzosiz commit                         imzoli commit
  ┌───────────────────┐               ┌──────────────────────────────┐
  │ tree    9144...   │               │ tree    9144...              │
  │ parent  3c89...   │               │ parent  3c89...              │
  │ author  Ali ...   │  ── -S ──►    │ author  Ali ...              │
  │ committer Ali ... │               │ committer Ali ...            │
  │                   │               │ gpgsig -----BEGIN SSH ...    │ ← imzo
  │ Versiya fayli     │               │  ...                         │
  └───────────────────┘               │ Versiya fayli                │
     hash d9df1a1                     └──────────────────────────────┘
                                         hash cf38cff
```

Bu bobda SSH formati haqiqiy sinov kaliti bilan to'liq ko'rsatiladi. GPG (OpenPGP) qismi esa Pro Git va ma'lumotnomaga tayanadi: misollar yozilgan kompyuterda `gpg` o'rnatilmagan, shuning uchun GPG buyruqlari **sinalmagan** (pastda alohida aytiladi).

## Nega shunday: hash bor ekan, imzo nega kerak?

Hash "nima" degan savolga javob beradi, imzo — "kim". Bu bobning sinov repo'sidagi bitta commit'ni oling. Muallif qatorida "Ali Valiyev" turibdi, lekin uni boshqa kalit egasi imzolagan:

```bash
$ git log --show-signature -1 begona
commit 3cadc6d33292b30230f870184dcb5dbe05df687e
Good "git" signature with ED25519 key SHA256:Gk5FkVKft+G+Jy/MLQ6HQbgA/EMceBY7jemHKN+JUAg
No principal matched.
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:33:00 2026 +0500

    f.txt (begona kalit)
```

Imzosiz holatda bu commit'ni Ali'nikidan ajratib bo'lmas edi — muallif qatori bir xil. Imzo bilan esa Git aytadi: "imzo matematik jihatdan to'g'ri (*Good*), lekin bu kalit ishonchli kalitlar ro'yxatidagi hech kimga tegishli emas (*No principal matched*)". Ya'ni imzo ikki narsani alohida tekshiradi:

1. **Imzo to'g'rimi** — obyekt imzo qo'yilgandan keyin o'zgarmaganmi.
2. **Kalit kimniki** — bu kalitga ishonasizmi va u qaysi shaxsga bog'langan.

Ikkinchi savolga Git o'zi javob bermaydi: GPG'da bu "ishonch darajasi" (*trust*), SSH'da — siz yozadigan `allowed_signers` fayli. Shuning uchun imzolash ikki tomonlama ish: imzo qo'yuvchi kalitni sozlaydi, tekshiruvchi esa qaysi kalitlarga ishonishini sozlaydi.

Pro Git ogohlantiradi: imzolashni jamoa ish jarayoniga kiritsangiz, hamma uni tushunishi va sozlashi kerak — aks holda vaqtingiz odamlarga commit'larini imzoli qilib qayta yozishda yordam berishga ketadi.

## Kod: sinov SSH kalitini yaratish

SSH imzo Git 2.34 da qo'shilgan (reliz eslatmasi: OpenSSH 8.7 dagi `ssh-keygen` bu imkoniyatda nosoz, kamida 8.8 kerak; bu bobdagi misollar OpenSSH 10.2 bilan) va eng oson yo'l: kalitni yaratish uchun `ssh-keygen` kifoya (u OpenSSH bilan birga keladi, [30-bob](30-ssh-va-credential.md)). Haqiqiy ishda kalit `~/.ssh/` da turadi va parol iborasi bilan himoyalanadi. Bu bobda esa maxsus sinov papkasida, parolsiz kalit ishlatiladi — sizning haqiqiy kalitlaringizga tegmaslik uchun:

```bash
$ ssh-keygen -t ed25519 -f /tmp/misol/kalitlar/ali_ed25519 -N '' -C ali@example.com
Generating public/private ed25519 key pair.
Your identification has been saved in /tmp/misol/kalitlar/ali_ed25519
Your public key has been saved in /tmp/misol/kalitlar/ali_ed25519.pub
...
$ ls -l /tmp/misol/kalitlar
-rw-------@ 1 ali   staff  411 Oct  8 18:01 ali_ed25519
-rw-r--r--@ 1 ali   staff   97 Oct  8 18:01 ali_ed25519.pub
$ cat /tmp/misol/kalitlar/ali_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMgFX4lxDygVQYFPr+9NWYRDPLveXeD2u/t6GJ2Oxblo ali@example.com
$ ssh-keygen -lf /tmp/misol/kalitlar/ali_ed25519.pub
256 SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU ali@example.com (ED25519)
```

Opsiyalar 30-bobdagidek: `-t ed25519` — algoritm, `-f` — fayl, `-N ''` — bo'sh parol (faqat sinov uchun), `-C` — izoh. Oxirgi buyruq kalitning **barmoq izini** (*fingerprint*) chiqardi — kalitning qisqa "pasporti". `SHA256:ZhGv...` ni eslab qoling: Git imzoni tekshirganda aynan shu qatorni ko'rsatadi.

Maxfiy kalit (`ali_ed25519`, ruxsati `600`) hech qachon hech kimga berilmaydi va hech qayerga yozilmaydi — na repo'ga, na chat'ga, na kitobga. Hammaga beriladigani — faqat `.pub`.

Keyingi misollar uchun yana ikki kalit yaratildi (xuddi shu buyruq bilan, `-q` — jim rejim): `vali_ed25519` (jamoadoshi Vali) va `sardor_ed25519` (ro'yxatda yo'q, "begona" kalit).

## Kod: Git'ga kalitni ko'rsatish

Uch sozlama kerak bo'ladi:

| Sozlama | Nima uchun | Kim uchun |
| --- | --- | --- |
| `gpg.format` | Imzo formati (`ssh`) | Imzo qo'yuvchi |
| `user.signingKey` | Qaysi kalit bilan imzolash | Imzo qo'yuvchi |
| `gpg.ssh.allowedSignersFile` | Qaysi kalitlarga ishonish | Tekshiruvchi (shu jumladan o'zingiz) |

Avval sozlamasiz nima bo'lishini ko'ramiz. `-S` — "shu commit'ni imzola" (pastda batafsil). `gpg.format` ko'rsatilmasa, Git standart `openpgp` ni oladi va `gpg` ni chaqiradi — bu kompyuterda u yo'q:

```bash
$ git commit --allow-empty -S -m x
error: cannot run gpg: No such file or directory
error: gpg failed to sign the data:
(no gpg output)
fatal: failed to write commit object
```

`ssh` formati tanlansa-yu, kalit ko'rsatilmasa:

```bash
$ git -c gpg.format=ssh commit --allow-empty -S -m x
fatal: either user.signingkey or gpg.ssh.defaultKeyCommand needs to be configured
```

Ikkala holatda ham commit **yaratilmadi** — imzo so'ralgan, lekin qo'yib bo'lmagan bo'lsa, Git imzosiz commit bilan "jim" davom etmaydi.

Endi sozlaymiz (misolda repo darajasida; odatda `--global` bilan bir marta):

```bash
$ git config gpg.format ssh
$ git config user.signingKey /tmp/misol/kalitlar/ali_ed25519
```

### `user.signingKey` ning SSH'dagi shakllari

Ma'lumotnoma (`config/user`) bo'yicha `gpg.format=ssh` bo'lganda bu sozlama quyidagilardan biri bo'lishi mumkin:

| Qiymat | Ma'nosi | Sinovda |
| --- | --- | --- |
| Maxfiy kalit fayli yo'li | `ssh-keygen` kalitni fayldan o'qiydi | Ishladi |
| Ommaviy kalit (`.pub`) fayli yo'li | Hujjat bo'yicha — maxfiy kalit `ssh-agent` da bo'lganda | Agent'siz ham ishladi, chunki yonida xuddi shu nomli maxfiy kalit fayli bor edi |
| `key::ssh-ed25519 AAAA... izoh` | Ommaviy kalitning o'zi, maxfiy qismi agent'da bo'lishi shart | Agent'siz: `error: Couldn't get agent socket?` |
| `ssh-ed25519 AAAA...` (`key::` siz) | Eski shakl, `key::` deb tushuniladi | Eskirgan (deprecated), ishlatmang |
| Bo'sh | `gpg.ssh.defaultKeyCommand` chaqiriladi (masalan `ssh-add -L`) va birinchi kalit olinadi | — |

GitHub hujjati `.pub` yo'lini tavsiya qiladi (`git config --global user.signingkey /PATH/TO/.SSH/KEY.PUB`) — bu kalit parolli bo'lib, `ssh-agent` da ochiq turgan odatiy holatga mos. Maxfiy kalit faylini to'g'ridan-to'g'ri ko'rsatish ham to'g'ri, lekin kalit parolli bo'lsa, har imzoda parol so'raladi.

## Kod: imzoli commit va u qayerda saqlanadi

```bash
$ echo "v1" > versiya.txt && git add versiya.txt
$ git commit -S -m "Versiya fayli"
[main cf38cff] Versiya fayli
 1 file changed, 1 insertion(+)
 create mode 100644 versiya.txt
```

Chiqish oddiy commit'nikidan farq qilmaydi. Farq obyektning ichida — `git cat-file -p` bilan xom ko'rinishini ochamiz ([16-bob](16-commit-obyekti.md)):

```bash
$ git cat-file -p HEAD
tree 91448a765ae462269b4d1605b6610ee40ea84fbe
parent 3c8955c614a4425231ef8cd867c61e8aed0e2a74
author Ali Valiyev <ali@example.com> 1791349500 +0500
committer Ali Valiyev <ali@example.com> 1791349500 +0500
gpgsig -----BEGIN SSH SIGNATURE-----
 U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAgyAVfiXEPKBVBgU+v701ZhEM8u9
 5d4Pa7+3oYnY7FuWgAAAADZ2l0AAAAAAAAAAZzaGE1MTIAAABTAAAAC3NzaC1lZDI1NTE5
 AAAAQMJSEaJPilDGYV+XDaN9cJL63gGorxkTXX+UD1OUrtz2SpZmdALT4MvpqsVKz6SKa+
 qWwZXMpedg74s3/jV2pQw=
 -----END SSH SIGNATURE-----

Versiya fayli
```

Bu yerda nima ko'rinadi:

- `committer` qatoridan keyin yangi sarlavha qo'shildi: **`gpgsig`**. Uning qiymati — ko'p qatorli imzo bloki. Commit sarlavhalarida ko'p qatorli qiymatning ikkinchi va keyingi qatorlari **bitta bo'sh joy** bilan boshlanadi — shu bilan Git "bu oldingi qatorning davomi" ekanini biladi (`gitformat-signature`).
- Imzo — **ommaviy** ma'lumot: uni ko'rsatish xavfsiz. Ichida imzolovchining ommaviy kaliti, "nom fazosi" (`git`) va hash algoritmi (`sha512`) kodlangan — base64'dagi `c3NoLWVkMjU1MTk` = `ssh-ed25519`, `Z2l0` = `git`.
- Formati sarlavhadan ko'rinib turibdi: `BEGIN SSH SIGNATURE`.

**Imzo nimani qamraydi?** Git imzo uchun "yuklama" (*payload*) sifatida commit obyektining **`gpgsig` siz** ko'rinishini oladi va uni tashqi dasturga beradi. Natijani esa obyektga `gpgsig` sarlavhasi qilib qo'shadi. Demak imzo `tree`, `parent`, `author`, `committer` va xabarni qamraydi — `tree` orqali esa butun fayllar suratini, `parent` orqali butun oldingi tarixni ham. Imzo obyektning bir qismi bo'lgani uchun u hash'ga ham kiradi — imzoni olib tashlasak, boshqa obyekt chiqadi:

```bash
$ git cat-file commit cf38cff | sed '/^gpgsig/,/END SSH/d' | git hash-object -t commit --stdin
d9df1a1fdaf770460b9e1b583a8a7ffca4ee35b2
```

Shuning uchun commit'ni keyinroq "imzolab qo'yib bo'lmaydi": imzo qo'shish — yangi hash'li yangi commit, ya'ni tarixni qayta yozish ([25-bob](25-tarixni-qayta-yozish.md)).

Git aynan qaysi buyruqni chaqirganini `GIT_TRACE=1` ko'rsatadi (vaqtinchalik fayl yo'li qisqartirilgan):

```bash
$ GIT_TRACE=1 git commit --allow-empty -q -m iz 2>&1 | grep run_command
... trace: run_command: ssh-keygen -Y sign -n git -f /tmp/misol/kalitlar/ali_ed25519 <vaqtinchalik-fayl>
...
```

`ssh-keygen -Y sign` — OpenSSH'ning "fayl imzolash" rejimi; `-n git` — **nom fazosi** (*namespace*). U bir kalit bilan qo'yilgan imzolarni maqsadiga qarab ajratadi: `git` nom fazosidagi imzoni boshqa maqsadga (masalan, fayl imzosi sifatida) ishlatib bo'lmaydi va aksincha.

## Kod: imzoni tekshirish — `allowed_signers`

Endi tekshirib ko'ramiz. Hali ishonchli kalitlar ro'yxati yo'q:

```bash
$ git verify-commit HEAD; echo "kod $?"
error: gpg.ssh.allowedSignersFile needs to be configured and exist for ssh signature verification
kod 1
```

GPG'da ommaviy kalitlar "kalitlar halqasi"da (*keyring*) saqlanadi va har biriga ishonch darajasi beriladi. SSH'da bunday tizim yo'q — uning o'rnini oddiy matnli fayl bosadi. Ma'lumotnoma (`config/gpg`) va `ssh-keygen(1)` dagi "ALLOWED SIGNERS" bo'limi bo'yicha har qator: **principal'lar** (kimligi, odatda email; vergul bilan bir nechta), ixtiyoriy opsiyalar va ommaviy kalit:

```bash
$ echo "ali@example.com namespaces=\"git\" $(cat /tmp/misol/kalitlar/ali_ed25519.pub)" > /tmp/misol/kalitlar/allowed_signers
$ cat /tmp/misol/kalitlar/allowed_signers
ali@example.com namespaces="git" ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMgFX4lxDygVQYFPr+9NWYRDPLveXeD2u/t6GJ2Oxblo ali@example.com
$ git config gpg.ssh.allowedSignersFile /tmp/misol/kalitlar/allowed_signers
```

`namespaces="git"` — bu kalitga faqat Git imzolari uchun ishonish. Endi:

```bash
$ git verify-commit HEAD; echo "kod $?"
Good "git" signature for ali@example.com with ED25519 key SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU
kod 0
```

Qatorni o'qiymiz: imzo to'g'ri (*Good*), nom fazosi `"git"`, principal `ali@example.com` (ro'yxatdan topildi), kalit barmoq izi — yuqorida `ssh-keygen -lf` ko'rsatgani bilan bir xil. Chiqish kodi `0` — skriptlar uchun asosiy natija shu. Xabar **stderr** ga chiqadi: `git verify-commit HEAD 2>/dev/null` hech narsa ko'rsatmaydi.

Principal fayldan qanday tanlanadi? Trace ko'rsatadi — Git `ssh-keygen` ni ikki marta chaqiradi:

```bash
$ GIT_TRACE=1 git verify-commit cf38cff 2>&1 | grep run_command
... trace: run_command: ssh-keygen -Y find-principals -f /tmp/misol/kalitlar/allowed_signers -s <vaqtinchalik-fayl> -Overify-time=20261007100500
... trace: run_command: ssh-keygen -Y verify -n git -f /tmp/misol/kalitlar/allowed_signers -I ali@example.com -s <vaqtinchalik-fayl> -Overify-time=20261007100500
```

Avval imzodagi kalit bo'yicha principal qidiriladi (`find-principals`), keyin shu principal nomidan imzo tekshiriladi (`verify -I ali@example.com`). `-Overify-time` — commit'ning **committer vaqti** (10:05:00). Bu muhim: kalitning amal qilish muddati commit qilingan paytga nisbatan tekshiriladi, bugungi kunga emas (pastda "kalit muddati").

Ma'lumotnoma ta'kidlaydi: principal **faqat kalitni tanish uchun** ishlatiladi. Git uni commit'dagi `author` yoki `committer` email bilan solishtirmaydi — `ali@example.com` principal'i bilan imzolangan commit'da muallif boshqa odam bo'lishi ham mumkin. (GitHub esa solishtiradi — pastda.)

### `verify-commit` opsiyalari

`-v` (`--verbose`) — tekshirishdan oldin obyekt mazmunini chiqaradi (imzosiz ko'rinishda):

```bash
$ git verify-commit -v HEAD
Good "git" signature for ali@example.com with ED25519 key SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU
tree 91448a765ae462269b4d1605b6610ee40ea84fbe
parent 3c8955c614a4425231ef8cd867c61e8aed0e2a74
author Ali Valiyev <ali@example.com> 1791349500 +0500
committer Ali Valiyev <ali@example.com> 1791349500 +0500

Versiya fayli
```

`--raw` — GPG holat chiqishini (`[GNUPG:] GOODSIG ...` kabi mashinaviy qatorlar) xom holda chiqaradi. SSH'da bunday maxsus format yo'q — sinovda `--raw` oddiy chiqish bilan bir xil qatorni berdi.

### `git log --show-signature`

Tarixni ko'rib chiqishda har commit imzosini tekshirish:

```bash
$ git log --show-signature -2
commit cf38cffccf308d2e313e6614515bddb5a518c4f5
Good "git" signature for ali@example.com with ED25519 key SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:05:00 2026 +0500

    Versiya fayli

commit 3c8955c614a4425231ef8cd867c61e8aed0e2a74
Author: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:00:00 2026 +0500

    Boshlang'ich commit
```

Imzosiz commit'da qo'shimcha qator yo'q. `git show --show-signature` ham xuddi shunday ishlaydi. Har doim ko'rsatish uchun — `log.showSignature true` (`git log`, `git show` uchun); bir martalik o'chirish — `--no-show-signature`:

```bash
$ git -c log.showSignature=true log -1 --oneline imzoli~1
76e6e8e Good "git" signature for ali@example.com with ED25519 key SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU
g.txt (imzoli)
$ git -c log.showSignature=true log -1 --oneline --no-show-signature imzoli~1
76e6e8e g.txt (imzoli)
```

Har imzo tekshiruvi tashqi dastur chaqiruvi; uzun tarixda `log.showSignature` `git log` ni sezilarli sekinlashtiradi.

## Kod: `%G?` — imzo holatini bitta harfda

Pro Git ko'rsatgan usul: `--format` (`--pretty=format:`) ichida `%G?` har commit uchun bitta harf chiqaradi. Ma'lumotnomadagi (`pretty-formats`) to'liq ro'yxat:

| Harf | Ma'nosi |
| --- | --- |
| `G` | Yaxshi (to'g'ri va ishonchli) imzo |
| `B` | Yomon imzo |
| `U` | Yaxshi imzo, lekin kalitning ishonchliligi noma'lum |
| `X` | Yaxshi imzo, lekin **imzoning** muddati o'tgan |
| `Y` | Yaxshi imzo, lekin **kalitning** muddati o'tgan |
| `R` | Yaxshi imzo, lekin kalit bekor qilingan (*revoked*) |
| `E` | Imzoni tekshirib bo'lmadi (masalan, kalit yo'q) |
| `N` | Imzo yo'q |

Boshqa imzo belgilari: `%GS` — imzolovchi nomi (SSH'da principal), `%GK` — kalit, `%GF` — kalit barmoq izi, `%GP` — asosiy kalit barmoq izi (GPG'da subkey bilan imzolanganda), `%GT` — ishonch darajasi, `%GG` — tekshiruvchi dasturning xom xabari.

Sinov repo'sida turli holatlarni yasab chiqamiz. Avval Vali o'z kaliti bilan commit qiladi (Vali hali `allowed_signers` da yo'q):

```bash
$ echo "v2" > versiya.txt && git add versiya.txt
$ GIT_AUTHOR_NAME="Vali Karimov" GIT_AUTHOR_EMAIL=vali@example.com \
  GIT_COMMITTER_NAME="Vali Karimov" GIT_COMMITTER_EMAIL=vali@example.com \
  git -c user.signingKey=/tmp/misol/kalitlar/vali_ed25519 commit -S -m "Versiya 2"
[main 9d2bedd] Versiya 2
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git verify-commit HEAD; echo "kod $?"
Good "git" signature with ED25519 key SHA256:VQrefwuCNF3lIsu8Ksfug92gYBFYHDMArTd7FkqY/pE
No principal matched.
kod 1
$ git log --format='%h %G? [%GS] [%GK] %GT %s'
9d2bedd U [] [SHA256:VQrefwuCNF3lIsu8Ksfug92gYBFYHDMArTd7FkqY/pE] undefined Versiya 2
cf38cff G [ali@example.com] [SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU] fully Versiya fayli
3c8955c N [] [] undefined Boshlang'ich commit
```

Uch holat bir ekranda:

- `G` + `fully` — kalit `allowed_signers` da. Ma'lumotnoma: SSH'da ishonch darajalari yo'q, shuning uchun kalit faylda bo'lsa ishonch `fully`, bo'lmasa `undefined` deb belgilanadi.
- `U` + `undefined` — imzo matematik to'g'ri, lekin kalit ro'yxatda yo'q. `verify-commit` bunday holatda **muvaffaqiyatsiz** (kod `1`) tugaydi.
- `N` — imzo yo'q.

**`B` — soxtalashtirilgan obyekt.** Imzoli commit mazmunini o'zgartirib (imzoni o'z joyida qoldirib), yangi obyekt yozamiz:

```bash
$ git cat-file commit cf38cff | sed 's/Versiya fayli/Versiya fayli (soxta)/' > soxta.txt
$ git hash-object -t commit -w soxta.txt
e392c208ef874d98e8386874d977c0e4421986a5
$ git verify-commit e392c20; echo "kod $?"
Could not verify signature.
Signature verification failed: incorrect signature
kod 1
$ git log -1 --format='%h %G? %s' e392c20
e392c20 B Versiya fayli (soxta)
```

Aynan shu holat uchun imzo bor: kim commit'ni o'zgartirsa, uni qayta imzolash uchun Ali'ning maxfiy kaliti kerak.

**Kalit muddati.** `allowed_signers` da kalitga amal qilish oralig'i berilishi mumkin (OpenSSH 8.8 dan): `valid-after`, `valid-before`. Vali'ni muddati 1-oktyabrda tugagan kalit bilan qo'shamiz:

```bash
$ echo "vali@example.com namespaces=\"git\",valid-before=\"20261001\" $(cat vali_ed25519.pub)" >> allowed_signers
$ git verify-commit 9d2bedd; echo "kod $?"
Good "git" signature with ED25519 key SHA256:VQrefwuCNF3lIsu8Ksfug92gYBFYHDMArTd7FkqY/pE
/tmp/misol/kalitlar/allowed_signers:2: key has expired: verify time 2026-10-07T10:10:00 > valid-before 2026-10-01T00:00:00
No principal matched.
kod 1
$ git log -1 --format='%h %G? %GT %s' 9d2bedd
9d2bedd U undefined Versiya 2
```

Diqqat: SSH'da muddati o'tgan kalit `Y` emas, **`U`** beradi — `ssh-keygen` bunday kalitni shunchaki "mos principal yo'q" deb hisoblaydi. Oraliqni commit vaqtini qamraydigan qilib o'zgartirsak:

```bash
$ cat allowed_signers | cut -c1-90
ali@example.com namespaces="git" ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMgFX4lxDygVQYFPr+9NW
vali@example.com namespaces="git",valid-after="20260101",valid-before="20261231" ssh-ed25519 AA
$ git verify-commit 9d2bedd; echo "kod $?"
Good "git" signature for vali@example.com with ED25519 key SHA256:VQrefwuCNF3lIsu8Ksfug92gYBFYHDMArTd7FkqY/pE
kod 0
```

Nega tekshirish commit vaqtiga bog'langan? Ma'lumotnoma sababini aytadi: kalitni almashtirganda (eskisiga `valid-before` qo'yib, yangisini qo'shib) **oldingi barcha imzolar yaroqli qoladi**. Kamchiligi ham bor: commit vaqtini imzolovchi o'zi yozadi ([03-bob](03-birinchi-sozlash.md), `GIT_COMMITTER_DATE`) — o'g'irlangan eski kalit egasi commit'ga eski sanani qo'yishi mumkin. Bunday holat uchun bekor qilish ro'yxati bor.

**Bekor qilingan kalit.** `gpg.ssh.revocationFile` — OpenSSH KRL fayli yoki bekor qilingan ommaviy kalitlar ro'yxati (principal'siz):

```bash
$ cp vali_ed25519.pub revoked_keys
$ git -c gpg.ssh.revocationFile=/tmp/misol/kalitlar/revoked_keys verify-commit 9d2bedd; echo "kod $?"
Could not verify signature.
kod 1
$ git -c gpg.ssh.revocationFile=/tmp/misol/kalitlar/revoked_keys log --format='%h %G? %GT %s'
9d2bedd B never Versiya 2
cf38cff G fully Versiya fayli
3c8955c N undefined Boshlang'ich commit
```

Ma'lumotnomada aytilganidek, ishonch `never`, imzo yaroqsiz — lekin harf `R` emas, **`B`**. Ya'ni SSH formatida sinovda faqat `G`, `U`, `B`, `N` uchradi. `X`, `Y`, `R` va `E` — GPG ma'lumotlariga (imzo/kalit muddati, revocation sertifikati, keyring'da kalit yo'qligi) asoslangan holatlar; ular bu kompyuterda `gpg` yo'qligi sababli **sinalmagan**.

Yana bir kuzatuv: formatni tekshiruvchi `gpg.format` emas, **imzo sarlavhasi** belgilaydi. `gpg.format=openpgp` bilan ham SSH imzolar to'g'ri tekshirildi (`BEGIN SSH SIGNATURE` ko'rib, Git `ssh-keygen` ni chaqiradi). Tekshiruv dasturi ishga tushmasa esa, natija `B` bo'ladi:

```bash
$ git -c gpg.ssh.program=yoq-dastur log -1 --format='%h %G? %s' cf38cff
error: cannot run yoq-dastur: No such file or directory
error: cannot run yoq-dastur: No such file or directory
cf38cff B Versiya fayli
```

## Kod: teglarni imzolash

Pro Git: imzoli teg uchun `-a` o'rniga `-s` ishlating ([12-bob](12-teglar-va-aliaslar.md)). `-s` (`--sign`) — standart kalit bilan, `-u <kalit>` (`--local-user`) — ko'rsatilgan kalit bilan. Ikkalasi ham avtomatik ravishda **annotated** teg yaratadi — imzo faqat teg obyektiga qo'yilishi mumkin, lightweight teg esa shunchaki ref:

```bash
$ git tag -s v1.0 -m "1.0 relizi"
$ git cat-file -t v1.0
tag
$ git cat-file -p v1.0
object 9d2bedd411aedb89e4a540ade763bd57ecd7c853
type commit
tag v1.0
tagger Ali Valiyev <ali@example.com> 1791350100 +0500

1.0 relizi
-----BEGIN SSH SIGNATURE-----
U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAgyAVfiXEPKBVBgU+v701ZhEM8u9
5d4Pa7+3oYnY7FuWgAAAADZ2l0AAAAAAAAAAZzaGE1MTIAAABTAAAAC3NzaC1lZDI1NTE5
AAAAQOw+IZ9VnQJt/nzY6F20hvoMI/MgitwZnyqZiVHVjy8AQK0TOsC28/qNoAEuVWslEt
Jno7oSGs93ltGMCRSRLAc=
-----END SSH SIGNATURE-----
```

Commit'dan farqi: tegda maxsus sarlavha yo'q, imzo **xabar oxiriga** qo'shiladi. Yuklama — imzo blokigacha bo'lgan butun teg obyekti. Teg `object` qatori orqali commit'ga, commit esa `tree` va `parent` orqali butun tarixga bog'langan — shuning uchun imzoli reliz tegi "shu reliz aynan mana shu kod" degan kafolat beradi.

Tekshirish — `git tag -v` yoki `git verify-tag` (ikkalasi bir xil ishni qiladi; `tag -v` obyekt mazmunini ham chiqaradi, `verify-tag` faqat `-v` bilan):

```bash
$ git verify-tag v1.0; echo "kod $?"
Good "git" signature for ali@example.com with ED25519 key SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU
kod 0
$ git tag -v v1.0
Good "git" signature for ali@example.com with ED25519 key SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU
object 9d2bedd411aedb89e4a540ade763bd57ecd7c853
type commit
tag v1.0
tagger Ali Valiyev <ali@example.com> 1791350100 +0500

1.0 relizi
```

Imzosiz annotated teg:

```bash
$ git tag -a v0.9 -m "imzosiz" HEAD~1
$ git verify-tag v0.9; echo "kod $?"
error: no signature found
kod 1
```

`verify-tag --format` bilan `for-each-ref` uslubidagi maydonlarni chiqarish mumkin ([12-bob](12-teglar-va-aliaslar.md)), `%(contents:signature)` esa imzo blokini beradi:

```bash
$ git verify-tag --format='%(refname:short) %(taggername) %(contents:subject)' v1.0
v1.0 Ali Valiyev 1.0 relizi
$ git tag -l --format='%(refname:short) %(contents:signature)'
v0.9 
v1.0 -----BEGIN SSH SIGNATURE-----
U1NIU0lHAAAAAQAAADMAAAALc3NoLWVkMjU1MTkAAAAgyAVfiXEPKBVBgU+v701ZhEM8u9
...
-----END SSH SIGNATURE-----
```

**`git show` teg imzosini tekshirmaydi.** Pro Git `git show v1.5` da imzo blokini ko'rsatadi — bu shunchaki matn. `--show-signature` bilan ham sinovda faqat teg ko'rsatgan **commit** imzosi tekshirildi, teg imzosi xom holda qoldi:

```bash
$ git show --show-signature v1.0
tag v1.0
Tagger: Ali Valiyev <ali@example.com>
Date:   Wed Oct 7 10:15:00 2026 +0500

1.0 relizi
-----BEGIN SSH SIGNATURE-----
...
-----END SSH SIGNATURE-----

commit 9d2bedd411aedb89e4a540ade763bd57ecd7c853
Good "git" signature for vali@example.com with ED25519 key SHA256:VQrefwuCNF3lIsu8Ksfug92gYBFYHDMArTd7FkqY/pE
Author: Vali Karimov <vali@example.com>
...
```

Teg imzosini tekshirish uchun — faqat `git tag -v` / `git verify-tag`.

## Kod: avtomatik imzolash — `commit.gpgSign`, `tag.gpgSign`

Har safar `-S` yozish o'rniga:

```bash
$ git config commit.gpgSign true
$ echo "a" > a.txt && git add a.txt && git commit -q -m "a.txt qo'shildi"
$ echo "b" > b.txt && git add b.txt && git commit -q --no-gpg-sign -m "b.txt (imzosiz)"
$ git log --format='%h %G? %s' -3
0adedb4 N b.txt (imzosiz)
380328a G a.txt qo'shildi
9d2bedd G Versiya 2
```

`--no-gpg-sign` — bir martalik bekor qilish: u `commit.gpgSign` ni ham, oldinroq yozilgan `--gpg-sign` ni ham bekor qiladi. `-S<kalit>` (`--gpg-sign=<kalit>`) bilan kalitni shu commit uchun almashtirish mumkin; ma'lumotnoma ogohlantiradi: kalit opsiyaga **bo'sh joysiz** yopishtiriladi (`-S/yo'l/kalit`). Bo'sh joy qo'yilsa, yo'l commit qilinadigan fayl (pathspec) deb tushuniladi:

```bash
$ git commit --allow-empty -S /tmp/misol/kalitlar/vali_ed25519 -m bosh
fatal: /tmp/misol/kalitlar/vali_ed25519: '/tmp/misol/kalitlar/vali_ed25519' is outside repository at '/tmp/misol/44-imzo'
$ git commit --allow-empty -S/tmp/misol/kalitlar/vali_ed25519 -m yopiq
[bosh d7dd29e] yopiq
```

Kalit ko'rsatilmasa, `user.signingKey`, u ham bo'lmasa (GPG'da) committer identifikatori ishlatiladi.

`commit.gpgSign` faqat `git commit` ga emas, commit yaratadigan hamma buyruqqa ta'sir qiladi: `merge`, `cherry-pick`, `rebase`, `revert`, `am`. Ma'lumotnoma shuni eslatadi: `rebase` kabi amallarda ko'p commit imzolanadi — parolli kalitda har biri uchun parol so'ralmasligi uchun agent ishlating.

Teglar uchun — `tag.gpgSign`:

```bash
$ git config tag.gpgSign true
$ git tag v1.1-x -m "xabar"
$ git verify-tag v1.1-x
Good "git" signature for ali@example.com with ED25519 key SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU
$ git tag --no-sign v1.1-y -m x
$ git verify-tag v1.1-y
error: no signature found
$ GIT_EDITOR=true git tag v1.1
fatal: no tag message?
```

Oxirgi qatorga e'tibor bering: `tag.gpgSign` yoqilganda **lightweight teg yaratib bo'lmaydi** — bayroqsiz `git tag v1.1` ham imzoli (demak annotated) tegga aylanadi va xabar so'raydi. Bo'sh xabar bilan Git to'xtadi. Lightweight teg kerak bo'lsa — `--no-sign`. Ma'lumotnoma yana aytadi: `tag.gpgSign` skriptlarda ko'p teg imzolanishiga olib keladi, va `-u <kalit>` bilan yoqilgan imzolashga ta'sir qilmaydi.

Yumshoqroq variant — `tag.forceSignAnnotated`: faqat **annotated** teglarni imzolash. Lekin buyruq qatorida `-a` (`--annotate`) aniq yozilsa, u ustun turadi:

```bash
$ git -c tag.forceSignAnnotated=true tag -m "izoh" t1
$ git verify-tag t1; echo $?
Good "git" signature for ali@example.com with ED25519 key SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU
0
$ git -c tag.forceSignAnnotated=true tag -a -m "izoh" t2
$ git verify-tag t2; echo $?
error: no signature found
1
```

## Kod: `amend` va `rebase` imzoni saqlamaydi

Imzo obyekt hash'iga bog'liq. Commit qayta yaratilsa (`--amend`, `rebase`, `cherry-pick`), eski imzo yangi obyektga **ko'chmaydi** — yangi commit imzolanishi yoki imzosiz qolishi joriy sozlamaga bog'liq:

```bash
$ git commit -q -m "i.txt"                                    # commit.gpgSign=true
$ git log -1 --format='%h %G? %s'
bd77f87 G i.txt
$ git commit -q --amend --no-gpg-sign -m "i.txt qo'shildi"
$ git log -1 --format='%h %G? %s'
0872636 N i.txt qo'shildi
$ git commit -q --amend -m "i.txt qo'shildi"
$ git log -1 --format='%h %G? %s'
ecf8892 G i.txt qo'shildi
```

`commit.gpgSign` o'chirilgan holda `rebase`:

```bash
$ git log --format='%h %G? %s' -2 aralash
e98594e G e.txt (imzoli)
6a3d9e5 N d.txt (imzosiz)
$ git switch -q aralash && git rebase -q 76e6e8e
$ git log --format='%h %G? %s' -3
0d39eb8 N e.txt (imzoli)
e58b91b N d.txt (imzosiz)
76e6e8e G g.txt (imzoli)
```

Imzoli `e.txt` commit'i rebase'dan keyin imzosiz bo'lib qoldi. `rebase -S` esa ko'chirilgan **hamma** commit'ni joriy kalit bilan imzolaydi — shu jumladan avval imzosiz bo'lganini ham:

```bash
$ git reset -q --hard e98594e && git rebase -q -S 76e6e8e
$ git log --format='%h %G? %s' -3
96f4f99 G e.txt (imzoli)
504e989 G d.txt (imzosiz)
76e6e8e G g.txt (imzoli)
```

Bu nozik nuqta: rebase qilgan odam boshqalarning commit'larini **o'z kaliti bilan** qayta imzolaydi. Imzo endi "Vali yozgan" emas, "buni Ali qayta qurgan va tasdiqlagan" degani bo'ladi. Muallif qatori esa Vali'niki bo'lib qoladi.

## Kod: `merge --verify-signatures`

Pro Git: `git merge` va `git pull` ga `--verify-signatures` berilsa, ishonchli imzosi bo'lmagan commit merge qilinmaydi. Uch branch tayyorlaymiz (`main` dan):

```bash
$ git log --all --format='%h %G? %s' --graph
* 76e6e8e G g.txt (imzoli)
| * 3cadc6d U f.txt (begona kalit)
|/  
| * e98594e G e.txt (imzoli)
| * 6a3d9e5 N d.txt (imzosiz)
|/  
| * 3ce2480 N c.txt (imzosiz)
|/  
* 0adedb4 N b.txt (imzosiz)
...
```

`imzosiz` (`3ce2480`), `begona` (`3cadc6d`, ro'yxatda yo'q kalit), `aralash` (imzosiz + ustida imzoli), `imzoli` (`76e6e8e`).

```bash
$ git merge --verify-signatures imzosiz; echo "kod $?"
fatal: Commit 3ce2480 does not have a GPG signature.
kod 128
$ git merge --verify-signatures begona; echo "kod $?"
fatal: Commit 3cadc6d has an untrusted GPG signature, allegedly by (null).
kod 128
```

Ikkala holatda merge boshlanmadi ham — working tree va `HEAD` o'zgarmadi. Xabarlarda SSH imzo bo'lsa ham "GPG signature" deyiladi (tarixiy nom); `(null)` — principal topilmagani.

Endi `aralash` — unda imzosiz `d.txt` commit'i bor:

```bash
$ git merge --verify-signatures --no-edit aralash; echo "kod $?"
Commit e98594e has a good GPG signature by ali@example.com
Updating 0adedb4..e98594e
Fast-forward
 d.txt | 1 +
 e.txt | 1 +
 2 files changed, 2 insertions(+)
 create mode 100644 d.txt
 create mode 100644 e.txt
kod 0
```

**Merge o'tdi**, imzosiz `6a3d9e5` esa `main` ga tushdi. Bu Pro Git bilan farq: kitob "branch'da imzosiz commit'lar bo'lsa, merge ishlamaydi" deydi. v2.56.0 ma'lumotnomasi (`merge-options`) aniqroq: **faqat merge qilinayotgan branch'ning uchidagi (*tip*) commit** tekshiriladi. Sinov ham shuni ko'rsatdi. Mantiqi: uchidagi commit imzosi `parent` orqali butun tarixni qamraydi — imzolovchi "shu tarixni qabul qildim" deb tasdiqlaydi. Har bir commit imzoli bo'lishi kerak bo'lsa, buni alohida tekshirish kerak (masalan, `git log --format='%h %G?' main..branch` da `G` dan boshqa harf qidirish).

Doimiy yoqish — `merge.verifySignatures true`, bir martalik o'chirish — `--no-verify-signatures`.

### Merge commit'ni imzolash va `mergetag`

`-S` merge commit'ining o'zini imzolaydi (bizda `commit.gpgSign` yoqilgani uchun u baribir imzolanardi):

```bash
$ git merge --verify-signatures -S --no-edit imzoli
Commit 76e6e8e has a good GPG signature by ali@example.com
Merge made by the 'ort' strategy.
 g.txt | 1 +
 1 file changed, 1 insertion(+)
 create mode 100644 g.txt
$ git log --format='%h %G? %s' -1
41b3a65 G Merge branch 'imzoli'
```

Pro Git misolida strategiya `'recursive'` — Git 2.34 dan beri standart strategiya `ort` ([26-bob](26-murakkab-merge.md)).

Imzoli **teg**ni merge qilganda Git yana bir narsa qiladi — butun teg obyektini merge commit ichiga `mergetag` sarlavhasi qilib ko'chiradi:

```bash
$ git tag -s v1.2 -m "1.2 relizi" imzoli      # imzoli branch'ga yangi commit qo'shilgandan keyin
$ git merge --no-edit v1.2
Merge made by the 'ort' strategy.
...
$ git cat-file -p HEAD
tree 324ced4bfd69f3b4188f1bfb087a3313d4dcd129
parent 41b3a65f5447a8a2f220cd8cc6b7da23b5120c35
parent b03911a116d7868fba1f11450ef5c63df8f6dd40
author Ali Valiyev <ali@example.com> 1791351720 +0500
committer Ali Valiyev <ali@example.com> 1791351720 +0500
mergetag object b03911a116d7868fba1f11450ef5c63df8f6dd40
 type commit
 tag v1.2
 tagger Ali Valiyev <ali@example.com> 1791351660 +0500
 
 1.2 relizi
 -----BEGIN SSH SIGNATURE-----
 ...
 -----END SSH SIGNATURE-----
gpgsig -----BEGIN SSH SIGNATURE-----
 ...
 -----END SSH SIGNATURE-----

Merge tag 'v1.2'

1.2 relizi

# -----BEGIN SSH SIGNATURE-----
# ...
# Good "git" signature for ali@example.com with ED25519 key SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU
```

Merge commit'da **ikki** imzo: `mergetag` ichida reliz tegini qo'ygan odamniki, `gpgsig` da merge qilgan odamniki. Tegning o'zi keyin o'chirilsa ham, uning imzosi tarixda qoladi. Merge xabariga Git teg tekshiruvi natijasini `#` bilan qo'shadi; muharrir ochilganda bu qatorlar odatda tozalanadi, `--no-edit` bilan esa xabarda qoldi (`gitformat-signature` misolidagidek). `git log --show-signature` ikkalasini ham tekshiradi:

```bash
$ git log --show-signature -1
commit 0c531393a913d34ab152ccbff15a5e19e78267a5
Good "git" signature for ali@example.com with ED25519 key SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU
merged tag 'v1.2'
Good "git" signature for ali@example.com with ED25519 key SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU
Merge: 41b3a65 b03911a
...
```

## Kod: `pull --verify-signatures`

`pull` = `fetch` + `merge` ([27-bob](27-remote.md)), shuning uchun opsiya merge qismiga uzatiladi. Lokal bare "server" va klon bilan (klonda ham `allowedSignersFile` sozlangan — tekshiruvchi o'zi ishonadigan kalitlarni biladi):

```bash
$ git pull --verify-signatures; echo "kod $?"            # serverga imzosiz commit kelgan
From /tmp/misol/server
   0c53139..0885f8b  main       -> origin/main
fatal: Commit 0885f8b does not have a GPG signature.
kod 128
$ git log -1 --format='%h %s'
0c53139 Merge tag 'v1.2'
```

`fetch` bajarildi (`origin/main` yangilandi), lekin lokal `main` joyida qoldi. `merge.verifySignatures true` ham `pull` ga xuddi shunday ta'sir qildi. Server'ga ustiga imzoli commit kelgach:

```bash
$ git pull --verify-signatures; echo "kod $?"
From /tmp/misol/server
   0885f8b..4a7a639  main       -> origin/main
Commit 4a7a639 has a good GPG signature by ali@example.com
Updating 0c53139..4a7a639
Fast-forward
 j.txt | 1 +
 k.txt | 1 +
 2 files changed, 2 insertions(+)
 create mode 100644 j.txt
 create mode 100644 k.txt
kod 0
```

Yana tip qoidasi: imzosiz `0885f8b` imzoli `4a7a639` ostida o'tib ketdi.

`git pull` ma'lumotnomasi bu opsiya "faqat merge qilganda foydali" deydi. Sinovda: `--rebase` bilan, lokal commit bo'lmagani uchun fast-forward mumkin bo'lganda tekshiruv baribir ishladi (`fatal: Commit bda6634 does not have a GPG signature.`). Lokal commit bo'lib, haqiqiy rebase kerak bo'lganda esa:

```bash
$ git pull --rebase --verify-signatures; echo "kod $?"
warning: ignoring --verify-signatures for rebase
Rebasing (1/1)Successfully rebased and updated refs/heads/main.
kod 0
```

Ya'ni `pull --rebase` (yoki `pull.rebase true`) da bu himoyaga tayanmang.

## GPG (OpenPGP) bilan imzolash — sinalmagan

Bu bo'lim Pro Git va ma'lumotnomaga asoslangan; misollar yozilgan kompyuterda `gpg` yo'q (`which gpg` — `gpg not found`), shuning uchun buyruqlar va chiqishlar **bu yerda sinalmagan**. Chiqishlar Pro Git'dan olingan va eski (2014) GnuPG versiyasiga tegishli.

Pro Git tartibi:

```bash
$ gpg --list-keys           # o'rnatilgan kalitlar
$ gpg --gen-key             # kalit yo'q bo'lsa — yaratish
$ git config --global user.signingkey 0A46826A!
```

`0A46826A` — kalit ID'si (Pro Git misolidagi). `user.signingKey` qiymati `gpg` ning `--local-user` parametriga **o'zgarishsiz** uzatiladi — demak `gpg` tushunadigan har qanday shaklda (ID, barmoq izi, email) yozish mumkin; oxiridagi `!` GnuPG'ga "aynan shu (sub)kalitni ishlat" degani. `user.signingKey` berilmasa, `git tag -s` kalitni committer email'i bo'yicha qidiradi.

GPG'dan keyin Git buyruqlari bir xil: `git commit -S`, `git tag -s`, `git verify-commit`, `git tag -v`, `git log --show-signature`, `%G?`, `merge --verify-signatures`. Farqlar:

- **Parol so'rovi.** Pro Git chiqishida `You need a passphrase to unlock the secret key...` — GPG kalitlari odatda parolli; `gpg-agent` uni eslab qoladi.
- **Tekshirish uchun imzolovchining ommaviy kaliti keyring'da bo'lishi kerak.** Bo'lmasa (Pro Git):

  ```text
  gpg: Signature made Wed Sep 13 02:08:25 2006 PDT using DSA key ID F3119B9A
  gpg: Can't check signature: public key not found
  error: could not verify the tag 'v1.4.2.1'
  ```

  `%G?` bu holatda `E` beradi.
- **Ishonch darajalari** (`gpg.minTrustLevel`): o'sish tartibida `undefined`, `never`, `marginal`, `fully`, `ultimate`. Sozlanmagan bo'lsa, merge amallari (`merge/pull --verify-signatures`) kamida `marginal` talab qiladi, qolgan tekshiruvlar — kamida `undefined`. `gitformat-signature` misolida ko'ringan `WARNING: This key is not certified with a trusted signature!` — imzo to'g'ri, lekin kalitga ishonch berilmagan.
- **Muddat va bekor qilish** GPG kalitining o'zida saqlanadi — `X`, `Y`, `R` holatlari shundan.
- Dasturni almashtirish: `gpg.program` (eski nom) yoki `gpg.openpgp.program`. Dastur `gpg --verify` va `gpg -bsau <kalit>` interfeysini qo'llashi kerak.

**X.509** (`gpg.format=x509`, dastur `gpgsm`) — tashkilot sertifikatlari (S/MIME) bilan imzolash; GitHub hujjati bo'yicha odatda katta tashkilotlarda talab qilinadi. Bu ham sinalmagan.

Qaysi birini tanlash? GitHub hujjati: SSH — "yaratish eng oson"; GPG — sozlash murakkabroq, lekin kalit muddati va bekor qilish kabi imkoniyatlar bor. SSH'da bularning o'rnini `allowed_signers` dagi `valid-before` va `gpg.ssh.revocationFile` qisman bosadi — yuqorida ko'rganimizdek.

## Muhandislik nuqtai nazari: GitHub'dagi "Verified" belgisi

GitHub commit va teglar yonida imzo holatini ko'rsatadi (docs.github.com, "About commit signature verification"). Standart rejimda:

| Belgi | Ma'nosi |
| --- | --- |
| **Verified** | Commit imzolangan va imzo muvaffaqiyatli tekshirildi |
| **Unverified** | Commit imzolangan, lekin imzoni tekshirib bo'lmadi |
| Belgi yo'q | Commit imzolanmagan |

**Vigilant mode** (hushyor rejim) yoqilsa, imzosiz commit'lar ham "Unverified" deb ko'rsatiladi va yana bir holat qo'shiladi — **Partially verified**: imzo to'g'ri, lekin commit muallifi committer emas va o'sha muallif vigilant mode'ni yoqqan. GitHub izohi: bunday imzo muallif roziligini kafolatlamaydi (yuqoridagi `rebase -S` holatini eslang).

GitHub "Verified" deyishi uchun:

- **Kalit akkauntga yuklangan bo'lishi kerak.** SSH kaliti uchun Settings'da kalit turi tanlanadi: *Authentication* yoki *Signing*. GitHub hujjati: bitta kalitni ham ulanish, ham imzo uchun ishlatmoqchi bo'lsangiz, uni **ikki marta** yuklashingiz kerak.
- **Email mos bo'lishi kerak.** GPG uchun hujjat aniq: committer (yoki tagger) email'i GPG kalitining identifikatorlaridan biriga mos bo'lishi va akkauntdagi **tasdiqlangan** email bo'lishi kerak. Git o'zi principal'ni muallif bilan solishtirmaydi — GitHub esa solishtiradi.
- **Git versiyasi**: SSH imzo tekshiruvi — Git 2.34+, S/MIME — 2.19+.

Yana uch muhim nuqta:

- GitHub veb-interfeysida qilingan commit'larni GitHub o'zi GPG bilan imzolaydi — ular "Verified" bo'ladi.
- PR'dagi **Rebase and merge** tugmasi head branch commit'larini imzo tekshiruvisiz qayta yaratadi — GitHub'da sizning maxfiy kalitingiz yo'q, ularni sizning nomingizdan imzolay olmaydi (yuqoridagi "rebase imzoni saqlamaydi" bilan bir xil sabab).
- **Doimiy tekshiruv**: bir marta tasdiqlangan commit keyin kalit bekor qilinsa, muddati o'tsa yoki o'zgartirilsa ham "Verified" holatini saqlaydi — GitHub dastlabki tekshiruv yozuviga tayanadi va bu yozuvni tahrirlab bo'lmaydi.

"Verified" — GitHub'ning o'z hukmi, Git'niki emas. Lokal `git verify-commit` sizning `allowed_signers` (yoki keyring)ingizga qaraydi; ikkisi turli natija berishi mumkin.

## Muhandislik nuqtai nazari: jamoada imzolashni joriy qilish

**`allowed_signers` qayerda turadi?** Ma'lumotnoma uch yo'lni aytadi:

1. Har dasturchi o'z faylini repo'dan tashqarida yuritadi (masalan, `~/.config/git/allowed_signers`) — o'z "ishonch ombori".
2. Markaziy server push huquqi bor kalitlardan faylni avtomatik yaratadi; korporativ muhitda u dasturchilar SSH kalitlarini boshqaradigan avtomatika tomonidan global joyda yaratiladi.
3. Faqat imzoli commit qabul qiladigan repo faylni **repo'ning o'zida** saqlashi mumkin — yo'l working tree ildiziga nisbatan beriladi. Shunda kalitlar ro'yxatini faqat allaqachon yaroqli kalitga ega committer o'zgartira oladi.

Nisbiy yo'l sinovda ichki papkadan ham ishladi:

```bash
$ cp /tmp/misol/kalitlar/allowed_signers .allowed_signers
$ git config gpg.ssh.allowedSignersFile .allowed_signers
$ mkdir ichki && cd ichki && git verify-commit HEAD
Good "git" signature for ali@example.com with ED25519 key SHA256:ZhGv/Z9dBsNIPR9ANyp5ae/kPwQx0eeSGyCnTnuXTmU
```

Uchinchi yo'lning cheklovi: kim yangi kalitni faylga qo'shsa, o'sha commit ham tekshirilishi kerak — aks holda begona odam o'z kalitini ro'yxatga qo'shib, keyin "ishonchli" imzo qo'ya oladi. Shuning uchun bu yondashuv server tomonidagi tekshiruv bilan birga ma'noga ega.

**Kim imzolaydi?** Pro Git maslahati: hamma `git config --local commit.gpgsign true` qilsin. Amalda ko'p jamoalar kamroq talab qiladi: imzoli **reliz teglari** (eng qimmatli — "shu kodni men chiqardim") va himoyalangan branch'ga tushadigan merge commit'lar. `merge --verify-signatures` faqat uchdagi commit'ni tekshirishini hisobga olsak, bu mantiqiy: kim merge qilsa, o'sha "tarixni qabul qildim" deb imzo qo'yadi.

**Kalit almashtirish.** SSH'da eski kalitga `valid-before` qo'yib, yangisini alohida qatorda qo'shing — eski imzolar yaroqli qoladi. Kalit o'g'irlangan bo'lsa, `valid-before` yetarli emas (sanani soxtalashtirish mumkin) — kalitni `revocationFile` ga qo'shing; shunda u bilan qo'yilgan **hamma** imzolar `B` bo'ladi.

**Imzo nimani kafolatlamaydi.** Imzo "shu kalit egasi shu obyektni tasdiqladi" deydi, xolos. Kod to'g'riligi, kalit egasining niyati, kalit o'g'irlanmagani — imzodan tashqarida. Parolsiz maxfiy kalit (bu bobdagi sinov kaliti kabi) noutbuk bilan birga o'g'irlanishi mumkin; haqiqiy kalitga parol qo'ying ([30-bob](30-ssh-va-credential.md)).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `gpg.format=ssh` ni unutish | Git `gpg` ni chaqiradi: `cannot run gpg` yoki noto'g'ri kalit | `git config --global gpg.format ssh` |
| `allowedSignersFile` sozlamasdan tekshirish | `verify-commit` xato, `%G?` imzoli commit'da ham `N` ko'rsatdi | O'z va jamoa kalitlarini `allowed_signers` ga yozish, sozlamani berish |
| `key::...` yoki `.pub` ni agent'siz ishlatish | `Couldn't get agent socket?`, commit yaratilmaydi | Kalitni `ssh-add` bilan agent'ga qo'shish yoki maxfiy kalit yo'lini ko'rsatish |
| `-S /yo'l/kalit` (bo'sh joy bilan) | Yo'l pathspec deb tushuniladi: `fatal: ... is outside repository` | `-S/yo'l/kalit` yoki `--gpg-sign=/yo'l/kalit` |
| `git show v1.0` dagi imzo blokini "tekshirildi" deb o'ylash | `show` teg imzosini tekshirmaydi | `git tag -v v1.0` / `git verify-tag v1.0` |
| `merge --verify-signatures` hamma commit'ni tekshiradi deb kutish | Faqat uchidagi commit tekshiriladi; imzosizlar ostida o'tadi | Har commit kerak bo'lsa: `git log --format='%h %G?' main..branch` |
| `pull --rebase --verify-signatures` ga tayanish | Rebase kerak bo'lganda opsiya e'tiborsiz qoldiriladi | Avval `fetch`, keyin `git log --format=%G?` bilan tekshirish |
| Rebase/amend'dan keyin imzo saqlanadi deb o'ylash | Yangi obyekt — eski imzo ko'chmaydi | `commit.gpgSign true` yoki `rebase -S`; rebase qilgan odam imzolaydi |
| `tag.gpgSign` yoqilgan holda lightweight teg kutish | `git tag nom` ham annotated bo'ladi va xabar so'raydi | `git tag --no-sign nom` |
| Maxfiy kalitni repo'ga, chat'ga yoki CI log'iga qo'yish | Kim olsa, sizning nomingizdan imzolay oladi | Faqat `.pub` tarqatiladi; sizib chiqsa — `revocationFile` va yangi kalit |
| SSH kalitini GitHub'ga faqat *Authentication* turida yuklash | GitHub imzoni tanimaydi — "Unverified" | Xuddi shu kalitni *Signing* turida ham yuklash |

## Amaliyot

1. Sinov papkasida `ssh-keygen -t ed25519 -f ./imzo -N '' -C siz@example.com` bilan kalit yarating (haqiqiy `~/.ssh` ga tegmang). Sinov repo'sida `gpg.format`, `user.signingKey` ni sozlab, `git commit -S` qiling. `git cat-file -p HEAD` da `gpgsig` sarlavhasini toping va uning davom qatorlari nimadan boshlanishini ayting.
2. Shu commit'dan `gpgsig` blokini `sed` bilan olib tashlab, `git hash-object -t commit --stdin` ga bering. Hash nega boshqa? Imzo yuklamasi aynan qaysi baytlardan iborat?
3. `allowedSignersFile` siz va bilan `git verify-commit` ni bajaring, chiqish kodlarini yozing. `GIT_TRACE=1` bilan Git chaqirgan `ssh-keygen -Y` buyruqlarini va `-Overify-time` qiymatini toping — u qaysi vaqtga mos?
4. Ikkinchi kalit yarating va u bilan commit qiling. `git log --format='%h %G? %GS %GT %s'` da `G`, `U`, `N` ni oling. Keyin commit'ni `sed` bilan buzib, `hash-object -w` bilan yozing va `B` ni oling.
5. Ikkinchi kalitni `allowed_signers` ga avval o'tib ketgan `valid-before` bilan, keyin commit vaqtini qamraydigan oraliq bilan qo'shing. So'ng uni `gpg.ssh.revocationFile` ga qo'ying. Har bosqichda `%G?` va `%GT` ni yozib boring.
6. `git tag -s v1.0 -m ...` qiling, `git cat-file -p v1.0` bilan imzo qayerda turganini commit imzosi bilan solishtiring. `git tag -v`, `git verify-tag`, `git show --show-signature` chiqishlarini taqqoslang — qaysi biri teg imzosini haqiqatan tekshiradi?
7. `tag.gpgSign true` qilib, `git tag nom` va `git tag --no-sign nom` ni sinang. `commit.gpgSign true` bilan `--amend --no-gpg-sign` qilib, imzo yo'qolishini ko'ring.
8. (Qiyinroq) Uch branch yarating: uchi imzosiz; uchi begona kalit bilan; ostida imzosiz, uchi imzoli. Har biriga `git merge --verify-signatures` qiling va natijani ma'lumotnomadagi "tip commit" qoidasi bilan tushuntiring. So'ng bare repo orqali `git pull --verify-signatures` ni fast-forward va (lokal commit bilan) `--rebase` holatlarida sinang. Oxirida imzoli tegni merge qilib, merge commit'dagi `mergetag` va `gpgsig` sarlavhalarini toping va `git log --show-signature -1` nechta imzo tekshirganini sanang.

## Rasmiy hujjat

- Pro Git — Signing Your Work: <https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work>
- `git commit` (`-S`, `--gpg-sign`, `--no-gpg-sign`): <https://git-scm.com/docs/git-commit>
- `git tag` (`-s`, `-u`, `--no-sign`, `-v`): <https://git-scm.com/docs/git-tag>
- `git verify-commit`: <https://git-scm.com/docs/git-verify-commit>
- `git verify-tag`: <https://git-scm.com/docs/git-verify-tag>
- `git merge` (`--verify-signatures`, `-S`): <https://git-scm.com/docs/git-merge>
- `git pull` (`--verify-signatures`): <https://git-scm.com/docs/git-pull>
- `git log` — `--show-signature`, format belgilari `%G?`, `%GS`, `%GK`, `%GF`, `%GP`, `%GT`, `%GG`: <https://git-scm.com/docs/pretty-formats>
- `git config` — `gpg.*`, `user.signingKey`, `commit.gpgSign`, `tag.gpgSign`, `tag.forceSignAnnotated`, `merge.verifySignatures`, `log.showSignature`: <https://git-scm.com/docs/git-config>
- `gitformat-signature` (imzo formatlari, `gpgsig`, `mergetag`): <https://git-scm.com/docs/gitformat-signature>
- `ssh-keygen(1)` — "ALLOWED SIGNERS" bo'limi: <https://man.openbsd.org/ssh-keygen#ALLOWED_SIGNERS>
- GitHub — About commit signature verification: <https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification>
- GitHub — Displaying verification statuses for all of your commits (vigilant mode): <https://docs.github.com/en/authentication/managing-commit-signature-verification/displaying-verification-statuses-for-all-of-your-commits>
- GitHub — Telling Git about your signing key: <https://docs.github.com/en/authentication/managing-commit-signature-verification/telling-git-about-your-signing-key>
