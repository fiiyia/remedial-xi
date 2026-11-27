import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Home,
  LogOut,
  Menu,
  Radio,
  Search,
  Settings,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { gradeExam } from './lib/generator/grading';
import {
  COMPETENCIES,
  type CompetencyId,
  type ExamAnswersMap,
  type ExamGradeResult,
  type GeneratedQuestion,
} from './lib/generator/types';
import { generateSessionSeed } from './lib/math/prng';
import {
  clearActiveExam,
  getStudentExamAttempts,
  hasCompletedPractice,
  loadActiveExam,
  loadAttempts,
  loadLiveSessions,
  loadSettings,
  markLiveSessionOffline,
  markPracticeCompleted,
  recordExamAttempt,
  saveActiveExam,
  saveSettings,
  subscribeLiveUpdates,
  upsertLiveSession,
  type ActiveExamSession,
  type AttemptRecord,
  type LiveStudentSession,
  type RemedialSettings,
  type StudentProfile,
  type ViolationEvent,
} from './lib/storage/repository';
import { ExamView } from './components/ExamView';
import { LoginView } from './components/LoginView';
import { PracticeView } from './components/PracticeView';
import { ResultView } from './components/ResultView';
import { StudentHomeView } from './components/StudentHomeView';
import {
  TeacherDashboardView,
  type TeacherTab,
} from './components/TeacherDashboardView';

type AppView =
  | { kind: 'login' }
  | { kind: 'student_home' }
  | { kind: 'practice'; competencyId: CompetencyId }
  | { kind: 'exam'; session: ActiveExamSession }
  | {
      kind: 'result';
      questions: GeneratedQuestion[];
      answers: ExamAnswersMap;
      grade: ExamGradeResult;
      violationCount: number;
      autoSubmittedByViolation: boolean;
    }
  | { kind: 'teacher'; tab: TeacherTab };

export function App() {
  const [settings, setSettings] = useState<RemedialSettings>(() => loadSettings());
  const [attempts, setAttempts] = useState<AttemptRecord[]>(() => loadAttempts());
  const [liveSessions, setLiveSessions] = useState<LiveStudentSession[]>(() =>
    loadLiveSessions()
  );
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [view, setView] = useState<AppView>({ kind: 'login' });
  const [globalSearch, setGlobalSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refreshLiveData = useCallback(() => {
    setAttempts(loadAttempts());
    setLiveSessions(loadLiveSessions());
  }, []);

  // Sinkronisasi real-time lintas tab untuk Dashboard Guru
  useEffect(() => {
    if (view.kind !== 'teacher') return;
    refreshLiveData();
    const unsubscribe = subscribeLiveUpdates(refreshLiveData);
    const interval = setInterval(refreshLiveData, 3000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [view.kind, refreshLiveData]);

  const handleStudentLogin = (profile: StudentProfile) => {
    setStudent(profile);
    setGlobalSearch('');
    upsertLiveSession({
      student: profile,
      status: 'online',
      activity: 'Baru masuk ke Beranda Remedial',
      answeredNumbers: [],
      violationCount: 0,
    });
    refreshLiveData();
    setView({ kind: 'student_home' });
  };

  const handleOpenPractice = (competencyId: CompetencyId) => {
    if (student) {
      const topic = COMPETENCIES.find((c) => c.id === competencyId);
      upsertLiveSession({
        student,
        status: 'practice',
        activity: `Latihan Topik ${competencyId}: ${topic?.shortTitle ?? ''}`,
        currentQuestion: competencyId,
      });
    }
    setView({ kind: 'practice', competencyId });
    setMobileMenuOpen(false);
  };

  const handleStartExam = () => {
    if (!student) return;
    setMobileMenuOpen(false);
    const existing = loadActiveExam(student);
    if (existing) {
      upsertLiveSession({
        student,
        status: 'exam',
        activity: 'Melanjutkan Ujian Remedial',
        currentQuestion: 1,
        violationCount: existing.violations.length,
      });
      setView({ kind: 'exam', session: existing });
      return;
    }
    const newSession: ActiveExamSession = {
      student,
      seed: generateSessionSeed(),
      startedAt: Date.now(),
      durationMinutes: settings.durationMinutes,
      answers: {},
      violations: [],
    };
    saveActiveExam(newSession);
    upsertLiveSession({
      student,
      status: 'exam',
      activity: 'Mulai Ujian Remedial — Soal 1',
      currentQuestion: 1,
      answeredNumbers: [],
      violationCount: 0,
    });
    setView({ kind: 'exam', session: newSession });
  };

  const handleUpdateExamAnswers = (nextAnswers: ExamAnswersMap) => {
    setView((prev) => {
      if (prev.kind !== 'exam') return prev;
      const updated: ActiveExamSession = { ...prev.session, answers: nextAnswers };
      saveActiveExam(updated);
      return { kind: 'exam', session: updated };
    });
  };

  const handleExamProgress = useCallback(
    (info: { currentQuestion: number; answeredNumbers: number[] }) => {
      if (!student) return;
      upsertLiveSession({
        student,
        status: 'exam',
        activity: `Mengerjakan Ujian — Soal ${info.currentQuestion} (${info.answeredNumbers.length}/6 terisi)`,
        currentQuestion: info.currentQuestion,
        answeredNumbers: info.answeredNumbers,
      });
    },
    [student]
  );

  const handleRecordViolation = useCallback((event: ViolationEvent) => {
    setView((prev) => {
      if (prev.kind !== 'exam') return prev;
      const nextViolations = [...prev.session.violations, event];
      const updated: ActiveExamSession = {
        ...prev.session,
        violations: nextViolations,
      };
      saveActiveExam(updated);
      upsertLiveSession({
        student: prev.session.student,
        status: 'exam',
        activity: `Peringatan Deteksi Layar (${nextViolations.length}×)`,
        violationCount: nextViolations.length,
      });
      return { kind: 'exam', session: updated };
    });
  }, []);

  const handleSubmitExam = useCallback(
    (
      questions: GeneratedQuestion[],
      answers: ExamAnswersMap,
      autoSubmittedByViolation = false
    ) => {
      setView((prev) => {
        if (prev.kind !== 'exam') return prev;
        const grade = gradeExam(questions, answers, settings.kkm);
        recordExamAttempt({
          student: prev.session.student,
          seed: prev.session.seed,
          grade,
          startedAt: prev.session.startedAt,
          violations: prev.session.violations,
          autoSubmittedByViolation,
        });
        clearActiveExam();
        upsertLiveSession({
          student: prev.session.student,
          status: 'finished',
          activity: `Selesai Ujian — Skor ${grade.totalScore} (${grade.passed ? 'TUNTAS' : 'BELUM TUNTAS'})`,
          violationCount: prev.session.violations.length,
          lastScore: grade.totalScore,
          passed: grade.passed,
        });
        setAttempts(loadAttempts());
        setLiveSessions(loadLiveSessions());
        return {
          kind: 'result',
          questions,
          answers,
          grade,
          violationCount: prev.session.violations.length,
          autoSubmittedByViolation,
        };
      });
    },
    [settings.kkm]
  );

  const handleSaveSettings = (next: RemedialSettings) => {
    saveSettings(next);
    setSettings(next);
  };

  const handleLogout = () => {
    if (student) {
      markLiveSessionOffline(student);
    }
    setStudent(null);
    setGlobalSearch('');
    setMobileMenuOpen(false);
    setView({ kind: 'login' });
  };

  if (view.kind === 'login') {
    return (
      <div className="min-h-screen bg-[#f3f4fb] text-[#262542]">
        <LoginView
          settings={settings}
          onStudentLogin={handleStudentLogin}
          onTeacherLogin={() => {
            refreshLiveData();
            setGlobalSearch('');
            setView({ kind: 'teacher', tab: 'live' });
          }}
        />
      </div>
    );
  }

  const isTeacher = view.kind === 'teacher';
  const studentAttempts = student ? getStudentExamAttempts(student) : [];
  const remainingAttempts = Math.max(0, settings.maxAttempts - studentAttempts.length);
  const activeExam = student ? loadActiveExam(student) : null;
  const practiceDone = student ? hasCompletedPractice(student) : false;
  const bestScore = studentAttempts.reduce((m, a) => Math.max(m, a.totalScore), 0);
  const hasPassed = bestScore >= settings.kkm;
  const canTakeExam =
    Boolean(activeExam) ||
    (remainingAttempts > 0 && !(settings.requirePractice && !practiceDone));

  const studentNavItems = [
    {
      id: 'home',
      label: 'Beranda',
      icon: Home,
      active: view.kind === 'student_home',
      onClick: () => {
        setView({ kind: 'student_home' });
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'practice',
      label: 'Latihan Soal',
      icon: BookOpen,
      active: view.kind === 'practice',
      onClick: () => handleOpenPractice(1),
    },
    {
      id: 'exam',
      label: 'Ujian Remedial',
      icon: ClipboardCheck,
      active: view.kind === 'exam' || view.kind === 'result',
      onClick: () => {
        if (canTakeExam) handleStartExam();
        else setView({ kind: 'student_home' });
      },
    },
  ];

  const teacherNavItems: Array<{
    id: TeacherTab;
    label: string;
    icon: typeof Users;
    active: boolean;
    onClick: () => void;
  }> = [
    {
      id: 'live',
      label: 'Live Monitor',
      icon: Radio,
      active: view.kind === 'teacher' && view.tab === 'live',
      onClick: () => {
        setView({ kind: 'teacher', tab: 'live' });
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'monitoring',
      label: 'Monitoring Siswa',
      icon: Users,
      active: view.kind === 'teacher' && view.tab === 'monitoring',
      onClick: () => {
        setView({ kind: 'teacher', tab: 'monitoring' });
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'integrity',
      label: 'Deteksi Layar',
      icon: ShieldAlert,
      active: view.kind === 'teacher' && view.tab === 'integrity',
      onClick: () => {
        setView({ kind: 'teacher', tab: 'integrity' });
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'analytics',
      label: 'Analitik Soal',
      icon: BarChart3,
      active: view.kind === 'teacher' && view.tab === 'analytics',
      onClick: () => {
        setView({ kind: 'teacher', tab: 'analytics' });
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      icon: Settings,
      active: view.kind === 'teacher' && view.tab === 'settings',
      onClick: () => {
        setView({ kind: 'teacher', tab: 'settings' });
        setMobileMenuOpen(false);
      },
    },
  ];

  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  return (
    <div className="flex min-h-screen bg-[#f3f4fb] text-[#262542]">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#262542]/30 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar (SkillSet Style) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between border-r border-[#eceef8] bg-white px-5 py-6 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Lockup */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <img
                src="/logo-don-bosco.png"
                alt="Logo SMA Don Bosco II"
                className="h-9 w-9 shrink-0 object-contain"
              />
              <div className="leading-tight">
                <div className="text-sm font-extrabold tracking-tight text-[#262542]">
                  Matriks XI
                </div>
                <div className="text-[11px] font-medium text-[#8a8da8]">SMA Don Bosco II</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1 text-[#8a8da8] hover:bg-[#f3f4fb] lg:hidden"
              aria-label="Tutup menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Menu */}
          <nav aria-label="Menu utama" className="mt-8 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className={`relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                    item.active
                      ? 'bg-[#f4f3ff] text-[#6c6ce5]'
                      : 'text-[#7c7f9d] hover:bg-[#f8f8fd] hover:text-[#262542]'
                  }`}
                >
                  {item.active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#6c6ce5]" />
                  )}
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Card (seperti kartu CTA bawah di referensi) */}
        <div className="space-y-3">
          {!isTeacher && student && (
            <div className="rounded-2xl bg-[#f6f5fe] p-4 text-center">
              <p className="text-xs font-bold text-[#262542]">
                {activeExam ? 'Ujian Masih Berjalan' : 'Siap Ujian Remedial?'}
              </p>
              <p className="mt-1 text-[11px] text-[#7c7f9d]">
                KKM {settings.kkm} · {settings.durationMinutes} menit · {remainingAttempts}× tersisa
              </p>
              <button
                type="button"
                disabled={!canTakeExam}
                onClick={handleStartExam}
                className={`mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition ${
                  canTakeExam
                    ? 'bg-[#6c6ce5] text-white shadow-sm shadow-[#6c6ce5]/30 hover:bg-[#5a5ad6]'
                    : 'cursor-not-allowed bg-[#e5e6f2] text-[#9b9db5]'
                }`}
              >
                <span>{activeExam ? 'Lanjutkan' : 'Mulai Ujian'}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#eceef8] bg-white py-2.5 text-xs font-semibold text-[#7c7f9d] transition hover:bg-[#fff5f6] hover:text-[#d94657]"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar (Search + Status Pill + Profile) */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 bg-[#f3f4fb]/90 px-4 backdrop-blur-sm sm:px-7">
          <div className="flex flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#6c6ce5] shadow-2xs lg:hidden"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative hidden max-w-xs flex-1 sm:block">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9db8]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder={isTeacher ? 'Cari nama / No. Absen...' : 'Cari topik matriks...'}
                className="h-10 w-full rounded-xl border border-[#eceef8] bg-white pl-10 pr-3 text-xs text-[#262542] shadow-2xs outline-none placeholder:text-[#9a9db8] focus:border-[#6c6ce5]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isTeacher && student ? (
              <>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white shadow-xs ${
                    hasPassed ? 'bg-[#34c78a]' : 'bg-[#ff6b72]'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  {hasPassed ? 'Tuntas' : `KKM ${settings.kkm}`}
                </span>
                <div className="flex items-center gap-2 rounded-full bg-white py-1 pl-1.5 pr-3 shadow-2xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e9e8ff] text-xs font-extrabold text-[#6c6ce5]">
                    {student.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="hidden text-xs font-semibold text-[#262542] md:inline">
                    {student.className} · Absen {student.absen}
                  </span>
                </div>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6c6ce5] px-3 py-1 text-xs font-bold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Admin Guru
              </span>
            )}
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 px-4 pb-10 pt-2 sm:px-7">
          {view.kind === 'student_home' && student && (
            <StudentHomeView
              student={student}
              settings={settings}
              attempts={studentAttempts}
              activeExam={activeExam}
              practiceDone={practiceDone}
              searchQuery={globalSearch}
              onStartPractice={handleOpenPractice}
              onStartExam={handleStartExam}
            />
          )}

          {view.kind === 'practice' && student && (
            <PracticeView
              initialCompetencyId={view.competencyId}
              className={student.className}
              onTopicChange={(id) => {
                const topic = COMPETENCIES.find((c) => c.id === id);
                upsertLiveSession({
                  student,
                  status: 'practice',
                  activity: `Latihan Topik ${id}: ${topic?.shortTitle ?? ''}`,
                  currentQuestion: id,
                });
              }}
              onCompletePractice={() => markPracticeCompleted(student)}
              onBack={() => {
                upsertLiveSession({
                  student,
                  status: 'online',
                  activity: 'Kembali ke Beranda Remedial',
                });
                setView({ kind: 'student_home' });
              }}
            />
          )}

          {view.kind === 'exam' && (
            <ExamView
              session={view.session}
              maxViolations={settings.maxViolations}
              onUpdateAnswers={handleUpdateExamAnswers}
              onRecordViolation={handleRecordViolation}
              onProgressChange={handleExamProgress}
              onSubmitExam={handleSubmitExam}
            />
          )}

          {view.kind === 'result' && (
            <ResultView
              questions={view.questions}
              answers={view.answers}
              grade={view.grade}
              remainingAttempts={remainingAttempts}
              violationCount={view.violationCount}
              autoSubmittedByViolation={view.autoSubmittedByViolation}
              onGoHome={() => setView({ kind: 'student_home' })}
              onGoPractice={() => handleOpenPractice(1)}
              onRetakeExam={handleStartExam}
            />
          )}

          {view.kind === 'teacher' && (
            <TeacherDashboardView
              settings={settings}
              attempts={attempts}
              liveSessions={liveSessions}
              activeTab={view.tab}
              externalSearch={globalSearch}
              onRefreshLive={refreshLiveData}
              onTabChange={(nextTab) => setView({ kind: 'teacher', tab: nextTab })}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
