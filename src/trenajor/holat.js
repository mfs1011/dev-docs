// trenajor-holat chiqishini (bo'limlar: @cwd, @refs, @commits ...) obyektga aylantiradi
// va ikki holat farqidan o'zbekcha izohlar yasaydi.

export function parseHolat(text) {
  const sec = {}
  let cur = null
  for (const line of text.split('\n')) {
    if (/^@[a-z]+$/.test(line)) { cur = line.slice(1); sec[cur] = []; continue }
    if (cur && line !== '') sec[cur].push(line)
  }
  const h = { cwd: sec.cwd?.[0] ?? '', repo: !!sec.top, top: sec.top?.[0], gitdir: sec.gitdir?.[0] }
  if (!h.repo) return h
  const headRaw = sec.head?.[0] ?? ''
  h.head = headRaw.startsWith('ref: ') ? { ref: headRaw.slice(5) } : { detached: headRaw.trim() }
  h.refs = (sec.refs ?? []).map((l) => { const [name, hash] = l.split('\t'); return { name, hash } })
  // branch yaratilgan vaqt (reflog'ning birinchi yozuvi) — graf yo'laklari tartibi
  h.born = new Map((sec.born ?? []).map((l) => { const [name, t] = l.split('\t'); return [name, +t] }))
  h.reachable = new Set(sec.reachable ?? [])
  h.commits = (sec.commits ?? []).map((l) => {
    const [hash, parents, time, author, ...subj] = l.split('\t')
    return { hash, parents: parents ? parents.split(' ') : [], time: +time, author, subject: subj.join('\t') }
  })
  h.status = (sec.status ?? []).map((l) => ({ x: l[0], y: l[1], path: l.slice(3) }))
  h.headFiles = sec.headfiles ?? []
  h.op = sec.op ?? []
  h.stash = (sec.stash ?? []).map((l) => { const [hash, ...m] = l.split('\t'); return { hash, msg: m.join('\t') } })
  h.files = (sec.files ?? []).map((l) => {
    const m = l.match(/^(\d+) (\d+) \.\/(.*)$/)
    return m ? { size: +m[1], mtime: +m[2], path: m[3] } : null
  }).filter(Boolean)
  return h
}

const short = (h) => (h ? h.slice(0, 7) : '')
const refShort = (n) => n.replace(/^refs\/heads\//, '').replace(/^refs\/remotes\//, '').replace(/^refs\/tags\//, '')

// a — b ning ajdodimi (commits ro'yxati bo'yicha)
function isAncestor(commits, a, b) {
  const byHash = new Map(commits.map((c) => [c.hash, c]))
  const seen = new Set()
  const stack = [b]
  while (stack.length) {
    const x = stack.pop()
    if (x === a) return true
    if (seen.has(x)) continue
    seen.add(x)
    byHash.get(x)?.parents.forEach((p) => stack.push(p))
  }
  return false
}

const OP_NAMES = {
  'rebase-merge': 'rebase', 'rebase-apply': 'rebase', MERGE_HEAD: 'merge',
  CHERRY_PICK_HEAD: 'cherry-pick', REVERT_HEAD: 'revert', BISECT_LOG: 'bisect',
}

// Ikki holat farqi: izohlar va yangi/o'zgargan narsalar to'plami (animatsiya uchun)
export function diffHolat(prev, next) {
  const izoh = []
  const d = { izoh, newCommits: new Set(), movedRefs: new Set(), changedFiles: new Set(), newFiles: new Set() }
  if (!next.repo) {
    if (prev?.repo) izoh.push({ t: 'info', m: 'Repo papkasidan chiqdingiz — bu yerda git repo yo‘q.' })
    return d
  }
  if (!prev?.repo || prev.gitdir !== next.gitdir) {
    izoh.push({ t: 'ok', m: `Repo: ${next.top}. .git papka yaratildi yoki ochildi — git butun tarixni shu papkada saqlaydi.` })
    next.files.forEach((f) => d.newFiles.add(f.path))
    next.commits.forEach((c) => d.newCommits.add(c.hash))
    return d
  }
  // commit'lar
  const oldC = new Set(prev.commits.map((c) => c.hash))
  for (const c of next.commits) {
    if (oldC.has(c.hash)) continue
    d.newCommits.add(c.hash)
    const kind = c.parents.length > 1 ? 'merge commit (ikki ota)' : 'commit'
    izoh.push({ t: 'ok', m: `Yangi ${kind}: ${short(c.hash)} «${c.subject}»` })
  }
  // ref'lar
  const pm = new Map(prev.refs.map((r) => [r.name, r.hash]))
  const nm = new Map(next.refs.map((r) => [r.name, r.hash]))
  for (const [name, hash] of nm) {
    const old = pm.get(name)
    if (name === 'refs/stash') continue
    if (old === undefined) {
      d.movedRefs.add(name)
      const what = name.startsWith('refs/tags/') ? 'teg' : name.startsWith('refs/remotes/') ? 'remote branch' : 'branch'
      izoh.push({ t: 'ok', m: `Yangi ${what} «${refShort(name)}» → ${short(hash)}. Bu .git/${name} faylidagi bitta hash, xolos.` })
    } else if (old !== hash) {
      d.movedRefs.add(name)
      const ff = isAncestor(next.commits, old, hash)
      izoh.push({ t: 'ok', m: `«${refShort(name)}» ${short(old)} → ${short(hash)} ga siljidi${ff ? ' (oldinga)' : ' — yangi tarixga ko‘chdi'}.` })
    }
  }
  for (const [name] of pm) {
    if (!nm.has(name) && name !== 'refs/stash') izoh.push({ t: 'warn', m: `«${refShort(name)}» o‘chirildi (commit'lar o‘chmaydi, faqat yorliq).` })
  }
  // HEAD
  const ph = prev.head, nh = next.head
  if (ph.ref !== nh.ref || ph.detached !== nh.detached) {
    if (nh.ref) izoh.push({ t: 'info', m: `HEAD endi «${refShort(nh.ref)}» branch'iga ishora qiladi.` })
    else izoh.push({ t: 'warn', m: `HEAD ajraldi (detached HEAD): to‘g‘ridan-to‘g‘ri ${short(nh.detached)} commit'iga ishora qilyapti, hech qaysi branch'ga emas.` })
  }
  // yetib bo'lmay qolgan commit'lar (rebase, reset, amend)
  const lost = prev.commits.filter((c) => prev.reachable.has(c.hash) && !next.reachable.has(c.hash))
  if (lost.length) izoh.push({ t: 'warn', m: `${lost.length} ta commit endi hech qaysi branch'dan ko‘rinmaydi (xira). Ular o‘chmagan — reflog orqali qaytarish mumkin.` })
  // index va ishchi papka
  const pst = new Map(prev.status.map((s) => [s.path, s]))
  const staged = next.status.filter((s) => s.x !== ' ' && s.x !== '?' && pst.get(s.path)?.x !== s.x)
  if (staged.length) izoh.push({ t: 'info', m: `Index'ga (staging) olindi: ${staged.map((s) => s.path).join(', ')}` })
  const conflicts = next.status.filter((s) => s.x === 'U' || s.y === 'U' || (s.x === 'A' && s.y === 'A') || (s.x === 'D' && s.y === 'D'))
  if (conflicts.length) izoh.push({ t: 'err', m: `Konflikt: ${conflicts.map((s) => s.path).join(', ')}. Faylni tuzating, keyin git add.` })
  // jarayondagi amal
  const po = new Set(prev.op), no = new Set(next.op)
  for (const o of no) if (!po.has(o)) izoh.push({ t: 'warn', m: `${OP_NAMES[o] ?? o} jarayoni davom etmoqda (.git/${o} bor).` })
  for (const o of po) if (!no.has(o)) izoh.push({ t: 'ok', m: `${OP_NAMES[o] ?? o} jarayoni tugadi.` })
  if (next.stash.length !== prev.stash.length) izoh.push({ t: 'info', m: `Stash'da endi ${next.stash.length} ta yozuv.` })
  // .git fayllari
  const pf = new Map(prev.files.map((f) => [f.path, f]))
  for (const f of next.files) {
    const o = pf.get(f.path)
    if (!o) d.newFiles.add(f.path)
    else if (o.size !== f.size || o.mtime !== f.mtime) d.changedFiles.add(f.path)
  }
  const newObj = [...d.newFiles].filter((p) => p.startsWith('objects/')).length
  if (newObj) izoh.push({ t: 'info', m: `.git/objects ga ${newObj} ta yangi obyekt yozildi.` })
  return d
}
