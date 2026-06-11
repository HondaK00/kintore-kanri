import type { Profile } from '../db/db';

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'ほぼ運動しない', desc: 'デスクワーク中心・運動習慣なし' },
  { value: 1.375, label: '軽い活動', desc: '週1〜2回のトレーニング' },
  { value: 1.55, label: '中程度の活動', desc: '週3〜5回のトレーニング' },
  { value: 1.725, label: '活発', desc: '週6〜7回のトレーニング' },
  { value: 1.9, label: '非常に活発', desc: '肉体労働＋毎日ハードな運動' },
];

/** 異常な入力(極端な年齢等)でBMRが負/ゼロ近傍にならないための下限値 */
export const MIN_BMR = 500;

/** Mifflin-St Jeor式で基礎代謝(kcal/日)を計算 */
export function calcBMR(p: Pick<Profile, 'sex' | 'heightCm' | 'age'>, weightKg: number): number {
  const base = 10 * weightKg + 6.25 * p.heightCm - 5 * p.age;
  return Math.max(MIN_BMR, Math.round(p.sex === 'male' ? base + 5 : base - 161));
}

export interface DailyBurn {
  bmr: number;
  metabolism: number; // 基礎代謝 × 活動レベル
  watch: number; // スマートウォッチ等の実測運動消費
  total: number;
}

/** 1日の総消費 = 基礎代謝 × 活動レベル + 実測運動消費 */
export function calcDailyBurn(profile: Profile, weightKg: number, watchKcal: number): DailyBurn {
  const bmr = calcBMR(profile, weightKg);
  const metabolism = Math.round(bmr * profile.activityLevel);
  return { bmr, metabolism, watch: watchKcal, total: metabolism + watchKcal };
}

/** Epley式による推定1RM */
export function est1RM(weightKg: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** 重量表示: 62.5 -> "62.5", 60 -> "60" */
export function fmtWeight(w: number): string {
  return String(round1(w));
}

export function fmtKcal(n: number): string {
  return Math.round(n).toLocaleString('ja-JP');
}
