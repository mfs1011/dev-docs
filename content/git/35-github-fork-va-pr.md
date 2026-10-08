# 35 — GitHub: fork va pull request

[← Oldingi: Loyihani yuritish](34-loyihani-yuritish.md) · [Mundarija](README.md) · [Keyingi: GitHub: repo va tashkilotni boshqarish →](36-github-boshqaruv.md)

## Tushuncha

Oldingi boblarda Git'ning o'zi bilan ishladik: commit, branch, remote, push. **GitHub** — bu Git repo'larini saqlaydigan eng katta xizmat (hosting). U Git'ning ustiga veb-interfeys va jamoaviy ish uchun vositalar qo'shadi. Muhimi: GitHub Git'ning o'rnini bosmaydi. Siz baribir `git clone`, `git push`, `git fetch` qilasiz — GitHub esa shu repo'larning "uyi" va ular atrofidagi muhokama joyi.

Bu bobda ikki asosiy tushuncha bor:

- **Fork** — boshqa birovning repo'sining GitHub'dagi **sizga tegishli nusxasi**. Asl loyihaga push qilish huquqingiz yo'q, lekin o'z fork'ingizga push qila olasiz.
- **Pull request** (qisqasi **PR**) — "mening branch'imdagi o'zgarishlarni sizning branch'ingizga qo'shib oling" degan **taklif**. PR — bu Git buyrug'i emas, GitHub'ning xususiyati: muhokama sahifasi, kod ko'rib chiqish (review), avtomatik tekshiruvlar va "Merge" tugmasi bir joyda.

Butun jarayonni bitta rasmda ko'raylik:

```text
   github.com/muallif/blink          github.com/ali/blink
   (asl loyiha, "upstream")   fork   (sizning nusxangiz, "origin")
   ┌───────────────────┐    ─────▶   ┌───────────────────┐
   │ main              │             │ main              │
   │                   │  ◀─ PR ──   │ sekin-blink       │
   └───────────────────┘             └───────────────────┘
            ▲  git fetch upstream          ▲  │ git clone
            │                    git push  │  ▼
            └────────────  kompyuteringiz (lokal repo)
```

Ya'ni: siz asl repo'ga **hech qachon** to'g'ridan-to'g'ri yozmaysiz. O'z fork'ingizga yozasiz va asl loyiha egasidan "buni oling" deb so'raysiz. Bu aslida [32-bob](32-taqsimlangan-workflowlar.md)dagi **integratsiya menejeri** workflow'i — faqat patch'lar email bilan emas, veb-sahifa orqali muhokama qilinadi.

> **Bu bobdagi misollar haqida.** Haqiqiy GitHub'ga hech narsa yuborilmagan. "GitHub'dagi" repo'lar o'rniga lokal bare repo'lar ishlatilgan (`blink.git` — asl loyiha, `fork.git` — fork; bare repo haqida [4-bob](04-repo-olish.md)). Shuning uchun chiqishlarda `https://github.com/...` o'rniga lokal yo'l ko'rinadi (qisqartirilgan: `.../35-github/fork.git`). Git buyruqlari va ularning xatti-harakati GitHub bilan bir xil. Veb-interfeys qadamlari GitHub rasmiy hujjatidan (docs.github.com, 2026-yil oktabr holati) olingan — Pro Git'dagi skrinshotlar eskirgan.

## Nega shunday: nega to'g'ridan-to'g'ri push emas, fork + PR?

**Muammo.** Ochiq loyihada minglab odam ishlashi mumkin. Har biriga push huquqi berish — xavfli: kimdir `main`ni buzib qo'yadi yoki `push --force` qiladi. Har birini "hamkor" (collaborator) qilib qo'shish ham amalda imkonsiz.

**Yechim.** Fork + PR modeli huquqlarni ajratadi:

- Har kim **o'qiy** oladi (ochiq repo) va fork qila oladi.
- Har kim faqat **o'z** fork'iga yoza oladi.
- Asl repo'ga faqat egasi (yoki yozish huquqi bor odam) **merge** qiladi — va buni o'zgarishni ko'rib, muhokama qilib, testlar o'tgandan keyin qiladi.

GitHub hujjati ikki modelni ajratadi:

| Model | Kimga | Qanday |
| --- | --- | --- |
| **Fork and pull** | Ochiq loyihalar, begona hissa qo'shuvchilar | Har kim fork qiladi, o'z fork'iga push qiladi, asl repo'ga PR ochadi |
| **Shared repository** | Kichik jamoa, kompaniya ichidagi yopiq loyiha | Hamma bitta repo'ga push qila oladi, lekin topic branch'larda ishlaydi va **o'sha repo ichida** PR ochadi |

Ikkinchi holatda ham PR kerak, chunki u **kod review** va muhokama joyi. Fork faqat push huquqi bo'lmaganda kerak.

> **"Fork" so'zi haqida.** Tarixan "fork" salbiy ma'noga ega edi: kimdir ochiq loyihani boshqa yo'nalishga olib ketib, raqobatchi loyiha yaratishi va jamoani ikkiga bo'lishi. GitHub'da esa fork — shunchaki o'sha loyihaning sizning nomingiz ostidagi nusxasi, hissa qo'shishning oddiy usuli.

## Kod: hisob ochish va sozlash

Pro Git bu qismni skrinshotlar bilan tushuntiradi, lekin interfeys o'shandan beri o'zgargan. Quyida — hozirgi GitHub hujjatidagi yo'llar.

### Hisob

`https://github.com` da ro'yxatdan o'ting: foydalanuvchi nomi, email, parol. GitHub email'ni tasdiqlashni so'raydi — buni albatta qiling, chunki commit'larni hisobingizga bog'lash email orqali ishlaydi (pastda). Deyarli hamma imkoniyat bepul hisobda bor; pullik rejalar qo'shimcha vositalar va kattaroq limitlar beradi.

Ochiq repo'ni **klonlash** uchun hisob ham kerak emas. Hisob fork qilish va unga push qilish uchun kerak.

### SSH kalit

HTTPS bilan ham ishlash mumkin, lekin SSH qulayroq. Kalit yaratish va `ssh-agent` — [30-bob](30-ssh-va-credential.md). GitHub'ga ochiq kalitni qo'shish:

1. O'ng yuqoridagi profil rasmi → **Settings**.
2. Chap menyuda **Access** bo'limi → **SSH and GPG keys**.
3. **New SSH key** tugmasi.
4. **Title** — kalitga tanib olsa bo'ladigan nom bering ("Ish noutbuki", "Uy kompyuteri"). Keyinchalik bitta qurilma yo'qolsa, qaysi kalitni o'chirishni shu nomdan bilasiz.
5. **Key type** — `Authentication Key` (repo'ga kirish uchun) yoki `Signing Key` (commit imzolash uchun, [44-bob](44-imzolash.md)). Bitta kalitni ikki maqsadda ishlatish uchun uni ikki marta qo'shasiz.
6. `~/.ssh/id_ed25519.pub` faylining **mazmunini** (`.pub` — ochiq qismi; maxfiy qismini hech qachon emas) joylashtirib, **Add SSH key**.

GitHub hujjati misollarda `ed25519` kalitini ishlatadi; DSA (`ssh-dss`) kalitlari 2022-yil martdan beri qabul qilinmaydi. Ulanishni tekshirish (GitHub hujjatidagi kutiladigan javob):

```bash
$ ssh -T git@github.com
Hi USERNAME! You've successfully authenticated, but GitHub does not
provide shell access.
```

Bu buyruq 1 kodi bilan tugaydi — bu normal: GitHub sizni tanidi, lekin shell bermaydi.

### Email manzillar: commit qanday qilib hisobingizga bog'lanadi

Commit ichida GitHub hisobi yo'q — faqat muallif nomi va email bor ([16-bob](16-commit-obyekti.md)):

```bash
$ git log --format='%h %an <%ae>' -4
dd73694 Bobur Karimov <bobur@example.com>
0a3d5bf Bobur Karimov <bobur@example.com>
6041429 Bobur Karimov <bobur@example.com>
f912fa3 Ali Valiyev <ali@example.com>
```

GitHub commit'ni hisobga **email orqali** bog'laydi: commit'dagi email qaysi hisobning email ro'yxatida bo'lsa, commit o'sha odamniki deb ko'rsatiladi. Shuning uchun:

- Bir nechta email bilan commit qilgan bo'lsangiz (ish va shaxsiy), hammasini **Settings → Emails** ga qo'shing.
- Tasdiqlanmagan email'ni asosiy (primary) qilib bo'lmaydi.

Email'ingizni oshkor qilmaslik uchun GitHub "no-reply" manzil beradi. **Keep my email addresses private** yoqilsa, veb-interfeysda qilingan commit'lar shu manzil bilan yoziladi. Format (2017-yil 18-iyuldan keyin ochilgan hisoblar uchun): `ID+USERNAME@users.noreply.github.com`. Buyruq qatoridagi commit'lar uchun uni o'zingiz sozlaysiz ([3-bob](03-birinchi-sozlash.md)):

```bash
$ git config --global user.email "12345678+ali@users.noreply.github.com"
```

(`12345678` — misol; o'z ID'ingizni Settings → Emails sahifasidan oling.) **Block command line pushes that expose my email** yoqilsa, shaxsiy email yozilgan commit'larni push qilishga GitHub ruxsat bermaydi.

### Ikki bosqichli autentifikatsiya (2FA)

Pro Git 2FA'ni "albatta yoqing" deydi. Hozir bu tavsiya emas, talab: 2023-yil martdan boshlab GitHub.com'da kod hissasini qo'shadigan hamma foydalanuvchilar bosqichma-bosqich 2FA yoqishga majbur qilina boshlagan. Usullar: TOTP ilovasi (vaqtga asoslangan bir martalik kod), SMS, xavfsizlik kalitlari (FIDO2, Touch ID, Windows Hello), passkey va GitHub Mobile. Zaxira usul va tiklash kodlarini saqlab qo'ying — GitHub hujjati ogohlantiradi: 2FA vositalari yo'qolsa, GitHub Support hisobga kirishni tiklab bera olmaydi.

## Kod: fork qilish va klonlash

Veb-interfeysda (GitHub hujjati bo'yicha):

1. Asl repo sahifasida o'ng yuqoridagi **Fork** tugmasi.
2. **Create a new fork** sahifasida **Owner** — kimning nomi ostida (siz yoki tashkilotingiz), kerak bo'lsa boshqa nom va tavsif.
3. **Copy the DEFAULT branch only** — belgilansa, faqat standart branch (odatda `main`) nusxalanadi. Hissa qo'shish uchun odatda shu yetarli.
4. **Create fork**.

`gh` (GitHub CLI) bilan xuddi shu ish (sintaksis `gh repo fork --help` dan):

```bash
gh repo fork muallif/blink                        # fork yaratish
gh repo fork muallif/blink --clone                # fork + klonlash
gh repo fork muallif/blink --default-branch-only  # faqat standart branch
gh repo fork muallif/blink --org mening-tashkilotim
```

`gh repo fork` mavjud lokal repo ichida ishlatilsa, yangi fork'ni `origin` qiladi va eski `origin`ni `upstream` deb qayta nomlaydi — ya'ni pastdagi remote sxemasini o'zi tuzadi.

Endi fork'ni klonlaymiz. Bizning simulyatsiyada `fork.git` — "github.com/ali/blink":

```bash
$ git clone ../fork.git blink
Cloning into 'blink'...
done.
$ cd blink
$ git remote -v
origin	.../35-github/fork.git (fetch)
origin	.../35-github/fork.git (push)
```

`origin` — **sizning fork'ingiz**, asl repo emas. Bu boshlovchilar eng ko'p chalkashadigan joy: `git push` fork'ga ketadi, asl loyihaga emas.

> **Ichkarida nima bor.** GitHub'da fork va asl repo **bitta obyekt tarmog'ini** baham ko'radi — fork qilish arzon, chunki obyektlar nusxalanmaydi. GitHub hujjati shu sababli ogohlantiradi: fork'dagi hamma narsa asl repo va boshqa fork'lar orqali ham ochiq bo'lishi mumkin. Fork'ka maxfiy narsa push qilmang.

## Kod: GitHub Flow — PR yaratish

Pro Git GitHub ishlash tartibini shunday ta'riflaydi (bu "GitHub Flow" deb ataladi):

1. Loyihani fork qiling.
2. `main`dan **topic branch** yarating ([31-bob](31-branch-workflowlari.md)).
3. Loyihani yaxshilaydigan commit'lar qiling.
4. Branch'ni GitHub'dagi fork'ingizga push qiling.
5. GitHub'da pull request oching.
6. Muhokama qiling, kerak bo'lsa yana commit qiling.
7. Loyiha egasi PR'ni merge qiladi yoki yopadi.
8. Yangilangan `main`ni fork'ingizga sinxronlang.

(Pro Git `master` deydi; bugungi GitHub'da standart branch `main`.)

Misol: Arduino uchun LED miltillatish dasturi juda tez miltillaydi, 1 soniya o'rniga 3 soniya qilmoqchimiz. Pro Git `git checkout -b` ishlatadi — hozirgi tavsiya `git switch -c` ([21-bob](21-branch-va-merge.md)):

```bash
$ git switch -c sekin-blink
Switched to a new branch 'sekin-blink'

$ sed -i '' 's/1000/3000/' blink.ino      # macOS; Linux'da: sed -i 's/1000/3000/' blink.ino

$ git diff --word-diff
diff --git a/blink.ino b/blink.ino
index 258d45b..909d76c 100644
--- a/blink.ino
+++ b/blink.ino
@@ -6,7 +6,7 @@ void setup() {

void loop() {
  digitalWrite(led, HIGH);   // LED yonadi
  [-delay(1000);-]{+delay(3000);+}               // bir soniya kutish
  digitalWrite(led, LOW);    // LED o'chadi
  [-delay(1000);-]{+delay(3000);+}               // bir soniya kutish
}

$ git commit -a -m "Kechikishni 3 soniyaga oshirish"
[sekin-blink 13a8ce7] Kechikishni 3 soniyaga oshirish
 1 file changed, 2 insertions(+), 2 deletions(-)

$ git push origin sekin-blink
To .../35-github/fork.git
 * [new branch]      sekin-blink -> sekin-blink
```

Branch nomi tavsifli bo'lsin (`sekin-blink`, `fix-login-timeout`) — u PR sahifasida ko'rinadi va nima haqida ekanini darhol aytadi.

### PR'ni veb-interfeysda ochish

Push'dan keyin GitHub branch'ni payqaydi. GitHub hujjati bo'yicha qadamlar:

1. **Asl** repo sahifasiga o'ting. Fayllar ro'yxati ustida sariq banner chiqadi — **Compare & pull request**.
2. Yangi PR sahifasida **compare across forks** havolasini bosing (agar fork'lar o'rtasida taqqoslash avtomatik tanlanmagan bo'lsa).
3. **base repository** / **base** — o'zgarish **qayerga** qo'shilsin: `muallif/blink`, `main`.
4. **head repository** / **compare** — o'zgarish **qayerdan**: `ali/blink`, `sekin-blink`.
5. Sarlavha va tavsif yozing.
6. **Allow edits from maintainers** (ixtiyoriy, foydalanuvchi fork'ida) — asl loyiha egalari sizning PR branch'ingizga to'g'ridan-to'g'ri commit qo'sha oladi (masalan, kichik tuzatish uchun sizni kutib o'tirmasdan). Fork'da GitHub Actions workflow'lari bo'lsa, bu belgi **Allow edits and access to secrets by maintainers** deb ataladi — bu sirlar (secrets) qiymatini va boshqa branch'larga kirishni ochib qo'yishi mumkin, ehtiyot bo'ling.
7. **Create pull request** — yoki tugma yonidagi ochiladigan menyudan **Create draft pull request**.

Sahifa pastida PR'ga kiradigan commit'lar ro'yxati va **birlashgan diff** ko'rinadi. Ularni lokal ravishda ham olsa bo'ladi — GitHub aynan shuni hisoblaydi:

```bash
$ git log --oneline main..sekin-blink
13a8ce7 Kechikishni 3 soniyaga oshirish
$ git diff --stat main...sekin-blink
 blink.ino | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
```

Ikki nuqta (`main..sekin-blink`) — "sekin-blink'da bor, main'da yo'q commit'lar"; uch nuqtali `diff` (`main...sekin-blink`) — umumiy ajdod (merge base)dan `sekin-blink`gacha bo'lgan farq ([19-bob](19-revision-tanlash.md), [33-bob](33-hissa-qoshish.md)). **Files changed** yorlig'idagi diff — xuddi shu uch nuqtali diff: asl `main`da sizdan keyin nima o'zgargani u yerda ko'rinmaydi, faqat **siz kiritayotgan** o'zgarish.

### `gh` bilan PR ochish

Sintaksis (`gh pr create --help`):

```bash
gh pr create --base main --title "Kechikishni 3 soniyaga oshirish" --body "Fixes #12"
gh pr create --fill                      # sarlavha va tavsifni commit'lardan olish
gh pr create --draft                     # draft PR
gh pr create --reviewer bobur            # review so'rash
gh pr create --base main --head ali:sekin-blink   # boshqa egasining branch'idan
gh pr create --no-maintainer-edit        # "Allow edits from maintainers"ni o'chirish
gh pr create --web                       # brauzerda ochish
gh pr create --dry-run                   # PR yaratmasdan nima bo'lishini ko'rsatish
```

`--help` ogohlantiradi: `--dry-run` PR yaratmaydi, lekin branch'ni push qilishi mumkin. Joriy branch push qilinmagan bo'lsa, `gh` qayerga push qilishni so'raydi va fork yaratishni taklif qiladi.

### Draft PR

PR'ni ish tugashidan **oldin** ochish ham odatiy. Pro Git aytganidek, PR ochilgandan keyin ham branch'ga push qilishda davom etish mumkin, shuning uchun ko'p jamoalar PR'ni boshida ochib, ishni shu muhokama ichida olib boradi. **Draft** (qoralama) PR buni rasmiy qiladi: GitHub hujjatiga ko'ra draft PR'ni merge qilib bo'lmaydi va `CODEOWNERS` ([36-bob](36-github-boshqaruv.md)) avtomatik review'ga chaqirilmaydi. Tayyor bo'lgach — **Ready for review**.

## Kod: PR ichida ishlash — review va iteratsiya

PR sahifasining yorliqlari (GitHub hujjati):

| Yorliq | Nima bor |
| --- | --- |
| **Conversation** | Tavsif, voqealar tarixi (timeline), umumiy izohlar, review'lar |
| **Commits** | Branch vaqt o'tishi bilan qanday o'zgargani |
| **Checks** | Avtomatik testlar, build, tekshiruvlar (CI) |
| **Files changed** | Diff — taklif qilingan o'zgarishlar |

Pastda **merge holati** ko'rsatkichi: nima to'sib turibdi (konflikt, yetmagan tasdiq, o'tmagan test).

### Review qilish (GitHub hujjati bo'yicha)

Ko'rib chiquvchi (reviewer) uchun:

1. **Files changed** yorlig'i. Diff'ni unified yoki split (yonma-yon) ko'rinishga tishli belgi orqali almashtirish mumkin.
2. **Bitta qatorga izoh** — qator ustiga sichqonchani olib boring, ko'k `+` belgisini bosing.
3. **Bir nechta qatorga izoh** — birinchi qator raqamini bosing, so'ng oxirgisigacha torting (yoki Shift bilan oxirgi qator raqamini bosing).
4. **Taklif (suggestion)** — izoh yozish oynasidagi suggestion tugmasi; ichiga to'g'rilangan kodni yozasiz, muallif uni bitta tugma bilan commit qila oladi.
5. Fayl tugagach — fayl sarlavhasidagi **Viewed** belgisi (fayl yig'iladi, progress ko'rsatiladi).
6. **Review changes** → umumiy izoh → tur tanlash → **Submit review**:
   - **Comment** — umumiy fikr, tasdiq ham, rad ham emas;
   - **Approve** — o'zgarishni tasdiqlash, merge qilishga rozilik;
   - **Request changes** — tuzatish kerak.

Muhim tafsilot: review davomida yozilgan izohlar **pending** (kutilayotgan) holatda — **Submit review** bosilmaguncha ularni faqat siz ko'rasiz. Va **Request changes** o'z-o'zidan merge'ni to'smaydi, faqat himoyalangan branch qoidalari ([36-bob](36-github-boshqaruv.md)) shuni talab qilsa to'sadi.

`gh` bilan (sintaksis `gh pr review --help`):

```bash
gh pr review 1 --approve
gh pr review 1 --comment -b "Yaxshi, bitta savol bor"
gh pr review 1 --request-changes -b "LED o'chiq turishi uzunroq bo'lsin"
```

### Muallif tuzatish kiritadi

Pro Git misolida egasi shunday deydi: "Fikr yaxshi, lekin LED o'chiq turishi yonib turishidan uzunroq bo'lsin." Email workflow'ida ([33-bob](33-hissa-qoshish.md)) siz patch seriyasini qayta tayyorlab, qayta yuborardingiz. GitHub'da — **o'sha branch'ga yangi commit qilib push qilasiz**, PR o'zi yangilanadi:

```bash
$ git commit -a -m "LED o'chiq turishini 4 soniya qilish"
[sekin-blink bd9ee34] LED o'chiq turishini 4 soniya qilish
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git push origin sekin-blink
To .../35-github/fork.git
   13a8ce7..bd9ee34  sekin-blink -> sekin-blink
```

Nega bu ishlaydi? PR — bu "branch'ning **hozirgi** holati" haqidagi taklif, aniq commit'lar ro'yxati emas. Branch ref'i siljisa ([20-bob](20-branch-bu-ref.md)), PR ham siljiydi. Keyin o'zgargan qatorga yozilgan eski izoh "outdated" deb yig'ilib qoladi.

Pro Git'dagi bir kuzatish: PR'ga commit qo'shish bildirishnoma yubormaydi, shuning uchun tuzatishdan keyin "so'ragan o'zgarishni kiritdim" deb izoh qoldirish odob hisoblanadi.

### PR — patch navbati emas, suhbat

Pro Git muhim farqni ta'kidlaydi: email-ga asoslangan loyihalar patch seriyasini "toza, ketma-ket qo'llanadigan patch'lar navbati" deb biladi. Ko'p GitHub loyihalari esa PR branch'ini **o'zgarish atrofidagi suhbat** deb biladi: kod mukammal bo'lishidan oldin taklif qilinadi, tuzatishlar ustiga yangi commit bo'lib qo'shiladi va oxirida birlashgan diff merge qilinadi. Natijada kelajakda PR'ga qaraganda qaror qanday qabul qilinganining butun konteksti saqlanadi.

## Kod: PR eskirganda — upstream bilan yangilash

Siz ishlayotganda asl loyiha ham joyida turmaydi. Agar asl `main`dagi o'zgarish sizning PR'ingiz bilan to'qnashsa, GitHub PR pastida "merge qilib bo'lmaydi, konflikt bor" deb ko'rsatadi. Egasi qo'shimcha ish qilmasligi uchun buni **siz** tuzatishingiz kerak.

Ikki yo'l bor: branch'ni asl `main` ustiga **rebase** qilish yoki asl `main`ni branch'ingizga **merge** qilish. Pro Git ikkinchisini tavsiya qiladi: tarix va oxirgi merge muhim, rebase esa biroz tozaroq tarix evaziga ancha qiyin va xatoga moyil.

Avval asl repo'ni ikkinchi remote sifatida qo'shamiz. An'anaga ko'ra uning nomi `upstream`:

```bash
$ git remote add upstream ../blink.git       # GitHub'da: https://github.com/muallif/blink.git
$ git fetch upstream
From ../blink
 * [new branch]      main       -> upstream/main
$ git merge upstream/main
Auto-merging blink.ino
CONFLICT (content): Merge conflict in blink.ino
Automatic merge failed; fix conflicts and then commit the result.
```

Asl muallif shu orada kechikishni `DELAY_MS` konstantasiga chiqargan ekan — ikkalamiz bir xil qatorlarni o'zgartirganmiz:

```bash
$ git diff
diff --cc blink.ino
index 895f24e,7be5562..0000000
--- a/blink.ino
+++ b/blink.ino
@@@ -6,7 -7,7 +7,13 @@@ void setup() 
  
  void loop() {
    digitalWrite(led, HIGH);   // LED yonadi
++<<<<<<< HEAD
 +  delay(3000);               // bir soniya kutish
 +  digitalWrite(led, LOW);    // LED o'chadi
 +  delay(4000);               // bir soniya kutish
++=======
+   delay(DELAY_MS);           // kutish
+   digitalWrite(led, LOW);    // LED o'chadi
+   delay(DELAY_MS);           // kutish
++>>>>>>> upstream/main
  }
```

Konfliktni ikkala niyatni saqlab hal qilamiz (konfliktlar haqida to'liq — [22-bob](22-konfliktlar.md)): konstantalar g'oyasini olamiz, lekin bizning qiymatlar bilan — `ON_MS = 3000`, `OFF_MS = 4000`. Keyin:

```bash
$ git add blink.ino
$ git commit --no-edit
[sekin-blink f912fa3] Merge remote-tracking branch 'upstream/main' into sekin-blink
$ git push origin sekin-blink
To .../35-github/fork.git
   bd9ee34..f912fa3  sekin-blink -> sekin-blink
```

Tarix endi shunday:

```bash
$ git log --oneline --graph --all
*   f912fa3 Merge remote-tracking branch 'upstream/main' into sekin-blink
|\  
| * 32a9d8e Kechikishni konstantaga chiqarish
* | bd9ee34 LED o'chiq turishini 4 soniya qilish
* | 13a8ce7 Kechikishni 3 soniyaga oshirish
|/  
* b9efdb1 Blink dasturi
```

Push'dan keyin PR o'zi qayta tekshiriladi va "toza merge qilinadi" holatiga o'tadi. **Files changed** endi yangi merge base'ga nisbatan hisoblanadi:

```bash
$ git diff upstream/main...sekin-blink
diff --git a/blink.ino b/blink.ino
index 7be5562..2b9cd81 100644
--- a/blink.ino
+++ b/blink.ino
@@ -1,5 +1,6 @@
 int led = 13;
-const int DELAY_MS = 1000;
+const int ON_MS = 3000;
+const int OFF_MS = 4000;
 
 void setup() {
   pinMode(led, OUTPUT);
@@ -7,7 +8,7 @@ void setup() {
 
 void loop() {
   digitalWrite(led, HIGH);   // LED yonadi
-  delay(DELAY_MS);           // kutish
+  delay(ON_MS);              // yonib turadi
   digitalWrite(led, LOW);    // LED o'chadi
-  delay(DELAY_MS);           // kutish
+  delay(OFF_MS);             // o'chiq turadi
 }
```

Merge yo'lining afzalligi: uzoq yashaydigan branch'ga upstream'ni qayta-qayta merge qilsangiz, har safar faqat **oxirgi merge'dan beri** paydo bo'lgan konfliktlarni hal qilasiz.

**Veb-interfeysdagi yo'l.** Konflikt bo'lmasa, PR sahifasining merge qismida **Update branch** tugmasi bor (GitHub hujjati): oddiy holatda u asl branch'ni sizning branch'ingizga merge commit bilan qo'shadi, ochiladigan menyudagi **Update with rebase** esa rebase qiladi. PR branch'i himoyalangan bo'lsa, bu tugma ishlamasligi mumkin.

### Rebase yo'li va `--force-with-lease`

Ba'zi loyihalar chiziqli tarix talab qiladi va "rebase qiling" deydi. Unda push rad etiladi, chunki rebase commit'larni **yangi hash bilan qayta yaratadi** ([24-bob](24-rebase.md)) va eski branch uchi yangisining ajdodi emas:

```bash
$ git fetch upstream
From ../blink
   0a3d5bf..dd73694  main       -> upstream/main
$ git rebase upstream/main
Successfully rebased and updated refs/heads/led-pin.
$ git push origin led-pin
To .../35-github/fork.git
 ! [rejected]        led-pin -> led-pin (non-fast-forward)
error: failed to push some refs to '.../35-github/fork.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
$ git push --force-with-lease origin led-pin
To .../35-github/fork.git
 + 74df555...690fc23 led-pin -> led-pin (forced update)
```

Bu yerda **`git pull` qilmang** — hint shuni maslahat bersa ham. `pull` eski (rebase'dan oldingi) commit'larni qayta merge qilib, har commit'ning ikki nusxasini yaratadi. To'g'ri yo'l — `--force-with-lease` ([29-bob](29-fetch-push-ichidan.md)): u remote branch siz oxirgi ko'rgan joyda turgan bo'lsagina ustiga yozadi, ya'ni maintainer "Allow edits from maintainers" orqali qo'shgan commit'ni bilmasdan o'chirib yubormaysiz.

> **Ogohlantirish.** Pro Git ochiq PR branch'iga force push qilmaslikni qattiq tavsiya qiladi: boshqalar uni tortib olib, ustida ishlagan bo'lsa, [24-bob](24-rebase.md)dagi "rebase xavfi" muammolari boshlanadi. Pro Git taklifi: rebase qilingan branch'ni **yangi** nom bilan push qilib, yangi PR oching, eskisini unga havola bilan yoping. Amalda ko'p loyihalar o'z PR'ingizga force push qilishni normal deb biladi — loyihaning `CONTRIBUTING.md` faylidagi qoidaga qarang.

## Kod: maintainer tomoni — PR'ni lokal olish va merge

GitHub har PR uchun **asl** repo'da yashirin ref yaratadi: `refs/pull/<raqam>/head` (PR branch'ining uchi). Simulyatsiyada uni qo'lda yaratdik; GitHub'da u avtomatik paydo bo'ladi:

```bash
$ git ls-remote origin
32a9d8e8aff550842949b0bc895e17911261f369	HEAD
32a9d8e8aff550842949b0bc895e17911261f369	refs/heads/main
f912fa3f572f9833bfce5e9fafff6933ec7017ea	refs/pull/1/head
```

Uni lokal branch qilib olish (GitHub hujjatidagi `git fetch origin pull/ID/head:BRANCH_NAME` buyrug'i):

```bash
$ git fetch origin pull/1/head:pr-1
From .../35-github/blink
 * [new ref]         refs/pull/1/head -> pr-1
$ git switch pr-1
Switched to branch 'pr-1'
```

Endi PR kodini lokal ishga tushirib, sinab ko'rish mumkin. `gh` bilan bu bitta buyruq: `gh pr checkout 1` (raqam, URL yoki branch nomi). `refs/pull/` faqat o'qish uchun — GitHub hujjatiga ko'ra unga push qilish `deny updating a hidden ref` xatosi bilan rad etiladi. Bu ref'larni hammasini avtomatik olish uchun refspec sozlash — [36-bob](36-github-boshqaruv.md).

Pro Git'ga ko'ra GitHub'dagi **Merge** tugmasi har doim **non-fast-forward** merge qiladi — fast-forward mumkin bo'lsa ham merge commit yaratadi (GitHub hujjati: `--no-ff`). Lokal ekvivalenti:

```bash
$ git merge --no-ff -m "Merge pull request #1 from ali/sekin-blink" pr-1
Merge made by the 'ort' strategy.
 blink.ino | 7 ++++---
 1 file changed, 4 insertions(+), 3 deletions(-)
$ git push origin main
To .../35-github/blink.git
   32a9d8e..6041429  main -> main
```

Merge commit xabarida PR raqami bor — keyinchalik "nega bu o'zgarish kiritilgan?" degan savolga javob izlaganda, xabardan PR muhokamasiga qaytish mumkin. Branch'ni lokal merge qilib push qilsangiz ham, GitHub PR'ni avtomatik "merged" deb yopadi.

GitHub'da merge'ning uch usuli bor (GitHub hujjati; qaysi biri yoqilgani repo sozlamasiga bog'liq):

| Usul | Nima bo'ladi | Qachon mos |
| --- | --- | --- |
| **Create a merge commit** | `--no-ff`: hamma commit'lar saqlanadi + merge commit | Har commit alohida qiymatga ega bo'lsa |
| **Squash and merge** | Hamma commit'lar bitta commit'ga siqiladi; xabarni GitHub PR sarlavhasi/tavsifi/commit'lardan taklif qiladi | Qisqa umrli, bitta mantiqiy o'zgarish |
| **Rebase and merge** | Commit'lar asos branch ustiga qayta qo'yiladi, merge commit yo'q; **har doim yangi SHA va yangi committer** | Chiziqli tarix, commit'lar allaqachon tartibli bo'lsa |

Oxirgi usulning nozik joyi: GitHub hujjatiga ko'ra u oddiy `git rebase`dan farqli ravishda committer ma'lumotini **har doim** yangilaydi va bo'sh commit'larni tashlab yuboradi. Demak "Rebase and merge"dan keyin lokal branch'ingizdagi commit hash'lari `main`dagilariga to'g'ri kelmaydi — `git branch -d` "to'liq merge qilinmagan" deyishi mumkin ([23-bob](23-branch-boshqaruvi.md)).

**Fork shart emas.** Pro Git eslatadi: bitta repo ichidagi ikki branch o'rtasida ham PR ochish mumkin. Hamkorlar ("shared repository" modeli) topic branch'ni push qilib, shu repo'ning `main`iga PR ochadi — faqat review va muhokama uchun.

## Kod: fork'ni sinxron saqlash

PR merge bo'ldi. Lekin sizning fork'ingiz o'zi **yangilanmaydi** — GitHub faqat "This branch is N commits behind" deb xabar beradi. Diqqat qiling, lokal `git status` ham hech narsa demaydi:

```bash
$ git switch main
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
$ git fetch upstream
From ../blink
   32a9d8e..6041429  main       -> upstream/main
$ git status -sb
## main...origin/main
$ git rev-list --left-right --count main...upstream/main
0	5
```

"Up to date" — **fork'ga** nisbatan, chunki `main` `origin/main`ni kuzatadi ([28-bob](28-remote-branchlar.md)). Asl repo'dan 5 commit orqada ekanimizni faqat `upstream/main` bilan solishtirganda ko'ramiz. Sinxronlash:

```bash
$ git merge --ff-only upstream/main
Updating b9efdb1..6041429
Fast-forward
 blink.ino | 6 ++++--
 1 file changed, 4 insertions(+), 2 deletions(-)
$ git push origin main
To .../35-github/fork.git
   b9efdb1..6041429  main -> main
```

`--ff-only` — kafolat: agar fork'ingizdagi `main`ga tasodifan commit qilgan bo'lsangiz, merge commit yaratish o'rniga xato beradi va buni darhol bilasiz. Keyin keraksiz topic branch'ni tozalaymiz:

```bash
$ git branch -d sekin-blink
Deleted branch sekin-blink (was f912fa3).
$ git push origin --delete sekin-blink
To .../35-github/fork.git
 - [deleted]         sekin-blink
```

**Boshqa yo'llar.**

- Veb-interfeys (GitHub hujjati): fork sahifasida fayllar ro'yxati ustidagi **Sync fork** → **Update branch**. Konflikt bo'lsa, GitHub uni hal qilish uchun PR yaratishni taklif qiladi.
- `gh repo sync owner/fork -b main` — `--help`ga ko'ra fast-forward bilan yangilaydi; konflikt bo'lsa ishlamaydi, `--force` esa maqsad branch'ni **hard reset** qiladi (fork'dagi commit'laringiz yo'qoladi).
- Bir martalik, sozlamasiz (Pro Git): URL'ni to'g'ridan-to'g'ri ko'rsatish:

```bash
$ git pull ../blink.git main          # GitHub'da: git pull https://github.com/muallif/blink.git main
From ../blink
 * branch            main       -> FETCH_HEAD
Updating 0a3d5bf..dd73694
Fast-forward
 README.md | 2 ++
 1 file changed, 2 insertions(+)
$ git push origin main
```

### Sozlama bilan avtomatlashtirish: `pull` upstream'dan, `push` fork'ka

Har safar remote nomini yozmaslik uchun Pro Git quyidagi sozlamani taklif qiladi:

```bash
$ git branch --set-upstream-to=upstream/main main
branch 'main' set up to track 'upstream/main'.
$ git config --local remote.pushDefault origin
$ git config --get-regexp "^(branch\.main|remote\.pushdefault)"
branch.main.remote upstream
branch.main.merge refs/heads/main
remote.pushdefault origin
```

Endi `main`da `git pull` asl repo'dan oladi, `git push` esa fork'ka yuboradi:

```bash
$ git pull
From ../blink
   6041429..0a3d5bf  main       -> upstream/main
Updating 6041429..0a3d5bf
Fast-forward
 README.md | 3 +++
 1 file changed, 3 insertions(+)
 create mode 100644 README.md
$ git push
To .../35-github/fork.git
   6041429..0a3d5bf  main -> main
$ git status -sb
## main...upstream/main
```

Ichkarida: `branch.main.remote` va `branch.main.merge` — `pull` qayerdan olishini, `remote.pushDefault` — remote ko'rsatilmagan `push` qayerga ketishini belgilaydi (`.git/config`da yoziladi, [45-bob](45-config-chuqur.md)).

**Xavf.** Pro Git ogohlantiradi: bu sozlamada Git sizni to'xtatmaydi — `main`ga commit qilsangiz, `pull` va `push` jimgina ishlayveradi va commit'ingiz fork'ingiz `main`iga tushadi. Shuning uchun **`main`ga hech qachon to'g'ridan-to'g'ri commit qilmang** — u amalda asl loyihaga tegishli.

## Kod: havolalar va GitHub Flavored Markdown

PR tavsifi, izohlar, issue'lar — hammasi **GitHub Flavored Markdown** (GFM)da yoziladi.

### Havolalar

PR va issue'lar repo ichida **umumiy raqamlanadi**: #3 PR ham, #3 issue ham bo'lishi mumkin emas.

| Yozuv | Nimaga havola |
| --- | --- |
| `#12` | Shu repo'dagi 12-issue yoki PR |
| `ali#12` | `ali` fork'idagi 12-issue/PR |
| `muallif/boshqa-repo#12` | Boshqa repo'dagi 12-issue/PR |
| `@bobur` | Foydalanuvchini eslatish (bildirishnoma ketadi) |
| To'liq 40 belgilik SHA | Commit'ga havola (fork/boshqa repo uchun ham xuddi shu prefikslar) |

Havola qilingan PR'ning timeline'ida "qayerda tilga olingani" avtomatik paydo bo'ladi. Pro Git'dagi stsenariy: rebase qilingan branch bilan yangi PR ochib, tavsifda eski PR'ni (`#1`) eslatsangiz, eskisini yopgan odam uning timeline'idan yangisiga o'ta oladi.

**Issue'ni avtomatik yopish.** PR tavsifida kalit so'z + raqam yozilsa, PR merge bo'lganda issue yopiladi. Kalit so'zlar (GitHub hujjati): `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves`, `resolved`.

```text
Fixes #12
Closes: #10
Resolves #10, resolves #123
Fixes muallif/boshqa-repo#100
```

Ikki shart: bu faqat PR repo'ning **standart branch'iga** yo'naltirilgan bo'lsa ishlaydi (boshqa branch'ga PR'da kalit so'zlar e'tiborsiz qoladi), va bitta PR'ga ko'pi bilan 10 ta issue bog'lanadi.

### Markdown imkoniyatlari

````markdown
- [x] Kodni yozish
- [ ] Testlar yozish
- [ ] Hujjatlash

```c
delay(ON_MS);
```

> Bu iqtibos: javob berilayotgan izohdan parcha

> [!WARNING]
> Bu o'zgarish konfiguratsiya formatini buzadi.

Izoh bilan matn[^1].

[^1]: Izoh matni.

:+1: :shipit:
````

- **Vazifalar ro'yxati** (`- [ ]`, `- [x]`) — PR'da "merge'dan oldin nima qilish kerak" ro'yxati. Katakchani sahifada to'g'ridan-to'g'ri bosish mumkin, Markdown'ni tahrirlash shart emas; PR'lar ro'yxatida progress ko'rinadi.
- **Kod bloki** — uchta backtick + til nomi bo'lsa, sintaksis ranglanadi.
- **Iqtibos** — `>`. Izohdagi matnni belgilab `r` tugmasini bossangiz, GitHub uni javob oynasiga iqtibos qilib qo'yadi.
- **Ogohlantirish bloklari** (alerts) — `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`. Pro Git'da yo'q, keyinroq qo'shilgan.
- **Izohlar** (footnotes) — `[^1]`.
- **Emoji** — `:nomi:`; `:` yozsangiz avtomatik to'ldirish chiqadi.
- **Rasmlar** — matn maydoniga sudrab tashlash, tanlash yoki joylashtirish (paste) bilan yuklanadi.

## Muhandislik nuqtai nazari: yaxshi PR nimadan iborat

Pro Git ta'kidlaydi: tavsifga kuch sarflash deyarli har doim o'zini oqlaydi — u egaga nima qilmoqchi bo'lganingizni, o'zgarish to'g'riligini va loyihani yaxshilashini tushunishga yordam beradi. Amaliy qoidalar:

- **Bitta PR — bitta mavzu.** Kichik PR tez ko'rib chiqiladi. Refaktoring va yangi xususiyatni alohida PR qiling ([10-bob](10-yaxshi-commit.md)dagi atomar commit g'oyasining PR darajasidagi davomi).
- **Tavsifda "nega".** Diff "nima"ni ko'rsatadi; tavsif muammoni, tanlangan yechimni va qanday sinalganini aytsin. Bog'liq issue'ni `Fixes #N` bilan bog'lang.
- **Avval loyiha qoidalarini o'qing.** `CONTRIBUTING.md`, PR shabloni, kod uslubi, commit xabari formati. Katta o'zgarishdan oldin issue ochib, fikr so'rang — rad etiladigan ishga vaqt sarflamaysiz.
- **Topic branch, `main` emas.** Fork'ingizdagi `main`dan PR ochsangiz, keyingi ish uchun toza `main` qolmaydi va ikki PR aralashadi.
- **Draft bilan erta oching.** Yo'nalish bo'yicha fikrni boshida olish — oxirida "hammasini qayta yozing" eshitishdan arzon.
- **Review'ga javob — commit bilan.** Tuzatishni yangi commit qilib push qiling; reviewer nima o'zgarganini faqat yangi commit'larga qarab ko'radi. Tarixni tozalash kerak bo'lsa, oxirida squash qilinadi (yoki "Squash and merge").

## Muhandislik nuqtai nazari: ichkarida nima bor

GitHub interfeysi ortida oddiy Git tushunchalari turadi:

| GitHub'da | Git'da |
| --- | --- |
| Fork | Server tomonidagi `clone --bare` (obyektlar tarmoq ichida baham ko'riladi) |
| PR "commits" ro'yxati | `git log base..head` |
| **Files changed** | `git diff base...head` (merge base'dan) |
| PR branch'i | Fork'dagi oddiy `refs/heads/<branch>` |
| PR raqami | Asl repo'dagi `refs/pull/<N>/head` (faqat o'qish uchun) |
| **Merge** tugmasi | `git merge --no-ff` serverda |
| **Sync fork** | `fetch upstream` + fast-forward + `push origin` |

Shu jadvalni bilsangiz, interfeys o'zgarsa ham (Pro Git skrinshotlari bilan bo'lgani kabi) nima bo'layotganini tushunasiz.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Fork'dagi `main`da ishlab, `main`dan PR ochish | Keyingi PR'lar aralashadi, sinxronlash konflikt beradi | Har vazifa uchun `git switch -c <topic>`; `main` faqat upstream'ni aks ettiradi |
| `origin` asl repo deb o'ylash | `git push origin` fork'ga ketadi; `upstream` qo'shilmasa yangiliklar kelmaydi | `git remote -v`; `upstream`ni qo'shing |
| `git status` "up to date" desa, fork yangi deb o'ylash | Status faqat kuzatiladigan branch (`origin/main`) bilan solishtiradi | `git fetch upstream` + `rev-list --count main...upstream/main` |
| Rebase'dan keyin rad etilgan push'ga `git pull` qilish | Eski va yangi commit'lar ikki nusxada aralashadi | `git push --force-with-lease` |
| Ochiq, boshqalar ishlatayotgan PR branch'iga `--force` | Boshqalarning ishi va maintainer commit'lari yo'qoladi | `--force-with-lease`, yoki yangi branch + yangi PR |
| `Fixes #12`ni `dev`ga PR'da yozib, issue yopiladi deb kutish | Kalit so'zlar faqat standart branch'ga PR'da ishlaydi | Issue'ni qo'lda yoping yoki qo'lda bog'lang |
| Commit email'i GitHub hisobida yo'q | Commit'lar hisobingizga bog'lanmaydi | Email'ni Settings → Emails ga qo'shing yoki no-reply manzilni sozlang |
| Fork'ka parol, token, `.env` push qilish | Fork ochiq va asl repo tarmog'i orqali ko'rinadi | Sirlarni hech qachon commit qilmang; tushib qolsa — darhol bekor qiling ([42-bob](42-reflog-va-tiklash.md)) |
| Actions bor fork'da "Allow edits and access to secrets" ni o'ylamasdan belgilash | Maintainer'lar sirlaringizga kira oladi | Nima berayotganingizni tushunib belgilang |
| `gh repo sync --force` | Fork branch'i hard reset qilinadi, sizning commit'laringiz ketadi | Avval konfliktni lokal hal qiling |

## Amaliyot

1. Bitta lokal bare repo yarating ("asl loyiha") va undan `git clone --bare` bilan "fork" yasang. Fork'ni klonlab, `git remote -v`da `origin` qayerga qarashini tekshiring, keyin `upstream`ni qo'shing.
2. Topic branch'da bitta o'zgarish qiling va fork'ka push qiling. `git log main..<branch>` va `git diff main...<branch>` bilan "PR sahifasi"da nima ko'rinishini oldindan ayting.
3. Asl repo'ga siz bilan bir xil qatorni o'zgartiradigan commit qo'shing. `git fetch upstream` + `git merge upstream/main` bilan konfliktni hal qiling va qayta push qiling.
4. Asl repo'da `git fetch <fork> <branch>:refs/pull/1/head` qilib PR ref'ini yarating, so'ng maintainer klonida `git fetch origin pull/1/head:pr-1` bilan oling va `merge --no-ff` qiling.
5. Fork'ingizning `main`i upstream'dan necha commit orqada ekanini `git status` va `git rev-list --left-right --count` bilan solishtiring — nega ular turlicha javob beradi?
6. `branch --set-upstream-to=upstream/main` va `remote.pushDefault origin` sozlang. `main`ga ataylab commit qilib, `git pull` va `git push` nima qilishini kuzating — nega bu xavfli?
7. Ikkinchi topic branch'ni rebase qiling va oddiy `push` rad etilishini ko'ring. Keyin boshqa klondan shu branch'ga commit qo'shib, `--force-with-lease` endi ham rad etishini tekshiring.
8. (Qiyinroq) GitHub'dagi o'zingizga tegishli test repo'da (yoki `gh pr create --dry-run` bilan) PR tavsifini yozing: vazifalar ro'yxati, `Fixes #N`, `> [!NOTE]` bloki va kod bloki bilan. "Squash and merge" va "Rebase and merge"dan keyin lokal `git branch -d` qanday javob berishini solishtiring va sababini tushuntiring.

## Rasmiy hujjat

- Pro Git — Account Setup and Configuration: <https://git-scm.com/book/en/v2/GitHub-Account-Setup-and-Configuration>
- Pro Git — Contributing to a Project: <https://git-scm.com/book/en/v2/GitHub-Contributing-to-a-Project>
- GitHub — About pull requests: <https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests>
- GitHub — Creating a pull request from a fork: <https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork>
- GitHub — Reviewing proposed changes: <https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/reviewing-proposed-changes-in-a-pull-request>
- GitHub — Syncing a fork: <https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork>
- GitHub — About merge methods: <https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges>
- GitHub — Linking a pull request to an issue: <https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue>
- GitHub — Basic writing and formatting syntax: <https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax>
- GitHub CLI: <https://cli.github.com/manual/gh_pr_create>
- `git remote`: <https://git-scm.com/docs/git-remote>
- `git push` (`--force-with-lease`): <https://git-scm.com/docs/git-push>
