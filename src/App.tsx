import { useCallback, useState } from 'react';
import { Grid3x3, LogOut } from 'lucide-react';
import { gradeExam } from './lib/generator/grading';
import type {
  CompetencyId,
  ExamAnswersMap,
  ExamGradeResult,
  GeneratedQuestion,
} from './lib/generator/types';
import { generateSessionSeed } from './lib/math/prng';
import {
  clearActiveExam,
  getStudentExamAttempts,
  hasCompletedPractice,
  loadActiveExam,
  loadAttempts,
  loadSettings,
  markPracticeCompleted,
  recordExamAttempt,
  saveActiveExam,
  saveSettings,
  type ActiveExamSession,
  type AttemptRecord,
  type RemedialSettings,
  type StudentProfile,
} from './lib/storage/repository';
import { ExamView } from './components/ExamView';
import { LoginView } from './components/LoginView';
import { PracticeView } from './components/PracticeView';
import { ResultView } from './components/ResultView';
import { StudentHomeView } from './components/StudentHomeView';
import { TeacherDashboardView } from './components/TeacherDashboardView';

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
    }
  | { kind: 'teacher' };

export function App() {
  const [settings, setSettings] = useState<RemedialSettings>(() => loadSettings());
  const [attempts, setAttempts] = useState<AttemptRecord[]>(() => loadAttempts());
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [view, setView] = useState<AppView>({ kind: 'login' });

  const refreshAttempts = useCallback(() => {
    setAttempts(loadAttempts());
  }, []);

  const handleStudentLogin = (profile: StudentProfile) => {
    setStudent(profile);
    refreshAttempts();
    setView({ kind: 'student_home' });
  };

  const handleStartExam = () => {
    if (!student) return;
    const existing = loadActiveExam(student.nis);
    if (existing) {
      setView({ kind: 'exam', session: existing });
      return;
    }
    const newSession: ActiveExamSession = {
      student,
      seed: generateSessionSeed(),
      startedAt: Date.now(),
      durationMinutes: settings.durationMinutes,
      answers: {},
    };
    saveActiveExam(newSession);
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

  const handleSubmitExam = useCallback(
    (questions: GeneratedQuestion[], answers: ExamAnswersMap) => {
      setView((prev) => {
        if (prev.kind !== 'exam') return prev;
        const grade = gradeExam(questions, answers, settings.kkm);
        recordExamAttempt({
          student: prev.session.student,
          seed: prev.session.seed,
          grade,
          startedAt: prev.session.startedAt,
        });
        clearActiveExam();
        setAttempts(loadAttempts());
        return { kind: 'result', questions, answers, grade };
      });
    },
    [settings.kkm]
  );

  const handleSaveSettings = (next: RemedialSettings) => {
    saveSettings(next);
    setSettings(next);
  };

  const handleLogout = () => {
    setStudent(null);
    setView({ kind: 'login' });
  };

  const studentAttempts = student ? getStudentExamAttempts(student.nis) : [];
  const remainingAttempts = Math.max(0, settings.maxAttempts - studentAttempts.length);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Grid3x3 className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">Web Remedial Matriks</span>
              <span className="ml-2 hidden rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700 sm:inline-block">
                PH XI.2
              </span>
            </div>
          </div>

          {view.kind !== 'login' && (
            <div className="flex items-center gap-3">
              {student && (
                <span className="hidden text-xs font-medium text-slate-600 sm:inline">
                  {student.name} ({student.className})
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        {view.kind === 'login' && (
          <LoginView
            settings={settings}
            onStudentLogin={handleStudentLogin}
            onTeacherLogin={() => {
              refreshAttempts();
              setView({ kind: 'teacher' });
            }}
          />
        )}

        {view.kind === 'student_home' && student && (
          <StudentHomeView
            student={student}
            settings={settings}
            attempts={studentAttempts}
            activeExam={loadActiveExam(student.nis)}
            practiceDone={hasCompletedPractice(student.nis)}
            onStartPractice={(competencyId) =>
              setView({ kind: 'practice', competencyId })
            }
            onStartExam={handleStartExam}
          />
        )}

        {view.kind === 'practice' && student && (
          <PracticeView
            initialCompetencyId={view.competencyId}
            onCompletePractice={() => markPracticeCompleted(student.nis)}
            onBack={() => setView({ kind: 'student_home' })}
          />
        )}

        {view.kind === 'exam' && (
          <ExamView
            session={view.session}
            onUpdateAnswers={handleUpdateExamAnswers}
            onSubmitExam={handleSubmitExam}
          />
        )}

        {view.kind === 'result' && (
          <ResultView
            questions={view.questions}
            answers={view.answers}
            grade={view.grade}
            remainingAttempts={remainingAttempts}
            onGoHome={() => setView({ kind: 'student_home' })}
            onGoPractice={() => setView({ kind: 'practice', competencyId: 1 })}
            onRetakeExam={handleStartExam}
          />
        )}

        {view.kind === 'teacher' && (
          <TeacherDashboardView
            settings={settings}
            attempts={attempts}
            onSaveSettings={handleSaveSettings}
          />
        )}
      </main>
    </div>
  );
}

export default App;
