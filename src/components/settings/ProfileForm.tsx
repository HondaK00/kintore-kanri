import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check } from 'lucide-react';
import { db, type Sex } from '../../db/db';
import { ACTIVITY_LEVELS, calcBMR, fmtKcal } from '../../lib/calc';
import { todayStr } from '../../lib/date';
import { upsertBodyLog } from '../../lib/repo';
import { Card, PrimaryButton } from '../ui';
import { NumberText, PFCInputs } from '../inputs';
import { Segmented } from '../Segmented';

export function ProfileForm() {
  // undefined = 読込中, null = 未作成
  const profile = useLiveQuery(() => db.profile.get(1).then((p) => p ?? null));

  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [sex, setSex] = useState<Sex>('male');
  const [activityLevel, setActivityLevel] = useState(1.55);
  const [targetWeightKg, setTargetWeightKg] = useState<number | null>(null);
  const [targetKcal, setTargetKcal] = useState<number | null>(null);
  const [targetProtein, setTargetProtein] = useState<number | null>(null);
  const [targetFat, setTargetFat] = useState<number | null>(null);
  const [targetCarbs, setTargetCarbs] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile === undefined || loaded) return;
    if (profile) {
      setHeightCm(profile.heightCm);
      setWeightKg(profile.weightKg);
      setAge(profile.age);
      setSex(profile.sex);
      setActivityLevel(profile.activityLevel);
      setTargetWeightKg(profile.targetWeightKg);
      setTargetKcal(profile.targetKcal);
      setTargetProtein(profile.targetProtein);
      setTargetFat(profile.targetFat);
      setTargetCarbs(profile.targetCarbs);
    }
    setLoaded(true);
  }, [profile, loaded]);

  const inRange = (v: number | null, min: number, max: number) => v != null && v >= min && v <= max;
  const canSave = inRange(heightCm, 100, 250) && inRange(weightKg, 25, 300) && inRange(age, 10, 120);
  const bmr = canSave ? calcBMR({ sex, heightCm: heightCm!, age: age! }, weightKg!) : null;

  const save = async () => {
    if (!canSave) return;
    await db.profile.put({
      id: 1,
      heightCm: heightCm!,
      weightKg: weightKg!,
      age: age!,
      sex,
      activityLevel,
      targetWeightKg,
      targetKcal,
      targetProtein,
      targetFat,
      targetCarbs,
    });
    await upsertBodyLog(todayStr(), { weightKg: weightKg! });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-sm font-extrabold text-slate-700">基本情報</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-slate-500">身長 (cm)</span>
            <NumberText nullable value={heightCm} onCommit={setHeightCm} placeholder="170" className="mt-1 w-full" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">体重 (kg)</span>
            <NumberText nullable value={weightKg} onCommit={setWeightKg} placeholder="65" className="mt-1 w-full" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">年齢</span>
            <NumberText nullable value={age} onCommit={setAge} placeholder="30" className="mt-1 w-full" />
          </label>
          <div className="block">
            <span className="text-xs font-bold text-slate-500">性別</span>
            <div className="mt-1">
              <Segmented
                options={[
                  { value: 'male', label: '男性' },
                  { value: 'female', label: '女性' },
                ]}
                value={sex}
                onChange={setSex}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-extrabold text-slate-700">活動レベル</h2>
        <div className="mt-3 space-y-2">
          {ACTIVITY_LEVELS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setActivityLevel(l.value)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left transition ${
                activityLevel === l.value
                  ? 'border-emerald-500 bg-emerald-50/60'
                  : 'border-slate-100 bg-white'
              }`}
            >
              <span className="flex-1">
                <span className="block text-sm font-bold">{l.label}</span>
                <span className="text-xs text-slate-400">{l.desc}</span>
              </span>
              <span className="text-xs font-extrabold text-slate-400 tabular-nums">×{l.value}</span>
            </button>
          ))}
        </div>
        {bmr != null && (
          <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold">
            基礎代謝 <span className="tabular-nums">{fmtKcal(bmr)}</span> kcal ／ 1日の推定消費{' '}
            <span className="text-emerald-600 tabular-nums">
              {fmtKcal(Math.round(bmr * activityLevel))}
            </span>{' '}
            kcal
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-extrabold text-slate-700">目標設定</h2>
        <p className="mt-1 text-xs text-slate-400">未入力の項目はホームに表示されません</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-slate-500">目標体重 (kg)</span>
            <NumberText nullable value={targetWeightKg} onCommit={setTargetWeightKg} placeholder="--" className="mt-1 w-full" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">目標摂取 (kcal/日)</span>
            <NumberText nullable value={targetKcal} onCommit={setTargetKcal} placeholder="--" className="mt-1 w-full" />
          </label>
        </div>
        <div className="mt-3">
          <PFCInputs
            protein={targetProtein}
            fat={targetFat}
            carbs={targetCarbs}
            onProtein={setTargetProtein}
            onFat={setTargetFat}
            onCarbs={setTargetCarbs}
            suffix="目標"
            placeholder="--"
          />
        </div>
      </Card>

      <PrimaryButton onClick={() => void save()} disabled={!canSave} className="w-full">
        {saved ? (
          <span className="flex items-center justify-center gap-1.5">
            <Check size={16} />
            保存しました
          </span>
        ) : (
          '保存する'
        )}
      </PrimaryButton>
      {!canSave && (
        <p className="text-center text-xs font-semibold text-slate-400">
          身長(100〜250cm)・体重(25〜300kg)・年齢(10〜120歳)を入力すると保存できます
        </p>
      )}
    </div>
  );
}
