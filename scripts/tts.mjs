#!/usr/bin/env node
/**
 * Boblarni Gemini TTS bilan ovozga aylantiradi. Batafsil: docs/tts.md
 *
 *   npm run tts -- --plan                 # nima qolgan, necha so'rov — hech narsa yubormaydi
 *   npm run tts                           # bepul limit tugaguncha ishlaydi, keyin to'xtaydi
 *   npm run tts -- --book git --limit 3   # faqat Git, ko'pi bilan 3 so'rov
 *   npm run tts -- --voice Kore           # boshqa ovoz (alohida papka va holat)
 *   npm run tts -- --books react,nextjs   # kitoblar va ularning tartibi
 *   npm run tts -- --redo react/25-actions.md --single   # bobni qayta (eski audio _eski ga), har bob alohida so'rov
 *
 * Kirish: `npm run sync` yaratgan `segments/` (index.json + har sahifa .json).
 * Chiqish: `audio/<ovoz>/<kitob>/<sahifa>.ogg` va `audio/<ovoz>/state.json`.
 *
 * Bepul tarifda tor joy — kuniga 10 so'rov, token emas. Shuning uchun har so'rov
 * iloji boricha to'ldiriladi: kichik sahifalar bitta so'rovga yig'iladi (audio keyin
 * sahifalar orasidagi pauzadan kesiladi), katta sahifa bo'laklarga bo'linadi.
 * Bitta so'rov qancha audio qaytara olishi hujjatda yo'q — skript buni o'zi o'rganadi
 * va `state.json` da eslab qoladi. Har so'rovdan keyin holat yoziladi: limit tugasa
 * yoki skript uzilsa, keyingi safar qolgan joyidan davom etadi.
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SEGMENTS = join(ROOT, 'segments')
const AUDIO = join(ROOT, 'audio')

const MODEL = process.env.GEMINI_TTS_MODEL ?? 'gemini-3.8-flash-tts'
// Gemini 3.8 TTS: matn so'zma-so'z o'qiladi, uslub alohida `speech_metadata` da (Interactions API)
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions'

/**
 * O'qish uslubi — transkriptga QO'SHILMAYDI (aks holda model uni ham ovoz chiqarib o'qiydi).
 * Rasmiy tavsiya: qisqa ibora; uzun "Director's notes" ovozni buzadi.
 */
const STYLE = 'calm, clear and natural narration of an educational audiobook, moderate pace'

/** Bepul tarif limitlari (AI Studio, 2026-10-09): 3 so'rov/daq, 10 000 kirish tokeni/daq, 10 so'rov/kun */
const LIMITS = { rpm: 3, tpm: 10_000, rpd: 10 }
/** O'lchangan: o'zbekcha matnda ~2,4 kirish tokeni/so'z (zaxira bilan 2,6) */
const TOKENS_PER_WORD = 2.6
/** O'lchangan o'qish tezligi (pauzalar bilan) — audio kesilganini bilish uchun */
const WORDS_PER_MINUTE = 83
/** Token limitidan kelib chiqadigan eng katta so'rov (so'z) */
const MAX_WORDS_BY_TOKENS = Math.floor((LIMITS.tpm * 0.92) / TOKENS_PER_WORD)

/** Sahifalar orasida qo'shimcha matn yo'q — audio so'z ulushi + eng yaqin jimlik bo'yicha kesiladi */
const PAGE_BREAK = '\n\n'

/** Qo'llanma manbasining hash'i (`src/content` — `npm run sync` nusxasi) */
function sourceHash(file) {
  const path = join(ROOT, 'src', 'content', file)

  return existsSync(path) ? createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 16) : null
}

function parseArgs(argv) {
  const args = { voice: 'Charon', books: null, limit: LIMITS.rpd, plan: false, maxWords: null, redo: [], single: false }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const next = () => argv[++index]

    if (arg === '--plan') args.plan = true
    else if (arg === '--voice') args.voice = next()
    else if (arg === '--book' || arg === '--books') args.books = next().split(',').map((id) => id.trim()).filter(Boolean)
    else if (arg === '--limit') args.limit = Number(next())
    else if (arg === '--max-words') args.maxWords = Number(next())
    else if (arg === '--redo') args.redo = next().split(',').map((file) => file.trim()).filter(Boolean)
    else if (arg === '--single') args.single = true
    else throw new Error(`Noma'lum argument: ${arg}`)
  }

  return args
}

/** `.env` dan GEMINI_API_KEY (dotenv kutubxonasiz) */
function apiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY

  const file = join(ROOT, '.env')
  const line = existsSync(file) && readFileSync(file, 'utf8').split('\n').find((row) => row.startsWith('GEMINI_API_KEY='))

  if (!line) throw new Error('GEMINI_API_KEY topilmadi — .env ga yozing (docs/tts.md)')

  return line.slice('GEMINI_API_KEY='.length).trim()
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const wordsIn = (text) => text.replace(/<[a-z ]+>/g, ' ').split(/\s+/).filter(Boolean).length

/**
 * Segmentlar → transkript: FAQAT qo'llanma matni. Hech qanday teg qo'shilmaydi —
 * model `<long pause>` kabi teglarni ham so'z sifatida o'qib berdi (2026-10-09).
 * Pauza paragraflar orasidagi bo'sh qatordan tabiiy chiqadi.
 */
function narration(segments) {
  return segments
    .filter((segment) => segment.type !== 'pause' && segment.text)
    .map((segment) => pronounce(segment.text))
    .join('\n\n')
    .trim()
}

/**
 * Talaffuz lug'ati (`scripts/talaffuz.json`): `Vite` → `Vit` kabi. Faqat modelga ketadigan matnda;
 * align.py ham shu lug'at bilan hisoblaydi, shuning uchun highlight asl so'zga tushadi.
 */
const PRONUNCIATION = Object.entries(JSON.parse(readFileSync(join(ROOT, 'scripts', 'talaffuz.json'), 'utf8')))
  .filter(([word]) => !word.startsWith('_'))
  .map(([word, spoken]) => [new RegExp(`(?<![\\p{L}\\p{N}])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'gu'), spoken])

const pronounce = (text) => PRONUNCIATION.reduce((result, [pattern, spoken]) => result.replace(pattern, spoken), text)

/** Nutq davomiyligi so'zdan ko'ra harflar soniga yaqinroq — kesish va highlight shu bilan hisoblanadi */
const lettersIn = (text) => (String(text).match(/[\p{L}\p{N}]/gu) ?? []).length

/** Sahifa segmentlarini chegaragacha bo'laklarga bo'ladi; segment hech qachon bo'linmaydi */
function splitPage(segments, maxWords) {
  const chunks = []
  let current = []
  let words = 0

  for (const segment of segments) {
    const size = wordsIn(segment.text)

    if (current.length && words + size > maxWords) {
      chunks.push(current)
      current = []
      words = 0
    }

    current.push(segment)
    words += size
  }

  if (current.some((segment) => segment.text)) chunks.push(current)

  return chunks
}

/**
 * Navbat: har element — bitta so'rov.
 *   { kind: 'pages', pages: [...] }            — butun sahifalar (bir kitobdan), bitta audio → har sahifaga kesiladi
 *   { kind: 'part', page, index, segments }    — katta sahifaning bo'lagi
 */
function buildQueue(plan, maxWords, single = false) {
  const queue = []
  let batch = null

  const flush = () => {
    if (batch?.pages.length) queue.push(batch)
    batch = null
  }

  for (const item of plan) {
    const parts = splitPage(item.segments, maxWords)
    const book = item.page.file.split('/')[0]

    if (parts.length > 1 || item.doneChunks.length) {
      flush()
      parts.slice(item.doneChunks.length).forEach((segments, offset) =>
        queue.push({ kind: 'part', page: item.page, index: item.doneChunks.length + offset, total: parts.length, segments, item }),
      )
      continue
    }

    const text = narration(item.segments)
    const words = wordsIn(text)

    if (batch && (single || batch.book !== book || batch.words + words > maxWords)) flush()
    batch ??= { kind: 'pages', book, pages: [], words: 0 }
    batch.pages.push({ ...item, words, letters: lettersIn(text) })
    batch.words += words
  }

  flush()

  return queue
}

class QuotaError extends Error {}

/** Daqiqalik limitlar (RPM, TPM) — oxirgi 60 soniyadagi so'rovlar bo'yicha kutadi */
const recent = []

async function respectMinuteLimits(tokens) {
  for (;;) {
    const now = Date.now()

    while (recent.length && now - recent[0].at > 61_000) recent.shift()

    const used = recent.reduce((sum, request) => sum + request.tokens, 0)

    if (recent.length < LIMITS.rpm && used + tokens <= LIMITS.tpm) break

    await sleep(61_000 - (now - recent[0].at) + 500)
  }

  recent.push({ at: Date.now(), tokens })
}

async function synthesize(key, voice, text) {
  const body = {
    model: MODEL,
    input: [{
      type: 'user_input',
      content: [{ type: 'text', text, annotations: [{ type: 'speech_metadata', style: STYLE }] }],
    }],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice }] },
  }

  for (let attempt = 1; ; attempt += 1) {
    await respectMinuteLimits(Math.ceil(wordsIn(text) * TOKENS_PER_WORD) + 40)

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    })

    if (response.status === 429) {
      const detail = await response.text()

      // "limit: 10 requests per day ... retry in 20h34m" — bugun boshqa urinish foydasiz
      if (/per day/i.test(detail) || attempt >= 4) throw new QuotaError(detail.slice(0, 300))

      await sleep(30_000 * attempt)
      continue
    }

    if (!response.ok) {
      if (response.status >= 500 && attempt < 3) {
        await sleep(15_000 * attempt)
        continue
      }

      throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`)
    }

    const data = await response.json()
    const audio = (data.steps ?? [])
      .filter((step) => step.type === 'model_output')
      .flatMap((step) => step.content ?? [])
      .filter((item) => item.type === 'audio')
      .at(-1)

    return {
      audio: audio ? Buffer.from(audio.data, 'base64') : null,
      status: String(data.status ?? ''),
      tokens: data.usage?.total_output_tokens ?? 0,
      inputTokens: data.usage?.total_input_tokens ?? 0,
    }
  }
}

const ffmpeg = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args])

function durationOf(file) {
  return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim())
}

/** Jimlik oraliqlari `[{ start, end, length }]` — `silencedetect` natijasi stderr'da */
function detectSilences(file) {
  const output = execFileSync('sh', ['-c', 'ffmpeg -hide_banner -i "$1" -af silencedetect=noise=-38dB:d=0.6 -f null - 2>&1', 'sh', file], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  const found = []
  let start = null

  for (const line of output.split('\n')) {
    const begin = /silence_start: ([\d.]+)/.exec(line)
    const end = /silence_end: ([\d.]+)/.exec(line)

    if (begin) start = Number(begin[1])
    if (end && start !== null) {
      found.push({ start, end: Number(end[1]), length: Number(end[1]) - start })
      start = null
    }
  }

  return found
}

/**
 * Bir nechta sahifali audio'ni sahifalarga kesadi. Har chegara — so'z ulushi bo'yicha
 * kutilgan vaqtga yaqin (oyna ichidagi) eng uzun jimlikning o'rtasi.
 */
function pageCuts(file, pages) {
  const total = durationOf(file)
  const quiet = detectSilences(file)
  const letters = pages.reduce((sum, page) => sum + page.letters, 0)
  const cuts = [0]
  let seen = 0

  for (const page of pages.slice(0, -1)) {
    seen += page.letters

    // Kutilgan joy atrofida (±6 s) eng uzun jimlik: bob oxiridagi to'xtash odatda eng uzuni
    const expected = (seen / letters) * total
    const candidates = quiet.filter((gap) => Math.abs((gap.start + gap.end) / 2 - expected) <= 6 && (gap.start + gap.end) / 2 > cuts.at(-1))
    const best = candidates.sort((a, b) => b.length - a.length)[0]

    cuts.push(best ? (best.start + best.end) / 2 : expected)
  }

  cuts.push(total)

  return { total, cuts, quiet }
}

/**
 * Highlight uchun: har o'qiladigan segmentning taxminiy boshlanishi (soniya, sahifa audio'si boshidan).
 * So'z ulushi bo'yicha kutilgan vaqt, keyin ±4 s ichidagi eng yaqin jimlik oxiriga tortiladi.
 * Aniq emas, lekin bo'lim/paragraf darajasidagi belgilash uchun yetarli.
 */
function segmentTimings(segments, quiet, from, to) {
  const spoken = segments.filter((segment) => segment.type !== 'pause' && segment.text)
  const letters = spoken.reduce((sum, segment) => sum + lettersIn(segment.text), 0) || 1
  const inside = quiet.filter((gap) => gap.end > from && gap.end < to)
  const timings = []
  let seen = 0

  for (const segment of spoken) {
    const expected = from + (seen / letters) * (to - from)
    const previous = timings.length ? from + timings.at(-1).at : from
    const snap = inside
      .filter((gap) => Math.abs(gap.end - expected) <= 4 && gap.end > previous)
      .sort((a, b) => Math.abs(a.end - expected) - Math.abs(b.end - expected))[0]
    const at = seen === 0 ? from : snap ? snap.end : expected

    timings.push({ line: segment.line, type: segment.type, at: Math.round((at - from) * 100) / 100 })
    seen += lettersIn(segment.text)
  }

  return timings
}

function toOpus(input, output, from = null, to = null) {
  const range = from === null ? [] : ['-ss', String(from), '-to', String(to)]

  ffmpeg(['-i', input, ...range, '-c:a', 'libopus', '-b:a', '24k', '-ac', '1', output])

  return durationOf(output)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!existsSync(join(SEGMENTS, 'index.json'))) throw new Error("segments/ yo'q — avval `npm run sync`")

  const index = JSON.parse(await readFile(join(SEGMENTS, 'index.json'), 'utf8'))
  const voiceDir = join(AUDIO, args.voice)
  const statePath = join(voiceDir, 'state.json')
  const state = existsSync(statePath)
    ? JSON.parse(await readFile(statePath, 'utf8'))
    : { model: MODEL, voice: args.voice, maxWords: null, requests: [], pages: {} }
  const saveState = () => writeFile(statePath, JSON.stringify(state, null, 2))

  // So'rov hajmi: token limitidan; javob kesilgan bo'lsa — o'rganilgan chegara
  const maxWords = args.maxWords ?? Math.min(MAX_WORDS_BY_TOKENS, state.maxWords ?? MAX_WORDS_BY_TOKENS)

  const plan = []

  // `--redo`: tanlangan boblar qaytadan. Eski audio o'chirilmaydi — `audio/_eski/<ovoz>-almashtirilgan/` ga
  if (args.redo.length && !args.plan) {
    for (const file of args.redo) {
      if (!index.some((page) => page.file === file)) throw new Error(`Bunday bob yo'q: ${file}`)

      const base = file.replace(/\.md$/, '')
      const backup = join(AUDIO, '_eski', `${args.voice}-almashtirilgan`, dirname(base))

      await mkdir(backup, { recursive: true })

      for (const suffix of ['.ogg', '.words.json', '.timings.json', '.segments.json']) {
        const source = join(voiceDir, `${base}${suffix}`)

        if (existsSync(source)) await rename(source, join(backup, `${base.split('/').pop()}${suffix}`))
      }

      delete state.pages[file]
    }

    await saveState()
  }

  // `--books` berilgan bo'lsa — faqat shu kitoblar va aynan shu tartibda
  const bookOf = (page) => page.file.split('/')[0]
  const ordered = args.books
    ? args.books.flatMap((id) => index.filter((page) => bookOf(page) === id))
    : index

  if (args.books) {
    const unknown = args.books.filter((id) => !index.some((page) => bookOf(page) === id))

    if (unknown.length) throw new Error(`Bunday kitob yo'q: ${unknown.join(', ')}`)
  }

  for (const page of args.redo.length ? index.filter((candidate) => args.redo.includes(candidate.file)) : ordered) {

    const previous = state.pages[page.file]

    // Faqat qo'llanma matni o'zgarganda qayta ovozlanadi. Segment formati (scripts/segments.mjs) o'zgarishi
    // tayyor audio'ni yaroqsiz qilmaydi: audio yonida o'z matn nusxasi (`.segments.json`) bor
    if (previous?.done && !args.redo.includes(page.file) && (previous.hash === page.hash || previous.source === sourceHash(page.file))) continue

    const segments = JSON.parse(await readFile(join(SEGMENTS, page.file.replace(/\.md$/, '.json')), 'utf8'))
    // Hash yoki bo'lak chegarasi o'zgargan bo'lsa, oldingi bo'laklar yaroqsiz (bo'linish boshqacha)
    const valid = previous?.hash === page.hash && previous.maxWords === maxWords
    const doneChunks = valid ? previous.chunks ?? [] : []

    if (!valid && previous?.chunks?.length) await Promise.all(previous.chunks.map((chunk) => rm(chunk.path, { force: true })))

    plan.push({ page, segments, doneChunks })
  }

  const queue = buildQueue(plan, maxWords, args.single)
  const done = Object.values(state.pages).filter((page) => page.done).length

  console.log(`Ovoz: ${args.voice} · model: ${MODEL} · so'rov hajmi ≤ ${maxWords} so'z`)
  console.log(`Tayyor: ${done} sahifa · qolgan: ${plan.length} sahifa → ${queue.length} so'rov (~${Math.ceil(queue.length / LIMITS.rpd)} kun, kuniga ${LIMITS.rpd})`)

  if (args.plan) return

  await mkdir(voiceDir, { recursive: true })

  const key = apiKey()
  let sent = 0
  let currentMaxWords = maxWords

  try {
    while (queue.length && sent < args.limit) {
      const job = queue.shift()
      const text = job.kind === 'pages'
        ? job.pages.map((page) => narration(page.segments)).join(PAGE_BREAK)
        : narration(job.segments)
      const words = wordsIn(text)
      const label = job.kind === 'pages'
        ? `${job.pages.length} sahifa (${job.pages[0].page.file} …)`
        : `${job.page.file} · bo'lak ${job.index + 1}/${job.total}`

      sent += 1
      const result = await synthesize(key, args.voice, text)
      const tmp = join(voiceDir, `.javob-${process.pid}.wav`)

      if (result.audio) await writeFile(tmp, result.audio)

      const duration = result.audio ? durationOf(tmp) : 0
      const expected = (words / WORDS_PER_MINUTE) * 60

      state.requests.push({ at: new Date().toISOString(), words, inputTokens: result.inputTokens, outputTokens: result.tokens, seconds: Math.round(duration), status: result.status })

      // Kesilgan javob: audio yo'q, holat to'liq emas yoki kutilganidan ancha qisqa.
      // Chegarani eslab qolamiz va ishni kichikroq bo'lib qayta navbatga qo'yamiz.
      if (!result.audio || !/completed/i.test(result.status) || duration < expected * 0.6) {
        state.maxWords = Math.max(200, Math.floor(Math.min(words, (duration / 60) * WORDS_PER_MINUTE) * 0.85))
        await rm(tmp, { force: true })
        await saveState()
        console.log(`  ↺ ${label}: javob kesildi (${words} so'z → ${Math.round(duration)} s). Chegara: ${state.maxWords} so'z — qayta rejalashtiriladi.`)

        // Chegara o'zgardi — yarim tayyor katta sahifalar yangi bo'linish bilan boshidan
        const remainingPlan = []

        for (const item of plan.filter((candidate) => !state.pages[candidate.page.file]?.done)) {
          const partial = state.pages[item.page.file]

          if (partial?.chunks?.length) {
            await Promise.all(partial.chunks.map((chunk) => rm(chunk.path, { force: true })))
            delete state.pages[item.page.file]
          }

          remainingPlan.push({ ...item, doneChunks: [] })
        }

        currentMaxWords = state.maxWords
        queue.splice(0, queue.length, ...buildQueue(remainingPlan, currentMaxWords, args.single))
        continue
      }

      if (job.kind === 'pages') {
        const { cuts, quiet } = job.pages.length > 1 ? pageCuts(tmp, job.pages) : { cuts: [0, duration], quiet: detectSilences(tmp) }

        for (const [position, page] of job.pages.entries()) {
          const base = join(voiceDir, page.page.file.replace(/\.md$/, ''))

          await mkdir(dirname(base), { recursive: true })

          const seconds = job.pages.length > 1
            ? toOpus(tmp, `${base}.ogg`, cuts[position], cuts[position + 1])
            : toOpus(tmp, `${base}.ogg`)

          await writeFile(`${base}.timings.json`, JSON.stringify(segmentTimings(page.segments, quiet, cuts[position], cuts[position + 1])))
          // So'z vaqtlari eski audio'niki — `npm run tts:align` yangisini hisoblaydi
          await rm(`${base}.words.json`, { force: true })
          await writeFile(`${base}.segments.json`, JSON.stringify(page.segments))
          state.pages[page.page.file] = { hash: page.page.hash, source: sourceHash(page.page.file), title: page.page.title, done: true, seconds: Math.round(seconds), file: `${page.page.file.replace(/\.md$/, '')}.ogg` }
        }

        await rm(tmp, { force: true })
        await saveState()
        console.log(`  ✓ ${label} · ${words} so'z · ${Math.round(duration / 60)} daq`)
        continue
      }

      // Katta sahifaning bo'lagi: bo'laklar tayyor bo'lgach bitta faylga yig'iladi
      const base = join(voiceDir, job.page.file.replace(/\.md$/, ''))
      const partPath = `${base}.part-${String(job.index + 1).padStart(2, '0')}.wav`
      const previous = state.pages[job.page.file]
      const entry = previous?.hash === job.page.hash && previous.maxWords === currentMaxWords
        ? previous
        : { hash: job.page.hash, title: job.page.title, maxWords: currentMaxWords, chunks: [] }

      await mkdir(dirname(base), { recursive: true })
      await rm(partPath, { force: true })
      await writeFile(partPath, result.audio)
      await rm(tmp, { force: true })
      entry.chunks = [...(entry.chunks ?? []).filter((chunk) => chunk.path !== partPath), { path: partPath, words }]
      entry.done = false
      state.pages[job.page.file] = entry

      if (entry.chunks.length === job.total) {
        const list = `${base}.list`

        await writeFile(list, entry.chunks.map((chunk) => `file '${chunk.path.replace(/'/g, "'\\''")}'`).join('\n'))
        ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-c:a', 'libopus', '-b:a', '24k', '-ac', '1', `${base}.ogg`])
        await Promise.all([list, ...entry.chunks.map((chunk) => chunk.path)].map((file) => rm(file, { force: true })))

        const total = durationOf(`${base}.ogg`)
        const segments = plan.find((item) => item.page.file === job.page.file)?.segments ?? job.segments

        await writeFile(`${base}.timings.json`, JSON.stringify(segmentTimings(segments, detectSilences(`${base}.ogg`), 0, total)))
        await rm(`${base}.words.json`, { force: true })
        await writeFile(`${base}.segments.json`, JSON.stringify(segments))
        state.pages[job.page.file] = { hash: job.page.hash, source: sourceHash(job.page.file), title: job.page.title, done: true, seconds: Math.round(durationOf(`${base}.ogg`)), file: `${job.page.file.replace(/\.md$/, '')}.ogg` }
      }

      await saveState()
      console.log(`  ✓ ${label} · ${words} so'z · ${Math.round(duration / 60)} daq`)
    }
  } catch (error) {
    await saveState()

    if (error instanceof QuotaError) {
      console.log(`\nKunlik limit tugadi (${sent} so'rov). Limit tiklangach shu buyruqni qayta ishga tushiring — qolgan joyidan davom etadi.`)
      return
    }

    throw error
  }

  await saveState()
  console.log(`\n${sent} so'rov yuborildi. Qolgan: ${queue.length}. Davom ettirish: npm run tts -- --voice ${args.voice}`)
}

main().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
