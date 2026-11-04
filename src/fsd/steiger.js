// Haqiqiy Steiger qoidalari brauzerda: trenajor loyihasi xotiradagi fayl tizimiga yoziladi, Steiger CLI
// qanday daraxt qursa, xuddi shunday daraxt quriladi va tavsiya etilgan (recommended) qoidalar bajariladi.
// Versiya kitobdagi bilan bir xil: steiger 0.7.0 + @feature-sliced/steiger-plugin 0.8.0 (FSD 33-bob).
import { ornat } from './shim/fs.js'

export const ILDIZ = '/loyiha'
const TSCONFIG = JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { '@/*': ['./src/*'] }, module: 'esnext', moduleResolution: 'bundler', jsx: 'react-jsx' } })

let plugin = null
async function yukla() {
  if (!plugin) {
    plugin = (await import('@feature-sliced/steiger-plugin')).default
    await globalThis.__steigerTayyor
  }
  return plugin
}

function daraxt(yollar, papka) {
  const bolalar = new Map()
  for (const y of yollar) {
    if (!y.startsWith(papka + '/')) continue
    const qolgan = y.slice(papka.length + 1)
    const [bosh, ...keyin] = qolgan.split('/')
    if (!bolalar.has(bosh)) bolalar.set(bosh, keyin.length ? 'folder' : 'file')
  }
  return {
    type: 'folder',
    path: papka,
    children: [...bolalar].sort(([a], [b]) => a.localeCompare(b)).map(([n, t]) => (t === 'file' ? { type: 'file', path: `${papka}/${n}` } : daraxt(yollar, `${papka}/${n}`))),
  }
}

// fayllar: { 'src/pages/home/index.ts': '…' } → [{ qoida, yol, xabar, qator }]
export async function tekshir(fayllar) {
  const fsd = await yukla()
  const toliq = { [`${ILDIZ}/tsconfig.json`]: TSCONFIG }
  for (const [p, t] of Object.entries(fayllar)) toliq[`${ILDIZ}/${p}`] = t
  ornat(toliq)
  const root = daraxt(Object.keys(toliq), `${ILDIZ}/src`)
  const yoqilgan = new Set(Object.entries(Object.assign({}, ...fsd.configs.recommended.map((c) => c.rules ?? {}))).filter(([, s]) => s !== 'off').map(([n]) => n))
  const out = []
  for (const r of fsd.plugin.ruleDefinitions) {
    if (!yoqilgan.has(r.name)) continue
    const { diagnostics } = await r.check(root, {})
    for (const d of diagnostics) {
      out.push({ qoida: r.name.replace(/^fsd\//, ''), yol: d.location.path.slice(ILDIZ.length + 1), xabar: d.message, qator: d.location.start?.line ?? null })
    }
  }
  return out.sort((a, b) => a.yol.localeCompare(b.yol) || a.qoida.localeCompare(b.qoida))
}
