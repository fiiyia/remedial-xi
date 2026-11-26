import type {
  CompetencyId,
  ExamAnswersMap,
  ExamGradeResult,
} from '../generator/types';

export interface RemedialSettings {
  accessCode: string;
  title: string;
  kkm: number;
  durationMinutes: number;
  maxAttempts: number;
  requirePractice: boolean;
  teacherPin: string;
}

export interface StudentProfile {
  nis: string;
  name: string;
  className: string;
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
}

export interface StudentSummaryRow {
  nis: string;
  name: string;
  className: string;
  bestScore: number;
  attemptsCount: number;
  lastSubmittedAt: string;
  lastDurationSeconds: number;
  passed: boolean;
}

const SETTINGS_KEY = 'remedial_matriks_settings_v1';
const ATTEMPTS_KEY = 'remedial_matriks_attempts_v1';
const ACTIVE_EXAM_KEY = 'remedial_matriks_active_exam_v1';
const PRACTICE_DONE_KEY = 'remedial_matriks_practice_done_v1';

export const DEFAULT_SETTINGS: RemedialSettings = {
  accessCode: 'MATRIKS-XI',
  title: 'Remedial PH XI.2 — Matriks (Matematika Tingkat Lanjut)',
  kkm: 75,
  durationMinutes: 45,
  maxAttempts: 3,
  requirePractice: false,
  teacherPin: 'GURU2026',
};

const SEED_DEMO_ATTEMPTS: AttemptRecord[] = [
  {
    id: 'demo-1',
    student: { nis: '20250101', name: 'Alya Putri Ramadhani', className: 'XI-1' },
    mode: 'exam',
    seed: 1011,
    totalScore: 88,
    maxScore: 100,
    passed: true,
    kkm: 75,
    startedAt: '2026-11-25T07:30:00.000Z',
    submittedAt: '2026-11-25T08:02:15.000Z',
    durationSeconds: 1935,
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
    student: { nis: '20250104', name: 'Bagas Pratama Wijaya', className: 'XI-1' },
    mode: 'exam',
    seed: 1024,
    totalScore: 62,
    maxScore: 100,
    passed: false,
    kkm: 75,
    startedAt: '2026-11-25T08:10:00.000Z',
    submittedAt: '2026-11-25T08:48:40.000Z',
    durationSeconds: 2320,
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
    student: { nis: '20250104', name: 'Bagas Pratama Wijaya', className: 'XI-1' },
    mode: 'exam',
    seed: 1089,
    totalScore: 81.5,
    maxScore: 100,
    passed: true,
    kkm: 75,
    startedAt: '2026-11-25T13:00:00.000Z',
    submittedAt: '2026-11-25T13:34:10.000Z',
    durationSeconds: 2050,
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
    student: { nis: '20250208', name: 'Citra Dewi Lestari', className: 'XI-2' },
    mode: 'exam',
    seed: 2042,
    totalScore: 95,
    maxScore: 100,
    passed: true,
    kkm: 75,
    startedAt: '2026-11-25T09:00:00.000Z',
    submittedAt: '2026-11-25T09:29:50.000Z',
    durationSeconds: 1790,
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
    student: { nis: '20250215', name: 'Dimas Aditya Nugroho', className: 'XI-2' },
    mode: 'exam',
    seed: 2099,
    totalScore: 54,
    maxScore: 100,
    passed: false,
    kkm: 75,
    startedAt: '2026-11-25T10:15:00.000Z',
    submittedAt: '2026-11-25T10:55:20.000Z',
    durationSeconds: 2420,
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
}): AttemptRecord {
  const now = Date.now();
  const durationSeconds = Math.max(1, Math.round((now - params.startedAt) / 1000));
  const record: AttemptRecord = {
    id: `att-${now}-${Math.random().toString(36).slice(2, 7)}`,
    student: params.student,
    mode: 'exam',
    seed: params.seed,
    totalScore: params.grade.totalScore,
    maxScore: params.grade.maxScore,
    passed: params.grade.passed,
    kkm: params.grade.kkm,
    startedAt: new Date(params.startedAt).toISOString(),
    submittedAt: new Date(now).toISOString(),
    durationSeconds,
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

export function getStudentExamAttempts(nis: string): AttemptRecord[] {
  const normalized = nis.trim().toLowerCase();
  return loadAttempts().filter(
    (a) => a.mode === 'exam' && a.student.nis.trim().toLowerCase() === normalized
  );
}

export function loadActiveExam(nis: string): ActiveExamSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_EXAM_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as ActiveExamSession;
    if (session.student.nis.trim().toLowerCase() !== nis.trim().toLowerCase()) {
      return null;
    }
    return session;
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

export function markPracticeCompleted(nis: string): void {
  try {
    const raw = localStorage.getItem(PRACTICE_DONE_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    set.add(nis.trim().toLowerCase());
    localStorage.setItem(PRACTICE_DONE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

export function hasCompletedPractice(nis: string): boolean {
  try {
    const raw = localStorage.getItem(PRACTICE_DONE_KEY);
    if (!raw) return false;
    const list = JSON.parse(raw) as string[];
    return list.includes(nis.trim().toLowerCase());
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
    const key = att.student.nis.trim().toLowerCase();
    const prev = map.get(key);
    if (!prev) {
      map.set(key, {
        nis: att.student.nis,
        name: att.student.name,
        className: att.student.className,
        bestScore: att.totalScore,
        attemptsCount: 1,
        lastSubmittedAt: att.submittedAt,
        lastDurationSeconds: att.durationSeconds,
        passed: att.totalScore >= kkm,
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
      });
    }
  }
  return [...map.values()].sort((a, b) => a.className.localeCompare(b.className) || a.name.localeCompare(b.name));
}

export function exportSummaryToCsv(rows: StudentSummaryRow[], kkm: number): string {
  const headers = [
    'NIS',
    'Nama Siswa',
    'Kelas',
    'Nilai Tertinggi',
    'Jumlah Percobaan',
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
        r.nis,
        r.name,
        r.className,
        r.bestScore,
        r.attemptsCount,
        (r.lastDurationSeconds / 60).toFixed(1),
        new Date(r.lastSubmittedAt).toLocaleString('id-ID'),
        r.passed ? 'TUNTAS' : 'BELUM TUNTAS',
      ]
        .map(escapeCsv)
        .join(',')
    ),
  ];

  // UTF-8 BOM agar Microsoft Excel membaca karakter dengan rapi
  return `\uFEFF${lines.join('\r\n')}`;
}
