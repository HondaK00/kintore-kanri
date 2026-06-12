import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { db, type BodyPart, type Exercise } from '../db/db';
import { BODY_PARTS } from '../db/presets';
import { MUSCLE_GROUPS, MUSCLE_LABELS, resolveMuscles, type Muscle } from '../db/muscles';
import { Sheet } from './Sheet';
import { MuscleMap } from './MuscleMap';
import { PrimaryButton } from './ui';

type State = 'off' | 'primary' | 'secondary';

const eqSet = (a: Muscle[], b: Muscle[]) => a.length === b.length && a.every((x) => b.includes(x));

interface Props {
  exercise: Exercise;
  open: boolean;
  onClose: () => void;
}

/** 種目を編集するシート: 名前・部位の変更と、対象筋(主働筋/協働筋)の手動設定 */
export function ExerciseEditorSheet({ exercise, open, onClose }: Props) {
  const initial = resolveMuscles(exercise);
  const [name, setName] = useState(exercise.name);
  const [bodyPart, setBodyPart] = useState<BodyPart>(exercise.bodyPart);
  const [primary, setPrimary] = useState<Muscle[]>(initial.primary);
  const [secondary, setSecondary] = useState<Muscle[]>(initial.secondary);

  const stateOf = (m: Muscle): State =>
    primary.includes(m) ? 'primary' : secondary.includes(m) ? 'secondary' : 'off';

  const cycle = (m: Muscle) => {
    const s = stateOf(m);
    if (s === 'off') {
      setPrimary((p) => [...p, m]);
    } else if (s === 'primary') {
      setPrimary((p) => p.filter((x) => x !== m));
      setSecondary((p) => [...p, m]);
    } else {
      setSecondary((p) => p.filter((x) => x !== m));
    }
  };

  // 現在の名前・部位での内蔵マッピング（プリセット名 or 部位デフォルト）
  const builtIn = resolveMuscles({ name: name.trim(), bodyPart, targetMuscles: null });

  const resetMuscles = () => {
    setPrimary(builtIn.primary);
    setSecondary(builtIn.secondary);
  };

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed || primary.length === 0) return;
    // 選んだ対象筋が内蔵設定と同じなら自動扱い(null)、違えば手動設定として保存。
    // プリセットをリネームした場合は内蔵マップが外れるので、ここで自動的にスナップショットされる。
    const isBuiltIn = eqSet(primary, builtIn.primary) && eqSet(secondary, builtIn.secondary);
    await db.exercises.update(exercise.id!, {
      name: trimmed,
      bodyPart,
      targetMuscles: isBuiltIn ? null : { primary, secondary },
    });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="種目を編集">
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-bold text-slate-500">種目名</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none focus:border-emerald-500"
          />
        </label>
        <div>
          <span className="text-xs font-bold text-slate-500">部位</span>
          <div className="no-scrollbar mt-1 flex gap-1.5 overflow-x-auto">
            {BODY_PARTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setBodyPart(p)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
                  bodyPart === p ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center rounded-2xl bg-slate-50 py-3">
        <MuscleMap primary={primary} secondary={secondary} height={170} />
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-400">
        筋肉をタップで切り替え：<span className="text-emerald-600">主に効く</span> →{' '}
        <span className="text-emerald-400">補助的に</span> → なし
      </p>

      <div className="mt-2 space-y-3">
        {MUSCLE_GROUPS.map((g) => (
          <div key={g.label}>
            <p className="mb-1 text-[11px] font-bold text-slate-400">{g.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {g.muscles.map((m) => {
                const s = stateOf(m);
                const cls =
                  s === 'primary'
                    ? 'bg-emerald-600 text-white'
                    : s === 'secondary'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500';
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => cycle(m)}
                    className={`rounded-full px-3 py-1.5 text-sm font-bold transition active:scale-95 ${cls}`}
                  >
                    {MUSCLE_LABELS[m]}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={resetMuscles}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-bold text-slate-500 transition active:bg-slate-50"
        >
          <RotateCcw size={15} />
          内蔵に戻す
        </button>
        <PrimaryButton onClick={() => void save()} disabled={!name.trim() || primary.length === 0} className="flex-1">
          保存する
        </PrimaryButton>
      </div>
      {primary.length === 0 && (
        <p className="mt-2 text-center text-xs font-semibold text-slate-400">
          主に効く筋肉を1つ以上選んでください
        </p>
      )}
    </Sheet>
  );
}
