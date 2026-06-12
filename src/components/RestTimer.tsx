import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Minus, Plus, Timer, X } from 'lucide-react';
import {
  adjustRest,
  fmtSec,
  getRemainingSec,
  getRestState,
  isAutoStart,
  setAutoStart,
  startRest,
  stopRest,
  subscribeRest,
} from '../lib/restTimer';
import { Sheet } from './Sheet';

const PRESETS = [60, 90, 120, 150, 180, 300];

/** 休憩終了の合図（バイブ＋短いビープ×3）。失敗しても無視 */
function notifyFinished() {
  try {
    navigator.vibrate?.([200, 100, 200, 100, 400]);
  } catch {
    /* noop */
  }
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      const t = ctx.currentTime + i * 0.25;
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.start(t);
      osc.stop(t + 0.2);
    }
    setTimeout(() => void ctx.close(), 1200);
  } catch {
    /* noop */
  }
}

/** レストタイマーのフローティングUI。activeなタブ(筋トレ)または実行中に表示 */
export function RestTimer({ visible }: { visible: boolean }) {
  const state = useSyncExternalStore(subscribeRest, getRestState);
  const [open, setOpen] = useState(false);
  const [, setTick] = useState(0);
  const [autoOn, setAutoOn] = useState(isAutoStart());
  const finishedRef = useRef(false);

  const running = state.endsAt != null;
  const remaining = getRemainingSec();

  // 実行中は250msごとに再描画
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [running]);

  // 終了検知
  useEffect(() => {
    if (running && remaining === 0 && !finishedRef.current) {
      finishedRef.current = true;
      notifyFinished();
      stopRest();
      setTimeout(() => {
        finishedRef.current = false;
      }, 500);
    }
  }, [running, remaining]);

  if (!visible && !running) return null;

  return (
    <>
      {/* フローティングボタン（タブバーの上） */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+72px)] z-30 mx-auto flex max-w-md justify-end px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`pointer-events-auto flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-extrabold shadow-lg transition active:scale-95 ${
            running ? 'bg-emerald-600 text-white shadow-emerald-600/30' : 'bg-slate-900 text-white shadow-slate-900/25'
          }`}
          aria-label="レストタイマー"
        >
          <Timer size={16} />
          {running && remaining != null ? <span className="tabular-nums">{fmtSec(remaining)}</span> : 'レスト'}
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="レストタイマー">
        {running && remaining != null ? (
          <div className="space-y-4">
            <p className="text-center text-6xl font-extrabold tracking-tight tabular-nums">
              {fmtSec(remaining)}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min(100, (remaining / state.durationSec) * 100)}%` }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => adjustRest(-30)}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition active:scale-95"
              >
                <Minus size={15} />
                30秒
              </button>
              <button
                type="button"
                onClick={() => adjustRest(30)}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition active:scale-95"
              >
                <Plus size={15} />
                30秒
              </button>
              <button
                type="button"
                onClick={() => stopRest()}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-rose-50 py-3 text-sm font-bold text-rose-500 transition active:scale-95"
              >
                <X size={15} />
                終了
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    startRest(sec);
                  }}
                  className={`rounded-xl py-3 text-base font-extrabold tabular-nums transition active:scale-95 ${
                    sec === state.durationSec
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {fmtSec(sec)}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={autoOn}
                onChange={(e) => {
                  setAutoOn(e.target.checked);
                  setAutoStart(e.target.checked);
                }}
                className="h-4 w-4 accent-emerald-600"
              />
              <span className="text-sm font-semibold text-slate-600">
                セット追加時に自動でスタート（前回の長さ）
              </span>
            </label>
            <p className="text-[11px] font-semibold text-slate-400">
              タイマー終了時はバイブと音でお知らせします。アプリ版では画面ロック中も通知が届きます。
            </p>
          </div>
        )}
      </Sheet>
    </>
  );
}
