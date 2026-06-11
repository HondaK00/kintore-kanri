import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { db, type WorkoutEntry } from '../db/db';
import { useExerciseMap, useProfile } from '../lib/hooks';
import { calcBMR, est1RM, fmtKcal, fmtWeight, round1 } from '../lib/calc';
import { addDays, fmtJP, fmtMD, todayStr } from '../lib/date';
import { Card, EmptyState } from '../components/ui';
import { Segmented } from '../components/Segmented';

type StatTab = 'weight' | 'exercise' | 'calorie';

const AXIS_TICK = { fontSize: 10, fill: '#94a3b8' };

export default function StatsPage() {
  const [tab, setTab] = useState<StatTab>('weight');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold tracking-tight">分析</h1>
      <Segmented
        options={[
          { value: 'weight', label: '体重' },
          { value: 'exercise', label: '種目' },
          { value: 'calorie', label: 'カロリー' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'weight' && <WeightSection />}
      {tab === 'exercise' && <ExerciseSection />}
      {tab === 'calorie' && <CalorieSection />}
    </div>
  );
}

function PeriodChips<T extends { label: string }>({
  periods,
  value,
  onChange,
}: {
  periods: T[];
  value: T;
  onChange: (p: T) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {periods.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => onChange(p)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
            p.label === value.label ? 'bg-slate-900 text-white' : 'bg-slate-200/60 text-slate-500'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-center">
      <p className="text-[10px] font-bold text-slate-400">{label}</p>
      <p className="text-sm font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

const WEIGHT_PERIODS = [
  { label: '1ヶ月', days: 30 },
  { label: '3ヶ月', days: 90 },
  { label: '1年', days: 365 },
  { label: '全て', days: 0 },
];

function WeightSection() {
  const profile = useProfile();
  const logs = useLiveQuery(() => db.bodyLogs.orderBy('date').toArray());
  const [period, setPeriod] = useState(WEIGHT_PERIODS[0]);

  const data = useMemo(() => {
    const from = period.days ? addDays(todayStr(), -period.days) : '';
    return (logs ?? [])
      .filter((l) => l.date >= from)
      .map((l) => ({ date: l.date, 体重: l.weightKg, 体脂肪率: l.bodyFatPct ?? undefined }));
  }, [logs, period]);

  const hasFat = data.some((d) => d.体脂肪率 != null);
  const latest = data[data.length - 1];
  const diff = data.length >= 2 ? round1(latest.体重 - data[0].体重) : null;

  if (!logs || logs.length === 0) {
    return (
      <EmptyState>
        体重の記録がありません。
        <br />
        ホームのクイック記録から入力しましょう。
      </EmptyState>
    );
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-slate-700">体重・体脂肪率</h2>
        <PeriodChips periods={WEIGHT_PERIODS} value={period} onChange={setPeriod} />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" tickFormatter={fmtMD} tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis yAxisId="w" domain={['auto', 'auto']} tick={AXIS_TICK} tickLine={false} axisLine={false} />
          {hasFat && (
            <YAxis
              yAxisId="f"
              orientation="right"
              domain={['auto', 'auto']}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={32}
            />
          )}
          <Tooltip labelFormatter={(d) => fmtJP(String(d))} />
          <Line yAxisId="w" type="monotone" dataKey="体重" unit=" kg" stroke="#10b981" strokeWidth={2.5} dot={false} />
          {hasFat && (
            <Line
              yAxisId="f"
              type="monotone"
              dataKey="体脂肪率"
              unit=" %"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          )}
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 flex gap-2">
        <StatChip label="現在" value={latest ? `${latest.体重} kg` : '--'} />
        <StatChip label="期間変化" value={diff != null ? `${diff > 0 ? '+' : ''}${diff} kg` : '--'} />
        {profile?.targetWeightKg != null && latest && (
          <StatChip label="目標まで" value={`${round1(latest.体重 - profile.targetWeightKg)} kg`} />
        )}
      </div>
    </Card>
  );
}

function ExerciseSection() {
  const exMap = useExerciseMap();
  const usedIds = useLiveQuery(async () => {
    const keys = await db.workouts.orderBy('exerciseId').uniqueKeys();
    return keys as number[];
  });
  const [exId, setExId] = useState<number | null>(null);

  useEffect(() => {
    if (exId == null && usedIds && usedIds.length > 0) setExId(usedIds[0]);
  }, [usedIds, exId]);

  const entries = useLiveQuery(
    () =>
      exId != null
        ? db.workouts.where('exerciseId').equals(exId).sortBy('date')
        : Promise.resolve([] as WorkoutEntry[]),
    [exId],
  );

  const data = useMemo(
    () =>
      (entries ?? [])
        .filter((e) => e.sets.length > 0)
        .map((e) => ({
          date: e.date,
          トップ重量: Math.max(...e.sets.map((s) => s.weightKg)),
          推定1RM: Math.max(...e.sets.map((s) => est1RM(s.weightKg, s.reps))),
        })),
    [entries],
  );

  if (usedIds && usedIds.length === 0) {
    return (
      <EmptyState>
        トレーニング記録がありません。
        <br />
        筋トレタブから記録を始めましょう。
      </EmptyState>
    );
  }

  const bestTop = data.length ? Math.max(...data.map((d) => d.トップ重量)) : null;
  const bestOrm = data.length ? Math.max(...data.map((d) => d.推定1RM)) : null;

  return (
    <Card>
      <select
        value={exId ?? ''}
        onChange={(e) => setExId(Number(e.target.value))}
        className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-emerald-500"
      >
        {(usedIds ?? []).map((id) => (
          <option key={id} value={id}>
            {exMap.get(id)?.name ?? '削除済み種目'}
          </option>
        ))}
      </select>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" tickFormatter={fmtMD} tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis domain={['auto', 'auto']} tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <Tooltip labelFormatter={(d) => fmtJP(String(d))} />
          <Line type="monotone" dataKey="トップ重量" unit=" kg" stroke="#10b981" strokeWidth={2.5} dot={{ r: 2.5 }} />
          <Line
            type="monotone"
            dataKey="推定1RM"
            unit=" kg"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 flex gap-2">
        <StatChip label="トップ重量ベスト" value={bestTop != null ? `${fmtWeight(bestTop)} kg` : '--'} />
        <StatChip label="推定1RMベスト" value={bestOrm != null ? `${round1(bestOrm)} kg` : '--'} />
      </div>
      <p className="mt-2 text-[10px] font-semibold text-slate-400">
        推定1RMはEpley式（重量 × (1 + 回数 ÷ 30)）で算出
      </p>
    </Card>
  );
}

const CAL_PERIODS = [
  { label: '2週間', days: 14 },
  { label: '1ヶ月', days: 30 },
  { label: '3ヶ月', days: 90 },
];

function CalorieSection() {
  const profile = useProfile();
  const [period, setPeriod] = useState(CAL_PERIODS[0]);
  const today = todayStr();
  const from = addDays(today, -(period.days - 1));

  const meals = useLiveQuery(
    () => db.mealLogs.where('date').between(from, today, true, true).toArray(),
    [from, today],
  );
  const acts = useLiveQuery(
    () => db.activityLogs.where('date').between(from, today, true, true).toArray(),
    [from, today],
  );
  const bodyLogs = useLiveQuery(() => db.bodyLogs.orderBy('date').toArray(), []);

  const data = useMemo(() => {
    const intakeMap = new Map<string, number>();
    for (const m of meals ?? []) intakeMap.set(m.date, (intakeMap.get(m.date) ?? 0) + m.kcal);
    const actMap = new Map((acts ?? []).map((a) => [a.date, a.kcal]));
    const logs = bodyLogs ?? [];

    const weightOn = (date: string): number | undefined => {
      for (let i = logs.length - 1; i >= 0; i--) {
        if (logs[i].date <= date) return logs[i].weightKg;
      }
      return profile?.weightKg;
    };

    const rows: { date: string; 摂取: number; 消費: number }[] = [];
    for (let d = from; d <= today; d = addDays(d, 1)) {
      const w = weightOn(d);
      const metabolism = profile && w ? Math.round(calcBMR(profile, w) * profile.activityLevel) : 0;
      rows.push({
        date: d,
        摂取: Math.round(intakeMap.get(d) ?? 0),
        消費: metabolism + (actMap.get(d) ?? 0),
      });
    }
    return rows;
  }, [meals, acts, bodyLogs, profile, from, today]);

  const recorded = data.filter((d) => d.摂取 > 0);
  const avgIn = recorded.length ? Math.round(recorded.reduce((s, d) => s + d.摂取, 0) / recorded.length) : null;
  const avgOut = recorded.length ? Math.round(recorded.reduce((s, d) => s + d.消費, 0) / recorded.length) : null;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-slate-700">摂取 vs 消費</h2>
        <PeriodChips periods={CAL_PERIODS} value={period} onChange={setPeriod} />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 5, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" tickFormatter={fmtMD} tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <Tooltip labelFormatter={(d) => fmtJP(String(d))} />
          <Bar dataKey="摂取" unit=" kcal" fill="#34d399" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="消費" unit=" kcal" stroke="#0f172a" strokeWidth={2} dot={false} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-3 flex gap-2">
        <StatChip label="平均摂取" value={avgIn != null ? `${fmtKcal(avgIn)}` : '--'} />
        <StatChip label="平均消費" value={avgOut != null ? `${fmtKcal(avgOut)}` : '--'} />
        <StatChip
          label="平均収支"
          value={avgIn != null && avgOut != null ? `${avgIn - avgOut > 0 ? '+' : ''}${fmtKcal(avgIn - avgOut)}` : '--'}
        />
      </div>
      {!profile && (
        <p className="mt-2 text-[10px] font-semibold text-amber-500">
          プロフィール未設定のため、消費カロリーは運動消費のみで表示しています
        </p>
      )}
      <p className="mt-1 text-[10px] font-semibold text-slate-400">
        平均は食事記録のある日のみで計算
      </p>
    </Card>
  );
}
