<script setup>
// Boshqaruv paneli: har tugma VM'dagi haqiqiy RabbitMQ'da amal bajaradi (rmq-boshqaruv → HTTP API yoki AMQP).
// Xato bo'lsa — RabbitMQ'ning o'z xabari ko'rsatiladi (masalan, PRECONDITION_FAILED).
import { computed, reactive, ref } from 'vue'

const props = defineProps({
  holat: { type: Object, required: true },
  buyruq: { type: Function, required: true },
})

const BOLIMLAR = [
  ['yubor', 'Yuborish'], ['navbat', 'Navbat'], ['exchange', 'Exchange'], ['bog', "Bog'lash"], ['consumer', 'Consumer'], ['policy', 'Policy'],
]
const bolim = ref('yubor')
const xabar = ref(null)   // { ok, matn }
const band = ref(false)

const ex = reactive({ nom: 'buyurtmalar', tur: 'direct', durable: true })
const nv = reactive({ nom: 'ishlar', tur: 'classic', durable: true, ttl: '', maxLen: '', overflow: '', dlx: '', dlk: '', deliveryLimit: '' })
const bog = reactive({ exchange: '', navbat: '', kalit: '' })
const yub = reactive({ exchange: '', kalit: 'ishlar', tana: 'salom', soni: 1, persistent: true, ttl: '' })
const con = reactive({ navbat: '', prefetch: 1, avtoAck: false, kechikish: 300, xulq: 'ack' })
const pol = reactive({ nom: 'dlx-hammasi', pattern: '^ishlar$', dlx: 'xatolar', maxLen: '', ttl: '' })

const exNomlar = computed(() => props.holat.exchangelar.map((e) => e.nom))
const nvNomlar = computed(() => props.holat.navbatlar.map((n) => n.nom))
const exKorinish = (n) => (n === '' ? '(default) ""' : n)

async function bajar(op, maydonlar, matn) {
  band.value = true
  xabar.value = null
  try {
    const j = await props.buyruq(op, maydonlar)
    xabar.value = { ok: true, matn: typeof matn === 'function' ? matn(j) : matn }
  } catch (e) {
    xabar.value = { ok: false, matn: e.message }
  } finally {
    band.value = false
  }
}

function navbatArg() {
  const a = { 'x-queue-type': nv.tur }
  if (nv.ttl !== '') a['x-message-ttl'] = Number(nv.ttl)
  if (nv.maxLen !== '') a['x-max-length'] = Number(nv.maxLen)
  if (nv.overflow) a['x-overflow'] = nv.overflow
  if (nv.dlx !== '') a['x-dead-letter-exchange'] = nv.dlx === '(default)' ? '' : nv.dlx
  if (nv.dlk !== '') a['x-dead-letter-routing-key'] = nv.dlk
  if (nv.deliveryLimit !== '' && nv.tur === 'quorum') a['x-delivery-limit'] = Number(nv.deliveryLimit)
  return a
}

const yuborish = () => bajar('publish', {
  exchange: yub.exchange, kalit: yub.kalit, tana: yub.tana, soni: yub.soni,
  xossalar: { delivery_mode: yub.persistent ? 2 : 1, ...(yub.ttl !== '' ? { expiration: String(yub.ttl) } : {}) },
}, (j) => j.routed ? `Yuborildi: ${yub.soni} ta — navbatga yo'naltirildi` : "Yuborildi, lekin hech bir navbatga yo'naltirilmadi (routed: false) — xabar yo'qoldi")
const navbatYarat = () => bajar('queue.declare', { nom: nv.nom, durable: nv.durable, args: navbatArg() }, `Navbat "${nv.nom}" e'lon qilindi`)
const exchangeYarat = () => bajar('exchange.declare', { nom: ex.nom, tur: ex.tur, durable: ex.durable }, `Exchange "${ex.nom}" (${ex.tur}) e'lon qilindi`)
const boglash = () => bajar('bind', { exchange: bog.exchange, navbat: bog.navbat, kalit: bog.kalit }, `"${bog.exchange}" → "${bog.navbat}" (kalit: "${bog.kalit}")`)
const consumerBoshla = () => bajar('consumer.start', {
  navbat: con.navbat, prefetch: con.prefetch, avto_ack: con.avtoAck, kechikish_ms: con.kechikish, xulq: con.xulq,
}, (j) => `Consumer ${j.consumer} "${con.navbat}" ga ulandi`)
const policyQoy = () => {
  const d = {}
  if (pol.dlx !== '') d['dead-letter-exchange'] = pol.dlx
  if (pol.maxLen !== '') d['max-length'] = Number(pol.maxLen)
  if (pol.ttl !== '') d['message-ttl'] = Number(pol.ttl)
  return bajar('policy.set', { nom: pol.nom, pattern: pol.pattern, "ta'rif": d }, `Policy "${pol.nom}" qo'yildi`)
}
const ochir = (op, maydonlar, matn) => bajar(op, maydonlar, matn)
</script>

<template>
    <div class="panel">
        <nav class="tablar">
            <button v-for="[k, t] in BOLIMLAR" :key="k" type="button" :class="{ on: bolim === k }" @click="bolim = k">{{ t }}</button>
        </nav>

        <form v-if="bolim === 'yubor'" @submit.prevent="yuborish">
            <label>Exchange
                <select v-model="yub.exchange"><option v-for="n in exNomlar" :key="n" :value="n">{{ exKorinish(n) }}</option></select>
            </label>
            <label>Routing key <input v-model="yub.kalit" /></label>
            <label>Xabar matni <input v-model="yub.tana" /></label>
            <div class="qator">
                <label>Soni <input v-model.number="yub.soni" type="number" min="1" max="200" /></label>
                <label>TTL, ms <input v-model="yub.ttl" placeholder="yo'q" /></label>
            </div>
            <label class="belgi"><input v-model="yub.persistent" type="checkbox" /> persistent (delivery_mode 2)</label>
            <button class="asosiy" :disabled="band">Yuborish</button>
            <p class="izoh">Default exchange (<code>""</code>) xabarni nomi routing key'ga teng navbatga beradi.</p>
        </form>

        <form v-else-if="bolim === 'navbat'" @submit.prevent="navbatYarat">
            <label>Nomi <input v-model="nv.nom" required /></label>
            <label>Turi
                <select v-model="nv.tur"><option>classic</option><option>quorum</option><option>stream</option></select>
            </label>
            <div class="qator">
                <label>x-message-ttl, ms <input v-model="nv.ttl" placeholder="yo'q" /></label>
                <label>x-max-length <input v-model="nv.maxLen" placeholder="yo'q" /></label>
            </div>
            <label>x-overflow
                <select v-model="nv.overflow"><option value="">standart (drop-head)</option><option>reject-publish</option><option>reject-publish-dlx</option></select>
            </label>
            <div class="qator">
                <label>DLX <input v-model="nv.dlx" placeholder="yo'q" list="exlar" /></label>
                <label>DL routing key <input v-model="nv.dlk" placeholder="asl kalit" /></label>
            </div>
            <label v-if="nv.tur === 'quorum'">x-delivery-limit <input v-model="nv.deliveryLimit" placeholder="standart 20" /></label>
            <label class="belgi"><input v-model="nv.durable" type="checkbox" /> durable</label>
            <button class="asosiy" :disabled="band">E'lon qilish</button>
            <datalist id="exlar"><option v-for="n in exNomlar" :key="n" :value="n" /></datalist>
        </form>

        <form v-else-if="bolim === 'exchange'" @submit.prevent="exchangeYarat">
            <label>Nomi <input v-model="ex.nom" required /></label>
            <label>Turi
                <select v-model="ex.tur"><option>direct</option><option>fanout</option><option>topic</option><option>headers</option></select>
            </label>
            <label class="belgi"><input v-model="ex.durable" type="checkbox" /> durable</label>
            <button class="asosiy" :disabled="band">E'lon qilish</button>
        </form>

        <form v-else-if="bolim === 'bog'" @submit.prevent="boglash">
            <label>Exchange
                <select v-model="bog.exchange" required><option v-for="n in exNomlar.filter((n) => n)" :key="n">{{ n }}</option></select>
            </label>
            <label>Navbat
                <select v-model="bog.navbat" required><option v-for="n in nvNomlar" :key="n">{{ n }}</option></select>
            </label>
            <label>Binding key <input v-model="bog.kalit" placeholder="topic: buyurtma.* yoki #" /></label>
            <button class="asosiy" :disabled="band">Bog'lash</button>
        </form>

        <form v-else-if="bolim === 'consumer'" @submit.prevent="consumerBoshla">
            <label>Navbat
                <select v-model="con.navbat" required><option v-for="n in nvNomlar" :key="n">{{ n }}</option></select>
            </label>
            <div class="qator">
                <label>Prefetch <input v-model.number="con.prefetch" type="number" min="0" /></label>
                <label>Ishlov, ms <input v-model.number="con.kechikish" type="number" min="0" step="100" /></label>
            </div>
            <label class="belgi"><input v-model="con.avtoAck" type="checkbox" /> avtomatik tasdiq (auto-ack)</label>
            <label v-if="!con.avtoAck">Xabarni ishlagach
                <select v-model="con.xulq">
                    <option value="ack">ack — tasdiqlash</option>
                    <option value="nack">nack, requeue — navbatga qaytarish</option>
                    <option value="reject">reject — rad etish (DLX bo'lsa — o'sha yerga)</option>
                    <option value="crash">o'lish — tasdiqlamay ulanishni uzish</option>
                </select>
            </label>
            <button class="asosiy" :disabled="band">Consumer qo'shish</button>
        </form>

        <form v-else-if="bolim === 'policy'" @submit.prevent="policyQoy">
            <label>Nomi <input v-model="pol.nom" required /></label>
            <label>Pattern (regex) <input v-model="pol.pattern" required /></label>
            <div class="qator">
                <label>dead-letter-exchange <input v-model="pol.dlx" placeholder="yo'q" list="exlar" /></label>
                <label>max-length <input v-model="pol.maxLen" placeholder="yo'q" /></label>
            </div>
            <label>message-ttl, ms <input v-model="pol.ttl" placeholder="yo'q" /></label>
            <button class="asosiy" :disabled="band">Qo'yish</button>
            <datalist id="exlar"><option v-for="n in exNomlar" :key="n" :value="n" /></datalist>
        </form>

        <p v-if="xabar" class="natija" :class="{ xato: !xabar.ok }">{{ xabar.matn }}</p>

        <details class="royxat">
            <summary>O'chirish va tozalash</summary>
            <ul>
                <li v-for="n in holat.navbatlar" :key="'q' + n.nom">
                    navbat <b>{{ n.nom }}</b>
                    <button type="button" @click="ochir('queue.purge', { nom: n.nom }, `&quot;${n.nom}&quot; tozalandi`)">purge</button>
                    <button type="button" @click="ochir('queue.delete', { nom: n.nom }, `&quot;${n.nom}&quot; o'chirildi`)">o'chirish</button>
                </li>
                <li v-for="e in holat.exchangelar.filter((e) => e.nom && !e.nom.startsWith('amq.'))" :key="'e' + e.nom">
                    exchange <b>{{ e.nom }}</b>
                    <button type="button" @click="ochir('exchange.delete', { nom: e.nom }, `&quot;${e.nom}&quot; o'chirildi`)">o'chirish</button>
                </li>
                <li v-for="c in holat.consumerlar" :key="'c' + c.id">
                    consumer <b>{{ c.id }}</b> ({{ c.navbat }})
                    <button type="button" @click="ochir('consumer.stop', { consumer: c.id }, `${c.id} to'xtatildi`)">to'xtatish</button>
                </li>
            </ul>
            <button type="button" class="tozala" @click="ochir('tozala', {}, 'Hammasi tozalandi')">Hammasini tozalash</button>
        </details>
    </div>
</template>

<style scoped>
.panel { display: grid; gap: 10px; font-size: 13px; }
.tablar { display: flex; flex-wrap: wrap; gap: 4px; }
.tablar button { padding: 5px 9px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text-muted); font: inherit; cursor: pointer; }
.tablar button.on { border-color: var(--accent); color: var(--accent-text); background: color-mix(in srgb, var(--accent) 10%, var(--bg-elevated)); }
form { display: grid; gap: 8px; }
label { display: grid; gap: 3px; color: var(--text-muted); }
label.belgi { display: flex; gap: 6px; align-items: center; }
.qator { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
input:not([type=checkbox]), select { padding: 5px 7px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font: 13px var(--font-sans); min-width: 0; }
.asosiy { justify-self: start; padding: 6px 14px; border: 0; border-radius: var(--radius-sm); background: var(--accent); color: var(--bg-elevated); font: inherit; font-weight: 600; cursor: pointer; }
.asosiy:disabled { opacity: .6; }
.izoh { margin: 0; color: var(--text-subtle); font-size: 12px; }
.izoh code { font: 12px var(--font-mono); }
.natija { margin: 0; padding: 7px 10px; border-radius: var(--radius-sm); background: var(--success-soft); }
.natija.xato { background: color-mix(in srgb, var(--danger, #d1495b) 14%, var(--bg-elevated)); }
.royxat summary { cursor: pointer; color: var(--text-muted); }
.royxat ul { margin: 6px 0; padding: 0; list-style: none; display: grid; gap: 4px; }
.royxat li { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.royxat button { padding: 2px 8px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font: 12px var(--font-sans); cursor: pointer; }
.tozala { margin-top: 4px; }
</style>
