import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle, Info, RefreshCw } from 'lucide-react';
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
  onTopicChange?: (competencyId: CompetencyId) => void;
  onCompletePractice: () => void;
  onBack: () => void;
}

export function PracticeView({
  initialCompetencyId,
  className,
  onTopicChange,
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
    onTopicChange?.(id);
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
    <div className="mx-auto max-w-4xl space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5c536d] hover:text-[#262542]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#f3f2ff] px-3 py-1 text-xs font-semibold text-[#6c6ce5]">
            Latihan Kelas {className}
          </span>
          <button
            type="button"
            onClick={handleNewVariant}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#eceef8] bg-white px-3 py-1.5 text-xs font-semibold text-[#563f7a] transition hover:bg-[#f6f6fe]"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Acak Angka Baru</span>
          </button>
        </div>
      </div>

      {/* Info ramah bahwa di Mode Latihan jawaban tidak harus benar */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-[#dcdbf9] bg-[#f6f6fe] px-4 py-3 text-xs text-[#4a48a8]">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          <strong>Mode Latihan Bebas:</strong> Jawabanmu tidak harus benar dan tidak memengaruhi
          nilai rapor. Kamu bebas mencoba, membuka hint, atau langsung membaca pembahasan langkah
          demi langkah kapan saja.
        </p>
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
                ? 'bg-[#6c6ce5] text-white shadow-xs'
                : 'border border-[#eceef8] bg-white text-[#7c7f9d] hover:border-[#cfd0f7] hover:text-[#262542]'
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#8a8da8]">
          Belum yakin? Tidak apa-apa — klik tombol di samping untuk cek hasil atau buka pembahasan.
        </p>
        <button
          type="button"
          onClick={handleCheck}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#28a870] px-5 text-sm font-semibold text-white transition hover:bg-[#219260] sm:w-auto"
        >
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
          <span>Cek Jawaban Saya</span>
        </button>
      </div>
    </div>
  );
}
