import { Award, CheckCircle2, Clock, Lock, Play, RotateCcw } from 'lucide-react';
import { COMPETENCIES, type CompetencyId } from '../lib/generator/types';
import type {
  ActiveExamSession,
  AttemptRecord,
  RemedialSettings,
  StudentProfile,
} from '../lib/storage/repository';
import { HeroBooksLeft, HeroBooksRight, TopicThumbnail } from './TopicIllustration';

interface StudentHomeViewProps {
  student: StudentProfile;
  settings: RemedialSettings;
  attempts: AttemptRecord[];
  activeExam: ActiveExamSession | null;
  practiceDone: boolean;
  searchQuery?: string;
  onStartPractice: (competencyId: CompetencyId) => void;
  onStartExam: () => void;
}

export function StudentHomeView({
  student,
  settings,
  attempts,
  activeExam,
  practiceDone,
  searchQuery = '',
  onStartPractice,
  onStartExam,
}: StudentHomeViewProps) {
  const bestScore = attempts.reduce((m, a) => Math.max(m, a.totalScore), 0);
  const hasPassed = bestScore >= settings.kkm;
  const remainingAttempts = Math.max(0, settings.maxAttempts - attempts.length);
  const examBlockedByPractice = settings.requirePractice && !practiceDone && !activeExam;
  const canTakeExam = Boolean(activeExam) || (remainingAttempts > 0 && !examBlockedByPractice);
  const paketLabel = student.className === 'XI-1' ? 'Paket A' : 'Paket B';

  const scorePct = Math.min(100, Math.round((bestScore / settings.kkm) * 100));
  const practicePct = practiceDone ? 100 : 25;

  const q = searchQuery.trim().toLowerCase();
  const visibleTopics = COMPETENCIES.filter(
    (c) =>
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.shortTitle.toLowerCase().includes(q)
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Hero Banner Periwinkle-Lilac (mirip banner "Hi, Irham..." di referensi) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7372F3] via-[#7E7AF6] to-[#6866E6] px-6 py-7 text-white shadow-lg shadow-[#6c6ce5]/20 sm:px-8">
        {/* Soft geometric background circles */}
        <div className="pointer-events-none absolute -left-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-16 h-44 w-44 rounded-full bg-white/10" />

        <div className="relative flex items-center justify-between gap-6">
          <HeroBooksLeft />

          <div className="mx-auto max-w-md text-center">
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Hai, {student.name}!
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-white/85 sm:text-sm">
              Selamat datang di Web Remedial Matriks Kelas {student.className} ({paketLabel}).
              Latih materi di bawah atau langsung mulai ujian remedialmu.
            </p>

            {examBlockedByPractice && (
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-amber-100">
                <Lock className="h-3 w-3" aria-hidden="true" />
                Coba minimal 1 soal latihan dulu ya
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                disabled={!canTakeExam}
                onClick={onStartExam}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-5 py-2 text-xs font-semibold transition ${
                  canTakeExam
                    ? 'border-white/40 bg-white/15 text-white hover:bg-white/25'
                    : 'cursor-not-allowed border-white/20 bg-white/10 text-white/50'
                }`}
              >
                {activeExam ? (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Lanjutkan Ujian</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Mulai Ujian ({settings.durationMinutes} mnt)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <HeroBooksRight />
        </div>
      </section>

      {/* Main 2-Column Dashboard Grid (70% Topics / 30% Right Widgets) */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left: Grid 6 Topik Latihan dengan Thumbnail Pastel */}
        <section className="space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#262542]">
                Topik Latihan Matriks ({paketLabel})
              </h2>
              <p className="text-xs text-[#8a8da8]">
                Pilih salah satu topik untuk berlatih dengan hint bertahap &amp; pembahasan.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#6c6ce5]">
              {visibleTopics.length} topik
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {visibleTopics.map((comp) => (
              <button
                key={comp.id}
                type="button"
                onClick={() => onStartPractice(comp.id)}
                className="soft-card group flex flex-col rounded-3xl p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <TopicThumbnail id={comp.id} />
                <div className="mt-3 px-1 pb-1">
                  <h3 className="line-clamp-2 text-sm font-bold text-[#262542] group-hover:text-[#6c6ce5]">
                    {comp.shortTitle}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#8a8da8]">
                    {comp.title}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-[#6c6ce5]">Bobot {comp.maxPoints}</span>
                    <span className="rounded-lg bg-[#f3f2ff] px-2 py-0.5 text-[#6c6ce5] transition group-hover:bg-[#6c6ce5] group-hover:text-white">
                      Latih
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Right Rail: Target Ketuntasan + Riwayat Ujian (mirip "Unlocks achievement" & "Best sales") */}
        <aside className="space-y-5 lg:col-span-4">
          {/* Widget 1: Target Ketuntasan */}
          <div className="soft-card rounded-3xl p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#262542]">Target Ketuntasan</h3>
                <p className="text-[11px] text-[#8a8da8]">
                  Capai nilai minimal KKM {settings.kkm}
                </p>
              </div>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                  hasPassed ? 'bg-[#e6f9f1] text-[#28a870]' : 'bg-[#f1f0ff] text-[#6c6ce5]'
                }`}
              >
                <Award className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {/* Bar 1: Skor Tertinggi */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#262542]">
                    Skor Tertinggi: {attempts.length > 0 ? bestScore : 0}
                  </span>
                  <span className="text-[11px] font-medium text-[#8a8da8]">
                    KKM {settings.kkm}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#eceef8]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      hasPassed ? 'bg-[#34c78a]' : 'bg-[#6c6ce5]'
                    }`}
                    style={{ width: `${scorePct}%` }}
                  />
                </div>
              </div>

              {/* Bar 2: Status Latihan */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#262542]">Latihan Mandiri</span>
                  <span className="text-[11px] font-medium text-[#8a8da8]">
                    {practiceDone ? 'Selesai' : 'Belum dicoba'}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#eceef8]">
                  <div
                    className="h-full rounded-full bg-[#9b8cf7] transition-all"
                    style={{ width: `${practicePct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Widget 2: Riwayat Percobaan */}
          <div className="soft-card rounded-3xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#262542]">Riwayat Ujian</h3>
              <span className="text-[11px] font-semibold text-[#8a8da8]">
                {attempts.length}/{settings.maxAttempts}×
              </span>
            </div>

            {attempts.length === 0 ? (
              <div className="rounded-2xl bg-[#f6f7fc] p-4 text-center">
                <Clock className="mx-auto h-5 w-5 text-[#9a9db8]" aria-hidden="true" />
                <p className="mt-1.5 text-xs font-medium text-[#7c7f9d]">
                  Belum ada riwayat ujian. Yuk coba latihan dulu atau mulai ujian!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {attempts.slice(0, 4).map((att, idx) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between gap-2 rounded-2xl bg-[#f8f9fe] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-extrabold ${
                          att.passed
                            ? 'bg-[#e6f9f1] text-[#28a870]'
                            : 'bg-[#ffeff1] text-[#e05263]'
                        }`}
                      >
                        {att.passed ? (
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          `#${attempts.length - idx}`
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#262542]">
                          Percobaan #{attempts.length - idx}
                        </p>
                        <p className="text-[10px] text-[#8a8da8]">
                          {new Date(att.submittedAt).toLocaleDateString('id-ID')} ·{' '}
                          {Math.max(1, Math.round(att.durationSeconds / 60))} mnt
                        </p>
                      </div>
                    </div>

                    <span
                      className={`font-mono-math rounded-xl px-2.5 py-1 text-xs font-bold ${
                        att.passed
                          ? 'bg-[#34c78a] text-white'
                          : 'bg-[#6c6ce5] text-white'
                      }`}
                    >
                      {att.totalScore}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
