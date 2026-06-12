import { isNative } from './bridge';
import { addDays, parseDate } from '../lib/date';

// HealthKit(iOS) / Health Connect(Android) からアクティブカロリー(運動消費)を取得する。
// Webでは常に利用不可。

export async function isHealthAvailable(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { Health } = await import('capacitor-health');
    return (await Health.isHealthAvailable()).available;
  } catch {
    return false;
  }
}

export async function requestHealthPermission(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { Health } = await import('capacitor-health');
    const res = await Health.requestHealthPermissions({ permissions: ['READ_ACTIVE_CALORIES'] });
    // iOSは常に許可扱いで返る。Androidは実際の許可状況が返る
    return (res.permissions ?? []).some((p) => Object.values(p).some(Boolean));
  } catch {
    return false;
  }
}

/** 指定日(YYYY-MM-DD)の運動消費(アクティブカロリー, kcal)。取得不可ならnull */
export async function getActiveCaloriesForDate(date: string): Promise<number | null> {
  if (!isNative()) return null;
  try {
    const { Health } = await import('capacitor-health');
    const start = parseDate(date); // ローカル0時
    const end = parseDate(addDays(date, 1));
    const res = await Health.queryAggregated({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      dataType: 'active-calories',
      bucket: 'day',
    });
    const total = (res.aggregatedData ?? []).reduce((s, d) => s + (d.value || 0), 0);
    return Math.round(total);
  } catch {
    return null;
  }
}
