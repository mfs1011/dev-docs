// Node testlari uchun: laboratoriya fayllari (sahifa ularni src/web/labFayllar.js orqali ?raw bilan oladi).
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const D = path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'lab')
export const LAB_FAYLLAR = Object.fromEntries(
  ['nginx.conf', 'sozla.sh', 'yuritma.sh', 'index.html', 'logo.svg', 'uslub.css'].map((f) => [f, fs.readFileSync(path.join(D, f), 'utf8')]),
)
export const SOZLA = ' sh /root/.lab-sozla.sh; clear'
