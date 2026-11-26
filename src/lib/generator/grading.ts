import {
  eqFrac,
  formatRupiah,
  fracToString,
  parseStudentNumber,
} from '../math/fraction';
import { matrixToLatex } from '../math/matrix';
import type {
  ExamAnswersMap,
  ExamGradeResult,
  FieldGradeResult,
  GeneratedQuestion,
  QuestionAnswerMap,
  QuestionGradeResult,
} from './types';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function gradeQuestion(
  question: GeneratedQuestion,
  answers: QuestionAnswerMap = {}
): QuestionGradeResult {
  const fieldResults: FieldGradeResult[] = question.fields.map((field) => {
    const rawAns = answers[field.id];

    if (field.kind === 'scalar') {
      const strVal = typeof rawAns === 'string' ? rawAns : '';
      const parsed = parseStudentNumber(strVal, {
        allowCurrency: field.allowCurrency,
      });
      const isCorrect = parsed !== null && eqFrac(parsed, field.expected);
      const expectedDisplay = field.allowCurrency
        ? formatRupiah(field.expected.num / field.expected.den)
        : fracToString(field.expected);

      return {
        fieldId: field.id,
        label: field.label,
        earned: isCorrect ? field.points : 0,
        maxPoints: field.points,
        isCorrect,
        expectedDisplay,
      };
    }

    // Matrix field: partial credit proporsional berdasarkan jumlah sel benar
    const grid = Array.isArray(rawAns) ? rawAns : [];
    const totalCells = field.rows * field.cols;
    let correctCount = 0;
    const correctCells: boolean[][] = [];

    for (let r = 0; r < field.rows; r++) {
      const rowFlags: boolean[] = [];
      for (let c = 0; c < field.cols; c++) {
        const cellRaw = grid[r]?.[c] ?? '';
        const parsed = parseStudentNumber(cellRaw, { allowCurrency: true });
        const ok = parsed !== null && eqFrac(parsed, field.expected[r][c]);
        if (ok) correctCount++;
        rowFlags.push(ok);
      }
      correctCells.push(rowFlags);
    }

    const isCorrect = correctCount === totalCells;
    const earned = isCorrect
      ? field.points
      : round2((correctCount / totalCells) * field.points);

    return {
      fieldId: field.id,
      label: field.label,
      earned,
      maxPoints: field.points,
      isCorrect,
      correctCells,
      expectedDisplay: matrixToLatex(field.expected),
    };
  });

  const earned = round2(fieldResults.reduce((acc, f) => acc + f.earned, 0));
  const isFullyCorrect = fieldResults.every((f) => f.isCorrect);

  return {
    questionId: question.id,
    competencyId: question.competencyId,
    earned,
    maxPoints: question.maxPoints,
    isFullyCorrect,
    fields: fieldResults,
  };
}

export function gradeExam(
  questions: GeneratedQuestion[],
  allAnswers: ExamAnswersMap,
  kkm: number
): ExamGradeResult {
  const items = questions.map((q) => gradeQuestion(q, allAnswers[q.id]));
  const totalScore = round2(items.reduce((acc, i) => acc + i.earned, 0));
  const maxScore = items.reduce((acc, i) => acc + i.maxPoints, 0);

  return {
    totalScore,
    maxScore,
    passed: totalScore >= kkm,
    kkm,
    items,
  };
}
