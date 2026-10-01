# 87 — Agentlar va vositalar (tool calling)

[← Oldingi: RAG va vektor qidiruv](86-rag-va-vektor-qidiruv.md) · [Mundarija](README.md) · [Keyingi: AI xavfsizligi →](88-ai-xavfsizligi.md)

## Tushuncha

**Tool calling** — model matn o'rniga "shu funksiyani shu argumentlar bilan chaqir" degan so'rov qaytaradi; **sizning kodingiz** uni bajaradi va natijani modelga qaytaradi. **Agent** — shu siklning takrorlanishi: model reja tuzadi, vosita chaqiradi, natijaga qarab keyingi qadamni tanlaydi, maqsadga yetguncha.

```text
Foydalanuvchi: "7f3a buyurtmam qayerda? Kechiksa bekor qil"
  model → tool: getOrder({ id: "7f3a" })          → kod bajaradi → { status: "delayed", eta: "5 kun" }
  model → tool: cancelOrder({ id: "7f3a" })       → ⚠ tasdiq kerak → foydalanuvchi "Ha"
  model → "Buyurtma bekor qilindi, pul 3 kunda qaytadi."
```

Arxitektura nuqtai nazaridan agent — **ishonchsiz rejalashtiruvchi** (model) va **ishonchli ijrochi** (sizning kodingiz). Barcha xavfsizlik va to'g'rilik ijrochi tomonda.

| Atama | Ma'no |
| --- | --- |
| **Vosita (tool)** | Nom + tavsif + kiritma sxemasi + sizning funksiyangiz |
| **Workflow** | Qadamlar kod bilan belgilangan, model faqat ichida qaror qiladi — bashorat qilinadi |
| **Agent** | Qadamlar ketma-ketligini modelning o'zi tanlaydi — moslashuvchan, lekin kamroq bashorat qilinadi |
| **MCP** | Model Context Protocol — vositalarni ilovalarga ulashning ochiq standarti |

## Nega shunday

Model vositani chaqirishga "qaror qiladi" — lekin bu qaror xato bo'lishi, prompt injection bilan boshqarilishi (88-bob) yoki noto'g'ri argumentli bo'lishi mumkin. "AI qildi" — javob emas: agent `deleteUser` chaqirgan bo'lsa, bu tizimning xatosi. Shuning uchun vositalarni API endpoint'lari kabi loyihalaymiz: avtorizatsiya, validatsiya, idempotentlik, audit — xuddi tashqi klient uchun kabi (77-bob).

## Psevdokod: vositani to'g'ri loyihalash

```text
tool cancelOrder:
  description: "Foydalanuvchining o'z buyurtmasini bekor qiladi. Faqat 'pending' yoki 'delayed' holatda."
  input: { orderId: string, reason: enum(delayed, changed_mind, other) }
  risk: "write"                                   // read | write | destructive
  requiresConfirmation: true

  execute(input, ctx):                            // ctx — model emas, SESSIYA'dan: userId, tenantId, ruxsatlar
    input = parse(CancelOrderInput, input)        // sxema tekshiruvi (12-bob)
    order = orders.findForUser(input.orderId, ctx.userId) ?? return error("not_found")   // BOLA yo'q (77-bob)
    authorize(ctx, "order.cancel", order)         // 62-bob
    return ordering.cancel(order, input.reason, idempotencyKey: ctx.toolCallId)          // 70-bob

Qoidalar:
  - foydalanuvchi identifikatori HECH QACHON model argumentidan olinmaydi — faqat sessiyadan
  - vosita — tor va aniq ("cancelOrder"), umumiy emas ("runSql", "httpRequest")
  - xatolar modelga tushunarli: { error: "not_cancellable", reason: "already shipped" }
```

## Psevdokod: ruxsatlar chegarasi va tasdiq

```text
Agentning huquqlari ⊆ foydalanuvchining huquqlari (hech qachon ko'p emas)
  support agenti: getOrder, listOrders (read) + cancelOrder (write, tasdiq bilan)
  YO'Q: refund > 1 000 000 so'm, deleteAccount, changeEmail — faqat odam orqali

Tasdiq oqimi (human-in-the-loop):
  model → toolCall(cancelOrder, args)
  server → UI: "Buyurtma 7f3a bekor qilinsinmi?"  [Ha] [Yo'q]     // aniq, model matnisiz
  foydalanuvchi "Ha" → server bajaradi → natija modelga
  holat saqlanadi: kutilayotgan toolCall DB'da (sahifa yangilansa ham davom etadi)
```

Tasdiq oynasida **server shakllantirgan** aniq ma'lumot ko'rsatiladi (buyurtma raqami, summa), modelning "chiroyli" tavsifi emas.

## Psevdokod: agent sikli va cheklovlar

```text
runAgent(goal, ctx):
  messages = [system, user(goal)]
  for step in 1..MAX_STEPS (masalan 10):
    response = llm.complete(messages, tools: allowedTools(ctx))
    if response.isFinalAnswer: return response
    for call in response.toolCalls:
      if call.tool.requiresConfirmation: return awaitConfirmation(call)
      result = execute(call, ctx, timeout: 10s)
      messages.append(toolResult(call.id, truncate(result, 4000 tokens)))
    if budgetExceeded(ctx): return partial("Limitga yetdim")
  return partial("Qadamlar limiti")

Cheklovlar: qadamlar soni, umumiy token/xarajat, vaqt, bir vositani takror chaqirish
Trace: har qadam — span (75-bob): qaysi vosita, argumentlar, natija, token
```

Avval eng oddiy yechimni sinang: bitta LLM chaqiruvi → aniq workflow → faqat kerak bo'lsa agent. Ko'p "agent" vazifalar aslida 3 qadamli workflow.

## Framework'larda

| Qism | Vositalar | Saytdagi bog'liq boblar |
| --- | --- | --- |
| Tool calling | Provayder SDK'lari, Vercel AI SDK `tools`, Symfony AI, Prism | — |
| MCP serverlar | Rasmiy TS/PHP/Python SDK'lar — mavjud API'ni vosita sifatida ochish | [Arxitektura 53-bob](53-api-shartnoma.md) |
| Avtorizatsiya | Voter / Policy — vosita ichida ham | [Symfony 23](../symfony/23-avtorizatsiya.md), [Laravel 22-bob](../laravel/22-avtorizatsiya.md) |
| Idempotentlik va audit | Idempotency key, audit log | [Arxitektura 70](70-idempotentlik.md), [31-bob](31-audit.md) |
| Uzun agent ishlari | Navbat, holat DB'da | [Arxitektura 26-bob](26-navbat.md) |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Workflow (kod boshqaradi) | Bashorat qilinadi, test oson | Kam moslashuvchan |
| Agent (model boshqaradi) | Ochiq vazifalar | Xarajat, kechikish, kutilmagan yo'llar |
| Har yozish amaliga tasdiq | Xavfsiz | Foydalanuvchi uchun ko'proq bosish |
| Ko'p vositalar | Imkoniyat keng | Model chalkashadi, hujum yuzasi katta |
| Umumiy vositalar (SQL, HTTP) | Tez yaratiladi | Juda xavfli — huquqlarni cheklab bo'lmaydi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| userId model argumentidan | Model boshqa foydalanuvchi nomidan ishlaydi | Faqat sessiyadan |
| `runSql` vositasi | Har qanday ma'lumot ochiq | Tor, aniq vositalar |
| Qadam/xarajat limiti yo'q | Cheksiz sikl, katta hisob | MAX_STEPS, byudjet |
| Yozish amali tasdiqsiz | Noto'g'ri yoki manipulyatsiya qilingan harakat | Human-in-the-loop |
| Idempotentlik yo'q | Retry — ikki marta bekor/qaytarish | Idempotency key = toolCallId |
| Trace yo'q | "Agent nega bunday qildi?" — javob yo'q | Har qadam span va audit |

## Amaliyot

1. Mavjud bitta API amalingizni vosita sifatida loyihalang: sxema, risk darajasi, avtorizatsiya, idempotentlik.
2. Agentdan "boshqa foydalanuvchining buyurtmasini ko'rsat" deb so'rab sinang — vosita darajasida rad etilishi kerak.
3. Bitta "agent" vazifangizni workflow sifatida qayta yozib ko'ring — sifat va narx qanday o'zgardi?
4. Agent sikli uchun qadam, vaqt va xarajat limitlarini qo'ying va trace'da tekshiring.

## Manbalar

- Anthropic — *Building effective agents* (2024)
- Model Context Protocol <https://modelcontextprotocol.io/>
- OWASP — *Agentic AI: Threats and Mitigations*
