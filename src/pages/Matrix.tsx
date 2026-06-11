import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type WorkoutEntry } from '../db/db';
import { useExerciseMap } from '../lib/hooks';
import { fmtWeight } from '../lib/calc';
import { fmtMD, todayStr } from '../lib/date';
import { EmptyState } from '../components/ui';

const MAX_COLUMNS = 40;

export default function MatrixPage({ onOpenDate }: { onOpenDate: (d: string) => void }) {
  const routines = useLiveQuery(() => db.routines.orderBy('sortOrder').toArray());
  const exMap = useExerciseMap();
  const [routineId, setRoutineId] = useState<number | null>(null);

  useEffect(() => {
    if (routineId == null && routines && routines.length > 0) {
      setRoutineId(routines[0].id!);
    }
  }, [routines, routineId]);

  const routine = (routines ?? []).find((r) => r.id === routineId);
  // ルーティン切替と種目構成の変更（編集での追加/削除/並び替え）の両方で再クエリする
  const exIdsKey = routine?.exerciseIds.join(',') ?? '';
  const entries = useLiveQuery(
    () =>
      routine && routine.exerciseIds.length > 0
        ? db.workouts.where('exerciseId').anyOf(routine.exerciseIds).toArray()
        : Promise.resolve([] as WorkoutEntry[]),
    [routine?.id, exIdsKey],
  );

  // 新しい日付が左に来るように降順
  const dates = useMemo(() => {
    const set = new Set((entries ?? []).map((e) => e.date));
    return [...set].sort((a, b) => (a < b ? 1 : -1)).slice(0, MAX_COLUMNS);
  }, [entries]);

  const byKey = useMemo(() => {
    const m = new Map<string, WorkoutEntry>();
    for (const e of entries ?? []) m.set(`${e.exerciseId}|${e.date}`, e);
    return m;
  }, [entries]);

  const today = todayStr();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold tracking-tight">記録表</h1>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {(routines ?? []).map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRoutineId(r.id!)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold shadow-sm transition active:scale-95 ${
              r.id === routineId
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-900/5'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {routines && routines.length === 0 && (
        <EmptyState>
          ルーティンがありません。
          <br />
          設定 → ルーティン管理 から作成してください。
        </EmptyState>
      )}

      {routine && dates.length === 0 && (
        <EmptyState>
          「{routine.name}」の記録はまだありません。
          <br />
          筋トレタブから記録を始めましょう。
        </EmptyState>
      )}

      {routine && dates.length > 0 && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 min-w-28 border-r border-b border-slate-100 bg-white px-3 py-2.5 text-left text-[11px] font-bold text-slate-400">
                    種目
                  </th>
                  {dates.map((d) => (
                    <th
                      key={d}
                      className={`min-w-[72px] border-b border-slate-100 px-2 py-2.5 text-center text-xs font-bold tabular-nums ${
                        d === today ? 'text-emerald-600' : 'text-slate-500'
                      }`}
                    >
                      {fmtMD(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routine.exerciseIds.map((exId) => (
                  <tr key={exId}>
                    <th className="sticky left-0 z-10 max-w-32 min-w-28 border-r border-b border-slate-100 bg-white px-3 py-2 text-left align-top text-xs leading-snug font-bold text-slate-700">
                      {exMap.get(exId)?.name ?? '削除済み種目'}
                    </th>
                    {dates.map((d) => {
                      const entry = byKey.get(`${exId}|${d}`);
                      return (
                        <td
                          key={d}
                          onClick={() => onOpenDate(d)}
                          className="cursor-pointer border-b border-slate-100 px-1.5 py-2 text-center align-top transition active:bg-emerald-50"
                        >
                          {entry && entry.sets.length > 0 ? (
                            entry.sets.map((s, i) => (
                              <div
                                key={s.id ?? i}
                                className="text-[11px] leading-4 font-semibold text-slate-700 tabular-nums"
                              >
                                {fmtWeight(s.weightKg)}
                                <span className="font-normal text-slate-300">×</span>
                                {s.reps}
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-200">―</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-400">
            セルをタップするとその日の記録を編集できます ・ 横スクロールで過去へ
          </p>
        </div>
      )}
    </div>
  );
}
