import { House, Dumbbell, UtensilsCrossed, Table2, ChartLine } from 'lucide-react';
import type { Tab } from '../App';

const TABS: { key: Tab; label: string; Icon: typeof House }[] = [
  { key: 'home', label: 'ホーム', Icon: House },
  { key: 'workout', label: '筋トレ', Icon: Dumbbell },
  { key: 'meals', label: '食事', Icon: UtensilsCrossed },
  { key: 'matrix', label: '記録表', Icon: Table2 },
  { key: 'stats', label: '分析', Icon: ChartLine },
];

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-slate-200/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="grid grid-cols-5">
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`flex flex-col items-center gap-0.5 pt-2 pb-1.5 transition ${
                active ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
