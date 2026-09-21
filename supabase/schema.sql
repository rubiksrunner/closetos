-- ClosetOS data model: one clothing item belongs to exactly one authenticated user.
create table public.clothing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (category in ('Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories')),
  colour text,
  season text not null default 'All seasons' check (season in ('All seasons', 'Spring', 'Summer', 'Autumn', 'Winter')),
  image_path text,
  created_at timestamptz not null default now()
);

alter table public.clothing_items enable row level security;

-- Each person can only read and change their own wardrobe.
create policy "Users can view their own clothing"
on public.clothing_items for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can add their own clothing"
on public.clothing_items for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own clothing"
on public.clothing_items for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own clothing"
on public.clothing_items for delete
to authenticated
using ((select auth.uid()) = user_id);
