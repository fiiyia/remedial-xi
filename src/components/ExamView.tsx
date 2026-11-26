import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Send } from 'lucide-react';
import { generateExamQuestions } from '../lib/generator/questions';
import type { ExamAnswersMap, GeneratedQuestion } from '../lib/generator/types';
import type { ActiveExamSession } from '../lib/storage/repository';
import { QuestionCard } from './QuestionCard';

interface ExamViewProps {
  session: ActiveExamSession;
  onUpdateAnswers: (answers: ExamAnswersMap) => void;
  onSubmitExam: (questions: GeneratedQuestion[], answers: ExamAnswersMap) => void;
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

export function ExamView({ session, onUpdateAnswers, onSubmitExam }: ExamViewProps) {
  const questions = useMemo(() => generateExamQuestions(session.seed), [session.seed]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const deadlineMs = session.startedAt + session.durationMinutes * 60_000;
  const [remainingSec, setRemainingSec] = useState(() =>
    Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000))
  );

  const latestAnswersRef = useRef(session.answers);
  latestAnswersRef.current = session.answers;
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000));
      setRemainingSec(left);
      if (left <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        onSubmitExam(questions, latestAnswersRef.current);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadlineMs, onSubmitExam, questions]);

  const activeQuestion = questions[currentIndex];
  const answeredCount = questions.filter((q) => isQuestionTouched(session.answers, q)).length;
  const isUrgent = remainingSec <= 300;

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6">
      {/* Sticky Exam Bar */}
      <div className="sticky top-14 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xs backdrop-blur">
        <div>
          <p className="text-xs font-semibold text-slate-500">
            Ujian Remedial • {session.student.name} ({session.student.className})
          </p>
          <p className="text-xs text-slate-600">
            Terisi: <strong>{answeredCount}</strong> / {questions.length} soal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`font-mono-math inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold ${
              isUrgent
                ? 'bg-rose-100 text-rose-800 ring-1 ring-rose-300'
                : 'bg-slate-100 text-slate-800'
            }`}
            aria-live="off"
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{formatTimer(remainingSec)}</span>
          </div>

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
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
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : touched
                    ? 'border border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
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
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>Sebelumnya</span>
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <span>Soal Berikutnya</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>Kumpulkan Jawaban</span>
          </button>
        )}
      </div>

      {/* Panel Konfirmasi Kumpulkan */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-submit-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 id="confirm-submit-title" className="text-base font-bold text-slate-900">
                  Kumpulkan Ujian Remedial?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Kamu telah mengisi <strong>{answeredCount}</strong> dari{' '}
                  <strong>{questions.length}</strong> soal. Setelah dikumpulkan, nilai langsung
                  dihitung dan terekam ke Dashboard Guru.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  onSubmitExam(questions, session.answers);
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
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
