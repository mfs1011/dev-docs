// Docker trenajori terminali uchun xira maslahatlar: [{ add, full, d }] (Terminal.vue shakli).
// Buyruqlar va bayroqlar ro'yxati haqiqiy `docker --help` matnlaridan; tavsiflar — o'zbekcha (asosiylari) yoki help'dagi.
import { MATN } from './data/matnlar.js'
import { oila } from './dasturlar.js'

const UZ = {
  run: 'image\'dan konteyner yaratib ishga tushirish', ps: 'konteynerlar ro‘yxati (-a — hammasi)', images: 'image\'lar ro‘yxati',
  pull: 'image\'ni registry\'dan yuklash', exec: 'ishlayotgan konteyner ichida buyruq', logs: 'konteyner loglari (-f — kuzatish)',
  stop: 'to‘xtatish (SIGTERM, 10 s dan keyin SIGKILL)', start: 'to‘xtagan konteynerni ishga tushirish', rm: 'konteynerni o‘chirish (-f — ishlayotganini ham)',
  rmi: 'image\'ni o‘chirish', inspect: 'to‘liq ma’lumot (JSON)', port: 'portlar xaritasi', network: 'tarmoqlar', volume: 'volume\'lar (ma’lumot ombori)',
  system: 'disk joyi va tozalash', image: 'image\'lar bilan ishlash', container: 'konteynerlar bilan ishlash', tag: 'image\'ga yangi nom (teg)',
  restart: 'qayta ishga tushirish', kill: 'darhol o‘ldirish (SIGKILL)', create: 'konteyner yaratish (ishga tushirmasdan)', top: 'konteyner jarayonlari',
  stats: 'resurs sarfi', rename: 'nomini o‘zgartirish', diff: 'fayl tizimidagi o‘zgarishlar', history: 'image qatlamlari tarixi', version: 'versiyalar',
  info: 'tizim haqida', attach: 'ishlayotgan konteynerga ulanish', pause: 'muzlatish', unpause: 'muzlatishdan chiqarish', wait: 'tugashini kutish',
  events: 'hodisalar oqimi', ls: 'ro‘yxat', create_n: 'tarmoq yaratish', connect: 'konteynerni tarmoqqa ulash', disconnect: 'tarmoqdan uzish',
  prune: 'ishlatilmayotganlarini tozalash', df: 'disk joyi',
}
const HOST = {
  docker: 'Docker CLI', curl: 'HTTP so‘rov (masalan curl localhost:8080)', ls: 'fayllar', cat: 'fayl mazmuni', echo: 'matn chiqarish',
  mkdir: 'papka yaratish', cd: 'papkaga o‘tish', rm: 'o‘chirish', clear: 'ekranni tozalash', grep: 'qator qidirish', head: 'boshi',
  wc: 'sanash', sleep: 'kutish', help: 'trenajor yordami', history: 'buyruqlar tarixi', pwd: 'joriy papka', touch: 'bo‘sh fayl',
}

function buyruqlarHelpdan(matn) {
  const r = {}
  let ichida = false
  for (const q of (matn ?? '').split('\n')) {
    if (/Commands:$/.test(q)) { ichida = true; continue }
    if (!q.trim()) { ichida = false; continue }
    const m = ichida && /^ {2}([a-z][\w-]*)\*?\s{2,}(.+)$/.exec(q)
    if (m) r[m[1]] = m[2]
  }
  return r
}
const ASOSIY = buyruqlarHelpdan(MATN.help[''])
const GURUH = {}
for (const g of ['container', 'image', 'network', 'volume', 'system']) GURUH[g] = buyruqlarHelpdan(MATN.help[g])

function bayroqlarHelpdan(matn) {
  const r = []
  for (const q of (matn ?? '').split('\n')) {
    const m = /^ {2}(?:-(\w), | {4})(--[\w-]+)(?: \w+)?\s{2,}(.+)$/.exec(q)
    if (m) { r.push([m[2], m[3]]); if (m[1]) r.push(['-' + m[1], m[3]]) }
  }
  return r
}

const KONTEYNER_ARG = new Set(['stop', 'start', 'restart', 'kill', 'rm', 'logs', 'exec', 'inspect', 'port', 'top', 'stats', 'rename', 'diff', 'attach', 'pause', 'unpause', 'wait'])
const IMAGE_ARG = new Set(['run', 'create', 'pull', 'rmi', 'history', 'tag'])
const IMAGE_BAYROQ_OLDI = new Set(['-v', '--volume', '-p', '--publish', '-e', '--env', '--name', '-w', '--workdir', '--network', '--net', '-u', '--user', '--entrypoint', '--mount', '--tmpfs', '-m', '--memory', '--cpus', '--restart', '--hostname', '-h', '--env-file', '--label', '-l', '--stop-timeout'])

export function dockerSuggest(daemon) {
  const KATALOG = ['hello-world', 'alpine', 'nginx:1.29', 'debian', 'debian:trixie', 'busybox:1.37']
  return (line, holat) => {
    if (holat?.konteyner) return konteynerSuggest(line, holat.konteyner)
    if (!line.trim()) return []
    const parts = line.split(' ')
    const last = parts[parts.length - 1]
    const head = parts.slice(0, -1).join(' ')
    const make = (items) => items.filter(([k]) => k.startsWith(last) && k !== last).slice(0, 7).map(([k, d]) => ({ add: k.slice(last.length) + ' ', full: (head ? head + ' ' : '') + k + ' ', d }))
    if (parts.length === 1) return make(Object.entries(HOST))
    if (parts[0] !== 'docker') return []
    const args = parts.slice(1, -1).filter(Boolean)
    if (!args.length) return make([...Object.entries(ASOSIY)].map(([k, d]) => [k, UZ[k] ?? d]))
    let buyruq = args[0], qolgan = args.slice(1)
    if (GURUH[buyruq]) {
      if (!qolgan.length) return make(Object.entries(GURUH[buyruq]).map(([k, d]) => [k, UZ[k] ?? d]))
      buyruq = `${buyruq} ${qolgan[0]}`
      qolgan = qolgan.slice(1)
    }
    if (last.startsWith('-')) return make(bayroqlarHelpdan(MATN.help[buyruq] ?? MATN.help[{ 'container ls': 'ps', 'image ls': 'images', 'image rm': 'rmi' }[buyruq]]))
    const oldingi = parts[parts.length - 2]
    const asos = buyruq.split(' ').pop()
    const pozitsion = qolgan.filter((x, i) => !x.startsWith('-') && !IMAGE_BAYROQ_OLDI.has(qolgan[i - 1]))
    if ((oldingi === '-v' || oldingi === '--volume') && !last.includes(':')) return make([...daemon.volumelar.keys()].map((v) => [v + ':', 'volume']))
    if (oldingi === '--network' || oldingi === '--net' || (buyruq.startsWith('network ') && ['rm', 'inspect', 'connect', 'disconnect'].includes(asos) && pozitsion.length === 0)) return make([...daemon.tarmoqlar.values()].map((t) => [t.nom, `${t.drayver} tarmoq`]))
    if (buyruq.startsWith('volume ') && ['rm', 'inspect'].includes(asos)) return make([...daemon.volumelar.keys()].map((v) => [v, 'volume']))
    if (IMAGE_BAYROQ_OLDI.has(oldingi)) return []
    if ((IMAGE_ARG.has(asos) || buyruq === 'image inspect' || buyruq === 'image rm') && pozitsion.length === 0) {
      const bor = new Set()
      for (const t of daemon.teglar.keys()) if (!t.includes('@')) bor.add(t.replace(/:latest$/, ''))
      return make([...new Set([...bor, ...KATALOG])].map((x) => [x, bor.has(x) ? 'yuklangan' : 'Docker Hub\'dan yuklanadi']))
    }
    if (KONTEYNER_ARG.has(asos) && (pozitsion.length === 0 || ['stop', 'start', 'rm', 'kill', 'restart', 'inspect'].includes(asos))) {
      const kerak = asos === 'start' ? (k) => k.holat !== 'running' : ['stop', 'kill', 'exec', 'top', 'pause', 'attach', 'port'].includes(asos) ? (k) => k.holat === 'running' : () => true
      return make([...daemon.konteynerlar.values()].filter(kerak).map((k) => [k.nom, `${k.image} — ${k.holat}`]))
    }
    if (asos === 'exec' && pozitsion.length === 1) return make([['sh', 'qobiq'], ['ls', 'fayllar'], ['cat', 'fayl mazmuni'], ['hostname', 'konteyner nomi'], ['ps', 'jarayonlar']])
    return []
  }
}

const KONT = {
  ls: 'fayllar', cat: 'fayl mazmuni', echo: 'matn', cd: 'papkaga o‘tish', pwd: 'joriy papka', hostname: 'konteyner nomi (ID)', ps: 'jarayonlar',
  env: 'muhit o‘zgaruvchilari', exit: 'chiqish (konteyner to‘xtaydi, agar u asosiy jarayon bo‘lsa)', wget: 'HTTP so‘rov', ping: 'ulanish', 'ip': 'tarmoq (ip addr)',
  df: 'disk', id: 'foydalanuvchi', whoami: 'kimligim', mkdir: 'papka', touch: 'fayl', rm: 'o‘chirish', uname: 'yadro', nslookup: 'DNS so‘rov',
}
function konteynerSuggest(line, k) {
  const parts = line.split(' ')
  if (parts.length !== 1 || !parts[0]) return []
  const last = parts[0]
  const bor = oila(k) === 'busybox' ? KONT : Object.fromEntries(Object.entries(KONT).filter(([x]) => !['ps', 'wget', 'ping', 'ip', 'nslookup'].includes(x)))
  return Object.entries(bor).filter(([x]) => x.startsWith(last) && x !== last).slice(0, 7).map(([x, d]) => ({ add: x.slice(last.length) + ' ', full: x + ' ', d }))
}
