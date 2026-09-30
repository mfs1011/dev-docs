# 09 — Kompozitsiya va meros

[← Oldingi: SOLID amalda](08-solid.md) · [Mundarija](README.md) · [Keyingi: Bog'liqlikni teskari qilish va DI →](10-di.md)

## Tushuncha

Kodni qayta ishlatishning ikki yo'li:

| | Meros (inheritance) | Kompozitsiya |
| --- | --- | --- |
| Munosabat | "X — bu Y" (is-a) | "X da Y bor" / "X Y dan foydalanadi" (has-a) |
| Bog'lanish | **Kuchli** — voris otaning ichki tuzilishiga bog'liq | Zaif — faqat ochiq interfeysga |
| O'zgarish | Ota o'zgarsa — barcha vorislar | Qism almashtiriladi |
| Vaqt | Kompilyatsiyada qat'iy | Ish vaqtida ham almashtirish mumkin |

"Gang of Four" (1994) tavsiyasi: **merosdan ko'ra kompozitsiyani afzal ko'ring.**

## Nega shunday

Meros vaqt o'tishi bilan ikki muammoga olib keladi:

**1. Mo'rt ota klass** — otadagi "ichki" o'zgarish vorisni buzadi:

```text
class Collection:
    add(x): items.push(x)
    addAll(xs): for x in xs: add(x)      // ichki: add ni chaqiradi

class CountingCollection extends Collection:
    count = 0
    add(x): count += 1; super.add(x)
    addAll(xs): count += len(xs); super.addAll(xs)   // ikki marta sanaydi!
```

Voris otaning **implementatsiya tafsilotiga** (addAll ichida add chaqiriladi) bog'lanib qoldi.

**2. Ierarxiya portlashi** — bir nechta o'lchov bo'yicha o'zgaruvchanlik:

```text
Notification
├── EmailNotification
│   ├── UrgentEmailNotification
│   └── ScheduledEmailNotification
├── SmsNotification
│   ├── UrgentSmsNotification
│   └── ScheduledSmsNotification
...  kanal × tur = N × M klass
```

## Psevdokod: kompozitsiya bilan

```text
interface Channel  { send(to, text) }            // email, sms, telegram
interface Policy   { shouldSendNow(msg) }        // darhol, rejalashtirilgan, tungi soatlarda emas

class Notification(channel: Channel, policy: Policy):
    deliver(msg):
        if policy.shouldSendNow(msg): channel.send(msg.to, msg.text)
        else: queue.later(msg)

urgentSms = Notification(SmsChannel(), Immediate())
digest    = Notification(EmailChannel(), Scheduled("09:00"))
// N + M klass, N × M kombinatsiya
```

Dekorator — kompozitsiya bilan xulq qo'shish:

```text
class RetryingChannel(inner: Channel, attempts: 3) implements Channel:
    send(to, text): retry(attempts, () => inner.send(to, text))

class LoggingChannel(inner: Channel) implements Channel:
    send(to, text): log("send", to); inner.send(to, text)

channel = LoggingChannel(RetryingChannel(SmsChannel()))
```

## Psevdokod: meros qachon to'g'ri

```text
1. Haqiqiy "is-a" va Liskov bajariladi (8-bob) — voris ota o'rnida hamma joyda ishlaydi
2. Ota klass kengaytirish uchun loyihalangan (abstract, template method, hujjatlashtirilgan hook'lar)
3. Framework shunday talab qiladi (Controller, Command, Migration)
4. Ierarxiya sayoz — 1–2 daraja
```

```text
abstract class ImportJob:
    run(): rows = read(); for r in rows: validate(r); save(r)   // qadamlar tartibi — qat'iy
    abstract read()
    abstract validate(row)
    abstract save(row)
// Template Method: ota "qachon", voris "nima" — bu meros uchun loyihalangan
```

## Framework'larda

Frontend framework'lari o'z tarixida aynan shu yo'ldan o'tdi — merosdan kompozitsiyaga:

| Framework | Oldin (meros/mixin) | Hozir (kompozitsiya) | Qayerda |
| --- | --- | --- | --- |
| React | Klass komponentlar, HOC ierarxiyalari | Hooklar, `children`, kompozitsiya | [React 14-bob](../react/14-kompozitsiya.md), [26-bob](../react/26-custom-hooklar.md) |
| Vue | Mixin'lar (nomlar to'qnashuvi, manba noaniq) | Composable'lar | [Vue 29-bob](../vue/29-composables.md) |
| Angular | Bazaviy komponent klasslari | `hostDirectives`, `inject*` funksiyalar, kontent proyeksiyasi | [Angular 29-bob](../angular/29-host-va-host-directives.md), [35-bob](../angular/35-inject-va-kontekst.md), [28-bob](../angular/28-kontent-proyeksiyasi.md) |

Backend'da:
- Symfony — xizmat dekoratsiyasi (`#[AsDecorator]`) — yuqoridagi `LoggingChannel` naqshining framework darajasidagi ko'rinishi ([Symfony 6-bob](../symfony/06-container-chuqur.md)).
- Laravel — trait'lar: qulay, lekin mixin muammolari (yashirin bog'liqlik, nom to'qnashuvi) bilan; ehtiyotkorlik bilan ishlating.
- Doctrine entity merosi (Single Table / Class Table Inheritance) — ma'lumotlar bazasi darajasida ham meros qimmat: har so'rov diskriminator ustuni yoki JOIN bilan. Ko'pincha kompozitsiya (`#[Embedded]` value object, alohida jadval bilan aloqa — [Symfony 18-bob](../symfony/18-aloqalar.md)) yaxshiroq.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Meros | Kam kod, framework bilan tabiiy | Kuchli bog'lanish, mo'rt ota, ierarxiya portlashi |
| Kompozitsiya | Moslashuvchan, almashtiriladigan, test oson | Ko'proq "ulash" kodi, ob'ektlar ko'p |
| Mixin/trait | Tez qayta ishlatish | Yashirin bog'liqlik, nomlar to'qnashuvi, "bu metod qayerdan?" |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Kodni qayta ishlatish uchun meros | Kuchli bog'lanish | Kompozitsiya yoki funksiya |
| `BaseController`/`BaseComponent` hammasi uchun | Hamma voris ortiqcha narsani oladi | Kichik xizmatlar, `inject*` funksiyalar |
| 3+ darajali ierarxiya | Tushunish va o'zgartirish qiyin | Tekislash, strategiyalar |
| Vorisda otaning ichki xulqiga tayanish | Mo'rt ota muammosi | Kengaytirish nuqtalarini aniq e'lon qilish |
| Trait/mixin bilan holat ulashish | Yashirin bog'liqlik | Aniq qaram (DI) |

## Amaliyot

1. Loyihangizdagi eng chuqur klass ierarxiyasini toping; uni kompozitsiya bilan qayta loyihalash eskizini chizing.
2. Bitta `BaseComponent`/`BaseService` ni oling: vorislarning necha foizi uning hamma metodidan foydalanadi?
3. Bitta tashqi xizmat chaqiruviga dekorator bilan retry/log qo'shing.
4. Frontend'da bitta mixin/HOC ni composable/hook/`inject*` funksiyaga o'tkazing.

## Manbalar

- Gamma, Helm, Johnson, Vlissides — *Design Patterns* (1994), 1-bob
- Joshua Bloch — *Effective Java*, "Favor composition over inheritance"
- Dan Abramov — *Mixins Considered Harmful* <https://legacy.reactjs.org/blog/2016/07/13/mixins-considered-harmful.html>
