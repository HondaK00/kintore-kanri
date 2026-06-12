// リマインダー設定をlocalStorageで保持（時刻はネイティブ通知のスケジュールに使う）
const KEY = 'kintore:reminder';

export interface ReminderConfig {
  enabled: boolean;
  hour: number;
  minute: number;
}

const DEFAULT: ReminderConfig = { enabled: false, hour: 19, minute: 0 };

export function getReminder(): ReminderConfig {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return DEFAULT;
    const p = JSON.parse(v);
    return {
      enabled: !!p.enabled,
      hour: Number.isInteger(p.hour) ? p.hour : DEFAULT.hour,
      minute: Number.isInteger(p.minute) ? p.minute : DEFAULT.minute,
    };
  } catch {
    return DEFAULT;
  }
}

export function setReminder(c: ReminderConfig): void {
  localStorage.setItem(KEY, JSON.stringify(c));
}

export function fmtTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
