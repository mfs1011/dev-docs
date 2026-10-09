#!/usr/bin/env node
/**
 * Tayyor audio'ni saytga chiqarish: `audio/<ovoz>/<kitob>/` → `public/tinglash/<ovoz>/<kitob>/`.
 * Faqat pleyerga kerak fayllar: `.ogg`, `.words.json`, `.timings.json`. Batafsil: docs/tts.md
 *
 *   npm run tts:publish -- --books react
 *   npm run tts:publish -- --books react,nextjs --voice Charon
 */
import { copyFile, mkdir, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const KEEP = ['.ogg', '.words.json', '.timings.json']

const args = { voice: 'Charon', books: [] }
const argv = process.argv.slice(2)

for (let index = 0; index < argv.length; index += 1) {
  if (argv[index] === '--voice') args.voice = argv[++index]
  else if (argv[index] === '--books') args.books = argv[++index].split(',').map((id) => id.trim()).filter(Boolean)
  else throw new Error(`Noma'lum argument: ${argv[index]}`)
}

if (!args.books.length) throw new Error('Qaysi kitob? --books react')

for (const book of args.books) {
  const source = join(ROOT, 'audio', args.voice, book)
  const target = join(ROOT, 'public', 'tinglash', args.voice, book)

  if (!existsSync(source)) throw new Error(`Audio yo'q: ${source}`)

  const files = (await readdir(source)).filter((name) => !name.startsWith('.'))
  const pages = files.filter((name) => name.endsWith('.ogg'))
  // So'z vaqtlari hisoblanmagan bob chiqarilmaydi — highlight'siz yarim holat saytga tushmasin
  const ready = pages.filter((name) => files.includes(name.replace(/\.ogg$/, '.words.json')))
  const missing = pages.filter((name) => !ready.includes(name))

  await rm(target, { recursive: true, force: true })
  await mkdir(target, { recursive: true })

  for (const page of ready) {
    for (const suffix of KEEP) {
      const name = page.replace(/\.ogg$/, suffix)

      if (files.includes(name)) await copyFile(join(source, name), join(target, name))
    }
  }

  console.log(`✔ ${book}: ${ready.length} bob chiqarildi${missing.length ? ` · so'z vaqtlari yo'q (chiqarilmadi): ${missing.join(', ')}` : ''}`)
}
