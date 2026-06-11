// バックアップの実施状況をlocalStorageで追跡し、古くなったら催促する。
// データ自体(IndexedDB)とは別管理の軽量メタ情報。

const KEY = 'kintore:lastBackupAt';
const REMIND_AFTER_DAYS = 14;

export function getLastBackupAt(): Date | null {
  const v = localStorage.getItem(KEY);
  if (!v) return null;
  const t = Number(v);
  return Number.isFinite(t) ? new Date(t) : null;
}

export function markBackedUp(now: number): void {
  localStorage.setItem(KEY, String(now));
}

/** 最終バックアップからの経過日数。未バックアップはnull */
export function daysSinceBackup(now: number): number | null {
  const last = getLastBackupAt();
  if (!last) return null;
  return Math.floor((now - last.getTime()) / (1000 * 60 * 60 * 24));
}

/** 催促を出すべきか（未バックアップ or 14日以上経過） */
export function shouldRemindBackup(now: number): boolean {
  const d = daysSinceBackup(now);
  return d === null || d >= REMIND_AFTER_DAYS;
}
