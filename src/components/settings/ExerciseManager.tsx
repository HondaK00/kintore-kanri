import { useState } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { db, type BodyPart, type Exercise } from '../../db/db';
import { BODY_PARTS } from '../../db/presets';
import { hasManualMuscles, MUSCLE_LABELS, resolveMuscles } from '../../db/muscles';
import { useExercises } from '../../lib/hooks';
import { deleteExercise } from '../../lib/repo';
import { Card, PrimaryButton } from '../ui';
import { ExerciseEditorSheet } from '../MuscleEditor';

export function ExerciseManager() {
  const exercises = useExercises();
  const [name, setName] = useState('');
  const [part, setPart] = useState<BodyPart>('胸');
  const [editing, setEditing] = useState<Exercise | null>(null);

  const add = async () => {
    const n = name.trim();
    if (!n) return;
    await db.exercises.add({ name: n, bodyPart: part, isPreset: false });
    setName('');
  };

  const remove = async (e: Exercise) => {
    const count = await db.workouts.where('exerciseId').equals(e.id!).count();
    const msg =
      count > 0
        ? `「${e.name}」には${count}日分の記録があります。削除すると記録表などで種目名が表示されなくなります。削除しますか?`
        : `「${e.name}」を削除しますか?`;
    if (window.confirm(msg)) await deleteExercise(e.id!);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-sm font-extrabold text-slate-700">カスタム種目を追加</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="種目名（例: ハックスクワット）"
          className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none focus:border-emerald-500"
        />
        <div className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto">
          {BODY_PARTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPart(p)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
                part === p ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <PrimaryButton onClick={() => void add()} disabled={!name.trim()} className="mt-3 w-full">
          追加する
        </PrimaryButton>
      </Card>

      {BODY_PARTS.map((p) => {
        const list = (exercises ?? []).filter((e) => e.bodyPart === p);
        if (list.length === 0) return null;
        return (
          <section key={p} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
            <h3 className="px-4 pt-3 pb-1 text-xs font-extrabold text-slate-400">{p}</h3>
            <div className="divide-y divide-slate-50">
              {list.map((e) => {
                const m = resolveMuscles(e);
                return (
                  <div key={e.id} className="flex items-center gap-1 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setEditing(e)}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1.5 text-left transition active:bg-slate-50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="text-sm font-semibold">
                          {e.name}
                          {!e.isPreset && (
                            <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                              追加
                            </span>
                          )}
                          {hasManualMuscles(e) && (
                            <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                              カスタム
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-[11px] font-bold text-slate-400">
                          {m.primary.map((x) => MUSCLE_LABELS[x]).join('・') || '対象筋なし'}
                        </span>
                      </span>
                      <ChevronRight size={15} className="shrink-0 text-slate-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(e)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-300 transition active:bg-rose-50 active:text-rose-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {editing && (
        <ExerciseEditorSheet key={editing.id} exercise={editing} open onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
