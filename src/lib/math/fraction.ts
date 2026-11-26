/**
 * Aritmetika bilangan rasional eksak (Fraction) untuk menghindari
 * floating-point error pada perhitungan determinan dan invers matriks.
 */
export interface Fraction {
  readonly num: number;
  readonly den: number;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x === 0 ? 1 : x;
}

export function frac(num: number, den = 1): Fraction {
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
    throw new Error(`Pecahan tidak valid: ${num}/${den}`);
  }
  if (num === 0) {
    return { num: 0, den: 1 };
  }
  const sign = den < 0 ? -1 : 1;
  const n = Math.trunc(num) * sign;
  const d = Math.abs(Math.trunc(den));
  const g = gcd(n, d);
  return { num: n / g, den: d / g };
}

export function addFrac(a: Fraction, b: Fraction): Fraction {
  return frac(a.num * b.den + b.num * a.den, a.den * b.den);
}

export function subFrac(a: Fraction, b: Fraction): Fraction {
  return frac(a.num * b.den - b.num * a.den, a.den * b.den);
}

export function mulFrac(a: Fraction, b: Fraction): Fraction {
  return frac(a.num * b.num, a.den * b.den);
}

export function divFrac(a: Fraction, b: Fraction): Fraction {
  if (b.num === 0) {
    throw new Error('Pembagian dengan nol pada bilangan rasional');
  }
  return frac(a.num * b.den, a.den * b.num);
}

export function negFrac(a: Fraction): Fraction {
  return frac(-a.num, a.den);
}

export function eqFrac(a: Fraction, b: Fraction): boolean {
  return a.num === b.num && a.den === b.den;
}

export function fracToString(f: Fraction): string {
  if (f.den === 1) return `${f.num}`;
  return `${f.num}/${f.den}`;
}

export function fracToLatex(f: Fraction): string {
  if (f.den === 1) return `${f.num}`;
  if (f.num < 0) {
    return `-\\frac{${Math.abs(f.num)}}{${f.den}}`;
  }
  return `\\frac{${f.num}}{${f.den}}`;
}

/**
 * Mem-parse input angka/pecahan siswa menjadi Fraction eksak.
 * Mendukung:
 * - Bilangan bulat: "5", "-12", "+3"
 * - Pecahan: "1/3", "-2/5", "2/-4", " 6 / 9 "
 * - Desimal hingga 6 digit: "0.5", "-0,25"
 * - Format Rupiah (jika allowCurrency = true): "Rp 15.000", "15.000", "Rp15000"
 */
export function parseStudentNumber(
  raw: string,
  options?: { allowCurrency?: boolean }
): Fraction | null {
  if (typeof raw !== 'string') return null;
  let cleaned = raw.trim();
  if (!cleaned) return null;

  // Normalisasi tanda minus unicode (−, –) menjadi ASCII '-'
  cleaned = cleaned.replace(/[−–—]/g, '-');

  if (options?.allowCurrency) {
    // Hapus prefix Rp/IDR dan spasi
    cleaned = cleaned.replace(/^(rp\.?|idr)\s*/i, '').trim();
    // Jika format ribuan Indonesia seperti "15.000" atau "1.250.000"
    if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) {
      cleaned = cleaned.replace(/\./g, '');
    } else if (/^-?\d{1,3}(,\d{3})+$/.test(cleaned)) {
      cleaned = cleaned.replace(/,/g, '');
    }
    // Hapus ",00" di belakang jika ada
    cleaned = cleaned.replace(/,00$/, '');
  }

  // Hapus spasi di sekitar tanda pecahan
  cleaned = cleaned.replace(/\s+/g, '');

  // Cek bentuk pecahan a/b
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length !== 2) return null;
    const [numStr, denStr] = parts;
    if (!/^[+-]?\d+$/.test(numStr) || !/^[+-]?\d+$/.test(denStr)) return null;
    const num = Number.parseInt(numStr, 10);
    const den = Number.parseInt(denStr, 10);
    if (!Number.isSafeInteger(num) || !Number.isSafeInteger(den) || den === 0) {
      return null;
    }
    return frac(num, den);
  }

  // Cek bilangan bulat
  if (/^[+-]?\d+$/.test(cleaned)) {
    const val = Number.parseInt(cleaned, 10);
    if (!Number.isSafeInteger(val)) return null;
    return frac(val, 1);
  }

  // Cek desimal (titik atau koma)
  const decimalNormalized = cleaned.replace(',', '.');
  if (/^[+-]?\d+\.\d{1,6}$/.test(decimalNormalized)) {
    const sign = decimalNormalized.startsWith('-') ? -1 : 1;
    const unsigned = decimalNormalized.replace(/^[+-]/, '');
    const [intPart, decPart] = unsigned.split('.');
    const scale = 10 ** decPart.length;
    const num = sign * (Number.parseInt(intPart, 10) * scale + Number.parseInt(decPart, 10));
    if (!Number.isSafeInteger(num)) return null;
    return frac(num, scale);
  }

  return null;
}

export function formatRupiah(amount: number): string {
  return `Rp${Math.round(amount).toLocaleString('id-ID')}`;
}
