<script setup>
// Network paneli (brauzerdagi DevTools'dagi kabi): yuborilgan so'rovlar tarixi, eng yangisi tepada.
import { hdr } from '@/web/lab'
import { statusSinf } from '@/web/izohlar'

defineProps({
  tarix: { type: Array, required: true },
  tanlangan: { type: Number, default: 0 },
})
const emit = defineEmits(['tanla'])
const yol = (n) => { try { const u = new URL(n.sorov.url); return u.pathname + u.search } catch { return n.sorov.url } }
const tur = (n) => (hdr(n.hoplar.at(-1)?.javob.headerlar, 'Content-Type') ?? '').split(';')[0].split('/').pop() || '—'
const ms = (s) => (s == null ? '—' : s < 1 ? `${Math.round(s * 1000)} ms` : `${s.toFixed(2)} s`)
const hajm = (b) => (b == null ? '—' : b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`)
</script>

<template>
    <div class="tarmoq">
        <h4>Network <small>— brauzer DevTools’idagi “Network” paneli kabi</small></h4>
        <p v-if="!tarix.length" class="bosh">Hali so‘rov yo‘q.</p>
        <table v-else>
            <thead><tr><th>Metod</th><th>Manzil</th><th>Status</th><th>Turi</th><th>Hajm</th><th>Vaqt</th></tr></thead>
            <tbody>
                <tr v-for="(n, i) in tarix" :key="n.vaqt + '-' + i" :class="{ on: i === tanlangan }" @click="emit('tanla', i)">
                    <td class="m">{{ n.sorov.usul }}</td>
                    <td class="y" :title="n.sorov.url">{{ yol(n) }}<span v-if="n.hoplar.length > 1" class="r"> ↪ {{ n.hoplar.length - 1 }}</span></td>
                    <td><span class="s" :class="statusSinf(n.hoplar.at(-1)?.javob.kod)">{{ n.hoplar.at(-1)?.javob.kod || 'xato' }}</span></td>
                    <td>{{ tur(n) }}</td>
                    <td>{{ hajm(n.w.size_download) }}<i v-if="hdr(n.hoplar.at(-1)?.javob.headerlar, 'Content-Encoding')"> gzip</i></td>
                    <td>{{ ms(n.w.time_total) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
h4 { margin: 0 0 8px; font: 600 11px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--text-subtle); }
h4 small { letter-spacing: 0; text-transform: none; font-weight: 400; }
.bosh { margin: 0; font-size: 13px; color: var(--text-subtle); }
table { width: 100%; border-collapse: collapse; font: 12.5px var(--font-mono); }
th { text-align: left; font: 600 10.5px var(--font-mono); color: var(--text-subtle); padding: 4px 6px; border-bottom: 1px solid var(--border); }
td { padding: 5px 6px; border-bottom: 1px solid var(--border); white-space: nowrap; }
tr { cursor: pointer; }
tbody tr:hover { background: var(--bg-sunken); }
tr.on { background: color-mix(in srgb, var(--accent) 9%, transparent); }
.m { color: var(--accent-text); font-weight: 600; }
.y { max-width: 260px; overflow: hidden; text-overflow: ellipsis; }
.r { color: #2563eb; }
i { font-style: normal; color: var(--text-subtle); }
.s { padding: 1px 6px; border-radius: 5px; font-weight: 700; }
.s.ok { color: #15803d; background: color-mix(in srgb, #16a34a 12%, transparent); }
.s.yonalish { color: #2563eb; background: color-mix(in srgb, #2563eb 12%, transparent); }
.s.mijoz { color: #b45309; background: color-mix(in srgb, #d97706 14%, transparent); }
.s.server, .s.xato { color: #dc2626; background: color-mix(in srgb, #dc2626 12%, transparent); }
</style>
