// Maslahatlar katalogi: git buyruqlari, ularning asosiy flaglari va o'zbekcha qisqa izoh.
// args — buyruqdan keyin keladigan argument turi: 'branch' | 'file' | 'remote' | 'commit' yoki so'zlar ro'yxati.
// Izohlar git hujjatidagi (git-scm.com/docs) qisqa tavsifga tayanadi.

export const GIT = {
  init: { d: 'yangi repo yaratish (.git papka)', flags: { '-q': 'jim', '-b': 'boshlang‘ich branch nomi' } },
  status: { d: 'ishchi papka va index holati', flags: { '-s': 'qisqa ko‘rinish', '-b': 'branch bilan' } },
  add: { d: 'o‘zgarishni index‘ga (staging) olish', args: 'file', flags: { '.': 'hammasi', '-A': 'barcha o‘zgarish', '-p': 'bo‘lakma-bo‘lak tanlash' } },
  commit: { d: 'index‘dagi holatni commit qilib saqlash', flags: { '-m': 'xabar', '-a': 'kuzatilgan fayllarni avtomatik add', '--amend': 'oxirgi commit‘ni qayta yozish', '--no-edit': 'xabarni o‘zgartirmaslik' } },
  log: { d: 'commit tarixi', flags: { '--oneline': 'bir qatorda', '--graph': 'grafik', '--all': 'barcha branch‘lar', '-n': 'oxirgi n ta' } },
  diff: { d: 'farqlarni ko‘rish', args: 'file', flags: { '--staged': 'index va oxirgi commit farqi', '--stat': 'qisqa statistika' } },
  show: { d: 'commit yoki obyektni ko‘rsatish', args: 'commit', flags: { '--stat': 'fayllar ro‘yxati' } },
  branch: { d: 'branch‘lar ro‘yxati / yaratish / o‘chirish', args: 'branch', flags: { '-d': 'o‘chirish (birlashgan bo‘lsa)', '-D': 'majburan o‘chirish', '-m': 'nomini o‘zgartirish', '-v': 'oxirgi commit bilan', '-a': 'remote‘lar bilan' } },
  switch: { d: 'branch‘ga o‘tish', args: 'branch', flags: { '-c': 'yangi branch yaratib o‘tish', '--detach': 'commit‘ga ajralgan holda o‘tish', '-': 'oldingi branch‘ga' } },
  checkout: { d: 'branch‘ga o‘tish yoki faylni tiklash (eski buyruq)', args: 'branch', flags: { '-b': 'yangi branch yaratib o‘tish', '--': 'fayllar' } },
  restore: { d: 'faylni tiklash', args: 'file', flags: { '--staged': 'index‘dan chiqarish', '--source': 'qaysi commit‘dan' } },
  merge: { d: 'boshqa branch‘ni joriy branch‘ga qo‘shish', args: 'branch', flags: { '--no-ff': 'har doim merge commit', '--squash': 'bitta o‘zgarish qilib', '--abort': 'bekor qilish', '--continue': 'konfliktdan keyin davom' } },
  rebase: { d: 'commit‘larni boshqa asos ustiga ko‘chirish', args: 'branch', flags: { '-i': 'interaktiv (tahrirlash, squash)', '--continue': 'konfliktdan keyin davom', '--abort': 'bekor qilish', '--skip': 'shu commit‘ni tashlab ketish', '--onto': 'yangi asos' } },
  'cherry-pick': { d: 'bitta commit‘ni joriy branch‘ga nusxalash', args: 'commit', flags: { '--continue': 'davom', '--abort': 'bekor qilish' } },
  reset: { d: 'branch‘ni boshqa commit‘ga surish', args: 'commit', flags: { '--soft': 'faqat branch‘ni surish', '--mixed': 'branch + index (standart)', '--hard': 'branch + index + ishchi papka (o‘zgarishlar yo‘qoladi!)' } },
  revert: { d: 'commit‘ni bekor qiladigan yangi commit', args: 'commit', flags: { '--no-edit': 'xabarni o‘zgartirmaslik' } },
  stash: { d: 'o‘zgarishlarni vaqtincha olib qo‘yish', args: ['push', 'pop', 'list', 'apply', 'drop', 'show'], flags: { '-u': 'kuzatilmaganlar bilan', '-m': 'izoh' } },
  tag: { d: 'commit‘ga teg (masalan, versiya) qo‘yish', flags: { '-a': 'izohli teg', '-m': 'xabar', '-d': 'o‘chirish' } },
  reflog: { d: 'HEAD qayerlarda bo‘lganining tarixi (yo‘qolganni topish)', args: ['show', 'expire'], flags: {} },
  remote: { d: 'remote repolar', args: ['add', 'remove', 'rename', '-v'], flags: { '-v': 'manzillar bilan' } },
  clone: { d: 'repo nusxasini olish', flags: { '--bare': 'ishchi papkasiz' } },
  fetch: { d: 'remote‘dan yangiliklarni olish (birlashtirmasdan)', args: 'remote', flags: { '--all': 'hamma remote', '--prune': 'o‘chganlarini tozalash' } },
  pull: { d: 'fetch + merge (yoki rebase)', args: 'remote', flags: { '--rebase': 'merge o‘rniga rebase', '--ff-only': 'faqat oldinga surish' } },
  push: { d: 'commit‘larni remote‘ga yuborish', args: 'remote', flags: { '-u': 'kuzatuvni sozlash', '--force-with-lease': 'ehtiyotkor majburiy push', '--tags': 'teglar bilan' } },
  rm: { d: 'faylni o‘chirish va index‘dan olib tashlash', args: 'file', flags: { '--cached': 'faqat index‘dan' } },
  mv: { d: 'faylni ko‘chirish / nomini o‘zgartirish', args: 'file', flags: {} },
  bisect: { d: 'xato kirgan commit‘ni ikkiga bo‘lib qidirish', args: ['start', 'good', 'bad', 'reset', 'run'], flags: {} },
  blame: { d: 'har qatorni kim, qaysi commit‘da yozgan', args: 'file', flags: {} },
  'cat-file': { d: 'obyekt ichini ko‘rish', args: 'commit', flags: { '-p': 'chiroyli ko‘rinish', '-t': 'obyekt turi' } },
  'ls-files': { d: 'index‘dagi fayllar', flags: { '-s': 'hash‘lari bilan' } },
  'rev-parse': { d: 'nomni hash‘ga aylantirish', args: 'branch', flags: { '--short': 'qisqa hash' } },
  config: { d: 'sozlamalar', flags: { '--global': 'butun foydalanuvchi uchun', '--list': 'hammasi' } },
  clean: { d: 'kuzatilmagan fayllarni o‘chirish', flags: { '-n': 'faqat ko‘rsatish', '-f': 'o‘chirish', '-d': 'papkalar bilan' } },
  help: { d: 'yordam', args: ['rebase', 'merge', 'reset', 'commit'], flags: {} },
}

// Git'dan tashqari kerakli shell buyruqlari
export const SHELL = {
  ls: 'fayllar ro‘yxati', cd: 'papkaga o‘tish', cat: 'fayl ichini ko‘rish', echo: 'matn chiqarish (yoki faylga yozish: echo matn > fayl)',
  touch: 'bo‘sh fayl yaratish', mkdir: 'papka yaratish', nano: 'faylni tahrirlash', clear: 'ekranni tozalash', git: 'git buyruqlari', rm: 'faylni o‘chirish',
}

// Ko'p ishlatiladigan buyruqlar oldinda turadi
export const ORDER = ['status', 'add', 'commit', 'log', 'switch', 'branch', 'merge', 'rebase', 'diff', 'restore', 'reset', 'stash', 'init', 'checkout', 'cherry-pick', 'revert', 'tag', 'reflog', 'show', 'push', 'pull', 'fetch', 'remote', 'clone']
