-- À exécuter une fois dans Supabase > SQL Editor

create table if not exists public.watches (
  id          uuid primary key default gen_random_uuid(),
  reference   text not null unique,
  name        text not null,
  brand       text,
  description text,
  price       numeric(12, 2) not null default 0 check (price >= 0),
  in_stock    boolean not null default true,
  photo_path  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists watches_name_idx on public.watches (lower(name));
create index if not exists watches_photo_idx on public.watches (photo_path) where photo_path is null;

create table if not exists public.employees (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  last_name   text not null,
  access_code text not null unique,
  active      boolean not null default true,
  -- false = lecture seule ; true = peut modifier les montres (prix, stock, infos, photo)
  can_edit    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.employees add column if not exists can_edit boolean not null default false;

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists watches_touch on public.watches;
create trigger watches_touch before update on public.watches
  for each row execute function public.touch_updated_at();

-- RLS activé sans aucune policy : seul le serveur (clé service_role) peut lire/écrire.
alter table public.watches enable row level security;
alter table public.employees enable row level security;

-- Bucket public pour les photos (lecture publique par URL, écriture via URL signée du serveur)
insert into storage.buckets (id, name, public)
values ('watch-photos', 'watch-photos', true)
on conflict (id) do nothing;
