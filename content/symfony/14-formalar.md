# 14 — Formalar (qisqacha)

[← Oldingi: Validatsiya](13-validatsiya.md) · [Mundarija](README.md) · [Keyingi: Doctrine ORM asoslari →](15-doctrine-asoslari.md)

---

> **Bu bob nega qisqa?** Form komponenti — server tomonda HTML formalarni render qiladigan va yuborilgan ma'lumotni ob'ektga qaytadigan ikki tomonlama xaritalash qatlami. JSON API qurayotgan bo'lsangiz, u kerak emas: kirish DTO + validator yetarli ([10-bob](10-kontrollerlar.md), [13-bob](13-validatsiya.md)). Lekin admin panel, ichki instrumentlar va klassik server-rendered sahifalarda u hali ham eng tez yo'l.

---

## Form type — alohida klass

```php
namespace App\Form;

use App\Entity\Post;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

final class PostType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('title', TextType::class, [
                'label' => 'Sarlavha',
            ])
            ->add('body', TextareaType::class, [
                'label' => 'Matn',
                'required' => false,
            ])
            ->add('status', ChoiceType::class, [
                'choices' => [
                    'Qoralama' => 'draft',
                    'E\'lon qilingan' => 'published',
                ],
            ])
            ->add('publishedAt', DateTimeType::class, [
                'widget' => 'single_text',
                'required' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Post::class,
        ]);
    }
}
```

**Nega alohida klass, kontrollerda `createFormBuilder()` emas?** Forma qayta ishlatiladi (yaratish va tahrirlash), test qilinadi, va uning ichiga servis in'ektsiya qilish mumkin — form type oddiy servis.

---

## Bitta action: render + qayta ishlash

```php
#[Route('/admin/posts/new', name: 'admin_post_new', methods: ['GET', 'POST'])]
public function new(Request $request, EntityManagerInterface $em): Response
{
    $post = new Post();
    $form = $this->createForm(PostType::class, $post);

    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
        $em->persist($post);
        $em->flush();

        $this->addFlash('success', 'Post yaratildi.');

        return $this->redirectToRoute('admin_post_index');
    }

    return $this->render('admin/post/new.html.twig', [
        'form' => $form,
    ]);
}
```

Bu naqsh — rasmiy tavsiya. Sabablari:

- `handleRequest()` so'rovni o'zi tekshiradi: `GET` bo'lsa hech narsa qilmaydi, `POST` bo'lsa ma'lumotni ob'ektga yozadi;
- xato bo'lganda foydalanuvchi kiritgan qiymatlar formada saqlanib qoladi (qayta ko'rsatish);
- muvaffaqiyatda **redirect** qilinadi — POST/Redirect/GET naqshi, sahifani yangilash takroriy yuborishga olib kelmaydi.

Twig tomoni:

```twig
{{ form_start(form) }}
    {{ form_row(form.title) }}
    {{ form_row(form.body) }}
    {{ form_row(form.status) }}
    <button class="btn">Saqlash</button>
{{ form_end(form) }}
```

Tugmani shablonda yozish ham tavsiya: tugma — ko'rinish masalasi, forma tuzilmasi emas.

---

## CSRF himoyasi

Symfony formalarida CSRF token **sukut bo'yicha yoqilgan**: `form_end()` yashirin `_token` maydonini chiqaradi, `handleRequest()` esa uni tekshiradi.

Nega bu kerak? CSRF hujumida boshqa sayt sizning brauzeringizdagi sessiya cookie'si bilan sizning nomingizdan so'rov yuboradi. Token — hujumchi bilolmaydigan qiymat, shuning uchun soxta so'rov rad etiladi.

Token-asosli (stateless) API'da CSRF muammosi yo'q — chunki brauzer `Authorization` sarlavhasini avtomatik qo'shmaydi. Shuning uchun `stateless: true` API'da CSRF token talab qilish mantiqsiz.

---

## Validatsiya formalarda

Cheklovlar **ob'ektda** turadi, formada emas:

```php
// src/Entity/Post.php
#[Assert\NotBlank]
#[Assert\Length(min: 3, max: 255)]
private string $title;
```

Shunda bir xil qoida forma, API endpoint va konsol buyrug'i uchun bir marta yoziladi. Faqat shu formaga xos qoida bo'lsa, uni maydon opsiyasida berish mumkin:

```php
$builder->add('agreeTerms', CheckboxType::class, [
    'mapped' => false,   // ob'ektga yozilmaydi
    'constraints' => [new Assert\IsTrue(message: 'Shartlarni qabul qiling.')],
]);
```

---

## Muhandislik nuqtai nazari: forma qachon to'g'ri tanlov

Form komponenti kuchli, lekin **narxi bor**: o'rganish egri chizig'i tik, render qatlami murakkab, JS-og'ir interfeyslarda u ortiqcha bo'lib qoladi.

Tanlov jadvali:

| Vaziyat | Tavsiya |
| --- | --- |
| Admin panel, ichki instrument, CRUD | Form komponenti — eng tez yo'l |
| Server-rendered sahifa, progressiv yaxshilanish | Form komponenti |
| JSON API, SPA yoki mobil mijoz | DTO + validator, forma kerak emas |
| Murakkab ko'p bosqichli sehrgarlar | Form + sessiya yoki alohida holat mashinasi |
| Fayl yuklash (API) | `#[MapUploadedFile]` |

Umumiy prinsip: **kirish ma'lumotini tekshirish va domen ob'ektiga aylantirish — har doim kerak; HTML render qilish — har doim emas.** Form komponenti ikkalasini birga bajaradi, shuning uchun ikkinchisi kerak bo'lmasa, u ortiqcha bog'liqlik.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| JSON API'da Form komponentini ishlatish | Ortiqcha murakkablik, xato formati g'alati | DTO + `#[MapRequestPayload]` |
| Formani kontrollerda `createFormBuilder()` bilan qurish | Qayta ishlatilmaydi, test qiyin | `AbstractType` klassi |
| Cheklovlarni faqat forma maydonlarida yozish | API va CLI yo'llarida qoida yo'qoladi | Ob'ektda e'lon qiling |
| Muvaffaqiyatdan keyin redirect qilmaslik | Sahifani yangilash takroriy yuborish | POST/Redirect/GET |
| `mapped => false` ni unutish (masalan "shartlarga rozilik") | Ob'ektga yo'q xossani yozishga urinish | `mapped: false` |
| Tugmani form type ichida e'lon qilish | Ko'rinish mantiqini forma tuzilmasiga aralashtirish | Shablonda yozing |

---

## Amaliyot

1. `PostType` yarating va `/admin/posts/new` sahifasini ishlating. Bo'sh sarlavha bilan yuborib, xato ko'rsatilishini tekshiring.
2. Xuddi shu form type bilan tahrirlash sahifasini yozing (`{id}` bo'yicha entity oling, `createForm($type, $post)`).
3. `mapped: false` checkbox qo'shing va `IsTrue` cheklovi ishlashini tasdiqlang.
4. Formadagi yashirin `_token` maydonini brauzer inspektorida toping; uni qo'lda o'zgartirib yuboring va natijani ko'ring.
5. Xuddi shu ma'lumot uchun JSON endpoint yozing (DTO bilan) va ikki yondashuvning kod hajmini solishtiring.

---

## Rasmiy hujjat

- Formalar: <https://symfony.com/doc/current/forms.html>
- Forma turlari ma'lumotnomasi: <https://symfony.com/doc/current/reference/forms/types.html>
- Formani render qilish: <https://symfony.com/doc/current/form/form_customization.html>
- CSRF: <https://symfony.com/doc/current/security/csrf.html>
- Best practices (formalar): <https://symfony.com/doc/current/best_practices.html#forms>

---

[← Oldingi: Validatsiya](13-validatsiya.md) · [Mundarija](README.md) · [Keyingi: Doctrine ORM asoslari →](15-doctrine-asoslari.md)
