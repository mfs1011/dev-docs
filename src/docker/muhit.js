// Trenajor muhiti: Docker daemon modeli + host fayl tizimi + bash. Sahifa ham, moslik testi ham shundan foydalanadi.
import katalog from './data/katalog.json'
import { Daemon, nomTahlil } from './dvigatel.js'
import { hostFsYarat, hostQobiq } from './qobiq/host.js'

export function muhitYarat({ fsYukla, terminal = null }) {
  const fs = hostFsYarat()
  const daemon = new Daemon({ katalog, fsYukla, hostFs: fs })
  const qobiq = hostQobiq({ daemon, fs, terminal })
  return {
    daemon, fs, qobiq, katalog,
    // image'ni darhol "yuklab qo'yish" (mashqlar va test uchun; pull animatsiyasisiz)
    tayyorla(nomlar) {
      for (const nom of nomlar) {
        const id = katalog.teglar[nom]
        if (!id) throw new Error(`katalogda yo'q: ${nom}`)
        daemon.imageQosh(katalog.imagelar[id], nomTahlil(nom))
      }
    },
  }
}
