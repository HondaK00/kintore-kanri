import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Copy, Play, Plus, Trash2, X } from 'lucide-react';
import { db, newSetId, type Exercise, type Routine, type WorkoutEntry, type WorkoutSet } from '../db/db';
import { useExerciseMap, usePrevEntry } from '../lib/hooks';
import { fmtWeight } from '../lib/calc';
import { fmtMD } from '../lib/date';
import { Card, EmptyState } from '../components/ui';
import { DateNav } from '../components/DateNav';
import { Stepper } from '../components/inputs';
import { ExercisePicker } from '../components/ExercisePicker';

interface Props {
  date: string;
  onDateChange: (d: string) => void;
}

export default function WorkoutPage({ date, onDateChange }: Props) {
  const entries = useLiveQuery(() => db.workouts.where('date').equals(date).sortBy('id'), [date]);
  const routines = useLiveQuery(() => db.routines.orderBy('sortOrder').toArray());
  const exMap = useExerciseMap();
  const [pickerOpen, setPickerOpen] = useState(false);

  const startRoutine = async (r: Routine) => {
    const existing = new Set((entries ?? []).map((e) => e.exerciseId));
    const toAdd = r.exerciseIds.filter((id) => !existing.has(id));
    if (toAdd.length === 0) return;
    await db.workouts.bulkAdd(
      toAdd.map((exerciseId) => ({ date, exerciseId, routineId: r.id!, sets: [] })),
    );
  };

  const addExercise = async (ex: Exercise) => {
    if ((entries ?? []).some((e) => e.exerciseId === ex.id)) return;
    await db.workouts.add({ date, exerciseId: ex.id!, routineId: null, sets: [] });
  };

  return (
    <div className="space-y-4">
      <DateNav date={date} onChange={onDateChange} />

      {/* ルーティン開始・種目追加 */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition active:scale-95"
        >
          <Plus size={15} />
          種目追加
        </button>
        {(routines ?? []).map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => void startRoutine(r)}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-900/5 transition active:scale-95"
          >
            <Play size={13} className="text-emerald-500" />
            {r.name}
          </button>
        ))}
      </div>

      {entries && entries.length === 0 && (
        <EmptyState>
          ルーティンを選ぶか「種目追加」から
          <br />
          今日のトレーニングを始めましょう
        </EmptyState>
      )}

      {(entries ?? []).map((e) => (
        <ExerciseCard key={e.id} entry={e} exercise={exMap.get(e.exerciseId)} />
      ))}

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(ex) => void addExercise(ex)}
        selectedIds={(entries ?? []).map((e) => e.exerciseId)}
      />
    </div>
  );
}

function ExerciseCard({ entry, exercise }: { entry: WorkoutEntry; exercise?: Exercise }) {
  const prev = usePrevEntry(entry.exerciseId, entry.date);
  const name = exercise?.name ?? '削除済み種目';

  // 連続入力時に古いentryスナップショットで上書きしないよう、DB上の現在値に対して更新する
  const mutateSets = (fn: (sets: WorkoutSet[]) => WorkoutSet[]) =>
    db.workouts
      .where(':id')
      .equals(entry.id!)
      .modify((e) => {
        e.sets = fn(e.sets);
      });

  const addSet = () => {
    void mutateSets((sets) => {
      const last = sets[sets.length - 1] ?? prev?.sets[0] ?? { weightKg: 0, reps: 10 };
      return [...sets, { weightKg: last.weightKg, reps: last.reps, id: newSetId() }];
    });
  };

  const updateSet = (id: string, patch: Partial<WorkoutSet>) => {
    void mutateSets((sets) => sets.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSet = (id: string) => {
    void mutateSets((sets) => sets.filter((s) => s.id !== id));
  };

  const copyPrev = () => {
    if (prev) void mutateSets(() => prev.sets.map((s) => ({ ...s, id: newSetId() })));
  };

  const removeEntry = () => {
    if (window.confirm(`「${name}」のこの日の記録を削除しますか?`)) {
      void db.workouts.delete(entry.id!);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-extrabold tracking-tight">{name}</h3>
          {exercise && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
              {exercise.bodyPart}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={removeEntry}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition active:bg-slate-100"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {prev && (
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs font-semibold text-slate-400 tabular-nums">
            前回 {fmtMD(prev.date)}・
            {prev.sets.map((s) => `${fmtWeight(s.weightKg)}×${s.reps}`).join(' / ')}
          </p>
          {entry.sets.length === 0 && (
            <button
              type="button"
              onClick={copyPrev}
              className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 transition active:scale-95"
            >
              <Copy size={11} />
              コピー
            </button>
          )}
        </div>
      )}

      {entry.sets.length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <span className="w-4" />
          <span className="w-[120px] text-center">重量 (kg)</span>
          <span className="w-3" />
          <span className="w-[108px] text-center">回数</span>
        </div>
      )}

      <div className="mt-1 space-y-2">
        {entry.sets.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <span className="w-4 text-center text-xs font-bold text-slate-400 tabular-nums">
              {i + 1}
            </span>
            <Stepper wide value={s.weightKg} onChange={(n) => updateSet(s.id, { weightKg: n })} step={2.5} />
            <span className="text-slate-300">×</span>
            <Stepper
              value={s.reps}
              onChange={(n) => updateSet(s.id, { reps: Math.round(n) })}
              step={1}
            />
            <button
              type="button"
              onClick={() => removeSet(s.id)}
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-slate-300 transition active:bg-slate-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSet}
        className="mt-3 w-full rounded-xl border-2 border-dashed border-slate-200 py-2 text-sm font-bold text-slate-400 transition active:bg-slate-50"
      >
        ＋ セット追加
      </button>
    </Card>
  );
}
