import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import { gradeQuestion } from '../lib/generator/grading';
import { generateQuestionByCompetency } from '../lib/generator/questions';
import {
  COMPETENCIES,
  type CompetencyId,
  type QuestionAnswerMap,
  type QuestionGradeResult,
} from '../lib/generator/types';
import { generateSessionSeed } from '../lib/math/prng';
import type { ClassName } from '../lib/storage/repository';
import { QuestionCard } from './QuestionCard';

interface PracticeViewProps {
  initialCompetencyId: CompetencyId;
  className: ClassName;
  onCompletePractice: () => void;
  onBack: () => void;
}

export function PracticeView({
  initialCompetencyId,
  className,
  onCompletePractice,
  onBack,
}: PracticeViewProps) {
  const [competencyId, setCompetencyId] = useState<CompetencyId>(initialCompetencyId);
  const [seed, setSeed] = useState<number>(() => generateSessionSeed());
  const [answers, setAnswers] = useState<QuestionAnswerMap>({});
  const [gradeResult, setGradeResult] = useState<QuestionGradeResult | undefined>(undefined);

  const question = useMemo(
    () => generateQuestionByCompetency(competencyId, seed, undefined, className),
    [competencyId, seed, className]
  );

  const handleSelectCompetency = (id: CompetencyId) => {
    setCompetencyId(id);
    setSeed(generateSessionSeed());
    setAnswers({});
    setGradeResult(undefined);
  };

  const handleNewVariant = () => {
    setSeed(generateSessionSeed());
    setAnswers({});
    setGradeResult(undefined);
  };

  const handleCheck = () => {
    const res = gradeQuestion(question, answers);
    setGradeResult(res);
    onCompletePractice();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5c536d] hover:text-[#2c243b]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#f4effa] px-3 py-1 text-xs font-semibold text-[#6d4c9e]">
            Latihan Kelas {className}
          </span>
          <button
            type="button"
            onClick={handleNewVariant}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e3d9f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#563f7a] transition hover:bg-[#f6f2fb]"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Acak Angka Baru</span>
          </button>
        </div>
      </div>

      {/* Selector Topik */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {COMPETENCIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => handleSelectCompetency(c.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              c.id === competencyId
                ? 'bg-[#6d4c9e] text-white'
                : 'border border-[#e3d9f0] bg-white text-[#563f7a] hover:bg-[#f6f2fb]'
            }`}
          >
            {c.id}. {c.shortTitle}
          </button>
        ))}
      </div>

      <QuestionCard
        key={`${competencyId}-${seed}`}
        question={question}
        questionNumber={competencyId}
        answers={answers}
        onChangeAnswers={(next) => {
          setAnswers(next);
          if (gradeResult) setGradeResult(undefined);
        }}
        mode="practice"
        gradeResult={gradeResult}
      />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleCheck}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2e7d5b] px-5 text-sm font-semibold text-white transition hover:bg-[#246649]"
        >
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
          <span>Periksa Jawaban &amp; Lihat Pembahasan</span>
        </button>
      </div>
    </div>
  );
}
