// "Nima bo'ldi?" — daemon hodisalarini yangi boshlovchi uchun oddiy tilga o'girish.
// Metaforalar: image — javondagi qolip (o'zgarmaydi), konteyner — qolipdan quyilgan quti (ustida o'z yozuv qatlami),
// volume — ombor (konteyner o'chsa ham qoladi), port — host devoridagi eshik.
import { hajm } from './birlik.js'

const KOD = {
  0: 'ishini muvaffaqiyatli tugatdi (kod 0)',
  1: 'xato bilan tugadi (kod 1)',
  2: 'noto‘g‘ri ishlatildi (kod 2)',
  125: 'Docker o‘zi konteynerni ishga tushira olmadi (kod 125)',
  126: 'buyruq bajarilmaydi — masalan, u papka (kod 126)',
  127: 'buyruq topilmadi (kod 127)',
  130: 'Ctrl+C (SIGINT) bilan to‘xtadi: 128 + 2 = 130',
  137: 'SIGKILL bilan majburan o‘ldirildi: 128 + 9 = 137',
  143: 'SIGTERM bilan to‘xtadi: 128 + 15 = 143',
}
export const kodIzoh = (k) => KOD[k] ?? `kod ${k} bilan tugadi`

export function hikoyaYarat(d) {
  return (h) => {
    const k = h.tur === 'container' ? d.konteynerlar.get(h.id) ?? h.k : null
    const nom = (x) => `\`${x}\``
    switch (`${h.tur}:${h.amal}`) {
      case 'image:pull': {
        const im = d.imagelar.get(h.id)
        return { ikon: '📦', matn: `${nom(h.nom)} image'i Docker Hub'dan yuklandi va javonga qo‘yildi: ${im.kat.qatlamlar.length} ta qatlam, diskda ${hajm(im.kat.disk, 3)}.`, tur: 'image' }
      }
      case 'image:tag': return { ikon: '🏷', matn: `Shu image'ga yangi nom (teg) qo‘shildi: ${nom(h.nom)}. Image bitta — nomlar ikkita.`, tur: 'image' }
      case 'image:untag': return { ikon: '🏷', matn: `${nom(h.nom)} nomi olib tashlandi. Image boshqa nomlar bilan qolgan bo‘lsa — diskdan o‘chmaydi.`, tur: 'image' }
      case 'image:delete': return { ikon: '🗑', matn: `Image javondan olib tashlandi (${h.id.slice(7, 19)}).`, tur: 'image' }
      case 'container:create': return { ikon: '🧱', matn: `${nom(h.nom)} konteyneri ${nom(k?.image ?? '')} image'idan yaratildi: image qatlamlari faqat o‘qish uchun, ustiga konteynerning o‘z yupqa yozuv qatlami qo‘shildi.`, tur: 'container', id: h.id }
      case 'container:start': {
        const ip = [...(k?.tarmoqlar.values() ?? [])].map((u) => u.ip).filter(Boolean)
        const portlar = (k?.portBerildi ?? []).filter((b) => b.ip !== '::').map((b) => `host ${b.ip === '0.0.0.0' ? 'barcha manzillar' : b.ip}:${b.tashqi} → konteyner ${b.ichki}`)
        let m = `${nom(h.nom)} ishga tushdi. Asosiy jarayon (PID 1): ${nom([...(k?.config.entrypoint ?? []), ...(k?.config.cmd ?? [])].join(' '))}.`
        if (ip.length) m += ` IP: ${ip.join(', ')}.`
        if (portlar.length) m += ` Eshik ochildi: ${portlar.join('; ')}.`
        return { ikon: '▶', matn: m, tur: 'container', id: h.id }
      }
      case 'container:die': return { ikon: h.kod === 0 ? '⏹' : '⛔', matn: `${nom(h.nom)} to‘xtadi — asosiy jarayon ${kodIzoh(h.kod)}. Konteyner o‘chmadi: yozuv qatlami saqlanib turibdi (docker start bilan qayta yoqiladi).`, tur: 'container', id: h.id, xato: h.kod !== 0 && h.kod !== 130 && h.kod !== 143 }
      case 'container:destroy': return { ikon: '🗑', matn: `${nom(h.nom)} o‘chirildi — yozuv qatlamidagi o‘zgarishlar ham yo‘qoldi. Volume'lar alohida, ular qoladi.`, tur: 'container' }
      case 'container:exec_start': return { ikon: '⤵', matn: `${nom(h.nom)} ichida yangi jarayon: ${nom(h.cmd)} (asosiy jarayon emas — tugasa konteyner to‘xtamaydi).`, tur: 'container', id: h.id }
      case 'container:rename': return { ikon: '✏', matn: `Konteyner nomi o‘zgardi: ${nom(h.nom)}.`, tur: 'container', id: h.id }
      case 'container:pause': return { ikon: '⏸', matn: `${nom(h.nom)} muzlatildi (jarayonlar to‘xtatib turilgan).`, tur: 'container', id: h.id }
      case 'container:unpause': return { ikon: '▶', matn: `${nom(h.nom)} muzlatishdan chiqdi.`, tur: 'container', id: h.id }
      case 'network:create': return h.nom === 'bridge' || h.nom === 'host' || h.nom === 'none' ? null : { ikon: '🕸', matn: `${nom(h.nom)} tarmog‘i yaratildi. Unga ulangan konteynerlar bir-birini NOM bilan topadi (Docker'ning ichki DNS'i).`, tur: 'network' }
      case 'network:connect': {
        const t = d.tarmoqlar.get(h.id)
        const kk = d.konteynerlar.get(h.konteyner)
        const u = kk?.tarmoqlar.get(h.id)
        if (!t || !kk || t.drayver !== 'bridge') return null
        return { ikon: '🔌', matn: `${nom(kk.nom)} ${nom(t.nom)} tarmog‘iga ulandi: IP ${u?.ip}.${t.standart ? ' Bu standart bridge — bunda konteynerlar bir-birini nom bilan topa olmaydi.' : ''}`, tur: 'network' }
      }
      case 'network:destroy': return { ikon: '🗑', matn: `${nom(h.nom)} tarmog‘i o‘chirildi.`, tur: 'network' }
      case 'volume:create': return { ikon: '🛢', matn: h.nom.length === 64 ? `Nomsiz (anonim) volume yaratildi: ${h.nom.slice(0, 12)}… — konteyner --rm bilan o‘chsa, u ham o‘chadi.` : `${nom(h.nom)} volume'i (ombor) yaratildi — konteyner o‘chsa ham ma’lumot shu yerda qoladi.`, tur: 'volume' }
      case 'volume:destroy': return { ikon: '🗑', matn: `${nom(h.nom.length === 64 ? h.nom.slice(0, 12) + '…' : h.nom)} volume'i o‘chirildi — ichidagi ma’lumot ham.`, tur: 'volume' }
      case 'http:javob': {
        const kk = d.konteynerlar.get(h.id)
        const kimdan = h.kimdan === 'host' ? 'host (curl)' : nom(d.konteynerlar.get(h.kimdan)?.nom ?? 'konteyner')
        return { ikon: '🌐', matn: `${kimdan} → ${nom(kk?.nom ?? '')} nginx: ${h.yol} → ${h.holat}${h.holat === 404 ? ' (bunday fayl yo‘q)' : ''}.`, tur: 'http', id: h.id }
      }
      default: return null
    }
  }
}
