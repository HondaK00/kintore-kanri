import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { round1 } from '../lib/calc';

/** 全角数字・記号を半角へ */
function normalize(text: string): string {
  return text
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[．。]/g, '.')
    .replace(/[ー−]/g, '-');
}

function parse(text: string): number | null {
  const n = parseFloat(normalize(text).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

interface NumberTextProps {
  value: number | null;
  onCommit: (n: number | null) => void;
  nullable?: boolean;
  placeholder?: string;
  className?: string;
  /** trueなら標準の枠スタイルを付けない（Stepper等での埋め込み用） */
  bare?: boolean;
}

/** フォーカス中は自由入力、blur時に数値として確定するテキスト入力 */
export function NumberText({ value, onCommit, nullable, placeholder, className = '', bare }: NumberTextProps) {
  const [text, setText] = useState(value == null ? '' : String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value == null ? '' : String(value));
  }, [value, focused]);

  const commit = () => {
    setFocused(false);
    const n = parse(text);
    if (n == null) {
      onCommit(nullable ? null : 0);
    } else {
      onCommit(round1(Math.max(0, n)));
    }
  };

  const base = bare
    ? 'bg-transparent outline-none tabular-nums'
    : 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base tabular-nums outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      placeholder={placeholder}
      onFocus={(e) => {
        setFocused(true);
        e.target.select();
      }}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
      className={`${base} ${className}`}
    />
  );
}

interface PFCInputsProps {
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  onProtein: (n: number | null) => void;
  onFat: (n: number | null) => void;
  onCarbs: (n: number | null) => void;
  /** ラベル接尾辞（例: '目標' → "P目標 (g)"） */
  suffix?: string;
  placeholder?: string;
}

/** P/F/C を1行3列で入力する共通フォーム（食事・マイ食品・目標設定で共用） */
export function PFCInputs({
  protein,
  fat,
  carbs,
  onProtein,
  onFat,
  onCarbs,
  suffix = '',
  placeholder,
}: PFCInputsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <label className="block">
        <span className="text-xs font-bold text-rose-500">P{suffix} (g)</span>
        <NumberText nullable value={protein} onCommit={onProtein} placeholder={placeholder} className="mt-1 w-full" />
      </label>
      <label className="block">
        <span className="text-xs font-bold text-amber-500">F{suffix} (g)</span>
        <NumberText nullable value={fat} onCommit={onFat} placeholder={placeholder} className="mt-1 w-full" />
      </label>
      <label className="block">
        <span className="text-xs font-bold text-blue-500">C{suffix} (g)</span>
        <NumberText nullable value={carbs} onCommit={onCarbs} placeholder={placeholder} className="mt-1 w-full" />
      </label>
    </div>
  );
}

interface StepperProps {
  value: number;
  onChange: (n: number) => void;
  step: number;
  min?: number;
  /** 小数重量向けに入力欄を広くする */
  wide?: boolean;
}

/** [−] 数値 [＋] のステッパー入力（セット記録用） */
export function Stepper({ value, onChange, step, min = 0, wide }: StepperProps) {
  return (
    <div className="flex items-center overflow-hidden rounded-xl bg-slate-100">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, round1(value - step)))}
        className="flex h-10 w-8 shrink-0 items-center justify-center text-slate-500 transition active:bg-slate-200"
      >
        <Minus size={15} />
      </button>
      <NumberText
        bare
        value={value}
        onCommit={(n) => onChange(Math.max(min, n ?? 0))}
        className={`h-10 text-center text-[15px] font-bold ${wide ? 'w-14' : 'w-11'}`}
      />
      <button
        type="button"
        onClick={() => onChange(round1(value + step))}
        className="flex h-10 w-8 shrink-0 items-center justify-center text-slate-500 transition active:bg-slate-200"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
