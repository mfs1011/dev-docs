-- Bepul tarifda loyiha 7 kun davomida faolligi kam bo'lsa avtomatik to'xtatiladi (pause), domen DNS'dan
-- yo'qoladi va kirish ishlamay qoladi (https://supabase.com/docs/guides/platform/free-project-pausing).
-- GitHub Actions (.github/workflows/supabase-uygoq.yml) bu funksiyani har kuni chaqiradi — bazaga haqiqiy
-- so'rov. Hech qanday foydalanuvchi ma'lumotini o'qimaydi: faqat bazaning joriy vaqti.

create function public.keep_alive()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select now()
$$;

revoke all on function public.keep_alive() from public;
grant execute on function public.keep_alive() to anon;
