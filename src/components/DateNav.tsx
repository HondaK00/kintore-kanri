import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, fmtJP, todayStr } from '../lib/date';

export function DateNav({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  const today = todayStr();
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={() => onChange(addDays(date, -1))}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-900/5 transition active:scale-95"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-2">
        <label className="relative cursor-pointer text-base font-bold tracking-tight">
          {fmtJP(date)}
          {date === today && <span className="ml-1.5 text-xs font-semibold text-emerald-600">今日</span>}
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            className="absolute inset-0 opacity-0"
          />
        </label>
        {date !== today && (
          <button
            type="button"
            onClick={() => onChange(today)}
            className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 transition active:scale-95"
          >
            今日へ
          </button>
        )}
      </div>

      <button
        type="button"
        disabled={date >= today}
        onClick={() => onChange(addDays(date, 1))}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-900/5 transition active:scale-95 disabled:opacity-30 disabled:active:scale-100"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
