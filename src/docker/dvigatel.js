// Docker daemon modeli (dockerd + containerd o'rnida). Holat: image'lar, konteynerlar, tarmoqlar, volume'lar.
// Har xatti-harakat va xato matni sinov VPS'idagi Docker Engine 29.9.3 dan yozib olingan (docker-trenajor/yozuv).
// Bu yerda Docker ishlamaydi: konteyner ichidagi dasturlar (nginx, sleep, sh …) dasturlar.js da modellashtirilgan.
import { hex, mac, rfc3339 } from './birlik.js'
import { tasodifiyNom } from './nomlar.js'
import { signalRaqam, dasturTop, Jarayon } from './dasturlar.js'
import { OverlayFs, DaraxtFs, VirtualFs, daraxtQur, tugun, normal } from './vfs.js'

export class DaemonXato extends Error {
  constructor(xabar, { kod = 1, prefiks = true } = {}) { super(xabar); this.kod = kod; this.prefiks = prefiks }
}
// "Error response from daemon: ..." — CLI shunday chiqaradi
const xato = (m, o) => new DaemonXato(m, o)

const STD_PATH = 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'

// --------------------------------------------------------------------------------------------- image nomlari
// "nginx" → { repo: 'nginx', tag: 'latest', toliq: 'docker.io/library/nginx:latest' }
export function nomTahlil(ref) {
  let digest = null, tag = null, r = ref
  const at = r.indexOf('@')
  if (at >= 0) { digest = r.slice(at + 1); r = r.slice(0, at) }
  const ikki = r.lastIndexOf(':')
  if (ikki > r.lastIndexOf('/')) { tag = r.slice(ikki + 1); r = r.slice(0, ikki) }
  let domen = 'docker.io', yol = r
  const birinchi = r.split('/')[0]
  if (r.includes('/') && (birinchi.includes('.') || birinchi.includes(':') || birinchi === 'localhost')) { domen = birinchi; yol = r.slice(birinchi.length + 1) }
  else if (!r.includes('/')) yol = 'library/' + r
  if (!/^[a-z0-9]+(?:(?:[._]|__|-+)[a-z0-9]+)*(?:\/[a-z0-9]+(?:(?:[._]|__|-+)[a-z0-9]+)*)*$/.test(yol)) {
    if (/[A-Z]/.test(yol)) throw xato(`invalid reference format: repository name (${yol}) must be lowercase`, { prefiks: false })
    throw xato('invalid reference format', { prefiks: false })
  }
  if (digest && !/^sha256:[0-9a-f]{64}$/.test(digest)) throw xato('invalid reference format', { prefiks: false })
  if (tag != null && !/^[\w][\w.-]{0,127}$/.test(tag)) throw xato('invalid reference format', { prefiks: false })
  const qisqa = domen === 'docker.io' ? yol.replace(/^library\//, '') : `${domen}/${yol}`
  return { domen, yol, qisqa, tag: tag ?? (digest ? null : 'latest'), digest, tagBerilgan: tag != null }
}
export const nomMatn = (n) => n.qisqa + (n.digest ? '@' + n.digest : ':' + n.tag)

// --------------------------------------------------------------------------------------------- Daemon
export class Daemon {
  // katalog — data/katalog.json (registry'dagi image'lar: digest, config, qatlamlar); fsYukla(nom) — fayl tizimi JSON
  constructor({ katalog, fsYukla, hostFs, hostIp = '203.0.113.10' }) {
    this.katalog = katalog
    this.fsYukla = fsYukla
    this.hostFs = hostFs
    this.hostIp = hostIp
    this.boshlandi = Date.now()
    this.id = crypto.randomUUID()
    this.imagelar = new Map()       // id (index digest) → image
    this.teglar = new Map()         // 'nginx:1.29' → id;  'debian@sha256:…' → id
    this.konteynerlar = new Map()   // id → konteyner
    this.tarmoqlar = new Map()      // id → tarmoq
    this.volumelar = new Map()      // nom → volume
    this.portlar = new Map()        // '0.0.0.0:8080/tcp' → konteyner id
    this.tinglovchilar = new Set()
    this.voqealar = []
    this.fsKesh = new Map()
    this.keyingiPid = 400
    this.tarmoqYarat({ nom: 'bridge', drayver: 'bridge', subnet: '172.17.0.0/16', standart: true })
    this.tarmoqYarat({ nom: 'host', drayver: 'host' })
    this.tarmoqYarat({ nom: 'none', drayver: 'null' })
  }

  // UI va `docker events` uchun hodisalar
  tingla(f) { this.tinglovchilar.add(f); return () => this.tinglovchilar.delete(f) }
  hodisa(tur, amal, obyekt, qoshimcha = {}) {
    const h = { tur, amal, id: obyekt?.id ?? obyekt, nom: obyekt?.nom, vaqt: Date.now(), ...qoshimcha }
    for (const f of this.tinglovchilar) { try { f(h) } catch (e) { console.error(e) } }
  }

  // ------------------------------------------------------------------------------------- image'lar
  imageTop(ref) {
    if (this.teglar.has(ref)) return this.imagelar.get(this.teglar.get(ref))
    let n
    try { n = nomTahlil(ref) } catch { n = null }
    if (n) {
      const k = nomMatn(n)
      if (this.teglar.has(k)) return this.imagelar.get(this.teglar.get(k))
      if (n.digest) for (const im of this.imagelar.values()) if (im.id === n.digest && im.repo === n.qisqa) return im
    }
    // qisqa ID: 3f4d6b32e267 yoki sha256:…
    const h = ref.replace(/^sha256:/, '')
    if (/^[0-9a-f]{4,64}$/.test(h)) {
      const mos = [...this.imagelar.values()].filter((im) => im.id.slice(7).startsWith(h))
      if (mos.length === 1) return mos[0]
    }
    return null
  }
  // registry'da (katalogda) bormi: { kat, nom }
  registrydan(ref) {
    const n = nomTahlil(ref)
    if (n.domen !== 'docker.io') return { n, kat: null, sabab: 'registry' }
    const tegli = n.digest ? null : `${n.qisqa}:${n.tag}`
    const kat = n.digest ? Object.values(this.katalog.imagelar).find((k) => k.id === n.digest && k.repo === n.qisqa) : this.katalog.imagelar[this.katalog.teglar[tegli]]
    const repoBor = Object.values(this.katalog.imagelar).some((k) => k.repo === n.qisqa) || this.katalog.repolar?.includes(n.qisqa)
    return { n, kat: kat ?? null, repoBor }
  }
  imageQosh(kat, n) {
    let im = this.imagelar.get(kat.id)
    const yangi = !im
    if (!im) {
      im = { id: kat.id, repo: kat.repo, kat, teglar: new Set(), qoshildi: Date.now() }
      this.imagelar.set(kat.id, im)
    }
    const nom = n.digest && !n.tagBerilgan ? `${n.qisqa}@${n.digest}` : `${n.qisqa}:${n.tag}`
    const oldin = this.teglar.get(nom)
    if (oldin && oldin !== kat.id) this.tegOlib(nom)
    this.teglar.set(nom, kat.id)
    im.teglar.add(nom)
    im.oxirgiTeg = Date.now()
    this.hodisa('image', yangi ? 'pull' : 'tag', im, { nom })
    return { im, yangi, oldin }
  }
  tegOlib(nom) {
    const id = this.teglar.get(nom)
    if (!id) return
    this.teglar.delete(nom)
    const im = this.imagelar.get(id)
    im?.teglar.delete(nom)
  }
  ishlatyapti(im) { return [...this.konteynerlar.values()].filter((k) => k.imageId === im.id) }
  imageOchir(im) {
    for (const t of im.teglar) this.teglar.delete(t)
    im.teglar.clear()
    this.imagelar.delete(im.id)
    this.hodisa('image', 'delete', im)
  }
  tag(manba, maqsad) {
    const im = this.imageTop(manba)
    if (!im) throw xato(`No such image: ${manba}`)
    const n = nomTahlil(maqsad)
    if (n.digest) throw xato(`refusing to create a tag with a digest reference`)
    const nom = `${n.qisqa}:${n.tag}`
    if (this.teglar.get(nom) && this.teglar.get(nom) !== im.id) this.tegOlib(nom)
    this.teglar.set(nom, im.id)
    im.teglar.add(nom)
    im.oxirgiTeg = Date.now()
    this.hodisa('image', 'tag', im, { nom })
  }
  async imageFs(im) {
    const fayl = im.kat.fs
    if (!this.fsKesh.has(fayl)) this.fsKesh.set(fayl, this.fsYukla(fayl).then(daraxtQur))
    return this.fsKesh.get(fayl)
  }

  // ------------------------------------------------------------------------------------- tarmoqlar
  tarmoqYarat({ nom, drayver = 'bridge', subnet = null, gateway = null, standart = false, ichki = false, labels = {} }) {
    for (const t of this.tarmoqlar.values()) if (t.nom === nom) throw xato(`network with name ${nom} already exists`)
    if (drayver === 'bridge' && !subnet) subnet = this.bushSubnet()
    let gw = gateway
    if (subnet && !gw) { const [a] = subnet.split('/'); const q = a.split('.').map(Number); q[3] += 1; gw = q.join('.') }
    const t = {
      id: hex(64), nom, drayver, subnet, gateway: gw, standart, ichki, labels,
      yaratildi: Date.now(), nano: null, ulanishlar: new Map(), // konteyner id → { ip, mac, endpoint }
    }
    this.tarmoqlar.set(t.id, t)
    this.hodisa('network', 'create', t)
    return t
  }
  bushSubnet() {
    const band = new Set([...this.tarmoqlar.values()].map((t) => t.subnet).filter(Boolean))
    for (let i = 17; i < 32; i++) if (!band.has(`172.${i}.0.0/16`)) return `172.${i}.0.0/16`
    for (let i = 0; i < 256; i++) if (!band.has(`192.168.${i * 16}.0/20`)) return `192.168.${i * 16}.0/20`
    throw xato('all predefined address pools have been fully subnetted')
  }
  tarmoqTop(ref) {
    for (const t of this.tarmoqlar.values()) if (t.nom === ref || t.id === ref) return t
    const mos = [...this.tarmoqlar.values()].filter((t) => t.id.startsWith(ref))
    return mos.length === 1 ? mos[0] : null
  }
  ipBer(t) {
    const [manzil, prefiks] = t.subnet.split('/')
    const q = manzil.split('.').map(Number)
    const asos = ((q[0] << 24) >>> 0) + (q[1] << 16) + (q[2] << 8) + q[3]
    const hajmi = 2 ** (32 - Number(prefiks))
    const band = new Set([...t.ulanishlar.values()].map((u) => u.ip))
    for (let i = 2; i < hajmi - 1; i++) {
      const n = asos + i
      const ip = [n >>> 24, (n >> 16) & 255, (n >> 8) & 255, n & 255].join('.')
      if (ip !== t.gateway && !band.has(ip)) return ip
    }
    throw xato('no available IPv4 addresses on this network')
  }
  ulash(t, k, { aliaslar = [] } = {}) {
    if (t.drayver === 'host' || t.drayver === 'null') { k.tarmoqlar.set(t.id, { ip: '', mac: '', endpoint: hex(64), aliaslar }); return }
    const u = { ip: this.ipBer(t), mac: mac(), endpoint: hex(64), aliaslar, prefiks: Number(t.subnet.split('/')[1]) }
    t.ulanishlar.set(k.id, u)
    k.tarmoqlar.set(t.id, u)
    this.hodisa('network', 'connect', t, { konteyner: k.id })
    this.voqea('network', 'connect', t.id, { container: k.id, name: t.nom, type: t.drayver })
  }
  uzish(t, k) {
    t.ulanishlar.delete(k.id)
    k.tarmoqlar.delete(t.id)
    this.hodisa('network', 'disconnect', t, { konteyner: k.id })
  }
  tarmoqOchir(t) {
    if (t.standart || t.drayver === 'host' || t.drayver === 'null') throw xato(`${t.nom} is a pre-defined network and cannot be removed`)
    if (t.ulanishlar.size) {
      const [kid, u] = [...t.ulanishlar][0]
      throw xato(`error while removing network: network ${t.nom} has active endpoints (name:"${this.konteynerlar.get(kid)?.nom}" id:"${u.endpoint.slice(0, 12)}")`, { keyin: 'exit status 1' })
    }
    // to'xtagan konteynerlar ro'yxatdan chiqadi
    for (const k of this.konteynerlar.values()) if (k.hostConfig.tarmoq === t.nom) { /* real Docker: ochirishga ruxsat beradi */ }
    this.tarmoqlar.delete(t.id)
    this.hodisa('network', 'destroy', t)
  }

  // ------------------------------------------------------------------------------------- volume'lar
  volumeYarat(nom, { anonim = false, labels = null } = {}) {
    if (!nom) { nom = hex(64); anonim = true }
    if (this.volumelar.has(nom)) return this.volumelar.get(nom)
    if (!anonim && !/^[a-zA-Z0-9][a-zA-Z0-9_.-]+$/.test(nom)) {
      if (nom.length < 2) throw xato(`create ${nom}: volume name is too short, names should be at least two alphanumeric characters`)
      throw xato(`create ${nom}: "${nom}" includes invalid characters for a local volume name, only "[a-zA-Z0-9][a-zA-Z0-9_.-]" are allowed. If you intended to pass a host directory, use absolute path`)
    }
    const v = { nom, anonim, labels: labels ?? (anonim ? { 'com.docker.volume.anonymous': '' } : null), yaratildi: Date.now(), fs: new DaraxtFs(tugun('d')), toldirildi: false }
    this.volumelar.set(nom, v)
    this.hodisa('volume', 'create', { id: nom, nom })
    return v
  }
  volumeIshlatuvchilar(v) { return [...this.konteynerlar.values()].filter((k) => k.mountlar.some((m) => m.tur === 'volume' && m.nom === v.nom)) }
  volumeOchir(nom, { majburiy = false } = {}) {
    const v = this.volumelar.get(nom)
    if (!v) { if (majburiy) return; throw xato(`get ${nom}: no such volume`) }
    const u = this.volumeIshlatuvchilar(v)
    if (u.length) throw xato(`remove ${nom}: volume is in use - [${u.map((k) => k.id).join(', ')}]`)
    this.volumelar.delete(nom)
    this.hodisa('volume', 'destroy', { id: nom, nom })
  }
  volumeHajm(v) { let s = 0; const yur = (n) => { if (n.k === 'f') s += n.s; if (n.b) for (const x of n.b.values()) yur(x) }; yur(v.fs.ildiz); return s }

  // ------------------------------------------------------------------------------------- konteynerlar
  konteynerTop(ref) {
    if (!ref) return null
    const r = ref.replace(/^\//, '')
    for (const k of this.konteynerlar.values()) if (k.nom === r) return k
    if (this.konteynerlar.has(ref)) return this.konteynerlar.get(ref)
    const mos = [...this.konteynerlar.values()].filter((k) => k.id.startsWith(ref))
    if (mos.length > 1) throw xato(`multiple containers found with provided prefix: ${ref}`)
    return mos[0] ?? null
  }
  konteynerKerak(ref) {
    const k = this.konteynerTop(ref)
    if (!k) throw xato(`No such container: ${ref}`)
    return k
  }

  // docker create: { image, nom, cmd, entrypoint, env, workdir, user, hostname, tty, stdin, portlar, mountlar, tarmoq, rm, cheklov, restart }
  async yarat(o) {
    const im = this.imageTop(o.image)
    if (!im) throw xato(`No such image: ${o.image}`)
    if (o.nom != null) {
      if (o.nom.length < 2) throw xato(`invalid container name (${o.nom}): name must be at least 2 characters`)
      if (!/^\/?[a-zA-Z0-9][a-zA-Z0-9_.-]+$/.test(o.nom)) throw xato(`invalid container name (${o.nom}): only [a-zA-Z0-9][a-zA-Z0-9_.-] are allowed`)
      const band = this.konteynerTop(o.nom.replace(/^\//, ''))
      if (band && band.nom === o.nom.replace(/^\//, '')) throw xato(`Conflict. The container name "/${band.nom}" is already in use by container "${band.id}". You have to remove (or rename) that container to be able to reuse that name.`)
    }
    const c = im.kat.config
    const id = hex(64)
    const nom = o.nom?.replace(/^\//, '') ?? tasodifiyNom((n) => [...this.konteynerlar.values()].some((k) => k.nom === n))
    const entrypoint = o.entrypoint != null ? (o.entrypoint === '' ? [] : [o.entrypoint]) : c.Entrypoint ?? []
    const cmd = o.cmd?.length ? o.cmd : o.entrypoint != null ? [] : c.Cmd ?? []
    // tarmoq
    let tarmoq = this.tarmoqTop(o.tarmoq ?? 'bridge')
    if (!tarmoq) throw xato(`network ${o.tarmoq} not found`)
    // mount'lar: -v nom:/yol, -v /host:/yol[:ro], -v /yol (anonim), --mount, --tmpfs
    const mountlar = []
    for (const m of o.mountlar ?? []) {
      if (m.tur === 'bind') {
        if (!this.hostFs.bormi(m.manba)) {
          if (m.mount) throw xato(`invalid mount config for type "bind": bind source path does not exist: ${m.manba}`)
          this.hostFs.papka(m.manba, { ota: true }) // -v bilan: Docker papkani o'zi yaratadi
        }
      }
      mountlar.push({ ...m })
    }
    const k = {
      id, nom, image: o.image, imageId: im.id, im,
      yaratildi: Date.now(), nano: null,
      config: {
        hostname: o.hostname ?? id.slice(0, 12), user: o.user ?? c.User ?? '', env: [...(o.env ?? []), ...(c.Env ?? [STD_PATH]).filter((e) => !(o.env ?? []).some((x) => x.split('=')[0] === e.split('=')[0]))],
        cmd, entrypoint, workdir: o.workdir ?? c.WorkingDir ?? '', tty: !!o.tty, stdin: !!o.stdin, labels: { ...(c.Labels ?? {}), ...(o.labels ?? {}) },
        exposed: { ...(c.ExposedPorts ?? {}), ...Object.fromEntries((o.portlar ?? []).map((p) => [`${p.ichki}/${p.proto}`, {}])) },
        stopSignal: c.StopSignal ?? null, stopTimeout: o.stopTimeout ?? null, attach: o.attach ?? null,
      },
      hostConfig: { portlar: o.portlar ?? [], hammaPort: !!o.P, rm: !!o.rm, tarmoq: tarmoq.nom, restart: o.restart ?? 'no', xotira: o.xotira ?? 0, cpu: o.cpu ?? 0, binds: o.binds ?? null },
      mountlar,
      tarmoqlar: new Map(), // tarmoq id → ulanish
      holat: 'created', pid: 0, chiqishKodi: 0, boshlandi: null, tugadi: null, oom: false, restartSoni: 0, xatoMatn: '',
      loglar: [], // { vaqt, oqim: 'stdout'|'stderr', matn }
      jarayon: null, execlar: new Map(), portBerildi: [],
    }
    // anonim volume'lar: -v /data va image VOLUME
    for (const m of k.mountlar) if (m.tur === 'volume' && !m.nom) { m.nom = this.volumeYarat(null, { anonim: true }).nom; m.anonim = true }
    for (const m of k.mountlar) if (m.tur === 'volume' && !this.volumelar.has(m.nom)) this.volumeYarat(m.nom)
    this.konteynerlar.set(id, k)
    this.hodisa('container', 'create', k)
    this.voqea('container', 'create', id, this.kAttr(k))
    return k
  }

  // fayl tizimi: image qatlamlari + yuqori qatlam + mount'lar (/etc/hosts, hostname, resolv.conf — Docker'ning o'zi qo'yadi)
  async fsTayyorla(k) {
    if (k.fs) return k.fs
    const past = await this.imageFs(k.im)
    const mountlar = []
    for (const m of k.mountlar) {
      if (m.tur === 'volume') {
        const v = this.volumelar.get(m.nom)
        // bo'sh volume birinchi ulanishda image'dagi shu papka mazmuni bilan to'ldiriladi (Docker hujjati: Volumes)
        if (!v.toldirildi && !v.fs.royxat('/').length) {
          const pastFs = new DaraxtFs(past)
          const n = (() => { try { return pastFs.stat(m.manzil) } catch { return null } })()
          if (n && n.k === 'd') v.fs.ildiz.b = klon(n).b
        }
        v.toldirildi = true
        m.yangiPapka = !new DaraxtFs(past).bormi(m.manzil)
        mountlar.push({ yol: normal(m.manzil), fs: v.fs, ro: !!m.ro, tur: 'volume', nom: m.nom })
      } else if (m.tur === 'bind') {
        m.yangiPapka = !new DaraxtFs(past).bormi(m.manzil)
        mountlar.push({ yol: normal(m.manzil), fs: new KichikFs(this.hostFs, m.manba), ro: !!m.ro, tur: 'bind' })
      } else if (m.tur === 'tmpfs') {
        mountlar.push({ yol: normal(m.manzil), fs: new DaraxtFs(tugun('d', { m: 0o1777 })), ro: false, tur: 'tmpfs' })
      }
    }
    // Docker/runc ulaydigan maxsus tizimlar: /proc (198 link), /sys (13), /dev (tmpfs, 340 bayt) — yozuv: ls -l /
    const vaqt = () => Math.floor((k.boshlandi ?? Date.now()) / 1000)
    mountlar.push({ yol: '/proc', tur: 'proc', ro: false, fs: new VirtualFs({ nlink: 198, get t() { return vaqt() } }, {
      '/1/cmdline': () => (k.jarayon?.argv ?? []).join('\0') + '\0',
      '/1/status': () => `Name:\t${(k.jarayon?.argv[0] ?? '').split('/').pop()}\nPid:\t1\n`,
      '/meminfo': () => 'MemTotal:        1837336 kB\n',
      '/cpuinfo': () => 'processor\t: 0\n',
      '/mounts': () => 'overlay / overlay rw 0 0\n',
    }) })
    mountlar.push({ yol: '/sys', tur: 'sysfs', ro: true, fs: new VirtualFs({ nlink: 13 }, {
      '/fs/cgroup/memory.max': () => (k.hostConfig.xotira ? String(baytga(k.hostConfig.xotira)) : 'max') + '\n',
      '/fs/cgroup/cpu.max': () => (k.hostConfig.cpu ? `${Math.round(Number(k.hostConfig.cpu) * 100000)} 100000` : 'max 100000') + '\n',
    }) })
    mountlar.push({ yol: '/dev', tur: 'tmpfs', ro: false, fs: new VirtualFs({ nlink: 5, s: 340, m: 0o755, bloksiz: true, get t() { return vaqt() } }, { '/null': () => '', '/zero': () => '', '/urandom': () => '' }) })
    k.fs = new OverlayFs(past, mountlar)
    k.fs.ildizVaqt = Math.floor(k.yaratildi / 1000) // ildiz papka yuqori qatlamda (Docker /etc ga yozadi)
    return k.fs
  }

  // Docker'ning konteynerga yozadigan fayllari
  tizimFayllari(k) {
    const fs = k.fs
    const ip = [...k.tarmoqlar.values()].find((u) => u.ip)?.ip
    const hosts = ['127.0.0.1\tlocalhost', '::1\tlocalhost ip6-localhost ip6-loopback', 'fe00::\tip6-localnet', 'ff00::\tip6-mcastprefix', 'ff02::1\tip6-allnodes', 'ff02::2\tip6-allrouters']
    if (ip) hosts.push(`${ip}\t${k.config.hostname}`)
    const etc = (yol, matn, m = 0o644) => { try { fs.yuqori.set(yol, Object.assign(tugun('f', { c: matn, m }), { tizim: true })) } catch { /* yo'q */ } }
    if (!fs.yuqori.has('/.dockerenv')) etc('/.dockerenv', '', 0o755)
    etc('/etc/hosts', hosts.join('\n') + '\n')
    etc('/etc/hostname', k.config.hostname + '\n')
    const ichki = [...k.tarmoqlar.keys()].some((id) => { const t = this.tarmoqlar.get(id); return t && !t.standart && t.drayver === 'bridge' })
    etc('/etc/resolv.conf', ichki ? RESOLV_ICHKI : RESOLV_STANDART)
  }

  async boshla(k, { attach = null } = {}) {
    if (k.holat === 'running') return
    const fs = await this.fsTayyorla(k)
    // tarmoq
    if (!k.tarmoqlar.size) {
      this.ulash(this.tarmoqTop(k.hostConfig.tarmoq), k)
    }
    for (const qosh of k.qoshimchaTarmoq ?? []) if (!k.tarmoqlar.has(qosh.id)) this.ulash(qosh, k)
    this.tizimFayllari(k)
    // portlar
    try { this.portlarniBer(k) } catch (e) {
      for (const [tid] of k.tarmoqlar) { const t = this.tarmoqlar.get(tid); if (t) { t.ulanishlar.delete(k.id) } }
      k.tarmoqlar.clear()
      throw e
    }
    // dastur
    const argv = [...k.config.entrypoint, ...k.config.cmd]
    if (!argv.length) throw xato('no command specified', { kod: 125 })
    const top = dasturTop(k, argv[0])
    if (top.xato) {
      this.portlarniQaytar(k)
      for (const [tid] of k.tarmoqlar) this.tarmoqlar.get(tid)?.ulanishlar.delete(k.id)
      k.tarmoqlar.clear()
      k.holat = 'exited'
      k.chiqishKodi = top.kod
      k.xatoMatn = top.xato
      k.tugadi = Date.now()
      throw xato(`failed to create task for container: failed to create shim task: OCI runtime create failed: runc create failed: unable to start container process: error during container init: ${top.xato}`, { kod: top.kod })
    }
    k.holat = 'running'
    k.boshlandi = Date.now()
    k.tugadi = null
    k.pid = this.keyingiPid += 3 + Math.floor(Math.random() * 40)
    k.chiqishKodi = 0
    this.hodisa('container', 'start', k)
    this.voqea('container', 'start', k.id, this.kAttr(k))
    const j = new Jarayon(this, k, argv, { pid1: true, tty: k.config.tty, attach })
    k.jarayon = j
    j.tugash.then((kod) => this.tugadi(k, kod))
    j.ishga()
    return j
  }

  tugadi(k, kod) {
    if (k.jarayon == null) return
    k.jarayon = null
    k.holat = 'exited'
    k.chiqishKodi = kod
    k.tugadi = Date.now()
    k.pid = 0
    for (const e of k.execlar.values()) e.oldir?.(9)
    this.portlarniQaytar(k)
    for (const [tid] of k.tarmoqlar) {
      const t = this.tarmoqlar.get(tid)
      t?.ulanishlar.delete(k.id)
    }
    // tarmoq bog'lanishi saqlanadi (keyingi start'da qayta beriladi), lekin IP bo'shatiladi
    k.oldingiTarmoqlar = [...k.tarmoqlar.keys()]
    k.tarmoqlar.clear()
    this.hodisa('container', 'die', k, { kod })
    for (const tid of k.oldingiTarmoqlar) { const t = this.tarmoqlar.get(tid); if (t) this.voqea('network', 'disconnect', t.id, { container: k.id, name: t.nom, type: t.drayver }) }
    this.voqea('container', 'die', k.id, this.kAttr(k, { execDuration: String(Math.floor((k.tugadi - k.boshlandi) / 1000)), exitCode: String(kod) }))
    if (k.toxtatildi && k.stopVoqea) { this.voqea('container', 'stop', k.id, this.kAttr(k)); k.stopVoqea = false }
    if (k.hostConfig.rm) { this.ochirKonteyner(k, { v: true }); return }
    const r = k.hostConfig.restart
    if (!k.toxtatildi && (r === 'always' || r === 'unless-stopped' || (r.startsWith('on-failure') && kod !== 0))) {
      // qayta ishga tushirish: 100 ms dan boshlab har safar ikki barobar kutish (dockerd restart manager)
      k.holat = 'restarting'
      const kut = 100 * 2 ** Math.min(k.restartSoni, 8)
      k.restartSoni++
      // + konteynerni qayta yaratish vaqti (~300 ms)
      setTimeout(() => { if (k.holat === 'restarting' && this.konteynerlar.has(k.id)) { k.holat = 'exited'; this.boshla(k).catch(() => {}) } }, kut + 300)
    }
  }

  portlarniBer(k) {
    const berildi = []
    const so = (kalit) => this.portlar.get(kalit)
    let tasodifiy = 32768
    const roy = [...k.hostConfig.portlar]
    if (k.hostConfig.hammaPort) for (const e of Object.keys(k.config.exposed)) { const [p, proto] = e.split('/'); if (!roy.some((x) => x.ichki === p)) roy.push({ ichki: p, proto, tashqi: '', ip: '' }) }
    for (const p of roy) {
      const ipler = p.ip ? [p.ip] : ['0.0.0.0', '::']
      let tashqi = p.tashqi
      if (!tashqi) { while (so(`0.0.0.0:${tasodifiy}/${p.proto}`) || so(`127.0.0.1:${tasodifiy}/${p.proto}`)) tasodifiy++; tashqi = String(tasodifiy++) }
      for (const ip of ipler) {
        const kalit = `${ip}:${tashqi}/${p.proto}`
        const band = so(kalit) || (ip === '0.0.0.0' && [...this.portlar.keys()].some((x) => x.endsWith(`:${tashqi}/${p.proto}`) && !x.startsWith('[') && !x.startsWith('::')))
        if (band && band !== k.id) {
          for (const b of berildi) this.portlar.delete(b.kalit)
          const ep = [...k.tarmoqlar.values()][0]?.endpoint ?? hex(64)
          throw xato(`failed to set up container networking: driver failed programming external connectivity on endpoint ${k.nom} (${ep}): Bind for ${ip === '::' ? '[::]' : ip}:${tashqi} failed: port is already allocated`, { kod: 125 })
        }
        this.portlar.set(kalit, k.id)
        berildi.push({ kalit, ip, tashqi, ichki: p.ichki, proto: p.proto })
      }
    }
    k.portBerildi = berildi
  }
  portlarniQaytar(k) {
    for (const b of k.portBerildi) if (this.portlar.get(b.kalit) === k.id) this.portlar.delete(b.kalit)
    k.portBerildi = []
  }

  // docker stop: StopSignal (standart SIGTERM), `-t` soniya kutib, keyin SIGKILL
  async toxtat(k, { vaqt = null, signal = null } = {}) {
    if (k.holat !== 'running' && k.holat !== 'paused') return
    k.toxtatildi = true
    k.stopVoqea = true
    const j = k.jarayon
    const sig = signal ?? k.config.stopSignal ?? 'SIGTERM'
    this.voqea('container', 'kill', k.id, this.kAttr(k, { signal: String(signalRaqam(sig)) }))
    const kut = (vaqt ?? k.config.stopTimeout ?? 10) * 1000
    j.signal(sig)
    const natija = await Promise.race([j.tugash.then(() => true), new Promise((r) => setTimeout(() => r(false), kut))])
    if (!natija) { this.voqea('container', 'kill', k.id, this.kAttr(k, { signal: '9' })); j.signal('SIGKILL'); await j.tugash }
    await new Promise((r) => setTimeout(r, 40))
  }
  async oldir(k, sig = 'SIGKILL') {
    if (k.holat !== 'running') throw xato(`cannot kill container: ${k.nom}: container ${k.id} is not running`)
    k.toxtatildi = true
    this.voqea('container', 'kill', k.id, this.kAttr(k, { signal: String(signalRaqam(sig)) }))
    k.jarayon.signal(sig)
    if (signalRaqam(sig) === 9) await k.jarayon.tugash
  }

  ochirKonteyner(k, { v = false } = {}) {
    if (!this.konteynerlar.has(k.id)) return
    this.portlarniQaytar(k)
    for (const [tid] of k.tarmoqlar) this.tarmoqlar.get(tid)?.ulanishlar.delete(k.id)
    this.konteynerlar.delete(k.id)
    this.voqea('container', 'destroy', k.id, this.kAttr(k))
    if (v) for (const m of k.mountlar) if (m.tur === 'volume' && m.anonim) { try { this.volumeOchir(m.nom) } catch { /* ishlatilyapti */ } }
    this.hodisa('container', 'destroy', k)
  }

  // ------------------------------------------------------------------------------------- tarmoq ichidagi aloqa
  // konteyner (yoki host) dan nom/IP bo'yicha manzil topish. Natija: { ip, konteyner } | { xato: 'bad address' }
  nomHal(kimdan, nom) {
    if (/^\d+\.\d+\.\d+\.\d+$/.test(nom)) return { ip: nom }
    if (nom === 'localhost') return { ip: '127.0.0.1' }
    if (kimdan) {
      // faqat o'z (user-defined) tarmoqlarida Docker DNS (127.0.0.11) nom beradi
      for (const [tid] of kimdan.tarmoqlar) {
        const t = this.tarmoqlar.get(tid)
        if (!t || t.standart || t.drayver !== 'bridge') continue
        for (const [kid, u] of t.ulanishlar) {
          const k = this.konteynerlar.get(kid)
          if (k && (k.nom === nom || k.id.startsWith(nom) && nom.length >= 12 || u.aliaslar.includes(nom) || k.config.hostname === nom)) return { ip: u.ip, konteyner: k }
        }
      }
      if (nom === kimdan.config.hostname) return { ip: [...kimdan.tarmoqlar.values()][0]?.ip || '127.0.0.1', konteyner: kimdan }
    }
    return { xato: 'bad address' }
  }
  // ip:port ga TCP ulanish: { konteyner, port } | { xato: 'refused'|'timeout'|'unreachable' }
  ulanish(kimdan, ip, port) {
    if (ip === '127.0.0.1' || ip === '::1') {
      if (kimdan) return this.ichkiPort(kimdan, port) ? { konteyner: kimdan, port } : { xato: 'refused' }
      // host: e'lon qilingan port
      const kid = this.portlar.get(`127.0.0.1:${port}/tcp`) ?? this.portlar.get(`0.0.0.0:${port}/tcp`)
      if (!kid) return { xato: 'refused' }
      const pb = this.konteynerlar.get(kid).portBerildi.find((b) => b.tashqi === String(port))
      return { konteyner: this.konteynerlar.get(kid), port: Number(pb.ichki), tashqi: true }
    }
    if (ip === this.hostIp || ip === '0.0.0.0') {
      const kid = this.portlar.get(`0.0.0.0:${port}/tcp`)
      if (!kid) return kimdan ? { xato: 'refused' } : { xato: 'refused' }
      const pb = this.konteynerlar.get(kid).portBerildi.find((b) => b.tashqi === String(port))
      return { konteyner: this.konteynerlar.get(kid), port: Number(pb.ichki), tashqi: true }
    }
    // gateway (host) manzili
    for (const t of this.tarmoqlar.values()) if (t.gateway === ip) {
      const kid = this.portlar.get(`0.0.0.0:${port}/tcp`)
      if (kid) { const pb = this.konteynerlar.get(kid).portBerildi.find((b) => b.tashqi === String(port)); return { konteyner: this.konteynerlar.get(kid), port: Number(pb.ichki), tashqi: true } }
      return { xato: 'refused' }
    }
    for (const t of this.tarmoqlar.values()) {
      for (const [kid, u] of t.ulanishlar) {
        if (u.ip !== ip) continue
        const k = this.konteynerlar.get(kid)
        // konteynerdan: faqat umumiy tarmoqda (turli bridge tarmoqlari bir-biridan ajratilgan)
        if (kimdan && !kimdan.tarmoqlar.has(t.id)) return { xato: 'timeout' }
        return this.ichkiPort(k, port) ? { konteyner: k, port } : { xato: 'refused' }
      }
    }
    return { xato: kimdan ? 'timeout' : 'timeout' }
  }
  ichkiPort(k, port) { return k.holat === 'running' && k.jarayon?.tinglaydi?.(port) }

  // konteyner yozuv qatlami hajmi — yozuvlar (01, 10, 14): asos 4096; ishlayotgan nginx 81920 (kesh papkalari, pid);
  // image'da yo'q har mount nuqtasi uchun papka +4096; foydalanuvchi yozgan fayllar 4 KiB bloklarda
  konteynerHajm(k) {
    if (k.holat === 'created' && !k.boshlandi) return 0
    let s = k.nginxStartSoni ? 81920 : 4096
    for (const m of k.mountlar) if (m.yangiPapka) s += 4096
    return s + (k.fs ? k.fs.yuqoriHajm() : 0)
  }
  // `docker events` uchun yozuv (moby events formatida)
  voqea(Type, Action, id, Attributes = {}) {
    const vaqt = Date.now()
    this.voqealar.push({ Type, Action, id, Attributes, vaqt, nano: rfc3339(vaqt) })
    if (this.voqealar.length > 2000) this.voqealar.shift()
    this.hodisa('events', 'yangi', null)
  }
  kAttr(k, qosh = {}) { return { ...k.config.labels, image: k.image, name: k.nom, ...qosh } }

  // ------------------------------------------------------------------------------------- yordamchi
  ipOf(k, tarmoqNom = null) {
    for (const [tid, u] of k.tarmoqlar) { const t = this.tarmoqlar.get(tid); if (!tarmoqNom || t?.nom === tarmoqNom) return u.ip }
    return ''
  }
}

// bind mount: host papkasining bir qismi (yo'l prefiksi bilan)
class KichikFs {
  constructor(host, ildiz) { this.host = host; this.ildiz = normal(ildiz) }
  y(p) { return normal(this.ildiz + '/' + p) }
  stat(p, e) { return this.host.stat(this.y(p), e) }
  bormi(p) { return this.host.bormi(this.y(p)) }
  oqi(p) { return this.host.oqi(this.y(p)) }
  royxat(p) { return this.host.royxat(this.y(p)) }
  yoz(p, m, q) { return this.host.yoz(this.y(p), m, q) }
  papka(p, o) { return this.host.papka(this.y(p), o) }
  ochir(p, o) { return this.host.ochir(this.y(p), o) }
}

function baytga(x) {
  const m = /^(\d+(?:\.\d+)?)([bkmg]?)b?$/i.exec(String(x))
  if (!m) return 0
  return Math.round(Number(m[1]) * { '': 1, b: 1, k: 1024, m: 1024 ** 2, g: 1024 ** 3 }[m[2].toLowerCase()])
}

function klon(n) {
  const k = { ...n }
  if (n.b) k.b = new Map([...n.b].map(([x, y]) => [x, klon(y)]))
  return k
}

// /etc/resolv.conf — yozuvlardan (default bridge: host'ning resolv.conf'idan; o'z tarmog'ida — Docker'ning ichki DNS'i)
// Sinov VPS'ida host systemd-resolved ishlatadi; tashqi DNS serverlar o'rniga hujjat manzillari (RFC 5737) qo'yilgan.
const RESOLV_STANDART = `# Generated by Docker Engine.
# This file can be edited; Docker Engine will not make further changes once it
# has been modified.

nameserver 192.0.2.53
nameserver 198.51.100.53
search .

# Based on host file: '/run/systemd/resolve/resolv.conf' (legacy)
# Overrides: []
`
const RESOLV_ICHKI = `# Generated by Docker Engine.
# This file can be edited; Docker Engine will not make further changes once it
# has been modified.

nameserver 127.0.0.11
search .
options ndots:0

# Based on host file: '/run/systemd/resolve/resolv.conf' (internal resolver)
# ExtServers: [192.0.2.53 198.51.100.53]
# Overrides: []
# Option ndots from: internal
`
export { rfc3339 }
