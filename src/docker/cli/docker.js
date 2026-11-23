// `docker` buyrug'i (Docker CLI 29.9.3). Bayroqlar ro'yxati haqiqiy `--help` matnlaridan olinadi (MATN.help),
// chiqish formatlari va xato matnlari — VPS yozuvlaridan (docker-trenajor/yozuv/natija/yozuvlar).
import { bayroqlar, BayroqXato } from './bayroq.js'
import { shablon, tabwriter, goJson, goJsonIndent, ShablonXato } from './shablon.js'
import { hajm, davomiylik, rfc3339, rfc3339s, goVaqt } from '../birlik.js'
import { DaemonXato, nomTahlil, nomMatn } from '../dvigatel.js'
import { pullAnimatsiya } from './pull.js'
import { signalRaqam, Jarayon, dasturTop, envObyekt } from '../dasturlar.js'
import { MATN } from '../data/matnlar.js'
import { Toxtatildi } from '../qobiq/ijro.js'

// ------------------------------------------------------------------------------------- help → bayroq spek
const spekKesh = new Map()
// yozuvda --help'i yo'q buyruqlar uchun qo'lda (docs.docker.com/reference/cli/docker/system/events/)
const QOLDA = {
  events: { since: { tur: 'str' }, until: { tur: 'str' }, filter: { q: 'f', tur: 'list' }, format: { tur: 'str' } },
}
const SPEK_ZAXIRA = { 'container inspect': 'inspect', 'network disconnect': 'network connect', unpause: 'start', pause: 'start', wait: 'start', attach: 'start', 'compose version': 'version', 'buildx version': 'version', 'system info': 'info' }
function spek(buyruq) {
  if (spekKesh.has(buyruq)) return spekKesh.get(buyruq)
  if (QOLDA[buyruq]) { spekKesh.set(buyruq, { ...QOLDA[buyruq], help: { tur: 'bool' } }); return spekKesh.get(buyruq) }
  // alias: `history` → `image history` help'i va h.k.
  const asl = MATN.help[buyruq] ? buyruq : Object.keys(ALIAS).find((k) => ALIAS[k] === buyruq && MATN.help[k])
  if (asl && asl !== buyruq) buyruq = asl
  const h = MATN.help[buyruq] ?? (SPEK_ZAXIRA[buyruq] === 'start' ? '' : MATN.help[SPEK_ZAXIRA[buyruq]])
  const s = {}
  // turi: bayroq nomidan keyingi so'z (yo'q — bool). list/filter/mount/… takrorlanadi
  const turi = (t) => (!t ? 'bool' : ['list', 'filter', 'mount', 'stringArray', 'ulimit', 'gpu-request', 'pref'].includes(t) ? 'list' : t === 'int' ? 'int' : 'str')
  if (h) {
    for (const q of h.split('\n')) {
      const m = /^ {2}(?:-(\w), | {4})--([\w-]+)(?: (\w[\w-]*))?(?:\s{2,}|$)/.exec(q)
      if (m) s[m[2]] = { q: m[1], tur: turi(m[3]) }
    }
  }
  s.help = { tur: 'bool' }
  spekKesh.set(buyruq, s)
  return s
}
const usage = (buyruq) => (MATN.help[buyruq] ?? '').split('\n').find((q) => q.startsWith('Usage:')) ?? `Usage:  docker ${buyruq}`

// docker CLI xatolari
class CliXato extends Error { constructor(m, kod = 1) { super(m); this.kod = kod } }

const ALIAS = {
  'container ls': 'ps', 'container list': 'ps', 'container ps': 'ps', 'container run': 'run', 'container create': 'create',
  'container start': 'start', 'container stop': 'stop', 'container restart': 'restart', 'container kill': 'kill', 'container rm': 'rm',
  'container remove': 'rm', 'container logs': 'logs', 'container exec': 'exec', 'container inspect': 'container inspect', 'container port': 'port',
  'container top': 'top', 'container stats': 'stats', 'container rename': 'rename', 'container diff': 'diff', 'container pause': 'pause',
  'container unpause': 'unpause', 'container wait': 'wait', 'container prune': 'container prune', 'container attach': 'attach',
  'image ls': 'images', 'image list': 'images', 'image pull': 'pull', 'image rm': 'rmi', 'image remove': 'rmi', 'image tag': 'tag',
  'image history': 'history', 'image inspect': 'image inspect', 'image prune': 'image prune', 'image push': 'push',
  'image build': 'build', 'builder build': 'build', 'buildx build': 'build',
}
const GURUHLAR = ['container', 'image', 'network', 'volume', 'system', 'compose', 'buildx', 'builder', 'context', 'manifest', 'plugin', 'swarm', 'trust', 'scout']

// ------------------------------------------------------------------------------------- kirish nuqtasi
export async function docker(argv, ctx, d) {
  const a = argv.slice(1)
  const err = (m) => ctx.stderr.yoz(m)
  // global bayroqlar
  while (a[0] && a[0].startsWith('-')) {
    if (a[0] === '-v' || a[0] === '--version') { ctx.stdout.yoz(MATN.dockerV); return 0 }
    if (a[0] === '--help' || a[0] === '-h') { ctx.stdout.yoz(MATN.help['']); return 0 }
    if (a[0] === '-D' || a[0] === '--debug') { a.shift(); continue }
    err(`unknown flag: ${a[0]}\nSee 'docker --help'.\n\n${usage('')}\n\nRun 'docker --help' for more information\n`); return 125
  }
  if (!a.length) { ctx.stdout.yoz(MATN.help['']); return 0 }
  let nom = a[0], qolgan = a.slice(1)
  if (GURUHLAR.includes(nom)) {
    const ichki = qolgan[0]
    if (!ichki || ichki === '--help') {
      if (MATN.help[nom]) { ctx.stdout.yoz(MATN.help[nom]); return 0 }
    } else if (!ichki.startsWith('-')) {
      nom = `${nom} ${ichki}`
      qolgan = qolgan.slice(1)
    }
  }
  const aslNom = nom
  nom = ALIAS[nom] ?? nom
  if (qolgan.includes('--help') && MATN.help[aslNom] && !['run', 'exec', 'create'].includes(nom)) { ctx.stdout.yoz(MATN.help[aslNom]); return 0 }
  const f = BUYRUQLAR[nom]
  if (!f) {
    if (MATN.help[nom] || GURUHLAR.includes(nom.split(' ')[0])) {
      err(`\x1b[33mtrenajor: \`docker ${nom}\` simulyatorda hali yo'q.\x1b[0m\n`)
      return 1
    }
    err(`docker: unknown command: docker ${a[0]}\n\nRun 'docker --help' for more information\n`)
    return 1
  }
  if (qolgan.includes('--help') && MATN.help[nom] && !['run', 'exec', 'create'].includes(nom)) { ctx.stdout.yoz(MATN.help[nom]); return 0 }
  // API so'rovi vaqti (yozuvlarda docker buyruqlari ~120–200 ms)
  await new Promise((r) => setTimeout(r, 70 + Math.random() * 60))
  try {
    return (await f(qolgan, ctx, d, nom)) ?? 0
  } catch (e) {
    if (e instanceof BayroqXato) { err(`${e.message}\n\n${usage(nom)}\n\nRun 'docker ${nom} --help' for more information\n`); return 125 }
    if (e instanceof CliXato) { err(e.message); return e.kod }
    if (e instanceof DaemonXato) { err((e.prefiks ? 'Error response from daemon: ' : '') + e.message + '\n'); return e.kod ?? 1 }
    if (e instanceof ShablonXato) { err(e.message + '\n'); return 1 }
    if (e instanceof Toxtatildi) throw e
    throw e
  }
}

// bayroqlar + `--help` (run/exec da interspersed=false, shuning uchun alohida)
function tahlil(nom, args, o = {}) {
  const r = bayroqlar(args, spek(nom), o)
  return r
}
const kam = (nom, n, so = 'at least') => new CliXato(`docker: '${'docker ' + nom}' requires ${so} ${n} argument${n > 1 ? 's' : ''}\n\n${usage(nom)}\n\nSee 'docker ${nom} --help' for more information\n`, 1)
const aniq = (nom, n) => new CliXato(`docker: '${'docker ' + nom}' requires ${n} argument${n > 1 ? 's' : ''}\n\n${usage(nom)}\n\nSee 'docker ${nom} --help' for more information\n`, 1)

// ------------------------------------------------------------------------------------- formatlash yordamchilari
const qisqaId = (id) => id.replace(/^sha256:/, '').slice(0, 12)
const oldin = (ms) => davomiylik(Date.now() - ms) + ' ago'
function holatMatn(k) {
  if (k.holat === 'running') return `Up ${davomiylik(Date.now() - k.boshlandi)}`
  if (k.holat === 'paused') return `Up ${davomiylik(Date.now() - k.boshlandi)} (Paused)`
  if (k.holat === 'restarting') return `Restarting (${k.chiqishKodi}) ${oldin(k.tugadi)}`
  if (k.holat === 'exited') return `Exited (${k.chiqishKodi}) ${oldin(k.tugadi)}`
  return 'Created'
}
const argQuote = (x) => (/[\s"'$]/.test(x) || x === '' ? `'${x}'` : x)
function buyruqMatn(k, toliq = false) {
  const s = [...k.config.entrypoint, ...k.config.cmd].map(argQuote).join(' ')
  if (toliq) return `"${s}"`
  const r = [...s]
  return `"${r.length > 20 ? r.slice(0, 19).join('') + '…' : s}"`
}
function portlarMatn(k) {
  if (k.holat !== 'running' && k.holat !== 'paused') return ''
  const qism = []
  const berildi = new Set()
  for (const b of k.portBerildi) { qism.push(`${b.ip === '::' ? '[::]' : b.ip}:${b.tashqi}->${b.ichki}/${b.proto}`); berildi.add(`${b.ichki}/${b.proto}`) }
  for (const e of Object.keys(k.config.exposed)) if (!berildi.has(e)) qism.push(e)
  return qism.join(', ')
}
const imageNomi = (d, k) => {
  // foydalanuvchi bergan nom hali shu image'ga ishora qilsa — o'sha, aks holda qisqa ID
  const im = d.imageTop(k.image)
  return im && im.id === k.imageId ? k.image : qisqaId(k.imageId)
}

// Go shablon uchun konteyner "satri" (docker ps --format)
function psSatr(d, k, { toliq = false, hajmi = false } = {}) {
  const tarmoqlar = [...(k.tarmoqlar.size ? k.tarmoqlar.keys() : (k.oldingiTarmoqlar ?? []))].map((id) => d.tarmoqlar.get(id)?.nom).filter(Boolean)
  return {
    ID: toliq ? k.id : k.id.slice(0, 12), Image: imageNomi(d, k), Command: buyruqMatn(k, toliq), CreatedAt: goVaqt(k.yaratildi),
    RunningFor: oldin(k.yaratildi), Ports: portlarMatn(k), State: k.holat, Status: holatMatn(k), Names: k.nom,
    Labels: Object.entries(k.config.labels).map(([a, b]) => `${a}=${b}`).join(','), Mounts: k.mountlar.filter((m) => m.tur === 'volume').map((m) => (m.anonim ? m.nom.slice(0, 12) + '…' : m.nom)).join(','),
    Networks: (tarmoqlar.length ? tarmoqlar : [k.hostConfig.tarmoq]).join(','), LocalVolumes: String(k.mountlar.filter((m) => m.tur === 'volume').length),
    Size: hajmi ? `${hajm(d.konteynerHajm(k), 3)} (virtual ${hajm(d.konteynerHajm(k) + k.im.kat.virtual, 3)})` : '0B',
    HealthStatus: 'none', Platform: { architecture: 'amd64', os: 'linux' },
    Label: (x) => k.config.labels[x] ?? '',
  }
}
// konteyner yozuv qatlami hajmi (yozuvlar: nginx ishlaganda 86kB, alpine `true` — 4.096kB)

const PS_SARLAVHA = { ID: 'CONTAINER ID', Image: 'IMAGE', Command: 'COMMAND', CreatedAt: 'CREATED AT', RunningFor: 'CREATED', Ports: 'PORTS', State: 'STATE', Status: 'STATUS', Names: 'NAMES', Labels: 'LABELS', Mounts: 'MOUNTS', Networks: 'NETWORKS', LocalVolumes: 'LOCAL VOLUMES', Size: 'SIZE', Repository: 'REPOSITORY', Tag: 'TAG', Digest: 'DIGEST', CreatedSince: 'CREATED', Name: 'NAME', Driver: 'DRIVER', Scope: 'SCOPE', Mountpoint: 'MOUNTPOINT', Container: 'CONTAINER', CPUPerc: 'CPU %', MemUsage: 'MEM USAGE / LIMIT', MemPerc: 'MEM %', NetIO: 'NET I/O', BlockIO: 'BLOCK I/O', PIDs: 'PIDS', CreatedBy: 'CREATED BY', Comment: 'COMMENT', Type: 'TYPE', TotalCount: 'TOTAL', Active: 'ACTIVE', Reclaimable: 'RECLAIMABLE', IPv6: 'IPV6', Internal: 'INTERNAL' }

// --format: "table ...", "json", shablon
function formatla(ctx, format, satrlar, standart, sarlavhalar = {}) {
  if (format === 'json') { for (const s of satrlar) ctx.stdout.yoz(goJson(jsonga(s)) + '\n'); return }
  let f = format ?? standart
  const jadval = f.startsWith('table')
  if (jadval) f = f.replace(/^table\s*/, '') || standart.replace(/^table\s*/, '')
  f = f.replace(/\\t/g, '\t').replace(/\\n/g, '\n')
  const sh = shablon(f)
  let chiqish = ''
  if (jadval) {
    const sarlavha = f.replace(/\{\{\s*\.(\w+)\s*\}\}/g, (_, n) => sarlavhalar[n] ?? PS_SARLAVHA[n] ?? n.toUpperCase()).replace(/\{\{[^}]*\}\}/g, '')
    chiqish += sarlavha + '\n'
  }
  for (const s of satrlar) chiqish += sh(s) + '\n'
  ctx.stdout.yoz(jadval ? tabwriter(chiqish) : chiqish)
}
// Go map'lari JSON'da kalit bo'yicha tartiblanadi
const jsonga = (s) => Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v !== 'function').sort(([a], [b]) => (a < b ? -1 : 1)))

// ------------------------------------------------------------------------------------- filtrlar (ps)
function filtr(fl, nom) {
  const r = {}
  for (const x of fl) { const i = x.indexOf('='); if (i < 0) throw new CliXato(`invalid argument "${x}" for "-f, --filter" flag: bad format of filter (expected name=value)\n\n${usage(nom)}\n\nRun 'docker ${nom} --help' for more information\n`, 125); (r[x.slice(0, i)] ??= []).push(x.slice(i + 1)) }
  return r
}

// ------------------------------------------------------------------------------------- buyruqlar
const BUYRUQLAR = {
  version(args, ctx) { const { f } = tahlil('version', args); if (f.format) { ctx.stdout.yoz(shablon(f.format)({ Client: { Version: '29.9.3', APIVersion: '1.56', Os: 'linux', Arch: 'amd64' }, Server: { Version: '29.9.3', APIVersion: '1.56', Os: 'linux', Arch: 'amd64' } }) + '\n'); return 0 } ctx.stdout.yoz(MATN.version); return 0 },
  info(args, ctx, d) {
    const k = [...d.konteynerlar.values()]
    let m = MATN.info.replace('{id}', d.id).replace('{k}', k.length).replace('{r}', k.filter((x) => x.holat === 'running').length)
      .replace('{p}', k.filter((x) => x.holat === 'paused').length).replace('{s}', k.filter((x) => x.holat !== 'running' && x.holat !== 'paused').length).replace('{i}', d.imagelar.size)
    const { f } = tahlil('info', args)
    if (f.format) { ctx.stdout.yoz(shablon(f.format)({ ServerVersion: '29.9.3', Containers: k.length, Images: d.imagelar.size, Driver: 'overlayfs', OperatingSystem: 'Ubuntu 26.04.1 LTS', NCPU: 1, Name: 'lab' }) + '\n'); return 0 }
    ctx.stdout.yoz(m)
    return 0
  },
  'compose version': (a, ctx) => { ctx.stdout.yoz(MATN.compose); return 0 },
  'buildx version': (a, ctx) => { ctx.stdout.yoz(MATN.buildx); return 0 },

  // ------------------------------------------------------------- image'lar
  async pull(args, ctx, d) {
    const { f, pos } = tahlil('pull', args)
    if (pos.length !== 1) throw aniq('pull', 1)
    return pull(pos[0], ctx, d, { jim: f.quiet, toliqNom: true })
  },
  images(args, ctx, d) {
    const { f, pos } = tahlil('images', args)
    let roy = []
    for (const im of d.imagelar.values()) {
      const nomlar = [...im.teglar]
      if (!nomlar.length) { if (f.all) roy.push({ im, nom: null }); continue }
      for (const n of nomlar) roy.push({ im, nom: n })
    }
    if (pos[0]) roy = roy.filter((r) => r.nom && (r.nom.split(/[:@]/)[0] === pos[0] || r.nom === pos[0] || r.nom === `${pos[0]}:latest`))
    roy.sort((a, b) => (a.nom ?? '￿').localeCompare(b.nom ?? '￿'))
    if (f.quiet) { ctx.stdout.yoz([...new Set(roy.map((r) => qisqaId(r.im.id)))].map((x) => x + '\n').join('')); return 0 }
    const satr = (r) => {
      const [repo, tag] = r.nom ? (r.nom.includes('@') ? [r.nom.split('@')[0], '<none>'] : [r.nom.slice(0, r.nom.lastIndexOf(':')), r.nom.slice(r.nom.lastIndexOf(':') + 1)]) : ['<none>', '<none>']
      return { Containers: String(d.ishlatyapti(r.im).length), CreatedAt: goVaqt(Date.parse(r.im.kat.yaratilgan)), CreatedSince: oldin(Date.parse(r.im.kat.yaratilgan)), Digest: '<none>', ID: qisqaId(r.im.id), Repository: repo, SharedSize: 'N/A', Size: r.im.kat.lsDisk, Tag: tag, UniqueSize: 'N/A' }
    }
    // --format/json: faqat teg nomlari (digest yozuvlari ko'rinmaydi — yozuv 02)
    if (f.format) { formatla(ctx, f.format, roy.filter((r) => !r.nom?.includes('@')).map(satr), 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedSince}}\t{{.Size}}', { ID: 'IMAGE ID', CreatedSince: 'CREATED' }); return 0 }
    imageJadval(ctx, d, roy)
    return 0
  },
  async rmi(args, ctx, d) {
    const { f, pos } = tahlil('rmi', args)
    if (!pos.length) throw kam('rmi', 1)
    let kod = 0
    for (const ref of pos) {
      try { rmiBir(ref, f.force, ctx, d) } catch (e) { if (e instanceof DaemonXato) { ctx.stderr.yoz('Error response from daemon: ' + e.message + '\n'); kod = 1 } else throw e }
    }
    return kod
  },
  tag(args, ctx, d) {
    const { pos } = tahlil('tag', args)
    if (pos.length !== 2) throw aniq('tag', 2)
    d.tag(pos[0], pos[1])
    return 0
  },
  history(args, ctx, d) {
    const { f, pos } = tahlil('history', args)
    if (pos.length !== 1) throw aniq('history', 1)
    const im = d.imageTop(pos[0])
    if (!im) throw new DaemonXato(`No such image: ${pos[0]}`)
    const h = im.kat.history
    const satrlar = h.map((x, i) => {
      const by = x.CreatedBy
      const kesilgan = f['no-trunc'] ? by : [...by].length > 45 ? [...by].slice(0, 44).join('') + '…' : by
      return { ID: i === 0 ? (f['no-trunc'] ? im.id : qisqaId(im.id)) : '<missing>', CreatedSince: oldin(Date.parse(x.CreatedAt)), CreatedAt: x.CreatedAt, CreatedBy: kesilgan, Size: x.Size, Comment: x.Comment }
    })
    if (f.quiet) { ctx.stdout.yoz(satrlar.map((s) => s.ID + '\n').join('')); return 0 }
    formatla(ctx, f.format, satrlar, 'table {{.ID}}\t{{.CreatedSince}}\t{{.CreatedBy}}\t{{.Size}}\t{{.Comment}}', { ID: 'IMAGE', CreatedSince: 'CREATED' })
    return 0
  },
  'image inspect': (args, ctx, d) => inspect(args, ctx, d, 'image inspect', 'image'),
  'image prune': (args, ctx, d) => {
    const { f } = tahlil('image prune', args)
    if (!f.force) return tasdiq(ctx, f.all ? 'WARNING! This will remove all images without at least one container associated to them.' : 'WARNING! This will remove all dangling images.')
    const ochirildi = []
    let jami = 0
    for (const im of [...d.imagelar.values()]) {
      if (d.ishlatyapti(im).length) continue
      if (!f.all && im.teglar.size) continue
      for (const t of im.teglar) ochirildi.push(`untagged: ${t}`)
      ochirildi.push(`deleted: ${im.id}`, `deleted: ${im.kat.manifest}`)
      if (im.kat.attestationManifest) ochirildi.push(`deleted: ${im.kat.attestationManifest}`)
      jami += im.kat.disk
      d.imageOchir(im)
    }
    if (ochirildi.length) ctx.stdout.yoz('Deleted Images:\n' + ochirildi.join('\n') + '\n\n')
    ctx.stdout.yoz(`Total reclaimed space: ${hajm(jami)}\n`)
    return 0
  },

  // ------------------------------------------------------------- konteynerlar
  async run(args, ctx, d) { return run(args, ctx, d, 'run') },
  async create(args, ctx, d) { return run(args, ctx, d, 'create') },
  async start(args, ctx, d) {
    const { f, pos } = tahlil('start', args)
    if (!pos.length) throw kam('start', 1)
    if (f.attach || f.interactive) {
      if (pos.length > 1) throw new ClixatoBir('you cannot start and attach multiple containers at once')
      const k = d.konteynerKerak(pos[0])
      const kirish = f.interactive ? ctx.stdin : null
      const att = attachYarat(ctx, k, { stdin: kirish })
      if (k.holat !== 'running') await d.boshla(k, { attach: att })
      else if (k.jarayon) k.jarayon.ulash(att)
      return await kutVaUzil(ctx, d, k)
    }
    let xatoBor = false
    for (const ref of pos) {
      try {
        const k = d.konteynerKerak(ref)
        k.toxtatildi = false
        if (k.holat !== 'running') { await d.boshla(k); await kichikKut() }
        ctx.stdout.yoz(ref + '\n')
      } catch (e) {
        if (!(e instanceof DaemonXato)) throw e
        ctx.stderr.yoz('Error response from daemon: ' + e.message + '\n')
        xatoBor = true
      }
    }
    if (xatoBor) { ctx.stderr.yoz(`failed to start containers: ${pos.filter((r) => !d.konteynerTop(r) || d.konteynerTop(r).holat !== 'running').join(', ')}\n`); return 1 }
    return 0
  },
  async stop(args, ctx, d) {
    const { f, pos } = tahlil('stop', args)
    if (!pos.length) throw kam('stop', 1)
    let kod = 0
    await Promise.all(pos.map(async (ref) => {
      try {
        const k = d.konteynerKerak(ref)
        await d.toxtat(k, { vaqt: f.timeout != null ? Number(f.timeout) : null, signal: f.signal })
        ctx.stdout.yoz(ref + '\n')
      } catch (e) { if (!(e instanceof DaemonXato)) throw e; ctx.stderr.yoz('Error response from daemon: ' + e.message + '\n'); kod = 1 }
    }))
    return kod
  },
  async restart(args, ctx, d) {
    const { f, pos } = tahlil('restart', args)
    if (!pos.length) throw kam('restart', 1)
    let kod = 0
    for (const ref of pos) {
      try {
        const k = d.konteynerKerak(ref)
        await d.toxtat(k, { vaqt: f.timeout != null ? Number(f.timeout) : null })
        k.toxtatildi = false
        await d.boshla(k)
        await kichikKut()
        k.restartSoni = k.restartSoni // qo'lda restart RestartCount ni oshirmaydi
        ctx.stdout.yoz(ref + '\n')
      } catch (e) { if (!(e instanceof DaemonXato)) throw e; ctx.stderr.yoz('Error response from daemon: ' + e.message + '\n'); kod = 1 }
    }
    return kod
  },
  async kill(args, ctx, d) {
    const { f, pos } = tahlil('kill', args)
    if (!pos.length) throw kam('kill', 1)
    let kod = 0
    for (const ref of pos) {
      try {
        const k = d.konteynerKerak(ref)
        const sig = f.signal ?? 'KILL'
        if (!signalRaqam(sig)) throw new DaemonXato(`Invalid signal: ${sig}`)
        await d.oldir(k, 'SIG' + String(sig).toUpperCase().replace(/^SIG/, ''))
        await kichikKut()
        ctx.stdout.yoz(ref + '\n')
      } catch (e) { if (!(e instanceof DaemonXato)) throw e; ctx.stderr.yoz('Error response from daemon: ' + e.message + '\n'); kod = 1 }
    }
    return kod
  },
  async rm(args, ctx, d) {
    const { f, pos } = tahlil('rm', args)
    if (!pos.length) throw kam('rm', 1)
    let kod = 0
    for (const ref of pos) {
      try {
        const k = d.konteynerTop(ref)
        if (!k) { if (f.force) continue; throw new DaemonXato(`No such container: ${ref}`) }
        if (k.holat === 'running' || k.holat === 'paused') {
          if (!f.force) throw new DaemonXato(`cannot remove container "${k.nom}": container is running: stop the container before removing or force remove`)
          await d.oldir(k)
        }
        d.ochirKonteyner(k, { v: f.volumes })
        await kichikKut()
        ctx.stdout.yoz(ref + '\n')
      } catch (e) { if (!(e instanceof DaemonXato)) throw e; ctx.stderr.yoz('Error response from daemon: ' + e.message + '\n'); kod = 1 }
    }
    return kod
  },
  ps(args, ctx, d) {
    const { f } = tahlil('ps', args)
    let roy = [...d.konteynerlar.values()].sort((a, b) => b.yaratildi - a.yaratildi)
    const fl = filtr(f.filter, 'ps')
    const hammasi = f.all || f.latest || (f.last != null && f.last !== -1 && f.last !== '-1') || fl.status?.some((s) => s !== 'running')
    if (!hammasi) roy = roy.filter((k) => k.holat === 'running' || k.holat === 'paused' || k.holat === 'restarting')
    for (const [kalit, qiymatlar] of Object.entries(fl)) {
      roy = roy.filter((k) => qiymatlar.some((v) => {
        if (kalit === 'name') return new RegExp(v).test(k.nom)
        if (kalit === 'status') return k.holat === v
        if (kalit === 'id') return k.id.startsWith(v)
        if (kalit === 'ancestor') { const im = d.imageTop(v); return im ? im.id === k.imageId : false }
        if (kalit === 'exited') return k.holat === 'exited' && String(k.chiqishKodi) === v
        if (kalit === 'label') { const [a, b] = v.split('='); return b == null ? a in k.config.labels : k.config.labels[a] === b }
        if (kalit === 'network') return [...k.tarmoqlar.keys()].some((id) => d.tarmoqlar.get(id)?.nom === v)
        if (kalit === 'volume') return k.mountlar.some((m) => m.nom === v || m.manzil === v)
        return true
      }))
    }
    if (f.latest) roy = roy.slice(0, 1)
    else if (f.last != null && Number(f.last) > 0) roy = roy.slice(0, Number(f.last))
    const satrlar = roy.map((k) => psSatr(d, k, { toliq: f['no-trunc'], hajmi: f.size }))
    if (f.quiet) { ctx.stdout.yoz(satrlar.map((s) => s.ID + '\n').join('')); return 0 }
    formatla(ctx, f.format, satrlar, 'table {{.ID}}\t{{.Image}}\t{{.Command}}\t{{.RunningFor}}\t{{.Status}}\t{{.Ports}}\t{{.Names}}' + (f.size ? '\t{{.Size}}' : ''))
    return 0
  },
  async logs(args, ctx, d) {
    const { f, pos } = tahlil('logs', args)
    if (pos.length !== 1) throw aniq('logs', 1)
    const k = d.konteynerKerak(pos[0])
    const n = f.tail ?? f.n ?? 'all'
    let qatorlar = k.loglar
    if (f.since) { const t = vaqtTahlil(f.since); qatorlar = qatorlar.filter((x) => x.vaqt >= t) }
    if (n !== 'all') qatorlar = Number(n) === 0 ? [] : qatorlar.slice(-Number(n))
    const chiq = (x) => (x.oqim === 'stderr' ? ctx.stderr : ctx.stdout).yoz((f.timestamps ? rfc3339(x.vaqt, String(new Date(x.vaqt).getUTCMilliseconds()).padStart(3, '0') + x.nano) + ' ' : '') + x.matn + '\n')
    qatorlar.forEach(chiq)
    if (!f.follow || k.holat !== 'running') return 0
    // -f: yangi qatorlarni kutish; Ctrl+C — chiqish (kod 130)
    let i = k.loglar.length
    return await new Promise((res) => {
      const tugat = (kod) => { off(); clearInterval(t); res(kod) }
      const off = d.tingla((h) => {
        if (h.id !== k.id) return
        if (h.amal === 'log') { while (i < k.loglar.length) chiq(k.loglar[i++]) }
        if (h.amal === 'die' || h.amal === 'destroy') { while (i < k.loglar.length) chiq(k.loglar[i++]); tugat(0) }
      })
      const t = setInterval(() => {}, 1000)
      ctx.uzilish?.((qayta) => { tugat(130); return true })
    })
  },
  async exec(args, ctx, d) {
    const { f, pos } = tahlil('exec', args, { interspersed: false })
    if (pos.length && pos[0] === '--help') { ctx.stdout.yoz(MATN.help.exec); return 0 }
    if (f.help) { ctx.stdout.yoz(MATN.help.exec); return 0 }
    if (pos.length < 2) throw kam('exec', 2)
    const k = d.konteynerKerak(pos[0])
    if (k.holat !== 'running') throw new DaemonXato(`container ${k.id} is not running`)
    if (k.holat === 'paused') throw new DaemonXato(`container ${k.id} is paused, unpause the container before exec`)
    const argv = pos.slice(1)
    const top = dasturTop(k, argv[0])
    if (top.xato) { ctx.stderr.yoz(`OCI runtime exec failed: exec failed: unable to start container process: ${top.xato}\n`); return top.kod }
    const tty = !!f.tty
    const att = attachYarat(ctx, k, { stdin: f.interactive ? ctx.stdin : null, tty })
    const env = envObyekt([...k.config.env.filter((e) => !f.env.some((x) => x.split('=')[0] === e.split('=')[0])), ...f.env], k, { tty })
    const j = new Jarayon(d, k, argv, { pid1: false, tty, attach: att, env, cwd: f.workdir ?? (k.config.workdir || '/'), user: f.user ?? k.config.user })
    // exec PID'lari konteyner ichida: birinchisi 7, keyin har biri ~6 ga oshadi (yozuv: 04, 07)
    k.execSoni = (k.execSoni ?? 0) + 1
    j.ichkiPid = 1 + 6 * k.execSoni
    k.execlar.set(j, j)
    d.hodisa('container', 'exec_start', k, { cmd: argv.join(' ') })
    ctx.uzilish?.(() => { if (tty) { j.signal('SIGINT') } else j.signal('SIGINT'); return true })
    j.ishga()
    const kod = await j.tugash
    k.execlar.delete(j)
    d.hodisa('container', 'exec_die', k, { kod })
    return kod
  },
  'container inspect': (args, ctx, d) => inspect(args, ctx, d, 'container inspect', 'container'),
  inspect: (args, ctx, d) => inspect(args, ctx, d, 'inspect', null),
  port(args, ctx, d) {
    const { pos } = tahlil('port', args)
    if (!pos.length) throw kam('port', 1)
    const k = d.konteynerKerak(pos[0])
    let b = k.portBerildi
    if (pos[1]) {
      const [p, proto = 'tcp'] = pos[1].split('/')
      b = b.filter((x) => x.ichki === p && x.proto === proto)
      if (!b.length) throw new DaemonXato(`no public port '${pos[1]}' published for ${pos[0]}`, { prefiks: false })
      ctx.stdout.yoz(b.map((x) => `${x.ip === '::' ? '[::]' : x.ip}:${x.tashqi}\n`).join(''))
      return 0
    }
    ctx.stdout.yoz(b.map((x) => `${x.ichki}/${x.proto} -> ${x.ip === '::' ? '[::]' : x.ip}:${x.tashqi}\n`).join(''))
    return 0
  },
  top(args, ctx, d) {
    const { pos } = tahlil('top', args)
    if (!pos.length) throw kam('top', 1)
    const k = d.konteynerKerak(pos[0])
    if (k.holat !== 'running') throw new DaemonXato(`container ${k.id} is not running`)
    const roy = [['PID', 'USER', 'TIME', 'COMMAND'], [String(k.pid), 'root', '0:00', k.jarayon.argv.join(' ')]]
    if (k.jarayon.nginx) { roy[1][3] = 'nginx: master process nginx -g daemon off;'; roy.push([String(k.pid + 43), '101', '0:00', 'nginx: worker process']) }
    ctx.stdout.yoz(roy.map((r) => r.map((c, i) => (i < 3 ? c.padEnd(20) : c)).join('') + '\n').join(''))
    return 0
  },
  async stats(args, ctx, d) {
    const { f, pos } = tahlil('stats', args)
    let roy = pos.length ? pos.map((r) => d.konteynerKerak(r)) : [...d.konteynerlar.values()].filter((k) => k.holat === 'running')
    if (!f['no-stream']) ctx.stderr.yoz('\x1b[33mtrenajor: jonli `docker stats` o\'rniga bir martalik natija (--no-stream) ko\'rsatildi.\x1b[0m\n')
    await new Promise((r) => setTimeout(r, 900))
    // qiymatlar — VPS yozuvlaridan (14-format: nginx, alpine sleep); simulyatorda xotira o'lchanmaydi
    const satrlar = roy.map((k) => {
      const ish = k.holat === 'running', ng = !!k.jarayon?.nginx
      return { Container: k.id.slice(0, 12), ID: k.id.slice(0, 12), Name: k.nom, CPUPerc: '0.00%', MemUsage: ish ? (ng ? '6.746MiB / 1.752GiB' : '1.809MiB / 1.752GiB') : '0B / 0B', MemPerc: ish ? (ng ? '0.38%' : '0.10%') : '0.00%', NetIO: ish ? (ng ? '1.41kB / 126B' : '1.02kB / 126B') : '0B / 0B', BlockIO: ish ? (ng ? '16.4MB / 12.3kB' : '1.48MB / 0B') : '0B / 0B', PIDs: ish ? (ng ? '2' : '1') : '0' }
    })
    formatla(ctx, f.format, satrlar, 'table {{.ID}}\t{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}\t{{.PIDs}}', { ID: 'CONTAINER ID' })
    return 0
  },
  rename(args, ctx, d) {
    const { pos } = tahlil('rename', args)
    if (pos.length !== 2) throw aniq('rename', 2)
    const k = d.konteynerKerak(pos[0])
    const band = d.konteynerTop(pos[1])
    if (band) throw new DaemonXato(`Error when allocating new name: Conflict. The container name "/${pos[1]}" is already in use by container "${band.id}". You have to remove (or rename) that container to be able to reuse that name.`)
    k.nom = pos[1]
    d.hodisa('container', 'rename', k)
    return 0
  },
  diff(args, ctx, d) {
    const { pos } = tahlil('diff', args)
    if (pos.length !== 1) throw aniq('diff', 1)
    const k = d.konteynerKerak(pos[0])
    if (!k.fs) return 0
    ctx.stdout.yoz(k.fs.diff().filter(([y]) => !['/etc/hosts', '/etc/hostname', '/etc/resolv.conf'].includes(y) || !k.fs.yuqori.get(y)?.tizim).map(([y, t]) => `${t} ${y}\n`).join(''))
    return 0
  },
  pause(args, ctx, d) {
    const { pos } = tahlil('pause', args)
    if (!pos.length) throw kam('pause', 1)
    for (const r of pos) { const k = d.konteynerKerak(r); if (k.holat !== 'running') throw new DaemonXato(`container ${k.id} is not running`); k.holat = 'paused'; d.hodisa('container', 'pause', k); ctx.stdout.yoz(r + '\n') }
    return 0
  },
  unpause(args, ctx, d) {
    const { pos } = tahlil('unpause', args)
    if (!pos.length) throw kam('unpause', 1)
    for (const r of pos) { const k = d.konteynerKerak(r); if (k.holat !== 'paused') throw new DaemonXato(`container ${k.id} is not paused`); k.holat = 'running'; d.hodisa('container', 'unpause', k); ctx.stdout.yoz(r + '\n') }
    return 0
  },
  async wait(args, ctx, d) {
    const { pos } = tahlil('wait', args)
    if (!pos.length) throw kam('wait', 1)
    for (const r of pos) {
      const k = d.konteynerKerak(r)
      if (k.jarayon) await k.jarayon.tugash
      await kichikKut()
      ctx.stdout.yoz(k.chiqishKodi + '\n')
    }
    return 0
  },
  async attach(args, ctx, d) {
    const { pos } = tahlil('attach', args)
    if (pos.length !== 1) throw aniq('attach', 1)
    const k = d.konteynerKerak(pos[0])
    if (k.holat !== 'running') throw new CliXato('You cannot attach to a stopped container, start it first\n', 1)
    const att = attachYarat(ctx, k, { stdin: k.config.stdin ? ctx.stdin : null, tty: k.config.tty })
    k.jarayon.ulash(att)
    return await kutVaUzil(ctx, d, k)
  },
  'container prune': (args, ctx, d) => {
    const { f } = tahlil('container prune', args)
    if (!f.force) return tasdiq(ctx, 'WARNING! This will remove all stopped containers.')
    const ids = []
    let jami = 0
    for (const k of [...d.konteynerlar.values()]) if (k.holat !== 'running' && k.holat !== 'paused') { jami += d.konteynerHajm(k); ids.push(k.id); d.ochirKonteyner(k) }
    if (ids.length) ctx.stdout.yoz('Deleted Containers:\n' + ids.join('\n') + '\n\n')
    ctx.stdout.yoz(`Total reclaimed space: ${hajm(jami)}\n`)
    return 0
  },

  // ------------------------------------------------------------- tarmoq
  'network ls': (args, ctx, d) => {
    const { f } = tahlil('network ls', args)
    const roy = [...d.tarmoqlar.values()].sort((a, b) => a.nom.localeCompare(b.nom))
    const satrlar = roy.map((t) => ({ ID: f['no-trunc'] ? t.id : t.id.slice(0, 12), Name: t.nom, Driver: t.drayver, Scope: 'local', IPv6: 'false', Internal: String(!!t.ichki), CreatedAt: goVaqt(t.yaratildi), Labels: '' }))
    if (f.quiet) { ctx.stdout.yoz(satrlar.map((s) => s.ID + '\n').join('')); return 0 }
    formatla(ctx, f.format, satrlar, 'table {{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}', { ID: 'NETWORK ID' })
    return 0
  },
  'network create': (args, ctx, d) => {
    const { f, pos } = tahlil('network create', args)
    if (pos.length !== 1) throw aniq('network create', 1)
    const bir = (x) => (Array.isArray(x) ? x[0] : x) || null
    const t = d.tarmoqYarat({ nom: pos[0], drayver: f.driver ?? 'bridge', subnet: bir(f.subnet), gateway: bir(f.gateway), ichki: f.internal })
    ctx.stdout.yoz(t.id + '\n')
    return 0
  },
  'network rm': (args, ctx, d) => {
    const { pos } = tahlil('network rm', args)
    if (!pos.length) throw kam('network rm', 1)
    let kod = 0
    for (const r of pos) {
      try {
        const t = d.tarmoqTop(r)
        if (!t) throw new DaemonXato(`network ${r} not found`)
        d.tarmoqOchir(t)
        ctx.stdout.yoz(r + '\n')
      } catch (e) { if (!(e instanceof DaemonXato)) throw e; ctx.stderr.yoz('Error response from daemon: ' + e.message + '\n'); kod = 1 }
    }
    if (kod) ctx.stderr.yoz('exit status 1\n')
    return kod
  },
  'network inspect': (args, ctx, d) => inspect(args, ctx, d, 'network inspect', 'network'),
  'network connect': (args, ctx, d) => {
    const { f, pos } = tahlil('network connect', args)
    if (pos.length !== 2) throw aniq('network connect', 2)
    const t = d.tarmoqTop(pos[0])
    if (!t) throw new DaemonXato(`network ${pos[0]} not found`)
    const k = d.konteynerKerak(pos[1])
    if (k.tarmoqlar.has(t.id)) throw new DaemonXato(`endpoint with name ${k.nom} already exists in network ${t.nom}`)
    if (k.holat === 'running') d.ulash(t, k, { aliaslar: f.alias })
    else (k.qoshimchaTarmoq ??= []).push(t)
    return 0
  },
  'network disconnect': (args, ctx, d) => {
    const { pos } = tahlil('network disconnect', args)
    if (pos.length !== 2) throw aniq('network disconnect', 2)
    const t = d.tarmoqTop(pos[0])
    if (!t) throw new DaemonXato(`network ${pos[0]} not found`)
    const k = d.konteynerKerak(pos[1])
    if (!k.tarmoqlar.has(t.id)) throw new DaemonXato(`container ${k.id} is not connected to network ${t.nom}`)
    d.uzish(t, k)
    return 0
  },
  'network prune': (args, ctx, d) => {
    const { f } = tahlil('network prune', args)
    if (!f.force) return tasdiq(ctx, 'WARNING! This will remove all custom networks not used by at least one container.')
    const ochdi = []
    for (const t of [...d.tarmoqlar.values()]) if (!t.standart && t.drayver !== 'host' && t.drayver !== 'null' && !t.ulanishlar.size) { d.tarmoqOchir(t); ochdi.push(t.nom) }
    if (ochdi.length) ctx.stdout.yoz('Deleted Networks:\n' + ochdi.join('\n') + '\n\n')
    return 0
  },

  // ------------------------------------------------------------- volume
  'volume ls': (args, ctx, d) => {
    const { f } = tahlil('volume ls', args)
    let roy = [...d.volumelar.values()].sort((a, b) => a.nom.localeCompare(b.nom))
    for (const x of f.filter) { if (x === 'dangling=true') roy = roy.filter((v) => !d.volumeIshlatuvchilar(v).length) }
    const satrlar = roy.map((v) => ({ Driver: 'local', Name: v.nom, Mountpoint: `/var/lib/docker/volumes/${v.nom}/_data`, Scope: 'local', Labels: v.anonim ? 'com.docker.volume.anonymous=' : '', Links: 'N/A', Size: 'N/A', Availability: 'N/A', Group: 'N/A', Status: 'N/A' }))
    if (f.quiet) { ctx.stdout.yoz(satrlar.map((s) => s.Name + '\n').join('')); return 0 }
    formatla(ctx, f.format, satrlar, 'table {{.Driver}}\t{{.Name}}', { Name: 'VOLUME NAME' })
    return 0
  },
  'volume create': (args, ctx, d) => {
    const { pos } = tahlil('volume create', args)
    const v = d.volumeYarat(pos[0] ?? null)
    ctx.stdout.yoz(v.nom + '\n')
    return 0
  },
  'volume rm': (args, ctx, d) => {
    const { f, pos } = tahlil('volume rm', args)
    if (!pos.length) throw kam('volume rm', 1)
    let kod = 0
    for (const n of pos) {
      try { d.volumeOchir(n, { majburiy: f.force }); ctx.stdout.yoz(n + '\n') } catch (e) { if (!(e instanceof DaemonXato)) throw e; ctx.stderr.yoz('Error response from daemon: ' + e.message + '\n'); kod = 1 }
    }
    return kod
  },
  'volume inspect': (args, ctx, d) => inspect(args, ctx, d, 'volume inspect', 'volume'),
  'volume prune': (args, ctx, d) => {
    const { f } = tahlil('volume prune', args)
    if (!f.force) return tasdiq(ctx, f.all ? 'WARNING! This will remove all local volumes not used by at least one container.' : 'WARNING! This will remove anonymous local volumes not used by at least one container.')
    const ochdi = []
    let jami = 0
    for (const v of [...d.volumelar.values()]) {
      if (d.volumeIshlatuvchilar(v).length) continue
      if (!f.all && !v.anonim) continue
      jami += d.volumeHajm(v)
      d.volumeOchir(v.nom); ochdi.push(v.nom)
    }
    if (ochdi.length) ctx.stdout.yoz('Deleted Volumes:\n' + ochdi.join('\n') + '\n\n')
    ctx.stdout.yoz(`Total reclaimed space: ${hajm(jami)}\n`)
    return 0
  },

  // ------------------------------------------------------------- tizim
  'system df': (args, ctx, d) => {
    const { f } = tahlil('system df', args)
    const imlar = [...d.imagelar.values()]
    const faol = imlar.filter((im) => d.ishlatyapti(im).length)
    const imHajm = imlar.reduce((s, im) => s + im.kat.disk, 0)
    // RECLAIMABLE: ishlatilmayotgan image'lar; manifest/config bloblari hisobga kirmaydi — shuning uchun hammasi bo'sh
    // bo'lsa ham 99% (yozuv 02: "186.9MB (99%)")
    const bush = imlar.filter((im) => !d.ishlatyapti(im).length).reduce((s, im) => s + im.kat.disk - 3000, 0)
    const k = [...d.konteynerlar.values()]
    const kHajm = k.reduce((s, x) => s + d.konteynerHajm(x), 0)
    const kBush = k.filter((x) => x.holat !== 'running').reduce((s, x) => s + d.konteynerHajm(x), 0)
    const v = [...d.volumelar.values()]
    const vHajm = v.reduce((s, x) => s + d.volumeHajm(x), 0)
    const vBush = v.filter((x) => !d.volumeIshlatuvchilar(x).length).reduce((s, x) => s + d.volumeHajm(x), 0)
    const foiz = (a, b) => (b ? ` (${Math.floor((a / b) * 100)}%)` : '')
    if (f.verbose) return systemDfV(ctx, d)
    const satrlar = [
      { Type: 'Images', TotalCount: String(imlar.length), Active: String(faol.length), Size: hajm(imHajm), Reclaimable: hajm(bush) + foiz(bush, imHajm) },
      { Type: 'Containers', TotalCount: String(k.length), Active: String(k.filter((x) => x.holat === 'running').length), Size: hajm(kHajm), Reclaimable: hajm(kBush) + foiz(kBush, kHajm) },
      { Type: 'Local Volumes', TotalCount: String(v.length), Active: String(v.filter((x) => d.volumeIshlatuvchilar(x).length).length), Size: hajm(vHajm), Reclaimable: hajm(vBush) + foiz(vBush, vHajm) },
      { Type: 'Build Cache', TotalCount: '0', Active: '0', Size: '0B', Reclaimable: '0B' },
    ]
    formatla(ctx, f.format, satrlar, 'table {{.Type}}\t{{.TotalCount}}\t{{.Active}}\t{{.Size}}\t{{.Reclaimable}}')
    return 0
  },
  'system prune': async (args, ctx, d) => {
    const { f } = tahlil('system prune', args)
    if (!f.force) {
      return tasdiq(ctx, `WARNING! This will remove:\n  - all stopped containers\n  - all networks not used by at least one container\n${f.volumes ? '  - all anonymous volumes not used by at least one container\n' : ''}  - ${f.all ? 'all images without at least one container associated to them' : 'all dangling images'}\n  - ${f.all ? 'all build cache' : 'unused build cache'}\n`)
    }
    let jami = 0
    const kIds = []
    for (const k of [...d.konteynerlar.values()]) if (k.holat !== 'running' && k.holat !== 'paused') { jami += d.konteynerHajm(k); kIds.push(k.id); d.ochirKonteyner(k) }
    if (kIds.length) ctx.stdout.yoz('Deleted Containers:\n' + kIds.join('\n') + '\n\n')
    const tl = []
    for (const t of [...d.tarmoqlar.values()]) if (!t.standart && t.drayver === 'bridge' && !t.ulanishlar.size) { d.tarmoqOchir(t); tl.push(t.nom) }
    if (tl.length) ctx.stdout.yoz('Deleted Networks:\n' + tl.join('\n') + '\n\n')
    if (f.volumes) {
      const vl = []
      for (const v of [...d.volumelar.values()]) if (v.anonim && !d.volumeIshlatuvchilar(v).length) { jami += d.volumeHajm(v); d.volumeOchir(v.nom); vl.push(v.nom) }
      if (vl.length) ctx.stdout.yoz('Deleted Volumes:\n' + vl.join('\n') + '\n\n')
    }
    const il = []
    for (const im of [...d.imagelar.values()]) {
      if (d.ishlatyapti(im).length || (!f.all && im.teglar.size)) continue
      for (const t of im.teglar) il.push(`untagged: ${t}`)
      il.push(`deleted: ${im.id}`, `deleted: ${im.kat.manifest}`)
      if (im.kat.attestationManifest) il.push(`deleted: ${im.kat.attestationManifest}`)
      jami += im.kat.disk
      d.imageOchir(im)
    }
    if (il.length) ctx.stdout.yoz('Deleted Images:\n' + il.join('\n') + '\n\n')
    ctx.stdout.yoz(`Total reclaimed space: ${hajm(jami)}\n`)
    return 0
  },
  'system info': (a, c, d) => BUYRUQLAR.info(a, c, d),

  // ------------------------------------------------------------- hali yo'q (keyingi bosqichlar)
  build: (args, ctx) => { ctx.stderr.yoz('\x1b[33mtrenajor: `docker build` keyingi bosqichda qo\'shiladi (Dockerfile muharriri bilan).\x1b[0m\n'); return 1 },
  push: (args, ctx) => { ctx.stderr.yoz('\x1b[33mtrenajor: registry\'ga yuborish (push) simulyatorda yo\'q.\x1b[0m\n'); return 1 },
  login: (args, ctx) => { ctx.stderr.yoz('\x1b[33mtrenajor: Docker Hub\'ga kirish simulyatorda kerak emas — image\'lar katalogdan olinadi.\x1b[0m\n'); return 1 },
  search: (args, ctx) => { ctx.stderr.yoz('\x1b[33mtrenajor: qidiruv o\'rniga trenajor katalogidagi image\'lar: hello-world, alpine, nginx:1.29, debian (trixie), busybox:1.37\x1b[0m\n'); return 1 },
  async events(args, ctx, d) {
    const { f } = tahlil('events', args)
    const dan = f.since ? vaqtTahlil(f.since) : Date.now()
    const gacha = f.until != null ? (f.until === '0s' || f.until === '0' ? Date.now() : vaqtTahlil(f.until)) : null
    const chiq = (v) => ctx.stdout.yoz(`${v.nano} ${v.Type} ${v.Action} ${v.id} (${Object.entries(v.Attributes).sort(([a], [b]) => (a < b ? -1 : 1)).map(([a, b]) => `${a}=${b}`).join(', ')})\n`)
    for (const v of d.voqealar) if (v.vaqt >= dan && (gacha == null || v.vaqt <= gacha)) chiq(v)
    if (gacha != null) return 0
    let i = d.voqealar.length
    return await new Promise((res) => {
      const off = d.tingla((h) => { if (h.tur === 'events') while (i < d.voqealar.length) chiq(d.voqealar[i++]) })
      ctx.uzilish?.(() => { off(); res(130); return true })
    })
  },
}
class ClixatoBir extends CliXato { constructor(m) { super(m + '\n', 1) } }

// --------------------------------------------------------------------------------------- yordamchilar
const kichikKut = () => new Promise((r) => setTimeout(r, 30 + Math.random() * 60))

function tasdiq(ctx, ogohlantirish) {
  ctx.stdout.yoz(`${ogohlantirish}\nAre you sure you want to continue? [y/N] `)
  ctx.stderr.yoz('\n\x1b[33mtrenajor: tasdiqlash so\'rovi o\'rniga `-f` (--force) bilan bajaring.\x1b[0m\n')
  return 1
}

function vaqtTahlil(s) {
  const m = /^(\d+)(s|m|h)$/.exec(s)
  if (m) return Date.now() - Number(m[1]) * { s: 1000, m: 60000, h: 3600000 }[m[2]]
  const t = Date.parse(s)
  return Number.isNaN(t) ? 0 : t
}

// image ls jadvali — Docker 29 ko'rinishi (TTY'da rangli, "U" — ishlatilyapti)
function imageJadval(ctx, d, roy) {
  const tty = ctx.stdout.tty
  const cols = ctx.cols?.() ?? 100
  const nomlar = roy.map((r) => r.nom ?? '<untagged>')
  let W = Math.max(5, ...nomlar.map((x) => x.length)) + 3
  if (tty) W = Math.max(8, Math.min(W, cols - 48)) // tor terminalda uzun nom keyingi qatorga o'tadi
  const c = (kod, m) => (tty ? `\x1b[${kod}m${m}\x1b[0m` : m)
  const sarlavha = (m) => (tty ? `\x1b[39m\x1b[1m${m}\x1b[0m` : m)
  let s = ''
  if (tty) s += ' '.repeat(Math.max(0, cols - 20)) + '\x1b[1m\x1b[106m\x1b[30mi\x1b[0m\x1b[0m \x1b[96mInfo → \x1b[0m\x1b[0m \x1b[38;5;0m\x1b[48;5;14m U \x1b[0m In Use\n'
  s += sarlavha('IMAGE') + ' '.repeat(Math.max(1, W - 5)) + sarlavha('ID') + ' '.repeat(13) + sarlavha('DISK USAGE') + '   ' + sarlavha('CONTENT SIZE') + '   ' + sarlavha('EXTRA') + '\n'
  for (const r of roy) {
    const nom = r.nom ?? '<untagged>'
    const nomM = r.nom ? (tty ? `\x1b[34m\x1b[1m${nom}\x1b[0m` : nom) : (tty ? `\x1b[39m\x1b[2m${nom}\x1b[0m` : nom)
    const band = d.ishlatyapti(r.im).length > 0
    let q = nomM
    if (nom.length + 3 > W) q += '\n' + ' '.repeat(W)
    else q += ' '.repeat(W - nom.length)
    const ong = (x, w) => ' '.repeat(Math.max(0, w - x.length)) + c(39, x)
    q += c(39, qisqaId(r.im.id)) + '   ' + ong(r.im.kat.lsDisk, 10) + '   ' + ong(r.im.kat.lsKontent, 12) + '   ' + (band ? (tty ? '\x1b[38;5;0m\x1b[48;5;14m U \x1b[0m  ' : 'U    ') : '     ')
    s += q + '\n'
  }
  ctx.stdout.yoz(s)
}

function systemDfV(ctx, d) {
  const imlar = [...d.imagelar.values()]
  let s = 'Images space usage:\n\n'
  const ir = ['REPOSITORY\tTAG\tIMAGE ID\tCREATED\tSIZE\tSHARED SIZE\tUNIQUE SIZE\tCONTAINERS']
  for (const im of [...imlar].sort((a, b) => Date.parse(b.kat.yaratilgan) - Date.parse(a.kat.yaratilgan))) for (const t of im.teglar.size ? [...im.teglar].filter((x) => !x.includes('@')) : ['<none>:<none>']) {
    const [repo, tag] = t.includes('@') ? [t.split('@')[0], '<none>'] : [t.slice(0, t.lastIndexOf(':')), t.slice(t.lastIndexOf(':') + 1)]
    ir.push([repo, tag, qisqaId(im.id), oldin(Date.parse(im.kat.yaratilgan)), im.kat.lsDisk, '0B', hajm(im.kat.disk), String(d.ishlatyapti(im).length)].join('\t'))
  }
  s += tabwriter(ir.join('\n') + '\n') + '\nContainers space usage:\n\n'
  const kr = ['CONTAINER ID\tIMAGE\tCOMMAND\tLOCAL VOLUMES\tSIZE\tCREATED\tSTATUS\tNAMES']
  for (const k of [...d.konteynerlar.values()].sort((a, b) => b.yaratildi - a.yaratildi)) kr.push([k.id.slice(0, 12), imageNomi(d, k), buyruqMatn(k), String(k.mountlar.filter((m) => m.tur === 'volume').length), hajm(d.konteynerHajm(k), 3), oldin(k.yaratildi), holatMatn(k), k.nom].join('\t'))
  s += tabwriter(kr.join('\n') + '\n') + '\nLocal Volumes space usage:\n\n'
  const vr = ['VOLUME NAME\tLINKS\tSIZE']
  for (const v of d.volumelar.values()) vr.push([v.nom, String(d.volumeIshlatuvchilar(v).length), hajm(d.volumeHajm(v))].join('\t'))
  s += tabwriter(vr.join('\n') + '\n') + '\nBuild cache usage: 0B\n\nCACHE ID   CACHE TYPE   SIZE      CREATED   LAST USED   USAGE     SHARED\n'
  ctx.stdout.yoz(s)
  return 0
}

function rmiBir(ref, majburiy, ctx, d) {
  const im = d.imageTop(ref)
  if (!im) {
    let n
    try { n = nomTahlil(ref) } catch { n = null }
    throw new DaemonXato(`No such image: ${n ? nomMatn(n) : ref}`)
  }
  const ishl = d.ishlatyapti(im)
  const toliqId = /^(sha256:)?[0-9a-f]{12,64}$/.test(ref) && im.id.replace('sha256:', '').startsWith(ref.replace('sha256:', ''))
  const digestBilan = ref.includes('@')
  if (ishl.length && !majburiy) {
    const ishlayotgan = ishl.find((k) => k.holat === 'running')
    if (ishlayotgan) throw new DaemonXato(`conflict: unable to delete ${ref} (cannot be forced) - container ${ishlayotgan.id.slice(0, 12)} is using its referenced image ${qisqaId(im.id)}`)
    throw new DaemonXato(`conflict: unable to delete ${ref} (must be forced) - container ${ishl[0].id.slice(0, 12)} is using its referenced image ${qisqaId(im.id)}`)
  }
  // ID yoki digest bilan — hamma teglar o'chadi
  if (toliqId || digestBilan) {
    for (const t of [...im.teglar]) ctx.stdout.yoz(`Untagged: ${t}\n`)
    if (!ishl.length) { ctx.stdout.yoz(`Deleted: ${im.id}\n`); d.imageOchir(im) } else { im.teglar.clear(); for (const [k, v] of d.teglar) if (v === im.id) d.teglar.delete(k) }
    return
  }
  let n
  try { n = nomTahlil(ref) } catch { n = null }
  const nom = n ? nomMatn(n) : ref
  const qolganTeglar = [...im.teglar].filter((t) => t !== nom)
  d.tegOlib(nom)
  ctx.stdout.yoz(`Untagged: ${nom}\n`)
  // oxirgi "oddiy" teg o'chsa — digest nomlari ham o'chadi va image o'chiriladi
  if (!qolganTeglar.some((t) => !t.includes('@'))) {
    for (const t of qolganTeglar) { d.tegOlib(t); ctx.stdout.yoz(`Untagged: ${t}\n`) }
    if (!ishl.length) { ctx.stdout.yoz(`Deleted: ${im.id}\n`); d.imageOchir(im) }
  }
  d.hodisa('image', 'untag', im, { nom })
}

// pull: TTY'da progress animatsiya, aks holda oddiy qatorlar
async function pull(ref, ctx, d, { jim = false, toliqNom = true, runIchida = false } = {}) {
  let r
  try { r = d.registrydan(ref) } catch (e) { if (e instanceof DaemonXato) { if (runIchida) throw e; ctx.stderr.yoz(e.message + '\n'); return 1 } throw e }
  const { n, kat, repoBor } = r
  const out = runIchida ? ctx.stderr : ctx.stdout
  // `docker run` o'zi teg qo'shib yuboradi — "Using default tag" faqat `docker pull` da
  if (!n.tagBerilgan && !n.digest && !jim && !runIchida) out.yoz('Using default tag: latest\n')
  await new Promise((x) => setTimeout(x, 350 + Math.random() * 300))
  if (!kat) {
    if (repoBor) throw new DaemonXato(`failed to resolve reference "${n.domen}/${n.yol}:${n.tag}": ${n.domen}/${n.yol}:${n.tag}: not found`)
    // katalogda yo'q: haqiqiy Docker Hub'da bo'lishi mumkin — ochiq aytamiz
    if (MASHHUR.includes(n.qisqa)) {
      ctx.stderr.yoz(`\x1b[33mtrenajor: \`${n.qisqa}\` image'i trenajor katalogida yo'q (haqiqiy Docker Hub'da bor). Katalog: hello-world, alpine, nginx:1.29, debian, debian:trixie, busybox:1.37\x1b[0m\n`)
      return 1
    }
    throw new DaemonXato(`pull access denied for ${n.qisqa}, repository does not exist or may require 'docker login'`)
  }
  const kat2 = d.katalog.imagelar[kat.id] ?? kat
  const bor = d.imageTop(kat2.id)
  const sarlavha = n.digest && !n.tagBerilgan ? `${n.domen}/${n.yol}@${n.digest}` : n.tag
  if (!jim) out.yoz(`${sarlavha}: Pulling from ${n.yol}\n`)
  if (!bor) {
    if (!jim) await pullAnimatsiya(kat2, out, { cols: ctx.cols?.() ?? 100, uzilish: ctx.uzilish })
    else await new Promise((x) => setTimeout(x, 1200))
  }
  const nomi = n.digest && !n.tagBerilgan ? `${n.qisqa}@${n.digest}` : `${n.qisqa}:${n.tag}`
  // holat: teg allaqachon shu image'ga ishora qilsa yoki digest bilan (mazmun bor) — "up to date" (yozuv 02)
  const tegOldin = d.teglar.get(nomi) === kat2.id
  d.imageQosh(kat2, n)
  if (!jim) {
    out.yoz(`Digest: ${kat2.id}\n`)
    out.yoz(tegOldin || (bor && n.digest) ? `Status: Image is up to date for ${nomi}\n` : `Status: Downloaded newer image for ${nomi}\n`)
  }
  if (toliqNom && !runIchida) ctx.stdout.yoz(`${n.domen}/${n.yol}${n.digest && !n.tagBerilgan ? '@' + n.digest : ':' + n.tag}\n`)
  return 0
}
const MASHHUR = ['ubuntu', 'redis', 'postgres', 'mysql', 'node', 'python', 'php', 'golang', 'mongo', 'httpd', 'traefik', 'caddy', 'mariadb', 'rabbitmq', 'registry', 'centos', 'fedora', 'memcached', 'elasticsearch', 'openjdk', 'ruby', 'rust', 'composer', 'wordpress', 'adminer', 'curlimages/curl']

// attach: CLI terminalini konteyner jarayoniga ulash
function attachYarat(ctx, k, { stdin = null, tty = k.config.tty } = {}) {
  return {
    stdout: { tty, yoz: (m) => ctx.stdout.yoz(m) },
    stderr: { tty, yoz: (m) => (tty ? ctx.stdout : ctx.stderr).yoz(m) },
    stdin: stdin ? (tty || stdin.qator ? { tty, qator: () => stdin.qator?.({ konteyner: k }) ?? Promise.resolve(null), oqi: () => stdin.oqi() } : stdin) : null,
    tty,
    prompt: () => ctx.prompt?.({ konteyner: k }),
  }
}

// attach qilingan konteyner tugashini kutish; Ctrl+C — SIGINT konteynerga (sig-proxy), Ctrl+P Ctrl+Q — ajralish
async function kutVaUzil(ctx, d, k, { rm = false } = {}) {
  const j = k.jarayon
  if (!j) return k.chiqishKodi
  let ajraldi = false
  const ajralish = new Promise((res) => {
    ctx.ajralish?.(() => { ajraldi = true; res('ajraldi') })
  })
  // Ctrl+C: TTY bo'lsa terminal orqali jarayonga (SIGINT) boradi; TTY bo'lmasa CLI uni konteynerga uzatadi
  // (sig-proxy) va uchinchisida o'zi chiqib ketadi — konteyner ishlashda qoladi (yozuv 12-signal)
  let soni = 0
  let majburiy
  const majburiyP = new Promise((r) => { majburiy = r })
  ctx.uzilish?.(() => {
    j.signal('SIGINT')
    if (!k.config.tty && ++soni >= 3) majburiy('majburiy')
    return true
  })
  const natija = await Promise.race([j.tugash, ajralish, majburiyP])
  if (natija === 'majburiy') { j.ulash(null); ctx.stderr.yoz('\ngot 3 SIGTERM/SIGINTs, forcefully exiting\n'); return 1 }
  // Ctrl+P Ctrl+Q: terminal ajraladi, konteyner ishlashda davom etadi (yozuv: "read escape sequence", kod 1)
  if (natija === 'ajraldi' || ajraldi) { j.ulash(null); ctx.stdout.yoz('read escape sequence\n'); return 1 }
  await kichikKut()
  void rm
  return k.chiqishKodi
}

// --------------------------------------------------------------------------------------- run / create
async function run(args, ctx, d, nom) {
  const { f, pos } = tahlil(nom, args, { interspersed: false })
  if (f.help) { ctx.stdout.yoz(MATN.help[nom]); return 0 }
  if (!pos.length) throw kam(nom, 1)
  const rXato = (m, kod = 125) => new CliXato(`docker: ${m}\n\nRun 'docker ${nom} --help' for more information\n`, kod)
  const [image, ...cmd] = pos
  // portlar
  const portlar = []
  // -p [ip:][hostPort:]containerPort[/proto]
  for (const p of f.publish ?? []) {
    let [asos, proto = 'tcp'] = p.split('/')
    let ip = ''
    const v6 = /^\[([^\]]+)\]:(.*)$/.exec(asos)
    if (v6) { ip = v6[1]; asos = v6[2] }
    const q = asos.split(':')
    let tashqi = '', ichki
    if (!v6 && q.length === 3) [ip, tashqi, ichki] = q
    else if (q.length === 2) [tashqi, ichki] = q
    else ichki = q[q.length - 1]
    if (!/^\d+$/.test(ichki) || Number(ichki) > 65535 || Number(ichki) < 1) throw rXato(`invalid containerPort: ${ichki}`)
    if (tashqi && (!/^\d+$/.test(tashqi) || Number(tashqi) > 65535)) throw rXato(`invalid hostPort: ${tashqi}`)
    portlar.push({ ip, tashqi, ichki, proto })
  }
  // env
  const env = []
  for (const fayl of f['env-file'] ?? []) {
    let matn
    try { matn = ctx.hostFs.oqi(fayl.startsWith('/') ? fayl : ctx.cwd + '/' + fayl) } catch { throw rXato(`open ${fayl}: no such file or directory`) }
    for (const q of matn.split('\n')) { const t = q.trim(); if (!t || t.startsWith('#')) continue; env.push(t.includes('=') ? t : `${t}=${ctx.env[t] ?? ''}`) }
  }
  for (const e of f.env ?? []) env.push(e.includes('=') ? e : `${e}=${ctx.env[e] ?? ''}`)
  // mount'lar
  const mountlar = []
  for (const v of f.volume ?? []) {
    const q = v.split(':')
    if (q.length === 1) { mountlar.push({ tur: 'volume', nom: null, manzil: q[0] }); continue }
    const [manba, manzil, rej = ''] = q
    if (manba.startsWith('/') || manba.startsWith('.')) mountlar.push({ tur: 'bind', manba: manba.startsWith('/') ? manba : ctx.cwd + '/' + manba, manzil, ro: rej.includes('ro') })
    else mountlar.push({ tur: 'volume', nom: manba, manzil, ro: rej.includes('ro') })
  }
  for (const m of f.mount ?? []) {
    const o = Object.fromEntries(m.split(',').map((x) => { const [a, b = 'true'] = x.split('='); return [a, b] }))
    const tur = o.type ?? 'volume'
    const manba = o.source ?? o.src, manzil = o.destination ?? o.dst ?? o.target
    const ro = 'ro' in o || 'readonly' in o
    if (tur === 'bind') mountlar.push({ tur, manba, manzil, ro, mount: true })
    else if (tur === 'tmpfs') mountlar.push({ tur, manzil })
    else mountlar.push({ tur: 'volume', nom: manba ?? null, manzil, ro })
  }
  for (const t of f.tmpfs ?? []) mountlar.push({ tur: 'tmpfs', manzil: t.split(':')[0] })
  const tarmoq = f.network ?? f.net ?? 'bridge'
  if (f.name != null && f.name.length < 2) throw rXato(`Error response from daemon: invalid container name (${f.name}): name must be at least 2 characters`)
  if (f.name != null && !/^\/?[a-zA-Z0-9][a-zA-Z0-9_.-]+$/.test(f.name)) throw rXato(`Error response from daemon: invalid container name (${f.name}): only [a-zA-Z0-9][a-zA-Z0-9_.-] are allowed`)
  if (f.detach && f.rm === undefined) { /* -d --rm ruxsat */ }
  // image
  if (!d.imageTop(image)) {
    let n
    try { n = nomTahlil(image) } catch (e) { throw rXato(e.message) }
    ctx.stderr.yoz(`Unable to find image '${nomMatn(n)}' locally\n`)
    try {
      const kod = await pull(image, { ...ctx, stdout: ctx.stderr }, d, { runIchida: true, toliqNom: false })
      if (kod) return 125
    } catch (e) { if (e instanceof DaemonXato) throw rXato('Error response from daemon: ' + e.message); throw e }
  }
  let k
  try {
    k = await d.yarat({
      image, nom: f.name ?? null, cmd, entrypoint: f.entrypoint ?? null, env, workdir: f.workdir ?? null, user: f.user ?? null,
      hostname: f.hostname ?? null, tty: !!f.tty, stdin: !!f.interactive, portlar, P: f['publish-all'], mountlar, tarmoq: tarmoq === 'host' || tarmoq === 'none' ? tarmoq : tarmoq,
      rm: !!f.rm, restart: f.restart ?? 'no', xotira: f.memory ?? 0, cpu: f.cpus ?? 0, labels: Object.fromEntries((f.label ?? []).map((x) => x.split('='))),
      init: !!f.init, stopTimeout: f['stop-timeout'] != null ? Number(f['stop-timeout']) : null, binds: (f.volume ?? []).length ? f.volume : null,
    })
  } catch (e) { if (e instanceof DaemonXato) throw rXato('Error response from daemon: ' + e.message, e.kod === 1 ? 125 : e.kod); throw e }
  if (f.init) k.init = true
  if (f['stop-signal']) k.config.stopSignal = f['stop-signal']
  if (nom === 'create') { ctx.stdout.yoz(k.id + '\n'); return 0 }
  const attach = !f.detach
  const stdin = f.interactive ? ctx.stdin : null
  const att = attach ? attachYarat(ctx, k, { stdin, tty: !!f.tty }) : null
  try {
    await d.boshla(k, { attach: att })
  } catch (e) {
    if (e instanceof DaemonXato) {
      if (f.detach && e.message.includes('port is already allocated')) ctx.stdout.yoz(k.id + '\n')
      const kod = e.kod === 1 ? 125 : e.kod
      if (k.hostConfig.rm && d.konteynerlar.has(k.id)) d.ochirKonteyner(k)
      throw rXato('Error response from daemon: ' + e.message, kod)
    }
    throw e
  }
  // -d: konteyner ishga tushishi (yozuvlarda run -d ~450 ms)
  if (f.detach) { await new Promise((r) => setTimeout(r, 220 + Math.random() * 120)); ctx.stdout.yoz(k.id + '\n'); return 0 }
  return await kutVaUzil(ctx, d, k, { rm: f.rm })
}

// --------------------------------------------------------------------------------------- inspect
function inspect(args, ctx, d, nom, tur) {
  const { f, pos } = tahlil(nom, args)
  if (!pos.length) throw kam(nom, 1)
  const natija = []
  const xatolar = []
  for (const ref of pos) {
    let o = null
    if (!tur || tur === 'container') { const k = d.konteynerTop(ref); if (k) o = konteynerJson(d, k) }
    if (!o && (!tur || tur === 'image')) { const im = d.imageTop(ref); if (im) o = imageJson(d, im) }
    if (!o && (!tur || tur === 'network')) { const t = d.tarmoqTop(ref); if (t) o = tarmoqJson(d, t) }
    if (!o && (!tur || tur === 'volume')) { const v = d.volumelar.get(ref); if (v) o = volumeJson(d, v) }
    if (o) natija.push(o); else xatolar.push(ref)
  }
  if (f.format) {
    const sh = shablon(f.format)
    for (const o of natija) ctx.stdout.yoz(sh(o) + '\n')
  } else ctx.stdout.yoz(goJsonIndent(natija) + '\n')
  if (xatolar.length) {
    for (const r of xatolar) {
      if (tur === 'container') ctx.stderr.yoz(`Error response from daemon: No such container: ${r}\n`)
      else if (tur === 'image') ctx.stderr.yoz(`Error response from daemon: No such image: ${r}\n`)
      else if (tur === 'network') ctx.stderr.yoz(`Error response from daemon: network ${r} not found\n`)
      else if (tur === 'volume') ctx.stderr.yoz(`Error response from daemon: get ${r}: no such volume\n`)
      else ctx.stderr.yoz(`error: no such object: ${r}\n`)
    }
    return 1
  }
  return 0
}
const NOL_VAQT = '0001-01-01T00:00:00Z'
function konteynerJson(d, k) {
  k.nano ??= rfc3339(k.yaratildi)
  const kd = `/var/lib/docker/containers/${k.id}`
  const tarmoqlar = {}
  for (const [tid, u] of k.tarmoqlar) {
    const t = d.tarmoqlar.get(tid)
    tarmoqlar[t.nom] = { IPAMConfig: null, Links: null, Aliases: null, DriverOpts: null, GwPriority: 0, NetworkID: t.id, EndpointID: u.endpoint, Gateway: t.gateway ?? '', IPAddress: u.ip, MacAddress: u.mac, IPPrefixLen: u.prefiks ?? 0, IPv6Gateway: '', GlobalIPv6Address: '', GlobalIPv6PrefixLen: 0, DNSNames: t.standart ? null : [k.nom, k.id.slice(0, 12)] }
  }
  if (!k.tarmoqlar.size) for (const tid of k.oldingiTarmoqlar ?? [d.tarmoqTop(k.hostConfig.tarmoq)?.id]) {
    const t = d.tarmoqlar.get(tid)
    if (t) tarmoqlar[t.nom] = { IPAMConfig: null, Links: null, Aliases: null, DriverOpts: null, GwPriority: 0, NetworkID: t.id, EndpointID: '', Gateway: '', IPAddress: '', MacAddress: '', IPPrefixLen: 0, IPv6Gateway: '', GlobalIPv6Address: '', GlobalIPv6PrefixLen: 0, DNSNames: null }
  }
  const pb = {}
  const st = (o) => Object.defineProperty(o, '__struct', { value: true, enumerable: false })
  for (const p of k.hostConfig.portlar) (pb[`${p.ichki}/${p.proto}`] ??= []).push(st({ HostIp: p.ip, HostPort: p.tashqi }))
  const ports = {}
  if (k.holat === 'running') {
    for (const e of Object.keys(k.config.exposed)) ports[e] = null
    for (const b of k.portBerildi) { const kk = `${b.ichki}/${b.proto}`; if (!ports[kk]) ports[kk] = []; ports[kk].push(st({ HostIp: b.ip, HostPort: b.tashqi })) }
  }
  const sandbox = k.sandbox ??= (k.holat === 'running' ? hexId() : '')
  return {
    Id: k.id, Created: k.nano, Path: [...k.config.entrypoint, ...k.config.cmd][0] ?? '', Args: [...k.config.entrypoint, ...k.config.cmd].slice(1),
    State: { Status: k.holat, Running: k.holat === 'running' || k.holat === 'paused', Paused: k.holat === 'paused', Restarting: k.holat === 'restarting', OOMKilled: false, Dead: false, Pid: k.holat === 'running' ? k.pid : 0, ExitCode: k.chiqishKodi, Error: k.xatoMatn ?? '', StartedAt: k.boshlandi ? (k.boshlandiNano ??= rfc3339(k.boshlandi)) : NOL_VAQT, FinishedAt: k.tugadi ? rfc3339(k.tugadi) : NOL_VAQT },
    Image: k.imageId, ResolvConfPath: `${kd}/resolv.conf`, HostnamePath: `${kd}/hostname`, HostsPath: `${kd}/hosts`, LogPath: `${kd}/${k.id}-json.log`,
    Name: '/' + k.nom, RestartCount: k.restartSoni, Driver: 'overlayfs', Platform: 'linux', MountLabel: '', ProcessLabel: '', AppArmorProfile: 'docker-default', ExecIDs: k.execlar.size ? [...k.execlar.keys()].map(() => hexId()) : null,
    HostConfig: {
      Binds: k.hostConfig.binds, ContainerIDFile: '', LogConfig: { Type: 'json-file', Config: {} }, NetworkMode: k.hostConfig.tarmoq, PortBindings: pb,
      RestartPolicy: { Name: k.hostConfig.restart.split(':')[0], MaximumRetryCount: 0 }, AutoRemove: k.hostConfig.rm, VolumeDriver: '', VolumesFrom: null, ConsoleSize: [30, 100],
      CapAdd: null, CapDrop: null, CgroupnsMode: 'private', Dns: null, DnsOptions: [], DnsSearch: [], ExtraHosts: null, GroupAdd: null, IpcMode: 'private', Cgroup: '', Links: null,
      OomScoreAdj: 0, PidMode: '', Privileged: false, PublishAllPorts: k.hostConfig.hammaPort, ReadonlyRootfs: false, SecurityOpt: null, UTSMode: '', UsernsMode: '', ShmSize: 67108864, Runtime: 'runc', Isolation: '',
      CpuShares: 0, Memory: baytga(k.hostConfig.xotira), NanoCpus: Math.round(Number(k.hostConfig.cpu || 0) * 1e9), CgroupParent: '', BlkioWeight: 0, BlkioWeightDevice: [], BlkioDeviceReadBps: [], BlkioDeviceWriteBps: [], BlkioDeviceReadIOps: [], BlkioDeviceWriteIOps: [],
      CpuPeriod: 0, CpuQuota: 0, CpuRealtimePeriod: 0, CpuRealtimeRuntime: 0, CpusetCpus: '', CpusetMems: '', Devices: [], DeviceCgroupRules: null, DeviceRequests: null, MemoryReservation: 0, MemorySwap: k.hostConfig.xotira ? baytga(k.hostConfig.xotira) * 2 : 0, MemorySwappiness: null, OomKillDisable: null, PidsLimit: null, Ulimits: null, CpuCount: 0, CpuPercent: 0, IOMaximumIOps: 0, IOMaximumBandwidth: 0,
      MaskedPaths: ['/proc/acpi', '/proc/asound', '/proc/interrupts', '/proc/kcore', '/proc/keys', '/proc/latency_stats', '/proc/sched_debug', '/proc/scsi', '/proc/timer_list', '/proc/timer_stats', '/sys/devices/virtual/powercap', '/sys/firmware'],
      ReadonlyPaths: ['/proc/bus', '/proc/fs', '/proc/irq', '/proc/sys', '/proc/sysrq-trigger'],
    },
    Storage: { RootFS: { Snapshot: { Name: 'overlayfs' } } },
    Mounts: k.mountlar.map((m) => (m.tur === 'volume'
      ? { Type: 'volume', Name: m.nom, Source: `/var/lib/docker/volumes/${m.nom}/_data`, Destination: m.manzil, Driver: 'local', Mode: m.anonim ? '' : 'z', RW: !m.ro, Propagation: '' }
      : m.tur === 'bind' ? { Type: 'bind', Source: m.manba, Destination: m.manzil, Mode: '', RW: !m.ro, Propagation: 'rprivate' }
        : { Type: 'tmpfs', Source: '', Destination: m.manzil, Mode: '', RW: true, Propagation: '' })),
    Config: {
      Hostname: k.config.hostname, Domainname: '', User: k.config.user, AttachStdin: !!k.config.stdin && !!k.config.attach, AttachStdout: false, AttachStderr: false,
      ...(Object.keys(k.config.exposed).length ? { ExposedPorts: k.config.exposed } : {}),
      Tty: k.config.tty, OpenStdin: k.config.stdin, StdinOnce: false, Env: k.config.env, Cmd: k.config.cmd.length ? k.config.cmd : null, Image: k.image, Volumes: null,
      WorkingDir: k.config.workdir, Entrypoint: k.config.entrypoint.length ? k.config.entrypoint : null, Labels: k.config.labels, ...(k.config.stopSignal ? { StopSignal: k.config.stopSignal } : {}),
    },
    NetworkSettings: { SandboxID: sandbox, SandboxKey: sandbox ? `/var/run/docker/netns/${sandbox.slice(0, 12)}` : '', Ports: ports, Networks: tarmoqlar },
    ImageManifestDescriptor: k.im.kat.manifestDescriptor,
  }
}
const hexId = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('')
function baytga(x) {
  if (!x) return 0
  const m = /^(\d+(?:\.\d+)?)([bkmg]?)b?$/i.exec(String(x))
  if (!m) return 0
  return Math.round(Number(m[1]) * { '': 1, b: 1, k: 1024, m: 1024 ** 2, g: 1024 ** 3 }[m[2].toLowerCase()])
}
function imageJson(d, im) {
  const k = im.kat
  return {
    Id: im.id, RepoTags: [...im.teglar].filter((t) => !t.includes('@')), RepoDigests: [`${im.repo}@${im.id}`], Comment: k.comment, Created: k.yaratilgan,
    Config: k.config, Architecture: 'amd64', Os: 'linux', Size: k.unpacked, RootFS: { Type: 'layers', Layers: k.rootfs },
    Metadata: { LastTagTime: rfc3339(im.oxirgiTeg ?? im.qoshildi) },
    Descriptor: { mediaType: 'application/vnd.oci.image.index.v1+json', digest: im.id, size: k.descriptorSize },
    Identity: { Pull: [{ Repository: `docker.io/library/${im.repo}` }] },
  }
}
function tarmoqJson(d, t) {
  t.nano ??= rfc3339(t.yaratildi)
  const konteynerlar = {}
  for (const [kid, u] of t.ulanishlar) { const k = d.konteynerlar.get(kid); if (k) konteynerlar[kid] = { Name: k.nom, EndpointID: u.endpoint, MacAddress: u.mac, IPv4Address: `${u.ip}/${u.prefiks}`, IPv6Address: '' } }
  const asosiy = { Name: t.nom, Id: t.id, Created: t.nano, Scope: 'local', Driver: t.drayver, EnableIPv4: true, EnableIPv6: false }
  if (t.drayver !== 'bridge') return { ...asosiy, IPAM: { Driver: 'default', Options: null, Config: null }, Internal: false, Attachable: false, Ingress: false, ConfigFrom: { Network: '' }, ConfigOnly: false, Options: {}, Labels: {}, Containers: konteynerlar, Status: null }
  return {
    ...asosiy,
    IPAM: { Driver: 'default', Options: t.standart ? null : {}, Config: [{ Subnet: t.subnet, Gateway: t.gateway }] },
    Internal: !!t.ichki, Attachable: false, Ingress: false, ConfigFrom: { Network: '' }, ConfigOnly: false,
    Options: t.standart ? { 'com.docker.network.bridge.default_bridge': 'true', 'com.docker.network.bridge.enable_icc': 'true', 'com.docker.network.bridge.enable_ip_masquerade': 'true', 'com.docker.network.bridge.host_binding_ipv4': '0.0.0.0', 'com.docker.network.bridge.name': 'docker0', 'com.docker.network.driver.mtu': '1500' } : {},
    Labels: {}, Containers: konteynerlar,
    Status: { IPAM: { Subnets: { [t.subnet]: { IPsInUse: 3 + t.ulanishlar.size, DynamicIPsAvailable: 2 ** (32 - Number(t.subnet.split('/')[1])) - 3 - t.ulanishlar.size } } } },
  }
}
function volumeJson(d, v) {
  return { CreatedAt: rfc3339s(v.yaratildi), Driver: 'local', Labels: v.labels, Mountpoint: `/var/lib/docker/volumes/${v.nom}/_data`, Name: v.nom, Options: null, Scope: 'local' }
}
