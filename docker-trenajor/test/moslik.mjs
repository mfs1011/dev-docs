// Moslik testi: VPS'da yozib olingan har buyruq (docker-trenajor/yozuv/natija/yozuvlar) simulyatorda xuddi shu tartibda
// bajariladi va chiqishi solishtiriladi. O'zgaruvchan qismlar (ID, vaqt, tasodifiy nom, PID, MAC) niqoblanadi;
// dind'dagi tarmoq manzillari (172.18/172.19) VPS host'idagi (172.17/172.18) ga keltiriladi.
// Foydalanish: node docker-trenajor/test/moslik.mjs [04-konteynerlar] [--batafsil]
import fs from 'node:fs'
import path from 'node:path'
import { register } from 'node:module'

register('data:text/javascript,' + encodeURIComponent(`
export async function load(url, ctx, next) {
  if (url.endsWith('.json')) return { format: 'json', source: (await import('node:fs')).readFileSync(new URL(url)), shortCircuit: true }
  return next(url, ctx)
}`))
globalThis.performance ??= { now: () => Date.now() }

const ILDIZ = path.resolve(import.meta.dirname, '../..')
const { muhitYarat } = await import(path.join(ILDIZ, 'src/docker/muhit.js'))
const { bufer, kirishMatn } = await import(path.join(ILDIZ, 'src/docker/qobiq/ijro.js'))
const { CHAP, ONG, nomNavbati } = await import(path.join(ILDIZ, 'src/docker/nomlar.js'))

const argv = process.argv.slice(2)
const batafsil = argv.includes('--batafsil')
const tanlov = argv.filter((a) => !a.startsWith('--'))
const papka = path.join(ILDIZ, 'docker-trenajor/yozuv/natija/yozuvlar')
const fayllar = fs.readdirSync(papka).filter((f) => f.endsWith('.json') && (!tanlov.length || tanlov.some((t) => f.startsWith(t))))

const nomRe = new RegExp(`\\b(?:${CHAP.join('|')})_(?:${ONG.join('|')})\\d?\\b`, 'g')
function niqob(s) {
  return s
    .replace(/\r\n/g, '\n').replace(/\r(?!\x1b)/g, '')
    .replace(/\x1b\[6n|\x1b\[\?2004[hl]/g, '') // TTY so'rovlari (kursor joyi, bracketed paste) — simulyator yubormaydi
    .replace(/^nameserver (?!127\.0\.0\.11).*\n/gm, 'nameserver <DNS>\n').replace(/# ExtServers: \[.*\]/g, '# ExtServers: [<DNS>]')
    .replace(/(nameserver <DNS>\n)+/g, 'nameserver <DNS>\n')
    .replace(/'\/etc\/resolv\.conf'|'\/run\/systemd\/resolve\/resolv\.conf'/g, '<RESOLV>')
    .replace(/sha256:[0-9a-f]{64}/g, (m) => m) // image digest'lari haqiqiy — o'zgarmaydi
    .replace(/(?<![0-9a-f:])[0-9a-f]{64}(?![0-9a-f])/g, '<ID64>')
    .replace(/(?<![0-9a-f:])[0-9a-f]{12}(?![0-9a-f])/g, (m) => (/^[0-9a-f]{12}$/.test(m) && /[a-f]/.test(m) && /\d/.test(m) ? '<ID12>' : m))
    .replace(nomRe, '<NOM>')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g, '<VAQT>')
    .replace(/\d{4}\/\d\d\/\d\d \d\d:\d\d:\d\d/g, '<VAQT>')
    .replace(/\d\d\/[A-Z][a-z]{2}\/\d{4}:\d\d:\d\d:\d\d \+0000/g, '<VAQT>')
    .replace(/[A-Z][a-z]{2}, \d\d [A-Z][a-z]{2} \d{4} \d\d:\d\d:\d\d GMT/g, '<VAQT>')
    .replace(/[A-Z][a-z]{2} [A-Z][a-z]{2} [ \d]\d \d\d:\d\d:\d\d UTC \d{4}/g, '<VAQT>')
    .replace(/\d{4}-\d\d-\d\d \d\d:\d\d:\d\d \+0000 UTC/g, '<VAQT>')
    .replace(/[A-Z][a-z]{2} [ \d]\d \d\d:\d\d/g, '<LSVAQT>')
    .replace(/(Less than a second|About a minute|\d+ seconds?|\d+ minutes)( ago)?/g, '<DUR>$2')
    .replace(/([0-9a-f]{2}:){5}[0-9a-f]{2}/g, '<MAC>')
    .replace(/real\t\dm[\d.]+s\nuser\t\dm[\d.]+s\nsys\t\dm[\d.]+s/g, 'real\t<T>\nuser\t<T>\nsys\t<T>')
    .replace(/"Pid": \d+/g, '"Pid": <PID>').replace(/ \d+ 0 \n/, ' <PID> 0 \n')
    .replace(/ {2,}/g, '  ') // jadval kengligi vaqtga bog'liq ("1 second ago" / "Less than a second ago")
    .replace(/^\r/gm, '')
    .replace(/^( *)\d+( +(?:root|101|nginx) +\d+:\d\d )/gm, '$1<PID>$2') // ps, docker top
    .replace(/\b\d{3}( +root +0:00 )/g, '<PID>$1')
    .replace(/worker process \d+/g, 'worker process <W>').replace(/\b(\d\d)#\1\b/g, '<W>#<W>').replace(/received from \d+/g, 'received from <W>')
    .replace(/curl\/8\.\d+\.\d+/g, 'curl/<V>') // dind'da curl 8.23 (alpine), VPS'da 8.18 (Ubuntu)
    .replace(/(root +)\d+( <LSVAQT> resolv\.conf)/g, '$1<S>$2')
    .replace(/^(dr-xr-xr-x +)\d+( .*proc)$/gm, '$1<N>$2') // /proc link soni hostdagi jarayonlarga bog'liq
    .replace(/time=\d+\.\d+ ms/g, 'time=<T> ms').replace(/min\/avg\/max = [\d./]+ ms/g, 'min/avg/max = <T> ms')
    .replace(/\d+(\.\d+)?MiB \/ 1\.752GiB  \d+\.\d+%  [\d.]+k?B \/ [\d.]+k?B  [\d.]+[kM]?B \/ [\d.]+k?B/g, '<STATS>')
    .replace(/(MemUsage}}"\n.*|^\S+ )\d+(\.\d+)?MiB \/ 1\.752GiB$/gm, '$1<MEM>')
    .replace(/"Pid": <PID>|running \d+ 0$/gm, (m) => m.replace(/\d+ 0$/, '<PID> 0'))
}
// pull progress: yakuniy ekran holati solishtiriladi (yangilanishlar tartibi tarmoq tezligiga bog'liq)
function ekran(s) {
  if (!s.includes('\x1b[1A') && !s.includes('\x1b[2A')) return s
  const q = ['']
  let y = 0
  for (const m of s.matchAll(/\x1b\[(\d+)([AB])|\x1b\[2K|\r\n|\n|\r|[^\x1b\r\n]+/g)) {
    const t = m[0]
    if (m[2] === 'A') y -= Number(m[1])
    else if (m[2] === 'B') y += Number(m[1])
    else if (t === '\x1b[2K') q[y] = ''
    else if (t === '\n' || t === '\r\n') { y++; q[y] ??= '' }
    else if (t === '\r') { /* satr boshiga */ }
    else q[y] = (q[y] ?? '') + t
  }
  return q.join('\n').replace(/ +$/gm, '')
}
// dind'dagi manzillar: dind o'zi VPS'ning 172.17 tarmog'ida, shuning uchun uning bridge'i 172.18, o'z tarmog'i 172.19
const dind = (s) => s.replace(/172\.18\./g, '172.17.').replace(/172\.19\./g, '172.18.')
// hajmlar: 0.5% gacha farq (manifest bloblari hisobi) — mos deb olinadi
const sonlar = (s) => s.replace(/(\d+(?:\.\d+)?)(kB|MB|GB)/g, '<HAJM>')
function hajmMos(a, b) {
  if (sonlar(a) !== sonlar(b)) return false
  const x = [...a.matchAll(/(\d+(?:\.\d+)?)(kB|MB|GB)/g)], y = [...b.matchAll(/(\d+(?:\.\d+)?)(kB|MB|GB)/g)]
  return x.length === y.length && x.every((m, i) => m[2] === y[i][2] && Math.abs(Number(m[1]) - Number(y[i][1])) / Number(m[1]) <= 0.006)
}
// image inspect "Size": unpack paytida 4 KiB farq bo'lishi mumkin (yozuv 02: 237177221, katalog: 237173125)
const katta = (s) => s.replace(/"Size": (\d{7,})/g, (m, n) => `"Size": ${Math.round(Number(n) / 1e5)}`)
// dind va vaqtga bog'liq yozuvlar — simulyator ataylab boshqacha (sabab bilan)
const ISTISNO = [
  [/^docker (version|info|compose version|buildx version)$/, '01 dind ichida yozilgan; simulyator VPS host qiymatlarini (host.txt) ko\'rsatadi'],
  [/^docker run alpine:yoqteg true$/, 'yozuv paytida Docker Hub 429 qaytardi'],
  [/wget -qO- -T 3 http:\/\/172\.17\.0\.2\//, 'dind: konteyner 172.18 da; VPS host\'ida (kitob 5-bob) javob 200'],
  [/^docker run --rm --network host alpine ip -4 -o addr$/, 'dind: host tarmog\'i — dind konteynerining o\'zi'],
  [/^docker run --rm alpine sh -c 'echo xato >&2; echo yaxshi'$/, 'stdout/stderr kelish tartibi tasodifiy'],
  [/^docker run --rm nginx:1.29 sh -c 'yoqbuyruq; echo \$0'$/, 'stdout/stderr kelish tartibi tasodifiy'],
  [/^docker pull alpine:latest 2>&1 \| cat$/, 'alpine:latest teg kitobdan keyin yangilangan (trenajor kitobdagi digest\'da)'],
  [/^docker images --format 'table/, 'alpine:latest teg kitobdan keyin yangilangan'],
  [/^docker run -d --name w alpine/, 'ssenariy xatosi (1 harfli nom)'],
  [/^docker logs qayta$/, 'qayta urinishlar soni vaqtga bog\'liq (4 s ichida 5–6 marta)'],
  [/^docker events --since 1s/, '"oxirgi 1 soniya" oynasi buyruqlar tezligiga bog\'liq'],
  [/^docker exec veb ls -la \/$/, '"total" bloklari overlay ichki hisobiga bog\'liq (64 o\'rniga 72)'],
]

const kut = (ms) => new Promise((r) => setTimeout(r, ms))
let jami = 0, mos = 0
const xatolar = [], istisno = []

for (const f of fayllar) {
  const d = JSON.parse(fs.readFileSync(path.join(papka, f)))
  for (const s of d.ssenariylar) {
    // interaktiv kirish (-it): terminal navbatdagi qatorni beradi va (TTY kabi) aks-sado qiladi
    let kirishlar = [], joriyOut = null
    const terminal = {
      cols: () => 100,
      uzilish: (f) => { terminal._uz = f },
      ajralish: (f) => { terminal._aj = f },
    }
    const m = muhitYarat({ fsYukla: async (nom) => JSON.parse(fs.readFileSync(path.join(ILDIZ, 'public/docker-trenajor/fs', nom))), terminal })
    const stdin = {
      tty: true,
      oqi: async () => '',
      qator: async () => {
        await kut(30)
        for (;;) {
          const x = kirishlar.shift()
          if (x == null) return null
          if (x.startsWith('!! ')) {
            const bayt = x.slice(3)
            if (bayt === '\\x03') { joriyOut.yoz('^C'); terminal._uz?.(); continue }
            if (bayt === '\\x10\\x11') { terminal._aj?.(); return new Promise(() => {}) }
            continue
          }
          joriyOut.yoz(x + '\n')
          return x
        }
      },
    }
    // yozuvdagi tasodifiy konteyner nomlari — simulyator ham shu nomlarni beradi
    nomNavbati.length = 0
    for (const b of s.buyruqlar) for (const n of (b.out ?? '').match(nomRe) ?? []) if (!nomNavbati.includes(n)) nomNavbati.push(n)
    for (const b of s.buyruqlar) {
      m.qobiq.oxirgiKod = 0 // yozuvda har buyruq yangi bash'da bajarilgan
      if (b.direktiva) {
        const [nom, ...arg] = b.direktiva.split(' ')
        if (nom === 'tayyor') m.tayyorla(arg)
        else if (nom === 'sukut') { const o = bufer(); await m.qobiq.bajar(arg.join(' '), { stdout: o, stderr: o, stdin: kirishMatn('') }) }
        else if (nom === 'kut') await kut(Number(arg[0]) * 1000)
        continue
      }
      jami++
      kirishlar = [...(b.kirish ?? [])]
      const o = bufer(true)
      joriyOut = o
      terminal._uz = null; terminal._aj = null
      // Ctrl+C: yozuvdagi kabi buyruq boshlangandan keyin
      const ctrlC = kirishlar.length && kirishlar.every((x) => x === '!! \\x03')
      if (ctrlC) {
        const n = kirishlar.length
        kirishlar = []
        ;(async () => { await kut(1500); for (let i = 0; i < n; i++) { o.yoz('^C'); terminal._uz?.(); await kut(1500) } })()
      }
      if (process.env.IZ) console.error("→", f, b.cmd.slice(0, 80))
      let kod
      try { kod = await m.qobiq.bajar(b.cmd, { stdout: o, stderr: o, stdin: b.kirish ? stdin : kirishMatn(''), tty: true }) } catch (e) { o.yoz(`ISTISNO: ${e.stack}`); kod = -1 }
      const kutilgan = niqob(ekran(dind(b.out))), olingan = niqob(ekran(o.matn))
      const ist = ISTISNO.find(([re]) => re.test(b.cmd))
      if (ist) { istisno.push(`${f}: ${b.cmd} — ${ist[1]}`); jami--; continue }
      if ((kutilgan === olingan || hajmMos(kutilgan, olingan) || katta(kutilgan) === katta(olingan)) && kod === b.kod) mos++
      else xatolar.push({ f, cmd: b.cmd, kutilgan, olingan, kod, kutKod: b.kod })
    }
    m.daemon.konteynerlar.forEach((k) => k.jarayon?.oldir(137))
  }
}

for (const x of xatolar) {
  console.log(`\n✗ ${x.f}: $ ${x.cmd}   (kod: ${x.kod}, kutilgan ${x.kutKod})`)
  if (batafsil || x.kutilgan.length + x.olingan.length < 3000) {
    const a = x.kutilgan.split('\n'), b = x.olingan.split('\n')
    for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) { console.log(`  qator ${i + 1}:\n    haqiqiy: ${JSON.stringify(a[i])}\n    simulyator: ${JSON.stringify(b[i])}`); if (!batafsil) break }
  }
}
if (batafsil) for (const x of istisno) console.log('  istisno:', x)
console.log(`\nMoslik: ${mos}/${jami} buyruq (${((mos / jami) * 100).toFixed(1)}%), istisno: ${istisno.length}`)
process.exit(0)
