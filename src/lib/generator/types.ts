import type { Fraction } from '../math/fraction';
import type { Matrix } from '../math/matrix';

export type CompetencyId = 1 | 2 | 3 | 4 | 5 | 6;
export type QuestionVariant = 'A' | 'B';

export interface CompetencyMeta {
  id: CompetencyId;
  shortTitle: string;
  title: string;
  reference: string;
  maxPoints: number;
}

export const COMPETENCIES: readonly CompetencyMeta[] = [
  {
    id: 1,
    shortTitle: 'Kesamaan & Operasi',
    title: 'Kesamaan, Penjumlahan & Pengurangan Matriks',
    reference: 'Matriks Kelas XI • Bagian 1',
    maxPoints: 15,
  },
  {
    id: 2,
    shortTitle: 'Transpos & Invers 2×2',
    title: 'Operasi Matriks, Transpos & Perkalian Invers (2×2)',
    reference: 'Matriks Kelas XI • Bagian 2',
    maxPoints: 15,
  },
  {
    id: 3,
    shortTitle: 'Persamaan & Determinan',
    title: 'Persamaan Matriks & Sifat Determinan (2×2)',
    reference: 'Matriks Kelas XI • Bagian 3',
    maxPoints: 15,
  },
  {
    id: 4,
    shortTitle: 'Invers Matriks 3×3',
    title: 'Determinan, Adjoin & Invers Matriks (3×3)',
    reference: 'Matriks Kelas XI • Bagian 4',
    maxPoints: 20,
  },
  {
    id: 5,
    shortTitle: 'SPLDV (Soal Cerita)',
    title: 'Aplikasi Matriks pada SPLDV (2 Variabel)',
    reference: 'Matriks Kelas XI • Bagian 5',
    maxPoints: 20,
  },
  {
    id: 6,
    shortTitle: 'SPLTV (Soal Cerita)',
    title: 'Aplikasi Matriks pada SPLTV (3 Variabel)',
    reference: 'Matriks Kelas XI • Bagian 6',
    maxPoints: 15,
  },
] as const;

export interface ScalarFieldSpec {
  kind: 'scalar';
  id: string;
  label: string;
  labelLatex?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  allowCurrency?: boolean;
  expected: Fraction;
  points: number;
}

export interface MatrixFieldSpec {
  kind: 'matrix';
  id: string;
  label: string;
  labelLatex?: string;
  rows: number;
  cols: number;
  allowFraction?: boolean;
  expected: Matrix;
  points: number;
}

export type FieldSpec = ScalarFieldSpec | MatrixFieldSpec;

export interface HintItem {
  level: 1 | 2 | 3;
  title: string;
  body: string;
  latex?: string;
}

export interface SolutionStep {
  title: string;
  explanation: string;
  latex?: string;
}

export interface GeneratedQuestion {
  id: string;
  competencyId: CompetencyId;
  variant: QuestionVariant;
  title: string;
  promptText: string;
  promptLatex?: string;
  subPromptText?: string;
  fields: FieldSpec[];
  hints: HintItem[];
  solutionSteps: SolutionStep[];
  maxPoints: number;
}

/**
 * Jawaban siswa untuk satu field:
 * - scalar -> string
 * - matrix -> string[][]
 */
export type FieldAnswerValue = string | string[][];
export type QuestionAnswerMap = Record<string, FieldAnswerValue>;
export type ExamAnswersMap = Record<string, QuestionAnswerMap>;

export interface FieldGradeResult {
  fieldId: string;
  label: string;
  earned: number;
  maxPoints: number;
  isCorrect: boolean;
  correctCells?: boolean[][];
  expectedDisplay: string;
}

export interface QuestionGradeResult {
  questionId: string;
  competencyId: CompetencyId;
  earned: number;
  maxPoints: number;
  isFullyCorrect: boolean;
  fields: FieldGradeResult[];
}

export interface ExamGradeResult {
  totalScore: number;
  maxScore: number;
  passed: boolean;
  kkm: number;
  items: QuestionGradeResult[];
}
