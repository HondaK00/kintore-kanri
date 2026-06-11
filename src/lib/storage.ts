// ブラウザによるIndexedDB自動削除(eviction)を防ぐための永続ストレージ要求。
// ローカル保存型アプリのデータ消失リスクを大きく下げる。

/** 永続ストレージを要求する。付与されればブラウザはデータを自動削除しない */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/** 現在永続化されているか */
export async function isStoragePersisted(): Promise<boolean> {
  try {
    return (await navigator.storage?.persisted?.()) ?? false;
  } catch {
    return false;
  }
}

/** 使用容量の概算(MB)。取得できなければnull */
export async function estimateUsageMB(): Promise<number | null> {
  try {
    const est = await navigator.storage?.estimate?.();
    if (!est?.usage) return null;
    return Math.round((est.usage / (1024 * 1024)) * 10) / 10;
  } catch {
    return null;
  }
}
