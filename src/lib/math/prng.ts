/**
 * Deterministic PRNG (Mulberry32) agar satu sesi ujian remedial dengan seed
 * tertentu selalu menghasilkan soal yang persis sama saat halaman di-refresh.
 */
export interface Rng {
  next: () => number;
  int: (min: number, max: number) => number;
  nonZeroInt: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number => {
    return Math.floor(next() * (max - min + 1)) + min;
  };

  const nonZeroInt = (min: number, max: number): number => {
    let v = 0;
    while (v === 0) {
      v = int(min, max);
    }
    return v;
  };

  const pick = <T>(items: readonly T[]): T => {
    return items[Math.floor(next() * items.length)];
  };

  return { next, int, nonZeroInt, pick };
}

export function generateSessionSeed(): number {
  return Math.floor(Math.random() * 2_000_000_000) + 1;
}
