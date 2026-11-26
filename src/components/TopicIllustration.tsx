import type { CompetencyId } from '../lib/generator/types';

export const TOPIC_PASTEL_THEMES: Record<
  CompetencyId,
  { bg: string; badgeBg: string; accent: string; symbol: string; subLabel: string }
> = {
  1: {
    bg: 'from-[#C9E2FF] to-[#B7D7FF]',
    badgeBg: 'bg-white/85 text-[#4278C7]',
    accent: '#4A83D6',
    symbol: 'P + Q',
    subLabel: 'Kesamaan Matriks',
  },
  2: {
    bg: 'from-[#FFE0C9] to-[#FFD1B5]',
    badgeBg: 'bg-white/85 text-[#C76A39]',
    accent: '#E07A47',
    symbol: 'A⁻¹·B',
    subLabel: 'Transpos & Invers',
  },
  3: {
    bg: 'from-[#E2CDFF] to-[#D4B8FF]',
    badgeBg: 'bg-white/85 text-[#6C4EB8]',
    accent: '#7A5CD6',
    symbol: 'det(A)',
    subLabel: 'Persamaan 2×2',
  },
  4: {
    bg: 'from-[#FFCDE0] to-[#FFB8D2]',
    badgeBg: 'bg-white/85 text-[#BF4B77]',
    accent: '#D65C8A',
    symbol: 'Adj(3×3)',
    subLabel: 'Invers 3×3',
  },
  5: {
    bg: 'from-[#C8F2E2] to-[#B2EAD6]',
    badgeBg: 'bg-white/85 text-[#2E8564]',
    accent: '#399B76',
    symbol: 'AX = B',
    subLabel: 'SPLDV Cerita',
  },
  6: {
    bg: 'from-[#FFF0BE] to-[#FFE49E]',
    badgeBg: 'bg-white/85 text-[#A87A1F]',
    accent: '#C49027',
    symbol: 'x, y, z',
    subLabel: 'SPLTV Cerita',
  },
};

export function TopicThumbnail({ id }: { id: CompetencyId }) {
  const theme = TOPIC_PASTEL_THEMES[id];

  return (
    <div
      className={`relative flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} p-4`}
    >
      {/* Decorative soft circles */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/30" />
      <div className="pointer-events-none absolute -bottom-5 -left-3 h-14 w-14 rounded-full bg-white/25" />

      {/* Center playful 3D-like card tile */}
      <div className="relative flex flex-col items-center justify-center rounded-2xl bg-white/85 px-4 py-3 shadow-sm backdrop-blur-xs">
        <span
          className="font-mono-math text-lg font-extrabold tracking-tight"
          style={{ color: theme.accent }}
        >
          {theme.symbol}
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6b6c89]">
          {theme.subLabel}
        </span>
      </div>

      {/* Bottom corner mini-badges matching reference aesthetic */}
      <span
        className={`absolute bottom-2.5 left-2.5 rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-2xs ${theme.badgeBg}`}
      >
        No. {id}
      </span>
    </div>
  );
}

/**
 * Ilustrasi tumpukan buku soft-3D untuk sisi kiri Hero Banner
 */
export function HeroBooksLeft() {
  return (
    <svg
      viewBox="0 0 130 96"
      fill="none"
      className="hidden h-24 w-32 shrink-0 sm:block"
      aria-hidden="true"
    >
      {/* Bottom coral book */}
      <rect x="14" y="64" width="96" height="20" rx="6" fill="#FF8566" />
      <rect x="20" y="69" width="84" height="10" rx="3" fill="#FFF3EE" />
      {/* Middle purple book */}
      <rect x="22" y="44" width="84" height="20" rx="6" fill="#B28DFF" />
      <rect x="28" y="49" width="72" height="10" rx="3" fill="#F4EEFF" />
      {/* Top mint book */}
      <rect x="30" y="26" width="68" height="18" rx="6" fill="#63D8B4" />
      <rect x="36" y="31" width="56" height="8" rx="3" fill="#EBFBF5" />
      {/* Cute yellow glasses */}
      <circle cx="52" cy="18" r="8" stroke="#FFD86B" strokeWidth="3" fill="white" fillOpacity="0.25" />
      <circle cx="76" cy="18" r="8" stroke="#FFD86B" strokeWidth="3" fill="white" fillOpacity="0.25" />
      <path d="M60 18H68" stroke="#FFD86B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Ilustrasi rak buku & matriks soft-3D untuk sisi kanan Hero Banner
 */
export function HeroBooksRight() {
  return (
    <svg
      viewBox="0 0 130 96"
      fill="none"
      className="hidden h-24 w-32 shrink-0 md:block"
      aria-hidden="true"
    >
      {/* Desk / shelf */}
      <rect x="14" y="66" width="102" height="10" rx="5" fill="#FFC45E" />
      <rect x="24" y="76" width="10" height="16" rx="4" fill="#F0A53C" />
      <rect x="96" y="76" width="10" height="16" rx="4" fill="#F0A53C" />
      {/* Stacked books left */}
      <rect x="22" y="54" width="44" height="12" rx="4" fill="#63D8B4" />
      <rect x="26" y="42" width="36" height="12" rx="4" fill="#FF92A5" />
      {/* Upright books right */}
      <rect x="72" y="24" width="14" height="42" rx="4" fill="#B596FF" />
      <rect x="88" y="30" width="14" height="36" rx="4" fill="#82C6FF" />
      <rect x="104" y="36" width="10" height="30" rx="3" fill="#FFD86B" />
    </svg>
  );
}
