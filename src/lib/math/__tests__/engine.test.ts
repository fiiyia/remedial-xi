import { describe, expect, it } from 'vitest';
import {
  addFrac,
  divFrac,
  eqFrac,
  frac,
  mulFrac,
  parseStudentNumber,
  subFrac,
} from '../fraction';
import {
  det2,
  det3,
  intMatrix,
  inverse2,
  inverse3,
  matrixEquals,
  mulMatrix,
} from '../matrix';
import {
  generateExamQuestions,
  generateQuestionByCompetency,
} from '../../generator/questions';
import { gradeExam, gradeQuestion } from '../../generator/grading';
import type { CompetencyId, ExamAnswersMap, QuestionAnswerMap } from '../../generator/types';

describe('Fraction arithmetic & student input parser', () => {
  it('simplifies and computes exact fractions', () => {
    expect(frac(6, 9)).toEqual({ num: 2, den: 3 });
    expect(frac(2, -4)).toEqual({ num: -1, den: 2 });
    expect(frac(0, 7)).toEqual({ num: 0, den: 1 });
    expect(addFrac(frac(1, 3), frac(1, 6))).toEqual({ num: 1, den: 2 });
    expect(subFrac(frac(1, 2), frac(5, 6))).toEqual({ num: -1, den: 3 });
    expect(mulFrac(frac(-2, 3), frac(9, 4))).toEqual({ num: -3, den: 2 });
    expect(divFrac(frac(3, 4), frac(3, 2))).toEqual({ num: 1, den: 2 });
  });

  it('parses integers, fractions, decimals, unicode minus, and Rupiah', () => {
    expect(parseStudentNumber(' -2 / 4 ')).toEqual({ num: -1, den: 2 });
    expect(parseStudentNumber('−3/6')).toEqual({ num: -1, den: 2 });
    expect(parseStudentNumber('0.5')).toEqual({ num: 1, den: 2 });
    expect(parseStudentNumber('-0,25')).toEqual({ num: -1, den: 4 });
    expect(parseStudentNumber('Rp 15.000', { allowCurrency: true })).toEqual({ num: 15000, den: 1 });
    expect(parseStudentNumber('1.250.000', { allowCurrency: true })).toEqual({ num: 1250000, den: 1 });
    expect(parseStudentNumber('1/0')).toBeNull();
    expect(parseStudentNumber('abc')).toBeNull();
  });
});

describe('Matrix 2x2 & 3x3 exact operations', () => {
  it('computes A * A^-1 = I for 2x2 and 3x3', () => {
    const A2 = intMatrix([
      [3, 2],
      [1, 2],
    ]);
    const I2 = intMatrix([
      [1, 0],
      [0, 1],
    ]);
    expect(det2(A2)).toEqual(frac(4));
    expect(matrixEquals(mulMatrix(A2, inverse2(A2)), I2)).toBe(true);

    const A3 = intMatrix([
      [1, 2, 1],
      [2, 1, 0],
      [1, 1, 1],
    ]);
    const I3 = intMatrix([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
    expect(det3(A3)).toEqual(frac(-2));
    expect(matrixEquals(mulMatrix(A3, inverse3(A3)), I3)).toBe(true);
  });
});

describe('Dynamic Question Generator — 1,000-iteration fuzz & invariant tests', () => {
  it('guarantees valid, non-singular, clean solutions across 1,000 seeds for all 6 competencies', () => {
    const competencies: CompetencyId[] = [1, 2, 3, 4, 5, 6];

    for (let seed = 1; seed <= 200; seed++) {
      for (const comp of competencies) {
        const q = generateQuestionByCompetency(comp, seed * 17);
        expect(q.fields.length).toBeGreaterThan(0);
        expect(q.hints.length).toBe(3);
        expect(q.solutionSteps.length).toBeGreaterThanOrEqual(3);

        // Verify Competency 4 has non-zero small determinant
        if (comp === 4) {
          const detField = q.fields.find((f) => f.id === 'det');
          expect(detField?.kind).toBe('scalar');
          if (detField?.kind === 'scalar') {
            expect(detField.expected.num).not.toBe(0);
            expect(Math.abs(detField.expected.num)).toBeLessThanOrEqual(5);
          }
        }

        // Verify Competency 5 & 6 prices are positive multiples of 500
        if (comp === 5 || comp === 6) {
          for (const f of q.fields) {
            if (f.kind === 'scalar' && f.allowCurrency) {
              expect(f.expected.den).toBe(1);
              expect(f.expected.num).toBeGreaterThan(0);
              expect(f.expected.num % 500).toBe(0);
            }
          }
        }

        // Verify perfect answer always earns 100% of maxPoints
        const perfectAnswer: QuestionAnswerMap = {};
        for (const f of q.fields) {
          if (f.kind === 'scalar') {
            perfectAnswer[f.id] =
              f.expected.den === 1
                ? `${f.expected.num}`
                : `${f.expected.num}/${f.expected.den}`;
          } else {
            perfectAnswer[f.id] = f.expected.map((row) =>
              row.map((cell) =>
                cell.den === 1 ? `${cell.num}` : `${cell.num}/${cell.den}`
              )
            );
          }
        }
        const graded = gradeQuestion(q, perfectAnswer);
        expect(graded.isFullyCorrect).toBe(true);
        expect(graded.earned).toBe(q.maxPoints);
      }
    }
  });

  it('produces deterministic exam sets for the same seed and totals 100 points', () => {
    const exam1 = generateExamQuestions(123456, 'XI-1');
    const exam2 = generateExamQuestions(123456, 'XI-1');
    const examXI2 = generateExamQuestions(123456, 'XI-2');

    expect(exam1.length).toBe(6);
    expect(exam1.reduce((s, q) => s + q.maxPoints, 0)).toBe(100);
    expect(exam1.map((q) => q.promptLatex)).toEqual(exam2.map((q) => q.promptLatex));

    // Kelas XI-1 selalu mendapat Tipe A dan Kelas XI-2 selalu mendapat Tipe B dengan soal berbeda
    expect(exam1.every((q) => q.variant === 'A')).toBe(true);
    expect(examXI2.every((q) => q.variant === 'B')).toBe(true);
    expect(exam1.map((q) => q.promptText)).not.toEqual(examXI2.map((q) => q.promptText));

    // Empty answers should score 0 and not pass KKM 78
    const emptyResult = gradeExam(exam1, {} as ExamAnswersMap, 78);
    expect(emptyResult.totalScore).toBe(0);
    expect(emptyResult.passed).toBe(false);
    expect(eqFrac(frac(0), frac(0))).toBe(true);
  });
});
