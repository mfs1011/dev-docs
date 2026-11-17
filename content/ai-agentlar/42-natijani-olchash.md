# 42 — Natijani o'lchash

[Mundarija](README.md)

> ⚑ OpenTelemetry metrikalari sinov sessiyasida haqiqiy chiqish bilan tekshirildi. `/insights` hisoboti (kompyuterdagi barcha
> sessiyalarni tahlil qiladi) va Team/Enterprise analitika paneli ishga tushirilmadi — ular rasmiy hujjat asosida yozilgan.

## Tushuncha

"AI bizni tezlashtirdimi?" degan savolga javob berish uchun nimadir o'lchash kerak. Claude Code uch daraja vosita beradi:

| Daraja | Vosita | Nimani ko'rsatadi | Kim uchun |
| --- | --- | --- | --- |
| Shaxsiy | `/insights` | **Qanday ishlashingiz**: nima ustida ishlaysiz, qayerda tushunmovchilik yoki xatoli kod bo'ldi, tavsiyalar | Har bir dasturchi |
| Shaxsiy | `/usage`, `-p` JSON natijasi | Token, taxminiy narx, kesh (41-bob) | Har bir dasturchi |
| Jamoa | Analitika paneli | Faol foydalanuvchilar, qabul qilingan kod qatorlari, PR'lar | Team/Enterprise adminlari, API (Console) |
| Tashkilot | OpenTelemetry | Metrikalar va hodisalar o'zingizning monitoring tizimingizga | Platforma/DevOps jamoasi |

### `/insights`

CC (Costs — Analyze your usage patterns): `/insights` token soni emas, **qanday ishlashingiz** haqida hisobot beradi. U shu
kompyuterdagi so'nggi sessiyalaringizni tahlil qiladi va HTML hisobot yozadi: nima ustida ishlaysiz, **ishqalanish nuqtalari** (friction
points) — masalan, noto'g'ri tushunilgan so'rovlar yoki xatoli kod — va Claude Code'dan samaraliroq foydalanish bo'yicha tavsiyalar.

- Bir ishga tushirishda ko'rilmagan 200 tagacha sessiyani tahlil qiladi, juda qisqalarini o'tkazib yuboradi.
- Hisobot `~/.claude/usage-data/report.html` ga yoziladi, har ishga tushirishning vaqt belgili nusxasi saqlanadi; `cleanupPeriodDays`
  bo'yicha o'chiriladi.
- Har qanday reja va provayderda ishlaydi; tahlil tokenlari rejangiz yoki API hisobingizdan sarflanadi.
- Boshqa qurilmalardagi va claude.ai'dagi sessiyalar kirmaydi.

Bu hisobotdan foydalanish tsikli: hisobotdagi takrorlanuvchi tushunmovchilik → CLAUDE.md'ga qoida (13-bob), skill (25-bob) yoki
hook (26-bob). 24-bobdagi "agent bir xatoni ikki marta qilsa — CLAUDE.md'ga" qoidasining ma'lumotga asoslangan shakli.

### Jamoa analitikasi

CC (Track team usage with analytics) — ikki panel:

| Reja | Manzil | Tarkibi |
| --- | --- | --- |
| Team / Enterprise | claude.ai/analytics/claude-code | Foydalanish metrikalari, GitHub bilan hissa metrikalari, peshqadamlar, CSV eksport |
| API (Console) | platform.claude.com/claude-code | Foydalanish, xarajat, jamoa ko'rsatkichlari |

Asosiy ko'rsatkichlar:

| Ko'rsatkich | Ta'rifi (CC) |
| --- | --- |
| PRs with Claude Code | Claude Code bilan yozilgan kamida bitta qatori bor merge qilingan PR'lar soni va ulushi |
| LOC with Claude Code | Merge qilingan PR'larda Claude Code yordamida yozilgan "samarali qatorlar" (normallashtirilgandan keyin 3 belgidan uzun) |
| Suggestion accept rate | `Edit`, `Write`, `NotebookEdit` takliflari qabul qilingan ulush |
| Lines of code accepted | Qabul qilingan tahrirlarda qo'shilgan yoki o'chirilgan qatorlar; **keyin o'chirilgan qatorlar jamini kamaytirmaydi** |
| Total PRs per user | Kunlik merge qilingan PR'lar / kunlik faol foydalanuvchilar |

PR atributsiyasi: merge paytida PR diff'idagi qatorlar 21 kun oldin – 2 kun keyingi oraliqdagi Claude Code sessiyalari chiqishi bilan
solishtiriladi. Dasturchi 20% dan ko'proq qayta yozgan kod Claude Code'ga hisoblanmaydi; lock fayllar, generatsiya qilingan kod,
`dist/` kabi papkalar chiqarib tashlanadi. CC'ning o'zi: bu metrikalar ataylab **ehtiyotkor** — haqiqiy ta'sirni kam ko'rsatadi.

ROI (sarmoya qaytimi) uchun CC tavsiyasi: foydalanuvchiga to'g'ri keladigan PR'lar o'zgarishini kuzatish va natijani **DORA
metrikalari**, sprint tezligi yoki boshqa muhandislik KPI'lari bilan birga ko'rish.

### OpenTelemetry

CC (Monitoring): Claude Code metrikalar va hodisalarni (events) OpenTelemetry orqali o'zingiz tanlagan tizimga (Prometheus, OTLP
kollektor va h.k.) yubora oladi. Bu **ixtiyoriy** va aniq sozlashni talab qiladi.

| Metrika | Nima |
| --- | --- |
| `claude_code.session.count` | Boshlangan sessiyalar |
| `claude_code.lines_of_code.count` | O'zgartirilgan qatorlar (`type`: `added`/`removed`, `model`) |
| `claude_code.pull_request.count`, `claude_code.commit.count` | Yaratilgan PR va commit'lar |
| `claude_code.cost.usage` | Taxminiy narx (USD) |
| `claude_code.token.usage` | Tokenlar (`type`: `input`, `output`, `cacheRead`, `cacheCreation`) |
| `claude_code.code_edit_tool.decision` | Tahrir ruxsatlari bo'yicha qarorlar (qabul/rad, manbasi) |
| `claude_code.active_time.total` | Faol vaqt (bo'sh turish hisobga olinmaydi) |

Hodisalar (`OTEL_LOGS_EXPORTER` bilan): `user_prompt`, `api_request`, `tool_result`, `tool_decision` va boshqalar. Bitta so'rovdan
kelib chiqqan hamma hodisa `prompt.id` bilan bog'lanadi.

**Maxfiylik** (CC, Monitoring — Security and privacy):

- So'rov matni standart holatda **yig'ilmaydi**, faqat uzunligi (`prompt: "<REDACTED>"`). Yoqish: `OTEL_LOG_USER_PROMPTS=1`.
- Javob matni, tool argumentlari (Bash buyruqlari, fayl yo'llari) ham standart holatda yo'q; tegishli `OTEL_LOG_*` o'zgaruvchilari bilan
  yoqiladi.
- OAuth bilan kirilganda **`user.email`** atributlarda bo'ladi. U faqat siz sozlagan OTel manziliga ketadi, Anthropic'ga emas. Kerak
  bo'lsa, kollektorda filtrlash yoki yashirish kerak.

## Amalda: bitta sessiyaning metrikalari

40-bobdagi bo'lib to'lash vazifasi (Haiku, `low`) telemetriya yoqilgan holda, metrikalar terminalga chiqadigan qilib ishga tushirildi:

```bash
CLAUDE_CODE_ENABLE_TELEMETRY=1 \
OTEL_METRICS_EXPORTER=console \
OTEL_LOGS_EXPORTER=console \
OTEL_METRIC_EXPORT_INTERVAL=5000 \
claude -p "tolov.js dagi bolibTolash funksiyasida xato bor: ... Tuzat va npm test bilan tekshir. Commit qilma." \
  --model haiku --effort low --allowedTools "Read" "Edit" "Bash(npm test*)"
```

Chiqishdagi metrikalar (oxirgi eksport; shaxsiy atributlar olib tashlangan):

| Metrika | Qiymat |
| --- | --- |
| `session.count` | 1 |
| `lines_of_code.count` | `added`: 13, `removed`: 2 (`model`: claude-haiku-5-5) |
| `token.usage` | `input`: 10, `output`: 2 350, `cacheRead`: 99 578, `cacheCreation`: 12 720 |
| `cost.usage` | $0.0047 |
| `code_edit_tool.decision` | `accept`, manba `config` — 2 (ruxsat `--allowedTools` dan keldi) |
| `active_time.total` | 13.9 s |

Hodisalar: `user_prompt` (1), `api_request` (5), `tool_decision` (6, ulardan bittasi `reject` — ruxsat berilmagan Bash buyrug'i),
`tool_result` (5). `user_prompt` hodisasida so'rov matni o'rniga `"<REDACTED>"` turibdi.

Har bir datapoint'da `user.email`, `organization.id`, `user.account_uuid` va reja turi ham bor edi — hujjatda aytilganidek. Shuning uchun
yuqoridagi jadvalda ular ko'rsatilmadi va chiqish fayli tajribadan keyin o'chirildi. Telemetriyani biror xizmatga ulashdan oldin
shuni hisobga oling.

### Metrika nimani aytmaydi

Shu sessiya natijasini 40-bobdagi yashirin tekshiruvdan o'tkazdik:

- asosiy xato tuzatilgan (5 577 kombinatsiyada yig'indi xatosi 0);
- noto'g'ri kiritishlar (`oylar` = 0, manfiy, kasr) **tekshirilmaydi**.

Telemetriyadagi "+13 / −2 qator, 2 ta qabul qilingan tahrir, $0.0047" bu ikkala faktdan hech birini ko'rsatmaydi. Metrika **qancha**
ish bo'lganini o'lchaydi, **qanchalik to'g'ri** bo'lganini emas.

## Umumiy raqamlarga ehtiyot bo'lish

AI samaradorligi haqidagi "X foiz tezroq" kabi raqamlar ko'p. Rasmiy hujjatlarning o'zidan ehtiyot bo'lish uchun asoslar:

| Raqam | Nega ehtiyot bo'lish kerak | Manba |
| --- | --- | --- |
| Qabul qilingan qatorlar | Keyin o'chirilgan qatorlar jamni kamaytirmaydi; qator soni sifat emas | CC Analytics |
| Claude Code bilan PR/LOC | Ataylab ehtiyotkor (kam ko'rsatadi); 20% dan ko'p qayta yozilgan kod hisoblanmaydi; 21 kunlik oyna | CC Analytics |
| Narx metrikalari | Taxminiy; rasmiy billing emas | CC Monitoring, Costs |
| Korxonalardagi o'rtacha xarajat | Faol kunga ~$13, oyiga $150–250; 90% foydalanuvchida faol kunga $30 dan kam — lekin o'z jamoangiz uchun kichik pilot guruhdan boshlab bazaviy chiziq aniqlash tavsiya etiladi | CC Costs |
| Bitta tajriba | Model javoblari deterministik emas (40-bob) | — |

Amaliy xulosa:

1. **O'z bazaviy chizig'ingiz** (baseline). Umumiy raqam o'rniga — o'z jamoangiz, o'z vazifalaringiz, AI'dan oldin va keyin.
2. **Natija metrikalari bilan birga.** CC tavsiyasi: DORA metrikalari bilan birga ko'rish. DORA (dora.dev) beshta ko'rsatkich
   beradi: o'zgarishning commit'dan production'gacha vaqti (change lead time), deploy chastotasi (deployment frequency), muvaffaqiyatsiz
   deploy'dan tiklanish vaqti (failed deployment recovery time), darhol aralashuv talab qilgan deploy'lar ulushi (change fail rate) va
   production'dagi hodisa sabab rejadan tashqari deploy'lar ulushi (deployment rework rate). Ko'proq kod — tezroq emas, agar ko'proq
   xato ham bo'lsa.
3. **Sifatni alohida tekshirish.** Testlar, review, yashirin tekshiruvlar (40, 39-boblar) — "qancha" emas, "qanchalik to'g'ri".
4. **Ishqalanishni o'lchash.** `/insights` dagi tushunmovchiliklar va qayta ishlashlar — qayerda vaqt yo'qolayotganini ko'rsatadi.

## Variantlar

| Maqsad | Vosita | Trade-off |
| --- | --- | --- |
| O'z ish uslubingizni yaxshilash | `/insights` | Token sarflaydi; faqat shu kompyuter |
| Bitta vazifa narxini solishtirish | `-p --output-format json` | Aniq raqamlar; sifatni o'zingiz baholaysiz |
| Jamoa qabul qilishini kuzatish | Analitika paneli | Team/Enterprise yoki Console; ehtiyotkor atributsiya |
| Xarajat ogohlantirishlari, jamoa/model bo'yicha bo'lish | OpenTelemetry | Infratuzilma kerak; maxfiy atributlarni boshqarish |
| "Arzidimi?" savoli | Analitika + DORA + sifat ko'rsatkichlari | Ko'p manbani birlashtirish kerak |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Qator soni bilan samaradorlikni o'lchash | Ko'p qator — ko'p ish, yaxshi ish emas; o'chirilgan qatorlar ham kamaymaydi | DORA va sifat ko'rsatkichlari bilan birga |
| Umumiy reklama raqamini o'z jamoangizga ko'chirish | CC: pilot guruh bilan o'z bazaviy chizig'ingizni aniqlang | Oldin/keyin, o'z vazifalaringizda |
| Telemetriyani tekshirmasdan ulash | `user.email` va (yoqilsa) so'rov matni ketadi | Atributlarni ko'rib, kollektorda filtrlash |
| `OTEL_LOG_USER_PROMPTS=1` ni o'ylamasdan yoqish | So'rovlarda maxfiy ma'lumot bo'lishi mumkin (38-bob) | Faqat aniq maqsad bilan, kirish cheklangan backend'da |
| `cost.usage` ni hisob-faktura deb bilish | Taxmin | Billing — hisob sahifasi, Console |
| `/insights` ni ko'rib, hech narsa o'zgartirmaslik | Hisobot maqsadi — ish uslubini o'zgartirish | Takrorlanuvchi muammo → CLAUDE.md, skill, hook |

## Amaliyot

1. `/insights` va `/usage` qanday farq qiladi?
2. Analitikadagi "Lines of code accepted" metrikasining qanday cheklovlari bor?
3. OpenTelemetry orqali qanday metrikalar olinadi va standart holatda nima yig'ilmaydi?
4. Tajribada telemetriya qaysi maxfiy atributlarni ko'rsatdi va bu bilan nima qilish kerak?
5. Tajribadagi metrikalar natija sifatida nimani ko'rsatmadi?
6. AI samaradorligini o'lchashni qanday tashkil qilasiz?

<details>
<summary>Javoblar</summary>

1. `/insights` qanday ishlashingiz haqida hisobot beradi (ishqalanish nuqtalari, tavsiyalar); `/usage` — token, taxminiy narx va kesh ko'rsatkichlari.
2. Faqat qabul qilingan tahrirlardagi qatorlarni sanaydi, keyin o'chirilgan qatorlar jamni kamaytirmaydi; qator soni sifatni bildirmaydi.
3. Sessiyalar, o'zgargan qatorlar, PR va commit'lar, narx, tokenlar, tahrir qarorlari, faol vaqt; hodisalar. Standart holatda so'rov va javob matni, tool argumentlari yig'ilmaydi.
4. `user.email`, `organization.id`, `user.account_uuid`, reja turi. Telemetriyani ulashdan oldin hisobga olish, kerak bo'lsa kollektorda filtrlash yoki yashirish.
5. Noto'g'ri kiritishlar tekshirilmasligini (yashirin tekshiruv topdi). Metrika ish hajmini ko'rsatadi, to'g'riligini emas.
6. O'z bazaviy chizig'i (pilot guruh, oldin/keyin), DORA va sifat ko'rsatkichlari bilan birga, testlar va review orqali sifatni alohida tekshirish, `/insights` bilan ishqalanishni kuzatish.

</details>

## Rasmiy hujjat

- [CC: Manage costs — Analyze your usage patterns (/insights)](https://code.claude.com/docs/en/costs#analyze-your-usage-patterns)
- [CC: Track team usage with analytics](https://code.claude.com/docs/en/analytics)
- [CC: Monitoring (OpenTelemetry)](https://code.claude.com/docs/en/monitoring-usage)
- [DORA: Software delivery performance metrics](https://dora.dev/guides/dora-metrics/)
