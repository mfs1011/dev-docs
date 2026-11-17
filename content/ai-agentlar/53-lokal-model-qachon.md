# 53 — Lokal model qachon kerak

[Mundarija](README.md)

> ⚑ XII qism (53–56) rasmiy hujjatlar asosida yozilgan: Claude Code hujjati va Ollama hujjati (docs.ollama.com, Ollama v0.40.16).
> Lokal model bu qo'llanma muallifining kompyuterida sinalmadi (diskda joy yetmadi). Natija va raqamlar o'ylab topilmagan — o'zingiz
> o'lchash usuli 56-bobda.

## Tushuncha

Butun qo'llanma davomida agent **bulutdagi** model bilan ishladi: har so'rov Anthropic serverlariga ketdi (38-bob). **Lokal model** —
sizning kompyuteringizda yoki o'z serveringizda ishlaydigan ochiq model. So'rovlar tashqariga chiqmaydi.

Bu bob savolga javob beradi: qachon lokal model o'zini oqlaydi va qachon yo'q.

### Ikkita muhim fakt

**1. Claude modellari lokal ishlamaydi.** Lokal modellar — boshqa ishlab chiqaruvchilarning ochiq modellari (Ollama katalogida: Qwen, Gemma
va boshqalar). Claude Code esa faqat **interfeys va agent sikli** sifatida ishlaydi: tool'lar, ruxsatlar, kontekst boshqaruvi — Claude
Code'niki, "miya" — lokal model.

**2. Rasmiy qo'llab-quvvatlash bir xil emas.** Ikki hujjat ikki xil gapiradi:

| Manba | Nima deydi |
| --- | --- |
| CC (Other LLM gateways) | Anthropic uchinchi tomon gateway mahsulotlarini tasdiqlamaydi, qo'llab-quvvatlamaydi va tekshirmaydi; Claude Code'ni **Claude bo'lmagan modellarga** har qanday gateway orqali yo'naltirishni **qo'llab-quvvatlamaydi** |
| Ollama (Claude Code integration) | Ollama Claude Code'ni o'zining Anthropic bilan mos API'si orqali lokal va bulut modellariga ulaydi; `ollama launch claude` buyrug'i bor |

Ya'ni texnik jihatdan bu ishlaydi (Ollama hujjati buni tavsiflaydi), lekin muammo bo'lsa, Anthropic yordami bu konfiguratsiyani
qo'llab-quvvatlamaydi. Bu — ongli tanlov.

### Qachon lokal model kerak

| Sabab | Mazmuni | Manba |
| --- | --- | --- |
| **Kod tashqariga chiqmasligi kerak** | Lokal ishlaganda so'rovlar va kod kompyuterdan chiqmaydi | Ollama FAQ: "We don't see your prompts or data when you run locally" |
| Internet yo'q yoki cheklangan | Model kompyuterda | — |
| Ko'p takroriy oddiy vazifa | API narxi yo'q (lekin apparat va elektr bor) | — |
| O'rganish | Model, kontekst, tool chaqiruvi qanday ishlashini o'z ko'zingiz bilan ko'rish | — |

Maxfiylik bo'yicha muhim tafsilot: Ollama'ning **bulut** modellari ham bor (`:cloud` qo'shimchali nomlar). Ular ishlatilsa, so'rovlar
ollama.com'ga ketadi. Ollama FAQ: bulut modellarida so'rov va javoblar xizmat ko'rsatish uchun qayta ishlanadi, lekin saqlanmaydi va
o'qitishda ishlatilmaydi. To'liq lokal rejim uchun bulut imkoniyatlarini o'chirish mumkin (54-bob).

### Qachon kerak emas

| Cheklov | Mazmuni | Manba |
| --- | --- | --- |
| **Sifat** | Lokal model 1–52-boblardagi natijalarni bermaydi deb hisoblang, toki o'zingiz o'lchamaguningizcha (56-bob) | — |
| **Kontekst oynasi** | Ollama standart kontekst: VRAM 24 GiB dan kam bo'lsa — **4k**; 24–48 GiB — 32k; 48 GiB va undan ko'p — 256k. Agentlar va kod vositalari uchun kamida **64 000** token tavsiya etiladi | Ollama: Context length |
| **Xotira** | Kontekstni oshirish model uchun kerakli xotirani oshiradi | Ollama: Context length |
| **Disk** | Modellar o'nlab, hatto yuzlab GB bo'lishi mumkin | Ollama: macOS |
| **API imkoniyatlari** | Prompt kesh, `tool_choice`, token sanash va boshqalar qo'llab-quvvatlanmaydi | Ollama: Anthropic compatibility |
| **Claude Code imkoniyatlari** | Remote Control `ANTHROPIC_BASE_URL` boshqa host'ga qaratilganda ishlamaydi (58-bob) | CC: Remote Control |

Prompt keshi yo'qligi 41-bobdagi hisobni o'zgartiradi: bulutda uzun sessiyani arzon qiladigan narsa — kesh. Lokal modelda har so'rovda
butun kontekst qaytadan qayta ishlanadi; bu pul emas, lekin **vaqt**.

### Apparat

Ollama (macOS): talablar — macOS Sonoma (14) yoki yangiroq; Apple M seriyasi (CPU va GPU) yoki x86 (faqat CPU). Apple qurilmalarida GPU
tezlashtirish Metal API orqali. Linux va Windows'da NVIDIA, AMD va Vulkan (Ollama: GPU docs).

Model GPU'ga to'liq sig'adimi — `ollama ps` ning `PROCESSOR` ustuni (`100% GPU` yoki CPU bilan bo'lingan). Ollama: eng yaxshi natija uchun
modelni CPU'ga "tushirmaslik" (offloading) kerak.

## Variantlar

| Holat | Tanlov | Trade-off |
| --- | --- | --- |
| Odatiy loyiha, sifat muhim | Bulutdagi Claude | Eng yaxshi natija; kod Anthropic'ga ketadi (38-bob) |
| Kod tashqariga chiqmasligi shart, kuchli GPU bor | Lokal model + Claude Code | Maxfiylik; sifat va kontekst cheklangan, rasmiy qo'llab-quvvatlash yo'q |
| Kod tashqariga chiqmasligi shart, apparat kuchsiz | Tashkilotning o'z serveridagi model yoki ZDR shartnomali bulut | Infratuzilma yoki shartnoma kerak |
| Faqat sinab ko'rish | Ollama + kichik model | Tez boshlash; natija haqiqiy ish uchun ko'rsatkich emas |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| "Lokal Claude" ni qidirish | Claude modellari lokal ishlamaydi | Ochiq model + Claude Code interfeysi |
| `:cloud` modelni lokal deb o'ylash | So'rovlar ollama.com'ga ketadi | Lokal model nomi yoki bulut imkoniyatlarini o'chirish |
| Standart kontekst bilan agent ishga tushirish | Kichik GPU'da 4k — agent uchun juda kam | Kamida 64 000 (54-bob) |
| Muammo bo'lsa Anthropic yordamiga murojaat qilish | CC: Claude bo'lmagan modellarni qo'llab-quvvatlamaydi | Ollama hujjati va hamjamiyati |
| Bulut natijalarini lokalga ko'chirib baholash | Boshqa model — boshqa natija | O'z vazifalaringizda o'lchash (56-bob) |

## Amaliyot

1. Lokal model ishlatilganda Claude Code nimani bajaradi va model nimani?
2. Anthropic va Ollama hujjatlari bu konfiguratsiya haqida qanday farq qiladi?
3. Ollama'ning standart kontekst oynasi qanday tanlanadi va agent uchun qancha tavsiya etiladi?
4. Nega lokal modelda uzun sessiya bulutdagidan boshqacha "qimmat"?
5. `:cloud` modellar bilan maxfiylik qanday?

<details>
<summary>Javoblar</summary>

1. Claude Code — agent sikli, tool'lar, ruxsatlar, kontekst boshqaruvi; lokal model — javob va tool chaqiruvlarini yaratadigan "miya".
2. CC: Claude bo'lmagan modellarga yo'naltirishni qo'llab-quvvatlamaydi. Ollama: Claude Code'ni o'z API'si orqali ulashni tavsiflaydi va `ollama launch claude` beradi.
3. VRAM'ga qarab: 24 GiB dan kam — 4k, 24–48 GiB — 32k, 48 GiB va undan ko'p — 256k. Agentlar va kod vositalari uchun kamida 64 000.
4. Ollama prompt keshni qo'llab-quvvatlamaydi: har so'rovda butun kontekst qayta ishlanadi — pul emas, vaqt ketadi.
5. So'rovlar ollama.com'ga ketadi; Ollama ularni xizmat uchun qayta ishlaydi, lekin saqlamaydi va o'qitishda ishlatmaydi (FAQ).

</details>

## Rasmiy hujjat

- [CC: Other LLM gateways](https://code.claude.com/docs/en/llm-gateway)
- [Ollama: Claude Code](https://docs.ollama.com/integrations/claude-code)
- [Ollama: Context length](https://docs.ollama.com/context-length)
- [Ollama: FAQ](https://docs.ollama.com/faq)
- [Ollama: macOS](https://docs.ollama.com/macos) · [Ollama: GPU](https://docs.ollama.com/gpu)
