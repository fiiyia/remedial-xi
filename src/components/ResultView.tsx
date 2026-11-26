import { Award, Home, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import type {
  ExamAnswersMap,
  ExamGradeResult,
  GeneratedQuestion,
} from '../lib/generator/types';
import { QuestionCard } from './QuestionCard';

interface ResultViewProps {
  questions: GeneratedQuestion[];
  answers: ExamAnswersMap;
  grade: ExamGradeResult;
  remainingAttempts: number;
  onGoHome: () => void;
  onGoPractice: () => void;
  onRetakeExam: () => void;
}

export function ResultView({
  questions,
  answers,
  grade,
  remainingAttempts,
  onGoHome,
  onGoPractice,
  onRetakeExam,
}: ResultViewProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:py-8">
      {/* Kartu Skor Akhir & Status KKM */}
      <section
        className={`rounded-2xl border p-6 shadow-xs ${
          grade.passed
            ? 'border-emerald-200 bg-emerald-50/70'
            : 'border-rose-200 bg-rose-50/70'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`rounded-2xl p-3 ${
                grade.passed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {grade.passed ? (
                <Award className="h-7 w-7" aria-hidden="true" />
              ) : (
                <XCircle className="h-7 w-7" aria-hidden="true" />
              )}
            </div>
            <div>
              <span
                className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${
                  grade.passed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {grade.passed ? 'TUNTAS' : 'BELUM TUNTAS (Silakan Ulangi)'}
              </span>
              <h2 className="mt-1.5 text-2xl font-extrabold text-slate-900">
                Skor Akhir: {grade.totalScore} / {grade.maxScore}
              </h2>
              <p className="mt-1 text-sm text-slate-700">
                {grade.passed
                  ? `Selamat! Nilai kamu telah mencapai KKM (${grade.kkm}) dan otomatis terekam di Dashboard Guru.`
                  : `Nilai kamu masih di bawah KKM (${grade.kkm}). Pelajari pembahasan di bawah, berlatih kembali di Mode Latihan, lalu ulangi ujian.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span>Beranda</span>
            </button>

            {!grade.passed && (
              <button
                type="button"
                onClick={onGoPractice}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-700"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>Ulangi Latihan</span>
              </button>
            )}

            {!grade.passed && remainingAttempts > 0 && (
              <button
                type="button"
                onClick={onRetakeExam}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 text-sm font-semibold text-white hover:from-violet-700 hover:to-fuchsia-600"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Ulangi Ujian ({remainingAttempts}× tersisa)</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Rincian & Pembahasan per Nomor */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">
          Rincian Jawaban &amp; Pembahasan Lengkap
        </h3>
        {questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            questionNumber={idx + 1}
            answers={answers[q.id] ?? {}}
            onChangeAnswers={() => {}}
            mode="review"
            gradeResult={grade.items[idx]}
          />
        ))}
      </section>
    </div>
  );
}
