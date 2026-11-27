import type {
  CompetencyId,
  ExamAnswersMap,
  ExamGradeResult,
} from '../generator/types';
import { isSupabaseConfigured, supabase } from '../supabase/client';

export type ClassName = 'XI-1' | 'XI-2';
export const AVAILABLE_CLASSES: readonly ClassName[] = ['XI-1', 'XI-2'] as const;

export type ViolationType =
  | 'tab_switch'
  | 'window_blur'
  | 'fullscreen_exit'
  | 'copy_attempt';

export interface ViolationEvent {
  type: ViolationType;
  timestamp: string;
  detail: string;
}

export interface RemedialSettings {
  title: string;
  kkm: number;
  durationMinutes: number;
  maxAttempts: number;
  maxViolations: number;
  requirePractice: boolean;
  teacherPin: string;
}

export interface StudentProfile {
  absen: string;
  name: string;
  className: ClassName;
}

export interface AttemptRecord {
  id: string;
  student: StudentProfile;
  mode: 'practice' | 'exam';
  seed: number;
  totalScore: number;
  maxScore: number;
  passed: boolean;
  kkm: number;
  startedAt: string;
  submittedAt: string;
  durationSeconds: number;
  violationCount: number;
  violations: ViolationEvent[];
  autoSubmittedByViolation: boolean;
  itemBreakdown: Array<{
    competencyId: CompetencyId;
    earned: number;
    maxPoints: number;
    isFullyCorrect: boolean;
  }>;
}

export interface ActiveExamSession {
  student: StudentProfile;
  seed: number;
  startedAt: number; // epoch ms
  durationMinutes: number;
  answers: ExamAnswersMap;
  violations: ViolationEvent[];
}

export interface StudentSummaryRow {
  absen: string;
  name: string;
  className: ClassName;
  bestScore: number;
  attemptsCount: number;
  lastSubmittedAt: string;
  lastDurationSeconds: number;
  passed: boolean;
  totalViolations: number;
  latestViolations: ViolationEvent[];
  autoSubmittedByViolation: boolean;
}

export type LiveStudentStatus = 'online' | 'practice' | 'exam' | 'finished' | 'offline';

export interface LiveStudentSession {
  key: string;
  student: StudentProfile;
  status: LiveStudentStatus;
  activity: string;
  currentQuestion?: number;
  answeredNumbers: number[];
  totalQuestions: number;
  violationCount: number;
  lastScore?: number;
  passed?: boolean;
  loggedInAt: string;
  lastActiveAt: string;
}

const SETTINGS_KEY = 'remedial_matriks_settings_v5';
const ATTEMPTS_KEY = 'remedial_matriks_attempts_v4';
const ACTIVE_EXAM_KEY = 'remedial_matriks_active_exam_v4';
const PRACTICE_DONE_KEY = 'remedial_matriks_practice_done_v4';
const LIVE_SESSIONS_KEY = 'remedial_matriks_live_sessions_v1';
const LIVE_CHANNEL_NAME = 'remedial_matriks_live_channel';

export const DEFAULT_SETTINGS: RemedialSettings = {
  title: 'Remedial Matriks Kelas XI — Matematika Tingkat Lanjut',
  kkm: 78,
  durationMinutes: 90,
  maxAttempts: 3,
  maxViolations: 3,
  requirePractice: false,
  teacherPin: '1810DB',
};

export { isSupabaseConfigured };

export function getViolationLabel(type: ViolationType): string {
  switch (type) {
    case 'tab_switch':
      return 'Pindah Tab / Minimize';
    case 'window_blur':
      return 'Keluar Jendela Ujian';
    case 'fullscreen_exit':
      return 'Keluar Layar Penuh';
    case 'copy_attempt':
      return 'Percobaan Salin / Tempel';
  }
}

export function getStudentKey(student: Pick<StudentProfile, 'className' | 'absen'>): string {
  const normalizedAbsen = String(Number.parseInt(student.absen, 10) || student.absen.trim());
  return `${student.className}::${normalizedAbsen}`;
}

export function formatAbsen(absen: string): string {
  const n = Number.parseInt(absen, 10);
  if (Number.isNaN(n)) return absen.trim();
  return String(n).padStart(2, '0');
}

const SEED_DEMO_ATTEMPTS: AttemptRecord[] = [
  {
    id: 'demo-1',
    student: { absen: '03', name: 'Alya Putri Ramadhani', className: 'XI-1' },
    mode: 'exam',
    seed: 1011,
    totalScore: 88,
    maxScore: 100,
    passed: true,
    kkm: 78,
    startedAt: '2026-11-25T07:30:00.000Z',
    submittedAt: '2026-11-25T08:12:15.000Z',
    durationSeconds: 2535,
    violationCount: 0,
    violations: [],
    autoSubmittedByViolation: false,
    itemBreakdown: [
      { competencyId: 1, earned: 15, maxPoints: 15, isFullyCorrect: true },
      { competencyId: 2, earned: 15, maxPoints: 15, isFullyCorrect: true },
      { competencyId: 3, earned: 15, maxPoints: 15, isFullyCorrect: true },
      { competencyId: 4, earned: 12, maxPoints: 20, isFullyCorrect: false },
      { competencyId: 5, earned: 16, maxPoints: 20, isFullyCorrect: false },
      { competencyId: 6, earned: 15, maxPoints: 15, isFullyCorrect: true },
    ],
  },
  {
    id: 'demo-2',
    student: { absen: '07', name: 'Bagas Pratama Wijaya', className: 'XI-1' },
    mode: 'exam',
    seed: 1024,
    totalScore: 62,
    maxScore: 100,
    passed: false,
    kkm: 78,
    startedAt: '2026-11-25T08:10:00.000Z',
    submittedAt: '2026-11-25T09:15:40.000Z',
    durationSeconds: 3940,
    violationCount: 2,
    violations: [
      {
        type: 'tab_switch',
        timestamp: '2026-11-25T08:25:12.000Z',
        detail: 'Siswa berpindah tab atau meminimalkan browser',
      },
      {
        type: 'window_blur',
        timestamp: '2026-11-25T08:41:05.000Z',
        detail: 'Fokus layar keluar dari jendela ujian',
      },
    ],
    autoSubmittedByViolation: false,
    itemBreakdown: [
      { competencyId: 1, earned: 15, maxPoints: 15, isFullyCorrect: true },
      { competencyId: 2, earned: 11.25, maxPoints: 15, isFullyCorrect: false },
      { competencyId: 3, earned: 15, maxPoints: 15, isFullyCorrect: true },
      { competencyId: 4, earned: 6, maxPoints: 20, isFullyCorrect: false },
      { competencyId: 5, earned: 10, maxPoints: 20, isFullyCorrect: false },
      { competencyId: 6, earned: 5, maxPoints: 15, isFullyCorrect: false },
    ],
  },
  {
    id: 'demo-3',
    student: { absen: '07', name: 'Bagas Pratama Wijaya', className: 'XI-1' },
    mode: 'exam',
    seed: 1089,
    totalScore: 81.5,
    maxScore: 100,
    passed: true,
    kkm: 78,
    startedAt: '2026-11-25T13:00:00.000Z',
    submittedAt: '2026-11-25T13:52:10.000Z',
    durationSeconds: 3130,
    violationCount: 0,
    violations: [],
    autoSubmittedByViolation: false,
    itemBreakdown: [
      { competencyId: 1, earned: 15, maxPoints: 15, isFullyCorrect: true },
      { competencyId: 2, earned: 15, maxPoints: 15, isFullyCorrect: true },
      { competencyId: 3, earned: 15, maxPoints: 15, isFullyCorrect: true },
      { competencyId: 4, earned: 11.5, maxPoints: 20, isFullyCorrect: false },
      { competencyId: 5, earned: 15, maxPoints: 20, isFullyCorrect: false },
      { competencyId: 6, earned: 10, maxPoints: 15, isFullyCorrect: false },
    ],
  },
  {
    id: 'demo-4',
    student: { absen: '12', name: 'Citra Dewi Lestari', className: 'XI-2' },
    mode: 'exam',
    seed: 2042,
    totalScore: 95,
    maxScore: 100,
    passed: true,
    kkm: 78,
    startedAt: '2026-11-25T09:00:00.000Z',
    submittedAt: '2026-11-25T09:49:50.000Z',
    durationSeconds: 2990,
    violationCount: 0,
    violations: [],
    autoSubmittedByViolation: false,
    itemBreakdown: [
      { competencyId: 1, earned: 15, maxPoints: 15, isFullyCorrect: true },
      { competencyId: 2, earned: 15, maxPoints: 15, isFullyCorrect: true },
      { competencyId: 3, earned: 15, maxPoints: 15, isFullyCorrect: true },
      { competencyId: 4, earned: 15, maxPoints: 20, isFullyCorrect: false },
      { competencyId: 5, earned: 20, maxPoints: 20, isFullyCorrect: true },
      { competencyId: 6, earned: 15, maxPoints: 15, isFullyCorrect: true },
    ],
  },
  {
    id: 'demo-5',
    student: { absen: '19', name: 'Dimas Aditya Nugroho', className: 'XI-2' },
    mode: 'exam',
    seed: 2099,
    totalScore: 54,
    maxScore: 100,
    passed: false,
    kkm: 78,
    startedAt: '2026-11-25T10:15:00.000Z',
    submittedAt: '2026-11-25T11:25:20.000Z',
    durationSeconds: 4220,
    violationCount: 3,
    violations: [
      {
        type: 'tab_switch',
        timestamp: '2026-11-25T10:28:10.000Z',
        detail: 'Siswa berpindah tab atau meminimalkan browser',
      },
      {
        type: 'copy_attempt',
        timestamp: '2026-11-25T10:44:50.000Z',
        detail: 'Percobaan menyalin teks soal saat ujian',
      },
      {
        type: 'tab_switch',
        timestamp: '2026-11-25T11:25:18.000Z',
        detail: 'Batas pelanggaran tercapai — ujian dikumpulkan otomatis',
      },
    ],
    autoSubmittedByViolation: true,
    itemBreakdown: [
      { competencyId: 1, earned: 12, maxPoints: 15, isFullyCorrect: false },
      { competencyId: 2, earned: 15, maxPoints: 15, isFullyCorrect: true },
      { competencyId: 3, earned: 0, maxPoints: 15, isFullyCorrect: false },
      { competencyId: 4, earned: 7, maxPoints: 20, isFullyCorrect: false },
      { competencyId: 5, earned: 10, maxPoints: 20, isFullyCorrect: false },
      { competencyId: 6, earned: 10, maxPoints: 15, isFullyCorrect: false },
    ],
  },
];

function notifyLiveChannel(): void {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(LIVE_CHANNEL_NAME);
      ch.postMessage({ type: 'sync', at: Date.now() });
      ch.close();
    }
  } catch {
    // ignore
  }
}

/* ============================================================================
   1. PENGATURAN REMEDIAL (Local + Supabase)
   ============================================================================ */
export function loadSettings(): RemedialSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function fetchSettingsFromCloud(): Promise<RemedialSettings> {
  if (!supabase) return loadSettings();
  try {
    const { data, error } = await supabase
      .from('remedial_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) return loadSettings();
    const mapped: RemedialSettings = {
      title: data.title ?? DEFAULT_SETTINGS.title,
      kkm: Number(data.kkm ?? DEFAULT_SETTINGS.kkm),
      durationMinutes: Number(data.duration_minutes ?? DEFAULT_SETTINGS.durationMinutes),
      maxAttempts: Number(data.max_attempts ?? DEFAULT_SETTINGS.maxAttempts),
      maxViolations: Number(data.max_violations ?? DEFAULT_SETTINGS.maxViolations),
      requirePractice: Boolean(data.require_practice),
      teacherPin: data.teacher_pin ?? DEFAULT_SETTINGS.teacherPin,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(mapped));
    return mapped;
  } catch {
    return loadSettings();
  }
}

export function saveSettings(settings: RemedialSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  if (supabase) {
    void supabase
      .from('remedial_settings')
      .upsert(
        {
          id: 'default',
          title: settings.title,
          kkm: settings.kkm,
          duration_minutes: settings.durationMinutes,
          max_attempts: settings.maxAttempts,
          max_violations: settings.maxViolations,
          require_practice: settings.requirePractice,
          teacher_pin: settings.teacherPin,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .then(() => notifyLiveChannel());
  }
}

/* ============================================================================
   2. RIWAYAT UJIAN / ATTEMPTS (Local + Supabase)
   ============================================================================ */
export function loadAttempts(): AttemptRecord[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) {
      if (isSupabaseConfigured) return [];
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(SEED_DEMO_ATTEMPTS));
      return SEED_DEMO_ATTEMPTS;
    }
    return JSON.parse(raw) as AttemptRecord[];
  } catch {
    return isSupabaseConfigured ? [] : SEED_DEMO_ATTEMPTS;
  }
}

export async function fetchAttemptsFromCloud(): Promise<AttemptRecord[]> {
  if (!supabase) return loadAttempts();
  try {
    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error || !data) return loadAttempts();
    const mapped: AttemptRecord[] = data.map((row) => ({
      id: String(row.id),
      student: {
        absen: formatAbsen(String(row.absen)),
        name: String(row.student_name),
        className: row.class_name as ClassName,
      },
      mode: (row.mode === 'practice' ? 'practice' : 'exam') as 'practice' | 'exam',
      seed: Number(row.seed),
      totalScore: Number(row.total_score),
      maxScore: Number(row.max_score),
      passed: Boolean(row.passed),
      kkm: Number(row.kkm),
      startedAt: String(row.started_at),
      submittedAt: String(row.submitted_at),
      durationSeconds: Number(row.duration_seconds ?? 0),
      violationCount: Number(row.violation_count ?? 0),
      violations: Array.isArray(row.violations) ? (row.violations as ViolationEvent[]) : [],
      autoSubmittedByViolation: Boolean(row.auto_submitted_by_violation),
      itemBreakdown: Array.isArray(row.item_breakdown) ? row.item_breakdown : [],
    }));
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(mapped));
    return mapped;
  } catch {
    return loadAttempts();
  }
}

export function recordExamAttempt(params: {
  student: StudentProfile;
  seed: number;
  grade: ExamGradeResult;
  startedAt: number;
  violations: ViolationEvent[];
  autoSubmittedByViolation?: boolean;
}): AttemptRecord {
  const now = Date.now();
  const durationSeconds = Math.max(1, Math.round((now - params.startedAt) / 1000));
  const formattedAbsen = formatAbsen(params.student.absen);
  const record: AttemptRecord = {
    id: `att-${now}-${Math.random().toString(36).slice(2, 7)}`,
    student: {
      ...params.student,
      absen: formattedAbsen,
    },
    mode: 'exam',
    seed: params.seed,
    totalScore: params.grade.totalScore,
    maxScore: params.grade.maxScore,
    passed: params.grade.passed,
    kkm: params.grade.kkm,
    startedAt: new Date(params.startedAt).toISOString(),
    submittedAt: new Date(now).toISOString(),
    durationSeconds,
    violationCount: params.violations.length,
    violations: params.violations,
    autoSubmittedByViolation: Boolean(params.autoSubmittedByViolation),
    itemBreakdown: params.grade.items.map((item) => ({
      competencyId: item.competencyId,
      earned: item.earned,
      maxPoints: item.maxPoints,
      isFullyCorrect: item.isFullyCorrect,
    })),
  };

  const existing = loadAttempts();
  const updated = [record, ...existing];
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updated));
  notifyLiveChannel();

  if (supabase) {
    void supabase.from('attempts').insert({
      id: record.id,
      student_key: getStudentKey(record.student),
      absen: record.student.absen,
      student_name: record.student.name,
      class_name: record.student.className,
      mode: record.mode,
      seed: record.seed,
      total_score: record.totalScore,
      max_score: record.maxScore,
      passed: record.passed,
      kkm: record.kkm,
      started_at: record.startedAt,
      submitted_at: record.submittedAt,
      duration_seconds: record.durationSeconds,
      violation_count: record.violationCount,
      violations: record.violations,
      auto_submitted_by_violation: record.autoSubmittedByViolation,
      item_breakdown: record.itemBreakdown,
    });
  }

  return record;
}

export function getStudentExamAttempts(
  student: StudentProfile,
  sourceAttempts?: AttemptRecord[]
): AttemptRecord[] {
  const targetKey = getStudentKey(student);
  const list = sourceAttempts ?? loadAttempts();
  return list.filter(
    (a) => a.mode === 'exam' && getStudentKey(a.student) === targetKey
  );
}

/* ============================================================================
   3. SESI UJIAN AKTIF / DRAFT JAWABAN (Local + Supabase)
   ============================================================================ */
export function loadActiveExam(student: StudentProfile): ActiveExamSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_EXAM_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as ActiveExamSession;
    if (getStudentKey(session.student) !== getStudentKey(student)) {
      return null;
    }
    return {
      ...session,
      violations: Array.isArray(session.violations) ? session.violations : [],
    };
  } catch {
    return null;
  }
}

export async function fetchActiveExamFromCloud(
  student: StudentProfile
): Promise<ActiveExamSession | null> {
  if (!supabase) return loadActiveExam(student);
  try {
    const key = getStudentKey(student);
    const { data, error } = await supabase
      .from('active_exams')
      .select('*')
      .eq('student_key', key)
      .maybeSingle();

    if (error || !data) return loadActiveExam(student);
    const session: ActiveExamSession = {
      student: {
        absen: formatAbsen(String(data.absen)),
        name: String(data.student_name),
        className: data.class_name as ClassName,
      },
      seed: Number(data.seed),
      startedAt: Number(data.started_at),
      durationMinutes: Number(data.duration_minutes),
      answers: (data.answers ?? {}) as ExamAnswersMap,
      violations: Array.isArray(data.violations) ? (data.violations as ViolationEvent[]) : [],
    };
    localStorage.setItem(ACTIVE_EXAM_KEY, JSON.stringify(session));
    return session;
  } catch {
    return loadActiveExam(student);
  }
}

export function saveActiveExam(session: ActiveExamSession): void {
  localStorage.setItem(ACTIVE_EXAM_KEY, JSON.stringify(session));
  if (supabase) {
    void supabase.from('active_exams').upsert(
      {
        student_key: getStudentKey(session.student),
        absen: formatAbsen(session.student.absen),
        student_name: session.student.name,
        class_name: session.student.className,
        seed: session.seed,
        started_at: session.startedAt,
        duration_minutes: session.durationMinutes,
        answers: session.answers,
        violations: session.violations,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'student_key' }
    );
  }
}

export function clearActiveExam(student?: StudentProfile): void {
  localStorage.removeItem(ACTIVE_EXAM_KEY);
  if (supabase && student) {
    void supabase
      .from('active_exams')
      .delete()
      .eq('student_key', getStudentKey(student));
  }
}

/* ============================================================================
   4. PROGRES LATIHAN MANDIRI (Local + Supabase)
   ============================================================================ */
export function markPracticeCompleted(student: StudentProfile): void {
  const key = getStudentKey(student);
  try {
    const raw = localStorage.getItem(PRACTICE_DONE_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    set.add(key);
    localStorage.setItem(PRACTICE_DONE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }

  if (supabase) {
    void supabase.from('practice_progress').upsert(
      {
        student_key: key,
        absen: formatAbsen(student.absen),
        student_name: student.name,
        class_name: student.className,
        completed: true,
        last_practiced_at: new Date().toISOString(),
      },
      { onConflict: 'student_key' }
    );
  }
}

export function hasCompletedPractice(student: StudentProfile): boolean {
  try {
    const raw = localStorage.getItem(PRACTICE_DONE_KEY);
    if (!raw) return false;
    const list = JSON.parse(raw) as string[];
    return list.includes(getStudentKey(student));
  } catch {
    return false;
  }
}

export async function fetchPracticeDoneFromCloud(student: StudentProfile): Promise<boolean> {
  if (!supabase) return hasCompletedPractice(student);
  try {
    const { data, error } = await supabase
      .from('practice_progress')
      .select('completed')
      .eq('student_key', getStudentKey(student))
      .maybeSingle();

    if (error || !data) return hasCompletedPractice(student);
    if (data.completed) {
      markPracticeCompleted(student);
      return true;
    }
    return false;
  } catch {
    return hasCompletedPractice(student);
  }
}

/* ============================================================================
   5. MONITORING LIVE AKTIVITAS SISWA (Local + Supabase Realtime)
   ============================================================================ */
export function loadLiveSessions(): LiveStudentSession[] {
  try {
    const raw = localStorage.getItem(LIVE_SESSIONS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as LiveStudentSession[];
    return list.sort(
      (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function fetchLiveSessionsFromCloud(): Promise<LiveStudentSession[]> {
  if (!supabase) return loadLiveSessions();
  try {
    const { data, error } = await supabase
      .from('live_sessions')
      .select('*')
      .order('last_active_at', { ascending: false });

    if (error || !data) return loadLiveSessions();
    const mapped: LiveStudentSession[] = data.map((row) => ({
      key: String(row.student_key),
      student: {
        absen: formatAbsen(String(row.absen)),
        name: String(row.student_name),
        className: row.class_name as ClassName,
      },
      status: row.status as LiveStudentStatus,
      activity: String(row.activity),
      currentQuestion: row.current_question != null ? Number(row.current_question) : undefined,
      answeredNumbers: Array.isArray(row.answered_numbers)
        ? row.answered_numbers.map(Number)
        : [],
      totalQuestions: Number(row.total_questions ?? 6),
      violationCount: Number(row.violation_count ?? 0),
      lastScore: row.last_score != null ? Number(row.last_score) : undefined,
      passed: row.passed != null ? Boolean(row.passed) : undefined,
      loggedInAt: String(row.logged_in_at),
      lastActiveAt: String(row.last_active_at),
    }));
    localStorage.setItem(LIVE_SESSIONS_KEY, JSON.stringify(mapped));
    return mapped;
  } catch {
    return loadLiveSessions();
  }
}

export function upsertLiveSession(params: {
  student: StudentProfile;
  status: LiveStudentStatus;
  activity: string;
  currentQuestion?: number;
  answeredNumbers?: number[];
  totalQuestions?: number;
  violationCount?: number;
  lastScore?: number;
  passed?: boolean;
}): void {
  const key = getStudentKey(params.student);
  const now = new Date().toISOString();
  let updatedRecord: LiveStudentSession | null = null;

  try {
    const list = loadLiveSessions();
    const existing = list.find((item) => item.key === key);

    updatedRecord = {
      key,
      student: {
        ...params.student,
        absen: formatAbsen(params.student.absen),
      },
      status: params.status,
      activity: params.activity,
      currentQuestion: params.currentQuestion ?? existing?.currentQuestion,
      answeredNumbers: params.answeredNumbers ?? existing?.answeredNumbers ?? [],
      totalQuestions: params.totalQuestions ?? existing?.totalQuestions ?? 6,
      violationCount: params.violationCount ?? existing?.violationCount ?? 0,
      lastScore: params.lastScore ?? existing?.lastScore,
      passed: params.passed ?? existing?.passed,
      loggedInAt: existing?.loggedInAt ?? now,
      lastActiveAt: now,
    };

    const next = [updatedRecord, ...list.filter((item) => item.key !== key)];
    localStorage.setItem(LIVE_SESSIONS_KEY, JSON.stringify(next));
    notifyLiveChannel();
  } catch {
    // ignore
  }

  if (supabase && updatedRecord) {
    void supabase.from('live_sessions').upsert(
      {
        student_key: updatedRecord.key,
        absen: updatedRecord.student.absen,
        student_name: updatedRecord.student.name,
        class_name: updatedRecord.student.className,
        status: updatedRecord.status,
        activity: updatedRecord.activity,
        current_question: updatedRecord.currentQuestion ?? null,
        answered_numbers: updatedRecord.answeredNumbers,
        total_questions: updatedRecord.totalQuestions,
        violation_count: updatedRecord.violationCount,
        last_score: updatedRecord.lastScore ?? null,
        passed: updatedRecord.passed ?? null,
        logged_in_at: updatedRecord.loggedInAt,
        last_active_at: updatedRecord.lastActiveAt,
      },
      { onConflict: 'student_key' }
    );
  }
}

export function markLiveSessionOffline(student: StudentProfile): void {
  upsertLiveSession({
    student,
    status: 'offline',
    activity: 'Keluar dari sesi',
  });
}

export function subscribeLiveUpdates(onUpdate: () => void): () => void {
  const handleStorage = (e: StorageEvent) => {
    if (
      e.key === LIVE_SESSIONS_KEY ||
      e.key === ATTEMPTS_KEY ||
      e.key === ACTIVE_EXAM_KEY
    ) {
      onUpdate();
    }
  };
  window.addEventListener('storage', handleStorage);

  let channel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(LIVE_CHANNEL_NAME);
      channel.onmessage = () => onUpdate();
    }
  } catch {
    channel = null;
  }

  // Supabase Realtime Subscription (lintas perangkat)
  const sbChannel = supabase
    ? supabase
        .channel('remedial-live-monitor')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'live_sessions' },
          () => onUpdate()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'attempts' },
          () => onUpdate()
        )
        .subscribe()
    : null;

  return () => {
    window.removeEventListener('storage', handleStorage);
    channel?.close();
    if (supabase && sbChannel) {
      void supabase.removeChannel(sbChannel);
    }
  };
}

/* ============================================================================
   6. RINGKASAN & EKSPOR CSV
   ============================================================================ */
export function summarizeStudents(
  attempts: AttemptRecord[],
  kkm: number
): StudentSummaryRow[] {
  const map = new Map<string, StudentSummaryRow>();
  for (const att of attempts) {
    if (att.mode !== 'exam') continue;
    const key = getStudentKey(att.student);
    const prev = map.get(key);
    const vCount = att.violationCount ?? att.violations?.length ?? 0;
    const vList = att.violations ?? [];

    if (!prev) {
      map.set(key, {
        absen: formatAbsen(att.student.absen),
        name: att.student.name,
        className: att.student.className,
        bestScore: att.totalScore,
        attemptsCount: 1,
        lastSubmittedAt: att.submittedAt,
        lastDurationSeconds: att.durationSeconds,
        passed: att.totalScore >= kkm,
        totalViolations: vCount,
        latestViolations: vList,
        autoSubmittedByViolation: Boolean(att.autoSubmittedByViolation),
      });
    } else {
      const bestScore = Math.max(prev.bestScore, att.totalScore);
      const isNewer = new Date(att.submittedAt) > new Date(prev.lastSubmittedAt);
      map.set(key, {
        ...prev,
        name: att.student.name,
        className: att.student.className,
        bestScore,
        attemptsCount: prev.attemptsCount + 1,
        lastSubmittedAt: isNewer ? att.submittedAt : prev.lastSubmittedAt,
        lastDurationSeconds: isNewer ? att.durationSeconds : prev.lastDurationSeconds,
        passed: bestScore >= kkm,
        totalViolations: prev.totalViolations + vCount,
        latestViolations: isNewer ? vList : prev.latestViolations,
        autoSubmittedByViolation:
          prev.autoSubmittedByViolation || Boolean(att.autoSubmittedByViolation),
      });
    }
  }
  return [...map.values()].sort(
    (a, b) =>
      a.className.localeCompare(b.className) ||
      Number.parseInt(a.absen, 10) - Number.parseInt(b.absen, 10)
  );
}

export function exportSummaryToCsv(rows: StudentSummaryRow[], kkm: number): string {
  const headers = [
    'No. Absen',
    'Nama Siswa',
    'Kelas',
    'Nilai Tertinggi',
    'Jumlah Percobaan',
    'Pelanggaran Layar',
    'Durasi Terakhir (menit)',
    'Waktu Terakhir',
    `Status KKM (${kkm})`,
  ];

  const escapeCsv = (val: string | number) => {
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((r) =>
      [
        r.absen,
        r.name,
        r.className,
        r.bestScore,
        r.attemptsCount,
        r.totalViolations,
        (r.lastDurationSeconds / 60).toFixed(1),
        new Date(r.lastSubmittedAt).toLocaleString('id-ID'),
        r.passed ? 'TUNTAS' : 'BELUM TUNTAS',
      ]
        .map(escapeCsv)
        .join(',')
    ),
  ];

  return `\uFEFF${lines.join('\r\n')}`;
}
