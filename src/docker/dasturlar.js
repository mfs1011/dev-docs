// Konteyner ichidagi jarayonlar. Har konteynerda bitta asosiy jarayon (PID 1) — image'ning ENTRYPOINT + CMD si.
// Linux qoidasi (signal(7), pid_namespaces(7)): PID 1 o'zi ushlamagan signalni (SIGTERM, SIGINT …) e'tiborsiz qoldiradi,
// SIGKILL esa doim o'ldiradi. Shu sabab `sleep` PID 1 bo'lsa `docker stop` 10 soniya kutib, SIGKILL yuboradi (kod 137).
// Dasturlarning chiqishi (nginx loglari, hello-world matni, busybox formatlari) sinov VPS'idagi yozuvlardan.
import { nginxVaqt, accessVaqt, httpVaqt } from './birlik.js'
import { normal, yolHal } from './vfs.js'
import { MATN } from './data/matnlar.js'
import { qobiqDastur } from './ichki/konteynerQobiq.js'

export const SIGNALLAR = { SIGHUP: 1, SIGINT: 2, SIGQUIT: 3, SIGKILL: 9, SIGUSR1: 10, SIGUSR2: 12, SIGTERM: 15, SIGSTOP: 19 }
export const signalRaqam = (s) => (/^\d+$/.test(String(s)) ? Number(s) : SIGNALLAR[String(s).toUpperCase().startsWith('SIG') ? String(s).toUpperCase() : 'SIG' + String(s).toUpperCase()])

export class Oldirildi extends Error { constructor(kod) { super('killed'); this.kod = kod } }

// image oilasi: qaysi qobiq va buyruqlar to'plami
export function oila(k) {
  const r = k.im.repo
  if (r === 'alpine' || r === 'busybox' || r.endsWith('-alpine')) return 'busybox'
  if (r === 'hello-world') return 'scratch'
  return 'gnu' // debian, nginx (Debian asosida)
}

// PATH bo'yicha bajariladigan faylni topish
export function yolTop(fs, nom, env) {
  if (nom.includes('/')) return fs.bormi(nom) ? normal(nom) : null
  const path = (env.find?.((e) => e.startsWith('PATH='))?.slice(5)) ?? env.PATH ?? '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
  for (const p of path.split(':')) {
    const y = normal(p + '/' + nom)
    try { const n = fs.stat(y); if (n && n.k !== 'd') return y } catch { /* yo'q */ }
  }
  return null
}

// docker run dan oldin: buyruq boshlanadimi? { xato, kod } | { yol }
export function dasturTop(k, nom) {
  const fs = k.fs
  const y = yolTop(fs, nom, k.config.env)
  if (!y) {
    if (nom.includes('/')) return { xato: `exec: "${nom}": stat ${nom}: no such file or directory`, kod: 127 }
    return { xato: `exec: "${nom}": executable file not found in $PATH`, kod: 127 }
  }
  const n = fs.stat(y)
  if (n.k === 'd') return { xato: `exec: "${nom}": is a directory: permission denied`, kod: 126 }
  return { yol: y }
}

// ---------------------------------------------------------------------------------------- Jarayon
export class Jarayon {
  // attach: { stdout, stderr, stdin, tty } — `docker run` (‑d siz), `start -a`, `exec` uchun
  constructor(daemon, k, argv, { pid1 = false, tty = false, attach = null, env = null, cwd = null, user = null } = {}) {
    this.daemon = daemon
    this.k = k
    this.argv = argv
    this.pid1 = pid1
    this.tty = tty
    this.attach = attach
    this.env = env ?? envObyekt(k.config.env, k, { tty })
    this.cwd = cwd ?? (k.config.workdir || '/')
    this.user = user ?? k.config.user
    this.tutqichlar = {}    // signal → fn
    this.portlar = new Set()
    this.oldi = false
    this.kutishlar = new Set()
    this.qisman = { stdout: '', stderr: '' }
    this.tugash = new Promise((r) => { this._tugat = r })
  }
  tinglaydi(port) { return this.portlar.has(Number(port)) }
  // interaktiv qobiq uchun: joriy attach'dan bitta qator (detach/attach almashsa — yangisidan o'qiladi)
  qatorOl() {
    return new Promise((res, rej) => {
      if (this.oldi) return rej(new Oldirildi(this.oldiKod))
      const o = { res, rej }
      this._kutuvchi = o
      this.kutishlar.add(o)
      this._sora()
    })
  }
  _sora() {
    const a = this.attach?.stdin
    const o = this._kutuvchi
    if (!o || !a?.qator) return
    const token = {}
    this._token = token
    a.qator().then((x) => {
      if (this._token !== token || this._kutuvchi !== o) return
      this._kutuvchi = null
      this.kutishlar.delete(o)
      o.res(x)
    })
  }
  ulash(att) {
    this.attach = att
    this._token = null
    if (att && this._kutuvchi) { this.promptQayta?.(); this._sora() }
  }
  // jarayon chiqishi: PID 1 bo'lsa — konteyner logiga (json-file), ulangan bo'lsa — terminalga
  yoz(oqim, matn) {
    if (!matn) return
    if (this.pid1 || this.tiniBola) {
      const q = this.qisman[oqim] + matn
      const qatorlar = q.split('\n')
      this.qisman[oqim] = qatorlar.pop()
      for (const x of qatorlar) this.k.loglar.push({ vaqt: Date.now(), nano: nanoQism(), oqim: this.tty ? 'stdout' : oqim, matn: x })
      if (qatorlar.length) this.daemon.hodisa('container', 'log', this.k, { oqim })
    }
    const a = this.attach
    if (a) (oqim === 'stderr' && !this.tty ? a.stderr : a.stdout).yoz(matn)
  }
  out(m) { this.yoz('stdout', m) }
  err(m) { this.yoz('stderr', m) }
  // bekor qilinadigan kutish
  kut(ms) {
    return new Promise((res, rej) => {
      if (this.oldi) return rej(new Oldirildi(this.oldiKod))
      const t = setTimeout(() => { this.kutishlar.delete(o); res() }, ms)
      const o = { rej: (e) => { clearTimeout(t); rej(e) } }
      this.kutishlar.add(o)
    })
  }
  // signal kelguncha kutish (server dasturlari uchun)
  abadiy() {
    return new Promise((res, rej) => {
      if (this.oldi) return rej(new Oldirildi(this.oldiKod))
      this.kutishlar.add({ rej })
    })
  }
  signal(sig) {
    const raqam = signalRaqam(sig)
    if (raqam === 9) return this.oldir(137)
    const nom = Object.keys(SIGNALLAR).find((k) => SIGNALLAR[k] === raqam)
    if (this.tutqichlar[nom]) { this.tutqichlar[nom](nom); return }
    if (this.pid1) return // PID 1: ushlanmagan signal e'tiborsiz
    this.oldir(128 + raqam)
  }
  oldir(kod) {
    if (this.oldi) return
    this.oldi = true
    this.oldiKod = kod
    for (const o of this.kutishlar) o.rej(new Oldirildi(kod))
    this.kutishlar.clear()
    this.yakun(kod)
  }
  yakun(kod) {
    if (this.yakunlandi) return
    this.yakunlandi = true
    // tugallanmagan qator (masalan prompt) faqat logga yoziladi, terminalga emas
    for (const oqim of ['stdout', 'stderr']) if (this.qisman[oqim] && (this.pid1 || this.tiniBola)) { this.k.loglar.push({ vaqt: Date.now(), nano: nanoQism(), oqim, matn: this.qisman[oqim] }); this.qisman[oqim] = '' }
    this.portlar.clear()
    this._tugat(kod)
  }
  async ishga() {
    let kod
    try {
      if (this.pid1 && this.k.init) {
        // --init: docker-init (tini) PID 1 bo'ladi, asl buyruq — uning bolasi. Bola PID 1 emas, shuning uchun
        // SIGINT/SIGTERM standart amal bilan uni to'xtatadi (yozuv 12-signal: Ctrl+C → kod 130)
        this.pid1 = false
        this.tiniBola = true
      }
      kod = await bajarDastur(this, this.argv)
    } catch (e) {
      if (e instanceof Oldirildi) kod = e.kod
      else { console.error(e); this.err(`trenajor: ichki xato: ${e.message}\n`); kod = 1 }
    }
    this.yakun(kod ?? 0)
  }
}

const nanoQism = () => String(Math.floor(Math.random() * 1e6)).padStart(6, '0')

// Jarayon muhiti — moby CreateDaemonEnvironment: PATH, HOSTNAME, (TTY bo'lsa TERM=xterm), keyin Config.Env (bir xil
// kalitlar almashtiriladi, qolganlari qo'shiladi); HOME bo'lmasa runc oxiriga qo'shadi.
export function envObyekt(roy, k, { tty = k.config.tty } = {}) {
  const e = { PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', HOSTNAME: k.config.hostname }
  if (tty) e.TERM = 'xterm'
  for (const x of roy) { const i = x.indexOf('='); if (i > 0) e[x.slice(0, i)] = x.slice(i + 1) }
  e.HOME ??= k.config.user && k.config.user !== 'root' && k.config.user !== '0' ? '/' : '/root'
  return e
}

// ---------------------------------------------------------------------------------------- dasturlar
export async function bajarDastur(p, argv) {
  const [nom] = argv
  const y = yolTop(p.k.fs, nom, Object.entries(p.env).map(([a, b]) => `${a}=${b}`)) ?? nom
  const asos = y.split('/').pop()
  const n = (() => { try { return p.k.fs.stat(y, false) } catch { return null } })()
  const haqiqiy = n?.k === 'l' ? normal(n.l.startsWith('/') ? n.l : y.replace(/[^/]+$/, '') + n.l).split('/').pop() : asos
  if (y === '/hello') return hello(p)
  if (y === '/docker-entrypoint.sh') return nginxEntrypoint(p, argv)
  if (asos === 'nginx' || asos === 'nginx-debug') return nginx(p, argv)
  // qobiq yoki oddiy buyruq: qobiq modulida
  return qobiqDastur(p, argv, { yol: y, asos, haqiqiy })
}

function hello(p) {
  p.out(MATN.hello)
  return 0
}

// /docker-entrypoint.sh (nginx image): birinchi argument nginx bo'lsa — sozlash skriptlari, keyin `exec "$@"`
async function nginxEntrypoint(p, argv) {
  const args = argv.slice(1)
  if (args[0] === 'nginx' || args[0] === 'nginx-debug') {
    if (!p.env.NGINX_ENTRYPOINT_QUIET_LOGS) {
      // 10-listen-on-ipv6-by-default.sh: default.conf o'zgartiriladi (ikkinchi start'da "already enabled")
      const ikkinchi = p.k.ipv6Yoqildi && p.k.fs.bormi('/etc/nginx/conf.d/default.conf')
      const qatorlar = ikkinchi ? MATN.nginxEntrypointQayta : MATN.nginxEntrypoint
      for (const q of qatorlar) { p.out(q + '\n'); await p.kut(4) }
      // 10-listen-on-ipv6-by-default.sh default.conf ga IPv6 tinglashni qo'shadi (yozuv: 11 — `listen  [::]:80;`)
      if (!ikkinchi) {
        try {
          const f = '/etc/nginx/conf.d/default.conf'
          p.k.fs.yoz(f, p.k.fs.oqi(f).replace('    listen       80;\n', '    listen       80;\n    listen  [::]:80;\n'))
          const n = p.k.fs.yuqori.get(f); if (n) n.asos = true
        } catch { /* bind mount yoki o'chirilgan */ }
      }
      p.k.ipv6Yoqildi = true
    }
    return nginx(p, args)
  }
  return bajarDastur(p, args)
}

const MIME = { html: 'text/html', htm: 'text/html', css: 'text/css', js: 'application/javascript', json: 'application/json', txt: 'text/plain', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml', ico: 'image/x-icon', xml: 'text/xml' }

async function nginx(p, argv) {
  const a = argv.slice(1)
  if (a.includes('-v')) { p.err('nginx version: nginx/1.29.8\n'); return 0 }
  if (a.includes('-V')) { p.err(MATN.nginxV); return 0 }
  if (a.includes('-t')) { p.err('nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful\n'); return 0 }
  const vaqt = () => nginxVaqt(Date.now())
  // nginx master + bitta worker (1 CPU: worker_processes auto)
  // worker PID konteyner ichida: birinchi start'da 29, qayta start'da 22 (yozuv: 04, 11 — entrypoint skriptlari soni farqi)
  const wpid = p.k.nginxStartSoni ? 22 : 29
  p.k.nginxStartSoni = (p.k.nginxStartSoni ?? 0) + 1
  p.workerPid = wpid
  for (const q of MATN.nginxBoshlanish) p.err(q.replace('{vaqt}', vaqt()).replace('{w}', wpid) + '\n')
  try { p.k.fs.yoz('/run/nginx.pid', '1\n'); p.k.fs.yuqori.get('/run/nginx.pid').asos = true } catch { /* faqat o'qish */ }
  for (const d of ['client_temp', 'proxy_temp', 'fastcgi_temp', 'uwsgi_temp', 'scgi_temp']) { try { p.k.fs.papka('/var/cache/nginx/' + d, { ota: true }) } catch { /* bor */ } }
  p.portlar.add(80)
  p.nginx = { ulanish: 0, wpid }
  let tugadi = null
  const toxta = (tur) => {
    if (tugadi) return
    if (tur === 'SIGQUIT') { for (const q of MATN.nginxSigquit) p.err(q.replace('{vaqt}', vaqt()).replaceAll('{w}', wpid) + '\n') }
    else if (tur === 'SIGTERM' || tur === 'SIGINT') { for (const q of MATN.nginxSigterm) p.err(q.replace('{vaqt}', vaqt()).replaceAll('{w}', wpid).replace('{s}', SIGNALLAR[tur]).replace('{n}', tur) + '\n') }
    p.portlar.clear()
    tugadi = 0
    for (const o of p.kutishlar) o.rej(new Oldirildi(0))
  }
  p.tutqichlar.SIGQUIT = toxta
  p.tutqichlar.SIGTERM = toxta
  p.tutqichlar.SIGINT = toxta
  p.tutqichlar.SIGHUP = () => { p.err(`${vaqt()} [notice] 1#1: signal 1 (SIGHUP) received from 0, reconfiguring\n`) }
  // HTTP so'rovlarni qabul qilish
  p.http = (sorov) => nginxJavob(p, sorov)
  try { await p.abadiy() } catch (e) { if (!(e instanceof Oldirildi)) throw e; if (tugadi == null) throw e }
  try { p.k.fs.ochir('/run/nginx.pid') } catch { /* yo'q */ }
  return tugadi ?? 0
}

// so'rov: { usul, yol, sarlavhalar, mijozIp, host } → { holat, sarlavhalar[], tana }
function nginxJavob(p, s) {
  p.nginx.ulanish++
  const fs = p.k.fs
  const ildiz = '/usr/share/nginx/html'
  let yol = decodeURIComponent(s.yol.split('?')[0])
  let fayl = normal(ildiz + yol)
  let n = (() => { try { return fs.stat(fayl) } catch { return null } })()
  if (n && n.k === 'd') {
    if (!yol.endsWith('/')) return sahifa(p, s, 301, { Location: `http://${s.host}${yol}/` })
    fayl = normal(fayl + '/index.html')
    n = (() => { try { return fs.stat(fayl) } catch { return null } })()
    if (!n) {
      const vaqt = nginxVaqt(Date.now())
      p.err(`${vaqt} [error] ${p.nginx.wpid}#${p.nginx.wpid}: *${p.nginx.ulanish} directory index of "${normal(ildiz + yol)}/" is forbidden, client: ${s.mijozIp}, server: localhost, request: "${s.usul} ${s.yol} HTTP/1.1", host: "${s.host}"\n`)
      return sahifa(p, s, 403)
    }
  }
  if (!n) {
    const vaqt = nginxVaqt(Date.now())
    p.err(`${vaqt} [error] ${p.nginx.wpid}#${p.nginx.wpid}: *${p.nginx.ulanish} open() "${fayl}" failed (2: No such file or directory), client: ${s.mijozIp}, server: localhost, request: "${s.usul} ${s.yol} HTTP/1.1", host: "${s.host}"\n`)
    return sahifa(p, s, 404)
  }
  const tana = n.c ?? ''
  const uzunlik = n.s
  const ext = fayl.split('.').pop()
  const etag = `"${Math.floor(n.t).toString(16)}-${uzunlik.toString(16)}"`
  const sarlavha = [
    ['Server', 'nginx/1.29.8'], ['Date', httpVaqt(Date.now())], ['Content-Type', MIME[ext] ?? 'application/octet-stream'],
    ['Content-Length', String(uzunlik)], ['Last-Modified', httpVaqt(n.t * 1000)], ['Connection', 'keep-alive'], ['ETag', etag], ['Accept-Ranges', 'bytes'],
  ]
  accessLog(p, s, 200, s.usul === 'HEAD' ? 0 : uzunlik)
  return { holat: 200, matn: 'OK', sarlavha, tana: s.usul === 'HEAD' ? '' : tana }
}
const HOLAT = { 200: 'OK', 301: 'Moved Permanently', 403: 'Forbidden', 404: 'Not Found', 405: 'Not Allowed' }
function sahifa(p, s, holat, qosh = {}) {
  const tana = MATN.nginxXato[holat]
  const sarlavha = [['Server', 'nginx/1.29.8'], ['Date', httpVaqt(Date.now())], ['Content-Type', 'text/html'], ['Content-Length', String(tana.length)], ['Connection', 'keep-alive'], ...Object.entries(qosh)]
  accessLog(p, s, holat, s.usul === 'HEAD' ? 0 : tana.length)
  return { holat, matn: HOLAT[holat], sarlavha, tana: s.usul === 'HEAD' ? '' : tana }
}
function accessLog(p, s, holat, bayt) {
  p.out(`${s.mijozIp} - - [${accessVaqt(Date.now())}] "${s.usul} ${s.yol} HTTP/1.1" ${holat} ${bayt} "${s.referer ?? '-'}" "${s.agent}" "-"\n`)
}

export { yolHal }
