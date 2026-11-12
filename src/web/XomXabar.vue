<script setup>
// Xom HTTP xabarlari: tanlangan so'rov-javob juftligi qatorma-qator (curl -v dagi kabi), har sarlavha bosilsa izohi.
import { computed, ref } from 'vue'
import { HEADER, STATUS } from '@/web/izohlar'
import { hdr } from '@/web/lab'

const props = defineProps({
  n: { type: Object, required: true },
  hop: { type: Number, default: -1 },
})
const tanlangan = ref('')
const h = computed(() => props.n.hoplar.at(props.hop) ?? props.n.hoplar.at(-1))
const oxirgimi = computed(() => !props.n.hoplar.length || h.value === props.n.hoplar.at(-1))
const izoh = computed(() => HEADER[tanlangan.value.toLowerCase()] ?? '')
const tana = computed(() => {
  if (!oxirgimi.value) return { matn: '', izoh: 'Bu oraliq javob — tanani curl saqlamadi (faqat oxirgisini).' }
  if (props.n.sorov.usul === 'HEAD') return { matn: '', izoh: 'HEAD — tana yo‘q.' }
  const j = h.value?.javob
  if (!props.n.tana) return { matn: '', izoh: j?.kod === 304 ? '304 — tana yuborilmadi.' : j?.kod === 204 ? '204 — tana yo‘q.' : 'Tana bo‘sh.' }
  if (hdr(j?.headerlar, 'Content-Encoding') && !props.n.sorov.siqish) return { matn: '', izoh: 'Tana siqilgan (gzip) holda keldi — “Siqishni so‘rash” yoqilsa curl uni ochib ko‘rsatadi.' }
  return { matn: props.n.tana, izoh: props.n.w.size_download > 6000 ? `Birinchi 6000 bayt ko‘rsatildi (jami ${props.n.w.size_download}).` : '' }
})
const sorovTana = computed(() => (props.n.sorov.tana && !['GET', 'HEAD'].includes(props.n.sorov.usul) && props.hop <= 0 ? props.n.sorov.tana : ''))
</script>

<template>
    <div class="xom">
        <section>
            <h4>So‘rov <small>klient → server</small></h4>
            <pre><span class="boshi">{{ h?.sorov.qator }}</span>
<template v-for="[k, v] in h?.sorov.headerlar ?? []" :key="'s' + k"><span class="hdr" :class="{ on: tanlangan === k, bilinadi: HEADER[k.toLowerCase()] }" @click="tanlangan = tanlangan === k ? '' : k"><b>{{ k }}</b>: {{ v }}</span>
</template><template v-if="sorovTana">
<span class="tana">{{ sorovTana }}</span></template></pre>
        </section>
        <section>
            <h4>Javob <small>server → klient</small></h4>
            <pre v-if="h?.javob.qator"><span class="boshi">{{ h.javob.qator }}</span>
<template v-for="[k, v] in h.javob.headerlar" :key="'j' + k + v"><span class="hdr" :class="{ on: tanlangan === k, bilinadi: HEADER[k.toLowerCase()] }" @click="tanlangan = tanlangan === k ? '' : k"><b>{{ k }}</b>: {{ v }}</span>
</template><template v-if="tana.matn">
<span class="tana">{{ tana.matn }}</span></template></pre>
            <pre v-else class="yoq">{{ n.xato || 'javob yo‘q' }}</pre>
            <p v-if="tana.izoh" class="izoh-kichik">{{ tana.izoh }}</p>
            <p v-if="h?.javob.kod && STATUS[h.javob.kod]" class="izoh-kichik"><b>{{ h.javob.kod }}</b> — {{ STATUS[h.javob.kod] }}</p>
        </section>
        <div v-if="tanlangan" class="hdr-izoh">
            <b>{{ tanlangan }}</b> — {{ izoh || 'bu sarlavha uchun izoh yo‘q.' }}
        </div>
        <p v-else class="maslahat">Sarlavha ustiga bosing — nima ekanini tushuntiraman.</p>
    </div>
</template>

<style scoped>
.xom { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
h4 { margin: 0 0 8px; font: 600 11px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--text-subtle); }
h4 small { letter-spacing: 0; text-transform: none; font-weight: 400; margin-left: 4px; }
pre { margin: 0; padding: 12px 14px; border-radius: 10px; background: var(--code-bg); color: #d7dde8; font: 12.5px/1.6 var(--font-mono); overflow: auto; max-height: 340px; white-space: pre-wrap; overflow-wrap: anywhere; }
pre.yoq { color: #fca5a5; }
.boshi { color: #fbbf24; font-weight: 700; }
.hdr { cursor: pointer; border-radius: 3px; }
.hdr b { color: #7dd3fc; font-weight: 500; }
.hdr.bilinadi b { text-decoration: underline dotted rgba(125, 211, 252, .5); text-underline-offset: 3px; }
.hdr:hover, .hdr.on { background: rgba(125, 211, 252, .14); }
.tana { color: #a7f3d0; }
.izoh-kichik { margin: 6px 0 0; font-size: 12.5px; color: var(--text-muted); }
.hdr-izoh { grid-column: 1 / -1; padding: 10px 12px; border-radius: 10px; background: color-mix(in srgb, var(--accent) 8%, var(--bg-elevated)); border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--border)); font-size: 13px; }
.maslahat { grid-column: 1 / -1; margin: 0; font-size: 12px; color: var(--text-subtle); }
@media (max-width: 860px) { .xom { grid-template-columns: 1fr; } }
</style>
