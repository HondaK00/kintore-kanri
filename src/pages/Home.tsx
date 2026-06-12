import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Settings, ChevronRight, Dumbbell, CloudUpload, CalendarCheck, HeartPulse, X } from 'lucide-react';
import { db } from '../db/db';
import type { Tab } from '../App';
import { useProfile, useLatestBodyLog, useExerciseMap, useRoutines, useWeeklyPlan } from '../lib/hooks';
import { calcDailyBurn, fmtKcal } from '../lib/calc';
import { todayStr, fmtJP, parseDate } from '../lib/date';
import { shouldRemindBackup, daysSinceBackup } from '../lib/backupMeta';
import { getActiveCaloriesForDate, isHealthAvailable, requestHealthPermission } from '../native/health';
import { Card } from '../components/ui';
import { NumberText } from '../components/inputs';
import { upsertBodyLog, upsertActivityLog } from '../lib/repo';

interface Props {
  onOpenSettings: () => void;
  onGoto: (t: Tab) => void;
}

export default function HomePage({ onOpenSettings, onGoto }: Props) {
  const today = todayStr();
  const profile = useProfile();
  const latestBody = useLatestBodyLog();
  const todayBody = useLiveQuery(() => db.bodyLogs.where('date').equals(today).first(), [today]);
  const meals = useLiveQuery(() => db.mealLogs.where('date').equals(today).toArray(), [today]);
  const activity = useLiveQuery(() => db.activityLogs.where('date').equals(today).first(), [today]);
  const todayEntries = useLiveQuery(() => db.workouts.where('date').equals(today).sortBy('id'), [today]);
  const workoutCount = useLiveQuery(() => db.workouts.count(), []);
  const exMap = useExerciseMap();
  const routines = useRoutines();
  const weeklyPlan = useWeeklyPlan();
  const todayPlanId = weeklyPlan.get(parseDate(today).getDay()) ?? null;
  const todayPlanRoutine = todayPlanId != null ? (routines ?? []).find((r) => r.id === todayPlanId) : undefined;

  const [backupDismissed, setBackupDismissed] = useState(false);
  const [healthAvailable, setHealthAvailable] = useState(false);
  const [healthBusy, setHealthBusy] = useState(false);

  useEffect(() => {
    void isHealthAvailable().then(setHealthAvailable);
  }, []);

  const syncHealth = async () => {
    setHealthBusy(true);
    try {
      if (!(await requestHealthPermission())) return;
      const kcal = await getActiveCaloriesForDate(today);
      if (kcal != null && kcal > 0) await upsertActivityLog(today, kcal);
    } finally {
      setHealthBusy(false);
    }
  };

  const now = Date.now();
  // ある程度データが溜まっていて、最後のバックアップから時間が経っていたら催促
  const showBackupReminder =
    !backupDismissed && (workoutCount ?? 0) >= 3 && shouldRemindBackup(now);
  const sinceBackup = daysSinceBackup(now);

  const intake = (meals ?? []).reduce((s, m) => s + m.kcal, 0);
  const protein = (meals ?? []).reduce((s, m) => s + m.protein, 0);
  const fat = (meals ?? []).reduce((s, m) => s + m.fat, 0);
  const carbs = (meals ?? []).reduce((s, m) => s + m.carbs, 0);

  const weight = latestBody?.weightKg ?? profile?.weightKg;
  const burn = profile && weight ? calcDailyBurn(profile, weight, activity?.kcal ?? 0) : null;
  const balance = burn ? Math.round(intake - burn.total) : null;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400">{fmtJP(today)}</p>
          <h1 className="text-2xl font-extrabold tracking-tight">今日の記録</h1>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-900/5 transition active:scale-95"
        >
          <Settings size={20} />
        </button>
      </header>

      {showBackupReminder && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200/70">
          <CloudUpload size={20} className="shrink-0 text-amber-500" />
          <button type="button" onClick={onOpenSettings} className="min-w-0 flex-1 text-left">
            <p className="text-xs font-bold text-amber-900">
              {sinceBackup === null
                ? 'バックアップがまだありません'
                : `前回のバックアップから${sinceBackup}日経過しました`}
            </p>
            <p className="text-[11px] text-amber-700">
              設定 → データ管理 から書き出しておくと安心です
            </p>
          </button>
          <button
            type="button"
            onClick={() => setBackupDismissed(true)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-amber-400 transition active:bg-amber-100"
            aria-label="閉じる"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* カロリー収支ヒーロー */}
      <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-lg shadow-emerald-500/25">
        <p className="text-xs font-bold text-emerald-50/80">今日のカロリー収支</p>
        {burn && balance != null ? (
          <>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-[40px] leading-none font-extrabold tracking-tight tabular-nums">
                {balance > 0 ? '+' : ''}
                {fmtKcal(balance)}
              </span>
              <span className="mb-1 text-sm font-bold">kcal</span>
              <span
                className={`mb-1 ml-auto rounded-full px-2.5 py-1 text-xs font-extrabold ${
                  balance <= 0 ? 'bg-white/20' : 'bg-orange-400/90'
                }`}
              >
                {balance <= 0 ? 'アンダー' : 'オーバー'}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${Math.min(100, (intake / burn.total) * 100)}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-[11px] font-semibold text-emerald-50/90">
              <span>摂取 {fmtKcal(intake)} kcal</span>
              <span>
                消費 {fmtKcal(burn.total)}（代謝 {fmtKcal(burn.metabolism)}＋運動 {fmtKcal(burn.watch)}）
              </span>
            </div>
          </>
        ) : (
          <div className="mt-2">
            <p className="text-sm leading-relaxed font-bold">
              プロフィールを設定すると、基礎代謝から1日の消費カロリーを自動計算して収支を表示します。
            </p>
            <button
              type="button"
              onClick={onOpenSettings}
              className="mt-3 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-emerald-600 transition active:scale-95"
            >
              プロフィールを設定する
            </button>
          </div>
        )}
      </section>

      {/* PFC */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-700">PFCバランス</h2>
          <button
            type="button"
            onClick={() => onGoto('meals')}
            className="flex items-center text-xs font-bold text-emerald-600"
          >
            食事を記録
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="mt-3 space-y-3">
          <MacroBar label="タンパク質" value={protein} target={profile?.targetProtein ?? null} color="#f43f5e" />
          <MacroBar label="脂質" value={fat} target={profile?.targetFat ?? null} color="#f59e0b" />
          <MacroBar label="炭水化物" value={carbs} target={profile?.targetCarbs ?? null} color="#3b82f6" />
        </div>
        {profile && profile.targetKcal != null && (
          <p className="mt-3 text-[11px] font-semibold text-slate-400">
            目標摂取 {fmtKcal(profile.targetKcal)} kcal ／ 残り{' '}
            {fmtKcal(Math.max(0, profile.targetKcal - intake))} kcal
          </p>
        )}
      </Card>

      {/* 今日のトレーニング */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-slate-700">
            <Dumbbell size={16} className="text-emerald-500" />
            今日のトレーニング
          </h2>
          <button
            type="button"
            onClick={() => onGoto('workout')}
            className="flex items-center text-xs font-bold text-emerald-600"
          >
            記録する
            <ChevronRight size={14} />
          </button>
        </div>
        {todayPlanRoutine && (
          <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2">
            <CalendarCheck size={14} className="shrink-0 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">
              今日の予定: {todayPlanRoutine.name}
            </span>
          </div>
        )}
        {todayEntries && todayEntries.length > 0 ? (
          <div className="mt-3 space-y-1.5">
            {todayEntries.map((e) => (
              <div key={e.id} className="flex justify-between gap-2 text-sm">
                <span className="min-w-0 truncate font-semibold">{exMap.get(e.exerciseId)?.name ?? '削除済み種目'}</span>
                <span className="shrink-0 text-slate-400 tabular-nums">{e.sets.length}セット</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">
            {todayPlanRoutine ? '「記録する」から予定のメニューを始めましょう 💪' : 'まだ記録がありません。今日も頑張りましょう 💪'}
          </p>
        )}
      </Card>

      {/* クイック記録 */}
      <Card>
        <h2 className="text-sm font-extrabold text-slate-700">クイック記録</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-[11px] font-bold text-slate-400">体重 (kg)</span>
            <NumberText
              nullable
              value={todayBody?.weightKg ?? null}
              onCommit={(n) => {
                if (n != null && n > 0) void upsertBodyLog(today, { weightKg: n });
              }}
              placeholder={weight ? String(weight) : '--'}
              className="mt-1 w-full text-center font-bold"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-slate-400">体脂肪率 (%)</span>
            <NumberText
              nullable
              value={todayBody?.bodyFatPct ?? null}
              onCommit={(n) => {
                if (n != null) void upsertBodyLog(today, { bodyFatPct: n });
              }}
              placeholder="--"
              className="mt-1 w-full text-center font-bold"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-slate-400">運動消費 (kcal)</span>
            <NumberText
              nullable
              value={activity?.kcal ?? null}
              onCommit={(n) => {
                if (n != null) void upsertActivityLog(today, Math.round(n));
              }}
              placeholder="--"
              className="mt-1 w-full text-center font-bold"
            />
          </label>
        </div>
        {healthAvailable && (
          <button
            type="button"
            onClick={() => void syncHealth()}
            disabled={healthBusy}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition active:scale-[0.98] disabled:opacity-50"
          >
            <HeartPulse size={16} />
            {healthBusy ? '取得中…' : 'ヘルスから運動消費を取得'}
          </button>
        )}
        <p className="mt-2 text-[11px] text-slate-400">
          入力すると自動で保存されます。運動消費はスマートウォッチ等の実測値を入力してください。
        </p>
      </Card>
    </div>
  );
}

function MacroBar({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number | null;
  color: string;
}) {
  const pct = target ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-bold text-slate-500">{label}</span>
        <span className="text-sm font-bold tabular-nums">
          {Math.round(value)}
          <span className="text-xs font-semibold text-slate-400">
            {target != null ? ` / ${target} g` : ' g'}
          </span>
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
