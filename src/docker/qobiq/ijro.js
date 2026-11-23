// Qobiq interpretatori: tahlil.js AST'ini bajaradi. Host (bash) va konteyner ichidagi qobiq (busybox ash) uchun bitta
// kod — farqi buyruqlar jadvalida va xato matnlarida (`lahja`).
//
// Buyruq funksiyasi: async (argv, ctx) => chiqish kodi
//   ctx: { stdout, stderr, stdin, env, qobiq, signal, tty }
//   stdout/stderr: { yoz(matn), tty }   stdin: { oqi(): Promise<string> , tty }
import { tahlil, TahlilXato } from './tahlil.js'
import { yolHal, FsXato, xatoMatni } from '../vfs.js'

export class Toxtatildi extends Error { constructor() { super('to‘xtatildi') } }

export const bufer = (tty = false) => {
  const b = { matn: '', tty, yoz(x) { b.matn += x } }
  return b
}
export const bosh = () => ({ tty: false, yoz() {} })
export const kirishMatn = (matn, tty = false) => ({ tty, oqi: async () => matn, matn })

// Lahjalar: xato xabarlari formati
export const BASH = {
  nom: 'bash',
  topilmadi: (c) => `bash: ${c}: command not found\n`,
  yonalishXato: (fayl, xato) => `bash: ${fayl}: ${xato}\n`,
  sintaksis: (x) => `bash: ${x}\n`,
}
export const ASH = {
  nom: 'sh',
  // busybox ash: `sh -c` da "line 0:" qo'shiladi, kod 2 (yozuv 11-qoshimcha)
  cdXato: (p, sabab, interaktiv) => `sh: cd: ${interaktiv ? '' : 'line 0: '}can't cd to ${p}: ${sabab}\n`,
  cdKod: 2,
  topilmadi: (c) => `sh: ${c}: not found\n`,
  yonalishXato: (fayl, xato) => `sh: can't create ${fayl}: ${xato}\n`,
  sintaksis: (x) => `sh: syntax error: ${x}\n`,
}

export class Qobiq {
  // fs — DaraxtFs/OverlayFs; buyruqlar — { nom: fn }; env — obyekt
  constructor({ fs, env = {}, cwd = '/', buyruqlar = {}, lahja = BASH, ichkiBuyruqlar = true, tarix = null }) {
    this.fs = fs
    this.env = { ...env }
    this.cwd = cwd
    this.buyruqlar = buyruqlar
    this.lahja = lahja
    this.oxirgiKod = 0
    this.tarix = tarix ?? []
    this.chiqdi = null // `exit` chaqirilsa — kod
    if (ichkiBuyruqlar) this.ichki = ICHKI
    else this.ichki = {}
  }

  async bajar(manba, io) {
    let ast
    try { ast = tahlil(manba) } catch (e) {
      if (e instanceof TahlilXato) {
        io.stderr.yoz(this.lahja.sintaksis(e.message))
        this.oxirgiKod = 2
        return 2
      }
      throw e
    }
    return this.royxat(ast.royxat, io)
  }

  async royxat(royxat, io) {
    let kod = this.oxirgiKod
    for (let i = 0; i < royxat.length; i++) {
      const { quvur } = royxat[i]
      const oldingi = i > 0 ? royxat[i - 1].op : ';'
      if (oldingi === '&&' && kod !== 0) continue
      if (oldingi === '||' && kod === 0) continue
      kod = await this.quvur(quvur, io)
      this.oxirgiKod = kod
      if (this.chiqdi != null) return this.chiqdi
    }
    return kod
  }

  async quvur(q, io) {
    const t0 = performance.now()
    let kirish = io.stdin
    let kod = 0
    for (let i = 0; i < q.buyruqlar.length; i++) {
      io.signal?.throwIfAborted?.()
      const oxirgi = i === q.buyruqlar.length - 1
      const chiqish = oxirgi ? io.stdout : bufer(false)
      try {
        kod = await this.buyruq(q.buyruqlar[i], { ...io, stdin: kirish, stdout: chiqish })
      } catch (e) {
        if (e instanceof Toxtatildi || e?.name === 'AbortError') throw e
        throw e
      }
      if (!oxirgi) kirish = kirishMatn(chiqish.matn)
    }
    if (q.inkor) kod = kod === 0 ? 1 : 0
    if (q.time) {
      const s = (performance.now() - t0) / 1000
      const f = (x) => `${Math.floor(x / 60)}m${(x % 60).toFixed(3)}s`
      io.stderr.yoz(`\nreal\t${f(s)}\nuser\t0m0.0${String(Math.floor(Math.random() * 40) + 10)}s\nsys\t0m0.0${String(Math.floor(Math.random() * 30) + 10)}s\n`)
    }
    return kod
  }

  // ------------------------------------------------------------------ kengaytirish (expansion)
  async qiymat(qism, io) {
    if (qism.t === 'lit') return qism.v
    if (qism.t === 'var') return this.ozgaruvchi(qism.v)
    if (qism.t === 'arith') return String(this.arifmetika(qism.v))
    if (qism.t === 'cmd') {
      const b = bufer(false)
      const ichki = this.bola()
      await ichki.bajar(qism.v, { ...io, stdout: b })
      return b.matn.replace(/\n+$/, '')
    }
    return ''
  }
  arifmetika(ifoda) {
    let x = ifoda.replace(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g, (_, n) => String(Number(this.env[n] ?? 0) || 0))
    x = x.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (n) => String(Number(this.env[n] ?? 0) || 0))
    if (!/^[\d\s+\-*/%()<>=!&|]*$/.test(x)) return 0
    try {
      const v = Function(`"use strict"; return (${x.replace(/\//g, '/') || 0})`)()
      return typeof v === 'boolean' ? Number(v) : Math.trunc(v)
    } catch { return 0 }
  }
  ozgaruvchi(nom) {
    if (nom === '?') return String(this.oxirgiKod)
    if (nom === '$') return '1'
    if (nom === '0') return this.lahja.nom
    if (nom === '#') return '0'
    const m = /^([A-Za-z_][A-Za-z0-9_]*)(:?[-=+?])(.*)$/.exec(nom)
    if (m) {
      const v = this.env[m[1]]
      const bosh = m[2].startsWith(':') ? !v : v == null
      if (m[2].endsWith('-')) return bosh ? m[3] : v
      if (m[2].endsWith('+')) return bosh ? '' : m[3]
      if (m[2].endsWith('=')) { if (bosh) this.env[m[1]] = m[3]; return this.env[m[1]] }
      return v ?? ''
    }
    return this.env[nom] ?? ''
  }

  // so'z → maydonlar (bo'linish va glob bilan)
  async soz(qismlar, io, { bolinsin = true } = {}) {
    // maydonlar: har biri [{ v, q, glob }]
    let maydonlar = [[]]
    let birorQ = false
    for (const q of qismlar) {
      const v = await this.qiymat(q, io)
      if (q.q || q.t === 'lit' || !bolinsin) {
        if (q.q) birorQ = true
        maydonlar[maydonlar.length - 1].push({ v, q: q.q || (q.t !== 'lit'), glob: q.glob })
        continue
      }
      // qo'shtirnoqsiz $VAR / $(...) — bo'shliqlarda bo'linadi
      const bolak = v.split(/[ \t\n]+/)
      if (v === '') continue
      bolak.forEach((b, i) => {
        if (i > 0) maydonlar.push([])
        if (b !== '') maydonlar[maydonlar.length - 1].push({ v: b, q: false })
      })
    }
    const natija = []
    for (const m of maydonlar) {
      if (!m.length && !birorQ) continue
      const matn = m.map((x) => x.v).join('')
      if (m.some((x) => x.glob) && bolinsin) {
        const mos = this.glob(m)
        if (mos.length) { natija.push(...mos); continue }
      }
      if (matn === '' && !birorQ && !m.length) continue
      natija.push(matn)
    }
    return natija
  }

  glob(m) {
    const naqsh = m.map((x) => (x.glob ? (x.v === '*' ? '[^/]*' : x.v === '?' ? '[^/]' : '[') : x.v.replace(/[.+^${}()|\\\]]/g, '\\$&'))).join('')
    const matn = m.map((x) => x.v).join('')
    const bolak = matn.split('/')
    const oxirgi = bolak.pop()
    const papka = bolak.join('/') || (matn.startsWith('/') ? '/' : '')
    if (papka.includes('*')) return []
    let re
    try { re = new RegExp('^' + naqsh.split('/').pop() + '$') } catch { return [] }
    try {
      const nomlar = this.fs.royxat(yolHal(this.cwd, papka || '.'))
      return nomlar.filter((n) => re.test(n) && (oxirgi.startsWith('.') || !n.startsWith('.'))).map((n) => (papka ? (papka === '/' ? '/' : papka + '/') + n : n))
    } catch { return [] }
  }

  bola() {
    const b = new Qobiq({ fs: this.fs, env: { ...this.env }, cwd: this.cwd, buyruqlar: this.buyruqlar, lahja: this.lahja, tarix: this.tarix })
    b.oxirgiKod = this.oxirgiKod
    b.ota = this
    b.kontekst = this.kontekst
    b.p = this.p
    b.yolTop = this.yolTop
    b.ichki = this.ichki
    return b
  }

  // ------------------------------------------------------------------ bitta buyruq
  async buyruq(b, io) {
    if (b.tur) {
      const y = await this.yonalish(b, io)
      if (y.kod != null) return y.kod
      try { return await this.murakkab(b, y.io) } finally { y.yakun() }
    }
    const argv = []
    for (const s of b.sozlar) argv.push(...(await this.soz(s, io)))
    const env = {}
    for (const t of b.tayinlash) env[t.nom] = (await this.soz(t.qiymat, io, { bolinsin: false })).join('')
    if (!argv.length) {
      Object.assign(this.env, env)
      if (b.yonalish.length) { const y = await this.yonalish(b, io); if (y.kod != null) return y.kod; y.yakun() }
      return this.oxirgiKod
    }
    const y = await this.yonalish(b, io)
    if (y.kod != null) return y.kod
    const ctx = { ...y.io, env: { ...this.env, ...env }, qobiq: this }
    try {
      return await this.chaqir(argv, ctx)
    } finally { y.yakun() }
  }

  async murakkab(b, io) {
    io.signal?.throwIfAborted?.()
    if (b.tur === 'if') {
      for (const sh of b.shoxlar) {
        if ((await this.royxat(sh.shart, io)) === 0) return this.chiqdi ?? this.royxat(sh.tana, io)
        if (this.chiqdi != null) return this.chiqdi
      }
      return b.boshqa ? this.royxat(b.boshqa, io) : 0
    }
    if (b.tur === 'while' || b.tur === 'until') {
      let kod = 0
      for (let n = 0; ; n++) {
        const sh = await this.royxat(b.shart, io)
        if (this.chiqdi != null) return this.chiqdi
        if ((sh === 0) !== (b.tur === 'while')) break
        kod = await this.royxat(b.tana, io)
        if (this.chiqdi != null) return this.chiqdi
        if (n % 50 === 49) await new Promise((r) => setTimeout(r, 0))
        await this.qadam?.()
      }
      return kod
    }
    if (b.tur === 'for') {
      const qiymatlar = []
      for (const s of b.sozlar ?? []) qiymatlar.push(...(await this.soz(s, io)))
      let kod = 0
      for (const v of qiymatlar) {
        this.env[b.nom] = v
        kod = await this.royxat(b.tana, io)
        if (this.chiqdi != null) return this.chiqdi
      }
      return kod
    }
    if (b.tur === 'guruh') return this.royxat(b.tana, io)
    if (b.tur === 'subshell') { const q = this.bola(); return q.royxat(b.tana, io) }
    return 0
  }

  // yo'naltirishlar: { io, yakun() } yoki { kod } (xato)
  async yonalish(b, io) {
    let { stdout, stderr, stdin } = io
    const yoziladi = [] // [{ fayl, b, qosh }]
    for (const y of b.yonalish) {
      if (y.v === '<<') { stdin = kirishMatn(y.tirnoq ? y.heredoc : await this.heredocKengay(y.heredoc, io)); continue }
      if (y.v === '>&') {
        if (y.fd === '2' && y.maqsad === '1') stderr = stdout
        else if (y.fd === '1' && y.maqsad === '2') stdout = stderr
        continue
      }
      const fayl = (await this.soz(y.soz, io, { bolinsin: false })).join('')
      if (y.v === '<') {
        try { stdin = kirishMatn(this.fs.oqi(yolHal(this.cwd, fayl))) } catch (e) {
          stderr.yoz(this.lahja.yonalishXato(fayl, e instanceof FsXato ? xatoMatni(e) : String(e)).replace("can't create", "can't open").replace('cannot create', 'cannot open'))
          return { kod: 1 }
        }
        continue
      }
      const qosh = y.v === '>>' || y.v === '&>>'
      const fd = y.v.startsWith('&') ? '&' : y.fd ?? '1'
      let maqsad
      if (fayl === '/dev/null') maqsad = bosh()
      else if (fayl === '/dev/stderr') maqsad = io.stderr
      else if (fayl === '/dev/stdout') maqsad = io.stdout
      else {
        const yol = yolHal(this.cwd, fayl)
        try {
          if (!qosh) this.fs.yoz(yol, '')
          else if (!this.fs.bormi(yol)) this.fs.yoz(yol, '')
        } catch (e) {
          stderr.yoz(this.lahja.yonalishXato(fayl, e instanceof FsXato ? xatoMatni(e) : String(e)))
          return { kod: this.lahja.xatoKod ?? 1 }
        }
        maqsad = bufer(false)
        yoziladi.push({ yol, b: maqsad })
      }
      if (fd === '1') stdout = maqsad
      else if (fd === '2') stderr = maqsad
      else { stdout = maqsad; stderr = maqsad }
    }
    // faylga yozish: buyruq yozgan zahoti (keyingi `cat` ko'rishi uchun), oxirida ham
    for (const y of yoziladi) {
      const asl = y.b.yoz
      y.b.yoz = (m) => { asl(m); try { this.fs.yoz(y.yol, m, true) } catch { /* yozilmadi */ } }
      y.b.matn = ''
    }
    return { io: { ...io, stdout, stderr, stdin }, yakun: () => {} }
  }

  async heredocKengay(matn, io) {
    // heredoc ichida $VAR va $(...) kengayadi
    let natija = ''
    const re = /\$\{([^}]+)\}|\$([A-Za-z_][A-Za-z0-9_]*|\?)|\$\(([^)]*)\)/g
    let i = 0, m
    while ((m = re.exec(matn))) {
      natija += matn.slice(i, m.index)
      if (m[3] != null) natija += await this.qiymat({ t: 'cmd', v: m[3] }, io)
      else natija += this.ozgaruvchi(m[1] ?? m[2])
      i = m.index + m[0].length
    }
    return natija + matn.slice(i)
  }

  async chaqir(argv, ctx) {
    const [nom] = argv
    const f = this.ichki[nom] ?? this.buyruqlar[nom] ?? this.buyruqlar[nom.split('/').pop()]
    if (!f || (nom.includes('/') && !this.buyruqlar[nom] && !this.fs.bormi(yolHal(this.cwd, nom)))) {
      if (nom.includes('/') && this.buyruqlarYol?.(nom, ctx)) return this.buyruqlarYol(nom, ctx)
      ctx.stderr.yoz(nom.includes('/') ? this.lahja.topilmadi(nom).replace(this.lahja.nom === 'bash' ? 'command not found' : 'not found', this.lahja.nom === 'bash' ? 'No such file or directory' : 'not found') : this.lahja.topilmadi(nom))
      return 127
    }
    try {
      return (await f(argv, ctx)) ?? 0
    } catch (e) {
      if (e instanceof FsXato) { ctx.stderr.yoz(`${nom}: ${e.yol}: ${xatoMatni(e)}\n`); return 1 }
      throw e
    }
  }
}

// ------------------------------------------------------------------ ichki buyruqlar (builtin)
const ICHKI = {
  cd(argv, ctx) {
    const q = ctx.qobiq
    const p = argv[1] ?? q.env.HOME ?? '/'
    const yol = yolHal(q.cwd, p === '-' ? (q.env.OLDPWD ?? q.cwd) : p)
    const n = q.fs.stat(yol)
    const sabab = !n ? 'No such file or directory' : n.k !== 'd' ? 'Not a directory' : null
    if (sabab) {
      ctx.stderr.yoz(q.lahja.cdXato ? q.lahja.cdXato(p, sabab, q.interaktiv) : `bash: cd: ${p}: ${sabab}\n`)
      return q.lahja.cdKod ?? 1
    }
    q.env.OLDPWD = q.cwd
    q.cwd = yol
    q.env.PWD = yol
    return 0
  },
  pwd(argv, ctx) { ctx.stdout.yoz(ctx.qobiq.cwd + '\n'); return 0 },
  export(argv, ctx) {
    for (const a of argv.slice(1)) {
      const i = a.indexOf('=')
      if (i > 0) ctx.qobiq.env[a.slice(0, i)] = a.slice(i + 1)
    }
    return 0
  },
  unset(argv, ctx) { for (const a of argv.slice(1)) delete ctx.qobiq.env[a]; return 0 },
  exit(argv, ctx) {
    const kod = argv[1] != null ? Number(argv[1]) & 255 : ctx.qobiq.oxirgiKod
    let q = ctx.qobiq
    q.chiqdi = kod
    return kod
  },
  true: () => 0,
  false: () => 1,
  ':': () => 0,
  echo(argv, ctx) {
    let a = argv.slice(1), yangi = true, esc = false
    while (a[0] && /^-[neE]+$/.test(a[0])) {
      if (a[0].includes('n')) yangi = false
      if (a[0].includes('e')) esc = true
      a = a.slice(1)
    }
    let s = a.join(' ')
    if (esc || ctx.qobiq.lahja.echoEsc) s = s.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
    ctx.stdout.yoz(s + (yangi ? '\n' : ''))
    return 0
  },
  printf(argv, ctx) {
    const [, fmt = '', ...args] = argv
    let out = '', i = 0
    const bir = () => {
      let s = '', ishlatdi = false
      s = fmt.replace(/%([-0-9]*)([sdq%])|\\(n|t|\\)/g, (m, kenglik, tur, esc) => {
        if (esc) return esc === 'n' ? '\n' : esc === 't' ? '\t' : '\\'
        if (tur === '%') return '%'
        ishlatdi = true
        const v = args[i++] ?? ''
        const x = tur === 'd' ? String(parseInt(v || '0', 10)) : v
        const w = parseInt(kenglik || '0', 10)
        return kenglik?.startsWith('-') ? x.padEnd(-w) : x.padStart(w)
      })
      return { s, ishlatdi }
    }
    do { const r = bir(); out += r.s; if (!r.ishlatdi) break } while (i < args.length)
    ctx.stdout.yoz(out)
    return 0
  },
  test(argv, ctx) { return testBaho(argv.slice(1), ctx) },
  '['(argv, ctx) {
    if (argv[argv.length - 1] !== ']') { ctx.stderr.yoz(`${ctx.qobiq.lahja.nom}: missing ]\n`); return 2 }
    return testBaho(argv.slice(1, -1), ctx)
  },
  command(argv, ctx) {
    if (argv[1] === '-v') {
      let kod = 1
      for (const a of argv.slice(2)) {
        if (ICHKI[a]) { ctx.stdout.yoz(a + '\n'); kod = 0; continue }
        const y = ctx.qobiq.yolTop?.(a)
        if (y) { ctx.stdout.yoz(y + '\n'); kod = 0 }
      }
      return kod
    }
    return ctx.qobiq.chaqir(argv.slice(1), ctx)
  },
  read(argv, ctx) {
    return ctx.stdin.oqi().then((m) => { const nom = argv[argv.length - 1]; ctx.qobiq.env[nom] = (m ?? '').split('\n')[0]; return m ? 0 : 1 })
  },
  history(argv, ctx) {
    ctx.qobiq.tarix.forEach((t, i) => ctx.stdout.yoz(`${String(i + 1).padStart(5)}  ${t}\n`))
    return 0
  },
  type(argv, ctx) {
    for (const a of argv.slice(1)) {
      if (ICHKI[a]) ctx.stdout.yoz(`${a} is a shell builtin\n`)
      else if (ctx.qobiq.buyruqlar[a]) ctx.stdout.yoz(`${a} is ${ctx.qobiq.yolTop?.(a) ?? '/usr/bin/' + a}\n`)
      else { ctx.stderr.yoz(`bash: type: ${a}: not found\n`); return 1 }
    }
    return 0
  },
}

function testBaho(a, ctx) {
  const fs = ctx.qobiq.fs
  const y = (p) => yolHal(ctx.qobiq.cwd, p)
  const st = (p) => { try { return fs.stat(y(p)) } catch { return null } }
  if (a[0] === '!') return testBaho(a.slice(1), ctx) === 0 ? 1 : 0
  if (a.length === 0) return 1
  if (a.length === 1) return a[0] !== '' ? 0 : 1
  if (a.length === 2) {
    const [op, x] = a
    const n = st(x)
    const r = { '-n': x !== '', '-z': x === '', '-e': !!n, '-f': n?.k === 'f', '-d': n?.k === 'd', '-s': !!n && n.s > 0, '-L': (() => { try { return fs.stat(y(x), false)?.k === 'l' } catch { return false } })(), '-r': !!n, '-w': !!n, '-x': !!n && !!(n.m & 0o111) }[op]
    return r ? 0 : 1
  }
  const [x, op, z] = a
  const sn = (v) => { const n = Number(v); return n }
  const r = { '=': x === z, '==': x === z, '!=': x !== z, '-eq': sn(x) === sn(z), '-ne': sn(x) !== sn(z), '-lt': sn(x) < sn(z), '-le': sn(x) <= sn(z), '-gt': sn(x) > sn(z), '-ge': sn(x) >= sn(z) }[op]
  return r ? 0 : 1
}
