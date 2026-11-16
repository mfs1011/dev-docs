# 21 — Commit, PR va hujjat

[Mundarija](README.md)

## Tushuncha

Kod yozildi va tekshirildi. Endi uni jamoaga topshirish kerak: commit, PR (pull request) va kerak bo'lsa hujjat. CC (Overview)
bo'yicha Claude Code git bilan to'g'ridan-to'g'ri ishlaydi: o'zgarishlarni stage qiladi, commit xabarini yozadi, branch
yaratadi va PR ochadi.

### Commit

CC (Quickstart) — git amallari suhbat orqali:

```text
what files have I changed?
commit my changes with a descriptive message
create a new branch called feature/quickstart
show me the last 5 commits
help me resolve merge conflicts
```

### PR

CC (Common workflows) uch qadamni beradi:

1. **O'zgarishlarni xulosalash:** `summarize the changes I've made to the authentication module`.
2. **PR yaratish:** `create a pr`.
3. **Ko'rib chiqib boyitish:** `enhance the PR description with more context about the security improvements`.

Hujjat maslahati: Claude yozgan PR'ni yuborishdan oldin ko'rib chiqing va undan **potentsial xavf va e'tiborga loyiq joylarni**
alohida ko'rsatishni so'rang.

CC yana bir qulaylikni aytadi: Claude PR'ni `gh pr create` (yoki `glab mr create`) bilan yaratganda sessiya shu PR'ga
bog'lanadi. Keyin `claude --from-pr 1234` shu PR bilan bog'langan sessiyalarni ko'rsatadi.

### Hujjat

CC (Common workflows):

| Qadam | So'rov namunasi |
| --- | --- |
| 1. Hujjatsiz kodni topish | `find functions without proper JSDoc comments in the auth module` |
| 2. Hujjat yozish | `add JSDoc comments to the undocumented functions in auth.js` |
| 3. Boyitish | `improve the generated documentation with more context and examples` |
| 4. Standartga tekshirish | `check if the documentation follows our project standards` |

Maslahatlar: hujjat uslubini aniq ayting (JSDoc, docstring va h.k.), misollar so'rang, ochiq API, interfeys va murakkab mantiq
uchun hujjat so'rang.

### Agent o'zi qo'shadigan matnlar

CC (How Claude Code works) muhim tafsilotni aytadi: Claude siz yozmagan qoidaga amal qilsa, masalan commit'ga `Co-Authored-By`
qatorini qo'shsa, bu qoida **tizim eslatmasidan** (system reminder) kelgan bo'lishi mumkin. Claude Code suhbatga sizning
xabarlaringiz bilan birga o'z kontekstini qo'shadi:

- CLAUDE.md fayllaringiz;
- output style ko'rsatmalari;
- ilgari o'qilgan fayl diskda o'zgarganligi haqida eslatma;
- **commit va PR atributsiya qatorlari**.

Ularni boshqaradigan ikki sozlama bor (CC Settings reference):

| Sozlama | Nima qiladi |
| --- | --- |
| `attribution` | Commit va PR'ga qo'shiladigan atributsiyani o'zgartiradi. Commit'larga standart holatda `Co-Authored-By` kabi git trailer, PR tavsifiga oddiy matn qo'shiladi. `false` — hammasini yashiradi (v2.1.281 dan) |
| `includeGitInstructions` | `false` bo'lsa, Claude Code'ning o'rnatilgan commit/PR ko'rsatmalari va git holati surati kontekstga qo'shilmaydi. O'z git skill'laringiz bo'lsa foydali |

`attribution` ni qismlarga bo'lib ham sozlash mumkin:

```json
{
  "attribution": {
    "commit": "Generated with AI\n\nCo-Authored-By: AI <ai@example.com>",
    "pr": "",
    "sessionUrl": false
  }
}
```

Bu misolda commit atributsiyasi almashtiriladi, PR atributsiyasi va sessiya havolasi olib tashlanadi. Eski versiyalar ham
o'qiydigan faylda `false` o'rniga `commit` va `pr` ni bo'sh satr, `sessionUrl` ni `false` qiling.

CC (Settings reference) ustuvorlikni ham aniq aytadi: CLAUDE.md yoki memory'dagi atributsiya haqidagi o'z qoidalaringiz bu
qatorlardan **ustun turadi**. Faqat boshqariladigan (managed) sozlamada belgilangan qator bundan mustasno.

Qaysi yo'lni tanlash kerak? 3-bobdagi qoida: so'rov yoki CLAUDE.md'dagi qoida — bu iltimos. Sozlama esa Claude Code har safar
qo'llaydigan narsa. Atributsiya kompaniya repo'larida muhim bo'lsa, sozlamani tanlang.

## Amalda: atributsiya qayerdan keladi

Bitta sinov repo'sining ikki nusxasida bir xil o'zgarish (20-bobdagi testlar) bor edi. Ikkalasida bir xil so'rov berildi
(Claude Code 2.1.325, shaxsiy sozlamalarsiz):

```text
o'zgarishlarimni tavsiflovchi xabar bilan commit qil
```

**Standart sozlamalar bilan** — `git log -1`:

```text
test: jami, chegirma, bolibTolash va jarima uchun chegaraviy holatlar

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

**Loyiha sozlamasida `{ "attribution": false }` bilan:**

```text
test: jami, chegirma, bolibTolash va jarima uchun chegaraviy holatlar
```

Commit xabari bir xil. Agent mavjud commit'lardagi uslubni (`test:` prefiksi, o'zbekcha tavsif) o'zi moslagan. Farq faqat trailer
qatorida: u so'rovdan emas, Claude Code qo'shgan atributsiya ko'rsatmasidan keldi. Sozlama uni o'chirdi.

## Commit va PR'ni ko'rib chiqish

Agent yozgan commit va PR matnini yuborishdan oldin tekshiring:

| Nima | Nimaga qarash |
| --- | --- |
| Commit tarkibi | `git show --stat` — kutilmagan fayllar bormi (vaqtinchalik fayllar, 11-bob) |
| Commit xabari | O'zgarishga mosmi, jamoa konvensiyasiga mosmi |
| Trailer va atributsiya | Kompaniya siyosatiga mosmi |
| PR tavsifi | Xavflar va e'tiborga loyiq joylar ko'rsatilganmi (CC maslahati) |
| Push | Kimga ko'rinishini o'ylang: push va PR boshqalarga ko'rinadigan amal (11-bob) |

## Variantlar

| Usul | Yutug'i | Kamchiligi | Qachon |
| --- | --- | --- | --- |
| `commit my changes` | Tez; agent xabarni uslubga moslaydi | Nima kirganini tekshirish kerak | Kundalik ish |
| Bosqichma-bosqich (xulosa → PR → boyitish) | Har bosqichni ko'rasiz | Ko'proq qadam | Muhim PR |
| Commit va PR'ni o'zingiz | To'liq nazorat | Qo'lda ish | Nozik o'zgarish, qat'iy jarayon |
| `attribution` sozlamasi | Har safar qo'llanadi | Sozlash kerak | Atributsiya siyosati bor jamoa |
| CLAUDE.md'dagi qoida | Tez yoziladi; sozlamadan ustun turadi | Model qarori, kafolat emas | Shaxsiy afzallik |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| Agent yaratgan commit'ni ko'rmasdan push qilish | Kutilmagan fayllar yoki matn ketishi mumkin | `git show --stat`, keyin push |
| PR tavsifini tekshirmaslik | CC: yuborishdan oldin ko'rib chiqish kerak | Xavf va e'tiborga loyiq joylarni so'rang |
| Atributsiya qatoridan hayron qolish | CC: u Claude Code qo'shadigan kontekstdan keladi | `attribution` sozlamasi yoki CLAUDE.md qoidasi |
| Eski versiya ham o'qiydigan faylda `"attribution": false` | CC: eski versiyalar butun faylni o'tkazib yuboradi | `commit` va `pr` bo'sh satr, `sessionUrl: false` |
| Hujjat uslubini aytmaslik | Agent o'z uslubini tanlaydi | JSDoc, docstring yoki loyiha standartini ayting |

## Amaliyot

1. CC'dagi PR yaratishning uch qadami qaysilar?
2. Claude commit'ga `Co-Authored-By` qatorini nega qo'shadi?
3. `attribution` va `includeGitInstructions` sozlamalari nimani boshqaradi?
4. CLAUDE.md'dagi atributsiya qoidasi va `attribution` sozlamasi bir-biriga zid bo'lsa, qaysi biri ustun?
5. Tajribada ikki commit nimasi bilan farq qildi?
6. Agent yozgan commit'ni push qilishdan oldin nimani tekshirasiz?

<details>
<summary>Javoblar</summary>

1. O'zgarishlarni xulosalash, PR yaratish, tavsifni ko'rib chiqib boyitish.
2. Claude Code suhbatga o'z kontekstini qo'shadi, jumladan commit va PR atributsiya qatorlarini (tizim eslatmasi orqali). Qator so'rovdan emas, shu yerdan keladi.
3. `attribution` — commit trailer va PR matnidagi atributsiya (`false` — hammasini yashiradi). `includeGitInstructions` — o'rnatilgan commit/PR ko'rsatmalari va git holati surati kontekstga qo'shilishi.
4. CLAUDE.md (yoki memory) dagi o'z qoidangiz ustun. Faqat qator boshqariladigan (managed) sozlamada belgilangan bo'lsa, u ustun turadi.
5. Commit xabari bir xil edi. Standart holatda `Co-Authored-By` trailer bor edi, `"attribution": false` da yo'q edi.
6. Commit tarkibi (`git show --stat`, kutilmagan fayllar), xabar mazmuni va konvensiyaga mosligi, atributsiya siyosatga mosligi; push boshqalarga ko'rinishini hisobga olish.

</details>

## Rasmiy hujjat

- [CC: Common workflows — Create pull requests, Handle documentation](https://code.claude.com/docs/en/common-workflows#create-pull-requests)
- [CC: Quickstart — Use Git with Claude Code](https://code.claude.com/docs/en/quickstart)
- [CC: How Claude Code works — Context Claude Code adds on its own](https://code.claude.com/docs/en/how-claude-code-works#context-claude-code-adds-on-its-own)
- [CC: Settings reference — attribution, includeGitInstructions](https://code.claude.com/docs/en/settings-reference)
