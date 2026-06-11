import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { db, type BodyPart, type Exercise } from '../db/db';
import { BODY_PARTS } from '../db/presets';
import { useExercises } from '../lib/hooks';
import { Sheet } from './Sheet';
import { PrimaryButton } from './ui';

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (e: Exercise) => void;
  selectedIds?: number[];
  title?: string;
}

/** 種目を検索・部位で絞り込んで選ぶシート。カスタム種目の作成も可能 */
export function ExercisePicker({ open, onClose, onPick, selectedIds = [], title = '種目を追加' }: Props) {
  const exercises = useExercises();
  const [query, setQuery] = useState('');
  const [part, setPart] = useState<BodyPart | 'all'>('all');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPart, setNewPart] = useState<BodyPart>('胸');

  const filtered = (exercises ?? []).filter(
    (e) =>
      (part === 'all' || e.bodyPart === part) &&
      (!query.trim() || e.name.toLowerCase().includes(query.trim().toLowerCase())),
  );

  const createAndPick = async () => {
    const name = newName.trim();
    if (!name) return;
    const id = await db.exercises.add({ name, bodyPart: newPart, isPreset: false });
    onPick({ id, name, bodyPart: newPart, isPreset: false });
    setNewName('');
    setShowNew(false);
  };

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="種目名で検索"
        className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-base outline-none transition focus:border-emerald-500 focus:bg-white"
      />

      <div className="no-scrollbar -mx-5 mb-3 flex gap-1.5 overflow-x-auto px-5">
        {(['all', ...BODY_PARTS] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPart(p)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
              part === p ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {p === 'all' ? 'すべて' : p}
          </button>
        ))}
      </div>

      <div className="min-h-48 divide-y divide-slate-100">
        {filtered.map((e) => {
          const added = selectedIds.includes(e.id!);
          return (
            <button
              key={e.id}
              type="button"
              disabled={added}
              onClick={() => onPick(e)}
              className="flex w-full items-center justify-between py-3 text-left disabled:opacity-40"
            >
              <span className="text-sm font-semibold">{e.name}</span>
              <span className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                  {e.bodyPart}
                </span>
                {added ? (
                  <Check size={18} className="text-emerald-500" />
                ) : (
                  <Plus size={18} className="text-slate-300" />
                )}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">該当する種目がありません</p>
        )}
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        {showNew ? (
          <div className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="種目名（例: ハックスクワット）"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base outline-none focus:border-emerald-500"
            />
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {BODY_PARTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPart(p)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
                    newPart === p ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <PrimaryButton onClick={createAndPick} disabled={!newName.trim()} className="w-full">
              作成して追加
            </PrimaryButton>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="w-full rounded-xl border-2 border-dashed border-slate-200 py-2.5 text-sm font-bold text-slate-400 transition active:bg-slate-50"
          >
            ＋ カスタム種目を作成
          </button>
        )}
      </div>
    </Sheet>
  );
}
