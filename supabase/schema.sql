-- ============================================================================
-- Skema Database Supabase: Web Remedial Matriks Kelas XI (PH XI.2)
-- Siap dijalankan pada SQL Editor Supabase untuk aktivasi mode cloud/multi-user
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Pengaturan Sesi Remedial (dikelola Guru)
create table if not exists public.remedial_sessions (
  id uuid primary key default gen_random_uuid(),
  access_code text unique not null,
  title text not null default 'Remedial PH XI.2 — Matriks',
  kkm integer not null default 78 check (kkm between 1 and 100),
  duration_minutes integer not null default 90 check (duration_minutes between 5 and 180),
  max_attempts integer not null default 3 check (max_attempts between 1 and 20),
  require_practice boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Data Siswa Peserta Remedial (Kelas XI-1 & XI-2)
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  absen text not null,
  name text not null,
  class_name text not null check (class_name in ('XI-1', 'XI-2')),
  created_at timestamptz not null default now(),
  unique (absen, class_name)
);

-- 3. Riwayat Pengerjaan (Mode Latihan & Ujian Remedial)
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.remedial_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  mode text not null check (mode in ('practice', 'exam')),
  seed integer not null,
  answers jsonb not null default '{}'::jsonb,
  item_scores jsonb not null default '[]'::jsonb,
  total_score numeric(5, 2) not null default 0,
  passed boolean not null default false,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  duration_seconds integer
);

create index if not exists idx_attempts_session on public.attempts(session_id);
create index if not exists idx_attempts_student on public.attempts(student_id);
create index if not exists idx_attempts_mode on public.attempts(mode);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
alter table public.remedial_sessions enable row level security;
alter table public.students enable row level security;
alter table public.attempts enable row level security;

-- Guru (authenticated user) memiliki akses penuh ke sesi yang dikelolanya
create policy "Guru kelola remedial_sessions"
  on public.remedial_sessions
  for all
  to authenticated
  using (true)
  with check (true);

create policy "Guru baca semua students"
  on public.students
  for select
  to authenticated
  using (true);

create policy "Guru baca semua attempts"
  on public.attempts
  for select
  to authenticated
  using (true);

-- Siswa (anon) hanya bisa membaca sesi aktif via kode akses & mengirim percobaan miliknya
create policy "Siswa baca sesi aktif"
  on public.remedial_sessions
  for select
  to anon
  using (is_active = true);

create policy "Siswa daftar/update identitas sendiri"
  on public.students
  for insert
  to anon
  with check (true);

create policy "Siswa kirim attempt"
  on public.attempts
  for insert
  to anon
  with check (true);
