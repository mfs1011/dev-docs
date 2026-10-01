# 85 — LLM integratsiyasi arxitekturasi

[← Oldingi: Qaror qabul qilish](84-qaror-qabul-qilish.md) · [Mundarija](README.md) · [Keyingi: RAG va vektor qidiruv →](86-rag-va-vektor-qidiruv.md)

## Tushuncha

LLM (katta til modeli) — arxitektura nuqtai nazaridan **sekin, qimmat, deterministik bo'lmagan tashqi bog'liqlik**. U oddiy API'ga o'xshaydi (so'rov → javob), lekin uchta xususiyati bilan farq qiladi:

| Xususiyat | Oddiy API | LLM |
| --- | --- | --- |
| Kechikish | 50–300 ms | 1–60 s (uzun javob, "fikrlash" rejimi) |
| Narx | So'rov uchun deyarli bepul | Token uchun to'lov — kiritma + chiqarma |
| Natija | Bir xil kiritma → bir xil javob | Har safar boshqacha, ba'zan noto'g'ri, ba'zan formatdan tashqari |
| Xatolar | Status kod | 429, 529 (yuklangan), timeout, **to'g'ri formatdagi noto'g'ri javob** |

Shuning uchun LLM chaqiruvi 72-bobdagi integratsiya qoidalariga (adapter, timeout, retry) va 79-bobdagi ishonchlilik naqshlariga to'liq bo'ysunadi — va bundan ko'proq narsa talab qiladi.

## Nega shunday

Tipik birinchi versiya: kontroller ichida `openai.chat(prompt)` — va hammasi ishlaydi, demo'da. Production'da: foydalanuvchi 40 soniya oq ekranga qaraydi, oy oxirida hisob 10 barobar oshadi, provayder 20 daqiqa ishlamaydi va butun feature yiqiladi, model yangilanganda javob formati o'zgaradi va parser buziladi. Bularning hammasi — arxitektura qarorlari yo'qligining natijasi.

## Psevdokod: model chaqiruvi qayerda

```text
❌ Brauzer → LLM provayder           API kaliti frontend'da (18, 76-boblar) — hech qachon

✅ Brauzer → Backend / BFF → AI gateway (ichki modul) → provayder(lar)
                               │
                               ├ auth, kvota, rate limit (30-bob)
                               ├ prompt shablonlari (versiyalangan, kod kabi)
                               ├ model tanlash va fallback
                               ├ kesh, xarajat hisobi, log/trace (75-bob)
                               └ chiqarmani tekshirish (sxema)

interface LlmClient {                       // port — provayder adapter ortida (15, 72-boblar)
  complete(request: LlmRequest): LlmResult
  stream(request: LlmRequest): Stream<LlmChunk>
}
  AnthropicAdapter, OpenAiAdapter, LocalModelAdapter — almashtiriladigan
```

## Psevdokod: sinxron, streaming yoki fon ishi

```text
Javob uzunligi va kutish vaqtiga qarab:

1. Qisqa, tez (klassifikatsiya, teg, 1–3 s)     → oddiy sinxron so'rov, timeout 10 s
2. Matn yaratish (chat, xulosa, 5–30 s)         → STREAMING: SSE orqali token-token (64-bob)
     POST /ai/chat → text/event-stream
       data: {"type":"delta","text":"Buyurt"}
       data: {"type":"delta","text":"ma holati"}
       data: {"type":"done","usage":{"in":812,"out":143}}
     UI: matn paydo bo'ladi, "To'xtatish" tugmasi (AbortController → backend ham to'xtatadi)
3. Uzun ish (hujjat tahlili, 100 sahifa, daqiqalar) → NAVBAT (26-bob)
     POST /ai/jobs → 202 { jobId } → worker → natija DB'da → bildirishnoma / polling
```

Qoida: foydalanuvchi 2 soniyadan ortiq bo'sh ekranni ko'rmasligi kerak — streaming yoki aniq progress.

## Psevdokod: tuzilgan chiqarma (structured output)

```text
// ❌ "Javobni JSON'da ber" + JSON.parse(text)   → ba'zan markdown, ba'zan izoh qo'shadi

// ✅ Sxema bilan so'rash va tekshirish
schema TicketTriage { category: enum(billing, bug, feature, other), priority: 1..4, summary: string(≤200) }

result = llm.complete({ prompt, outputSchema: TicketTriage })   // provayderning structured output rejimi
triage = parse(TicketTriage, result.json)                       // BARIBIR tekshirish (12-bob)
  ✗ → bitta qayta urinish (xato xabari bilan) → ✗ → fallback: category=other, odam ko'rib chiqadi

LLM chiqarmasi — ishonchsiz kiritma (76, 88-boblar). Uni tekshirmasdan DB'ga, SQL'ga, HTML'ga qo'ymang.
```

## Psevdokod: xarajat va kvota

```text
narx = kiritma_tokenlar × narx_in + chiqarma_tokenlar × narx_out

Boshqarish:
  - har chaqiruvda usage log: { feature, userId, tenantId, model, in, out, costMinor }
  - foydalanuvchi/tarif bo'yicha kunlik kvota → oshsa 429 + tushunarli xabar
  - max_tokens har doim belgilangan (cheksiz chiqarma yo'q)
  - model "darajalari": oddiy vazifa → kichik arzon model; murakkab → katta model
  - prompt keshlash (provayder qo'llasa): o'zgarmas uzun prefiks (tizim prompti, hujjat) — arzonroq
  - javob keshi: bir xil deterministik so'rov (temperature 0, tasnif) → kesh (25-bob)
  - alert: kunlik xarajat > byudjet
```

## Psevdokod: timeout va fallback

```text
call(request):
  try:
    return primary.complete(request, { timeout: 30s })
  catch Overloaded | Timeout | RateLimited:
    retry 1 marta backoff bilan (79-bob)
    → keyin secondary provayder / kichikroq model
    → keyin degradatsiya: "AI yordamchi hozir band, keyinroq urinib ko'ring" — asosiy funksiya ishlaydi

Circuit breaker — provayder bo'yicha. AI — qo'shimcha qiymat; u yiqilsa checkout yiqilmasligi kerak.
```

## Framework'larda

| Qatlam | Vositalar | Saytdagi bog'liq boblar |
| --- | --- | --- |
| Provayder SDK'lari | Anthropic, OpenAI rasmiy SDK'lari (PHP, TS) | — |
| Ko'p provayderli abstraksiya | Vercel AI SDK (TS), Symfony AI komponentlari, Prism (Laravel), LangChain | — |
| Streaming javob | SSE, `ReadableStream` | [Next.js 15-bob](../nextjs/15-route-handlers.md), [Arxitektura 64-bob](64-real-vaqt.md) |
| Fon ishlari | Navbat worker'lari | [Laravel 25](../laravel/25-navbatlar.md), [Symfony 26](../symfony/26-messenger.md), [Next.js 36-bob](../nextjs/36-fon-ishlari.md) |
| Kalitlar | Faqat serverda | [Angular 76-bob](../angular/76-xavfsizlik.md) — frontend'dagi kalit misoli |

Bu sohada kutubxonalar tez o'zgaradi — shuning uchun o'z `LlmClient` portingiz bo'lsin, kutubxona esa adapter ichida qolsin.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Bitta provayder | Oddiy | Uzilish va narx o'zgarishiga bog'liqlik |
| Ko'p provayder + fallback | Ishonchlilik | Har modelda prompt va sifat farqi, test ko'payadi |
| Katta model hamma joyda | Sifat | Narx va kechikish |
| O'z modelini joylash | Ma'lumot ichkarida, narx bashorat qilinadi | GPU, ops, sifat odatda pastroq |
| Streaming | Tez sezilish | Xatoni o'rtada boshqarish, tekshiruv keyin |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Kalit frontend'da | O'g'irlanadi, hisob portlaydi | Backend/BFF orqali |
| `max_tokens` va kvota yo'q | Xarajat nazoratsiz | Limitlar, usage log |
| JSON.parse(text) tekshiruvsiz | Tasodifiy buzilishlar | Structured output + sxema |
| Timeout yo'q | Worker'lar osiladi | Timeout, circuit breaker |
| Prompt kod ichida tarqoq | Versiya va test yo'q | Shablonlar, versiya, eval (89-bob) |
| AI yiqilsa asosiy feature ham yiqiladi | Bog'liqlik juda kuchli | Degradatsiya |

## Amaliyot

1. AI feature uchun `LlmClient` portini va bitta adapterni yozing; kontrollerda SDK chaqiruvi qolmasin.
2. Chat javobini SSE orqali streaming qiling va "To'xtatish" tugmasi backend'gacha yetsin.
3. Har chaqiruv uchun usage log yozing va bir kunlik xarajatni feature bo'yicha hisoblang.
4. Provayderni o'chirib (noto'g'ri URL) sinang: foydalanuvchi nima ko'radi?

## Manbalar

- Anthropic — *Building effective agents*, API hujjatlari (streaming, structured outputs, prompt caching)
- Chip Huyen — *AI Engineering* (O'Reilly)
- Vercel AI SDK hujjatlari <https://ai-sdk.dev/>
