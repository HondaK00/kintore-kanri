import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { db, type Exercise } from '../db/db';
import {
  MUSCLE_GROUPS,
  MUSCLE_LABELS,
  hasManualMuscles,
  resolveMuscles,
  type Muscle,
} from '../db/muscles';
import { Sheet } from './Sheet';
import { MuscleMap } from './MuscleMap';
import { PrimaryButton } from './ui';

type State = 'off' | 'primary' | 'secondary';

interface Props {
  exercise: Exercise;
  open: boolean;
  onClose: () => void;
}

/** 種目の対象筋を手動で設定するエディタ。タップで「なし→主働筋→協働筋→なし」を循環 */
export function MuscleEditorSheet({ exercise, open, onClose }: Props) {
  const initial = resolveMuscles(exercise);
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

  const save = async () => {
    await db.exercises.update(exercise.id!, {
      targetMuscles: primary.length > 0 ? { primary, secondary } : null,
    });
    onClose();
  };

  const resetToBuiltIn = async () => {
    await db.exercises.update(exercise.id!, { targetMuscles: null });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={`${exercise.name}の対象筋`}>
      <div className="flex justify-center rounded-2xl bg-slate-50 py-3">
        <MuscleMap primary={primary} secondary={secondary} height={180} />
      </div>

      <p className="mt-3 text-xs font-semibold text-slate-400">
        筋肉をタップで切り替え：
        <span className="text-emerald-600">主に効く</span> →{' '}
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
        {(hasManualMuscles(exercise) || !exercise.isPreset) && (
          <button
            type="button"
            onClick={() => void resetToBuiltIn()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-bold text-slate-500 transition active:bg-slate-50"
          >
            <RotateCcw size={15} />
            内蔵に戻す
          </button>
        )}
        <PrimaryButton onClick={() => void save()} disabled={primary.length === 0} className="flex-1">
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
