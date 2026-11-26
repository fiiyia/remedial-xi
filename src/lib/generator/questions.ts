import {
  formatRupiah,
  frac,
  fracToLatex,
  mulFrac,
} from '../math/fraction';
import {
  addMatrix,
  adjugate3,
  det2,
  det3,
  intMatrix,
  inverse2,
  inverse3,
  matrixToLatex,
  mulMatrix,
  rawMatrixToLatex,
  scaleMatrix,
  subMatrix,
  transposeMatrix,
  type Matrix,
} from '../math/matrix';
import { createRng, type Rng } from '../math/prng';
import type {
  CompetencyId,
  GeneratedQuestion,
  QuestionVariant,
} from './types';

function formatSignedTerm(coeff: number, variable: string, isFirst = false): string {
  if (coeff === 0) return '';
  const abs = Math.abs(coeff);
  const coeffStr = abs === 1 ? '' : `${abs}`;
  if (isFirst) {
    return coeff < 0 ? `-${coeffStr}${variable}` : `${coeffStr}${variable}`;
  }
  return coeff < 0 ? ` - ${coeffStr}${variable}` : ` + ${coeffStr}${variable}`;
}

function formatLinearExpr(a: number, b: number, c: number): string {
  return `${formatSignedTerm(a, 'x', true)}${formatSignedTerm(b, 'y')}${formatSignedTerm(c, 'z')}`;
}

function formatLinearConst(coeff: number, variable: string, constant: number): string {
  const lhs = formatSignedTerm(coeff, variable, true);
  if (constant === 0) return lhs;
  return constant > 0 ? `${lhs} + ${constant}` : `${lhs} - ${Math.abs(constant)}`;
}

/**
 * KOMPETENSI 1 (15 poin):
 * Kesamaan, Penjumlahan & Pengurangan Matriks
 * - Tipe A: P + Q - R = S
 * - Tipe B: K + L = M
 */
function generateCompetency1(rng: Rng, variant: QuestionVariant): GeneratedQuestion {
  const x = rng.nonZeroInt(-6, 8);
  const y = rng.nonZeroInt(-6, 8);
  const z = rng.nonZeroInt(-6, 8);

  const cx = rng.pick([1, 2, 3]);
  const cy = rng.pick([-3, -2, -1, 1, 2]);
  const cz = rng.pick([-2, -1, 1, 2, 3]);
  const exprLabel = formatLinearExpr(cx, cy, cz);
  const exprVal = cx * x + cy * y + cz * z;

  if (variant === 'A') {
    // P + Q - R = S (matriks 2x2)
    // Elemen (0,0): (2x + c1) + q00 - r00 = s00
    // Elemen (0,1): p01 + (y + c2) - r01 = s01
    // Elemen (1,0): p10 + q10 - (z + c3) = s10
    // Elemen (1,1): konstanta biasa
    const a1 = rng.pick([1, 2]);
    const c1 = rng.int(-4, 4);
    const q00 = rng.int(-5, 6);
    const r00 = rng.int(-5, 6);
    const s00 = a1 * x + c1 + q00 - r00;

    const p01 = rng.int(-5, 6);
    const c2 = rng.int(-4, 4);
    const r01 = rng.int(-5, 6);
    const s01 = p01 + (y + c2) - r01;

    const p10 = rng.int(-5, 6);
    const q10 = rng.int(-5, 6);
    const c3 = rng.int(-4, 4);
    const s10 = p10 + q10 - (z + c3);

    const p11 = rng.int(-5, 6);
    const q11 = rng.int(-5, 6);
    const r11 = rng.int(-5, 6);
    const s11 = p11 + q11 - r11;

    const pTex = rawMatrixToLatex([
      [formatLinearConst(a1, 'x', c1), `${p01}`],
      [`${p10}`, `${p11}`],
    ]);
    const qTex = rawMatrixToLatex([
      [`${q00}`, formatLinearConst(1, 'y', c2)],
      [`${q10}`, `${q11}`],
    ]);
    const rTex = rawMatrixToLatex([
      [`${r00}`, `${r01}`],
      [formatLinearConst(1, 'z', c3), `${r11}`],
    ]);
    const sTex = rawMatrixToLatex([
      [`${s00}`, `${s01}`],
      [`${s10}`, `${s11}`],
    ]);

    return {
      id: 'q1',
      competencyId: 1,
      variant,
      title: 'Kesamaan, Penjumlahan & Pengurangan Matriks',
      promptText: `Diketahui persamaan matriks P + Q − R = S sebagai berikut. Tentukan nilai x, y, z, serta nilai dari ${exprLabel}.`,
      promptLatex: `${pTex} + ${qTex} - ${rTex} = ${sTex}`,
      fields: [
        { kind: 'scalar', id: 'x', label: 'Nilai x', labelLatex: 'x =', expected: frac(x), points: 3 },
        { kind: 'scalar', id: 'y', label: 'Nilai y', labelLatex: 'y =', expected: frac(y), points: 3 },
        { kind: 'scalar', id: 'z', label: 'Nilai z', labelLatex: 'z =', expected: frac(z), points: 3 },
        {
          kind: 'scalar',
          id: 'expr',
          label: `Nilai ${exprLabel}`,
          labelLatex: `${exprLabel} =`,
          expected: frac(exprVal),
          points: 6,
        },
      ],
      hints: [
        {
          level: 1,
          title: 'Prinsip Kesamaan Matriks',
          body: 'Operasikan elemen-elemen yang seletak (baris dan kolom yang sama) dari P + Q − R, lalu samakan dengan elemen seletak pada matriks S.',
        },
        {
          level: 2,
          title: 'Susun Persamaan per Elemen',
          body: 'Perhatikan posisi setiap variabel: x ada di baris 1 kolom 1, y ada di baris 1 kolom 2, dan z ada di baris 2 kolom 1 (hati-hati tanda pengurangan di depan R!).',
          latex: `(${formatLinearConst(a1, 'x', c1)}) + (${q00}) - (${r00}) = ${s00}`,
        },
        {
          level: 3,
          title: 'Cek Persamaan y dan z',
          body: 'Selesaikan persamaan linear satu variabel untuk y dan z, lalu substitusikan x, y, z ke ekspresi akhir.',
          latex: `\\begin{aligned} ${p01} + (${formatLinearConst(1, 'y', c2)}) - (${r01}) &= ${s01} \\\\ ${p10} + (${q10}) - (${formatLinearConst(1, 'z', c3)}) &= ${s10} \\end{aligned}`,
        },
      ],
      solutionSteps: [
        {
          title: '1. Mencari nilai x (baris 1, kolom 1)',
          explanation: 'Samakan elemen (1,1) dari P + Q − R dengan S:',
          latex: `(${formatLinearConst(a1, 'x', c1)}) + (${q00}) - (${r00}) = ${s00} \\implies ${a1}x = ${a1 * x} \\implies x = ${x}`,
        },
        {
          title: '2. Mencari nilai y (baris 1, kolom 2)',
          explanation: 'Samakan elemen (1,2):',
          latex: `${p01} + (${formatLinearConst(1, 'y', c2)}) - (${r01}) = ${s01} \\implies y = ${y}`,
        },
        {
          title: '3. Mencari nilai z (baris 2, kolom 1)',
          explanation: 'Samakan elemen (2,1) dengan memperhatikan tanda negatif di depan R:',
          latex: `${p10} + (${q10}) - (${formatLinearConst(1, 'z', c3)}) = ${s10} \\implies z = ${z}`,
        },
        {
          title: `4. Menghitung ${exprLabel}`,
          explanation: 'Substitusikan nilai x, y, dan z yang diperoleh:',
          latex: `${exprLabel} = (${cx})(${x}) + (${cy})(${y}) + (${cz})(${z}) = ${exprVal}`,
        },
      ],
      maxPoints: 15,
    };
  }

  // Tipe B: K + L = M (matriks 2x2)
  const a1 = rng.pick([1, 2]);
  const c1 = rng.int(-5, 5);
  const l00 = rng.int(-5, 6);
  const m00 = a1 * x + c1 + l00;

  const k01 = rng.int(-5, 6);
  const b1 = rng.pick([1, 2]);
  const c2 = rng.int(-4, 4);
  const m01 = k01 + (b1 * y + c2);

  const c3 = rng.int(-4, 4);
  const l10 = rng.int(-5, 6);
  const m10 = z + c3 + l10;

  const k11 = rng.int(-5, 6);
  const l11 = rng.int(-5, 6);
  const m11 = k11 + l11;

  const kTex = rawMatrixToLatex([
    [formatLinearConst(a1, 'x', c1), `${k01}`],
    [formatLinearConst(1, 'z', c3), `${k11}`],
  ]);
  const lTex = rawMatrixToLatex([
    [`${l00}`, formatLinearConst(b1, 'y', c2)],
    [`${l10}`, `${l11}`],
  ]);
  const mTex = rawMatrixToLatex([
    [`${m00}`, `${m01}`],
    [`${m10}`, `${m11}`],
  ]);

  return {
    id: 'q1',
    competencyId: 1,
    variant,
    title: 'Kesamaan & Penjumlahan Matriks',
    promptText: `Diketahui persamaan matriks K + L = M sebagai berikut. Tentukan nilai x, y, z, serta nilai dari ${exprLabel}.`,
    promptLatex: `${kTex} + ${lTex} = ${mTex}`,
    fields: [
      { kind: 'scalar', id: 'x', label: 'Nilai x', labelLatex: 'x =', expected: frac(x), points: 3 },
      { kind: 'scalar', id: 'y', label: 'Nilai y', labelLatex: 'y =', expected: frac(y), points: 3 },
      { kind: 'scalar', id: 'z', label: 'Nilai z', labelLatex: 'z =', expected: frac(z), points: 3 },
      {
        kind: 'scalar',
        id: 'expr',
        label: `Nilai ${exprLabel}`,
        labelLatex: `${exprLabel} =`,
        expected: frac(exprVal),
        points: 6,
      },
    ],
    hints: [
      {
        level: 1,
        title: 'Penjumlahan Elemen Seletak',
        body: 'Jumlahkan setiap elemen pada posisi yang sama di matriks K dan L, lalu samakan dengan elemen seletak pada matriks M.',
      },
      {
        level: 2,
        title: 'Persamaan untuk x',
        body: 'Dari elemen baris 1 kolom 1:',
        latex: `(${formatLinearConst(a1, 'x', c1)}) + (${l00}) = ${m00}`,
      },
      {
        level: 3,
        title: 'Persamaan untuk y dan z',
        body: 'Selesaikan persamaan untuk y (baris 1 kolom 2) dan z (baris 2 kolom 1):',
        latex: `\\begin{aligned} ${k01} + (${formatLinearConst(b1, 'y', c2)}) &= ${m01} \\\\ (${formatLinearConst(1, 'z', c3)}) + (${l10}) &= ${m10} \\end{aligned}`,
      },
    ],
    solutionSteps: [
      {
        title: '1. Mencari nilai x (baris 1, kolom 1)',
        explanation: 'Samakan elemen (1,1):',
        latex: `(${formatLinearConst(a1, 'x', c1)}) + (${l00}) = ${m00} \\implies x = ${x}`,
      },
      {
        title: '2. Mencari nilai y (baris 1, kolom 2)',
        explanation: 'Samakan elemen (1,2):',
        latex: `${k01} + (${formatLinearConst(b1, 'y', c2)}) = ${m01} \\implies y = ${y}`,
      },
      {
        title: '3. Mencari nilai z (baris 2, kolom 1)',
        explanation: 'Samakan elemen (2,1):',
        latex: `(${formatLinearConst(1, 'z', c3)}) + (${l10}) = ${m10} \\implies z = ${z}`,
      },
      {
        title: `4. Menghitung ${exprLabel}`,
        explanation: 'Substitusikan nilai x, y, dan z:',
        latex: `${exprLabel} = (${cx})(${x}) + (${cy})(${y}) + (${cz})(${z}) = ${exprVal}`,
      },
    ],
    maxPoints: 15,
  };
}

/**
 * Helper: membangkitkan matriks 2x2 non-singular dengan determinan kecil (±1 atau ±2)
 */
function generateInvertible2x2(rng: Rng, allowedDets: readonly number[] = [-2, -1, 1, 2]): Matrix {
  for (let tries = 0; tries < 500; tries++) {
    const a = rng.int(-5, 5);
    const b = rng.int(-5, 5);
    const c = rng.int(-5, 5);
    const d = rng.int(-5, 5);
    const det = a * d - b * c;
    if (allowedDets.includes(det) && (a !== 0 || b !== 0) && (c !== 0 || d !== 0)) {
      return intMatrix([
        [a, b],
        [c, d],
      ]);
    }
  }
  return intMatrix([
    [2, 1],
    [1, 1],
  ]);
}

/**
 * KOMPETENSI 2 (15 poin):
 * Operasi Matriks, Transpos, & Perkalian Invers (2x2)
 * - Tipe A: C = 2A - B^T (input grid 2x2)
 * - Tipe B: A^{-1} × B (input grid 2x2, hasil bulat/pecahan sederhana)
 */
function generateCompetency2(rng: Rng, variant: QuestionVariant): GeneratedQuestion {
  if (variant === 'A') {
    const A = intMatrix([
      [rng.int(-5, 6), rng.int(-5, 6)],
      [rng.int(-5, 6), rng.int(-5, 6)],
    ]);
    const B = intMatrix([
      [rng.int(-5, 6), rng.int(-5, 6)],
      [rng.int(-5, 6), rng.int(-5, 6)],
    ]);
    const k = rng.pick([2, 3]);
    const kA = scaleMatrix(frac(k), A);
    const BT = transposeMatrix(B);
    const C = subMatrix(kA, BT);

    return {
      id: 'q2',
      competencyId: 2,
      variant,
      title: 'Operasi Skalar & Transpos Matriks (2×2)',
      promptText: `Diketahui matriks A dan B berordo 2×2 berikut. Tentukan matriks C = ${k}A − Bᵀ.`,
      promptLatex: `A = ${matrixToLatex(A)}, \\quad B = ${matrixToLatex(B)}`,
      fields: [
        {
          kind: 'matrix',
          id: 'C',
          label: `Matriks C = ${k}A − Bᵀ`,
          labelLatex: `C = ${k}A - B^T =`,
          rows: 2,
          cols: 2,
          allowFraction: false,
          expected: C,
          points: 15,
        },
      ],
      hints: [
        {
          level: 1,
          title: 'Ingat Definisi Transpos (Bᵀ)',
          body: 'Transpos matriks menukar baris menjadi kolom. Elemen baris 1 kolom 2 berpindah ke baris 2 kolom 1, dan sebaliknya.',
        },
        {
          level: 2,
          title: `Hitung ${k}A dan Bᵀ Terlebih Dahulu`,
          body: `Kalikan setiap elemen matriks A dengan ${k}, lalu cari transpos dari B:`,
          latex: `${k}A = ${matrixToLatex(kA)}, \\quad B^T = ${matrixToLatex(BT)}`,
        },
        {
          level: 3,
          title: 'Kurangkan Elemen Seletak',
          body: `Kurangkan setiap elemen ${k}A dengan elemen yang seletak pada Bᵀ (hati-hati pengurangan dengan bilangan negatif).`,
        },
      ],
      solutionSteps: [
        {
          title: `1. Perkalian Skalar ${k}A`,
          explanation: `Kalikan semua elemen matriks A dengan ${k}:`,
          latex: `${k}A = ${matrixToLatex(kA)}`,
        },
        {
          title: '2. Menentukan Transpos Bᵀ',
          explanation: 'Tukar baris menjadi kolom pada matriks B:',
          latex: `B^T = ${matrixToLatex(BT)}`,
        },
        {
          title: `3. Menghitung C = ${k}A − Bᵀ`,
          explanation: 'Kurangkan elemen-elemen yang seletak:',
          latex: `C = ${matrixToLatex(kA)} - ${matrixToLatex(BT)} = ${matrixToLatex(C)}`,
        },
      ],
      maxPoints: 15,
    };
  }

  // Tipe B: A^{-1} × B (dibangun dari A berdeterminan ±1 atau ±2 agar hasil rapi)
  const A = generateInvertible2x2(rng, [-2, -1, 1, 2]);
  const invA = inverse2(A);
  const dA = det2(A);
  const B = intMatrix([
    [rng.int(-4, 5), rng.int(-4, 5)],
    [rng.int(-4, 5), rng.int(-4, 5)],
  ]);
  const res = mulMatrix(invA, B);

  return {
    id: 'q2',
    competencyId: 2,
    variant,
    title: 'Invers & Perkalian Matriks (2×2)',
    promptText:
      'Diketahui matriks A dan B berordo 2×2 berikut. Tentukan hasil dari A⁻¹ × B (gunakan pecahan sederhana seperti 1/2 jika bukan bilangan bulat).',
    promptLatex: `A = ${matrixToLatex(A)}, \\quad B = ${matrixToLatex(B)}`,
    fields: [
      {
        kind: 'matrix',
        id: 'result',
        label: 'Hasil A⁻¹ × B',
        labelLatex: 'A^{-1} \\times B =',
        rows: 2,
        cols: 2,
        allowFraction: true,
        expected: res,
        points: 15,
      },
    ],
    hints: [
      {
        level: 1,
        title: 'Rumus Invers Matriks 2×2',
        body: 'Cari determinan det(A) = ad − bc terlebih dahulu, lalu gunakan rumus invers 2×2:',
        latex: `A^{-1} = \\frac{1}{ad - bc} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}`,
      },
      {
        level: 2,
        title: 'Determinan & Invers A',
        body: 'Nilai determinan dan matriks invers A adalah:',
        latex: `\\det(A) = ${fracToLatex(dA)}, \\quad A^{-1} = ${matrixToLatex(invA)}`,
      },
      {
        level: 3,
        title: 'Aturan Perkalian Matriks',
        body: 'Kalikan baris pada A⁻¹ dengan kolom pada B (urutan perkalian matriks tidak komutatif: A⁻¹ di kiri, B di kanan).',
      },
    ],
    solutionSteps: [
      {
        title: '1. Menghitung Determinan A',
        explanation: 'Gunakan det(A) = a·d − b·c:',
        latex: `\\det(A) = (${fracToLatex(A[0][0])})(${fracToLatex(A[1][1])}) - (${fracToLatex(A[0][1])})(${fracToLatex(A[1][0])}) = ${fracToLatex(dA)}`,
      },
      {
        title: '2. Menentukan Invers A⁻¹',
        explanation: 'Tukar elemen diagonal utama, ubah tanda diagonal samping, lalu bagi dengan determinan:',
        latex: `A^{-1} = ${matrixToLatex(invA)}`,
      },
      {
        title: '3. Mengalikan A⁻¹ × B',
        explanation: 'Lakukan perkalian baris kali kolom:',
        latex: `A^{-1} \\times B = ${matrixToLatex(invA)} ${matrixToLatex(B)} = ${matrixToLatex(res)}`,
      },
    ],
    maxPoints: 15,
  };
}

/**
 * KOMPETENSI 3 (15 poin):
 * Persamaan Matriks & Sifat Determinan (2x2)
 * - Tipe A: A · M = B -> cari M = A^{-1} · B (dibangun mundur agar M bulat rapi)
 * - Tipe B: Sifat determinan -> hitung det((A + B)^2)
 */
function generateCompetency3(rng: Rng, variant: QuestionVariant): GeneratedQuestion {
  if (variant === 'A') {
    const A = generateInvertible2x2(rng, [-2, -1, 1, 2]);
    const M = intMatrix([
      [rng.int(-4, 5), rng.int(-4, 5)],
      [rng.int(-4, 5), rng.int(-4, 5)],
    ]);
    const B = mulMatrix(A, M);
    const invA = inverse2(A);
    const dA = det2(A);

    return {
      id: 'q3',
      competencyId: 3,
      variant,
      title: 'Persamaan Matriks (A · M = B)',
      promptText:
        'Diketahui persamaan matriks A · M = B dengan matriks A dan B berikut. Tentukan matriks M berordo 2×2.',
      promptLatex: `A = ${matrixToLatex(A)}, \\quad B = ${matrixToLatex(B)}`,
      fields: [
        {
          kind: 'matrix',
          id: 'M',
          label: 'Matriks M',
          labelLatex: 'M =',
          rows: 2,
          cols: 2,
          allowFraction: false,
          expected: M,
          points: 15,
        },
      ],
      hints: [
        {
          level: 1,
          title: 'Bentuk Penyelesaian Persamaan Matriks',
          body: 'Karena matriks A berada di sebelah KIRI dari M pada A · M = B, kalikan kedua ruas dari sebelah KIRI dengan A⁻¹:',
          latex: `A \\cdot M = B \\implies M = A^{-1} \\cdot B`,
        },
        {
          level: 2,
          title: 'Invers Matriks A',
          body: 'Determinan dan invers dari matriks A adalah:',
          latex: `\\det(A) = ${fracToLatex(dA)}, \\quad A^{-1} = ${matrixToLatex(invA)}`,
        },
        {
          level: 3,
          title: 'Kalikan A⁻¹ dengan B',
          body: 'Hitung hasil kali A⁻¹ · B (baris kali kolom). Semua elemen matriks M berupa bilangan bulat.',
        },
      ],
      solutionSteps: [
        {
          title: '1. Mengubah Persamaan ke Bentuk M = A⁻¹ · B',
          explanation: 'Karena A di sebelah kiri M, maka M = A⁻¹ · B (bukan B · A⁻¹).',
          latex: `A \\cdot M = B \\implies M = A^{-1} \\cdot B`,
        },
        {
          title: '2. Menentukan A⁻¹',
          explanation: `Determinan A adalah ${fracToLatex(dA)}, sehingga:`,
          latex: `A^{-1} = ${matrixToLatex(invA)}`,
        },
        {
          title: '3. Menghitung M = A⁻¹ · B',
          explanation: 'Kalikan matriks A⁻¹ dengan B:',
          latex: `M = ${matrixToLatex(invA)} ${matrixToLatex(B)} = ${matrixToLatex(M)}`,
        },
      ],
      maxPoints: 15,
    };
  }

  // Tipe B: det((A + B)^2) dengan det(A + B) ≠ 0
  let A = intMatrix([[1, 2], [0, 1]]);
  let B = intMatrix([[1, 0], [1, 2]]);
  let sumAB = addMatrix(A, B);
  let dSum = det2(sumAB);

  for (let tries = 0; tries < 200; tries++) {
    A = intMatrix([
      [rng.int(-4, 5), rng.int(-4, 5)],
      [rng.int(-4, 5), rng.int(-4, 5)],
    ]);
    B = intMatrix([
      [rng.int(-4, 5), rng.int(-4, 5)],
      [rng.int(-4, 5), rng.int(-4, 5)],
    ]);
    sumAB = addMatrix(A, B);
    dSum = det2(sumAB);
    if (dSum.num !== 0 && Math.abs(dSum.num) <= 15) {
      break;
    }
  }

  const answer = mulFrac(dSum, dSum);

  return {
    id: 'q3',
    competencyId: 3,
    variant,
    title: 'Sifat Determinan Matriks (2×2)',
    promptText:
      'Diketahui matriks A dan B berordo 2×2 berikut. Dengan memanfaatkan sifat determinan, tentukan nilai dari det((A + B)²).',
    promptLatex: `A = ${matrixToLatex(A)}, \\quad B = ${matrixToLatex(B)}`,
    fields: [
      {
        kind: 'scalar',
        id: 'detVal',
        label: 'Nilai det((A + B)²)',
        labelLatex: '\\det((A + B)^2) =',
        expected: answer,
        points: 15,
      },
    ],
    hints: [
      {
        level: 1,
        title: 'Gunakan Sifat Determinan Pangkat',
        body: 'Tidak perlu mengkuadratkan matriks (A + B) secara manual! Gunakan sifat determinan:',
        latex: `\\det(X^n) = (\\det(X))^n \\implies \\det((A + B)^2) = (\\det(A + B))^2`,
      },
      {
        level: 2,
        title: 'Hitung Matriks A + B',
        body: 'Jumlahkan elemen seletak dari A dan B terlebih dahulu:',
        latex: `A + B = ${matrixToLatex(sumAB)}`,
      },
      {
        level: 3,
        title: 'Hitung det(A + B) lalu Kuadratkan',
        body: 'Cari determinan matriks 2×2 hasil penjumlahan, kemudian pangkatkan dua:',
        latex: `\\det(A + B) = ${fracToLatex(dSum)}`,
      },
    ],
    solutionSteps: [
      {
        title: '1. Menghitung Matriks A + B',
        explanation: 'Jumlahkan elemen-elemen yang seletak pada A dan B:',
        latex: `A + B = ${matrixToLatex(A)} + ${matrixToLatex(B)} = ${matrixToLatex(sumAB)}`,
      },
      {
        title: '2. Menghitung det(A + B)',
        explanation: 'Gunakan rumus determinan 2×2:',
        latex: `\\det(A + B) = (${fracToLatex(sumAB[0][0])})(${fracToLatex(sumAB[1][1])}) - (${fracToLatex(sumAB[0][1])})(${fracToLatex(sumAB[1][0])}) = ${fracToLatex(dSum)}`,
      },
      {
        title: '3. Menerapkan Sifat Determinan',
        explanation: 'Gunakan sifat det(X²) = (det(X))²:',
        latex: `\\det((A + B)^2) = (${fracToLatex(dSum)})^2 = ${fracToLatex(answer)}`,
      },
    ],
    maxPoints: 15,
  };
}

/**
 * Helper: membangkitkan matriks 3x3 non-singular dengan elemen kecil [-3, 4]
 * dan |det(A)| di rentang [2, 5] agar pecahan pada A^{-1} rapi & melatih pecahan.
 */
function generateNice3x3(rng: Rng): Matrix {
  for (let tries = 0; tries < 800; tries++) {
    const raw = [
      [rng.int(-2, 3), rng.int(-2, 3), rng.int(-2, 3)],
      [rng.int(-2, 3), rng.int(-2, 3), rng.int(-2, 3)],
      [rng.int(-2, 3), rng.int(-2, 3), rng.int(-2, 3)],
    ];
    // Pastikan tidak terlalu banyak angka nol (maks 3 nol) agar menantang namun rapi
    const zeroCount = raw.flat().filter((v) => v === 0).length;
    if (zeroCount > 3) continue;

    const M = intMatrix(raw);
    const d = det3(M);
    if (Math.abs(d.num) >= 2 && Math.abs(d.num) <= 5) {
      return M;
    }
  }
  // Fallback terjamin det = 2
  return intMatrix([
    [1, 2, 1],
    [2, 1, 0],
    [1, 1, 1],
  ]);
}

/**
 * KOMPETENSI 4 (20 poin):
 * Determinan, Adjoin, & Invers Matriks (3x3)
 * Multi-input: det(A) [4], Adj(A) 3x3 [8], A^{-1} 3x3 [8]
 */
function generateCompetency4(rng: Rng, variant: QuestionVariant): GeneratedQuestion {
  const A = generateNice3x3(rng);
  const dA = det3(A);
  const adjA = adjugate3(A);
  const invA = inverse3(A);

  return {
    id: 'q4',
    competencyId: 4,
    variant,
    title: 'Determinan, Adjoin & Invers Matriks (3×3)',
    promptText:
      'Diketahui matriks A berordo 3×3 berikut. Tentukan secara bertahap: (a) determinan det(A), (b) matriks adjoin Adj(A), dan (c) matriks invers A⁻¹ (tulis dalam bentuk pecahan sederhana seperti -1/3 jika perlu).',
    promptLatex: `A = ${matrixToLatex(A)}`,
    fields: [
      {
        kind: 'scalar',
        id: 'det',
        label: '(a) Determinan det(A)',
        labelLatex: '\\det(A) =',
        expected: dA,
        points: 4,
      },
      {
        kind: 'matrix',
        id: 'adj',
        label: '(b) Matriks Adjoin Adj(A)',
        labelLatex: '\\text{Adj}(A) =',
        rows: 3,
        cols: 3,
        allowFraction: false,
        expected: adjA,
        points: 8,
      },
      {
        kind: 'matrix',
        id: 'inv',
        label: '(c) Matriks Invers A⁻¹',
        labelLatex: 'A^{-1} =',
        rows: 3,
        cols: 3,
        allowFraction: true,
        expected: invA,
        points: 8,
      },
    ],
    hints: [
      {
        level: 1,
        title: 'Langkah Menentukan Invers 3×3',
        body: 'Hitung determinan det(A) dengan aturan Sarrus atau ekspansi kofaktor. Pastikan det(A) ≠ 0, lalu cari matriks kofaktor dengan pola tanda (+, −, +).',
        latex: `A^{-1} = \\frac{1}{\\det(A)} \\cdot \\text{Adj}(A), \\quad \\text{Adj}(A) = (\\text{Kof}(A))^T`,
      },
      {
        level: 2,
        title: 'Cek Nilai Determinan',
        body: 'Gunakan aturan Sarrus (jumlah 3 diagonal utama dikurangi jumlah 3 diagonal samping). Nilai determinan matriks A adalah:',
        latex: `\\det(A) = ${fracToLatex(dA)}`,
      },
      {
        level: 3,
        title: 'Jangan Lupa Transpos untuk Adjoin!',
        body: 'Kesalahan paling umum adalah lupa mentranspos matriks kofaktor. Adjoin yang benar adalah:',
        latex: `\\text{Adj}(A) = ${matrixToLatex(adjA)}`,
      },
    ],
    solutionSteps: [
      {
        title: '1. Menghitung Determinan det(A)',
        explanation: 'Menggunakan ekspansi kofaktor baris pertama (atau aturan Sarrus):',
        latex: `\\det(A) = ${fracToLatex(dA)}`,
      },
      {
        title: '2. Menentukan Matriks Adjoin Adj(A) = (Kof(A))ᵀ',
        explanation: 'Hitung setiap kofaktor Cᵢⱼ = (−1)ⁱ⁺ʲ Mᵢⱼ lalu transposkan:',
        latex: `\\text{Adj}(A) = ${matrixToLatex(adjA)}`,
      },
      {
        title: '3. Menghitung Invers A⁻¹',
        explanation: 'Kalikan 1/det(A) dengan setiap elemen Adj(A) dan sederhanakan pecahannya:',
        latex: `A^{-1} = \\frac{1}{${fracToLatex(dA)}} ${matrixToLatex(adjA)} = ${matrixToLatex(invA)}`,
      },
    ],
    maxPoints: 20,
  };
}

/**
 * KOMPETENSI 5 (20 poin):
 * Aplikasi Matriks pada SPLDV (Soal Cerita 2 Variabel)
 * - Tipe A: Koperasi Siswa
 * - Tipe B: Tiket Pentas Seni
 * Bertahap: (a) Matriks A (2x2) & B (2x1), (b) Harga x dan y, (c) Total pembelian baru
 */
function generateCompetency5(rng: Rng, variant: QuestionVariant): GeneratedQuestion {
  // Koefisien positif kecil 1..6 dengan det != 0
  let a11 = 2, a12 = 3, a21 = 4, a22 = 1;
  for (let tries = 0; tries < 200; tries++) {
    a11 = rng.int(1, 5);
    a12 = rng.int(1, 5);
    a21 = rng.int(1, 5);
    a22 = rng.int(1, 5);
    const d = a11 * a22 - a12 * a21;
    if (d !== 0 && Math.abs(d) <= 12) break;
  }

  // Harga satuan kelipatan Rp1.000 yang realistis
  const isKoperasi = variant === 'A';
  const xPrice = isKoperasi ? rng.int(3, 8) * 1000 : rng.int(15, 30) * 1000;
  const yPrice = isKoperasi ? rng.int(2, 6) * 1000 : rng.int(35, 60) * 1000;

  const b1 = a11 * xPrice + a12 * yPrice;
  const b2 = a21 * xPrice + a22 * yPrice;

  const pNew = rng.int(2, 5);
  const qNew = rng.int(2, 5);
  const totalNew = pNew * xPrice + qNew * yPrice;

  const A = intMatrix([
    [a11, a12],
    [a21, a22],
  ]);
  const B = intMatrix([[b1], [b2]]);
  const dA = det2(A);

  const itemX = isKoperasi ? 'buku tulis' : 'tiket pelajar';
  const itemY = isKoperasi ? 'pulpen' : 'tiket umum';

  const story = isKoperasi
    ? `Di Koperasi Siswa SMA, Rina membeli ${a11} ${itemX} dan ${a12} ${itemY} dengan total harga ${formatRupiah(b1)}. Sementara itu, Dimas membeli ${a21} ${itemX} dan ${a22} ${itemY} dengan total harga ${formatRupiah(b2)}. Misalkan x = harga 1 ${itemX} dan y = harga 1 ${itemY}.`
    : `Pada acara Pentas Seni sekolah, panitia menjual 2 jenis tiket. Kelas XI-1 membeli ${a11} ${itemX} dan ${a12} ${itemY} seharga ${formatRupiah(b1)}. Kelas XI-2 membeli ${a21} ${itemX} dan ${a22} ${itemY} seharga ${formatRupiah(b2)}. Misalkan x = harga 1 ${itemX} dan y = harga 1 ${itemY}.`;

  const subPrompt = isKoperasi
    ? `(a) Susun persamaan matriks A · X = B. (b) Tentukan harga 1 ${itemX} (x) dan 1 ${itemY} (y). (c) Jika Budi ingin membeli ${pNew} ${itemX} dan ${qNew} ${itemY}, berapa total yang harus dibayar?`
    : `(a) Susun persamaan matriks A · X = B. (b) Tentukan harga 1 ${itemX} (x) dan 1 ${itemY} (y). (c) Jika wali kelas membeli ${pNew} ${itemX} dan ${qNew} ${itemY}, berapa total yang harus dibayar?`;

  return {
    id: 'q5',
    competencyId: 5,
    variant,
    title: isKoperasi
      ? 'Aplikasi Matriks SPLDV — Koperasi Siswa'
      : 'Aplikasi Matriks SPLDV — Tiket Pentas Seni',
    promptText: story,
    subPromptText: subPrompt,
    fields: [
      {
        kind: 'matrix',
        id: 'A',
        label: '(a1) Matriks Koefisien A (2×2)',
        labelLatex: 'A =',
        rows: 2,
        cols: 2,
        allowFraction: false,
        expected: A,
        points: 4,
      },
      {
        kind: 'matrix',
        id: 'B',
        label: '(a2) Matriks Konstanta B (2×1, dalam Rupiah)',
        labelLatex: 'B =',
        rows: 2,
        cols: 1,
        allowFraction: false,
        expected: B,
        points: 2,
      },
      {
        kind: 'scalar',
        id: 'x',
        label: `(b1) Harga 1 ${itemX} (x)`,
        labelLatex: 'x =',
        prefix: 'Rp',
        allowCurrency: true,
        expected: frac(xPrice),
        points: 4,
      },
      {
        kind: 'scalar',
        id: 'y',
        label: `(b2) Harga 1 ${itemY} (y)`,
        labelLatex: 'y =',
        prefix: 'Rp',
        allowCurrency: true,
        expected: frac(yPrice),
        points: 4,
      },
      {
        kind: 'scalar',
        id: 'total',
        label: `(c) Total harga ${pNew} ${itemX} + ${qNew} ${itemY}`,
        labelLatex: `${pNew}x + ${qNew}y =`,
        prefix: 'Rp',
        allowCurrency: true,
        expected: frac(totalNew),
        points: 6,
      },
    ],
    hints: [
      {
        level: 1,
        title: 'Ubah Soal Cerita ke Persamaan Matriks',
        body: 'Tuliskan dua persamaan linear ax + by = c dari soal cerita, lalu letakkan koefisien x dan y pada matriks A (2×2) dan total harga pada matriks B (2×1).',
        latex: `\\begin{pmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} b_1 \\\\ b_2 \\end{pmatrix}`,
      },
      {
        level: 2,
        title: 'Gunakan Invers Matriks atau Aturan Cramer',
        body: 'Persamaan matriksnya adalah sebagai berikut. Hitung det(A) lalu gunakan X = A⁻¹ · B atau aturan Cramer:',
        latex: `${matrixToLatex(A)} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = ${matrixToLatex(B)}, \\quad \\det(A) = ${fracToLatex(dA)}`,
      },
      {
        level: 3,
        title: 'Hitung Harga Satuan & Total Baru',
        body: `Setelah menemukan x = ${formatRupiah(xPrice)} dan y = ${formatRupiah(yPrice)}, substitusikan ke ${pNew}x + ${qNew}y.`,
      },
    ],
    solutionSteps: [
      {
        title: '1. Menyusun Persamaan Matriks A · X = B',
        explanation: 'Dari cerita diperoleh sistem persamaan linear dalam bentuk matriks:',
        latex: `${matrixToLatex(A)} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = ${matrixToLatex(B)}`,
      },
      {
        title: '2. Menentukan Harga x dan y (Aturan Cramer / Invers)',
        explanation: `Determinan utama det(A) = (${a11})(${a22}) − (${a12})(${a21}) = ${fracToLatex(dA)}.`,
        latex: `x = \\frac{D_x}{\\det(A)} = ${xPrice}, \\quad y = \\frac{D_y}{\\det(A)} = ${yPrice}`,
      },
      {
        title: '3. Menghitung Total Pembelian Baru',
        explanation: `Substitusikan x = ${formatRupiah(xPrice)} dan y = ${formatRupiah(yPrice)}:`,
        latex: `${pNew}(${xPrice}) + ${qNew}(${yPrice}) = ${totalNew} \\text{ (${formatRupiah(totalNew)})}`,
      },
    ],
    maxPoints: 20,
  };
}

/**
 * KOMPETENSI 6 (15 poin):
 * Aplikasi Matriks pada SPLTV (Soal Cerita 3 Variabel — Toko Kue Tradisional)
 * Input: harga x, y, z (kelipatan Rp500 / Rp1.000), dijamin det(A) != 0
 */
function generateCompetency6(rng: Rng, variant: QuestionVariant): GeneratedQuestion {
  const cakeSets =
    variant === 'A'
      ? (['Lemper', 'Risoles', 'Pastel'] as const)
      : (['Klepon', 'Onde-onde', 'Nagasari'] as const);

  // Matriks koefisien 3x3 positif kecil (1..4) dengan det != 0
  let A = intMatrix([
    [2, 1, 1],
    [1, 2, 1],
    [1, 1, 2],
  ]);
  for (let tries = 0; tries < 300; tries++) {
    const raw = [
      [rng.int(1, 3), rng.int(1, 3), rng.int(1, 3)],
      [rng.int(1, 3), rng.int(1, 3), rng.int(1, 3)],
      [rng.int(1, 3), rng.int(1, 3), rng.int(1, 3)],
    ];
    const candidate = intMatrix(raw);
    const d = det3(candidate);
    if (d.num !== 0 && Math.abs(d.num) <= 10) {
      A = candidate;
      break;
    }
  }

  // Harga satuan kelipatan Rp500 yang realistis (Rp2.000 s.d. Rp5.000)
  const xPrice = rng.int(4, 9) * 500;
  const yPrice = rng.int(4, 10) * 500;
  const zPrice = rng.int(4, 9) * 500;

  const totals = A.map(
    (row) => row[0].num * xPrice + row[1].num * yPrice + row[2].num * zPrice
  );
  const B = intMatrix([[totals[0]], [totals[1]], [totals[2]]]);
  const dA = det3(A);

  const [c1, c2, c3] = cakeSets;

  return {
    id: 'q6',
    competencyId: 6,
    variant,
    title: 'Aplikasi Matriks SPLTV — Toko Kue Tradisional',
    promptText: `Sebuah Toko Kue Tradisional menjual 3 paket jajanan pasar berisi ${c1} (x), ${c2} (y), dan ${c3} (z):\n• Paket A berisi ${A[0][0].num} ${c1}, ${A[0][1].num} ${c2}, dan ${A[0][2].num} ${c3} seharga ${formatRupiah(totals[0])}.\n• Paket B berisi ${A[1][0].num} ${c1}, ${A[1][1].num} ${c2}, dan ${A[1][2].num} ${c3} seharga ${formatRupiah(totals[1])}.\n• Paket C berisi ${A[2][0].num} ${c1}, ${A[2][1].num} ${c2}, dan ${A[2][2].num} ${c3} seharga ${formatRupiah(totals[2])}.\n\nDengan menggunakan metode determinan matriks (Aturan Cramer), tentukan harga satuan masing-masing kue!`,
    fields: [
      {
        kind: 'scalar',
        id: 'x',
        label: `Harga 1 ${c1} (x)`,
        labelLatex: 'x =',
        prefix: 'Rp',
        allowCurrency: true,
        expected: frac(xPrice),
        points: 5,
      },
      {
        kind: 'scalar',
        id: 'y',
        label: `Harga 1 ${c2} (y)`,
        labelLatex: 'y =',
        prefix: 'Rp',
        allowCurrency: true,
        expected: frac(yPrice),
        points: 5,
      },
      {
        kind: 'scalar',
        id: 'z',
        label: `Harga 1 ${c3} (z)`,
        labelLatex: 'z =',
        prefix: 'Rp',
        allowCurrency: true,
        expected: frac(zPrice),
        points: 5,
      },
    ],
    hints: [
      {
        level: 1,
        title: 'Susun Model Matriks 3×3',
        body: 'Ubah ketiga paket menjadi persamaan matriks A · X = B, lalu hitung determinan utama D = det(A) dengan aturan Sarrus.',
        latex: `${matrixToLatex(A)} \\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix} = ${matrixToLatex(B)}`,
      },
      {
        level: 2,
        title: 'Gunakan Aturan Cramer',
        body: 'Ganti kolom ke-1 dengan B untuk mencari Dx, kolom ke-2 untuk Dy, dan kolom ke-3 untuk Dz:',
        latex: `D = \\det(A) = ${fracToLatex(dA)}, \\quad x = \\frac{D_x}{D}, \\quad y = \\frac{D_y}{D}, \\quad z = \\frac{D_z}{D}`,
      },
      {
        level: 3,
        title: 'Tip Cepat (Substitusi Balik)',
        body: `Setelah memperoleh x = ${formatRupiah(xPrice)} dari Dx/D, kamu juga boleh mengecek hasil y dan z dengan mensubstitusikan kembali ke persamaan Paket A, B, dan C.`,
      },
    ],
    solutionSteps: [
      {
        title: '1. Bentuk Persamaan Matriks A · X = B',
        explanation: 'Representasi matriks dari ketiga paket kue adalah:',
        latex: `${matrixToLatex(A)} \\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix} = ${matrixToLatex(B)}`,
      },
      {
        title: '2. Menghitung Determinan Utama D = det(A)',
        explanation: 'Dengan aturan Sarrus diperoleh:',
        latex: `D = \\det(A) = ${fracToLatex(dA)}`,
      },
      {
        title: '3. Menentukan Harga Satuan via Aturan Cramer',
        explanation: 'Hitung Dx, Dy, Dz lalu bagi masing-masing dengan D:',
        latex: `x = ${xPrice} \\text{ (${formatRupiah(xPrice)})}, \\quad y = ${yPrice} \\text{ (${formatRupiah(yPrice)})}, \\quad z = ${zPrice} \\text{ (${formatRupiah(zPrice)})}`,
      },
    ],
    maxPoints: 15,
  };
}

export function getVariantForClass(className?: 'XI-1' | 'XI-2'): QuestionVariant | undefined {
  if (className === 'XI-1') return 'A';
  if (className === 'XI-2') return 'B';
  return undefined;
}

export function generateQuestionByCompetency(
  competencyId: CompetencyId,
  seed: number,
  forcedVariant?: QuestionVariant,
  className?: 'XI-1' | 'XI-2'
): GeneratedQuestion {
  // Pisahkan ruang seed antara XI-1 dan XI-2 agar angka acak juga selalu berbeda
  const classOffset = className === 'XI-2' ? 7919 : className === 'XI-1' ? 104729 : 0;
  const rng = createRng(seed + competencyId * 9973 + classOffset);
  const variant: QuestionVariant =
    forcedVariant ?? getVariantForClass(className) ?? (rng.next() < 0.5 ? 'A' : 'B');

  switch (competencyId) {
    case 1:
      return generateCompetency1(rng, variant);
    case 2:
      return generateCompetency2(rng, variant);
    case 3:
      return generateCompetency3(rng, variant);
    case 4:
      return generateCompetency4(rng, variant);
    case 5:
      return generateCompetency5(rng, variant);
    case 6:
      return generateCompetency6(rng, variant);
  }
}

export function generateExamQuestions(
  seed: number,
  className?: 'XI-1' | 'XI-2'
): GeneratedQuestion[] {
  const ids: CompetencyId[] = [1, 2, 3, 4, 5, 6];
  return ids.map((id) => generateQuestionByCompetency(id, seed, undefined, className));
}
