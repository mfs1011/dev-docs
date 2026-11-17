# 63 — Lug'at

[Mundarija](README.md)

> Qo'llanmadagi atamalar: o'zbekcha nomi, inglizcha asli, qisqa ta'rif va batafsil yozilgan bob. Ta'riflar CC Glossary va tegishli
> rasmiy sahifalarga tayanadi.

| Atama | Inglizcha | Ta'rif | Bob |
| --- | --- | --- | --- |
| Agent | agent | O'z jarayoni va tool'lardan foydalanishni o'zi boshqaradigan LLM tizimi (workflow'dan farqi — yo'l oldindan belgilanmagan) | 3, 46 |
| Agent sikli | agentic loop | Har vazifadagi tsikl: kontekst yig'ish → harakat → natijani tekshirish → takrorlash | 3, 46 |
| Agentli kodlash | agentic coding | AI fayllarni o'qiydi, buyruq bajaradi va o'zgartiradi; siz kuzatasiz, yo'naltirasiz yoki chetga chiqasiz | 2 |
| Harness | agentic harness | Til modelini kod agentiga aylantiradigan tool'lar, kontekst boshqaruvi va bajarish muhiti. Claude Code — harness, Claude — ichidagi model | 3 |
| Agentlar jamoasi | agent teams | Jamoa boshlig'i boshqaradigan bir nechta mustaqil Claude Code sessiyasi: umumiy vazifalar ro'yxati va o'zaro xabarlar | 32 |
| AGENTS.md | AGENTS.md | AI kod agentlari uchun loyiha ko'rsatmalari fayli; CLAUDE.md bo'lmasa, Claude Code uni o'qiydi | 13 |
| Atributsiya | attribution | Claude Code commit va PR'ga qo'shadigan muallif qatori; `attribution` sozlamasi bilan boshqariladi | 50 |
| Auto memory | auto memory | Claude tuzatishlaringiz va afzalliklaringiz asosida o'zi yozadigan eslatmalar, har repo uchun | 14 |
| Auto rejimi | auto mode | Ruxsat rejimi: amallarni siz o'rningizga alohida tasniflagich model ko'rib chiqadi | 35 |
| Bare rejimi | bare mode | `--bare`: hook, skill, plagin, MCP, auto memory va CLAUDE.md yuklanmaydi; CI uchun tavsiya etiladi | 33 |
| Byudjet | budget | `--max-budget-usd` / `maxBudgetUsd`: taxminiy sarf chegarasi | 33, 46 |
| Checkpoint | checkpoint | Har so'rovda yaratiladigan tiklash nuqtasi; `/rewind` yoki `Esc` `Esc` bilan kod va suhbatni qaytarish | 9 |
| Chiqish uslubi | output style | Claude javob uslubi va xatti-harakatini o'zgartiradigan ko'rsatmalar to'plami (Explanatory, Learning va b.) | 43 |
| CLAUDE.md | CLAUDE.md | Har sessiya boshida yuklanadigan doimiy ko'rsatmalar fayli | 13 |
| Fikrlash darajasi | effort level | Moslashuvchan fikrlashni boshqaradi: model har qadamda o'ylash kerakmi va qancha, o'zi hal qiladi | 40 |
| Frontmatter | frontmatter | Markdown fayl boshidagi `---` lar orasidagi YAML sozlamalar (skill, subagent, uslub, qoida) | 25 |
| Hook | hook | Claude Code hayot siklining ma'lum nuqtasida avtomatik bajariladigan ishlovchi (buyruq, HTTP, MCP tool va b.) | 26 |
| Ishonch oynasi | project trust | Papka sozlamalari yuklanishidan oldin chiqadigan tasdiq | 5 |
| Kesh | prompt caching | So'rov boshining (prefiks) avval qayta ishlangan qismini arzon narxda qayta ishlatish | 41 |
| Kompaktlash | compaction | Kontekst oynasi to'lishiga yaqin suhbatni avtomatik xulosalash; `/compact` — qo'lda | 15 |
| Kontekst oynasi | context window | Sessiyaning ish xotirasi: suhbat tarixi, fayllar, buyruq chiqishlari, CLAUDE.md, skill'lar, tizim ko'rsatmalari | 2, 12 |
| Kuzatuvsiz rejim | non-interactive mode | `-p` / `--print`: bitta so'rovni bajarib chiqadi; CI va skriptlar uchun | 33 |
| Managed sozlamalar | managed settings | Tashkilot majburlaydigan sozlamalar; foydalanuvchi va loyiha sozlamalari bekor qila olmaydi | 44 |
| MCP | Model Context Protocol | AI vositalarini tashqi ma'lumot va xizmatlarga ulash uchun ochiq standart | 27 |
| MCP server | MCP server | MCP orqali Claude'ga tool, prompt yoki resurs beradigan dastur | 27, 28 |
| Navbat | turn | Bitta to'liq javob: xabar yuborilganidan Claude javobni tugatguncha, oradagi tool chaqiruvlari bilan | 46 |
| Ortiqcha vakolat | excessive agency | OWASP LLM06: agentga keraksiz funksiya, ruxsat yoki mustaqillik berilishi | 37 |
| Plagin | plugin | Skill, hook, subagent va MCP serverlarni bitta o'rnatiladigan to'plamga yig'ish | 29 |
| Prompt injection | prompt injection | Fayl, veb-sahifa yoki tool natijasiga joylashtirilgan, Claude'ni siz so'ramagan amalga yo'naltirishga urinadigan ko'rsatmalar | 37 |
| Qoidalar | rules | `.claude/rules/` dagi bo'lingan ko'rsatma fayllari; `paths:` bilan faqat mos fayllarda yuklanadi | 14 |
| Reja rejimi | plan mode | Claude o'rganadi va o'zgarish taklif qiladi, manba fayllarni tahrirlamaydi | 7, 48 |
| Regressiya sinovi | regression testing | O'zgarishdan keyin o'sha sinov to'plamini qayta ishga tushirish | 60 |
| Remote Control | Remote Control | Lokal sessiyani telefon yoki brauzerdan davom ettirish; kod sizning kompyuteringizda qoladi | 58 |
| Ruxsat qoidasi | permission rule | Tool chaqiruviga ruxsat, so'rash yoki rad etish yozuvi; tartib: deny → ask → allow | 35 |
| Ruxsat rejimi | permission mode | Sessiyaning asosiy tasdiqlash xatti-harakati (`default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`) | 35 |
| Sandbox | sandboxing | Bash tool'i uchun OS darajasidagi fayl tizimi va tarmoq izolyatsiyasi | 36 |
| Sessiya | session | Joriy papkaga bog'langan, o'z kontekst oynasiga ega suhbat | 9 |
| Sinov to'plami | evaluation (eval) | Agent yoki prompt sifatini o'lchaydigan holatlar va avtomatik baholash | 59 |
| Sir | secret | Parol, API kalit, token — agentga ko'rinmasligi kerak bo'lgan ma'lumot | 38 |
| Skill | skill | Ko'rsatma, bilim yoki jarayonli `SKILL.md`; kerak bo'lganda yuklanadi yoki `/nom` bilan chaqiriladi | 25 |
| Subagent | subagent | O'z kontekst oynasi, tizim ko'rsatmasi va tool ruxsatlariga ega yordamchi; natijani xulosa qilib qaytaradi | 30 |
| Tekshiruv sikli | verification loop | Agentga ishga tushira oladigan tekshiruv berish (test, build, skrinshot) va u o'tguncha takrorlash | 8, 49 |
| Tizim ko'rsatmasi | system prompt | Claude Code har so'rovda suhbatdan oldin yuboradigan ko'rsatmalar | 2 |
| Tizim eslatmasi | system reminder | Harness sessiya davomida Claude'ga kontekst berish uchun suhbatga qo'shadigan xabar | 21 |
| Token | token | Model matnni bo'lib o'qiydigan kichik bo'lak; xarajat birligi | 2, 41 |
| Tool | tool | Claude bajara oladigan amal: fayl o'qish, kod tahrirlash, buyruq bajarish, subagent ishga tushirish | 3 |
| Transkript | transcript | Sessiyaning diskdagi yozuvi (`~/.claude/projects/…/<sessiya>.jsonl`), oddiy matnda | 38 |
| Workflow | workflow | LLM va tool'lar oldindan belgilangan kod yo'llari bilan boshqariladigan tizim (AE); Claude Code'da — ko'p agentli skript | 32, 46 |
| Worktree | git worktree | Bir repo'ning alohida papkadagi ikkinchi ishchi nusxasi; parallel sessiyalar bir-biriga xalaqit bermaydi | 31 |
| Yashirin tekshiruv | — | Agent ko'rmaydigan, siz yozgan mustaqil tekshiruv skripti (qo'llanmadagi usul) | 40, 49 |

## Qisqartmalar

Manba qisqartmalari (bob matnidagi `CC:`, `OW:` va b.) — [mundarija](README.md) boshidagi ro'yxatda; matnda ustiga kelganda to'liq nomi
chiqadi.

## Rasmiy hujjat

- [CC: Glossary](https://code.claude.com/docs/en/glossary)
- [AE: Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [OW: LLM06:2025 Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
