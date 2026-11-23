// Har mashq oxirigacha bajariladi: har qadam uchun yechim buyruqlari simulyatorda ishga tushiriladi va qadam tekshiruvi
// o'tishi kerak. Matndagi buyruqlar bilan yechimlar bir xil bo'lishi kerak (o'quvchi aynan shuni yozadi).
//   node docker-trenajor/test/mashqlar.mjs [mashq-id]
import fs from 'node:fs'
import path from 'node:path'
import { register } from 'node:module'

register('data:text/javascript,' + encodeURIComponent(`export async function load(url, ctx, next) { if (url.endsWith('.json')) return { format: 'json', source: (await import('node:fs')).readFileSync(new URL(url)), shortCircuit: true }; return next(url, ctx) }`))
const ILDIZ = path.resolve(import.meta.dirname, '../..')
const { muhitYarat } = await import(path.join(ILDIZ, 'src/docker/muhit.js'))
const { bufer, kirishMatn } = await import(path.join(ILDIZ, 'src/docker/qobiq/ijro.js'))
const { DOCKER_MASHQLAR } = await import(path.join(ILDIZ, 'src/docker/mashqlar.js'))

const YECHIM = {
  'hello-world': [['docker run hello-world'], ['docker ps -a'], ['docker images']],
  'teg-digest': [['docker pull debian'], ['docker pull debian:trixie'], ['docker image ls debian'], ['docker image rm debian:latest']],
  qatlamlar: [['docker image history nginx:1.29'], ['docker image inspect nginx:1.29 --format "{{len .RootFS.Layers}}"']],
  'hayot-sikli': [['docker run -d --name uxla alpine sleep 1000'], ['docker exec uxla ps'], ['time docker stop uxla'], ['docker start uxla', 'docker rm uxla'], ['docker rm -f uxla']],
  'muhit-ozgaruvchi': [['docker run --rm -e SALOM=dunyo alpine env'], ["printf '%s\\n' DB_HOST=baza DB_PORT=5432 > ilova.env"], ["docker run --rm --env-file ilova.env alpine sh -c 'echo $DB_HOST:$DB_PORT'"]],
  'port-nginx': [['docker run -d --name veb -p 8080:80 nginx:1.29'], ['curl localhost:8080'], ['docker logs veb'], ['docker rm -f veb', 'docker run -d --name veb -p 127.0.0.1:8080:80 nginx:1.29']],
  'tarmoq-nom': [['docker run -d --name veb nginx:1.29'], ['docker run --rm alpine wget -qO- -T 3 http://veb/'], ['docker network create ilova-tarmoq', 'docker network connect ilova-tarmoq veb'], ['docker run --rm --network ilova-tarmoq alpine wget -qO- http://veb/']],
  volume: [["docker run --name v1 alpine sh -c 'echo salom > /fayl.txt'", 'docker rm v1', 'docker run --rm alpine cat /fayl.txt'], ['docker volume create malumot'], ["docker run --rm -v malumot:/data alpine sh -c 'echo \"1-konteyner yozdi\" > /data/eslatma.txt'"], ['docker run --rm -v malumot:/data alpine cat /data/eslatma.txt']],
  'bind-mount': [["mkdir -p sayt && echo '<h1>Salom</h1>' > sayt/index.html"], ['docker run -d --name veb -p 127.0.0.1:8080:80 --mount type=bind,src=/root/sayt,dst=/usr/share/nginx/html,ro nginx:1.29'], ['curl -s 127.0.0.1:8080', "echo '<h1>Yangilandi</h1>' > sayt/index.html", 'curl -s 127.0.0.1:8080'], ["docker exec veb sh -c 'echo x > /usr/share/nginx/html/a.txt'"]],
  tozalash: [['docker run alpine echo salom', 'docker run alpine echo salom'], ['docker system df'], ['docker container prune -f'], ['docker image prune -a -f']],
}

const tanlov = process.argv[2]
let xato = 0
for (const m of DOCKER_MASHQLAR) {
  if (tanlov && m.id !== tanlov) continue
  const y = YECHIM[m.id]
  if (!y || y.length !== m.steps.length) { console.log(`✗ ${m.id}: yechim qadamlar soniga mos emas`); xato++; continue }
  const muhit = muhitYarat({ fsYukla: async (n) => JSON.parse(fs.readFileSync(path.join(ILDIZ, 'public/docker-trenajor/fs', n))) })
  if (m.tayyor) muhit.tayyorla(m.tayyor)
  const tarix = []
  let ok = true
  for (const [i, st] of m.steps.entries()) {
    // har qadam matnida yechim buyrug'i bormi (o'quvchi ko'rsatmani bajaradi)
    for (const cmd of y[i]) {
      const o = bufer(true)
      const kod = await muhit.qobiq.bajar(cmd, { stdout: o, stderr: o, stdin: kirishMatn(''), tty: true })
      muhit.qobiq.oxirgiKod = kod
      tarix.push({ cmd, kod })
    }
    await new Promise((r) => setTimeout(r, 100))
    const h = { d: muhit.daemon, fs: muhit.fs, tarix }
    if (!st.tekshir(h)) { console.log(`✗ ${m.id} — ${i + 1}-qadam o'tmadi: ${y[i].join(' ; ')}\n    oxirgi kodlar: ${tarix.slice(-y[i].length).map((x) => x.kod).join(', ')}`); ok = false; xato++; break }
  }
  muhit.daemon.konteynerlar.forEach((k) => k.jarayon?.oldir(137))
  if (ok) console.log(`✓ ${m.id} (${m.steps.length} qadam)`)
}
console.log(xato ? `\n${xato} ta xato` : '\nHamma mashqlar o‘tdi')
process.exit(xato ? 1 : 0)
