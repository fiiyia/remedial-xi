import type {
  CompetencyId,
  ExamAnswersMap,
  ExamGradeResult,
} from '../generator/types';

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

const SETTINGS_KEY = 'remedial_matriks_settings_v4';
const ATTEMPTS_KEY = 'remedial_matriks_attempts_v4';
const ACTIVE_EXAM_KEY = 'remedial_matriks_active_exam_v4';
const PRACTICE_DONE_KEY = 'remedial_matriks_practice_done_v4';

export const DEFAULT_SETTINGS: RemedialSettings = {
  title: 'Remedial Matriks Kelas XI — Matematika Tingkat Lanjut',
  kkm: 78,
  durationMinutes: 90,
  maxAttempts: 3,
  maxViolations: 3,
  requirePractice: false,
  teacherPin: 'GURU2026',
};

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

export function loadSettings(): RemedialSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: RemedialSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadAttempts(): AttemptRecord[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(SEED_DEMO_ATTEMPTS));
      return SEED_DEMO_ATTEMPTS;
    }
    return JSON.parse(raw) as AttemptRecord[];
  } catch {
    return SEED_DEMO_ATTEMPTS;
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
  const record: AttemptRecord = {
    id: `att-${now}-${Math.random().toString(36).slice(2, 7)}`,
    student: {
      ...params.student,
      absen: formatAbsen(params.student.absen),
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
  return record;
}

export function getStudentExamAttempts(student: StudentProfile): AttemptRecord[] {
  const targetKey = getStudentKey(student);
  return loadAttempts().filter(
    (a) => a.mode === 'exam' && getStudentKey(a.student) === targetKey
  );
}

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

export function saveActiveExam(session: ActiveExamSession): void {
  localStorage.setItem(ACTIVE_EXAM_KEY, JSON.stringify(session));
}

export function clearActiveExam(): void {
  localStorage.removeItem(ACTIVE_EXAM_KEY);
}

export function markPracticeCompleted(student: StudentProfile): void {
  try {
    const raw = localStorage.getItem(PRACTICE_DONE_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    set.add(getStudentKey(student));
    localStorage.setItem(PRACTICE_DONE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
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
