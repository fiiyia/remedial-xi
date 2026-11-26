import { useRef } from 'react';
import { MathBlock } from './MathBlock';

interface MatrixInputGridProps {
  id: string;
  label: string;
  labelLatex?: string;
  rows: number;
  cols: number;
  allowFraction?: boolean;
  value: string[][];
  onChange: (next: string[][]) => void;
  disabled?: boolean;
  correctCells?: boolean[][];
}

export function createEmptyGrid(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''));
}

export function MatrixInputGrid({
  id,
  label,
  labelLatex,
  rows,
  cols,
  allowFraction = false,
  value,
  onChange,
  disabled = false,
  correctCells,
}: MatrixInputGridProps) {
  const cellRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => null))
  );

  const normalized = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => value[r]?.[c] ?? '')
  );

  const handleCellChange = (r: number, c: number, val: string) => {
    const next = normalized.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? val : cell))
    );
    onChange(next);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    r: number,
    c: number
  ) => {
    let nextR = r;
    let nextC = c;
    if (e.key === 'ArrowRight') nextC = Math.min(cols - 1, c + 1);
    else if (e.key === 'ArrowLeft') nextC = Math.max(0, c - 1);
    else if (e.key === 'ArrowDown') nextR = Math.min(rows - 1, r + 1);
    else if (e.key === 'ArrowUp') nextR = Math.max(0, r - 1);
    else return;

    if (nextR !== r || nextC !== c) {
      e.preventDefault();
      cellRefs.current[nextR]?.[nextC]?.focus();
      cellRefs.current[nextR]?.[nextC]?.select();
    }
  };

  return (
    <div className="rounded-2xl border border-violet-200/80 bg-violet-50/35 p-4 shadow-2xs">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-violet-950">{label}</div>
        <span className="text-xs text-violet-700/80">
          {allowFraction
            ? 'Mendukung negatif & pecahan (mis. -2/5). Navigasi: Tab / Panah'
            : 'Isi angka bulat. Navigasi cepat: Tab / tombol panah'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 overflow-x-auto py-1">
        {labelLatex && (
          <div className="text-base font-medium text-violet-950">
            <MathBlock latex={labelLatex} />
          </div>
        )}

        <div
          className="matrix-bracket-box"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(4.25rem, 5.25rem))` }}
          role="group"
          aria-label={label}
        >
          {normalized.map((row, r) =>
            row.map((cell, c) => {
              const cellStatus = correctCells?.[r]?.[c];
              let statusClass =
                'border-violet-200 bg-white focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200';
              if (cellStatus === true) {
                statusClass = 'border-emerald-400 bg-emerald-50 text-emerald-900';
              } else if (cellStatus === false) {
                statusClass = 'border-rose-400 bg-rose-50 text-rose-900';
              }

              return (
                <input
                  key={`${id}-${r}-${c}`}
                  ref={(el) => {
                    if (!cellRefs.current[r]) cellRefs.current[r] = [];
                    cellRefs.current[r][c] = el;
                  }}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={disabled}
                  aria-label={`${label} baris ${r + 1} kolom ${c + 1}`}
                  placeholder="0"
                  value={cell}
                  onChange={(e) => handleCellChange(r, c, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, r, c)}
                  className={`matrix-cell-input font-mono-math h-11 w-full rounded-lg border px-2 text-center font-medium text-slate-900 outline-none transition ${statusClass}`}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
