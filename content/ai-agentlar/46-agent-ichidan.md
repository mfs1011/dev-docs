# 46 — Agent ichidan qaraganda

[Mundarija](README.md)

> Bu va keyingi bob — o'z agentingizni yasash. Misollar Claude Agent SDK (TypeScript, `@anthropic-ai/claude-agent-sdk` 0.3.326) bilan
> sinov kompyuterida ishga tushirildi. Hujjat bo'yicha SDK uchun **API kalit** kerak (Claude Console). Sinovda SDK mavjud Claude Code
> login'i bilan ishladi (`apiKeySource: none`), lekin CC: Anthropic oldindan ruxsatsiz uchinchi tomon ishlab chiquvchilarga o'z
> mahsulotlarida claude.ai login'ini taklif qilishga ruxsat bermaydi — boshqalar ishlatadigan agent uchun API kalit.

## Tushuncha

3-bobda agent sikli tushuncha sifatida ko'rildi. Endi uni kod darajasida ko'ramiz: Claude Code ichida aynan nima aylanadi?

### Sikl besh qadamda

CC (Agent SDK — How the agent loop works): SDK Claude Code'ni ishlatadigan **o'sha** sikl bilan ishlaydi:

1. **So'rovni olish.** Claude so'rovingizni tizim ko'rsatmasi, tool ta'riflari va suhbat tarixi bilan birga oladi. SDK `SystemMessage`
   (`subtype: "init"`) beradi.
2. **Baholash va javob.** Claude holatni baholaydi: matn yozadi, bir yoki bir nechta tool chaqiruvini so'raydi yoki ikkalasi. SDK har
   kontent bloki uchun `AssistantMessage` beradi.
3. **Tool'larni bajarish.** SDK so'ralgan tool'larni ishga tushiradi va natijani yig'adi. Natijalar keyingi qaror uchun Claude'ga
   qaytadi. Hook bilan tool chaqiruvini bajarilishidan oldin ushlash, o'zgartirish yoki bloklash mumkin.
4. **Takrorlash.** 2 va 3 qadamlar aylanadi — Claude tool chaqiruvisiz javob bergunicha.
5. **Natija.** Oxirgi `AssistantMessage` (faqat matn), keyin `ResultMessage`: yakuniy matn, token, narx, sessiya ID.

**Navbat** (turn) — sikldan bir o'tish: Claude chiqish beradi, unda tool chaqiruvi bo'lsa, SDK bajaradi va natija avtomatik qaytadi.
Bu kodingizga boshqaruv qaytmasdan sodir bo'ladi.

### Xabar turlari

| Tur | Qachon |
| --- | --- |
| `SystemMessage` | Sessiya hodisalari: `init`, `compact_boundary` (kompaktlashdan keyin) va boshqalar |
| `AssistantMessage` | Claude javobidagi har kontent bloki: matn yoki tool chaqiruvi |
| `UserMessage` | Har tool bajarilgandan keyin — Claude'ga qaytgan natija |
| `StreamEvent` | Faqat qisman xabarlar yoqilganda: xom oqim hodisalari |
| `ResultMessage` | Sikl oxiri: natija, `usage`, `total_cost_usd`, `num_turns`, `session_id`, `subtype` |

33-bobdagi `claude -p --output-format stream-json` aynan shu oqim edi.

### Siklni boshqarish

| Parametr | Nimani boshqaradi | Standart |
| --- | --- | --- |
| `maxTurns` | Navbatlar soni | Cheksiz |
| `maxBudgetUsd` | Taxminiy sarf chegarasi | Cheksiz |
| `effort` | Fikrlash darajasi (40-bob) | Claude Code o'zi aniqlaydi |
| `model` | Model | — |
| `allowedTools` | Ro'yxatdagi tool'lar **so'ramasdan** ishlaydi | — |
| `disallowedTools` | Ro'yxatdagi tool'lar har qanday holatda bloklanadi | — |
| `permissionMode` | `default`, `acceptEdits`, `plan`, `dontAsk`, `auto`, `bypassPermissions` | `default` |
| `hooks` | `PreToolUse`, `PostToolUse`, `Stop` va boshqalar — kodingizdagi callback'lar | — |

Muhim: `allowedTools` **cheklamaydi**, faqat avtomatik tasdiqlaydi. Ro'yxatda yo'q tool'lar ham mavjud; tasdiq kerak bo'lgan chaqiruvlar
ruxsat rejimiga va `canUseTool` callback'iga o'tadi. `default` rejimida callback bo'lmasa — rad. Tool rad etilganda Claude natija
sifatida rad xabarini oladi va odatda boshqa yo'l izlaydi.

CC: chegara bo'lmasa sikl Claude o'zi tugatguncha aylanadi — aniq vazifada yaxshi, lekin "kod bazasini yaxshila" kabi ochiq so'rovda
uzoq davom etishi mumkin. Production agentlar uchun **byudjet qo'yish yaxshi standart**.

Natija turlari: `success`, `error_max_turns`, `error_max_budget_usd`, `error_during_execution`, `error_max_structured_output_retries`.
`result` maydoni faqat `success` da bor. Bitta `query()` xato natijasidan keyin istisno (exception) ham chiqaradi — `try` bilan o'rang.

## Amalda: siklni ko'zdan kechirish

40-bobdagi bo'lib to'lash xatosi, bu safar o'z skriptimizdan. Har xabar turini va har tool chaqiruvini (`PreToolUse` hook orqali)
chiqaramiz:

```js
import { query } from '@anthropic-ai/claude-agent-sdk';

const [cwd, maxTurns] = [process.argv[2], Number(process.argv[3])];

// Har tool chaqiruvidan oldin ishlaydi: siklni ko'rinadigan qiladi
const kuzat = async (input) => {
  console.log(`  [hook] ${input.tool_name} ${JSON.stringify(input.tool_input).slice(0, 70)}`);
  return {};
};

try {
  for await (const m of query({
    prompt: "tolov.js dagi bolibTolash funksiyasida xato bor: ... Tuzat va npm test bilan tekshir.",
    options: {
      cwd, model: 'haiku', effort: 'low', maxTurns,
      settingSources: ['project'],
      allowedTools: ['Read', 'Edit', 'Bash(npm test*)'],
      hooks: { PreToolUse: [{ hooks: [kuzat] }] },
    },
  })) {
    if (m.type === 'system' && m.subtype === 'init') console.log(`system/init  model=${m.model}`);
    if (m.type === 'assistant') for (const c of m.message.content) {
      if (c.type === 'tool_use') console.log(`assistant    tool_use: ${c.name}`);
      if (c.type === 'text') console.log(`assistant    text: ${c.text.slice(0, 80)}…`);
    }
    if (m.type === 'user') for (const c of m.message.content ?? []) {
      if (c.type === 'tool_result') console.log(`user         tool_result${c.is_error ? ' (xato)' : ''}`);
    }
    if (m.type === 'result') console.log(`result       ${m.subtype}  turns=${m.num_turns}  $${m.total_cost_usd.toFixed(4)}`);
  }
} catch (e) {
  console.log(`(query xato bilan tugadi: ${e.message.slice(0, 60)})`);
}
```

### `maxTurns: 2`

```text
system/init  model=claude-haiku-5-5
assistant    tool_use: Bash
  [hook] Bash {"command":"ls -la && cat tolov.js && cat package.json && ls test* tes
user         tool_result
assistant    tool_use: Bash
  [hook] Bash {"command":"cat tolov.test.js && npm test 2>&1 | tail -30","descriptio
user         tool_result
result       error_max_turns  turns=3  $0.0046
(query xato bilan tugadi: Claude Code returned an error result: Reached maximum number)
```

Agent faqat "atrofni o'rganish" bosqichiga ulgurdi. Natija — `error_max_turns`, `result` maydoni yo'q, `query()` istisno chiqardi.
Fayl o'zgarmadi.

### `maxTurns: 20`

```text
system/init  model=claude-haiku-5-5
assistant    tool_use: Bash          ← ls, cat (kontekst yig'ish)
user         tool_result
assistant    tool_use: Bash          ← testlar va eski test fayli
user         tool_result
assistant    text: Test o'tdi, lekin bu faqat teng bo'linadigan holatni tekshiradi. Endi noteng hol…
assistant    tool_use: Bash          ← node -e "..." (xatoni qayta hosil qilish)
user         tool_result (xato)      ← ruxsat yo'q
assistant    tool_use: Write
user         tool_result (xato)      ← ruxsat yo'q
assistant    tool_use: Write
user         tool_result (xato)      ← ruxsat yo'q
assistant    tool_use: Bash          ← npm test
user         tool_result
assistant    tool_use: Edit          ← tolov.js
user         tool_result
assistant    tool_use: Edit          ← tolov.test.js
user         tool_result
assistant    tool_use: Bash          ← npm test
user         tool_result
assistant    text: Xato tuzatildi va `npm test` o'tdi (2/2). ...
result       success  turns=10  $0.0056
```

Bu chiqishda butun nazariya ko'rinadi:

1. **Sikl** — 3-bobdagi "kontekst yig'ish → harakat → tekshirish" aynan: avval `ls`/`cat`, keyin tuzatish, keyin `npm test`.
2. **Ruxsatlar siklning bir qismi.** `node -e` va `Write` `allowedTools` da yo'q, `default` rejimida callback yo'q — rad etildi.
   Agent to'xtamadi: rad xabarini natija sifatida olib, ruxsat etilgan `Edit` ga o'tdi. `ls`, `cat` kabi o'qish buyruqlari esa
   ruxsatsiz ham ishladi (tasdiq talab qilmaydigan chaqiruvlar).
3. **Hook kontekstga tushmaydi.** CC: hook'lar ilovangiz jarayonida ishlaydi, agent kontekstida emas — token sarflamaydi.
4. **Yashirin tekshiruv** (40-bob): yig'indi xatosi 0, noto'g'ri kiritishlar tekshirilmaydi — Haiku `low` dagi natija bilan bir xil.

## Eng oddiy yechimdan boshlash

AE (Building effective agents, 2024-12-19) ikki tizimni ajratadi:

| | Ta'rif |
| --- | --- |
| **Workflow** | LLM va tool'lar oldindan belgilangan kod yo'llari bilan boshqariladi |
| **Agent** | LLM o'z jarayoni va tool'lardan foydalanishni dinamik boshqaradi |

Asosiy maslahat: **iloji boricha eng oddiy yechimdan boshlang**, murakkablikni faqat kerak bo'lganda oshiring. Agentli tizimlar
yaxshiroq natija uchun kechikish va narxni almashtiradi — bu almashinuv o'zini oqlashi kerak. Ko'p ilovalar uchun bitta LLM
chaqiruvini qidiruv va misollar bilan yaxshilash odatda yetarli.

Maqoladagi workflow namunalari:

| Namuna | Mazmuni |
| --- | --- |
| Prompt zanjiri (prompt chaining) | Vazifani ketma-ket qadamlarga bo'lish, oralarida tekshiruv |
| Yo'naltirish (routing) | Kirishni tasniflab, maxsus keyingi vazifaga yuborish |
| Parallellashtirish | Kichik vazifalarni bir vaqtda yoki bir vazifani bir necha marta (ovoz berish) |
| Orkestrator–ishchilar | Markaziy LLM vazifani bo'lib, ishchilarga beradi va natijalarni birlashtiradi (32-bob) |
| Baholovchi–optimallashtiruvchi | Bir LLM javob yozadi, boshqasi tanqid qiladi, siklda |

Agent qachon kerak: zarur qadamlar sonini oldindan bilish qiyin yoki imkonsiz bo'lgan **ochiq muammolar**. Xavfi: yuqori narx va
**xatolarning to'planishi** — shuning uchun sandbox muhitida keng sinov va to'siqlar (guardrails).

### Framework yashiradigan narsalar

AE: Claude Agent SDK kabi framework'lar oddiy vazifalarni soddalashtiradi, lekin prompt va javoblarni yashiradigan abstraksiya
qatlamlari qo'shishi mumkin — bu debugging'ni qiyinlashtiradi. Maslahat: LLM API'dan to'g'ridan-to'g'ri boshlash; framework ishlatsangiz,
**ichidagi kodni tushunganingizga ishonch hosil qiling**.

Tajribada bu amalda ko'rindi: bitta qatorli `"2+2 nechaga teng?"` so'rovi standart sozlamalarda (Opus, tool'lar bilan) **$0.19**
turdi. Sabab — SDK so'rovga Claude Code'ning to'liq tizim ko'rsatmasi va tool ta'riflarini qo'shadi; ular birinchi so'rovda keshga
yoziladi (41-bob). Yuqoridagi tuzatish vazifasi esa Haiku bilan $0.0056 turdi. Framework qulay, lekin nimani yuborayotganini bilish
kerak.

Maqolaning uch asosiy tamoyili:

1. Agent dizaynida **soddalikni** saqlash.
2. Agentning reja qadamlarini aniq ko'rsatib, **shaffoflikni** birinchi o'ringa qo'yish (yuqoridagi hook — shuning namunasi).
3. **Agent–kompyuter interfeysini** (ACI) puxta ishlash: tool hujjatlari va sinovlar (47-bob).

## Variantlar

| Vazifa | Yondashuv | Trade-off |
| --- | --- | --- |
| Bitta aniq o'zgartirish (tasniflash, xulosa) | Bitta LLM chaqiruvi | Eng arzon va oldindan aytib bo'ladigan |
| Ma'lum qadamlar ketma-ketligi | Workflow (prompt zanjiri, yo'naltirish) | Nazorat sizda; moslashuvchanlik kam |
| Qadamlar soni noma'lum, fayllar va buyruqlar bilan ishlash | Agent (SDK) | Moslashuvchan; narx va xato to'planishi |
| Claude Code'ning o'zi yetarli | `claude -p` (33-bob) | Kod yozish kerak emas |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Bitta LLM chaqiruvi yetadigan joyda agent | AE: murakkablik o'zini oqlashi kerak | Eng oddiy yechimdan boshlash |
| `maxTurns`/`maxBudgetUsd` siz production agent | CC: ochiq so'rovda uzoq davom etadi | Byudjet — yaxshi standart |
| `allowedTools` ni cheklov deb bilish | U faqat avtomatik tasdiqlaydi | `disallowedTools`, `permissionMode`, `canUseTool` |
| `result` ni `subtype` tekshirmasdan o'qish | Faqat `success` da bor | Avval `subtype` |
| `query()` ni `try` siz | Xato natijasidan keyin istisno chiqaradi | `try/catch` |
| Framework ichida nima yuborilayotganini bilmaslik | AE: debugging qiyinlashadi; tajribada "2+2" $0.19 | Oqimni log qilish, model va tool'larni aniq berish |

## Amaliyot

1. Agent siklining besh qadamini ayting.
2. SDK qaysi xabar turlarini beradi va ular siklning qaysi qismiga mos?
3. `allowedTools` va `disallowedTools` qanday farq qiladi?
4. Tajribada `Write` rad etilganda agent nima qildi?
5. Workflow va agent qanday farq qiladi? Agent qachon kerak?
6. Nega "2+2" so'rovi $0.19 turdi va bundan qanday xulosa chiqadi?

<details>
<summary>Javoblar</summary>

1. So'rovni olish (init), baholash va javob (matn/tool chaqiruvi), tool'larni bajarish, takrorlash, natija (`ResultMessage`).
2. `SystemMessage` (init, kompaktlash), `AssistantMessage` (matn yoki tool chaqiruvi), `UserMessage` (tool natijasi), `StreamEvent` (qisman oqim), `ResultMessage` (sikl oxiri).
3. `allowedTools` ro'yxatdagilarni so'ramasdan ishga tushiradi, boshqalarni cheklamaydi; `disallowedTools` ro'yxatdagilarni har qanday holatda bloklaydi.
4. Rad xabarini natija sifatida oldi va to'xtamasdan ruxsat etilgan `Edit` tool'iga o'tdi.
5. Workflow — oldindan belgilangan kod yo'llari; agent — LLM jarayonni o'zi boshqaradi. Agent qadamlar sonini oldindan bilib bo'lmaydigan ochiq muammolarda kerak.
6. SDK so'rovga Claude Code'ning to'liq tizim ko'rsatmasi va tool ta'riflarini qo'shadi, ular keshga yoziladi (standart model — Opus). Framework qulay, lekin nima yuborilayotganini bilish va model, tool'larni aniq berish kerak.

</details>

## Rasmiy hujjat

- [CC: Agent SDK — How the agent loop works](https://code.claude.com/docs/en/agent-sdk/agent-loop)
- [CC: Agent SDK — Control execution with hooks](https://code.claude.com/docs/en/agent-sdk/hooks)
- [CC: Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview)
- [AE: Building effective agents](https://www.anthropic.com/research/building-effective-agents)
