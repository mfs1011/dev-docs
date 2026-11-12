<script setup>
// So'rov yo'li: Klient → DNS → TCP → Server bosqichlari va har so'rov-javob juftligi (redirectda bir nechta).
// Hammasi curl -v chiqishidan: "Connected to …" (DNS natijasi va ulanish), "Re-using existing connection"
// (keep-alive), ">"/"<" qatorlari, -w '%{json}' vaqtlari.
import { computed } from 'vue'
import { hdr } from '@/web/lab'
import { statusSinf } from '@/web/izohlar'

const props = defineProps({
  n: { type: Object, default: null },
  tanlanganHop: { type: Number, default: -1 },
  tezlik: { type: Number, default: 1 },
  kutilmoqda: { type: String, default: '' },   // yuborilayotgan so'rov (javob hali kelmagan)
})
const emit = defineEmits(['hop'])

const ms = (s) => (s == null ? '—' : s < 0.001 ? '<1 ms' : s < 1 ? `${Math.round(s * 1000)} ms` : `${s.toFixed(2)} s`)
const ulanish = computed(() => {
  const info = (props.n?.hoplar ?? []).flatMap((h) => h.info)
  const m = info.map((x) => x.match(/^Connected to (\S+) \(([^)]+)\) port (\d+)/)).find(Boolean)
  return m ? { host: m[1], ip: m[2], port: m[3] } : null
})
const host = computed(() => {
  try { return new URL(props.n?.sorov.url).hostname } catch { return '' }
})
const qaytaIshlatildi = (h) => h.info.some((x) => x.startsWith('Re-using existing connection'))
const w = computed(() => props.n?.w ?? {})
const bosqich = computed(() => {
  const n = props.n
  if (!n) return {}
  return {
    dns: n.kod === 6 ? 'xato' : 'ok',
    tcp: n.kod === 6 ? 'off' : n.kod === 7 ? 'xato' : 'ok',
    server: n.kod > 0 ? 'off' : 'ok',
  }
})
const kalitlar = ['Location', 'Content-Type', 'ETag', 'Cache-Control', 'Set-Cookie', 'WWW-Authenticate', 'Access-Control-Allow-Origin', 'Content-Encoding', 'Content-Range', 'Allow', 'Retry-After']
const asosiy = (h) => kalitlar.map((k) => [k, hdr(h.javob.headerlar, k)]).filter(([, v]) => v)
const sorovAsosiy = (h) => ['Origin', 'Cookie', 'Authorization', 'If-None-Match', 'Range', 'Content-Type', 'Accept-Encoding']
  .map((k) => [k, hdr(h.sorov.headerlar, k)]).filter(([, v]) => v)

// vaqt chizig'i (curl -w: kumulyativ soniyalar)
const qismlar = computed(() => {
  const x = w.value
  if (!x.time_total) return []
  const t = x.time_total
  const l = [
    ['DNS', x.time_namelookup, '#0ea5e9'],
    ['TCP', x.time_connect - x.time_namelookup, '#8b5cf6'],
    ['Kutish (TTFB)', x.time_starttransfer - x.time_connect, '#f59e0b'],
    ['Yuklab olish', t - x.time_starttransfer, '#16a34a'],
  ]
  return l.map(([nom, v, rang]) => ({ nom, v: Math.max(0, v), rang, f: Math.max(0, v) / t }))
})
const dur = computed(() => 0.7 / props.tezlik)
</script>

<template>
    <div class="yol">
        <div class="sarlavha">
            <span>SO‘ROV YO‘LI</span>
            <span v-if="n" class="url">{{ n.sorov.usul }} {{ n.sorov.url }}</span>
        </div>
        <div v-if="kutilmoqda" class="kut"><span class="nuqta" /> {{ kutilmoqda }} — so‘rov yuborildi, javob kutilmoqda (curl ishlayapti)…</div>
        <p v-if="!n && !kutilmoqda" class="bosh">Tepada so‘rovni tanlang yoki yozing va <b>▶ Yuborish</b> ni bosing — haqiqiy curl so‘rovi nginx’ga boradi va har bosqich shu yerda ko‘rinadi.</p>

        <template v-if="n">
            <div class="bosqichlar" :key="n.vaqt">
                <div class="b klient ok"><span class="ikon">💻</span><small>KLIENT</small><b>curl</b><p>brauzer o‘rnida</p></div>
                <span class="strelka" />
                <div class="b" :class="bosqich.dns">
                    <span class="ikon">📖</span><small>DNS</small><b>{{ host }}</b>
                    <p v-if="bosqich.dns === 'xato'">nom topilmadi</p>
                    <p v-else>→ {{ ulanish?.ip ?? '…' }} <i>({{ ms(w.time_namelookup) }})</i></p>
                    <p class="mayda">/etc/hosts’dan</p>
                </div>
                <span class="strelka" />
                <div class="b" :class="bosqich.tcp">
                    <span class="ikon">🔌</span><small>TCP ULANISH</small><b>{{ ulanish ? `${ulanish.ip}:${ulanish.port}` : '—' }}</b>
                    <p v-if="bosqich.tcp === 'xato'">ulanish rad etildi</p>
                    <p v-else-if="bosqich.tcp === 'ok'">ulandi <i>({{ ms(w.time_connect - w.time_namelookup) }})</i></p>
                </div>
                <span class="strelka" />
                <div class="b server" :class="bosqich.server">
                    <span class="ikon">🖥</span><small>SERVER</small><b>{{ hdr(n.hoplar[0]?.javob.headerlar, 'Server') ?? 'nginx' }}</b>
                    <p>:8080, haqiqiy javob</p>
                </div>
            </div>

            <ol class="hoplar">
                <li
                    v-for="(h, i) in n.hoplar" :key="n.vaqt + '-' + i" class="hop" :class="{ tanlangan: tanlanganHop === i }"
                    :style="{ '--kech': `${i * dur * 2.2}s`, '--dur': `${dur}s` }" @click="emit('hop', i)"
                >
                    <span class="raqam">{{ i + 1 }}</span>
                    <div class="sorov-karta">
                        <small>SO‘ROV <em v-if="i && qaytaIshlatildi(h)" title="Re-using existing connection">keep-alive: o‘sha ulanish</em></small>
                        <b><span class="metod">{{ h.sorov.qator.split(' ')[0] }}</span> {{ h.sorov.qator.split(' ')[1] }}</b>
                        <p v-for="[k, v] in sorovAsosiy(h)" :key="k"><code>{{ k }}:</code> {{ v }}</p>
                    </div>
                    <div class="trassa">
                        <span class="xat bor">✉ {{ h.sorov.qator.split(' ')[0] }}</span>
                        <span class="xat qayt" :class="statusSinf(h.javob.kod)">{{ h.javob.kod || '…' }} ✉</span>
                    </div>
                    <div class="javob-karta" :class="statusSinf(h.javob.kod)">
                        <small>JAVOB</small>
                        <b><span class="kod">{{ h.javob.kod }}</span> {{ h.javob.matn }}</b>
                        <p v-for="[k, v] in asosiy(h)" :key="k"><code>{{ k }}:</code> {{ v }}</p>
                    </div>
                    <div v-if="i < n.hoplar.length - 1" class="keyingi">↳ Location bo‘yicha keyingi so‘rov</div>
                </li>
            </ol>
            <p v-if="n.kod > 0" class="xato-qator">{{ n.xato }}</p>

            <div v-if="qismlar.length" class="vaqt">
                <div class="chiziq">
                    <span v-for="q in qismlar" :key="q.nom" :style="{ flex: `${Math.max(q.f, 0.012)} 0 0`, background: q.rang }" :title="`${q.nom}: ${ms(q.v)}`" />
                </div>
                <div class="belgilar">
                    <span v-for="q in qismlar" :key="q.nom"><i :style="{ background: q.rang }" />{{ q.nom }} <b>{{ ms(q.v) }}</b></span>
                    <span class="jami">jami <b>{{ ms(w.time_total) }}</b> · {{ w.size_download }} bayt{{ w.num_redirects ? ` · ${w.num_redirects} redirect` : '' }}</span>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.yol { --ok: #16a34a; --yonalish: #2563eb; --mijoz: #d97706; --server: #dc2626; --xato: #dc2626; }
.sarlavha { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid var(--border); font: 600 11px var(--font-mono); letter-spacing: .1em; color: var(--text-subtle); }
.sarlavha .url { letter-spacing: 0; font-weight: 500; color: var(--accent-text); overflow-wrap: anywhere; }
.kut { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 8px 12px; border-radius: 10px; background: color-mix(in srgb, var(--accent) 8%, transparent); color: var(--accent-text); font: 600 13px var(--font-mono); }
.nuqta { width: 9px; height: 9px; border-radius: 50%; background: var(--accent); animation: puls 1s ease-in-out infinite; }
@keyframes puls { 50% { opacity: .25; transform: scale(.7); } }
.bosh { margin: 12px 0; color: var(--text-muted); font-size: 13.5px; }

.bosqichlar { display: grid; grid-template-columns: 1fr 28px 1fr 28px 1fr 28px 1fr; align-items: stretch; margin-bottom: 16px; }
.b { display: grid; gap: 2px; align-content: start; padding: 10px 12px; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-elevated); box-shadow: var(--shadow-sm); opacity: .4; animation: yon .4s ease forwards; }
.b:nth-child(1) { animation-delay: 0s; } .b:nth-child(3) { animation-delay: .25s; } .b:nth-child(5) { animation-delay: .5s; } .b:nth-child(7) { animation-delay: .75s; }
@keyframes yon { to { opacity: 1; } }
.b.ok { border-color: color-mix(in srgb, var(--ok) 45%, var(--border)); }
.b.xato { border-color: var(--xato); box-shadow: 0 0 0 3px color-mix(in srgb, var(--xato) 18%, transparent); }
.b.off { animation: none; opacity: .3; }
.ikon { font-size: 18px; }
.b small, .sorov-karta small, .javob-karta small { font: 600 10px var(--font-mono); letter-spacing: .1em; color: var(--text-subtle); }
.b b { font-size: 14.5px; overflow-wrap: anywhere; }
.b p { margin: 0; font-size: 12.5px; color: var(--text-muted); }
.b p i { font-style: normal; color: var(--text-subtle); font-family: var(--font-mono); font-size: 11.5px; }
.b .mayda { font-size: 11px; color: var(--text-subtle); }
.b.xato p { color: var(--xato); font-weight: 600; }
.strelka { align-self: center; height: 2px; background: var(--border-strong); position: relative; margin: 0 4px; }
.strelka::after { content: ''; position: absolute; right: -1px; top: -4px; border: 5px solid transparent; border-left-color: var(--border-strong); border-right: 0; }

.hoplar { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.hop { position: relative; display: grid; grid-template-columns: 26px minmax(0, 1fr) minmax(120px, .9fr) minmax(0, 1fr); gap: 12px; align-items: center; padding: 8px; border-radius: 14px; cursor: pointer; border: 1px solid transparent; }
.hop:hover { background: var(--bg-sunken); }
.hop.tanlangan { border-color: var(--border-strong); background: color-mix(in srgb, var(--accent) 4%, transparent); }
.raqam { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; background: var(--bg-sunken); font: 700 12px var(--font-mono); color: var(--text-muted); }
.sorov-karta, .javob-karta { display: grid; gap: 2px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-elevated); min-width: 0; }
.sorov-karta { border-left: 4px solid var(--accent); }
.sorov-karta b, .javob-karta b { font: 600 14px var(--font-mono); overflow-wrap: anywhere; }
.sorov-karta em { font-style: normal; margin-left: 6px; color: #7c3aed; letter-spacing: 0; }
.metod { color: var(--accent-text); }
.sorov-karta p, .javob-karta p { margin: 0; font: 11.5px var(--font-mono); color: var(--text-muted); overflow-wrap: anywhere; }
.sorov-karta code, .javob-karta code { color: var(--text-subtle); }
.javob-karta { border-left: 4px solid var(--r, var(--border)); opacity: 0; animation: yon .3s ease forwards; animation-delay: calc(var(--kech) + 2 * var(--dur)); }
.javob-karta.ok { --r: var(--ok); } .javob-karta.yonalish { --r: var(--yonalish); } .javob-karta.mijoz { --r: var(--mijoz); } .javob-karta.server, .javob-karta.xato { --r: var(--server); }
.javob-karta .kod { color: var(--r); }

.trassa { position: relative; height: 54px; }
.trassa::before, .trassa::after { content: ''; position: absolute; left: 0; right: 0; height: 2px; background: var(--border); }
.trassa::before { top: 16px; } .trassa::after { top: 38px; }
.xat { position: absolute; padding: 1px 7px; border-radius: 6px; font: 700 11px var(--font-mono); color: #fff; white-space: nowrap; opacity: 0; }
.xat.bor { top: 7px; left: 0; background: var(--accent); animation: borish var(--dur) ease-in-out forwards; animation-delay: var(--kech); }
.xat.qayt { top: 29px; right: 0; background: var(--r, #64748b); animation: qaytish var(--dur) ease-in-out forwards; animation-delay: calc(var(--kech) + var(--dur)); }
.xat.ok { --r: var(--ok); } .xat.yonalish { --r: var(--yonalish); } .xat.mijoz { --r: var(--mijoz); } .xat.server, .xat.xato { --r: var(--server); }
@keyframes borish { 0% { left: 0; opacity: 1; transform: translateX(0); } 100% { left: 100%; opacity: 1; transform: translateX(-100%); } }
@keyframes qaytish { 0% { right: 0; opacity: 1; transform: translateX(0); } 100% { right: 100%; opacity: 1; transform: translateX(100%); } }
.keyingi { grid-column: 2 / -1; font: 11.5px var(--font-mono); color: var(--yonalish); padding-left: 4px; }
.xato-qator { margin: 8px 0 0; color: var(--xato); font: 600 13px var(--font-mono); }

.vaqt { margin-top: 16px; }
.chiziq { display: flex; height: 14px; border-radius: 7px; overflow: hidden; background: var(--bg-sunken); gap: 2px; }
.chiziq span { min-width: 3px; }
.belgilar { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 8px; font-size: 12px; color: var(--text-muted); }
.belgilar i { display: inline-block; width: 9px; height: 9px; border-radius: 2px; margin-right: 5px; }
.belgilar b { font-family: var(--font-mono); font-weight: 600; color: var(--text); }
.belgilar .jami { margin-left: auto; }
@media (max-width: 860px) {
  .bosqichlar { grid-template-columns: 1fr 1fr; gap: 8px; }
  .strelka { display: none; }
  .hop { grid-template-columns: 26px 1fr; }
  .trassa { display: none; }
  .javob-karta { grid-column: 2; }
}
</style>
