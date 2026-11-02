// Joriy qator va repo holatiga qarab maslahatlar: [{ add, full, d }]
// add — kursordan keyin qo'shiladigan qism (xira matn), full — tanlansa qator qanday bo'ladi, d — izoh.
import { GIT, SHELL, ORDER } from './katalog.js'

const byPrefix = (items, p) => items.filter(([k]) => k.startsWith(p) && k !== p)

function argItems(kind, holat, sub) {
  if (Array.isArray(kind)) return kind.map((k) => [k, ''])
  if (!holat?.repo) return []
  const heads = holat.refs.filter((r) => r.name.startsWith('refs/heads/')).map((r) => r.name.slice(11))
  const cur = holat.head?.ref?.slice(11)
  if (kind === 'branch') {
    // o'tish/birlashtirishda joriy branch'ni taklif qilish ma'nosiz
    const list = ['switch', 'checkout', 'merge', 'rebase'].includes(sub) ? heads.filter((b) => b !== cur) : heads
    return list.map((b) => [b, 'branch'])
  }
  if (kind === 'file') {
    const changed = holat.status.map((s) => [s.path, s.x === '?' ? 'kuzatilmagan' : 'o‘zgargan'])
    return changed.length ? changed : holat.headFiles.map((f) => [f, 'fayl'])
  }
  if (kind === 'commit') {
    return [...heads.map((b) => [b, 'branch']), ['HEAD~1', 'bitta oldingi commit'],
      ...holat.commits.filter((c) => holat.reachable.has(c.hash)).slice(0, 6).map((c) => [c.hash.slice(0, 7), c.subject])]
  }
  if (kind === 'remote') return holat.refs.some((r) => r.name.startsWith('refs/remotes/origin/')) ? [['origin', 'remote']] : []
  return []
}

export function suggest(line, holat) {
  if (!line.trim()) return []
  const parts = line.split(' ')
  const last = parts[parts.length - 1]
  const head = parts.slice(0, -1).join(' ')
  const make = (items) => items.slice(0, 7).map(([k, d]) => ({ add: k.slice(last.length) + (k.endsWith('/') ? '' : ' '), full: (head ? head + ' ' : '') + k + ' ', d }))

  if (parts.length === 1) {
    const shell = Object.entries(SHELL)
    const hits = byPrefix(shell, last)
    // "git" eng birinchi
    hits.sort((a, b) => (a[0] === 'git' ? -1 : b[0] === 'git' ? 1 : 0))
    return make(hits)
  }
  if (parts[0] !== 'git') return []
  const sub = parts[1]
  if (parts.length === 2) {
    const names = Object.keys(GIT).sort((a, b) => {
      const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b)
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    })
    return make(byPrefix(names.map((n) => [n, GIT[n].d]), last))
  }
  const spec = GIT[sub]
  if (!spec) return []
  const used = new Set(parts.slice(2, -1))
  if (last.startsWith('-')) return make(byPrefix(Object.entries(spec.flags).filter(([f]) => !used.has(f)), last))
  const args = byPrefix(argItems(spec.args, holat, sub).filter(([a]) => !used.has(a)), last)
  if (last === '' && !args.length) return make(Object.entries(spec.flags).filter(([f]) => !used.has(f)))
  return make(args)
}
