-- ============================================================================
-- Skema Database Supabase: Web Remedial Matriks Kelas XI (SMA Don Bosco II)
-- Jalankan seluruh script ini di: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Pengaturan Sesi Remedial (dikelola Guru)
create table if not exists public.remedial_settings (
  id text primary key default 'default',
  title text not null default 'Remedial Matriks Kelas XI — Matematika Tingkat Lanjut',
  kkm integer not null default 78 check (kkm between 1 and 100),
  duration_minutes integer not null default 90 check (duration_minutes between 5 and 180),
  max_attempts integer not null default 3 check (max_attempts between 1 and 20),
  max_violations integer not null default 3 check (max_violations between 1 and 10),
  require_practice boolean not null default false,
  teacher_pin text not null default '1810DB',
  updated_at timestamptz not null default now()
);

insert into public.remedial_settings (id)
values ('default')
on conflict (id) do nothing;

-- 2. Riwayat Ujian & Skor Siswa (Permanen)
-- Jika sebelumnya pernah menjalankan versi skema lama (masih kosong), pastikan struktur kolom terbaru terpasang:
drop table if exists public.attempts cascade;

create table public.attempts (
  id text primary key,
  student_key text not null,
  absen text not null,
  student_name text not null,
  class_name text not null check (class_name in ('XI-1', 'XI-2')),
  mode text not null default 'exam' check (mode in ('practice', 'exam')),
  seed integer not null,
  total_score numeric(5, 2) not null default 0,
  max_score numeric(5, 2) not null default 100,
  passed boolean not null default false,
  kkm integer not null default 78,
  started_at timestamptz not null default now(),
  submitted_at timestamptz not null default now(),
  duration_seconds integer not null default 0,
  violation_count integer not null default 0,
  violations jsonb not null default '[]'::jsonb,
  auto_submitted_by_violation boolean not null default false,
  item_breakdown jsonb not null default '[]'::jsonb
);

create index if not exists idx_attempts_student_key on public.attempts(student_key);
create index if not exists idx_attempts_class_name on public.attempts(class_name);
create index if not exists idx_attempts_submitted_at on public.attempts(submitted_at desc);

-- 3. Sesi Ujian Aktif (Draft Jawaban, Timer, & Pelanggaran per Siswa)
create table if not exists public.active_exams (
  student_key text primary key,
  absen text not null,
  student_name text not null,
  class_name text not null check (class_name in ('XI-1', 'XI-2')),
  seed integer not null,
  started_at bigint not null,
  duration_minutes integer not null default 90,
  answers jsonb not null default '{}'::jsonb,
  violations jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 4. Progres Latihan Mandiri Siswa
create table if not exists public.practice_progress (
  student_key text primary key,
  absen text not null,
  student_name text not null,
  class_name text not null check (class_name in ('XI-1', 'XI-2')),
  completed boolean not null default true,
  last_practiced_at timestamptz not null default now()
);

-- 5. Monitoring Live Aktivitas Murid (Real-Time)
create table if not exists public.live_sessions (
  student_key text primary key,
  absen text not null,
  student_name text not null,
  class_name text not null check (class_name in ('XI-1', 'XI-2')),
  status text not null check (status in ('online', 'practice', 'exam', 'finished', 'offline')),
  activity text not null,
  current_question integer,
  answered_numbers integer[] not null default '{}',
  total_questions integer not null default 6,
  violation_count integer not null default 0,
  last_score numeric(5, 2),
  passed boolean,
  logged_in_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
alter table public.remedial_settings enable row level security;
alter table public.attempts enable row level security;
alter table public.active_exams enable row level security;
alter table public.practice_progress enable row level security;
alter table public.live_sessions enable row level security;

-- Kebijakan akses aplikasi Web Remedial (anon key + PIN Guru di aplikasi)
drop policy if exists "App access remedial_settings" on public.remedial_settings;
create policy "App access remedial_settings"
  on public.remedial_settings for all to anon, authenticated
  using (true) with check (true);

drop policy if exists "App access attempts" on public.attempts;
create policy "App access attempts"
  on public.attempts for all to anon, authenticated
  using (true) with check (true);

drop policy if exists "App access active_exams" on public.active_exams;
create policy "App access active_exams"
  on public.active_exams for all to anon, authenticated
  using (true) with check (true);

drop policy if exists "App access practice_progress" on public.practice_progress;
create policy "App access practice_progress"
  on public.practice_progress for all to anon, authenticated
  using (true) with check (true);

drop policy if exists "App access live_sessions" on public.live_sessions;
create policy "App access live_sessions"
  on public.live_sessions for all to anon, authenticated
  using (true) with check (true);

-- ============================================================================
-- Aktifkan Supabase Realtime untuk Monitoring Live Guru
-- ============================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'live_sessions'
  ) then
    alter publication supabase_realtime add table public.live_sessions;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'attempts'
  ) then
    alter publication supabase_realtime add table public.attempts;
  end if;
end $$;

-- Refresh schema cache API Supabase agar tabel langsung terbaca
notify pgrst, 'reload schema';
