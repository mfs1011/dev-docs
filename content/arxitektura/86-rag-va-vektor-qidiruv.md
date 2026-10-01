# 86 — RAG va vektor qidiruv

[← Oldingi: LLM integratsiyasi arxitekturasi](85-llm-integratsiyasi.md) · [Mundarija](README.md) · [Keyingi: Agentlar va vositalar →](87-agentlar-va-vositalar.md)

## Tushuncha

**RAG** (Retrieval-Augmented Generation) — modelga javob berishdan oldin **sizning ma'lumotlaringizdan** tegishli bo'laklarni topib berish. Model o'qitilgan bilimga emas, siz bergan kontekstga tayanadi: ichki hujjatlar, mahsulot katalogi, yordam maqolalari.

Ikki bosqich:

| Bosqich | Nima bo'ladi | Qachon |
| --- | --- | --- |
| **Indekslash** | Hujjat → bo'laklar (chunk) → embedding (vektor) → indeks | Hujjat qo'shilganda/o'zgarganda (fon ishi) |
| **So'rov** | Savol → embedding → eng yaqin bo'laklar → prompt'ga → javob + manbalar | Har savolda |

**Embedding** — matnni ma'nosi bo'yicha raqamlar vektoriga aylantirish: "qishki poyabzal" va "issiq etik" vektorlari yaqin bo'ladi, so'zlari umuman mos kelmasa ham (29-bobdagi to'liq matnli qidiruvdan farqi shu).

## Nega shunday

Modelning o'zi sizning hujjatlaringizni bilmaydi, eskirgan bo'ladi va bilmasa ham ishonch bilan "to'qiydi". Butun hujjatlar bazasini prompt'ga sig'dirib bo'lmaydi (kontekst cheklangan, narx yuqori). RAG — kerakli bo'lakni topib berish orqali uchala muammoni kamaytiradi: dolzarb ma'lumot, manbaga havola, kamroq to'qish.

## Psevdokod: indekslash konveyeri

```text
on DocumentChanged(docId):                        // hodisa (27-bob) → navbat (26-bob)
  doc = load(docId)
  text = extract(doc)                             // PDF, HTML, DOCX → toza matn
  chunks = split(text, {
    by: "sarlavha va paragraf",                   // ma'no birligi bo'yicha, tasodifiy 500 belgi emas
    targetTokens: 300–800, overlap: 10–15%
  })
  for chunk in chunks:
    chunk.context = doc.title + " › " + chunk.headingPath   // bo'lak o'zi tushunarli bo'lsin
    chunk.vector = embed(chunk.context + chunk.text)
  index.replace(docId, chunks, metadata: { tenantId, aclGroups, lang, updatedAt, version })

Muhim:
  - replace — eski bo'laklar o'chiriladi (aks holda eskirgan javoblar)
  - embedding modeli versiyasi saqlanadi; model almashsa — butun indeks qayta (blue/green indeks)
  - hujjat o'chirilsa — bo'laklari ham (ruxsatsiz ma'lumot qolmasin)
```

## Psevdokod: so'rov — gibrid qidiruv

```text
answer(question, user):
  filters = { tenantId: user.tenantId, aclGroups: user.groups }     // AVTORIZATSIYA — qidiruvda (62, 77-boblar)

  semantic = vectorIndex.search(embed(question), top: 30, filters)
  keyword  = fullText.search(question, top: 30, filters)          // aniq atamalar, kodlar, SKU (29-bob)
  candidates = reciprocalRankFusion(semantic, keyword)
  top = reranker.rank(question, candidates).take(6)                // ixtiyoriy, sifatni sezilarli oshiradi

  if top.bestScore < threshold:
    return "Bu haqda hujjatlarda ma'lumot topmadim."              // to'qish o'rniga halol javob

  prompt = """
    Faqat quyidagi manbalar asosida javob ber. Manbada yo'q bo'lsa — "bilmayman" de.
    Har da'vodan keyin [manba raqami].
    <manbalar> {top formatlangan, raqamlangan} </manbalar>
    Savol: {question}
  """
  return llm.stream(prompt) + sources(top)                        // UI'da manba havolalari
```

Faqat vektor qidiruv aniq atamalarda (buyurtma raqami, xato kodi) yomon ishlaydi — gibrid yondashuv ko'pincha eng yaxshi natija beradi.

## Psevdokod: sifatni o'lchash

```text
Eval to'plami (git'da): 50–200 ta real savol + kutilgan manba + to'g'ri javob mazmuni

Retrieval metrikalari:
  recall@6     — kerakli bo'lak top-6 ichidami?
  MRR          — birinchi to'g'ri bo'lak nechanchi o'rinda?
Javob metrikalari:
  sodiqlik (faithfulness) — javob faqat manbadagi da'volardanmi?
  to'liqlik, "bilmayman" to'g'ri ishlatildimi?
  (LLM-baholovchi + muntazam qo'lda tekshiruv)

Har o'zgarish (chunk o'lchami, model, prompt) → eval qayta → natijalar solishtiriladi
Production: 👍/👎, "manba foydali bo'lmadi" — yangi eval holatlari manbai
```

## Framework'larda

| Qism | Vositalar | Saytdagi bog'liq boblar |
| --- | --- | --- |
| Vektor saqlash | PostgreSQL + `pgvector` (mavjud DB'da — ko'pincha yetarli), Qdrant, Weaviate, Elasticsearch/OpenSearch kNN | [Arxitektura 29-bob](29-qidiruv.md), [23-bob](23-malumotlar-bazasi.md) |
| Indekslash ishlari | Navbat va hodisalar | [Arxitektura 26](26-navbat.md), [27-bob](27-hodisalar.md); [Laravel 25](../laravel/25-navbatlar.md), [Symfony 26-bob](../symfony/26-messenger.md) |
| Ko'p ijarachilik filtri | Har bo'lakda `tenantId` | [Arxitektura 33-bob](33-kop-ijarachilik.md) |
| Abstraksiyalar | LlamaIndex, LangChain, Vercel AI SDK, Symfony AI | — |

Boshlash uchun maslahat: yangi vektor DB'siz, mavjud PostgreSQL'da `pgvector` bilan boshlang; hajm va talab o'sgandagina alohida tizim (2-bob: trade-off, 19-bob: oddiydan boshlash).

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Kichik bo'laklar | Aniq topish | Kontekst yo'qoladi |
| Katta bo'laklar | To'liq kontekst | Shovqin, token narxi |
| Gibrid + reranker | Sifat yuqori | Kechikish va murakkablik |
| Alohida vektor DB | Masshtab, funksiyalar | Yana bir tizim, sinxronlash |
| Butun hujjatni kontekstga (uzun kontekst) | Oddiy | Narx, sekinlik, kichik bazalar uchungina |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Ruxsat filtrsiz qidiruv | Foydalanuvchi begona hujjatni "so'raydi" | ACL va tenant — qidiruv filtri |
| Indeks yangilanmaydi | Eskirgan javoblar | Hodisa asosida qayta indekslash |
| Tasodifiy 500 belgilik bo'laklar | Gap o'rtasida uziladi | Tuzilma bo'yicha bo'lish |
| Eval yo'q — "yaxshi ko'rinadi" | Har o'zgarish ko'r-ko'rona | Eval to'plami CI'da |
| Manba ko'rsatilmaydi | Tekshirib bo'lmaydi, ishonch yo'q | Raqamlangan manbalar UI'da |
| Faqat vektor qidiruv | Kodlar va nomlar topilmaydi | Gibrid |

## Amaliyot

1. 20 ta real savol va kutilgan manbalardan eval to'plami tuzing.
2. `pgvector` bilan indeks yarating; recall@6 ni o'lchang.
3. To'liq matnli qidiruvni qo'shib gibrid qiling — recall qanchalik o'zgardi?
4. Boshqa ijarachi foydalanuvchisi sizning hujjatingizni topa olmasligini test bilan tasdiqlang.

## Manbalar

- Patrick Lewis va boshq. — *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks* (2020)
- Anthropic — *Contextual Retrieval* (2024)
- pgvector <https://github.com/pgvector/pgvector>
