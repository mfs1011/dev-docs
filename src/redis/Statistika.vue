<script setup>
// Server ko'rsatkichlari (INFO): xotira va maxmemory, hit/miss (kesh samaradorligi), muddati tugagan va evict qilingan
// kalitlar, buyruqlar soni. Hammasi sahifa ochilgandan emas — Redis ishga tushgandan (yoki CONFIG RESETSTAT'dan) beri.
import { computed } from 'vue'

const props = defineProps({ info: { type: Object, required: true } })
const i = computed(() => props.info ?? {})
const hitFoiz = computed(() => {
  const h = i.value.keyspace_hits ?? 0, m = i.value.keyspace_misses ?? 0
  return h + m ? Math.round((h / (h + m)) * 100) : null
})
const xotiraFoiz = computed(() => (i.value.maxmemory ? Math.min(100, (i.value.used_memory / i.value.maxmemory) * 100) : 0))
</script>

<template>
    <div class="stat">
        <h4>Server · INFO</h4>
        <div class="qator">
            <span>Xotira</span>
            <b>{{ i.used_memory_human }} / {{ i.maxmemory_human || '∞' }}</b>
        </div>
        <div class="chiziq"><i :style="{ width: xotiraFoiz + '%' }" :class="{ toliq: xotiraFoiz > 90 }" /></div>
        <div class="qator"><span>maxmemory-policy</span><code>{{ i.maxmemory_policy }}</code></div>
        <div class="kartalar">
            <div><b class="ok">{{ i.keyspace_hits ?? 0 }}</b><small>hit (topildi)</small></div>
            <div><b class="miss">{{ i.keyspace_misses ?? 0 }}</b><small>miss (yo‘q)</small></div>
            <div><b>{{ hitFoiz == null ? '—' : hitFoiz + '%' }}</b><small>hit ulushi</small></div>
            <div><b class="sariq">{{ i.expired_keys ?? 0 }}</b><small>muddati tugagan</small></div>
            <div><b class="qizil">{{ i.evicted_keys ?? 0 }}</b><small>evict qilingan</small></div>
            <div><b>{{ i.total_commands_processed ?? 0 }}</b><small>buyruq</small></div>
        </div>
        <p class="izoh">hit/miss — o‘qish buyruqlari (GET, HGET …) kalitni topdimi. Kesh qanchalik foydali ekanini shu ko‘rsatadi.</p>
    </div>
</template>

<style scoped>
h4 { margin: 0 0 8px; font: 600 11px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--text-subtle); }
.qator { display: flex; justify-content: space-between; gap: 8px; font-size: 12.5px; color: var(--text-muted); margin-top: 4px; }
.qator b, .qator code { font: 600 12px var(--font-mono); color: var(--text); }
.chiziq { height: 8px; border-radius: 4px; background: var(--bg-sunken); overflow: hidden; margin: 5px 0 6px; }
.chiziq i { display: block; height: 100%; background: var(--accent); transition: width .4s; }
.chiziq i.toliq { background: var(--danger, #dc2626); }
.kartalar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
.kartalar div { display: grid; padding: 7px 8px; border-radius: 9px; background: var(--bg-sunken); border: 1px solid var(--border); }
.kartalar b { font: 700 17px var(--font-mono); }
.kartalar small { font: 600 9.5px var(--font-mono); color: var(--text-subtle); text-transform: uppercase; }
.ok { color: var(--success); } .miss { color: #d97706; } .sariq { color: #d97706; } .qizil { color: var(--danger, #dc2626); }
.izoh { margin: 8px 0 0; font-size: 11.5px; color: var(--text-subtle); }
</style>
