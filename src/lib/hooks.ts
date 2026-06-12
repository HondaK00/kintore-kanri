import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Exercise, type Routine } from '../db/db';

export function useProfile() {
  return useLiveQuery(() => db.profile.get(1));
}

export function useRoutines(): Routine[] | undefined {
  return useLiveQuery(() => db.routines.orderBy('sortOrder').toArray());
}

/** 曜日(0=日〜6=土) → routineId のマップ */
export function useWeeklyPlan(): Map<number, number | null> {
  const rows = useLiveQuery(() => db.weeklyPlan.toArray(), []);
  return useMemo(() => new Map((rows ?? []).map((w) => [w.weekday, w.routineId])), [rows]);
}

export function useExercises() {
  return useLiveQuery(() => db.exercises.toArray());
}

export function useExerciseMap(): Map<number, Exercise> {
  const list = useExercises();
  return useMemo(() => new Map((list ?? []).map((e) => [e.id!, e])), [list]);
}

/** 最新の体重記録（なければprofileのフォールバック値を使う側で処理） */
export function useLatestBodyLog() {
  return useLiveQuery(() => db.bodyLogs.orderBy('date').last());
}

/** 指定種目の、指定日より前の直近の記録（セットが入っているもの） */
export function usePrevEntry(exerciseId: number, beforeDate: string) {
  return useLiveQuery(
    () =>
      db.workouts
        .where('[exerciseId+date]')
        .between([exerciseId, ''], [exerciseId, beforeDate], true, false)
        .filter((e) => e.sets.length > 0)
        .last(),
    [exerciseId, beforeDate],
  );
}
