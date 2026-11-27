import { useState } from 'react';
import { CheckCircle2, ChevronDown, HelpCircle, Lightbulb, XCircle } from 'lucide-react';
import type {
  GeneratedQuestion,
  QuestionAnswerMap,
  QuestionGradeResult,
} from '../lib/generator/types';
import { MathBlock } from './MathBlock';
import { MatrixInputGrid, createEmptyGrid } from './MatrixInputGrid';

interface QuestionCardProps {
  question: GeneratedQuestion;
  questionNumber: number;
  answers: QuestionAnswerMap;
  onChangeAnswers: (next: QuestionAnswerMap) => void;
  mode: 'practice' | 'exam' | 'review';
  gradeResult?: QuestionGradeResult;
}

export function QuestionCard({
  question,
  questionNumber,
  answers,
  onChangeAnswers,
  mode,
  gradeResult,
}: QuestionCardProps) {
  const [revealedHintLevel, setRevealedHintLevel] = useState<number>(0);
  const [showSolution, setShowSolution] = useState<boolean>(mode === 'review');

  const isDisabled = mode === 'review';

  const updateScalar = (fieldId: string, val: string) => {
    onChangeAnswers({ ...answers, [fieldId]: val });
  };

  const updateMatrix = (fieldId: string, grid: string[][]) => {
    onChangeAnswers({ ...answers, [fieldId]: grid });
  };

  return (
    <article className="soft-card rounded-3xl p-5 sm:p-6">
      {/* Header Soal */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-[#f1eaf9] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#f4effa] px-3 py-0.5 text-xs font-semibold text-[#6d4c9e]">
              Soal {questionNumber} · Paket {question.variant}
            </span>
            <span className="text-xs font-medium text-[#6f6680]">
              Bobot {question.maxPoints} poin
            </span>
          </div>
          <h3 className="mt-1.5 text-base font-bold text-[#2c243b] sm:text-lg">
            {question.title}
          </h3>
        </div>

        {gradeResult && (
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              gradeResult.isFullyCorrect
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : gradeResult.earned > 0
                  ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                  : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
            }`}
          >
            {gradeResult.isFullyCorrect ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <XCircle className="h-4 w-4" aria-hidden="true" />
            )}
            <span>
              Skor: {gradeResult.earned} / {gradeResult.maxPoints}
            </span>
          </div>
        )}
      </div>

      {/* Narasi & Rumus Soal */}
      <div
        className={`space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base ${
          mode === 'exam' ? 'select-none' : ''
        }`}
      >
        <p className="whitespace-pre-line">{question.promptText}</p>
        {question.promptLatex && (
          <div className="rounded-xl bg-[#f8f9fe] px-3 py-3 text-[#262542] ring-1 ring-[#eceef8] sm:px-4">
            <MathBlock latex={question.promptLatex} display />
          </div>
        )}
        {question.subPromptText && (
          <p className="font-medium text-[#262542]">{question.subPromptText}</p>
        )}
      </div>

      {/* Kolom Input Jawaban */}
      <div className="mt-6 space-y-4">
        {question.fields.map((field) => {
          const fieldGrade = gradeResult?.fields.find((f) => f.fieldId === field.id);

          if (field.kind === 'matrix') {
            const existing = answers[field.id];
            const gridVal = Array.isArray(existing)
              ? existing
              : createEmptyGrid(field.rows, field.cols);

            return (
              <div key={field.id} className="space-y-2">
                <MatrixInputGrid
                  id={`${question.id}-${field.id}`}
                  label={field.label}
                  labelLatex={field.labelLatex}
                  rows={field.rows}
                  cols={field.cols}
                  allowFraction={field.allowFraction}
                  value={gridVal}
                  onChange={(next) => updateMatrix(field.id, next)}
                  disabled={isDisabled}
                  correctCells={fieldGrade?.correctCells}
                />
                {fieldGrade && !fieldGrade.isCorrect && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs text-rose-800">
                    <span className="font-semibold">Kunci jawaban:</span>
                    <div className="mt-1">
                      <MathBlock latex={fieldGrade.expectedDisplay} display />
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Scalar field
          const strVal = typeof answers[field.id] === 'string' ? (answers[field.id] as string) : '';
          let borderStyle =
            'border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';
          if (fieldGrade?.isCorrect === true) {
            borderStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900';
          } else if (fieldGrade?.isCorrect === false) {
            borderStyle = 'border-rose-500 bg-rose-50 text-rose-900';
          }

          return (
            <div
              key={field.id}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 sm:p-4"
            >
              <label
                htmlFor={`${question.id}-${field.id}`}
                className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-slate-800"
              >
                <span>{field.label}</span>
                <span className="text-xs font-normal text-slate-500">
                  {field.points} poin
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-2.5">
                {field.labelLatex && (
                  <span className="text-sm font-medium text-slate-700">
                    <MathBlock latex={field.labelLatex} />
                  </span>
                )}
                <div className="relative flex w-full items-center sm:w-auto">
                  {field.prefix && (
                    <span className="pointer-events-none absolute left-3 text-sm font-semibold text-slate-500">
                      {field.prefix}
                    </span>
                  )}
                  <input
                    id={`${question.id}-${field.id}`}
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    disabled={isDisabled}
                    value={strVal}
                    onChange={(e) => updateScalar(field.id, e.target.value)}
                    placeholder={
                      field.placeholder ??
                      (field.allowCurrency ? 'contoh: 15000' : 'contoh: -3 atau 1/2')
                    }
                    className={`font-mono-math h-11 w-full rounded-lg border text-base font-medium outline-none transition sm:w-56 ${
                      field.prefix ? 'pl-9 pr-3' : 'px-3'
                    } ${borderStyle}`}
                  />
                </div>
              </div>

              {fieldGrade && !fieldGrade.isCorrect && (
                <p className="mt-2 text-xs font-medium text-rose-700">
                  Jawaban benar:{' '}
                  <span className="font-mono-math font-bold">{fieldGrade.expectedDisplay}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Fitur Hint Bertahap (Hanya pada Mode Latihan) */}
      {mode === 'practice' && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <Lightbulb className="h-4 w-4 text-amber-600" aria-hidden="true" />
              <span>Hint Bertahap ({revealedHintLevel}/{question.hints.length})</span>
            </div>
            {revealedHintLevel < question.hints.length && (
              <button
                type="button"
                onClick={() => setRevealedHintLevel((lvl) => Math.min(question.hints.length, lvl + 1))}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
              >
                <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Buka Hint Level {revealedHintLevel + 1}
              </button>
            )}
          </div>

          {revealedHintLevel > 0 && (
            <div className="mt-3 space-y-2.5">
              {question.hints.slice(0, revealedHintLevel).map((hint) => (
                <div
                  key={hint.level}
                  className="rounded-lg border border-amber-200/80 bg-white p-3 text-sm text-slate-700"
                >
                  <p className="font-semibold text-amber-900">
                    Hint {hint.level}: {hint.title}
                  </p>
                  <p className="mt-1">{hint.body}</p>
                  {hint.latex && (
                    <div className="mt-2 rounded bg-amber-50/70 px-3 py-1.5">
                      <MathBlock latex={hint.latex} display />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pembahasan Langkah demi Langkah (Selalu tersedia di Mode Latihan & Mode Review) */}
      {(mode === 'review' || mode === 'practice') && (
        <div className="mt-5 rounded-xl border border-[#dcdbf9] bg-[#f6f6fe] p-4">
          <button
            type="button"
            onClick={() => setShowSolution((s) => !s)}
            className="flex w-full items-center justify-between text-left text-sm font-bold text-[#4a48a8]"
          >
            <span>
              {showSolution
                ? 'Sembunyikan Pembahasan Langkah demi Langkah'
                : 'Lihat Pembahasan Langkah demi Langkah (Bebas Dibuka)'}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showSolution ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {showSolution && (
            <ol className="mt-3 space-y-3 border-t border-indigo-200/60 pt-3">
              {question.solutionSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="rounded-lg bg-white p-3 text-sm text-slate-700 shadow-2xs"
                >
                  <p className="font-semibold text-slate-900">{step.title}</p>
                  <p className="mt-0.5 text-slate-600">{step.explanation}</p>
                  {step.latex && (
                    <div className="mt-2 rounded bg-slate-50 px-3 py-1.5">
                      <MathBlock latex={step.latex} display />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </article>
  );
}
