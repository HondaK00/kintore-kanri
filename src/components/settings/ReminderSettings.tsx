import { useState } from 'react';
import { Bell } from 'lucide-react';
import { isNative } from '../../native/bridge';
import { cancelReminder, scheduleDailyReminder } from '../../native/notifications';
import { getReminder, setReminder, type ReminderConfig } from '../../lib/reminder';
import { Card } from '../ui';

export function ReminderSettings() {
  const [cfg, setCfg] = useState<ReminderConfig>(getReminder());
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);

  const apply = async (next: ReminderConfig) => {
    setCfg(next);
    setReminder(next);
    setDenied(false);
    if (!isNative()) return;
    setBusy(true);
    try {
      if (next.enabled) {
        const ok = await scheduleDailyReminder(next.hour, next.minute);
        if (!ok) {
          setDenied(true);
          const reverted = { ...next, enabled: false };
          setCfg(reverted);
          setReminder(reverted);
        }
      } else {
        await cancelReminder();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Bell size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-slate-700">トレーニングのリマインダー</h2>
            <button
              type="button"
              disabled={busy}
              onClick={() => void apply({ ...cfg, enabled: !cfg.enabled })}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                cfg.enabled ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
              aria-label="リマインダーの切替"
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  cfg.enabled ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            毎日決まった時間に「記録しましょう」と通知します。
          </p>

          {cfg.enabled && (
            <label className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="text-sm font-bold text-slate-600">通知する時刻</span>
              <input
                type="time"
                value={`${String(cfg.hour).padStart(2, '0')}:${String(cfg.minute).padStart(2, '0')}`}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(':').map(Number);
                  if (Number.isInteger(h) && Number.isInteger(m)) void apply({ ...cfg, hour: h, minute: m });
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-base font-bold tabular-nums outline-none focus:border-emerald-500"
              />
            </label>
          )}

          {denied && (
            <p className="mt-2 text-xs font-semibold text-amber-500">
              通知が許可されていません。端末の設定アプリから通知を許可してください。
            </p>
          )}
          {!isNative() && (
            <p className="mt-2 text-[11px] font-semibold text-slate-400">
              ※ 通知の配信はスマホアプリ版でご利用いただけます（設定はこのまま引き継がれます）。
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
