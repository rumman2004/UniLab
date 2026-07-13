-- ============================================================
--  Resource BCA — Supabase schema
--  Run this in:  Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ---- PAPERS (Previous Year Question papers) ----
create table if not exists public.papers (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  university  text,
  subject     text,
  course      text default 'BCA',
  semester    int,
  year        int,          -- exam year, e.g. 2023
  exam_type   text,         -- e.g. 'End Term', 'Mid Term'
  file_name   text not null,
  file_path   text not null,  -- storage key inside the bucket
  file_url    text not null,  -- public download URL
  file_size   bigint,
  downloads   int not null default 0,
  created_at  timestamptz not null default now()
);

-- ---- NOTES (subject notes) ----
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subject     text,
  course      text default 'BCA',
  semester    int,
  unit        text,         -- e.g. 'Unit 1' (optional)
  description text,
  file_name   text not null,
  file_path   text not null,
  file_url    text not null,
  file_size   bigint,
  downloads   int not null default 0,
  created_at  timestamptz not null default now()
);

-- ---- EXTERNAL NOTES (e.g. C++, Networking) ----
create table if not exists public.external_notes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  topic       text not null,
  description text,
  file_name   text not null,
  file_path   text not null,
  file_url    text not null,
  file_size   bigint,
  downloads   int not null default 0,
  created_at  timestamptz not null default now()
);

-- Helpful indexes for filtering.
create index if not exists papers_subject_idx  on public.papers (subject);
create index if not exists papers_semester_idx on public.papers (semester);
create index if not exists papers_year_idx     on public.papers (year);
create index if not exists notes_subject_idx   on public.notes (subject);
create index if not exists notes_semester_idx  on public.notes (semester);
create index if not exists external_notes_topic_idx on public.external_notes (topic);

-- ============================================================
--  Row Level Security
--  The server uses the SERVICE ROLE key, which bypasses RLS, so
--  all writes go through your authenticated Express admin routes.
--  We still enable RLS and allow public READ, in case you later
--  want to read directly from the browser with the anon key.
-- ============================================================
alter table public.papers enable row level security;
alter table public.notes  enable row level security;
alter table public.external_notes enable row level security;

drop policy if exists "public read papers" on public.papers;
create policy "public read papers" on public.papers
  for select using (true);

drop policy if exists "public read notes" on public.notes;
create policy "public read notes" on public.notes
  for select using (true);

drop policy if exists "public read external_notes" on public.external_notes;
create policy "public read external_notes" on public.external_notes
  for select using (true);

-- ============================================================
--  STORAGE
--  Create the bucket via the Dashboard (Storage > New bucket):
--     name:    resources
--     public:  YES  (so download links work without signing)
--
--  Or create it here (uncomment):
-- ------------------------------------------------------------
-- insert into storage.buckets (id, name, public)
-- values ('resources', 'resources', true)
-- on conflict (id) do nothing;
--
--  Allow public read of files in the bucket:
-- drop policy if exists "public read resources" on storage.objects;
-- create policy "public read resources" on storage.objects
--   for select using (bucket_id = 'resources');
-- ============================================================
