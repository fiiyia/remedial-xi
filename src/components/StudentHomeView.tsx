import {
  Award,
  BookOpenCheck,
  Clock,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { COMPETENCIES, type CompetencyId } from '../lib/generator/types';
import type {
  ActiveExamSession,
  AttemptRecord,
  RemedialSettings,
  StudentProfile,
} from '../lib/storage/repository';

interface StudentHomeViewProps {
  student: StudentProfile;
  settings: RemedialSettings;
  attempts: AttemptRecord[];
  activeExam: ActiveExamSession | null;
  practiceDone: boolean;
  onStartPractice: (competencyId: CompetencyId) => void;
  onStartExam: () => void;
}

export function StudentHomeView({
  student,
  settings,
  attempts,
  activeExam,
  practiceDone,
  onStartPractice,
  onStartExam,
}: StudentHomeViewProps) {
  const bestScore = attempts.reduce((m, a) => Math.max(m, a.totalScore), 0);
  const hasPassed = bestScore >= settings.kkm;
  const remainingAttempts = Math.max(0, settings.maxAttempts - attempts.length);
  const examBlockedByPractice = settings.requirePractice && !practiceDone && !activeExam;
  const canTakeExam = Boolean(activeExam) || (remainingAttempts > 0 && !examBlockedByPractice);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:py-8">
      {/* Banner Status Siswa */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Beranda Remedial • {student.className} • NIS {student.nis}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Halo, {student.name}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{settings.title}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center">
              <div className="text-xs text-slate-500">Nilai Tertinggi</div>
              <div className="text-xl font-extrabold text-slate-900">
                {attempts.length > 0 ? bestScore : '—'}
              </div>
            </div>
            <div
              className={`rounded-xl px-4 py-2.5 text-center ring-1 ${
                hasPassed
                  ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                  : 'bg-amber-50 text-amber-900 ring-amber-200'
              }`}
            >
              <div className="text-xs opacity-80">Status KKM ({settings.kkm})</div>
              <div className="mt-0.5 flex items-center gap-1 text-sm font-bold">
                <Award className="h-4 w-4" aria-hidden="true" />
                <span>{hasPassed ? 'TUNTAS' : 'BELUM TUNTAS'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Ujian Remedial */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-indigo-50/70 p-4 ring-1 ring-indigo-200/70">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-indigo-950">
              {activeExam ? 'Ujian Remedial Sedang Berlangsung' : 'Mode Ujian Remedial Resmi'}
            </h3>
            <p className="text-xs text-indigo-900/80">
              6 soal acak setara PH XI.2 • Durasi {settings.durationMinutes} menit • Tanpa hint •
              Sisa kesempatan: <strong>{remainingAttempts}</strong> dari {settings.maxAttempts}×
            </p>
            {examBlockedByPractice && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Guru mewajibkan kamu mencoba minimal 1 soal Mode Latihan terlebih dahulu.
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={!canTakeExam}
            onClick={onStartExam}
            className={`inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition ${
              canTakeExam
                ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
                : 'cursor-not-allowed bg-slate-200 text-slate-500'
            }`}
          >
            {activeExam ? (
              <>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Lanjutkan Ujian</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" aria-hidden="true" />
                <span>Mulai Ujian Remedial</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Daftar 6 Kompetensi untuk Mode Latihan */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Sparkles className="h-5 w-5 text-indigo-600" aria-hidden="true" />
              <span>Mode Latihan Mandiri (6 Kompetensi PH XI.2)</span>
            </h3>
            <p className="text-xs text-slate-600">
              Latih kembali topik yang belum dikuasai dengan hint bertahap dan pembahasan langkah
              demi langkah tanpa batas waktu.
            </p>
          </div>
          {practiceDone && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Sudah Berlatih
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMPETENCIES.map((comp) => (
            <div
              key={comp.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-indigo-300"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>Topik {comp.id}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                    Bobot {comp.maxPoints}
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-slate-900">{comp.title}</h4>
                <p className="mt-1 text-xs text-slate-500">{comp.reference}</p>
              </div>
              <button
                type="button"
                onClick={() => onStartPractice(comp.id)}
                className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50/70 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                Latih Topik Ini
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Riwayat Percobaan Ujian */}
      {attempts.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
            <Clock className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span>Riwayat Ujian Remedial Kamu</span>
          </h3>
          <div className="divide-y divide-slate-100">
            {attempts.map((att, idx) => (
              <div
                key={att.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
              >
                <div>
                  <span className="font-semibold text-slate-800">
                    Percobaan #{attempts.length - idx}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">
                    {new Date(att.submittedAt).toLocaleString('id-ID')} •{' '}
                    {Math.max(1, Math.round(att.durationSeconds / 60))} menit
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono-math font-bold text-slate-900">
                    {att.totalScore} / {att.maxScore}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      att.passed
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {att.passed ? 'TUNTAS' : 'BELUM TUNTAS'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
