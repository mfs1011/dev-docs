# 56 — Lokal modelni o'zingiz baholash

[Mundarija](README.md)

> ⚑ Bu bobda natijalar yo'q: lokal model bu qo'llanmada sinalmadi. Bob — o'z kompyuteringizda o'lchash usuli; u 40, 41, 59 va 60-boblardagi
> haqiqatan sinalgan usullarga tayanadi. Natijalarni boshqa manbadan ko'chirmang — sizning apparatingiz, modelingiz va vazifangizda
> boshqacha bo'ladi.

## Tushuncha

"Lokal model yaxshimi?" — savol noto'g'ri. To'g'ri savol: **mening vazifalarimda, mening apparatimda, qaysi sifat va qanday tezlik bilan**?
Bunga faqat o'lchov javob beradi. Qo'llanmada bunday o'lchov uchun hamma narsa tayyor:

| Vosita | Bob | Nima uchun |
| --- | --- | --- |
| Bitta vazifa — bir nechta sozlama, yashirin tekshiruv | 40 | Sifatni agentdan mustaqil baholash |
| `-p --output-format json` | 33, 41 | Navbatlar soni, vaqt, natija |
| Sinov to'plami, har holat N marta | 59 | Izchillikni ko'rish |
| Ajratilgan yangi holatlar | 60 | Haddan tashqari moslashishni tekshirish |

## O'lchash rejasi

### 1. Bir xil vazifa

40-bobdagi `bolibTolash` vazifasi yaxshi boshlang'ich: aniq xato, aniq so'rov, yashirin tekshiruv skripti tayyor (5 577 kombinatsiya va
noto'g'ri kiritishlar). Repo'ning toza nusxasi har ishga tushirish uchun alohida.

```bash
P="tolov.js dagi bolibTolash funksiyasida xato bor: ba'zi summalarda oylik to'lovlar yig'indisi umumiy summaga teng chiqmaydi.
Tuzat, testlar qo'sh va npm test bilan tekshir. Commit qilma."
```

### 2. Sozlamalar

| Sozlama | Qanday ishga tushadi |
| --- | --- |
| Bulut (taqqoslash uchun) | `claude -p "$P" --model haiku --output-format json` |
| Lokal model A | `ANTHROPIC_BASE_URL=http://localhost:11434 ANTHROPIC_AUTH_TOKEN=ollama ANTHROPIC_API_KEY="" CLAUDE_CODE_MAX_CONTEXT_TOKENS=64000 claude -p "$P" --model <A> --output-format json` |
| Lokal model B | Xuddi shu, `--model <B>` |

Ruxsatlar hammasida bir xil (`--allowedTools "Read" "Edit" "Write" "Bash(npm test*)" "Bash(node *)"`) — farq faqat modelda bo'lsin.

### 3. Har sozlama bir necha marta

59-bob: bitta urinish izchilsizlikni yashiradi. Har sozlama kamida 3 marta, har safar repo'ning toza nusxasida.

### 4. Nimani yozib borish

| O'lchov | Qayerdan | Izoh |
| --- | --- | --- |
| Asosiy xato tuzatildimi | Yashirin tekshiruv: `yigindiXato` | 0 bo'lishi kerak |
| Chekka holatlar | Yashirin tekshiruv: `notogriKiritish` | 40-bobda faqat Opus qo'shgan |
| Testlar o'tdimi, nechta yozildi | `npm test`, test fayli | Agent "o'tdi" desa ham o'zingiz ishga tushiring |
| Navbatlar soni | JSON: `num_turns` | Ko'p navbat — model adashgan bo'lishi mumkin |
| Vaqt | JSON: `duration_ms` | Lokalda asosiy "narx" |
| Tool xatolari | `--output-format stream-json --verbose` | Tool chaqiruvini noto'g'ri formatda yuborish — kuchsiz modelning tipik belgisi |
| GPU'ga sig'dimi | `ollama ps` (`PROCESSOR`) | `100% GPU` dan past — tezlik natijasi ma'nosiz |

Narx ustuni lokal model uchun mos emas: `total_cost_usd` — Claude Code ro'yxat narxi bo'yicha hisoblagan **taxmin** (41-bob), tanimaydigan
model uchun u haqiqiy xarajatni bildirmaydi. Lokal "narx" — vaqt, elektr va apparat.

### 5. Sinov to'plami

Bitta vazifa — boshlanish. Haqiqiy qaror uchun o'z ishingizdan 5–10 ta xarakterli vazifa (xato tuzatish, kichik funksiya, refaktoring)
va har biriga kod bilan tekshiriladigan natija — 59-bobdagi kabi.

## Natijani qanday o'qish

| Ko'rinish | Ehtimoliy sabab | Nima qilish |
| --- | --- | --- |
| Agent tool chaqira olmaydi, faqat matn yozadi | Model tool chaqiruvini qo'llab-quvvatlamaydi yoki yomon bajaradi | "tools" toifasidagi boshqa model (54-bob) |
| Sessiya o'rtasida "unutadi", takrorlanadi | Kontekst kichik; `CLAUDE_CODE_MAX_CONTEXT_TOKENS` noto'g'ri | Ollama konteksti va Claude Code qiymati bir xilmi (55-bob) |
| Juda sekin | Model CPU'ga tushgan yoki kontekst juda katta | `ollama ps`; kichikroq model |
| Xato tuzatiladi, chekka holatlar yo'q | 40-bobdagi Haiku/Sonnet kabi | Talabni so'rovda aniq aytish (48-bob) |
| Natija har urinishda boshqacha | Izchilsizlik | Ko'proq urinish; muhim ishda bulut |

## Qaror

O'lchovdan keyin uch javobdan biri:

1. **Lokal yetarli** — sizning vazifalaringizda sifat qoniqarli, tezlik chidasa bo'ladi: maxfiy loyihalar uchun lokal.
2. **Aralash** — maxfiy kod lokalda, qolgani bulutda (har loyihaning `.claude/settings.local.json` ida o'z `env` i — 55-bob).
3. **Bulut** — sifat farqi juda katta: maxfiylik muammosini boshqa yo'l bilan hal qilish (tijoriy shartlar, ZDR — 38-bob).

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Boshqa birovning benchmark'iga tayanish | Boshqa apparat, boshqa vazifa | O'z vazifalaringizda |
| Bitta urinish | Izchilsizlik ko'rinmaydi | Har sozlama kamida 3 marta |
| Agentning "testlar o'tdi" iga ishonish | Kuchsiz model ham shunday deydi | O'zingiz `npm test` va yashirin tekshiruv |
| GPU'ga sig'maganda tezlikni baholash | Natija apparat cheklovini o'lchaydi | Avval `ollama ps` |
| `total_cost_usd` ni lokal xarajat deb bilish | Tanimaydigan model uchun ma'nosiz taxmin | Vaqt va apparat |

## Amaliyot

1. Nega "lokal model yaxshimi?" savoli noto'g'ri qo'yilgan?
2. O'lchashda qaysi narsalar bir xil qoldiriladi?
3. Lokal model uchun qaysi o'lchovlarni yozib borish kerak?
4. Agent tool chaqira olmasa, sabab nima bo'lishi mumkin?
5. O'lchovdan keyingi uch qaror qaysilar?

<details>
<summary>Javoblar</summary>

1. Javob vazifa, apparat va modelga bog'liq; faqat o'z sharoitingizda o'lchov javob beradi.
2. Vazifa, so'rov, repo'ning toza nusxasi, ruxsatlar — farq faqat modelda.
3. Asosiy xato tuzatilishi, chekka holatlar, testlar, navbatlar, vaqt, tool xatolari, `ollama ps` dagi GPU/CPU.
4. Model tool chaqiruvini qo'llab-quvvatlamaydi yoki yomon bajaradi.
5. Lokal yetarli; aralash (maxfiy kod lokalda); bulut (maxfiylik boshqa yo'l bilan).

</details>

## Rasmiy hujjat

- [Ollama: Claude Code](https://docs.ollama.com/integrations/claude-code)
- [Ollama: Context length — Check allocated context length and model offloading](https://docs.ollama.com/context-length)
- [Claude Platform: Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests)
- [CC: Run Claude Code programmatically (headless)](https://code.claude.com/docs/en/headless)
