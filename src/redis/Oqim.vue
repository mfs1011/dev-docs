<script setup>
// Buyruqlar oqimi: serverga kelgan har buyruq (MONITOR — terminaldagi redis-cli'dan ham), keyspace hodisalari va
// Pub/Sub xabarlari; har buyruq yonida qisqa izoh.
import { HODISA_IZOH, IZOH, buyruqNomi } from '@/redis/izohlar'

defineProps({ jurnal: { type: Array, required: true } })
const soat = (t) => new Date(t).toLocaleTimeString('uz', { hour12: false })
</script>

<template>
    <div class="oqim">
        <h4>Buyruqlar oqimi <small>— MONITOR: serverga kelgan har buyruq (terminaldan ham)</small></h4>
        <p v-if="!jurnal.length" class="bosh">Hali buyruq yo‘q.</p>
        <ol>
            <li v-for="(x, i) in jurnal" :key="x.vaqt + '-' + i" :class="x.t">
                <time>{{ soat(x.vaqt) }}</time>
                <template v-if="x.t === 'buyruq'">
                    <span class="mijoz" :class="{ lua: x.lua }">{{ x.lua ? 'lua' : x.mijoz }}</span>
                    <div>
                        <code>{{ x.qator }}</code>
                        <p v-if="IZOH[buyruqNomi(x)]">{{ IZOH[buyruqNomi(x)] }}</p>
                    </div>
                </template>
                <template v-else-if="x.t === 'hodisa'">
                    <span class="mijoz hodisa">hodisa</span>
                    <div><code>{{ x.tur }} · {{ x.kalit }}</code><p v-if="HODISA_IZOH[x.tur]">{{ HODISA_IZOH[x.tur] }}</p></div>
                </template>
                <template v-else-if="x.t === 'pubsub'">
                    <span class="mijoz pubsub">pub/sub</span>
                    <div><code>{{ x.obunachi }} ← {{ x.kanal }}{{ x.naqsh ? ` (${x.naqsh})` : '' }}: {{ x.xabar }}</code></div>
                </template>
                <template v-else-if="x.t === 'tashlandi'">
                    <span class="mijoz">…</span>
                    <div><p>yana {{ x.soni }} ta {{ x.tur === 'hodisa' ? 'hodisa' : 'buyruq' }} — ko‘pligi uchun ko‘rsatilmadi</p></div>
                </template>
                <template v-else>
                    <span class="mijoz hodisa">xato</span><div><p>{{ x.xato }}</p></div>
                </template>
            </li>
        </ol>
    </div>
</template>

<style scoped>
h4 { margin: 0 0 8px; font: 600 11px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--text-subtle); }
h4 small { letter-spacing: 0; text-transform: none; font-weight: 400; }
.bosh { margin: 0; font-size: 13px; color: var(--text-subtle); }
ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
li { display: grid; grid-template-columns: 62px 70px 1fr; gap: 8px; padding: 4px 6px; border-radius: 6px; align-items: start; }
li:first-child { background: color-mix(in srgb, var(--accent) 7%, transparent); }
time { font: 11px var(--font-mono); color: var(--text-subtle); padding-top: 2px; }
.mijoz { justify-self: start; font: 600 10.5px var(--font-mono); padding: 1px 6px; border-radius: 5px; background: var(--bg-sunken); color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; max-width: 100%; white-space: nowrap; }
.mijoz.lua { color: #7c3aed; }
.mijoz.hodisa { background: color-mix(in srgb, #d97706 14%, transparent); color: #b45309; }
.mijoz.pubsub { background: color-mix(in srgb, #0d9488 14%, transparent); color: #0d9488; }
code { font: 12.5px var(--font-mono); overflow-wrap: anywhere; }
p { margin: 1px 0 0; font-size: 12px; color: var(--text-subtle); line-height: 1.4; }
</style>
