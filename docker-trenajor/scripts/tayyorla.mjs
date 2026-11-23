// VPS yozuvlaridan (docker-trenajor/yozuv/natija) simulyator ma'lumotlarini yasash:
//   src/docker/data/katalog.json — image'lar (digest, config, history, qatlamlar, hajmlar)
//   src/docker/data/matnlar.js   — help matnlari, hello-world, nginx loglari, busybox formatlari, docker version/info
//   public/docker-trenajor/fs/   — image fayl tizimlari (sahifa kerak bo'lganda yuklaydi)
// Hech qanday matn qo'lda yozilmaydi: hammasi yozuvdan olinadi. Yozuvda topilmasa — skript xato beradi.
// Foydalanish: node docker-trenajor/scripts/tayyorla.mjs
import fs from 'node:fs'
import path from 'node:path'

const ILDIZ = path.resolve(import.meta.dirname, '../..')
const NATIJA = path.join(ILDIZ, 'docker-trenajor/yozuv/natija')
const SANA = JSON.parse(fs.readFileSync(path.join(NATIJA, 'yozuvlar/04-konteynerlar.json'))).sana

const toza = (s) => s.replace(/\r\n/g, '\n').replace(/\r/g, '')
const ansisiz = (s) => s.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')

// --------------------------------------------------------------------------------------- yozuvlar
const yozuvlar = []
for (const f of fs.readdirSync(path.join(NATIJA, 'yozuvlar')).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(NATIJA, 'yozuvlar', f)))
  for (const s of d.ssenariylar) for (const b of s.buyruqlar) if (b.cmd) yozuvlar.push({ ...b, fayl: f })
}
function yozuv(cmd, { fayl = null, n = 0 } = {}) {
  const mos = yozuvlar.filter((b) => b.cmd === cmd && (!fayl || b.fayl.startsWith(fayl)))
  if (!mos[n]) throw new Error(`yozuvda yo'q: ${cmd}`)
  return toza(mos[n].out)
}

// --------------------------------------------------------------------------------------- katalog
const kat = JSON.parse(fs.readFileSync(path.join(NATIJA, 'katalog.json')))
const bayt = (x) => { const m = /^([\d.]+)(B|kB|MB|GB)$/.exec(x); if (!m) throw new Error('hajm: ' + x); return Math.round(Number(m[1]) * { B: 1, kB: 1e3, MB: 1e6, GB: 1e9 }[m[2]]) }
const imagelar = {}, teglar = {}
for (const [nom, v] of Object.entries(kat)) {
  const [repo, tag] = nom.split(':')
  teglar[nom] = v.digest
  if (imagelar[v.digest]) continue
  const i = v.inspect
  const meta = v.manifest.config.size + (v.index.manifests.find((m) => m.digest === v.manifestDigest)?.size ?? 0) +
    (v.attestation ? v.index.manifests.find((m) => m.annotations?.['vnd.docker.reference.digest'] === v.manifestDigest)?.size ?? 0 : 0) + i.Descriptor.size
  const att = (v.attestation?.layers ?? []).map((l) => ({ d: l.digest, s: l.size }))
  const qatlamSiq = v.manifest.layers.reduce((s, l) => s + l.size, 0)
  const attS = att.reduce((s, l) => s + l.s, 0)
  // `docker image ls` va `system df` dagi qiymatlar — yozuvdan (har image alohida o'lchangan)
  const ls = v.imageLs.split('\n')[1].trim().split(/\s{2,}/)
  imagelar[v.digest] = {
    id: v.digest, repo, manifest: v.manifestDigest, yaratilgan: i.Created, comment: i.Comment ?? '',
    config: i.Config, rootfs: i.RootFS.Layers, descriptorSize: i.Descriptor.size, unpacked: i.Size,
    manifestDescriptor: { mediaType: 'application/vnd.oci.image.manifest.v1+json', digest: v.manifestDigest, size: v.index.manifests.find((m) => m.digest === v.manifestDigest).size, annotations: v.index.manifests.find((m) => m.digest === v.manifestDigest).annotations, platform: { architecture: 'amd64', os: 'linux' } },
    history: v.history.map((h) => ({ CreatedAt: h.CreatedAt, CreatedBy: h.CreatedBy, Size: h.Size, Comment: h.Comment })),
    qatlamlar: v.manifest.layers.map((l) => ({ d: l.digest, s: l.size })),
    attestation: att,
    attestationManifest: v.attestation ? v.index.manifests.find((m) => m.annotations?.['vnd.docker.reference.digest'] === v.manifestDigest)?.digest : null,
    // diskdagi hajm: `docker system df -v` dagi UNIQUE SIZE (yozuv, 4 xona aniqlik) — o'zimiz hisoblamaymiz
    disk: bayt(JSON.parse(v.systemDfV).Images[0].UniqueSize), kontent: qatlamSiq + attS + meta,
    lsDisk: ls[2], lsKontent: ls[3],
    fs: v.fs,
  }
}
// docker pull qilinadigan, lekin trenajorda yo'q repolar xato matni uchun: "repository does not exist" o'rniga — "trenajorda yo'q"
// "virtual" hajm (docker ps -s): yozuv 14-format — har image'dan bitta konteyner
{
  const ps = yozuv('docker ps -a -s', { fayl: '14' }).split('\n').slice(1).filter(Boolean)
  for (const q of ps) {
    const m = /^\w{12}\s+(\S+)\s.*\s(\S+)\s+\(virtual (\S+)\)$/.exec(q)
    if (!m) continue
    const [, image, kont, virt] = m
    const nom = image.includes(':') ? image : image + ':latest'
    const id = teglar[nom]
    if (id && imagelar[id].virtual == null) imagelar[id].virtual = bayt(virt) - bayt(kont)
  }
  for (const v of Object.values(imagelar)) if (v.virtual == null) throw new Error('virtual hajm yo\'q: ' + v.repo)
}
const katalog = { sana: SANA, docker: '29.9.3', imagelar, teglar }
fs.mkdirSync(path.join(ILDIZ, 'src/docker/data'), { recursive: true })
fs.writeFileSync(path.join(ILDIZ, 'src/docker/data/katalog.json'), JSON.stringify(katalog))

// fayl tizimlari
const fsPapka = path.join(ILDIZ, 'public/docker-trenajor/fs')
fs.mkdirSync(fsPapka, { recursive: true })
// xom nusxa (natija/fs) git'da yo'q — `sh vps.sh katalog` dan keyin bor bo'ladi; bo'lmasa public'dagisi qoladi
for (const v of Object.values(imagelar)) {
  const manba = path.join(NATIJA, 'fs', v.fs)
  if (fs.existsSync(manba)) fs.copyFileSync(manba, path.join(fsPapka, v.fs))
  else if (!fs.existsSync(path.join(fsPapka, v.fs))) throw new Error('fayl tizimi yo\'q: ' + v.fs)
}

// --------------------------------------------------------------------------------------- matnlar
const MATN = {}
// help: `docker X --help` ning hammasi
MATN.help = {}
for (const b of yozuvlar) {
  const m = /^docker ((?:[a-z]+ )*?)--help$/.exec(b.cmd)
  if (m) MATN.help[m[1].trim()] = toza(b.out)
}
MATN.help[''] ??= toza(yozuv('docker'))
MATN.hello = yozuv('docker run hello-world').replace(/^\n?/, '\n')
// nginx loglari: 04-konteynerlar `docker logs veb` (ikkinchisi — to'xtatilgandan keyin)
const nginxLog = yozuv('docker logs veb', { fayl: '04' }).split('\n').filter(Boolean)
MATN.nginxEntrypoint = nginxLog.filter((q) => !/^\d{4}\/\d\d\/\d\d /.test(q))
MATN.nginxBoshlanish = nginxLog.filter((q) => /^\d{4}\/\d\d\/\d\d /.test(q)).map((q) => q.replace(/^\d{4}\/\d\d\/\d\d \d\d:\d\d:\d\d/, '{vaqt}').replace(/process \d+$/, 'process {w}'))
const toxtash = yozuv('docker logs veb', { fayl: '04', n: 1 }).split('\n').filter(Boolean)
MATN.nginxSigquit = toxtash.slice(nginxLog.length).map((q) => q.replace(/^\d{4}\/\d\d\/\d\d \d\d:\d\d:\d\d/, '{vaqt}').replace(/\b(\d+)#\1\b/g, (x, n) => (n === '1' ? x : '{w}#{w}')).replace(/from \d+$/, 'from {w}').replace(/process \d+ exited/, 'process {w} exited'))
// qayta ishga tushganda (11-qoshimcha: restart) va SIGTERM/SIGINT bilan to'xtaganda
const qayta = yozuv('docker logs veb', { fayl: '11' }).split('\n').filter(Boolean)
const ikkinchiBosh = qayta.findIndex((q, i) => i > 0 && q.startsWith('/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty'))
MATN.nginxEntrypointQayta = qayta.slice(ikkinchiBosh).filter((q) => !/^\d{4}\/\d\d\/\d\d /.test(q))
const term = yozuv('docker logs -n 8 veb', { fayl: '11' }).split('\n').filter(Boolean).slice(2)
if (!/signal 15 \(SIGTERM\) received, exiting/.test(term[0])) throw new Error('SIGTERM logi topilmadi')
MATN.nginxSigterm = term.map((q) => q.replace(/^\d{4}\/\d\d\/\d\d \d\d:\d\d:\d\d/, '{vaqt}').replace('signal 15 (SIGTERM)', 'signal {s} ({n})').replace(/\b(\d+)#\1\b/g, (x, n) => (n === '1' ? x : '{w}#{w}')).replace(/from \d+$/, 'from {w}').replace(/process \d+ exited/, 'process {w} exited'))
// 404 sahifa
// nginx xato sahifalari CRLF bilan (Content-Length 153 — yozuv 05)
MATN.nginxXato = { 404: yozuv('curl -s http://127.0.0.1:8080/yoq').replace(/\n/g, '\r\n') }
MATN.nginxXato[403] = MATN.nginxXato[404].replaceAll('404 Not Found', '403 Forbidden')
MATN.nginxXato[301] = MATN.nginxXato[404].replaceAll('404 Not Found', '301 Moved Permanently')
// kernel (uname -a): "Linux <host> 7.0.0-43-generic #43-Ubuntu SMP ... x86_64 Linux"
const uname = yozuv('docker exec quti uname -a').trim().split(' ')
MATN.kernel = uname[2]
MATN.kernelVersiya = uname.slice(3, -2).join(' ')
MATN.alpineIdRoot = yozuv('docker exec quti id').trim()
MATN.busyboxLsUsage = yozuv('docker run --rm alpine ls -z').split('\n').slice(1).join('\n')
MATN.free = yozuv('docker exec quti free -m')
const df = yozuv('docker exec quti df -h').split('\n')
const ustun = df[1].trim().split(/\s+/)
MATN.dfUsed = ustun[2]; MATN.dfAvail = ustun[3]; MATN.dfFoiz = ustun[4]
MATN.dfQolgan = df.slice(2).filter(Boolean)
MATN.version = yozuv('docker version', { fayl: '01' })
MATN.compose = 'Docker Compose version v5.7.0\n' // VPS host (host.txt)
MATN.buildx = 'github.com/docker/buildx v0.38.1 0dbe87f36ed472fe36b6796c3f70b4210a731fc5\n'
const host = toza(fs.readFileSync(path.join(NATIJA, 'host.txt'), 'utf8')).split('===\n')
MATN.version = host[0]
MATN.info = host[1].replace(/ ID: [^\n]+\n/, ' ID: {id}\n')
  .replace(/ Containers: \d+\n  Running: \d+\n  Paused: \d+\n  Stopped: \d+\n Images: \d+\n/, ' Containers: {k}\n  Running: {r}\n  Paused: {p}\n  Stopped: {s}\n Images: {i}\n')
MATN.compose = host[2]
MATN.buildx = host[3]
MATN.dockerV = host[4]
for (const [k, v] of Object.entries({ compose: /Docker Compose version v5\.7\.0/, buildx: /buildx v0\.38\.1/, dockerV: /Docker version 29\.9\.3/ })) if (!v.test(MATN[k])) throw new Error(`host.txt: ${k}`)
if (!MATN.info.includes('{id}') || !MATN.info.includes('{k}')) throw new Error('host.txt: docker info shabloni')
MATN.busyboxBanner = yozuv('docker run --rm alpine busybox')
MATN.nginxV = yozuv('docker exec veb nginx -V', { fayl: '11' })
MATN.dfGnu = yozuv('docker exec veb df -h /', { fayl: '11' }).split('\n')[1]
MATN.curlNginx = yozuv('docker exec veb curl --version', { fayl: '11' })

const chiqish = `// AVTOMATIK yaratilgan: node docker-trenajor/scripts/tayyorla.mjs (${SANA} dagi VPS yozuvlaridan). Qo'lda tahrirlamang.
export const MATN = ${JSON.stringify(MATN, null, 1)}
`
fs.writeFileSync(path.join(ILDIZ, 'src/docker/data/matnlar.js'), chiqish)
console.log('katalog:', Object.keys(imagelar).length, 'image;', 'help:', Object.keys(MATN.help).length, '; matnlar.js', (chiqish.length / 1024).toFixed(0), 'KB')
