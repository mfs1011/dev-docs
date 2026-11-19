// Paket maydonlarining o'zbekcha nomi va izohi. Kalit — tshark maydon nomi (PDML `name`).
// Izohlar standartdan (RFC) — `manba` aniq bo'lim. `misol: true` — har yozuvda boshqacha bo'ladigan qiymat.
// docs/vizualizator/paket-yoli.md 2-bo'lim

const RFC = (n, bolim) => ({ nom: `RFC ${n}${bolim ? ', ' + bolim : ''}`, url: `https://www.rfc-editor.org/rfc/rfc${n}${bolim ? '#section-' + bolim : ''}` })

export const QATLAMLAR = {
  eth: { nom: 'Ethernet', izoh: 'Bitta tarmoq ichida (kompyuter → router) kadrni yetkazadi. Manzillari — tarmoq kartalarining MAC manzili.', manba: { nom: 'IEEE 802.3', url: 'https://standards.ieee.org/ieee/802.3/10422/' } },
  ip: { nom: 'IPv4', izoh: 'Paketni tarmoqlar orqali manzilga olib boradi. Har router faqat shu sarlavhaga qarab paketni keyingi qadamga uzatadi.', manba: RFC(791) },
  udp: { nom: 'UDP', izoh: 'Ulanishsiz transport: paket yuboriladi, yetib borgani tekshirilmaydi. DNS so‘rovlari odatda shu orqali.', manba: RFC(768) },
  tcp: { nom: 'TCP', izoh: 'Ishonchli oqim: ulanish ochiladi, har bayt raqamlanadi, yetib borgani tasdiqlanadi, yo‘qolsa qayta yuboriladi.', manba: RFC(9293) },
  dns: { nom: 'DNS', izoh: 'Domen nomini IP manzilga aylantiradi.', manba: RFC(1035) },
  http: { nom: 'HTTP/1.1', izoh: 'So‘rov va javob — oddiy matn: birinchi qator, sarlavhalar, bo‘sh qator, tana.', manba: RFC(9112) },
  'data-text-lines': { nom: 'Tana (HTML)', izoh: 'Javobning tanasi — sahifaning o‘zi.', manba: RFC(9110, '6.4') },
  data: { nom: 'Ma’lumot', izoh: 'Bu paketdagi baytlar oldingi paketning davomi.', manba: RFC(9293, '3.4') },
}

export const MAYDONLAR = {
  // Ethernet
  'eth.dst': { nom: 'Qabul qiluvchi MAC', izoh: 'Shu tarmoq ichida kadrni oladigan karta. Klient boshqa tarmoqdagi serverga yuborganda bu yerda serverning emas, routerning MAC manzili turadi — IP manzil esa oxirgi manzilni ko‘rsatadi.', manba: QATLAMLAR.eth.manba },
  'eth.src': { nom: 'Jo‘natuvchi MAC', izoh: 'Kadrni yuborgan tarmoq kartasi.', manba: QATLAMLAR.eth.manba },
  'eth.type': { nom: 'Ichki protokol turi (EtherType)', izoh: '0x0800 — ichida IPv4 paketi bor.', manba: QATLAMLAR.eth.manba },
  // IPv4
  'ip.version': { nom: 'Versiya', izoh: '4 — IPv4.', manba: RFC(791, '3.1') },
  'ip.hdr_len': { nom: 'Sarlavha uzunligi', izoh: 'IP sarlavhasi necha bayt. Qo‘shimcha parametrlarsiz — 20 bayt.', manba: RFC(791, '3.1') },
  'ip.dsfield': { nom: 'Xizmat turi (DSCP, ECN)', izoh: 'Ustuvorlik va tiqilish belgilari. 0 — oddiy trafik.', manba: RFC(2474, '3') },
  'ip.len': { nom: 'Umumiy uzunlik', izoh: 'IP sarlavhasi va ichidagi hamma narsa, baytlarda.', manba: RFC(791, '3.1') },
  'ip.id': { nom: 'Identifikator', izoh: 'Paket bo‘laklarga bo‘linsa, qabul qiluvchi ularni shu raqam bo‘yicha qayta yig‘adi.', manba: RFC(791, '3.1'), misol: true },
  'ip.flags': { nom: 'Bayroqlar', izoh: 'DF (Don’t Fragment) — yo‘lda bo‘laklarga bo‘lish taqiqlangan.', manba: RFC(791, '3.1') },
  'ip.frag_offset': { nom: 'Bo‘lak o‘rni', izoh: 'Bo‘lak asl paketning qayeridan boshlanadi. 0 — bo‘linmagan.', manba: RFC(791, '3.1') },
  'ip.ttl': { nom: 'Yashash vaqti (TTL)', izoh: 'Har router 1 ga kamaytiradi; 0 bo‘lsa paket tashlanadi. Paket tarmoqda abadiy aylanib qolmaydi.', manba: RFC(791, '3.1') },
  'ip.proto': { nom: 'Ichki protokol', izoh: '6 — TCP, 17 — UDP.', manba: RFC(791, '3.1') },
  'ip.checksum': { nom: 'Sarlavha nazorat yig‘indisi', izoh: 'Faqat IP sarlavhasini tekshiradi. TTL o‘zgargani uchun har router uni qayta hisoblaydi.', manba: RFC(791, '3.1'), misol: true },
  'ip.src': { nom: 'Jo‘natuvchi manzil', izoh: 'Paketni yuborgan qurilmaning IP manzili.', manba: RFC(791, '3.1') },
  'ip.dst': { nom: 'Qabul qiluvchi manzil', izoh: 'Paket boradigan joy. Routerlar faqat shunga qarab yo‘l tanlaydi.', manba: RFC(791, '3.1') },
  // UDP
  'udp.srcport': { nom: 'Jo‘natuvchi port', izoh: 'Klient tasodifiy tanlagan vaqtinchalik port — javob shu portga qaytadi.', manba: RFC(768), misol: true },
  'udp.dstport': { nom: 'Qabul qiluvchi port', izoh: '53 — DNS xizmati porti.', manba: RFC(768) },
  'udp.length': { nom: 'Uzunlik', izoh: 'UDP sarlavhasi (8 bayt) va ma’lumot.', manba: RFC(768) },
  'udp.checksum': { nom: 'Nazorat yig‘indisi', izoh: 'Sarlavha va ma’lumot buzilmaganini tekshiradi.', manba: RFC(768), misol: true },
  // TCP
  'tcp.srcport': { nom: 'Jo‘natuvchi port', izoh: 'Har ulanishning bir uchi. Klient tomonida — tizim tanlagan vaqtinchalik port.', manba: RFC(9293, '3.1') },
  'tcp.dstport': { nom: 'Qabul qiluvchi port', izoh: 'Server tomonida — xizmat porti (HTTP uchun 80).', manba: RFC(9293, '3.1') },
  'tcp.seq': { nom: 'Ketma-ketlik raqami (nisbiy)', izoh: 'Bu paketdagi birinchi baytning tartib raqami. tshark qulaylik uchun 0 dan sanaydi; haqiqiy qiymat — pastdagi “xom” raqam.', manba: RFC(9293, '3.4') },
  'tcp.seq_raw': { nom: 'Ketma-ketlik raqami (xom)', izoh: 'Ulanish boshida tasodifiy tanlanadi — begona odam taxmin qila olmasin.', manba: RFC(9293, '3.4.1'), misol: true },
  'tcp.ack': { nom: 'Tasdiq raqami (nisbiy)', izoh: '“Shu raqamgacha hammasini oldim, keyingisini kutaman.”', manba: RFC(9293, '3.4') },
  'tcp.ack_raw': { nom: 'Tasdiq raqami (xom)', izoh: 'Qarshi tomonning ketma-ketlik raqamiga bog‘liq.', manba: RFC(9293, '3.4'), misol: true },
  'tcp.hdr_len': { nom: 'Sarlavha uzunligi', izoh: '20 bayt + parametrlar (options).', manba: RFC(9293, '3.1') },
  'tcp.flags': { nom: 'Bayroqlar', izoh: 'SYN — ulanish ochish, ACK — tasdiq, PSH — darhol ilovaga ber, FIN — yuborish tugadi, RST — ulanishni uzish.', manba: RFC(9293, '3.1') },
  'tcp.window_size_value': { nom: 'Oyna', izoh: 'Qabul qiluvchi yana qancha baytni joylay oladi. Oyna masshtabi bilan ko‘paytiriladi.', manba: RFC(9293, '3.8.6') },
  'tcp.checksum': { nom: 'Nazorat yig‘indisi', izoh: 'Sarlavha va ma’lumot buzilmaganini tekshiradi. Yozuv yuboruvchi kompyuterda olingani uchun tarmoq kartasi uni keyinroq to‘ldirishi mumkin.', manba: RFC(9293, '3.1'), misol: true },
  'tcp.urgent_pointer': { nom: 'Shoshilinch ko‘rsatkich', izoh: 'Deyarli ishlatilmaydi; 0.', manba: RFC(9293, '3.8.5') },
  'tcp.options': { nom: 'Parametrlar', izoh: 'Ulanish boshida tomonlar imkoniyatlarini aytadi: eng katta segment (MSS), SACK, vaqt belgisi, oyna masshtabi.', manba: RFC(9293, '3.2') },
  'tcp.options.mss': { nom: 'Eng katta segment (MSS)', izoh: 'Bitta paketdagi ma’lumot ko‘pi bilan necha bayt. Ethernet’da odatda 1460.', manba: RFC(9293, '3.7.1') },
  'tcp.options.sack_perm': { nom: 'SACK ruxsati', izoh: '“Qaysi bo‘laklar yetib kelganini aniq ayta olaman” — yo‘qolgan paketni tezroq qayta yuborish uchun.', manba: RFC(2018) },
  'tcp.options.timestamp': { nom: 'Vaqt belgisi', izoh: 'Borib-kelish vaqtini o‘lchash va eski paketlarni ajratish uchun.', manba: RFC(7323, '3'), misol: true },
  'tcp.options.wscale': { nom: 'Oyna masshtabi', izoh: 'Oyna qiymatini 2 ning shu darajasiga ko‘paytirish — katta tezlikda ko‘proq ma’lumot yo‘lda bo‘la oladi.', manba: RFC(7323, '2') },
  'tcp.options.nop': { nom: 'Bo‘sh parametr (NOP)', izoh: 'Tekislash uchun 1 bayt.', manba: RFC(9293, '3.2') },
  // DNS
  'dns.id': { nom: 'So‘rov identifikatori', izoh: 'Javob qaysi so‘rovga ekanini shu raqam bilan topadi.', manba: RFC(1035, '4.1.1'), misol: true },
  'dns.flags': { nom: 'Bayroqlar', izoh: 'So‘rov yoki javob, rekursiya so‘raldimi, javob xatosizmi.', manba: RFC(1035, '4.1.1') },
  'dns.flags.response': { nom: 'So‘rov / javob', izoh: '0 — so‘rov, 1 — javob.', manba: RFC(1035, '4.1.1') },
  'dns.flags.recdesired': { nom: 'Rekursiya so‘raldi (RD)', izoh: '“To‘liq javobni sen topib ber” — klient rezolverdan shuni so‘raydi.', manba: RFC(1035, '4.1.1') },
  'dns.flags.recavail': { nom: 'Rekursiya mavjud (RA)', izoh: 'Server rekursiv so‘rovni bajara oladi.', manba: RFC(1035, '4.1.1') },
  'dns.flags.rcode': { nom: 'Javob kodi', izoh: '0 — xatosiz (NOERROR), 3 — bunday nom yo‘q (NXDOMAIN).', manba: RFC(1035, '4.1.1') },
  'dns.count.queries': { nom: 'Savollar soni', izoh: 'Odatda 1.', manba: RFC(1035, '4.1.1') },
  'dns.count.answers': { nom: 'Javoblar soni', izoh: 'Javob bo‘limidagi yozuvlar.', manba: RFC(1035, '4.1.1') },
  'dns.qry.name': { nom: 'So‘ralgan nom', izoh: 'Qaysi domenning manzili kerak.', manba: RFC(1035, '4.1.2') },
  'dns.qry.type': { nom: 'Yozuv turi', izoh: 'A — IPv4 manzil, AAAA — IPv6 manzil.', manba: RFC(1035, '3.2.2') },
  'dns.qry.class': { nom: 'Sinf', izoh: 'IN — internet. Amalda doim shu.', manba: RFC(1035, '3.2.4') },
  'dns.resp.ttl': { nom: 'Keshda saqlash vaqti (TTL)', izoh: 'Javobni necha soniya eslab qolish mumkin — shu vaqt ichida qayta so‘ralmaydi.', manba: RFC(1035, '3.2.1') },
  'dns.a': { nom: 'IPv4 manzil', izoh: 'Javobning o‘zi: domen shu manzilda.', manba: RFC(1035, '3.4.1') },
  // HTTP
  'http.request.method': { nom: 'Metod', izoh: 'GET — resursni olish, hech narsani o‘zgartirmaydi.', manba: RFC(9110, '9.3.1') },
  'http.request.uri': { nom: 'So‘ralgan yo‘l', izoh: '/ — bosh sahifa.', manba: RFC(9112, '3.2') },
  'http.request.version': { nom: 'Protokol versiyasi', izoh: 'HTTP/1.1.', manba: RFC(9112, '2.3') },
  'http.host': { nom: 'Host', izoh: 'Qaysi sayt so‘ralyapti. Bitta IP manzilda ko‘p sayt bo‘lishi mumkin — server shu sarlavhaga qarab ajratadi. HTTP/1.1 da majburiy.', manba: RFC(9110, '7.2') },
  'http.user_agent': { nom: 'User-Agent', izoh: 'So‘rovni yuborgan dastur va versiyasi.', manba: RFC(9110, '10.1.5') },
  'http.accept': { nom: 'Accept', izoh: 'Klient qaysi formatdagi javobni qabul qiladi. */* — istalgan.', manba: RFC(9110, '12.5.1') },
  'http.response.version': { nom: 'Protokol versiyasi', izoh: 'Server javob bergan HTTP versiyasi.', manba: RFC(9112, '4') },
  'http.response.code': { nom: 'Holat kodi', izoh: '200 — muvaffaqiyatli, tanada so‘ralgan resurs.', manba: RFC(9110, '15.3.1') },
  'http.response.phrase': { nom: 'Holat izohi', izoh: 'Odam uchun matn; dasturlar faqat kodga qaraydi.', manba: RFC(9112, '4') },
  'http.server': { nom: 'Server', izoh: 'Javob bergan dastur.', manba: RFC(9110, '10.2.4') },
  'http.date': { nom: 'Date', izoh: 'Javob yaratilgan vaqt (GMT).', manba: RFC(9110, '6.6.1'), misol: true },
  'http.content_type': { nom: 'Content-Type', izoh: 'Tana formati: text/html — HTML sahifa.', manba: RFC(9110, '8.3') },
  'http.content_length_header': { nom: 'Content-Length', izoh: 'Tana necha bayt — klient javob qayerda tugashini shundan biladi.', manba: RFC(9110, '8.6') },
  'http.last_modified': { nom: 'Last-Modified', izoh: 'Fayl oxirgi marta qachon o‘zgargan — keyingi so‘rovda kesh tekshiruvi uchun.', manba: RFC(9110, '8.8.2'), misol: true },
  'http.connection': { nom: 'Connection', izoh: 'keep-alive — javobdan keyin ulanish ochiq qoladi, keyingi so‘rov uchun.', manba: RFC(9112, '9.3') },
  'http.response_for.uri': { nom: 'Qaysi so‘rovga javob', izoh: 'tshark qo‘shgan izoh: bu javob qaysi manzilga.', manba: null },
}

/** Paketdagi maydon nomi uchun izoh (aniq nom, keyin prefiks: `tcp.flags.syn` → `tcp.flags`) */
export function maydonIzohi(nom) {
  if (MAYDONLAR[nom]) return MAYDONLAR[nom]
  return null
}
