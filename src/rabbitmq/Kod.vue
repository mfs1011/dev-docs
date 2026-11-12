<script setup>
// Kod · real misol: hozirgi sozlamalar (exchange, turi, routing key/header'lar, body, ack) bo'yicha Python (pika) kodi.
// Exchange/navbat argumentlari brokerdagi haqiqiy qiymatlardan olinadi (aks holda PRECONDITION_FAILED).
// "Terminalda ishlatish" kodni VM'dagi faylga yozib, python3 bilan ishga tushiradi — shu brokerda.
import { computed, ref } from 'vue'
import { headerlarniOqi } from '@/rabbitmq/namuna'

const props = defineProps({
  soz: { type: Object, required: true },
  holat: { type: Object, required: true },
})
const emit = defineEmits(['ishlat'])
const qism = ref('producer')
const nusxalandi = ref(false)

function py(v) {
  if (v === null || v === undefined) return 'None'
  if (v === true) return 'True'
  if (v === false) return 'False'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'string') return JSON.stringify(v)
  if (Array.isArray(v)) return `[${v.map(py).join(', ')}]`
  return `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${py(x)}`).join(', ')}}`
}

const ex = computed(() => props.holat.exchangelar.find((e) => e.nom === props.soz.exchange))
const tur = computed(() => ex.value?.tur ?? 'direct')
const navbat = computed(() => {
  const b = props.holat.boglanishlar.find((x) => x.exchange === props.soz.exchange)
  return props.holat.navbatlar.find((n) => n.nom === b?.navbat) ?? props.holat.navbatlar[0] ?? null
})
const bog = computed(() => props.holat.boglanishlar.find((x) => x.exchange === props.soz.exchange && x.navbat === navbat.value?.nom))

const exDeclare = computed(() => {
  if (!props.soz.exchange) return '# default exchange ("") — e’lon qilinmaydi, har navbat unga o‘z nomi bilan bog‘langan'
  const args = ex.value?.args && Object.keys(ex.value.args).length ? `,\n    arguments=${py(ex.value.args)},` : ''
  return `ch.exchange_declare(\n    exchange=${py(props.soz.exchange)},\n    exchange_type=${py(tur.value)},\n    durable=True${args ? args : ','}\n)`
})

const producer = computed(() => {
  const h = tur.value === 'headers' ? headerlarniOqi(props.soz.headers) : null
  const kalit = tur.value === 'headers' ? '' : props.soz.kalit
  return `import pika

conn = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
ch = conn.channel()

${exDeclare.value}

ch.basic_publish(
    exchange=${py(props.soz.exchange)},
    routing_key=${py(kalit)},${tur.value === 'fanout' ? '   # fanout kalitga qaramaydi' : ''}
    body=${py(props.soz.tana)}.encode(),
    properties=pika.BasicProperties(
        delivery_mode=${props.soz.persistent ? '2,   # persistent: diskka yoziladi' : '1,   # non-persistent: faqat xotirada'}
        app_id=${py(props.soz.ilova)},${h ? `\n        headers=${py(h)},` : ''}
    ),
)
print("Yuborildi")
conn.close()
`
})

const consumer = computed(() => {
  const n = navbat.value
  if (!n) return '# Avval navbat yarating (tepada “+ Qo‘shish” yoki “Namuna topologiya”).\n'
  const qargs = n.args && Object.keys(n.args).length ? `, arguments=${py(n.args)}` : ''
  const auto = props.soz.ack === 'auto'
  const bind = props.soz.exchange && bog.value
    ? `ch.queue_bind(queue=${py(n.nom)}, exchange=${py(props.soz.exchange)}, ${tur.value === 'headers' ? `arguments=${py(bog.value.args)}` : `routing_key=${py(bog.value.kalit)}`})\n`
    : ''
  return `import pika

conn = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
ch = conn.channel()

ch.queue_declare(queue=${py(n.nom)}, durable=True${qargs})
${bind}ch.basic_qos(prefetch_count=1)   # bir vaqtda faqat 1 ta tasdiqlanmagan xabar

def ishlov(ch, method, properties, body):
    print("Qabul qilindi:", body.decode(), "| redelivered:", method.redelivered)
${auto ? '    # auto_ack=True: broker xabarni yetkazgan zahoti o‘chirgan' : '    ch.basic_ack(delivery_tag=method.delivery_tag)   # ack — endi o‘chiriladi'}

ch.basic_consume(queue=${py(n.nom)}, on_message_callback=ishlov, auto_ack=${auto ? 'True' : 'False'})
print("Kutilmoqda… (Ctrl+C — to‘xtatish)")
ch.start_consuming()
`
})

const kod = computed(() => (qism.value === 'producer' ? producer.value : consumer.value))

async function nusxa() {
  try { await navigator.clipboard.writeText(kod.value); nusxalandi.value = true; setTimeout(() => { nusxalandi.value = false }, 1500) } catch { /* ruxsat bo'lmasa */ }
}
function ishlat() {
  const fayl = `/root/${qism.value}.py`
  emit('ishlat', `cat > ${fayl} <<'KOD'\n${kod.value}KOD\npython3 ${fayl}\n`)
}
</script>

<template>
    <div class="kod">
        <div class="bosh">
            <h4>Kod · real misol <small>Python (pika)</small></h4>
            <div class="seg">
                <button type="button" :class="{ on: qism === 'producer' }" @click="qism = 'producer'">Producer</button>
                <button type="button" :class="{ on: qism === 'consumer' }" @click="qism = 'consumer'">Consumer</button>
            </div>
            <button type="button" class="t" @click="nusxa">{{ nusxalandi ? '✓ Nusxalandi' : '⧉ Nusxa' }}</button>
            <button type="button" class="t asosiy" title="Kodni VM'dagi faylga yozib, python3 bilan shu brokerda ishga tushiradi" @click="ishlat">▶ Terminalda ishlatish</button>
        </div>
        <pre><code>{{ kod }}</code></pre>
        <p class="izoh">Tepadagi sozlamalarni o‘zgartiring — kod o‘zi yangilanadi. Exchange va navbat argumentlari brokerdagi haqiqiy qiymatlardan olinadi.</p>
    </div>
</template>

<style scoped>
.bosh { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px; }
h4 { margin: 0 auto 0 0; font: 600 11px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--text-subtle); }
h4 small { letter-spacing: 0; text-transform: none; font-weight: 400; margin-left: 4px; }
.seg { display: inline-flex; padding: 3px; gap: 2px; border-radius: 10px; background: var(--bg-sunken); border: 1px solid var(--border); }
.seg button { padding: 4px 10px; border: 0; border-radius: 7px; background: none; color: var(--text-muted); font: 500 12.5px var(--font-sans); cursor: pointer; }
.seg button.on { background: var(--accent); color: #fff; }
.t { padding: 5px 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-elevated); color: var(--text); font: 12px var(--font-mono); cursor: pointer; }
.t.asosiy { border-color: var(--accent); color: var(--accent-text); }
pre { margin: 0; padding: 12px 14px; border-radius: 10px; background: var(--code-bg); color: #d7dde8; font: 12.5px/1.55 var(--font-mono); overflow: auto; max-height: 380px; }
.izoh { margin: 8px 0 0; font-size: 12px; color: var(--text-subtle); }
</style>
