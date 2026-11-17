# 54 — Model serverini ko'tarish

[Mundarija](README.md)

> ⚑ Rasmiy Ollama hujjati asosida (v0.40.16, 2026-11-09). Buyruqlar hujjatdan aynan olingan; bu qo'llanmada ishga tushirilmagan.

## Tushuncha

**Model serveri** — modelni xotiraga yuklab, unga HTTP orqali so'rov qabul qiladigan dastur. Bu bobda — **Ollama**: Claude Code uchun
alohida integratsiya sahifasi bor rasmiy hujjatli loyiha (53-bob).

Ollama standart holatda `127.0.0.1:11434` da tinglaydi (Ollama FAQ) — ya'ni faqat shu kompyuterdan kirish mumkin.

## O'rnatish

| Tizim | Usul (Ollama hujjati) |
| --- | --- |
| macOS | `ollama.dmg` ni ochib, ilovani `Applications` ga sudrab tashlash; ilova ishga tushganda CLI'ni PATH'ga qo'shishni so'raydi |
| Linux | `curl -fsSL https://ollama.com/install.sh \| sh` |
| Windows | ollama.com/download dan o'rnatuvchi |

macOS talablari: Sonoma (14) yoki yangiroq; Apple M seriyasi — CPU va GPU, x86 — faqat CPU.

Diqqat: o'rnatish skripti internetdan yuklab olinadi va ishga tushiriladi. 37-bobdagi qoida bu yerda ham amal qiladi: avval skriptni o'qing
yoki qo'lda o'rnatish yo'lidan foydalaning (Ollama Linux hujjatida "Manual install" bo'limi bor).

## Asosiy buyruqlar

Ollama CLI hujjatidan:

```shell
ollama pull <model>     # modelni yuklab olish
ollama ls               # yuklangan modellar
ollama run <model>      # model bilan suhbat
ollama ps               # xotiradagi modellar: hajmi, PROCESSOR (GPU/CPU), CONTEXT
ollama rm <model>       # modelni o'chirish
ollama serve            # serverni qo'lda ishga tushirish
```

Modellar saqlanadigan joy (FAQ): macOS — `~/.ollama/models`, Linux — `/usr/share/ollama/.ollama/models`, Windows —
`C:\Users\%username%\.ollama\models`.

## Model tanlash

Ollama'ning Claude Code sahifasi: repozitoriyingiz uchun **yetarli kontekstli** modelni tanlang. Ikki toifa:

| Toifa | Qayerda | Nima uchun |
| --- | --- | --- |
| Lokal modellar | ollama.com/search?c=tools — tool chaqiruvini qo'llab-quvvatlaydiganlar | Kompyuterda; tanlang va 64k+ kontekst o'rnating |
| Bulut modellari | ollama.com/search?c=cloud | Kattaroq modellar yuklab olmasdan; so'rovlar ollama.com'ga |

Agent uchun eng muhim talab — **tool chaqiruvi** (function calling). Usiz model fayl o'qiy olmaydi, buyruq bajara olmaydi — agent emas,
oddiy suhbat. Ollama'ning Anthropic mos API hujjati: mos modellar xabarlar, oqim (streaming) va function calling'ni qo'llab-quvvatlaydi.

Model nomlari va katalog tez o'zgaradi — qo'llanmada aniq model tavsiya qilinmaydi. Tanlashda katalogdagi "tools" belgisi va model
hajmi (xotirangizga sig'ishi) asosiy mezon.

## Kontekst oynasini o'rnatish

Ollama standarti kichik GPU'da 4k (53-bob). Agent uchun kamida 64 000:

```shell
OLLAMA_CONTEXT_LENGTH=64000 ollama serve
```

Yoki Ollama ilovasida sozlamalardagi slayder. Tekshirish — `ollama ps` dagi `CONTEXT` va `PROCESSOR` ustunlari (hujjatdagi namuna):

```text
NAME             ID              SIZE      PROCESSOR    CONTEXT    UNTIL
gemma4:latest    c6eb396dbd59    9.6 GB    100% GPU     131072     2 minutes from now
```

Kontekst oshgani sari kerakli xotira ham oshadi. `PROCESSOR` `100% GPU` dan pastga tushsa (model qisman CPU'da), tezlik keskin pasayadi —
Ollama hujjati CPU'ga tushirmaslikni tavsiya qiladi.

## Faqat lokal rejim

Ollama'ning bulut imkoniyatlarini o'chirish (FAQ) — `~/.ollama/server.json`:

```json
{
  "disable_ollama_cloud": true
}
```

yoki muhit o'zgaruvchisi `OLLAMA_NO_CLOUD=1`. Ollama'ni qayta ishga tushirgandan keyin log'da `Ollama cloud disabled: true` ko'rinadi.
Bu holda bulut modellari va veb-qidiruv ishlamaydi — maxfiylik maqsadi uchun aynan shu kerak.

## Server tarmog'i

Standart `127.0.0.1:11434` — eng xavfsiz. Boshqa kompyuterlardan foydalanish uchun `OLLAMA_HOST` bilan manzilni o'zgartirish mumkin
(FAQ). Bunda server tarmoqqa ochiladi — **lokal server API kalitlarni tekshirmaydi** (Ollama: Anthropic compatibility — "The local server
does not validate API keys"). Ya'ni tarmoqqa ochilgan Ollama'dan kim xohlasa foydalanadi. Faqat ishonchli tarmoqda yoki oldida
autentifikatsiyali proksi bilan (Nginx qo'llanmasi).

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Tool chaqiruvini qo'llab-quvvatlamaydigan model | Agent fayl o'qiy olmaydi, buyruq bajara olmaydi | Katalogda "tools" toifasidan |
| Standart kontekst bilan qoldirish | 4k — agent sikli uchun juda kam | `OLLAMA_CONTEXT_LENGTH=64000` va `ollama ps` bilan tekshirish |
| Xotiraga sig'maydigan model | CPU'ga tushadi, juda sekin | `ollama ps` da `100% GPU` |
| `OLLAMA_HOST=0.0.0.0` bilan ochiq qoldirish | Lokal server kalit tekshirmaydi | Faqat `127.0.0.1` yoki autentifikatsiyali proksi |
| `:cloud` modelni maxfiy loyihada | So'rovlar ollama.com'ga | `disable_ollama_cloud` |
| O'rnatish skriptini o'qimasdan ishga tushirish | 37-bob | O'qish yoki qo'lda o'rnatish |

## Amaliyot

1. Ollama standart holatda qaysi manzilda tinglaydi va bu nega muhim?
2. Agent uchun modelda qaysi imkoniyat majburiy?
3. Kontekst oynasini qanday o'rnatasiz va qanday tekshirasiz?
4. Faqat lokal rejimni qanday yoqasiz?
5. Nega Ollama serverini tarmoqqa ochishdan ehtiyot bo'lish kerak?

<details>
<summary>Javoblar</summary>

1. `127.0.0.1:11434` — faqat shu kompyuterdan kirish mumkin.
2. Tool chaqiruvi (function calling); usiz model agent sifatida ishlay olmaydi.
3. `OLLAMA_CONTEXT_LENGTH=64000 ollama serve` (yoki ilova slayderi); `ollama ps` dagi `CONTEXT` ustuni.
4. `~/.ollama/server.json` da `"disable_ollama_cloud": true` yoki `OLLAMA_NO_CLOUD=1`, keyin qayta ishga tushirish.
5. Lokal server API kalitlarni tekshirmaydi — tarmoqqa ochilsa, kim xohlasa foydalanadi.

</details>

## Rasmiy hujjat

- [Ollama: Quickstart](https://docs.ollama.com/quickstart)
- [Ollama: Linux](https://docs.ollama.com/linux) · [Ollama: macOS](https://docs.ollama.com/macos)
- [Ollama: CLI reference](https://docs.ollama.com/cli)
- [Ollama: Context length](https://docs.ollama.com/context-length)
- [Ollama: FAQ](https://docs.ollama.com/faq)
- [Ollama: releases](https://github.com/ollama/ollama/releases)
