import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Maximize2,
  Send,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { generateExamQuestions } from '../lib/generator/questions';
import type { ExamAnswersMap, GeneratedQuestion } from '../lib/generator/types';
import {
  getViolationLabel,
  type ActiveExamSession,
  type ViolationEvent,
  type ViolationType,
} from '../lib/storage/repository';
import { QuestionCard } from './QuestionCard';

interface ExamViewProps {
  session: ActiveExamSession;
  maxViolations: number;
  onUpdateAnswers: (answers: ExamAnswersMap) => void;
  onRecordViolation: (event: ViolationEvent) => void;
  onSubmitExam: (
    questions: GeneratedQuestion[],
    answers: ExamAnswersMap,
    autoSubmittedByViolation?: boolean
  ) => void;
}

function formatTimer(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function isQuestionTouched(answers: ExamAnswersMap, q: GeneratedQuestion): boolean {
  const map = answers[q.id];
  if (!map) return false;
  return q.fields.some((f) => {
    const val = map[f.id];
    if (typeof val === 'string') return val.trim().length > 0;
    if (Array.isArray(val)) return val.some((row) => row.some((c) => c.trim().length > 0));
    return false;
  });
}

export function ExamView({
  session,
  maxViolations,
  onUpdateAnswers,
  onRecordViolation,
  onSubmitExam,
}: ExamViewProps) {
  const questions = useMemo(
    () => generateExamQuestions(session.seed, session.student.className),
    [session.seed, session.student.className]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [warningModal, setWarningModal] = useState<ViolationEvent | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const enteredFullscreenRef = useRef(false);

  const deadlineMs = session.startedAt + session.durationMinutes * 60_000;
  const [remainingSec, setRemainingSec] = useState(() =>
    Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000))
  );

  const latestAnswersRef = useRef(session.answers);
  latestAnswersRef.current = session.answers;
  const violationsCountRef = useRef(session.violations.length);
  violationsCountRef.current = session.violations.length;
  const autoSubmittedRef = useRef(false);
  const lastScreenEventAtRef = useRef(0);

  const triggerViolation = useCallback(
    (type: ViolationType, detail: string) => {
      if (autoSubmittedRef.current) return;

      // Debounce 1.5 detik antara visibilitychange & blur agar 1 kali pindah tab tidak dihitung 2x
      const now = Date.now();
      if (
        (type === 'tab_switch' || type === 'window_blur') &&
        now - lastScreenEventAtRef.current < 1500
      ) {
        return;
      }
      if (type === 'tab_switch' || type === 'window_blur') {
        lastScreenEventAtRef.current = now;
      }

      const nextCount = violationsCountRef.current + 1;
      const event: ViolationEvent = {
        type,
        timestamp: new Date(now).toISOString(),
        detail:
          nextCount >= maxViolations
            ? `${detail} (batas pelanggaran tercapai — dikumpulkan otomatis)`
            : detail,
      };

      onRecordViolation(event);

      if (nextCount >= maxViolations) {
        autoSubmittedRef.current = true;
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        onSubmitExam(questions, latestAnswersRef.current, true);
      } else {
        setWarningModal(event);
      }
    },
    [maxViolations, onRecordViolation, onSubmitExam, questions]
  );

  // Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000));
      setRemainingSec(left);
      if (left <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        onSubmitExam(questions, latestAnswersRef.current, false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadlineMs, onSubmitExam, questions]);

  // Anti-Mencontek & Deteksi Layar Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation(
          'tab_switch',
          'Siswa berpindah tab atau meminimalkan jendela browser'
        );
      }
    };

    const handleWindowBlur = () => {
      triggerViolation(
        'window_blur',
        'Fokus layar keluar dari jendela ujian (pindah aplikasi / split screen)'
      );
    };

    const handleFullscreenChange = () => {
      const nowFs = Boolean(document.fullscreenElement);
      setIsFullscreen(nowFs);
      if (nowFs) {
        enteredFullscreenRef.current = true;
      } else if (enteredFullscreenRef.current && !autoSubmittedRef.current) {
        triggerViolation('fullscreen_exit', 'Siswa keluar dari mode layar penuh saat ujian');
      }
    };

    const handleCopyOrCut = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation('copy_attempt', 'Percobaan menyalin teks soal saat ujian');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopyOrCut);
    document.addEventListener('cut', handleCopyOrCut);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopyOrCut);
      document.removeEventListener('cut', handleCopyOrCut);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [triggerViolation]);

  const handleEnterFullscreen = () => {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const activeQuestion = questions[currentIndex];
  const answeredCount = questions.filter((q) => isQuestionTouched(session.answers, q)).length;
  const isUrgent = remainingSec <= 300;
  const violationCount = session.violations.length;

  return (
    <div className="mx-auto max-w-4xl space-y-4 sm:space-y-5">
      {/* Banner Info Anti-Mencontek & Mode Fokus */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-[#eceef8] bg-white px-4 py-3 text-xs">
        <div className="flex items-center gap-2 text-[#5c536d]">
          {violationCount === 0 ? (
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#28a870]" aria-hidden="true" />
          ) : (
            <ShieldAlert className="h-4 w-4 shrink-0 text-[#e05263]" aria-hidden="true" />
          )}
          <span>
            <strong>Deteksi Layar Aktif:</strong> Jangan pindah tab, keluar aplikasi, atau menyalin
            soal. Aktivitas layar terekam ke Dashboard Guru.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              violationCount === 0
                ? 'bg-[#e6f9f1] text-[#28a870]'
                : violationCount < maxViolations - 1
                  ? 'bg-[#fff6e0] text-[#b37400]'
                  : 'bg-[#ffeff1] text-[#d94657]'
            }`}
          >
            Pelanggaran: {violationCount}/{maxViolations}
          </span>

          {!isFullscreen && (
            <button
              type="button"
              onClick={handleEnterFullscreen}
              className="inline-flex items-center gap-1 rounded-lg border border-[#dcdbf9] bg-[#f6f6fe] px-2.5 py-1 text-[11px] font-semibold text-[#6c6ce5] transition hover:bg-[#ebeaFD]"
            >
              <Maximize2 className="h-3 w-3" aria-hidden="true" />
              <span>Layar Penuh</span>
            </button>
          )}
        </div>
      </div>

      {/* Sticky Exam Bar */}
      <div className="soft-card sticky top-16 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-[#6c6ce5]">
            Ujian Remedial · {session.student.name} ({session.student.className} · Absen{' '}
            {session.student.absen})
          </p>
          <p className="text-xs text-[#5c536d]">
            Terisi: <strong>{answeredCount}</strong> / {questions.length} soal
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={`font-mono-math inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold ${
              isUrgent
                ? 'border border-[#ffd0d6] bg-[#fff3f5] text-[#d94657]'
                : 'bg-[#f3f2ff] text-[#4a48a8]'
            }`}
            aria-live="off"
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{formatTimer(remainingSec)}</span>
          </div>

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#6c6ce5] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#5a5ad6]"
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Kumpulkan</span>
          </button>
        </div>
      </div>

      {/* Navigasi Nomor Soal */}
      <nav aria-label="Navigasi nomor soal" className="flex flex-wrap gap-2">
        {questions.map((q, idx) => {
          const touched = isQuestionTouched(session.answers, q);
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition ${
                isCurrent
                  ? 'bg-[#6c6ce5] text-white'
                  : touched
                    ? 'border border-[#bcead5] bg-[#eefbf5] text-[#28a870]'
                    : 'border border-[#eceef8] bg-white text-[#7c7f9d] hover:border-[#cfd0f7]'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </nav>

      {/* Kartu Soal Aktif */}
      <QuestionCard
        key={activeQuestion.id}
        question={activeQuestion}
        questionNumber={currentIndex + 1}
        answers={session.answers[activeQuestion.id] ?? {}}
        onChangeAnswers={(nextQ) =>
          onUpdateAnswers({ ...session.answers, [activeQuestion.id]: nextQ })
        }
        mode="exam"
      />

      {/* Tombol Sebelumnya / Berikutnya */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#eceef8] bg-white px-4 text-sm font-semibold text-[#5c536d] transition hover:bg-[#f6f6fe] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>Sebelumnya</span>
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#262542] px-4 text-sm font-semibold text-white transition hover:bg-[#1a1930]"
          >
            <span>Soal Berikutnya</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#6c6ce5] px-5 text-sm font-semibold text-white transition hover:bg-[#5a5ad6]"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>Kumpulkan Jawaban</span>
          </button>
        )}
      </div>

      {/* Modal Peringatan Deteksi Layar */}
      {warningModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#262542]/50 p-4 backdrop-blur-xs"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="violation-warning-title"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[#ffeff1] p-2.5 text-[#d94657]">
                <ShieldAlert className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 id="violation-warning-title" className="text-base font-bold text-[#262542]">
                  Peringatan Deteksi Layar ({violationCount}/{maxViolations})
                </h3>
                <p className="mt-1 text-xs font-semibold text-[#d94657]">
                  {getViolationLabel(warningModal.type)}
                </p>
                <p className="mt-1.5 text-sm text-[#5c536d]">
                  {warningModal.detail}. Aktivitas ini otomatis tercatat di Dashboard Guru. Jika
                  mencapai <strong>{maxViolations}× pelanggaran</strong>, ujian akan dikumpulkan
                  secara otomatis.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setWarningModal(null)}
                className="rounded-xl bg-[#6c6ce5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5a5ad6]"
              >
                Saya Mengerti, Kembali ke Ujian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel Konfirmasi Kumpulkan */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#262542]/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-submit-title"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[#fff6e0] p-2.5 text-[#b37400]">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 id="confirm-submit-title" className="text-base font-bold text-[#262542]">
                  Kumpulkan Ujian Remedial?
                </h3>
                <p className="mt-1 text-sm text-[#5c536d]">
                  Kamu telah mengisi <strong>{answeredCount}</strong> dari{' '}
                  <strong>{questions.length}</strong> soal. Setelah dikumpulkan, nilai dan log
                  layar langsung terekam ke Dashboard Guru.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-[#eceef8] bg-white px-4 py-2 text-sm font-semibold text-[#5c536d] hover:bg-[#f6f6fe]"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                  }
                  onSubmitExam(questions, session.answers, false);
                }}
                className="rounded-xl bg-[#6c6ce5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a5ad6]"
              >
                Ya, Kumpulkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
