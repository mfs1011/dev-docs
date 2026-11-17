# 55 — Agentni lokal modelga ulash

[Mundarija](README.md)

> ⚑ Ollama'ning Claude Code integratsiyasi sahifasi va Claude Code'ning gateway/model hujjatlari asosida. Bu qo'llanmada ishga
> tushirilmagan. Eslatma (53-bob): Anthropic Claude Code'ni Claude bo'lmagan modellarga yo'naltirishni qo'llab-quvvatlamaydi.

## Tushuncha

Claude Code so'rovlarni Anthropic Messages API formatida yuboradi. `ANTHROPIC_BASE_URL` muhit o'zgaruvchisi ularni qayerga yuborishni
belgilaydi (CC, gateway compatibility guide: Anthropic Messages formati — `/v1/messages` endpoint'i). Ollama shu formatning bir qismini
qo'llab-quvvatlaydi (Ollama: Anthropic compatibility). Natijada Claude Code o'zgarishsiz, faqat manzil va model nomi boshqa.

## Ikki usul

### 1. `ollama launch`

Ollama'ning Claude Code sahifasi:

```shell
ollama launch claude
```

Model tanlash oynasi chiqadi; Claude Code o'rnatilmagan bo'lsa, Ollama o'rnatishni taklif qiladi (Quickstart). Model aniq:

```shell
ollama launch claude --model qwen3.5
```

Skript, Docker yoki CI uchun — tanlash oynalarisiz:

```shell
ollama launch claude --model <model> --yes -- -p "how does this repository work?"
```

`--yes` tanlash oynalarini o'tkazib yuboradi, kerak bo'lsa modelni yuklab oladi va `--model` ni talab qiladi; `--` dan keyingi argumentlar
to'g'ridan-to'g'ri Claude Code'ga uzatiladi (`-p` — 33-bob).

### 2. Qo'lda: muhit o'zgaruvchilari

Ollama hujjatidagi "Manual setup":

```shell
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_API_KEY=""
export ANTHROPIC_BASE_URL=http://localhost:11434
claude --model qwen3.5
```

| O'zgaruvchi | Nega |
| --- | --- |
| `ANTHROPIC_BASE_URL` | So'rovlar lokal serverga |
| `ANTHROPIC_AUTH_TOKEN=ollama` | Talab qilinadi, lekin lokal server tekshirmaydi |
| `ANTHROPIC_API_KEY=""` | Muhitda qolgan haqiqiy kalit ishlatilmasligi uchun |

Ikki muhim tafsilot:

- **Sozlamalar ustun bo'lishi mumkin.** Ollama hujjati: Claude sozlamalari shell o'zgaruvchilarini bekor qilishi mumkin — `settings.json` dagi
  `env` blokida boshqa manzil yoki kalit bo'lsa, uni ham yangilang va `/status` bilan ulanishni tekshiring.
- **Obuna o'rniga.** CC (Other LLM gateways): gateway kirish ma'lumoti o'zgaruvchisi faol bo'lganda so'rovlar claude.ai obunasi o'rniga
  shu ma'lumot bilan ketadi va obuna limitlari ularga qo'llanmaydi.

## Kontekst oynasini Claude Code'ga aytish

Bu — eng oson unutiladigan qadam. CC (Model configuration): Claude Code tanimaydigan model nomi uchun v2.1.323 dan beri **1M tokenli**
kontekst oynasini taxmin qiladi va shunga qarab avtomatik kompaktlash qiladi. Ogohlantirish shunday ko'rinadi:

```text
⚠ Model "my-gateway-opus" isn't recognized · context assumed to be 1m tokens · ...
```

Lokal modelning haqiqiy oynasi esa, masalan, 64k (54-bob). Claude Code 1M deb o'ylab kompaktlashni kechiktiradi, model esa allaqachon
oshib ketgan so'rovni oladi. Yechim (CC): haqiqiy oynani bering —

```shell
CLAUDE_CODE_MAX_CONTEXT_TOKENS=64000 claude --model qwen3.5
```

CC: `claude-` bilan boshlanmaydigan va `[1m]` qo'shimchasisiz tanilmagan ID uchun bu o'zgaruvchi o'z-o'zidan ta'sir qiladi. Qiymat Ollama'da
o'rnatilgan kontekst (`OLLAMA_CONTEXT_LENGTH`, `ollama ps` dagi `CONTEXT`) bilan bir xil bo'lishi kerak.

## Nima ishlaydi, nima yo'q

Ollama'ning Claude Code sahifasidagi imkoniyatlar ro'yxati: suhbat, ruxsat oqimi bilan buyruqlar, mos modellarda tool chaqiruvi, fayl
o'qish va tahrirlash, subagentlar, Ollama orqali veb-qidiruv, veb-sahifa olish, rasm, mos modellarda fikrlash boshqaruvi.

Ollama Anthropic mos API'sidagi cheklovlar va ularning Claude Code'dagi ta'siri:

| Qo'llab-quvvatlanmaydi (Ollama) | Claude Code'da nima bo'ladi | Bob |
| --- | --- | --- |
| Prompt kesh (`cache_control`) | Har so'rovda butun kontekst qayta ishlanadi — uzun sessiya sekinlashadi | 41 |
| `/v1/messages/count_tokens` | Token sanash endpoint'i yo'q (CC gateway hujjatida bu endpoint ixtiyoriy) | — |
| `tool_choice` | Tool'ni majburlash yoki o'chirish yo'q | — |
| PDF (`document` bloklari) | PDF fayllarni modelga berib bo'lmaydi | 10 |
| URL orqali rasm | Faqat base64 rasm | 10 |
| Extended thinking — qisman | `budget_tokens` qabul qilinadi, lekin majburlanmaydi | 40 |
| Token sonlari — taxminiy | `/usage` raqamlari taqribiy | 41 |

Claude Code tomonidan: Remote Control `ANTHROPIC_BASE_URL` boshqa host'ga qaratilganda ishlamaydi (58-bob). Ruxsatlar, sandbox, hook'lar
esa Claude Code'ning o'zida — ular model qaysi bo'lishidan qat'i nazar amal qiladi (35, 36, 26-boblar). Bu muhim: kuchsizroq model
xatoga ko'proq moyil bo'lishi mumkin, harness himoyasi esa o'zgarmaydi.

## Sozlamani loyihaga yozish

Har safar o'zgaruvchi yozmaslik uchun — lokal sozlama faylida (`.claude/settings.local.json`, git'ga tushmaydi — 44-bob):

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:11434",
    "ANTHROPIC_AUTH_TOKEN": "ollama",
    "ANTHROPIC_API_KEY": "",
    "CLAUDE_CODE_MAX_CONTEXT_TOKENS": "64000"
  },
  "model": "qwen3.5"
}
```

CC (Settings reference — `env`): bu yerdagi qiymat shell'dagi o'sha o'zgaruvchini bekor qiladi; loyiha va lokal sozlamalardagi `env`
papkaga ishonch berilgandan keyin qo'llanadi (`-p` da — ishga tushishda). Bir guruh o'zgaruvchilarni (fayl joylari, telemetriya
eksporti) repo sozlamalari o'rnata olmaydi — `ANTHROPIC_BASE_URL` bu ro'yxatda yo'q. Qiymatlar faylda oddiy matnda turadi: haqiqiy API
kalitlarni bu yerga yozmang (38-bob).

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| `CLAUDE_CODE_MAX_CONTEXT_TOKENS` ni bermaslik | Claude Code 1M taxmin qiladi, kompaktlash kechikadi | Ollama kontekstiga teng qiymat |
| `ANTHROPIC_API_KEY` ni muhitda qoldirish | Haqiqiy kalit ishlatilishi yoki chalkashlik | `ANTHROPIC_API_KEY=""` |
| `settings.json` dagi eski `env` ni unutish | Shell o'zgaruvchisini bekor qiladi | `/status` bilan tekshirish |
| Tool chaqiruvisiz model | Agent sifatida ishlamaydi | 54-bob |
| Lokal model bilan ruxsatlarni bo'shatish | Himoya harness'da, model kuchsizroq bo'lishi mumkin | Ruxsatlar va sandbox o'sha-o'sha |
| Bulutdagi tajribani kutish | Kesh yo'q, kontekst kichik | 56-bobdagi usul bilan o'lchash |

## Amaliyot

1. Claude Code'ni Ollama'ga ulashning ikki usuli qaysilar?
2. Qo'lda ulashda qaysi uch o'zgaruvchi o'rnatiladi va nega `ANTHROPIC_API_KEY` bo'sh?
3. Nega `CLAUDE_CODE_MAX_CONTEXT_TOKENS` kerak?
4. Ollama'da prompt kesh yo'qligi Claude Code ishiga qanday ta'sir qiladi?
5. Lokal model bilan ruxsatlar va sandbox o'zgaradimi?

<details>
<summary>Javoblar</summary>

1. `ollama launch claude` (kerak bo'lsa `--model`, skript uchun `--yes`) va qo'lda muhit o'zgaruvchilari bilan `claude --model ...`.
2. `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN=ollama`, `ANTHROPIC_API_KEY=""`; muhitda qolgan haqiqiy kalit ishlatilmasligi uchun.
3. Claude Code tanimaydigan model uchun 1M oynani taxmin qiladi; haqiqiy oyna kichik bo'lsa, kompaktlash kechikadi.
4. Har so'rovda butun kontekst qayta ishlanadi — uzun sessiya sekinlashadi.
5. Yo'q — ular Claude Code'da, model qaysi bo'lishidan qat'i nazar amal qiladi.

</details>

## Rasmiy hujjat

- [Ollama: Claude Code](https://docs.ollama.com/integrations/claude-code)
- [Ollama: Anthropic compatibility](https://docs.ollama.com/api/anthropic-compatibility)
- [CC: Gateway compatibility guide — API formats](https://code.claude.com/docs/en/llm-gateway-protocol)
- [CC: Model configuration — Correct the window for a gateway or custom model ID](https://code.claude.com/docs/en/model-config)
- [CC: Other LLM gateways — Subscriptions and gateways](https://code.claude.com/docs/en/llm-gateway)
