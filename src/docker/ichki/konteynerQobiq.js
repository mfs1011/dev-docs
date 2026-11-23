// Konteyner ichidagi qobiq va buyruqlar. Ikki oila:
//   busybox — alpine, busybox image'lari (ash, BusyBox v1.37.0 applet'lari);
//   gnu     — debian, nginx (dash `sh`, bash, GNU coreutils).
// Qaysi buyruq borligini image'ning haqiqiy fayl tizimi hal qiladi (PATH bo'yicha); formatlar VPS yozuvlaridan
// (docker-trenajor/yozuv/ssenariylar/07-busybox.txt).
import { Qobiq, ASH, BASH, kirishMatn, Toxtatildi } from '../qobiq/ijro.js'
import { yolHal, normal, xatoMatni, FsXato, nomi } from '../vfs.js'
import { yolTop, oila, Oldirildi } from '../dasturlar.js'
import { busyboxDate, lsVaqt } from '../birlik.js'
import { MATN } from '../data/matnlar.js'
import { curl as hostCurl } from '../qobiq/host.js'

export const DASH = {
  nom: 'sh',
  topilmadi: (c) => `sh: 1: ${c}: not found\n`,
  yonalishXato: (fayl, x) => `sh: 1: cannot create ${fayl}: ${x}\n`,
  sintaksis: (x) => `sh: 1: Syntax error: ${x}\n`,
  xatoKod: 2,
  echoEsc: true,
  cdXato: (p, sabab) => `sh: 1: cd: can't cd to ${p}\n`,
  cdKod: 2,
}
const BASH_C = { ...BASH, topilmadi: (c) => `bash: line 1: ${c}: command not found\n`, cdXato: (p, sabab) => `bash: line 1: cd: ${p}: ${sabab}\n` }

// jarayon (p) uchun qobiq: buyruqlar — PATH dagi fayl + bizdagi implementatsiya
// umask: `docker exec` jarayonlari 0000 bilan (yozuv 07: touch → -rw-rw-rw-), asosiy jarayon — 0022
function umaskli(fs, umask) {
  const yangi = (yol, f, m) => { const bor = fs.bormi(yol); f(); if (!bor) { try { const n = fs.stat(yol, false); if (n) n.m = m & ~umask } catch { /* yo'q */ } } }
  return new Proxy(fs, {
    get(t, k) {
      if (k === 'yoz') return (yol, matn, qosh) => yangi(yol, () => t.yoz(yol, matn, qosh), 0o666)
      if (k === 'papka') return (yol, o) => yangi(yol, () => t.papka(yol, o), 0o777)
      const v = t[k]
      return typeof v === 'function' ? v.bind(t) : v
    },
  })
}

function qobiqYarat(p, lahja, { interaktiv = false } = {}) {
  const tur = oila(p.k)
  const jadval = tur === 'busybox' ? BUSYBOX : GNU
  const q = new Qobiq({ fs: umaskli(p.k.fs, p.pid1 || p.tiniBola ? 0o022 : 0), env: p.env, cwd: p.cwd, lahja })
  q.p = p
  q.kontekst = { p, tur }
  q.buyruqlar = new Proxy({}, {
    get: (_, nom) => {
      if (typeof nom !== 'string') return undefined
      const y = yolTop(p.k.fs, nom, Object.entries(q.env).map(([a, b]) => `${a}=${b}`))
      if (!y) return undefined
      const asos = nom.split('/').pop()
      const f = jadval[asos] ?? UMUMIY[asos]
      if (f) return f
      return (argv, ctx) => { ctx.stderr.yoz(`\x1b[33mtrenajor: \`${asos}\` simulyatorda yo'q (haqiqiy Docker'da bor)\x1b[0m\n`); return 127 }
    },
  })
  if (interaktiv) q.interaktiv = true
  return q
}

// Konteyner dasturi: qobiq yoki oddiy buyruq (exec — qobiqsiz)
export async function qobiqDastur(p, argv, { asos }) {
  const tur = oila(p.k)
  const qobiqmi = ['sh', 'ash', 'bash', 'dash'].includes(asos)
  const ctx = (q) => ({
    stdout: { tty: p.tty, yoz: (m) => p.out(m) },
    stderr: { tty: p.tty, yoz: (m) => p.err(m) },
    stdin: p.attach?.stdin ?? kirishMatn(''),
    env: q.env, qobiq: q, signal: null, tty: p.tty,
  })
  if (!qobiqmi) {
    const q = qobiqYarat(p, tur === 'busybox' ? ASH : DASH)
    return await q.chaqir(argv, ctx(q))
  }
  const lahja = asos === 'bash' ? BASH_C : tur === 'busybox' ? ASH : DASH
  const q = qobiqYarat(p, lahja)
  const a = argv.slice(1)
  if (a[0] === '-c') {
    if (a.length < 2) { p.err(`${asos}: -c requires an argument\n`); return 2 }
    q.env['0'] = a[2] ?? asos
    const k = await q.bajar(a[1], ctx(q))
    return q.chiqdi ?? k
  }
  // interaktiv: TTY yoki -i bilan stdin ulangan
  const stdin = p.attach?.stdin
  if (p.tty && stdin?.qator) return interaktiv(p, q, asos, ctx)
  if (stdin && !p.tty) {
    const matn = await stdin.oqi()
    const k = await q.bajar(matn, ctx(q))
    return q.chiqdi ?? k
  }
  return 0 // stdin yo'q (docker run alpine) — qobiq darhol tugaydi
}

async function interaktiv(p, q, asos, ctx) {
  q.lahja = asos === 'bash' ? BASH : q.lahja === BASH_C ? BASH : q.lahja === DASH ? { ...DASH, topilmadi: (c) => `sh: 1: ${c}: not found\n` } : ASH
  q.interaktiv = true
  if (oila(p.k) === 'busybox') q.env.PS1 ??= '\\w \\$ '
  const prompt = () => {
    if (asos === 'bash') return `root@${p.k.config.hostname}:${q.cwd === '/root' ? '~' : q.cwd}# `
    if (oila(p.k) === 'busybox') return `${q.cwd === '/root' ? '~' : q.cwd} # `
    return '# '
  }
  // docker attach: terminal o'lchami yuboriladi (SIGWINCH) — ash prompt'ni qayta chizadi (yozuv 12: "/ # ESC[J/ # ESC[J")
  p.promptQayta = () => { p.out(prompt() + '\x1b[J' + prompt() + '\x1b[J'); p.attach?.prompt?.() }
  for (;;) {
    p.out(prompt())
    p.attach?.prompt?.()
    const qator = await p.qatorOl()
    if (qator == null) { if (asos === 'bash') p.out('exit\n'); else p.out('\n'); return q.oxirgiKod }
    if (!qator.trim()) continue
    q.tarix.push(qator)
    try {
      await q.bajar(qator, ctx(q))
    } catch (e) {
      if (e instanceof Toxtatildi) { p.out('^C\n'); q.oxirgiKod = 130; continue }
      throw e
    }
    if (q.chiqdi != null) { if (asos === 'bash') p.out('exit\n'); return q.chiqdi }
  }
}

// ------------------------------------------------------------------------------------------- yordamchi
const ruxsat = (n) => {
  const t = n.k === 'd' ? 'd' : n.k === 'l' ? 'l' : n.k === 'c' ? 'c' : '-'
  const r = (b, s) => (n.m & b ? s : '-')
  let x = t + r(0o400, 'r') + r(0o200, 'w') + (n.m & 0o4000 ? 's' : r(0o100, 'x')) + r(0o40, 'r') + r(0o20, 'w') + (n.m & 0o2000 ? 's' : r(0o10, 'x')) + r(0o4, 'r') + r(0o2, 'w')
  x += n.m & 0o1000 ? (n.m & 0o1 ? 't' : 'T') : r(0o1, 'x')
  return x
}
const egasi = (fs, uid, fayl = '/etc/passwd') => {
  try { for (const q of fs.oqi(fayl).split('\n')) { const s = q.split(':'); if (Number(s[2]) === uid) return s[0] } } catch { /* yo'q */ }
  return String(uid)
}
const guruhi = (fs, gid) => egasi(fs, gid, '/etc/group')
const bloklar = (n) => (n.k === 'd' ? 4 : Math.ceil(n.s / 4096) * 4)
// link soni: papka — 2 + ichki papkalar; overlay'da o'zgargan papka — 1 (yozuv: ls -l / da etc, run, usr …)
const linklar = (n) => (n.nlink != null ? n.nlink : n.k === 'd' ? (n.b ? 2 + [...n.b.values()].filter((x) => x.k === 'd').length : 2) : n.n ?? 1)
const bloklarN = (n) => (n.bloksiz ? 0 : n.k === 'l' ? 0 : bloklar(n))

// overlay: o'zgargan papkalar (yuqori qatlamda yoki ichida o'zgarish bor) link soni 1
function statL(fs, yol, ergash = true) {
  const n = fs.stat(yol, ergash)
  if (!n || n.k !== 'd' || !fs.yuqori) return n
  const p = normal(yol)
  const old = p === '/' ? '/' : p + '/'
  for (const k of fs.yuqori.keys()) if (k === p || k.startsWith(old)) return { ...n, nlink: 1 }
  if (fs.ozgargan?.has(p)) return { ...n, nlink: 1 }
  return n
}

function insonHajm(b) {
  if (b < 1024) return String(b)
  const u = ['K', 'M', 'G', 'T']
  let x = b / 1024, i = 0
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++ }
  return (x < 10 ? x.toFixed(1) : String(Math.round(x))) + u[i]
}

function argsAjrat(argv, ruxsatli) {
  const f = new Set(), pos = []
  let tugadi = false
  for (const a of argv.slice(1)) {
    if (!tugadi && a === '--') { tugadi = true; continue }
    if (!tugadi && a.startsWith('-') && a.length > 1 && !/^-\d/.test(a)) {
      for (const c of a.slice(1)) { if (ruxsatli && !ruxsatli.includes(c)) return { xato: c }; f.add(c) }
    } else pos.push(a)
  }
  return { f, pos }
}

// ls: busybox va GNU formatlari
function lsQil(argv, ctx, gnu) {
  const { f, pos, xato } = argsAjrat(argv, '1aACxdLHRFplinshrSXvctuwe')
  const fs = ctx.qobiq.fs, cwd = ctx.qobiq.cwd
  if (xato) {
    if (gnu) { ctx.stderr.yoz(`ls: invalid option -- '${xato}'\nTry 'ls --help' for more information.\n`); return 2 }
    ctx.stderr.yoz(`ls: unrecognized option: ${xato}\n${MATN.busyboxLsUsage}`); return 1
  }
  const uzun = f.has('l') || f.has('n'), hamma = f.has('a') || f.has('A'), h = f.has('h')
  const yollar = pos.length ? pos : ['.']
  let kod = 0
  // busybox ls TTY'da rangli (--color=auto): papka 1;34, havola 1;36, bajariladigan 1;32
  const rang = (nom, n) => {
    if (gnu || !ctx.stdout.tty) return nom
    const k = n.k === 'd' ? '1;34' : n.k === 'l' ? '1;36' : n.k === 'c' ? '1;33' : n.m & 0o111 ? '1;32' : null
    return k ? `\x1b[${k}m${nom}\x1b[m` : nom
  }
  const satr = (nom, n, yolMatn) => {
    if (!uzun) return rang(nom, n)
    const hajmM = n.k === 'c' ? '' : h ? insonHajm(n.s) : String(n.s)
    const egas = f.has('n') ? String(n.u) : egasi(fs, n.u)
    const guruh = f.has('n') ? String(n.g) : guruhi(fs, n.g)
    const vaqt = lsVaqt(n.t)
    const link = n.k === 'l' ? ` -> ${n.l}` : ''
    if (gnu) return [ruxsat(n), linklar(n), egas, guruh, hajmM, vaqt, nom + link]
    return `${ruxsat(n)} ${String(linklar(n)).padStart(4)} ${egas.padEnd(8)} ${guruh.padEnd(8)} ${hajmM.padStart(h ? 7 : 9)} ${vaqt} ${rang(nom, n)}${link}`
    void yolMatn
  }
  const gnuJadval = (qatorlar) => {
    // GNU ls -l: har ustun eng uzun qiymatga tekislanadi
    const w = [0, 0, 0, 0, 0]
    for (const q of qatorlar) for (let i = 1; i < 5; i++) w[i] = Math.max(w[i], String(q[i]).length)
    return qatorlar.map((q) => `${q[0]} ${String(q[1]).padStart(w[1])} ${q[2].padEnd(w[2])} ${q[3].padEnd(w[3])} ${String(q[4]).padStart(w[4])} ${q[5]} ${q[6]}`)
  }
  const fayllar = [], papkalar = []
  for (const y of yollar) {
    const yol = yolHal(cwd, y)
    let n
    try { n = statL(fs, yol, !(uzun && !y.endsWith('/'))) ?? null } catch { n = null }
    if (!n) {
      ctx.stderr.yoz(gnu ? `ls: cannot access '${y}': No such file or directory\n` : `ls: ${y}: No such file or directory\n`)
      kod = gnu ? 2 : 1
      continue
    }
    if (n.k === 'd' && !f.has('d')) papkalar.push([y, yol, n]); else fayllar.push([y, n])
  }
  papkalar.sort((a, b) => (a[0] < b[0] ? -1 : 1))
  const chiqar = (qatorlar) => {
    if (!qatorlar.length) return
    if (uzun) { ctx.stdout.yoz((gnu ? gnuJadval(qatorlar) : qatorlar).join('\n') + '\n'); return }
    if (ctx.stdout.tty && !f.has('1')) ctx.stdout.yoz(ustunlar(qatorlar, gnu) + '\n')
    else ctx.stdout.yoz(qatorlar.join('\n') + '\n')
  }
  chiqar(fayllar.map(([y, n]) => satr(y, n)))
  papkalar.forEach(([y, yol, n], i) => {
    if (papkalar.length + fayllar.length > 1) ctx.stdout.yoz((i || fayllar.length ? '\n' : '') + y + ':\n')
    let nomlar = fs.royxat(yol)
    if (!hamma) nomlar = nomlar.filter((x) => !x.startsWith('.'))
    const elementlar = nomlar.map((x) => [x, (() => { try { return statL(fs, normal(yol + '/' + x), false) } catch { return null } })()]).filter(([, x]) => x)
    if (f.has('a')) elementlar.unshift(['.', statL(fs, yol)], ['..', statL(fs, normal(yol + '/..')) ?? n])
    if (uzun) {
      const jami = elementlar.reduce((s, [, x]) => s + bloklarN(x), 0)
      ctx.stdout.yoz(`total ${h && !gnu ? insonHajm(jami * 1024).replace(/(\d)$/, '$1') + ' '.repeat(3) : jami}\n`)
    }
    chiqar(elementlar.map(([x, m]) => satr(x, m)))
  })
  return kod
}
// ls ustunlari (terminal kengligi 100): busybox — ustun kengligi = eng uzun + 2 (oxirgi ustun ham), GNU — oraliq 2
function ustunlar(nomlar, gnu) {
  const W = 100
  const L = (x) => x.replace(/\x1b\[[0-9;]*m/g, '').length
  const pad = (x, n) => x + ' '.repeat(Math.max(0, n - L(x)))
  const eng = Math.max(...nomlar.map(L))
  if (!gnu) {
    const k = eng + 2
    const ustun = Math.max(1, Math.floor(W / k))
    const qator = Math.ceil(nomlar.length / ustun)
    const r = []
    for (let i = 0; i < qator; i++) {
      let s = ''
      for (let j = 0; j < ustun; j++) { const x = nomlar[j * qator + i]; if (x == null) continue; const oxirgi = nomlar[(j + 1) * qator + i] == null; s += oxirgi ? x : pad(x, k) }
      r.push(s)
    }
    return r.join('\n')
  }
  for (let qator = 1; qator <= nomlar.length; qator++) {
    const ustun = Math.ceil(nomlar.length / qator)
    const w = []
    for (let j = 0; j < ustun; j++) w.push(Math.max(...nomlar.slice(j * qator, (j + 1) * qator).map((x) => x.length)))
    const jami = w.reduce((a, b) => a + b, 0) + 2 * (ustun - 1)
    if (jami <= W) {
      const r = []
      for (let i = 0; i < qator; i++) {
        const q = []
        for (let j = 0; j < ustun; j++) { const x = nomlar[j * qator + i]; if (x != null) q.push(j < ustun - 1 && nomlar[(j + 1) * qator + i] != null ? x.padEnd(w[j] + 2) : x) }
        r.push(q.join(''))
      }
      return r.join('\n')
    }
  }
  return nomlar.join('\n')
}

async function matnOqi(ctx, fayllar, xatoF) {
  if (!fayllar.length) return [{ matn: await ctx.stdin.oqi() }]
  const r = []
  for (const y of fayllar) {
    if (y === '-') { r.push({ matn: await ctx.stdin.oqi(), nom: '-' }); continue }
    try { r.push({ matn: ctx.qobiq.fs.oqi(yolHal(ctx.qobiq.cwd, y)), nom: y }) } catch (e) { ctx.stderr.yoz(xatoF(y, e)); r.push({ xato: true }) }
  }
  return r
}
const xMatn = (e) => (e instanceof FsXato ? xatoMatni(e) : String(e.message))

// ------------------------------------------------------------------------------------------- umumiy buyruqlar
const UMUMIY = {
  echo: (argv, ctx) => ctx.qobiq.ichki.echo(argv, ctx),
  printf: (argv, ctx) => ctx.qobiq.ichki.printf(argv, ctx),
  true: () => 0,
  false: () => 1,
  sleep: async (argv, ctx) => {
    const s = parseFloat(argv[1] ?? '0')
    if (Number.isNaN(s)) { ctx.stderr.yoz(`sleep: invalid number '${argv[1]}'\n`); return 1 }
    await ctx.qobiq.p.kut(s * 1000)
    return 0
  },
  env: (argv, ctx) => { for (const [a, b] of Object.entries(ctx.env)) if (!/^\d$|^PWD$|^OLDPWD$/.test(a) || a === 'PWD') if (a !== 'PWD' && a !== 'OLDPWD' && !/^\d$/.test(a)) ctx.stdout.yoz(`${a}=${b}\n`); return 0 },
  printenv: (argv, ctx) => {
    if (argv.length === 1) return UMUMIY.env(argv, ctx)
    let kod = 0
    for (const a of argv.slice(1)) { if (ctx.env[a] != null) ctx.stdout.yoz(ctx.env[a] + '\n'); else kod = 1 }
    return kod
  },
  hostname: (argv, ctx) => {
    const k = ctx.qobiq.p.k
    if (argv[1] === '-i') { ctx.stdout.yoz(([...k.tarmoqlar.values()].map((u) => u.ip).filter(Boolean).join(' ') || '127.0.0.1') + '\n'); return 0 }
    ctx.stdout.yoz(k.config.hostname + '\n'); return 0
  },
  whoami: (argv, ctx) => { ctx.stdout.yoz(foydalanuvchi(ctx).nom + '\n'); return 0 },
  id: (argv, ctx) => {
    const f = foydalanuvchi(ctx, argv[1])
    if (ctx.qobiq.kontekst.tur === 'busybox' && f.uid === 0 && !argv[1]) { ctx.stdout.yoz(MATN.alpineIdRoot + '\n'); return 0 }
    if (f.uid === 0 && ctx.qobiq.kontekst.tur === 'gnu') { ctx.stdout.yoz('uid=0(root) gid=0(root) groups=0(root)\n'); return 0 }
    const n = (x, nom) => (nom ? `${x}(${nom})` : `${x}`)
    ctx.stdout.yoz(`uid=${n(f.uid, f.nomBor ? f.nom : null)} gid=${n(f.gid, f.guruh)} groups=${n(f.gid, f.guruh)}\n`)
    return 0
  },
  pwd: (argv, ctx) => { ctx.stdout.yoz(ctx.qobiq.cwd + '\n'); return 0 },
  uname: (argv, ctx) => {
    const h = ctx.qobiq.p.k.config.hostname
    if (argv.includes('-a')) ctx.stdout.yoz(`Linux ${h} ${MATN.kernel} ${MATN.kernelVersiya} x86_64${ctx.qobiq.kontekst.tur === 'gnu' ? ' GNU/Linux' : ' Linux'}\n`)
    else if (argv.includes('-r')) ctx.stdout.yoz(MATN.kernel + '\n')
    else if (argv.includes('-m')) ctx.stdout.yoz('x86_64\n')
    else if (argv.includes('-n')) ctx.stdout.yoz(h + '\n')
    else ctx.stdout.yoz('Linux\n')
    return 0
  },
  date: (argv, ctx) => { ctx.stdout.yoz(busyboxDate(Date.now()) + '\n'); return 0 },
  mkdir: (argv, ctx) => {
    const { f, pos } = argsAjrat(argv)
    let kod = 0
    for (const y of pos) {
      try { ctx.qobiq.fs.papka(yolHal(ctx.qobiq.cwd, y), { ota: f.has('p') }) } catch (e) {
        ctx.stderr.yoz(ctx.qobiq.kontekst.tur === 'gnu' ? `mkdir: cannot create directory '${y}': ${xMatn(e)}\n` : `mkdir: can't create directory '${y}': ${xMatn(e)}\n`); kod = 1
      }
    }
    return kod
  },
  touch: (argv, ctx) => {
    let kod = 0
    for (const y of argsAjrat(argv).pos) {
      const yol = yolHal(ctx.qobiq.cwd, y)
      try { if (ctx.qobiq.fs.bormi(yol)) ctx.qobiq.fs.yoz(yol, '', true); else ctx.qobiq.fs.yoz(yol, '') } catch (e) {
        ctx.stderr.yoz(ctx.qobiq.kontekst.tur === 'gnu' ? `touch: cannot touch '${y}': ${xMatn(e)}\n` : `touch: ${y}: ${xMatn(e)}\n`); kod = 1
      }
    }
    return kod
  },
  rm: (argv, ctx) => {
    const { f, pos } = argsAjrat(argv)
    let kod = 0
    for (const y of pos) {
      try { ctx.qobiq.fs.ochir(yolHal(ctx.qobiq.cwd, y), { rekursiv: f.has('r') || f.has('R') }) } catch (e) {
        if (f.has('f') && e.kod === 'ENOENT') continue
        const gnu = ctx.qobiq.kontekst.tur === 'gnu'
        if (e.kod === 'ENOTEMPTY' || (e.kod === 'EISDIR')) ctx.stderr.yoz(gnu ? `rm: cannot remove '${y}': Is a directory\n` : `rm: '${y}' is a directory\n`)
        else ctx.stderr.yoz(gnu ? `rm: cannot remove '${y}': ${xMatn(e)}\n` : `rm: can't remove '${y}': ${xMatn(e)}\n`)
        kod = 1
      }
    }
    return kod
  },
  cat: async (argv, ctx) => {
    const gnu = ctx.qobiq.kontekst.tur === 'gnu'
    let kod = 0
    for (const r of await matnOqi(ctx, argsAjrat(argv).pos, (y, e) => (gnu ? `cat: ${y}: ${xMatn(e)}\n` : `cat: can't open '${y}': ${xMatn(e)}\n`))) {
      if (r.xato) { kod = 1; continue }
      ctx.stdout.yoz(r.matn)
    }
    return kod
  },
  head: async (argv, ctx) => qirq(argv, ctx, 'head'),
  tail: async (argv, ctx) => qirq(argv, ctx, 'tail'),
  wc: async (argv, ctx) => {
    const { f, pos } = argsAjrat(argv)
    const busy = ctx.qobiq.kontekst.tur === 'busybox'
    for (const r of await matnOqi(ctx, pos, (y, e) => `wc: ${y}: ${xMatn(e)}\n`)) {
      if (r.xato) continue
      const l = (r.matn.match(/\n/g) ?? []).length, w = r.matn.split(/\s+/).filter(Boolean).length, c = new TextEncoder().encode(r.matn).length
      const qiym = f.size ? [f.has('l') && l, f.has('w') && w, f.has('c') && c].filter((x) => x !== false) : [l, w, c]
      const nom = r.nom ? ' ' + r.nom : ''
      ctx.stdout.yoz((busy && !f.size ? qiym.map((x) => String(x).padStart(7)).join(' ') : qiym.join(' ')) + nom + '\n')
    }
    return 0
  },
  grep: async (argv, ctx) => {
    const { f, pos } = argsAjrat(argv.filter((a, i) => !(argv[i - 1] === '-e')))
    const [naqsh, ...fayllar] = pos
    if (naqsh == null) { ctx.stderr.yoz('Usage: grep [-HhnlLoqvsrRiwFE] PATTERN/-e PATTERN.../-f FILE [FILE]...\n'); return 2 }
    let re
    try { re = new RegExp(naqsh.replace(/\\\|/g, '|').replace(/\\\(/g, '(').replace(/\\\)/g, ')'), f.has('i') ? 'i' : '') } catch { re = new RegExp(naqsh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }
    let topildi = false, soni = 0
    for (const r of await matnOqi(ctx, fayllar, (y) => `grep: ${y}: No such file or directory\n`)) {
      if (r.xato) continue
      for (const q of r.matn.replace(/\n$/, '').split('\n')) {
        const mos = re.test(q) !== f.has('v')
        if (!mos) continue
        topildi = true
        soni++
        if (f.has('c')) continue
        if (f.has('q')) return 0
        if (f.has('o')) { for (const m of q.match(new RegExp(re.source, 'g' + re.flags)) ?? []) ctx.stdout.yoz(m + '\n') } else ctx.stdout.yoz((fayllar.length > 1 ? r.nom + ':' : '') + q + '\n')
      }
    }
    if (f.has('c')) ctx.stdout.yoz(soni + '\n')
    return topildi ? 0 : 1
  },
  which: (argv, ctx) => {
    let kod = 0
    for (const a of argv.slice(1)) { const y = yolTop(ctx.qobiq.fs, a, Object.entries(ctx.env).map(([x, v]) => `${x}=${v}`)); if (y) ctx.stdout.yoz(y + '\n'); else kod = 1 }
    return kod
  },
  ps: (argv, ctx) => {
    const p = ctx.qobiq.p
    const roy = [{ pid: 1, cmd: p.k.jarayon?.argv.join(' ') ?? '' }]
    for (const e of p.k.execlar.values()) if (e !== p) roy.push({ pid: e.ichkiPid, cmd: e.argv.join(' ') })
    if (p.pid1 !== true && !roy.some((x) => x.pid === p.ichkiPid)) roy.push({ pid: p.ichkiPid ?? 7, cmd: argv.join(' ') })
    if (p.k.jarayon?.nginx) roy.splice(1, 0, { pid: p.k.jarayon.nginx.wpid, cmd: 'nginx: worker process', user: 'nginx' })
    ctx.stdout.yoz('PID   USER     TIME  COMMAND\n')
    for (const r of roy.sort((a, b) => a.pid - b.pid)) ctx.stdout.yoz(`${String(r.pid).padStart(5)} ${(r.user ?? 'root').padEnd(8)}  0:00 ${r.cmd}\n`)
    return 0
  },
  ip: (argv, ctx) => ipBuyruq(argv, ctx),
  df: (argv, ctx) => {
    const p = ctx.qobiq.p
    if (ctx.qobiq.kontekst.tur === 'gnu') {
      ctx.stdout.yoz('Filesystem      Size  Used Avail Use% Mounted on\n' + MATN.dfGnu + '\n')
      return 0
    }
    const yollar = argsAjrat(argv).pos
    const qator = (fsn, a, b, c, d, m) => `${fsn.padEnd(20)}${a.padStart(10)}${b.padStart(10)}${c.padStart(10)}${d.padStart(5)} ${m}`
    ctx.stdout.yoz('Filesystem                Size      Used Available Use% Mounted on\n')
    const tmpfs = (m) => qator('tmpfs', '896.8M', '0', '896.8M', '0%', m)
    const asosiy = qator('overlay', '39.3G', MATN.dfUsed, MATN.dfAvail, MATN.dfFoiz, '/')
    if (yollar.length) {
      for (const y of yollar) {
        const yol = yolHal(ctx.qobiq.cwd, y)
        const m = p.k.fs.mountlar.filter((x) => yol === x.yol || yol.startsWith(x.yol + '/')).sort((a, b) => b.yol.length - a.yol.length)[0]
        ctx.stdout.yoz((m?.tur === 'tmpfs' ? tmpfs(m.yol) : m ? qator('/dev/vda3', '39.3G', MATN.dfUsed, MATN.dfAvail, MATN.dfFoiz, m.yol) : asosiy) + '\n')
      }
      return 0
    }
    ctx.stdout.yoz(asosiy + '\n' + MATN.dfQolgan.join('\n') + '\n')
    return 0
  },
  free: (argv, ctx) => { ctx.stdout.yoz(MATN.free); return 0 },
  wget: (argv, ctx) => wget(argv, ctx),
  curl: async (argv, ctx) => {
    return hostCurl(argv, ctx, ctx.qobiq.p.daemon, { kimdan: ctx.qobiq.p.k, versiya: MATN.curlNginx })
  },
  ping: (argv, ctx) => ping(argv, ctx),
  nslookup: (argv, ctx) => nslookup(argv, ctx),
  busybox: (argv, ctx) => { ctx.stdout.yoz(MATN.busyboxBanner); return 0 },
  apk: (argv, ctx) => {
    if (argv[1] === '--version' || argv[1] === '-V') { ctx.stdout.yoz('apk-tools 3.0.9-r0, compiled for x86_64.\n'); return 0 }
    ctx.stderr.yoz(`\x1b[33mtrenajor: \`apk ${argv[1] ?? ''}\` — paket o'rnatish simulyatorda yo'q (internetsiz). Haqiqiy Docker'da ishlaydi.\x1b[0m\n`)
    return 1
  },
}

async function qirq(argv, ctx, tur) {
  let n = 10
  const pos = []
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-n') { n = Number(argv[++i]); continue }
    if (/^-n\d+$/.test(a)) { n = Number(a.slice(2)); continue }
    if (/^-\d+$/.test(a)) { n = Number(a.slice(1)); continue }
    pos.push(a)
  }
  const gnu = ctx.qobiq?.kontekst?.tur === 'gnu'
  for (const r of await matnOqi(ctx, pos, (y, e) => (gnu ? `${tur}: cannot open '${y}' for reading: ${xMatn(e)}\n` : `${tur}: can't open '${y}': ${xMatn(e)}\n`))) {
    if (r.xato) continue
    const q = r.matn.split('\n')
    const oxirgi = q[q.length - 1] === '' ? q.pop() : null
    const t = tur === 'head' ? q.slice(0, n) : q.slice(Math.max(0, q.length - n))
    ctx.stdout.yoz(t.join('\n') + (t.length && (oxirgi != null || t.length < q.length || tur === 'head') ? '\n' : ''))
  }
  return 0
}

function foydalanuvchi(ctx, nomi = null) {
  const u = nomi ?? (ctx.qobiq.p.user || 'root')
  const fs = ctx.qobiq.fs
  const [ism, guruh] = String(u).split(':')
  let uid = /^\d+$/.test(ism) ? Number(ism) : null, nom = ism, gid = guruh != null ? Number(guruh) : null, nomBor = true
  try {
    for (const q of fs.oqi('/etc/passwd').split('\n')) {
      const s = q.split(':')
      if ((uid != null && Number(s[2]) === uid) || s[0] === ism) { uid = Number(s[2]); nom = s[0]; gid ??= Number(s[3]); break }
    }
  } catch { /* yo'q */ }
  if (uid == null) uid = 0
  if (nom === ism && /^\d+$/.test(ism) && !fs.oqi('/etc/passwd').split('\n').some((q) => q.split(':')[2] === ism)) nomBor = false
  gid ??= uid
  let gnom = null
  try { for (const q of fs.oqi('/etc/group').split('\n')) { const s = q.split(':'); if (Number(s[2]) === gid) gnom = s[0] } } catch { /* yo'q */ }
  return { uid, gid, nom: nomBor ? nom : String(uid), nomBor, guruh: gnom }
}

function ipBuyruq(argv, ctx) {
  const k = ctx.qobiq.p.k
  const a = argv.slice(1)
  const qisqa = a.includes('-o'), faqat4 = a.includes('-4')
  const sozlar = a.filter((x) => !x.startsWith('-'))
  const ob = sozlar[0] ?? ''
  const d = ctx.qobiq.p.daemon
  const ulanishlar = [...k.tarmoqlar].map(([tid, u]) => ({ t: d.tarmoqlar.get(tid), u })).filter((x) => x.u.ip)
  const hostRejim = k.hostConfig.tarmoq === 'host'
  if (ob.startsWith('r')) {
    const u = ulanishlar[0]
    if (u) ctx.stdout.yoz(`default via ${u.t.gateway} dev eth0 \n${u.t.subnet} dev eth0 scope link  src ${u.u.ip} \n`)
    return 0
  }
  const brd = (ip, pre) => { const q = ip.split('.').map(Number); const n = ((q[0] << 24) >>> 0) + (q[1] << 16) + (q[2] << 8) + q[3]; const m = pre === 0 ? 0 : (~0 << (32 - pre)) >>> 0; const b = (n & m) | (~m >>> 0); return [b >>> 24, (b >> 16) & 255, (b >> 8) & 255, b & 255].join('.') }
  const ifs = [{ nom: 'lo', ip: '127.0.0.1', pre: 8, scope: 'host' }]
  if (hostRejim) { ifs.push({ nom: 'eth0', ip: d.hostIp, pre: 24, scope: 'global' }); ifs.push({ nom: 'docker0', ip: '172.17.0.1', pre: 16, scope: 'global' }) }
  ulanishlar.forEach((x, i) => ifs.push({ nom: `eth${i}`, ip: x.u.ip, pre: x.u.prefiks, scope: 'global', mac: x.u.mac, n: 2 + i }))
  const tanlangan = sozlar[1] === 'show' && sozlar[2] ? ifs.filter((x) => x.nom === sozlar[2]) : ifs
  if (qisqa) {
    for (const [i, x] of tanlangan.entries()) {
      const idx = ifs.indexOf(x) + 1
      ctx.stdout.yoz(`${idx}: ${x.nom}    inet ${x.ip}/${x.pre} ${x.scope === 'host' ? 'scope host' : `brd ${brd(x.ip, x.pre)} scope global`} ${x.nom}\\       valid_lft forever preferred_lft forever\n`)
      void i
    }
    return 0
  }
  for (const x of tanlangan) {
    const idx = ifs.indexOf(x) + 1
    if (x.nom === 'lo') {
      ctx.stdout.yoz(`1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n       valid_lft forever preferred_lft forever\n`)
      if (!faqat4) ctx.stdout.yoz('    inet6 ::1/128 scope host \n       valid_lft forever preferred_lft forever\n')
    } else {
      ctx.stdout.yoz(`${idx}: ${x.nom}@if${idx + 2}: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue state UP \n    link/ether ${x.mac ?? '02:42:ac:11:00:01'} brd ff:ff:ff:ff:ff:ff\n    inet ${x.ip}/${x.pre} brd ${brd(x.ip, x.pre)} scope global ${x.nom}\n       valid_lft forever preferred_lft forever\n`)
    }
  }
  return 0
}

// HTTP so'rovi konteynerdan (wget, curl): daemon orqali boshqa konteynerga
export async function httpSorov(daemon, kimdan, url, { usul = 'GET', agent }) {
  const m = /^(https?):\/\/([^/:]+)(?::(\d+))?(\/.*)?$/.exec(url)
  if (!m) return { xato: 'url' }
  const [, sxema, host, portM, yol = '/'] = m
  const port = Number(portM ?? (sxema === 'https' ? 443 : 80))
  const nom = daemon.nomHal(kimdan, host)
  if (nom.xato) return { xato: 'dns', host }
  const u = daemon.ulanish(kimdan, nom.ip, port)
  if (u.xato) return { xato: u.xato, ip: nom.ip, host }
  const j = u.konteyner.jarayon
  if (!j?.http) return { xato: 'refused', ip: nom.ip, host }
  const mijozIp = kimdan ? (u.tashqi ? [...daemon.tarmoqlar.values()].find((t) => t.ulanishlar.has(u.konteyner.id))?.gateway : [...kimdan.tarmoqlar.values()][0]?.ip) : [...daemon.tarmoqlar.values()].find((t) => t.ulanishlar.has(u.konteyner.id))?.gateway
  daemon.hodisa('http', 'sorov', u.konteyner, { kimdan: kimdan?.id ?? 'host', usul, yol, port, tashqi: !!u.tashqi })
  await new Promise((r) => setTimeout(r, 15))
  const javob = j.http({ usul, yol, host: portM ? `${host}:${port}` : host, mijozIp: mijozIp ?? '172.17.0.1', agent })
  daemon.hodisa('http', 'javob', u.konteyner, { kimdan: kimdan?.id ?? 'host', holat: javob.holat, yol })
  return { javob, ip: nom.ip }
}

async function wget(argv, ctx) {
  let jim = false, chiqish = null, vaqt = 900, url = null
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-q') jim = true
    else if (a === '-qO-' || a === '-O-' || (a === '-O' && argv[i + 1] === '-')) { chiqish = '-'; if (a === '-O') i++; if (a === '-qO-') jim = true }
    else if (a === '-O') chiqish = argv[++i]
    else if (a === '-T') vaqt = Number(argv[++i])
    else if (a.startsWith('-')) { /* boshqa bayroqlar */ } else url = a
  }
  if (!url) { ctx.stderr.yoz('BusyBox v1.37.0 (2026-01-10 15:38:28 UTC) multi-call binary.\n\nUsage: wget [-cqS] [--spider] [-O FILE] [-o LOGFILE] [--header STR]\n\t[--post-data STR | --post-file FILE] [-Y on/off]\n\t[-P DIR] [-U AGENT] [-T SEC] URL...\n'); return 1 }
  if (!/^https?:\/\//.test(url)) url = 'http://' + url
  const p = ctx.qobiq.p
  const r = await httpSorov(p.daemon, p.k, url, { agent: 'Wget' })
  const host = /^https?:\/\/([^/:]+)/.exec(url)[1]
  if (r.xato === 'dns') { ctx.stderr.yoz(`wget: bad address '${host}'\n`); return 1 }
  if (r.xato === 'refused') { ctx.stderr.yoz(`wget: can't connect to remote host (${r.ip}): Connection refused\n`); return 1 }
  if (r.xato === 'timeout') { await p.kut(Math.min(vaqt, 900) * 1000); ctx.stderr.yoz('wget: download timed out\n'); return 1 }
  const j = r.javob
  if (!jim) ctx.stderr.yoz(`Connecting to ${host} (${r.ip}:80)\n`)
  if (j.holat >= 400) { ctx.stderr.yoz(`wget: server returned error: HTTP/1.1 ${j.holat} ${j.matn}\n`); return 1 }
  if (chiqish === '-') ctx.stdout.yoz(j.tana)
  else {
    const fayl = chiqish ?? (url.split('/').pop() || 'index.html')
    ctx.qobiq.fs.yoz(yolHal(ctx.qobiq.cwd, fayl), j.tana)
    if (!jim) ctx.stderr.yoz(`saving to '${fayl}'\n${fayl.padEnd(20)} 100% |********************************|   ${j.tana.length}  0:00:00 ETA\n'${fayl}' saved\n`)
  }
  return 0
}

async function ping(argv, ctx) {
  let soni = Infinity, host = null
  for (let i = 1; i < argv.length; i++) { if (argv[i] === '-c') soni = Number(argv[++i]); else if (!argv[i].startsWith('-')) host = argv[i] }
  const p = ctx.qobiq.p
  const h = p.daemon.nomHal(p.k, host)
  if (h.xato) { ctx.stderr.yoz(`ping: bad address '${host}'\n`); return 1 }
  ctx.stdout.yoz(`PING ${host} (${h.ip}): 56 data bytes\n`)
  const ul = h.ip === '127.0.0.1' || h.konteyner || p.daemon.ulanish(p.k, h.ip, 0).xato !== 'timeout'
  const vaqtlar = []
  let i = 0
  try {
    for (; i < soni; i++) {
      if (i) await p.kut(1000)
      if (ul) { const t = 0.05 + Math.random() * 0.2; vaqtlar.push(t); ctx.stdout.yoz(`64 bytes from ${h.ip}: seq=${i} ttl=64 time=${t.toFixed(3)} ms\n`) }
    }
    await p.kut(10)
  } catch (e) { if (!(e instanceof Toxtatildi)) throw e }
  const q = vaqtlar.length
  ctx.stdout.yoz(`\n--- ${host} ping statistics ---\n${i} packets transmitted, ${q} packets received, ${Math.round((1 - q / Math.max(i, 1)) * 100)}% packet loss\n`)
  if (q) { const mn = Math.min(...vaqtlar), mx = Math.max(...vaqtlar), av = vaqtlar.reduce((a, b) => a + b, 0) / q; ctx.stdout.yoz(`round-trip min/avg/max = ${mn.toFixed(3)}/${av.toFixed(3)}/${mx.toFixed(3)} ms\n`) }
  return q ? 0 : 1
}

function nslookup(argv, ctx) {
  const host = argv.filter((x) => !x.startsWith('-'))[1]
  const p = ctx.qobiq.p
  const ichki = [...p.k.tarmoqlar.keys()].some((id) => { const t = p.daemon.tarmoqlar.get(id); return t && !t.standart })
  const server = ichki ? '127.0.0.11' : '192.0.2.53'
  const h = p.daemon.nomHal(p.k, host)
  ctx.stdout.yoz(`Server:\t\t${server}\nAddress:\t${server}:53\n\n`)
  if (h.xato) { ctx.stdout.yoz(`** server can't find ${host}: NXDOMAIN\n\n** server can't find ${host}: NXDOMAIN\n\n`); return 1 }
  ctx.stdout.yoz(`Non-authoritative answer:\n\nNon-authoritative answer:\nName:\t${host}\nAddress: ${h.ip}\n\n`)
  return 0
}

// busybox va GNU farqi
const BUSYBOX = {
  ls: (a, c) => lsQil(a, c, false),
}
const GNU = {
  ls: (a, c) => lsQil(a, c, true),
  ps: undefined, // nginx/debian image'larida procps yo'q — fayl tizimi hal qiladi
}
export { nomi }
