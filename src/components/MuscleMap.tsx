import { useMemo } from 'react';
import type { Muscle } from '../db/muscles';
import { MUSCLE_LABELS } from '../db/muscles';

type Pt = [number, number];
interface Shape {
  m?: Muscle;
  pts: Pt[];
  center?: boolean; // 中央をまたぐ対称形（左右ミラーしない）
}

const COLOR = {
  base: '#cbd5e1', // 対象外の筋肉
  secondary: '#6ee7b7', // 協働筋
  primary: '#059669', // 主働筋
  neutral: '#e2e8f0', // 頭・手足など筋肉以外
  stroke: '#f8fafc',
};

// 前面（ローカル中心 x=60）
const FRONT: Shape[] = [
  { m: 'front_delt', pts: [[67, 32], [77, 35], [78, 44], [68, 44]] },
  { m: 'side_delt', pts: [[77, 36], [83, 42], [82, 51], [77, 48]] },
  { m: 'chest_upper', pts: [[60.5, 37], [70, 39], [70, 45], [60.5, 45]] },
  { m: 'chest', pts: [[60.5, 45], [71, 45.5], [72, 57], [60.5, 58]] },
  { m: 'biceps', pts: [[75, 49], [82, 52], [83, 66], [76, 65]] },
  { m: 'forearms', pts: [[77, 67], [84, 70], [87, 87], [80, 88]] },
  { m: 'obliques', pts: [[66, 61], [72, 64], [71, 90], [66, 92]] },
  { m: 'abs', center: true, pts: [[54.5, 60], [65.5, 60], [65.5, 95], [54.5, 95]] },
  { m: 'quads', pts: [[60, 98], [71, 98], [69, 135], [59, 135]] },
  { m: 'adductors', pts: [[54, 98], [60, 98], [60.5, 128], [56, 123]] },
];

// 背面（ローカル中心 x=60）
const BACK: Shape[] = [
  { m: 'traps', center: true, pts: [[51, 31], [60, 28], [69, 31], [67, 42], [60, 45], [53, 42]] },
  { m: 'rear_delt', pts: [[69, 34], [79, 37], [80, 45], [70, 45]] },
  { m: 'lats', pts: [[60.5, 46], [71, 47], [70, 69], [60.5, 66]] },
  { m: 'triceps', pts: [[75, 49], [82, 52], [83, 66], [76, 65]] },
  { m: 'forearms', pts: [[77, 67], [84, 70], [87, 87], [80, 88]] },
  { m: 'lower_back', center: true, pts: [[55, 67], [65, 67], [64, 83], [56, 83]] },
  { m: 'glutes', pts: [[60.5, 84], [71, 85], [71.5, 101], [60.5, 100]] },
  { m: 'hamstrings', pts: [[60, 102], [71, 102], [69, 135], [59, 135]] },
  { m: 'calves', pts: [[61, 147], [70, 147], [68, 182], [61.5, 182]] },
];

const str = (pts: Pt[]) => pts.map((p) => p.join(',')).join(' ');
const mirror = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [120 - x, y]);

function Figure({
  shapes,
  fillOf,
  label,
}: {
  shapes: Shape[];
  fillOf: (m: Muscle) => string;
  label: string;
}) {
  return (
    <g>
      {/* 胴体・四肢のベースシルエット */}
      <path
        d="M60 26 C50 26 47 31 47 38 C47 44 44 47 41 56 L37 90 C35 96 38 98 41 96 L46 60 L48 96 C47 116 47 128 50 150 L53 188 C53 194 59 194 59 188 L60 104 L61 188 C61 194 67 194 67 188 L70 150 C73 128 73 116 72 96 L74 60 L79 96 C82 98 85 96 83 90 L79 56 C76 47 73 44 73 38 C73 31 70 26 60 26 Z"
        fill={COLOR.neutral}
        strokeLinejoin="round"
      />
      {/* 各筋肉 */}
      {shapes.map((s, i) => {
        const fill = s.m ? fillOf(s.m) : COLOR.neutral;
        return (
          <g key={i}>
            <polygon points={str(s.pts)} fill={fill} stroke={COLOR.stroke} strokeWidth={0.8} strokeLinejoin="round" />
            {!s.center && (
              <polygon
                points={str(mirror(s.pts))}
                fill={fill}
                stroke={COLOR.stroke}
                strokeWidth={0.8}
                strokeLinejoin="round"
              />
            )}
          </g>
        );
      })}
      {/* 頭・首・手・足 */}
      <ellipse cx={60} cy={15} rx={9.5} ry={11.5} fill={COLOR.neutral} />
      <ellipse cx={88} cy={97} rx={4.5} ry={6} fill={COLOR.neutral} />
      <ellipse cx={32} cy={97} rx={4.5} ry={6} fill={COLOR.neutral} />
      <ellipse cx={56} cy={193} rx={4} ry={5} fill={COLOR.neutral} />
      <ellipse cx={64} cy={193} rx={4} ry={5} fill={COLOR.neutral} />
      <text x={60} y={208} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94a3b8">
        {label}
      </text>
    </g>
  );
}

interface Props {
  primary: Muscle[];
  secondary?: Muscle[];
  /** 表示高さ(px) */
  height?: number;
  className?: string;
}

export function MuscleMap({ primary, secondary = [], height = 150, className = '' }: Props) {
  const fillOf = useMemo(() => {
    const p = new Set(primary);
    const s = new Set(secondary);
    return (m: Muscle) => (p.has(m) ? COLOR.primary : s.has(m) ? COLOR.secondary : COLOR.base);
  }, [primary, secondary]);

  return (
    <svg
      viewBox="0 0 250 214"
      height={height}
      className={className}
      role="img"
      aria-label="対象筋のハイライト"
    >
      <g transform="translate(0,0)">
        <Figure shapes={FRONT} fillOf={fillOf} label="前面" />
      </g>
      <g transform="translate(130,0)">
        <Figure shapes={BACK} fillOf={fillOf} label="背面" />
      </g>
    </svg>
  );
}

/** 凡例（主働筋・協働筋の名称一覧） */
export function MuscleLegend({ primary, secondary = [] }: { primary: Muscle[]; secondary?: Muscle[] }) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="flex h-3 w-3 shrink-0 rounded-full" style={{ background: COLOR.primary }} />
        <span className="text-[11px] font-bold text-slate-500">主に効く</span>
        {primary.map((m) => (
          <span key={m} className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
            {MUSCLE_LABELS[m]}
          </span>
        ))}
      </div>
      {secondary.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex h-3 w-3 shrink-0 rounded-full" style={{ background: COLOR.secondary }} />
          <span className="text-[11px] font-bold text-slate-500">補助的に</span>
          {secondary.map((m) => (
            <span key={m} className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              {MUSCLE_LABELS[m]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
