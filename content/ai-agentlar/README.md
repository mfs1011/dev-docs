# AI agentlar bilan dasturlash

Bu qo'llanma dasturchi sun'iy intellekt (AI) bilan qanday ishlashini o'rgatadi: AI agent nima va u qanday ishlaydi, unga
vazifani qanday berish, natijani qanday tekshirish, loyiha bilimini agentga qanday yetkazish, takroriy ishlarni
avtomatlashtirish, bir nechta agentni parallel ishlatish, xavfsizlik, xarajat va AI bilan ishlaganda o'z ko'nikmangizni
qanday saqlab qolish.

**Agent** (AI agent) — oddiy chatdan farqli o'laroq, o'zi harakat qiladigan AI: fayllarni o'qiydi, kodni o'zgartiradi,
buyruqlarni ishga tushiradi, natijani ko'rib keyingi qadamni tanlaydi. Dasturchi unga vazifa beradi, yo'naltiradi va
natijani tekshiradi.

Mundarija rasmiy manbalarga solishtirib tuzilgan:

- **Claude Code rasmiy hujjati** (code.claude.com/docs) — asosiy tayanch. Tuzilmasi: How it works → Best practices →
  Common workflows → Memory/Context → Extend (skills, hooks, MCP, plugins) → Agents and parallel work → Automation →
  Permissions/Security → Costs.
- **Anthropic muhandislik maqolalari va tadqiqoti** — agent tuzilishi, kontekst va tool yozish, AI bilan o'rganish.
- **Ochiq standartlar** — MCP (Model Context Protocol) spetsifikatsiyasi, AGENTS.md formati.
- **Boshqa vositalar hujjati** — OpenAI Codex va GitHub Copilot: solishtirish va umumiy tamoyillar uchun.
- **OWASP GenAI** — LLM ilovalar xavfsizligi (Top 10, 2025).

Har bob yonida u tayanadigan rasmiy sahifalar ko'rsatilgan. Mundarija bosqichida hujjat indeksi va asosiy sahifalar
o'qildi; har bobni yozishdan oldin bob sahifalari to'liq qayta o'qiladi. Misollar haqiqiy sessiyada ishga tushiriladi,
chiqishlar va skrinshotlar haqiqiy.

Manbalar va versiyalar (2026-11-16 da tekshirilgan):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Claude Code | **2.1.325** (npm, 2026-11-13) | `npm view @anthropic-ai/claude-code` · <https://code.claude.com/docs/en/changelog> |
| MCP spetsifikatsiyasi | **2026-07-28** — "current" holatdagi versiya | <https://modelcontextprotocol.io/specification/versioning> |
| AGENTS.md | versiyasiz ochiq format; "stewarded by the Agentic AI Foundation under the Linux Foundation" | <https://agents.md/> |
| OWASP Top 10 for LLM Applications | **2025** nashri | <https://genai.owasp.org/llm-top-10/> |
| OpenAI Codex CLI | 0.169.0 (npm) — faqat hujjat bo'yicha solishtirish uchun | <https://learn.chatgpt.com/codex/working-with-agents> |
| GitHub Copilot | hujjat holati 2026-11-16 | <https://docs.github.com/en/copilot/get-started/best-practices> |

Vosita tanlovi haqida:

- **Asosiy vosita — Claude Code.** Sabab: misollarni haqiqiy muhitda ishga tushirib tekshirish sharti. Claude Code shu
  sinov kompyuterida o'rnatilgan va har bir buyruq, sozlama va chiqishni real sessiyada ko'rsatsa bo'ladi. Vosita
  "eng yaxshi" yoki "eng ko'p ishlatiladigan" deb da'vo qilinmaydi.
- **Tamoyillar vositadan mustaqil.** Vazifa berish, tekshirish, kontekst, xavfsizlik bo'limlari Codex va Copilot
  hujjatlaridagi mos tavsiyalar bilan solishtiriladi (masalan, AGENTS.md, ruxsatlar, sandbox — hammasida bor).
- **Codex va Copilot** — faqat rasmiy hujjat bo'yicha, ⚑ belgisi bilan. Ularni ham sinash uchun hisob kerak bo'ladi
  (egasining qarori).

Qisqartmalar (bob matnida qisqartma ustiga sichqonchani olib borsangiz yoki uni bossangiz, to'liq nomi chiqadi):

- **CC** — Claude Code rasmiy hujjati (code.claude.com/docs).
- **CP** — Claude Platform hujjati (platform.claude.com/docs).
- **AE** — Anthropic muhandislik maqolalari va tadqiqotlari (anthropic.com/engineering, anthropic.com/research).
- **MCP** — Model Context Protocol rasmiy sayti (modelcontextprotocol.io).
- **CX** — OpenAI Codex hujjati (learn.chatgpt.com/codex).
- **GH** — GitHub Copilot hujjati (docs.github.com/en/copilot).
- **OW** — OWASP GenAI Security Project (genai.owasp.org).

"Muhit" ustunida:

- **L** — lokal: sinov kompyuterida (macOS) Claude Code bilan, alohida sinov repozitoriysida; terminal chiqishi va skrinshot.
- **C** — CI: GitHub Actions'da, sinov repozitoriysida.
- **V** — sinov VPS'ida (Ubuntu 26.04): sandbox, konteyner, skriptdan ishga tushirish.
- **—** — tushuncha bobi, buyruqsiz.

⚑ belgisi: bobning bir qismi to'liq sinab bo'lmaydi yoki asosi faqat tadqiqot/maqola (hujjat emas) — bobda bu ochiq
aytiladi.

Bu qo'llanmaga kirmaydigan mavzular:

- LLM'ni noldan o'qitish, fine-tuning, RAG tizimlarini qurish — bu "AI bilan ishlash" emas, "AI yasash".
- Korxona administratsiyasi (SSO, gateway, bulut provayderlari orqali joylash) — tegishli boblarda faqat havola.
- Kod yozishdan tashqari AI vositalari (rasm, video, ofis hujjatlari).

---

> **Holat.** Tayyor: 1–23-boblar (2026-11-16). 22-bobning CI qismi hujjat asosida (⚑). Amaliy misollar Claude Code 2.1.325 bilan sinov kompyuterida (macOS) haqiqiy sessiyada olingan.

---

## Har bobning skeleti

- **Tushuncha** — mavzu nima, oddiy so'zlar bilan. Qiyin joy animatsiya bilan.
- **Amalda** — haqiqiy sessiya: so'rov (prompt), agent nima qildi, natija. Yomon va yaxshi so'rov yonma-yon.
- **Variantlar** — bir ishning bir necha yo'li bo'lsa, jadvalda: qachon qaysi biri, yutug'i va kamchiligi.
- **Tipik xatolar** — xato → nega yomon → to'g'ri yo'l.
- **Amaliyot** — savollar va javoblar.
- **Rasmiy hujjat** — bob tayangan sahifalar.

---

## I qism — Asoslar (1–5)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 01 | [AI dasturchiga nima beradi](01-ai-nima-beradi.md) | AI bilan ishlashning uch ko'rinishi: avtoto'ldirish (inline suggestions), chat va agent. AI nimada kuchli (testlar, takroriy kod, tushuntirish, debug) va nimada zaif. Javobgarlik dasturchida qoladi | — | [GH Best practices](https://docs.github.com/en/copilot/get-started/best-practices) · [CC Overview](https://code.claude.com/docs/en/overview) · [CX Working with agents](https://learn.chatgpt.com/codex/working-with-agents) |
| 02 | [Model qanday ishlaydi](02-model-qanday-ishlaydi.md) | Model (LLM), token, kontekst oynasi (context window) — oddiy so'zlar bilan. Nega model ishonch bilan noto'g'ri gapirishi mumkin (gallyutsinatsiya). Kontekst to'lgani sari aniqlik pasayishi (context rot) | — | [CC Explore the context window](https://code.claude.com/docs/en/context-window) · [AE Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) · [CP Prompting best practices — Minimizing hallucinations](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) |
| 03 | [Agent nima](03-agent-nima.md) | Agentik sikl: kontekst yig'ish → harakat → tekshirish. Model fikrlaydi, tool'lar harakat qiladi, harness (o'rab turuvchi dastur) ularni bog'laydi. Workflow (oldindan yozilgan yo'l) va agent (yo'lni o'zi tanlaydi) farqi | — | [CC How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works) · [AE Building effective agents](https://www.anthropic.com/research/building-effective-agents) · [CC Glossary](https://code.claude.com/docs/en/glossary) |
| 04 | [Vositalar xaritasi](04-vositalar-xaritasi.md) | Agent qayerda ishlaydi: lokal (terminal, IDE), bulutda (cloud), CI'da. Claude Code, Codex, Copilot cloud agent — imkoniyatlar va cheklovlar jadvali (faqat hujjatdagi faktlar). Qachon qaysi muhit | — ⚑ | [CC How it works — Environments](https://code.claude.com/docs/en/how-claude-code-works) · [CC Platforms](https://code.claude.com/docs/en/platforms) · [CX Docs](https://learn.chatgpt.com/docs) · [GH About Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent) |
| 05 | [O'rnatish va birinchi sessiya](05-ornatish-birinchi-sessiya.md) | Claude Code'ni o'rnatish, kirish, papkaga ishonch (trust) oynasi, birinchi savol. `/init` bilan boshlang'ich CLAUDE.md. `/doctor`, `/help` | L | [CC Quickstart](https://code.claude.com/docs/en/quickstart) · [CC Advanced setup](https://code.claude.com/docs/en/setup) · [CC Authentication](https://code.claude.com/docs/en/authentication) |

## II qism — Agentga vazifa berish (6–11)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 06 | [Aniq vazifa yozish](06-aniq-vazifa.md) | Yaxshi topshiriq tarkibi: maqsad, kontekst, cheklovlar, "tayyor" mezoni, namuna natija. Agent bilmaydigan narsani aytish. "Buyurmang, topshiring" (delegate, don't dictate). Yomon va yaxshi so'rov yonma-yon | L | [CC Best practices — Write a specific prompt](https://code.claude.com/docs/en/best-practices) · [CC How it works — Delegate, don't dictate](https://code.claude.com/docs/en/how-claude-code-works) · [CX Working with agents](https://learn.chatgpt.com/codex/working-with-agents) · [CP Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) |
| 07 | [Avval reja, keyin kod](07-avval-reja-keyin-kod.md) | Avval o'rganish va muhokama, keyin reja, keyin o'zgartirish. Plan mode: agent faylga tegmasdan reja tuzadi, siz tasdiqlaysiz. Qachon reja kerak, qachon ortiqcha | L | [CC Best practices — Brainstorm with Claude first](https://code.claude.com/docs/en/best-practices) · [CC Common workflows — Plan before editing](https://code.claude.com/docs/en/common-workflows) · [CC Permission modes](https://code.claude.com/docs/en/permission-modes) |
| 08 | [Agentga tekshiruv berish](08-tekshiruv-berish.md) | Eng muhim odat: agent o'z ishini tekshira oladigan bo'lsin — test, typecheck, lint, skrinshot, kutilgan chiqish. Spetsifikatsiyaga solishtirish. "Tayyor" deyilgan ish nega ba'zan tayyor emas | L | [CC Best practices — Give Claude a check to run](https://code.claude.com/docs/en/best-practices) · [AE Building effective agents — Coding agents](https://www.anthropic.com/research/building-effective-agents) · [CP Prompting — Avoid focusing on passing tests](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) |
| 09 | [Sessiyani boshqarish](09-sessiyani-boshqarish.md) | Bu suhbat: birinchi urinish to'g'ri bo'lmasa — qaytadan emas, aniqlashtirib davom etish. `Esc` bilan to'xtatish, ish davomida tuzatish yuborish. Checkpoint va `/rewind` bilan orqaga qaytish (nimani qaytarib bo'lmaydi: baza, deploy) | L | [CC How it works — Interrupt and steer, checkpoints](https://code.claude.com/docs/en/how-claude-code-works) · [CC Checkpointing](https://code.claude.com/docs/en/checkpointing) · [CC Best practices — Steer the session](https://code.claude.com/docs/en/best-practices) |
| 10 | [Fayl, rasm va xato bilan kontekst berish](10-fayl-rasm-xato.md) | `@fayl` havolasi, xato logi va stack trace, skrinshot va dizayn maketi. Qachon o'zingiz berasiz, qachon agent o'zi topadi | L | [CC Common workflows — Images, Reference files](https://code.claude.com/docs/en/common-workflows) · [CC Interactive mode](https://code.claude.com/docs/en/interactive-mode) |
| 11 | [Agentning tipik xatolari](11-agent-xatolari.md) | Haddan ortiq g'ayrat (so'ralmagan o'zgarishlar), testni "aldash" va qiymatni qattiq yozib qo'yish (hardcoding), o'qimagan kod haqida gapirish, keraksiz fayllar. Har biri: qanday tanish va qanday oldini olish | L | [CP Prompting — Agentic systems (Overeagerness, Hardcoding, Hallucinations)](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) · [CC Best practices](https://code.claude.com/docs/en/best-practices) |

## III qism — Kontekst va loyiha xotirasi (12–16)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 12 | [Kontekst oynasi amalda](12-kontekst-amalda.md) | Sessiya boshida nima yuklanadi, har fayl o'qilganda nima qo'shiladi. `/context` bilan ko'rish. Kontekst — cheklangan resurs: kam, lekin aniq ma'lumot | L | [CC Explore the context window](https://code.claude.com/docs/en/context-window) · [AE Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) |
| 13 | [CLAUDE.md va AGENTS.md](13-claude-md-agents-md.md) | Loyiha "xotirasi": buyruqlar, konvensiyalar, tuzoqlar. Nima yoziladi va nima yozilmaydi; qisqa saqlash (200 qatorgacha). AGENTS.md — ko'p vosita tushunadigan ochiq format; eng yaqin fayl ustun. Ko'rsatma — iltimos, kafolat emas | L | [CC How Claude remembers your project](https://code.claude.com/docs/en/memory) · [CC Best practices — Keep CLAUDE.md short](https://code.claude.com/docs/en/best-practices) · [AGENTS.md](https://agents.md/) · [CX AGENTS.md](https://learn.chatgpt.com/codex/agent-configuration/agents-md) |
| 14 | [Qoidalarni bo'laklash va auto memory](14-qoidalar-auto-memory.md) | `.claude/rules/` va `paths:` bilan faqat kerakli papkada yuklanadigan qoidalar; ichma-ich CLAUDE.md. Auto memory — agent o'zi yozadigan eslatmalar: qanday ko'rish va tozalash | L | [CC Memory — rules, auto memory](https://code.claude.com/docs/en/memory) · [CC Explore the .claude directory](https://code.claude.com/docs/en/claude-directory) |
| 15 | [Uzun sessiya: kompaktlash, tozalash, davom ettirish](15-uzun-sessiya.md) | Avtomatik kompaktlash (compaction) va undan keyin nima saqlanadi. `/compact` yo'nalish bilan, `/clear` vazifalar orasida. `--continue`, `--resume`, sessiyani ayirish (fork) | L | [CC Context window — What survives compaction](https://code.claude.com/docs/en/context-window) · [CC Manage sessions](https://code.claude.com/docs/en/sessions) · [CC How it works — Work with sessions](https://code.claude.com/docs/en/how-claude-code-works) |
| 16 | [Katta kod bazasi va monorepo](16-katta-kod-bazasi.md) | Kod navigatsiyasi plaginlari (LSP): grep o'rniga "definition'ga o'tish". Monorepo'da sozlash. Agentga qidiruvni qisqartiradigan ma'lumot berish | L | [CC Large codebases](https://code.claude.com/docs/en/large-codebases) · [CC Code intelligence plugins](https://code.claude.com/docs/en/plugins/code-intelligence) |

## IV qism — Kundalik ish oqimlari (17–23)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 17 | [Notanish loyihani o'rganish](17-notanish-loyiha.md) | Umumiy ko'rinishdan aniq joyga: arxitektura, ma'lumot modellari, so'rov yo'li (login → baza). Loyiha lug'atini so'rash | L | [CC Common workflows — Understand new codebases](https://code.claude.com/docs/en/common-workflows) |
| 18 | [Xatoni topish va tuzatish](18-xatoni-topish.md) | Qayta hosil qilish (reproduce) buyrug'i, stack trace, bir nechta yechim so'rash, tuzatishni test bilan tasdiqlash | L | [CC Common workflows — Fix bugs efficiently](https://code.claude.com/docs/en/common-workflows) · [CC Best practices](https://code.claude.com/docs/en/best-practices) |
| 19 | [Refaktoring va migratsiya](19-refaktoring-migratsiya.md) | Eskirgan kodni topish, kichik sinaladigan qadamlar, xatti-harakat o'zgarmaganini testlar bilan isbotlash. Katta migratsiyani bo'laklash | L | [CC Common workflows — Refactor code](https://code.claude.com/docs/en/common-workflows) · [Claude blog — AI code migration](https://claude.com/blog/ai-code-migration) |
| 20 | [Test yozish](20-test-yozish.md) | Qoplanmagan kodni topish, mavjud test uslubiga moslash, chegaraviy holatlar. Avval test, keyin kod (TDD) agent bilan | L | [CC Common workflows — Work with tests](https://code.claude.com/docs/en/common-workflows) · [CC Best practices — Give Claude a check to run](https://code.claude.com/docs/en/best-practices) |
| 21 | [Commit, PR va hujjat](21-commit-pr-hujjat.md) | O'zgarishni xulosalash, PR ochish, hujjat yozish. Agent qo'shadigan matnlar (masalan, commit'dagi atributsiya qatori) qayerdan keladi va qanday o'chiriladi | L | [CC Common workflows — Create pull requests, Handle documentation](https://code.claude.com/docs/en/common-workflows) · [CC How it works — Context Claude Code adds on its own](https://code.claude.com/docs/en/how-claude-code-works) · [CC Settings reference — attribution](https://code.claude.com/docs/en/settings-reference) |
| 22 | [Kod review](22-kod-review.md) | Agent yozgan kodni qanday ko'rib chiqish: funksionallik, xavfsizlik, o'qilishi. Agentning o'zi bilan review (`/code-review`, `/security-review`), PR'da avtomatik review. Review chuqurligi — oqibatga qarab | L C | [CC Review locally with /code-review](https://code.claude.com/docs/en/code-review-local) · [CC Code Review](https://code.claude.com/docs/en/code-review) · [GH Best practices — Check Copilot's work](https://docs.github.com/en/copilot/get-started/best-practices) · [CX Working with agents — Review and guide the work](https://learn.chatgpt.com/codex/working-with-agents) |
| 23 | [Frontend: dizayndan kod va brauzerda tekshirish](23-frontend-brauzer.md) | Maket skrinshotidan komponent, agent brauzerni ochib natijani o'zi ko'radi. Frontend uchun ko'rsatmalar | L | [CC Use Claude Code with Chrome](https://code.claude.com/docs/en/chrome) · [CC Common workflows — Work with images](https://code.claude.com/docs/en/common-workflows) · [CP Prompting — Frontend design](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) |

## V qism — Agentni kengaytirish (24–29)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 24 | Qaysi kengaytma qachon | Xarita: CLAUDE.md, output style, skill, subagent, hook, MCP, plagin. "Qachon qo'shish" jadvali (agent bir xatoni ikki marta qilsa → CLAUDE.md va h.k.). Har birining kontekst narxi | — | [CC Extend Claude Code](https://code.claude.com/docs/en/features-overview) |
| 25 | Skill'lar | Takroriy jarayonni (deploy, release, review) bir marta yozib qo'yish; `/nom` bilan chaqirish yoki agent o'zi yuklashi. Ma'lumotnoma va harakat skill'lari | L | [CC Extend Claude with skills](https://code.claude.com/docs/en/skills) · [CC Best practices — Put team procedures in skills](https://code.claude.com/docs/en/best-practices) |
| 26 | Hook'lar: istisnosiz qoidalar | "`.env` ni tahrirlama" — CLAUDE.md'da iltimos, hook'da kafolat. Tahrirdan keyin lint, xavfli buyruqni bloklash, ish tugaganda testni majburlash (Stop hook) | L | [CC Automate actions with hooks](https://code.claude.com/docs/en/hooks-guide) · [CC Hooks reference](https://code.claude.com/docs/en/hooks) · [CC Best practices — Enforce the rules that can't have exceptions](https://code.claude.com/docs/en/best-practices) |
| 27 | MCP: tashqi tizimlarga ulanish | MCP — AI ilovalarni tashqi tizimlarga ulashning ochiq standarti (host, client, server; tools, resources, prompts). Server ulash, doiralar (scope). MCP va oddiy CLI (`gh`) — qachon qaysi biri | L | [MCP Introduction](https://modelcontextprotocol.io/docs/getting-started/intro) · [MCP Architecture](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture) · [CC Connect to MCP servers](https://code.claude.com/docs/en/mcp-quickstart) · [CC MCP](https://code.claude.com/docs/en/mcp) · [CC Costs — Reduce MCP server overhead](https://code.claude.com/docs/en/costs) |
| 28 | O'z MCP serveringizni yozish | Kichik MCP server (masalan, loyiha bazasidan o'qish). Agent uchun yaxshi tool: kam va aniq tool'lar, tushunarli nomlar va tavsiflar, ixcham javob, yo'l ko'rsatadigan xato xabari. Baholash (eval) bilan sinash | L | [MCP Build a server](https://modelcontextprotocol.io/docs/2026-07-28/develop/build-server) · [AE Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents) · [AE Building effective agents — Appendix 2](https://www.anthropic.com/research/building-effective-agents) |
| 29 | Plaginlar va jamoa sozlamalari | Skill, hook, agent va MCP'ni bitta plaginga yig'ish; boshqa repo va jamoa bilan ulashish. O'rnatishda ishonch masalasi | L | [CC Plugins overview](https://code.claude.com/docs/en/plugins/overview) · [CC Create a plugin](https://code.claude.com/docs/en/plugins/create) · [CC Plugin security and trust](https://code.claude.com/docs/en/plugins/security) |

## VI qism — Parallel va avtonom ish (30–34)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 30 | Subagentlar | Alohida kontekstda ishlaydigan yordamchi: ko'p fayl o'qiydi, sizga faqat xulosa qaytaradi. O'z subagentingizni yozish (vazifa, tool'lar, model). Narxi: har subagent o'z token'larini sarflaydi | L | [CC Create custom subagents](https://code.claude.com/docs/en/sub-agents) · [CC Common workflows — Delegate research to subagents](https://code.claude.com/docs/en/common-workflows) · [CC Best practices — Know what subagents cost](https://code.claude.com/docs/en/best-practices) |
| 31 | Parallel sessiyalar va worktree | Bir terminalda feature, ikkinchisida bugfix — o'zgarishlar to'qnashmasligi uchun git worktree. Fon agentlarini bir ekrandan kuzatish | L | [CC Run parallel sessions with worktrees](https://code.claude.com/docs/en/worktrees) · [CC Run agents in parallel](https://code.claude.com/docs/en/agents) · [CC Agent view](https://code.claude.com/docs/en/agent-view) |
| 32 | Ko'p agentli ish | Agent naqshlari: zanjir, yo'naltirish, parallel, orkestrator va ishchilar, baholovchi va tuzatuvchi. Dynamic workflow va agent teams — qachon arziydi, qachon ortiqcha (narx ~7 baravargacha) | L ⚑ | [AE Building effective agents](https://www.anthropic.com/research/building-effective-agents) · [CC Dynamic workflows](https://code.claude.com/docs/en/workflows) · [CC Agent teams](https://code.claude.com/docs/en/agent-teams) · [CC Costs — agent teams](https://code.claude.com/docs/en/costs) |
| 33 | Skriptdan va CI'dan ishga tushirish | Interaktivsiz rejim (`claude -p`), chiqish formatlari, pipe. GitHub Actions'da agent: PR'ga javob, avtomatik vazifalar. Codex'dagi mos imkoniyatlar bilan solishtirish | V C | [CC Run Claude Code programmatically](https://code.claude.com/docs/en/headless) · [CC GitHub Actions](https://code.claude.com/docs/en/github-actions) · [CC Common workflows — Pipe Claude into scripts](https://code.claude.com/docs/en/common-workflows) · [CX Non-interactive mode](https://learn.chatgpt.com/codex/non-interactive-mode) |
| 34 | Jadval bo'yicha va uzoq vazifalar | Rejalashtirilgan vazifalar (bulutda, desktop'da, `/loop`), maqsadga qadar ishlash (`/goal`). Avtonom vazifa uchun so'rov: muvaffaqiyat mezoni va natija qayerga borishi aniq yozilsin | L ⚑ | [CC Common workflows — Run Claude on a schedule](https://code.claude.com/docs/en/common-workflows) · [CC Routines](https://code.claude.com/docs/en/routines) · [CC Scheduled tasks](https://code.claude.com/docs/en/scheduled-tasks) · [CC Goal](https://code.claude.com/docs/en/goal) · [CP Prompting — Long-horizon reasoning](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) |

## VII qism — Xavfsizlik va nazorat (35–39)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 35 | Ruxsatlar va rejimlar | Ruxsat rejimlari (auto, manual, accept edits, plan) — har birining xavfi va qulayligi. allow/deny qoidalari, kim uchun (shaxsiy, loyiha, tashkilot). Ko'rsatma niyatni bildiradi, ruxsat esa kirishni boshqaradi | L | [CC Configure permissions](https://code.claude.com/docs/en/permissions) · [CC Choose a permission mode](https://code.claude.com/docs/en/permission-modes) · [CX Permissions](https://learn.chatgpt.com/codex/permission-modes) |
| 36 | Sandbox va izolyatsiya | Fayl tizimi va tarmoqni cheklash (sandbox), dev container, VM. Qaysi tahdidga qaysi izolyatsiya. Codex sandbox bilan solishtirish | L V | [CC Sandboxing](https://code.claude.com/docs/en/sandboxing) · [CC Sandbox environments](https://code.claude.com/docs/en/sandbox-environments) · [CC Development containers](https://code.claude.com/docs/en/devcontainer) · [CX Sandboxing](https://learn.chatgpt.com/codex/sandboxing) |
| 37 | Prompt injection va ortiqcha vakolat | Ishonchsiz matn (veb-sahifa, issue, fayl) ichidagi yashirin buyruq. OWASP: LLM01 Prompt Injection, LLM06 Excessive Agency. Himoya: ruxsatlar, tarmoq cheklovi, ishonchsiz kontentni to'g'ridan-to'g'ri bermaslik, MCP serverlarga ishonch | L ⚑ | [CC Security — Protect against prompt injection, MCP security](https://code.claude.com/docs/en/security) · [OW Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/) · [MCP Security best practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices) |
| 38 | Maxfiy ma'lumotlar | `.env`, kalitlar va tokenlar agentga ko'rinmasligi (Read deny qoidasi, hook). Ma'lumot qayerga ketadi va qancha saqlanadi. OWASP LLM02 Sensitive Information Disclosure | L | [CC Security](https://code.claude.com/docs/en/security) · [CC Data usage](https://code.claude.com/docs/en/data-usage) · [CC Permissions — Read and Edit](https://code.claude.com/docs/en/permissions) · [OW Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/) |
| 39 | AI yozgan koddagi xavflar | Zaifliklar, ishonchli ko'rinadigan, lekin noto'g'ri kod (LLM09 Misinformation), bog'liqliklar va ta'minot zanjiri (LLM03 Supply Chain), ochiq kodga mos takliflar. Avtomatik tekshiruvlar: lint, code scanning, security review | L ⚑ | [CC Security guidance plugin](https://code.claude.com/docs/en/security-guidance) · [CC Scan your codebase for vulnerabilities](https://code.claude.com/docs/en/claude-security) · [GH Best practices — Check Copilot's work](https://docs.github.com/en/copilot/get-started/best-practices) · [OW Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/) |

## VIII qism — Xarajat va samaradorlik (40–42)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 40 | Model va fikrlash darajasini tanlash | Modellar farqi (kuch, tezlik, narx), effort darajasi, qachon kuchli model kerak. Subagentga arzonroq model | L | [CC Model configuration](https://code.claude.com/docs/en/model-config) · [CC Costs — Choose the right model, Adjust extended thinking](https://code.claude.com/docs/en/costs) · [CC Best practices — Change the model and effort](https://code.claude.com/docs/en/best-practices) |
| 41 | Token va xarajatni boshqarish | Xarajat nimadan iborat, `/usage`, prompt cache. Uzun sessiya nega qimmatlashadi. Tejash: `/clear`, aniq so'rov, CLAUDE.md'ni skill'larga bo'lish, hook bilan chiqishni qisqartirish | L | [CC Manage costs effectively](https://code.claude.com/docs/en/costs) · [CC Prompt caching](https://code.claude.com/docs/en/prompt-caching) |
| 42 | Natijani o'lchash | Nimani o'lchash mumkin: `/insights` hisoboti (qayerda tushunmovchilik bo'ldi), jamoa analitikasi, OpenTelemetry. Samaradorlik haqidagi umumiy raqamlarga nega ehtiyot bo'lish kerak | L ⚑ | [CC Costs — Analyze your usage patterns](https://code.claude.com/docs/en/costs) · [CC Track team usage with analytics](https://code.claude.com/docs/en/analytics) · [CC Monitoring](https://code.claude.com/docs/en/monitoring-usage) |

## IX qism — Dasturchi va AI (43–45)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 43 | AI bilan o'rganish va ko'nikmani saqlash | Anthropic tadqiqoti (2026-01-29, 52 dasturchi): AI bilan yangi kutubxona o'rganganlar testda 50%, qo'lda yozganlar 67%; eng katta farq debugging'da. Bilimni saqlagan usullar: kod so'rab, keyin tushunish uchun savol berish; faqat tushuncha so'rash. Learning va Explanatory uslublari (output style) | L ⚑ | [AE AI assistance and coding skills](https://www.anthropic.com/research/AI-assistance-coding-skills) · [CC Output styles — Learning, Explanatory](https://code.claude.com/docs/en/output-styles) |
| 44 | Jamoada AI bilan ishlash | Umumiy sozlamalarni git'da saqlash (CLAUDE.md, ruxsatlar, skill'lar), tashkilot siyosati (managed settings), review madaniyati, xavfsizlik bo'yicha o'qitish. Jamoaga joriy qilish | — ⚑ | [CC Security — Team security](https://code.claude.com/docs/en/security) · [CC Settings](https://code.claude.com/docs/en/settings) · [CC Champion kit](https://code.claude.com/docs/en/champion-kit) · [CC Communications kit](https://code.claude.com/docs/en/communications-kit) |
| 45 | Shaxsiy ish tartibi | Butun qo'llanmaning amaliy yakuni: har kungi ro'yxat (vazifa → reja → tekshiruv → review), sozlamani asta-sekin qurish, nimani qilishni to'xtatsa bo'ladi | — | [CC Best practices — What you can stop doing](https://code.claude.com/docs/en/best-practices) · [CC Extend — Build your setup over time](https://code.claude.com/docs/en/features-overview) |

## X qism — O'z agentingizni yasash (46–47)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 46 | Agent ichidan qaraganda | Agent sikli kod darajasida: model → tool chaqiruvi → natija → keyingi qadam. Eng oddiy yechimdan boshlash; framework yashiradigan narsalar | L | [CC Agent SDK — How the agent loop works](https://code.claude.com/docs/en/agent-sdk/agent-loop) · [AE Building effective agents — When and how to use frameworks](https://www.anthropic.com/research/building-effective-agents) |
| 47 | Agent SDK bilan kichik agent | Loyiha uchun kichik agent (masalan, PR tavsifini tekshiruvchi): o'z tool'i, ruxsatlar, xarajatni kuzatish, xavfsiz joylash | L | [CC Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview) · [CC Agent SDK quickstart](https://code.claude.com/docs/en/agent-sdk/quickstart) · [CC Give Claude custom tools](https://code.claude.com/docs/en/agent-sdk/custom-tools) · [CC Securely deploying AI agents](https://code.claude.com/docs/en/agent-sdk/secure-deployment) |

---

## Egasining qarorini kutayotgan savollar

1. **Codex va Copilot'ni ham amalda sinash** — buning uchun ularning hisobi kerak. Hisobsiz bu vositalar faqat hujjat
   bo'yicha, ⚑ belgisi bilan beriladi.
2. **X qism (o'z agentingizni yasash)** — qo'llanmada qoladimi yoki alohida kitobga chiqariladimi.
3. **CI boblari (22, 33)** — sinov uchun alohida GitHub repozitoriysi kerak (Deploy amaliyoti kitobidagi savol bilan bir xil).
