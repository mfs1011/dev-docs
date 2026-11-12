<script setup>
// Jarayon qadamlari: brokerdan kelgan hodisalarni (firehose publish, consumer ishlovi) oddiy tilda tushuntiradi.
// Eng yangisi tepada. Faqat haqiqiy hodisalar — taxmin yo'q.
import { computed } from 'vue'

const props = defineProps({
  jurnal: { type: Array, required: true },
  holat: { type: Object, required: true },
})

const exNomi = (n) => (n === '' || n == null ? '(default)' : n)
const exTur = (nom) => props.holat.exchangelar.find((e) => e.nom === nom)?.tur
const ae = (nom) => props.holat.exchangelar.find((e) => e.nom === nom)?.args?.['alternate-exchange']
const dlxi = (q) => { const n = props.holat.navbatlar.find((x) => x.nom === q); return n?.args?.['x-dead-letter-exchange'] ?? n?.policy?.['dead-letter-exchange'] }

const SABAB = {
  '': 'default exchange: routing key = navbat nomi',
  direct: 'direct: binding key routing key bilan aynan teng',
  fanout: 'fanout: kalitga qaramay, har bog‘langan navbatga nusxa',
  topic: 'topic: binding andozasi (* yoki #) routing key’ga mos',
  headers: 'headers: xabar header’lari binding argumentlariga mos',
}

function qadam(x) {
  if (x.t === 'oqim' && x.tur === 'publish') {
    const ex = x.nom ?? '', qlar = x.navbatlar ?? [], k = (x.kalitlar ?? []).join(', ') || '∅'
    const tur = ex === '' ? '' : exTur(ex)
    const boglangan = qlar.filter((q) => ex === '' || props.holat.boglanishlar.some((b) => b.exchange === ex && b.navbat === q))
    const aeOrqali = qlar.filter((q) => !boglangan.includes(q))
    const sarlavha = `${x.ilova ?? 'Terminal / panel'} → ${exNomi(ex)}${tur ? ` (${tur})` : ''} · key ${k}`
    const qatorlar = []
    if (boglangan.length) qatorlar.push({ m: `${SABAB[tur] ?? ''} → ${boglangan.join(', ')}`, s: 'ok' })
    if (aeOrqali.length) qatorlar.push({ m: `hech bir binding mos kelmadi → alternate-exchange ${ae(ex) ?? ''} → ${aeOrqali.join(', ')}`, s: 'xato' })
    if (!qlar.length) qatorlar.push({ m: 'hech bir binding mos kelmadi — xabar yo‘qoldi (routed: false). Oldini olish: alternate-exchange yoki mandatory flag.', s: 'xato' })
    const teg = [x.persistent ? 'persistent' : 'non-persistent', x.sinov === 'xato' ? 'test: ishlov xato' : x.sinov === 'poison' ? 'test: poison' : ''].filter(Boolean)
    return { ikon: '➜', sarlavha, qatorlar, teg, tana: x.tana }
  }
  if (x.t === 'ishlov') {
    const q = x.navbat, c = x.consumer
    const d = dlxi(q)
    const M = {
      ack: [`${c} xabarni ishladi va ack yubordi — xabar navbatdan o‘chirildi`, 'ok'],
      auto: [`${c}: auto-ack — xabar yetkazilgan zahoti o‘chirildi (ishlov natijasi ahamiyatsiz)`, 'ok'],
      nack: [`${c}: ishlov xatosi → basic.nack(requeue) — xabar navbatga qaytdi va qayta yetkaziladi (redelivered)`, 'qayt'],
      reject: [`${c}: basic.reject(requeue=false) → ${d != null ? `DLX ${exNomi(d)} → o‘lik xatlar navbati` : 'DLX yo‘q — xabar o‘chirildi'}`, 'xato'],
      crash: [`${c} ack’siz o‘ldi — ulanish uzildi, xabar navbatga qaytdi`, 'xato'],
    }
    const [m, s] = M[x.xulq] ?? [`${c}: ${x.xulq}`, 'ok']
    return { ikon: '⤓', sarlavha: `${q} → ${c}${x.redelivered ? ' (qayta yetkazildi)' : ''}`, qatorlar: [{ m, s }], teg: [], tana: x.tana }
  }
  if (x.t === 'consumer-xato') return { ikon: '!', sarlavha: x.consumer, qatorlar: [{ m: x.xato, s: 'xato' }], teg: [] }
  return null
}

const qadamlar = computed(() => props.jurnal.filter((x) => x.t !== 'oqim' || x.tur === 'publish').slice(0, 9)
  .map((x) => ({ ...qadam(x), vaqt: x.vaqt })).filter((x) => x.sarlavha))
const soat = (t) => new Date(t).toLocaleTimeString('uz', { hour12: false })
</script>

<template>
    <div class="jarayon">
        <h4>Jarayon qadamlari</h4>
        <p v-if="!qadamlar.length" class="bosh"><span class="i">i</span> Producer kartasidagi <b>▶ yubor</b> yoki tepadagi <b>Yubor</b> tugmasini bosing — har qadam shu yerda tushuntiriladi.</p>
        <ol>
            <li v-for="(q, i) in qadamlar" :key="q.vaqt + '-' + i" :class="{ yangi: i === 0 }">
                <span class="ikon">{{ q.ikon }}</span>
                <div>
                    <div class="sar"><b>{{ q.sarlavha }}</b> <time>{{ soat(q.vaqt) }}</time></div>
                    <p v-for="(r, j) in q.qatorlar" :key="j" :class="r.s">{{ r.m }}</p>
                    <div v-if="q.teg.length || q.tana" class="teglar">
                        <span v-for="t in q.teg" :key="t">{{ t }}</span>
                        <q v-if="q.tana">{{ q.tana }}</q>
                    </div>
                </div>
            </li>
        </ol>
    </div>
</template>

<style scoped>
.jarayon { --ok: var(--success); --xato: var(--danger, #dc2626); --qayt: #d97706; }
h4 { margin: 0 0 10px; font: 600 11px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--text-subtle); }
.bosh { margin: 0; font-size: 13px; color: var(--text-muted); }
.i { display: inline-grid; place-items: center; width: 16px; height: 16px; border-radius: 4px; background: color-mix(in srgb, #7c3aed 15%, transparent); color: #7c3aed; font: 700 11px var(--font-mono); margin-right: 4px; }
ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
li { display: grid; grid-template-columns: 26px 1fr; gap: 8px; opacity: .72; }
li.yangi { opacity: 1; }
.ikon { width: 24px; height: 24px; display: grid; place-items: center; border-radius: 7px; background: var(--bg-sunken); color: var(--text-muted); font-size: 12px; }
li.yangi .ikon { background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent-text); }
.sar { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; }
.sar b { font-weight: 600; overflow-wrap: anywhere; }
time { font: 11px var(--font-mono); color: var(--text-subtle); white-space: nowrap; }
p { margin: 2px 0 0; font-size: 12.5px; line-height: 1.45; color: var(--text-muted); }
p.ok { color: var(--ok); } p.xato { color: var(--xato); } p.qayt { color: var(--qayt); }
.teglar { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; align-items: center; }
.teglar span { font: 10.5px var(--font-mono); padding: 1px 6px; border-radius: 5px; background: var(--bg-sunken); color: var(--text-muted); }
.teglar q { font: 11px var(--font-mono); color: var(--text-subtle); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
</style>
