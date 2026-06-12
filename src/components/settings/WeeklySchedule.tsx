import { useRoutines, useWeeklyPlan } from '../../lib/hooks';
import { setWeeklyDay } from '../../lib/repo';
import { Card, EmptyState } from '../ui';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const WEEKDAY_COLOR = ['text-rose-500', '', '', '', '', '', 'text-blue-500'];

export function WeeklySchedule() {
  const routines = useRoutines();
  const plan = useWeeklyPlan();

  if (routines && routines.length === 0) {
    return (
      <EmptyState>
        ルーティンがありません。
        <br />
        先に「ルーティン管理」で曜日に割り当てるメニューを作成してください。
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-sm font-extrabold text-slate-700">曜日ごとのメニュー</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          各曜日に行うルーティンを割り当てると、ホームと筋トレ画面に「今日の予定」が表示されます。
        </p>
        <div className="mt-3 divide-y divide-slate-50">
          {WEEKDAYS.map((label, weekday) => {
            const routineId = plan.get(weekday) ?? null;
            return (
              <div key={weekday} className="flex items-center gap-3 py-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-extrabold ${WEEKDAY_COLOR[weekday]}`}
                >
                  {label}
                </span>
                <select
                  value={routineId ?? ''}
                  onChange={(e) =>
                    void setWeeklyDay(weekday, e.target.value === '' ? null : Number(e.target.value))
                  }
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none transition focus:border-emerald-500"
                >
                  <option value="">休み</option>
                  {(routines ?? []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
