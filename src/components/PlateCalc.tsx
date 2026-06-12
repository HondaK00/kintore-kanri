import { useState } from 'react';
import { fmtWeight } from '../lib/calc';
import { Sheet } from './Sheet';
import { NumberText } from './inputs';

// バーベルのプレート計算機。目標重量から片側に付けるプレートの組み合わせを算出する。
// Phase3でPro機能としてゲーティング予定。

const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const BARS = [20, 15, 10];

interface PlateRow {
  plate: number;
  count: number;
}

function calcPlates(target: number, bar: number): { rows: PlateRow[]; remainder: number; perSide: number } | null {
  const perSide = (target - bar) / 2;
  if (perSide < 0) return null;
  let rest = perSide;
  const rows: PlateRow[] = [];
  for (const p of PLATES) {
    const c = Math.floor((rest + 1e-9) / p);
    if (c > 0) {
      rows.push({ plate: p, count: c });
      rest = Math.round((rest - c * p) * 100) / 100;
    }
  }
  return { rows, remainder: rest, perSide };
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialWeight?: number;
}

export function PlateCalcSheet({ open, onClose, initialWeight }: Props) {
  const [target, setTarget] = useState<number | null>(initialWeight && initialWeight > 0 ? initialWeight : 60);
  const [bar, setBar] = useState(20);

  const result = target != null && target > 0 ? calcPlates(target, bar) : null;

  return (
    <Sheet open={open} onClose={onClose} title="プレート計算機">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-slate-500">目標重量 (kg)</span>
            <NumberText nullable value={target} onCommit={setTarget} className="mt-1 w-full text-center font-bold" />
          </label>
          <div className="block">
            <span className="text-xs font-bold text-slate-500">バー重量</span>
            <div className="mt-1 flex gap-1.5">
              {BARS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBar(b)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-extrabold tabular-nums transition active:scale-95 ${
                    bar === b ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {b}kg
                </button>
              ))}
            </div>
          </div>
        </div>

        {result == null ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-600">
            目標重量がバー重量より軽いため計算できません
          </p>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-400">
              片側 {fmtWeight(result.perSide)} kg（左右それぞれ）
            </p>
            {result.rows.length === 0 ? (
              <p className="mt-2 text-sm font-bold text-slate-600">プレートなし（バーのみ）</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {result.rows.map((r) => (
                  <span
                    key={r.plate}
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-extrabold text-white tabular-nums"
                  >
                    {fmtWeight(r.plate)}kg × {r.count}
                  </span>
                ))}
              </div>
            )}
            {result.remainder > 0 && (
              <p className="mt-2 text-xs font-semibold text-amber-500">
                端数 {fmtWeight(result.remainder)} kg は標準プレート（最小1.25kg）では作れません。
                実重量: {fmtWeight(bar + (result.perSide - result.remainder) * 2)} kg
              </p>
            )}
          </div>
        )}
        <p className="text-[11px] font-semibold text-slate-400">
          使用プレート: 25 / 20 / 15 / 10 / 5 / 2.5 / 1.25 kg
        </p>
      </div>
    </Sheet>
  );
}
