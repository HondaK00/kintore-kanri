import { db, newSetId } from '../db/db';

export async function upsertBodyLog(
  date: string,
  patch: { weightKg?: number; bodyFatPct?: number | null },
): Promise<void> {
  // 存在確認→書込を1トランザクションにまとめ、連続入力時の競合を防ぐ
  await db.transaction('rw', db.bodyLogs, async () => {
    const existing = await db.bodyLogs.where('date').equals(date).first();
    if (existing) {
      await db.bodyLogs.update(existing.id!, patch);
    } else if (patch.weightKg != null) {
      await db.bodyLogs.add({ date, weightKg: patch.weightKg, bodyFatPct: patch.bodyFatPct ?? null });
    }
  });
}

export async function upsertActivityLog(date: string, kcal: number): Promise<void> {
  await db.transaction('rw', db.activityLogs, async () => {
    const existing = await db.activityLogs.where('date').equals(date).first();
    if (existing) {
      await db.activityLogs.update(existing.id!, { kcal });
    } else {
      await db.activityLogs.add({ date, kcal });
    }
  });
}

/** ルーティンを削除し、トレーニング記録側のroutineId参照もクリアする（記録自体は残す） */
export async function deleteRoutine(routineId: number): Promise<void> {
  await db.transaction('rw', db.routines, db.workouts, async () => {
    await db.routines.delete(routineId);
    await db.workouts
      .filter((e) => e.routineId === routineId)
      .modify((e) => {
        e.routineId = null;
      });
  });
}

/** 種目を削除し、ルーティンの参照とトレーニング記録の孤児レコードも取り除く */
export async function deleteExercise(exerciseId: number): Promise<void> {
  await db.transaction('rw', db.exercises, db.routines, db.workouts, async () => {
    await db.exercises.delete(exerciseId);
    await db.workouts.where('exerciseId').equals(exerciseId).delete();
    const routines = await db.routines.toArray();
    for (const r of routines) {
      if (r.exerciseIds.includes(exerciseId)) {
        await db.routines.update(r.id!, {
          exerciseIds: r.exerciseIds.filter((id) => id !== exerciseId),
        });
      }
    }
  });
}

const TABLE_NAMES = [
  'profile',
  'exercises',
  'routines',
  'workouts',
  'foods',
  'mealLogs',
  'bodyLogs',
  'activityLogs',
] as const;

export async function exportData(): Promise<string> {
  const data: Record<string, unknown> = { version: 1, exportedAt: new Date().toISOString() };
  for (const name of TABLE_NAMES) {
    data[name] = await db.table(name).toArray();
  }
  return JSON.stringify(data, null, 2);
}

/** インポート上限。これを超えるファイルはメモリ枯渇を避けるため拒否する */
export const IMPORT_MAX_BYTES = 20 * 1024 * 1024; // 20MB

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === 'string';

/** プロトタイプ汚染につながるキーを除去しつつ素のオブジェクトに作り直す */
function stripProto<T>(row: T): T {
  if (Array.isArray(row)) return row.map(stripProto) as unknown as T;
  if (!isObj(row)) return row;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    out[k] = stripProto(v);
  }
  return out as T;
}

/** テーブルごとの最小スキーマ検証。不正な行は黙って捨てる */
const VALIDATORS: Record<string, (r: Record<string, unknown>) => boolean> = {
  profile: (r) => isNum(r.id) && isNum(r.heightCm) && isNum(r.weightKg) && isNum(r.age),
  exercises: (r) => isStr(r.name) && isStr(r.bodyPart),
  routines: (r) => isStr(r.name) && Array.isArray(r.exerciseIds),
  workouts: (r) => isStr(r.date) && isNum(r.exerciseId) && Array.isArray(r.sets),
  foods: (r) => isStr(r.name) && isNum(r.kcal),
  mealLogs: (r) => isStr(r.date) && isStr(r.name) && isNum(r.kcal),
  bodyLogs: (r) => isStr(r.date) && isNum(r.weightKg),
  activityLogs: (r) => isStr(r.date) && isNum(r.kcal),
};

/** workoutレコードのsetsを正規化（数値化＋idの補完）。旧バックアップ互換 */
function normalizeWorkout(r: Record<string, unknown>): Record<string, unknown> {
  const sets = (r.sets as unknown[])
    .filter(isObj)
    .map((s) => ({
      id: isStr(s.id) ? s.id : newSetId(),
      weightKg: isNum(s.weightKg) ? s.weightKg : 0,
      reps: isNum(s.reps) ? s.reps : 0,
    }));
  return { ...r, sets };
}

export async function importData(json: string): Promise<void> {
  if (json.length > IMPORT_MAX_BYTES) {
    throw new Error('ファイルサイズが大きすぎます（上限20MB）');
  }
  const parsed: unknown = JSON.parse(json);
  if (!isObj(parsed)) throw new Error('バックアップファイルの形式が正しくありません');
  const data = stripProto(parsed);
  if (!TABLE_NAMES.some((n) => Array.isArray(data[n]))) {
    throw new Error('バックアップファイルの形式が正しくありません');
  }

  const cleaned: Record<string, Record<string, unknown>[]> = {};
  for (const name of TABLE_NAMES) {
    const rows = data[name];
    if (!Array.isArray(rows)) {
      cleaned[name] = [];
      continue;
    }
    const valid = VALIDATORS[name];
    cleaned[name] = rows
      .filter(isObj)
      .filter((r) => valid(r))
      .map((r) => (name === 'workouts' ? normalizeWorkout(r) : r));
  }

  // 参照整合性: ルーティンが参照する種目IDのうち、実在しないものを除去する
  const exerciseIds = new Set(cleaned.exercises.map((e) => e.id).filter(isNum));
  cleaned.routines = cleaned.routines.map((r) => ({
    ...r,
    exerciseIds: (r.exerciseIds as unknown[]).filter((id) => isNum(id) && exerciseIds.has(id)),
  }));

  const tables = TABLE_NAMES.map((n) => db.table(n));
  await db.transaction('rw', tables, async () => {
    for (const name of TABLE_NAMES) {
      await db.table(name).clear();
      if (cleaned[name].length > 0) await db.table(name).bulkPut(cleaned[name]);
    }
  });
}

export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
