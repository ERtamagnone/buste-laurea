-- =========================================================
-- Schema per "Le Buste" – incolla tutto in Supabase → SQL Editor → Run
-- PRIMA sostituisci TUA_EMAIL@esempio.it con l'email dell'utente admin
-- che crei in Authentication → Users (Add user → Create new user).
-- =========================================================

create table if not exists public.admins (email text primary key);
insert into public.admins(email) values ('TUA_EMAIL@esempio.it') on conflict do nothing;

create table if not exists public.config (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);
create table if not exists public.progress (
  id int primary key default 1 check (id = 1),
  envelopes jsonb not null default '[]'::jsonb,
  final_claimed_at timestamptz,
  updated_at timestamptz default now()
);
insert into public.config(id) values (1) on conflict do nothing;
insert into public.progress(id) values (1) on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(coalesce(auth.jwt()->>'email', '')));
$$;

alter table public.admins   enable row level security;
alter table public.config   enable row level security;
alter table public.progress enable row level security;

drop policy if exists config_read    on public.config;
drop policy if exists config_write   on public.config;
drop policy if exists progress_read  on public.progress;
drop policy if exists progress_write on public.progress;

create policy config_read    on public.config   for select to anon, authenticated using (true);
create policy config_write   on public.config   for all    to authenticated using (public.is_admin()) with check (public.is_admin());
create policy progress_read  on public.progress for select to anon, authenticated using (true);
create policy progress_write on public.progress for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Vincita di una busta: valida numero 1–3, niente doppioni, massimo 3.
create or replace function public.win_envelope(n int, challenge text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare cur jsonb;
begin
  if n < 1 or n > 3 then raise exception 'busta non valida'; end if;
  select envelopes into cur from public.progress where id = 1 for update;
  if exists (select 1 from jsonb_array_elements(cur) e where (e->>'n')::int = n)
     or jsonb_array_length(cur) >= 3 then
    return cur;
  end if;
  update public.progress
     set envelopes = cur || jsonb_build_array(jsonb_build_object('n', n, 'challenge', left(coalesce(challenge, ''), 20), 'at', now())),
         updated_at = now()
   where id = 1
  returning envelopes into cur;
  return cur;
end $$;

-- Premio finale: solo dopo 3 buste.
create or replace function public.claim_final()
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.progress
     set final_claimed_at = coalesce(final_claimed_at, now()), updated_at = now()
   where id = 1 and jsonb_array_length(envelopes) >= 3;
end $$;

revoke all on function public.win_envelope(int, text) from public;
revoke all on function public.claim_final() from public;
grant execute on function public.win_envelope(int, text) to anon, authenticated;
grant execute on function public.claim_final() to anon, authenticated;
