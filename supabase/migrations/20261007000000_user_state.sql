-- Foydalanuvchining shaxsiy holati: o'qish belgilari, o'qilgan boblar, sozlamalar.
-- Kalit `<tur>:<kalit>` ko'rinishida: `mark:vue`, `read:/vue/10-computed`, `setting:theme`.
-- `value` null bo'lsa — yozuv o'chirilgan (tombstone), boshqa qurilmalar ham uni o'chirishi uchun.

create table public.user_state (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key text not null check (key ~ '^[a-z]+:.{1,200}$'),
  value jsonb check (value is null or (jsonb_typeof(value) = 'object' and pg_column_size(value) <= 4096)),
  updated_at timestamptz not null,
  primary key (user_id, key)
);

alter table public.user_state enable row level security;

-- Har kim faqat o'z yozuvlarini ko'radi va yozadi. Delete yo'q — o'chirish tombstone orqali.
create policy "o'z holatini o'qiydi"
  on public.user_state for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "o'z holatini qo'shadi"
  on public.user_state for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "o'z holatini yangilaydi"
  on public.user_state for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.user_state from anon;

-- Eng yangisi yutadi: eskiroq yozuv yangisining ustiga tushmaydi.
-- Kelajak vaqti (soati oldinga ketgan qurilma) hozirgi vaqtga qisqartiriladi — aks holda u abadiy yutardi.
create function public.user_state_keep_newer()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := least(new.updated_at, now());

  if tg_op = 'UPDATE' and new.updated_at <= old.updated_at then
    return null;
  end if;

  return new;
end;
$$;

create trigger user_state_keep_newer
  before insert or update on public.user_state
  for each row execute function public.user_state_keep_newer();

-- Bir foydalanuvchi uchun yozuvlar soniga chek (suiiste'mol qilinmasin)
create function public.user_state_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.user_state where user_id = new.user_id) >= 5000 then
    raise exception 'user_state: yozuvlar chegarasi (5000) tugadi';
  end if;

  return new;
end;
$$;

create trigger user_state_limit
  before insert on public.user_state
  for each row execute function public.user_state_limit();

-- Akkauntni o'chirish: foydalanuvchi faqat o'zini o'chira oladi.
-- `auth.users`dan o'chirilsa, `on delete cascade` uning holatini ham o'chiradi.
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Kirilmagan';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
