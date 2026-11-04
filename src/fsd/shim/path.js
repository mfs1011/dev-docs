// Node `path` (posix) — Steiger plugin, @feature-sliced/filesystem va tsconfck ishlatadigan qismi
export const sep = '/'
export const delimiter = ':'
export function normalize(p) {
  const abs = p.startsWith('/')
  const out = []
  for (const s of p.split('/')) {
    if (!s || s === '.') continue
    if (s === '..') {
      if (out.length && out.at(-1) !== '..') out.pop()
      else if (!abs) out.push('..')
    } else out.push(s)
  }
  const r = (abs ? '/' : '') + out.join('/')
  return r || (abs ? '/' : '.')
}
export const isAbsolute = (p) => p.startsWith('/')
export const join = (...a) => normalize(a.filter(Boolean).join('/'))
export function resolve(...a) {
  let r = ''
  for (let i = a.length - 1; i >= 0 && !r.startsWith('/'); i--) r = a[i] + (r ? '/' + r : '')
  return normalize(r.startsWith('/') ? r : '/' + r)
}
export function dirname(p) {
  const n = normalize(p)
  const i = n.lastIndexOf('/')
  return i <= 0 ? (n.startsWith('/') ? '/' : '.') : n.slice(0, i)
}
export function basename(p, ext) {
  const b = normalize(p).split('/').pop()
  return ext && b.endsWith(ext) ? b.slice(0, -ext.length) : b
}
export function extname(p) {
  const b = basename(p)
  const i = b.lastIndexOf('.')
  return i > 0 ? b.slice(i) : ''
}
export function relative(from, to) {
  const a = resolve(from).split('/').filter(Boolean)
  const b = resolve(to).split('/').filter(Boolean)
  let i = 0
  while (i < a.length && a[i] === b[i]) i++
  return [...Array(a.length - i).fill('..'), ...b.slice(i)].join('/')
}
export const parse = (p) => ({ root: p.startsWith('/') ? '/' : '', dir: dirname(p), base: basename(p), ext: extname(p), name: basename(p, extname(p)) })
export const format = (o) => (o.dir ? o.dir + '/' : '') + (o.base ?? (o.name ?? '') + (o.ext ?? ''))
export const toNamespacedPath = (p) => p
const path = { sep, delimiter, normalize, isAbsolute, join, resolve, dirname, basename, extname, relative, parse, format, toNamespacedPath }
path.posix = path
export const posix = path
export default path
