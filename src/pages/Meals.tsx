import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, Plus } from 'lucide-react';
import { db, MEAL_TYPES, type Food, type MealLog, type MealType } from '../db/db';
import { useProfile } from '../lib/hooks';
import { fmtKcal } from '../lib/calc';
import { DateNav } from '../components/DateNav';
import { Sheet } from '../components/Sheet';
import { Segmented } from '../components/Segmented';
import { NumberText, PFCInputs } from '../components/inputs';
import { Card, PrimaryButton } from '../components/ui';

interface Props {
  date: string;
  onDateChange: (d: string) => void;
}

export default function MealsPage({ date, onDateChange }: Props) {
  const profile = useProfile();
  const logs = useLiveQuery(() => db.mealLogs.where('date').equals(date).sortBy('id'), [date]);
  const [addTarget, setAddTarget] = useState<MealType | null>(null);
  const [editing, setEditing] = useState<MealLog | null>(null);

  const totals = (logs ?? []).reduce(
    (a, m) => ({
      kcal: a.kcal + m.kcal,
      protein: a.protein + m.protein,
      fat: a.fat + m.fat,
      carbs: a.carbs + m.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
  const target = profile?.targetKcal ?? null;

  return (
    <div className="space-y-4">
      <DateNav date={date} onChange={onDateChange} />

      <Card>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">摂取カロリー</p>
            <p className="mt-0.5 text-3xl font-extrabold tracking-tight tabular-nums">
              {fmtKcal(totals.kcal)}
              <span className="ml-1 text-sm font-bold text-slate-400">kcal</span>
            </p>
          </div>
          {target != null && (
            <p className="text-right text-xs font-semibold text-slate-400 tabular-nums">
              目標 {fmtKcal(target)} kcal
              <br />
              残り {fmtKcal(Math.max(0, target - totals.kcal))} kcal
            </p>
          )}
        </div>
        <div className="mt-3 flex gap-4 text-xs font-bold tabular-nums">
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-rose-500" />P {Math.round(totals.protein)}g
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-amber-500" />F {Math.round(totals.fat)}g
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-blue-500" />C {Math.round(totals.carbs)}g
          </span>
        </div>
      </Card>

      {MEAL_TYPES.map((mt) => (
        <MealSection
          key={mt.value}
          label={mt.label}
          items={(logs ?? []).filter((l) => l.mealType === mt.value)}
          onAdd={() => setAddTarget(mt.value)}
          onEdit={setEditing}
        />
      ))}

      <AddFoodSheet key={addTarget ?? 'closed'} date={date} mealType={addTarget} onClose={() => setAddTarget(null)} />
      {editing && <EditLogSheet key={editing.id} log={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function MealSection({
  label,
  items,
  onAdd,
  onEdit,
}: {
  label: string;
  items: MealLog[];
  onAdd: () => void;
  onEdit: (l: MealLog) => void;
}) {
  const total = items.reduce((s, m) => s + m.kcal, 0);
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="flex items-baseline justify-between px-4 pt-3 pb-2">
        <h2 className="text-sm font-extrabold text-slate-700">{label}</h2>
        {items.length > 0 && (
          <span className="text-sm font-bold tabular-nums">
            {fmtKcal(total)}
            <span className="text-xs font-semibold text-slate-400"> kcal</span>
          </span>
        )}
      </div>
      <div className="divide-y divide-slate-50">
        {items.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onEdit(m)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left transition active:bg-slate-50"
          >
            <span>
              <span className="block text-sm font-semibold">{m.name}</span>
              <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                P {Math.round(m.protein)} ／ F {Math.round(m.fat)} ／ C {Math.round(m.carbs)}
              </span>
            </span>
            <span className="text-sm font-bold tabular-nums">{fmtKcal(m.kcal)}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-1 border-t border-slate-50 py-2.5 text-sm font-bold text-emerald-600 transition active:bg-emerald-50"
      >
        <Plus size={15} />
        追加
      </button>
    </section>
  );
}

function AddFoodSheet({
  date,
  mealType,
  onClose,
}: {
  date: string;
  mealType: MealType | null;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'my' | 'new'>('my');
  const [query, setQuery] = useState('');
  const foods = useLiveQuery(() => db.foods.orderBy('useCount').reverse().toArray());
  const [addedId, setAddedId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [kcal, setKcal] = useState<number | null>(null);
  const [protein, setProtein] = useState<number | null>(null);
  const [fat, setFat] = useState<number | null>(null);
  const [carbs, setCarbs] = useState<number | null>(null);
  const [saveAsFood, setSaveAsFood] = useState(true);

  const label = MEAL_TYPES.find((m) => m.value === mealType)?.label ?? '';
  const filtered = (foods ?? []).filter(
    (f) => !query.trim() || f.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const pickFood = async (f: Food) => {
    // ログ追加とuseCount加算を原子的に行う（連打時の取りこぼし防止）
    await db.transaction('rw', db.mealLogs, db.foods, async () => {
      await db.mealLogs.add({
        date,
        mealType: mealType!,
        name: f.name,
        kcal: f.kcal,
        protein: f.protein,
        fat: f.fat,
        carbs: f.carbs,
      });
      await db.foods
        .where(':id')
        .equals(f.id!)
        .modify((food) => {
          food.useCount += 1;
        });
    });
    setAddedId(f.id!);
    setTimeout(() => setAddedId(null), 900);
  };

  const addNew = async () => {
    if (!name.trim() || kcal == null) return;
    const item = {
      name: name.trim(),
      kcal,
      protein: protein ?? 0,
      fat: fat ?? 0,
      carbs: carbs ?? 0,
    };
    await db.mealLogs.add({ date, mealType: mealType!, ...item });
    if (saveAsFood) {
      const dup = await db.foods.where('name').equals(item.name).first();
      if (!dup) await db.foods.add({ ...item, useCount: 1 });
    }
    setName('');
    setKcal(null);
    setProtein(null);
    setFat(null);
    setCarbs(null);
    onClose();
  };

  return (
    <Sheet open={mealType != null} onClose={onClose} title={`${label}に追加`}>
      <div className="mb-4">
        <Segmented
          options={[
            { value: 'my', label: 'マイ食品' },
            { value: 'new', label: '新規入力' },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>

      {mode === 'my' ? (
        <>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="食品名で検索"
            className="mb-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-base outline-none transition focus:border-emerald-500 focus:bg-white"
          />
          <div className="min-h-40 divide-y divide-slate-100">
            {filtered.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => void pickFood(f)}
                className="flex w-full items-center justify-between py-3 text-left"
              >
                <span>
                  <span className="block text-sm font-semibold">{f.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                    P {Math.round(f.protein)} ／ F {Math.round(f.fat)} ／ C {Math.round(f.carbs)}
                  </span>
                </span>
                <span className="flex items-center gap-2 text-sm font-bold tabular-nums">
                  {fmtKcal(f.kcal)} kcal
                  {addedId === f.id ? (
                    <Check size={18} className="text-emerald-500" />
                  ) : (
                    <Plus size={18} className="text-slate-300" />
                  )}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm leading-relaxed text-slate-400">
                マイ食品がありません。
                <br />
                「新規入力」で追加すると次回から選べます。
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-bold text-slate-500">品名</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 鶏むね肉 100g"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none focus:border-emerald-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">カロリー (kcal)</span>
            <NumberText nullable value={kcal} onCommit={setKcal} placeholder="0" className="mt-1 w-full" />
          </label>
          <PFCInputs
            protein={protein}
            fat={fat}
            carbs={carbs}
            onProtein={setProtein}
            onFat={setFat}
            onCarbs={setCarbs}
            placeholder="0"
          />
          <label className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              checked={saveAsFood}
              onChange={(e) => setSaveAsFood(e.target.checked)}
              className="h-4 w-4 accent-emerald-600"
            />
            <span className="text-sm font-semibold text-slate-600">マイ食品にも保存する</span>
          </label>
          <PrimaryButton onClick={() => void addNew()} disabled={!name.trim() || kcal == null} className="w-full">
            追加する
          </PrimaryButton>
        </div>
      )}
    </Sheet>
  );
}

function EditLogSheet({ log, onClose }: { log: MealLog; onClose: () => void }) {
  const [name, setName] = useState(log.name);
  const [kcal, setKcal] = useState<number | null>(log.kcal);
  const [protein, setProtein] = useState<number | null>(log.protein);
  const [fat, setFat] = useState<number | null>(log.fat);
  const [carbs, setCarbs] = useState<number | null>(log.carbs);

  const save = async () => {
    if (!name.trim()) return;
    await db.mealLogs.update(log.id!, {
      name: name.trim(),
      kcal: kcal ?? 0,
      protein: protein ?? 0,
      fat: fat ?? 0,
      carbs: carbs ?? 0,
    });
    onClose();
  };

  const remove = async () => {
    if (window.confirm(`「${log.name}」を削除しますか?`)) {
      await db.mealLogs.delete(log.id!);
      onClose();
    }
  };

  return (
    <Sheet open onClose={onClose} title="記録を編集">
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
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => void remove()}
            className="rounded-xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-500 transition active:bg-rose-50"
          >
            削除
          </button>
          <PrimaryButton onClick={() => void save()} disabled={!name.trim()} className="flex-1">
            保存する
          </PrimaryButton>
        </div>
      </div>
    </Sheet>
  );
}
