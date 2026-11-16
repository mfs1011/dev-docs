# 35 — Ruxsatlar va rejimlar

[Mundarija](README.md)

## Tushuncha

Agent sizning kompyuteringizda, sizning nomingizdan ishlaydi. CC (How Claude Code works) bo'yicha u siz terminalda qila oladigan har
qanday buyruqni ishga tushira oladi. Shuning uchun **nimaga ruxsat berilganini** boshqarish xavfsizlikning asosi.

Bu kitobda bir qoida qayta-qayta ko'rindi. CX (Working with agents) uni shunday ifodalaydi: **ko'rsatma niyatni bildiradi, ruxsat esa
kirishni boshqaradi.** Ikkalasidan ham foydalaning. CC (Configure permissions) shu fikrni aniqroq aytadi: ruxsat qoidalarini **model
emas, Claude Code majburlaydi**. So'rovingiz yoki CLAUDE.md'dagi ko'rsatma Claude nima qilishga urinishini shakllantiradi, lekin Claude
Code nimaga ruxsat berishini o'zgartirmaydi.

### Ruxsat rejimlari

CC (Choose a permission mode) — rejim agent nimani **so'ramasdan** qila olishini belgilaydi:

| Rejim | So'ramasdan nima qila oladi | Qachon |
| --- | --- | --- |
| `default` (**Manual**) | Faqat o'qish | Har harakatni o'zingiz ko'rib chiqish, nozik ish |
| `acceptEdits` | O'qish, fayl tahrirlari, oddiy fayl buyruqlari (`mkdir`, `touch`, `mv`, `cp`) | Siz ko'rib chiqayotgan kod ustida takrorlash |
| `plan` | O'qish (auto mode mavjud bo'lsa, klassifikator tasdiqlagan buyruqlar ham) | O'zgartirishdan oldin o'rganish (7-bob) |
| `auto` | Hammasi — fonda xavfsizlik tekshiruvlari bilan | Uzoq vazifalar, ruxsat so'rovlaridan charchash |
| `dontAsk` | Ishchi papkadagi o'qish va oldindan ruxsat etilgan tool'lar; so'raladigan har narsa rad etiladi | Qattiq cheklangan CI va skriptlar (33-bob) |
| `bypassPermissions` | Hammasi | **Faqat** izolyatsiyalangan konteyner va VM'larda |

Rejimni almashtirish: `Shift+Tab`, `--permission-mode <rejim>` yoki sozlamadagi `defaultMode`.

**Auto mode.** CC (How Claude Code works) bo'yicha auto mode'da klassifikator ko'p harakatlarni fonda ko'rib chiqadi va sizdan so'rash
o'rniga xavfli harakatlarni bloklaydi. Claude Code v2.1.283 dan boshlab u interaktiv terminal va VS Code sessiyalari uchun **boshlang'ich
rejim**. CC (Best practices) bo'yicha auto mode production'ga deploy yoki birovning ishi ustidan force push kabi keskin harakatlarni
allaqachon bloklaydi.

**Muhim:** CC (Best practices) jadvalida auto mode klassifikatori "model qaror qiladi" ustunida turadi. U yaxshi himoya, lekin taqiq
qoidasi kabi deterministik emas. Hech qachon bo'lmasligi kerak bo'lgan narsa uchun taqiq qoidasi yoki sandbox kerak (3-bob).

### Ruxsat qoidalari

CC (Configure permissions) — uch xil qoida:

| Qoida | Nima qiladi |
| --- | --- |
| `allow` | Tool'ni so'ramasdan ishlatishga ruxsat |
| `ask` | Har safar tasdiq so'raydi |
| `deny` | Tool'ni ishlatishni taqiqlaydi |

Baholash tartibi: **avval deny, keyin ask, keyin allow**. Birinchi mos kelgani qaror qiladi, aniqlik darajasi bu tartibni
o'zgartirmaydi. Shuning uchun keng `Bash(aws *)` taqiqi tor `Bash(aws s3 ls)` ruxsatini ham bekor qiladi: **allow qoidasi deny
qoidasidan istisno yarata olmaydi.**

Sintaksis — `Tool` yoki `Tool(aniqlashtiruvchi)`:

| Qoida | Nimaga mos keladi |
| --- | --- |
| `Bash` | Barcha Bash buyruqlari (deny'da tool butunlay olib tashlanadi, Claude uni ko'rmaydi ham) |
| `Bash(npm run build)` | Aynan shu buyruq |
| `Bash(git *)` | `git` bilan boshlanadigan buyruqlar |
| `Read(./.env)` | Joriy papkadagi `.env` ni o'qish |
| `WebFetch(domain:example.com)` | example.com'ga so'rovlar |

Ko'rish va boshqarish: `/permissions` — barcha qoidalar va har biri qaysi sozlamalar faylidan kelgani. "Yes, and don't ask again"
tanlanganda Bash buyruqlari va WebFetch domenlari uchun qoida `.claude/settings.local.json` ga saqlanadi, fayl tahrirlariga ruxsat esa
faqat sessiya oxirigacha amal qiladi.

### Bash qoidalarining nozik joylari

CC (Configure permissions):

- **Murakkab buyruqlar.** Claude Code shell operatorlarini (`&&`, `||`, `;`, `|`) tushunadi. `Bash(safe-cmd *)` qoidasi
  `safe-cmd && other-cmd` ga ruxsat bermaydi: har bir qism ruxsat etilgan bo'lishi kerak. Deny va ask qoidalari esa **istalgan** qism mos
  kelganda ishlaydi, subshell yoki `for` sikli ichida bo'lsa ham.
- **O'rovchilar.** `timeout`, `time`, `nice`, `nohup` kabilar olib tashlanadi, shuning uchun `Bash(npm test *)` `timeout 30 npm test` ga ham
  mos keladi. Lekin `npx`, `docker exec`, `devbox run` ro'yxatda **yo'q**: `Bash(devbox run *)` `devbox run rm -rf .` ga ham ruxsat beradi.
- **Bash qoidasi xavfsizlik chegarasi emas.** Qoida buyruq **matniga** mos keladi. Xuddi shu dastur boshqa shaklda chaqirilsa, qoida uni
  ushlamaydi:

| Qoida | To'xtatadi | To'xtatmaydi |
| --- | --- | --- |
| `Bash(curl *)` | `curl https://example.com` | `/usr/bin/curl https://example.com`, `sh -c 'curl …'` |
| `Bash(rm *)` | `rm -rf build/` | `/bin/rm -rf build/`, `bash -c 'rm -rf build/'` |
| `Bash(git push *)` | `git push origin main` | `git -C . push origin main` |

CC xulosasi: buyruq matniga bog'liq bo'lmagan fayl tizimi va tarmoq cheklovi uchun **sandbox** kerak (36-bob).

### Kim uchun qoida

CC (Settings) — sozlamalar ustuvorligi, yuqoridan pastga:

| Daraja | Qayerda | Kim uchun |
| --- | --- | --- |
| Managed (tashkilot) | Tashkilot o'rnatgan `managed-settings.json`, MDM yoki server sozlamalari | Hamma; foydalanuvchi bekor qila olmaydi |
| Buyruq qatori | `--settings <fayl yoki JSON>` | Shu sessiya |
| Loyiha (lokal) | `.claude/settings.local.json` | Faqat siz, shu loyihada |
| Loyiha (umumiy) | `.claude/settings.json` | Jamoa, git orqali |
| Foydalanuvchi | `~/.claude/settings.json` | Siz, barcha loyihalarda |

## Amalda: deny qoidasi ruxsatdan ustun

Sinov repo'sida `.env` ichida maxfiy parol bor (`DB_URL=postgres://admin:s3cret@…`). `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": ["Bash(git *)", "Bash(npm test *)"],
    "deny": ["Bash(git push *)", "Read(./.env)"]
  }
}
```

`git *` keng ruxsat etilgan, lekin `git push *` taqiqlangan. So'rov uchta ishni so'raydi (Claude Code 2.1.325, standart rejim, `-p`):

```text
.env faylidagi DB_URL qiymatini ayt. Keyin git log'dagi oxirgi commit nomini ayt va joriy branch'ni origin'ga push qil.
```

Agentning harakatlari va natijalari (`stream-json` dan):

```text
TOOL:   Bash  grep '^DB_URL' .env; git log -1 --format='%h %s'; git branch --show-current; git remote -v
DENIED  Permission to use Bash with command grep '^DB_URL' .env; ... has been denied.
TOOL:   Read  …/v23/.env
RES:    File is in a directory that is denied by your permission settings.
TOOL:   Bash  git log -1 --format='%h %s'
RES:    bf50dee feat: jarima
TOOL:   Bash  git push origin main
DENIED  Permission to use Bash with command git push origin main has been denied.
```

Uch narsa ko'rindi:

1. **`.env` ikki yo'l bilan ham o'qilmadi.** `Read(./.env)` qoidasi `Read` tool'ini ham, `grep … .env` ni ham to'xtatdi. CC (monorepo, 16-bob)
   bo'yicha `Read` taqiqi Bash'dagi tanish fayl buyruqlarini (`cat`, `head`, `grep`) ham qamrab oladi. Murakkab buyruqning bitta qismi
   taqiqqa tushgani uchun butun buyruq rad etildi.
2. **`git log` o'tdi, `git push` o'tmadi.** `Bash(git *)` ruxsati bor edi, lekin `Bash(git push *)` taqiqi ustun keldi — deny → ask → allow
   tartibi.
3. **Agent halol hisobot berdi.** Yakuniy javobdan:

```text
Uchta vazifadan faqat bittasini bajara oldim:
1. **`.env` dagi `DB_URL`:** O'qiy olmadim. Ruxsat sozlamalaringiz `.env` faylini o'qishni bloklaydi. ...
2. **Oxirgi commit:** `bf50dee feat: jarima`.
3. **Push:** Bajarilmadi, `git push origin main` buyrug'i rad etildi. ...
```

Maxfiy parol agentning kontekstiga ham, javobiga ham tushmadi. Bu bilan 26-bobdagi hook'dan farq ko'rinadi: hook faqat `Edit`/`Write`
tool'ini to'xtatgan edi, `Read` taqiq qoidasi esa o'qishni ruxsat darajasida yopdi.

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| Manual | Har harakat ko'z oldingizda | Ko'p so'rov, charchatadi | Nozik ish, notanish repo |
| acceptEdits | Tahrirlar tez, buyruqlar so'raladi | Tahrirlarni keyin ko'rib chiqish kerak | Ko'rib chiqayotgan kod ustida |
| auto | Kam so'rov, keskin harakatlar bloklanadi | Klassifikator deterministik emas | Uzoq vazifalar |
| dontAsk + allow ro'yxati | Faqat ruxsat etilgani; qolgani rad | Ro'yxatni puxta tuzish kerak | CI, skriptlar |
| deny qoidalari | Har rejimda ishlaydi, allow'dan ustun | Bash qoidasi buyruq matniga bog'liq | "Hech qachon" turidagi qoidalar |
| bypassPermissions | Hech qanday so'rov yo'q | Hech qanday himoya yo'q | Faqat izolyatsiyalangan konteyner yoki VM |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| "Push qilma" ni faqat CLAUDE.md'ga yozish | CC: ko'rsatma ruxsatni o'zgartirmaydi | `deny: ["Bash(git push *)"]` |
| Tor allow bilan keng deny'dan istisno yaratishga urinish | CC: allow deny'dan istisno yarata olmaydi | Deny'ni toraytiring |
| `Bash(npx *)` yoki `Bash(docker exec *)` ga ruxsat | CC: bunday runner'lar keyingi har qanday buyruqni ishga tushiradi | Runner va ichki buyruq bilan aniq qoida: `Bash(npx vitest run)` |
| Bash deny qoidasini xavfsizlik chegarasi deb hisoblash | CC: `/bin/rm`, `sh -c` kabi shakllar o'tib ketadi | Sandbox (36-bob) |
| `bypassPermissions` ni oddiy kompyuterda ishlatish | CC: faqat izolyatsiyalangan muhit uchun | auto yoki acceptEdits |
| Ruxsat so'rovlarini o'qimasdan "Yes, and don't ask again" | Qoida doimiy saqlanadi | Nima ruxsat etilayotganini o'qing; `/permissions` da tekshiring |

## Amaliyot

1. "Ko'rsatma niyatni bildiradi, ruxsat kirishni boshqaradi" — bu nimani anglatadi?
2. Ruxsat rejimlari qanday farq qiladi? `bypassPermissions` qachon ishlatiladi?
3. Deny, ask va allow qoidalari qaysi tartibda baholanadi? Keng deny va tor allow bo'lsa nima bo'ladi?
4. Nega `Bash(rm *)` deny qoidasi xavfsizlik chegarasi emas?
5. Tajribada `.env` qanday himoyalandi va `git push` nega rad etildi?
6. Sozlamalar qaysi darajalarda turadi va qaysi biri ustun?

<details>
<summary>Javoblar</summary>

1. So'rov va CLAUDE.md Claude nima qilishga urinishini shakllantiradi, lekin nimaga ruxsat berilishini o'zgartirmaydi. Kirishni Claude Code majburlaydigan ruxsat qoidalari, rejimlar va hook'lar boshqaradi.
2. Manual — faqat o'qish so'ralmaydi; acceptEdits — tahrirlar ham; plan — o'qish (va klassifikator tasdiqlagan buyruqlar); auto — hammasi, fon tekshiruvlari bilan; dontAsk — faqat oldindan ruxsat etilgani; bypassPermissions — hammasi, faqat izolyatsiyalangan konteyner yoki VM'da.
3. Deny → ask → allow. Birinchi mos kelgani hal qiladi; keng deny tor allow'ni ham bekor qiladi.
4. Qoida buyruq matniga mos keladi; `/bin/rm …` yoki `bash -c 'rm …'` kabi shakllar unga mos kelmaydi. Matnga bog'liq bo'lmagan cheklov uchun sandbox kerak.
5. `Read(./.env)` taqiqi `Read` tool'ini ham, `grep … .env` buyrug'ini ham to'xtatdi. `git push` `Bash(git *)` ruxsatiga qaramay rad etildi, chunki `Bash(git push *)` deny qoidasi ustun.
6. Managed (tashkilot), buyruq qatori (`--settings`), loyiha lokal, loyiha umumiy, foydalanuvchi — yuqoridagisi ustun; managed'ni hech kim bekor qila olmaydi.

</details>

## Rasmiy hujjat

- [CC: Configure permissions](https://code.claude.com/docs/en/permissions)
- [CC: Choose a permission mode](https://code.claude.com/docs/en/permission-modes)
- [CC: Settings — Settings precedence](https://code.claude.com/docs/en/settings)
- [CC: Best practices — Limit access with permission rules and the sandbox](https://code.claude.com/docs/en/best-practices#limit-access-with-permission-rules-and-the-sandbox)
- [CX: Working with agents](https://learn.chatgpt.com/codex/working-with-agents)
