// Tayyor mashqlar: har biri VM ichida haqiqiy repo yasaydi (setup — bash, yordamchilar
// trenajor/overlay/usr/local/lib/trenajor/mashq.sh da), so'ng qadamma-qadam yo'l ko'rsatadi.
// Har qadam `check(holat, buyruq)` bajarilganini repo holatidan (yoki yozilgan buyruqdan) aniqlaydi.
// Hammasi trenajor/test/mashqlar.mjs da haqiqiy VM'da tekshiriladi.

const branch = (h, name) => h?.refs?.find((r) => r.name === 'refs/heads/' + name)?.hash ?? null
const onBranch = (h, name) => h?.head?.ref === 'refs/heads/' + name
const headHash = (h) => (h?.head?.ref ? branch(h, h.head.ref.slice(11)) : h?.head?.detached) ?? null
const commit = (h, hash) => h?.commits?.find((c) => c.hash === hash) ?? null
const headCommit = (h) => commit(h, headHash(h))
const clean = (h) => h?.repo && h.status.length === 0
const staged = (h, path) => h?.status?.some((s) => s.path === path && s.x !== ' ' && s.x !== '?')
const unmerged = (h) => h?.status?.some((s) => s.x === 'U' || s.y === 'U' || (s.x === 'A' && s.y === 'A'))
const ran = (re) => (_h, cmd) => re.test(cmd ?? '')

function isAncestor(h, a, b) {
  const byHash = new Map(h.commits.map((c) => [c.hash, c]))
  const stack = [b], seen = new Set()
  while (stack.length) {
    const x = stack.pop()
    if (x === a) return true
    if (seen.has(x)) continue
    seen.add(x)
    byHash.get(x)?.parents.forEach((p) => stack.push(p))
  }
  return false
}

export const MASHQLAR = [
  {
    id: 'uch-hudud',
    title: 'Uch hudud: add va commit',
    bob: '/git/05-uch-holat',
    intro: 'Repo’da bitta commit bor. README.md o‘zgartirilgan, yangi.txt esa endi yaratilgan. Ularni ishchi papkadan index orqali commit’gacha olib boring va «Uch quti» panelini kuzating.',
    setup: `
      c "README yaratildi" README.md "# Loyiha"
      echo "Ikkinchi qator" >> README.md
      echo "yangi fayl" > yangi.txt`,
    steps: [
      {
        cmd: 'git status -s',
        text: 'Avval holatni ko‘ring.',
        check: ran(/^git status/),
        natija: '` M` — fayl ishchi papkada o‘zgargan, lekin index’ga olinmagan. `??` — git hali kuzatmaydigan yangi fayl.',
      },
      {
        cmd: 'git add README.md',
        text: 'README.md ni index’ga oling.',
        check: (h) => staged(h, 'README.md'),
        natija: 'Fayl «Index» qutisiga o‘tdi. .git/objects da yangi blob paydo bo‘ldi: git fayl mazmunini commit paytida emas, add paytida saqlaydi.',
      },
      {
        cmd: 'git add yangi.txt',
        text: 'Yangi faylni ham qo‘shing.',
        check: (h) => staged(h, 'yangi.txt'),
        natija: 'Endi ikkala o‘zgarish index’da — keyingi commit aynan shu holatdan yasaladi.',
      },
      {
        cmd: 'git commit -m "Ikkinchi commit"',
        text: 'Commit qiling.',
        check: (h) => clean(h) && h.commits.length >= 2,
        natija: 'Index’dan tree, undan commit yasaldi va main yangi commit’ga siljidi. Uch quti yana bir xil, ishchi papka toza.',
      },
    ],
  },
  {
    id: 'amend',
    title: 'Oxirgi commit’ni tuzatish (--amend)',
    bob: '/git/11-bekor-qilish',
    intro: 'Oxirgi commit xabarida xato bor: «xatoli xabr». Uni tuzating va grafda nima bo‘lishini kuzating.',
    setup: `
      c "Birinchi commit"
      c "xatoli xabr"`,
    steps: [
      {
        cmd: 'git commit --amend -m "Ikkinchi commit"',
        text: 'Xabarni almashtiring.',
        check: (h) => headCommit(h)?.subject === 'Ikkinchi commit',
        natija: 'amend eski commit’ni o‘zgartirmaydi. U yangi commit yasab, main’ni unga suradi. Eski commit grafda xira ko‘rinadi: uni hech bir branch ko‘rmaydi, lekin reflog’da bor.',
      },
      {
        cmd: 'git reflog',
        text: 'HEAD tarixini ko‘ring.',
        check: ran(/^git reflog/),
        natija: 'Eski commit hamon shu yerda (HEAD@{1}). Uni `git switch --detach HEAD@{1}` bilan ochish mumkin.',
      },
    ],
  },
  {
    id: 'detached',
    title: 'Detached HEAD',
    bob: '/git/17-reflar-va-head',
    intro: 'main’da uchta commit bor. Eski commit’ga o‘tib, u yerda commit qiling va HEAD branch’siz qolganda nima bo‘lishini ko‘ring.',
    setup: `
      c "1-commit"
      c "2-commit"
      c "3-commit"`,
    steps: [
      {
        cmd: 'git switch --detach HEAD~1',
        text: 'Bitta oldingi commit’ga o‘ting.',
        check: (h) => !!h?.head?.detached,
        natija: 'HEAD endi branch’ga emas, to‘g‘ridan-to‘g‘ri commit’ga ishora qiladi — bu detached HEAD. .git/HEAD faylini oching: ichida `ref:` emas, hash yozilgan.',
      },
      {
        cmd: 'echo tajriba >> fayl.txt && git commit -am "tajriba"',
        text: 'Shu yerda commit qiling.',
        check: (h) => !!h?.head?.detached && headCommit(h)?.subject === 'tajriba',
        natija: 'Commit yaratildi, lekin uni faqat HEAD ko‘rsatib turibdi, hech bir branch emas.',
      },
      {
        cmd: 'git switch main',
        text: 'main’ga qayting.',
        check: (h) => onBranch(h, 'main'),
        natija: 'Git ogohlantirdi: «tajriba» commit’i ortda qoldi. Grafda u xira — endi uni hech kim ko‘rsatmaydi.',
      },
      {
        cmd: 'git branch tajriba HEAD@{1}',
        text: 'Uni branch bilan saqlab qoling. HEAD@{1} — HEAD bundan oldin turgan joy.',
        check: (h) => !!branch(h, 'tajriba'),
        natija: 'Commit yana ko‘rinadi: endi uni «tajriba» branch’i ushlab turibdi.',
      },
    ],
  },
  {
    id: 'branch',
    title: 'Branch — bu bitta fayl',
    bob: '/git/20-branch-bu-ref',
    intro: 'main’da ikkita commit bor. Branch yarating, ichini oching va unda commit qiling.',
    setup: `
      c "Birinchi commit"
      c "Ikkinchi commit"`,
    steps: [
      {
        cmd: 'git branch feature',
        text: 'Yangi branch yarating.',
        check: (h) => !!branch(h, 'feature'),
        natija: 'Yangi commit yaratilmadi: feature va main bitta commit’da turibdi. .git/refs/heads/ da yangi fayl paydo bo‘ldi.',
      },
      {
        cmd: 'cat .git/refs/heads/feature',
        text: 'Branch faylining ichini ko‘ring.',
        check: ran(/^cat .*refs\/heads\/feature/),
        natija: 'Ichida faqat 40 belgili hash — main ko‘rsatayotgan commit’ning o‘zi. Branch shundan iborat.',
      },
      {
        cmd: 'git switch feature',
        text: 'feature’ga o‘ting.',
        check: (h) => onBranch(h, 'feature'),
        natija: '.git/HEAD ichida endi `ref: refs/heads/feature`. HEAD — «hozir qaysi branch’dasiz» degani.',
      },
      {
        cmd: 'echo "yangi ish" >> fayl.txt && git commit -am "feature ishi"',
        text: 'feature’da commit qiling.',
        check: (h) => branch(h, 'feature') && branch(h, 'feature') !== branch(h, 'main'),
        natija: 'Commit HEAD ko‘rsatgan branch’ni, ya’ni feature’ni oldinga surdi. main joyida qoldi.',
      },
      {
        cmd: 'git switch main',
        text: 'main’ga qayting.',
        check: (h) => onBranch(h, 'main'),
        natija: 'Ishchi papka main holatiga qaytdi: `cat fayl.txt` da «yangi ish» qatori yo‘q. feature’dagi commit esa joyida.',
      },
    ],
  },
  {
    id: 'fast-forward',
    title: 'Fast-forward merge',
    bob: '/git/21-branch-va-merge',
    intro: 'feature main’dan ikki commit oldinda, main esa o‘shandan beri o‘zgarmagan. feature’ni main’ga qo‘shing.',
    setup: `
      c "Birinchi commit"
      c "Ikkinchi commit"
      sw -c feature
      c "feature 1"
      c "feature 2"
      sw main`,
    steps: [
      {
        cmd: 'git merge feature',
        text: 'feature’ni main’ga qo‘shing.',
        check: (h) => branch(h, 'main') === branch(h, 'feature'),
        natija: 'main feature’ning ajdodi edi, shuning uchun git yangi commit yaratmadi — main’ni oldinga surdi xolos. Terminalda «Fast-forward» yozuvi shuni bildiradi.',
      },
      {
        cmd: 'git branch -d feature',
        text: 'Endi feature kerak emas.',
        check: (h) => !branch(h, 'feature'),
        natija: 'Faqat ref o‘chdi. Commit’lar joyida, chunki ular main tarixida.',
      },
    ],
  },
  {
    id: 'merge',
    title: 'Uch tomonlama merge',
    bob: '/git/21-branch-va-merge',
    intro: 'main va feature ajralgan: har birida o‘z commit’lari bor. Ularni birlashtiring.',
    setup: `
      c "Birinchi commit"
      sw -c feature
      c "feature 1" feature.txt
      c "feature 2" feature.txt
      sw main
      c "main 1" main.txt`,
    steps: [
      {
        cmd: 'git log --oneline --graph --all',
        text: 'Avval tarixni terminalda ko‘ring.',
        check: ran(/^git log/),
        natija: 'Ikki tarix bitta commit’dan ajralgan. Bu holatda fast-forward mumkin emas.',
      },
      {
        cmd: 'git merge --no-edit feature',
        text: 'feature’ni qo‘shing. --no-edit standart xabarni muharrir ochmasdan qabul qiladi.',
        check: (h) => onBranch(h, 'main') && headCommit(h)?.parents.length === 2,
        natija: 'Git umumiy ajdod va ikki uchni solishtirib, ikki ota-onali merge commit yaratdi. feature joyida qoldi.',
      },
    ],
  },
  {
    id: 'konflikt',
    title: 'Merge konflikti',
    bob: '/git/22-konfliktlar',
    intro: 'Ikkala branch salom.txt dagi bitta qatorni har xil o‘zgartirgan. Merge qiling va konfliktni hal qiling.',
    setup: `
      c "Salom" salom.txt "Salom"
      sw -c feature
      tick; echo "Salom, dunyo" > salom.txt; git commit -qam "feature: dunyo"
      sw main
      tick; echo "Salom, olam" > salom.txt; git commit -qam "main: olam"`,
    steps: [
      {
        cmd: 'git merge feature',
        text: 'Merge qiling.',
        check: (h) => h?.op?.includes('MERGE_HEAD') && unmerged(h),
        natija: 'Git qaysi variantni olishni bilmaydi va to‘xtadi. .git/MERGE_HEAD paydo bo‘ldi, salom.txt esa «UU» holatida (ikkala tomonda o‘zgargan).',
      },
      {
        cmd: 'cat salom.txt',
        text: 'Faylni ko‘ring.',
        check: ran(/^cat salom\.txt/),
        natija: '`<<<<<<< HEAD` dan `=======` gacha main versiyasi, undan `>>>>>>> feature` gacha feature versiyasi.',
      },
      {
        cmd: 'echo "Salom, dunyo va olam" > salom.txt',
        text: 'Faylni o‘zingiz to‘g‘rilang (nano bilan ham bo‘ladi).',
        check: (h, cmd) => /salom\.txt/.test(cmd ?? '') && unmerged(h),
        natija: 'Fayl tuzatildi, lekin git buni hali bilmaydi: status hamon «UU».',
      },
      {
        cmd: 'git add salom.txt',
        text: 'Konflikt hal bo‘lganini bildiring.',
        check: (h) => h?.op?.includes('MERGE_HEAD') && !unmerged(h),
        natija: 'add konfliktdagi faylda «hal qilindi» degani. Merge hali tugamagan: MERGE_HEAD joyida.',
      },
      {
        cmd: 'git commit --no-edit',
        text: 'Merge’ni yakunlang.',
        check: (h) => !h?.op?.includes('MERGE_HEAD') && headCommit(h)?.parents.length === 2,
        natija: 'Merge commit yaratildi, MERGE_HEAD o‘chdi.',
      },
    ],
  },
  {
    id: 'rebase',
    title: 'Rebase: commit’larni yangi asosga ko‘chirish',
    bob: '/git/24-rebase',
    intro: 'feature main’dan ajralgandan keyin main’ga ikkita yangi commit qo‘shilgan. feature’ni main’ning oxiriga ko‘chiring va hash’larga e’tibor bering.',
    setup: `
      c "Birinchi commit"
      c "Ikkinchi commit"
      sw -c feature
      c "feature 1" feature.txt
      c "feature 2" feature.txt
      sw main
      c "main 1" main.txt
      c "main 2" main.txt`,
    steps: [
      {
        cmd: 'git switch feature',
        text: 'Ko‘chiriladigan branch’ga o‘ting.',
        check: (h) => onBranch(h, 'feature'),
        natija: 'Rebase joriy branch’ni ko‘chiradi, shuning uchun avval feature’ga o‘tamiz.',
      },
      {
        cmd: 'git rebase main',
        text: 'feature’ni main ustiga ko‘chiring.',
        check: (h) => onBranch(h, 'feature') && !h.op.length && isAncestor(h, branch(h, 'main'), branch(h, 'feature')),
        natija: 'feature’ning ikki commit’i main ustida qaytadan yaratildi. Mazmuni va xabari o‘sha, lekin ota-onasi boshqa, shuning uchun hash’lari yangi. Eski commit’lar grafda xira: ularni hech bir branch ko‘rmaydi, lekin reflog orqali qaytarish mumkin.',
      },
      {
        cmd: 'git log --oneline --graph --all',
        text: 'Tarixga qarang.',
        check: ran(/^git log/),
        natija: 'Tarix bitta to‘g‘ri chiziq bo‘ldi.',
      },
      {
        cmd: 'git switch main',
        text: 'main’ga qayting.',
        check: (h) => onBranch(h, 'main'),
        natija: 'main hali eski joyida, feature undan ikki commit oldinda.',
      },
      {
        cmd: 'git merge feature',
        text: 'feature’ni qo‘shing.',
        check: (h) => branch(h, 'main') === branch(h, 'feature'),
        natija: 'Rebase’dan keyin merge fast-forward bo‘ldi — merge commit kerak bo‘lmadi.',
      },
    ],
  },
  {
    id: 'stash',
    title: 'Stash: ishni vaqtincha chetga qo‘yish',
    bob: '/git/38-stash-va-clean',
    intro: 'fayl.txt da commit qilinmagan, tugallanmagan ish bor. Uni vaqtincha saqlab, keyin qaytaring.',
    setup: `
      c "Birinchi commit"
      echo "tugallanmagan ish" >> fayl.txt`,
    steps: [
      {
        cmd: 'git stash',
        text: 'O‘zgarishni chetga qo‘ying.',
        check: (h) => h?.stash?.length === 1 && clean(h),
        natija: 'O‘zgarishlar maxsus commit’ga saqlandi (refs/stash), ishchi papka toza. Endi bemalol boshqa branch’ga o‘tish mumkin.',
      },
      {
        cmd: 'git stash list',
        text: 'Saqlanganlar ro‘yxatini ko‘ring.',
        check: ran(/^git stash list/),
        natija: 'stash@{0} — eng oxirgi saqlangan ish.',
      },
      {
        cmd: 'git stash pop',
        text: 'Ishni qaytaring.',
        check: (h) => h?.stash?.length === 0 && h.status.some((s) => s.path === 'fayl.txt'),
        natija: 'O‘zgarish ishchi papkaga qaytdi, stash ro‘yxatdan o‘chdi.',
      },
    ],
  },
  {
    id: 'reset',
    title: 'reset: --soft, --mixed, --hard',
    bob: '/git/39-reset-sirlari',
    intro: 'main’da uchta commit bor. reset’ning uch rejimini ketma-ket sinab, uch qutida nima o‘zgarishini kuzating.',
    setup: `
      c "1-commit"
      c "2-commit"
      c "3-commit"`,
    steps: [
      {
        cmd: 'git reset --soft HEAD~1',
        text: 'Bitta commit orqaga, --soft bilan.',
        check: (h) => headCommit(h)?.subject === '2-commit' && staged(h, 'fayl.txt'),
        natija: '--soft faqat branch’ni siljitdi. 3-commit o‘zgarishlari index’da qoldi: ularni darhol qayta commit qilish mumkin.',
      },
      {
        cmd: 'git reset --mixed HEAD~1',
        text: 'Yana bitta orqaga, --mixed bilan (bu standart rejim).',
        check: (h) => headCommit(h)?.subject === '1-commit' && h.status.some((s) => s.path === 'fayl.txt' && s.x === ' ' && s.y === 'M'),
        natija: '--mixed branch’ni ham, index’ni ham qaytardi. O‘zgarishlar faqat ishchi papkada qoldi (` M`).',
      },
      {
        cmd: 'git reset --hard HEAD',
        text: 'Ishchi papkani ham tozalang.',
        check: (h) => headCommit(h)?.subject === '1-commit' && clean(h),
        natija: '--hard ishchi papkani ham HEAD holatiga qaytardi. 2- va 3-commit reflog’da bor, lekin commit qilinmagan o‘zgarishlar butunlay o‘chdi: ularni reflog ham saqlamaydi.',
      },
    ],
  },
  {
    id: 'reflog',
    title: 'O‘chirilgan branch’ni reflog bilan tiklash',
    bob: '/git/42-reflog-va-tiklash',
    intro: 'Kimdir ikki commit’li feature branch’ini merge qilmasdan `git branch -D` bilan o‘chirib yubordi. Commit’lar grafda xira. Ularni qaytaring.',
    setup: `
      c "Birinchi commit"
      sw -c feature
      c "feature 1" feature.txt
      c "feature 2" feature.txt
      sw main
      git branch -q -D feature`,
    steps: [
      {
        cmd: 'git reflog',
        text: 'HEAD qayerlarda bo‘lganini ko‘ring.',
        check: ran(/^git reflog/),
        natija: 'HEAD@{0} — main’ga o‘tish, HEAD@{1} — undan oldingi joy, ya’ni o‘chirilgan feature’ning oxirgi commit’i («feature 2»).',
      },
      {
        cmd: 'git branch tiklandi HEAD@{1}',
        text: 'Shu commit’ga yangi branch qo‘ying.',
        check: (h) => commit(h, branch(h, 'tiklandi'))?.subject === 'feature 2',
        natija: 'Ikkala commit yana ko‘rinadi. Branch — shunchaki commit’ga ko‘rsatkich, commit’lar esa yo‘qolmagan edi.',
      },
    ],
  },
  {
    id: 'diff',
    title: 'diff: nimani nima bilan solishtiradi',
    bob: '/git/07-diff',
    intro: 'fayl.txt ikki marta o‘zgargan: birinchi o‘zgarish index’ga olingan, ikkinchisi faqat ishchi papkada (status `MM`). Uchta diff’ni solishtiring.',
    setup: `
      c "Birinchi commit" fayl.txt "1-qator"
      echo "2-qator (index'da)" >> fayl.txt; git add fayl.txt
      echo "3-qator (faqat ishchi papkada)" >> fayl.txt`,
    steps: [
      {
        cmd: 'git diff',
        text: 'Ishchi papka va index farqi.',
        check: ran(/^git diff$/),
        natija: 'Faqat «3-qator» chiqdi: `git diff` ishchi papkani index bilan solishtiradi, index’ga olingan o‘zgarish bu yerda ko‘rinmaydi.',
      },
      {
        cmd: 'git diff --staged',
        text: 'Index va oxirgi commit farqi.',
        check: ran(/^git diff --(staged|cached)/),
        natija: 'Faqat «2-qator»: aynan shu keyingi commit’ga kiradi.',
      },
      {
        cmd: 'git diff HEAD',
        text: 'Ishchi papka va oxirgi commit farqi.',
        check: ran(/^git diff HEAD/),
        natija: 'Ikkala qator ham: commit’dan beri qilingan barcha o‘zgarish.',
      },
    ],
  },
  {
    id: 'gitignore',
    title: '.gitignore va git rm --cached',
    bob: '/git/08-gitignore-rm-mv',
    intro: 'Papkada log fayllar va node_modules/ bor, bittasi (eski.log) esa xato bilan commit qilib yuborilgan. Keraksiz fayllarni git’dan yashiring.',
    setup: `
      c "Birinchi commit" app.js "console.log(1)"
      c "eski.log qo'shildi" eski.log "log"
      echo "log" > app.log
      mkdir -p node_modules/lib; echo "kutubxona" > node_modules/lib/index.js`,
    steps: [
      {
        cmd: 'git status -s',
        text: 'Kuzatilmagan fayllarni ko‘ring.',
        check: ran(/^git status/),
        natija: '`??` — app.log va node_modules ichidagi fayl. Ular commit’ga tushmasligi kerak.',
      },
      {
        cmd: 'printf "*.log\\nnode_modules/\\n" > .gitignore',
        text: 'Qoidalarni .gitignore ga yozing.',
        check: (h) => h?.status?.some((s) => s.path === '.gitignore') && !h.status.some((s) => s.path === 'app.log' || s.path.startsWith('node_modules/')),
        natija: 'app.log va node_modules/ ro‘yxatdan yo‘qoldi. Lekin eski.log hamon kuzatiladi: .gitignore faqat hali kuzatilmagan fayllarga ta’sir qiladi.',
      },
      {
        cmd: 'git rm --cached eski.log',
        text: 'eski.log ni git’dan chiqaring, diskda qolsin.',
        check: (h) => h?.status?.some((s) => s.path === 'eski.log' && s.x === 'D'),
        natija: 'Index’dan o‘chdi (`D `), fayl esa diskda turibdi. Endi u .gitignore bo‘yicha e’tiborsiz qoldiriladi.',
      },
      {
        cmd: 'git add .gitignore && git commit -m ".gitignore qo\'shildi"',
        text: 'Commit qiling.',
        check: (h) => clean(h) && !h.headFiles.includes('eski.log'),
        natija: 'Oxirgi commit’da eski.log yo‘q, .gitignore bor. Ishchi papka toza ko‘rinadi.',
      },
    ],
  },
  {
    id: 'restore',
    title: 'restore: o‘zgarishni bekor qilish',
    bob: '/git/11-bekor-qilish',
    intro: 'fayl.txt ishchi papkada buzilgan, b.txt dagi o‘zgarish esa adashib index’ga olingan. Ikkalasini ham bekor qiling.',
    setup: `
      c "Birinchi commit"
      c "b.txt" b.txt "b"
      echo "buzilgan" >> fayl.txt
      echo "keraksiz" >> b.txt; git add b.txt`,
    steps: [
      {
        cmd: 'git restore fayl.txt',
        text: 'fayl.txt ni oxirgi holatiga qaytaring.',
        check: (h) => !h?.status?.some((s) => s.path === 'fayl.txt'),
        natija: 'Ishchi papkadagi o‘zgarish o‘chdi: fayl index’dagi holatga qaytdi. Bu o‘zgarish qayta tiklanmaydi.',
      },
      {
        cmd: 'git restore --staged b.txt',
        text: 'b.txt ni index’dan chiqaring.',
        check: (h) => h?.status?.some((s) => s.path === 'b.txt' && s.x === ' ' && s.y === 'M'),
        natija: '--staged faqat index’ni HEAD holatiga qaytardi. O‘zgarish ishchi papkada qoldi (` M`).',
      },
      {
        cmd: 'git restore b.txt',
        text: 'Endi ishchi papkadan ham olib tashlang.',
        check: (h) => clean(h),
        natija: 'Ishchi papka toza.',
      },
    ],
  },
  {
    id: 'revert',
    title: 'revert: commit’ni teskari commit bilan bekor qilish',
    bob: '/git/11-bekor-qilish',
    intro: 'Ikkinchi commit xato.txt ni qo‘shgan va u allaqachon boshqalarga yuborilgan. Tarixni o‘zgartirmasdan uni bekor qiling.',
    setup: `
      c "Birinchi commit"
      c "xato.txt qo'shildi" xato.txt "xato"
      c "Uchinchi commit"`,
    steps: [
      {
        cmd: 'git revert --no-edit HEAD~1',
        text: 'Ikkinchi commit’ni bekor qiling.',
        check: (h) => headCommit(h)?.subject.startsWith('Revert') && !h.headFiles.includes('xato.txt'),
        natija: 'Yangi commit yaratildi: u xato.txt ni o‘chiradi. Eski commit’lar joyida, hech bir hash o‘zgarmadi. Shuning uchun revert ulashilgan tarixda xavfsiz.',
      },
      {
        cmd: 'git log --oneline',
        text: 'Tarixni ko‘ring.',
        check: ran(/^git log/),
        natija: 'To‘rtta commit: xato commit ham, uni bekor qilgan «Revert ...» ham tarixda qoladi.',
      },
    ],
  },
  {
    id: 'teg',
    title: 'Teglar: oddiy va annotatsiyali',
    bob: '/git/12-teglar-va-aliaslar',
    intro: 'Ikkita reliz commit’iga teg qo‘ying va ikki xil teg ichkarida qanday saqlanishini solishtiring.',
    setup: `
      c "Birinchi commit"
      c "Reliz 1.0"`,
    steps: [
      {
        cmd: 'git tag v1.0',
        text: 'Oddiy (lightweight) teg.',
        check: (h) => h?.refs?.some((r) => r.name === 'refs/tags/v1.0'),
        natija: '.git/refs/tags/v1.0 paydo bo‘ldi. Ichida commit hash’i bor xolos, xuddi branch kabi. Faqat u o‘z-o‘zidan siljimaydi.',
      },
      {
        cmd: 'git tag -a v1.1 -m "Birinchi reliz"',
        text: 'Annotatsiyali teg.',
        check: (h) => h?.refs?.some((r) => r.name === 'refs/tags/v1.1'),
        natija: 'Bu safar .git/objects da yangi obyekt ham paydo bo‘ldi: muallif, sana va xabarni saqlaydigan teg obyekti.',
      },
      {
        cmd: 'git cat-file -t v1.0 && git cat-file -t v1.1',
        text: 'Ikkala teg nimaga ishora qilishini ko‘ring.',
        check: ran(/^git cat-file -t/),
        natija: 'v1.0 → `commit` (to‘g‘ridan-to‘g‘ri commit), v1.1 → `tag` (alohida teg obyekti, u esa commit’ga ishora qiladi).',
      },
    ],
  },
  {
    id: 'obyektlar',
    title: 'Ichkaridan: commit, tree, blob',
    bob: '/git/14-obyektlar-blob',
    intro: 'Bitta commit’ni qavatma-qavat ochib chiqing: commit → tree → blob. Har qadamda .git papkasidagi faylni ham bosib ko‘ring.',
    setup: `
      c "Birinchi commit" salom.txt "Salom, git"`,
    steps: [
      {
        cmd: 'git cat-file -p HEAD',
        text: 'Commit obyekti ichida nima bor?',
        check: ran(/^git cat-file -p HEAD$/),
        natija: '`tree` (loyiha papkasining surati), `author`, `committer` va xabar. Birinchi commit bo‘lgani uchun `parent` qatori yo‘q.',
      },
      {
        cmd: 'git cat-file -p HEAD^{tree}',
        text: 'Tree’ni oching.',
        check: ran(/^git cat-file -p HEAD\^\{tree\}/),
        natija: 'Har fayl uchun qator: rejim (100644), turi (blob), hash va nomi.',
      },
      {
        cmd: 'git cat-file -p HEAD:salom.txt',
        text: 'Blob — fayl mazmuni.',
        check: ran(/^git cat-file -p HEAD:salom\.txt/),
        natija: 'Faqat mazmun. Fayl nomi blob’da emas, tree’da saqlanadi.',
      },
      {
        cmd: 'echo "Salom, git" | git hash-object --stdin',
        text: 'Xuddi shu mazmunning hash’ini hisoblang.',
        check: ran(/hash-object/),
        natija: 'Hash salom.txt blob’iniki bilan bir xil chiqdi: git obyekt nomini mazmundan hisoblaydi.',
      },
    ],
  },
  {
    id: 'gc',
    title: 'Packfile: git gc nima qiladi',
    bob: '/git/18-packfile-va-gc',
    intro: 'Repo’da beshta commit bor va har bir obyekt alohida faylda saqlangan. Ularni bitta pack faylga yig‘ing va .git/objects ni kuzating.',
    setup: `
      for i in 1 2 3 4 5; do c "$i-commit"; done`,
    steps: [
      {
        cmd: 'git count-objects -v',
        text: 'Nechta alohida (loose) obyekt bor?',
        check: ran(/^git count-objects/),
        natija: '`count: 15` — 5 commit, 5 tree, 5 blob. Har biri .git/objects/xx/ ichida alohida fayl.',
      },
      {
        cmd: 'git gc',
        text: 'Yig‘ishtiring.',
        check: (h) => h?.files?.some((f) => f.path.startsWith('objects/pack/') && f.path.endsWith('.pack')) && !h.files.some((f) => /^objects\/[0-9a-f]{2}\//.test(f.path)) && h.files.some((f) => f.path === 'packed-refs'),
        natija: 'Alohida fayllar yo‘qoldi, objects/pack/ da .pack (obyektlar) va .idx (ularning ro‘yxati) paydo bo‘ldi. Branch’lar ham packed-refs fayliga ko‘chdi.',
      },
      {
        cmd: 'git count-objects -v',
        text: 'Yana tekshiring.',
        check: ran(/^git count-objects/),
        natija: '`count: 0`, `in-pack: 15` — obyektlar o‘sha-o‘sha, faqat bitta faylda.',
      },
    ],
  },
  {
    id: 'branch-boshqaruv',
    title: 'Branch’larni boshqarish: -d, -D, -m',
    bob: '/git/23-branch-boshqaruvi',
    intro: 'Uchta branch bor: eski (main’ga qo‘shilgan), feature (qo‘shilmagan ishi bor). Tozalang va qayta nomlang.',
    setup: `
      c "Birinchi commit"
      br eski
      c "Ikkinchi commit"
      sw -c feature
      c "feature ishi" feature.txt
      sw main`,
    steps: [
      {
        cmd: 'git branch -v --merged',
        text: 'main’ga qo‘shilgan branch’lar.',
        check: ran(/^git branch .*--merged/),
        natija: 'eski va main chiqdi: eski’ning commit’i main tarixida bor. feature ro‘yxatda yo‘q.',
      },
      {
        cmd: 'git branch -d eski',
        text: 'Qo‘shilgan branch’ni o‘chiring.',
        check: (h) => !branch(h, 'eski'),
        natija: 'O‘chdi: hech qanday ish yo‘qolmaydi.',
      },
      {
        cmd: 'git branch -d feature',
        text: 'feature’ni ham o‘chirib ko‘ring.',
        check: (h, cmd) => /^git branch -d feature/.test(cmd ?? '') && !!branch(h, 'feature'),
        natija: 'Git rad etdi: «not fully merged». -d faqat qo‘shilgan branch’ni o‘chiradi, ishni yo‘qotishdan himoya qiladi. Majburan o‘chirish — -D.',
      },
      {
        cmd: 'git branch -m feature login-sahifa',
        text: 'Uni o‘chirish o‘rniga mazmunli nom bering.',
        check: (h) => !!branch(h, 'login-sahifa') && !branch(h, 'feature'),
        natija: 'refs/heads/feature fayli login-sahifa bo‘ldi, commit o‘sha. Reflog ham yangi nom bilan ko‘chdi.',
      },
    ],
  },
  {
    id: 'merge-abort',
    title: 'Konfliktdan chiqish: merge --abort',
    bob: '/git/22-konfliktlar',
    intro: 'Merge konfliktga uchradi, lekin hozir uni hal qilish vaqti emas. Hammasini merge’dan oldingi holatga qaytaring.',
    setup: `
      c "Salom" salom.txt "Salom"
      sw -c feature
      tick; echo "Salom, dunyo" > salom.txt; git commit -qam "feature: dunyo"
      sw main
      tick; echo "Salom, olam" > salom.txt; git commit -qam "main: olam"`,
    steps: [
      {
        cmd: 'git merge feature',
        text: 'Merge qiling.',
        check: (h) => h?.op?.includes('MERGE_HEAD') && unmerged(h),
        natija: 'Konflikt: MERGE_HEAD paydo bo‘ldi, salom.txt «UU».',
      },
      {
        cmd: 'git merge --abort',
        text: 'Merge’ni bekor qiling.',
        check: (h) => !h?.op?.length && clean(h) && headCommit(h)?.subject === 'main: olam',
        natija: 'MERGE_HEAD o‘chdi, fayl va index merge’dan oldingi holatga qaytdi. Hech qanday commit yaratilmadi.',
      },
    ],
  },
  {
    id: 'rebase-konflikt',
    title: 'Rebase paytidagi konflikt',
    bob: '/git/24-rebase',
    intro: 'feature’ni main ustiga ko‘chirmoqchisiz, lekin ikkala branch salom.txt dagi bitta qatorni o‘zgartirgan. Rebase to‘xtaydi — uni oxiriga yetkazing.',
    setup: `
      c "Salom" salom.txt "Salom"
      sw -c feature
      tick; echo "Salom, dunyo" > salom.txt; git commit -qam "feature: dunyo"
      sw main
      tick; echo "Salom, olam" > salom.txt; git commit -qam "main: olam"
      sw feature`,
    steps: [
      {
        cmd: 'git rebase main',
        text: 'Rebase’ni boshlang.',
        check: (h) => h?.op?.some((o) => o.startsWith('rebase')) && unmerged(h) && !!h.head.detached,
        natija: 'Rebase «feature: dunyo» commit’ini qo‘yayotganda to‘xtadi. .git/rebase-merge papkasi paydo bo‘ldi, HEAD esa vaqtincha branch’siz (main ustida).',
      },
      {
        cmd: 'echo "Salom, dunyo va olam" > salom.txt && git add salom.txt',
        text: 'Faylni tuzatib, index’ga oling.',
        check: (h) => h?.op?.some((o) => o.startsWith('rebase')) && !unmerged(h),
        natija: 'Konflikt hal qilindi, lekin rebase hali tugamagan.',
      },
      {
        cmd: 'GIT_EDITOR=true git rebase --continue',
        text: 'Rebase’ni davom ettiring. GIT_EDITOR=true commit xabarini muharrir ochmasdan o‘zgarishsiz qoldiradi.',
        check: (h) => !h?.op?.length && onBranch(h, 'feature') && isAncestor(h, branch(h, 'main'), branch(h, 'feature')),
        natija: 'Rebase tugadi: feature main ustida, eski commit xira. Bekor qilmoqchi bo‘lsangiz, `git rebase --abort` ham bor edi.',
      },
    ],
  },
  {
    id: 'cherry-pick',
    title: 'cherry-pick: bitta commit’ni ko‘chirish',
    bob: '/git/34-loyihani-yuritish',
    intro: 'feature’da uchta commit bor, ulardan biri — main’ga hozir kerak bo‘lgan xato tuzatish. Faqat o‘shani oling.',
    setup: `
      c "Birinchi commit"
      sw -c feature
      c "Yangi sahifa" sahifa.txt
      c "Xato tuzatildi" tuzatish.txt
      c "Sahifa dizayni" sahifa.txt
      sw main`,
    steps: [
      {
        cmd: 'git log --oneline feature',
        text: 'feature tarixini ko‘ring.',
        check: ran(/^git log/),
        natija: '«Xato tuzatildi» — feature’ning oxiridan bitta oldingisi, ya’ni `feature~1`.',
      },
      {
        cmd: 'git cherry-pick feature~1',
        text: 'Shu commit’ni main’ga ko‘chiring.',
        check: (h) => onBranch(h, 'main') && headCommit(h)?.subject === 'Xato tuzatildi',
        natija: 'main’da xuddi shu o‘zgarishli yangi commit paydo bo‘ldi. Hash boshqa, chunki ota-onasi boshqa. Asl commit feature’da joyida qoldi.',
      },
    ],
  },
  {
    id: 'push',
    title: 'Remote: commit va push',
    bob: '/git/27-remote',
    intro: 'Repo’ning origin nomli remote’i bor (bu yerda u shu kompyuterdagi papka, lekin ishlashi GitHub bilan bir xil). Commit qilib, origin’ga yuboring.',
    setup: `
      c "Birinchi commit"
      origin push-origin.git`,
    steps: [
      {
        cmd: 'git remote -v',
        text: 'Remote’lar ro‘yxati.',
        check: ran(/^git remote/),
        natija: 'origin — boshqa repo manzili. Grafdagi `origin/main` esa sizning repo’dagi remote-tracking branch: origin’dagi main oxirgi marta qayerda ko‘ringani.',
      },
      {
        cmd: 'echo "yangi ish" >> fayl.txt && git commit -am "Yangi ish"',
        text: 'Commit qiling.',
        check: (h) => branch(h, 'main') !== h.refs.find((r) => r.name === 'refs/remotes/origin/main')?.hash,
        natija: 'main oldinga ketdi, origin/main esa joyida: origin bu commit’ni hali bilmaydi.',
      },
      {
        cmd: 'git push',
        text: 'Yuboring.',
        check: (h) => branch(h, 'main') === h.refs.find((r) => r.name === 'refs/remotes/origin/main')?.hash,
        natija: 'Commit origin’ga ketdi va origin/main ham shu commit’ga siljidi.',
      },
    ],
  },
  {
    id: 'fetch',
    title: 'fetch: hamkasb ishini olish',
    bob: '/git/28-remote-branchlar',
    intro: 'Hamkasbingiz origin’ga ikkita commit yuborgan, lekin sizning repo bundan bexabar. Ularni olib, main’ga qo‘shing.',
    setup: `
      c "Birinchi commit"
      origin fetch-origin.git
      hamkasb "Hamkasb: login" login.txt
      hamkasb "Hamkasb: parol" login.txt`,
    steps: [
      {
        cmd: 'git status',
        text: 'Holatni so‘rang.',
        check: ran(/^git status/),
        natija: '«up to date» deydi, lekin bu origin/main bo‘yicha. Git internetga o‘zi bormaydi, origin’da nima borligini hali bilmaydi.',
      },
      {
        cmd: 'git fetch',
        text: 'origin’dan yangiliklarni oling.',
        check: (h) => { const o = h?.refs?.find((r) => r.name === 'refs/remotes/origin/main')?.hash; return o && o !== branch(h, 'main') && isAncestor(h, branch(h, 'main'), o) },
        natija: 'Hamkasbning ikki commit’i keldi va origin/main ularga siljidi. Sizning main’ingiz va fayllaringiz o‘zgarmadi: fetch faqat yuklab oladi.',
      },
      {
        cmd: 'git log --oneline main..origin/main',
        text: 'Nima kelganini ko‘ring.',
        check: ran(/^git log/),
        natija: '`main..origin/main` — origin/main’da bor, main’da yo‘q commit’lar.',
      },
      {
        cmd: 'git merge',
        text: 'Qo‘shing (argumentsiz merge kuzatilayotgan origin/main’ni oladi).',
        check: (h) => branch(h, 'main') === h.refs.find((r) => r.name === 'refs/remotes/origin/main')?.hash,
        natija: 'Fast-forward. `git pull` aynan shu ikki qadamni (fetch + merge) bitta buyruqda qiladi.',
      },
    ],
  },
  {
    id: 'push-rad',
    title: 'Push rad etildi: pull --rebase',
    bob: '/git/29-fetch-push-ichidan',
    intro: 'Siz commit qildingiz, lekin shu orada hamkasb ham origin’ga push qilgan. Yuborishga urinib ko‘ring.',
    setup: `
      c "Birinchi commit"
      origin push-rad-origin.git
      hamkasb "Hamkasb ishi" hamkasb.txt
      c "Mening ishim" meniki.txt`,
    steps: [
      {
        cmd: 'git push',
        text: 'Yuboring.',
        check: (h, cmd) => /^git push/.test(cmd ?? '') && branch(h, 'main') !== h.refs.find((r) => r.name === 'refs/remotes/origin/main')?.hash,
        natija: 'Rad etildi («rejected … fetch first»). origin’da sizda yo‘q commit bor: push uni o‘chirib yubormasligi uchun faqat fast-forward’ga ruxsat beriladi.',
      },
      {
        cmd: 'git pull --rebase',
        text: 'Hamkasb ishini olib, o‘zingiznikini uning ustiga qo‘ying.',
        check: (h) => { const o = h?.refs?.find((r) => r.name === 'refs/remotes/origin/main')?.hash; return !h.op.length && o && isAncestor(h, o, branch(h, 'main')) && branch(h, 'main') !== o },
        natija: 'fetch hamkasb commit’ini olib keldi, rebase esa sizning commit’ingizni uning ustiga ko‘chirdi. Eski variant grafda xira.',
      },
      {
        cmd: 'git push',
        text: 'Endi yuboring.',
        check: (h) => branch(h, 'main') === h.refs.find((r) => r.name === 'refs/remotes/origin/main')?.hash,
        natija: 'Bu safar fast-forward — push qabul qilindi.',
      },
    ],
  },
  {
    id: 'bisect',
    title: 'bisect: xato qaysi commit’da paydo bo‘ldi',
    bob: '/git/41-blame-va-bisect',
    intro: 'Sakkizta commit bor, oxirgisida fayl.txt ichida «xato» so‘zi bor, birinchisida yo‘q. Uni qaysi commit kiritganini ikkiga bo‘lib qidirish bilan toping.',
    setup: `
      for i in 1 2 3 4; do c "$i-commit"; done
      c "5-commit" fayl.txt "xato"
      for i in 6 7 8; do c "$i-commit"; done`,
    steps: [
      {
        cmd: 'git bisect start',
        text: 'Qidiruvni boshlang.',
        check: (h) => h?.op?.includes('BISECT_LOG'),
        natija: '.git/BISECT_LOG paydo bo‘ldi — git har qadamni shu yerga yozadi.',
      },
      {
        cmd: 'git bisect bad',
        text: 'Hozirgi commit yomon.',
        check: (h) => h?.refs?.some((r) => r.name === 'refs/bisect/bad'),
        natija: 'refs/bisect/bad — yomon deb belgilangan commit.',
      },
      {
        cmd: 'git bisect good HEAD~7',
        text: 'Birinchi commit yaxshi edi.',
        check: (h) => !!h?.head?.detached,
        natija: 'Git o‘rtadagi commit’ga o‘tdi (detached HEAD) va qolgan qadamlar sonini aytdi. Har javob qidiruv oralig‘ini ikki barobar qisqartiradi.',
      },
      {
        cmd: 'git bisect run sh -c \'! grep -q xato fayl.txt\'',
        text: 'Tekshiruvni git’ning o‘ziga topshiring: buyruq 0 qaytarsa — yaxshi, boshqa son — yomon.',
        check: (h) => commit(h, h?.refs?.find((r) => r.name === 'refs/bisect/bad')?.hash)?.subject === '5-commit',
        natija: 'Git «… is the first bad commit» deb 5-commit’ni ko‘rsatdi. Sakkizta commit’dan topish uchun uch marta tekshirish yetdi.',
      },
      {
        cmd: 'git bisect reset',
        text: 'Qidiruvni yakunlang.',
        check: (h) => !h?.op?.includes('BISECT_LOG') && onBranch(h, 'main'),
        natija: 'HEAD main’ga qaytdi, bisect fayllari tozalandi.',
      },
    ],
  },
  {
    id: 'hook',
    title: 'pre-commit hook',
    bob: '/git/47-hooklar',
    intro: 'Repo’da pre-commit hook o‘rnatilgan: u «TODO» qolgan kodni commit qildirmaydi. kod.txt da TODO bor va u index’ga olingan.',
    setup: `
      c "Birinchi commit"
      mkdir -p .git/hooks
      printf '#!/bin/sh\\nif git diff --cached | grep -q TODO; then\\n  echo "pre-commit: kodda TODO qolgan, commit bekor qilindi" >&2\\n  exit 1\\nfi\\n' > .git/hooks/pre-commit
      chmod +x .git/hooks/pre-commit
      echo "TODO: tekshiruv yozish" > kod.txt; git add kod.txt`,
    steps: [
      {
        cmd: 'cat .git/hooks/pre-commit',
        text: 'Hook’ni o‘qing.',
        check: ran(/^cat .*pre-commit/),
        natija: 'Oddiy shell skript. Git uni commit’dan oldin ishga tushiradi; 0 dan boshqa kod bilan chiqsa, commit to‘xtaydi.',
      },
      {
        cmd: 'git commit -m "Yangi funksiya"',
        text: 'Commit qilib ko‘ring.',
        check: (h, cmd) => /^git commit/.test(cmd ?? '') && headCommit(h)?.subject === 'Birinchi commit' && staged(h, 'kod.txt'),
        natija: 'Hook rad etdi, commit yaratilmadi. kod.txt index’da kutib turibdi.',
      },
      {
        cmd: 'echo "tekshiruv tayyor" > kod.txt && git add kod.txt',
        text: 'TODO’ni olib tashlang.',
        check: (h) => staged(h, 'kod.txt') && !h.status.some((s) => s.path === 'kod.txt' && s.y !== ' '),
        natija: 'Index’da endi TODO’siz versiya.',
      },
      {
        cmd: 'git commit -m "Yangi funksiya"',
        text: 'Qayta commit qiling.',
        check: (h) => headCommit(h)?.subject === 'Yangi funksiya',
        natija: 'Hook o‘tkazdi. Hook’lar .git/hooks da turadi va clone bilan boshqalarga o‘tmaydi.',
      },
    ],
  },
]

// kitobdagi tartib: bob raqami bo'yicha (bir bobdagi mashqlar yozilgan tartibda qoladi)
export const bobRaqami = (m) => +m.bob.match(/\/(\d+)-/)[1]
MASHQLAR.sort((a, b) => bobRaqami(a) - bobRaqami(b))

export const findMashq = (id) => MASHQLAR.find((m) => m.id === id) ?? null

// VM ichida ishlaydigan tayyorlash skripti (vm.js: runMashq)
export const setupScript = (m) => `. /usr/local/lib/trenajor/mashq.sh
yangi ~/mashq/${m.id}
${m.setup.replace(/^\s+/gm, '')}
`
