// Steiger (va tsconfck) uchun xotiradagi fayl tizimi: trenajor loyihasi fayllari shu yerda turadi.
// Faqat ular ishlatadigan funksiyalar: existsSync, statSync, readFileSync, stat, promises.
const fayllar = new Map() // '/loyiha/src/app/index.ts' → matn
let vaqt = 1

export function ornat(map) {
  fayllar.clear()
  for (const [p, t] of Object.entries(map)) fayllar.set(p, t)
  vaqt++ // Steiger import keshi mtime bo'yicha — har tekshiruvda yangilanadi
}

const papkami = (p) => {
  const pref = p.endsWith('/') ? p : p + '/'
  for (const k of fayllar.keys()) if (k.startsWith(pref)) return true
  return false
}
const yoq = (p) => Object.assign(new Error(`ENOENT: no such file or directory, '${p}'`), { code: 'ENOENT' })
const statObj = (p) => {
  if (fayllar.has(p)) return { mtimeMs: vaqt, isFile: () => true, isDirectory: () => false }
  if (papkami(p)) return { mtimeMs: vaqt, isFile: () => false, isDirectory: () => true }
  return null
}

export const existsSync = (p) => fayllar.has(String(p)) || papkami(String(p))
export function statSync(p, o) {
  const s = statObj(String(p))
  if (!s && o?.throwIfNoEntry !== false) throw yoq(p)
  return s ?? undefined
}
export function readFileSync(p) {
  if (!fayllar.has(String(p))) throw yoq(p)
  return fayllar.get(String(p))
}
export function stat(p, cb) {
  const s = statObj(String(p))
  queueMicrotask(() => (s ? cb(null, s) : cb(yoq(p))))
}
export function readdir(p, cb) {
  queueMicrotask(() => cb(null, []))
}
export const promises = {
  stat: async (p) => statSync(p),
  readFile: async (p) => readFileSync(p),
}
export default { existsSync, statSync, readFileSync, stat, readdir, promises }
