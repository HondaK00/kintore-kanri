import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Pencil, Trash2 } from 'lucide-react';
import { db, type Food } from '../../db/db';
import { fmtKcal } from '../../lib/calc';
import { EmptyState, PrimaryButton } from '../ui';
import { Sheet } from '../Sheet';
import { NumberText, PFCInputs } from '../inputs';

export function FoodManager() {
  const foods = useLiveQuery(() => db.foods.orderBy('useCount').reverse().toArray());
  const [editing, setEditing] = useState<Food | null>(null);

  const remove = (f: Food) => {
    if (window.confirm(`「${f.name}」を削除しますか?（過去の食事記録は残ります）`)) {
      void db.foods.delete(f.id!);
    }
  };

  if (foods && foods.length === 0) {
    return (
      <EmptyState>
        マイ食品がありません。
        <br />
        食事タブの「新規入力」から追加すると、ここに保存されます。
      </EmptyState>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="divide-y divide-slate-50">
        {(foods ?? []).map((f) => (
          <div key={f.id} className="flex items-center gap-2 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{f.name}</p>
              <p className="text-[10px] font-bold text-slate-400 tabular-nums">
                {fmtKcal(f.kcal)} kcal ／ P {Math.round(f.protein)} ／ F {Math.round(f.fat)} ／ C{' '}
                {Math.round(f.carbs)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(f)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition active:bg-slate-100"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => remove(f)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-300 transition active:bg-rose-50 active:text-rose-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      {editing && <FoodEditSheet key={editing.id} food={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function FoodEditSheet({ food, onClose }: { food: Food; onClose: () => void }) {
  const [name, setName] = useState(food.name);
  const [kcal, setKcal] = useState<number | null>(food.kcal);
  const [protein, setProtein] = useState<number | null>(food.protein);
  const [fat, setFat] = useState<number | null>(food.fat);
  const [carbs, setCarbs] = useState<number | null>(food.carbs);

  const save = async () => {
    if (!name.trim()) return;
    await db.foods.update(food.id!, {
      name: name.trim(),
      kcal: kcal ?? 0,
      protein: protein ?? 0,
      fat: fat ?? 0,
      carbs: carbs ?? 0,
    });
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title="マイ食品を編集">
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-bold text-slate-500">品名</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none focus:border-emerald-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-slate-500">カロリー (kcal)</span>
          <NumberText nullable value={kcal} onCommit={setKcal} className="mt-1 w-full" />
        </label>
        <PFCInputs
          protein={protein}
          fat={fat}
          carbs={carbs}
          onProtein={setProtein}
          onFat={setFat}
          onCarbs={setCarbs}
        />
        <PrimaryButton onClick={() => void save()} disabled={!name.trim()} className="w-full">
          保存する
        </PrimaryButton>
      </div>
    </Sheet>
  );
}
