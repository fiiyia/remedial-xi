import {
  addFrac,
  divFrac,
  eqFrac,
  frac,
  fracToLatex,
  mulFrac,
  negFrac,
  subFrac,
  type Fraction,
} from './fraction';

export type Matrix = Fraction[][];

export function intMatrix(rows: number[][]): Matrix {
  return rows.map((row) => row.map((v) => frac(v, 1)));
}

export function addMatrix(A: Matrix, B: Matrix): Matrix {
  return A.map((row, i) => row.map((val, j) => addFrac(val, B[i][j])));
}

export function subMatrix(A: Matrix, B: Matrix): Matrix {
  return A.map((row, i) => row.map((val, j) => subFrac(val, B[i][j])));
}

export function scaleMatrix(k: Fraction, A: Matrix): Matrix {
  return A.map((row) => row.map((val) => mulFrac(k, val)));
}

export function transposeMatrix(A: Matrix): Matrix {
  const rows = A.length;
  const cols = A[0].length;
  const result: Matrix = [];
  for (let j = 0; j < cols; j++) {
    const newRow: Fraction[] = [];
    for (let i = 0; i < rows; i++) {
      newRow.push(A[i][j]);
    }
    result.push(newRow);
  }
  return result;
}

export function mulMatrix(A: Matrix, B: Matrix): Matrix {
  const rows = A.length;
  const cols = B[0].length;
  const inner = B.length;
  const result: Matrix = [];
  for (let i = 0; i < rows; i++) {
    const row: Fraction[] = [];
    for (let j = 0; j < cols; j++) {
      let sum = frac(0);
      for (let k = 0; k < inner; k++) {
        sum = addFrac(sum, mulFrac(A[i][k], B[k][j]));
      }
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

export function det2(A: Matrix): Fraction {
  return subFrac(mulFrac(A[0][0], A[1][1]), mulFrac(A[0][1], A[1][0]));
}

export function inverse2(A: Matrix): Matrix {
  const d = det2(A);
  if (d.num === 0) {
    throw new Error('Matriks 2x2 singular (determinan = 0)');
  }
  const adj: Matrix = [
    [A[1][1], negFrac(A[0][1])],
    [negFrac(A[1][0]), A[0][0]],
  ];
  return adj.map((row) => row.map((val) => divFrac(val, d)));
}

export function minor3(A: Matrix, rowSkip: number, colSkip: number): Fraction {
  const sub: Fraction[][] = [];
  for (let i = 0; i < 3; i++) {
    if (i === rowSkip) continue;
    const r: Fraction[] = [];
    for (let j = 0; j < 3; j++) {
      if (j === colSkip) continue;
      r.push(A[i][j]);
    }
    sub.push(r);
  }
  return det2(sub);
}

export function cofactor3(A: Matrix): Matrix {
  const cof: Matrix = [];
  for (let i = 0; i < 3; i++) {
    const row: Fraction[] = [];
    for (let j = 0; j < 3; j++) {
      const m = minor3(A, i, j);
      row.push((i + j) % 2 === 0 ? m : negFrac(m));
    }
    cof.push(row);
  }
  return cof;
}

export function det3(A: Matrix): Fraction {
  const c00 = minor3(A, 0, 0);
  const c01 = minor3(A, 0, 1);
  const c02 = minor3(A, 0, 2);
  return addFrac(
    subFrac(mulFrac(A[0][0], c00), mulFrac(A[0][1], c01)),
    mulFrac(A[0][2], c02)
  );
}

export function adjugate3(A: Matrix): Matrix {
  return transposeMatrix(cofactor3(A));
}

export function inverse3(A: Matrix): Matrix {
  const d = det3(A);
  if (d.num === 0) {
    throw new Error('Matriks 3x3 singular (determinan = 0)');
  }
  const adj = adjugate3(A);
  return adj.map((row) => row.map((val) => divFrac(val, d)));
}

export function matrixEquals(A: Matrix, B: Matrix): boolean {
  if (A.length !== B.length) return false;
  for (let i = 0; i < A.length; i++) {
    if (A[i].length !== B[i].length) return false;
    for (let j = 0; j < A[i].length; j++) {
      if (!eqFrac(A[i][j], B[i][j])) return false;
    }
  }
  return true;
}

export function matrixToLatex(A: Matrix, env: 'pmatrix' | 'bmatrix' = 'pmatrix'): string {
  const body = A.map((row) => row.map((v) => fracToLatex(v)).join(' & ')).join(' \\\\ ');
  return `\\begin{${env}} ${body} \\end{${env}}`;
}

export function rawMatrixToLatex(rows: string[][], env: 'pmatrix' | 'bmatrix' = 'pmatrix'): string {
  const body = rows.map((row) => row.join(' & ')).join(' \\\\ ');
  return `\\begin{${env}} ${body} \\end{${env}}`;
}
