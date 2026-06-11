import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from 'lucide-react';
import { db, type Routine } from '../../db/db';
import { deleteRoutine } from '../../lib/repo';
import { useExerciseMap } from '../../lib/hooks';
import { Card, EmptyState, PrimaryButton } from '../ui';
import { Sheet } from '../Sheet';
import { ExercisePicker } from '../ExercisePicker';

export function RoutineManager() {
  const routines = useLiveQuery(() => db.routines.orderBy('sortOrder').toArray());
  const exMap = useExerciseMap();
  const [editing, setEditing] = useState<Routine | 'new' | null>(null);

  const remove = (r: Routine) => {
    if (window.confirm(`「${r.name}」を削除しますか?（過去の記録は残ります）`)) {
      void deleteRoutine(r.id!);
    }
  };

  return (
    <div className="space-y-3">
      {(routines ?? []).map((r) => (
        <Card key={r.id} className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-extrabold">{r.name}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-400">
              {r.exerciseIds.map((id) => exMap.get(id)?.name ?? '削除済み').join('・') || '種目なし'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(r)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition active:bg-slate-200"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => remove(r)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition active:bg-rose-50 active:text-rose-500"
          >
            <Trash2 size={15} />
          </button>
        </Card>
      ))}

      {routines && routines.length === 0 && (
        <EmptyState>ルーティンがありません。作成しましょう。</EmptyState>
      )}

      <PrimaryButton onClick={() => setEditing('new')} className="w-full">
        <span className="flex items-center justify-center gap-1">
          <Plus size={16} />
          新しいルーティン
        </span>
      </PrimaryButton>

      {editing && (
        <RoutineEditor
          routine={editing === 'new' ? null : editing}
          nextOrder={routines?.length ?? 0}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function RoutineEditor({
  routine,
  nextOrder,
  onClose,
}: {
  routine: Routine | null;
  nextOrder: number;
  onClose: () => void;
}) {
  const exMap = useExerciseMap();
  const [name, setName] = useState(routine?.name ?? '');
  const [ids, setIds] = useState<number[]>(routine?.exerciseIds ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[i], next[j]] = [next[j], next[i]];
    setIds(next);
  };

  const save = async () => {
    const n = name.trim();
    if (!n || ids.length === 0) return;
    if (routine) {
      await db.routines.update(routine.id!, { name: n, exerciseIds: ids });
    } else {
      await db.routines.add({ name: n, exerciseIds: ids, sortOrder: nextOrder });
    }
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title={routine ? 'ルーティンを編集' : '新しいルーティン'}>
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前（例: 胸の日）"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none focus:border-emerald-500"
        />

        <div className="divide-y divide-slate-50 rounded-xl bg-slate-50/60">
          {ids.map((id, i) => (
            <div key={`${id}-${i}`} className="flex items-center gap-1 px-3 py-2">
              <span className="flex-1 text-sm font-semibold">
                {exMap.get(id)?.name ?? '削除済み種目'}
              </span>
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition active:bg-slate-200 disabled:opacity-25"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === ids.length - 1}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition active:bg-slate-200 disabled:opacity-25"
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIds(ids.filter((_, j) => j !== i))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition active:bg-rose-50 active:text-rose-500"
              >
                <X size={15} />
              </button>
            </div>
          ))}
          {ids.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-slate-400">種目を追加してください</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="w-full rounded-xl border-2 border-dashed border-slate-200 py-2.5 text-sm font-bold text-slate-400 transition active:bg-slate-50"
        >
          ＋ 種目を追加
        </button>

        <PrimaryButton onClick={() => void save()} disabled={!name.trim() || ids.length === 0} className="w-full">
          保存する
        </PrimaryButton>
      </div>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(e) => setIds((cur) => (cur.includes(e.id!) ? cur : [...cur, e.id!]))}
        selectedIds={ids}
        title="ルーティンに種目を追加"
      />
    </Sheet>
  );
}
