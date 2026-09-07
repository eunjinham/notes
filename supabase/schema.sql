-- posts 테이블, updated_at 트리거, RLS
-- Supabase Dashboard → SQL Editor에서 이 파일을 실행한다.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '제목 없음',
  content jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_user_id_updated_at_idx
  on public.posts (user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;

create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

alter table public.posts enable row level security;

drop policy if exists "본인 글만 조회" on public.posts;
create policy "본인 글만 조회"
  on public.posts for select
  using (auth.uid() = user_id);

drop policy if exists "본인만 작성" on public.posts;
create policy "본인만 작성"
  on public.posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "본인 글만 수정" on public.posts;
create policy "본인 글만 수정"
  on public.posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "본인 글만 삭제" on public.posts;
create policy "본인 글만 삭제"
  on public.posts for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on table public.posts to authenticated;
grant select, insert, update, delete on table public.posts to anon;
