/**
 * Bobdagi `<figure class="video">` ni sayt pleyeriga aylantiradi.
 *
 * Markdown'da oddiy `<video controls>` qoladi — JS bo'lmasa (GitHub, RSS) brauzer pleyeri ishlaydi.
 * Bo'limlar `<track kind="chapters">` (WebVTT) dan o'qiladi: progress chizig'ida chegaralar va
 * video ostida bosiladigan ro'yxat. Hamma hodisa pleyer elementlarining o'ziga ulangan —
 * sahifa almashganda DOM bilan birga yo'qoladi.
 */

const ICONS = {
  play: '<path d="M8 5.6v12.8a1 1 0 0 0 1.52.85l10.4-6.4a1 1 0 0 0 0-1.7L9.52 4.75A1 1 0 0 0 8 5.6Z"/>',
  pause: '<rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/>',
  replay: '<path d="M12 5V2.5a.5.5 0 0 0-.8-.4L6.9 5.6a.5.5 0 0 0 0 .8l4.3 3.5a.5.5 0 0 0 .8-.4V7a6 6 0 1 1-6 6.2 1 1 0 0 0-2 0A8 8 0 1 0 12 5Z"/>',
  back: '<path d="M12 5V2.5a.5.5 0 0 0-.8-.4L6.9 5.6a.5.5 0 0 0 0 .8l4.3 3.5a.5.5 0 0 0 .8-.4V7a6 6 0 1 1-6 6.2 1 1 0 0 0-2 0A8 8 0 1 0 12 5Z"/><text x="12.2" y="16.4" text-anchor="middle" font-size="6.6" font-weight="700" font-family="system-ui, sans-serif">10</text>',
  fwd: '<path d="M12 5V2.5a.5.5 0 0 1 .8-.4l4.3 3.5a.5.5 0 0 1 0 .8l-4.3 3.5a.5.5 0 0 1-.8-.4V7a6 6 0 1 0 6 6.2 1 1 0 0 1 2 0A8 8 0 1 1 12 5Z"/><text x="11.8" y="16.4" text-anchor="middle" font-size="6.6" font-weight="700" font-family="system-ui, sans-serif">10</text>',
  volume: '<path d="M4 9.5v5h3.4L12 18.6V5.4L7.4 9.5Z"/><path d="M15.4 8.8a4.5 4.5 0 0 1 0 6.4M17.9 6.3a8 8 0 0 1 0 11.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  muted: '<path d="M4 9.5v5h3.4L12 18.6V5.4L7.4 9.5Z"/><path d="m15.5 9.5 5 5m0-5-5 5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  full: '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9m6 0h3.5A1.5 1.5 0 0 1 20 5.5V9m0 6v3.5a1.5 1.5 0 0 1-1.5 1.5H15m-6 0H5.5A1.5 1.5 0 0 1 4 18.5V15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  cc: '<rect x="2.5" y="5" width="19" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="15.4" text-anchor="middle" font-size="7.4" font-weight="800" font-family="system-ui, sans-serif">CC</text>',
  exit: '<path d="M9 4v3.5A1.5 1.5 0 0 1 7.5 9H4m11-5v3.5A1.5 1.5 0 0 0 16.5 9H20m0 6h-3.5a1.5 1.5 0 0 0-1.5 1.5V20M4 15h3.5A1.5 1.5 0 0 1 9 16.5V20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
}
const icon = (name) => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${ICONS[name]}</svg>`
const SPEEDS = [1, 1.25, 1.5, 2, 0.75]
// Subtitr tanlovi brauzerda eslab qolinadi (sahifa va videolar o'rtasida umumiy)
const CC_KEY = 'video-subtitrlar'
const readCc = () => { try { return localStorage.getItem(CC_KEY) === '1' } catch { return false } }
const writeCc = (on) => { try { localStorage.setItem(CC_KEY, on ? '1' : '0') } catch { /* xususiy rejim */ } }
const IDLE_MS = 2500

const format = (seconds) => {
  const total = Math.max(0, Math.floor(seconds || 0))

  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export function enhanceVideos(container) {
  for (const video of container.querySelectorAll('video')) {
    if (!video.closest('figure.video')) {
      const figure = document.createElement('figure')
      figure.className = 'video'
      video.parentNode.insertBefore(figure, video)
      figure.appendChild(video)
    }
  }

  for (const figure of container.querySelectorAll('figure.video')) {
    const video = figure.querySelector('video')
    if (!video || figure.classList.contains('vp')) continue

    setup(figure, video)
  }
}

function setup(figure, video) {
  figure.classList.add('vp')
  video.controls = false
  video.removeAttribute('controls')

  const stage = document.createElement('div')
  stage.className = 'vp-stage is-fresh'
  stage.tabIndex = 0
  stage.setAttribute('role', 'region')
  stage.setAttribute('aria-label', 'Video pleyer. Probel — ijro/pauza, strelkalar — oldinga/orqaga, F — to‘liq ekran, C — subtitrlar')
  // Panel videoning ostida: kadrdagi subtitrlarni hech qachon yopmaydi
  const screen = document.createElement('div')
  screen.className = 'vp-screen'
  figure.insertBefore(stage, video)
  stage.appendChild(screen)
  screen.appendChild(video)
  screen.insertAdjacentHTML('beforeend', `<button type="button" class="vp-big" aria-label="Ijro etish">${icon('play')}</button>`)
  stage.insertAdjacentHTML('beforeend', `
    <div class="vp-bar">
      <div class="vp-progress" role="slider" aria-label="Video vaqti" aria-valuemin="0">
        <div class="vp-track"><div class="vp-buffered"></div><div class="vp-played"></div><div class="vp-marks"></div></div>
        <div class="vp-thumb"></div>
        <div class="vp-tip"><b class="vp-tip-chapter"></b><span class="vp-tip-time"></span></div>
      </div>
      <div class="vp-row">
        <button type="button" class="vp-btn vp-play" aria-label="Ijro etish">${icon('play')}</button>
        <button type="button" class="vp-btn vp-back" aria-label="10 soniya orqaga">${icon('back')}</button>
        <button type="button" class="vp-btn vp-fwd" aria-label="10 soniya oldinga">${icon('fwd')}</button>
        <div class="vp-vol">
          <button type="button" class="vp-btn vp-mute" aria-label="Ovozni o‘chirish">${icon('volume')}</button>
          <input class="vp-volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="Ovoz balandligi">
        </div>
        <span class="vp-time"><span class="vp-cur">0:00</span><span class="vp-sep">/</span><span class="vp-dur">0:00</span></span>
        <span class="vp-chapter"></span>
        <button type="button" class="vp-btn vp-cc" aria-label="Subtitrlar" aria-pressed="false" hidden>${icon('cc')}</button>
        <button type="button" class="vp-btn vp-speed" aria-label="Ijro tezligi">1×</button>
        <button type="button" class="vp-btn vp-full" aria-label="To‘liq ekran">${icon('full')}</button>
      </div>
    </div>`)

  const $ = (selector) => stage.querySelector(selector)
  const big = $('.vp-big'), playBtn = $('.vp-play'), progress = $('.vp-progress'), played = $('.vp-played')
  const buffered = $('.vp-buffered'), thumb = $('.vp-thumb'), marks = $('.vp-marks'), tip = $('.vp-tip')
  const cur = $('.vp-cur'), dur = $('.vp-dur'), chapterLabel = $('.vp-chapter'), speedBtn = $('.vp-speed')
  const muteBtn = $('.vp-mute'), volume = $('.vp-volume'), fullBtn = $('.vp-full'), ccBtn = $('.vp-cc')

  let chapters = []
  let list = null
  let frame = 0
  let idleTimer = 0
  let scrubbing = false
  let activeChapter = -1

  const duration = () => (Number.isFinite(video.duration) ? video.duration : 0)
  const chapterAt = (time) => chapters.findIndex((c) => time >= c.start && time < c.end)

  // ---- bo'limlar ----
  function readChapters() {
    const element = video.querySelector('track[kind="chapters"]')
    if (!element?.track) return

    element.track.mode = 'hidden'
    const read = () => {
      const cues = Array.from(element.track.cues ?? [])
      if (!cues.length) return

      chapters = cues.map((cue) => ({ start: cue.startTime, end: cue.endTime, title: cue.text.trim() }))
      renderChapters()
    }

    if (element.track.cues?.length) read()
    else element.addEventListener('load', read, { once: true })
  }

  function renderChapters() {
    list?.remove()
    list = document.createElement('ol')
    list.className = 'vp-chapters'
    list.setAttribute('aria-label', 'Video bo‘limlari')
    chapters.forEach((chapter, index) => {
      const item = document.createElement('li')
      item.innerHTML = `<button type="button"><span class="vp-ch-num">${String(index + 1).padStart(2, '0')}</span>` +
        `<span class="vp-ch-title"></span><span class="vp-ch-time">${format(chapter.start)}</span></button>`
      item.querySelector('.vp-ch-title').textContent = chapter.title
      item.querySelector('button').addEventListener('click', () => {
        video.currentTime = chapter.start
        video.play()
        stage.focus({ preventScroll: true })
      })
      list.appendChild(item)
    })
    stage.after(list)
    renderMarks()
    sync()
  }

  function renderMarks() {
    const total = duration()
    marks.replaceChildren()
    if (!total) return

    for (const chapter of chapters.slice(1)) {
      const mark = document.createElement('i')
      mark.style.left = `${(chapter.start / total) * 100}%`
      marks.appendChild(mark)
    }
  }

  // ---- subtitrlar: <track kind="subtitles">, brauzerning o'zi chizadi (::cue uslubi CSS'da) ----
  const subtitles = video.querySelector('track[kind="subtitles"], track[kind="captions"]')?.track ?? null
  function setCc(on, remember = true) {
    if (!subtitles) return
    subtitles.mode = on ? 'showing' : 'hidden'
    ccBtn.classList.toggle('is-on', on)
    ccBtn.setAttribute('aria-pressed', String(on))
    ccBtn.setAttribute('aria-label', on ? 'Subtitrlarni o‘chirish' : 'Subtitrlarni yoqish')
    if (remember) writeCc(on)
  }
  if (subtitles) {
    ccBtn.hidden = false
    setCc(readCc(), false)
    ccBtn.addEventListener('click', () => setCc(subtitles.mode !== 'showing'))
  }

  // ---- holat → ekran ----
  function sync() {
    const total = duration(), time = video.currentTime, ratio = total ? time / total : 0

    played.style.transform = `scaleX(${ratio})`
    thumb.style.left = `${ratio * 100}%`
    cur.textContent = format(time)
    progress.setAttribute('aria-valuemax', String(Math.round(total)))
    progress.setAttribute('aria-valuenow', String(Math.round(time)))
    progress.setAttribute('aria-valuetext', `${format(time)} / ${format(total)}`)

    const index = chapterAt(time)
    if (index !== activeChapter) {
      activeChapter = index
      chapterLabel.textContent = index >= 0 ? chapters[index].title : ''
      list?.querySelectorAll('li').forEach((item, i) => item.classList.toggle('is-active', i === index))
      // Telefonda ro'yxat gorizontal suriladi — joriy bo'lim ko'rinib tursin
      if (list && index >= 0 && list.scrollWidth > list.clientWidth) {
        list.scrollTo({ left: list.children[index].offsetLeft - list.offsetLeft - 8, behavior: 'smooth' })
      }
    }
    // Har bo'lim kartasi ostidagi chiziq: o'tganlari to'la, joriysi qisman
    if (list) {
      Array.from(list.children).forEach((item, i) => {
        const chapter = chapters[i]
        const p = i === index ? (time - chapter.start) / (chapter.end - chapter.start) : time >= chapter.end ? 1 : 0
        item.style.setProperty('--p', p.toFixed(4))
      })
    }
  }

  function syncBuffered() {
    const total = duration()
    if (!total || !video.buffered.length) return

    buffered.style.transform = `scaleX(${video.buffered.end(video.buffered.length - 1) / total})`
  }

  function setPlayingUi() {
    const playing = !video.paused && !video.ended
    stage.classList.toggle('is-playing', playing)
    stage.classList.toggle('is-ended', video.ended)
    const name = video.ended ? 'replay' : playing ? 'pause' : 'play'
    const label = playing ? 'Pauza' : 'Ijro etish'
    playBtn.innerHTML = icon(playing ? 'pause' : 'play')
    playBtn.setAttribute('aria-label', label)
    big.innerHTML = icon(name) + (video.ended ? '<span class="vp-big-time">Qayta ko‘rish</span>' : '')
    big.setAttribute('aria-label', video.ended ? 'Qayta ko‘rish' : label)
  }

  const loop = () => {
    sync()
    frame = requestAnimationFrame(loop)
  }

  // ---- boshqaruv ----
  const toggle = () => (video.paused || video.ended ? video.play() : video.pause())
  const seekBy = (delta) => {
    video.currentTime = Math.min(duration(), Math.max(0, video.currentTime + delta))
    sync()
    wake()
  }

  function wake() {
    stage.classList.remove('is-idle')
    clearTimeout(idleTimer)
    if (!video.paused) idleTimer = setTimeout(() => !scrubbing && stage.classList.add('is-idle'), IDLE_MS)
  }

  function ratioAt(event) {
    const rect = progress.getBoundingClientRect()

    return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  }

  function showTip(event) {
    const ratio = ratioAt(event), time = ratio * duration(), index = chapterAt(time)
    tip.querySelector('.vp-tip-chapter').textContent = index >= 0 ? chapters[index].title : ''
    tip.querySelector('.vp-tip-time').textContent = format(time)
    const half = tip.offsetWidth / 2, width = progress.offsetWidth
    tip.style.left = `${Math.min(width - half, Math.max(half, ratio * width))}px`
  }

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen()
    else if (stage.requestFullscreen) stage.requestFullscreen()
    else video.webkitEnterFullscreen?.() // iOS Safari: faqat videoning o'zi
  }

  function syncVolume() {
    const silent = video.muted || video.volume === 0
    muteBtn.innerHTML = icon(silent ? 'muted' : 'volume')
    muteBtn.setAttribute('aria-label', silent ? 'Ovozni yoqish' : 'Ovozni o‘chirish')
    volume.value = String(video.muted ? 0 : video.volume)
    volume.style.setProperty('--v', volume.value)
  }

  big.addEventListener('click', toggle)
  playBtn.addEventListener('click', toggle)
  video.addEventListener('click', toggle)
  video.addEventListener('dblclick', fullscreen)
  $('.vp-back').addEventListener('click', () => seekBy(-10))
  $('.vp-fwd').addEventListener('click', () => seekBy(10))
  fullBtn.addEventListener('click', fullscreen)
  muteBtn.addEventListener('click', () => {
    if (video.muted || video.volume === 0) {
      video.muted = false
      if (video.volume === 0) video.volume = 0.6
    } else video.muted = true
  })
  volume.addEventListener('input', () => {
    video.volume = Number(volume.value)
    video.muted = video.volume === 0
  })
  speedBtn.addEventListener('click', () => {
    const next = SPEEDS[(SPEEDS.indexOf(video.playbackRate) + 1) % SPEEDS.length]
    video.playbackRate = next
    speedBtn.textContent = `${next}×`
  })

  progress.addEventListener('pointerdown', (event) => {
    scrubbing = true
    stage.classList.add('is-scrubbing')
    progress.setPointerCapture(event.pointerId)
    video.currentTime = ratioAt(event) * duration()
    showTip(event)
    sync()
  })
  progress.addEventListener('pointermove', (event) => {
    showTip(event)
    if (!scrubbing) return
    video.currentTime = ratioAt(event) * duration()
    sync()
  })
  const endScrub = () => {
    scrubbing = false
    stage.classList.remove('is-scrubbing')
    wake()
  }
  progress.addEventListener('pointerup', endScrub)
  progress.addEventListener('pointercancel', endScrub)

  stage.addEventListener('pointermove', wake)
  stage.addEventListener('keydown', (event) => {
    if (event.target === volume || event.metaKey || event.ctrlKey || event.altKey) return
    const keys = {
      ' ': toggle, k: toggle, ArrowLeft: () => seekBy(-5), ArrowRight: () => seekBy(5),
      j: () => seekBy(-10), l: () => seekBy(10), f: fullscreen, m: () => muteBtn.click(), c: () => subtitles && ccBtn.click(),
      Home: () => seekBy(-duration()), End: () => seekBy(duration()),
    }
    const action = keys[event.key.length === 1 ? event.key.toLowerCase() : event.key]
    if (!action) return
    // Tugma ustida turganda Probel — o'sha tugmani bosadi, ikki marta ishlamasin
    if ((event.key === ' ' || event.key === 'Enter') && event.target.closest('button')) return
    event.preventDefault()
    action()
    wake()
  })
  stage.addEventListener('fullscreenchange', () => {
    const on = document.fullscreenElement === stage
    stage.classList.toggle('is-fullscreen', on)
    fullBtn.innerHTML = icon(on ? 'exit' : 'full')
    fullBtn.setAttribute('aria-label', on ? 'To‘liq ekrandan chiqish' : 'To‘liq ekran')
  })

  video.addEventListener('play', () => {
    stage.classList.remove('is-fresh')
    setPlayingUi()
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(loop)
    wake()
  })
  video.addEventListener('pause', () => {
    cancelAnimationFrame(frame)
    setPlayingUi()
    wake()
    sync()
  })
  video.addEventListener('ended', setPlayingUi)
  video.addEventListener('seeked', sync)
  video.addEventListener('progress', syncBuffered)
  video.addEventListener('volumechange', syncVolume)
  video.addEventListener('loadedmetadata', () => {
    dur.textContent = format(duration())
    renderMarks()
    setPlayingUi()
    syncBuffered()
    sync()
  })

  if (video.readyState >= 1) video.dispatchEvent(new Event('loadedmetadata'))
  setPlayingUi()
  syncVolume()
  readChapters()
}
