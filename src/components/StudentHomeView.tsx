import { Award, BookOpenCheck, Clock, Lock, Play, RotateCcw } from 'lucide-react';
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
  const paketLabel = student.className === 'XI-1' ? 'Paket A' : 'Paket B';

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:py-8">
      {/* Banner Status Siswa */}
      <section className="soft-card rounded-3xl p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#6d4c9e]">
              Kelas {student.className} ({paketLabel}) · No. Absen {student.absen}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#2c243b]">
              Halo, {student.name}
            </h2>
            <p className="mt-0.5 text-sm text-[#5c536d]">{settings.title}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-[#ebe4f4] bg-[#faf8fc] px-4 py-2.5 text-center">
              <div className="text-xs text-[#6f6680]">Nilai Tertinggi</div>
              <div className="text-xl font-extrabold text-[#2c243b]">
                {attempts.length > 0 ? bestScore : '—'}
              </div>
            </div>
            <div
              className={`rounded-2xl px-4 py-2.5 text-center ${
                hasPassed
                  ? 'border border-[#c7e6d6] bg-[#ebf7f1] text-[#266b4d]'
                  : 'border border-[#f2ccd5] bg-[#fdf0f3] text-[#a33b56]'
              }`}
            >
              <div className="text-xs opacity-80">KKM {settings.kkm}</div>
              <div className="mt-0.5 flex items-center gap-1 text-sm font-bold">
                <Award className="h-4 w-4" aria-hidden="true" />
                <span>{hasPassed ? 'TUNTAS' : 'BELUM TUNTAS'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Ujian Remedial */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e6dcf4] bg-[#f6f2fb] p-4 sm:p-5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#2c243b]">
              {activeExam
                ? 'Ujian Remedial Sedang Berlangsung'
                : `Ujian Remedial Matriks — ${student.className} (${paketLabel})`}
            </h3>
            <p className="text-xs text-[#5c536d]">
              6 soal acak khusus kelas {student.className} · Durasi {settings.durationMinutes} menit
              · Sisa kesempatan: <strong>{remainingAttempts}</strong> dari {settings.maxAttempts}×
            </p>
            {examBlockedByPractice && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#9a6b16]">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Coba minimal 1 soal di Mode Latihan dulu sebelum memulai ujian ya.
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={!canTakeExam}
            onClick={onStartExam}
            className={`inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition ${
              canTakeExam
                ? 'bg-[#6d4c9e] text-white hover:bg-[#5b3d8a]'
                : 'cursor-not-allowed bg-[#e5e0ec] text-[#8d849c]'
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
                <span>Mulai Ujian</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Daftar 6 Kompetensi untuk Mode Latihan */}
      <section>
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-[#2c243b]">
              Latihan Mandiri per Topik ({paketLabel})
            </h3>
            <p className="text-xs text-[#5c536d]">
              Belajar santai tanpa batas waktu, lengkap dengan petunjuk bertahap dan pembahasan.
            </p>
          </div>
          {practiceDone && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c7e6d6] bg-[#ebf7f1] px-3 py-1 text-xs font-semibold text-[#266b4d]">
              <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Sudah Berlatih
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMPETENCIES.map((comp) => (
            <div
              key={comp.id}
              className="soft-card flex flex-col justify-between rounded-2xl p-4 transition hover:border-[#cbbbe6]"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#6d4c9e]">
                  <span>Bagian {comp.id}</span>
                  <span className="rounded-full bg-[#f4effa] px-2.5 py-0.5 text-[#563f7a]">
                    {comp.maxPoints} poin
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-bold text-[#2c243b]">{comp.title}</h4>
                <p className="mt-1 text-xs text-[#6f6680]">
                  Soal latihan khusus Kelas {student.className}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onStartPractice(comp.id)}
                className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-xl border border-[#e3d9f0] bg-[#faf8fc] text-xs font-semibold text-[#563f7a] transition hover:bg-[#f1eaf9]"
              >
                Latihan Topik Ini
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Riwayat Percobaan Ujian */}
      {attempts.length > 0 && (
        <section className="soft-card rounded-3xl p-5">
          <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-[#2c243b]">
            <Clock className="h-4 w-4 text-[#6d4c9e]" aria-hidden="true" />
            <span>Riwayat Ujian Kamu</span>
          </h3>
          <div className="divide-y divide-[#f1eaf9]">
            {attempts.map((att, idx) => (
              <div
                key={att.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <span className="font-semibold text-[#2c243b]">
                    Percobaan #{attempts.length - idx}
                  </span>
                  <span className="ml-2 text-xs text-[#6f6680]">
                    {new Date(att.submittedAt).toLocaleString('id-ID')} ·{' '}
                    {Math.max(1, Math.round(att.durationSeconds / 60))} menit
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono-math font-bold text-[#2c243b]">
                    {att.totalScore} / {att.maxScore}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      att.passed
                        ? 'bg-[#ebf7f1] text-[#266b4d]'
                        : 'bg-[#fdf0f3] text-[#a33b56]'
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
