// Host qobig'i: sinov VPS (Ubuntu 26.04, bash 5.3, root@lab). Docker CLI shu yerdan ishlaydi.
// Fayl tizimi — /root uy papkasi (bind mount, env-file, Dockerfile fayllari uchun). Tarmoq: curl → e'lon qilingan
// portlar va konteyner IP'lari (Docker daemon modeli orqali).
import { Qobiq, BASH } from './ijro.js'
import { DaraxtFs, tugun, yolHal, xatoMatni, FsXato } from '../vfs.js'
import { docker } from '../cli/docker.js'
import { httpSorov } from '../ichki/konteynerQobiq.js'
import { busyboxDate, lsVaqt } from '../birlik.js'

export function hostFsYarat() {
  const fs = new DaraxtFs(tugun('d'))
  for (const p of ['/root', '/etc', '/tmp', '/var/lib/docker', '/usr/bin', '/home']) fs.papka(p, { ota: true })
  fs.stat('/root').m = 0o700
  fs.stat('/tmp').m = 0o1777
  fs.yoz('/etc/hostname', 'lab\n')
  fs.yoz('/etc/os-release', 'PRETTY_NAME="Ubuntu 26.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="26.04"\nVERSION="26.04.1 LTS"\nID=ubuntu\nID_LIKE=debian\n')
  fs.yoz('/root/.bashrc', '# ~/.bashrc: executed by bash(1) for non-login shells.\n')
  fs.yoz('/root/.profile', '# ~/.profile: executed by Bourne-compatible login shells.\n')
  return fs
}

export function hostQobiq({ daemon, fs, terminal }) {
  const q = new Qobiq({
    fs, cwd: '/root', lahja: BASH,
    env: { HOME: '/root', USER: 'root', LOGNAME: 'root', SHELL: '/bin/bash', PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', PWD: '/root', TERM: 'xterm-256color', LANG: 'C.UTF-8' },
  })
  const kontekst = (ctx) => ({ ...ctx, hostFs: fs, cwd: q.cwd, env: q.env, cols: () => terminal?.cols?.() ?? 100, uzilish: terminal?.uzilish, ajralish: terminal?.ajralish, prompt: terminal?.konteynerPrompt })
  q.buyruqlar = {
    // docker o'z Ctrl+C ishlovchisini qo'yadi — tugagach oldingisi qaytariladi
    docker: async (argv, ctx) => {
      const eski = terminal?.uzilishOl?.()
      try { return await docker(argv, kontekst(ctx), daemon) } finally { terminal?.uzilish?.(eski) }
    },
    curl: (argv, ctx) => curl(argv, ctx, daemon),
    clear: (argv, ctx) => { ctx.stdout.yoz('\x1b[H\x1b[2J\x1b[3J'); return 0 },
    hostname: (argv, ctx) => { ctx.stdout.yoz(argv[1] === '-I' ? `${daemon.hostIp} 172.17.0.1 \n` : 'lab\n'); return 0 },
    whoami: (argv, ctx) => { ctx.stdout.yoz('root\n'); return 0 },
    id: (argv, ctx) => { ctx.stdout.yoz('uid=0(root) gid=0(root) groups=0(root)\n'); return 0 },
    date: (argv, ctx) => { ctx.stdout.yoz(busyboxDate(Date.now()) + '\n'); return 0 },
    uname: (argv, ctx) => { ctx.stdout.yoz(argv.includes('-a') ? 'Linux lab 7.0.0-43-generic #43-Ubuntu SMP PREEMPT_DYNAMIC Fri Oct 23 13:25:25 UTC 2026 x86_64 GNU/Linux\n' : argv.includes('-r') ? '7.0.0-43-generic\n' : 'Linux\n'); return 0 },
    sleep: async (argv, ctx) => { await uyqu(parseFloat(argv[1] ?? '0') * 1000, ctx); return 0 },
    ls: (argv, ctx) => lsGnu(argv, ctx),
    cat: (argv, ctx) => {
      let kod = 0
      const fayllar = argv.slice(1).filter((x) => !x.startsWith('-'))
      if (!fayllar.length) return ctx.stdin.oqi().then((m) => { ctx.stdout.yoz(m); return 0 })
      for (const f of fayllar) { try { ctx.stdout.yoz(fs.oqi(yolHal(q.cwd, f))) } catch (e) { ctx.stderr.yoz(`cat: ${f}: ${xatoMatni(e)}\n`); kod = 1 } }
      return kod
    },
    mkdir: (argv, ctx) => {
      const p = argv.includes('-p')
      let kod = 0
      for (const f of argv.slice(1).filter((x) => !x.startsWith('-'))) { try { fs.papka(yolHal(q.cwd, f), { ota: p }) } catch (e) { ctx.stderr.yoz(`mkdir: cannot create directory '${f}': ${xatoMatni(e)}\n`); kod = 1 } }
      return kod
    },
    rm: (argv, ctx) => {
      const bay = argv.slice(1).filter((x) => x.startsWith('-')).join('')
      const r = /r|R/.test(bay), fo = bay.includes('f')
      let kod = 0
      for (const f of argv.slice(1).filter((x) => !x.startsWith('-'))) {
        const y = yolHal(q.cwd, f)
        try {
          const n = fs.stat(y, false)
          if (!n) throw new FsXato('ENOENT', y)
          if (n.k === 'd' && !r) { ctx.stderr.yoz(`rm: cannot remove '${f}': Is a directory\n`); kod = 1; continue }
          fs.ochir(y, { rekursiv: r })
        } catch (e) { if (fo) continue; ctx.stderr.yoz(`rm: cannot remove '${f}': ${xatoMatni(e)}\n`); kod = 1 }
      }
      return kod
    },
    touch: (argv, ctx) => { for (const f of argv.slice(1)) { const y = yolHal(q.cwd, f); try { if (fs.bormi(y)) fs.yoz(y, '', true); else fs.yoz(y, '') } catch (e) { ctx.stderr.yoz(`touch: cannot touch '${f}': ${xatoMatni(e)}\n`); return 1 } } return 0 },
    cp: (argv, ctx) => {
      const [a, b] = argv.slice(1).filter((x) => !x.startsWith('-'))
      try { const m = fs.oqi(yolHal(q.cwd, a)); let y = yolHal(q.cwd, b); if (fs.stat(y)?.k === 'd') y += '/' + a.split('/').pop(); fs.yoz(y, m) } catch (e) { ctx.stderr.yoz(`cp: cannot stat '${a}': ${xatoMatni(e)}\n`); return 1 }
      return 0
    },
    mv: (argv, ctx) => {
      const [a, b] = argv.slice(1)
      try { const n = fs.stat(yolHal(q.cwd, a), false); if (!n) throw new FsXato('ENOENT', a); fs.ochir(yolHal(q.cwd, a), { rekursiv: true }); fs.qoy(yolHal(q.cwd, b), n) } catch (e) { ctx.stderr.yoz(`mv: cannot stat '${a}': ${xatoMatni(e)}\n`); return 1 }
      return 0
    },
    head: (argv, ctx) => kesish(argv, ctx, fs, q, 'head'),
    tail: (argv, ctx) => kesish(argv, ctx, fs, q, 'tail'),
    wc: async (argv, ctx) => {
      const b = argv.slice(1).filter((x) => x.startsWith('-')).join('')
      const fayllar = argv.slice(1).filter((x) => !x.startsWith('-'))
      const matnlar = fayllar.length ? fayllar.map((f) => [f, fs.oqi(yolHal(q.cwd, f))]) : [[null, await ctx.stdin.oqi()]]
      for (const [n, m] of matnlar) {
        const l = (m.match(/\n/g) ?? []).length, w = m.split(/\s+/).filter(Boolean).length, c = new TextEncoder().encode(m).length
        const qiy = b ? [b.includes('l') && l, b.includes('w') && w, b.includes('c') && c].filter((x) => x !== false) : [l, w, c]
        ctx.stdout.yoz((qiy.length > 1 ? qiy.map((x) => String(x).padStart(n ? String(Math.max(...qiy)).length : 7)).join(' ') : String(qiy[0])) + (n ? ' ' + n : '') + '\n')
      }
      return 0
    },
    grep: async (argv, ctx) => {
      const bay = argv.slice(1).filter((x) => /^-[a-zA-Z]+$/.test(x)).join('')
      const pos = argv.slice(1).filter((x) => !/^-[a-zA-Z]+$/.test(x))
      const [naqsh, ...fayllar] = pos
      let re
      const E = bay.includes('E')
      try { re = new RegExp(E ? naqsh : naqsh.replace(/\\\|/g, '|').replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/(?<!\\)\(|(?<!\\)\)/g, '\\$&'), bay.includes('i') ? 'i' : '') } catch { ctx.stderr.yoz('grep: Unmatched ( or \\(\n'); return 2 }
      const matn = fayllar.length ? fayllar.map((f) => fs.oqi(yolHal(q.cwd, f))).join('') : await ctx.stdin.oqi()
      let bor = false, soni = 0
      for (const s of matn.replace(/\n$/, '').split('\n')) {
        if (re.test(s) === bay.includes('v')) continue
        bor = true; soni++
        if (bay.includes('q')) return 0
        if (bay.includes('c')) continue
        if (bay.includes('o')) { for (const m of s.match(new RegExp(re.source, 'g' + re.flags)) ?? []) ctx.stdout.yoz(m + '\n') } else ctx.stdout.yoz(s + '\n')
      }
      if (bay.includes('c')) ctx.stdout.yoz(soni + '\n')
      return bor ? 0 : 1
    },
    env: (argv, ctx) => { for (const [a, b] of Object.entries(q.env)) if (!/^\d$/.test(a)) ctx.stdout.yoz(`${a}=${b}\n`); return 0 },
    nano: (argv, ctx) => muharrir(argv, ctx, terminal),
    vi: (argv, ctx) => muharrir(argv, ctx, terminal),
    vim: (argv, ctx) => muharrir(argv, ctx, terminal),
    ufw: (argv, ctx) => { ctx.stderr.yoz('\x1b[33mtrenajor: firewall (ufw, iptables) simulyatorda yo\'q — Docker kitobining 5-bobida VPS\'dagi haqiqiy natija bor.\x1b[0m\n'); return 1 },
    iptables: (argv, ctx) => q.buyruqlar.ufw(argv, ctx),
    ps: (argv, ctx) => { ctx.stderr.yoz('\x1b[33mtrenajor: host jarayonlari simulyatorda ko\'rsatilmaydi; `docker ps` va `docker top` dan foydalaning.\x1b[0m\n'); return 1 },
    help: (argv, ctx) => { ctx.stdout.yoz(YORDAM); return 0 },
    yordam: (argv, ctx) => { ctx.stdout.yoz(YORDAM); return 0 },
  }
  q.yolTop = (nom) => (q.buyruqlar[nom] ? (nom === 'docker' ? '/usr/bin/docker' : `/usr/bin/${nom}`) : null)
  return q
}

const YORDAM = `\x1b[1mDocker trenajori\x1b[0m — Docker Engine 29.9.3 (sinov VPS'idan yozib olingan) simulyatori.
Docker buyruqlari: run, ps, images, pull, logs, exec, stop, start, rm, rmi, inspect, port, network, volume, system, tag …
Host buyruqlari: curl, ls, cat, echo, mkdir, rm, cd, grep, head, wc, sleep, clear.
Image'lar: hello-world, alpine, nginx:1.29, debian (trixie), busybox:1.37.
\x1b[2mTab — maslahatni tanlash, ↑/↓ — oldingi buyruqlar, Ctrl+C — to'xtatish, Ctrl+L — ekranni tozalash.\x1b[0m
`

async function uyqu(ms, ctx) {
  await new Promise((res, rej) => {
    const t = setTimeout(res, ms)
    ctx.signal?.addEventListener?.('abort', () => { clearTimeout(t); rej(ctx.signal.reason) }, { once: true })
  })
}

async function kesish(argv, ctx, fs, q, tur) {
  let n = 10
  const pos = []
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '-n') n = Number(argv[++i])
    else if (/^-n?\d+$/.test(argv[i])) n = Number(argv[i].replace(/^-n?/, ''))
    else pos.push(argv[i])
  }
  const m = pos.length ? fs.oqi(yolHal(q.cwd, pos[0])) : await ctx.stdin.oqi()
  const qat = m.split('\n')
  if (qat[qat.length - 1] === '') qat.pop()
  const t = tur === 'head' ? qat.slice(0, n) : qat.slice(-n)
  if (t.length) ctx.stdout.yoz(t.join('\n') + '\n')
  return 0
}

function lsGnu(argv, ctx) {
  const q = ctx.qobiq, fs = q.fs
  const bay = argv.slice(1).filter((x) => x.startsWith('-')).join('')
  const pos = argv.slice(1).filter((x) => !x.startsWith('-'))
  const uzun = bay.includes('l'), hamma = bay.includes('a'), d = bay.includes('d')
  const r = (n) => (n.k === 'd' ? 'd' : n.k === 'l' ? 'l' : '-') + [0o400, 0o200, 0o100, 0o40, 0o20, 0o10, 0o4, 0o2, 0o1].map((b, i) => (n.m & b ? 'rwx'[i % 3] : '-')).join('').replace(/x$/, n.m & 0o1000 ? 't' : 'x').replace(/-$/, n.m & 0o1000 ? 'T' : '-')
  const qator = (nom, n) => [r(n), n.k === 'd' ? 2 + [...(n.b?.values() ?? [])].filter((x) => x.k === 'd').length : 1, 'root', 'root', n.k === 'd' ? 4096 : n.s, lsVaqt(n.t), nom + (n.k === 'l' ? ` -> ${n.l}` : '')]
  const chiq = (roy) => {
    if (!uzun) { ctx.stdout.yoz(roy.length ? (ctx.stdout.tty ? roy.map((x) => x[0]).join('  ') : roy.map((x) => x[0]).join('\n')) + '\n' : ''); return }
    const w = [0, 0, 0, 0, 0]
    const qq = roy.map(([nom, n]) => qator(nom, n))
    for (const x of qq) for (let i = 1; i < 5; i++) w[i] = Math.max(w[i], String(x[i]).length)
    ctx.stdout.yoz(qq.map((x) => `${x[0]} ${String(x[1]).padStart(w[1])} ${x[2]} ${x[3]} ${String(x[4]).padStart(w[4])} ${x[5]} ${x[6]}`).join('\n') + '\n')
  }
  let kod = 0
  const yollar = pos.length ? pos : ['.']
  for (const [i, p] of yollar.entries()) {
    const y = yolHal(q.cwd, p)
    const n = fs.stat(y, !uzun)
    if (!n) { ctx.stderr.yoz(`ls: cannot access '${p}': No such file or directory\n`); kod = 2; continue }
    if (n.k !== 'd' || d) { chiq([[p, n]]); continue }
    if (yollar.length > 1) ctx.stdout.yoz((i ? '\n' : '') + p + ':\n')
    let nomlar = fs.royxat(y)
    if (!hamma) nomlar = nomlar.filter((x) => !x.startsWith('.'))
    const roy = nomlar.map((x) => [x, fs.stat(y + '/' + x, false)])
    if (hamma) roy.unshift(['.', n], ['..', fs.stat(y + '/..') ?? n])
    if (uzun) ctx.stdout.yoz(`total ${roy.reduce((s, [, x]) => s + (x.k === 'd' ? 4 : Math.ceil(x.s / 4096) * 4), 0)}\n`)
    chiq(roy)
  }
  return kod
}

function muharrir(argv, ctx, terminal) {
  if (terminal?.muharrir) return terminal.muharrir(argv[1])
  ctx.stderr.yoz('\x1b[33mtrenajor: matn muharriri o\'rniga `cat > fayl <<\'EOF\'` yoki `echo ... > fayl` dan foydalaning.\x1b[0m\n')
  return 1
}

// curl 8.18.0 (Ubuntu 26.04): -s -S -o -w -I -i -X -H --max-time
export async function curl(argv, ctx, d, { kimdan = null, versiya = null } = {}) {
  let jim = false, xatoKorsat = false, chiqFayl = null, w = null, bosh = false, sarlavha = false, usul = 'GET', url = null, vaqt = null, v = false
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--max-time' || a === '-m') { vaqt = Number(argv[++i]); continue }
    if (a === '-o') { chiqFayl = argv[++i]; continue }
    if (a === '-w') { w = argv[++i]; continue }
    if (a === '-X') { usul = argv[++i]; continue }
    if (a === '-H' || a === '-A' || a === '-d') { i++; continue }
    if (a === '--version' || a === '-V') { ctx.stdout.yoz(versiya ?? 'curl 8.18.0 (x86_64-pc-linux-gnu) libcurl/8.18.0 OpenSSL/3.5.5 zlib/1.3.1 brotli/1.2.0 zstd/1.5.7 libidn2/2.3.8 libpsl/0.21.2 libssh2/1.11.1 nghttp2/1.68.0 librtmp/2.3 mit-krb5/1.22.1 OpenLDAP/2.6.10\n'); return 0 }
    if (/^-[a-zA-Z]+$/.test(a)) {
      for (const c of a.slice(1)) { if (c === 's') jim = true; else if (c === 'S') xatoKorsat = true; else if (c === 'I') { bosh = true; usul = 'HEAD' } else if (c === 'i') sarlavha = true; else if (c === 'v') v = true; else if (c === 'f' || c === 'L' || c === 'k') { /* e'tiborsiz */ } }
      continue
    }
    url = a
  }
  if (!url) { ctx.stderr.yoz("curl: try 'curl --help' or 'curl --manual' for more information\n"); return 2 }
  if (!/^\w+:\/\//.test(url)) url = 'http://' + url
  const t0 = Date.now()
  const m = /^https?:\/\/([^/:]+)(?::(\d+))?/.exec(url)
  const host = m?.[1] ?? '', port = m?.[2] ?? '80'
  const xato = (kod, matn) => { if (!jim || xatoKorsat) ctx.stderr.yoz(`curl: (${kod}) ${matn}\n`); if (w) ctx.stdout.yoz(wFormat(w, { holat: '000' })); return kod }
  const r = await httpSorov(d, kimdan, url, { usul, agent: versiya ? 'curl/' + versiya.split(' ')[1] : 'curl/8.18.0' })
  if (r.xato === 'dns') return xato(6, `Could not resolve host: ${host}`)
  if (r.xato === 'refused') return xato(7, `Failed to connect to ${host} port ${port} after ${Date.now() - t0} ms: Could not connect to server`)
  if (r.xato === 'timeout') {
    const kut = (vaqt ?? 10) * 1000
    await uyqu(Math.min(kut, 10000), ctx)
    return xato(28, `Connection timed out after ${Math.min(kut, 10000) + 2} milliseconds`)
  }
  if (r.xato) return xato(7, `Failed to connect to ${host} port ${port} after 0 ms: Could not connect to server`)
  const j = r.javob
  const sarlavhaMatn = `HTTP/1.1 ${j.holat} ${j.matn}\r\n` + j.sarlavha.map(([a, b]) => `${a}: ${b}\r\n`).join('') + '\r\n'
  void v
  let tana = ''
  // curl 8: TTY'da sarlavha nomlari qalin (yozuv: curl -sI)
  const tty = ctx.stdout.tty && !chiqFayl
  if (bosh || sarlavha) tana += (tty ? sarlavhaMatn.replace(/^([\w-]+):/gm, '\x1b[1m$1\x1b[0m:') : sarlavhaMatn).replace(/\r\n/g, '\n')
  if (!bosh) tana += j.tana
  if (chiqFayl && chiqFayl !== '/dev/null') ctx.qobiq.fs.yoz(yolHal(ctx.qobiq.cwd, chiqFayl), tana)
  else if (!chiqFayl) ctx.stdout.yoz(tana)
  if (w) ctx.stdout.yoz(wFormat(w, { holat: String(j.holat) }))
  return 0
}
const wFormat = (w, { holat }) => w.replace(/%\{http_code\}/g, holat).replace(/\\n/g, '\n')
