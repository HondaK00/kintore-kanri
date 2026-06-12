import Dexie, { type Table } from 'dexie';
import { PRESET_EXERCISES, PRESET_ROUTINES } from './presets';
import type { MuscleTarget } from './muscles';

export type Sex = 'male' | 'female';
export type BodyPart = '胸' | '背中' | '脚' | '肩' | '腕' | '体幹' | 'その他';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Profile {
  id: number; // 常に1
  heightCm: number;
  weightKg: number; // 最新体重のフォールバック
  age: number;
  sex: Sex;
  activityLevel: number; // 活動レベル係数 1.2〜1.9
  targetWeightKg: number | null;
  targetKcal: number | null;
  targetProtein: number | null;
  targetFat: number | null;
  targetCarbs: number | null;
}

export interface Exercise {
  id?: number;
  name: string;
  bodyPart: BodyPart;
  isPreset: boolean;
  targetMuscles?: MuscleTarget | null; // カスタム種目の対象筋（プリセットは名前から解決）
}

export interface WeeklyPlanEntry {
  weekday: number; // 0=日 〜 6=土（主キー）
  routineId: number | null; // その曜日に行うルーティン。null=休み
}

export interface Routine {
  id?: number;
  name: string;
  exerciseIds: number[];
  sortOrder: number;
}

export interface WorkoutSet {
  id: string; // セット行の安定キー（React再調整・並び替え用）
  weightKg: number;
  reps: number;
}

/** WorkoutSet用のローカル一意ID。crypto非対応環境にもフォールバック */
export function newSetId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface WorkoutEntry {
  id?: number;
  date: string; // YYYY-MM-DD
  exerciseId: number;
  routineId: number | null;
  sets: WorkoutSet[];
}

export interface Food {
  id?: number;
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  useCount: number;
}

export interface MealLog {
  id?: number;
  date: string;
  mealType: MealType;
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface BodyLog {
  id?: number;
  date: string; // ユニーク
  weightKg: number;
  bodyFatPct: number | null;
}

export interface ActivityLog {
  id?: number;
  date: string; // ユニーク
  kcal: number; // スマートウォッチ等で計測した運動消費
}

class KintoreDB extends Dexie {
  profile!: Table<Profile, number>;
  exercises!: Table<Exercise, number>;
  routines!: Table<Routine, number>;
  workouts!: Table<WorkoutEntry, number>;
  foods!: Table<Food, number>;
  mealLogs!: Table<MealLog, number>;
  bodyLogs!: Table<BodyLog, number>;
  activityLogs!: Table<ActivityLog, number>;
  weeklyPlan!: Table<WeeklyPlanEntry, number>;

  constructor() {
    super('kintore-db');
    // スキーマ変更時は version(1) を書き換えず、必ず新しい version(n) を追加すること:
    //   this.version(2).stores({...変更後...}).upgrade((tx) => { /* 既存レコードの変換 */ });
    // 既存ユーザーのIndexedDBはDexieが順次マイグレーションする。エクスポートJSONの
    // 互換は lib/repo.ts の importData 側（VALIDATORS/normalize）で吸収する。
    this.version(1).stores({
      profile: 'id',
      exercises: '++id, bodyPart',
      routines: '++id, sortOrder',
      workouts: '++id, date, exerciseId, [exerciseId+date]',
      foods: '++id, name, useCount',
      mealLogs: '++id, date',
      bodyLogs: '++id, &date',
      activityLogs: '++id, &date',
    });

    // v2: 曜日ごとのルーティン割り当て（週間スケジュール）テーブルを追加
    this.version(2).stores({
      weeklyPlan: 'weekday',
    });

    this.on('populate', async () => {
      const ids = await this.exercises.bulkAdd(
        PRESET_EXERCISES.map((e) => ({ ...e, isPreset: true })),
        { allKeys: true },
      );
      const idByName = new Map(PRESET_EXERCISES.map((e, i) => [e.name, ids[i]]));
      await this.routines.bulkAdd(
        PRESET_ROUTINES.map((r, i) => ({
          name: r.name,
          exerciseIds: r.exerciseNames.map((n) => idByName.get(n)!),
          sortOrder: i,
        })),
      );
    });
  }
}

export const db = new KintoreDB();

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: '朝食' },
  { value: 'lunch', label: '昼食' },
  { value: 'dinner', label: '夕食' },
  { value: 'snack', label: '間食' },
];
