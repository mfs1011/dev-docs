<script setup>
// "So'rov yo'li": nginx har so'rovni qayerdan o'tkazganini bekatlar bilan ko'rsatadi.
// Hamma ma'lumot nginx'ning o'z log'laridan (kuzatuv.js): taxmin yoki o'zimizning konfiguratsiya tahlilimiz emas.
import { computed, ref, watch } from 'vue'
import { toliqNomlar } from './kuzatuv'

const props = defineProps({
  /** kuzatuv.js dagi so'rovlar (eng yangisi oxirida); mashq tekshiruvlarinikilari bu yerda olib tashlanadi */
  sorovlar: { type: Array, required: true },
  /** sxema yangilanishi uchun hisoblagich (ichki o'zgarishlar reaktiv emas) */
  versiya: { type: Number, default: 0 },
})

/** mashq tekshiruvlarining so'rovlari (TEKSHIRUV_UA) ko'rsatilmaydi */
const korinadigan = computed(() => (props.versiya, props.sorovlar.filter((s) => !s.tekshiruv)))
const tanlanganId = ref(null)
const kuzat = ref(true) // yangi so'rov kelsa, avtomatik o'shani ko'rsatish
const royxat = computed(() => (props.versiya, [...korinadigan.value].reverse().slice(0, 30)))
const tanlangan = computed(() => (props.versiya, korinadigan.value.find((s) => s.id === tanlanganId.value) ?? korinadigan.value[korinadigan.value.length - 1] ?? null))

watch(() => props.versiya, () => {
  if (kuzat.value) tanlanganId.value = korinadigan.value[korinadigan.value.length - 1]?.id ?? null
})
function tanla(id) {
  tanlanganId.value = id
  kuzat.value = id === korinadigan.value[korinadigan.value.length - 1]?.id
}

const statusRang = (st) => (!st ? 'kutilmoqda' : st < 300 ? 'yaxshi' : st < 400 ? 'yonalish' : st < 500 ? 'mijoz' : 'server')
const statusIzoh = {
  200: 'OK — hammasi joyida', 201: 'yaratildi', 204: 'javob tanasi yo‘q', 301: 'doimiy yo‘naltirish', 302: 'vaqtincha yo‘naltirish',
  304: 'o‘zgarmagan (brauzer keshi)', 400: 'noto‘g‘ri so‘rov', 401: 'avtorizatsiya kerak', 403: 'taqiqlangan', 404: 'topilmadi',
  405: 'bu usul mumkin emas', 413: 'so‘rov tanasi juda katta', 429: 'juda ko‘p so‘rov', 444: 'nginx ulanishni javobsiz yopdi',
  499: 'mijoz kutmasdan uzildi', 500: 'server ichki xatosi', 502: 'backend javob bermadi (Bad Gateway)', 503: 'xizmat vaqtincha mavjud emas',
  504: 'backend vaqtida javob bermadi (Gateway Timeout)',
}

// bir nechta backend bo'lsa — so'nggi so'rovlar ular orasida qanday taqsimlangan
const taqsimot = computed(() => {
  props.versiya
  const son = new Map()
  for (const s of korinadigan.value.slice(-30)) {
    const u = s.ulanishlar[s.ulanishlar.length - 1]
    if (u) son.set(u, (son.get(u) ?? 0) + 1)
  }
  if (son.size < 2) return null
  const jami = [...son.values()].reduce((a, b) => a + b, 0)
  return [...son].sort().map(([manzil, n]) => ({ manzil, n, foiz: Math.round((n / jami) * 100) }))
})

const tanlovBosqichlari = computed(() => (props.versiya, tanlangan.value?.bosqichlar.filter((b) => b.sinalgan.length || b.tanlangan) ?? []))
/** har bosqich uchun sinalgan location'larning to'liq nomi; URI: 1-bosqich — so'rov qatoridan, oxirgisi — log'dagi $uri */
function sinalganlar(b, k) {
  const so = tanlangan.value
  const uri = k === 0 ? decodeURI(so.yol.split('?')[0]) : (k === tanlovBosqichlari.value.length - 1 ? so.log?.uri ?? '' : '')
  return toliqNomlar(b, uri)
}
/** Nega aynan shu location (6-bobdagi algoritm bo'yicha), nginx sinagan ketma-ketlikdan */
function nega(b, k) {
  if (!b.tanlangan) return ''
  const xs = sinalganlar(b, k)
  const uri = k === 0 ? decodeURI(tanlangan.value.yol.split('?')[0]) : tanlangan.value.log?.uri ?? ''
  const prefikslar = xs.filter((x) => !x.regex && !x.predikat && uri.startsWith(x.toliq))
  const engUzun = prefikslar.sort((a, c) => c.toliq.length - a.toliq.length)[0]?.toliq
  const regexSinaldi = xs.some((x) => x.regex)
  const t = b.tanlangan
  if (t.startsWith('=')) return 'Aniq moslik (=) — qidiruv shu zahoti to‘xtadi.'
  const tanlanganX = xs.find((x) => mosmi(b, x))
  if (tanlanganX?.regex) return `Eng uzun prefiks${engUzun ? ` (${engUzun})` : ''} eslab qolindi, lekin regex mos keldi — regex ustun.`
  if (tanlanganX?.predikat) return 'Regex’lar mos kelmadi, predikat o‘zgaruvchisi bo‘sh emas va 0 emas — shu tanlandi.'
  if (regexSinaldi) return 'Regex’lar mos kelmadi — eslab qolingan eng uzun prefiks tanlandi.'
  return 'Eng uzun mos prefiks tanlandi; regex’lar sinalmadi (^~ bilan belgilangan yoki regex location yo‘q).'
}
/** $upstream_status ham $upstream_addr kabi ", " / " : " bilan ajratilgan; ulanib bo'lmasa "502" yoki "-" */
const ustatus = (i) => tanlangan.value?.log?.ustatus?.split(/, | : /)[i]?.replace(/^-$/, '') ?? ''
function mosmi(b, x) {
  if (!b.tanlangan) return false
  return x.regex || x.predikat ? b.tanlangan === x.nom : b.tanlangan.replace(/^=/, '') === x.toliq
}
</script>

<template>
  <section class="yol">
    <header class="yol-bosh">
      <h2>So‘rov yo‘li</h2>
      <label class="kuzat"><input v-model="kuzat" type="checkbox"> yangisini ko‘rsatish</label>
    </header>

    <p v-if="!korinadigan.length" class="bosh">
      Terminalda so‘rov yuboring, masalan <code>curl -i http://localhost/</code> — nginx uni qanday yo‘ldan o‘tkazgani shu yerda chiziladi.
    </p>

    <template v-else>
      <ol class="royxat">
        <li v-for="s in royxat" :key="s.id" :class="{ on: tanlangan?.id === s.id }">
          <button type="button" @click="tanla(s.id)">
            <span class="st" :class="statusRang(+s.log?.status)">{{ s.log?.status ?? '…' }}</span>
            <code>{{ s.usul }} {{ s.yol }}</code>
          </button>
        </li>
      </ol>

      <div v-if="tanlangan" class="bekatlar">
        <div class="bekat">
          <span class="belgi" aria-hidden="true">1</span>
          <div>
            <h3>So‘rov keldi</h3>
            <p><code>{{ tanlangan.usul }} {{ tanlangan.yol }}</code></p>
            <p v-if="tanlangan.log" class="izoh">
              <code>Host: {{ tanlangan.log.host }}</code> · <code>{{ tanlangan.log.port }}</code>-port
            </p>
          </div>
        </div>

        <div class="bekat">
          <span class="belgi" aria-hidden="true">2</span>
          <div>
            <h3>Server tanlandi</h3>
            <p v-if="tanlangan.log">
              <template v-if="tanlangan.log.server"><code>server_name {{ tanlangan.log.server }}</code></template>
              <template v-else>nomsiz server (<code>server_name</code> yo‘q yoki <code>""</code>)</template>
            </p>
            <p v-else class="izoh">javob tugashini kutmoqda…</p>
            <p class="izoh">Avval port, keyin <code>Host</code> sarlavhasi bo‘yicha (6-bob). Mos kelmasa — shu portning standart serveri.</p>
          </div>
        </div>

        <div class="bekat">
          <span class="belgi" aria-hidden="true">3</span>
          <div>
            <h3>Location tanlandi</h3>
            <div v-for="(b, k) in tanlovBosqichlari" :key="k" class="tanlov">
              <p v-if="k > 0" class="ichki">↪ ichki yo‘naltirish<template v-if="k === tanlovBosqichlari.length - 1 && tanlangan.log && tanlangan.log.uri !== tanlangan.yol.split('?')[0]"> (<code>{{ tanlangan.log.uri }}</code>)</template> — nginx yangi URI uchun qaytadan tanladi (masalan, <code>index</code>, <code>try_files</code>, <code>error_page</code>)</p>
              <ol class="sinov">
                <li v-for="(x, i) in sinalganlar(b, k)" :key="i" :class="{ regex: x.regex, predikat: x.predikat, mos: mosmi(b, x) }">
                  <span v-if="x.regex" class="tur">regex</span><span v-else-if="x.predikat" class="tur">predikat</span><code>{{ x.toliq }}</code>
                </li>
              </ol>
              <p v-if="b.tanlangan" class="natija">tanlandi: <code>location {{ b.tanlangan.startsWith('=') ? `= ${b.tanlangan.slice(1)}` : (sinalganlar(b, k).find((x) => x.regex && x.nom === b.tanlangan) ? `~ ${b.tanlangan}` : b.tanlangan) }}</code></p>
              <p v-if="b.tanlangan" class="nega">{{ nega(b, k) }}</p>
            </div>
            <p v-if="!tanlovBosqichlari.length" class="izoh">Location tanlanmadi: bu serverda <code>location</code> yo‘q (so‘rov <code>server</code> darajasidagi <code>root</code> bilan bajarildi) yoki so‘rov undan oldin tugadi (<code>server</code> darajasidagi <code>return</code>).</p>
            <p class="izoh">Sinov tartibi — nginx'ning o‘zi yozgani. Prefikslar ichki daraxt bo‘yicha (fayldagi tartib emas), keyin regex'lar fayldagi tartibda, so‘ng predikatlar. Uzuk chiziqli — regex yoki predikat; yashil — tanlangani.</p>
          </div>
        </div>

        <div v-if="tanlangan.cheklandi || tanlangan.kechiktirildi" class="bekat ogoh">
          <span class="belgi" aria-hidden="true">!</span>
          <div>
            <h3>{{ tanlangan.cheklandi ? 'limit_req: rad etildi' : 'limit_req: navbatda kutdi' }}</h3>
            <p class="izoh">{{ tanlangan.cheklandi ? 'So‘rovlar tezligi zona chegarasidan oshdi (26-bob).' : 'burst navbatida tezlikka mos kelguncha ushlab turildi (26-bob).' }}</p>
          </div>
        </div>

        <div v-if="tanlangan.kesh || tanlangan.ulanishlar.length || tanlangan.xatolar.length" class="bekat">
          <span class="belgi" aria-hidden="true">4</span>
          <div>
            <h3>Backend</h3>
            <p v-if="tanlangan.kesh === 'bor'" class="yaxshi-matn">Keshda bor — backend'ga umuman bormadi (<code>{{ tanlangan.log?.kesh || 'HIT' }}</code>).</p>
            <p v-else-if="tanlangan.kesh === 'yoq'">Keshda yo‘q (<code>{{ tanlangan.log?.kesh || 'MISS' }}</code>) — backend'dan olinadi va keshga yoziladi.</p>
            <p v-for="(u, i) in tanlangan.ulanishlar" :key="i" :class="{ 'xato-matn': /^5|^$/.test(ustatus(i)) && i < tanlangan.ulanishlar.length - 1 }">
              <span v-if="i > 0">keyin </span><code>{{ u }}</code>
              <template v-if="ustatus(i)"> → javob <code>{{ ustatus(i) }}</code></template>
              <template v-if="i < tanlangan.ulanishlar.length - 1"> — nginx keyingi serverga o‘tdi</template>
            </p>
            <p v-for="(x, i) in tanlangan.xatolar" :key="'x' + i" class="xato-matn"><code>{{ x }}</code></p>
          </div>
        </div>

        <div class="bekat">
          <span class="belgi javob" :class="statusRang(+tanlangan.log?.status)" aria-hidden="true">✓</span>
          <div>
            <h3>Javob</h3>
            <p v-if="tanlangan.log">
              <span class="st katta" :class="statusRang(+tanlangan.log.status)">{{ tanlangan.log.status }}</span>
              {{ statusIzoh[tanlangan.log.status] ?? '' }} · {{ tanlangan.log.vaqt }} s
            </p>
            <p v-else class="izoh">kutilmoqda…</p>
          </div>
        </div>
      </div>

      <div v-if="taqsimot" class="taqsimot">
        <h3>So‘nggi so‘rovlar backend'lar orasida</h3>
        <div v-for="t in taqsimot" :key="t.manzil" class="qator">
          <code>{{ t.manzil }}</code>
          <span class="chiziq"><span :style="{ width: t.foiz + '%' }" /></span>
          <span>{{ t.n }}</span>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.yol { display: flex; flex-direction: column; gap: 12px; padding: 14px 16px; overflow: auto; height: 100%; box-sizing: border-box; }
.yol-bosh { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
h2 { margin: 0; font-size: 1.05rem; }
h3 { margin: 0 0 4px; font-size: .92rem; }
p { margin: 2px 0; }
.yol code { font: .8rem var(--font-mono); padding: 1px 4px; border-radius: 4px; background: var(--bg-sunken); }
.kuzat { font-size: .8rem; color: var(--text-muted); display: flex; gap: 6px; align-items: center; }
.bosh { color: var(--text-muted); }
.izoh { color: var(--text-muted); font-size: .82rem; }
.royxat, .bekatlar, .taqsimot, .yol-bosh { flex-shrink: 0; }
.royxat { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; max-height: 150px; overflow: auto; border: 1px solid var(--border); border-radius: var(--radius-sm); }
.royxat button { all: unset; box-sizing: border-box; display: flex; gap: 8px; align-items: center; width: 100%; padding: 3px 8px; cursor: pointer; font-size: .84rem; }
.royxat li.on button, .royxat button:hover { background: var(--bg-soft, rgba(127, 127, 127, .1)); }
.royxat code { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.st { display: inline-block; min-width: 2.6em; text-align: center; border-radius: 4px; font: 600 .78rem/1.6 Menlo, monospace; }
.st.katta { font-size: .95rem; padding: 0 6px; }
.yaxshi { background: #1f883d22; color: #1a7f37; }
.yonalish { background: #0969da22; color: #0969da; }
.mijoz { background: #bf870022; color: #9a6700; }
.server { background: #cf222e22; color: #cf222e; }
.kutilmoqda { background: rgba(127, 127, 127, .15); color: var(--text-muted); }
.bekatlar { display: flex; flex-direction: column; position: relative; }
.bekat { display: grid; grid-template-columns: 28px 1fr; gap: 10px; padding: 8px 0; position: relative; }
.bekat:not(:last-child)::before { content: ''; position: absolute; left: 13px; top: 34px; bottom: -6px; width: 2px; background: var(--border); }
.belgi { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font: 600 .8rem system-ui; background: var(--accent-soft, #0969da22); color: var(--accent, #0969da); }
.ogoh .belgi { background: #cf222e22; color: #cf222e; }
.belgi.javob.yaxshi { background: #1f883d33; }
.sinov { list-style: none; margin: 4px 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4px; counter-reset: s; }
.sinov li { counter-increment: s; border: 1px solid var(--border); border-radius: 4px; padding: 1px 6px; font-size: .8rem; }
.sinov li::before { content: counter(s) '. '; color: var(--text-muted); }
.sinov li.regex, .sinov li.predikat { border-style: dashed; }
.tur { font-size: .7rem; color: var(--text-muted); margin-right: 4px; }
.sinov li.mos { border-color: #1a7f37; background: #1f883d1a; }
.natija { font-size: .88rem; }
.nega { font-size: .84rem; padding: 4px 8px; margin-top: 4px; border-left: 3px solid #1a7f37; background: #1f883d12; }
.ichki { font-size: .82rem; color: #9a6700; }
.yaxshi-matn { color: #1a7f37; }
.xato-matn { color: #cf222e; font-size: .82rem; }
.taqsimot { border-top: 1px solid var(--border); padding-top: 10px; }
.taqsimot .qator { display: grid; grid-template-columns: 130px 1fr 28px; gap: 8px; align-items: center; font-size: .82rem; margin: 3px 0; }
.chiziq { height: 8px; background: rgba(127, 127, 127, .15); border-radius: 4px; overflow: hidden; }
.chiziq span { display: block; height: 100%; background: var(--accent, #0969da); }
</style>
